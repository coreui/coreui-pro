/*!
* CoreUI PRO range-slider.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./dom/selector-engine.js"), require("./util/index.js"), require("./util/sanitizer.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./dom/selector-engine.js",
		"./util/index.js",
		"./util/sanitizer.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.RangeSlider = factory(global.BaseComponent, global.EventHandler, global.Manipulator, global.SelectorEngine, global.Index, global.Sanitizer));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_dom_selector_engine_js, js_src_util_index_js, js_src_util_sanitizer_js) {
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
	//#region js/src/range-slider.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO range-slider.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "range-slider";
	const EVENT_KEY = `.coreui.range-slider`;
	const DATA_API_KEY = ".data-api";
	const EVENT_CHANGE = `change${EVENT_KEY}`;
	const EVENT_INPUT = `input${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_MOUSEDOWN = `mousedown${EVENT_KEY}`;
	const EVENT_MOUSEMOVE = `mousemove${EVENT_KEY}`;
	const EVENT_MOUSEUP = `mouseup${EVENT_KEY}`;
	const CLASS_NAME_CLICKABLE = "clickable";
	const CLASS_NAME_DISABLED = "disabled";
	const CLASS_NAME_RANGE_SLIDER = "range-slider";
	const CLASS_NAME_RANGE_SLIDER_INPUT = "range-slider-input";
	const CLASS_NAME_RANGE_SLIDER_INPUTS_CONTAINER = "range-slider-inputs-container";
	const CLASS_NAME_RANGE_SLIDER_TICK = "range-slider-tick";
	const CLASS_NAME_RANGE_SLIDER_TICKS = "range-slider-ticks";
	const CLASS_NAME_RANGE_SLIDER_TOOLTIP = "range-slider-tooltip";
	const CLASS_NAME_TOOLTIP = "tooltip";
	const CLASS_NAME_TOOLTIP_ARROW = "tooltip-arrow";
	const CLASS_NAME_TOOLTIP_INNER = "tooltip-inner";
	const CLASS_NAME_TOOLTIP_START = "bs-tooltip-start";
	const CLASS_NAME_TOOLTIP_TOP = "bs-tooltip-top";
	const CLASS_NAME_RANGE_SLIDER_TRACK = "range-slider-track";
	const CLASS_NAME_RANGE_SLIDER_VERTICAL = "range-slider-vertical";
	const CLASS_NAME_SHOW = "show";
	const SELECTOR_DATA_RANGE_SLIDER = "[data-coreui-range-slider]";
	const SELECTOR_RANGE_SLIDER_INPUT = ".range-slider-input";
	const SELECTOR_RANGE_SLIDER_INPUTS_CONTAINER = ".range-slider-inputs-container";
	const SELECTOR_RANGE_SLIDER_TICK = ".range-slider-tick";
	const Default = {
		allowList: js_src_util_sanitizer_js.DefaultAllowlist,
		ariaLabels: null,
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
		value: 0,
		vertical: false
	};
	const DefaultType = {
		allowList: "object",
		ariaLabels: "(array|null)",
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
		value: "(array|number)",
		vertical: "boolean"
	};
	/**
	* Class definition
	*/
	var RangeSlider = class RangeSlider extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._currentValue = this._config.value;
			this._dragIndex = 0;
			this._inputs = [];
			this._isDragging = false;
			this._sliderTrack = null;
			this._tooltips = [];
			this._onDocumentMouseMove = (event) => {
				if (!this._isDragging) return;
				this._updateValue(this._calculateMoveValue(event), this._dragIndex);
			};
			this._onDocumentMouseUp = () => {
				this._isDragging = false;
			};
			this._initializeRangeSlider();
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
			this._currentValue = this._config.value;
			this._element.innerHTML = "";
			this._initializeRangeSlider();
		}
		dispose() {
			js_src_dom_event_handler_js.default.off(document.documentElement, EVENT_MOUSEMOVE, this._onDocumentMouseMove);
			js_src_dom_event_handler_js.default.off(document.documentElement, EVENT_MOUSEUP, this._onDocumentMouseUp);
			super.dispose();
		}
		_addEventListeners() {
			if (this._config.disabled) return;
			js_src_dom_event_handler_js.default.on(this._element, EVENT_INPUT, SELECTOR_RANGE_SLIDER_INPUT, (event) => {
				const { target } = event;
				this._isDragging = false;
				const children = js_src_dom_selector_engine_js.default.children(target.parentElement, SELECTOR_RANGE_SLIDER_INPUT);
				const index = Array.from(children).indexOf(target);
				this._updateValue(target.value, index);
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_INPUT, { value: [...this._currentValue] });
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CHANGE, SELECTOR_RANGE_SLIDER_INPUT, () => {
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: [...this._currentValue] });
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSEDOWN, SELECTOR_RANGE_SLIDER_TICK, (event) => {
				if (!this._config.clickableTicks || event.button !== 0) return;
				const value = js_src_dom_manipulator_js.default.getDataAttribute(event.target, "value");
				this._updateNearestValue(value);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSEDOWN, SELECTOR_RANGE_SLIDER_INPUTS_CONTAINER, (event) => {
				if (event.button !== 0) return;
				if (!(event.target instanceof HTMLInputElement) && !event.target.className.includes(CLASS_NAME_RANGE_SLIDER_TRACK)) return;
				this._isDragging = true;
				const clickValue = this._calculateClickValue(event);
				this._dragIndex = this._getNearestValueIndex(clickValue);
				this._updateNearestValue(clickValue);
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: [...this._currentValue] });
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_INPUT, { value: [...this._currentValue] });
			});
			js_src_dom_event_handler_js.default.on(document.documentElement, EVENT_MOUSEUP, this._onDocumentMouseUp);
			js_src_dom_event_handler_js.default.on(document.documentElement, EVENT_MOUSEMOVE, this._onDocumentMouseMove);
		}
		_initializeRangeSlider() {
			this._element.classList.add(CLASS_NAME_RANGE_SLIDER);
			if (this._config.vertical) this._element.classList.add(CLASS_NAME_RANGE_SLIDER_VERTICAL);
			if (this._config.disabled) this._element.classList.add(CLASS_NAME_DISABLED);
			this._sliderTrack = this._createSliderTrack();
			this._createInputs();
			this._createTicks();
			this._createTooltips();
			this._updateGradient();
			this._addEventListeners();
		}
		_createSliderTrack() {
			return this._createElement("div", CLASS_NAME_RANGE_SLIDER_TRACK);
		}
		_createInputs() {
			const container = this._createElement("div", CLASS_NAME_RANGE_SLIDER_INPUTS_CONTAINER);
			for (const [index, value] of this._currentValue.entries()) {
				const inputElement = this._createInput(index, value);
				container.append(inputElement);
				this._inputs[index] = inputElement;
			}
			container.append(this._sliderTrack);
			this._element.append(container);
		}
		_createInput(index, value) {
			const inputElement = this._createElement("input", CLASS_NAME_RANGE_SLIDER_INPUT);
			inputElement.type = "range";
			inputElement.min = this._config.min;
			inputElement.max = this._config.max;
			inputElement.step = this._config.step;
			inputElement.value = value;
			const name = Array.isArray(this._config.name) ? this._config.name[index] : this._config.name && `${this._config.name}-${index}`;
			if (name !== void 0 && name !== null && name !== "" && name !== false) inputElement.name = String(name);
			inputElement.disabled = this._config.disabled;
			inputElement.setAttribute("role", "slider");
			inputElement.setAttribute("aria-valuemin", this._config.min);
			inputElement.setAttribute("aria-valuemax", this._config.max);
			inputElement.setAttribute("aria-valuenow", value);
			inputElement.setAttribute("aria-orientation", this._config.vertical ? "vertical" : "horizontal");
			const ariaLabel = this._getAriaLabel(index);
			if (ariaLabel !== null) inputElement.setAttribute("aria-label", ariaLabel);
			const valueText = this._getValueText(value);
			if (valueText !== null) inputElement.setAttribute("aria-valuetext", valueText);
			return inputElement;
		}
		_getAriaLabel(index) {
			if (Array.isArray(this._config.ariaLabels) && this._config.ariaLabels[index]) return this._config.ariaLabels[index];
			if (this._currentValue.length === 1) return null;
			if (this._currentValue.length === 2) return index === 0 ? "Minimum value" : "Maximum value";
			return `Value ${index + 1}`;
		}
		_getValueText(value) {
			return typeof this._config.tooltipsFormat === "function" ? `${this._config.tooltipsFormat(value)}` : null;
		}
		_createTicks() {
			const points = this._tickPoints();
			if (points.length === 0) return;
			const { clickableTicks, disabled, vertical } = this._config;
			const ticksContainer = this._createElement("div", CLASS_NAME_RANGE_SLIDER_TICKS);
			const stops = [
				0,
				...points.map((point) => point.ratio),
				1
			];
			const tracks = stops.slice(1).map((stop, index) => `${stop - stops[index]}fr`);
			if (vertical) ticksContainer.style.gridTemplateRows = tracks.toReversed().join(" ");
			else ticksContainer.style.gridTemplateColumns = tracks.join(" ");
			for (const [index, point] of points.entries()) {
				const tickElement = this._createElement("div", CLASS_NAME_RANGE_SLIDER_TICK);
				if (clickableTicks && !disabled) tickElement.classList.add(CLASS_NAME_CLICKABLE);
				if (point.class) tickElement.classList.add(...Array.isArray(point.class) ? point.class : [point.class]);
				if (point.style && typeof point.style === "object") Object.assign(tickElement.style, point.style);
				js_src_dom_manipulator_js.default.setDataAttribute(tickElement, "value", point.value);
				tickElement.textContent = point.label;
				if (vertical) tickElement.style.gridRowStart = `${points.length - index + 1}`;
				else tickElement.style.gridColumnStart = `${index + 2}`;
				ticksContainer.append(tickElement);
			}
			this._element.append(ticksContainer);
		}
		_tickPoints() {
			const { list, min, max, ticks } = this._config;
			const span = max - min || 1;
			const ratio = (value) => Math.min(Math.max((value - min) / span, 0), 1);
			const points = [];
			if (Array.isArray(ticks) && ticks.length > 0) for (const [index, tick] of ticks.entries()) {
				const value = typeof tick === "number" ? tick : typeof tick === "object" && tick.value !== void 0 ? tick.value : min + (ticks.length === 1 ? 0 : index / (ticks.length - 1) * span);
				points.push({
					class: typeof tick === "object" ? tick.class : void 0,
					label: typeof tick === "number" ? "" : typeof tick === "object" ? tick.label ?? "" : tick,
					ratio: ratio(value),
					style: typeof tick === "object" ? tick.style : void 0,
					value
				});
			}
			const datalist = list ? document.getElementById(list) : null;
			if (datalist) for (const option of js_src_dom_selector_engine_js.default.find("option", datalist)) {
				const value = Number.parseFloat(option.value);
				if (!Number.isNaN(value)) points.push({
					label: option.label,
					ratio: ratio(value),
					value
				});
			}
			return points.toSorted((a, b) => a.ratio - b.ratio);
		}
		_createTooltips() {
			if (!this._config.tooltips) return;
			const inputs = js_src_dom_selector_engine_js.default.find(SELECTOR_RANGE_SLIDER_INPUT, this._element);
			for (const input of inputs) {
				const tooltipElement = this._createElement("output", CLASS_NAME_RANGE_SLIDER_TOOLTIP);
				tooltipElement.classList.add(CLASS_NAME_TOOLTIP, this._config.vertical ? CLASS_NAME_TOOLTIP_START : CLASS_NAME_TOOLTIP_TOP);
				tooltipElement.classList.toggle(CLASS_NAME_SHOW, this._config.tooltips === "always");
				if (this._config.tooltipClass) tooltipElement.classList.add(...this._config.tooltipClass.split(" ").filter(Boolean));
				tooltipElement.setAttribute("aria-hidden", "true");
				const tooltipArrowElement = this._createElement("span", CLASS_NAME_TOOLTIP_ARROW);
				const tooltipInnerElement = this._createElement("span", CLASS_NAME_TOOLTIP_INNER);
				tooltipInnerElement.innerHTML = this._config.tooltipsFormat ? (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.tooltipsFormat(input.value), this._config) : input.value;
				tooltipElement.append(tooltipArrowElement, tooltipInnerElement);
				input.parentNode.insertBefore(tooltipElement, input.nextSibling);
				this._positionTooltip(tooltipElement, input);
				this._tooltips.push(tooltipElement);
			}
		}
		_positionTooltip(tooltip, input) {
			const percent = (Number(input.value) - this._config.min) / (this._config.max - this._config.min);
			tooltip.style.setProperty("--cui-range-slider-tooltip-position", `${percent}`);
		}
		_updateTooltip(index, value) {
			if (!this._config.tooltips) return;
			if (this._tooltips[index]) {
				this._tooltips[index].children[1].innerHTML = this._config.tooltipsFormat ? (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.tooltipsFormat(value), this._config) : String(value);
				const input = js_src_dom_selector_engine_js.default.find(SELECTOR_RANGE_SLIDER_INPUT, this._element)[index];
				this._positionTooltip(this._tooltips[index], input);
			}
		}
		_calculateClickValue(event) {
			const clickPosition = this._getClickPosition(event);
			const value = this._config.min + clickPosition * (this._config.max - this._config.min);
			return this._roundToStep(value, this._config.step);
		}
		_calculateMoveValue(event) {
			const trackRect = this._sliderTrack.getBoundingClientRect();
			const position = this._config.vertical ? this._calculateVerticalPosition(event.clientY, trackRect) : this._calculateHorizontalPosition(event.clientX, trackRect);
			if (typeof position === "string") return this._roundToStep(position === "max" ? this._config.max : this._config.min, this._config.step);
			const value = this._config.min + position * (this._config.max - this._config.min);
			return this._roundToStep(value, this._config.step);
		}
		_calculateVerticalPosition(mouseY, rect) {
			if (mouseY < rect.top) return "max";
			if (mouseY > rect.bottom) return "min";
			return Math.min(Math.max((rect.bottom - mouseY) / rect.height, 0), 1);
		}
		_calculateHorizontalPosition(mouseX, rect) {
			const rtl = (0, js_src_util_index_js.isRTL)(this._element);
			if (mouseX < rect.left) return rtl ? "max" : "min";
			if (mouseX > rect.right) return rtl ? "min" : "max";
			const relativeX = rtl ? rect.right - mouseX : mouseX - rect.left;
			return Math.min(Math.max(relativeX / rect.width, 0), 1);
		}
		_createElement(tag, className) {
			const element = document.createElement(tag);
			element.classList.add(className);
			return element;
		}
		_getClickPosition(event) {
			const { offsetX, offsetY } = event;
			const { offsetWidth, offsetHeight } = this._sliderTrack;
			if (this._config.vertical) return 1 - offsetY / offsetHeight;
			return (0, js_src_util_index_js.isRTL)(this._element) ? 1 - offsetX / offsetWidth : offsetX / offsetWidth;
		}
		_getNearestValueIndex(value) {
			const values = this._currentValue;
			const valuesLength = values.length;
			if (value < values[0]) return 0;
			if (value > values[valuesLength - 1]) return valuesLength - 1;
			const distances = values.map((v) => Math.abs(v - value));
			const min = Math.min(...distances);
			const firstIndex = distances.indexOf(min);
			return value < values[firstIndex] ? firstIndex : distances.lastIndexOf(min);
		}
		_updateGradient() {
			if (!this._config.track) return;
			const [min, max] = [Math.min(...this._currentValue), Math.max(...this._currentValue)];
			const span = this._config.max - this._config.min;
			const ratio = (value) => `${(value - this._config.min) / span}`;
			if (this._currentValue.length === 1) this._sliderTrack.style.setProperty("--cui-range-slider-track-from-edge", "0");
			else this._sliderTrack.style.setProperty("--cui-range-slider-track-from", ratio(min));
			this._sliderTrack.style.setProperty("--cui-range-slider-track-to", ratio(max));
		}
		_updateNearestValue(value) {
			const nearestIndex = this._getNearestValueIndex(value);
			this._updateValue(value, nearestIndex);
		}
		_updateValue(value, index) {
			const _value = this._validateValue(value, index);
			this._currentValue[index] = _value;
			this._updateInput(index, _value);
			this._updateGradient();
			this._updateTooltip(index, _value);
		}
		_updateInput(index, value) {
			const input = this._inputs[index];
			input.value = value;
			input.setAttribute("aria-valuenow", value);
			const valueText = this._getValueText(value);
			if (valueText !== null) input.setAttribute("aria-valuetext", valueText);
			setTimeout(() => {
				input.focus();
			});
		}
		_validateValue(value, index) {
			const { distance } = this._config;
			const { length } = this._currentValue;
			if (length === 1) return value;
			const prevValue = index > 0 ? this._currentValue[index - 1] : void 0;
			const nextValue = index < length - 1 ? this._currentValue[index + 1] : void 0;
			if (index === 0 && nextValue !== void 0) return Math.min(value, nextValue - distance);
			if (index === length - 1 && prevValue !== void 0) return Math.max(value, prevValue + distance);
			if (prevValue !== void 0 && nextValue !== void 0) {
				const minVal = prevValue + distance;
				const maxVal = nextValue - distance;
				return Math.min(Math.max(value, minVal), maxVal);
			}
			return value;
		}
		_getDecimals(number) {
			const [mantissa, exponent = "0"] = `${number}`.split("e");
			return Math.max(0, (mantissa.split(".")[1] || "").length - Number(exponent));
		}
		_roundToStep(number, step) {
			const { max, min } = this._config;
			const value = Math.min(Math.max(number, min), max);
			const _step = Number(step);
			if (Number.isNaN(_step)) return value;
			const size = _step === 0 ? 1 : _step;
			const decimals = Math.max(this._getDecimals(size), this._getDecimals(min));
			const rounded = Number((min + Math.round((value - min) / size) * size).toFixed(decimals));
			return rounded > max ? Math.max(min, Number((rounded - size).toFixed(decimals))) : rounded;
		}
		_configAfterMerge(config) {
			if (typeof config.ticks === "string") config.ticks = config.ticks.split(/,\s*/);
			if (typeof config.name === "string" && config.name.includes(",")) config.name = config.name.split(/,\s*/);
			if (typeof config.value === "number") config.value = [config.value];
			if (typeof config.value === "string") config.value = config.value.split(/,\s*/).map(Number);
			else if (Array.isArray(config.value)) config.value = [...config.value];
			return config;
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
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		const ratings = js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_RANGE_SLIDER);
		for (let i = 0, len = ratings.length; i < len; i++) RangeSlider.rangeSliderInterface(ratings[i]);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(RangeSlider);
	//#endregion
	return RangeSlider;
});

//# sourceMappingURL=range-slider.js.map