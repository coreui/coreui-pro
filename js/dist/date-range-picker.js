/*!
* CoreUI PRO date-range-picker.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./picker-base.js"), require("./calendar.js"), require("./date-range-input.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/calendar.js"), require("./util/date-sections.js"), require("./util/icons.js"), require("./util/index.js"), require("./util/sanitizer.js")) : typeof define === "function" && define.amd ? define([
		"./picker-base.js",
		"./calendar.js",
		"./date-range-input.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/calendar.js",
		"./util/date-sections.js",
		"./util/icons.js",
		"./util/index.js",
		"./util/sanitizer.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.DateRangePicker = factory(global.PickerBase, global.Calendar, global.DateRangeInput, global.EventHandler, global.SelectorEngine, global.CalendarUtil, global.DateSections, global.Icons, global.Index, global.Sanitizer));
})(this, function(js_src_picker_base_js, js_src_calendar_js, js_src_date_range_input_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_calendar_js, js_src_util_date_sections_js, js_src_util_icons_js, js_src_util_index_js, js_src_util_sanitizer_js) {
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
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_INDICATOR = "form-control-action";
	const CLASS_NAME_PICKER = "picker";
	const CLASS_NAME_RANGES = "date-picker-ranges";
	const SELECTOR_DATA_DATE_RANGE_PICKER = "[data-coreui-date-range-picker]";
	const SELECTOR_TEMPLATE_RANGES = "template[data-coreui-template=\"ranges\"]";
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaCleanerLabel: "Clear date range",
		ariaEndLabel: "End date",
		ariaPickerLabel: "Toggle calendar",
		ariaPopupLabel: "Calendar",
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
		format: null,
		inputOptions: {},
		invalid: false,
		locale: navigator.language,
		maxDate: null,
		minDate: null,
		pickerIcon: true,
		sanitize: true,
		sanitizeFn: null,
		selectionType: "day",
		separatorIcon: js_src_util_icons_js.SEPARATOR_ICON,
		separatorIconRtl: js_src_util_icons_js.SEPARATOR_ICON_RTL,
		size: null,
		startDate: null,
		startFloatingLabel: null,
		startName: null,
		valid: false,
		validationState: null
	};
	const ORIGINAL_DEFAULT = { ...Default };
	const DefaultType = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaEndLabel: "string",
		ariaPickerLabel: "string",
		ariaPopupLabel: "string",
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
		format: "(function|string|null)",
		inputOptions: "object",
		invalid: "boolean",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		pickerIcon: "(string|boolean)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		selectionType: "string",
		separatorIcon: "string",
		separatorIconRtl: "string",
		size: "(string|null)",
		startDate: "(date|string|null)",
		startFloatingLabel: "(string|null)",
		startName: "(string|null)",
		valid: "boolean",
		validationState: "(string|null|undefined)"
	};
	var DateRangePicker = class DateRangePicker extends js_src_picker_base_js.default {
		constructor(element, config) {
			super(element, config);
			this._rangesTemplate = js_src_dom_selector_engine_js.default.findOne(SELECTOR_TEMPLATE_RANGES, this._element);
			this._rangeInput = null;
			this._calendar = null;
			this._calendarElement = null;
			this._selectEndDate = false;
			this._createDateRangePicker();
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
		getStartDate() {
			return this._rangeInput?.getStartDate() ?? null;
		}
		getEndDate() {
			return this._rangeInput?.getEndDate() ?? null;
		}
		setEndDate(endDate) {
			this._typeCheckConfig({ endDate }, { endDate: DefaultType.endDate });
			this._applyRange(() => this._rangeInput.setEndDate(endDate));
		}
		setRange(startDate, endDate) {
			this._typeCheckConfig({
				endDate,
				startDate
			}, {
				endDate: DefaultType.endDate,
				startDate: DefaultType.startDate
			});
			this._applyRange(() => this._rangeInput.setRange(startDate, endDate));
		}
		setStartDate(startDate) {
			this._typeCheckConfig({ startDate }, { startDate: DefaultType.startDate });
			this._applyRange(() => this._rangeInput.setStartDate(startDate));
		}
		clear() {
			this._rangeInput.clear();
			this._setSelectEndDate(false);
		}
		reset() {
			this._rangeInput.reset();
			this._showRange();
			this._setSelectEndDate(false);
		}
		getContext() {
			return {
				...this._baseContext(),
				endDate: this.getEndDate(),
				isDateSelectable: (date) => this._rangeInput.isDateSelectable(date),
				setRange: (startDate, endDate) => this._runAsUser(() => this._applyRange(() => this._rangeInput.setRange(startDate, endDate, true))),
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
		_applyRange(write) {
			write();
			this._showRange();
			this._nameToggle();
			this._setSelectEndDate(false);
		}
		_originalDefault() {
			return ORIGINAL_DEFAULT;
		}
		_setSelectEndDate(value) {
			if (this._selectEndDate === value) return;
			this._selectEndDate = value;
			this._calendar?.setSelectEndDate(value);
			this._syncPickMessages();
		}
		_pickMessages() {
			if (!this._footerTemplate && this._toggleElement && this._selectEndDate && this.getStartDate()) return {
				ariaSelectedDateAnnouncement: "",
				ariaSelectedRangeAnnouncement: ""
			};
			const { ariaSelectedDateAnnouncement = js_src_calendar_js.default.Default.ariaSelectedDateAnnouncement, ariaSelectedRangeAnnouncement = js_src_calendar_js.default.Default.ariaSelectedRangeAnnouncement } = this._forwardConfig(js_src_calendar_js.default, {}, this._config.calendarOptions);
			return {
				ariaSelectedDateAnnouncement,
				ariaSelectedRangeAnnouncement
			};
		}
		_syncPickMessages() {
			queueMicrotask(() => this._calendar?._setAnnouncements(this._pickMessages()));
		}
		_showRange() {
			this._calendar?.setRange(this.getStartDate(), this.getEndDate());
		}
		_createDateRangePicker() {
			this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_RANGE_PICKER, CLASS_NAME_PICKER);
			this._element.setAttribute("role", "group");
			const describedBy = this._element.getAttribute("aria-describedby");
			const inputGroup = document.createElement("div");
			if (describedBy !== null) {
				inputGroup.setAttribute("aria-describedby", describedBy);
				this._writeAdoptedAttribute(this._element, "aria-describedby", null);
			}
			this._element.append(inputGroup);
			this._frameElement = inputGroup;
			const format = (0, js_src_util_date_sections_js.getPickerFormat)(this._config.format, this._config.selectionType);
			this._rangeInput = new js_src_date_range_input_js.default(inputGroup, this._forwardConfig(js_src_date_range_input_js.default, {
				disabled: this._config.disabled,
				endDate: this._config.endDate,
				locale: this._config.locale,
				size: this._config.size,
				startDate: this._config.startDate,
				validationState: null,
				...format ? { format } : {}
			}, { inputOptions: this._config.inputOptions }));
			inputGroup.setAttribute("role", "none");
			this._validation.adopt(this._rangeInput._validation);
			js_src_dom_event_handler_js.default.on(inputGroup, js_src_date_range_input_js.default.eventName("startDateChange"), (event) => {
				this._nameToggle();
				this._syncPickMessages();
				if (this._calendar && !(0, js_src_util_calendar_js.isSameDateAs)(this._calendar._startDate, event.date)) this._calendar.setStartDate(event.date);
				this._triggerDateChange(EVENT_START_DATE_CHANGE, event.date);
			});
			js_src_dom_event_handler_js.default.on(inputGroup, js_src_date_range_input_js.default.eventName("endDateChange"), (event) => {
				this._nameToggle();
				if (this._calendar && !(0, js_src_util_calendar_js.isSameDateAs)(this._calendar._endDate, event.date)) this._calendar.setEndDate(event.date);
				this._triggerDateChange(EVENT_END_DATE_CHANGE, event.date);
			});
			if (this._config.cleaner) {
				this._cleanerElement = this._createAction(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				inputGroup.append(this._cleanerElement);
			}
			this._toggleElement = null;
			if (this._config.pickerIcon) {
				this._toggleElement = this._createAction(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? js_src_util_icons_js.CALENDAR_ICON : this._config.pickerIcon, this._config.ariaPickerLabel);
				inputGroup.append(this._toggleElement);
			}
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
			this._createMenu(CLASS_NAME_DATE_PICKER, body);
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
			}, {
				...this._config.calendarOptions,
				...this._pickMessages()
			}));
			js_src_dom_event_handler_js.default.on(this._calendar._element, "selectEndChange.coreui.calendar", (event) => {
				this._selectEndDate = event.value;
				this._syncPickMessages();
			});
			js_src_dom_event_handler_js.default.on(this._calendar._element, "startDateChange.coreui.calendar", (event) => {
				this._runAsUser(() => this._rangeInput.setRange(event.dateObject, this.getEndDate(), true));
			});
			js_src_dom_event_handler_js.default.on(this._calendar._element, "endDateChange.coreui.calendar", (event) => {
				this._runAsUser(() => this._rangeInput.setRange(this.getStartDate(), event.dateObject, true));
				if (this.getEndDate() && this.getStartDate() && !this._footerTemplate) this.hide();
			});
		}
		_nameToggle() {
			if (!this._toggleElement) return;
			const start = this.getStartDate();
			const end = this.getEndDate();
			const name = start && end && (0, js_src_util_calendar_js.formatSelectionRangeName)(start, end, this._forwardConfig(js_src_calendar_js.default, { locale: this._config.locale }, this._config.calendarOptions));
			this._toggleElement.setAttribute("aria-label", name ? `${this._config.ariaPickerLabel}, ${name}` : this._config.ariaPickerLabel);
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
		_stateFrames() {
			return [this._element];
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, DateRangePicker, config, args);
		}
	};
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_DATE_RANGE_PICKER)) DateRangePicker.getOrCreateInstance(element);
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(DateRangePicker);
	//#endregion
	return DateRangePicker;
});

//# sourceMappingURL=date-range-picker.js.map