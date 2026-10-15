import {
  followUserValidity, getFeedbackIds, getServerState, getStateClasses, getValidationState, nextStateSerial,
  ownValidationState, setStateValidity, splitIds, type UserValidity, type ValidationState, type ValueField
} from './form-validation.js'
import { writeAttribute } from './index.js'

export type FieldValidationConfig = {
  disabled?: boolean
  invalid?: boolean
  valid?: boolean
  validationState?: ValidationState | null
}

/**
 * How a component tells `FieldValidation` about itself.
 *
 * - `aliases`: the component takes the `invalid` and `valid` aliases of `validationState`.
 * - `blockers`: the value fields that carry the block of a given `'invalid'`; all of `fields` by default.
 * - `canBlock`: whether a given `'invalid'` may block the submit now; by default while not `disabled`.
 * - `config`: the live configuration object of the component, which the controller writes when it
 *   drops the given state.
 * - `describedTargets`: the elements that get the page's description and the invalid feedback;
 *   `invalidTargets` by default.
 * - `fields`: the value fields, in order.
 * - `frames`: the elements that get the state class.
 * - `invalidTargets`: the elements that get `aria-invalid`.
 * - `owned`: the elements the form utilities leave to the component; `fields` by default.
 * - `restore`: puts back the value the component had when it was built, on a native reset.
 * - `serverClassSources`: the elements whose state class in the markup counts as the given state;
 *   the host by default.
 */
export type FieldValidationOptions = {
  aliases?: boolean
  blockers?: () => ValueField[]
  canBlock?: () => boolean
  config: () => FieldValidationConfig
  describedTargets?: () => Element[]
  fields: () => ValueField[]
  frames: () => Element[]
  invalidTargets: () => Element[]
  owned?: () => Element[]
  restore?: () => void
  serverClassSources?: () => Element[]
}

/**
 * Keeps the validation state of a component that carries a form value: the state it was given, by
 * an option or by a state class its markup carried, the state a validation reported for its value
 * fields, the block a given `'invalid'` puts on the submit, the state class, `aria-invalid` and the
 * invalid feedback in `aria-describedby`, and a native reset of the form. The component describes
 * where these go, marks the actions of the user and tells the controller when its value changes; it
 * writes none of these itself. The controller takes back what it wrote and gives back what it
 * overwrote, and when it drops the given state, it clears it in the component's configuration.
 */
class FieldValidation {
  /** A user action is running that has not changed the value yet. */
  declare userAction: boolean
  protected declare _ariaInvalid: Map<Element, string | null>
  protected declare _described: Map<Element, string[]>
  protected declare _describedBy: string[]
  protected declare _fields: ValueField[]
  protected declare _frames: Map<Element, string | null>
  protected declare _host: Element
  protected declare _movedDescription: boolean
  protected declare _onReset: (event: Event) => void
  protected declare _options: FieldValidationOptions
  protected declare _release: () => void
  protected declare _resetRoots: Node[]
  protected declare _resetTimeout: ReturnType<typeof setTimeout> | undefined
  protected declare _serial: number
  protected declare _serverClasses: Map<Element, string[]>
  protected declare _userValidity: Map<ValueField, UserValidity>

  /**
   * Takes the state classes the server sources carry in their markup as the state the component was
   * given, and takes them off. Call `refresh()` once the component has built its fields.
   *
   * @param host - The element of the component
   * @param options - How the component describes itself, see `FieldValidationOptions`
   */
  constructor(host: Element, options: FieldValidationOptions) {
    const root = host.getRootNode()

    this.userAction = false
    this._ariaInvalid = new Map()
    this._described = new Map()
    this._describedBy = splitIds(host.getAttribute('aria-describedby'))
    this._fields = []
    this._frames = new Map()
    this._host = host
    this._movedDescription = false
    this._onReset = event => this._handleReset(event)
    this._options = options
    this._release = () => {}
    this._resetRoots = root instanceof ShadowRoot ? [host.ownerDocument, root] : [host.ownerDocument]
    this._resetTimeout = undefined
    this._serial = nextStateSerial()
    this._serverClasses = new Map()

    for (const element of options.serverClassSources?.() ?? [host]) {
      const classes = getStateClasses(element)

      if (classes.length > 0) {
        element.classList.remove(...classes)
        this._serverClasses.set(element, classes)
      }
    }

    this._userValidity = new Map()
  }

  /**
   * Takes the validation options of a `setConfig` call the component has already type-checked and
   * stored: the state classes from the markup are no longer the given state, and a call that holds
   * validation options alone is drawn in place.
   *
   * @param config - The options passed to `setConfig`
   * @returns `true` when the call held validation options only, so the component has nothing to
   * rebuild
   */
  configure(config: object | null): boolean {
    const keys = Object.keys(config ?? {})
    const isValidationOption = (key: string) => key === 'validationState' || Boolean(this._options.aliases && (key === 'invalid' || key === 'valid'))

    if (!keys.some(isValidationOption)) {
      return false
    }

    this._serverClasses.clear()
    this._serial = nextStateSerial()

    if (keys.every(isValidationOption)) {
      this.update()
      return true
    }

    return false
  }

  /**
   * Runs an action as the user's: the first change of the value it makes drops the given state.
   *
   * @param action - The action
   */
  runAsUser(action: () => void): void {
    const pending = this.userAction
    this.userAction = true

    try {
      action()
    } finally {
      this.userAction = pending && this.userAction
    }
  }

  /**
   * Records a change of the value: the first change of a user action ends it and drops the given
   * state, with its block. The component calls `update()` before each change event it sends, once
   * its value fields hold the new value.
   */
  change(): void {
    if (this.userAction) {
      this.userAction = false
      this.dismiss()
    }
  }

  /**
   * Drops the given state, in the component's configuration and as a state class from the markup,
   * and lifts its block, unless the state was given after the moment the serial stands for. A
   * component that knows a change is the user's calls it directly, before its change events.
   *
   * @param serial - The serial taken at the moment that drops the state, such as the start of a
   * key press or a native reset; any state given before it is dropped by default
   */
  dismiss(serial: number = Number.POSITIVE_INFINITY): void {
    if (this._serial > serial) {
      return
    }

    const config = this._options.config()

    config.validationState = null

    if (this._options.aliases) {
      config.invalid = false
      config.valid = false
    }

    this._serverClasses.clear()

    for (const field of this._options.fields()) {
      setStateValidity(field, false)
    }
  }

  /**
   * Follows the value fields and takes over the elements the component built, after a build or a
   * rebuild, and draws the state on them. A field that replaces another at the same position keeps
   * the report a validation made on that one, and a field that is gone loses its block. Moves the
   * description the page gave the host to the described targets, unless the host is a value field.
   * Follows native resets of the form after the fields it newly follows, so the fields forget a
   * report before the value is restored.
   */
  refresh(): void {
    const fields = this._options.fields()
    let isFollowing = false

    for (const [index, field] of fields.entries()) {
      const replaced = this._fields[index]

      if (!this._userValidity.has(field)) {
        const wasReported = replaced !== undefined && !fields.includes(replaced) && this._userValidity.get(replaced)?.isReported()

        this._userValidity.set(field, followUserValidity(field, () => this.update(), undefined, wasReported))
        isFollowing = true
      }
    }

    for (const [field, userValidity] of this._userValidity) {
      if (!fields.includes(field)) {
        userValidity.stop()
        setStateValidity(field, false)
        this._userValidity.delete(field)
      }
    }

    if (isFollowing) {
      for (const node of this._resetRoots) {
        node.removeEventListener('reset', this._onReset, true)
        node.addEventListener('reset', this._onReset, true)
      }
    }

    if (!this._movedDescription && !fields.includes(this._host as ValueField)) {
      this._movedDescription = true
      writeAttribute(this._host, 'aria-describedby', null)
    }

    this._fields = fields
    this._release()
    this._release = ownValidationState(...(this._options.owned?.() ?? fields))
    this.update()
  }

  /**
   * Draws the state: the block of a given `'invalid'` on the fields that carry it while the component
   * can block, then the state class on the frames, `aria-invalid` on the focus targets, and the
   * page's description and the invalid feedback on the described targets, the description always on
   * the first of them, next to the ids others put there. The message is the feedback of the first
   * field that carries the block, else of the first focus target. The state is the given one, else
   * `'invalid'` when a validation reported a field whose value is invalid, else what the stylesheet
   * shows for the fields. Focus and described targets the component no longer lists lose what the
   * controller wrote there.
   */
  update(): void {
    const config = this._options.config()
    const { aliases } = this._options
    const serverClasses = [...this._serverClasses.values()].flat()
    const givenState = getValidationState(config.validationState, aliases && config.valid, aliases && config.invalid) ?? getServerState(serverClasses)
    const fields = this._options.fields()
    const blockers = this._options.blockers?.() ?? fields
    const blocks = givenState === 'invalid' && (this._options.canBlock?.() ?? !config.disabled)

    for (const field of fields) {
      setStateValidity(field, blocks && blockers.includes(field))
    }

    const reported = [...this._userValidity.values()].map(userValidity => userValidity.read())
    const state = givenState ?? (reported.includes('invalid') ? 'invalid' : reported.find(Boolean))
    const isInvalid = state === 'invalid'
    const invalidTargets = this._options.invalidTargets()
    const source = (blockers[0] ?? invalidTargets[0]) as ValueField | undefined
    const feedbackIds = isInvalid && source ? getFeedbackIds(source) : []

    this._drawStateClass(state ? `is-${state}` : null)
    this._markInvalid(invalidTargets, isInvalid)
    this._describe((this._options.describedTargets?.() ?? invalidTargets).map((target, index) => [target, [...(index === 0 || isInvalid ? this._describedBy : []), ...feedbackIds]]))
  }

  /**
   * Hands everything back: stops following the fields and the form, lifts the block, takes off what
   * it drew, gives back the `aria-invalid` it overwrote, gives the server sources the state classes
   * of their markup, unless that state was dropped meanwhile, and adds the page's description back
   * to the host next to what the host carries now. Call it before the component takes its elements
   * apart.
   */
  dispose(): void {
    clearTimeout(this._resetTimeout)

    for (const node of this._resetRoots) {
      node.removeEventListener('reset', this._onReset, true)
    }

    for (const userValidity of this._userValidity.values()) {
      userValidity.stop()
    }

    for (const field of this._options.fields()) {
      setStateValidity(field, false)
    }

    this._userValidity.clear()
    this._release()
    this._drawStateClass(null)
    this._markInvalid([], false)
    this._describe([])

    for (const [element, classes] of this._serverClasses) {
      element.classList.add(...classes)
    }

    if (this._movedDescription) {
      const ids = splitIds(this._host.getAttribute('aria-describedby'))

      writeAttribute(this._host, 'aria-describedby', [...new Set([...this._describedBy, ...ids])].join(' ') || null)
    }
  }

  /**
   * Puts a state class on the frames, taking off only the classes the controller added itself, also
   * from frames the component no longer lists.
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
   * otherwise, and gives the elements that were focus targets before and no longer are the value
   * they had before the controller first wrote it.
   *
   * @param targets - The focus targets
   * @param isInvalid - Whether the state is `'invalid'`
   */
  _markInvalid(targets: Element[], isInvalid: boolean): void {
    for (const [target, original] of this._ariaInvalid) {
      if (!targets.includes(target)) {
        writeAttribute(target, 'aria-invalid', original)
        this._ariaInvalid.delete(target)
      }
    }

    for (const target of targets) {
      if (!this._ariaInvalid.has(target)) {
        this._ariaInvalid.set(target, target.getAttribute('aria-invalid'))
      }

      writeAttribute(target, 'aria-invalid', isInvalid ? 'true' : null)
    }
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
   * cancelled it, drops a state given before the reset and draws it gone, so the events the restore
   * sends see it, then restores the value and draws the state again.
   *
   * @param event - The `reset` event
   */
  _handleReset(event: Event): void {
    if (!this._options.fields().some(field => field.form === event.target)) {
      return
    }

    const serial = nextStateSerial()

    clearTimeout(this._resetTimeout)
    this._resetTimeout = setTimeout(() => {
      if (event.defaultPrevented) {
        return
      }

      this.dismiss(serial)
      this.update()
      this._options.restore?.()
      this.update()
    })
  }
}

export default FieldValidation
