/*!
* CoreUI PRO rating.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/sanitizer.js"), require("./util/index.js"), require("./tooltip.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/sanitizer.js",
		"./util/index.js",
		"./tooltip.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Rating = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.Sanitizer, global.Index, global.Tooltip));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_sanitizer_js, js_src_util_index_js, js_src_tooltip_js) {
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
	js_src_tooltip_js = __toESM(js_src_tooltip_js);
	//#region js/src/rating.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO rating.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "rating";
	const EVENT_KEY = `.coreui.rating`;
	const DATA_API_KEY = ".data-api";
	const EVENT_CHANGE = `change${EVENT_KEY}`;
	const EVENT_CLICK = `click${EVENT_KEY}`;
	const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
	const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
	const EVENT_HOVER = `hover${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY}`;
	const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY}`;
	const CLASS_NAME_ACTIVE = "active";
	const CLASS_NAME_DISABLED = "disabled";
	const CLASS_NAME_RATING = "rating";
	const CLASS_NAME_RATING_ITEM = "rating-item";
	const CLASS_NAME_RATING_ITEM_ICON = "rating-item-icon";
	const CLASS_NAME_RATING_ITEM_CUSTOM_ICON = "rating-item-custom-icon";
	const CLASS_NAME_RATING_ITEM_CUSTOM_ICON_ACTIVE = "rating-item-custom-icon-active";
	const CLASS_NAME_RATING_ITEM_INPUT = "rating-item-input";
	const CLASS_NAME_RATING_ITEM_LABEL = "rating-item-label";
	const CLASS_NAME_READONLY = "readonly";
	const SELECTOR_DATA_RATING = "[data-coreui-rating]";
	const SELECTOR_RATING_ITEM = ".rating-item";
	const SELECTOR_RATING_ITEM_INPUT = ".rating-item-input";
	const SELECTOR_RATING_ITEM_LABEL = ".rating-item-label";
	const Default = {
		activeIcon: null,
		allowClear: false,
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaLabel: (value, itemCount) => `${value} of ${itemCount}`,
		disabled: false,
		highlightOnlySelected: false,
		icon: null,
		itemCount: 5,
		name: null,
		precision: 1,
		readonly: false,
		sanitize: true,
		sanitizeFn: null,
		size: null,
		tooltips: false,
		value: null
	};
	const DefaultType = {
		activeIcon: "(object|string|null)",
		allowClear: "boolean",
		allowList: "object",
		ariaLabel: "function",
		disabled: "boolean",
		highlightOnlySelected: "boolean",
		icon: "(object|string|null)",
		itemCount: "number",
		name: "(string|null)",
		precision: "number",
		readonly: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		size: "(string|null)",
		tooltips: "(array|boolean|object)",
		value: "(number|null)"
	};
	/**
	* Class definition
	*/
	var Rating = class Rating extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._currentValue = this._config.value;
			this._name = this._config.name || (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}-name-`).toString();
			this._tooltip = null;
			this._createRating();
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
			this._currentValue = this._config.value;
			this._disposeTooltips();
			this._element.innerHTML = "";
			this._createRating();
		}
		reset(value = null) {
			this._currentValue = value;
			this._disposeTooltips();
			this._element.innerHTML = "";
			this._createRating();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value });
		}
		dispose() {
			this._disposeTooltips();
			super.dispose();
		}
		_disposeTooltips() {
			for (const item of js_src_dom_selector_engine_js.default.find(SELECTOR_RATING_ITEM, this._element)) js_src_tooltip_js.default.getInstance(item)?.dispose();
			this._tooltip = null;
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				if (this._config.disabled || this._config.readonly) return;
				if (this._config.allowClear && this._currentValue == target.value) {
					this._currentValue = null;
					target.checked = false;
					this._resetLabels();
					js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: null });
				}
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CHANGE, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				if (this._config.disabled || this._config.readonly) return;
				this._currentValue = target.value;
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: target.value });
				const inputs = js_src_dom_selector_engine_js.default.find(SELECTOR_RATING_ITEM_INPUT, this._element);
				this._resetLabels();
				if (this._config.highlightOnlySelected) {
					js_src_dom_selector_engine_js.default.findOne(SELECTOR_RATING_ITEM_LABEL, target.parentElement).classList.add(CLASS_NAME_ACTIVE);
					return;
				}
				for (const input of inputs) {
					js_src_dom_selector_engine_js.default.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement).classList.add(CLASS_NAME_ACTIVE);
					if (input === target) break;
				}
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSEENTER, SELECTOR_RATING_ITEM_LABEL, ({ target }) => {
				if (this._config.disabled || this._config.readonly) return;
				const label = target.closest(SELECTOR_RATING_ITEM_LABEL);
				const labels = js_src_dom_selector_engine_js.default.find(SELECTOR_RATING_ITEM_LABEL, this._element);
				this._resetLabels();
				const input = js_src_dom_selector_engine_js.default.findOne(SELECTOR_RATING_ITEM_INPUT, label.parentElement);
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HOVER, { value: input.value });
				this._createTooltip(label.parentElement, input.value);
				if (this._config.highlightOnlySelected) {
					label.classList.add(CLASS_NAME_ACTIVE);
					return;
				}
				for (const _label of labels) {
					_label.classList.add(CLASS_NAME_ACTIVE);
					if (_label === label) break;
				}
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSELEAVE, SELECTOR_RATING_ITEM_LABEL, () => {
				if (this._config.disabled || this._config.readonly) return;
				if (this._tooltip) this._tooltip.hide();
				const checkedInput = js_src_dom_selector_engine_js.default.findOne(`${SELECTOR_RATING_ITEM_INPUT}[value="${this._currentValue}"]`, this._element);
				this._resetLabels();
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HOVER, { value: null });
				if (checkedInput && this._config.highlightOnlySelected) {
					js_src_dom_selector_engine_js.default.findOne(SELECTOR_RATING_ITEM_LABEL, checkedInput.parentElement).classList.add(CLASS_NAME_ACTIVE);
					return;
				}
				if (checkedInput) {
					const inputs = js_src_dom_selector_engine_js.default.find(SELECTOR_RATING_ITEM_INPUT, this._element);
					this._resetLabels();
					for (const input of inputs) {
						js_src_dom_selector_engine_js.default.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement).classList.add(CLASS_NAME_ACTIVE);
						if (input === checkedInput) break;
					}
				}
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUSIN, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HOVER, { value: target.value });
				this._createTooltip(target.parentElement, target.value);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUSOUT, SELECTOR_RATING_ITEM_INPUT, () => {
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HOVER, { value: null });
				if (this._tooltip) this._tooltip.hide();
			});
		}
		_createTooltip(selector, value) {
			if (this._config.tooltips === false) return;
			if (this._tooltip) this._tooltip.hide();
			let tooltipTitle;
			if (typeof this._config.tooltips === "boolean") tooltipTitle = value;
			if (typeof this._config.tooltips === "object") tooltipTitle = this._config.tooltips[value];
			if (Array.isArray(this._config.tooltips)) tooltipTitle = this._config.tooltips[value - 1];
			this._tooltip = new js_src_tooltip_js.default(selector, { title: tooltipTitle });
		}
		_configAfterMerge(config) {
			if (typeof config.tooltips === "string") config.tooltips = config.tooltips.split(",");
			return config;
		}
		_resetLabels() {
			const labels = js_src_dom_selector_engine_js.default.find(SELECTOR_RATING_ITEM_LABEL, this._element);
			for (const label of labels) label.classList.remove(CLASS_NAME_ACTIVE);
		}
		_createRating() {
			this._element.classList.add(CLASS_NAME_RATING);
			if (this._config.size) this._element.classList.add(`rating-${this._config.size}`);
			if (this._config.disabled) this._element.classList.add(CLASS_NAME_DISABLED);
			if (this._config.readonly) this._element.classList.add(CLASS_NAME_READONLY);
			this._element.setAttribute("role", "radiogroup");
			Array.from({ length: this._config.itemCount }, (_, index) => this._createRatingItem(index));
		}
		_createRatingItem(index) {
			const ratingItemElement = document.createElement("div");
			ratingItemElement.classList.add(CLASS_NAME_RATING_ITEM);
			const numberOfRadios = 1 / this._config.precision;
			Array.from({ length: numberOfRadios }, (_, _index) => {
				const ratingItemId = (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}${index}`).toString();
				const isNotLastItem = _index + 1 < numberOfRadios;
				const value = numberOfRadios === 1 ? index + 1 : (_index + 1) * Number(this._config.precision) + index;
				const ratingItemLabelElement = document.createElement("label");
				ratingItemLabelElement.classList.add(CLASS_NAME_RATING_ITEM_LABEL);
				ratingItemLabelElement.setAttribute("for", ratingItemId);
				if (this._config.highlightOnlySelected && this._currentValue == value) ratingItemLabelElement.classList.add(CLASS_NAME_ACTIVE);
				if (!this._config.highlightOnlySelected && this._currentValue >= value) ratingItemLabelElement.classList.add(CLASS_NAME_ACTIVE);
				if (isNotLastItem) {
					ratingItemLabelElement.style.zIndex = 1 / this._config.precision - _index;
					ratingItemLabelElement.style.position = "absolute";
					ratingItemLabelElement.style.width = `${this._config.precision * (_index + 1) * 100}%`;
					ratingItemLabelElement.style.overflow = "hidden";
					ratingItemLabelElement.style.opacity = 0;
				}
				if (this._config.icon) {
					const ratingItemIconElement = document.createElement("div");
					ratingItemIconElement.classList.add(CLASS_NAME_RATING_ITEM_CUSTOM_ICON);
					ratingItemIconElement.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(typeof this._config.icon === "object" ? this._config.icon[index + 1] : this._config.icon, this._config);
					ratingItemLabelElement.append(ratingItemIconElement);
				} else {
					const ratingItemIconElement = document.createElement("div");
					ratingItemIconElement.classList.add(CLASS_NAME_RATING_ITEM_ICON);
					ratingItemLabelElement.append(ratingItemIconElement);
				}
				if (this._config.icon && this._config.activeIcon) {
					const ratingItemIconActiveElement = document.createElement("div");
					ratingItemIconActiveElement.classList.add(CLASS_NAME_RATING_ITEM_CUSTOM_ICON_ACTIVE);
					ratingItemIconActiveElement.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(typeof this._config.activeIcon === "object" ? this._config.activeIcon[index + 1] : this._config.activeIcon, this._config);
					ratingItemLabelElement.append(ratingItemIconActiveElement);
				}
				const ratingItemInputElement = document.createElement("input");
				ratingItemInputElement.classList.add(CLASS_NAME_RATING_ITEM_INPUT);
				ratingItemInputElement.id = ratingItemId;
				ratingItemInputElement.type = "radio";
				ratingItemInputElement.value = value;
				ratingItemInputElement.name = this._name;
				if (typeof this._config.ariaLabel === "function") ratingItemInputElement.setAttribute("aria-label", this._config.ariaLabel(value, this._config.itemCount));
				if (this._config.disabled || this._config.readonly) ratingItemInputElement.setAttribute("disabled", true);
				if (this._currentValue === value) ratingItemInputElement.checked = true;
				if (this._config.precision === 1) {
					ratingItemElement.append(ratingItemLabelElement);
					ratingItemElement.append(ratingItemInputElement);
				} else {
					const wrapper = document.createElement("div");
					wrapper.append(ratingItemLabelElement);
					wrapper.append(ratingItemInputElement);
					ratingItemElement.append(wrapper);
				}
			});
			this._element.append(ratingItemElement);
		}
		static ratingInterface(element, config, ...args) {
			const data = Rating.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Rating, config, args);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		const ratings = js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_RATING);
		for (let i = 0, len = ratings.length; i < len; i++) Rating.ratingInterface(ratings[i]);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Rating);
	//#endregion
	return Rating;
});

//# sourceMappingURL=rating.js.map