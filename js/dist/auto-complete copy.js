/*!
  * CoreUI auto-complete copy.js v5.15.0 (https://coreui.io)
  * Copyright 2025 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@popperjs/core'), require('./base-component.js'), require('./dom/data.js'), require('./dom/event-handler.js'), require('./dom/selector-engine.js'), require('./util/index.js')) :
  typeof define === 'function' && define.amd ? define(['@popperjs/core', './base-component', './dom/data', './dom/event-handler', './dom/selector-engine', './util/index'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["AutoComplete copy"] = factory(global["@popperjs/core"], global.BaseComponent, global.Data, global.EventHandler, global.SelectorEngine, global.Index));
})(this, (function (Popper, BaseComponent, Data, EventHandler, SelectorEngine, index_js) { 'use strict';

  function _interopNamespaceDefault(e) {
    const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
    if (e) {
      for (const k in e) {
        if (k !== 'default') {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }

  const Popper__namespace = /*#__PURE__*/_interopNamespaceDefault(Popper);

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO auto-complete.js
   * License (https://coreui.io/pro/license/)
   * --------------------------------------------------------------------------
   */


  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'auto-complete';
  const DATA_KEY = 'coreui.auto-complete';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';

  // Keys
  const ARROW_UP_KEY = 'ArrowUp';
  const ARROW_DOWN_KEY = 'ArrowDown';
  // const ARROW_LEFT_KEY = 'ArrowLeft'
  const ARROW_RIGHT_KEY = 'ArrowRight';
  const BACKSPACE_KEY = 'Backspace';
  const DELETE_KEY = 'Delete';
  const ENTER_KEY = 'Enter';
  const ESCAPE_KEY = 'Escape';
  const TAB_KEY = 'Tab';
  const RIGHT_MOUSE_BUTTON = 2;

  // Selectors
  const SELECTOR_AC = '.auto-complete';
  // const SELECTOR_AC_INPUT_GROUP = '.auto-complete-input-group'
  // const SELECTOR_AC_SELECTION = '.auto-complete-selection'
  // const SELECTOR_AC_HINT = '.auto-complete-selection-hint'
  // const SELECTOR_AC_CLEANER = '.auto-complete-cleaner'
  // const SELECTOR_AC_INDICATOR = '.auto-complete-indicator'
  // const SELECTOR_AC_DROPDOWN = '.auto-complete-dropdown'
  const SELECTOR_AC_OPTIONS = '.auto-complete-options';
  const SELECTOR_AC_OPTION = '.auto-complete-option';
  const SELECTOR_AC_OPTIONS_EMPTY = '.auto-complete-options-empty';
  const SELECTOR_AC_VISIBLE_ITEMS = '.auto-complete-options .auto-complete-option:not(.disabled):not(:disabled)';

  // Events
  const EVENT_CHANGED = `changed${EVENT_KEY}`; // { value: Option | null }
  const EVENT_INPUT = `input${EVENT_KEY}`; // when user types search text
  const EVENT_SEARCH = `search${EVENT_KEY}`; // after internal filter applied
  const EVENT_SHOW = `show${EVENT_KEY}`;
  const EVENT_SHOWN = `shown${EVENT_KEY}`;
  const EVENT_HIDE = `hide${EVENT_KEY}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  const EVENT_CLICK = `click${EVENT_KEY}`;
  const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
  // const EVENT_KEYUP = `keyup${EVENT_KEY}`
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;

  // Class names
  const CLASS_NAME_AC = 'auto-complete';
  const CLASS_NAME_INPUT_GROUP = 'auto-complete-input-group';
  const CLASS_NAME_HINT = 'auto-complete-selection-hint';
  const CLASS_NAME_SELECTION = 'auto-complete-selection';
  const CLASS_NAME_DROPDOWN = 'auto-complete-dropdown';
  const CLASS_NAME_OPTIONS = 'auto-complete-options';
  const CLASS_NAME_OPTION = 'auto-complete-option';
  const CLASS_NAME_OPTIONS_EMPTY = 'auto-complete-options-empty';
  const CLASS_NAME_DISABLED = 'disabled';
  const CLASS_NAME_SHOW = 'show';
  const CLASS_NAME_CLEANER = 'auto-complete-cleaner';
  const CLASS_NAME_INDICATOR = 'auto-complete-indicator';
  const CLASS_NAME_IS_INVALID = 'is-invalid';
  const CLASS_NAME_IS_VALID = 'is-valid';

  // Default config mirrors CAutoComplete props where meaningful.
  const Default = {
    allowCreateOptions: false,
    allowOnlyDefinedOptions: false,
    cleaner: true,
    clearSearchOnSelect: true,
    container: false,
    // false | element | selector | true (-> body)
    disabled: false,
    globalSearch: true,
    hightlightOptionsOnSearch: true,
    id: null,
    invalid: false,
    loading: false,
    name: null,
    options: [],
    // array of Option | OptionsGroup | string
    optionsMaxHeight: 'auto',
    optionsTemplate: null,
    // fn(option) => HTML
    optionsGroupsTemplate: null,
    // fn(group) => HTML
    placeholder: '',
    readOnly: false,
    required: false,
    resetSelectionOnOptionsChange: false,
    search: true,
    // true | 'external'
    searchNoResultsLabel: 'No results found',
    showHints: true,
    size: null,
    // 'sm' | 'lg'
    valid: false,
    value: null,
    // initial string value
    // virtualScroller: false, // not implemented in vanilla; reserved
    visible: false,
    visibleItems: 10
  };

  // Type hints (string descriptors for BaseComponent._typeCheckConfig if used)
  const DefaultType = {
    allowCreateOptions: 'boolean',
    allowOnlyDefinedOptions: 'boolean',
    cleaner: 'boolean',
    clearSearchOnSelect: 'boolean',
    container: '(string|element|boolean)',
    disabled: 'boolean',
    globalSearch: 'boolean',
    hightlightOptionsOnSearch: 'boolean',
    id: '(string|null)',
    invalid: 'boolean',
    loading: 'boolean',
    name: '(string|null)',
    options: 'array',
    optionsMaxHeight: '(number|string)',
    optionsTemplate: '(function|null)',
    optionsGroupsTemplate: '(function|null)',
    placeholder: 'string',
    readOnly: 'boolean',
    required: 'boolean',
    resetSelectionOnOptionsChange: 'boolean',
    search: '(boolean|string)',
    searchNoResultsLabel: '(boolean|string)',
    showHints: 'boolean',
    size: '(string|null)',
    valid: 'boolean',
    value: '(string|null)',
    // virtualScroller: 'boolean',
    visible: 'boolean',
    visibleItems: 'number'
  };

  // ------------------------------------------------------------------------
  // Helpers for options dataset
  // ------------------------------------------------------------------------

  function normalizeOption(raw) {
    var _ref, _raw$label;
    // Accept string shorthand: 'foo' => { value: 'foo', label: 'foo' }
    if (typeof raw === 'string') {
      return {
        value: raw,
        label: raw
      };
    }

    // Group test
    if (raw && Array.isArray(raw.options)) {
      return {
        label: raw.label,
        options: raw.options.map(normalizeOption)
      };
    }

    // Single option
    const value = String(raw.value);
    return {
      value,
      label: (_ref = (_raw$label = raw.label) != null ? _raw$label : raw.text) != null ? _ref : value,
      disabled: Boolean(raw.disabled),
      selected: Boolean(raw.selected)
    };
  }
  function flattenOptions(options, flat = []) {
    for (const opt of options) {
      if (opt && Array.isArray(opt.options)) {
        flattenOptions(opt.options, flat);
        continue;
      }
      flat.push(opt);
    }
    return flat;
  }
  function getOptionLabel(opt) {
    var _ref2, _opt$label;
    return typeof opt === 'string' ? opt : (_ref2 = (_opt$label = opt.label) != null ? _opt$label : opt.text) != null ? _ref2 : String(opt.value);
  }
  function isOptionDisabled(opt) {
    return Boolean(opt && typeof opt === 'object' && opt.disabled);
  }

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class AutoComplete extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._indicatorElement = null;
      this._cleanerElement = null;
      this._dropdownElement = null;
      this._optionsElement = null;
      this._hintInputElement = null;
      this._inputElement = null;
      this._togglerElement = null;
      this._popper = null;
      this._options = this._getOptionsFromConfig(this._config.options);
      this._userOptions = [];
      this._selected = [];
      this._search = '';
      this._visible = this._config.visible;
      this._hint = null;
      this._createAutoComplete();
      this._addEventListeners();
      Data.set(this._element, DATA_KEY, this);

      // Initial value resolution (string or preselected flag)
      this._initInitialValue();
    }

    // Getters -----------------------------------------------------------------
    static get NAME() {
      return NAME;
    }
    static get Default() {
      return Default;
    }
    static get DefaultType() {
      return DefaultType;
    }

    // Public API ---------------------------------------------------------------
    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }
    show() {
      var _this$_inputElement;
      if (this._config.disabled || this._isShown()) {
        return;
      }
      if (this._filteredOptions().length === 0 && this._config.searchNoResultsLabel === false) {
        return;
      }
      EventHandler.trigger(this._element, EVENT_SHOW);
      this._clone.classList.add(CLASS_NAME_SHOW);
      this._clone.setAttribute('aria-expanded', true);
      if (this._config.container) {
        this._dropdownElement.style.minWidth = `${this._clone.offsetWidth}px`;
        this._dropdownElement.classList.add(CLASS_NAME_SHOW);
      }
      EventHandler.trigger(this._element, EVENT_SHOWN);
      this._createPopper();
      (_this$_inputElement = this._inputElement) == null || _this$_inputElement.focus();
    }
    hide() {
      EventHandler.trigger(this._element, EVENT_HIDE);
      if (this._popper) {
        this._popper.destroy();
      }
      this._clone.classList.remove(CLASS_NAME_SHOW);
      this._clone.setAttribute('aria-expanded', 'false');
      if (this._config.container) {
        this._dropdownElement.classList.remove(CLASS_NAME_SHOW);
      }
      EventHandler.trigger(this._element, EVENT_HIDDEN);
    }
    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }
      super.dispose();
    }
    update(config) {
      const reset = config && config.value !== undefined;
      this._config = {
        ...this._config,
        ...this._configAfterMerge(config)
      };
      this._options = this._getOptionsFromConfig(this._config.options);
      if (reset || this._config.resetSelectionOnOptionsChange) {
        this._selected = [];
      }
      this._clone.remove();
      this._element.innerHTML = '';
      this._createAutoComplete();
      this._addEventListeners();
    }
    getValue() {
      return this._selected.length ? this._selected[0] : null;
    }

    // Private ------------------------------------------------------------------

    _addEventListeners() {
      // toggle show when clicking group wrapper
      EventHandler.on(this._clone, EVENT_CLICK, () => {
        if (!this._config.disabled) {
          this.show();
        }
      });

      // keyboard from wrapper (globalSearch behaviour)
      EventHandler.on(this._clone, EVENT_KEYDOWN, event => {
        if (event.key === ESCAPE_KEY) {
          this.hide();
          return;
        }
        if (this._config.globalSearch && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) {
          var _this$_inputElement2;
          (_this$_inputElement2 = this._inputElement) == null || _this$_inputElement2.focus();
        }
      });

      // indicator button explicit toggle
      EventHandler.on(this._indicatorElement, EVENT_CLICK, event => {
        event.preventDefault();
        event.stopPropagation();
        this.toggle();
      });

      // cleaner button
      if (this._cleanerElement) {
        EventHandler.on(this._cleanerElement, EVENT_CLICK, event => {
          event.preventDefault();
          event.stopPropagation();
          this._clearSelection();
        });
      }

      // input typing
      EventHandler.on(this._inputElement, EVENT_INPUT, event => {
        const {
          value
        } = event.target;
        this._onInputChange(value);
      });
      EventHandler.on(this._inputElement, EVENT_KEYDOWN, event => this._onInputKeyDown(event));

      // options click delegate
      EventHandler.on(this._optionsElement, EVENT_CLICK, event => {
        event.preventDefault();
        event.stopPropagation();
        this._onOptionsClick(event.target);
      });

      // options keyboard
      EventHandler.on(this._optionsElement, EVENT_KEYDOWN, event => {
        if (event.key === ENTER_KEY) {
          this._onOptionsClick(event.target);
        }
        if ([ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key)) {
          event.preventDefault();
          this._selectMenuItem(event);
        }
      });
    }
    _onInputChange(text) {
      this._search = text;
      EventHandler.trigger(this._element, EVENT_INPUT, {
        value: text
      });
      this._filterOptionsList();
      this._updateHint();
      EventHandler.trigger(this._element, EVENT_SEARCH);
    }
    _onInputKeyDown(event) {
      if (event.key === ESCAPE_KEY) {
        this._getOrCreateOption();
        this.hide();
        return;
      }
      if (event.key === ARROW_DOWN_KEY) {
        event.preventDefault();
        this.show();
        const first = SelectorEngine.findOne(SELECTOR_AC_OPTION, this._optionsElement);
        if (first) {
          first.focus();
        }
        return;
      }
      if (this._config.showHints && this._hint && (event.key === ARROW_RIGHT_KEY || event.key === TAB_KEY)) {
        event.preventDefault();
        this._selectOption(this._hint);
        return;
      }
      if (event.key === ENTER_KEY) {
        this._getOrCreateOption();
        return;
      }
      if (event.key === BACKSPACE_KEY || event.key === DELETE_KEY) {
        this._clearSelection();
      }
    }
    _onOptionsClick(element) {
      if (!element.classList.contains(CLASS_NAME_OPTION)) {
        return;
      }
      const {
        value
      } = element.dataset;
      const opt = this._findOptionByValue(value);
      if (opt && isOptionDisabled(opt)) {
        return;
      }
      this._selectOption(opt || {
        value,
        label: value
      });
      if (this._config.clearSearchOnSelect) {
        this._onInputChange('');
        this._inputElement.value = '';
        this._inputElement.focus();
      }
      this.hide();
    }
    _selectMenuItem({
      key,
      target
    }) {
      const items = SelectorEngine.find(SELECTOR_AC_VISIBLE_ITEMS, this._dropdownElement).filter(el => index_js.isVisible(el));
      if (!items.length) {
        return;
      }
      index_js.getNextActiveElement(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus();
    }
    _getOptionsFromConfig(options = []) {
      return options.map(normalizeOption);
    }
    _filteredOptions() {
      const all = [...this._options, ...this._userOptions];
      if (!this._search) {
        return all;
      }
      const s = this._search.toLowerCase();
      return all.filter(opt => {
        if (opt.options) {
          // group: include groups where any child matches
          return opt.options.some(o => getOptionLabel(o).toLowerCase().includes(s));
        }
        return getOptionLabel(opt).toLowerCase().includes(s);
      });
    }
    _filteredFlatOptions() {
      return flattenOptions(this._filteredOptions());
    }
    _updateHint() {
      if (!this._config.showHints || !this._hintInputElement) {
        return;
      }
      const s = this._search;
      if (!s) {
        this._hint = null;
        this._hintInputElement.value = '';
        return;
      }
      const flat = this._filteredFlatOptions();
      const found = flat.find(opt => getOptionLabel(opt).toLowerCase().startsWith(s.toLowerCase()));
      this._hint = found || null;
      this._hintInputElement.value = found ? `${s}${getOptionLabel(found).slice(s.length)}` : '';
    }
    _getOrCreateOption() {
      const s = this._search.trim();
      if (s === '') {
        return;
      }
      const flat = this._filteredFlatOptions();
      const found = flat.find(opt => getOptionLabel(opt).toLowerCase() === s.toLowerCase());
      if (found && isOptionDisabled(found)) {
        return;
      }
      if (!found && this._config.allowOnlyDefinedOptions) {
        return;
      }
      if (found) {
        this._selectOption(found);
        return;
      }
      if (this._config.allowCreateOptions) {
        const userOpt = {
          value: s,
          label: s
        };
        this._userOptions.push(userOpt);
        this._selectOption(userOpt);
        return;
      }
      this._selectOption({
        value: s,
        label: s
      });
    }
    _selectOption(opt) {
      if (opt && opt.disabled) {
        return;
      }
      this._selected = opt ? [opt] : [];
      if (this._inputElement) {
        this._inputElement.value = opt ? getOptionLabel(opt) : '';
      }
      this._updateCleanerVisibility();
      EventHandler.trigger(this._element, EVENT_CHANGED, {
        value: this.getValue()
      });
    }
    _clearSelection() {
      this._selectOption(null);
    }
    _findOptionByValue(value, options = [...this._options, ...this._userOptions]) {
      for (const opt of options) {
        if (opt && Array.isArray(opt.options)) {
          const found = this._findOptionByValue(value, opt.options);
          if (found) {
            return found;
          }
          continue;
        }
        if (String(opt.value) === String(value)) {
          return opt;
        }
      }
      return null;
    }
    _filterOptionsList() {
      const s = this._search.toLowerCase();
      const options = SelectorEngine.find(SELECTOR_AC_OPTION, this._dropdownElement);
      let visibleOptions = 0;
      for (const option of options) {
        const match = option.textContent.toLowerCase().includes(s);
        if (match) {
          option.style.removeProperty('display');
          visibleOptions++;
        } else {
          option.style.display = 'none';
        }
      }
      if (visibleOptions > 0) {
        const empty = SelectorEngine.findOne(SELECTOR_AC_OPTIONS_EMPTY, this._dropdownElement);
        if (empty) {
          empty.remove();
        }
        return;
      }
      if (visibleOptions === 0) {
        const placeholder = document.createElement('div');
        placeholder.classList.add(CLASS_NAME_OPTIONS_EMPTY);
        placeholder.innerHTML = this._config.searchNoResultsLabel;
        const container = SelectorEngine.findOne(SELECTOR_AC_OPTIONS, this._dropdownElement);
        if (container && !SelectorEngine.findOne(SELECTOR_AC_OPTIONS_EMPTY, container)) {
          container.append(placeholder);
        }
      }
    }
    _createAutoComplete() {
      // root clone
      const acEl = document.createElement('div');
      acEl.classList.add(CLASS_NAME_AC);
      acEl.classList.toggle(CLASS_NAME_IS_INVALID, this._config.invalid);
      acEl.classList.toggle(CLASS_NAME_IS_VALID, this._config.valid);
      acEl.setAttribute('aria-expanded', 'false');
      if (this._config.disabled) {
        acEl.classList.add(CLASS_NAME_DISABLED);
      }
      if (this._config.size) {
        acEl.classList.add(`${CLASS_NAME_AC}-${this._config.size}`);
      }

      // copy any extra classes from source element
      for (const className of this._element.classList) {
        acEl.classList.add(className);
      }
      this._clone = acEl;
      this._element.parentNode.insertBefore(acEl, this._element.nextSibling);

      // input group
      const inputGroupEl = document.createElement('div');
      inputGroupEl.classList.add(CLASS_NAME_INPUT_GROUP);
      this._togglerElement = inputGroupEl;
      acEl.append(inputGroupEl);

      // hint input (readonly overlay) if enabled
      if (this._config.showHints) {
        const hintEl = document.createElement('input');
        hintEl.classList.add('form-control', CLASS_NAME_SELECTION, CLASS_NAME_HINT);
        hintEl.autocomplete = 'off';
        hintEl.readOnly = true;
        hintEl.tabIndex = -1;
        inputGroupEl.append(hintEl);
        this._hintInputElement = hintEl;
      }

      // main text input
      const inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.classList.add('form-control', CLASS_NAME_SELECTION);
      if (this._config.disabled) {
        inputEl.disabled = true;
      }
      if (this._config.id) {
        inputEl.id = this._config.id;
      }
      if (this._config.name) {
        inputEl.name = this._config.name;
      }
      if (this._config.placeholder) {
        inputEl.placeholder = this._config.placeholder;
      }
      inputEl.autocomplete = 'off';
      inputEl.required = Boolean(this._config.required);
      inputEl.readOnly = Boolean(this._config.readOnly);
      inputEl.setAttribute('aria-autocomplete', 'list');
      inputEl.setAttribute('role', 'combobox');
      inputGroupEl.append(inputEl);
      this._inputElement = inputEl;

      // buttons
      const buttonsEl = document.createElement('div');
      buttonsEl.classList.add('auto-complete-buttons');
      inputGroupEl.append(buttonsEl);
      if (!this._config.disabled && !this._config.readOnly && this._config.cleaner) {
        const cleanerEl = document.createElement('button');
        cleanerEl.type = 'button';
        cleanerEl.classList.add(CLASS_NAME_CLEANER);
        buttonsEl.append(cleanerEl);
        this._cleanerElement = cleanerEl;
      }
      const indicatorEl = document.createElement('button');
      indicatorEl.type = 'button';
      indicatorEl.classList.add(CLASS_NAME_INDICATOR);
      if (this._config.disabled) {
        indicatorEl.tabIndex = -1;
      }
      buttonsEl.append(indicatorEl);
      this._indicatorElement = indicatorEl;

      // dropdown container
      const dropdownEl = document.createElement('div');
      dropdownEl.classList.add(CLASS_NAME_DROPDOWN);
      dropdownEl.setAttribute('role', 'menu');
      if (this._config.container) ; else {
        acEl.append(dropdownEl);
      }
      this._dropdownElement = dropdownEl;

      // options container
      const optionsEl = document.createElement('div');
      optionsEl.classList.add(CLASS_NAME_OPTIONS);
      if (this._config.optionsMaxHeight !== 'auto') {
        optionsEl.style.maxHeight = `${this._config.optionsMaxHeight}px`;
        optionsEl.style.overflow = 'auto';
      }
      dropdownEl.append(optionsEl);
      this._optionsElement = optionsEl;

      // create options markup
      this._createOptions(optionsEl, this._options);

      // hide source element (if <select> etc.)
      this._hideNativeElement();

      // ensure container
      const {
        container
      } = this._config;
      if (container) {
        const _container = container === true ? document.body : index_js.getElement(container);
        _container.append(dropdownEl);
      }

      // reflect initial show state if configured
      if (this._visible) {
        this.show();
      }
      this._updateCleanerVisibility();
    }
    _createOptions(parent, options) {
      for (const opt of options) {
        if (Array.isArray(opt.options)) {
          const labelEl = document.createElement('div');
          labelEl.classList.add('auto-complete-optgroup-label');
          labelEl.innerHTML = opt.label;
          parent.append(labelEl);
          this._createOptions(parent, opt.options);
          continue;
        }
        const optEl = document.createElement('div');
        optEl.classList.add(CLASS_NAME_OPTION);
        if (opt.disabled) {
          optEl.classList.add(CLASS_NAME_DISABLED);
        }
        optEl.dataset.value = String(opt.value);
        optEl.tabIndex = 0;
        optEl.innerHTML = this._renderOptionContent(opt);
        parent.append(optEl);
      }
    }
    _renderOptionContent(opt) {
      if (this._config.optionsTemplate) {
        try {
          return this._config.optionsTemplate(opt);
        } catch (_unused) {/* ignore */}
      }
      if (this._config.hightlightOptionsOnSearch && this._search) {
        const label = getOptionLabel(opt);
        const idx = label.toLowerCase().indexOf(this._search.toLowerCase());
        if (idx !== -1) {
          const before = label.slice(0, idx);
          const match = label.slice(idx, idx + this._search.length);
          const after = label.slice(idx + this._search.length);
          return `${before}<mark>${match}</mark>${after}`;
        }
        return label;
      }
      return getOptionLabel(opt);
    }
    _hideNativeElement() {
      this._element.tabIndex = -1;
      this._element.style.display = 'none';
    }
    _initInitialValue() {
      const cfgVal = this._config.value;
      if (cfgVal && typeof cfgVal === 'string') {
        const found = this._findOptionByValue(cfgVal) || {
          value: cfgVal,
          label: cfgVal
        };
        this._selectOption(found);
        return;
      }

      // look for preselected in options
      const flat = flattenOptions(this._options);
      const pre = flat.find(o => o.selected);
      if (pre) {
        this._selectOption(pre);
      }
    }
    _updateCleanerVisibility() {
      if (!this._cleanerElement) {
        return;
      }
      if (this._selected.length > 0) {
        this._cleanerElement.style.removeProperty('display');
        return;
      }
      this._cleanerElement.style.display = 'none';
    }
    _createPopper() {
      if (typeof Popper__namespace === 'undefined') {
        throw new TypeError('CoreUI\'s auto complete require Popper (https://popper.js.org)');
      }
      const popperConfig = {
        modifiers: [{
          name: 'preventOverflow',
          options: {
            boundary: 'clippingParents'
          }
        }, {
          name: 'offset',
          options: {
            offset: [0, 2]
          }
        }],
        placement: index_js.isRTL() ? 'bottom-end' : 'bottom-start'
      };
      this._popper = Popper__namespace.createPopper(this._togglerElement, this._dropdownElement, popperConfig);
    }
    _isShown() {
      return this._clone.classList.contains(CLASS_NAME_SHOW);
    }
    _configAfterMerge(config = {}) {
      if (config.container === true) {
        config.container = document.body;
      }
      if (typeof config.container === 'object' || typeof config.container === 'string') {
        config.container = index_js.getElement(config.container);
      }
      if (typeof config.options === 'string') {
        config.options = config.options.split(/,\s*/).map(String);
      }
      return config;
    }
  }

  // ------------------------------------------------------------------------
  // Data API implementation ----------------------------------------------------
  // ------------------------------------------------------------------------

  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    for (const ac of SelectorEngine.find(SELECTOR_AC)) {
      if (ac.tabIndex !== -1) {
        AutoComplete.autoCompleteInterface(ac);
      }
    }
  });
  EventHandler.on(document, EVENT_CLICK_DATA_API, clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, clearMenus);
  function clearMenus(event) {
    if (event && (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY)) {
      return;
    }
    const acs = SelectorEngine.find(SELECTOR_AC);
    for (const el of acs) {
      const context = Data.get(el, DATA_KEY);
      const relatedTarget = {
        relatedTarget: el
      };
      if (event && event.type === 'click') {
        relatedTarget.clickEvent = event;
      }
      if (!context) {
        continue;
      }
      if (!context._clone.classList.contains(CLASS_NAME_SHOW)) {
        continue;
      }
      if (context._clone.contains(event.target)) {
        continue;
      }
      context.hide();
      EventHandler.trigger(context._element, EVENT_HIDDEN, relatedTarget);
    }
  }

  // Static interface + jQuery bridge ------------------------------------------

  AutoComplete.autoCompleteInterface = function (element, config) {
    const data = AutoComplete.getOrCreateInstance(element, config);
    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config]();
    }
  };
  AutoComplete.jQueryInterface = function (config) {
    return this.each(function () {
      AutoComplete.autoCompleteInterface(this, config);
    });
  };
  index_js.defineJQueryPlugin(AutoComplete);

  return AutoComplete;

}));
//# sourceMappingURL=auto-complete copy.js.map
