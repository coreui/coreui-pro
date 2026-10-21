/*!
* CoreUI PRO time-picker.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./picker-base.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./time-input.js"), require("./time-selection/roll.js"), require("./util/sanitizer.js"), require("./util/calendar.js"), require("./util/date-sections.js"), require("./util/form-control-group.js"), require("./util/icons.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./picker-base.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./time-input.js",
		"./time-selection/roll.js",
		"./util/sanitizer.js",
		"./util/calendar.js",
		"./util/date-sections.js",
		"./util/form-control-group.js",
		"./util/icons.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.TimePicker = factory(global.PickerBase, global.EventHandler, global.SelectorEngine, global.TimeInput, global.Roll, global.Sanitizer, global.CalendarUtil, global.DateSections, global.FormControlGroup, global.Icons, global.Index));
})(this, function(js_src_picker_base_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_time_input_js, js_src_time_selection_roll_js, js_src_util_sanitizer_js, js_src_util_calendar_js, js_src_util_date_sections_js, js_src_util_form_control_group_js, js_src_util_icons_js, js_src_util_index_js) {
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
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	js_src_time_input_js = __toESM(js_src_time_input_js);
	js_src_time_selection_roll_js = __toESM(js_src_time_selection_roll_js);
	//#region js/src/time-picker.ts
	const NAME = "time-picker";
	const EVENT_KEY = `.coreui.time-picker`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}.data-api`;
	const EVENT_TIME_CHANGE = `timeChange${EVENT_KEY}`;
	const CLASS_NAME_BODY = "time-picker-body";
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_INDICATOR = "form-control-action";
	const CLASS_NAME_INPUT_GROUP = "form-control-group";
	const CLASS_NAME_PICKER = "picker";
	const CLASS_NAME_TIME_PICKER = "time-picker";
	const SELECTOR_ACTION_NOW = "[data-coreui-picker-action=\"now\"]";
	const SELECTOR_DATA_TIME_PICKER = "[data-coreui-time-picker]";
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaCleanerLabel: "Clear time",
		ariaPickerLabel: "Toggle time selection",
		ariaPopupLabel: "Time selection",
		cleaner: true,
		cleanerIcon: js_src_util_icons_js.CLEANER_ICON,
		container: false,
		disabled: false,
		floatingLabel: null,
		inputOptions: {},
		invalid: false,
		locale: navigator.language,
		name: null,
		pickerIcon: true,
		sanitize: true,
		sanitizeFn: null,
		seconds: true,
		selectionOptions: {},
		size: null,
		time: null,
		valid: false,
		validationState: null
	};
	const ORIGINAL_DEFAULT = { ...Default };
	const DefaultType = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		ariaPopupLabel: "string",
		cleaner: "boolean",
		cleanerIcon: "string",
		container: "(string|element|boolean)",
		disabled: "boolean",
		floatingLabel: "(string|null)",
		inputOptions: "object",
		invalid: "boolean",
		locale: "string",
		name: "(string|null)",
		pickerIcon: "(string|boolean)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		seconds: "(array|boolean|function)",
		selectionOptions: "object",
		size: "(string|null)",
		time: "(date|string|null)",
		valid: "boolean",
		validationState: "(string|null|undefined)"
	};
	var TimePicker = class TimePicker extends js_src_picker_base_js.default {
		constructor(element, config) {
			super(element, config);
			this._initialTime = config?.time ?? this._config.time;
			this._input = null;
			this._selection = null;
			this._selectionElement = null;
			this._source = null;
			this._createTimePicker();
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
		getTime() {
			return this._input?.getDate() ?? null;
		}
		setTime(time) {
			this._typeCheckConfig({ time }, { time: DefaultType.time });
			this._write(time, "code", false);
		}
		now() {
			this._write(/* @__PURE__ */ new Date());
		}
		clear() {
			this._write(null);
		}
		reset() {
			this._write(this._initialTime);
		}
		getContext() {
			return {
				...this._baseContext(),
				isTimeSelectable: (time) => this._input.isDateSelectable(time),
				now: () => this._runAsUser(() => this.now()),
				setTime: (time) => this._runAsUser(() => this._write(time)),
				time: this.getTime()
			};
		}
		_disposeParts() {
			this._input.dispose();
			this._selection?.dispose();
			this._fieldElement.remove();
			this._cleanerElement?.remove();
			this._toggleElement?.remove();
		}
		_originalDefault() {
			return ORIGINAL_DEFAULT;
		}
		_createTimePicker() {
			this._element.classList.add(CLASS_NAME_TIME_PICKER, CLASS_NAME_PICKER);
			const inputGroup = this._element;
			(0, js_src_util_form_control_group_js.applyControlGroupClasses)(inputGroup, CLASS_NAME_INPUT_GROUP);
			(0, js_src_util_form_control_group_js.applyControlGroupSize)(inputGroup, this._config.size);
			const inputEl = document.createElement("div");
			this._fieldElement = (0, js_src_util_form_control_group_js.appendControlGroupField)(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`);
			this._moveAriaToField(inputEl);
			if (this._config.cleaner) {
				this._cleanerElement = this._createAction(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				inputGroup.append(this._cleanerElement);
			}
			this._toggleElement = null;
			if (this._config.pickerIcon) {
				this._toggleElement = this._createAction(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? js_src_util_icons_js.CLOCK_ICON : this._config.pickerIcon, this._config.ariaPickerLabel);
				inputGroup.append(this._toggleElement);
			}
			this._input = new js_src_time_input_js.default(inputEl, this._forwardConfig(js_src_time_input_js.default, {
				date: this._config.time,
				disabled: this._config.disabled,
				locale: this._config.locale,
				name: this._config.name,
				seconds: Boolean(this._config.seconds)
			}, {
				...this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {},
				...this._config.inputOptions,
				validationState: null
			}));
			this._validation.adopt(this._input._validation);
			js_src_dom_event_handler_js.default.on(inputEl, js_src_time_input_js.default.eventName(js_src_time_input_js.default.CHANGE_EVENT_NAME), (event) => {
				this._onFieldChange(event.date);
			});
			this._selectionElement = document.createElement("div");
			this._selectionElement.classList.add(CLASS_NAME_BODY);
			this._createMenu(CLASS_NAME_TIME_PICKER, this._selectionElement, SELECTOR_ACTION_NOW);
		}
		_isNowSelectable() {
			return this._input.isDateSelectable(/* @__PURE__ */ new Date());
		}
		_ensureSelection() {
			if (this._selection) return;
			const { locale, maxDate: max, minDate: min } = this._input._config;
			const [minDate, maxDate] = [min, max].map((limit) => (0, js_src_util_date_sections_js.getDateWithin)(this._input._sections, (0, js_src_util_date_sections_js.convertValue)(limit, "time", locale)));
			const hourCycle = (0, js_src_util_date_sections_js.getHourCycle)(this._input._sections);
			this._selection = new js_src_time_selection_roll_js.default(this._selectionElement, this._forwardConfig(js_src_time_selection_roll_js.default, {
				locale: this._config.locale,
				maxDate: maxDate ?? (minDate && (0, js_src_util_calendar_js.createDate)(1970)),
				minDate
			}, {
				...this._config.selectionOptions,
				...hourCycle && { hourCycle },
				onChange: (time) => this._runAsUser(() => this._applyTime(time && (0, js_src_util_date_sections_js.constrainDateTime)(time, minDate, maxDate), time)),
				time: this.getTime()
			}));
		}
		_applyTime(time, picked) {
			this._write(time, "selection");
			if (this._element && (0, js_src_util_calendar_js.isSameInstantAs)(this._selection.getTime(), picked)) this._selection.setTime(this.getTime() ?? time);
		}
		_write(time, source = "code", triggerChange = true) {
			const previous = this._source;
			this._source = source;
			try {
				this._input.setDate(time, triggerChange);
				if (this._element && this._source === source) this._syncParts();
			} finally {
				this._source = previous;
			}
		}
		_onFieldChange(time) {
			this._syncParts();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_TIME_CHANGE, { time });
		}
		_syncParts() {
			const source = this._source;
			this._source = null;
			if (source !== "selection") this._showTime(this.getTime());
		}
		_showTime(time) {
			if (this._selection && !(0, js_src_util_calendar_js.isSameInstantAs)(this._selection.getTime(), time)) this._selection.setConfig({ time });
		}
		_onPopupShow() {
			this._ensureSelection();
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, TimePicker, config, args);
		}
	};
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_TIME_PICKER)) TimePicker.getOrCreateInstance(element);
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(TimePicker);
	//#endregion
	return TimePicker;
});

//# sourceMappingURL=time-picker.js.map