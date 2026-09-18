/*!
 * The `.size` helper animates the box of an element that comes and goes, which
 * takes both a stylesheet and a browser that can interpolate `auto`. The unit
 * suite loads no CSS, so nothing there sees any of it. The alert is the vehicle
 * here because its JavaScript is what marks the exit.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Alert from '../../src/alert.js'
import { getTransitionDurationFromElement } from '../../src/util/index.js'

const INTERPOLATES_SIZE = CSS.supports('interpolate-size: allow-keywords')

let host

const mount = classes => {
  host ||= document.createElement('div')
  host.append(document.createElement('div'))
  document.body.append(host)

  const element = host.lastElementChild
  element.className = classes
  element.setAttribute('role', 'alert')
  element.innerHTML = [
    '<div><h4 class="alert-heading">Well done!</h4><p class="mb-0">A message long enough to wrap.</p></div>',
    '<button class="btn-close" type="button" data-coreui-dismiss="alert"></button>'
  ].join('')

  return element
}

// Seeking the transitions themselves, rather than waiting on a clock, keeps the
// measurement off the frame rate of the machine running the suite.
const seek = (element, time) => {
  const transitions = element.getAnimations()

  for (const transition of transitions) {
    transition.pause()
    transition.currentTime = time
  }

  return new Set(transitions.map(transition => transition.transitionProperty))
}

const settle = element => {
  for (const transition of element.getAnimations()) {
    transition.finish()
  }

  return element.getBoundingClientRect().height
}

afterEach(() => {
  host?.remove()
  host = null
})

describe('Size helper', () => {
  it('collapses the box of an alert on its way out', () => {
    const alertEl = mount('alert size')
    const { height } = alertEl.getBoundingClientRect()

    new Alert(alertEl).close()

    const properties = seek(alertEl, 75)

    expect(properties.has('opacity')).toBeTrue()
    expect(properties.has('height')).toBe(INTERPOLATES_SIZE)

    if (INTERPOLATES_SIZE) {
      expect(alertEl.getBoundingClientRect().height).toBeLessThan(height)
      expect(alertEl.getBoundingClientRect().height).toBeGreaterThan(0)
    } else {
      expect(alertEl.getBoundingClientRect().height).toBe(height)
    }
  })

  it('grows the box of an alert inserted with the class on', () => {
    const reference = settle(mount('alert fade show'))
    const alertEl = mount('alert fade size show')

    seek(alertEl, 75)

    if (INTERPOLATES_SIZE) {
      expect(alertEl.getBoundingClientRect().height).toBeLessThan(reference)
      expect(alertEl.getBoundingClientRect().height).toBeGreaterThan(0)
    }

    expect(settle(alertEl)).toBe(reference)
  })

  it('zeroes the box under the utilities it has to outrank', () => {
    const reference = mount('alert py-5 mb-5')
    const alertEl = mount('alert size py-5 mb-5 opacity-100')
    const { height } = alertEl.getBoundingClientRect()

    new Alert(alertEl).close()

    seek(alertEl, 75)

    if (INTERPOLATES_SIZE) {
      expect(alertEl.getBoundingClientRect().height).toBeLessThan(height)
      expect(Number.parseFloat(getComputedStyle(alertEl).marginBottom)).toBeLessThan(
        Number.parseFloat(getComputedStyle(reference).marginBottom)
      )
      expect(Number.parseFloat(getComputedStyle(alertEl).opacity)).toBeLessThan(1)
    }
  })

  it('fades markup of its own in as the box grows', () => {
    const element = mount('fade size show')

    seek(element, 1)

    if (INTERPOLATES_SIZE) {
      expect(Number.parseFloat(getComputedStyle(element).opacity)).toBeLessThan(0.1)
      expect(element.getBoundingClientRect().height).toBeLessThan(10)
    }
  })

  it('leaves the timing to the alert', () => {
    const alertEl = mount('alert size')
    alertEl.style.setProperty('--cui-alert-transition-duration', '.6s')

    expect(getTransitionDurationFromElement(alertEl)).toBe(600)
  })

  it('moves nothing for an alert that goes at once', () => {
    const alertEl = mount('alert alert-instant size')

    new Alert(alertEl).close()

    expect(alertEl.getAnimations().length).toBe(0)
    expect(getTransitionDurationFromElement(alertEl)).toBe(0)
  })

  it('takes a hidden element out of the layout and the tab order', () => {
    const alertEl = mount('alert fade size')
    const dismissEl = alertEl.querySelector('.btn-close')

    settle(alertEl)
    dismissEl.focus()

    if (INTERPOLATES_SIZE) {
      expect(getComputedStyle(alertEl).display).toBe('none')
      expect(document.activeElement).not.toBe(dismissEl)
    }
  })

  it('holds a leaving alert on screen until its box reaches zero', () => {
    const alertEl = mount('alert size')
    // The rect is what commits the state the exit starts from.
    alertEl.getBoundingClientRect()

    new Alert(alertEl).close()

    seek(alertEl, 75)

    if (INTERPOLATES_SIZE) {
      expect(getComputedStyle(alertEl).display).not.toBe('none')
      expect(settle(alertEl)).toBe(0)
      expect(getComputedStyle(alertEl).display).toBe('none')
    }
  })

  it('leaves the box of an alert without the class alone', () => {
    const alertEl = mount('alert')
    const { height } = alertEl.getBoundingClientRect()

    new Alert(alertEl).close()

    const properties = seek(alertEl, 75)

    expect([...properties]).toEqual(['opacity'])
    expect(alertEl.getBoundingClientRect().height).toBe(height)
  })
})
