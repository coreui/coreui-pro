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
import FieldValidation from './util/field-validation.js'
import {
  appendControlGroupField,
  applyControlGroupClasses,
  applyControlGroupSize,
  createControlGroupAction
} from './util/form-control-group.js'
import { type ValidationState } from './util/form-validation.js'
import { getUID } from './util/index.js'
import { settleClick } from './util/layers.js'
import Popup from './util/popup.js'
import { sanitizeByConfig } from './util/sanitizer.js'

/**
 * Constants
 */

const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_ACTION = '[data-coreui-picker-action]'
const SELECTOR_SECTION = '[data-coreui-section]'
const SELECTOR_SVG = 'svg'
const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'

type WriteSource = 'calendar' | 'code' | 'selection'

/**
 * Class definition
 */

abstract class PickerBase extends BaseComponent {
  protected declare _adoptedAttributes: [Element, string, string | null, string | null][]
  protected declare _cleanerElement: HTMLElement | null
  protected declare _createdElements: Element[]
  protected declare _footerTemplate: HTMLTemplateElement | null
  protected declare _input: any
  protected declare _menu: HTMLElement
  protected declare _popup: Popup
  protected declare _source: WriteSource | null
  protected declare _toggleElement: HTMLElement | null
  protected declare _validation: FieldValidation

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._adoptedAttributes = []
    this._cleanerElement = null
    this._createdElements = []
    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element) as HTMLTemplateElement | null
    this._input = null
    this._menu = null as any
    this._popup = null as any
    this._source = null
    this._toggleElement = null
    this._validation = new FieldValidation(this._element, {
      aliases: true,
      config: () => this._config,
      fields: () => [],
      frames: () => this._stateFrames(),
      invalidTargets: () => []
    })
  }

  // Getters
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

  setValidationState(validationState: ValidationState | null): void {
    this._setConfig({ invalid: false, valid: false, validationState })
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    for (const element of this._listeningElements()) {
      EventHandler.off(element, this.constructor.EVENT_KEY)
    }

    this._popup.dispose()
    this._input.dispose()
    this._disposeParts()

    for (const element of this._createdElements) {
      element.remove()
    }

    this._restoreAdoptedAttributes()
    this._validation.dispose()

    super.dispose()
  }

  // Private
  _setConfig(config: ComponentConfig | null): void {
    if (!config || Object.keys(config).length === 0) {
      return
    }

    this._config = this._getConfig({ ...this._config, ...config })
    this._validation.configure(config)
  }

  _createPopup(): void {
    this._popup = new Popup({
      anchor: this._popupAnchor(),
      container: this._config.container,
      content: this._menu,
      onBeforeHide: () => !EventHandler.trigger(this._element, this.constructor.eventName('hide'))?.defaultPrevented,
      onBeforeShow: () => this._isEditable() && !EventHandler.trigger(this._element, this.constructor.eventName('show'))?.defaultPrevented,
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
        settleClick(event)
        event.stopPropagation()
        this._runAsUser(() => this.clear())

        if (this._element && [this._cleanerElement, document.body].includes(document.activeElement as HTMLElement)) {
          SelectorEngine.findOne(SELECTOR_SECTION, this._popupAnchor())?.focus()
        }
      })
    }

    EventHandler.on(this._toggleElement, eventName, () => this.toggle())

    EventHandler.on(this._menu, eventName, SELECTOR_ACTION, (event: any) => {
      const action = event.target.closest(SELECTOR_ACTION).dataset.coreuiPickerAction
      const context = this.getContext()

      if (typeof context[action] === 'function') {
        context[action]()
      }
    })
  }

  _stateFrames(): Element[] {
    return []
  }

  _isEditable(): boolean {
    return !this._config.disabled && !this._config.readonly
  }

  _runAsUser(action: () => void): void {
    this._validation.runAsUser(action)
  }

  _createControlGroup(className: string): void {
    this._element.classList.add(className, CLASS_NAME_PICKER)
    applyControlGroupClasses(this._element, CLASS_NAME_INPUT_GROUP)
    applyControlGroupSize(this._element, this._config.size)
  }

  _appendField(): HTMLElement {
    const field = document.createElement('div')
    this._createdElements.push(appendControlGroupField(this._element, field, this._config.floatingLabel, `${this.constructor.NAME}-`))

    return field
  }

  _appendCleaner(group: HTMLElement, label: string): void {
    if (this._config.cleaner) {
      this._cleanerElement = this._appendAction(group, CLASS_NAME_CLEANER, this._config.cleanerIcon, label)
    }
  }

  _appendToggle(group: HTMLElement, label: string, icon: string): void {
    if (this._config.pickerIcon) {
      this._toggleElement = this._appendAction(group, CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? icon : this._config.pickerIcon, label)
    }
  }

  _appendAction(group: HTMLElement, className: string, icon: string, label: string): HTMLElement {
    const action = createControlGroupAction({
      className, disabled: !this._isEditable(), icon, label, sanitizeIcon: (value: string) => sanitizeByConfig(value, this._config)
    })
    group.append(action)
    this._createdElements.push(action)

    return action
  }

  _createDiv(className: string, ...children: Node[]): HTMLElement {
    const element = document.createElement('div')
    element.classList.add(className)
    element.append(...children)

    return element
  }

  _createMenu(prefix: string, parts: Node[], nowAction?: string): HTMLElement {
    const body = this._createDiv(`${prefix}-body`, ...parts)

    this._menu = document.createElement('div')
    this._menu.id = getUID(`${this.constructor.NAME}-popup-`)
    this._menu.classList.add(CLASS_NAME_POPUP, `${prefix}-popup`)
    this._menu.setAttribute('aria-label', this._popupLabel())
    this._menu.append(body)
    this._writeToggleAttribute('aria-expanded', 'false')
    this._writeToggleAttribute('aria-haspopup', 'dialog')

    if (!this._footerTemplate) {
      return body
    }

    const footer = this._createDiv(`${prefix}-footer`, this._footerTemplate.content.cloneNode(true))

    if (nowAction && !this._input.isDateSelectable(new Date())) {
      for (const button of SelectorEngine.find(nowAction, footer)) {
        if ('disabled' in button) {
          (button as HTMLButtonElement).disabled = true
        }
      }
    }

    this._menu.append(footer)

    return body
  }

  _write(value: Date | null, source: WriteSource = 'code', triggerChange = true): void {
    const previous = this._source
    this._source = source

    try {
      this._input.setDate(value, triggerChange)

      if (this._element && this._source === source) {
        this._syncParts()
      }
    } finally {
      this._source = previous
    }
  }

  _syncParts(): void {}

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
      svg.setAttribute('aria-hidden', 'true')
    }

    if ('disabled' in element) {
      (element as HTMLButtonElement).disabled = !this._isEditable()
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
    if (!this._toggleElement) {
      return
    }

    if (this._createdElements.includes(this._toggleElement) || (name !== 'aria-label' && name !== 'aria-controls')) {
      this._toggleElement.setAttribute(name, value)
      return
    }

    this._writeAdoptedAttribute(this._toggleElement, name, value)
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

  abstract getContext(): Record<string, any>

  abstract clear(): void

  abstract reset(): void
}

export default PickerBase
