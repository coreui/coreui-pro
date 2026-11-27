/*!
 * In forced colors mode the browser replaces author colors with system colors,
 * so a part drawn only with a background disappears and a transparent border
 * turns into a solid one. Avatars, progress bars, spinners, the stepper, the
 * vertical rule, masked icons and the popover and tooltip arrows have to stay
 * visible. Only the stylesheet decides it, so only a real browser with it can tell.
 */

import { cdp, page, userEvent } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Rating from '../../src/rating.js'
import Stepper from '../../src/stepper.js'

let host

const mount = html => {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host
}

const resolved = (property, value) => {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host.append(probe)
  const result = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return result
}

const authorColor = value => {
  const probe = document.createElement('span')
  probe.style.cssText = `forced-color-adjust: none; background-color: ${value}`
  host.append(probe)
  const result = getComputedStyle(probe).backgroundColor
  probe.remove()
  return result
}

const desktop = async () => {
  const size = [window.innerWidth, window.innerHeight]
  await page.viewport(1200, 800)
  return () => page.viewport(...size)
}

const forceColors = () => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })

const expectOutline = element => {
  const style = getComputedStyle(element)
  expect(style.outlineStyle).toBe('solid')
  expect(style.outlineWidth).toBe('1px')
  expect(style.outlineColor).toBe(resolved('outline-color', 'CanvasText'))
}

const OUTLINED = [
  ['a text avatar', '<span class="avatar" id="part">CUI</span>'],
  ['a progress track', '<div class="progress" id="part"><div class="progress-bar" style="width: 50%"></div></div>'],
  ['a stacked progress track', '<div class="progress-stacked" id="part"><div class="progress" style="width: 50%"><div class="progress-bar"></div></div></div>'],
  ['a progress bar', '<div class="progress"><div class="progress-bar" id="part" style="width: 50%">50%</div></div>'],
  ['a growing spinner', '<div class="spinner-grow" id="part" role="status"></div>'],
  ['a tooltip', '<div class="tooltip bs-tooltip-top show" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner" id="part">Tip</div></div>'],
  ['a vertical rule', '<div style="display: flex; height: 2rem"><div class="vr" id="part"></div></div>']
]

const MASKED = [
  ['a close button', '<button type="button" class="btn-close" id="part" aria-label="Close"></button>'],
  ['a carousel previous icon', '<span class="carousel-control-prev-icon" id="part"></span>'],
  ['a carousel next icon', '<span class="carousel-control-next-icon" id="part"></span>'],
  ['a carousel pause icon', '<span class="carousel-control-pause-icon" id="part"></span>'],
  ['a navbar toggler icon', '<button type="button" class="navbar-toggler"><span class="navbar-toggler-icon" id="part"></span></button>'],
  ['a header toggler icon', '<button type="button" class="header-toggler"><span class="header-toggler-icon" id="part"></span></button>']
]

const MASKED_PSEUDO = [
  ['a sidebar toggler', '<div class="sidebar"><div class="sidebar-footer"><button type="button" class="sidebar-toggler" id="part" aria-label="Toggle"></button></div></div>', '::before'],
  ['a sidebar nav group indicator', '<div class="sidebar"><ul class="sidebar-nav"><li class="nav-group"><a class="nav-link nav-group-toggle" id="part" href="#">Group</a><ul class="nav-group-items"><li class="nav-item"><a class="nav-link" href="#">Item</a></li></ul></li></ul></div>', '::after'],
  ['an accordion header indicator', '<div class="accordion"><details class="accordion-item"><summary class="accordion-header" id="part">Title</summary><div class="accordion-body">Body</div></details></div>', '::after'],
  ['a range tick', '<div class="form-range"><input type="range" class="form-range-input"><div class="form-range-ticks"><div class="form-range-tick" id="part"></div></div></div>', '::before']
]

const STEPPER = [
  '<div class="stepper">',
  '<ol class="stepper-steps">',
  '<li class="stepper-step"><button type="button" class="stepper-step-button active" data-coreui-target="#forcedPane1"><span class="stepper-step-indicator">1</span><span class="stepper-step-label">One</span></button></li>',
  '<li class="stepper-step"><button type="button" class="stepper-step-button" data-coreui-target="#forcedPane2"><span class="stepper-step-indicator">2</span><span class="stepper-step-label">Two</span></button></li>',
  '</ol>',
  '<div class="stepper-content"><div class="stepper-pane show active" id="forcedPane1">One</div><div class="stepper-pane" id="forcedPane2">Two</div></div>',
  '</div>'
].join('')

const STEPPER_THREE = [
  '<div class="stepper">',
  '<ol class="stepper-steps">',
  '<li class="stepper-step"><button type="button" class="stepper-step-button active" data-coreui-target="#forcedStep1"><span class="stepper-step-indicator">1</span><span class="stepper-step-label">One</span></button></li>',
  '<li class="stepper-step"><button type="button" class="stepper-step-button" data-coreui-target="#forcedStep2"><span class="stepper-step-indicator">2</span><span class="stepper-step-label">Two</span></button></li>',
  '<li class="stepper-step"><button type="button" class="stepper-step-button" data-coreui-target="#forcedStep3"><span class="stepper-step-indicator">3</span><span class="stepper-step-label">Three</span></button></li>',
  '</ol>',
  '<div class="stepper-content"><div class="stepper-pane show active" id="forcedStep1">One</div><div class="stepper-pane" id="forcedStep2">Two</div><div class="stepper-pane" id="forcedStep3">Three</div></div>',
  '</div>'
].join('')

const CAROUSEL_INDICATORS = [
  '<div class="carousel" style="position: relative; height: 4rem">',
  '<div class="carousel-indicators">',
  '<button type="button" class="active" data-coreui-target="#forcedSlides" data-coreui-slide-to="0" aria-label="Slide 1"></button>',
  '<button type="button" data-coreui-target="#forcedSlides" data-coreui-slide-to="1" aria-label="Slide 2"></button>',
  '</div>',
  '</div>'
].join('')

const ARROW_SIDES = {
  top: 'borderTopColor',
  end: 'borderRightColor',
  bottom: 'borderBottomColor',
  start: 'borderLeftColor'
}

const PLACEMENTS = [
  ['top', 'bs-{name}-top', ''],
  ['end', 'bs-{name}-end', ''],
  ['bottom', 'bs-{name}-bottom', ''],
  ['start', 'bs-{name}-start', ''],
  ['top', 'bs-{name}-auto', ' data-coreui-placement="top"'],
  ['start', 'bs-{name}-auto', ' data-coreui-placement="left"']
]

const expectTriangle = (arrow, side) => {
  const before = getComputedStyle(arrow, '::before')
  for (const [name, property] of Object.entries(ARROW_SIDES)) {
    expect(before[property]).withContext(name).toBe(resolved('border-color', name === side ? 'CanvasText' : 'Canvas'))
  }
}

describe('forced colors indicators', () => {
  let stepper

  beforeAll(() => {
    const style = document.createElement('style')
    style.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
    document.head.append(style)
  })

  afterEach(async () => {
    stepper?.dispose()
    stepper = null
    host?.remove()
    host = null
    await cdp().send('Emulation.setEmulatedMedia', { features: [] })
  })

  for (const [name, html] of OUTLINED) {
    it(`should outline ${name} in forced colors`, async () => {
      await forceColors()
      mount(html)

      expectOutline(host.querySelector('#part'))
    })
  }

  for (const [name, html] of MASKED) {
    it(`should paint ${name} with CanvasText in forced colors`, async () => {
      await forceColors()
      mount(html)

      expect(getComputedStyle(host.querySelector('#part')).backgroundColor).toBe(resolved('background-color', 'CanvasText'))
    })
  }

  for (const [name, html, pseudo] of MASKED_PSEUDO) {
    it(`should paint ${name} with CanvasText in forced colors`, async () => {
      await forceColors()
      mount(html)

      expect(getComputedStyle(host.querySelector('#part'), pseudo).backgroundColor).toBe(resolved('background-color', 'CanvasText'))
    })
  }

  for (const [name, html, pseudo] of MASKED_PSEUDO.slice(0, 2)) {
    it(`should paint ${name} with CanvasText under the pointer in forced colors`, async () => {
      const restore = await desktop()
      await forceColors()
      mount(html)
      const part = host.querySelector('#part')
      await userEvent.hover(part)

      expect(part.matches(':hover')).toBeTrue()
      expect(getComputedStyle(part, pseudo).backgroundColor).toBe(resolved('background-color', 'CanvasText'))
      await userEvent.unhover(part)
      await restore()
    })
  }

  it('should paint the focused sidebar toggler with CanvasText in forced colors', async () => {
    const restore = await desktop()
    await forceColors()
    mount(MASKED_PSEUDO[0][1])
    const toggler = host.querySelector('#part')
    await userEvent.keyboard('{Shift}')
    toggler.focus()

    expect(toggler.matches(':focus-visible')).toBeTrue()
    expect(getComputedStyle(toggler, '::before').backgroundColor).toBe(resolved('background-color', 'CanvasText'))
    await restore()
  })

  it('should paint rated stars with Highlight and the others with CanvasText in forced colors', async () => {
    await forceColors()
    mount('<div id="rating"></div>')
    const rating = new Rating(host.querySelector('#rating'), { value: 2 })
    const labels = [...host.querySelectorAll('.rating-item-label')]
    const icon = label => getComputedStyle(label.querySelector('.rating-item-icon')).backgroundColor

    expect(labels).toHaveSize(5)
    expect(labels.map(label => label.classList.contains('active'))).toEqual([true, true, false, false, false])
    expect(icon(labels[0])).toBe(resolved('background-color', 'Highlight'))
    expect(getComputedStyle(labels[0]).color).toBe(resolved('color', 'Highlight'))
    expect(icon(labels[4])).toBe(resolved('background-color', 'CanvasText'))
    rating.dispose()
  })

  it('should paint the previewed stars of a hovered rating with Highlight in forced colors', async () => {
    await forceColors()
    mount('<div id="rating"></div>')
    const rating = new Rating(host.querySelector('#rating'))
    const labels = [...host.querySelectorAll('.rating-item-label')]
    await userEvent.hover(labels[2])

    expect(labels[2]).toHaveClass('active')
    expect(getComputedStyle(labels[2].querySelector('.rating-item-icon')).backgroundColor).toBe(resolved('background-color', 'Highlight'))
    expect(getComputedStyle(labels[3].querySelector('.rating-item-icon')).backgroundColor).toBe(resolved('background-color', 'CanvasText'))
    await userEvent.unhover(labels[2])
    rating.dispose()
  })

  it('should paint a white progress bar with Highlight in forced colors', async () => {
    await forceColors()
    mount('<div class="progress progress-white"><div class="progress-bar" style="width: 50%"></div></div>')

    expect(getComputedStyle(host.querySelector('.progress-bar')).backgroundColor).toBe(resolved('background-color', 'Highlight'))
  })

  it('should give the active step and a completed connector Highlight, and leave pending ones in CanvasText, in forced colors', async () => {
    await forceColors()
    mount(STEPPER_THREE)
    stepper = new Stepper(host.querySelector('.stepper'))
    stepper.next()

    const [completed, active, pending] = host.querySelectorAll('.stepper-step-button')
    const [completedConnector, pendingConnector] = host.querySelectorAll('.stepper-step-connector')
    const border = button => getComputedStyle(button.querySelector('.stepper-step-indicator')).borderTopColor

    expect(completed).toHaveClass('complete')
    expect(active).toHaveClass('active')
    expect(border(active)).toBe(resolved('border-color', 'Highlight'))
    expect(border(pending)).toBe(resolved('border-color', 'CanvasText'))
    expect(getComputedStyle(completedConnector).outlineColor).toBe(resolved('outline-color', 'Highlight'))
    expect(getComputedStyle(pendingConnector).outlineColor).toBe(resolved('outline-color', 'CanvasText'))
  })

  it('should draw carousel indicators as CanvasText bars on Canvas in forced colors', async () => {
    await forceColors()
    mount(CAROUSEL_INDICATORS)
    const [active, other] = host.querySelectorAll('.carousel-indicators button')

    for (const indicator of [active, other]) {
      const style = getComputedStyle(indicator)
      expect(style.backgroundColor).toBe(resolved('background-color', 'CanvasText'))
      expect(style.borderTopColor).toBe(resolved('border-color', 'Canvas'))
      expect(style.borderBottomColor).toBe(resolved('border-color', 'Canvas'))
    }

    expect(getComputedStyle(active).opacity).toBe('1')
    expect(getComputedStyle(other).opacity).toBe('0.5')
  })

  it('should paint the autoplay progress of the active carousel indicator with Highlight in forced colors', async () => {
    await forceColors()
    mount(CAROUSEL_INDICATORS.replace('class="carousel"', 'class="carousel carousel-playing"'))

    expect(getComputedStyle(host.querySelector('.carousel-indicators .active'), '::after').backgroundColor).toBe(resolved('background-color', 'Highlight'))
  })

  it('should keep the author color of an avatar status in forced colors', async () => {
    await forceColors()
    mount('<span class="avatar">CUI<span class="avatar-status theme-success" role="img" aria-label="Online"></span></span>')
    const status = host.querySelector('.avatar-status')

    expect(getComputedStyle(status).forcedColorAdjust).toBe('none')
    expect(getComputedStyle(status).backgroundColor).not.toBe(resolved('background-color', 'Canvas'))
    expect(getComputedStyle(status).backgroundColor).toBe(authorColor('var(--cui-success-bg)'))
  })

  it('should paint a progress bar with Highlight and its label with CanvasText in forced colors', async () => {
    await forceColors()
    mount('<div class="progress"><div class="progress-bar" style="width: 50%">50%</div></div>')
    const bar = host.querySelector('.progress-bar')

    expect(getComputedStyle(bar).backgroundColor).toBe(resolved('background-color', 'Highlight'))
    expect(getComputedStyle(bar).color).toBe(resolved('color', 'CanvasText'))
  })

  it('should keep the gap of a border spinner in forced colors', async () => {
    await forceColors()
    mount('<div class="spinner-border" role="status"></div>')
    const spinner = getComputedStyle(host.querySelector('.spinner-border'))

    expect(spinner.borderRightColor).toBe(resolved('border-color', 'Canvas'))
    expect(spinner.borderTopColor).toBe(resolved('border-color', 'CanvasText'))
  })

  it('should outline the stepper connector and paint the completed mark in forced colors', async () => {
    await forceColors()
    mount(STEPPER)
    stepper = new Stepper(host.querySelector('.stepper'))
    stepper.next()

    const completed = host.querySelector('.stepper-step-button.complete')
    const icon = completed.querySelector('.stepper-step-indicator-icon')

    expect(getComputedStyle(icon).display).toBe('block')
    expect(getComputedStyle(icon).backgroundColor).toBe(resolved('background-color', 'CanvasText'))
    expect(getComputedStyle(host.querySelector('.stepper-step-connector')).outlineStyle).toBe('solid')
    expect(getComputedStyle(host.querySelector('.stepper-step-connector')).outlineWidth).toBe('1px')
  })

  for (const [name, html] of [
    ['popover', '<div class="popover {placement} show" role="tooltip"{attributes}><div class="popover-arrow"></div><div class="popover-body">Body</div></div>'],
    ['tooltip', '<div class="tooltip {placement} show" role="tooltip"{attributes}><div class="tooltip-arrow"></div><div class="tooltip-inner">Tip</div></div>']
  ]) {
    for (const [side, placement, attributes] of PLACEMENTS) {
      it(`should draw the ${name} arrow as a triangle in forced colors, ${placement.replace('{name}', name)}${attributes}`, async () => {
        await forceColors()
        mount(html.replace('{placement}', placement.replace('{name}', name)).replace('{attributes}', attributes))
        const arrow = host.querySelector(`.${name}-arrow`)

        expectTriangle(arrow, side)
        if (name === 'popover') {
          expect(getComputedStyle(arrow, '::after').display).toBe('none')
        }
      })
    }
  }

  it('should leave the outlines and arrows alone outside forced colors', () => {
    for (const [, html] of OUTLINED) {
      mount(html)
      expect(getComputedStyle(host.querySelector('#part')).outlineStyle).toBe('none')
      host.remove()
    }

    mount('<div class="popover bs-popover-top show"><div class="popover-arrow"></div></div>')
    expect(getComputedStyle(host.querySelector('.popover-arrow'), '::after').display).toBe('block')
    expect(getComputedStyle(host.querySelector('.popover-arrow'), '::before').borderLeftColor).toBe('rgba(0, 0, 0, 0)')
  })
})
