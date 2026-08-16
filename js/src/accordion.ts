/**
 * --------------------------------------------------------------------------
 * CoreUI accordion.ts
 * Licensed under MIT (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin, getElement } from './util/index.js'

/**
 * Constants
 */

const NAME = 'accordion'
const DATA_KEY = 'coreui.accordion'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_TOGGLE_DATA_API = `toggle${EVENT_KEY}${DATA_API_KEY}`

const ATTRIBUTE_ANIMATING = 'data-coreui-accordion-animating'
const ATTRIBUTE_NAME = 'data-coreui-accordion-name'

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

    // Not awaited: the siblings collapse while this item expands, the way the
    // native exclusive accordion swaps them in the same frame.
    this._hideSiblings()

    const from = this._collapsedSize()
    this._details.open = true

    await this._animate(from, this._element.getBoundingClientRect().height)
  }

  async hide(): Promise<void> {
    if (!this._isShown()) {
      return
    }

    const from = this._element.getBoundingClientRect().height

    await this._animate(from, this._collapsedSize(), () => {
      this._details.open = false
    })
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

    // Where the panel is animated by CSS, running this one too would drive the
    // same expansion from both ends.
    if (supportsNativeAnimation() || prefersReducedMotion()) {
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
  static async showAll(container: string | Element | null): Promise<void> {
    const items = Accordion._items(container)

    // `name` has to go before `open`, or the browser closes each item as the
    // next one in the group opens. It is parked on the element so hideAll can
    // put the grouping back without being told what it was.
    for (const item of items) {
      if (item.name) {
        item.setAttribute(ATTRIBUTE_NAME, item.name)
        item.removeAttribute('name')
      }
    }

    await Promise.all(items.map(item => Accordion.getOrCreateInstance(item).show()))
  }

  static async hideAll(container: string | Element | null): Promise<void> {
    const items = Accordion._items(container)

    await Promise.all(items.map(item => Accordion.getOrCreateInstance(item).hide()))

    // Restoring the group while more than one item is still open would leave
    // the browser to pick which one survives.
    for (const item of items) {
      const name = item.getAttribute(ATTRIBUTE_NAME)

      if (name !== null) {
        item.setAttribute('name', name)
        item.removeAttribute(ATTRIBUTE_NAME)
      }
    }
  }

  static _items(container: string | Element | null): HTMLDetailsElement[] {
    const element = getElement(container)

    return element ? SelectorEngine.children<HTMLDetailsElement>(element, SELECTOR_ITEM) : []
  }

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

// The CoreUI events mirror the native `toggle`, which does not bubble and so
// cannot be delegated. Registered for every item, whichever path opened it, so
// the event surface does not depend on the browser.
EventHandler.on(document, EVENT_TOGGLE_DATA_API, SELECTOR_ITEM, function (this: HTMLDetailsElement) {
  EventHandler.trigger(this, this.open ? EVENT_SHOWN : EVENT_HIDDEN)
})

// Not delegated: EventHandler delegates in the capture phase, which runs before
// a listener on the summary itself, so `defaultPrevented` would still be false
// here and preventing the click would not hold the item shut the way it does
// natively.
EventHandler.on(document, EVENT_CLICK_DATA_API, (event: Event) => {
  // Where CSS can animate the panel, the element is left to toggle itself.
  if (supportsNativeAnimation() || event.defaultPrevented) {
    return
  }

  const target = event.target as HTMLElement
  const header = target.closest<HTMLElement>(`${SELECTOR_ITEM} > ${SELECTOR_HEADER}`)

  if (!header) {
    return
  }

  // A control inside the summary keeps its own behaviour.
  if (target !== header && target.closest(SELECTOR_INTERACTIVE)) {
    return
  }

  event.preventDefault()
  Accordion.getOrCreateInstance(header.parentElement).toggle()
})

/**
 * jQuery
 */

defineJQueryPlugin(Accordion)

export default Accordion
