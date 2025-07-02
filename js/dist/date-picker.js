/*!
  * CoreUI date-picker.js v5.15.0 (https://coreui.io)
  * Copyright 2025 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./date-range-picker.js'), require('./dom/event-handler.js'), require('./dom/selector-engine.js'), require('./util/index.js')) :
  typeof define === 'function' && define.amd ? define(['./date-range-picker', './dom/event-handler', './dom/selector-engine', './util/index'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DatePicker = factory(global.DateRangePicker, global.EventHandler, global.SelectorEngine, global.Index));
})(this, (function (DateRangePicker, EventHandler, SelectorEngine, index_js) { 'use strict';

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO date-picker.js
   * License (https://coreui.io/pro/license/)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME = 'date-picker';
  const DATA_KEY = 'coreui.date-picker';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const TAB_KEY = 'Tab';
  const RIGHT_MOUSE_BUTTON = 2;
  const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`;
  const EVENT_HIDE = `hide${EVENT_KEY}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  const EVENT_SHOW = `show${EVENT_KEY}`;
  const EVENT_SHOWN = `shown${EVENT_KEY}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
  const CLASS_NAME_SHOW = 'show';
  const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="date-picker"]:not(.disabled):not(:disabled)';
  const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE}.${CLASS_NAME_SHOW}`;
  const Default = {
    ...DateRangePicker.Default,
    calendars: 1,
    placeholder: ['Select date'],
    range: false,
    separator: false
  };
  const DefaultType = {
    ...DateRangePicker.DefaultType,
    date: '(date|number|string|null)'
  };

  /**
   * Class definition
   */

  class DatePicker extends DateRangePicker {
    // Getters
    static get Default() {
      return Default;
    }
    static get DefaultType() {
      return DefaultType;
    }
    static get NAME() {
      return NAME;
    }

    // Overrides
    _addEventListeners() {
      super._addEventListeners();
      EventHandler.on(this._element, 'startDateChange.coreui.date-range-picker', event => {
        EventHandler.trigger(this._element, EVENT_DATE_CHANGE, {
          date: event.date
        });
      });
      EventHandler.on(this._element, 'show.coreui.date-range-picker', () => {
        EventHandler.trigger(this._element, EVENT_SHOW);
      });
      EventHandler.on(this._element, 'shown.coreui.date-range-picker', () => {
        EventHandler.trigger(this._element, EVENT_SHOWN);
      });
      EventHandler.on(this._element, 'hide.coreui.date-range-picker', () => {
        EventHandler.trigger(this._element, EVENT_HIDE);
      });
      EventHandler.on(this._element, 'hidden.coreui.date-range-picker', () => {
        EventHandler.trigger(this._element, EVENT_HIDDEN);
      });
    }

    // Static
    static datePickerInterface(element, config) {
      const data = DatePicker.getOrCreateInstance(element, config);
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      }
    }
    static jQueryInterface(config) {
      return this.each(function () {
        const data = DatePicker.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
    static clearMenus(event) {
      if (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY) {
        return;
      }
      const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
      for (const toggle of openToggles) {
        const context = DatePicker.getInstance(toggle);
        if (!context) {
          continue;
        }
        const composedPath = event.composedPath();
        if (composedPath.includes(context._element)) {
          continue;
        }
        ({
          relatedTarget: context._element
        });
        if (event.type === 'click') ;
        context.hide();
      }
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    const datePickers = SelectorEngine.find(SELECTOR_DATA_TOGGLE);
    for (let i = 0, len = datePickers.length; i < len; i++) {
      DatePicker.datePickerInterface(datePickers[i]);
    }
  });
  EventHandler.on(document, EVENT_CLICK_DATA_API, DatePicker.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, DatePicker.clearMenus);

  /**
   * jQuery
   */

  index_js.defineJQueryPlugin(DatePicker);

  return DatePicker;

}));
//# sourceMappingURL=date-picker.js.map
