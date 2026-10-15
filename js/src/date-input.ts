/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-input.js
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
  getTimeSectionsFromLocale,
  getWeekSectionMax,
  hasShortcutModifier,
  isBeforeYearOne,
  isEditableSection,
  isTypedKey,
  setSectionsFromDate
} from './util/date-sections.js'
import type {
  DateSection, EditableSection, SectionFormat, SectionInputType
} from './util/date-sections.js'
import { onLabelClick } from './util/field-label.js'
import FieldValidation from './util/field-validation.js'
import { containsFocus } from './util/focus.js'
import { captureHostClasses, type HostClasses, restoreHostClasses } from './util/form-control-group.js'
import { type ValidationState } from './util/form-validation.js'
import {
  defineJQueryPlugin, getNextActiveElement, isRTL, jQueryDispatch, writeAttribute
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'date-input'
const DATA_KEY = 'coreui.date-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

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
const CLASS_NAME_SECTION = 'form-date-time-section'
const CLASS_NAME_SECTION_EMPTY = 'form-date-time-section-empty'
const CLASS_NAME_SEPARATOR = 'form-date-time-separator'

const HOST_CLASS_NAMES = [
  CLASS_NAME_ALL_SELECTED,
  CLASS_NAME_DISABLED,
  CLASS_NAME_FILLED,
  CLASS_NAME_FORM_CONTROL,
  CLASS_NAME_SECTION_INPUT
]

const SELECTOR_DATA_DATE_INPUT = '[data-coreui-date-input]'
const SELECTOR_SECTION = '.form-date-time-section'
const SELECTOR_VALUE_FIELD = 'textarea'

const ARIA_LABELS: Record<SectionInputType, string> = {
  date: 'Date input',
  datetime: 'Date and time input',
  time: 'Time input'
}

type DateInputConfig = {
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
  seconds: boolean
  type: SectionInputType
  validationState: ValidationState | null
  weekPlaceholder: string | null
  yearPlaceholder: string | null
}

const Default: DateInputConfig = {
  ariaDayLabel: 'Day',
  ariaHourLabel: 'Hour',
  ariaLabel: ARIA_LABELS.date,
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
  seconds: false,
  type: 'date',
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
  seconds: 'boolean',
  type: 'string',
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

class DateInput<C extends Partial<DateInputConfig> = DateInputConfig> extends BaseComponent {
  declare ['constructor']: typeof DateInput & typeof BaseComponent
  protected declare _date: Date | null
  protected declare _minDate: Date | null
  protected declare _maxDate: Date | null
  protected declare _sections: DateSection[]
  protected declare _draft: string
  protected declare _allSelected: boolean
  protected declare _error: string | null
  protected declare _errorHolds: number
  protected declare _hostAriaLabel: string | null
  protected declare _hostClasses: HostClasses
  protected declare _hostNodes: ChildNode[]
  protected declare _hostRole: string | null
  protected declare _inputElement: HTMLTextAreaElement | null
  protected declare _initialDate: Date | null
  protected declare _isBuilt: boolean
  protected declare _rejected: boolean
  protected declare _removeLabelClick: () => void
  protected declare _reportedDate: Date | null
  declare _validation: FieldValidation
  protected declare _validationError: string | null
  protected declare _valueKey: string

  constructor(element?: string | Element | null, config?: Partial<C> | null) {
    super(element, config)

    this._applyConfig()
    this._date = getDateFromSections(this._sections)
    this._allSelected = false
    this._error = null
    this._errorHolds = 0
    this._inputElement = null
    this._isBuilt = false
    this._rejected = false
    this._validationError = null
    this._hostAriaLabel = this._element.getAttribute('aria-label')
    this._hostClasses = captureHostClasses(this._element, HOST_CLASS_NAMES)
    this._hostNodes = [...this._element.childNodes]
    this._hostRole = this._element.getAttribute('role')
    this._validation = new FieldValidation(this._element, {
      config: () => this._config as DateInputConfig,
      fields: () => [this._inputElement!],
      frames: () => [this._element],
      invalidTargets: () => this._getSectionElements(),
      ownError: () => this._rejected,
      pageDescribed: isInvalid => [this._element, ...this._getSectionElements().filter((_, index) => index === 0 || isInvalid)],
      restore: () => this.reset()
    })

    this._createSectionInput()
    this._initialDate = getDateFromSections(this._sections)
    this._applyValidationState()
    this._reportedDate = this._date
    this._announceError()
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

  static override get NAME(): string {
    return NAME
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
    const stateOnly = keys.length === 1 && keys[0] === 'validationState'
    const sections = this._sections

    this._config = this._getConfig(stateOnly ? { ...this._config, ...config } : { ...this._config, date: getDateFromSections(sections), ...config })

    if (this._validation.configure(config)) {
      return
    }

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
    this._validation.dispose()
    restoreHostClasses(this._element, HOST_CLASS_NAMES, this._hostClasses)

    if (!this._hostAriaLabel) {
      writeAttribute(this._element, 'aria-label', this._hostAriaLabel)
    }

    writeAttribute(this._element, 'role', this._hostRole)
    this._element.replaceChildren(...this._hostNodes)
    super.dispose()
  }

  // Private
  _getAriaLabel(): string {
    const { type } = this._config
    const ariaLabel = this._config.ariaLabel || this.constructor.Default.ariaLabel

    return ariaLabel === ARIA_LABELS.date && Object.hasOwn(ARIA_LABELS, type) ? ARIA_LABELS[type as SectionInputType] : ariaLabel
  }

  _convertDate(value: any): Date | null {
    return convertValue(value, this._config.type, this._config.locale)
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
      this._runAsUser(() => this._commitSections())
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
      this._runAsUser(() => this._commitSections())
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
    this._runAsUser(() => this._commitSections())

    if (result.completed) {
      this._focusSibling(sectionElement, true)
    } else {
      this._selectSectionContent(sectionElement)
    }
  }

  _clearAndFocus(): HTMLElement {
    this._setAllSelected(false)
    this._draft = ''
    this._runAsUser(() => this._commitSections(setSectionsFromDate(this._sections, null)))
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
      this._runAsUser(() => this._commitSections(sections))
      return
    }

    const date = this._config.inputDateParse ?
      this._config.inputDateParse(text) :
      getLocalDateFromString(text, this._config.locale)

    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      this._runAsUser(() => this._commitSections(setSectionsFromDate(this._sections, date)))
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

  _commitSections(sections: DateSection[] = this._sections): void {
    if (this._getValueKey(sections) !== this._valueKey) {
      this._validation.change()
    }

    this._sections = sections
    this._syncSections()

    const value = this._applyValidationState()
    this._valueKey = this._getValueKey(this._sections)

    if (value !== null) {
      this._inputElement!.dispatchEvent(new Event('input', { bubbles: true }))

      if (this._inputElement?.value === value) {
        this._inputElement.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    if (!isSameInstantAs(this._date, this._reportedDate)) {
      this._reportedDate = this._date

      EventHandler.trigger(this._element, this.constructor.eventName(this.constructor.CHANGE_EVENT_NAME), {
        date: this._date
      })
    }

    this._announceError()
  }

  _applyValidationState(): string | null {
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

    this._date = isDisabled ? null : date
    this._validationError = error
    this._validation.update()

    return isChanged && this._isBuilt ? value : null
  }

  _announceError(): void {
    if (this._errorHolds || this._validationError === this._error) {
      return
    }

    this._error = this._validationError

    EventHandler.trigger(this._element, this.constructor.eventName('errorChange'), {
      error: this._error
    })
    this._validation.update()
  }

  _holdErrors(hold: boolean): void {
    this._errorHolds += hold ? 1 : -1
    this._announceError()
  }

  _runAsUser(action: () => void): void {
    this._validation.runAsUser(action)
  }

  _getValidationError(date: Date | null, isFilled: boolean): string | null {
    if (!(date instanceof Date)) {
      if (!isFilled) {
        return null
      }

      return !containsFocus(this._element) && isBeforeYearOne(this._sections) ? 'minDate' : 'incomplete'
    }

    return getDateLimitError(this._sections, date, this._minDate, this._maxDate, this._config.disabledDates)
  }

  _createSectionInput(): void {
    const { disabled, name, readonly, required } = this._config

    this._element.classList.add(CLASS_NAME_FORM_CONTROL, CLASS_NAME_SECTION_INPUT)
    this._element.classList.toggle(CLASS_NAME_DISABLED, disabled)
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
    this._validation.refresh()
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

  _getDefaultSections(locale: string): DateSection[] {
    const { seconds, type } = this._config

    return type === 'time' ?
      getTimeSectionsFromLocale(locale, seconds) :
      getSectionLayout(null, locale, null, type === 'datetime' && { seconds })
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, DateInput, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const dateInput of SelectorEngine.find(SELECTOR_DATA_DATE_INPUT)) {
    DateInput.getOrCreateInstance(dateInput)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DateInput)

export default DateInput
export type { DateInputConfig }
