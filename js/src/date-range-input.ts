/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-range-input.js
 * License (https://coreui.io/pro/license/)
 *
 * Two DateInput fields and a separator inside one frame, joined by the range
 * the component owns. The markup is the composition surface: a start host, an
 * end host and a separator the author wrote (by role attribute) are adopted;
 * whatever is missing is generated.
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import DateInput from './date-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { isSameDateAs } from './util/calendar.js'
import type { ComponentConfig } from './util/config.js'
import { appendControlGroupField } from './util/form-control-group.js'
import { SEPARATOR_ICON, SEPARATOR_ICON_RTL } from './util/icons.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'date-range-input'
const DATA_KEY = 'coreui.date-range-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`
const EVENT_RANGE_CHANGE = `rangeChange${EVENT_KEY}`
const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'

const CLASS_NAME_DATE_RANGE = 'form-date-range'
const CLASS_NAME_FORM_CONTROL = 'form-control'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_SEPARATOR = 'form-control-icon'

const SELECTOR_DATA_DATE_RANGE_INPUT = '[data-coreui-date-range-input]'
const SELECTOR_ROLE_END = '[data-coreui-range-end]'
const SELECTOR_ROLE_SEPARATOR = '[data-coreui-range-separator]'
const SELECTOR_ROLE_START = '[data-coreui-range-start]'
const SELECTOR_SECTION = '.form-date-time-section'
const SELECTOR_SVG = 'svg'

type DateRangeInputConfig = {
  allowList: SanitizerAllowList
  ariaEndLabel: string
  ariaStartLabel: string
  autofocus: boolean
  disabled: boolean
  disabledDates: any
  endDate: Date | string | null
  endFloatingLabel: string | null
  endName: string | null
  format: any
  inputDateParse: ((value: string) => Date | null) | null
  inputOptions: Record<string, any>
  invalid: boolean
  locale: string
  maxDate: Date | string | null
  minDate: Date | string | null
  monthNames: string[] | null
  placeholders: Record<string, string> | null
  readonly: boolean
  required: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  sectionLabels: Record<string, string> | null
  separatorIcon: string
  separatorIconRtl: string
  size: string | null
  startDate: Date | string | null
  startFloatingLabel: string | null
  startName: string | null
  valid: boolean
}

const Default: DateRangeInputConfig = {
  allowList: SVGAllowlist,
  ariaEndLabel: 'End date',
  ariaStartLabel: 'Start date',
  autofocus: false,
  disabled: false,
  disabledDates: null,
  endDate: null,
  endFloatingLabel: null,
  endName: null,
  format: null,
  inputDateParse: null,
  inputOptions: {},
  invalid: false,
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  monthNames: null,
  placeholders: null,
  readonly: false,
  required: false,
  sanitize: true,
  sanitizeFn: null,
  sectionLabels: null,
  separatorIcon: SEPARATOR_ICON,
  separatorIconRtl: SEPARATOR_ICON_RTL,
  size: null,
  startDate: null,
  startFloatingLabel: null,
  startName: null,
  valid: false
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaEndLabel: 'string',
  ariaStartLabel: 'string',
  autofocus: 'boolean',
  disabled: 'boolean',
  disabledDates: '(array|date|function|null)',
  endDate: '(date|string|null)',
  endFloatingLabel: '(string|null)',
  endName: '(string|null)',
  format: '(function|string|null)',
  inputDateParse: '(function|null)',
  inputOptions: 'object',
  invalid: 'boolean',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  monthNames: '(array|null)',
  placeholders: '(object|null)',
  readonly: 'boolean',
  required: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  sectionLabels: '(object|null)',
  separatorIcon: 'string',
  separatorIconRtl: 'string',
  size: '(string|null)',
  startDate: '(date|string|null)',
  startFloatingLabel: '(string|null)',
  startName: '(string|null)',
  valid: 'boolean'
}

/**
 * Class definition
 */

class DateRangeInput extends BaseComponent {
  protected declare _startInput: any
  protected declare _endInput: any
  protected declare _startElement: HTMLElement
  protected declare _endElement: HTMLElement
  protected declare _startFieldElement: HTMLElement
  protected declare _endFieldElement: HTMLElement
  protected declare _separatorElement: HTMLElement
  protected declare _created: { end: boolean, separator: boolean, start: boolean }
  protected declare _addedGroupClass: boolean
  protected declare _initialStartDate: any
  protected declare _initialEndDate: any
  protected declare _startDate: Date | null
  protected declare _endDate: Date | null
  protected declare _applying: boolean

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._created = { end: false, separator: false, start: false }
    this._initialStartDate = config?.startDate ?? this._config.startDate
    this._initialEndDate = config?.endDate ?? this._config.endDate
    this._applying = false

    this._createDateRangeInput()
    this._startDate = this._startInput.getDate()
    this._endDate = this._endInput.getDate()
    this._applyOrder()
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

  // The fields validate the dates against min/max — what the component keeps
  // and announces is what the fields hold, not the arguments.
  setRange(startDate: Date | null, endDate: Date | null): void {
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

  isRangeValid(): boolean {
    return this._startDate === null || this._endDate === null || this._endDate >= this._startDate
  }

  override dispose(): void {
    for (const element of [this._startElement, this._endElement]) {
      EventHandler.off(element, EVENT_KEY)
    }

    this._startInput.dispose()
    this._endInput.dispose()

    if (this._created.start) {
      this._startFieldElement.remove()
    }

    if (this._created.separator) {
      this._separatorElement.remove()
    }

    if (this._created.end) {
      this._endFieldElement.remove()
    }

    this._element.classList.remove(CLASS_NAME_DATE_RANGE, CLASS_NAME_IS_INVALID)

    if (this._addedGroupClass) {
      this._element.classList.remove(CLASS_NAME_INPUT_GROUP)
    }

    super.dispose()
  }

  // Private
  _createDateRangeInput(): void {
    const group = this._element
    group.classList.add(CLASS_NAME_DATE_RANGE)
    this._addedGroupClass = !group.classList.contains(CLASS_NAME_INPUT_GROUP)
    group.classList.add(CLASS_NAME_INPUT_GROUP)

    if (this._config.size) {
      group.classList.add(`${CLASS_NAME_FORM_CONTROL}-${this._config.size}`)
    }

    // Markup first: a part the author wrote is adopted, a missing one is built,
    // in document order — start, separator, end.
    const ownStart = SelectorEngine.findOne(SELECTOR_ROLE_START, group)
    this._startElement = ownStart ?? document.createElement('div')
    this._created.start = !ownStart
    this._startFieldElement = ownStart ?? appendControlGroupField(group, this._startElement, this._config.startFloatingLabel, `${NAME}-`)

    const ownSeparator = SelectorEngine.findOne(SELECTOR_ROLE_SEPARATOR, group)
    this._separatorElement = ownSeparator ?? this._createSeparator()
    this._created.separator = !ownSeparator
    this._separatorElement.setAttribute('aria-hidden', 'true')

    if (!ownSeparator) {
      group.append(this._separatorElement)
    }

    const ownEnd = SelectorEngine.findOne(SELECTOR_ROLE_END, group)
    this._endElement = ownEnd ?? document.createElement('div')
    this._created.end = !ownEnd
    this._endFieldElement = ownEnd ?? appendControlGroupField(group, this._endElement, this._config.endFloatingLabel, `${NAME}-`)

    this._startInput = this._createInput(this._startElement, {
      ariaLabel: this._config.startFloatingLabel ?? this._config.ariaStartLabel,
      date: this._config.startDate,
      name: this._config.startName
    })

    this._endInput = this._createInput(this._endElement, {
      ariaLabel: this._config.endFloatingLabel ?? this._config.ariaEndLabel,
      date: this._config.endDate,
      name: this._config.endName
    })

    if (this._config.autofocus && !this._config.disabled) {
      SelectorEngine.find(SELECTOR_SECTION, this._startElement)[0]?.focus()
    }
  }

  // Options DateInput knows about are forwarded by name, so
  // `data-coreui-month-names`, `data-coreui-readonly`, … reach both fields
  // without this component restating the whole field surface. `inputOptions`
  // stays as the programmatic escape hatch.
  _createInput(element: HTMLElement, overrides: Record<string, any>): any {
    const forwarded: Record<string, any> = {}

    for (const key of Object.keys(DateInput.Default)) {
      if (key in this._config && this._config[key] !== (Default as Record<string, any>)[key]) {
        forwarded[key] = this._config[key]
      }
    }

    return new DateInput(element, {
      ...forwarded, ...overrides, autofocus: false, ...this._config.inputOptions
    })
  }

  // The separator is a directional arrow, so it has an RTL counterpart. The
  // element's computed direction decides, not the document's: an ancestor can
  // set dir="rtl" around the field alone.
  _createSeparator(): HTMLElement {
    const separator = document.createElement('span')
    separator.classList.add(CLASS_NAME_SEPARATOR)
    const isRtl = window.getComputedStyle(this._element).direction === 'rtl'
    separator.innerHTML = sanitizeByConfig(isRtl ? this._config.separatorIconRtl : this._config.separatorIcon, this._config)

    return separator
  }

  // The one place the range changes. Each field validates its own date, so
  // what the component keeps and announces is what the fields hold. The side
  // that reported a change is not written back to.
  _applyRange(startDate: Date | null, endDate: Date | null, { fields = true }: { fields?: boolean } = {}): void {
    if (this._applying) {
      return
    }

    this._applying = true

    if (fields) {
      this._startInput.update({ date: startDate })
      this._endInput.update({ date: endDate })
    }

    const start = fields ? this._startInput.getDate() : startDate
    const end = fields ? this._endInput.getDate() : endDate
    this._applying = false

    const startChanged = !isSameDateAs(start, this._startDate)
    const endChanged = !isSameDateAs(end, this._endDate)
    this._startDate = start
    this._endDate = end
    this._applyOrder()

    if (startChanged) {
      EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, { date: start })
    }

    if (endChanged) {
      EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, { date: end })
    }

    if (startChanged || endChanged) {
      EventHandler.trigger(this._element, EVENT_RANGE_CHANGE, { endDate: end, startDate: start })
    }
  }

  // An end before the start is a state of the range, not of either field, so
  // it lands on the frame — the fields keep what was typed and stay editable.
  _applyOrder(): void {
    this._element.classList.toggle(CLASS_NAME_IS_INVALID, !this.isRangeValid())
  }

  _addEventListeners(): void {
    EventHandler.on(this._startElement, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      this._applyRange(event.date, this._endDate, { fields: false })
    })

    EventHandler.on(this._endElement, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      this._applyRange(this._startDate, event.date, { fields: false })
    })

    for (const svg of SelectorEngine.find(SELECTOR_SVG, this._separatorElement)) {
      svg.setAttribute('aria-hidden', 'true')
    }

    // Each field walks its own sections with the arrows and stops at its
    // edge; the range carries the same press across the separator.
    EventHandler.on(this._element, EVENT_KEYDOWN, (event: any) => {
      if (event.key !== ARROW_LEFT_KEY && event.key !== ARROW_RIGHT_KEY) {
        return
      }

      const isRtl = window.getComputedStyle(this._element).direction === 'rtl'
      const forward = event.key === (isRtl ? ARROW_LEFT_KEY : ARROW_RIGHT_KEY)
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
  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, DateRangeInput, config)
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
