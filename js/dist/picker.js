/*!
  * CoreUI picker.js v4.3.4 (https://coreui.io)
  * Copyright 2022 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://coreui.io)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./dom/event-handler'), require('./dom/manipulator'), require('./base-component'), require('./dropdown')) :
  typeof define === 'function' && define.amd ? define(['./dom/event-handler', './dom/manipulator', './base-component', './dropdown'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Picker = factory(global.EventHandler, global.Manipulator, global.BaseComponent, global.Dropdown));
})(this, (function (EventHandler, Manipulator, BaseComponent, Dropdown) { 'use strict';

  const _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { default: e };

  const EventHandler__default = /*#__PURE__*/_interopDefaultLegacy(EventHandler);
  const Manipulator__default = /*#__PURE__*/_interopDefaultLegacy(Manipulator);
  const BaseComponent__default = /*#__PURE__*/_interopDefaultLegacy(BaseComponent);
  const Dropdown__default = /*#__PURE__*/_interopDefaultLegacy(Dropdown);

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO (v4.3.4): picker.js
   * License (https://coreui.io/pro/license-new/)
   * --------------------------------------------------------------------------
   */
  /**
  * ------------------------------------------------------------------------
  * Constants
  * ------------------------------------------------------------------------
  */

  const NAME = 'picker';
  const DATA_KEY = 'coreui.picker';
  const EVENT_KEY = `.${DATA_KEY}`;
  const EVENT_CANCEL = `onCancelClick${EVENT_KEY}`;
  const Default = {
    cancelButton: 'Cancel',
    cancelButtonClasses: ['btn', 'btn-sm', 'btn-ghost-primary'],
    confirmButton: 'OK',
    confirmButtonClasses: ['btn', 'btn-sm', 'btn-primary'],
    container: 'dropdown',
    disabled: false,
    footer: false
  };
  const DefaultType = {
    cancelButton: '(boolean|string)',
    cancelButtonClasses: '(array|string)',
    confirmButton: '(boolean|string)',
    confirmButtonClasses: '(array|string)',
    container: 'string',
    disabled: 'boolean',
    footer: 'boolean'
  };
  /**
  * ------------------------------------------------------------------------
  * Class Definition
  * ------------------------------------------------------------------------
  */

  class Picker extends BaseComponent__default.default {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._dropdown = null; //

      this._dropdownEl = null;
      this._dropdownMenuEl = null;
      this._dropdownToggleEl = null;

      this._createPicker();
    } // Getters


    static get Default() {
      return Default;
    }

    static get DefaultType() {
      return DefaultType;
    }

    static get NAME() {
      return NAME;
    }

    _getButtonClasses(classes) {
      if (typeof classes === 'string') {
        return classes.split(' ');
      }

      return classes;
    } // Private


    _createDropdown() {
      const dropdownEl = document.createElement('div');
      dropdownEl.classList.add('picker');
      this._dropdownEl = dropdownEl;
      const dropdownToggleEl = document.createElement('div');
      this._dropdownToggleEl = dropdownToggleEl;

      if (!this._config.disabled) {
        Manipulator__default.default.setDataAttribute(dropdownToggleEl, 'toggle', 'dropdown');
      }

      const dropdownMenuEl = document.createElement('div');
      dropdownMenuEl.classList.add('dropdown-menu');
      this._dropdownMenuEl = dropdownMenuEl;
      dropdownEl.append(dropdownToggleEl, dropdownMenuEl);

      this._element.append(dropdownEl);

      this._dropdown = new Dropdown__default.default(dropdownToggleEl, {
        autoClose: 'outside'
      });
    }

    _createFooter() {
      const footerEl = document.createElement('div');
      footerEl.classList.add('picker-footer');
      footerEl.append(this._createFooterContent());

      if (this._config.cancelButton) {
        const cancelButtonEl = document.createElement('button');
        cancelButtonEl.classList.add(...this._getButtonClasses(this._config.cancelButtonClasses));
        cancelButtonEl.type = 'button';
        cancelButtonEl.innerHTML = this._config.cancelButton;
        cancelButtonEl.addEventListener('click', () => {
          this._dropdown.hide();

          EventHandler__default.default.trigger(this._element, EVENT_CANCEL);
        });
        footerEl.append(cancelButtonEl);
      }

      if (this._config.confirmButton) {
        const confirmButtonEl = document.createElement('button');
        confirmButtonEl.classList.add(...this._getButtonClasses(this._config.confirmButtonClasses));
        confirmButtonEl.type = 'button';
        confirmButtonEl.innerHTML = this._config.confirmButton;
        confirmButtonEl.addEventListener('click', () => {
          this._dropdown.hide();
        });
        footerEl.append(confirmButtonEl);
      }

      this._dropdownMenuEl.append(footerEl);
    }

    _createFooterContent() {
      return '';
    }

    _createPicker() {
      if (this._config.container === 'dropdown') {
        this._createDropdown();
      }

      if (this._config.footer || this._config.timepicker) {
        this._createFooter();
      }
    }

    _getConfig(config) {
      config = { ...this.constructor.Default,
        ...Manipulator__default.default.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      return config;
    }

  }

  return Picker;

}));
//# sourceMappingURL=picker.js.map
