/*!
* CoreUI PRO date-picker.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./picker-base.js"), require("./calendar.js"), require("./date-input.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/calendar.js"), require("./util/date-sections.js"), require("./util/form-control-group.js"), require("./util/icons.js"), require("./util/index.js"), require("./util/sanitizer.js")) : typeof define === "function" && define.amd ? define([
		"./picker-base.js",
		"./calendar.js",
		"./date-input.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/calendar.js",
		"./util/date-sections.js",
		"./util/form-control-group.js",
		"./util/icons.js",
		"./util/index.js",
		"./util/sanitizer.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.DatePicker = factory(global.PickerBase, global.Calendar, global.DateInput, global.EventHandler, global.SelectorEngine, global.Calendar, global.DateSections, global.FormControlGroup, global.Icons, global.Index, global.Sanitizer));
})(this, function(js_src_picker_base_js, js_src_calendar_js, js_src_date_input_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_calendar_js, js_src_util_date_sections_js, js_src_util_form_control_group_js, js_src_util_icons_js, js_src_util_index_js, js_src_util_sanitizer_js) {
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
	//#region js/src/date-picker.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO date-picker.js
	* License (https://coreui.io/pro/license/)
	*
	* Composed from existing components — DateInput (section field), Calendar and
	* the Popup — joined by one piece of state, the date, that the picker owns.
	* The markup is the composition surface: a field, a toggle and a cleaner the
	* author wrote (by role attribute) are adopted; whatever is missing is
	* generated, so a bare `<div data-coreui-date-picker>` keeps working.
	* Projected regions (footer) come from a <template> child and act through the
	* slot context, not through configuration props.
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "date-picker";
	const EVENT_KEY = `.coreui.date-picker`;
	const DATA_API_KEY = ".data-api";
	const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_BODY = "date-picker-body";
	const CLASS_NAME_CALENDAR = "date-picker-calendar";
	const CLASS_NAME_CALENDARS = "date-picker-calendars";
	const CLASS_NAME_DATE_PICKER = "date-picker";
	const CLASS_NAME_DROPDOWN = "date-picker-popup";
	const CLASS_NAME_FOOTER = "date-picker-footer";
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_INDICATOR = "form-control-action";
	const CLASS_NAME_INPUT_GROUP = "form-control-group";
	const CLASS_NAME_PICKER = "picker";
	const CLASS_NAME_POPUP = "popup";
	const SELECTOR_DATA_DATE_PICKER = "[data-coreui-date-picker]";
	const SELECTOR_ROLE_CLEANER = "[data-coreui-picker-cleaner]";
	const SELECTOR_ROLE_FIELD = "[data-coreui-picker-field]";
	const SELECTOR_ROLE_TOGGLE = "[data-coreui-picker-toggle]";
	const SELECTOR_ACTION_TODAY = "[data-coreui-picker-action=\"today\"]";
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaCleanerLabel: "Clear date",
		ariaPickerLabel: "Toggle calendar",
		calendarOptions: {},
		cleaner: true,
		cleanerIcon: js_src_util_icons_js.CLEANER_ICON,
		container: false,
		date: null,
		disabled: false,
		floatingLabel: null,
		inputOptions: {},
		locale: navigator.language,
		maxDate: null,
		minDate: null,
		name: null,
		pickerIcon: true,
		sanitize: true,
		sanitizeFn: null,
		size: null
	};
	const DefaultType = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		calendarOptions: "object",
		cleaner: "boolean",
		cleanerIcon: "string",
		container: "(string|element|boolean)",
		date: "(date|string|null)",
		disabled: "boolean",
		floatingLabel: "(string|null)",
		inputOptions: "object",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		name: "(string|null)",
		pickerIcon: "(string|boolean)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		size: "(string|null)"
	};
	/**
	* Class definition
	*/
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
			this._applying = false;
			this._calendarElement = null;
			this._hostClasses = (0, js_src_util_form_control_group_js.captureHostClasses)(this._element, this._managedClassNames());
			this._createDatePicker();
			this._date = this._input.getDate();
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
			return this._date;
		}
		setDate(date) {
			this._applyDate(date);
		}
		clear() {
			this._applyDate(null);
		}
		reset() {
			this._applyDate(this._initialDate);
		}
		today() {
			this._applyDate(/* @__PURE__ */ new Date());
		}
		getContext() {
			return {
				...this._baseContext(),
				date: this.getDate(),
				isDateSelectable: (date) => this._input.isDateSelectable(date),
				setDate: (date) => this.setDate(date),
				today: () => this.today()
			};
		}
		_disposeParts() {
			this._input.dispose();
			this._calendar?.dispose();
			if (this._created.field) this._fieldElement.remove();
			if (this._created.cleaner) this._cleanerElement?.remove();
			if (this._created.toggle) this._toggleElement?.remove();
		}
		_managedClassNames() {
			return [
				CLASS_NAME_DATE_PICKER,
				CLASS_NAME_PICKER,
				CLASS_NAME_INPUT_GROUP,
				...(0, js_src_util_form_control_group_js.managedSizeClassNames)(this._config.size)
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
		_createDatePicker() {
			this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_PICKER);
			const inputGroup = this._element;
			(0, js_src_util_form_control_group_js.applyControlGroupClasses)(inputGroup, CLASS_NAME_INPUT_GROUP);
			(0, js_src_util_form_control_group_js.applyControlGroupSize)(inputGroup, this._config.size);
			const ownField = js_src_dom_selector_engine_js.default.findOne(SELECTOR_ROLE_FIELD, inputGroup);
			const inputEl = ownField ?? document.createElement("div");
			this._created.field = !ownField;
			this._fieldElement = ownField ?? (0, js_src_util_form_control_group_js.appendControlGroupField)(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`);
			const action = (className, icon, label) => (0, js_src_util_form_control_group_js.createControlGroupAction)({
				className,
				disabled: this._config.disabled,
				icon,
				label,
				sanitizeIcon: (value) => (0, js_src_util_sanitizer_js.sanitizeByConfig)(value, this._config)
			});
			const ownCleaner = js_src_dom_selector_engine_js.default.findOne(SELECTOR_ROLE_CLEANER, inputGroup);
			if (ownCleaner) this._cleanerElement = this._adoptAction(ownCleaner, this._config.ariaCleanerLabel);
			else if (this._config.cleaner) {
				this._cleanerElement = action(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				this._created.cleaner = true;
				inputGroup.append(this._cleanerElement);
			}
			const ownToggle = js_src_dom_selector_engine_js.default.findOne(SELECTOR_ROLE_TOGGLE, inputGroup);
			this._toggleElement = null;
			if (ownToggle) this._toggleElement = this._adoptAction(ownToggle, this._config.ariaPickerLabel);
			else if (this._config.pickerIcon) {
				this._toggleElement = action(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? js_src_util_icons_js.CALENDAR_ICON : this._config.pickerIcon, this._config.ariaPickerLabel);
				this._created.toggle = true;
				inputGroup.append(this._toggleElement);
			}
			this._input = new js_src_date_input_js.default(inputEl, this._forwardConfig(js_src_date_input_js.default, {
				date: this._config.date,
				disabled: this._config.disabled,
				locale: this._config.locale,
				name: this._config.name,
				...this._resolveFormat() ? { format: this._resolveFormat() } : {}
			}, {
				...this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {},
				...this._config.inputOptions
			}));
			js_src_dom_event_handler_js.default.on(inputEl, js_src_date_input_js.default.eventName(js_src_date_input_js.default.CHANGE_EVENT_NAME), (event) => {
				this._applyDate(event.date, { field: false });
			});
			this._menu = document.createElement("div");
			this._menu.id = (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}-popup-`);
			this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN);
			this._writeToggleAttribute("aria-expanded", "false");
			this._writeToggleAttribute("aria-haspopup", "dialog");
			const body = document.createElement("div");
			body.classList.add(CLASS_NAME_BODY);
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
				this._disableUnselectableActions(SELECTOR_ACTION_TODAY, footer);
				this._menu.append(footer);
			}
		}
		_isNowSelectable() {
			return this._input.isDateSelectable(/* @__PURE__ */ new Date());
		}
		_ensureCalendar() {
			if (this._calendar) return;
			this._calendar = new js_src_calendar_js.default(this._calendarElement, this._forwardConfig(js_src_calendar_js.default, {
				locale: this._config.locale,
				startDate: this.getDate()
			}, this._config.calendarOptions));
			js_src_dom_event_handler_js.default.on(this._calendar._element, "startDateChange.coreui.calendar", (event) => {
				this._applyDate(event.dateObject, { calendar: false });
				this.hide();
			});
		}
		_applyDate(date, { calendar = true, field = true } = {}) {
			if (this._applying) return;
			this._applying = true;
			if (field) this._input.setConfig({ date });
			const applied = field ? this._input.getDate() : date;
			this._applying = false;
			const changed = !(0, js_src_util_calendar_js.isSameDateAs)(applied, this._date);
			this._date = applied;
			if (calendar) this._calendar?.setConfig({ startDate: applied });
			if (changed) js_src_dom_event_handler_js.default.trigger(this._element, EVENT_DATE_CHANGE, {
				date: applied,
				formattedDate: (0, js_src_util_calendar_js.getDateBySelectionType)(applied, this._config.selectionType)
			});
		}
		_writeToggleAttribute(name, value) {
			if (!this._toggleElement) return;
			if (this._created.toggle) {
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
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_DATE_PICKER)) DatePicker.getOrCreateInstance(element);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(DatePicker);
	//#endregion
	return DatePicker;
});

//# sourceMappingURL=date-picker.js.map