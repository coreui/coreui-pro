/**
 * --------------------------------------------------------------------------
 * CoreUI search-button.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'search-button'
const DATA_KEY = 'coreui.search-button'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_BLUR_DATA_API = `blur${EVENT_KEY}${DATA_API_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`
const EVENT_TRIGGER = `trigger${EVENT_KEY}`

const CLASS_NAME_SHORTCUT_KEYS = 'search-button-keys'
const CLASS_NAME_SHORTCUT_KEY = 'search-button-key'
const CLASS_NAME_ACTIVE = 'active'

const SELECTOR_DATA_TOGGLE = '[data-coreui-search-button]'
const SELECTOR_EDITABLE_TARGET = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]'
const SELECTOR_PLACEHOLDER = '.search-button-placeholder'
const SELECTOR_SHORTCUT_KEY = '.search-button-key'
const SELECTOR_SHORTCUT_KEYS = '.search-button-keys'

type ParsedShortcut = {
  key: string
  modifiers: Record<string, boolean>
  shortcut: string
}

const Default = {
  preventDefault: true,
  shortcut: 'meta+/,ctrl+/'
}

const DefaultType = {
  preventDefault: 'boolean',
  shortcut: 'string'
}

const MODIFIER_KEYS = new Set(['alt', 'ctrl', 'meta', 'shift'])

const KEY_ALIASES = {
  cmd: 'meta',
  command: 'meta',
  control: 'ctrl',
  option: 'alt',
  return: 'enter',
  esc: 'escape',
  spacebar: 'space',
  ' ': 'space'
}

const KEY_LABELS = {
  alt: 'Alt',
  ctrl: 'Ctrl',
  meta: '⌘',
  shift: 'Shift',
  space: 'Space'
}

/**
 * Class definition
 */

class SearchButton extends BaseComponent {
  protected declare _shortcutTriggered: boolean
  protected declare _shortcuts: ParsedShortcut[]
  protected declare _preferredShortcut: ParsedShortcut | null

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._shortcutTriggered = false
    this._shortcuts = this._parseShortcut(this._config.shortcut)
    this._preferredShortcut = this._getPreferredShortcut(this._shortcuts)
    this._syncShortcutKeys()
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
  trigger(): void {
    this._triggerEvent('api')
  }

  // Private
  _triggerEvent(trigger: any): void {
    if (this._isDisabled()) {
      return
    }

    EventHandler.trigger(this._element, EVENT_TRIGGER, { trigger })
  }

  _handleShortcut(event: any): boolean | null {
    if (this._isDisabled() || event!.defaultPrevented || event.repeat || this._shouldIgnoreShortcut(event)) {
      return false
    }

    const matchedShortcut = this._shortcuts.find(shortcut => this._matchesShortcut(shortcut, event))

    if (!matchedShortcut) {
      return false
    }

    if (this._config.preventDefault) {
      event.preventDefault()
    }

    this._shortcutTriggered = true

    try {
      this._element.click()
    } finally {
      this._shortcutTriggered = false
    }

    return true
  }

  _isDisabled(): any {
    return this._element.classList.contains('disabled') ||
      this._element.getAttribute('aria-disabled') === 'true' ||
      (this._element as HTMLButtonElement).disabled
  }

  _ensureShortcutKeys(): any {
    const existingShortcutKeys = this._element.querySelector(SELECTOR_SHORTCUT_KEYS)

    if (existingShortcutKeys) {
      return existingShortcutKeys
    }

    const shortcutKeys = document.createElement('span')
    shortcutKeys.className = CLASS_NAME_SHORTCUT_KEYS
    shortcutKeys.setAttribute('aria-hidden', 'true')
    const placeholder = this._element.querySelector(SELECTOR_PLACEHOLDER)

    if (placeholder) {
      placeholder.after(shortcutKeys)
      return shortcutKeys
    }

    this._element.append(shortcutKeys)
    return shortcutKeys
  }

  _syncShortcutKeys(): void {
    const shortcutKeys = this._ensureShortcutKeys()
    const shortcutTokens = this._formatShortcutTokens(this._preferredShortcut?.shortcut || '')
      .filter(Boolean)

    shortcutKeys.replaceChildren()

    for (const key of shortcutTokens) {
      const shortcutKey = document.createElement('span')
      shortcutKey.className = CLASS_NAME_SHORTCUT_KEY
      shortcutKey.textContent = key
      shortcutKey.dataset.coreuiSearchButtonKey = key
      shortcutKeys.append(shortcutKey)
    }
  }

  _syncActiveKeys(event: any): void {
    const pressedKeys = this._getPressedKeys(event)

    for (const shortcutKey of this._element.querySelectorAll(SELECTOR_SHORTCUT_KEY)) {
      shortcutKey.classList.toggle(CLASS_NAME_ACTIVE, pressedKeys.has((shortcutKey as HTMLElement).dataset.coreuiSearchButtonKey!))
    }
  }

  _clearActiveKeys(): void {
    for (const shortcutKey of this._element.querySelectorAll(SELECTOR_SHORTCUT_KEY)) {
      shortcutKey.classList.remove(CLASS_NAME_ACTIVE)
    }
  }

  _consumeShortcutTrigger(): boolean {
    const shortcutTriggered = this._shortcutTriggered
    this._shortcutTriggered = false
    return shortcutTriggered
  }

  _shouldIgnoreShortcut(event: any): boolean {
    return this._isEditableTarget(event.target) && !event.ctrlKey && !event.metaKey
  }

  _isEditableTarget(target: any): any {
    if (!(target instanceof Element)) {
      return false
    }

    return target.matches(SELECTOR_EDITABLE_TARGET) || target.closest(SELECTOR_EDITABLE_TARGET)
  }

  _normalizeKey(key: string): string {
    return (KEY_ALIASES as Record<string, string>)[key.toLowerCase()] || key.toLowerCase()
  }

  _parseShortcut(shortcut: string): any {
    return shortcut
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
      .map(value => {
        const keys = value.split('+').map(part => this._normalizeKey(part.trim()))
        const modifiers = {
          alt: false,
          ctrl: false,
          meta: false,
          shift: false
        }

        let key = ''

        for (const part of keys) {
          if (MODIFIER_KEYS.has(part)) {
            (modifiers as Record<string, boolean>)[part] = true
            continue
          }

          key = part
        }

        return {
          key,
          modifiers,
          shortcut: value
        }
      })
  }

  _matchesShortcut(shortcut: ParsedShortcut, event: any): boolean {
    if (!shortcut.key || this._normalizeKey(event.key) !== shortcut.key) {
      return false
    }

    return shortcut.modifiers.alt === event.altKey &&
      shortcut.modifiers.ctrl === event.ctrlKey &&
      shortcut.modifiers.meta === event.metaKey &&
      shortcut.modifiers.shift === event.shiftKey
  }

  _formatShortcutTokens(shortcut: string): any {
    return shortcut
      .split('+')
      .map(part => this._normalizeKey(part.trim()))
      .map(part => this._getKeyLabel(part))
  }

  _getPlatform(): string {
    return (window.navigator as any).userAgentData?.platform ||
      window.navigator.platform ||
      window.navigator.userAgent ||
      ''
  }

  _isMacOS(): any {
    return /Mac|iPhone|iPad|iPod|macOS|Macintosh/.test(this._getPlatform())
  }

  _getPreferredShortcut(shortcuts: ParsedShortcut[]): any {
    return shortcuts.find(shortcut => {
      return this._isMacOS() ? shortcut.modifiers.meta : shortcut.modifiers.ctrl
    }) || shortcuts[0] || null
  }

  _getPressedKeys(event: any): Set<string> {
    const pressedKeys = new Set<string>()

    if (event.altKey) {
      pressedKeys.add(KEY_LABELS.alt)
    }

    if (event.ctrlKey) {
      pressedKeys.add(KEY_LABELS.ctrl)
    }

    if (event.metaKey) {
      pressedKeys.add(KEY_LABELS.meta)
    }

    if (event.shiftKey) {
      pressedKeys.add(KEY_LABELS.shift)
    }

    const normalizedKey = this._normalizeKey(event.key)
    const keyLabel = this._getKeyLabel(normalizedKey)

    if (!MODIFIER_KEYS.has(normalizedKey) && event.type === 'keydown') {
      pressedKeys.add(keyLabel)
    }

    return pressedKeys
  }

  _getKeyLabel(key: string): string {
    return (KEY_LABELS as Record<string, string>)[key] || (key.length === 1 ? key.toUpperCase() : `${key.charAt(0).toUpperCase()}${key.slice(1)}`)
  }

  // Static
  static searchButtonInterface(element: string | Element | null, config?: any): void {
    const data: any = SearchButton.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (config.startsWith('_') || typeof data[config as string] !== 'function') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      SearchButton.searchButtonInterface(this, config)
    })
  }

  static _initializeDataApi(): void {
    for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE)) {
      SearchButton.getOrCreateInstance(button)
    }
  }

  static _handleDataApiClick(event: any): void {
    event.preventDefault()

    const button = (event.target as HTMLElement).closest(SELECTOR_DATA_TOGGLE)
    const data: any = SearchButton.getOrCreateInstance(button)
    const shortcutTriggered = data._consumeShortcutTrigger()

    if (shortcutTriggered) {
      data._triggerEvent('shortcut')
      return
    }

    data._triggerEvent('click')
  }

  static _handleDataApiKeydown(event: any): void {
    for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE)) {
      const data: any = SearchButton.getOrCreateInstance(button)
      data._syncActiveKeys(event)

      if (data._handleShortcut(event)) {
        break
      }
    }
  }

  static _handleDataApiKeyup(event: any): void {
    for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE)) {
      SearchButton.getOrCreateInstance(button)._syncActiveKeys(event)
    }
  }

  static _handleDataApiBlur(): void {
    for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE)) {
      SearchButton.getOrCreateInstance(button)._clearActiveKeys()
    }
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  SearchButton._initializeDataApi()
})

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, (event: any) => {
  SearchButton._handleDataApiClick(event)
})

EventHandler.on(document, EVENT_KEYDOWN_DATA_API, (event: any) => {
  SearchButton._handleDataApiKeydown(event)
})

EventHandler.on(document, EVENT_KEYUP_DATA_API, (event: any) => {
  SearchButton._handleDataApiKeyup(event)
})

EventHandler.on(window, EVENT_BLUR_DATA_API, () => {
  SearchButton._handleDataApiBlur()
})

/**
 * jQuery
 */

defineJQueryPlugin(SearchButton)

export default SearchButton
