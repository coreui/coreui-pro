/**
 * --------------------------------------------------------------------------
 * CoreUI PRO toaster.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import Toast, { type ToastConfig } from './toast.js'
import type { TemplateContentEntry } from './util/template-factory.js'
import { DefaultAllowlist, sanitizeHtml, type SanitizerAllowList } from './util/sanitizer.js'
import {
  defineJQueryPlugin, execute, getElement, getTransitionDurationFromElement, getUID, isElement
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'toaster'
const DATA_KEY = 'coreui.toaster'
const EVENT_KEY = `.${DATA_KEY}`

const EVENT_ADD = `add${EVENT_KEY}`
const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`
const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`
const EVENT_FOCUSIN = `focusin${EVENT_KEY}`
const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`
const EVENT_REMOVE = `remove${EVENT_KEY}`
const EVENT_HIDE_TOAST = 'hide.coreui.toast'
const EVENT_HIDDEN_TOAST = 'hidden.coreui.toast'

const CLASS_NAME_CONTAINER = 'toast-container'
const CLASS_NAME_STACK = 'toast-container-stack'
const CLASS_NAME_ANNOUNCER = 'toast-announcer'
const CLASS_NAME_INSTANT = 'toast-instant'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_TRANSLUCENT = 'toast-translucent'

const SELECTOR_TITLE = '.toast-title'
const SELECTOR_DESCRIPTION = '.toast-description'
const SELECTOR_ACTION = '.toast-action'
const SELECTOR_HEADER = '.toast-header'
const SELECTOR_CLOSE = '.btn-close'

const ATTRIBUTE_ID = 'data-coreui-toast-id'
const ATTRIBUTE_LIMITED = 'data-coreui-limited'
const ATTRIBUTE_STACK_INDEX = 'data-coreui-stack-index'
const ATTRIBUTE_STACK_HIDDEN = 'data-coreui-stack-hidden'
const ATTRIBUTE_UPDATE_KEY = 'data-coreui-update-key'

const PROPERTY_STACK_INDEX = '--cui-toast-stack-index'
const STACK_VISIBLE = 3

const PROPERTY_STACK_BEFORE = '--cui-toast-stack-before'
const PROPERTY_STACK_COUNT = '--cui-toast-stack-count'
const PROPERTY_STACK_FRONT_HEIGHT = '--cui-toast-stack-front-height'
const PROPERTY_STACK_HEIGHTS = '--cui-toast-stack-heights'
const PROPERTY_TOAST_HEIGHT = '--cui-toast-height'
const PROPERTY_ENTER_TRANSLATE = '--cui-toast-enter-translate'
const PROPERTY_LEAVE_TRANSLATE = '--cui-toast-leave-translate'

const EDGES: Record<string, string> = {
  bottom: '0 calc(100% + var(--cui-toast-container-inset))',
  end: 'calc(100% + var(--cui-toast-container-inset)) 0',
  start: 'calc(-100% - var(--cui-toast-container-inset)) 0',
  top: '0 calc(-100% - var(--cui-toast-container-inset))'
}

const LEAVE_EDGES = new Set(['auto', 'end', 'start'])

const PLACEMENTS = new Set([
  'top-start',
  'top-center',
  'top-end',
  'middle-start',
  'middle-center',
  'middle-end',
  'bottom-start',
  'bottom-center',
  'bottom-end'
])

const TEMPLATE = [
  '<div class="toast">',
  '  <div class="toast-header">',
  '    <strong class="toast-title"></strong>',
  '    <button type="button" class="btn-close" data-coreui-dismiss="toast" aria-label="Close"></button>',
  '  </div>',
  '  <div class="toast-body">',
  '    <div class="toast-description"></div>',
  '    <button type="button" class="btn btn-sm toast-action"></button>',
  '    <button type="button" class="btn-close" data-coreui-dismiss="toast" aria-label="Close"></button>',
  '  </div>',
  '</div>'
].join('')

const Default: ToasterConfig = {
  allowList: DefaultAllowlist,
  container: 'body',
  enter: 'auto',
  html: false,
  label: 'Notifications',
  leave: 'auto',
  limit: 3,
  pauseOnHover: true,
  placement: 'top-end',
  restartOnAdd: false,
  sanitize: true,
  sanitizeFn: null,
  stack: false,
  timeout: 5000
}

const DefaultType = {
  allowList: 'object',
  container: '(string|element)',
  enter: 'string',
  html: 'boolean',
  label: 'string',
  leave: 'string',
  limit: 'number',
  pauseOnHover: 'boolean',
  placement: 'string',
  restartOnAdd: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  stack: 'boolean',
  timeout: 'number'
}

const ToastDefault: ToastOptions = {
  dismissible: true,
  priority: 'low'
}

const ToastDefaultType = {
  action: '(object|null|undefined)',
  class: '(string|undefined)',
  data: '(object|undefined)',
  description: '(string|element|function|undefined)',
  dismissible: 'boolean',
  id: '(string|undefined)',
  instant: '(boolean|undefined)',
  onClose: '(function|undefined)',
  onRemove: '(function|undefined)',
  priority: 'string',
  theme: '(string|undefined)',
  timeout: '(number|undefined)',
  title: '(string|element|function|undefined)',
  translucent: '(boolean|undefined)'
}

/**
 * Types
 */

type Edge = 'auto' | 'bottom' | 'end' | 'start' | 'top'
type LeaveEdge = 'auto' | 'end' | 'start'

type ToasterConfig = {
  allowList: SanitizerAllowList
  container: string | Element
  enter: Edge
  html: boolean
  label: string
  leave: LeaveEdge
  limit: number
  pauseOnHover: boolean
  placement: string
  restartOnAdd: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  stack: boolean
  timeout: number
}

type ToastAction = {
  label: string
  onClick?: (event: Event, toast: ToastObject) => void
}

type ToastOptions = {
  action?: ToastAction | null
  class?: string
  data?: Record<string, unknown>
  description?: TemplateContentEntry
  dismissible?: boolean
  id?: string
  instant?: boolean
  onClose?: (toast: ToastObject) => void
  onRemove?: (toast: ToastObject) => void
  priority?: 'high' | 'low'
  theme?: string
  timeout?: number
  title?: TemplateContentEntry
  translucent?: boolean
}

type ToastObject = ToastOptions & {
  element: HTMLElement
  id: string
  limited: boolean
  updateKey: number
}

type ToastUpdate = ToastOptions | ((previous: ToastObject) => ToastOptions)

type PromiseState<Value> = ToastOptions | TemplateContentEntry | ((value: Value) => ToastOptions | TemplateContentEntry)

type PromiseOptions<Value> = {
  error: PromiseState<unknown>
  loading: ToastOptions | TemplateContentEntry
  success: PromiseState<Value>
}

type Entry = {
  instance: Toast
  toast: ToastObject
}

/**
 * Class definition
 */

class Toaster extends BaseComponent {
  protected declare _config: ToasterConfig
  protected declare _entries: Map<string, Entry>
  protected declare _ownsContainer: boolean
  protected declare _resizeObserver: ResizeObserver | null
  protected declare _announcers: Record<'high' | 'low', HTMLElement>

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    const ownsContainer = !getElement(element)
    super(ownsContainer ? document.createElement('div') : element, config)

    this._entries = new Map()
    this._ownsContainer = ownsContainer

    if (!PLACEMENTS.has(this._config.placement)) {
      throw new TypeError(`${NAME.toUpperCase()}: Option "placement" provided value "${this._config.placement}" but expected one of ${[...PLACEMENTS].join(', ')}.`)
    }

    if (this._config.enter !== 'auto' && !(this._config.enter in EDGES)) {
      throw new TypeError(`${NAME.toUpperCase()}: Option "enter" provided value "${this._config.enter}" but expected one of auto, ${Object.keys(EDGES).join(', ')}.`)
    }

    if (!LEAVE_EDGES.has(this._config.leave)) {
      throw new TypeError(`${NAME.toUpperCase()}: Option "leave" provided value "${this._config.leave}" but expected one of ${[...LEAVE_EDGES].join(', ')}.`)
    }

    if (ownsContainer) {
      this._element.className = `${CLASS_NAME_CONTAINER} ${CLASS_NAME_CONTAINER}-${this._config.placement}`
      getElement(this._config.container)!.append(this._element)
    }

    this._element.setAttribute('role', 'region')
    this._element.setAttribute('aria-label', this._config.label)

    if (this._config.enter !== 'auto') {
      this._element.style.setProperty(PROPERTY_ENTER_TRANSLATE, EDGES[this._config.enter])
    }

    if (this._config.leave !== 'auto') {
      this._element.style.setProperty(PROPERTY_LEAVE_TRANSLATE, EDGES[this._config.leave])
    }

    this._announcers = {
      high: this._createAnnouncer('alert', 'assertive'),
      low: this._createAnnouncer('status', 'polite')
    }

    if (this._config.pauseOnHover) {
      EventHandler.on(this._element, EVENT_MOUSEOVER, () => this.pause())
      EventHandler.on(this._element, EVENT_FOCUSIN, () => this.pause())
      EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onLeave(event))
      EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onLeave(event))
    }

    this._resizeObserver = null
    if (this._config.stack) {
      this._element.classList.add(CLASS_NAME_STACK)
      this._resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => this._layoutStack()) : null
    }
  }

  // Getters
  static override get Default(): typeof Default {
    return Default
  }

  static override get DefaultType(): typeof DefaultType {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  add(options: ToastOptions = {}): string {
    this._typeCheckConfig({ ...ToastDefault, ...options }, ToastDefaultType)

    const existing = options.id ? this._entries.get(options.id) : null
    if (existing) {
      this.update(existing.toast.id, options)
      return existing.toast.id
    }

    const toast: ToastObject = {
      ...ToastDefault,
      ...options,
      element: document.createElement('div'),
      id: options.id ?? getUID(`${NAME}-`),
      limited: false,
      updateKey: 0
    }

    toast.element = this._render(toast)
    toast.element.setAttribute(ATTRIBUTE_ID, toast.id)

    const timeout = toast.timeout ?? this._config.timeout
    const instance = new Toast(toast.element, { autohide: timeout > 0, delay: timeout })
    const entry: Entry = { instance, toast }
    this._entries.set(toast.id, entry)

    EventHandler.one(toast.element, EVENT_HIDE_TOAST, () => {
      this._collapse(toast.element)
      execute(entry.toast.onClose, [undefined, entry.toast])
    })
    EventHandler.one(toast.element, EVENT_HIDDEN_TOAST, () => this._remove(entry))
    EventHandler.on(toast.element, 'click', SELECTOR_ACTION, event => {
      execute(entry.toast.action?.onClick, [undefined, event, entry.toast])
    })

    const layout = this._layout()
    if (this._config.placement.startsWith('top')) {
      this._element.prepend(toast.element)
    } else {
      this._element.append(toast.element)
    }

    instance.show()
    this._settle(layout)
    this._applyLimit()
    this._announce(toast)

    if (this._config.restartOnAdd) {
      for (const other of this._entries.values()) {
        if (other !== entry && !other.toast.limited) {
          other.instance._clearTimeout()
          other.instance._maybeScheduleHide()
        }
      }
    }

    this._resizeObserver?.observe(toast.element)
    this._layoutStack()
    EventHandler.trigger(this._element, EVENT_ADD, { id: toast.id })

    return toast.id
  }

  update(id: string, options: ToastUpdate): void {
    const entry = this._entries.get(id)

    if (!entry) {
      return
    }

    const previous = entry.toast
    const next: ToastObject = {
      ...previous,
      ...execute(options, [undefined, previous]),
      element: previous.element,
      id: previous.id,
      limited: previous.limited,
      updateKey: previous.updateKey + 1
    }

    this._typeCheckConfig(next, ToastDefaultType)

    const rendered = this._render(next)
    const shown = previous.element.classList.contains(CLASS_NAME_SHOW)
    previous.element.className = rendered.className
    previous.element.classList.toggle(CLASS_NAME_SHOW, shown)
    previous.element.replaceChildren(...rendered.children)

    previous.element.setAttribute(ATTRIBUTE_UPDATE_KEY, rendered.getAttribute(ATTRIBUTE_UPDATE_KEY)!)

    if (next.timeout !== previous.timeout) {
      const timeout = next.timeout ?? this._config.timeout
      const config = (entry.instance as unknown as { _config: ToastConfig })._config
      config.autohide = timeout > 0
      config.delay = timeout
      entry.instance._clearTimeout()
      entry.instance._maybeScheduleHide()
    }

    entry.toast = next
    this._layoutStack()
    this._announce(next)
  }

  close(id?: string): void {
    const entries = id ? [this._entries.get(id)].filter(Boolean) as Entry[] : [...this._entries.values()]

    for (const entry of entries) {
      entry.instance.hide()
    }
  }

  promise<Value>(promise: Promise<Value>, options: PromiseOptions<Value>): Promise<Value> {
    const id = this.add({ ...this._promiseState(options.loading), timeout: 0 })

    promise.then(
      value => this.update(id, { theme: 'success', timeout: this._config.timeout, ...this._promiseState(options.success, value) }),
      error => this.update(id, { theme: 'danger', timeout: this._config.timeout, ...this._promiseState(options.error, error) })
    )

    return promise
  }

  pause(): void {
    for (const entry of this._entries.values()) {
      entry.instance._clearTimeout()
    }
  }

  resume(): void {
    if (this._config.stack) {
      this._layoutStack()
      return
    }

    for (const entry of this._entries.values()) {
      if (!entry.toast.limited && entry.instance.isShown()) {
        entry.instance._maybeScheduleHide()
      }
    }
  }

  getToasts(): ToastObject[] {
    return [...this._entries.values()].map(entry => entry.toast)
  }

  override dispose(): void {
    for (const entry of this._entries.values()) {
      entry.instance.dispose()
      entry.toast.element.remove()
    }

    this._entries.clear()
    this._resizeObserver?.disconnect()
    this._announcers.high.remove()
    this._announcers.low.remove()

    if (this._ownsContainer) {
      this._element.remove()
    }

    super.dispose()
  }

  // Private
  _render(toast: ToastObject): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = TEMPLATE
    const element = wrapper.firstElementChild as HTMLElement

    this._setContent(element, SELECTOR_TITLE, toast.title)
    this._setContent(element, SELECTOR_DESCRIPTION, toast.description)
    this._setContent(element, SELECTOR_ACTION, toast.action?.label)
    const header = element.querySelector(SELECTOR_HEADER)!
    const body = element.querySelector('.toast-body')!

    if (toast.title) {
      body.querySelector(SELECTOR_CLOSE)!.remove()
    } else {
      header.remove()
    }

    if (!toast.dismissible) {
      for (const close of element.querySelectorAll(SELECTOR_CLOSE)) {
        close.remove()
      }
    }

    if (toast.theme) {
      element.classList.add(`theme-${toast.theme}`)
    }

    if (toast.instant) {
      element.classList.add(CLASS_NAME_INSTANT)
    }

    if (toast.translucent) {
      element.classList.add(CLASS_NAME_TRANSLUCENT)
    }

    if (toast.class) {
      element.classList.add(...toast.class.split(' '))
    }

    element.setAttribute(ATTRIBUTE_UPDATE_KEY, String(toast.updateKey))

    return element
  }

  _setContent(element: HTMLElement, selector: string, content: TemplateContentEntry | undefined): void {
    const target = element.querySelector(selector)!
    const resolved = execute(content, [undefined, this]) as string | Element | null | undefined

    if (!resolved) {
      target.remove()
      return
    }

    if (isElement(resolved)) {
      target.replaceChildren(resolved)
      return
    }

    if (this._config.html) {
      target.innerHTML = this._config.sanitize ? sanitizeHtml(resolved, this._config.allowList, this._config.sanitizeFn) : resolved
      return
    }

    target.textContent = resolved
  }

  _remove(entry: Entry): void {
    if (!this._entries?.has(entry.toast.id)) {
      return
    }

    this._entries.delete(entry.toast.id)
    entry.instance.dispose()
    this._resizeObserver?.unobserve(entry.toast.element)
    const layout = this._layout()
    entry.toast.element.remove()
    this._settle(layout)
    this._layoutStack()
    execute(entry.toast.onRemove, [undefined, entry.toast])
    this._applyLimit()
    EventHandler.trigger(this._element, EVENT_REMOVE, { id: entry.toast.id })
  }

  _applyLimit(): void {
    const entries = [...this._entries.values()]
    const overflow = this._config.limit > 0 ? Math.max(0, entries.length - this._config.limit) : 0
    const layout = this._layout()
    let unlimited = false

    for (const [index, entry] of entries.entries()) {
      const limited = index < overflow

      if (limited === entry.toast.limited) {
        continue
      }

      entry.toast.limited = limited
      entry.toast.element.inert = limited

      if (limited) {
        entry.instance._clearTimeout()
        this._collapse(entry.toast.element)
        entry.toast.element.toggleAttribute(ATTRIBUTE_LIMITED, true)
        setTimeout(() => {
          if (entry.toast.limited) {
            const layout = this._layout()
            entry.toast.element.style.display = 'none'
            this._settle(layout)
          }
        }, getTransitionDurationFromElement(entry.toast.element))
      } else {
        const { element } = entry.toast
        element.style.translate = getComputedStyle(element).translate
        element.style.display = ''
        element.toggleAttribute(ATTRIBUTE_LIMITED, false)
        element.getBoundingClientRect()
        requestAnimationFrame(() => {
          element.style.translate = ''
        })
        entry.instance._maybeScheduleHide()
        unlimited = true
      }
    }

    if (unlimited) {
      this._settle(layout)
    }

    this._layoutStack()
  }

  _layoutStack(): void {
    if (!this._config.stack || !this._element) {
      return
    }

    const entries = [...this._entries.values()]
    const shown = entries.filter(entry => !entry.toast.limited).map(entry => entry.toast.element)
    const ordered = shown.toReversed()
    let before = 0

    for (const entry of entries.filter(entry => entry.toast.limited)) {
      entry.toast.element.removeAttribute(ATTRIBUTE_STACK_INDEX)
      entry.toast.element.removeAttribute(ATTRIBUTE_STACK_HIDDEN)
    }

    for (const [index, element] of ordered.entries()) {
      const height = this._naturalHeight(element)
      const instance = Toast.getInstance(element)! as unknown as Toast & { _config: ToastConfig, _timeout: number | null }
      instance._config.autohide = index === 0 && instance._config.delay > 0

      if (instance._config.autohide) {
        if (instance._timeout === null) {
          instance._maybeScheduleHide()
        }
      } else {
        instance._clearTimeout()
      }

      element.setAttribute(ATTRIBUTE_STACK_INDEX, String(index))
      element.toggleAttribute(ATTRIBUTE_STACK_HIDDEN, index >= STACK_VISIBLE)
      element.style.setProperty(PROPERTY_STACK_INDEX, String(index))
      element.style.setProperty(PROPERTY_STACK_BEFORE, `${before}px`)
      element.style.setProperty(PROPERTY_TOAST_HEIGHT, `${height}px`)
      before += height
    }

    this._element.style.setProperty(PROPERTY_STACK_COUNT, String(ordered.length))
    this._element.style.setProperty(PROPERTY_STACK_FRONT_HEIGHT, `${ordered.length > 0 ? this._naturalHeight(ordered[0]) : 0}px`)
    this._element.style.setProperty(PROPERTY_STACK_HEIGHTS, `${before}px`)
  }

  _createAnnouncer(role: string, live: string): HTMLElement {
    const announcer = document.createElement('div')
    announcer.className = CLASS_NAME_ANNOUNCER
    announcer.setAttribute('role', role)
    announcer.setAttribute('aria-live', live)
    announcer.setAttribute('aria-atomic', 'true')
    this._element.append(announcer)
    return announcer
  }

  _announce(toast: ToastObject): void {
    const announcer = this._announcers[toast.priority === 'high' ? 'high' : 'low']
    const text = [toast.title, toast.description]
      .map(part => execute(part, [undefined, this]) as string | Element | null | undefined)
      .map(part => (isElement(part) ? part.textContent : part))
      .filter(Boolean)
      .join('. ')

    announcer.textContent = ''
    requestAnimationFrame(() => {
      announcer.textContent = text
    })
  }

  _onLeave(event: any): void {
    const next = event.relatedTarget
    if (next && this._element.contains(next)) {
      return
    }

    this.resume()
  }

  _isSettled(element: Element): boolean {
    return element.classList.contains(CLASS_NAME_SHOW) && !element.hasAttribute(ATTRIBUTE_LIMITED) && element.getClientRects().length > 0
  }

  _naturalHeight(element: HTMLElement): number {
    const content = [...element.children].reduce((sum, child) => sum + (child as HTMLElement).offsetHeight, 0)
    return content + element.offsetHeight - element.clientHeight
  }

  _layout(): Map<Element, number> | null {
    if (!this._element || this._config.stack || this._prefersReducedMotion()) {
      return null
    }

    const layout = new Map<Element, number>()
    for (const child of this._element.querySelectorAll(':scope > .toast')) {
      if (this._isSettled(child)) {
        layout.set(child, child.getBoundingClientRect().top)
      }
    }

    return layout
  }

  _collapse(element: HTMLElement): void {
    element.style.display = 'block'

    if (!this._element || this._config.stack || this._prefersReducedMotion()) {
      return
    }

    const siblings = [...this._element.querySelectorAll(':scope > .toast')].filter(child => child !== element && this._isSettled(child))
    const visual = siblings.map(child => child.getBoundingClientRect().top)
    for (const child of siblings) {
      for (const animation of child.getAnimations()) {
        animation.cancel()
      }
    }

    const layout = siblings.map(child => child.getBoundingClientRect().top)
    const { transition } = element.style
    element.style.transition = 'none'
    element.style.display = 'none'
    const target = siblings.map(child => child.getBoundingClientRect().top)
    element.style.display = 'block'
    element.getBoundingClientRect()
    element.style.transition = transition

    for (const [index, child] of siblings.entries()) {
      const from = visual[index] - layout[index]
      const to = target[index] - layout[index]

      if (from !== to) {
        child.animate(
          [{ transform: `translateY(${from}px)` }, { transform: `translateY(${to}px)` }],
          { duration: getTransitionDurationFromElement(element) || 150, easing: 'ease-out', fill: 'forwards' }
        )
      }
    }
  }

  _settle(layout: Map<Element, number> | null): void {
    if (!layout || !this._element) {
      return
    }

    for (const child of this._element.querySelectorAll(':scope > .toast')) {
      const previous = layout.get(child)
      if (previous === undefined) {
        continue
      }

      for (const animation of child.getAnimations()) {
        animation.cancel()
      }

      const delta = previous - child.getBoundingClientRect().top
      if (delta !== 0) {
        child.animate(
          [{ transform: `translateY(${delta}px)` }, { transform: 'none' }],
          { duration: getTransitionDurationFromElement(child) || 150, easing: 'ease-out' }
        )
      }
    }
  }

  _prefersReducedMotion(): boolean {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  _promiseState<Value>(state: PromiseState<Value>, value?: Value): ToastOptions {
    const resolved = execute(state, [undefined, value])

    return typeof resolved === 'object' && resolved !== null && !(resolved instanceof Element) ? resolved : { description: resolved as TemplateContentEntry }
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Toaster.getOrCreateInstance(this, config)

      if (typeof config === 'string') {
        if (typeof data[config as string] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }

        data[config as string](this)
      }
    })
  }
}

/**
 * jQuery
 */

defineJQueryPlugin(Toaster)

export default Toaster
export type {
  PromiseOptions, ToastAction, ToastObject, ToastOptions, ToasterConfig
}
