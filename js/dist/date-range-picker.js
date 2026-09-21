/*!
* CoreUI PRO date-range-picker.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./picker-base.js"), require("./calendar.js"), require("./date-range-input.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/form-control-group.js"), require("./util/calendar.js"), require("./util/date-sections.js"), require("./util/icons.js"), require("./util/index.js"), require("./util/sanitizer.js")) : typeof define === "function" && define.amd ? define([
		"./picker-base.js",
		"./calendar.js",
		"./date-range-input.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/form-control-group.js",
		"./util/calendar.js",
		"./util/date-sections.js",
		"./util/icons.js",
		"./util/index.js",
		"./util/sanitizer.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.DateRangePicker = factory(global.PickerBase, global.Calendar, global.DateRangeInput, global.EventHandler, global.SelectorEngine, global.FormControlGroup, global.Calendar, global.DateSections, global.Icons, global.Index, global.Sanitizer));
})(this, function(js_src_picker_base_js, js_src_calendar_js, js_src_date_range_input_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_form_control_group_js, js_src_util_calendar_js, js_src_util_date_sections_js, js_src_util_icons_js, js_src_util_index_js, js_src_util_sanitizer_js) {
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
	js_src_picker_base_js = __toESM(js_src_picker_base_js);
	js_src_calendar_js = __toESM(js_src_calendar_js);
	js_src_date_range_input_js = __toESM(js_src_date_range_input_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/date-range-picker.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO date-range-picker.js
	* License (https://coreui.io/pro/license/)
	*
	* Composed from a DateRangeInput field and one multi-month Calendar in a
	* Popup. The field owns the range — both dates and their validation — the
	* calendar owns the range mechanics (start/end, auto-advance), and the picker
	* joins them and projects the footer/ranges regions. The element is the
	* picker, not the frame: the frame is the field inside it.
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "date-range-picker";
	const EVENT_KEY = `.coreui.date-range-picker`;
	const DATA_API_KEY = ".data-api";
	const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`;
	const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_BODY = "date-picker-body";
	const CLASS_NAME_CALENDAR = "date-picker-calendar";
	const CLASS_NAME_CALENDARS = "date-picker-calendars";
	const CLASS_NAME_DATE_PICKER = "date-picker";
	const CLASS_NAME_DATE_RANGE_PICKER = "date-range-picker";
	const CLASS_NAME_DROPDOWN = "date-picker-popup";
	const CLASS_NAME_FOOTER = "date-picker-footer";
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_INDICATOR = "form-control-action";
	const CLASS_NAME_PICKER = "picker";
	const CLASS_NAME_POPUP = "popup";
	const CLASS_NAME_RANGES = "date-picker-ranges";
	const SELECTOR_DATA_DATE_RANGE_PICKER = "[data-coreui-date-range-picker]";
	const SELECTOR_TEMPLATE_RANGES = "template[data-coreui-template=\"ranges\"]";
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaCleanerLabel: "Clear date range",
		ariaEndLabel: "End date",
		ariaPickerLabel: "Toggle calendar",
		ariaStartLabel: "Start date",
		calendarOptions: {},
		calendars: 2,
		cleaner: true,
		cleanerIcon: js_src_util_icons_js.CLEANER_ICON,
		container: false,
		disabled: false,
		endDate: null,
		endFloatingLabel: null,
		endName: null,
		inputOptions: {},
		locale: navigator.language,
		maxDate: null,
		minDate: null,
		pickerIcon: true,
		sanitize: true,
		sanitizeFn: null,
		separatorIcon: js_src_util_icons_js.SEPARATOR_ICON,
		separatorIconRtl: js_src_util_icons_js.SEPARATOR_ICON_RTL,
		size: null,
		startDate: null,
		startFloatingLabel: null,
		startName: null
	};
	const DefaultType = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaEndLabel: "string",
		ariaPickerLabel: "string",
		ariaStartLabel: "string",
		calendarOptions: "object",
		calendars: "number",
		cleaner: "boolean",
		cleanerIcon: "string",
		container: "(string|element|boolean)",
		disabled: "boolean",
		endDate: "(date|string|null)",
		endFloatingLabel: "(string|null)",
		endName: "(string|null)",
		inputOptions: "object",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		pickerIcon: "(string|boolean)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		separatorIcon: "string",
		separatorIconRtl: "string",
		size: "(string|null)",
		startDate: "(date|string|null)",
		startFloatingLabel: "(string|null)",
		startName: "(string|null)"
	};
	/**
	* Class definition
	*/
	var DateRangePicker = class DateRangePicker extends js_src_picker_base_js.default {
		constructor(element, config) {
			super(element, config);
			this._rangesTemplate = js_src_dom_selector_engine_js.default.findOne(SELECTOR_TEMPLATE_RANGES, this._element);
			this._rangeInput = null;
			this._calendar = null;
			this._syncingFromPanel = false;
			this._calendarElement = null;
			this._selectEndDate = false;
			this._hostClasses = (0, js_src_util_form_control_group_js.captureHostClasses)(this._element, this._managedClassNames());
			this._createDateRangePicker();
			this._createPopup();
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
		getStartDate() {
			return this._rangeInput.getStartDate();
		}
		getEndDate() {
			return this._rangeInput.getEndDate();
		}
		setRange(startDate, endDate) {
			this._rangeInput.setRange(startDate, endDate);
			this._setSelectEndDate(false);
		}
		clear() {
			this._rangeInput.clear();
			this._setSelectEndDate(false);
		}
		reset() {
			this._rangeInput.reset();
			this._setSelectEndDate(false);
		}
		getContext() {
			return {
				...this._baseContext(),
				endDate: this.getEndDate(),
				isDateSelectable: (date) => this._rangeInput.isDateSelectable(date),
				setRange: (startDate, endDate) => this.setRange(startDate, endDate),
				startDate: this.getStartDate()
			};
		}
		_listeningElements() {
			return [...super._listeningElements(), this._frameElement];
		}
		_disposeParts() {
			this._rangeInput.dispose();
			this._calendar?.dispose();
			this._frameElement.remove();
		}
		_managedClassNames() {
			return [
				CLASS_NAME_DATE_PICKER,
				CLASS_NAME_DATE_RANGE_PICKER,
				CLASS_NAME_PICKER
			].filter(Boolean);
		}
		_resolveFormat() {
			if (this._config.format) return this._config.format;
			return {
				month: "MM/yyyy",
				quarter: "QQQ yyyy",
				week: js_src_util_date_sections_js.getWeekSectionsFromLocale,
				year: "yyyy"
			}[this._config.selectionType] ?? null;
		}
		_setSelectEndDate(value) {
			if (this._selectEndDate === value) return;
			this._selectEndDate = value;
			this._calendar?.setConfig({ selectEndDate: value });
		}
		_createDateRangePicker() {
			this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_RANGE_PICKER, CLASS_NAME_PICKER);
			const inputGroup = document.createElement("div");
			this._element.append(inputGroup);
			this._frameElement = inputGroup;
			this._rangeInput = new js_src_date_range_input_js.default(inputGroup, this._forwardConfig(js_src_date_range_input_js.default, {
				disabled: this._config.disabled,
				endDate: this._config.endDate,
				locale: this._config.locale,
				size: this._config.size,
				startDate: this._config.startDate,
				...this._resolveFormat() ? { format: this._resolveFormat() } : {}
			}, { inputOptions: this._config.inputOptions }));
			js_src_dom_event_handler_js.default.on(inputGroup, js_src_date_range_input_js.default.eventName("startDateChange"), (event) => {
				if (!this._syncingFromPanel) {
					this._calendar?.setConfig({ startDate: event.date });
					this._triggerDateChange(EVENT_START_DATE_CHANGE, event.date);
				}
			});
			js_src_dom_event_handler_js.default.on(inputGroup, js_src_date_range_input_js.default.eventName("endDateChange"), (event) => {
				if (!this._syncingFromPanel) {
					this._calendar?.setConfig({ endDate: event.date });
					this._triggerDateChange(EVENT_END_DATE_CHANGE, event.date);
				}
			});
			const action = (className, icon, label) => (0, js_src_util_form_control_group_js.createControlGroupAction)({
				className,
				disabled: this._config.disabled,
				icon,
				label,
				sanitizeIcon: (value) => (0, js_src_util_sanitizer_js.sanitizeByConfig)(value, this._config)
			});
			if (this._config.cleaner) {
				this._cleanerElement = action(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				inputGroup.append(this._cleanerElement);
			}
			this._toggleElement = null;
			if (this._config.pickerIcon) {
				const indicator = action(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? js_src_util_icons_js.CALENDAR_ICON : this._config.pickerIcon, this._config.ariaPickerLabel);
				inputGroup.append(indicator);
				this._toggleElement = indicator;
			}
			this._menu = document.createElement("div");
			this._menu.id = (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}-popup-`);
			this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN);
			this._writeToggleAttribute("aria-expanded", "false");
			this._writeToggleAttribute("aria-haspopup", "dialog");
			const body = document.createElement("div");
			body.classList.add(CLASS_NAME_BODY);
			if (this._rangesTemplate) {
				const ranges = document.createElement("div");
				ranges.classList.add(CLASS_NAME_RANGES);
				ranges.append(this._rangesTemplate.content.cloneNode(true));
				body.append(ranges);
			}
			const calendars = document.createElement("div");
			calendars.classList.add(CLASS_NAME_CALENDARS);
			this._calendarElement = document.createElement("div");
			this._calendarElement.classList.add(CLASS_NAME_CALENDAR);
			calendars.append(this._calendarElement);
			body.append(calendars);
			this._menu.append(body);
			if (this._footerTemplate) {
				const footer = document.createElement("div");
				footer.classList.add(CLASS_NAME_FOOTER);
				footer.append(this._footerTemplate.content.cloneNode(true));
				this._menu.append(footer);
			}
		}
		_ensureCalendar() {
			if (this._calendar) return;
			this._calendar = new js_src_calendar_js.default(this._calendarElement, this._forwardConfig(js_src_calendar_js.default, {
				calendars: this._config.calendars,
				endDate: this.getEndDate(),
				locale: this._config.locale,
				range: true,
				selectEndDate: this._selectEndDate,
				startDate: this.getStartDate()
			}, this._config.calendarOptions));
			js_src_dom_event_handler_js.default.on(this._calendar._element, "selectEndChange.coreui.calendar", (event) => {
				this._selectEndDate = event.value;
			});
			js_src_dom_event_handler_js.default.on(this._calendar._element, "startDateChange.coreui.calendar", (event) => {
				this._syncingFromPanel = true;
				this._rangeInput.setRange(event.dateObject, this.getEndDate());
				this._syncingFromPanel = false;
				this._triggerDateChange(EVENT_START_DATE_CHANGE, this.getStartDate());
			});
			js_src_dom_event_handler_js.default.on(this._calendar._element, "endDateChange.coreui.calendar", (event) => {
				this._syncingFromPanel = true;
				this._rangeInput.setRange(this.getStartDate(), event.dateObject);
				this._syncingFromPanel = false;
				this._triggerDateChange(EVENT_END_DATE_CHANGE, this.getEndDate());
				if (this.getEndDate() && this.getStartDate() && !this._footerTemplate) this.hide();
			});
		}
		_triggerDateChange(eventName, date) {
			js_src_dom_event_handler_js.default.trigger(this._element, eventName, {
				date,
				formattedDate: (0, js_src_util_calendar_js.getDateBySelectionType)(date, this._config.selectionType)
			});
		}
		_addEventListeners() {
			super._addEventListeners();
			const eventName = this.constructor.eventName("focusin");
			js_src_dom_event_handler_js.default.on(this._rangeInput.getStartElement(), eventName, () => {
				this._setSelectEndDate(false);
			});
			js_src_dom_event_handler_js.default.on(this._rangeInput.getEndElement(), eventName, () => {
				this._setSelectEndDate(true);
			});
		}
		_onPopupShow() {
			this._ensureCalendar();
		}
		_popupAnchor() {
			return this._frameElement;
		}
		_isNowSelectable() {
			return this._rangeInput.isDateSelectable(/* @__PURE__ */ new Date());
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, DateRangePicker, config, args);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_DATE_RANGE_PICKER)) DateRangePicker.getOrCreateInstance(element);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(DateRangePicker);
	//#endregion
	return DateRangePicker;
});

//# sourceMappingURL=date-range-picker.js.map