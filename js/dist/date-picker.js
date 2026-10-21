/*!
* CoreUI PRO date-picker.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./picker-base.js"), require("./calendar.js"), require("./date-input.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./time-selection/selects.js"), require("./util/calendar.js"), require("./util/date-sections.js"), require("./util/form-control-group.js"), require("./util/icons.js"), require("./util/index.js"), require("./util/sanitizer.js")) : typeof define === "function" && define.amd ? define([
		"./picker-base.js",
		"./calendar.js",
		"./date-input.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./time-selection/selects.js",
		"./util/calendar.js",
		"./util/date-sections.js",
		"./util/form-control-group.js",
		"./util/icons.js",
		"./util/index.js",
		"./util/sanitizer.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.DatePicker = factory(global.PickerBase, global.Calendar, global.DateInput, global.EventHandler, global.SelectorEngine, global.Selects, global.CalendarUtil, global.DateSections, global.FormControlGroup, global.Icons, global.Index, global.Sanitizer));
})(this, function(js_src_picker_base_js, js_src_calendar_js, js_src_date_input_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_time_selection_selects_js, js_src_util_calendar_js, js_src_util_date_sections_js, js_src_util_form_control_group_js, js_src_util_icons_js, js_src_util_index_js, js_src_util_sanitizer_js) {
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
	js_src_date_input_js = __toESM(js_src_date_input_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	js_src_time_selection_selects_js = __toESM(js_src_time_selection_selects_js);
	//#region js/src/date-picker.ts
	const NAME = "date-picker";
	const EVENT_KEY = `.coreui.date-picker`;
	const DATA_API_KEY = ".data-api";
	const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_BODY = "date-picker-body";
	const CLASS_NAME_CALENDAR = "date-picker-calendar";
	const CLASS_NAME_CALENDARS = "date-picker-calendars";
	const CLASS_NAME_DATE_PICKER = "date-picker";
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_INDICATOR = "form-control-action";
	const CLASS_NAME_INPUT_GROUP = "form-control-group";
	const CLASS_NAME_PICKER = "picker";
	const CLASS_NAME_TIME_BODY = "date-picker-time-body";
	const CLASS_NAME_TIME_PICKERS = "date-picker-timepickers";
	const SELECTOR_DATA_DATE_PICKER = "[data-coreui-date-picker]";
	const SELECTOR_ROLE_CLEANER = "[data-coreui-picker-cleaner]";
	const SELECTOR_ROLE_FIELD = "[data-coreui-picker-field]";
	const SELECTOR_ROLE_TOGGLE = "[data-coreui-picker-toggle]";
	const SELECTOR_ACTION_TODAY = "[data-coreui-picker-action=\"today\"]";
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaCleanerLabel: "Clear date",
		ariaPickerLabel: "Toggle calendar",
		ariaPopupLabel: "Calendar",
		calendarOptions: {},
		cleaner: true,
		cleanerIcon: js_src_util_icons_js.CLEANER_ICON,
		container: false,
		date: null,
		disabled: false,
		floatingLabel: null,
		format: null,
		inputOptions: {},
		invalid: false,
		locale: navigator.language,
		maxDate: null,
		minDate: null,
		monthNames: null,
		name: null,
		pickerIcon: true,
		sanitize: true,
		sanitizeFn: null,
		seconds: true,
		selectionOptions: {},
		selectionType: "day",
		size: null,
		timepicker: false,
		valid: false,
		validationState: null
	};
	const ORIGINAL_DEFAULT = { ...Default };
	const DefaultType = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		ariaPopupLabel: "string",
		calendarOptions: "object",
		cleaner: "boolean",
		cleanerIcon: "string",
		container: "(string|element|boolean)",
		date: "(date|string|null)",
		disabled: "boolean",
		floatingLabel: "(string|null)",
		format: "(function|string|null)",
		inputOptions: "object",
		invalid: "boolean",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		monthNames: "(array|null)",
		name: "(string|null)",
		pickerIcon: "(string|boolean)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		seconds: "(array|boolean|function)",
		selectionOptions: "object",
		selectionType: "string",
		size: "(string|null)",
		timepicker: "boolean",
		valid: "boolean",
		validationState: "(string|null|undefined)"
	};
	var DatePicker = class DatePicker extends js_src_picker_base_js.default {
		constructor(element, config) {
			super(element, config);
			this._initialDate = config?.date ?? this._config.date;
			this._created = {
				cleaner: false,
				field: false,
				toggle: false
			};
			this._input = null;
			this._calendar = null;
			this._calendarElement = null;
			this._selection = null;
			this._selectionElement = null;
			this._source = null;
			this._createDatePicker();
			this._nameToggle();
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
		getDate() {
			return this._input?.getDate() ?? null;
		}
		setDate(date) {
			this._typeCheckConfig({ date }, { date: DefaultType.date });
			this._writeField(date, "code", false);
		}
		clear() {
			this._writeField(null);
		}
		reset() {
			this._writeField(this._initialDate);
		}
		today() {
			this._writeField(/* @__PURE__ */ new Date());
		}
		getContext() {
			return {
				...this._baseContext(),
				date: this.getDate(),
				isDateSelectable: (date) => this._input.isDateSelectable(date),
				setDate: (date) => this._runAsUser(() => this._writeField(date)),
				today: () => this._runAsUser(() => this.today())
			};
		}
		_disposeParts() {
			this._input.dispose();
			this._calendar?.dispose();
			this._selection?.dispose();
			if (this._created.field) this._fieldElement.remove();
			if (this._created.cleaner) this._cleanerElement?.remove();
			if (this._created.toggle) this._toggleElement?.remove();
		}
		_originalDefault() {
			return ORIGINAL_DEFAULT;
		}
		_createDatePicker() {
			this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_PICKER);
			const inputGroup = this._element;
			(0, js_src_util_form_control_group_js.applyControlGroupClasses)(inputGroup, CLASS_NAME_INPUT_GROUP);
			(0, js_src_util_form_control_group_js.applyControlGroupSize)(inputGroup, this._config.size);
			const ownField = js_src_dom_selector_engine_js.default.findOne(SELECTOR_ROLE_FIELD, inputGroup);
			const inputEl = ownField ?? document.createElement("div");
			this._created.field = !ownField;
			this._fieldElement = ownField ?? (0, js_src_util_form_control_group_js.appendControlGroupField)(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`);
			this._moveAriaToField(inputEl);
			const cleanerLabel = this._withTime("ariaCleanerLabel", "Clear date and time");
			const pickerLabel = this._withTime("ariaPickerLabel", "Toggle calendar and time selection");
			const ownCleaner = js_src_dom_selector_engine_js.default.findOne(SELECTOR_ROLE_CLEANER, inputGroup);
			if (ownCleaner) this._cleanerElement = this._adoptAction(ownCleaner, cleanerLabel);
			else if (this._config.cleaner) {
				this._cleanerElement = this._createAction(CLASS_NAME_CLEANER, this._config.cleanerIcon, cleanerLabel);
				this._created.cleaner = true;
				inputGroup.append(this._cleanerElement);
			}
			const ownToggle = js_src_dom_selector_engine_js.default.findOne(SELECTOR_ROLE_TOGGLE, inputGroup);
			this._toggleElement = null;
			this._toggleLabel = null;
			if (ownToggle) {
				this._toggleLabel = ownToggle.hasAttribute("aria-label") || ownToggle.hasAttribute("aria-labelledby") || this._showsText(ownToggle) ? null : pickerLabel;
				this._toggleElement = this._adoptAction(ownToggle, pickerLabel);
			} else if (this._config.pickerIcon) {
				this._toggleLabel = pickerLabel;
				this._toggleElement = this._createAction(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? js_src_util_icons_js.CALENDAR_ICON : this._config.pickerIcon, pickerLabel);
				this._created.toggle = true;
				inputGroup.append(this._toggleElement);
			}
			const format = (0, js_src_util_date_sections_js.getPickerFormat)(this._config.format, this._config.selectionType);
			this._input = new js_src_date_input_js.default(inputEl, this._forwardConfig(js_src_date_input_js.default, {
				date: this._config.date,
				disabled: this._config.disabled,
				locale: this._config.locale,
				name: this._config.name,
				seconds: Boolean(this._config.seconds),
				type: this._config.timepicker ? "datetime" : "date",
				...format ? { format } : {}
			}, {
				...this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {},
				...this._config.inputOptions,
				validationState: null
			}));
			this._validation.adopt(this._input._validation);
			js_src_dom_event_handler_js.default.on(inputEl, js_src_date_input_js.default.eventName(js_src_date_input_js.default.CHANGE_EVENT_NAME), (event) => {
				this._onFieldChange(event.date);
			});
			const body = document.createElement("div");
			body.classList.add(CLASS_NAME_BODY);
			const calendars = document.createElement("div");
			calendars.classList.add(CLASS_NAME_CALENDARS);
			this._calendarElement = document.createElement("div");
			this._calendarElement.classList.add(CLASS_NAME_CALENDAR);
			calendars.append(this._calendarElement);
			body.append(calendars);
			if (this._config.timepicker) {
				const timePickers = document.createElement("div");
				timePickers.classList.add(CLASS_NAME_TIME_PICKERS);
				this._selectionElement = document.createElement("div");
				this._selectionElement.classList.add(CLASS_NAME_TIME_BODY);
				timePickers.append(this._selectionElement);
				body.append(timePickers);
			}
			this._createMenu(CLASS_NAME_DATE_PICKER, body, SELECTOR_ACTION_TODAY);
		}
		_isNowSelectable() {
			return this._input.isDateSelectable(/* @__PURE__ */ new Date());
		}
		_popupLabel() {
			return this._withTime("ariaPopupLabel", "Calendar and time selection");
		}
		_withTime(key, timed) {
			return this._config.timepicker && this._config[key] === ORIGINAL_DEFAULT[key] ? timed : this._config[key];
		}
		_ensureCalendar() {
			if (this._calendar) return;
			this._calendar = new js_src_calendar_js.default(this._calendarElement, this._forwardConfig(js_src_calendar_js.default, {
				locale: this._config.locale,
				startDate: this.getDate()
			}, {
				...this._config.calendarOptions,
				...this._config.timepicker || !this._toggleLabel ? {} : { ariaSelectedDateAnnouncement: "" }
			}));
			js_src_dom_event_handler_js.default.on(this._calendar._element, "startDateChange.coreui.calendar", (event) => {
				this._runAsUser(() => this._writeField(this._withCurrentTime(event.dateObject), "calendar"));
				if (!this._config.timepicker) this.hide();
			});
			if (!this._config.timepicker) return;
			const hourCycle = (0, js_src_util_date_sections_js.getHourCycle)(this._input._sections);
			this._selection = new js_src_time_selection_selects_js.default(this._selectionElement, this._forwardConfig(js_src_time_selection_selects_js.default, { locale: this._config.locale }, {
				...this._config.selectionOptions,
				...hourCycle && { hourCycle },
				onChange: (time) => this._runAsUser(() => this._applyTime(time)),
				time: this.getDate()
			}));
		}
		_withinTimeLimits(date) {
			const { locale, maxDate, minDate } = this._config;
			return (0, js_src_util_date_sections_js.constrainDateTime)(date, (0, js_src_util_date_sections_js.convertValue)(minDate, "datetime", locale), (0, js_src_util_date_sections_js.convertValue)(maxDate, "datetime", locale));
		}
		_withCurrentTime(date) {
			if (!date || !this._config.timepicker) return date;
			const merged = new Date(date);
			const current = this.getDate();
			if (current) merged.setHours(current.getHours(), current.getMinutes(), current.getSeconds());
			return this._withinTimeLimits(merged);
		}
		_applyTime(time) {
			if (!time) return;
			const merged = new Date(this.getDate() ?? this._withinTimeLimits(/* @__PURE__ */ new Date()));
			merged.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
			const limited = this._withinTimeLimits(merged);
			this._writeField(limited, "selection");
			if (this._element && (0, js_src_util_calendar_js.isSameInstantAs)(this._selection?.getTime(), time)) this._selection.setTime(this.getDate() ?? limited);
		}
		_writeField(date, source = "code", triggerChange = true) {
			const previous = this._source;
			this._source = source;
			try {
				this._input.setDate(date, triggerChange);
				if (this._element && this._source === source) this._syncParts();
			} finally {
				this._source = previous;
			}
		}
		_onFieldChange(date) {
			this._syncParts();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_DATE_CHANGE, {
				date,
				formattedDate: (0, js_src_util_calendar_js.getDateBySelectionType)(date, this._config.selectionType)
			});
		}
		_syncParts() {
			const source = this._source;
			const date = this.getDate();
			this._source = null;
			if (this._calendar && (source === "code" || !(0, js_src_util_calendar_js.isSameDateAs)(this._calendar._startDate, date))) this._calendar.setStartDate(date);
			if (source !== "selection") this._selection?.setConfig({ time: date });
			this._nameToggle();
		}
		_nameToggle() {
			if (!this._toggleElement || !this._toggleLabel) return;
			const date = this.getDate();
			const name = date && (0, js_src_util_calendar_js.formatSelectionName)(date, this._forwardConfig(js_src_calendar_js.default, { locale: this._config.locale }, this._config.calendarOptions));
			const time = date && this._config.timepicker && (0, js_src_util_calendar_js.createDateTimeFormat)(this._config.locale, { timeStyle: this._config.seconds === false ? "short" : "medium" }).format(date);
			this._writeToggleAttribute("aria-label", [
				this._toggleLabel,
				name,
				time
			].filter(Boolean).join(", "));
		}
		_writeToggleAttribute(name, value) {
			if (!this._toggleElement) return;
			if (this._created.toggle || name !== "aria-label" && name !== "aria-controls") {
				this._toggleElement.setAttribute(name, value);
				return;
			}
			this._writeAdoptedAttribute(this._toggleElement, name, value);
		}
		_onPopupShow() {
			this._ensureCalendar();
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, DatePicker, config, args);
		}
	};
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_DATE_PICKER)) DatePicker.getOrCreateInstance(element);
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(DatePicker);
	//#endregion
	return DatePicker;
});

//# sourceMappingURL=date-picker.js.map