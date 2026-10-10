/**
 * --------------------------------------------------------------------------
 * CoreUI PRO section-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import {
  type DisabledDate, getLocalDateFromString, isSameInstantAs
} from './util/calendar.js'
import {
  applyDigitToSection,
  applyLetterToSection,
  convertValue,
  formatSections,
  formatSectionValue,
  getDateFromSections,
  getDateLimitError,
  getDateWithin,
  getDaySectionMax,
  getFullYearFromSection,
  getIncrementedSectionValue,
  getSectionBounds,
  getSectionLayout,
  getSectionsFromString,
  getSectionValueText,
  getWeekSectionMax,
  hasShortcutModifier,
  isBeforeYearOne,
  isEditableSection,
  isTypedKey,
  setSectionsFromDate
} from './util/date-sections.js'
import type { DateSection, EditableSection, SectionFormat } from './util/date-sections.js'
import { onLabelClick } from './util/field-label.js'
import { captureHostClasses, type HostClasses, restoreHostClasses } from './util/form-control-group.js'
import {
  followUserValidity, getFeedbackIds, getValidationState, nextStateSerial, ownValidationState, setStateValidity,
  type UserValidity, type ValidationState
} from './util/form-validation.js'
import { getNextActiveElement, isRTL, toggleHostClass } from './util/index.js'

/**
 * Constants
 */

const ARROW_DOWN_KEY = 'ArrowDown'
const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'
const ARROW_UP_KEY = 'ArrowUp'
const BACKSPACE_KEY = 'Backspace'
const DELETE_KEY = 'Delete'
const INPUT_TYPE_KEYS: Record<string, string> = {
  deleteContentBackward: BACKSPACE_KEY,
  deleteContentForward: DELETE_KEY
}
const END_KEY = 'End'
const HOME_KEY = 'Home'

const CLASS_NAME_SECTION_INPUT = 'form-date-time'
const CLASS_NAME_ALL_SELECTED = 'form-date-time-all-selected'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_FORM_CONTROL = 'form-control'
const CLASS_NAME_FILLED = 'form-date-time-filled'
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_SECTION = 'form-date-time-section'
const CLASS_NAME_SECTION_EMPTY = 'form-date-time-section-empty'
const CLASS_NAME_SEPARATOR = 'form-date-time-separator'

const HOST_CLASS_NAMES = [
  CLASS_NAME_ALL_SELECTED,
  CLASS_NAME_FILLED,
  CLASS_NAME_FORM_CONTROL,
  CLASS_NAME_SECTION_INPUT
]

const SELECTOR_SECTION = '.form-date-time-section'
const SELECTOR_VALUE_FIELD = 'textarea'

export type SectionInputConfig = {
  ariaDayLabel: string
  ariaHourLabel: string
  ariaLabel: string
  ariaMeridiemLabel: string
  ariaMinuteLabel: string
  ariaMonthLabel: string
  ariaQuarterLabel: string
  ariaSecondLabel: string
  ariaWeekLabel: string
  ariaYearLabel: string
  autofocus: boolean
  date: Date | number | string | null
  dayPlaceholder: string | null
  disabled: boolean
  disabledDates: DisabledDate | DisabledDate[] | null
  format: SectionFormat
  hourPlaceholder: string | null
  inputDateParse: ((value: string) => Date | null) | null
  locale: string
  maxDate: Date | number | string | null
  meridiemPlaceholder: string | null
  minDate: Date | number | string | null
  minutePlaceholder: string | null
  monthNames: string[] | null
  monthPlaceholder: string | null
  name: string | null
  quarterPlaceholder: string | null
  readonly: boolean
  required: boolean
  secondPlaceholder: string | null
  validationState: ValidationState | null
  weekPlaceholder: string | null
  yearPlaceholder: string | null
}

const Default: SectionInputConfig = {
  ariaDayLabel: 'Day',
  ariaHourLabel: 'Hour',
  ariaLabel: 'Date input',
  ariaMeridiemLabel: 'AM/PM',
  ariaMinuteLabel: 'Minute',
  ariaMonthLabel: 'Month',
  ariaQuarterLabel: 'Quarter',
  ariaSecondLabel: 'Second',
  ariaWeekLabel: 'Week',
  ariaYearLabel: 'Year',
  autofocus: false,
  date: null,
  dayPlaceholder: null,
  disabled: false,
  disabledDates: null,
  format: null,
  hourPlaceholder: null,
  inputDateParse: null,
  locale: 'default',
  maxDate: null,
  meridiemPlaceholder: null,
  minDate: null,
  minutePlaceholder: null,
  monthNames: null,
  monthPlaceholder: null,
  name: null,
  quarterPlaceholder: null,
  readonly: false,
  required: false,
  secondPlaceholder: null,
  validationState: null,
  weekPlaceholder: null,
  yearPlaceholder: null
}

const DefaultType: Record<string, string> = {
  ariaDayLabel: 'string',
  ariaHourLabel: 'string',
  ariaLabel: 'string',
  ariaMeridiemLabel: 'string',
  ariaMinuteLabel: 'string',
  ariaMonthLabel: 'string',
  ariaQuarterLabel: 'string',
  ariaSecondLabel: 'string',
  ariaWeekLabel: 'string',
  ariaYearLabel: 'string',
  autofocus: 'boolean',
  date: '(date|number|string|null)',
  dayPlaceholder: '(string|null)',
  disabled: 'boolean',
  disabledDates: '(array|date|function|null)',
  format: '(function|string|null)',
  hourPlaceholder: '(string|null)',
  inputDateParse: '(function|null)',
  locale: 'string',
  maxDate: '(date|number|string|null)',
  meridiemPlaceholder: '(string|null)',
  minDate: '(date|number|string|null)',
  minutePlaceholder: '(string|null)',
  monthNames: '(array|null)',
  monthPlaceholder: '(string|null)',
  name: '(string|null)',
  quarterPlaceholder: '(string|null)',
  readonly: 'boolean',
  required: 'boolean',
  secondPlaceholder: '(string|null)',
  validationState: '(string|null|undefined)',
  weekPlaceholder: '(string|null)',
  yearPlaceholder: '(string|null)'
}

const DefaultPlaceholders = {
  day: 'DD',
  week: 'WW',
  month: 'MM',
  quarter: 'Q',
  year: 'YYYY',
  hour: 'HH',
  minute: 'mm',
  second: 'ss',
  meridiem: 'AM'
}

/**
 * Class definition
 */

abstract class SectionInput<C extends SectionInputConfig = SectionInputConfig> extends BaseComponent {
  declare ['constructor']: typeof SectionInput & typeof BaseComponent
  protected declare _date: Date | null
  protected declare _minDate: Date | null
  protected declare _onDismissValidationState: ((serial: number) => void) | null
  protected declare _ownerInvalid: boolean
  protected declare _ownerState: ValidationState | undefined
  protected declare _ownsStateClass: boolean
  protected declare _maxDate: Date | null
  protected declare _sections: DateSection[]
  protected declare _draft: string
  protected declare _allSelected: boolean
  protected declare _error: string | null
  protected declare _hostAriaLabel: string | null
  protected declare _hostClasses: HostClasses
  protected declare _hostDisabledClass: boolean | null
  protected declare _hostNodes: ChildNode[]
  protected declare _hostRole: string | null
  protected declare _inputElement: HTMLTextAreaElement | null
  protected declare _initialDate: Date | null
  protected declare _isBuilt: boolean
  protected declare _rejected: boolean
  protected declare _releaseValidationState: () => void
  protected declare _removeLabelClick: () => void
  protected declare _serverClasses: string[]
  protected declare _stateClass: string | null
  protected declare _stateSerial: number
  protected declare _userCommit: boolean
  protected declare _userValidity: UserValidity
  protected declare _valueKey: string

  constructor(element?: string | Element | null, config?: Partial<C> | null) {
    super(element, config)

    this._config.disabled = this._config.disabled || this._element.classList.contains(CLASS_NAME_DISABLED)
    this._applyConfig()
    this._date = getDateFromSections(this._sections)
    this._allSelected = false
    this._error = null
    this._inputElement = null
    this._isBuilt = false
    this._onDismissValidationState = null
    this._ownerInvalid = false
    this._ownerState = undefined
    this._ownsStateClass = false
    this._rejected = false
    this._stateClass = null
    this._stateSerial = nextStateSerial()
    this._userCommit = false
    this._hostAriaLabel = this._element.getAttribute('aria-label')
    this._hostClasses = captureHostClasses(this._element, HOST_CLASS_NAMES)
    this._hostDisabledClass = null
    this._hostNodes = [...this._element.childNodes]
    this._hostRole = this._element.getAttribute('role')
    this._serverClasses = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID].filter(name => this._element.classList.contains(name))
    this._element.classList.remove(...this._serverClasses)

    this._createSectionInput()
    this._userValidity = followUserValidity(this._inputElement!, () => this._updateValidity(), serial => this._onFormReset(serial))
    this._releaseValidationState = ownValidationState(this._inputElement!)
    this._initialDate = getDateFromSections(this._sections)
    this._date = this._applyValidationState()
    this._valueKey = this._getValueKey(this._sections)
    this._inputElement!.defaultValue = this._getResetValue()
    this._isBuilt = true
    this._addEventListeners()
    this._removeLabelClick = onLabelClick(this._element, () => this._focusFirstEmptySection())

    if (this._config.autofocus && !this._config.disabled) {
      this._getSectionElements()[0]?.focus()
    }
  }

  // Getters
  static override get Default(): typeof Default {
    return Default
  }

  static override get DefaultType(): typeof DefaultType {
    return DefaultType
  }

  static get CHANGE_EVENT_NAME(): string {
    return 'dateChange'
  }

  // Public
  clear(): void {
    this._draft = ''
    this._commitSections(setSectionsFromDate(this._sections, null))
  }

  reset(): void {
    this._draft = ''
    this._setAllSelected(false)
    this._commitSections(setSectionsFromDate(this._sections, this._initialDate))
  }

  getDate(): Date | null {
    return this._date
  }

  isDateSelectable(date: Date | null): boolean {
    const normalized = date instanceof Date ? getDateWithin(this._sections, date) : null

    return normalized !== null && this._getValidationError(normalized, true) === null
  }

  setConfig(config: Partial<C> | null): void {
    if (typeof config !== 'object') {
      return
    }

    const keys = Object.keys(config ?? {})

    if (keys.includes('validationState')) {
      this._serverClasses = []
      this._stateSerial = nextStateSerial()
    }

    if (keys.length === 1 && keys[0] === 'validationState') {
      this._config = this._getConfig({ ...this._config, ...config })
      this._updateValidity()
      return
    }

    const sections = this._sections

    this._config = this._getConfig({ ...this._config, date: getDateFromSections(sections), ...config })
    this._applyConfig()

    if (config?.date === undefined && this._getLayoutKey(this._sections) === this._getLayoutKey(sections)) {
      this._sections = sections
    }

    this._createSectionInput()
    this._commitSections()
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    this._removeLabelClick()
    EventHandler.off(this._element, this.constructor.EVENT_KEY)
    this._userValidity.stop()
    this._releaseValidationState()
    setStateValidity(this._inputElement!, false)

    if (this._stateClass && this._ownsStateClass) {
      this._element.classList.remove(this._stateClass)
    }

    this._element.classList.add(...this._serverClasses)

    if (this._hostDisabledClass !== null) {
      this._element.classList.toggle(CLASS_NAME_DISABLED, this._hostDisabledClass)
    }

    restoreHostClasses(this._element, HOST_CLASS_NAMES, this._hostClasses)

    if (!this._hostAriaLabel) {
      this._restoreAttribute('aria-label', this._hostAriaLabel)
    }

    this._restoreAttribute('role', this._hostRole)
    this._element.replaceChildren(...this._hostNodes)
    super.dispose()
  }

  // Private
  _getAriaLabel(): string {
    return this._config.ariaLabel || this.constructor.Default.ariaLabel
  }

  _convertDate(value: any): Date | null {
    return convertValue(value, 'date', this._config.locale)
  }

  _applyConfig(): void {
    const { date, format, locale, maxDate, minDate, monthNames } = this._config
    const sections = format ? getSectionLayout(format, locale, monthNames) : this._getDefaultSections(locale)

    this._minDate = this._convertDate(minDate)
    this._maxDate = this._convertDate(maxDate)
    this._sections = setSectionsFromDate(sections, date ? this._convertDate(date) : null)
    this._draft = ''
  }

  _getLayoutKey(sections: DateSection[]): string {
    return JSON.stringify(sections.map(section => (isEditableSection(section) ? { ...section, value: null } : section)))
  }

  _getValueKey(sections: DateSection[]): string {
    return JSON.stringify(sections.map(section => section.value))
  }

  _addEventListeners(): void {
    const eventName = (name: string) => this.constructor.eventName(name)

    EventHandler.on(this._element, eventName('keydown'), SELECTOR_SECTION, (event: any) => {
      this._onKeydown(event)
    })

    EventHandler.on(this._element, eventName('beforeinput'), SELECTOR_SECTION, (event: any) => {
      event.preventDefault()
      const key = event.inputType === 'insertText' && event.data?.length === 1 ? event.data : INPUT_TYPE_KEYS[event.inputType]

      if (key && this._isEditable()) {
        event.target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }))
      }
    })

    EventHandler.on(this._element, eventName('focusin'), SELECTOR_SECTION, (event: any) => {
      if (this._draft) {
        this._draft = ''
        this._commitSections()
      }

      this._setTabIndexes(event.target)
      this._selectSectionContent(event.target)
    })

    EventHandler.on(this._element, eventName('focusin'), SELECTOR_VALUE_FIELD, () => {
      this._focusFirstEmptySection()
    })

    EventHandler.on(this._element, eventName('mousedown'), SELECTOR_SECTION, (event: any) => {
      if (this._config.disabled) {
        return
      }

      event.preventDefault()
      event.target.focus()
      this._selectSectionContent(event.target)
    })

    EventHandler.on(this._element, eventName('focusout'), (event: any) => {
      if (!this._element.contains(event.relatedTarget)) {
        this._setAllSelected(false)
        this._normalizeSections()
      }
    })

    EventHandler.on(this._element, eventName('paste'), (event: any) => {
      event.preventDefault()

      if (this._isEditable()) {
        this._handlePaste(event.clipboardData.getData('text'))
      }
    })

    for (const type of ['copy', 'cut']) {
      EventHandler.on(this._element, eventName(type), (event: any) => {
        if (!this._allSelected) {
          return
        }

        event.preventDefault()
        event.clipboardData.setData('text/plain', formatSections(this._sections))

        if (type === 'cut' && this._isEditable()) {
          this._clearAndFocus()
        }
      })
    }

    EventHandler.on(this._element, eventName('click'), (event: any) => {
      if (event.target.closest(SELECTOR_SECTION)) {
        event.preventDefault()
        return
      }

      if (!this._config.disabled) {
        this._focusFirstEmptySection()
      }
    })
  }

  _getResetValue(): string {
    const sections = setSectionsFromDate(this._sections, this._initialDate)
    const date = getDateFromSections(sections)

    return date && !getDateLimitError(sections, date, this._minDate, this._maxDate, this._config.disabledDates) ?
      formatSections(sections) :
      ''
  }

  _focusFirstEmptySection(): void {
    if (this._config.disabled || this._inputElement?.matches(':disabled')) {
      return
    }

    const sections = this._getSectionElements()
    const target = sections.find((sectionElement, index) => this._getSection(index).value === null) || sections[0]

    target?.focus()
  }

  _onFormReset(serial: number): void {
    this._dismissValidationState(serial)
    this.reset()
  }

  _onKeydown(event: KeyboardEvent): void {
    const { key } = event
    const target = event.target as HTMLElement

    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'a') {
      event.preventDefault()
      this._setAllSelected(true)
      return
    }

    if ([ARROW_LEFT_KEY, ARROW_RIGHT_KEY, HOME_KEY, END_KEY].includes(key) && !hasShortcutModifier(event)) {
      event.preventDefault()
      this._focusSectionByKey(target, key)
      return
    }

    if (!this._isEditable()) {
      if (isTypedKey(event)) {
        event.preventDefault()
      }

      return
    }

    if (this._allSelected && this._onKeydownAllSelected(event)) {
      return
    }

    const section = this._getSection(this._getSectionIndex(target))

    if ((key === ARROW_UP_KEY || key === ARROW_DOWN_KEY) && !hasShortcutModifier(event)) {
      event.preventDefault()
      section.value = getIncrementedSectionValue(section, key === ARROW_UP_KEY ? 1 : -1, this._getSectionMax(section))
      this._draft = ''
      this._commitSections(this._sections, true)
      return
    }

    if (key === BACKSPACE_KEY || key === DELETE_KEY) {
      event.preventDefault()

      if (key === BACKSPACE_KEY && section.value === null) {
        this._focusSibling(target, false)
        return
      }

      section.value = null
      this._draft = ''
      this._commitSections(this._sections, true)
      return
    }

    if (isTypedKey(event)) {
      event.preventDefault()
      this._applyCharacter(target, key)
    }
  }

  _onKeydownAllSelected(event: KeyboardEvent): boolean {
    const { key } = event
    const isCharacter = isTypedKey(event)

    if (!isCharacter && key !== BACKSPACE_KEY && key !== DELETE_KEY) {
      return false
    }

    event.preventDefault()
    const firstSection = this._clearAndFocus()

    if (isCharacter) {
      this._applyCharacter(firstSection, key)
    }

    return true
  }

  _focusSectionByKey(sectionElement: HTMLElement, key: string): void {
    const rtl = isRTL(this._element)

    if (key === HOME_KEY || key === END_KEY) {
      const sections = this._getSectionElements()
      sections[key === HOME_KEY ? 0 : sections.length - 1].focus()
      return
    }

    const shouldMoveNext = key === (rtl ? ARROW_LEFT_KEY : ARROW_RIGHT_KEY)
    this._focusSibling(sectionElement, shouldMoveNext)
  }

  _applyCharacter(sectionElement: HTMLElement, character: string): void {
    const section = this._getSection(this._getSectionIndex(sectionElement))
    const result = /^\d$/.test(character) ?
      applyDigitToSection(section, this._draft, character, this._getSectionMax(section)) :
      applyLetterToSection(section, this._draft, character)

    if (!result) {
      return
    }

    this._draft = result.completed ? '' : result.draft
    section.value = result.value
    this._commitSections(this._sections, true)

    if (result.completed) {
      this._focusSibling(sectionElement, true)
    } else {
      this._selectSectionContent(sectionElement)
    }
  }

  _clearAndFocus(): HTMLElement {
    this._setAllSelected(false)
    this._draft = ''
    this._commitSections(setSectionsFromDate(this._sections, null), true)
    const [firstSection] = this._getSectionElements()
    firstSection.focus()
    return firstSection
  }

  _handlePaste(text: string): void {
    if (!text) {
      return
    }

    this._draft = ''

    const sections = this._config.inputDateParse ? null : getSectionsFromString(text, this._sections)

    if (sections) {
      this._commitSections(sections, true)
      return
    }

    const date = this._config.inputDateParse ?
      this._config.inputDateParse(text) :
      getLocalDateFromString(text, this._config.locale)

    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      this._commitSections(setSectionsFromDate(this._sections, date), true)
    }
  }

  _normalizeSections(): void {
    for (const section of this._sections) {
      if (section.type === 'literal' || section.value === null) {
        continue
      }

      const { min } = getSectionBounds(section)
      section.value = Math.min(Math.max(section.value, min), this._getSectionMax(section))
    }

    this._draft = ''
    this._commitSections()
  }

  _commitSections(sections: DateSection[] = this._sections, byUser: boolean = this._userCommit): void {
    this._userCommit = false

    if (byUser && this._getValueKey(sections) !== this._valueKey) {
      this._dismissValidationState()
    }

    this._sections = sections
    this._syncSections()

    const date = this._applyValidationState()
    this._valueKey = this._getValueKey(this._sections)

    if (isSameInstantAs(date, this._date)) {
      return
    }

    this._date = date

    EventHandler.trigger(this._element, this.constructor.eventName(this.constructor.CHANGE_EVENT_NAME), {
      date
    })
  }

  _applyValidationState(): Date | null {
    for (const section of this._sections) {
      if (!this._draft && (section.type === 'day' || section.type === 'week') && section.value !== null && section.value > this._getSectionMax(section)) {
        section.value = this._getSectionMax(section)
        this._syncSections()
      }
    }

    const date = getDateFromSections(this._sections)
    const isFilled = this._sections.some(section => section.type !== 'literal' && section.value !== null)
    const error = this._getValidationError(date, isFilled)
    const isDisabled = error !== null && error !== 'incomplete'
    const value = date && !isDisabled ? formatSections(this._sections) : ''
    const isChanged = this._inputElement!.value !== value

    this._element.classList.toggle(CLASS_NAME_FILLED, isFilled)
    this._rejected = isDisabled

    if (isChanged) {
      this._inputElement!.value = value
    }

    this._updateValidity()

    if (isChanged && this._isBuilt) {
      this._inputElement!.dispatchEvent(new Event('input', { bubbles: true }))
      this._inputElement!.dispatchEvent(new Event('change', { bubbles: true }))
    }

    if (error !== this._error) {
      this._error = error

      EventHandler.trigger(this._element, this.constructor.eventName('errorChange'), {
        error
      })
      this._syncDescription()
    }

    return isDisabled ? null : date
  }

  _runAsUser(action: () => void): void {
    const previous = this._userCommit
    this._userCommit = true

    try {
      action()
    } finally {
      this._userCommit = previous
    }
  }

  _setOwnerDismiss(onDismiss: (serial: number) => void): void {
    this._onDismissValidationState = onDismiss
  }

  _setOwnerState(givenState: ValidationState | undefined, isInvalid = false): void {
    this._ownerState = givenState
    this._ownerInvalid = isInvalid
    this._updateValidity()
  }

  _updateValidity(): void {
    const givenState = getValidationState(this._config.validationState) ??
      getValidationState(null, this._serverClasses.includes(CLASS_NAME_IS_VALID), this._serverClasses.includes(CLASS_NAME_IS_INVALID)) ??
      this._ownerState

    setStateValidity(this._inputElement!, givenState === 'invalid' && !this._config.disabled)

    const ownState = this._rejected ? 'invalid' : givenState ?? this._userValidity.read()
    const state = this._ownerInvalid && ownState !== 'invalid' ? undefined : ownState
    const stateClass = state ? `is-${state}` : null
    const isInvalid = state === 'invalid' || this._ownerInvalid

    if (stateClass !== this._stateClass) {
      if (this._stateClass && this._ownsStateClass) {
        this._element.classList.remove(this._stateClass)
      }

      this._ownsStateClass = stateClass !== null && !this._element.classList.contains(stateClass)

      if (this._ownsStateClass) {
        this._element.classList.add(stateClass!)
      }

      this._stateClass = stateClass
    }

    for (const section of this._getSectionElements()) {
      if (isInvalid) {
        section.setAttribute('aria-invalid', 'true')
      } else {
        section.removeAttribute('aria-invalid')
      }
    }

    this._syncDescription()
  }

  _dismissValidationState(serial: number = Number.POSITIVE_INFINITY): void {
    if (this._stateSerial <= serial) {
      this._config.validationState = null
      this._serverClasses = []
    }

    this._onDismissValidationState?.(serial)
  }

  _syncDescription(): void {
    const isAnnouncedInvalid = this._getSectionElements()[0]?.getAttribute('aria-invalid') === 'true'
    const describedBy = [...new Set([
      ...(this._element.getAttribute('aria-describedby') ?? '').split(/\s+/),
      ...(isAnnouncedInvalid ? getFeedbackIds(this._inputElement!) : [])
    ])].filter(Boolean).join(' ')

    for (const [index, element] of this._getSectionElements().entries()) {
      if (describedBy && (index === 0 || isAnnouncedInvalid)) {
        element.setAttribute('aria-describedby', describedBy)
      } else {
        element.removeAttribute('aria-describedby')
      }
    }
  }

  _getValidationError(date: Date | null, isFilled: boolean): string | null {
    if (!(date instanceof Date)) {
      if (!isFilled) {
        return null
      }

      const root = this._element.getRootNode() as Document | ShadowRoot

      return !this._element.contains(root.activeElement) && isBeforeYearOne(this._sections) ? 'minDate' : 'incomplete'
    }

    return getDateLimitError(this._sections, date, this._minDate, this._maxDate, this._config.disabledDates)
  }

  _restoreAttribute(name: string, value: string | null): void {
    if (value === null) {
      this._element.removeAttribute(name)
      return
    }

    this._element.setAttribute(name, value)
  }

  _createSectionInput(): void {
    const { disabled, name, readonly, required } = this._config

    this._element.classList.add(CLASS_NAME_FORM_CONTROL, CLASS_NAME_SECTION_INPUT)
    this._hostDisabledClass = toggleHostClass(this._element, CLASS_NAME_DISABLED, disabled, this._hostDisabledClass)
    this._element.setAttribute('role', 'group')

    if (!this._hostAriaLabel) {
      this._element.setAttribute('aria-label', this._getAriaLabel())
    }

    this._element.innerHTML = ''

    for (const section of this._sections) {
      const element = document.createElement('span')

      if (section.type === 'literal') {
        element.className = CLASS_NAME_SEPARATOR
        element.setAttribute('aria-hidden', 'true')
        element.textContent = section.value
        this._element.append(element)
        continue
      }

      const { min, max } = getSectionBounds(section)
      const labelKey = `aria${section.type[0].toUpperCase()}${section.type.slice(1)}Label`
      const attributes: Record<string, string> = {
        role: 'spinbutton',
        inputmode: section.names ? 'text' : 'numeric',
        autocorrect: 'off',
        spellcheck: 'false',
        'aria-label': this._config[labelKey] || this.constructor.Default[labelKey],
        'aria-valuemin': String(min),
        'aria-valuemax': String(max),
        'data-coreui-section': section.type
      }

      if (disabled) {
        attributes['aria-disabled'] = 'true'
      } else {
        attributes.contenteditable = 'true'
      }

      if (readonly) {
        attributes['aria-readonly'] = 'true'
      }

      if (required) {
        attributes['aria-required'] = 'true'
      }

      element.className = CLASS_NAME_SECTION

      for (const [attribute, value] of Object.entries(attributes)) {
        element.setAttribute(attribute, value)
      }

      this._element.append(element)
    }

    if (!this._inputElement) {
      this._inputElement = document.createElement('textarea')
      this._inputElement.autocomplete = 'off'
      this._inputElement.tabIndex = -1
      this._inputElement.setAttribute('aria-hidden', 'true')
    }

    this._inputElement.defaultValue = this._isBuilt ? this._getResetValue() : ''
    this._inputElement.disabled = disabled
    this._inputElement.readOnly = readonly
    this._inputElement.required = required

    if (name) {
      this._inputElement.name = name
    } else {
      this._inputElement.removeAttribute('name')
    }

    this._element.append(this._inputElement)
    this._syncSections()
    this._setTabIndexes()
  }

  _syncSections(): void {
    for (const [index, sectionElement] of this._getSectionElements().entries()) {
      const section = this._getSection(index)
      const placeholder = this._config[`${section.type}Placeholder`] || section.placeholder ||
        (DefaultPlaceholders as Record<string, string>)[section.type].slice(0, section.length)

      sectionElement.textContent = formatSectionValue(section, placeholder)
      sectionElement.classList.toggle(CLASS_NAME_SECTION_EMPTY, section.value === null)

      if (section.type === 'day' || section.type === 'week') {
        sectionElement.setAttribute('aria-valuemax', String(this._getSectionMax(section)))
      }

      sectionElement.setAttribute('aria-valuetext', getSectionValueText(section, this._config.locale))

      if (section.value === null) {
        sectionElement.removeAttribute('aria-valuenow')
      } else {
        sectionElement.setAttribute('aria-valuenow', String(section.type === 'year' ? getFullYearFromSection(section) : section.value))
      }
    }
  }

  _setTabIndexes(activeElement: HTMLElement | null = null): void {
    const sectionElements = this._getSectionElements()
    const focusableElement = activeElement || sectionElements[0]

    for (const sectionElement of sectionElements) {
      sectionElement.tabIndex = !this._config.disabled && sectionElement === focusableElement ? 0 : -1
    }
  }

  _selectSectionContent(sectionElement: HTMLElement): void {
    this._setAllSelected(false)
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(sectionElement)
    selection!.removeAllRanges()
    selection!.addRange(range)
  }

  _setAllSelected(allSelected: boolean): void {
    this._allSelected = allSelected
    this._element.classList.toggle(CLASS_NAME_ALL_SELECTED, allSelected)
  }

  _focusSibling(sectionElement: HTMLElement, shouldMoveNext: boolean): void {
    const sections = this._getSectionElements()
    const sibling = getNextActiveElement(sections, sectionElement, shouldMoveNext)

    if (sibling && sibling !== sectionElement) {
      sibling.focus()
    }
  }

  _getSectionMax(section: EditableSection): number {
    if (section.type === 'day') {
      return getDaySectionMax(this._sections)
    }

    if (section.type === 'week') {
      return getWeekSectionMax(this._sections)
    }

    return getSectionBounds(section).max
  }

  _isEditable(): boolean {
    return !this._config.disabled && !this._config.readonly
  }

  _getSection(index: number): EditableSection {
    return this._sections.filter(isEditableSection)[index]
  }

  _getSectionIndex(sectionElement: HTMLElement): number {
    return this._getSectionElements().indexOf(sectionElement)
  }

  _getSectionElements(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_SECTION, this._element)
  }

  abstract _getDefaultSections(locale: string): DateSection[]
}

export default SectionInput
