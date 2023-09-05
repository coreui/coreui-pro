/*!
  * CoreUI calendar.js v5.0.0-alpha.1 (https://coreui.io)
  * Copyright 2023 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./base-component.js'), require('./dom/event-handler.js'), require('./dom/manipulator.js'), require('./dom/selector-engine.js'), require('./util/index.js'), require('./util/calendar.js')) :
  typeof define === 'function' && define.amd ? define(['./base-component', './dom/event-handler', './dom/manipulator', './dom/selector-engine', './util/index', './util/calendar'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Calendar = factory(global.BaseComponent, global.EventHandler, global.Manipulator, global.SelectorEngine, global.Index, global.Calendar));
})(this, (function (BaseComponent, EventHandler, Manipulator, SelectorEngine, index_js, calendar_js) { 'use strict';

  /* eslint-disable indent, multiline-ternary */
  /**
   * --------------------------------------------------------------------------
   * CoreUI PRO calendar.js
   * License (https://coreui.io/pro/license-new/)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME = 'calendar';
  const DATA_KEY = 'coreui.calendar';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const EVENT_CALENDAR_DATE_CHANGE = `calendarDateChange${EVENT_KEY}`;
  const EVENT_CALENDAR_MOUSE_LEAVE = `calendarMouseleave${EVENT_KEY}`;
  const EVENT_CELL_HOVER = `cellHover${EVENT_KEY}`;
  const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`;
  const EVENT_SELECT_END_CHANGE = `selectEndChange${EVENT_KEY}`;
  const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`;
  const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY}`;
  const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
  const CLASS_NAME_CALENDAR = 'calendar';
  const SELECTOR_CALENDAR = '.calendar';
  const SELECTOR_CALENDAR_CELL_INNER = '.calendar-cell-inner';
  const SELECTOR_CALENDAR_ROW = '.calendar-row';
  const Default = {
    calendarDate: null,
    calendars: 1,
    disabledDates: null,
    endDate: null,
    firstDayOfWeek: 1,
    locale: 'default',
    maxDate: null,
    minDate: null,
    range: true,
    selectAdjacementDays: false,
    selectEndDate: false,
    selectionType: 'day',
    showAdjacementDays: true,
    showWeekNumber: false,
    startDate: null,
    weekdayFormat: 2,
    weekNumbersLabel: null
  };
  const DefaultType = {
    calendarDate: '(date|string|null)',
    calendars: 'number',
    disabledDates: '(array|null)',
    endDate: '(date|string|null)',
    firstDayOfWeek: 'number',
    locale: 'string',
    maxDate: '(date|string|null)',
    minDate: '(date|string|null)',
    range: 'boolean',
    selectAdjacementDays: 'boolean',
    selectEndDate: 'boolean',
    selectionType: 'string',
    showAdjacementDays: 'boolean',
    showWeekNumber: 'boolean',
    startDate: '(date|string|null)',
    weekdayFormat: '(number|string)',
    weekNumbersLabel: '(string|null)'
  };

  /**
   * Class definition
   */

  class Calendar extends BaseComponent {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._calendarDate = calendar_js.convertToDateObject(this._config.calendarDate || this._config.startDate || this._config.endDate || new Date(), this._config.selectionType);
      this._startDate = calendar_js.convertToDateObject(this._config.startDate, this._config.selectionType);
      this._endDate = calendar_js.convertToDateObject(this._config.endDate, this._config.selectionType);
      this._hoverDate = null;
      this._selectEndDate = this._config.selectEndDate;
      if (this._config.selectionType === 'day' || this._config.selectionType === 'week') {
        this._view = 'days';
      }
      if (this._config.selectionType === 'month') {
        this._view = 'months';
      }
      if (this._config.selectionType === 'year') {
        this._view = 'years';
      }
      this._createCalendar();
      this._addEventListeners();
    }
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

    // Private
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_CALENDAR_CELL_INNER, event => {
        if (this._config.selectionType === 'week' && this._view === 'days') {
          return;
        }
        if (event.target.parentElement.classList.contains('disabled')) {
          return;
        }
        if ((event.target.parentElement.classList.contains('next') || event.target.parentElement.classList.contains('previous')) && !this._config.selectAdjacementDays) {
          return;
        }
        const date = new Date(Manipulator.getDataAttribute(event.target, 'date'));
        const cloneDate = new Date(date);
        const index = Manipulator.getDataAttribute(event.target.closest('.calendar-panel'), 'calendar-index');
        this._selectDate(date);
        if (this._view === 'days') {
          this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date);
        }
        if (this._view === 'months' && this._config.selectionType !== 'month') {
          this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date);
          this._view = 'days';
        }
        if (this._view === 'years' && this._config.selectionType !== 'year') {
          this._setCalendarDate(index ? new Date(cloneDate.setFullYear(cloneDate.getFullYear() - index)) : date);
          this._view = 'months';
        }
        this._updateCalendar();
      });
      EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_CALENDAR_CELL_INNER, event => {
        if (this._config.selectionType === 'week' && this._view === 'days') {
          return;
        }
        if (event.target.parentElement.classList.contains('disabled')) {
          return;
        }
        if ((event.target.parentElement.classList.contains('next') || event.target.parentElement.classList.contains('previous')) && !this._config.selectAdjacementDays) {
          return;
        }
        const date = new Date(Manipulator.getDataAttribute(event.target, 'date'));
        this._hoverDate = date;
        EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
          date: calendar_js.getDateBySelectionType(date, this._config.selectionType)
        });
      });
      EventHandler.on(this._element, EVENT_MOUSELEAVE, SELECTOR_CALENDAR_CELL_INNER, () => {
        if (this._config.selectionType === 'week' && this._view === 'days') {
          return;
        }
        this._hoverDate = null;
        EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
          date: null
        });
      });
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_CALENDAR_ROW, event => {
        if (this._config.selectionType !== 'week') {
          return;
        }
        if (event.target.parentElement.classList.contains('disabled')) {
          return;
        }
        const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL_INNER, event.target.closest(SELECTOR_CALENDAR_ROW));
        const date = new Date(Manipulator.getDataAttribute(firstCell, 'date'));
        this._selectDate(date);
        this._updateCalendar();
      });
      EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_CALENDAR_ROW, event => {
        if (this._config.selectionType !== 'week') {
          return;
        }
        if (event.target.parentElement.classList.contains('disabled')) {
          return;
        }
        const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL_INNER, event.target.closest(SELECTOR_CALENDAR_ROW));
        const date = new Date(Manipulator.getDataAttribute(firstCell, 'date'));
        EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
          date: calendar_js.getDateBySelectionType(date, this._config.selectionType)
        });
      });
      EventHandler.on(this._element, EVENT_MOUSELEAVE, SELECTOR_CALENDAR_ROW, () => {
        if (this._config.selectionType !== 'week') {
          return;
        }
        this._hoverDate = null;
        EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
          date: null
        });
      });

      // Navigation
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, '.btn-prev', event => {
        event.preventDefault();
        this._modifyCalendarDate(0, -1);
      });
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, '.btn-double-prev', event => {
        event.preventDefault();
        this._modifyCalendarDate(this._view === 'years' ? -10 : -1);
      });
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, '.btn-next', event => {
        event.preventDefault();
        this._modifyCalendarDate(0, 1);
      });
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, '.btn-double-next', event => {
        event.preventDefault();
        this._modifyCalendarDate(this._view === 'years' ? 10 : 1);
      });
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, '.btn-month', event => {
        event.preventDefault();
        this._view = 'months';
        this._updateCalendar();
      });
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, '.btn-year', event => {
        event.preventDefault();
        this._view = 'years';
        this._updateCalendar();
      });
      EventHandler.on(this._element, EVENT_MOUSELEAVE, 'table', () => {
        EventHandler.trigger(this._element, EVENT_CALENDAR_MOUSE_LEAVE);
      });
    }
    _setCalendarDate(date) {
      this._calendarDate = date;
      EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
        date
      });
    }
    _modifyCalendarDate(years, months = 0) {
      const year = this._calendarDate.getFullYear();
      const month = this._calendarDate.getMonth();
      const d = new Date(year, month, 1);
      if (years) {
        d.setFullYear(d.getFullYear() + years);
      }
      if (months) {
        d.setMonth(d.getMonth() + months);
      }
      this._calendarDate = d;
      if (this._view === 'days') {
        EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
          date: d
        });
      }
      this._updateCalendar();
    }
    _setEndDate(date) {
      this._endDate = date;
      EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, {
        date: calendar_js.getDateBySelectionType(this._endDate, this._config.selectionType)
      });
    }
    _setStartDate(date) {
      this._startDate = date;
      EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, {
        date: calendar_js.getDateBySelectionType(this._startDate, this._config.selectionType)
      });
    }
    _setSelectEndDate(value) {
      this._selectEndDate = value;
      EventHandler.trigger(this._element, EVENT_SELECT_END_CHANGE, {
        value
      });
    }
    _selectDate(date) {
      if (calendar_js.isDateDisabled(date, this._config.minDate, this._config.maxDate, this._config.disabledDates)) {
        return;
      }
      if (this._config.range) {
        if (this._selectEndDate) {
          this._setSelectEndDate(false);
          if (this._startDate && this._startDate > date) {
            this._setStartDate(null);
            this._setEndDate(null);
            return;
          }
          if (calendar_js.isDisableDateInRange(this._startDate, date, this._config.disabledDates)) {
            this._setStartDate(null);
            this._setEndDate(null);
            return;
          }
          this._setEndDate(date);
          return;
        }
        if (this._endDate && this._endDate < date) {
          this._setStartDate(null);
          this._setEndDate(null);
          return;
        }
        if (calendar_js.isDisableDateInRange(date, this._endDate, this._config.disabledDates)) {
          this._setStartDate(null);
          this._setEndDate(null);
          return;
        }
        this._setSelectEndDate(true);
        this._setStartDate(date);
        return;
      }
      this._setStartDate(date);
    }
    _createCalendarPanel(order) {
      var _this$_config$weekNum;
      const calendarDate = calendar_js.getCalendarDate(this._calendarDate, order, this._view);
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();
      const calendarPanelEl = document.createElement('div');
      calendarPanelEl.classList.add('calendar-panel');
      Manipulator.setDataAttribute(calendarPanelEl, 'calendar-index', order);

      // Create navigation
      const navigationElement = document.createElement('div');
      navigationElement.classList.add('calendar-nav');
      navigationElement.innerHTML = `
      <div class="calendar-nav-prev">
        <button class="btn btn-transparent btn-sm btn-double-prev">
          <span class="calendar-nav-icon calendar-nav-icon-double-prev"></span>
        </button>
        ${this._view === 'days' ? `<button class="btn btn-transparent btn-sm btn-prev">
          <span class="calendar-nav-icon calendar-nav-icon-prev"></span>
        </button>` : ''}
      </div>
      <div class="calendar-nav-date">
        ${this._view === 'days' ? `<button class="btn btn-transparent btn-sm btn-month">
          ${calendarDate.toLocaleDateString(this._config.locale, {
      month: 'long'
    })}
        </button>` : ''}
        <button class="btn btn-transparent btn-sm btn-year">
          ${calendarDate.toLocaleDateString(this._config.locale, {
      year: 'numeric'
    })}
        </button>
      </div>
      <div class="calendar-nav-next">
        ${this._view === 'days' ? `<button class="btn btn-transparent btn-sm btn-next">
          <span class="calendar-nav-icon calendar-nav-icon-next"></span>
        </button>` : ''}
        <button class="btn btn-transparent btn-sm btn-double-next">
          <span class="calendar-nav-icon calendar-nav-icon-double-next"></span>
        </button>
      </div>
    `;
      const monthDetails = calendar_js.getMonthDetails(year, month, this._config.firstDayOfWeek);
      const listOfMonths = calendar_js.createGroupsInArray(calendar_js.getMonthsNames(this._config.locale), 4);
      const listOfYears = calendar_js.createGroupsInArray(calendar_js.getYears(calendarDate.getFullYear()), 4);
      const weekDays = monthDetails[0].days;
      const calendarTable = document.createElement('table');
      calendarTable.innerHTML = `
    ${this._view === 'days' ? `
      <thead>
        <tr>
          ${this._config.showWeekNumber ? `<th class="calendar-cell">
              <div class="calendar-header-cell-inner">
               ${(_this$_config$weekNum = this._config.weekNumbersLabel) != null ? _this$_config$weekNum : ''}
              </div>
            </th>` : ''}
          ${weekDays.map(({
      date
    }) => `<th class="calendar-cell">
              <div class="calendar-header-cell-inner">
              ${typeof this._config.weekdayFormat === 'string' ? date.toLocaleDateString(this._config.locale, {
      weekday: this._config.weekdayFormat
    }) : date.toLocaleDateString(this._config.locale, {
      weekday: 'long'
    }).slice(0, this._config.weekdayFormat)}
              </div>
            </th>`).join('')}
        </tr>
      </thead>` : ''}
      <tbody>
        ${this._view === 'days' ? monthDetails.map(week => {
      const date = calendar_js.convertToDateObject(week.weekNumber === 0 ? `${calendarDate.getFullYear()}W53` : `${calendarDate.getFullYear()}W${week.weekNumber}`, this._config.selectionType);
      return `<tr class="calendar-row ${this._config.selectionType === 'week' && this._sharedClassNames(date)}">
              ${this._config.showWeekNumber ? `<th class="calendar-cell-week-number">${week.weekNumber === 0 ? 53 : week.weekNumber}</td>` : ''}
              ${week.days.map(({
        date,
        month
      }) => month === 'current' || this._config.showAdjacementDays ? `<td 
                  class="calendar-cell ${this._dayClassNames(date, month)}"
                  tabindex="${calendar_js.isDateDisabled(date, this._config.minDate, this._config.maxDate, this._config.disabledDates) ? -1 : 0}"
                  >
                  <div class="calendar-cell-inner day" data-coreui-date="${date}">
                    ${date.toLocaleDateString(this._config.locale, {
        day: 'numeric'
      })}
                  </div>
                </td>` : '<td></td>').join('')}</tr>`;
    }).join('') : ''}
        ${this._view === 'months' ? listOfMonths.map((row, index) => `<tr>
            ${row.map((month, idx) => {
      const date = new Date(calendarDate.getFullYear(), index * 3 + idx, 1);
      return `<td class="calendar-cell ${this._sharedClassNames(date)}">
                  <div class="calendar-cell-inner month" data-coreui-date="${date.toDateString()}">
                    ${month}
                  </div>
                </td>`;
    }).join('')}
          </tr>`).join('') : ''}
        ${this._view === 'years' ? listOfYears.map(row => `<tr>
            ${row.map(year => {
      const date = new Date(year, 0, 1);
      return `<td class="calendar-cell ${this._sharedClassNames(date)}">
                  <div class="calendar-cell-inner year" data-coreui-date="${date.toDateString()}">
                    ${year}
                  </div>
                </td>`;
    }).join('')}
          </tr>`).join('') : ''}
      </tbody>
    `;
      calendarPanelEl.append(navigationElement, calendarTable);
      return calendarPanelEl;
    }
    _createCalendar() {
      const calendarsEl = document.createElement('div');
      calendarsEl.classList.add('calendars');
      if (this._config.selectionType && this._view === 'days') {
        calendarsEl.classList.add(`select-${this._config.selectionType}`);
      }

      // eslint-disable-next-line no-unused-vars
      for (const [index, _] of Array.from({
        length: this._config.calendars
      }).entries()) {
        calendarsEl.append(this._createCalendarPanel(index));
      }
      this._element.classList.add(CLASS_NAME_CALENDAR);
      this._element.append(calendarsEl);
    }
    _updateCalendar() {
      this._element.innerHTML = '';
      this._createCalendar();
    }
    _dayClassNames(date, month) {
      const classNames = {
        ...(this._config.selectionType === 'day' && {
          clickable: month !== 'current' && this._config.selectAdjacementDays,
          disabled: calendar_js.isDateDisabled(date, this._config.minDate, this._config.maxDate, this._config.disabledDates),
          range: month === 'current' && calendar_js.isDateInRange(date, this._startDate, this._endDate),
          selected: calendar_js.isDateSelected(date, this._startDate, this._endDate)
        }),
        today: calendar_js.isToday(date),
        [month]: true
      };

      // eslint-disable-next-line unicorn/no-array-reduce
      const result = Object.keys(classNames).reduce((o, key) => {
        // eslint-disable-next-line no-unused-expressions
        classNames[key] === true && (o[key] = classNames[key]);
        return o;
      }, {});
      return Object.keys(result).join(' ');
    }
    _sharedClassNames(date) {
      const classNames = {
        disabled: calendar_js.isDateDisabled(date, this._config.minDate, this._config.maxDate, this._config.disabledDates),
        range: calendar_js.isDateInRange(date, this._startDate, this._endDate),
        selected: calendar_js.isDateSelected(date, this._startDate, this._endDate)
      };

      // eslint-disable-next-line unicorn/no-array-reduce
      const result = Object.keys(classNames).reduce((o, key) => {
        // eslint-disable-next-line no-unused-expressions
        classNames[key] === true && (o[key] = classNames[key]);
        return o;
      }, {});
      return Object.keys(result).join(' ');
    }
    _getConfig(config) {
      config = {
        ...this.constructor.Default,
        ...Manipulator.getDataAttributes(this._element),
        ...config
      };
      return config;
    }

    // Static

    static calendarInterface(element, config) {
      const data = Calendar.getOrCreateInstance(element, config);
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      }
    }
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Calendar.getOrCreateInstance(this);
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
   * Data API implementation
   */

  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    for (const element of Array.from(document.querySelectorAll(SELECTOR_CALENDAR))) {
      Calendar.calendarInterface(element);
    }
  });

  /**
   * jQuery
   */

  index_js.defineJQueryPlugin(Calendar);

  return Calendar;

}));
//# sourceMappingURL=calendar.js.map
