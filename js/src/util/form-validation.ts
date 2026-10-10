import { announce } from './announce.js'
import { getUID } from './index.js'

export type ValidationMark = {
  ariaInvalid: boolean
  classes: string[]
  describedBy: string[]
}

export type ValidationMarks = WeakMap<Element, ValidationMark>

export type ValidationState = 'invalid' | 'valid' | (string & {})

export type UserValidity = {
  read: () => ValidationState | undefined
  stop: () => void
}

export type ValueField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export type ValueFieldOptions = {
  disabled?: boolean
  name?: string | null
  readOnly?: boolean
  required?: boolean
}

type FormControl = HTMLElement & {
  form: HTMLFormElement | null
  name: string
  setCustomValidity: (message: string) => void
  type: string
  validationMessage: string
  validity: ValidityState
  willValidate: boolean
}

const ATTRIBUTE_INVALID_FEEDBACK = 'data-coreui-invalid-feedback'
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const SELECTOR_ARIA_HIDDEN = '[aria-hidden="true"]'
const SELECTOR_AUTOCOMPLETE = '.autocomplete'
const SELECTOR_CHIP_INPUT = '.chip-input'
const SELECTOR_CHOICE = '[type="checkbox"], [type="radio"]'
const SELECTOR_COMBOBOX_SELECT = '.combobox-select'
const SELECTOR_COMBOBOX_TOGGLE = '.combobox-toggle'
const SELECTOR_CONTROL = 'input, select, textarea'
const SELECTOR_DATE_TIME = '.form-date-time'
const SELECTOR_FIELD = '.form-field'
const SELECTOR_FIELD_CONTROL = '.check, .radio, .switch'
const SELECTOR_FLOATING = '.form-floating'
const SELECTOR_FORM_VALIDATE_VALID = '[data-coreui-validate~="valid"]'
const SELECTOR_FRAME = '.form-control-group'
const SELECTOR_HIDDEN = `[hidden], ${SELECTOR_ARIA_HIDDEN}`
const SELECTOR_INPUT_GROUP = '.input-group'
const SELECTOR_INPUT_GROUP_CONTROL = '.form-control, .form-select'
const SELECTOR_INVALID_FEEDBACK = '.invalid-feedback, .invalid-tooltip'
const SELECTOR_OTP = '.form-otp'
const SELECTOR_POPUP = '.popup'
const SELECTOR_RANGE = '.form-range'
const SELECTOR_RANGE_INPUT = '.form-range-input'
const SELECTOR_RATING = '.rating'
const SELECTOR_USER_INVALID = '[data-coreui-validate] :user-invalid'
const SELECTOR_USER_VALID = '[data-coreui-validate~="valid"] :user-valid'
const STATE_CLASSES = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID]
const STATE_INVALID_MESSAGE = 'Invalid value.'

const ownedControls = new WeakSet<Element>()
let stateSerial = 0
const stateMessages = new WeakMap<Element, string>()

/**
 * Creates the record of what the marking functions added to one control.
 *
 * @returns A record with nothing added yet
 */
const createMark = (): ValidationMark => ({ ariaInvalid: false, classes: [], describedBy: [] })

/**
 * Tells whether an element is a form control the browser validates: an input, select, textarea or
 * form-associated custom element that takes part in constraint validation, buttons excluded.
 *
 * @param control - The element to check
 * @returns `true` when the element has `willValidate` and is not a button
 */
const isValidatable = (control: Element | null): control is FormControl =>
  (control as FormControl | null)?.willValidate === true && !['button', 'image', 'reset', 'submit'].includes((control as FormControl).type)

/**
 * Splits an id reference list, such as the value of `aria-describedby`, into its ids.
 *
 * @param value - The attribute value
 * @returns The ids, without empty entries
 */
const splitIds = (value: string | null | undefined): string[] => (value ?? '').split(/\s+/).filter(Boolean)

/**
 * Writes the ids of `aria-describedby`, removing the attribute when no id is left and leaving it
 * untouched when nothing changes.
 *
 * @param control - The control to describe
 * @param ids - The ids the attribute should hold, in order
 */
const setDescribedBy = (control: Element, ids: string[]): void => {
  if (ids.join(' ') === (control.getAttribute('aria-describedby') ?? '')) {
    return
  }

  if (ids.length > 0) {
    control.setAttribute('aria-describedby', ids.join(' '))
  } else {
    control.removeAttribute('aria-describedby')
  }
}

/**
 * Tells whether an element is, or holds, a form control other than the given one or the radios and
 * checkboxes that share its name, that is where the next field starts.
 *
 * @param element - The element to check
 * @param control - The control whose feedback is searched
 * @returns `true` when the element belongs to another field
 */
const startsAnotherField = (element: Element, control: FormControl): boolean =>
  [element, ...element.querySelectorAll(SELECTOR_CONTROL)].some(other =>
    isValidatable(other) && other !== control && !(control.name && other.name === control.name && other.matches(SELECTOR_CHOICE)))

/**
 * Tells whether an element is an invalid feedback the page has not hidden with `hidden` or
 * `aria-hidden="true"`.
 *
 * @param element - The element to check
 * @returns `true` when the element is a feedback a screen reader may read
 */
const isShownFeedback = (element: Element): boolean =>
  element.matches(SELECTOR_INVALID_FEEDBACK) && !element.matches(SELECTOR_HIDDEN)

/**
 * Collects the invalid feedback elements among the siblings that follow an element, up to the
 * sibling where the next field starts, leaving out the ones the page hid. A `.popup` a component
 * laid after its anchor is passed over, since its controls belong to that component.
 *
 * @param element - The element whose following siblings are searched
 * @param control - The control whose feedback is searched
 * @returns The `.invalid-feedback` and `.invalid-tooltip` siblings after it
 */
const getFollowingFeedback = (element: Element, control: FormControl): Element[] => {
  const feedback: Element[] = []

  for (let sibling = element.nextElementSibling; sibling && (sibling.matches(SELECTOR_POPUP) || !startsAnotherField(sibling, control)); sibling = sibling.nextElementSibling) {
    if (isShownFeedback(sibling)) {
      feedback.push(sibling)
    }
  }

  return feedback
}

/**
 * Finds the element that stands for a control in the layout: the `.form-date-time` field for the
 * value field laid over it, the `.form-otp` group for its value field and its slots, the
 * `.chip-input` for its value field and its text field, the `.autocomplete` for the text field it
 * builds, the `.rating` for its radios, and the `.combobox-toggle` for the `.combobox-select` right
 * after it, which the messages follow, otherwise the control itself.
 *
 * @param control - The control
 * @returns The element the layout places the control's messages around
 */
const getLayoutElement = (control: FormControl): Element => {
  const previous = control.previousElementSibling

  return control.closest(`${SELECTOR_AUTOCOMPLETE}, ${SELECTOR_CHIP_INPUT}, ${SELECTOR_DATE_TIME}, ${SELECTOR_OTP}, ${SELECTOR_RATING}`) ??
    (control.matches(SELECTOR_COMBOBOX_SELECT) && previous?.matches(SELECTOR_COMBOBOX_TOGGLE) ? previous : control)
}

/**
 * Finds the `.form-control-group` a control sits in directly, or through a `.form-floating`, which
 * is how deep the frame answers for the state of what it holds.
 *
 * @param control - The control
 * @returns The frame, or `null` when the control is not in one at that depth
 */
const getFrame = (control: Element): Element | null => {
  const parent = control.parentElement
  const holder = parent?.matches(SELECTOR_FLOATING) ? parent.parentElement : parent

  return holder?.matches(SELECTOR_FRAME) ? holder : null
}

/**
 * Collects the elements around an element, up to its form, that carry `.is-invalid`, whose
 * following messages the stylesheet shows.
 *
 * @param element - The element
 * @returns The marked elements, innermost first
 */
const getMarkedAncestors = (element: Element): Element[] => {
  const ancestors: Element[] = []

  for (let ancestor = element.parentElement; ancestor && ancestor.tagName !== 'FORM'; ancestor = ancestor.parentElement) {
    if (ancestor.classList.contains(CLASS_NAME_IS_INVALID)) {
      ancestors.push(ancestor)
    }
  }

  return ancestors
}

/**
 * Tells whether the stylesheet shows the messages of a `.form-field` for a control: one around a
 * check, a radio or a switch, or around the frame of the control or the frame the control is, or
 * around the input group of a `.form-control` or `.form-select`.
 *
 * @param control - The control
 * @param field - A `.form-field` around the control
 * @returns `true` when the field shows its messages for the control
 */
const reachesField = (control: Element, field: Element): boolean => {
  const inputGroup = control.matches(SELECTOR_INPUT_GROUP_CONTROL) ? control.closest(SELECTOR_INPUT_GROUP) : null
  const frame = control.matches(SELECTOR_FRAME) ? control : getFrame(control)

  return control.matches(SELECTOR_FIELD_CONTROL) ||
    [frame, inputGroup].some(group => group && group !== field && field.contains(group))
}

/**
 * Collects the invalid feedback the stylesheet shows for one control: the `.invalid-feedback` and
 * `.invalid-tooltip` after it, after its frame, after the `.form-range` of a `.form-range-input` or
 * after an element around it marked `.is-invalid`, up to where the next field starts, and in each
 * `.form-field` around it that shows its messages for the control, those that sit in a field around
 * the control. A field grouping several also shows the messages of the fields inside it; those
 * belong to other controls and are left out, and so are the messages the page hid.
 *
 * @param control - The control
 * @returns The feedback elements, in document order per rule
 */
const getStructuralFeedback = (control: FormControl): Element[] => {
  const element = getLayoutElement(control)
  const anchor = getFrame(element) ?? (element.matches(SELECTOR_RANGE_INPUT) ? element.closest(SELECTOR_RANGE) : null)
  const fieldFeedback: Element[] = []

  for (let field = element.closest(SELECTOR_FIELD); field; field = field.parentElement?.closest(SELECTOR_FIELD) ?? null) {
    if (reachesField(element, field)) {
      fieldFeedback.push(...[...field.querySelectorAll(SELECTOR_INVALID_FEEDBACK)].filter(feedback => isShownFeedback(feedback) && feedback.closest(SELECTOR_FIELD)?.contains(element)))
    }
  }

  return [
    ...getFollowingFeedback(element, control),
    ...(anchor ? getFollowingFeedback(anchor, control) : []),
    ...getMarkedAncestors(element).flatMap(ancestor => getFollowingFeedback(ancestor, control)),
    ...fieldFeedback
  ]
}

/**
 * Finds the invalid feedback of a control: the elements named in `data-coreui-invalid-feedback`,
 * or else the ones the stylesheet shows when the control is invalid, for a radio or checkbox those
 * of every choice that shares its name. The value field of a `.form-date-time` takes both from the
 * field, a control of a `.form-otp`, a `.chip-input` or a `.rating` from the group, and the value
 * field of a combobox from its toggle. A found element without an id gets one.
 *
 * @param control - The control
 * @returns The ids of its invalid feedback, without duplicates
 */
export const getFeedbackIds = (control: FormControl): string[] => {
  const named = splitIds(getLayoutElement(control).getAttribute(ATTRIBUTE_INVALID_FEEDBACK))

  if (named.length > 0) {
    return [...new Set(named)]
  }

  const form = control.closest('form')
  const members = control.name && control.matches(SELECTOR_CHOICE) && form ?
    [...form.elements].filter(other => isValidatable(other) && other.name === control.name && other.matches(SELECTOR_CHOICE)) as FormControl[] :
    [control]
  const feedback = new Set(members.flatMap(member => getStructuralFeedback(member)))

  return [...feedback].map(element => {
    element.id ||= getUID('invalid-feedback-')
    return element.id
  })
}

/**
 * Marks a control invalid for assistive technologies: sets `aria-invalid` unless the page has, and
 * adds the ids of its invalid feedback to `aria-describedby`. Ids it added earlier that are no
 * longer feedback of the control are taken out, and ids a re-render dropped are put back.
 *
 * @param control - The invalid control
 * @param marks - What the marking functions added, per control
 */
const markControl = (control: FormControl, marks: ValidationMarks): void => {
  const mark = marks.get(control) ?? createMark()

  if (control.getAttribute('aria-invalid') !== 'true') {
    control.setAttribute('aria-invalid', 'true')
    mark.ariaInvalid = true
  }

  const feedbackIds = getFeedbackIds(control)
  const describedBy = splitIds(control.getAttribute('aria-describedby'))
    .filter(id => feedbackIds.includes(id) || !mark.describedBy.includes(id))
  const addedIds = feedbackIds.filter(id => !describedBy.includes(id))

  mark.describedBy = [...mark.describedBy.filter(id => feedbackIds.includes(id) && describedBy.includes(id)), ...addedIds]
  setDescribedBy(control, [...describedBy, ...addedIds])
  marks.set(control, mark)
}

/**
 * Removes the `aria-invalid` and the `aria-describedby` ids the marking added to a control, and
 * nothing the page set itself.
 *
 * @param control - The control
 * @param marks - What the marking functions added, per control
 */
const unmarkControl = (control: Element, marks: ValidationMarks): void => {
  const mark = marks.get(control)

  if (!mark) {
    return
  }

  if (mark.ariaInvalid) {
    control.removeAttribute('aria-invalid')
  }

  setDescribedBy(control, splitIds(control.getAttribute('aria-describedby')).filter(id => !mark.describedBy.includes(id)))
  mark.ariaInvalid = false
  mark.describedBy = []
}

/**
 * Puts state classes on a control and records the ones it adds. A state class the page or a
 * component set stays, and while one is there the classes the marking added come off, so the page
 * decides what the control shows.
 *
 * @param control - The control
 * @param mark - What the marking functions added to the control
 * @param classes - The state classes the control should carry
 */
const setStateClasses = (control: Element, mark: ValidationMark, classes: string[]): void => {
  const pageSet = STATE_CLASSES.some(name => control.classList.contains(name) && !mark.classes.includes(name))
  const owned = pageSet ? [] : classes

  for (const name of mark.classes.filter(name => !owned.includes(name))) {
    control.classList.remove(name)
  }

  control.classList.add(...owned)
  mark.classes = owned
}

/**
 * Updates one control of a validated form: puts `.is-invalid` on it, or `.is-valid` when the form
 * has `data-coreui-validate="valid"`, unless the page set a state class itself, then marks or
 * unmarks it. A control the functions styled that stopped taking part in validation, for example by
 * being disabled, or that a component took over, loses what they added.
 *
 * @param control - The control
 * @param form - The form it belongs to
 * @param marks - What the marking functions added, per control
 */
const updateControlValidationState = (control: Element, form: HTMLFormElement, marks: ValidationMarks): void => {
  if (!isValidatable(control) || ownedControls.has(control)) {
    const mark = marks.get(control)

    if (mark) {
      setStateClasses(control, mark, [])
      unmarkControl(control, marks)
      marks.delete(control)
    }

    return
  }

  const mark = marks.get(control) ?? createMark()
  const isValid = control.validity.valid

  marks.set(control, mark)
  setStateClasses(control, mark, isValid ? (form.matches(SELECTOR_FORM_VALIDATE_VALID) ? [CLASS_NAME_IS_VALID] : []) : [CLASS_NAME_IS_INVALID])

  if (isValid) {
    unmarkControl(control, marks)
  } else {
    markControl(control, marks)
  }
}

/**
 * Shows the validation state of every control of a form: `.is-invalid` and `aria-invalid` on the
 * invalid ones, with their invalid feedback added to `aria-describedby`, and `.is-valid` on the
 * valid ones when the form has `data-coreui-validate="valid"`. The controls a component took over
 * with `ownValidationState()` are left to it. Call it again whenever the form changes to keep the
 * state current.
 *
 * @param form - The form to show the state of
 * @param marks - What the marking functions added, per control; keep one map per owner
 */
export const updateValidationState = (form: HTMLFormElement, marks: ValidationMarks): void => {
  for (const control of form.elements) {
    updateControlValidationState(control, form, marks)
  }
}

/**
 * Clears the validation state of a form: removes the `.is-invalid` and `.is-valid` classes, the
 * `aria-invalid` and the `aria-describedby` ids the marking added, and nothing the page set.
 *
 * @param form - The form to clear
 * @param marks - What the marking functions added, per control
 */
export const clearValidationState = (form: HTMLFormElement, marks: ValidationMarks): void => {
  for (const control of form.elements) {
    const mark = marks.get(control)

    if (mark) {
      setStateClasses(control, mark, [])
    }

    unmarkControl(control, marks)
    marks.delete(control)
  }
}

/**
 * Reads the element that has focus in the tree a form sits in, or in the document when focus is
 * outside that tree.
 *
 * @param form - The form
 * @returns The focused element, or `null`
 */
const getFocusedElement = (form: HTMLFormElement): HTMLElement | null =>
  ((form.getRootNode() as Document | ShadowRoot).activeElement ?? form.ownerDocument.activeElement) as HTMLElement | null

/**
 * Focuses a control and tells whether focus moved while doing so, to the control or to an element
 * the control handed focus to.
 *
 * @param control - The control to focus
 * @returns `true` when a `focusin` happened during the call
 */
const moveFocusTo = (control: HTMLElement): boolean => {
  let moved = false
  const handleFocusIn = () => {
    moved = true
  }

  control.ownerDocument.addEventListener('focusin', handleFocusIn, true)
  control.focus()
  control.ownerDocument.removeEventListener('focusin', handleFocusIn, true)

  return moved
}

/**
 * Reads the text of an element as a screen reader would announce it: without the descendants
 * marked `hidden` or `aria-hidden="true"`, with white space collapsed.
 *
 * @param element - The element
 * @returns Its text, or an empty string when there is no element
 */
const getText = (element: Element | null): string => {
  if (!element) {
    return ''
  }

  const clone = element.cloneNode(true) as Element

  for (const hidden of clone.querySelectorAll(SELECTOR_HIDDEN)) {
    hidden.remove()
  }

  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * Reads the text of the invalid feedback of a control: of the elements `getFeedbackIds()` finds,
 * else of the `.invalid-feedback` its `aria-describedby` points to.
 *
 * @param control - The control
 * @returns The text, or an empty string when the control has no invalid feedback
 */
export const getFeedbackText = (control: FormControl): string => {
  const root = control.getRootNode() as Document | ShadowRoot | Element
  const getById = (id: string) => 'getElementById' in root ? root.getElementById(id) : root.querySelector(`#${CSS.escape(id)}`)
  const feedbackIds = getFeedbackIds(control)
  const ids = feedbackIds.length > 0 ?
    feedbackIds :
    splitIds(control.getAttribute('aria-describedby')).filter(id => getById(id)?.matches(SELECTOR_INVALID_FEEDBACK))

  return ids
    .map(id => getText(getById(id)))
    .filter(Boolean)
    .join(' ')
}

/**
 * Announces the validation message of a control through the live regions of the page: the text of
 * its invalid feedback, else the browser's validation message. The text is read in the next task,
 * after a framework has rendered a message set while the step was validated.
 *
 * @param control - The invalid control
 */
const announceInvalid = (control: FormControl): void => {
  setTimeout(() => {
    const message = getFeedbackText(control) || control.validationMessage

    if (message) {
      announce(message, { context: control })
    }
  })
}

/**
 * Moves focus to the first invalid control of a form that can take it and is not hidden from
 * assistive technologies, as the browser does for a form without `novalidate`. A control that hands
 * focus on, such as a native select behind a custom one, counts as focused wherever focus lands,
 * even back where it was; focus that ends on the body does not. When focus was already on the first
 * invalid control, or no control can take focus, its message is announced instead, and focus goes
 * back where it was.
 *
 * @param form - The form that failed validation
 */
export const focusFirstInvalidControl = (form: HTMLFormElement): void => {
  const previous = getFocusedElement(form)
  const invalidControls = [...form.elements].filter(control => isValidatable(control) && !control.validity.valid) as FormControl[]

  for (const control of invalidControls) {
    const moved = moveFocusTo(control)
    const focused = getFocusedElement(form)

    if (focused && focused !== form.ownerDocument.body && !focused.closest(SELECTOR_ARIA_HIDDEN) && (focused === control || moved)) {
      if (focused === previous) {
        announceInvalid(control)
      }

      return
    }
  }

  if (getFocusedElement(form) !== previous) {
    previous?.focus()
  }

  if (getFocusedElement(form) !== previous) {
    getFocusedElement(form)?.blur()
  }

  if (invalidControls.length > 0) {
    announceInvalid(invalidControls[0])
  }
}

/**
 * Reads whether a form is valid the way `checkValidity()` answers, without firing `invalid` events.
 *
 * @param form - The form to read
 * @returns Whether every control that takes part in validation is valid
 */
export const isFormValid = (form: HTMLFormElement): boolean =>
  [...form.elements].every(control => (control as FormControl).willValidate !== true || (control as FormControl).validity.valid)

/**
 * Validates a form the way a submit does. The hook learns whether every control is valid; unless it
 * takes the result over, every control shows its state, and when one is invalid focus moves to the
 * first that can take it, unless the hook moved focus itself. Validity is read again after the hook,
 * so a custom validity the hook set counts, and only then does `checkValidity()` fire the `invalid`
 * events.
 *
 * @param form - The form to validate
 * @param marks - What the marking functions added, per control; keep one map per owner
 * @param onValidate - Called with the validity before anything is shown; returns `true` to take the
 * result over
 * @returns Whether the result was shown, and whether the form is valid
 */
export const validateForm = (
  form: HTMLFormElement,
  marks: ValidationMarks,
  onValidate?: (isValid: boolean) => boolean
): { handled: boolean, isValid: boolean } => {
  const focusedElement = getFocusedElement(form)
  const isValid = isFormValid(form)

  if (onValidate?.(isValid)) {
    return { handled: false, isValid }
  }

  const isValidAfterHook = form.checkValidity()

  updateValidationState(form, marks)

  if (!isValidAfterHook && getFocusedElement(form) === focusedElement) {
    focusFirstInvalidControl(form)
  }

  return { handled: true, isValid: isValidAfterHook }
}

/**
 * Resolves the validation state a component was given: `validationState` when it is set to a
 * state, else `'invalid'` for the `invalid` alias and `'valid'` for the `valid` alias, `invalid`
 * first. An empty string counts as not set.
 *
 * @param validationState - `'valid'`, `'invalid'` or a state of the `$form-validation-states` map
 * @param valid - The alias for `'valid'`
 * @param invalid - The alias for `'invalid'`
 * @returns The state, or `undefined` when none is set
 */
export const getValidationState = (validationState?: ValidationState | null, valid?: boolean, invalid?: boolean): ValidationState | undefined =>
  validationState || (invalid ? 'invalid' : (valid ? 'valid' : undefined))

/**
 * Tells whether a selector matches an element, treating a selector the browser does not know as
 * no match.
 *
 * @param element - The element
 * @param selector - The selector
 * @returns `true` when the selector matches
 */
const matchesSafely = (element: Element, selector: string): boolean => {
  try {
    return element.matches(selector)
  } catch {
    return false
  }
}

/**
 * Reads the state the stylesheet shows for a control from the browser alone: `'invalid'` while it
 * matches `:user-invalid` in a `data-coreui-validate` form, `'valid'` while it matches `:user-valid`
 * in a `data-coreui-validate="valid"` one.
 *
 * @param control - The control
 * @returns The state, or `undefined` when the stylesheet shows none
 */
export const getUserValidity = (control: Element): ValidationState | undefined => {
  if (matchesSafely(control, SELECTOR_USER_INVALID)) {
    return 'invalid'
  }

  return matchesSafely(control, SELECTOR_USER_VALID) ? 'valid' : undefined
}

/**
 * Numbers a validation state a component was given, so a native reset that started before it can
 * tell the state apart from the ones it has to take back.
 *
 * @returns The serial of the state, higher than every serial before it
 */
export const nextStateSerial = (): number => ++stateSerial

/**
 * Follows the state a form shows for the control a component carries its value in. From the first
 * time a validation reports the control, that is `checkValidity()`, `reportValidity()` or a submit
 * fires `invalid` on it, the state is `'invalid'` whenever its value is invalid; before that, and
 * while its value is valid, it is what `getUserValidity()` reads. A native reset of the form the
 * control belongs to forgets the report in the next task, unless a listener cancelled the reset or a
 * validation reported the control again after it. The control is followed wherever it sits, also
 * outside the `<form>` it names with `form` and inside a shadow root, and a reset reaches it even
 * when a listener stops its propagation.
 *
 * @param control - The control that carries the value
 * @param onUpdate - Called with the state after every event that may change it
 * @param onReset - Called in the task after a native reset of the control's form that was not
 * cancelled, before `onUpdate`, with the last `nextStateSerial()` given out before the reset
 * @returns `read()` for the current state, and `stop()` to remove the listeners
 */
export const followUserValidity = (
  control: FormControl,
  onUpdate: (state: ValidationState | undefined) => void,
  onReset?: (serial: number) => void
): UserValidity => {
  const root = control.getRootNode()
  const roots = root instanceof ShadowRoot ? [control.ownerDocument, root] : [control.ownerDocument]
  let reported = false
  let reportedSinceReset = false
  let resetTimeout: ReturnType<typeof setTimeout> | undefined
  const read = () => (reported && !control.validity.valid ? 'invalid' : getUserValidity(control))
  const update = () => onUpdate(read())
  const handleInvalid = () => {
    reported = true
    reportedSinceReset = true
    update()
  }

  const handleFormEvent = (event: Event) => {
    if (event.target !== control.form) {
      return
    }

    if (event.type === 'submit') {
      update()
      return
    }

    const serial = stateSerial

    clearTimeout(resetTimeout)
    reportedSinceReset = false
    resetTimeout = setTimeout(() => {
      if (!event.defaultPrevented) {
        reported = reportedSinceReset
        onReset?.(serial)
      }

      update()
    })
  }

  for (const type of ['change', 'focusout', 'input']) {
    control.addEventListener(type, update)
  }

  control.addEventListener('invalid', handleInvalid)

  for (const node of roots) {
    node.addEventListener('reset', handleFormEvent, true)
    node.addEventListener('submit', handleFormEvent)
  }

  return {
    read,
    stop() {
      clearTimeout(resetTimeout)

      for (const type of ['change', 'focusout', 'input']) {
        control.removeEventListener(type, update)
      }

      control.removeEventListener('invalid', handleInvalid)

      for (const node of roots) {
        node.removeEventListener('reset', handleFormEvent, true)
        node.removeEventListener('submit', handleFormEvent)
      }
    }
  }
}

/**
 * Hands the validation state of form controls to the component that draws them: `updateValidationState()`
 * leaves their classes and ARIA to it, while validation and focus still go through them.
 *
 * @param controls - The controls the component shows the state of, such as the value it carries in
 * a hidden control and its own inputs
 * @returns A function that hands them back
 */
export const ownValidationState = (...controls: Element[]): (() => void) => {
  for (const control of controls) {
    ownedControls.add(control)
  }

  return () => {
    for (const control of controls) {
      ownedControls.delete(control)
    }
  }
}

/**
 * Makes a control block the submit while a component shows it invalid by a state it was given, with
 * the text of its invalid feedback as the message, or a generic one when it has none. A custom
 * validity the page set is left as it is: it is not overwritten while it stands, and clearing takes
 * back only a message this function set and the page has not replaced since. While the control is
 * barred from validation, disabled or read-only, its message cannot be read, so a message this
 * function set counts as its own, and a custom validity the page sets meanwhile may be replaced.
 *
 * @param control - The control that carries the value
 * @param invalid - Whether the given state is `'invalid'`
 */
export const setStateValidity = (control: FormControl, invalid: boolean): void => {
  const ownMessage = stateMessages.get(control)
  const isOwn = ownMessage !== undefined && control.validity.customError &&
    (!control.willValidate || control.validationMessage === ownMessage)

  if (ownMessage !== undefined && !isOwn) {
    stateMessages.delete(control)
  }

  if (!invalid) {
    if (isOwn) {
      control.setCustomValidity('')
      stateMessages.delete(control)
    }

    return
  }

  if (control.validity.customError && !isOwn) {
    return
  }

  const message = getFeedbackText(control) || STATE_INVALID_MESSAGE

  control.setCustomValidity(message)
  stateMessages.set(control, control.willValidate ? control.validationMessage : message)
}

/**
 * Creates the field that carries a component's value into its form: a native control the browser
 * validates and submits, left out of the accessibility tree and the tab order, which hands the
 * focus it gets, from a validation or an extension, to the element the user works in. The
 * component lays it over itself, never with `display: none` or `hidden`, so the browser shows its
 * message there.
 *
 * @param tagName - `textarea` for one text value, `select` for a choice from a list, `input` where
 * the value needs a `pattern`
 * @param getFocusTarget - Returns the element that takes the focus instead of the field
 * @returns The field, not yet in the document
 */
export const createValueField = <K extends 'input' | 'select' | 'textarea'>(
  tagName: K,
  getFocusTarget: () => HTMLElement | null | undefined
): HTMLElementTagNameMap[K] => {
  const field = document.createElement(tagName)

  field.tabIndex = -1
  field.setAttribute('aria-hidden', 'true')
  field.setAttribute('autocomplete', 'off')
  field.addEventListener('focus', () => getFocusTarget()?.focus())

  return field
}

/**
 * Gives a value field the form options of its component: `disabled`, `readOnly` and `required` as
 * they are, and a `name` only when the page gave one, since a field without a name is left out of
 * the submitted data. A select has no read-only state, so it ignores `readOnly`.
 *
 * @param field - The value field
 * @param options - The component's form options
 */
export const configureValueField = (
  field: ValueField,
  { disabled = false, name = null, readOnly = false, required = false }: ValueFieldOptions = {}
): void => {
  field.disabled = disabled
  field.required = required

  if (!(field instanceof HTMLSelectElement)) {
    field.readOnly = readOnly
  }

  if (name) {
    field.name = name
  } else {
    field.removeAttribute('name')
  }
}

/**
 * Writes the value of a value field: the text of an input or a textarea, and for a select the
 * options it holds, rebuilt so that exactly the given values are selected, one key each in the
 * submitted data, and marked selected by default so a native reset leaves them as written; a
 * select that is not multiple takes the first value only, and without a value holds one empty
 * option, so it still posts its name as a native select with a placeholder option does. A value
 * list given to a text field is joined with commas.
 *
 * @param field - The value field
 * @param value - The value, or the values of a multiple choice
 * @returns `true` when the value changed
 */
export const writeValueField = (field: ValueField, value: string | string[]): boolean => {
  if (field instanceof HTMLSelectElement) {
    const list = Array.isArray(value) ? value : [value]
    const values = field.multiple ? list : (list.length > 0 ? list.slice(0, 1) : [''])
    const current = [...field.selectedOptions].map(option => option.value)

    if (values.length === current.length && values.every((item, index) => item === current[index])) {
      return false
    }

    field.replaceChildren(...values.map(item => new Option(item, item, true, true)))
    return true
  }

  const text = Array.isArray(value) ? value.join(',') : value

  if (field.value === text) {
    return false
  }

  field.value = text
  return true
}

/**
 * Sends `input` and `change` from a value field, as a native field does when its value changes.
 *
 * @param field - The value field
 */
export const dispatchValueChange = (field: ValueField): void => {
  field.dispatchEvent(new Event('input', { bubbles: true }))
  field.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Lays a value field along the start edge of the element it stands for when the field sits next to
 * that element rather than inside it, such as after a button: the field takes the element's top
 * and height and keeps its own narrow width, so the browser shows its message under the element
 * and the field never reaches past it. Called when the field is reported invalid, which happens
 * before the browser shows the message.
 *
 * @param field - The value field, positioned absolutely
 * @param target - The element the field stands for
 */
export const alignValueField = (field: ValueField, target: Element): void => {
  const fieldRect = field.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const style = getComputedStyle(field)
  const offset = getComputedStyle(target).direction === 'rtl' ? targetRect.right - fieldRect.right : targetRect.left - fieldRect.left

  field.style.top = `${Number.parseFloat(style.top) + targetRect.top - fieldRect.top}px`
  field.style.left = `${Number.parseFloat(style.left) + offset}px`
  field.style.height = `${targetRect.height}px`
}
