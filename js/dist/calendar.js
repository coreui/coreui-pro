/*!
* CoreUI PRO calendar.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./dom/selector-engine.js"), require("./util/announce.js"), require("./util/sanitizer.js"), require("./util/icons.js"), require("./util/index.js"), require("./util/calendar.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./dom/selector-engine.js",
		"./util/announce.js",
		"./util/sanitizer.js",
		"./util/icons.js",
		"./util/index.js",
		"./util/calendar.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Calendar = factory(global.BaseComponent, global.EventHandler, global.Manipulator, global.SelectorEngine, global.Announce, global.Sanitizer, global.Icons, global.Index, global.CalendarUtil));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_dom_selector_engine_js, js_src_util_announce_js, js_src_util_sanitizer_js, js_src_util_icons_js, js_src_util_index_js, js_src_util_calendar_js) {
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
	const NAME = "calendar";
	const EVENT_KEY = `.coreui.calendar`;
	const DATA_API_KEY = ".data-api";
	const EVENT_BLUR = `blur${EVENT_KEY}`;
	const EVENT_CALENDAR_DATE_CHANGE = `calendarDateChange${EVENT_KEY}`;
	const EVENT_CALENDAR_MOUSE_LEAVE = `calendarMouseleave${EVENT_KEY}`;
	const EVENT_CALENDAR_VIEW_CHANGE = `calendarViewChange${EVENT_KEY}`;
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
	const CLASS_NAME_VISUALLY_HIDDEN = "visually-hidden";
	const SELECTOR_BTN_DOUBLE_NEXT = ".btn-double-next";
	const SELECTOR_BTN_DOUBLE_PREV = ".btn-double-prev";
	const SELECTOR_BTN_MONTH = ".btn-month";
	const SELECTOR_BTN_NEXT = ".btn-next";
	const SELECTOR_BTN_PREV = ".btn-prev";
	const SELECTOR_BTN_YEAR = ".btn-year";
	const SELECTOR_CALENDAR = ".calendar";
	const SELECTOR_CALENDAR_CELL = ".calendar-cell";
	const SELECTOR_CALENDAR_CELL_FOCUSABLE = `${SELECTOR_CALENDAR_CELL}[tabindex]`;
	const SELECTOR_CALENDAR_CELL_SELECTABLE = `${SELECTOR_CALENDAR_CELL}[data-coreui-selectable]`;
	const SELECTOR_CALENDAR_ROW = ".calendar-row";
	const SELECTOR_CALENDAR_ROW_FOCUSABLE = `${SELECTOR_CALENDAR_ROW}[tabindex]`;
	const SELECTOR_CALENDAR_ROW_SELECTABLE = `${SELECTOR_CALENDAR_ROW}[data-coreui-selectable]`;
	const SELECTOR_DATA_CALENDAR = "[data-coreui-calendar]";
	const CELL_RENDERERS = {
		days: "renderDayCell",
		months: "renderMonthCell",
		quarters: "renderQuarterCell",
		years: "renderYearCell"
	};
	const VIEW_BY_SELECTION_TYPE = {
		day: "days",
		week: "days",
		month: "months",
		quarter: "quarters",
		year: "years"
	};
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaNavNextMonthLabel: "Next month",
		ariaNavNextYearLabel: "Next year",
		ariaNavNextYearsLabel: "Next 12 years",
		ariaNavPrevMonthLabel: "Previous month",
		ariaNavPrevYearLabel: "Previous year",
		ariaNavPrevYearsLabel: "Previous 12 years",
		ariaNothingToPickLabel: "Nothing on this page can be picked",
		ariaSelectedDateAnnouncement: "Selected date: {date}",
		ariaSelectedRangeAnnouncement: "Selected range: {start} to {end}",
		ariaWeekNumberLabel: null,
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
		navNextDoubleIcon: js_src_util_icons_js.CHEVRON_DOUBLE_RIGHT_ICON,
		navNextIcon: js_src_util_icons_js.CHEVRON_RIGHT_ICON,
		navPrevDoubleIcon: js_src_util_icons_js.CHEVRON_DOUBLE_LEFT_ICON,
		navPrevIcon: js_src_util_icons_js.CHEVRON_LEFT_ICON,
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
		ariaNavNextYearsLabel: "string",
		ariaNavPrevMonthLabel: "string",
		ariaNavPrevYearLabel: "string",
		ariaNavPrevYearsLabel: "string",
		ariaNothingToPickLabel: "(string|null)",
		ariaSelectedDateAnnouncement: "(string|null)",
		ariaSelectedRangeAnnouncement: "(string|null)",
		ariaWeekNumberLabel: "(function|null)",
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
		navNextDoubleIcon: "string",
		navNextIcon: "string",
		navPrevDoubleIcon: "string",
		navPrevIcon: "string",
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
	var Calendar = class Calendar extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element);
			this._formatter = (0, js_src_util_calendar_js.createDateFormatter)();
			this._announcements = [];
			this._selectionAnnouncement = null;
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
		setCalendarDate(calendarDate) {
			this._setDates({ calendarDate });
		}
		setEndDate(endDate) {
			this._setDates({ endDate });
		}
		setRange(startDate, endDate) {
			this._setDates({
				endDate,
				startDate
			});
		}
		setSelectEndDate(selectEndDate) {
			this._setDates({ selectEndDate });
		}
		setStartDate(startDate) {
			this._setDates({ startDate });
		}
		refresh() {
			this._updateCalendar();
		}
		dispose() {
			for (const remove of this._announcements) remove();
			this._element.replaceChildren();
			super.dispose();
		}
		_setDates(values) {
			this._typeCheckConfig(values, Object.fromEntries(Object.keys(values).map((name) => [name, DefaultType[name]])));
			this._initializeDates(values);
			this._updateCalendar();
		}
		_setAnnouncements(announcements) {
			this._config = this._getConfig({
				...this._config,
				...announcements
			});
		}
		_focusOnFirstAvailableCell(index) {
			const panel = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element)[index];
			const target = js_src_dom_selector_engine_js.default.findOne(this._rovingSelector(), panel) ?? js_src_dom_selector_engine_js.default.findOne("[tabindex=\"0\"]", panel) ?? js_src_dom_selector_engine_js.default.findOne("[tabindex=\"0\"]", this._element);
			if (target) target.focus();
		}
		_focusOnDate(date) {
			const targets = js_src_dom_selector_engine_js.default.find(this._rovingSelector(), this._element);
			const target = (0, js_src_util_calendar_js.getClosestSelectable)(targets, (0, js_src_util_calendar_js.getStartOfView)(date, this._view), this._rowsAreTargets()) ?? js_src_dom_selector_engine_js.default.findOne("table[tabindex=\"0\"]", this._element);
			if (target) target.focus();
		}
		_focusOnCell(date, panel) {
			const scope = panel === void 0 ? this._element : js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element)[panel];
			const matches = js_src_dom_selector_engine_js.default.find(this._rovingSelector(), scope).filter((element) => this._getDate(element).toDateString() === date.toDateString());
			const cell = matches.find((element) => {
				const cell = this._rowsAreTargets() ? js_src_dom_selector_engine_js.default.findOne(SELECTOR_CALENDAR_CELL, element) : element;
				return !cell?.classList.contains("previous") && !cell?.classList.contains("next");
			}) ?? matches[0];
			if (cell) cell.focus();
		}
		_getEventTarget(event) {
			return event.target.closest(SELECTOR_CALENDAR_CELL) ?? event.target.closest(SELECTOR_CALENDAR_ROW);
		}
		_rowsAreTargets() {
			return this._config.selectionType === "week" && this._view === "days";
		}
		_cellUnit() {
			return this._rowsAreTargets() ? "weeks" : this._view;
		}
		_getDate(target) {
			if (this._rowsAreTargets()) {
				const firstCell = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CALENDAR_CELL, target.closest(SELECTOR_CALENDAR_ROW));
				return (0, js_src_util_calendar_js.getStartOfWeek)((0, js_src_util_calendar_js.parseToDateString)(js_src_dom_manipulator_js.default.getDataAttribute(firstCell, "date")), this._config.firstDayOfWeek);
			}
			return (0, js_src_util_calendar_js.parseToDateString)(js_src_dom_manipulator_js.default.getDataAttribute(target, "date"));
		}
		_getPickedDate(target) {
			const date = this._getDate(target);
			return this._rowsAreTargets() ? (0, js_src_util_calendar_js.getWeekRowDate)(date) : date;
		}
		_handleCalendarClick(event) {
			const target = this._getEventTarget(event);
			if (!target) return;
			const date = this._getPickedDate(target);
			const cloneDate = new Date(date);
			const index = js_src_dom_manipulator_js.default.getDataAttribute(target.closest(SELECTOR_CALENDAR), "calendar-index");
			if ((0, js_src_util_calendar_js.isCellDisabled)(date, this._cellUnit(), this._minDate, this._maxDate, this._config.disabledDates)) return;
			if (this._view === "months" && this._config.selectionType !== "month") {
				this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date, "days");
				this._setCalendarView("days", "cellClick");
				this._updateCalendar(() => this._focusOnFirstAvailableCell(index));
				return;
			}
			if (this._view === "years" && this._config.selectionType !== "year") {
				this._setCalendarDate(index ? new Date(cloneDate.setFullYear(cloneDate.getFullYear() - index)) : date, "months");
				this._setCalendarView(this._config.selectionType === "quarter" ? "quarters" : "months", "cellClick");
				this._updateCalendar(() => this._focusOnFirstAvailableCell(index));
				return;
			}
			const visible = this._element.checkVisibility();
			this._hoverDate = null;
			this._selectDate(date);
			this._announceSelection(visible);
			this._updateClassNamesAndAriaLabels();
			this._updateCellContent();
			this._updateRovingTabIndex(js_src_dom_selector_engine_js.default.findOne(":focus", this._element));
		}
		_handleCalendarKeydown(event) {
			const target = this._getEventTarget(event);
			const action = (0, js_src_util_calendar_js.getCalendarKeyAction)(event, this._getDate(target), this._getKeyContext(target));
			this._keptDay = (0, js_src_util_calendar_js.getKeptDay)(event.key, action, this._keptDay);
			if (!action) return;
			event.preventDefault();
			if (action.type === "activate") {
				this._handleCalendarClick(event);
				return;
			}
			if (action.type === "page" && action.date) {
				const target = action.date;
				this._modifyCalendarDate(action.years, action.months, () => this._focusOnDate(target));
				return;
			}
			this._moveFocus(action);
		}
		_handleGridKeydown(event) {
			if (!event.target.matches("table")) return;
			const context = this._getKeyContext(event.target);
			const action = (0, js_src_util_calendar_js.getCalendarKeyAction)(event, null, context);
			this._keptDay = (0, js_src_util_calendar_js.getKeptDay)(event.key, action, this._keptDay);
			if (!action) return;
			event.preventDefault();
			if (action.type !== "page") {
				this._moveFocus(action);
				return;
			}
			this._modifyCalendarDate(action.years, action.months, () => {
				const panel = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element)[context.panel];
				const stop = js_src_dom_selector_engine_js.default.findOne("[tabindex=\"0\"]", panel) ?? js_src_dom_selector_engine_js.default.findOne("[tabindex=\"0\"]", this._element);
				if (stop) stop.focus();
			});
		}
		_getKeyContext(target) {
			return {
				calendarDate: this._calendarDate,
				calendars: this._config.calendars,
				firstDayOfWeek: this._config.firstDayOfWeek,
				keptDay: this._keptDay,
				maxDate: this._maxDate,
				minDate: this._minDate,
				panel: js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element).indexOf(target.closest(SELECTOR_CALENDAR)),
				rows: this._rowsAreTargets(),
				rtl: (0, js_src_util_index_js.isRTL)(this._element),
				view: this._view
			};
		}
		_moveFocus(action) {
			if (action.type !== "move") return;
			if (action.years || action.months) {
				this._modifyCalendarDate(action.years, action.months, () => this._focusOnCell(action.date));
				return;
			}
			this._focusOnCell(action.date, action.panel);
		}
		_handleCalendarMouseEnter(event) {
			const target = this._getEventTarget(event);
			if (!target) return;
			const date = this._getPickedDate(target);
			if ((0, js_src_util_calendar_js.isCellDisabled)(date, this._cellUnit(), this._minDate, this._maxDate, this._config.disabledDates)) return;
			this._hoverDate = (0, js_src_util_calendar_js.setTimeFromDate)(date, this._selectEndDate ? this._endDate : this._startDate);
			this._updateRangeHover();
		}
		_handleCalendarMouseLeave() {
			this._hoverDate = null;
			this._updateRangeHover();
		}
		_updateRangeHover() {
			if (this._selectEndDate ? this._startDate : this._endDate) this._updateClassNamesAndAriaLabels();
		}
		_addEventListeners() {
			const focusable = `${SELECTOR_CALENDAR_CELL_FOCUSABLE}, ${SELECTOR_CALENDAR_ROW_FOCUSABLE}`;
			const selectable = `${SELECTOR_CALENDAR_CELL_SELECTABLE}, ${SELECTOR_CALENDAR_ROW_SELECTABLE}`;
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK_DATA_API, () => {
				this._keptDay = null;
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK_DATA_API, focusable, (event) => {
				this._handleCalendarClick(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, focusable, (event) => {
				this._handleCalendarKeydown(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSEENTER, selectable, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSELEAVE, selectable, () => {
				this._handleCalendarMouseLeave();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUS, focusable, (event) => {
				this._updateRovingTabIndex(this._getEventTarget(event));
				this._handleCalendarMouseEnter(event);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_BLUR, focusable, () => {
				this._handleCalendarMouseLeave();
				this._updateRovingTabIndex();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, "table[tabindex]", (event) => {
				this._handleGridKeydown(event);
			});
			this._addNavigationEventListeners();
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSELEAVE, "table", () => {
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CALENDAR_MOUSE_LEAVE);
			});
		}
		_addNavigationEventListeners() {
			const navigationSelectors = {
				[SELECTOR_BTN_PREV]: () => this._modifyCalendarDate(0, -1),
				[SELECTOR_BTN_DOUBLE_PREV]: () => this._modifyCalendarDate(this._view === "years" ? -js_src_util_calendar_js.YEARS_PER_PAGE : -1),
				[SELECTOR_BTN_NEXT]: () => this._modifyCalendarDate(0, 1),
				[SELECTOR_BTN_DOUBLE_NEXT]: () => this._modifyCalendarDate(this._view === "years" ? js_src_util_calendar_js.YEARS_PER_PAGE : 1),
				[SELECTOR_BTN_MONTH]: (index) => this._showPeriodView("months", index),
				[SELECTOR_BTN_YEAR]: (index) => this._showPeriodView(this._view === "years" ? this._selectionView() : "years", index)
			};
			for (const [selector, handler] of Object.entries(navigationSelectors)) js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK_DATA_API, selector, (event) => {
				event.preventDefault();
				const index = js_src_dom_selector_engine_js.default.find(selector, this._element).indexOf(event.target.closest(selector));
				if (!handler(index)) js_src_dom_selector_engine_js.default.find(selector, this._element)[index]?.focus();
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
		_showPeriodView(view, index) {
			const shown = (0, js_src_util_calendar_js.getCalendarDate)(this._calendarDate, index, this._view === "years" ? view : this._view);
			const start = (0, js_src_util_calendar_js.getStartOfView)((0, js_src_util_calendar_js.createDate)(shown.getFullYear(), shown.getMonth(), 1), view).toDateString();
			const focus = view !== this._view && this._element.contains(document.activeElement);
			this._setCalendarView(view, "navigation");
			this._updateCalendar(() => {
				if (focus) {
					const panel = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element)[index];
					(js_src_dom_selector_engine_js.default.find(`[data-coreui-date="${start}"]`, this._element).map((cell) => cell.closest(this._rovingSelector())).find(Boolean) ?? js_src_dom_selector_engine_js.default.findOne("[tabindex=\"0\"]", panel))?.focus();
				}
			});
			return focus;
		}
		_modifyCalendarDate(years, months = 0, callback) {
			const year = this._calendarDate.getFullYear() + years;
			const month = this._calendarDate.getMonth() + months;
			this._setCalendarDate((0, js_src_util_calendar_js.createDate)(year, month, 1));
			this._updateCalendar(callback);
		}
		_setEndDate(date) {
			if (date === this._endDate) return;
			this._endDate = (0, js_src_util_calendar_js.setTimeFromDate)(date, this._endDate);
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_END_DATE_CHANGE, {
				date: (0, js_src_util_calendar_js.getDateBySelectionType)(this._endDate, this._config.selectionType),
				dateObject: this._endDate
			});
		}
		_setStartDate(date) {
			if (date === this._startDate) return;
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
			if ((0, js_src_util_calendar_js.isCellDisabled)(date, this._cellUnit(), this._minDate, this._maxDate, this._config.disabledDates)) return;
			if (this._config.range) {
				const start = (0, js_src_util_calendar_js.convertToSelectionDate)(this._startDate, this._config.selectionType);
				const end = (0, js_src_util_calendar_js.convertToSelectionDate)(this._endDate, this._config.selectionType);
				if (this._selectEndDate) {
					if (start && start > date) {
						this._setStartDate(date);
						this._setEndDate(null);
						return;
					}
					this._setSelectEndDate(false);
					if ((0, js_src_util_calendar_js.isDisableDateInRange)(start, date, this._config.disabledDates, this._cellUnit())) {
						this._setStartDate(null);
						this._setEndDate(null);
						return;
					}
					this._setEndDate(date);
					return;
				}
				if (end && end < date) {
					this._setStartDate(date);
					this._setEndDate(null);
					this._setSelectEndDate(true);
					return;
				}
				if ((0, js_src_util_calendar_js.isDisableDateInRange)(date, end, this._config.disabledDates, this._cellUnit())) {
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
			const calendarPanelEl = document.createElement("div");
			calendarPanelEl.classList.add("calendar");
			js_src_dom_manipulator_js.default.setDataAttribute(calendarPanelEl, "calendar-index", order);
			calendarPanelEl.innerHTML = `<div class="calendar-nav"><div class="calendar-nav-prev"></div><div class="calendar-nav-date"></div><div class="calendar-nav-next"></div></div><table role="grid"></table><span id="${(0, js_src_util_index_js.getUID)("calendar-description")}" hidden></span>`;
			this._renderCalendarPanel(calendarPanelEl, order);
			return calendarPanelEl;
		}
		_renderCalendarPanel(panel, order) {
			const calendarDate = (0, js_src_util_calendar_js.getCalendarDate)(this._calendarDate, order, this._view);
			const days = this._view === "days";
			const years = this._view === "years";
			const [navigation, calendarTable] = panel.children;
			const [prev, region, next] = navigation.children;
			const monthLabel = days ? this._formatDate(calendarDate, { month: "long" }) : "";
			const yearLabel = years ? (0, js_src_util_calendar_js.formatYearsRange)(calendarDate.getFullYear(), this._config.locale) : this._formatDate(calendarDate, { year: "numeric" });
			const gridLabel = this._gridLabel(calendarDate);
			const turned = calendarTable.getAttribute("aria-label") !== gridLabel;
			prev.innerHTML = `${this._navButton("btn-double-prev", "navPrevDoubleIcon", years ? this._config.ariaNavPrevYearsLabel : this._config.ariaNavPrevYearLabel)} ${days ? this._navButton("btn-prev", "navPrevIcon", this._config.ariaNavPrevMonthLabel) : ""}`;
			next.innerHTML = `${days ? this._navButton("btn-next", "navNextIcon", this._config.ariaNavNextMonthLabel) : ""} ${this._navButton("btn-double-next", "navNextDoubleIcon", years ? this._config.ariaNavNextYearsLabel : this._config.ariaNavNextYearLabel)}`;
			calendarTable.setAttribute("aria-label", gridLabel);
			if (this._picksRange()) calendarTable.setAttribute("aria-multiselectable", "true");
			else calendarTable.removeAttribute("aria-multiselectable");
			calendarTable.innerHTML = days ? this._daysHtml(calendarDate) : this._periodsHtml(calendarDate);
			if (turned) {
				const month = days ? `<button type="button" class="calendar-nav-btn btn-month">${monthLabel}</button>` : "";
				const year = `<button type="button" class="calendar-nav-btn btn-year">${yearLabel}</button>`;
				region.innerHTML = (0, js_src_util_calendar_js.isYearBeforeMonth)(this._config.locale) ? `${year} ${month}` : `${month} ${year}`;
			}
			js_src_dom_selector_engine_js.default.findOne(SELECTOR_BTN_YEAR, region).disabled = years && this._selectionView() === "years";
			this._describeGrid(panel);
		}
		_describeGrid(panel) {
			const [navigation, grid, description] = panel.children;
			const region = navigation.children[1];
			const label = this._config.ariaNothingToPickLabel;
			const note = js_src_dom_selector_engine_js.default.findOne(`.${CLASS_NAME_VISUALLY_HIDDEN}`, region);
			description.textContent = label;
			if (!label || js_src_dom_selector_engine_js.default.findOne("[data-coreui-selectable]", grid)) {
				grid.removeAttribute("aria-describedby");
				note?.remove();
				return;
			}
			grid.setAttribute("aria-describedby", description.id);
			if (!note) region.insertAdjacentHTML("beforeend", `<span class="${CLASS_NAME_VISUALLY_HIDDEN}">${(0, js_src_util_sanitizer_js.escapeHtml)(label)}</span>`);
			else if (note.textContent !== label) note.textContent = label;
		}
		_pages() {
			return js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element).map((panel) => {
				const grid = panel.children[1];
				return [grid.getAttribute("aria-label"), grid.hasAttribute("aria-describedby")];
			});
		}
		_announceSelection(visible) {
			this._selectionAnnouncement?.();
			this._selectionAnnouncement = null;
			const { ariaSelectedDateAnnouncement, ariaSelectedRangeAnnouncement, range } = this._config;
			const start = this._startDate;
			const end = range ? this._endDate : start;
			if (!visible || !start || !end) return;
			const startName = this._selectionName(start);
			const endName = this._selectionName(end);
			const message = startName === endName ? ariaSelectedDateAnnouncement?.replaceAll("{date}", () => startName) : ariaSelectedRangeAnnouncement?.replaceAll("{start}", () => startName).replaceAll("{end}", () => endName);
			if (message) this._selectionAnnouncement = (0, js_src_util_announce_js.announce)(message, { context: this._element });
		}
		_selectionName(date) {
			const { ariaWeekNumberLabel, firstDayOfWeek, locale, selectionType, showWeekNumber } = this._config;
			return (0, js_src_util_calendar_js.formatSelectionName)(date, {
				ariaWeekNumberLabel,
				firstDayOfWeek,
				locale,
				selectionType,
				showWeekNumber
			});
		}
		_announcePages(pages) {
			if (!this._element.isConnected || !this._element.checkVisibility()) return;
			const panels = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element);
			const active = this._element.getRootNode().activeElement;
			const date = active && this._element.contains(active) ? active.closest(`${SELECTOR_CALENDAR_CELL}[aria-label], ${SELECTOR_CALENDAR_ROW}[aria-label]`) : null;
			const messages = this._pages().flatMap(([label, nothing], index) => {
				const [previousLabel, previousNothing] = pages[index] ?? [];
				if (label === previousLabel && (previousNothing || !nothing) || date && !nothing) return [];
				return [[date && panels[index].contains(date) ? "" : label, nothing && this._config.ariaNothingToPickLabel].filter(Boolean).join(", ")];
			});
			if (messages.length > 0) {
				for (const remove of this._announcements) remove();
				this._announcements = messages.map((message) => (0, js_src_util_announce_js.announce)(message, { context: this._element }));
			}
		}
		_daysHtml(calendarDate) {
			const { ariaWeekNumberLabel, showAdjacentDays, showWeekNumber, weekdayFormat, weekNumbersLabel } = this._config;
			const weeks = (0, js_src_util_calendar_js.getMonthDetails)(calendarDate.getFullYear(), calendarDate.getMonth(), this._config.firstDayOfWeek);
			const weekLabel = (0, js_src_util_calendar_js.getWeekLabel)(this._config.locale);
			const headerCell = (content, abbr = "") => `<th class="${CLASS_NAME_CALENDAR_CELL}"${abbr}><div class="calendar-header-cell-inner">${content}</div></th>`;
			const weekdays = weeks[0].days.map(({ date }) => {
				const long = this._formatDate(date, { weekday: "long" });
				return headerCell(typeof weekdayFormat === "string" ? this._formatDate(date, { weekday: weekdayFormat }) : long.slice(0, weekdayFormat), ` abbr="${long}"`);
			});
			const rows = weeks.map(({ week, days }) => {
				const visible = showAdjacentDays || days.some(({ month }) => month === "current");
				const attributes = this._rowWeekAttributes(days[0].date, visible);
				const cells = days.map(({ date, month }) => month === "current" || showAdjacentDays ? this._cellHtml(date, this._cellDayAttributes(date, month, attributes.meta), this._formatDate(date, { day: this._config.dayFormat })) : "<td role=\"gridcell\"></td>");
				const weekNumberName = showWeekNumber ? (0, js_src_util_calendar_js.getWeekNumberName)(week.number, weekLabel, ariaWeekNumberLabel) : "";
				const rowName = () => `${showWeekNumber ? `${weekNumberName}, ` : ""}${(0, js_src_util_calendar_js.formatWeekName)(days, this._config.locale)}`;
				const ariaLabel = this._config.selectionType === "week" && visible ? ` aria-label="${(0, js_src_util_sanitizer_js.escapeHtml)(rowName())}"` : "";
				return `<tr class="${attributes.className}"${this._stateHtml(attributes)}${ariaLabel}>${showWeekNumber ? `<th class="calendar-cell-week-number" scope="row" aria-label="${(0, js_src_util_sanitizer_js.escapeHtml)(weekNumberName)}">${week.number}</th>` : ""}${cells.join("")}</tr>`;
			});
			const weekNumberHeader = weekNumbersLabel ? (0, js_src_util_sanitizer_js.escapeHtml)(weekNumbersLabel) : `<span class="${CLASS_NAME_VISUALLY_HIDDEN}">${(0, js_src_util_sanitizer_js.escapeHtml)(weekLabel)}</span>`;
			return `<thead><tr>${showWeekNumber ? headerCell(weekNumberHeader) : ""}${weekdays.join("")}</tr></thead><tbody>${rows.join("")}</tbody>`;
		}
		_periodsHtml(calendarDate) {
			const view = this._view;
			const year = calendarDate.getFullYear();
			const monthNames = view === "months" ? (0, js_src_util_calendar_js.getMonthsNames)(this._config.locale, this._config.monthFormat) : [];
			const dates = view === "years" ? (0, js_src_util_calendar_js.getYears)(year).map((value) => (0, js_src_util_calendar_js.createDate)(value)) : Array.from({ length: view === "months" ? 12 : 4 }, (_, index) => (0, js_src_util_calendar_js.createDate)(year, index * (view === "months" ? 1 : 3), 1));
			const label = (date) => {
				if (view === "months") return monthNames[date.getMonth()];
				return view === "quarters" ? `Q${date.getMonth() / 3 + 1}` : this._formatDate(date, { year: this._config.yearFormat });
			};
			return `<tbody>${(0, js_src_util_calendar_js.createGroupsInArray)(dates, view === "quarters" ? 1 : 4).map((row) => `<tr>${row.map((date) => this._cellHtml(date, this._cellPeriodAttributes(date), label(date))).join("")}</tr>`).join("")}</tbody>`;
		}
		_cellHtml(date, attributes, label) {
			const renderer = CELL_RENDERERS[this._view];
			const content = this._config[renderer] ? this._cellContent(date, attributes.meta) : label;
			const ariaLabel = attributes.ariaLabel && !this._config[renderer] ? ` aria-label="${(0, js_src_util_sanitizer_js.escapeHtml)(attributes.ariaLabel)}"` : "";
			const ariaCurrent = attributes.ariaCurrent ? " aria-current=\"date\"" : "";
			return `<td class="${attributes.className}" role="gridcell"${this._stateHtml(attributes)}${ariaCurrent}${ariaLabel} data-coreui-date="${date.toDateString()}"><div class="${CLASS_NAME_CALENDAR_CELL_INNER} ${this._view.slice(0, -1)}">${content}</div></td>`;
		}
		_cellContent(date, meta) {
			return (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config[CELL_RENDERERS[this._view]](date, {
				...meta,
				label: this._cellName(date)
			}), this._config);
		}
		_stateHtml({ ariaDisabled, ariaSelected, focusable, selectable }) {
			return `${focusable ? " tabindex=\"-1\"" : ""}${selectable ? " data-coreui-selectable" : ""}${ariaSelected ? " aria-selected=\"true\"" : ""}${ariaDisabled ? " aria-disabled=\"true\"" : ""}`;
		}
		_updateRovingTabIndex(preferred) {
			(0, js_src_util_calendar_js.setRovingTabIndex)(this._element, this._rovingSelector(), (0, js_src_util_calendar_js.getStartOfView)(this._calendarDate, this._view), this._rowsAreTargets(), preferred);
		}
		_gridLabel(date) {
			if (this._view === "days") return this._formatDate(date, {
				month: "long",
				year: "numeric"
			});
			if (this._view === "years") return (0, js_src_util_calendar_js.formatYearsRange)(date.getFullYear(), this._config.locale);
			return this._formatDate(date, { year: "numeric" });
		}
		_rovingSelector() {
			return this._rowsAreTargets() ? SELECTOR_CALENDAR_ROW_FOCUSABLE : SELECTOR_CALENDAR_CELL_FOCUSABLE;
		}
		_createCalendar() {
			this._setCalendarClasses();
			for (const [index, _] of Array.from({ length: this._config.calendars }).entries()) this._element.append(this._createCalendarPanel(index));
			this._updateRovingTabIndex();
		}
		_setCalendarClasses() {
			const { selectionType, showWeekNumber } = this._config;
			for (const type of [
				"day",
				"month",
				"quarter",
				"week",
				"year"
			]) if (type !== selectionType) this._element.classList.remove(`select-${type}`);
			if (selectionType && this._view === "days") this._element.classList.add(`select-${selectionType}`);
			this._element.classList.toggle(CLASS_NAME_SHOW_WEEK_NUMBERS, Boolean(showWeekNumber));
			this._element.classList.add(CLASS_NAME_CALENDARS);
		}
		_initializeDates(values) {
			const given = values ?? this._config;
			const changed = (...names) => !values || names.some((name) => name in values);
			if (!values) {
				this._minDate = (0, js_src_util_calendar_js.convertToLimitDate)(this._config.minDate, this._config.selectionType);
				this._maxDate = (0, js_src_util_calendar_js.convertToLimitDate)(this._config.maxDate, this._config.selectionType);
			}
			if (changed("calendarDate", "startDate", "endDate")) {
				const source = values ? [
					"calendarDate",
					"startDate",
					"endDate"
				].filter((name) => name in values).map((name) => values[name]).find(Boolean) ?? null : given.calendarDate || given.startDate || given.endDate;
				const date = source === given.calendarDate ? (0, js_src_util_calendar_js.convertToDateObject)(source, this._config.selectionType) : (0, js_src_util_calendar_js.convertToShownDate)(source, this._config.selectionType, this._config.firstDayOfWeek);
				this._calendarDate = date || this._calendarDate || (0, js_src_util_calendar_js.constrainDate)(/* @__PURE__ */ new Date(), this._minDate, this._maxDate);
			}
			if (changed("startDate")) this._startDate = (0, js_src_util_calendar_js.convertToDateObject)(given.startDate, this._config.selectionType);
			if (changed("endDate")) this._endDate = (0, js_src_util_calendar_js.convertToDateObject)(given.endDate, this._config.selectionType);
			if (changed("selectEndDate")) this._selectEndDate = Boolean(given.selectEndDate);
			this._hoverDate = null;
		}
		_initializeView() {
			this._view = this._selectionView();
		}
		_picksRange() {
			return this._config.range && this._selectionView() === this._view;
		}
		_selectionView() {
			return VIEW_BY_SELECTION_TYPE[this._config.selectionType] || "days";
		}
		_updateCalendar(callback) {
			const focused = this._element.contains(document.activeElement) ? document.activeElement : null;
			const restoreFocus = focused && this._focusRestorer(focused);
			const panels = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element);
			const pages = this._pages();
			if (panels.length === this._config.calendars) {
				this._setCalendarClasses();
				for (const [index, panel] of panels.entries()) this._renderCalendarPanel(panel, index);
				this._updateRovingTabIndex();
			} else {
				this._element.replaceChildren();
				this._createCalendar();
			}
			if (callback) callback();
			if (restoreFocus && (!document.activeElement || document.activeElement === document.body)) restoreFocus();
			this._announcePages(pages);
		}
		_focusRestorer(focused) {
			const index = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element).indexOf(focused.closest(SELECTOR_CALENDAR));
			const date = (focused.matches(SELECTOR_CALENDAR_ROW) ? js_src_dom_selector_engine_js.default.findOne(SELECTOR_CALENDAR_CELL, focused) : focused.closest(SELECTOR_CALENDAR_CELL))?.getAttribute("data-coreui-date");
			const { className } = focused;
			return () => {
				const panel = js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element)[index] ?? this._element;
				const matches = js_src_dom_selector_engine_js.default.find(this._rovingSelector(), this._element).filter((target) => (target.matches(SELECTOR_CALENDAR_ROW) ? js_src_dom_selector_engine_js.default.findOne(SELECTOR_CALENDAR_CELL, target) : target)?.getAttribute("data-coreui-date") === date);
				((date ? matches.find((target) => !target.matches(".next, .previous")) ?? matches[0] : panel.getElementsByClassName(className)[0]) ?? js_src_dom_selector_engine_js.default.findOne("[tabindex=\"0\"]", panel) ?? js_src_dom_selector_engine_js.default.findOne("[tabindex=\"0\"]", this._element))?.focus({ preventScroll: true });
			};
		}
		_updateClassNamesAndAriaLabels() {
			const pages = this._pages();
			if (this._rowsAreTargets()) for (const row of js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR_ROW, this._element)) {
				const firstCell = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CALENDAR_CELL, row);
				if (firstCell) this._applyState(row, this._rowWeekAttributes(this._getDate(firstCell)));
			}
			else for (const cell of js_src_dom_selector_engine_js.default.find(`${SELECTOR_CALENDAR_CELL}[data-coreui-date]`, this._element)) {
				const date = this._getDate(cell);
				this._applyState(cell, this._view === "days" ? this._cellDayAttributes(date, ["previous", "next"].find((month) => cell.classList.contains(month)) ?? "current") : this._cellPeriodAttributes(date));
			}
			for (const panel of js_src_dom_selector_engine_js.default.find(SELECTOR_CALENDAR, this._element)) this._describeGrid(panel);
			this._announcePages(pages);
		}
		_updateCellContent() {
			if (!this._config[CELL_RENDERERS[this._view]]) return;
			const focused = this._element.contains(document.activeElement) ? document.activeElement : null;
			const restoreFocus = focused && this._focusRestorer(focused);
			for (const cell of js_src_dom_selector_engine_js.default.find(`${SELECTOR_CALENDAR_CELL}[data-coreui-date]`, this._element)) {
				const date = (0, js_src_util_calendar_js.parseToDateString)(js_src_dom_manipulator_js.default.getDataAttribute(cell, "date"));
				const attributes = this._view === "days" ? this._cellDayAttributes(date, ["previous", "next"].find((month) => cell.classList.contains(month)) ?? "current", this._rowWeekAttributes(this._getDate(cell)).meta) : this._cellPeriodAttributes(date);
				const inner = js_src_dom_selector_engine_js.default.findOne(`.${CLASS_NAME_CALENDAR_CELL_INNER}`, cell);
				const content = this._cellContent(date, attributes.meta);
				if (inner.innerHTML !== content) inner.innerHTML = content;
			}
			if (restoreFocus && (!document.activeElement || document.activeElement === document.body)) restoreFocus();
		}
		_applyState(element, { ariaDisabled, ariaSelected, className, selectable }) {
			element.className = className;
			element.toggleAttribute("data-coreui-selectable", selectable);
			if (ariaSelected) element.setAttribute("aria-selected", "true");
			else element.removeAttribute("aria-selected");
			if (ariaDisabled) element.setAttribute("aria-disabled", "true");
			else element.removeAttribute("aria-disabled");
		}
		_isRangeHover(inRange) {
			return Boolean(this._hoverDate) && (this._selectEndDate ? inRange(this._startDate, this._hoverDate) : inRange(this._hoverDate, this._endDate));
		}
		_classNames(classNames) {
			return Object.entries(classNames).filter(([_, value]) => Boolean(value)).map(([key]) => key).join(" ");
		}
		_cellDayAttributes(date, month, row) {
			const isCurrentMonth = month === "current";
			const isFiller = this._config.selectionType === "day" && !isCurrentMonth && !this._config.selectAdjacentDays;
			const isDisabled = (0, js_src_util_calendar_js.isDateDisabled)(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = (0, js_src_util_calendar_js.isDateSelected)(date, this._startDate, this._endDate);
			const isTodayDate = isCurrentMonth && (0, js_src_util_calendar_js.isToday)(date);
			const isInRange = !isFiller && (0, js_src_util_calendar_js.isDateInRange)(date, this._startDate, this._endDate);
			const meta = {
				isDisabled: isDisabled || isFiller,
				isInCurrentMonth: isCurrentMonth,
				isInRange,
				isSelected: isSelected && !isFiller,
				isToday: isTodayDate,
				...row
			};
			if (this._config.selectionType !== "day" || this._view !== "days") return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					today: isTodayDate,
					[month]: true
				}),
				focusable: false,
				selectable: false,
				ariaSelected: false,
				ariaLabel: this._cellName(date),
				ariaCurrent: isTodayDate,
				meta
			};
			const isRangeHover = !isFiller && this._isRangeHover((start, end) => (0, js_src_util_calendar_js.isDateInRange)(date, start, end));
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
				focusable: !isFiller && !(0, js_src_util_calendar_js.isCellOutsideLimits)(date, "days", this._minDate, this._maxDate),
				selectable: !isDisabled && !isFiller,
				ariaDisabled: isDisabled || isFiller,
				ariaSelected: !isFiller && (isSelected || this._picksRange() && !isDisabled && (0, js_src_util_calendar_js.isDateInRange)(date, this._startDate, this._endDate)),
				ariaLabel: this._cellName(date),
				ariaCurrent: isTodayDate,
				meta
			};
		}
		_cellPeriodAttributes(date) {
			const view = this._view;
			const { firstDayOfWeek, selectionType } = this._config;
			const start = (0, js_src_util_calendar_js.convertToShownDate)(this._startDate, selectionType, firstDayOfWeek);
			const end = (0, js_src_util_calendar_js.convertToShownDate)(this._endDate, selectionType, firstDayOfWeek);
			const isDisabled = (0, js_src_util_calendar_js.isPeriodDisabled)(date, view, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = (0, js_src_util_calendar_js.isPeriodSelected)(date, view, start, end);
			const isInRange = (0, js_src_util_calendar_js.isPeriodInRange)(date, view, start, end);
			const isRangeHover = VIEW_BY_SELECTION_TYPE[this._config.selectionType] === view && this._isRangeHover((start, end) => (0, js_src_util_calendar_js.isPeriodInRange)(date, view, start, end));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					disabled: isDisabled,
					"range-hover": isRangeHover,
					range: isInRange,
					selected: isSelected
				}),
				focusable: !(0, js_src_util_calendar_js.isCellOutsideLimits)(date, view, this._minDate, this._maxDate),
				selectable: !isDisabled,
				ariaDisabled: isDisabled,
				ariaSelected: isSelected || this._picksRange() && isInRange && !isDisabled,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_rowWeekAttributes(date, visible = true) {
			if (this._config.selectionType !== "week" || !visible) return {
				className: this._classNames({ [CLASS_NAME_CALENDAR_ROW]: true }),
				focusable: false,
				selectable: false,
				ariaSelected: false
			};
			const weekDate = (0, js_src_util_calendar_js.getWeekRowDate)(date);
			const isDisabled = (0, js_src_util_calendar_js.isPeriodDisabled)(weekDate, "weeks", this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = (0, js_src_util_calendar_js.isPeriodSelected)(weekDate, "weeks", this._startDate, this._endDate);
			const isInRange = (0, js_src_util_calendar_js.isPeriodInRange)(weekDate, "weeks", this._startDate, this._endDate);
			const isRangeHover = this._isRangeHover((start, end) => (0, js_src_util_calendar_js.isPeriodInRange)(weekDate, "weeks", start, end));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_ROW]: true,
					disabled: isDisabled,
					range: isInRange,
					"range-hover": isRangeHover,
					selected: isSelected
				}),
				focusable: !(0, js_src_util_calendar_js.isCellOutsideLimits)(date, "days", this._minDate, this._maxDate, true),
				selectable: !isDisabled,
				ariaDisabled: isDisabled,
				ariaSelected: isSelected || this._picksRange() && isInRange && !isDisabled,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_navButton(className, icon, label) {
			return `<button type="button" class="calendar-nav-btn ${className}" aria-label="${(0, js_src_util_sanitizer_js.escapeHtml)(label)}"><span class="calendar-nav-icon">${this._navIcon(icon)}</span></button>`;
		}
		_navIcon(name) {
			return (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config[(0, js_src_util_index_js.isRTL)(this._element) ? {
				navNextDoubleIcon: "navPrevDoubleIcon",
				navNextIcon: "navPrevIcon",
				navPrevDoubleIcon: "navNextDoubleIcon",
				navPrevIcon: "navNextIcon"
			}[name] : name], this._config);
		}
		_formatDate(date, options) {
			return this._formatter(date, this._config.locale, options);
		}
		_cellName(date) {
			return (0, js_src_util_calendar_js.formatCellName)(date, this._view, (value, options) => this._formatDate(value, options));
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
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_CALENDAR))) Calendar.calendarInterface(element);
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(Calendar);
	//#endregion
	return Calendar;
});

//# sourceMappingURL=calendar.js.map