import { announce } from './announce.js'
import { getUID } from './index.js'

export type ValidationMark = {
  ariaInvalid: boolean
  classes: string[]
  describedBy: string[]
}

export type ValidationMarks = WeakMap<Element, ValidationMark>

type FormControl = HTMLElement & {
  name: string
  type: string
  validationMessage: string
  validity: ValidityState
  willValidate: boolean
}

const ATTRIBUTE_INVALID_FEEDBACK = 'data-coreui-invalid-feedback'
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const SELECTOR_ARIA_HIDDEN = '[aria-hidden="true"]'
const SELECTOR_CHOICE = '[type="checkbox"], [type="radio"]'
const SELECTOR_CONTROL = 'input, select, textarea'
const SELECTOR_FIELD = '.form-field'
const SELECTOR_FIELD_CONTROL = '.check, .radio, .switch'
const SELECTOR_FLOATING = '.form-floating'
const SELECTOR_FORM_VALIDATE_VALID = '[data-coreui-validate~="valid"]'
const SELECTOR_FRAME = '.form-control-group'
const SELECTOR_HIDDEN = `[hidden], ${SELECTOR_ARIA_HIDDEN}`
const SELECTOR_INPUT_GROUP = '.input-group'
const SELECTOR_INPUT_GROUP_CONTROL = '.form-control, .form-select'
const SELECTOR_INVALID_FEEDBACK = '.invalid-feedback, .invalid-tooltip'
const SELECTOR_RANGE = '.form-range'
const SELECTOR_RANGE_INPUT = '.form-range-input'
const STATE_CLASSES = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID]

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
 * Collects the invalid feedback elements among the siblings that follow an element, up to the
 * sibling where the next field starts.
 *
 * @param element - The element whose following siblings are searched
 * @param control - The control whose feedback is searched
 * @returns The `.invalid-feedback` and `.invalid-tooltip` siblings after it
 */
const getFollowingFeedback = (element: Element, control: FormControl): Element[] => {
  const feedback: Element[] = []

  for (let sibling = element.nextElementSibling; sibling && !startsAnotherField(sibling, control); sibling = sibling.nextElementSibling) {
    if (sibling.matches(SELECTOR_INVALID_FEEDBACK)) {
      feedback.push(sibling)
    }
  }

  return feedback
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
 * Tells whether the stylesheet shows the messages of a `.form-field` for a control: one around a
 * check, a radio or a switch, or around the frame of the control, or around the input group of a
 * `.form-control` or `.form-select`.
 *
 * @param control - The control
 * @param field - A `.form-field` around the control
 * @returns `true` when the field shows its messages for the control
 */
const reachesField = (control: Element, field: Element): boolean => {
  const inputGroup = control.matches(SELECTOR_INPUT_GROUP_CONTROL) ? control.closest(SELECTOR_INPUT_GROUP) : null

  return control.matches(SELECTOR_FIELD_CONTROL) ||
    [getFrame(control), inputGroup].some(group => group && group !== field && field.contains(group))
}

/**
 * Collects the invalid feedback the stylesheet shows for one control: the `.invalid-feedback` and
 * `.invalid-tooltip` after it, after its frame or after the `.form-range` of a `.form-range-input`,
 * up to where the next field starts, and in each `.form-field` around it that shows its messages
 * for the control, those that sit in a field around the control. A field grouping several also
 * shows the messages of the fields inside it; those belong to other controls and are left out.
 *
 * @param control - The control
 * @returns The feedback elements, in document order per rule
 */
const getStructuralFeedback = (control: FormControl): Element[] => {
  const anchor = getFrame(control) ?? (control.matches(SELECTOR_RANGE_INPUT) ? control.closest(SELECTOR_RANGE) : null)
  const fieldFeedback: Element[] = []

  for (let field = control.closest(SELECTOR_FIELD); field; field = field.parentElement?.closest(SELECTOR_FIELD) ?? null) {
    if (reachesField(control, field)) {
      fieldFeedback.push(...[...field.querySelectorAll(SELECTOR_INVALID_FEEDBACK)].filter(feedback => feedback.closest(SELECTOR_FIELD)?.contains(control)))
    }
  }

  return [...getFollowingFeedback(control, control), ...(anchor ? getFollowingFeedback(anchor, control) : []), ...fieldFeedback]
}

/**
 * Finds the invalid feedback of a control: the elements named in `data-coreui-invalid-feedback`,
 * or else the ones the stylesheet shows when the control is invalid, for a radio or checkbox those
 * of every choice that shares its name. A found element without an id gets one.
 *
 * @param control - The control
 * @returns The ids of its invalid feedback, without duplicates
 */
const getFeedbackIds = (control: FormControl): string[] => {
  const named = splitIds(control.getAttribute(ATTRIBUTE_INVALID_FEEDBACK))

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
 * being disabled, loses what they added.
 *
 * @param control - The control
 * @param form - The form it belongs to
 * @param marks - What the marking functions added, per control
 */
const updateControlValidationState = (control: Element, form: HTMLFormElement, marks: ValidationMarks): void => {
  if (!isValidatable(control)) {
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
 * valid ones when the form has `data-coreui-validate="valid"`. Call it again whenever the form
 * changes to keep the state current.
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
 * Announces the validation message of a control through the live regions of the page: the text of
 * its invalid feedback, else of the `.invalid-feedback` its `aria-describedby` points to, else the
 * browser's validation message. The text is read in the next task, after a framework has rendered
 * a message set while the step was validated.
 *
 * @param control - The invalid control
 */
const announceInvalid = (control: FormControl): void => {
  setTimeout(() => {
    const root = control.getRootNode() as Document | ShadowRoot | Element
    const getById = (id: string) => 'getElementById' in root ? root.getElementById(id) : root.querySelector(`#${CSS.escape(id)}`)
    const feedbackIds = getFeedbackIds(control)
    const ids = feedbackIds.length > 0 ?
      feedbackIds :
      splitIds(control.getAttribute('aria-describedby')).filter(id => getById(id)?.matches(SELECTOR_INVALID_FEEDBACK))
    const message = ids
      .map(id => getText(getById(id)))
      .filter(Boolean)
      .join(' ') || control.validationMessage

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
  const isValid = [...form.elements].every(control => !isValidatable(control) || control.validity.valid)

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
