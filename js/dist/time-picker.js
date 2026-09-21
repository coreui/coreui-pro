/*!
* CoreUI PRO time-picker.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./picker-base.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./time-input.js"), require("./util/time-selection.js"), require("./util/sanitizer.js"), require("./util/form-control-group.js"), require("./util/icons.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./picker-base.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./time-input.js",
		"./util/time-selection.js",
		"./util/sanitizer.js",
		"./util/form-control-group.js",
		"./util/icons.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.TimePicker = factory(global.PickerBase, global.EventHandler, global.SelectorEngine, global.TimeInput, global.TimeSelection, global.Sanitizer, global.FormControlGroup, global.Icons, global.Index));
})(this, function(js_src_picker_base_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_time_input_js, js_src_util_time_selection_js, js_src_util_sanitizer_js, js_src_util_form_control_group_js, js_src_util_icons_js, js_src_util_index_js) {
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
	js_src_util_time_selection_js = __toESM(js_src_util_time_selection_js);
	//#region js/src/time-picker.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO time-picker.js
	* License (https://coreui.io/pro/license/)
	*
	* Composed from a TimeInput section field, the TimeSelection popup body and the
	* Popup primitive.
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "time-picker";
	const EVENT_KEY = `.coreui.time-picker`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}.data-api`;
	const EVENT_TIME_CHANGE = `timeChange${EVENT_KEY}`;
	const CLASS_NAME_BODY = "time-picker-body";
	const CLASS_NAME_DROPDOWN = "time-picker-popup";
	const CLASS_NAME_FOOTER = "time-picker-footer";
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_INDICATOR = "form-control-action";
	const CLASS_NAME_INPUT_GROUP = "form-control-group";
	const CLASS_NAME_PICKER = "picker";
	const CLASS_NAME_POPUP = "popup";
	const CLASS_NAME_TIME_PICKER = "time-picker";
	const SELECTOR_ACTION_NOW = "[data-coreui-picker-action=\"now\"]";
	const SELECTOR_DATA_TIME_PICKER = "[data-coreui-time-picker]";
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaCleanerLabel: "Clear time",
		ariaPickerLabel: "Toggle time selection",
		cleaner: true,
		cleanerIcon: js_src_util_icons_js.CLEANER_ICON,
		container: false,
		disabled: false,
		floatingLabel: null,
		inputOptions: {},
		locale: navigator.language,
		name: null,
		pickerIcon: true,
		sanitize: true,
		sanitizeFn: null,
		seconds: true,
		selectionOptions: {},
		size: null,
		time: null,
		variant: "roll"
	};
	const DefaultType = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		cleaner: "boolean",
		cleanerIcon: "string",
		container: "(string|element|boolean)",
		disabled: "boolean",
		floatingLabel: "(string|null)",
		inputOptions: "object",
		locale: "string",
		name: "(string|null)",
		pickerIcon: "(string|boolean)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		seconds: "(array|boolean|function)",
		selectionOptions: "object",
		size: "(string|null)",
		time: "(date|string|null)",
		variant: "string"
	};
	/**
	* Class definition
	*/
	var TimePicker = class TimePicker extends js_src_picker_base_js.default {
		constructor(element, config) {
			super(element, config);
			this._initialTime = config?.time ?? this._config.time;
			this._input = null;
			this._selection = null;
			this._syncingFromPanel = false;
			this._selectionElement = null;
			this._hostClasses = (0, js_src_util_form_control_group_js.captureHostClasses)(this._element, this._managedClassNames());
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
			return this._input.getDate();
		}
		setTime(time) {
			this._input.setConfig({ date: time });
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_TIME_CHANGE, { time });
		}
		now() {
			this.setTime(/* @__PURE__ */ new Date());
		}
		clear() {
			this._input.clear();
		}
		reset() {
			this.setTime(this._initialTime);
		}
		getContext() {
			return {
				...this._baseContext(),
				isTimeSelectable: (time) => this._input.isDateSelectable(time),
				now: () => this.now(),
				setTime: (time) => this.setTime(time),
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
		_managedClassNames() {
			return [
				CLASS_NAME_TIME_PICKER,
				CLASS_NAME_PICKER,
				CLASS_NAME_INPUT_GROUP,
				...(0, js_src_util_form_control_group_js.managedSizeClassNames)(this._config.size)
			].filter(Boolean);
		}
		_createTimePicker() {
			this._element.classList.add(CLASS_NAME_TIME_PICKER, CLASS_NAME_PICKER);
			const inputGroup = this._element;
			(0, js_src_util_form_control_group_js.applyControlGroupClasses)(inputGroup, CLASS_NAME_INPUT_GROUP);
			(0, js_src_util_form_control_group_js.applyControlGroupSize)(inputGroup, this._config.size);
			const inputEl = document.createElement("div");
			this._fieldElement = (0, js_src_util_form_control_group_js.appendControlGroupField)(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`);
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
				const indicator = action(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? js_src_util_icons_js.CLOCK_ICON : this._config.pickerIcon, this._config.ariaPickerLabel);
				inputGroup.append(indicator);
				this._toggleElement = indicator;
			}
			this._input = new js_src_time_input_js.default(inputEl, this._forwardConfig(js_src_time_input_js.default, {
				date: this._config.time,
				disabled: this._config.disabled,
				locale: this._config.locale,
				name: this._config.name,
				seconds: Boolean(this._config.seconds)
			}, {
				...this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {},
				...this._config.inputOptions
			}));
			js_src_dom_event_handler_js.default.on(inputEl, js_src_time_input_js.default.eventName(js_src_time_input_js.default.CHANGE_EVENT_NAME), (event) => {
				if (!this._syncingFromPanel) {
					this._selection?.setConfig({ time: event.date });
					js_src_dom_event_handler_js.default.trigger(this._element, EVENT_TIME_CHANGE, { time: event.date });
				}
			});
			this._menu = document.createElement("div");
			this._menu.id = (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}-popup-`);
			this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN);
			this._writeToggleAttribute("aria-expanded", "false");
			this._writeToggleAttribute("aria-haspopup", "dialog");
			this._selectionElement = document.createElement("div");
			this._selectionElement.classList.add(CLASS_NAME_BODY);
			this._menu.append(this._selectionElement);
			if (this._footerTemplate) {
				const footer = document.createElement("div");
				footer.classList.add(CLASS_NAME_FOOTER);
				footer.append(this._footerTemplate.content.cloneNode(true));
				this._disableUnselectableActions(SELECTOR_ACTION_NOW, footer);
				this._menu.append(footer);
			}
		}
		_isNowSelectable() {
			return this._input.isDateSelectable(/* @__PURE__ */ new Date());
		}
		_ensureSelection() {
			if (this._selection) return;
			this._selection = new js_src_util_time_selection_js.default(this._selectionElement, this._forwardConfig(js_src_util_time_selection_js.default, {
				locale: this._config.locale,
				onChange: (time) => {
					this._syncingFromPanel = true;
					this._input.setConfig({ date: time });
					this._syncingFromPanel = false;
					js_src_dom_event_handler_js.default.trigger(this._element, EVENT_TIME_CHANGE, { time });
				},
				time: this.getTime(),
				variant: this._config.variant
			}, this._config.selectionOptions));
		}
		_onPopupShow() {
			this._ensureSelection();
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, TimePicker, config, args);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_TIME_PICKER)) TimePicker.getOrCreateInstance(element);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(TimePicker);
	//#endregion
	return TimePicker;
});

//# sourceMappingURL=time-picker.js.map