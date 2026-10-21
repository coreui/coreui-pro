/*!
* CoreUI PRO v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("@floating-ui/dom")) : typeof define === "function" && define.amd ? define(["exports", "@floating-ui/dom"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.coreui = Object.assign({}, global.coreui && Object.getPrototypeOf(global.coreui) === Object.prototype ? global.coreui : {}), global.FloatingUIDOM));
})(this, function(exports, _floating_ui_dom) {
	//#region js/src/dom/data.ts
	const elementMap = /* @__PURE__ */ new Map();
	var data_default = {
		set(element, key, instance) {
			if (!elementMap.has(element)) elementMap.set(element, /* @__PURE__ */ new Map());
			const instanceMap = elementMap.get(element);
			if (!instanceMap.has(key) && instanceMap.size !== 0) {
				console.error(`CoreUI doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
				return;
			}
			instanceMap.set(key, instance);
		},
		get(element, key) {
			if (elementMap.has(element)) return elementMap.get(element).get(key) || null;
			return null;
		},
		remove(element, key) {
			if (!elementMap.has(element)) return;
			const instanceMap = elementMap.get(element);
			instanceMap.delete(key);
			if (instanceMap.size === 0) elementMap.delete(element);
		}
	};
	//#endregion
	//#region js/src/util/index.ts
	const MAX_UID = 1e6;
	const MILLISECONDS_MULTIPLIER = 1e3;
	const TRANSITION_END = "transitionend";
	const parseSelector = (selector) => {
		if (selector && window.CSS && window.CSS.escape) selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
		return selector;
	};
	const toType = (object) => {
		if (object === null || object === void 0) return `${object}`;
		return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
	};
	const getUID = (prefix) => {
		do
			prefix += Math.floor(Math.random() * MAX_UID);
		while (document.getElementById(prefix));
		return prefix;
	};
	const getTransitionDurationFromElement = (element) => {
		if (!element) return 0;
		let { transitionDuration, transitionDelay } = window.getComputedStyle(element);
		if (!Number.parseFloat(transitionDuration) && !Number.parseFloat(transitionDelay)) return 0;
		transitionDuration = transitionDuration.split(",")[0];
		transitionDelay = transitionDelay.split(",")[0];
		return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
	};
	const triggerTransitionEnd = (element) => {
		element.dispatchEvent(new Event(TRANSITION_END));
	};
	const isElement = (object) => {
		if (!object || typeof object !== "object") return false;
		if (typeof object.jquery !== "undefined") object = object[0];
		return typeof object.nodeType !== "undefined";
	};
	const getElement = (object) => {
		if (isElement(object)) return object.jquery ? object[0] : object;
		if (typeof object === "string" && object.length > 0) return document.querySelector(parseSelector(object));
		return null;
	};
	const isVisible = (element) => {
		if (!isElement(element) || element.getClientRects().length === 0) return false;
		const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
		const closedDetails = element.closest("details:not([open])");
		if (!closedDetails) return elementIsVisible;
		if (closedDetails !== element) {
			const summary = element.closest("summary");
			if (summary && summary.parentNode !== closedDetails) return false;
			if (summary === null) return false;
		}
		return elementIsVisible;
	};
	const isDisabled = (element) => {
		if (!element || element.nodeType !== Node.ELEMENT_NODE) return true;
		if (element.classList.contains("disabled")) return true;
		if (typeof element.disabled !== "undefined") return element.disabled;
		return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
	};
	const setAriaAttribute = (element, name, value) => {
		element.setAttribute(name, String(value));
	};
	const writeAttribute = (element, name, value) => {
		if (element.getAttribute(name) === value) return;
		if (value === null) element.removeAttribute(name);
		else element.setAttribute(name, value);
	};
	const findShadowRoot = (element) => {
		if (!document.documentElement.attachShadow) return null;
		if (typeof element.getRootNode === "function") {
			const root = element.getRootNode();
			return root instanceof ShadowRoot ? root : null;
		}
		if (element instanceof ShadowRoot) return element;
		if (!element.parentNode) return null;
		return findShadowRoot(element.parentNode);
	};
	const noop = () => {};
	const reflow = (element) => {
		element.offsetHeight;
	};
	const getjQuery = () => {
		if (window.jQuery && !document.body.hasAttribute("data-coreui-no-jquery")) return window.jQuery;
		return null;
	};
	const DOMContentLoadedCallbacks = [];
	const onDOMContentLoaded = (callback) => {
		if (document.readyState === "loading") {
			if (!DOMContentLoadedCallbacks.length) document.addEventListener("DOMContentLoaded", () => {
				for (const callback of DOMContentLoadedCallbacks) callback();
			});
			DOMContentLoadedCallbacks.push(callback);
		} else callback();
	};
	const isRTL = (element) => {
		const target = element ?? document.documentElement;
		if (target.isConnected) return window.getComputedStyle(target).direction === "rtl";
		const declared = target.closest("[dir]");
		return declared ? declared.matches(":dir(rtl)") : window.getComputedStyle(document.documentElement).direction === "rtl";
	};
	const defineJQueryPlugin = (plugin) => {
		onDOMContentLoaded(() => {
			const $ = getjQuery();
			/* istanbul ignore if */
			if ($) {
				const name = plugin.NAME;
				const JQUERY_NO_CONFLICT = $.fn[name];
				$.fn[name] = plugin.jQueryInterface;
				$.fn[name].Constructor = plugin;
				$.fn[name].noConflict = () => {
					$.fn[name] = JQUERY_NO_CONFLICT;
					return plugin.jQueryInterface;
				};
			}
		});
	};
	const jQueryDispatch = (collection, Component, config, args = []) => {
		return collection.each(function() {
			const data = Component.getOrCreateInstance(this, config);
			if (typeof config !== "string") return;
			if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
			data[config](...typeof args === "function" ? args(this) : args);
		});
	};
	const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
		return typeof possibleCallback === "function" ? possibleCallback.call(...args) : defaultValue;
	};
	const getCoveredTransitions = (element, duration, transitionProperty) => {
		if (typeof element.getAnimations !== "function" || typeof CSSTransition === "undefined") return [];
		return element.getAnimations().filter((animation) => animation instanceof CSSTransition && animation.playState !== "finished" && (transitionProperty ? animation.transitionProperty === transitionProperty : Number(animation.effect?.getComputedTiming().endTime) <= duration));
	};
	const executeAfterTransition = (callback, transitionElement, waitForTransition = true, transitionProperty) => {
		if (!waitForTransition) {
			execute(callback);
			return;
		}
		const emulatedDuration = getTransitionDurationFromElement(transitionElement) + 5;
		const start = Date.now();
		const transitions = getCoveredTransitions(transitionElement, emulatedDuration, transitionProperty);
		let called = false;
		const finish = () => {
			if (called) return;
			called = true;
			transitionElement.removeEventListener(TRANSITION_END, handler);
			execute(callback);
		};
		const handler = (event) => {
			if (event.target !== transitionElement) return;
			const { propertyName } = event;
			if (transitionProperty && propertyName && propertyName !== transitionProperty) return;
			finish();
		};
		transitionElement.addEventListener(TRANSITION_END, handler);
		setTimeout(() => {
			const late = Date.now() - start > emulatedDuration + 16;
			const running = called || document.hidden || !late ? [] : transitions.filter((transition) => transition.playState === "running");
			if (running.length === 0) {
				if (!called) triggerTransitionEnd(transitionElement);
				return;
			}
			Promise.race(running.map((transition) => transition.finished)).then(finish, finish);
			setTimeout(finish, emulatedDuration + 1e3);
		}, emulatedDuration);
	};
	const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
		const listLength = list.length;
		let index = list.indexOf(activeElement);
		if (index === -1) return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
		index += shouldGetNext ? 1 : -1;
		if (isCycleAllowed) index = (index + listLength) % listLength;
		return list[Math.max(0, Math.min(index, listLength - 1))];
	};
	//#endregion
	//#region js/src/dom/event-handler.ts
	const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
	const stripNameRegex = /\..*/;
	const stripUidRegex = /::\d+$/;
	const eventRegistry = {};
	let uidEvent = 1;
	const customEvents = {
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	};
	const nativeEvents = /* @__PURE__ */ new Set([
		"click",
		"dblclick",
		"mouseup",
		"mousedown",
		"contextmenu",
		"mousewheel",
		"DOMMouseScroll",
		"mouseover",
		"mouseout",
		"mousemove",
		"selectstart",
		"selectend",
		"keydown",
		"keypress",
		"keyup",
		"beforeinput",
		"copy",
		"cut",
		"paste",
		"orientationchange",
		"touchstart",
		"touchmove",
		"touchend",
		"touchcancel",
		"pointerdown",
		"pointermove",
		"pointerup",
		"pointerleave",
		"pointercancel",
		"gesturestart",
		"gesturechange",
		"gestureend",
		"focus",
		"blur",
		"change",
		"input",
		"invalid",
		"reset",
		"select",
		"submit",
		"focusin",
		"focusout",
		"load",
		"unload",
		"beforeunload",
		"resize",
		"move",
		"DOMContentLoaded",
		"readystatechange",
		"error",
		"abort",
		"scroll",
		"scrollend",
		"toggle",
		"beforematch"
	]);
	function makeEventUid(element, uid) {
		return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
	}
	function getElementEvents(element) {
		const uid = makeEventUid(element);
		element.uidEvent = uid;
		eventRegistry[uid] = eventRegistry[uid] || {};
		return eventRegistry[uid];
	}
	function isMouseEventWithinTarget(event) {
		const { delegateTarget, relatedTarget } = event;
		return Boolean(relatedTarget && delegateTarget.contains(relatedTarget));
	}
	function bootstrapHandler(element, fn, handlerTypeEvent) {
		const isCustomMouseEvent = handlerTypeEvent in customEvents;
		return function handler(event) {
			const coreuiEvent = hydrateObj(event, { delegateTarget: element });
			if (isCustomMouseEvent && isMouseEventWithinTarget(coreuiEvent)) return;
			if (handler.oneOff) EventHandler.off(element, handlerTypeEvent, fn);
			return fn.apply(element, [coreuiEvent]);
		};
	}
	function bootstrapDelegationHandler(element, selector, fn, handlerTypeEvent) {
		const isCustomMouseEvent = handlerTypeEvent in customEvents;
		return function handler(event) {
			const domElements = element.querySelectorAll(selector);
			for (let { target } = event; target && target !== this; target = target.parentNode) for (const domElement of domElements) {
				if (domElement !== target) continue;
				const coreuiEvent = hydrateObj(event, { delegateTarget: target });
				if (isCustomMouseEvent && isMouseEventWithinTarget(coreuiEvent)) return;
				if (handler.oneOff) EventHandler.off(element, handlerTypeEvent, selector, fn);
				return fn.apply(target, [coreuiEvent]);
			}
		};
	}
	function findHandler(events, callable, handlerTypeEvent, delegationSelector = null) {
		return Object.values(events).find((event) => event.callable === callable && event.handlerTypeEvent === handlerTypeEvent && event.delegationSelector === delegationSelector);
	}
	function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
		const isDelegated = typeof handler === "string";
		const callable = isDelegated ? delegationFunction : handler || delegationFunction;
		const baseTypeEvent = originalTypeEvent.replace(stripNameRegex, "");
		let typeEvent = customEvents[baseTypeEvent] || baseTypeEvent;
		if (!nativeEvents.has(typeEvent)) typeEvent = originalTypeEvent;
		const handlerTypeEvent = baseTypeEvent in customEvents ? baseTypeEvent : typeEvent;
		return {
			isDelegated,
			callable,
			typeEvent,
			handlerTypeEvent
		};
	}
	function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
		if (typeof originalTypeEvent !== "string" || !element) return;
		const { isDelegated, callable, typeEvent, handlerTypeEvent } = normalizeParameters(originalTypeEvent, handler, delegationFunction);
		const events = getElementEvents(element);
		const handlers = events[typeEvent] || (events[typeEvent] = {});
		const previousFunction = findHandler(handlers, callable, handlerTypeEvent, isDelegated ? handler : null);
		if (previousFunction) {
			previousFunction.oneOff = previousFunction.oneOff && oneOff;
			return;
		}
		const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ""));
		const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable, handlerTypeEvent) : bootstrapHandler(element, callable, handlerTypeEvent);
		fn.delegationSelector = isDelegated ? handler : null;
		fn.callable = callable;
		fn.handlerTypeEvent = handlerTypeEvent;
		fn.oneOff = oneOff;
		fn.uidEvent = uid;
		handlers[uid] = fn;
		element.addEventListener(typeEvent, fn, isDelegated);
	}
	function removeHandler(element, events, typeEvent, handler) {
		element.removeEventListener(typeEvent, handler, Boolean(handler.delegationSelector));
		delete events[typeEvent][handler.uidEvent];
	}
	function removeNamespacedHandlers(element, events, typeEvent, namespace) {
		const storeElementEvent = events[typeEvent] || {};
		for (const [handlerKey, event] of Object.entries(storeElementEvent)) if (handlerKey.includes(namespace)) removeHandler(element, events, typeEvent, event);
	}
	function getTypeEvent(event) {
		event = event.replace(stripNameRegex, "");
		return customEvents[event] || event;
	}
	function trigger(element, event, args) {
		if (typeof event !== "string" || !element) return null;
		const $ = getjQuery();
		const inNamespace = event !== getTypeEvent(event);
		let jQueryEvent = null;
		let bubbles = true;
		let nativeDispatch = true;
		let defaultPrevented = false;
		if (inNamespace && $) {
			jQueryEvent = $.Event(event, args);
			$(element).trigger(jQueryEvent);
			bubbles = !jQueryEvent.isPropagationStopped();
			nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
			defaultPrevented = jQueryEvent.isDefaultPrevented();
		}
		const evt = hydrateObj(new Event(event, {
			bubbles,
			cancelable: true
		}), args);
		if (defaultPrevented) evt.preventDefault();
		if (nativeDispatch) element.dispatchEvent(evt);
		if (evt.defaultPrevented && jQueryEvent) jQueryEvent.preventDefault();
		return evt;
	}
	const EventHandler = {
		on(element, event, handler, delegationFunction) {
			addHandler(element, event, handler, delegationFunction, false);
		},
		one(element, event, handler, delegationFunction) {
			addHandler(element, event, handler, delegationFunction, true);
		},
		off(element, originalTypeEvent, handler, delegationFunction) {
			if (typeof originalTypeEvent !== "string" || !element) return;
			const { isDelegated, callable, typeEvent, handlerTypeEvent } = normalizeParameters(originalTypeEvent, handler, delegationFunction);
			const inNamespace = typeEvent !== originalTypeEvent && handlerTypeEvent !== originalTypeEvent;
			const events = getElementEvents(element);
			const storeElementEvent = events[typeEvent] || {};
			const isNamespace = originalTypeEvent.startsWith(".");
			if (typeof callable !== "undefined") {
				if (!Object.keys(storeElementEvent).length) return;
				const fn = findHandler(storeElementEvent, callable, handlerTypeEvent, isDelegated ? handler : null);
				if (fn) removeHandler(element, events, typeEvent, fn);
				return;
			}
			if (isNamespace) for (const elementEvent of Object.keys(events)) removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
			for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
				const handlerKey = keyHandlers.replace(stripUidRegex, "");
				if (event.handlerTypeEvent === handlerTypeEvent && (!inNamespace || originalTypeEvent.includes(handlerKey))) removeHandler(element, events, typeEvent, event);
			}
		},
		trigger
	};
	function hydrateObj(obj, meta = {}) {
		for (const [key, value] of Object.entries(meta)) try {
			obj[key] = value;
		} catch {
			Object.defineProperty(obj, key, {
				configurable: true,
				get() {
					return value;
				}
			});
		}
		return obj;
	}
	//#endregion
	//#region js/src/dom/manipulator.ts
	function normalizeData(value) {
		if (value === "true") return true;
		if (value === "false") return false;
		if (value === Number(value).toString()) return Number(value);
		if (value === "" || value === "null") return null;
		if (typeof value !== "string") return value;
		try {
			return JSON.parse(decodeURIComponent(value));
		} catch {
			return value;
		}
	}
	function normalizeDataKey(key) {
		return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
	}
	const Manipulator = {
		setDataAttribute(element, key, value) {
			element.setAttribute(`data-coreui-${normalizeDataKey(key)}`, value);
		},
		removeDataAttribute(element, key) {
			element.removeAttribute(`data-coreui-${normalizeDataKey(key)}`);
		},
		getDataAttributes(element) {
			if (!element) return {};
			const attributes = {};
			const coreuiKeys = Object.keys(element.dataset).filter((key) => key.startsWith("coreui") && !key.startsWith("coreuiConfig"));
			for (const key of coreuiKeys) {
				let pureKey = key.replace(/^coreui/, "");
				pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1);
				attributes[pureKey] = normalizeData(element.dataset[key]);
			}
			return attributes;
		},
		getDataAttribute(element, key) {
			return normalizeData(element.getAttribute(`data-coreui-${normalizeDataKey(key)}`));
		}
	};
	//#endregion
	//#region js/src/util/config.ts
	const DISALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set([
		"sanitize",
		"allowList",
		"sanitizeFn"
	]);
	var Config = class {
		static get Default() {
			return {};
		}
		static get DefaultType() {
			return {};
		}
		static get NAME() {
			throw new Error("You have to implement the static method \"NAME\", for each component!");
		}
		_getConfig(config) {
			config = this._mergeConfigObj(config);
			config = this._configAfterMerge(config);
			this._typeCheckConfig(config);
			return config;
		}
		_configAfterMerge(config) {
			return config;
		}
		_mergeConfigObj(config, element) {
			const jsonConfig = isElement(element) ? Manipulator.getDataAttribute(element, "config") : {};
			const markupConfig = {
				...typeof jsonConfig === "object" ? jsonConfig : {},
				...isElement(element) ? Manipulator.getDataAttributes(element) : {}
			};
			for (const key of DISALLOWED_ATTRIBUTES) delete markupConfig[key];
			return {
				...this.constructor.Default,
				...markupConfig,
				...typeof config === "object" ? config : {}
			};
		}
		_typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
			for (const [property, expectedTypes] of Object.entries(configTypes)) {
				const value = config[property];
				const valueType = isElement(value) ? "element" : toType(value);
				if (!new RegExp(expectedTypes).test(valueType)) throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
			}
		}
	};
	//#endregion
	//#region js/src/base-component.ts
	const VERSION = "6.0.0-alpha.0";
	var BaseComponent = class extends Config {
		constructor(element, config) {
			super();
			element = getElement(element);
			if (!element) return;
			this._element = element;
			this._config = this._getConfig(config);
			const existingInstance = data_default.get(this._element, this.constructor.DATA_KEY);
			if (existingInstance) existingInstance.dispose();
			data_default.set(this._element, this.constructor.DATA_KEY, this);
		}
		dispose() {
			data_default.remove(this._element, this.constructor.DATA_KEY);
			EventHandler.off(this._element, this.constructor.EVENT_KEY);
			for (const propertyName of Object.getOwnPropertyNames(this)) this[propertyName] = null;
		}
		_queueCallback(callback, element, isAnimated = true, transitionProperty) {
			return new Promise((resolve) => {
				executeAfterTransition(() => {
					if (this._element) callback();
					resolve();
				}, element, isAnimated, transitionProperty);
			});
		}
		_getConfig(config) {
			config = this._mergeConfigObj(config, this._element);
			config = this._configAfterMerge(config);
			this._typeCheckConfig(config);
			return config;
		}
		static getInstance(element) {
			return data_default.get(getElement(element), this.DATA_KEY);
		}
		static getOrCreateInstance(element, config = {}) {
			return this.getInstance(element) || new this(element, typeof config === "object" ? config : null);
		}
		static get VERSION() {
			return VERSION;
		}
		static get DATA_KEY() {
			return `coreui.${this.NAME}`;
		}
		static get EVENT_KEY() {
			return `.${this.DATA_KEY}`;
		}
		static eventName(name) {
			return `${name}${this.EVENT_KEY}`;
		}
	};
	//#endregion
	//#region js/src/dom/selector-engine.ts
	const getSelector = (element) => {
		let selector = element.getAttribute("data-coreui-target");
		if (!selector || selector === "#") {
			let hrefAttribute = element.getAttribute("href");
			if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) return null;
			if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
			selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
		}
		return selector ? selector.split(",").map((sel) => parseSelector(sel)).join(",") : null;
	};
	const SelectorEngine = {
		find(selector, element = document.documentElement) {
			return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
		},
		findOne(selector, element = document.documentElement) {
			return Element.prototype.querySelector.call(element, selector);
		},
		children(element, selector) {
			return [].concat(...element.children).filter((child) => child.matches(selector));
		},
		closest(element, selector) {
			return Element.prototype.closest.call(element, selector);
		},
		parents(element, selector) {
			const parents = [];
			let ancestor = element.parentNode.closest(selector);
			while (ancestor) {
				parents.push(ancestor);
				ancestor = ancestor.parentNode.closest(selector);
			}
			return parents;
		},
		prev(element, selector) {
			let previous = element.previousElementSibling;
			while (previous) {
				if (previous.matches(selector)) return [previous];
				previous = previous.previousElementSibling;
			}
			return [];
		},
		next(element, selector) {
			let next = element.nextElementSibling;
			while (next) {
				if (next.matches(selector)) return [next];
				next = next.nextElementSibling;
			}
			return [];
		},
		focusableChildren(element) {
			const focusables = [
				"a",
				"button",
				"input",
				"textarea",
				"select",
				"details",
				"[tabindex]",
				"[contenteditable=\"true\"]"
			].map((selector) => `${selector}:not([tabindex^="-"])`).join(",");
			return this.find(focusables, element).filter((el) => !isDisabled(el) && isVisible(el));
		},
		getSelectorFromElement(element) {
			const selector = getSelector(element);
			if (selector) return SelectorEngine.findOne(selector) ? selector : null;
			return null;
		},
		getElementFromSelector(element) {
			const selector = getSelector(element);
			return selector ? SelectorEngine.findOne(selector) : null;
		},
		getMultipleElementsFromSelector(element) {
			const selector = getSelector(element);
			return selector ? SelectorEngine.find(selector) : [];
		}
	};
	//#endregion
	//#region js/src/util/size-transition.ts
	const supportsInterpolateSize = () => typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("interpolate-size", "allow-keywords");
	const startSizeTransition = (element, property, from, to) => {
		element.style.transition = "none";
		element.style[property] = `${from}px`;
		reflow(element);
		element.style.transition = "";
		element.style[property] = `${to}px`;
	};
	//#endregion
	//#region js/src/accordion.ts
	const NAME$53 = "accordion";
	const EVENT_KEY$44 = `.coreui.accordion`;
	const DATA_API_KEY$35 = ".data-api";
	const EVENT_SHOWN$7 = `shown${EVENT_KEY$44}`;
	const EVENT_HIDDEN$10 = `hidden${EVENT_KEY$44}`;
	const EVENT_CLICK_DATA_API$19 = `click${EVENT_KEY$44}${DATA_API_KEY$35}`;
	const EVENT_TOGGLE_DATA_API = `toggle${EVENT_KEY$44}${DATA_API_KEY$35}`;
	const ATTRIBUTE_ANIMATING = "data-coreui-accordion-animating";
	const ATTRIBUTE_NAME = "data-coreui-accordion-name";
	const SELECTOR_ACCORDION = ".accordion";
	const SELECTOR_HEADER$2 = ".accordion-header";
	const SELECTOR_INTERACTIVE$1 = "a, button, input, select, textarea";
	const SELECTOR_ITEM$1 = "details.accordion-item";
	var Accordion = class Accordion extends BaseComponent {
		static get NAME() {
			return NAME$53;
		}
		toggle(item) {
			const details = this._resolve(item);
			if (!details) return Promise.resolve();
			return details.open ? this.hide(details) : this.show(details);
		}
		async show(item) {
			const details = this._resolve(item);
			if (!details || details.open || details.hasAttribute(ATTRIBUTE_ANIMATING)) return;
			this._hideSiblings(details);
			const from = this._collapsedSize(details);
			details.open = true;
			await this._animate(details, from, details.getBoundingClientRect().height);
		}
		async hide(item) {
			const details = this._resolve(item);
			if (!details || !details.open || details.hasAttribute(ATTRIBUTE_ANIMATING)) return;
			const from = details.getBoundingClientRect().height;
			await this._animate(details, from, this._collapsedSize(details), () => {
				details.open = false;
			});
		}
		async showAll() {
			const items = this._items();
			for (const item of items) if (item.name) {
				item.setAttribute(ATTRIBUTE_NAME, item.name);
				item.removeAttribute("name");
			}
			await Promise.all(items.map((item) => this.show(item)));
		}
		async hideAll() {
			const items = this._items();
			await Promise.all(items.map((item) => this.hide(item)));
			for (const item of items) {
				const name = item.getAttribute(ATTRIBUTE_NAME);
				if (name !== null) {
					item.setAttribute("name", name);
					item.removeAttribute(ATTRIBUTE_NAME);
				}
			}
		}
		dispose() {
			for (const item of this._items()) {
				item.style.blockSize = "";
				item.removeAttribute(ATTRIBUTE_ANIMATING);
			}
			super.dispose();
		}
		_items() {
			return SelectorEngine.children(this._element, SELECTOR_ITEM$1);
		}
		_resolve(item) {
			if (typeof item === "number") return this._items()[item] || null;
			return this._items().find((candidate) => candidate === item) || null;
		}
		_collapsedSize(details) {
			const header = SelectorEngine.findOne(SELECTOR_HEADER$2, details);
			const styles = window.getComputedStyle(details);
			const around = [
				styles.borderBlockStartWidth,
				styles.borderBlockEndWidth,
				styles.paddingBlockStart,
				styles.paddingBlockEnd
			].reduce((total, value) => total + (Number.parseFloat(value) || 0), 0);
			return (header ? header.getBoundingClientRect().height : 0) + around;
		}
		_hideSiblings(details) {
			const { name } = details;
			if (!name) return;
			const siblings = SelectorEngine.find(`details[name="${CSS.escape(name)}"][open]`).filter((element) => element !== details);
			for (const sibling of siblings) {
				const container = sibling.closest(SELECTOR_ACCORDION);
				if (container) Accordion.getOrCreateInstance(container).hide(sibling);
			}
		}
		async _animate(details, from, to, onFinish) {
			if (supportsInterpolateSize()) {
				onFinish?.();
				return;
			}
			details.setAttribute(ATTRIBUTE_ANIMATING, "");
			startSizeTransition(details, "blockSize", from, to);
			await this._queueCallback(() => {
				onFinish?.();
				details.style.blockSize = "";
				details.removeAttribute(ATTRIBUTE_ANIMATING);
			}, details, true);
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, Accordion, config, args);
		}
	};
	EventHandler.on(document, EVENT_TOGGLE_DATA_API, SELECTOR_ITEM$1, function() {
		EventHandler.trigger(this, this.open ? EVENT_SHOWN$7 : EVENT_HIDDEN$10);
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$19, (event) => {
		if (supportsInterpolateSize() || event.defaultPrevented) return;
		const target = event.target;
		const header = target.closest(`${SELECTOR_ITEM$1} > ${SELECTOR_HEADER$2}`);
		if (!header) return;
		if (target !== header && target.closest(SELECTOR_INTERACTIVE$1)) return;
		const item = header.parentElement;
		const container = item.closest(SELECTOR_ACCORDION);
		if (!container) return;
		event.preventDefault();
		Accordion.getOrCreateInstance(container).toggle(item);
	});
	defineJQueryPlugin(Accordion);
	//#endregion
	//#region js/src/util/component-functions.ts
	const enableDismissTrigger = (component, method = "hide", closestSelector) => {
		const clickEvent = `click.dismiss${component.EVENT_KEY}`;
		const name = component.NAME;
		EventHandler.on(document, clickEvent, `[data-coreui-dismiss="${name}"]`, function(event) {
			if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
			if (isDisabled(this)) return;
			const target = SelectorEngine.getElementFromSelector(this) || this.closest(closestSelector ?? `.${name}`);
			component.getOrCreateInstance(target)[method]();
		});
	};
	//#endregion
	//#region js/src/alert.ts
	const NAME$52 = "alert";
	const EVENT_KEY$43 = `.coreui.alert`;
	const EVENT_CLOSE = `close${EVENT_KEY$43}`;
	const EVENT_CLOSED = `closed${EVENT_KEY$43}`;
	const CLASS_NAME_HIDING$2 = "hiding";
	const CLASS_NAME_SHOW$16 = "show";
	var Alert = class Alert extends BaseComponent {
		static get NAME() {
			return NAME$52;
		}
		async close() {
			if (EventHandler.trigger(this._element, EVENT_CLOSE).defaultPrevented) return;
			this._element.classList.remove(CLASS_NAME_SHOW$16);
			this._element.classList.add(CLASS_NAME_HIDING$2);
			const isAnimated = getTransitionDurationFromElement(this._element) > 0;
			await this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
		}
		_destroyElement() {
			this._element.remove();
			EventHandler.trigger(this._element, EVENT_CLOSED);
			this.dispose();
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Alert, config, (element) => [element]);
		}
	};
	enableDismissTrigger(Alert, "close");
	defineJQueryPlugin(Alert);
	//#endregion
	//#region js/src/util/announce.ts
	const ATTRIBUTE = "data-coreui-live-announcer";
	const CLASS_NAME_HIDING$1 = "hiding";
	const CLOSE_DELAY = 500;
	const FIRST_MESSAGE_DELAY = 100;
	const VISUALLY_HIDDEN = {
		border: "0",
		clip: "rect(0 0 0 0)",
		clipPath: "inset(50%)",
		height: "1px",
		margin: "-1px",
		overflow: "hidden",
		padding: "0",
		position: "absolute",
		whiteSpace: "nowrap",
		width: "1px"
	};
	const holds = /* @__PURE__ */ new WeakMap();
	const readyAt = /* @__PURE__ */ new WeakMap();
	const pending = [];
	const isModal = (element) => {
		if (element.matches("dialog[open]")) return element.matches(":modal");
		return element.matches("[aria-modal=\"true\"]") && element.isConnected && (typeof element.checkVisibility !== "function" || element.checkVisibility());
	};
	const getDialogAround = (element) => {
		let node = element;
		while (node) {
			if (isModal(node)) return node;
			node = node.assignedSlot ?? node.parentElement ?? node.getRootNode().host ?? null;
		}
		return null;
	};
	const getModal = (context) => {
		let focused = document.activeElement;
		while (focused?.shadowRoot?.activeElement) focused = focused.shadowRoot.activeElement;
		const modals = [...document.querySelectorAll("dialog[open], [aria-modal=\"true\"]")].filter(isModal);
		return getDialogAround(focused) ?? getDialogAround(context) ?? modals.at(-1) ?? null;
	};
	const readTime = (times, element) => {
		const [time, clock] = times.get(element) ?? [0, null];
		return clock === performance.now ? time : 0;
	};
	const getMoment = (delay) => [performance.now() + delay, performance.now];
	const getAnnouncer = (host) => {
		const existing = host.querySelector(`:scope > [${ATTRIBUTE}]`);
		if (existing) {
			if (!readyAt.has(existing)) readyAt.set(existing, getMoment(FIRST_MESSAGE_DELAY));
			return existing;
		}
		const announcer = document.createElement("div");
		announcer.setAttribute(ATTRIBUTE, "");
		Object.assign(announcer.style, VISUALLY_HIDDEN);
		for (const live of ["assertive", "polite"]) {
			const region = document.createElement("div");
			region.setAttribute("role", "log");
			region.setAttribute("aria-live", live);
			region.setAttribute("aria-relevant", "additions");
			announcer.append(region);
		}
		if (host === document.body) host.prepend(announcer);
		else {
			const onClose = (event) => {
				if (event.target === host && !host.open) {
					announcer.remove();
					host.removeEventListener("close", onClose);
				}
			};
			host.append(announcer);
			host.addEventListener("close", onClose);
		}
		readyAt.set(announcer, getMoment(FIRST_MESSAGE_DELAY));
		return announcer;
	};
	const holdAnnouncements = () => {
		if (typeof document === "undefined") return;
		holds.set(getModal(null) ?? document.body, getMoment(CLOSE_DELAY));
		if (pending.length > 0) setTimeout(flush, CLOSE_DELAY);
	};
	const flush = () => {
		if (typeof document === "undefined") {
			pending.length = 0;
			return;
		}
		const sent = [];
		while (pending.length > 0) {
			const [{ context, page }] = pending;
			if (page && !page.isConnected) {
				pending.shift();
				continue;
			}
			const modal = getModal(context);
			if (modal?.classList.contains(CLASS_NAME_HIDING$1) || document.activeElement?.closest(`dialog.${CLASS_NAME_HIDING$1}`)) {
				setTimeout(flush, CLOSE_DELAY);
				break;
			}
			const host = modal ?? document.body;
			const announcer = getAnnouncer(host);
			const wait = Math.max(readTime(holds, host), readTime(readyAt, announcer)) - performance.now();
			if (wait > 0) {
				setTimeout(flush, wait);
				break;
			}
			sent.push([pending.shift(), announcer]);
		}
		const loud = new Set(sent.filter(([{ priority }]) => priority === "high").map(([, announcer]) => announcer));
		sent.sort(([first], [second]) => Number(second.priority === "high") - Number(first.priority === "high"));
		for (const [{ node, timeout }, announcer] of sent) {
			announcer.querySelector(`[aria-live="${loud.has(announcer) ? "assertive" : "polite"}"]`).append(node);
			if (timeout > 0 && Number.isFinite(timeout)) setTimeout(() => node.remove(), timeout);
		}
	};
	const announce = (message, { context = null, priority = "normal", timeout = 7e3 } = {}) => {
		if (typeof document === "undefined" || !document.body || !message) return () => {};
		const node = document.createElement("div");
		node.textContent = message;
		const modal = getModal(context);
		const host = modal && !modal.classList.contains(CLASS_NAME_HIDING$1) ? modal : document.body;
		const announcer = getAnnouncer(host);
		pending.push({
			context,
			node,
			page: host === document.body ? announcer : null,
			priority,
			timeout
		});
		setTimeout(flush, Math.max(0, readTime(readyAt, announcer) - performance.now()));
		return () => {
			const index = pending.findIndex((message) => message.node === node);
			if (index !== -1) pending.splice(index, 1);
			node.remove();
		};
	};
	//#endregion
	//#region js/src/util/list-navigation.ts
	const createTypeaheadBuffer = (timeout = 500) => {
		let text = "";
		let timer;
		return {
			clear() {
				clearTimeout(timer);
				text = "";
			},
			push(key) {
				if (key?.length !== 1 || key === " ") return null;
				clearTimeout(timer);
				text += key.toLowerCase();
				timer = setTimeout(() => {
					text = "";
				}, timeout);
				return text;
			}
		};
	};
	const findTypeaheadMatch = (items, current, text, textOf) => {
		const needle = text.toLowerCase();
		const start = needle.length > 1 ? Math.max(current, 0) : current + 1;
		return [...items.slice(start), ...items.slice(0, start)].find((item) => textOf(item).trim().toLowerCase().startsWith(needle));
	};
	const rangeBetween = (items, from, to) => {
		if (to === -1) return [];
		const start = from === -1 ? to : from;
		return items.slice(Math.min(start, to), Math.max(start, to) + 1);
	};
	const getRemovalNeighbor = (list, item) => {
		const index = list.indexOf(item);
		return list[index + 1] ?? list[index - 1] ?? null;
	};
	const isTypingKey = (event) => {
		if (typeof event.key !== "string" || event.isComposing || event.metaKey || event.ctrlKey && !event.altKey) return false;
		return [
			"Backspace",
			"Dead",
			"Delete"
		].includes(event.key) || event.key.length === 1 && event.key !== " ";
	};
	const DefaultAllowlist = {
		"*": [
			"class",
			"dir",
			"id",
			"lang",
			"role",
			/^aria-[\w-]*$/i
		],
		a: [
			"target",
			"href",
			"title",
			"rel"
		],
		area: [],
		b: [],
		br: [],
		col: [],
		code: [],
		dd: [],
		div: [],
		dl: [],
		dt: [],
		em: [],
		hr: [],
		h1: [],
		h2: [],
		h3: [],
		h4: [],
		h5: [],
		h6: [],
		i: [],
		img: [
			"src",
			"srcset",
			"alt",
			"title",
			"width",
			"height"
		],
		li: [],
		ol: [],
		p: [],
		pre: [],
		s: [],
		small: [],
		span: [],
		sub: [],
		sup: [],
		strong: [],
		u: [],
		ul: []
	};
	const SVGAllowlist = {
		...DefaultAllowlist,
		svg: [
			"id",
			"class",
			"xmlns",
			"version",
			"baseprofile",
			"width",
			"height",
			"viewbox",
			"preserveaspectratio",
			"aria-hidden",
			"role",
			"focusable",
			"fill",
			"stroke",
			"stroke-width",
			"stroke-linecap",
			"stroke-linejoin"
		],
		g: [
			"id",
			"class",
			"transform",
			"style"
		],
		path: [
			"id",
			"class",
			"d",
			"fill",
			"fill-opacity",
			"fill-rule",
			"stroke",
			"stroke-width",
			"stroke-linecap",
			"stroke-linejoin",
			"stroke-miterlimit",
			"stroke-dasharray",
			"stroke-dashoffset",
			"stroke-opacity"
		],
		circle: [
			"id",
			"class",
			"cx",
			"cy",
			"r",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		rect: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"rx",
			"ry",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		ellipse: [
			"id",
			"class",
			"cx",
			"cy",
			"rx",
			"ry",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		line: [
			"id",
			"class",
			"x1",
			"y1",
			"x2",
			"y2",
			"stroke",
			"stroke-width",
			"stroke-linecap",
			"stroke-opacity"
		],
		polygon: [
			"id",
			"class",
			"points",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		polyline: [
			"id",
			"class",
			"points",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		text: [
			"id",
			"class",
			"x",
			"y",
			"dx",
			"dy",
			"text-anchor",
			"font-family",
			"font-size",
			"font-weight",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		tspan: [
			"id",
			"class",
			"x",
			"y",
			"dx",
			"dy",
			"text-anchor",
			"font-family",
			"font-size",
			"font-weight",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		defs: [],
		symbol: [
			"id",
			"class",
			"viewbox",
			"preserveaspectratio"
		],
		use: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"href",
			"xlink:href"
		],
		image: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"href",
			"preserveaspectratio",
			"xlink:href"
		],
		pattern: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"patternunits",
			"patterncontentunits",
			"patterntransform",
			"preserveaspectratio"
		],
		lineargradient: [
			"id",
			"class",
			"gradientunits",
			"x1",
			"y1",
			"x2",
			"y2",
			"spreadmethod",
			"gradienttransform"
		],
		radialgradient: [
			"id",
			"class",
			"gradientunits",
			"cx",
			"cy",
			"r",
			"fx",
			"fy",
			"spreadmethod",
			"gradienttransform"
		],
		mask: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"maskunits",
			"maskcontentunits",
			"masktransform"
		],
		clippath: [
			"id",
			"class",
			"clippathunits"
		],
		marker: [
			"id",
			"class",
			"markerunits",
			"markerwidth",
			"markerheight",
			"orient",
			"preserveaspectratio",
			"viewbox",
			"refx",
			"refy"
		],
		title: [],
		desc: []
	};
	const ESCAPE_HTML_MAP = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#x27;"
	};
	function escapeHtml(unsafeText) {
		return String(unsafeText).replace(/[&<>"']/g, (character) => ESCAPE_HTML_MAP[character]);
	}
	const uriAttributes = /* @__PURE__ */ new Set([
		"background",
		"cite",
		"href",
		"itemtype",
		"longdesc",
		"poster",
		"src",
		"xlink:href"
	]);
	const SAFE_URL_PATTERN = /^(?!(?:javascript|data|vbscript):)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
	const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z=]+$/i;
	const allowedAttribute = (attribute, allowedAttributeList) => {
		const attributeName = attribute.nodeName.toLowerCase();
		if (allowedAttributeList.includes(attributeName)) {
			if (uriAttributes.has(attributeName)) return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue) || DATA_URL_PATTERN.test(attribute.nodeValue));
			return true;
		}
		return allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName));
	};
	function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
		if (!unsafeHtml.length) return unsafeHtml;
		if (sanitizeFunction && typeof sanitizeFunction === "function") return sanitizeFunction(unsafeHtml);
		const createdDocument = new window.DOMParser().parseFromString(unsafeHtml, "text/html");
		const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
		for (const element of elements) {
			const elementName = element.nodeName.toLowerCase();
			if (!Object.keys(allowList).includes(elementName)) {
				element.remove();
				continue;
			}
			const attributeList = [].concat(...element.attributes);
			const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
			for (const attribute of attributeList) if (!allowedAttribute(attribute, allowedAttributes)) element.removeAttribute(attribute.nodeName);
		}
		return createdDocument.body.innerHTML;
	}
	function sanitizeByConfig(unsafeHtml, config) {
		return config.sanitize ? sanitizeHtml(unsafeHtml, config.allowList ?? DefaultAllowlist, config.sanitizeFn) : unsafeHtml;
	}
	//#endregion
	//#region js/src/util/option-tree.ts
	const isOptionGroup = (option) => typeof option === "object" && option !== null && Array.isArray(option.options);
	const flattenOptions = (options) => options.flatMap((option) => isOptionGroup(option) ? flattenOptions(option.options) : [option]);
	const getOptionLabel = (option) => typeof option === "string" ? option : option.label ?? "";
	const getOptionValue = (option) => typeof option === "string" ? option : String(option.value ?? option.label ?? "");
	const isOptionDisabled = (option) => typeof option !== "string" && Boolean(option.disabled);
	const getSelectableOptions = (options) => flattenOptions(options).filter((option) => !isOptionDisabled(option));
	const findOptionByValue = (options, value) => flattenOptions(options).find((option) => getOptionValue(option) === String(value)) ?? null;
	const normalizeSearchText = (text, foldAccents = false) => {
		const lowercase = text.trim().toLowerCase();
		return foldAccents ? lowercase.normalize("NFD").replaceAll(/(?=\p{Diacritic})\p{M}/gu, "") : lowercase;
	};
	const filterOptionTree = (options, query, foldAccents = false) => {
		const needle = normalizeSearchText(query, foldAccents);
		const filter = (list) => list.flatMap((option) => {
			if (isOptionGroup(option)) {
				const matched = filter(option.options);
				return matched.length > 0 ? {
					...option,
					options: matched
				} : [];
			}
			return normalizeSearchText(getOptionLabel(option), foldAccents).includes(needle) ? option : [];
		});
		return filter(options);
	};
	const highlightMatches = (label, query) => {
		const needle = query?.trim();
		if (!needle) return escapeHtml(label);
		const pattern = new RegExp(`(${needle.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
		return String(label).split(pattern).map((part, index) => index % 2 === 0 ? escapeHtml(part) : `<strong>${escapeHtml(part)}</strong>`).join("");
	};
	//#endregion
	//#region js/src/util/selection-state.ts
	const toSelectionValues = (value, mode) => {
		if (mode === "none" || value === null || value === void 0) return [];
		const values = Array.isArray(value) ? [...value] : [value];
		return mode === "single" ? values.slice(0, 1) : values;
	};
	const getSelectionLimit = (multiple, limit) => multiple && typeof limit === "number" ? limit : null;
	const isSelectionLimitReached = (count, limit) => limit !== null && limit !== void 0 && count >= limit;
	const getSelectionState = (selected, total, limit) => {
		const target = limit === null || limit === void 0 ? total : Math.min(total, limit);
		if (target > 0 && selected >= target) return "all";
		return selected > 0 ? "some" : "none";
	};
	const getScopeSelectionState = (selected, total, selectedOverall, limit) => getSelectionState(selected, total, limit === null || limit === void 0 ? null : limit - selectedOverall + selected);
	const getAriaPressed = (state) => {
		if (state === "all") return "true";
		return state === "some" ? "mixed" : "false";
	};
	const fillSelection = (selected, candidates, limit) => {
		const present = new Set(selected);
		const values = [...selected];
		const added = [];
		for (const value of candidates) {
			if (present.has(value)) continue;
			if (limit !== null && limit !== void 0 && values.length >= limit) return {
				added,
				refused: value,
				values
			};
			present.add(value);
			values.push(value);
			added.push(value);
		}
		return {
			added,
			refused: null,
			values
		};
	};
	const createSelectionStore = (fit = (next) => next) => {
		let selected = [];
		let present = /* @__PURE__ */ new Set();
		return {
			commit(next) {
				const values = [...new Set(fit([...next], selected))];
				const changed = values.length !== selected.length || values.some((value, index) => value !== selected[index]);
				if (changed) {
					selected = values;
					present = new Set(values);
				}
				return changed;
			},
			has: (value) => present.has(value),
			size: () => selected.length,
			values: () => [...selected]
		};
	};
	const resolveCountLabel = (label, count, total) => typeof label === "function" ? label(count, total) : label.replaceAll("{count}", String(count)).replaceAll("{total}", String(total));
	//#endregion
	//#region js/src/list-box.ts
	const NAME$51 = "list-box";
	const EVENT_KEY$42 = `.coreui.list-box`;
	const DATA_API_KEY$34 = ".data-api";
	const ARROW_UP_KEY$7 = "ArrowUp";
	const ARROW_DOWN_KEY$11 = "ArrowDown";
	const HOME_KEY$6 = "Home";
	const END_KEY$6 = "End";
	const ENTER_KEY$6 = "Enter";
	const SPACE_KEY$3 = " ";
	const A_KEY$1 = "a";
	const EVENT_ACTION = "action";
	const EVENT_ACTIVATE$1 = "activate";
	const EVENT_CHANGE$11 = "change";
	const EVENT_DESELECT$1 = "deselect";
	const EVENT_DESELECTED$1 = "deselected";
	const EVENT_SEARCH$3 = "search";
	const EVENT_SELECT$2 = "select";
	const EVENT_SELECTED$1 = "selected";
	const EVENT_SELECTION_LIMIT$2 = "selectionLimit";
	const EVENT_CLICK$14 = "click";
	const EVENT_FOCUSIN$8 = "focusin";
	const EVENT_FOCUSOUT$4 = "focusout";
	const EVENT_INPUT$12 = "input";
	const EVENT_KEYDOWN$18 = "keydown";
	const CLASS_NAME_ACTIVE$9 = "active";
	const CLASS_NAME_CHECK = "check";
	const CLASS_NAME_DISABLED$11 = "disabled";
	const CLASS_NAME_FORM_CONTROL$2 = "form-control";
	const CLASS_NAME_HEADER$1 = "list-box-header";
	const CLASS_NAME_INDETERMINATE$1 = "indeterminate";
	const CLASS_NAME_LOADING = "loading";
	const CLASS_NAME_LOADING_REGION = "list-box-loading";
	const CLASS_NAME_OPTION = "list-box-option";
	const CLASS_NAME_OPTION_DESCRIPTION = "list-box-option-description";
	const CLASS_NAME_OPTION_INDICATOR = "list-box-option-indicator";
	const CLASS_NAME_OPTION_LABEL = "list-box-option-label";
	const CLASS_NAME_OPTIONS$3 = "list-box-options";
	const CLASS_NAME_SEARCH$2 = "list-box-search";
	const CLASS_NAME_SECTION$1 = "list-box-section";
	const CLASS_NAME_SECTION_LABEL = "list-box-section-label";
	const CLASS_NAME_SUBTITLE = "list-box-subtitle";
	const CLASS_NAME_SELECTED$2 = "selected";
	const SELECTOR_DATA_LIST_BOX = "[data-coreui-list-box]";
	const SELECTOR_COUNTER = "[data-coreui-list-box-counter]";
	const SELECTOR_EMPTY = ".list-box-empty";
	const SELECTOR_HEADER$1 = ".list-box-header";
	const SELECTOR_OPTION$4 = ".list-box-option";
	const SELECTOR_OPTION_INDICATOR = ".list-box-option-indicator";
	const SELECTOR_OPTION_LABEL$1 = ".list-box-option-label";
	const SELECTOR_OPTIONS$2 = ".list-box-options";
	const SELECTOR_SEARCH$3 = "[data-coreui-list-box-search]";
	const SELECTOR_SECTION$3 = ".list-box-section";
	const SELECTOR_SECTION_LABEL = ".list-box-section-label";
	const SELECTOR_SECTION_TOGGLE = "[data-coreui-section-toggle]";
	const SELECTOR_SELECT_ALL$2 = "[data-coreui-select-all]";
	const ATTRIBUTE_INDICATOR = "data-coreui-indicator";
	const ATTRIBUTE_SECTION_TOGGLE = "data-coreui-section-toggle";
	const INDICATOR_CHECKBOX = "checkbox";
	const SEARCH_EXTERNAL = "external";
	const SELECTION_MODE_MULTIPLE = "multiple";
	const SELECTION_MODE_NONE = "none";
	const SELECTION_MODE_SINGLE$1 = "single";
	const Default$45 = {
		activeDescendant: null,
		allowList: DefaultAllowlist,
		ariaSearchLabel: "Search options",
		counter: false,
		disabled: false,
		html: false,
		indicator: "none",
		items: [],
		loading: false,
		loadingLabel: "Loading…",
		resetSelectionOnItemsChange: false,
		sanitize: true,
		sanitizeFn: null,
		search: false,
		searchNormalize: false,
		searchPlaceholder: "Search",
		sectionsSelectable: false,
		selected: null,
		selectedLabel: (count, total) => `${count}/${total} selected`,
		selectionLimit: null,
		selectionMode: SELECTION_MODE_SINGLE$1,
		typeahead: true
	};
	const DefaultType$44 = {
		activeDescendant: "(string|element|null)",
		allowList: "object",
		ariaSearchLabel: "string",
		counter: "boolean",
		disabled: "boolean",
		html: "boolean",
		indicator: "string",
		items: "array",
		loading: "boolean",
		loadingLabel: "string",
		resetSelectionOnItemsChange: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		search: "(boolean|string)",
		searchNormalize: "boolean",
		searchPlaceholder: "string",
		sectionsSelectable: "boolean",
		selected: "(string|array|null)",
		selectedLabel: "(string|function)",
		selectionLimit: "(null|number)",
		selectionMode: "string",
		typeahead: "boolean"
	};
	var ListBox = class ListBox extends BaseComponent {
		constructor(element, config, store) {
			super(element, config);
			this._active = null;
			this._anchor = null;
			this._createdNodes = [];
			this._disabledSections = /* @__PURE__ */ new WeakSet();
			this._field = getElement(this._config.activeDescendant);
			this._items = this._config.items.length > 0 ? this._normalizeItems(this._config.items) : null;
			this._focused = false;
			this._limited = null;
			this._hostListNodes = null;
			this._list = this._resolveList();
			this._loadingAnnouncement = null;
			this._counter = this._resolveCounter();
			this._loadingRegion = this._createLoadingRegion();
			this._query = null;
			this._searchField = this._resolveSearch();
			this._selectAll = SelectorEngine.findOne(SELECTOR_SELECT_ALL$2, this._element);
			this._store = store ?? createSelectionStore((next) => this._fit(next));
			this._typeaheadBuffer = createTypeaheadBuffer();
			this._render();
			this._store.commit([...this._store.values(), ...this._initialSelection()]);
			this._addEventListeners();
			this.update();
		}
		static get Default() {
			return Default$45;
		}
		static get DefaultType() {
			return DefaultType$44;
		}
		static get NAME() {
			return NAME$51;
		}
		select(value) {
			this._limited = null;
			if (this._selectValue(value)) {
				this._anchor = value;
				this._triggerChange();
			}
			this._reportLimit();
		}
		deselect(value) {
			if (this._deselectValue(value)) this._triggerChange();
		}
		toggle(value) {
			if (this._store.has(value)) {
				this.deselect(value);
				return;
			}
			this.select(value);
		}
		selectAll(values) {
			if (this._config.selectionMode !== SELECTION_MODE_MULTIPLE) return;
			const scope = values ?? this._navigableOptions().map((option) => this._optionValue(option));
			let changed = false;
			this._limited = null;
			for (const value of scope) changed = this._selectValue(value) || changed;
			if (changed) this._triggerChange();
			this._reportLimit();
		}
		clear() {
			const values = this.getSelectedValues();
			let changed = false;
			for (const value of values) changed = this._deselectValue(value) || changed;
			if (changed) this._triggerChange();
		}
		getSelectedValues() {
			return this._store.values();
		}
		setItems(items) {
			const previous = this.getSelectedValues();
			const previousValues = new Set(this._allOptions().map((option) => this._optionValue(option)));
			this._items = this._normalizeItems(items);
			this._render();
			const values = new Set(this._allOptions().map((option) => this._optionValue(option)));
			const reset = this._config.resetSelectionOnItemsChange && (values.size !== previousValues.size || [...values].some((value) => !previousValues.has(value)));
			const marked = this._flatItems().filter((item) => item.selected).map((item) => item.value);
			const { refused, values: filled } = fillSelection(reset ? [] : previous, marked, this._selectionLimit());
			this._anchor = null;
			this._store.commit(filled);
			this.update();
			if (this._store.size() !== previous.length || previous.some((value) => !this._store.has(value))) this._triggerChange();
			if (!this._config) return;
			this._limited = refused;
			this._reportLimit();
		}
		getItems() {
			return this._items ?? [];
		}
		setLoading(loading) {
			this._config.loading = loading;
			this.update();
		}
		filter(query) {
			this._query = query === null ? null : normalizeSearchText(query, this._config.searchNormalize);
			if (this._query === null) for (const element of [...this._allOptions(), ...SelectorEngine.find(SELECTOR_SECTION$3, this._list)]) element.removeAttribute("hidden");
			this.update();
		}
		setActive(value) {
			this._setActive(value, false);
		}
		getActive() {
			return this._active;
		}
		next() {
			this._move(true);
		}
		prev() {
			this._move(false);
		}
		first() {
			this._moveToEdge(0);
		}
		last() {
			this._moveToEdge(-1);
		}
		focusActive() {
			if (this._field) return;
			const option = this._activeOption() ?? this._navigable()[0];
			if (option) {
				this._setActive(this._optionValue(option), false);
				option.focus();
			}
		}
		update() {
			this._list.setAttribute("role", "listbox");
			this._decorateSearch();
			this._filter();
			this._updateListAttributes();
			for (const section of SelectorEngine.find(SELECTOR_SECTION$3, this._list)) {
				section.setAttribute("role", "group");
				this._decorateSection(section);
			}
			if (this._active !== null && !this._navigable().some((element) => this._optionValue(element) === this._active)) this._active = null;
			this._updateOptions();
			this._updateSections();
			this._updateSelectAll();
			this._updateCounter();
			this._updateActiveDescendant();
		}
		dispose() {
			this._typeaheadBuffer.clear();
			for (const label of SelectorEngine.find(SELECTOR_SECTION_TOGGLE, this._list)) if (this._disabledSections.has(label)) label.removeAttribute("aria-disabled");
			this._element.removeAttribute(ATTRIBUTE_INDICATOR);
			this._element.classList.remove(CLASS_NAME_LOADING);
			this._loadingAnnouncement?.();
			if (this._hostListNodes) this._list.replaceChildren(...this._hostListNodes);
			for (const node of this._createdNodes) node.remove();
			EventHandler.off(this._list, EVENT_KEY$42);
			if (this._field) {
				EventHandler.off(this._field, EVENT_KEY$42);
				this._field.removeAttribute("aria-activedescendant");
				this._field.removeAttribute("aria-controls");
			}
			super.dispose();
		}
		_updateListAttributes() {
			if (this._config.indicator === INDICATOR_CHECKBOX) this._element.setAttribute(ATTRIBUTE_INDICATOR, INDICATOR_CHECKBOX);
			if (this._config.selectionMode === SELECTION_MODE_MULTIPLE) this._list.setAttribute("aria-multiselectable", "true");
			else this._list.removeAttribute("aria-multiselectable");
			if (this._config.disabled) this._list.setAttribute("aria-disabled", "true");
			else this._list.removeAttribute("aria-disabled");
			this._element.classList.toggle(CLASS_NAME_LOADING, this._config.loading);
			if (this._config.loading) this._list.setAttribute("aria-busy", "true");
			else this._list.removeAttribute("aria-busy");
			this._loadingRegion.hidden = !this._config.loading;
			this._syncLoadingAnnouncement();
		}
		_syncLoadingAnnouncement() {
			const loading = this._config.loading && this._element.isConnected;
			if (loading === Boolean(this._loadingAnnouncement)) return;
			this._loadingAnnouncement?.();
			this._loadingAnnouncement = loading ? announce(this._config.loadingLabel, { context: this._element }) : null;
		}
		_createLoadingRegion() {
			const region = document.createElement("div");
			const spinner = document.createElement("span");
			region.className = CLASS_NAME_LOADING_REGION;
			spinner.className = "spinner-border spinner-border-sm";
			spinner.setAttribute("aria-hidden", "true");
			region.append(spinner, this._config.loadingLabel);
			if (this._list !== this._element) this._list.after(region);
			this._createdNodes.push(region);
			return region;
		}
		_updateOptions() {
			const roving = this._rovingStop();
			for (const option of this._allOptions()) {
				option.setAttribute("role", "option");
				if (this._field && !option.id) option.id = getUID(`${NAME$51}-option-`);
				const value = this._optionValue(option);
				this._decorateOption(option);
				if (this._config.selectionMode === SELECTION_MODE_NONE) option.removeAttribute("aria-selected");
				else option.setAttribute("aria-selected", String(this._store.has(value)));
				option.classList.toggle(CLASS_NAME_SELECTED$2, this._store.has(value));
				option.classList.toggle(CLASS_NAME_ACTIVE$9, value === this._active && (this._focused || Boolean(this._field)));
				if (this._field) {
					option.removeAttribute("tabindex");
					continue;
				}
				option.setAttribute("tabindex", value === this._active || option === roving ? "0" : "-1");
			}
			const empty = SelectorEngine.findOne(SELECTOR_EMPTY, this._list);
			if (empty) empty.toggleAttribute("hidden", this._config.loading || this._navigableOptions().length > 0);
		}
		_resolveCounter() {
			const existing = SelectorEngine.findOne(SELECTOR_COUNTER, this._element);
			if (existing || !this._config.counter) return existing;
			const counter = document.createElement("div");
			counter.classList.add(CLASS_NAME_SUBTITLE);
			counter.setAttribute("data-coreui-list-box-counter", "");
			this._resolveHeader().append(counter);
			this._createdNodes.push(counter);
			return counter;
		}
		_resolveHeader() {
			const existing = SelectorEngine.findOne(SELECTOR_HEADER$1, this._element);
			if (existing) return existing;
			const header = document.createElement("div");
			header.classList.add(CLASS_NAME_HEADER$1);
			this._element.prepend(header);
			this._createdNodes.push(header);
			return header;
		}
		_updateCounter() {
			if (!this._counter) return;
			const navigable = this._navigableOptions();
			const count = navigable.filter((option) => this._store.has(this._optionValue(option))).length;
			this._counter.textContent = resolveCountLabel(this._config.selectedLabel, count, navigable.length);
		}
		_resolveSearch() {
			const existing = SelectorEngine.findOne(SELECTOR_SEARCH$3, this._element);
			if (existing || !this._config.search) return existing;
			const search = document.createElement("input");
			search.type = "search";
			search.className = `${CLASS_NAME_FORM_CONTROL$2} ${CLASS_NAME_SEARCH$2}`;
			search.setAttribute("data-coreui-list-box-search", "");
			this._list.before(search);
			this._createdNodes.push(search);
			return search;
		}
		_decorateSearch() {
			if (!this._searchField) return;
			if (!this._list.id) this._list.id = getUID(`${NAME$51}-options-`);
			if (!this._searchField.placeholder) this._searchField.placeholder = this._config.searchPlaceholder;
			if (!this._searchField.hasAttribute("aria-label")) this._searchField.setAttribute("aria-label", this._config.ariaSearchLabel);
			this._searchField.setAttribute("aria-controls", this._list.id);
			this._searchField.disabled = this._config.disabled;
		}
		_filter() {
			if (this._query === null && (!this._searchField || this._config.search === SEARCH_EXTERNAL)) return;
			const query = this._query ?? normalizeSearchText(this._searchField.value, this._config.searchNormalize);
			for (const option of this._allOptions()) option.toggleAttribute("hidden", query !== "" && !normalizeSearchText(this._optionText(option), this._config.searchNormalize).includes(query));
			for (const section of SelectorEngine.find(SELECTOR_SECTION$3, this._list)) section.toggleAttribute("hidden", SelectorEngine.find(SELECTOR_OPTION$4, section).every((option) => option.hasAttribute("hidden")));
		}
		_initialSelection() {
			const { selected } = this._config;
			const configured = toSelectionValues(selected, SELECTION_MODE_MULTIPLE);
			const marked = this._flatItems().filter((item) => item.selected).map((item) => item.value);
			return toSelectionValues([.../* @__PURE__ */ new Set([...configured, ...marked])], this._config.selectionMode);
		}
		_normalizeItems(items) {
			return (Array.isArray(items) ? items : []).filter((entry) => entry !== null && typeof entry === "object").map((entry) => Array.isArray(entry.items) ? this._normalizeGroup(entry) : this._normalizeItem(entry));
		}
		_normalizeGroup(group) {
			return {
				label: String(group.label ?? ""),
				items: group.items.filter((item) => item !== null && typeof item === "object").map((item) => this._normalizeItem(item)),
				...group.disabled && { disabled: true }
			};
		}
		_normalizeItem(item) {
			const value = getOptionValue(item);
			const normalized = {
				value,
				label: String(item.label ?? value)
			};
			if (item.description !== void 0) normalized.description = String(item.description);
			if (item.disabled) normalized.disabled = true;
			if (item.selected) normalized.selected = true;
			return normalized;
		}
		_flatItems() {
			return (this._items ?? []).flatMap((entry) => Array.isArray(entry.items) ? entry.items : [entry]);
		}
		_resolveList() {
			const list = SelectorEngine.findOne(SELECTOR_OPTIONS$2, this._element);
			if (list) return list;
			if (this._items === null) return this._element;
			const created = document.createElement("div");
			created.classList.add(CLASS_NAME_OPTIONS$3);
			this._element.append(created);
			this._createdNodes.push(created);
			return created;
		}
		_render() {
			if (this._items === null) return;
			const empty = SelectorEngine.findOne(SELECTOR_EMPTY, this._list);
			if (this._hostListNodes === null && !this._createdNodes.includes(this._list)) this._hostListNodes = [...this._list.childNodes];
			this._list.replaceChildren(...this._items.map((entry) => Array.isArray(entry.items) ? this._renderSection(entry) : this._renderOption(entry)));
			if (empty) this._list.append(empty);
		}
		_renderSection(group) {
			const section = document.createElement("div");
			const label = document.createElement("div");
			label.classList.add(CLASS_NAME_SECTION_LABEL);
			label.id = getUID(`${NAME$51}-section-`);
			this._setContent(label, group.label);
			section.classList.add(CLASS_NAME_SECTION$1);
			section.setAttribute("role", "group");
			section.setAttribute("aria-labelledby", label.id);
			section.append(label, ...group.items.map((item) => this._renderOption(group.disabled ? {
				...item,
				disabled: true
			} : item)));
			return section;
		}
		_renderOption(item) {
			const option = document.createElement("div");
			option.classList.add(CLASS_NAME_OPTION);
			option.dataset.coreuiValue = item.value;
			if (item.disabled) {
				option.classList.add(CLASS_NAME_DISABLED$11);
				option.setAttribute("aria-disabled", "true");
			}
			if (item.description === void 0) {
				this._setContent(option, item.label ?? item.value);
				return option;
			}
			const label = document.createElement("span");
			const description = document.createElement("span");
			label.classList.add(CLASS_NAME_OPTION_LABEL);
			this._setContent(label, item.label ?? item.value);
			description.classList.add(CLASS_NAME_OPTION_DESCRIPTION);
			this._setContent(description, item.description);
			option.append(label, description);
			return option;
		}
		_setContent(target, content) {
			if (this._config.html) {
				target.innerHTML = sanitizeByConfig(content, this._config);
				return;
			}
			target.textContent = content;
		}
		_allOptions() {
			return SelectorEngine.find(SELECTOR_OPTION$4, this._list);
		}
		_rovingStop() {
			return this._active === null && !this._field ? this._navigable()[0] ?? null : null;
		}
		_navigableOptions() {
			return this._allOptions().filter((option) => !this._isHidden(option) && !this._isDisabled(option));
		}
		_navigable() {
			if (!this._sectionsSelectable()) return this._navigableOptions();
			return SelectorEngine.find(`${SELECTOR_OPTION$4}, ${SELECTOR_SECTION_TOGGLE}`, this._list).filter((element) => !this._isHidden(element) && !this._isDisabled(element));
		}
		_sectionsSelectable() {
			return this._config.sectionsSelectable && this._config.selectionMode === SELECTION_MODE_MULTIPLE;
		}
		_isSectionToggle(element) {
			return element.hasAttribute(ATTRIBUTE_SECTION_TOGGLE);
		}
		_sectionOptions(section) {
			return SelectorEngine.find(SELECTOR_OPTION$4, section).filter((option) => !this._isHidden(option) && !this._isDisabled(option));
		}
		_decorateSection(section) {
			const label = SelectorEngine.findOne(SELECTOR_SECTION_LABEL, section);
			if (!label || !this._sectionsSelectable()) return;
			if (!label.id) label.id = getUID(`${NAME$51}-section-`);
			label.setAttribute(ATTRIBUTE_SECTION_TOGGLE, "");
			label.setAttribute("role", "button");
			label.dataset.coreuiValue = label.id;
			this._decorateOption(label);
			if (this._sectionOptions(section).length > 0) {
				if (this._disabledSections.delete(label)) label.removeAttribute("aria-disabled");
			} else if (!label.hasAttribute("aria-disabled")) {
				label.setAttribute("aria-disabled", "true");
				this._disabledSections.add(label);
			}
		}
		_updateSections() {
			if (!this._sectionsSelectable()) return;
			const roving = this._rovingStop();
			for (const label of SelectorEngine.find(SELECTOR_SECTION_TOGGLE, this._list)) {
				const section = label.closest(SELECTOR_SECTION$3);
				const options = this._sectionOptions(section);
				const shown = SelectorEngine.find(SELECTOR_OPTION$4, section).filter((option) => !this._isHidden(option));
				const state = options.length > 0 ? this._scopeState(options) : getSelectionState(shown.filter((option) => this._store.has(this._optionValue(option))).length, shown.length);
				this._showSelectionState(label, state);
				label.classList.toggle(CLASS_NAME_ACTIVE$9, this._optionValue(label) === this._active && (this._focused || Boolean(this._field)));
				if (this._field) {
					label.removeAttribute("tabindex");
					continue;
				}
				label.setAttribute("tabindex", this._optionValue(label) === this._active || label === roving ? "0" : "-1");
			}
		}
		_toggleSection(section) {
			if (!section || !this._sectionsSelectable()) return;
			const options = this._sectionOptions(section);
			const values = options.map((option) => this._optionValue(option));
			const all = this._scopeState(options) === "all";
			let changed = false;
			this._limited = null;
			for (const value of values) changed = (all ? this._deselectValue(value) : this._selectValue(value)) || changed;
			if (changed) this._triggerChange();
			this._reportLimit();
		}
		_isHidden(option) {
			return option.hasAttribute("hidden") || option.closest("[hidden]") !== null;
		}
		_isDisabled(option) {
			return option.classList.contains(CLASS_NAME_DISABLED$11) || option.getAttribute("aria-disabled") === "true";
		}
		_isLink(option) {
			return option.tagName === "A" && option.hasAttribute("href");
		}
		_fieldTakesText() {
			return this._field instanceof HTMLInputElement || this._field instanceof HTMLTextAreaElement || Boolean(this._field?.isContentEditable);
		}
		_optionValue(option) {
			return option.dataset.coreuiValue ?? option.textContent?.trim() ?? "";
		}
		_optionText(option) {
			return (SelectorEngine.findOne(SELECTOR_OPTION_LABEL$1, option) ?? option).textContent?.trim().toLowerCase() ?? "";
		}
		_findOption(value) {
			return this._allOptions().find((option) => this._optionValue(option) === value);
		}
		_findNavigable(value) {
			return this._navigable().find((element) => this._optionValue(element) === value);
		}
		_activeOption() {
			return this._active === null ? null : this._findNavigable(this._active) ?? null;
		}
		_decorateOption(option) {
			if (this._config.indicator !== INDICATOR_CHECKBOX) return;
			if (SelectorEngine.findOne(SELECTOR_OPTION_INDICATOR, option)) return;
			const indicator = document.createElement("span");
			indicator.classList.add(CLASS_NAME_CHECK, CLASS_NAME_OPTION_INDICATOR);
			indicator.setAttribute("aria-hidden", "true");
			option.prepend(indicator);
		}
		_atLimit() {
			return isSelectionLimitReached(this._store.size(), this._selectionLimit());
		}
		_reportLimit() {
			if (this._limited === null) return;
			const value = this._limited;
			this._limited = null;
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECTION_LIMIT$2), {
				limit: this._config.selectionLimit,
				value
			});
		}
		_fit(next) {
			return toSelectionValues(next, this._config.selectionMode);
		}
		_selectionLimit() {
			return getSelectionLimit(this._config.selectionMode === SELECTION_MODE_MULTIPLE, this._config.selectionLimit);
		}
		_selectionState() {
			return this._scopeState(this._navigableOptions());
		}
		_scopeState(options) {
			const selected = options.filter((option) => this._store.has(this._optionValue(option))).length;
			return getScopeSelectionState(selected, options.length, this._store.size(), this._selectionLimit());
		}
		_showSelectionState(element, state) {
			element.setAttribute("aria-pressed", getAriaPressed(state));
			element.classList.toggle(CLASS_NAME_SELECTED$2, state === "all");
			element.classList.toggle(CLASS_NAME_INDETERMINATE$1, state === "some");
		}
		_updateSelectAll() {
			if (!this._selectAll) return;
			if (!this._list.id) this._list.id = getUID(`${NAME$51}-options-`);
			this._selectAll.setAttribute("aria-controls", this._list.id);
			this._selectAll.disabled = this._config.disabled || this._config.selectionMode !== SELECTION_MODE_MULTIPLE;
			this._decorateOption(this._selectAll);
			this._showSelectionState(this._selectAll, this._selectionState());
		}
		_toggleSelectAll() {
			if (this._selectionState() === "all") {
				this._deselectAll();
				return;
			}
			this.selectAll();
		}
		_deselectAll() {
			let changed = false;
			for (const option of this._navigableOptions()) changed = this._deselectValue(this._optionValue(option)) || changed;
			if (changed) this._triggerChange();
		}
		_selectValue(value) {
			if (this._config.disabled || this._config.selectionMode === SELECTION_MODE_NONE) return false;
			const option = this._findOption(value);
			if (!option || this._isDisabled(option) || this._store.has(value)) return false;
			if (this._atLimit()) {
				this._limited ??= value;
				return false;
			}
			if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT$2), { value }).defaultPrevented) return false;
			if (this._config.selectionMode === SELECTION_MODE_SINGLE$1) {
				const previous = this.getSelectedValues();
				for (const selected of previous) this._removeSelection(selected);
			}
			this._store.commit([...this._store.values(), value]);
			this.update();
			if (!this._store.has(value)) return false;
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECTED$1), { value });
			return true;
		}
		_deselectValue(value) {
			if (this._config.disabled || !this._store.has(value)) return false;
			if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_DESELECT$1), { value }).defaultPrevented) return false;
			this._removeSelection(value);
			return true;
		}
		_removeSelection(value) {
			this._store.commit(this._store.values().filter((selected) => selected !== value));
			this.update();
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_DESELECTED$1), { value });
		}
		_selectRange(from, to) {
			const options = this._navigableOptions();
			const range = rangeBetween(options, options.findIndex((option) => this._optionValue(option) === from), options.findIndex((option) => this._optionValue(option) === to));
			if (range.length === 0) return;
			let changed = false;
			this._limited = null;
			for (const option of range) changed = this._selectValue(this._optionValue(option)) || changed;
			if (changed) this._triggerChange();
			this._reportLimit();
		}
		_triggerChange() {
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE$11), { value: this.getSelectedValues() });
		}
		_setActive(value, focus) {
			if (value === this._active) {
				this._updateActiveDescendant();
				return;
			}
			this._active = value;
			this.update();
			const option = this._activeOption();
			if (option) {
				option.scrollIntoView({ block: "nearest" });
				if (focus && !this._field) option.focus();
				EventHandler.trigger(this._element, this.constructor.eventName(EVENT_ACTIVATE$1), { value });
			}
		}
		_updateActiveDescendant() {
			if (!this._field) return;
			if (!this._list.id) this._list.id = getUID(`${NAME$51}-options-`);
			if (!this._list.isConnected) {
				this._field.removeAttribute("aria-controls");
				this._field.removeAttribute("aria-activedescendant");
				return;
			}
			this._field.setAttribute("aria-controls", this._list.id);
			const option = this._activeOption();
			if (option) {
				this._field.setAttribute("aria-activedescendant", option.id);
				return;
			}
			this._field.removeAttribute("aria-activedescendant");
		}
		_move(forward) {
			const options = this._navigable();
			if (options.length === 0) return;
			const current = this._activeOption();
			const next = current ? getNextActiveElement(options, current, forward, false) : options[forward ? 0 : options.length - 1];
			this._setActive(this._optionValue(next), true);
		}
		_moveToEdge(index) {
			const option = this._navigable().at(index);
			if (option) this._setActive(this._optionValue(option), true);
		}
		_activate(option) {
			const value = this._optionValue(option);
			if (this._isSectionToggle(option)) {
				this._toggleSection(option.closest(SELECTOR_SECTION$3));
				return;
			}
			if (this._config.selectionMode === SELECTION_MODE_NONE || this._isLink(option)) EventHandler.trigger(this._element, this.constructor.eventName(EVENT_ACTION), {
				value,
				relatedTarget: option
			});
			if (this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
				this.toggle(value);
				return;
			}
			if (this._config.selectionMode === SELECTION_MODE_SINGLE$1) this.select(value);
		}
		_typeahead(key) {
			const text = this._config.typeahead ? this._typeaheadBuffer.push(key) : null;
			if (!text) return;
			const options = this._navigableOptions();
			const current = options.findIndex((option) => this._optionValue(option) === this._active);
			const match = findTypeaheadMatch(options, current, text, (option) => this._optionText(option));
			if (match) this._setActive(this._optionValue(match), true);
		}
		_addEventListeners() {
			EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$14), SELECTOR_OPTION$4, (event) => this._handleClick(event));
			EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$14), SELECTOR_SELECT_ALL$2, () => {
				if (!this._config.disabled) this._toggleSelectAll();
			});
			EventHandler.on(this._list, this.constructor.eventName(EVENT_FOCUSIN$8), () => {
				this._focused = true;
				this.update();
			});
			EventHandler.on(this._list, this.constructor.eventName(EVENT_FOCUSOUT$4), (event) => {
				if (!this._list.contains(event.relatedTarget)) {
					this._focused = false;
					this.update();
				}
			});
			EventHandler.on(this._element, this.constructor.eventName(EVENT_INPUT$12), SELECTOR_SEARCH$3, (event) => {
				if (this._config.search === SEARCH_EXTERNAL) {
					EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SEARCH$3), { query: event.target.value });
					return;
				}
				this.update();
			});
			EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$14), SELECTOR_SECTION_TOGGLE, (event) => {
				const label = event.target.closest(SELECTOR_SECTION_TOGGLE);
				if (!label || this._config.disabled) return;
				this._setActive(this._optionValue(label), !this._field);
				this._toggleSection(label.closest(SELECTOR_SECTION$3));
			});
			EventHandler.on(this._element, this.constructor.eventName(EVENT_FOCUSIN$8), `${SELECTOR_OPTION$4}, ${SELECTOR_SECTION_TOGGLE}`, (event) => {
				if (!this._config.disabled && !this._field) this._setActive(this._optionValue(event.target.closest(`${SELECTOR_OPTION$4}, ${SELECTOR_SECTION_TOGGLE}`)), false);
			});
			const target = this._field ?? this._list;
			EventHandler.on(target, this.constructor.eventName(EVENT_KEYDOWN$18), (event) => this._handleKeydown(event));
			if (this._field) EventHandler.on(this._field, this.constructor.eventName(EVENT_FOCUSIN$8), () => this._updateActiveDescendant());
		}
		_handleClick(event) {
			const option = event.target.closest(SELECTOR_OPTION$4);
			if (!option || this._config.disabled) return;
			if (this._isDisabled(option)) {
				event.preventDefault();
				return;
			}
			const value = this._optionValue(option);
			if (event.shiftKey && this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
				event.preventDefault();
				this._setActive(value, !this._field);
				this._selectRange(this._anchor, value);
				return;
			}
			this._setActive(value, !this._field);
			if ((event.ctrlKey || event.metaKey) && this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
				this._anchor = value;
				this.toggle(value);
				return;
			}
			this._anchor = value;
			this._activate(option);
		}
		_handleKeydown(event) {
			if (this._config.disabled) return;
			const { key } = event;
			if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === A_KEY$1) {
				if (this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
					event.preventDefault();
					this.selectAll();
				}
				return;
			}
			if (key === ARROW_UP_KEY$7 || key === ARROW_DOWN_KEY$11) {
				event.preventDefault();
				this._handleArrowKey(key === ARROW_DOWN_KEY$11, event.shiftKey);
				return;
			}
			if (key === HOME_KEY$6 || key === END_KEY$6) {
				if (this._fieldTakesText()) return;
				event.preventDefault();
				this._handleEdgeKey(key === HOME_KEY$6 ? 0 : -1, event.shiftKey);
				return;
			}
			if (key === SPACE_KEY$3 || key === ENTER_KEY$6) {
				if (key === SPACE_KEY$3 && this._fieldTakesText()) return;
				this._handleActivationKey(event, key === ENTER_KEY$6);
				return;
			}
			if (!this._fieldTakesText()) this._typeahead(key);
		}
		_handleArrowKey(forward, extend) {
			this._move(forward);
			if (extend && this._config.selectionMode === SELECTION_MODE_MULTIPLE && this._active !== null) {
				this.select(this._active);
				return;
			}
			this._anchor = this._active;
		}
		_handleEdgeKey(index, extend) {
			const anchor = this._anchor ?? this._active;
			this._moveToEdge(index);
			if (extend && this._config.selectionMode === SELECTION_MODE_MULTIPLE && this._active !== null) {
				this._selectRange(anchor, this._active);
				return;
			}
			this._anchor = this._active;
		}
		_handleActivationKey(event, isEnter) {
			const option = this._activeOption();
			if (!option) return;
			const follows = isEnter && this._isLink(option);
			if (!follows) event.preventDefault();
			if (!isEnter && this._config.selectionMode === SELECTION_MODE_NONE) return;
			this._anchor = this._active;
			this._activate(option);
			if (follows && this._field) option.click();
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, ListBox, config, args);
		}
	};
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$42}${DATA_API_KEY$34}`, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_LIST_BOX)) ListBox.getOrCreateInstance(element);
	});
	defineJQueryPlugin(ListBox);
	//#endregion
	//#region js/src/util/floating-ui.ts
	const BREAKPOINTS = {
		sm: 576,
		md: 768,
		lg: 1024,
		xl: 1280,
		"2xl": 1536
	};
	const parseResponsivePlacement = (placementString, defaultPlacement = "bottom") => {
		if (!placementString || !placementString.includes(":")) return null;
		const parts = placementString.split(/\s+/);
		const placements = { xs: defaultPlacement };
		for (const part of parts) if (part.includes(":")) {
			const [breakpoint, placement] = part.split(":");
			if (BREAKPOINTS[breakpoint] !== void 0) placements[breakpoint] = placement;
		} else placements.xs = part;
		return placements;
	};
	const getResponsivePlacement = (responsivePlacements, defaultPlacement = "bottom") => {
		if (!responsivePlacements) return defaultPlacement;
		const viewportWidth = window.innerWidth;
		let activePlacement = responsivePlacements.xs || defaultPlacement;
		for (const breakpoint of [
			"sm",
			"md",
			"lg",
			"xl",
			"2xl"
		]) if (viewportWidth >= BREAKPOINTS[breakpoint] && responsivePlacements[breakpoint]) activePlacement = responsivePlacements[breakpoint];
		return activePlacement;
	};
	const createBreakpointListeners = (callback) => {
		const listeners = [];
		for (const breakpoint of Object.keys(BREAKPOINTS)) {
			const minWidth = BREAKPOINTS[breakpoint];
			const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
			mql.addEventListener("change", callback);
			listeners.push({
				mql,
				handler: callback
			});
		}
		return listeners;
	};
	const disposeBreakpointListeners = (listeners) => {
		for (const { mql, handler } of listeners) mql.removeEventListener("change", handler);
	};
	const toFloatingOffset = (value) => {
		return Array.isArray(value) ? {
			mainAxis: value[1] || 0,
			crossAxis: value[0] || 0
		} : value;
	};
	const createAnchoredPosition = (anchor, content) => {
		let disposed = false;
		const update = async () => {
			if (disposed || !content || !content.isConnected) return;
			const { x, y } = await (0, _floating_ui_dom.computePosition)(anchor, content, {
				middleware: [
					(0, _floating_ui_dom.offset)({ mainAxis: 2 }),
					(0, _floating_ui_dom.flip)(),
					(0, _floating_ui_dom.shift)({ boundary: "clippingAncestors" })
				],
				placement: "bottom-start"
			});
			if (disposed || !content.isConnected) return;
			Object.assign(content.style, {
				position: "absolute",
				left: `${x}px`,
				top: `${y}px`
			});
		};
		update();
		const cleanup = (0, _floating_ui_dom.autoUpdate)(anchor, content, update);
		return {
			update,
			destroy() {
				disposed = true;
				cleanup();
			}
		};
	};
	//#endregion
	//#region js/src/util/focustrap.ts
	const NAME$50 = "focustrap";
	const EVENT_KEY$41 = `.coreui.focustrap`;
	const EVENT_FOCUSIN$7 = `focusin${EVENT_KEY$41}`;
	const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$41}`;
	const TAB_KEY$4 = "Tab";
	const TAB_NAV_FORWARD = "forward";
	const TAB_NAV_BACKWARD = "backward";
	const Default$44 = {
		additionalElement: null,
		autofocus: true,
		trapElement: null
	};
	const DefaultType$43 = {
		additionalElement: "(element|null|undefined)",
		autofocus: "boolean",
		trapElement: "element"
	};
	const activeTraps = [];
	var FocusTrap = class extends Config {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
			this._isActive = false;
			this._lastTabNavDirection = null;
			this._focusinHandler = (event) => this._handleFocusin(event);
			this._keydownHandler = (event) => this._handleKeydown(event);
		}
		static get Default() {
			return Default$44;
		}
		static get DefaultType() {
			return DefaultType$43;
		}
		static get NAME() {
			return NAME$50;
		}
		activate() {
			if (this._isActive) return;
			if (this._config.autofocus) this._config.trapElement.focus();
			EventHandler.on(document, EVENT_FOCUSIN$7, this._focusinHandler);
			EventHandler.on(document, EVENT_KEYDOWN_TAB, this._keydownHandler);
			activeTraps.push(this);
			this._isActive = true;
		}
		deactivate() {
			if (!this._isActive) return;
			this._isActive = false;
			activeTraps.splice(activeTraps.indexOf(this), 1);
			EventHandler.off(document, EVENT_FOCUSIN$7, this._focusinHandler);
			EventHandler.off(document, EVENT_KEYDOWN_TAB, this._keydownHandler);
		}
		_isTopmost() {
			return activeTraps[activeTraps.length - 1] === this;
		}
		_handleFocusin(event) {
			const { additionalElement, trapElement } = this._config;
			const target = event.composedPath()[0] ?? event.target;
			if (!this._isTopmost() || target === document || target === trapElement || trapElement.contains(target)) return;
			if (additionalElement && (target === additionalElement || additionalElement.contains(target))) return;
			const elements = SelectorEngine.focusableChildren(trapElement);
			if (elements.length === 0) trapElement.focus();
			else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) elements[elements.length - 1].focus();
			else elements[0].focus();
		}
		_focusables(element) {
			const children = SelectorEngine.focusableChildren(element);
			return element.tabIndex >= 0 && !isDisabled(element) && isVisible(element) ? [element, ...children] : children;
		}
		_handleKeydown(event) {
			if (!this._isTopmost() || event.key !== TAB_KEY$4) return;
			this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
			const { additionalElement, trapElement } = this._config;
			const trapElements = SelectorEngine.focusableChildren(trapElement);
			const additionalElements = additionalElement ? this._focusables(additionalElement) : [];
			if (trapElements.length === 0) return;
			if (additionalElements.length === 0) {
				const index = trapElements.indexOf(event.target);
				if (index === trapElements.length - 1 && !event.shiftKey) {
					event.preventDefault();
					trapElements[0].focus();
				} else if (index === 0 && event.shiftKey) {
					event.preventDefault();
					trapElements[trapElements.length - 1].focus();
				}
				return;
			}
			const target = event.target;
			const trapIndex = trapElements.indexOf(target);
			const additionalIndex = additionalElements.indexOf(target);
			let destination;
			if (trapIndex === trapElements.length - 1 && !event.shiftKey) destination = additionalElements[0];
			else if (trapIndex === 0 && event.shiftKey) destination = additionalElements[additionalElements.length - 1];
			else if (additionalIndex === additionalElements.length - 1 && !event.shiftKey) destination = trapElements[0];
			else if (additionalIndex === 0 && event.shiftKey) destination = trapElements[trapElements.length - 1];
			if (destination) {
				event.preventDefault();
				destination.focus();
			}
		}
	};
	//#endregion
	//#region js/src/util/popup.ts
	const NAME$49 = "popup";
	const EVENT_KEY$40 = `.coreui.popup`;
	const EVENT_POINTERDOWN$4 = `pointerdown${EVENT_KEY$40}`;
	const EVENT_KEYDOWN$17 = `keydown${EVENT_KEY$40}`;
	const ESCAPE_KEY$6 = "Escape";
	const ARROW_DOWN_KEY$10 = "ArrowDown";
	const Default$43 = {
		anchor: null,
		container: false,
		content: null,
		fallbackPlacements: null,
		focusTrap: true,
		mobileBreakpoint: 768,
		offset: [0, 2],
		onBeforeHide: null,
		onBeforeShow: null,
		onHidden: null,
		onHide: null,
		onShow: null,
		onShown: null,
		placement: "bottom-start",
		returnFocus: true
	};
	const DefaultType$42 = {
		anchor: "element",
		container: "(string|element|boolean)",
		content: "element",
		fallbackPlacements: "(array|null)",
		focusTrap: "boolean",
		mobileBreakpoint: "number",
		offset: "array",
		onBeforeHide: "(null|function)",
		onBeforeShow: "(null|function)",
		onHidden: "(function|null)",
		onHide: "(function|null)",
		onShow: "(function|null)",
		onShown: "(function|null)",
		placement: "string",
		returnFocus: "boolean"
	};
	const hasConstrainingAncestor = (anchor, boundary = document.body) => {
		let node = anchor?.parentElement;
		while (node && node !== boundary && node !== document.body && node !== document.documentElement) {
			const styles = getComputedStyle(node);
			if (styles.overflow !== "visible" || styles.transform !== "none" || styles.filter !== "none" || styles.perspective !== "none" || styles.contain.includes("paint") || styles.willChange.includes("transform")) return true;
			node = node.parentElement;
		}
		return false;
	};
	const resolvePopupContainer = (anchor, explicitContainer = null) => {
		const dialog = anchor?.closest("dialog[open]");
		if (explicitContainer) return dialog?.matches(":modal") && !dialog.contains(explicitContainer) ? dialog : explicitContainer;
		if (dialog) return hasConstrainingAncestor(anchor, dialog) ? dialog : null;
		return hasConstrainingAncestor(anchor) ? document.body : null;
	};
	var Popup = class extends Config {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
			this._anchor = this._config.anchor;
			this._content = this._config.content;
			this._container = this._config.container ? getElement(this._config.container) : null;
			this._cleanupAutoUpdate = null;
			this._isShown = false;
			this._transition = 0;
			this._hiding = false;
			this._previouslyFocused = null;
			this._pointerdownListener = null;
			this._keydownListener = null;
			this._contentKeydownListener = null;
			this._anchorKeydownListener = null;
			this._revealPending = false;
			this._focustrap = this._config.focusTrap ? new FocusTrap({
				autofocus: false,
				trapElement: this._content
			}) : null;
			this._addAnchorKeydownListener();
		}
		static get Default() {
			return Default$43;
		}
		static get DefaultType() {
			return DefaultType$42;
		}
		static get NAME() {
			return NAME$49;
		}
		get isShown() {
			return this._isShown;
		}
		get isMobile() {
			return window.matchMedia(`(max-width: ${this._config.mobileBreakpoint - 1}px)`).matches;
		}
		show() {
			if (this._isShown || execute(this._config.onBeforeShow) === false) return;
			this._isShown = true;
			this._hiding = false;
			const transition = ++this._transition;
			this._previouslyFocused = document.activeElement;
			this._mount();
			execute(this._config.onShow);
			if (this.isMobile) Object.assign(this._content.style, {
				left: "",
				position: "",
				top: ""
			});
			else this._startPositioning();
			this._addDismissListeners();
			if (this._focustrap) this._focustrap.activate();
			this._focusPanel();
			if (this.isMobile) this._revealEntry();
			this._afterTransition(transition, () => execute(this._config.onShown));
		}
		hide() {
			if (!this._isShown || execute(this._config.onBeforeHide) === false) return;
			this._hide();
		}
		_hide() {
			execute(this._config.onHide);
			this._isShown = false;
			this._revealPending = false;
			this._hiding = true;
			const transition = ++this._transition;
			this._stopPositioning();
			this._removeDismissListeners();
			if (this._focustrap) this._focustrap.deactivate();
			if (this._config.returnFocus && this._holdsFocus()) this._returnFocusTarget()?.focus();
			this._previouslyFocused = null;
			this._afterTransition(transition, () => {
				this._hiding = false;
				this._unmount();
				execute(this._config.onHidden);
			});
		}
		toggle() {
			return this._isShown ? this.hide() : this.show();
		}
		update() {
			if (this._isShown && !this.isMobile) this._updatePosition();
		}
		dispose() {
			const owesHidden = this._isShown || this._hiding;
			if (this._isShown) this._hide();
			this._transition++;
			this._hiding = false;
			this._unmount();
			if (owesHidden) execute(this._config.onHidden);
			if (this._anchorKeydownListener) {
				EventHandler.off(this._anchor, EVENT_KEYDOWN$17, this._anchorKeydownListener);
				this._anchorKeydownListener = null;
			}
			this._focustrap = null;
			this._anchor = null;
			this._content = null;
			this._container = null;
		}
		_mount() {
			if (!this._content) return;
			if (this._config.focusTrap) {
				this._content.setAttribute("role", "dialog");
				this._content.setAttribute("aria-modal", "true");
			}
			const container = this._resolveContainer();
			if (container) {
				container.append(this._content);
				return;
			}
			this._anchor?.after(this._content);
		}
		_holdsFocus() {
			const active = document.activeElement;
			return Boolean(active && (active === document.body || this._content?.contains(active)));
		}
		_returnFocusTarget() {
			if (this._previouslyFocused?.isConnected) return this._previouslyFocused;
			return this._anchor ? SelectorEngine.focusableChildren(this._anchor)[0] ?? null : null;
		}
		_afterTransition(transition, callback) {
			const content = this._content;
			let settled = false;
			const settle = () => {
				if (settled) return;
				settled = true;
				if (transition === this._transition) callback();
			};
			const duration = getTransitionDurationFromElement(content);
			const fades = typeof content.getAnimations === "function" ? content.getAnimations().filter((animation) => animation instanceof CSSTransition && animation.transitionProperty === "opacity") : [];
			if (fades.length === 0) {
				setTimeout(settle, duration + 5);
				return;
			}
			Promise.allSettled(fades.map((fade) => fade.finished)).then(settle);
			setTimeout(settle, duration + 1e3);
		}
		_unmount() {
			if (!this._isShown) this._content?.remove();
		}
		_resolveContainer() {
			return resolvePopupContainer(this._anchor, this._container);
		}
		_startPositioning() {
			this._cleanupAutoUpdate = (0, _floating_ui_dom.autoUpdate)(this._anchor, this._content, () => this._updatePosition());
		}
		_stopPositioning() {
			if (this._cleanupAutoUpdate) {
				this._cleanupAutoUpdate();
				this._cleanupAutoUpdate = null;
			}
		}
		_updatePosition() {
			const [skidding, distance] = this._config.offset;
			const middleware = [
				(0, _floating_ui_dom.offset)({
					crossAxis: skidding,
					mainAxis: distance
				}),
				(0, _floating_ui_dom.flip)(this._config.fallbackPlacements ? { fallbackPlacements: this._config.fallbackPlacements } : {}),
				(0, _floating_ui_dom.shift)()
			];
			(0, _floating_ui_dom.computePosition)(this._anchor, this._content, {
				middleware,
				placement: this._config.placement,
				strategy: "absolute"
			}).then(({ x, y }) => {
				if (!this._content || !this._content.isConnected) return;
				Object.assign(this._content.style, {
					left: `${x}px`,
					position: "absolute",
					top: `${y}px`
				});
				this._revealEntry();
			});
		}
		_addAnchorKeydownListener() {
			if (!this._anchor) return;
			this._anchorKeydownListener = (event) => {
				if (!(event.key === "F4" || event.altKey && event.key === ARROW_DOWN_KEY$10) || this._isShown) return;
				event.preventDefault();
				this.show();
			};
			EventHandler.on(this._anchor, EVENT_KEYDOWN$17, this._anchorKeydownListener);
		}
		_focusPanel() {
			if (!this._content) return;
			const current = SelectorEngine.findOne("[aria-current=\"date\"]", this._content);
			const today = current?.closest("[aria-disabled=\"true\"]") ? null : current;
			const entry = SelectorEngine.findOne(".selected[aria-selected=\"true\"], [aria-selected=\"true\"]:not(.calendar-cell):not(.calendar-row)", this._content) ?? today?.closest("[data-coreui-selectable]") ?? today?.closest("[tabindex]") ?? SelectorEngine.findOne("[tabindex=\"0\"]", this._content) ?? SelectorEngine.focusableChildren(this._content)[0];
			entry?.focus({ preventScroll: true });
			this._revealPending = Boolean(entry);
		}
		_revealEntry() {
			if (!this._revealPending) return;
			this._revealPending = false;
			const active = document.activeElement;
			if (active instanceof HTMLElement && this._content?.contains(active)) active.scrollIntoView({
				block: "nearest",
				inline: "nearest"
			});
		}
		_addDismissListeners() {
			this._pointerdownListener = (event) => {
				const path = event.composedPath();
				if (path.includes(this._anchor) || path.includes(this._content)) return;
				this.hide();
			};
			this._keydownListener = (event) => {
				if (event.key === ESCAPE_KEY$6) this.hide();
			};
			this._contentKeydownListener = (event) => {
				if (event.key === ESCAPE_KEY$6) {
					event.preventDefault();
					event.stopPropagation();
					this.hide();
				}
			};
			EventHandler.on(document, EVENT_POINTERDOWN$4, this._pointerdownListener);
			EventHandler.on(document, EVENT_KEYDOWN$17, this._keydownListener);
			EventHandler.on(this._content, EVENT_KEYDOWN$17, this._contentKeydownListener);
			EventHandler.on(this._anchor, EVENT_KEYDOWN$17, this._contentKeydownListener);
		}
		_removeDismissListeners() {
			EventHandler.off(document, EVENT_POINTERDOWN$4, this._pointerdownListener);
			EventHandler.off(document, EVENT_KEYDOWN$17, this._keydownListener);
			EventHandler.off(this._content, EVENT_KEYDOWN$17, this._contentKeydownListener);
			EventHandler.off(this._anchor, EVENT_KEYDOWN$17, this._contentKeydownListener);
			this._pointerdownListener = null;
			this._keydownListener = null;
			this._contentKeydownListener = null;
		}
	};
	//#endregion
	//#region js/src/combobox-base.ts
	const ARROW_DOWN_KEY$9 = "ArrowDown";
	const ESCAPE_KEY$5 = "Escape";
	const ENTER_KEY$5 = "Enter";
	const CLASS_NAME_SHOW$15 = "show";
	const CLASS_NAME_POPUP$2 = "combobox-popup";
	const CLASS_NAME_EMPTY = "list-box-empty";
	const CLASS_NAME_LIST_BOX$1 = "list-box";
	const CLASS_NAME_OPTIONS$2 = "list-box-options";
	const SELECTOR_OPTION$3 = ".list-box-option";
	const EVENT_LIST_BOX_CHANGE$1 = "change.coreui.list-box";
	const EVENT_LIST_BOX_DESELECT = "deselect.coreui.list-box";
	const EVENT_LIST_BOX_DESELECTED = "deselected.coreui.list-box";
	const EVENT_LIST_BOX_SELECT = "select.coreui.list-box";
	const EVENT_LIST_BOX_SELECTED = "selected.coreui.list-box";
	const EVENT_LIST_BOX_SELECTION_LIMIT = "selectionLimit.coreui.list-box";
	var ComboboxBase = class extends BaseComponent {
		toggle() {
			return this._isShown() ? this.hide() : this.show();
		}
		show() {
			if (this._isDisabled() || this._isShown() || !this._canShow()) return;
			if (EventHandler.trigger(this._element, this.constructor.eventName("show")).defaultPrevented) return;
			const showTarget = this._getShowTarget();
			this._mountMenu();
			showTarget.classList.add(CLASS_NAME_SHOW$15);
			this._getAriaExpandedTarget().setAttribute("aria-expanded", "true");
			this._syncPanelReferences();
			this._menu.classList.add(CLASS_NAME_SHOW$15);
			EventHandler.trigger(this._element, this.constructor.eventName("shown"));
			this._createFloating();
			this._afterShow();
		}
		hide() {
			if (!this._isShown()) return;
			if (EventHandler.trigger(this._element, this.constructor.eventName("hide")).defaultPrevented) return;
			this._onHideStart();
			this._disposeFloating();
			this._afterHideDispose();
			this._getShowTarget().classList.remove(CLASS_NAME_SHOW$15);
			this._getAriaExpandedTarget().setAttribute("aria-expanded", "false");
			this._menu.classList.remove(CLASS_NAME_SHOW$15);
			this._listBox?.setActive(null);
			this._onHideEnd();
			this._syncPanelReferences();
			EventHandler.trigger(this._element, this.constructor.eventName("hidden"));
			executeAfterTransition(() => {
				if (this._menu && !this._isShown()) {
					this._menu.remove();
					this._syncPanelReferences();
				}
			}, this._menu);
		}
		_isDisabled() {
			return this._config.disabled;
		}
		_isShown() {
			return this._getShowTarget().classList.contains(CLASS_NAME_SHOW$15);
		}
		_canShow() {
			return true;
		}
		_afterShow() {}
		_onHideStart() {}
		_afterHideDispose() {}
		_onHideEnd() {}
		_getShowTarget() {
			return this._element;
		}
		_mountMenu() {
			const showTarget = this._getShowTarget();
			const container = resolvePopupContainer(showTarget, this._config.container ? getElement(this._config.container) : null);
			if (container) container.append(this._menu);
			else showTarget.after(this._menu);
			this._syncMenuWidth();
			this._widthObserver = new ResizeObserver(() => this._syncMenuWidth());
			this._widthObserver.observe(showTarget);
		}
		_syncPanelReferences() {
			this._listBox?._updateActiveDescendant();
			this._listBox?._syncLoadingAnnouncement();
			const open = this._menu.isConnected && this._isShown();
			const field = this._getActiveDescendantField();
			if (field && !open) {
				field.removeAttribute("aria-controls");
				field.removeAttribute("aria-activedescendant");
			}
			for (const [element, id] of this._getPanelReferences()) if (open) element.setAttribute("aria-controls", id);
			else element.removeAttribute("aria-controls");
		}
		_getPanelReferences() {
			return [];
		}
		_syncMenuWidth() {
			if (this._menu) this._menu.style.minWidth = `${this._getShowTarget().offsetWidth}px`;
		}
		_getAriaExpandedTarget() {
			return this._togglerElement;
		}
		_escapeFocusTarget() {
			return this._togglerElement;
		}
		_addTogglerKeydownListeners() {
			EventHandler.on(this._togglerElement, this.constructor.eventName("keydown"), (event) => {
				if (event.defaultPrevented) return;
				if (!this._isShown() && this._isOpenKey(event)) {
					event.preventDefault();
					this.show();
				}
			});
		}
		_isOpenKey(event) {
			return event.key === ENTER_KEY$5 || event.key === ARROW_DOWN_KEY$9;
		}
		_createOptionsContainer() {
			const popupDiv = document.createElement("div");
			popupDiv.classList.add("popup", CLASS_NAME_POPUP$2);
			const listBoxDiv = document.createElement("div");
			listBoxDiv.classList.add(CLASS_NAME_LIST_BOX$1);
			popupDiv.append(listBoxDiv);
			this._listBoxElement = listBoxDiv;
			this._buildMenuHeader(listBoxDiv);
			const optionsDiv = document.createElement("div");
			optionsDiv.classList.add(CLASS_NAME_OPTIONS$2);
			optionsDiv.setAttribute("id", `${this._uniqueId}-listbox`);
			this._decorateListbox(optionsDiv);
			if (this._config.optionsMaxHeight !== "auto") {
				optionsDiv.style.maxHeight = `${this._config.optionsMaxHeight}px`;
				optionsDiv.style.overflowY = "auto";
			}
			if (this._config.searchNoResultsLabel) {
				const empty = document.createElement("div");
				empty.classList.add(CLASS_NAME_EMPTY);
				empty.setAttribute("role", "status");
				empty.setAttribute("hidden", "");
				empty.textContent = this._config.searchNoResultsLabel;
				optionsDiv.append(empty);
			}
			listBoxDiv.append(optionsDiv);
			this._addPanelEscapeListener(popupDiv);
			this._optionsElement = optionsDiv;
			this._menu = popupDiv;
			this._listBox = new ListBox(listBoxDiv, this._getListBoxConfig(), this._store);
			this._addListBoxListeners();
			this._afterMenuCreated();
		}
		_addPanelEscapeListener(popup) {
			EventHandler.on(popup, this.constructor.eventName("keydown"), (event) => {
				if (event.key === ESCAPE_KEY$5) {
					event.preventDefault();
					event.stopPropagation();
					this.hide();
					this._escapeFocusTarget()?.focus();
				}
			});
		}
		_buildMenuHeader(listBoxDiv) {}
		_decorateListbox(optionsDiv) {}
		_afterMenuCreated() {}
		_getListBoxConfig() {
			return {
				activeDescendant: this._getActiveDescendantField(),
				allowList: this._config.allowList,
				html: this._hasOptionTemplates(),
				items: this._getListBoxItems(),
				sanitize: this._config.sanitize,
				sanitizeFn: this._config.sanitizeFn,
				selectionMode: "single",
				typeahead: false
			};
		}
		_getActiveDescendantField() {
			return this._togglerElement;
		}
		_hasOptionTemplates() {
			return typeof this._config.optionsTemplate === "function" || typeof this._config.optionsGroupsTemplate === "function";
		}
		_getListBoxItems(options = this._options) {
			return options.map((option) => {
				if (isOptionGroup(option)) return {
					label: this._renderGroupLabel(option),
					items: this._getListBoxItems(option.options)
				};
				return {
					value: String(option.value),
					label: this._renderOptionLabel(option),
					...option.disabled && { disabled: true }
				};
			});
		}
		_renderOptionLabel(option) {
			if (typeof this._config.optionsTemplate === "function") return this._config.optionsTemplate(option);
			return this._plainLabel(this._optionText(option));
		}
		_renderGroupLabel(option) {
			if (typeof this._config.optionsGroupsTemplate === "function") return this._config.optionsGroupsTemplate(option);
			return this._plainLabel(option.label);
		}
		_optionText(option) {
			return option.label;
		}
		_plainLabel(label) {
			return this._hasOptionTemplates() ? escapeHtml(String(label)) : String(label);
		}
		_setListBoxItems() {
			this._listBox?.setItems(this._getListBoxItems());
			this._afterOptionsRendered();
		}
		_afterOptionsRendered() {}
		_disposeListBox() {
			this._listBoxElement?.removeEventListener(EVENT_LIST_BOX_CHANGE$1, this._listBoxChangeHandler);
			this._listBox?.dispose();
			this._listBox = null;
		}
		_addListBoxListeners() {
			const refuseWhileDisabled = (event) => {
				if (this._isDisabled()) event.preventDefault();
			};
			EventHandler.on(this._listBoxElement, EVENT_LIST_BOX_DESELECT, refuseWhileDisabled);
			EventHandler.on(this._listBoxElement, EVENT_LIST_BOX_SELECTED, (event) => {
				this._onOptionSelected(String(event.value));
			});
			EventHandler.on(this._listBoxElement, EVENT_LIST_BOX_DESELECTED, (event) => {
				this._onOptionDeselected(String(event.value));
			});
			this._listBoxChangeHandler = () => this._onSelectionChange();
			this._listBoxElement.addEventListener(EVENT_LIST_BOX_CHANGE$1, this._listBoxChangeHandler);
			this._listBoxElement.addEventListener(EVENT_LIST_BOX_SELECT, refuseWhileDisabled);
			EventHandler.on(this._listBoxElement, EVENT_LIST_BOX_SELECTION_LIMIT, (event) => {
				this._onSelectionLimit(event.limit, String(event.value));
			});
		}
		_onOptionSelected(value) {}
		_onOptionDeselected(value) {}
		_onSelectionChange() {}
		_commitSelection(values) {
			if (this._store.commit(values)) this._listBox?.update();
		}
		_onSelectionLimit(limit, value) {}
		_findOptionByValue(value, options = this._options) {
			return findOptionByValue(options, value);
		}
		_createFloating() {
			this._anchoredPosition = createAnchoredPosition(this._togglerElement, this._menu);
			this._floatingCleanup = this._anchoredPosition.destroy;
		}
		async _updateFloatingPosition() {
			await this._anchoredPosition?.update();
		}
		_disposeFloating() {
			this._widthObserver?.disconnect();
			this._widthObserver = null;
			if (this._floatingCleanup) {
				this._floatingCleanup();
				this._floatingCleanup = null;
				this._anchoredPosition = null;
			}
		}
		_filterQuery() {
			return this._search === "" ? null : this._search;
		}
		_filterOptionsList() {
			this._listBox?.filter(this._filterQuery());
			this._afterOptionsRendered();
			this._afterFilter(this._getDisplayedOptions().length);
		}
		_afterFilter(visibleOptions) {}
		_getDisplayedOptions() {
			return SelectorEngine.find(SELECTOR_OPTION$3, this._optionsElement).filter((element) => this._isOptionDisplayed(element));
		}
		_isOptionDisplayed(element) {
			return !element.hasAttribute("hidden") && element.closest("[hidden]") === null;
		}
		_normalizeContainerConfig(config) {
			if (config.container === true) config.container = document.body;
			if (typeof config.container === "object" || typeof config.container === "string") config.container = getElement(config.container);
			return config;
		}
	};
	//#endregion
	//#region js/src/util/form-validation.ts
	const ATTRIBUTE_INVALID_FEEDBACK$1 = "data-coreui-invalid-feedback";
	const CLASS_NAME_IS_INVALID$1 = "is-invalid";
	const CLASS_NAME_IS_VALID$1 = "is-valid";
	const SELECTOR_ARIA_HIDDEN = "[aria-hidden=\"true\"]";
	const SELECTOR_AUTOCOMPLETE = ".autocomplete";
	const SELECTOR_CHIP_INPUT = ".chip-input";
	const SELECTOR_CHOICE = "[type=\"checkbox\"], [type=\"radio\"]";
	const SELECTOR_COMBOBOX_SELECT = ".combobox-select";
	const SELECTOR_COMBOBOX_TOGGLE = ".combobox-toggle";
	const SELECTOR_CONTROL = "input, select, textarea";
	const SELECTOR_DATE_TIME = ".form-date-time";
	const SELECTOR_FIELD = ".form-field";
	const SELECTOR_FIELD_CONTROL = ".check, .radio, .switch";
	const SELECTOR_FLOATING = ".form-floating";
	const SELECTOR_FORM_VALIDATE_VALID = "[data-coreui-validate~=\"valid\"]";
	const SELECTOR_FRAME = ".form-control-group";
	const SELECTOR_HIDDEN = `[hidden], ${SELECTOR_ARIA_HIDDEN}`;
	const SELECTOR_INPUT_GROUP = ".input-group";
	const SELECTOR_INPUT_GROUP_CONTROL = ".form-control, .form-select";
	const SELECTOR_INVALID_FEEDBACK = ".invalid-feedback, .invalid-tooltip";
	const SELECTOR_OTP = ".form-otp";
	const SELECTOR_POPUP$1 = ".popup";
	const SELECTOR_RANGE$1 = ".form-range";
	const SELECTOR_RANGE_INPUT = ".form-range-input";
	const SELECTOR_RATING = ".rating";
	const SELECTOR_USER_INVALID = "[data-coreui-validate] :user-invalid";
	const SELECTOR_USER_VALID = "[data-coreui-validate~=\"valid\"] :user-valid";
	const STATE_CLASSES = [CLASS_NAME_IS_INVALID$1, CLASS_NAME_IS_VALID$1];
	const STATE_INVALID_MESSAGE = "Invalid value.";
	const ownedControls = /* @__PURE__ */ new WeakSet();
	let stateSerial = 0;
	const stateMessages = /* @__PURE__ */ new WeakMap();
	const createMark = () => ({
		ariaInvalid: false,
		classes: [],
		describedBy: []
	});
	const isValidatable = (control) => control?.willValidate === true && ![
		"button",
		"image",
		"reset",
		"submit"
	].includes(control.type);
	const splitIds = (value) => (value ?? "").split(/\s+/).filter(Boolean);
	const setDescribedBy = (control, ids) => {
		if (ids.join(" ") === (control.getAttribute("aria-describedby") ?? "")) return;
		if (ids.length > 0) control.setAttribute("aria-describedby", ids.join(" "));
		else control.removeAttribute("aria-describedby");
	};
	const startsAnotherField = (element, control) => [element, ...element.querySelectorAll(SELECTOR_CONTROL)].some((other) => isValidatable(other) && other !== control && !(control.name && other.name === control.name && other.matches(SELECTOR_CHOICE)));
	const isShownFeedback = (element) => element.matches(SELECTOR_INVALID_FEEDBACK) && !element.matches(SELECTOR_HIDDEN);
	const getFollowingFeedback = (element, control) => {
		const feedback = [];
		for (let sibling = element.nextElementSibling; sibling && (sibling.matches(SELECTOR_POPUP$1) || !startsAnotherField(sibling, control)); sibling = sibling.nextElementSibling) if (isShownFeedback(sibling)) feedback.push(sibling);
		return feedback;
	};
	const getLayoutElement = (control) => {
		const previous = control.previousElementSibling;
		return control.closest(`${SELECTOR_AUTOCOMPLETE}, ${SELECTOR_CHIP_INPUT}, ${SELECTOR_DATE_TIME}, ${SELECTOR_OTP}, ${SELECTOR_RATING}`) ?? (control.matches(SELECTOR_COMBOBOX_SELECT) && previous?.matches(SELECTOR_COMBOBOX_TOGGLE) ? previous : control);
	};
	const getFrame = (control) => {
		const parent = control.parentElement;
		const holder = parent?.matches(SELECTOR_FLOATING) ? parent.parentElement : parent;
		return holder?.matches(SELECTOR_FRAME) ? holder : null;
	};
	const getMarkedAncestors = (element) => {
		const ancestors = [];
		for (let ancestor = element.parentElement; ancestor && ancestor.tagName !== "FORM"; ancestor = ancestor.parentElement) if (ancestor.classList.contains(CLASS_NAME_IS_INVALID$1)) ancestors.push(ancestor);
		return ancestors;
	};
	const reachesField = (control, field) => {
		const inputGroup = control.matches(SELECTOR_INPUT_GROUP_CONTROL) ? control.closest(SELECTOR_INPUT_GROUP) : null;
		const frame = control.matches(SELECTOR_FRAME) ? control : getFrame(control);
		return control.matches(SELECTOR_FIELD_CONTROL) || [frame, inputGroup].some((group) => group && group !== field && field.contains(group));
	};
	const getStructuralFeedback = (control) => {
		const element = getLayoutElement(control);
		const anchor = getFrame(element) ?? (element.matches(SELECTOR_RANGE_INPUT) ? element.closest(SELECTOR_RANGE$1) : null);
		const fieldFeedback = [];
		for (let field = element.closest(SELECTOR_FIELD); field; field = field.parentElement?.closest(SELECTOR_FIELD) ?? null) if (reachesField(element, field)) fieldFeedback.push(...[...field.querySelectorAll(SELECTOR_INVALID_FEEDBACK)].filter((feedback) => isShownFeedback(feedback) && feedback.closest(SELECTOR_FIELD)?.contains(element)));
		return [
			...getFollowingFeedback(element, control),
			...anchor ? getFollowingFeedback(anchor, control) : [],
			...getMarkedAncestors(element).flatMap((ancestor) => getFollowingFeedback(ancestor, control)),
			...fieldFeedback
		];
	};
	const getFeedbackIds = (control) => {
		const named = splitIds(getLayoutElement(control).getAttribute(ATTRIBUTE_INVALID_FEEDBACK$1));
		if (named.length > 0) return [...new Set(named)];
		const form = control.closest("form");
		const members = control.name && control.matches(SELECTOR_CHOICE) && form ? [...form.elements].filter((other) => isValidatable(other) && other.name === control.name && other.matches(SELECTOR_CHOICE)) : [control];
		return [...new Set(members.flatMap((member) => getStructuralFeedback(member)))].map((element) => {
			element.id ||= getUID("invalid-feedback-");
			return element.id;
		});
	};
	const markControl = (control, marks) => {
		const mark = marks.get(control) ?? createMark();
		if (control.getAttribute("aria-invalid") !== "true") {
			control.setAttribute("aria-invalid", "true");
			mark.ariaInvalid = true;
		}
		const feedbackIds = getFeedbackIds(control);
		const describedBy = splitIds(control.getAttribute("aria-describedby")).filter((id) => feedbackIds.includes(id) || !mark.describedBy.includes(id));
		const addedIds = feedbackIds.filter((id) => !describedBy.includes(id));
		mark.describedBy = [...mark.describedBy.filter((id) => feedbackIds.includes(id) && describedBy.includes(id)), ...addedIds];
		setDescribedBy(control, [...describedBy, ...addedIds]);
		marks.set(control, mark);
	};
	const unmarkControl = (control, marks) => {
		const mark = marks.get(control);
		if (!mark) return;
		if (mark.ariaInvalid) control.removeAttribute("aria-invalid");
		setDescribedBy(control, splitIds(control.getAttribute("aria-describedby")).filter((id) => !mark.describedBy.includes(id)));
		mark.ariaInvalid = false;
		mark.describedBy = [];
	};
	const setStateClasses = (control, mark, classes) => {
		const owned = STATE_CLASSES.some((name) => control.classList.contains(name) && !mark.classes.includes(name)) ? [] : classes;
		for (const name of mark.classes.filter((name) => !owned.includes(name))) control.classList.remove(name);
		control.classList.add(...owned);
		mark.classes = owned;
	};
	const updateControlValidationState = (control, form, marks) => {
		if (!isValidatable(control) || ownedControls.has(control)) {
			const mark = marks.get(control);
			if (mark) {
				setStateClasses(control, mark, []);
				unmarkControl(control, marks);
				marks.delete(control);
			}
			return;
		}
		const mark = marks.get(control) ?? createMark();
		const isValid = control.validity.valid;
		marks.set(control, mark);
		setStateClasses(control, mark, isValid ? form.matches(SELECTOR_FORM_VALIDATE_VALID) ? [CLASS_NAME_IS_VALID$1] : [] : [CLASS_NAME_IS_INVALID$1]);
		if (isValid) unmarkControl(control, marks);
		else markControl(control, marks);
	};
	const updateValidationState = (form, marks) => {
		for (const control of form.elements) updateControlValidationState(control, form, marks);
	};
	const clearValidationState = (form, marks) => {
		for (const control of form.elements) {
			const mark = marks.get(control);
			if (mark) setStateClasses(control, mark, []);
			unmarkControl(control, marks);
			marks.delete(control);
		}
	};
	const getFocusedElement = (form) => form.getRootNode().activeElement ?? form.ownerDocument.activeElement;
	const moveFocusTo = (control) => {
		let moved = false;
		const handleFocusIn = () => {
			moved = true;
		};
		control.ownerDocument.addEventListener("focusin", handleFocusIn, true);
		control.focus();
		control.ownerDocument.removeEventListener("focusin", handleFocusIn, true);
		return moved;
	};
	const getText = (element) => {
		if (!element) return "";
		const clone = element.cloneNode(true);
		for (const hidden of clone.querySelectorAll(SELECTOR_HIDDEN)) hidden.remove();
		return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
	};
	const getFeedbackText = (control) => {
		const root = control.getRootNode();
		const getById = (id) => "getElementById" in root ? root.getElementById(id) : root.querySelector(`#${CSS.escape(id)}`);
		const feedbackIds = getFeedbackIds(control);
		return (feedbackIds.length > 0 ? feedbackIds : splitIds(control.getAttribute("aria-describedby")).filter((id) => getById(id)?.matches(SELECTOR_INVALID_FEEDBACK))).map((id) => getText(getById(id))).filter(Boolean).join(" ");
	};
	const announceInvalid = (control) => {
		setTimeout(() => {
			const message = getFeedbackText(control) || control.validationMessage;
			if (message) announce(message, { context: control });
		});
	};
	const focusFirstInvalidControl = (form) => {
		const previous = getFocusedElement(form);
		const invalidControls = [...form.elements].filter((control) => isValidatable(control) && !control.validity.valid);
		for (const control of invalidControls) {
			const moved = moveFocusTo(control);
			const focused = getFocusedElement(form);
			if (focused && focused !== form.ownerDocument.body && !focused.closest(SELECTOR_ARIA_HIDDEN) && (focused === control || moved)) {
				if (focused === previous) announceInvalid(control);
				return;
			}
		}
		if (getFocusedElement(form) !== previous) previous?.focus();
		if (getFocusedElement(form) !== previous) getFocusedElement(form)?.blur();
		if (invalidControls.length > 0) announceInvalid(invalidControls[0]);
	};
	const isFormValid = (form) => [...form.elements].every((control) => control.willValidate !== true || control.validity.valid);
	const validateForm = (form, marks, onValidate) => {
		const focusedElement = getFocusedElement(form);
		const isValid = isFormValid(form);
		if (onValidate?.(isValid)) return {
			handled: false,
			isValid
		};
		const isValidAfterHook = form.checkValidity();
		updateValidationState(form, marks);
		if (!isValidAfterHook && getFocusedElement(form) === focusedElement) focusFirstInvalidControl(form);
		return {
			handled: true,
			isValid: isValidAfterHook
		};
	};
	const getValidationState = (validationState, valid, invalid) => validationState || (invalid ? "invalid" : valid ? "valid" : void 0);
	const getStateClasses = (element) => STATE_CLASSES.filter((name) => element.classList.contains(name));
	const getServerState = (classes) => getValidationState(null, classes.includes(CLASS_NAME_IS_VALID$1), classes.includes(CLASS_NAME_IS_INVALID$1));
	const matchesSafely = (element, selector) => {
		try {
			return element.matches(selector);
		} catch {
			return false;
		}
	};
	const getUserValidity = (control) => {
		if (matchesSafely(control, SELECTOR_USER_INVALID)) return "invalid";
		return matchesSafely(control, SELECTOR_USER_VALID) ? "valid" : void 0;
	};
	const nextStateSerial = () => ++stateSerial;
	const followUserValidity = (control, onUpdate, onReset, wasReported = false) => {
		const root = control.getRootNode();
		const roots = root instanceof ShadowRoot ? [control.ownerDocument, root] : [control.ownerDocument];
		let current = control;
		let reported = wasReported;
		let reportedSinceReset = false;
		let resetTimeout;
		const read = () => reported && !current.validity.valid ? "invalid" : getUserValidity(current);
		const update = () => onUpdate(read());
		const handleInvalid = () => {
			reported = true;
			reportedSinceReset = true;
			update();
		};
		const listen = (method) => {
			for (const type of [
				"change",
				"focusout",
				"input"
			]) current[method](type, update);
			current[method]("invalid", handleInvalid);
		};
		const handleFormEvent = (event) => {
			if (event.target !== current.form) return;
			if (event.type === "submit") {
				update();
				return;
			}
			const serial = stateSerial;
			clearTimeout(resetTimeout);
			reportedSinceReset = false;
			resetTimeout = setTimeout(() => {
				if (!event.defaultPrevented) {
					reported = reportedSinceReset;
					onReset?.(serial);
				}
				update();
			});
		};
		listen("addEventListener");
		for (const node of roots) {
			node.addEventListener("reset", handleFormEvent, true);
			node.addEventListener("submit", handleFormEvent);
		}
		return {
			follow(next) {
				listen("removeEventListener");
				current = next;
				listen("addEventListener");
			},
			read,
			stop() {
				clearTimeout(resetTimeout);
				listen("removeEventListener");
				for (const node of roots) {
					node.removeEventListener("reset", handleFormEvent, true);
					node.removeEventListener("submit", handleFormEvent);
				}
			}
		};
	};
	const ownValidationState = (...controls) => {
		for (const control of controls) ownedControls.add(control);
		return () => {
			for (const control of controls) ownedControls.delete(control);
		};
	};
	const setStateValidity = (control, invalid) => {
		const ownMessage = stateMessages.get(control);
		const isOwn = ownMessage !== void 0 && control.validity.customError && (!control.willValidate || control.validationMessage === ownMessage);
		if (ownMessage !== void 0 && !isOwn) stateMessages.delete(control);
		if (!invalid) {
			if (isOwn) {
				control.setCustomValidity("");
				stateMessages.delete(control);
			}
			return;
		}
		if (control.validity.customError && !isOwn) return;
		const message = getFeedbackText(control) || STATE_INVALID_MESSAGE;
		control.setCustomValidity(message);
		stateMessages.set(control, control.willValidate ? control.validationMessage : message);
	};
	const createValueField = (tagName, getFocusTarget) => {
		const field = document.createElement(tagName);
		field.tabIndex = -1;
		field.setAttribute("aria-hidden", "true");
		field.setAttribute("autocomplete", "off");
		field.addEventListener("focus", () => getFocusTarget()?.focus());
		return field;
	};
	const configureValueField = (field, { disabled = false, name = null, readOnly = false, required = false } = {}) => {
		field.disabled = disabled;
		field.required = required;
		if (!(field instanceof HTMLSelectElement)) field.readOnly = readOnly;
		if (name) field.name = name;
		else field.removeAttribute("name");
	};
	const writeValueField = (field, value) => {
		if (field instanceof HTMLSelectElement) {
			const list = Array.isArray(value) ? value : [value];
			const values = field.multiple ? list : list.length > 0 ? list.slice(0, 1) : [""];
			const current = [...field.selectedOptions].map((option) => option.value);
			if (values.length === current.length && values.every((item, index) => item === current[index])) return false;
			field.replaceChildren(...values.map((item) => new Option(item, item, true, true)));
			return true;
		}
		const text = Array.isArray(value) ? value.join(",") : value;
		if (field.value === text) return false;
		field.value = text;
		return true;
	};
	const dispatchValueChange = (field) => {
		field.dispatchEvent(new Event("input", { bubbles: true }));
		field.dispatchEvent(new Event("change", { bubbles: true }));
	};
	const alignValueField = (field, target) => {
		const fieldRect = field.getBoundingClientRect();
		const targetRect = target.getBoundingClientRect();
		const style = getComputedStyle(field);
		const offset = getComputedStyle(target).direction === "rtl" ? targetRect.right - fieldRect.right : targetRect.left - fieldRect.left;
		field.style.top = `${Number.parseFloat(style.top) + targetRect.top - fieldRect.top}px`;
		field.style.left = `${Number.parseFloat(style.left) + offset}px`;
		field.style.height = `${targetRect.height}px`;
	};
	//#endregion
	//#region js/src/util/field-validation.ts
	var FieldValidation = class {
		constructor(host, options) {
			const root = host.getRootNode();
			this._ariaInvalid = [];
			this._described = /* @__PURE__ */ new Map();
			this._describedBy = splitIds(host.getAttribute("aria-describedby"));
			this._fields = [];
			this._frames = /* @__PURE__ */ new Map();
			this._host = host;
			this._movedDescription = false;
			this._onReset = (event) => this._handleReset(event);
			this._options = options;
			this._owner = null;
			this._parts = [];
			this._release = () => {};
			this._resetRoots = root instanceof ShadowRoot ? [host.ownerDocument, root] : [host.ownerDocument];
			this._resetTimeout = void 0;
			this._serial = nextStateSerial();
			this._serverClasses = /* @__PURE__ */ new Map();
			for (const element of options.serverClassSources?.() ?? [host]) {
				const classes = getStateClasses(element);
				if (classes.length > 0) {
					element.classList.remove(...classes);
					this._serverClasses.set(element, classes);
				}
			}
			for (const node of this._resetRoots) node.addEventListener("reset", this._onReset, true);
			this._userValidity = /* @__PURE__ */ new Map();
			this.userAction = false;
		}
		adopt(part) {
			part._owner = this;
			this._parts.push(part);
			this.update();
		}
		configure(config) {
			const keys = Object.keys(config ?? {});
			const isValidationOption = (key) => key === "validationState" || Boolean(this._options.aliases && (key === "invalid" || key === "valid"));
			if (!keys.some(isValidationOption)) return false;
			this._serverClasses.clear();
			this._serial = nextStateSerial();
			if (keys.every(isValidationOption)) {
				this.update();
				return true;
			}
			return false;
		}
		runAsUser(action) {
			const pending = this.userAction;
			this.userAction = true;
			try {
				action();
			} finally {
				this.userAction = pending && this.userAction;
			}
		}
		change() {
			if (!this.userAction && !this._owner?.change()) return false;
			this.userAction = false;
			this.dismiss();
			return true;
		}
		dismiss(serial = Number.POSITIVE_INFINITY) {
			const config = this._options.config();
			const isDropped = this._serial <= serial && this._givenState(config) !== void 0;
			if (isDropped) {
				config.validationState = null;
				if (this._options.aliases) {
					config.invalid = false;
					config.valid = false;
				}
				this._serverClasses.clear();
			}
			this._owner?.dismiss(serial);
			if (isDropped) this.update();
		}
		refresh() {
			const fields = this._options.fields();
			const followers = /* @__PURE__ */ new Map();
			for (const [index, field] of fields.entries()) {
				const replaced = this._fields[index];
				let userValidity = this._userValidity.get(field);
				if (!userValidity && replaced !== void 0 && !fields.includes(replaced)) {
					userValidity = this._userValidity.get(replaced);
					userValidity.follow(field);
				}
				followers.set(field, userValidity ?? followUserValidity(field, () => this.update()));
			}
			const kept = new Set(followers.values());
			for (const [field, userValidity] of this._userValidity) {
				if (!fields.includes(field)) setStateValidity(field, false);
				if (!kept.has(userValidity)) userValidity.stop();
			}
			this._userValidity = followers;
			if (!this._movedDescription && !fields.includes(this._host) && !this._options.pageDescribed?.(false).includes(this._host)) {
				this._movedDescription = true;
				writeAttribute(this._host, "aria-describedby", null);
			}
			this._fields = fields;
			this._release();
			this._release = ownValidationState(...this._options.owned?.() ?? fields);
			this.update();
		}
		update() {
			if (this._owner) {
				this._owner.update();
				return;
			}
			this._draw();
		}
		_draw() {
			const config = this._options.config();
			const givenState = this._givenState(config) ?? this._owner?._inheritedState();
			const fields = this._options.fields();
			const blockers = this._options.blockers?.() ?? fields;
			const blocked = givenState === "invalid" && (this._options.canBlock?.() ?? !config.disabled) ? blockers : [];
			for (const field of fields) if (!blocked.includes(field)) setStateValidity(field, false);
			const shownState = this._shownState(givenState);
			const isInvalid = shownState === "invalid" || Boolean(this._owner?._options.ownError?.());
			const state = isInvalid && shownState !== "invalid" ? void 0 : shownState;
			this._drawStateClass(state ? `is-${state}` : null);
			const invalidTargets = this._options.invalidTargets();
			this._markInvalid(invalidTargets, isInvalid);
			this._describeTargets(invalidTargets, blockers[0] ?? invalidTargets[0], isInvalid);
			for (const field of blocked) setStateValidity(field, true);
			for (const part of this._parts) part._draw();
		}
		dispose() {
			this._owner?._parts.splice(this._owner._parts.indexOf(this), 1);
			this._owner = null;
			clearTimeout(this._resetTimeout);
			for (const node of this._resetRoots) node.removeEventListener("reset", this._onReset, true);
			for (const userValidity of this._userValidity.values()) userValidity.stop();
			for (const field of this._options.fields()) setStateValidity(field, false);
			this._userValidity.clear();
			this._release();
			this._drawStateClass(null);
			this._markInvalid([], false);
			this._describe([]);
			for (const [element, classes] of this._serverClasses) element.classList.add(...classes);
			if (this._movedDescription) {
				const ids = splitIds(this._host.getAttribute("aria-describedby"));
				writeAttribute(this._host, "aria-describedby", [.../* @__PURE__ */ new Set([...this._describedBy, ...ids])].join(" ") || null);
			}
		}
		_shownState(givenState) {
			if (this._hasError()) return "invalid";
			const reported = [...this._userValidity.values()].map((userValidity) => userValidity.read());
			return givenState ?? (reported.includes("invalid") ? "invalid" : reported.find(Boolean));
		}
		_hasError() {
			return Boolean(this._options.ownError?.()) || this._parts.some((part) => part._hasError());
		}
		_inheritedState() {
			return this._givenState(this._options.config()) ?? this._owner?._inheritedState();
		}
		_givenState(config) {
			const { aliases } = this._options;
			return getValidationState(config.validationState, aliases && config.valid, aliases && config.invalid) ?? getServerState([...this._serverClasses.values()].flat());
		}
		_drawStateClass(stateClass) {
			const frames = new Set(this._options.frames());
			for (const [frame, owned] of this._frames) {
				if (owned && (owned !== stateClass || !frames.has(frame))) {
					frame.classList.remove(owned);
					this._frames.set(frame, null);
				}
				if (!frames.has(frame)) this._frames.delete(frame);
			}
			for (const frame of frames) if (stateClass && !frame.classList.contains(stateClass)) {
				frame.classList.add(stateClass);
				this._frames.set(frame, stateClass);
			} else if (!this._frames.has(frame)) this._frames.set(frame, null);
		}
		_markInvalid(targets, isInvalid) {
			for (const target of this._ariaInvalid) if (!targets.includes(target)) writeAttribute(target, "aria-invalid", null);
			this._ariaInvalid = targets;
			for (const target of targets) writeAttribute(target, "aria-invalid", isInvalid ? "true" : null);
		}
		_describeTargets(invalidTargets, source, isInvalid) {
			const feedbackIds = isInvalid && source ? getFeedbackIds(source) : [];
			const describedTargets = this._options.describedTargets?.() ?? invalidTargets;
			const pageDescribed = this._options.pageDescribed?.(isInvalid) ?? describedTargets.filter((_, index) => index === 0 || isInvalid);
			this._describe(describedTargets.map((target) => [target, [...pageDescribed.includes(target) ? this._describedBy : [], ...feedbackIds]]));
		}
		_describe(entries) {
			const next = new Map(entries);
			for (const target of this._described.keys()) if (!next.has(target)) next.set(target, []);
			for (const [target, ids] of next) {
				const written = this._described.get(target) ?? [];
				const base = splitIds(target.getAttribute("aria-describedby")).filter((id) => !written.includes(id));
				const added = [...new Set(ids)].filter((id) => !base.includes(id));
				writeAttribute(target, "aria-describedby", [...base, ...added].join(" ") || null);
				if (added.length > 0) this._described.set(target, added);
				else this._described.delete(target);
			}
		}
		_handleReset(event) {
			if (!this._options.fields().some((field) => field.form === event.target)) return;
			const serial = nextStateSerial();
			clearTimeout(this._resetTimeout);
			this._resetTimeout = setTimeout(() => {
				if (!event.defaultPrevented) {
					this.dismiss(serial);
					this._options.restore?.();
				}
			});
		}
	};
	//#endregion
	//#region js/src/util/form-control-group.ts
	const CLASS_NAME_FORM_FLOATING = "form-floating";
	const CLASS_NAME_GROUP$1 = "form-control-group";
	const CLASS_NAME_FORM_CONTROL$1 = "form-control";
	const CLASS_NAME_STAYS_ON_CONTROL = /^(?:is|was|js)-/;
	const SIZE_CLASS_NAMES$1 = [`${CLASS_NAME_FORM_CONTROL$1}-lg`, `${CLASS_NAME_FORM_CONTROL$1}-sm`];
	const applyControlGroupSize = (element, size) => {
		if (!size) return;
		element.classList.remove(...SIZE_CLASS_NAMES$1);
		element.classList.add(`${CLASS_NAME_FORM_CONTROL$1}-${size}`);
	};
	const applyControlGroupClasses = (element, ...classNames) => {
		if (element.classList.contains(CLASS_NAME_GROUP$1)) {
			element.classList.add(...classNames);
			return;
		}
		const hadStyleAttribute = element.hasAttribute("style");
		const previous = element.style.transitionProperty;
		element.style.transitionProperty = "none";
		element.classList.add(...classNames);
		reflow(element);
		element.style.transitionProperty = previous;
		if (!hadStyleAttribute && element.getAttribute("style") === "") element.removeAttribute("style");
	};
	const ensureControlGroup = (element) => {
		const existing = element.closest(`.${CLASS_NAME_GROUP$1}`);
		if (existing) return {
			created: false,
			element: existing,
			movedClassNames: []
		};
		const group = document.createElement("div");
		group.classList.add(CLASS_NAME_GROUP$1);
		const movedClassNames = [...element.classList].filter((name) => name !== CLASS_NAME_FORM_CONTROL$1 && !CLASS_NAME_STAYS_ON_CONTROL.test(name));
		element.classList.remove(...movedClassNames);
		group.classList.add(...movedClassNames);
		element.before(group);
		group.append(element);
		return {
			created: true,
			element: group,
			movedClassNames
		};
	};
	const releaseControlGroup = (element, group) => {
		element.classList.add(...group.movedClassNames);
		group.element.classList.remove(...group.movedClassNames);
		if (group.created) {
			group.element.before(element);
			group.element.remove();
		}
	};
	const appendControlGroupField = (group, field, floatingLabel, uidPrefix) => {
		if (!floatingLabel) {
			group.append(field);
			return field;
		}
		const wrapper = document.createElement("div");
		wrapper.classList.add(CLASS_NAME_FORM_FLOATING);
		field.id ||= getUID(uidPrefix);
		const label = document.createElement("label");
		label.htmlFor = field.id;
		label.textContent = floatingLabel;
		wrapper.append(label, field);
		group.append(wrapper);
		return wrapper;
	};
	const createControlGroupAction = (options) => {
		const button = document.createElement("button");
		button.classList.add(options.className);
		button.type = "button";
		button.disabled = Boolean(options.disabled);
		button.setAttribute("aria-label", options.label);
		button.innerHTML = options.sanitizeIcon(options.icon);
		return button;
	};
	//#endregion
	//#region js/src/util/icons.ts
	const svg = (content, viewBox = "0 0 512 512") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">${content}</svg>`;
	const CALENDAR_ICON = /* @__PURE__ */ svg("<path d=\"M472 96h-88V40h-32v56H160V40h-32v56H40a24.03 24.03 0 0 0-24 24v336a24.03 24.03 0 0 0 24 24h432a24.03 24.03 0 0 0 24-24V120a24.03 24.03 0 0 0-24-24Zm-8 352H48V128h80v40h32v-40h192v40h32v-40h80Z\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"368\"/>");
	const CARET_ICON = /* @__PURE__ */ svg("<path d=\"M256 382.627 60.687 187.313l22.626-22.626L256 337.372l172.687-172.685 22.626 22.626z\"/>");
	const CHECK_ICON = /* @__PURE__ */ svg("<path d=\"M425.373 89.373 196 318.745 86.627 209.373l-45.254 45.254L196 409.255l274.627-274.628z\"/>");
	const CHEVRON_DOUBLE_LEFT_ICON = /* @__PURE__ */ svg("<path d=\"M416.686 447.313 221.373 252 416.686 56.687l22.628 22.626L266.627 252l172.687 172.687z\"/><path d=\"M256.686 447.313 61.373 252 256.686 56.687l22.628 22.626L106.627 252l172.687 172.687z\"/>");
	const CHEVRON_DOUBLE_RIGHT_ICON = /* @__PURE__ */ svg("<path d=\"m95.314 447.313-22.628-22.626L245.373 252 72.686 79.313l22.628-22.626L290.627 252z\"/><path d=\"m255.314 447.313-22.628-22.626L405.373 252 232.686 79.313l22.628-22.626L450.627 252z\"/>");
	const CHEVRON_LEFT_ICON = /* @__PURE__ */ svg("<path d=\"M324.687 451.313 129.373 256 324.687 60.687l22.626 22.626L174.628 256l172.685 172.687z\"/>");
	const CHEVRON_RIGHT_ICON = /* @__PURE__ */ svg("<path d=\"m179.313 451.313-22.626-22.626L329.372 256 156.687 83.313l22.626-22.626L374.627 256z\"/>");
	const CLEANER_ICON = /* @__PURE__ */ svg("<path d=\"m427.314 107.313-22.628-22.626L256 233.373 107.314 84.687l-22.628 22.626L233.373 256 84.686 404.687l22.628 22.626L256 278.627l148.686 148.686 22.628-22.626L278.627 256z\"/>", "39.15 39.15 433.71 433.71");
	const CLOCK_ICON = /* @__PURE__ */ svg("<path d=\"M256 16C123.452 16 16 123.452 16 256s107.452 240 240 240 240-107.452 240-240S388.548 16 256 16Zm0 448c-114.875 0-208-93.125-208-208S141.125 48 256 48s208 93.125 208 208-93.125 208-208 208Z\"/><path d=\"M272 128h-32v139.314l84.686 84.687 22.628-22.628L272 254.059V128Z\"/>");
	const PICKER_ICON = /* @__PURE__ */ svg("<path d=\"M256.045 416.136.717 160.807l29.579-29.579 225.749 225.748 225.749-225.748 29.579 29.579-255.328 255.329z\"/>");
	const MINUS_ICON = /* @__PURE__ */ svg("<path d=\"M464 240H48v32h416z\"/>");
	const PASSWORD_HIDE_ICON = /* @__PURE__ */ svg("<path d=\"M397.222,131.1l-.218-.223C333.831,67.707,238.47,55.862,163.228,95.346l23.938,23.939c61.571-27.691,136.573-16.327,187.105,34.115L464,246.683v3.107l-71.744,74.585,22.63,22.63L496,262.683V233.79Z\"/><path d=\"M352.8,284.33A103.307,103.307,0,0,0,219.907,151.438L246.1,177.63a71.228,71.228,0,0,1,80.507,80.508Z\"/><path d=\"M369.9,347.268l-33.831-33.831c.088-.108.179-.212.266-.32l-22.805-22.806c-.083.113-.169.222-.253.334l-99.681-99.681c.112-.083.221-.17.334-.253L191.12,167.906c-.108.087-.213.179-.321.266L38.627,16H16V38.627l95.689,95.689L16,233.79v28.893l98.778,102.689.218.222A199.732,199.732,0,0,0,367.372,390l106,106H496V473.373L392.537,369.911Zm-177.157-131.9L288.871,311.5a71.28,71.28,0,0,1-96.133-96.133ZM137.729,343.073,48,249.79v-3.107l86.319-89.737,35.065,35.064A103.248,103.248,0,0,0,312.226,334.853l32.007,32.007C279.723,406.875,193.711,398.955,137.729,343.073Z\"/>");
	const PASSWORD_SHOW_ICON = /* @__PURE__ */ svg("<path d=\"M256,144.927A103.309,103.309,0,1,0,359.309,248.236,103.426,103.426,0,0,0,256,144.927Zm0,174.618a71.309,71.309,0,1,1,71.309-71.309A71.39,71.39,0,0,1,256,319.545Z\"/><path d=\"M397.222,131.1l-.218-.223c-77.75-77.749-204.258-77.749-282.008,0L16,233.79v28.893l98.778,102.689.218.222a199.409,199.409,0,0,0,282.008,0l99-102.911V233.79ZM464,249.79l-89.732,93.285a167.409,167.409,0,0,1-236.536,0L48,249.79v-3.107L137.729,153.4c65.247-65.13,171.3-65.13,236.542,0L464,246.683Z\"/><rect width=\"32\" height=\"32\" x=\"240\" y=\"232\" />");
	const PLUS_ICON = /* @__PURE__ */ svg("<path d=\"M464 240H272V48h-32v192H48v32h192v192h32V272h192z\"/>");
	const REMOVE_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><line x1=\"4\" y1=\"4\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"4\" x2=\"4\" y2=\"12\"/></svg>";
	const SEPARATOR_ICON = /* @__PURE__ */ svg("<path d=\"m359.873 121.377-22.627 22.627 95.997 95.997H16v32.001h417.24l-95.994 95.994 22.627 22.627L494.498 256z\"/>");
	const SEPARATOR_ICON_RTL = /* @__PURE__ */ svg("<path d=\"m152.127 121.377 22.627 22.627L78.757 240H496v32.001H78.76l95.994 95.994-22.627 22.627L17.502 256z\"/>");
	//#endregion
	//#region js/src/autocomplete.ts
	const NAME$48 = "autocomplete";
	const DATA_KEY$2 = "coreui.autocomplete";
	const EVENT_KEY$39 = `.${DATA_KEY$2}`;
	const DATA_API_KEY$33 = ".data-api";
	const ARROW_DOWN_KEY$8 = "ArrowDown";
	const BACKSPACE_KEY$3 = "Backspace";
	const DELETE_KEY$2 = "Delete";
	const ENTER_KEY$4 = "Enter";
	const ESCAPE_KEY$4 = "Escape";
	const TAB_KEY$3 = "Tab";
	const RIGHT_MOUSE_BUTTON$3 = 2;
	const EVENT_BLUR$2 = `blur${EVENT_KEY$39}`;
	const EVENT_CHANGE$10 = `change${EVENT_KEY$39}`;
	const EVENT_CLICK$13 = `click${EVENT_KEY$39}`;
	const EVENT_INPUT$11 = `input${EVENT_KEY$39}`;
	const EVENT_KEYDOWN$16 = `keydown${EVENT_KEY$39}`;
	const EVENT_KEYUP = `keyup${EVENT_KEY$39}`;
	const EVENT_MOUSEDOWN$1 = `mousedown${EVENT_KEY$39}`;
	const EVENT_CLICK_DATA_API$18 = `click${EVENT_KEY$39}${DATA_API_KEY$33}`;
	const EVENT_KEYUP_DATA_API$4 = `keyup${EVENT_KEY$39}${DATA_API_KEY$33}`;
	const EVENT_LOAD_DATA_API$21 = `load${EVENT_KEY$39}${DATA_API_KEY$33}`;
	const CLASS_NAME_AUTOCOMPLETE = "autocomplete";
	const CLASS_NAME_CLEANER$4 = "form-control-cleaner";
	const CLASS_NAME_DISABLED$10 = "disabled";
	const CLASS_NAME_INDICATOR$3 = "form-control-action";
	const CLASS_NAME_INPUT = "form-control";
	const CLASS_NAME_INPUT_HINT = "autocomplete-input-hint";
	const CLASS_NAME_INPUT_GROUP$4 = "form-control-group";
	const CLASS_NAME_SHOW$14 = "show";
	const HOST_FIELD_ATTRIBUTES = /* @__PURE__ */ new Set([
		"aria-description",
		"aria-details",
		"aria-errormessage",
		"aria-label",
		"aria-labelledby",
		"aria-placeholder",
		"aria-readonly",
		"aria-required"
	]);
	const SELECTOR_DATA_AUTOCOMPLETE = "[data-coreui-autocomplete]";
	const SELECTOR_DATA_TOGGLE_SHOWN$1 = `.autocomplete.${CLASS_NAME_SHOW$14}`;
	const SELECTOR_INDICATOR = ".form-control-action";
	const Default$42 = {
		allowList: DefaultAllowlist,
		allowOnlyDefinedOptions: false,
		ariaCleanerLabel: "Clear selection",
		ariaPickerLabel: "Toggle options list",
		cleaner: false,
		clearSearchOnSelect: true,
		container: false,
		disabled: false,
		globalSearch: true,
		highlightOptionsOnSearch: false,
		id: null,
		invalid: false,
		name: null,
		options: [],
		optionsGroupsTemplate: null,
		optionsMaxHeight: "auto",
		optionsTemplate: null,
		pickerIcon: false,
		placeholder: null,
		required: false,
		sanitize: true,
		sanitizeFn: null,
		search: null,
		searchNoResultsLabel: false,
		showHints: false,
		valid: false,
		validationState: null,
		value: null
	};
	const DefaultType$41 = {
		allowList: "object",
		allowOnlyDefinedOptions: "boolean",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		cleaner: "boolean",
		clearSearchOnSelect: "boolean",
		container: "(string|element|boolean)",
		disabled: "boolean",
		globalSearch: "boolean",
		highlightOptionsOnSearch: "boolean",
		id: "(string|null)",
		invalid: "boolean",
		name: "(string|null)",
		options: "(array|null)",
		optionsGroupsTemplate: "(function|null)",
		optionsMaxHeight: "(number|string)",
		optionsTemplate: "(function|null)",
		pickerIcon: "(string|boolean)",
		placeholder: "(string|null)",
		required: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		search: "(string|null)",
		searchNoResultsLabel: "boolean|string",
		showHints: "boolean",
		valid: "boolean",
		validationState: "(string|null|undefined)",
		value: "(number|string|null)"
	};
	var Autocomplete = class Autocomplete extends ComboboxBase {
		constructor(element, config) {
			super(element, config);
			this._uniqueId = this._config.id ?? getUID(`${this.constructor.NAME}`);
			this._cleanerElement = null;
			this._indicatorElement = null;
			this._inputElement = null;
			this._inputHintElement = null;
			this._togglerElement = null;
			this._keySerial = null;
			this._shownText = "";
			this._validation = new FieldValidation(this._element, {
				aliases: true,
				canBlock: () => !this._disabled,
				config: () => this._config,
				fields: () => [this._inputElement],
				frames: () => [this._element],
				invalidTargets: () => [this._inputElement],
				restore: () => this._restoreInitialSelection()
			});
			this._optionsElement = null;
			this._menu = null;
			this._known = /* @__PURE__ */ new Map();
			this._store = createSelectionStore((next) => next.slice(-1));
			this._disabled = this._config.disabled;
			this._givenValue = this._config.value;
			this._options = this._getOptionsFromConfig(this._config.options);
			this._floatingCleanup = null;
			this._anchoredPosition = null;
			this._search = "";
			this._seenOptionValues = /* @__PURE__ */ new Set();
			this._valueApplied = false;
			this._initialValue = this._config.value;
			this._reportSeed = false;
			this._createAutocomplete();
			this._validation.refresh();
			this._addEventListeners();
			data_default.set(this._element, DATA_KEY$2, this);
		}
		static get Default() {
			return Default$42;
		}
		static get DefaultType() {
			return DefaultType$41;
		}
		static get NAME() {
			return NAME$48;
		}
		_canShow() {
			return Boolean(this._config.searchNoResultsLabel) || (this._isExternalSearch() ? this._options : filterOptionTree(this._options, this._search)).length > 0;
		}
		_getAriaExpandedTarget() {
			return this._inputElement;
		}
		_onHideEnd() {
			if (this._inputHintElement) this._inputHintElement.value = "";
		}
		_escapeFocusTarget() {
			return this._inputElement;
		}
		dispose() {
			if (!this._element) return;
			this._validation.dispose();
			this._disposeFloating();
			this._disposeListBox();
			for (const element of [
				this._menu,
				this._optionsElement,
				this._inputHintElement,
				this._inputElement,
				this._cleanerElement,
				this._indicatorElement
			]) if (element) {
				EventHandler.off(element, EVENT_KEY$39);
				element.remove();
			}
			this._element.classList.remove(CLASS_NAME_SHOW$14);
			for (const [name, value] of this._hostAria) if (!this._element.hasAttribute(name)) this._element.setAttribute(name, value);
			super.dispose();
		}
		clear() {
			const isChanged = this._store.size() > 0 || this._shownText !== "";
			this._valueApplied = true;
			this._clearSelection();
			this.search("");
			this._filterOptionsList();
			this._setText("");
			this._validation.update();
			if (isChanged) this._triggerChangeEvent(null);
		}
		search(label) {
			this._search = label.length > 0 ? label.toLowerCase() : "";
			if (!this._isExternalSearch()) this._filterOptionsList();
			EventHandler.trigger(this._element, EVENT_INPUT$11, { value: label });
		}
		disable() {
			this._setDisabled(true);
		}
		enable() {
			this._setDisabled(false);
		}
		setOptions(options) {
			const normalized = this._normalizeOptions(options);
			this._typeCheckConfig({ options: normalized }, { options: DefaultType$41.options });
			this._options = this._getOptionsFromConfig(normalized);
			this._setListBoxItems();
			this._seedSelection();
			this._validation.update();
		}
		setValidationState(validationState) {
			const state = {
				invalid: false,
				valid: false,
				validationState
			};
			this._config = this._getConfig({
				...this._config,
				...state
			});
			this._validation.configure(state);
		}
		setValue(value) {
			this._typeCheckConfig({ value }, { value: DefaultType$41.value });
			this._givenValue = value;
			this._valueApplied = false;
			this._reportSeed = false;
			this._clearSelection();
			this._setText("");
			this._seedSelection();
			this._validation.update();
		}
		deselectAll(options = this._selectedOptions()) {
			if (this._store.size() === 0) return;
			for (const option of options) {
				if (option.disabled) continue;
				if (isOptionGroup(option)) {
					this.deselectAll(option.options);
					continue;
				}
				this._deselectOption(option.value);
				this._updateCleaner();
			}
		}
		_triggerChangeEvent(value) {
			EventHandler.trigger(this._element, EVENT_CHANGE$10, { value });
		}
		_isExternalSearch() {
			return this._config.search === "external";
		}
		_isDisabled() {
			return this._disabled;
		}
		_setDisabled(disabled) {
			if (disabled === this._disabled) return;
			this._disabled = disabled;
			if (disabled) this.hide();
			this._applyState();
			this._validation.update();
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_CLICK$13, (event) => {
				if (!this._disabled && !event.target.closest(SELECTOR_INDICATOR)) {
					this.show();
					this._inputElement.focus();
				}
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$16, (event) => {
				this._keySerial = nextStateSerial();
				if (event.key === ESCAPE_KEY$4) {
					if (this._isShown()) {
						event.preventDefault();
						event.stopPropagation();
					}
					this.hide();
					if (this._config.allowOnlyDefinedOptions && this._store.size() === 0) {
						this._emptyByUser();
						this.search("");
					}
					return;
				}
				if (this._config.globalSearch && !event.defaultPrevented && isTypingKey(event)) this._inputElement.focus();
				if (event.target === this._inputElement && (event.key === BACKSPACE_KEY$3 || event.key === DELETE_KEY$2) && this._store.size() > 0) {
					this._validation.dismiss(this._keySerial);
					this._clearSelection();
					this._validation.update();
					this._triggerChangeEvent(null);
				}
			});
			EventHandler.on(this._element, EVENT_KEYUP, () => {
				this._keySerial = null;
			});
			EventHandler.on(this._menu, EVENT_KEYDOWN$16, (event) => {
				if (this._config.globalSearch && !event.defaultPrevented && isTypingKey(event)) this._inputElement.focus();
			});
			this._addTogglerKeydownListeners();
			EventHandler.on(this._indicatorElement, EVENT_CLICK$13, (event) => {
				event.preventDefault();
				this.toggle();
			});
			EventHandler.on(this._inputElement, EVENT_BLUR$2, () => {
				const inputValue = this._inputElement.value;
				if (this._disabled || inputValue.length === 0) return;
				if (this._namesSelection(inputValue)) {
					this.hide();
					return;
				}
				const inputValueLower = inputValue.trim().toLowerCase();
				const exactMatches = getSelectableOptions(this._options).filter((option) => option.label.trim().toLowerCase() === inputValueLower);
				if (exactMatches.length === 1) {
					this._selectOption(exactMatches[0]);
					return;
				}
				if (this._config.allowOnlyDefinedOptions) {
					this._clearByUser();
					return;
				}
				this._triggerChangeEvent(inputValue);
			});
			EventHandler.on(this._inputElement, EVENT_KEYDOWN$16, (event) => {
				const handledByList = event.key === ENTER_KEY$4 && event.defaultPrevented;
				if (!handledByList && !this._isShown() && event.key !== TAB_KEY$3 && event.key !== ESCAPE_KEY$4 && event.key !== ENTER_KEY$4) this.show();
				if (handledByList) return;
				if (event.key === TAB_KEY$3 && this._inputHintElement?.value) {
					event.preventDefault();
					event.stopPropagation();
					const option = this._findHintOption(this._inputElement.value);
					if (option) this._selectOption(option);
				}
				if (event.key === ENTER_KEY$4) this._handleEnterKey(event);
			});
			EventHandler.on(this._inputElement, EVENT_INPUT$11, () => {
				const { value } = this._inputElement;
				if (value !== this._shownText) this._validation.dismiss(this._keySerial ?? Number.POSITIVE_INFINITY);
				this._shownText = value;
				this._valueApplied = true;
				this._validation.update();
				if (this._store.size() > 0) {
					this._clearSelection();
					this._triggerChangeEvent(null);
				}
				this.search(value);
				if (this._inputHintElement) {
					const option = value.trim() ? this._findHintOption(value) : void 0;
					this._inputHintElement.value = option ? `${value}${option.label.slice(value.trimStart().length)}` : "";
				}
				if (value && !this._isShown()) this.show();
			});
			EventHandler.on(this._optionsElement, EVENT_MOUSEDOWN$1, (event) => {
				event.preventDefault();
			});
			EventHandler.on(this._cleanerElement, EVENT_CLICK$13, (event) => {
				if (!this._disabled) {
					event.preventDefault();
					event.stopPropagation();
					this._clearByUser();
				}
			});
			EventHandler.on(this._cleanerElement, EVENT_KEYDOWN$16, (event) => {
				if (!this._disabled && event.key === ENTER_KEY$4) {
					event.preventDefault();
					event.stopPropagation();
					this._clearByUser();
				}
			});
		}
		_handleEnterKey(event) {
			if (event.isComposing || event.keyCode === 229) return;
			if (this._isShown()) {
				event.preventDefault();
				event.stopPropagation();
			}
			if (this._inputElement.value.length === 0) return;
			if (this._namesSelection(this._inputElement.value)) {
				this.hide();
				return;
			}
			const options = getSelectableOptions(this._options).filter((option) => option.label.trim().toLowerCase() === this._inputElement.value.trim().toLowerCase());
			if (options.length > 0) {
				if (this._store.has(String(options[0].value))) this.hide();
				else this._selectOption(options[0]);
				return;
			}
			if (this._config.allowOnlyDefinedOptions) {
				event.preventDefault();
				return;
			}
			this._triggerChangeEvent(this._inputElement.value);
			this.hide();
			if (this._config.clearSearchOnSelect) this.search("");
		}
		_syncInputName() {
			if (this._config.name) {
				this._inputElement.setAttribute("name", this._config.name.toString());
				return;
			}
			this._inputElement.removeAttribute("name");
		}
		_getOptionsFromConfig(options, disabled = false) {
			if (!options || !Array.isArray(options)) return [];
			const _options = [];
			for (const option of options) {
				if (isOptionGroup(option)) {
					const customGroupProperties = { ...option };
					delete customGroupProperties.label;
					delete customGroupProperties.options;
					_options.push({
						...customGroupProperties,
						label: option.label,
						options: this._getOptionsFromConfig(option.options, disabled || option.disabled)
					});
					continue;
				}
				const label = typeof option === "string" ? option : option.label;
				const value = option.value ?? (typeof option === "string" ? option : option.label);
				const customProperties = typeof option === "object" ? { ...option } : {};
				delete customProperties.label;
				delete customProperties.value;
				delete customProperties.selected;
				delete customProperties.disabled;
				_options.push({
					...customProperties,
					label,
					value: String(value),
					...option.selected && { selected: true },
					...(disabled || option.disabled) && { disabled: true }
				});
			}
			return _options;
		}
		_createAutocomplete() {
			this._element.classList.add(CLASS_NAME_AUTOCOMPLETE);
			this._createInputGroup();
			this._createButtons();
			this._createOptionsContainer();
			this._seedSelection();
			this._applyState();
		}
		_applyState() {
			const { required } = this._config;
			const disabled = this._disabled;
			this._element.classList.toggle(CLASS_NAME_DISABLED$10, disabled);
			this._inputElement.disabled = disabled;
			this._inputElement.required = required;
			writeAttribute(this._inputElement, "tabindex", disabled ? "-1" : null);
			if (this._indicatorElement) this._indicatorElement.disabled = disabled;
			this._updateCleaner();
		}
		_createInputGroup() {
			const togglerEl = this._element;
			this._hostAria = [...togglerEl.attributes].filter(({ name }) => HOST_FIELD_ATTRIBUTES.has(name)).map(({ name, value }) => [name, value]);
			togglerEl.removeAttribute("tabindex");
			applyControlGroupClasses(togglerEl, CLASS_NAME_INPUT_GROUP$4);
			this._togglerElement = togglerEl;
			if (this._config.showHints) {
				const inputHintEl = document.createElement("input");
				inputHintEl.classList.add(CLASS_NAME_INPUT, CLASS_NAME_INPUT_HINT);
				inputHintEl.autocomplete = "off";
				inputHintEl.readOnly = true;
				inputHintEl.tabIndex = -1;
				inputHintEl.setAttribute("aria-hidden", true);
				inputHintEl.setAttribute("form", "");
				togglerEl.append(inputHintEl);
				this._inputHintElement = inputHintEl;
			}
			const inputEl = document.createElement("input");
			inputEl.classList.add(CLASS_NAME_INPUT);
			inputEl.id = this._uniqueId;
			inputEl.autocomplete = "off";
			inputEl.placeholder = this._config.placeholder ?? "";
			inputEl.role = "combobox";
			for (const [name, value] of this._hostAria) {
				inputEl.setAttribute(name, value);
				togglerEl.removeAttribute(name);
			}
			inputEl.setAttribute("aria-autocomplete", "list");
			inputEl.setAttribute("aria-expanded", "false");
			inputEl.setAttribute("aria-haspopup", "listbox");
			togglerEl.append(inputEl);
			this._inputElement = inputEl;
			this._syncInputName();
		}
		_createButtons() {
			if (!this._config.cleaner && !this._config.pickerIcon) return;
			const buttons = this._togglerElement;
			if (this._config.cleaner) {
				const cleaner = document.createElement("button");
				cleaner.type = "button";
				cleaner.classList.add(CLASS_NAME_CLEANER$4);
				cleaner.style.display = "none";
				cleaner.setAttribute("aria-label", this._config.ariaCleanerLabel);
				cleaner.innerHTML = CLEANER_ICON;
				buttons.append(cleaner);
				this._cleanerElement = cleaner;
			}
			if (this._config.pickerIcon) {
				const indicator = document.createElement("button");
				indicator.type = "button";
				indicator.classList.add(CLASS_NAME_INDICATOR$3);
				indicator.setAttribute("aria-label", this._config.ariaPickerLabel);
				indicator.innerHTML = sanitizeByConfig(this._config.pickerIcon === true ? PICKER_ICON : this._config.pickerIcon, {
					...this._config,
					allowList: SVGAllowlist
				});
				buttons.append(indicator);
				this._indicatorElement = indicator;
			}
			this._updateCleaner();
		}
		_decorateListbox(optionsDiv) {
			optionsDiv.setAttribute("aria-labelledby", this._uniqueId);
		}
		_getActiveDescendantField() {
			return this._inputElement;
		}
		_onOptionSelected(value) {
			const foundOption = this._findOptionByValue(value);
			if (foundOption && !this._disabled) {
				this._selectOption(foundOption);
				this._inputElement.focus();
			}
		}
		_selectOption(option) {
			if (option.disabled) return;
			this._valueApplied = true;
			if (this._inputElement.value !== option.label) this._validation.dismiss();
			this._applySelection(option);
			this._validation.update();
			this._triggerChangeEvent(option);
			if (this._inputHintElement) this._inputHintElement.value = "";
			this.hide();
			if (this._config.clearSearchOnSelect) this.search("");
		}
		_applySelection(option) {
			this._known.set(String(option.value), option);
			this._commitSelection([String(option.value)]);
			this._setText(option.label);
			this._updateCleaner();
		}
		_clearSelection() {
			this._commitSelection([]);
			this._updateCleaner();
		}
		_deselectOption(value) {
			this._commitSelection(this._store.values().filter((selected) => selected !== String(value)));
		}
		_selectedOptions() {
			return this._store.values().map((value) => this._known.get(value) ?? this._findOptionByValue(value)).filter(Boolean);
		}
		_findHintOption(text) {
			return getSelectableOptions(this._options).find((option) => option.label.toLowerCase().startsWith(text.trimStart().toLowerCase()));
		}
		_namesSelection(text) {
			return this._selectedOptions().some((option) => option.label.trim() === text.trim());
		}
		_clearByUser() {
			if (this._store.size() > 0 || this._inputElement.value !== "") this._validation.dismiss();
			this.clear();
		}
		_emptyByUser() {
			if (this._inputElement.value !== "") this._validation.dismiss();
			this._setText("");
			this._validation.update();
		}
		_setText(text) {
			this._inputElement.value = text;
			this._shownText = text;
		}
		_updateCleaner() {
			if (!this._cleanerElement) return;
			if (this._store.size() > 0 && !this._disabled) {
				this._cleanerElement.style.removeProperty("display");
				return;
			}
			this._cleanerElement.style.display = "none";
		}
		_isOpenKey(event) {
			return event.key === ARROW_DOWN_KEY$8 || event.key === ENTER_KEY$4 && event.target === this._togglerElement;
		}
		_restoreInitialSelection() {
			const previous = this._selectedOptions()[0]?.value;
			const text = this._shownText;
			this._reportSeed = false;
			this._clearSelection();
			this._setText("");
			if (this._inputHintElement) this._inputHintElement.value = "";
			if (this._search !== "") this.search("");
			this._givenValue = this._initialValue;
			this._valueApplied = false;
			this._seenOptionValues.clear();
			this._seedSelection();
			this._validation.update();
			const current = this._selectedOptions()[0];
			if (current ? current.value !== previous : previous !== void 0 || text !== "") this._triggerChangeEvent(current ?? null);
			this._reportSeed = !current;
		}
		_seedSelection() {
			const options = flattenOptions(this._options);
			const value = this._givenValue;
			let seed;
			if (value === null || value === void 0 || value === "") seed = options.find((option) => option.selected && !this._seenOptionValues.has(option.value));
			else if (!this._valueApplied) {
				seed = findOptionByValue(options, value);
				this._valueApplied = Boolean(seed);
			}
			for (const option of options) this._seenOptionValues.add(option.value);
			if (seed && !this._store.has(String(seed.value))) {
				this._applySelection(seed);
				if (this._reportSeed && this._store.has(String(seed.value))) {
					this._reportSeed = false;
					this._validation.update();
					this._triggerChangeEvent(seed);
				}
			}
		}
		_afterOptionsRendered() {
			if (!this._config.highlightOptionsOnSearch || this._config.optionsTemplate) return;
			for (const option of this._getDisplayedOptions()) option.innerHTML = highlightMatches(option.textContent, this._search);
		}
		_afterFilter(visibleOptions) {
			if (visibleOptions === 0 && !this._config.searchNoResultsLabel) this.hide();
		}
		_normalizeOptions(options) {
			return typeof options === "string" ? options.split(/,\s*/).map(String) : options;
		}
		_configAfterMerge(config) {
			config = this._normalizeContainerConfig(config);
			config.options = this._normalizeOptions(config.options);
			if (config.searchNoResultsLabel === true) config.searchNoResultsLabel = "No results found";
			return config;
		}
		static autocompleteInterface(element, config, ...args) {
			const data = Autocomplete.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, Autocomplete, config, args);
		}
		static clearMenus(event) {
			if (event.button === RIGHT_MOUSE_BUTTON$3 || event.type === "keyup" && event.key !== TAB_KEY$3) return;
			const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN$1);
			for (const toggle of openToggles) {
				const context = Autocomplete.getInstance(toggle);
				if (!context) continue;
				const composedPath = event.composedPath();
				if (composedPath.includes(context._element) || composedPath.includes(context._menu)) continue;
				context.hide();
				if (context._config.allowOnlyDefinedOptions && context._store.size() === 0) context._emptyByUser();
				context.search("");
			}
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$21, () => {
		for (const autocomplete of SelectorEngine.find(SELECTOR_DATA_AUTOCOMPLETE)) Autocomplete.autocompleteInterface(autocomplete);
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$18, Autocomplete.clearMenus);
	EventHandler.on(document, EVENT_KEYUP_DATA_API$4, Autocomplete.clearMenus);
	defineJQueryPlugin(Autocomplete);
	//#endregion
	//#region js/src/button.ts
	const NAME$47 = "button";
	const EVENT_KEY$38 = `.coreui.button`;
	const DATA_API_KEY$32 = ".data-api";
	const CLASS_NAME_ACTIVE$8 = "active";
	const SELECTOR_DATA_TOGGLE$13 = "[data-coreui-toggle=\"button\"]";
	const EVENT_CLICK_DATA_API$17 = `click${EVENT_KEY$38}${DATA_API_KEY$32}`;
	const EVENT_DOM_CONTENT_LOADED$2 = `DOMContentLoaded${EVENT_KEY$38}${DATA_API_KEY$32}`;
	var Button = class Button extends BaseComponent {
		static get NAME() {
			return NAME$47;
		}
		toggle() {
			setAriaAttribute(this._element, "aria-pressed", this._element.classList.toggle(CLASS_NAME_ACTIVE$8));
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Button, config);
		}
	};
	EventHandler.on(document, EVENT_DOM_CONTENT_LOADED$2, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE$13)) if (!element.hasAttribute("aria-pressed")) setAriaAttribute(element, "aria-pressed", element.classList.contains(CLASS_NAME_ACTIVE$8));
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$17, SELECTOR_DATA_TOGGLE$13, (event) => {
		event.preventDefault();
		const button = event.target.closest(SELECTOR_DATA_TOGGLE$13);
		Button.getOrCreateInstance(button).toggle();
	});
	defineJQueryPlugin(Button);
	//#endregion
	//#region js/src/util/calendar.ts
	const createDate = (year, month = 0, day = 1) => {
		const date = new Date(year, month, day);
		date.setFullYear(year, month, day);
		date.setHours(0, 0, 0, 0);
		return date;
	};
	const parseToDateString = (value) => {
		const [, month, day, year] = /^\w{3} (\w{3}) (\d{2}) (-?\d{4,})$/.exec(value) ?? [];
		const monthIndex = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		].indexOf(month);
		return monthIndex === -1 ? /* @__PURE__ */ new Date(NaN) : createDate(Number(year), monthIndex, Number(day));
	};
	const getWeekLabel = (locale) => {
		try {
			const label = new Intl.DisplayNames(locale, { type: "dateTimeField" }).of("weekOfYear");
			return label ? label.charAt(0).toLocaleUpperCase(locale) + label.slice(1) : "Week";
		} catch {
			return "Week";
		}
	};
	const getWeekNumberName = (weekNumber, weekLabel, label) => label?.(weekNumber) || `${weekLabel} ${weekNumber}`;
	const getDateOfISOWeek = (year, week) => {
		const date = createDate(year, 0, 4);
		date.setDate(date.getDate() - (date.getDay() + 6) % 7 + (week - 1) * 7);
		return date;
	};
	const ARROW_KEYS = /* @__PURE__ */ new Set([
		"ArrowDown",
		"ArrowLeft",
		"ArrowRight",
		"ArrowUp"
	]);
	const MODIFIER_KEYS$1 = /* @__PURE__ */ new Set([
		"Alt",
		"Control",
		"Meta",
		"Shift"
	]);
	const GREGORIAN_MONTH_CALENDARS = /* @__PURE__ */ new Set([
		"buddhist",
		"gregory",
		"iso8601",
		"japanese",
		"roc"
	]);
	const yearBeforeMonth = /* @__PURE__ */ new Map();
	const CELL_NAME_FORMATS = {
		days: {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric"
		},
		months: {
			month: "long",
			year: "numeric"
		},
		years: { year: "numeric" }
	};
	const VIEW_BY_SELECTION_TYPE$1 = {
		day: "days",
		week: "days",
		month: "months",
		quarter: "quarters",
		year: "years"
	};
	const MONTHS_IN_PERIOD = {
		months: 1,
		quarters: 3,
		years: 12
	};
	const getPeriod = (date, view) => {
		if (view === "weeks") return getMonday(date).getTime();
		return Math.floor((date.getFullYear() * 12 + date.getMonth()) / MONTHS_IN_PERIOD[view]);
	};
	const isEveryDayDisabled = (start, end, min, max, disabledDates) => {
		const first = min && min > start ? createDate(min.getFullYear(), min.getMonth(), min.getDate()) : start;
		const last = max && max < end ? createDate(max.getFullYear(), max.getMonth(), max.getDate()) : end;
		for (const currentDate = new Date(first); currentDate.getTime() <= last.getTime(); currentDate.setDate(currentDate.getDate() + 1)) if (!isDateDisabled(currentDate, null, null, disabledDates)) return false;
		return true;
	};
	const convertIsoWeekToDate = (isoWeek) => {
		const [year, week] = isoWeek.split(/[Ww]/);
		const parsedYear = parseYearSmart(year);
		return getDateOfISOWeek(parsedYear, Number.parseInt(week, 10));
	};
	const parseWeekString = (dateString) => {
		for (const pattern of [
			/^(\d{4})-W(\d{1,2})$/,
			/^(\d{4})W(\d{1,2})$/,
			/^(\d{4})\s+W(\d{1,2})$/
		]) {
			const match = dateString.trim().match(pattern);
			if (match) {
				const parsedYear = parseYearSmart(match[1]);
				const parsedWeek = Number.parseInt(match[2], 10);
				return getDateOfISOWeek(parsedYear, parsedWeek);
			}
		}
		return convertIsoWeekToDate(dateString);
	};
	const parseQuarterString = (dateString) => {
		for (const pattern of [
			/^(\d{4})-Q(\d{1})$/,
			/^(\d{4})Q(\d{1})$/,
			/^(\d{4})\s+Q(\d{1})$/
		]) {
			const match = dateString.trim().match(pattern);
			if (match) {
				const parsedYear = parseYearSmart(match[1]);
				const parsedQuarter = Number.parseInt(match[2], 10);
				if (parsedQuarter >= 1 && parsedQuarter <= 4) {
					const monthIndex = (parsedQuarter - 1) * 3;
					return createDate(parsedYear, monthIndex, 1);
				}
			}
		}
		return null;
	};
	const parseMonthString = (dateString) => {
		for (const pattern of [/^(\d{2,4})[-/.\s](\d{1,2})$/, /^(\d{1,2})[-/.\s](\d{2,4})$/]) {
			const match = dateString.trim().match(pattern);
			if (match) {
				const firstGroup = match[1];
				const secondGroup = match[2];
				const parsedFirst = Number.parseInt(firstGroup, 10);
				const parsedSecond = Number.parseInt(secondGroup, 10);
				let parsedYear;
				let parsedMonth;
				if (firstGroup.length >= 3 || parsedFirst >= 100) {
					parsedYear = parseYearSmart(firstGroup);
					parsedMonth = parsedSecond - 1;
				} else if (secondGroup.length >= 3 || parsedSecond >= 100) {
					parsedYear = parseYearSmart(secondGroup);
					parsedMonth = parsedFirst - 1;
				} else if (parsedSecond >= 1 && parsedSecond <= 12 && (parsedFirst > 12 || parsedFirst < 1)) {
					parsedYear = parseYearSmart(firstGroup);
					parsedMonth = parsedSecond - 1;
				} else {
					parsedYear = parseYearSmart(secondGroup);
					parsedMonth = parsedFirst - 1;
				}
				if (parsedMonth >= 0 && parsedMonth <= 11) return createDate(parsedYear, parsedMonth, 1);
			}
		}
		return null;
	};
	const parseYearString = (dateString) => {
		const yearString = String(dateString);
		const match = yearString.trim().match(/^(\d{2,4})$/);
		if (match) {
			const groups = { year: match[1] };
			return createDateFromYear(groups);
		}
		return parseLocalDateString(yearString);
	};
	const generateDatePatterns = (locale, includeTime) => {
		const referenceDate = new Date(2013, 11, 31, 17, 19, 22);
		const patterns = [];
		try {
			const standardFormat = includeTime ? referenceDate.toLocaleString(locale, { calendar: "gregory" }) : referenceDate.toLocaleDateString(locale, { calendar: "gregory" });
			patterns.push(standardFormat);
		} catch {
			const standardFormat = includeTime ? referenceDate.toLocaleString("en-US") : referenceDate.toLocaleDateString("en-US");
			patterns.push(standardFormat);
		}
		const separators = [
			"/",
			"-",
			".",
			" "
		];
		const standardFormat = patterns[0];
		let originalSeparator = "/";
		if (standardFormat.includes("/")) originalSeparator = "/";
		else if (standardFormat.includes("-")) originalSeparator = "-";
		else if (standardFormat.includes(".")) originalSeparator = ".";
		for (const sep of separators) if (sep !== originalSeparator) {
			const escapedSeparator = originalSeparator.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
			const altFormat = standardFormat.replaceAll(new RegExp(escapedSeparator, "g"), sep);
			patterns.push(altFormat);
		}
		return patterns;
	};
	const buildDateRegexPattern = (formatString, includeTime) => {
		let regexPattern = formatString.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
		regexPattern = regexPattern.replace("2013", String.raw`(?<year>\d{2,4})`).replace("12", String.raw`(?<month>\d{1,2})`).replace("31", String.raw`(?<day>\d{1,2})`);
		if (includeTime) regexPattern = regexPattern.replaceAll(/17|5/g, String.raw`(?<hour>\d{1,2})`).replace("19", String.raw`(?<minute>\d{1,2})`).replace("22", String.raw`(?<second>\d{1,2})`).replaceAll(/AM|PM/gi, "(?<ampm>[APap][Mm])");
		return regexPattern;
	};
	const tryParseWithPatterns = (dateString, patterns, includeTime) => {
		for (const pattern of patterns) {
			const regexPattern = buildDateRegexPattern(pattern, includeTime);
			const regex = new RegExp(`^${regexPattern}$`);
			const match = dateString.trim().match(regex);
			if (match?.groups) return match.groups;
		}
		return null;
	};
	const readWrittenDay = (dateString, locale) => {
		const iso = /^(?<year>\d{4,})-(?<month>\d{1,2})-(?<day>\d{1,2})(?!\d)/.exec(dateString);
		if (iso?.groups) return iso.groups;
		for (const pattern of generateDatePatterns(locale, false)) {
			const match = new RegExp(`^${buildDateRegexPattern(pattern, false)}(?!\\d)`).exec(dateString);
			if (match?.groups) return match.groups;
		}
		return null;
	};
	const convertTo24Hour = (hour, ampm) => {
		const parsedHour = Number.parseInt(hour, 10);
		if (!ampm) return parsedHour;
		const isPM = ampm.toLowerCase() === "pm";
		if (isPM && parsedHour !== 12) return parsedHour + 12;
		if (!isPM && parsedHour === 12) return 0;
		return parsedHour;
	};
	const validateTimeComponents = (hour, minute, second) => {
		return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59;
	};
	const validateDateComponents = (year, month, day) => {
		const parsedMonth = Number.parseInt(month, 10);
		const parsedDay = Number.parseInt(day, 10);
		return parsedMonth >= 1 && parsedMonth <= 12 && parsedDay >= 1 && parsedDay <= createDate(parseYearSmart(year), parsedMonth, 0).getDate();
	};
	const createDateWithTime = (groups) => {
		const { year, month, day, hour, minute, second, ampm } = groups;
		if (ampm && Number.parseInt(hour, 10) > 12) return null;
		const parsedYear = parseYearSmart(year);
		const parsedMonth = Number.parseInt(month, 10) - 1;
		const parsedDay = Number.parseInt(day, 10);
		const parsedHour = convertTo24Hour(hour, ampm);
		const parsedMinute = Number.parseInt(minute ?? "0", 10) || 0;
		const parsedSecond = Number.parseInt(second ?? "0", 10) || 0;
		if (!validateTimeComponents(parsedHour, parsedMinute, parsedSecond)) return null;
		const date = createDate(parsedYear, parsedMonth, parsedDay);
		date.setHours(parsedHour, parsedMinute, parsedSecond);
		return date;
	};
	const createDateOnly = (groups) => {
		const { year, month, day } = groups;
		if (!validateDateComponents(year, month, day)) return null;
		const parsedYear = parseYearSmart(year);
		const parsedMonth = Number.parseInt(month, 10) - 1;
		return createDate(parsedYear, parsedMonth, Number.parseInt(day, 10));
	};
	const getExpectedPartsCount = (patterns) => {
		if (patterns.length === 0) return 3;
		return patterns[0].split(/[-/.\s:]+/).filter((part) => part.length > 0).length;
	};
	const parseDayString = (dateString, locale, includeTime) => {
		const patterns = generateDatePatterns(locale, includeTime);
		const groups = tryParseWithPatterns(dateString, patterns, includeTime);
		if (!groups) {
			const trimmed = dateString.trim();
			const hasDateSeparators = /[-/.:]/.test(trimmed);
			const parts = trimmed.split(/[-/.\s:]+/).filter((part) => part.length > 0);
			const expectedPartsCount = getExpectedPartsCount(patterns);
			const hasRequiredParts = parts.length >= expectedPartsCount;
			if (hasDateSeparators && hasRequiredParts) {
				const written = readWrittenDay(trimmed, locale);
				return written && !validateDateComponents(written.year, written.month, written.day) ? null : parseLocalDateString(dateString);
			}
			return null;
		}
		if ("year" in groups && "month" in groups && "day" in groups) {
			const { year, month, day } = groups;
			if (!validateDateComponents(year, month, day)) return null;
		} else return null;
		return includeTime ? createDateWithTime(groups) : createDateOnly(groups);
	};
	const parseLocalDateString = (dateString) => {
		const trimmed = dateString.trim();
		const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
		const _date = new Date(Date.parse(isoDateOnly ? `${trimmed}T00:00` : dateString));
		if (!Number.isNaN(_date.getTime())) return _date;
		return null;
	};
	const convertToDateObject = (date, selectionType, locale = "en-US", includeTime = false) => {
		if (!date) return null;
		if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : date;
		const parsers = {
			week: parseWeekString,
			month: parseMonthString,
			quarter: parseQuarterString,
			year: parseYearString
		};
		const value = typeof date === "number" ? String(date) : date;
		const parse = selectionType ? parsers[selectionType] : void 0;
		const parsed = parse ? parse(value) : parseDayString(value, locale, includeTime);
		return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
	};
	const convertToSelectionDate = (date, selectionType) => {
		const value = convertToDateObject(date, selectionType);
		return value && selectionType === "week" ? getMonday(value) : value;
	};
	const convertToShownDate = (date, selectionType, firstDayOfWeek) => {
		const value = convertToDateObject(date, selectionType);
		if (!value || selectionType !== "week") return value;
		const rowStart = getWeekRowStart(value, firstDayOfWeek);
		const rowEnd = createDate(rowStart.getFullYear(), rowStart.getMonth(), rowStart.getDate() + 6);
		const monday = getMonday(value);
		return [rowStart, rowEnd].some((day) => day.getFullYear() === value.getFullYear() && day.getMonth() === value.getMonth()) ? value : createDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3);
	};
	const convertToLimitDate = (date, selectionType) => {
		const value = convertToDateObject(date, selectionType);
		if (!value || selectionType !== "week") return value;
		const monday = getMonday(value);
		return createDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3);
	};
	const getLocalDateFromString = (dateString, locale = "en-US", includeTime = false, selectionType = "day") => {
		if (!dateString || typeof dateString !== "string") return null;
		return convertToDateObject(dateString, selectionType, locale, includeTime);
	};
	const createGroupsInArray = (arr, numberOfGroups) => {
		const perGroup = Math.ceil(arr.length / numberOfGroups);
		return Array.from({ length: numberOfGroups }).fill("").map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup));
	};
	const getCalendarDate = (calendarDate, order, view) => {
		if (order !== 0 && view === "days") return createDate(calendarDate.getFullYear(), calendarDate.getMonth() + order, 1);
		if (order !== 0 && (view === "months" || view === "quarters")) return createDate(calendarDate.getFullYear() + order, calendarDate.getMonth(), 1);
		if (order !== 0 && view === "years") return createDate(calendarDate.getFullYear() + 12 * order, calendarDate.getMonth(), 1);
		return calendarDate;
	};
	const getDateBySelectionType = (date, selectionType) => {
		if (date === null) return null;
		if (selectionType === "week") {
			const { year, weekNumber } = getISOWeekNumberAndYear(date);
			return `${String(year).padStart(4, "0")}W${weekNumber.toString().padStart(2, "0")}`;
		}
		const year = String(date.getFullYear()).padStart(4, "0");
		if (selectionType === "month") return `${year}-${`0${date.getMonth() + 1}`.slice(-2)}`;
		if (selectionType === "quarter") return `${year}Q${Math.floor(date.getMonth() / 3) + 1}`;
		if (selectionType === "year") return year;
		return date;
	};
	const createDateTimeFormat = (locale, options) => {
		const formatter = new Intl.DateTimeFormat(locale, options);
		return options?.calendar || GREGORIAN_MONTH_CALENDARS.has(formatter.resolvedOptions().calendar) ? formatter : new Intl.DateTimeFormat(locale, {
			...options,
			calendar: "gregory"
		});
	};
	const isYearBeforeMonth = (locale) => {
		const key = locale ?? "";
		if (!yearBeforeMonth.has(key)) {
			const parts = createDateTimeFormat(locale, {
				month: "long",
				year: "numeric"
			}).formatToParts(new Date(2e3, 0, 1));
			yearBeforeMonth.set(key, parts.findIndex(({ type }) => type === "year") < parts.findIndex(({ type }) => type === "month"));
		}
		return yearBeforeMonth.get(key);
	};
	const getMonthsNames = (locale, format = "short") => {
		const formatter = createDateTimeFormat(locale, { month: format });
		return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2e3, i, 1)));
	};
	const createDateFormatter = () => {
		const formatters = /* @__PURE__ */ new Map();
		return (date, locale, options) => {
			if (Number.isNaN(date.getTime())) return date.toLocaleDateString(locale, options);
			const key = `${locale}|${options ? JSON.stringify(options) : ""}`;
			let formatter = formatters.get(key);
			if (!formatter) {
				formatter = createDateTimeFormat(locale, options);
				formatters.set(key, formatter);
			}
			return formatter.format(date);
		};
	};
	const getYears = (year, range = 6) => {
		return Array.from({ length: range * 2 }, (_, i) => year - range + i);
	};
	const formatYearsRange = (year, locale) => {
		const years = getYears(year);
		const [start, end] = [years[0], years.at(-1)].map((value) => createDate(value));
		const range = createDateTimeFormat(locale, { year: "numeric" }).formatRange(start, end);
		return /(?!\p{Nd})[\u0590-\u08FF]/u.test(range) ? `\u2067${range}\u2069` : range;
	};
	const formatCellName = (date, view, format) => view === "quarters" ? `Q${Math.floor(date.getMonth() / 3) + 1} ${format(date, { year: "numeric" })}` : format(date, CELL_NAME_FORMATS[view]);
	const formatWeekName = (days, locale) => createDateTimeFormat(locale, {
		day: "numeric",
		month: "long",
		year: "numeric"
	}).formatRange(days[0].date, days.at(-1).date);
	const formatSelectionName = (date, { ariaWeekNumberLabel = null, firstDayOfWeek = 1, locale, selectionType = "day", showWeekNumber = false } = {}) => {
		if (selectionType !== "week") return formatCellName(date, VIEW_BY_SELECTION_TYPE$1[selectionType], (value, options) => createDateTimeFormat(locale, options).format(value));
		const first = getWeekRowStart(date, firstDayOfWeek);
		const name = formatWeekName([{ date: first }, { date: createDate(first.getFullYear(), first.getMonth(), first.getDate() + 6) }], locale);
		return showWeekNumber ? `${getWeekNumberName(getISOWeekNumberAndYear(date).weekNumber, getWeekLabel(locale ?? ""), ariaWeekNumberLabel)}, ${name}` : name;
	};
	const formatSelectionRangeName = (start, end, options = {}) => {
		const { ariaWeekNumberLabel = null, firstDayOfWeek = 1, locale, selectionType = "day", showWeekNumber = false } = options;
		const startName = formatSelectionName(start, options);
		const endName = formatSelectionName(end, options);
		if (startName === endName) return startName;
		if (selectionType === "quarter" || end < start) return `${startName} – ${endName}`;
		if (selectionType === "week") {
			const last = getWeekRowStart(end, firstDayOfWeek);
			const days = createDateTimeFormat(locale, {
				day: "numeric",
				month: "long",
				year: "numeric"
			}).formatRange(getWeekRowStart(start, firstDayOfWeek), createDate(last.getFullYear(), last.getMonth(), last.getDate() + 6));
			const weekName = (date) => getWeekNumberName(getISOWeekNumberAndYear(date).weekNumber, getWeekLabel(locale ?? ""), ariaWeekNumberLabel);
			return showWeekNumber ? `${weekName(start)} – ${weekName(end)}, ${days}` : days;
		}
		return createDateTimeFormat(locale, CELL_NAME_FORMATS[VIEW_BY_SELECTION_TYPE$1[selectionType]]).formatRange(start, end);
	};
	const getLeadingDays = (year, month, firstDayOfWeek) => {
		const dates = [];
		const d = createDate(year, month);
		const y = d.getFullYear();
		const m = d.getMonth();
		let leadingDays = 6 - (6 - createDate(y, m, 1).getDay()) - firstDayOfWeek;
		if (firstDayOfWeek) leadingDays = leadingDays < 0 ? 7 + leadingDays : leadingDays;
		for (let i = leadingDays * -1; i < 0; i++) dates.push({
			date: createDate(y, m, i + 1),
			month: "previous"
		});
		return dates;
	};
	const getMonthDays = (year, month) => {
		const dates = [];
		const lastDay = createDate(year, month + 1, 0).getDate();
		for (let i = 1; i <= lastDay; i++) dates.push({
			date: createDate(year, month, i),
			month: "current"
		});
		return dates;
	};
	const getTrailingDays = (year, month, leadingDays, monthDays) => {
		const dates = [];
		const days = 42 - (leadingDays.length + monthDays.length);
		for (let i = 1; i <= days; i++) dates.push({
			date: createDate(year, month + 1, i),
			month: "next"
		});
		return dates;
	};
	const getISOWeekNumberAndYear = (date) => {
		const tempDate = new Date(date);
		tempDate.setHours(0, 0, 0, 0);
		tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
		const week1 = new Date(tempDate);
		week1.setMonth(0, 4);
		return {
			weekNumber: 1 + Math.round((tempDate.getTime() - week1.getTime()) / 6048e5),
			year: tempDate.getFullYear()
		};
	};
	const getMonthDetails = (year, month, firstDayOfWeek) => {
		const daysPrevMonth = getLeadingDays(year, month, firstDayOfWeek);
		const daysThisMonth = getMonthDays(year, month);
		const daysNextMonth = getTrailingDays(year, month, daysPrevMonth, daysThisMonth);
		const days = [
			...daysPrevMonth,
			...daysThisMonth,
			...daysNextMonth
		];
		const weeks = [];
		for (const [index, day] of days.entries()) {
			if (index % 7 === 0 || weeks.length === 0) weeks.push({
				week: {
					number: 0,
					year: 0
				},
				days: []
			});
			if (index % 7 === 3) {
				const { weekNumber, year } = getISOWeekNumberAndYear(day.date);
				const lastWeek = weeks[weeks.length - 1];
				if (lastWeek) lastWeek.week = {
					number: weekNumber,
					year
				};
			}
			const lastWeek = weeks[weeks.length - 1];
			if (lastWeek) lastWeek.days.push(day);
		}
		return weeks;
	};
	const getClosestTarget = (targets, anchor, rows) => {
		let closest;
		let closestGap = Number.POSITIVE_INFINITY;
		for (const target of targets) {
			if (!rows && target.adjacent) continue;
			const time = anchor.getTime();
			const gap = time < target.position.getTime() ? target.position.getTime() - time : Math.max(0, time - target.end.getTime());
			if (gap < closestGap || gap === closestGap && closest?.adjacent && !target.adjacent) {
				closest = target;
				closestGap = gap;
			}
		}
		return closest;
	};
	const getSelectableDates = (element, selector = "tr[tabindex], td[tabindex]") => [...Element.prototype.querySelectorAll.call(element, selector)];
	const getClosestSelectable = (elements, anchor, rows) => {
		const targets = [];
		for (const element of elements) {
			const cells = rows ? [...element.querySelectorAll("td[data-coreui-date]")] : [element];
			const first = cells[0]?.dataset.coreuiDate;
			const last = cells.at(-1)?.dataset.coreuiDate;
			if (first && last) {
				const position = parseToDateString(first);
				targets.push({
					adjacent: cells[0].matches(".previous, .next"),
					date: position,
					element,
					end: parseToDateString(last),
					position,
					selected: element.classList.contains("selected")
				});
			}
		}
		return getClosestTarget(targets, anchor, rows)?.element;
	};
	const setRovingTabIndex = (element, selector, anchor, rows, preferred) => {
		const empty = !element.querySelector(selector);
		for (const panel of element.querySelectorAll(".calendar")) {
			const targets = getSelectableDates(panel, selector);
			const grid = panel.querySelector("table");
			if (empty) grid?.setAttribute("tabindex", "0");
			else grid?.removeAttribute("tabindex");
			for (const stale of panel.querySelectorAll("td[tabindex=\"0\"], tr[tabindex=\"0\"]")) if (!targets.includes(stale)) stale.tabIndex = -1;
			if (targets.length === 0) continue;
			const active = (preferred && targets.includes(preferred) ? preferred : void 0) ?? targets.find((target) => target.classList.contains("selected")) ?? (anchor ? getClosestSelectable(targets, anchor, rows) : void 0) ?? targets[0];
			for (const target of targets) {
				const tabIndex = target === active ? 0 : -1;
				if (target.tabIndex !== tabIndex) target.tabIndex = tabIndex;
			}
		}
	};
	const getStartOfView = (date, view) => {
		const value = new Date(date);
		value.setHours(0, 0, 0, 0);
		if (view === "months") value.setDate(1);
		if (view === "quarters") value.setMonth(Math.floor(value.getMonth() / 3) * 3, 1);
		if (view === "years") value.setMonth(0, 1);
		return value;
	};
	const getStartOfWeek = (date, firstDayOfWeek) => {
		const value = new Date(date);
		value.setDate(value.getDate() - (value.getDay() - firstDayOfWeek + 7) % 7);
		return value;
	};
	const getWeekRowDate = (rowStart) => getMonday(createDate(rowStart.getFullYear(), rowStart.getMonth(), rowStart.getDate() + 3));
	const getMonday = (date) => {
		const monday = getStartOfWeek(date, 1);
		return createDate(monday.getFullYear(), monday.getMonth(), monday.getDate());
	};
	const getWeekRowStart = (date, firstDayOfWeek) => {
		const monday = getMonday(date);
		return getStartOfWeek(createDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3), firstDayOfWeek);
	};
	const getViewEdge = (forward, { calendarDate, calendars, view }) => {
		const year = calendarDate.getFullYear();
		const month = calendarDate.getMonth();
		const last = calendars - 1;
		if (view === "days") return forward ? createDate(year, month + last + 1, 0) : createDate(year, month, 1);
		if (view === "years") return createDate(forward ? year + 6 - 1 + 12 * last : year - 6, 0, 1);
		return forward ? createDate(year + last, view === "quarters" ? 9 : 11, 1) : createDate(year, 0, 1);
	};
	const getPanelMonth = ({ calendarDate, panel }) => [createDate(calendarDate.getFullYear(), calendarDate.getMonth() + panel, 1), createDate(calendarDate.getFullYear(), calendarDate.getMonth() + panel + 1, 0)];
	const isUnfocusable = (date, { maxDate, minDate, rows, view }) => isCellOutsideLimits(date, view, minDate, maxDate, rows);
	const walkToFocusable = (start, date, context) => {
		const { rows, view } = context;
		const sign = start > date ? -1 : 1;
		const isShort = (value) => sign * (date.getTime() - value.getTime()) > 0;
		while (isUnfocusable(start, context) && isShort(start)) if (view === "days") start.setDate(start.getDate() + sign * (rows ? 7 : 1));
		else start.setMonth(start.getMonth() + sign * MONTHS_IN_PERIOD[view]);
		return start;
	};
	const getArrowTarget = (date, forward, vertical, context) => {
		const { firstDayOfWeek, rows, view } = context;
		const [days, months] = {
			days: vertical || rows ? [7, 0] : [1, 0],
			months: vertical ? [0, 3] : [0, 1],
			quarters: vertical ? [0, 12] : [0, 3],
			years: vertical ? [0, 36] : [0, 12]
		}[view];
		const sign = forward ? 1 : -1;
		const target = rows ? getStartOfWeek(date, firstDayOfWeek) : new Date(date);
		target.setMonth(target.getMonth() + sign * months, target.getDate() + sign * days);
		return isUnfocusable(target, context) ? null : target;
	};
	const getGridArrowTarget = (forward, context) => {
		const { firstDayOfWeek, maxDate, minDate, rows, view } = context;
		const limit = forward ? minDate ?? createDate(1) : maxDate;
		if (!limit) return null;
		const target = getStartOfView(limit, view);
		const edge = getViewEdge(forward, context);
		if (forward ? edge >= target : edge <= target) return null;
		return rows ? getStartOfWeek(target, firstDayOfWeek) : target;
	};
	const getRevealOffset = (date, { calendarDate, calendars, rows, view }) => {
		if (view === "days") {
			const end = new Date(date);
			end.setDate(end.getDate() + (rows ? 6 : 0));
			const monthsFrom = (value) => (value.getFullYear() - calendarDate.getFullYear()) * 12 + value.getMonth() - calendarDate.getMonth();
			return {
				months: monthsFrom(end) < 0 ? monthsFrom(end) : Math.max(0, monthsFrom(date) - calendars + 1),
				years: 0
			};
		}
		if (view === "years") {
			const page = Math.floor((date.getFullYear() - calendarDate.getFullYear() + 6) / 12);
			return {
				months: 0,
				years: 12 * (page < 0 ? page : Math.max(0, page - calendars + 1))
			};
		}
		const delta = date.getFullYear() - calendarDate.getFullYear();
		return {
			months: 0,
			years: delta < 0 ? delta : Math.max(0, delta - calendars + 1)
		};
	};
	const getRowEdge = (date, last, context) => {
		const { calendarDate, firstDayOfWeek, rows, view } = context;
		const year = date.getFullYear();
		const month = date.getMonth();
		let edge;
		if (view === "days" && rows) edge = getStartOfWeek(getPanelMonth(context)[last ? 1 : 0], firstDayOfWeek);
		else switch (view) {
			case "days":
				edge = getStartOfWeek(createDate(year, month, date.getDate()), firstDayOfWeek);
				edge.setDate(edge.getDate() + (last ? 6 : 0));
				break;
			case "months":
				edge = createDate(year, month - month % 3 + (last ? 2 : 0), 1);
				break;
			case "quarters":
				edge = createDate(year, last ? 9 : 0, 1);
				break;
			default: {
				const offset = year - calendarDate.getFullYear() + 6;
				edge = createDate(year - offset % 3 + (last ? 2 : 0), 0, 1);
			}
		}
		if ((last ? -1 : 1) * (date.getTime() - edge.getTime()) < 0) return new Date(date);
		return walkToFocusable(edge, date, context);
	};
	const moveTo = (target, context) => target ? {
		date: target,
		...getRevealOffset(target, context),
		type: "move"
	} : { type: "stay" };
	const getPageOffset = (direction, shiftKey, view) => view === "days" && !shiftKey ? {
		months: direction,
		years: 0
	} : {
		months: 0,
		years: direction * (view === "years" ? 12 : 1)
	};
	const getPageAction = (date, direction, shiftKey, context) => {
		const { firstDayOfWeek, keptDay, maxDate, minDate, rows, view } = context;
		const offset = getPageOffset(direction, shiftKey, view);
		const kept = keptDay && isSameDateAs(keptDay.focused, date) ? keptDay : null;
		const day = kept ? kept.day : date.getDate();
		const from = kept ? kept.target : date;
		const target = new Date(date);
		target.setFullYear(from.getFullYear() + offset.years, from.getMonth() + offset.months, 1);
		target.setDate(Math.min(day, createDate(target.getFullYear(), target.getMonth() + 1, 0).getDate()));
		const bound = direction > 0 ? maxDate : minDate ?? createDate(1);
		const [first, last] = getPanelMonth(context);
		let start;
		if (bound && isUnfocusable(rows ? getStartOfWeek(target, firstDayOfWeek) : target, context)) {
			const edge = getStartOfView(bound, view);
			start = rows ? getStartOfWeek(edge, firstDayOfWeek) : edge;
		} else if (view === "days" && !rows && (date < first || date > last)) start = target;
		else return {
			date: target,
			keptDay: {
				day,
				focused: rows ? getStartOfWeek(target, firstDayOfWeek) : target,
				target
			},
			...offset,
			type: "page"
		};
		const stop = walkToFocusable(start, date, context);
		if (stop.getTime() === date.getTime()) return { type: "stay" };
		return {
			date: stop,
			keptDay: {
				day,
				focused: stop,
				target: stop
			},
			...getRevealOffset(stop, context),
			type: "move"
		};
	};
	const isForwardKey = (key, rtl) => key === "ArrowDown" || key === (rtl ? "ArrowLeft" : "ArrowRight");
	const getGridKeyAction = ({ key, shiftKey }, context) => {
		if (ARROW_KEYS.has(key)) return moveTo(getGridArrowTarget(isForwardKey(key, context.rtl), context), context);
		if (key === "PageDown" || key === "PageUp") return {
			...getPageOffset(key === "PageDown" ? 1 : -1, shiftKey, context.view),
			type: "page"
		};
		return key === "End" || key === "Home" ? { type: "stay" } : null;
	};
	const getCellKeyAction = ({ code, key, repeat, shiftKey }, date, context) => {
		if (ARROW_KEYS.has(key)) return moveTo(getArrowTarget(date, isForwardKey(key, context.rtl), key === "ArrowDown" || key === "ArrowUp", context), context);
		if (code === "Space" || key === "Enter") return repeat ? { type: "stay" } : { type: "activate" };
		if (key === "End" || key === "Home") {
			const target = getRowEdge(date, key === "End", context);
			if (target.getTime() === date.getTime()) return { type: "stay" };
			if (!context.rows) return moveTo(target, context);
			return {
				date: target,
				months: 0,
				panel: context.panel,
				type: "move",
				years: 0
			};
		}
		return key === "PageDown" || key === "PageUp" ? getPageAction(date, key === "PageDown" ? 1 : -1, shiftKey, context) : null;
	};
	const hasShortcutModifier = (event) => Boolean(event.altKey || event.ctrlKey || event.metaKey);
	const getCalendarKeyAction = (event, date, context) => {
		if (hasShortcutModifier(event)) return null;
		return date ? getCellKeyAction(event, date, context) : getGridKeyAction(event, context);
	};
	const getKeptDay = (key, action, keptDay) => {
		if (action && "keptDay" in action && action.keptDay) return action.keptDay;
		return action?.type === "stay" || MODIFIER_KEYS$1.has(key) ? keptDay : null;
	};
	const constrainDate = (date, min, max) => {
		if (min && date < min) return new Date(min);
		if (max && date > max) return new Date(max);
		return date;
	};
	const isDateDisabled = (date, min, max, disabledDates) => {
		const day = removeTimeFromDate(date);
		if (min && day < removeTimeFromDate(min) || date.getFullYear() < 1) return true;
		if (max && day > removeTimeFromDate(max)) return true;
		if (disabledDates === void 0) return false;
		if (typeof disabledDates === "function") return disabledDates(date);
		if (disabledDates instanceof Date && isSameDateAs(date, disabledDates)) return true;
		if (Array.isArray(disabledDates) && disabledDates) for (const _date of disabledDates) {
			if (typeof _date === "function" && _date(date)) return true;
			if (Array.isArray(_date) && isDateInRange(date, _date[0], _date[1])) return true;
			if (_date instanceof Date && isSameDateAs(date, _date)) return true;
		}
		return false;
	};
	const isDateInRange = (date, start, end) => {
		const _date = removeTimeFromDate(date);
		const _start = start ? removeTimeFromDate(start) : null;
		const _end = end ? removeTimeFromDate(end) : null;
		return Boolean(_start && _end && _start <= _date && _date <= _end);
	};
	const isDateSelected = (date, start, end) => {
		if (start !== null && isSameDateAs(start, date)) return true;
		if (end !== null && isSameDateAs(end, date)) return true;
		return false;
	};
	const isDisableDateInRange = (startDate, endDate, disabledDates, view = "days") => {
		if (startDate && endDate) {
			const end = createDate(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
			for (let date = createDate(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1); date <= end; date = createDate(date.getFullYear(), date.getMonth(), date.getDate() + 1)) if (isCellDisabled(date, view, null, null, disabledDates)) return true;
		}
		return false;
	};
	const isPeriodDisabled = (date, view, min, max, disabledDates) => {
		const period = getPeriod(date, view);
		if (min && period < getPeriod(min, view) || max && period > getPeriod(max, view) || date.getFullYear() < 1) return true;
		if (disabledDates === void 0) return false;
		if (view === "weeks") {
			const monday = getMonday(date);
			return isEveryDayDisabled(monday, createDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6), null, null, disabledDates);
		}
		const months = MONTHS_IN_PERIOD[view];
		const year = date.getFullYear();
		const month = Math.floor(date.getMonth() / months) * months;
		return isEveryDayDisabled(createDate(year, month, 1), createDate(year, month + months, 0), min, max, disabledDates);
	};
	const isCellDisabled = (date, view, min, max, disabledDates) => view === "days" ? isDateDisabled(date, min, max, disabledDates) : isPeriodDisabled(date, view, min, max, disabledDates);
	const isCellOutsideLimits = (date, view, min, max, rows = false) => {
		const start = getStartOfView(date, view);
		const end = view === "days" ? createDate(start.getFullYear(), start.getMonth(), start.getDate() + (rows ? 6 : 0)) : createDate(start.getFullYear(), start.getMonth() + MONTHS_IN_PERIOD[view], 0);
		return end.getFullYear() < 1 || Boolean(min && end < getStartOfView(min, "days")) || Boolean(max && start > getStartOfView(max, "days"));
	};
	const isPeriodInRange = (date, view, start, end) => {
		if (!start || !end) return false;
		const period = getPeriod(date, view);
		return getPeriod(start, view) <= period && period <= getPeriod(end, view);
	};
	const isPeriodSelected = (date, view, start, end) => [start, end].some((value) => value !== null && getPeriod(value, view) === getPeriod(date, view));
	const isSameInstantAs = (date, date2) => {
		if (date === null || date2 === null) return date === date2;
		return date.getTime() === date2.getTime();
	};
	const isSameDateAs = (date, date2) => {
		if (date instanceof Date && date2 instanceof Date) return date.getDate() === date2.getDate() && date.getMonth() === date2.getMonth() && date.getFullYear() === date2.getFullYear();
		if (date === null && date2 === null) return true;
		return false;
	};
	const isToday = (date) => {
		return isSameDateAs(date, /* @__PURE__ */ new Date());
	};
	const removeTimeFromDate = (date) => {
		const clearedDate = new Date(date);
		clearedDate.setHours(0, 0, 0, 0);
		return clearedDate;
	};
	const setTimeFromDate = (target, source) => {
		if (target === null) return null;
		if (!(source instanceof Date)) return target;
		const result = new Date(target);
		result.setHours(source.getHours(), source.getMinutes(), source.getSeconds(), source.getMilliseconds());
		return result;
	};
	const parseYearSmart = (yearString) => {
		let parsedYear = Number.parseInt(yearString, 10);
		if (/^\s*\d{1,2}\D*$/.test(yearString)) {
			const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
			parsedYear = Math.floor(currentYear / 100) * 100 + parsedYear;
			if (parsedYear > currentYear + 50) parsedYear -= 100;
		}
		return parsedYear;
	};
	const createDateFromYear = (groups) => {
		const { year } = groups;
		const parsedYear = parseYearSmart(year);
		return createDate(parsedYear, 0, 1);
	};
	//#endregion
	//#region js/src/calendar.ts
	const NAME$46 = "calendar";
	const EVENT_KEY$37 = `.coreui.calendar`;
	const DATA_API_KEY$31 = ".data-api";
	const EVENT_BLUR$1 = `blur${EVENT_KEY$37}`;
	const EVENT_CALENDAR_DATE_CHANGE = `calendarDateChange${EVENT_KEY$37}`;
	const EVENT_CALENDAR_MOUSE_LEAVE = `calendarMouseleave${EVENT_KEY$37}`;
	const EVENT_CALENDAR_VIEW_CHANGE = `calendarViewChange${EVENT_KEY$37}`;
	const EVENT_END_DATE_CHANGE$2 = `endDateChange${EVENT_KEY$37}`;
	const EVENT_FOCUS$5 = `focus${EVENT_KEY$37}`;
	const EVENT_KEYDOWN$15 = `keydown${EVENT_KEY$37}`;
	const EVENT_SELECT_END_CHANGE = `selectEndChange${EVENT_KEY$37}`;
	const EVENT_START_DATE_CHANGE$2 = `startDateChange${EVENT_KEY$37}`;
	const EVENT_MOUSEENTER$4 = `mouseenter${EVENT_KEY$37}`;
	const EVENT_MOUSELEAVE$3 = `mouseleave${EVENT_KEY$37}`;
	const EVENT_LOAD_DATA_API$20 = `load${EVENT_KEY$37}${DATA_API_KEY$31}`;
	const EVENT_CLICK_DATA_API$16 = `click${EVENT_KEY$37}${DATA_API_KEY$31}`;
	const CLASS_NAME_CALENDAR_CELL = "calendar-cell";
	const CLASS_NAME_CALENDAR_CELL_INNER = "calendar-cell-inner";
	const CLASS_NAME_CALENDAR_ROW = "calendar-row";
	const CLASS_NAME_CALENDARS$2 = "calendars";
	const CLASS_NAME_SHOW_WEEK_NUMBERS = "show-week-numbers";
	const CLASS_NAME_VISUALLY_HIDDEN = "visually-hidden";
	const SELECTOR_BTN_DOUBLE_NEXT = ".btn-double-next";
	const SELECTOR_BTN_DOUBLE_PREV = ".btn-double-prev";
	const SELECTOR_BTN_MONTH = ".btn-month";
	const SELECTOR_BTN_NEXT = ".btn-next";
	const SELECTOR_BTN_PREV = ".btn-prev";
	const SELECTOR_BTN_YEAR = ".btn-year";
	const SELECTOR_CALENDAR = ".calendar";
	const SELECTOR_CALENDAR_CELL = ".calendar-cell";
	const SELECTOR_CALENDAR_CELL_FOCUSABLE = `${SELECTOR_CALENDAR_CELL}[tabindex]`;
	const SELECTOR_CALENDAR_CELL_SELECTABLE = `${SELECTOR_CALENDAR_CELL}[data-coreui-selectable]`;
	const SELECTOR_CALENDAR_ROW = ".calendar-row";
	const SELECTOR_CALENDAR_ROW_FOCUSABLE = `${SELECTOR_CALENDAR_ROW}[tabindex]`;
	const SELECTOR_CALENDAR_ROW_SELECTABLE = `${SELECTOR_CALENDAR_ROW}[data-coreui-selectable]`;
	const SELECTOR_DATA_CALENDAR = "[data-coreui-calendar]";
	const CELL_RENDERERS = {
		days: "renderDayCell",
		months: "renderMonthCell",
		quarters: "renderQuarterCell",
		years: "renderYearCell"
	};
	const VIEW_BY_SELECTION_TYPE = {
		day: "days",
		week: "days",
		month: "months",
		quarter: "quarters",
		year: "years"
	};
	const Default$41 = {
		allowList: SVGAllowlist,
		ariaNavNextMonthLabel: "Next month",
		ariaNavNextYearLabel: "Next year",
		ariaNavNextYearsLabel: "Next 12 years",
		ariaNavPrevMonthLabel: "Previous month",
		ariaNavPrevYearLabel: "Previous year",
		ariaNavPrevYearsLabel: "Previous 12 years",
		ariaNothingToPickLabel: "Nothing on this page can be picked",
		ariaSelectedDateAnnouncement: "Selected date: {date}",
		ariaSelectedRangeAnnouncement: "Selected range: {start} to {end}",
		ariaWeekNumberLabel: null,
		calendarDate: null,
		calendars: 1,
		dayFormat: "numeric",
		disabledDates: null,
		endDate: null,
		firstDayOfWeek: 1,
		locale: "default",
		maxDate: null,
		minDate: null,
		monthFormat: "short",
		navNextDoubleIcon: CHEVRON_DOUBLE_RIGHT_ICON,
		navNextIcon: CHEVRON_RIGHT_ICON,
		navPrevDoubleIcon: CHEVRON_DOUBLE_LEFT_ICON,
		navPrevIcon: CHEVRON_LEFT_ICON,
		range: false,
		renderDayCell: null,
		renderMonthCell: null,
		renderQuarterCell: null,
		renderYearCell: null,
		sanitize: true,
		sanitizeFn: null,
		selectAdjacentDays: false,
		selectEndDate: false,
		selectionType: "day",
		showAdjacentDays: true,
		showWeekNumber: false,
		startDate: null,
		weekdayFormat: 2,
		weekNumbersLabel: null,
		yearFormat: "numeric"
	};
	const DefaultType$40 = {
		allowList: "object",
		ariaNavNextMonthLabel: "string",
		ariaNavNextYearLabel: "string",
		ariaNavNextYearsLabel: "string",
		ariaNavPrevMonthLabel: "string",
		ariaNavPrevYearLabel: "string",
		ariaNavPrevYearsLabel: "string",
		ariaNothingToPickLabel: "(string|null)",
		ariaSelectedDateAnnouncement: "(string|null)",
		ariaSelectedRangeAnnouncement: "(string|null)",
		ariaWeekNumberLabel: "(function|null)",
		calendarDate: "(date|number|string|null)",
		calendars: "number",
		dayFormat: "string",
		disabledDates: "(array|date|function|null)",
		endDate: "(date|number|string|null)",
		firstDayOfWeek: "number",
		locale: "string",
		maxDate: "(date|number|string|null)",
		minDate: "(date|number|string|null)",
		monthFormat: "string",
		navNextDoubleIcon: "string",
		navNextIcon: "string",
		navPrevDoubleIcon: "string",
		navPrevIcon: "string",
		range: "boolean",
		renderDayCell: "(function|null)",
		renderMonthCell: "(function|null)",
		renderQuarterCell: "(function|null)",
		renderYearCell: "(function|null)",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		selectAdjacentDays: "boolean",
		selectEndDate: "boolean",
		selectionType: "string",
		showAdjacentDays: "boolean",
		showWeekNumber: "boolean",
		startDate: "(date|number|string|null)",
		weekdayFormat: "(number|string)",
		weekNumbersLabel: "(string|null)",
		yearFormat: "string"
	};
	var Calendar = class Calendar extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._formatter = createDateFormatter();
			this._announcements = [];
			this._selectionAnnouncement = null;
			this._config = this._getConfig(config);
			this._initializeDates();
			this._initializeView();
			this._createCalendar();
			this._addEventListeners();
		}
		static get Default() {
			return Default$41;
		}
		static get DefaultType() {
			return DefaultType$40;
		}
		static get NAME() {
			return NAME$46;
		}
		setCalendarDate(calendarDate) {
			this._setDates({ calendarDate });
		}
		setEndDate(endDate) {
			this._setDates({ endDate });
		}
		setRange(startDate, endDate) {
			this._setDates({
				endDate,
				startDate
			});
		}
		setSelectEndDate(selectEndDate) {
			this._setDates({ selectEndDate });
		}
		setStartDate(startDate) {
			this._setDates({ startDate });
		}
		refresh() {
			this._updateCalendar();
		}
		dispose() {
			for (const remove of this._announcements) remove();
			this._element.replaceChildren();
			super.dispose();
		}
		_setDates(values) {
			this._typeCheckConfig(values, Object.fromEntries(Object.keys(values).map((name) => [name, DefaultType$40[name]])));
			this._initializeDates(values);
			this._updateCalendar();
		}
		_setAnnouncements(announcements) {
			this._config = this._getConfig({
				...this._config,
				...announcements
			});
		}
		_focusOnFirstAvailableCell(index) {
			const panel = SelectorEngine.find(SELECTOR_CALENDAR, this._element)[index];
			const target = SelectorEngine.findOne(this._rovingSelector(), panel) ?? SelectorEngine.findOne("[tabindex=\"0\"]", panel) ?? SelectorEngine.findOne("[tabindex=\"0\"]", this._element);
			if (target) target.focus();
		}
		_focusOnDate(date) {
			const targets = SelectorEngine.find(this._rovingSelector(), this._element);
			const target = getClosestSelectable(targets, getStartOfView(date, this._view), this._rowsAreTargets()) ?? SelectorEngine.findOne("table[tabindex=\"0\"]", this._element);
			if (target) target.focus();
		}
		_focusOnCell(date, panel) {
			const scope = panel === void 0 ? this._element : SelectorEngine.find(SELECTOR_CALENDAR, this._element)[panel];
			const matches = SelectorEngine.find(this._rovingSelector(), scope).filter((element) => this._getDate(element).toDateString() === date.toDateString());
			const cell = matches.find((element) => {
				const cell = this._rowsAreTargets() ? SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, element) : element;
				return !cell?.classList.contains("previous") && !cell?.classList.contains("next");
			}) ?? matches[0];
			if (cell) cell.focus();
		}
		_getEventTarget(event) {
			return event.target.closest(SELECTOR_CALENDAR_CELL) ?? event.target.closest(SELECTOR_CALENDAR_ROW);
		}
		_rowsAreTargets() {
			return this._config.selectionType === "week" && this._view === "days";
		}
		_cellUnit() {
			return this._rowsAreTargets() ? "weeks" : this._view;
		}
		_getDate(target) {
			if (this._rowsAreTargets()) {
				const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, target.closest(SELECTOR_CALENDAR_ROW));
				return getStartOfWeek(parseToDateString(Manipulator.getDataAttribute(firstCell, "date")), this._config.firstDayOfWeek);
			}
			return parseToDateString(Manipulator.getDataAttribute(target, "date"));
		}
		_getPickedDate(target) {
			const date = this._getDate(target);
			return this._rowsAreTargets() ? getWeekRowDate(date) : date;
		}
		_handleCalendarClick(event) {
			const target = this._getEventTarget(event);
			if (!target) return;
			const date = this._getPickedDate(target);
			const cloneDate = new Date(date);
			const index = Manipulator.getDataAttribute(target.closest(SELECTOR_CALENDAR), "calendar-index");
			if (isCellDisabled(date, this._cellUnit(), this._minDate, this._maxDate, this._config.disabledDates)) return;
			if (this._view === "months" && this._config.selectionType !== "month") {
				this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date, "days");
				this._setCalendarView("days", "cellClick");
				this._updateCalendar(() => this._focusOnFirstAvailableCell(index));
				return;
			}
			if (this._view === "years" && this._config.selectionType !== "year") {
				this._setCalendarDate(index ? new Date(cloneDate.setFullYear(cloneDate.getFullYear() - index)) : date, "months");
				this._setCalendarView(this._config.selectionType === "quarter" ? "quarters" : "months", "cellClick");
				this._updateCalendar(() => this._focusOnFirstAvailableCell(index));
				return;
			}
			const visible = this._element.checkVisibility();
			this._hoverDate = null;
			this._selectDate(date);
			this._announceSelection(visible);
			this._updateClassNamesAndAriaLabels();
			this._updateCellContent();
			this._updateRovingTabIndex(SelectorEngine.findOne(":focus", this._element));
		}
		_handleCalendarKeydown(event) {
			const target = this._getEventTarget(event);
			const action = getCalendarKeyAction(event, this._getDate(target), this._getKeyContext(target));
			this._keptDay = getKeptDay(event.key, action, this._keptDay);
			if (!action) return;
			event.preventDefault();
			if (action.type === "activate") {
				this._handleCalendarClick(event);
				return;
			}
			if (action.type === "page" && action.date) {
				const target = action.date;
				this._modifyCalendarDate(action.years, action.months, () => this._focusOnDate(target));
				return;
			}
			this._moveFocus(action);
		}
		_handleGridKeydown(event) {
			if (!event.target.matches("table")) return;
			const context = this._getKeyContext(event.target);
			const action = getCalendarKeyAction(event, null, context);
			this._keptDay = getKeptDay(event.key, action, this._keptDay);
			if (!action) return;
			event.preventDefault();
			if (action.type !== "page") {
				this._moveFocus(action);
				return;
			}
			this._modifyCalendarDate(action.years, action.months, () => {
				const panel = SelectorEngine.find(SELECTOR_CALENDAR, this._element)[context.panel];
				const stop = SelectorEngine.findOne("[tabindex=\"0\"]", panel) ?? SelectorEngine.findOne("[tabindex=\"0\"]", this._element);
				if (stop) stop.focus();
			});
		}
		_getKeyContext(target) {
			return {
				calendarDate: this._calendarDate,
				calendars: this._config.calendars,
				firstDayOfWeek: this._config.firstDayOfWeek,
				keptDay: this._keptDay,
				maxDate: this._maxDate,
				minDate: this._minDate,
				panel: SelectorEngine.find(SELECTOR_CALENDAR, this._element).indexOf(target.closest(SELECTOR_CALENDAR)),
				rows: this._rowsAreTargets(),
				rtl: isRTL(this._element),
				view: this._view
			};
		}
		_moveFocus(action) {
			if (action.type !== "move") return;
			if (action.years || action.months) {
				this._modifyCalendarDate(action.years, action.months, () => this._focusOnCell(action.date));
				return;
			}
			this._focusOnCell(action.date, action.panel);
		}
		_handleCalendarMouseEnter(event) {
			const target = this._getEventTarget(event);
			if (!target) return;
			const date = this._getPickedDate(target);
			if (isCellDisabled(date, this._cellUnit(), this._minDate, this._maxDate, this._config.disabledDates)) return;
			this._hoverDate = setTimeFromDate(date, this._selectEndDate ? this._endDate : this._startDate);
			this._updateRangeHover();
		}
		_handleCalendarMouseLeave() {
			this._hoverDate = null;
			this._updateRangeHover();
		}
		_updateRangeHover() {
			if (this._selectEndDate ? this._startDate : this._endDate) this._updateClassNamesAndAriaLabels();
		}
		_addEventListeners() {
			const focusable = `${SELECTOR_CALENDAR_CELL_FOCUSABLE}, ${SELECTOR_CALENDAR_ROW_FOCUSABLE}`;
			const selectable = `${SELECTOR_CALENDAR_CELL_SELECTABLE}, ${SELECTOR_CALENDAR_ROW_SELECTABLE}`;
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$16, () => {
				this._keptDay = null;
			});
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$16, focusable, (event) => {
				this._handleCalendarClick(event);
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$15, focusable, (event) => {
				this._handleCalendarKeydown(event);
			});
			EventHandler.on(this._element, EVENT_MOUSEENTER$4, selectable, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			EventHandler.on(this._element, EVENT_MOUSELEAVE$3, selectable, () => {
				this._handleCalendarMouseLeave();
			});
			EventHandler.on(this._element, EVENT_FOCUS$5, focusable, (event) => {
				this._updateRovingTabIndex(this._getEventTarget(event));
				this._handleCalendarMouseEnter(event);
			});
			EventHandler.on(this._element, EVENT_BLUR$1, focusable, () => {
				this._handleCalendarMouseLeave();
				this._updateRovingTabIndex();
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$15, "table[tabindex]", (event) => {
				this._handleGridKeydown(event);
			});
			this._addNavigationEventListeners();
			EventHandler.on(this._element, EVENT_MOUSELEAVE$3, "table", () => {
				EventHandler.trigger(this._element, EVENT_CALENDAR_MOUSE_LEAVE);
			});
		}
		_addNavigationEventListeners() {
			const navigationSelectors = {
				[SELECTOR_BTN_PREV]: () => this._modifyCalendarDate(0, -1),
				[SELECTOR_BTN_DOUBLE_PREV]: () => this._modifyCalendarDate(this._view === "years" ? -12 : -1),
				[SELECTOR_BTN_NEXT]: () => this._modifyCalendarDate(0, 1),
				[SELECTOR_BTN_DOUBLE_NEXT]: () => this._modifyCalendarDate(this._view === "years" ? 12 : 1),
				[SELECTOR_BTN_MONTH]: (index) => this._showPeriodView("months", index),
				[SELECTOR_BTN_YEAR]: (index) => this._showPeriodView(this._view === "years" ? this._selectionView() : "years", index)
			};
			for (const [selector, handler] of Object.entries(navigationSelectors)) EventHandler.on(this._element, EVENT_CLICK_DATA_API$16, selector, (event) => {
				event.preventDefault();
				const index = SelectorEngine.find(selector, this._element).indexOf(event.target.closest(selector));
				if (!handler(index)) SelectorEngine.find(selector, this._element)[index]?.focus();
			});
		}
		_setCalendarDate(date, view = this._view) {
			this._calendarDate = date;
			EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
				date,
				view
			});
		}
		_setCalendarView(view, source) {
			this._view = view;
			EventHandler.trigger(this._element, EVENT_CALENDAR_VIEW_CHANGE, {
				view,
				source
			});
		}
		_showPeriodView(view, index) {
			const shown = getCalendarDate(this._calendarDate, index, this._view === "years" ? view : this._view);
			const start = getStartOfView(createDate(shown.getFullYear(), shown.getMonth(), 1), view).toDateString();
			const focus = view !== this._view && this._element.contains(document.activeElement);
			this._setCalendarView(view, "navigation");
			this._updateCalendar(() => {
				if (focus) {
					const panel = SelectorEngine.find(SELECTOR_CALENDAR, this._element)[index];
					(SelectorEngine.find(`[data-coreui-date="${start}"]`, this._element).map((cell) => cell.closest(this._rovingSelector())).find(Boolean) ?? SelectorEngine.findOne("[tabindex=\"0\"]", panel))?.focus();
				}
			});
			return focus;
		}
		_modifyCalendarDate(years, months = 0, callback) {
			const year = this._calendarDate.getFullYear() + years;
			const month = this._calendarDate.getMonth() + months;
			this._setCalendarDate(createDate(year, month, 1));
			this._updateCalendar(callback);
		}
		_setEndDate(date) {
			if (date === this._endDate) return;
			this._endDate = setTimeFromDate(date, this._endDate);
			EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE$2, {
				date: getDateBySelectionType(this._endDate, this._config.selectionType),
				dateObject: this._endDate
			});
		}
		_setStartDate(date) {
			if (date === this._startDate) return;
			this._startDate = setTimeFromDate(date, this._startDate);
			EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE$2, {
				date: getDateBySelectionType(this._startDate, this._config.selectionType),
				dateObject: this._startDate
			});
		}
		_setSelectEndDate(value) {
			this._selectEndDate = value;
			EventHandler.trigger(this._element, EVENT_SELECT_END_CHANGE, { value });
		}
		_selectDate(date) {
			if (isCellDisabled(date, this._cellUnit(), this._minDate, this._maxDate, this._config.disabledDates)) return;
			if (this._config.range) {
				const start = convertToSelectionDate(this._startDate, this._config.selectionType);
				const end = convertToSelectionDate(this._endDate, this._config.selectionType);
				if (this._selectEndDate) {
					if (start && start > date) {
						this._setStartDate(date);
						this._setEndDate(null);
						return;
					}
					this._setSelectEndDate(false);
					if (isDisableDateInRange(start, date, this._config.disabledDates, this._cellUnit())) {
						this._setStartDate(null);
						this._setEndDate(null);
						return;
					}
					this._setEndDate(date);
					return;
				}
				if (end && end < date) {
					this._setStartDate(date);
					this._setEndDate(null);
					this._setSelectEndDate(true);
					return;
				}
				if (isDisableDateInRange(date, end, this._config.disabledDates, this._cellUnit())) {
					this._setStartDate(null);
					this._setEndDate(null);
					return;
				}
				this._setSelectEndDate(true);
				this._setStartDate(date);
				return;
			}
			this._setStartDate(date);
		}
		_createCalendarPanel(order) {
			const calendarPanelEl = document.createElement("div");
			calendarPanelEl.classList.add("calendar");
			Manipulator.setDataAttribute(calendarPanelEl, "calendar-index", order);
			calendarPanelEl.innerHTML = `<div class="calendar-nav"><div class="calendar-nav-prev"></div><div class="calendar-nav-date"></div><div class="calendar-nav-next"></div></div><table role="grid"></table><span id="${getUID("calendar-description")}" hidden></span>`;
			this._renderCalendarPanel(calendarPanelEl, order);
			return calendarPanelEl;
		}
		_renderCalendarPanel(panel, order) {
			const calendarDate = getCalendarDate(this._calendarDate, order, this._view);
			const days = this._view === "days";
			const years = this._view === "years";
			const [navigation, calendarTable] = panel.children;
			const [prev, region, next] = navigation.children;
			const monthLabel = days ? this._formatDate(calendarDate, { month: "long" }) : "";
			const yearLabel = years ? formatYearsRange(calendarDate.getFullYear(), this._config.locale) : this._formatDate(calendarDate, { year: "numeric" });
			const gridLabel = this._gridLabel(calendarDate);
			const turned = calendarTable.getAttribute("aria-label") !== gridLabel;
			prev.innerHTML = `${this._navButton("btn-double-prev", "navPrevDoubleIcon", years ? this._config.ariaNavPrevYearsLabel : this._config.ariaNavPrevYearLabel)} ${days ? this._navButton("btn-prev", "navPrevIcon", this._config.ariaNavPrevMonthLabel) : ""}`;
			next.innerHTML = `${days ? this._navButton("btn-next", "navNextIcon", this._config.ariaNavNextMonthLabel) : ""} ${this._navButton("btn-double-next", "navNextDoubleIcon", years ? this._config.ariaNavNextYearsLabel : this._config.ariaNavNextYearLabel)}`;
			calendarTable.setAttribute("aria-label", gridLabel);
			if (this._picksRange()) calendarTable.setAttribute("aria-multiselectable", "true");
			else calendarTable.removeAttribute("aria-multiselectable");
			calendarTable.innerHTML = days ? this._daysHtml(calendarDate) : this._periodsHtml(calendarDate);
			if (turned) {
				const month = days ? `<button type="button" class="calendar-nav-btn btn-month">${monthLabel}</button>` : "";
				const year = `<button type="button" class="calendar-nav-btn btn-year">${yearLabel}</button>`;
				region.innerHTML = isYearBeforeMonth(this._config.locale) ? `${year} ${month}` : `${month} ${year}`;
			}
			SelectorEngine.findOne(SELECTOR_BTN_YEAR, region).disabled = years && this._selectionView() === "years";
			this._describeGrid(panel);
		}
		_describeGrid(panel) {
			const [navigation, grid, description] = panel.children;
			const region = navigation.children[1];
			const label = this._config.ariaNothingToPickLabel;
			const note = SelectorEngine.findOne(`.${CLASS_NAME_VISUALLY_HIDDEN}`, region);
			description.textContent = label;
			if (!label || SelectorEngine.findOne("[data-coreui-selectable]", grid)) {
				grid.removeAttribute("aria-describedby");
				note?.remove();
				return;
			}
			grid.setAttribute("aria-describedby", description.id);
			if (!note) region.insertAdjacentHTML("beforeend", `<span class="${CLASS_NAME_VISUALLY_HIDDEN}">${escapeHtml(label)}</span>`);
			else if (note.textContent !== label) note.textContent = label;
		}
		_pages() {
			return SelectorEngine.find(SELECTOR_CALENDAR, this._element).map((panel) => {
				const grid = panel.children[1];
				return [grid.getAttribute("aria-label"), grid.hasAttribute("aria-describedby")];
			});
		}
		_announceSelection(visible) {
			this._selectionAnnouncement?.();
			this._selectionAnnouncement = null;
			const { ariaSelectedDateAnnouncement, ariaSelectedRangeAnnouncement, range } = this._config;
			const start = this._startDate;
			const end = range ? this._endDate : start;
			if (!visible || !start || !end) return;
			const startName = this._selectionName(start);
			const endName = this._selectionName(end);
			const message = startName === endName ? ariaSelectedDateAnnouncement?.replaceAll("{date}", () => startName) : ariaSelectedRangeAnnouncement?.replaceAll("{start}", () => startName).replaceAll("{end}", () => endName);
			if (message) this._selectionAnnouncement = announce(message, { context: this._element });
		}
		_selectionName(date) {
			const { ariaWeekNumberLabel, firstDayOfWeek, locale, selectionType, showWeekNumber } = this._config;
			return formatSelectionName(date, {
				ariaWeekNumberLabel,
				firstDayOfWeek,
				locale,
				selectionType,
				showWeekNumber
			});
		}
		_announcePages(pages) {
			if (!this._element.isConnected || !this._element.checkVisibility()) return;
			const panels = SelectorEngine.find(SELECTOR_CALENDAR, this._element);
			const active = this._element.getRootNode().activeElement;
			const date = active && this._element.contains(active) ? active.closest(`${SELECTOR_CALENDAR_CELL}[aria-label], ${SELECTOR_CALENDAR_ROW}[aria-label]`) : null;
			const messages = this._pages().flatMap(([label, nothing], index) => {
				const [previousLabel, previousNothing] = pages[index] ?? [];
				if (label === previousLabel && (previousNothing || !nothing) || date && !nothing) return [];
				return [[date && panels[index].contains(date) ? "" : label, nothing && this._config.ariaNothingToPickLabel].filter(Boolean).join(", ")];
			});
			if (messages.length > 0) {
				for (const remove of this._announcements) remove();
				this._announcements = messages.map((message) => announce(message, { context: this._element }));
			}
		}
		_daysHtml(calendarDate) {
			const { ariaWeekNumberLabel, showAdjacentDays, showWeekNumber, weekdayFormat, weekNumbersLabel } = this._config;
			const weeks = getMonthDetails(calendarDate.getFullYear(), calendarDate.getMonth(), this._config.firstDayOfWeek);
			const weekLabel = getWeekLabel(this._config.locale);
			const headerCell = (content, abbr = "") => `<th class="${CLASS_NAME_CALENDAR_CELL}"${abbr}><div class="calendar-header-cell-inner">${content}</div></th>`;
			const weekdays = weeks[0].days.map(({ date }) => {
				const long = this._formatDate(date, { weekday: "long" });
				return headerCell(typeof weekdayFormat === "string" ? this._formatDate(date, { weekday: weekdayFormat }) : long.slice(0, weekdayFormat), ` abbr="${long}"`);
			});
			const rows = weeks.map(({ week, days }) => {
				const visible = showAdjacentDays || days.some(({ month }) => month === "current");
				const attributes = this._rowWeekAttributes(days[0].date, visible);
				const cells = days.map(({ date, month }) => month === "current" || showAdjacentDays ? this._cellHtml(date, this._cellDayAttributes(date, month, attributes.meta), this._formatDate(date, { day: this._config.dayFormat })) : "<td role=\"gridcell\"></td>");
				const weekNumberName = showWeekNumber ? getWeekNumberName(week.number, weekLabel, ariaWeekNumberLabel) : "";
				const rowName = () => `${showWeekNumber ? `${weekNumberName}, ` : ""}${formatWeekName(days, this._config.locale)}`;
				const ariaLabel = this._config.selectionType === "week" && visible ? ` aria-label="${escapeHtml(rowName())}"` : "";
				return `<tr class="${attributes.className}"${this._stateHtml(attributes)}${ariaLabel}>${showWeekNumber ? `<th class="calendar-cell-week-number" scope="row" aria-label="${escapeHtml(weekNumberName)}">${week.number}</th>` : ""}${cells.join("")}</tr>`;
			});
			const weekNumberHeader = weekNumbersLabel ? escapeHtml(weekNumbersLabel) : `<span class="${CLASS_NAME_VISUALLY_HIDDEN}">${escapeHtml(weekLabel)}</span>`;
			return `<thead><tr>${showWeekNumber ? headerCell(weekNumberHeader) : ""}${weekdays.join("")}</tr></thead><tbody>${rows.join("")}</tbody>`;
		}
		_periodsHtml(calendarDate) {
			const view = this._view;
			const year = calendarDate.getFullYear();
			const monthNames = view === "months" ? getMonthsNames(this._config.locale, this._config.monthFormat) : [];
			const dates = view === "years" ? getYears(year).map((value) => createDate(value)) : Array.from({ length: view === "months" ? 12 : 4 }, (_, index) => createDate(year, index * (view === "months" ? 1 : 3), 1));
			const label = (date) => {
				if (view === "months") return monthNames[date.getMonth()];
				return view === "quarters" ? `Q${date.getMonth() / 3 + 1}` : this._formatDate(date, { year: this._config.yearFormat });
			};
			return `<tbody>${createGroupsInArray(dates, view === "quarters" ? 1 : 4).map((row) => `<tr>${row.map((date) => this._cellHtml(date, this._cellPeriodAttributes(date), label(date))).join("")}</tr>`).join("")}</tbody>`;
		}
		_cellHtml(date, attributes, label) {
			const renderer = CELL_RENDERERS[this._view];
			const content = this._config[renderer] ? this._cellContent(date, attributes.meta) : label;
			const ariaLabel = attributes.ariaLabel && !this._config[renderer] ? ` aria-label="${escapeHtml(attributes.ariaLabel)}"` : "";
			const ariaCurrent = attributes.ariaCurrent ? " aria-current=\"date\"" : "";
			return `<td class="${attributes.className}" role="gridcell"${this._stateHtml(attributes)}${ariaCurrent}${ariaLabel} data-coreui-date="${date.toDateString()}"><div class="${CLASS_NAME_CALENDAR_CELL_INNER} ${this._view.slice(0, -1)}">${content}</div></td>`;
		}
		_cellContent(date, meta) {
			return sanitizeByConfig(this._config[CELL_RENDERERS[this._view]](date, {
				...meta,
				label: this._cellName(date)
			}), this._config);
		}
		_stateHtml({ ariaDisabled, ariaSelected, focusable, selectable }) {
			return `${focusable ? " tabindex=\"-1\"" : ""}${selectable ? " data-coreui-selectable" : ""}${ariaSelected ? " aria-selected=\"true\"" : ""}${ariaDisabled ? " aria-disabled=\"true\"" : ""}`;
		}
		_updateRovingTabIndex(preferred) {
			setRovingTabIndex(this._element, this._rovingSelector(), getStartOfView(this._calendarDate, this._view), this._rowsAreTargets(), preferred);
		}
		_gridLabel(date) {
			if (this._view === "days") return this._formatDate(date, {
				month: "long",
				year: "numeric"
			});
			if (this._view === "years") return formatYearsRange(date.getFullYear(), this._config.locale);
			return this._formatDate(date, { year: "numeric" });
		}
		_rovingSelector() {
			return this._rowsAreTargets() ? SELECTOR_CALENDAR_ROW_FOCUSABLE : SELECTOR_CALENDAR_CELL_FOCUSABLE;
		}
		_createCalendar() {
			this._setCalendarClasses();
			for (const [index, _] of Array.from({ length: this._config.calendars }).entries()) this._element.append(this._createCalendarPanel(index));
			this._updateRovingTabIndex();
		}
		_setCalendarClasses() {
			const { selectionType, showWeekNumber } = this._config;
			for (const type of [
				"day",
				"month",
				"quarter",
				"week",
				"year"
			]) if (type !== selectionType) this._element.classList.remove(`select-${type}`);
			if (selectionType && this._view === "days") this._element.classList.add(`select-${selectionType}`);
			this._element.classList.toggle(CLASS_NAME_SHOW_WEEK_NUMBERS, Boolean(showWeekNumber));
			this._element.classList.add(CLASS_NAME_CALENDARS$2);
		}
		_initializeDates(values) {
			const given = values ?? this._config;
			const changed = (...names) => !values || names.some((name) => name in values);
			if (!values) {
				this._minDate = convertToLimitDate(this._config.minDate, this._config.selectionType);
				this._maxDate = convertToLimitDate(this._config.maxDate, this._config.selectionType);
			}
			if (changed("calendarDate", "startDate", "endDate")) {
				const source = values ? [
					"calendarDate",
					"startDate",
					"endDate"
				].filter((name) => name in values).map((name) => values[name]).find(Boolean) ?? null : given.calendarDate || given.startDate || given.endDate;
				const date = source === given.calendarDate ? convertToDateObject(source, this._config.selectionType) : convertToShownDate(source, this._config.selectionType, this._config.firstDayOfWeek);
				this._calendarDate = date || this._calendarDate || constrainDate(/* @__PURE__ */ new Date(), this._minDate, this._maxDate);
			}
			if (changed("startDate")) this._startDate = convertToDateObject(given.startDate, this._config.selectionType);
			if (changed("endDate")) this._endDate = convertToDateObject(given.endDate, this._config.selectionType);
			if (changed("selectEndDate")) this._selectEndDate = Boolean(given.selectEndDate);
			this._hoverDate = null;
		}
		_initializeView() {
			this._view = this._selectionView();
		}
		_picksRange() {
			return this._config.range && this._selectionView() === this._view;
		}
		_selectionView() {
			return VIEW_BY_SELECTION_TYPE[this._config.selectionType] || "days";
		}
		_updateCalendar(callback) {
			const focused = this._element.contains(document.activeElement) ? document.activeElement : null;
			const restoreFocus = focused && this._focusRestorer(focused);
			const panels = SelectorEngine.find(SELECTOR_CALENDAR, this._element);
			const pages = this._pages();
			if (panels.length === this._config.calendars) {
				this._setCalendarClasses();
				for (const [index, panel] of panels.entries()) this._renderCalendarPanel(panel, index);
				this._updateRovingTabIndex();
			} else {
				this._element.replaceChildren();
				this._createCalendar();
			}
			if (callback) callback();
			if (restoreFocus && (!document.activeElement || document.activeElement === document.body)) restoreFocus();
			this._announcePages(pages);
		}
		_focusRestorer(focused) {
			const index = SelectorEngine.find(SELECTOR_CALENDAR, this._element).indexOf(focused.closest(SELECTOR_CALENDAR));
			const date = (focused.matches(SELECTOR_CALENDAR_ROW) ? SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, focused) : focused.closest(SELECTOR_CALENDAR_CELL))?.getAttribute("data-coreui-date");
			const { className } = focused;
			return () => {
				const panel = SelectorEngine.find(SELECTOR_CALENDAR, this._element)[index] ?? this._element;
				const matches = SelectorEngine.find(this._rovingSelector(), this._element).filter((target) => (target.matches(SELECTOR_CALENDAR_ROW) ? SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, target) : target)?.getAttribute("data-coreui-date") === date);
				((date ? matches.find((target) => !target.matches(".next, .previous")) ?? matches[0] : panel.getElementsByClassName(className)[0]) ?? SelectorEngine.findOne("[tabindex=\"0\"]", panel) ?? SelectorEngine.findOne("[tabindex=\"0\"]", this._element))?.focus({ preventScroll: true });
			};
		}
		_updateClassNamesAndAriaLabels() {
			const pages = this._pages();
			if (this._rowsAreTargets()) for (const row of SelectorEngine.find(SELECTOR_CALENDAR_ROW, this._element)) {
				const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, row);
				if (firstCell) this._applyState(row, this._rowWeekAttributes(this._getDate(firstCell)));
			}
			else for (const cell of SelectorEngine.find(`${SELECTOR_CALENDAR_CELL}[data-coreui-date]`, this._element)) {
				const date = this._getDate(cell);
				this._applyState(cell, this._view === "days" ? this._cellDayAttributes(date, ["previous", "next"].find((month) => cell.classList.contains(month)) ?? "current") : this._cellPeriodAttributes(date));
			}
			for (const panel of SelectorEngine.find(SELECTOR_CALENDAR, this._element)) this._describeGrid(panel);
			this._announcePages(pages);
		}
		_updateCellContent() {
			if (!this._config[CELL_RENDERERS[this._view]]) return;
			const focused = this._element.contains(document.activeElement) ? document.activeElement : null;
			const restoreFocus = focused && this._focusRestorer(focused);
			for (const cell of SelectorEngine.find(`${SELECTOR_CALENDAR_CELL}[data-coreui-date]`, this._element)) {
				const date = parseToDateString(Manipulator.getDataAttribute(cell, "date"));
				const attributes = this._view === "days" ? this._cellDayAttributes(date, ["previous", "next"].find((month) => cell.classList.contains(month)) ?? "current", this._rowWeekAttributes(this._getDate(cell)).meta) : this._cellPeriodAttributes(date);
				const inner = SelectorEngine.findOne(`.${CLASS_NAME_CALENDAR_CELL_INNER}`, cell);
				const content = this._cellContent(date, attributes.meta);
				if (inner.innerHTML !== content) inner.innerHTML = content;
			}
			if (restoreFocus && (!document.activeElement || document.activeElement === document.body)) restoreFocus();
		}
		_applyState(element, { ariaDisabled, ariaSelected, className, selectable }) {
			element.className = className;
			element.toggleAttribute("data-coreui-selectable", selectable);
			if (ariaSelected) element.setAttribute("aria-selected", "true");
			else element.removeAttribute("aria-selected");
			if (ariaDisabled) element.setAttribute("aria-disabled", "true");
			else element.removeAttribute("aria-disabled");
		}
		_isRangeHover(inRange) {
			return Boolean(this._hoverDate) && (this._selectEndDate ? inRange(this._startDate, this._hoverDate) : inRange(this._hoverDate, this._endDate));
		}
		_classNames(classNames) {
			return Object.entries(classNames).filter(([_, value]) => Boolean(value)).map(([key]) => key).join(" ");
		}
		_cellDayAttributes(date, month, row) {
			const isCurrentMonth = month === "current";
			const isFiller = this._config.selectionType === "day" && !isCurrentMonth && !this._config.selectAdjacentDays;
			const isDisabled = isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = isDateSelected(date, this._startDate, this._endDate);
			const isTodayDate = isCurrentMonth && isToday(date);
			const isInRange = !isFiller && isDateInRange(date, this._startDate, this._endDate);
			const meta = {
				isDisabled: isDisabled || isFiller,
				isInCurrentMonth: isCurrentMonth,
				isInRange,
				isSelected: isSelected && !isFiller,
				isToday: isTodayDate,
				...row
			};
			if (this._config.selectionType !== "day" || this._view !== "days") return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					today: isTodayDate,
					[month]: true
				}),
				focusable: false,
				selectable: false,
				ariaSelected: false,
				ariaLabel: this._cellName(date),
				ariaCurrent: isTodayDate,
				meta
			};
			const isRangeHover = !isFiller && this._isRangeHover((start, end) => isDateInRange(date, start, end));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					clickable: !isCurrentMonth && this._config.selectAdjacentDays,
					disabled: isDisabled,
					range: isInRange,
					"range-hover": isRangeHover,
					selected: isSelected,
					today: isTodayDate,
					[month]: true
				}),
				focusable: !isFiller && !isCellOutsideLimits(date, "days", this._minDate, this._maxDate),
				selectable: !isDisabled && !isFiller,
				ariaDisabled: isDisabled || isFiller,
				ariaSelected: !isFiller && (isSelected || this._picksRange() && !isDisabled && isDateInRange(date, this._startDate, this._endDate)),
				ariaLabel: this._cellName(date),
				ariaCurrent: isTodayDate,
				meta
			};
		}
		_cellPeriodAttributes(date) {
			const view = this._view;
			const { firstDayOfWeek, selectionType } = this._config;
			const start = convertToShownDate(this._startDate, selectionType, firstDayOfWeek);
			const end = convertToShownDate(this._endDate, selectionType, firstDayOfWeek);
			const isDisabled = isPeriodDisabled(date, view, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = isPeriodSelected(date, view, start, end);
			const isInRange = isPeriodInRange(date, view, start, end);
			const isRangeHover = VIEW_BY_SELECTION_TYPE[this._config.selectionType] === view && this._isRangeHover((start, end) => isPeriodInRange(date, view, start, end));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					disabled: isDisabled,
					"range-hover": isRangeHover,
					range: isInRange,
					selected: isSelected
				}),
				focusable: !isCellOutsideLimits(date, view, this._minDate, this._maxDate),
				selectable: !isDisabled,
				ariaDisabled: isDisabled,
				ariaSelected: isSelected || this._picksRange() && isInRange && !isDisabled,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_rowWeekAttributes(date, visible = true) {
			if (this._config.selectionType !== "week" || !visible) return {
				className: this._classNames({ [CLASS_NAME_CALENDAR_ROW]: true }),
				focusable: false,
				selectable: false,
				ariaSelected: false
			};
			const weekDate = getWeekRowDate(date);
			const isDisabled = isPeriodDisabled(weekDate, "weeks", this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = isPeriodSelected(weekDate, "weeks", this._startDate, this._endDate);
			const isInRange = isPeriodInRange(weekDate, "weeks", this._startDate, this._endDate);
			const isRangeHover = this._isRangeHover((start, end) => isPeriodInRange(weekDate, "weeks", start, end));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_ROW]: true,
					disabled: isDisabled,
					range: isInRange,
					"range-hover": isRangeHover,
					selected: isSelected
				}),
				focusable: !isCellOutsideLimits(date, "days", this._minDate, this._maxDate, true),
				selectable: !isDisabled,
				ariaDisabled: isDisabled,
				ariaSelected: isSelected || this._picksRange() && isInRange && !isDisabled,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_navButton(className, icon, label) {
			return `<button type="button" class="calendar-nav-btn ${className}" aria-label="${escapeHtml(label)}"><span class="calendar-nav-icon">${this._navIcon(icon)}</span></button>`;
		}
		_navIcon(name) {
			return sanitizeByConfig(this._config[isRTL(this._element) ? {
				navNextDoubleIcon: "navPrevDoubleIcon",
				navNextIcon: "navPrevIcon",
				navPrevDoubleIcon: "navNextDoubleIcon",
				navPrevIcon: "navNextIcon"
			}[name] : name], this._config);
		}
		_formatDate(date, options) {
			return this._formatter(date, this._config.locale, options);
		}
		_cellName(date) {
			return formatCellName(date, this._view, (value, options) => this._formatDate(value, options));
		}
		static calendarInterface(element, config, ...args) {
			const data = Calendar.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, Calendar, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$20, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_CALENDAR))) Calendar.calendarInterface(element);
	});
	defineJQueryPlugin(Calendar);
	//#endregion
	//#region js/src/carousel.ts
	const NAME$45 = "carousel";
	const EVENT_KEY$36 = `.coreui.carousel`;
	const DATA_API_KEY$30 = ".data-api";
	const ARROW_LEFT_KEY$10 = "ArrowLeft";
	const ARROW_RIGHT_KEY$10 = "ArrowRight";
	const DIRECTION_LEFT = "left";
	const DIRECTION_RIGHT = "right";
	const EVENT_SLIDE = `slide${EVENT_KEY$36}`;
	const EVENT_SLID = `slid${EVENT_KEY$36}`;
	const EVENT_KEYDOWN$14 = `keydown${EVENT_KEY$36}`;
	const EVENT_MOUSEENTER$3 = `mouseenter${EVENT_KEY$36}`;
	const EVENT_MOUSELEAVE$2 = `mouseleave${EVENT_KEY$36}`;
	const EVENT_POINTERDOWN$3 = `pointerdown${EVENT_KEY$36}`;
	const EVENT_LOAD_DATA_API$19 = `load${EVENT_KEY$36}${DATA_API_KEY$30}`;
	const EVENT_CLICK_DATA_API$15 = `click${EVENT_KEY$36}${DATA_API_KEY$30}`;
	const CLASS_NAME_CAROUSEL = "carousel";
	const CLASS_NAME_ACTIVE$7 = "active";
	const CLASS_NAME_FADE$1 = "carousel-fade";
	const CLASS_NAME_CENTER = "carousel-center";
	const CLASS_NAME_AUTO = "carousel-auto";
	const CLASS_NAME_CLONE = "carousel-item-clone";
	const CLASS_NAME_PAUSED = "paused";
	const CLASS_NAME_PLAYING = "carousel-playing";
	const PROPERTY_INTERVAL = "--cui-carousel-interval";
	const SCROLL_DURATION = 300;
	const ACTIVE_RATIO_TOLERANCE = .05;
	const SELECTOR_ACTIVE = ".active";
	const SELECTOR_ITEM = `.carousel-item:not(.${CLASS_NAME_CLONE})`;
	const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
	const SELECTOR_INNER$1 = ".carousel-inner";
	const SELECTOR_INDICATORS = ".carousel-indicators";
	const SELECTOR_PLAY_PAUSE = ".carousel-control-play-pause";
	const SELECTOR_DATA_SLIDE = "[data-coreui-slide], [data-coreui-slide-to]";
	const SELECTOR_DATA_SLIDE_PREV = "[data-coreui-slide=\"prev\"]";
	const SELECTOR_DATA_SLIDE_NEXT = "[data-coreui-slide=\"next\"]";
	const SELECTOR_DATA_AUTOPLAY = "[data-coreui-autoplay=\"true\"]";
	const KEY_TO_DIRECTION = {
		[ARROW_LEFT_KEY$10]: DIRECTION_RIGHT,
		[ARROW_RIGHT_KEY$10]: DIRECTION_LEFT
	};
	const ENDS_STOP = "stop";
	const ENDS_WRAP = "wrap";
	const ENDS_LOOP = "loop";
	const Default$40 = {
		autoplay: false,
		ends: ENDS_LOOP,
		interval: 5e3,
		keyboard: true,
		pause: "hover"
	};
	const DefaultType$39 = {
		autoplay: "boolean",
		ends: "string",
		interval: "number",
		keyboard: "boolean",
		pause: "(string|boolean)"
	};
	const easeInOutCubic = (progress) => progress < .5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2;
	var Carousel = class Carousel extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._viewport = SelectorEngine.findOne(SELECTOR_INNER$1, this._element) || this._element;
			this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
			this._playPauseElement = SelectorEngine.findOne(SELECTOR_PLAY_PAUSE, this._element);
			this._prevControls = SelectorEngine.find(SELECTOR_DATA_SLIDE_PREV, this._element);
			this._nextControls = SelectorEngine.find(SELECTOR_DATA_SLIDE_NEXT, this._element);
			this._interval = null;
			this._observer = null;
			this._scrollFrame = null;
			this._looping = false;
			this._visibility = /* @__PURE__ */ new Map();
			this._playing = this._config.autoplay;
			this._activeIndex = this._initialActiveIndex();
			this._addEventListeners();
			this._observeItems();
			this._refreshActiveState();
			if (this._playing) this.cycle();
			this._updatePlayPauseControl();
		}
		static get Default() {
			return Default$40;
		}
		static get DefaultType() {
			return DefaultType$39;
		}
		static get NAME() {
			return NAME$45;
		}
		next() {
			this.to(this._navIndex() + 1);
		}
		nextWhenVisible() {
			if (document.visibilityState === "visible" && isVisible(this._element)) this.next();
		}
		prev() {
			this.to(this._navIndex() - 1);
		}
		pause() {
			this._clearInterval();
			this._element.classList.remove(CLASS_NAME_PLAYING);
		}
		cycle() {
			this._clearInterval();
			this._scheduleAutoplay();
			this._element.classList.add(CLASS_NAME_PLAYING);
		}
		to(index) {
			if (this._looping) return;
			const items = this._getItems();
			const rawIndex = Number.parseInt(index, 10);
			if (this._config.ends === ENDS_LOOP && !this._prefersReducedMotion() && this._canLoop()) {
				if (rawIndex > items.length - 1) {
					this._loopTransition(true);
					return;
				}
				if (rawIndex < 0) {
					this._loopTransition(false);
					return;
				}
			}
			const targetIndex = this._normalizeIndex(rawIndex, items.length);
			const currentIndex = this._navIndex();
			if (targetIndex === null || targetIndex === currentIndex) return;
			if (EventHandler.trigger(this._element, EVENT_SLIDE, {
				relatedTarget: items[targetIndex],
				direction: this._direction(currentIndex, targetIndex),
				from: currentIndex,
				to: targetIndex
			}).defaultPrevented) return;
			if (this._isFade()) {
				this._fadeTo(targetIndex);
				return;
			}
			this._scrollToIndex(targetIndex);
		}
		dispose() {
			this._clearInterval();
			if (this._observer) this._observer.disconnect();
			if (this._scrollFrame !== null) cancelAnimationFrame(this._scrollFrame);
			for (const clone of SelectorEngine.find(`.${CLASS_NAME_CLONE}`, this._viewport)) clone.remove();
			this._viewport.style.scrollSnapType = "";
			EventHandler.off(this._viewport, EVENT_KEY$36);
			super.dispose();
		}
		static jQueryInterface(config, ...args) {
			if (typeof config === "number") return this.each(function() {
				Carousel.getOrCreateInstance(this).to(config);
			});
			return jQueryDispatch(this, Carousel, config, args);
		}
		_configAfterMerge(config) {
			if (![
				ENDS_STOP,
				ENDS_WRAP,
				ENDS_LOOP
			].includes(config.ends)) config.ends = Default$40.ends;
			return config;
		}
		_initialActiveIndex() {
			const active = SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
			const index = active ? this._getItems().indexOf(active) : 0;
			return Math.max(index, 0);
		}
		_addEventListeners() {
			if (this._config.keyboard) EventHandler.on(this._element, EVENT_KEYDOWN$14, (event) => this._keydown(event));
			if (this._config.pause === "hover") {
				EventHandler.on(this._element, EVENT_MOUSEENTER$3, () => this.pause());
				EventHandler.on(this._element, EVENT_MOUSELEAVE$2, () => this._maybeEnableCycle());
			}
			EventHandler.on(this._viewport, EVENT_POINTERDOWN$3, () => this._pauseFromInteraction());
		}
		_keydown(event) {
			if (/input|textarea/i.test(event.target.tagName)) return;
			const direction = KEY_TO_DIRECTION[event.key];
			if (direction) {
				event.preventDefault();
				this._pauseFromInteraction();
				if (direction === DIRECTION_RIGHT) this.prev();
				else this.next();
			}
		}
		_observeItems() {
			if (this._isFade() || typeof IntersectionObserver === "undefined") return;
			this._observer = new IntersectionObserver((entries) => this._handleIntersection(entries), {
				root: this._viewport,
				threshold: [
					0,
					.25,
					.5,
					.75,
					1
				]
			});
			for (const item of this._getItems()) this._observer.observe(item);
		}
		_handleIntersection(entries) {
			if (this._looping) return;
			for (const entry of entries) this._visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
			const ratios = this._getItems().map((item) => this._visibility.get(item) ?? 0);
			const maxRatio = Math.max(...ratios);
			let bestIndex = this._activeIndex;
			if (maxRatio > 0) bestIndex = ratios.findIndex((ratio) => ratio >= maxRatio - ACTIVE_RATIO_TOLERANCE);
			this._setActive(bestIndex);
			this._updateEndControls();
		}
		_navIndex() {
			if (this._isFade() || this._viewport.scrollWidth - this._viewport.clientWidth <= 0) return this._activeIndex;
			let index = this._activeIndex;
			let smallestDelta = Number.POSITIVE_INFINITY;
			for (const [itemIndex, item] of this._getItems().entries()) {
				const delta = Math.abs(this._scrollDelta(item));
				if (delta < smallestDelta) {
					smallestDelta = delta;
					index = itemIndex;
				}
			}
			return index;
		}
		_scrollToIndex(index) {
			const item = this._getItems()[index];
			if (!item) return;
			const left = this._scrollDelta(item);
			if (Math.abs(left) < 1) return;
			const targetLeft = this._viewport.scrollLeft + left;
			this._viewport.style.scrollSnapType = "none";
			this._animateScroll(targetLeft, () => {
				this._viewport.style.scrollSnapType = "";
				if (!this._observer) this._setActive(index);
				this._updateEndControls();
			});
		}
		_animateScroll(targetLeft, onComplete) {
			if (this._scrollFrame !== null) {
				cancelAnimationFrame(this._scrollFrame);
				this._scrollFrame = null;
			}
			const startLeft = this._viewport.scrollLeft;
			const distance = targetLeft - startLeft;
			if (this._prefersReducedMotion() || typeof requestAnimationFrame === "undefined") {
				this._viewport.scrollTo({
					left: targetLeft,
					behavior: "instant"
				});
				onComplete();
				return;
			}
			let startTime = null;
			const step = (now) => {
				if (startTime === null) startTime = now;
				const progress = Math.min((now - startTime) / SCROLL_DURATION, 1);
				this._viewport.scrollTo({
					left: startLeft + distance * easeInOutCubic(progress),
					behavior: "instant"
				});
				if (progress < 1) {
					this._scrollFrame = requestAnimationFrame(step);
					return;
				}
				this._viewport.scrollTo({
					left: targetLeft,
					behavior: "instant"
				});
				this._scrollFrame = null;
				onComplete();
			};
			this._scrollFrame = requestAnimationFrame(step);
		}
		_scrollDelta(element) {
			const viewportRect = this._viewport.getBoundingClientRect();
			const rect = element.getBoundingClientRect();
			if (this._element.classList.contains(CLASS_NAME_CENTER)) return rect.left + rect.width / 2 - (viewportRect.left + viewportRect.width / 2);
			const padStart = Number.parseFloat(getComputedStyle(this._viewport).scrollPaddingInlineStart) || 0;
			return isRTL(this._element) ? rect.right - (viewportRect.right - padStart) : rect.left - (viewportRect.left + padStart);
		}
		_loopTransition(isNext) {
			const items = this._getItems();
			const last = items.length - 1;
			const fromIndex = this._activeIndex;
			const toIndex = isNext ? 0 : last;
			const direction = this._loopDirection(isNext);
			if (EventHandler.trigger(this._element, EVENT_SLIDE, {
				relatedTarget: items[toIndex],
				direction,
				from: fromIndex,
				to: toIndex
			}).defaultPrevented) return;
			this._looping = true;
			const clone = (isNext ? items[0] : items[last]).cloneNode(true);
			clone.classList.add(CLASS_NAME_CLONE);
			clone.classList.remove(CLASS_NAME_ACTIVE$7);
			clone.removeAttribute("id");
			for (const node of SelectorEngine.find("[id]", clone)) node.removeAttribute("id");
			clone.setAttribute("aria-hidden", "true");
			clone.inert = true;
			this._viewport.style.scrollSnapType = "none";
			if (isNext) this._viewport.append(clone);
			else {
				this._viewport.prepend(clone);
				this._jumpScroll(this._scrollDelta(items[fromIndex]));
			}
			this._animateScroll(this._viewport.scrollLeft + this._scrollDelta(clone), () => {
				clone.remove();
				this._jumpScroll(this._scrollDelta(items[toIndex]));
				this._activeIndex = toIndex;
				this._refreshActiveState();
				EventHandler.trigger(this._element, EVENT_SLID, {
					relatedTarget: items[toIndex],
					direction,
					from: fromIndex,
					to: toIndex
				});
				this._viewport.style.scrollSnapType = "";
				this._looping = false;
			});
		}
		_loopDirection(isNext) {
			if (isRTL(this._element)) return isNext ? DIRECTION_RIGHT : DIRECTION_LEFT;
			return isNext ? DIRECTION_LEFT : DIRECTION_RIGHT;
		}
		_jumpScroll(delta) {
			this._viewport.style.scrollSnapType = "none";
			this._viewport.scrollBy({
				left: delta,
				top: 0,
				behavior: "instant"
			});
		}
		_fadeTo(index) {
			this._setActive(index);
		}
		_setActive(index) {
			const items = this._getItems();
			if (index === this._activeIndex || !items[index]) return;
			const from = this._activeIndex;
			this._activeIndex = index;
			this._refreshActiveState();
			EventHandler.trigger(this._element, EVENT_SLID, {
				relatedTarget: items[index],
				direction: this._direction(from, index),
				from,
				to: index
			});
		}
		_refreshActiveState() {
			const items = this._getItems();
			for (const [index, item] of items.entries()) item.classList.toggle(CLASS_NAME_ACTIVE$7, index === this._activeIndex);
			this._setActiveIndicatorElement(this._activeIndex);
			this._updateEndControls();
		}
		_updateEndControls() {
			if (this._config.ends !== ENDS_STOP) return;
			const viewport = this._viewport;
			const maxScroll = viewport.scrollWidth - viewport.clientWidth;
			let atStart;
			let atEnd;
			if (maxScroll > 0) {
				const progress = Math.abs(viewport.scrollLeft);
				atStart = progress <= 1;
				atEnd = progress >= maxScroll - 1;
			} else {
				const last = this._getItems().length - 1;
				atStart = this._activeIndex <= 0;
				atEnd = this._activeIndex >= last;
			}
			if (atStart) {
				this._setControlsDisabled(this._nextControls, atEnd);
				this._setControlsDisabled(this._prevControls, atStart);
			} else {
				this._setControlsDisabled(this._prevControls, atStart);
				this._setControlsDisabled(this._nextControls, atEnd);
			}
		}
		_setControlsDisabled(controls, disabled) {
			for (const control of controls) {
				if (disabled && control === document.activeElement) {
					((controls === this._prevControls ? this._nextControls : this._prevControls)[0] ?? this._viewport).focus({ preventScroll: true });
					if (document.activeElement === control) control.blur();
				}
				control.disabled = disabled;
			}
		}
		_setActiveIndicatorElement(index) {
			if (!this._indicatorsElement) return;
			const active = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
			if (active) {
				active.classList.remove(CLASS_NAME_ACTIVE$7);
				active.removeAttribute("aria-current");
			}
			const newActive = SelectorEngine.findOne(`[data-coreui-slide-to="${index}"]`, this._indicatorsElement);
			if (newActive) {
				newActive.classList.add(CLASS_NAME_ACTIVE$7);
				newActive.setAttribute("aria-current", "true");
			}
		}
		_normalizeIndex(index, length) {
			if (Number.isNaN(index) || length === 0) return null;
			if (index < 0) return this._wrapsAround() ? length - 1 : null;
			if (index > length - 1) return this._wrapsAround() ? 0 : null;
			return index;
		}
		_wrapsAround() {
			return this._config.ends === ENDS_WRAP || this._config.ends === ENDS_LOOP;
		}
		_canLoop() {
			if (this._isFade() || this._getItems().length < 2) return false;
			const styles = getComputedStyle(this._element);
			const num = (name) => Number.parseFloat(styles.getPropertyValue(name)) || 0;
			return (num("--cui-carousel-items") || 1) === 1 && num("--cui-carousel-items-peek") === 0 && !this._element.classList.contains(CLASS_NAME_CENTER) && !this._element.classList.contains(CLASS_NAME_AUTO);
		}
		_direction(from, to) {
			const isNext = to > from;
			if (isRTL(this._element)) return isNext ? DIRECTION_RIGHT : DIRECTION_LEFT;
			return isNext ? DIRECTION_LEFT : DIRECTION_RIGHT;
		}
		_scheduleAutoplay(index = this._activeIndex) {
			const interval = this._itemInterval(index);
			this._element.style.setProperty(PROPERTY_INTERVAL, `${interval}ms`);
			this._interval = setTimeout(() => {
				const upcoming = this._upcomingIndex();
				this.nextWhenVisible();
				if (upcoming === null) {
					this.pause();
					return;
				}
				this._scheduleAutoplay(upcoming);
			}, interval);
		}
		_upcomingIndex() {
			return this._normalizeIndex(this._navIndex() + 1, this._getItems().length);
		}
		_itemInterval(index = this._activeIndex) {
			const item = this._getItems()[index];
			const interval = item ? Number.parseInt(item.getAttribute("data-coreui-interval"), 10) : NaN;
			return Number.isNaN(interval) ? this._config.interval : interval;
		}
		_maybeEnableCycle() {
			if (!this._playing) return;
			this.cycle();
		}
		_pauseFromInteraction() {
			this._playing = false;
			this.pause();
			this._updatePlayPauseControl();
		}
		_togglePlayPause() {
			if (this._playing) {
				this._pauseFromInteraction();
				return;
			}
			this._playing = true;
			this.cycle();
			this._updatePlayPauseControl();
		}
		_updatePlayPauseControl() {
			if (!this._playPauseElement) return;
			this._playPauseElement.classList.toggle(CLASS_NAME_PAUSED, !this._playing);
			const label = this._playPauseElement.getAttribute(this._playing ? "data-coreui-pause-label" : "data-coreui-play-label");
			if (label) this._playPauseElement.setAttribute("aria-label", label);
		}
		_isFade() {
			return this._element.classList.contains(CLASS_NAME_FADE$1);
		}
		_prefersReducedMotion() {
			return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		}
		_getItems() {
			return SelectorEngine.find(SELECTOR_ITEM, this._element);
		}
		_clearInterval() {
			if (this._interval) {
				clearTimeout(this._interval);
				this._interval = null;
			}
		}
	};
	EventHandler.on(document, EVENT_CLICK_DATA_API$15, SELECTOR_DATA_SLIDE, function(event) {
		const target = SelectorEngine.getElementFromSelector(this);
		if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) return;
		event.preventDefault();
		const carousel = Carousel.getOrCreateInstance(target);
		carousel._pauseFromInteraction();
		const slideIndex = this.getAttribute("data-coreui-slide-to");
		if (slideIndex) {
			carousel.to(slideIndex);
			return;
		}
		if (Manipulator.getDataAttribute(this, "slide") === "next") {
			carousel.next();
			return;
		}
		carousel.prev();
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$15, SELECTOR_PLAY_PAUSE, function(event) {
		const target = SelectorEngine.getElementFromSelector(this);
		if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) return;
		event.preventDefault();
		Carousel.getOrCreateInstance(target)._togglePlayPause();
	});
	EventHandler.on(window, EVENT_LOAD_DATA_API$19, () => {
		const carousels = SelectorEngine.find(SELECTOR_DATA_AUTOPLAY);
		for (const carousel of carousels) Carousel.getOrCreateInstance(carousel);
	});
	defineJQueryPlugin(Carousel);
	//#endregion
	//#region js/src/util/chip-values.ts
	const splitChipText = (text, separator) => separator && text.includes(separator) ? text.split(separator) : null;
	const resolveChipClassName = (chipClassName, value) => {
		const className = typeof chipClassName === "function" ? chipClassName(value) : chipClassName;
		return typeof className === "string" ? className : "";
	};
	const getChipAnnouncement = (before, after, addedLabel, removedLabel) => {
		let changed = [...new Set(after.filter((value) => value && !before.includes(value)))];
		let label = addedLabel;
		if (changed.length === 0) {
			changed = [...new Set(before.filter((value) => value && !after.includes(value)))];
			label = removedLabel;
		}
		return changed.length > 0 && (typeof label === "function" ? label(changed) : `${changed.join(", ")} ${label}`) || null;
	};
	const getChipRemoveLabel = (removeLabel, label) => {
		if (typeof removeLabel === "function") return removeLabel(label);
		return removeLabel.includes("{label}") ? removeLabel.replaceAll("{label}", () => label) : `${removeLabel} ${label}`.trim();
	};
	//#endregion
	//#region js/src/chip.ts
	const NAME$44 = "chip";
	const EVENT_KEY$35 = `.coreui.chip`;
	const DATA_API_KEY$29 = ".data-api";
	const EVENT_REMOVE$2 = `remove${EVENT_KEY$35}`;
	const EVENT_REMOVED = `removed${EVENT_KEY$35}`;
	const EVENT_SELECT$1 = `select${EVENT_KEY$35}`;
	const EVENT_SELECTED = `selected${EVENT_KEY$35}`;
	const EVENT_DESELECT = `deselect${EVENT_KEY$35}`;
	const EVENT_DESELECTED = `deselected${EVENT_KEY$35}`;
	const EVENT_CLICK$12 = `click${EVENT_KEY$35}`;
	const EVENT_KEYDOWN$13 = `keydown${EVENT_KEY$35}`;
	const SELECTOR_CHIP_CHECK = ".chip-check";
	const SELECTOR_CHIP_REMOVE$3 = ".chip-remove";
	const SELECTOR_DATA_CHIP = "[data-coreui-chip]";
	const CLASS_NAME_CHIP_CHECK = "chip-check";
	const CLASS_NAME_CHIP_CLICKABLE = "chip-clickable";
	const CLASS_NAME_CHIP_REMOVE = "chip-remove";
	const CLASS_NAME_ACTIVE$6 = "active";
	const CLASS_NAME_DISABLED$9 = "disabled";
	const Default$39 = {
		allowList: SVGAllowlist,
		ariaRemoveLabel: "Remove",
		disabled: false,
		filter: false,
		removable: false,
		removeIcon: REMOVE_ICON,
		sanitize: true,
		sanitizeFn: null,
		selectable: false,
		selected: false,
		selectedIcon: CHECK_ICON
	};
	const DefaultType$38 = {
		allowList: "object",
		ariaRemoveLabel: "(string|function)",
		disabled: "boolean",
		filter: "boolean",
		removable: "boolean",
		removeIcon: "string",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		selectable: "boolean",
		selected: "boolean",
		selectedIcon: "string"
	};
	var Chip = class Chip extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._checkIcon = null;
			this._disabled = this._config.disabled;
			this._removeControl = null;
			this._selected = this._config.selected;
			this._applyRole();
			this._ensureRemoveControl();
			this._applyState();
			this._makeFocusable();
			this._addEventListeners();
		}
		static get Default() {
			return Default$39;
		}
		static get DefaultType() {
			return DefaultType$38;
		}
		static get NAME() {
			return NAME$44;
		}
		remove() {
			if (EventHandler.trigger(this._element, EVENT_REMOVE$2).defaultPrevented) return;
			this._destroyElement();
		}
		toggle() {
			if (!this._config.selectable) return;
			if (this._selected) {
				this.deselect();
				return;
			}
			this.select();
		}
		select() {
			if (!this._config.selectable) return;
			if (this._selected) return;
			if (EventHandler.trigger(this._element, EVENT_SELECT$1).defaultPrevented) return;
			this._selected = true;
			this._applyState();
			EventHandler.trigger(this._element, EVENT_SELECTED);
		}
		deselect() {
			if (!this._config.selectable) return;
			if (!this._selected) return;
			if (EventHandler.trigger(this._element, EVENT_DESELECT).defaultPrevented) return;
			this._selected = false;
			this._applyState();
			EventHandler.trigger(this._element, EVENT_DESELECTED);
		}
		dispose() {
			if (!this._element) return;
			this._checkIcon?.remove();
			this._removeControl?.remove();
			super.dispose();
		}
		_configAfterMerge(config) {
			if (config.filter) config.selectable = true;
			return config;
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_KEYDOWN$13, (event) => this._handleKeydown(event));
			EventHandler.on(this._element, EVENT_CLICK$12, (event) => {
				if (this._disabled) return;
				if (event.target.closest(SELECTOR_CHIP_REMOVE$3)) return;
				if (event.shiftKey && this._element.getAttribute("role") === "option") return;
				this.toggle();
			});
			EventHandler.on(this._element, EVENT_CLICK$12, SELECTOR_CHIP_REMOVE$3, (event) => {
				event.stopPropagation();
				if (this._config.removable && !this._disabled) this.remove();
			});
		}
		_applyRole() {
			const option = this._element.getAttribute("role") === "option";
			writeAttribute(this._element, "role", option ? "option" : this._config.selectable ? "button" : null);
		}
		_applyState() {
			this._element.classList.toggle(CLASS_NAME_CHIP_CLICKABLE, !this._disabled && (this._config.clickable || this._config.selectable));
			this._element.classList.toggle(CLASS_NAME_DISABLED$9, this._disabled);
			if (this._disabled && this._element.hasAttribute("role")) this._element.setAttribute("aria-disabled", "true");
			else this._element.removeAttribute("aria-disabled");
			const selected = this._config.selectable && this._selected;
			const option = this._element.getAttribute("role") === "option";
			this._element.classList.toggle(CLASS_NAME_ACTIVE$6, selected);
			writeAttribute(this._element, "aria-selected", option ? String(selected) : null);
			writeAttribute(this._element, "aria-pressed", !option && this._config.selectable ? String(selected) : null);
			if (this._config.filter) {
				if (selected) this._ensureCheckIcon();
				else SelectorEngine.findOne(SELECTOR_CHIP_CHECK, this._element)?.remove();
			}
		}
		_ensureCheckIcon() {
			if (SelectorEngine.findOne(SELECTOR_CHIP_CHECK, this._element)) return;
			const check = document.createElement("span");
			check.className = CLASS_NAME_CHIP_CHECK;
			check.setAttribute("aria-hidden", "true");
			check.innerHTML = sanitizeByConfig(this._config.selectedIcon, this._config);
			this._element.prepend(check);
			this._checkIcon = check;
		}
		_createRemoveControl() {
			if (this._element.hasAttribute("role")) {
				const indicator = document.createElement("span");
				indicator.className = CLASS_NAME_CHIP_REMOVE;
				indicator.setAttribute("aria-hidden", "true");
				indicator.innerHTML = sanitizeByConfig(this._config.removeIcon, this._config);
				return indicator;
			}
			const button = document.createElement("button");
			button.type = "button";
			button.className = CLASS_NAME_CHIP_REMOVE;
			button.setAttribute("aria-label", this._getRemoveLabel());
			button.setAttribute("tabindex", "-1");
			button.innerHTML = sanitizeByConfig(this._config.removeIcon, this._config);
			return button;
		}
		_getRemoveLabel() {
			return getChipRemoveLabel(this._config.ariaRemoveLabel, this._element.textContent.replaceAll(/\s+/g, " ").trim());
		}
		_ensureRemoveControl() {
			if (!this._config.removable || this._disabled) return;
			const existing = SelectorEngine.findOne(SELECTOR_CHIP_REMOVE$3, this._element);
			if (existing) {
				if (existing.tagName === "BUTTON" && !existing.hasAttribute("aria-label")) existing.setAttribute("aria-label", this._getRemoveLabel());
				return;
			}
			this._removeControl = this._createRemoveControl();
			this._element.append(this._removeControl);
		}
		_makeFocusable() {
			const focusable = !this._disabled && (this._config.selectable || this._config.removable);
			writeAttribute(this._element, "tabindex", focusable ? "0" : null);
			writeAttribute(this._element, "data-coreui-chip-focusable", focusable ? "true" : null);
		}
		_handleKeydown(event) {
			const { key } = event;
			if (this._disabled) return;
			switch (key) {
				case "Enter":
				case " ":
				case "Spacebar":
					if (!this._config.selectable) return;
					event.preventDefault();
					this.toggle();
					break;
				case "Backspace":
				case "Delete": if (this._config.removable) {
					event.preventDefault();
					this.remove();
				}
			}
		}
		_destroyElement() {
			EventHandler.trigger(this._element, EVENT_REMOVED);
			this._element.remove();
			this.dispose();
		}
		static chipInterface(element, config, ...args) {
			const data = Chip.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Chip, config, (element) => [element]);
		}
	};
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$35}${DATA_API_KEY$29}`, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP)) Chip.chipInterface(element);
	});
	defineJQueryPlugin(Chip);
	//#endregion
	//#region js/src/util/focus.ts
	const containsFocus = (element) => Boolean(element?.contains(element.getRootNode().activeElement));
	const focusWithTemporaryTabindex = (element) => {
		if (element.hasAttribute("tabindex")) {
			element.focus();
			return;
		}
		const release = () => {
			if (element.getRootNode().activeElement !== element) {
				element.removeEventListener("blur", release);
				element.removeAttribute("tabindex");
			}
		};
		element.setAttribute("tabindex", "-1");
		element.addEventListener("blur", release);
		element.focus();
		release();
	};
	//#endregion
	//#region js/src/chip-set.ts
	const NAME$43 = "chip-set";
	const EVENT_KEY$34 = `.coreui.chip-set`;
	const DATA_API_KEY$28 = ".data-api";
	const EVENT_ADD$1 = "add";
	const EVENT_REMOVE$1 = "remove";
	const EVENT_CHANGE$9 = "change";
	const EVENT_SELECT = "select";
	const EVENT_CLICK$11 = "click";
	const EVENT_FOCUSIN$6 = "focusin";
	const EVENT_KEYDOWN$12 = "keydown";
	const A_KEY = "a";
	const ARROW_LEFT_KEY$9 = "ArrowLeft";
	const ARROW_RIGHT_KEY$9 = "ArrowRight";
	const END_KEY$5 = "End";
	const HOME_KEY$5 = "Home";
	const EVENT_CHIP_SELECTED = "selected.coreui.chip";
	const EVENT_CHIP_DESELECTED = "deselected.coreui.chip";
	const EVENT_CHIP_REMOVE$1 = "remove.coreui.chip";
	const EVENT_CHIP_REMOVED = "removed.coreui.chip";
	const SELECTOR_DATA_CHIP_SET = "[data-coreui-chip-set]";
	const SELECTOR_CHIP$2 = ".chip";
	const SELECTOR_CHIP_ACTIVE = `${SELECTOR_CHIP$2}.active`;
	const SELECTOR_CHIP_REMOVE$2 = ".chip-remove";
	const SELECTOR_FOCUSABLE_ITEMS = ".chip[data-coreui-chip-focusable]";
	const CLASS_NAME_CHIP$1 = "chip";
	const CLASS_NAME_DISABLED$8 = "disabled";
	const SELECTION_MODE_SINGLE = "single";
	const Default$38 = {
		ariaAddedAnnouncement: "added",
		ariaRemoveLabel: "Remove",
		ariaRemovedAnnouncement: "removed",
		chipClassName: null,
		disabled: false,
		filter: false,
		maxChips: null,
		removable: false,
		removeIcon: REMOVE_ICON,
		selectable: false,
		selectedIcon: CHECK_ICON,
		selectionMode: "multiple",
		typeahead: true,
		unique: false
	};
	const DefaultType$37 = {
		ariaAddedAnnouncement: "(string|function)",
		ariaRemoveLabel: "(string|function)",
		ariaRemovedAnnouncement: "(string|function)",
		chipClassName: "(string|function|null)",
		disabled: "boolean",
		filter: "boolean",
		maxChips: "(number|null)",
		removable: "boolean",
		removeIcon: "string",
		selectable: "boolean",
		selectedIcon: "string",
		selectionMode: "string",
		typeahead: "boolean",
		unique: "boolean"
	};
	var ChipSet = class ChipSet extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._disabled = this._config.disabled;
			this._pendingFocus = null;
			this._chips = [];
			this._ownedChips = /* @__PURE__ */ new Map();
			this._anchor = null;
			this._typeaheadBuffer = createTypeaheadBuffer();
			this._announcedFrom = null;
			this._batch = null;
			this._settled = false;
			this._applyAccessibilityRoles();
			this._initChips();
			this._moveTabStop();
			this._addEventListeners();
			queueMicrotask(() => {
				this._settled = true;
			});
		}
		static get Default() {
			return Default$38;
		}
		static get DefaultType() {
			return DefaultType$37;
		}
		static get NAME() {
			return NAME$43;
		}
		add(chip) {
			if (!this._canModify()) return null;
			const isElement = typeof chip !== "string";
			const value = isElement ? this._getChipValue(chip) : String(chip).trim();
			if (!value) return null;
			if (this._config.unique && this._chips.includes(value)) return null;
			if (this._config.maxChips !== null && this._chips.length >= this._config.maxChips) return null;
			if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_ADD$1), {
				value,
				relatedTarget: this._input ?? null
			}).defaultPrevented) return null;
			const element = isElement ? chip : this._createChip(value);
			this._appendChip(element);
			this._setupChip(element);
			this._moveTabStop();
			this._noteChange();
			this._chips.push(value);
			if (this._batch) this._batch.added = true;
			else this._triggerChange();
			return element;
		}
		remove(chipOrValue) {
			if (!this._canModify()) return false;
			let chip;
			let value;
			if (typeof chipOrValue === "string") {
				value = chipOrValue;
				chip = this._findChipByValue(value);
			} else {
				chip = chipOrValue;
				value = this._getChipValue(chip);
			}
			if (!chip || !value) return false;
			if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_REMOVE$1), {
				value,
				chip,
				relatedTarget: this._input ?? null
			}).defaultPrevented) return false;
			const instance = Chip.getInstance(chip);
			if (instance) instance.remove();
			else {
				chip.remove();
				this._handleChipRemoval(chip, value);
			}
			return !chip.isConnected;
		}
		removeSelected() {
			this._removeChips(this._getSelectedChipElements());
		}
		clear() {
			this._removeChips(this._getChipElements());
		}
		selectChip(chip) {
			if (!this._getChipElements().includes(chip)) return;
			Chip.getInstance(chip)?.select();
		}
		selectAll() {
			if (!this._config.selectable) return;
			for (const chip of this._getChipElements()) Chip.getInstance(chip)?.select();
		}
		deselectAll() {
			for (const chip of this._getSelectedChipElements()) Chip.getInstance(chip)?.deselect();
		}
		clearSelection() {
			this.deselectAll();
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { selected: this.getSelectedValues() });
		}
		getValues() {
			return [...this._chips];
		}
		getSelectedValues() {
			return this._getSelectedChipElements().map((chip) => this._getChipValue(chip));
		}
		dispose() {
			if (!this._element) return;
			EventHandler.off(this._element, Chip.EVENT_KEY);
			for (const [chip, instance] of this._ownedChips) if (Chip.getInstance(chip) === instance && this._element.contains(chip)) instance.dispose();
			if (this._containerRole() === "listbox") for (const chip of this._getChipElements()) chip.removeAttribute("role");
			this._typeaheadBuffer.clear();
			super.dispose();
		}
		_configAfterMerge(config) {
			if (config.filter) config.selectable = true;
			return config;
		}
		_canModify() {
			return !this._disabled;
		}
		_appendChip(chip) {
			this._element.append(chip);
		}
		_getChipElements() {
			return SelectorEngine.find(SELECTOR_CHIP$2, this._element);
		}
		_getSelectedChipElements() {
			return SelectorEngine.find(SELECTOR_CHIP_ACTIVE, this._element);
		}
		_findChipByValue(value) {
			return this._getChipElements().find((chip) => this._getChipValue(chip) === value);
		}
		_getChipValue(chip) {
			if (chip.dataset.coreuiChipValue) return chip.dataset.coreuiChipValue;
			const clone = chip.cloneNode(true);
			const remove = SelectorEngine.findOne(SELECTOR_CHIP_REMOVE$2, clone);
			if (remove) remove.remove();
			return clone.textContent?.trim() || "";
		}
		_getFocusableChips() {
			return SelectorEngine.find(SELECTOR_FOCUSABLE_ITEMS, this._element);
		}
		_initChips() {
			for (const chip of this._getChipElements()) {
				const value = this._getChipValue(chip);
				if (value) {
					this._chips.push(value);
					this._applyChipClassName(chip, value);
				}
				this._setupChip(chip);
			}
		}
		_containerRole() {
			return this._config.selectable ? "listbox" : "group";
		}
		_applyAccessibilityRoles() {
			const role = this._containerRole();
			if (!role) return;
			const listbox = role === "listbox";
			this._element.setAttribute("role", role);
			writeAttribute(this._element, "aria-orientation", listbox ? "horizontal" : null);
			writeAttribute(this._element, "aria-multiselectable", listbox && this._config.selectionMode === "multiple" ? "true" : null);
		}
		_moveTabStop(stop = null) {
			const chips = this._getFocusableChips();
			const current = stop ?? chips.find((chip) => chip.tabIndex === 0) ?? chips[0];
			for (const chip of chips) chip.tabIndex = chip === current ? 0 : -1;
		}
		_noteChange() {
			if (!this._settled || this._announcedFrom) return;
			this._announcedFrom = [...this._chips];
			queueMicrotask(() => this._announceChange());
		}
		_announceChange() {
			const before = this._announcedFrom ?? [];
			this._announcedFrom = null;
			if (!this._element?.isConnected || !this._element.checkVisibility()) return;
			const message = getChipAnnouncement(before, this._chips, this._config.ariaAddedAnnouncement, this._config.ariaRemovedAnnouncement);
			if (message) announce(message, { context: this._element });
		}
		_triggerChange() {
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE$9), { value: this.getValues() });
		}
		_setupChip(chip) {
			if (!Chip.getInstance(chip)) {
				if (this._containerRole() === "listbox") chip.setAttribute("role", "option");
				this._ownedChips.set(chip, new Chip(chip, this._getChipConfig(chip)));
			}
		}
		_getChipConfig(chip) {
			return {
				ariaRemoveLabel: this._config.ariaRemoveLabel,
				disabled: this._disabled,
				filter: this._config.filter,
				removable: this._config.removable,
				removeIcon: this._config.removeIcon,
				selectable: this._config.selectable,
				selectedIcon: this._config.selectedIcon,
				...Manipulator.getDataAttributes(chip)
			};
		}
		_createChip(value) {
			const chip = document.createElement("span");
			chip.className = CLASS_NAME_CHIP$1;
			chip.dataset.coreuiChipValue = value;
			chip.append(document.createTextNode(value));
			this._applyChipClassName(chip, value);
			return chip;
		}
		_applyChipClassName(chip, value) {
			const className = resolveChipClassName(this._config.chipClassName, value);
			if (!className) return;
			chip.classList.add(...className.split(/\s+/).filter(Boolean));
		}
		_addEventListeners() {
			EventHandler.on(this._element, this.constructor.eventName(EVENT_KEYDOWN$12), SELECTOR_CHIP$2, (event) => this._handleKeydown(event));
			EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$11), SELECTOR_CHIP$2, (event) => this._handleClick(event));
			EventHandler.on(this._element, this.constructor.eventName(EVENT_FOCUSIN$6), SELECTOR_CHIP$2, (event) => this._moveTabStop(event.delegateTarget));
			EventHandler.on(this._element, EVENT_CHIP_SELECTED, SELECTOR_CHIP$2, (event) => this._handleSelectionChange(event));
			EventHandler.on(this._element, EVENT_CHIP_DESELECTED, SELECTOR_CHIP$2, (event) => this._handleSelectionChange(event));
			EventHandler.on(this._element, EVENT_CHIP_REMOVE$1, SELECTOR_CHIP$2, (event) => this._handleChipRemove(event));
			EventHandler.on(this._element, EVENT_CHIP_REMOVED, SELECTOR_CHIP$2, (event) => this._handleChipRemoved(event));
		}
		_handleKeydown(event) {
			const chip = event.target.closest(SELECTOR_CHIP$2);
			if (!chip || chip.classList.contains(CLASS_NAME_DISABLED$8)) return;
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === A_KEY) {
				if (this._selectsRange()) {
					event.preventDefault();
					this.selectAll();
				}
				return;
			}
			const rtl = isRTL(this._element);
			switch (event.key) {
				case ARROW_LEFT_KEY$9:
					event.preventDefault();
					this._moveFocus(this._focusSibling(chip, rtl), event.shiftKey);
					break;
				case ARROW_RIGHT_KEY$9:
					event.preventDefault();
					this._moveFocus(this._focusSibling(chip, !rtl), event.shiftKey);
					break;
				case HOME_KEY$5:
					event.preventDefault();
					this._moveFocus(this._navigateToEdge(0), event.shiftKey);
					break;
				case END_KEY$5:
					event.preventDefault();
					this._moveFocus(this._navigateToEdge(-1), event.shiftKey);
					break;
				default: this._typeahead(event.key);
			}
		}
		_handleClick(event) {
			const chip = event.target.closest(SELECTOR_CHIP$2);
			if (!chip || chip.classList.contains(CLASS_NAME_DISABLED$8) || event.target.closest(SELECTOR_CHIP_REMOVE$2)) return;
			if (event.shiftKey && this._selectsRange()) {
				this._selectRange(this._anchor ?? chip, chip);
				return;
			}
			this._anchor = chip;
		}
		_selectsRange() {
			return this._config.selectable && this._config.selectionMode !== SELECTION_MODE_SINGLE;
		}
		_moveFocus(target, extend) {
			if (!target) return;
			if (extend && this._selectsRange()) {
				this._selectRange(this._anchor ?? target, target);
				return;
			}
			this._anchor = target;
		}
		_selectRange(from, to) {
			const chips = this._getFocusableChips();
			for (const chip of rangeBetween(chips, chips.indexOf(from), chips.indexOf(to))) Chip.getInstance(chip)?.select();
		}
		_typeahead(key) {
			const text = this._config.typeahead ? this._typeaheadBuffer.push(key) : null;
			if (!text) return;
			const chips = this._getFocusableChips();
			const current = chips.indexOf(document.activeElement);
			findTypeaheadMatch(chips, current, text, (chip) => this._getChipValue(chip))?.focus();
		}
		_focusSibling(chip, shouldGetNext) {
			const chips = this._getFocusableChips();
			if (chips.length === 0) return null;
			const sibling = getNextActiveElement(chips, chip, shouldGetNext, false);
			if (sibling && sibling !== chip) {
				sibling.focus();
				return sibling;
			}
			return null;
		}
		_getRemovalFocusTarget(chip) {
			return getRemovalNeighbor(this._getFocusableChips(), chip) ?? this._getRemovalFallback();
		}
		_getRemovalFallback() {
			return this._element;
		}
		_navigateToEdge(targetIndex) {
			const chips = this._getFocusableChips();
			const target = chips[targetIndex < 0 ? chips.length + targetIndex : targetIndex] ?? null;
			target?.focus();
			return target;
		}
		_handleSelectionChange(event) {
			const chip = event.target.closest(SELECTOR_CHIP$2);
			if (this._config.selectionMode === SELECTION_MODE_SINGLE && chip?.matches(SELECTOR_CHIP_ACTIVE)) this._enforceSingleSelection(chip);
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { selected: this.getSelectedValues() });
		}
		_enforceSingleSelection(selectedChip) {
			for (const chip of this._getSelectedChipElements()) if (chip !== selectedChip) Chip.getInstance(chip)?.deselect();
		}
		_handleChipRemove(event) {
			const chip = event.target.closest(SELECTOR_CHIP$2);
			this._pendingFocus = chip ? this._getRemovalFocusTarget(chip) : null;
		}
		_handleChipRemoved(event) {
			const chip = event.target.closest(SELECTOR_CHIP$2);
			const target = this._pendingFocus;
			this._pendingFocus = null;
			if (target && containsFocus(chip)) {
				if (target === this._element) focusWithTemporaryTabindex(this._element);
				else target.focus();
			}
			this._handleChipRemoval(chip, this._getChipValue(chip));
		}
		_handleChipRemoval(chip, value) {
			this._ownedChips.delete(chip);
			this._moveTabStop();
			const index = this._chips.indexOf(value);
			if (index !== -1) {
				this._noteChange();
				this._chips.splice(index, 1);
			}
			if (this._batch) this._batch.removed = true;
			else this._reportRemoval();
		}
		_removeChips(chips) {
			const outer = !this._batch;
			const batch = this._batch ?? {
				added: false,
				removed: false
			};
			this._batch = batch;
			try {
				for (const chip of chips) if (this._element.contains(chip)) this.remove(chip);
			} finally {
				if (outer) {
					this._batch = null;
					if (batch.removed) this._reportRemoval();
					else if (batch.added) this._triggerChange();
				}
			}
		}
		_reportRemoval() {
			this._triggerChange();
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { selected: this.getSelectedValues() });
		}
		static chipSetInterface(element, config, ...args) {
			const data = ChipSet.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, ChipSet, config, args);
		}
	};
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$34}${DATA_API_KEY$28}`, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP_SET)) ChipSet.chipSetInterface(element);
	});
	defineJQueryPlugin(ChipSet);
	//#endregion
	//#region js/src/chip-input.ts
	const NAME$42 = "chip-input";
	const EVENT_KEY$33 = `.coreui.chip-input`;
	const DATA_API_KEY$27 = ".data-api";
	const EVENT_BLUR = `blur${EVENT_KEY$33}`;
	const EVENT_CLICK$10 = `click${EVENT_KEY$33}`;
	const EVENT_FOCUS$4 = `focus${EVENT_KEY$33}`;
	const EVENT_INPUT$10 = `input${EVENT_KEY$33}`;
	const EVENT_KEYDOWN$11 = `keydown${EVENT_KEY$33}`;
	const EVENT_PASTE$1 = `paste${EVENT_KEY$33}`;
	const SELECTOR_DATA_CHIP_INPUT = "[data-coreui-chip-input]";
	const SELECTOR_CHIP$1 = ".chip";
	const SELECTOR_CHIP_INPUT_LABEL = ".chip-input-label";
	const SELECTOR_CHIP_REMOVE$1 = ".chip-remove";
	const CLASS_NAME_DISABLED$7 = "disabled";
	const CLASS_NAME_CHIP_INPUT_FIELD = "chip-input-field";
	const CLASS_NAME_GROUP = "form-control-group";
	const Default$37 = {
		...ChipSet.Default,
		create: true,
		createOnBlur: true,
		id: null,
		name: null,
		placeholder: "",
		readonly: false,
		removable: true,
		required: false,
		separator: ",",
		unique: true,
		validationState: null
	};
	const DefaultType$36 = {
		...ChipSet.DefaultType,
		create: "boolean",
		createOnBlur: "boolean",
		id: "(string|null)",
		name: "(string|null)",
		placeholder: "string",
		readonly: "boolean",
		required: "boolean",
		separator: "(string|null)",
		validationState: "(string|null|undefined)"
	};
	var ChipInput = class extends ChipSet {
		constructor(element, config) {
			super(element, config);
			this._createdInput = false;
			this._labelledFor = null;
			this._uniqueId = this._config.id ?? getUID(NAME$42);
			this._valueField = null;
			this._removingByCode = false;
			this._validation = new FieldValidation(this._element, {
				config: () => this._config,
				fields: () => this._valueField ? [this._valueField] : [],
				frames: () => [this._element],
				invalidTargets: () => [this._input],
				owned: () => [this._valueField, this._input].filter(Boolean),
				restore: () => this._restoreChips()
			});
			applyControlGroupClasses(this._element, CLASS_NAME_GROUP);
			this._input = SelectorEngine.findOne("input", this._element);
			if (this._input) this._setInputSize();
			else this._createInput();
			this._applyInteractionState();
			if (this._config.create) this._createValueField();
			this._initialChips = this._getChipElements();
			this._addInputEventListeners();
			this._validation.refresh();
		}
		static get Default() {
			return Default$37;
		}
		static get DefaultType() {
			return DefaultType$36;
		}
		static get NAME() {
			return NAME$42;
		}
		remove(chipOrValue) {
			const previous = this._removingByCode;
			this._removingByCode = true;
			try {
				return super.remove(chipOrValue);
			} finally {
				this._removingByCode = previous;
			}
		}
		focus() {
			this._input?.focus();
		}
		setValidationState(validationState) {
			this._setConfig({ validationState });
		}
		dispose() {
			this._validation.dispose();
			EventHandler.off(this._input, EVENT_KEY$33);
			this._valueField?.remove();
			if (this._createdInput) {
				this._input.remove();
				this._labelledFor?.removeAttribute("for");
			}
			super.dispose();
		}
		_setConfig(config) {
			if (!config || !("validationState" in config)) return;
			this._config = this._getConfig({
				...this._config,
				validationState: config.validationState
			});
			this._validation.configure({ validationState: config.validationState });
		}
		_containerRole() {
			return null;
		}
		_canModify() {
			return !this._disabled && !this._config.readonly;
		}
		_appendChip(chip) {
			this._element.insertBefore(chip, this._input);
		}
		_getChipConfig(chip) {
			const disabled = this._disabled || Manipulator.getDataAttribute(chip, "disabled") === true;
			return {
				ariaRemoveLabel: this._config.ariaRemoveLabel,
				disabled,
				removable: this._config.removable && !this._config.readonly && !disabled,
				removeIcon: this._config.removeIcon,
				selectable: this._config.selectable
			};
		}
		_setupChip(chip) {
			super._setupChip(chip);
			const removeButton = SelectorEngine.findOne(SELECTOR_CHIP_REMOVE$1, chip);
			if (removeButton) removeButton.disabled = this._disabled || this._config.readonly;
		}
		_getRemovalFallback() {
			return this._input ?? super._getRemovalFallback();
		}
		_handleChipRemoved(event) {
			if (this._removingByCode) {
				super._handleChipRemoved(event);
				return;
			}
			this._validation.runAsUser(() => super._handleChipRemoved(event));
		}
		_noteChange() {
			super._noteChange();
			this._validation.change();
		}
		_triggerChange() {
			const isChanged = this._valueField ? writeValueField(this._valueField, this.getValues()) : false;
			this._validation.update();
			super._triggerChange();
			if (isChanged) dispatchValueChange(this._valueField);
		}
		_restoreChips() {
			const values = this.getValues().join(",");
			let hadFocus = false;
			for (const chip of this._getChipElements()) if (!this._initialChips.includes(chip)) {
				hadFocus ||= containsFocus(chip);
				Chip.getInstance(chip)?.dispose();
				this._ownedChips.delete(chip);
				chip.remove();
			}
			let anchor = this._input;
			for (const chip of this._initialChips.toReversed()) {
				if (!this._element.contains(chip)) {
					this._element.insertBefore(chip, anchor);
					this._setupChip(chip);
				}
				anchor = chip;
			}
			this._chips = this._initialChips.map((chip) => this._getChipValue(chip));
			this._setInputSize();
			if (hadFocus) this._input.focus();
			if (this.getValues().join(",") !== values || this._valueField.value !== this.getValues().join(",")) this._triggerChange();
		}
		_addInputEventListeners() {
			EventHandler.on(this._element, EVENT_KEYDOWN$11, (event) => {
				if (event.target === this._input) return;
				if (event.key === (isRTL(this._element) ? "ArrowLeft" : "ArrowRight")) {
					const chips = this._getFocusableChips();
					if (chips.length > 0 && chips[chips.length - 1].contains(event.target)) {
						event.preventDefault();
						this._input.focus();
						return;
					}
				}
				if (event.key?.length === 1) this._input.focus();
			});
			EventHandler.on(this._input, EVENT_KEYDOWN$11, (event) => this._handleInputKeydown(event));
			EventHandler.on(this._input, EVENT_INPUT$10, (event) => this._handleInput(event));
			EventHandler.on(this._input, EVENT_PASTE$1, (event) => this._handlePaste(event));
			EventHandler.on(this._input, EVENT_FOCUS$4, () => this.clearSelection());
			if (this._config.createOnBlur) EventHandler.on(this._input, EVENT_BLUR, (event) => {
				if (!event.relatedTarget?.closest(SELECTOR_CHIP$1)) this._createChipFromInput();
			});
			EventHandler.on(this._element, EVENT_CLICK$10, (event) => {
				if (event.target === this._element) this._input?.focus();
			});
		}
		_createInput() {
			const input = document.createElement("input");
			const label = SelectorEngine.findOne(SELECTOR_CHIP_INPUT_LABEL, this._element);
			const labelFor = label?.getAttribute("for");
			const generatedInputId = labelFor || getUID(`${NAME$42}-input`);
			this._createdInput = true;
			input.type = "text";
			input.className = CLASS_NAME_CHIP_INPUT_FIELD;
			input.id = generatedInputId;
			if (this._config.placeholder) input.placeholder = this._config.placeholder;
			if (label && !labelFor) {
				label.setAttribute("for", generatedInputId);
				this._labelledFor = label;
			}
			this._input = input;
			this._setInputSize();
			this._element.append(input);
		}
		_createValueField() {
			const field = createValueField("textarea", () => this._input);
			field.id = this._uniqueId;
			configureValueField(field, {
				disabled: this._disabled,
				name: this._config.name,
				readOnly: this._config.readonly,
				required: this._config.required
			});
			field.defaultValue = this.getValues().join(",");
			this._element.append(field);
			this._valueField = field;
		}
		_createChipFromInput() {
			if (!this._canModify() || !this._config.create) return;
			const value = this._input.value.trim();
			if (value) {
				this._validation.runAsUser(() => this.add(value));
				this._input.value = "";
				this._setInputSize();
			}
		}
		_applyInteractionState() {
			const { readonly } = this._config;
			this._element.classList.toggle(CLASS_NAME_DISABLED$7, this._disabled);
			this._input.disabled = this._disabled;
			this._input.readOnly = !this._disabled && readonly;
			writeAttribute(this._input, "aria-required", this._config.create && this._config.required ? "true" : null);
		}
		_handleInputKeydown(event) {
			const { key } = event;
			switch (key) {
				case "Enter":
					event.preventDefault();
					this._createChipFromInput();
					break;
				case "Backspace":
				case "Delete":
					if (this._input.value === "") {
						event.preventDefault();
						const chips = this._getChipElements();
						if (chips.length > 0) chips[chips.length - 1].focus();
					}
					break;
				case "ArrowLeft":
				case "ArrowRight":
					if (key === (isRTL(this._element) ? "ArrowRight" : "ArrowLeft") && this._input.selectionStart === 0 && this._input.selectionEnd === 0) {
						event.preventDefault();
						const chips = this._getChipElements();
						if (chips.length > 0) chips[chips.length - 1].focus();
					}
					break;
				case "Escape":
					this._input.value = "";
					this._input.blur();
			}
		}
		_handleInput(event) {
			if (!this._canModify()) return;
			const parts = this._config.create ? splitChipText(event.target.value, this._config.separator) : null;
			if (parts) {
				const rest = parts.pop();
				this._validation.runAsUser(() => {
					for (const part of parts) this.add(part);
				});
				this._input.value = rest;
			}
			this._setInputSize();
			EventHandler.trigger(this._element, EVENT_INPUT$10, {
				value: this._input.value,
				relatedTarget: this._input
			});
		}
		_handlePaste(event) {
			if (!this._canModify()) return;
			if (!this._config.create || !this._config.separator) return;
			const parts = splitChipText((event.clipboardData || window.clipboardData).getData("text"), this._config.separator);
			if (parts) {
				event.preventDefault();
				this._validation.runAsUser(() => {
					for (const part of parts) this.add(part);
				});
			}
		}
		_setInputSize() {
			if (!this._input) return;
			this._input.size = Math.max(this._input.placeholder.length, this._input.value.length) || 1;
		}
	};
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$33}${DATA_API_KEY$27}`, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP_INPUT)) ChipInput.getOrCreateInstance(element);
	});
	//#endregion
	//#region js/src/collapse.ts
	const NAME$41 = "collapse";
	const EVENT_KEY$32 = `.coreui.collapse`;
	const DATA_API_KEY$26 = ".data-api";
	const EVENT_SHOW$6 = `show${EVENT_KEY$32}`;
	const EVENT_SHOWN$6 = `shown${EVENT_KEY$32}`;
	const EVENT_HIDE$4 = `hide${EVENT_KEY$32}`;
	const EVENT_HIDDEN$9 = `hidden${EVENT_KEY$32}`;
	const EVENT_CLICK_DATA_API$14 = `click${EVENT_KEY$32}${DATA_API_KEY$26}`;
	const EVENT_LOAD_DATA_API$18 = `DOMContentLoaded${EVENT_KEY$32}${DATA_API_KEY$26}`;
	const EVENT_BEFOREMATCH = `beforematch${EVENT_KEY$32}`;
	const CLASS_NAME_SHOW$13 = "show";
	const CLASS_NAME_COLLAPSE = "collapse";
	const CLASS_NAME_COLLAPSING$1 = "collapsing";
	const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
	const CLASS_NAME_HORIZONTAL = "collapse-horizontal";
	const WIDTH = "width";
	const HEIGHT = "height";
	const ATTRIBUTE_HIDDEN = "hidden";
	const VALUE_UNTIL_FOUND = "until-found";
	const SELECTOR_ACTIVES = ".collapse.show";
	const SELECTOR_DATA_TOGGLE$12 = "[data-coreui-toggle=\"collapse\"]";
	const SELECTOR_HIDDEN_UNTIL_FOUND = ".collapse[data-coreui-hidden-until-found=\"true\"]";
	const Default$36 = {
		hiddenUntilFound: false,
		parent: null
	};
	const DefaultType$35 = {
		hiddenUntilFound: "boolean",
		parent: "(null|element)"
	};
	const supportsUntilFound = () => typeof document !== "undefined" && "onbeforematch" in document.documentElement;
	var Collapse = class Collapse extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._isTransitioning = false;
			this._triggerArray = [];
			const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$12);
			for (const elem of toggleList) {
				const selector = SelectorEngine.getSelectorFromElement(elem);
				const filterElement = SelectorEngine.find(selector).filter((foundElement) => foundElement === this._element);
				if (selector !== null && filterElement.length) this._triggerArray.push(elem);
			}
			this._initializeChildren();
			if (!this._config.parent) this._setAriaExpanded(this._triggerArray, this._isShown());
			if (this._config.hiddenUntilFound && supportsUntilFound()) {
				EventHandler.on(this._element, EVENT_BEFOREMATCH, () => this._onBeforeMatch());
				this._setHiddenUntilFound(!this._isShown());
			}
		}
		static get Default() {
			return Default$36;
		}
		static get DefaultType() {
			return DefaultType$35;
		}
		static get NAME() {
			return NAME$41;
		}
		toggle() {
			return this._isShown() ? this.hide() : this.show();
		}
		async show() {
			if (this._isTransitioning || this._isShown()) return;
			let activeChildren = [];
			if (this._config.parent) activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter((element) => element !== this._element && !this._sharesTrigger(element)).map((element) => Collapse.getOrCreateInstance(element));
			if (activeChildren.length && activeChildren[0]._isTransitioning) return;
			if (EventHandler.trigger(this._element, EVENT_SHOW$6).defaultPrevented) return;
			for (const activeInstance of activeChildren) activeInstance.hide();
			const dimension = this._getDimension();
			this._setHiddenUntilFound(false);
			this._element.classList.add(CLASS_NAME_COLLAPSING$1, CLASS_NAME_SHOW$13);
			this._setAriaExpanded(this._triggerArray, true);
			this._isTransitioning = true;
			const complete = () => {
				this._isTransitioning = false;
				this._element.classList.remove(CLASS_NAME_COLLAPSING$1);
				this._element.style[dimension] = "";
				EventHandler.trigger(this._element, EVENT_SHOWN$6);
			};
			if (supportsInterpolateSize()) {
				await this._queueCallback(complete, this._element, true, dimension);
				return;
			}
			const scrollSize = `scroll${dimension[0].toUpperCase() + dimension.slice(1)}`;
			startSizeTransition(this._element, dimension, 0, this._element[scrollSize]);
			await this._queueCallback(complete, this._element, true, dimension);
		}
		async hide() {
			if (this._isTransitioning || !this._isShown()) return;
			if (EventHandler.trigger(this._element, EVENT_HIDE$4).defaultPrevented) return;
			const cssPath = supportsInterpolateSize();
			const dimension = this._getDimension();
			const size = cssPath ? 0 : this._element.getBoundingClientRect()[dimension];
			this._element.classList.add(CLASS_NAME_COLLAPSING$1);
			if (cssPath) this._setHiddenUntilFound(true);
			this._element.classList.remove(CLASS_NAME_SHOW$13);
			for (const trigger of this._triggerArray) {
				const element = SelectorEngine.getElementFromSelector(trigger);
				if (element && !this._isShown(element)) this._setAriaExpanded([trigger], false);
			}
			this._isTransitioning = true;
			const complete = () => {
				this._isTransitioning = false;
				this._element.classList.remove(CLASS_NAME_COLLAPSING$1);
				this._element.style[dimension] = "";
				if (!cssPath) this._setHiddenUntilFound(true);
				EventHandler.trigger(this._element, EVENT_HIDDEN$9);
			};
			if (!cssPath) startSizeTransition(this._element, dimension, size, 0);
			await this._queueCallback(complete, this._element, true, dimension);
		}
		_isShown(element = this._element) {
			return element.classList.contains(CLASS_NAME_SHOW$13);
		}
		_configAfterMerge(config) {
			config.parent = getElement(config.parent);
			return config;
		}
		_getDimension() {
			return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
		}
		_sharesTrigger(element) {
			return this._triggerArray.some((trigger) => SelectorEngine.getMultipleElementsFromSelector(trigger).includes(element));
		}
		_initializeChildren() {
			if (!this._config.parent) return;
			const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$12);
			for (const element of children) {
				const selected = SelectorEngine.getElementFromSelector(element);
				if (selected) this._setAriaExpanded([element], this._isShown(selected));
			}
		}
		_getFirstLevelChildren(selector) {
			const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
			return SelectorEngine.find(selector, this._config.parent).filter((element) => !children.includes(element));
		}
		_setHiddenUntilFound(hidden) {
			if (!this._config.hiddenUntilFound || !supportsUntilFound()) return;
			if (hidden) {
				this._element.setAttribute(ATTRIBUTE_HIDDEN, VALUE_UNTIL_FOUND);
				return;
			}
			this._element.removeAttribute(ATTRIBUTE_HIDDEN);
		}
		_onBeforeMatch() {
			if (this._isShown()) return;
			this._element.classList.add(CLASS_NAME_SHOW$13);
			this._setAriaExpanded(this._triggerArray, true);
			EventHandler.trigger(this._element, EVENT_SHOWN$6);
		}
		_setAriaExpanded(triggerArray, isOpen) {
			if (!triggerArray.length) return;
			for (const element of triggerArray) setAriaAttribute(element, "aria-expanded", isOpen);
		}
		static _initializeDataApi() {
			if (!supportsUntilFound()) return;
			for (const element of SelectorEngine.find(SELECTOR_HIDDEN_UNTIL_FOUND)) Collapse.getOrCreateInstance(element);
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Collapse, config);
		}
	};
	EventHandler.on(document, EVENT_LOAD_DATA_API$18, () => {
		Collapse._initializeDataApi();
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$14, SELECTOR_DATA_TOGGLE$12, function(event) {
		if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") event.preventDefault();
		for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) Collapse.getOrCreateInstance(element).toggle();
	});
	defineJQueryPlugin(Collapse);
	//#endregion
	//#region js/src/combobox.ts
	const NAME$40 = "combobox";
	const DATA_KEY$1 = "coreui.combobox";
	const EVENT_KEY$31 = `.${DATA_KEY$1}`;
	const DATA_API_KEY$25 = ".data-api";
	const ARROW_UP_KEY$6 = "ArrowUp";
	const ARROW_DOWN_KEY$7 = "ArrowDown";
	const ENTER_KEY$3 = "Enter";
	const ESCAPE_KEY$3 = "Escape";
	const SPACE_KEY$2 = " ";
	const TAB_KEY$2 = "Tab";
	const RIGHT_MOUSE_BUTTON$2 = 2;
	const EVENT_CHANGE$8 = `change${EVENT_KEY$31}`;
	const EVENT_KEYDOWN$10 = `keydown${EVENT_KEY$31}`;
	const EVENT_SEARCH$2 = `search${EVENT_KEY$31}`;
	const EVENT_SELECTION_LIMIT$1 = `selectionLimit${EVENT_KEY$31}`;
	const EVENT_CLICK_DATA_API$13 = `click${EVENT_KEY$31}${DATA_API_KEY$25}`;
	const EVENT_KEYUP_DATA_API$3 = `keyup${EVENT_KEY$31}${DATA_API_KEY$25}`;
	const EVENT_LOAD_DATA_API$17 = `load${EVENT_KEY$31}${DATA_API_KEY$25}`;
	const EVENT_LIST_BOX = ".coreui.list-box";
	const EVENT_LIST_BOX_SEARCH$1 = `search${EVENT_LIST_BOX}`;
	const CLASS_NAME_CARET = "combobox-caret";
	const CLASS_NAME_DISABLED$6 = "disabled";
	const CLASS_NAME_LIST_BOX = "list-box";
	const CLASS_NAME_OPTIONS$1 = "list-box-options";
	const CLASS_NAME_INPUT_GROUP_IGNORE = "input-group-ignore";
	const CLASS_NAME_PLACEHOLDER = "combobox-placeholder";
	const CLASS_NAME_POPUP$1 = "popup";
	const CLASS_NAME_POPUP_COMBOBOX = "combobox-popup";
	const CLASS_NAME_SEARCH$1 = "list-box-search";
	const CLASS_NAME_SELECT$1 = "combobox-select";
	const CLASS_NAME_SHOW$12 = "show";
	const CLASS_NAME_TOGGLE = "combobox-toggle";
	const CLASS_NAME_VALUE = "combobox-value";
	const SELECTOR_CARET = ".combobox-caret";
	const SELECTOR_DATA_TOGGLE$11 = "[data-coreui-toggle=\"combobox\"]";
	const SELECTOR_DATA_TOGGLE_SHOWN = `.${CLASS_NAME_TOGGLE}.${CLASS_NAME_SHOW$12}`;
	const SELECTOR_LIST_BOX = ".list-box";
	const SELECTOR_OPTION$2 = ".list-box-option";
	const SELECTOR_OPTION_LABEL = ".list-box-option-label";
	const SELECTOR_OPTIONS$1 = ".list-box-options";
	const SELECTOR_POPUP = ".popup";
	const SELECTOR_SEARCH$2 = "[data-coreui-list-box-search]";
	const SELECTOR_VALUE = ".combobox-value";
	const Default$35 = {
		allowList: DefaultAllowlist,
		ariaSearchLabel: "Search options",
		caretIcon: CARET_ICON,
		container: false,
		disabled: false,
		html: false,
		indicator: "none",
		items: [],
		multiple: false,
		name: null,
		placeholder: "",
		required: false,
		resetSelectionOnItemsChange: false,
		sanitize: true,
		sanitizeFn: null,
		search: false,
		searchNormalize: false,
		searchPlaceholder: "Search",
		selectedLabel: (count) => `${count} selected`,
		selectionLimit: null,
		typeahead: true,
		validationState: null,
		value: null
	};
	const DefaultType$34 = {
		allowList: "object",
		ariaSearchLabel: "string",
		caretIcon: "string",
		container: "(string|element|boolean)",
		disabled: "boolean",
		html: "boolean",
		indicator: "string",
		items: "array",
		multiple: "boolean",
		name: "(string|null)",
		placeholder: "string",
		required: "boolean",
		resetSelectionOnItemsChange: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		search: "(boolean|string)",
		searchNormalize: "boolean",
		searchPlaceholder: "string",
		selectedLabel: "(string|function)",
		selectionLimit: "(null|number)",
		typeahead: "boolean",
		validationState: "(string|null|undefined)",
		value: "(string|array|null)"
	};
	var Combobox = class Combobox extends ComboboxBase {
		constructor(element, config) {
			super(element, config);
			this._uniqueId = this._element.id || getUID(NAME$40);
			this._togglerElement = this._element;
			this._createdNodes = [];
			this._hostValue = null;
			this._labels = /* @__PURE__ */ new Map();
			this._resetValues = [];
			this._searchElement = null;
			this._validation = new FieldValidation(this._element, {
				config: () => this._config,
				describedTargets: () => [this._element],
				fields: () => [this._valueField],
				frames: () => [this._element],
				invalidTargets: () => [],
				owned: () => [this._valueField, this._searchElement].filter(Boolean),
				restore: () => this._restoreValue()
			});
			this._listBox = null;
			this._listBoxElement = null;
			this._menu = null;
			this._optionsElement = null;
			this._floatingCleanup = null;
			this._anchoredPosition = null;
			this._search = "";
			this._createCombobox();
			this._addEventListeners();
			data_default.set(this._element, DATA_KEY$1, this);
		}
		static get Default() {
			return Default$35;
		}
		static get DefaultType() {
			return DefaultType$34;
		}
		static get NAME() {
			return NAME$40;
		}
		getValue() {
			const selected = this._listBox ? this._listBox.getSelectedValues() : [];
			return this._config.multiple ? selected : selected[0] ?? null;
		}
		setValue(value) {
			const given = typeof value === "number" ? String(value) : value;
			this._typeCheckConfig({ value: given }, { value: DefaultType$34.value });
			this._applySelection(toSelectionValues(given, "multiple").map(String), false);
		}
		clear() {
			this._applySelection([]);
		}
		setItems(items) {
			const listed = new Map(SelectorEngine.find(SELECTOR_OPTION$2, this._optionsElement).map((option) => [this._valueOf(option), this._labelOf(option)]));
			this._labels = new Map((this._listBox?.getSelectedValues() ?? []).map((value) => [value, listed.get(value) ?? this._labels.get(value) ?? value]));
			this._listBox?.setItems(items);
			this._updateValue();
		}
		update() {
			this._listBox?.update();
			this._updateValue();
		}
		setValidationState(validationState) {
			this._setConfig({ validationState });
		}
		dispose() {
			if (!this._element) return;
			this._validation.dispose();
			this._disposeFloating();
			this._disposeListBox();
			this._valueField.remove();
			if (this._menu) EventHandler.off(this._menu, EVENT_KEY$31);
			this._element.after(this._menu);
			this._menu.classList.remove(CLASS_NAME_SHOW$12);
			if (this._listBoxElement) EventHandler.off(this._listBoxElement, EVENT_LIST_BOX);
			if (this._searchElement) EventHandler.off(this._searchElement, EVENT_KEY$31);
			for (const node of this._createdNodes) node.remove();
			if (this._hostValue) this._valueElement.replaceChildren(...this._hostValue);
			this._element.classList.remove(CLASS_NAME_SHOW$12);
			this._element.setAttribute("aria-expanded", "false");
			super.dispose();
		}
		_setConfig(config) {
			if (!config || !("validationState" in config)) return;
			this._config = this._getConfig({
				...this._config,
				validationState: config.validationState
			});
			this._validation.configure({ validationState: config.validationState });
		}
		_getConfig(config) {
			this._valueFromMarkup = !(config !== null && typeof config === "object" && "value" in config);
			return super._getConfig(config);
		}
		_configAfterMerge(config) {
			config = this._normalizeContainerConfig(config);
			if (typeof config.value === "number") config.value = String(config.value);
			if (config.multiple && this._valueFromMarkup && typeof config.value === "string") config.value = config.value.split(/,\s*/);
			return config;
		}
		_createCombobox() {
			this._element.classList.add(CLASS_NAME_TOGGLE);
			this._element.classList.toggle(CLASS_NAME_DISABLED$6, this._config.disabled);
			this._element.setAttribute("aria-haspopup", "listbox");
			this._element.setAttribute("aria-expanded", "false");
			if (this._element instanceof HTMLButtonElement) {
				this._element.type = "button";
				this._element.disabled = this._config.disabled;
			}
			this._createValueElement();
			this._createCaret();
			this._createValueField();
			this._resolveMenu();
			this._createSearchInput();
			this._validation.refresh();
			this._store = createSelectionStore((next) => toSelectionValues(next, this._config.multiple ? "multiple" : "single"));
			this._store.commit(toSelectionValues(this._config.value, "multiple").map(String));
			this._listBox = new ListBox(this._listBoxElement, this._getListBoxConfig(), this._store);
			this._addListBoxListeners();
			this._addPanelEscapeListener(this._menu);
			this._updateValue();
			this._resetValues = this._listBox.getSelectedValues();
		}
		_createValueElement() {
			const existing = SelectorEngine.findOne(SELECTOR_VALUE, this._element);
			if (existing) {
				this._hostValue = [...existing.childNodes];
				this._valueElement = existing;
				return;
			}
			const value = document.createElement("span");
			value.classList.add(CLASS_NAME_VALUE);
			this._element.prepend(value);
			this._createdNodes.push(value);
			this._valueElement = value;
		}
		_createCaret() {
			if (SelectorEngine.findOne(SELECTOR_CARET, this._element) || !this._config.caretIcon) return;
			const template = document.createElement("template");
			template.innerHTML = sanitizeByConfig(this._config.caretIcon, {
				...this._config,
				allowList: SVGAllowlist
			});
			const caret = template.content.lastElementChild;
			if (!caret) return;
			caret.classList.add(CLASS_NAME_CARET);
			caret.setAttribute("aria-hidden", "true");
			this._createdNodes.push(...template.content.childNodes);
			this._element.append(template.content);
		}
		_createValueField() {
			const field = createValueField("select", () => this._element);
			field.classList.add(CLASS_NAME_SELECT$1, CLASS_NAME_INPUT_GROUP_IGNORE);
			field.multiple = this._config.multiple;
			configureValueField(field, {
				disabled: this._config.disabled,
				name: this._config.name,
				required: this._config.required
			});
			field.addEventListener("invalid", () => alignValueField(field, this._element));
			this._element.after(field);
			this._valueField = field;
		}
		_resolveMenu() {
			const pagePopup = SelectorEngine.next(this._element, SELECTOR_POPUP)[0];
			const popup = pagePopup ?? document.createElement("div");
			if (!pagePopup) this._createdNodes.push(popup);
			popup.classList.add(CLASS_NAME_POPUP$1, CLASS_NAME_POPUP_COMBOBOX);
			let listBox = SelectorEngine.findOne(SELECTOR_LIST_BOX, popup);
			if (!listBox) {
				listBox = document.createElement("div");
				listBox.classList.add(CLASS_NAME_LIST_BOX);
				popup.append(listBox);
				this._createdNodes.push(listBox);
			}
			let options = SelectorEngine.findOne(SELECTOR_OPTIONS$1, listBox);
			if (!options) {
				options = document.createElement("div");
				options.classList.add(CLASS_NAME_OPTIONS$1);
				listBox.append(options);
				this._createdNodes.push(options);
			}
			if (!options.id) options.id = `${this._uniqueId}-listbox`;
			popup.remove();
			this._menu = popup;
			this._listBoxElement = listBox;
			this._optionsElement = options;
		}
		_createSearchInput() {
			if (!this._config.search) return;
			const existing = SelectorEngine.findOne(SELECTOR_SEARCH$2, this._listBoxElement);
			if (existing) {
				this._searchElement = existing;
				return;
			}
			const search = document.createElement("input");
			search.type = "search";
			search.className = `form-control ${CLASS_NAME_SEARCH$1}`;
			search.setAttribute("data-coreui-list-box-search", "");
			this._optionsElement.before(search);
			this._createdNodes.push(search);
			this._searchElement = search;
		}
		_getListBoxConfig() {
			return {
				activeDescendant: this._searchElement ?? this._element,
				allowList: this._config.allowList,
				ariaSearchLabel: this._config.ariaSearchLabel,
				disabled: this._config.disabled,
				html: this._config.html,
				indicator: this._config.indicator,
				items: this._config.items,
				resetSelectionOnItemsChange: this._config.resetSelectionOnItemsChange,
				sanitize: this._config.sanitize,
				sanitizeFn: this._config.sanitizeFn,
				search: this._config.search,
				searchNormalize: this._config.searchNormalize,
				searchPlaceholder: this._config.searchPlaceholder,
				selected: null,
				selectionLimit: this._config.selectionLimit,
				selectionMode: this._config.multiple ? "multiple" : "single",
				typeahead: this._config.typeahead
			};
		}
		_valueOf(option) {
			return option.dataset.coreuiValue ?? option.textContent?.trim() ?? "";
		}
		_applySelection(values, notify = true) {
			if (!this._listBox) return;
			const listed = new Set(SelectorEngine.find(SELECTOR_OPTION$2, this._optionsElement).map((option) => this._valueOf(option)));
			const next = [...new Set(values)].filter((value) => listed.has(value) || this._store.has(value));
			this._commitSelection(next.slice(0, getSelectionLimit(this._config.multiple, this._config.selectionLimit) ?? next.length));
			if (notify) this._commitValue();
			else this._updateValue();
		}
		_commitValue() {
			if (!this._updateValue()) return;
			EventHandler.trigger(this._element, EVENT_CHANGE$8, { value: this.getValue() });
			dispatchValueChange(this._valueField);
		}
		_updateValue() {
			const values = this._listBox ? this._listBox.getSelectedValues() : [];
			const isChanged = writeValueField(this._valueField, values);
			this._validation.update();
			this._updateValueText(values);
			return isChanged;
		}
		_updateValueText(values) {
			if (values.length === 0) {
				this._valueElement.textContent = this._config.placeholder;
				this._valueElement.classList.add(CLASS_NAME_PLACEHOLDER);
				return;
			}
			this._valueElement.classList.remove(CLASS_NAME_PLACEHOLDER);
			this._valueElement.textContent = this._config.multiple && values.length > 1 ? resolveCountLabel(this._config.selectedLabel, values.length, (/* @__PURE__ */ new Set([...SelectorEngine.find(SELECTOR_OPTION$2, this._optionsElement).map((option) => this._valueOf(option)), ...values])).size) : this._optionLabel(values[0]);
		}
		_optionLabel(value) {
			const option = SelectorEngine.find(SELECTOR_OPTION$2, this._optionsElement).find((element) => this._valueOf(element) === value);
			return option ? this._labelOf(option) : this._labels.get(value) ?? value;
		}
		_labelOf(option) {
			return (SelectorEngine.findOne(SELECTOR_OPTION_LABEL, option) ?? option).textContent?.trim() ?? this._valueOf(option);
		}
		_afterShow() {
			this._searchElement?.focus();
		}
		_afterHideDispose() {
			if (this._searchElement) {
				this._searchElement.value = "";
				this._listBox?.update();
			}
		}
		_onOptionSelected() {
			this._validation.dismiss();
		}
		_onOptionDeselected() {
			this._validation.dismiss();
		}
		_onSelectionChange() {
			this._commitValue();
			if (!this._config.multiple && this._isShown()) {
				this.hide();
				this._element.focus();
			}
		}
		_onSelectionLimit(limit, value) {
			EventHandler.trigger(this._element, EVENT_SELECTION_LIMIT$1, {
				limit,
				value
			});
		}
		_restoreValue() {
			if (this._listBox && this._listBox.getSelectedValues().join("\0") !== this._resetValues.join("\0")) this._applySelection(this._resetValues);
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_KEYDOWN$10, (event) => this._handleToggleKeydown(event));
			EventHandler.on(this._listBoxElement, EVENT_LIST_BOX_SEARCH$1, (event) => {
				EventHandler.trigger(this._element, EVENT_SEARCH$2, { query: event.query });
			});
			if (this._searchElement) EventHandler.on(this._searchElement, EVENT_KEYDOWN$10, (event) => {
				if (event.key === TAB_KEY$2) this.hide();
			});
		}
		_handleToggleKeydown(event) {
			const { key } = event;
			if (key === TAB_KEY$2) {
				if (this._isShown()) this.hide();
				return;
			}
			if (this._isShown()) {
				if (key === ESCAPE_KEY$3) {
					event.preventDefault();
					event.stopPropagation();
					this.hide();
				}
				return;
			}
			if (key === ARROW_DOWN_KEY$7 || key === ARROW_UP_KEY$6) {
				event.preventDefault();
				this.show();
				return;
			}
			if ((key === ENTER_KEY$3 || key === SPACE_KEY$2) && !event.defaultPrevented) {
				event.preventDefault();
				this.show();
			}
		}
		static clearMenus(event) {
			if (event.button === RIGHT_MOUSE_BUTTON$2 || event.type === "keyup" && event.key !== TAB_KEY$2) return;
			for (const toggle of SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN)) {
				const context = Combobox.getInstance(toggle);
				if (!context) continue;
				const composedPath = event.composedPath();
				if (composedPath.includes(context._element) || composedPath.includes(context._menu)) continue;
				context.hide();
			}
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, Combobox, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$17, () => {
		for (const toggle of SelectorEngine.find(SELECTOR_DATA_TOGGLE$11)) Combobox.getOrCreateInstance(toggle);
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$13, SELECTOR_DATA_TOGGLE$11, function(event) {
		event.preventDefault();
		Combobox.getOrCreateInstance(this).toggle();
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$13, Combobox.clearMenus);
	EventHandler.on(document, EVENT_KEYUP_DATA_API$3, Combobox.clearMenus);
	defineJQueryPlugin(Combobox);
	//#endregion
	//#region js/src/menu.ts
	const NAME$39 = "menu";
	const EVENT_KEY$30 = `.coreui.menu`;
	const DATA_API_KEY$24 = ".data-api";
	const ESCAPE_KEY$2 = "Escape";
	const TAB_KEY$1 = "Tab";
	const ARROW_UP_KEY$5 = "ArrowUp";
	const ARROW_DOWN_KEY$6 = "ArrowDown";
	const ARROW_LEFT_KEY$8 = "ArrowLeft";
	const ARROW_RIGHT_KEY$8 = "ArrowRight";
	const HOME_KEY$4 = "Home";
	const END_KEY$4 = "End";
	const ENTER_KEY$2 = "Enter";
	const SPACE_KEY$1 = " ";
	const RIGHT_MOUSE_BUTTON$1 = 2;
	const SUBMENU_CLOSE_DELAY = 100;
	const EVENT_CLICK_DATA_API$12 = `click${EVENT_KEY$30}${DATA_API_KEY$24}`;
	const EVENT_KEYDOWN_DATA_API$3 = `keydown${EVENT_KEY$30}${DATA_API_KEY$24}`;
	const EVENT_KEYUP_DATA_API$2 = `keyup${EVENT_KEY$30}${DATA_API_KEY$24}`;
	const CLASS_NAME_SHOW$11 = "show";
	const SELECTOR_NAVBAR_NAV = ".navbar-nav";
	const DEFAULT_PLACEMENT = "bottom-start";
	const SUBMENU_PLACEMENT = "end-start";
	const triangleSign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
	const Default$34 = {
		autoClose: true,
		boundary: "clippingParents",
		container: false,
		display: "dynamic",
		floatingConfig: null,
		menu: null,
		offset: [0, 2],
		placement: DEFAULT_PLACEMENT,
		reference: "toggle",
		strategy: "absolute",
		submenuDelay: SUBMENU_CLOSE_DELAY,
		submenuTrigger: "both"
	};
	const DefaultType$33 = {
		autoClose: "(boolean|string)",
		boundary: "(string|element)",
		container: "(string|element|boolean)",
		display: "string",
		floatingConfig: "(null|object|function)",
		menu: "(null|element)",
		offset: "(array|string|function)",
		placement: "string",
		reference: "(string|element|object)",
		strategy: "string",
		submenuDelay: "number",
		submenuTrigger: "string"
	};
	var Menu = class Menu extends BaseComponent {
		static {
			this._openInstances = /* @__PURE__ */ new Set();
		}
		constructor(element, config) {
			if (typeof _floating_ui_dom.computePosition === "undefined") throw new TypeError("CoreUI's menus require Floating UI (https://floating-ui.com)");
			super(element, config);
			this._floatingCleanup = null;
			this._mediaQueryListeners = [];
			this._responsivePlacements = null;
			this._parent = this._element.parentNode;
			this._openSubmenus = /* @__PURE__ */ new Map();
			this._submenuCloseTimeouts = /* @__PURE__ */ new Map();
			this._submenuListeners = [];
			this._hoverIntentData = null;
			this._menu = this._config.menu || this._findMenu();
			if (!this._config.menu && this._menu) this._parent = this._findWrapper(this._menu);
			this._isSubmenu = this._parent.classList?.contains(this.constructor.SELECTOR_SUBMENU.slice(1));
			this._menuOriginalParent = this._menu?.parentNode;
			this._menuDirection = null;
			this._parseResponsivePlacements();
			this._setupSubmenuListeners();
		}
		static get SELECTOR_DATA_TOGGLE() {
			return "[data-coreui-toggle=\"menu\"]:not(.disabled):not(:disabled)";
		}
		static get SELECTOR_MENU() {
			return ".menu";
		}
		static get SELECTOR_SUBMENU() {
			return ".submenu";
		}
		static get SELECTOR_SUBMENU_TOGGLE() {
			return ".submenu > .menu-item";
		}
		static get SELECTOR_VISIBLE_ITEMS() {
			return ".menu-item:not(.disabled):not(:disabled)";
		}
		static get Default() {
			return Default$34;
		}
		static get DefaultType() {
			return DefaultType$33;
		}
		static get NAME() {
			return NAME$39;
		}
		toggle() {
			return this._isShown() ? this.hide() : this.show();
		}
		async show() {
			if (isDisabled(this._element) || this._isShown()) return;
			const relatedTarget = { relatedTarget: this._element };
			if (EventHandler.trigger(this._element, this.constructor.eventName("show"), relatedTarget).defaultPrevented) return;
			this._moveMenuToContainer();
			this._createFloating();
			if ("ontouchstart" in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) for (const element of document.body.children) EventHandler.on(element, "mouseover", noop);
			this._element.focus({ focusVisible: false });
			this._element.setAttribute("aria-expanded", "true");
			this._menu.classList.add(CLASS_NAME_SHOW$11);
			this._element.classList.add(CLASS_NAME_SHOW$11);
			if (this._parent) this._parent.classList.add(CLASS_NAME_SHOW$11);
			Menu._openInstances.add(this);
			EventHandler.trigger(this._element, this.constructor.eventName("shown"), relatedTarget);
		}
		async hide() {
			if (isDisabled(this._element) || !this._isShown()) return;
			const relatedTarget = { relatedTarget: this._element };
			this._completeHide(relatedTarget);
		}
		dispose() {
			this._disposeFloating();
			this._restoreMenuToOriginalParent();
			this._disposeMediaQueryListeners();
			this._closeAllSubmenus();
			this._clearAllSubmenuTimeouts();
			Menu._openInstances.delete(this);
			for (const [type, selector, handler] of this._submenuListeners) if (selector) EventHandler.off(this._menu, type, selector, handler);
			else EventHandler.off(this._menu, type, handler);
			super.dispose();
		}
		update() {
			if (this._floatingCleanup) this._updateFloatingPosition();
		}
		_findMenu() {
			const wrapper = SelectorEngine.closest(this._element, `:has(${this.constructor.SELECTOR_MENU})`);
			return SelectorEngine.next(this._element, this.constructor.SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, this.constructor.SELECTOR_MENU)[0] || SelectorEngine.findOne(this.constructor.SELECTOR_MENU, wrapper || this._parent);
		}
		_findWrapper(menu) {
			let wrapper = this._element.parentNode;
			while (wrapper instanceof Element && !wrapper.contains(menu)) wrapper = wrapper.parentNode;
			return wrapper instanceof Element ? wrapper : this._element.parentNode;
		}
		_completeHide(relatedTarget) {
			if (EventHandler.trigger(this._element, this.constructor.eventName("hide"), relatedTarget).defaultPrevented) return;
			this._closeAllSubmenus();
			if ("ontouchstart" in document.documentElement) for (const element of document.body.children) EventHandler.off(element, "mouseover", noop);
			this._disposeFloating();
			this._restoreMenuToOriginalParent();
			this._menu.classList.remove(CLASS_NAME_SHOW$11);
			this._element.classList.remove(CLASS_NAME_SHOW$11);
			if (this._parent) this._parent.classList.remove(CLASS_NAME_SHOW$11);
			this._element.setAttribute("aria-expanded", "false");
			this._removeMenuAttributes();
			Menu._openInstances.delete(this);
			EventHandler.trigger(this._element, this.constructor.eventName("hidden"), relatedTarget);
		}
		_removeMenuAttributes() {
			Manipulator.removeDataAttribute(this._menu, "placement");
			Manipulator.removeDataAttribute(this._menu, "display");
		}
		_getConfig(config) {
			config = super._getConfig(config);
			if (typeof config.reference === "object" && !isElement(config.reference) && typeof config.reference.getBoundingClientRect !== "function") throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
			return config;
		}
		_createFloating() {
			if (this._config.display === "static") {
				Manipulator.setDataAttribute(this._menu, "display", "static");
				return;
			}
			const referenceElement = this._getReferenceElement();
			this._updateFloatingPosition(referenceElement);
			this._floatingCleanup = (0, _floating_ui_dom.autoUpdate)(referenceElement, this._menu, () => this._updateFloatingPosition(referenceElement));
		}
		async _updateFloatingPosition(referenceElement = null) {
			if (!this._menu) return;
			referenceElement ??= this._getReferenceElement();
			const placement = this._getPlacement();
			const middleware = this._getFloatingMiddleware();
			const floatingConfig = this._getFloatingConfig(placement, middleware);
			await this._applyFloatingPosition(referenceElement, this._menu, floatingConfig.placement, floatingConfig.middleware, floatingConfig.strategy);
		}
		_getReferenceElement() {
			const { reference } = this._config;
			if (reference === "parent") return this._parent;
			if (isElement(reference)) return getElement(reference);
			if (typeof reference === "object") return reference;
			return this._element;
		}
		_isShown() {
			return this._menu.classList.contains(CLASS_NAME_SHOW$11);
		}
		_isToggleTarget(composedPath) {
			return composedPath.includes(this._element);
		}
		_getPlacement() {
			const placement = this._responsivePlacements ? getResponsivePlacement(this._responsivePlacements, DEFAULT_PLACEMENT) : this._config.placement ?? DEFAULT_PLACEMENT;
			return this._resolveLogicalPlacement(placement);
		}
		_resolveLogicalPlacement(placement, element = this._element) {
			if (isRTL(element)) return placement.replace(/^start(?=-|$)/, "right").replace(/^end(?=-|$)/, "left");
			return placement.replace(/^start(?=-|$)/, "left").replace(/^end(?=-|$)/, "right");
		}
		_parseResponsivePlacements() {
			this._responsivePlacements = parseResponsivePlacement(this._config.placement, DEFAULT_PLACEMENT);
			if (this._responsivePlacements) this._setupMediaQueryListeners();
		}
		_setupMediaQueryListeners() {
			this._disposeMediaQueryListeners();
			this._mediaQueryListeners = createBreakpointListeners(() => {
				if (this._isShown()) this._updateFloatingPosition();
			});
		}
		_disposeMediaQueryListeners() {
			disposeBreakpointListeners(this._mediaQueryListeners);
			this._mediaQueryListeners = [];
		}
		_getOffset() {
			const { offset: offsetConfig } = this._config;
			if (typeof offsetConfig === "string") return offsetConfig.split(",").map((value) => Number.parseInt(value, 10));
			if (typeof offsetConfig === "function") return ({ placement, rects }) => {
				const result = offsetConfig({
					placement,
					reference: rects.reference,
					floating: rects.floating
				}, this._element);
				return toFloatingOffset(result);
			};
			return offsetConfig;
		}
		_getFloatingMiddleware() {
			const offsetValue = this._getOffset();
			return [
				(0, _floating_ui_dom.offset)(typeof offsetValue === "function" ? offsetValue : toFloatingOffset(offsetValue)),
				(0, _floating_ui_dom.flip)({
					fallbackPlacements: this._getFallbackPlacements(),
					fallbackStrategy: "initialPlacement"
				}),
				(0, _floating_ui_dom.shift)({ boundary: this._config.boundary === "clippingParents" ? "clippingAncestors" : this._config.boundary })
			];
		}
		_getFallbackPlacements() {
			return {
				bottom: [
					"top",
					"bottom-start",
					"bottom-end",
					"top-start",
					"top-end"
				],
				"bottom-start": [
					"top-start",
					"bottom-end",
					"top-end"
				],
				"bottom-end": [
					"top-end",
					"bottom-start",
					"top-start"
				],
				top: [
					"bottom",
					"top-start",
					"top-end",
					"bottom-start",
					"bottom-end"
				],
				"top-start": [
					"bottom-start",
					"top-end",
					"bottom-end"
				],
				"top-end": [
					"bottom-end",
					"top-start",
					"bottom-start"
				],
				right: [
					"left",
					"right-start",
					"right-end",
					"left-start",
					"left-end"
				],
				"right-start": [
					"left-start",
					"right-end",
					"left-end",
					"top-start",
					"bottom-start"
				],
				"right-end": [
					"left-end",
					"right-start",
					"left-start",
					"top-end",
					"bottom-end"
				],
				left: [
					"right",
					"left-start",
					"left-end",
					"right-start",
					"right-end"
				],
				"left-start": [
					"right-start",
					"left-end",
					"right-end",
					"top-start",
					"bottom-start"
				],
				"left-end": [
					"right-end",
					"left-start",
					"right-start",
					"top-end",
					"bottom-end"
				]
			}[this._getPlacement()] || [
				"top",
				"bottom",
				"right",
				"left"
			];
		}
		_getFloatingConfig(placement, middleware) {
			const defaultConfig = {
				placement,
				middleware,
				strategy: this._config.strategy
			};
			return {
				...defaultConfig,
				...execute(this._config.floatingConfig, [void 0, defaultConfig])
			};
		}
		_disposeFloating() {
			if (this._floatingCleanup) {
				this._floatingCleanup();
				this._floatingCleanup = null;
			}
		}
		_getContainer() {
			const { container } = this._config;
			if (container === false) return null;
			const target = container === true ? document.body : getElement(container);
			return target ? resolvePopupContainer(this._element, target) : null;
		}
		_moveMenuToContainer() {
			const container = this._getContainer();
			if (!container || !this._menu) return;
			if (this._menu.parentNode !== container) container.append(this._menu);
			if (!this._menu.hasAttribute("dir")) {
				this._menuDirection = isRTL(this._element) ? "rtl" : "ltr";
				this._menu.dir = this._menuDirection;
			}
		}
		_restoreMenuToOriginalParent() {
			if (!this._menuOriginalParent || !this._menu) return;
			if (this._menu.parentNode !== this._menuOriginalParent) this._menuOriginalParent.append(this._menu);
			if (this._menuDirection && this._menu.dir === this._menuDirection) {
				this._menu.removeAttribute("dir");
				this._menuDirection = null;
			}
		}
		async _applyFloatingPosition(reference, floating, placement, middleware, strategy = "absolute") {
			if (!floating.isConnected) return null;
			const { x, y, placement: finalPlacement } = await (0, _floating_ui_dom.computePosition)(reference, floating, {
				placement,
				middleware,
				strategy
			});
			if (!floating.isConnected) return null;
			Object.assign(floating.style, {
				position: strategy,
				left: `${x}px`,
				top: `${y}px`,
				margin: "0"
			});
			Manipulator.setDataAttribute(floating, "placement", finalPlacement);
			return finalPlacement;
		}
		_setupSubmenuListeners() {
			if (this._config.submenuTrigger === "hover" || this._config.submenuTrigger === "both") {
				this._listenOnMenu("mouseenter", this.constructor.SELECTOR_SUBMENU_TOGGLE, (event) => {
					this._onSubmenuTriggerEnter(event);
				});
				this._listenOnMenu("mouseleave", this.constructor.SELECTOR_SUBMENU, (event) => {
					this._onSubmenuLeave(event);
				});
				this._listenOnMenu("mousemove", null, (event) => {
					this._trackMousePosition(event);
				});
			}
			if (this._config.submenuTrigger === "click" || this._config.submenuTrigger === "both") this._listenOnMenu("click", this.constructor.SELECTOR_SUBMENU_TOGGLE, (event) => {
				this._onSubmenuTriggerClick(event);
			});
		}
		_listenOnMenu(type, selector, handler) {
			if (selector) EventHandler.on(this._menu, type, selector, handler);
			else EventHandler.on(this._menu, type, handler);
			this._submenuListeners.push([
				type,
				selector,
				handler
			]);
		}
		_onSubmenuTriggerEnter(event) {
			const trigger = event.target.closest(this.constructor.SELECTOR_SUBMENU_TOGGLE);
			if (!trigger) return;
			const submenuWrapper = trigger.closest(this.constructor.SELECTOR_SUBMENU);
			const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper);
			if (!submenu) return;
			this._cancelSubmenuCloseTimeout(submenu);
			this._closeSiblingSubmenus(submenuWrapper);
			this._openSubmenu(trigger, submenu, submenuWrapper);
		}
		_onSubmenuLeave(event) {
			const submenuWrapper = event.target.closest(this.constructor.SELECTOR_SUBMENU);
			const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper);
			if (!submenu || !this._openSubmenus.has(submenu)) return;
			if (this._isMovingTowardSubmenu(event, submenu)) return;
			this._scheduleSubmenuClose(submenu, submenuWrapper);
		}
		_onSubmenuTriggerClick(event) {
			const trigger = event.target.closest(this.constructor.SELECTOR_SUBMENU_TOGGLE);
			if (!trigger) return;
			event.preventDefault();
			event.stopPropagation();
			const submenuWrapper = trigger.closest(this.constructor.SELECTOR_SUBMENU);
			const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper);
			if (!submenu) return;
			if (this._openSubmenus.has(submenu)) this._closeSubmenu(submenu, submenuWrapper);
			else {
				this._closeSiblingSubmenus(submenuWrapper);
				this._openSubmenu(trigger, submenu, submenuWrapper);
			}
		}
		_openSubmenu(trigger, submenu, submenuWrapper) {
			if (this._openSubmenus.has(submenu)) return;
			trigger.setAttribute("aria-expanded", "true");
			trigger.setAttribute("aria-haspopup", "true");
			submenu.style.opacity = "0";
			submenu.classList.add(CLASS_NAME_SHOW$11);
			submenuWrapper.classList.add(CLASS_NAME_SHOW$11);
			const cleanup = this._createSubmenuFloating(trigger, submenu, submenuWrapper);
			const cancelClose = () => {
				this._cancelSubmenuCloseTimeout(submenu);
			};
			this._openSubmenus.set(submenu, () => {
				cleanup();
				EventHandler.off(submenu, "mouseenter", cancelClose);
			});
			EventHandler.on(submenu, "mouseenter", cancelClose);
		}
		_closeSubmenu(submenu, submenuWrapper) {
			if (!this._openSubmenus.has(submenu)) return;
			const nestedSubmenus = SelectorEngine.find(`${this.constructor.SELECTOR_SUBMENU} ${this.constructor.SELECTOR_MENU}.${CLASS_NAME_SHOW$11}`, submenu);
			for (const nested of nestedSubmenus) {
				const nestedWrapper = nested.closest(this.constructor.SELECTOR_SUBMENU);
				this._closeSubmenu(nested, nestedWrapper);
			}
			const trigger = SelectorEngine.findOne(this.constructor.SELECTOR_SUBMENU_TOGGLE, submenuWrapper);
			const cleanup = this._openSubmenus.get(submenu);
			if (cleanup) cleanup();
			this._openSubmenus.delete(submenu);
			if (trigger) trigger.setAttribute("aria-expanded", "false");
			submenu.classList.remove(CLASS_NAME_SHOW$11);
			submenuWrapper.classList.remove(CLASS_NAME_SHOW$11);
			submenu.style.opacity = "";
		}
		_closeAllSubmenus() {
			for (const [submenu] of this._openSubmenus) {
				const submenuWrapper = submenu.closest(this.constructor.SELECTOR_SUBMENU);
				this._closeSubmenu(submenu, submenuWrapper);
			}
		}
		_closeSiblingSubmenus(currentSubmenuWrapper) {
			const parent = currentSubmenuWrapper.parentNode;
			const siblingSubmenus = SelectorEngine.find(`${this.constructor.SELECTOR_SUBMENU} > ${this.constructor.SELECTOR_MENU}.${CLASS_NAME_SHOW$11}`, parent);
			for (const siblingMenu of siblingSubmenus) {
				const siblingWrapper = siblingMenu.closest(this.constructor.SELECTOR_SUBMENU);
				if (siblingWrapper !== currentSubmenuWrapper) this._closeSubmenu(siblingMenu, siblingWrapper);
			}
		}
		_createSubmenuFloating(trigger, submenu, submenuWrapper) {
			const referenceElement = submenuWrapper;
			const placement = this._resolveLogicalPlacement(SUBMENU_PLACEMENT, trigger);
			const middleware = [
				(0, _floating_ui_dom.offset)({
					mainAxis: 0,
					crossAxis: -4
				}),
				(0, _floating_ui_dom.flip)({ fallbackPlacements: [
					this._resolveLogicalPlacement("start-start", trigger),
					this._resolveLogicalPlacement("end-end", trigger),
					this._resolveLogicalPlacement("start-end", trigger)
				] }),
				(0, _floating_ui_dom.shift)({ padding: 8 })
			];
			const updatePosition = () => this._applyFloatingPosition(referenceElement, submenu, placement, middleware).then((finalPlacement) => {
				submenu.style.opacity = "";
				return finalPlacement;
			});
			updatePosition();
			return (0, _floating_ui_dom.autoUpdate)(referenceElement, submenu, updatePosition);
		}
		_scheduleSubmenuClose(submenu, submenuWrapper) {
			this._cancelSubmenuCloseTimeout(submenu);
			const timeoutId = setTimeout(() => {
				this._closeSubmenu(submenu, submenuWrapper);
				this._submenuCloseTimeouts.delete(submenu);
			}, this._config.submenuDelay);
			this._submenuCloseTimeouts.set(submenu, timeoutId);
		}
		_cancelSubmenuCloseTimeout(submenu) {
			const timeoutId = this._submenuCloseTimeouts.get(submenu);
			if (timeoutId) {
				clearTimeout(timeoutId);
				this._submenuCloseTimeouts.delete(submenu);
			}
		}
		_clearAllSubmenuTimeouts() {
			for (const timeoutId of this._submenuCloseTimeouts.values()) clearTimeout(timeoutId);
			this._submenuCloseTimeouts.clear();
		}
		_trackMousePosition(event) {
			this._hoverIntentData = {
				x: event.clientX,
				y: event.clientY,
				timestamp: Date.now()
			};
		}
		_isMovingTowardSubmenu(event, submenu) {
			if (!this._hoverIntentData) return false;
			const submenuRect = submenu.getBoundingClientRect();
			const currentPos = {
				x: event.clientX,
				y: event.clientY
			};
			const lastPos = {
				x: this._hoverIntentData.x,
				y: this._hoverIntentData.y
			};
			const targetX = isRTL(submenu) ? submenuRect.right : submenuRect.left;
			const topCorner = {
				x: targetX,
				y: submenuRect.top
			};
			const bottomCorner = {
				x: targetX,
				y: submenuRect.bottom
			};
			return this._pointInTriangle(currentPos, lastPos, topCorner, bottomCorner);
		}
		_pointInTriangle(point, v1, v2, v3) {
			const d1 = triangleSign(point, v1, v2);
			const d2 = triangleSign(point, v2, v3);
			const d3 = triangleSign(point, v3, v1);
			return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
		}
		_getItemsInMenu(menu) {
			return SelectorEngine.find(`:scope > ${this.constructor.SELECTOR_VISIBLE_ITEMS}, :scope > ${this.constructor.SELECTOR_SUBMENU} > ${this.constructor.SELECTOR_VISIBLE_ITEMS}`, menu).filter((element) => isVisible(element));
		}
		_selectMenuItem({ key, target }) {
			const currentMenu = target.closest(this.constructor.SELECTOR_MENU) || this._menu;
			const items = this._getItemsInMenu(currentMenu);
			if (!items.length) return;
			const nextItem = getNextActiveElement(items, target, key === ARROW_DOWN_KEY$6, !items.includes(target));
			nextItem.focus();
			this._closeUnrelatedSubmenus(currentMenu, nextItem);
		}
		_closeUnrelatedSubmenus(currentMenu, focusedElement) {
			for (const [submenu] of this._openSubmenus) {
				const submenuWrapper = submenu.closest(this.constructor.SELECTOR_SUBMENU);
				if (!submenuWrapper || submenuWrapper.parentElement !== currentMenu || submenuWrapper.contains(focusedElement)) continue;
				this._closeSubmenu(submenu, submenuWrapper);
			}
		}
		_handleSubmenuKeydown(event) {
			const { key, target } = event;
			const isRtl = isRTL(target);
			const enterKey = isRtl ? ARROW_LEFT_KEY$8 : ARROW_RIGHT_KEY$8;
			const exitKey = isRtl ? ARROW_RIGHT_KEY$8 : ARROW_LEFT_KEY$8;
			const submenuWrapper = target.closest(this.constructor.SELECTOR_SUBMENU);
			const isSubmenuToggle = target.matches(this.constructor.SELECTOR_SUBMENU_TOGGLE);
			if ((key === ENTER_KEY$2 || key === SPACE_KEY$1) && submenuWrapper && isSubmenuToggle) {
				event.preventDefault();
				event.stopPropagation();
				const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper);
				if (submenu) {
					this._closeSiblingSubmenus(submenuWrapper);
					this._openSubmenu(target, submenu, submenuWrapper);
					requestAnimationFrame(() => {
						const firstItem = SelectorEngine.findOne(this.constructor.SELECTOR_VISIBLE_ITEMS, submenu);
						if (firstItem) firstItem.focus();
					});
				}
				return true;
			}
			if (key === enterKey && submenuWrapper && isSubmenuToggle) {
				event.preventDefault();
				event.stopPropagation();
				const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper);
				if (submenu) {
					this._closeSiblingSubmenus(submenuWrapper);
					this._openSubmenu(target, submenu, submenuWrapper);
					requestAnimationFrame(() => {
						const firstItem = SelectorEngine.findOne(this.constructor.SELECTOR_VISIBLE_ITEMS, submenu);
						if (firstItem) firstItem.focus();
					});
				}
				return true;
			}
			if (key === exitKey) {
				const currentMenu = target.closest(this.constructor.SELECTOR_MENU);
				const parentSubmenuWrapper = currentMenu?.closest(this.constructor.SELECTOR_SUBMENU);
				if (parentSubmenuWrapper) {
					event.preventDefault();
					event.stopPropagation();
					const parentTrigger = SelectorEngine.findOne(this.constructor.SELECTOR_SUBMENU_TOGGLE, parentSubmenuWrapper);
					this._closeSubmenu(currentMenu, parentSubmenuWrapper);
					if (parentTrigger) parentTrigger.focus();
					return true;
				}
			}
			if (key === HOME_KEY$4 || key === END_KEY$4) {
				event.preventDefault();
				event.stopPropagation();
				const currentMenu = target.closest(this.constructor.SELECTOR_MENU);
				const items = this._getItemsInMenu(currentMenu);
				if (items.length) {
					const targetItem = key === HOME_KEY$4 ? items[0] : items.at(-1);
					targetItem.focus();
					this._closeUnrelatedSubmenus(currentMenu, targetItem);
				}
				return true;
			}
			return false;
		}
		static clearMenus(event) {
			if (event.type === "click" && event.button === RIGHT_MOUSE_BUTTON$1 || event.type === "keyup" && event.key !== TAB_KEY$1) return;
			for (const instance of Menu._openInstances) {
				if (instance._config.autoClose === false) continue;
				const composedPath = event.composedPath();
				const isMenuTarget = composedPath.includes(instance._menu);
				if (instance._isToggleTarget(composedPath) || instance._config.autoClose === "inside" && !isMenuTarget || instance._config.autoClose === "outside" && isMenuTarget) continue;
				const formAncestor = event.target.closest?.("form");
				const isInsideMenuForm = Boolean(formAncestor) && instance._menu.contains(formAncestor);
				if (instance._menu.contains(event.target) && (event.type === "keyup" && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName) || isInsideMenuForm)) continue;
				const relatedTarget = { relatedTarget: instance._element };
				if (event.type === "click") relatedTarget.clickEvent = event;
				instance._completeHide(relatedTarget);
			}
		}
		static dataApiKeydownHandler(event) {
			const delegateTarget = event.delegateTarget;
			const isInput = /input|textarea/i.test(event.target.tagName) || event.target.isContentEditable;
			const isEscapeEvent = event.key === ESCAPE_KEY$2;
			const isUpOrDownEvent = [ARROW_UP_KEY$5, ARROW_DOWN_KEY$6].includes(event.key);
			const isLeftOrRightEvent = [ARROW_LEFT_KEY$8, ARROW_RIGHT_KEY$8].includes(event.key);
			const isHomeOrEndEvent = [HOME_KEY$4, END_KEY$4].includes(event.key);
			const isEnterOrSpaceEvent = [ENTER_KEY$2, SPACE_KEY$1].includes(event.key);
			const isSubmenuTrigger = event.target.matches(this.SELECTOR_SUBMENU_TOGGLE);
			if (!isUpOrDownEvent && !isEscapeEvent && !isLeftOrRightEvent && !isHomeOrEndEvent && !(isEnterOrSpaceEvent && isSubmenuTrigger)) return;
			if (isInput && !isEscapeEvent) return;
			const instance = this._getKeyboardInstance(delegateTarget);
			if (!instance) return;
			if ((isLeftOrRightEvent || isHomeOrEndEvent || isEnterOrSpaceEvent && isSubmenuTrigger) && instance._handleSubmenuKeydown(event)) return;
			if (isUpOrDownEvent) {
				event.preventDefault();
				event.stopPropagation();
				instance.show();
				instance._selectMenuItem(event);
				return;
			}
			if (isEscapeEvent && instance._isShown()) {
				event.preventDefault();
				event.stopPropagation();
				const currentMenu = event.target.closest(this.SELECTOR_MENU);
				const parentSubmenuWrapper = currentMenu?.closest(this.SELECTOR_SUBMENU);
				if (parentSubmenuWrapper && instance._openSubmenus.size > 0) {
					const parentTrigger = SelectorEngine.findOne(this.SELECTOR_SUBMENU_TOGGLE, parentSubmenuWrapper);
					instance._closeSubmenu(currentMenu, parentSubmenuWrapper);
					if (parentTrigger) parentTrigger.focus();
					return;
				}
				instance.hide();
				instance._element.focus();
			}
		}
		static _getKeyboardInstance(delegateTarget) {
			for (const instance of Menu._openInstances) if (instance._menu.contains(delegateTarget)) return instance;
			const toggle = delegateTarget.matches(this.SELECTOR_DATA_TOGGLE) ? delegateTarget : SelectorEngine.prev(delegateTarget, this.SELECTOR_DATA_TOGGLE)[0] || SelectorEngine.next(delegateTarget, this.SELECTOR_DATA_TOGGLE)[0] || SelectorEngine.findOne(this.SELECTOR_DATA_TOGGLE, delegateTarget.parentNode ?? void 0);
			return toggle ? this.getOrCreateInstance(toggle) : null;
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Menu, config);
		}
	};
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API$3, Menu.SELECTOR_DATA_TOGGLE, (event) => Menu.dataApiKeydownHandler(event));
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API$3, Menu.SELECTOR_MENU, (event) => Menu.dataApiKeydownHandler(event));
	EventHandler.on(document, EVENT_CLICK_DATA_API$12, Menu.clearMenus);
	EventHandler.on(document, EVENT_KEYUP_DATA_API$2, Menu.clearMenus);
	EventHandler.on(document, EVENT_CLICK_DATA_API$12, Menu.SELECTOR_DATA_TOGGLE, function(event) {
		event.preventDefault();
		Menu.getOrCreateInstance(this).toggle();
	});
	defineJQueryPlugin(Menu);
	//#endregion
	//#region js/src/context-menu.ts
	const NAME$38 = "context-menu";
	const EVENT_KEY$29 = `.coreui.context-menu`;
	const DATA_API_KEY$23 = ".data-api";
	const CONTEXT_MENU_KEY = "ContextMenu";
	const F10_KEY = "F10";
	const EVENT_CONTEXTMENU_DATA_API = `contextmenu${EVENT_KEY$29}${DATA_API_KEY$23}`;
	const EVENT_KEYDOWN_DATA_API$2 = `keydown${EVENT_KEY$29}${DATA_API_KEY$23}`;
	const SCROLL_EVENTS = [
		"wheel",
		"touchmove",
		"keydown"
	];
	const SCROLL_KEYS = /* @__PURE__ */ new Set([
		" ",
		"PageUp",
		"PageDown"
	]);
	const CLASS_NAME_SHOW$10 = "show";
	const SELECTOR_DATA_TOGGLE$10 = "[data-coreui-toggle=\"context-menu\"]";
	const Default$33 = {
		...Menu.Default,
		reference: "pointer",
		strategy: "fixed"
	};
	const DefaultType$32 = { ...Menu.DefaultType };
	var ContextMenu = class ContextMenu extends Menu {
		constructor(element, config) {
			super(element, config);
			this._point = null;
			this._scrollBlocker = null;
			if (this._menu && !this._menu.hasAttribute("tabindex")) this._menu.setAttribute("tabindex", "-1");
		}
		static get SELECTOR_DATA_TOGGLE() {
			return SELECTOR_DATA_TOGGLE$10;
		}
		static get Default() {
			return Default$33;
		}
		static get DefaultType() {
			return DefaultType$32;
		}
		static get NAME() {
			return NAME$38;
		}
		toggle(point) {
			return this._isShown() ? this.hide() : this.show(point);
		}
		async show(point) {
			this._show(point, { relatedTarget: this._element });
		}
		dispose() {
			this._unlockScroll();
			super.dispose();
		}
		_show(point, relatedTarget) {
			if (isDisabled(this._element) || this._isShown()) return;
			if (EventHandler.trigger(this._element, this.constructor.eventName("show"), relatedTarget).defaultPrevented) return;
			this._point = point ?? null;
			this._moveMenuToContainer();
			this._createFloating();
			this._lockScroll();
			if ("ontouchstart" in document.documentElement) for (const element of document.body.children) EventHandler.on(element, "mouseover", noop);
			this._menu.classList.add(CLASS_NAME_SHOW$10);
			this._menu.focus({ preventScroll: true });
			Menu._openInstances.add(this);
			EventHandler.trigger(this._element, this.constructor.eventName("shown"), relatedTarget);
		}
		_completeHide(relatedTarget) {
			if (EventHandler.trigger(this._element, this.constructor.eventName("hide"), relatedTarget).defaultPrevented) return;
			this._closeAllSubmenus();
			if ("ontouchstart" in document.documentElement) for (const element of document.body.children) EventHandler.off(element, "mouseover", noop);
			const hadFocus = containsFocus(this._menu);
			this._unlockScroll();
			this._disposeFloating();
			this._restoreMenuToOriginalParent();
			this._menu.classList.remove(CLASS_NAME_SHOW$10);
			this._removeMenuAttributes();
			this._point = null;
			if (hadFocus) this._element.focus({ preventScroll: true });
			Menu._openInstances.delete(this);
			EventHandler.trigger(this._element, this.constructor.eventName("hidden"), relatedTarget);
		}
		_isToggleTarget() {
			return false;
		}
		_lockScroll() {
			if (this._scrollBlocker) return;
			this._scrollBlocker = (event) => {
				if (event.type === "keydown" && !SCROLL_KEYS.has(event.key)) return;
				if (!this._menu.contains(event.target) || event.type === "keydown" && event.target === this._menu) event.preventDefault();
			};
			for (const type of SCROLL_EVENTS) document.addEventListener(type, this._scrollBlocker, { passive: false });
		}
		_unlockScroll() {
			if (!this._scrollBlocker) return;
			for (const type of SCROLL_EVENTS) document.removeEventListener(type, this._scrollBlocker);
			this._scrollBlocker = null;
		}
		_findMenu() {
			return SelectorEngine.getElementFromSelector(this._element) || super._findMenu();
		}
		_getReferenceElement() {
			if (this._config.reference !== "pointer") return super._getReferenceElement();
			if (!this._point) return this._element;
			const { x, y } = this._point;
			return {
				getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
				contextElement: this._element
			};
		}
		static dataApiContextMenuHandler(event) {
			const target = event.target;
			for (const instance of Menu._openInstances) if (instance instanceof ContextMenu && instance._menu.contains(target)) {
				event.preventDefault();
				return;
			}
			const toggle = target.closest(SELECTOR_DATA_TOGGLE$10);
			if (!toggle || isDisabled(toggle)) {
				ContextMenu._clearContextMenus();
				return;
			}
			event.preventDefault();
			const instance = ContextMenu.getOrCreateInstance(toggle);
			if (instance._isShown()) instance.hide();
			Menu.clearMenus(event);
			const point = event.clientX || event.clientY ? {
				x: event.clientX,
				y: event.clientY
			} : void 0;
			instance._show(point, {
				relatedTarget: toggle,
				contextmenuEvent: event
			});
		}
		static _clearContextMenus() {
			for (const instance of Menu._openInstances) if (instance instanceof ContextMenu && instance._config.autoClose !== false && instance._config.autoClose !== "inside") instance._completeHide({ relatedTarget: instance._element });
		}
		static dataApiKeydownHandler(event) {
			if (event.key !== CONTEXT_MENU_KEY && !(event.key === F10_KEY && event.shiftKey)) return;
			if (isDisabled(this)) return;
			event.preventDefault();
			event.stopPropagation();
			const instance = ContextMenu.getOrCreateInstance(this);
			if (instance._isShown()) instance.hide();
			Menu.clearMenus(event);
			instance._show(void 0, { relatedTarget: this });
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, ContextMenu, config, args);
		}
	};
	EventHandler.on(document, EVENT_CONTEXTMENU_DATA_API, ContextMenu.dataApiContextMenuHandler);
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API$2, SELECTOR_DATA_TOGGLE$10, ContextMenu.dataApiKeydownHandler);
	defineJQueryPlugin(ContextMenu);
	//#endregion
	//#region js/src/util/time.ts
	const convert12hTo24h = (abbr, hour) => {
		if (abbr === "am" && hour === 12) return 0;
		if (abbr === "am") return hour;
		if (abbr === "pm" && hour === 12) return 12;
		return hour + 12;
	};
	const convert24hTo12h = (hour) => hour % 12 || 12;
	const formatTimePartials = (values, locale, partial, hour12) => {
		const date = new Date(2020, 0, 1);
		const forceTwoDigit = shouldUseTwoDigitHour(locale);
		const hourCycle = hour12 === void 0 ? void 0 : hour12 ? "h12" : "h23";
		const formatter = new Intl.DateTimeFormat(locale, {
			hour: forceTwoDigit ? "2-digit" : "numeric",
			minute: "2-digit",
			second: "2-digit",
			hourCycle
		});
		return values.map((value) => {
			if (partial === "hour") date.setHours(value);
			if (partial === "minute") date.setMinutes(value);
			if (partial === "second") date.setSeconds(value);
			return {
				value,
				label: formatter.formatToParts(date).find((part) => part.type === partial)?.value || ""
			};
		});
	};
	const getLocalizedTimePartials = (locale, ampm = "auto", hours = [], minutes = [], seconds = []) => {
		const hour12 = ampm === "auto" && isAmPm(locale) || ampm === true;
		const cycle = Array.from({ length: 24 }, (_, i) => hour12 ? (i + 1) % 24 : i);
		const allowedHours = Array.isArray(hours) && hours.length > 0 ? new Set(hours) : cycle.filter((hour) => typeof hours !== "function" || hours(hour));
		const hourValues = /* @__PURE__ */ new Map();
		for (const hour of allowedHours) {
			const value = hour12 ? convert24hTo12h(hour) : hour;
			hourValues.set(value, [...hourValues.get(value) ?? [], hour]);
		}
		const listOfMinutes = Array.isArray(minutes) && minutes.length > 0 ? minutes : typeof minutes === "function" ? Array.from({ length: 60 }, (_, i) => i).filter((minute) => minutes(minute)) : Array.from({ length: 60 }, (_, i) => i);
		const listOfSeconds = Array.isArray(seconds) && seconds.length > 0 ? seconds : typeof seconds === "function" ? Array.from({ length: 60 }, (_, i) => i).filter((second) => seconds(second)) : Array.from({ length: 60 }, (_, i) => i);
		return {
			listOfHours: formatTimePartials([...hourValues.keys()], locale, "hour", hour12).map((partial) => ({
				...partial,
				hours: hourValues.get(partial.value)
			})),
			listOfMinutes: formatTimePartials(listOfMinutes, locale, "minute"),
			listOfSeconds: formatTimePartials(listOfSeconds, locale, "second"),
			hour12
		};
	};
	const getSelectedHour = (date, locale, ampm = "auto") => date ? ampm === "auto" && isAmPm(locale) || ampm === true ? convert24hTo12h(date.getHours()) : date.getHours() : "";
	const getSelectedMinutes = (date) => date ? date.getMinutes() : "";
	const getSelectedSeconds = (date) => date ? date.getSeconds() : "";
	const isAmPm = (locale) => [
		"am",
		"AM",
		"pm",
		"PM"
	].some((el) => (/* @__PURE__ */ new Date()).toLocaleString(locale).includes(el));
	const isTimeOutsideLimits = (date, part, value, { max, min }, offered = []) => {
		const start = new Date(date);
		const end = new Date(date);
		if (part === "meridiem") {
			start.setHours(value === "pm" ? 12 : 0, 0, 0, 0);
			end.setHours(value === "pm" ? 23 : 11, 59, 59, 999);
		}
		if (part === "hours") {
			start.setHours(Number(value), 0, 0, 0);
			end.setHours(Number(value), 59, 59, 999);
		}
		if (part === "minutes") {
			start.setMinutes(Number(value), 0, 0);
			end.setMinutes(Number(value), 59, 999);
		}
		if (part === "seconds") {
			start.setSeconds(Number(value), 0);
			end.setSeconds(Number(value), 999);
		}
		if (offered.length > 0 && (part === "hours" || part === "minutes")) return offered.every((inner) => isTimeOutsideLimits(start, part === "hours" ? "minutes" : "seconds", inner, {
			max,
			min
		}));
		return Boolean(min && end < min || max && start > max);
	};
	const shouldUseTwoDigitHour = (locale) => {
		return new Date(2020, 0, 1, 7, 5, 7).toLocaleTimeString(locale).startsWith("0");
	};
	//#endregion
	//#region js/src/util/date-sections.ts
	const isEditableSection = (section) => section.type !== "literal";
	const TOKEN_TYPES = {
		d: "day",
		D: "day",
		w: "week",
		M: "month",
		q: "quarter",
		Q: "quarter",
		y: "year",
		Y: "year",
		H: "hour",
		h: "hour",
		m: "minute",
		s: "second",
		A: "meridiem",
		a: "meridiem"
	};
	const QUARTER_NAMES = [
		"Q1",
		"Q2",
		"Q3",
		"Q4"
	];
	const getFormatMonthNames = (locale, width) => {
		const formatter = new Intl.DateTimeFormat(locale, {
			calendar: "gregory",
			year: "numeric",
			month: width,
			day: "numeric"
		});
		return Array.from({ length: 12 }, (_, index) => formatter.formatToParts(new Date(2e3, index, 15)).find((part) => part.type === "month").value);
	};
	const getDayPeriodNames = (locale) => {
		const formatter = new Intl.DateTimeFormat(locale, {
			hour: "numeric",
			hour12: true
		});
		return [new Date(2e3, 0, 1, 9), new Date(2e3, 0, 1, 21)].map((date) => {
			const part = formatter.formatToParts(date).find(({ type }) => type === "dayPeriod");
			return part ? part.value : date.getHours() < 12 ? "AM" : "PM";
		});
	};
	const createSection = (char, tokenLength, locale = "default", monthNames = null) => {
		const type = TOKEN_TYPES[char];
		if (type === "year") return {
			type,
			length: tokenLength <= 2 ? 2 : 4,
			padded: true,
			value: null
		};
		if (type === "month" && tokenLength >= 3) return {
			type,
			length: 2,
			padded: true,
			value: null,
			names: monthNames || getFormatMonthNames(locale, tokenLength === 3 ? "short" : "long"),
			placeholder: "M".repeat(tokenLength)
		};
		if (type === "hour") return {
			type,
			length: 2,
			cycle: char === "H" ? "h23" : "h12",
			padded: tokenLength > 1,
			value: null,
			placeholder: char.repeat(2)
		};
		if (type === "minute" || type === "second") return {
			type,
			length: 2,
			padded: tokenLength > 1,
			value: null,
			placeholder: char.repeat(2)
		};
		if (type === "meridiem") return {
			type,
			length: 2,
			padded: true,
			value: null,
			names: getDayPeriodNames(locale),
			placeholder: char === "a" ? "am" : "AM"
		};
		if (type === "quarter") {
			if (tokenLength >= 3) return {
				type,
				length: 1,
				padded: false,
				value: null,
				names: QUARTER_NAMES,
				placeholder: "Q".repeat(tokenLength)
			};
			return {
				type,
				length: 1,
				padded: tokenLength > 1,
				value: null
			};
		}
		return {
			type,
			length: 2,
			padded: tokenLength > 1,
			value: null
		};
	};
	const getSectionBounds = (section) => {
		switch (section.type) {
			case "day": return {
				min: 1,
				max: 31
			};
			case "week": return {
				min: 1,
				max: 53
			};
			case "month": return {
				min: 1,
				max: 12
			};
			case "quarter": return {
				min: 1,
				max: 4
			};
			case "hour": return section.cycle === "h12" ? {
				min: 1,
				max: 12
			} : {
				min: 0,
				max: 23
			};
			case "minute":
			case "second": return {
				min: 0,
				max: 59
			};
			case "meridiem": return {
				min: 1,
				max: 2
			};
			default: return {
				min: section.length === 2 ? 0 : 1,
				max: 9999
			};
		}
	};
	const getSectionsFromFormat = (format, locale = "default", monthNames = null) => {
		const sections = [];
		let literal = "";
		let index = 0;
		while (index < format.length) {
			const char = format[index];
			if (char === "'") {
				if (format[index + 1] === "'") {
					literal += "'";
					index += 2;
					continue;
				}
				index++;
				while (index < format.length) {
					if (format[index] === "'" && format[index + 1] !== "'") {
						index++;
						break;
					}
					literal += format[index];
					index += format[index] === "'" ? 2 : 1;
				}
				continue;
			}
			if (TOKEN_TYPES[char]) {
				if (literal) {
					sections.push({
						type: "literal",
						value: literal
					});
					literal = "";
				}
				let length = 1;
				while (index + length < format.length && format[index + length] === char) length++;
				sections.push(createSection(char, length, locale, monthNames));
				index += length;
				continue;
			}
			literal += char;
			index++;
		}
		if (literal) sections.push({
			type: "literal",
			value: literal
		});
		return sections;
	};
	const PART_TOKENS = {
		year: "y",
		month: "M",
		day: "d",
		minute: "m",
		second: "s",
		dayPeriod: "A"
	};
	const getSectionsFromParts = (formatter, locale) => {
		const { hourCycle } = formatter.resolvedOptions();
		const hourChar = hourCycle === "h11" || hourCycle === "h12" ? "h" : "H";
		const sections = [];
		for (const part of formatter.formatToParts(new Date(2018, 11, 24, 15, 45, 35))) {
			const char = part.type === "hour" ? hourChar : PART_TOKENS[part.type];
			if (char) {
				sections.push(createSection(char, part.type === "year" ? 4 : 2, locale));
				continue;
			}
			const previous = sections[sections.length - 1];
			if (previous && previous.type === "literal") {
				previous.value += part.value;
				continue;
			}
			sections.push({
				type: "literal",
				value: part.value
			});
		}
		return sections;
	};
	const getSectionsFromLocale = (locale) => getSectionsFromParts(new Intl.DateTimeFormat(locale, {
		calendar: "gregory",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}), locale);
	const getWeekSectionsFromLocale = (locale) => getSectionsFromFormat(`'${getWeekLabel(locale).replaceAll("'", "''")}' ww, yyyy`, locale);
	const getTimeSectionsFromLocale = (locale, seconds = false) => getSectionsFromParts(new Intl.DateTimeFormat(locale, {
		hour: "2-digit",
		minute: "2-digit",
		second: seconds ? "2-digit" : void 0
	}), locale);
	const getDateTimeSectionsFromLocale = (locale, seconds = false) => getSectionsFromParts(new Intl.DateTimeFormat(locale, {
		calendar: "gregory",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: seconds ? "2-digit" : void 0
	}), locale);
	const FORMAT_BY_SELECTION_TYPE = {
		month: "MM/yyyy",
		quarter: "QQQ yyyy",
		week: getWeekSectionsFromLocale,
		year: "yyyy"
	};
	const getPickerFormat = (format, selectionType = "day") => format || FORMAT_BY_SELECTION_TYPE[selectionType] || null;
	const getSectionLayout = (format, locale, monthNames = null, includeTime = false) => {
		if (typeof format === "function") return format(locale);
		if (format) return getSectionsFromFormat(format, locale, monthNames);
		return includeTime ? getDateTimeSectionsFromLocale(locale, typeof includeTime === "object" ? includeTime.seconds : true) : getSectionsFromLocale(locale);
	};
	const getHourCycle = (layout) => layout.find((section) => section.type === "hour")?.cycle;
	const isTypedKey = (event) => event.key?.length === 1 && !hasShortcutModifier(event);
	const applyDigitToSection = (section, draft, digit, max = getSectionBounds(section).max) => {
		const typed = Number.parseInt(digit, 10);
		if (typed > max || max < 10 && typed < getSectionBounds(section).min) return null;
		const length = section.type === "year" ? section.length : 2;
		let next = `${/^\d+$/.test(draft) ? draft : ""}${digit}`.slice(-length);
		if (Number.parseInt(next, 10) > max) next = digit;
		const value = Number.parseInt(next, 10);
		return {
			draft: next,
			value,
			completed: next.length >= length || value * 10 > max
		};
	};
	const applyLetterToSection = (section, draft, letter) => {
		if (!section.names) return null;
		const names = section.names.map((name) => name.toLowerCase());
		let next = `${draft || ""}${letter}`.toLowerCase();
		let matches = names.filter((name) => name.startsWith(next));
		if (matches.length === 0) {
			next = letter.toLowerCase();
			matches = names.filter((name) => name.startsWith(next));
		}
		if (matches.length === 0) return null;
		return {
			draft: next,
			value: names.indexOf(matches[0]) + 1,
			completed: matches.length === 1
		};
	};
	const getIncrementedSectionValue = (section, delta, max = getSectionBounds(section).max) => {
		const { min } = getSectionBounds(section);
		if (section.value === null) {
			if (section.type === "year") return (/* @__PURE__ */ new Date()).getFullYear();
			return delta > 0 ? min : max;
		}
		if (section.type === "year") return Math.min(Math.max(section.value + delta, min), max);
		const range = max - min + 1;
		return ((section.value - min + delta) % range + range) % range + min;
	};
	const getDaysInMonth = (year, month) => {
		return createDate(year, month, 0).getDate();
	};
	const getISOWeeksInYear = (year) => {
		return getISOWeekNumberAndYear(createDate(year, 11, 28)).weekNumber;
	};
	const getWeekSectionMax = (sections) => {
		const yearSection = sections.find((section) => section.type === "year");
		const year = yearSection && isEditableSection(yearSection) ? getFullYearFromSection(yearSection) : null;
		if (year === null) return getSectionBounds({ type: "week" }).max;
		return getISOWeeksInYear(year);
	};
	const getDaySectionMax = (sections) => {
		let month = null;
		let year = null;
		for (const section of sections) {
			if (section.type === "month") month = section.value;
			if (section.type === "year") year = getFullYearFromSection(section);
		}
		if (month === null) return getSectionBounds({ type: "day" }).max;
		return getDaysInMonth(year === null ? 2e3 : year, month);
	};
	const getFullYearFromSection = (section) => {
		if (section.value === null) return null;
		if (section.length === 2 && section.value < 100) return parseYearSmart(String(section.value).padStart(2, "0"));
		return section.value;
	};
	const isBeforeYearOne = (sections) => {
		const editable = sections.filter(isEditableSection);
		const year = editable.find((section) => section.type === "year");
		return year !== void 0 && (getFullYearFromSection(year) ?? 1) < 1 && editable.every((section) => section === year || section.value !== null && section.value >= getSectionBounds(section).min);
	};
	const getDateFromSections = (sections) => {
		const values = {};
		let hourCycle = null;
		for (const section of sections) {
			if (section.type === "literal") continue;
			if (section.value === null || section.value < getSectionBounds(section).min) return null;
			values[section.type] = section.type === "year" ? getFullYearFromSection(section) : section.value;
			if (section.type === "hour") hourCycle = section.cycle;
		}
		const year = values.year === void 0 ? 1970 : values.year;
		const month = values.month === void 0 ? values.quarter === void 0 ? 1 : (values.quarter - 1) * 3 + 1 : values.month;
		const day = values.day === void 0 ? 1 : values.day;
		let hour = values.hour === void 0 ? 0 : values.hour;
		if (hourCycle === "h12") hour = convert12hTo24h(values.meridiem === 2 ? "pm" : "am", hour);
		const date = values.week === void 0 ? createDate(year, month - 1, Math.min(day, getDaysInMonth(year, month))) : getDateOfISOWeek(year, Math.min(values.week, getISOWeeksInYear(year)));
		date.setHours(hour, values.minute === void 0 ? 0 : values.minute, values.second === void 0 ? 0 : values.second, 0);
		return date;
	};
	const setSectionsFromDate = (sections, date) => {
		const weekInfo = date && sections.some((section) => section.type === "week") ? getISOWeekNumberAndYear(date) : null;
		return sections.map((section) => {
			if (section.type === "literal") return section;
			if (!date) return {
				...section,
				value: null
			};
			switch (section.type) {
				case "day": return {
					...section,
					value: date.getDate()
				};
				case "week": return {
					...section,
					value: weekInfo.weekNumber
				};
				case "month": return {
					...section,
					value: date.getMonth() + 1
				};
				case "quarter": return {
					...section,
					value: Math.floor(date.getMonth() / 3) + 1
				};
				case "hour": return {
					...section,
					value: section.cycle === "h12" ? convert24hTo12h(date.getHours()) : date.getHours()
				};
				case "minute": return {
					...section,
					value: date.getMinutes()
				};
				case "second": return {
					...section,
					value: date.getSeconds()
				};
				case "meridiem": return {
					...section,
					value: date.getHours() >= 12 ? 2 : 1
				};
				default: return {
					...section,
					value: weekInfo ? weekInfo.year : date.getFullYear()
				};
			}
		});
	};
	const formatSectionValue = (section, placeholder = "") => {
		if (section.value === null) return placeholder;
		if (section.names) return section.names[section.value - 1];
		const value = section.type === "year" && section.length === 2 ? section.value % 100 : section.value;
		return section.padded === false ? String(value) : String(value).padStart(section.length, "0");
	};
	const getSectionValueText = (section, locale) => {
		if (section.value === null) return "Empty";
		if (section.names) return section.names[section.value - 1];
		if (section.type === "month" && section.value > 0) return new Intl.DateTimeFormat(locale, {
			calendar: "gregory",
			month: "long"
		}).format(new Date(2e3, section.value - 1, 15));
		return String(section.type === "year" ? getFullYearFromSection(section) : section.value);
	};
	const formatSections = (sections) => sections.map((section) => section.type === "literal" ? section.value : formatSectionValue(section)).join("");
	const getSectionsFromString = (text, sections) => {
		let normalizedText = text;
		for (const section of sections) {
			if (!isEditableSection(section) || !section.names) continue;
			const match = section.names.toSorted((a, b) => b.length - a.length).find((name) => normalizedText.toLowerCase().includes(name.toLowerCase()));
			if (!match) continue;
			const index = normalizedText.toLowerCase().indexOf(match.toLowerCase());
			normalizedText = `${normalizedText.slice(0, index)} ${section.names.indexOf(match) + 1} ${normalizedText.slice(index + match.length)}`;
		}
		const digitGroups = normalizedText.match(/\d+/g);
		const editableCount = sections.filter((section) => section.type !== "literal").length;
		if (!digitGroups || digitGroups.length !== editableCount) return null;
		let groupIndex = 0;
		const next = [];
		for (const section of sections) {
			if (section.type === "literal") {
				next.push(section);
				continue;
			}
			const value = Number.parseInt(digitGroups[groupIndex++], 10);
			const { min, max } = getSectionBounds(section);
			if (Number.isNaN(value) || value < min || value > max) return null;
			next.push({
				...section,
				value
			});
		}
		return next;
	};
	const convertValue = (value, type, locale) => {
		if (value === null || value === void 0) return null;
		if (type === "time" && typeof value === "string") {
			const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(am|pm))?$/i.exec(value.trim());
			if (match) {
				const [, hour, minute, second, meridiem] = match;
				if (Number.parseInt(hour, 10) > (meridiem ? 12 : 23) || Number.parseInt(minute, 10) > 59 || Number.parseInt(second ?? "0", 10) > 59) return null;
				const hours = meridiem ? convert12hTo24h(meridiem.toLowerCase(), Number.parseInt(hour, 10)) : Number.parseInt(hour, 10);
				return new Date(1970, 0, 1, hours, Number.parseInt(minute, 10), second ? Number.parseInt(second, 10) : 0);
			}
		}
		if (type === "datetime") {
			const withTime = convertToDateObject(value, "day", locale, true);
			if (withTime) return withTime;
		}
		return convertToDateObject(value, "day", locale, type === "time");
	};
	const getDateWithin = (layout, date) => date && !Number.isNaN(date.getTime()) ? getDateFromSections(setSectionsFromDate(layout, date)) : null;
	const getLayoutPeriod = (layout) => {
		const types = new Set(layout.map((section) => section.type));
		if (types.has("day")) return null;
		if (types.has("week")) return "weeks";
		if (types.has("month")) return "months";
		if (types.has("quarter")) return "quarters";
		return types.has("year") ? "years" : null;
	};
	const getInclusiveMax = (maxDate) => maxDate && maxDate.getTime() === removeTimeFromDate(maxDate).getTime() ? new Date(new Date(maxDate).setHours(23, 59, 59, 999)) : maxDate;
	const constrainDateTime = (date, minDate, maxDate) => constrainDate(date, minDate, getInclusiveMax(maxDate));
	const getDateLimitError = (layout, date, minDate, maxDate, disabledDates) => {
		const period = getLayoutPeriod(layout);
		const timed = layout.some((section) => section.type === "hour");
		const timeOnly = timed && !period && !layout.some((section) => section.type === "day");
		const min = period || timed ? getDateWithin(layout, minDate) : minDate && removeTimeFromDate(minDate);
		const max = timed ? getInclusiveMax(timeOnly ? getDateWithin(layout, maxDate) : maxDate) : maxDate;
		if (min && date < min) return "minDate";
		if (max && date > max) return "maxDate";
		if (timeOnly ? isCellDisabled(date, "days", null, null, disabledDates) : isCellDisabled(date, period ?? "days", minDate, maxDate, disabledDates)) return "disabledDate";
		return null;
	};
	//#endregion
	//#region js/src/util/field-label.ts
	const SELECTOR_INTERACTIVE = "a[href], button, input, select, textarea, [tabindex]";
	const SELECTOR_LABEL = "label, .form-label";
	const fields = /* @__PURE__ */ new Map();
	const getLabelledElement = (label) => {
		const root = label.getRootNode();
		const forId = label.htmlFor;
		if (forId) {
			const target = [...root.querySelectorAll("[id]")].find((element) => element.id === forId);
			if (target) return target;
		}
		if (!label.id) return null;
		return [...root.querySelectorAll("[aria-labelledby]")].find((element) => element.getAttribute("aria-labelledby").split(/\s+/).includes(label.id)) ?? null;
	};
	const getFieldHandler = (element) => {
		const field = fields.has(element) ? element : [...element.querySelectorAll("*")].find((descendant) => fields.has(descendant));
		return field && fields.get(field);
	};
	const handleClick = (event) => {
		const target = event.composedPath()[0];
		if (event.defaultPrevented || event.detail > 1 || !(target instanceof Element)) return;
		const label = target.closest(SELECTOR_LABEL);
		if (!label || label.control) return;
		const interactive = target.closest(SELECTOR_INTERACTIVE);
		const selection = label.ownerDocument.getSelection();
		if (interactive && interactive !== label && label.contains(interactive) || selection && !selection.isCollapsed && label.contains(selection.anchorNode)) return;
		const element = getLabelledElement(label);
		if (element) getFieldHandler(element)?.();
	};
	const onLabelClick = (element, handler) => {
		const document = element.ownerDocument;
		fields.set(element, handler);
		document.addEventListener("click", handleClick);
		return () => {
			if (fields.get(element) === handler) fields.delete(element);
			if (![...fields.keys()].some((field) => field.ownerDocument === document)) document.removeEventListener("click", handleClick);
		};
	};
	//#endregion
	//#region js/src/date-input.ts
	const NAME$37 = "date-input";
	const EVENT_LOAD_DATA_API$16 = `load.coreui.date-input.data-api`;
	const ARROW_DOWN_KEY$5 = "ArrowDown";
	const ARROW_LEFT_KEY$7 = "ArrowLeft";
	const ARROW_RIGHT_KEY$7 = "ArrowRight";
	const ARROW_UP_KEY$4 = "ArrowUp";
	const BACKSPACE_KEY$2 = "Backspace";
	const DELETE_KEY$1 = "Delete";
	const INPUT_TYPE_KEYS = {
		deleteContentBackward: BACKSPACE_KEY$2,
		deleteContentForward: DELETE_KEY$1
	};
	const END_KEY$3 = "End";
	const HOME_KEY$3 = "Home";
	const CLASS_NAME_SECTION_INPUT = "form-date-time";
	const CLASS_NAME_ALL_SELECTED = "form-date-time-all-selected";
	const CLASS_NAME_DISABLED$5 = "disabled";
	const CLASS_NAME_FORM_CONTROL = "form-control";
	const CLASS_NAME_FILLED = "form-date-time-filled";
	const CLASS_NAME_SECTION = "form-date-time-section";
	const CLASS_NAME_SECTION_EMPTY = "form-date-time-section-empty";
	const CLASS_NAME_SEPARATOR$1 = "form-date-time-separator";
	const SELECTOR_DATA_DATE_INPUT = "[data-coreui-date-input]";
	const SELECTOR_SECTION$2 = ".form-date-time-section";
	const SELECTOR_VALUE_FIELD = "textarea";
	const ARIA_LABELS = {
		date: "Date input",
		datetime: "Date and time input",
		time: "Time input"
	};
	const Default$32 = {
		ariaDayLabel: "Day",
		ariaHourLabel: "Hour",
		ariaLabel: ARIA_LABELS.date,
		ariaMeridiemLabel: "AM/PM",
		ariaMinuteLabel: "Minute",
		ariaMonthLabel: "Month",
		ariaQuarterLabel: "Quarter",
		ariaSecondLabel: "Second",
		ariaWeekLabel: "Week",
		ariaYearLabel: "Year",
		autofocus: false,
		date: null,
		dayPlaceholder: null,
		disabled: false,
		disabledDates: null,
		format: null,
		hourPlaceholder: null,
		inputDateParse: null,
		locale: "default",
		maxDate: null,
		meridiemPlaceholder: null,
		minDate: null,
		minutePlaceholder: null,
		monthNames: null,
		monthPlaceholder: null,
		name: null,
		quarterPlaceholder: null,
		readonly: false,
		required: false,
		secondPlaceholder: null,
		seconds: false,
		type: "date",
		validationState: null,
		weekPlaceholder: null,
		yearPlaceholder: null
	};
	const DefaultType$31 = {
		ariaDayLabel: "string",
		ariaHourLabel: "string",
		ariaLabel: "string",
		ariaMeridiemLabel: "string",
		ariaMinuteLabel: "string",
		ariaMonthLabel: "string",
		ariaQuarterLabel: "string",
		ariaSecondLabel: "string",
		ariaWeekLabel: "string",
		ariaYearLabel: "string",
		autofocus: "boolean",
		date: "(date|number|string|null)",
		dayPlaceholder: "(string|null)",
		disabled: "boolean",
		disabledDates: "(array|date|function|null)",
		format: "(function|string|null)",
		hourPlaceholder: "(string|null)",
		inputDateParse: "(function|null)",
		locale: "string",
		maxDate: "(date|number|string|null)",
		meridiemPlaceholder: "(string|null)",
		minDate: "(date|number|string|null)",
		minutePlaceholder: "(string|null)",
		monthNames: "(array|null)",
		monthPlaceholder: "(string|null)",
		name: "(string|null)",
		quarterPlaceholder: "(string|null)",
		readonly: "boolean",
		required: "boolean",
		secondPlaceholder: "(string|null)",
		seconds: "boolean",
		type: "string",
		validationState: "(string|null|undefined)",
		weekPlaceholder: "(string|null)",
		yearPlaceholder: "(string|null)"
	};
	const DefaultPlaceholders = {
		day: "DD",
		week: "WW",
		month: "MM",
		quarter: "Q",
		year: "YYYY",
		hour: "HH",
		minute: "mm",
		second: "ss",
		meridiem: "AM"
	};
	var DateInput = class DateInput extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._applyConfig();
			this._date = getDateFromSections(this._sections);
			this._disabled = this._config.disabled;
			this._notifying = 0;
			this._reports = 0;
			this._allSelected = false;
			this._error = null;
			this._errorHolds = 0;
			this._fieldValue = "";
			this._inputElement = null;
			this._isBuilt = false;
			this._rejected = false;
			this._validationError = null;
			this._hostAriaLabel = this._element.getAttribute("aria-label");
			this._hostNodes = [...this._element.childNodes];
			this._validation = new FieldValidation(this._element, {
				canBlock: () => !this._disabled,
				config: () => this._config,
				fields: () => [this._inputElement],
				frames: () => [this._element],
				invalidTargets: () => this._getSectionElements(),
				ownError: () => this._rejected,
				pageDescribed: (isInvalid) => [this._element, ...this._getSectionElements().filter((_, index) => index === 0 || isInvalid)],
				restore: () => this.reset()
			});
			this._createSectionInput();
			this._initialDate = getDateFromSections(this._sections);
			this._applyValidationState();
			this._reportedDate = this._date;
			this._announceError();
			this._valueKey = this._getValueKey(this._sections);
			this._inputElement.defaultValue = this._getResetValue();
			this._isBuilt = true;
			this._addEventListeners();
			this._removeLabelClick = onLabelClick(this._element, () => this._focusFirstEmptySection());
			if (this._config.autofocus && !this._disabled) this._getSectionElements()[0]?.focus();
		}
		static get Default() {
			return Default$32;
		}
		static get DefaultType() {
			return DefaultType$31;
		}
		static get NAME() {
			return NAME$37;
		}
		static get CHANGE_EVENT_NAME() {
			return "dateChange";
		}
		clear() {
			this._draft = "";
			this._commitSections(setSectionsFromDate(this._sections, null));
		}
		reset() {
			this._draft = "";
			this._setAllSelected(false);
			this._commitSections(setSectionsFromDate(this._sections, this._initialDate));
		}
		getDate() {
			return this._date;
		}
		isDateSelectable(date) {
			const normalized = date instanceof Date ? getDateWithin(this._sections, date) : null;
			return normalized !== null && this._getValidationError(normalized, true) === null;
		}
		disable() {
			this._setDisabled(true);
		}
		enable() {
			this._setDisabled(false);
		}
		setDate(date, triggerChange = false) {
			this._typeCheckConfig({ date }, { date: this.constructor.DefaultType.date });
			this._draft = "";
			this._setAllSelected(false);
			this._commitSections(setSectionsFromDate(this._sections, date ? this._convertDate(date) : null), triggerChange);
		}
		setValidationState(validationState) {
			this._config = this._getConfig({
				...this._config,
				validationState
			});
			this._validation.configure({ validationState });
		}
		dispose() {
			if (!this._element) return;
			this._removeLabelClick();
			EventHandler.off(this._element, this.constructor.EVENT_KEY);
			this._validation.dispose();
			if (!this._hostAriaLabel) writeAttribute(this._element, "aria-label", this._hostAriaLabel);
			this._element.classList.remove(CLASS_NAME_ALL_SELECTED);
			this._element.replaceChildren(...this._hostNodes);
			super.dispose();
		}
		_setDisabled(disabled) {
			if (disabled === this._disabled) return;
			const focused = this._getSectionElements().find((sectionElement) => containsFocus(sectionElement)) ?? null;
			this._disabled = disabled;
			if (disabled) focused?.blur();
			this._element.classList.toggle(CLASS_NAME_DISABLED$5, disabled);
			for (const sectionElement of this._getSectionElements()) {
				writeAttribute(sectionElement, "aria-disabled", disabled ? "true" : null);
				writeAttribute(sectionElement, "contenteditable", disabled ? null : "true");
			}
			this._inputElement.disabled = disabled;
			this._setTabIndexes(focused);
			this._validation.update();
		}
		_getAriaLabel() {
			const { type } = this._config;
			const ariaLabel = this._config.ariaLabel || this.constructor.Default.ariaLabel;
			return ariaLabel === ARIA_LABELS.date && Object.hasOwn(ARIA_LABELS, type) ? ARIA_LABELS[type] : ariaLabel;
		}
		_convertDate(value) {
			return convertValue(value, this._config.type, this._config.locale);
		}
		_applyConfig() {
			const { date, format, locale, maxDate, minDate, monthNames } = this._config;
			const sections = format ? getSectionLayout(format, locale, monthNames) : this._getDefaultSections(locale);
			this._minDate = this._convertDate(minDate);
			this._maxDate = this._convertDate(maxDate);
			this._sections = setSectionsFromDate(sections, date ? this._convertDate(date) : null);
			this._draft = "";
		}
		_getValueKey(sections) {
			return JSON.stringify(sections.map((section) => section.value));
		}
		_addEventListeners() {
			const eventName = (name) => this.constructor.eventName(name);
			EventHandler.on(this._element, eventName("keydown"), SELECTOR_SECTION$2, (event) => {
				this._onKeydown(event);
			});
			EventHandler.on(this._element, eventName("beforeinput"), SELECTOR_SECTION$2, (event) => {
				event.preventDefault();
				const key = event.inputType === "insertText" && event.data?.length === 1 ? event.data : INPUT_TYPE_KEYS[event.inputType];
				if (key && this._isEditable()) event.target.dispatchEvent(new KeyboardEvent("keydown", {
					bubbles: true,
					cancelable: true,
					key
				}));
			});
			EventHandler.on(this._element, eventName("focusin"), SELECTOR_SECTION$2, (event) => {
				if (this._draft) {
					this._draft = "";
					this._commitSections();
				}
				this._setTabIndexes(event.target);
				this._selectSectionContent(event.target);
			});
			EventHandler.on(this._element, eventName("focusin"), SELECTOR_VALUE_FIELD, () => {
				this._focusFirstEmptySection();
			});
			EventHandler.on(this._element, eventName("mousedown"), SELECTOR_SECTION$2, (event) => {
				if (this._disabled) return;
				event.preventDefault();
				event.target.focus();
				this._selectSectionContent(event.target);
			});
			EventHandler.on(this._element, eventName("focusout"), (event) => {
				if (!this._element.contains(event.relatedTarget)) {
					this._setAllSelected(false);
					if (!this._disabled) this._normalizeSections();
				}
			});
			EventHandler.on(this._element, eventName("paste"), (event) => {
				event.preventDefault();
				if (this._isEditable()) this._handlePaste(event.clipboardData.getData("text"));
			});
			for (const type of ["copy", "cut"]) EventHandler.on(this._element, eventName(type), (event) => {
				if (!this._allSelected) return;
				event.preventDefault();
				event.clipboardData.setData("text/plain", formatSections(this._sections));
				if (type === "cut" && this._isEditable()) this._clearAndFocus();
			});
			EventHandler.on(this._element, eventName("click"), (event) => {
				if (event.target.closest(SELECTOR_SECTION$2)) {
					event.preventDefault();
					return;
				}
				this._focusFirstEmptySection();
			});
		}
		_getResetValue() {
			const sections = setSectionsFromDate(this._sections, this._initialDate);
			const date = getDateFromSections(sections);
			return date && !getDateLimitError(sections, date, this._minDate, this._maxDate, this._config.disabledDates) ? formatSections(sections) : "";
		}
		_focusFirstEmptySection() {
			if (this._inputElement?.matches(":disabled")) return;
			const sections = this._getSectionElements();
			(sections.find((sectionElement, index) => this._getSection(index).value === null) || sections[0])?.focus();
		}
		_onKeydown(event) {
			const { key } = event;
			const target = event.target;
			if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === "a") {
				event.preventDefault();
				this._setAllSelected(true);
				return;
			}
			if ([
				ARROW_LEFT_KEY$7,
				ARROW_RIGHT_KEY$7,
				HOME_KEY$3,
				END_KEY$3
			].includes(key) && !hasShortcutModifier(event)) {
				event.preventDefault();
				this._focusSectionByKey(target, key);
				return;
			}
			if (!this._isEditable()) {
				if (isTypedKey(event)) event.preventDefault();
				return;
			}
			if (this._allSelected && this._onKeydownAllSelected(event)) return;
			const section = this._getSection(this._getSectionIndex(target));
			if ((key === ARROW_UP_KEY$4 || key === ARROW_DOWN_KEY$5) && !hasShortcutModifier(event)) {
				event.preventDefault();
				section.value = getIncrementedSectionValue(section, key === ARROW_UP_KEY$4 ? 1 : -1, this._getSectionMax(section));
				this._draft = "";
				this._runAsUser(() => this._commitSections());
				return;
			}
			if (key === BACKSPACE_KEY$2 || key === DELETE_KEY$1) {
				event.preventDefault();
				if (key === BACKSPACE_KEY$2 && section.value === null) {
					this._focusSibling(target, false);
					return;
				}
				section.value = null;
				this._draft = "";
				this._runAsUser(() => this._commitSections());
				return;
			}
			if (isTypedKey(event)) {
				event.preventDefault();
				this._applyCharacter(target, key);
			}
		}
		_onKeydownAllSelected(event) {
			const { key } = event;
			const isCharacter = isTypedKey(event);
			if (!isCharacter && key !== BACKSPACE_KEY$2 && key !== DELETE_KEY$1) return false;
			event.preventDefault();
			const firstSection = this._clearAndFocus();
			if (isCharacter) this._applyCharacter(firstSection, key);
			return true;
		}
		_focusSectionByKey(sectionElement, key) {
			const rtl = isRTL(this._element);
			if (key === HOME_KEY$3 || key === END_KEY$3) {
				const sections = this._getSectionElements();
				sections[key === HOME_KEY$3 ? 0 : sections.length - 1].focus();
				return;
			}
			const shouldMoveNext = key === (rtl ? ARROW_LEFT_KEY$7 : ARROW_RIGHT_KEY$7);
			this._focusSibling(sectionElement, shouldMoveNext);
		}
		_applyCharacter(sectionElement, character) {
			const section = this._getSection(this._getSectionIndex(sectionElement));
			const result = /^\d$/.test(character) ? applyDigitToSection(section, this._draft, character, this._getSectionMax(section)) : applyLetterToSection(section, this._draft, character);
			if (!result) return;
			this._draft = result.completed ? "" : result.draft;
			section.value = result.value;
			this._runAsUser(() => this._commitSections());
			if (result.completed) this._focusSibling(sectionElement, true);
			else this._selectSectionContent(sectionElement);
		}
		_clearAndFocus() {
			this._setAllSelected(false);
			this._draft = "";
			this._runAsUser(() => this._commitSections(setSectionsFromDate(this._sections, null)));
			const [firstSection] = this._getSectionElements();
			firstSection.focus();
			return firstSection;
		}
		_handlePaste(text) {
			if (!text) return;
			this._draft = "";
			const sections = this._config.inputDateParse ? null : getSectionsFromString(text, this._sections);
			if (sections) {
				this._runAsUser(() => this._commitSections(sections));
				return;
			}
			const date = this._config.inputDateParse ? this._config.inputDateParse(text) : getLocalDateFromString(text, this._config.locale);
			if (date instanceof Date && !Number.isNaN(date.getTime())) this._runAsUser(() => this._commitSections(setSectionsFromDate(this._sections, date)));
		}
		_normalizeSections() {
			for (const section of this._sections) {
				if (section.type === "literal" || section.value === null) continue;
				const { min } = getSectionBounds(section);
				section.value = Math.min(Math.max(section.value, min), this._getSectionMax(section));
			}
			this._draft = "";
			this._commitSections();
		}
		_commitSections(sections = this._sections, notify = true) {
			if (this._getValueKey(sections) !== this._valueKey) this._validation.change();
			this._sections = sections;
			this._syncSections();
			const value = this._applyValidationState();
			this._valueKey = this._getValueKey(this._sections);
			try {
				if (notify) {
					this._notifying += 1;
					this._report(value);
				}
			} finally {
				if (notify) this._notifying -= 1;
				if (!this._notifying) this._reportedDate = this._date;
			}
			if (!this._notifying) this._announceError();
		}
		_report(value) {
			if (value !== null) {
				const reports = ++this._reports;
				this._inputElement.dispatchEvent(new Event("input", { bubbles: true }));
				if (this._reports === reports) this._inputElement.dispatchEvent(new Event("change", { bubbles: true }));
			}
			if (!isSameInstantAs(this._date, this._reportedDate)) {
				this._reportedDate = this._date;
				EventHandler.trigger(this._element, this.constructor.eventName(this.constructor.CHANGE_EVENT_NAME), { date: this._date });
			}
		}
		_applyValidationState() {
			for (const section of this._sections) if (!this._draft && (section.type === "day" || section.type === "week") && section.value !== null && section.value > this._getSectionMax(section)) {
				section.value = this._getSectionMax(section);
				this._syncSections();
			}
			const date = getDateFromSections(this._sections);
			const isFilled = this._sections.some((section) => section.type !== "literal" && section.value !== null);
			const error = this._getValidationError(date, isFilled);
			const isDisabled = error !== null && error !== "incomplete";
			const value = date && !isDisabled ? formatSections(this._sections) : "";
			const isChanged = this._fieldValue !== value;
			this._element.classList.toggle(CLASS_NAME_FILLED, isFilled);
			this._rejected = isDisabled;
			this._fieldValue = value;
			if (this._inputElement.value !== value) this._inputElement.value = value;
			this._date = isDisabled ? null : date;
			this._validationError = error;
			this._validation.update();
			return isChanged && this._isBuilt ? value : null;
		}
		_announceError() {
			if (this._errorHolds || this._validationError === this._error) return;
			this._error = this._validationError;
			EventHandler.trigger(this._element, this.constructor.eventName("errorChange"), { error: this._error });
			this._validation.update();
		}
		_holdErrors(hold) {
			this._errorHolds += hold ? 1 : -1;
			this._announceError();
		}
		_runAsUser(action) {
			this._validation.runAsUser(action);
		}
		_getValidationError(date, isFilled) {
			if (!(date instanceof Date)) {
				if (!isFilled) return null;
				return !containsFocus(this._element) && isBeforeYearOne(this._sections) ? "minDate" : "incomplete";
			}
			return getDateLimitError(this._sections, date, this._minDate, this._maxDate, this._config.disabledDates);
		}
		_createSectionInput() {
			const { name, readonly, required } = this._config;
			const disabled = this._disabled;
			this._element.classList.add(CLASS_NAME_FORM_CONTROL, CLASS_NAME_SECTION_INPUT);
			this._element.classList.toggle(CLASS_NAME_DISABLED$5, disabled);
			this._element.setAttribute("role", "group");
			if (!this._hostAriaLabel) this._element.setAttribute("aria-label", this._getAriaLabel());
			this._element.replaceChildren();
			for (const section of this._sections) {
				const element = document.createElement("span");
				if (section.type === "literal") {
					element.className = CLASS_NAME_SEPARATOR$1;
					element.setAttribute("aria-hidden", "true");
					element.textContent = section.value;
					this._element.append(element);
					continue;
				}
				const { min, max } = getSectionBounds(section);
				const labelKey = `aria${section.type[0].toUpperCase()}${section.type.slice(1)}Label`;
				const attributes = {
					role: "spinbutton",
					inputmode: section.names ? "text" : "numeric",
					autocorrect: "off",
					spellcheck: "false",
					"aria-label": this._config[labelKey] || this.constructor.Default[labelKey],
					"aria-valuemin": String(min),
					"aria-valuemax": String(max),
					"data-coreui-section": section.type
				};
				if (disabled) attributes["aria-disabled"] = "true";
				else attributes.contenteditable = "true";
				if (readonly) attributes["aria-readonly"] = "true";
				if (required) attributes["aria-required"] = "true";
				element.className = CLASS_NAME_SECTION;
				for (const [attribute, value] of Object.entries(attributes)) element.setAttribute(attribute, value);
				this._element.append(element);
			}
			if (!this._inputElement) {
				this._inputElement = document.createElement("textarea");
				this._inputElement.autocomplete = "off";
				this._inputElement.tabIndex = -1;
				this._inputElement.setAttribute("aria-hidden", "true");
			}
			this._inputElement.defaultValue = this._isBuilt ? this._getResetValue() : "";
			this._inputElement.disabled = disabled;
			this._inputElement.readOnly = readonly;
			this._inputElement.required = required;
			if (name) this._inputElement.name = name;
			else this._inputElement.removeAttribute("name");
			this._element.append(this._inputElement);
			this._syncSections();
			this._setTabIndexes();
			this._validation.refresh();
		}
		_syncSections() {
			for (const [index, sectionElement] of this._getSectionElements().entries()) {
				const section = this._getSection(index);
				const placeholder = this._config[`${section.type}Placeholder`] || section.placeholder || DefaultPlaceholders[section.type].slice(0, section.length);
				sectionElement.textContent = formatSectionValue(section, placeholder);
				sectionElement.classList.toggle(CLASS_NAME_SECTION_EMPTY, section.value === null);
				if (section.type === "day" || section.type === "week") sectionElement.setAttribute("aria-valuemax", String(this._getSectionMax(section)));
				sectionElement.setAttribute("aria-valuetext", getSectionValueText(section, this._config.locale));
				if (section.value === null) sectionElement.removeAttribute("aria-valuenow");
				else sectionElement.setAttribute("aria-valuenow", String(section.type === "year" ? getFullYearFromSection(section) : section.value));
			}
		}
		_setTabIndexes(activeElement = null) {
			const sectionElements = this._getSectionElements();
			const focusableElement = activeElement || sectionElements[0];
			for (const sectionElement of sectionElements) sectionElement.tabIndex = !this._disabled && sectionElement === focusableElement ? 0 : -1;
		}
		_selectSectionContent(sectionElement) {
			this._setAllSelected(false);
			const selection = window.getSelection();
			const range = document.createRange();
			range.selectNodeContents(sectionElement);
			selection.removeAllRanges();
			selection.addRange(range);
		}
		_setAllSelected(allSelected) {
			this._allSelected = allSelected;
			this._element.classList.toggle(CLASS_NAME_ALL_SELECTED, allSelected);
		}
		_focusSibling(sectionElement, shouldMoveNext) {
			const sections = this._getSectionElements();
			const sibling = getNextActiveElement(sections, sectionElement, shouldMoveNext);
			if (sibling && sibling !== sectionElement) sibling.focus();
		}
		_getSectionMax(section) {
			if (section.type === "day") return getDaySectionMax(this._sections);
			if (section.type === "week") return getWeekSectionMax(this._sections);
			return getSectionBounds(section).max;
		}
		_isEditable() {
			return !this._disabled && !this._config.readonly;
		}
		_getSection(index) {
			return this._sections.filter(isEditableSection)[index];
		}
		_getSectionIndex(sectionElement) {
			return this._getSectionElements().indexOf(sectionElement);
		}
		_getSectionElements() {
			return SelectorEngine.find(SELECTOR_SECTION$2, this._element);
		}
		_getDefaultSections(locale) {
			const { seconds, type } = this._config;
			return type === "time" ? getTimeSectionsFromLocale(locale, seconds) : getSectionLayout(null, locale, null, type === "datetime" && { seconds });
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, DateInput, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$16, () => {
		for (const dateInput of SelectorEngine.find(SELECTOR_DATA_DATE_INPUT)) DateInput.getOrCreateInstance(dateInput);
	});
	defineJQueryPlugin(DateInput);
	//#endregion
	//#region js/src/util/composite.ts
	const getForwardedOptions = (keys, config, defaults, original) => {
		const forwarded = {};
		for (const key of keys) {
			const value = config[key] === "" && /^aria(?:Day|End|Hour|Meridiem|Minute|Month|Quarter|Second|Start|Week|Year)Label$/.test(key) ? defaults[key] : config[key];
			if (key in config && value !== original[key]) forwarded[key] = value;
		}
		return forwarded;
	};
	//#endregion
	//#region js/src/picker-base.ts
	const CLASS_NAME_POPUP = "popup";
	const CLASS_NAME_SHOW$9 = "show";
	const SELECTOR_ACTION$1 = "[data-coreui-picker-action]";
	const SELECTOR_SECTION$1 = "[data-coreui-section]";
	const SELECTOR_SVG = "svg";
	const SELECTOR_TEMPLATE_FOOTER = "template[data-coreui-template=\"footer\"]";
	var PickerBase = class extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._adoptedAttributes = [];
			this._cleanerElement = null;
			this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element);
			this._menu = null;
			this._popup = null;
			this._validation = new FieldValidation(this._element, {
				aliases: true,
				config: () => this._config,
				fields: () => [],
				frames: () => this._stateFrames(),
				invalidTargets: () => []
			});
		}
		show() {
			this._popup.show();
		}
		hide() {
			this._popup.hide();
		}
		toggle() {
			return this._popup.isShown ? this.hide() : this.show();
		}
		setValidationState(validationState) {
			this._setConfig({
				invalid: false,
				valid: false,
				validationState
			});
		}
		dispose() {
			if (!this._element) return;
			for (const element of this._listeningElements()) EventHandler.off(element, this.constructor.EVENT_KEY);
			this._popup.dispose();
			this._disposeParts();
			this._restoreAdoptedAttributes();
			this._validation.dispose();
			super.dispose();
		}
		_setConfig(config) {
			if (!config || Object.keys(config).length === 0) return;
			this._config = this._getConfig({
				...this._config,
				...config
			});
			this._validation.configure(config);
		}
		_createPopup() {
			this._popup = new Popup({
				anchor: this._popupAnchor(),
				container: this._config.container,
				content: this._menu,
				onBeforeHide: () => !EventHandler.trigger(this._element, this.constructor.eventName("hide"))?.defaultPrevented,
				onBeforeShow: () => !this._config.disabled && !EventHandler.trigger(this._element, this.constructor.eventName("show"))?.defaultPrevented,
				onHidden: () => EventHandler.trigger(this._element, this.constructor.eventName("hidden")),
				onHide: () => {
					this._clearToggleAttribute("aria-controls");
					this._menu.classList.remove(CLASS_NAME_SHOW$9);
					this._element.classList.remove(CLASS_NAME_SHOW$9);
					this._writeToggleAttribute("aria-expanded", "false");
				},
				onShow: () => {
					this._writeToggleAttribute("aria-controls", this._menu.id);
					this._menu.classList.add(CLASS_NAME_SHOW$9);
					this._element.classList.add(CLASS_NAME_SHOW$9);
					this._onPopupShow();
					this._writeToggleAttribute("aria-expanded", "true");
				},
				onShown: () => EventHandler.trigger(this._element, this.constructor.eventName("shown"))
			});
		}
		_addEventListeners() {
			const eventName = this.constructor.eventName("click");
			if (this._cleanerElement) EventHandler.on(this._cleanerElement, eventName, (event) => {
				event.stopPropagation();
				this._runAsUser(() => this.clear());
				if (this._element && [this._cleanerElement, document.body].includes(document.activeElement)) SelectorEngine.findOne(SELECTOR_SECTION$1, this._popupAnchor())?.focus();
			});
			EventHandler.on(this._toggleElement, eventName, () => {
				if (!this._config.disabled) this.toggle();
			});
			EventHandler.on(this._menu, eventName, SELECTOR_ACTION$1, (event) => {
				const action = event.target.closest(SELECTOR_ACTION$1).dataset.coreuiPickerAction;
				const context = this.getContext();
				if (typeof context[action] === "function") context[action]();
			});
		}
		_stateFrames() {
			return [];
		}
		_runAsUser(action) {
			this._validation.runAsUser(action);
		}
		_createAction(className, icon, label) {
			return createControlGroupAction({
				className,
				disabled: this._config.disabled,
				icon,
				label,
				sanitizeIcon: (value) => sanitizeByConfig(value, this._config)
			});
		}
		_createMenu(prefix, body, nowAction) {
			this._menu = document.createElement("div");
			this._menu.id = getUID(`${this.constructor.NAME}-popup-`);
			this._menu.classList.add(CLASS_NAME_POPUP, `${prefix}-popup`);
			this._menu.setAttribute("aria-label", this._popupLabel());
			this._menu.append(body);
			this._writeToggleAttribute("aria-expanded", "false");
			this._writeToggleAttribute("aria-haspopup", "dialog");
			if (!this._footerTemplate) return;
			const footer = document.createElement("div");
			footer.classList.add(`${prefix}-footer`);
			footer.append(this._footerTemplate.content.cloneNode(true));
			if (nowAction && !this._isNowSelectable()) {
				for (const button of SelectorEngine.find(nowAction, footer)) if ("disabled" in button) button.disabled = true;
			}
			this._menu.append(footer);
		}
		_originalDefault() {
			return this.constructor.Default;
		}
		_forwardConfig(Component, overrides = {}, extra = {}) {
			return {
				...getForwardedOptions(Object.keys(Component.Default), this._config, this.constructor.Default, this._originalDefault()),
				...overrides,
				...extra
			};
		}
		_baseContext() {
			return {
				clear: () => this._runAsUser(() => this.clear()),
				close: () => this.hide(),
				disabled: this._config.disabled,
				reset: () => this._runAsUser(() => this.reset())
			};
		}
		_writeAdoptedAttribute(element, name, value) {
			const recorded = this._adoptedAttributes.find(([recordedElement, recordedName]) => recordedElement === element && recordedName === name);
			if (recorded) recorded[3] = value;
			else this._adoptedAttributes.push([
				element,
				name,
				element.getAttribute(name),
				value
			]);
			if (value === null) element.removeAttribute(name);
			else element.setAttribute(name, value);
		}
		_adoptAction(element, label) {
			if (!element.hasAttribute("aria-label") && !element.hasAttribute("aria-labelledby") && !this._showsText(element)) this._writeAdoptedAttribute(element, "aria-label", label);
			for (const svg of SelectorEngine.find(SELECTOR_SVG, element)) svg.setAttribute("aria-hidden", "true");
			if ("disabled" in element) element.disabled = this._config.disabled;
			return element;
		}
		_showsText(element) {
			return [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE ? Boolean(node.textContent?.trim()) : node instanceof HTMLElement && !node.hidden && node.getAttribute("aria-hidden") !== "true" && this._showsText(node));
		}
		_moveAriaToField(element) {
			const isNamed = element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby");
			for (const name of [
				"aria-describedby",
				"aria-label",
				"aria-labelledby"
			]) {
				const value = this._element.getAttribute(name);
				const own = element.getAttribute(name);
				if (value === null || name !== "aria-describedby" && isNamed) continue;
				this._writeAdoptedAttribute(element, name, own ? `${own} ${value}` : value);
				this._writeAdoptedAttribute(this._element, name, null);
			}
		}
		_restoreAdoptedAttributes() {
			for (const [element, name, previous, written] of this._adoptedAttributes) {
				if (element.getAttribute(name) !== written) continue;
				if (previous === null) element.removeAttribute(name);
				else element.setAttribute(name, previous);
			}
		}
		_listeningElements() {
			return [
				this._menu,
				this._toggleElement,
				this._cleanerElement
			];
		}
		_popupAnchor() {
			return this._element;
		}
		_popupLabel() {
			return this._config.ariaPopupLabel;
		}
		_writeToggleAttribute(name, value) {
			this._toggleElement?.setAttribute(name, value);
		}
		_clearToggleAttribute(name) {
			if (!this._toggleElement) return;
			const recorded = this._adoptedAttributes.find(([element, recordedName]) => element === this._toggleElement && recordedName === name);
			if (recorded?.[2] === null || recorded === void 0) {
				this._toggleElement.removeAttribute(name);
				return;
			}
			this._toggleElement.setAttribute(name, recorded[2]);
		}
	};
	//#endregion
	//#region js/src/time-selection/base.ts
	const NAME$36 = "time-selection";
	const EVENT_KEY$28 = ".coreui.time-selection";
	const EVENT_FOCUSIN$5 = `focusin${EVENT_KEY$28}`;
	const EVENT_KEYDOWN$9 = `keydown${EVENT_KEY$28}`;
	const Default$31 = {
		ariaSelectHoursLabel: "Select hours",
		ariaSelectMeridiemLabel: "Select AM/PM",
		ariaSelectMinutesLabel: "Select minutes",
		ariaLabel: "Time",
		ariaSelectSecondsLabel: "Select seconds",
		hourCycle: null,
		hours: null,
		locale: "default",
		maxDate: null,
		minDate: null,
		minutes: true,
		onChange: null,
		seconds: true,
		time: null
	};
	const DefaultType$30 = {
		ariaSelectHoursLabel: "string",
		ariaSelectMeridiemLabel: "string",
		ariaSelectMinutesLabel: "string",
		ariaLabel: "string",
		ariaSelectSecondsLabel: "string",
		hourCycle: "(string|null)",
		hours: "(array|function|null)",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		minutes: "(array|boolean|function)",
		onChange: "(function|null)",
		seconds: "(array|boolean|function)",
		time: "(date|null)"
	};
	var TimeSelection = class extends Config {
		constructor(element, config) {
			super();
			this._element = element;
			this._config = this._getConfig(config);
			this._date = this._config.time;
			this._render();
		}
		static get Default() {
			return Default$31;
		}
		static get DefaultType() {
			return DefaultType$30;
		}
		static get NAME() {
			return NAME$36;
		}
		getTime() {
			return this._date;
		}
		setTime(time) {
			this._config.time = time;
			this._date = time;
			this._ampm = this._dayPeriod();
			this._markSelected();
		}
		setConfig(config) {
			this._config = this._getConfig({
				...this._config,
				...config
			});
			this._date = this._config.time;
			this._render();
		}
		dispose() {
			EventHandler.off(this._element, EVENT_FOCUSIN$5);
			EventHandler.off(this._element, EVENT_KEYDOWN$9);
			this._element.replaceChildren();
			this._element = null;
		}
		_ampmOption() {
			return this._config.hourCycle === null ? "auto" : this._config.hourCycle === "h12";
		}
		_render() {
			this._element.setAttribute("role", "group");
			this._element.setAttribute("aria-label", this._config.ariaLabel);
			this._minDate = convertValue(this._config.minDate, "datetime", this._config.locale);
			this._maxDate = getInclusiveMax(convertValue(this._config.maxDate, "datetime", this._config.locale));
			this._partials = getLocalizedTimePartials(this._config.locale, this._ampmOption(), this._config.hours, this._config.minutes, this._config.seconds);
			this._ampm = this._dayPeriod();
			this._element.replaceChildren();
			EventHandler.off(this._element, EVENT_KEYDOWN$9);
			this._renderBody();
			EventHandler.off(this._element, EVENT_FOCUSIN$5);
			EventHandler.on(this._element, EVENT_FOCUSIN$5, (event) => {
				this._updateRovingTabIndex(event.target);
			});
			this._markSelected(true);
			this._updateRovingTabIndex();
		}
		_parts() {
			const parts = [{
				ariaLabel: this._config.ariaSelectHoursLabel,
				name: "hours",
				options: this._partials.listOfHours
			}];
			if (this._config.minutes) parts.push({
				ariaLabel: this._config.ariaSelectMinutesLabel,
				name: "minutes",
				options: this._partials.listOfMinutes
			});
			if (this._config.seconds) parts.push({
				ariaLabel: this._config.ariaSelectSecondsLabel,
				name: "seconds",
				options: this._partials.listOfSeconds
			});
			if (this._partials.hour12) {
				const [am, pm] = getDayPeriodNames(this._config.locale);
				parts.push({
					ariaLabel: this._config.ariaSelectMeridiemLabel,
					name: "meridiem",
					options: [{
						label: am,
						value: "am"
					}, {
						label: pm,
						value: "pm"
					}]
				});
			}
			return parts.map((part) => ({
				...part,
				options: part.options.map((option) => ({
					...option,
					disabled: this._isUnavailable(part.name, option.value) || this._isOutsideLimits(part.name, option.value)
				}))
			}));
		}
		_isOutsideLimits(part, value) {
			if (part === "meridiem" && (this._minDate || this._maxDate)) return this._firstAllowedHour(value) === void 0;
			return this._isValueOutsideLimits(part, part === "hours" ? this._hourOf(value) : value);
		}
		_isValueOutsideLimits(part, value) {
			if (!this._minDate && !this._maxDate || !this._date && (part === "minutes" || part === "seconds")) return false;
			const date = new Date(this._config.time ?? constrainDate(/* @__PURE__ */ new Date(), this._minDate, this._maxDate));
			if (this._date) date.setHours(this._date.getHours(), this._date.getMinutes(), this._date.getSeconds());
			const offered = (part === "hours" && this._config.minutes ? this._partials.listOfMinutes : part === "minutes" && this._config.seconds ? this._partials.listOfSeconds : []).map((option) => option.value);
			return isTimeOutsideLimits(date, part, value, {
				max: this._maxDate,
				min: this._minDate
			}, offered);
		}
		_firstAllowedHour(period) {
			return this._partials.listOfHours.flatMap((option) => option.hours ?? []).toSorted((a, b) => a - b).find((hour) => (!period || hour >= 12 === (period === "pm")) && !this._isValueOutsideLimits("hours", hour));
		}
		_startTime() {
			const hour = this._minDate || this._maxDate ? this._firstAllowedHour() : void 0;
			if (hour === void 0) return null;
			const date = /* @__PURE__ */ new Date("1970-01-01T00:00:00");
			date.setHours(hour, this._config.minutes ? Number(this._partials.listOfMinutes[0]?.value ?? 0) : 0, this._config.seconds ? Number(this._partials.listOfSeconds[0]?.value ?? 0) : 0);
			return date;
		}
		_hourOf(value) {
			const hour = Number(value);
			if (!this._partials.hour12) return hour;
			const hours = this._partials.listOfHours.find((option) => option.value === hour)?.hours ?? [];
			return hours.length === 1 ? hours[0] : convert12hTo24h(this._ampm, hour);
		}
		_dayPeriod() {
			return (this._date?.getHours() ?? this._startTime()?.getHours() ?? this._partials.listOfHours[0]?.hours?.[0] ?? 0) >= 12 ? "pm" : "am";
		}
		_isUnavailable(part, value) {
			if (part !== "meridiem") return false;
			const option = this._date && this._partials.listOfHours.find((item) => item.hours?.includes(this._date.getHours()));
			if (this._date && !option) return false;
			return !(option ? option.hours ?? [] : this._partials.listOfHours.flatMap((item) => item.hours ?? [])).some((hour) => hour >= 12 === (value === "pm"));
		}
		_renderBody() {
			throw new Error("TimeSelection is abstract — use TimeRoll or TimeSelects.");
		}
		_stops() {
			return [];
		}
		_entryStop(list) {
			return list[0] ?? null;
		}
		_markPart(_part, _value, _instant) {}
		_markDisabled() {}
		_updateRovingTabIndex(preferred) {
			const list = this._stops();
			if (list.length === 0) return;
			const active = (preferred && list.includes(preferred) ? preferred : null) ?? this._entryStop(list) ?? list[0];
			for (const element of list) element.tabIndex = element === active ? 0 : -1;
		}
		_change(part, value) {
			const start = this._date ? null : this._startTime();
			const date = new Date(this._date ?? start ?? /* @__PURE__ */ new Date("1970-01-01T00:00:00"));
			if (part === "meridiem") {
				const hours = date.getHours();
				this._ampm = value;
				if (value === "am" && hours >= 12) date.setHours(hours - 12);
				if (value === "pm" && hours < 12) date.setHours(hours + 12);
				const allowed = this._partials.listOfHours.flatMap((option) => option.hours ?? []);
				const first = start ? this._firstAllowedHour(value) : void 0;
				if (first !== void 0) date.setHours(first);
				else if (!allowed.includes(date.getHours())) date.setHours(allowed.find((hour) => hour >= 12 === (value === "pm")) ?? date.getHours());
			}
			if (part === "hours") {
				const hour = this._hourOf(value);
				date.setHours(hour);
				if (this._partials.hour12) this._ampm = hour < 12 ? "am" : "pm";
			}
			if (part === "minutes") date.setMinutes(Number.parseInt(value, 10));
			if (part === "seconds") date.setSeconds(Number.parseInt(value, 10));
			this._date = date;
			this._markSelected();
			execute(this._config.onChange, [void 0, date]);
		}
		_markSelected(instant = false) {
			const time = this._date;
			const selected = {
				hours: getSelectedHour(time, this._config.locale, this._ampmOption()),
				meridiem: time ? this._ampm : "",
				minutes: getSelectedMinutes(time),
				seconds: getSelectedSeconds(time)
			};
			for (const [part, value] of Object.entries(selected)) this._markPart(part, value, instant);
			this._markDisabled();
			this._updateRovingTabIndex(SelectorEngine.findOne(":focus", this._element));
		}
	};
	//#endregion
	//#region js/src/time-selection/selects.ts
	const NAME$35 = "time-selects";
	const CLASS_NAME_TIME_ICON = "date-picker-time-icon";
	const CLASS_NAME_TIME_SELECT = "date-picker-time-select";
	const ARROW_LEFT_KEY$6 = "ArrowLeft";
	const ARROW_RIGHT_KEY$6 = "ArrowRight";
	const SELECTOR_TIME_SELECT = `select.${CLASS_NAME_TIME_SELECT}`;
	var TimeSelects = class extends TimeSelection {
		static get NAME() {
			return NAME$35;
		}
		_renderBody() {
			this._renderSelects();
		}
		_stops() {
			return SelectorEngine.find(SELECTOR_TIME_SELECT, this._element);
		}
		_markPart(part, value) {
			const select = SelectorEngine.findOne(`select.${part}`, this._element);
			if (!select) return;
			const shown = [...select.options].some((option) => option.value === String(value)) ? String(value) : "";
			for (const option of select.options) option.defaultSelected = option.value === shown;
			select.value = shown;
			select.options[0].hidden = shown !== "";
		}
		_markDisabled() {
			for (const part of this._parts()) {
				const { options } = SelectorEngine.findOne(`select.${part.name}`, this._element);
				for (const [index, option] of part.options.entries()) options[index + 1].disabled = option.disabled;
			}
		}
		_renderSelects() {
			const icon = document.createElement("span");
			icon.classList.add(CLASS_NAME_TIME_ICON);
			icon.setAttribute("aria-hidden", "true");
			icon.innerHTML = CLOCK_ICON;
			this._element.append(icon);
			for (const [index, part] of this._parts().entries()) {
				if (index > 0 && part.name !== "meridiem") {
					const separator = document.createElement("span");
					separator.setAttribute("aria-hidden", "true");
					separator.textContent = ":";
					this._element.append(separator);
				}
				const select = document.createElement("select");
				select.classList.add(CLASS_NAME_TIME_SELECT, part.name);
				select.setAttribute("aria-label", part.ariaLabel);
				select.addEventListener("change", (event) => this._change(part.name, event.target.value));
				select.addEventListener("keydown", (event) => {
					if (event.key !== ARROW_LEFT_KEY$6 && event.key !== ARROW_RIGHT_KEY$6) return;
					event.preventDefault();
					const rtl = isRTL(select);
					const goLeft = event.key === ARROW_LEFT_KEY$6 && !rtl || event.key === ARROW_RIGHT_KEY$6 && rtl;
					const list = SelectorEngine.find(SELECTOR_TIME_SELECT, this._element);
					const index = list.indexOf(select) + (goLeft ? -1 : 1);
					if (index < 0 || index > list.length - 1) return;
					list[index].focus();
				});
				const placeholder = document.createElement("option");
				placeholder.value = "";
				placeholder.disabled = true;
				placeholder.textContent = "--";
				select.append(placeholder);
				for (const option of part.options) {
					const optionEl = document.createElement("option");
					optionEl.value = option.value;
					optionEl.textContent = option.label;
					select.append(optionEl);
				}
				this._element.append(select);
			}
		}
	};
	//#endregion
	//#region js/src/date-picker.ts
	const NAME$34 = "date-picker";
	const EVENT_KEY$27 = `.coreui.date-picker`;
	const DATA_API_KEY$22 = ".data-api";
	const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY$27}`;
	const EVENT_LOAD_DATA_API$15 = `load${EVENT_KEY$27}${DATA_API_KEY$22}`;
	const CLASS_NAME_BODY$2 = "date-picker-body";
	const CLASS_NAME_CALENDAR$1 = "date-picker-calendar";
	const CLASS_NAME_CALENDARS$1 = "date-picker-calendars";
	const CLASS_NAME_DATE_PICKER$1 = "date-picker";
	const CLASS_NAME_CLEANER$3 = "form-control-cleaner";
	const CLASS_NAME_INDICATOR$2 = "form-control-action";
	const CLASS_NAME_INPUT_GROUP$3 = "form-control-group";
	const CLASS_NAME_PICKER$2 = "picker";
	const CLASS_NAME_TIME_BODY = "date-picker-time-body";
	const CLASS_NAME_TIME_PICKERS = "date-picker-timepickers";
	const SELECTOR_DATA_DATE_PICKER = "[data-coreui-date-picker]";
	const SELECTOR_ROLE_CLEANER = "[data-coreui-picker-cleaner]";
	const SELECTOR_ROLE_FIELD = "[data-coreui-picker-field]";
	const SELECTOR_ROLE_TOGGLE = "[data-coreui-picker-toggle]";
	const SELECTOR_ACTION_TODAY = "[data-coreui-picker-action=\"today\"]";
	const Default$30 = {
		allowList: SVGAllowlist,
		ariaCleanerLabel: "Clear date",
		ariaPickerLabel: "Toggle calendar",
		ariaPopupLabel: "Calendar",
		calendarOptions: {},
		cleaner: true,
		cleanerIcon: CLEANER_ICON,
		container: false,
		date: null,
		disabled: false,
		floatingLabel: null,
		format: null,
		inputOptions: {},
		invalid: false,
		locale: navigator.language,
		maxDate: null,
		minDate: null,
		monthNames: null,
		name: null,
		pickerIcon: true,
		sanitize: true,
		sanitizeFn: null,
		seconds: true,
		selectionOptions: {},
		selectionType: "day",
		size: null,
		timepicker: false,
		valid: false,
		validationState: null
	};
	const ORIGINAL_DEFAULT$3 = { ...Default$30 };
	const DefaultType$29 = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		ariaPopupLabel: "string",
		calendarOptions: "object",
		cleaner: "boolean",
		cleanerIcon: "string",
		container: "(string|element|boolean)",
		date: "(date|string|null)",
		disabled: "boolean",
		floatingLabel: "(string|null)",
		format: "(function|string|null)",
		inputOptions: "object",
		invalid: "boolean",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		monthNames: "(array|null)",
		name: "(string|null)",
		pickerIcon: "(string|boolean)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		seconds: "(array|boolean|function)",
		selectionOptions: "object",
		selectionType: "string",
		size: "(string|null)",
		timepicker: "boolean",
		valid: "boolean",
		validationState: "(string|null|undefined)"
	};
	var DatePicker = class DatePicker extends PickerBase {
		constructor(element, config) {
			super(element, config);
			this._initialDate = config?.date ?? this._config.date;
			this._created = {
				cleaner: false,
				field: false,
				toggle: false
			};
			this._input = null;
			this._calendar = null;
			this._calendarElement = null;
			this._selection = null;
			this._selectionElement = null;
			this._source = null;
			this._createDatePicker();
			this._nameToggle();
			this._createPopup();
			this._addEventListeners();
		}
		static get Default() {
			return Default$30;
		}
		static get DefaultType() {
			return DefaultType$29;
		}
		static get NAME() {
			return NAME$34;
		}
		getDate() {
			return this._input?.getDate() ?? null;
		}
		setDate(date) {
			this._typeCheckConfig({ date }, { date: DefaultType$29.date });
			this._writeField(date, "code", false);
		}
		clear() {
			this._writeField(null);
		}
		reset() {
			this._writeField(this._initialDate);
		}
		today() {
			this._writeField(/* @__PURE__ */ new Date());
		}
		getContext() {
			return {
				...this._baseContext(),
				date: this.getDate(),
				isDateSelectable: (date) => this._input.isDateSelectable(date),
				setDate: (date) => this._runAsUser(() => this._writeField(date)),
				today: () => this._runAsUser(() => this.today())
			};
		}
		_disposeParts() {
			this._input.dispose();
			this._calendar?.dispose();
			this._selection?.dispose();
			if (this._created.field) this._fieldElement.remove();
			if (this._created.cleaner) this._cleanerElement?.remove();
			if (this._created.toggle) this._toggleElement?.remove();
		}
		_originalDefault() {
			return ORIGINAL_DEFAULT$3;
		}
		_createDatePicker() {
			this._element.classList.add(CLASS_NAME_DATE_PICKER$1, CLASS_NAME_PICKER$2);
			const inputGroup = this._element;
			applyControlGroupClasses(inputGroup, CLASS_NAME_INPUT_GROUP$3);
			applyControlGroupSize(inputGroup, this._config.size);
			const ownField = SelectorEngine.findOne(SELECTOR_ROLE_FIELD, inputGroup);
			const inputEl = ownField ?? document.createElement("div");
			this._created.field = !ownField;
			this._fieldElement = ownField ?? appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`);
			this._moveAriaToField(inputEl);
			const cleanerLabel = this._withTime("ariaCleanerLabel", "Clear date and time");
			const pickerLabel = this._withTime("ariaPickerLabel", "Toggle calendar and time selection");
			const ownCleaner = SelectorEngine.findOne(SELECTOR_ROLE_CLEANER, inputGroup);
			if (ownCleaner) this._cleanerElement = this._adoptAction(ownCleaner, cleanerLabel);
			else if (this._config.cleaner) {
				this._cleanerElement = this._createAction(CLASS_NAME_CLEANER$3, this._config.cleanerIcon, cleanerLabel);
				this._created.cleaner = true;
				inputGroup.append(this._cleanerElement);
			}
			const ownToggle = SelectorEngine.findOne(SELECTOR_ROLE_TOGGLE, inputGroup);
			this._toggleElement = null;
			this._toggleLabel = null;
			if (ownToggle) {
				this._toggleLabel = ownToggle.hasAttribute("aria-label") || ownToggle.hasAttribute("aria-labelledby") || this._showsText(ownToggle) ? null : pickerLabel;
				this._toggleElement = this._adoptAction(ownToggle, pickerLabel);
			} else if (this._config.pickerIcon) {
				this._toggleLabel = pickerLabel;
				this._toggleElement = this._createAction(CLASS_NAME_INDICATOR$2, this._config.pickerIcon === true ? CALENDAR_ICON : this._config.pickerIcon, pickerLabel);
				this._created.toggle = true;
				inputGroup.append(this._toggleElement);
			}
			const format = getPickerFormat(this._config.format, this._config.selectionType);
			this._input = new DateInput(inputEl, this._forwardConfig(DateInput, {
				date: this._config.date,
				disabled: this._config.disabled,
				locale: this._config.locale,
				name: this._config.name,
				seconds: Boolean(this._config.seconds),
				type: this._config.timepicker ? "datetime" : "date",
				...format ? { format } : {}
			}, {
				...this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {},
				...this._config.inputOptions,
				validationState: null
			}));
			this._validation.adopt(this._input._validation);
			EventHandler.on(inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event) => {
				this._onFieldChange(event.date);
			});
			const body = document.createElement("div");
			body.classList.add(CLASS_NAME_BODY$2);
			const calendars = document.createElement("div");
			calendars.classList.add(CLASS_NAME_CALENDARS$1);
			this._calendarElement = document.createElement("div");
			this._calendarElement.classList.add(CLASS_NAME_CALENDAR$1);
			calendars.append(this._calendarElement);
			body.append(calendars);
			if (this._config.timepicker) {
				const timePickers = document.createElement("div");
				timePickers.classList.add(CLASS_NAME_TIME_PICKERS);
				this._selectionElement = document.createElement("div");
				this._selectionElement.classList.add(CLASS_NAME_TIME_BODY);
				timePickers.append(this._selectionElement);
				body.append(timePickers);
			}
			this._createMenu(CLASS_NAME_DATE_PICKER$1, body, SELECTOR_ACTION_TODAY);
		}
		_isNowSelectable() {
			return this._input.isDateSelectable(/* @__PURE__ */ new Date());
		}
		_popupLabel() {
			return this._withTime("ariaPopupLabel", "Calendar and time selection");
		}
		_withTime(key, timed) {
			return this._config.timepicker && this._config[key] === ORIGINAL_DEFAULT$3[key] ? timed : this._config[key];
		}
		_ensureCalendar() {
			if (this._calendar) return;
			this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
				locale: this._config.locale,
				startDate: this.getDate()
			}, {
				...this._config.calendarOptions,
				...this._config.timepicker || !this._toggleLabel ? {} : { ariaSelectedDateAnnouncement: "" }
			}));
			EventHandler.on(this._calendar._element, "startDateChange.coreui.calendar", (event) => {
				this._runAsUser(() => this._writeField(this._withCurrentTime(event.dateObject), "calendar"));
				if (!this._config.timepicker) this.hide();
			});
			if (!this._config.timepicker) return;
			const hourCycle = getHourCycle(this._input._sections);
			this._selection = new TimeSelects(this._selectionElement, this._forwardConfig(TimeSelects, { locale: this._config.locale }, {
				...this._config.selectionOptions,
				...hourCycle && { hourCycle },
				onChange: (time) => this._runAsUser(() => this._applyTime(time)),
				time: this.getDate()
			}));
		}
		_withinTimeLimits(date) {
			const { locale, maxDate, minDate } = this._config;
			return constrainDateTime(date, convertValue(minDate, "datetime", locale), convertValue(maxDate, "datetime", locale));
		}
		_withCurrentTime(date) {
			if (!date || !this._config.timepicker) return date;
			const merged = new Date(date);
			const current = this.getDate();
			if (current) merged.setHours(current.getHours(), current.getMinutes(), current.getSeconds());
			return this._withinTimeLimits(merged);
		}
		_applyTime(time) {
			if (!time) return;
			const merged = new Date(this.getDate() ?? this._withinTimeLimits(/* @__PURE__ */ new Date()));
			merged.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
			const limited = this._withinTimeLimits(merged);
			this._writeField(limited, "selection");
			if (this._element && isSameInstantAs(this._selection?.getTime(), time)) this._selection.setTime(this.getDate() ?? limited);
		}
		_writeField(date, source = "code", triggerChange = true) {
			const previous = this._source;
			this._source = source;
			try {
				this._input.setDate(date, triggerChange);
				if (this._element && this._source === source) this._syncParts();
			} finally {
				this._source = previous;
			}
		}
		_onFieldChange(date) {
			this._syncParts();
			EventHandler.trigger(this._element, EVENT_DATE_CHANGE, {
				date,
				formattedDate: getDateBySelectionType(date, this._config.selectionType)
			});
		}
		_syncParts() {
			const source = this._source;
			const date = this.getDate();
			this._source = null;
			if (this._calendar && (source === "code" || !isSameDateAs(this._calendar._startDate, date))) this._calendar.setStartDate(date);
			if (source !== "selection") this._selection?.setConfig({ time: date });
			this._nameToggle();
		}
		_nameToggle() {
			if (!this._toggleElement || !this._toggleLabel) return;
			const date = this.getDate();
			const name = date && formatSelectionName(date, this._forwardConfig(Calendar, { locale: this._config.locale }, this._config.calendarOptions));
			const time = date && this._config.timepicker && createDateTimeFormat(this._config.locale, { timeStyle: this._config.seconds === false ? "short" : "medium" }).format(date);
			this._writeToggleAttribute("aria-label", [
				this._toggleLabel,
				name,
				time
			].filter(Boolean).join(", "));
		}
		_writeToggleAttribute(name, value) {
			if (!this._toggleElement) return;
			if (this._created.toggle || name !== "aria-label" && name !== "aria-controls") {
				this._toggleElement.setAttribute(name, value);
				return;
			}
			this._writeAdoptedAttribute(this._toggleElement, name, value);
		}
		_onPopupShow() {
			this._ensureCalendar();
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, DatePicker, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$15, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_DATE_PICKER)) DatePicker.getOrCreateInstance(element);
	});
	defineJQueryPlugin(DatePicker);
	//#endregion
	//#region js/src/date-range-input.ts
	const NAME$33 = "date-range-input";
	const EVENT_KEY$26 = `.coreui.date-range-input`;
	const DATA_API_KEY$21 = ".data-api";
	const EVENT_END_DATE_CHANGE$1 = `endDateChange${EVENT_KEY$26}`;
	const EVENT_START_DATE_CHANGE$1 = `startDateChange${EVENT_KEY$26}`;
	const EVENT_KEYDOWN$8 = `keydown${EVENT_KEY$26}`;
	const EVENT_LOAD_DATA_API$14 = `load${EVENT_KEY$26}${DATA_API_KEY$21}`;
	const ARROW_LEFT_KEY$5 = "ArrowLeft";
	const ARROW_RIGHT_KEY$5 = "ArrowRight";
	const CLASS_NAME_DATE_RANGE = "form-date-range";
	const CLASS_NAME_INPUT_GROUP$2 = "form-control-group";
	const CLASS_NAME_SEPARATOR = "form-control-icon";
	const ATTRIBUTE_ROLE_END = "data-coreui-range-end";
	const ATTRIBUTE_ROLE_SEPARATOR = "data-coreui-range-separator";
	const ATTRIBUTE_ROLE_START = "data-coreui-range-start";
	const SELECTOR_DATA_DATE_RANGE_INPUT = "[data-coreui-date-range-input]";
	const SELECTOR_ROLE_SEPARATOR = `[${ATTRIBUTE_ROLE_SEPARATOR}]`;
	const SELECTOR_SECTION = ".form-date-time-section";
	const Default$29 = {
		allowList: SVGAllowlist,
		ariaDayLabel: "Day",
		ariaEndLabel: "End date",
		ariaHourLabel: "Hour",
		ariaMeridiemLabel: "AM/PM",
		ariaMinuteLabel: "Minute",
		ariaMonthLabel: "Month",
		ariaQuarterLabel: "Quarter",
		ariaSecondLabel: "Second",
		ariaStartLabel: "Start date",
		ariaWeekLabel: "Week",
		ariaYearLabel: "Year",
		autofocus: false,
		dayPlaceholder: null,
		disabled: false,
		disabledDates: null,
		endDate: null,
		endFloatingLabel: null,
		endName: null,
		format: null,
		hourPlaceholder: null,
		inputDateParse: null,
		inputOptions: {},
		locale: navigator.language,
		maxDate: null,
		meridiemPlaceholder: null,
		minDate: null,
		minutePlaceholder: null,
		monthNames: null,
		monthPlaceholder: null,
		quarterPlaceholder: null,
		readonly: false,
		required: false,
		sanitize: true,
		sanitizeFn: null,
		secondPlaceholder: null,
		seconds: false,
		separatorIcon: SEPARATOR_ICON,
		separatorIconRtl: SEPARATOR_ICON_RTL,
		size: null,
		startDate: null,
		startFloatingLabel: null,
		startName: null,
		type: "date",
		validationState: null,
		weekPlaceholder: null,
		yearPlaceholder: null
	};
	const ORIGINAL_DEFAULT$2 = { ...Default$29 };
	const DefaultType$28 = {
		allowList: "object",
		ariaDayLabel: "string",
		ariaEndLabel: "string",
		ariaHourLabel: "string",
		ariaMeridiemLabel: "string",
		ariaMinuteLabel: "string",
		ariaMonthLabel: "string",
		ariaQuarterLabel: "string",
		ariaSecondLabel: "string",
		ariaStartLabel: "string",
		ariaWeekLabel: "string",
		ariaYearLabel: "string",
		autofocus: "boolean",
		dayPlaceholder: "(string|null)",
		disabled: "boolean",
		disabledDates: "(array|date|function|null)",
		endDate: "(date|string|null)",
		endFloatingLabel: "(string|null)",
		endName: "(string|null)",
		format: "(function|string|null)",
		hourPlaceholder: "(string|null)",
		inputDateParse: "(function|null)",
		inputOptions: "object",
		locale: "string",
		maxDate: "(date|string|null)",
		meridiemPlaceholder: "(string|null)",
		minDate: "(date|string|null)",
		minutePlaceholder: "(string|null)",
		monthNames: "(array|null)",
		monthPlaceholder: "(string|null)",
		quarterPlaceholder: "(string|null)",
		readonly: "boolean",
		required: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		secondPlaceholder: "(string|null)",
		seconds: "boolean",
		separatorIcon: "string",
		separatorIconRtl: "string",
		size: "(string|null)",
		startDate: "(date|string|null)",
		startFloatingLabel: "(string|null)",
		startName: "(string|null)",
		type: "string",
		validationState: "(string|null|undefined)",
		weekPlaceholder: "(string|null)",
		yearPlaceholder: "(string|null)"
	};
	var DateRangeInput = class DateRangeInput extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._createdElements = [];
			this._hostDescribedBy = this._element.getAttribute("aria-describedby");
			this._describedFields = [];
			this._validation = new FieldValidation(this._element, {
				config: () => this._config,
				fields: () => [],
				frames: () => [this._element],
				invalidTargets: () => [],
				ownError: () => !this.isRangeValid()
			});
			this._initialStartDate = config?.startDate ?? this._config.startDate;
			this._initialEndDate = config?.endDate ?? this._config.endDate;
			this._batching = false;
			this._generation = 0;
			this._createDateRangeInput();
			this._reported = {
				end: this.getEndDate(),
				start: this.getStartDate()
			};
			this._validation.update();
			this._addEventListeners();
		}
		static get Default() {
			return Default$29;
		}
		static get DefaultType() {
			return DefaultType$28;
		}
		static get NAME() {
			return NAME$33;
		}
		getStartDate() {
			return this._startInput?.getDate() ?? null;
		}
		getEndDate() {
			return this._endInput?.getDate() ?? null;
		}
		setRange(startDate, endDate, triggerChange = false) {
			this._typeCheckConfig({
				endDate,
				startDate
			}, {
				endDate: DefaultType$28.endDate,
				startDate: DefaultType$28.startDate
			});
			this._applyRange(startDate, endDate, triggerChange);
		}
		clear() {
			this._applyRange(null, null);
		}
		reset() {
			this._applyRange(this._initialStartDate, this._initialEndDate);
		}
		isDateSelectable(date) {
			return this._startInput.isDateSelectable(date);
		}
		getStartElement() {
			return this._startElement;
		}
		getEndElement() {
			return this._endElement;
		}
		isRangeValid() {
			const start = this.getStartDate();
			const end = this.getEndDate();
			return start === null || end === null || end >= start;
		}
		setEndDate(endDate, triggerChange = false) {
			this._typeCheckConfig({ endDate }, { endDate: DefaultType$28.endDate });
			this._applyRange(void 0, endDate, triggerChange);
		}
		setStartDate(startDate, triggerChange = false) {
			this._typeCheckConfig({ startDate }, { startDate: DefaultType$28.startDate });
			this._applyRange(startDate, void 0, triggerChange);
		}
		setValidationState(validationState) {
			this._setConfig({ validationState });
		}
		dispose() {
			if (!this._element) return;
			for (const element of [this._startElement, this._endElement]) EventHandler.off(element, EVENT_KEY$26);
			this._startInput.dispose();
			this._endInput.dispose();
			for (const element of this._createdElements) element.remove();
			this._validation.dispose();
			for (const [element, own, written] of this._describedFields) {
				if (element.getAttribute("aria-describedby") !== written) continue;
				if (own === null) element.removeAttribute("aria-describedby");
				else element.setAttribute("aria-describedby", own);
			}
			if (this._hostDescribedBy !== null && !this._element.hasAttribute("aria-describedby")) this._element.setAttribute("aria-describedby", this._hostDescribedBy);
			super.dispose();
		}
		_setConfig(config) {
			if (!config || !("validationState" in config)) return;
			this._config = this._getConfig({
				...this._config,
				validationState: config.validationState
			});
			this._validation.configure({ validationState: config.validationState });
		}
		_createDateRangeInput() {
			applyControlGroupClasses(this._element, CLASS_NAME_INPUT_GROUP$2, CLASS_NAME_DATE_RANGE);
			applyControlGroupSize(this._element, this._config.size);
			this._element.setAttribute("role", "group");
			this._startElement = this._createField(ATTRIBUTE_ROLE_START, this._config.startFloatingLabel);
			this._separatorElement = SelectorEngine.findOne(SELECTOR_ROLE_SEPARATOR, this._element) ?? this._createSeparator();
			this._separatorElement.setAttribute("aria-hidden", "true");
			this._endElement = this._createField(ATTRIBUTE_ROLE_END, this._config.endFloatingLabel);
			this._placeCreatedParts();
			this._moveDescriptionToFields();
			this._startInput = this._createInput(this._startElement, {
				ariaLabel: this._config.startFloatingLabel || this._config.ariaStartLabel || this.constructor.Default.ariaStartLabel,
				date: this._config.startDate,
				name: this._config.startName
			});
			this._endInput = this._createInput(this._endElement, {
				ariaLabel: this._config.endFloatingLabel || this._config.ariaEndLabel || this.constructor.Default.ariaEndLabel,
				date: this._config.endDate,
				name: this._config.endName
			});
			if (this._config.autofocus && !this._config.disabled) SelectorEngine.find(SELECTOR_SECTION, this._startElement)[0]?.focus();
		}
		_createInput(element, overrides) {
			const input = new DateInput(element, {
				...getForwardedOptions(Object.keys(DateInput.Default), this._config, this.constructor.Default, ORIGINAL_DEFAULT$2),
				...overrides,
				autofocus: false,
				disabled: this._config.disabled,
				...this._config.inputOptions,
				validationState: null
			});
			this._validation.adopt(input._validation);
			return input;
		}
		_moveDescriptionToFields() {
			if (this._hostDescribedBy === null) return;
			this._element.removeAttribute("aria-describedby");
			for (const element of [this._startElement, this._endElement]) {
				const own = element.getAttribute("aria-describedby");
				const written = own ? `${own} ${this._hostDescribedBy}` : this._hostDescribedBy;
				element.setAttribute("aria-describedby", written);
				this._describedFields.push([
					element,
					own,
					written
				]);
			}
		}
		_createField(attribute, floatingLabel) {
			const ownElement = SelectorEngine.findOne(`[${attribute}]`, this._element);
			if (ownElement) return ownElement;
			const element = document.createElement("div");
			element.setAttribute(attribute, "");
			this._createdElements.push(appendControlGroupField(this._element, element, floatingLabel, `${NAME$33}-`));
			return element;
		}
		_getHostChild(part) {
			let child = part;
			while (child.parentElement !== this._element) child = child.parentElement;
			return child;
		}
		_placeCreatedParts() {
			const [start, separator, end] = [
				this._startElement,
				this._separatorElement,
				this._endElement
			].map((part) => this._getHostChild(part));
			const isCreated = (element) => this._createdElements.includes(element);
			if (isCreated(separator)) {
				if (isCreated(end)) start.after(separator);
				else if (isCreated(start)) end.before(separator);
				else this._placeBetweenEnds(separator);
			}
			if (isCreated(start)) separator.before(start);
			if (isCreated(end)) separator.after(end);
		}
		_placeBetweenEnds(separator) {
			const start = this._getHostChild(this._startElement);
			const end = this._getHostChild(this._endElement);
			const children = [...this._element.children];
			if (children.indexOf(start) <= children.indexOf(end)) end.before(separator);
			else end.after(separator);
		}
		_createSeparator() {
			const separator = document.createElement("span");
			separator.classList.add(CLASS_NAME_SEPARATOR);
			separator.setAttribute(ATTRIBUTE_ROLE_SEPARATOR, "");
			separator.innerHTML = sanitizeByConfig(isRTL(this._element) ? this._config.separatorIconRtl : this._config.separatorIcon, this._config);
			this._element.append(separator);
			this._createdElements.push(separator);
			return separator;
		}
		_applyRange(startDate, endDate, triggerChange = true) {
			const batching = this._batching;
			const generation = ++this._generation;
			this._batching = true;
			this._startInput._holdErrors(true);
			this._endInput._holdErrors(true);
			try {
				if (startDate !== void 0) this._startInput.setDate(startDate, triggerChange);
				if (generation === this._generation && endDate !== void 0) this._endInput.setDate(endDate, triggerChange);
				if (this._element && triggerChange) {
					this._reportDate("start");
					this._reportDate("end");
				}
			} finally {
				this._batching = batching;
				this._startInput?._holdErrors(false);
				this._endInput?._holdErrors(false);
				if (this._element && !batching && (triggerChange || startDate !== void 0)) this._reported.start = this.getStartDate();
				if (this._element && !batching && (triggerChange || endDate !== void 0)) this._reported.end = this.getEndDate();
			}
		}
		_onFieldChange(end) {
			if (this._batching) return;
			this._reportDate(end);
		}
		_reportDate(end) {
			const date = end === "start" ? this.getStartDate() : this.getEndDate();
			if (!this._reported || isSameInstantAs(date, this._reported[end])) return;
			this._reported[end] = date;
			EventHandler.trigger(this._element, end === "start" ? EVENT_START_DATE_CHANGE$1 : EVENT_END_DATE_CHANGE$1, { date });
		}
		_addEventListeners() {
			EventHandler.on(this._startElement, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), () => {
				this._onFieldChange("start");
			});
			EventHandler.on(this._endElement, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), () => {
				this._onFieldChange("end");
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$8, (event) => {
				if (event.key !== ARROW_LEFT_KEY$5 && event.key !== ARROW_RIGHT_KEY$5 || hasShortcutModifier(event)) return;
				const forward = event.key === (isRTL(this._element) ? ARROW_LEFT_KEY$5 : ARROW_RIGHT_KEY$5);
				const startSections = SelectorEngine.find(SELECTOR_SECTION, this._startElement);
				const endSections = SelectorEngine.find(SELECTOR_SECTION, this._endElement);
				if (forward && event.target === startSections.at(-1)) endSections[0]?.focus();
				else if (!forward && event.target === endSections[0]) startSections.at(-1)?.focus();
			});
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, DateRangeInput, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$14, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_DATE_RANGE_INPUT)) DateRangeInput.getOrCreateInstance(element);
	});
	defineJQueryPlugin(DateRangeInput);
	//#endregion
	//#region js/src/date-range-picker.ts
	const NAME$32 = "date-range-picker";
	const EVENT_KEY$25 = `.coreui.date-range-picker`;
	const DATA_API_KEY$20 = ".data-api";
	const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY$25}`;
	const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY$25}`;
	const EVENT_LOAD_DATA_API$13 = `load${EVENT_KEY$25}${DATA_API_KEY$20}`;
	const CLASS_NAME_BODY$1 = "date-picker-body";
	const CLASS_NAME_CALENDAR = "date-picker-calendar";
	const CLASS_NAME_CALENDARS = "date-picker-calendars";
	const CLASS_NAME_DATE_PICKER = "date-picker";
	const CLASS_NAME_DATE_RANGE_PICKER = "date-range-picker";
	const CLASS_NAME_CLEANER$2 = "form-control-cleaner";
	const CLASS_NAME_INDICATOR$1 = "form-control-action";
	const CLASS_NAME_PICKER$1 = "picker";
	const CLASS_NAME_RANGES = "date-picker-ranges";
	const SELECTOR_DATA_DATE_RANGE_PICKER = "[data-coreui-date-range-picker]";
	const SELECTOR_TEMPLATE_RANGES = "template[data-coreui-template=\"ranges\"]";
	const Default$28 = {
		allowList: SVGAllowlist,
		ariaCleanerLabel: "Clear date range",
		ariaEndLabel: "End date",
		ariaPickerLabel: "Toggle calendar",
		ariaPopupLabel: "Calendar",
		ariaStartLabel: "Start date",
		calendarOptions: {},
		calendars: 2,
		cleaner: true,
		cleanerIcon: CLEANER_ICON,
		container: false,
		disabled: false,
		endDate: null,
		endFloatingLabel: null,
		endName: null,
		format: null,
		inputOptions: {},
		invalid: false,
		locale: navigator.language,
		maxDate: null,
		minDate: null,
		pickerIcon: true,
		sanitize: true,
		sanitizeFn: null,
		selectionType: "day",
		separatorIcon: SEPARATOR_ICON,
		separatorIconRtl: SEPARATOR_ICON_RTL,
		size: null,
		startDate: null,
		startFloatingLabel: null,
		startName: null,
		valid: false,
		validationState: null
	};
	const ORIGINAL_DEFAULT$1 = { ...Default$28 };
	const DefaultType$27 = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaEndLabel: "string",
		ariaPickerLabel: "string",
		ariaPopupLabel: "string",
		ariaStartLabel: "string",
		calendarOptions: "object",
		calendars: "number",
		cleaner: "boolean",
		cleanerIcon: "string",
		container: "(string|element|boolean)",
		disabled: "boolean",
		endDate: "(date|string|null)",
		endFloatingLabel: "(string|null)",
		endName: "(string|null)",
		format: "(function|string|null)",
		inputOptions: "object",
		invalid: "boolean",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		pickerIcon: "(string|boolean)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		selectionType: "string",
		separatorIcon: "string",
		separatorIconRtl: "string",
		size: "(string|null)",
		startDate: "(date|string|null)",
		startFloatingLabel: "(string|null)",
		startName: "(string|null)",
		valid: "boolean",
		validationState: "(string|null|undefined)"
	};
	var DateRangePicker = class DateRangePicker extends PickerBase {
		constructor(element, config) {
			super(element, config);
			this._rangesTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_RANGES, this._element);
			this._rangeInput = null;
			this._calendar = null;
			this._calendarElement = null;
			this._selectEndDate = false;
			this._createDateRangePicker();
			this._nameToggle();
			this._createPopup();
			this._addEventListeners();
		}
		static get Default() {
			return Default$28;
		}
		static get DefaultType() {
			return DefaultType$27;
		}
		static get NAME() {
			return NAME$32;
		}
		getStartDate() {
			return this._rangeInput?.getStartDate() ?? null;
		}
		getEndDate() {
			return this._rangeInput?.getEndDate() ?? null;
		}
		setEndDate(endDate) {
			this._typeCheckConfig({ endDate }, { endDate: DefaultType$27.endDate });
			this._applyRange(() => this._rangeInput.setEndDate(endDate));
		}
		setRange(startDate, endDate) {
			this._typeCheckConfig({
				endDate,
				startDate
			}, {
				endDate: DefaultType$27.endDate,
				startDate: DefaultType$27.startDate
			});
			this._applyRange(() => this._rangeInput.setRange(startDate, endDate));
		}
		setStartDate(startDate) {
			this._typeCheckConfig({ startDate }, { startDate: DefaultType$27.startDate });
			this._applyRange(() => this._rangeInput.setStartDate(startDate));
		}
		clear() {
			this._rangeInput.clear();
			this._setSelectEndDate(false);
		}
		reset() {
			this._rangeInput.reset();
			this._showRange();
			this._setSelectEndDate(false);
		}
		getContext() {
			return {
				...this._baseContext(),
				endDate: this.getEndDate(),
				isDateSelectable: (date) => this._rangeInput.isDateSelectable(date),
				setRange: (startDate, endDate) => this._runAsUser(() => this._applyRange(() => this._rangeInput.setRange(startDate, endDate, true))),
				startDate: this.getStartDate()
			};
		}
		_listeningElements() {
			return [...super._listeningElements(), this._frameElement];
		}
		_disposeParts() {
			this._rangeInput.dispose();
			this._calendar?.dispose();
			this._frameElement.remove();
		}
		_applyRange(write) {
			write();
			this._showRange();
			this._nameToggle();
			this._setSelectEndDate(false);
		}
		_originalDefault() {
			return ORIGINAL_DEFAULT$1;
		}
		_setSelectEndDate(value) {
			if (this._selectEndDate === value) return;
			this._selectEndDate = value;
			this._calendar?.setSelectEndDate(value);
			this._syncPickMessages();
		}
		_pickMessages() {
			if (!this._footerTemplate && this._toggleElement && this._selectEndDate && this.getStartDate()) return {
				ariaSelectedDateAnnouncement: "",
				ariaSelectedRangeAnnouncement: ""
			};
			const { ariaSelectedDateAnnouncement = Calendar.Default.ariaSelectedDateAnnouncement, ariaSelectedRangeAnnouncement = Calendar.Default.ariaSelectedRangeAnnouncement } = this._forwardConfig(Calendar, {}, this._config.calendarOptions);
			return {
				ariaSelectedDateAnnouncement,
				ariaSelectedRangeAnnouncement
			};
		}
		_syncPickMessages() {
			queueMicrotask(() => this._calendar?._setAnnouncements(this._pickMessages()));
		}
		_showRange() {
			this._calendar?.setRange(this.getStartDate(), this.getEndDate());
		}
		_createDateRangePicker() {
			this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_RANGE_PICKER, CLASS_NAME_PICKER$1);
			this._element.setAttribute("role", "group");
			const describedBy = this._element.getAttribute("aria-describedby");
			const inputGroup = document.createElement("div");
			if (describedBy !== null) {
				inputGroup.setAttribute("aria-describedby", describedBy);
				this._writeAdoptedAttribute(this._element, "aria-describedby", null);
			}
			this._element.append(inputGroup);
			this._frameElement = inputGroup;
			const format = getPickerFormat(this._config.format, this._config.selectionType);
			this._rangeInput = new DateRangeInput(inputGroup, this._forwardConfig(DateRangeInput, {
				disabled: this._config.disabled,
				endDate: this._config.endDate,
				locale: this._config.locale,
				size: this._config.size,
				startDate: this._config.startDate,
				validationState: null,
				...format ? { format } : {}
			}, { inputOptions: this._config.inputOptions }));
			inputGroup.setAttribute("role", "none");
			this._validation.adopt(this._rangeInput._validation);
			EventHandler.on(inputGroup, DateRangeInput.eventName("startDateChange"), (event) => {
				this._nameToggle();
				this._syncPickMessages();
				if (this._calendar && !isSameDateAs(this._calendar._startDate, event.date)) this._calendar.setStartDate(event.date);
				this._triggerDateChange(EVENT_START_DATE_CHANGE, event.date);
			});
			EventHandler.on(inputGroup, DateRangeInput.eventName("endDateChange"), (event) => {
				this._nameToggle();
				if (this._calendar && !isSameDateAs(this._calendar._endDate, event.date)) this._calendar.setEndDate(event.date);
				this._triggerDateChange(EVENT_END_DATE_CHANGE, event.date);
			});
			if (this._config.cleaner) {
				this._cleanerElement = this._createAction(CLASS_NAME_CLEANER$2, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				inputGroup.append(this._cleanerElement);
			}
			this._toggleElement = null;
			if (this._config.pickerIcon) {
				this._toggleElement = this._createAction(CLASS_NAME_INDICATOR$1, this._config.pickerIcon === true ? CALENDAR_ICON : this._config.pickerIcon, this._config.ariaPickerLabel);
				inputGroup.append(this._toggleElement);
			}
			const body = document.createElement("div");
			body.classList.add(CLASS_NAME_BODY$1);
			if (this._rangesTemplate) {
				const ranges = document.createElement("div");
				ranges.classList.add(CLASS_NAME_RANGES);
				ranges.append(this._rangesTemplate.content.cloneNode(true));
				body.append(ranges);
			}
			const calendars = document.createElement("div");
			calendars.classList.add(CLASS_NAME_CALENDARS);
			this._calendarElement = document.createElement("div");
			this._calendarElement.classList.add(CLASS_NAME_CALENDAR);
			calendars.append(this._calendarElement);
			body.append(calendars);
			this._createMenu(CLASS_NAME_DATE_PICKER, body);
		}
		_ensureCalendar() {
			if (this._calendar) return;
			this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
				calendars: this._config.calendars,
				endDate: this.getEndDate(),
				locale: this._config.locale,
				range: true,
				selectEndDate: this._selectEndDate,
				startDate: this.getStartDate()
			}, {
				...this._config.calendarOptions,
				...this._pickMessages()
			}));
			EventHandler.on(this._calendar._element, "selectEndChange.coreui.calendar", (event) => {
				this._selectEndDate = event.value;
				this._syncPickMessages();
			});
			EventHandler.on(this._calendar._element, "startDateChange.coreui.calendar", (event) => {
				this._runAsUser(() => this._rangeInput.setRange(event.dateObject, this.getEndDate(), true));
			});
			EventHandler.on(this._calendar._element, "endDateChange.coreui.calendar", (event) => {
				this._runAsUser(() => this._rangeInput.setRange(this.getStartDate(), event.dateObject, true));
				if (this.getEndDate() && this.getStartDate() && !this._footerTemplate) this.hide();
			});
		}
		_nameToggle() {
			if (!this._toggleElement) return;
			const start = this.getStartDate();
			const end = this.getEndDate();
			const name = start && end && formatSelectionRangeName(start, end, this._forwardConfig(Calendar, { locale: this._config.locale }, this._config.calendarOptions));
			this._toggleElement.setAttribute("aria-label", name ? `${this._config.ariaPickerLabel}, ${name}` : this._config.ariaPickerLabel);
		}
		_triggerDateChange(eventName, date) {
			EventHandler.trigger(this._element, eventName, {
				date,
				formattedDate: getDateBySelectionType(date, this._config.selectionType)
			});
		}
		_addEventListeners() {
			super._addEventListeners();
			const eventName = this.constructor.eventName("focusin");
			EventHandler.on(this._rangeInput.getStartElement(), eventName, () => {
				this._setSelectEndDate(false);
			});
			EventHandler.on(this._rangeInput.getEndElement(), eventName, () => {
				this._setSelectEndDate(true);
			});
		}
		_onPopupShow() {
			this._ensureCalendar();
		}
		_popupAnchor() {
			return this._frameElement;
		}
		_isNowSelectable() {
			return this._rangeInput.isDateSelectable(/* @__PURE__ */ new Date());
		}
		_stateFrames() {
			return [this._element];
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, DateRangePicker, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$13, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_DATE_RANGE_PICKER)) DateRangePicker.getOrCreateInstance(element);
	});
	defineJQueryPlugin(DateRangePicker);
	//#endregion
	//#region js/src/util/legacy-markup.ts
	const ATTRIBUTE_SHELL = "data-coreui-legacy-shell";
	const SKIPPED_ATTRIBUTES = /* @__PURE__ */ new Set([
		"aria-hidden",
		"aria-modal",
		"class",
		"role",
		"style",
		"tabindex"
	]);
	const SKIPPED_CLASSES = /* @__PURE__ */ new Set([
		"fade",
		"hiding",
		"show",
		"showing"
	]);
	const MODAL_WRAPPER_CLASS_MAP = /* @__PURE__ */ new Map([
		["modal-dialog", ""],
		["modal-dialog-centered", ""],
		["modal-dialog-scrollable", "modal-scrollable"]
	]);
	const RESPONSIVE_SUFFIXES = /* @__PURE__ */ new Set([
		"sm",
		"md",
		"lg",
		"xl",
		"xxl"
	]);
	const matchesComponent = (element, name) => element.classList.contains(name) || [...element.classList].some((className) => className.startsWith(`${name}-`) && RESPONSIVE_SUFFIXES.has(className.slice(name.length + 1)));
	const migrateClasses = (dialog, element) => {
		for (const className of element.classList) if (!SKIPPED_CLASSES.has(className)) dialog.classList.add(className);
	};
	const migrate = (element, name) => {
		const dialog = document.createElement("dialog");
		for (const attribute of element.attributes) if (!SKIPPED_ATTRIBUTES.has(attribute.name)) dialog.setAttribute(attribute.name, attribute.value);
		migrateClasses(dialog, element);
		if (name === "modal") {
			if (!element.classList.contains("fade")) dialog.classList.add("modal-instant");
			const wrapper = element.querySelector(".modal-dialog");
			if (wrapper) for (const className of wrapper.classList) {
				const mapped = MODAL_WRAPPER_CLASS_MAP.get(className) ?? className;
				if (mapped) dialog.classList.add(mapped);
			}
			const content = element.querySelector(".modal-content") ?? wrapper ?? element;
			dialog.append(...content.childNodes);
		} else dialog.append(...element.childNodes);
		while (element.attributes.length > 0) element.removeAttribute(element.attributes[0].name);
		element.setAttribute(ATTRIBUTE_SHELL, name);
		element.style.display = "contents";
		element.replaceChildren(dialog);
		console.warn(`CoreUI ${name}: legacy v5 markup detected and upgraded to the native <dialog> structure at runtime. Update the markup to the v6 structure — this automatic migration will be removed in v7. See https://coreui.io/docs/migration/`, element);
		return dialog;
	};
	const unwrapLegacyShell = (element, name) => {
		const resolved = getElement(element);
		if (resolved && resolved.getAttribute(ATTRIBUTE_SHELL) === name) return resolved.querySelector("dialog");
		return resolved;
	};
	const resolveDialogElement = (element, name) => {
		const resolved = getElement(element);
		if (!resolved || resolved instanceof HTMLDialogElement) return resolved;
		if (resolved.getAttribute(ATTRIBUTE_SHELL) === name) return resolved.querySelector("dialog");
		if (resolved instanceof HTMLElement && matchesComponent(resolved, name)) return migrate(resolved, name);
		return resolved;
	};
	//#endregion
	//#region js/src/dialog-base.ts
	const CLASS_NAME_OPEN = "dialog-open";
	const CLASS_NAME_HIDING = "hiding";
	const SELECTOR_NAVBAR_EXPAND = ".navbar[class*=\"navbar-expand\"]";
	const POPUP_DATA_KEYS = [
		"coreui.autocomplete",
		"coreui.combobox",
		"coreui.context-menu",
		"coreui.date-picker",
		"coreui.date-range-picker",
		"coreui.dropdown",
		"coreui.menu",
		"coreui.multi-select",
		"coreui.time-picker"
	];
	var DialogBase = class extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._isTransitioning = false;
			this._openedAsModal = false;
			this._closedByComponent = false;
			this._hiddenByComponent = !this._element?.open;
			this._resizeObserver = null;
			this._resizeFrame = null;
			this._addDialogListeners();
		}
		static get NAME() {
			return "dialogbase";
		}
		static getInstance(element) {
			return super.getInstance(unwrapLegacyShell(element, this.NAME));
		}
		toggle(relatedTarget) {
			return this._element.open ? this.hide() : this.show(relatedTarget);
		}
		async show(relatedTarget) {
			if (!this._canShow(relatedTarget)) return;
			await this._show(relatedTarget);
		}
		async hide() {
			if (!this._canHide()) return;
			await this._hide();
		}
		_canShow(relatedTarget) {
			if (this._element.open || this._isTransitioning) return false;
			return !EventHandler.trigger(this._element, this.constructor.eventName("show"), { relatedTarget }).defaultPrevented;
		}
		async _show(relatedTarget) {
			this._isTransitioning = true;
			this._hiddenByComponent = false;
			this._onBeforeShow();
			const { modal, preventBodyScroll } = this._getShowOptions();
			this._showElement({
				modal,
				preventBodyScroll
			});
			await this._queueCallback(() => {
				this._isTransitioning = false;
				EventHandler.trigger(this._element, this.constructor.eventName("shown"), { relatedTarget });
			}, this._element, this._isAnimated());
		}
		_canHide() {
			if (!this._element.open || this._isTransitioning) return false;
			return !EventHandler.trigger(this._element, this.constructor.eventName("hide")).defaultPrevented;
		}
		async _hide() {
			this._isTransitioning = true;
			this._hiddenByComponent = true;
			this._hideElement();
			await this._queueCallback(() => {
				this._closeAndCleanup();
				this._finishHide();
			}, this._element, this._isAnimated());
		}
		dispose() {
			this._resizeObserver?.disconnect();
			if (this._resizeFrame !== null) cancelAnimationFrame(this._resizeFrame);
			if (this._element.open) this._closeAndCleanup();
			this._element.classList.remove(CLASS_NAME_HIDING);
			EventHandler.off(this._element, "cancel", this._cancelHandler);
			EventHandler.off(this._element, "close", this._closeHandler);
			super.dispose();
		}
		_getShowOptions() {
			return {
				modal: true,
				preventBodyScroll: true
			};
		}
		_onBeforeShow() {}
		_onAfterHide() {}
		_onCancel() {}
		_isAnimated() {
			return !this._element.classList.contains(`${this.constructor.NAME}-instant`);
		}
		_shouldDeferClose() {
			return false;
		}
		_showElement({ modal = true, preventBodyScroll = true } = {}) {
			this._openedAsModal = modal;
			this._element.classList.toggle(`${this.constructor.NAME}-no-backdrop`, modal && !this._config.backdrop);
			if (modal) this._element.showModal();
			else this._element.show();
			if (preventBodyScroll) document.documentElement.classList.add(CLASS_NAME_OPEN);
		}
		_hideElement() {
			this._hideChildComponents();
			this._element.classList.add(CLASS_NAME_HIDING);
			if (!this._shouldDeferClose()) this._closeAndCleanup();
		}
		_closeAndCleanup() {
			if (this._element.open) {
				this._closedByComponent = true;
				this._element.close();
			}
			holdAnnouncements();
			this._openedAsModal = false;
			if (!document.querySelector("dialog[open]:modal")) document.documentElement.classList.remove(CLASS_NAME_OPEN);
		}
		_finishHide() {
			this._element.classList.remove(CLASS_NAME_HIDING);
			this._onAfterHide();
			this._isTransitioning = false;
			EventHandler.trigger(this._element, this.constructor.eventName("hidden"));
		}
		_triggerBackdropTransition() {
			if (EventHandler.trigger(this._element, this.constructor.eventName("hidePrevented")).defaultPrevented) return;
			const staticClass = `${this.constructor.NAME}-static`;
			this._element.classList.add(staticClass);
			this._queueCallback(() => {
				this._element.classList.remove(staticClass);
			}, this._element);
		}
		_hideChildComponents() {
			for (const element of SelectorEngine.find("[data-coreui-toggle=\"tooltip\"], [data-coreui-toggle=\"popover\"]", this._element)) {
				const instance = data_default.get(element, "coreui.tooltip") ?? data_default.get(element, "coreui.popover");
				if (instance && typeof instance.hide === "function") instance.hide();
			}
			for (const element of SelectorEngine.find("*", this._element)) for (const key of POPUP_DATA_KEYS) {
				const instance = data_default.get(element, key);
				if (instance && typeof instance.hide === "function") instance.hide();
			}
			for (const element of SelectorEngine.find(".toast.show", this._element)) {
				const instance = data_default.get(element, "coreui.toast");
				if (instance && typeof instance.hide === "function") instance.hide();
			}
		}
		_initResizeObserver() {
			const navbar = this._element?.classList.contains(this.constructor.NAME) && this._element.closest(SELECTOR_NAVBAR_EXPAND);
			if (!navbar || typeof ResizeObserver === "undefined") return;
			const hideWhenInline = () => {
				if (this._isTransitioning) {
					this._resizeFrame = requestAnimationFrame(hideWhenInline);
					return;
				}
				this._resizeFrame = null;
				if (this._element.open && getComputedStyle(this._element).position !== "fixed") this.hide();
			};
			this._resizeObserver = new ResizeObserver(() => {
				if (this._resizeFrame !== null) cancelAnimationFrame(this._resizeFrame);
				this._resizeFrame = requestAnimationFrame(hideWhenInline);
			});
			this._resizeObserver.observe(navbar);
		}
		_addDialogListeners() {
			const eventKey = this.constructor.EVENT_KEY;
			this._cancelHandler = (event) => {
				event.preventDefault();
				if (!this._config.keyboard) {
					this._triggerBackdropTransition();
					return;
				}
				this._onCancel();
				this.hide();
			};
			EventHandler.on(this._element, "cancel", this._cancelHandler);
			this._closeHandler = () => {
				if (this._closedByComponent) {
					this._closedByComponent = false;
					return;
				}
				if (this._hiddenByComponent || this._element.open) return;
				this._hideChildComponents();
				this._closeAndCleanup();
				this._finishHide();
			};
			EventHandler.on(this._element, "close", this._closeHandler);
			EventHandler.on(this._element, `keydown${eventKey}`, (event) => {
				if (event.key !== "Escape" || this._openedAsModal) return;
				event.preventDefault();
				if (!this._config.keyboard) return;
				this._onCancel();
				this.hide();
			});
			EventHandler.on(this._element, `click${eventKey}`, (event) => {
				if (event.target !== this._element || !this._openedAsModal) return;
				if (this._config.backdrop === "static") {
					this._triggerBackdropTransition();
					return;
				}
				if (this._config.backdrop) this.hide();
			});
		}
	};
	//#endregion
	//#region js/src/dialog.ts
	const NAME$31 = "dialog";
	const EVENT_KEY$24 = `.coreui.dialog`;
	const DATA_API_KEY$19 = ".data-api";
	const EVENT_SHOW$5 = `show${EVENT_KEY$24}`;
	const EVENT_SHOWN$5 = `shown${EVENT_KEY$24}`;
	const EVENT_HIDDEN$8 = `hidden${EVENT_KEY$24}`;
	const EVENT_CANCEL$1 = `cancel${EVENT_KEY$24}`;
	const EVENT_CLICK_DATA_API$11 = `click${EVENT_KEY$24}${DATA_API_KEY$19}`;
	const CLASS_NAME_NONMODAL$1 = "dialog-nonmodal";
	const CLASS_NAME_INSTANT$3 = "dialog-instant";
	const CLASS_NAME_SWAP_IN$1 = "dialog-swap-in";
	const SELECTOR_DATA_TOGGLE$9 = "[data-coreui-toggle=\"dialog\"]";
	const Default$27 = {
		backdrop: true,
		keyboard: true,
		modal: true
	};
	const DefaultType$26 = {
		backdrop: "(boolean|string)",
		keyboard: "boolean",
		modal: "boolean"
	};
	var Dialog = class Dialog extends DialogBase {
		static get Default() {
			return Default$27;
		}
		static get DefaultType() {
			return DefaultType$26;
		}
		static get NAME() {
			return NAME$31;
		}
		handleUpdate() {}
		dispose() {
			this._element.classList.remove(CLASS_NAME_SWAP_IN$1);
			super.dispose();
		}
		_getShowOptions() {
			return {
				modal: this._config.modal,
				preventBodyScroll: this._config.modal
			};
		}
		_onBeforeShow() {
			if (!this._config.modal) this._element.classList.add(CLASS_NAME_NONMODAL$1);
		}
		_onAfterHide() {
			this._element.classList.remove(CLASS_NAME_NONMODAL$1);
		}
		_shouldDeferClose() {
			return this._isAnimated();
		}
		_onCancel() {
			EventHandler.trigger(this._element, EVENT_CANCEL$1);
		}
		static {
			EventHandler.on(document, EVENT_CLICK_DATA_API$11, SELECTOR_DATA_TOGGLE$9, function(event) {
				Dialog._handleDataApiClick(this, event);
			});
		}
		static jQueryInterface(config, relatedTarget) {
			return jQueryDispatch(this, Dialog, config, [relatedTarget]);
		}
		static _handleDataApiClick(trigger, event) {
			const target = SelectorEngine.getElementFromSelector(trigger);
			if (!target) return;
			if (["A", "AREA"].includes(trigger.tagName)) event.preventDefault();
			const currentDialog = trigger.closest("dialog[open]");
			const currentInstance = currentDialog && currentDialog !== target ? Dialog.getInstance(currentDialog) : null;
			if (!currentDialog || !currentInstance) {
				EventHandler.one(target, EVENT_SHOW$5, (showEvent) => {
					if (!showEvent.defaultPrevented) Dialog._registerFocusRestoration(target, trigger);
				});
				Dialog.getOrCreateInstance(target).toggle(trigger);
				return;
			}
			if (currentDialog.classList.contains(CLASS_NAME_SWAP_IN$1)) return;
			const newDialog = Dialog.getOrCreateInstance(target);
			if (!newDialog._canShow(trigger) || !currentInstance._canHide()) return;
			Dialog._registerFocusRestoration(target, trigger);
			target.classList.add(CLASS_NAME_SWAP_IN$1);
			EventHandler.one(target, EVENT_SHOWN$5, () => {
				target.classList.remove(CLASS_NAME_SWAP_IN$1);
			});
			newDialog._show(trigger);
			currentDialog.classList.add(CLASS_NAME_INSTANT$3);
			EventHandler.one(currentDialog, EVENT_HIDDEN$8, () => {
				currentDialog.classList.remove(CLASS_NAME_INSTANT$3);
			});
			currentInstance._hide();
		}
		static _registerFocusRestoration(target, trigger) {
			EventHandler.one(target, EVENT_HIDDEN$8, () => {
				if (isVisible(trigger)) trigger.focus({ preventScroll: true });
			});
		}
	};
	enableDismissTrigger(Dialog);
	defineJQueryPlugin(Dialog);
	//#endregion
	//#region js/src/drawer.ts
	const NAME$30 = "drawer";
	const EVENT_KEY$23 = `.coreui.drawer`;
	const DATA_API_KEY$18 = ".data-api";
	const EVENT_LOAD_DATA_API$12 = `load${EVENT_KEY$23}${DATA_API_KEY$18}`;
	const EVENT_HIDDEN$7 = `hidden${EVENT_KEY$23}`;
	const EVENT_RESIZE$3 = `resize${EVENT_KEY$23}`;
	const EVENT_CLICK_DATA_API$10 = `click${EVENT_KEY$23}${DATA_API_KEY$18}`;
	const OPEN_SELECTOR$1 = "dialog[open]:is(.drawer, [class^=\"drawer-\"], [class*=\" drawer-\"])";
	const SELECTOR_OPEN_RESPONSIVE$1 = "dialog[open]:not(.drawer):is([class^=\"drawer-\"], [class*=\" drawer-\"])";
	const SELECTOR_DATA_TOGGLE$8 = "[data-coreui-toggle=\"drawer\"]";
	const SELECTOR_DISMISS_SCOPE$1 = ".drawer, .drawer-sm, .drawer-md, .drawer-lg, .drawer-xl, .drawer-2xl";
	const Default$26 = {
		backdrop: true,
		keyboard: true,
		scroll: false
	};
	const DefaultType$25 = {
		backdrop: "(boolean|string)",
		keyboard: "boolean",
		scroll: "boolean"
	};
	var Drawer = class Drawer extends DialogBase {
		constructor(element, config) {
			super(element, config);
			this._initResizeObserver();
		}
		static get Default() {
			return Default$26;
		}
		static get DefaultType() {
			return DefaultType$25;
		}
		static get NAME() {
			return NAME$30;
		}
		_getShowOptions() {
			return {
				modal: Boolean(this._config.backdrop) || !this._config.scroll,
				preventBodyScroll: !this._config.scroll
			};
		}
		_shouldDeferClose() {
			return this._isAnimated();
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Drawer, config, (element) => [element]);
		}
	};
	EventHandler.on(document, EVENT_CLICK_DATA_API$10, SELECTOR_DATA_TOGGLE$8, function(event) {
		const target = SelectorEngine.getElementFromSelector(this);
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if (isDisabled(this)) return;
		EventHandler.one(target, EVENT_HIDDEN$7, () => {
			if (isVisible(this)) this.focus({ preventScroll: true });
		});
		const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
		if (alreadyOpen && alreadyOpen !== target) Drawer.getInstance(alreadyOpen)?.hide();
		Drawer.getOrCreateInstance(target).toggle(this);
	});
	EventHandler.on(window, EVENT_LOAD_DATA_API$12, () => {
		for (const selector of SelectorEngine.find(OPEN_SELECTOR$1)) Drawer.getOrCreateInstance(selector).show();
	});
	EventHandler.on(window, EVENT_RESIZE$3, () => {
		for (const element of SelectorEngine.find(SELECTOR_OPEN_RESPONSIVE$1)) if (getComputedStyle(element).position !== "fixed") Drawer.getOrCreateInstance(element).hide();
	});
	enableDismissTrigger(Drawer, "hide", SELECTOR_DISMISS_SCOPE$1);
	defineJQueryPlugin(Drawer);
	//#endregion
	//#region js/src/dropdown.ts
	const NAME$29 = "dropdown";
	const EVENT_KEY$22 = `.coreui.dropdown`;
	const DATA_API_KEY$17 = ".data-api";
	const ARROW_DOWN_KEY$4 = "ArrowDown";
	const EVENT_CLICK_DATA_API$9 = `click${EVENT_KEY$22}${DATA_API_KEY$17}`;
	const EVENT_KEYDOWN_DATA_API$1 = `keydown${EVENT_KEY$22}${DATA_API_KEY$17}`;
	const CLASS_NAME_DROPUP = "dropup";
	const CLASS_NAME_DROPEND = "dropend";
	const CLASS_NAME_DROPSTART = "dropstart";
	const CLASS_NAME_DROPUP_CENTER = "dropup-center";
	const CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
	const SELECTOR_NAVBAR = ".navbar";
	const PLACEMENT_TOP = "top-start";
	const PLACEMENT_TOPEND = "top-end";
	const PLACEMENT_BOTTOM = "bottom-start";
	const PLACEMENT_BOTTOMEND = "bottom-end";
	const PLACEMENT_END = "right-start";
	const PLACEMENT_START = "left-start";
	const PLACEMENT_TOPCENTER = "top";
	const PLACEMENT_BOTTOMCENTER = "bottom";
	const Default$25 = {
		...Menu.Default,
		placement: null
	};
	const DefaultType$24 = {
		...Menu.DefaultType,
		placement: "(null|string)"
	};
	var Dropdown = class Dropdown extends Menu {
		constructor(element, config) {
			super(element, config);
			this._inNavbar = this._detectNavbar();
		}
		static get SELECTOR_DATA_TOGGLE() {
			return "[data-coreui-toggle=\"dropdown\"]:not(.disabled):not(:disabled)";
		}
		static get SELECTOR_MENU() {
			return ".dropdown-menu";
		}
		static get SELECTOR_VISIBLE_ITEMS() {
			return ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
		}
		static get Default() {
			return Default$25;
		}
		static get DefaultType() {
			return DefaultType$24;
		}
		static get NAME() {
			return NAME$29;
		}
		update() {
			this._inNavbar = this._detectNavbar();
			super.update();
		}
		_getPlacement() {
			if (this._config.placement) return super._getPlacement();
			const parentDropdown = this._parent;
			const rtl = isRTL(this._element);
			if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) return rtl ? PLACEMENT_START : PLACEMENT_END;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) return rtl ? PLACEMENT_END : PLACEMENT_START;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) return PLACEMENT_TOPCENTER;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) return PLACEMENT_BOTTOMCENTER;
			const isEnd = getComputedStyle(this._menu).getPropertyValue("--cui-position").trim() === "end";
			if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
			return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
		}
		_createFloating() {
			if (this._isStatic()) {
				Manipulator.setDataAttribute(this._menu, "popper", "static");
				Manipulator.setDataAttribute(this._menu, "placement", this._getPlacement());
				return;
			}
			super._createFloating();
		}
		async _updateFloatingPosition(referenceElement = null) {
			if (this._isStatic()) {
				Manipulator.setDataAttribute(this._menu, "placement", this._getPlacement());
				return;
			}
			return super._updateFloatingPosition(referenceElement);
		}
		_isStatic() {
			return this._inNavbar || this._config.display === "static";
		}
		_removeMenuAttributes() {
			super._removeMenuAttributes();
			Manipulator.removeDataAttribute(this._menu, "popper");
		}
		_selectMenuItem({ key, target }) {
			const items = SelectorEngine.find(this.constructor.SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => isVisible(element));
			if (!items.length) return;
			getNextActiveElement(items, target, key === ARROW_DOWN_KEY$4, !items.includes(target)).focus();
		}
		_detectNavbar() {
			return this._element.closest(SELECTOR_NAVBAR) !== null;
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Dropdown, config);
		}
	};
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API$1, Dropdown.SELECTOR_DATA_TOGGLE, (event) => Dropdown.dataApiKeydownHandler(event));
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API$1, Dropdown.SELECTOR_MENU, (event) => Dropdown.dataApiKeydownHandler(event));
	EventHandler.on(document, EVENT_CLICK_DATA_API$9, Dropdown.SELECTOR_DATA_TOGGLE, function(event) {
		event.preventDefault();
		Dropdown.getOrCreateInstance(this).toggle();
	});
	defineJQueryPlugin(Dropdown);
	//#endregion
	//#region js/src/form.ts
	const NAME$28 = "form";
	const EVENT_KEY$21 = `.coreui.form`;
	const DATA_API_KEY$16 = ".data-api";
	const EVENT_INPUT$9 = `input${EVENT_KEY$21}`;
	const EVENT_RESET$3 = `reset${EVENT_KEY$21}`;
	const EVENT_SUBMIT_DATA_API = `submit${EVENT_KEY$21}${DATA_API_KEY$16}`;
	const EVENT_VALIDATE = `validate${EVENT_KEY$21}`;
	const SELECTOR_DATA_VALIDATE = "form[data-coreui-validate][novalidate]";
	var Form = class Form extends BaseComponent {
		constructor(element) {
			super(element);
			this._validated = false;
			this._validatedSinceReset = false;
			this._validationMarks = /* @__PURE__ */ new WeakMap();
			EventHandler.on(this._element, EVENT_RESET$3, (event) => {
				this._validatedSinceReset = false;
				setTimeout(() => {
					if (this._element && !event.defaultPrevented && !this._validatedSinceReset) this.reset();
				});
			});
		}
		static get NAME() {
			return NAME$28;
		}
		validate() {
			return this._validate().isValid;
		}
		reset() {
			EventHandler.off(this._element, EVENT_INPUT$9);
			clearValidationState(this._element, this._validationMarks);
			this._validated = false;
		}
		dispose() {
			this.reset();
			super.dispose();
		}
		_validate() {
			const result = validateForm(this._element, this._validationMarks, (isValid) => EventHandler.trigger(this._element, EVENT_VALIDATE, { isValid }).defaultPrevented);
			if (result.handled) {
				this._validatedSinceReset = true;
				if (!this._validated) {
					this._validated = true;
					EventHandler.on(this._element, EVENT_INPUT$9, () => updateValidationState(this._element, this._validationMarks));
				}
			}
			return result;
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Form, config);
		}
	};
	EventHandler.on(document, EVENT_SUBMIT_DATA_API, SELECTOR_DATA_VALIDATE, function(event) {
		if (event.submitter?.hasAttribute("formnovalidate")) return;
		const { handled, isValid } = Form.getOrCreateInstance(this)._validate();
		if (handled && !isValid) event.preventDefault();
	});
	defineJQueryPlugin(Form);
	//#endregion
	//#region js/src/loading-button.ts
	const NAME$27 = "loading-button";
	const EVENT_KEY$20 = `.coreui.loading-button`;
	const DATA_API_KEY$15 = ".data-api";
	const EVENT_START = `start${EVENT_KEY$20}`;
	const EVENT_STOP = `stop${EVENT_KEY$20}`;
	const EVENT_CLICK$9 = "click";
	const EVENT_CLICK_DATA_API$8 = `click${EVENT_KEY$20}${DATA_API_KEY$15}`;
	const CLASS_NAME_DISABLED$4 = "disabled";
	const CLASS_NAME_IS_LOADING = "is-loading";
	const CLASS_NAME_LOADING_BUTTON = "btn-loading";
	const CLASS_NAME_LOADING_BUTTON_SPINNER = "btn-loading-spinner";
	const SELECTOR_HIDDEN_CONTENT = `[aria-hidden="true"], [hidden], .${CLASS_NAME_LOADING_BUTTON_SPINNER}`;
	const SELECTOR_DATA_TOGGLE$7 = "[data-coreui-toggle=\"loading-button\"]";
	const Default$24 = {
		ariaLoadingLabel: "Loading",
		disabledOnLoading: false,
		spinner: true,
		spinnerType: "border",
		timeout: false
	};
	const DefaultType$23 = {
		ariaLoadingLabel: "string",
		disabledOnLoading: "boolean",
		spinner: "boolean",
		spinnerType: "string",
		timeout: "(boolean|number)"
	};
	var LoadingButton = class LoadingButton extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._startTimeout = null;
			this._timeout = null;
			this._spinner = null;
			this._state = "idle";
			this._handleClick = (event) => this._blockClick(event);
			this._blocked = false;
			this._announcement = null;
			this._createButton();
			this._element.addEventListener(EVENT_CLICK$9, this._handleClick, true);
		}
		static get Default() {
			return Default$24;
		}
		static get DefaultType() {
			return DefaultType$23;
		}
		static get NAME() {
			return NAME$27;
		}
		start() {
			if (this._state === "loading") return;
			this._createSpinner();
			this._state = "loading";
			this._startTimeout = setTimeout(() => {
				this._element.classList.add(CLASS_NAME_IS_LOADING);
				if (this._config.disabledOnLoading) this._block();
				this._announcement = this._announce([this._getName(), this._config.ariaLoadingLabel].filter(Boolean).join(", "), "high");
				EventHandler.trigger(this._element, EVENT_START);
			}, 1);
			if (this._config.timeout) this._timeout = setTimeout(() => {
				this.stop();
			}, this._config.timeout);
		}
		stop() {
			if (this._state !== "loading") return;
			this._clearTimeouts();
			this._element.classList.remove(CLASS_NAME_IS_LOADING);
			const stoped = () => {
				this._removeSpinner();
				this._state = "idle";
				this._unblock();
				if (this._announcement) {
					this._announcement();
					this._announcement = null;
					this._announce(this._getName(), "normal");
				}
				EventHandler.trigger(this._element, EVENT_STOP);
			};
			if (this._spinner) {
				this._queueCallback(stoped, this._spinner, true);
				return;
			}
			stoped();
		}
		dispose() {
			this._clearTimeouts();
			this._unblock();
			this._spinner?.remove();
			this._announcement?.();
			this._element.removeEventListener(EVENT_CLICK$9, this._handleClick, true);
			this._element.classList.remove(CLASS_NAME_IS_LOADING);
			super.dispose();
		}
		_announce(message, priority) {
			if (!message || this._element.getRootNode().activeElement !== this._element) return null;
			return announce(message, {
				context: this._element,
				priority
			});
		}
		_block() {
			if (this._element.classList.contains(CLASS_NAME_DISABLED$4) || this._element.getAttribute("aria-disabled") === "true") return;
			this._element.classList.add(CLASS_NAME_DISABLED$4);
			this._element.setAttribute("aria-disabled", "true");
			this._blocked = true;
		}
		_blockClick(event) {
			if (this._blocked) {
				event.preventDefault();
				event.stopImmediatePropagation();
			}
		}
		_clearTimeouts() {
			if (this._startTimeout) {
				clearTimeout(this._startTimeout);
				this._startTimeout = null;
			}
			if (this._timeout) {
				clearTimeout(this._timeout);
				this._timeout = null;
			}
		}
		_createButton() {
			this._element.classList.add(CLASS_NAME_LOADING_BUTTON);
		}
		_createSpinner() {
			if (this._config.spinner) {
				const spinner = document.createElement("span");
				const type = this._config.spinnerType;
				spinner.classList.add(CLASS_NAME_LOADING_BUTTON_SPINNER, `spinner-${type}`);
				if (this._config.ariaLoadingLabel) {
					spinner.setAttribute("role", "img");
					spinner.setAttribute("aria-label", this._config.ariaLoadingLabel);
				} else spinner.setAttribute("aria-hidden", "true");
				this._element.insertBefore(spinner, this._element.firstChild);
				this._spinner = spinner;
			}
		}
		_getName() {
			const root = this._element.getRootNode();
			const ids = this._element.getAttribute("aria-labelledby");
			if (ids && (root instanceof Document || root instanceof ShadowRoot)) {
				const labelledBy = ids.split(/\s+/).map((id) => root.getElementById(id)?.textContent?.trim()).filter(Boolean).join(" ");
				if (labelledBy) return labelledBy;
			}
			const label = this._element.getAttribute("aria-label")?.trim();
			if (label) return label;
			const content = this._element.cloneNode(true);
			for (const hidden of content.querySelectorAll(SELECTOR_HIDDEN_CONTENT)) hidden.remove();
			return content.textContent?.trim() || this._element.getAttribute("title")?.trim() || "";
		}
		_unblock() {
			if (!this._blocked) return;
			this._element.classList.remove(CLASS_NAME_DISABLED$4);
			this._element.removeAttribute("aria-disabled");
			this._blocked = false;
		}
		_removeSpinner() {
			if (this._config.spinner) {
				this._spinner.remove();
				this._spinner = null;
			}
		}
		static loadingButtonInterface(element, config, ...args) {
			const data = LoadingButton.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, LoadingButton, config);
		}
	};
	EventHandler.on(document, EVENT_CLICK_DATA_API$8, SELECTOR_DATA_TOGGLE$7, (event) => {
		const button = event.target.closest(SELECTOR_DATA_TOGGLE$7);
		LoadingButton.getOrCreateInstance(button).start();
	});
	defineJQueryPlugin(LoadingButton);
	//#endregion
	//#region js/src/modal.ts
	const NAME$26 = "modal";
	const EVENT_KEY$19 = `.coreui.modal`;
	const DATA_API_KEY$14 = ".data-api";
	const EVENT_SHOW$4 = `show${EVENT_KEY$19}`;
	const EVENT_SHOWN$4 = `shown${EVENT_KEY$19}`;
	const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$19}`;
	const EVENT_CANCEL = `cancel${EVENT_KEY$19}`;
	const EVENT_CLICK_DATA_API$7 = `click${EVENT_KEY$19}${DATA_API_KEY$14}`;
	const CLASS_NAME_NONMODAL = "modal-nonmodal";
	const CLASS_NAME_INSTANT$2 = "modal-instant";
	const CLASS_NAME_SWAP_IN = "modal-swap-in";
	const SELECTOR_DATA_TOGGLE$6 = "[data-coreui-toggle=\"modal\"]";
	const Default$23 = {
		backdrop: true,
		keyboard: true,
		modal: true
	};
	const DefaultType$22 = {
		backdrop: "(boolean|string)",
		keyboard: "boolean",
		modal: "boolean"
	};
	var Modal = class Modal extends DialogBase {
		constructor(element, config) {
			super(resolveDialogElement(element, NAME$26), config);
		}
		static get Default() {
			return Default$23;
		}
		static get DefaultType() {
			return DefaultType$22;
		}
		static get NAME() {
			return NAME$26;
		}
		handleUpdate() {}
		dispose() {
			this._element.classList.remove(CLASS_NAME_SWAP_IN);
			super.dispose();
		}
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
			EventHandler.trigger(this._element, EVENT_CANCEL);
		}
		static {
			EventHandler.on(document, EVENT_CLICK_DATA_API$7, SELECTOR_DATA_TOGGLE$6, function(event) {
				Modal._handleDataApiClick(this, event);
			});
		}
		static jQueryInterface(config, relatedTarget) {
			return jQueryDispatch(this, Modal, config, [relatedTarget]);
		}
		static _handleDataApiClick(trigger, event) {
			const target = resolveDialogElement(SelectorEngine.getElementFromSelector(trigger), NAME$26);
			if (!target) return;
			if (["A", "AREA"].includes(trigger.tagName)) event.preventDefault();
			const currentDialog = trigger.closest("dialog[open]");
			const currentInstance = currentDialog && currentDialog !== target ? Modal.getInstance(currentDialog) : null;
			if (!currentDialog || !currentInstance) {
				EventHandler.one(target, EVENT_SHOW$4, (showEvent) => {
					if (!showEvent.defaultPrevented) Modal._registerFocusRestoration(target, trigger);
				});
				Modal.getOrCreateInstance(target).toggle(trigger);
				return;
			}
			if (currentDialog.classList.contains(CLASS_NAME_SWAP_IN)) return;
			const newModal = Modal.getOrCreateInstance(target);
			if (!newModal._canShow(trigger) || !currentInstance._canHide()) return;
			Modal._registerFocusRestoration(target, trigger);
			target.classList.add(CLASS_NAME_SWAP_IN);
			EventHandler.one(target, EVENT_SHOWN$4, () => {
				target.classList.remove(CLASS_NAME_SWAP_IN);
			});
			newModal._show(trigger);
			currentDialog.classList.add(CLASS_NAME_INSTANT$2);
			EventHandler.one(currentDialog, EVENT_HIDDEN$6, () => {
				currentDialog.classList.remove(CLASS_NAME_INSTANT$2);
			});
			currentInstance._hide();
		}
		static _registerFocusRestoration(target, trigger) {
			EventHandler.one(target, EVENT_HIDDEN$6, () => {
				if (isVisible(trigger)) trigger.focus({ preventScroll: true });
			});
		}
	};
	enableDismissTrigger(Modal);
	defineJQueryPlugin(Modal);
	//#endregion
	//#region js/src/multi-select.ts
	const NAME$25 = "multi-select";
	const DATA_KEY = "coreui.multi-select";
	const EVENT_KEY$18 = `.${DATA_KEY}`;
	const DATA_API_KEY$13 = ".data-api";
	const ARROW_DOWN_KEY$3 = "ArrowDown";
	const ARROW_LEFT_KEY$4 = "ArrowLeft";
	const ARROW_RIGHT_KEY$4 = "ArrowRight";
	const ARROW_UP_KEY$3 = "ArrowUp";
	const BACKSPACE_KEY$1 = "Backspace";
	const DELETE_KEY = "Delete";
	const ENTER_KEY$1 = "Enter";
	const ESCAPE_KEY$1 = "Escape";
	const TAB_KEY = "Tab";
	const RIGHT_MOUSE_BUTTON = 2;
	const SELECTOR_CHIP_REMOVE = ".chip-remove";
	const SELECTOR_CHIP = ".chip";
	const SELECTOR_CLEANER = ".form-control-cleaner";
	const SELECTOR_OPTION$1 = ".list-box-option";
	const SELECTOR_SEARCH$1 = ".multi-select-search";
	const SELECTOR_SELECT_ALL$1 = "[data-coreui-select-all]";
	const SELECTOR_TEXT_ENTRY = "input, textarea, select, [contenteditable=\"\"], [contenteditable=\"true\"]";
	const SELECTOR_DATA_MULTI_SELECT = "[data-coreui-multi-select]";
	const SELECTOR_SELECT = "select.multi-select";
	const SELECTOR_SELECTION = ".multi-select-selection";
	const EVENT_CHANGE$7 = `change${EVENT_KEY$18}`;
	const EVENT_CLICK$8 = `click${EVENT_KEY$18}`;
	const EVENT_FOCUS$3 = `focus${EVENT_KEY$18}`;
	const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$18}`;
	const EVENT_KEYDOWN$7 = `keydown${EVENT_KEY$18}`;
	const EVENT_INPUT$8 = `input${EVENT_KEY$18}`;
	const EVENT_SEARCH$1 = `search${EVENT_KEY$18}`;
	const EVENT_SELECTION_LIMIT = `selectionLimit${EVENT_KEY$18}`;
	const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$18}${DATA_API_KEY$13}`;
	const EVENT_KEYUP_DATA_API$1 = `keyup${EVENT_KEY$18}${DATA_API_KEY$13}`;
	const EVENT_LOAD_DATA_API$11 = `load${EVENT_KEY$18}${DATA_API_KEY$13}`;
	const EVENT_CHIP_REMOVE = "remove.coreui.chip";
	const CLASS_NAME_CHIP = "chip";
	const CLASS_NAME_CLEANER$1 = "form-control-cleaner";
	const CLASS_NAME_DISABLED$3 = "disabled";
	const CLASS_NAME_HEADER = "list-box-header";
	const CLASS_NAME_INPUT_GROUP$1 = "form-control-group";
	const CLASS_NAME_IS_INVALID = "is-invalid";
	const CLASS_NAME_IS_VALID = "is-valid";
	const CLASS_NAME_SELECT = "multi-select";
	const HOST_ATTRIBUTES$1 = ["id", "name"];
	const CLASS_NAME_SELECT_FILLED = "multi-select-filled";
	const CLASS_NAME_SELECT_ALL = "list-box-select-all";
	const CLASS_NAME_SEARCH = "multi-select-search";
	const CLASS_NAME_SELECTED$1 = "selected";
	const CLASS_NAME_INDETERMINATE = "indeterminate";
	const CLASS_NAME_SELECTION = "multi-select-selection";
	const CLASS_NAME_SELECTION_CHIPS = "multi-select-selection-chips";
	const CLASS_NAME_SHOW$8 = "show";
	const Default$22 = {
		allowList: DefaultAllowlist,
		ariaChipRemoveLabel: "Remove",
		ariaCleanerLabel: "Clear all selections",
		ariaPickerLabel: "Toggle options list",
		ariaRemovedAnnouncement: "removed",
		ariaSearchLabel: "Search",
		ariaTagDeleteLabel: null,
		cleaner: true,
		clearSearchOnSelect: false,
		container: false,
		deselectAllLabel: "Deselect all",
		deselectFilteredLabel: "Deselect filtered",
		disabled: false,
		globalSearch: true,
		headerTemplate: null,
		hideSelectAllOnSearchNoResults: true,
		id: null,
		indicator: "checkbox",
		invalid: false,
		loadingLabel: "Loading…",
		multiple: true,
		name: null,
		options: false,
		optionsGroupsSelectable: false,
		optionsGroupsTemplate: null,
		optionsMaxHeight: "auto",
		optionsTemplate: null,
		pickerIcon: true,
		placeholder: "Select...",
		required: false,
		resetSelectionOnOptionsChange: false,
		sanitize: true,
		sanitizeFn: null,
		search: false,
		searchNoResultsLabel: "No results found",
		selectAll: true,
		selectAllLabel: "Select all",
		selectAllMode: "all",
		selectedLabel: (count) => `${count} item(s) selected`,
		selectFilteredLabel: "Select filtered",
		selectionLimit: null,
		selectionType: "chips",
		total: null,
		valid: false,
		validationState: null,
		value: null
	};
	const DefaultType$21 = {
		allowList: "object",
		ariaChipRemoveLabel: "(string|function)",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		ariaRemovedAnnouncement: "(string|function)",
		ariaSearchLabel: "string",
		ariaTagDeleteLabel: "(string|null)",
		cleaner: "boolean",
		clearSearchOnSelect: "boolean",
		container: "(string|element|boolean)",
		deselectAllLabel: "string",
		deselectFilteredLabel: "string",
		disabled: "boolean",
		globalSearch: "boolean",
		headerTemplate: "(function|null)",
		hideSelectAllOnSearchNoResults: "boolean",
		id: "(string|null)",
		indicator: "string",
		invalid: "boolean",
		loadingLabel: "string",
		multiple: "boolean",
		name: "(string|null)",
		options: "(boolean|array)",
		optionsGroupsSelectable: "boolean",
		optionsGroupsTemplate: "(function|null)",
		optionsMaxHeight: "(number|string)",
		optionsTemplate: "(function|null)",
		pickerIcon: "(string|boolean)",
		placeholder: "string",
		required: "boolean",
		resetSelectionOnOptionsChange: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		search: "(boolean|string)",
		searchNoResultsLabel: "string",
		selectAll: "boolean",
		selectAllLabel: "string",
		selectAllMode: "string",
		selectedLabel: "(string|function)",
		selectFilteredLabel: "string",
		selectionLimit: "(number|null)",
		selectionType: "string",
		total: "(number|null|undefined)",
		valid: "boolean",
		validationState: "(string|null|undefined)",
		value: "(string|array|null)"
	};
	var MultiSelectChipSet = class extends ChipSet {
		_containerRole() {
			return null;
		}
	};
	var MultiSelect = class MultiSelect extends ComboboxBase {
		constructor(element, config) {
			super(element, config);
			this._hostAttributes = new Map(HOST_ATTRIBUTES$1.map((name) => [name, this._element.getAttribute(name)]));
			this._hostOptions = [...this._element.childNodes];
			this._validation = new FieldValidation(this._element, {
				aliases: true,
				config: () => this._config,
				canBlock: () => !this._disabled,
				fields: () => [this._element],
				frames: () => [this._wrapperElement],
				invalidTargets: () => [this._getFocusTarget()],
				owned: () => [this._element, this._searchElement].filter(Boolean),
				restore: () => this._restoreSelection()
			});
			this._indicatorElement = null;
			this._selectAllElement = null;
			this._dropdownHeaderElement = null;
			this._headerElement = null;
			this._selectionElement = null;
			this._selectionCleanerElement = null;
			this._searchElement = null;
			this._togglerElement = null;
			this._optionsElement = null;
			this._wrapperElement = null;
			this._menu = null;
			this._nativeFocusHandler = null;
			this._nativeKeydownHandler = null;
			this._initialSelection = [];
			this._known = /* @__PURE__ */ new Map();
			this._seenValues = /* @__PURE__ */ new Set();
			this._disabled = this._config.disabled;
			this._givenApplies = Boolean(this._config.value);
			this._givenValues = this._config.value ? new Set(this._config.value) : null;
			this._sourceOptions = this._config.options || this._getOptionsFromElement();
			this._total = this._config.total;
			this._store = createSelectionStore((next) => this._fit(next));
			this._options = this._getOptions();
			this._store.commit(this._markedValues());
			this._configureNativeSelect();
			this._floatingCleanup = null;
			this._anchoredPosition = null;
			this._search = "";
			this._loading = false;
			this._offListOptions = [];
			if (this._config.options.length > 0) this._createNativeOptions(this._element, this._options);
			this._createSelect();
			this._initialSelection = this._selectedOptions();
			this._addEventListeners();
			data_default.set(this._element, DATA_KEY, this);
		}
		static get Default() {
			return Default$22;
		}
		static get DefaultType() {
			return DefaultType$21;
		}
		static get NAME() {
			return NAME$25;
		}
		_escapeFocusTarget() {
			return this._config.search ? this._searchElement : this._togglerElement;
		}
		_getShowTarget() {
			return this._wrapperElement;
		}
		_afterShow() {
			if (!this._isShown()) return;
			this._focustrap = new FocusTrap({
				additionalElement: this._config.search ? this._searchElement : null,
				autofocus: false,
				trapElement: this._menu
			});
			this._focustrap.activate();
			this._pointerDownListener = (event) => {
				if (this._wrapperElement.contains(event.target) || this._menu.contains(event.target)) return;
				this._focustrap?.deactivate();
				const rearm = () => {
					document.removeEventListener("pointerup", rearm, true);
					if (this._isShown()) this._focustrap?.activate();
				};
				document.addEventListener("pointerup", rearm, true);
			};
			document.addEventListener("pointerdown", this._pointerDownListener, true);
			if (this._config.search) {
				this._searchElement.focus();
				return;
			}
			this._focusListBox();
		}
		_focusListBox() {
			if (!this._listBox) return;
			if (this._listBox.getActive() === null && !this._searchElement?.value) {
				const selected = SelectorEngine.findOne(`${SELECTOR_OPTION$1}.${CLASS_NAME_SELECTED$1}:not([hidden])`, this._menu);
				if (selected?.dataset.coreuiValue) this._listBox.setActive(selected.dataset.coreuiValue);
			}
			this._listBox.focusActive();
			if (!containsFocus(this._menu)) this._menu.focus();
		}
		_releaseFocus() {
			if (this._pointerDownListener) {
				document.removeEventListener("pointerdown", this._pointerDownListener, true);
				this._pointerDownListener = null;
			}
			this._focustrap?.deactivate();
			this._focustrap = null;
		}
		_onHideStart() {
			this._releaseFocus();
			this._refocusOnHide = containsFocus(this._wrapperElement) || containsFocus(this._menu);
		}
		_afterHideDispose() {
			if (this._config.search) this._searchElement.value = "";
			this._onSearchChange(this._searchElement);
		}
		_onHideEnd() {
			if (this._refocusOnHide && !this._disabled) {
				const refocusTarget = this._config.search ? this._searchElement : this._togglerElement;
				if (refocusTarget) refocusTarget.focus();
			}
		}
		dispose() {
			this._validation.dispose();
			this._destroySelect();
			if (this._element.firstChild !== this._hostOptions[0]) this._element.replaceChildren(...this._hostOptions);
			for (const [name, value] of this._hostAttributes) writeAttribute(this._element, name, value);
			super.dispose();
		}
		search(text) {
			const changed = text !== this._search;
			this._search = text;
			this._filterOptionsList();
			if (changed) EventHandler.trigger(this._element, EVENT_SEARCH$1, { query: text });
		}
		setLoading(loading) {
			this._loading = loading;
			this._listBox?.setLoading(loading);
		}
		setOptions(options) {
			if (!this._config) return;
			this._typeCheckConfig({ options }, { options: DefaultType$21.options });
			const hadFocus = containsFocus(this._menu);
			const active = this._listBox?.getActive();
			const previous = new Set(flattenOptions(this._options).map((option) => String(option.value)));
			const seen = new Set(this._seenValues);
			this._sourceOptions = options;
			this._givenApplies = false;
			this._options = this._getOptionsFromConfig(options);
			const values = new Set(flattenOptions(this._options).map((option) => String(option.value)));
			const reset = this._config.resetSelectionOnOptionsChange && (values.size !== previous.size || [...values].some((value) => !previous.has(value)));
			const marked = this._markedValues();
			const seeded = this._givenValues ? marked.filter((value) => !seen.has(value)) : [];
			const selected = this._store.values();
			const next = reset ? marked : [...selected, ...this._config.multiple || selected.length === 0 ? seeded : []];
			const listed = this._listedOptions();
			const initial = [...this._initialSelection, ...seeded.map((value) => ({
				value,
				...this._describe(listed.get(value))
			}))];
			this._initialSelection = this._fit(initial.map((option) => option.value)).map((value) => initial.find((option) => option.value === value));
			this._element.replaceChildren();
			this._createNativeOptions(this._element, this._options);
			this._listBox?.setItems(this._getListBoxItems());
			this._filterOptionsList();
			this._commit(next, reset);
			if (!this._config) return;
			const focused = this._menu.getRootNode().activeElement;
			if (!hadFocus || focused !== this._menu && containsFocus(this._menu) && isVisible(focused)) return;
			const items = this._getDisplayedItems();
			const target = items.find((item) => item.dataset.coreuiValue === active) ?? (this._config.search ? null : items[0]);
			if (target) {
				this._listBox.setActive(target.dataset.coreuiValue);
				this._listBox.focusActive();
			} else (this._config.search ? this._searchElement : this._menu).focus();
		}
		disable() {
			this._setDisabled(true);
		}
		enable() {
			this._setDisabled(false);
		}
		setTotal(total) {
			this._typeCheckConfig({ total }, { total: DefaultType$21.total });
			this._total = total;
			this._render();
		}
		setValidationState(validationState) {
			const state = {
				invalid: false,
				valid: false,
				validationState
			};
			this._config = this._getConfig({
				...this._config,
				...state
			});
			this._validation.configure(state);
		}
		setValue(value) {
			this._typeCheckConfig({ value }, { value: DefaultType$21.value });
			const select = this._element;
			const values = this._normalizeValue(value);
			this._givenValues = values ? new Set(values) : /* @__PURE__ */ new Set();
			this._givenApplies = true;
			this._options = this._getOptions();
			select.selectedIndex = -1;
			this._commit(this._markedValues(), false);
		}
		selectAll(options = this._options) {
			this._selectUpToLimit(this._enabledOptions(options));
		}
		deselectAll(options) {
			const values = options ? new Set(this._enabledOptions(options).map((option) => String(option.value))) : null;
			this._commit(this._selectedOptions().filter((option) => option.disabled === true || values !== null && !values.has(option.value)).map((option) => option.value));
		}
		selectFiltered() {
			const options = this._getDisplayedItems().map((item) => this._findOptionByValue(String(item.dataset.coreuiValue))).filter(Boolean);
			this._selectUpToLimit(options);
		}
		deselectFiltered() {
			const values = new Set(this._getDisplayedItems().map((item) => String(item.dataset.coreuiValue)));
			this._commit(this._store.values().filter((value) => !values.has(value)));
		}
		getValue() {
			return this._selectedOptions();
		}
		_isDisabled() {
			return this._disabled;
		}
		_setDisabled(disabled) {
			if (disabled === this._disabled) return;
			this._disabled = disabled;
			if (disabled) this.hide();
			this._element.toggleAttribute("disabled", disabled);
			this._element.classList.toggle(CLASS_NAME_DISABLED$3, disabled);
			this._wrapperElement.classList.toggle(CLASS_NAME_DISABLED$3, disabled);
			this._togglerElement.classList.toggle(CLASS_NAME_DISABLED$3, disabled);
			writeAttribute(this._togglerElement, "aria-disabled", disabled ? "true" : null);
			if (!this._config.search) writeAttribute(this._togglerElement, "tabindex", disabled ? null : "0");
			if (this._indicatorElement) this._indicatorElement.disabled = disabled;
			if (this._searchElement) this._searchElement.disabled = disabled;
			this._render();
		}
		_destroySelect() {
			this._releaseFocus();
			this._disposeFloating();
			this._disposeListBox();
			this._disposeSelection();
			for (const element of [
				this._wrapperElement,
				this._menu,
				this._selectionElement,
				this._togglerElement,
				this._searchElement,
				this._indicatorElement,
				this._selectAllElement,
				this._headerElement,
				this._optionsElement
			]) if (element) EventHandler.off(element, EVENT_KEY$18);
			if (this._menu) this._menu.remove();
			if (this._wrapperElement) {
				this._wrapperElement.before(this._element);
				this._wrapperElement.remove();
			}
		}
		_addEventListeners() {
			EventHandler.on(this._selectionElement, EVENT_CHIP_REMOVE, SELECTOR_CHIP, (event) => {
				event.preventDefault();
				const chip = event.target.closest(SELECTOR_CHIP);
				if (!chip) return;
				const target = containsFocus(chip) ? getRemovalNeighbor(this._getChips(), chip) ?? (this._config.search ? this._searchElement : this._togglerElement) : null;
				this._removeAsUser(() => this._deselectOption(String(chip.dataset.value)));
				target?.focus();
			});
			EventHandler.on(this._selectionElement, EVENT_KEYDOWN$7, SELECTOR_CHIP, (event) => {
				const towardField = isRTL(this._wrapperElement) ? ARROW_LEFT_KEY$4 : ARROW_RIGHT_KEY$4;
				if (this._config.search && event.key === towardField && event.delegateTarget === this._getChips().at(-1)) {
					event.preventDefault();
					this._searchElement.focus();
				}
			});
			EventHandler.on(this._togglerElement, EVENT_CLICK$8, SELECTOR_CLEANER, (event) => {
				if (!this._disabled) {
					event.preventDefault();
					event.stopPropagation();
					this._removeAsUser(() => this.deselectAll());
				}
			});
			EventHandler.on(this._wrapperElement, EVENT_CLICK$8, () => {
				if (!this._disabled) this.show();
			});
			EventHandler.on(this._wrapperElement, EVENT_KEYDOWN$7, (event) => {
				if (event.key === ESCAPE_KEY$1) {
					if (this._isShown()) {
						event.preventDefault();
						event.stopPropagation();
					}
					this.hide();
					return;
				}
				if (this._isShown() && event.target === this._searchElement) {
					if (event.key === ARROW_DOWN_KEY$3 || event.key === ARROW_UP_KEY$3) {
						event.preventDefault();
						if (event.key === ARROW_UP_KEY$3 && this._listBox?.getActive() === null) {
							this._listBox.last();
							return;
						}
						this._focusListBox();
						return;
					}
					if (event.key === ENTER_KEY$1) {
						const stop = SelectorEngine.findOne(`${SELECTOR_OPTION$1}[tabindex="0"]`, this._menu);
						if (stop?.dataset.coreuiValue) {
							event.preventDefault();
							this._listBox?.toggle(stop.dataset.coreuiValue);
						}
						return;
					}
				}
				if (this._routesTypingToSearch() && isTypingKey(event) && !event.defaultPrevented) this._searchElement.focus();
			});
			EventHandler.on(this._menu, EVENT_KEYDOWN$7, (event) => {
				if (this._routesTypingToSearch() && isTypingKey(event) && !event.target.closest(SELECTOR_TEXT_ENTRY)) this._searchElement.focus();
			});
			this._addTogglerKeydownListeners();
			if (this._nativeKeydownHandler) EventHandler.off(this._element, EVENT_KEYDOWN$7, this._nativeKeydownHandler);
			this._nativeKeydownHandler = (event) => {
				if (!event.key || event.key === TAB_KEY || event.key === ESCAPE_KEY$1) return;
				event.preventDefault();
				const isPrintable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
				if (!this._isShown() && (event.key === ENTER_KEY$1 || event.key === ARROW_DOWN_KEY$3 || this._config.search && isPrintable)) this.show();
				if (this._config.search) {
					this._searchElement.focus();
					if (isPrintable) {
						this._searchElement.value += event.key;
						this._onSearchChange(this._searchElement);
					}
				} else this._togglerElement.focus();
			};
			EventHandler.on(this._element, EVENT_KEYDOWN$7, this._nativeKeydownHandler);
			if (this._nativeFocusHandler) EventHandler.off(this._element, EVENT_FOCUS$3, this._nativeFocusHandler);
			this._nativeFocusHandler = () => {
				this._getFocusTarget().focus();
			};
			EventHandler.on(this._element, EVENT_FOCUS$3, this._nativeFocusHandler);
			EventHandler.on(this._indicatorElement, EVENT_CLICK$8, (event) => {
				event.preventDefault();
				event.stopPropagation();
				this.toggle();
			});
			EventHandler.on(this._searchElement, EVENT_INPUT$8, () => {
				this._onSearchChange(this._searchElement);
			});
			EventHandler.on(this._searchElement, EVENT_KEYDOWN$7, (event) => {
				if (!this._isShown() && event.key?.length === 1 && !event.ctrlKey && !event.metaKey || event.key === ARROW_DOWN_KEY$3) this.show();
				if (this._handleSearchToChips(event)) return;
				if ((event.key === BACKSPACE_KEY$1 || event.key === DELETE_KEY) && event.target.value.length === 0) this._deselectLastOption();
				this._searchElement?.focus();
			});
			if (this._selectAllElement) EventHandler.on(this._menu, EVENT_CLICK$8, SELECTOR_SELECT_ALL$1, (event) => {
				event.preventDefault();
				event.stopPropagation();
				if (!this._disabled) this._validation.runAsUser(() => this._toggleSelectAll());
			});
		}
		_getOptions() {
			return this._getOptionsFromConfig(this._sourceOptions);
		}
		_getOptionsFromConfig(options = this._sourceOptions, disabled = false) {
			const _options = [];
			for (const option of options) {
				if (isOptionGroup(option)) {
					const customGroupProperties = { ...option };
					delete customGroupProperties.label;
					delete customGroupProperties.options;
					_options.push({
						...customGroupProperties,
						label: option.label,
						options: this._getOptionsFromConfig(option.options, disabled || option.disabled)
					});
					continue;
				}
				const value = String(option.value);
				const values = this._givenApplies || !this._seenValues.has(value) ? this._givenValues : null;
				const isSelected = values ? values.has(value) : option.selected;
				this._seenValues.add(value);
				const customProperties = typeof option === "object" ? { ...option } : {};
				delete customProperties.value;
				delete customProperties.selected;
				delete customProperties.disabled;
				_options.push({
					...customProperties,
					value,
					...isSelected && { selected: true },
					...(disabled || option.disabled) && { disabled: true }
				});
			}
			return _options;
		}
		_getOptionsFromElement(node = this._element) {
			return [...node.children].filter((child) => child.nodeName === "OPTGROUP" || child.nodeName === "OPTION" && child.value).map((child) => child.nodeName === "OPTGROUP" ? {
				label: child.label,
				disabled: child.disabled,
				options: this._getOptionsFromElement(child)
			} : {
				value: child.value,
				text: child.textContent,
				selected: child.selected,
				disabled: child.disabled
			});
		}
		_configureNativeSelect() {
			this._element.classList.add(CLASS_NAME_SELECT);
			if (this._config.multiple) this._element.setAttribute("multiple", true);
			else this._element.removeAttribute("multiple");
			if (this._config.required) this._element.setAttribute("required", true);
			else this._element.removeAttribute("required");
			this._element.toggleAttribute("disabled", this._disabled);
		}
		_createNativeOptions(parentElement, options) {
			for (const option of options) if (isOptionGroup(option)) {
				const optgroup = document.createElement("optgroup");
				optgroup.label = option.label;
				optgroup.disabled = option.disabled === true;
				this._createNativeOptions(optgroup, option.options);
				parentElement.append(optgroup);
			} else {
				const opt = document.createElement("OPTION");
				opt.value = option.value;
				if (option.disabled === true) opt.setAttribute("disabled", "disabled");
				if (option.selected === true) opt.setAttribute("selected", "selected");
				opt.textContent = option.text;
				parentElement.append(opt);
			}
		}
		_hideNativeSelect() {
			this._element.tabIndex = "-1";
			this._element.setAttribute("aria-hidden", "true");
		}
		_wireTogglerAccessibleName() {
			const labelledBy = this._element.getAttribute("aria-labelledby");
			const ariaLabel = this._element.getAttribute("aria-label");
			const nativeLabel = [...this._element.labels ?? []].find((label) => !label.contains(this._element));
			if (labelledBy) this._togglerElement.setAttribute("aria-labelledby", labelledBy);
			else if (ariaLabel) this._togglerElement.setAttribute("aria-label", ariaLabel);
			else if (nativeLabel) {
				if (!nativeLabel.id) nativeLabel.id = `${this._uniqueId}-label`;
				this._togglerElement.setAttribute("aria-labelledby", nativeLabel.id);
			}
		}
		_getFocusTarget() {
			return this._config.search ? this._searchElement : this._togglerElement;
		}
		_markRequired() {
			if (this._config.required) (this._config.search ? this._searchElement : this._togglerElement).setAttribute("aria-required", "true");
		}
		_createSelect() {
			const wrapper = document.createElement("div");
			wrapper.classList.add(CLASS_NAME_SELECT);
			this._element.classList.toggle(CLASS_NAME_DISABLED$3, this._disabled);
			for (const className of this._element.classList) if (className !== CLASS_NAME_IS_INVALID && className !== CLASS_NAME_IS_VALID) wrapper.classList.add(className);
			this._wrapperElement = wrapper;
			this._element.parentNode.insertBefore(wrapper, this._element);
			wrapper.prepend(this._element);
			this._uniqueId = this._config.id || this._hostAttributes.get("id") || getUID(`${this.constructor.NAME}`);
			this._createSelection();
			this._createButtons();
			if (this._config.search) {
				this._createSearchInput();
				this._updateSearch();
			}
			this._uniqueName = this._config.name || this._hostAttributes.get("name");
			this._element.setAttribute("id", this._uniqueId);
			if (this._uniqueName) this._element.setAttribute("name", this._uniqueName);
			this._wireTogglerAccessibleName();
			this._markRequired();
			this._validation.refresh();
			this._createOptionsContainer();
			this._hideNativeSelect();
			this._render();
		}
		_createSelection() {
			const togglerEl = this._wrapperElement;
			togglerEl.classList.add(CLASS_NAME_INPUT_GROUP$1);
			togglerEl.setAttribute("role", "combobox");
			togglerEl.setAttribute("aria-expanded", "false");
			togglerEl.setAttribute("aria-haspopup", "dialog");
			this._togglerElement = togglerEl;
			if (this._disabled) {
				togglerEl.classList.add(CLASS_NAME_DISABLED$3);
				togglerEl.setAttribute("aria-disabled", "true");
			}
			if (!this._config.search && !this._disabled) togglerEl.tabIndex = 0;
			const selectionEl = document.createElement("div");
			selectionEl.classList.add(CLASS_NAME_SELECTION);
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) selectionEl.classList.add(CLASS_NAME_SELECTION_CHIPS);
			togglerEl.append(selectionEl);
			this._updateSelection();
			this._selectionElement = selectionEl;
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) this._selectionChipSet = new MultiSelectChipSet(selectionEl, {
				removable: !this._disabled,
				typeahead: false
			});
		}
		_createButtons() {
			this._indicatorElement = null;
			if (this._config.pickerIcon) {
				const indicator = document.createElement("button");
				indicator.type = "button";
				indicator.classList.add("form-control-action");
				indicator.disabled = this._disabled;
				indicator.setAttribute("aria-label", this._config.ariaPickerLabel);
				indicator.innerHTML = sanitizeByConfig(this._config.pickerIcon === true ? PICKER_ICON : this._config.pickerIcon, {
					...this._config,
					allowList: SVGAllowlist
				});
				this._togglerElement.append(indicator);
				this._indicatorElement = indicator;
			}
			this._updateSelectionCleaner();
		}
		_createSelectionCleaner() {
			const cleaner = document.createElement("button");
			cleaner.type = "button";
			cleaner.classList.add(CLASS_NAME_CLEANER$1);
			cleaner.setAttribute("aria-label", this._config.ariaCleanerLabel);
			cleaner.innerHTML = CLEANER_ICON;
			return cleaner;
		}
		_createSearchInput() {
			const input = document.createElement("input");
			input.classList.add(CLASS_NAME_SEARCH);
			if (this._disabled) input.disabled = true;
			input.setAttribute("id", `search-${this._uniqueId}`);
			input.autocomplete = "off";
			input.setAttribute("aria-label", this._config.ariaSearchLabel);
			this._searchElement = input;
			this._updateSearchSize();
			this._selectionElement.append(input);
		}
		_buildMenuHeader(listBoxDiv) {
			const hasHeaderTemplate = typeof this._config.headerTemplate === "function";
			const showSelectAll = this._config.selectAll && this._config.multiple;
			if (!hasHeaderTemplate && !showSelectAll) return;
			const header = document.createElement("div");
			header.classList.add(CLASS_NAME_HEADER);
			this._dropdownHeaderElement = header;
			if (hasHeaderTemplate) {
				const headerContent = document.createElement("div");
				EventHandler.on(headerContent, EVENT_CLICK$8, (event) => {
					event.stopPropagation();
				});
				this._headerElement = headerContent;
				header.append(headerContent);
			} else {
				const selectAllButton = document.createElement("button");
				selectAllButton.type = "button";
				selectAllButton.classList.add(CLASS_NAME_SELECT_ALL);
				selectAllButton.setAttribute("data-coreui-select-all", "");
				const selectAllLabel = document.createElement("span");
				selectAllButton.append(selectAllLabel);
				this._selectAllLabelElement = selectAllLabel;
				this._selectAllElement = selectAllButton;
				header.append(selectAllButton);
			}
			listBoxDiv.append(header);
		}
		_afterMenuCreated() {
			this._menu.id = getUID(`${this.constructor.NAME}-dialog-`);
			this._menu.setAttribute("role", "dialog");
			this._menu.setAttribute("tabindex", "-1");
			this._nameMenu();
			if (!this._config.search) this._menu.setAttribute("aria-modal", "true");
			this._updateHeader();
			this._updateMasterCheckbox();
		}
		_nameMenu() {
			const labelledBy = this._togglerElement.getAttribute("aria-labelledby");
			if (labelledBy) {
				this._menu.setAttribute("aria-labelledby", labelledBy);
				return;
			}
			const label = this._togglerElement.getAttribute("aria-label");
			if (label) {
				this._menu.setAttribute("aria-label", label);
				return;
			}
			this._togglerElement.id ||= getUID(`${this.constructor.NAME}-toggler-`);
			this._menu.setAttribute("aria-labelledby", this._togglerElement.id);
		}
		_routesTypingToSearch() {
			return Boolean(this._config.search && this._config.globalSearch);
		}
		_getListBoxConfig() {
			return {
				...super._getListBoxConfig(),
				indicator: this._config.indicator,
				sectionsSelectable: this._config.optionsGroupsSelectable,
				selectionLimit: this._config.selectionLimit,
				selectionMode: this._config.multiple ? "multiple" : "single",
				loading: this._loading,
				loadingLabel: this._config.loadingLabel,
				typeahead: !this._routesTypingToSearch() && this._config.search !== "external"
			};
		}
		_getActiveDescendantField() {
			return null;
		}
		_getPanelReferences() {
			const references = [[this._togglerElement, this._menu.id]];
			if (this._searchElement) references.push([this._searchElement, this._optionsElement.id]);
			return references;
		}
		_optionText(option) {
			return option.text;
		}
		_createChip(value, text, disabled) {
			const chip = document.createElement("div");
			chip.classList.add(CLASS_NAME_CHIP);
			chip.dataset.value = value;
			chip.textContent = text;
			new Chip(chip, {
				ariaRemoveLabel: this._config.ariaTagDeleteLabel ?? this._config.ariaChipRemoveLabel,
				disabled: disabled === true,
				removable: !this._disabled && disabled !== true
			});
			return chip;
		}
		_updateChips(selection, search) {
			const placeholder = SelectorEngine.findOne(".multi-select-placeholder", selection);
			if (placeholder) placeholder.remove();
			const chips = /* @__PURE__ */ new Map();
			let focused;
			const selected = this._selectedOptions();
			for (const chip of SelectorEngine.children(selection, SELECTOR_CHIP)) {
				const option = selected.find((option) => option.value === chip.dataset.value);
				if (option && chip.firstChild?.textContent === option.text && Boolean(SelectorEngine.findOne(SELECTOR_CHIP_REMOVE, chip)) === (!this._disabled && option.disabled !== true)) {
					chips.set(option.value, chip);
					continue;
				}
				if (containsFocus(chip)) focused = chip.dataset.value;
				Chip.getInstance(chip)?.dispose();
				chip.remove();
			}
			const stop = [...chips.values()].find((chip) => chip.tabIndex === 0);
			let next = search?.parentElement === selection ? search : null;
			for (const option of selected.toReversed()) {
				const chip = chips.get(option.value) ?? this._createChip(option.value, option.text, option.disabled);
				if (chip.parentElement !== selection || chip.nextElementSibling !== next) {
					if (next) next.before(chip);
					else selection.append(chip);
				}
				if (option.value === focused) chip.focus();
				next = chip;
			}
			this._selectionChipSet?._moveTabStop(stop);
		}
		_onSelectionChange() {
			this._validation.runAsUser(() => this._settle(true));
			if (!this._config) return;
			if (!this._config.multiple) {
				this.hide();
				this.search("");
				if (this._config.search) this._searchElement.value = null;
			}
			if (this._config.clearSearchOnSelect && this._config.search) {
				this.search("");
				this._searchElement.value = null;
				this._searchElement.focus();
			}
			this._updateSearchSize();
		}
		_onSelectionLimit() {
			this._triggerSelectionLimit();
		}
		_lockedValues() {
			return new Set([...this._listedOptions()].filter(([, option]) => option.disabled).map(([value]) => value));
		}
		_listedOptions() {
			return new Map(flattenOptions(this._options).toReversed().map((option) => [String(option.value), option]));
		}
		_enabledOptions(options, locked = this._lockedValues()) {
			return options.filter((option) => !option.disabled && !locked.has(String(option.value))).flatMap((option) => isOptionGroup(option) ? this._enabledOptions(option.options, locked) : [option]);
		}
		_selectUpToLimit(options) {
			const given = new Map(options.toReversed().map((option) => [String(option.value), option]));
			const { added, refused } = fillSelection(this._config.multiple ? this._store.values() : [], options.map((option) => String(option.value)), this._selectionLimit());
			for (const value of added) this._known.set(value, this._describe(given.get(value)));
			this._commit([...this._store.values(), ...added]);
			if (this._config && refused !== null) this._triggerSelectionLimit();
		}
		_getDisplayedItems() {
			return this._takeable(this._getDisplayedOptions());
		}
		_takeable(elements) {
			const locked = this._lockedValues();
			return elements.filter((element) => !element.classList.contains(CLASS_NAME_DISABLED$3) && !locked.has(String(element.dataset.coreuiValue)));
		}
		_getTotalCount() {
			if (typeof this._total === "number") return this._total;
			const values = new Set(flattenOptions(this._options).map((option) => String(option.value)));
			return values.size + this._store.values().filter((value) => !values.has(value)).length;
		}
		_deselectOption(value) {
			this._commit(this._store.values().filter((selected) => selected !== String(value)));
		}
		_deselectLastOption() {
			const last = this._selectedOptions().findLast((option) => option.disabled !== true);
			if (last) this._removeAsUser(() => this._deselectOption(last.value));
		}
		_getChips() {
			return this._selectionChipSet?._getFocusableChips() ?? [];
		}
		_handleSearchToChips(event) {
			const removing = event.key === BACKSPACE_KEY$1 || event.key === DELETE_KEY;
			const arrow = event.key === ARROW_LEFT_KEY$4 || event.key === ARROW_RIGHT_KEY$4;
			if (!removing && !arrow || event.isComposing || event.shiftKey || hasShortcutModifier(event)) return false;
			const field = event.target;
			const towardChips = isRTL(this._wrapperElement) ? ARROW_RIGHT_KEY$4 : ARROW_LEFT_KEY$4;
			const last = (removing ? field.value.length === 0 : event.key === towardChips && field.selectionStart === 0 && field.selectionEnd === 0) ? this._getChips().at(-1) : void 0;
			if (!last) return false;
			event.preventDefault();
			this.hide();
			last.focus();
			return true;
		}
		_removeAsUser(remove) {
			const before = this._selectedOptions();
			this._validation.runAsUser(remove);
			const after = new Set(this._store.values());
			const removed = before.filter((option) => !after.has(String(option.value))).map((option) => option.text);
			const message = getChipAnnouncement(removed, [], this._config.ariaRemovedAnnouncement, this._config.ariaRemovedAnnouncement);
			if (message) announce(message, { context: this._wrapperElement });
		}
		_fit(values) {
			if (!this._config.multiple) return values.slice(-1);
			const unique = [...new Set(values)];
			return unique.slice(0, this._selectionLimit() ?? unique.length);
		}
		_markedValues() {
			return flattenOptions(this._options).filter((option) => option.selected).map((option) => String(option.value));
		}
		_describe(option) {
			return {
				text: option.text,
				...option.disabled && { disabled: true }
			};
		}
		_selectedOptions() {
			return this._store.values().map((value) => ({
				value,
				...this._known.get(value)
			}));
		}
		_commit(values, notify = true) {
			const previous = new Set(this._store.values());
			this._commitSelection(values);
			this._settle(this._store.size() !== previous.size || this._store.values().some((value) => !previous.has(value)), notify);
		}
		_settle(changed, notify = true) {
			const element = this._element;
			if (changed) this._validation.change();
			this._render();
			if (changed && notify) {
				EventHandler.trigger(element, EVENT_CHANGE$7, { value: this._selectedOptions() });
				element.dispatchEvent(new Event("input", { bubbles: true }));
				element.dispatchEvent(new Event("change", { bubbles: true }));
			}
		}
		_render() {
			const options = this._listedOptions();
			for (const value of this._store.values()) {
				const listed = options.get(value);
				if (listed) this._known.set(value, this._describe(listed));
			}
			this._syncNativeSelection(options);
			this._validation.userAction = false;
			this._updateSelection();
			this._updateSelectionCleaner();
			this._updateSearch();
			this._updateSearchSize();
			this._updateHeader();
			this._updateMasterCheckbox();
			this._validation.update();
		}
		_syncNativeSelection(options) {
			for (const option of this._offListOptions) option.remove();
			this._offListOptions = this._selectedOptions().filter((option) => !options.has(option.value)).map((option) => Object.assign(new Option(option.text, option.value), {
				disabled: option.disabled === true,
				hidden: true
			}));
			this._element.append(...this._offListOptions);
			if (!this._config.multiple) {
				this._element.value = this._store.values()[0] ?? "";
				return;
			}
			for (const option of SelectorEngine.find("option", this._element)) option.selected = this._store.has(option.value);
		}
		_restoreSelection() {
			this._onSearchChange(this._searchElement);
			for (const { value, ...option } of this._initialSelection) this._known.set(value, option);
			this._commit(this._initialSelection.map((option) => option.value));
		}
		_updateSelection() {
			const selection = SelectorEngine.findOne(SELECTOR_SELECTION, this._wrapperElement);
			const search = SelectorEngine.findOne(SELECTOR_SEARCH$1, this._wrapperElement);
			this._wrapperElement.classList.toggle(CLASS_NAME_SELECT_FILLED, this._store.size() > 0);
			if (this._store.size() === 0 && !this._config.search) {
				this._renderEmptySelection(selection);
				return;
			}
			if (this._config.multiple && this._config.selectionType === "counter" && !this._config.search) selection.textContent = resolveCountLabel(this._config.selectedLabel, this._store.size(), this._getTotalCount());
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) this._updateChips(selection, search);
			if (this._config.multiple && this._config.selectionType === "text") {
				while (selection.firstChild && selection.firstChild !== search) selection.firstChild.remove();
				selection.prepend(...this._selectedOptions().map((option, index) => {
					const span = document.createElement("span");
					span.textContent = `${option.text}${index === this._store.size() - 1 ? "" : ","}\u00A0`;
					return span;
				}));
			}
			if (!this._config.multiple && this._store.size() > 0 && !this._config.search) selection.textContent = this._selectedOptions()[0].text;
			if (search && selection.lastElementChild !== search) selection.append(search);
			if (this._floatingCleanup) this._updateFloatingPosition();
		}
		_renderEmptySelection(selection) {
			const placeholder = document.createElement("span");
			placeholder.classList.add("multi-select-placeholder");
			placeholder.textContent = this._config.placeholder;
			for (const chip of SelectorEngine.find(SELECTOR_CHIP, selection)) Chip.getInstance(chip)?.dispose();
			selection.replaceChildren(placeholder);
		}
		_disposeSelection() {
			if (!this._selectionElement) return;
			for (const chip of SelectorEngine.find(SELECTOR_CHIP, this._selectionElement)) Chip.getInstance(chip)?.dispose();
			this._selectionChipSet?.dispose();
			this._selectionChipSet = null;
			EventHandler.off(this._selectionElement, Chip.EVENT_KEY);
		}
		_updateSelectionCleaner() {
			if (!this._config.cleaner) return;
			if (this._store.size() > 0 && !this._disabled && this._selectionCleanerElement === null) {
				const selectionCleaner = this._createSelectionCleaner();
				if (this._indicatorElement) this._indicatorElement.before(selectionCleaner);
				else this._togglerElement.append(selectionCleaner);
				this._selectionCleanerElement = selectionCleaner;
				return;
			}
			if ((this._store.size() === 0 || this._disabled) && this._selectionCleanerElement !== null) {
				this._selectionCleanerElement.remove();
				this._selectionCleanerElement = null;
			}
		}
		_updateSearch() {
			if (!this._config.search) return;
			if (this._store.size() === 0) this._searchElement.placeholder = this._config.placeholder;
			else if (!this._config.multiple) this._searchElement.placeholder = this._selectedOptions()[0].text;
			else if (this._config.selectionType === "counter") this._searchElement.placeholder = resolveCountLabel(this._config.selectedLabel, this._store.size(), this._getTotalCount());
			else this._searchElement.removeAttribute("placeholder");
		}
		_updateSearchSize(size = Math.max(2, (this._searchElement?.value.length ?? 0) + 1)) {
			if (!this._searchElement || !this._config.multiple || ![
				"chips",
				"tags",
				"text"
			].includes(this._config.selectionType)) return;
			if (this._store.size() > 0) this._searchElement.size = size;
			else this._searchElement.removeAttribute("size");
		}
		_updateHeader() {
			if (this._headerElement) {
				this._renderHeader();
				return;
			}
			if (!this._selectAllElement) return;
			this._selectAllLabelElement.textContent = this._getSelectAllLabel();
		}
		_getSelectAllLabel() {
			const allSelected = this._isAllSelected();
			if (this._isFilteredScopeNarrowed()) return allSelected ? this._config.deselectFilteredLabel : this._config.selectFilteredLabel;
			return allSelected ? this._config.deselectAllLabel : this._config.selectAllLabel;
		}
		_isAllSelected() {
			return this._getSelectAllState() === "all";
		}
		_getSelectAllState() {
			const scope = this._config.selectAllMode === "filtered" ? this._getDisplayedItems() : this._getSelectableElements();
			const selected = scope.filter((element) => element.classList.contains(CLASS_NAME_SELECTED$1)).length;
			return getScopeSelectionState(selected, scope.length, this._store.size(), this._selectionLimit());
		}
		_isFilteredScopeNarrowed() {
			if (this._config.selectAllMode !== "filtered") return false;
			const { filtered, total } = this._getSelectionState();
			return filtered < total;
		}
		_toggleSelectAll() {
			const filteredMode = this._config.selectAllMode === "filtered";
			if (this._isAllSelected()) {
				if (filteredMode) this.deselectFiltered();
				else this.deselectAll(this._options);
				return;
			}
			if (filteredMode) this.selectFiltered();
			else this.selectAll();
		}
		_updateMasterCheckbox() {
			if (!this._selectAllElement) return;
			const state = this._getSelectAllState();
			this._selectAllElement.classList.toggle(CLASS_NAME_SELECTED$1, state === "all");
			this._selectAllElement.classList.toggle(CLASS_NAME_INDETERMINATE, state === "some");
			this._selectAllElement.setAttribute("aria-pressed", getAriaPressed(state));
		}
		_renderHeader() {
			if (!this._headerElement || typeof this._config.headerTemplate !== "function") return;
			const result = this._config.headerTemplate(this._getSelectionState(), this._getSelectionActions());
			if (result instanceof Node) this._headerElement.replaceChildren(result);
			else this._headerElement.innerHTML = sanitizeByConfig(result, this._config);
		}
		_getSelectableElements() {
			return this._takeable(SelectorEngine.find(SELECTOR_OPTION$1, this._optionsElement));
		}
		_getSelectionState() {
			const allItems = this._getSelectableElements();
			const filteredItems = allItems.filter((element) => this._isOptionDisplayed(element));
			return {
				selected: this._store.size(),
				total: allItems.length,
				filtered: filteredItems.length,
				filteredSelected: filteredItems.filter((element) => element.classList.contains(CLASS_NAME_SELECTED$1)).length
			};
		}
		_getSelectionActions() {
			return {
				selectAll: () => this._validation.runAsUser(() => this.selectAll()),
				deselectAll: () => this._validation.runAsUser(() => this.deselectAll()),
				selectFiltered: () => this._validation.runAsUser(() => this.selectFiltered()),
				deselectFiltered: () => this._validation.runAsUser(() => this.deselectFiltered())
			};
		}
		_filterQuery() {
			return this._config.search === "external" ? null : super._filterQuery();
		}
		_onSearchChange(element) {
			if (element) {
				this.search(element.value);
				this._updateSearchSize(element.value.length + 1);
			}
		}
		_selectionLimit() {
			return getSelectionLimit(this._config.multiple, this._config.selectionLimit);
		}
		_triggerSelectionLimit() {
			EventHandler.trigger(this._element, EVENT_SELECTION_LIMIT, { selectionLimit: this._config.selectionLimit });
		}
		_afterFilter(visibleOptions) {
			this._updateHeader();
			this._updateMasterCheckbox();
			this._updateSelectAllVisibility(visibleOptions);
		}
		_updateSelectAllVisibility(visibleOptions) {
			if (!this._dropdownHeaderElement || !this._selectAllElement) return;
			if (this._config.hideSelectAllOnSearchNoResults && visibleOptions === 0) this._dropdownHeaderElement.style.display = "none";
			else this._dropdownHeaderElement.style.removeProperty("display");
		}
		_configAfterMerge(config) {
			config = this._normalizeContainerConfig(config);
			if (typeof config.search === "string" && config.search !== "external") throw new TypeError(`${NAME$25.toUpperCase()}: Option "search" takes true, false or "external".`);
			config.value = this._normalizeValue(config.value);
			return config;
		}
		_normalizeValue(value) {
			if (typeof value === "number" || typeof value === "string") return value === "" ? null : String(value).split(/,\s*/);
			return Array.isArray(value) ? value.map(String) : value;
		}
		static multiSelectInterface(element, config, ...args) {
			const data = MultiSelect.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, MultiSelect, config, args);
		}
		static clearMenus(event) {
			if (event && (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY)) return;
			const selects = SelectorEngine.find(SELECTOR_SELECT);
			for (const select of selects) {
				const context = data_default.get(select, DATA_KEY);
				if (!context) continue;
				if (!context._wrapperElement.classList.contains(CLASS_NAME_SHOW$8)) continue;
				if (context._wrapperElement.contains(event.target) || context._menu.contains(event.target)) continue;
				context.hide();
				EventHandler.trigger(context._element, EVENT_HIDDEN$5);
			}
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$11, () => {
		for (const multiSelect of SelectorEngine.find(SELECTOR_DATA_MULTI_SELECT)) MultiSelect.multiSelectInterface(multiSelect);
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$6, MultiSelect.clearMenus);
	EventHandler.on(document, EVENT_KEYUP_DATA_API$1, MultiSelect.clearMenus);
	defineJQueryPlugin(MultiSelect);
	//#endregion
	//#region js/src/navigation.ts
	const NAME$24 = "navigation";
	const EVENT_KEY$17 = `.coreui.navigation`;
	const DATA_API_KEY$12 = ".data-api";
	const Default$21 = {
		activeLinksExact: true,
		groupsAutoCollapse: true
	};
	const DefaultType$20 = {
		activeLinksExact: "boolean",
		groupsAutoCollapse: "(string|boolean)"
	};
	const CLASS_NAME_ACTIVE$5 = "active";
	const CLASS_NAME_COLLAPSING = "collapsing";
	const CLASS_NAME_SHOW$7 = "show";
	const CLASS_NAME_NAV_GROUP = "nav-group";
	const CLASS_NAME_NAV_GROUP_TOGGLE = "nav-group-toggle";
	const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$17}${DATA_API_KEY$12}`;
	const EVENT_LOAD_DATA_API$10 = `load${EVENT_KEY$17}${DATA_API_KEY$12}`;
	const SELECTOR_NAV_GROUP = ".nav-group";
	const SELECTOR_NAV_GROUP_ITEMS = ".nav-group-items";
	const SELECTOR_NAV_GROUP_TOGGLE = ".nav-group-toggle";
	const SELECTOR_NAV_LINK = ".nav-link";
	const SELECTOR_DATA_NAVIGATION = "[data-coreui-navigation]";
	var Navigation = class Navigation extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._setActiveLink();
			this._addEventListeners();
		}
		static get Default() {
			return Default$21;
		}
		static get DefaultType() {
			return DefaultType$20;
		}
		static get NAME() {
			return NAME$24;
		}
		_setActiveLink() {
			const currentUrl = String(window.location).split(/[?#]/)[0];
			for (const element of SelectorEngine.find(SELECTOR_NAV_LINK, this._element)) {
				if (element.classList.contains(CLASS_NAME_NAV_GROUP_TOGGLE)) continue;
				if (!(this._config.activeLinksExact ? element.href === currentUrl : currentUrl.startsWith(element.href))) continue;
				element.classList.add(CLASS_NAME_ACTIVE$5);
				for (const group of this._getParentGroups(element)) this._setExpanded(group, true, false);
			}
		}
		_getParentGroups(element) {
			const groups = [];
			let group = element.closest(SELECTOR_NAV_GROUP);
			while (group && this._element.contains(group)) {
				groups.push(group);
				group = group.parentElement ? group.parentElement.closest(SELECTOR_NAV_GROUP) : null;
			}
			return groups;
		}
		_setExpanded(group, expanded, animate = true) {
			const toggle = group.querySelector(`:scope > ${SELECTOR_NAV_GROUP_TOGGLE}`);
			if (toggle) toggle.setAttribute("aria-expanded", String(expanded));
			const items = SelectorEngine.findOne(`:scope > ${SELECTOR_NAV_GROUP_ITEMS}`, group);
			if (!items || !animate) {
				group.classList.toggle(CLASS_NAME_SHOW$7, expanded);
				return;
			}
			const cssPath = supportsInterpolateSize();
			const size = expanded || cssPath ? 0 : items.getBoundingClientRect().height;
			items.classList.add(CLASS_NAME_COLLAPSING);
			group.classList.toggle(CLASS_NAME_SHOW$7, expanded);
			if (!cssPath) startSizeTransition(items, "height", expanded ? 0 : size, expanded ? items.scrollHeight : 0);
			this._queueCallback(() => {
				items.classList.remove(CLASS_NAME_COLLAPSING);
				items.style.height = "";
			}, items, true);
		}
		_toggleGroupItems(event) {
			const toggler = event.target.closest(SELECTOR_NAV_GROUP_TOGGLE);
			const group = toggler ? toggler.closest(SELECTOR_NAV_GROUP) : null;
			if (!group) return;
			if (this._config.groupsAutoCollapse === true && group.parentElement) {
				for (const sibling of Array.from(group.parentElement.children)) if (sibling !== group && sibling.classList.contains(CLASS_NAME_NAV_GROUP) && sibling.classList.contains(CLASS_NAME_SHOW$7)) this._setExpanded(sibling, false);
			}
			this._setExpanded(group, !group.classList.contains(CLASS_NAME_SHOW$7));
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$5, SELECTOR_NAV_GROUP_TOGGLE, (event) => {
				event.preventDefault();
				this._toggleGroupItems(event);
			});
		}
		static navigationInterface(element, config, ...args) {
			const data = Navigation.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Navigation, config);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$10, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_NAVIGATION))) Navigation.navigationInterface(element);
	});
	defineJQueryPlugin(Navigation);
	//#endregion
	//#region js/src/number-input.ts
	const NAME$23 = "number-input";
	const EVENT_KEY$16 = `.coreui.number-input`;
	const DATA_API_KEY$11 = ".data-api";
	const EVENT_CHANGE$6 = `change${EVENT_KEY$16}`;
	const EVENT_CLICK$7 = `click${EVENT_KEY$16}`;
	const EVENT_FOCUS$2 = `focus${EVENT_KEY$16}`;
	const EVENT_INPUT$7 = `input${EVENT_KEY$16}`;
	const EVENT_MOUSEOVER$2 = `mouseover${EVENT_KEY$16}`;
	const EVENT_POINTERDOWN$2 = `pointerdown${EVENT_KEY$16}`;
	const EVENT_RESET$2 = `reset${EVENT_KEY$16}`;
	const EVENTS_STOP_REPEAT = [
		"pointerup",
		"pointercancel",
		"pointerleave"
	].map((event) => `${event}${EVENT_KEY$16}`);
	const CLASS_NAME_ACTION$1 = "form-control-action";
	const CLASS_NAME_NUMBER_INPUT = "number-input";
	const SELECTOR_DATA_NUMBER_INPUT = "[data-coreui-number-input]";
	const REPEAT_DELAY = 400;
	const REPEAT_INTERVAL = 60;
	const Default$20 = {
		allowList: SVGAllowlist,
		ariaDecrementLabel: "Decrease",
		ariaIncrementLabel: "Increase",
		decrementIcon: MINUS_ICON,
		incrementIcon: PLUS_ICON,
		repeat: true,
		sanitize: true,
		sanitizeFn: null
	};
	const DefaultType$19 = {
		allowList: "object",
		ariaDecrementLabel: "string",
		ariaIncrementLabel: "string",
		decrementIcon: "string",
		incrementIcon: "string",
		repeat: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)"
	};
	var NumberInput = class NumberInput extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._decrementElement = null;
			this._incrementElement = null;
			this._group = null;
			this._repeatTimeout = null;
			this._repeatInterval = null;
			this._repeated = false;
			this._stopRepeatingHandler = () => this._stopRepeating();
			this._resetHandler = () => {
				setTimeout(() => this._updateButtonState());
			};
			this._createButtons();
			this._addEventListeners();
			this._updateButtonState();
		}
		static get Default() {
			return Default$20;
		}
		static get DefaultType() {
			return DefaultType$19;
		}
		static get NAME() {
			return NAME$23;
		}
		increment() {
			this._step("up");
		}
		decrement() {
			this._step("down");
		}
		dispose() {
			this._stopRepeating();
			for (const event of EVENTS_STOP_REPEAT) EventHandler.off(document, event, this._stopRepeatingHandler);
			EventHandler.off(this._element.form, EVENT_RESET$2, this._resetHandler);
			for (const button of [this._decrementElement, this._incrementElement]) {
				EventHandler.off(button, EVENT_KEY$16);
				button?.remove();
			}
			if (this._group) {
				EventHandler.off(this._group.element, EVENT_KEY$16);
				this._group.element.classList.remove(CLASS_NAME_NUMBER_INPUT);
				releaseControlGroup(this._element, this._group);
			}
			super.dispose();
		}
		_step(direction) {
			if (!this._canStep(direction)) return false;
			this._stepValue(this._element, direction);
			EventHandler.trigger(this._element, "input", { bubbles: true });
			EventHandler.trigger(this._element, "change", { bubbles: true });
			EventHandler.trigger(this._element, EVENT_CHANGE$6, { value: this._element.value });
			return true;
		}
		_stepValue(input, direction) {
			if (input.step.toLowerCase() === "any") {
				this._stepByOne(input, direction);
				return;
			}
			input[direction === "up" ? "stepUp" : "stepDown"]();
			if (input.value === "") input[direction === "up" ? "stepDown" : "stepUp"]();
		}
		_stepByOne(input, direction) {
			const delta = direction === "up" ? 1 : -1;
			const value = input.value === "" ? 0 : Number(input.value);
			const next = this._clamp(Number((value + delta).toPrecision(15)));
			if (input.value === "" || (next - value) * delta > 0) input.value = String(next);
		}
		_clamp(value) {
			const { max, min } = this._element;
			return Math.min(Math.max(value, min === "" ? -Infinity : Number(min)), max === "" ? Infinity : Number(max));
		}
		_createButtons() {
			this._group = ensureControlGroup(this._element);
			const group = this._group.element;
			group.classList.add(CLASS_NAME_NUMBER_INPUT);
			this._decrementElement = createControlGroupAction({
				className: CLASS_NAME_ACTION$1,
				icon: this._config.decrementIcon,
				label: this._config.ariaDecrementLabel,
				sanitizeIcon: (icon) => sanitizeByConfig(icon, this._config)
			});
			this._incrementElement = createControlGroupAction({
				className: CLASS_NAME_ACTION$1,
				icon: this._config.incrementIcon,
				label: this._config.ariaIncrementLabel,
				sanitizeIcon: (icon) => sanitizeByConfig(icon, this._config)
			});
			for (const button of [this._decrementElement, this._incrementElement]) {
				button.tabIndex = -1;
				group.append(button);
			}
		}
		_addEventListeners() {
			for (const [button, direction] of [[this._decrementElement, "down"], [this._incrementElement, "up"]]) {
				if (!button) continue;
				EventHandler.on(button, EVENT_CLICK$7, (event) => {
					const repeated = this._repeated;
					this._repeated = false;
					if (!repeated || event.detail === 0) this._step(direction);
				});
				if (this._config.repeat) EventHandler.on(button, EVENT_POINTERDOWN$2, (event) => {
					if (event.button !== 0) return;
					this._startRepeating(direction);
				});
			}
			if (this._group) {
				EventHandler.on(this._group.element, EVENT_MOUSEOVER$2, () => this._updateButtonState());
				EventHandler.on(this._group.element, EVENT_POINTERDOWN$2, (event) => this._handleFramePointerDown(event));
			}
			EventHandler.on(this._element, EVENT_INPUT$7, () => this._updateButtonState());
			EventHandler.on(this._element, EVENT_FOCUS$2, () => this._updateButtonState());
			if (this._element.form) EventHandler.on(this._element.form, EVENT_RESET$2, this._resetHandler);
			for (const event of EVENTS_STOP_REPEAT) EventHandler.on(document, event, this._stopRepeatingHandler);
		}
		_handleFramePointerDown(event) {
			const target = event.target;
			this._updateButtonState();
			if (event.pointerType !== "mouse" || target !== this._group?.element && ![this._decrementElement, this._incrementElement].includes(target.closest("button"))) return;
			event.preventDefault();
			if (document.activeElement !== this._element) this._element.focus({ preventScroll: true });
		}
		_startRepeating(direction) {
			this._stopRepeating();
			this._repeated = false;
			this._repeatTimeout = setTimeout(() => {
				this._repeatInterval = setInterval(() => {
					this._repeated = true;
					if (!this._step(direction)) this._stopRepeating();
				}, REPEAT_INTERVAL);
			}, REPEAT_DELAY);
		}
		_stopRepeating() {
			if (this._repeatTimeout) {
				clearTimeout(this._repeatTimeout);
				this._repeatTimeout = null;
			}
			if (this._repeatInterval) {
				clearInterval(this._repeatInterval);
				this._repeatInterval = null;
			}
		}
		_updateButtonState() {
			if (this._decrementElement) this._decrementElement.disabled = !this._canStep("down");
			if (this._incrementElement) this._incrementElement.disabled = !this._canStep("up");
		}
		_canStep(direction) {
			if (this._element.matches(":disabled") || this._element.readOnly) return false;
			const input = this._element.cloneNode();
			input.value = this._element.value;
			this._stepValue(input, direction);
			return input.value !== "" && input.valueAsNumber !== this._element.valueAsNumber;
		}
		static _initializeDataApi() {
			for (const element of SelectorEngine.find(SELECTOR_DATA_NUMBER_INPUT)) NumberInput.getOrCreateInstance(element);
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, NumberInput, config);
		}
	};
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$16}${DATA_API_KEY$11}`, () => {
		NumberInput._initializeDataApi();
	});
	defineJQueryPlugin(NumberInput);
	//#endregion
	//#region js/src/offcanvas.ts
	const NAME$22 = "offcanvas";
	const EVENT_KEY$15 = `.coreui.offcanvas`;
	const DATA_API_KEY$10 = ".data-api";
	const EVENT_LOAD_DATA_API$9 = `load${EVENT_KEY$15}${DATA_API_KEY$10}`;
	const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$15}`;
	const EVENT_RESIZE$2 = `resize${EVENT_KEY$15}`;
	const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$15}${DATA_API_KEY$10}`;
	const OPEN_SELECTOR = "dialog[open]:is(.offcanvas, [class^=\"offcanvas-\"], [class*=\" offcanvas-\"])";
	const SELECTOR_OPEN_RESPONSIVE = "dialog[open]:not(.offcanvas):is([class^=\"offcanvas-\"], [class*=\" offcanvas-\"])";
	const SELECTOR_DATA_TOGGLE$5 = "[data-coreui-toggle=\"offcanvas\"]";
	const SELECTOR_DISMISS_SCOPE = ".offcanvas, .offcanvas-sm, .offcanvas-md, .offcanvas-lg, .offcanvas-xl, .offcanvas-2xl";
	const Default$19 = {
		backdrop: true,
		keyboard: true,
		scroll: false
	};
	const DefaultType$18 = {
		backdrop: "(boolean|string)",
		keyboard: "boolean",
		scroll: "boolean"
	};
	var Offcanvas = class Offcanvas extends DialogBase {
		constructor(element, config) {
			super(resolveDialogElement(element, NAME$22), config);
			this._initResizeObserver();
		}
		static get Default() {
			return Default$19;
		}
		static get DefaultType() {
			return DefaultType$18;
		}
		static get NAME() {
			return NAME$22;
		}
		_getShowOptions() {
			return {
				modal: Boolean(this._config.backdrop) || !this._config.scroll,
				preventBodyScroll: !this._config.scroll
			};
		}
		_shouldDeferClose() {
			return this._isAnimated();
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Offcanvas, config, (element) => [element]);
		}
	};
	EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$5, function(event) {
		const target = resolveDialogElement(SelectorEngine.getElementFromSelector(this), NAME$22);
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if (isDisabled(this)) return;
		EventHandler.one(target, EVENT_HIDDEN$4, () => {
			if (isVisible(this)) this.focus({ preventScroll: true });
		});
		const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
		if (alreadyOpen && alreadyOpen !== target) Offcanvas.getInstance(alreadyOpen)?.hide();
		Offcanvas.getOrCreateInstance(target).toggle(this);
	});
	EventHandler.on(window, EVENT_LOAD_DATA_API$9, () => {
		for (const selector of SelectorEngine.find(OPEN_SELECTOR)) Offcanvas.getOrCreateInstance(selector).show();
	});
	EventHandler.on(window, EVENT_RESIZE$2, () => {
		for (const element of SelectorEngine.find(SELECTOR_OPEN_RESPONSIVE)) if (getComputedStyle(element).position !== "fixed") Offcanvas.getOrCreateInstance(element).hide();
	});
	enableDismissTrigger(Offcanvas, "hide", SELECTOR_DISMISS_SCOPE);
	defineJQueryPlugin(Offcanvas);
	//#endregion
	//#region js/src/otp-input.ts
	const NAME$21 = "otp-input";
	const EVENT_KEY$14 = `.coreui.otp-input`;
	const DATA_API_KEY$9 = ".data-api";
	const ARROW_RIGHT_KEY$3 = "ArrowRight";
	const ARROW_LEFT_KEY$3 = "ArrowLeft";
	const BACKSPACE_KEY = "Backspace";
	const EVENT_BEFORE_INPUT = `beforeinput${EVENT_KEY$14}`;
	const EVENT_CHANGE$5 = `change${EVENT_KEY$14}`;
	const EVENT_COMPLETE = `complete${EVENT_KEY$14}`;
	const EVENT_FOCUS$1 = `focus${EVENT_KEY$14}`;
	const EVENT_INPUT$6 = `input${EVENT_KEY$14}`;
	const EVENT_KEYDOWN$6 = `keydown${EVENT_KEY$14}`;
	const EVENT_PASTE = `paste${EVENT_KEY$14}`;
	const EVENT_LOAD_DATA_API$8 = `load${EVENT_KEY$14}${DATA_API_KEY$9}`;
	const SELECTOR_DATA_OTP = "[data-coreui-otp]";
	const SELECTOR_FORM_OTP_CONTROL = ".form-otp-control";
	const Default$18 = {
		ariaLabel: (index, total) => `Digit ${index + 1} of ${total}`,
		autoSubmit: false,
		disabled: false,
		id: null,
		linear: true,
		masked: false,
		name: null,
		placeholder: null,
		required: false,
		type: "number",
		validationState: null,
		value: null
	};
	const DefaultType$17 = {
		ariaLabel: "function",
		autoSubmit: "boolean",
		disabled: "boolean",
		id: "(string|null)",
		linear: "boolean",
		masked: "boolean",
		name: "(string|null)",
		placeholder: "(number|string|null)",
		required: "boolean",
		type: "string",
		validationState: "(string|null|undefined)",
		value: "(number|string|null)"
	};
	var OTPInput = class OTPInput extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._config = this._getConfig(config);
			this._disabled = this._config.disabled;
			this._inputElement = null;
			this._placeholders = /* @__PURE__ */ new Map();
			this._resetCode = null;
			this._value = "";
			this._validation = new FieldValidation(this._element, {
				canBlock: () => !this._disabled,
				config: () => this._config,
				fields: () => this._inputElement ? [this._inputElement] : [],
				frames: () => [this._element],
				invalidTargets: () => this._getInputs(),
				owned: () => [this._inputElement, ...this._getInputs()],
				restore: () => this._restoreValue(),
				serverClassSources: () => [this._element, ...this._getInputs()]
			});
			this._setRoleAttribute();
			this._setInputsAttributes();
			this._seedSlots(this._config.value);
			this._createValueField();
			this._setInputsTabIndexes();
			this._addEventListeners();
			this._removeLabelClick = onLabelClick(this._element, () => this._getFirstEmptySlot()?.focus());
		}
		static get Default() {
			return Default$18;
		}
		static get DefaultType() {
			return DefaultType$17;
		}
		static get NAME() {
			return NAME$21;
		}
		clear() {
			const inputs = this._getInputs();
			for (const input of inputs) input.value = "";
			this._setValue(null);
			this._syncFirstInputMaxLength();
			this._setInputsTabIndexes();
		}
		dispose() {
			if (!this._element) return;
			this._removeLabelClick();
			this._validation.dispose();
			this._inputElement?.remove();
			this._inputElement = null;
			for (const input of this._placeholders.keys()) this._restorePlaceholder(input);
			super.dispose();
		}
		reset() {
			this._restoreValue();
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
			this._typeCheckConfig({ value }, { value: DefaultType$17.value });
			this._seedSlots(value, true);
			this._setInputsTabIndexes();
			this._value = this._readSlots();
			writeValueField(this._inputElement, this._value);
			this._validation.update();
		}
		_setDisabled(disabled) {
			if (disabled === this._disabled) return;
			this._disabled = disabled;
			for (const input of this._getInputs()) input.disabled = disabled;
			this._inputElement.disabled = disabled;
			this._validation.update();
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_BEFORE_INPUT, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { data, inputType } = event;
				if (inputType === "insertText" && data && data.length === 1 && !this._isValidInput(data)) event.preventDefault();
			});
			EventHandler.on(this._element, EVENT_FOCUS$1, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { target } = event;
				if (target.value) {
					setTimeout(() => {
						target.select();
					}, 0);
					return;
				}
				if (this._config.linear) {
					const firstEmptyInput = this._getInputs().find((input) => !input.value);
					if (firstEmptyInput && firstEmptyInput !== target) firstEmptyInput.focus();
				}
			});
			EventHandler.on(this._element, EVENT_INPUT$6, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { target } = event;
				if (target.value.length > 1) {
					const chars = this._extractValidChars(target.value);
					target.value = "";
					if (chars) {
						this._distributeChars(target, chars);
						return;
					}
				}
				if (target.value.length === 1 && !this._isValidInput(target.value)) target.value = "";
				const inputs = this._getInputs();
				if (!inputs.length) return;
				const value = inputs.map((input) => input.value).join("");
				if (value !== (this._inputElement ? this._inputElement.value : "")) this._setValue(value, true);
				if (target.value.length === 1) {
					const nextInput = getNextActiveElement(inputs, target, true);
					if (nextInput) nextInput.focus();
				}
				this._setInputsTabIndexes();
				this._syncFirstInputMaxLength();
				this._checkAutoSubmit(inputs);
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$6, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { key, target } = event;
				if (key === BACKSPACE_KEY && target.value === "") {
					const inputs = this._getInputs();
					if (!inputs.length) return;
					getNextActiveElement(inputs, target, false).focus();
					this._setInputsTabIndexes();
					return;
				}
				if (key === ARROW_RIGHT_KEY$3 || key === ARROW_LEFT_KEY$3) {
					const shouldMoveNext = key === ARROW_RIGHT_KEY$3 !== isRTL(this._element);
					if (shouldMoveNext && this._config.linear && target.value === "") return;
					const inputs = this._getInputs();
					if (!inputs.length) return;
					getNextActiveElement(inputs, target, shouldMoveNext).focus();
				}
			});
			EventHandler.on(this._element, EVENT_PASTE, SELECTOR_FORM_OTP_CONTROL, (event) => {
				event.preventDefault();
				const pastedData = event.clipboardData.getData("text");
				const validChars = this._extractValidChars(pastedData);
				if (!validChars) return;
				this._distributeChars(event.target, validChars);
			});
		}
		_distributeChars(startInput, chars) {
			const inputs = this._getInputs();
			if (!inputs.length) return;
			const startIndex = chars.length >= inputs.length ? 0 : Math.max(inputs.indexOf(startInput), 0);
			for (let i = 0; i < chars.length && startIndex + i < inputs.length; i++) inputs[startIndex + i].value = chars[i];
			const nextEmptyIndex = startIndex + chars.length;
			inputs[nextEmptyIndex < inputs.length ? nextEmptyIndex : inputs.length - 1].focus();
			this._setValue(inputs.map((input) => input.value).join(""), true);
			this._syncFirstInputMaxLength();
			this._setInputsTabIndexes();
			this._checkAutoSubmit(inputs);
		}
		_syncFirstInputMaxLength() {
			const inputs = this._getInputs();
			const [first] = inputs;
			if (first) first.maxLength = first.value ? 1 : inputs.length;
		}
		_checkAutoSubmit(inputs) {
			if (!this._config.autoSubmit) return;
			if (inputs.every((input) => input.value.length === 1)) {
				const form = this._element.closest("form");
				if (form && typeof form.requestSubmit === "function") form.requestSubmit();
			}
		}
		_getFirstEmptySlot() {
			const inputs = this._getInputs();
			return inputs.find((input) => !input.value) ?? inputs[0];
		}
		_getInputs() {
			return SelectorEngine.find(SELECTOR_FORM_OTP_CONTROL, this._element);
		}
		_readSlots() {
			return this._getInputs().map((input) => input.value).join("");
		}
		_createValueField() {
			const field = createValueField("input", () => this._getFirstEmptySlot());
			this._resetCode = this._extractValidChars(String(this._config.value ?? "")) ? this._readSlots() : null;
			field.defaultValue = this._resetCode ?? this._getInputs().map((input) => input.defaultValue).join("");
			this._value = this._readSlots();
			field.value = this._value;
			this._element.append(field);
			this._inputElement = field;
			this._syncValueField();
		}
		_syncValueField() {
			const field = this._inputElement;
			configureValueField(field, {
				disabled: this._disabled,
				name: this._config.name,
				required: this._config.required
			});
			field.pattern = `${this._config.type === "number" ? "[0-9]" : "."}{${this._getInputs().length}}`;
			if (this._config.id) field.id = this._config.id;
			else field.removeAttribute("id");
			this._validation.refresh();
		}
		_extractValidChars(text) {
			switch (this._config.type) {
				case "number": return text.replace(/\D/g, "");
				default: return text;
			}
		}
		_isValidInput(value) {
			if (value.length !== 1) return false;
			switch (this._config.type) {
				case "number": return /^\d$/.test(value);
				default: return /^.$/s.test(value);
			}
		}
		_setValue(value, byUser = false) {
			if (!this._inputElement) return;
			const code = value || "";
			const isChanged = code !== this._value;
			this._value = code;
			writeValueField(this._inputElement, code);
			if (isChanged && byUser) this._validation.dismiss();
			this._validation.update();
			if (!isChanged) return;
			dispatchValueChange(this._inputElement);
			EventHandler.trigger(this._element, EVENT_CHANGE$5, { value });
			if (value && value.length === this._getInputs().length) EventHandler.trigger(this._element, EVENT_COMPLETE, { value });
		}
		_restoreValue() {
			const code = this._resetCode;
			for (const [index, input] of this._getInputs().entries()) input.value = code === null ? input.defaultValue : code[index] ?? "";
			this._setValue(this._readSlots() || null);
			this._syncFirstInputMaxLength();
			this._setInputsTabIndexes();
		}
		_seedSlots(code, clearWhenEmpty = false) {
			const value = this._extractValidChars(String(code ?? ""));
			if (!value && !clearWhenEmpty) return;
			for (const [index, input] of this._getInputs().entries()) input.value = value[index] ?? "";
			this._syncFirstInputMaxLength();
		}
		_setInputsAttributes() {
			const inputs = this._getInputs();
			for (const [index, input] of inputs.entries()) {
				input.type = this._config.masked ? "password" : "text";
				input.maxLength = 1;
				input.autocomplete = index === 0 ? "one-time-code" : "off";
				input.autocapitalize = "off";
				input.setAttribute("autocorrect", "off");
				input.spellcheck = false;
				input.enterKeyHint = index === inputs.length - 1 ? "done" : "next";
				if (this._config.placeholder !== null) {
					if (!this._placeholders.has(input)) this._placeholders.set(input, input.getAttribute("placeholder"));
					const placeholder = String(this._config.placeholder);
					input.placeholder = placeholder.length > 1 ? placeholder[index] || "" : placeholder;
				}
				writeAttribute(input, "aria-required", this._config.required ? "true" : null);
				switch (this._config.type) {
					case "number":
						input.inputMode = "numeric";
						input.pattern = "[0-9]*";
						break;
					default:
						input.inputMode = "text";
						input.pattern = ".*";
				}
				input.disabled = this._disabled;
				input.readOnly = false;
				if (this._config.id && !input.id) input.id = `${this._config.id}-${index}`;
				if (typeof this._config.ariaLabel === "function") {
					const ariaLabel = this._config.ariaLabel(index, inputs.length);
					input.setAttribute("aria-label", ariaLabel);
				}
			}
			this._syncFirstInputMaxLength();
		}
		_restorePlaceholder(input) {
			const placeholder = this._placeholders.get(input);
			if (typeof placeholder === "string") input.placeholder = placeholder;
			else input.removeAttribute("placeholder");
			this._placeholders.delete(input);
		}
		_setInputsTabIndexes() {
			const inputs = this._getInputs();
			if (!this._config.linear) {
				for (const input of inputs) input.removeAttribute("tabindex");
				return;
			}
			let foundEmpty = false;
			for (const input of inputs) if (input.value !== "") input.removeAttribute("tabindex");
			else if (foundEmpty) input.tabIndex = -1;
			else {
				input.removeAttribute("tabindex");
				foundEmpty = true;
			}
		}
		_setRoleAttribute() {
			this._element.setAttribute("role", "group");
		}
		static otpInputInterface(element, config, ...args) {
			const data = OTPInput.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, OTPInput, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$8, () => {
		for (const otp of SelectorEngine.find(SELECTOR_DATA_OTP)) OTPInput.otpInputInterface(otp);
	});
	defineJQueryPlugin(OTPInput);
	//#endregion
	//#region js/src/password-input.ts
	const NAME$20 = "password-input";
	const EVENT_KEY$13 = `.coreui.password-input`;
	const DATA_API_KEY$8 = ".data-api";
	const EVENT_CLICK$6 = `click${EVENT_KEY$13}`;
	const EVENT_FOCUS = `focus${EVENT_KEY$13}`;
	const CLASS_NAME_ACTION = "form-control-action";
	const CLASS_NAME_PASSWORD_INPUT = "password-input";
	const SELECTOR_DATA_PASSWORD_INPUT = "[data-coreui-password-input]";
	const Default$17 = {
		allowList: SVGAllowlist,
		ariaToggleLabel: "Toggle password visibility",
		hideIcon: PASSWORD_HIDE_ICON,
		sanitize: true,
		sanitizeFn: null,
		showIcon: PASSWORD_SHOW_ICON
	};
	const DefaultType$16 = {
		allowList: "object",
		ariaToggleLabel: "string",
		hideIcon: "string",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		showIcon: "string"
	};
	var PasswordInput = class PasswordInput extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._group = null;
			this._hostType = null;
			this._toggleElement = null;
			this._hostType = this._element.getAttribute("type");
			this._createToggle();
			this._updateToggleState();
			this._updateDisabledState();
		}
		static get Default() {
			return Default$17;
		}
		static get DefaultType() {
			return DefaultType$16;
		}
		static get NAME() {
			return NAME$20;
		}
		toggle() {
			if (this._element.matches(":disabled")) {
				this._updateDisabledState();
				return;
			}
			this._element.type = this._element.type === "password" ? "text" : "password";
			this._updateToggleState();
		}
		dispose() {
			if (!this._element) return;
			if (this._toggleElement) {
				EventHandler.off(this._toggleElement, EVENT_KEY$13);
				this._toggleElement.remove();
			}
			if (this._group) {
				this._group.element.classList.remove(CLASS_NAME_PASSWORD_INPUT);
				releaseControlGroup(this._element, this._group);
			}
			if (this._hostType === null) this._element.removeAttribute("type");
			else this._element.setAttribute("type", this._hostType);
			super.dispose();
		}
		_createToggle() {
			this._group = ensureControlGroup(this._element);
			this._group.element.classList.add(CLASS_NAME_PASSWORD_INPUT);
			this._toggleElement = createControlGroupAction({
				className: CLASS_NAME_ACTION,
				icon: this._config.showIcon,
				label: this._config.ariaToggleLabel,
				sanitizeIcon: (icon) => sanitizeByConfig(icon, this._config)
			});
			EventHandler.on(this._toggleElement, EVENT_CLICK$6, () => this.toggle());
			EventHandler.on(this._element, EVENT_FOCUS, () => this._updateDisabledState());
			this._group.element.append(this._toggleElement);
		}
		_updateDisabledState() {
			if (this._toggleElement) this._toggleElement.disabled = this._element.disabled;
		}
		_updateToggleState() {
			if (!this._toggleElement) return;
			const visible = this._element.type === "text";
			this._toggleElement.setAttribute("aria-pressed", visible ? "true" : "false");
			this._toggleElement.innerHTML = sanitizeByConfig(visible ? this._config.hideIcon : this._config.showIcon, this._config);
		}
		static _initializeDataApi() {
			for (const element of SelectorEngine.find(SELECTOR_DATA_PASSWORD_INPUT)) PasswordInput.getOrCreateInstance(element);
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, PasswordInput, config, (element) => [element]);
		}
	};
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$13}${DATA_API_KEY$8}`, () => {
		PasswordInput._initializeDataApi();
	});
	defineJQueryPlugin(PasswordInput);
	//#endregion
	//#region js/src/password-strength.ts
	const NAME$19 = "password-strength";
	const EVENT_KEY$12 = `.coreui.password-strength`;
	const DATA_API_KEY$7 = ".data-api";
	const EVENT_CHANGE$4 = `change${EVENT_KEY$12}`;
	const EVENT_INPUT$5 = `input${EVENT_KEY$12}`;
	const CLASS_NAME_BUSY = "password-strength-busy";
	const CLASS_NAME_FEEDBACK = "password-strength-feedback";
	const CLASS_NAME_METER = "password-strength-meter";
	const CLASS_NAME_PASSWORD_STRENGTH = "password-strength";
	const CLASS_NAME_SEGMENT = "password-strength-segment";
	const CLASS_NAME_SUGGESTIONS = "password-strength-suggestions";
	const CLASS_NAME_TEXT = "password-strength-text";
	const CLASS_NAME_WARNING = "password-strength-warning";
	const SELECTOR_DATA_PASSWORD_STRENGTH = "[data-coreui-password-strength]";
	const SELECTOR_PASSWORD = "input[type=\"password\"], input[data-coreui-password-input]";
	const Default$16 = {
		busyLabel: "Checking…",
		debounce: 200,
		input: null,
		levels: [
			"Very weak",
			"Weak",
			"Fair",
			"Good",
			"Strong"
		],
		minLength: 8,
		scorer: null,
		thresholds: [
			2,
			4,
			6
		],
		userInputs: [],
		weights: {
			minLength: 1,
			extraLength: 1,
			longPassword: 1,
			lowercase: 1,
			uppercase: 1,
			numbers: 1,
			special: 1,
			multipleSpecial: 1
		}
	};
	const DefaultType$15 = {
		busyLabel: "string",
		debounce: "number",
		input: "(string|element|null)",
		levels: "array",
		minLength: "number",
		scorer: "(function|null)",
		thresholds: "array",
		userInputs: "(array|function)",
		weights: "object"
	};
	const isThenable = (value) => Boolean(value) && typeof value.then === "function";
	var PasswordStrength = class PasswordStrength extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._input = null;
			this._meterElement = null;
			this._textElement = null;
			this._warningElement = null;
			this._suggestionsElement = null;
			this._segments = [];
			this._score = null;
			this._timeout = null;
			this._token = 0;
			this._input = this._getInput();
			this._createMeter();
			if (this._input) {
				EventHandler.on(this._input, EVENT_INPUT$5, () => this._schedule());
				EventHandler.on(this._input, EVENT_CHANGE$4, () => this._schedule());
				this._evaluate();
			}
		}
		static get Default() {
			return Default$16;
		}
		static get DefaultType() {
			return DefaultType$15;
		}
		static get NAME() {
			return NAME$19;
		}
		getScore() {
			return this._score;
		}
		evaluate() {
			this._evaluate();
		}
		dispose() {
			if (this._timeout) clearTimeout(this._timeout);
			if (this._input) EventHandler.off(this._input, EVENT_KEY$12);
			this._meterElement?.remove();
			SelectorEngine.findOne(`.${CLASS_NAME_FEEDBACK}`, this._element)?.remove();
			this._element.classList.remove(CLASS_NAME_BUSY);
			super.dispose();
		}
		_getInput() {
			if (this._config.input) return typeof this._config.input === "string" ? SelectorEngine.findOne(this._config.input) : this._config.input;
			const parent = this._element.parentElement;
			return parent ? SelectorEngine.findOne(SELECTOR_PASSWORD, parent) : null;
		}
		_createMeter() {
			this._element.classList.add(CLASS_NAME_PASSWORD_STRENGTH);
			const meter = document.createElement("div");
			meter.classList.add(CLASS_NAME_METER);
			meter.setAttribute("aria-hidden", "true");
			for (let index = 0; index < this._config.levels.length - 1; index++) {
				const segment = document.createElement("span");
				segment.classList.add(CLASS_NAME_SEGMENT);
				meter.append(segment);
				this._segments.push(segment);
			}
			const feedback = document.createElement("div");
			feedback.classList.add(CLASS_NAME_FEEDBACK);
			feedback.setAttribute("role", "status");
			feedback.setAttribute("aria-live", "polite");
			this._textElement = document.createElement("span");
			this._textElement.classList.add(CLASS_NAME_TEXT);
			this._warningElement = document.createElement("span");
			this._warningElement.classList.add(CLASS_NAME_WARNING);
			this._suggestionsElement = document.createElement("ul");
			this._suggestionsElement.classList.add(CLASS_NAME_SUGGESTIONS);
			feedback.append(this._textElement, this._warningElement, this._suggestionsElement);
			this._meterElement = meter;
			this._element.append(meter, feedback);
		}
		_schedule() {
			if (this._timeout) clearTimeout(this._timeout);
			if (this._config.debounce > 0) {
				this._timeout = setTimeout(() => this._evaluate(), this._config.debounce);
				return;
			}
			this._evaluate();
		}
		_evaluate() {
			const password = this._input ? this._input.value : "";
			this._token += 1;
			const token = this._token;
			if (!password) {
				this._setBusy(false);
				this._apply(null, "");
				return;
			}
			const userInputs = this._getUserInputs();
			if (typeof this._config.scorer !== "function") {
				this._setBusy(false);
				this._apply(this._normalize(this._builtInScore(password, userInputs)), password);
				return;
			}
			let result;
			try {
				result = this._config.scorer(password, userInputs);
			} catch {
				this._setBusy(false);
				this._apply(null, password);
				return;
			}
			if (!isThenable(result)) {
				this._setBusy(false);
				this._apply(this._normalize(result), password);
				return;
			}
			this._setBusy(true);
			result.then((value) => {
				if (token !== this._token) return;
				this._setBusy(false);
				this._apply(this._normalize(value), password);
			}, () => {
				if (token !== this._token) return;
				this._setBusy(false);
				this._apply(null, password);
			});
		}
		_getUserInputs() {
			const { userInputs } = this._config;
			const values = typeof userInputs === "function" ? userInputs() : userInputs;
			return Array.isArray(values) ? values.filter(Boolean).map(String) : [];
		}
		_configAfterMerge(config) {
			if (config.weights && typeof config.weights === "object" && !Array.isArray(config.weights)) config.weights = Object.fromEntries(Object.entries(Default$16.weights).map(([rule, weight]) => [rule, Number.isFinite(config.weights[rule]) ? config.weights[rule] : weight]));
			if (Array.isArray(config.thresholds)) config.thresholds = Default$16.thresholds.map((threshold, index) => Number.isFinite(config.thresholds[index]) ? config.thresholds[index] : threshold);
			return config;
		}
		_normalize(result) {
			if (typeof result === "number" && Number.isFinite(result)) return { score: this._clamp(result) };
			if (result && typeof result === "object") {
				const { score, warning, suggestions } = result;
				if (typeof score === "number" && Number.isFinite(score)) return {
					score: this._clamp(score),
					warning,
					suggestions
				};
			}
			return null;
		}
		_clamp(score) {
			return Math.max(0, Math.min(this._config.levels.length - 1, Math.round(score)));
		}
		_builtInScore(password, userInputs) {
			const lowered = password.toLowerCase();
			for (const value of userInputs) {
				const needle = value.trim().toLowerCase();
				if (needle.length >= 3 && lowered.includes(needle)) return { score: 0 };
			}
			const { minLength, weights } = this._config;
			let points = 0;
			if (password.length >= minLength) points += weights.minLength;
			if (password.length >= minLength + 4) points += weights.extraLength;
			if (password.length >= 16) points += weights.longPassword;
			if (/[a-z]/.test(password)) points += weights.lowercase;
			if (/[A-Z]/.test(password)) points += weights.uppercase;
			if (/\d/.test(password)) points += weights.numbers;
			if (/[^\w\s]/.test(password)) points += weights.special;
			if (/[^\w\s].*[^\w\s]/.test(password)) points += weights.multipleSpecial;
			const [weak, fair, good] = this._config.thresholds;
			if (points <= weak) return { score: 1 };
			if (points <= fair) return { score: 2 };
			if (points <= good) return { score: 3 };
			return { score: 4 };
		}
		_setBusy(busy) {
			this._element.classList.toggle(CLASS_NAME_BUSY, busy);
			if (busy && this._textElement) this._textElement.textContent = this._config.busyLabel;
		}
		_apply(result, password) {
			const score = result ? result.score : null;
			const changed = score !== this._score;
			this._score = score;
			this._render(result);
			if (!changed) return;
			EventHandler.trigger(this._element, EVENT_CHANGE$4, {
				score,
				level: score === null ? null : this._config.levels[score],
				password: password.length > 0 ? "***" : ""
			});
		}
		_render(result) {
			const score = result ? result.score : null;
			if (score === null) delete this._element.dataset.coreuiStrength;
			else this._element.dataset.coreuiStrength = String(score);
			for (const [index, segment] of this._segments.entries()) segment.classList.toggle("active", score !== null && index < score);
			if (this._textElement) this._textElement.textContent = score === null ? "" : this._config.levels[score];
			if (this._warningElement) this._warningElement.textContent = result?.warning ?? "";
			if (this._suggestionsElement) {
				this._suggestionsElement.replaceChildren();
				for (const suggestion of result?.suggestions ?? []) {
					const item = document.createElement("li");
					item.textContent = suggestion;
					this._suggestionsElement.append(item);
				}
			}
		}
		static _initializeDataApi() {
			for (const element of SelectorEngine.find(SELECTOR_DATA_PASSWORD_STRENGTH)) PasswordStrength.getOrCreateInstance(element);
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, PasswordStrength, config, (element) => [element]);
		}
	};
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$12}${DATA_API_KEY$7}`, () => {
		PasswordStrength._initializeDataApi();
	});
	defineJQueryPlugin(PasswordStrength);
	//#endregion
	//#region js/src/util/template-factory.ts
	const NAME$18 = "TemplateFactory";
	const Default$15 = {
		allowList: DefaultAllowlist,
		content: {},
		extraClass: "",
		html: false,
		sanitize: true,
		sanitizeFn: null,
		template: "<div></div>"
	};
	const DefaultType$14 = {
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
	var TemplateFactory = class extends Config {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
		}
		static get Default() {
			return Default$15;
		}
		static get DefaultType() {
			return DefaultType$14;
		}
		static get NAME() {
			return NAME$18;
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
			const templateElement = SelectorEngine.findOne(selector, template);
			if (!templateElement) return;
			content = this._resolvePossibleFunction(content);
			if (!content) {
				templateElement.remove();
				return;
			}
			if (isElement(content)) {
				this._putElementInTemplate(getElement(content), templateElement);
				return;
			}
			if (this._config.html) {
				templateElement.innerHTML = this._maybeSanitize(content);
				return;
			}
			templateElement.textContent = content;
		}
		_maybeSanitize(arg) {
			return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
		}
		_resolvePossibleFunction(arg) {
			return execute(arg, [void 0, this]);
		}
		_putElementInTemplate(element, templateElement) {
			if (this._config.html) {
				templateElement.replaceChildren(element);
				return;
			}
			templateElement.textContent = element.textContent;
		}
	};
	//#endregion
	//#region js/src/tooltip.ts
	const NAME$17 = "tooltip";
	const ESCAPE_KEY = "Escape";
	const CLASS_NAME_MODAL = "modal";
	const CLASS_NAME_SHOW$6 = "show";
	const SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
	const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
	const SELECTOR_DATA_TOGGLE$4 = "[data-coreui-toggle=\"tooltip\"]";
	const EVENT_MODAL_HIDE = "hide.coreui.modal";
	const TRIGGER_HOVER = "hover";
	const TRIGGER_FOCUS = "focus";
	const TRIGGER_CLICK = "click";
	const TRIGGER_MANUAL = "manual";
	const EVENT_HIDE$3 = "hide";
	const EVENT_HIDDEN$3 = "hidden";
	const EVENT_SHOW$3 = "show";
	const EVENT_SHOWN$3 = "shown";
	const EVENT_INSERTED = "inserted";
	const EVENT_CLICK$5 = "click";
	const EVENT_FOCUSIN$4 = "focusin";
	const EVENT_FOCUSOUT$3 = "focusout";
	const EVENT_MOUSEENTER$2 = "mouseenter";
	const EVENT_MOUSELEAVE$1 = "mouseleave";
	const EVENT_KEYDOWN$5 = "keydown";
	const EVENT_POINTERCANCEL$1 = "pointercancel";
	const EVENT_POINTERDOWN$1 = "pointerdown";
	const ATTACHMENTS = {
		AUTO: ["auto", "auto"],
		TOP: ["top", "top"],
		RIGHT: ["right", "left"],
		BOTTOM: ["bottom", "bottom"],
		LEFT: ["left", "right"],
		START: ["left", "right"],
		END: ["right", "left"]
	};
	const Default$14 = {
		allowList: DefaultAllowlist,
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
	const DefaultType$13 = {
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
	var Tooltip = class Tooltip extends BaseComponent {
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
			this._focusOutsideHandler = null;
			this._pressedInside = false;
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
			return Default$14;
		}
		static get DefaultType() {
			return DefaultType$13;
		}
		static get NAME() {
			return NAME$17;
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
			this._removeFocusOutsideListener();
			EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
			if (this._element.getAttribute("data-coreui-original-title")) this._element.setAttribute("title", this._element.getAttribute("data-coreui-original-title"));
			this._disposeFloating();
			this._disposeMediaQueryListeners();
			super.dispose();
		}
		async show() {
			if (this._element.style.display === "none") throw new Error("Please use show on visible elements");
			if (!(this._isWithContent() && this._isEnabled)) return;
			const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$3));
			const isInTheDom = (findShadowRoot(this._element) || this._element.ownerDocument.documentElement).contains(this._element);
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
				EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
				this._setTipListeners(tip);
			}
			await this._createFloating(tip);
			tip.classList.add(CLASS_NAME_SHOW$6);
			this._setEscapeListener();
			this._setFocusOutsideListener();
			if ("ontouchstart" in document.documentElement) for (const element of document.body.children) EventHandler.on(element, "mouseover", noop);
			const complete = () => {
				EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$3));
				if (this._isHovered === false) this._leave();
				this._isHovered = false;
			};
			await this._queueCallback(complete, this.tip, this._isAnimated());
		}
		async hide() {
			if (!this._isShown()) return;
			if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$3)).defaultPrevented) return;
			this._removeEscapeListener();
			this._removeFocusOutsideListener();
			this._getTipElement().classList.remove(CLASS_NAME_SHOW$6);
			if ("ontouchstart" in document.documentElement) for (const element of document.body.children) EventHandler.off(element, "mouseover", noop);
			this._activeTrigger[TRIGGER_CLICK] = false;
			this._activeTrigger[TRIGGER_FOCUS] = false;
			this._activeTrigger[TRIGGER_HOVER] = false;
			this._isHovered = null;
			const complete = () => {
				if (this._isWithActiveTrigger()) return;
				if (!this._isHovered) this._disposeFloating();
				this._element.removeAttribute("aria-describedby");
				EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$3));
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
			tip.classList.remove(CLASS_NAME_SHOW$6);
			tip.classList.add(`bs-${this.constructor.NAME}-auto`);
			const tipId = getUID(this.constructor.NAME).toString();
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
			else this._templateFactory = new TemplateFactory({
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
			return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$6);
		}
		_getPlacement(tip) {
			if (this._responsivePlacements) return this._attachment(getResponsivePlacement(this._responsivePlacements, "top"));
			return this._attachment(execute(this._config.placement, [
				this,
				tip,
				this._element
			]));
		}
		_attachment(placement) {
			return ATTACHMENTS[placement.toUpperCase()]?.[this._isRTL() ? 1 : 0] ?? placement;
		}
		_isRTL() {
			return isRTL(this._element.parentElement ?? this._element);
		}
		_parseResponsivePlacements() {
			if (typeof this._config.placement !== "string") {
				this._responsivePlacements = null;
				return;
			}
			this._responsivePlacements = parseResponsivePlacement(this._config.placement, "top");
			if (this._responsivePlacements) this._setupMediaQueryListeners();
		}
		_setupMediaQueryListeners() {
			this._disposeMediaQueryListeners();
			this._mediaQueryListeners = createBreakpointListeners(() => {
				if (this._isShown()) this._updateFloatingPosition();
			});
		}
		_disposeMediaQueryListeners() {
			disposeBreakpointListeners(this._mediaQueryListeners);
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
			Manipulator.setDataAttribute(tip, "placement", floatingConfig.placement);
			let { x, y, placement: finalPlacement, middlewareData } = await (0, _floating_ui_dom.computePosition)(this._element, tip, floatingConfig);
			if (finalPlacement !== floatingConfig.placement) {
				Manipulator.setDataAttribute(tip, "placement", finalPlacement);
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
					top: isVertical || arrowY === void 0 ? "" : `${arrowY}px`,
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
				return toFloatingOffset(result);
			};
			return offset;
		}
		_resolvePossibleFunction(arg) {
			return execute(arg, [this._element, this._element]);
		}
		_getFloatingMiddleware(arrowElement) {
			const offsetValue = this._getOffset();
			const middleware = [
				(0, _floating_ui_dom.offset)(typeof offsetValue === "function" ? offsetValue : toFloatingOffset(offsetValue)),
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
				...execute(this._config.floatingConfig, [void 0, defaultConfig])
			};
		}
		_setListeners() {
			const triggers = this._config.trigger.split(" ");
			for (const trigger of triggers) if (trigger === "click") EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$5), this._config.selector, (event) => {
				const context = this._initializeOnDelegatedTarget(event);
				context._activeTrigger[TRIGGER_CLICK] = !(context._isShown() && context._activeTrigger[TRIGGER_CLICK]);
				context.toggle();
			});
			else if (trigger !== TRIGGER_MANUAL) {
				const [eventIn, eventOut] = this._getTriggerEvents(trigger);
				EventHandler.on(this._element, eventIn, this._config.selector, (event) => {
					const context = this._initializeOnDelegatedTarget(event);
					context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
					context._enter();
				});
				EventHandler.on(this._element, eventOut, this._config.selector, (event) => {
					const context = this._initializeOnDelegatedTarget(event);
					if (event.type === "focusout" && context._pressedInside) return;
					context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._isInside(event.relatedTarget);
					context._leave();
				});
			}
			this._hideModalHandler = () => {
				if (this._element) this.hide();
			};
			EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
		}
		_setTipListeners(tip) {
			const trigger = this._getTrigger();
			if (trigger === TRIGGER_MANUAL || trigger.includes(TRIGGER_CLICK)) return;
			this._tipEventOut = (event) => {
				if (event.type === "focusout" && this._pressedInside) return;
				this._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = this._isInside(event.relatedTarget);
				this._leave();
			};
			for (const name of trigger.split(" ")) if (name === TRIGGER_HOVER || name === TRIGGER_FOCUS) {
				const [, eventOut] = this._getTriggerEvents(name);
				EventHandler.on(tip, eventOut, this._tipEventOut);
			}
		}
		_removeTipListeners(tip) {
			if (!this._tipEventOut) return;
			const trigger = this._getTrigger();
			for (const name of trigger.split(" ")) if (name === TRIGGER_HOVER || name === TRIGGER_FOCUS) {
				const [, eventOut] = this._getTriggerEvents(name);
				EventHandler.off(tip, eventOut, this._tipEventOut);
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
				[TRIGGER_HOVER]: [this.constructor.eventName(EVENT_MOUSEENTER$2), this.constructor.eventName(EVENT_MOUSELEAVE$1)],
				[TRIGGER_FOCUS]: [this.constructor.eventName(EVENT_FOCUSIN$4), this.constructor.eventName(EVENT_FOCUSOUT$3)]
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
			this._element.ownerDocument.addEventListener(EVENT_KEYDOWN$5, this._keydownHandler, true);
		}
		_removeEscapeListener() {
			if (!this._keydownHandler) return;
			this._element.ownerDocument.removeEventListener(EVENT_KEYDOWN$5, this._keydownHandler, true);
			this._keydownHandler = null;
		}
		_setFocusOutsideListener() {
			if (this._focusOutsideHandler || !this._getTrigger().split(" ").includes(TRIGGER_FOCUS)) return;
			this._focusOutsideHandler = (event) => {
				const inside = event.composedPath().some((node) => node === this._element || node === this.tip || node.getAttribute?.("role") === "tooltip");
				if (event.type === EVENT_POINTERDOWN$1) {
					this._pressedInside = inside;
					return;
				}
				const pressedInside = this._pressedInside;
				this._pressedInside = false;
				if (inside || event.type === EVENT_POINTERCANCEL$1 || event.type === EVENT_CLICK$5 && pressedInside || !this._activeTrigger[TRIGGER_FOCUS] || [this._element, this.tip].some((element) => containsFocus(element))) return;
				this._activeTrigger[TRIGGER_FOCUS] = false;
				this._leave();
			};
			for (const type of [
				EVENT_POINTERDOWN$1,
				EVENT_POINTERCANCEL$1,
				EVENT_CLICK$5,
				EVENT_FOCUSIN$4
			]) this._element.ownerDocument.addEventListener(type, this._focusOutsideHandler, true);
		}
		_removeFocusOutsideListener() {
			if (!this._focusOutsideHandler) return;
			for (const type of [
				EVENT_POINTERDOWN$1,
				EVENT_POINTERCANCEL$1,
				EVENT_CLICK$5,
				EVENT_FOCUSIN$4
			]) this._element.ownerDocument.removeEventListener(type, this._focusOutsideHandler, true);
			this._focusOutsideHandler = null;
			this._pressedInside = false;
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
			config.container = config.container === false ? document.body : getElement(config.container);
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
			return jQueryDispatch(this, Tooltip, config, args);
		}
	};
	const initTooltip = (event) => {
		const target = event.target.closest(SELECTOR_DATA_TOGGLE$4);
		if (!target) return;
		Tooltip.getOrCreateInstance(target);
	};
	EventHandler.on(document, EVENT_FOCUSIN$4, SELECTOR_DATA_TOGGLE$4, initTooltip);
	EventHandler.on(document, EVENT_MOUSEENTER$2, SELECTOR_DATA_TOGGLE$4, initTooltip);
	defineJQueryPlugin(Tooltip);
	//#endregion
	//#region js/src/popover.ts
	const NAME$16 = "popover";
	const SELECTOR_TITLE$1 = ".popover-header";
	const SELECTOR_CONTENT = ".popover-body";
	const SELECTOR_DATA_TOGGLE$3 = "[data-coreui-toggle=\"popover\"]";
	const EVENT_CLICK$4 = "click";
	const EVENT_FOCUSIN$3 = "focusin";
	const EVENT_MOUSEENTER$1 = "mouseenter";
	const Default$13 = {
		...Tooltip.Default,
		content: "",
		offset: [0, 8],
		placement: "right",
		template: "<div class=\"popover\" role=\"tooltip\"><div class=\"popover-arrow\"></div><h3 class=\"popover-header\"></h3><div class=\"popover-body\"></div></div>",
		trigger: "click"
	};
	const DefaultType$12 = {
		...Tooltip.DefaultType,
		content: "(null|string|element|function)"
	};
	var Popover = class Popover extends Tooltip {
		constructor(element, config) {
			super(element, config);
		}
		static get Default() {
			return Default$13;
		}
		static get DefaultType() {
			return DefaultType$12;
		}
		static get NAME() {
			return NAME$16;
		}
		_isWithContent() {
			return Boolean(this._getTitle() || this._getContent()) || this._hasNewContent();
		}
		_getContentForTemplate() {
			return {
				[SELECTOR_TITLE$1]: this._getTitle(),
				[SELECTOR_CONTENT]: this._getContent()
			};
		}
		_getContent() {
			return this._resolvePossibleFunction(this._config.content);
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, Popover, config, args);
		}
	};
	const initPopover = (event) => {
		const target = event.target.closest(SELECTOR_DATA_TOGGLE$3);
		if (!target) return;
		if (event.type === "click") event.preventDefault();
		Popover.getOrCreateInstance(target);
	};
	EventHandler.on(document, EVENT_CLICK$4, SELECTOR_DATA_TOGGLE$3, initPopover);
	EventHandler.on(document, EVENT_FOCUSIN$3, SELECTOR_DATA_TOGGLE$3, initPopover);
	EventHandler.on(document, EVENT_MOUSEENTER$1, SELECTOR_DATA_TOGGLE$3, initPopover);
	defineJQueryPlugin(Popover);
	//#endregion
	//#region js/src/progress.ts
	const NAME$15 = "progress";
	const EVENT_DOM_CONTENT_LOADED$1 = `DOMContentLoaded.coreui.progress.data-api`;
	const SELECTOR_PROGRESS = ".progress-segmented";
	const SELECTOR_BAR = ".progress-bar";
	const ATTRIBUTE_VALUE_NOW = "aria-valuenow";
	const ATTRIBUTE_VALUE_MIN = "aria-valuemin";
	const ATTRIBUTE_VALUE_MAX = "aria-valuemax";
	const PROPERTY_SEGMENTS = "--cui-progress-segments";
	const PROPERTY_SEGMENTS_FIT = "--cui-progress-segments-fit";
	const PROPERTY_SEGMENT_RADIUS_FIT = "--cui-progress-segment-radius-fit";
	const PROPERTY_SEGMENTS_FILLED = "--cui-progress-segments-filled";
	const PROPERTY_SEGMENT_GAP = "--cui-progress-segment-gap";
	const PROPERTY_SEGMENT_MIN_WIDTH = "--cui-progress-segment-min-width";
	const PROPERTY_SEGMENT_BORDER_RADIUS = "--cui-progress-segment-border-radius";
	var Progress = class Progress extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			if (!this._element) return;
			this._resizeObserver = new ResizeObserver(() => this._update());
			this._resizeObserver.observe(this._element);
			this._update();
		}
		static get NAME() {
			return NAME$15;
		}
		update() {
			this._update();
		}
		dispose() {
			this._resizeObserver?.disconnect();
			this._element.style.removeProperty(PROPERTY_SEGMENTS_FIT);
			this._element.style.removeProperty(PROPERTY_SEGMENT_RADIUS_FIT);
			this._getBar()?.style.removeProperty(PROPERTY_SEGMENTS_FILLED);
			super.dispose();
		}
		_getBar() {
			return SelectorEngine.children(this._element, SELECTOR_BAR)[0];
		}
		_attribute(bar, name, fallback) {
			const value = Number.parseFloat(bar.getAttribute(name) ?? "");
			return Number.isNaN(value) ? fallback : value;
		}
		_ratio(bar) {
			const min = this._attribute(bar, ATTRIBUTE_VALUE_MIN, 0);
			const span = this._attribute(bar, ATTRIBUTE_VALUE_MAX, 100) - min;
			return span > 0 ? Math.min(Math.max((this._attribute(bar, ATTRIBUTE_VALUE_NOW, min) - min) / span, 0), 1) : 0;
		}
		_length(value) {
			const number = Number.parseFloat(value);
			if (Number.isNaN(number)) return 0;
			if (value.endsWith("rem")) return number * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
			if (value.endsWith("em")) return number * Number.parseFloat(getComputedStyle(this._element).fontSize);
			return number;
		}
		_segmentsThatFit() {
			const style = getComputedStyle(this._element);
			const segments = Number.parseInt(style.getPropertyValue(PROPERTY_SEGMENTS), 10) || Number.POSITIVE_INFINITY;
			const gap = this._length(style.getPropertyValue(PROPERTY_SEGMENT_GAP));
			const minWidth = this._length(style.getPropertyValue(PROPERTY_SEGMENT_MIN_WIDTH));
			const { width } = this._element.getBoundingClientRect();
			if (minWidth <= 0 || width <= 0) return segments;
			return Math.max(1, Math.min(segments, Math.floor((width + gap) / (minWidth + gap))));
		}
		_radiusThatFits(segments) {
			const style = getComputedStyle(this._element);
			const gap = this._length(style.getPropertyValue(PROPERTY_SEGMENT_GAP));
			const radius = this._length(style.getPropertyValue(PROPERTY_SEGMENT_BORDER_RADIUS));
			const { width, height } = this._element.getBoundingClientRect();
			const segmentWidth = (width + gap) / segments - gap;
			return Math.round(Math.max(0, Math.min(radius, segmentWidth / 2, height / 2)) * 1e3) / 1e3;
		}
		_update() {
			const bar = this._getBar();
			if (!bar) return;
			const segments = this._segmentsThatFit();
			if (!Number.isFinite(segments)) {
				this._element.style.removeProperty(PROPERTY_SEGMENTS_FIT);
				this._element.style.removeProperty(PROPERTY_SEGMENT_RADIUS_FIT);
				bar.style.removeProperty(PROPERTY_SEGMENTS_FILLED);
				return;
			}
			this._element.style.setProperty(PROPERTY_SEGMENTS_FIT, `${segments}`);
			this._element.style.setProperty(PROPERTY_SEGMENT_RADIUS_FIT, `${this._radiusThatFits(segments)}px`);
			if (!bar.hasAttribute(ATTRIBUTE_VALUE_NOW)) return;
			bar.style.setProperty(PROPERTY_SEGMENTS_FILLED, `${Math.floor(this._ratio(bar) * segments)}`);
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Progress, config, (element) => [element]);
		}
	};
	EventHandler.on(document, EVENT_DOM_CONTENT_LOADED$1, () => {
		for (const element of SelectorEngine.find(SELECTOR_PROGRESS)) Progress.getOrCreateInstance(element);
	});
	defineJQueryPlugin(Progress);
	//#endregion
	//#region js/src/util/range.ts
	const TOLERANCE = 1e-9;
	const getBound = (input, name) => input[name] === "" ? name === "min" ? 0 : 100 : Number.parseFloat(input[name]);
	const constrainInput = (input, previous, next, distance) => {
		if (previous && Number(input.value) < Number(previous.value) + distance - TOLERANCE) {
			setInputValue(input, Number(previous.value) + distance);
			if (Number(input.value) < Number(previous.value) + distance - TOLERANCE && input.step !== "any") input.stepUp();
		}
		if (next && Number(input.value) > Number(next.value) - distance + TOLERANCE) {
			setInputValue(input, Number(next.value) - distance);
			if (Number(input.value) > Number(next.value) - distance + TOLERANCE && input.step !== "any") input.stepDown();
		}
	};
	const createTicks = (points, vertical) => {
		const ticks = document.createElement("div");
		ticks.className = "form-range-ticks";
		ticks.setAttribute("aria-hidden", "true");
		const stops = [
			0,
			...points.map((point) => point.ratio),
			1
		];
		const tracks = stops.slice(1).map((stop, index) => `${stop - stops[index]}fr`);
		if (vertical) ticks.style.gridTemplateRows = tracks.toReversed().join(" ");
		else ticks.style.gridTemplateColumns = tracks.join(" ");
		for (const [index, point] of points.entries()) {
			const tick = document.createElement("span");
			tick.className = "form-range-tick";
			tick.classList.toggle("form-range-tick-start", point.ratio === 0);
			tick.classList.toggle("form-range-tick-end", point.ratio === 1);
			tick.setAttribute("data-coreui-value", `${point.value}`);
			if (vertical) tick.style.gridRowStart = `${points.length - index + 1}`;
			else tick.style.gridColumnStart = `${index + 2}`;
			if (point.class) tick.classList.add(...[point.class].flat().flatMap((name) => name.split(" ")).filter(Boolean));
			if (point.style && typeof point.style === "object") Object.assign(tick.style, point.style);
			if (point.label) {
				const label = document.createElement("span");
				label.className = "form-range-tick-label";
				label.textContent = point.label;
				tick.append(label);
			}
			ticks.append(tick);
		}
		return ticks;
	};
	const createTooltip = (placement, tooltipClass, always) => {
		const tooltip = document.createElement("div");
		tooltip.className = `form-range-tooltip tooltip ${placement}`;
		tooltip.classList.toggle("show", always);
		tooltip.classList.add(...tooltipClass.split(" ").filter(Boolean));
		tooltip.setAttribute("aria-hidden", "true");
		const arrow = document.createElement("div");
		arrow.className = "tooltip-arrow";
		const inner = document.createElement("div");
		inner.className = "tooltip-inner";
		tooltip.append(arrow, inner);
		return tooltip;
	};
	const getNearestInput = (inputs, ratio) => {
		const enabled = inputs.filter((input) => !input.matches(":disabled"));
		if (enabled.length === 0) return null;
		const ratios = enabled.map((input) => getRatio(input));
		if (ratio <= ratios[0]) return enabled[0];
		if (ratio >= ratios.at(-1)) return enabled.at(-1);
		const distances = ratios.map((value) => Math.abs(value - ratio));
		const closest = Math.min(...distances);
		const first = distances.indexOf(closest);
		return enabled[ratio < ratios[first] ? first : distances.lastIndexOf(closest)];
	};
	const getRatio = (input) => {
		const min = getBound(input, "min");
		const span = getBound(input, "max") - min;
		return span > 0 ? (Number.parseFloat(input.value) - min) / span : 0;
	};
	const getRatioAt = (point, rect, thumb, vertical, rtl) => {
		const length = (vertical ? rect.height : rect.width) - thumb;
		const offset = vertical ? rect.bottom - point.clientY : rtl ? rect.right - point.clientX : point.clientX - rect.left;
		return length > 0 ? Math.min(Math.max((offset - thumb / 2) / length, 0), 1) : 0;
	};
	const getStackOrder = (ratio, index, total) => ratio > .5 ? total - index : index + 1;
	const getStep = (input) => {
		if (input.step === "any") return (getBound(input, "max") - getBound(input, "min")) / 100;
		const step = Number.parseFloat(input.step);
		return step > 0 ? step : 1;
	};
	const getThumbSize = (element) => {
		const probe = document.createElement("div");
		probe.style.cssText = "position: absolute; visibility: hidden; width: var(--cui-range-thumb-width);";
		element.append(probe);
		const { width } = probe.getBoundingClientRect();
		probe.remove();
		return width;
	};
	const getTickLabel = (points, value, step) => points.find((point) => point.label && Math.abs(point.value - value) < step / 2 + TOLERANCE)?.label ?? null;
	const getTickPoints = (input, ticks, list) => {
		const min = getBound(input, "min");
		const max = getBound(input, "max");
		const points = [];
		if (Array.isArray(ticks)) for (const { index, ratio, value } of getTickPositions(min, max, ticks)) {
			const tick = ticks[index];
			const options = typeof tick === "object" && tick !== null ? tick : void 0;
			points.push({
				class: options?.class,
				label: typeof tick === "string" ? tick : options?.label ?? "",
				ratio,
				style: options?.style,
				value
			});
		}
		const listId = list ?? input.getAttribute("list");
		const datalist = listId ? document.getElementById(listId) : null;
		if (datalist) {
			const options = [...datalist.querySelectorAll("option")];
			for (const { index, ratio, value } of getTickPositions(min, max, options.map((option) => Number.parseFloat(option.value)))) points.push({
				label: options[index].label,
				ratio,
				value
			});
		}
		return points.toSorted((a, b) => a.ratio - b.ratio);
	};
	const getTickPositions = (min, max, ticks) => {
		const span = max - min || 1;
		return ticks.map((tick, index) => {
			const own = tick !== null && typeof tick === "object" ? tick.value : void 0;
			const value = typeof tick === "number" ? tick : own === void 0 || own === null ? min + (ticks.length === 1 ? 0 : index / (ticks.length - 1) * span) : Number(own);
			return {
				index,
				ratio: Math.min(Math.max((value - min) / span, 0), 1),
				value
			};
		}).filter((position) => Number.isFinite(position.value)).toSorted((a, b) => a.ratio - b.ratio);
	};
	const getValueText = (value, label, html) => {
		if (html === null) return label === null ? null : `${value}, ${label}`;
		const template = document.createElement("template");
		template.innerHTML = html;
		for (const lineBreak of template.content.querySelectorAll("br")) lineBreak.replaceWith(" ");
		const text = (template.content.textContent ?? "").replaceAll(/\s+/g, " ").trim();
		return label === null || label === text ? text : `${text}, ${label}`;
	};
	const setInputValue = (input, value) => {
		Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, `${value}`);
	};
	//#endregion
	//#region js/src/range.ts
	const NAME$14 = "range";
	const EVENT_KEY$11 = `.coreui.range`;
	const DATA_API_KEY$6 = ".data-api";
	const DATA_KEY_RANGE_SLIDER = "coreui.range-slider";
	const EVENT_CHANGE$3 = `change${EVENT_KEY$11}`;
	const EVENT_CHANGED = `changed${EVENT_KEY$11}`;
	const EVENT_INPUT$4 = `input${EVENT_KEY$11}`;
	const EVENT_RESET$1 = `reset${EVENT_KEY$11}`;
	const EVENT_DOM_CONTENT_LOADED = `DOMContentLoaded${EVENT_KEY$11}${DATA_API_KEY$6}`;
	const SELECTOR_RANGE = ".form-range:has(> .form-range-input)";
	const SELECTOR_INPUT$1 = ".form-range-input";
	const CLASS_NAME_TOOLTIP_TOP$1 = "bs-tooltip-top";
	const PROPERTY_FILL$1 = "--cui-range-fill";
	const Default$12 = {
		allowList: DefaultAllowlist,
		list: null,
		sanitize: true,
		sanitizeFn: null,
		ticks: false,
		tooltipClass: "",
		tooltips: false,
		tooltipsFormat: null,
		track: "fill"
	};
	const DefaultType$11 = {
		allowList: "object",
		list: "(string|null)",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		ticks: "(array|boolean|string)",
		tooltipClass: "string",
		tooltips: "(boolean|string|null)",
		tooltipsFormat: "(function|null)",
		track: "(boolean|string)"
	};
	var Range = class Range extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			if (!this._element) return;
			this._input = SelectorEngine.children(this._element, SELECTOR_INPUT$1)[0] ?? null;
			this._form = this._input?.form ?? null;
			this._resetTimeout = null;
			this._tickPoints = [];
			this._ticks = null;
			this._tooltip = null;
			this._valueText = this._input?.getAttribute("aria-valuetext") ?? null;
			this._valueTextSet = false;
			this._onChange = (event) => {
				if (event.target === this._input) this._update();
			};
			this._onReset = () => {
				clearTimeout(this._resetTimeout);
				this._resetTimeout = setTimeout(() => this._update());
			};
			if (!this._input) return;
			if (this._config.tooltips) {
				this._tooltip = createTooltip(CLASS_NAME_TOOLTIP_TOP$1, this._config.tooltipClass, this._config.tooltips === "always");
				this._input.after(this._tooltip);
			}
			this._tickPoints = getTickPoints(this._input, this._config.ticks, this._config.list);
			if (this._tickPoints.length > 0) {
				this._ticks = createTicks(this._tickPoints, false);
				this._element.append(this._ticks);
			}
			this._addEventListeners();
			this._shownValue = this._input.value;
			this._update();
		}
		static get Default() {
			return Default$12;
		}
		static get DefaultType() {
			return DefaultType$11;
		}
		static get NAME() {
			return NAME$14;
		}
		update() {
			if (this._input) this._update();
		}
		dispose() {
			clearTimeout(this._resetTimeout);
			EventHandler.off(this._element, EVENT_INPUT$4, SELECTOR_INPUT$1, this._onChange);
			EventHandler.off(this._element, EVENT_CHANGE$3, SELECTOR_INPUT$1, this._onChange);
			if (this._form) EventHandler.off(this._form, EVENT_RESET$1, this._onReset);
			this._restoreValueText();
			this._tooltip?.remove();
			this._ticks?.remove();
			if (this._config.track && this._input) this._element.style.removeProperty(PROPERTY_FILL$1);
			super.dispose();
		}
		_configAfterMerge(config) {
			if (config.tooltips === null) config.tooltips = true;
			if (typeof config.ticks === "number") config.ticks = String(config.ticks);
			if (typeof config.ticks === "string") config.ticks = config.ticks.split(/,\s*/);
			return config;
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_INPUT$4, SELECTOR_INPUT$1, this._onChange);
			EventHandler.on(this._element, EVENT_CHANGE$3, SELECTOR_INPUT$1, this._onChange);
			if (this._form) EventHandler.on(this._form, EVENT_RESET$1, this._onReset);
		}
		_update() {
			const input = this._input;
			const ratio = getRatio(input);
			const value = Number.parseFloat(input.value);
			if (this._config.track) this._element.style.setProperty(PROPERTY_FILL$1, `${ratio}`);
			const html = sanitizeByConfig(this._format(value), this._config);
			if (this._tooltip) {
				this._tooltip.style.setProperty(PROPERTY_FILL$1, `${ratio}`);
				this._tooltip.lastElementChild.innerHTML = html;
			}
			this._updateValueText(value, typeof this._config.tooltipsFormat === "function" ? html : null);
			if (input.value !== this._shownValue) {
				this._shownValue = input.value;
				EventHandler.trigger(input, EVENT_CHANGED, { value });
			}
		}
		_format(value) {
			return typeof this._config.tooltipsFormat === "function" ? this._config.tooltipsFormat(value) : String(value);
		}
		_updateValueText(value, html) {
			const label = getTickLabel(this._tickPoints, value, getStep(this._input));
			const text = getValueText(value, label, html);
			if (text === null) {
				this._restoreValueText();
				return;
			}
			this._input.setAttribute("aria-valuetext", text);
			this._valueTextSet = true;
		}
		_restoreValueText() {
			if (!this._valueTextSet) return;
			if (this._valueText === null) this._input.removeAttribute("aria-valuetext");
			else this._input.setAttribute("aria-valuetext", this._valueText);
			this._valueTextSet = false;
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Range, config, (element) => [element]);
		}
	};
	EventHandler.on(document, EVENT_DOM_CONTENT_LOADED, () => {
		for (const element of SelectorEngine.find(SELECTOR_RANGE)) if (!data_default.get(element.parentElement, DATA_KEY_RANGE_SLIDER)) Range.getOrCreateInstance(element);
	});
	defineJQueryPlugin(Range);
	//#endregion
	//#region js/src/range-slider.ts
	const NAME$13 = "range-slider";
	const EVENT_KEY$10 = `.coreui.range-slider`;
	const DATA_API_KEY$5 = ".data-api";
	const EVENT_CHANGE$2 = `change${EVENT_KEY$10}`;
	const EVENT_INPUT$3 = `input${EVENT_KEY$10}`;
	const EVENT_KEYDOWN$4 = `keydown${EVENT_KEY$10}`;
	const EVENT_POINTERCANCEL = `pointercancel${EVENT_KEY$10}`;
	const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$10}`;
	const EVENT_POINTERMOVE = `pointermove${EVENT_KEY$10}`;
	const EVENT_POINTERUP = `pointerup${EVENT_KEY$10}`;
	const EVENT_LOAD_DATA_API$7 = `load${EVENT_KEY$10}${DATA_API_KEY$5}`;
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
	const Default$11 = {
		allowList: DefaultAllowlist,
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
	const DefaultType$10 = {
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
	var RangeSlider = class RangeSlider extends BaseComponent {
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
			this._validation = new FieldValidation(this._element, {
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
					EventHandler.trigger(this._element, EVENT_INPUT$3, { value: this._values() });
				}
			};
			this._onChange = (event) => {
				if (this._inputs.includes(event.target)) {
					this._update();
					EventHandler.trigger(this._element, EVENT_CHANGE$2, { value: this._values() });
				}
			};
			this._onKeydown = (event) => this._keydown(event);
			this._onPointerDown = (event) => this._pointerDown(event);
			this._onPointerMove = (event) => this._pointerMove(event);
			this._onPointerUp = (event) => this._pointerUp(event);
			this._build(this._config.value);
		}
		static get Default() {
			return Default$11;
		}
		static get DefaultType() {
			return DefaultType$10;
		}
		static get NAME() {
			return NAME$13;
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
			this._typeCheckConfig({ value: values }, { value: DefaultType$10.value });
			if (values.length !== this._inputs.length) {
				const focused = this._inputs.findIndex((input) => containsFocus(input));
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
				const placement = vertical ? isRTL(this._wrapper) ? CLASS_NAME_TOOLTIP_END : CLASS_NAME_TOOLTIP_START : CLASS_NAME_TOOLTIP_TOP;
				for (const input of this._inputs) {
					const tooltip = createTooltip(placement, tooltipClass, tooltips === "always");
					input.after(tooltip);
					this._tooltips.push(tooltip);
				}
			}
			this._tickPoints = this._inputs.length > 0 ? getTickPoints(this._inputs[0], this._config.ticks, this._config.list) : [];
			if (this._tickPoints.length > 0) {
				this._ticks = createTicks(this._tickPoints, vertical);
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
				EventHandler.off(this._wrapper, EVENT_INPUT$3, SELECTOR_INPUT, this._onInput);
				EventHandler.off(this._wrapper, EVENT_CHANGE$2, SELECTOR_INPUT, this._onChange);
				EventHandler.off(this._wrapper, EVENT_KEYDOWN$4, SELECTOR_INPUT, this._onKeydown);
				EventHandler.off(this._wrapper, EVENT_POINTERDOWN, this._onPointerDown);
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
			EventHandler.on(wrapper, EVENT_INPUT$3, SELECTOR_INPUT, this._onInput);
			EventHandler.on(wrapper, EVENT_CHANGE$2, SELECTOR_INPUT, this._onChange);
			EventHandler.on(wrapper, EVENT_KEYDOWN$4, SELECTOR_INPUT, this._onKeydown);
			EventHandler.on(wrapper, EVENT_POINTERDOWN, this._onPointerDown);
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
				input.id = getUID(`${NAME$13}-handle-`);
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
			if (isChanged) EventHandler.trigger(this._element, EVENT_CHANGE$2, { value: this._values() });
		}
		_update() {
			const ratios = this._inputs.map((input) => getRatio(input));
			this._shownValues = this._inputs.map((input) => input.value);
			if (this._config.track && this._inputs.length > 0) {
				if (this._inputs.length > 1) this._wrapper.style.setProperty(PROPERTY_FILL_START, `${Math.min(...ratios)}`);
				this._wrapper.style.setProperty(PROPERTY_FILL, `${Math.max(...ratios)}`);
			}
			for (const [index, input] of this._inputs.entries()) {
				const value = Number.parseFloat(input.value);
				const tooltip = this._tooltips[index];
				const html = sanitizeByConfig(this._format(value), this._config);
				if (tooltip) {
					tooltip.style.setProperty(PROPERTY_FILL, `${ratios[index]}`);
					tooltip.lastElementChild.innerHTML = html;
				}
				const label = getTickLabel(this._tickPoints, value, getStep(input));
				const text = getValueText(value, label, typeof this._config.tooltipsFormat === "function" ? html : null);
				if (text === null) input.removeAttribute("aria-valuetext");
				else input.setAttribute("aria-valuetext", text);
				if (this._inputs.length > 1) input.style.zIndex = `${getStackOrder(ratios[index], index, this._inputs.length)}`;
			}
		}
		_format(value) {
			return typeof this._config.tooltipsFormat === "function" ? this._config.tooltipsFormat(value) : String(value);
		}
		_constrain(input) {
			const index = this._inputs.indexOf(input);
			constrainInput(input, this._inputs[index - 1], this._inputs[index + 1], this._config.distance);
		}
		_setValue(input, value) {
			const before = input.value;
			setInputValue(input, value);
			this._constrain(input);
			if (input.value !== before) input.dispatchEvent(new Event("input", { bubbles: true }));
		}
		_keydown(event) {
			const input = event.target;
			if (!this._config.vertical || this._disabled || !this._inputs.includes(input) || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
			event.preventDefault();
			const start = input.value;
			const step = getStep(input);
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
			const thumb = getThumbSize(this._wrapper);
			const at = ratio ?? getRatioAt(event, rect, thumb, this._config.vertical, isRTL(this._wrapper));
			const input = getNearestInput(this._inputs, at);
			if (!input) return;
			event.preventDefault();
			this._press = {
				input,
				pointerId: event.pointerId,
				rect,
				start: input.value,
				thumb
			};
			EventHandler.on(document, EVENT_POINTERMOVE, this._onPointerMove);
			EventHandler.on(document, EVENT_POINTERUP, this._onPointerUp);
			EventHandler.on(document, EVENT_POINTERCANCEL, this._onPointerUp);
			input.focus({ preventScroll: true });
			this._setValue(input, value ?? this._config.min + at * (this._config.max - this._config.min));
		}
		_pointerMove(event) {
			if (!this._press || event.pointerId !== this._press.pointerId) return;
			const { input, rect, thumb } = this._press;
			const ratio = getRatioAt(event, rect, thumb, this._config.vertical, isRTL(this._wrapper));
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
			EventHandler.off(document, EVENT_POINTERMOVE, this._onPointerMove);
			EventHandler.off(document, EVENT_POINTERUP, this._onPointerUp);
			EventHandler.off(document, EVENT_POINTERCANCEL, this._onPointerUp);
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
			return jQueryDispatch(this, RangeSlider, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$7, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_RANGE_SLIDER)) RangeSlider.rangeSliderInterface(element);
	});
	defineJQueryPlugin(RangeSlider);
	//#endregion
	//#region js/src/rating.ts
	const NAME$12 = "rating";
	const EVENT_KEY$9 = `.coreui.rating`;
	const DATA_API_KEY$4 = ".data-api";
	const EVENT_CHANGE$1 = `change${EVENT_KEY$9}`;
	const EVENT_CLICK$3 = `click${EVENT_KEY$9}`;
	const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$9}`;
	const EVENT_FOCUSOUT$2 = `focusout${EVENT_KEY$9}`;
	const EVENT_HOVER = `hover${EVENT_KEY$9}`;
	const EVENT_INPUT$2 = `input${EVENT_KEY$9}`;
	const EVENT_KEYDOWN$3 = `keydown${EVENT_KEY$9}`;
	const EVENT_LOAD_DATA_API$6 = `load${EVENT_KEY$9}${DATA_API_KEY$4}`;
	const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY$9}`;
	const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY$9}`;
	const CLASS_NAME_ACTIVE$4 = "active";
	const CLASS_NAME_DISABLED$2 = "disabled";
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
	const Default$10 = {
		activeIcon: null,
		allowClear: false,
		allowList: SVGAllowlist,
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
	const DefaultType$9 = {
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
	var Rating = class Rating extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._items = [];
			this._validation = new FieldValidation(this._element, {
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
			this._name = this._config.name || getUID(`${this.constructor.NAME}-name-`).toString();
			this._tooltip = null;
			this._createRating();
			this._addEventListeners();
		}
		static get Default() {
			return Default$10;
		}
		static get DefaultType() {
			return DefaultType$9;
		}
		static get NAME() {
			return NAME$12;
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
			this._typeCheckConfig({ value }, { value: DefaultType$9.value });
			this._currentValue = value;
			this._paintValue();
		}
		reset(value = null) {
			const isChanged = value != this._currentValue;
			this._currentValue = value;
			this._paintValue();
			if (isChanged) EventHandler.trigger(this._element, EVENT_CHANGE$1, { value });
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
			this._element.classList.toggle(CLASS_NAME_DISABLED$2, disabled);
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
			return SelectorEngine.find(SELECTOR_RATING_ITEM_INPUT, this._element);
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
			for (const item of SelectorEngine.find(`${SELECTOR_RATING_ITEM}, ${SELECTOR_RATING_ITEM} > div`, this._element)) Tooltip.getInstance(item)?.dispose();
			this._tooltip = null;
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_CLICK$3, SELECTOR_RATING_ITEM_INPUT, (event) => {
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
					EventHandler.trigger(this._element, EVENT_CHANGE$1, { value: null });
				}
			});
			EventHandler.on(this._element, EVENT_INPUT$2, SELECTOR_RATING_ITEM_INPUT, () => {
				if (!this._disabled && !this._config.readonly) this._validation.dismiss();
			});
			EventHandler.on(this._element, EVENT_CHANGE$1, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				if (this._disabled || this._config.readonly) return;
				this._currentValue = target.value;
				EventHandler.trigger(this._element, EVENT_CHANGE$1, { value: target.value });
				if (target.isConnected) this._highlightLabels(target);
			});
			EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_RATING_ITEM_LABEL, ({ target }) => {
				if (this._disabled || this._config.readonly) return;
				const label = target.closest(SELECTOR_RATING_ITEM_LABEL);
				const labels = SelectorEngine.find(SELECTOR_RATING_ITEM_LABEL, this._element);
				this._resetLabels();
				const input = SelectorEngine.findOne(SELECTOR_RATING_ITEM_INPUT, label.parentElement);
				EventHandler.trigger(this._element, EVENT_HOVER, { value: input.value });
				this._createTooltip(label.parentElement, input.value);
				if (this._config.highlightOnlySelected) {
					label.classList.add(CLASS_NAME_ACTIVE$4);
					return;
				}
				for (const _label of labels) {
					_label.classList.add(CLASS_NAME_ACTIVE$4);
					if (_label === label) break;
				}
			});
			EventHandler.on(this._element, EVENT_MOUSELEAVE, SELECTOR_RATING_ITEM_LABEL, () => {
				if (this._disabled || this._config.readonly) return;
				if (this._tooltip) this._tooltip.hide();
				const checkedInput = SelectorEngine.findOne(`${SELECTOR_RATING_ITEM_INPUT}[value="${this._currentValue}"]`, this._element);
				this._resetLabels();
				EventHandler.trigger(this._element, EVENT_HOVER, { value: null });
				this._highlightLabels(checkedInput);
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$3, SELECTOR_RATING_ITEM_INPUT, (event) => {
				if (this._config.readonly && event.key?.startsWith("Arrow")) event.preventDefault();
			});
			EventHandler.on(this._element, EVENT_FOCUSIN$2, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				if (this._disabled || this._config.readonly) return;
				EventHandler.trigger(this._element, EVENT_HOVER, { value: target.value });
				this._createTooltip(target.parentElement, target.value);
			});
			EventHandler.on(this._element, EVENT_FOCUSOUT$2, SELECTOR_RATING_ITEM_INPUT, () => {
				if (this._disabled || this._config.readonly) return;
				EventHandler.trigger(this._element, EVENT_HOVER, { value: null });
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
			this._tooltip = new Tooltip(selector, { title: tooltipTitle });
		}
		_configAfterMerge(config) {
			if (typeof config.tooltips === "string") config.tooltips = config.tooltips.split(",");
			return config;
		}
		_resetLabels() {
			const labels = SelectorEngine.find(SELECTOR_RATING_ITEM_LABEL, this._element);
			for (const label of labels) label.classList.remove(CLASS_NAME_ACTIVE$4);
		}
		_highlightLabels(checkedInput) {
			this._resetLabels();
			if (!checkedInput) return;
			if (this._config.highlightOnlySelected) {
				SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, checkedInput.parentElement).classList.add(CLASS_NAME_ACTIVE$4);
				return;
			}
			for (const input of SelectorEngine.find(SELECTOR_RATING_ITEM_INPUT, this._element)) {
				SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement).classList.add(CLASS_NAME_ACTIVE$4);
				if (input === checkedInput) break;
			}
		}
		_createRating(anchor = null) {
			this._element.classList.add(CLASS_NAME_RATING);
			this._element.classList.toggle(CLASS_NAME_DISABLED$2, this._disabled);
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
			writeAttribute(this._element, "aria-readonly", this._config.readonly ? "true" : null);
			writeAttribute(this._element, "aria-required", this._isRequired() ? "true" : null);
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
			const checkedInput = SelectorEngine.findOne(`${SELECTOR_RATING_ITEM_INPUT}:checked`, this._element);
			const value = checkedInput?.value ?? null;
			if (value == this._currentValue) return;
			this._currentValue = value;
			this._highlightLabels(checkedInput);
			this._updateTabStop();
			EventHandler.trigger(this._element, EVENT_CHANGE$1, { value });
		}
		_createRatingItem(index) {
			const ratingItemElement = document.createElement("div");
			ratingItemElement.classList.add(CLASS_NAME_RATING_ITEM);
			const numberOfRadios = 1 / this._config.precision;
			Array.from({ length: numberOfRadios }, (_, _index) => {
				const ratingItemId = getUID(`${this.constructor.NAME}${index}`).toString();
				const isNotLastItem = _index + 1 < numberOfRadios;
				const value = numberOfRadios === 1 ? index + 1 : (_index + 1) * Number(this._config.precision) + index;
				const ratingItemLabelElement = document.createElement("label");
				ratingItemLabelElement.classList.add(CLASS_NAME_RATING_ITEM_LABEL);
				ratingItemLabelElement.setAttribute("for", ratingItemId);
				if (this._config.highlightOnlySelected && this._currentValue == value) ratingItemLabelElement.classList.add(CLASS_NAME_ACTIVE$4);
				if (!this._config.highlightOnlySelected && this._currentValue >= value) ratingItemLabelElement.classList.add(CLASS_NAME_ACTIVE$4);
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
					ratingItemIconElement.innerHTML = sanitizeByConfig(typeof this._config.icon === "object" ? this._config.icon[index + 1] : this._config.icon, this._config);
					ratingItemLabelElement.append(ratingItemIconElement);
				} else {
					const ratingItemIconElement = document.createElement("div");
					ratingItemIconElement.classList.add(CLASS_NAME_RATING_ITEM_ICON);
					ratingItemLabelElement.append(ratingItemIconElement);
				}
				if (this._config.icon && this._config.activeIcon) {
					const ratingItemIconActiveElement = document.createElement("div");
					ratingItemIconActiveElement.classList.add(CLASS_NAME_RATING_ITEM_CUSTOM_ICON_ACTIVE);
					ratingItemIconActiveElement.innerHTML = sanitizeByConfig(typeof this._config.activeIcon === "object" ? this._config.activeIcon[index + 1] : this._config.activeIcon, this._config);
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
			return jQueryDispatch(this, Rating, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$6, () => {
		const ratings = SelectorEngine.find(SELECTOR_DATA_RATING);
		for (const rating of ratings) Rating.ratingInterface(rating);
	});
	defineJQueryPlugin(Rating);
	//#endregion
	//#region js/src/scrollspy.ts
	const NAME$11 = "scrollspy";
	const EVENT_KEY$8 = `.coreui.scrollspy`;
	const DATA_API_KEY$3 = ".data-api";
	const EVENT_ACTIVATE = `activate${EVENT_KEY$8}`;
	const EVENT_CLICK$2 = `click${EVENT_KEY$8}`;
	const EVENT_SCROLL = `scroll${EVENT_KEY$8}`;
	const EVENT_SCROLLEND = `scrollend${EVENT_KEY$8}`;
	const EVENT_RESIZE$1 = `resize${EVENT_KEY$8}`;
	const EVENT_LOAD_DATA_API$5 = `load${EVENT_KEY$8}${DATA_API_KEY$3}`;
	const CLASS_NAME_MENU_ITEM = "menu-item";
	const CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
	const CLASS_NAME_ACTIVE$3 = "active";
	const SELECTOR_DATA_SPY = "[data-coreui-spy=\"scroll\"]";
	const SELECTOR_TARGET_LINKS = "[href]";
	const SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
	const SELECTOR_NAV_LINKS = ".nav-link";
	const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, .nav-item > ${SELECTOR_NAV_LINKS}, .list-group-item`;
	const SELECTOR_MENU_TOGGLE = "[data-coreui-toggle=\"menu\"]";
	const SELECTOR_DROPDOWN = ".dropdown";
	const SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
	const SCROLL_IDLE_TIMEOUT = 100;
	const RESIZE_DEBOUNCE = 100;
	const Default$9 = {
		rootMargin: null,
		smoothScroll: false,
		target: null,
		threshold: [0],
		topMargin: "12%"
	};
	const DefaultType$8 = {
		rootMargin: "(string|null)",
		smoothScroll: "boolean",
		target: "element",
		threshold: "array",
		topMargin: "string"
	};
	var ScrollSpy = class ScrollSpy extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._sections = [];
			this._linkBySection = /* @__PURE__ */ new Map();
			this._sectionByLink = /* @__PURE__ */ new Map();
			this._intersecting = /* @__PURE__ */ new Set();
			this._activeTarget = null;
			this._lastActive = null;
			this._atBottom = false;
			this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
			this._observer = null;
			this._sentinel = null;
			this._sentinelObserver = null;
			this._pendingNavigation = null;
			this._settleTimeout = null;
			this._settleHandler = null;
			this._scrollIdleHandler = null;
			this._resizeHandler = null;
			this._resizeTimeout = null;
			this.refresh();
		}
		static get Default() {
			return Default$9;
		}
		static get DefaultType() {
			return DefaultType$8;
		}
		static get NAME() {
			return NAME$11;
		}
		refresh() {
			this._initializeTargetsAndObservables();
			this._maybeEnableSmoothScroll();
			this._observer?.disconnect();
			this._intersecting.clear();
			this._observer = this._getNewObserver();
			for (const section of this._sections) this._observer.observe(section);
			this._setUpSentinel();
			this._maybeAddResizeListener();
		}
		dispose() {
			this._observer?.disconnect();
			this._teardownSentinel();
			this._disarmSettle();
			this._removeResizeListener();
			EventHandler.off(this._config.target, EVENT_CLICK$2);
			super.dispose();
		}
		_configAfterMerge(config) {
			config.target = getElement(config.target) || document.body;
			if (typeof config.threshold === "string") config.threshold = config.threshold.split(",").map((value) => Number.parseFloat(value));
			return config;
		}
		_getNewObserver() {
			const options = {
				root: this._rootElement,
				threshold: this._config.threshold,
				rootMargin: this._config.rootMargin ?? this._getDerivedRootMargin()
			};
			return new IntersectionObserver((entries) => this._onIntersect(entries), options);
		}
		_onIntersect(entries) {
			for (const entry of entries) if (entry.isIntersecting) this._intersecting.add(entry.target);
			else this._intersecting.delete(entry.target);
			this._computeActive();
		}
		_computeActive() {
			if (!this._element?.isConnected || this._sections.length === 0) return;
			let active = null;
			if (this._atBottom) active = this._sections.at(-1);
			else {
				for (const section of this._sections) if (this._intersecting.has(section)) active = section;
				active ||= this._lastActive ?? this._sections.at(0);
			}
			if (!active) return;
			this._lastActive = active;
			const link = this._linkBySection.get(active);
			if (link) this._process(link);
		}
		_parseTopMargin() {
			const value = String(this._config.topMargin);
			return {
				value: Number.parseFloat(value) || 0,
				unit: value.endsWith("%") ? "%" : "px"
			};
		}
		_getDerivedRootMargin() {
			const { value, unit } = this._parseTopMargin();
			let percent = value;
			if (unit === "px") {
				const rootHeight = this._rootElement ? this._rootElement.clientHeight : document.documentElement.clientHeight || window.innerHeight;
				percent = rootHeight ? value / rootHeight * 100 : 12;
			}
			return `0px 0px -${Math.min(Math.max(100 - percent, 0), 100)}% 0px`;
		}
		_usesPixelMargin() {
			return !this._config.rootMargin && this._parseTopMargin().unit === "px";
		}
		_setUpSentinel() {
			this._teardownSentinel();
			if (this._sections.length === 0) return;
			const sentinel = document.createElement("div");
			sentinel.setAttribute("aria-hidden", "true");
			sentinel.style.cssText = "position:relative;width:0;height:0;margin:0;padding:0;border:0;visibility:hidden;";
			this._element.append(sentinel);
			this._sentinel = sentinel;
			this._sentinelObserver = new IntersectionObserver((entries) => this._onSentinel(entries), {
				root: this._rootElement,
				threshold: [0]
			});
			this._sentinelObserver.observe(sentinel);
		}
		_onSentinel(entries) {
			const entry = entries.at(-1);
			this._atBottom = Boolean(entry?.isIntersecting) && this._isOverflowing();
			this._computeActive();
		}
		_isOverflowing() {
			const scroller = this._rootElement || document.scrollingElement || document.documentElement;
			return scroller.scrollHeight > scroller.clientHeight;
		}
		_teardownSentinel() {
			this._sentinelObserver?.disconnect();
			this._sentinelObserver = null;
			this._sentinel?.remove();
			this._sentinel = null;
			this._atBottom = false;
		}
		_maybeAddResizeListener() {
			this._removeResizeListener();
			if (!this._usesPixelMargin()) return;
			this._resizeHandler = () => {
				clearTimeout(this._resizeTimeout);
				this._resizeTimeout = setTimeout(() => this._rebuildObserver(), RESIZE_DEBOUNCE);
			};
			EventHandler.on(window, EVENT_RESIZE$1, this._resizeHandler);
		}
		_removeResizeListener() {
			clearTimeout(this._resizeTimeout);
			this._resizeTimeout = null;
			if (this._resizeHandler) {
				EventHandler.off(window, EVENT_RESIZE$1, this._resizeHandler);
				this._resizeHandler = null;
			}
		}
		_rebuildObserver() {
			if (!this._observer) return;
			this._observer.disconnect();
			this._intersecting.clear();
			this._observer = this._getNewObserver();
			for (const section of this._sections) this._observer.observe(section);
		}
		_maybeEnableSmoothScroll() {
			if (!this._config.smoothScroll) return;
			EventHandler.off(this._config.target, EVENT_CLICK$2);
			EventHandler.on(this._config.target, EVENT_CLICK$2, SELECTOR_TARGET_LINKS, (event) => {
				const link = event.target.closest(SELECTOR_TARGET_LINKS);
				const section = link && this._sectionByLink.get(link);
				if (!section || !this._element) return;
				event.preventDefault();
				const root = this._rootElement || window;
				const height = section.offsetTop - this._element.offsetTop;
				const currentTop = this._rootElement ? this._rootElement.scrollTop : window.scrollY ?? window.pageYOffset;
				if (matchMedia("(prefers-reduced-motion: reduce)").matches || Math.abs(currentTop - height) <= 2) {
					if (root.scrollTo) root.scrollTo({
						top: height,
						behavior: "auto"
					});
					else root.scrollTop = height;
					this._settleNavigation(link.hash, section);
					return;
				}
				this._pendingNavigation = {
					hash: link.hash,
					section
				};
				this._armSettle();
				if (root.scrollTo) root.scrollTo({
					top: height,
					behavior: "smooth"
				});
				else root.scrollTop = height;
			});
		}
		_armSettle() {
			this._disarmSettle();
			const target = this._getSettleTarget();
			this._settleHandler = () => this._onSettle();
			this._scrollIdleHandler = () => {
				clearTimeout(this._settleTimeout);
				this._settleTimeout = setTimeout(() => this._onSettle(), SCROLL_IDLE_TIMEOUT);
			};
			EventHandler.on(target, EVENT_SCROLLEND, this._settleHandler);
			EventHandler.on(target, EVENT_SCROLL, this._scrollIdleHandler);
		}
		_disarmSettle() {
			clearTimeout(this._settleTimeout);
			this._settleTimeout = null;
			const target = this._getSettleTarget();
			if (this._settleHandler) {
				EventHandler.off(target, EVENT_SCROLLEND, this._settleHandler);
				this._settleHandler = null;
			}
			if (this._scrollIdleHandler) {
				EventHandler.off(target, EVENT_SCROLL, this._scrollIdleHandler);
				this._scrollIdleHandler = null;
			}
		}
		_getSettleTarget() {
			return this._rootElement || document;
		}
		_onSettle() {
			this._disarmSettle();
			if (!this._pendingNavigation) return;
			const { hash, section } = this._pendingNavigation;
			this._settleNavigation(hash, section);
		}
		_settleNavigation(hash, section) {
			this._pendingNavigation = null;
			if (window.history?.replaceState) window.history.replaceState(null, "", hash);
			if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
			section.focus({ preventScroll: true });
		}
		_initializeTargetsAndObservables() {
			this._sections = [];
			this._linkBySection = /* @__PURE__ */ new Map();
			this._sectionByLink = /* @__PURE__ */ new Map();
			const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
			const seen = /* @__PURE__ */ new Set();
			for (const anchor of targetLinks) {
				if (!anchor.hash || isDisabled(anchor)) continue;
				const id = decodeFragment(anchor.hash.slice(1));
				if (!id) continue;
				const section = document.getElementById(id);
				if (!section || !this._element.contains(section) || !isVisible(section)) continue;
				this._sectionByLink.set(anchor, section);
				this._linkBySection.set(section, anchor);
				if (!seen.has(section)) {
					seen.add(section);
					this._sections.push(section);
				}
			}
			this._sections.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
		}
		_process(target) {
			if (this._activeTarget === target) return;
			this._clearActiveClass(this._config.target);
			this._activeTarget = target;
			target.classList.add(CLASS_NAME_ACTIVE$3);
			this._activateParents(target);
			EventHandler.trigger(this._element, EVENT_ACTIVATE, { relatedTarget: target });
		}
		_activateParents(target) {
			if (target.classList.contains(CLASS_NAME_MENU_ITEM)) {
				const menuToggle = target.closest(".menu")?.previousElementSibling;
				if (menuToggle?.matches(SELECTOR_MENU_TOGGLE)) menuToggle.classList.add(CLASS_NAME_ACTIVE$3);
				return;
			}
			if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
				SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN))?.classList.add(CLASS_NAME_ACTIVE$3);
				return;
			}
			for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) item.classList.add(CLASS_NAME_ACTIVE$3);
		}
		_clearActiveClass(parent) {
			parent.classList.remove(CLASS_NAME_ACTIVE$3);
			const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$3}`, parent);
			for (const node of activeNodes) node.classList.remove(CLASS_NAME_ACTIVE$3);
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, ScrollSpy, config);
		}
	};
	function decodeFragment(hash) {
		try {
			return decodeURIComponent(hash);
		} catch {
			return hash;
		}
	}
	EventHandler.on(window, EVENT_LOAD_DATA_API$5, () => {
		for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) ScrollSpy.getOrCreateInstance(spy);
	});
	defineJQueryPlugin(ScrollSpy);
	//#endregion
	//#region js/src/search-button.ts
	const NAME$10 = "search-button";
	const EVENT_KEY$7 = `.coreui.search-button`;
	const DATA_API_KEY$2 = ".data-api";
	const EVENT_BLUR_DATA_API = `blur${EVENT_KEY$7}${DATA_API_KEY$2}`;
	const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$7}${DATA_API_KEY$2}`;
	const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$7}${DATA_API_KEY$2}`;
	const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$7}${DATA_API_KEY$2}`;
	const EVENT_TRIGGER = `trigger${EVENT_KEY$7}`;
	const CLASS_NAME_SHORTCUT_KEYS = "search-button-keys";
	const CLASS_NAME_SHORTCUT_KEY = "search-button-key";
	const CLASS_NAME_ACTIVE$2 = "active";
	const SELECTOR_DATA_TOGGLE$2 = "[data-coreui-search-button]";
	const SELECTOR_EDITABLE_TARGET = "input, textarea, select, [contenteditable=\"\"], [contenteditable=\"true\"], [contenteditable=\"plaintext-only\"]";
	const SELECTOR_PLACEHOLDER = ".search-button-placeholder";
	const SELECTOR_SHORTCUT_KEY = ".search-button-key";
	const SELECTOR_SHORTCUT_KEYS = ".search-button-keys";
	const Default$8 = {
		preventDefault: true,
		shortcut: "meta+/,ctrl+/"
	};
	const DefaultType$7 = {
		preventDefault: "boolean",
		shortcut: "string"
	};
	const MODIFIER_KEYS = /* @__PURE__ */ new Set([
		"alt",
		"ctrl",
		"meta",
		"shift"
	]);
	const KEY_ALIASES = {
		cmd: "meta",
		command: "meta",
		control: "ctrl",
		option: "alt",
		return: "enter",
		esc: "escape",
		spacebar: "space",
		" ": "space"
	};
	const KEY_LABELS = {
		alt: "Alt",
		ctrl: "Ctrl",
		meta: "⌘",
		shift: "Shift",
		space: "Space"
	};
	var SearchButton = class SearchButton extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._shortcutTriggered = false;
			this._shortcuts = this._parseShortcut(this._config.shortcut);
			this._preferredShortcut = this._getPreferredShortcut(this._shortcuts);
			this._syncShortcutKeys();
		}
		static get Default() {
			return Default$8;
		}
		static get DefaultType() {
			return DefaultType$7;
		}
		static get NAME() {
			return NAME$10;
		}
		trigger() {
			this._triggerEvent("api");
		}
		dispose() {
			if (!this._element) return;
			if (this._shortcutKeysContent) this._shortcutKeys.replaceChildren(...this._shortcutKeysContent);
			else this._shortcutKeys.remove();
			super.dispose();
		}
		_triggerEvent(trigger) {
			if (this._isDisabled()) return;
			EventHandler.trigger(this._element, EVENT_TRIGGER, { trigger });
		}
		_handleShortcut(event) {
			if (this._isDisabled() || event.defaultPrevented || event.repeat || this._shouldIgnoreShortcut(event)) return false;
			if (!this._shortcuts.find((shortcut) => this._matchesShortcut(shortcut, event))) return false;
			if (this._config.preventDefault) event.preventDefault();
			this._shortcutTriggered = true;
			try {
				this._element.click();
			} finally {
				this._shortcutTriggered = false;
			}
			return true;
		}
		_isDisabled() {
			return this._element.classList.contains("disabled") || this._element.getAttribute("aria-disabled") === "true" || this._element.disabled;
		}
		_ensureShortcutKeys() {
			const existingShortcutKeys = this._element.querySelector(SELECTOR_SHORTCUT_KEYS);
			if (existingShortcutKeys) {
				this._shortcutKeys = existingShortcutKeys;
				this._shortcutKeysContent = [...existingShortcutKeys.childNodes];
				return existingShortcutKeys;
			}
			const shortcutKeys = document.createElement("span");
			shortcutKeys.className = CLASS_NAME_SHORTCUT_KEYS;
			shortcutKeys.setAttribute("aria-hidden", "true");
			this._shortcutKeys = shortcutKeys;
			this._shortcutKeysContent = null;
			const placeholder = this._element.querySelector(SELECTOR_PLACEHOLDER);
			if (placeholder) {
				placeholder.after(shortcutKeys);
				return shortcutKeys;
			}
			this._element.append(shortcutKeys);
			return shortcutKeys;
		}
		_syncShortcutKeys() {
			const shortcutKeys = this._ensureShortcutKeys();
			const shortcutTokens = this._formatShortcutTokens(this._preferredShortcut?.shortcut || "").filter(Boolean);
			shortcutKeys.replaceChildren();
			for (const key of shortcutTokens) {
				const shortcutKey = document.createElement("span");
				shortcutKey.className = CLASS_NAME_SHORTCUT_KEY;
				shortcutKey.textContent = key;
				shortcutKey.dataset.coreuiSearchButtonKey = key;
				shortcutKeys.append(shortcutKey);
			}
		}
		_syncActiveKeys(event) {
			const pressedKeys = this._getPressedKeys(event);
			for (const shortcutKey of this._element.querySelectorAll(SELECTOR_SHORTCUT_KEY)) shortcutKey.classList.toggle(CLASS_NAME_ACTIVE$2, pressedKeys.has(shortcutKey.dataset.coreuiSearchButtonKey));
		}
		_clearActiveKeys() {
			for (const shortcutKey of this._element.querySelectorAll(SELECTOR_SHORTCUT_KEY)) shortcutKey.classList.remove(CLASS_NAME_ACTIVE$2);
		}
		_consumeShortcutTrigger() {
			const shortcutTriggered = this._shortcutTriggered;
			this._shortcutTriggered = false;
			return shortcutTriggered;
		}
		_shouldIgnoreShortcut(event) {
			return this._isEditableTarget(event.target) && !event.ctrlKey && !event.metaKey;
		}
		_isEditableTarget(target) {
			if (!(target instanceof Element)) return false;
			return target.matches(SELECTOR_EDITABLE_TARGET) || target.closest(SELECTOR_EDITABLE_TARGET);
		}
		_normalizeKey(key) {
			return KEY_ALIASES[key.toLowerCase()] || key.toLowerCase();
		}
		_parseShortcut(shortcut) {
			return shortcut.split(",").map((value) => value.trim()).filter(Boolean).map((value) => {
				const keys = value.split("+").map((part) => this._normalizeKey(part.trim()));
				const modifiers = {
					alt: false,
					ctrl: false,
					meta: false,
					shift: false
				};
				let key = "";
				for (const part of keys) {
					if (MODIFIER_KEYS.has(part)) {
						modifiers[part] = true;
						continue;
					}
					key = part;
				}
				return {
					key,
					modifiers,
					shortcut: value
				};
			});
		}
		_matchesShortcut(shortcut, event) {
			if (!shortcut.key || this._normalizeKey(event.key) !== shortcut.key) return false;
			return shortcut.modifiers.alt === event.altKey && shortcut.modifiers.ctrl === event.ctrlKey && shortcut.modifiers.meta === event.metaKey && shortcut.modifiers.shift === event.shiftKey;
		}
		_formatShortcutTokens(shortcut) {
			return shortcut.split("+").map((part) => this._normalizeKey(part.trim())).map((part) => this._getKeyLabel(part));
		}
		_getPlatform() {
			return window.navigator.userAgentData?.platform || window.navigator.platform || window.navigator.userAgent || "";
		}
		_isMacOS() {
			return /Mac|iPhone|iPad|iPod|macOS|Macintosh/.test(this._getPlatform());
		}
		_getPreferredShortcut(shortcuts) {
			return shortcuts.find((shortcut) => {
				return this._isMacOS() ? shortcut.modifiers.meta : shortcut.modifiers.ctrl;
			}) || shortcuts[0] || null;
		}
		_getPressedKeys(event) {
			const pressedKeys = /* @__PURE__ */ new Set();
			if (event.altKey) pressedKeys.add(KEY_LABELS.alt);
			if (event.ctrlKey) pressedKeys.add(KEY_LABELS.ctrl);
			if (event.metaKey) pressedKeys.add(KEY_LABELS.meta);
			if (event.shiftKey) pressedKeys.add(KEY_LABELS.shift);
			const normalizedKey = this._normalizeKey(event.key);
			const keyLabel = this._getKeyLabel(normalizedKey);
			if (!MODIFIER_KEYS.has(normalizedKey) && event.type === "keydown") pressedKeys.add(keyLabel);
			return pressedKeys;
		}
		_getKeyLabel(key) {
			return KEY_LABELS[key] || (key.length === 1 ? key.toUpperCase() : `${key.charAt(0).toUpperCase()}${key.slice(1)}`);
		}
		static searchButtonInterface(element, config, ...args) {
			const data = SearchButton.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (config.startsWith("_") || typeof data[config] !== "function") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, SearchButton, config);
		}
		static _initializeDataApi() {
			for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE$2)) SearchButton.getOrCreateInstance(button);
		}
		static _handleDataApiClick(event) {
			event.preventDefault();
			const button = event.target.closest(SELECTOR_DATA_TOGGLE$2);
			const data = SearchButton.getOrCreateInstance(button);
			if (data._consumeShortcutTrigger()) {
				data._triggerEvent("shortcut");
				return;
			}
			data._triggerEvent("click");
		}
		static _handleDataApiKeydown(event) {
			if (!event.key) return;
			for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE$2)) {
				const data = SearchButton.getInstance(button);
				if (!data) continue;
				data._syncActiveKeys(event);
				if (data._handleShortcut(event)) break;
			}
		}
		static _handleDataApiKeyup(event) {
			if (!event.key) return;
			for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE$2)) SearchButton.getInstance(button)?._syncActiveKeys(event);
		}
		static _handleDataApiBlur() {
			for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE$2)) SearchButton.getInstance(button)?._clearActiveKeys();
		}
	};
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$7}${DATA_API_KEY$2}`, () => {
		SearchButton._initializeDataApi();
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$2, (event) => {
		SearchButton._handleDataApiClick(event);
	});
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API, (event) => {
		SearchButton._handleDataApiKeydown(event);
	});
	EventHandler.on(document, EVENT_KEYUP_DATA_API, (event) => {
		SearchButton._handleDataApiKeyup(event);
	});
	EventHandler.on(window, EVENT_BLUR_DATA_API, () => {
		SearchButton._handleDataApiBlur();
	});
	defineJQueryPlugin(SearchButton);
	//#endregion
	//#region js/src/util/backdrop.ts
	const NAME$9 = "backdrop";
	const CLASS_NAME_FADE = "fade";
	const CLASS_NAME_SHOW$5 = "show";
	const EVENT_MOUSEDOWN = `mousedown.coreui.${NAME$9}`;
	const Default$7 = {
		className: "modal-backdrop",
		clickCallback: null,
		isAnimated: false,
		isVisible: true,
		rootElement: "body"
	};
	const DefaultType$6 = {
		className: "string",
		clickCallback: "(function|null)",
		isAnimated: "boolean",
		isVisible: "boolean",
		rootElement: "(element|string)"
	};
	var Backdrop = class extends Config {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
			this._isAppended = false;
			this._element = null;
		}
		static get Default() {
			return Default$7;
		}
		static get DefaultType() {
			return DefaultType$6;
		}
		static get NAME() {
			return NAME$9;
		}
		show(callback) {
			if (!this._config.isVisible) {
				execute(callback);
				return;
			}
			this._append();
			const element = this._getElement();
			if (this._config.isAnimated) reflow(element);
			element.classList.add(CLASS_NAME_SHOW$5);
			this._emulateAnimation(() => {
				execute(callback);
			});
		}
		hide(callback) {
			if (!this._config.isVisible) {
				execute(callback);
				return;
			}
			this._getElement().classList.remove(CLASS_NAME_SHOW$5);
			this._emulateAnimation(() => {
				this.dispose();
				execute(callback);
			});
		}
		dispose() {
			if (!this._isAppended) return;
			EventHandler.off(this._element, EVENT_MOUSEDOWN);
			this._element.remove();
			this._isAppended = false;
		}
		_getElement() {
			if (!this._element) {
				const backdrop = document.createElement("div");
				backdrop.className = this._config.className;
				if (this._config.isAnimated) backdrop.classList.add(CLASS_NAME_FADE);
				this._element = backdrop;
			}
			return this._element;
		}
		_configAfterMerge(config) {
			config.rootElement = getElement(config.rootElement);
			return config;
		}
		_append() {
			if (this._isAppended) return;
			const element = this._getElement();
			this._config.rootElement.append(element);
			EventHandler.on(element, EVENT_MOUSEDOWN, () => {
				execute(this._config.clickCallback);
			});
			this._isAppended = true;
		}
		_emulateAnimation(callback) {
			executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
		}
	};
	//#endregion
	//#region js/src/util/scrollbar.ts
	const SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
	const SELECTOR_STICKY_CONTENT = ".sticky-top";
	const PROPERTY_PADDING = "padding-right";
	const PROPERTY_MARGIN = "margin-right";
	var ScrollBarHelper = class {
		constructor() {
			this._element = document.body;
		}
		getWidth() {
			const documentWidth = document.documentElement.clientWidth;
			return Math.abs(window.innerWidth - documentWidth);
		}
		hide() {
			const width = this.getWidth();
			this._disableOverFlow();
			this._setElementAttributes(this._element, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
			this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
			this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, (calculatedValue) => calculatedValue - width);
		}
		reset() {
			this._resetElementAttributes(this._element, "overflow");
			this._resetElementAttributes(this._element, PROPERTY_PADDING);
			this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
			this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
		}
		isOverflowing() {
			return this.getWidth() > 0;
		}
		_disableOverFlow() {
			this._saveInitialAttribute(this._element, "overflow");
			this._element.style.overflow = "hidden";
		}
		_setElementAttributes(selector, styleProperty, callback) {
			const scrollbarWidth = this.getWidth();
			const manipulationCallBack = (element) => {
				if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) return;
				this._saveInitialAttribute(element, styleProperty);
				const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
				element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
			};
			this._applyManipulationCallback(selector, manipulationCallBack);
		}
		_saveInitialAttribute(element, styleProperty) {
			const actualValue = element.style.getPropertyValue(styleProperty);
			if (actualValue) Manipulator.setDataAttribute(element, styleProperty, actualValue);
		}
		_resetElementAttributes(selector, styleProperty) {
			const manipulationCallBack = (element) => {
				const value = Manipulator.getDataAttribute(element, styleProperty);
				if (value === null) {
					element.style.removeProperty(styleProperty);
					return;
				}
				Manipulator.removeDataAttribute(element, styleProperty);
				element.style.setProperty(styleProperty, value);
			};
			this._applyManipulationCallback(selector, manipulationCallBack);
		}
		_applyManipulationCallback(selector, callBack) {
			if (isElement(selector)) {
				callBack(selector);
				return;
			}
			for (const sel of SelectorEngine.find(selector, this._element)) callBack(sel);
		}
	};
	//#endregion
	//#region js/src/sidebar.ts
	const NAME$8 = "sidebar";
	const EVENT_KEY$6 = `.coreui.sidebar`;
	const DATA_API_KEY$1 = ".data-api";
	const Default$6 = {};
	const DefaultType$5 = {};
	const CLASS_NAME_BACKDROP = "sidebar-backdrop";
	const CLASS_NAME_HIDE = "hide";
	const CLASS_NAME_SHOW$4 = "show";
	const CLASS_NAME_SIDEBAR_NARROW = "sidebar-narrow";
	const CLASS_NAME_SIDEBAR_OVERLAID = "sidebar-overlaid";
	const CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE = "sidebar-narrow-unfoldable";
	const EVENT_HIDE$2 = `hide${EVENT_KEY$6}`;
	const EVENT_HIDDEN$2 = `hidden${EVENT_KEY$6}`;
	const EVENT_RESIZE = `resize${EVENT_KEY$6}`;
	const EVENT_SHOW$2 = `show${EVENT_KEY$6}`;
	const EVENT_SHOWN$2 = `shown${EVENT_KEY$6}`;
	const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$6}${DATA_API_KEY$1}`;
	const EVENT_LOAD_DATA_API$4 = `load${EVENT_KEY$6}${DATA_API_KEY$1}`;
	const SELECTOR_DATA_CLOSE = "[data-coreui-close=\"sidebar\"]";
	const SELECTOR_DATA_TOGGLE$1 = "[data-coreui-toggle=\"narrow\"], [data-coreui-toggle=\"unfoldable\"]";
	const SELECTOR_SIDEBAR = ".sidebar";
	var Sidebar = class Sidebar extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._show = this._isVisible();
			this._mobile = this._isMobile();
			this._overlaid = this._isOverlaid();
			this._narrow = this._isNarrow();
			this._unfoldable = this._isUnfoldable();
			this._backdrop = this._initializeBackDrop();
			this._clickOutHandler = (event) => this._clickOutListener(event);
			this._resizeHandler = () => {
				if (this._isMobile() && this._isVisible()) {
					this.hide();
					this._backdrop = this._initializeBackDrop();
				}
			};
			this._addEventListeners();
		}
		static get Default() {
			return Default$6;
		}
		static get DefaultType() {
			return DefaultType$5;
		}
		static get NAME() {
			return NAME$8;
		}
		async show() {
			EventHandler.trigger(this._element, EVENT_SHOW$2);
			if (this._element.classList.contains(CLASS_NAME_HIDE)) this._element.classList.remove(CLASS_NAME_HIDE);
			if (this._overlaid) this._element.classList.add(CLASS_NAME_SHOW$4);
			if (this._isMobile()) {
				this._element.classList.add(CLASS_NAME_SHOW$4);
				this._backdrop.show();
				new ScrollBarHelper().hide();
			}
			const complete = () => {
				if (this._isVisible() === true) {
					this._show = true;
					if (this._isMobile() || this._isOverlaid()) this._addClickOutListener();
					EventHandler.trigger(this._element, EVENT_SHOWN$2);
				}
			};
			await this._queueCallback(complete, this._element, true);
		}
		async hide() {
			EventHandler.trigger(this._element, EVENT_HIDE$2);
			if (this._element.classList.contains(CLASS_NAME_SHOW$4)) this._element.classList.remove(CLASS_NAME_SHOW$4);
			if (this._isMobile()) {
				this._backdrop.hide();
				new ScrollBarHelper().reset();
			}
			if (!this._isMobile() && !this._overlaid) this._element.classList.add(CLASS_NAME_HIDE);
			const complete = () => {
				if (this._isVisible() === false) {
					this._show = false;
					if (this._isMobile() || this._isOverlaid()) this._removeClickOutListener();
					EventHandler.trigger(this._element, EVENT_HIDDEN$2);
				}
			};
			await this._queueCallback(complete, this._element, true);
		}
		toggle() {
			return this._isVisible() ? this.hide() : this.show();
		}
		narrow() {
			if (!this._isMobile()) {
				this._element.classList.add(CLASS_NAME_SIDEBAR_NARROW);
				this._narrow = true;
			}
		}
		unfoldable() {
			if (!this._isMobile()) {
				this._element.classList.add(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE);
				this._unfoldable = true;
			}
		}
		reset() {
			if (!this._isMobile()) {
				if (this._narrow) {
					this._element.classList.remove(CLASS_NAME_SIDEBAR_NARROW);
					this._narrow = false;
				}
				if (this._unfoldable) {
					this._element.classList.remove(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE);
					this._unfoldable = false;
				}
			}
		}
		toggleNarrow() {
			if (this._narrow) {
				this.reset();
				return;
			}
			this.narrow();
		}
		toggleUnfoldable() {
			if (this._unfoldable) {
				this.reset();
				return;
			}
			this.unfoldable();
		}
		dispose() {
			if (this._isMobile() && this._isVisible()) new ScrollBarHelper().reset();
			this._backdrop.dispose();
			this._removeClickOutListener();
			EventHandler.off(window, EVENT_RESIZE, this._resizeHandler);
			super.dispose();
		}
		_initializeBackDrop() {
			return new Backdrop({
				className: CLASS_NAME_BACKDROP,
				isVisible: this._isMobile(),
				isAnimated: true,
				rootElement: this._element.parentNode,
				clickCallback: () => this.hide()
			});
		}
		_isMobile() {
			return Boolean(window.getComputedStyle(this._element, null).getPropertyValue("--cui-is-mobile"));
		}
		_isNarrow() {
			return this._element.classList.contains(CLASS_NAME_SIDEBAR_NARROW);
		}
		_isOverlaid() {
			return this._element.classList.contains(CLASS_NAME_SIDEBAR_OVERLAID);
		}
		_isUnfoldable() {
			return this._element.classList.contains(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE);
		}
		_isVisible() {
			const rect = this._element.getBoundingClientRect();
			return rect.top >= 0 && rect.left >= 0 && Math.floor(rect.bottom) <= (window.innerHeight || document.documentElement.clientHeight) && Math.floor(rect.right) <= (window.innerWidth || document.documentElement.clientWidth);
		}
		_clickOutListener(event) {
			if (event.target.closest(SELECTOR_SIDEBAR) === null) {
				event.preventDefault();
				event.stopPropagation();
				this.hide();
			}
		}
		_addClickOutListener() {
			EventHandler.on(document, EVENT_CLICK_DATA_API$2, this._clickOutHandler);
		}
		_removeClickOutListener() {
			EventHandler.off(document, EVENT_CLICK_DATA_API$2, this._clickOutHandler);
		}
		_addEventListeners() {
			if (this._mobile && this._show) this._addClickOutListener();
			if (this._overlaid && this._show) this._addClickOutListener();
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$1, (event) => {
				event.preventDefault();
				const toggle = Manipulator.getDataAttribute(event.target.closest(SELECTOR_DATA_TOGGLE$1), "toggle");
				if (toggle === "narrow") this.toggleNarrow();
				if (toggle === "unfoldable") this.toggleUnfoldable();
			});
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_CLOSE, (event) => {
				event.preventDefault();
				this.hide();
			});
			EventHandler.on(window, EVENT_RESIZE, this._resizeHandler);
		}
		static sidebarInterface(element, config, ...args) {
			const data = Sidebar.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Sidebar, config);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$4, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_SIDEBAR))) Sidebar.sidebarInterface(element);
	});
	defineJQueryPlugin(Sidebar);
	//#endregion
	//#region js/src/stepper.ts
	const NAME$7 = "stepper";
	const EVENT_KEY$5 = `.coreui.stepper`;
	const EVENT_FINISH = `finish${EVENT_KEY$5}`;
	const EVENT_RESET = `reset${EVENT_KEY$5}`;
	const EVENT_STEP_CHANGE = `stepChange${EVENT_KEY$5}`;
	const EVENT_STEP_VALIDATION_COMPLETE = `stepValidationComplete${EVENT_KEY$5}`;
	const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$5}`;
	const EVENT_INPUT$1 = `input${EVENT_KEY$5}`;
	const EVENT_KEYDOWN$2 = `keydown${EVENT_KEY$5}`;
	const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$5}`;
	const CLASS_NAME_ACTIVE$1 = "active";
	const CLASS_NAME_COMPLETE = "complete";
	const CLASS_NAME_SHOW$3 = "show";
	const CLASS_NAME_STEPPER_STEP_CONNECTOR = "stepper-step-connector";
	const CLASS_NAME_STEPPER_STEP_INDICATOR_ICON = "stepper-step-indicator-icon";
	const CLASS_NAME_STEPPER_STEP_INDICATOR_TEXT = "stepper-step-indicator-text";
	const CLASS_NAME_STEPPER_VERTICAL = "stepper-vertical";
	const SELECTOR_DATA_STEPPER = "[data-coreui-stepper]";
	const SELECTOR_STEPPER = ".stepper";
	const SELECTOR_STEPPER_ACTION = "[data-coreui-stepper-action]";
	const SELECTOR_STEPPER_STEP = ".stepper-step";
	const SELECTOR_STEPPER_STEP_BUTTON = ".stepper-step-button";
	const SELECTOR_STEPPER_STEP_CONTENT = ".stepper-step-content";
	const SELECTOR_STEPPER_STEP_INDICATOR = ".stepper-step-indicator";
	const SELECTOR_STEPPER_STEP_INDICATOR_ICON = ".stepper-step-indicator-icon";
	const SELECTOR_STEPPER_STEPS = ".stepper-steps";
	const SELECTOR_STEPPER_PANE = ".stepper-pane";
	const ARROW_LEFT_KEY$2 = "ArrowLeft";
	const ARROW_RIGHT_KEY$2 = "ArrowRight";
	const ARROW_UP_KEY$2 = "ArrowUp";
	const ARROW_DOWN_KEY$2 = "ArrowDown";
	const HOME_KEY$2 = "Home";
	const END_KEY$2 = "End";
	const Default$5 = {
		linear: true,
		skipValidation: false
	};
	const DefaultType$4 = {
		linear: "boolean",
		skipValidation: "boolean"
	};
	var Stepper = class Stepper extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._stepButtons = this._getStepButtons();
			this._tabPattern = !SelectorEngine.findOne(SELECTOR_STEPPER_STEP_CONTENT, this._element);
			this._activeStepButton = this._getActiveElem();
			this._initialStepButton = this._activeStepButton;
			this._isFinished = false;
			this._validationMarks = /* @__PURE__ */ new WeakMap();
			this._validatedForms = /* @__PURE__ */ new Set();
			this._addStepperConnector();
			this._resetPanes(this._getTargetPane(this._activeStepButton));
			this._wrapIndicatorText();
			this._setInitialComplete();
			this._updateStepButtonsDisabledState();
			this._setupAccessibilityAttributes();
			EventHandler.on(this._element, EVENT_KEYDOWN$2, SELECTOR_STEPPER_STEP_BUTTON, (event) => this._keydown(event));
		}
		static get Default() {
			return Default$5;
		}
		static get DefaultType() {
			return DefaultType$4;
		}
		static get NAME() {
			return NAME$7;
		}
		showStep(buttonOrStepNumber) {
			let button = buttonOrStepNumber;
			if (typeof buttonOrStepNumber === "number") button = this._stepButtons[buttonOrStepNumber - 1];
			if (!button) return;
			const active = this._getActiveElem();
			if (this._elemIsActive(button)) return;
			const isForward = this._stepButtons.indexOf(button) > this._stepButtons.indexOf(active);
			if (active && isForward && !this._isCurrentStepValid(active)) return;
			if (this._config.linear) {
				const steps = this._getEnabledStepButtons();
				if (steps.indexOf(button) > steps.indexOf(active) + 1) return;
			}
			const index = this._stepButtons.indexOf(button) + 1;
			EventHandler.trigger(this._element, EVENT_STEP_CHANGE, { index });
			const holdsFocus = this._holdsFocus();
			this._activeStepButton = button;
			this._deactivate(active);
			this._activate(button);
			this._updateStepButtonsDisabledState();
			this._complete(button);
			if (holdsFocus) button.focus();
		}
		next() {
			if (this._isFinished) return;
			const steps = this._getEnabledStepButtons();
			const active = this._getActiveElem();
			const next = steps[steps.indexOf(active) + 1];
			if (next) {
				this.showStep(next);
				return;
			}
			this.finish();
		}
		prev() {
			if (this._isFinished) return;
			const steps = this._getEnabledStepButtons();
			const active = this._getActiveElem();
			const prev = steps[steps.indexOf(active) - 1];
			if (prev) this.showStep(prev);
		}
		finish() {
			if (this._isFinished) return;
			const steps = this._getEnabledStepButtons();
			const active = this._getActiveElem();
			if (steps.indexOf(active) !== steps.length - 1) return;
			if (!this._isCurrentStepValid(active)) return;
			this._isFinished = true;
			const finishHandler = () => {
				active.classList.remove(CLASS_NAME_ACTIVE$1);
				this._markAsComplete(active);
				EventHandler.trigger(this._element, EVENT_FINISH);
				this._isFinished = true;
				this._disableStepButtons();
			};
			const pane = this._getTargetPane(active);
			const stepContent = active.parentNode.querySelector(SELECTOR_STEPPER_STEP_CONTENT);
			if (pane) {
				pane.classList.remove(CLASS_NAME_ACTIVE$1, CLASS_NAME_SHOW$3);
				finishHandler();
			} else if (stepContent) this._animateHeight(stepContent, false, finishHandler);
			else finishHandler();
		}
		reset() {
			if (!this._stepButtons.length) return;
			const holdsFocus = this._holdsFocus();
			for (const pane of SelectorEngine.find(SELECTOR_STEPPER_PANE, this._element)) {
				pane.classList.remove(CLASS_NAME_ACTIVE$1, CLASS_NAME_SHOW$3);
				pane.setAttribute("aria-hidden", "true");
			}
			for (const content of SelectorEngine.find(SELECTOR_STEPPER_STEP_CONTENT, this._element)) {
				content.classList.remove(CLASS_NAME_ACTIVE$1, CLASS_NAME_SHOW$3);
				content.setAttribute("aria-hidden", "true");
			}
			for (const btn of this._stepButtons) {
				btn.classList.remove(CLASS_NAME_ACTIVE$1, CLASS_NAME_COMPLETE);
				this._removeIndicatorIcon(btn);
			}
			for (const form of this._element.querySelectorAll(`${SELECTOR_STEPPER_PANE} form, ${SELECTOR_STEPPER_STEP_CONTENT} form`)) form.reset();
			for (const form of this._validatedForms) this._untrackValidatedForm(form);
			const firstStep = this._initialStepButton || this._stepButtons[0];
			firstStep.classList.add(CLASS_NAME_ACTIVE$1);
			const pane = this._getTargetPane(firstStep);
			if (pane) {
				pane.classList.add(CLASS_NAME_ACTIVE$1, CLASS_NAME_SHOW$3);
				pane.setAttribute("aria-hidden", "false");
			} else {
				const stepContent = firstStep.parentNode.querySelector(SELECTOR_STEPPER_STEP_CONTENT);
				if (stepContent) {
					stepContent.classList.add(CLASS_NAME_ACTIVE$1, CLASS_NAME_SHOW$3);
					stepContent.setAttribute("aria-hidden", "false");
				}
			}
			this._updateCompleteStates(this._stepButtons.indexOf(firstStep));
			this._activeStepButton = firstStep;
			this._isFinished = false;
			this._updateStepButtonsDisabledState();
			this._setupAccessibilityAttributes();
			if (holdsFocus) firstStep.focus();
			EventHandler.trigger(this._element, EVENT_RESET);
		}
		dispose() {
			for (const form of this._validatedForms) this._untrackValidatedForm(form);
			super.dispose();
		}
		_getStepButtons() {
			return SelectorEngine.find(SELECTOR_STEPPER_STEP_BUTTON, this._element);
		}
		_getEnabledStepButtons() {
			return this._getStepButtons().filter((el) => !isDisabled(el));
		}
		_getActiveElem() {
			return this._stepButtons.find((child) => this._elemIsActive(child)) || null;
		}
		_getTargetPane(element) {
			return SelectorEngine.getElementFromSelector(element);
		}
		_elemIsActive(elem) {
			return elem.classList.contains(CLASS_NAME_ACTIVE$1);
		}
		_getFocusedElement() {
			return this._element.getRootNode().activeElement;
		}
		_holdsFocus() {
			return this._element.contains(this._getFocusedElement());
		}
		_isCurrentStepValid(element) {
			if (this._config.skipValidation) return true;
			const target = this._getTargetPane(element) ?? element.parentNode.querySelector(SELECTOR_STEPPER_STEP_CONTENT);
			if (!target) return true;
			const form = target.querySelector("form");
			if (!form) return true;
			const stepIndex = this._stepButtons.indexOf(element) + 1;
			if (!form.noValidate) {
				EventHandler.trigger(this._element, EVENT_STEP_VALIDATION_COMPLETE, {
					stepIndex,
					isValid: isFormValid(form)
				});
				return form.reportValidity();
			}
			const { isValid } = validateForm(form, this._validationMarks, (isValid) => {
				EventHandler.trigger(this._element, EVENT_STEP_VALIDATION_COMPLETE, {
					stepIndex,
					isValid
				});
				return false;
			});
			this._trackValidatedForm(form);
			return isValid;
		}
		_trackValidatedForm(form) {
			if (!this._validatedForms.has(form)) {
				this._validatedForms.add(form);
				EventHandler.on(form, EVENT_INPUT$1, () => updateValidationState(form, this._validationMarks));
				EventHandler.on(form, EVENT_RESET, (event) => {
					setTimeout(() => {
						if (this._element && !event.defaultPrevented && this._validatedForms.has(form)) this._untrackValidatedForm(form);
					});
				});
			}
		}
		_untrackValidatedForm(form) {
			EventHandler.off(form, EVENT_INPUT$1);
			EventHandler.off(form, EVENT_RESET);
			clearValidationState(form, this._validationMarks);
			this._validatedForms.delete(form);
		}
		_activate(element) {
			if (!element) return;
			element.classList.add(CLASS_NAME_ACTIVE$1);
			element.setAttribute(this._tabPattern ? "aria-selected" : "aria-expanded", "true");
			element.setAttribute("tabIndex", "0");
			const pane = this._getTargetPane(element);
			if (pane) {
				pane.classList.add(CLASS_NAME_ACTIVE$1, CLASS_NAME_SHOW$3);
				pane.setAttribute("aria-hidden", "false");
			}
			const stepContentElement = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_CONTENT, element.parentNode);
			if (stepContentElement) this._animateHeight(stepContentElement, true);
		}
		_deactivate(element) {
			this._resetPanes();
			if (!element) return;
			element.setAttribute(this._tabPattern ? "aria-selected" : "aria-expanded", "false");
			element.setAttribute("tabIndex", "-1");
			const stepContentElement = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_CONTENT, element.parentNode);
			if (stepContentElement) this._animateHeight(stepContentElement, false, () => element.classList.remove(CLASS_NAME_ACTIVE$1));
			else element.classList.remove(CLASS_NAME_ACTIVE$1);
		}
		_complete(activeBtn) {
			const stepsContainer = activeBtn.closest(SELECTOR_STEPPER_STEPS) || document;
			const activeStepIdx = SelectorEngine.find(SELECTOR_STEPPER_STEP, stepsContainer).indexOf(activeBtn.parentNode);
			if (activeStepIdx === -1) return;
			this._updateCompleteStates(activeStepIdx);
		}
		_markAsComplete(button) {
			const activeStep = button.closest(SELECTOR_STEPPER_STEP);
			if (activeStep) {
				const stepButton = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_BUTTON, activeStep);
				if (stepButton) {
					stepButton.classList.add(CLASS_NAME_COMPLETE);
					this._appendIndicatorIcon(stepButton);
				}
			}
		}
		_updateCompleteStates(activeIndex) {
			for (const [idx, stepButton] of this._stepButtons.entries()) {
				const isComplete = idx < activeIndex;
				stepButton.classList.toggle(CLASS_NAME_COMPLETE, isComplete);
				if (isComplete) this._appendIndicatorIcon(stepButton);
				else this._removeIndicatorIcon(stepButton);
			}
		}
		_setInitialComplete() {
			const steps = SelectorEngine.find(SELECTOR_STEPPER_STEP, this._element);
			const activeBtn = this._getActiveElem();
			if (!activeBtn) return;
			const activeIdx = steps.indexOf(activeBtn.closest(SELECTOR_STEPPER_STEP));
			if (activeIdx === -1) return;
			this._updateCompleteStates(activeIdx);
		}
		_appendIndicatorIcon(button) {
			const indicator = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR, button);
			if (indicator && !SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR_ICON, indicator)) {
				const icon = document.createElement("span");
				icon.classList.add(CLASS_NAME_STEPPER_STEP_INDICATOR_ICON);
				indicator.append(icon);
			}
		}
		_removeIndicatorIcon(button) {
			const indicator = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR, button);
			if (!indicator) return;
			const icon = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR_ICON, indicator);
			if (icon) icon.remove();
		}
		_updateStepButtonsDisabledState() {
			const activeIndex = this._stepButtons.indexOf(this._activeStepButton);
			for (const [index, button] of this._stepButtons.entries()) button.disabled = this._config.linear && index > activeIndex + 1;
		}
		_disableStepButtons() {
			for (const stepButton of this._stepButtons) stepButton.disabled = true;
		}
		_animateHeight(element, expand, callback) {
			const startHeight = expand ? 0 : element.scrollHeight;
			const endHeight = expand ? element.scrollHeight : 0;
			element.style.height = `${startHeight}px`;
			element.style.overflow = "hidden";
			element.offsetHeight;
			requestAnimationFrame(() => {
				element.style.height = `${endHeight}px`;
				this._queueCallback(() => {
					element.style.overflow = "initial";
					if (expand) element.style.height = "auto";
					callback?.();
				}, element, true);
			});
		}
		_resetPanes(activePane = null) {
			for (const pane of SelectorEngine.find(SELECTOR_STEPPER_PANE, this._element)) {
				const isActive = pane === activePane;
				pane.classList.toggle(CLASS_NAME_ACTIVE$1, isActive);
				pane.classList.toggle(CLASS_NAME_SHOW$3, isActive);
				pane.setAttribute("aria-hidden", !isActive);
			}
		}
		_addStepperConnector() {
			for (const [index, stepButton] of this._stepButtons.entries()) if (index < this._stepButtons.length - 1) {
				const next = stepButton.nextElementSibling;
				if (!next || !next.classList.contains(CLASS_NAME_STEPPER_STEP_CONNECTOR)) {
					const connectorElement = document.createElement("div");
					connectorElement.classList.add(CLASS_NAME_STEPPER_STEP_CONNECTOR);
					stepButton.after(connectorElement);
				}
			}
		}
		_wrapIndicatorText() {
			for (const stepButton of this._stepButtons) {
				const indicator = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR, stepButton);
				if (!indicator) continue;
				const visibleNodes = Array.from(indicator.childNodes).filter((node) => {
					if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim() !== "";
					if (node.nodeType === Node.ELEMENT_NODE) return true;
					return false;
				});
				if (visibleNodes.length !== 1 || visibleNodes[0].nodeType !== Node.TEXT_NODE) continue;
				const textNode = visibleNodes[0];
				const wrapper = document.createElement("span");
				wrapper.classList.add(CLASS_NAME_STEPPER_STEP_INDICATOR_TEXT);
				wrapper.textContent = textNode.textContent.trim();
				textNode.replaceWith(wrapper);
			}
		}
		_setupAccessibilityAttributes() {
			const uId = getUID(this.constructor.NAME).toString();
			const stepList = SelectorEngine.findOne(SELECTOR_STEPPER_STEPS, this._element);
			if (stepList && this._tabPattern) {
				stepList.setAttribute("role", "tablist");
				stepList.setAttribute("aria-orientation", this._element.classList.contains(CLASS_NAME_STEPPER_VERTICAL) ? "vertical" : "horizontal");
			}
			for (const [index, stepButton] of this._stepButtons.entries()) {
				const parentStepItem = stepButton.closest(SELECTOR_STEPPER_STEP);
				if (parentStepItem && this._tabPattern) parentStepItem.setAttribute("role", "presentation");
				if (this._tabPattern) stepButton.setAttribute("role", "tab");
				if (!stepButton.id) stepButton.id = `${uId}${index + 1}`;
				const pane = SelectorEngine.getElementFromSelector(stepButton);
				if (pane) {
					stepButton.setAttribute("aria-controls", pane.id);
					if (this._tabPattern) pane.setAttribute("role", "tabpanel");
					pane.setAttribute("aria-labelledby", stepButton.id);
					pane.setAttribute("aria-hidden", !this._elemIsActive(stepButton));
				}
				if (this._elemIsActive(stepButton)) {
					stepButton.setAttribute(this._tabPattern ? "aria-selected" : "aria-expanded", "true");
					stepButton.setAttribute("tabIndex", "0");
				} else {
					stepButton.setAttribute(this._tabPattern ? "aria-selected" : "aria-expanded", "false");
					stepButton.setAttribute("tabIndex", "-1");
				}
			}
		}
		_keydown(event) {
			if (![
				ARROW_LEFT_KEY$2,
				ARROW_RIGHT_KEY$2,
				ARROW_UP_KEY$2,
				ARROW_DOWN_KEY$2,
				HOME_KEY$2,
				END_KEY$2
			].includes(event.key)) return;
			event.stopPropagation();
			event.preventDefault();
			const children = this._getEnabledStepButtons();
			let nextActiveElement;
			switch (event.key) {
				case HOME_KEY$2:
					nextActiveElement = children[0];
					break;
				case END_KEY$2:
					nextActiveElement = children[children.length - 1];
					break;
				case ARROW_RIGHT_KEY$2:
				case ARROW_DOWN_KEY$2:
					nextActiveElement = getNextActiveElement(children, event.delegateTarget, true, true);
					break;
				case ARROW_LEFT_KEY$2:
				case ARROW_UP_KEY$2: nextActiveElement = getNextActiveElement(children, event.delegateTarget, false, true);
			}
			nextActiveElement?.focus({ preventScroll: true });
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, Stepper, config, args);
		}
	};
	EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_STEPPER_STEP_BUTTON, function(event) {
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if (isDisabled(this)) return;
		const stepperElement = this.closest(SELECTOR_STEPPER);
		if (!stepperElement) return;
		Stepper.getOrCreateInstance(stepperElement).showStep(this);
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_STEPPER_ACTION, function() {
		const action = Manipulator.getDataAttribute(this, "stepper-action");
		const stepperElement = this.closest(SELECTOR_STEPPER);
		if (!stepperElement) return;
		const stepper = Stepper.getOrCreateInstance(stepperElement);
		if (stepper && typeof stepper[action] === "function") stepper[action]();
	});
	EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_STEPPER)) Stepper.getOrCreateInstance(element);
	});
	defineJQueryPlugin(Stepper);
	//#endregion
	//#region js/src/tab.ts
	const NAME$6 = "tab";
	const EVENT_KEY$4 = `.coreui.tab`;
	const EVENT_HIDE$1 = `hide${EVENT_KEY$4}`;
	const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$4}`;
	const EVENT_SHOW$1 = `show${EVENT_KEY$4}`;
	const EVENT_SHOWN$1 = `shown${EVENT_KEY$4}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY$4}`;
	const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$4}`;
	const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$4}`;
	const ARROW_LEFT_KEY$1 = "ArrowLeft";
	const ARROW_RIGHT_KEY$1 = "ArrowRight";
	const ARROW_UP_KEY$1 = "ArrowUp";
	const ARROW_DOWN_KEY$1 = "ArrowDown";
	const HOME_KEY$1 = "Home";
	const END_KEY$1 = "End";
	const CLASS_NAME_ACTIVE = "active";
	const CLASS_NAME_SHOW$2 = "show";
	const SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
	const SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
	const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
	const SELECTOR_TAB_PANEL = ".list-group, .nav, [role=\"tablist\"]";
	const SELECTOR_OUTER = ".nav-item, .list-group-item";
	const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
	const SELECTOR_DATA_TOGGLE = "[data-coreui-toggle=\"tab\"], [data-coreui-toggle=\"pill\"], [data-coreui-toggle=\"list\"]";
	const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
	const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-coreui-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-coreui-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-coreui-toggle="list"]`;
	const activationIds = /* @__PURE__ */ new WeakMap();
	var Tab = class Tab extends BaseComponent {
		constructor(element) {
			super(element);
			this._parent = this._element.closest(SELECTOR_TAB_PANEL);
			if (!this._parent) throw new TypeError(`${this._element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`);
			this._setInitialAttributes(this._parent, this._getChildren());
			EventHandler.on(this._element, EVENT_KEYDOWN$1, (event) => this._keydown(event));
		}
		static get NAME() {
			return NAME$6;
		}
		async show() {
			const innerElem = this._element;
			if (this._elemIsActive(innerElem)) return;
			const active = this._getActiveElem();
			const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, { relatedTarget: innerElem }) : null;
			if (EventHandler.trigger(innerElem, EVENT_SHOW$1, { relatedTarget: active }).defaultPrevented || hideEvent && hideEvent.defaultPrevented) return;
			const activationId = (activationIds.get(this._parent) || 0) + 1;
			activationIds.set(this._parent, activationId);
			this._deactivate(active, innerElem);
			await this._activate(innerElem, active, activationId);
		}
		async _activate(element, relatedElem, activationId) {
			if (!element) return;
			element.classList.add(CLASS_NAME_ACTIVE);
			if (element.getAttribute("role") !== "tab") {
				element.classList.add(CLASS_NAME_SHOW$2);
				return;
			}
			const pane = SelectorEngine.getElementFromSelector(element);
			this._activate(pane);
			const complete = () => {
				if (activationId !== void 0 && activationId !== activationIds.get(this._parent) || !element.classList.contains(CLASS_NAME_ACTIVE)) return;
				element.removeAttribute("tabindex");
				setAriaAttribute(element, "aria-selected", true);
				this._toggleDropDown(element, true);
				EventHandler.trigger(element, EVENT_SHOWN$1, { relatedTarget: relatedElem });
			};
			await this._queueCallback(complete, pane ?? element, getTransitionDurationFromElement(pane) > 0);
		}
		async _deactivate(element, relatedElem) {
			if (!element) return;
			element.classList.remove(CLASS_NAME_ACTIVE);
			element.blur();
			if (element.getAttribute("role") !== "tab") {
				element.classList.remove(CLASS_NAME_SHOW$2);
				return;
			}
			this._deactivate(SelectorEngine.getElementFromSelector(element));
			const complete = () => {
				setAriaAttribute(element, "aria-selected", false);
				element.setAttribute("tabindex", "-1");
				this._toggleDropDown(element, false);
				EventHandler.trigger(element, EVENT_HIDDEN$1, { relatedTarget: relatedElem });
			};
			await this._queueCallback(complete, element, false);
		}
		_keydown(event) {
			if (![
				ARROW_LEFT_KEY$1,
				ARROW_RIGHT_KEY$1,
				ARROW_UP_KEY$1,
				ARROW_DOWN_KEY$1,
				HOME_KEY$1,
				END_KEY$1
			].includes(event.key)) return;
			if (event.altKey || event.ctrlKey || event.metaKey) return;
			event.stopPropagation();
			event.preventDefault();
			const children = this._getChildren().filter((element) => !isDisabled(element));
			let nextActiveElement;
			if ([HOME_KEY$1, END_KEY$1].includes(event.key)) nextActiveElement = children[event.key === HOME_KEY$1 ? 0 : children.length - 1];
			else {
				const isNext = [ARROW_RIGHT_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
				nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
			}
			if (nextActiveElement) {
				nextActiveElement.focus({ preventScroll: true });
				Tab.getOrCreateInstance(nextActiveElement).show();
			}
		}
		_getChildren() {
			return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
		}
		_getActiveElem() {
			return this._getChildren().find((child) => this._elemIsActive(child)) || null;
		}
		_setInitialAttributes(parent, children) {
			this._setAttributeIfNotExists(parent, "role", "tablist");
			for (const child of children) this._setInitialAttributesOnChild(child);
		}
		_setInitialAttributesOnChild(child) {
			child = this._getInnerElement(child);
			const isActive = this._elemIsActive(child);
			const outerElem = this._getOuterElement(child);
			setAriaAttribute(child, "aria-selected", isActive);
			if (outerElem !== child) this._setAttributeIfNotExists(outerElem, "role", "presentation");
			if (!isActive) child.setAttribute("tabindex", "-1");
			this._setAttributeIfNotExists(child, "role", "tab");
			this._setInitialAttributesOnTargetPanel(child);
		}
		_setInitialAttributesOnTargetPanel(child) {
			const target = SelectorEngine.getElementFromSelector(child);
			if (!target) return;
			this._setAttributeIfNotExists(target, "role", "tabpanel");
			if (child.id) this._setAttributeIfNotExists(target, "aria-labelledby", `${child.id}`);
		}
		_toggleDropDown(element, open) {
			const outerElem = this._getOuterElement(element);
			const dropdownToggle = SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE, outerElem);
			if (!dropdownToggle) return;
			const dropdownMenu = SelectorEngine.findOne(SELECTOR_DROPDOWN_MENU, outerElem);
			dropdownToggle.classList.toggle(CLASS_NAME_ACTIVE, open);
			if (dropdownMenu) dropdownMenu.classList.toggle(CLASS_NAME_SHOW$2, open);
			setAriaAttribute(dropdownToggle, "aria-expanded", open);
		}
		_setAttributeIfNotExists(element, attribute, value) {
			if (!element.hasAttribute(attribute)) element.setAttribute(attribute, value);
		}
		_elemIsActive(elem) {
			return elem.classList.contains(CLASS_NAME_ACTIVE);
		}
		_getInnerElement(elem) {
			return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
		}
		_getOuterElement(elem) {
			return elem.closest(SELECTOR_OUTER) || elem;
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Tab, config);
		}
	};
	EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if (isDisabled(this)) return;
		Tab.getOrCreateInstance(this).show();
	});
	EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) Tab.getOrCreateInstance(element);
	});
	defineJQueryPlugin(Tab);
	//#endregion
	//#region js/src/time-input.ts
	const NAME$5 = "time-input";
	const EVENT_LOAD_DATA_API$1 = `load.coreui.time-input.data-api`;
	const SELECTOR_DATA_TIME_INPUT = "[data-coreui-time-input]";
	const Default$4 = {
		...DateInput.Default,
		ariaLabel: "Time input",
		type: "time"
	};
	var TimeInput = class TimeInput extends DateInput {
		static get Default() {
			return Default$4;
		}
		static get NAME() {
			return NAME$5;
		}
		static get CHANGE_EVENT_NAME() {
			return "timeChange";
		}
		_configAfterMerge(config) {
			return {
				...config,
				type: "time"
			};
		}
		_getAriaLabel() {
			return this._config.ariaLabel || this.constructor.Default.ariaLabel;
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, TimeInput, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
		for (const timeInput of SelectorEngine.find(SELECTOR_DATA_TIME_INPUT)) TimeInput.getOrCreateInstance(timeInput);
	});
	defineJQueryPlugin(TimeInput);
	//#endregion
	//#region js/src/time-selection/roll.ts
	const NAME$4 = "time-roll";
	const CLASS_NAME_CELL = "time-picker-cell";
	const CLASS_NAME_COL = "time-picker-col";
	const CLASS_NAME_DISABLED$1 = "disabled";
	const CLASS_NAME_SELECTED = "selected";
	const ARROW_DOWN_KEY = "ArrowDown";
	const ARROW_LEFT_KEY = "ArrowLeft";
	const ARROW_RIGHT_KEY = "ArrowRight";
	const ARROW_UP_KEY = "ArrowUp";
	const END_KEY = "End";
	const ENTER_KEY = "Enter";
	const HOME_KEY = "Home";
	const SPACE_KEY = "Space";
	const EVENT_KEYDOWN = `keydown.coreui.time-selection`;
	const SELECTOR_CELL = `.${CLASS_NAME_CELL}`;
	const SELECTOR_CELL_SELECTED = `.${CLASS_NAME_CELL}.${CLASS_NAME_SELECTED}`;
	const SELECTOR_COL = `.${CLASS_NAME_COL}`;
	var TimeRoll = class extends TimeSelection {
		static get NAME() {
			return NAME$4;
		}
		_renderBody() {
			this._renderColumns();
			this._addKeyboardNavigation();
		}
		_stops() {
			return SelectorEngine.find(SELECTOR_CELL, this._element);
		}
		_entryStop(list) {
			const [column] = SelectorEngine.find(SELECTOR_COL, this._element);
			return column ? this._entryCell(column) : list[0] ?? null;
		}
		_markPart(part, value, instant) {
			for (const cell of SelectorEngine.find(`[data-coreui-${part}]`, this._element)) {
				const isSelected = String(Manipulator.getDataAttribute(cell, part)) === String(value);
				cell.classList.toggle(CLASS_NAME_SELECTED, isSelected);
				cell.setAttribute("aria-selected", isSelected ? "true" : "false");
				if (isSelected && cell.parentElement) this._scrollToSelected(cell.parentElement, cell, instant);
			}
		}
		_markDisabled() {
			for (const part of this._parts()) for (const option of part.options) {
				const cell = SelectorEngine.findOne(`[data-coreui-${part.name}="${option.value}"]`, this._element);
				cell?.classList.toggle(CLASS_NAME_DISABLED$1, option.disabled);
				cell?.setAttribute("aria-disabled", option.disabled ? "true" : "false");
			}
		}
		_renderColumns() {
			for (const part of this._parts()) {
				const column = document.createElement("div");
				column.classList.add(CLASS_NAME_COL);
				column.setAttribute("role", "listbox");
				column.setAttribute("aria-label", part.ariaLabel);
				for (const option of part.options) {
					const cell = document.createElement("div");
					cell.classList.add(CLASS_NAME_CELL);
					cell.setAttribute("role", "option");
					cell.setAttribute("aria-label", option.label.toString());
					cell.setAttribute("aria-selected", "false");
					cell.tabIndex = -1;
					cell.textContent = option.label;
					Manipulator.setDataAttribute(cell, part.name, option.value);
					cell.addEventListener("click", () => {
						if (!cell.classList.contains(CLASS_NAME_DISABLED$1)) {
							this._change(part.name, option.value);
							this._moveFocusToColumn(cell, 0);
						}
					});
					cell.addEventListener("keydown", (event) => {
						if (event.code === SPACE_KEY || event.key === ENTER_KEY) {
							event.preventDefault();
							if (cell.classList.contains(CLASS_NAME_DISABLED$1)) return;
							this._change(part.name, option.value);
							this._moveFocusToColumn(cell, cell.parentElement?.nextElementSibling ? 1 : 0);
						}
					});
					column.append(cell);
				}
				this._element.append(column);
			}
		}
		_addKeyboardNavigation() {
			EventHandler.off(this._element, EVENT_KEYDOWN);
			EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_CELL, (event) => {
				const target = event.target;
				if (event.key === ARROW_DOWN_KEY || event.key === ARROW_UP_KEY) {
					event.preventDefault();
					const items = SelectorEngine.find(SELECTOR_CELL, target.parentElement);
					if (items.length === 0) return;
					getNextActiveElement(items, target, event.key === ARROW_DOWN_KEY, !items.includes(target))?.focus();
					return;
				}
				if (event.key === HOME_KEY || event.key === END_KEY) {
					event.preventDefault();
					const items = SelectorEngine.find(SELECTOR_CELL, target.parentElement);
					if (items.length === 0) return;
					items[event.key === HOME_KEY ? 0 : items.length - 1].focus();
					return;
				}
				if (event.key === ARROW_LEFT_KEY || event.key === ARROW_RIGHT_KEY) {
					event.preventDefault();
					const rtl = isRTL(target);
					const goLeft = event.key === ARROW_LEFT_KEY && !rtl || event.key === ARROW_RIGHT_KEY && rtl;
					this._moveFocusToColumn(target, goLeft ? -1 : 1);
				}
			});
		}
		_moveFocusToColumn(cell, offset) {
			const columns = SelectorEngine.find(SELECTOR_COL, this._element);
			const index = columns.indexOf(cell.parentElement) + offset;
			if (index < 0 || index > columns.length - 1) return;
			this._entryCell(columns[index])?.focus();
		}
		_entryCell(column) {
			return SelectorEngine.findOne(SELECTOR_CELL_SELECTED, column) ?? SelectorEngine.findOne(`${SELECTOR_CELL}:not(.${CLASS_NAME_DISABLED$1})`, column) ?? SelectorEngine.findOne(SELECTOR_CELL, column);
		}
		_scrollToSelected(column, cell, instant) {
			column.scrollTo({
				behavior: instant ? "instant" : "smooth",
				top: cell.offsetTop
			});
		}
	};
	//#endregion
	//#region js/src/time-picker.ts
	const NAME$3 = "time-picker";
	const EVENT_KEY$3 = `.coreui.time-picker`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY$3}.data-api`;
	const EVENT_TIME_CHANGE = `timeChange${EVENT_KEY$3}`;
	const CLASS_NAME_BODY = "time-picker-body";
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_INDICATOR = "form-control-action";
	const CLASS_NAME_INPUT_GROUP = "form-control-group";
	const CLASS_NAME_PICKER = "picker";
	const CLASS_NAME_TIME_PICKER = "time-picker";
	const SELECTOR_ACTION_NOW = "[data-coreui-picker-action=\"now\"]";
	const SELECTOR_DATA_TIME_PICKER = "[data-coreui-time-picker]";
	const Default$3 = {
		allowList: SVGAllowlist,
		ariaCleanerLabel: "Clear time",
		ariaPickerLabel: "Toggle time selection",
		ariaPopupLabel: "Time selection",
		cleaner: true,
		cleanerIcon: CLEANER_ICON,
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
	const ORIGINAL_DEFAULT = { ...Default$3 };
	const DefaultType$3 = {
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
	var TimePicker = class TimePicker extends PickerBase {
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
			return Default$3;
		}
		static get DefaultType() {
			return DefaultType$3;
		}
		static get NAME() {
			return NAME$3;
		}
		getTime() {
			return this._input?.getDate() ?? null;
		}
		setTime(time) {
			this._typeCheckConfig({ time }, { time: DefaultType$3.time });
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
			applyControlGroupClasses(inputGroup, CLASS_NAME_INPUT_GROUP);
			applyControlGroupSize(inputGroup, this._config.size);
			const inputEl = document.createElement("div");
			this._fieldElement = appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`);
			this._moveAriaToField(inputEl);
			if (this._config.cleaner) {
				this._cleanerElement = this._createAction(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				inputGroup.append(this._cleanerElement);
			}
			this._toggleElement = null;
			if (this._config.pickerIcon) {
				this._toggleElement = this._createAction(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? CLOCK_ICON : this._config.pickerIcon, this._config.ariaPickerLabel);
				inputGroup.append(this._toggleElement);
			}
			this._input = new TimeInput(inputEl, this._forwardConfig(TimeInput, {
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
			EventHandler.on(inputEl, TimeInput.eventName(TimeInput.CHANGE_EVENT_NAME), (event) => {
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
			const [minDate, maxDate] = [min, max].map((limit) => getDateWithin(this._input._sections, convertValue(limit, "time", locale)));
			const hourCycle = getHourCycle(this._input._sections);
			this._selection = new TimeRoll(this._selectionElement, this._forwardConfig(TimeRoll, {
				locale: this._config.locale,
				maxDate: maxDate ?? (minDate && createDate(1970)),
				minDate
			}, {
				...this._config.selectionOptions,
				...hourCycle && { hourCycle },
				onChange: (time) => this._runAsUser(() => this._applyTime(time && constrainDateTime(time, minDate, maxDate), time)),
				time: this.getTime()
			}));
		}
		_applyTime(time, picked) {
			this._write(time, "selection");
			if (this._element && isSameInstantAs(this._selection.getTime(), picked)) this._selection.setTime(this.getTime() ?? time);
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
			EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time });
		}
		_syncParts() {
			const source = this._source;
			this._source = null;
			if (source !== "selection") this._showTime(this.getTime());
		}
		_showTime(time) {
			if (this._selection && !isSameInstantAs(this._selection.getTime(), time)) this._selection.setConfig({ time });
		}
		_onPopupShow() {
			this._ensureSelection();
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, TimePicker, config, args);
		}
	};
	EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TIME_PICKER)) TimePicker.getOrCreateInstance(element);
	});
	defineJQueryPlugin(TimePicker);
	//#endregion
	//#region js/src/toast.ts
	const NAME$2 = "toast";
	const EVENT_KEY$2 = `.coreui.toast`;
	const EVENT_MOUSEOVER$1 = `mouseover${EVENT_KEY$2}`;
	const EVENT_MOUSEOUT$1 = `mouseout${EVENT_KEY$2}`;
	const EVENT_FOCUSIN$1 = `focusin${EVENT_KEY$2}`;
	const EVENT_FOCUSOUT$1 = `focusout${EVENT_KEY$2}`;
	const EVENT_HIDE = `hide${EVENT_KEY$2}`;
	const EVENT_HIDDEN = `hidden${EVENT_KEY$2}`;
	const EVENT_SHOW = `show${EVENT_KEY$2}`;
	const EVENT_SHOWN = `shown${EVENT_KEY$2}`;
	const CLASS_NAME_INSTANT$1 = "toast-instant";
	const CLASS_NAME_SHOW$1 = "show";
	const DefaultType$2 = {
		autohide: "boolean",
		delay: "number"
	};
	const Default$2 = {
		autohide: true,
		delay: 5e3
	};
	var Toast = class Toast extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._timeout = null;
			this._hasMouseInteraction = false;
			this._hasKeyboardInteraction = false;
			this._setListeners();
		}
		static get Default() {
			return Default$2;
		}
		static get DefaultType() {
			return DefaultType$2;
		}
		static get NAME() {
			return NAME$2;
		}
		async show() {
			if (EventHandler.trigger(this._element, EVENT_SHOW).defaultPrevented) return;
			this._clearTimeout();
			const complete = () => {
				EventHandler.trigger(this._element, EVENT_SHOWN);
				this._maybeScheduleHide();
			};
			this._element.classList.add(CLASS_NAME_SHOW$1);
			await this._queueCallback(complete, this._element, this._isAnimated());
		}
		async hide() {
			if (!this.isShown()) return;
			if (EventHandler.trigger(this._element, EVENT_HIDE).defaultPrevented) return;
			const complete = () => {
				EventHandler.trigger(this._element, EVENT_HIDDEN);
			};
			this._element.classList.remove(CLASS_NAME_SHOW$1);
			await this._queueCallback(complete, this._element, this._isAnimated());
		}
		dispose() {
			this._clearTimeout();
			if (this.isShown()) this._element.classList.remove(CLASS_NAME_SHOW$1);
			super.dispose();
		}
		isShown() {
			return this._element.classList.contains(CLASS_NAME_SHOW$1);
		}
		_isAnimated() {
			return !this._element.classList.contains(CLASS_NAME_INSTANT$1);
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
			EventHandler.on(this._element, EVENT_MOUSEOVER$1, (event) => this._onInteraction(event, true));
			EventHandler.on(this._element, EVENT_MOUSEOUT$1, (event) => this._onInteraction(event, false));
			EventHandler.on(this._element, EVENT_FOCUSIN$1, (event) => this._onInteraction(event, true));
			EventHandler.on(this._element, EVENT_FOCUSOUT$1, (event) => this._onInteraction(event, false));
		}
		_clearTimeout() {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		static jQueryInterface(config) {
			return jQueryDispatch(this, Toast, config, (element) => [element]);
		}
	};
	enableDismissTrigger(Toast);
	defineJQueryPlugin(Toast);
	//#endregion
	//#region js/src/toaster.ts
	const NAME$1 = "toaster";
	const EVENT_KEY$1 = `.coreui.toaster`;
	const EVENT_ADD = `add${EVENT_KEY$1}`;
	const EVENT_CLICK$1 = `click${EVENT_KEY$1}`;
	const EVENT_MOUSEOVER = `mouseover${EVENT_KEY$1}`;
	const EVENT_MOUSEOUT = `mouseout${EVENT_KEY$1}`;
	const EVENT_FOCUSIN = `focusin${EVENT_KEY$1}`;
	const EVENT_FOCUSOUT = `focusout${EVENT_KEY$1}`;
	const EVENT_REMOVE = `remove${EVENT_KEY$1}`;
	const EVENT_HIDE_TOAST = "hide.coreui.toast";
	const EVENT_HIDDEN_TOAST = "hidden.coreui.toast";
	const CLASS_NAME_CONTAINER = "toast-container";
	const CLASS_NAME_STACK = "toast-container-stack";
	const CLASS_NAME_INSTANT = "toast-instant";
	const CLASS_NAME_SHOW = "show";
	const CLASS_NAME_TRANSLUCENT = "toast-translucent";
	const CLASS_NAME_ROW = "toast-row";
	const SELECTOR_TITLE = ".toast-title";
	const SELECTOR_DESCRIPTION = ".toast-description";
	const SELECTOR_ACTION = ".toast-action";
	const SELECTOR_HEADER = ".toast-header";
	const SELECTOR_CLOSE = ".btn-close";
	const ATTRIBUTE_ID = "data-coreui-toast-id";
	const ATTRIBUTE_LIMITED = "data-coreui-limited";
	const ATTRIBUTE_STACK_INDEX = "data-coreui-stack-index";
	const ATTRIBUTE_STACK_HIDDEN = "data-coreui-stack-hidden";
	const ATTRIBUTE_UPDATE_KEY = "data-coreui-update-key";
	const PROPERTY_STACK_INDEX = "--cui-toast-stack-index";
	const STACK_VISIBLE = 3;
	const GLIDE_ID = "coreui.toaster.glide";
	const PROPERTY_STACK_BEFORE = "--cui-toast-stack-before";
	const PROPERTY_STACK_COUNT = "--cui-toast-stack-count";
	const PROPERTY_STACK_FRONT_HEIGHT = "--cui-toast-stack-front-height";
	const PROPERTY_STACK_HEIGHTS = "--cui-toast-stack-heights";
	const PROPERTY_TOAST_HEIGHT = "--cui-toast-height";
	const PROPERTY_ENTER_TRANSLATE = "--cui-toast-enter-translate";
	const PROPERTY_LEAVE_TRANSLATE = "--cui-toast-leave-translate";
	const EDGES = {
		bottom: "0 calc(100% + var(--cui-toast-container-inset))",
		end: "calc(var(--cui-toast-inline-sign) * (100% + var(--cui-toast-container-inset))) 0",
		start: "calc(var(--cui-toast-inline-sign) * (-100% - var(--cui-toast-container-inset))) 0",
		top: "0 calc(-100% - var(--cui-toast-container-inset))"
	};
	const PLACEMENTS = /* @__PURE__ */ new Set([
		"top-start",
		"top-center",
		"top-end",
		"middle-start",
		"middle-center",
		"middle-end",
		"bottom-start",
		"bottom-center",
		"bottom-end"
	]);
	const TEMPLATE = [
		"<div class=\"toast\">",
		"  <div class=\"toast-header\">",
		"    <strong class=\"toast-title\"></strong>",
		"    <button type=\"button\" class=\"btn-close\" data-coreui-dismiss=\"toast\"></button>",
		"  </div>",
		"  <div class=\"toast-body\">",
		"    <div class=\"toast-description\"></div>",
		"    <button type=\"button\" class=\"btn btn-sm toast-action\"></button>",
		"    <button type=\"button\" class=\"btn-close\" data-coreui-dismiss=\"toast\"></button>",
		"  </div>",
		"</div>"
	].join("");
	const Default$1 = {
		allowList: DefaultAllowlist,
		ariaCloseLabel: "Close",
		ariaLabel: "Notifications",
		container: "body",
		enter: "auto",
		html: false,
		leave: "auto",
		limit: 3,
		pauseOnHover: true,
		placement: "top-end",
		sanitize: true,
		sanitizeFn: null,
		stack: false,
		timeout: 5e3
	};
	const DefaultType$1 = {
		allowList: "object",
		ariaCloseLabel: "string",
		ariaLabel: "string",
		container: "(string|element)",
		enter: "string",
		html: "boolean",
		leave: "string",
		limit: "number",
		pauseOnHover: "boolean",
		placement: "string",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		stack: "boolean",
		timeout: "number"
	};
	const ToastDefault = {
		dismissible: true,
		priority: "normal"
	};
	const ToastDefaultType = {
		action: "(object|null|undefined)",
		class: "(string|undefined)",
		data: "(object|undefined)",
		description: "(string|element|function|undefined)",
		dismissible: "boolean",
		id: "(string|undefined)",
		instant: "(boolean|undefined)",
		onClose: "(function|undefined)",
		onRemove: "(function|undefined)",
		priority: "string",
		theme: "(string|undefined)",
		timeout: "(number|undefined)",
		title: "(string|element|function|undefined)",
		translucent: "(boolean|undefined)"
	};
	var Toaster = class Toaster extends BaseComponent {
		constructor(element, config) {
			const ownsContainer = !getElement(element);
			super(ownsContainer ? document.createElement("div") : element, config);
			this._entries = /* @__PURE__ */ new Map();
			this._order = 0;
			this._ownsContainer = ownsContainer;
			if (!PLACEMENTS.has(this._config.placement)) throw new TypeError(`${NAME$1.toUpperCase()}: Option "placement" provided value "${this._config.placement}" but expected one of ${[...PLACEMENTS].join(", ")}.`);
			for (const option of ["enter", "leave"]) if (this._config[option] !== "auto" && !Object.hasOwn(EDGES, this._config[option])) throw new TypeError(`${NAME$1.toUpperCase()}: Option "${option}" provided value "${this._config[option]}" but expected one of auto, ${Object.keys(EDGES).join(", ")}.`);
			if (ownsContainer) {
				this._element.className = `${CLASS_NAME_CONTAINER} ${CLASS_NAME_CONTAINER}-${this._config.placement}`;
				getElement(this._config.container).append(this._element);
			}
			this._element.setAttribute("role", "region");
			this._element.setAttribute("aria-label", this._config.ariaLabel);
			const leave = this._config.leave === "auto" ? this._config.enter : this._config.leave;
			if (this._config.enter !== "auto") this._element.style.setProperty(PROPERTY_ENTER_TRANSLATE, EDGES[this._config.enter]);
			if (leave !== "auto") this._element.style.setProperty(PROPERTY_LEAVE_TRANSLATE, EDGES[leave]);
			this._announcements = /* @__PURE__ */ new Map();
			if (this._config.pauseOnHover) {
				EventHandler.on(this._element, EVENT_MOUSEOVER, () => this.pause());
				EventHandler.on(this._element, EVENT_FOCUSIN, () => this.pause());
				EventHandler.on(this._element, EVENT_MOUSEOUT, (event) => this._onLeave(event));
				EventHandler.on(this._element, EVENT_FOCUSOUT, (event) => this._onLeave(event));
			}
			this._resizeObserver = null;
			if (this._config.stack) {
				this._element.classList.add(CLASS_NAME_STACK);
				this._resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(() => this._layoutStack()) : null;
			}
		}
		static get Default() {
			return Default$1;
		}
		static get DefaultType() {
			return DefaultType$1;
		}
		static get NAME() {
			return NAME$1;
		}
		add(options = {}) {
			this._typeCheckConfig({
				...ToastDefault,
				...options
			}, ToastDefaultType);
			const existing = options.id ? this._entries.get(options.id) : null;
			if (existing && !existing.leaving) {
				this.update(existing.toast.id, options);
				return existing.toast.id;
			}
			if (existing) {
				this._remove(existing, false);
				return this.add(options);
			}
			const toast = {
				...ToastDefault,
				...options,
				element: document.createElement("div"),
				id: options.id ?? getUID(`${NAME$1}-`),
				limited: false,
				updateKey: 0
			};
			toast.element = this._render(toast);
			toast.element.setAttribute(ATTRIBUTE_ID, toast.id);
			toast.element.style.zIndex = String(++this._order);
			const timeout = toast.timeout ?? this._config.timeout;
			const instance = new Toast(toast.element, {
				autohide: timeout > 0,
				delay: timeout
			});
			const entry = {
				instance,
				leaving: false,
				toast
			};
			this._entries.set(toast.id, entry);
			EventHandler.one(toast.element, EVENT_HIDE_TOAST, () => {
				entry.leaving = true;
				if (!entry.toast.limited) this._collapse(toast.element);
				this._layoutStack();
				execute(entry.toast.onClose, [void 0, entry.toast]);
			});
			EventHandler.one(toast.element, EVENT_HIDDEN_TOAST, () => this._remove(entry));
			EventHandler.on(toast.element, EVENT_CLICK$1, SELECTOR_ACTION, (event) => {
				execute(entry.toast.action?.onClick, [
					void 0,
					event,
					entry.toast
				]);
			});
			const layout = this._layout();
			if (this._config.placement.startsWith("top")) this._element.prepend(toast.element);
			else this._element.append(toast.element);
			instance.show();
			this._settle(layout);
			this._applyLimit();
			this._announce(toast);
			this._resizeObserver?.observe(toast.element);
			this._layoutStack();
			EventHandler.trigger(this._element, EVENT_ADD, { id: toast.id });
			return toast.id;
		}
		update(id, options) {
			const entry = this._entries.get(id);
			if (!entry) return;
			const previous = entry.toast;
			const next = {
				...previous,
				...execute(options, [void 0, previous]),
				element: previous.element,
				id: previous.id,
				limited: previous.limited,
				updateKey: previous.updateKey + 1
			};
			this._typeCheckConfig(next, ToastDefaultType);
			const rendered = this._render(next);
			const shown = previous.element.classList.contains(CLASS_NAME_SHOW);
			previous.element.className = rendered.className;
			previous.element.classList.toggle(CLASS_NAME_SHOW, shown);
			previous.element.replaceChildren(...rendered.children);
			previous.element.setAttribute(ATTRIBUTE_UPDATE_KEY, rendered.getAttribute(ATTRIBUTE_UPDATE_KEY));
			if (next.timeout !== previous.timeout) {
				const timeout = next.timeout ?? this._config.timeout;
				const config = entry.instance._config;
				config.autohide = timeout > 0;
				config.delay = timeout;
				entry.instance._clearTimeout();
				entry.instance._maybeScheduleHide();
			}
			entry.toast = next;
			this._layoutStack();
			this._announce(next);
		}
		close(id) {
			const entries = id ? [this._entries.get(id)].filter(Boolean) : [...this._entries.values()];
			for (const entry of entries) entry.instance.hide();
		}
		promise(promise, options) {
			const id = this.add({
				...this._promiseState(options.loading),
				timeout: 0
			});
			promise.then((value) => this._settlePromise(id, "success", options.success, value), (error) => this._settlePromise(id, "danger", options.error, error));
			return promise;
		}
		pause() {
			for (const entry of this._entries.values()) entry.instance._clearTimeout();
		}
		resume() {
			if (this._config.stack) {
				this._layoutStack();
				return;
			}
			for (const entry of this._entries.values()) if (!entry.toast.limited && entry.instance.isShown()) entry.instance._maybeScheduleHide();
		}
		getToasts() {
			return [...this._entries.values()].map((entry) => entry.toast);
		}
		dispose() {
			for (const entry of this._entries.values()) {
				EventHandler.off(entry.toast.element, EVENT_KEY$1);
				entry.instance.dispose();
				entry.toast.element.remove();
			}
			this._entries.clear();
			this._resizeObserver?.disconnect();
			if (this._ownsContainer) this._element.remove();
			super.dispose();
		}
		_render(toast) {
			const wrapper = document.createElement("div");
			wrapper.innerHTML = TEMPLATE;
			const element = wrapper.firstElementChild;
			this._setContent(element, SELECTOR_TITLE, toast.title);
			this._setContent(element, SELECTOR_DESCRIPTION, toast.description);
			this._setContent(element, SELECTOR_ACTION, toast.action?.label);
			const header = element.querySelector(SELECTOR_HEADER);
			const body = element.querySelector(".toast-body");
			if (toast.title) body.querySelector(SELECTOR_CLOSE).remove();
			else header.remove();
			for (const close of element.querySelectorAll(SELECTOR_CLOSE)) if (toast.dismissible) close.setAttribute("aria-label", this._config.ariaCloseLabel);
			else close.remove();
			body.classList.toggle(CLASS_NAME_ROW, body.querySelector(`${SELECTOR_ACTION}, ${SELECTOR_CLOSE}`) !== null);
			if (toast.theme) element.classList.add(`theme-${toast.theme}`);
			if (toast.instant) element.classList.add(CLASS_NAME_INSTANT);
			if (toast.translucent) element.classList.add(CLASS_NAME_TRANSLUCENT);
			if (toast.class) element.classList.add(...toast.class.split(/\s+/).filter(Boolean));
			element.setAttribute(ATTRIBUTE_UPDATE_KEY, String(toast.updateKey));
			return element;
		}
		_setContent(element, selector, content) {
			const target = element.querySelector(selector);
			const resolved = execute(content, [void 0, this]);
			if (!resolved) {
				target.remove();
				return;
			}
			if (isElement(resolved)) {
				target.replaceChildren(resolved);
				return;
			}
			if (this._config.html) {
				target.innerHTML = sanitizeByConfig(resolved, this._config);
				return;
			}
			target.textContent = resolved;
		}
		_remove(entry, release = true) {
			if (this._entries?.get(entry.toast.id) !== entry) return;
			this._entries.delete(entry.toast.id);
			EventHandler.off(entry.toast.element, EVENT_KEY$1);
			this._announcements.get(entry.toast.element)?.();
			this._announcements.delete(entry.toast.element);
			queueMicrotask(() => entry.instance.dispose());
			this._resizeObserver?.unobserve(entry.toast.element);
			const layout = this._layout();
			entry.toast.element.remove();
			this._settle(layout);
			this._layoutStack();
			execute(entry.toast.onRemove, [void 0, entry.toast]);
			if (release) this._applyLimit();
			EventHandler.trigger(this._element, EVENT_REMOVE, { id: entry.toast.id });
		}
		_applyLimit() {
			const entries = [...this._entries.values()];
			const overflow = this._config.limit > 0 ? Math.max(0, entries.length - this._config.limit) : 0;
			const layout = this._layout();
			let unlimited = false;
			for (const [index, entry] of entries.entries()) {
				const limited = index < overflow;
				if (entry.leaving || limited === entry.toast.limited) continue;
				entry.toast.limited = limited;
				entry.toast.element.inert = limited;
				if (limited) {
					entry.instance._clearTimeout();
					this._collapse(entry.toast.element);
					entry.toast.element.toggleAttribute(ATTRIBUTE_LIMITED, true);
					setTimeout(() => {
						if (entry.toast.limited) {
							const layout = this._layout();
							entry.toast.element.style.display = "none";
							this._settle(layout);
						}
					}, getTransitionDurationFromElement(entry.toast.element));
				} else {
					const { element } = entry.toast;
					element.style.translate = getComputedStyle(element).translate;
					element.style.display = "";
					element.toggleAttribute(ATTRIBUTE_LIMITED, false);
					element.getBoundingClientRect();
					requestAnimationFrame(() => {
						element.style.translate = "";
					});
					entry.instance._maybeScheduleHide();
					unlimited = true;
				}
			}
			if (unlimited) this._settle(layout);
			this._layoutStack();
		}
		_layoutStack() {
			if (!this._config.stack || !this._element) return;
			const entries = [...this._entries.values()];
			const ordered = entries.filter((entry) => !entry.toast.limited && !entry.leaving).map((entry) => entry.toast.element).toReversed();
			let before = 0;
			for (const entry of entries.filter((entry) => entry.toast.limited)) {
				entry.toast.element.removeAttribute(ATTRIBUTE_STACK_INDEX);
				entry.toast.element.removeAttribute(ATTRIBUTE_STACK_HIDDEN);
			}
			for (const [index, element] of ordered.entries()) {
				const height = this._naturalHeight(element);
				const instance = Toast.getInstance(element);
				instance._config.autohide = index === 0 && instance._config.delay > 0;
				if (instance._config.autohide) {
					if (instance._timeout === null) instance._maybeScheduleHide();
				} else instance._clearTimeout();
				element.setAttribute(ATTRIBUTE_STACK_INDEX, String(index));
				element.toggleAttribute(ATTRIBUTE_STACK_HIDDEN, index >= STACK_VISIBLE);
				element.style.setProperty(PROPERTY_STACK_INDEX, String(index));
				element.style.setProperty(PROPERTY_STACK_BEFORE, `${before}px`);
				element.style.setProperty(PROPERTY_TOAST_HEIGHT, `${height}px`);
				before += height;
			}
			this._element.style.setProperty(PROPERTY_STACK_COUNT, String(ordered.length));
			this._element.style.setProperty(PROPERTY_STACK_FRONT_HEIGHT, `${ordered.length > 0 ? this._naturalHeight(ordered[0]) : 0}px`);
			this._element.style.setProperty(PROPERTY_STACK_HEIGHTS, `${before}px`);
		}
		_announce(toast) {
			const text = [toast.title, toast.description].map((part) => execute(part, [void 0, this])).map((part) => isElement(part) ? part.textContent : part).filter(Boolean).join(". ");
			this._announcements.get(toast.element)?.();
			this._announcements.delete(toast.element);
			if (text) this._announcements.set(toast.element, announce(text, {
				context: this._element,
				priority: toast.priority
			}));
		}
		_onLeave(event) {
			const next = event.relatedTarget;
			if (next && this._element.contains(next)) return;
			this.resume();
		}
		_cancelGlide(element) {
			for (const animation of element.getAnimations()) if (animation.id === GLIDE_ID) animation.cancel();
		}
		_isSettled(element) {
			return element.classList.contains(CLASS_NAME_SHOW) && !element.hasAttribute(ATTRIBUTE_LIMITED) && element.getClientRects().length > 0;
		}
		_naturalHeight(element) {
			return [...element.children].reduce((sum, child) => sum + child.offsetHeight, 0) + element.offsetHeight - element.clientHeight;
		}
		_layout() {
			if (!this._element || this._config.stack || this._prefersReducedMotion()) return null;
			const layout = /* @__PURE__ */ new Map();
			for (const child of this._element.querySelectorAll(":scope > .toast")) if (child.getClientRects().length > 0) layout.set(child, child.getBoundingClientRect().top);
			return layout;
		}
		_collapse(element) {
			element.style.display = "block";
			if (!this._element || this._config.stack || this._prefersReducedMotion()) return;
			const siblings = [...this._element.querySelectorAll(":scope > .toast")].filter((child) => child !== element && this._isSettled(child));
			const visual = siblings.map((child) => child.getBoundingClientRect().top);
			for (const child of siblings) this._cancelGlide(child);
			const layout = siblings.map((child) => child.getBoundingClientRect().top);
			const { transition } = element.style;
			element.style.transition = "none";
			element.style.display = "none";
			const target = siblings.map((child) => child.getBoundingClientRect().top);
			element.style.display = "block";
			element.getBoundingClientRect();
			element.style.transition = transition;
			const duration = getTransitionDurationFromElement(element);
			if (duration === 0) return;
			for (const [index, child] of siblings.entries()) {
				const from = visual[index] - layout[index];
				const to = target[index] - layout[index];
				if (from !== to) child.animate([{ transform: `translateY(${from}px)` }, { transform: `translateY(${to}px)` }], {
					duration,
					easing: "ease-out",
					fill: "forwards",
					id: GLIDE_ID
				});
			}
		}
		_settle(layout) {
			if (!layout || !this._element) return;
			for (const child of this._element.querySelectorAll(":scope > .toast")) {
				const previous = layout.get(child);
				if (previous === void 0) continue;
				this._cancelGlide(child);
				const delta = previous - child.getBoundingClientRect().top;
				const duration = getTransitionDurationFromElement(child);
				if (delta !== 0 && duration > 0) child.animate([{ transform: `translateY(${delta}px)` }, { transform: "none" }], {
					duration,
					easing: "ease-out",
					id: GLIDE_ID
				});
			}
		}
		_prefersReducedMotion() {
			return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		}
		_settlePromise(id, theme, state, value) {
			if (!this._element) return;
			this.update(id, {
				theme,
				timeout: this._config.timeout,
				...this._promiseState(state, value)
			});
		}
		_promiseState(state, value) {
			const resolved = execute(state, [void 0, value]);
			return typeof resolved === "object" && resolved !== null && !(resolved instanceof Element) ? resolved : { description: resolved };
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, Toaster, config, args);
		}
	};
	defineJQueryPlugin(Toaster);
	//#endregion
	//#region js/src/transfer.ts
	const NAME = "transfer";
	const EVENT_KEY = `.coreui.transfer`;
	const DATA_API_KEY = ".data-api";
	const EVENT_CHANGE = "change";
	const EVENT_MOVE = "move";
	const EVENT_MOVED = "moved";
	const EVENT_SEARCH = "search";
	const EVENT_CLICK = "click";
	const EVENT_INPUT = "input";
	const EVENT_LIST_BOX_CHANGE = "change.coreui.list-box";
	const EVENT_LIST_BOX_SEARCH = "search.coreui.list-box";
	const CLASS_NAME_DISABLED = "disabled";
	const CLASS_NAME_OPTIONS = "list-box-options";
	const SELECTOR_DATA_TRANSFER = "[data-coreui-transfer]";
	const SELECTOR_LIST = "[data-coreui-transfer-list]";
	const SELECTOR_MOVE = "[data-coreui-transfer-move]";
	const SELECTOR_OPTION = ".list-box-option";
	const SELECTOR_OPTIONS = ".list-box-options";
	const SELECTOR_SEARCH = "[data-coreui-list-box-search]";
	const SELECTOR_SELECT_ALL = "[data-coreui-select-all]";
	const SIDE_SOURCE = "source";
	const SIDE_TARGET = "target";
	const SUFFIX_ALL = "-all";
	const MOVE_KINDS = /* @__PURE__ */ new Set([
		SIDE_SOURCE,
		SIDE_TARGET,
		`${SIDE_SOURCE}${SUFFIX_ALL}`,
		`${SIDE_TARGET}${SUFFIX_ALL}`
	]);
	const Default = {
		allowList: SVGAllowlist,
		ariaMoveAllToSourceLabel: "Move all to available",
		ariaMoveAllToTargetLabel: "Move all to chosen",
		ariaMoveToSourceLabel: "Move to available",
		ariaMoveToTargetLabel: "Move to chosen",
		ariaMovedAnnouncement: "{count} moved to {title}",
		disabled: false,
		html: false,
		indicator: "checkbox",
		items: [],
		loading: false,
		loadingLabel: "Loading…",
		moveAllToSourceIcon: CHEVRON_DOUBLE_LEFT_ICON,
		moveAllToTargetIcon: CHEVRON_DOUBLE_RIGHT_ICON,
		moveToSourceIcon: CHEVRON_LEFT_ICON,
		moveToTargetIcon: CHEVRON_RIGHT_ICON,
		oneWay: false,
		sanitize: true,
		sanitizeFn: null,
		search: false,
		searchPlaceholder: "Search",
		selectedLabel: (count, total) => `${count}/${total} selected`,
		sourceTitle: "Available",
		targetTitle: "Chosen",
		typeahead: true,
		value: []
	};
	const DefaultType = {
		allowList: "object",
		ariaMoveAllToSourceLabel: "string",
		ariaMoveAllToTargetLabel: "string",
		ariaMoveToSourceLabel: "string",
		ariaMoveToTargetLabel: "string",
		ariaMovedAnnouncement: "string",
		disabled: "boolean",
		html: "boolean",
		indicator: "string",
		items: "array",
		loading: "boolean",
		loadingLabel: "string",
		moveAllToSourceIcon: "string",
		moveAllToTargetIcon: "string",
		moveToSourceIcon: "string",
		moveToTargetIcon: "string",
		oneWay: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		search: "(boolean|string)",
		searchPlaceholder: "string",
		selectedLabel: "(string|function)",
		sourceTitle: "string",
		targetTitle: "string",
		typeahead: "boolean",
		value: "array"
	};
	var Transfer = class Transfer extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._createdNodes = [];
			this._itemRanks = /* @__PURE__ */ new Map();
			this._items = this._config.items.length > 0 ? this._config.items : null;
			this._sides = {
				[SIDE_SOURCE]: this._createSide(SIDE_SOURCE),
				[SIDE_TARGET]: this._createSide(SIDE_TARGET)
			};
			this._onListBoxChange = () => this._refresh();
			this._onListBoxSearch = (event) => this._reportSearch(event);
			this._order = /* @__PURE__ */ new WeakMap();
			this._ranks = 0;
			this._rendered = false;
			if (this._items) this._applyItems(this._config.value);
			this._addEventListeners();
			this.update();
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
		moveToTarget(values) {
			this._moveValues(SIDE_TARGET, values);
		}
		moveToSource(values) {
			this._moveValues(SIDE_SOURCE, values);
		}
		moveAllToTarget() {
			this._moveValues(SIDE_TARGET, this._movableValues(this._sides[SIDE_SOURCE]));
		}
		moveAllToSource() {
			this._moveValues(SIDE_SOURCE, this._movableValues(this._sides[SIDE_TARGET]));
		}
		getSource() {
			return this._values(this._sides[SIDE_SOURCE]);
		}
		getTarget() {
			return this._values(this._sides[SIDE_TARGET]);
		}
		getSelectedValues(side) {
			if (!(side in this._sides)) throw new TypeError(`${NAME.toUpperCase()}: Method "getSelectedValues" expects one of ${Object.keys(this._sides).join(", ")}, but received "${side}".`);
			return this._sides[side].listBox.getSelectedValues();
		}
		setItems(items) {
			this._items = Array.isArray(items) ? items : [];
			this._applyItems(this.getTarget());
			this.update();
		}
		getItems() {
			return this._items ?? [];
		}
		setLoading(loading, side) {
			if (side === void 0) this._config.loading = loading;
			for (const [name, entry] of Object.entries(this._sides)) if (side === void 0 || side === name) entry.listBox.setLoading(loading);
		}
		update() {
			this._rankOptions();
			for (const side of Object.values(this._sides)) {
				this._decorateSide(side);
				side.listBox.update();
			}
			this._decorateMoveButtons();
			this._refresh();
		}
		dispose() {
			this._element.removeEventListener(EVENT_LIST_BOX_CHANGE, this._onListBoxChange);
			this._element.removeEventListener(EVENT_LIST_BOX_SEARCH, this._onListBoxSearch);
			EventHandler.off(this._element, EVENT_KEY);
			for (const side of Object.values(this._sides)) side.listBox.dispose();
			for (const node of this._createdNodes) node.remove();
			super.dispose();
		}
		_createSide(name) {
			const element = SelectorEngine.findOne(`[data-coreui-transfer-list="${name}"]`, this._element);
			if (!element) throw new TypeError(`Transfer requires a [data-coreui-transfer-list="${name}"] element`);
			const title = name === SIDE_SOURCE ? this._config.sourceTitle : this._config.targetTitle;
			const options = this._resolveOptions(element);
			return {
				element,
				listBox: ListBox.getOrCreateInstance(element, {
					allowList: this._config.allowList,
					ariaSearchLabel: `${this._config.searchPlaceholder} ${title}`,
					counter: true,
					disabled: this._config.disabled,
					html: this._config.html,
					indicator: this._config.indicator,
					loading: this._config.loading,
					loadingLabel: this._config.loadingLabel,
					resetSelectionOnItemsChange: true,
					sanitize: this._config.sanitize,
					sanitizeFn: this._config.sanitizeFn,
					search: this._config.search,
					searchPlaceholder: this._config.searchPlaceholder,
					selectedLabel: this._config.selectedLabel,
					selectionMode: "multiple",
					typeahead: this._config.typeahead
				}),
				name,
				options,
				selectAll: SelectorEngine.findOne(SELECTOR_SELECT_ALL, element),
				title
			};
		}
		_resolveOptions(element) {
			const existing = SelectorEngine.findOne(SELECTOR_OPTIONS, element);
			if (existing) return existing;
			if (!this._items) return element;
			const options = document.createElement("div");
			options.classList.add(CLASS_NAME_OPTIONS);
			element.append(options);
			this._createdNodes.push(options);
			return options;
		}
		_decorateSide(side) {
			if (!side.options.id) side.options.id = getUID(`${NAME}-options-`);
			if (!side.options.hasAttribute("aria-label") && !side.options.hasAttribute("aria-labelledby")) side.options.setAttribute("aria-label", side.title);
			if (side.selectAll && side.selectAll.textContent?.trim() === "") side.selectAll.textContent = side.title;
		}
		_decorateMoveButtons() {
			for (const button of this._moveButtons()) {
				const kind = this._moveKind(button);
				const side = this._moveSide(kind);
				if (!button.hasAttribute("aria-label")) button.setAttribute("aria-label", this._moveLabel(kind));
				if (button.innerHTML.trim() === "") button.innerHTML = sanitizeByConfig(this._moveIcon(kind), this._config);
				button.setAttribute("aria-controls", this._sides[side].options.id);
				if (side === SIDE_SOURCE) button.toggleAttribute("hidden", this._config.oneWay);
			}
		}
		_moveKind(button) {
			const kind = button.dataset.coreuiTransferMove ?? "";
			return MOVE_KINDS.has(kind) ? kind : SIDE_TARGET;
		}
		_moveSide(kind) {
			return kind.startsWith(SIDE_TARGET) ? SIDE_TARGET : SIDE_SOURCE;
		}
		_movesAll(kind) {
			return kind.endsWith(SUFFIX_ALL);
		}
		_moveLabel(kind) {
			if (this._movesAll(kind)) return this._moveSide(kind) === SIDE_TARGET ? this._config.ariaMoveAllToTargetLabel : this._config.ariaMoveAllToSourceLabel;
			return this._moveSide(kind) === SIDE_TARGET ? this._config.ariaMoveToTargetLabel : this._config.ariaMoveToSourceLabel;
		}
		_moveIcon(kind) {
			if (this._movesAll(kind)) return this._moveSide(kind) === SIDE_TARGET ? this._config.moveAllToTargetIcon : this._config.moveAllToSourceIcon;
			return this._moveSide(kind) === SIDE_TARGET ? this._config.moveToTargetIcon : this._config.moveToSourceIcon;
		}
		_moveButtons() {
			return SelectorEngine.find(SELECTOR_MOVE, this._element);
		}
		_options(side) {
			return SelectorEngine.find(SELECTOR_OPTION, side.options);
		}
		_visibleOptions(side) {
			return this._options(side).filter((option) => !option.hasAttribute("hidden"));
		}
		_applyItems(values) {
			const items = this._items ?? [];
			const flat = this._flatItems(items);
			const byValue = new Map(flat.map((item) => [this._itemValue(item), item]));
			this._itemRanks = new Map([...byValue.keys()].map((value, index) => [value, index]));
			const chosen = (Array.isArray(values) ? values : []).filter((value) => byValue.has(value));
			const taken = new Set(chosen);
			this._sides[SIDE_TARGET].listBox.setItems(this._forwardItems(chosen.map((value) => byValue.get(value))));
			this._sides[SIDE_SOURCE].listBox.setItems(this._forwardItems(this._availableItems(items, taken)));
			if (this._rendered) for (const side of Object.values(this._sides)) side.listBox.clear();
			this._rendered = true;
		}
		_forwardItems(entries) {
			return entries.map((entry) => {
				if (Array.isArray(entry.items)) {
					const group = entry;
					return {
						...group,
						items: group.items.map((item) => this._unmarked(item, group.disabled))
					};
				}
				return this._unmarked(entry);
			});
		}
		_unmarked(item, disabled = false) {
			if (!item.selected || !this._rendered && !disabled && !item.disabled) return item;
			const { selected, ...rest } = item;
			return rest;
		}
		_availableItems(items, taken) {
			const available = [];
			for (const entry of items) {
				if (entry === null || typeof entry !== "object") continue;
				if (!Array.isArray(entry.items)) {
					if (!taken.has(this._itemValue(entry))) available.push(entry);
					continue;
				}
				const group = entry;
				const rest = group.items.filter((item) => !taken.has(this._itemValue(item)));
				if (rest.length > 0) available.push({
					...group,
					items: rest
				});
			}
			return available;
		}
		_flatItems(items) {
			return items.filter((entry) => entry !== null && typeof entry === "object").flatMap((entry) => {
				const group = entry;
				if (!Array.isArray(group.items)) return [entry];
				return group.disabled ? group.items.map((item) => ({
					...item,
					disabled: true
				})) : group.items;
			});
		}
		_itemValue(item) {
			return getOptionValue(item);
		}
		_rankOptions() {
			if (this._items) return;
			for (const side of [this._sides[SIDE_SOURCE], this._sides[SIDE_TARGET]]) for (const option of this._options(side)) if (!this._order.has(option)) this._order.set(option, this._ranks++);
		}
		_rankOf(option) {
			if (this._items) return this._itemRanks.get(this._optionValue(option)) ?? Number.MAX_SAFE_INTEGER;
			return this._order.get(option) ?? Number.MAX_SAFE_INTEGER;
		}
		_insertInOriginalOrder(to, options) {
			for (const option of options.toSorted((a, b) => this._rankOf(a) - this._rankOf(b))) {
				const next = this._options(to).find((existing) => this._rankOf(existing) > this._rankOf(option));
				if (next) {
					next.before(option);
					continue;
				}
				to.options.append(option);
			}
		}
		_movableValues(side) {
			return this._visibleOptions(side).filter((option) => !this._isDisabled(option)).map((option) => this._optionValue(option));
		}
		_movableSelection(side) {
			const selected = side.listBox.getSelectedValues();
			return this._options(side).filter((option) => selected.includes(this._optionValue(option)) && !this._isDisabled(option)).map((option) => this._optionValue(option));
		}
		_isDisabled(option) {
			return option.classList.contains(CLASS_NAME_DISABLED) || option.getAttribute("aria-disabled") === "true";
		}
		_values(side) {
			return this._options(side).map((option) => this._optionValue(option));
		}
		_optionValue(option) {
			return option.dataset.coreuiValue ?? option.textContent?.trim() ?? "";
		}
		_sideOf(element) {
			const list = element.closest(SELECTOR_LIST);
			return list ? this._sides[list.dataset.coreuiTransferList] ?? null : null;
		}
		_reportSearch(event) {
			const side = this._sideOf(event.target);
			if (!side) return;
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SEARCH), {
				query: event.query,
				side: side.name
			});
		}
		_refresh() {
			this._refreshMoveButtons();
		}
		_refreshMoveButtons() {
			for (const button of this._moveButtons()) {
				const kind = this._moveKind(button);
				const side = this._moveSide(kind);
				const from = this._sides[side === SIDE_TARGET ? SIDE_SOURCE : SIDE_TARGET];
				const blocked = this._config.disabled || side === SIDE_SOURCE && this._config.oneWay;
				const movable = this._movesAll(kind) ? this._movableValues(from).length : this._movableSelection(from).length;
				button.disabled = blocked || movable === 0;
			}
		}
		_moveValues(side, values) {
			if (this._config.disabled || side === SIDE_SOURCE && this._config.oneWay) return;
			const to = this._sides[side];
			const from = this._sides[side === SIDE_TARGET ? SIDE_SOURCE : SIDE_TARGET];
			const wanted = values ?? from.listBox.getSelectedValues();
			const options = this._options(from).filter((option) => wanted.includes(this._optionValue(option)) && !this._isDisabled(option));
			if (options.length === 0) return;
			const moved = options.map((option) => this._optionValue(option));
			const trigger = document.activeElement;
			if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_MOVE), {
				direction: side,
				values: moved
			}).defaultPrevented) return;
			for (const value of moved) from.listBox.deselect(value);
			if (side === SIDE_TARGET) to.options.append(...options);
			else this._insertInOriginalOrder(to, options);
			to.listBox.clear();
			from.listBox.update();
			to.listBox.update();
			this._refresh();
			this._restoreFocus(trigger, options[0]);
			this._announce(moved.length, to.title);
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_MOVED), {
				direction: side,
				values: moved
			});
			this._triggerChange();
		}
		_restoreFocus(trigger, option) {
			if (!trigger || !trigger.matches(SELECTOR_MOVE) || !trigger.disabled) return;
			option.focus();
		}
		_triggerChange() {
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE), {
				source: this.getSource(),
				value: this.getTarget()
			});
		}
		_announce(count, title) {
			const message = this._config.ariaMovedAnnouncement.replaceAll("{count}", String(count)).replaceAll("{title}", () => title);
			announce(message, { context: this._element });
		}
		_addEventListeners() {
			EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), SELECTOR_MOVE, (event) => {
				const button = event.target.closest(SELECTOR_MOVE);
				if (button) {
					const kind = this._moveKind(button);
					const from = this._sides[this._moveSide(kind) === SIDE_TARGET ? SIDE_SOURCE : SIDE_TARGET];
					this._moveValues(this._moveSide(kind), this._movesAll(kind) ? this._movableValues(from) : void 0);
				}
			});
			EventHandler.on(this._element, this.constructor.eventName(EVENT_INPUT), SELECTOR_SEARCH, (event) => {
				const side = this._sideOf(event.target);
				if (side) {
					side.listBox.update();
					this._refresh();
				}
			});
			this._element.addEventListener(EVENT_LIST_BOX_CHANGE, this._onListBoxChange);
			this._element.addEventListener(EVENT_LIST_BOX_SEARCH, this._onListBoxSearch);
		}
		static jQueryInterface(config, ...args) {
			return jQueryDispatch(this, Transfer, config, args);
		}
	};
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TRANSFER)) Transfer.getOrCreateInstance(element);
	});
	defineJQueryPlugin(Transfer);
	//#endregion
	exports.Accordion = Accordion;
	exports.Alert = Alert;
	exports.Autocomplete = Autocomplete;
	exports.Button = Button;
	exports.Calendar = Calendar;
	exports.Carousel = Carousel;
	exports.Chip = Chip;
	exports.ChipInput = ChipInput;
	exports.ChipSet = ChipSet;
	exports.Collapse = Collapse;
	exports.Combobox = Combobox;
	exports.ContextMenu = ContextMenu;
	exports.DateInput = DateInput;
	exports.DatePicker = DatePicker;
	exports.DateRangeInput = DateRangeInput;
	exports.DateRangePicker = DateRangePicker;
	exports.Dialog = Dialog;
	exports.Drawer = Drawer;
	exports.Dropdown = Dropdown;
	exports.Form = Form;
	exports.ListBox = ListBox;
	exports.LoadingButton = LoadingButton;
	exports.Menu = Menu;
	exports.Modal = Modal;
	exports.MultiSelect = MultiSelect;
	exports.Navigation = Navigation;
	exports.NumberInput = NumberInput;
	exports.OTPInput = OTPInput;
	exports.OffCanvas = Offcanvas;
	exports.Offcanvas = Offcanvas;
	exports.PasswordInput = PasswordInput;
	exports.PasswordStrength = PasswordStrength;
	exports.Popover = Popover;
	exports.Progress = Progress;
	exports.Range = Range;
	exports.RangeSlider = RangeSlider;
	exports.Rating = Rating;
	exports.ScrollSpy = ScrollSpy;
	exports.SearchButton = SearchButton;
	exports.Sidebar = Sidebar;
	exports.Stepper = Stepper;
	exports.Tab = Tab;
	exports.TimeInput = TimeInput;
	exports.TimePicker = TimePicker;
	exports.Toast = Toast;
	exports.Toaster = Toaster;
	exports.Tooltip = Tooltip;
	exports.Transfer = Transfer;
	exports.announce = announce;
});

//# sourceMappingURL=coreui.js.map