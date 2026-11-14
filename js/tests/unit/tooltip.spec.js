import EventHandler from '../../src/dom/event-handler.js'
import Tooltip from '../../src/tooltip.js'
import { registerLayer, unregisterLayer } from '../../src/util/layers.js'
import { noop } from '../../src/util/index.js'
import {
  clearFixture, createEvent, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('Tooltip', () => {
  let fixtureEl

  const getParentLayer = entry => globalThis[Symbol.for('coreui.layers')].stack.find(record => record.entry === entry)?.parent?.entry ?? null

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()

    for (const tooltipEl of document.querySelectorAll('.tooltip')) {
      tooltipEl.remove()
    }
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Tooltip.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Tooltip.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(Tooltip.NAME).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Tooltip.DATA_KEY).toEqual('coreui.tooltip')
    })
  })

  describe('EVENT_KEY', () => {
    it('should return plugin event key', () => {
      expect(Tooltip.EVENT_KEY).toEqual('.coreui.tooltip')
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type', () => {
      expect(Tooltip.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('constructor', () => {
    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = '<a href="#" id="tooltipEl" rel="tooltip" title="Nice and short title"></a>'

      const tooltipEl = fixtureEl.querySelector('#tooltipEl')
      const tooltipBySelector = new Tooltip('#tooltipEl')
      expect(tooltipBySelector._element).toEqual(tooltipEl)

      const tooltipByElement = new Tooltip(tooltipEl)
      expect(tooltipByElement._element).toEqual(tooltipEl)
    })

    it('should not take care of disallowed data attributes', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" data-coreui-sanitize="false" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      expect(tooltip._config.sanitize).toBeTrue()
    })

    it('should convert title and content to string if numbers', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, {
        title: 1,
        content: 7
      })

      expect(tooltip._config.title).toEqual('1')
      expect(tooltip._config.content).toEqual('7')
    })

    it('should convert title and content to string if booleans (e.g. data-coreui-content="true")', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" data-coreui-title="true" data-coreui-content="false"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      expect(tooltip._config.title).toEqual('true')
      expect(tooltip._config.content).toEqual('false')
    })

    it('should enable selector delegation', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'

        const containerEl = fixtureEl.querySelector('div')
        const tooltipContainer = new Tooltip(containerEl, {
          selector: 'a[rel="tooltip"]',
          trigger: 'click'
        })

        containerEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipInContainerEl = containerEl.querySelector('a')

        tooltipInContainerEl.addEventListener('shown.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).not.toBeNull()
          tooltipContainer.dispose()
          resolve()
        })

        tooltipInContainerEl.click()
      })
    })

    it('should create offset modifier when offset is passed as a function', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Offset from function"></a>'

        const getOffset = jasmine.createSpy('getOffset').and.returnValue([10, 20])
        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          offset: getOffset
        })

        const offset = tooltip._getOffset()

        expect(offset).toEqual(jasmine.any(Function))

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          // The offset function should have been called during positioning
          expect(getOffset).toHaveBeenCalled()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should create offset modifier when offset option is passed in data attribute', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" data-coreui-offset="10,20" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      expect(tooltip._getOffset()).toEqual([10, 20])
    })

    it('should adapt array results from offset functions to Floating UI offset values', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Offset adapter"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, {
        offset: () => [10, 20]
      })

      const offset = tooltip._getOffset()

      expect(offset({ placement: 'top', rects: { reference: {}, floating: {} } })).toEqual({ mainAxis: 20, crossAxis: 10 })
    })

    it('should resolve a logical placement by the direction of the element, not of the document', () => {
      fixtureEl.innerHTML = '<div dir="rtl"><a href="#" rel="tooltip" title="Tooltip"></a></div>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, { placement: 'end' })

      expect(tooltip._getPlacement(document.createElement('div'))).toEqual('left')
    })

    it('should not write "undefined" into arrow styles when positioning', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Arrow tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, { placement: 'right' })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const arrow = tooltip.tip.querySelector('.tooltip-arrow')

          expect(arrow.style.left).not.toContain('undefined')
          expect(arrow.style.top).not.toContain('undefined')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should allow to pass config to Floating UI with `floatingConfig`', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, {
        floatingConfig: {
          placement: 'left'
        }
      })

      const floatingConfig = tooltip._getFloatingConfig('top', [])

      expect(floatingConfig.placement).toEqual('left')
    })

    it('should allow to pass config to Floating UI with `floatingConfig` as a function', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const getFloatingConfig = jasmine.createSpy('getFloatingConfig').and.returnValue({ placement: 'left' })
      const tooltip = new Tooltip(tooltipEl, {
        floatingConfig: getFloatingConfig
      })

      const floatingConfig = tooltip._getFloatingConfig('top', [])

      // Ensure that the function was called with the default config.
      expect(getFloatingConfig).toHaveBeenCalledWith(jasmine.objectContaining({
        placement: jasmine.any(String)
      }))
      expect(floatingConfig.placement).toEqual('left')
    })

    it('should use original title, if not "data-coreui-title" is given', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      expect(tooltip._getTitle()).toEqual('Another tooltip')
    })
  })

  describe('enable', () => {
    it('should enable a tooltip', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltip.enable()

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).not.toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })
  })

  describe('disable', () => {
    it('should disable tooltip', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltip.disable()

        tooltipEl.addEventListener('show.coreui.tooltip', () => {
          reject(new Error('should not show a disabled tooltip'))
        })

        tooltip.show()

        setTimeout(() => {
          expect().nothing()
          resolve()
        }, 10)
      })
    })
  })

  describe('toggleEnabled', () => {
    it('should toggle enabled', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      expect(tooltip._isEnabled).toBeTrue()

      tooltip.toggleEnabled()

      expect(tooltip._isEnabled).toBeFalse()
    })
  })

  describe('toggle', () => {
    it('should do nothing if disabled', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltip.disable()

        tooltipEl.addEventListener('show.coreui.tooltip', () => {
          reject(new Error('should not show a disabled tooltip'))
        })

        tooltip.toggle()

        setTimeout(() => {
          expect().nothing()
          resolve()
        }, 10)
      })
    })

    it('should show a tooltip', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).not.toBeNull()
          resolve()
        })

        tooltip.toggle()
      })
    })

    it('should call toggle and show the tooltip when trigger is "click"', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          trigger: 'click'
        })

        const spy = spyOn(tooltip, 'toggle').and.callThrough()

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(spy).toHaveBeenCalled()
          resolve()
        })

        tooltipEl.click()
      })
    })

    it('should hide a tooltip', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          tooltip.toggle()
        })

        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).toBeNull()
          resolve()
        })

        tooltip.toggle()
      })
    })

    it('should call toggle and hide the tooltip when trigger is "click"', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          trigger: 'click'
        })

        const spy = spyOn(tooltip, 'toggle').and.callThrough()

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          tooltipEl.click()
        })

        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          expect(spy).toHaveBeenCalled()
          resolve()
        })

        tooltipEl.click()
      })
    })
  })

  describe('dispose', () => {
    it('should destroy a tooltip', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const addEventSpy = spyOn(tooltipEl, 'addEventListener').and.callThrough()
      const removeEventSpy = spyOn(tooltipEl, 'removeEventListener').and.callThrough()

      const tooltip = new Tooltip(tooltipEl)

      expect(Tooltip.getInstance(tooltipEl)).toEqual(tooltip)

      const expectedArgs = [
        ['mouseover', jasmine.any(Function), jasmine.any(Boolean)],
        ['mouseout', jasmine.any(Function), jasmine.any(Boolean)],
        ['focusin', jasmine.any(Function), jasmine.any(Boolean)],
        ['focusout', jasmine.any(Function), jasmine.any(Boolean)]
      ]

      expect(addEventSpy.calls.allArgs()).toEqual(expectedArgs)

      tooltip.dispose()

      expect(Tooltip.getInstance(tooltipEl)).toBeNull()
      expect(removeEventSpy.calls.allArgs()).toEqual(expectedArgs)
    })

    it('should destroy a tooltip after it is shown and hidden', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          tooltip.hide()
        })
        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          tooltip.dispose()
          expect(tooltip.tip).toBeNull()
          expect(Tooltip.getInstance(tooltipEl)).toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should destroy a tooltip and remove it from the dom', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).not.toBeNull()

          tooltip.dispose()

          expect(document.querySelector('.tooltip')).toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should destroy a tooltip and reset it\'s initial title', () => {
      fixtureEl.innerHTML = [
        '<span id="tooltipWithTitle" rel="tooltip" title="tooltipTitle"></span>',
        '<span id="tooltipWithoutTitle" rel="tooltip" data-coreui-title="tooltipTitle"></span>'
      ].join('')

      const tooltipWithTitleEl = fixtureEl.querySelector('#tooltipWithTitle')
      const tooltip = new Tooltip('#tooltipWithTitle')
      expect(tooltipWithTitleEl.getAttribute('title')).toBeNull()
      tooltip.dispose()
      expect(tooltipWithTitleEl.getAttribute('title')).toBe('tooltipTitle')

      const tooltipWithoutTitleEl = fixtureEl.querySelector('#tooltipWithoutTitle')
      const tooltip2 = new Tooltip('#tooltipWithTitle')
      expect(tooltipWithoutTitleEl.getAttribute('title')).toBeNull()
      tooltip2.dispose()
      expect(tooltipWithoutTitleEl.getAttribute('title')).toBeNull()
    })
  })

  describe('_getPlacement', () => {
    it('should resolve the logical placements the same way as their physical spellings', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Logical tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tip = document.createElement('div')

      const placementOf = value => new Tooltip(tooltipEl, { placement: value })._getPlacement(tip)

      expect(placementOf('start')).toEqual(placementOf('left'))
      expect(placementOf('end')).toEqual(placementOf('right'))
      expect(placementOf('top')).toEqual('top')
    })
  })

  describe('show', () => {
    it('should show a tooltip', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const tooltipShown = document.querySelector('.tooltip')

          expect(tooltipShown).not.toBeNull()
          expect(tooltipEl.getAttribute('aria-describedby')).toEqual(tooltipShown.getAttribute('id'))
          expect(tooltipShown.getAttribute('id')).toContain('tooltip')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should show a tooltip when hovering a child element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<a href="#" rel="tooltip" title="Another tooltip">',
          '  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100">',
          '    <rect width="100%" fill="#563d7c"/>',
          '    <circle cx="50" cy="50" r="30" fill="#fff"/>',
          '  </svg>',
          '</a>'
        ].join('')

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        const spy = spyOn(tooltip, 'show')

        tooltipEl.querySelector('rect').dispatchEvent(createEvent('mouseover', { bubbles: true }))

        setTimeout(() => {
          expect(spy).toHaveBeenCalled()
          resolve()
        }, 0)
      })
    })

    it('should show a tooltip with a jquery element container', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          container: {
            0: fixtureEl,
            jquery: 'jQuery'
          }
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(fixtureEl.querySelector('.tooltip')).not.toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should show a tooltip on mobile', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)
        document.documentElement.ontouchstart = noop

        const spy = spyOn(EventHandler, 'on').and.callThrough()

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).not.toBeNull()
          expect(spy).toHaveBeenCalledWith(jasmine.any(Object), 'mouseover', noop)
          document.documentElement.ontouchstart = undefined
          resolve()
        })

        tooltip.show()
      })
    })

    it('should show a tooltip relative to placement option', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          placement: 'bottom',
          fallbackPlacements: [] // Disable flip to get exact placement
        })

        tooltipEl.addEventListener('inserted.coreui.tooltip', () => {
          expect(tooltip._getTipElement()).toHaveClass('bs-tooltip-auto')
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(tooltip._getTipElement()).toHaveClass('bs-tooltip-auto')
          expect(tooltip._getTipElement().getAttribute('data-coreui-placement')).toEqual('bottom')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should not error when trying to show a tooltip that has been removed from the dom', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        const firstCallback = () => {
          tooltipEl.removeEventListener('shown.coreui.tooltip', firstCallback)
          let tooltipShown = document.querySelector('.tooltip')

          tooltipShown.remove()

          tooltipEl.addEventListener('shown.coreui.tooltip', () => {
            tooltipShown = document.querySelector('.tooltip')

            expect(tooltipShown).not.toBeNull()
            resolve()
          })

          tooltip.show()
        }

        tooltipEl.addEventListener('shown.coreui.tooltip', firstCallback)

        tooltip.show()
      })
    })

    it('should show a tooltip with a dom element container', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          container: fixtureEl
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(fixtureEl.querySelector('.tooltip')).not.toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should show a tooltip with a selector in container', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          container: '#fixture'
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(fixtureEl.querySelector('.tooltip')).not.toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should show a tooltip with placement as a function', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const spy = jasmine.createSpy('placement').and.returnValue('top')
        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          placement: spy
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).not.toBeNull()
          expect(spy).toHaveBeenCalled()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should show a tooltip without the animation', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          animation: false
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const tip = document.querySelector('.tooltip')

          expect(tip).not.toBeNull()
          expect(tip).not.toHaveClass('fade')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should throw an error the element is not visible', async () => {
      fixtureEl.innerHTML = '<a href="#" style="display: none" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      try {
        await tooltip.show()
      } catch (error) {
        expect(error.message).toEqual('Please use show on visible elements')
      }
    })

    it('should not show a tooltip if show.coreui.tooltip is prevented', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        const expectedDone = () => {
          setTimeout(() => {
            expect(document.querySelector('.tooltip')).toBeNull()
            resolve()
          }, 10)
        }

        tooltipEl.addEventListener('show.coreui.tooltip', ev => {
          ev.preventDefault()
          expectedDone()
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          reject(new Error('Tooltip should not be shown'))
        })

        tooltip.show()
      })
    })

    it('should reset hover state when show is prevented so the tip can reopen', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        const preventOnce = ev => {
          ev.preventDefault()
          tooltipEl.removeEventListener('show.coreui.tooltip', preventOnce)
        }

        tooltipEl.addEventListener('show.coreui.tooltip', preventOnce)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).not.toBeNull()
          resolve()
        })

        // First show is prevented — `_isHovered` must not stay stuck true,
        // otherwise the `_enter()` retry below would early-return and never reopen.
        tooltip.show()
        expect(tooltip._isHovered).toBeFalse()

        tooltip._enter()
      })
    })

    it('should show tooltip if leave event hasn\'t occurred before delay expires', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          delay: 150
        })

        const spy = spyOn(tooltip, 'show')

        setTimeout(() => {
          expect(spy).not.toHaveBeenCalled()
        }, 100)

        setTimeout(() => {
          expect(spy).toHaveBeenCalled()
          resolve()
        }, 200)

        tooltipEl.dispatchEvent(createEvent('mouseover'))
      })
    })

    it('should not show tooltip if leave event occurs before delay expires', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          delay: 150
        })

        const spy = spyOn(tooltip, 'show')

        setTimeout(() => {
          expect(spy).not.toHaveBeenCalled()
          tooltipEl.dispatchEvent(createEvent('mouseover'))
        }, 100)

        setTimeout(() => {
          expect(spy).toHaveBeenCalled()
          expect(document.querySelectorAll('.tooltip')).toHaveSize(0)
          resolve()
        }, 200)

        tooltipEl.dispatchEvent(createEvent('mouseover'))
      })
    })

    it('should not hide tooltip if leave event occurs and enter event occurs within the hide delay', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip" data-coreui-delay=\'{"show":0,"hide":150}\'>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        expect(tooltip._config.delay).toEqual({ show: 0, hide: 150 })

        setTimeout(() => {
          expect(tooltip._getTipElement()).toHaveClass('show')
          tooltipEl.dispatchEvent(createEvent('mouseout'))

          setTimeout(() => {
            expect(tooltip._getTipElement()).toHaveClass('show')
            tooltipEl.dispatchEvent(createEvent('mouseover'))
          }, 100)

          setTimeout(() => {
            expect(tooltip._getTipElement()).toHaveClass('show')
            expect(document.querySelectorAll('.tooltip')).toHaveSize(1)
            resolve()
          }, 200)
        }, 10)

        tooltipEl.dispatchEvent(createEvent('mouseover'))
      })
    })

    it('should not hide tooltip if leave event occurs and interaction remains inside trigger', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<a href="#" rel="tooltip" title="Another tooltip">',
          '<b>Trigger</b>',
          'the tooltip',
          '</a>'
        ].join('')

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)
        const triggerChild = tooltipEl.querySelector('b')

        const spy = spyOn(tooltip, 'hide').and.callThrough()

        tooltipEl.addEventListener('mouseover', () => {
          const moveMouseToChildEvent = createEvent('mouseout')
          Object.defineProperty(moveMouseToChildEvent, 'relatedTarget', {
            value: triggerChild
          })

          tooltipEl.dispatchEvent(moveMouseToChildEvent)
        })

        tooltipEl.addEventListener('mouseout', () => {
          expect(spy).not.toHaveBeenCalled()
          resolve()
        })

        tooltipEl.dispatchEvent(createEvent('mouseover'))
      })
    })

    it('should not hide a tooltip if the cursor moves from the trigger onto the tip', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip">trigger</a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        const spy = spyOn(tooltip, 'hide').and.callThrough()

        tooltipEl.addEventListener('mouseover', () => {
          const moveMouseToTipEvent = createEvent('mouseout')
          Object.defineProperty(moveMouseToTipEvent, 'relatedTarget', {
            value: tooltip._getTipElement()
          })

          tooltipEl.dispatchEvent(moveMouseToTipEvent)
        })

        tooltipEl.addEventListener('mouseout', () => {
          expect(spy).not.toHaveBeenCalled()
          resolve()
        })

        tooltipEl.dispatchEvent(createEvent('mouseover'))
      })
    })

    it('should hide a delegated tooltip when the cursor leaves the tip element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div><a href="#" rel="tooltip" title="Another tooltip">trigger</a></div>'

        const containerEl = fixtureEl.querySelector('div')
        const tooltipContainer = new Tooltip(containerEl, {
          selector: 'a[rel="tooltip"]',
          trigger: 'hover'
        })

        const tooltipEl = containerEl.querySelector('a')

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const delegated = Tooltip.getInstance(tooltipEl)
          const leaveTipEvent = createEvent('mouseout')
          Object.defineProperty(leaveTipEvent, 'relatedTarget', {
            value: document.body
          })

          delegated._getTipElement().dispatchEvent(leaveTipEvent)
        })

        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          tooltipContainer.dispose()
          resolve()
        })

        tooltipEl.dispatchEvent(createEvent('mouseover', { bubbles: true }))
      })
    })

    it('should hide a tooltip when the cursor leaves the tip element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip">trigger</a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        const spy = spyOn(tooltip, 'hide').and.callThrough()

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const leaveTipEvent = createEvent('mouseout')
          Object.defineProperty(leaveTipEvent, 'relatedTarget', {
            value: document.body
          })

          tooltip._getTipElement().dispatchEvent(leaveTipEvent)
        })

        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          expect(spy).toHaveBeenCalled()
          resolve()
        })

        tooltipEl.dispatchEvent(createEvent('mouseover'))
      })
    })

    it('should properly maintain tooltip state if leave event occurs and enter event occurs during hide transition', () => {
      return new Promise(resolve => {
        // Style this tooltip to give it plenty of room for Floating UI to do what it wants
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip" data-coreui-placement="top" style="position:fixed;left:50%;top:50%;">Trigger</a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        spyOn(window, 'getComputedStyle').and.returnValue({
          transitionDuration: '0.15s',
          transitionDelay: '0s'
        })

        setTimeout(() => {
          expect(tooltip._floatingCleanup).not.toBeNull()
          expect(tooltip._getTipElement().getAttribute('data-coreui-placement')).toEqual('top')
          tooltipEl.dispatchEvent(createEvent('mouseout'))

          setTimeout(() => {
            expect(tooltip._getTipElement()).not.toHaveClass('show')
            tooltipEl.dispatchEvent(createEvent('mouseover'))
          }, 100)

          setTimeout(() => {
            expect(tooltip._floatingCleanup).not.toBeNull()
            expect(tooltip._getTipElement().getAttribute('data-coreui-placement')).toEqual('top')
            resolve()
          }, 200)
        }, 10)

        tooltipEl.dispatchEvent(createEvent('mouseover'))
      })
    })

    it('should only trigger inserted event if a new tooltip element was created', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        spyOn(window, 'getComputedStyle').and.returnValue({
          transitionDuration: '0.15s',
          transitionDelay: '0s'
        })

        const insertedFunc = jasmine.createSpy()
        tooltipEl.addEventListener('inserted.coreui.tooltip', insertedFunc)

        setTimeout(() => {
          expect(insertedFunc).toHaveBeenCalledTimes(1)
          tooltip.hide()

          setTimeout(() => {
            tooltip.show()
          }, 100)

          setTimeout(() => {
            expect(insertedFunc).toHaveBeenCalledTimes(2)
            resolve()
          }, 200)
        }, 0)

        tooltip.show()
      })
    })

    it('should show a tooltip with custom class provided in data attributes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip" data-coreui-custom-class="custom-class"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const tip = document.querySelector('.tooltip')
          expect(tip).not.toBeNull()
          expect(tip).toHaveClass('custom-class')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should show a tooltip with custom class provided as a string in config', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          customClass: 'custom-class custom-class-2'
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const tip = document.querySelector('.tooltip')
          expect(tip).not.toBeNull()
          expect(tip).toHaveClass('custom-class')
          expect(tip).toHaveClass('custom-class-2')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should show a tooltip with custom class provided as a function in config', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip" data-class-a="custom-class-a" data-class-b="custom-class-b"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const spy = jasmine.createSpy('customClass').and.callFake(function (el) {
          return `${el.dataset.classA} ${this.dataset.classB}`
        })
        const tooltip = new Tooltip(tooltipEl, {
          customClass: spy
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const tip = document.querySelector('.tooltip')
          expect(tip).not.toBeNull()
          expect(spy).toHaveBeenCalled()
          expect(tip).toHaveClass('custom-class-a')
          expect(tip).toHaveClass('custom-class-b')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should remove `title` attribute if exists', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(tooltipEl.getAttribute('title')).toBeNull()
          resolve()
        })
        tooltip.show()
      })
    })
  })

  describe('hide', () => {
    it('should hide a tooltip', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => tooltip.hide())
        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).toBeNull()
          expect(tooltipEl.getAttribute('aria-describedby')).toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should hide a tooltip on mobile', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)
        const spy = spyOn(EventHandler, 'off')

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          document.documentElement.ontouchstart = noop
          tooltip.hide()
        })

        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).toBeNull()
          expect(spy).toHaveBeenCalledWith(jasmine.any(Object), 'mouseover', noop)
          document.documentElement.ontouchstart = undefined
          resolve()
        })

        tooltip.show()
      })
    })

    it('should hide a tooltip without animation', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          animation: false
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => tooltip.hide())
        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).toBeNull()
          expect(tooltipEl.getAttribute('aria-describedby')).toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should not hide a tooltip if hide event is prevented', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const assertDone = () => {
          setTimeout(() => {
            expect(document.querySelector('.tooltip')).not.toBeNull()
            resolve()
          }, 20)
        }

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl, {
          animation: false
        })

        tooltipEl.addEventListener('shown.coreui.tooltip', () => tooltip.hide())
        tooltipEl.addEventListener('hide.coreui.tooltip', event => {
          event.preventDefault()
          assertDone()
        })
        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          reject(new Error('should not trigger hidden event'))
        })

        tooltip.show()
      })
    })

    it('should not throw error running hide if tooltip hasn\'t been shown', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tooltip = new Tooltip(div)

      try {
        tooltip.hide()
        expect().nothing()
      } catch {
        throw new Error('should not throw error')
      }
    })

    it('should hide a tooltip when the Escape key is pressed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).not.toBeNull()

          const keydownEscape = createEvent('keydown', { bubbles: true })
          keydownEscape.key = 'Escape'
          document.dispatchEvent(keydownEscape)
        })

        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          expect(document.querySelector('.tooltip')).toBeNull()
          expect(tooltipEl.getAttribute('aria-describedby')).toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should stop the Escape keystroke from reaching ancestor components (e.g. a dialog)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)
        const ancestorSpy = jasmine.createSpy('ancestor keydown')

        // A parent dialog handles Escape on the bubble phase; it should not run
        // while a tooltip is open, so the first Escape only closes the tooltip.
        fixtureEl.addEventListener('keydown', ancestorSpy)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const keydownEscape = createEvent('keydown', { bubbles: true, cancelable: true })
          keydownEscape.key = 'Escape'
          tooltipEl.dispatchEvent(keydownEscape)

          expect(ancestorSpy).not.toHaveBeenCalled()
          expect(keydownEscape.defaultPrevented).toBeTrue()
        })

        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          fixtureEl.removeEventListener('keydown', ancestorSpy)
          resolve()
        })

        tooltip.show()
      })
    })

    it('should not hide a tooltip when a non-Escape key is pressed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const spy = spyOn(tooltip, 'hide').and.callThrough()

          const keydownEnter = createEvent('keydown', { bubbles: true })
          keydownEnter.key = 'Enter'
          document.dispatchEvent(keydownEnter)

          setTimeout(() => {
            expect(spy).not.toHaveBeenCalled()
            expect(document.querySelector('.tooltip')).not.toBeNull()
            resolve()
          }, 20)
        })

        tooltip.show()
      })
    })

    it('should remove the Escape keydown listener once the tooltip is hidden', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => tooltip.hide())
        tooltipEl.addEventListener('hidden.coreui.tooltip', () => {
          const spy = spyOn(tooltip, 'hide')

          const keydownEscape = createEvent('keydown', { bubbles: true })
          keydownEscape.key = 'Escape'
          document.dispatchEvent(keydownEscape)

          expect(spy).not.toHaveBeenCalled()
          resolve()
        })

        tooltip.show()
      })
    })
  })

  describe('description', () => {
    const shown = (element, tooltip) => new Promise(resolve => {
      element.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      tooltip.show()
    })

    const hidden = (element, tooltip) => new Promise(resolve => {
      element.addEventListener('hidden.coreui.tooltip', resolve, { once: true })
      tooltip.hide()
    })

    it('should add its id to the description the trigger has and leave the rest when it hides', async () => {
      fixtureEl.innerHTML = '<button type="button" title="Tip" aria-describedby="hint">Trigger</button><p id="hint">Hint</p>'

      const trigger = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(trigger, { animation: false })
      await shown(trigger, tooltip)

      expect(trigger.getAttribute('aria-describedby')).toEqual(`hint ${tooltip.tip.id}`)

      await hidden(trigger, tooltip)

      expect(trigger.getAttribute('aria-describedby')).toEqual('hint')
    })

    it('should keep a description another component adds while it is shown', async () => {
      fixtureEl.innerHTML = '<button type="button" title="Tip">Trigger</button><p id="error">Error</p>'

      const trigger = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(trigger, { animation: false })
      await shown(trigger, tooltip)
      trigger.setAttribute('aria-describedby', `${trigger.getAttribute('aria-describedby')} error`)

      await hidden(trigger, tooltip)

      expect(trigger.getAttribute('aria-describedby')).toEqual('error')
    })

    it('should keep only the id of the current tip when its content is replaced while shown', async () => {
      fixtureEl.innerHTML = '<button type="button" title="Tip" aria-describedby="hint">Trigger</button><p id="hint">Hint</p>'

      const trigger = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(trigger, { animation: false, trigger: 'manual' })
      await shown(trigger, tooltip)
      const replaced = new Promise(resolve => {
        trigger.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      tooltip.setContent({ '.tooltip-inner': 'Copied' })
      await replaced

      expect(trigger.getAttribute('aria-describedby')).toEqual(`hint ${tooltip.tip.id}`)

      await hidden(trigger, tooltip)

      expect(trigger.getAttribute('aria-describedby')).toEqual('hint')
    })

    it('should take only its id off the description when it is disposed while shown', async () => {
      fixtureEl.innerHTML = '<button type="button" title="Tip" aria-describedby="hint">Trigger</button><p id="hint">Hint</p>'

      const trigger = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(trigger, { animation: false })
      await shown(trigger, tooltip)

      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })

      tooltip.dispose()

      expect(trigger.getAttribute('aria-describedby')).toEqual('hint')
    })
  })

  describe('update', () => {
    it('should call floating position update', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const spy = spyOn(tooltip, '_updateFloatingPosition')

          tooltip.update()

          expect(spy).toHaveBeenCalled()
          resolve()
        })

        tooltip.show()
      })
    })

    it('should do nothing if the tooltip is not shown', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      tooltip.update()
      expect().nothing()
    })
  })

  describe('_isWithContent', () => {
    it('should return true if there is content', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      expect(tooltip._isWithContent()).toBeTrue()
    })

    it('should return false if there is no content', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title=""></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      expect(tooltip._isWithContent()).toBeFalse()
    })
  })

  describe('_getTipElement', () => {
    it('should create the tip element and return it', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      const spy = spyOn(document, 'createElement').and.callThrough()

      expect(tooltip._getTipElement()).toBeDefined()
      expect(spy).toHaveBeenCalled()
    })

    it('should return the created tip element', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      const spy = spyOn(document, 'createElement').and.callThrough()

      expect(tooltip._getTipElement()).toBeDefined()
      expect(spy).toHaveBeenCalled()

      spy.calls.reset()

      expect(tooltip._getTipElement()).toBeDefined()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('setContent', () => {
    it('should set tip content', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, { animation: false })

      const tip = tooltip._getTipElement()

      tooltip.setContent(tip)

      expect(tip).not.toHaveClass('show')
      expect(tip).not.toHaveClass('fade')
      expect(tip.querySelector('.tooltip-inner').textContent).toEqual('Another tooltip')
    })

    it('should re-show tip if it was already shown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" data-coreui-title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)
        const tip = () => tooltip._getTipElement()

        tooltipEl.addEventListener('shown.coreui.tooltip', function handler() {
          tooltipEl.removeEventListener('shown.coreui.tooltip', handler)

          expect(tip()).toHaveClass('show')

          // Listen for the re-show after setContent
          tooltipEl.addEventListener('shown.coreui.tooltip', () => {
            expect(tip()).toHaveClass('show')
            expect(tip().querySelector('.tooltip-inner').textContent).toEqual('foo')
            resolve()
          })

          tooltip.setContent({ '.tooltip-inner': 'foo' })
        })

        tooltip.show()
      })
    })

    it('should keep tip hidden, if it was already hidden before', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" data-coreui-title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)
      const tip = () => tooltip._getTipElement()

      expect(tip()).not.toHaveClass('show')
      tooltip.setContent({ '.tooltip-inner': 'foo' })

      expect(tip()).not.toHaveClass('show')
      tooltip.show()
      expect(tip().querySelector('.tooltip-inner').textContent).toEqual('foo')
    })

    it('"setContent" should keep the initial template', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      tooltip.setContent({ '.tooltip-inner': 'foo' })
      const tip = tooltip._getTipElement()

      expect(tip).toHaveClass('tooltip')
      expect(tip).toHaveClass('bs-tooltip-auto')
      expect(tip.querySelector('.tooltip-arrow')).not.toBeNull()
      expect(tip.querySelector('.tooltip-inner')).not.toBeNull()
    })
  })

  describe('setContent', () => {
    it('should do nothing if the element is null', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      tooltip.setContent({ '.tooltip': null })
      expect().nothing()
    })

    it('should do nothing if the content is a child of the element', () => {
      fixtureEl.innerHTML = [
        '<a href="#" rel="tooltip" title="Another tooltip">',
        '  <div id="childContent"></div>',
        '</a>'
      ].join('')

      const tooltipEl = fixtureEl.querySelector('a')
      const childContent = fixtureEl.querySelector('div')
      const tooltip = new Tooltip(tooltipEl, {
        html: true
      })

      tooltip._getTipElement().append(childContent)
      tooltip.setContent({ '.tooltip': childContent })

      expect().nothing()
    })

    it('should add the child text content in the element', () => {
      fixtureEl.innerHTML = [
        '<a href="#" rel="tooltip" title="Another tooltip">',
        '  <div id="childContent">Tooltip</div>',
        '</a>'
      ].join('')

      const tooltipEl = fixtureEl.querySelector('a')
      const childContent = fixtureEl.querySelector('div')
      const tooltip = new Tooltip(tooltipEl)

      tooltip.setContent({ '.tooltip': childContent })

      expect(childContent.textContent).toEqual(tooltip._getTipElement().textContent)
    })

    it('should add html without sanitize it', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, {
        sanitize: false,
        html: true
      })

      tooltip.setContent({ '.tooltip': '<div id="childContent">Tooltip</div>' })

      expect(tooltip._getTipElement().querySelector('div').id).toEqual('childContent')
    })

    it('should add html sanitized', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, {
        html: true
      })

      const content = [
        '<div id="childContent">',
        '  <button type="button">test btn</button>',
        '</div>'
      ].join('')

      tooltip.setContent({ '.tooltip': content })
      expect(tooltip._getTipElement().querySelector('div').id).toEqual('childContent')
      expect(tooltip._getTipElement().querySelector('button')).toBeNull()
    })

    it('should add text content', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      tooltip.setContent({ '.tooltip': 'test' })

      expect(tooltip._getTipElement().textContent).toEqual('test')
    })
    it('should add the content as a child of the element for jQuery elements', () => {
      fixtureEl.innerHTML = [
        '<a href="#" rel="tooltip" title="Another tooltip">',
        '  <div id="childContent"></div>',
        '</a>'
      ].join('')

      const tooltipEl = fixtureEl.querySelector('a')
      const childContent = fixtureEl.querySelector('div')
      const tooltip = new Tooltip(tooltipEl, {
        html: true
      })

      tooltip.setContent({ '.tooltip': { 0: childContent, jquery: 'jQuery' } })
      tooltip.show()

      expect(childContent.parentNode).toEqual(tooltip._getTipElement())
    })
  })

  describe('_getTitle', () => {
    it('should return the title', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl)

      expect(tooltip._getTitle()).toEqual('Another tooltip')
    })

    it('should call title function', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, {
        title: () => 'test'
      })

      expect(tooltip._getTitle()).toEqual('test')
    })

    it('should call title function with trigger element', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" data-foo="bar"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, {
        title(el) {
          return el.dataset.foo
        }
      })

      expect(tooltip._getTitle()).toEqual('bar')
    })

    it('should call title function with correct this value', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" data-foo="bar"></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(tooltipEl, {
        title() {
          return this.dataset.foo
        }
      })

      expect(tooltip._getTitle()).toEqual('bar')
    })
  })

  describe('anchors', () => {
    const markup = '<style>.tooltip { position: absolute; }</style><div id="bar" title="Toolbar" style="position: fixed; left: 40px; top: 120px;"><button type="button" id="a" title="Bold">B</button><button type="button" id="b" title="Italic">I</button><span id="gap">|</span><button type="button" id="c">C</button><button type="button" id="d" title="Underline">U</button></div>'
    const wait = (element, name) => new Promise(resolve => {
      element.addEventListener(`${name}.coreui.tooltip`, resolve, { once: true })
    })
    const hover = (element, relatedTarget = null) => element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget }))
    const leave = (element, relatedTarget = null) => element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget }))
    const sleep = ms => new Promise(resolve => {
      setTimeout(resolve, ms)
    })
    const text = () => document.querySelector('.tooltip .tooltip-inner')?.textContent
    const mouse = (element, type, { x, y }, relatedTarget = null) => element.dispatchEvent(new MouseEvent(type, {
      bubbles: true, clientX: x, clientY: y, relatedTarget
    }))
    const pointer = ({ x, y }, target = document) => target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y }))
    const cross = (from, to) => {
      const rect = to.getBoundingClientRect()
      const exit = { x: rect.left, y: rect.top + (rect.height / 2) }
      mouse(from, 'mouseout', exit, to)
      mouse(to, 'mouseover', exit, from)
      const tip = document.querySelector('.tooltip').getBoundingClientRect()
      const above = tip.bottom <= exit.y
      const edge = { x: tip.left + (tip.width / 2), y: above ? tip.bottom : tip.top }
      return {
        away: { x: exit.x + 2, y: exit.y + (above ? 8 : -8) },
        exit,
        toward: share => ({ x: exit.x + ((edge.x - exit.x) * share), y: exit.y + ((edge.y - exit.y) * share) })
      }
    }

    const setup = (config = {}) => {
      fixtureEl.innerHTML = markup
      const bar = fixtureEl.querySelector('#bar')
      return {
        a: bar.querySelector('#a'), b: bar.querySelector('#b'), bar, c: bar.querySelector('#c'), d: bar.querySelector('#d'), gap: bar.querySelector('#gap'),
        tooltip: new Tooltip(bar, { anchors: 'button', ...config })
      }
    }

    it('should open on the anchor the pointer enters and tell which one', async () => {
      const { a, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')

      hover(a)
      const event = await shown

      expect(event.relatedTarget).toBe(a)
      expect(text()).toBe('Bold')
      expect(a.getAttribute('aria-describedby')).toBe(document.querySelector('.tooltip').id)
      tooltip.dispose()
    })

    it('should move one tip to the next anchor without hiding it', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const tip = document.querySelector('.tooltip')
      const events = []
      for (const name of ['show', 'hide', 'hidden', 'inserted', 'move']) {
        bar.addEventListener(`${name}.coreui.tooltip`, event => events.push([name, event.relatedTarget]))
      }

      const moved = wait(bar, 'moved')
      leave(a, b)
      hover(b, a)
      const event = await moved

      expect(event.relatedTarget).toBe(b)
      expect(events).toEqual([['move', b]])
      expect(document.querySelectorAll('.tooltip')).toHaveSize(1)
      expect(document.querySelector('.tooltip')).toBe(tip)
      expect(text()).toBe('Italic')
      expect(b.getAttribute('aria-describedby')).toBe(tip.id)
      expect(a.hasAttribute('aria-describedby')).toBeFalse()
      tooltip.dispose()
    })

    it('should move at once when the pointer enters another anchor away from the tip', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))
      const rect = b.getBoundingClientRect()
      const exit = { x: rect.left, y: rect.top + (rect.height / 2) }
      const tip = document.querySelector('.tooltip').getBoundingClientRect()

      mouse(a, 'mouseout', exit, b)
      mouse(b, 'mouseover', { x: exit.x + 2, y: exit.y + (tip.bottom <= exit.y ? 8 : -8) }, a)

      expect(moves).toHaveSize(1)
      expect(text()).toBe('Italic')
      tooltip.dispose()
    })

    it('should keep the tip while the pointer crosses another anchor on its way to the tip', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      const { toward } = cross(a, b)
      await sleep(15)
      pointer(toward(0.2))
      await sleep(15)
      pointer(toward(0.5))
      await sleep(15)
      pointer(toward(0.8))

      expect(moves).toEqual([])

      document.querySelector('.tooltip').dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: b }))
      await sleep(100)

      expect(moves).toEqual([])
      expect(text()).toBe('Bold')
      tooltip.dispose()
    })

    it('should keep the tip while the pointer leaves an anchor and heads for the tip', async () => {
      const { a, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const rect = a.getBoundingClientRect()
      const exit = { x: rect.left + (rect.width / 2), y: rect.top }
      const tip = document.querySelector('.tooltip').getBoundingClientRect()
      const edge = { x: tip.left + (tip.width / 2), y: tip.bottom }
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      mouse(a, 'mouseout', exit)
      const toward = share => ({ x: exit.x + ((edge.x - exit.x) * share), y: exit.y + ((edge.y - exit.y) * share) })
      await sleep(20)
      pointer(toward(0.15))
      await sleep(20)
      pointer(toward(0.3))
      await sleep(20)
      pointer(toward(0.45))
      await sleep(20)
      pointer(toward(0.6))
      await sleep(20)
      pointer(toward(0.75))
      await sleep(20)
      pointer(toward(0.9))

      expect(hide).not.toHaveBeenCalled()
      tooltip.dispose()
    })

    it('should keep the tip when the pointer moves over it before its mouseover', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      cross(a, b)
      const tip = document.querySelector('.tooltip')
      const rect = tip.getBoundingClientRect()
      pointer({ x: rect.left + (rect.width / 2), y: rect.top + (rect.height / 2) }, tip)
      pointer({ x: 0, y: 0 })
      await sleep(60)

      expect(moves).toEqual([])
      expect(text()).toBe('Bold')
      tooltip.dispose()
    })

    it('should move once the pointer stops right after entering the other anchor', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      cross(a, b)
      await sleep(10)

      expect(moves).toEqual([])

      await sleep(80)

      expect(moves).toHaveSize(1)
      tooltip.dispose()
    })

    it('should move once the pointer rests on the other anchor', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      const { toward } = cross(a, b)
      await sleep(10)
      pointer(toward(0.3))
      await sleep(10)

      expect(moves).toEqual([])

      await sleep(80)

      expect(moves).toHaveSize(1)
      expect(text()).toBe('Italic')
      tooltip.dispose()
    })

    it('should move at once when the pointer turns away from the tip', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      const { away, toward } = cross(a, b)
      pointer(toward(0.3))

      expect(moves).toEqual([])

      pointer(away)

      expect(moves).toHaveSize(1)
      tooltip.dispose()
    })

    it('should move at once when the tip was opened by the focus, not the pointer', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      a.focus()
      await shown
      const moved = wait(bar, 'moved')
      b.focus()
      await moved
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))
      const rect = a.getBoundingClientRect()

      mouse(a, 'mouseover', { x: rect.left + 1, y: rect.top + 1 })

      expect(moves).toHaveSize(1)
      tooltip.dispose()
    })

    it('should stop following the pointer when it is disposed', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      const { away } = cross(a, b)
      const moveTo = spyOn(Tooltip.prototype, '_moveTo')
      tooltip.dispose()
      pointer(away)
      await sleep(60)

      expect(moveTo).not.toHaveBeenCalled()
      expect(moves).toEqual([])
    })

    it('should keep the tip on its way to a tip below the anchors', async () => {
      const { a, b, bar, tooltip } = setup({ placement: 'bottom' })
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      const { away, toward } = cross(a, b)
      pointer(toward(0.5))

      expect(document.querySelector('.tooltip').getAttribute('data-coreui-placement')).toBe('bottom')
      expect(moves).toEqual([])

      pointer(away)

      expect(moves).toHaveSize(1)
      tooltip.dispose()
    })

    it('should move at once when the anchor is wider than the tip and the pointer crosses sideways', async () => {
      const { a, b, bar, tooltip } = setup()
      a.style.width = '160px'
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      cross(a, b)

      expect(moves).toHaveSize(1)
      expect(text()).toBe('Italic')
      tooltip.dispose()
    })

    it('should stop following the pointer when it leaves the anchors', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      const { away } = cross(a, b)
      leave(b, document.body)
      pointer(away)
      await sleep(60)

      expect(moves).toEqual([])
      tooltip.dispose()
    })

    it('should move at once when the pointer comes to an anchor from outside the anchors', async () => {
      const { a, b, bar, d, tooltip } = setup()
      const shown = wait(bar, 'shown')
      d.focus()
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', event => moves.push(event.relatedTarget))
      const rect = b.getBoundingClientRect()
      const point = { x: rect.left, y: rect.top + (rect.height / 2) }

      const tip = document.querySelector('.tooltip').getBoundingClientRect()
      const entry = { x: (point.x + tip.left + (tip.width / 2)) / 2, y: (point.y + tip.bottom) / 2 }

      mouse(a, 'mouseout', point, document.body)
      mouse(b, 'mouseover', entry, document.body)

      expect(moves).toEqual([b])
      tooltip.dispose()
    })

    it('should forget where the pointer left an anchor once the tip hides', async () => {
      const { a, b, bar, d, gap, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const rect = b.getBoundingClientRect()
      const point = { x: rect.left, y: rect.top + (rect.height / 2) }
      mouse(a, 'mouseout', point, gap)
      await tooltip.hide()

      const reshown = wait(bar, 'shown')
      d.focus()
      await reshown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', event => moves.push(event.relatedTarget))
      const tip = document.querySelector('.tooltip').getBoundingClientRect()
      mouse(b, 'mouseover', { x: (point.x + tip.left + (tip.width / 2)) / 2, y: (point.y + tip.bottom) / 2 }, document.body)

      expect(moves).toEqual([b])
      tooltip.dispose()
    })

    it('should stay on the focused anchor when the focus moves while the pointer heads to the tip', async () => {
      const { a, b, bar, d, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', event => moves.push(event.relatedTarget))

      const { away } = cross(a, b)
      d.focus()
      pointer(away)
      await sleep(60)

      expect(moves).toEqual([d])
      expect(d.getAttribute('aria-describedby')).toBe(document.querySelector('.tooltip').id)
      tooltip.dispose()
    })

    it('should keep following the pointer when the focus leaves the anchors', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      a.focus()
      hover(a)
      await shown

      cross(a, b)
      const moved = wait(bar, 'moved')
      a.blur()
      const event = await moved

      expect(event.relatedTarget).toBe(b)
      tooltip.dispose()
    })

    it('should let the pointer reach the tip across another anchor while a third one holds the focus', async () => {
      const { a, b, bar, d, tooltip } = setup()
      const shown = wait(bar, 'shown')
      d.focus()
      await shown
      const atA = wait(bar, 'moved')
      const rect = a.getBoundingClientRect()
      mouse(a, 'mouseover', { x: rect.left + 1, y: rect.top + 1 }, document.body)
      await atA
      const moves = []
      bar.addEventListener('move.coreui.tooltip', event => moves.push(event.relatedTarget))

      const { toward } = cross(a, b)
      pointer(toward(0.5))
      await sleep(15)
      pointer(toward(0.7))

      expect(moves).toEqual([])
      expect(text()).toBe('Bold')
      tooltip.dispose()
    })

    it('should not leave a pointer listener behind when the pointer enters a nested anchor', async () => {
      fixtureEl.innerHTML = '<style>.tooltip { position: absolute; }</style><div id="bar" style="position: fixed; left: 40px; top: 120px;"><button type="button" id="x" title="Bold">B</button><span id="s" title="Group" style="display: inline-block; padding: 8px;"><button type="button" id="y" title="Inner">I</button></span></div>'
      const bar = fixtureEl.querySelector('#bar')
      const [x, span, y] = [bar.querySelector('#x'), bar.querySelector('#s'), bar.querySelector('#y')]
      const tooltip = new Tooltip(bar, { anchors: '[title]' })
      const shown = wait(bar, 'shown')
      hover(x)
      await shown
      const listeners = []
      spyOn(document, 'addEventListener').and.callFake(function (type, ...rest) {
        if (type === 'pointermove') {
          listeners.push(rest[0])
        }

        return EventTarget.prototype.addEventListener.call(this, type, ...rest)
      })
      spyOn(document, 'removeEventListener').and.callFake(function (type, ...rest) {
        if (type === 'pointermove') {
          listeners.splice(listeners.indexOf(rest[0]), 1)
        }

        return EventTarget.prototype.removeEventListener.call(this, type, ...rest)
      })

      const { exit } = cross(x, span)
      mouse(y, 'mouseover', exit, span)
      tooltip.dispose()

      expect(listeners).toEqual([])
    })

    it('should keep matching an anchor selector on title after the tip takes the title', async () => {
      const { a, bar, tooltip } = setup({ anchors: '[title]' })
      const shown = wait(bar, 'shown')
      hover(a)
      await shown

      expect(a.getAttribute('title')).toBe('')
      expect(a.getAttribute('data-coreui-original-title')).toBe('Bold')

      const hidden = wait(bar, 'hidden')
      leave(a, document.body)
      await hidden
      const reshown = wait(bar, 'shown')
      hover(a)
      await reshown

      expect(text()).toBe('Bold')
      tooltip.dispose()

      expect(a.getAttribute('title')).toBe('Bold')
    })

    it('should describe the focused control inside an anchor in a shadow root', async () => {
      fixtureEl.innerHTML = '<div></div>'
      const root = fixtureEl.querySelector('div').attachShadow({ mode: 'open' })
      root.innerHTML = '<ul id="bar"><li title="Bold"><button type="button" id="b">B</button></li></ul><div id="tips"></div>'
      const bar = root.querySelector('#bar')
      const button = root.querySelector('#b')
      const tooltip = new Tooltip(bar, { anchors: 'li', container: root.querySelector('#tips') })
      const shown = wait(bar, 'shown')
      button.focus()
      await shown

      expect(button.getAttribute('aria-describedby')).toBe(root.querySelector('.tooltip').id)
      tooltip.dispose()
    })

    it('should show the tip of a wrapper around a disabled button listed among the anchors', async () => {
      fixtureEl.innerHTML = '<div id="bar"><button type="button" id="a" title="Bold">B</button><span id="s" tabindex="0" title="Italic is not available"><button type="button" id="off" disabled>I</button></span></div>'
      const bar = fixtureEl.querySelector('#bar')
      const a = bar.querySelector('#a')
      const span = bar.querySelector('#s')
      const off = bar.querySelector('#off')
      const tooltip = new Tooltip(bar, { anchors: 'button:enabled, [tabindex]' })
      const shown = wait(bar, 'shown')
      hover(a)
      await shown

      const moved = wait(bar, 'moved')
      leave(a, off)
      hover(off, a)
      const event = await moved

      expect(event.relatedTarget).toBe(span)
      expect(text()).toBe('Italic is not available')
      expect(span.getAttribute('aria-describedby')).toBe(document.querySelector('.tooltip').id)

      const hides = []
      bar.addEventListener('hide.coreui.tooltip', () => hides.push(1))
      leave(off, span)
      hover(span, off)
      await sleep(200)

      expect(hides).toEqual([])
      tooltip.dispose()
    })

    it('should let EventHandler listen to the move', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      EventHandler.on(bar, 'move.coreui.tooltip', event => moves.push(event.relatedTarget))

      const moved = wait(bar, 'moved')
      hover(b, a)
      await moved

      expect(moves).toEqual([b])
      tooltip.dispose()
    })

    it('should move at once on Tab and describe the new anchor in the same task', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      a.focus()
      await shown
      const tip = document.querySelector('.tooltip')
      const moved = wait(bar, 'moved')

      b.focus()

      expect(b.getAttribute('aria-describedby')).toBe(tip.id)
      expect(a.hasAttribute('aria-describedby')).toBeFalse()
      expect(text()).toBe('Italic')
      await moved
      tooltip.dispose()
    })

    it('should keep the tip across a gap between two anchors', async () => {
      const { a, b, bar, gap, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const hides = []
      bar.addEventListener('hide.coreui.tooltip', () => hides.push(1))

      const moved = wait(bar, 'moved')
      leave(a, gap)
      await sleep(60)
      hover(b, gap)
      await moved

      expect(hides).toEqual([])
      expect(text()).toBe('Italic')
      tooltip.dispose()
    })

    it('should hide once the pointer leaves the anchors', async () => {
      const { a, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown

      const hidden = wait(bar, 'hidden')
      leave(a, document.body)
      await hidden

      expect(document.querySelector('.tooltip')).toBeNull()
      expect(a.hasAttribute('aria-describedby')).toBeFalse()
      tooltip.dispose()
    })

    it('should go back to the focused anchor when the pointer leaves another one', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      a.focus()
      await shown

      let moved = wait(bar, 'moved')
      hover(b)
      await moved
      expect(text()).toBe('Italic')

      moved = wait(bar, 'moved')
      leave(b, document.body)
      const event = await moved

      expect(event.relatedTarget).toBe(a)
      expect(text()).toBe('Bold')
      expect(a.getAttribute('aria-describedby')).toBe(document.querySelector('.tooltip').id)
      tooltip.dispose()
    })

    it('should keep the tip on the focused anchor while the pointer rests on one without content', async () => {
      const { a, bar, c, tooltip } = setup()
      const shown = wait(bar, 'shown')
      a.focus()
      await shown

      hover(c)
      await sleep(150)

      expect(text()).toBe('Bold')
      expect(document.querySelector('.tooltip.show')).not.toBeNull()
      tooltip.dispose()
    })

    it('should hide when the pointer moves onto an anchor without content', async () => {
      const { a, bar, c, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown

      const hidden = wait(bar, 'hidden')
      leave(a, c)
      hover(c, a)
      await hidden

      expect(document.querySelector('.tooltip')).toBeNull()
      tooltip.dispose()
    })

    it('should close when the active anchor leaves the document', async () => {
      const { a, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown

      const hidden = wait(bar, 'hidden')
      a.remove()
      window.dispatchEvent(new Event('resize'))
      await hidden

      expect(document.querySelector('.tooltip')).toBeNull()
      tooltip.dispose()
    })

    it('should close and open again when the next anchor sits in a dialog', async () => {
      fixtureEl.innerHTML = '<div id="bar"><button type="button" id="a" title="Bold">B</button><dialog open><button type="button" id="b" title="Italic">I</button></dialog></div>'
      const bar = fixtureEl.querySelector('#bar')
      const a = bar.querySelector('#a')
      const b = bar.querySelector('#b')
      const tooltip = new Tooltip(bar, { anchors: 'button' })
      let shown = wait(bar, 'shown')
      hover(a)
      await shown

      shown = wait(bar, 'shown')
      hover(b, a)
      const event = await shown

      expect(event.relatedTarget).toBe(b)
      expect(document.querySelector('.tooltip').parentElement).toBe(bar.querySelector('dialog'))
      tooltip.dispose()
    })

    it('should pin a tip that hovering an anchor opened on a click there', async () => {
      const { a, bar, tooltip } = setup({ trigger: 'hover click' })
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      a.click()
      leave(a, document.body)
      await sleep(300)

      expect(text()).toBe('Bold')
      expect(document.querySelector('.tooltip.show')).not.toBeNull()
      tooltip.dispose()
    })

    it('should drop the pin when the pointer moves the tip to another anchor', async () => {
      const { a, b, bar, tooltip } = setup({ trigger: 'hover click' })
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      a.click()

      const moved = wait(bar, 'moved')
      leave(a, b)
      hover(b, a)
      await moved
      leave(b, document.body)
      await Promise.race([wait(bar, 'hidden'), sleep(500)])

      expect(document.querySelector('.tooltip.show')).toBeNull()
      tooltip.dispose()
    })

    it('should keep the pin when a click moves the tip into another dialog', async () => {
      fixtureEl.innerHTML = '<div id="bar"><button type="button" id="a" title="Bold">B</button><dialog open><button type="button" id="b" title="Italic">I</button></dialog></div>'
      const bar = fixtureEl.querySelector('#bar')
      const a = bar.querySelector('#a')
      const b = bar.querySelector('#b')
      const tooltip = new Tooltip(bar, { anchors: 'button', trigger: 'hover click' })
      let shown = wait(bar, 'shown')
      hover(a)
      await shown

      shown = wait(bar, 'shown')
      b.click()
      await shown
      leave(b, document.body)
      await sleep(300)

      expect(text()).toBe('Italic')
      expect(document.querySelector('.tooltip.show')).not.toBeNull()
      tooltip.dispose()
    })

    it('should pin the tip the pointer moved into another dialog on a click there', async () => {
      fixtureEl.innerHTML = '<div id="bar"><button type="button" id="a" title="Bold">B</button><dialog open><button type="button" id="b" title="Italic">I</button></dialog></div>'
      const bar = fixtureEl.querySelector('#bar')
      const a = bar.querySelector('#a')
      const b = bar.querySelector('#b')
      const tooltip = new Tooltip(bar, { anchors: 'button', trigger: 'hover click' })
      let shown = wait(bar, 'shown')
      hover(a)
      await shown

      shown = wait(bar, 'shown')
      hover(b, a)
      await shown
      b.click()
      leave(b, document.body)
      await sleep(300)

      expect(text()).toBe('Italic')
      expect(document.querySelector('.tooltip.show')).not.toBeNull()
      tooltip.dispose()
    })

    it('should keep a click made while the tip reopens in another dialog', async () => {
      fixtureEl.innerHTML = '<div id="bar"><button type="button" id="a" title="Bold">B</button><dialog open><button type="button" id="b" title="Italic">I</button></dialog></div>'
      const bar = fixtureEl.querySelector('#bar')
      const a = bar.querySelector('#a')
      const b = bar.querySelector('#b')
      const tooltip = new Tooltip(bar, { anchors: 'button', trigger: 'hover click' })
      let shown = wait(bar, 'shown')
      hover(a)
      await shown

      shown = wait(bar, 'shown')
      hover(b, a)
      b.click()
      await shown
      leave(b, document.body)
      await sleep(300)

      expect(text()).toBe('Italic')
      expect(document.querySelector('.tooltip.show')).not.toBeNull()
      tooltip.dispose()
    })

    it('should drop the pin when the focus moves the tip to another anchor', async () => {
      fixtureEl.innerHTML = `${markup}<button type="button" id="out">Out</button>`
      const bar = fixtureEl.querySelector('#bar')
      const a = bar.querySelector('#a')
      const b = bar.querySelector('#b')
      const tooltip = new Tooltip(bar, { anchors: 'button', trigger: 'focus click' })
      const shown = wait(bar, 'shown')
      a.focus()
      await shown
      a.click()

      const moved = wait(bar, 'moved')
      b.focus()
      await moved
      fixtureEl.querySelector('#out').focus()
      await sleep(300)

      expect(document.querySelector('.tooltip.show')).toBeNull()
      tooltip.dispose()
    })

    it('should pin the tip the pointer moved to another anchor on a click there', async () => {
      const { a, b, bar, tooltip } = setup({ trigger: 'hover click' })
      const shown = wait(bar, 'shown')
      a.click()
      await shown

      const moved = wait(bar, 'moved')
      hover(b)
      await moved
      b.click()
      leave(b, document.body)
      await sleep(300)

      expect(text()).toBe('Italic')
      expect(document.querySelector('.tooltip.show')).not.toBeNull()
      tooltip.dispose()
    })

    it('should ignore anchors inside its own tip', async () => {
      fixtureEl.innerHTML = '<div id="bar"><button type="button" id="a">B</button></div>'
      const bar = fixtureEl.querySelector('#bar')
      const a = bar.querySelector('#a')
      const tooltip = new Tooltip(bar, {
        anchors: 'button, b', container: '#bar', html: true, title: '<b>Bold</b>'
      })
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))
      const inner = document.querySelector('.tooltip b')

      expect(inner).not.toBeNull()

      inner.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      await sleep(20)

      expect(moves).toEqual([])
      tooltip.dispose()
    })

    it('should rewrite the content in place and drop it on the next anchor', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const tip = document.querySelector('.tooltip')
      const events = []
      for (const name of ['show', 'inserted']) {
        bar.addEventListener(`${name}.coreui.tooltip`, () => events.push(name))
      }

      tooltip.setContent({ '.tooltip-inner': 'Copied' })

      expect(document.querySelector('.tooltip')).toBe(tip)
      expect(text()).toBe('Copied')

      const moved = wait(bar, 'moved')
      hover(b, a)
      await moved

      expect(text()).toBe('Italic')
      expect(events).toEqual([])
      tooltip.dispose()
    })

    it('should keep content set in a move listener', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      bar.addEventListener('move.coreui.tooltip', event => {
        tooltip.setContent({ '.tooltip-inner': `Loaded ${event.relatedTarget.id}` })
      })

      const moved = wait(bar, 'moved')
      hover(b, a)
      await moved

      expect(text()).toBe('Loaded b')
      tooltip.dispose()
    })

    it('should leave the title of the wrapper alone and give the anchors theirs back on dispose', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown

      expect(bar.getAttribute('title')).toBe('Toolbar')
      expect(a.getAttribute('title')).toBe('')

      tooltip.dispose()

      expect(a.getAttribute('title')).toBe('Bold')
      expect(b.getAttribute('title')).toBe('Italic')
      expect(document.querySelector('.tooltip')).toBeNull()
    })

    it('should refuse anchors together with selector', () => {
      fixtureEl.innerHTML = '<div></div>'

      expect(() => new Tooltip(fixtureEl.querySelector('div'), { anchors: 'button', selector: 'button' })).toThrowError(TypeError)
    })

    it('should create the instance of the wrapper from the data API and show on the first hover', async () => {
      fixtureEl.innerHTML = '<div id="bar" data-coreui-toggle="tooltip" data-coreui-anchors="button"><button type="button" id="a" title="Bold" data-coreui-toggle="tooltip">B</button></div>'
      const bar = fixtureEl.querySelector('#bar')
      const a = fixtureEl.querySelector('#a')
      const shown = wait(bar, 'shown')

      a.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await shown

      expect(Tooltip.getInstance(bar)).not.toBeNull()
      expect(Tooltip.getInstance(a)).toBeNull()
      expect(document.querySelectorAll('.tooltip')).toHaveSize(1)
      Tooltip.getInstance(bar).dispose()
    })

    it('should be left out of a delegation that matches its wrapper', async () => {
      fixtureEl.innerHTML = '<div id="bar" data-coreui-toggle="tooltip" data-coreui-anchors="button"><button type="button" id="a" title="Bold">B</button></div>'
      const host = new Tooltip(fixtureEl, { selector: '[data-coreui-toggle="tooltip"]', trigger: 'click' })
      const bar = fixtureEl.querySelector('#bar')

      fixtureEl.querySelector('#a').click()
      await sleep(20)

      expect(Tooltip.getInstance(bar)).toBeNull()
      host.dispose()
    })

    it('should open on a titled anchor after the focus rested on one without content', async () => {
      const { a, bar, c, tooltip } = setup()
      c.focus()
      await sleep(20)

      const shown = wait(bar, 'shown')
      hover(a)
      await shown

      expect(text()).toBe('Bold')
      tooltip.dispose()
    })

    it('should keep a tip dismissed with Escape away when the pointer crosses another anchor', async () => {
      const { a, b, bar, tooltip } = setup()
      let shown = wait(bar, 'shown')
      a.focus()
      await shown

      const hidden = wait(bar, 'hidden')
      document.querySelector('.tooltip').dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
      await hidden

      shown = wait(bar, 'shown')
      hover(b)
      await shown
      const gone = wait(bar, 'hidden')
      leave(b, document.body)
      await gone
      await sleep(150)

      expect(document.querySelector('.tooltip')).toBeNull()
      tooltip.dispose()
    })

    it('should drop content set from code once the tip opens on another anchor', async () => {
      const { a, b, bar, c, tooltip } = setup()
      let shown = wait(bar, 'shown')
      hover(a)
      await shown
      tooltip.setContent({ '.tooltip-inner': 'Copied' })

      const hidden = wait(bar, 'hidden')
      leave(a, c)
      hover(c, a)
      await hidden

      shown = wait(bar, 'shown')
      hover(b)
      await shown

      expect(text()).toBe('Italic')
      tooltip.dispose()
    })

    it('should follow the active anchor with its position, option callbacks and classes', async () => {
      const placements = []
      const offsets = []
      const { a, b, bar, tooltip } = setup({
        customClass: anchor => `c-${anchor.id}`,
        offset(_, anchor) {
          offsets.push(anchor.id)
          return [0, 6]
        },
        placement(tip, anchor) {
          placements.push(anchor.id)
          return 'bottom'
        }
      })
      b.style.marginLeft = '200px'
      const shown = wait(bar, 'shown')
      hover(a)
      await shown

      expect(document.querySelector('.tooltip')).toHaveClass('c-a')

      const moved = wait(bar, 'moved')
      hover(b, a)
      await moved
      const center = rect => rect.left + (rect.width / 2)
      const tip = center(document.querySelector('.tooltip').getBoundingClientRect())

      expect(document.querySelector('.tooltip')).toHaveClass('c-b')
      expect(document.querySelector('.tooltip')).not.toHaveClass('c-a')
      expect(placements.at(-1)).toBe('b')
      expect(offsets.at(-1)).toBe('b')
      expect(Math.abs(tip - center(b.getBoundingClientRect()))).toBeLessThan(Math.abs(tip - center(a.getBoundingClientRect())))
      expect(Math.abs(tip - center(b.getBoundingClientRect()))).toBeLessThan(Math.abs(tip - center(bar.getBoundingClientRect())))
      tooltip.dispose()
    })

    it('should hide when the focus moves to an element of the wrapper that is not an anchor', async () => {
      fixtureEl.innerHTML = '<div id="bar"><button type="button" id="a" title="Bold">B</button><input id="field"></div>'
      const bar = fixtureEl.querySelector('#bar')
      const tooltip = new Tooltip(bar, { anchors: 'button' })
      const shown = wait(bar, 'shown')
      bar.querySelector('#a').focus()
      await shown

      const hidden = wait(bar, 'hidden')
      bar.querySelector('#field').focus()
      await hidden

      expect(document.querySelector('.tooltip')).toBeNull()
      tooltip.dispose()
    })

    it('should give the moved tip the parent layer of its new anchor', async () => {
      fixtureEl.innerHTML = '<div id="bar"><div id="panel"><button type="button" id="a" title="Bold">B</button></div><button type="button" id="b" title="Italic">I</button></div>'
      const bar = fixtureEl.querySelector('#bar')
      const panel = {
        anchor: () => null, closesOn: () => false, dismiss() {}, isOpen: () => true, kind: 'popup', parts: () => [bar.querySelector('#panel')]
      }
      registerLayer(panel)
      const tooltip = new Tooltip(bar, { anchors: 'button' })
      const shown = wait(bar, 'shown')
      hover(bar.querySelector('#a'))
      await shown

      expect(getParentLayer(tooltip._layer)).toBe(panel)

      const moved = wait(bar, 'moved')
      hover(bar.querySelector('#b'), bar.querySelector('#a'))
      await moved

      expect(getParentLayer(tooltip._layer)).toBeNull()
      tooltip.dispose()
      unregisterLayer(panel)
    })

    it('should close and open again at an anchor with another text direction', async () => {
      fixtureEl.innerHTML = '<div id="bar"><button type="button" id="a" title="Bold">B</button><span dir="rtl"><button type="button" id="b" title="Italic">I</button></span></div>'
      const bar = fixtureEl.querySelector('#bar')
      const tooltip = new Tooltip(bar, { anchors: 'button' })
      let shown = wait(bar, 'shown')
      hover(bar.querySelector('#a'))
      await shown
      const events = []
      for (const name of ['hide', 'hidden', 'show', 'move']) {
        bar.addEventListener(`${name}.coreui.tooltip`, () => events.push(name))
      }

      shown = wait(bar, 'shown')
      hover(bar.querySelector('#b'), bar.querySelector('#a'))
      await shown

      expect(events).toEqual(['hide', 'hidden', 'show'])
      expect(document.querySelector('.tooltip').dir).toBe('rtl')
      tooltip.dispose()
    })

    it('should not mark a tip as moving without animation', async () => {
      const { a, b, bar, tooltip } = setup({ animation: false })
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const tip = document.querySelector('.tooltip')

      const moved = wait(bar, 'moved')
      b.focus()

      expect(tip.hasAttribute('data-coreui-moving')).toBeFalse()
      await moved
      tooltip.dispose()
    })

    it('should send moved only for the anchor a move ends at', async () => {
      const { a, b, bar, c, tooltip } = setup()
      c.setAttribute('title', 'Code')
      const shown = wait(bar, 'shown')
      a.focus()
      await shown
      const moved = []
      bar.addEventListener('moved.coreui.tooltip', event => moved.push(event.relatedTarget.id))

      b.focus()
      c.focus()
      await sleep(50)

      expect(moved).toEqual(['c'])
      tooltip.dispose()
    })

    it('should drop the moving mark and a pending move when it hides', async () => {
      const { a, b, bar, tooltip } = setup()
      const shown = wait(bar, 'shown')
      hover(a)
      await shown
      const moves = []
      bar.addEventListener('move.coreui.tooltip', () => moves.push(1))

      const { away } = cross(a, b)
      const tip = document.querySelector('.tooltip')
      tip.setAttribute('data-coreui-moving', '')
      await tooltip.hide()
      const moveTo = spyOn(tooltip, '_moveTo')
      pointer(away)
      await sleep(150)

      expect(moveTo).not.toHaveBeenCalled()

      expect(tip.hasAttribute('data-coreui-moving')).toBeFalse()
      expect(moves).toEqual([])
      tooltip.dispose()
    })

    it('should describe the focused element inside an anchor and follow the focus within it', async () => {
      fixtureEl.innerHTML = '<div id="bar"><div class="row" data-coreui-title="Row"><button type="button" id="x">x</button><button type="button" id="y">y</button></div></div>'
      const bar = fixtureEl.querySelector('#bar')
      const x = bar.querySelector('#x')
      const y = bar.querySelector('#y')
      const tooltip = new Tooltip(bar, { anchors: '.row' })
      const shown = wait(bar, 'shown')
      x.focus()
      await shown
      const { id } = document.querySelector('.tooltip')

      expect(x.getAttribute('aria-describedby')).toBe(id)

      y.focus()

      expect(y.getAttribute('aria-describedby')).toBe(id)
      expect(x.hasAttribute('aria-describedby')).toBeFalse()
      expect(bar.querySelector('.row').hasAttribute('aria-describedby')).toBeFalse()
      tooltip.dispose()
    })

    it('should refuse anchors with a manual trigger and do nothing on show() before an anchor is active', async () => {
      fixtureEl.innerHTML = '<div title="Wrapper"><button type="button" title="Bold">B</button></div>'
      const wrapper = fixtureEl.querySelector('div')

      expect(() => new Tooltip(wrapper, { anchors: 'button', trigger: 'manual' })).toThrowError(TypeError)

      const tooltip = new Tooltip(wrapper, { anchors: 'button', title: 'Fallback' })
      await tooltip.show()

      expect(document.querySelector('.tooltip')).toBeNull()
      tooltip.dispose()
    })

    it('should take the title off the anchors of a group that starts disabled', () => {
      const { a, tooltip } = setup({ disabled: true })

      hover(a)

      expect(a.getAttribute('title')).toBe('')
      expect(document.querySelector('.tooltip')).toBeNull()
      tooltip.dispose()
    })

    it('should give its own tooltip to a toggle inside the wrapper that is not an anchor', async () => {
      fixtureEl.innerHTML = '<div id="bar" data-coreui-toggle="tooltip" data-coreui-anchors=".anchor"><button type="button" class="anchor" title="Bold">B</button><span id="own" tabindex="0" data-coreui-toggle="tooltip" title="Own">x</span></div>'
      const own = fixtureEl.querySelector('#own')
      const shown = new Promise(resolve => {
        own.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })

      own.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await shown

      expect(Tooltip.getInstance(own)).not.toBeNull()
      expect(text()).toBe('Own')
      Tooltip.getInstance(own).dispose()
      Tooltip.getInstance(fixtureEl.querySelector('#bar'))?.dispose()
    })
  })

  describe('path to the tip', () => {
    const sleep = ms => new Promise(resolve => {
      setTimeout(resolve, ms)
    })
    const mouse = (element, type, { x, y }, relatedTarget = null) => element.dispatchEvent(new MouseEvent(type, {
      bubbles: true, clientX: x, clientY: y, relatedTarget
    }))
    const pointer = ({ x, y }) => document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y }))
    const tipElement = () => document.querySelector('.tooltip')

    const setup = async (config = {}) => {
      fixtureEl.innerHTML = '<style>.tooltip { position: absolute; }</style><button type="button" title="A tip wider than its button" style="position: fixed; left: 200px; top: 200px; width: 40px; height: 30px;">B</button>'
      const button = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(button, config)
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      mouse(button, 'mouseover', { x: 220, y: 215 })
      await shown
      const rect = tipElement().getBoundingClientRect()
      const exit = { x: 220, y: 200 }
      const edge = { x: rect.left + (rect.width / 2), y: rect.bottom }
      return {
        button,
        exit,
        leave: (point = exit) => mouse(button, 'mouseout', point),
        toward: share => ({ x: exit.x + ((edge.x - exit.x) * share), y: exit.y + ((edge.y - exit.y) * share) }),
        tooltip
      }
    }

    it('should keep the tip while the pointer crosses the gap to it', async () => {
      const { button, leave, toward, tooltip } = await setup()

      leave()
      await sleep(15)
      pointer(toward(0.4))
      await sleep(15)
      pointer(toward(0.8))
      await sleep(15)
      mouse(tipElement(), 'mouseover', toward(1), button)
      await sleep(60)

      expect(tooltip._isShown()).toBeTrue()
      tooltip.dispose()
    })

    it('should hide at once when the pointer moves away from the tip', async () => {
      const { leave, tooltip } = await setup()
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      leave({ x: 220, y: 230 })
      pointer({ x: 220, y: 236 })
      await sleep(10)

      expect(hide).toHaveBeenCalled()
      tooltip.dispose()
    })

    it('should hide once the pointer rests on its way to the tip', async () => {
      const { leave, toward, tooltip } = await setup()
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      leave()
      pointer(toward(0.3))
      await sleep(10)

      expect(hide).not.toHaveBeenCalled()

      await sleep(50)

      expect(hide).toHaveBeenCalled()
      tooltip.dispose()
    })

    it('should hide as soon as the pointer turns away from the tip', async () => {
      const { exit, leave, tooltip } = await setup()
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      leave()
      pointer({ x: exit.x + 40, y: exit.y + 2 })
      await sleep(10)

      expect(hide).toHaveBeenCalled()
      tooltip.dispose()
    })

    it('should count the hide delay from the moment the pointer stops heading for the tip', async () => {
      const { leave, toward, tooltip } = await setup({ delay: { show: 0, hide: 60 } })
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      leave()
      pointer(toward(0.3))
      await sleep(70)

      expect(hide).not.toHaveBeenCalled()

      await sleep(60)

      expect(hide).toHaveBeenCalled()
      tooltip.dispose()
    })

    it('should keep the tip when the pointer comes back to the button', async () => {
      const { button, exit, leave, toward, tooltip } = await setup()
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      leave()
      pointer(toward(0.3))
      mouse(button, 'mouseover', exit)
      await sleep(60)
      pointer({ x: 0, y: 0 })

      expect(hide).not.toHaveBeenCalled()
      tooltip.dispose()
    })

    it('should stop the previous following when the pointer leaves again right after coming back', async () => {
      const { button, exit, leave, toward, tooltip } = await setup()

      leave()
      pointer(toward(0.1))
      mouse(button, 'mouseover', exit)
      const removed = spyOn(document, 'removeEventListener').and.callThrough()
      leave()

      expect(removed).toHaveBeenCalledWith('pointermove', jasmine.any(Function))
      tooltip.dispose()
    })

    it('should keep the tip when the pointer reaches it within the hide delay', async () => {
      const { button, leave, toward, tooltip } = await setup({ delay: { show: 0, hide: 80 } })

      const hide = spyOn(tooltip, 'hide').and.callThrough()

      leave({ x: 220, y: 230 })
      pointer({ x: 220, y: 236 })
      await sleep(30)
      mouse(tipElement(), 'mouseover', toward(1), button)
      await sleep(100)

      expect(hide).not.toHaveBeenCalled()
      expect(tooltip._isShown()).toBeTrue()
      tooltip.dispose()
    })

    it('should not bring the tip back after hide() while following', async () => {
      const { leave, toward, tooltip } = await setup()

      leave()
      pointer(toward(0.3))
      await tooltip.hide()
      const leaveSpy = spyOn(tooltip, '_leave').and.callThrough()
      await sleep(60)
      pointer({ x: 0, y: 0 })

      expect(leaveSpy).not.toHaveBeenCalled()
      tooltip.dispose()
    })

    it('should stop following on dispose()', async () => {
      const { leave, toward, tooltip } = await setup()
      const removed = spyOn(document, 'removeEventListener').and.callThrough()

      leave()
      pointer(toward(0.3))
      tooltip.dispose()

      expect(removed).toHaveBeenCalledWith('pointermove', jasmine.any(Function))
    })

    it('should keep a tip reached across the gap when the focus leaves it', async () => {
      const { button, leave, toward, tooltip } = await setup()

      leave()
      pointer(toward(0.5))
      mouse(tipElement(), 'mouseover', toward(1), button)
      button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
      await sleep(20)

      expect(tooltip._isShown()).toBeTrue()
      tooltip.dispose()
    })

    it('should keep the tip across the gap with the hover and click triggers and hide it when the pointer leaves the tip', async () => {
      const { button, leave, toward, tooltip } = await setup({ trigger: 'hover click' })
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      leave()
      await sleep(15)
      pointer(toward(0.4))
      await sleep(15)
      pointer(toward(0.8))
      await sleep(15)
      mouse(tipElement(), 'mouseover', toward(1), button)
      await sleep(60)

      expect(hide).not.toHaveBeenCalled()

      mouse(tipElement(), 'mouseout', { x: 0, y: 0 }, document.body)
      await sleep(10)

      expect(hide).toHaveBeenCalled()
      tooltip.dispose()
    })

    it('should keep a tip pinned by a click when the pointer leaves the tip', async () => {
      const { button, leave, toward, tooltip } = await setup({ trigger: 'hover click' })
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      button.click()
      leave()
      mouse(tipElement(), 'mouseover', toward(1), button)
      mouse(tipElement(), 'mouseout', { x: 0, y: 0 }, document.body)
      await sleep(60)

      expect(hide).not.toHaveBeenCalled()
      expect(tooltip._isShown()).toBeTrue()
      tooltip.dispose()
    })

    it('should close a pinned tip on the next click with the pointer still on the trigger', async () => {
      const { button, tooltip } = await setup({ trigger: 'hover click' })

      button.click()
      await sleep(10)

      expect(tooltip._isShown()).toBeTrue()

      button.click()
      await sleep(60)

      expect(document.querySelector('.tooltip.show')).toBeNull()
      tooltip.dispose()
    })

    it('should close a tip shown by show() on the first click with the pointer on the trigger', async () => {
      fixtureEl.innerHTML = '<button type="button" title="A tip">B</button>'
      const button = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(button, { trigger: 'hover click' })
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })

      tooltip.show()
      await shown
      mouse(button, 'mouseover', { x: 0, y: 0 })
      button.click()
      await sleep(60)

      expect(document.querySelector('.tooltip.show')).toBeNull()
      tooltip.dispose()
    })

    it('should forget that hover opened a tip once it hides', async () => {
      const { button, leave, tooltip } = await setup({ trigger: 'hover click' })
      const hidden = new Promise(resolve => {
        button.addEventListener('hidden.coreui.tooltip', resolve, { once: true })
      })

      leave({ x: 0, y: 0 })
      await hidden
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      tooltip.show()
      await shown
      button.click()
      await sleep(60)

      expect(document.querySelector('.tooltip.show')).toBeNull()
      tooltip.dispose()
    })

    it('should forget a hover that left before the show delay ended', async () => {
      fixtureEl.innerHTML = '<button type="button" title="A tip">B</button>'
      const button = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(button, { delay: { hide: 0, show: 200 }, trigger: 'hover click' })

      mouse(button, 'mouseover', { x: 0, y: 0 })
      await sleep(20)
      mouse(button, 'mouseout', { x: 0, y: 0 }, document.body)
      await sleep(250)
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      tooltip.show()
      await shown
      mouse(button, 'mouseover', { x: 0, y: 0 })
      button.click()
      await sleep(60)

      expect(document.querySelector('.tooltip.show')).toBeNull()
      tooltip.dispose()
    })

    it('should keep a tip pinned again before the hide delay of the closing click ends', async () => {
      const { button, tooltip } = await setup({ delay: { hide: 300, show: 0 }, trigger: 'hover click' })

      button.click()
      await sleep(10)
      button.click()
      await sleep(50)
      button.click()
      await sleep(400)

      expect(tooltip._isShown()).toBeTrue()
      tooltip.dispose()
    })

    it('should open on a second click that comes before the show delay ends', async () => {
      fixtureEl.innerHTML = '<button type="button" title="A tip">B</button>'
      const button = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(button, { delay: { hide: 0, show: 100 }, trigger: 'click' })

      button.click()
      await sleep(20)
      button.click()
      await sleep(200)

      expect(tooltip._isShown()).toBeTrue()
      tooltip.dispose()
    })

    it('should pin a tip that focus showed on a click and keep it after the focus leaves', async () => {
      fixtureEl.innerHTML = '<button type="button" id="trigger" title="A tip">B</button><button type="button" id="next">Next</button>'
      const button = fixtureEl.querySelector('#trigger')
      const tooltip = new Tooltip(button, { trigger: 'click focus' })
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })

      button.focus()
      await shown
      button.click()
      await sleep(10)
      fixtureEl.querySelector('#next').focus()
      await sleep(60)

      expect(tooltip._isShown()).toBeTrue()
      tooltip.dispose()
    })

    it('should hide a tip shown by focus with the click and focus triggers when the focus leaves the tip', async () => {
      fixtureEl.innerHTML = '<button type="button" id="trigger">B</button><button type="button" id="next">Next</button>'
      const button = fixtureEl.querySelector('#trigger')
      const tooltip = new Tooltip(button, { html: true, title: '<a href="#">Link</a>', trigger: 'click focus' })
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })

      button.focus()
      await shown
      const link = tipElement().querySelector('a')
      link.focus()
      await sleep(10)

      expect(tooltip._isShown()).toBeTrue()

      fixtureEl.querySelector('#next').focus()
      await sleep(10)

      expect(document.querySelector('.tooltip.show')).toBeNull()
      tooltip.dispose()
    })

    it('should leave a tip shown by the click trigger alone without listeners', async () => {
      fixtureEl.innerHTML = '<button type="button" title="A tip">B</button>'
      const button = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(button, { trigger: 'click' })
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })

      button.click()
      await shown
      mouse(tipElement(), 'mouseout', { x: 0, y: 0 }, document.body)
      await sleep(10)

      expect(tooltip._tipEventOut).toBeNull()
      expect(tooltip._isShown()).toBeTrue()
      tooltip.dispose()
    })

    it('should follow towards a tip on the start side in a right-to-left page', async () => {
      fixtureEl.innerHTML = '<style>.tooltip { position: absolute; }</style><div dir="rtl"><button type="button" title="A tip on the start side" style="position: fixed; left: 300px; top: 200px; width: 40px; height: 30px;">B</button></div>'
      const button = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(button, { placement: 'end' })
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      mouse(button, 'mouseover', { x: 320, y: 215 })
      await shown
      const rect = tipElement().getBoundingClientRect()
      const exit = { x: 300, y: 215 }
      const edge = { x: rect.right, y: rect.top + (rect.height / 2) }
      const toward = share => ({ x: exit.x + ((edge.x - exit.x) * share), y: exit.y + ((edge.y - exit.y) * share) })
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      expect(tipElement().getAttribute('data-coreui-placement')).toBe('left')

      mouse(button, 'mouseout', exit)
      await sleep(15)
      pointer(toward(0.5))
      await sleep(15)
      mouse(tipElement(), 'mouseover', toward(1), button)
      await sleep(60)

      expect(hide).not.toHaveBeenCalled()
      tooltip.dispose()
    })

    it('should finish hiding when the pointer enters the fading tip', async () => {
      fixtureEl.innerHTML = '<style>.tooltip { position: absolute; transition: opacity .3s linear; } .tooltip:not(.show) { opacity: 0; }</style><button type="button" title="Tip" style="position: fixed; left: 200px; top: 200px; width: 40px; height: 30px;">B</button>'
      const button = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(button)
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      mouse(button, 'mouseover', { x: 220, y: 215 })
      await shown
      const tip = tipElement()
      let hidden = false
      button.addEventListener('hidden.coreui.tooltip', () => {
        hidden = true
      })

      mouse(button, 'mouseout', { x: 220, y: 230 })
      pointer({ x: 220, y: 240 })
      await sleep(20)

      expect(tip.isConnected).toBeTrue()
      expect(tip.classList.contains('show')).toBeFalse()

      mouse(tip, 'mouseover', { x: 220, y: 190 }, button)
      await sleep(450)

      expect(hidden).toBeTrue()
      tooltip.dispose()
    })

    it('should not keep a focus tip open when the pointer enters it', async () => {
      fixtureEl.innerHTML = '<button type="button" title="Tip">B</button>'
      const button = fixtureEl.querySelector('button')
      const tooltip = new Tooltip(button, { delay: { show: 0, hide: 40 }, trigger: 'focus' })
      const shown = new Promise(resolve => {
        button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      await shown
      const hide = spyOn(tooltip, 'hide').and.callThrough()

      button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
      tipElement().dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await sleep(60)

      expect(hide).toHaveBeenCalled()
      tooltip.dispose()
    })
  })

  describe('disabled', () => {
    it('should not show while the disabled option is set and show once enabled', async () => {
      fixtureEl.innerHTML = '<a href="#" title="Tip" data-coreui-disabled="true">x</a>'
      const element = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(element)

      await tooltip.show()
      expect(document.querySelector('.tooltip')).toBeNull()

      tooltip.enable()
      await tooltip.show()

      expect(document.querySelector('.tooltip.show')).not.toBeNull()
      tooltip.dispose()
    })

    it('should hide an open tip when disabled', async () => {
      fixtureEl.innerHTML = '<a href="#" title="Tip">x</a>'
      const element = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(element)
      await tooltip.show()

      const hidden = new Promise(resolve => {
        element.addEventListener('hidden.coreui.tooltip', resolve, { once: true })
      })
      tooltip.toggleEnabled()
      await hidden

      expect(document.querySelector('.tooltip')).toBeNull()
      tooltip.dispose()
    })

    it('should keep a delegation disabled from code quiet and show again once enabled', async () => {
      fixtureEl.innerHTML = '<div><a href="#" title="Tip">x</a></div>'
      const host = new Tooltip(fixtureEl.querySelector('div'), { selector: 'a' })
      const element = fixtureEl.querySelector('a')
      let shown = new Promise(resolve => {
        element.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await shown

      const hidden = new Promise(resolve => {
        element.addEventListener('hidden.coreui.tooltip', resolve, { once: true })
      })
      host.disable()
      await hidden
      element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
      element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await new Promise(resolve => {
        setTimeout(resolve, 20)
      })

      expect(document.querySelector('.tooltip')).toBeNull()

      host.enable()
      element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
      shown = new Promise(resolve => {
        element.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await shown

      expect(document.querySelector('.tooltip.show')).not.toBeNull()
      host.dispose()
      Tooltip.getInstance(element).dispose()
    })

    it('should let a delegation enabled from code show its tips', async () => {
      fixtureEl.innerHTML = '<div><a href="#" title="Tip">x</a></div>'
      const host = new Tooltip(fixtureEl.querySelector('div'), { disabled: true, selector: 'a' })
      const element = fixtureEl.querySelector('a')

      host.enable()
      const shown = new Promise(resolve => {
        element.addEventListener('shown.coreui.tooltip', resolve, { once: true })
      })
      element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await shown

      expect(document.querySelector('.tooltip.show')).not.toBeNull()
      host.dispose()
      Tooltip.getInstance(element).dispose()
    })
  })

  describe('getInstance', () => {
    it('should return tooltip instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const alert = new Tooltip(div)

      expect(Tooltip.getInstance(div)).toEqual(alert)
      expect(Tooltip.getInstance(div)).toBeInstanceOf(Tooltip)
    })

    it('should return null when there is no tooltip instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Tooltip.getInstance(div)).toBeNull()
    })
  })

  describe('aria-label', () => {
    it('should add the aria-label attribute for referencing original title', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const tooltipShown = document.querySelector('.tooltip')

          expect(tooltipShown).not.toBeNull()
          expect(tooltipEl.getAttribute('aria-label')).toEqual('Another tooltip')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should add the aria-label attribute when element text content is a whitespace string', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="A tooltip"><span>    </span></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const tooltipShown = document.querySelector('.tooltip')

          expect(tooltipShown).not.toBeNull()
          expect(tooltipEl.getAttribute('aria-label')).toEqual('A tooltip')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should not add the aria-label attribute if the attribute already exists', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" aria-label="Different label" title="Another tooltip"></a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const tooltipShown = document.querySelector('.tooltip')

          expect(tooltipShown).not.toBeNull()
          expect(tooltipEl.getAttribute('aria-label')).toEqual('Different label')
          resolve()
        })

        tooltip.show()
      })
    })

    it('should not add the aria-label attribute if the element has text content', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip">text content</a>'

        const tooltipEl = fixtureEl.querySelector('a')
        const tooltip = new Tooltip(tooltipEl)

        tooltipEl.addEventListener('shown.coreui.tooltip', () => {
          const tooltipShown = document.querySelector('.tooltip')

          expect(tooltipShown).not.toBeNull()
          expect(tooltipEl.getAttribute('aria-label')).toBeNull()
          resolve()
        })

        tooltip.show()
      })
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return tooltip instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tooltip = new Tooltip(div)

      expect(Tooltip.getOrCreateInstance(div)).toEqual(tooltip)
      expect(Tooltip.getInstance(div)).toEqual(Tooltip.getOrCreateInstance(div, {}))
      expect(Tooltip.getOrCreateInstance(div)).toBeInstanceOf(Tooltip)
    })

    it('should return new instance when there is no tooltip instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Tooltip.getInstance(div)).toBeNull()
      expect(Tooltip.getOrCreateInstance(div)).toBeInstanceOf(Tooltip)
    })

    it('should return new instance when there is no tooltip instance with given configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Tooltip.getInstance(div)).toBeNull()
      const tooltip = Tooltip.getOrCreateInstance(div, {
        title: () => 'test'
      })
      expect(tooltip).toBeInstanceOf(Tooltip)

      expect(tooltip._getTitle()).toEqual('test')
    })

    it('should return the instance when exists without given configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tooltip = new Tooltip(div, {
        title: () => 'nothing'
      })
      expect(Tooltip.getInstance(div)).toEqual(tooltip)

      const tooltip2 = Tooltip.getOrCreateInstance(div, {
        title: () => 'test'
      })
      expect(tooltip).toBeInstanceOf(Tooltip)
      expect(tooltip2).toEqual(tooltip)

      expect(tooltip2._getTitle()).toEqual('nothing')
    })
  })

  describe('jQueryInterface', () => {
    it('should create a tooltip', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.tooltip = Tooltip.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.tooltip.call(jQueryMock)

      expect(Tooltip.getInstance(div)).not.toBeNull()
    })

    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.tooltip = Tooltip.jQueryInterface
      jQueryMock.elements = [div]

      const instance = Tooltip.getOrCreateInstance(div)
      const spy = spyOn(instance, 'setContent')

      jQueryMock.fn.tooltip.call(jQueryMock, 'setContent', { '.tooltip-inner': 'x' })

      expect(spy).toHaveBeenCalledWith({ '.tooltip-inner': 'x' })
      instance.dispose()
    })

    it('should not re create a tooltip', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tooltip = new Tooltip(div)

      jQueryMock.fn.tooltip = Tooltip.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.tooltip.call(jQueryMock)

      expect(Tooltip.getInstance(div)).toEqual(tooltip)
    })

    it('should call a tooltip method', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tooltip = new Tooltip(div)

      const spy = spyOn(tooltip, 'show')

      jQueryMock.fn.tooltip = Tooltip.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.tooltip.call(jQueryMock, 'show')

      expect(Tooltip.getInstance(div)).toEqual(tooltip)
      expect(spy).toHaveBeenCalled()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const action = 'undefinedMethod'

      jQueryMock.fn.tooltip = Tooltip.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.tooltip.call(jQueryMock, action)
      }).toThrowError(TypeError, `No method named "${action}"`)
    })
  })

  describe('custom mouse events', () => {
    it('should not start hiding while the pointer moves between children of the trigger', () => {
      fixtureEl.innerHTML = '<a href="#" rel="tooltip" title="Another tooltip"><span>child</span></a>'

      const tooltipEl = fixtureEl.querySelector('a')
      const childEl = fixtureEl.querySelector('span')
      const tooltip = new Tooltip(tooltipEl, { trigger: 'hover' })
      const spy = spyOn(tooltip, '_leave')

      // The pointer leaves the child but stays inside the trigger, so `mouseout` carries a
      // `relatedTarget` within the trigger. This must not count as a leave.
      childEl.dispatchEvent(new MouseEvent('mouseout', {
        bubbles: true,
        relatedTarget: tooltipEl
      }))

      expect(spy).not.toHaveBeenCalled()

      tooltipEl.dispatchEvent(new MouseEvent('mouseout', {
        bubbles: true,
        relatedTarget: document.body
      }))

      expect(spy).toHaveBeenCalled()
    })
  })
})
