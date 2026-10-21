/*!
* CoreUI PRO range-slider.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/field-validation.js"), require("./util/focus.js"), require("./util/form-validation.js"), require("./util/index.js"), require("./util/range.js"), require("./util/sanitizer.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/field-validation.js",
		"./util/focus.js",
		"./util/form-validation.js",
		"./util/index.js",
		"./util/range.js",
		"./util/sanitizer.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.RangeSlider = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.FieldValidation, global.Focus, global.FormValidation, global.Index, global.RangeUtil, global.Sanitizer));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_field_validation_js, js_src_util_focus_js, js_src_util_form_validation_js, js_src_util_index_js, js_src_util_range_js, js_src_util_sanitizer_js) {
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
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	js_src_util_field_validation_js = __toESM(js_src_util_field_validation_js);
	//#region js/src/range-slider.ts
	const NAME = "range-slider";
	const EVENT_KEY = `.coreui.range-slider`;
	const DATA_API_KEY = ".data-api";
	const EVENT_CHANGE = `change${EVENT_KEY}`;
	const EVENT_INPUT = `input${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const EVENT_POINTERCANCEL = `pointercancel${EVENT_KEY}`;
	const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY}`;
	const EVENT_POINTERMOVE = `pointermove${EVENT_KEY}`;
	const EVENT_POINTERUP = `pointerup${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const ATTRIBUTE_INVALID_FEEDBACK = "data-coreui-invalid-feedback";
	const HOST_ATTRIBUTES = [
		"aria-label",
		"aria-labelledby",
		ATTRIBUTE_INVALID_FEEDBACK
	];
	const CLASS_NAME_FORM_RANGE = "form-range";
	const CLASS_NAME_FORM_RANGE_INPUT = "form-range-input";
	const CLASS_NAME_FORM_RANGE_VERTICAL = "form-range-vertical";
	const CLASS_NAME_TICKS_CLICKABLE = "form-range-ticks-clickable";
	const CLASS_NAME_TOOLTIP_END = "bs-tooltip-end";
	const CLASS_NAME_TOOLTIP_START = "bs-tooltip-start";
	const CLASS_NAME_TOOLTIP_TOP = "bs-tooltip-top";
	const PROPERTY_FILL = "--cui-range-fill";
	const PROPERTY_FILL_START = "--cui-range-fill-start";
	const SELECTOR_DATA_RANGE_SLIDER = "[data-coreui-range-slider]";
	const SELECTOR_INPUT = ".form-range-input";
	const SELECTOR_TICK = ".form-range-tick";
	const Default = {
		allowList: js_src_util_sanitizer_js.DefaultAllowlist,
		ariaLabel: null,
		clickableTicks: true,
		disabled: false,
		distance: 0,
		list: null,
		max: 100,
		min: 0,
		name: null,
		sanitize: true,
		sanitizeFn: null,
		step: 1,
		ticks: false,
		tooltipClass: "",
		tooltips: true,
		tooltipsFormat: null,
		track: "fill",
		validationState: null,
		value: 0,
		vertical: false
	};
	const DefaultType = {
		allowList: "object",
		ariaLabel: "(array|function|string|null)",
		clickableTicks: "boolean",
		disabled: "boolean",
		distance: "number",
		list: "(string|null)",
		max: "number",
		min: "number",
		name: "(array|string|null)",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		step: "(number|string)",
		ticks: "(array|boolean|string)",
		tooltipClass: "string",
		tooltips: "(boolean|string)",
		tooltipsFormat: "(function|null)",
		track: "(boolean|string)",
		validationState: "(string|null|undefined)",
		value: "(array|number)",
		vertical: "boolean"
	};
	var RangeSlider = class RangeSlider extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			if (!this._element) return;
			this._disabled = this._config.disabled;
			this._inputs = [];
			this._press = null;
			this._shownValues = [];
			this._startValues = [...this._config.value];
			this._tickPoints = [];
			this._ticks = null;
			this._tooltips = [];
			this._validation = new js_src_util_field_validation_js.default(this._element, {
				blockers: () => this._inputs.slice(0, 1),
				canBlock: () => !this._disabled,
				config: () => this._config,
				fields: () => this._inputs,
				frames: () => [this._element, ...this._inputs],
				invalidTargets: () => this._inputs,
				pageDescribed: () => this._inputs,
				restore: () => this._restoreValue()
			});
			this._wrapper = null;
			this._hostAttributes = /* @__PURE__ */ new Map();
			this._readHostAttributes();
			this._element.setAttribute("role", "group");
			this._onInput = (event) => {
				const input = event.target;
				if (this._inputs.includes(input)) {
					this._constrain(input);
					if (input.value !== this._shownValues[this._inputs.indexOf(input)]) this._validation.dismiss();
					this._update();
					js_src_dom_event_handler_js.default.trigger(this._element, EVENT_INPUT, { value: this._values() });
				}
			};
			this._onChange = (event) => {
				if (this._inputs.includes(event.target)) {
					this._update();
					js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: this._values() });
				}
			};
			this._onKeydown = (event) => this._keydown(event);
			this._onPointerDown = (event) => this._pointerDown(event);
			this._onPointerMove = (event) => this._pointerMove(event);
			this._onPointerUp = (event) => this._pointerUp(event);
			this._build(this._config.value);
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
		disable() {
			this._setDisabled(true);
		}
		enable() {
			this._setDisabled(false);
		}
		setValidationState(validationState) {
			this._config = this._getConfig({
				...this._config,
				validationState
			});
			this._validation.configure({ validationState });
		}
		setValue(value) {
			const values = this._normalizeValue(value);
			this._typeCheckConfig({ value: values }, { value: DefaultType.value });
			if (values.length !== this._inputs.length) {
				const focused = this._inputs.findIndex((input) => (0, js_src_util_focus_js.containsFocus)(input));
				this._startValues = values.map((value, index) => this._startValues[index] ?? value);
				this._teardown();
				this._build(values);
				this._inputs[Math.min(focused, this._inputs.length - 1)]?.focus();
				return;
			}
			for (const [index, input] of this._inputs.entries()) input.value = `${values[index]}`;
			if (this._press) this._press.start = this._press.input.value;
			this._update();
		}
		dispose() {
			if (!this._element) return;
			this._validation.dispose();
			this._teardown();
			super.dispose();
		}
		_setDisabled(disabled) {
			if (disabled === this._disabled) return;
			this._disabled = disabled;
			if (disabled) this._releasePress();
			for (const input of this._inputs) input.disabled = disabled;
			this._updateClickableTicks();
			this._validation.update();
		}
		_build(values) {
			const { tooltipClass, tooltips, vertical } = this._config;
			this._wrapper = document.createElement("div");
			this._wrapper.className = CLASS_NAME_FORM_RANGE;
			this._wrapper.classList.toggle(CLASS_NAME_FORM_RANGE_VERTICAL, vertical);
			this._inputs = values.map((value, index) => this._createInput(index, value));
			for (const [index, input] of this._inputs.entries()) this._nameInput(input, index);
			this._wrapper.append(...this._inputs);
			this._element.append(this._wrapper);
			if (tooltips) {
				const placement = vertical ? (0, js_src_util_index_js.isRTL)(this._wrapper) ? CLASS_NAME_TOOLTIP_END : CLASS_NAME_TOOLTIP_START : CLASS_NAME_TOOLTIP_TOP;
				for (const input of this._inputs) {
					const tooltip = (0, js_src_util_range_js.createTooltip)(placement, tooltipClass, tooltips === "always");
					input.after(tooltip);
					this._tooltips.push(tooltip);
				}
			}
			this._tickPoints = this._inputs.length > 0 ? (0, js_src_util_range_js.getTickPoints)(this._inputs[0], this._config.ticks, this._config.list) : [];
			if (this._tickPoints.length > 0) {
				this._ticks = (0, js_src_util_range_js.createTicks)(this._tickPoints, vertical);
				this._updateClickableTicks();
				this._wrapper.append(this._ticks);
			}
			this._addEventListeners();
			this._update();
			this._validation.refresh();
		}
		_teardown() {
			this._releasePress();
			if (this._wrapper) {
				js_src_dom_event_handler_js.default.off(this._wrapper, EVENT_INPUT, SELECTOR_INPUT, this._onInput);
				js_src_dom_event_handler_js.default.off(this._wrapper, EVENT_CHANGE, SELECTOR_INPUT, this._onChange);
				js_src_dom_event_handler_js.default.off(this._wrapper, EVENT_KEYDOWN, SELECTOR_INPUT, this._onKeydown);
				js_src_dom_event_handler_js.default.off(this._wrapper, EVENT_POINTERDOWN, this._onPointerDown);
			}
			this._wrapper?.remove();
			this._inputs = [];
			this._tickPoints = [];
			this._ticks = null;
			this._tooltips = [];
			this._wrapper = null;
		}
		_addEventListeners() {
			const wrapper = this._wrapper;
			js_src_dom_event_handler_js.default.on(wrapper, EVENT_INPUT, SELECTOR_INPUT, this._onInput);
			js_src_dom_event_handler_js.default.on(wrapper, EVENT_CHANGE, SELECTOR_INPUT, this._onChange);
			js_src_dom_event_handler_js.default.on(wrapper, EVENT_KEYDOWN, SELECTOR_INPUT, this._onKeydown);
			js_src_dom_event_handler_js.default.on(wrapper, EVENT_POINTERDOWN, this._onPointerDown);
		}
		_createInput(index, value) {
			const { max, min, step, vertical } = this._config;
			const input = document.createElement("input");
			input.type = "range";
			input.className = CLASS_NAME_FORM_RANGE_INPUT;
			input.min = `${min}`;
			input.max = `${max}`;
			input.step = `${step}`;
			input.defaultValue = `${this._startValues[index] ?? value}`;
			input.value = `${value}`;
			input.disabled = this._disabled;
			const name = Array.isArray(this._config.name) ? this._config.name[index] : this._config.name && `${this._config.name}-${index}`;
			if (name !== void 0 && name !== null && name !== "") input.name = String(name);
			if (vertical) input.setAttribute("aria-orientation", "vertical");
			const invalidFeedback = this._hostAttributes.get(ATTRIBUTE_INVALID_FEEDBACK);
			if (invalidFeedback) input.setAttribute(ATTRIBUTE_INVALID_FEEDBACK, invalidFeedback);
			return input;
		}
		_readHostAttributes() {
			for (const name of HOST_ATTRIBUTES) {
				const value = this._element.getAttribute(name);
				if (value !== null) this._hostAttributes.set(name, value);
			}
		}
		_nameInput(input, index) {
			const handleLabel = this._ariaLabel(index);
			const label = this._hostAttributes.get("aria-label");
			const labelledBy = this._hostAttributes.get("aria-labelledby");
			if (this._inputs.length > 1) {
				if (handleLabel) input.setAttribute("aria-label", handleLabel);
				return;
			}
			if (labelledBy && handleLabel) {
				input.id = (0, js_src_util_index_js.getUID)(`${NAME}-handle-`);
				input.setAttribute("aria-labelledby", `${labelledBy} ${input.id}`);
				input.setAttribute("aria-label", handleLabel);
				return;
			}
			const name = [label, handleLabel].filter(Boolean).join(" ");
			if (name) input.setAttribute("aria-label", name);
			if (labelledBy) input.setAttribute("aria-labelledby", labelledBy);
		}
		_ariaLabel(index) {
			const total = this._inputs.length;
			const { ariaLabel } = this._config;
			const given = typeof ariaLabel === "function" ? ariaLabel(index, total) : ariaLabel?.[index];
			if (given) return given;
			if (total === 1) return null;
			if (total === 2) return index === 0 ? "Minimum value" : "Maximum value";
			return `Value ${index + 1}`;
		}
		_updateClickableTicks() {
			this._ticks?.classList.toggle(CLASS_NAME_TICKS_CLICKABLE, this._config.clickableTicks && this._inputs.some((input) => !input.matches(":disabled")));
		}
		_values() {
			return this._inputs.map((input) => Number(input.value));
		}
		_restoreValue() {
			const isChanged = this._inputs.some((input, index) => input.value !== this._shownValues[index]);
			this._update();
			if (isChanged) js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: this._values() });
		}
		_update() {
			const ratios = this._inputs.map((input) => (0, js_src_util_range_js.getRatio)(input));
			this._shownValues = this._inputs.map((input) => input.value);
			if (this._config.track && this._inputs.length > 0) {
				if (this._inputs.length > 1) this._wrapper.style.setProperty(PROPERTY_FILL_START, `${Math.min(...ratios)}`);
				this._wrapper.style.setProperty(PROPERTY_FILL, `${Math.max(...ratios)}`);
			}
			for (const [index, input] of this._inputs.entries()) {
				const value = Number.parseFloat(input.value);
				const tooltip = this._tooltips[index];
				const html = (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._format(value), this._config);
				if (tooltip) {
					tooltip.style.setProperty(PROPERTY_FILL, `${ratios[index]}`);
					tooltip.lastElementChild.innerHTML = html;
				}
				const label = (0, js_src_util_range_js.getTickLabel)(this._tickPoints, value, (0, js_src_util_range_js.getStep)(input));
				const text = (0, js_src_util_range_js.getValueText)(value, label, typeof this._config.tooltipsFormat === "function" ? html : null);
				if (text === null) input.removeAttribute("aria-valuetext");
				else input.setAttribute("aria-valuetext", text);
				if (this._inputs.length > 1) input.style.zIndex = `${(0, js_src_util_range_js.getStackOrder)(ratios[index], index, this._inputs.length)}`;
			}
		}
		_format(value) {
			return typeof this._config.tooltipsFormat === "function" ? this._config.tooltipsFormat(value) : String(value);
		}
		_constrain(input) {
			const index = this._inputs.indexOf(input);
			(0, js_src_util_range_js.constrainInput)(input, this._inputs[index - 1], this._inputs[index + 1], this._config.distance);
		}
		_setValue(input, value) {
			const before = input.value;
			(0, js_src_util_range_js.setInputValue)(input, value);
			this._constrain(input);
			if (input.value !== before) input.dispatchEvent(new Event("input", { bubbles: true }));
		}
		_keydown(event) {
			const input = event.target;
			if (!this._config.vertical || this._disabled || !this._inputs.includes(input) || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
			event.preventDefault();
			const start = input.value;
			const step = (0, js_src_util_range_js.getStep)(input);
			this._setValue(input, Number.parseFloat(input.value) + (event.key === "ArrowRight" ? step : -step));
			if (input.value !== start) input.dispatchEvent(new Event("change", { bubbles: true }));
		}
		_pointerDown(event) {
			if (event.button !== 0 || this._press || this._inputs.length === 0) return;
			const rect = this._inputs[0].getBoundingClientRect();
			const tick = event.target.closest?.(SELECTOR_TICK);
			if (tick && this._ticks?.contains(tick)) {
				if (this._ticks.classList.contains(CLASS_NAME_TICKS_CLICKABLE)) {
					const value = Number(tick.getAttribute("data-coreui-value"));
					const { max, min } = this._config;
					this._startPress(event, rect, (value - min) / (max - min || 1), value);
				}
				return;
			}
			const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
			if (event.target !== this._wrapper || this._inputs.length < 2 || !inside) return;
			this._startPress(event, rect);
		}
		_startPress(event, rect, ratio, value) {
			const thumb = (0, js_src_util_range_js.getThumbSize)(this._wrapper);
			const at = ratio ?? (0, js_src_util_range_js.getRatioAt)(event, rect, thumb, this._config.vertical, (0, js_src_util_index_js.isRTL)(this._wrapper));
			const input = (0, js_src_util_range_js.getNearestInput)(this._inputs, at);
			if (!input) return;
			event.preventDefault();
			this._press = {
				input,
				pointerId: event.pointerId,
				rect,
				start: input.value,
				thumb
			};
			js_src_dom_event_handler_js.default.on(document, EVENT_POINTERMOVE, this._onPointerMove);
			js_src_dom_event_handler_js.default.on(document, EVENT_POINTERUP, this._onPointerUp);
			js_src_dom_event_handler_js.default.on(document, EVENT_POINTERCANCEL, this._onPointerUp);
			input.focus({ preventScroll: true });
			this._setValue(input, value ?? this._config.min + at * (this._config.max - this._config.min));
		}
		_pointerMove(event) {
			if (!this._press || event.pointerId !== this._press.pointerId) return;
			const { input, rect, thumb } = this._press;
			const ratio = (0, js_src_util_range_js.getRatioAt)(event, rect, thumb, this._config.vertical, (0, js_src_util_index_js.isRTL)(this._wrapper));
			this._setValue(input, this._config.min + ratio * (this._config.max - this._config.min));
		}
		_pointerUp(event) {
			if (!this._press || event.pointerId !== this._press.pointerId) return;
			const { input, start } = this._press;
			this._releasePress();
			if (input.value !== start) input.dispatchEvent(new Event("change", { bubbles: true }));
		}
		_releasePress() {
			this._press = null;
			js_src_dom_event_handler_js.default.off(document, EVENT_POINTERMOVE, this._onPointerMove);
			js_src_dom_event_handler_js.default.off(document, EVENT_POINTERUP, this._onPointerUp);
			js_src_dom_event_handler_js.default.off(document, EVENT_POINTERCANCEL, this._onPointerUp);
		}
		_configAfterMerge(config) {
			if (config.tooltips === null) config.tooltips = true;
			if (typeof config.ticks === "number") config.ticks = String(config.ticks);
			if (typeof config.ticks === "string") config.ticks = config.ticks.split(/,\s*/);
			if (typeof config.ariaLabel === "string") config.ariaLabel = config.ariaLabel.split(/,\s*/);
			if (typeof config.name === "string" && config.name.includes(",")) config.name = config.name.split(/,\s*/);
			config.value = this._normalizeValue(config.value);
			return config;
		}
		_normalizeValue(value) {
			if (typeof value === "number") return [value];
			if (typeof value === "string") return value.split(/,\s*/).map(Number);
			return Array.isArray(value) ? [...value] : value;
		}
		static rangeSliderInterface(element, config, ...args) {
			const data = RangeSlider.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, RangeSlider, config, args);
		}
	};
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_RANGE_SLIDER)) RangeSlider.rangeSliderInterface(element);
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(RangeSlider);
	//#endregion
	return RangeSlider;
});

//# sourceMappingURL=range-slider.js.map