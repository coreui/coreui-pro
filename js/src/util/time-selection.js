/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/time-selection.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import Manipulator from '../dom/manipulator.js'
import SelectorEngine from '../dom/selector-engine.js'
import Config from './config.js'
import {
  convert12hTo24h,
  getLocalizedTimePartials,
  getSelectedHour,
  getSelectedMinutes,
  getSelectedSeconds,
  isAmPm
} from './time.js'
import { execute } from './index.js'

/**
 * Constants
 */

const NAME = 'time-selection'

const CLASS_NAME_INLINE_SELECT = 'time-picker-inline-select'
const CLASS_NAME_ROLL = 'time-picker-roll'
const CLASS_NAME_ROLL_CELL = 'time-picker-roll-cell'
const CLASS_NAME_ROLL_COL = 'time-picker-roll-col'
const CLASS_NAME_SELECTED = 'selected'

const ENTER_KEY = 'Enter'
const SPACE_KEY = 'Space'

const Default = {
  ariaSelectHoursLabel: 'Select hours',
  ariaSelectMeridiemLabel: 'Select AM/PM',
  ariaSelectMinutesLabel: 'Select minutes',
  ariaSelectSecondsLabel: 'Select seconds',
  hours: null,
  locale: 'default',
  minutes: true,
  onChange: null,
  seconds: true,
  time: null,
  variant: 'roll'
}

const DefaultType = {
  ariaSelectHoursLabel: 'string',
  ariaSelectMeridiemLabel: 'string',
  ariaSelectMinutesLabel: 'string',
  ariaSelectSecondsLabel: 'string',
  hours: '(array|function|null)',
  locale: 'string',
  minutes: '(array|boolean|function)',
  onChange: '(function|null)',
  seconds: '(array|boolean|function)',
  time: '(date|null)',
  variant: 'string'
}

/**
 * Class definition
 *
 * The popup body of the time pickers — the counterpart of Calendar for the time
 * half. Owns the roll/select rendering and the hour/minute/second/meridiem
 * arithmetic; reports a Date through `onChange` and holds no popup, field, or
 * event-name concerns. Shared by TimePickerV2 and DateTimePickerV2.
 */

class TimeSelection extends Config {
  constructor(element, config) {
    super()
    this._element = element
    this._config = this._getConfig(config)
    this._date = this._config.time
    this._ampm = this._date ? (this._date.getHours() >= 12 ? 'pm' : 'am') : 'am'

    this._render()
  }

  // Getters
  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  static get NAME() {
    return NAME
  }

  // Public
  getTime() {
    return this._date
  }

  update(config) {
    this._config = this._getConfig({ ...this._config, ...config })
    this._date = this._config.time
    this._ampm = this._date ? (this._date.getHours() >= 12 ? 'pm' : 'am') : 'am'
    this._render()
  }

  dispose() {
    this._element.innerHTML = ''
    this._element = null
  }

  // Private
  _render() {
    this._partials = getLocalizedTimePartials(
      this._config.locale,
      'auto',
      this._config.hours,
      this._config.minutes,
      this._config.seconds
    )

    this._element.innerHTML = ''
    this._element.classList.toggle(CLASS_NAME_ROLL, this._config.variant === 'roll')

    if (this._config.variant === 'select') {
      this._renderSelects()
    } else {
      this._renderRoll()
    }

    this._markSelected()
  }

  _parts() {
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
      parts.push({
        ariaLabel: this._config.ariaSelectMeridiemLabel,
        name: 'meridiem',
        options: [{ label: 'AM', value: 'am' }, { label: 'PM', value: 'pm' }]
      })
    }

    return parts
  }

  _renderRoll() {
    for (const part of this._parts()) {
      const column = document.createElement('div')
      column.classList.add(CLASS_NAME_ROLL_COL)
      column.setAttribute('role', 'listbox')
      column.setAttribute('aria-label', part.ariaLabel)

      for (const [index, option] of part.options.entries()) {
        const cell = document.createElement('div')
        cell.classList.add(CLASS_NAME_ROLL_CELL)
        cell.setAttribute('role', 'option')
        cell.setAttribute('aria-label', option.label.toString())
        cell.setAttribute('aria-selected', 'false')
        cell.tabIndex = index === 0 ? 0 : -1
        cell.textContent = option.label
        Manipulator.setDataAttribute(cell, part.name, option.value)

        cell.addEventListener('click', () => this._change(part.name, option.value))
        cell.addEventListener('keydown', event => {
          if (event.code === SPACE_KEY || event.key === ENTER_KEY) {
            event.preventDefault()
            this._change(part.name, option.value)
          }
        })

        column.append(cell)
      }

      this._element.append(column)
    }
  }

  _renderSelects() {
    for (const [index, part] of this._parts().entries()) {
      if (index > 0 && part.name !== 'meridiem') {
        const separator = document.createElement('span')
        separator.textContent = ':'
        this._element.append(separator)
      }

      const select = document.createElement('select')
      select.classList.add(CLASS_NAME_INLINE_SELECT, part.name)
      select.setAttribute('aria-label', part.ariaLabel)
      select.addEventListener('change', event => this._change(part.name, event.target.value))

      for (const option of part.options) {
        const optionEl = document.createElement('option')
        optionEl.value = option.value
        optionEl.textContent = option.label
        select.append(optionEl)
      }

      this._element.append(select)
    }
  }

  _change(part, value) {
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
      date.setHours(isAmPm(this._config.locale) ?
        convert12hTo24h(this._ampm, Number.parseInt(value, 10)) :
        Number.parseInt(value, 10))
    }

    if (part === 'minutes') {
      date.setMinutes(Number.parseInt(value, 10))
    }

    if (part === 'seconds') {
      date.setSeconds(Number.parseInt(value, 10))
    }

    this._date = date
    this._markSelected()
    // execute() maps args[0] onto `this`, so the real argument comes second
    execute(this._config.onChange, [undefined, date])
  }

  _markSelected() {
    const selected = {
      hours: getSelectedHour(this._date, this._config.locale),
      meridiem: this._ampm,
      minutes: getSelectedMinutes(this._date),
      seconds: getSelectedSeconds(this._date)
    }

    for (const [part, value] of Object.entries(selected)) {
      if (value === '') {
        continue
      }

      if (this._config.variant === 'select') {
        const select = SelectorEngine.findOne(`select.${part}`, this._element)

        if (select) {
          select.value = value
        }

        continue
      }

      for (const cell of SelectorEngine.find(`[data-coreui-${part}]`, this._element)) {
        const isSelected = String(Manipulator.getDataAttribute(cell, part)) === String(value)
        cell.classList.toggle(CLASS_NAME_SELECTED, isSelected)
        cell.setAttribute('aria-selected', isSelected ? 'true' : 'false')
      }
    }
  }
}

export default TimeSelection
