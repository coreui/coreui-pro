/**
 * --------------------------------------------------------------------------
 * CoreUI PRO combobox.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import SelectorEngine from './dom/selector-engine.js'
import { createAnchoredPosition } from './util/floating-ui.js'
import { sanitizeHtml } from './util/sanitizer.js'
import { getElement, getNextActiveElement, isVisible } from './util/index.js'

/**
 * Internal shared engine for the combobox-pattern components (Autocomplete,
 * MultiSelect). Not exported from the package and not documented — the public
 * surfaces stay the subclasses, which keep their own markup, class names,
 * events and options.
 *
 * The seam mirrors Menu/Dropdown: subclasses override the static `selectors`
 * and `optionLabelKey` getters, and the engine reads them through
 * `this.constructor`, so every shared behavior operates on the subclass's own
 * class names. Anchored positioning composes `createAnchoredPosition()`
 * directly (the util extracted from these very components) rather than a Menu
 * instance, which would impose menu interaction semantics on a listbox.
 */

const ARROW_DOWN_KEY = 'ArrowDown'

type ComboboxSelectors = {
  option: string
  optgroup: string
  options: string
  optionsEmpty: string
  navigableItems: string
}

class Combobox extends BaseComponent {
  declare ['constructor']: typeof Combobox
  protected declare _uniqueId: any
  protected declare _togglerElement: any
  protected declare _optionsElement: any
  protected declare _menu: any
  protected declare _selected: any
  protected declare _options: any
  protected declare _search: any
  protected declare _floatingCleanup: (() => void) | null
  protected declare _anchoredPosition: ReturnType<typeof createAnchoredPosition> | null

  // Statics — the subclass seam

  static get selectors(): ComboboxSelectors {
    throw new Error('Combobox subclasses must define the static "selectors" getter.')
  }

  // Shorthand resolving the static through the live constructor

  get _selectors(): ComboboxSelectors {
    return this.constructor.selectors
  }

  // Option model

  _flattenOptions(options: any[] = this._options, flat: any[] = []): any[] {
    for (const option of options) {
      if (option && Array.isArray(option.options)) {
        this._flattenOptions(option.options, flat)
        continue
      }

      flat.push(option)
    }

    return flat
  }

  _findOptionByValue(value: any, options: any[] = this._options): any {
    for (const option of options) {
      if (String(option.value) === String(value)) {
        return option
      }

      if (option.options && Array.isArray(option.options)) {
        const found = this._findOptionByValue(value, option.options)
        if (found) {
          return found
        }
      }
    }

    return null
  }

  // Anchored positioning (shared wiring around util/floating-ui)

  _createFloating(): void {
    this._anchoredPosition = createAnchoredPosition(this._togglerElement, this._menu)
    this._floatingCleanup = this._anchoredPosition.destroy
  }

  async _updateFloatingPosition(): Promise<void> {
    await this._anchoredPosition?.update()
  }

  _disposeFloating(): void {
    if (this._floatingCleanup) {
      this._floatingCleanup()
      this._floatingCleanup = null
      this._anchoredPosition = null
    }
  }

  // Filtering

  _filterOptionsList(): void {
    const { option: optionSelector, optgroup: optgroupSelector } = this._selectors
    const options = SelectorEngine.find(optionSelector, this._menu)
    let visibleOptions = 0

    for (const option of options) {
      const optionElement = option as HTMLElement
      // eslint-disable-next-line unicorn/prefer-includes
      if (optionElement.textContent!.toLowerCase().indexOf(this._search) === -1) {
        optionElement.style.display = 'none'
      } else {
        this._decorateFilteredOption(optionElement)
        optionElement.style.removeProperty('display')
        visibleOptions++
      }

      const optgroup = option.closest(optgroupSelector) as HTMLElement
      if (optgroup) {
        // eslint-disable-next-line unicorn/prefer-array-some
        if (SelectorEngine.children(optgroup, optionSelector).filter((element: Element) => this._isOptionDisplayed(element)).length > 0) {
          optgroup.style.removeProperty('display')
        } else {
          optgroup.style.display = 'none'
        }
      }
    }

    this._afterFilter(visibleOptions)
  }

  // Hook: decorate an option that stays visible after filtering (e.g. search
  // highlighting). Default: leave it as rendered.
  _decorateFilteredOption(option: HTMLElement): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  // Hook: react to the filter result. Default: sync the no-results placeholder.
  _afterFilter(visibleOptions: number): void {
    this._syncNoResultsPlaceholder(visibleOptions)
  }

  _syncNoResultsPlaceholder(visibleOptions: number): void {
    const { options: optionsSelector, optionsEmpty: optionsEmptySelector } = this._selectors
    const emptyMessage = SelectorEngine.findOne(optionsEmptySelector, this._menu)

    if (visibleOptions > 0) {
      if (emptyMessage) {
        emptyMessage.remove()
      }

      return
    }

    if (!emptyMessage) {
      const placeholder = document.createElement('div')
      placeholder.classList.add(optionsEmptySelector.slice(1))
      placeholder.setAttribute('role', 'status')
      placeholder.textContent = this._config.searchNoResultsLabel

      SelectorEngine.findOne(optionsSelector, this._menu)!.append(placeholder)
    }
  }

  // Checks only `display` (unlike the imported `isVisible`) so it still works
  // while the menu is closed, e.g. when called from the constructor.
  _isOptionDisplayed(element: Element): boolean {
    const style = window.getComputedStyle(element)
    return (style.display !== 'none')
  }

  // Listbox keyboard navigation

  _selectMenuItem({ key, target }: any): void {
    const items = SelectorEngine.find(this._selectors.navigableItems, this._menu).filter(element => isVisible(element))

    if (!items.length) {
      return
    }

    // if target isn't included in items (e.g. when expanding the dropdown)
    // allow cycling to get the last item in case key equals ARROW_UP_KEY
    getNextActiveElement(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus()
  }

  _selectFirstOrLastMenuItem(first: boolean): void {
    const items = SelectorEngine.find(this._selectors.navigableItems, this._menu).filter(element => isVisible(element))

    if (!items.length) {
      return
    }

    const item = first ? items[0] : items[items.length - 1]
    item.focus()
  }

  // Templates

  _maybeSanitize(content: string): string {
    return this._config.sanitize ?
      sanitizeHtml(content, this._config.allowList, this._config.sanitizeFn) :
      content
  }

  // Config normalization shared by every combobox surface

  _normalizeContainerConfig(config: any): any {
    if (config.container === true) {
      config.container = document.body
    }

    if (typeof config.container === 'object' || typeof config.container === 'string') {
      config.container = getElement(config.container)
    }

    return config
  }
}

export default Combobox
