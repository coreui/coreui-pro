/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/floating-ui.ts
 * License (https://coreui.io/pro/license/)
 *
 * This is a modified version of Bootstrap's util/floating-ui.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import {
  autoUpdate, computePosition, flip, offset, shift, type Middleware
} from '@floating-ui/dom'

/**
 * Types
 */

type ResponsivePlacements = Record<string, string>

interface BreakpointListener {
  mql: MediaQueryList
  handler: (event: MediaQueryListEvent) => void
}

const PROPERTY_ANCHOR_WIDTH = '--cui-anchor-width'

/**
 * Breakpoints for responsive placement (matches SCSS $breakpoints)
 */
export const BREAKPOINTS: Record<string, number> = {
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

/**
 * Parse a placement string that may contain responsive prefixes
 * Example: "bottom-start md:top-end lg:right" returns { xs: 'bottom-start', md: 'top-end', lg: 'right' }
 *
 * @param placementString - The placement string to parse
 * @param defaultPlacement - The default placement to use for xs/base
 * @returns Object with breakpoint keys and placement values, or null if not responsive
 */
export const parseResponsivePlacement = (placementString: string | null | undefined, defaultPlacement = 'bottom'): ResponsivePlacements | null => {
  // Check if placement contains responsive prefixes (e.g., "bottom-start md:top-end")
  if (!placementString || !placementString.includes(':')) {
    return null
  }

  // Parse the placement string into breakpoint-keyed object
  const parts = placementString.split(/\s+/)
  const placements: ResponsivePlacements = { xs: defaultPlacement } // Default fallback

  for (const part of parts) {
    if (part.includes(':')) {
      // Responsive placement like "md:top-end"
      const [breakpoint, placement] = part.split(':')
      if (BREAKPOINTS[breakpoint] !== undefined) {
        placements[breakpoint] = placement
      }
    } else {
      // Base placement (no prefix = xs/default)
      placements.xs = part
    }
  }

  return placements
}

/**
 * Get the active placement for the current viewport width
 *
 * @param responsivePlacements - Object with breakpoint keys and placement values
 * @param defaultPlacement - Fallback placement
 * @param viewportWidth - Viewport width to resolve against, the current `window.innerWidth` when omitted
 * @returns The active placement for current viewport
 */
export const getResponsivePlacement = (responsivePlacements: ResponsivePlacements | null, defaultPlacement = 'bottom', viewportWidth: number = window.innerWidth): string => {
  if (!responsivePlacements) {
    return defaultPlacement
  }

  // Find the largest breakpoint that matches
  let activePlacement = responsivePlacements.xs || defaultPlacement

  // Check breakpoints in order (sm, md, lg, xl, 2xl)
  for (const breakpoint of Object.keys(BREAKPOINTS)) {
    const minWidth = BREAKPOINTS[breakpoint]
    if (viewportWidth >= minWidth && responsivePlacements[breakpoint]) {
      activePlacement = responsivePlacements[breakpoint]
    }
  }

  return activePlacement
}

/**
 * Create media query listeners for responsive placement changes
 *
 * @param callback - Callback to run when breakpoint changes
 * @returns Array of { mql, handler } objects for cleanup
 */
export const createBreakpointListeners = (callback: (event: MediaQueryListEvent) => void): BreakpointListener[] => {
  const listeners: BreakpointListener[] = []

  for (const breakpoint of Object.keys(BREAKPOINTS)) {
    const minWidth = BREAKPOINTS[breakpoint]
    const mql = window.matchMedia(`(min-width: ${minWidth}px)`)

    mql.addEventListener('change', callback)
    listeners.push({ mql, handler: callback })
  }

  return listeners
}

/**
 * Clean up media query listeners
 *
 * @param listeners - Array of { mql, handler } objects
 */
export const disposeBreakpointListeners = (listeners: BreakpointListener[]): void => {
  for (const { mql, handler } of listeners) {
    mql.removeEventListener('change', handler)
  }
}

/**
 * Public `offset` option shared by the positioned components (Tooltip, Menu, …):
 * an `[skidding, distance]` array, a comma-separated string, or a callback
 * returning that array.
 */
type FloatingOffsetOption = number[] | string | ((data: Record<string, any>, element: HTMLElement) => number[])

/**
 * Public `floatingConfig` option: a Floating UI config object, a function that
 * refines the default config, or null.
 */
type FloatingConfigOption = Record<string, any> | ((defaultConfig: Record<string, any>) => Record<string, any>) | null

/**
 * Floating UI offset value: a number, an axis object, or our `[skidding, distance]` array
 */
type FloatingOffsetInput = number | number[] | { mainAxis?: number, crossAxis?: number, alignmentAxis?: number | null }
type FloatingOffsetValue = Exclude<FloatingOffsetInput, number[]>

/**
 * Normalize an offset value into Floating UI's offset shape.
 * A `[skidding, distance]` array becomes `{ mainAxis: distance, crossAxis: skidding }`;
 * numbers and axis objects pass through unchanged.
 */
export const toFloatingOffset = (value: FloatingOffsetInput): FloatingOffsetValue => {
  return Array.isArray(value) ? { mainAxis: value[1] || 0, crossAxis: value[0] || 0 } : value
}

/**
 * Floating UI middleware that writes the width of the reference as the
 * `--cui-anchor-width` custom property of the floating element, so its
 * stylesheet can size the panel by its field (the combobox panel takes it as
 * its `min-width`). A reference without width (not laid out yet) removes the
 * property. A changed width resets the measured rects; put it before `flip` and
 * `shift`, so they place the panel at its final size. Under `autoUpdate` the
 * value follows the reference while it resizes.
 *
 * @returns The middleware that writes `--cui-anchor-width` on the floating element.
 */
export const matchAnchorWidth = (): Middleware => {
  let written: string | undefined

  return {
    name: 'matchAnchorWidth',
    fn({ elements, rects }) {
      const width = rects.reference.width > 0 ? `${rects.reference.width}px` : ''

      if (width === written) {
        return {}
      }

      written = width

      if (width) {
        elements.floating.style.setProperty(PROPERTY_ANCHOR_WIDTH, width)
      } else {
        elements.floating.style.removeProperty(PROPERTY_ANCHOR_WIDTH)
      }

      return { reset: { rects: true } }
    }
  }
}

/**
 * Positions a combobox-family panel under its field: bottom-start placement
 * (mirrored in RTL), a 2px main-axis offset, flip and shift within the clipping
 * ancestors, and the field's width as `--cui-anchor-width` (`matchAnchorWidth`),
 * which `autoUpdate` keeps current while the field resizes.
 *
 * @param anchor - The field the panel belongs to.
 * @param content - The panel.
 * @returns `ready`, which settles once the panel has its first position and
 * width, `update()` to reposition now and `destroy()` to stop following the
 * field. `top` and `left` that resolve after `destroy()` are not applied.
 */
export const createAnchoredPosition = (anchor: Element, content: HTMLElement): { destroy: () => void, ready: Promise<void>, update: () => Promise<void> } => {
  let disposed = false

  const update = async (): Promise<void> => {
    if (disposed || !content || !content.isConnected) {
      return
    }

    const { x, y } = await computePosition(anchor, content, {
      middleware: [
        matchAnchorWidth(),
        offset({ mainAxis: 2 }),
        flip(),
        shift({ boundary: 'clippingAncestors' })
      ],
      placement: 'bottom-start'
    })

    if (disposed || !content.isConnected) {
      return
    }

    Object.assign(content.style, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`
    })
  }

  const ready = update()
  const cleanup = autoUpdate(anchor, content, update)

  return {
    destroy(): void {
      disposed = true
      cleanup()
    },
    ready,
    update
  }
}

export type {
  BreakpointListener, ResponsivePlacements, FloatingOffsetValue, FloatingOffsetOption, FloatingConfigOption
}
