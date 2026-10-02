/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-selection/base.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import EventHandler from '../dom/event-handler.js'
import SelectorEngine from '../dom/selector-engine.js'
import Config from '../util/config.js'
import { constrainDate } from '../util/calendar.js'
import { convertValue, getDayPeriodNames, getInclusiveMax } from '../util/date-sections.js'
import {
  convert12hTo24h,
  convert24hTo12h,
  type FormattedPartial,
  getLocalizedTimePartials,
  getSelectedHour,
  getSelectedMinutes,
  getSelectedSeconds,
  isTimeOutsideLimits
} from '../util/time.js'
import { execute } from '../util/index.js'

/**
 * Constants
 */

const NAME = 'time-selection'

const EVENT_KEY = '.coreui.time-selection'
const EVENT_FOCUSIN = `focusin${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`

const Default = {
  ariaSelectHoursLabel: 'Select hours',
  ariaSelectMeridiemLabel: 'Select AM/PM',
  ariaSelectMinutesLabel: 'Select minutes',
  ariaLabel: 'Time',
  ariaSelectSecondsLabel: 'Select seconds',
  hourCycle: null,
  hours: null,
  locale: 'default',
  maxDate: null,
  minDate: null,
  minutes: true,
  onChange: null,
  seconds: true,
  time: null
}

const DefaultType = {
  ariaSelectHoursLabel: 'string',
  ariaSelectMeridiemLabel: 'string',
  ariaSelectMinutesLabel: 'string',
  ariaLabel: 'string',
  ariaSelectSecondsLabel: 'string',
  hourCycle: '(string|null)',
  hours: '(array|function|null)',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  minutes: '(array|boolean|function)',
  onChange: '(function|null)',
  seconds: '(array|boolean|function)',
  time: '(date|null)'
}

/**
 * Class definition
 */

class TimeSelection extends Config {
  protected declare _element: HTMLElement | null
  protected declare _config: typeof Default
  protected declare _partials: any
  protected declare _date: Date | null
  protected declare _ampm: string
  protected declare _maxDate: Date | null
  protected declare _minDate: Date | null

  constructor(element?: string | Element | null, config?: Partial<typeof Default> | null) {
    super()
    this._element = element as HTMLElement
    this._config = this._getConfig(config) as typeof Default
    this._date = this._config.time as Date | null
    this._ampm = this._date ? (this._date.getHours() >= 12 ? 'pm' : 'am') : 'am'

    this._render()
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
  getTime(): Date | null {
    return this._date
  }

  setTime(time: Date | null): void {
    this._config.time = time as any
    this._date = time
    this._ampm = time ? (time.getHours() >= 12 ? 'pm' : 'am') : 'am'
    this._markSelected()
  }

  setConfig(config: any): void {
    this._config = this._getConfig({ ...this._config, ...config }) as typeof Default
    this._date = this._config.time as Date | null
    this._ampm = this._date ? (this._date.getHours() >= 12 ? 'pm' : 'am') : 'am'
    this._render()
  }

  dispose(): void {
    EventHandler.off(this._element, EVENT_FOCUSIN)
    EventHandler.off(this._element, EVENT_KEYDOWN)
    this._element!.innerHTML = ''
    this._element = null
  }

  // Private
  _ampmOption(): 'auto' | boolean {
    return this._config.hourCycle === null ? 'auto' : this._config.hourCycle === 'h12'
  }

  _render(): void {
    this._element!.setAttribute('role', 'group')
    this._element!.setAttribute('aria-label', this._config.ariaLabel as string)

    this._minDate = convertValue(this._config.minDate as Date | string | null, 'datetime', this._config.locale)
    this._maxDate = getInclusiveMax(convertValue(this._config.maxDate as Date | string | null, 'datetime', this._config.locale))
    this._partials = getLocalizedTimePartials(
      this._config.locale,
      this._ampmOption(),
      this._config.hours as any,
      this._config.minutes as any,
      this._config.seconds as any
    )

    this._element!.innerHTML = ''
    EventHandler.off(this._element, EVENT_KEYDOWN)
    this._renderBody()

    EventHandler.off(this._element, EVENT_FOCUSIN)
    EventHandler.on(this._element, EVENT_FOCUSIN, (event: any) => {
      this._updateRovingTabIndex(event.target as HTMLElement)
    })

    this._markSelected(true)
    this._updateRovingTabIndex()
  }

  _parts(): { ariaLabel: string, name: string, options: any[] }[] {
    const parts = [
      { ariaLabel: this._config.ariaSelectHoursLabel, name: 'hours', options: this._partials.listOfHours }
    ]

    if (this._config.minutes) {
      parts.push({ ariaLabel: this._config.ariaSelectMinutesLabel, name: 'minutes', options: this._partials.listOfMinutes })
    }

    if (this._config.seconds) {
      parts.push({ ariaLabel: this._config.ariaSelectSecondsLabel, name: 'seconds', options: this._partials.listOfSeconds })
    }

    if (this._partials.hour12) {
      const [am, pm] = getDayPeriodNames(this._config.locale as string)

      parts.push({
        ariaLabel: this._config.ariaSelectMeridiemLabel,
        name: 'meridiem',
        options: [{ label: am, value: 'am' }, { label: pm, value: 'pm' }]
      })
    }

    return parts.map(part => ({
      ...part,
      options: part.options.map((option: any) => ({
        ...option,
        disabled: this._isUnavailable(part.name, option.value) || this._isOutsideLimits(part.name, option.value)
      }))
    }))
  }

  _isOutsideLimits(part: string, value: number | string): boolean {
    if (!this._minDate && !this._maxDate) {
      return false
    }

    const date = new Date((this._config.time as Date | null) ?? constrainDate(new Date(), this._minDate, this._maxDate))

    if (this._date) {
      date.setHours(this._date.getHours(), this._date.getMinutes(), this._date.getSeconds())
    }

    const hour = part === 'hours' ? this._hourOf(value) : value
    const offered = (part === 'hours' && this._config.minutes ? this._partials.listOfMinutes : (part === 'minutes' && this._config.seconds ? this._partials.listOfSeconds : []))
      .map((option: any) => option.value)

    return isTimeOutsideLimits(date, part as 'hours' | 'meridiem' | 'minutes' | 'seconds', hour, { max: this._maxDate, min: this._minDate }, offered)
  }

  _hourOf(value: number | string): number {
    const hour = Number(value)

    if (!this._partials.hour12) {
      return hour
    }

    const hours = this._partials.listOfHours.find((option: FormattedPartial) => option.value === hour)?.hours ?? []

    return hours.length === 1 ? hours[0] : convert12hTo24h(this._ampm, hour)
  }

  _isUnavailable(part: string, value: number | string): boolean {
    if (part !== 'meridiem') {
      return false
    }

    const option = this._date && this._partials.listOfHours.find((item: FormattedPartial) => item.value === convert24hTo12h(this._date!.getHours()))

    if (this._date && !option) {
      return false
    }

    const hours: number[] = option ? option.hours ?? [] : this._partials.listOfHours.flatMap((item: FormattedPartial) => item.hours ?? [])

    return !hours.some(hour => (hour >= 12) === (value === 'pm'))
  }

  _renderBody(): void {
    throw new Error('TimeSelection is abstract — use TimeRoll or TimeSelects.')
  }

  _stops(): HTMLElement[] {
    return []
  }

  _entryStop(list: HTMLElement[]): HTMLElement | null {
    return list[0] ?? null
  }

  _markPart(_part: string, _value: string, _instant: boolean): void {}

  _markDisabled(): void {}

  _updateRovingTabIndex(preferred?: HTMLElement): void {
    const list = this._stops()

    if (list.length === 0) {
      return
    }

    const active = (preferred && list.includes(preferred) ? preferred : null) ??
      this._entryStop(list) ??
      list[0]

    for (const element of list) {
      element.tabIndex = element === active ? 0 : -1
    }
  }

  _change(part: string, value: any): void {
    const date = this._date ? new Date(this._date) : new Date('1970-01-01T00:00:00')

    if (part === 'meridiem') {
      const hours = date.getHours()
      this._ampm = value

      if (value === 'am' && hours >= 12) {
        date.setHours(hours - 12)
      }

      if (value === 'pm' && hours < 12) {
        date.setHours(hours + 12)
      }
    }

    if (part === 'hours') {
      const hour = this._hourOf(value)
      date.setHours(hour)

      if (this._partials.hour12) {
        this._ampm = hour < 12 ? 'am' : 'pm'
      }
    }

    if (part === 'minutes') {
      date.setMinutes(Number.parseInt(value, 10))
    }

    if (part === 'seconds') {
      date.setSeconds(Number.parseInt(value, 10))
    }

    this._date = date
    this._markSelected()
    execute(this._config.onChange, [undefined, date])
  }

  _markSelected(instant = false): void {
    const selected = {
      hours: getSelectedHour(this._date, this._config.locale, this._ampmOption()),
      meridiem: this._date ? this._ampm : '',
      minutes: getSelectedMinutes(this._date),
      seconds: getSelectedSeconds(this._date)
    }

    for (const [part, value] of Object.entries(selected)) {
      if (value === '') {
        continue
      }

      this._markPart(part, value as string, instant)
    }

    this._markDisabled()
    this._updateRovingTabIndex(
      SelectorEngine.findOne(':focus', this._element as ParentNode) as HTMLElement
    )
  }
}

export default TimeSelection
