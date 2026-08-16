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

const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_TOGGLE_DATA_API = `toggle${EVENT_KEY}${DATA_API_KEY}`

const ATTRIBUTE_ANIMATING = 'data-coreui-accordion-animating'
const ATTRIBUTE_NAME = 'data-coreui-accordion-name'

const PROPERTY_DURATION = '--cui-accordion-content-duration'
const PROPERTY_EASING = '--cui-accordion-content-easing'

const SELECTOR_ACCORDION = '.accordion'
const SELECTOR_HEADER = '.accordion-header'
const SELECTOR_INTERACTIVE = 'a, button, input, select, textarea'
const SELECTOR_ITEM = 'details.accordion-item'

const DEFAULT_DURATION = 350
const DEFAULT_EASING = 'ease'
const MILLISECONDS_MULTIPLIER = 1000

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

  return value.trim().endsWith('ms') ? number : number * MILLISECONDS_MULTIPLIER
}

/**
 * Class definition
 */

class Accordion extends BaseComponent {
  protected declare _animations: WeakMap<HTMLDetailsElement, Animation>

  constructor(element?: string | Element | null, config?: any) {
    super(element, config)

    if (!this._element) {
      return
    }

    this._animations = new WeakMap<HTMLDetailsElement, Animation>()
  }

  // Getters
  static override get NAME(): string {
    return NAME
  }

  // Public
  toggle(item: Element | number): Promise<void> {
    const details = this._resolve(item)

    if (!details) {
      return Promise.resolve()
    }

    return details.open ? this.hide(details) : this.show(details)
  }

  async show(item: Element | number): Promise<void> {
    const details = this._resolve(item)

    if (!details || details.open) {
      return
    }

    // Not awaited: the siblings collapse while this item expands, the way the
    // native exclusive accordion swaps them in the same frame.
    this._hideSiblings(details)

    const from = this._collapsedSize(details)
    details.open = true

    await this._animate(details, from, details.getBoundingClientRect().height)
  }

  async hide(item: Element | number): Promise<void> {
    const details = this._resolve(item)

    if (!details || !details.open) {
      return
    }

    const from = details.getBoundingClientRect().height

    await this._animate(details, from, this._collapsedSize(details), () => {
      details.open = false
    })
  }

  async showAll(): Promise<void> {
    const items = this._items()

    // The name has to go before `open`: the HTML Standard forbids leaving more
    // than one open item in a name group, and the browser enforces it by
    // closing the others. Parked on the element so hideAll can put the grouping
    // back without being told what it was.
    for (const item of items) {
      if (item.name) {
        item.setAttribute(ATTRIBUTE_NAME, item.name)
        item.removeAttribute('name')
      }
    }

    await Promise.all(items.map(item => this.show(item)))
  }

  async hideAll(): Promise<void> {
    const items = this._items()

    await Promise.all(items.map(item => this.hide(item)))

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

  override dispose(): void {
    for (const item of this._items()) {
      this._animations.get(item)?.cancel()
      item.removeAttribute(ATTRIBUTE_ANIMATING)
    }

    super.dispose()
  }

  // Private
  _items(): HTMLDetailsElement[] {
    return SelectorEngine.children<HTMLDetailsElement>(this._element, SELECTOR_ITEM)
  }

  _resolve(item: Element | number): HTMLDetailsElement | null {
    if (typeof item === 'number') {
      return this._items()[item] || null
    }

    return this._items().find(candidate => candidate === item) || null
  }

  // The item's collapsed box is its summary plus whatever the item itself adds
  // around it. Derived rather than measured, so nothing has to toggle `open`
  // twice to find out.
  _collapsedSize(details: HTMLDetailsElement): number {
    const header = SelectorEngine.findOne(SELECTOR_HEADER, details)
    const styles = window.getComputedStyle(details)
    const around = [
      styles.borderBlockStartWidth,
      styles.borderBlockEndWidth,
      styles.paddingBlockStart,
      styles.paddingBlockEnd
    ].reduce((total, value) => total + (Number.parseFloat(value) || 0), 0)

    return (header ? header.getBoundingClientRect().height : 0) + around
  }

  // Name groups are document-wide, so a sibling can sit in another accordion.
  _hideSiblings(details: HTMLDetailsElement): void {
    const { name } = details

    if (!name) {
      return
    }

    const siblings = SelectorEngine.find<HTMLDetailsElement>(`details[name="${CSS.escape(name)}"][open]`)
      .filter(element => element !== details)

    for (const sibling of siblings) {
      const container = sibling.closest(SELECTOR_ACCORDION)

      if (container) {
        Accordion.getOrCreateInstance(container).hide(sibling)
      }
    }
  }

  async _animate(details: HTMLDetailsElement, from: number, to: number, onFinish?: () => void): Promise<void> {
    this._animations.get(details)?.cancel()

    // Where the panel is animated by CSS, running this one too would drive the
    // same expansion from both ends.
    if (supportsNativeAnimation() || prefersReducedMotion()) {
      onFinish?.()
      return
    }

    const styles = window.getComputedStyle(details)
    const animation = details.animate(
      { height: [`${from}px`, `${to}px`] },
      {
        duration: toMilliseconds(styles.getPropertyValue(PROPERTY_DURATION) || `${DEFAULT_DURATION}ms`),
        easing: styles.getPropertyValue(PROPERTY_EASING).trim() || DEFAULT_EASING,
        fill: 'both'
      }
    )

    this._animations.set(details, animation)
    details.setAttribute(ATTRIBUTE_ANIMATING, '')

    try {
      await animation.finished
    } catch {
      // Superseded by a newer animation, which now owns the cleanup below.
      return
    }

    onFinish?.()

    animation.cancel()
    this._animations.delete(details)
    details.removeAttribute(ATTRIBUTE_ANIMATING)
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Accordion.getOrCreateInstance(this)

      if (typeof config !== 'string') {
        return
      }

      if (data[config as string] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](...args)
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

  const item = header.parentElement as HTMLDetailsElement
  const container = item.closest(SELECTOR_ACCORDION)

  // Outside an accordion there is nothing to hold the item's tokens either, so
  // it is left to open the way the browser does it, without the animation.
  if (!container) {
    return
  }

  event.preventDefault()
  Accordion.getOrCreateInstance(container).toggle(item)
})

/**
 * jQuery
 */

defineJQueryPlugin(Accordion)

export default Accordion
