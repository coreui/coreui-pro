/**
 * --------------------------------------------------------------------------
 * CoreUI PRO picker-base.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import Popup from './util/popup.js'
import type { ComponentConfig } from './util/config.js'
import { type HostClasses, restoreHostClasses } from './util/form-control-group.js'

/**
 * Constants
 */

const CLASS_NAME_SHOW = 'show'

const SELECTOR_ACTION = '[data-coreui-picker-action]'
const SELECTOR_SVG = 'svg'
const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'

/**
 * Class definition
 */

class PickerBase extends BaseComponent {
  protected declare _adoptedAttributes: [Element, string, string | null, string][]
  protected declare _cleanerElement: HTMLElement | null
  protected declare _fieldElement: HTMLElement
  protected declare _footerTemplate: HTMLTemplateElement | null
  protected declare _hostClasses: HostClasses
  protected declare _menu: HTMLElement
  protected declare _popup: Popup
  protected declare _toggleElement: HTMLElement | null

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._adoptedAttributes = []
    this._cleanerElement = null
    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element) as HTMLTemplateElement | null
    this._menu = null as any
    this._popup = null as any
  }

  // Public
  show(): void {
    if (this._config.disabled) {
      return
    }

    this._popup.show()
  }

  hide(): void {
    this._popup.hide()
  }

  toggle(): void {
    return this._popup.isShown ? this.hide() : this.show()
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    for (const element of this._listeningElements()) {
      EventHandler.off(element, this.constructor.EVENT_KEY)
    }

    this._popup.dispose()
    this._disposeParts()
    this._restoreAdoptedAttributes()

    restoreHostClasses(this._element, this._managedClassNames(), this._hostClasses)

    super.dispose()
  }

  // Private
  _createPopup(): void {
    this._popup = new Popup({
      anchor: this._popupAnchor(),
      container: this._config.container,
      content: this._menu,
      onBeforeHide: () => !EventHandler.trigger(this._element, this.constructor.eventName('hide'))?.defaultPrevented,
      onBeforeShow: () => !EventHandler.trigger(this._element, this.constructor.eventName('show'))?.defaultPrevented,
      onHidden: () => EventHandler.trigger(this._element, this.constructor.eventName('hidden')),
      onHide: () => {
        this._clearToggleAttribute('aria-controls')
        this._menu.classList.remove(CLASS_NAME_SHOW)
        this._element.classList.remove(CLASS_NAME_SHOW)
        this._writeToggleAttribute('aria-expanded', 'false')
      },
      onShow: () => {
        this._writeToggleAttribute('aria-controls', this._menu.id)
        this._menu.classList.add(CLASS_NAME_SHOW)
        this._element.classList.add(CLASS_NAME_SHOW)
        this._onPopupShow()
        this._writeToggleAttribute('aria-expanded', 'true')
      },
      onShown: () => EventHandler.trigger(this._element, this.constructor.eventName('shown'))
    })
  }

  _addEventListeners(): void {
    const eventName = this.constructor.eventName('click')

    if (this._cleanerElement) {
      EventHandler.on(this._cleanerElement, eventName, (event: any) => {
        event.stopPropagation()
        this.clear()
      })
    }

    EventHandler.on(this._toggleElement, eventName, () => {
      if (!this._config.disabled) {
        this.toggle()
      }
    })

    EventHandler.on(this._menu, eventName, SELECTOR_ACTION, (event: any) => {
      const action = event.target.closest(SELECTOR_ACTION).dataset.coreuiPickerAction
      const context = this.getContext()

      if (typeof context[action] === 'function') {
        context[action]()
      }
    })
  }

  _originalDefault(): Record<string, any> {
    return this.constructor.Default
  }

  _forwardConfig(Component: any, overrides: Record<string, any> = {}, extra: Record<string, any> = {}): Record<string, any> {
    const forwarded: Record<string, any> = {}
    const original = this._originalDefault()

    for (const key of Object.keys(Component.Default)) {
      if (key in this._config && this._config[key] !== original[key]) {
        forwarded[key] = this._config[key]
      }
    }

    return { ...forwarded, ...overrides, ...extra }
  }

  _baseContext(): Record<string, any> {
    return {
      clear: () => this.clear(),
      close: () => this.hide(),
      disabled: this._config.disabled,
      reset: () => this.reset()
    }
  }

  _disableUnselectableActions(selector: string, container: HTMLElement): void {
    if (this._isNowSelectable()) {
      return
    }

    for (const button of SelectorEngine.find(selector, container)) {
      if ('disabled' in button) {
        (button as any).disabled = true
      }
    }
  }

  _writeAdoptedAttribute(element: Element, name: string, value: string): void {
    if (!this._adoptedAttributes.some(([recorded, recordedName]) => recorded === element && recordedName === name)) {
      this._adoptedAttributes.push([element, name, element.getAttribute(name), value])
    }

    element.setAttribute(name, value)
  }

  _adoptAction(element: HTMLElement, label: string): HTMLElement {
    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
      this._writeAdoptedAttribute(element, 'aria-label', label)
    }

    for (const svg of SelectorEngine.find(SELECTOR_SVG, element)) {
      if (!svg.hasAttribute('aria-hidden')) {
        this._writeAdoptedAttribute(svg, 'aria-hidden', 'true')
      }
    }

    if (this._config.disabled && 'disabled' in element) {
      this._writeAdoptedAttribute(element, 'disabled', '');
      (element as HTMLButtonElement).disabled = true
    }

    return element
  }

  _restoreAdoptedAttributes(): void {
    for (const [element, name, previous, written] of this._adoptedAttributes) {
      if (element.getAttribute(name) !== written) {
        continue
      }

      if (previous === null) {
        element.removeAttribute(name)
      } else {
        element.setAttribute(name, previous)
      }
    }
  }

  _listeningElements(): (Element | null)[] {
    return [this._menu, this._toggleElement, this._cleanerElement]
  }

  _popupAnchor(): HTMLElement {
    return this._element
  }

  _writeToggleAttribute(name: string, value: string): void {
    this._toggleElement?.setAttribute(name, value)
  }

  _clearToggleAttribute(name: string): void {
    if (!this._toggleElement) {
      return
    }

    const recorded = this._adoptedAttributes.find(([element, recordedName]) => element === this._toggleElement && recordedName === name)

    if (recorded?.[2] === null || recorded === undefined) {
      this._toggleElement.removeAttribute(name)
      return
    }

    this._toggleElement.setAttribute(name, recorded[2] as string)
  }

  _onPopupShow(): void {
    throw new Error('Method "_onPopupShow" must be implemented.')
  }

  _disposeParts(): void {
    throw new Error('Method "_disposeParts" must be implemented.')
  }

  _managedClassNames(): string[] {
    throw new Error('Method "_managedClassNames" must be implemented.')
  }

  _isNowSelectable(): boolean {
    throw new Error('Method "_isNowSelectable" must be implemented.')
  }

  getContext(): Record<string, any> {
    throw new Error('Method "getContext" must be implemented.')
  }

  clear(): void {
    throw new Error('Method "clear" must be implemented.')
  }

  reset(): void {
    throw new Error('Method "reset" must be implemented.')
  }
}

export default PickerBase
