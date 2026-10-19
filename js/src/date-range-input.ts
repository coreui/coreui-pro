/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-range-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import DateInput, { type DateInputConfig } from './date-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { type DisabledDate, isSameInstantAs } from './util/calendar.js'
import { getForwardedOptions } from './util/composite.js'
import { hasShortcutModifier, type SectionFormat } from './util/date-sections.js'
import FieldValidation from './util/field-validation.js'
import { type ValidationState } from './util/form-validation.js'
import {
  appendControlGroupField,
  applyControlGroupClasses,
  applyControlGroupSize
} from './util/form-control-group.js'
import { SEPARATOR_ICON, SEPARATOR_ICON_RTL } from './util/icons.js'
import { defineJQueryPlugin, isRTL, jQueryDispatch } from './util/index.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'date-range-input'
const DATA_KEY = 'coreui.date-range-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`
const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'

const CLASS_NAME_DATE_RANGE = 'form-date-range'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_SEPARATOR = 'form-control-icon'

const ATTRIBUTE_ROLE_END = 'data-coreui-range-end'
const ATTRIBUTE_ROLE_SEPARATOR = 'data-coreui-range-separator'
const ATTRIBUTE_ROLE_START = 'data-coreui-range-start'

const SELECTOR_DATA_DATE_RANGE_INPUT = '[data-coreui-date-range-input]'
const SELECTOR_ROLE_SEPARATOR = `[${ATTRIBUTE_ROLE_SEPARATOR}]`
const SELECTOR_SECTION = '.form-date-time-section'

type DateRangeInputConfig = {
  allowList: SanitizerAllowList
  ariaDayLabel: string
  ariaEndLabel: string
  ariaHourLabel: string
  ariaMeridiemLabel: string
  ariaMinuteLabel: string
  ariaMonthLabel: string
  ariaQuarterLabel: string
  ariaSecondLabel: string
  ariaStartLabel: string
  ariaWeekLabel: string
  ariaYearLabel: string
  autofocus: boolean
  dayPlaceholder: string | null
  disabled: boolean
  disabledDates: DisabledDate | DisabledDate[] | null
  endDate: Date | string | null
  endFloatingLabel: string | null
  endName: string | null
  format: SectionFormat
  hourPlaceholder: string | null
  inputDateParse: ((value: string) => Date | null) | null
  inputOptions: Partial<DateInputConfig>
  locale: string
  maxDate: Date | string | null
  meridiemPlaceholder: string | null
  minDate: Date | string | null
  minutePlaceholder: string | null
  monthNames: string[] | null
  monthPlaceholder: string | null
  quarterPlaceholder: string | null
  readonly: boolean
  required: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  secondPlaceholder: string | null
  seconds: boolean
  separatorIcon: string
  separatorIconRtl: string
  size: string | null
  startDate: Date | string | null
  startFloatingLabel: string | null
  startName: string | null
  type: 'date' | 'datetime'
  validationState: ValidationState | null
  weekPlaceholder: string | null
  yearPlaceholder: string | null
}

const Default: DateRangeInputConfig = {
  allowList: SVGAllowlist,
  ariaDayLabel: 'Day',
  ariaEndLabel: 'End date',
  ariaHourLabel: 'Hour',
  ariaMeridiemLabel: 'AM/PM',
  ariaMinuteLabel: 'Minute',
  ariaMonthLabel: 'Month',
  ariaQuarterLabel: 'Quarter',
  ariaSecondLabel: 'Second',
  ariaStartLabel: 'Start date',
  ariaWeekLabel: 'Week',
  ariaYearLabel: 'Year',
  autofocus: false,
  dayPlaceholder: null,
  disabled: false,
  disabledDates: null,
  endDate: null,
  endFloatingLabel: null,
  endName: null,
  format: null,
  hourPlaceholder: null,
  inputDateParse: null,
  inputOptions: {},
  locale: navigator.language,
  maxDate: null,
  meridiemPlaceholder: null,
  minDate: null,
  minutePlaceholder: null,
  monthNames: null,
  monthPlaceholder: null,
  quarterPlaceholder: null,
  readonly: false,
  required: false,
  sanitize: true,
  sanitizeFn: null,
  secondPlaceholder: null,
  seconds: false,
  separatorIcon: SEPARATOR_ICON,
  separatorIconRtl: SEPARATOR_ICON_RTL,
  size: null,
  startDate: null,
  startFloatingLabel: null,
  startName: null,
  type: 'date',
  validationState: null,
  weekPlaceholder: null,
  yearPlaceholder: null
}

const ORIGINAL_DEFAULT: DateRangeInputConfig = { ...Default }

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaDayLabel: 'string',
  ariaEndLabel: 'string',
  ariaHourLabel: 'string',
  ariaMeridiemLabel: 'string',
  ariaMinuteLabel: 'string',
  ariaMonthLabel: 'string',
  ariaQuarterLabel: 'string',
  ariaSecondLabel: 'string',
  ariaStartLabel: 'string',
  ariaWeekLabel: 'string',
  ariaYearLabel: 'string',
  autofocus: 'boolean',
  dayPlaceholder: '(string|null)',
  disabled: 'boolean',
  disabledDates: '(array|date|function|null)',
  endDate: '(date|string|null)',
  endFloatingLabel: '(string|null)',
  endName: '(string|null)',
  format: '(function|string|null)',
  hourPlaceholder: '(string|null)',
  inputDateParse: '(function|null)',
  inputOptions: 'object',
  locale: 'string',
  maxDate: '(date|string|null)',
  meridiemPlaceholder: '(string|null)',
  minDate: '(date|string|null)',
  minutePlaceholder: '(string|null)',
  monthNames: '(array|null)',
  monthPlaceholder: '(string|null)',
  quarterPlaceholder: '(string|null)',
  readonly: 'boolean',
  required: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  secondPlaceholder: '(string|null)',
  seconds: 'boolean',
  separatorIcon: 'string',
  separatorIconRtl: 'string',
  size: '(string|null)',
  startDate: '(date|string|null)',
  startFloatingLabel: '(string|null)',
  startName: '(string|null)',
  type: 'string',
  validationState: '(string|null|undefined)',
  weekPlaceholder: '(string|null)',
  yearPlaceholder: '(string|null)'
}

/**
 * Class definition
 */

class DateRangeInput extends BaseComponent {
  protected declare _startInput: any
  protected declare _endInput: any
  protected declare _startElement: HTMLElement
  protected declare _endElement: HTMLElement
  protected declare _separatorElement: HTMLElement
  protected declare _createdElements: HTMLElement[]
  protected declare _hostDescribedBy: string | null
  protected declare _describedFields: [HTMLElement, string | null, string][]
  protected declare _initialStartDate: any
  protected declare _initialEndDate: any
  protected declare _batching: boolean
  protected declare _generation: number
  protected declare _reported: { end: Date | null, start: Date | null }
  declare _validation: FieldValidation

  constructor(element?: string | Element | null, config?: Partial<DateRangeInputConfig> | null) {
    super(element, config)

    this._createdElements = []
    this._hostDescribedBy = this._element.getAttribute('aria-describedby')
    this._describedFields = []
    this._validation = new FieldValidation(this._element, {
      config: () => this._config,
      fields: () => [],
      frames: () => [this._element],
      invalidTargets: () => [],
      ownError: () => !this.isRangeValid()
    })
    this._initialStartDate = config?.startDate ?? this._config.startDate
    this._initialEndDate = config?.endDate ?? this._config.endDate
    this._batching = false
    this._generation = 0

    this._createDateRangeInput()
    this._reported = { end: this.getEndDate(), start: this.getStartDate() }
    this._validation.update()
    this._addEventListeners()
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

  // Public
  getStartDate(): Date | null {
    return this._startInput?.getDate() ?? null
  }

  getEndDate(): Date | null {
    return this._endInput?.getDate() ?? null
  }

  setRange(startDate: Date | null, endDate: Date | null): void {
    this._typeCheckConfig({ endDate, startDate }, { endDate: DefaultType.endDate, startDate: DefaultType.startDate })
    this._applyRange(startDate, endDate)
  }

  clear(): void {
    this._applyRange(null, null)
  }

  reset(): void {
    this._applyRange(this._initialStartDate, this._initialEndDate)
  }

  isDateSelectable(date: Date | null): boolean {
    return this._startInput.isDateSelectable(date)
  }

  getStartElement(): HTMLElement {
    return this._startElement
  }

  getEndElement(): HTMLElement {
    return this._endElement
  }

  isRangeValid(): boolean {
    const start = this.getStartDate()
    const end = this.getEndDate()

    return start === null || end === null || end >= start
  }

  setEndDate(endDate: Date | null): void {
    this.setRange(this.getStartDate(), endDate)
  }

  setStartDate(startDate: Date | null): void {
    this.setRange(startDate, this.getEndDate())
  }

  setValidationState(validationState: ValidationState | null): void {
    this._setConfig({ validationState })
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    for (const element of [this._startElement, this._endElement]) {
      EventHandler.off(element, EVENT_KEY)
    }

    this._startInput.dispose()
    this._endInput.dispose()

    for (const element of this._createdElements) {
      element.remove()
    }

    this._validation.dispose()

    for (const [element, own, written] of this._describedFields) {
      if (element.getAttribute('aria-describedby') !== written) {
        continue
      }

      if (own === null) {
        element.removeAttribute('aria-describedby')
      } else {
        element.setAttribute('aria-describedby', own)
      }
    }

    if (this._hostDescribedBy !== null && !this._element.hasAttribute('aria-describedby')) {
      this._element.setAttribute('aria-describedby', this._hostDescribedBy)
    }

    super.dispose()
  }

  // Private
  _setConfig(config: Partial<DateRangeInputConfig> | null): void {
    if (!config || !('validationState' in config)) {
      return
    }

    this._config = this._getConfig({ ...this._config, validationState: config.validationState })
    this._validation.configure({ validationState: config.validationState })
  }

  _createDateRangeInput(): void {
    applyControlGroupClasses(this._element, CLASS_NAME_INPUT_GROUP, CLASS_NAME_DATE_RANGE)
    applyControlGroupSize(this._element, this._config.size)

    this._element.setAttribute('role', 'group')

    this._startElement = this._createField(ATTRIBUTE_ROLE_START, this._config.startFloatingLabel)
    this._separatorElement = SelectorEngine.findOne(SELECTOR_ROLE_SEPARATOR, this._element) ?? this._createSeparator()
    this._separatorElement.setAttribute('aria-hidden', 'true')
    this._endElement = this._createField(ATTRIBUTE_ROLE_END, this._config.endFloatingLabel)
    this._placeCreatedParts()
    this._moveDescriptionToFields()

    this._startInput = this._createInput(this._startElement, {
      ariaLabel: this._config.startFloatingLabel || this._config.ariaStartLabel || this.constructor.Default.ariaStartLabel,
      date: this._config.startDate,
      name: this._config.startName
    })

    this._endInput = this._createInput(this._endElement, {
      ariaLabel: this._config.endFloatingLabel || this._config.ariaEndLabel || this.constructor.Default.ariaEndLabel,
      date: this._config.endDate,
      name: this._config.endName
    })

    if (this._config.autofocus && !this._config.disabled) {
      SelectorEngine.find(SELECTOR_SECTION, this._startElement)[0]?.focus()
    }
  }

  _createInput(element: HTMLElement, overrides: Record<string, any>): any {
    const forwarded = getForwardedOptions(Object.keys(DateInput.Default), this._config, this.constructor.Default, ORIGINAL_DEFAULT)
    const input = new DateInput(element, {
      ...forwarded, ...overrides, autofocus: false, disabled: this._config.disabled, ...this._config.inputOptions, validationState: null
    })

    this._validation.adopt(input._validation)

    return input
  }

  _moveDescriptionToFields(): void {
    if (this._hostDescribedBy === null) {
      return
    }

    this._element.removeAttribute('aria-describedby')

    for (const element of [this._startElement, this._endElement]) {
      const own = element.getAttribute('aria-describedby')
      const written = own ? `${own} ${this._hostDescribedBy}` : this._hostDescribedBy

      element.setAttribute('aria-describedby', written)
      this._describedFields.push([element, own, written])
    }
  }

  _createField(attribute: string, floatingLabel: string | null): HTMLElement {
    const ownElement = SelectorEngine.findOne(`[${attribute}]`, this._element)

    if (ownElement) {
      return ownElement
    }

    const element = document.createElement('div')
    element.setAttribute(attribute, '')
    this._createdElements.push(appendControlGroupField(this._element, element, floatingLabel, `${NAME}-`))

    return element
  }

  _getHostChild(part: HTMLElement): HTMLElement {
    let child = part

    while (child.parentElement !== this._element) {
      child = child.parentElement as HTMLElement
    }

    return child
  }

  _placeCreatedParts(): void {
    const [start, separator, end] = [this._startElement, this._separatorElement, this._endElement]
      .map(part => this._getHostChild(part))
    const isCreated = (element: HTMLElement) => this._createdElements.includes(element)

    if (isCreated(separator)) {
      if (isCreated(end)) {
        start.after(separator)
      } else if (isCreated(start)) {
        end.before(separator)
      } else {
        this._placeBetweenEnds(separator)
      }
    }

    if (isCreated(start)) {
      separator.before(start)
    }

    if (isCreated(end)) {
      separator.after(end)
    }
  }

  _placeBetweenEnds(separator: HTMLElement): void {
    const start = this._getHostChild(this._startElement)
    const end = this._getHostChild(this._endElement)
    const children = [...this._element.children]

    if (children.indexOf(start) <= children.indexOf(end)) {
      end.before(separator)
    } else {
      end.after(separator)
    }
  }

  _createSeparator(): HTMLElement {
    const separator = document.createElement('span')
    separator.classList.add(CLASS_NAME_SEPARATOR)
    separator.setAttribute(ATTRIBUTE_ROLE_SEPARATOR, '')
    const icon = isRTL(this._element) ? this._config.separatorIconRtl : this._config.separatorIcon
    separator.innerHTML = sanitizeByConfig(icon, this._config)
    this._element.append(separator)
    this._createdElements.push(separator)

    return separator
  }

  _applyRange(startDate: Date | null, endDate: Date | null): void {
    const batching = this._batching
    const generation = ++this._generation
    this._batching = true
    this._startInput._holdErrors(true)
    this._endInput._holdErrors(true)

    try {
      this._startInput.setDate(startDate)

      if (generation === this._generation) {
        this._endInput.setDate(endDate)
      }

      if (this._element) {
        this._reportDate('start')
        this._reportDate('end')
      }
    } finally {
      this._batching = batching
      this._startInput?._holdErrors(false)
      this._endInput?._holdErrors(false)
    }
  }

  _onFieldChange(end: 'end' | 'start'): void {
    if (this._batching) {
      return
    }

    this._reportDate(end)
  }

  _reportDate(end: 'end' | 'start'): void {
    const date = end === 'start' ? this.getStartDate() : this.getEndDate()

    if (!this._reported || isSameInstantAs(date, this._reported[end])) {
      return
    }

    this._reported[end] = date
    EventHandler.trigger(this._element, end === 'start' ? EVENT_START_DATE_CHANGE : EVENT_END_DATE_CHANGE, { date })
  }

  _addEventListeners(): void {
    EventHandler.on(this._startElement, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), () => {
      this._onFieldChange('start')
    })

    EventHandler.on(this._endElement, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), () => {
      this._onFieldChange('end')
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, (event: any) => {
      if ((event.key !== ARROW_LEFT_KEY && event.key !== ARROW_RIGHT_KEY) || hasShortcutModifier(event)) {
        return
      }

      const forward = event.key === (isRTL(this._element) ? ARROW_LEFT_KEY : ARROW_RIGHT_KEY)
      const startSections = SelectorEngine.find(SELECTOR_SECTION, this._startElement)
      const endSections = SelectorEngine.find(SELECTOR_SECTION, this._endElement)

      if (forward && event.target === startSections.at(-1)) {
        endSections[0]?.focus()
      } else if (!forward && event.target === endSections[0]) {
        startSections.at(-1)?.focus()
      }
    })
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, DateRangeInput, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_DATE_RANGE_INPUT)) {
    DateRangeInput.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DateRangeInput)

export default DateRangeInput
export type { DateRangeInputConfig }
