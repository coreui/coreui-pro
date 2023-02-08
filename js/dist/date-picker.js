/*!
  * CoreUI date-picker.js v4.4.3 (https://coreui.io)
  * Copyright 2023 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://coreui.io)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./util/index'), require('./dom/event-handler'), require('./dom/selector-engine'), require('./date-range-picker')) :
  typeof define === 'function' && define.amd ? define(['./util/index', './dom/event-handler', './dom/selector-engine', './date-range-picker'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DatePicker = factory(global.index, global.EventHandler, global.SelectorEngine, global.DateRangePicker));
})(this, (function (index, EventHandler, SelectorEngine, DateRangePicker) { 'use strict';

  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO (v4.4.3): date-picker.js
   * License (https://coreui.io/pro/license-new/)
   * --------------------------------------------------------------------------
   */

  /**
  * ------------------------------------------------------------------------
  * Constants
  * ------------------------------------------------------------------------
  */

  const NAME = 'date-picker';
  const DATA_KEY = 'coreui.date-picker';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
  const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="date-picker"]';
  const Default = {
    ...DateRangePicker.Default,
    calendars: 1,
    placeholder: ['Select date'],
    range: false,
    separator: false
  };
  const DefaultType = {
    ...DateRangePicker.DefaultType,
    date: '(date|string|null)'
  };

  /**
  * ------------------------------------------------------------------------
  * Class Definition
  * ------------------------------------------------------------------------
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

    _addCalendarEventListeners() {
      super._addCalendarEventListeners();
      for (const calendar of SelectorEngine.find('.calendar', this._element)) {
        EventHandler.on(calendar, 'startDateChange.coreui.calendar', event => {
          this._startDate = event.date;
          this._selectEndDate = event.selectEndDate;
          this._startInput.value = this._setInputValue(event.date);
          this._updateCalendars();
          EventHandler.trigger(this._element, EVENT_DATE_CHANGE, {
            date: event.date,
            formatedDate: event.date ? this._formatDate(event.date) : undefined
          });
        });
      }
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
        const data = DatePicker.getOrCreateInstance(this);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  }

  /**
  * ------------------------------------------------------------------------
  * Data Api implementation
  * ------------------------------------------------------------------------
  */

  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    const datePickers = SelectorEngine.find(SELECTOR_DATA_TOGGLE);
    for (let i = 0, len = datePickers.length; i < len; i++) {
      DatePicker.datePickerInterface(datePickers[i]);
    }
  });

  /**
  * ------------------------------------------------------------------------
  * jQuery
  * ------------------------------------------------------------------------
  * add .DatePicker to jQuery only if jQuery is present
  */

  index.defineJQueryPlugin(DatePicker);

  return DatePicker;

}));
//# sourceMappingURL=date-picker.js.map
