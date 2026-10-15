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
 * The component a part belongs to, as the part's controller sees it: the state the owner was
 * given, whether the owner shows an error of its own on the part, and where the part reports that
 * it dropped its state.
 */
export type FieldValidationOwner = {
  dismiss: (serial: number) => void
  invalid: boolean
  state: ValidationState | undefined
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
 * - `owner`: the component this one is a part of. Its state counts as given after the component's
 *   own options and state classes, its error marks the focus targets invalid without the state
 *   class, and it hears every drop of the state with the serial of the moment.
 * - `ownError`: whether the component has an error of its own, such as a value outside its limits,
 *   which it shows as `'invalid'` over the given and the reported state without blocking.
 * - `pageDescribed`: the described targets that carry the description the page gave the host, given
 *   whether the state is `'invalid'`, and the host itself when it keeps that description, which the
 *   other targets then get as well, as the host had it at the start. By default the first described
 *   target, and every described target while the state is `'invalid'`.
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
  owner?: () => FieldValidationOwner | null
  ownError?: () => boolean
  pageDescribed?: (isInvalid: boolean) => Element[]
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
   * given, takes them off, and starts following native resets of the form ahead of the fields. Call
   * `refresh()` once the component has built its fields.
   *
   * @param host - The element of the component
   * @param options - How the component describes itself, see `FieldValidationOptions`
   */
  constructor(host: Element, options: FieldValidationOptions) {
    const root = host.getRootNode()

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

    for (const node of this._resetRoots) {
      node.addEventListener('reset', this._onReset, true)
    }

    this._userValidity = new Map()
    this.userAction = false
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
   * unless the state was given after the moment the serial stands for, tells the owner with the same
   * serial, and then draws the component without the state it dropped. A component that knows a
   * change is the user's calls it directly, before its change events.
   *
   * @param serial - The serial taken at the moment that drops the state, such as the start of a
   * key press or a native reset; any state given before it is dropped by default
   */
  dismiss(serial: number = Number.POSITIVE_INFINITY): void {
    const config = this._options.config()

    const isDropped = this._serial <= serial && this._givenState(config) !== undefined

    if (isDropped) {
      config.validationState = null

      if (this._options.aliases) {
        config.invalid = false
        config.valid = false
      }

      this._serverClasses.clear()
    }

    this._options.owner?.()?.dismiss(serial)

    if (isDropped) {
      this.update()
    }
  }

  /**
   * Follows the value fields and takes over the elements the component built, after a build or a
   * rebuild, and draws the state on them. A field that replaces another at the same position goes on
   * with the follower of that one, with its report and a reset in progress, and a field that is gone
   * loses its block. Moves the description the page gave the host to the described targets, unless the host is
   * a value field or keeps it.
   */
  refresh(): void {
    const fields = this._options.fields()
    const followers = new Map<ValueField, UserValidity>()

    for (const [index, field] of fields.entries()) {
      const replaced = this._fields[index]
      let userValidity = this._userValidity.get(field)

      if (!userValidity && replaced !== undefined && !fields.includes(replaced)) {
        userValidity = this._userValidity.get(replaced)!
        userValidity.follow(field)
      }

      followers.set(field, userValidity ?? followUserValidity(field, () => this.update()))
    }

    const kept = new Set(followers.values())

    for (const [field, userValidity] of this._userValidity) {
      if (!fields.includes(field)) {
        setStateValidity(field, false)
      }

      if (!kept.has(userValidity)) {
        userValidity.stop()
      }
    }

    this._userValidity = followers

    if (!this._movedDescription && !fields.includes(this._host as ValueField) && !this._options.pageDescribed?.(false).includes(this._host)) {
      this._movedDescription = true
      writeAttribute(this._host, 'aria-describedby', null)
    }

    this._fields = fields
    this._release()
    this._release = ownValidationState(...(this._options.owned?.() ?? fields))
    this.update()
  }

  /**
   * Draws the state: lifts the block from the fields that no longer carry it, puts the state class on
   * the frames, `aria-invalid` on the focus targets, and the page's description and the invalid
   * feedback on the described targets, the description where `pageDescribed` puts it, next to the
   * ids others put there, and only then the block of a given `'invalid'` on the fields that carry it
   * while the component can block, so the block takes the message the page and the stylesheet show
   * for them. The message in the description is the feedback of the first field that carries the
   * block, else of the first focus target. The given state is the component's own, else its
   * owner's; the shown state comes from `_shownState()`. An error of the owner marks the focus
   * targets invalid and describes them with the message, but leaves the state class to the owner
   * unless the component shows `'invalid'` itself. Focus and described targets the component no
   * longer lists lose what the controller wrote there.
   */
  update(): void {
    const config = this._options.config()
    const owner = this._options.owner?.()
    const givenState = this._givenState(config) ?? owner?.state
    const fields = this._options.fields()
    const blockers = this._options.blockers?.() ?? fields
    const blocked = givenState === 'invalid' && (this._options.canBlock?.() ?? !config.disabled) ? blockers : []

    for (const field of fields) {
      if (!blocked.includes(field)) {
        setStateValidity(field, false)
      }
    }

    const shownState = this._shownState(givenState)
    const isInvalid = shownState === 'invalid' || Boolean(owner?.invalid)
    const state = isInvalid && shownState !== 'invalid' ? undefined : shownState

    this._drawStateClass(state ? `is-${state}` : null)

    const invalidTargets = this._options.invalidTargets()

    this._markInvalid(invalidTargets, isInvalid)
    this._describeTargets(invalidTargets, (blockers[0] ?? invalidTargets[0]) as ValueField | undefined, isInvalid)

    for (const field of blocked) {
      setStateValidity(field, true)
    }
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
   * Reads the state the component shows: `'invalid'` for an error of its own, else the given state,
   * else `'invalid'` when a validation reported a field whose value is invalid, else what the
   * stylesheet shows for the fields.
   *
   * @param givenState - The state the component or its owner was given
   * @returns The state to show, or `undefined` for none
   */
  _shownState(givenState: ValidationState | undefined): ValidationState | undefined {
    if (this._options.ownError?.()) {
      return 'invalid'
    }

    const reported = [...this._userValidity.values()].map(userValidity => userValidity.read())

    return givenState ?? (reported.includes('invalid') ? 'invalid' : reported.find(Boolean))
  }

  /**
   * Reads the state the component was given: by its options, else by the state classes its markup
   * carried.
   *
   * @param config - The configuration of the component
   * @returns The given state, or `undefined` when none was given
   */
  _givenState(config: FieldValidationConfig): ValidationState | undefined {
    const { aliases } = this._options

    return getValidationState(config.validationState, aliases && config.valid, aliases && config.invalid) ?? getServerState([...this._serverClasses.values()].flat())
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
   * cancelled it, drops a state given before the reset, then restores the value; of several resets of
   * the form in one task, the last decides. The followers of the fields draw the state of the
   * restored value right after, in their own tasks for the same reset.
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
      if (!event.defaultPrevented) {
        this.dismiss(serial)
        this._options.restore?.()
      }
    })
  }
}

export default FieldValidation
