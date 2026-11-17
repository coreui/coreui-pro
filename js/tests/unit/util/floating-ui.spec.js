import { computePosition } from '@floating-ui/dom'
import {
  BREAKPOINTS,
  parseResponsivePlacement,
  getResponsivePlacement,
  createAnchoredPosition,
  createBreakpointListeners,
  disposeBreakpointListeners,
  matchAnchorWidth
} from '../../../src/util/floating-ui.js'

describe('FloatingUI Util', () => {
  describe('BREAKPOINTS', () => {
    it('should export breakpoint values', () => {
      expect(BREAKPOINTS).toEqual(jasmine.any(Object))
      expect(BREAKPOINTS.sm).toBe(576)
      expect(BREAKPOINTS.md).toBe(768)
      expect(BREAKPOINTS.lg).toBe(1024)
      expect(BREAKPOINTS.xl).toBe(1280)
      expect(BREAKPOINTS['2xl']).toBe(1536)
    })
  })

  describe('parseResponsivePlacement', () => {
    it('should return null for non-responsive placement strings', () => {
      expect(parseResponsivePlacement('bottom')).toBeNull()
      expect(parseResponsivePlacement('top-start')).toBeNull()
      expect(parseResponsivePlacement('left-end')).toBeNull()
      expect(parseResponsivePlacement('')).toBeNull()
      expect(parseResponsivePlacement(null)).toBeNull()
      expect(parseResponsivePlacement(undefined)).toBeNull()
    })

    it('should parse simple responsive placement', () => {
      const result = parseResponsivePlacement('bottom md:top')
      expect(result).toEqual({
        xs: 'bottom',
        md: 'top'
      })
    })

    it('should parse responsive placement with alignments', () => {
      const result = parseResponsivePlacement('bottom-start md:top-end lg:right')
      expect(result).toEqual({
        xs: 'bottom-start',
        md: 'top-end',
        lg: 'right'
      })
    })

    it('should parse all breakpoints', () => {
      const result = parseResponsivePlacement('bottom sm:top md:left lg:right xl:bottom-start 2xl:top-end')
      expect(result).toEqual({
        xs: 'bottom',
        sm: 'top',
        md: 'left',
        lg: 'right',
        xl: 'bottom-start',
        '2xl': 'top-end'
      })
    })

    it('should use default placement for xs when base is not specified', () => {
      const result = parseResponsivePlacement('md:top lg:bottom', 'right')
      expect(result).toEqual({
        xs: 'right',
        md: 'top',
        lg: 'bottom'
      })
    })

    it('should ignore invalid breakpoints', () => {
      const result = parseResponsivePlacement('bottom invalid:top md:left')
      expect(result).toEqual({
        xs: 'bottom',
        md: 'left'
      })
      expect(result.invalid).toBeUndefined()
    })

    it('should handle placement string with only responsive prefixes', () => {
      const result = parseResponsivePlacement('md:top')
      expect(result).toEqual({
        xs: 'bottom', // default
        md: 'top'
      })
    })
  })

  describe('getResponsivePlacement', () => {
    it('should return default placement when responsivePlacements is null', () => {
      expect(getResponsivePlacement(null)).toBe('bottom')
      expect(getResponsivePlacement(null, 'top')).toBe('top')
    })

    it('should return default placement when responsivePlacements is undefined', () => {
      expect(getResponsivePlacement(undefined)).toBe('bottom')
      expect(getResponsivePlacement(undefined, 'left')).toBe('left')
    })

    it('should return xs placement for small viewports', () => {
      // Mock a small viewport (less than sm breakpoint)
      spyOnProperty(window, 'innerWidth').and.returnValue(400)

      const placements = { xs: 'bottom', md: 'top' }
      expect(getResponsivePlacement(placements)).toBe('bottom')
    })

    it('should return appropriate placement for sm viewport', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(600)

      const placements = { xs: 'bottom', sm: 'top', md: 'left' }
      expect(getResponsivePlacement(placements)).toBe('top')
    })

    it('should return appropriate placement for md viewport', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(800)

      const placements = {
        xs: 'bottom',
        sm: 'top',
        md: 'left',
        lg: 'right'
      }
      expect(getResponsivePlacement(placements)).toBe('left')
    })

    it('should return appropriate placement for lg viewport', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1100)

      const placements = { xs: 'bottom', md: 'top', lg: 'right' }
      expect(getResponsivePlacement(placements)).toBe('right')
    })

    it('should return appropriate placement for xl viewport', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1300)

      const placements = { xs: 'bottom', lg: 'top', xl: 'left' }
      expect(getResponsivePlacement(placements)).toBe('left')
    })

    it('should return appropriate placement for 2xl viewport', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1600)

      const placements = { xs: 'bottom', xl: 'top', '2xl': 'right-start' }
      expect(getResponsivePlacement(placements)).toBe('right-start')
    })

    it('should cascade to smaller breakpoints when larger ones are not defined', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1600)

      // Only xs and md defined, viewport is 2xl
      const placements = { xs: 'bottom', md: 'top' }
      expect(getResponsivePlacement(placements)).toBe('top')
    })

    it('should use default when xs is not defined', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(400)

      const placements = { md: 'top' } // No xs
      expect(getResponsivePlacement(placements, 'left')).toBe('left')
    })

    it('should resolve against a given viewport width instead of the window', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1600)

      const placements = { xs: 'bottom', md: 'top', xl: 'left' }
      expect(getResponsivePlacement(placements, 'bottom', 0)).toBe('bottom')
      expect(getResponsivePlacement(placements, 'bottom', 800)).toBe('top')
    })
  })

  describe('createBreakpointListeners', () => {
    it('should create listeners for all breakpoints', () => {
      const callback = jasmine.createSpy('callback')
      const listeners = createBreakpointListeners(callback)

      expect(listeners).toEqual(jasmine.any(Array))
      expect(listeners.length).toBe(Object.keys(BREAKPOINTS).length)

      // Each listener should have mql and handler
      for (const listener of listeners) {
        expect(listener.mql).toBeDefined()
        expect(listener.handler).toBe(callback)
      }

      // Clean up
      disposeBreakpointListeners(listeners)
    })

    it('should create MediaQueryList objects with correct queries', () => {
      const callback = jasmine.createSpy('callback')
      const listeners = createBreakpointListeners(callback)

      // Verify media query objects are created
      expect(listeners[0].mql.media).toContain('min-width')

      // Clean up
      disposeBreakpointListeners(listeners)
    })
  })

  describe('disposeBreakpointListeners', () => {
    it('should remove all event listeners', () => {
      const callback = jasmine.createSpy('callback')
      const listeners = createBreakpointListeners(callback)

      // Spy on removeEventListener for each mql
      const spies = listeners.map(listener =>
        spyOn(listener.mql, 'removeEventListener').and.callThrough()
      )

      disposeBreakpointListeners(listeners)

      // Verify removeEventListener was called on each
      for (const spy of spies) {
        expect(spy).toHaveBeenCalledWith('change', callback)
      }
    })

    it('should handle empty array', () => {
      expect(() => disposeBreakpointListeners([])).not.toThrow()
    })
  })

  describe('createAnchoredPosition', () => {
    let host

    const nextFrames = () => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    })

    const mount = width => {
      host = document.createElement('div')
      host.innerHTML = `<div style="width: ${width}"></div><div style="width: 80px">Panel</div>`
      document.body.append(host)
      return [host.firstElementChild, host.lastElementChild]
    }

    afterEach(() => {
      host?.remove()
      host = null
    })

    it('should place the panel under the field and give it the field width as its min-width', async () => {
      const [field, panel] = mount('300.5px')
      const anchored = createAnchoredPosition(field, panel)

      await anchored.update()

      expect(panel.style.minWidth).toBe(`${field.getBoundingClientRect().width}px`)
      expect(Number.parseFloat(panel.style.top)).toBeGreaterThan(field.getBoundingClientRect().top)
      anchored.destroy()
    })

    it('should follow the field width while it resizes', async () => {
      const [field, panel] = mount('300px')
      const anchored = createAnchoredPosition(field, panel)

      await anchored.update()
      field.style.width = '200px'
      await nextFrames()

      expect(panel.style.minWidth).toBe('200px')
      anchored.destroy()
    })

    it('should clear the min-width once the field loses its width', async () => {
      const [field, panel] = mount('300px')
      const anchored = createAnchoredPosition(field, panel)

      await anchored.ready
      expect(panel.style.minWidth).toBe('300px')

      field.style.width = '0px'
      await nextFrames()

      expect(panel.style.minWidth).toBe('')
      anchored.destroy()
    })

    it('should place the widened panel by its final size', async () => {
      host = document.createElement('div')
      host.innerHTML = [
        `<div style="position: fixed; left: 0; top: ${window.innerHeight - 70}px; width: 400px; height: 20px"></div>`,
        '<div style="width: min-content; font: 16px/20px sans-serif">lorem ipsum dolor sitamet consectetur adipiscing</div>'
      ].join('')
      document.body.append(host)
      const [field, panel] = host.children
      const anchored = createAnchoredPosition(field, panel)

      await anchored.ready

      expect(panel.getBoundingClientRect().top).toBeGreaterThanOrEqual(field.getBoundingClientRect().bottom)
      anchored.destroy()
    })

    it('should not position the panel after destroy', async () => {
      const [field, panel] = mount('300px')
      const anchored = createAnchoredPosition(field, panel)

      anchored.destroy()
      await anchored.update()
      await nextFrames()

      expect(panel.style.top).toBe('')
      expect(panel.style.left).toBe('')
    })
  })

  describe('matchAnchorWidth', () => {
    let host

    const measure = async width => {
      host = document.createElement('div')
      host.innerHTML = `<div style="width: ${width}"></div><div style="position: absolute; width: 80px">Panel</div>`
      document.body.append(host)
      const [reference, floating] = host.children
      await computePosition(reference, floating, { middleware: [matchAnchorWidth()] })
      return [reference, floating]
    }

    afterEach(() => {
      host?.remove()
      host = null
    })

    it('should give the floating element the reference width as its min-width', async () => {
      const [reference, floating] = await measure('300.5px')

      expect(floating.style.minWidth).toBe(`${reference.getBoundingClientRect().width}px`)
    })

    it('should leave min-width unset for a reference without width', async () => {
      const [, floating] = await measure('0px')

      expect(floating.style.minWidth).toBe('')
    })
  })
})
