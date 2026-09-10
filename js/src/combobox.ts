/**
 * --------------------------------------------------------------------------
 * CoreUI PRO combobox.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import ListBox from './list-box.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { createAnchoredPosition } from './util/floating-ui.js'
import { resolvePopupContainer } from './util/popup.js'
import { escapeHtml, sanitizeHtml } from './util/sanitizer.js'
import { executeAfterTransition, getElement } from './util/index.js'

/**
 * Internal shared engine for the combobox-pattern components (Autocomplete,
 * MultiSelect). Not exported from the package and not documented — the public
 * surfaces stay the subclasses, which keep their own markup, class names,
 * events and options.
 *
 * The panel is a `.popup` wrapping a ListBox instance: the list renders the
 * options, owns the selection state it shows, and runs the keyboard from the
 * host's own field through `activeDescendant`. The engine keeps the panel
 * (mounting, width, anchored position, Escape) and translates between the
 * host's option model and the list's items.
 */

const ARROW_DOWN_KEY = 'ArrowDown'
const ESCAPE_KEY = 'Escape'
const ENTER_KEY = 'Enter'

const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_POPUP = 'combobox-popup'
const CLASS_NAME_EMPTY = 'list-box-empty'
const CLASS_NAME_LIST_BOX = 'list-box'
const CLASS_NAME_OPTIONS = 'list-box-options'

const SELECTOR_OPTION = '.list-box-option'

const EVENT_LIST_BOX_CHANGE = 'change.coreui.list-box'
const EVENT_LIST_BOX_DESELECTED = 'deselected.coreui.list-box'
const EVENT_LIST_BOX_SELECTED = 'selected.coreui.list-box'
const EVENT_LIST_BOX_SELECTION_LIMIT = 'selectionLimit.coreui.list-box'

class Combobox extends BaseComponent {
  declare ['constructor']: typeof Combobox
  protected declare _uniqueId: any
  protected declare _togglerElement: any
  protected declare _optionsElement: any
  protected declare _listBox: ListBox | null
  protected declare _listBoxElement: any
  protected declare _menu: any
  protected declare _selected: any
  protected declare _options: any
  protected declare _search: any
  protected declare _syncing: boolean
  protected declare _floatingCleanup: (() => void) | null
  protected declare _widthObserver: ResizeObserver | null
  protected declare _anchoredPosition: ReturnType<typeof createAnchoredPosition> | null

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

    // A closed panel has no highlighted option, so reopening starts from the
    // top and the field's activation keys stop reaching a stale one.
    this._listBox?.setActive(null)

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

  // Shared keyboard wiring — the list itself runs the arrows, Home/End and the
  // activation keys off the field it was given, so the frame only has to open.

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
      }
    })
  }

  // Options panel — one render path for every combobox surface

  _createOptionsContainer(): void {
    const popupDiv = document.createElement('div')
    popupDiv.classList.add('popup', CLASS_NAME_POPUP)

    const listBoxDiv = document.createElement('div')
    listBoxDiv.classList.add(CLASS_NAME_LIST_BOX)
    popupDiv.append(listBoxDiv)
    this._listBoxElement = listBoxDiv

    this._buildMenuHeader(listBoxDiv)

    const optionsDiv = document.createElement('div')
    optionsDiv.classList.add(CLASS_NAME_OPTIONS)
    optionsDiv.setAttribute('id', `${this._uniqueId}-listbox`)

    this._decorateListbox(optionsDiv)

    if (this._config.optionsMaxHeight !== 'auto') {
      optionsDiv.style.maxHeight = `${this._config.optionsMaxHeight}px`
      optionsDiv.style.overflowY = 'auto'
    }

    if (this._config.searchNoResultsLabel) {
      const empty = document.createElement('div')
      empty.classList.add(CLASS_NAME_EMPTY)
      empty.setAttribute('role', 'status')
      empty.setAttribute('hidden', '')
      empty.textContent = this._config.searchNoResultsLabel
      optionsDiv.append(empty)
    }

    listBoxDiv.append(optionsDiv)

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

    this._optionsElement = optionsDiv
    this._menu = popupDiv
    this._syncing = false

    this._listBox = new ListBox(listBoxDiv, this._getListBoxConfig())
    this._addListBoxListeners()
    this._afterMenuCreated()
  }

  // Hooks: dropdown header (MultiSelect select-all / header template),
  // listbox decoration (aria-multiselectable, labelling) and post-create work.
  _buildMenuHeader(listBoxDiv: HTMLElement): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _decorateListbox(optionsDiv: HTMLElement): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _afterMenuCreated(): void {}

  _getListBoxConfig(): any {
    return {
      activeDescendant: this._getActiveDescendantField(),
      allowList: this._config.allowList,
      html: this._hasOptionTemplates(),
      items: this._getListBoxItems(),
      sanitize: this._config.sanitize,
      sanitizeFn: this._config.sanitizeFn,
      selectionMode: 'single',
      typeahead: false
    }
  }

  // The field that keeps the focus while the list moves its active option.
  _getActiveDescendantField(): HTMLElement {
    return this._togglerElement
  }

  _hasOptionTemplates(): boolean {
    return typeof this._config.optionsTemplate === 'function' ||
      typeof this._config.optionsGroupsTemplate === 'function'
  }

  _getListBoxItems(options: any[] = this._options): any[] {
    return options.map((option: any) => {
      if (Array.isArray(option.options)) {
        return {
          label: this._renderGroupLabel(option),
          items: this._getListBoxItems(option.options)
        }
      }

      return {
        value: String(option.value),
        label: this._renderOptionLabel(option),
        ...option.disabled && { disabled: true }
      }
    })
  }

  _renderOptionLabel(option: any): string {
    if (typeof this._config.optionsTemplate === 'function') {
      return this._config.optionsTemplate(option)
    }

    return this._plainLabel(this._optionText(option))
  }

  _renderGroupLabel(option: any): string {
    if (typeof this._config.optionsGroupsTemplate === 'function') {
      return this._config.optionsGroupsTemplate(option)
    }

    return this._plainLabel(option.label)
  }

  // Hook: the property each surface stores an option's text in.
  _optionText(option: any): string {
    return option.label
  }

  // The list renders every label through one path, so a surface that has any
  // template at all takes its plain labels escaped rather than as markup.
  _plainLabel(label: string): string {
    return this._hasOptionTemplates() ? escapeHtml(String(label)) : String(label)
  }

  _setListBoxItems(): void {
    this._listBox?.setItems(this._getListBoxItems())
    this._afterOptionsRendered()
  }

  _afterOptionsRendered(): void {}

  _disposeListBox(): void {
    this._listBox?.dispose()
    this._listBox = null
  }

  // Selection — the list holds the state it renders, every surface keeps its
  // own model and mirrors it here.

  _addListBoxListeners(): void {
    EventHandler.on(this._listBoxElement, EVENT_LIST_BOX_SELECTED, (event: any) => {
      if (!this._syncing) {
        this._onOptionSelected(String(event.value))
      }
    })

    EventHandler.on(this._listBoxElement, EVENT_LIST_BOX_DESELECTED, (event: any) => {
      if (!this._syncing) {
        this._onOptionDeselected(String(event.value))
      }
    })

    // `change` is a native event name, so EventHandler registers the listener
    // under the bare type while the list dispatches the namespaced one.
    this._listBoxElement.addEventListener(EVENT_LIST_BOX_CHANGE, () => {
      if (!this._syncing) {
        this._onSelectionChange()
      }
    })

    EventHandler.on(this._listBoxElement, EVENT_LIST_BOX_SELECTION_LIMIT, () => {
      if (!this._syncing) {
        this._onSelectionLimit()
      }
    })
  }

  _onOptionSelected(value: string): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _onOptionDeselected(value: string): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _onSelectionChange(): void {}

  _onSelectionLimit(): void {}

  // Reflect the model's state on the list without the list reporting it back.
  _syncOptionElementState(value: any, selected: boolean): void {
    if (!this._listBox) {
      return
    }

    this._syncing = true

    if (selected) {
      this._listBox.select(String(value))
    } else {
      this._listBox.deselect(String(value))
    }

    this._syncing = false
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

  // Filtering — the list hides what does not match and follows with its empty
  // state, its select-all scope and its keyboard order.

  _filterOptionsList(): void {
    this._listBox?.filter(this._search === '' ? null : this._search)
    this._afterOptionsRendered()
    this._afterFilter(this._getDisplayedOptions().length)
  }

  _afterFilter(visibleOptions: number): void {} // eslint-disable-line @typescript-eslint/no-unused-vars

  _getDisplayedOptions(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_OPTION, this._optionsElement)
      .filter(element => this._isOptionDisplayed(element))
  }

  _isOptionDisplayed(element: Element): boolean {
    return !element.hasAttribute('hidden') && element.closest('[hidden]') === null
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
