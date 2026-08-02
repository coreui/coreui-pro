/**
 * --------------------------------------------------------------------------
 * CoreUI PRO section-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { convertToDateObject, getLocalDateFromString, isDateDisabled } from './util/calendar.js'
import {
  applyDigitToSection,
  applyLetterToSection,
  formatSections,
  formatSectionValue,
  getDateFromSections,
  getDaySectionMax,
  getFullYearFromSection,
  getIncrementedSectionValue,
  getSectionBounds,
  getSectionsFromFormat,
  getSectionsFromString,
  getWeekSectionMax,
  setSectionsFromDate
} from './util/date-sections.js'
import type { ComponentConfig } from './util/config.js'
import type { DateSection } from './util/date-sections.js'
import { getNextActiveElement } from './util/index.js'

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
const CLASS_NAME_WAS_VALIDATED = 'was-validated'
const CLASS_NAME_SECTION = 'form-date-time-section'
const CLASS_NAME_SECTION_EMPTY = 'form-date-time-section-empty'
const CLASS_NAME_SEPARATOR = 'form-date-time-separator'

const SELECTOR_SECTION = '.form-date-time-section'

export type SectionInputConfig = {
  ariaLabel: string
  autofocus: boolean
  date: Date | number | string | null
  disabled: boolean
  disabledDates: any
  format: ((locale: string) => DateSection[]) | string | null
  inputDateParse: ((value: string) => Date | null) | null
  invalid: boolean
  locale: string
  maxDate: Date | number | string | null
  minDate: Date | number | string | null
  monthNames: string[] | null
  name: string | null
  placeholders: Record<string, string> | null
  readonly: boolean
  required: boolean
  sectionLabels: Record<string, string> | null
  valid: boolean
}

const Default: SectionInputConfig = {
  ariaLabel: 'Date input',
  autofocus: false,
  date: null,
  disabled: false,
  disabledDates: null,
  format: null,
  inputDateParse: null,
  invalid: false,
  locale: 'default',
  maxDate: null,
  minDate: null,
  monthNames: null,
  name: null,
  placeholders: null,
  readonly: false,
  required: false,
  sectionLabels: null,
  valid: false
}

const DefaultType: Record<string, string> = {
  ariaLabel: 'string',
  autofocus: 'boolean',
  date: '(date|number|string|null)',
  disabled: 'boolean',
  disabledDates: '(array|date|function|null)',
  format: '(function|string|null)',
  inputDateParse: '(function|null)',
  invalid: 'boolean',
  locale: 'string',
  maxDate: '(date|number|string|null)',
  minDate: '(date|number|string|null)',
  monthNames: '(array|null)',
  name: '(string|null)',
  placeholders: '(object|null)',
  readonly: 'boolean',
  required: 'boolean',
  sectionLabels: '(object|null)',
  valid: 'boolean'
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

const DefaultSectionLabels = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  quarter: 'Quarter',
  year: 'Year',
  hour: 'Hour',
  minute: 'Minute',
  second: 'Second',
  meridiem: 'AM/PM'
}

/**
 * Class definition
 */

class SectionInput extends BaseComponent {
  declare ['constructor']: typeof SectionInput
  protected declare _date: any
  protected declare _minDate: any
  protected declare _maxDate: any
  protected declare _sections: DateSection[]
  protected declare _draft: any
  protected declare _allSelected: any
  protected declare _error: any
  protected declare _inputElement: any
  protected declare _monthFormatter: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._config = this._getConfig(config)
    this._date = this._config.date ? this._convertDate(this._config.date) : null
    this._minDate = this._convertDate(this._config.minDate)
    this._maxDate = this._convertDate(this._config.maxDate)
    this._sections = setSectionsFromDate(this._resolveSections(), this._date)
    this._date = getDateFromSections(this._sections)
    this._draft = ''
    this._allSelected = false
    this._error = null
    this._inputElement = null
    this._monthFormatter = new Intl.DateTimeFormat(this._config.locale, { month: 'long' })

    this._createSectionInput()
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
    this._sections = setSectionsFromDate(this._sections, null)
    this._draft = ''
    this._syncSections()
    this._updateDate()
  }

  reset(): void {
    this._date = this._config.date ? this._convertDate(this._config.date) : null
    this._sections = setSectionsFromDate(this._sections, this._date)
    this._date = getDateFromSections(this._sections)
    this._draft = ''
    this._syncSections()
    this._setHiddenInputValue()
    this._element.classList.toggle(CLASS_NAME_FILLED, this._date !== null)
    this._element.classList.remove(CLASS_NAME_IS_INVALID)
  }

  getDate(): Date | null {
    return this._date
  }

  update(config: any): void {
    if (typeof config !== 'object') {
      return
    }

    this._config = { ...this._config, ...config }
    this._typeCheckConfig(this._config)

    this._date = this._config.date ? this._convertDate(this._config.date) : null
    this._minDate = this._convertDate(this._config.minDate)
    this._maxDate = this._convertDate(this._config.maxDate)
    this._sections = setSectionsFromDate(this._resolveSections(), this._date)
    this._date = getDateFromSections(this._sections)
    this._draft = ''
    this._monthFormatter = new Intl.DateTimeFormat(this._config.locale, { month: 'long' })

    this._createSectionInput()
  }

  // Private
  // The stub takes no parameter at runtime; subclasses read the locale. The
  // overload keeps both shapes typed without changing the emitted arity.
  _getDefaultSections(locale?: string): DateSection[]
  _getDefaultSections(): DateSection[] {
    throw new Error('Method "_getDefaultSections" must be implemented.')
  }

  _convertDate(value: any): Date | null {
    return convertToDateObject(value, 'day', this._config.locale)
  }

  _resolveSections(): DateSection[] {
    const { format, locale, monthNames } = this._config

    if (typeof format === 'function') {
      return format(locale)
    }

    if (typeof format === 'string' && format.length > 0) {
      return getSectionsFromFormat(format, locale, monthNames)
    }

    return this._getDefaultSections(locale)
  }

  _addEventListeners(): void {
    const eventName = (name: string) => this.constructor.eventName(name)

    EventHandler.on(this._element, eventName('keydown'), SELECTOR_SECTION, (event: any) => {
      this._onKeydown(event)
    })

    EventHandler.on(this._element, eventName('beforeinput'), SELECTOR_SECTION, (event: any) => {
      event.preventDefault()

      if (!this._isEditable() || event.inputType !== 'insertText' || !event.data) {
        return
      }

      if (/^\d$/.test(event.data)) {
        this._applyDigit(event.target, event.data)
        return
      }

      if (event.data.length === 1) {
        this._applyLetter(event.target, event.data)
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
        this._allSelected = false
        this._element.classList.remove(CLASS_NAME_ALL_SELECTED)
        this._normalizeSections()
      }
    })

    EventHandler.on(this._element, eventName('paste'), (event: any) => {
      event.preventDefault()

      if (this._isEditable()) {
        this._handlePaste(event.clipboardData.getData('text'))
      }
    })

    EventHandler.on(this._element, eventName('copy'), (event: any) => {
      if (this._allSelected) {
        event.preventDefault()
        event.clipboardData.setData('text/plain', formatSections(this._sections))
      }
    })

    EventHandler.on(this._element, eventName('cut'), (event: any) => {
      if (this._allSelected) {
        event.preventDefault()
        event.clipboardData.setData('text/plain', formatSections(this._sections))

        if (this._isEditable()) {
          this.clear()
          this._getSectionElements()[0].focus()
        }
      }
    })

    const form = this._element.closest('form')

    if (form) {
      EventHandler.on(form, eventName('submit'), () => {
        // Defer to a microtask so a page handler adding `.was-validated`
        // during the same submit is taken into account regardless of
        // listener order.
        queueMicrotask(() => {
          if (!form.classList.contains(CLASS_NAME_WAS_VALIDATED)) {
            return
          }

          // Keep a live out-of-range invalid state; otherwise the field is
          // invalid only when required and empty.
          const isInvalid = this._element.classList.contains(CLASS_NAME_IS_INVALID) ||
            (this._config.required && this._date === null)

          this._element.classList.toggle(CLASS_NAME_IS_INVALID, isInvalid)
          this._element.classList.toggle(CLASS_NAME_IS_VALID, !isInvalid)
        })
      })
    }

    EventHandler.on(this._element, eventName('click'), (event: any) => {
      if (this._config.disabled || event.target.closest(SELECTOR_SECTION)) {
        return
      }

      const sections = this._getSectionElements()
      const firstEmpty = sections.find((sectionElement, index) => this._getSection(index).value === null)
      const target = firstEmpty || sections[0]

      if (target) {
        target.focus()
      }
    })
  }

  _onKeydown(event: any): void {
    const { key, target } = event

    if (key === 'Tab') {
      return
    }

    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'a') {
      event.preventDefault()
      this._selectAllSections()
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

    if (key === ARROW_UP_KEY || key === ARROW_DOWN_KEY) {
      event.preventDefault()
      const section = this._getSection(this._getSectionIndex(target))
      section.value = getIncrementedSectionValue(section, key === ARROW_UP_KEY ? 1 : -1, this._getSectionMax(section))
      this._draft = ''
      this._syncSections()
      this._updateDate()
      return
    }

    if (key === BACKSPACE_KEY || key === DELETE_KEY) {
      event.preventDefault()
      const section = this._getSection(this._getSectionIndex(target))

      if (key === BACKSPACE_KEY && section.value === null) {
        this._focusSibling(target, false)
        return
      }

      section.value = null
      this._draft = ''
      this._syncSections()
      this._updateDate()
      return
    }

    if (/^\d$/.test(key)) {
      event.preventDefault()
      this._applyDigit(target, key)
      return
    }

    if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      this._applyLetter(target, key)
    }
  }

  _onKeydownAllSelected(event: any): boolean {
    const { key } = event

    if (key === BACKSPACE_KEY || key === DELETE_KEY) {
      event.preventDefault()
      this.clear()
      this._getSectionElements()[0].focus()
      return true
    }

    if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      this.clear()
      const firstSection = this._getSectionElements()[0]
      firstSection.focus()

      if (/^\d$/.test(key)) {
        this._applyDigit(firstSection, key)
      } else {
        this._applyLetter(firstSection, key)
      }

      return true
    }

    return false
  }

  // Arrow keys move by visual direction, so they mirror in RTL. The direction
  // is read from the element's computed style rather than isRTL(): the document
  // can be LTR while an ancestor sets dir="rtl" around the field.
  _isRtl(): boolean {
    return window.getComputedStyle(this._element).direction === 'rtl'
  }

  _focusSectionByKey(sectionElement: HTMLElement, key: string): void {
    if (key === HOME_KEY || key === END_KEY) {
      const sections = this._getSectionElements()
      const first = this._isRtl() ? sections.length - 1 : 0
      const last = this._isRtl() ? 0 : sections.length - 1
      sections[key === HOME_KEY ? first : last].focus()
      return
    }

    const shouldMoveNext = key === (this._isRtl() ? ARROW_LEFT_KEY : ARROW_RIGHT_KEY)
    this._focusSibling(sectionElement, shouldMoveNext)
  }

  _applyDigit(sectionElement: HTMLElement, digit: string): void {
    const section = this._getSection(this._getSectionIndex(sectionElement))
    this._applySectionInput(sectionElement, section, applyDigitToSection(section, this._draft, digit, this._getSectionMax(section)))
  }

  _applyLetter(sectionElement: HTMLElement, letter: string): void {
    const section = this._getSection(this._getSectionIndex(sectionElement))
    this._applySectionInput(sectionElement, section, applyLetterToSection(section, this._draft, letter))
  }

  _applySectionInput(sectionElement: HTMLElement, section: DateSection, result: any): void {
    if (!result) {
      return
    }

    const { draft, value, completed } = result

    this._draft = completed ? '' : draft
    section.value = value
    this._syncSections()
    this._updateDate()

    if (completed) {
      this._focusSibling(sectionElement, true)
    } else {
      this._selectSectionContent(sectionElement)
    }
  }

  _handlePaste(text: string): void {
    if (!text) {
      return
    }

    if (this._config.inputDateParse) {
      const date = this._config.inputDateParse(text)

      if (date instanceof Date && !Number.isNaN(date.getTime())) {
        this._sections = setSectionsFromDate(this._sections, date)
        this._syncSections()
        this._updateDate()
      }

      return
    }

    const sections = getSectionsFromString(text, this._sections)

    if (sections) {
      this._sections = sections
      this._syncSections()
      this._updateDate()
      return
    }

    const date = getLocalDateFromString(text, this._config.locale)

    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      this._sections = setSectionsFromDate(this._sections, date)
      this._syncSections()
      this._updateDate()
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
    this._syncSections()
    this._updateDate()
  }

  _updateDate(): void {
    // Sections whose bounds depend on other sections (the day on the month and
    // year, the week on the year) are clamped when those sections change.
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
    const nextDate = isDisabled ? null : date

    this._element.classList.toggle(CLASS_NAME_FILLED, isFilled)
    this._element.classList.toggle(CLASS_NAME_IS_INVALID, isDisabled)
    this._setHiddenInputValue()

    if (error !== this._error) {
      this._error = error

      EventHandler.trigger(this._element, this.constructor.eventName('errorChange'), {
        error
      })
    }

    if (this._isSameDate(nextDate, this._date)) {
      return
    }

    this._date = nextDate

    EventHandler.trigger(this._element, this.constructor.eventName(this.constructor.CHANGE_EVENT_NAME), {
      date: nextDate
    })
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

  _isSameDate(date: Date | null, date2: Date | null): boolean {
    if (date === null || date2 === null) {
      return date === date2
    }

    return date.getTime() === date2.getTime()
  }

  _createSectionInput(): void {
    this._element.classList.add(CLASS_NAME_FORM_CONTROL, CLASS_NAME_SECTION_INPUT)
    this._element.classList.toggle(CLASS_NAME_DISABLED, this._config.disabled)
    this._element.classList.toggle(CLASS_NAME_IS_INVALID, this._config.invalid)
    this._element.classList.toggle(CLASS_NAME_IS_VALID, this._config.valid)
    this._element.setAttribute('role', 'group')
    this._element.setAttribute('aria-label', this._config.ariaLabel)
    this._element.innerHTML = ''

    const sectionLabels = { ...DefaultSectionLabels, ...this._config.sectionLabels }

    for (const section of this._sections) {
      if (section.type === 'literal') {
        const separatorElement = document.createElement('span')
        separatorElement.classList.add(CLASS_NAME_SEPARATOR)
        separatorElement.setAttribute('aria-hidden', 'true')
        separatorElement.textContent = section.value
        this._element.append(separatorElement)
        continue
      }

      const { min, max } = getSectionBounds(section)
      const sectionElement = document.createElement('span')
      sectionElement.classList.add(CLASS_NAME_SECTION)
      sectionElement.setAttribute('role', 'spinbutton')
      sectionElement.setAttribute('inputmode', section.names ? 'text' : 'numeric')
      sectionElement.setAttribute('autocorrect', 'off')
      sectionElement.setAttribute('spellcheck', 'false')
      sectionElement.setAttribute('aria-label', sectionLabels[section.type])
      sectionElement.setAttribute('aria-valuemin', min as any)
      sectionElement.setAttribute('aria-valuemax', max as any)
      sectionElement.dataset.coreuiSection = section.type

      if (!this._config.disabled) {
        sectionElement.contentEditable = 'true'
      }

      if (this._config.disabled) {
        sectionElement.setAttribute('aria-disabled', 'true')
      }

      if (this._config.readonly) {
        sectionElement.setAttribute('aria-readonly', 'true')
      }

      this._element.append(sectionElement)
    }

    this._createHiddenInput()
    this._syncSections()
    this._setTabIndexes()
    this._element.classList.toggle(CLASS_NAME_FILLED, this._sections.some(section => section.type !== 'literal' && section.value !== null))
  }

  _createHiddenInput(): void {
    const hiddenInput = document.createElement('input')
    hiddenInput.type = 'hidden'
    hiddenInput.disabled = this._config.disabled
    hiddenInput.required = this._config.required

    if (this._config.name || this._element.id) {
      hiddenInput.name = this._config.name || `${this.constructor.NAME}-${this._element.id}`
    }

    this._element.append(hiddenInput)
    this._inputElement = hiddenInput
    this._setHiddenInputValue()
  }

  _setHiddenInputValue(): void {
    if (this._inputElement) {
      this._inputElement.value = getDateFromSections(this._sections) ? formatSections(this._sections) : ''
    }
  }

  _syncSections(): void {
    const sectionElements = this._getSectionElements()

    for (const [index, sectionElement] of sectionElements.entries()) {
      const section = this._getSection(index)
      const configuredPlaceholder = this._config.placeholders && this._config.placeholders[section.type]
      const placeholder = configuredPlaceholder || section.placeholder || (DefaultPlaceholders as Record<string, string>)[section.type].slice(0, section.length)

      sectionElement.textContent = formatSectionValue(section, placeholder)
      sectionElement.classList.toggle(CLASS_NAME_SECTION_EMPTY, section.value === null)

      if (section.type === 'day') {
        sectionElement.setAttribute('aria-valuemax', this._getSectionMax(section) as any)
      }

      if (section.value === null) {
        sectionElement.removeAttribute('aria-valuenow')
        sectionElement.setAttribute('aria-valuetext', 'Empty')
        continue
      }

      const value = section.type === 'year' ? getFullYearFromSection(section) : section.value
      sectionElement.setAttribute('aria-valuenow', value)
      sectionElement.setAttribute('aria-valuetext', this._getSectionValueText(section, value))
    }
  }

  _getSectionValueText(section: DateSection, value: any): string {
    if (section.names) {
      return section.names[section.value - 1]
    }

    if (section.type === 'month') {
      return this._monthFormatter.format(new Date(2000, section.value - 1, 1))
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
    this._allSelected = false
    this._element.classList.remove(CLASS_NAME_ALL_SELECTED)
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(sectionElement)
    selection!.removeAllRanges()
    selection!.addRange(range)
  }

  _selectAllSections(): void {
    this._allSelected = true
    this._element.classList.add(CLASS_NAME_ALL_SELECTED)
  }

  _focusSibling(sectionElement: HTMLElement, shouldMoveNext: boolean): void {
    const sections = this._getSectionElements()
    const sibling = getNextActiveElement(sections, sectionElement, shouldMoveNext)

    if (sibling && sibling !== sectionElement) {
      sibling.focus()
    }
  }

  _getSectionMax(section: DateSection): number {
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

  _getSection(index: number): DateSection {
    return this._sections.filter(section => section.type !== 'literal')[index]
  }

  _getSectionIndex(sectionElement: HTMLElement): number {
    return this._getSectionElements().indexOf(sectionElement)
  }

  _getSectionElements(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_SECTION, this._element)
  }

  // Static
  static componentInterface(element: string | Element | null, config?: any): void {
    const data: any = this.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }
}

export default SectionInput
