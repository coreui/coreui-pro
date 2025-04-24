/*!
  * CoreUI input-password.js v5.10.0 (https://coreui.io)
  * Copyright 2025 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./base-component.js'), require('./dom/event-handler.js'), require('./dom/selector-engine.js'), require('./util/index.js')) :
  typeof define === 'function' && define.amd ? define(['./base-component', './dom/event-handler', './dom/selector-engine', './util/index'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.InputPassword = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.Index));
})(this, (function (BaseComponent, EventHandler, SelectorEngine, index_js) { 'use strict';

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO password-input.js
   * License (https://coreui.io/pro/license/)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME = 'password-input';
  const DATA_KEY = 'coreui.password-input';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
  const SELECTOR_FORM_CONTROL = '.form-control';
  const SELECTOR_DATA_TOGGLE = `${SELECTOR_FORM_CONTROL}:not([disabled]) ~ [data-coreui-toggle="password"]`;

  /**
   * Class definition
   */

  class PasswordInput extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME;
    }

    // Public
    toggle() {
      this._element.type = this._element.type === 'password' ? 'text' : 'password';
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = PasswordInput.getOrCreateInstance(this);
        data[config](this);
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, event => {
    event.preventDefault();
    const toggler = event.target.closest(SELECTOR_DATA_TOGGLE);
    PasswordInput.getOrCreateInstance(SelectorEngine.findOne(SELECTOR_FORM_CONTROL, toggler.parentNode)).toggle();
  });

  /**
   * jQuery
   */

  index_js.defineJQueryPlugin(PasswordInput);

  return PasswordInput;

}));
//# sourceMappingURL=input-password.js.map
