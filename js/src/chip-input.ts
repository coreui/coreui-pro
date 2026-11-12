/**
 * --------------------------------------------------------------------------
 * CoreUI chip-input.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import Chip from './chip.js'
import ChipSet, { type ChipSetConfig } from './chip-set.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { getNewChipPieces, removeChipText, splitChipText } from './util/chip-values.js'
import FieldValidation from './util/field-validation.js'
import { containsFocus } from './util/focus.js'
import { applyControlGroupClasses } from './util/form-control-group.js'
import {
  configureValueField, createValueField, dispatchValueChange, type ValidationState, writeValueField
} from './util/form-validation.js'
import {
  getUID, isRTL, writeAttribute
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
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_PASTE = `paste${EVENT_KEY}`

const SELECTOR_DATA_CHIP_INPUT = '[data-coreui-chip-input]'
const SELECTOR_CHIP = '.chip'
const SELECTOR_CHIP_INPUT_LABEL = '.chip-input-label'
const SELECTOR_CHIP_REMOVE = '.chip-remove'
const SELECTOR_CHIP_ROW = '.chip-row'

const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_CHIP_INPUT_FIELD = 'chip-input-field'
const CLASS_NAME_CHIP_INPUT_GRID = 'chip-input-grid'
const CLASS_NAME_GROUP = 'form-control-group'

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
  private _text = ''
  protected declare _initialChips: HTMLElement[]
  protected declare _validation: FieldValidation
  private _createdInput = false
  private _labelledFor: Element | null = null
  private _hostName: Array<[string, string]> = []
  private _gridName: Array<[string, string]> = []
  protected declare _grid: HTMLElement

  constructor(element?: string | Element | null, config?: Partial<ChipInputConfig> | null) {
    super(element, config)

    this._uniqueId = this._config.id ?? getUID(NAME)
    this._valueField = null
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

    this._applyInteractionState()
    this._createGrid()

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
  focus(): void {
    this._input?.focus()
  }

  setValidationState(validationState: ValidationState | null): void {
    this._setConfig({ validationState })
  }

  override dispose(): void {
    this._validation.dispose()

    this._grid.replaceWith(...this._grid.childNodes)
    for (const [name, value] of this._hostName) {
      this._element.setAttribute(name, value)
    }

    EventHandler.off(this._input, EVENT_KEY)
    this._valueField?.remove()

    if (this._createdInput) {
      this._input.remove()
      this._labelledFor?.removeAttribute('for')
    }

    super.dispose()
  }

  // Private
  _setConfig(config: Partial<ChipInputConfig> | null): void {
    if (!config || !('validationState' in config)) {
      return
    }

    this._config = this._getConfig({ ...this._config, validationState: config.validationState })
    this._validation.configure()
  }

  override _containerRole(leaving: HTMLElement | null = null): string | null {
    return this._getFocusableChips().some(chip => chip !== leaving) ? 'grid' : null
  }

  override _chipRole(): string | null {
    return this._canModify() && this._config.removable ? 'gridcell' : null
  }

  override _roleElement(): HTMLElement | null {
    return this._grid ?? null
  }

  override _syncRoles(leaving: HTMLElement | null = null): void {
    super._syncRoles(leaving)

    if (this._grid) {
      const isNamed = this._grid.hasAttribute('role')

      for (const [name, value] of this._gridName) {
        writeAttribute(this._grid, name, isNamed ? value : null)
      }
    }
  }

  override _canModify(): boolean {
    return !this._disabled && !this._config.readonly
  }

  // Chips live before the text field, not at the end of the set.
  override _appendChip(chip: HTMLElement): void {
    this._grid.append(chip)
  }

  // Per-chip configuration based on the chip value and the input's
  // disabled/readonly state.
  override _getChipConfig(chip: HTMLElement): Record<string, any> {
    const config = super._getChipConfig(chip)
    const disabled = this._disabled || config.disabled

    return { ...config, disabled, removable: config.removable && !this._config.readonly && !disabled }
  }

  // Keep the inherited chip instantiation and sync the remove button.
  override _setupChip(chip: HTMLElement): void {
    super._setupChip(chip)

    const removeButton = SelectorEngine.findOne(SELECTOR_CHIP_REMOVE, chip) as HTMLButtonElement
    if (removeButton) {
      removeButton.disabled = this._disabled || this._config.readonly
    }
  }

  override _getRemovalFallback(): HTMLElement {
    return this._input ?? super._getRemovalFallback()
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

    this._text = ''
    let hadFocus = false

    for (const chip of this._getChipElements()) {
      if (!this._initialChips.includes(chip)) {
        hadFocus ||= containsFocus(chip)
        Chip.getInstance(chip)?.dispose()
        this._ownedChips.delete(chip)

        const row = this._chipRoot(chip)
        row.remove()
      }
    }

    let anchor: Element | null = null

    for (const chip of this._initialChips.toReversed()) {
      if (!this._element.contains(chip)) {
        this._grid.insertBefore(chip, anchor)
        this._setupChip(chip)
      }

      anchor = this._chipRoot(chip)
    }

    this._syncRoles()

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
      if (
        event.key === (isRTL(this._element) ? 'ArrowLeft' : 'ArrowRight') &&
        this._getFocusableChips().at(-1)?.contains(event.target as Node)
      ) {
        event.preventDefault()
        this._input.focus()
        return
      }

      if (event.key?.length === 1) {
        this._input.focus()
      }
    })
    EventHandler.on(this._input, EVENT_KEYDOWN, event => this._handleInputKeydown(event))
    EventHandler.on(this._input, EVENT_INPUT, event => this._handleInput(event))
    EventHandler.on(this._input, EVENT_PASTE, event => this._handlePaste(event))

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

    input.type = 'text'
    input.className = CLASS_NAME_CHIP_INPUT_FIELD
    input.id = generatedInputId
    if (this._config.placeholder) {
      input.placeholder = this._config.placeholder
    }

    if (label && !labelFor) {
      label.setAttribute('for', generatedInputId)
      this._labelledFor = label
    }

    for (const name of ['aria-label', 'aria-labelledby']) {
      const value = this._element.getAttribute(name)

      if (value) {
        input.setAttribute(name, value)
      }
    }

    this._input = input
    this._setInputSize()
    this._element.append(input)
  }

  _createGrid(): void {
    const grid = document.createElement('div')
    const label = SelectorEngine.findOne(SELECTOR_CHIP_INPUT_LABEL, this._element as ParentNode)

    grid.className = CLASS_NAME_CHIP_INPUT_GRID

    for (const name of ['aria-label', 'aria-labelledby']) {
      const value = this._element.getAttribute(name)

      if (value) {
        this._gridName.push([name, value])
        this._hostName.push([name, value])
        this._element.removeAttribute(name)
      }
    }

    if (label && this._hostName.length === 0) {
      label.id ||= getUID(`${NAME}-label`)
      this._gridName.push(['aria-labelledby', label.id])
    }

    this._element.insertBefore(grid, this._input)
    grid.append(...SelectorEngine.find(`${SELECTOR_CHIP_ROW}, ${SELECTOR_CHIP}`, this._element as ParentNode).filter(element => element.parentElement === this._element))
    this._grid = grid
    this._syncRoles()
  }

  _createValueField(): void {
    const field = createValueField('textarea', () => this._input, this._element)

    field.id = this._uniqueId
    configureValueField(field, {
      disabled: this._disabled,
      name: this._config.name,
      readOnly: this._config.readonly,
      required: this._config.required
    })
    field.defaultValue = this.getValues().join(',')

    this._element.append(field)
    this._valueField = field
  }

  _createChipFromInput(): void {
    if (!this._canModify() || !this._config.create) {
      return
    }

    const text = this._input.value

    if (text.trim()) {
      this._addPieces(splitChipText(text, this._config.separator) ?? [text], text)
    } else {
      this._writeText('')
    }
  }

  _addPieces(pieces: string[], text: string): void {
    const added: string[] = []

    for (const piece of pieces) {
      const count = this._chips.length

      this.add(piece)

      if (this._chips.length > count) {
        added.push(piece.trim())
      }
    }

    this._writeText(removeChipText(text, added, this._config.separator))
  }

  _writeText(text: string): void {
    this._input.value = text
    this._text = text
    this._setInputSize()
  }

  _applyInteractionState(): void {
    const { readonly } = this._config
    this._element.classList.toggle(CLASS_NAME_DISABLED, this._disabled)
    // The container is a generic element, so `aria-disabled`/`aria-readonly`
    // are not allowed on it — the native input states carry the semantics.
    this._input.disabled = this._disabled
    this._input.readOnly = !this._disabled && readonly
    writeAttribute(this._input, 'aria-required', this._config.create && this._config.required ? 'true' : null)
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
          this._getChipElements().at(-1)?.focus()
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
          this._getChipElements().at(-1)?.focus()
        }

        break
      }

      case 'Escape': {
        this._writeText('')
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

    const text = event.target.value
    const pieces = this._config.create ? getNewChipPieces(text, this._text, this._config.separator) : []

    if (pieces.length > 0) {
      this._addPieces(pieces, text)
    } else {
      this._writeText(text)
    }

    EventHandler.trigger(this._element, EVENT_INPUT, {
      value: this._input.value,
      relatedTarget: this._input
    })
  }

  _handlePaste(event: any): void {
    if (!this._canModify() || !this._config.create || !this._config.separator) {
      return
    }

    const parts = splitChipText((event.clipboardData || (window as any).clipboardData).getData('text'), this._config.separator)

    if (parts) {
      event.preventDefault()
      this._addPieces(parts, [this._input.value, ...parts].filter(Boolean).join(this._config.separator))
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
