/*!
* CoreUI PRO rating.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/field-validation.js"), require("./util/form-validation.js"), require("./util/sanitizer.js"), require("./util/index.js"), require("./tooltip.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/field-validation.js",
		"./util/form-validation.js",
		"./util/sanitizer.js",
		"./util/index.js",
		"./tooltip.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Rating = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.FieldValidation, global.FormValidation, global.Sanitizer, global.Index, global.Tooltip));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_field_validation_js, js_src_util_form_validation_js, js_src_util_sanitizer_js, js_src_util_index_js, js_src_tooltip_js) {
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
	js_src_tooltip_js = __toESM(js_src_tooltip_js);
	//#region js/src/rating.ts
	const NAME = "rating";
	const EVENT_KEY = `.coreui.rating`;
	const DATA_API_KEY = ".data-api";
	const EVENT_CHANGE = `change${EVENT_KEY}`;
	const EVENT_CLICK = `click${EVENT_KEY}`;
	const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
	const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
	const EVENT_HOVER = `hover${EVENT_KEY}`;
	const EVENT_INPUT = `input${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
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
	const SIZE_CLASS_NAMES = ["rating-lg", "rating-sm"];
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
		required: false,
		sanitize: true,
		sanitizeFn: null,
		size: null,
		tooltips: false,
		validationState: null,
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
		required: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		size: "(string|null)",
		tooltips: "(array|boolean|object)",
		validationState: "(string|null|undefined)",
		value: "(number|null)"
	};
	var Rating = class Rating extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element);
			this._items = [];
			this._validation = new js_src_util_field_validation_js.default(this._element, {
				blockers: () => {
					const blocked = this._blockedRadio();
					return blocked ? [blocked] : [];
				},
				canBlock: () => !this._disabled && !this._config.readonly,
				config: () => this._config,
				describedTargets: () => this._radios(),
				fields: () => this._radios(),
				frames: () => [this._element],
				invalidTargets: () => [this._element],
				pageDescribed: () => [this._element],
				restore: () => this._restoreValue()
			});
			this._sizeClassName = null;
			this._config = this._getConfig(config);
			this._currentValue = this._config.value;
			this._disabled = this._config.disabled;
			this._startValue = this._config.value;
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
			this._typeCheckConfig({ value }, { value: DefaultType.value });
			this._currentValue = value;
			this._paintValue();
		}
		reset(value = null) {
			const isChanged = value != this._currentValue;
			this._currentValue = value;
			this._paintValue();
			if (isChanged) js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value });
		}
		dispose() {
			if (!this._element) return;
			this._validation.dispose();
			this._removeRating();
			super.dispose();
		}
		_setDisabled(disabled) {
			if (disabled === this._disabled) return;
			this._disabled = disabled;
			this._element.classList.toggle(CLASS_NAME_DISABLED, disabled);
			for (const radio of this._radios()) radio.disabled = disabled;
			if (disabled) this._disposeTooltips();
			this._paintValue();
		}
		_paintValue() {
			let checked = null;
			for (const radio of this._radios()) {
				radio.checked = radio.value == this._currentValue;
				if (radio.checked) checked = radio;
			}
			if (!checked) this._currentValue = null;
			this._highlightLabels(checked);
			this._updateTabStop();
			this._validation.update();
		}
		_radios() {
			return js_src_dom_selector_engine_js.default.find(SELECTOR_RATING_ITEM_INPUT, this._element);
		}
		_blockedRadio() {
			const radios = this._radios();
			return radios.find((radio) => radio.checked) ?? radios[0];
		}
		_removeRating() {
			this._disposeTooltips();
			const anchor = this._items.at(-1)?.nextSibling ?? null;
			for (const item of this._items) item.remove();
			this._items = [];
			return anchor;
		}
		_disposeTooltips() {
			for (const item of js_src_dom_selector_engine_js.default.find(`${SELECTOR_RATING_ITEM}, ${SELECTOR_RATING_ITEM} > div`, this._element)) js_src_tooltip_js.default.getInstance(item)?.dispose();
			this._tooltip = null;
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK, SELECTOR_RATING_ITEM_INPUT, (event) => {
				const { target } = event;
				if (this._config.readonly) {
					event.preventDefault();
					return;
				}
				if (this._disabled) return;
				if (this._config.allowClear && this._currentValue == target.value) {
					this._currentValue = null;
					target.checked = false;
					this._resetLabels();
					this._validation.dismiss();
					this._validation.update();
					js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: null });
				}
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_INPUT, SELECTOR_RATING_ITEM_INPUT, () => {
				if (!this._disabled && !this._config.readonly) this._validation.dismiss();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CHANGE, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				if (this._disabled || this._config.readonly) return;
				this._currentValue = target.value;
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: target.value });
				if (target.isConnected) this._highlightLabels(target);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSEENTER, SELECTOR_RATING_ITEM_LABEL, ({ target }) => {
				if (this._disabled || this._config.readonly) return;
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
				if (this._disabled || this._config.readonly) return;
				if (this._tooltip) this._tooltip.hide();
				const checkedInput = js_src_dom_selector_engine_js.default.findOne(`${SELECTOR_RATING_ITEM_INPUT}[value="${this._currentValue}"]`, this._element);
				this._resetLabels();
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HOVER, { value: null });
				this._highlightLabels(checkedInput);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, SELECTOR_RATING_ITEM_INPUT, (event) => {
				if (this._config.readonly && event.key?.startsWith("Arrow")) event.preventDefault();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUSIN, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				if (this._disabled || this._config.readonly) return;
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HOVER, { value: target.value });
				this._createTooltip(target.parentElement, target.value);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUSOUT, SELECTOR_RATING_ITEM_INPUT, () => {
				if (this._disabled || this._config.readonly) return;
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
		_highlightLabels(checkedInput) {
			this._resetLabels();
			if (!checkedInput) return;
			if (this._config.highlightOnlySelected) {
				js_src_dom_selector_engine_js.default.findOne(SELECTOR_RATING_ITEM_LABEL, checkedInput.parentElement).classList.add(CLASS_NAME_ACTIVE);
				return;
			}
			for (const input of js_src_dom_selector_engine_js.default.find(SELECTOR_RATING_ITEM_INPUT, this._element)) {
				js_src_dom_selector_engine_js.default.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement).classList.add(CLASS_NAME_ACTIVE);
				if (input === checkedInput) break;
			}
		}
		_createRating(anchor = null) {
			this._element.classList.add(CLASS_NAME_RATING);
			this._element.classList.toggle(CLASS_NAME_DISABLED, this._disabled);
			this._element.classList.toggle(CLASS_NAME_READONLY, Boolean(this._config.readonly));
			this._element.classList.remove(...SIZE_CLASS_NAMES);
			if (this._sizeClassName) this._element.classList.remove(this._sizeClassName);
			this._sizeClassName = null;
			if (this._config.size) {
				const sizeClassName = `rating-${this._config.size}`;
				this._element.classList.add(sizeClassName);
				this._sizeClassName = sizeClassName;
			}
			this._element.setAttribute("role", "radiogroup");
			(0, js_src_util_index_js.writeAttribute)(this._element, "aria-readonly", this._config.readonly ? "true" : null);
			(0, js_src_util_index_js.writeAttribute)(this._element, "aria-required", this._isRequired() ? "true" : null);
			this._items = Array.from({ length: this._config.itemCount }, (_, index) => this._createRatingItem(index));
			for (const item of this._items) this._element.insertBefore(item, anchor);
			if (!this._items.some((item) => item.querySelector(`${SELECTOR_RATING_ITEM_INPUT}:checked`))) {
				this._currentValue = null;
				this._resetLabels();
			}
			this._updateTabStop();
			this._validation.refresh();
		}
		_isRequired() {
			return this._config.required && !this._config.readonly;
		}
		_updateTabStop() {
			if (!this._config.readonly) return;
			const stop = this._blockedRadio();
			for (const input of this._radios()) input.tabIndex = input === stop ? 0 : -1;
		}
		_restoreValue() {
			const checkedInput = js_src_dom_selector_engine_js.default.findOne(`${SELECTOR_RATING_ITEM_INPUT}:checked`, this._element);
			const value = checkedInput?.value ?? null;
			if (value == this._currentValue) return;
			this._currentValue = value;
			this._highlightLabels(checkedInput);
			this._updateTabStop();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value });
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
				if (!this._config.readonly) ratingItemInputElement.name = this._name;
				else if (this._config.name) ratingItemInputElement.name = this._config.name;
				if (typeof this._config.ariaLabel === "function") ratingItemInputElement.setAttribute("aria-label", this._config.ariaLabel(value, this._config.itemCount));
				if (this._disabled) ratingItemInputElement.disabled = true;
				ratingItemInputElement.required = this._isRequired();
				ratingItemInputElement.defaultChecked = this._startValue == value;
				ratingItemInputElement.checked = this._currentValue == value;
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
			return ratingItemElement;
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
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		const ratings = js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_RATING);
		for (const rating of ratings) Rating.ratingInterface(rating);
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(Rating);
	//#endregion
	return Rating;
});

//# sourceMappingURL=rating.js.map