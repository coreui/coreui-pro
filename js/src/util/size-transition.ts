/**
 * --------------------------------------------------------------------------
 * CoreUI util/size-transition.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import { reflow } from './index.js'

// Chromium interpolates a size to the `auto` of the open state on its own
// through `interpolate-size`; the choreography below only exists for the
// browsers that cannot. It is safe to drop once Firefox and WebKit ship
// `calc-size()`.
const supportsInterpolateSize = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('interpolate-size', 'allow-keywords')

type SizeProperty = 'blockSize' | 'height' | 'width'

// Sets the two sizes and lets the stylesheet time the move between them, so the
// duration, the easing and the reduced-motion decision are read from one place
// by every caller and this file needs no token names. The caller owns waiting
// for the transition and clearing the inline size afterwards.
const startSizeTransition = (element: HTMLElement, property: SizeProperty, from: number, to: number): void => {
  // The starting size has to land unanimated, or the transition would run
  // towards it and the real move would cancel it.
  element.style.transition = 'none'
  element.style[property] = `${from}px`

  reflow(element)

  element.style.transition = ''
  element.style[property] = `${to}px`
}

export { startSizeTransition, supportsInterpolateSize }
