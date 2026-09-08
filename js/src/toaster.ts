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
const EVENT_REMOVE = `remove${EVENT_KEY}`
const EVENT_HIDE_TOAST = 'hide.coreui.toast'
const EVENT_HIDDEN_TOAST = 'hidden.coreui.toast'

const CLASS_NAME_CONTAINER = 'toast-container'
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
const ATTRIBUTE_UPDATE_KEY = 'data-coreui-update-key'

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
  '<div class="toast" aria-atomic="true">',
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
  html: false,
  label: 'Notifications',
  limit: 3,
  placement: 'top-end',
  sanitize: true,
  sanitizeFn: null,
  timeout: 5000
}

const DefaultType = {
  allowList: 'object',
  container: '(string|element)',
  html: 'boolean',
  label: 'string',
  limit: 'number',
  placement: 'string',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
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

type ToasterConfig = {
  allowList: SanitizerAllowList
  container: string | Element
  html: boolean
  label: string
  limit: number
  placement: string
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
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
  protected declare _layoutBeforeHide: Map<Element, number> | null
  protected declare _ownsContainer: boolean

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    const ownsContainer = !getElement(element)
    super(ownsContainer ? document.createElement('div') : element, config)

    this._entries = new Map()
    this._layoutBeforeHide = null
    this._ownsContainer = ownsContainer

    if (!PLACEMENTS.has(this._config.placement)) {
      throw new TypeError(`${NAME.toUpperCase()}: Option "placement" provided value "${this._config.placement}" but expected one of ${[...PLACEMENTS].join(', ')}.`)
    }

    if (ownsContainer) {
      this._element.className = `${CLASS_NAME_CONTAINER} ${CLASS_NAME_CONTAINER}-${this._config.placement}`
      getElement(this._config.container)!.append(this._element)
    }

    this._element.setAttribute('role', 'region')
    this._element.setAttribute('aria-label', this._config.label)
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
    const entry = { instance, toast }
    this._entries.set(toast.id, entry)

    EventHandler.one(toast.element, EVENT_HIDE_TOAST, () => {
      this._layoutBeforeHide = this._layout()
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

    this._settle(layout)

    this._applyLimit()
    instance.show()
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

    for (const name of ['role', 'aria-live', ATTRIBUTE_UPDATE_KEY]) {
      previous.element.setAttribute(name, rendered.getAttribute(name)!)
    }

    if (next.timeout !== previous.timeout) {
      const timeout = next.timeout ?? this._config.timeout
      const config = (entry.instance as unknown as { _config: ToastConfig })._config
      config.autohide = timeout > 0
      config.delay = timeout
      entry.instance._clearTimeout()
      entry.instance._maybeScheduleHide()
    }

    entry.toast = next
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

  getToasts(): ToastObject[] {
    return [...this._entries.values()].map(entry => entry.toast)
  }

  override dispose(): void {
    for (const entry of this._entries.values()) {
      entry.instance.dispose()
      entry.toast.element.remove()
    }

    this._entries.clear()

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

    element.setAttribute('role', toast.priority === 'high' ? 'alert' : 'status')
    element.setAttribute('aria-live', toast.priority === 'high' ? 'assertive' : 'polite')
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
    if (!this._entries.has(entry.toast.id)) {
      return
    }

    this._entries.delete(entry.toast.id)
    entry.instance.dispose()
    entry.toast.element.remove()
    this._settle(this._layoutBeforeHide)
    this._layoutBeforeHide = null
    execute(entry.toast.onRemove, [undefined, entry.toast])
    this._applyLimit()
    EventHandler.trigger(this._element, EVENT_REMOVE, { id: entry.toast.id })
  }

  _applyLimit(): void {
    const entries = [...this._entries.values()]
    const overflow = this._config.limit > 0 ? Math.max(0, entries.length - this._config.limit) : 0

    for (const [index, entry] of entries.entries()) {
      const limited = index < overflow

      if (limited === entry.toast.limited) {
        continue
      }

      entry.toast.limited = limited
      entry.toast.element.inert = limited
      entry.toast.element.toggleAttribute(ATTRIBUTE_LIMITED, limited)

      if (limited) {
        entry.instance._clearTimeout()
      } else {
        entry.instance._maybeScheduleHide()
      }
    }
  }

  _layout(): Map<Element, number> | null {
    if (this._prefersReducedMotion()) {
      return null
    }

    const layout = new Map<Element, number>()
    for (const child of this._element.children) {
      layout.set(child, child.getBoundingClientRect().top)
    }

    return layout
  }

  _settle(layout: Map<Element, number> | null): void {
    if (!layout) {
      return
    }

    for (const child of this._element.children) {
      const previous = layout.get(child)
      if (previous === undefined) {
        continue
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
