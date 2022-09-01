/*!
  * CoreUI loading-button.js v4.3.4 (https://coreui.io)
  * Copyright 2022 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://coreui.io)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./util/index'), require('./dom/data'), require('./dom/event-handler'), require('./dom/manipulator'), require('./base-component')) :
  typeof define === 'function' && define.amd ? define(['./util/index', './dom/data', './dom/event-handler', './dom/manipulator', './base-component'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.LoadingButton = factory(global.Index, global.Data, global.EventHandler, global.Manipulator, global.BaseComponent));
})(this, (function (index, Data, EventHandler, Manipulator, BaseComponent) { 'use strict';

  const _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { default: e };

  const Data__default = /*#__PURE__*/_interopDefaultLegacy(Data);
  const EventHandler__default = /*#__PURE__*/_interopDefaultLegacy(EventHandler);
  const Manipulator__default = /*#__PURE__*/_interopDefaultLegacy(Manipulator);
  const BaseComponent__default = /*#__PURE__*/_interopDefaultLegacy(BaseComponent);

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO (v4.3.4): loading-button.js
   * License (https://coreui.io/pro/license-new/)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'loading-button';
  const DATA_KEY = 'coreui.loading-button';
  const EVENT_KEY = `.${DATA_KEY}`;
  const EVENT_START = `start${EVENT_KEY}`;
  const EVENT_STOP = `stop${EVENT_KEY}`;
  const CLASS_NAME_IS_LOADING = 'is-loading';
  const CLASS_NAME_LOADING_BUTTON_SPINNER = 'btn-loading-spinner';
  const Default = {
    disabledOnLoading: false,
    spinner: true,
    spinnerType: 'border',
    timeout: false
  };
  const DefaultType = {
    disabledOnLoading: 'boolean',
    spinner: 'boolean',
    spinnerType: 'string',
    timeout: '(boolean|number)'
  };
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class LoadingButton extends BaseComponent__default.default {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._timeout = this._config.timeout;
      this._spinner = null;
      this._state = 'idle';

      if (this._element) {
        Data__default.default.set(element, DATA_KEY, this);
      }
    } // Getters


    static get Default() {
      return Default;
    }

    static get DefaultType() {
      return DefaultType;
    }

    static get DATA_KEY() {
      return DATA_KEY;
    }

    static get NAME() {
      return NAME;
    } // Public


    start() {
      if (this._state !== 'loading') {
        this._createSpinner();

        this._state = 'loading';
        setTimeout(() => {
          this._element.classList.add(CLASS_NAME_IS_LOADING);

          EventHandler__default.default.trigger(this._element, EVENT_START);

          if (this._config.disabledOnLoading) {
            this._element.setAttribute('disabled', true);
          }
        }, 1);

        if (this._config.timeout) {
          setTimeout(() => {
            this.stop();
          }, this._config.timeout);
        }
      }
    }

    stop() {
      this._element.classList.remove(CLASS_NAME_IS_LOADING);

      const stoped = () => {
        this._removeSpinner();

        this._state = 'idle';

        if (this._config.disabledOnLoading) {
          this._element.removeAttribute('disabled');
        }

        EventHandler__default.default.trigger(this._element, EVENT_STOP);
      };

      if (this._spinner) {
        this._queueCallback(stoped, this._spinner, true);

        return;
      }

      stoped();
    }

    dispose() {
      Data__default.default.removeData(this._element, DATA_KEY);
      this._element = null;
    }

    _getConfig(config) {
      config = { ...Default,
        ...Manipulator__default.default.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      return config;
    }

    _createSpinner() {
      if (this._config.spinner) {
        const spinner = document.createElement('span');
        const type = this._config.spinnerType;
        spinner.classList.add(CLASS_NAME_LOADING_BUTTON_SPINNER, `spinner-${type}`, `spinner-${type}-sm`);
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-hidden', 'true');

        this._element.insertBefore(spinner, this._element.firstChild);

        this._spinner = spinner;
      }
    }

    _removeSpinner() {
      if (this._config.spinner) {
        this._spinner.remove();

        this._spinner = null;
      }
    } // Static


    static loadingButtonInterface(element, config) {
      const data = LoadingButton.getOrCreateInstance(element, config);

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      }
    }

    static jQueryInterface(config) {
      return this.each(function () {
        LoadingButton.loadingButtonInterface(this, config);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .LoadingButton to jQuery only if jQuery is present
   */


  index.defineJQueryPlugin(LoadingButton);

  return LoadingButton;

}));
//# sourceMappingURL=loading-button.js.map
