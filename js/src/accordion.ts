/**
 * --------------------------------------------------------------------------
 * CoreUI accordion.ts
 * Licensed under MIT (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'accordion'
const DATA_KEY = 'coreui.accordion'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const ATTRIBUTE_ANIMATING = 'data-coreui-accordion-animating'

const PROPERTY_DURATION = '--cui-accordion-content-duration'
const PROPERTY_EASING = '--cui-accordion-content-easing'

const SELECTOR_HEADER = '.accordion-header'
const SELECTOR_INTERACTIVE = 'a, button, input, select, textarea'
const SELECTOR_ITEM = 'details.accordion-item'

const DEFAULT_DURATION = 350
const DEFAULT_EASING = 'ease'

/**
 * Helpers
 */

// Chromium animates `block-size: 0 -> auto` on its own through `interpolate-size`,
// so this component only exists for the browsers that cannot. It is safe to drop
// once Firefox and WebKit ship `calc-size()`.
const supportsNativeAnimation = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('interpolate-size', 'allow-keywords')

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const toMilliseconds = (value: string): number => {
  const number = Number.parseFloat(value)

  if (Number.isNaN(number)) {
    return DEFAULT_DURATION
  }

  return value.trim().endsWith('ms') ? number : number * 1000
}

/**
 * Class definition
 */

class Accordion extends BaseComponent {
  protected declare _animation: Animation | null

  constructor(element?: string | Element | null, config?: any) {
    super(element, config)

    if (!this._element) {
      return
    }

    this._animation = null
  }

  // Getters
  static override get NAME(): string {
    return NAME
  }

  // Public
  toggle(): Promise<void> {
    return this._isShown() ? this.hide() : this.show()
  }

  async show(): Promise<void> {
    if (this._isShown()) {
      return
    }

    const startEvent = EventHandler.trigger(this._element, EVENT_SHOW)
    if (startEvent!.defaultPrevented) {
      return
    }

    // Not awaited: the siblings collapse while this item expands, the way the
    // native exclusive accordion swaps them in the same frame.
    this._hideSiblings()

    const from = this._collapsedSize()
    this._details.open = true

    await this._animate(from, this._element.getBoundingClientRect().height)

    EventHandler.trigger(this._element, EVENT_SHOWN)
  }

  async hide(): Promise<void> {
    if (!this._isShown()) {
      return
    }

    const startEvent = EventHandler.trigger(this._element, EVENT_HIDE)
    if (startEvent!.defaultPrevented) {
      return
    }

    const from = this._element.getBoundingClientRect().height

    await this._animate(from, this._collapsedSize(), () => {
      this._details.open = false
    })

    EventHandler.trigger(this._element, EVENT_HIDDEN)
  }

  override dispose(): void {
    this._animation?.cancel()
    this._element.removeAttribute(ATTRIBUTE_ANIMATING)

    super.dispose()
  }

  // Private
  get _details(): HTMLDetailsElement {
    return this._element as HTMLDetailsElement
  }

  _isShown(): boolean {
    return this._details.open
  }

  // The item's collapsed box is its summary plus whatever the item itself adds
  // around it. Derived rather than measured, so nothing has to toggle `open`
  // twice to find out.
  _collapsedSize(): number {
    const header = SelectorEngine.findOne(SELECTOR_HEADER, this._element)
    const styles = window.getComputedStyle(this._element)
    const around = [
      styles.borderBlockStartWidth,
      styles.borderBlockEndWidth,
      styles.paddingBlockStart,
      styles.paddingBlockEnd
    ].reduce((total, value) => total + (Number.parseFloat(value) || 0), 0)

    return (header ? header.getBoundingClientRect().height : 0) + around
  }

  _hideSiblings(): void {
    const { name } = this._details

    if (!name) {
      return
    }

    const siblings = SelectorEngine.find<HTMLDetailsElement>(`details[name="${CSS.escape(name)}"][open]`)
      .filter(element => element !== this._element)

    for (const sibling of siblings) {
      Accordion.getOrCreateInstance(sibling).hide()
    }
  }

  async _animate(from: number, to: number, onFinish?: () => void): Promise<void> {
    this._animation?.cancel()

    if (prefersReducedMotion()) {
      onFinish?.()
      return
    }

    const styles = window.getComputedStyle(this._element)
    const animation = this._element.animate(
      { height: [`${from}px`, `${to}px`] },
      {
        duration: toMilliseconds(styles.getPropertyValue(PROPERTY_DURATION) || `${DEFAULT_DURATION}ms`),
        easing: styles.getPropertyValue(PROPERTY_EASING).trim() || DEFAULT_EASING,
        fill: 'both'
      }
    )

    this._animation = animation
    this._element.setAttribute(ATTRIBUTE_ANIMATING, '')

    try {
      await animation.finished
    } catch {
      // Superseded by a newer animation, which now owns the cleanup below.
      return
    }

    onFinish?.()

    animation.cancel()
    this._animation = null
    this._element.removeAttribute(ATTRIBUTE_ANIMATING)
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Accordion.getOrCreateInstance(this)

      if (typeof config !== 'string') {
        return
      }

      if (data[config as string] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, `${SELECTOR_ITEM} > ${SELECTOR_HEADER}`, function (this: HTMLElement, event) {
  // Where CSS can animate the panel, the element is left to toggle itself.
  if (supportsNativeAnimation()) {
    return
  }

  const target = event.target as HTMLElement

  // A control inside the summary keeps its own behaviour.
  if (target !== this && target.closest(SELECTOR_INTERACTIVE)) {
    return
  }

  event.preventDefault()
  Accordion.getOrCreateInstance(this.parentElement).toggle()
})

/**
 * jQuery
 */

defineJQueryPlugin(Accordion)

export default Accordion
