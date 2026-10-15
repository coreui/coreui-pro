/**
 * --------------------------------------------------------------------------
 * CoreUI PRO multi-select.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import Chip from './chip.js'
import ChipSet from './chip-set.js'
import ComboboxBase from './combobox-base.js'
import Data from './dom/data.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import FieldValidation from './util/field-validation.js'
import { containsFocus } from './util/focus.js'
import FocusTrap from './util/focustrap.js'
import { type ValidationState } from './util/form-validation.js'
import { CLEANER_ICON, PICKER_ICON } from './util/icons.js'
import { isTypingKey } from './util/list-navigation.js'
import { flattenOptions, getSelectableOptions, isOptionGroup } from './util/option-tree.js'
import {
  type CountLabel, fillSelection, getAriaPressed, getSelectionLimit, getSelectionState,
  resolveCountLabel, type SelectionState
} from './util/selection-state.js'
import {
  DefaultAllowlist, sanitizeByConfig, type SanitizerAllowList, SVGAllowlist
} from './util/sanitizer.js'
import {
  captureHostClasses, defineJQueryPlugin, getUID, type HostClasses, jQueryDispatch, restoreHostClasses, writeAttribute
} from './util/index.js'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'multi-select'
const DATA_KEY = 'coreui.multi-select'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ARROW_DOWN_KEY = 'ArrowDown'
const ARROW_UP_KEY = 'ArrowUp'
const BACKSPACE_KEY = 'Backspace'
const DELETE_KEY = 'Delete'
const ENTER_KEY = 'Enter'
const ESCAPE_KEY = 'Escape'
const TAB_KEY = 'Tab'
const RIGHT_MOUSE_BUTTON = 2 // MouseEvent.button value for the secondary button, usually the right button

const SELECTOR_CHIP_REMOVE = '.chip-remove'
const SELECTOR_CHIP = '.chip'
const SELECTOR_CLEANER = '.form-control-cleaner'
const SELECTOR_OPTION = '.list-box-option'
const SELECTOR_SEARCH = '.form-multi-select-search'
const SELECTOR_SELECT_ALL = '[data-coreui-select-all]'
const SELECTOR_TEXT_ENTRY = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
const SELECTOR_DATA_MULTI_SELECT = '[data-coreui-multi-select]'
// The class-based selector stays alongside the data attribute: pages relying
// on class-only auto-init keep working (the v6 bet).
const SELECTOR_SELECT = 'select.form-multi-select'
const SELECTOR_SELECTION = '.form-multi-select-selection'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_FOCUS = `focus${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_KEYUP = `keyup${EVENT_KEY}`
const EVENT_SEARCH = `search${EVENT_KEY}`
const EVENT_SELECTION_LIMIT = `selectionLimit${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_CHIP_REMOVE = 'remove.coreui.chip'

const CLASS_NAME_CHIP = 'chip'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_HEADER = 'list-box-header'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_SELECT = 'form-multi-select'
const HOST_ATTRIBUTES = ['aria-hidden', 'disabled', 'id', 'multiple', 'name', 'required', 'tabindex']
const CLASS_NAME_SELECT_FILLED = 'form-multi-select-filled'
const CLASS_NAME_SELECT_ALL = 'list-box-select-all'
const CLASS_NAME_SEARCH = 'form-multi-select-search'
const CLASS_NAME_SELECTED = 'selected'
const CLASS_NAME_INDETERMINATE = 'indeterminate'
const CLASS_NAME_SELECTION = 'form-multi-select-selection'
const CLASS_NAME_SELECTION_TAGS = 'form-multi-select-selection-tags'
const CLASS_NAME_SHOW = 'show'
const HOST_CLASS_NAMES = [CLASS_NAME_DISABLED, CLASS_NAME_SELECT]

type MultiSelectConfig = {
  allowList: SanitizerAllowList
  ariaCleanerLabel: string
  ariaPickerLabel: string
  ariaSearchLabel: string
  ariaTagDeleteLabel: string
  cleaner: boolean
  clearSearchOnSelect: boolean
  container: Element | boolean | string
  deselectAllLabel: string
  deselectFilteredLabel: string
  disabled: boolean
  globalSearch: boolean
  headerTemplate: ((state: any, actions: any) => string | Node) | null
  hideSelectAllOnSearchNoResults: boolean
  id: string | null
  indicator: 'checkbox' | 'none'
  invalid: boolean
  multiple: boolean
  name: string | null
  options: false | any[]
  optionsGroupsSelectable: boolean
  optionsGroupsTemplate: ((group: any) => string) | null
  optionsMaxHeight: number | string
  optionsTemplate: ((option: any) => string) | null
  pickerIcon: string | boolean
  placeholder: string
  required: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  search: boolean
  searchNoResultsLabel: string
  selectAll: boolean
  selectAllLabel: string
  selectAllMode: 'all' | 'filtered'
  selectedLabel: CountLabel
  selectFilteredLabel: string
  selectionLimit: number | null
  selectionType: 'chips' | 'counter' | 'tags' | 'text'
  valid: boolean
  validationState: ValidationState | null
  value: number | string | string[] | null
}

const Default: MultiSelectConfig = {
  allowList: DefaultAllowlist as SanitizerAllowList,
  ariaCleanerLabel: 'Clear all selections',
  ariaPickerLabel: 'Toggle options list',
  ariaSearchLabel: 'Search',
  ariaTagDeleteLabel: 'Remove',
  cleaner: true,
  clearSearchOnSelect: false,
  container: false,
  deselectAllLabel: 'Deselect all',
  deselectFilteredLabel: 'Deselect filtered',
  disabled: false,
  globalSearch: true,
  headerTemplate: null,
  hideSelectAllOnSearchNoResults: true,
  id: null,
  indicator: 'checkbox',
  invalid: false,
  multiple: true,
  name: null,
  options: false,
  optionsGroupsSelectable: false,
  optionsGroupsTemplate: null,
  optionsMaxHeight: 'auto',
  optionsTemplate: null,
  pickerIcon: true,
  placeholder: 'Select...',
  required: false,
  sanitize: true,
  sanitizeFn: null,
  search: false,
  searchNoResultsLabel: 'No results found',
  selectAll: true,
  selectAllLabel: 'Select all',
  selectAllMode: 'all',
  selectedLabel: (count: number) => `${count} item(s) selected`,
  selectFilteredLabel: 'Select filtered',
  selectionLimit: null,
  selectionType: 'tags',
  valid: false,
  validationState: null,
  value: null
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaPickerLabel: 'string',
  ariaSearchLabel: 'string',
  ariaTagDeleteLabel: 'string',
  cleaner: 'boolean',
  clearSearchOnSelect: 'boolean',
  container: '(string|element|boolean)',
  deselectAllLabel: 'string',
  deselectFilteredLabel: 'string',
  disabled: 'boolean',
  globalSearch: 'boolean',
  headerTemplate: '(function|null)',
  hideSelectAllOnSearchNoResults: 'boolean',
  id: '(string|null)',
  indicator: 'string',
  invalid: 'boolean',
  multiple: 'boolean',
  name: '(string|null)',
  options: '(boolean|array)',
  optionsGroupsSelectable: 'boolean',
  optionsGroupsTemplate: '(function|null)',
  optionsMaxHeight: '(number|string)',
  optionsTemplate: '(function|null)',
  pickerIcon: '(string|boolean)',
  placeholder: 'string',
  required: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  search: 'boolean',
  searchNoResultsLabel: 'string',
  selectAll: 'boolean',
  selectAllLabel: 'string',
  selectAllMode: 'string',
  selectedLabel: '(string|function)',
  selectFilteredLabel: 'string',
  selectionLimit: '(number|null)',
  selectionType: 'string',
  valid: 'boolean',
  validationState: '(string|null|undefined)',
  value: '(string|array|null)'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

// The selection area rides ChipSet for what it owns — arrow-key navigation
// across the chips and keyboard removal — while the selection model stays the
// component's. The container mixes chips with the search input, so it carries
// no role (the ChipInput precedent), and MultiSelect keeps managing the chips
// itself: Chip.getOrCreateInstance makes both sides meet on one instance.
class MultiSelectChipSet extends ChipSet {
  override _applyAccessibilityRoles(): void {}
}

class MultiSelect extends ComboboxBase {
  protected declare _uniqueName: any
  protected declare _hostAttributes: Map<string, string | null>
  protected declare _hostClasses: HostClasses
  protected declare _initialSelection: any[]
  protected declare _validation: FieldValidation
  protected declare _indicatorElement: any
  protected declare _selectAllElement: any
  protected declare _selectAllLabelElement: any
  protected declare _dropdownHeaderElement: any
  protected declare _headerElement: any
  protected declare _selectionElement: any
  protected declare _selectionChipSet: any
  protected declare _selectionCleanerElement: any
  protected declare _searchElement: any
  protected declare _wrapperElement: any
  protected declare _focustrap: any
  protected declare _pointerDownListener: any
  protected declare _refocusOnHide: boolean
  protected declare _nativeFocusHandler: any
  protected declare _nativeKeydownHandler: any

  constructor(element?: string | Element | null, config?: Partial<MultiSelectConfig> | null) {
    super(element, config)

    this._hostAttributes = new Map(HOST_ATTRIBUTES.map(name => [name, this._element.getAttribute(name)]))
    this._hostClasses = captureHostClasses(this._element, HOST_CLASS_NAMES)
    this._validation = new FieldValidation(this._element, {
      aliases: true,
      config: () => this._config,
      fields: () => [this._element as HTMLSelectElement],
      frames: () => [this._wrapperElement],
      invalidTargets: () => [this._getFocusTarget()],
      owned: () => [this._element, this._searchElement].filter(Boolean),
      restore: () => this._restoreSelection()
    })
    this._indicatorElement = null
    this._selectAllElement = null
    this._dropdownHeaderElement = null
    this._headerElement = null
    this._selectionElement = null
    this._selectionCleanerElement = null
    this._searchElement = null
    this._togglerElement = null
    this._optionsElement = null

    this._wrapperElement = null
    this._menu = null
    this._nativeFocusHandler = null
    this._nativeKeydownHandler = null
    this._selected = []
    this._options = this._getOptions()
    this._configureNativeSelect()
    this._floatingCleanup = null
    this._anchoredPosition = null
    this._search = ''

    if (this._config.options.length > 0) {
      this._createNativeOptions(this._element, this._options)
    }

    this._createSelect()
    this._initialSelection = [...this._selected]
    this._addEventListeners()
    Data.set(this._element, DATA_KEY, this)
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

  override _escapeFocusTarget(): HTMLElement | null {
    return this._config.search ? this._searchElement : this._togglerElement
  }

  override _getShowTarget(): HTMLElement {
    return this._wrapperElement
  }

  override _afterShow(): void {
    if (!this._isShown()) {
      return
    }

    this._focustrap = new FocusTrap({
      additionalElement: this._config.search ? this._searchElement : null,
      autofocus: false,
      trapElement: this._menu
    })
    this._focustrap.activate()

    // A press outside fires focusin before the click that closes the panel.
    this._pointerDownListener = (event: any) => {
      if (this._wrapperElement.contains(event.target) || this._menu.contains(event.target)) {
        return
      }

      this._focustrap?.deactivate()

      // A right click or a scrollbar drag closes nothing, so the trap comes back.
      const rearm = () => {
        document.removeEventListener('pointerup', rearm, true)

        if (this._isShown()) {
          this._focustrap?.activate()
        }
      }

      document.addEventListener('pointerup', rearm, true)
    }

    document.addEventListener('pointerdown', this._pointerDownListener, true)

    if (this._config.search) {
      this._searchElement.focus()
      return
    }

    this._focusListBox()
  }

  _focusListBox(): void {
    if (!this._listBox) {
      return
    }

    // A query puts its first match first; only an empty one restores the selection.
    if (this._listBox.getActive() === null && !this._searchElement?.value) {
      const selected = SelectorEngine.findOne(`${SELECTOR_OPTION}.${CLASS_NAME_SELECTED}:not([hidden])`, this._menu)

      if (selected?.dataset.coreuiValue) {
        this._listBox.setActive(selected.dataset.coreuiValue)
      }
    }

    this._listBox.focusActive()

    if (!containsFocus(this._menu)) {
      this._menu.focus()
    }
  }

  _releaseFocus(): void {
    if (this._pointerDownListener) {
      document.removeEventListener('pointerdown', this._pointerDownListener, true)
      this._pointerDownListener = null
    }

    this._focustrap?.deactivate()
    this._focustrap = null
  }

  override _onHideStart(): void {
    this._releaseFocus()

    this._refocusOnHide = containsFocus(this._wrapperElement) || containsFocus(this._menu)
  }

  override _afterHideDispose(): void {
    if (this._config.search) {
      this._searchElement.value = ''
    }

    this._onSearchChange(this._searchElement)
  }

  override _onHideEnd(): void {
    if (this._refocusOnHide && !this._config.disabled) {
      const refocusTarget = this._config.search ? this._searchElement : this._togglerElement
      if (refocusTarget) {
        refocusTarget.focus()
      }
    }
  }

  override dispose(): void {
    this._validation.dispose()
    this._destroySelect()

    for (const [name, value] of this._hostAttributes) {
      writeAttribute(this._element, name, value)
    }

    restoreHostClasses(this._element, HOST_CLASS_NAMES, this._hostClasses)
    super.dispose()
  }

  search(text: string): void {
    this._search = text.length > 0 ? text.toLowerCase() : text
    this._filterOptionsList()
    EventHandler.trigger(this._element, EVENT_SEARCH)
  }

  setConfig(config: Partial<MultiSelectConfig> | null): void {
    this._config = this._getConfig({ ...this._config, ...config })

    if (this._validation.configure(config)) {
      return
    }

    const previous = this._selected
    const keep = !config || !('options' in config || 'value' in config)

    this._selected = []

    if (!keep) {
      (this._element as HTMLSelectElement).selectedIndex = -1
    }

    this._options = this._getOptions()
    this._selected = keep ? previous : this._selected
    this._destroySelect()
    this._element.innerHTML = ''
    this._configureNativeSelect()
    this._createNativeOptions(this._element, this._options)
    this._createSelect()
    this._addEventListeners()

    const next = this._selected

    this._selected = previous
    this._commit(next)
  }

  selectAll(options: any[] = this._options): void {
    this._selectUpToLimit(this._enabledOptions(options))
  }

  deselectAll(options?: any[]): void {
    const values = options ? new Set(this._enabledOptions(options).map((option: any) => String(option.value))) : null

    this._commit(this._selected.filter((option: any) => option.disabled === true || (values !== null && !values.has(option.value))))
  }

  selectFiltered(): void {
    const options = this._getDisplayedItems()
      .map(item => this._findOptionByValue(String(item.dataset.coreuiValue)))
      .filter(Boolean)

    this._selectUpToLimit(options)
  }

  deselectFiltered(): void {
    const values = new Set(this._getDisplayedItems().map(item => String(item.dataset.coreuiValue)))

    this._commit(this._selected.filter((option: any) => !values.has(option.value)))
  }

  getValue(): any {
    return this._selected
  }

  // Private

  _destroySelect(): void {
    this._releaseFocus()
    this._disposeFloating()
    this._disposeListBox()
    this._disposeSelection()

    for (const element of [
      this._wrapperElement,
      this._menu,
      this._selectionElement,
      this._togglerElement,
      this._searchElement,
      this._indicatorElement,
      this._selectAllElement,
      this._headerElement,
      this._optionsElement
    ]) {
      if (element) {
        EventHandler.off(element, EVENT_KEY)
      }
    }

    if (this._menu) {
      this._menu.remove()
    }

    if (this._wrapperElement) {
      this._wrapperElement.before(this._element)
      this._wrapperElement.remove()
    }
  }

  _addEventListeners(): void {
    // Selections are real Chip instances: cancel the chip's own
    // removal and route it through the selection model, which re-renders.
    EventHandler.on(this._selectionElement, EVENT_CHIP_REMOVE, SELECTOR_CHIP, (event: any) => {
      event.preventDefault()

      const chip = event.target.closest(SELECTOR_CHIP)
      if (chip) {
        this._validation.runAsUser(() => this._deselectOption(String(chip.dataset.value)))
      }
    })

    EventHandler.on(this._togglerElement, EVENT_CLICK, SELECTOR_CLEANER, (event: any) => {
      if (!this._config.disabled) {
        event.preventDefault()
        event.stopPropagation()
        this._validation.runAsUser(() => this.deselectAll())
      }
    })

    EventHandler.on(this._wrapperElement, EVENT_CLICK, () => {
      if (!this._config.disabled) {
        this.show()
      }
    })

    EventHandler.on(this._wrapperElement, EVENT_KEYDOWN, (event: any) => {
      if (event.key === ESCAPE_KEY) {
        if (this._isShown()) {
          event.preventDefault()
          event.stopPropagation()
        }

        this.hide()
        return
      }

      if (this._isShown() && event.target === this._searchElement) {
        if (event.key === ARROW_DOWN_KEY || event.key === ARROW_UP_KEY) {
          event.preventDefault()

          if (event.key === ARROW_UP_KEY && this._listBox?.getActive() === null) {
            this._listBox.last()
            return
          }

          this._focusListBox()
          return
        }

        if (event.key === ENTER_KEY) {
          const stop = SelectorEngine.findOne(`${SELECTOR_OPTION}[tabindex="0"]`, this._menu)

          if (stop?.dataset.coreuiValue) {
            event.preventDefault()
            this._listBox?.toggle(stop.dataset.coreuiValue)
          }

          return
        }
      }

      if (
        this._routesTypingToSearch() &&
        isTypingKey(event)
      ) {
        this._searchElement.focus()
      }
    })

    EventHandler.on(this._menu, EVENT_KEYDOWN, (event: any) => {
      if (
        this._routesTypingToSearch() &&
        isTypingKey(event) &&
        !(event.target as HTMLElement).closest(SELECTOR_TEXT_ENTRY)
      ) {
        this._searchElement.focus()
      }
    })

    this._addTogglerKeydownListeners()

    // Validation focuses the overlay select; hand its keystrokes to the custom control.
    if (this._nativeKeydownHandler) {
      EventHandler.off(this._element, EVENT_KEYDOWN, this._nativeKeydownHandler)
    }

    this._nativeKeydownHandler = (event: any) => {
      if (event.key === TAB_KEY || event.key === ESCAPE_KEY) {
        return
      }

      // Suppress the native select's own keyboard behavior (typeahead, value change).
      event.preventDefault()

      const isPrintable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey

      if (!this._isShown() && (event.key === ENTER_KEY || event.key === ARROW_DOWN_KEY || (this._config.search && isPrintable))) {
        this.show()
      }

      if (this._config.search) {
        this._searchElement.focus()

        // The keystroke can't be retargeted mid-event, so inject the character that
        // would otherwise be lost and start filtering on this first press.
        if (isPrintable) {
          this._searchElement.value += event.key
          this._onSearchChange(this._searchElement)
        }
      } else {
        this._togglerElement.focus()
      }
    }

    EventHandler.on(this._element, EVENT_KEYDOWN, this._nativeKeydownHandler)

    if (this._nativeFocusHandler) {
      EventHandler.off(this._element, EVENT_FOCUS, this._nativeFocusHandler)
    }

    this._nativeFocusHandler = () => {
      this._getFocusTarget().focus()
    }

    EventHandler.on(this._element, EVENT_FOCUS, this._nativeFocusHandler)

    EventHandler.on(this._indicatorElement, EVENT_CLICK, (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      this.toggle()
    })

    EventHandler.on(this._searchElement, EVENT_KEYUP, () => {
      this._onSearchChange(this._searchElement)
    })

    EventHandler.on(this._searchElement, EVENT_KEYDOWN, (event: any) => {
      if ((!this._isShown() && event.key.length === 1 && !event.ctrlKey && !event.metaKey) || event.key === ARROW_DOWN_KEY) {
        this.show()
      }

      if ((event.key === BACKSPACE_KEY || event.key === DELETE_KEY) && event.target.value.length === 0) {
        this._deselectLastOption()
      }

      this._searchElement.focus()
    })

    if (this._selectAllElement) {
      // Bound on the panel, which the capture phase reaches before the list's
      // own delegated handler — the scope stays this component's to decide.
      EventHandler.on(this._menu, EVENT_CLICK, SELECTOR_SELECT_ALL, (event: any) => {
        event.preventDefault()
        event.stopPropagation()

        if (!this._config.disabled) {
          this._validation.runAsUser(() => this._toggleSelectAll())
        }
      })
    }
  }

  _getOptions(): any[] {
    return this._getOptionsFromConfig(this._config.options || this._getOptionsFromElement())
  }

  _getOptionsFromConfig(options: any = this._config.options, disabled = false): any[] {
    const _options = []
    for (const option of options) {
      if (isOptionGroup(option)) {
        const customGroupProperties = { ...option }

        delete customGroupProperties.label
        delete customGroupProperties.options

        _options.push({
          ...customGroupProperties,
          label: option.label,
          options: this._getOptionsFromConfig(option.options, disabled || option.disabled)
        })

        continue
      }

      const value = String(option.value)
      const isSelected = option.selected || this._config.value?.includes(value)

      const customProperties = typeof option === 'object' ? { ...option } : {}

      delete customProperties.value
      delete customProperties.selected
      delete customProperties.disabled

      _options.push({
        ...customProperties,
        value,
        ...isSelected && { selected: true },
        ...(disabled || option.disabled) && { disabled: true }
      })

      if (isSelected) {
        this._selected.push({
          value,
          text: option.text
        })
      }
    }

    return _options
  }

  _getOptionsFromElement(node: any = this._element): any[] {
    return [...node.children]
      .filter((child: any) => child.nodeName === 'OPTGROUP' || (child.nodeName === 'OPTION' && child.value))
      .map((child: any) => (child.nodeName === 'OPTGROUP' ?
        { label: child.label, disabled: child.disabled, options: this._getOptionsFromElement(child) } :
        {
          value: child.value,
          text: child.textContent,
          selected: child.selected,
          disabled: child.disabled
        }))
  }

  _configureNativeSelect(): void {
    this._element.classList.add(CLASS_NAME_SELECT)

    // Set or clear so update() can flip these on or off.
    if (this._config.multiple) {
      this._element.setAttribute('multiple', true as any)
    } else {
      this._element.removeAttribute('multiple')
    }

    if (this._config.required) {
      this._element.setAttribute('required', true as any)
    } else {
      this._element.removeAttribute('required')
    }

    this._element.toggleAttribute('disabled', this._config.disabled)
  }

  _createNativeOptions(parentElement: HTMLElement, options: any[]): void {
    for (const option of options) {
      if (isOptionGroup(option)) {
        const optgroup = document.createElement('optgroup')
        optgroup.label = option.label
        optgroup.disabled = option.disabled === true
        this._createNativeOptions(optgroup, option.options)
        parentElement.append(optgroup)
      } else {
        const opt = document.createElement('OPTION') as HTMLOptionElement
        opt.value = option.value

        if (option.disabled === true) {
          opt.setAttribute('disabled', 'disabled')
        }

        if (option.selected === true) {
          opt.setAttribute('selected', 'selected')
        }

        opt.textContent = option.text
        parentElement.append(opt)
      }
    }
  }

  _hideNativeSelect(): void {
    // The custom control carries the semantics; hide the replaced select from
    // assistive tech (tabindex -1 keeps it out of the tab order, so the
    // aria-hidden-focus rule is satisfied even though validation can still
    // focus it programmatically).
    this._element.tabIndex = '-1' as any
    this._element.setAttribute('aria-hidden', 'true')
  }

  _wireTogglerAccessibleName(): void {
    const labelledBy = this._element.getAttribute('aria-labelledby')
    const ariaLabel = this._element.getAttribute('aria-label')
    const nativeLabel = [...((this._element as HTMLSelectElement).labels ?? [])]
      .find(label => !label.contains(this._element))

    if (labelledBy) {
      this._togglerElement.setAttribute('aria-labelledby', labelledBy)
    } else if (ariaLabel) {
      this._togglerElement.setAttribute('aria-label', ariaLabel)
    } else if (nativeLabel) {
      if (!nativeLabel.id) {
        nativeLabel.id = `${this._uniqueId}-label`
      }

      this._togglerElement.setAttribute('aria-labelledby', nativeLabel.id)
    }
  }

  _getFocusTarget(): HTMLElement {
    return this._config.search ? this._searchElement! : this._togglerElement
  }

  _markRequired(): void {
    const ariaRequired = this._element.getAttribute('aria-required') ?? (this._config.required ? 'true' : null)

    if (ariaRequired) {
      (this._config.search ? this._searchElement! : this._togglerElement).setAttribute('aria-required', ariaRequired)
    }
  }

  _createSelect(): void {
    const wrapper = document.createElement('div')
    wrapper.classList.add(CLASS_NAME_SELECT)

    this._element.classList.toggle(CLASS_NAME_DISABLED, this._config.disabled)

    for (const className of this._element.classList) {
      if (className !== CLASS_NAME_IS_INVALID && className !== CLASS_NAME_IS_VALID) {
        wrapper.classList.add(className)
      }
    }

    this._wrapperElement = wrapper
    // The wrapper takes the native select's place, then the select moves inside it
    // as an invisible overlay so native `required` validation anchors over the control.
    this._element.parentNode!.insertBefore(wrapper, this._element)
    wrapper.prepend(this._element)

    this._uniqueId = this._config.id || this._hostAttributes.get('id') || getUID(`${this.constructor.NAME}`)

    this._createSelection()
    this._createButtons()

    if (this._config.search) {
      this._createSearchInput()
      this._updateSearch()
    }

    this._uniqueName = this._config.name || this._hostAttributes.get('name')
    this._element.setAttribute('id', this._uniqueId)

    if (this._uniqueName) {
      this._element.setAttribute('name', this._uniqueName)
    }

    this._wireTogglerAccessibleName()
    this._markRequired()
    this._validation.refresh()

    this._createOptionsContainer()
    this._hideNativeSelect()
    this._selected = this._fit(this._selected)
    this._render()
  }

  _createSelection(): void {
    // The wrapper is the frame: it stands in for the native select, so it
    // carries `.form-control-group` itself instead of nesting one. (`_element`
    // is the native <select>, which stays as an invisible overlay.)
    const togglerEl = this._wrapperElement
    togglerEl.classList.add(CLASS_NAME_INPUT_GROUP)
    togglerEl.setAttribute('role', 'combobox')
    togglerEl.setAttribute('aria-expanded', 'false')
    togglerEl.setAttribute('aria-haspopup', 'dialog')
    this._togglerElement = togglerEl

    if (this._config.disabled) {
      togglerEl.classList.add(CLASS_NAME_DISABLED)
      togglerEl.setAttribute('aria-disabled', 'true')
    }

    if (!this._config.search && !this._config.disabled) {
      togglerEl.tabIndex = 0
    }

    const selectionEl = document.createElement('div')
    selectionEl.classList.add(CLASS_NAME_SELECTION)

    if (this._config.multiple && ['chips', 'tags'].includes(this._config.selectionType)) {
      selectionEl.classList.add(CLASS_NAME_SELECTION_TAGS)
    }

    togglerEl.append(selectionEl)

    this._updateSelection()
    this._selectionElement = selectionEl

    if (this._config.multiple && ['chips', 'tags'].includes(this._config.selectionType)) {
      this._selectionChipSet = new MultiSelectChipSet(selectionEl, { removable: !this._config.disabled })
    }
  }

  // The group lays its adornments out itself — they are its children, not a
  // wrapper's.
  _createButtons(): void {
    this._indicatorElement = null

    if (this._config.pickerIcon) {
      const indicator = document.createElement('button')
      indicator.type = 'button'
      indicator.classList.add('form-control-action')
      indicator.disabled = this._config.disabled
      indicator.setAttribute('aria-label', this._config.ariaPickerLabel)
      indicator.innerHTML = sanitizeByConfig(
        this._config.pickerIcon === true ? PICKER_ICON : this._config.pickerIcon,
        { ...this._config, allowList: SVGAllowlist }
      )

      this._togglerElement.append(indicator)

      this._indicatorElement = indicator
    }

    this._updateSelectionCleaner()
  }

  _createSelectionCleaner(): HTMLElement {
    const cleaner = document.createElement('button')
    cleaner.type = 'button'
    cleaner.classList.add(CLASS_NAME_CLEANER)
    cleaner.setAttribute('aria-label', this._config.ariaCleanerLabel)
    cleaner.innerHTML = CLEANER_ICON

    return cleaner
  }

  _createSearchInput(): void {
    const input = document.createElement('input')
    input.classList.add(CLASS_NAME_SEARCH)

    if (this._config.disabled) {
      input.disabled = true
    }

    input.setAttribute('id', `search-${this._uniqueId}`)
    input.autocomplete = 'off'
    input.setAttribute('aria-label', this._config.ariaSearchLabel)

    this._searchElement = input
    this._updateSearchSize()

    this._selectionElement.append(input)
  }

  override _buildMenuHeader(listBoxDiv: HTMLElement): void {
    const hasHeaderTemplate = typeof this._config.headerTemplate === 'function'
    const showSelectAll = this._config.selectAll && this._config.multiple

    if (!hasHeaderTemplate && !showSelectAll) {
      return
    }

    const header = document.createElement('div')
    header.classList.add(CLASS_NAME_HEADER)
    this._dropdownHeaderElement = header

    if (hasHeaderTemplate) {
      const headerContent = document.createElement('div')

      // Keep interactions with custom controls from closing the dropdown,
      // mirroring the built-in button's stopPropagation behavior.
      EventHandler.on(headerContent, EVENT_CLICK, (event: any) => {
        event.stopPropagation()
      })

      this._headerElement = headerContent
      header.append(headerContent)
    } else {
      const selectAllButton = document.createElement('button')
      selectAllButton.type = 'button'
      selectAllButton.classList.add(CLASS_NAME_SELECT_ALL)
      selectAllButton.setAttribute('data-coreui-select-all', '')

      const selectAllLabel = document.createElement('span')
      selectAllButton.append(selectAllLabel)
      this._selectAllLabelElement = selectAllLabel
      this._selectAllElement = selectAllButton
      header.append(selectAllButton)
    }

    listBoxDiv.append(header)
  }

  override _afterMenuCreated(): void {
    this._menu.id = getUID(`${this.constructor.NAME}-dialog-`)
    this._menu.setAttribute('role', 'dialog')
    this._menu.setAttribute('tabindex', '-1')
    this._nameMenu()

    if (!this._config.search) {
      this._menu.setAttribute('aria-modal', 'true')
    }

    this._updateHeader()
    this._updateMasterCheckbox()
  }

  _nameMenu(): void {
    const labelledBy = this._togglerElement.getAttribute('aria-labelledby')

    if (labelledBy) {
      this._menu.setAttribute('aria-labelledby', labelledBy)
      return
    }

    const label = this._togglerElement.getAttribute('aria-label')

    if (label) {
      this._menu.setAttribute('aria-label', label)
      return
    }

    this._togglerElement.id ||= getUID(`${this.constructor.NAME}-toggler-`)
    this._menu.setAttribute('aria-labelledby', this._togglerElement.id)
  }

  _routesTypingToSearch(): boolean {
    return Boolean(this._config.search && this._config.globalSearch)
  }

  override _getListBoxConfig(): any {
    return {
      ...super._getListBoxConfig(),
      indicator: this._config.indicator,
      sectionsSelectable: this._config.optionsGroupsSelectable,
      selectionLimit: this._config.selectionLimit,
      selectionMode: this._config.multiple ? 'multiple' : 'single',
      typeahead: !this._routesTypingToSearch()
    }
  }

  // A dialog carries no aria-activedescendant: the options take the focus.
  override _getActiveDescendantField(): null {
    return null
  }

  override _getPanelReferences(): Array<[HTMLElement, string]> {
    const references: Array<[HTMLElement, string]> = [[this._togglerElement, this._menu.id]]

    if (this._searchElement) {
      references.push([this._searchElement, this._optionsElement.id])
    }

    return references
  }

  override _optionText(option: any): string {
    return option.text
  }

  _createChip(value: any, text: string, disabled: boolean): HTMLElement {
    const chip = document.createElement('div')
    chip.classList.add(CLASS_NAME_CHIP)
    chip.dataset.value = value
    chip.textContent = text

    // eslint-disable-next-line no-new
    new Chip(chip, {
      ariaRemoveLabel: `${this._config.ariaTagDeleteLabel} ${text}`.trim(),
      disabled: disabled === true,
      removable: !this._config.disabled && disabled !== true
    })

    return chip
  }

  _updateChips(selection: HTMLElement, search: HTMLElement | null): void {
    const placeholder = SelectorEngine.findOne('.form-multi-select-placeholder', selection)
    if (placeholder) {
      placeholder.remove()
    }

    const chips = new Map<string, HTMLElement>()

    for (const chip of SelectorEngine.children(selection, SELECTOR_CHIP) as HTMLElement[]) {
      const option = this._selected.find((selected: any) => selected.value === chip.dataset.value)

      if (option && chip.firstChild?.textContent === option.text && Boolean(SelectorEngine.findOne(SELECTOR_CHIP_REMOVE, chip)) === (!this._config.disabled && option.disabled !== true)) {
        chips.set(option.value, chip)
        continue
      }

      Chip.getInstance(chip)?.dispose()
      chip.remove()
    }

    let next: HTMLElement | null = search?.parentElement === selection ? search : null

    for (const option of this._selected.toReversed()) {
      const chip = chips.get(option.value) ?? this._createChip(option.value, option.text, option.disabled)

      if (chip.parentElement !== selection || chip.nextElementSibling !== next) {
        if (next) {
          next.before(chip)
        } else {
          selection.append(chip)
        }
      }

      next = chip
    }
  }

  override _onSelectionChange(): void {
    const proposed = this._listBox!.getSelectedValues()
    const listed = new Set(flattenOptions(this._options).map((option: any) => String(option.value)))
    const kept = this._config.multiple ?
      this._selected.filter((option: any) => option.disabled === true || !listed.has(option.value) || proposed.includes(option.value)) :
      []
    const { added, refused } = fillSelection(kept.map((option: any) => option.value), proposed, this._selectionLimit())

    this._validation.runAsUser(() => this._commit([...kept, ...added.map(value => ({ value }))]))

    if (!this._config) {
      return
    }

    if (refused !== null) {
      this._triggerSelectionLimit()
    }

    if (!this._config.multiple) {
      this.hide()
      this.search('')
      if (this._config.search) {
        this._searchElement.value = null
      }
    }

    if (this._config.clearSearchOnSelect && this._config.search) {
      this.search('')
      this._searchElement.value = null
      this._searchElement.focus()
    }

    this._updateSearchSize()
  }

  override _onSelectionLimit(): void {
    this._triggerSelectionLimit()
  }

  _enabledOptions(options: any[]): any[] {
    return options
      .filter(option => !option.disabled)
      .flatMap(option => (isOptionGroup(option) ? this._enabledOptions(option.options) : [option]))
  }

  _selectUpToLimit(options: any[]): void {
    const texts = new Map(options.toReversed().map(option => [String(option.value), option.text]))

    const { added, refused } = fillSelection(
      this._config.multiple ? this._selected.map((option: any) => option.value) : [],
      options.map(option => String(option.value)),
      this._selectionLimit()
    )
    this._commit([...this._selected, ...added.map(value => ({ value, text: texts.get(value) }))])

    if (refused !== null) {
      this._triggerSelectionLimit()
    }
  }

  _getDisplayedItems(): HTMLElement[] {
    return this._getDisplayedOptions().filter(element => !element.classList.contains(CLASS_NAME_DISABLED))
  }

  _getSelectableOptionsCount(): number {
    const values = new Set(getSelectableOptions(this._options).map((option: any) => String(option.value)))

    return values.size + this._selected.filter((option: any) => !values.has(option.value)).length
  }

  _deselectOption(value: any): void {
    this._commit(this._selected.filter((option: any) => option.value !== String(value)))
  }

  _deselectLastOption(): void {
    const last = this._selected.findLast((option: any) => option.disabled !== true)

    if (last) {
      this._validation.runAsUser(() => this._deselectOption(last.value))
    }
  }

  _fit(selected: any[]): any[] {
    if (!this._config.multiple) {
      return selected.slice(-1)
    }

    const values = new Set<string>()
    const unique = selected.filter((option: any) => !values.has(option.value) && values.add(option.value))

    return unique.slice(0, this._selectionLimit() ?? unique.length)
  }

  _commit(selected: any[], notify = true): void {
    const next = this._fit(selected)
    const current = new Set(this._selected.map((option: any) => option.value))
    const changed = next.length !== current.size || next.some((option: any) => !current.has(option.value))

    this._selected = next

    if (changed) {
      this._validation.change()
    }

    this._render()

    if (changed && notify) {
      EventHandler.trigger(this._element, EVENT_CHANGE, {
        value: this._selected
      })
      this._element.dispatchEvent(new Event('input', { bubbles: true }))
      this._element.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  _render(): void {
    const options = new Map(flattenOptions(this._options).toReversed().map((option: any) => [String(option.value), option]))
    const values = new Set<string>(this._selected.map((option: any) => option.value))
    const held = new Set<string>(this._listBox ? this._listBox.getSelectedValues() : [])

    for (const value of held) {
      if (!values.has(value)) {
        this._syncOptionElementState(value, false)
      }
    }

    for (const option of this._selected) {
      const listed = options.get(option.value)

      if (!listed) {
        continue
      }

      option.text = listed.text

      if (listed.disabled) {
        option.disabled = true
      } else {
        delete option.disabled

        if (!held.has(option.value)) {
          this._syncOptionElementState(option.value, true)
        }
      }
    }

    this._syncNativeSelection()
    this._validation.userAction = false
    this._updateSelection()
    this._updateSelectionCleaner()
    this._updateSearch()
    this._updateSearchSize()
    this._updateHeader()
    this._updateMasterCheckbox()
    this._validation.update()
  }

  _syncNativeSelection(): void {
    if (!this._config.multiple) {
      (this._element as HTMLSelectElement).value = this._selected[0]?.value ?? ''
      return
    }

    const values = new Set(this._selected.map((option: any) => option.value))

    for (const option of SelectorEngine.find('option', this._element) as HTMLOptionElement[]) {
      option.selected = values.has(option.value)
    }
  }

  _restoreSelection(): void {
    this._onSearchChange(this._searchElement)
    this._commit(this._initialSelection.filter((option: any) => this._findOptionByValue(option.value)), false)
  }

  _updateSelection(): void {
    const selection = SelectorEngine.findOne(SELECTOR_SELECTION, this._wrapperElement)!
    const search = SelectorEngine.findOne(SELECTOR_SEARCH, this._wrapperElement)

    // The DOM does not otherwise encode "something is selected" once search is
    // on — a single selection lives in the search input's placeholder attribute
    // — and the floating label needs the state, the way the date-time field
    // carries `.form-date-time-filled`.
    this._wrapperElement.classList.toggle(CLASS_NAME_SELECT_FILLED, this._selected.length > 0)

    if (this._selected.length === 0 && !this._config.search) {
      this._renderEmptySelection(selection)
      return
    }

    if (this._config.multiple && this._config.selectionType === 'counter' && !this._config.search) {
      selection.textContent = resolveCountLabel(this._config.selectedLabel, this._selected.length, this._getSelectableOptionsCount())
    }

    // `tags` and `chips` were the same idea built twice; both render the Chip
    // component now, so a selection is a chip everywhere in the library.
    if (this._config.multiple && ['chips', 'tags'].includes(this._config.selectionType)) {
      this._updateChips(selection, search)
    }

    if (this._config.multiple && this._config.selectionType === 'text') {
      while (selection.firstChild && selection.firstChild !== search) {
        selection.firstChild.remove()
      }

      selection.prepend(...this._selected.map((option: any, index: number) => {
        const span = document.createElement('span')
        span.textContent = `${option.text}${index === this._selected.length - 1 ? '' : ','}\u00A0`
        return span
      }))
    }

    if (!this._config.multiple && this._selected.length > 0 && !this._config.search) {
      selection.textContent = this._selected[0].text
    }

    if (search && selection.lastElementChild !== search) {
      selection.append(search)
    }

    if (this._floatingCleanup) {
      this._updateFloatingPosition()
    }
  }

  _renderEmptySelection(selection: HTMLElement): void {
    const placeholder = document.createElement('span')
    placeholder.classList.add('form-multi-select-placeholder')
    placeholder.textContent = this._config.placeholder

    for (const chip of SelectorEngine.find(SELECTOR_CHIP, selection)) {
      Chip.getInstance(chip)?.dispose()
    }

    selection.innerHTML = ''
    selection.append(placeholder)
  }

  _disposeSelection(): void {
    if (!this._selectionElement) {
      return
    }

    for (const chip of SelectorEngine.find(SELECTOR_CHIP, this._selectionElement)) {
      Chip.getInstance(chip)?.dispose()
    }

    this._selectionChipSet?.dispose()
    this._selectionChipSet = null
    EventHandler.off(this._selectionElement, Chip.EVENT_KEY)
  }

  _updateSelectionCleaner(): void {
    if (!this._config.cleaner || this._config.disabled) {
      return
    }

    if (this._selected.length > 0 && this._selectionCleanerElement === null) {
      const selectionCleaner = this._createSelectionCleaner()

      if (this._indicatorElement) {
        this._indicatorElement.before(selectionCleaner)
      } else {
        this._togglerElement.append(selectionCleaner)
      }

      this._selectionCleanerElement = selectionCleaner
      return
    }

    if (this._selected.length === 0 && this._selectionCleanerElement !== null) {
      this._selectionCleanerElement.remove()
      this._selectionCleanerElement = null
    }
  }

  _updateSearch(): void {
    if (!this._config.search) {
      return
    }

    if (this._selected.length === 0) {
      this._searchElement.placeholder = this._config.placeholder
    } else if (!this._config.multiple) {
      this._searchElement.placeholder = this._selected[0].text
    } else if (this._config.selectionType === 'counter') {
      this._searchElement.placeholder = resolveCountLabel(this._config.selectedLabel, this._selected.length, this._getSelectableOptionsCount())
    } else {
      this._searchElement.removeAttribute('placeholder')
    }
  }

  _updateSearchSize(size: number = Math.max(2, (this._searchElement?.value.length ?? 0) + 1)): void {
    if (!this._searchElement || !this._config.multiple || !['chips', 'tags', 'text'].includes(this._config.selectionType)) {
      return
    }

    if (this._selected.length > 0) {
      this._searchElement.size = size
    } else {
      this._searchElement.removeAttribute('size')
    }
  }

  _updateHeader(): void {
    if (this._headerElement) {
      this._renderHeader()
      return
    }

    if (!this._selectAllElement) {
      return
    }

    this._selectAllLabelElement.textContent = this._getSelectAllLabel()
  }

  _getSelectAllLabel(): string {
    const allSelected = this._isAllSelected()

    if (this._isFilteredScopeNarrowed()) {
      return allSelected ? this._config.deselectFilteredLabel : this._config.selectFilteredLabel
    }

    return allSelected ? this._config.deselectAllLabel : this._config.selectAllLabel
  }

  _isAllSelected(): boolean {
    return this._getSelectAllState() === 'all'
  }

  _getSelectAllState(): SelectionState {
    const scope = this._config.selectAllMode === 'filtered' ? this._getDisplayedItems() : this._getSelectableElements()
    const selected = scope.filter(element => element.classList.contains(CLASS_NAME_SELECTED)).length
    const limit = this._selectionLimit()

    return getSelectionState(selected, scope.length, limit === null ? null : limit - this._selected.length + selected)
  }

  _isFilteredScopeNarrowed(): boolean {
    if (this._config.selectAllMode !== 'filtered') {
      return false
    }

    const { filtered, total } = this._getSelectionState()
    return filtered < total
  }

  _toggleSelectAll(): void {
    const filteredMode = this._config.selectAllMode === 'filtered'

    if (this._isAllSelected()) {
      if (filteredMode) {
        this.deselectFiltered()
      } else {
        this.deselectAll(this._options)
      }

      return
    }

    if (filteredMode) {
      this.selectFiltered()
    } else {
      this.selectAll()
    }
  }

  _updateMasterCheckbox(): void {
    if (!this._selectAllElement) {
      return
    }

    const state = this._getSelectAllState()

    this._selectAllElement.classList.toggle(CLASS_NAME_SELECTED, state === 'all')
    this._selectAllElement.classList.toggle(CLASS_NAME_INDETERMINATE, state === 'some')
    this._selectAllElement.setAttribute('aria-pressed', getAriaPressed(state))
  }

  _renderHeader(): void {
    if (!this._headerElement || typeof this._config.headerTemplate !== 'function') {
      return
    }

    const result = this._config.headerTemplate(this._getSelectionState(), this._getSelectionActions())

    if (result instanceof Node) {
      this._headerElement.replaceChildren(result)
    } else {
      this._headerElement.innerHTML = sanitizeByConfig(result, this._config)
    }
  }

  _getSelectableElements(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_OPTION, this._optionsElement)
      .filter(element => !element.classList.contains(CLASS_NAME_DISABLED))
  }

  _getSelectionState(): any {
    const allItems = this._getSelectableElements()
    const filteredItems = allItems.filter(element => this._isOptionDisplayed(element))

    return {
      selected: this._selected.length,
      total: allItems.length,
      filtered: filteredItems.length,
      filteredSelected: filteredItems.filter(element => element.classList.contains(CLASS_NAME_SELECTED)).length
    }
  }

  _getSelectionActions(): any {
    return {
      selectAll: () => this._validation.runAsUser(() => this.selectAll()),
      deselectAll: () => this._validation.runAsUser(() => this.deselectAll()),
      selectFiltered: () => this._validation.runAsUser(() => this.selectFiltered()),
      deselectFiltered: () => this._validation.runAsUser(() => this.deselectFiltered())
    }
  }

  _onSearchChange(element: any): void {
    if (element) {
      this.search(element.value)

      this._updateSearchSize(element.value.length + 1)
    }
  }

  _selectionLimit(): number | null {
    return getSelectionLimit(this._config.multiple, this._config.selectionLimit)
  }

  _triggerSelectionLimit(): void {
    EventHandler.trigger(this._element, EVENT_SELECTION_LIMIT, {
      selectionLimit: this._config.selectionLimit
    })
  }

  override _afterFilter(visibleOptions: number): void {
    this._updateHeader()
    this._updateMasterCheckbox()
    this._updateSelectAllVisibility(visibleOptions)
  }

  _updateSelectAllVisibility(visibleOptions: number): void {
    if (!this._dropdownHeaderElement || !this._selectAllElement) {
      return
    }

    if (this._config.hideSelectAllOnSearchNoResults && visibleOptions === 0) {
      this._dropdownHeaderElement.style.display = 'none'
    } else {
      this._dropdownHeaderElement.style.removeProperty('display')
    }
  }

  override _configAfterMerge(config: any): any {
    config = this._normalizeContainerConfig(config)

    if (typeof config.value === 'number') {
      config.value = [String(config.value)]
    }

    if (typeof config.value === 'string') {
      config.value = config.value.split(/,\s*/).map(String)
    }

    return config
  }

  // Static

  static multiSelectInterface(element: string | Element | null, config?: any, ...args: any[]): void {
    const data: any = MultiSelect.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](...args)
    }
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, MultiSelect, config, args)
  }

  static clearMenus(event: any): void {
    if (event && (event.button === RIGHT_MOUSE_BUTTON ||
      (event.type === 'keyup' && event.key !== TAB_KEY))) {
      return
    }

    const selects = SelectorEngine.find(SELECTOR_SELECT)

    for (let i = 0, len = selects.length; i < len; i++) {
      const context = Data.get(selects[i], DATA_KEY)

      if (!context) {
        continue
      }

      if (!context._wrapperElement.classList.contains(CLASS_NAME_SHOW)) {
        continue
      }

      // The panel mounts outside the frame while open — a click on an option
      // is very much inside
      if (context._wrapperElement.contains(event.target) || context._menu.contains(event.target)) {
        continue
      }

      context.hide()

      EventHandler.trigger(context._element, EVENT_HIDDEN)
    }
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  const elements = new Set([
    ...SelectorEngine.find(SELECTOR_DATA_MULTI_SELECT),
    ...SelectorEngine.find(SELECTOR_SELECT)
  ])

  for (const ms of elements) {
    if (ms.tabIndex !== -1) {
      MultiSelect.multiSelectInterface(ms)
    }
  }
})
EventHandler.on(document, EVENT_CLICK_DATA_API, MultiSelect.clearMenus)
EventHandler.on(document, EVENT_KEYUP_DATA_API, MultiSelect.clearMenus)

/**
 * jQuery
 */

defineJQueryPlugin(MultiSelect)

export default MultiSelect
export type { MultiSelectConfig }
