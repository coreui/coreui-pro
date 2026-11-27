/**
 * --------------------------------------------------------------------------
 * CoreUI otp-input.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler, { type CoreUIEvent } from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { onDocumentReady } from './util/component-functions.js'
import FieldValidation from './util/field-validation.js'
import { watchFieldset } from './util/fieldset.js'
import { type ValidationState } from './util/form-validation.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'otp-input'
const DATA_KEY = 'coreui.otp-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_COMPLETE = `complete${EVENT_KEY}`
const EVENT_DOM_CONTENT_LOADED_DATA_API = `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_OTP = '[data-coreui-otp]'
const SELECTOR_INPUT = 'input'
const SELECTOR_LEGACY_CONTROL = '.form-otp-control'

const CLASS_NAME_INPUT = 'otp-input'
const CLASS_NAME_RENDERED = 'otp-rendered'
const CLASS_NAME_SLOTS = 'otp-slots'
const CLASS_NAME_SLOT = 'otp-slot'
const CLASS_NAME_SLOT_FILLED = 'otp-slot-filled'
const CLASS_NAME_SLOT_ACTIVE = 'otp-slot-active'
const CLASS_NAME_SLOT_SELECTED = 'otp-slot-selected'
const CLASS_NAME_SEPARATOR = 'otp-separator'

const MASK_CHARACTER = '•'

// Per-type input mode, validation pattern, and a filter that strips disallowed characters
const TYPES = {
  numeric: { inputmode: 'numeric', pattern: '[0-9]*', filter: /[^0-9]/g },
  alphanumeric: { inputmode: 'text', pattern: '[A-Za-z0-9]*', filter: /[^A-Za-z0-9]/g },
  alpha: { inputmode: 'text', pattern: '[A-Za-z]*', filter: /[^A-Za-z]/g }
}

const MULTI_CHARACTER_INPUT_TYPES = new Set(['insertText', 'insertReplacementText', 'insertFromDrop'])

type OtpInputConfig = {
  autoSubmit: boolean
  groups: number[] | null
  length: number | null
  mask: boolean
  pasteTransformer: ((text: string) => string) | null
  separator: string
  type: string
  validationState: ValidationState | null
}

const Default: OtpInputConfig = {
  autoSubmit: false,
  groups: null,
  length: null,
  mask: false,
  pasteTransformer: null,
  separator: '·',
  type: 'numeric',
  validationState: null
}

const DefaultType = {
  autoSubmit: 'boolean',
  groups: '(array|null)',
  length: '(number|null)',
  mask: 'boolean',
  pasteTransformer: '(function|null)',
  separator: 'string',
  type: 'string',
  validationState: '(string|null|undefined)'
}

/**
 * Class definition
 */

class OTPInput extends BaseComponent {
  protected declare _config: OtpInputConfig
  protected declare _fieldsetWatch: HTMLElement
  protected declare _input: HTMLInputElement
  protected declare _type: { inputmode: string, pattern: string, filter: RegExp }
  protected declare _length: number
  protected declare _slots: HTMLElement[]
  protected declare _pointerActive: boolean
  protected declare _pointerIndex: number
  protected declare _touchPointer: boolean
  protected declare _slotsContainer: HTMLElement
  protected declare _inputDefaults: Map<string, string>
  protected declare _inputListeners: Record<string, (event: CoreUIEvent) => void>
  protected declare _onSelectionChange: () => void
  protected declare _onReset: (event: Event) => void
  protected declare _resetRoot: Document | ShadowRoot
  protected declare _executingCommand: boolean
  protected declare _leftWithWindow: boolean
  protected declare _lastCompleteValue: string | null
  protected declare _pendingInsert: { before: string, start: number, end: number, text: string } | null
  protected declare _validation: FieldValidation
  protected declare _value: string

  constructor(element?: string | Element | null, config?: Partial<OtpInputConfig> | null) {
    super(element, config)

    const inputs = SelectorEngine.find<HTMLInputElement>(SELECTOR_INPUT, this._element)
    if (inputs.length !== 1 || SelectorEngine.findOne(SELECTOR_LEGACY_CONTROL, this._element)) {
      throw new TypeError(`${NAME}: the container takes one <input>, see the v6 migration guide`)
    }

    if (!Object.hasOwn(TYPES, this._config.type)) {
      throw new TypeError(`${NAME}: unknown type "${this._config.type}", see the v6 migration guide`)
    }

    this._input = inputs[0]

    this._type = TYPES[this._config.type as keyof typeof TYPES]
    this._length = this._resolveLength()
    this._slots = []
    // Tracks whether focus was triggered by a click so we can respect the
    // clicked slot instead of jumping to the first empty one
    this._pointerActive = false
    // Slot index from the most recent tap, applied once focus settles
    this._pointerIndex = 0
    this._touchPointer = false
    this._pendingInsert = null
    this._executingCommand = false
    this._leftWithWindow = false

    this._setupInput()
    this._value = this._input.value
    this._lastCompleteValue = this._completeValue()
    this._validation = new FieldValidation(this._element, {
      config: () => this._config,
      fields: () => [this._input],
      frames: () => [this._element],
      invalidTargets: () => [this._input]
    })
    this._renderSlots()
    this._addEventListeners()
    this._render()
    this._validation.refresh()
    this._fieldsetWatch = watchFieldset(this._input, () => this._validation.update())
  }

  // Getters
  static override get Default(): OtpInputConfig {
    return Default
  }

  static override get DefaultType(): Record<string, string> {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  getValue(): string {
    return this._input.value
  }

  setValue(value: string | number): void {
    this._typeCheckConfig({ value }, { value: '(number|string)' })
    this._input.value = this._sanitize(String(value))
    this._settleValue()
  }

  clear(): void {
    this._input.value = ''
    this._commitValue(false)
  }

  reset(): void {
    this._input.value = this._sanitize(this._input.defaultValue)
    this._commitValue(false)
  }

  disable(): void {
    this._setDisabled(true)
  }

  enable(): void {
    this._setDisabled(false)
  }

  setValidationState(validationState: ValidationState | null): void {
    this._config = this._getConfig({ ...this._config, validationState }) as OtpInputConfig
    this._validation.update()
  }

  focus(): void {
    this._input.focus()
    // Select the first empty slot (or the last one when the value is full)
    this._selectSlot(this._firstEmptyIndex())
    this._render()
  }

  override dispose(): void {
    this._fieldsetWatch?.remove()

    for (const [type, listener] of Object.entries(this._inputListeners ?? {})) {
      EventHandler.off(this._input, type, listener)
    }

    EventHandler.off(document, 'selectionchange', this._onSelectionChange)
    this._resetRoot?.removeEventListener('reset', this._onReset, true)
    this._validation?.dispose()

    for (const [attribute, value] of this._inputDefaults ?? []) {
      if (this._input.getAttribute(attribute) === value) {
        this._input.removeAttribute(attribute)
      }
    }

    this._slotsContainer?.remove()
    this._element.classList.remove(CLASS_NAME_RENDERED)
    super.dispose()
  }

  // Private
  protected _resolveLength(): number {
    if (this._config.length) {
      return this._config.length
    }

    const maxLength = Number.parseInt(this._input.getAttribute('maxlength')!, 10)
    return Number.isNaN(maxLength) || maxLength < 1 ? 6 : maxLength
  }

  protected _setupInput(): void {
    const input = this._input

    // A single text field backs the whole control so screen readers, password
    // managers, and SMS autofill treat it like any other input.
    if (this._config.mask) {
      input.type = 'password'
    } else if (input.type === 'number' || input.type === 'password') {
      input.type = 'text'
    }

    input.classList.add(CLASS_NAME_INPUT)
    input.setAttribute('maxlength', String(this._length))
    this._inputDefaults = new Map()
    const defaults = {
      autocapitalize: 'off',
      autocorrect: 'off',
      inputmode: this._type.inputmode,
      pattern: `${this._type.pattern.slice(0, -1)}{${this._length}}`,
      spellcheck: 'false'
    }

    for (const [attribute, value] of Object.entries(defaults)) {
      if (!input.hasAttribute(attribute)) {
        input.setAttribute(attribute, value)
        this._inputDefaults.set(attribute, value)
      }
    }

    if (!input.getAttribute('autocomplete')) {
      input.setAttribute('autocomplete', 'one-time-code')
    }

    // Filter any pre-filled value through the configured type
    if (input.value) {
      input.value = this._sanitize(input.value)
    }
  }

  protected _renderSlots(): void {
    const container = document.createElement('div')
    container.className = CLASS_NAME_SLOTS
    container.setAttribute('aria-hidden', 'true')

    const { groups } = this._config
    let groupIndex = 0
    let inGroup = 0

    for (let i = 0; i < this._length; i++) {
      const slot = document.createElement('div')
      slot.className = CLASS_NAME_SLOT
      container.append(slot)
      this._slots.push(slot)

      // Insert a visual separator between configured groups
      if (Array.isArray(groups) && groups.length > 0) {
        inGroup++
        if (inGroup === groups[groupIndex] && i < this._length - 1) {
          const separator = document.createElement('div')
          separator.className = CLASS_NAME_SEPARATOR
          separator.textContent = this._config.separator
          container.append(separator)
          groupIndex = Math.min(groupIndex + 1, groups.length - 1)
          inGroup = 0
        }
      }
    }

    this._slotsContainer = container
    this._element.append(container)
    this._element.classList.add(CLASS_NAME_RENDERED)
  }

  protected _addEventListeners(): void {
    // Listeners are attached with bare event names (not namespaced) because
    // `input`, `beforeinput`, `paste`, and `selectionchange` are not in
    // EventHandler's native-events list. Keep references to remove on dispose.
    this._inputListeners = {
      input: event => this._handleInput(event as unknown as InputEvent),
      compositionend: () => this._handleInput(),
      beforeinput: event => this._handleBeforeInput(event),
      keydown: event => this._handleKeydown(event as unknown as KeyboardEvent),
      paste: event => this._handlePaste(event),
      pointerdown: event => this._handlePointerDown(event),
      pointercancel: () => {
        this._touchPointer = false
      },
      click: event => this._handleClick(event)
    }
    this._inputListeners.focus = () => {
      if (this._leftWithWindow) {
        this._leftWithWindow = false
        this._render()
        return
      }

      if (this._pointerActive) {
        // A tap focused the input natively; position the caret on the clicked
        // slot now that focus has settled (doing this before native focus would
        // make iOS/iPadOS raise then immediately dismiss the keyboard)
        this._pointerActive = false
        this._selectSlot(this._pointerIndex)
        this._render()
        return
      }

      // Keyboard (Tab) focus lands on the first empty slot
      this._selectSlot(this._firstEmptyIndex())
      this._render()
    }

    const onSync = () => this._render()
    this._onSelectionChange = () => {
      if (this._isFocused()) {
        this._render()
      }
    }

    this._inputListeners.blur = () => {
      this._leftWithWindow = !document.hasFocus()
      this._render()
    }

    for (const type of ['keyup', 'select']) {
      this._inputListeners[type] = onSync
    }

    for (const [type, listener] of Object.entries(this._inputListeners)) {
      EventHandler.on(this._input, type, listener)
    }

    EventHandler.on(document, 'selectionchange', this._onSelectionChange)
    this._onReset = event => {
      const { target } = event
      if (target !== this._input.form) {
        return
      }

      // Wait for the browser to restore the default value.
      setTimeout(() => {
        if (event.defaultPrevented || target !== this._input?.form) {
          return
        }

        const sanitized = this._sanitize(this._input.value)
        if (sanitized !== this._input.value) {
          this._input.value = sanitized
        }

        this._commitValue(false)
      })
    }

    this._resetRoot = this._input.getRootNode() as Document | ShadowRoot
    this._resetRoot.addEventListener('reset', this._onReset, true)
  }

  protected _handleInput(event?: InputEvent): void {
    if (event?.isComposing) {
      return
    }

    const pending = this._pendingInsert
    this._pendingInsert = null
    if (pending) {
      this._input.value = pending.before
      this._input.setSelectionRange(pending.start, pending.end)
      this._insert(pending.text, false)
      return
    }

    const { value, selectionStart } = this._input
    const sanitized = this._sanitize(value)

    if (sanitized !== value) {
      this._input.value = sanitized
    }

    if (this._isFocused()) {
      const inputType = event?.inputType
      if (inputType === 'insertText' || inputType?.startsWith('delete')) {
        const caret = selectionStart ?? sanitized.length
        this._selectSlot(this._sanitize(value.slice(0, caret)).length)
      } else if (!inputType || inputType === 'insertReplacementText') {
        this._selectSlot(this._firstEmptyIndex())
      }
    }

    this._afterValueChange()
  }

  protected _handlePaste(event: CoreUIEvent): void {
    const pastedValue = event.clipboardData?.getData('text')
    if (!pastedValue || !this._isEditable()) {
      return
    }

    const transformed = this._config.pasteTransformer?.(pastedValue) ?? pastedValue
    const sanitized = this._sanitize(transformed)
    const { start, end } = this._insertRange(sanitized)
    const inserted = sanitized.slice(0, this._length - this._input.value.length + end - start)

    if (start === this._input.selectionStart && end === this._input.selectionEnd && inserted === pastedValue) {
      return
    }

    event.preventDefault()
    this._insert(pastedValue, true)
  }

  protected _handleBeforeInput(event: CoreUIEvent): void {
    const { inputType, data, isComposing, cancelable } = event as unknown as InputEvent
    if (this._executingCommand || isComposing || !this._isEditable()) {
      return
    }

    if (MULTI_CHARACTER_INPUT_TYPES.has(inputType) && (data === null || data.length > 1)) {
      this._handleMultiCharacterInput(event, data ?? (event as unknown as InputEvent).dataTransfer?.getData('text') ?? '', cancelable)
      return
    }

    if (inputType !== 'insertText' || data?.length !== 1) {
      return
    }

    const sanitized = this._sanitize(data)
    if (!sanitized) {
      event.preventDefault()
      return
    }

    // Let the browser replace the selection so edits keep native undo and input events.
    if (this._input.selectionStart === this._input.selectionEnd) {
      this._selectSlot(this._input.selectionStart ?? 0)
    }

    if (sanitized !== data) {
      event.preventDefault()
      this._writeText(sanitized, this._input.selectionStart ?? 0, this._input.selectionEnd ?? 0, true)
    }
  }

  protected _handleMultiCharacterInput(event: CoreUIEvent, text: string, cancelable: boolean): void {
    if (!text) {
      return
    }

    if (cancelable) {
      event.preventDefault()
      this._insert(text, true)
      return
    }

    this._pendingInsert = {
      before: this._input.value,
      start: this._input.selectionStart ?? this._input.value.length,
      end: this._input.selectionEnd ?? this._input.value.length,
      text
    }
  }

  protected _handleKeydown(event: KeyboardEvent): void {
    const { key, altKey, ctrlKey, metaKey, shiftKey, isComposing, defaultPrevented } = event
    if (defaultPrevented || isComposing || altKey || ctrlKey || metaKey || shiftKey || (key !== 'ArrowLeft' && key !== 'ArrowRight')) {
      return
    }

    // The visible slots run right to left, even when the code reads left to right.
    const isBackward = (key === 'ArrowRight') === (getComputedStyle(this._slotsContainer).direction === 'rtl')
    const start = this._input.selectionStart ?? 0
    const end = this._input.selectionEnd ?? start
    const rangeEdge = isBackward ? start : end
    const nextSlot = start + (isBackward ? -1 : 1)
    const index = end - start > 1 ? rangeEdge : nextSlot

    event.preventDefault()
    this._selectSlot(Math.min(index, this._firstEmptyIndex()))
    this._render()
  }

  protected _handleClick(event: CoreUIEvent): void {
    if (!this._touchPointer) {
      return
    }

    this._touchPointer = false
    const index = this._slotIndexFromPoint(event.clientX)
    if (index === null) {
      return
    }

    // WebKit reports a mouse click after a tap and updates the caret after the click.
    requestAnimationFrame(() => {
      if (this._input && this._isFocused()) {
        this._selectSlot(Math.min(index, this._firstEmptyIndex()))
        this._render()
      }
    })
  }

  protected _handlePointerDown(event: CoreUIEvent): void {
    // A disabled input still receives `pointerdown`, but never the focus that
    // would consume the remembered tap
    if (event.button !== 0 || this._input.matches(':disabled')) {
      return
    }

    this._touchPointer = event.pointerType === 'touch'
    const index = this._slotIndexFromPoint(event.clientX)
    if (index === null) {
      return
    }

    // Don't let the caret land past the first empty slot
    const target = Math.min(index, this._firstEmptyIndex())

    if (this._isFocused()) {
      // A touch click places the caret. Leave a long press to the browser.
      if (!this._touchPointer) {
        event.preventDefault()
        this._selectSlot(target)
        this._render()
      }

      return
    }

    // Not yet focused: let the browser focus the input natively so the
    // on-screen keyboard is raised by the user's tap. Position the caret in the
    // focus handler once focus settles.
    this._pointerActive = true
    this._pointerIndex = target
  }

  // Map a viewport x-coordinate to the slot under it, clamped to the last slot
  protected _slotIndexFromPoint(x: number): number | null {
    const rtl = getComputedStyle(this._slotsContainer).direction === 'rtl'
    for (const [index, slot] of this._slots.entries()) {
      const { left, right } = slot.getBoundingClientRect()
      if ((rtl ? x >= left : x <= right) || index === this._slots.length - 1) {
        return index
      }
    }

    return null
  }

  protected _insert(text: string, keepHistory: boolean): void {
    const transformed = this._config.pasteTransformer?.(text) ?? text
    // Sanitize before applying the length limit. The browser applies maxlength
    // to raw clipboard text before the input event, which can discard valid
    // characters that follow separators or whitespace.
    const sanitized = this._sanitize(transformed)
    const { start, end } = this._insertRange(sanitized)
    const inserted = sanitized.slice(0, this._length - this._input.value.length + end - start)

    if (!inserted) {
      return
    }

    this._writeText(inserted, start, end, keepHistory)
  }

  protected _insertRange(sanitized: string): { start: number, end: number } {
    if (sanitized.length === this._length) {
      return { start: 0, end: this._input.value.length }
    }

    const start = this._input.selectionStart ?? this._input.value.length
    return { start, end: this._input.selectionEnd ?? start }
  }

  protected _writeText(text: string, start: number, end: number, keepHistory: boolean): void {
    const input = this._input
    if (keepHistory && input.matches(':focus')) {
      input.setSelectionRange(start, end)
      // Use the browser's editing command to keep this paste in its undo history.
      this._executingCommand = true
      try {
        if (input.ownerDocument.execCommand('insertText', false, text)) {
          return
        }
      } finally {
        this._executingCommand = false
      }
    }

    input.setRangeText(text, start, end, 'end')
    input.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      composed: true,
      inputType: 'insertFromPaste',
      data: text
    }))
  }

  protected _afterValueChange(): void {
    if (this._commitValue() && this._input) {
      this._checkComplete()
    }
  }

  protected _commitValue(isEdit = true): boolean {
    const { value } = this._input
    const isChanged = value !== this._value
    this._value = value
    this._render()
    this._validation.update()

    if (!isEdit) {
      this._lastCompleteValue = this._completeValue()
    }

    if (isChanged) {
      EventHandler.trigger(this._element, EVENT_CHANGE, { value })
    }

    return isChanged
  }

  protected _settleValue(): void {
    this._value = this._input.value
    this._lastCompleteValue = this._completeValue()
    this._render()
    this._validation.update()
  }

  protected _setDisabled(disabled: boolean): void {
    if (this._input.disabled === disabled) {
      return
    }

    this._input.disabled = disabled
    this._render()
    this._validation.update()
  }

  protected _completeValue(): string | null {
    const { value } = this._input
    return value.length === this._length ? value : null
  }

  protected _isFocused(): boolean {
    return this._input.matches(':focus')
  }

  protected _firstEmptyIndex(): number {
    return Math.min(this._input.value.length, this._length - 1)
  }

  // `:disabled` also matches an input inside `<fieldset disabled>`, which the
  // `disabled` property doesn't
  protected _isEditable(): boolean {
    return !this._input.readOnly && !this._input.matches(':disabled')
  }

  // Represent the active slot as a selection: a filled slot is selected so the
  // next keystroke overwrites it; an empty slot gets a collapsed caret.
  protected _selectSlot(index: number): void {
    const clamped = Math.max(0, Math.min(index, this._length - 1))
    const end = clamped < this._input.value.length ? clamped + 1 : clamped
    this._input.setSelectionRange(clamped, end)
  }

  protected _sanitize(value: string): string {
    return value.normalize('NFKC').replace(this._type.filter, '').slice(0, this._length)
  }

  protected _render(): void {
    const { value, placeholder } = this._input
    const isFocused = this._isFocused()
    const start = this._input.selectionStart ?? value.length
    const end = this._input.selectionEnd ?? start
    const caret = Math.min(start, this._length - 1)

    for (const [index, slot] of this._slots.entries()) {
      const char = value[index] ?? ''
      const hint = placeholder.length === 1 ? placeholder : placeholder[index] ?? ''
      const text = char && this._config.mask ? MASK_CHARACTER : char || hint
      if (slot.textContent !== text) {
        slot.textContent = text
      }

      slot.classList.toggle(CLASS_NAME_SLOT_FILLED, Boolean(char))
      slot.classList.toggle(CLASS_NAME_SLOT_ACTIVE, isFocused && index === caret)
      slot.classList.toggle(CLASS_NAME_SLOT_SELECTED, isFocused && end - start > 1 && index >= start && index < end)
    }
  }

  protected _checkComplete(): void {
    const { value } = this._input
    const completeValue = this._completeValue()
    const changed = completeValue !== this._lastCompleteValue
    this._lastCompleteValue = completeValue

    if (completeValue && changed) {
      EventHandler.trigger(this._element, EVENT_COMPLETE, { value })

      const { form } = this._input
      if (this._config.autoSubmit && form && typeof form.requestSubmit === 'function') {
        form.requestSubmit()
      }
    }
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, OTPInput, config, args)
  }
}

/**
 * Data API implementation
 */

onDocumentReady(document, EVENT_DOM_CONTENT_LOADED_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_OTP)) {
    OTPInput.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(OTPInput)

export default OTPInput
export type { OtpInputConfig }
