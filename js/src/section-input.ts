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
  type DisabledDate, getLocalDateFromString, isDateDisabled, isSameInstantAs
} from './util/calendar.js'
import {
  applyDigitToSection,
  applyLetterToSection,
  convertValue,
  formatSections,
  formatSectionValue,
  getDateFromSections,
  getDateWithin,
  getDaySectionMax,
  getFullYearFromSection,
  getIncrementedSectionValue,
  getSectionBounds,
  getSectionLayout,
  getSectionsFromString,
  getWeekSectionMax,
  isEditableSection,
  setSectionsFromDate
} from './util/date-sections.js'
import type { ComponentConfig } from './util/config.js'
import type { DateSection, EditableSection, SectionFormat } from './util/date-sections.js'
import { captureHostClasses, type HostClasses, restoreHostClasses } from './util/form-control-group.js'
import { getNextActiveElement, isRTL } from './util/index.js'

/**
 * Constants
 */

const ARROW_DOWN_KEY = 'ArrowDown'
const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'
const ARROW_UP_KEY = 'ArrowUp'
const BACKSPACE_KEY = 'Backspace'
const DELETE_KEY = 'Delete'
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
  CLASS_NAME_DISABLED,
  CLASS_NAME_FILLED,
  CLASS_NAME_FORM_CONTROL,
  CLASS_NAME_IS_INVALID,
  CLASS_NAME_IS_VALID,
  CLASS_NAME_SECTION_INPUT
]

const SELECTOR_FORM_VALIDATE = '[data-coreui-validate]'
const SELECTOR_FORM_VALIDATE_VALID = '[data-coreui-validate~="valid"]'
const SELECTOR_SECTION = '.form-date-time-section'

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
  invalid: boolean
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
  valid: boolean
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
  invalid: false,
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
  valid: false,
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
  invalid: 'boolean',
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
  valid: 'boolean',
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

abstract class SectionInput extends BaseComponent {
  declare ['constructor']: typeof SectionInput & typeof BaseComponent
  protected declare _date: Date | null
  protected declare _minDate: Date | null
  protected declare _maxDate: Date | null
  protected declare _sections: DateSection[]
  protected declare _draft: string
  protected declare _allSelected: boolean
  protected declare _error: string | null
  protected declare _hostAriaLabel: string | null
  protected declare _hostClasses: HostClasses
  protected declare _hostNodes: ChildNode[]
  protected declare _hostRole: string | null
  protected declare _inputElement: HTMLInputElement | null
  protected declare _monthFormatter: Intl.DateTimeFormat
  protected declare _form: HTMLFormElement | null
  protected declare _initialDate: Date | null
  protected declare _resetHandler: () => void
  protected declare _submitHandler: () => void
  protected declare _submitValid: boolean

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._applyConfig()
    this._date = getDateFromSections(this._sections)
    this._allSelected = false
    this._error = null
    this._inputElement = null
    this._form = null
    this._resetHandler = () => {
      setTimeout(() => {
        if (this._element) {
          this.reset()
        }
      })
    }

    this._submitHandler = () => this._onFormSubmit()
    this._submitValid = false
    this._hostAriaLabel = this._element.getAttribute('aria-label')
    this._hostClasses = captureHostClasses(this._element, HOST_CLASS_NAMES)
    this._hostNodes = [...this._element.childNodes]
    this._hostRole = this._element.getAttribute('role')

    this._createSectionInput()
    this._date = this._applyValidationState()
    this._initialDate = this._date
    this._addEventListeners()

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
    this._commitSections(setSectionsFromDate(this._sections, this._initialDate))
  }

  getDate(): Date | null {
    return this._date
  }

  isDateSelectable(date: Date | null): boolean {
    const normalized = date instanceof Date ? getDateWithin(this._sections, date) : null

    return normalized !== null && this._getValidationError(normalized, true) === null
  }

  setConfig(config: ComponentConfig | null): void {
    if (typeof config !== 'object') {
      return
    }

    this._config = this._getConfig({ ...this._config, ...config })
    this._applyConfig()
    this._createSectionInput()
    this._commitSections()
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    EventHandler.off(this._form, this.constructor.eventName('reset'), this._resetHandler)
    EventHandler.off(this._form, this.constructor.eventName('submit'), this._submitHandler)
    restoreHostClasses(this._element, HOST_CLASS_NAMES, this._hostClasses)
    this._restoreAttribute('aria-label', this._hostAriaLabel)
    this._restoreAttribute('role', this._hostRole)
    this._element.replaceChildren(...this._hostNodes)
    super.dispose()
  }

  // Private
  _getAriaLabel(): string {
    return this._config.ariaLabel
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
    this._monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' })
  }

  _addEventListeners(): void {
    const eventName = (name: string) => this.constructor.eventName(name)

    EventHandler.on(this._element, eventName('keydown'), SELECTOR_SECTION, (event: any) => {
      this._onKeydown(event)
    })

    EventHandler.on(this._element, eventName('beforeinput'), SELECTOR_SECTION, (event: any) => {
      event.preventDefault()

      if (this._isEditable() && event.inputType === 'insertText' && event.data?.length === 1) {
        this._applyCharacter(event.target, event.data)
      }
    })

    EventHandler.on(this._element, eventName('focusin'), SELECTOR_SECTION, (event: any) => {
      this._draft = ''
      this._setTabIndexes(event.target)
      this._selectSectionContent(event.target)
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

    this._form = this._element.closest('form')

    if (this._form) {
      EventHandler.on(this._form, eventName('reset'), this._resetHandler)
      EventHandler.on(this._form, eventName('submit'), this._submitHandler)
    }

    EventHandler.on(this._element, eventName('click'), (event: any) => {
      if (this._config.disabled || event.target.closest(SELECTOR_SECTION)) {
        return
      }

      const sections = this._getSectionElements()
      const target = sections.find((sectionElement, index) => this._getSection(index).value === null) || sections[0]

      target?.focus()
    })
  }

  _onFormSubmit(): void {
    const form = this._form!

    queueMicrotask(() => {
      if (!this._element || !form.matches(SELECTOR_FORM_VALIDATE)) {
        return
      }

      const isInvalid = this._element.classList.contains(CLASS_NAME_IS_INVALID) ||
        (this._config.required && this._date === null)

      this._submitValid = !isInvalid && form.matches(SELECTOR_FORM_VALIDATE_VALID)
      this._element.classList.toggle(CLASS_NAME_IS_INVALID, isInvalid)
      this._element.classList.toggle(CLASS_NAME_IS_VALID, this._submitValid)
    })
  }

  _onKeydown(event: KeyboardEvent): void {
    const { key } = event
    const target = event.target as HTMLElement

    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'a') {
      event.preventDefault()
      this._setAllSelected(true)
      return
    }

    if ([ARROW_LEFT_KEY, ARROW_RIGHT_KEY, HOME_KEY, END_KEY].includes(key)) {
      event.preventDefault()
      this._focusSectionByKey(target, key)
      return
    }

    if (!this._isEditable()) {
      if (key.length === 1) {
        event.preventDefault()
      }

      return
    }

    if (this._allSelected && this._onKeydownAllSelected(event)) {
      return
    }

    const section = this._getSection(this._getSectionIndex(target))

    if ((key === ARROW_UP_KEY || key === ARROW_DOWN_KEY) && !(event.altKey && key === ARROW_DOWN_KEY)) {
      event.preventDefault()
      section.value = getIncrementedSectionValue(section, key === ARROW_UP_KEY ? 1 : -1, this._getSectionMax(section))
      this._draft = ''
      this._commitSections()
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
      this._commitSections()
      return
    }

    if (/^\d$/.test(key) || (key.length === 1 && !event.ctrlKey && !event.metaKey)) {
      event.preventDefault()
      this._applyCharacter(target, key)
    }
  }

  _onKeydownAllSelected(event: KeyboardEvent): boolean {
    const { key } = event
    const isCharacter = key.length === 1 && !event.ctrlKey && !event.metaKey

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
      const first = rtl ? sections.length - 1 : 0
      const last = rtl ? 0 : sections.length - 1
      sections[key === HOME_KEY ? first : last].focus()
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
    this._commitSections()

    if (result.completed) {
      this._focusSibling(sectionElement, true)
    } else {
      this._selectSectionContent(sectionElement)
    }
  }

  _clearAndFocus(): HTMLElement {
    this.clear()
    const [firstSection] = this._getSectionElements()
    firstSection.focus()
    return firstSection
  }

  _handlePaste(text: string): void {
    if (!text) {
      return
    }

    const sections = this._config.inputDateParse ? null : getSectionsFromString(text, this._sections)

    if (sections) {
      this._commitSections(sections)
      return
    }

    const date = this._config.inputDateParse ?
      this._config.inputDateParse(text) :
      getLocalDateFromString(text, this._config.locale)

    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      this._commitSections(setSectionsFromDate(this._sections, date))
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
    this._sections = sections
    this._syncSections()

    const date = this._applyValidationState()

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
      if ((section.type === 'day' || section.type === 'week') && section.value !== null && section.value > this._getSectionMax(section)) {
        section.value = this._getSectionMax(section)
        this._syncSections()
      }
    }

    const date = getDateFromSections(this._sections)
    const isFilled = this._sections.some(section => section.type !== 'literal' && section.value !== null)
    const error = this._getValidationError(date, isFilled)
    const isDisabled = error !== null && error !== 'incomplete'

    this._element.classList.toggle(CLASS_NAME_FILLED, isFilled)
    this._element.classList.toggle(CLASS_NAME_IS_INVALID, isDisabled || this._config.invalid)
    this._element.classList.toggle(
      CLASS_NAME_IS_VALID,
      this._config.valid || (this._submitValid && isFilled && !isDisabled)
    )
    this._inputElement!.value = date ? formatSections(this._sections) : ''

    if (error !== this._error) {
      this._error = error

      EventHandler.trigger(this._element, this.constructor.eventName('errorChange'), {
        error
      })
    }

    return isDisabled ? null : date
  }

  _getValidationError(date: Date | null, isFilled: boolean): string | null {
    if (!(date instanceof Date)) {
      return isFilled ? 'incomplete' : null
    }

    if (this._minDate && date < this._minDate) {
      return 'minDate'
    }

    if (this._maxDate && date > this._maxDate) {
      return 'maxDate'
    }

    if (isDateDisabled(date, null, null, this._config.disabledDates)) {
      return 'disabledDate'
    }

    return null
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
    this._element.classList.toggle(CLASS_NAME_DISABLED, disabled)
    this._element.setAttribute('role', 'group')
    this._element.setAttribute('aria-label', this._getAriaLabel())
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
      const attributes: Record<string, string> = {
        role: 'spinbutton',
        inputmode: section.names ? 'text' : 'numeric',
        autocorrect: 'off',
        spellcheck: 'false',
        'aria-label': this._config[`aria${section.type[0].toUpperCase()}${section.type.slice(1)}Label`],
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

      element.className = CLASS_NAME_SECTION

      for (const [attribute, value] of Object.entries(attributes)) {
        element.setAttribute(attribute, value)
      }

      this._element.append(element)
    }

    this._inputElement = document.createElement('input')
    this._inputElement.type = 'hidden'
    this._inputElement.disabled = disabled
    this._inputElement.required = required

    if (name) {
      this._inputElement.name = name
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

      if (section.type === 'day') {
        sectionElement.setAttribute('aria-valuemax', String(this._getSectionMax(section)))
      }

      if (section.value === null) {
        sectionElement.removeAttribute('aria-valuenow')
        sectionElement.setAttribute('aria-valuetext', 'Empty')
        continue
      }

      const value = section.type === 'year' ? getFullYearFromSection(section)! : section.value
      sectionElement.setAttribute('aria-valuenow', String(value))
      sectionElement.setAttribute('aria-valuetext', this._getSectionValueText(section, value))
    }
  }

  _getSectionValueText(section: EditableSection, value: number): string {
    if (section.names) {
      return section.names[value - 1]
    }

    if (section.type === 'month') {
      return this._monthFormatter.format(new Date(2000, value - 1, 1))
    }

    return String(value)
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
