/**
 * --------------------------------------------------------------------------
 * CoreUI accordion.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'
import { startSizeTransition, supportsInterpolateSize } from './util/size-transition.js'

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
const EVENT_TOGGLE_DATA_API = `toggle${EVENT_KEY}${DATA_API_KEY}`

const ATTRIBUTE_ANIMATING = 'data-coreui-accordion-animating'
const ATTRIBUTE_NAME = 'data-coreui-accordion-name'

const SELECTOR_ACCORDION = '.accordion'
const SELECTOR_HEADER = '.accordion-header'
const SELECTOR_INTERACTIVE = 'a, button, input, label, select, textarea'
const SELECTOR_ITEM = 'details.accordion-item'

/**
 * Class definition
 */

class Accordion extends BaseComponent {
  protected declare _moving: Map<HTMLDetailsElement, Promise<void>>
  protected declare _ownToggles: Set<HTMLDetailsElement>

  constructor(element?: string | Element | null, config?: Record<string, unknown> | null) {
    super(element, config)

    this._moving = new Map()
    this._ownToggles = new Set()
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

    if (!details || details.open || this._moving.has(details)) {
      return
    }

    const siblings = this._openSiblings(details)

    if (siblings.some(([accordion, sibling]) => accordion._moving.has(sibling))) {
      return
    }

    if (EventHandler.trigger(details, EVENT_SHOW).defaultPrevented) {
      return
    }

    // Not awaited: the siblings collapse while this item expands, the way the
    // native exclusive accordion swaps them in the same frame. A sibling that
    // stays open keeps this one shut, since the browser would close it anyway.
    for (const [accordion, sibling] of siblings) {
      accordion.hide(sibling)

      if (!accordion._moving.has(sibling)) {
        return
      }
    }

    const from = this._collapsedSize(details)
    this._setOpen(details, true)

    await this._animate(details, from, details.getBoundingClientRect().height, EVENT_SHOWN)
  }

  async hide(item: Element | number): Promise<void> {
    const details = this._resolve(item)

    if (!details || !details.open || this._moving.has(details)) {
      return
    }

    if (EventHandler.trigger(details, EVENT_HIDE).defaultPrevented) {
      return
    }

    const from = details.getBoundingClientRect().height

    await this._animate(details, from, this._collapsedSize(details), EVENT_HIDDEN, () => {
      this._setOpen(details, false)
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

    await Promise.all(this._moving.values())
    await Promise.all(items.map(item => this.show(item)))
  }

  async hideAll(): Promise<void> {
    const items = this._items()

    await Promise.all(this._moving.values())
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
      item.style.blockSize = ''
      item.removeAttribute(ATTRIBUTE_ANIMATING)
    }

    super.dispose()
  }

  // Private
  _setOpen(details: HTMLDetailsElement, open: boolean): void {
    if (details.open !== open) {
      this._ownToggles.add(details)
      details.open = open
    }
  }

  _reportToggle(details: HTMLDetailsElement): void {
    if (this._ownToggles.delete(details) || this._moving.has(details)) {
      return
    }

    EventHandler.trigger(details, details.open ? EVENT_SHOW : EVENT_HIDE)
    this._settle(details, details.open ? EVENT_SHOWN : EVENT_HIDDEN)
  }

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
  _openSiblings(details: HTMLDetailsElement): Array<[Accordion, HTMLDetailsElement]> {
    if (!details.name) {
      return []
    }

    return SelectorEngine.find<HTMLDetailsElement>(`details[name="${CSS.escape(details.name)}"][open]`)
      .filter(element => element !== details && element.closest(SELECTOR_ACCORDION))
      .map(element => [Accordion.getOrCreateInstance(element.closest(SELECTOR_ACCORDION)), element])
  }

  _animate(details: HTMLDetailsElement, from: number, to: number, eventName: string, onFinish?: () => void): Promise<void> {
    let moved: Promise<void>

    // Where the panel is animated by CSS, running this one too would drive the
    // same expansion from both ends.
    if (supportsInterpolateSize()) {
      onFinish?.()
      moved = this._settle(details, eventName)
    } else {
      details.setAttribute(ATTRIBUTE_ANIMATING, '')
      startSizeTransition(details, 'blockSize', from, to)

      moved = this._queueCallback(() => {
        onFinish?.()

        details.style.blockSize = ''
        details.removeAttribute(ATTRIBUTE_ANIMATING)
        this._moving.delete(details)
        EventHandler.trigger(details, eventName)
      }, details, true)
    }

    this._moving.set(details, moved)
    return moved
  }

  // No `transitionend` reaches a listener for the `::details-content` transition, so its length is read.
  _settle(details: HTMLDetailsElement, eventName: string): Promise<void> {
    const duration = Number.parseFloat(window.getComputedStyle(details, '::details-content').transitionDuration) * 1000
    const settled = new Promise<void>(resolve => {
      setTimeout(resolve, duration + 5)
    }).then(() => {
      if (this._element) {
        this._moving.delete(details)
        EventHandler.trigger(details, eventName)
      }
    })

    return settled
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, Accordion, config, args)
  }
}

/**
 * Data API implementation
 */

// The native `toggle` does not bubble and so cannot be delegated; listened to
// for every item, so a change from outside the component is reported too.
EventHandler.on(document, EVENT_TOGGLE_DATA_API, SELECTOR_ITEM, function (this: HTMLDetailsElement) {
  const container = this.closest(SELECTOR_ACCORDION)

  if (container) {
    Accordion.getOrCreateInstance(container)._reportToggle(this)
    return
  }

  EventHandler.trigger(this, this.open ? EVENT_SHOW : EVENT_HIDE)
  EventHandler.trigger(this, this.open ? EVENT_SHOWN : EVENT_HIDDEN)
})

// Not delegated: EventHandler delegates in the capture phase, which runs before
// a listener on the summary itself, so `defaultPrevented` would still be false
// here and preventing the click would not hold the item shut the way it does
// natively.
EventHandler.on(document, EVENT_CLICK_DATA_API, (event: Event) => {
  if (event.defaultPrevented) {
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
  if (item.parentElement !== container) {
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
