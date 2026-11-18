/*!
 * The level text of the password strength meter reads as text in every level
 * and theme, while the segments keep the level color. Only the stylesheet
 * decides it, so only a real browser with it can tell.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

const LEVELS = [['0', 'danger'], ['1', 'danger'], ['2', 'warning'], ['3', 'info'], ['4', 'success']]

let host

const rgb = color => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3)
}

const luminance = color => {
  const [r, g, b] = rgb(color).map(value => {
    const channel = value / 255
    return channel <= 0.040_45 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b)
}

const contrast = (a, b) => {
  const lighter = Math.max(luminance(a), luminance(b))
  const darker = Math.min(luminance(a), luminance(b))
  return (lighter + 0.05) / (darker + 0.05)
}

const mount = (theme, level, extraClass = '') => {
  host = document.createElement('div')
  host.dataset.coreuiTheme = theme
  host.style.backgroundColor = 'var(--cui-bg-body)'
  host.innerHTML = [
    `<div class="password-strength ${extraClass}" data-coreui-strength="${level}">`,
    '  <div class="password-strength-meter"><span class="password-strength-segment active"></span></div>',
    '  <span class="password-strength-text">Level</span>',
    '  <span id="probe"></span>',
    '</div>'
  ].join('')
  document.body.append(host)
  return host
}

const resolve = variable => {
  const probe = host.querySelector('#probe')
  probe.style.color = `var(${variable})`
  return getComputedStyle(probe).color
}

afterEach(() => {
  host?.remove()
  host = null
})

describe('password strength text', () => {
  describe.each(['light', 'dark'])('in the %s theme', theme => {
    it.each(LEVELS)('reads the level %s text at 4.5:1 or more', (level, name) => {
      mount(theme, level)
      const { color } = getComputedStyle(host.querySelector('.password-strength-text'))

      expect(color).toEqual(resolve(`--cui-${name}-fg-emphasis`))
      expect(contrast(color, getComputedStyle(host).backgroundColor)).toBeGreaterThanOrEqual(4.5)
    })

    it.each(LEVELS)('keeps the level %s segment in the level color', (level, name) => {
      mount(theme, level)

      expect(getComputedStyle(host.querySelector('.password-strength-segment')).backgroundColor).toEqual(resolve(`--cui-${name}-base`))
    })
  })

  it('dims the text while a check is running, whatever the level', () => {
    mount('light', '4', 'password-strength-busy')

    expect(getComputedStyle(host.querySelector('.password-strength-text')).color).toEqual(resolve('--cui-password-strength-suggestions-color'))
  })
})
