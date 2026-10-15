/**
 * --------------------------------------------------------------------------
 * CoreUI chip-input.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import Chip from './chip.js'
import ChipSet, { type ChipSetConfig } from './chip-set.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { splitChipText } from './util/chip-values.js'
import FieldValidation from './util/field-validation.js'
import { containsFocus } from './util/focus.js'
import { applyControlGroupClasses } from './util/form-control-group.js'
import {
  configureValueField, createValueField, dispatchValueChange, type ValidationState, writeValueField
} from './util/form-validation.js'
import {
  captureHostClasses, getUID, type HostClasses, isRTL, restoreHostClasses, writeAttribute
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'chip-input'
const DATA_KEY = 'coreui.chip-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_BLUR = `blur${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_FOCUS = `focus${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_PASTE = `paste${EVENT_KEY}`

const SELECTOR_DATA_CHIP_INPUT = '[data-coreui-chip-input]'
const SELECTOR_CHIP = '.chip'
const SELECTOR_CHIP_INPUT_LABEL = '.chip-input-label'
const SELECTOR_CHIP_REMOVE = '.chip-remove'

const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_CHIP_INPUT_FIELD = 'chip-input-field'
const CLASS_NAME_GROUP = 'form-control-group'

const HOST_CLASS_NAMES = [CLASS_NAME_DISABLED, CLASS_NAME_GROUP]

type ChipInputConfig = ChipSetConfig & {
  create: boolean
  createOnBlur: boolean
  id: string | null
  name: string | null
  placeholder: string
  readonly: boolean
  required: boolean
  separator: string | null
  validationState: ValidationState | null
}

const Default: ChipInputConfig = {
  ...ChipSet.Default,
  create: true,
  createOnBlur: true,
  id: null,
  name: null,
  placeholder: '',
  readonly: false,
  removable: true,
  required: false,
  separator: ',',
  unique: true,
  validationState: null
}

const DefaultType: Record<string, string> = {
  ...ChipSet.DefaultType,
  create: 'boolean',
  createOnBlur: 'boolean',
  id: '(string|null)',
  name: '(string|null)',
  placeholder: 'string',
  readonly: 'boolean',
  required: 'boolean',
  separator: '(string|null)',
  validationState: '(string|null|undefined)'
}

/**
 * Class definition
 *
 * ChipInput is a thin input layer on top of ChipSet: ChipSet owns the chips
 * (the single source of truth), while ChipInput only adds the text field, form
 * integration (value field) and turns typed text into chips. The public API
 * (methods + `*.coreui.chip-input` events) is preserved through overrides.
 */

class ChipInput extends ChipSet {
  protected declare _uniqueId: string
  protected declare _valueField: HTMLTextAreaElement | null
  protected declare _input: HTMLInputElement
  protected declare _inputDisabled: string | null
  protected declare _inputReadonly: string | null
  protected declare _hostClasses: HostClasses
  protected declare _initialChips: HTMLElement[]
  protected declare _removingByCode: boolean
  protected declare _validation: FieldValidation
  private _addedAriaRequired = false
  private _createdInput = false
  private _labelledFor: Element | null = null

  constructor(element?: string | Element | null, config?: Partial<ChipInputConfig> | null) {
    super(element, config)

    this._uniqueId = this._config.id ?? getUID(NAME)
    this._hostClasses = captureHostClasses(this._element, HOST_CLASS_NAMES)
    this._valueField = null
    this._removingByCode = false
    this._validation = new FieldValidation(this._element, {
      config: () => this._config,
      fields: () => (this._valueField ? [this._valueField] : []),
      frames: () => [this._element],
      invalidTargets: () => [this._input],
      owned: () => [this._valueField, this._input].filter(Boolean) as Element[],
      restore: () => this._restoreChips()
    })

    // The element is the frame: unlike the components that wrap a control, a
    // chip input has nothing to wrap, so it takes the frame class itself and
    // the author writes only what the field is.
    applyControlGroupClasses(this._element, CLASS_NAME_GROUP)

    this._input = SelectorEngine.findOne('input', this._element as ParentNode) as HTMLInputElement
    if (this._input) {
      this._setInputSize()
    } else {
      this._createInput()
    }

    this._inputDisabled = this._input.getAttribute('disabled')
    this._inputReadonly = this._input.getAttribute('readonly')
    this._applyInteractionState()

    // In the controlled mode (`create: false`) the chips come from the host —
    // a listbox selection, say — so typed text never becomes a chip and the
    // host owns the form value; no value field is rendered.
    if (this._config.create) {
      this._createValueField()
    }

    this._initialChips = this._getChipElements()
    this._addInputEventListeners()
    this._validation.refresh()
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
  override remove(chipOrValue: HTMLElement | string): boolean {
    const previous = this._removingByCode
    this._removingByCode = true

    try {
      return super.remove(chipOrValue)
    } finally {
      this._removingByCode = previous
    }
  }

  focus(): void {
    this._input?.focus()
  }

  setConfig(config: Partial<ChipInputConfig> | null): void {
    if (!config || !('validationState' in config)) {
      return
    }

    this._config = this._getConfig({ ...this._config, validationState: config.validationState })
    this._validation.configure({ validationState: config.validationState })
  }

  override dispose(): void {
    this._validation.dispose()
    restoreHostClasses(this._element, HOST_CLASS_NAMES, this._hostClasses)

    EventHandler.off(this._input, EVENT_KEY)
    this._valueField?.remove()

    if (this._createdInput) {
      this._input.remove()
      this._labelledFor?.removeAttribute('for')
    } else {
      writeAttribute(this._input, 'disabled', this._inputDisabled)
      writeAttribute(this._input, 'readonly', this._inputReadonly)

      if (this._addedAriaRequired) {
        this._input.removeAttribute('aria-required')
      }
    }

    super.dispose()
  }

  // Private

  // The container mixes a label, the text input and chips — it is neither a
  // listbox nor a plain group, so no container role is stamped and the chips
  // stay generic (their remove buttons carry the actions).
  override _applyAccessibilityRoles(): void {}

  override _canModify(): boolean {
    return !this._disabled && !this._config.readonly
  }

  // Chips live before the text field, not at the end of the set.
  override _appendChip(chip: HTMLElement): void {
    this._element.insertBefore(chip, this._input)
  }

  // Per-chip configuration based on the chip value and the input's
  // disabled/readonly state.
  override _getChipConfig(chip: HTMLElement): Record<string, any> {
    const disabled = this._disabled || Manipulator.getDataAttribute(chip, 'disabled') === true

    return {
      ariaRemoveLabel: `${this._config.ariaRemoveLabel} ${this._getChipValue(chip)}`.trim(),
      disabled,
      removable: this._config.removable && !this._config.readonly && !disabled,
      removeIcon: this._config.removeIcon,
      selectable: this._config.selectable
    }
  }

  // Keep the inherited chip instantiation and sync the remove button.
  override _setupChip(chip: HTMLElement): void {
    super._setupChip(chip)

    const removeButton = SelectorEngine.findOne(SELECTOR_CHIP_REMOVE, chip) as HTMLButtonElement
    if (removeButton) {
      removeButton.disabled = this._disabled || this._config.readonly
    }
  }

  override _getRemovalFocusTarget(chip: HTMLElement): HTMLElement {
    return this._input ?? super._getRemovalFocusTarget(chip)
  }

  override _handleChipRemoved(event: any): void {
    if (this._removingByCode) {
      super._handleChipRemoved(event)
      return
    }

    this._validation.runAsUser(() => super._handleChipRemoved(event))
  }

  override _noteChange(): void {
    super._noteChange()
    this._validation.change()
  }

  override _triggerChange(): void {
    const isChanged = this._valueField ? writeValueField(this._valueField, this.getValues()) : false

    this._validation.update()
    super._triggerChange()

    if (isChanged) {
      dispatchValueChange(this._valueField!)
    }
  }

  _restoreChips(): void {
    const values = this.getValues().join(',')
    let hadFocus = false

    for (const chip of this._getChipElements()) {
      if (!this._initialChips.includes(chip)) {
        hadFocus ||= containsFocus(chip)
        Chip.getInstance(chip)?.dispose()
        this._ownedChips.delete(chip)
        this._optionChips.delete(chip)
        chip.remove()
      }
    }

    let anchor: HTMLElement = this._input

    for (const chip of this._initialChips.toReversed()) {
      if (!this._element.contains(chip)) {
        this._element.insertBefore(chip, anchor)
        this._setupChip(chip)
      }

      anchor = chip
    }

    this._chips = this._initialChips.map(chip => this._getChipValue(chip))
    this._setInputSize()

    if (hadFocus) {
      this._input.focus()
    }

    if (this.getValues().join(',') !== values || this._valueField!.value !== this.getValues().join(',')) {
      this._triggerChange()
    }
  }

  _addInputEventListeners(): void {
    EventHandler.on(this._element, EVENT_KEYDOWN, (event: any) => {
      if (event.target === this._input) {
        return
      }

      // The arrow key past the last chip moves focus into the text field, which
      // sits after the chips (mirrors the input's "go to last chip" key). The
      // direction is mirrored in RTL.
      if (event.key === (isRTL(this._element) ? 'ArrowLeft' : 'ArrowRight')) {
        const chips = this._getFocusableChips()
        if (chips.length > 0 && chips[chips.length - 1].contains(event.target as Node)) {
          event.preventDefault()
          this._input.focus()
          return
        }
      }

      if (event.key.length === 1) {
        this._input.focus()
      }
    })
    EventHandler.on(this._input, EVENT_KEYDOWN, event => this._handleInputKeydown(event))
    EventHandler.on(this._input, EVENT_INPUT, event => this._handleInput(event))
    EventHandler.on(this._input, EVENT_PASTE, event => this._handlePaste(event))
    EventHandler.on(this._input, EVENT_FOCUS, () => this.clearSelection())

    if (this._config.createOnBlur) {
      EventHandler.on(this._input, EVENT_BLUR, (event: any) => {
        // Don't create chip if clicking on a chip
        if (!event.relatedTarget?.closest(SELECTOR_CHIP)) {
          this._createChipFromInput()
        }
      })
    }

    // Focus input when clicking container background
    EventHandler.on(this._element, EVENT_CLICK, (event: any) => {
      if (event.target === this._element) {
        this._input?.focus()
      }
    })
  }

  _createInput(): void {
    const input = document.createElement('input')
    const label = SelectorEngine.findOne(SELECTOR_CHIP_INPUT_LABEL, this._element as ParentNode)
    const labelFor = label?.getAttribute('for')
    const generatedInputId = labelFor || getUID(`${NAME}-input`)

    this._createdInput = true
    this._labelledFor = label && !labelFor ? label : null

    input.type = 'text'
    input.className = CLASS_NAME_CHIP_INPUT_FIELD
    input.id = generatedInputId
    if (this._config.placeholder) {
      input.placeholder = this._config.placeholder
    }

    if (label && !labelFor) {
      label.setAttribute('for', generatedInputId)
    }

    this._input = input
    this._setInputSize()
    this._element.append(input)
  }

  _createValueField(): void {
    const field = createValueField('textarea', () => this._input)

    field.id = this._uniqueId
    configureValueField(field, {
      disabled: this._disabled,
      name: this._config.name,
      readOnly: this._config.readonly,
      required: this._config.required
    })
    field.defaultValue = this.getValues().join(',')

    if (this._config.required && !this._input.hasAttribute('aria-required')) {
      this._input.setAttribute('aria-required', 'true')
      this._addedAriaRequired = true
    }

    this._element.append(field)
    this._valueField = field
  }

  _createChipFromInput(): void {
    if (!this._canModify() || !this._config.create) {
      return
    }

    const value = this._input.value.trim()
    if (value) {
      this._validation.runAsUser(() => this.add(value))
      this._input.value = ''
      this._setInputSize()
    }
  }

  _applyInteractionState(): void {
    const { readonly } = this._config
    this._element.classList.toggle(CLASS_NAME_DISABLED, this._disabled)
    // The container is a generic element, so `aria-disabled`/`aria-readonly`
    // are not allowed on it — the native input states carry the semantics.
    this._input.disabled = this._disabled
    this._input.readOnly = !this._disabled && readonly
  }

  _handleInputKeydown(event: any): void {
    const { key } = event

    switch (key) {
      case 'Enter': {
        event.preventDefault()
        this._createChipFromInput()
        break
      }

      case 'Backspace':
      case 'Delete': {
        if (this._input.value === '') {
          event.preventDefault()
          const chips = this._getChipElements()

          if (chips.length > 0) {
            chips[chips.length - 1].focus()
          }
        }

        break
      }

      case 'ArrowLeft':
      case 'ArrowRight': {
        // The arrow pointing toward the chips (left in LTR, right in RTL) jumps
        // to the last chip when the caret is at the start of the input.
        const towardChipsKey = isRTL(this._element) ? 'ArrowRight' : 'ArrowLeft'
        if (
          key === towardChipsKey &&
          this._input.selectionStart === 0 &&
          this._input.selectionEnd === 0
        ) {
          event.preventDefault()
          const chips = this._getChipElements()

          if (chips.length > 0) {
            chips[chips.length - 1].focus()
          }
        }

        break
      }

      case 'Escape': {
        this._input.value = ''
        this._input.blur()
        break
      }

      // No default
    }
  }

  _handleInput(event: any): void {
    if (!this._canModify()) {
      return
    }

    const parts = this._config.create ? splitChipText(event.target.value, this._config.separator) : null

    if (parts) {
      const rest = parts.pop() as string

      this._validation.runAsUser(() => {
        for (const part of parts) {
          this.add(part)
        }
      })

      this._input.value = rest
    }

    this._setInputSize()
    EventHandler.trigger(this._element, EVENT_INPUT, {
      value: this._input.value,
      relatedTarget: this._input
    })
  }

  _handlePaste(event: any): void {
    if (!this._canModify()) {
      return
    }

    if (!this._config.create || !this._config.separator) {
      return
    }

    const parts = splitChipText((event.clipboardData || (window as any).clipboardData).getData('text'), this._config.separator)

    if (parts) {
      event.preventDefault()

      this._validation.runAsUser(() => {
        for (const part of parts) {
          this.add(part)
        }
      })
    }
  }

  _setInputSize(): void {
    if (!this._input) {
      return
    }

    this._input.size = Math.max(this._input.placeholder.length, this._input.value.length) || 1
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP_INPUT)) {
    ChipInput.getOrCreateInstance(element)
  }
})

export default ChipInput
export type { ChipInputConfig }
