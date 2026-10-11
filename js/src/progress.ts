/**
 * --------------------------------------------------------------------------
 * CoreUI PRO progress.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'progress'
const DATA_KEY = 'coreui.progress'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_DOM_CONTENT_LOADED = `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_PROGRESS = '.progress-segmented'
const SELECTOR_BAR = '.progress-bar'

const ATTRIBUTE_VALUE_NOW = 'aria-valuenow'
const ATTRIBUTE_VALUE_MIN = 'aria-valuemin'
const ATTRIBUTE_VALUE_MAX = 'aria-valuemax'

const PROPERTY_SEGMENTS = '--cui-progress-segments'
const PROPERTY_SEGMENTS_FIT = '--cui-progress-segments-fit'
const PROPERTY_SEGMENT_RADIUS_FIT = '--cui-progress-segment-radius-fit'
const PROPERTY_SEGMENTS_FILLED = '--cui-progress-segments-filled'
const PROPERTY_SEGMENT_GAP = '--cui-progress-segment-gap'
const PROPERTY_SEGMENT_MIN_WIDTH = '--cui-progress-segment-min-width'
const PROPERTY_SEGMENT_BORDER_RADIUS = '--cui-progress-segment-border-radius'

/**
 * Class definition
 */

class Progress extends BaseComponent {
  protected declare _resizeObserver: ResizeObserver | null

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    if (!this._element) {
      return
    }

    this._resizeObserver = new ResizeObserver(() => this._update())
    this._resizeObserver.observe(this._element)
    this._update()
  }

  // Getters
  static override get NAME(): string {
    return NAME
  }

  // Public
  update(): void {
    this._update()
  }

  override dispose(): void {
    this._resizeObserver?.disconnect()
    this._element.style.removeProperty(PROPERTY_SEGMENTS_FIT)
    this._element.style.removeProperty(PROPERTY_SEGMENT_RADIUS_FIT)
    this._getBar()?.style.removeProperty(PROPERTY_SEGMENTS_FILLED)

    super.dispose()
  }

  // Private
  protected _getBar(): HTMLElement | undefined {
    return SelectorEngine.children<HTMLElement>(this._element, SELECTOR_BAR)[0]
  }

  protected _attribute(bar: HTMLElement, name: string, fallback: number): number {
    const value = Number.parseFloat(bar.getAttribute(name) ?? '')
    return Number.isNaN(value) ? fallback : value
  }

  protected _ratio(bar: HTMLElement): number {
    const min = this._attribute(bar, ATTRIBUTE_VALUE_MIN, 0)
    const max = this._attribute(bar, ATTRIBUTE_VALUE_MAX, 100)
    const span = max - min
    return span > 0 ? Math.min(Math.max((this._attribute(bar, ATTRIBUTE_VALUE_NOW, min) - min) / span, 0), 1) : 0
  }

  protected _length(value: string): number {
    const number = Number.parseFloat(value)

    if (Number.isNaN(number)) {
      return 0
    }

    if (value.endsWith('rem')) {
      return number * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    }

    if (value.endsWith('em')) {
      return number * Number.parseFloat(getComputedStyle(this._element).fontSize)
    }

    return number
  }

  // The token is the ceiling; the track is cut into fewer segments when it is too narrow for them
  protected _segmentsThatFit(): number {
    const style = getComputedStyle(this._element)
    const segments = Number.parseInt(style.getPropertyValue(PROPERTY_SEGMENTS), 10) || Number.POSITIVE_INFINITY
    const gap = this._length(style.getPropertyValue(PROPERTY_SEGMENT_GAP))
    const minWidth = this._length(style.getPropertyValue(PROPERTY_SEGMENT_MIN_WIDTH))
    const { width } = this._element.getBoundingClientRect()

    if (minWidth <= 0 || width <= 0) {
      return segments
    }

    return Math.max(1, Math.min(segments, Math.floor((width + gap) / (minWidth + gap))))
  }

  // Half the segment, half the track height, or the token, whichever is smallest — as `border-radius` would
  protected _radiusThatFits(segments: number): number {
    const style = getComputedStyle(this._element)
    const gap = this._length(style.getPropertyValue(PROPERTY_SEGMENT_GAP))
    const radius = this._length(style.getPropertyValue(PROPERTY_SEGMENT_BORDER_RADIUS))
    const { width, height } = this._element.getBoundingClientRect()
    const segmentWidth = ((width + gap) / segments) - gap

    return Math.round(Math.max(0, Math.min(radius, segmentWidth / 2, height / 2)) * 1000) / 1000
  }

  protected _update(): void {
    const bar = this._getBar()

    if (!bar) {
      return
    }

    const segments = this._segmentsThatFit()

    // Nothing to count against: no token and no minimum width, so the stylesheet's fallback tiles apply
    if (!Number.isFinite(segments)) {
      this._element.style.removeProperty(PROPERTY_SEGMENTS_FIT)
      this._element.style.removeProperty(PROPERTY_SEGMENT_RADIUS_FIT)
      bar.style.removeProperty(PROPERTY_SEGMENTS_FILLED)
      return
    }

    this._element.style.setProperty(PROPERTY_SEGMENTS_FIT, `${segments}`)
    this._element.style.setProperty(PROPERTY_SEGMENT_RADIUS_FIT, `${this._radiusThatFits(segments)}px`)

    // No value on the bar means the page sets the fill itself, so leave its variable alone
    if (!bar.hasAttribute(ATTRIBUTE_VALUE_NOW)) {
      return
    }

    // Floor, so the bar never reads as complete before the value is
    bar.style.setProperty(PROPERTY_SEGMENTS_FILLED, `${Math.floor(this._ratio(bar) * segments)}`)
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, Progress, config, element => [element])
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_DOM_CONTENT_LOADED, () => {
  for (const element of SelectorEngine.find(SELECTOR_PROGRESS)) {
    Progress.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Progress)

export default Progress
