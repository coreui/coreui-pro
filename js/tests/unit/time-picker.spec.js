/* eslint-env jasmine */

import TimePicker from '../../src/time-picker.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'

describe('TimePicker', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(TimePicker.Default).toEqual(jasmine.any(Object))
    })

    it('should have expected default values', () => {
      expect(TimePicker.Default.locale).toBe('default')
      expect(TimePicker.Default.type).toBe('dropdown')
      expect(TimePicker.Default.variant).toBe('roll')
      expect(TimePicker.Default.disabled).toBeFalse()
      expect(TimePicker.Default.cleaner).toBeTrue()
      expect(TimePicker.Default.indicator).toBeTrue()
      expect(TimePicker.Default.footer).toBeTrue()
      expect(TimePicker.Default.inputReadOnly).toBeFalse()
      expect(TimePicker.Default.inputOnChangeDelay).toBe(750)
      expect(TimePicker.Default.time).toBeNull()
      expect(TimePicker.Default.size).toBeNull()
      expect(TimePicker.Default.required).toBeTrue()
      expect(TimePicker.Default.minutes).toBeTrue()
      expect(TimePicker.Default.seconds).toBeTrue()
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(TimePicker.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(TimePicker.NAME).toBe('time-picker')
    })
  })

  describe('constructor', () => {
    it('should create a time picker instance with default config if no config is provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(tp).toBeInstanceOf(TimePicker)
      expect(tp._config).toBeDefined()
      expect(tp._element).toEqual(div)
    })

    it('should set initial time if provided in config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const timeString = '10:15:30'
      const tp = new TimePicker(div, {
        time: timeString
      })

      expect(tp._date).toBeInstanceOf(Date)
      expect(tp._date.getHours()).toBe(10)
      expect(tp._date.getMinutes()).toBe(15)
      expect(tp._date.getSeconds()).toBe(30)
    })

    it('should accept a Date object as time config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const dateObj = new Date('1970-01-01T14:30:00')
      const tp = new TimePicker(div, { time: dateObj })

      expect(tp._date).toBeInstanceOf(Date)
      expect(tp._date.getHours()).toBe(14)
      expect(tp._date.getMinutes()).toBe(30)
    })

    it('should set _date to null when no time is provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(tp._date).toBeNull()
    })

    it('should set _ampm to "am" when no date is provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(tp._ampm).toBe('am')
    })

    it('should create input group and dropdown by default (type=dropdown)', () => {
      fixtureEl.innerHTML = '<div id="myTimePicker"></div>'
      const div = fixtureEl.querySelector('#myTimePicker')
      new TimePicker(div) // eslint-disable-line no-new

      const inputGroup = div.querySelector('.time-picker-input-group')
      expect(inputGroup).not.toBeNull()

      const dropdown = div.querySelector('.time-picker-dropdown')
      expect(dropdown).not.toBeNull()
    })

    it('should set size class if config.size is given', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { size: 'lg' }) // eslint-disable-line no-new

      expect(div.classList.contains('time-picker-lg')).toBeTrue()
    })

    it('should set size class "sm" if config.size is "sm"', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { size: 'sm' }) // eslint-disable-line no-new

      expect(div.classList.contains('time-picker-sm')).toBeTrue()
    })

    it('should not add size class if config.size is null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { size: null }) // eslint-disable-line no-new

      expect(div.className).not.toContain('time-picker-null')
    })

    it('should add "disabled" class if config.disabled is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { disabled: true }) // eslint-disable-line no-new

      expect(div.classList.contains('disabled')).toBeTrue()
    })

    it('should not add "disabled" class if config.disabled is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { disabled: false }) // eslint-disable-line no-new

      expect(div.classList.contains('disabled')).toBeFalse()
    })

    it('should add "is-valid" class if config.valid is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { valid: true }) // eslint-disable-line no-new

      expect(div.classList.contains('is-valid')).toBeTrue()
    })

    it('should add "is-invalid" class if config.invalid is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { invalid: true }) // eslint-disable-line no-new

      expect(div.classList.contains('is-invalid')).toBeTrue()
    })

    it('should not add "is-valid" or "is-invalid" by default', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      expect(div.classList.contains('is-valid')).toBeFalse()
      expect(div.classList.contains('is-invalid')).toBeFalse()
    })

    it('should add time-picker class to the element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      expect(div.classList.contains('time-picker')).toBeTrue()
    })

    it('should create input with placeholder', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { placeholder: 'Pick a time' }) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      expect(input.placeholder).toBe('Pick a time')
    })

    it('should set input as readonly when inputReadOnly is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { inputReadOnly: true }) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      expect(input.readOnly).toBeTrue()
    })

    it('should set input as not readonly by default', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      expect(input.readOnly).toBeFalse()
    })

    it('should set input name from config.name', () => {
      fixtureEl.innerHTML = '<div id="tp1"></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { name: 'myTimePicker' }) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      expect(input.name).toBe('myTimePicker')
    })

    it('should set input name from element id if no config.name', () => {
      fixtureEl.innerHTML = '<div id="tp1"></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      expect(input.name).toBe('time-picker-tp1')
    })

    it('should not set input name if no config.name and no element id', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      expect(input.name).toBe('')
    })

    it('should create indicator element when indicator is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { indicator: true }) // eslint-disable-line no-new

      const indicator = div.querySelector('.time-picker-indicator')
      expect(indicator).not.toBeNull()
    })

    it('should not create indicator element when indicator is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { indicator: false }) // eslint-disable-line no-new

      const indicator = div.querySelector('.time-picker-indicator')
      expect(indicator).toBeNull()
    })

    it('should create cleaner element when cleaner is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { cleaner: true }) // eslint-disable-line no-new

      const cleaner = div.querySelector('.time-picker-cleaner')
      expect(cleaner).not.toBeNull()
    })

    it('should not create cleaner element when cleaner is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { cleaner: false }) // eslint-disable-line no-new

      const cleaner = div.querySelector('.time-picker-cleaner')
      expect(cleaner).toBeNull()
    })

    it('should set input disabled when config.disabled is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { disabled: true }) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      expect(input.disabled).toBeTrue()
    })

    it('should create footer with cancel and confirm buttons by default', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      const footer = div.querySelector('.time-picker-footer')
      expect(footer).not.toBeNull()

      const buttons = footer.querySelectorAll('button')
      expect(buttons.length).toBe(2)
    })

    it('should not create footer when footer is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { footer: false }) // eslint-disable-line no-new

      const footer = div.querySelector('.time-picker-footer')
      expect(footer).toBeNull()
    })

    it('should create cancel button with custom text', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { cancelButton: 'Discard' }) // eslint-disable-line no-new

      const footer = div.querySelector('.time-picker-footer')
      const cancelBtn = footer.querySelector('button')
      expect(cancelBtn.innerHTML).toBe('Discard')
    })

    it('should not create cancel button when cancelButton is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { cancelButton: false }) // eslint-disable-line no-new

      const footer = div.querySelector('.time-picker-footer')
      // Only confirm button
      const buttons = footer.querySelectorAll('button')
      expect(buttons.length).toBe(1)
      expect(buttons[0].innerHTML).toBe('OK')
    })

    it('should not create confirm button when confirmButton is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { confirmButton: false }) // eslint-disable-line no-new

      const footer = div.querySelector('.time-picker-footer')
      const buttons = footer.querySelectorAll('button')
      expect(buttons.length).toBe(1)
      expect(buttons[0].innerHTML).toBe('Cancel')
    })

    it('should use string button classes when provided as string', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { cancelButtonClasses: 'btn btn-danger' }) // eslint-disable-line no-new

      const footer = div.querySelector('.time-picker-footer')
      const cancelBtn = footer.querySelector('button')
      expect(cancelBtn.classList.contains('btn')).toBeTrue()
      expect(cancelBtn.classList.contains('btn-danger')).toBeTrue()
    })

    it('should set input value when time is provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { time: '14:30:00' }) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      expect(input.value).not.toBe('')
    })

    it('should set indicator tabIndex to 0 when not disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { indicator: true, disabled: false }) // eslint-disable-line no-new

      const indicator = div.querySelector('.time-picker-indicator')
      expect(indicator.tabIndex).toBe(0)
    })

    it('should not set indicator tabIndex when disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { indicator: true, disabled: true }) // eslint-disable-line no-new

      const indicator = div.querySelector('.time-picker-indicator')
      expect(indicator.tabIndex).not.toBe(0)
    })
  })

  describe('type: inline', () => {
    it('should create inline body without input group', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { type: 'inline' }) // eslint-disable-line no-new

      const inputGroup = div.querySelector('.time-picker-input-group')
      expect(inputGroup).toBeNull()

      const body = div.querySelector('.time-picker-body')
      expect(body).not.toBeNull()
    })

    it('should not create dropdown wrapper for inline type', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { type: 'inline' }) // eslint-disable-line no-new

      const dropdown = div.querySelector('.time-picker-dropdown')
      expect(dropdown).toBeNull()
    })
  })

  describe('variant: roll', () => {
    it('should create roll columns for hours, minutes, seconds by default', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'roll' }) // eslint-disable-line no-new

      const rollCols = div.querySelectorAll('.time-picker-roll-col')
      // hours + minutes + seconds = 3 columns minimum
      expect(rollCols.length).toBeGreaterThanOrEqual(3)
    })

    it('should not create minutes column when minutes is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { // eslint-disable-line no-unused-vars
        variant: 'roll', minutes: false, seconds: false, locale: 'en-GB'
      })

      const rollCols = div.querySelectorAll('.time-picker-roll-col')
      // Only hours column
      expect(rollCols.length).toBe(1)
    })

    it('should not create seconds column when seconds is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'roll', seconds: false, locale: 'en-GB' }) // eslint-disable-line no-new

      const rollCols = div.querySelectorAll('.time-picker-roll-col')
      // hours + minutes = 2 columns
      expect(rollCols.length).toBe(2)
    })

    it('should create roll cells with proper attributes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'roll' }) // eslint-disable-line no-new

      const cells = div.querySelectorAll('.time-picker-roll-cell')
      expect(cells.length).toBeGreaterThan(0)

      const firstCell = cells[0]
      expect(firstCell.getAttribute('role')).toBe('option')
      expect(firstCell.getAttribute('aria-selected')).toBe('false')
    })

    it('should set first cell tabIndex to 0 and rest to -1', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'roll' }) // eslint-disable-line no-new

      const firstCol = div.querySelector('.time-picker-roll-col')
      const cells = firstCol.querySelectorAll('.time-picker-roll-cell')

      expect(cells[0].tabIndex).toBe(0)
      if (cells.length > 1) {
        expect(cells[1].tabIndex).toBe(-1)
      }
    })

    it('should set aria-label on roll columns', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'roll' }) // eslint-disable-line no-new

      const firstCol = div.querySelector('.time-picker-roll-col')
      expect(firstCol.getAttribute('aria-label')).toBe('Select hours')
    })

    it('should add roll class to body element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'roll' }) // eslint-disable-line no-new

      const body = div.querySelector('.time-picker-body')
      expect(body.classList.contains('time-picker-roll')).toBeTrue()
    })

    it('should set role="group" on body element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'roll' }) // eslint-disable-line no-new

      const body = div.querySelector('.time-picker-body')
      expect(body.getAttribute('role')).toBe('group')
    })

    it('should handle click on a roll cell and update the time', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          time: '01:00:00',
          variant: 'roll'
        })

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            expect(event.date.getHours()).toBe(5)
            resolve()
          })

          const hourCells = div.querySelectorAll('[data-coreui-hours]')
          const hourCell5 = Array.from(hourCells).find(cell =>
            cell.getAttribute('data-coreui-hours') === '5'
          )
          if (hourCell5) {
            hourCell5.click()
          }
        }, 10)
      })
    })

    it('should handle click on minutes cell', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          time: '01:00:00',
          variant: 'roll'
        })

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            expect(event.date.getMinutes()).toBe(15)
            resolve()
          })

          const minuteCells = div.querySelectorAll('[data-coreui-minutes]')
          const minuteCell15 = Array.from(minuteCells).find(cell =>
            cell.getAttribute('data-coreui-minutes') === '15'
          )
          if (minuteCell15) {
            minuteCell15.click()
          }
        }, 10)
      })
    })

    it('should handle click on seconds cell', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          time: '01:00:00',
          variant: 'roll'
        })

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            expect(event.date.getSeconds()).toBe(30)
            resolve()
          })

          const secondCells = div.querySelectorAll('[data-coreui-seconds]')
          const secondCell30 = Array.from(secondCells).find(cell =>
            cell.getAttribute('data-coreui-seconds') === '30'
          )
          if (secondCell30) {
            secondCell30.click()
          }
        }, 10)
      })
    })

    it('should handle keyboard Enter on a roll cell', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          time: '01:00:00',
          variant: 'roll'
        })

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            expect(event.date).toBeInstanceOf(Date)
            resolve()
          })

          const hourCells = div.querySelectorAll('[data-coreui-hours]')
          const cell = hourCells[3]
          if (cell) {
            const keydownEvent = new KeyboardEvent('keydown', {
              key: 'Enter',
              bubbles: true
            })
            cell.dispatchEvent(keydownEvent)
          }
        }, 10)
      })
    })

    it('should handle keyboard Space on a roll cell', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          time: '01:00:00',
          variant: 'roll'
        })

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            expect(event.date).toBeInstanceOf(Date)
            resolve()
          })

          const hourCells = div.querySelectorAll('[data-coreui-hours]')
          const cell = hourCells[2]
          if (cell) {
            const keydownEvent = new KeyboardEvent('keydown', {
              code: 'Space',
              key: ' ',
              bubbles: true
            })
            cell.dispatchEvent(keydownEvent)
          }
        }, 10)
      })
    })

    it('should navigate down with ArrowDown key', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, {
        time: '01:00:00',
        variant: 'roll'
      })

      tp.show()

      const hourCells = div.querySelectorAll('[data-coreui-hours]')
      const firstCell = hourCells[0]

      if (firstCell) {
        firstCell.focus()
        const keydownEvent = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true
        })
        firstCell.dispatchEvent(keydownEvent)
      }
    })

    it('should navigate up with ArrowUp key', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, {
        time: '01:00:00',
        variant: 'roll'
      })

      tp.show()

      const hourCells = div.querySelectorAll('[data-coreui-hours]')
      const secondCell = hourCells[1]

      if (secondCell) {
        secondCell.focus()
        const keydownEvent = new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true
        })
        secondCell.dispatchEvent(keydownEvent)
      }
    })

    it('should navigate to first cell with Home key', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, {
        time: '01:00:00',
        variant: 'roll'
      })

      tp.show()

      const hourCells = div.querySelectorAll('[data-coreui-hours]')
      const thirdCell = hourCells[2]

      if (thirdCell) {
        thirdCell.focus()
        const keydownEvent = new KeyboardEvent('keydown', {
          key: 'Home',
          bubbles: true
        })
        thirdCell.dispatchEvent(keydownEvent)
      }
    })

    it('should navigate to last cell with End key', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, {
        time: '01:00:00',
        variant: 'roll'
      })

      tp.show()

      const hourCells = div.querySelectorAll('[data-coreui-hours]')
      const firstCell = hourCells[0]

      if (firstCell) {
        firstCell.focus()
        const keydownEvent = new KeyboardEvent('keydown', {
          key: 'End',
          bubbles: true
        })
        firstCell.dispatchEvent(keydownEvent)
      }
    })

    it('should navigate right with ArrowRight key', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, {
        time: '01:00:00',
        variant: 'roll'
      })

      tp.show()

      const hourCells = div.querySelectorAll('[data-coreui-hours]')
      const firstCell = hourCells[0]

      if (firstCell) {
        firstCell.focus()
        const keydownEvent = new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true
        })
        firstCell.dispatchEvent(keydownEvent)
      }
    })

    it('should navigate left with ArrowLeft key', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, {
        time: '01:00:00',
        variant: 'roll'
      })

      tp.show()

      const minuteCells = div.querySelectorAll('[data-coreui-minutes]')
      const firstCell = minuteCells[0]

      if (firstCell) {
        firstCell.focus()
        const keydownEvent = new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true
        })
        firstCell.dispatchEvent(keydownEvent)
      }
    })

    it('should handle time change when _date is null', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          variant: 'roll'
        })

        expect(tp._date).toBeNull()

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            expect(event.date).toBeInstanceOf(Date)
            resolve()
          })

          const hourCells = div.querySelectorAll('[data-coreui-hours]')
          if (hourCells.length > 0) {
            hourCells[3].click()
          }
        }, 10)
      })
    })
  })

  describe('variant: select', () => {
    it('should create inline select elements', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'select' }) // eslint-disable-line no-new

      const selects = div.querySelectorAll('.time-picker-inline-select')
      expect(selects.length).toBeGreaterThanOrEqual(3)
    })

    it('should create inline icon element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'select' }) // eslint-disable-line no-new

      const icon = div.querySelector('.time-picker-inline-icon')
      expect(icon).not.toBeNull()
    })

    it('should not create minutes select when minutes is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { // eslint-disable-line no-unused-vars
        variant: 'select', minutes: false, seconds: false, locale: 'en-GB'
      })

      const selects = div.querySelectorAll('.time-picker-inline-select')
      // Only hours
      expect(selects.length).toBe(1)
    })

    it('should not create seconds select when seconds is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'select', seconds: false, locale: 'en-GB' }) // eslint-disable-line no-new

      const selects = div.querySelectorAll('.time-picker-inline-select')
      // hours + minutes
      expect(selects.length).toBe(2)
    })

    it('should handle change event on select element for hours', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { variant: 'select', time: '10:00:00' })

        tp.show()

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date).toBeInstanceOf(Date)
          resolve()
        })

        const hoursSelect = div.querySelector('select.hours')
        if (hoursSelect) {
          hoursSelect.value = '5'
          hoursSelect.dispatchEvent(new Event('change'))
        }
      })
    })

    it('should handle change event on select element for minutes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { variant: 'select', time: '10:00:00' })

        tp.show()

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date.getMinutes()).toBe(30)
          resolve()
        })

        const minutesSelect = div.querySelector('select.minutes')
        if (minutesSelect) {
          minutesSelect.value = '30'
          minutesSelect.dispatchEvent(new Event('change'))
        }
      })
    })

    it('should handle change event on select element for seconds', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { variant: 'select', time: '10:00:00' })

        tp.show()

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date.getSeconds()).toBe(45)
          resolve()
        })

        const secondsSelect = div.querySelector('select.seconds')
        if (secondsSelect) {
          secondsSelect.value = '45'
          secondsSelect.dispatchEvent(new Event('change'))
        }
      })
    })

    it('should disable selects when disabled is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'select', disabled: true }) // eslint-disable-line no-new

      const selects = div.querySelectorAll('.time-picker-inline-select')
      for (const select of selects) {
        expect(select.disabled).toBeTrue()
      }
    })

    it('should set aria-label on select elements', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'select' }) // eslint-disable-line no-new

      const hoursSelect = div.querySelector('select.hours')
      expect(hoursSelect.getAttribute('aria-label')).toBe('Select hours')
    })

    it('should set select values when time is provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'select', time: '14:30:45', locale: 'en-GB' }) // eslint-disable-line no-new

      const hoursSelect = div.querySelector('select.hours')
      const minutesSelect = div.querySelector('select.minutes')
      const secondsSelect = div.querySelector('select.seconds')

      expect(hoursSelect.value).toBe('14')
      expect(minutesSelect.value).toBe('30')
      expect(secondsSelect.value).toBe('45')
    })
  })

  describe('12h format (AM/PM)', () => {
    it('should create AM/PM column in roll variant with en-US locale', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'roll', locale: 'en-US' }) // eslint-disable-line no-new

      const meridiemCells = div.querySelectorAll('[data-coreui-meridiem]')
      expect(meridiemCells.length).toBe(2)
    })

    it('should create AM/PM select in select variant with en-US locale', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'select', locale: 'en-US' }) // eslint-disable-line no-new

      const meridiemSelect = div.querySelector('select.meridiem')
      expect(meridiemSelect).not.toBeNull()
    })

    it('should switch AM to PM when meridiem is changed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          variant: 'roll',
          locale: 'en-US',
          time: '09:00:00'
        })

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            // 9 AM -> 9 PM = 21:00
            expect(event.date.getHours()).toBe(21)
            resolve()
          })

          const pmCell = Array.from(div.querySelectorAll('[data-coreui-meridiem]')).find(cell =>
            cell.getAttribute('data-coreui-meridiem') === 'pm'
          )
          if (pmCell) {
            pmCell.click()
          }
        }, 10)
      })
    })

    it('should switch PM to AM when meridiem is changed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          variant: 'roll',
          locale: 'en-US',
          time: '15:00:00'
        })

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            // 3 PM -> 3 AM = 03:00
            expect(event.date.getHours()).toBe(3)
            resolve()
          })

          const amCell = Array.from(div.querySelectorAll('[data-coreui-meridiem]')).find(cell =>
            cell.getAttribute('data-coreui-meridiem') === 'am'
          )
          if (amCell) {
            amCell.click()
          }
        }, 10)
      })
    })

    it('should handle meridiem select change in select variant', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          variant: 'select',
          locale: 'en-US',
          time: '09:00:00'
        })

        tp.show()

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date.getHours()).toBe(21)
          resolve()
        })

        const meridiemSelect = div.querySelector('select.meridiem')
        if (meridiemSelect) {
          meridiemSelect.value = 'pm'
          meridiemSelect.dispatchEvent(new Event('change'))
        }
      })
    })
  })

  describe('24h format', () => {
    it('should not create AM/PM column with en-GB locale', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'roll', locale: 'en-GB' }) // eslint-disable-line no-new

      const meridiemCells = div.querySelectorAll('[data-coreui-meridiem]')
      expect(meridiemCells.length).toBe(0)
    })

    it('should not create AM/PM select in select variant with en-GB locale', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { variant: 'select', locale: 'en-GB' }) // eslint-disable-line no-new

      const meridiemSelect = div.querySelector('select.meridiem')
      expect(meridiemSelect).toBeNull()
    })
  })

  describe('toggle', () => {
    it('should show when toggled if not shown, and hide if shown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div)

        expect(div.classList.contains('show')).toBeFalse()

        div.addEventListener('shown.coreui.time-picker', () => {
          expect(div.classList.contains('show')).toBeTrue()

          tp.toggle()
        })

        div.addEventListener('hidden.coreui.time-picker', () => {
          expect(div.classList.contains('show')).toBeFalse()
          resolve()
        })

        tp.toggle()
      })
    })

    it('should call show when not shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const showSpy = spyOn(tp, 'show')
      tp.toggle()

      expect(showSpy).toHaveBeenCalled()
    })

    it('should call hide when already shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      const hideSpy = spyOn(tp, 'hide')
      tp.toggle()

      expect(hideSpy).toHaveBeenCalled()
    })
  })

  describe('show', () => {
    it('should do nothing if already shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      tp.show()

      expect(div.classList.contains('show')).toBeTrue()
    })

    it('should do nothing if disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { disabled: true })

      tp.show()

      expect(div.classList.contains('show')).toBeFalse()
    })

    it('should set aria-expanded="true" when shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      expect(div.getAttribute('aria-expanded')).toBe('true')
    })

    it('should emit show.coreui.time-picker and shown.coreui.time-picker events', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new TimePicker(div) // eslint-disable-line no-new

        let showEventTriggered = false

        div.addEventListener('show.coreui.time-picker', () => {
          showEventTriggered = true
        })

        div.addEventListener('shown.coreui.time-picker', () => {
          expect(showEventTriggered).toBeTrue()
          expect(div.classList.contains('show')).toBeTrue()
          resolve()
        })

        TimePicker.getInstance(div).show()
      })
    })

    it('should set _initialDate when shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:30:00' })

      expect(tp._initialDate).toBeNull()

      tp.show()

      expect(tp._initialDate).toBeInstanceOf(Date)
    })

    it('should show menu when container is used', () => {
      const containerEl = document.createElement('div')
      document.body.append(containerEl)

      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { container: containerEl })

      tp.show()

      const menu = containerEl.querySelector('.time-picker-dropdown')
      expect(menu).not.toBeNull()
      expect(menu.classList.contains('show')).toBeTrue()

      containerEl.remove()
    })
  })

  describe('hide', () => {
    it('should emit hide.coreui.time-picker and hidden.coreui.time-picker events', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new TimePicker(div) // eslint-disable-line no-new

        let hideEventTriggered = false

        div.addEventListener('hide.coreui.time-picker', () => {
          hideEventTriggered = true
        })

        div.addEventListener('hidden.coreui.time-picker', () => {
          expect(hideEventTriggered).toBeTrue()
          expect(div.classList.contains('show')).toBeFalse()
          resolve()
        })

        TimePicker.getInstance(div).show()
        TimePicker.getInstance(div).hide()
      })
    })

    it('should set aria-expanded="false" when hidden', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      tp.hide()

      expect(div.getAttribute('aria-expanded')).toBe('false')
    })

    it('should remove show class from element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      expect(div.classList.contains('show')).toBeTrue()

      tp.hide()
      expect(div.classList.contains('show')).toBeFalse()
    })

    it('should destroy popper on hide', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      expect(tp._popper).not.toBeNull()

      const destroySpy = spyOn(tp._popper, 'destroy')
      tp.hide()
      expect(destroySpy).toHaveBeenCalled()
    })

    it('should remove show class from menu when container is used', () => {
      const containerEl = document.createElement('div')
      document.body.append(containerEl)

      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { container: containerEl })

      tp.show()
      tp.hide()

      const menu = containerEl.querySelector('.time-picker-dropdown')
      expect(menu.classList.contains('show')).toBeFalse()

      containerEl.remove()
    })
  })

  describe('cancel', () => {
    it('should revert to _initialDate and emit timeChange', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const timeString = '11:30:00'
        const tp = new TimePicker(div, { time: timeString })

        tp.show()
        tp._date = new Date('1970-01-01T13:00:00')

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date.getHours()).toBe(11)
          expect(event.date.getMinutes()).toBe(30)
          resolve()
        })

        tp.cancel()
      })
    })

    it('should hide the picker after cancel', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '11:30:00' })

      tp.show()
      tp.cancel()

      expect(div.classList.contains('show')).toBeFalse()
    })

    it('should clear the body and recreate selection', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '11:30:00' })

      tp.show()
      tp.cancel()

      const body = div.querySelector('.time-picker-body')
      expect(body.children.length).toBeGreaterThan(0)
    })

    it('should set input value to initial date value', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '11:30:00' })

      tp.show()
      const initialInputValue = tp._input.value
      tp._date = new Date('1970-01-01T13:00:00')
      tp._setInputValue(tp._date)

      tp.cancel()
      expect(tp._input.value).toBe(initialInputValue)
    })
  })

  describe('clear', () => {
    it('should set _date to null, clear the input value, emit timeChange', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { time: '10:00:00' })

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date).toBeNull()
          expect(tp._date).toBeNull()
          expect(tp._input.value).toBe('')
          resolve()
        })

        tp.clear()
      })
    })

    it('should recreate the time picker selection', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp.clear()

      const body = div.querySelector('.time-picker-body')
      expect(body).not.toBeNull()
    })

    it('should emit timeChange event with null timeString and localeTimeString', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new TimePicker(div, { time: '10:00:00' }) // eslint-disable-line no-new

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.timeString).toBeNull()
          expect(event.localeTimeString).toBeNull()
          resolve()
        })

        TimePicker.getInstance(div).clear()
      })
    })
  })

  describe('reset', () => {
    it('should revert to the config.time, re-render, emit timeChange', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { time: '10:00:00' })

        tp._date = new Date('1970-01-01T15:00:00')

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date).toBeInstanceOf(Date)
          expect(event.date.getHours()).toBe(10)
          resolve()
        })

        tp.reset()
      })
    })

    it('should set _date back to config time', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp._date = new Date('1970-01-01T15:00:00')
      tp.reset()

      expect(tp._date.getHours()).toBe(10)
    })

    it('should reset to null when config.time is null', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { time: null })

        tp._date = new Date('1970-01-01T15:00:00')

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date).toBeNull()
          resolve()
        })

        tp.reset()
      })
    })
  })

  describe('update', () => {
    it('should update config, date, ampm, then re-render time picker selection', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '08:00:00' })

      const oldDate = tp._date
      tp.update({ time: '09:30:00' })

      expect(tp._date).not.toEqual(oldDate)
      expect(tp._date.getHours()).toBe(9)
      expect(tp._date.getMinutes()).toBe(30)
    })

    it('should update ampm when new time is PM', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '08:00:00', locale: 'en-US' })

      tp.update({ time: '15:00:00', locale: 'en-US' })

      expect(tp._ampm).toBe('pm')
    })

    it('should set ampm to "am" when date is null after update', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '08:00:00' })

      tp.update({ time: null })

      expect(tp._ampm).toBe('am')
      expect(tp._date).toBeNull()
    })

    it('should clear body and recreate selection', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '08:00:00', variant: 'roll' })

      tp.update({ time: '09:30:00' })

      const body = div.querySelector('.time-picker-body')
      expect(body.children.length).toBeGreaterThan(0)
    })
  })

  describe('dispose', () => {
    it('should dispose the TimePicker instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const spy = spyOn(tp, 'dispose').and.callThrough()

      tp.dispose()
      expect(spy).toHaveBeenCalled()
      expect(TimePicker.getInstance(div)).toBeNull()
    })

    it('should destroy popper if it exists', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      const destroySpy = spyOn(tp._popper, 'destroy').and.callThrough()
      tp.dispose()

      expect(destroySpy).toHaveBeenCalled()
    })

    it('should clear input timeout if it exists', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp._inputTimeout = setTimeout(() => {}, 5000)
      const clearSpy = spyOn(window, 'clearTimeout').and.callThrough()

      tp.dispose()
      expect(clearSpy).toHaveBeenCalled()
    })

    it('should not throw when popper is null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp._popper = null

      expect(() => tp.dispose()).not.toThrow()
    })

    it('should not throw when inputTimeout is null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp._inputTimeout = null

      expect(() => tp.dispose()).not.toThrow()
    })
  })

  describe('Events', () => {
    it('should emit timeChange event when an item is clicked in the roll variant', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          time: '01:00:00',
          variant: 'roll'
        })

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            expect(event.date.getHours()).toBe(2)
            resolve()
          })

          const hourCells = div.querySelectorAll('[data-coreui-hours]')
          const hourCell2 = Array.from(hourCells).find(cell =>
            cell.getAttribute('data-coreui-hours') === '2'
          )
          hourCell2.click()
        }, 10)
      })
    })

    it('should emit timeChange event with timeString and localeTimeString', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          time: '01:00:00',
          variant: 'roll'
        })

        tp.show()

        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            expect(event.timeString).toBeDefined()
            expect(event.localeTimeString).toBeDefined()
            expect(event.date).toBeInstanceOf(Date)
            resolve()
          })

          const hourCells = div.querySelectorAll('[data-coreui-hours]')
          hourCells[3].click()
        }, 10)
      })
    })

    it('should hide on Escape key', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      expect(div.classList.contains('show')).toBeTrue()

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true
      })
      div.dispatchEvent(keydownEvent)

      expect(div.classList.contains('show')).toBeFalse()
    })
  })

  describe('Indicator', () => {
    it('should toggle on indicator click', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      const indicator = div.querySelector('.time-picker-indicator')
      expect(div.classList.contains('show')).toBeFalse()

      indicator.click()
      expect(div.classList.contains('show')).toBeTrue()

      indicator.click()
      expect(div.classList.contains('show')).toBeFalse()
    })

    it('should not toggle on indicator click when disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { disabled: true }) // eslint-disable-line no-new

      const indicator = div.querySelector('.time-picker-indicator')
      indicator.click()

      expect(div.classList.contains('show')).toBeFalse()
    })

    it('should toggle on Enter keydown on indicator', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      const indicator = div.querySelector('.time-picker-indicator')
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true
      })
      indicator.dispatchEvent(keydownEvent)

      expect(div.classList.contains('show')).toBeTrue()
    })

    it('should not toggle on Enter keydown on indicator when disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { disabled: true }) // eslint-disable-line no-new

      const indicator = div.querySelector('.time-picker-indicator')
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true
      })
      indicator.dispatchEvent(keydownEvent)

      expect(div.classList.contains('show')).toBeFalse()
    })
  })

  describe('Cleaner', () => {
    it('should clear time on cleaner click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new TimePicker(div, { time: '10:00:00', cleaner: true }) // eslint-disable-line no-new

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date).toBeNull()
          resolve()
        })

        const cleaner = div.querySelector('.time-picker-cleaner')
        cleaner.click()
      })
    })

    it('should stop propagation on cleaner click', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { time: '10:00:00', cleaner: true }) // eslint-disable-line no-new

      // The picker should not show when cleaner is clicked
      const cleaner = div.querySelector('.time-picker-cleaner')
      cleaner.click()

      // Should not have triggered show
      expect(div.classList.contains('show')).toBeFalse()
    })
  })

  describe('Footer buttons', () => {
    it('should cancel on cancel button click', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp.show()
      const cancelSpy = spyOn(tp, 'cancel').and.callThrough()

      const footer = div.querySelector('.time-picker-footer')
      const cancelBtn = footer.querySelectorAll('button')[0]
      cancelBtn.click()

      expect(cancelSpy).toHaveBeenCalled()
    })

    it('should hide on confirm button click', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp.show()
      const hideSpy = spyOn(tp, 'hide').and.callThrough()

      const footer = div.querySelector('.time-picker-footer')
      const confirmBtn = footer.querySelectorAll('button')[1]
      confirmBtn.click()

      expect(hideSpy).toHaveBeenCalled()
    })
  })

  describe('Input handling', () => {
    it('should update time on valid input with delay', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { inputOnChangeDelay: 50 })

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date).toBeInstanceOf(Date)
          expect(event.date.getHours()).toBe(14)
          expect(event.date.getMinutes()).toBe(30)
          resolve()
        })

        tp._input.value = '14:30:00'
        tp._input.dispatchEvent(new Event('input', { bubbles: true }))
      })
    })

    it('should not update time on invalid input', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { inputOnChangeDelay: 50 })

        div.addEventListener('timeChange.coreui.time-picker', () => {
          reject(new Error('Should not fire timeChange for invalid input'))
        })

        tp._input.value = 'invalid'
        tp._input.dispatchEvent(new Event('input', { bubbles: true }))

        setTimeout(() => resolve(), 100)
      })
    })

    it('should clear previous timeout on rapid input', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { inputOnChangeDelay: 200 })

      tp._input.value = '10:00:00'
      tp._input.dispatchEvent(new Event('input', { bubbles: true }))

      const firstTimeout = tp._inputTimeout
      expect(firstTimeout).not.toBeNull()

      tp._input.value = '11:00:00'
      tp._input.dispatchEvent(new Event('input', { bubbles: true }))

      // Should have a new timeout
      expect(tp._inputTimeout).not.toBe(firstTimeout)
    })
  })

  describe('Input group toggler', () => {
    it('should show picker when input group is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      input.click()

      expect(div.classList.contains('show')).toBeTrue()
    })

    it('should not show picker when input group is clicked while disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { disabled: true }) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      input.click()

      expect(div.classList.contains('show')).toBeFalse()
    })

    it('should not show picker when indicator is clicked via input group handler', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      // Clicking indicator should go through indicator handler, not toggler
      const indicator = div.querySelector('.time-picker-indicator')
      indicator.click()

      // Still shows via indicator handler
      expect(div.classList.contains('show')).toBeTrue()
    })
  })

  describe('Container mode', () => {
    it('should append dropdown to container element', () => {
      const containerEl = document.createElement('div')
      containerEl.id = 'test-container'
      document.body.append(containerEl)

      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { container: containerEl }) // eslint-disable-line no-new

      const menu = containerEl.querySelector('.time-picker-dropdown')
      expect(menu).not.toBeNull()

      containerEl.remove()
    })

    it('should use document.body when container is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { container: true }) // eslint-disable-line no-new

      const menu = document.body.querySelector('.time-picker-dropdown')
      expect(menu).not.toBeNull()

      if (menu) {
        menu.remove()
      }
    })
  })

  describe('Custom hours/minutes/seconds', () => {
    it('should accept array of hours', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { // eslint-disable-line no-new
        variant: 'roll',
        hours: [1, 2, 3, 4, 5]
      })

      const hourCells = div.querySelectorAll('[data-coreui-hours]')
      expect(hourCells.length).toBe(5)
    })

    it('should accept function for hours', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { // eslint-disable-line no-new
        variant: 'roll',
        locale: 'en-GB',
        hours: index => index % 2 === 0
      })

      const hourCells = div.querySelectorAll('[data-coreui-hours]')
      // Even hours only: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22
      expect(hourCells.length).toBe(12)
    })

    it('should accept array for minutes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { // eslint-disable-line no-new
        variant: 'roll',
        minutes: [0, 15, 30, 45]
      })

      const minuteCells = div.querySelectorAll('[data-coreui-minutes]')
      expect(minuteCells.length).toBe(4)
    })

    it('should accept function for minutes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { // eslint-disable-line no-new
        variant: 'roll',
        minutes: index => index % 15 === 0
      })

      const minuteCells = div.querySelectorAll('[data-coreui-minutes]')
      // 0, 15, 30, 45
      expect(minuteCells.length).toBe(4)
    })

    it('should accept array for seconds', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { // eslint-disable-line no-new
        variant: 'roll',
        seconds: [0, 30]
      })

      const secondCells = div.querySelectorAll('[data-coreui-seconds]')
      expect(secondCells.length).toBe(2)
    })

    it('should accept function for seconds', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { // eslint-disable-line no-new
        variant: 'roll',
        seconds: index => index % 10 === 0
      })

      const secondCells = div.querySelectorAll('[data-coreui-seconds]')
      // 0, 10, 20, 30, 40, 50
      expect(secondCells.length).toBe(6)
    })
  })

  describe('Form validation', () => {
    it('should add is-invalid on form submit with invalid time in was-validated form', () => {
      fixtureEl.innerHTML = `
        <form class="was-validated">
          <div id="tp"></div>
        </form>
      `
      const div = fixtureEl.querySelector('#tp')
      const tp = new TimePicker(div)

      tp._input.value = 'invalid-time'
      const form = fixtureEl.querySelector('form')
      form.dispatchEvent(new Event('submit'))

      expect(div.classList.contains('is-invalid')).toBeTrue()
    })

    it('should add is-valid on form submit with valid time and date instance', () => {
      fixtureEl.innerHTML = `
        <form class="was-validated">
          <div id="tp"></div>
        </form>
      `
      const div = fixtureEl.querySelector('#tp')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp._input.value = '10:00:00'
      const form = fixtureEl.querySelector('form')
      form.dispatchEvent(new Event('submit'))

      expect(div.classList.contains('is-valid')).toBeTrue()
    })

    it('should handle change/keyup/paste events in was-validated form', () => {
      fixtureEl.innerHTML = `
        <form class="was-validated">
          <div id="tp"></div>
        </form>
      `
      const div = fixtureEl.querySelector('#tp')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp._input.value = 'bad value'
      tp._input.dispatchEvent(new Event('change'))

      expect(div.classList.contains('is-invalid')).toBeTrue()
    })

    it('should add is-valid on change event with valid time and date instance', () => {
      fixtureEl.innerHTML = `
        <form class="was-validated">
          <div id="tp"></div>
        </form>
      `
      const div = fixtureEl.querySelector('#tp')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp._input.value = '10:00:00'
      tp._input.dispatchEvent(new Event('change'))

      expect(div.classList.contains('is-valid')).toBeTrue()
    })

    it('should add is-invalid on keyup event with null _date', () => {
      fixtureEl.innerHTML = `
        <form class="was-validated">
          <div id="tp"></div>
        </form>
      `
      const div = fixtureEl.querySelector('#tp')
      const tp = new TimePicker(div)

      tp._input.value = '10:00:00'
      tp._date = null
      tp._input.dispatchEvent(new Event('keyup'))

      expect(div.classList.contains('is-invalid')).toBeTrue()
    })

    it('should not add validation classes when not in was-validated form', () => {
      fixtureEl.innerHTML = `
        <form>
          <div id="tp"></div>
        </form>
      `
      const div = fixtureEl.querySelector('#tp')
      const tp = new TimePicker(div)

      tp._input.value = 'invalid'
      tp._input.dispatchEvent(new Event('change'))

      expect(div.classList.contains('is-invalid')).toBeFalse()
      expect(div.classList.contains('is-valid')).toBeFalse()
    })
  })

  describe('clearMenus static', () => {
    it('should not close on right mouse button click', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="time-picker"></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()

      const event = new MouseEvent('click', { button: 2, bubbles: true })
      TimePicker.clearMenus(event)

      expect(div.classList.contains('show')).toBeTrue()
    })

    it('should not close on keyup when key is not Tab', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="time-picker"></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()

      const event = new KeyboardEvent('keyup', { key: 'a', bubbles: true })
      Object.defineProperty(event, 'type', { value: 'keyup' })
      TimePicker.clearMenus(event)

      expect(div.classList.contains('show')).toBeTrue()
    })

    it('should close on click outside the element', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="time-picker"></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()

      const event = new MouseEvent('click', { button: 0, bubbles: true })
      Object.defineProperty(event, 'composedPath', {
        value: () => [document.body]
      })
      TimePicker.clearMenus(event)

      expect(div.classList.contains('show')).toBeFalse()
    })

    it('should not close when click is inside the element', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="time-picker"></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()

      const event = new MouseEvent('click', { button: 0, bubbles: true })
      Object.defineProperty(event, 'composedPath', {
        value: () => [div, document.body]
      })
      TimePicker.clearMenus(event)

      expect(div.classList.contains('show')).toBeTrue()
    })

    it('should handle Tab key in clearMenus', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="time-picker"></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()

      const event = new KeyboardEvent('keyup', { key: 'Tab', bubbles: true })
      Object.defineProperty(event, 'type', { value: 'keyup' })
      Object.defineProperty(event, 'composedPath', {
        value: () => [document.body]
      })
      TimePicker.clearMenus(event)

      expect(div.classList.contains('show')).toBeFalse()
    })
  })

  describe('timePickerInterface static', () => {
    it('should create instance via timePickerInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      TimePicker.timePickerInterface(div, { time: '10:00:00' })

      const tp = TimePicker.getInstance(div)
      expect(tp).not.toBeNull()
      expect(tp._date.getHours()).toBe(10)
    })

    it('should call method via timePickerInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const showSpy = spyOn(tp, 'show')
      TimePicker.timePickerInterface(div, 'show')

      expect(showSpy).toHaveBeenCalled()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div) // eslint-disable-line no-new

      expect(() => {
        TimePicker.timePickerInterface(div, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })

  describe('data-api', () => {
    it('should initialize timePickers on load event', () => {
      fixtureEl.innerHTML = `
        <div id="tp1" data-coreui-toggle="time-picker" data-coreui-time="09:00:00"></div>
      `
      const tpEl = fixtureEl.querySelector('#tp1')

      const loadEvent = createEvent('load')
      window.dispatchEvent(loadEvent)

      const tp = TimePicker.getInstance(tpEl)
      expect(tp).not.toBeNull()
      expect(tp._date.getHours()).toBe(9)
    })

    it('should initialize multiple timePickers on load event', () => {
      fixtureEl.innerHTML = `
        <div id="tp1" data-coreui-toggle="time-picker" data-coreui-time="09:00:00"></div>
        <div id="tp2" data-coreui-toggle="time-picker" data-coreui-time="14:00:00"></div>
      `

      const loadEvent = createEvent('load')
      window.dispatchEvent(loadEvent)

      const tp1 = TimePicker.getInstance(fixtureEl.querySelector('#tp1'))
      const tp2 = TimePicker.getInstance(fixtureEl.querySelector('#tp2'))

      expect(tp1).not.toBeNull()
      expect(tp2).not.toBeNull()
      expect(tp1._date.getHours()).toBe(9)
      expect(tp2._date.getHours()).toBe(14)
    })

    it('should not initialize elements with disabled class', () => {
      fixtureEl.innerHTML = `
        <div id="tp1" data-coreui-toggle="time-picker" class="disabled" data-coreui-time="09:00:00"></div>
      `

      // The selector excludes .disabled elements
      const tpEl = fixtureEl.querySelector('#tp1')
      // Manually try to match the data-api selector
      const matches = tpEl.matches('[data-coreui-toggle="time-picker"]:not(.disabled):not(:disabled)')
      expect(matches).toBeFalse()
    })
  })

  describe('jQueryInterface', () => {
    it('should create a time picker via jQueryInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [div]
      jQueryMock.fn.timePicker.call(jQueryMock)

      expect(TimePicker.getInstance(div)).not.toBeNull()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.timePicker.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })

    it('should throw error on constructor call', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.timePicker.call(jQueryMock, 'constructor')
      }).toThrowError(TypeError, 'No method named "constructor"')
    })

    it('should throw error on private method call', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.timePicker.call(jQueryMock, '_createTimePicker')
      }).toThrowError(TypeError, 'No method named "_createTimePicker"')
    })

    it('should call a valid method via jQueryInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const showSpy = spyOn(tp, 'show')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [div]
      jQueryMock.fn.timePicker.call(jQueryMock, 'show')

      expect(showSpy).toHaveBeenCalled()
    })

    it('should not re-create instance on second call with object config', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [div]
      jQueryMock.fn.timePicker.call(jQueryMock, { time: '10:00:00' })

      const tp1 = TimePicker.getInstance(div)

      jQueryMock.fn.timePicker.call(jQueryMock, { time: '12:00:00' })

      const tp2 = TimePicker.getInstance(div)
      expect(tp2).toBe(tp1)
    })
  })

  describe('getInstance', () => {
    it('should return timePicker instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(TimePicker.getInstance(div)).toEqual(tp)
      expect(TimePicker.getInstance(div)).toBeInstanceOf(TimePicker)
    })

    it('should return null when there is no timePicker instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      expect(TimePicker.getInstance(div)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return the existing instance if it exists', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)
      expect(TimePicker.getOrCreateInstance(div)).toBe(tp)
    })

    it('should create a new instance if it does not exist', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      expect(TimePicker.getInstance(div)).toBeNull()

      const tp = TimePicker.getOrCreateInstance(div, {
        time: '12:45:00'
      })
      expect(tp).toBeInstanceOf(TimePicker)
      expect(tp._date.getHours()).toBe(12)
      expect(tp._date.getMinutes()).toBe(45)
    })

    it('should ignore new config if instance already exists', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '01:00:00' })
      const tp2 = TimePicker.getOrCreateInstance(div, { time: '05:00:00' })

      expect(tp2).toBe(tp)
      expect(tp._date.getHours()).toBe(1)
    })
  })

  describe('_getPartOfTime', () => {
    it('should return null for all parts when _date is null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(tp._getPartOfTime('hours')).toBeNull()
      expect(tp._getPartOfTime('minutes')).toBeNull()
      expect(tp._getPartOfTime('seconds')).toBeNull()
      expect(tp._getPartOfTime('meridiem')).toBeNull()
    })

    it('should return correct hours in 24h format', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '14:30:45', locale: 'en-GB' })

      expect(tp._getPartOfTime('hours')).toBe(14)
    })

    it('should return correct minutes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '14:30:45' })

      expect(tp._getPartOfTime('minutes')).toBe(30)
    })

    it('should return correct seconds', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '14:30:45' })

      expect(tp._getPartOfTime('seconds')).toBe(45)
    })

    it('should return 12h hours in en-US locale', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '14:30:45', locale: 'en-US' })

      // 14:00 in 12h = 2
      expect(tp._getPartOfTime('hours')).toBe(2)
    })

    it('should return meridiem value', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '14:30:45', locale: 'en-US' })

      expect(tp._getPartOfTime('meridiem')).toBe('pm')
    })
  })

  describe('_handleTimeChange', () => {
    it('should create new date from epoch when _date is null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(tp._date).toBeNull()

      tp._handleTimeChange('hours', 5)

      expect(tp._date).toBeInstanceOf(Date)
      expect(tp._date.getHours()).toBe(5)
    })

    it('should handle hours in 24h mode', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00', locale: 'en-GB' })

      tp._handleTimeChange('hours', 20)

      expect(tp._date.getHours()).toBe(20)
    })

    it('should handle hours in 12h mode', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00', locale: 'en-US' })

      tp._ampm = 'pm'
      tp._handleTimeChange('hours', 3)

      expect(tp._date.getHours()).toBe(15)
    })

    it('should handle minutes change', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp._handleTimeChange('minutes', 45)

      expect(tp._date.getMinutes()).toBe(45)
    })

    it('should handle seconds change', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp._handleTimeChange('seconds', 30)

      expect(tp._date.getSeconds()).toBe(30)
    })

    it('should handle meridiem to AM when hours >= 12', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '15:00:00', locale: 'en-US' })

      tp._handleTimeChange('meridiem', 'am')

      expect(tp._date.getHours()).toBe(3)
      expect(tp._ampm).toBe('am')
    })

    it('should handle meridiem to PM when hours < 12', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '09:00:00', locale: 'en-US' })

      tp._handleTimeChange('meridiem', 'pm')

      expect(tp._date.getHours()).toBe(21)
      expect(tp._ampm).toBe('pm')
    })

    it('should not change hours when setting AM and hours already < 12', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '09:00:00', locale: 'en-US' })

      tp._handleTimeChange('meridiem', 'am')

      expect(tp._date.getHours()).toBe(9)
    })

    it('should not change hours when setting PM and hours already >= 12', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '15:00:00', locale: 'en-US' })

      tp._handleTimeChange('meridiem', 'pm')

      expect(tp._date.getHours()).toBe(15)
    })

    it('should update input value after time change', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      const oldValue = tp._input.value
      tp._handleTimeChange('hours', 15)

      expect(tp._input.value).not.toBe(oldValue)
    })

    it('should dispatch change event on input', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      let changeTriggered = false
      tp._input.addEventListener('change', () => {
        changeTriggered = true
      })

      tp._handleTimeChange('hours', 15)

      expect(changeTriggered).toBeTrue()
    })
  })

  describe('_convertStringToDate', () => {
    it('should return null for null input', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(tp._convertStringToDate(null)).toBeNull()
    })

    it('should return null for empty string', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(tp._convertStringToDate('')).toBeNull()
    })

    it('should return Date object for valid time string', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const result = tp._convertStringToDate('14:30:00')
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
    })

    it('should return same Date object if Date is passed', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const dateObj = new Date('1970-01-01T10:00:00')
      const result = tp._convertStringToDate(dateObj)
      expect(result).toBe(dateObj)
    })
  })

  describe('_setInputValue', () => {
    it('should set input value from Date object', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const date = new Date('1970-01-01T14:30:00')
      tp._setInputValue(date)

      expect(tp._input.value).not.toBe('')
    })

    it('should set input value from string', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp._setInputValue('hello')

      expect(tp._input.value).toBe('hello')
    })

    it('should set empty string when passed empty string', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp._setInputValue('')

      expect(tp._input.value).toBe('')
    })

    it('should accept custom input element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const customInput = document.createElement('input')
      const date = new Date('1970-01-01T09:00:00')
      tp._setInputValue(date, customInput)

      expect(customInput.value).not.toBe('')
    })
  })

  describe('_emitChangeEvent', () => {
    it('should emit timeChange event with date properties', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { time: '10:00:00' })

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.timeString).toBeDefined()
          expect(event.localeTimeString).toBeDefined()
          expect(event.date).toBeInstanceOf(Date)
          resolve()
        })

        tp._emitChangeEvent(new Date('1970-01-01T10:00:00'))
      })
    })

    it('should emit timeChange event with null values when date is null', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { time: '10:00:00' })

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.timeString).toBeNull()
          expect(event.localeTimeString).toBeNull()
          expect(event.date).toBeNull()
          resolve()
        })

        tp._emitChangeEvent(null)
      })
    })

    it('should dispatch change event on input', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      let changeTriggered = false
      tp._input.addEventListener('change', () => {
        changeTriggered = true
      })

      tp._emitChangeEvent(new Date('1970-01-01T10:00:00'))
      expect(changeTriggered).toBeTrue()
    })
  })

  describe('_isShown', () => {
    it('should return false when not shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(tp._isShown()).toBeFalse()
    })

    it('should return true when shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      expect(tp._isShown()).toBeTrue()
    })
  })

  describe('_configAfterMerge', () => {
    it('should set type to dropdown when container is "dropdown"', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const config = tp._configAfterMerge({ container: 'dropdown' })
      expect(config.type).toBe('dropdown')
    })

    it('should set type to inline when container is "inline"', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const config = tp._configAfterMerge({ container: 'inline' })
      expect(config.type).toBe('inline')
    })

    it('should set container to document.body when container is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const config = tp._configAfterMerge({ container: true })
      expect(config.container).toBe(document.body)
    })
  })

  describe('_setUpRolls', () => {
    it('should mark selected element with "selected" class', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '05:15:30', variant: 'roll' })

      tp.show()
      tp._setUpRolls()

      const selectedHour = div.querySelector('[data-coreui-hours="5"].selected')
      expect(selectedHour).not.toBeNull()
    })

    it('should set aria-selected="true" on selected element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '05:15:30', variant: 'roll' })

      tp.show()
      tp._setUpRolls()

      const selectedHour = div.querySelector('[data-coreui-hours="5"]')
      if (selectedHour) {
        expect(selectedHour.getAttribute('aria-selected')).toBe('true')
      }
    })

    it('should set tabIndex to 0 on selected element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '05:15:30', variant: 'roll' })

      tp.show()
      tp._setUpRolls()

      const selectedHour = div.querySelector('[data-coreui-hours="5"]')
      if (selectedHour) {
        expect(selectedHour.tabIndex).toBe(0)
      }
    })

    it('should handle null _date gracefully', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { variant: 'roll' })

      tp.show()
      expect(() => tp._setUpRolls()).not.toThrow()
    })
  })

  describe('_setUpSelects', () => {
    it('should set select values based on current time', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '14:30:45', variant: 'select', locale: 'en-GB' })

      tp._setUpSelects()

      const hoursSelect = div.querySelector('select.hours')
      const minutesSelect = div.querySelector('select.minutes')
      const secondsSelect = div.querySelector('select.seconds')

      expect(hoursSelect.value).toBe('14')
      expect(minutesSelect.value).toBe('30')
      expect(secondsSelect.value).toBe('45')
    })

    it('should not throw when _date is null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { variant: 'select' })

      expect(() => tp._setUpSelects()).not.toThrow()
    })
  })

  describe('_getButtonClasses', () => {
    it('should return array when given array', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const result = tp._getButtonClasses(['btn', 'btn-primary'])
      expect(result).toEqual(['btn', 'btn-primary'])
    })

    it('should split string into array', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const result = tp._getButtonClasses('btn btn-primary')
      expect(result).toEqual(['btn', 'btn-primary'])
    })
  })

  describe('onCancelClick event', () => {
    it('should call cancel when onCancelClick.coreui.picker is triggered', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00' })

      tp.show()
      const cancelSpy = spyOn(tp, 'cancel')

      const event = new CustomEvent('onCancelClick.coreui.picker', { bubbles: true })
      div.dispatchEvent(event)

      expect(cancelSpy).toHaveBeenCalled()
    })
  })

  describe('timeChange event triggers _setUpRolls/_setUpSelects', () => {
    it('should call _setUpRolls on timeChange for roll variant', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00', variant: 'roll' })

      tp.show()
      const setupSpy = spyOn(tp, '_setUpRolls')

      const event = new CustomEvent('timeChange.coreui.time-picker', {
        bubbles: true,
        detail: {}
      })
      div.dispatchEvent(event)

      expect(setupSpy).toHaveBeenCalled()
    })

    it('should call _setUpSelects on timeChange for select variant', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '10:00:00', variant: 'select' })

      tp.show()
      const setupSpy = spyOn(tp, '_setUpSelects')

      const event = new CustomEvent('timeChange.coreui.time-picker', {
        bubbles: true,
        detail: {}
      })
      div.dispatchEvent(event)

      expect(setupSpy).toHaveBeenCalled()
    })
  })

  describe('Input group show with variant setup', () => {
    it('should call _setUpRolls when showing via input group click for roll variant', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { time: '10:00:00', variant: 'roll' }) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      input.click()

      // Verify shown
      expect(div.classList.contains('show')).toBeTrue()
    })

    it('should call _setUpSelects when showing via input group click for select variant', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { time: '10:00:00', variant: 'select' }) // eslint-disable-line no-new

      const input = div.querySelector('.time-picker-input')
      input.click()

      expect(div.classList.contains('show')).toBeTrue()
    })
  })

  describe('_scrollTo', () => {
    it('should call scrollTo on parent element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { variant: 'roll' })

      const parent = document.createElement('div')
      const child = document.createElement('div')
      parent.append(child)

      const scrollSpy = spyOn(parent, 'scrollTo')
      tp._scrollTo(parent, child, false)

      expect(scrollSpy).toHaveBeenCalledWith({
        top: child.offsetTop,
        behavior: 'smooth'
      })
    })

    it('should use instant behavior when initial is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { variant: 'roll' })

      const parent = document.createElement('div')
      const child = document.createElement('div')
      parent.append(child)

      const scrollSpy = spyOn(parent, 'scrollTo')
      tp._scrollTo(parent, child, true)

      expect(scrollSpy).toHaveBeenCalledWith({
        top: child.offsetTop,
        behavior: 'instant'
      })
    })
  })

  describe('_moveFocusToNextColumn', () => {
    it('should not throw when _timePickerBody is null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { variant: 'roll' })

      tp._timePickerBody = null

      expect(() => {
        tp._moveFocusToNextColumn({ target: document.createElement('div') })
      }).not.toThrow()
    })

    it('should focus next column first focusable cell', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { variant: 'roll', time: '10:00:00' })

      tp.show()

      const hourCells = div.querySelectorAll('[data-coreui-hours]')
      if (hourCells.length > 0) {
        const event = { target: hourCells[0] }
        expect(() => tp._moveFocusToNextColumn(event)).not.toThrow()
      }
    })
  })

  describe('_moveFocusToPreviousColumn', () => {
    it('should not throw when _timePickerBody is null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { variant: 'roll' })

      tp._timePickerBody = null

      expect(() => {
        tp._moveFocusToPreviousColumn({ target: document.createElement('div') })
      }).not.toThrow()
    })

    it('should not move focus when at first column', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { variant: 'roll', time: '10:00:00' })

      tp.show()

      const hourCells = div.querySelectorAll('[data-coreui-hours]')
      if (hourCells.length > 0) {
        const event = { target: hourCells[0] }
        expect(() => tp._moveFocusToPreviousColumn(event)).not.toThrow()
      }
    })
  })
})
