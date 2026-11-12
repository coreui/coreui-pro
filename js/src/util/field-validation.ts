import {
  closeValueFieldBubble, followUserValidities, getFeedbackIds, getValidationState, ownValidationState, splitIds, type UserValidity,
  type ValidationState, type ValueField
} from './form-validation.js'
import { resolveFieldState } from './field-state.js'
import { writeAttribute } from './index.js'

export type FieldValidationConfig = {
  invalid?: boolean
  valid?: boolean
  validationState?: ValidationState | null
}

/**
 * How a component tells `FieldValidation` about itself.
 *
 * - `aliases`: the component takes the `invalid` and `valid` aliases of `validationState`.
 * - `config`: the live configuration object of the component, which holds the given state.
 * - `describedTargets`: the elements that get the page's description and the invalid feedback;
 *   `invalidTargets` by default.
 * - `fields`: the value fields, in order; the first one gives the invalid feedback.
 * - `frames`: the elements that get the state class.
 * - `invalidTargets`: the elements that get `aria-invalid`.
 * - `owned`: the elements the form utilities leave to the component; `fields` by default.
 * - `ownError`: whether the component has an error of its own, such as a value outside its limits
 *   or a range in the wrong order, which it shows as `'invalid'` over the given and the reported
 *   state.
 * - `pageDescribed`: the described targets that carry the description the page gave the host, given
 *   whether the state is `'invalid'`, and the host itself when it keeps that description, which the
 *   other targets then get as well, as the host had it at the start. By default the first described
 *   target, and every described target while the state is `'invalid'`.
 * - `restore`: puts back the value the component had when it was built, on a native reset.
 */
export type FieldValidationOptions = {
  aliases?: boolean
  config: () => FieldValidationConfig
  describedTargets?: () => Element[]
  fields: () => ValueField[]
  frames: () => Element[]
  invalidTargets: () => Element[]
  owned?: () => Element[]
  ownError?: () => boolean
  pageDescribed?: (isInvalid: boolean) => Element[]
  restore?: () => void
}

/**
 * Keeps the validation state of a component that carries a form value: the state its options give
 * it, the state a validation reported for its value fields, the state class, `aria-invalid` and the
 * invalid feedback in `aria-describedby`, and a native reset of the form. A state class the page
 * wrote on an element of the component is the page's: it is not read, and it stays. It leaves the
 * validity of the value fields to the browser and the page, and the given state to the page, which
 * changes it with the component's setter. The component describes where these go and tells the
 * controller when its value or its state changes; it writes none of these itself. The controller
 * takes back what it wrote and gives back what it overwrote.
 */
class FieldValidation {
  protected declare _ariaInvalid: Element[]
  protected declare _described: Map<Element, string[]>
  protected declare _describedBy: string[]
  protected declare _frames: Map<Element, string | null>
  protected declare _host: Element
  protected declare _movedDescription: boolean
  protected declare _onReset: (event: Event) => void
  protected declare _options: FieldValidationOptions
  protected declare _owner: FieldValidation | null
  protected declare _parts: FieldValidation[]
  protected declare _release: () => void
  protected declare _resetRoots: Node[]
  protected declare _resetTimeout: ReturnType<typeof setTimeout> | undefined
  protected declare _userValidity: Map<ValueField, UserValidity>

  /**
   * Starts following native resets of the form ahead of the fields. Call `refresh()` once the
   * component has built its fields.
   *
   * @param host - The element of the component
   * @param options - How the component describes itself, see `FieldValidationOptions`
   */
  constructor(host: Element, options: FieldValidationOptions) {
    const root = host.getRootNode()

    this._ariaInvalid = []
    this._described = new Map()
    this._describedBy = splitIds(host.getAttribute('aria-describedby'))
    this._frames = new Map()
    this._host = host
    this._movedDescription = false
    this._onReset = event => this._handleReset(event)
    this._options = options
    this._owner = null
    this._parts = []
    this._release = () => {}
    this._resetRoots = root instanceof ShadowRoot ? [host.ownerDocument, root] : [host.ownerDocument]
    this._resetTimeout = undefined

    for (const node of this._resetRoots) {
      node.addEventListener('reset', this._onReset, true)
    }

    this._userValidity = new Map()
  }

  /**
   * Makes this controller the owner of the controller of a part, such as a field of a picker or an
   * end of a range: the part takes the owner's given state after its own, shows the owner's error
   * of its own on its focus targets. Draws the owner and its parts.
   *
   * @param part - The controller of the part
   */
  adopt(part: FieldValidation): void {
    part._owner = this
    this._parts.push(part)
    this.update()
  }

  /**
   * Follows the value fields and takes over the elements the component built, after a build or a
   * rebuild, and draws the state on them. A new field goes on with the follower of a field that is
   * gone, with its report and a reset in progress. Moves the description the page gave the host to
   * the described targets, unless the host is a value field or keeps it.
   */
  refresh(): void {
    const fields = this._options.fields()

    this._userValidity = followUserValidities(fields, this._userValidity, () => this.update())

    if (!this._movedDescription && !fields.includes(this._host as ValueField) && !this._options.pageDescribed?.(false).includes(this._host)) {
      this._movedDescription = true
      writeAttribute(this._host, 'aria-describedby', null)
    }

    this._release()
    this._release = ownValidationState(...(this._options.owned?.() ?? fields))
    this.update()
  }

  /**
   * Draws the state: puts the state class on the frames, `aria-invalid` on the focus targets, and the
   * page's description and the invalid feedback on the described targets, the description where
   * `pageDescribed` puts it, next to the ids others put there. The message in the description is the
   * feedback of the first value field, else of the first focus target. The given state is the
   * component's own, else the one its owners were given; the shown state comes from
   * `resolveFieldState()`. An error of the owner's own marks the focus targets invalid and describes
   * them with the message, but leaves the state class to the owner unless the component shows
   * `'invalid'` itself. Focus and described targets the component no longer lists lose what the
   * controller wrote there. An owner draws its parts after itself, and a part draws the whole tree
   * from its topmost owner, since an owner shows the errors of its parts.
   */
  update(): void {
    if (this._owner) {
      this._owner.update()
      return
    }

    this._draw()
  }

  /**
   * Draws the component as `update()` describes, then its parts.
   */
  _draw(): void {
    const reported = [...this._userValidity.values()].map(userValidity => userValidity.read())
    const { invalid: isInvalid, state } = resolveFieldState({
      given: this._givenState(this._options.config()),
      inherited: this._owner?._inheritedState(),
      ownError: this._hasError(),
      ownerError: Boolean(this._owner?._options.ownError?.()),
      reported: reported.includes('invalid'),
      user: reported.find(Boolean)
    })

    this._drawStateClass(state ? `is-${state}` : null)

    const invalidTargets = this._options.invalidTargets()

    this._markInvalid(invalidTargets, isInvalid)
    this._describeTargets(invalidTargets, (this._options.fields()[0] ?? invalidTargets[0]) as ValueField | undefined, isInvalid)

    for (const part of this._parts) {
      part._draw()
    }
  }

  /**
   * Hands everything back: leaves its owner, stops following the fields and the form, takes off what
   * it drew and the `aria-invalid` it wrote, and adds the page's description back to the host next to
   * what the host carries now. Call it before the component takes its elements apart.
   */
  dispose(): void {
    this._owner?._parts.splice(this._owner._parts.indexOf(this), 1)
    this._owner = null
    clearTimeout(this._resetTimeout)

    for (const node of this._resetRoots) {
      node.removeEventListener('reset', this._onReset, true)
    }

    for (const userValidity of this._userValidity.values()) {
      userValidity.stop()
    }

    for (const field of this._options.fields()) {
      closeValueFieldBubble(field)
    }

    this._userValidity.clear()
    this._release()
    this._drawStateClass(null)
    this._markInvalid([], false)
    this._describe([])

    if (this._movedDescription) {
      const ids = splitIds(this._host.getAttribute('aria-describedby'))

      writeAttribute(this._host, 'aria-describedby', [...new Set([...this._describedBy, ...ids])].join(' ') || null)
    }
  }

  /**
   * Tells whether the component or one of its parts, at any depth, has an error of its own.
   *
   * @returns `true` when an error of its own makes the component show `'invalid'`
   */
  _hasError(): boolean {
    return Boolean(this._options.ownError?.()) || this._parts.some(part => part._hasError())
  }

  /**
   * Reads the state given to the component or, when it was given none, to its owner, up the chain
   * of owners.
   *
   * @returns The given state, or `undefined` when none was given
   */
  _inheritedState(): ValidationState | undefined {
    return this._givenState(this._options.config()) ?? this._owner?._inheritedState()
  }

  /**
   * Reads the state the options of the component give it.
   *
   * @param config - The configuration of the component
   * @returns The given state, or `undefined` when none was given
   */
  _givenState(config: FieldValidationConfig): ValidationState | undefined {
    const { aliases } = this._options

    return getValidationState(config.validationState, aliases && config.valid, aliases && config.invalid)
  }

  /**
   * Puts a state class on the frames, taking off only the classes the controller added itself, also
   * from frames the component no longer lists. A frame that already carries the class keeps it as
   * someone else's, so it stays when the state goes.
   *
   * @param stateClass - The class to show, or `null` for none
   */
  _drawStateClass(stateClass: string | null): void {
    const frames = new Set(this._options.frames())

    for (const [frame, owned] of this._frames) {
      if (owned && (owned !== stateClass || !frames.has(frame))) {
        frame.classList.remove(owned)
        this._frames.set(frame, null)
      }

      if (!frames.has(frame)) {
        this._frames.delete(frame)
      }
    }

    for (const frame of frames) {
      if (stateClass && !frame.classList.contains(stateClass)) {
        frame.classList.add(stateClass)
        this._frames.set(frame, stateClass)
      } else if (!this._frames.has(frame)) {
        this._frames.set(frame, null)
      }
    }
  }

  /**
   * Writes `aria-invalid` on the focus targets, `"true"` while the state is `'invalid'` and none
   * otherwise, and takes it off the elements that were focus targets before and no longer are.
   *
   * @param targets - The focus targets
   * @param isInvalid - Whether the state is `'invalid'`
   */
  _markInvalid(targets: Element[], isInvalid: boolean): void {
    for (const target of this._ariaInvalid) {
      if (!targets.includes(target)) {
        writeAttribute(target, 'aria-invalid', null)
      }
    }

    this._ariaInvalid = targets

    for (const target of targets) {
      writeAttribute(target, 'aria-invalid', isInvalid ? 'true' : null)
    }
  }

  /**
   * Gives the described targets the page's description where `pageDescribed` puts it and, while the
   * state is `'invalid'`, the invalid feedback of the message source.
   *
   * @param invalidTargets - The focus targets, the described targets by default
   * @param source - The field whose invalid feedback the targets get
   * @param isInvalid - Whether the state is `'invalid'`
   */
  _describeTargets(invalidTargets: Element[], source: ValueField | undefined, isInvalid: boolean): void {
    const feedbackIds = isInvalid && source ? getFeedbackIds(source) : []
    const describedTargets = this._options.describedTargets?.() ?? invalidTargets
    const pageDescribed = this._options.pageDescribed?.(isInvalid) ?? describedTargets.filter((_, index) => index === 0 || isInvalid)

    this._describe(describedTargets.map(target => [target, [...(pageDescribed.includes(target) ? this._describedBy : []), ...feedbackIds]]))
  }

  /**
   * Writes the ids each element should get from the controller into its `aria-describedby`, after
   * the ids someone else put there and without repeating them, takes back the ids it wrote before,
   * also from elements no longer given, and removes the attribute when no id is left.
   *
   * @param entries - Each element with the ids it should get from the controller
   */
  _describe(entries: Array<[Element, string[]]>): void {
    const next = new Map(entries)

    for (const target of this._described.keys()) {
      if (!next.has(target)) {
        next.set(target, [])
      }
    }

    for (const [target, ids] of next) {
      const written = this._described.get(target) ?? []
      const base = splitIds(target.getAttribute('aria-describedby')).filter(id => !written.includes(id))
      const added = [...new Set(ids)].filter(id => !base.includes(id))

      writeAttribute(target, 'aria-describedby', [...base, ...added].join(' ') || null)

      if (added.length > 0) {
        this._described.set(target, added)
      } else {
        this._described.delete(target)
      }
    }
  }

  /**
   * Answers a native reset of the form of a value field: in the next task, unless a listener
   * cancelled it, restores the value; of several resets of the form in one task, the last decides.
   * The given state stays. The followers of the fields draw the state of the restored value right
   * after, in their own tasks for the same reset.
   *
   * @param event - The `reset` event
   */
  _handleReset(event: Event): void {
    if (!this._options.fields().some(field => field.form === event.target)) {
      return
    }

    clearTimeout(this._resetTimeout)
    this._resetTimeout = setTimeout(() => {
      if (!event.defaultPrevented) {
        this._options.restore?.()
      }
    })
  }
}

export default FieldValidation
