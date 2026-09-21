/*!
* CoreUI PRO toast.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./util/component-functions.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./util/component-functions.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Toast = factory(global.BaseComponent, global.EventHandler, global.ComponentFunctions, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_util_component_functions_js, js_src_util_index_js) {
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
	//#region js/src/toast.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI toast.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's toast.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "toast";
	const EVENT_KEY = `.coreui.toast`;
	const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
	const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
	const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
	const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
	const EVENT_HIDE = `hide${EVENT_KEY}`;
	const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
	const EVENT_SHOW = `show${EVENT_KEY}`;
	const EVENT_SHOWN = `shown${EVENT_KEY}`;
	const CLASS_NAME_INSTANT = "toast-instant";
	const CLASS_NAME_SHOW = "show";
	const DefaultType = {
		autohide: "boolean",
		delay: "number"
	};
	const Default = {
		autohide: true,
		delay: 5e3
	};
	/**
	* Class definition
	*/
	var Toast = class Toast extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._timeout = null;
			this._hasMouseInteraction = false;
			this._hasKeyboardInteraction = false;
			this._setListeners();
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
		async show() {
			if (js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SHOW).defaultPrevented) return;
			this._clearTimeout();
			const complete = () => {
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SHOWN);
				this._maybeScheduleHide();
			};
			this._element.classList.add(CLASS_NAME_SHOW);
			await this._queueCallback(complete, this._element, this._isAnimated());
		}
		async hide() {
			if (!this.isShown()) return;
			if (js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HIDE).defaultPrevented) return;
			const complete = () => {
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HIDDEN);
			};
			this._element.classList.remove(CLASS_NAME_SHOW);
			await this._queueCallback(complete, this._element, this._isAnimated());
		}
		dispose() {
			this._clearTimeout();
			if (this.isShown()) this._element.classList.remove(CLASS_NAME_SHOW);
			super.dispose();
		}
		isShown() {
			return this._element.classList.contains(CLASS_NAME_SHOW);
		}
		_isAnimated() {
			return !this._element.classList.contains(CLASS_NAME_INSTANT);
		}
		_maybeScheduleHide() {
			if (!this._config.autohide) return;
			if (this._hasMouseInteraction || this._hasKeyboardInteraction) return;
			this._timeout = setTimeout(() => {
				this.hide();
			}, this._config.delay);
		}
		_onInteraction(event, isInteracting) {
			switch (event.type) {
				case "mouseover":
				case "mouseout":
					this._hasMouseInteraction = isInteracting;
					break;
				case "focusin":
				case "focusout": this._hasKeyboardInteraction = isInteracting;
			}
			if (isInteracting) {
				this._clearTimeout();
				return;
			}
			const nextElement = event.relatedTarget;
			if (this._element === nextElement || this._element.contains(nextElement)) return;
			this._maybeScheduleHide();
		}
		_setListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSEOVER, (event) => this._onInteraction(event, true));
			js_src_dom_event_handler_js.default.on(this._element, EVENT_MOUSEOUT, (event) => this._onInteraction(event, false));
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUSIN, (event) => this._onInteraction(event, true));
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUSOUT, (event) => this._onInteraction(event, false));
		}
		_clearTimeout() {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Toast, config, (element) => [element]);
		}
	};
	/**
	* Data API implementation
	*/
	(0, js_src_util_component_functions_js.enableDismissTrigger)(Toast);
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Toast);
	//#endregion
	return Toast;
});

//# sourceMappingURL=toast.js.map