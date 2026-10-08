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
import { getValidationState, nextStateSerial, type ValidationState } from './util/form-validation.js'
import {
  appendControlGroupField,
  applyControlGroupClasses,
  applyControlGroupSize,
  captureHostClasses,
  type HostClasses,
  managedSizeClassNames,
  restoreHostClasses
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
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_SEPARATOR = 'form-control-icon'

const ATTRIBUTE_ROLE_END = 'data-coreui-range-end'
const ATTRIBUTE_ROLE_SEPARATOR = 'data-coreui-range-separator'
const ATTRIBUTE_ROLE_START = 'data-coreui-range-start'

const SELECTOR_DATA_DATE_RANGE_INPUT = '[data-coreui-date-range-input]'
const SELECTOR_ROLE_SEPARATOR = `[${ATTRIBUTE_ROLE_SEPARATOR}]`
const SELECTOR_SECTION = '.form-date-time-section'
const SELECTOR_SVG = 'svg'

const VALIDATION_OPTIONS = new Set(['invalid', 'valid', 'validationState'])

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
  invalid: boolean
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
  valid: boolean
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
  invalid: false,
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
  valid: false,
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
  invalid: 'boolean',
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
  valid: 'boolean',
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
  protected declare _hiddenFromAssistiveTech: Element[]
  protected declare _hostClasses: HostClasses
  protected declare _hostRole: string | null
  protected declare _hostDescribedBy: string | null
  protected declare _describedFields: [HTMLElement, string | null, string][]
  protected declare _onDismissValidationState: ((serial: number) => void) | null
  protected declare _ownerState: ValidationState | undefined
  protected declare _ownsStateClass: boolean
  protected declare _serverClasses: string[]
  protected declare _stateClass: string | null
  protected declare _stateSerial: number
  protected declare _initialStartDate: any
  protected declare _initialEndDate: any
  protected declare _startDate: Date | null
  protected declare _endDate: Date | null
  protected declare _applying: boolean
  protected declare _byUser: boolean

  constructor(element?: string | Element | null, config?: Partial<DateRangeInputConfig> | null) {
    super(element, config)

    this._createdElements = []
    this._hiddenFromAssistiveTech = []
    this._hostClasses = captureHostClasses(this._element, this._managedClassNames())
    this._hostRole = this._element.getAttribute('role')
    this._hostDescribedBy = this._element.getAttribute('aria-describedby')
    this._describedFields = []
    this._onDismissValidationState = null
    this._ownerState = undefined
    this._ownsStateClass = false
    this._serverClasses = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID].filter(name => this._element.classList.contains(name))
    this._stateClass = null
    this._stateSerial = nextStateSerial()
    this._element.classList.remove(...this._serverClasses)
    this._initialStartDate = config?.startDate ?? this._config.startDate
    this._initialEndDate = config?.endDate ?? this._config.endDate
    this._applying = false
    this._byUser = false

    this._createDateRangeInput()
    this._startDate = this._startInput.getDate()
    this._endDate = this._endInput.getDate()
    this._updateValidity()
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
    return this._startDate
  }

  getEndDate(): Date | null {
    return this._endDate
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
    return this._startDate === null || this._endDate === null || this._endDate >= this._startDate
  }

  setConfig(config: Partial<DateRangeInputConfig> | null): void {
    const validation = Object.fromEntries(Object.entries(config ?? {}).filter(([key]) => VALIDATION_OPTIONS.has(key)))

    if (Object.keys(validation).length === 0) {
      return
    }

    this._config = this._getConfig({ ...this._config, ...validation })
    this._serverClasses = []
    this._stateSerial = nextStateSerial()
    this._updateValidity()
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

    if (this._stateClass && this._ownsStateClass) {
      this._element.classList.remove(this._stateClass)
    }

    this._element.classList.add(...this._serverClasses)

    for (const element of this._hiddenFromAssistiveTech) {
      element.removeAttribute('aria-hidden')
    }

    if (this._hostRole === null) {
      this._element.removeAttribute('role')
    }

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

    restoreHostClasses(this._element, this._managedClassNames(), this._hostClasses)

    super.dispose()
  }

  // Private
  _hideFromAssistiveTech(element: Element): void {
    if (element.hasAttribute('aria-hidden')) {
      return
    }

    element.setAttribute('aria-hidden', 'true')
    this._hiddenFromAssistiveTech.push(element)
  }

  _managedClassNames(): string[] {
    return [
      CLASS_NAME_DATE_RANGE,
      CLASS_NAME_INPUT_GROUP,
      ...managedSizeClassNames(this._config.size)
    ].filter(Boolean) as string[]
  }

  _createDateRangeInput(): void {
    applyControlGroupClasses(this._element, CLASS_NAME_INPUT_GROUP, CLASS_NAME_DATE_RANGE)
    applyControlGroupSize(this._element, this._config.size)

    if (this._hostRole === null) {
      this._element.setAttribute('role', 'group')
    }

    this._startElement = this._createField(ATTRIBUTE_ROLE_START, this._config.startFloatingLabel)
    this._separatorElement = SelectorEngine.findOne(SELECTOR_ROLE_SEPARATOR, this._element) ?? this._createSeparator()
    this._hideFromAssistiveTech(this._separatorElement)
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
      ...forwarded, ...overrides, autofocus: false, ...this._config.inputOptions, invalid: false, valid: false, validationState: null
    })

    input._setOwnerDismiss((serial: number) => this._dismissValidationState(serial))

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

  _applyRange(startDate: Date | null, endDate: Date | null, { fields = true }: { fields?: boolean } = {}): void {
    if (this._applying) {
      return
    }

    this._applying = true

    try {
      if (fields) {
        this._setInputDate(this._startInput, startDate)
        this._setInputDate(this._endInput, endDate)
      }
    } finally {
      this._applying = false
    }

    const start = fields ? this._startInput.getDate() : startDate
    const end = fields ? this._endInput.getDate() : endDate

    const startChanged = !isSameInstantAs(start, this._startDate)
    const endChanged = !isSameInstantAs(end, this._endDate)
    this._startDate = start
    this._endDate = end

    this._updateValidity()

    if (startChanged) {
      EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, { date: start })
    }

    if (endChanged) {
      EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, { date: end })
    }
  }

  _setInputDate(input: any, date: Date | null): void {
    if (this._byUser) {
      input._runAsUser(() => input.setConfig({ date }))
      return
    }

    input.setConfig({ date })
  }

  _runAsUser(action: () => void): void {
    const previous = this._byUser
    this._byUser = true

    try {
      action()
    } finally {
      this._byUser = previous
    }
  }

  _setOwnerDismiss(onDismiss: (serial: number) => void): void {
    this._onDismissValidationState = onDismiss
  }

  _setOwnerState(givenState: ValidationState | undefined): void {
    this._ownerState = givenState
    this._updateValidity()
  }

  _updateValidity(): void {
    const givenState = getValidationState(this._config.validationState, this._config.valid, this._config.invalid) ??
      getValidationState(null, this._serverClasses.includes(CLASS_NAME_IS_VALID), this._serverClasses.includes(CLASS_NAME_IS_INVALID)) ??
      this._ownerState
    const isOrderInvalid = !this.isRangeValid()
    const state = isOrderInvalid ? 'invalid' : givenState
    const stateClass = state ? `is-${state}` : null

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

    this._startInput._setOwnerState(givenState, isOrderInvalid)
    this._endInput._setOwnerState(givenState, isOrderInvalid)
  }

  _dismissValidationState(serial: number = Number.POSITIVE_INFINITY): void {
    if (this._stateSerial <= serial) {
      this._config.invalid = false
      this._config.valid = false
      this._config.validationState = null
      this._serverClasses = []
      this._updateValidity()
    }

    this._onDismissValidationState?.(serial)
  }

  _addEventListeners(): void {
    EventHandler.on(this._startElement, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      this._applyRange(event.date, this._endDate, { fields: false })
    })

    EventHandler.on(this._endElement, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      this._applyRange(this._startDate, event.date, { fields: false })
    })

    if (this._separatorElement.getAttribute('aria-hidden') !== 'true') {
      for (const svg of SelectorEngine.find(SELECTOR_SVG, this._separatorElement)) {
        this._hideFromAssistiveTech(svg)
      }
    }

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
