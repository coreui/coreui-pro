/**
 * --------------------------------------------------------------------------
 * CoreUI PRO picker-base.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { getForwardedOptions } from './util/composite.js'
import type { ComponentConfig } from './util/config.js'
import { createControlGroupAction, type HostClasses, restoreHostClasses } from './util/form-control-group.js'
import { getValidationState, nextStateSerial, type ValidationState } from './util/form-validation.js'
import { getUID } from './util/index.js'
import Popup from './util/popup.js'
import { sanitizeByConfig } from './util/sanitizer.js'

/**
 * Constants
 */

const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_ACTION = '[data-coreui-picker-action]'
const SELECTOR_SECTION = '[data-coreui-section]'
const SELECTOR_SVG = 'svg'
const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'

const VALIDATION_OPTIONS = new Set(['invalid', 'valid', 'validationState'])

/**
 * Class definition
 */

abstract class PickerBase extends BaseComponent {
  protected declare _adoptedAttributes: [Element, string, string | null, string | null][]
  protected declare _byUser: boolean
  protected declare _cleanerElement: HTMLElement | null
  protected declare _fieldElement: HTMLElement
  protected declare _footerTemplate: HTMLTemplateElement | null
  protected declare _givenState: ValidationState | undefined
  protected declare _hostClasses: HostClasses
  protected declare _menu: HTMLElement
  protected declare _ownsStateClass: boolean
  protected declare _popup: Popup
  protected declare _serverClasses: string[]
  protected declare _stateClass: string | null
  protected declare _stateSerial: number
  protected declare _toggleElement: HTMLElement | null

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._adoptedAttributes = []
    this._byUser = false
    this._cleanerElement = null
    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element) as HTMLTemplateElement | null
    this._givenState = undefined
    this._menu = null as any
    this._ownsStateClass = false
    this._popup = null as any
    this._serverClasses = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID].filter(name => this._element.classList.contains(name))
    this._stateClass = null
    this._stateSerial = nextStateSerial()

    if (this._serverClasses.length > 0) {
      this._element.classList.remove(...this._serverClasses)
    }
  }

  // Public
  show(): void {
    this._popup.show()
  }

  hide(): void {
    this._popup.hide()
  }

  toggle(): void {
    return this._popup.isShown ? this.hide() : this.show()
  }

  setConfig(config: ComponentConfig | null): void {
    const validation = Object.fromEntries(Object.entries(config ?? {}).filter(([key]) => VALIDATION_OPTIONS.has(key)))

    if (Object.keys(validation).length === 0) {
      return
    }

    this._config = this._getConfig({ ...this._config, ...validation })
    this._serverClasses = []
    this._stateSerial = nextStateSerial()
    this._updateValidity()
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

    if (this._stateClass && this._ownsStateClass) {
      this._element.classList.remove(this._stateClass)
    }

    if (this._serverClasses.length > 0) {
      this._element.classList.add(...this._serverClasses)
    }

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
      onBeforeShow: () => !this._config.disabled && !EventHandler.trigger(this._element, this.constructor.eventName('show'))?.defaultPrevented,
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
        this._runAsUser(() => this.clear())

        if (this._element && [this._cleanerElement, document.body].includes(document.activeElement as HTMLElement)) {
          SelectorEngine.findOne(SELECTOR_SECTION, this._popupAnchor())?.focus()
        }
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

    this._updateValidity()
  }

  _updateValidity(): void {
    this._givenState = getValidationState(this._config.validationState, this._config.valid, this._config.invalid) ??
      getValidationState(null, this._serverClasses.includes(CLASS_NAME_IS_VALID), this._serverClasses.includes(CLASS_NAME_IS_INVALID))
    this._syncStateClass()
    this._setFieldState(this._givenState)
  }

  _syncStateClass(): boolean {
    const stateClass = this._shownStateClass()

    if (stateClass === this._stateClass) {
      return false
    }

    if (this._stateClass && this._ownsStateClass) {
      this._element.classList.remove(this._stateClass)
    }

    this._ownsStateClass = stateClass !== null && !this._element.classList.contains(stateClass)

    if (this._ownsStateClass) {
      this._element.classList.add(stateClass!)
    }

    this._stateClass = stateClass

    return true
  }

  _shownStateClass(): string | null {
    return null
  }

  _dismissValidationState(serial: number = Number.POSITIVE_INFINITY): void {
    if (this._stateSerial > serial) {
      return
    }

    this._config.invalid = false
    this._config.valid = false
    this._config.validationState = null
    this._serverClasses = []
    this._updateValidity()
  }

  _runAsUser(action: () => void): void {
    const previous = this._byUser
    this._byUser = true

    try {
      action()
    } finally {
      this._byUser = previous
    }
  }

  _withUser(part: any, action: () => void): void {
    const byUser = this._byUser
    this._byUser = false

    if (byUser) {
      part._runAsUser(action)
      return
    }

    action()
  }

  _createAction(className: string, icon: string, label: string): HTMLElement {
    return createControlGroupAction({
      className, disabled: this._config.disabled, icon, label, sanitizeIcon: (value: string) => sanitizeByConfig(value, this._config)
    })
  }

  _createMenu(prefix: string, body: HTMLElement, nowAction?: string): void {
    this._menu = document.createElement('div')
    this._menu.id = getUID(`${this.constructor.NAME}-popup-`)
    this._menu.classList.add(CLASS_NAME_POPUP, `${prefix}-popup`)
    this._menu.setAttribute('aria-label', this._popupLabel())
    this._menu.append(body)
    this._writeToggleAttribute('aria-expanded', 'false')
    this._writeToggleAttribute('aria-haspopup', 'dialog')

    if (!this._footerTemplate) {
      return
    }

    const footer = document.createElement('div')
    footer.classList.add(`${prefix}-footer`)
    footer.append(this._footerTemplate.content.cloneNode(true))

    if (nowAction && !this._isNowSelectable()) {
      for (const button of SelectorEngine.find(nowAction, footer)) {
        if ('disabled' in button) {
          (button as HTMLButtonElement).disabled = true
        }
      }
    }

    this._menu.append(footer)
  }

  _originalDefault(): Record<string, any> {
    return this.constructor.Default
  }

  _forwardConfig(Component: any, overrides: Record<string, any> = {}, extra: Record<string, any> = {}): Record<string, any> {
    const forwarded = getForwardedOptions(Object.keys(Component.Default), this._config, this.constructor.Default, this._originalDefault())

    return { ...forwarded, ...overrides, ...extra }
  }

  _baseContext(): Record<string, any> {
    return {
      clear: () => this._runAsUser(() => this.clear()),
      close: () => this.hide(),
      disabled: this._config.disabled,
      reset: () => this._runAsUser(() => this.reset())
    }
  }

  _writeAdoptedAttribute(element: Element, name: string, value: string | null): void {
    const recorded = this._adoptedAttributes.find(([recordedElement, recordedName]) => recordedElement === element && recordedName === name)

    if (recorded) {
      recorded[3] = value
    } else {
      this._adoptedAttributes.push([element, name, element.getAttribute(name), value])
    }

    if (value === null) {
      element.removeAttribute(name)
    } else {
      element.setAttribute(name, value)
    }
  }

  _adoptAction(element: HTMLElement, label: string): HTMLElement {
    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby') && !this._showsText(element)) {
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

  _showsText(element: Element): boolean {
    return [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE ?
      Boolean(node.textContent?.trim()) :
      node instanceof HTMLElement && !node.hidden && node.getAttribute('aria-hidden') !== 'true' && this._showsText(node))
  }

  _moveAriaToField(element: Element): void {
    const isNamed = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')

    for (const name of ['aria-describedby', 'aria-label', 'aria-labelledby']) {
      const value = this._element.getAttribute(name)
      const own = element.getAttribute(name)

      if (value === null || (name !== 'aria-describedby' && isNamed)) {
        continue
      }

      this._writeAdoptedAttribute(element, name, own ? `${own} ${value}` : value)
      this._writeAdoptedAttribute(this._element, name, null)
    }
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

  _popupLabel(): string {
    return this._config.ariaPopupLabel
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

  abstract _onPopupShow(): void

  abstract _disposeParts(): void

  abstract _managedClassNames(): string[]

  abstract _isNowSelectable(): boolean

  abstract _setFieldState(givenState: ValidationState | undefined): void

  abstract getContext(): Record<string, any>

  abstract clear(): void

  abstract reset(): void
}

export default PickerBase
