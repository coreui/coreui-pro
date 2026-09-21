/*!
* CoreUI PRO calendar.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./dom/selector-engine.js"), require("./util/sanitizer.js"), require("./util/icons.js"), require("./util/index.js"), require("./util/calendar.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./dom/selector-engine.js",
		"./util/sanitizer.js",
		"./util/icons.js",
		"./util/index.js",
		"./util/calendar.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Calendar = factory(global.BaseComponent, global.EventHandler, global.Manipulator, global.SelectorEngine, global.Sanitizer, global.Icons, global.Index, global.Calendar));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_dom_selector_engine_js, js_src_util_sanitizer_js, js_src_util_icons_js, js_src_util_index_js, js_src_util_calendar_js) {
	//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	//#endregion
	js_src_base_component_js = __toESM(js_src_base_component_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_manipulator_js = __toESM(js_src_dom_manipulator_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/calendar.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO calendar.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "calendar";
	const EVENT_KEY = `.coreui.calendar`;
	const DATA_API_KEY = ".data-api";
	const ARROW_UP_KEY = "ArrowUp";
	const ARROW_RIGHT_KEY = "ArrowRight";
	const ARROW_DOWN_KEY = "ArrowDown";
	const ARROW_LEFT_KEY = "ArrowLeft";
	const ENTER_KEY = "Enter";
	const SPACE_KEY = "Space";
	const HOME_KEY = "Home";
	const END_KEY = "End";
	const PAGE_UP_KEY = "PageUp";
	const PAGE_DOWN_KEY = "PageDown";
	const EVENT_BLUR = `blur${EVENT_KEY}`;
	const EVENT_CALENDAR_DATE_CHANGE = `calendarDateChange${EVENT_KEY}`;
	const EVENT_CALENDAR_MOUSE_LEAVE = `calendarMouseleave${EVENT_KEY}`;
	const EVENT_CALENDAR_VIEW_CHANGE = `calendarViewChange${EVENT_KEY}`;
	const EVENT_CELL_HOVER = `cellHover${EVENT_KEY}`;
	const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`;
	const EVENT_FOCUS = `focus${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const EVENT_SELECT_END_CHANGE = `selectEndChange${EVENT_KEY}`;
	const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`;
	const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY}`;
	const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_CALENDAR_CELL = "calendar-cell";
	const CLASS_NAME_CALENDAR_CELL_INNER = "calendar-cell-inner";
	const CLASS_NAME_CALENDAR_ROW = "calendar-row";
	const CLASS_NAME_CALENDARS = "calendars";
	const CLASS_NAME_SHOW_WEEK_NUMBERS = "show-week-numbers";
	const SELECTOR_BTN_DOUBLE_NEXT = ".btn-double-next";
	const SELECTOR_BTN_DOUBLE_PREV = ".btn-double-prev";
	const SELECTOR_BTN_MONTH = ".btn-month";
	const SELECTOR_BTN_NEXT = ".btn-next";
	const SELECTOR_BTN_PREV = ".btn-prev";
	const SELECTOR_BTN_YEAR = ".btn-year";
	const SELECTOR_CALENDAR = ".calendar";
	const SELECTOR_CALENDAR_CELL = ".calendar-cell";
	const SELECTOR_CALENDAR_CELL_CLICKABLE = `${SELECTOR_CALENDAR_CELL}[tabindex="0"]`;
	const SELECTOR_CALENDAR_ROW = ".calendar-row";
	const SELECTOR_CALENDAR_ROW_CLICKABLE = `${SELECTOR_CALENDAR_ROW}[tabindex="0"]`;
	const SELECTOR_DATA_CALENDAR = "[data-coreui-calendar]";
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaNavNextMonthLabel: "Next month",
		ariaNavNextYearLabel: "Next year",
		ariaNavPrevMonthLabel: "Previous month",
		ariaNavPrevYearLabel: "Previous year",
		calendarDate: null,
		calendars: 1,
		dayFormat: "numeric",
		disabledDates: null,
		endDate: null,
		firstDayOfWeek: 1,
		locale: "default",
		maxDate: null,
		minDate: null,
		monthFormat: "short",
		navIconDoubleNext: js_src_util_icons_js.CHEVRON_DOUBLE_RIGHT_ICON,
		navIconDoublePrev: js_src_util_icons_js.CHEVRON_DOUBLE_LEFT_ICON,
		navIconNext: js_src_util_icons_js.CHEVRON_RIGHT_ICON,
		navIconPrev: js_src_util_icons_js.CHEVRON_LEFT_ICON,
		range: false,
		renderDayCell: null,
		renderMonthCell: null,
		renderQuarterCell: null,
		renderYearCell: null,
		sanitize: true,
		sanitizeFn: null,
		selectAdjacentDays: false,
		selectEndDate: false,
		selectionType: "day",
		showAdjacentDays: true,
		showWeekNumber: false,
		startDate: null,
		weekdayFormat: 2,
		weekNumbersLabel: null,
		yearFormat: "numeric"
	};
	const DefaultType = {
		allowList: "object",
		ariaNavNextMonthLabel: "string",
		ariaNavNextYearLabel: "string",
		ariaNavPrevMonthLabel: "string",
		ariaNavPrevYearLabel: "string",
		calendarDate: "(date|number|string|null)",
		calendars: "number",
		dayFormat: "string",
		disabledDates: "(array|date|function|null)",
		endDate: "(date|number|string|null)",
		firstDayOfWeek: "number",
		locale: "string",
		maxDate: "(date|number|string|null)",
		minDate: "(date|number|string|null)",
		monthFormat: "string",
		navIconDoubleNext: "string",
		navIconDoublePrev: "string",
		navIconNext: "string",
		navIconPrev: "string",
		range: "boolean",
		renderDayCell: "(function|null)",
		renderMonthCell: "(function|null)",
		renderQuarterCell: "(function|null)",
		renderYearCell: "(function|null)",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		selectAdjacentDays: "boolean",
		selectEndDate: "boolean",
		selectionType: "string",
		showAdjacentDays: "boolean",
		showWeekNumber: "boolean",
		startDate: "(date|number|string|null)",
		weekdayFormat: "(number|string)",
		weekNumbersLabel: "(string|null)",
		yearFormat: "string"
	};
	/**
	* Class definition
	*/
	var Calendar = class Calendar extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element);
			this._formatters = /* @__PURE__ */ new Map();
			this._config = this._getConfig(config);
			this._initializeDates();
			this._initializeView();
			this._createCalendar();
			this._addEventListeners();
		}
		static get Default() {
			return Default;
		}
		static get DefaultType() {
			return DefaultType;
		}
		static get NAME() {
			return NAME;
		}
		setConfig(config) {
			this._config = this._getConfig({
				...this._config,
				...config
			});
			this._initializeDates();
			this._initializeView();
			this._element.innerHTML = "";
			this._createCalendar();
		}
		refresh() {
			this._element.innerHTML = "";
			this._createCalendar();
		}
		dispose() {
			this._element.innerHTML = "";
			this._element.classList.remove(CLASS_NAME_CALENDARS, CLASS_NAME_SHOW_WEEK_NUMBERS, `select-${this._config.selectionType}`);
			super.dispose();
		}
		_focusOnFirstAvailableCell() {
			const cell = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CALENDAR_CELL_CLICKABLE, this._element);
			if (cell) cell.focus();
		}
		_focusOnDate(date) {
			const focusables = js_src_dom_selector_engine_js.default.find(this._config.selectionType === "week" ? SELECTOR_CALENDAR_ROW_CLICKABLE : SELECTOR_CALENDAR_CELL_CLICKABLE, this._element).filter((element) => !element.classList.contains("previous") && !element.classList.contains("next"));
			let closest = null;
			let closestGap = Number.POSITIVE_INFINITY;
			for (const element of focusables) {
				const gap = Math.abs(this._getDate(element).getTime() - date.getTime());
				if (gap < closestGap) {
					closest = element;
					closestGap = gap;
				}
			}
			closest?.focus();
		}
		_getEventTarget(event) {
			return event.target.closest(SELECTOR_CALENDAR_CELL) ?? event.target.closest(SELECTOR_CALENDAR_ROW);
		}
		_getDate(target) {
			if (this._config.selectionType === "week") {
				const firstCell = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CALENDAR_CELL, target.closest(SELECTOR_CALENDAR_ROW));
				return new Date(js_src_dom_manipulator_js.default.getDataAttribute(firstCell, "date"));
			}
			return new Date(js_src_dom_manipulator_js.default.getDataAttribute(target, "date"));
		}
		_handleCalendarClick(event) {
			const target = this._getEventTarget(event);
			if (!target) return;
			const date = this._getDate(target);
			const cloneDate = new Date(date);
			const index = js_src_dom_manipulator_js.default.getDataAttribute(target.closest(SELECTOR_CALENDAR), "calendar-index");
			if (this._view === "days") this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date);
			if (this._view === "months" && this._config.selectionType !== "month") {
				this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date, "days");
				this._setCalendarView("days", "cellClick");
				this._updateCalendar(this._focusOnFirstAvailableCell.bind(this));
				return;
			}
			if (this._view === "years" && this._config.selectionType !== "year") {
				this._setCalendarDate(index ? new Date(cloneDate.setFullYear(cloneDate.getFullYear() - index)) : date, "months");
				this._setCalendarView(this._config.selectionType === "quarter" ? "quarters" : "months", "cellClick");
				this._updateCalendar(this._focusOnFirstAvailableCell.bind(this));
				return;
			}
			if ((0, js_src_util_calendar_js.isDateDisabled)(date, this._minDate, this._maxDate, this._config.disabledDates)) return;
			this._hoverDate = null;
			this._selectDate(date);
			this._updateClassNamesAndAriaLabels();
		}
		_handleCalendarKeydown(event) {
			const date = this._getDate(event.target);
			if (event.code === SPACE_KEY || event.key === ENTER_KEY) {
				event.preventDefault();
				this._handleCalendarClick(event);
			}
			if (event.key === HOME_KEY || event.key === END_KEY) {
				event.preventDefault();
				const cells = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR_CELL_CLICKABLE, event.target.closest("tr"));
				(event.key === HOME_KEY ? cells[0] : cells[cells.length - 1])?.focus();
				return;
			}
			if (event.key === PAGE_UP_KEY || event.key === PAGE_DOWN_KEY) {
				event.preventDefault();
				const direction = event.key === PAGE_DOWN_KEY ? 1 : -1;
				const target = new Date(date);
				if (this._view === "days") {
					const day = target.getDate();
					target.setDate(1);
					if (event.shiftKey) target.setFullYear(target.getFullYear() + direction);
					else target.setMonth(target.getMonth() + direction);
					target.setDate(Math.min(day, new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()));
				} else target.setFullYear(target.getFullYear() + (this._view === "years" ? 10 : 1) * direction);
				if (this._maxDate && target > this._maxDate) target.setTime(this._maxDate.getTime());
				if (this._minDate && target < this._minDate) target.setTime(this._minDate.getTime());
				if (target.getTime() === date.getTime()) return;
				const monthsDelta = (target.getFullYear() - date.getFullYear()) * 12 + (target.getMonth() - date.getMonth());
				this._modifyCalendarDate(0, monthsDelta, () => this._focusOnDate(target));
				return;
			}
			if (event.key === ARROW_RIGHT_KEY || event.key === ARROW_LEFT_KEY || event.key === ARROW_UP_KEY || event.key === ARROW_DOWN_KEY) {
				event.preventDefault();
				if (this._maxDate && date >= (0, js_src_util_calendar_js.convertToDateObject)(this._maxDate, this._config.selectionType) && (event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY)) return;
				if (this._minDate && date <= (0, js_src_util_calendar_js.convertToDateObject)(this._minDate, this._config.selectionType) && (event.key === ARROW_LEFT_KEY || event.key === ARROW_UP_KEY)) return;
				let element = event.target;
				if (this._config.selectionType === "week" && element.tabIndex === -1) element = element.closest(SELECTOR_CALENDAR_ROW_CLICKABLE);
				const list = js_src_dom_selector_engine_js.default.find(this._config.selectionType === "week" ? SELECTOR_CALENDAR_ROW_CLICKABLE : SELECTOR_CALENDAR_CELL_CLICKABLE, this._element);
				const index = list.indexOf(element);
				const first = index === 0;
				const last = index === list.length - 1;
				const toBoundary = {
					start: index,
					end: list.length - (index + 1)
				};
				const gap = {
					ArrowRight: 1,
					ArrowLeft: -1,
					ArrowUp: this._config.selectionType === "week" && this._view === "days" ? -1 : this._view === "days" ? -7 : -3,
					ArrowDown: this._config.selectionType === "week" && this._view === "days" ? 1 : this._view === "days" ? 7 : 3
				};
				if (event.key === ARROW_RIGHT_KEY && last || event.key === ARROW_DOWN_KEY && toBoundary.end < gap.ArrowDown || event.key === ARROW_LEFT_KEY && first || event.key === ARROW_UP_KEY && toBoundary.start < Math.abs(gap.ArrowUp)) {
					const callback = (key) => {
						const _list = js_src_dom_selector_engine_js.default.find(`${SELECTOR_CALENDAR_CELL_CLICKABLE}, ${SELECTOR_CALENDAR_ROW_CLICKABLE}`, this._element);
						if (_list.length && key === ARROW_RIGHT_KEY) _list[0].focus();
						if (_list.length && key === ARROW_LEFT_KEY) _list[_list.length - 1].focus();
						if (_list.length && key === ARROW_DOWN_KEY) _list[gap.ArrowDown - (list.length - index)].focus();
						if (_list.length && key === ARROW_UP_KEY) _list[_list.length - (Math.abs(gap.ArrowUp) + 1 - (index + 1))].focus();
					};
					if (this._view === "days") this._modifyCalendarDate(0, event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? 1 : -1, callback.bind(this, event.key));
					if (this._view === "months" || this._view === "quarters") this._modifyCalendarDate(event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? 1 : -1, 0, callback.bind(this, event.key));
					if (this._view === "years") this._modifyCalendarDate(event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? 10 : -10, 0, callback.bind(this, event.key));
					return;
				}
				if (list[index + gap[event.key]].tabIndex === 0) {
					list[index + gap[event.key]].focus();
					return;
				}
				for (let i = index; i < list.length; event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? i++ : i--) if (list[i + gap[event.key]].tabIndex === 0) {
					list[i + gap[event.key]].focus();
					break;
				}
			}
		}
		_handleCalendarMouseEnter(event) {
			const target = this._getEventTarget(event);
			if (!target) return;
			const date = this._getDate(target);
			if ((0, js_src_util_calendar_js.isDateDisabled)(date, this._minDate, this._maxDate, this._config.disabledDates)) return;
			this._hoverDate = (0, js_src_util_calendar_js.setTimeFromDate)(date, this._selectEndDate ? this._endDate : this._startDate);
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CELL_HOVER, { date: (0, js_src_util_calendar_js.getDateBySelectionType)(this._hoverDate, this._config.selectionType) });
			this._updateClassNamesAndAriaLabels();
		}
		_handleCalendarMouseLeave() {
			this._hoverDate = null;
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CELL_HOVER, { date: null });
			this._updateClassNamesAndAriaLabels();
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_CALENDAR_CELL_CLICKABLE, (event) => {
				this._handleCalendarClick(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, SELECTOR_CALENDAR_CELL_CLICKABLE, (event) => {
				this._handleCalendarKeydown(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSEENTER, SELECTOR_CALENDAR_CELL_CLICKABLE, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSELEAVE, SELECTOR_CALENDAR_CELL_CLICKABLE, () => {
				this._handleCalendarMouseLeave();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUS, SELECTOR_CALENDAR_CELL_CLICKABLE, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_BLUR, SELECTOR_CALENDAR_CELL_CLICKABLE, () => {
				this._handleCalendarMouseLeave();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_CALENDAR_ROW_CLICKABLE, (event) => {
				this._handleCalendarClick(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, SELECTOR_CALENDAR_ROW_CLICKABLE, (event) => {
				this._handleCalendarKeydown(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSEENTER, SELECTOR_CALENDAR_ROW_CLICKABLE, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSELEAVE, SELECTOR_CALENDAR_ROW_CLICKABLE, () => {
				this._handleCalendarMouseLeave();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUS, SELECTOR_CALENDAR_ROW_CLICKABLE, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_BLUR, SELECTOR_CALENDAR_ROW_CLICKABLE, () => {
				this._handleCalendarMouseLeave();
			});
			this._addNavigationEventListeners();
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSELEAVE, "table", () => {
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CALENDAR_MOUSE_LEAVE);
			});
		}
		_addNavigationEventListeners() {
			const navigationSelectors = {
				[SELECTOR_BTN_PREV]: () => this._modifyCalendarDate(0, -1),
				[SELECTOR_BTN_DOUBLE_PREV]: () => this._modifyCalendarDate(this._view === "years" ? -10 : -1),
				[SELECTOR_BTN_NEXT]: () => this._modifyCalendarDate(0, 1),
				[SELECTOR_BTN_DOUBLE_NEXT]: () => this._modifyCalendarDate(this._view === "years" ? 10 : 1),
				[SELECTOR_BTN_MONTH]: () => {
					this._setCalendarView("months", "navigation");
					this._updateCalendar();
				},
				[SELECTOR_BTN_YEAR]: () => {
					this._setCalendarView("years", "navigation");
					this._updateCalendar();
				}
			};
			for (const [selector, handler] of Object.entries(navigationSelectors)) js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK_DATA_API, selector, (event) => {
				event.preventDefault();
				const selectorIndex = js_src_dom_selector_engine_js.default.find(selector, this._element).indexOf(event.target.closest(selector));
				handler();
				const _selectors = js_src_dom_selector_engine_js.default.find(selector, this._element);
				if (_selectors && _selectors[selectorIndex]) _selectors[selectorIndex].focus();
			});
		}
		_setCalendarDate(date, view = this._view) {
			this._calendarDate = date;
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
				date,
				view
			});
		}
		_setCalendarView(view, source) {
			this._view = view;
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CALENDAR_VIEW_CHANGE, {
				view,
				source
			});
		}
		_modifyCalendarDate(years, months = 0, callback) {
			const year = this._calendarDate.getFullYear();
			const month = this._calendarDate.getMonth();
			const d = new Date(year, month, 1);
			if (years) d.setFullYear(d.getFullYear() + years);
			if (months) d.setMonth(d.getMonth() + months);
			this._calendarDate = d;
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
				date: d,
				view: this._view
			});
			this._updateCalendar(callback);
		}
		_setEndDate(date) {
			this._endDate = (0, js_src_util_calendar_js.setTimeFromDate)(date, this._endDate);
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_END_DATE_CHANGE, {
				date: (0, js_src_util_calendar_js.getDateBySelectionType)(this._endDate, this._config.selectionType),
				dateObject: this._endDate
			});
		}
		_setStartDate(date) {
			this._startDate = (0, js_src_util_calendar_js.setTimeFromDate)(date, this._startDate);
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_START_DATE_CHANGE, {
				date: (0, js_src_util_calendar_js.getDateBySelectionType)(this._startDate, this._config.selectionType),
				dateObject: this._startDate
			});
		}
		_setSelectEndDate(value) {
			this._selectEndDate = value;
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SELECT_END_CHANGE, { value });
		}
		_selectDate(date) {
			if ((0, js_src_util_calendar_js.isDateDisabled)(date, this._minDate, this._maxDate, this._config.disabledDates)) return;
			if (this._config.range) {
				if (this._selectEndDate) {
					if (this._startDate && this._startDate > date) {
						this._setStartDate(date);
						this._setEndDate(null);
						return;
					}
					this._setSelectEndDate(false);
					if ((0, js_src_util_calendar_js.isDisableDateInRange)(this._startDate, date, this._config.disabledDates)) {
						this._setStartDate(null);
						this._setEndDate(null);
						return;
					}
					this._setEndDate(date);
					return;
				}
				if (this._endDate && this._endDate < date) {
					this._setStartDate(date);
					this._setEndDate(null);
					this._setSelectEndDate(true);
					return;
				}
				if ((0, js_src_util_calendar_js.isDisableDateInRange)(date, this._endDate, this._config.disabledDates)) {
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
			const calendarDate = (0, js_src_util_calendar_js.getCalendarDate)(this._calendarDate, order, this._view);
			const year = calendarDate.getFullYear();
			const month = calendarDate.getMonth();
			const calendarPanelEl = document.createElement("div");
			calendarPanelEl.classList.add("calendar");
			js_src_dom_manipulator_js.default.setDataAttribute(calendarPanelEl, "calendar-index", order);
			const navigationElement = document.createElement("div");
			navigationElement.classList.add("calendar-nav");
			navigationElement.innerHTML = `
      <div class="calendar-nav-prev">
        <button type="button" class="calendar-nav-btn btn-double-prev" aria-label="${(0, js_src_util_sanitizer_js.escapeHtml)(this._config.ariaNavPrevYearLabel)}">
          <span class="calendar-nav-icon">${this._navIcon("navIconDoublePrev")}</span>
        </button>
        ${this._view === "days" ? `<button type="button" class="calendar-nav-btn btn-prev" aria-label="${(0, js_src_util_sanitizer_js.escapeHtml)(this._config.ariaNavPrevMonthLabel)}">
          <span class="calendar-nav-icon">${this._navIcon("navIconPrev")}</span>
        </button>` : ""}
      </div>
      <div class="calendar-nav-date" aria-live="polite">
        ${this._view === "days" ? `<button type="button" class="calendar-nav-btn btn-sm btn-month">
          ${this._formatDate(calendarDate, { month: "long" })}
        </button>` : ""}
        <button type="button" class="calendar-nav-btn btn-year">
          ${this._formatDate(calendarDate, { year: "numeric" })}
        </button>
      </div>
      <div class="calendar-nav-next">
        ${this._view === "days" ? `<button type="button" class="calendar-nav-btn btn-next" aria-label="${(0, js_src_util_sanitizer_js.escapeHtml)(this._config.ariaNavNextMonthLabel)}">
          <span class="calendar-nav-icon">${this._navIcon("navIconNext")}</span>
        </button>` : ""}
        <button type="button" class="calendar-nav-btn btn-double-next" aria-label="${(0, js_src_util_sanitizer_js.escapeHtml)(this._config.ariaNavNextYearLabel)}">
          <span class="calendar-nav-icon">${this._navIcon("navIconDoubleNext")}</span>
        </button>
      </div>
    `;
			const monthDetails = (0, js_src_util_calendar_js.getMonthDetails)(year, month, this._config.firstDayOfWeek);
			const listOfMonths = (0, js_src_util_calendar_js.createGroupsInArray)((0, js_src_util_calendar_js.getMonthsNames)(this._config.locale, this._config.monthFormat), 4);
			const listOfYears = (0, js_src_util_calendar_js.createGroupsInArray)((0, js_src_util_calendar_js.getYears)(calendarDate.getFullYear()), 4);
			const weekDays = monthDetails[0].days;
			const calendarTable = document.createElement("table");
			calendarTable.setAttribute("role", "grid");
			calendarTable.innerHTML = `
    ${this._view === "days" ? `
      <thead>
        <tr>
          ${this._config.showWeekNumber ? `<th class="${CLASS_NAME_CALENDAR_CELL}">
              <div class="calendar-header-cell-inner">
               ${this._config.weekNumbersLabel ? (0, js_src_util_sanitizer_js.escapeHtml)(this._config.weekNumbersLabel) : ""}
              </div>
            </th>` : ""}
          ${weekDays.map(({ date }) => `<th class="${CLASS_NAME_CALENDAR_CELL}" abbr="${this._formatDate(date, { weekday: "long" })}">
              <div class="calendar-header-cell-inner">
              ${typeof this._config.weekdayFormat === "string" ? this._formatDate(date, { weekday: this._config.weekdayFormat }) : this._formatDate(date, { weekday: "long" }).slice(0, this._config.weekdayFormat)}
              </div>
            </th>`).join("")}
        </tr>
      </thead>` : ""}
      <tbody>
        ${this._view === "days" ? monthDetails.map(({ week, days }) => {
				const { date } = days[0];
				const rowAttributes = this._rowWeekAttributes(date);
				return `<tr 
              class="${rowAttributes.className}"
              tabindex="${rowAttributes.tabIndex}"
              ${rowAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
            >
              ${this._config.showWeekNumber ? `<th class="calendar-cell-week-number">${week.number}</td>` : ""}
              ${days.map(({ date, month }) => {
					const cellAttributes = this._cellDayAttributes(date, month);
					return month === "current" || this._config.showAdjacentDays ? `<td
                    class="${cellAttributes.className}"
                    role="gridcell"
                    tabindex="${cellAttributes.tabIndex}"
                    ${cellAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
                    ${cellAttributes.ariaCurrent ? "aria-current=\"date\"" : ""}
                    aria-label="${(0, js_src_util_sanitizer_js.escapeHtml)(cellAttributes.ariaLabel)}"
                    data-coreui-date="${date}"
                  >
                    <div class="${CLASS_NAME_CALENDAR_CELL_INNER} day">
                      ${this._config.renderDayCell ? (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.renderDayCell(date, cellAttributes.meta), this._config) : this._formatDate(date, { day: this._config.dayFormat })}
                    </div>
                  </td>` : "<td role=\"gridcell\"></td>";
				}).join("")}</tr>`;
			}).join("") : ""}
        ${this._view === "months" ? listOfMonths.map((row, index) => `<tr>
            ${row.map((month, idx) => {
				const date = new Date(calendarDate.getFullYear(), index * 3 + idx, 1);
				const cellAttributes = this._cellMonthAttributes(date);
				return `<td
                  class="${cellAttributes.className}"
                  role="gridcell"
                  tabindex="${cellAttributes.tabIndex}"
                  ${cellAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
                  data-coreui-date="${date.toDateString()}"
                >
                  <div class="${CLASS_NAME_CALENDAR_CELL_INNER} month">
                    ${this._config.renderMonthCell ? (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.renderMonthCell(date, cellAttributes.meta), this._config) : month}
                  </div>
                </td>`;
			}).join("")}
          </tr>`).join("") : ""}
        ${this._view === "quarters" ? `<tr>
            ${Array.from({ length: 4 }, (_, index) => {
				const date = new Date(calendarDate.getFullYear(), index * 3, 1);
				const cellAttributes = this._cellQuarterAttributes(date);
				return `<td
                  class="${cellAttributes.className}"
                  role="gridcell"
                  tabindex="${cellAttributes.tabIndex}"
                  ${cellAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
                  data-coreui-date="${date.toDateString()}"
                >
                  <div class="${CLASS_NAME_CALENDAR_CELL_INNER} quarter">
                    ${this._config.renderQuarterCell ? (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.renderQuarterCell(date, cellAttributes.meta), this._config) : `Q${index + 1}`}
                  </div>
                </td>`;
			}).join("")}
          </tr>` : ""}
        ${this._view === "years" ? listOfYears.map((row) => `<tr>
            ${row.map((year) => {
				const date = new Date(year, 0, 1);
				const cellAttributes = this._cellYearAttributes(date);
				return `<td
                  class="${cellAttributes.className}"
                  role="gridcell"
                  tabindex="${cellAttributes.tabIndex}"
                  ${cellAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
                  data-coreui-date="${date.toDateString()}"
                >
                  <div class="${CLASS_NAME_CALENDAR_CELL_INNER} year">
                    ${this._config.renderYearCell ? (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.renderYearCell(date, cellAttributes.meta), this._config) : this._formatDate(date, { year: this._config.yearFormat })}
                  </div>
                </td>`;
			}).join("")}
          </tr>`).join("") : ""}
      </tbody>
    `;
			calendarPanelEl.append(navigationElement, calendarTable);
			return calendarPanelEl;
		}
		_createCalendar() {
			if (this._config.selectionType && this._view === "days") this._element.classList.add(`select-${this._config.selectionType}`);
			if (this._config.showWeekNumber) this._element.classList.add(CLASS_NAME_SHOW_WEEK_NUMBERS);
			for (const [index, _] of Array.from({ length: this._config.calendars }).entries()) this._element.append(this._createCalendarPanel(index));
			this._element.classList.add(CLASS_NAME_CALENDARS);
		}
		_initializeDates() {
			this._calendarDate = (0, js_src_util_calendar_js.convertToDateObject)(this._config.calendarDate || this._config.startDate || this._config.endDate, this._config.selectionType) || /* @__PURE__ */ new Date();
			this._startDate = (0, js_src_util_calendar_js.convertToDateObject)(this._config.startDate, this._config.selectionType);
			this._endDate = (0, js_src_util_calendar_js.convertToDateObject)(this._config.endDate, this._config.selectionType);
			this._minDate = (0, js_src_util_calendar_js.convertToDateObject)(this._config.minDate, this._config.selectionType);
			this._maxDate = (0, js_src_util_calendar_js.convertToDateObject)(this._config.maxDate, this._config.selectionType);
			this._hoverDate = null;
			this._selectEndDate = this._config.selectEndDate;
		}
		_initializeView() {
			const viewMap = {
				day: "days",
				week: "days",
				month: "months",
				quarter: "quarters",
				year: "years"
			};
			this._view = viewMap[this._config.selectionType] || "days";
		}
		_updateCalendar(callback) {
			this._element.innerHTML = "";
			this._createCalendar();
			if (callback) callback();
		}
		_updateClassNamesAndAriaLabels() {
			if (this._config.selectionType === "week") {
				const rows = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR_ROW, this._element);
				for (const row of rows) {
					const firstCell = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CALENDAR_CELL, row);
					const date = new Date(js_src_dom_manipulator_js.default.getDataAttribute(firstCell, "date"));
					const rowAttributes = this._rowWeekAttributes(date);
					row.className = rowAttributes.className;
					row.tabIndex = rowAttributes.tabIndex;
					if (rowAttributes.ariaSelected) row.setAttribute("aria-selected", true);
					else row.removeAttribute("aria-selected");
				}
				return;
			}
			const cells = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR_CELL_CLICKABLE, this._element);
			for (const cell of cells) {
				const date = new Date(js_src_dom_manipulator_js.default.getDataAttribute(cell, "date"));
				let cellAttributes;
				switch (this._view) {
					case "days":
						cellAttributes = this._cellDayAttributes(date, "current");
						break;
					case "months":
						cellAttributes = this._cellMonthAttributes(date);
						break;
					case "quarters":
						cellAttributes = this._cellQuarterAttributes(date);
						break;
					default: cellAttributes = this._cellYearAttributes(date);
				}
				cell.className = cellAttributes.className;
				cell.tabIndex = cellAttributes.tabIndex;
				if (cellAttributes.ariaSelected) cell.setAttribute("aria-selected", true);
				else cell.removeAttribute("aria-selected");
			}
		}
		_classNames(classNames) {
			return Object.entries(classNames).filter(([_, value]) => Boolean(value)).map(([key]) => key).join(" ");
		}
		_cellDayAttributes(date, month) {
			const isCurrentMonth = month === "current";
			const isDisabled = (0, js_src_util_calendar_js.isDateDisabled)(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = (0, js_src_util_calendar_js.isDateSelected)(date, this._startDate, this._endDate);
			const isTodayDate = (0, js_src_util_calendar_js.isToday)(date);
			if (this._config.selectionType !== "day" || this._view !== "days") return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					today: isTodayDate,
					[month]: true
				}),
				tabIndex: -1,
				ariaSelected: false,
				ariaLabel: this._formatDate(date),
				ariaCurrent: isTodayDate
			};
			const isInRange = isCurrentMonth && (0, js_src_util_calendar_js.isDateInRange)(date, this._startDate, this._endDate);
			const isRangeHover = isCurrentMonth && this._hoverDate && (this._selectEndDate ? (0, js_src_util_calendar_js.isDateInRange)(date, this._startDate, this._hoverDate) : (0, js_src_util_calendar_js.isDateInRange)(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					clickable: !isCurrentMonth && this._config.selectAdjacentDays,
					disabled: isDisabled,
					range: isInRange,
					"range-hover": isRangeHover,
					selected: isSelected,
					today: isTodayDate,
					[month]: true
				}),
				tabIndex: (isCurrentMonth || this._config.selectAdjacentDays) && !isDisabled ? 0 : -1,
				ariaSelected: isSelected,
				ariaLabel: this._formatDate(date),
				ariaCurrent: isTodayDate,
				meta: {
					isDisabled,
					isInCurrentMonth: isCurrentMonth,
					isInRange,
					isSelected,
					isToday: isTodayDate
				}
			};
		}
		_cellMonthAttributes(date) {
			const isDisabled = (0, js_src_util_calendar_js.isMonthDisabled)(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = (0, js_src_util_calendar_js.isMonthSelected)(date, this._startDate, this._endDate);
			const isInRange = (0, js_src_util_calendar_js.isMonthInRange)(date, this._startDate, this._endDate);
			const isRangeHover = this._config.selectionType === "month" && this._hoverDate && (this._selectEndDate ? (0, js_src_util_calendar_js.isMonthInRange)(date, this._startDate, this._hoverDate) : (0, js_src_util_calendar_js.isMonthInRange)(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					disabled: isDisabled,
					"range-hover": isRangeHover,
					range: isInRange,
					selected: isSelected
				}),
				tabIndex: isDisabled ? -1 : 0,
				ariaSelected: isSelected,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_cellQuarterAttributes(date) {
			const isDisabled = (0, js_src_util_calendar_js.isQuarterDisabled)(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = (0, js_src_util_calendar_js.isQuarterSelected)(date, this._startDate, this._endDate);
			const isInRange = (0, js_src_util_calendar_js.isQuarterInRange)(date, this._startDate, this._endDate);
			const isRangeHover = this._config.selectionType === "quarter" && this._hoverDate && (this._selectEndDate ? (0, js_src_util_calendar_js.isQuarterInRange)(date, this._startDate, this._hoverDate) : (0, js_src_util_calendar_js.isQuarterInRange)(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					disabled: isDisabled,
					"range-hover": isRangeHover,
					range: isInRange,
					selected: isSelected
				}),
				tabIndex: isDisabled ? -1 : 0,
				ariaSelected: isSelected,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_cellYearAttributes(date) {
			const isDisabled = (0, js_src_util_calendar_js.isYearDisabled)(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = (0, js_src_util_calendar_js.isYearSelected)(date, this._startDate, this._endDate);
			const isInRange = (0, js_src_util_calendar_js.isYearInRange)(date, this._startDate, this._endDate);
			const isRangeHover = this._config.selectionType === "year" && this._hoverDate && (this._selectEndDate ? (0, js_src_util_calendar_js.isYearInRange)(date, this._startDate, this._hoverDate) : (0, js_src_util_calendar_js.isYearInRange)(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					disabled: isDisabled,
					"range-hover": isRangeHover,
					range: isInRange,
					selected: isSelected
				}),
				tabIndex: isDisabled ? -1 : 0,
				ariaSelected: isSelected,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_rowWeekAttributes(date) {
			if (this._config.selectionType !== "week") return {
				className: this._classNames({ [CLASS_NAME_CALENDAR_ROW]: true }),
				tabIndex: -1,
				ariaSelected: false
			};
			const isDisabled = (0, js_src_util_calendar_js.isDateDisabled)(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = (0, js_src_util_calendar_js.isDateSelected)(date, this._startDate, this._endDate);
			const isInRange = (0, js_src_util_calendar_js.isDateInRange)(date, this._startDate, this._endDate);
			const isRangeHover = this._hoverDate && (this._selectEndDate ? (0, js_src_util_calendar_js.isDateInRange)(date, this._startDate, this._hoverDate) : (0, js_src_util_calendar_js.isDateInRange)(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_ROW]: true,
					disabled: isDisabled,
					range: isInRange,
					"range-hover": isRangeHover,
					selected: isSelected
				}),
				tabIndex: isDisabled ? -1 : 0,
				ariaSelected: isSelected
			};
		}
		_navIcon(name) {
			return (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config[(0, js_src_util_index_js.isRTL)(this._element) ? {
				navIconDoubleNext: "navIconDoublePrev",
				navIconDoublePrev: "navIconDoubleNext",
				navIconNext: "navIconPrev",
				navIconPrev: "navIconNext"
			}[name] : name], this._config);
		}
		_formatDate(date, options) {
			if (Number.isNaN(date.getTime())) return date.toLocaleDateString(this._config.locale, options);
			const key = `${this._config.locale}|${options ? JSON.stringify(options) : ""}`;
			let formatter = this._formatters.get(key);
			if (!formatter) {
				formatter = new Intl.DateTimeFormat(this._config.locale, options);
				this._formatters.set(key, formatter);
			}
			return formatter.format(date);
		}
		static calendarInterface(element, config, ...args) {
			const data = Calendar.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Calendar, config, args);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_CALENDAR))) Calendar.calendarInterface(element);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Calendar);
	//#endregion
	return Calendar;
});

//# sourceMappingURL=calendar.js.map