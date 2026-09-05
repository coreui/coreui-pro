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
import { defineJQueryPlugin } from './util/index.js'

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
const PROPERTY_SEGMENTS_FILLED = '--cui-progress-segments-filled'

/**
 * Class definition
 */

class Progress extends BaseComponent {
  protected declare _bar: HTMLElement | null
  protected declare _observer: MutationObserver | null

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    if (!this._element) {
      return
    }

    this._bar = SelectorEngine.children<HTMLElement>(this._element, SELECTOR_BAR)[0] ?? null

    if (!this._bar) {
      return
    }

    this._observer = new MutationObserver(() => this._update())
    this._observer.observe(this._bar, { attributeFilter: [ATTRIBUTE_VALUE_NOW, ATTRIBUTE_VALUE_MIN, ATTRIBUTE_VALUE_MAX] })
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
    this._observer?.disconnect()
    this._bar?.style.removeProperty(PROPERTY_SEGMENTS_FILLED)

    super.dispose()
  }

  // Private
  protected _attribute(name: string, fallback: number): number {
    const value = Number.parseFloat(this._bar!.getAttribute(name) ?? '')
    return Number.isNaN(value) ? fallback : value
  }

  protected _ratio(): number {
    const min = this._attribute(ATTRIBUTE_VALUE_MIN, 0)
    const max = this._attribute(ATTRIBUTE_VALUE_MAX, 100)
    const span = max - min
    return span > 0 ? Math.min(Math.max((this._attribute(ATTRIBUTE_VALUE_NOW, min) - min) / span, 0), 1) : 0
  }

  protected _update(): void {
    // No value on the bar means the page sets the fill itself, so leave its variable alone
    if (!this._bar!.hasAttribute(ATTRIBUTE_VALUE_NOW)) {
      return
    }

    const segments = Number.parseInt(getComputedStyle(this._element).getPropertyValue(PROPERTY_SEGMENTS), 10) || 0
    // Floor, so the bar never reads as complete before the value is
    this._bar!.style.setProperty(PROPERTY_SEGMENTS_FILLED, `${Math.floor(this._ratio() * segments)}`)
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Progress.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (data[config as string] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](this)
    })
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
