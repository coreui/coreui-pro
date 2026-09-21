/*!
* CoreUI PRO tooltip.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("@floating-ui/dom"), require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./util/index.js"), require("./util/sanitizer.js"), require("./util/template-factory.js"), require("./util/floating-ui.js")) : typeof define === "function" && define.amd ? define([
		"@floating-ui/dom",
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./util/index.js",
		"./util/sanitizer.js",
		"./util/template-factory.js",
		"./util/floating-ui.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Tooltip = factory(global.FloatingUIDOM, global.BaseComponent, global.EventHandler, global.Manipulator, global.Index, global.Sanitizer, global.TemplateFactory, global.FloatingUi));
})(this, function(_floating_ui_dom, js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_util_index_js, js_src_util_sanitizer_js, js_src_util_template_factory_js, js_src_util_floating_ui_js) {
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
	js_src_util_template_factory_js = __toESM(js_src_util_template_factory_js);
	//#region js/src/tooltip.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI tooltip.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's tooltip.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "tooltip";
	const ESCAPE_KEY = "Escape";
	const CLASS_NAME_MODAL = "modal";
	const CLASS_NAME_SHOW = "show";
	const SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
	const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
	const SELECTOR_DATA_TOGGLE = "[data-coreui-toggle=\"tooltip\"]";
	const EVENT_MODAL_HIDE = "hide.coreui.modal";
	const TRIGGER_HOVER = "hover";
	const TRIGGER_FOCUS = "focus";
	const TRIGGER_CLICK = "click";
	const TRIGGER_MANUAL = "manual";
	const EVENT_HIDE = "hide";
	const EVENT_HIDDEN = "hidden";
	const EVENT_SHOW = "show";
	const EVENT_SHOWN = "shown";
	const EVENT_INSERTED = "inserted";
	const EVENT_CLICK = "click";
	const EVENT_FOCUSIN = "focusin";
	const EVENT_FOCUSOUT = "focusout";
	const EVENT_MOUSEENTER = "mouseenter";
	const EVENT_MOUSELEAVE = "mouseleave";
	const EVENT_KEYDOWN = "keydown";
	const ATTACHMENTS = {
		AUTO: ["auto", "auto"],
		TOP: ["top", "top"],
		RIGHT: ["right", "left"],
		BOTTOM: ["bottom", "bottom"],
		LEFT: ["left", "right"],
		START: ["left", "right"],
		END: ["right", "left"]
	};
	const Default = {
		allowList: js_src_util_sanitizer_js.DefaultAllowlist,
		animation: true,
		boundary: "clippingParents",
		container: false,
		customClass: "",
		delay: 0,
		fallbackPlacements: [
			"top",
			"right",
			"bottom",
			"left"
		],
		floatingConfig: null,
		html: false,
		offset: [0, 6],
		placement: "top",
		sanitize: true,
		sanitizeFn: null,
		selector: false,
		template: "<div class=\"tooltip\" role=\"tooltip\"><div class=\"tooltip-arrow\"></div><div class=\"tooltip-inner\"></div></div>",
		title: "",
		trigger: "hover focus"
	};
	const DefaultType = {
		allowList: "object",
		animation: "boolean",
		boundary: "(string|element)",
		container: "(string|element|boolean)",
		customClass: "(string|function)",
		delay: "(number|object)",
		fallbackPlacements: "array",
		floatingConfig: "(null|object|function)",
		html: "boolean",
		offset: "(array|string|function)",
		placement: "(string|function)",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		selector: "(string|boolean)",
		template: "string",
		title: "(string|element|function)",
		trigger: "string"
	};
	/**
	* Class definition
	*/
	var Tooltip = class Tooltip extends js_src_base_component_js.default {
		constructor(element, config) {
			if (typeof _floating_ui_dom.computePosition === "undefined") throw new TypeError("CoreUI's tooltips require Floating UI (https://floating-ui.com)");
			super(element, config);
			this._isEnabled = true;
			this._timeout = 0;
			this._resolveTimeout = null;
			this._isHovered = null;
			this._activeTrigger = {};
			this._floatingCleanup = null;
			this._keydownHandler = null;
			this._tipEventOut = null;
			this._templateFactory = null;
			this._newContent = null;
			this._mediaQueryListeners = [];
			this._responsivePlacements = null;
			this.tip = null;
			this._parseResponsivePlacements();
			this._setListeners();
			if (!this._config.selector) this._fixTitle();
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
		enable() {
			this._isEnabled = true;
		}
		disable() {
			this._isEnabled = false;
		}
		toggleEnabled() {
			this._isEnabled = !this._isEnabled;
		}
		toggle() {
			if (!this._isEnabled) return Promise.resolve();
			return this._isShown() ? this._leave() : this._enter();
		}
		dispose() {
			this._clearTimeout();
			this._removeEscapeListener();
			js_src_dom_event_handler_js.default.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
			if (this._element.getAttribute("data-coreui-original-title")) this._element.setAttribute("title", this._element.getAttribute("data-coreui-original-title"));
			this._disposeFloating();
			this._disposeMediaQueryListeners();
			super.dispose();
		}
		async show() {
			if (this._element.style.display === "none") throw new Error("Please use show on visible elements");
			if (!(this._isWithContent() && this._isEnabled)) return;
			const showEvent = js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_SHOW));
			const isInTheDom = ((0, js_src_util_index_js.findShadowRoot)(this._element) || this._element.ownerDocument.documentElement).contains(this._element);
			if (showEvent.defaultPrevented || !isInTheDom) {
				this._isHovered = false;
				return;
			}
			this._disposeFloating();
			const tip = this._getTipElement();
			this._element.setAttribute("aria-describedby", tip.getAttribute("id"));
			let { container } = this._config;
			const closestDialog = this._element.closest("dialog[open]");
			if (closestDialog && container === document.body) container = closestDialog;
			if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
				container.append(tip);
				if (!tip.hasAttribute("dir")) tip.dir = this._isRTL() ? "rtl" : "ltr";
				js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
				this._setTipListeners(tip);
			}
			await this._createFloating(tip);
			tip.classList.add(CLASS_NAME_SHOW);
			this._setEscapeListener();
			if ("ontouchstart" in document.documentElement) for (const element of document.body.children) js_src_dom_event_handler_js.default.on(element, "mouseover", js_src_util_index_js.noop);
			const complete = () => {
				js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_SHOWN));
				if (this._isHovered === false) this._leave();
				this._isHovered = false;
			};
			await this._queueCallback(complete, this.tip, this._isAnimated());
		}
		async hide() {
			if (!this._isShown()) return;
			if (js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_HIDE)).defaultPrevented) return;
			this._removeEscapeListener();
			this._getTipElement().classList.remove(CLASS_NAME_SHOW);
			if ("ontouchstart" in document.documentElement) for (const element of document.body.children) js_src_dom_event_handler_js.default.off(element, "mouseover", js_src_util_index_js.noop);
			this._activeTrigger[TRIGGER_CLICK] = false;
			this._activeTrigger[TRIGGER_FOCUS] = false;
			this._activeTrigger[TRIGGER_HOVER] = false;
			this._isHovered = null;
			const complete = () => {
				if (this._isWithActiveTrigger()) return;
				if (!this._isHovered) this._disposeFloating();
				this._element.removeAttribute("aria-describedby");
				js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN));
			};
			await this._queueCallback(complete, this.tip, this._isAnimated());
		}
		update() {
			if (this._floatingCleanup && this.tip) this._updateFloatingPosition();
		}
		_isWithContent() {
			return Boolean(this._getTitle()) || this._hasNewContent();
		}
		_hasNewContent() {
			return Boolean(this._newContent) && Object.values(this._newContent).some(Boolean);
		}
		_getTipElement() {
			if (!this.tip) this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
			return this.tip;
		}
		_createTipElement(content) {
			const tip = this._getTemplateFactory(content).toHtml();
			tip.classList.remove(CLASS_NAME_SHOW);
			tip.classList.add(`bs-${this.constructor.NAME}-auto`);
			const tipId = (0, js_src_util_index_js.getUID)(this.constructor.NAME).toString();
			tip.setAttribute("id", tipId);
			if (!this._config.animation) tip.classList.add(this._getInstantClassName());
			return tip;
		}
		setContent(content) {
			this._newContent = content;
			if (this._isShown()) {
				this._disposeFloating();
				this.show();
			}
		}
		_getTemplateFactory(content) {
			if (this._templateFactory) this._templateFactory.changeContent(content);
			else this._templateFactory = new js_src_util_template_factory_js.default({
				...this._config,
				content,
				extraClass: this._resolvePossibleFunction(this._config.customClass)
			});
			return this._templateFactory;
		}
		_getContentForTemplate() {
			return { [SELECTOR_TOOLTIP_INNER]: this._getTitle() };
		}
		_getTitle() {
			return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-coreui-original-title");
		}
		_initializeOnDelegatedTarget(event) {
			return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
		}
		_getInstantClassName() {
			return `${this.constructor.NAME}-instant`;
		}
		_isAnimated() {
			return !this.tip?.classList.contains(this._getInstantClassName());
		}
		_isShown() {
			return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW);
		}
		_getPlacement(tip) {
			if (this._responsivePlacements) return this._attachment((0, js_src_util_floating_ui_js.getResponsivePlacement)(this._responsivePlacements, "top"));
			return this._attachment((0, js_src_util_index_js.execute)(this._config.placement, [
				this,
				tip,
				this._element
			]));
		}
		_attachment(placement) {
			return ATTACHMENTS[placement.toUpperCase()]?.[this._isRTL() ? 1 : 0] ?? placement;
		}
		_isRTL() {
			return (0, js_src_util_index_js.isRTL)(this._element.parentElement ?? this._element);
		}
		_parseResponsivePlacements() {
			if (typeof this._config.placement !== "string") {
				this._responsivePlacements = null;
				return;
			}
			this._responsivePlacements = (0, js_src_util_floating_ui_js.parseResponsivePlacement)(this._config.placement, "top");
			if (this._responsivePlacements) this._setupMediaQueryListeners();
		}
		_setupMediaQueryListeners() {
			this._disposeMediaQueryListeners();
			this._mediaQueryListeners = (0, js_src_util_floating_ui_js.createBreakpointListeners)(() => {
				if (this._isShown()) this._updateFloatingPosition();
			});
		}
		_disposeMediaQueryListeners() {
			(0, js_src_util_floating_ui_js.disposeBreakpointListeners)(this._mediaQueryListeners);
			this._mediaQueryListeners = [];
		}
		async _createFloating(tip) {
			const placement = this._getPlacement(tip);
			const arrowElement = tip.querySelector(`.${this.constructor.NAME}-arrow`);
			await this._updateFloatingPosition(tip, placement, arrowElement);
			this._floatingCleanup = (0, _floating_ui_dom.autoUpdate)(this._element, tip, () => this._updateFloatingPosition(tip, null, arrowElement));
		}
		async _updateFloatingPosition(tip = this.tip, placement = null, arrowElement = null) {
			if (!tip) return;
			if (!placement) placement = this._getPlacement(tip);
			if (!arrowElement) arrowElement = tip.querySelector(`.${this.constructor.NAME}-arrow`);
			const middleware = this._getFloatingMiddleware(arrowElement);
			const floatingConfig = this._getFloatingConfig(placement, middleware);
			js_src_dom_manipulator_js.default.setDataAttribute(tip, "placement", floatingConfig.placement);
			let { x, y, placement: finalPlacement, middlewareData } = await (0, _floating_ui_dom.computePosition)(this._element, tip, floatingConfig);
			if (finalPlacement !== floatingConfig.placement) {
				js_src_dom_manipulator_js.default.setDataAttribute(tip, "placement", finalPlacement);
				({x, y, placement: finalPlacement, middlewareData} = await (0, _floating_ui_dom.computePosition)(this._element, tip, {
					...floatingConfig,
					placement: finalPlacement
				}));
			}
			Object.assign(tip.style, {
				position: "absolute",
				left: `${x}px`,
				top: `${y}px`
			});
			if (arrowElement) arrowElement.style.position = "absolute";
			if (arrowElement && middlewareData.arrow) {
				const { x: arrowX, y: arrowY } = middlewareData.arrow;
				const isVertical = finalPlacement.startsWith("top") || finalPlacement.startsWith("bottom");
				Object.assign(arrowElement.style, {
					left: isVertical && arrowX !== void 0 ? `${arrowX}px` : "",
					top: !isVertical && arrowY !== void 0 ? `${arrowY}px` : "",
					right: "",
					bottom: ""
				});
			}
		}
		_getOffset() {
			const { offset } = this._config;
			if (typeof offset === "string") return offset.split(",").map((value) => Number.parseInt(value, 10));
			if (typeof offset === "function") return ({ placement, rects }) => {
				const result = offset({
					placement,
					reference: rects.reference,
					floating: rects.floating
				}, this._element);
				return (0, js_src_util_floating_ui_js.toFloatingOffset)(result);
			};
			return offset;
		}
		_resolvePossibleFunction(arg) {
			return (0, js_src_util_index_js.execute)(arg, [this._element, this._element]);
		}
		_getFloatingMiddleware(arrowElement) {
			const offsetValue = this._getOffset();
			const middleware = [
				(0, _floating_ui_dom.offset)(typeof offsetValue === "function" ? offsetValue : (0, js_src_util_floating_ui_js.toFloatingOffset)(offsetValue)),
				(0, _floating_ui_dom.flip)({ fallbackPlacements: this._config.fallbackPlacements }),
				(0, _floating_ui_dom.shift)({ boundary: this._config.boundary === "clippingParents" ? "clippingAncestors" : this._config.boundary })
			];
			if (arrowElement) middleware.push((0, _floating_ui_dom.arrow)({ element: arrowElement }));
			return middleware;
		}
		_getFloatingConfig(placement, middleware) {
			const defaultConfig = {
				placement,
				middleware
			};
			return {
				...defaultConfig,
				...(0, js_src_util_index_js.execute)(this._config.floatingConfig, [void 0, defaultConfig])
			};
		}
		_setListeners() {
			const triggers = this._config.trigger.split(" ");
			for (const trigger of triggers) if (trigger === "click") js_src_dom_event_handler_js.default.on(this._element, this.constructor.eventName(EVENT_CLICK), this._config.selector, (event) => {
				const context = this._initializeOnDelegatedTarget(event);
				context._activeTrigger[TRIGGER_CLICK] = !(context._isShown() && context._activeTrigger[TRIGGER_CLICK]);
				context.toggle();
			});
			else if (trigger !== TRIGGER_MANUAL) {
				const [eventIn, eventOut] = this._getTriggerEvents(trigger);
				js_src_dom_event_handler_js.default.on(this._element, eventIn, this._config.selector, (event) => {
					const context = this._initializeOnDelegatedTarget(event);
					context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
					context._enter();
				});
				js_src_dom_event_handler_js.default.on(this._element, eventOut, this._config.selector, (event) => {
					const context = this._initializeOnDelegatedTarget(event);
					context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._isInside(event.relatedTarget);
					context._leave();
				});
			}
			this._hideModalHandler = () => {
				if (this._element) this.hide();
			};
			js_src_dom_event_handler_js.default.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
		}
		_setTipListeners(tip) {
			const trigger = this._getTrigger();
			if (trigger === TRIGGER_MANUAL || trigger.includes(TRIGGER_CLICK)) return;
			this._tipEventOut = (event) => {
				this._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = this._isInside(event.relatedTarget);
				this._leave();
			};
			for (const name of trigger.split(" ")) if (name === TRIGGER_HOVER || name === TRIGGER_FOCUS) {
				const [, eventOut] = this._getTriggerEvents(name);
				js_src_dom_event_handler_js.default.on(tip, eventOut, this._tipEventOut);
			}
		}
		_removeTipListeners(tip) {
			if (!this._tipEventOut) return;
			const trigger = this._getTrigger();
			for (const name of trigger.split(" ")) if (name === TRIGGER_HOVER || name === TRIGGER_FOCUS) {
				const [, eventOut] = this._getTriggerEvents(name);
				js_src_dom_event_handler_js.default.off(tip, eventOut, this._tipEventOut);
			}
			this._tipEventOut = null;
		}
		_isInside(element) {
			return this._element.contains(element) || Boolean(this.tip?.contains(element));
		}
		_getTrigger() {
			return this._config._trigger;
		}
		_getTriggerEvents(trigger) {
			return {
				[TRIGGER_HOVER]: [this.constructor.eventName(EVENT_MOUSEENTER), this.constructor.eventName(EVENT_MOUSELEAVE)],
				[TRIGGER_FOCUS]: [this.constructor.eventName(EVENT_FOCUSIN), this.constructor.eventName(EVENT_FOCUSOUT)]
			}[trigger];
		}
		_setEscapeListener() {
			if (this._keydownHandler) return;
			this._keydownHandler = (event) => {
				if (event.key !== ESCAPE_KEY || !this._isShown() || !this.tip.isConnected) return;
				event.preventDefault();
				event.stopPropagation();
				this.hide();
			};
			this._element.ownerDocument.addEventListener(EVENT_KEYDOWN, this._keydownHandler, true);
		}
		_removeEscapeListener() {
			if (!this._keydownHandler) return;
			this._element.ownerDocument.removeEventListener(EVENT_KEYDOWN, this._keydownHandler, true);
			this._keydownHandler = null;
		}
		_fixTitle() {
			const title = this._element.getAttribute("title");
			if (!title) return;
			if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) this._element.setAttribute("aria-label", title);
			this._element.setAttribute("data-coreui-original-title", title);
			this._element.removeAttribute("title");
		}
		_enter() {
			if (this._isShown() || this._isHovered) {
				this._isHovered = true;
				return Promise.resolve();
			}
			this._isHovered = true;
			return this._setTimeout(() => this._isHovered ? this.show() : void 0, this._config.delay.show);
		}
		_leave() {
			if (this._isWithActiveTrigger()) return Promise.resolve();
			this._isHovered = false;
			return this._setTimeout(() => this._isHovered ? void 0 : this.hide(), this._config.delay.hide);
		}
		_setTimeout(handler, timeout) {
			this._clearTimeout();
			return new Promise((resolve) => {
				this._resolveTimeout = resolve;
				this._timeout = setTimeout(() => {
					this._resolveTimeout = null;
					resolve(handler());
				}, timeout);
			});
		}
		_clearTimeout() {
			clearTimeout(this._timeout);
			if (this._resolveTimeout) {
				this._resolveTimeout();
				this._resolveTimeout = null;
			}
		}
		_isWithActiveTrigger() {
			return Object.values(this._activeTrigger).includes(true);
		}
		_configAfterMerge(config) {
			config.container = config.container === false ? document.body : (0, js_src_util_index_js.getElement)(config.container);
			config._trigger = config._trigger || config.trigger;
			if (typeof config.delay === "number") config.delay = {
				show: config.delay,
				hide: config.delay
			};
			if (typeof config.title === "number" || typeof config.title === "boolean") config.title = config.title.toString();
			if (typeof config.content === "number" || typeof config.content === "boolean") config.content = config.content.toString();
			return config;
		}
		_getDelegateConfig() {
			const config = {};
			for (const [key, value] of Object.entries(this._config)) if (this.constructor.Default[key] !== value) config[key] = value;
			config.selector = false;
			config.trigger = "manual";
			return config;
		}
		_disposeFloating() {
			if (this._floatingCleanup) {
				this._floatingCleanup();
				this._floatingCleanup = null;
			}
			if (this.tip) {
				this._removeTipListeners(this.tip);
				this.tip.remove();
				this.tip = null;
			}
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Tooltip, config, args);
		}
	};
	/**
	* Data API implementation - auto-initialize tooltips
	*/
	const initTooltip = (event) => {
		const target = event.target.closest(SELECTOR_DATA_TOGGLE);
		if (!target) return;
		Tooltip.getOrCreateInstance(target);
	};
	js_src_dom_event_handler_js.default.on(document, EVENT_FOCUSIN, SELECTOR_DATA_TOGGLE, initTooltip);
	js_src_dom_event_handler_js.default.on(document, EVENT_MOUSEENTER, SELECTOR_DATA_TOGGLE, initTooltip);
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Tooltip);
	//#endregion
	return Tooltip;
});

//# sourceMappingURL=tooltip.js.map