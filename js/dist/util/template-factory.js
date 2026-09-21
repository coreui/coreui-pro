/*!
* CoreUI PRO template-factory.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("../dom/selector-engine.js"), require("./config.js"), require("./sanitizer.js"), require("./index.js")) : typeof define === "function" && define.amd ? define([
		"../dom/selector-engine.js",
		"./config.js",
		"./sanitizer.js",
		"./index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.TemplateFactory = factory(global.SelectorEngine, global.Config, global.Sanitizer, global.Index));
})(this, function(js_src_dom_selector_engine_js, js_src_util_config_js, js_src_util_sanitizer_js, js_src_util_index_js) {
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
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	js_src_util_config_js = __toESM(js_src_util_config_js);
	//#region js/src/util/template-factory.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/template-factory.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/template-factory.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "TemplateFactory";
	const Default = {
		allowList: js_src_util_sanitizer_js.DefaultAllowlist,
		content: {},
		extraClass: "",
		html: false,
		sanitize: true,
		sanitizeFn: null,
		template: "<div></div>"
	};
	const DefaultType = {
		allowList: "object",
		content: "object",
		extraClass: "(string|function)",
		html: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		template: "string"
	};
	const DefaultContentType = {
		entry: "(string|element|function|null)",
		selector: "(string|element)"
	};
	/**
	* Class definition
	*/
	var TemplateFactory = class extends js_src_util_config_js.default {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
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
		getContent() {
			return Object.values(this._config.content).map((config) => this._resolvePossibleFunction(config)).filter(Boolean);
		}
		hasContent() {
			return this.getContent().length > 0;
		}
		changeContent(content) {
			this._checkContent(content);
			this._config.content = {
				...this._config.content,
				...content
			};
			return this;
		}
		toHtml() {
			const templateWrapper = document.createElement("div");
			templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
			for (const [selector, text] of Object.entries(this._config.content)) this._setContent(templateWrapper, text, selector);
			const template = templateWrapper.children[0];
			const extraClass = this._resolvePossibleFunction(this._config.extraClass);
			if (extraClass) template.classList.add(...extraClass.split(" "));
			return template;
		}
		_typeCheckConfig(config) {
			super._typeCheckConfig(config);
			this._checkContent(config.content);
		}
		_checkContent(arg) {
			for (const [selector, content] of Object.entries(arg)) super._typeCheckConfig({
				selector,
				entry: content
			}, DefaultContentType);
		}
		_setContent(template, content, selector) {
			const templateElement = js_src_dom_selector_engine_js.default.findOne(selector, template);
			if (!templateElement) return;
			content = this._resolvePossibleFunction(content);
			if (!content) {
				templateElement.remove();
				return;
			}
			if ((0, js_src_util_index_js.isElement)(content)) {
				this._putElementInTemplate((0, js_src_util_index_js.getElement)(content), templateElement);
				return;
			}
			if (this._config.html) {
				templateElement.innerHTML = this._maybeSanitize(content);
				return;
			}
			templateElement.textContent = content;
		}
		_maybeSanitize(arg) {
			return this._config.sanitize ? (0, js_src_util_sanitizer_js.sanitizeHtml)(arg, this._config.allowList, this._config.sanitizeFn) : arg;
		}
		_resolvePossibleFunction(arg) {
			return (0, js_src_util_index_js.execute)(arg, [void 0, this]);
		}
		_putElementInTemplate(element, templateElement) {
			if (this._config.html) {
				templateElement.innerHTML = "";
				templateElement.append(element);
				return;
			}
			templateElement.textContent = element.textContent;
		}
	};
	//#endregion
	return TemplateFactory;
});

//# sourceMappingURL=template-factory.js.map