/**
 * --------------------------------------------------------------------------
 * CoreUI chip-filter.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import Chip from './chip.js'
import ChipSet, { type ChipSetConfig } from './chip-set.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { onLabelClick } from './util/field-label.js'
import FieldValidation from './util/field-validation.js'
import { focusWithTemporaryTabindex } from './util/focus.js'
import {
  configureValueField, createValueField, dispatchValueChange, type ValidationState, writeValueField
} from './util/form-validation.js'
import { CHECK_ICON } from './util/icons.js'
import { rangeBetween } from './util/list-navigation.js'
import {
  defineJQueryPlugin, getUID, jQueryDispatch, writeAttribute
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'chip-filter'
const DATA_KEY = 'coreui.chip-filter'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_CHIP_SELECTED = 'selected.coreui.chip'
const EVENT_CHIP_DESELECTED = 'deselected.coreui.chip'

const A_KEY = 'a'

const SELECTOR_DATA_CHIP_FILTER = '[data-coreui-chip-filter]'
const SELECTOR_CHIP = '.chip'
const SELECTOR_CHIP_ACTIVE = '.chip.active'
const SELECTOR_CHIP_REMOVE = '.chip-remove'

const CLASS_NAME_ACTIVE = 'active'
const CLASS_NAME_CHIP_FILTER = 'chip-filter'
const CLASS_NAME_CHIP_SET = 'chip-set'
const CLASS_NAME_DISABLED = 'disabled'

const SELECTION_MODE_SINGLE = 'single'

const OMITTED_OPTIONS = new Set(['ariaAddedAnnouncement', 'ariaRemovedAnnouncement', 'ariaRemoveLabel', 'removable', 'removeIcon'])

const withoutOmitted = <T extends object>(options: T): any => Object.fromEntries(
  Object.entries(options).filter(([key]) => !OMITTED_OPTIONS.has(key))
)

type ChipFilterConfig = Omit<ChipSetConfig, 'ariaAddedAnnouncement' | 'ariaRemovedAnnouncement' | 'ariaRemoveLabel' | 'removable' | 'removeIcon'> & {
  id: string | null
  name: string | null
  required: boolean
  selectedIcon: string
  selectionMode: 'multiple' | 'single'
  validationState: ValidationState | null
}

const Default: ChipFilterConfig = {
  ...withoutOmitted(ChipSet.Default),
  id: null,
  name: null,
  required: false,
  selectedIcon: CHECK_ICON,
  selectionMode: 'multiple',
  validationState: null
}

const DefaultType: Record<string, string> = {
  ...withoutOmitted(ChipSet.DefaultType),
  id: '(string|null)',
  name: '(string|null)',
  required: 'boolean',
  selectedIcon: 'string',
  selectionMode: 'string',
  validationState: '(string|null|undefined)'
}

/**
 * Class definition
 */

class ChipFilter extends ChipSet {
  protected declare _anchor: HTMLElement | null
  protected declare _batching: boolean
  protected declare _byCode: boolean
  protected declare _initialSelection: string[]
  protected declare _reported: string
  protected declare _unlistenLabel: () => void
  protected declare _validation: FieldValidation
  protected declare _valueField: HTMLTextAreaElement | null

  constructor(element?: string | Element | null, config?: Partial<ChipFilterConfig> | null) {
    super(element, config as any)

    this._anchor = null
    this._batching = false
    this._byCode = false
    this._moveTabStop(this._getFocusableChips().find(chip => chip.classList.contains(CLASS_NAME_ACTIVE)) ?? null)
    this._element.classList.add(CLASS_NAME_CHIP_FILTER, CLASS_NAME_CHIP_SET)
    this._initialSelection = this.getSelectedValues()
    this._reported = this._initialSelection.join('\0')
    this._valueField = this._createValueField()
    this._validation = new FieldValidation(this._element, {
      config: () => this._config,
      fields: () => (this._valueField ? [this._valueField] : []),
      frames: () => [this._element],
      invalidTargets: () => [this._element],
      owned: () => [this._valueField].filter(Boolean) as Element[],
      restore: () => this._restoreSelection()
    })

    if (this._config.id) {
      this._element.id = this._config.id
    }

    this._nameFromLabel()
    this._unlistenLabel = onLabelClick(this._element, () => this._focusTarget()?.focus())
    writeAttribute(this._element, 'aria-required', this._config.required ? 'true' : null)
    this._validation.refresh()
  }

  // Getters
  static override get Default(): any {
    return Default
  }

  static override get DefaultType(): typeof DefaultType {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  selectChip(chip: HTMLElement): void {
    if (this._getChipElements().includes(chip)) {
      this._asCode(() => Chip.getInstance(chip)?.select())
    }
  }

  selectAll(): void {
    this._asCode(() => this._selectEvery())
  }

  deselectAll(): void {
    this._asCode(() => this._batchSelection(() => {
      for (const chip of this._getSelectedChipElements()) {
        Chip.getInstance(chip)?.deselect()
      }
    }))
  }

  getSelectedValues(): string[] {
    return this._getSelectedChipElements().map(chip => this._getChipValue(chip))
  }

  setValidationState(validationState: ValidationState | null): void {
    this._config = this._getConfig({ ...this._config, validationState })
    this._validation.configure({ validationState })
  }

  override dispose(): void {
    this._validation.dispose()
    this._unlistenLabel()
    this._valueField?.remove()

    super.dispose()
  }

  // Private
  override _containerRole(): string {
    return 'listbox'
  }

  override _chipRole(): string {
    return 'option'
  }

  override _syncRoles(leaving: HTMLElement | null = null): void {
    super._syncRoles(leaving)

    this._element.setAttribute('aria-orientation', 'horizontal')
    writeAttribute(this._element, 'aria-multiselectable', this._config.selectionMode === SELECTION_MODE_SINGLE ? null : 'true')
  }

  override _noteChange(): void {}

  override _getChipConfig(chip: HTMLElement): Record<string, any> {
    return {
      ...withoutOmitted(super._getChipConfig(chip)),
      filter: true,
      selectable: true,
      selected: Manipulator.getDataAttribute(chip, 'selected') === true,
      selectedIcon: this._config.selectedIcon
    }
  }

  override _addEventListeners(): void {
    super._addEventListeners()

    EventHandler.on(this._element, EVENT_CLICK, SELECTOR_CHIP, event => this._handleClick(event))
    EventHandler.on(this._element, EVENT_CHIP_SELECTED, SELECTOR_CHIP, event => this._handleSelectionChange(event))
    EventHandler.on(this._element, EVENT_CHIP_DESELECTED, SELECTOR_CHIP, event => this._handleSelectionChange(event))
  }

  override _handleCommandKey(event: any): boolean {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== A_KEY) {
      return false
    }

    if (this._selectsRange()) {
      event.preventDefault()
      this._selectEvery()
    }

    return true
  }

  override _moveFocus(target: HTMLElement | null, extend: boolean, origin: HTMLElement): void {
    if (!target) {
      return
    }

    if (extend && this._selectsRange()) {
      this._anchor ??= origin
      this._selectRange(this._anchor, target)
      return
    }

    this._anchor = target
  }

  override _handleChipRemoval(chip: HTMLElement, value: string): void {
    chip.classList.remove(CLASS_NAME_ACTIVE)
    super._handleChipRemoval(chip, value)
  }

  override _triggerChange(): void {
    this._asCode(() => this._reportSelection())
  }

  _asCode(run: () => void): void {
    const previous = this._byCode

    this._byCode = true
    run()
    this._byCode = previous
  }

  _selectEvery(): void {
    if (this._selectsRange()) {
      this._batchSelection(() => {
        for (const chip of this._getFocusableChips()) {
          Chip.getInstance(chip)?.select()
        }
      })
    }
  }

  _batchSelection(run: () => void): void {
    const outer = !this._batching

    this._batching = true
    run()

    if (outer) {
      this._batching = false
      this._reportSelection()
    }
  }

  _reportSelection(): void {
    const value = this.getSelectedValues()
    const key = value.join('\0')

    if (key === this._reported) {
      return
    }

    this._reported = key

    const isChanged = this._valueField ? writeValueField(this._valueField, value) : false

    if (!this._byCode) {
      this._validation.runAsUser(() => this._validation.change())
    }

    this._validation.update()
    EventHandler.trigger(this._element, EVENT_CHANGE, { value })

    if (isChanged) {
      dispatchValueChange(this._valueField!)
    }
  }

  _getSelectedChipElements(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_CHIP_ACTIVE, this._element as ParentNode)
  }

  _selectsRange(): boolean {
    return this._config.selectionMode !== SELECTION_MODE_SINGLE
  }

  _selectRange(from: HTMLElement, to: HTMLElement): void {
    const chips = this._getFocusableChips()

    this._batchSelection(() => {
      for (const chip of rangeBetween(chips, chips.indexOf(from), chips.indexOf(to))) {
        Chip.getInstance(chip)?.select()
      }
    })
  }

  _handleClick(event: any): void {
    const chip = (event.target as HTMLElement).closest(SELECTOR_CHIP) as HTMLElement | null

    if (!chip || chip.classList.contains(CLASS_NAME_DISABLED) || (event.target as HTMLElement).closest(SELECTOR_CHIP_REMOVE)) {
      return
    }

    if (event.shiftKey && this._selectsRange()) {
      this._selectRange(this._anchor ?? chip, chip)
      return
    }

    this._anchor = chip
  }

  _handleSelectionChange(event: any): void {
    if (this._batching) {
      return
    }

    const chip = (event.target as HTMLElement).closest(SELECTOR_CHIP) as HTMLElement | null

    if (this._config.selectionMode === SELECTION_MODE_SINGLE && chip?.classList.contains(CLASS_NAME_ACTIVE)) {
      this._batchSelection(() => {
        for (const other of this._getSelectedChipElements()) {
          if (other !== chip) {
            Chip.getInstance(other)?.deselect()
          }
        }
      })

      return
    }

    this._reportSelection()
  }

  _restoreSelection(): void {
    const start = new Set(this._initialSelection)

    this._asCode(() => this._batchSelection(() => {
      for (const chip of this._getChipElements()) {
        const instance = Chip.getInstance(chip)

        if (start.has(this._getChipValue(chip))) {
          instance?.select()
        } else {
          instance?.deselect()
        }
      }
    }))

    if (this._valueField) {
      writeValueField(this._valueField, this.getSelectedValues())
    }
  }

  _focusTarget(): HTMLElement | null {
    if (this._disabled) {
      return null
    }

    const target = this._getFocusableChips().find(chip => chip.tabIndex === 0)

    if (target) {
      return target
    }

    focusWithTemporaryTabindex(this._element)
    return null
  }

  _createValueField(): HTMLTextAreaElement {
    const field = createValueField('textarea', () => this._focusTarget(), this._element)
    const value = this.getSelectedValues()

    configureValueField(field, {
      disabled: this._disabled,
      name: this._config.name,
      required: this._config.required
    })
    field.defaultValue = value.join(',')
    writeValueField(field, value)
    this._element.append(field)

    return field
  }

  _nameFromLabel(): void {
    const { id } = this._element

    if (!id || this._element.hasAttribute('aria-label') || this._element.hasAttribute('aria-labelledby')) {
      return
    }

    const label = document.querySelector(`label[for="${CSS.escape(id)}"]`)

    if (label) {
      label.id ||= getUID(`${NAME}-label`)
      this._element.setAttribute('aria-labelledby', label.id)
    }
  }

  // Static
  static override jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, ChipFilter, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP_FILTER)) {
    ChipFilter.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(ChipFilter)

export default ChipFilter
export type { ChipFilterConfig }
