/*!
 * Visual state matrix for the field components — the surfaces built on the
 * `form-control-group` and `.popup` primitives, where a change to one shared
 * rule reaches six components at once and no unit test sees a pixel.
 *
 * Determinism rules: fixed dates only (never `new Date()`), transitions and
 * animations off, caret hidden, fixed viewport, screenshots per element.
 * The matcher waits for consecutive identical frames, which absorbs popup
 * positioning. Baseline names carry the platform suffix.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { page } from 'vitest/browser'
import Autocomplete from '../../src/autocomplete.js'
import ChipInput from '../../src/chip-input.js'
import DatePicker from '../../src/date-picker.js'
import DateRangePicker from '../../src/date-range-picker.js'
import DateTimePicker from '../../src/date-time-picker.js'
import MultiSelect from '../../src/multi-select.js'
import PasswordInput from '../../src/password-input.js'
import TimePicker from '../../src/time-picker.js'

const DATE = new Date(2026, 6, 14)
const DATE_END = new Date(2026, 6, 20)
const TIME = new Date(2026, 0, 1, 14, 30)
const PAST = new Date(2020, 0, 10)

const OPTIONS = [
  { value: 1, label: 'Angular' },
  { value: 2, label: 'Bootstrap' },
  { value: 3, label: 'React' },
  { value: 4, label: 'Vue' }
]

const screenshotOptions = {
  comparatorOptions: {
    allowedMismatchedPixelRatio: 0.01
  }
}

let container

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 480px;'
  container.innerHTML = html || '<div id="host"></div>'
  document.body.append(container)
  return container.querySelector('#host')
}

// The matcher appends the browser and platform to the baseline name itself
// (`<name>-chromium-linux.png`), so each platform compares against its own set.
const shoot = (element, name) =>
  expect(page.elementLocator(element)).toMatchScreenshot(name, screenshotOptions)

const frame = () => container.querySelector('.form-control-group')
const popup = () => container.querySelector('.popup')

beforeAll(async () => {
  await page.viewport(640, 760)

  const style = document.createElement('style')
  style.id = 'visual-freeze'
  style.textContent = `
    *, *::before, *::after { transition: none !important; animation: none !important; }
    * { caret-color: transparent !important; }
  `
  document.head.append(style)
})

afterEach(() => {
  container?.remove()
  container = null
  delete document.documentElement.dataset.coreuiTheme
})

describe('date picker', () => {
  it('empty', async () => {
    const dp = new DatePicker(mount(), { locale: 'en-US' })
    await shoot(frame(), 'date-picker-empty')
    dp.dispose()
  })

  it('filled', async () => {
    const dp = new DatePicker(mount(), { locale: 'en-US', date: DATE })
    await shoot(frame(), 'date-picker-filled')
    dp.dispose()
  })

  it('invalid', async () => {
    const dp = new DatePicker(mount(), { locale: 'en-US', date: DATE, maxDate: PAST })
    await shoot(frame(), 'date-picker-invalid')
    dp.dispose()
  })

  it('valid', async () => {
    const dp = new DatePicker(mount(), { locale: 'en-US', date: DATE, valid: true })
    await shoot(frame(), 'date-picker-valid')
    dp.dispose()
  })

  it('disabled', async () => {
    const dp = new DatePicker(mount(), { locale: 'en-US', date: DATE, disabled: true })
    await shoot(frame(), 'date-picker-disabled')
    dp.dispose()
  })

  // One screenshot per test: creating a missing baseline aborts the test, so a
  // second screenshot in the same `it` would never get its baseline on the
  // first pass.
  it('small', async () => {
    const dp = new DatePicker(mount(), { locale: 'en-US', date: DATE, size: 'sm' })
    await shoot(frame(), 'date-picker-sm')
    dp.dispose()
  })

  it('large', async () => {
    const dp = new DatePicker(mount(), { locale: 'en-US', date: DATE, size: 'lg' })
    await shoot(frame(), 'date-picker-lg')
    dp.dispose()
  })

  it('open popup', async () => {
    const dp = new DatePicker(mount(), { locale: 'en-US', date: DATE })
    dp.show()
    await shoot(popup(), 'date-picker-popup')
    dp.dispose()
  })

  it('filled in dark mode', async () => {
    document.documentElement.dataset.coreuiTheme = 'dark'
    const dp = new DatePicker(mount(), { locale: 'en-US', date: DATE })
    await shoot(frame(), 'date-picker-filled-dark')
    dp.dispose()
  })

  it('open popup in dark mode', async () => {
    document.documentElement.dataset.coreuiTheme = 'dark'
    const dp = new DatePicker(mount(), { locale: 'en-US', date: DATE })
    dp.show()
    await shoot(popup(), 'date-picker-popup-dark')
    dp.dispose()
  })
})

describe('time picker', () => {
  it('filled', async () => {
    const tp = new TimePicker(mount(), { locale: 'en-US', time: TIME })
    await shoot(frame(), 'time-picker-filled')
    tp.dispose()
  })
})

describe('date range picker', () => {
  it('range filled', async () => {
    const drp = new DateRangePicker(mount(), { locale: 'en-US', startDate: DATE, endDate: DATE_END })
    await shoot(frame(), 'date-range-picker-filled')
    drp.dispose()
  })
})

describe('date time picker', () => {
  it('filled', async () => {
    const dtp = new DateTimePicker(mount(), { locale: 'en-US', date: DATE })
    await shoot(frame(), 'date-time-picker-filled')
    dtp.dispose()
  })
})

describe('autocomplete', () => {
  it('with value', async () => {
    const ac = new Autocomplete(mount(), {
      options: OPTIONS, value: 'Bootstrap', cleaner: true, indicator: true
    })
    await shoot(frame(), 'autocomplete-value')
    ac.dispose()
  })

  it('disabled', async () => {
    const ac = new Autocomplete(mount(), {
      options: OPTIONS, value: 'Vue', indicator: true, disabled: true
    })
    await shoot(frame(), 'autocomplete-disabled')
    ac.dispose()
  })

  it('open popup', async () => {
    const ac = new Autocomplete(mount(), { options: OPTIONS, indicator: true })
    ac.show()
    await shoot(popup(), 'autocomplete-popup')
    ac.dispose()
  })
})

const mountSelect = () => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 480px;'
  container.innerHTML = `<select id="host" multiple>
      <option value="1" selected>Angular</option>
      <option value="2" selected>Bootstrap</option>
      <option value="3">React</option>
    </select>`
  document.body.append(container)
  return container.querySelector('#host')
}

describe('multi select', () => {
  it('chips selection', async () => {
    const ms = new MultiSelect(mountSelect(), { cleaner: true })
    await shoot(frame(), 'multi-select-chips')
    ms.dispose()
  })

  it('chips selection in dark mode', async () => {
    document.documentElement.dataset.coreuiTheme = 'dark'
    const ms = new MultiSelect(mountSelect(), { cleaner: true })
    await shoot(frame(), 'multi-select-chips-dark')
    ms.dispose()
  })
})

describe('chip input', () => {
  it('with chips', async () => {
    mount('<div id="host" class="form-control-group chip-input"></div>')
    const ci = new ChipInput(container.querySelector('#host'), {})
    ci.add('Angular')
    ci.add('Bootstrap')
    await shoot(frame(), 'chip-input-chips')
    ci.dispose()
  })
})

const markup = disabled => `<div id="host" class="form-control-group">
    <input type="password" class="form-control" value="secret123" aria-label="Password"${disabled ? ' disabled' : ''}>
    <button type="button" class="form-control-action" data-coreui-toggle="password" aria-label="Toggle"${disabled ? ' disabled' : ''}>
      <span class="form-password-action-icon"></span>
    </button>
  </div>`

describe('password input', () => {
  it('default', async () => {
    mount(markup(false))
    await shoot(frame(), 'password-default')
  })

  it('disabled', async () => {
    mount(markup(true))
    await shoot(frame(), 'password-disabled')
  })
})

// PasswordInput initializes through the data API; importing it registers that
// listener in the first place.
expect(PasswordInput.NAME).toBe('password-input')
