/*!
* CoreUI PRO modal.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./dialog-base.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/component-functions.js"), require("./util/index.js"), require("./util/legacy-markup.js")) : typeof define === "function" && define.amd ? define([
		"./dialog-base.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/component-functions.js",
		"./util/index.js",
		"./util/legacy-markup.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Modal = factory(global.DialogBase, global.EventHandler, global.SelectorEngine, global.ComponentFunctions, global.Index, global.LegacyMarkup));
})(this, function(js_src_dialog_base_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_component_functions_js, js_src_util_index_js, js_src_util_legacy_markup_js) {
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
	js_src_dialog_base_js = __toESM(js_src_dialog_base_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/modal.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI modal.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's dialog.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "modal";
	const EVENT_KEY = `.coreui.modal`;
	const DATA_API_KEY = ".data-api";
	const EVENT_SHOW = `show${EVENT_KEY}`;
	const EVENT_SHOWN = `shown${EVENT_KEY}`;
	const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
	const EVENT_CANCEL = `cancel${EVENT_KEY}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_NONMODAL = "modal-nonmodal";
	const CLASS_NAME_INSTANT = "modal-instant";
	const CLASS_NAME_SWAP_IN = "modal-swap-in";
	const SELECTOR_DATA_TOGGLE = "[data-coreui-toggle=\"modal\"]";
	const Default = {
		backdrop: true,
		keyboard: true,
		modal: true
	};
	const DefaultType = {
		backdrop: "(boolean|string)",
		keyboard: "boolean",
		modal: "boolean"
	};
	/**
	* Class definition
	*/
	var Modal = class Modal extends js_src_dialog_base_js.default {
		constructor(element, config) {
			super((0, js_src_util_legacy_markup_js.resolveDialogElement)(element, NAME), config);
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
		handleUpdate() {}
		_getShowOptions() {
			return {
				modal: this._config.modal,
				preventBodyScroll: this._config.modal
			};
		}
		_onBeforeShow() {
			if (!this._config.modal) this._element.classList.add(CLASS_NAME_NONMODAL);
		}
		_onAfterHide() {
			this._element.classList.remove(CLASS_NAME_NONMODAL);
		}
		_shouldDeferClose() {
			return this._isAnimated();
		}
		_onCancel() {
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CANCEL);
		}
		static jQueryInterface(config, relatedTarget) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Modal, config, [relatedTarget]);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
		const target = (0, js_src_util_legacy_markup_js.resolveDialogElement)(js_src_dom_selector_engine_js.default.getElementFromSelector(this), NAME);
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		js_src_dom_event_handler_js.default.one(target, EVENT_SHOW, (showEvent) => {
			if (showEvent.defaultPrevented) return;
			js_src_dom_event_handler_js.default.one(target, EVENT_HIDDEN, () => {
				if ((0, js_src_util_index_js.isVisible)(this)) this.focus({ preventScroll: true });
			});
		});
		const currentDialog = this.closest("dialog[open]");
		if (currentDialog && currentDialog !== target && target) {
			const newModal = Modal.getOrCreateInstance(target);
			target.classList.add(CLASS_NAME_SWAP_IN);
			newModal.show(this);
			js_src_dom_event_handler_js.default.one(target, EVENT_SHOWN, () => {
				target.classList.remove(CLASS_NAME_SWAP_IN);
			});
			const currentInstance = Modal.getInstance(currentDialog);
			if (currentInstance) {
				currentDialog.classList.add(CLASS_NAME_INSTANT);
				js_src_dom_event_handler_js.default.one(currentDialog, EVENT_HIDDEN, () => {
					currentDialog.classList.remove(CLASS_NAME_INSTANT);
				});
				currentInstance.hide();
			}
			return;
		}
		Modal.getOrCreateInstance(target).toggle(this);
	});
	(0, js_src_util_component_functions_js.enableDismissTrigger)(Modal);
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Modal);
	//#endregion
	return Modal;
});

//# sourceMappingURL=modal.js.map