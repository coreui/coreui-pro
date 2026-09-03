/**
 * --------------------------------------------------------------------------
 * CoreUI PRO combobox.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { createAnchoredPosition } from './util/floating-ui.js'
import { resolvePopupContainer } from './util/popup.js'
import { sanitizeHtml } from './util/sanitizer.js'
import {
  executeAfterTransition, getElement, getNextActiveElement, isVisible
} from './util/index.js'

/**
 * Internal shared engine for the combobox-pattern components (Autocomplete,
 * MultiSelect). Not exported from the package and not documented — the public
 * surfaces stay the subclasses, which keep their own markup, class names,
 * events and options.
 *
 * The seam mirrors Menu/Dropdown: subclasses override the static getters
 * (`selectors`, `activationKeys`) and the engine reads them through
 * `this.constructor`, so every shared behavior operates on the subclass's own
 * class names. Anchored positioning composes `createAnchoredPosition()`
 * directly (the util extracted from these very components) rather than a Menu
 * instance, which would impose menu interaction semantics on a listbox.
 */

const ARROW_UP_KEY = 'ArrowUp'
const ARROW_DOWN_KEY = 'ArrowDown'
const END_KEY = 'End'
const ESCAPE_KEY = 'Escape'
const ENTER_KEY = 'Enter'
const HOME_KEY = 'Home'

const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_POPUP = 'combobox-popup'
const CLASS_NAME_OPTIONS = 'combobox-options'
const CLASS_NAME_OPTIONS_EMPTY = 'combobox-options-empty'
const CLASS_NAME_OPTION = 'combobox-option'
const CLASS_NAME_OPTGROUP = 'combobox-optgroup'
const CLASS_NAME_OPTGROUP_LABEL = 'combobox-optgroup-label'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_SELECTED = 'selected'
const CLASS_NAME_LABEL = 'label'

const SELECTOR_OPTION = '.combobox-option'
const SELECTOR_OPTGROUP = '.combobox-optgroup'
const SELECTOR_OPTIONS = '.combobox-options'
const SELECTOR_OPTIONS_EMPTY = '.combobox-options-empty'
const SELECTOR_VISIBLE_ITEMS = '.combobox-options .combobox-option:not(.disabled):not(:disabled)'

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
  protected declare _widthObserver: ResizeObserver | null
  protected declare _anchoredPosition: ReturnType<typeof createAnchoredPosition> | null

  // Statics — the subclass seam

  // Focus targets for listbox keyboard navigation; MultiSelect widens this to
  // include the select-all button and selectable group labels.
  static get navigableItemsSelector(): string {
    return SELECTOR_VISIBLE_ITEMS
  }

  // Keys that activate the focused option in the options list.
  static get activationKeys(): string[] {
    return [ENTER_KEY]
  }

  // Show / hide lifecycle — one event contract for every combobox surface.
  // Subclasses adjust behavior through the hooks below, never by overriding
  // the template methods, so the event order stays identical across surfaces.

  toggle(): void {
    return this._isShown() ? this.hide() : this.show()
  }

  show(): void {
    if (this._config.disabled || this._isShown() || !this._canShow()) {
      return
    }

    EventHandler.trigger(this._element, this.constructor.eventName('show'))
    const showTarget = this._getShowTarget()
    this._mountMenu()
    showTarget.classList.add(CLASS_NAME_SHOW)
    this._getAriaExpandedTarget().setAttribute('aria-expanded', 'true')

    // The panel carries its own open state, teleported or not: `.popup` keys
    // both its display and its entry transition on it, so a panel shown only
    // through an ancestor's class would be laid out and never fade in.
    this._menu.classList.add(CLASS_NAME_SHOW)

    EventHandler.trigger(this._element, this.constructor.eventName('shown'))

    this._createFloating()
    this._afterShow()
  }

  hide(): void {
    EventHandler.trigger(this._element, this.constructor.eventName('hide'))
    this._onHideStart()

    this._disposeFloating()
    this._afterHideDispose()

    this._getShowTarget().classList.remove(CLASS_NAME_SHOW)
    this._getAriaExpandedTarget().setAttribute('aria-expanded', 'false')
    this._menu.classList.remove(CLASS_NAME_SHOW)

    this._onHideEnd()
    EventHandler.trigger(this._element, this.constructor.eventName('hidden'))

    // The panel lives in the DOM only while a choice is being made; let the
    // exit transition play before it goes. dispose() can run before the
    // transition ends — it nulls every field and removes the panel itself.
    executeAfterTransition(() => {
      if (this._menu && !this._isShown()) {
        this._menu.remove()
      }
    }, this._menu)
  }

  _isShown(): boolean {
    return this._getShowTarget().classList.contains(CLASS_NAME_SHOW)
  }

  // Lifecycle hooks

  _canShow(): boolean {
    return true
  }

  _afterShow(): void {}

  _onHideStart(): void {}

  _afterHideDispose(): void {}

  _onHideEnd(): void {}

  _getShowTarget(): HTMLElement {
    return this._element
  }

  // Mounted for the duration of the interaction, into a container decided
  // fresh on each open (in place, the open dialog's subtree, or body when an
  // ancestor would clip the panel). In place means next to the frame, not
  // inside it — the frame is a flex control chrome. The frame cannot size the
  // panel through CSS once the panel can leave it, so the width rides along
  // inline.
  _mountMenu(): void {
    const showTarget = this._getShowTarget()
    const container = resolvePopupContainer(showTarget, this._config.container ? getElement(this._config.container) : null)

    if (container) {
      container.append(this._menu)
    } else {
      showTarget.after(this._menu)
    }

    // The frame used to size the panel through CSS (min-width: 100%), which
    // tracked resizes for free; an inline snapshot must follow the frame
    // itself for as long as the panel is open.
    this._syncMenuWidth()
    this._widthObserver = new ResizeObserver(() => this._syncMenuWidth())
    this._widthObserver.observe(showTarget)
  }

  _syncMenuWidth(): void {
    if (this._menu) {
      this._menu.style.minWidth = `${this._getShowTarget().offsetWidth}px`
    }
  }

  _getAriaExpandedTarget(): HTMLElement {
    return this._togglerElement
  }

  _escapeFocusTarget(): HTMLElement | null {
    return this._togglerElement
  }

  // Shared keyboard wiring

  _addTogglerKeydownListeners(): void {
    EventHandler.on(this._togglerElement, this.constructor.eventName('keydown'), (event: any) => {
      // A nested control that owns its own keyboard handling marks the event
      // handled — Multi Select's native <select> overlay lives inside the frame
      // and hands the keystroke over itself, so the frame must not act on the
      // same press a second time and jump into the menu.
      if (event.defaultPrevented) {
        return
      }

      if (!this._isShown() && (event.key === ENTER_KEY || event.key === ARROW_DOWN_KEY)) {
        event.preventDefault()
        this.show()
        return
      }

      if (this._isShown() && event.key === ARROW_DOWN_KEY) {
        event.preventDefault()
        this._selectMenuItem(event)
      }
    })
  }

  _addOptionsKeydownListeners(): void {
    EventHandler.on(this._optionsElement, this.constructor.eventName('keydown'), (event: any) => {
      if (this.constructor.activationKeys.includes(event.key)) {
        // Space would otherwise scroll the options list.
        event.preventDefault()
        this._onOptionsClick(event.target)
      }

      if ([ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key)) {
        event.preventDefault()
        this._selectMenuItem(event)
      }

      if ([HOME_KEY, END_KEY].includes(event.key)) {
        event.preventDefault()
        this._selectFirstOrLastMenuItem(event.key === HOME_KEY)
      }
    })
  }

  // Options menu — one render path for every combobox surface

  _createOptionsContainer(): void {
    const popupDiv = document.createElement('div')
    popupDiv.classList.add('popup', CLASS_NAME_POPUP)

    this._buildMenuHeader(popupDiv)

    const optionsDiv = document.createElement('div')
    optionsDiv.classList.add(CLASS_NAME_OPTIONS)
    optionsDiv.setAttribute('role', 'listbox')
    optionsDiv.setAttribute('id', `${this._uniqueId}-listbox`)

    this._decorateListbox(optionsDiv)

    if (this._config.optionsMaxHeight !== 'auto') {
      optionsDiv.style.maxHeight = `${this._config.optionsMaxHeight}px`
      optionsDiv.style.overflow = 'auto'
    }

    popupDiv.append(optionsDiv)

    // The menu mounts outside the component while open, so its keystrokes no
    // longer bubble through the frame — Escape is handled on the panel itself.
    // Focus goes home before the panel unmounts, or a keyboard user is
    // dropped on <body>; preventDefault keeps the same press from also
    // closing an enclosing modal dialog.
    EventHandler.on(popupDiv, this.constructor.eventName('keydown'), (event: any) => {
      if (event.key === ESCAPE_KEY) {
        event.preventDefault()
        event.stopPropagation()
        this._escapeFocusTarget()?.focus()
        this.hide()
      }
    })

    this._createOptions(optionsDiv, this._options)
    this._optionsElement = optionsDiv
    this._menu = popupDiv
    this._afterMenuCreated()
  }

  // Hooks: dropdown header (MultiSelect select-all / header template),
  // listbox decoration (aria-multiselectable, labelling) and post-create work.
  _buildMenuHeader(popupDiv: HTMLElement): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _decorateListbox(optionsDiv: HTMLElement): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _afterMenuCreated(): void {}

  _createOptions(parentElement: HTMLElement, options: any[]): void {
    for (const option of options) {
      if (Array.isArray(option.options)) {
        const optgroup = document.createElement('div')
        optgroup.classList.add(CLASS_NAME_OPTGROUP)

        const optgrouplabel = document.createElement('div')
        if (typeof this._config.optionsGroupsTemplate === 'function') {
          optgrouplabel.innerHTML = this._maybeSanitize(this._config.optionsGroupsTemplate(option))
        } else {
          optgrouplabel.textContent = option.label
        }

        optgrouplabel.classList.add(CLASS_NAME_OPTGROUP_LABEL)
        this._decorateOptgroupLabel(optgrouplabel, option)
        optgroup.append(optgrouplabel)

        this._createOptions(optgroup, option.options)
        parentElement.append(optgroup)

        continue
      }

      const optionDiv = document.createElement('div')
      optionDiv.classList.add(CLASS_NAME_OPTION)
      optionDiv.setAttribute('role', 'option')
      optionDiv.setAttribute('aria-selected', this._isOptionSelectedInitially(option) ? 'true' : 'false')

      if (option.disabled) {
        optionDiv.classList.add(CLASS_NAME_DISABLED)
      }

      optionDiv.dataset.value = String(option.value)
      optionDiv.tabIndex = option.disabled ? -1 : 0

      this._decorateOption(optionDiv, option)
      this._renderOptionContent(optionDiv, option)

      parentElement.append(optionDiv)
    }
  }

  // Hooks: per-surface option decoration and content rendering.
  _decorateOption(optionDiv: HTMLElement, option: any): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _decorateOptgroupLabel(label: HTMLElement, option: any): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _renderOptionContent(optionDiv: HTMLElement, option: any): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _isOptionSelectedInitially(option: any): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
    return false
  }

  // Click resolution shared by every surface; activation is per surface.
  _onOptionsClick(element: any): void {
    if (this._interceptOptionsClick(element)) {
      return
    }

    if (element.classList.contains(CLASS_NAME_LABEL)) {
      return
    }

    if (!element.classList.contains(CLASS_NAME_OPTION)) {
      element = element.closest(SELECTOR_OPTION)

      if (!element) {
        return
      }
    }

    if (element.classList.contains(CLASS_NAME_DISABLED)) {
      return
    }

    this._onOptionActivate(String(element.dataset.value), element)
  }

  // Hook: consume the click before option resolution (e.g. group toggles).
  _interceptOptionsClick(element: any): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
    return false
  }

  // Subclasses implement option activation.
  _onOptionActivate(value: string, element: HTMLElement): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  // Reflect the selection state on a rendered option element.
  _syncOptionElementState(value: any, selected: boolean): void {
    const option = SelectorEngine.findOne(`[data-value="${CSS.escape(String(value))}"]`, this._optionsElement)

    if (option) {
      option.classList.toggle(CLASS_NAME_SELECTED, selected)
      option.setAttribute('aria-selected', selected ? 'true' : 'false')
    }
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
    // The width observer shares the floating lifecycle exactly: both live
    // while the panel is interactive, and every hide/dispose path ends here.
    this._widthObserver?.disconnect()
    this._widthObserver = null

    if (this._floatingCleanup) {
      this._floatingCleanup()
      this._floatingCleanup = null
      this._anchoredPosition = null
    }
  }

  // Filtering

  _filterOptionsList(): void {
    const options = SelectorEngine.find(SELECTOR_OPTION, this._menu)
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

      const optgroup = option.closest(SELECTOR_OPTGROUP) as HTMLElement
      if (optgroup) {
        // eslint-disable-next-line unicorn/prefer-array-some
        if (SelectorEngine.children(optgroup, SELECTOR_OPTION).filter((element: Element) => this._isOptionDisplayed(element)).length > 0) {
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
    const emptyMessage = SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._menu)

    if (visibleOptions > 0) {
      if (emptyMessage) {
        emptyMessage.remove()
      }

      return
    }

    if (!emptyMessage) {
      const placeholder = document.createElement('div')
      placeholder.classList.add(CLASS_NAME_OPTIONS_EMPTY)
      placeholder.setAttribute('role', 'status')
      placeholder.textContent = this._config.searchNoResultsLabel

      SelectorEngine.findOne(SELECTOR_OPTIONS, this._menu)!.append(placeholder)
    }
  }

  // Checks only `display` (unlike the imported `isVisible`) so it still works
  // while the menu is closed, e.g. when called from the constructor.
  _isOptionDisplayed(element: Element): boolean {
    // The filter hides options with inline display only, so the inline style
    // is the source of truth — computed style reads empty on a detached panel
    // and would count every option as displayed
    return (element as HTMLElement).style.display !== 'none'
  }

  // Listbox keyboard navigation

  _selectMenuItem({ key, target }: any): void {
    const items = SelectorEngine.find(this.constructor.navigableItemsSelector, this._menu).filter(element => isVisible(element))

    if (!items.length) {
      return
    }

    // if target isn't included in items (e.g. when expanding the dropdown)
    // allow cycling to get the last item in case key equals ARROW_UP_KEY
    getNextActiveElement(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus()
  }

  _selectFirstOrLastMenuItem(first: boolean): void {
    const items = SelectorEngine.find(this.constructor.navigableItemsSelector, this._menu).filter(element => isVisible(element))

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
