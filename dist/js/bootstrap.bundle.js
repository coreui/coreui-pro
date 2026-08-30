/*!
* CoreUI v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define([], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.bootstrap = factory());
})(this, function() {
	//#region js/src/dom/data.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI dom/data.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's dom/data.js
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
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
	/**
	* Properly escape IDs selectors to handle weird IDs
	* @param {string} selector
	* @returns {string}
	*/
	const parseSelector = (selector) => {
		if (selector && window.CSS && window.CSS.escape) selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
		return selector;
	};
	const toType = (object) => {
		if (object === null || object === void 0) return `${object}`;
		return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
	};
	/**
	* Public Util API
	*/
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
	const isElement$1 = (object) => {
		if (!object || typeof object !== "object") return false;
		if (typeof object.jquery !== "undefined") object = object[0];
		return typeof object.nodeType !== "undefined";
	};
	const getElement = (object) => {
		if (isElement$1(object)) return object.jquery ? object[0] : object;
		if (typeof object === "string" && object.length > 0) return document.querySelector(parseSelector(object));
		return null;
	};
	const isVisible = (element) => {
		if (!isElement$1(element) || element.getClientRects().length === 0) return false;
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
	/**
	* Trick to restart an element's animation
	*
	* @param {HTMLElement} element
	* @return void
	*
	* @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
	*/
	const reflow = (element) => {
		element.offsetHeight;
	};
	const getjQuery = () => {
		if (window.jQuery && !document.body.hasAttribute("data-bs-no-jquery")) return window.jQuery;
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
	const isRTL$1 = () => document.documentElement.dir === "rtl";
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
	const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
		return typeof possibleCallback === "function" ? possibleCallback.call(...args) : defaultValue;
	};
	const executeAfterTransition = (callback, transitionElement, waitForTransition = true, transitionProperty) => {
		if (!waitForTransition) {
			execute(callback);
			return;
		}
		const emulatedDuration = getTransitionDurationFromElement(transitionElement) + 5;
		let called = false;
		const handler = (event) => {
			if (event.target !== transitionElement) return;
			const { propertyName } = event;
			if (transitionProperty && propertyName && propertyName !== transitionProperty) return;
			called = true;
			transitionElement.removeEventListener(TRANSITION_END, handler);
			execute(callback);
		};
		transitionElement.addEventListener(TRANSITION_END, handler);
		setTimeout(() => {
			if (!called) triggerTransitionEnd(transitionElement);
		}, emulatedDuration);
	};
	/**
	* Return the previous/next element of a list.
	*
	* @param {array} list    The list of elements
	* @param activeElement   The active element
	* @param shouldGetNext   Choose to get next or previous element
	* @param isCycleAllowed
	* @return {Element|elem} The proper element
	*/
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
	/**
	* --------------------------------------------------------------------------
	* CoreUI dom/event-handler.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's dom/event-handler.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
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
	/**
	* Private methods
	*/
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
			const bsEvent = hydrateObj(event, { delegateTarget: element });
			if (isCustomMouseEvent && isMouseEventWithinTarget(bsEvent)) return;
			if (handler.oneOff) EventHandler.off(element, handlerTypeEvent, fn);
			return fn.apply(element, [bsEvent]);
		};
	}
	function bootstrapDelegationHandler(element, selector, fn, handlerTypeEvent) {
		const isCustomMouseEvent = handlerTypeEvent in customEvents;
		return function handler(event) {
			const domElements = element.querySelectorAll(selector);
			for (let { target } = event; target && target !== this; target = target.parentNode) for (const domElement of domElements) {
				if (domElement !== target) continue;
				const bsEvent = hydrateObj(event, { delegateTarget: target });
				if (isCustomMouseEvent && isMouseEventWithinTarget(bsEvent)) return;
				if (handler.oneOff) EventHandler.off(element, handlerTypeEvent, selector, fn);
				return fn.apply(target, [bsEvent]);
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
	/**
	* --------------------------------------------------------------------------
	* CoreUI dom/manipulator.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's dom/manipulator.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
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
			element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
		},
		removeDataAttribute(element, key) {
			element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
		},
		getDataAttributes(element) {
			if (!element) return {};
			const attributes = {};
			const bsKeys = Object.keys(element.dataset).filter((key) => key.startsWith("bs") && !key.startsWith("bsConfig"));
			for (const key of bsKeys) {
				let pureKey = key.replace(/^bs/, "");
				pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1);
				attributes[pureKey] = normalizeData(element.dataset[key]);
			}
			return attributes;
		},
		getDataAttribute(element, key) {
			return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
		}
	};
	//#endregion
	//#region js/src/util/config.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/config.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/config.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Class definition
	*/
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
			const jsonConfig = isElement$1(element) ? Manipulator.getDataAttribute(element, "config") : {};
			return {
				...this.constructor.Default,
				...typeof jsonConfig === "object" ? jsonConfig : {},
				...isElement$1(element) ? Manipulator.getDataAttributes(element) : {},
				...typeof config === "object" ? config : {}
			};
		}
		_typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
			for (const [property, expectedTypes] of Object.entries(configTypes)) {
				const value = config[property];
				const valueType = isElement$1(value) ? "element" : toType(value);
				if (!new RegExp(expectedTypes).test(valueType)) throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
			}
		}
	};
	//#endregion
	//#region js/src/base-component.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI base-component.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's base-component.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const VERSION = "5.27.0";
	/**
	* Class definition
	*/
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
			return `bs.${this.NAME}`;
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
	/**
	* --------------------------------------------------------------------------
	* CoreUI dom/selector-engine.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's dom/selector-engine.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	const getSelector = (element) => {
		let selector = element.getAttribute("data-bs-target");
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
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/size-transition.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
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
	/**
	* --------------------------------------------------------------------------
	* CoreUI accordion.ts
	* Licensed under MIT (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$44 = "accordion";
	const EVENT_KEY$36 = `.bs.accordion`;
	const DATA_API_KEY$30 = ".data-api";
	const EVENT_SHOWN$11 = `shown${EVENT_KEY$36}`;
	const EVENT_HIDDEN$14 = `hidden${EVENT_KEY$36}`;
	const EVENT_CLICK_DATA_API$18 = `click${EVENT_KEY$36}${DATA_API_KEY$30}`;
	const EVENT_TOGGLE_DATA_API = `toggle${EVENT_KEY$36}${DATA_API_KEY$30}`;
	const ATTRIBUTE_ANIMATING = "data-bs-accordion-animating";
	const ATTRIBUTE_NAME = "data-bs-accordion-name";
	const SELECTOR_ACCORDION = ".accordion";
	const SELECTOR_HEADER = ".accordion-header";
	const SELECTOR_INTERACTIVE = "a, button, input, select, textarea";
	const SELECTOR_ITEM$1 = "details.accordion-item";
	/**
	* Class definition
	*/
	var Accordion = class Accordion extends BaseComponent {
		static get NAME() {
			return NAME$44;
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
			const header = SelectorEngine.findOne(SELECTOR_HEADER, details);
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
			return this.each(function() {
				const data = Accordion.getOrCreateInstance(this);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_TOGGLE_DATA_API, SELECTOR_ITEM$1, function() {
		EventHandler.trigger(this, this.open ? EVENT_SHOWN$11 : EVENT_HIDDEN$14);
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$18, (event) => {
		if (supportsInterpolateSize() || event.defaultPrevented) return;
		const target = event.target;
		const header = target.closest(`${SELECTOR_ITEM$1} > ${SELECTOR_HEADER}`);
		if (!header) return;
		if (target !== header && target.closest(SELECTOR_INTERACTIVE)) return;
		const item = header.parentElement;
		const container = item.closest(SELECTOR_ACCORDION);
		if (!container) return;
		event.preventDefault();
		Accordion.getOrCreateInstance(container).toggle(item);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Accordion);
	//#endregion
	//#region js/src/util/component-functions.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/component-functions.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/component-functions.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	const enableDismissTrigger = (component, method = "hide", closestSelector) => {
		const clickEvent = `click.dismiss${component.EVENT_KEY}`;
		const name = component.NAME;
		EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function(event) {
			if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
			if (isDisabled(this)) return;
			const target = SelectorEngine.getElementFromSelector(this) || this.closest(closestSelector ?? `.${name}`);
			component.getOrCreateInstance(target)[method]();
		});
	};
	//#endregion
	//#region js/src/alert.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI alert.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's alert.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$43 = "alert";
	const EVENT_KEY$35 = `.bs.alert`;
	const EVENT_CLOSE = `close${EVENT_KEY$35}`;
	const EVENT_CLOSED = `closed${EVENT_KEY$35}`;
	const CLASS_NAME_HIDING$1 = "hiding";
	const CLASS_NAME_SHOW$16 = "show";
	/**
	* Class definition
	*/
	var Alert = class Alert extends BaseComponent {
		static get NAME() {
			return NAME$43;
		}
		async close() {
			if (EventHandler.trigger(this._element, EVENT_CLOSE).defaultPrevented) return;
			this._element.classList.remove(CLASS_NAME_SHOW$16);
			this._element.classList.add(CLASS_NAME_HIDING$1);
			const isAnimated = getTransitionDurationFromElement(this._element) > 0;
			await this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
		}
		_destroyElement() {
			this._element.remove();
			EventHandler.trigger(this._element, EVENT_CLOSED);
			this.dispose();
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Alert.getOrCreateInstance(this);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config](this);
			});
		}
	};
	/**
	* Data API implementation
	*/
	enableDismissTrigger(Alert, "close");
	/**
	* jQuery
	*/
	defineJQueryPlugin(Alert);
	//#endregion
	//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
	const min = Math.min;
	const max = Math.max;
	const round = Math.round;
	const floor = Math.floor;
	const createCoords = (v) => ({
		x: v,
		y: v
	});
	const oppositeSideMap = {
		left: "right",
		right: "left",
		bottom: "top",
		top: "bottom"
	};
	function clamp(start, value, end) {
		return max(start, min(value, end));
	}
	function evaluate(value, param) {
		return typeof value === "function" ? value(param) : value;
	}
	function getSide(placement) {
		return placement.split("-")[0];
	}
	function getAlignment(placement) {
		return placement.split("-")[1];
	}
	function getOppositeAxis(axis) {
		return axis === "x" ? "y" : "x";
	}
	function getAxisLength(axis) {
		return axis === "y" ? "height" : "width";
	}
	function getSideAxis(placement) {
		const firstChar = placement[0];
		return firstChar === "t" || firstChar === "b" ? "y" : "x";
	}
	function getAlignmentAxis(placement) {
		return getOppositeAxis(getSideAxis(placement));
	}
	function getAlignmentSides(placement, rects, rtl) {
		if (rtl === void 0) rtl = false;
		const alignment = getAlignment(placement);
		const alignmentAxis = getAlignmentAxis(placement);
		const length = getAxisLength(alignmentAxis);
		let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
		if (rects.reference[length] > rects.floating[length]) mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
		return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
	}
	function getExpandedPlacements(placement) {
		const oppositePlacement = getOppositePlacement(placement);
		return [
			getOppositeAlignmentPlacement(placement),
			oppositePlacement,
			getOppositeAlignmentPlacement(oppositePlacement)
		];
	}
	function getOppositeAlignmentPlacement(placement) {
		return placement.includes("start") ? placement.replace("start", "end") : placement.replace("end", "start");
	}
	const lrPlacement = ["left", "right"];
	const rlPlacement = ["right", "left"];
	const tbPlacement = ["top", "bottom"];
	const btPlacement = ["bottom", "top"];
	function getSideList(side, isStart, rtl) {
		switch (side) {
			case "top":
			case "bottom":
				if (rtl) return isStart ? rlPlacement : lrPlacement;
				return isStart ? lrPlacement : rlPlacement;
			case "left":
			case "right": return isStart ? tbPlacement : btPlacement;
			default: return [];
		}
	}
	function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
		const alignment = getAlignment(placement);
		let list = getSideList(getSide(placement), direction === "start", rtl);
		if (alignment) {
			list = list.map((side) => side + "-" + alignment);
			if (flipAlignment) list = list.concat(list.map(getOppositeAlignmentPlacement));
		}
		return list;
	}
	function getOppositePlacement(placement) {
		const side = getSide(placement);
		return oppositeSideMap[side] + placement.slice(side.length);
	}
	function expandPaddingObject(padding) {
		var _padding$top, _padding$right, _padding$bottom, _padding$left;
		return {
			top: (_padding$top = padding.top) != null ? _padding$top : 0,
			right: (_padding$right = padding.right) != null ? _padding$right : 0,
			bottom: (_padding$bottom = padding.bottom) != null ? _padding$bottom : 0,
			left: (_padding$left = padding.left) != null ? _padding$left : 0
		};
	}
	function getPaddingObject(padding) {
		return typeof padding !== "number" ? expandPaddingObject(padding) : {
			top: padding,
			right: padding,
			bottom: padding,
			left: padding
		};
	}
	function rectToClientRect(rect) {
		const { x, y, width, height } = rect;
		return {
			width,
			height,
			top: y,
			left: x,
			right: x + width,
			bottom: y + height,
			x,
			y
		};
	}
	//#endregion
	//#region node_modules/@floating-ui/core/dist/floating-ui.core.mjs
	function computeCoordsFromPlacement(_ref, placement, rtl) {
		let { reference, floating } = _ref;
		const sideAxis = getSideAxis(placement);
		const alignmentAxis = getAlignmentAxis(placement);
		const alignLength = getAxisLength(alignmentAxis);
		const side = getSide(placement);
		const isVertical = sideAxis === "y";
		const commonX = reference.x + reference.width / 2 - floating.width / 2;
		const commonY = reference.y + reference.height / 2 - floating.height / 2;
		const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
		let coords;
		switch (side) {
			case "top":
				coords = {
					x: commonX,
					y: reference.y - floating.height
				};
				break;
			case "bottom":
				coords = {
					x: commonX,
					y: reference.y + reference.height
				};
				break;
			case "right":
				coords = {
					x: reference.x + reference.width,
					y: commonY
				};
				break;
			case "left":
				coords = {
					x: reference.x - floating.width,
					y: commonY
				};
				break;
			default: coords = {
				x: reference.x,
				y: reference.y
			};
		}
		const alignment = getAlignment(placement);
		if (alignment) coords[alignmentAxis] += commonAlign * (alignment === "end" ? 1 : -1) * (rtl && isVertical ? -1 : 1);
		return coords;
	}
	/**
	* Resolves with an object of overflow side offsets that determine how much the
	* element is overflowing a given clipping boundary on each side.
	* - positive = overflowing the boundary by that number of pixels
	* - negative = how many pixels left before it will overflow
	* - 0 = lies flush with the boundary
	* @see https://floating-ui.com/docs/detectOverflow
	*/
	async function detectOverflow(state, options) {
		var _await$platform$isEle;
		if (options === void 0) options = {};
		const { x, y, platform, rects, elements, strategy } = state;
		const { boundary = "clippingAncestors", rootBoundary = "viewport", elementContext = "floating", altBoundary = false, padding = 0 } = evaluate(options, state);
		const paddingObject = getPaddingObject(padding);
		const element = elements[altBoundary ? elementContext === "floating" ? "reference" : "floating" : elementContext];
		const clippingClientRect = rectToClientRect(await platform.getClippingRect({
			element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating)),
			boundary,
			rootBoundary,
			strategy
		}));
		const rect = elementContext === "floating" ? {
			x,
			y,
			width: rects.floating.width,
			height: rects.floating.height
		} : rects.reference;
		const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
		const offsetScale = await (platform.isElement == null ? void 0 : platform.isElement(offsetParent)) && await (platform.getScale == null ? void 0 : platform.getScale(offsetParent)) || {
			x: 1,
			y: 1
		};
		const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
			elements,
			rect,
			offsetParent,
			strategy
		}) : rect);
		return {
			top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
			bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
			left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
			right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
		};
	}
	const MAX_RESET_COUNT = 50;
	/**
	* Computes the `x` and `y` coordinates that will place the floating element
	* next to a given reference element.
	*
	* This export does not have any `platform` interface logic. You will need to
	* write one for the platform you are using Floating UI with.
	*/
	const computePosition$1 = async (reference, floating, config) => {
		const { placement = "bottom", strategy = "absolute", middleware = [], platform } = config;
		const platformWithDetectOverflow = platform.detectOverflow ? platform : {
			...platform,
			detectOverflow
		};
		const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
		let rects = await platform.getElementRects({
			reference,
			floating,
			strategy
		});
		let { x, y } = computeCoordsFromPlacement(rects, placement, rtl);
		let statefulPlacement = placement;
		let resetCount = 0;
		const middlewareData = {};
		for (let i = 0; i < middleware.length; i++) {
			const currentMiddleware = middleware[i];
			if (!currentMiddleware) continue;
			const { name, fn } = currentMiddleware;
			const { x: nextX, y: nextY, data, reset } = await fn({
				x,
				y,
				initialPlacement: placement,
				placement: statefulPlacement,
				strategy,
				middlewareData,
				rects,
				platform: platformWithDetectOverflow,
				elements: {
					reference,
					floating
				}
			});
			x = nextX != null ? nextX : x;
			y = nextY != null ? nextY : y;
			middlewareData[name] = {
				...middlewareData[name],
				...data
			};
			if (reset && resetCount < MAX_RESET_COUNT) {
				resetCount++;
				if (typeof reset === "object") {
					if (reset.placement) statefulPlacement = reset.placement;
					if (reset.rects) rects = reset.rects === true ? await platform.getElementRects({
						reference,
						floating,
						strategy
					}) : reset.rects;
					({x, y} = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
				}
				i = -1;
			}
		}
		return {
			x,
			y,
			placement: statefulPlacement,
			strategy,
			middlewareData
		};
	};
	/**
	* Provides data to position an inner element of the floating element so that it
	* appears centered to the reference element.
	* @see https://floating-ui.com/docs/arrow
	*/
	const arrow$1 = (options) => ({
		name: "arrow",
		options,
		async fn(state) {
			const { x, y, placement, rects, platform, elements, middlewareData } = state;
			const { element, padding = 0 } = evaluate(options, state) || {};
			if (element == null) return {};
			const paddingObject = getPaddingObject(padding);
			const coords = {
				x,
				y
			};
			const axis = getAlignmentAxis(placement);
			const length = getAxisLength(axis);
			const arrowDimensions = await platform.getDimensions(element);
			const isYAxis = axis === "y";
			const minProp = isYAxis ? "top" : "left";
			const maxProp = isYAxis ? "bottom" : "right";
			const clientProp = isYAxis ? "clientHeight" : "clientWidth";
			const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
			const startDiff = coords[axis] - rects.reference[axis];
			const arrowOffsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(element));
			let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
			if (!clientSize || !await (platform.isElement == null ? void 0 : platform.isElement(arrowOffsetParent))) clientSize = elements.floating[clientProp] || rects.floating[length];
			const centerToReference = endDiff / 2 - startDiff / 2;
			const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
			const minPadding = min(paddingObject[minProp], largestPossiblePadding);
			const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
			const max = clientSize - arrowDimensions[length] - maxPadding;
			const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
			const offset = clamp(minPadding, center, max);
			const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset && rects.reference[length] / 2 - (center < minPadding ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
			const alignmentOffset = shouldAddOffset ? center < minPadding ? center - minPadding : center - max : 0;
			return {
				[axis]: coords[axis] + alignmentOffset,
				data: {
					[axis]: offset,
					centerOffset: center - offset - alignmentOffset,
					...shouldAddOffset && { alignmentOffset }
				},
				reset: shouldAddOffset
			};
		}
	});
	/**
	* Optimizes the visibility of the floating element by flipping the `placement`
	* in order to keep it in view when the preferred placement(s) will overflow the
	* clipping boundary. Alternative to `autoPlacement`.
	* @see https://floating-ui.com/docs/flip
	*/
	const flip$1 = function(options) {
		if (options === void 0) options = {};
		return {
			name: "flip",
			options,
			async fn(state) {
				var _middlewareData$arrow, _middlewareData$flip;
				const { placement, middlewareData, rects, initialPlacement, platform, elements } = state;
				const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = true, fallbackPlacements: specifiedFallbackPlacements, fallbackStrategy = "bestFit", fallbackAxisSideDirection = "none", flipAlignment = true, ...detectOverflowOptions } = evaluate(options, state);
				if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) return {};
				const side = getSide(placement);
				const initialSideAxis = getSideAxis(initialPlacement);
				const isBasePlacement = getSide(initialPlacement) === initialPlacement;
				const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
				const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
				const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
				if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
				const placements = [initialPlacement, ...fallbackPlacements];
				const overflow = await platform.detectOverflow(state, detectOverflowOptions);
				const overflows = [];
				let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
				if (checkMainAxis) overflows.push(overflow[side]);
				if (checkCrossAxis) {
					const sides = getAlignmentSides(placement, rects, rtl);
					overflows.push(overflow[sides[0]], overflow[sides[1]]);
				}
				overflowsData = [...overflowsData, {
					placement,
					overflows
				}];
				if (!overflows.every((side) => side <= 0)) {
					var _middlewareData$flip2, _overflowsData$filter;
					const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
					const nextPlacement = placements[nextIndex];
					if (nextPlacement) {
						if (!(checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false) || overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) return {
							data: {
								index: nextIndex,
								overflows: overflowsData
							},
							reset: { placement: nextPlacement }
						};
					}
					let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
					if (!resetPlacement) switch (fallbackStrategy) {
						case "bestFit": {
							var _overflowsData$filter2;
							const placement = (_overflowsData$filter2 = overflowsData.filter((d) => {
								if (hasFallbackAxisSideDirection) {
									const currentSideAxis = getSideAxis(d.placement);
									return currentSideAxis === initialSideAxis || currentSideAxis === "y";
								}
								return true;
							}).map((d) => [d.placement, d.overflows.filter((overflow) => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
							if (placement) resetPlacement = placement;
							break;
						}
						case "initialPlacement": resetPlacement = initialPlacement;
					}
					if (placement !== resetPlacement) return { reset: { placement: resetPlacement } };
				}
				return {};
			}
		};
	};
	const originSides = /*#__PURE__*/ new Set(["left", "top"]);
	async function convertValueToCoords(state, options) {
		const { placement, platform, elements } = state;
		const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
		const side = getSide(placement);
		const alignment = getAlignment(placement);
		const isVertical = getSideAxis(placement) === "y";
		const mainAxisMulti = originSides.has(side) ? -1 : 1;
		const crossAxisMulti = rtl && isVertical ? -1 : 1;
		const rawValue = evaluate(options, state);
		let { mainAxis, crossAxis, alignmentAxis } = typeof rawValue === "number" ? {
			mainAxis: rawValue,
			crossAxis: 0,
			alignmentAxis: null
		} : {
			mainAxis: rawValue.mainAxis || 0,
			crossAxis: rawValue.crossAxis || 0,
			alignmentAxis: rawValue.alignmentAxis
		};
		if (alignment && typeof alignmentAxis === "number") crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
		return isVertical ? {
			x: crossAxis * crossAxisMulti,
			y: mainAxis * mainAxisMulti
		} : {
			x: mainAxis * mainAxisMulti,
			y: crossAxis * crossAxisMulti
		};
	}
	/**
	* Modifies the placement by translating the floating element along the
	* specified axes.
	* A number (shorthand for `mainAxis` or distance), or an axes configuration
	* object may be passed.
	* @see https://floating-ui.com/docs/offset
	*/
	const offset$1 = function(options) {
		if (options === void 0) options = 0;
		return {
			name: "offset",
			options,
			async fn(state) {
				var _middlewareData$offse, _middlewareData$arrow;
				const { x, y, placement, middlewareData } = state;
				const diffCoords = await convertValueToCoords(state, options);
				if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) return {};
				return {
					x: x + diffCoords.x,
					y: y + diffCoords.y,
					data: {
						...diffCoords,
						placement
					}
				};
			}
		};
	};
	/**
	* Optimizes the visibility of the floating element by shifting it in order to
	* keep it in view when it will overflow the clipping boundary.
	* @see https://floating-ui.com/docs/shift
	*/
	const shift$1 = function(options) {
		if (options === void 0) options = {};
		return {
			name: "shift",
			options,
			async fn(state) {
				const { x, y, placement, platform } = state;
				const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = false, limiter = { fn: (_ref) => {
					let { x, y } = _ref;
					return {
						x,
						y
					};
				} }, ...detectOverflowOptions } = evaluate(options, state);
				const coords = {
					x,
					y
				};
				const overflow = await platform.detectOverflow(state, detectOverflowOptions);
				const crossAxis = getSideAxis(placement);
				const mainAxis = getOppositeAxis(crossAxis);
				let mainAxisCoord = coords[mainAxis];
				let crossAxisCoord = coords[crossAxis];
				const clampCoord = (axis, coord) => clamp(coord + overflow[axis === "y" ? "top" : "left"], coord, coord - overflow[axis === "y" ? "bottom" : "right"]);
				if (checkMainAxis) mainAxisCoord = clampCoord(mainAxis, mainAxisCoord);
				if (checkCrossAxis) crossAxisCoord = clampCoord(crossAxis, crossAxisCoord);
				const limitedCoords = limiter.fn({
					...state,
					[mainAxis]: mainAxisCoord,
					[crossAxis]: crossAxisCoord
				});
				return {
					...limitedCoords,
					data: {
						x: limitedCoords.x - x,
						y: limitedCoords.y - y,
						enabled: {
							[mainAxis]: checkMainAxis,
							[crossAxis]: checkCrossAxis
						}
					}
				};
			}
		};
	};
	//#endregion
	//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
	function hasWindow() {
		return typeof window !== "undefined";
	}
	function getNodeName(node) {
		if (isNode(node)) return (node.nodeName || "").toLowerCase();
		return "#document";
	}
	function getWindow(node) {
		var _node$ownerDocument;
		return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
	}
	function getDocumentElement(node) {
		var _ref;
		return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
	}
	function isNode(value) {
		if (!hasWindow()) return false;
		return value instanceof Node || value instanceof getWindow(value).Node;
	}
	function isElement(value) {
		if (!hasWindow()) return false;
		return value instanceof Element || value instanceof getWindow(value).Element;
	}
	function isHTMLElement(value) {
		if (!hasWindow()) return false;
		return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
	}
	function isShadowRoot(value) {
		if (!hasWindow() || typeof ShadowRoot === "undefined") return false;
		return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
	}
	function isOverflowElement(element) {
		const { overflow, overflowX, overflowY, display } = getComputedStyle$1(element);
		return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && display !== "inline" && display !== "contents";
	}
	function isTableElement(element) {
		return /^(table|td|th)$/.test(getNodeName(element));
	}
	function isTopLayer(element) {
		try {
			if (element.matches(":popover-open")) return true;
		} catch (_e) {}
		try {
			return element.matches(":modal");
		} catch (_e) {
			return false;
		}
	}
	const willChangeRe = /transform|translate|scale|rotate|perspective|filter/;
	const containRe = /paint|layout|strict|content/;
	const isNotNone = (value) => !!value && value !== "none";
	let isWebKitValue;
	function isContainingBlock(elementOrCss) {
		const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;
		return isNotNone(css.transform) || isNotNone(css.translate) || isNotNone(css.scale) || isNotNone(css.rotate) || isNotNone(css.perspective) || !isWebKit() && (isNotNone(css.backdropFilter) || isNotNone(css.filter)) || willChangeRe.test(css.willChange || "") || containRe.test(css.contain || "");
	}
	function getContainingBlock(element) {
		let currentNode = getParentNode(element);
		while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
			if (isContainingBlock(currentNode)) return currentNode;
			else if (isTopLayer(currentNode)) return null;
			currentNode = getParentNode(currentNode);
		}
		return null;
	}
	function isWebKit() {
		if (isWebKitValue == null) isWebKitValue = typeof CSS !== "undefined" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none");
		return isWebKitValue;
	}
	function isLastTraversableNode(node) {
		return /^(html|body|#document)$/.test(getNodeName(node));
	}
	function getComputedStyle$1(element) {
		return getWindow(element).getComputedStyle(element);
	}
	function getNodeScroll(element) {
		if (isElement(element)) return {
			scrollLeft: element.scrollLeft,
			scrollTop: element.scrollTop
		};
		return {
			scrollLeft: element.scrollX,
			scrollTop: element.scrollY
		};
	}
	function getParentNode(node) {
		if (getNodeName(node) === "html") return node;
		const result = node.assignedSlot || node.parentNode || isShadowRoot(node) && node.host || getDocumentElement(node);
		return isShadowRoot(result) ? result.host : result;
	}
	function getNearestOverflowAncestor(node) {
		const parentNode = getParentNode(node);
		if (isLastTraversableNode(parentNode)) return (node.ownerDocument || node).body;
		if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode;
		return getNearestOverflowAncestor(parentNode);
	}
	function getOverflowAncestors(node, list, traverseIframes) {
		var _node$ownerDocument2;
		if (list === void 0) list = [];
		if (traverseIframes === void 0) traverseIframes = true;
		const scrollableAncestor = getNearestOverflowAncestor(node);
		const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
		const win = getWindow(scrollableAncestor);
		if (isBody) {
			const frameElement = getFrameElement(win);
			return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
		} else return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
	}
	function getFrameElement(win) {
		return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
	}
	//#endregion
	//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
	function getCssDimensions(element) {
		const css = getComputedStyle$1(element);
		let width = parseFloat(css.width) || 0;
		let height = parseFloat(css.height) || 0;
		const hasOffset = isHTMLElement(element);
		const offsetWidth = hasOffset ? element.offsetWidth : width;
		const offsetHeight = hasOffset ? element.offsetHeight : height;
		const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
		if (shouldFallback) {
			width = offsetWidth;
			height = offsetHeight;
		}
		return {
			width,
			height,
			$: shouldFallback
		};
	}
	function unwrapElement(element) {
		return !isElement(element) ? element.contextElement : element;
	}
	function getScale(element) {
		const domElement = unwrapElement(element);
		if (!isHTMLElement(domElement)) return createCoords(1);
		const rect = domElement.getBoundingClientRect();
		const { width, height, $ } = getCssDimensions(domElement);
		let x = ($ ? round(rect.width) : rect.width) / width;
		let y = ($ ? round(rect.height) : rect.height) / height;
		if (!x || !Number.isFinite(x)) x = 1;
		if (!y || !Number.isFinite(y)) y = 1;
		return {
			x,
			y
		};
	}
	const noOffsets = /*#__PURE__*/ createCoords(0);
	function getVisualOffsets(element) {
		const win = getWindow(element);
		if (!isWebKit() || !win.visualViewport) return noOffsets;
		return {
			x: win.visualViewport.offsetLeft,
			y: win.visualViewport.offsetTop
		};
	}
	function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
		if (isFixed === void 0) isFixed = false;
		return !!floatingOffsetParent && isFixed && floatingOffsetParent === getWindow(element);
	}
	function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
		if (includeScale === void 0) includeScale = false;
		if (isFixedStrategy === void 0) isFixedStrategy = false;
		const clientRect = element.getBoundingClientRect();
		const domElement = unwrapElement(element);
		let scale = createCoords(1);
		if (includeScale) {
			if (offsetParent) {
				if (isElement(offsetParent)) scale = getScale(offsetParent);
			} else scale = getScale(element);
		}
		const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
		let x = (clientRect.left + visualOffsets.x) / scale.x;
		let y = (clientRect.top + visualOffsets.y) / scale.y;
		let width = clientRect.width / scale.x;
		let height = clientRect.height / scale.y;
		if (domElement && offsetParent) {
			const win = getWindow(domElement);
			const offsetWin = isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
			let currentWin = win;
			let currentIFrame = getFrameElement(currentWin);
			while (currentIFrame && offsetWin !== currentWin) {
				const iframeScale = getScale(currentIFrame);
				const iframeRect = currentIFrame.getBoundingClientRect();
				const css = getComputedStyle$1(currentIFrame);
				const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
				const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
				x *= iframeScale.x;
				y *= iframeScale.y;
				width *= iframeScale.x;
				height *= iframeScale.y;
				x += left;
				y += top;
				currentWin = getWindow(currentIFrame);
				currentIFrame = getFrameElement(currentWin);
			}
		}
		return rectToClientRect({
			width,
			height,
			x,
			y
		});
	}
	function getWindowScrollBarX(element, rect) {
		const leftScroll = getNodeScroll(element).scrollLeft;
		if (!rect) return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
		return rect.left + leftScroll;
	}
	function getHTMLOffset(documentElement, scroll) {
		const htmlRect = documentElement.getBoundingClientRect();
		return {
			x: htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect),
			y: htmlRect.top + scroll.scrollTop
		};
	}
	function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
		let { elements, rect, offsetParent, strategy } = _ref;
		const isFixed = strategy === "fixed";
		const documentElement = getDocumentElement(offsetParent);
		const topLayer = elements ? isTopLayer(elements.floating) : false;
		if (offsetParent === documentElement || topLayer && isFixed) return rect;
		let scroll = {
			scrollLeft: 0,
			scrollTop: 0
		};
		let scale = createCoords(1);
		const offsets = createCoords(0);
		const isOffsetParentAnElement = isHTMLElement(offsetParent);
		if (isOffsetParentAnElement || !isFixed) {
			if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
			if (isOffsetParentAnElement) {
				const offsetRect = getBoundingClientRect(offsetParent);
				scale = getScale(offsetParent);
				offsets.x = offsetRect.x + offsetParent.clientLeft;
				offsets.y = offsetRect.y + offsetParent.clientTop;
			}
		}
		const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
		return {
			width: rect.width * scale.x,
			height: rect.height * scale.y,
			x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
			y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
		};
	}
	function getClientRects(element) {
		return element.getClientRects ? Array.from(element.getClientRects()) : [];
	}
	function getDocumentRect(html) {
		const scroll = getNodeScroll(html);
		const body = html.ownerDocument.body;
		const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
		const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
		let x = -scroll.scrollLeft + getWindowScrollBarX(html);
		const y = -scroll.scrollTop;
		if (getComputedStyle$1(body).direction === "rtl") x += max(html.clientWidth, body.clientWidth) - width;
		return {
			width,
			height,
			x,
			y
		};
	}
	const SCROLLBAR_MAX = 25;
	function getViewportRect(element, strategy, rootBoundary) {
		if (rootBoundary === void 0) rootBoundary = "viewport";
		const isLayoutViewport = rootBoundary === "layoutViewport";
		const win = getWindow(element);
		const html = getDocumentElement(element);
		const visualViewport = win.visualViewport;
		let width = html.clientWidth;
		let height = html.clientHeight;
		let x = 0;
		let y = 0;
		if (visualViewport) {
			const layoutRelativeClientCoords = !isWebKit() || strategy === "fixed";
			if (isLayoutViewport) {
				if (!layoutRelativeClientCoords) {
					x = -visualViewport.offsetLeft;
					y = -visualViewport.offsetTop;
				}
			} else {
				width = visualViewport.width;
				height = visualViewport.height;
				if (layoutRelativeClientCoords) {
					x = visualViewport.offsetLeft;
					y = visualViewport.offsetTop;
				}
			}
		}
		if (getWindowScrollBarX(html) <= 0) {
			const doc = html.ownerDocument;
			const body = doc.body;
			const bodyStyles = getComputedStyle(body);
			const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
			const reservedWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
			const gutter = getComputedStyle(html).scrollbarGutter === "stable both-edges" ? reservedWidth / 2 : reservedWidth;
			if (gutter <= SCROLLBAR_MAX) width -= gutter;
		}
		return {
			width,
			height,
			x,
			y
		};
	}
	function getInnerBoundingClientRect(element, strategy) {
		const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
		const top = clientRect.top + element.clientTop;
		const left = clientRect.left + element.clientLeft;
		const scale = getScale(element);
		return {
			width: element.clientWidth * scale.x,
			height: element.clientHeight * scale.y,
			x: left * scale.x,
			y: top * scale.y
		};
	}
	function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
		let rect;
		if (clippingAncestor === "viewport" || clippingAncestor === "layoutViewport") rect = getViewportRect(element, strategy, clippingAncestor);
		else if (clippingAncestor === "document") rect = getDocumentRect(getDocumentElement(element));
		else if (isElement(clippingAncestor)) rect = getInnerBoundingClientRect(clippingAncestor, strategy);
		else {
			const visualOffsets = getVisualOffsets(element);
			rect = {
				x: clippingAncestor.x - visualOffsets.x,
				y: clippingAncestor.y - visualOffsets.y,
				width: clippingAncestor.width,
				height: clippingAncestor.height
			};
		}
		return rectToClientRect(rect);
	}
	function getClippingElementAncestors(element, cache) {
		const cachedResult = cache.get(element);
		if (cachedResult) return cachedResult;
		let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
		let lastKeptComputedStyle = null;
		const elementIsFixed = getComputedStyle$1(element).position === "fixed";
		let currentNode = elementIsFixed ? getParentNode(element) : element;
		while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
			const computedStyle = getComputedStyle$1(currentNode);
			const currentNodeIsContaining = isContainingBlock(currentNode);
			const lastPosition = lastKeptComputedStyle ? lastKeptComputedStyle.position : elementIsFixed ? "fixed" : "";
			if (!currentNodeIsContaining && (lastPosition === "fixed" || lastPosition === "absolute" && computedStyle.position === "static")) result = result.filter((ancestor) => ancestor !== currentNode);
			else lastKeptComputedStyle = computedStyle;
			currentNode = getParentNode(currentNode);
		}
		cache.set(element, result);
		return result;
	}
	function getClippingRect(_ref) {
		let { element, boundary, rootBoundary, strategy } = _ref;
		const clippingAncestors = [...boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary), rootBoundary];
		const firstRect = getClientRectFromClippingAncestor(element, clippingAncestors[0], strategy);
		let top = firstRect.top;
		let right = firstRect.right;
		let bottom = firstRect.bottom;
		let left = firstRect.left;
		for (let i = 1; i < clippingAncestors.length; i++) {
			const rect = getClientRectFromClippingAncestor(element, clippingAncestors[i], strategy);
			top = max(rect.top, top);
			right = min(rect.right, right);
			bottom = min(rect.bottom, bottom);
			left = max(rect.left, left);
		}
		return {
			width: right - left,
			height: bottom - top,
			x: left,
			y: top
		};
	}
	function getDimensions(element) {
		const { width, height } = getCssDimensions(element);
		return {
			width,
			height
		};
	}
	function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
		const isOffsetParentAnElement = isHTMLElement(offsetParent);
		const documentElement = getDocumentElement(offsetParent);
		const isFixed = strategy === "fixed";
		const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
		let scroll = {
			scrollLeft: 0,
			scrollTop: 0
		};
		const offsets = createCoords(0);
		if (isOffsetParentAnElement || !isFixed) {
			if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
			if (isOffsetParentAnElement) {
				const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
				offsets.x = offsetRect.x + offsetParent.clientLeft;
				offsets.y = offsetRect.y + offsetParent.clientTop;
			}
		}
		if (!isOffsetParentAnElement && documentElement) offsets.x = getWindowScrollBarX(documentElement);
		const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
		return {
			x: rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x,
			y: rect.top + scroll.scrollTop - offsets.y - htmlOffset.y,
			width: rect.width,
			height: rect.height
		};
	}
	function isStaticPositioned(element) {
		return getComputedStyle$1(element).position === "static";
	}
	function getTrueOffsetParent(element, polyfill) {
		if (!isHTMLElement(element) || getComputedStyle$1(element).position === "fixed") return null;
		if (polyfill) return polyfill(element);
		let rawOffsetParent = element.offsetParent;
		if (getDocumentElement(element) === rawOffsetParent) rawOffsetParent = rawOffsetParent.ownerDocument.body;
		return rawOffsetParent;
	}
	function getOffsetParent(element, polyfill) {
		const win = getWindow(element);
		if (isTopLayer(element)) return win;
		if (!isHTMLElement(element)) {
			let svgOffsetParent = getParentNode(element);
			while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
				if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) return svgOffsetParent;
				svgOffsetParent = getParentNode(svgOffsetParent);
			}
			return win;
		}
		let offsetParent = getTrueOffsetParent(element, polyfill);
		while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) offsetParent = getTrueOffsetParent(offsetParent, polyfill);
		if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) return win;
		return offsetParent || getContainingBlock(element) || win;
	}
	const getElementRects = async function(data) {
		const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
		const getDimensionsFn = this.getDimensions;
		const floatingDimensions = await getDimensionsFn(data.floating);
		return {
			reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
			floating: {
				x: 0,
				y: 0,
				width: floatingDimensions.width,
				height: floatingDimensions.height
			}
		};
	};
	function isRTL(element) {
		return getComputedStyle$1(element).direction === "rtl";
	}
	const platform = {
		convertOffsetParentRelativeRectToViewportRelativeRect,
		getDocumentElement,
		getClippingRect,
		getOffsetParent,
		getElementRects,
		getClientRects,
		getDimensions,
		getScale,
		isElement,
		isRTL
	};
	function rectsAreEqual(a, b) {
		return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
	}
	function observeMove(element, onMove, ancestorResize) {
		let io = null;
		let timeoutId;
		const root = getDocumentElement(element);
		function cleanup() {
			var _io;
			clearTimeout(timeoutId);
			(_io = io) == null || _io.disconnect();
			io = null;
		}
		function refresh(skip, threshold) {
			if (skip === void 0) skip = false;
			if (threshold === void 0) threshold = 1;
			cleanup();
			const elementRectForRootMargin = element.getBoundingClientRect();
			const { left, top, width, height } = elementRectForRootMargin;
			if (!skip) onMove();
			if (!width || !height) return;
			const insetTop = floor(top);
			const insetRight = floor(root.clientWidth - (left + width));
			const insetBottom = floor(root.clientHeight - (top + height));
			const insetLeft = floor(left);
			const options = {
				rootMargin: -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px",
				threshold: max(0, min(1, threshold)) || 1
			};
			let isFirstUpdate = true;
			function handleObserve(entries) {
				const ratio = entries[0].intersectionRatio;
				if (!rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) return refresh();
				if (ratio !== threshold) {
					if (!isFirstUpdate) return refresh();
					if (!ratio) timeoutId = setTimeout(() => {
						refresh(false, 1e-7);
					}, 1e3);
					else refresh(false, ratio);
				}
				isFirstUpdate = false;
			}
			try {
				io = new IntersectionObserver(handleObserve, {
					...options,
					root: root.ownerDocument
				});
			} catch (_e) {
				io = new IntersectionObserver(handleObserve, options);
			}
			io.observe(element);
		}
		const win = getWindow(element);
		const handleResize = () => refresh(ancestorResize);
		win.addEventListener("resize", handleResize);
		refresh(true);
		return () => {
			win.removeEventListener("resize", handleResize);
			cleanup();
		};
	}
	/**
	* Automatically updates the position of the floating element when necessary.
	* Should only be called when the floating element is mounted on the DOM or
	* visible on the screen.
	* @returns cleanup function that should be invoked when the floating element is
	* removed from the DOM or hidden from the screen.
	* @see https://floating-ui.com/docs/autoUpdate
	*/
	function autoUpdate(reference, floating, update, options) {
		if (options === void 0) options = {};
		const { ancestorScroll = true, ancestorResize = true, elementResize = typeof ResizeObserver === "function", layoutShift = typeof IntersectionObserver === "function", animationFrame = false } = options;
		const referenceEl = unwrapElement(reference);
		const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...floating ? getOverflowAncestors(floating) : []] : [];
		ancestors.forEach((ancestor) => {
			ancestorScroll && ancestor.addEventListener("scroll", update);
			ancestorResize && ancestor.addEventListener("resize", update);
		});
		const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update, ancestorResize) : null;
		let reobserveFrame = -1;
		let resizeObserver = null;
		if (elementResize) {
			resizeObserver = new ResizeObserver((_ref) => {
				let [firstEntry] = _ref;
				if (firstEntry && firstEntry.target === referenceEl && resizeObserver && floating) {
					resizeObserver.unobserve(floating);
					cancelAnimationFrame(reobserveFrame);
					reobserveFrame = requestAnimationFrame(() => {
						var _resizeObserver;
						(_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
					});
				}
				update();
			});
			if (referenceEl && !animationFrame) resizeObserver.observe(referenceEl);
			if (floating) resizeObserver.observe(floating);
		}
		let frameId;
		let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
		if (animationFrame) frameLoop();
		function frameLoop() {
			const nextRefRect = getBoundingClientRect(reference);
			if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) update();
			prevRefRect = nextRefRect;
			frameId = requestAnimationFrame(frameLoop);
		}
		update();
		return () => {
			var _resizeObserver2;
			ancestors.forEach((ancestor) => {
				ancestorScroll && ancestor.removeEventListener("scroll", update);
				ancestorResize && ancestor.removeEventListener("resize", update);
			});
			cleanupIo?.();
			(_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
			resizeObserver = null;
			if (animationFrame) cancelAnimationFrame(frameId);
		};
	}
	/**
	* Modifies the placement by translating the floating element along the
	* specified axes.
	* A number (shorthand for `mainAxis` or distance), or an axes configuration
	* object may be passed.
	* @see https://floating-ui.com/docs/offset
	*/
	const offset = offset$1;
	/**
	* Optimizes the visibility of the floating element by shifting it in order to
	* keep it in view when it will overflow the clipping boundary.
	* @see https://floating-ui.com/docs/shift
	*/
	const shift = shift$1;
	/**
	* Optimizes the visibility of the floating element by flipping the `placement`
	* in order to keep it in view when the preferred placement(s) will overflow the
	* clipping boundary. Alternative to `autoPlacement`.
	* @see https://floating-ui.com/docs/flip
	*/
	const flip = flip$1;
	/**
	* Provides data to position an inner element of the floating element so that it
	* appears centered to the reference element.
	* @see https://floating-ui.com/docs/arrow
	*/
	const arrow = arrow$1;
	/**
	* Computes the `x` and `y` coordinates that will place the floating element
	* next to a given reference element.
	*/
	const computePosition = (reference, floating, options) => {
		const cache = /* @__PURE__ */ new Map();
		const mergedOptions = options != null ? options : {};
		const platformWithCache = {
			...platform,
			...mergedOptions.platform,
			_c: cache
		};
		return computePosition$1(reference, floating, {
			...mergedOptions,
			platform: platformWithCache
		});
	};
	//#endregion
	//#region js/src/util/floating-ui.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO util/floating-ui.ts
	* License (https://coreui.io/pro/license/)
	*
	* This is a modified version of Bootstrap's util/floating-ui.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Breakpoints for responsive placement (matches SCSS $grid-breakpoints —
	* CoreUI keeps the classic scale, not upstream's Tailwind-style one)
	*/
	const BREAKPOINTS = {
		sm: 576,
		md: 768,
		lg: 992,
		xl: 1200,
		xxl: 1400
	};
	/**
	* Parse a placement string that may contain responsive prefixes
	* Example: "bottom-start md:top-end lg:right" returns { xs: 'bottom-start', md: 'top-end', lg: 'right' }
	*
	* @param placementString - The placement string to parse
	* @param defaultPlacement - The default placement to use for xs/base
	* @returns Object with breakpoint keys and placement values, or null if not responsive
	*/
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
	/**
	* Get the active placement for the current viewport width
	*
	* @param responsivePlacements - Object with breakpoint keys and placement values
	* @param defaultPlacement - Fallback placement
	* @returns The active placement for current viewport
	*/
	const getResponsivePlacement = (responsivePlacements, defaultPlacement = "bottom") => {
		if (!responsivePlacements) return defaultPlacement;
		const viewportWidth = window.innerWidth;
		let activePlacement = responsivePlacements.xs || defaultPlacement;
		for (const breakpoint of [
			"sm",
			"md",
			"lg",
			"xl",
			"xxl"
		]) if (viewportWidth >= BREAKPOINTS[breakpoint] && responsivePlacements[breakpoint]) activePlacement = responsivePlacements[breakpoint];
		return activePlacement;
	};
	/**
	* Create media query listeners for responsive placement changes
	*
	* @param callback - Callback to run when breakpoint changes
	* @returns Array of { mql, handler } objects for cleanup
	*/
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
	/**
	* Clean up media query listeners
	*
	* @param listeners - Array of { mql, handler } objects
	*/
	const disposeBreakpointListeners = (listeners) => {
		for (const { mql, handler } of listeners) mql.removeEventListener("change", handler);
	};
	/**
	* Normalize an offset value into Floating UI's offset shape.
	* A `[skidding, distance]` array becomes `{ mainAxis: distance, crossAxis: skidding }`;
	* numbers and axis objects pass through unchanged.
	*/
	const toFloatingOffset = (value) => {
		return Array.isArray(value) ? {
			mainAxis: value[1] || 0,
			crossAxis: value[0] || 0
		} : value;
	};
	/**
	* The dropdown-shaped anchored panel: bottom-start placement (mirrored in
	* RTL), a 2px main-axis offset, flip and shift within the clipping ancestors.
	* Autocomplete, multi-select and the v1 pickers all position exactly this way,
	* so the wiring — initial position, autoUpdate resubscription and the
	* disconnect guards on both sides of the await — lives here once.
	*
	* `destroy()` also acts as the in-flight guard: a computePosition resolving
	* after teardown must not touch the content's styles.
	*/
	const createAnchoredPosition = (anchor, content) => {
		let disposed = false;
		const update = async () => {
			if (disposed || !content || !content.isConnected) return;
			const { x, y } = await computePosition(anchor, content, {
				middleware: [
					offset({ mainAxis: 2 }),
					flip(),
					shift({ boundary: "clippingAncestors" })
				],
				placement: isRTL$1() ? "bottom-end" : "bottom-start"
			});
			if (disposed || !content.isConnected) return;
			Object.assign(content.style, {
				position: "absolute",
				left: `${x}px`,
				top: `${y}px`
			});
		};
		update();
		const cleanup = autoUpdate(anchor, content, update);
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
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/focustrap.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/focustrap.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$42 = "focustrap";
	const EVENT_KEY$34 = `.bs.focustrap`;
	const EVENT_FOCUSIN$5 = `focusin${EVENT_KEY$34}`;
	const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$34}`;
	const TAB_KEY$3 = "Tab";
	const TAB_NAV_FORWARD = "forward";
	const TAB_NAV_BACKWARD = "backward";
	const Default$41 = {
		additionalElement: null,
		autofocus: true,
		trapElement: null
	};
	const DefaultType$40 = {
		additionalElement: "(element|null|undefined)",
		autofocus: "boolean",
		trapElement: "element"
	};
	/**
	* Class definition
	*/
	var FocusTrap = class extends Config {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
			this._isActive = false;
			this._lastTabNavDirection = null;
		}
		static get Default() {
			return Default$41;
		}
		static get DefaultType() {
			return DefaultType$40;
		}
		static get NAME() {
			return NAME$42;
		}
		activate() {
			if (this._isActive) return;
			if (this._config.autofocus) this._config.trapElement.focus();
			EventHandler.off(document, EVENT_KEY$34);
			EventHandler.on(document, EVENT_FOCUSIN$5, (event) => this._handleFocusin(event));
			EventHandler.on(document, EVENT_KEYDOWN_TAB, (event) => this._handleKeydown(event));
			this._isActive = true;
		}
		deactivate() {
			if (!this._isActive) return;
			this._isActive = false;
			EventHandler.off(document, EVENT_KEY$34);
		}
		_handleFocusin(event) {
			const { additionalElement, trapElement } = this._config;
			if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) return;
			if (additionalElement && (event.target === additionalElement || additionalElement.contains(event.target))) return;
			const elements = SelectorEngine.focusableChildren(trapElement);
			if (elements.length === 0) trapElement.focus();
			else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) elements[elements.length - 1].focus();
			else elements[0].focus();
		}
		_handleKeydown(event) {
			if (event.key !== TAB_KEY$3) return;
			this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
			const { additionalElement, trapElement } = this._config;
			if (!additionalElement) return;
			const trapElements = SelectorEngine.focusableChildren(trapElement);
			const additionalElements = SelectorEngine.focusableChildren(additionalElement);
			if (trapElements.length === 0 || additionalElements.length === 0) return;
			const target = event.target;
			const trapIndex = trapElements.indexOf(target);
			const additionalIndex = additionalElements.indexOf(target);
			const redirect = (element) => {
				event.preventDefault();
				element.focus();
			};
			if (trapIndex === trapElements.length - 1 && !event.shiftKey) {
				redirect(additionalElements[0]);
				return;
			}
			if (trapIndex === 0 && event.shiftKey) {
				redirect(additionalElements[additionalElements.length - 1]);
				return;
			}
			if (additionalIndex === additionalElements.length - 1 && !event.shiftKey) {
				redirect(trapElements[0]);
				return;
			}
			if (additionalIndex === 0 && event.shiftKey) redirect(trapElements[trapElements.length - 1]);
		}
	};
	//#endregion
	//#region js/src/util/popup.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO util/popup.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$41 = "popup";
	const EVENT_KEY$33 = `.bs.popup`;
	const EVENT_CLICK$10 = `click${EVENT_KEY$33}`;
	const EVENT_KEYDOWN$10 = `keydown${EVENT_KEY$33}`;
	const ESCAPE_KEY$5 = "Escape";
	const ARROW_DOWN_KEY$10 = "ArrowDown";
	const Default$40 = {
		anchor: null,
		container: false,
		content: null,
		fallbackPlacements: null,
		focusTrap: true,
		mobileBreakpoint: 768,
		offset: [0, 2],
		onHidden: null,
		onHide: null,
		onShow: null,
		onShown: null,
		placement: "bottom-start",
		returnFocus: true
	};
	const DefaultType$39 = {
		anchor: "element",
		container: "(string|element|boolean)",
		content: "element",
		fallbackPlacements: "(array|null)",
		focusTrap: "boolean",
		mobileBreakpoint: "number",
		offset: "array",
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
		if (explicitContainer) return explicitContainer;
		const dialog = anchor?.closest("dialog[open]");
		if (dialog) return hasConstrainingAncestor(anchor, dialog) ? dialog : null;
		return hasConstrainingAncestor(anchor) ? document.body : null;
	};
	/**
	* Class definition
	*
	* Anchored-overlay primitive shared by the picker shells (and, over time,
	* autocomplete / multi-select / dropdown). Owns exactly four concerns:
	* positioning (Floating UI), container teleport, focus containment across the
	* anchor/content split, and dismissal (outside click, Escape, return focus).
	* Lifecycle notifications are callbacks — public events belong to the owning
	* component, so the primitive never emits on its own.
	*/
	var Popup = class extends Config {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
			this._anchor = this._config.anchor;
			this._content = this._config.content;
			this._container = this._config.container ? getElement(this._config.container) : null;
			this._cleanupAutoUpdate = null;
			this._isShown = false;
			this._previouslyFocused = null;
			this._clickListener = null;
			this._keydownListener = null;
			this._anchorKeydownListener = null;
			this._focustrap = this._config.focusTrap ? new FocusTrap({
				additionalElement: this._content,
				trapElement: this._anchor
			}) : null;
			this._addAnchorKeydownListener();
		}
		static get Default() {
			return Default$40;
		}
		static get DefaultType() {
			return DefaultType$39;
		}
		static get NAME() {
			return NAME$41;
		}
		get isShown() {
			return this._isShown;
		}
		get isMobile() {
			return window.matchMedia(`(max-width: ${this._config.mobileBreakpoint - 1}px)`).matches;
		}
		show() {
			if (this._isShown) return;
			this._isShown = true;
			this._previouslyFocused = document.activeElement;
			this._mount();
			execute(this._config.onShow);
			if (!this.isMobile) this._startPositioning();
			this._addDismissListeners();
			if (this._focustrap) this._focustrap.activate();
			this._focusPanel();
			execute(this._config.onShown);
		}
		hide() {
			if (!this._isShown) return;
			execute(this._config.onHide);
			this._isShown = false;
			this._stopPositioning();
			this._removeDismissListeners();
			if (this._focustrap) this._focustrap.deactivate();
			if (this._config.returnFocus && this._previouslyFocused) {
				this._previouslyFocused.focus();
				this._previouslyFocused = null;
			}
			execute(this._config.onHidden);
			executeAfterTransition(() => this._unmount(), this._content);
		}
		toggle() {
			return this._isShown ? this.hide() : this.show();
		}
		update() {
			if (this._isShown && !this.isMobile) this._updatePosition();
		}
		dispose() {
			this.hide();
			this._unmount();
			if (this._anchorKeydownListener) {
				EventHandler.off(this._anchor, EVENT_KEYDOWN$10, this._anchorKeydownListener);
				this._anchorKeydownListener = null;
			}
			this._focustrap = null;
			this._anchor = null;
			this._content = null;
			this._container = null;
		}
		_mount() {
			if (!this._content) return;
			const container = this._resolveContainer();
			if (container) {
				container.append(this._content);
				return;
			}
			this._anchor?.after(this._content);
		}
		_unmount() {
			if (!this._isShown) this._content?.remove();
		}
		_resolveContainer() {
			return resolvePopupContainer(this._anchor, this._container);
		}
		_startPositioning() {
			this._cleanupAutoUpdate = autoUpdate(this._anchor, this._content, () => this._updatePosition());
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
				offset({
					crossAxis: skidding,
					mainAxis: distance
				}),
				flip(this._config.fallbackPlacements ? { fallbackPlacements: this._config.fallbackPlacements } : {}),
				shift()
			];
			computePosition(this._anchor, this._content, {
				middleware,
				placement: this._resolvePlacement(),
				strategy: "absolute"
			}).then(({ x, y }) => {
				if (!this._content || !this._content.isConnected) return;
				Object.assign(this._content.style, {
					insetInlineStart: "0",
					left: `${x}px`,
					position: "absolute",
					top: `${y}px`
				});
			});
		}
		_resolvePlacement() {
			const { placement } = this._config;
			if (!isRTL$1()) return placement;
			return placement.endsWith("-start") ? placement.replace("-start", "-end") : placement.endsWith("-end") ? placement.replace("-end", "-start") : placement;
		}
		_addAnchorKeydownListener() {
			if (!this._anchor) return;
			this._anchorKeydownListener = (event) => {
				if (!(event.key === "F4" || event.altKey && event.key === ARROW_DOWN_KEY$10) || this._isShown) return;
				event.preventDefault();
				this.show();
			};
			EventHandler.on(this._anchor, EVENT_KEYDOWN$10, this._anchorKeydownListener);
		}
		_focusPanel() {
			if (!this._content) return;
			const stops = SelectorEngine.find("[tabindex=\"0\"]", this._content);
			(stops.find((element) => element.getAttribute("aria-selected") === "true") ?? stops.find((element) => element.getAttribute("aria-current") === "date" || Boolean(element.querySelector("[aria-current=\"date\"]"))) ?? stops[stops.length - 1] ?? SelectorEngine.focusableChildren(this._content)[0])?.focus();
		}
		_addDismissListeners() {
			this._clickListener = (event) => {
				const path = event.composedPath();
				if (path.includes(this._anchor) || path.includes(this._content)) return;
				this.hide();
			};
			this._keydownListener = (event) => {
				if (event.key === ESCAPE_KEY$5) this.hide();
			};
			EventHandler.on(document, EVENT_CLICK$10, this._clickListener);
			EventHandler.on(document, EVENT_KEYDOWN$10, this._keydownListener);
		}
		_removeDismissListeners() {
			EventHandler.off(document, EVENT_CLICK$10, this._clickListener);
			EventHandler.off(document, EVENT_KEYDOWN$10, this._keydownListener);
			this._clickListener = null;
			this._keydownListener = null;
			this._anchorKeydownListener = null;
		}
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
			"href"
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
	/**
	* A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
	* contexts.
	*
	* Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L38
	*/
	const SAFE_URL_PATTERN = /^(?!(?:javascript|data|vbscript):)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
	/**
	* A pattern that matches safe data URLs. Only matches image, video and audio
	* types — notably NOT `data:text/html`, which is an XSS vector.
	*
	* Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L49
	*/
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
	//#endregion
	//#region js/src/combobox.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO combobox.ts
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Internal shared engine for the combobox-pattern components (Autocomplete,
	* MultiSelect). Not exported from the package and not documented — the public
	* surfaces stay the subclasses, which keep their own markup, class names,
	* events and options.
	*
	* The seam mirrors Menu/Dropdown: subclasses override the static getters
	* (`selectors`, `activationKeys`) and the engine reads them through
	* `this.constructor`, so every shared behavior operates on the subclass's own
	* class names. Anchored positioning composes `createAnchoredPosition()`
	* directly (the util extracted from these very components) rather than a Menu
	* instance, which would impose menu interaction semantics on a listbox.
	*/
	const ARROW_UP_KEY$7 = "ArrowUp";
	const ARROW_DOWN_KEY$9 = "ArrowDown";
	const END_KEY$7 = "End";
	const ESCAPE_KEY$4 = "Escape";
	const ENTER_KEY$5 = "Enter";
	const HOME_KEY$7 = "Home";
	const CLASS_NAME_SHOW$15 = "show";
	const CLASS_NAME_POPUP$4 = "combobox-popup";
	const CLASS_NAME_OPTIONS = "combobox-options";
	const CLASS_NAME_OPTIONS_EMPTY = "combobox-options-empty";
	const CLASS_NAME_OPTION = "combobox-option";
	const CLASS_NAME_OPTGROUP = "combobox-optgroup";
	const CLASS_NAME_OPTGROUP_LABEL = "combobox-optgroup-label";
	const CLASS_NAME_DISABLED$8 = "disabled";
	const CLASS_NAME_SELECTED$2 = "selected";
	const CLASS_NAME_LABEL = "label";
	const SELECTOR_OPTION$1 = ".combobox-option";
	const SELECTOR_OPTGROUP$1 = ".combobox-optgroup";
	const SELECTOR_OPTIONS = ".combobox-options";
	const SELECTOR_OPTIONS_EMPTY = ".combobox-options-empty";
	const SELECTOR_VISIBLE_ITEMS$1 = ".combobox-options .combobox-option:not(.disabled):not(:disabled)";
	var Combobox = class extends BaseComponent {
		static get navigableItemsSelector() {
			return SELECTOR_VISIBLE_ITEMS$1;
		}
		static get activationKeys() {
			return [ENTER_KEY$5];
		}
		toggle() {
			return this._isShown() ? this.hide() : this.show();
		}
		show() {
			if (this._config.disabled || this._isShown() || !this._canShow()) return;
			EventHandler.trigger(this._element, this.constructor.eventName("show"));
			const showTarget = this._getShowTarget();
			this._mountMenu();
			showTarget.classList.add(CLASS_NAME_SHOW$15);
			this._getAriaExpandedTarget().setAttribute("aria-expanded", "true");
			this._menu.classList.add(CLASS_NAME_SHOW$15);
			EventHandler.trigger(this._element, this.constructor.eventName("shown"));
			this._createFloating();
			this._afterShow();
		}
		hide() {
			EventHandler.trigger(this._element, this.constructor.eventName("hide"));
			this._onHideStart();
			this._disposeFloating();
			this._afterHideDispose();
			this._getShowTarget().classList.remove(CLASS_NAME_SHOW$15);
			this._getAriaExpandedTarget().setAttribute("aria-expanded", "false");
			this._menu.classList.remove(CLASS_NAME_SHOW$15);
			this._onHideEnd();
			EventHandler.trigger(this._element, this.constructor.eventName("hidden"));
			executeAfterTransition(() => {
				if (this._menu && !this._isShown()) this._menu.remove();
			}, this._menu);
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
				if (!this._isShown() && (event.key === ENTER_KEY$5 || event.key === ARROW_DOWN_KEY$9)) {
					event.preventDefault();
					this.show();
					return;
				}
				if (this._isShown() && event.key === ARROW_DOWN_KEY$9) {
					event.preventDefault();
					this._selectMenuItem(event);
				}
			});
		}
		_addOptionsKeydownListeners() {
			EventHandler.on(this._optionsElement, this.constructor.eventName("keydown"), (event) => {
				if (this.constructor.activationKeys.includes(event.key)) {
					event.preventDefault();
					this._onOptionsClick(event.target);
				}
				if ([ARROW_UP_KEY$7, ARROW_DOWN_KEY$9].includes(event.key)) {
					event.preventDefault();
					this._selectMenuItem(event);
				}
				if ([HOME_KEY$7, END_KEY$7].includes(event.key)) {
					event.preventDefault();
					this._selectFirstOrLastMenuItem(event.key === HOME_KEY$7);
				}
			});
		}
		_createOptionsContainer() {
			const popupDiv = document.createElement("div");
			popupDiv.classList.add("popup", CLASS_NAME_POPUP$4);
			this._buildMenuHeader(popupDiv);
			const optionsDiv = document.createElement("div");
			optionsDiv.classList.add(CLASS_NAME_OPTIONS);
			optionsDiv.setAttribute("role", "listbox");
			optionsDiv.setAttribute("id", `${this._uniqueId}-listbox`);
			this._decorateListbox(optionsDiv);
			if (this._config.optionsMaxHeight !== "auto") {
				optionsDiv.style.maxHeight = `${this._config.optionsMaxHeight}px`;
				optionsDiv.style.overflow = "auto";
			}
			popupDiv.append(optionsDiv);
			EventHandler.on(popupDiv, this.constructor.eventName("keydown"), (event) => {
				if (event.key === ESCAPE_KEY$4) {
					event.preventDefault();
					event.stopPropagation();
					this._escapeFocusTarget()?.focus();
					this.hide();
				}
			});
			this._createOptions(optionsDiv, this._options);
			this._optionsElement = optionsDiv;
			this._menu = popupDiv;
			this._afterMenuCreated();
		}
		_buildMenuHeader(popupDiv) {}
		_decorateListbox(optionsDiv) {}
		_afterMenuCreated() {}
		_createOptions(parentElement, options) {
			for (const option of options) {
				if (Array.isArray(option.options)) {
					const optgroup = document.createElement("div");
					optgroup.classList.add(CLASS_NAME_OPTGROUP);
					const optgrouplabel = document.createElement("div");
					if (typeof this._config.optionsGroupsTemplate === "function") optgrouplabel.innerHTML = this._maybeSanitize(this._config.optionsGroupsTemplate(option));
					else optgrouplabel.textContent = option.label;
					optgrouplabel.classList.add(CLASS_NAME_OPTGROUP_LABEL);
					this._decorateOptgroupLabel(optgrouplabel, option);
					optgroup.append(optgrouplabel);
					this._createOptions(optgroup, option.options);
					parentElement.append(optgroup);
					continue;
				}
				const optionDiv = document.createElement("div");
				optionDiv.classList.add(CLASS_NAME_OPTION);
				optionDiv.setAttribute("role", "option");
				optionDiv.setAttribute("aria-selected", this._isOptionSelectedInitially(option) ? "true" : "false");
				if (option.disabled) optionDiv.classList.add(CLASS_NAME_DISABLED$8);
				optionDiv.dataset.value = String(option.value);
				optionDiv.tabIndex = 0;
				this._decorateOption(optionDiv, option);
				this._renderOptionContent(optionDiv, option);
				parentElement.append(optionDiv);
			}
		}
		_decorateOption(optionDiv, option) {}
		_decorateOptgroupLabel(label, option) {}
		_renderOptionContent(optionDiv, option) {}
		_isOptionSelectedInitially(option) {
			return false;
		}
		_onOptionsClick(element) {
			if (this._interceptOptionsClick(element)) return;
			if (element.classList.contains(CLASS_NAME_LABEL)) return;
			if (!element.classList.contains(CLASS_NAME_OPTION)) {
				element = element.closest(SELECTOR_OPTION$1);
				if (!element) return;
			}
			this._onOptionActivate(String(element.dataset.value), element);
		}
		_interceptOptionsClick(element) {
			return false;
		}
		_onOptionActivate(value, element) {}
		_syncOptionElementState(value, selected) {
			const option = SelectorEngine.findOne(`[data-value="${CSS.escape(String(value))}"]`, this._optionsElement);
			if (option) {
				option.classList.toggle(CLASS_NAME_SELECTED$2, selected);
				option.setAttribute("aria-selected", selected ? "true" : "false");
			}
		}
		_flattenOptions(options = this._options, flat = []) {
			for (const option of options) {
				if (option && Array.isArray(option.options)) {
					this._flattenOptions(option.options, flat);
					continue;
				}
				flat.push(option);
			}
			return flat;
		}
		_findOptionByValue(value, options = this._options) {
			for (const option of options) {
				if (String(option.value) === String(value)) return option;
				if (option.options && Array.isArray(option.options)) {
					const found = this._findOptionByValue(value, option.options);
					if (found) return found;
				}
			}
			return null;
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
		_filterOptionsList() {
			const options = SelectorEngine.find(SELECTOR_OPTION$1, this._menu);
			let visibleOptions = 0;
			for (const option of options) {
				const optionElement = option;
				if (optionElement.textContent.toLowerCase().indexOf(this._search) === -1) optionElement.style.display = "none";
				else {
					this._decorateFilteredOption(optionElement);
					optionElement.style.removeProperty("display");
					visibleOptions++;
				}
				const optgroup = option.closest(SELECTOR_OPTGROUP$1);
				if (optgroup) {
					if (SelectorEngine.children(optgroup, SELECTOR_OPTION$1).filter((element) => this._isOptionDisplayed(element)).length > 0) optgroup.style.removeProperty("display");
					else optgroup.style.display = "none";
				}
			}
			this._afterFilter(visibleOptions);
		}
		_decorateFilteredOption(option) {}
		_afterFilter(visibleOptions) {
			this._syncNoResultsPlaceholder(visibleOptions);
		}
		_syncNoResultsPlaceholder(visibleOptions) {
			const emptyMessage = SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._menu);
			if (visibleOptions > 0) {
				if (emptyMessage) emptyMessage.remove();
				return;
			}
			if (!emptyMessage) {
				const placeholder = document.createElement("div");
				placeholder.classList.add(CLASS_NAME_OPTIONS_EMPTY);
				placeholder.setAttribute("role", "status");
				placeholder.textContent = this._config.searchNoResultsLabel;
				SelectorEngine.findOne(SELECTOR_OPTIONS, this._menu).append(placeholder);
			}
		}
		_isOptionDisplayed(element) {
			return element.style.display !== "none";
		}
		_selectMenuItem({ key, target }) {
			const items = SelectorEngine.find(this.constructor.navigableItemsSelector, this._menu).filter((element) => isVisible(element));
			if (!items.length) return;
			getNextActiveElement(items, target, key === ARROW_DOWN_KEY$9, !items.includes(target)).focus();
		}
		_selectFirstOrLastMenuItem(first) {
			const items = SelectorEngine.find(this.constructor.navigableItemsSelector, this._menu).filter((element) => isVisible(element));
			if (!items.length) return;
			(first ? items[0] : items[items.length - 1]).focus();
		}
		_maybeSanitize(content) {
			return this._config.sanitize ? sanitizeHtml(content, this._config.allowList, this._config.sanitizeFn) : content;
		}
		_normalizeContainerConfig(config) {
			if (config.container === true) config.container = document.body;
			if (typeof config.container === "object" || typeof config.container === "string") config.container = getElement(config.container);
			return config;
		}
	};
	//#endregion
	//#region js/src/util/icons.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO util/icons.js
	* License (https://coreui.io/pro/license/)
	*
	* Icons shared by more than one component. They live in JavaScript rather than
	* in CSS masks — inline SVG on currentColor, so a component's state reaches the
	* icon without a colour token of its own, and swappable through an option.
	* --------------------------------------------------------------------------
	*/
	const CLEANER_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"39.15 39.15 433.71 433.71\" fill=\"currentColor\"><path d=\"m427.314 107.313-22.628-22.626L256 233.373 107.314 84.687l-22.628 22.626L233.373 256 84.686 404.687l22.628 22.626L256 278.627l148.686 148.686 22.628-22.626L278.627 256z\"/></svg>";
	const INDICATOR_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M256.045 416.136.717 160.807l29.579-29.579 225.749 225.748 225.749-225.748 29.579 29.579-255.328 255.329z\"/></svg>";
	const PASSWORD_SHOW_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M256,144.927A103.309,103.309,0,1,0,359.309,248.236,103.426,103.426,0,0,0,256,144.927Zm0,174.618a71.309,71.309,0,1,1,71.309-71.309A71.39,71.39,0,0,1,256,319.545Z\"/><path d=\"M397.222,131.1l-.218-.223c-77.75-77.749-204.258-77.749-282.008,0L16,233.79v28.893l98.778,102.689.218.222a199.409,199.409,0,0,0,282.008,0l99-102.911V233.79ZM464,249.79l-89.732,93.285a167.409,167.409,0,0,1-236.536,0L48,249.79v-3.107L137.729,153.4c65.247-65.13,171.3-65.13,236.542,0L464,246.683Z\"/><rect width=\"32\" height=\"32\" x=\"240\" y=\"232\" /></svg>";
	const PASSWORD_HIDE_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M397.222,131.1l-.218-.223C333.831,67.707,238.47,55.862,163.228,95.346l23.938,23.939c61.571-27.691,136.573-16.327,187.105,34.115L464,246.683v3.107l-71.744,74.585,22.63,22.63L496,262.683V233.79Z\"/><path d=\"M352.8,284.33A103.307,103.307,0,0,0,219.907,151.438L246.1,177.63a71.228,71.228,0,0,1,80.507,80.508Z\"/><path d=\"M369.9,347.268l-33.831-33.831c.088-.108.179-.212.266-.32l-22.805-22.806c-.083.113-.169.222-.253.334l-99.681-99.681c.112-.083.221-.17.334-.253L191.12,167.906c-.108.087-.213.179-.321.266L38.627,16H16V38.627l95.689,95.689L16,233.79v28.893l98.778,102.689.218.222A199.732,199.732,0,0,0,367.372,390l106,106H496V473.373L392.537,369.911Zm-177.157-131.9L288.871,311.5a71.28,71.28,0,0,1-96.133-96.133ZM137.729,343.073,48,249.79v-3.107l86.319-89.737,35.065,35.064A103.248,103.248,0,0,0,312.226,334.853l32.007,32.007C279.723,406.875,193.711,398.955,137.729,343.073Z\"/></svg>";
	const MINUS_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M464 240H48v32h416z\"/></svg>";
	const PLUS_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M464 240H272V48h-32v192H48v32h192v192h32V272h192z\"/></svg>";
	//#endregion
	//#region js/src/autocomplete.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO autocomplete.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* ------------------------------------------------------------------------
	* Constants
	* ------------------------------------------------------------------------
	*/
	const NAME$40 = "autocomplete";
	const DATA_KEY$3 = "bs.autocomplete";
	const EVENT_KEY$32 = `.${DATA_KEY$3}`;
	const DATA_API_KEY$29 = ".data-api";
	const ARROW_DOWN_KEY$8 = "ArrowDown";
	const BACKSPACE_KEY$3 = "Backspace";
	const DELETE_KEY$2 = "Delete";
	const ENTER_KEY$4 = "Enter";
	const ESCAPE_KEY$3 = "Escape";
	const TAB_KEY$2 = "Tab";
	const RIGHT_MOUSE_BUTTON$2 = 2;
	const EVENT_BLUR$1 = `blur${EVENT_KEY$32}`;
	const EVENT_CHANGED$1 = `changed${EVENT_KEY$32}`;
	const EVENT_CLICK$9 = `click${EVENT_KEY$32}`;
	const EVENT_INPUT$3 = `input${EVENT_KEY$32}`;
	const EVENT_KEYDOWN$9 = `keydown${EVENT_KEY$32}`;
	const EVENT_KEYUP$1 = `keyup${EVENT_KEY$32}`;
	const EVENT_MOUSEDOWN$2 = `mousedown${EVENT_KEY$32}`;
	const EVENT_CLICK_DATA_API$17 = `click${EVENT_KEY$32}${DATA_API_KEY$29}`;
	const EVENT_KEYUP_DATA_API$3 = `keyup${EVENT_KEY$32}${DATA_API_KEY$29}`;
	const EVENT_LOAD_DATA_API$21 = `load${EVENT_KEY$32}${DATA_API_KEY$29}`;
	const CLASS_NAME_AUTOCOMPLETE = "autocomplete";
	const CLASS_NAME_CLEANER$5 = "form-control-cleaner";
	const CLASS_NAME_DISABLED$7 = "disabled";
	const CLASS_NAME_INDICATOR$4 = "form-control-action";
	const CLASS_NAME_INPUT = "form-control";
	const CLASS_NAME_INPUT_HINT = "autocomplete-input-hint";
	const CLASS_NAME_INPUT_GROUP$5 = "form-control-group";
	const CLASS_NAME_SHOW$14 = "show";
	const SELECTOR_DATA_TOGGLE$24 = "[data-bs-toggle=\"autocomplete\"]:not(.disabled)";
	const SELECTOR_DATA_TOGGLE_SHOWN = `.autocomplete:not(.disabled).${CLASS_NAME_SHOW$14}`;
	const SELECTOR_INDICATOR = ".form-control-action";
	const Default$39 = {
		allowList: DefaultAllowlist,
		allowOnlyDefinedOptions: false,
		ariaCleanerLabel: "Clear selection",
		ariaIndicatorLabel: "Toggle visibility of options menu",
		cleaner: false,
		clearSearchOnSelect: true,
		container: false,
		disabled: false,
		highlightOptionsOnSearch: false,
		id: null,
		indicator: false,
		invalid: false,
		name: null,
		options: false,
		optionsGroupsTemplate: null,
		optionsMaxHeight: "auto",
		optionsTemplate: null,
		placeholder: null,
		required: false,
		sanitize: true,
		sanitizeFn: null,
		search: null,
		searchNoResultsLabel: false,
		showHints: false,
		valid: false,
		value: null
	};
	const DefaultType$38 = {
		allowList: "object",
		allowOnlyDefinedOptions: "boolean",
		ariaCleanerLabel: "string",
		ariaIndicatorLabel: "string",
		cleaner: "boolean",
		clearSearchOnSelect: "boolean",
		container: "(string|element|boolean)",
		disabled: "boolean",
		highlightOptionsOnSearch: "boolean",
		id: "(string|null)",
		indicator: "boolean",
		invalid: "boolean",
		name: "(string|null)",
		options: "(array|null)",
		optionsGroupsTemplate: "(function|null)",
		optionsMaxHeight: "(number|string)",
		optionsTemplate: "(function|null)",
		placeholder: "(string|null)",
		required: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		search: "(array|string|null)",
		searchNoResultsLabel: "boolean|string",
		showHints: "boolean",
		valid: "boolean",
		value: "(number|string|null)"
	};
	/**
	* ------------------------------------------------------------------------
	* Class Definition
	* ------------------------------------------------------------------------
	*/
	var Autocomplete = class Autocomplete extends Combobox {
		constructor(element, config) {
			super(element, config);
			this._uniqueId = this._config.id ?? getUID(`${this.constructor.NAME}`);
			this._indicatorElement = null;
			this._inputElement = null;
			this._inputHintElement = null;
			this._togglerElement = null;
			this._optionsElement = null;
			this._menu = null;
			this._selected = [];
			this._options = this._getOptionsFromConfig();
			this._floatingCleanup = null;
			this._anchoredPosition = null;
			this._search = "";
			this._createAutocomplete();
			this._addEventListeners();
			data_default.set(this._element, DATA_KEY$3, this);
		}
		static get Default() {
			return Default$39;
		}
		static get DefaultType() {
			return DefaultType$38;
		}
		static get NAME() {
			return NAME$40;
		}
		_canShow() {
			return Boolean(this._config.searchNoResultsLabel) || this._flattenOptions().some((option) => option.label.toLowerCase().includes(this._search.toLowerCase()));
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
			this._disposeFloating();
			this._menu?.remove();
			super.dispose();
		}
		clear() {
			this.deselectAll();
			this.search("");
			this._filterOptionsList();
			this._inputElement.value = "";
			this._triggerChangeEvent(null);
		}
		search(label) {
			this._search = label.length > 0 ? label.toLowerCase() : "";
			if (!this._isExternalSearch()) this._filterOptionsList();
			EventHandler.trigger(this._element, EVENT_INPUT$3, { value: label });
		}
		update(config) {
			if (config.value) this.deselectAll();
			this._config = {
				...this._config,
				...this._configAfterMerge(config)
			};
			this._options = this._getOptionsFromConfig();
			this._optionsElement.innerHTML = "";
			this._createOptions(this._optionsElement, this._options);
		}
		deselectAll(options = this._selected) {
			if (this._selected.length === 0) return;
			for (const option of options) {
				if (option.disabled) continue;
				if (Array.isArray(option.options)) {
					this.deselectAll(option.options);
					continue;
				}
				this._deselectOption(option.value);
				this._updateCleaner();
			}
		}
		_triggerChangeEvent(value) {
			EventHandler.trigger(this._element, EVENT_CHANGED$1, { value });
		}
		_getClassNames() {
			return this._element.classList.value.split(" ");
		}
		_highlightOption(label) {
			if (!this._search) return escapeHtml(label);
			const escapedSearch = this._search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const regex = new RegExp(`(${escapedSearch})`, "gi");
			return String(label).split(regex).map((part, index) => index % 2 === 0 ? escapeHtml(part) : `<strong>${escapeHtml(part)}</strong>`).join("");
		}
		_isExternalSearch() {
			return Array.isArray(this._config.search) && this._config.search.includes("external");
		}
		_isGlobalSearch() {
			return Array.isArray(this._config.search) && this._config.search.includes("global");
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_CLICK$9, (event) => {
				if (!this._config.disabled && !event.target.closest(SELECTOR_INDICATOR)) this.show();
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$9, (event) => {
				if (event.key === ESCAPE_KEY$3) {
					this.hide();
					if (this._config.allowOnlyDefinedOptions && this._selected.length === 0) {
						this.search("");
						this._inputElement.value = "";
					}
					return;
				}
				if (this._isGlobalSearch() && (event.key.length === 1 || event.key === BACKSPACE_KEY$3 || event.key === DELETE_KEY$2)) this._inputElement.focus();
			});
			EventHandler.on(this._menu, EVENT_KEYDOWN$9, (event) => {
				if (this._isGlobalSearch() && (event.key.length === 1 || event.key === BACKSPACE_KEY$3 || event.key === DELETE_KEY$2)) this._inputElement.focus();
			});
			this._addTogglerKeydownListeners();
			EventHandler.on(this._indicatorElement, EVENT_CLICK$9, (event) => {
				event.preventDefault();
				this.toggle();
			});
			EventHandler.on(this._inputElement, EVENT_BLUR$1, () => {
				const inputValue = this._inputElement.value;
				if (inputValue.length === 0) return;
				const inputValueLower = inputValue.toLowerCase();
				const exactMatches = this._flattenOptions().filter((option) => option.label.toLowerCase() === inputValueLower);
				if (exactMatches.length === 1) {
					this._selectOption(exactMatches[0]);
					return;
				}
				if (this._config.allowOnlyDefinedOptions) {
					this.clear();
					return;
				}
				this._triggerChangeEvent(inputValue);
			});
			EventHandler.on(this._inputElement, EVENT_KEYDOWN$9, (event) => {
				if (!this._isShown() && event.key !== TAB_KEY$2) this.show();
				if (event.key === ARROW_DOWN_KEY$8 && this._inputElement.value.length === this._inputElement.selectionStart) {
					this._selectMenuItem(event);
					return;
				}
				if (event.key === TAB_KEY$2 && this._config.showHints && this._inputElement.value.length > 0) {
					if (this._inputHintElement.value) {
						event.preventDefault();
						event.stopPropagation();
					}
					const options = this._flattenOptions().filter((option) => option.label.toLowerCase().startsWith(this._inputElement.value.toLowerCase()));
					if (options.length > 0) this._selectOption(options[0]);
				}
				if (event.key === ENTER_KEY$4) {
					event.preventDefault();
					event.stopPropagation();
					if (this._inputElement.value.length === 0) return;
					const options = this._flattenOptions().filter((option) => option.label.toLowerCase() === this._inputElement.value.toLowerCase());
					if (options.length > 0) this._selectOption(options[0]);
					if (options.length === 0 && !this._config.allowOnlyDefinedOptions) {
						this._triggerChangeEvent(this._inputElement.value);
						this.hide();
						if (this._config.clearSearchOnSelect) this.search("");
					}
				}
			});
			EventHandler.on(this._inputElement, EVENT_KEYUP$1, (event) => {
				if (event.key.length === 1 || event.key === BACKSPACE_KEY$3 || event.key === DELETE_KEY$2) {
					const { value } = event.target;
					this.search(value);
					if (this._config.showHints) {
						const options = value ? this._flattenOptions().filter((option) => option.label.toLowerCase().startsWith(value.toLowerCase())) : [];
						this._inputHintElement.value = options.length > 0 ? `${value}${options[0].label.slice(value.length)}` : "";
					}
					if (this._selected.length > 0) {
						this.deselectAll();
						this._triggerChangeEvent(null);
					}
				}
			});
			EventHandler.on(this._optionsElement, EVENT_MOUSEDOWN$2, (event) => {
				event.preventDefault();
			});
			EventHandler.on(this._optionsElement, EVENT_CLICK$9, (event) => {
				event.preventDefault();
				event.stopPropagation();
				this._onOptionsClick(event.target);
			});
			EventHandler.on(this._cleanerElement, EVENT_CLICK$9, (event) => {
				if (!this._config.disabled) {
					event.preventDefault();
					event.stopPropagation();
					this.clear();
				}
			});
			EventHandler.on(this._cleanerElement, EVENT_KEYDOWN$9, (event) => {
				if (!this._config.disabled && event.key === ENTER_KEY$4) {
					event.preventDefault();
					event.stopPropagation();
					this.clear();
				}
			});
			this._addOptionsKeydownListeners();
		}
		_getOptionsFromConfig(options = this._config.options) {
			if (!options || !Array.isArray(options)) return [];
			const _options = [];
			for (const option of options) {
				if (option.options && Array.isArray(option.options)) {
					const customGroupProperties = { ...option };
					delete customGroupProperties.label;
					delete customGroupProperties.options;
					_options.push({
						...customGroupProperties,
						label: option.label,
						options: this._getOptionsFromConfig(option.options)
					});
					continue;
				}
				const label = typeof option === "string" ? option : option.label;
				const value = option.value ?? (typeof option === "string" ? option : option.label);
				const isSelected = option.selected || this._config.value && this._config.value === value;
				const customProperties = typeof option === "object" ? { ...option } : {};
				delete customProperties.label;
				delete customProperties.value;
				delete customProperties.selected;
				delete customProperties.disabled;
				_options.push({
					...customProperties,
					label,
					value: String(value),
					...isSelected && { selected: true },
					...option.disabled && { disabled: true }
				});
				if (isSelected) this._selected.push({
					label: option.label,
					value: String(value)
				});
			}
			return _options;
		}
		_createAutocomplete() {
			this._element.classList.add(CLASS_NAME_AUTOCOMPLETE);
			this._element.classList.toggle("is-invalid", this._config.invalid);
			this._element.classList.toggle("is-valid", this._config.valid);
			if (this._config.disabled) this._element.classList.add(CLASS_NAME_DISABLED$7);
			for (const className of this._getClassNames()) this._element.classList.add(className);
			this._createInputGroup();
			this._createButtons();
			this._createOptionsContainer();
			this._updateOptionsList();
		}
		_createInputGroup() {
			const togglerEl = this._element;
			togglerEl.classList.add(CLASS_NAME_INPUT_GROUP$5);
			this._togglerElement = togglerEl;
			if (!this._config.search && !this._config.disabled) togglerEl.tabIndex = -1;
			if (!this._config.disabled && this._config.showHints) {
				const inputHintEl = document.createElement("input");
				inputHintEl.classList.add(CLASS_NAME_INPUT, CLASS_NAME_INPUT_HINT);
				inputHintEl.setAttribute("name", (this._config.name || `${this._uniqueId}-hint`).toString());
				inputHintEl.autocomplete = "off";
				inputHintEl.readOnly = true;
				inputHintEl.tabIndex = -1;
				inputHintEl.setAttribute("aria-hidden", true);
				togglerEl.append(inputHintEl);
				this._inputHintElement = inputHintEl;
			}
			const inputEl = document.createElement("input");
			inputEl.classList.add(CLASS_NAME_INPUT);
			inputEl.id = this._uniqueId;
			inputEl.setAttribute("name", (this._config.name || this._uniqueId).toString());
			inputEl.autocomplete = "off";
			inputEl.placeholder = this._config.placeholder ?? "";
			inputEl.role = "combobox";
			inputEl.setAttribute("aria-autocomplete", "list");
			inputEl.setAttribute("aria-expanded", "false");
			inputEl.setAttribute("aria-haspopup", "listbox");
			inputEl.setAttribute("aria-controls", `${this._uniqueId}-listbox`);
			if (this._config.disabled) {
				inputEl.setAttribute("disabled", true);
				inputEl.tabIndex = -1;
			}
			if (this._config.required) inputEl.setAttribute("required", true);
			togglerEl.append(inputEl);
			this._inputElement = inputEl;
		}
		_createButtons() {
			if (!this._config.cleaner && !this._config.indicator) return;
			const buttons = this._togglerElement;
			if (!this._config.disabled && this._config.cleaner) {
				const cleaner = document.createElement("button");
				cleaner.type = "button";
				cleaner.classList.add(CLASS_NAME_CLEANER$5);
				cleaner.style.display = "none";
				cleaner.setAttribute("aria-label", this._config.ariaCleanerLabel);
				cleaner.innerHTML = CLEANER_ICON;
				buttons.append(cleaner);
				this._cleanerElement = cleaner;
			}
			if (this._config.indicator) {
				const indicator = document.createElement("button");
				indicator.type = "button";
				indicator.classList.add(CLASS_NAME_INDICATOR$4);
				indicator.disabled = this._config.disabled;
				indicator.setAttribute("aria-label", this._config.ariaIndicatorLabel);
				indicator.innerHTML = INDICATOR_ICON;
				buttons.append(indicator);
				this._indicatorElement = indicator;
			}
			this._updateCleaner();
		}
		_decorateListbox(optionsDiv) {
			optionsDiv.setAttribute("aria-labelledby", this._uniqueId);
		}
		_afterMenuCreated() {
			if (this._config.container) this._inputElement.setAttribute("aria-owns", `${this._uniqueId}-listbox`);
		}
		_decorateOption(optionDiv, option) {
			if (option.disabled) optionDiv.setAttribute("aria-disabled", "true");
		}
		_isOptionSelectedInitially(option) {
			return this._selected.some((selected) => selected.value === option.value);
		}
		_renderOptionContent(optionDiv, option) {
			if (this._isExternalSearch() && this._config.highlightOptionsOnSearch && this._search) optionDiv.innerHTML = this._highlightOption(option.label);
			else if (this._config.optionsTemplate && typeof this._config.optionsTemplate === "function") optionDiv.innerHTML = this._maybeSanitize(this._config.optionsTemplate(option));
			else optionDiv.textContent = option.label;
		}
		_onOptionActivate(value, element) {
			const foundOption = this._findOptionByValue(value);
			if (foundOption) {
				this._selectOption(foundOption);
				this._inputElement.focus();
			}
		}
		_selectOption(option) {
			this.deselectAll();
			if (this._selected.filter((selectedOption) => selectedOption.value === option.value).length === 0) this._selected.push(option);
			this._syncOptionElementState(option.value, true);
			this._triggerChangeEvent(option);
			this._inputElement.value = option.label;
			if (this._config.showHints) this._inputHintElement.value = "";
			this.hide();
			if (this._config.clearSearchOnSelect) this.search("");
			this._updateCleaner();
		}
		_deselectOption(value) {
			this._selected = this._selected.filter((option) => option.value !== value);
			this._syncOptionElementState(value, false);
		}
		_updateCleaner() {
			if (!this._config.cleaner || this._cleanerElement === null) return;
			if (this._selected.length > 0) {
				this._cleanerElement.style.removeProperty("display");
				return;
			}
			this._cleanerElement.style.display = "none";
		}
		_updateOptionsList(options = this._options) {
			for (const option of options) {
				if (Array.isArray(option.options)) {
					this._updateOptionsList(option.options);
					continue;
				}
				if (option.selected) this._selectOption(option);
			}
		}
		_decorateFilteredOption(option) {
			if (this._config.highlightOptionsOnSearch && !this._config.optionsTemplate) option.innerHTML = this._highlightOption(option.textContent);
		}
		_afterFilter(visibleOptions) {
			if (visibleOptions > 0 || this._config.searchNoResultsLabel) {
				this._syncNoResultsPlaceholder(visibleOptions);
				return;
			}
			this.hide();
		}
		_configAfterMerge(config) {
			config = this._normalizeContainerConfig(config);
			if (typeof config.options === "string") config.options = config.options.split(/,\s*/).map(String);
			if (typeof config.search === "string") config.search = config.search.split(/,\s*/).map(String);
			return config;
		}
		static autocompleteInterface(element, config) {
			const data = Autocomplete.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				Autocomplete.autocompleteInterface(this, config);
			});
		}
		static clearMenus(event) {
			if (event.button === RIGHT_MOUSE_BUTTON$2 || event.type === "keyup" && event.key !== TAB_KEY$2) return;
			const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
			for (const toggle of openToggles) {
				const context = Autocomplete.getInstance(toggle);
				if (!context) continue;
				const composedPath = event.composedPath();
				if (composedPath.includes(context._element) || composedPath.includes(context._menu)) continue;
				const relatedTarget = { relatedTarget: context._element };
				if (event.type === "click") relatedTarget.clickEvent = event;
				context.hide();
				context.search("");
				if (context._config.allowOnlyDefinedOptions && context._selected.length === 0) context._inputElement.value = "";
			}
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$21, () => {
		for (const autocomplete of SelectorEngine.find(SELECTOR_DATA_TOGGLE$24)) Autocomplete.autocompleteInterface(autocomplete);
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$17, Autocomplete.clearMenus);
	EventHandler.on(document, EVENT_KEYUP_DATA_API$3, Autocomplete.clearMenus);
	/**
	* jQuery
	*/
	defineJQueryPlugin(Autocomplete);
	//#endregion
	//#region js/src/button.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI button.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's button.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$39 = "button";
	const EVENT_KEY$31 = `.bs.button`;
	const DATA_API_KEY$28 = ".data-api";
	const CLASS_NAME_ACTIVE$8 = "active";
	const SELECTOR_DATA_TOGGLE$23 = "[data-bs-toggle=\"button\"]";
	const EVENT_CLICK_DATA_API$16 = `click${EVENT_KEY$31}${DATA_API_KEY$28}`;
	const EVENT_DOM_CONTENT_LOADED = `DOMContentLoaded${EVENT_KEY$31}${DATA_API_KEY$28}`;
	/**
	* Class definition
	*/
	var Button = class Button extends BaseComponent {
		static get NAME() {
			return NAME$39;
		}
		toggle() {
			setAriaAttribute(this._element, "aria-pressed", this._element.classList.toggle(CLASS_NAME_ACTIVE$8));
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Button.getOrCreateInstance(this);
				if (config === "toggle") data[config]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_DOM_CONTENT_LOADED, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE$23)) if (!element.hasAttribute("aria-pressed")) setAriaAttribute(element, "aria-pressed", element.classList.contains(CLASS_NAME_ACTIVE$8));
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$16, SELECTOR_DATA_TOGGLE$23, (event) => {
		event.preventDefault();
		const button = event.target.closest(SELECTOR_DATA_TOGGLE$23);
		Button.getOrCreateInstance(button).toggle();
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Button);
	//#endregion
	//#region js/src/util/calendar.ts
	/**
	* Converts an ISO week string to a Date object representing the Monday of that week.
	* @param isoWeek - The ISO week string (e.g., "2023W05" or "2023w05").
	* @returns The Date object for the Monday of the specified week, or null if invalid.
	*/
	/**
	* Helper function to calculate Monday of ISO week 1 for a given year.
	* @param year - The year to calculate for.
	* @returns The Monday of ISO week 1.
	*/
	const getMondayOfISOWeek1 = (year) => {
		const jan4 = new Date(year, 0, 4);
		const jan4DayOfWeek = jan4.getDay();
		const daysFromMonday = jan4DayOfWeek === 0 ? 6 : jan4DayOfWeek - 1;
		const mondayOfWeek1 = new Date(jan4);
		mondayOfWeek1.setDate(jan4.getDate() - daysFromMonday);
		return mondayOfWeek1;
	};
	/**
	* Helper function to calculate Monday of a specific ISO week.
	* @param year - The year.
	* @param week - The ISO week number.
	* @returns The Monday of the specified ISO week.
	*/
	const getMondayOfISOWeek = (year, week) => {
		const mondayOfWeek1 = getMondayOfISOWeek1(year);
		const weekStart = new Date(mondayOfWeek1);
		weekStart.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);
		return weekStart;
	};
	/**
	* Helper function to convert a date to a month number for comparison.
	* @param date - The date to convert.
	* @returns A number representing year*12 + month for easy comparison.
	*/
	const dateToMonthNumber = (date) => {
		return date.getFullYear() * 12 + date.getMonth();
	};
	/**
	* Helper function to convert a date to a quarter number for comparison.
	* @param date - The date to convert.
	* @returns A number representing year*4 + quarter for easy comparison.
	*/
	const dateToQuarterNumber = (date) => {
		const quarter = Math.floor(date.getMonth() / 3);
		return date.getFullYear() * 4 + quarter;
	};
	/**
	* Helper function to check if a value is within min/max range.
	* @param value - The value to check.
	* @param min - Minimum allowed value (null means no minimum).
	* @param max - Maximum allowed value (null means no maximum).
	* @returns True if the value is outside the range, false if within range.
	*/
	const isOutsideRange = (value, min, max) => {
		if (min !== null && value < min) return true;
		if (max !== null && value > max) return true;
		return false;
	};
	/**
	* Converts an ISO week string to a Date object representing the Monday of that week.
	* @param isoWeek - The ISO week string (e.g., "2023W05" or "2023w05").
	* @returns The Date object for the Monday of the specified week.
	*/
	const convertIsoWeekToDate = (isoWeek) => {
		const [year, week] = isoWeek.split(/[Ww]/);
		const parsedYear = parseYearSmart(year);
		return getMondayOfISOWeek(parsedYear, Number.parseInt(week, 10));
	};
	/**
	* Parses a week string and returns a Date object for the Monday of that week.
	* @param dateString - The week string to parse.
	* @returns The Date object for the Monday of the week, or null if invalid.
	*/
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
				return getMondayOfISOWeek(parsedYear, parsedWeek);
			}
		}
		return convertIsoWeekToDate(dateString);
	};
	/**
	* Parses a quarter string and returns a Date object for the first day of that quarter.
	* @param dateString - The quarter string to parse.
	* @returns The Date object for the first day of the quarter, or null if invalid.
	*/
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
					return new Date(parsedYear, monthIndex, 1);
				}
			}
		}
		return null;
	};
	/**
	* Parses a month string and returns a Date object for the first day of that month.
	* @param dateString - The month string to parse.
	* @returns The Date object for the first day of the month, or null if invalid.
	*/
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
				if (parsedMonth >= 0 && parsedMonth <= 11) return new Date(parsedYear, parsedMonth, 1);
			}
		}
		return null;
	};
	/**
	* Parses a year string or number and returns a Date object for January 1st of that year.
	* @param dateString - The year string or number to parse.
	* @returns The Date object for January 1st of the year, or null if invalid.
	*/
	const parseYearString = (dateString) => {
		const yearString = String(dateString);
		const match = yearString.trim().match(/^(\d{2,4})$/);
		if (match) {
			const groups = { year: match[1] };
			return createDateFromYear(groups);
		}
		return parseLocalDateString(yearString);
	};
	/**
	* Helper function to generate multiple date format patterns based on locale.
	* @param locale - The locale to use for date format patterns.
	* @param includeTime - Whether to include time in the patterns.
	* @returns Array of date format patterns.
	*/
	const generateDatePatterns = (locale, includeTime) => {
		const referenceDate = new Date(2013, 11, 31, 17, 19, 22);
		const patterns = [];
		try {
			const standardFormat = includeTime ? referenceDate.toLocaleString(locale) : referenceDate.toLocaleDateString(locale);
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
	/**
	* Helper function to build regex pattern for date parsing.
	* @param formatString - The date format string.
	* @param includeTime - Whether to include time patterns.
	* @returns The regex pattern string.
	*/
	const buildDateRegexPattern = (formatString, includeTime) => {
		let regexPattern = formatString.replaceAll(/[.*+?^${}()|[\\]\\]/g, "\\$&");
		regexPattern = regexPattern.replace("2013", String.raw`(?<year>\d{2,4})`).replace("12", String.raw`(?<month>\d{1,2})`).replace("31", String.raw`(?<day>\d{1,2})`);
		if (includeTime) regexPattern = regexPattern.replaceAll(/17|5/g, String.raw`(?<hour>\d{1,2})`).replace("19", String.raw`(?<minute>\d{1,2})`).replace("22", String.raw`(?<second>\d{1,2})`).replaceAll(/AM|PM/gi, "(?<ampm>[APap][Mm])");
		return regexPattern;
	};
	/**
	* Helper function to try parsing with multiple patterns.
	* @param dateString - The date string to parse.
	* @param patterns - Array of format patterns to try.
	* @param includeTime - Whether time parsing is included.
	* @returns Parsed groups or null if no match.
	*/
	const tryParseWithPatterns = (dateString, patterns, includeTime) => {
		for (const pattern of patterns) {
			const regexPattern = buildDateRegexPattern(pattern, includeTime);
			const regex = new RegExp(`^${regexPattern}$`);
			const match = dateString.trim().match(regex);
			if (match?.groups) return match.groups;
		}
		return null;
	};
	/**
	* Helper function to convert 12-hour to 24-hour format.
	* @param hour - Hour string.
	* @param ampm - AM/PM indicator.
	* @returns Hour in 24-hour format.
	*/
	const convertTo24Hour = (hour, ampm) => {
		const parsedHour = Number.parseInt(hour, 10);
		if (!ampm) return parsedHour;
		const isPM = ampm.toLowerCase() === "pm";
		if (isPM && parsedHour !== 12) return parsedHour + 12;
		if (!isPM && parsedHour === 12) return 0;
		return parsedHour;
	};
	/**
	* Helper function to validate time components.
	* @param hour - Hour value.
	* @param minute - Minute value.
	* @param second - Second value.
	* @returns True if time components are valid.
	*/
	const validateTimeComponents = (hour, minute, second) => {
		return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59;
	};
	/**
	* Helper function to validate date components.
	* @param month - Month string.
	* @param day - Day string.
	* @returns True if date components are valid.
	*/
	const validateDateComponents = (month, day) => {
		const parsedMonth = Number.parseInt(month, 10) - 1;
		const parsedDay = Number.parseInt(day, 10);
		return parsedMonth >= 0 && parsedMonth <= 11 && parsedDay >= 1 && parsedDay <= 31;
	};
	/**
	* Helper function to create date with time.
	* @param groups - Parsed date and time groups.
	* @returns Date object or null if invalid.
	*/
	const createDateWithTime = (groups) => {
		const { year, month, day, hour, minute, second, ampm } = groups;
		const parsedYear = parseYearSmart(year);
		const parsedMonth = Number.parseInt(month, 10) - 1;
		const parsedDay = Number.parseInt(day, 10);
		const parsedHour = convertTo24Hour(hour, ampm);
		const parsedMinute = Number.parseInt(minute ?? "0", 10) || 0;
		const parsedSecond = Number.parseInt(second ?? "0", 10) || 0;
		if (!validateTimeComponents(parsedHour, parsedMinute, parsedSecond)) return null;
		return new Date(parsedYear, parsedMonth, parsedDay, parsedHour, parsedMinute, parsedSecond);
	};
	/**
	* Helper function to create date without time.
	* @param groups - Parsed date groups.
	* @returns Date object or null if invalid.
	*/
	const createDateOnly = (groups) => {
		const { year, month, day } = groups;
		if (!validateDateComponents(month, day)) return null;
		const parsedYear = parseYearSmart(year);
		const parsedMonth = Number.parseInt(month, 10) - 1;
		return new Date(parsedYear, parsedMonth, Number.parseInt(day, 10));
	};
	/**
	* Helper function to determine expected parts count from patterns.
	* @param patterns - Array of date format patterns.
	* @returns Expected number of parts for a complete date.
	*/
	const getExpectedPartsCount = (patterns) => {
		if (patterns.length === 0) return 3;
		return patterns[0].split(/[-/.\s:]+/).filter((part) => part.length > 0).length;
	};
	/**
	* Enhanced day parsing with locale-aware patterns.
	* @param dateString - The day string to parse.
	* @param locale - The locale to use for parsing.
	* @param includeTime - Whether to include time parsing.
	* @returns Date object or null if invalid.
	*/
	const parseDayString = (dateString, locale, includeTime) => {
		const patterns = generateDatePatterns(locale, includeTime);
		const groups = tryParseWithPatterns(dateString, patterns, includeTime);
		if (!groups) {
			const trimmed = dateString.trim();
			const hasDateSeparators = /[-/.:]/.test(trimmed);
			const parts = trimmed.split(/[-/.\s:]+/).filter((part) => part.length > 0);
			const expectedPartsCount = getExpectedPartsCount(patterns);
			const hasRequiredParts = parts.length >= expectedPartsCount;
			if (hasDateSeparators && hasRequiredParts) return parseLocalDateString(dateString);
			return null;
		}
		if ("year" in groups && "month" in groups && "day" in groups) {
			const { month, day } = groups;
			if (!validateDateComponents(month, day)) return null;
		} else return null;
		return includeTime ? createDateWithTime(groups) : createDateOnly(groups);
	};
	/**
	* Parses a date string into a local Date object.
	* @param dateString - The date string to parse.
	* @returns The Date object in local timezone, or null if invalid.
	*/
	const parseLocalDateString = (dateString) => {
		const trimmed = dateString.trim();
		const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
		const _date = new Date(Date.parse(isoDateOnly ? `${trimmed}T00:00` : dateString));
		if (!Number.isNaN(_date.getTime())) return _date;
		return null;
	};
	/**
	* Converts a date string or Date object to a Date object based on selection type.
	* @param date - The date to convert.
	* @param selectionType - The type of selection ('day', 'week', 'month', 'year').
	* @param locale - The locale to use for date parsing (for day parsing).
	* @param includeTime - Whether to include time parsing (for day parsing).
	* @returns The corresponding Date object or null if invalid.
	*/
	const convertToDateObject = (date, selectionType, locale = "en-US", includeTime = false) => {
		if (date === null) return null;
		if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : date;
		const dateString = date;
		switch (selectionType) {
			case "week": return parseWeekString(dateString);
			case "month": return parseMonthString(dateString);
			case "quarter": return parseQuarterString(dateString);
			case "year": return parseYearString(dateString);
			default: return parseDayString(dateString, locale, includeTime);
		}
	};
	/**
	* Enhanced locale-aware date parsing function (replaces getLocalDateFromString).
	* @param dateString - The date string to parse.
	* @param locale - The locale to use for date format patterns.
	* @param includeTime - Whether to include time parsing.
	* @param selectionType - The selection type ('day', 'week', 'month', 'quarter', 'year').
	* @returns A Date object if parsing succeeds, null if parsing fails.
	*/
	const getLocalDateFromString = (dateString, locale = "en-US", includeTime = false, selectionType = "day") => {
		if (!dateString || typeof dateString !== "string") return null;
		return convertToDateObject(dateString, selectionType, locale, includeTime);
	};
	/**
	* Creates groups from an array.
	* @param arr - The array to group.
	* @param numberOfGroups - Number of groups to create.
	* @returns An array of grouped arrays.
	*/
	const createGroupsInArray = (arr, numberOfGroups) => {
		const perGroup = Math.ceil(arr.length / numberOfGroups);
		return Array.from({ length: numberOfGroups }).fill("").map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup));
	};
	/**
	* Adjusts the calendar date based on order and view type.
	* @param calendarDate - The current calendar date.
	* @param order - The order to adjust by.
	* @param view - The current view type.
	* @returns The adjusted Date object.
	*/
	const getCalendarDate = (calendarDate, order, view) => {
		if (order !== 0 && view === "days") return new Date(calendarDate.getFullYear(), calendarDate.getMonth() + order, 1);
		if (order !== 0 && (view === "months" || view === "quarters")) return new Date(calendarDate.getFullYear() + order, calendarDate.getMonth(), 1);
		if (order !== 0 && view === "years") return new Date(calendarDate.getFullYear() + 12 * order, calendarDate.getMonth(), 1);
		return calendarDate;
	};
	/**
	* Formats a date based on the selection type.
	* @param date - The date to format.
	* @param selectionType - The type of selection ('day', 'week', 'month', 'quarter', 'year').
	* @returns A formatted date string or the original Date object.
	*/
	const getDateBySelectionType = (date, selectionType) => {
		if (date === null) return null;
		if (selectionType === "week") {
			const { year, weekNumber } = getISOWeekNumberAndYear(date);
			return `${year}W${weekNumber.toString().padStart(2, "0")}`;
		}
		if (selectionType === "month") {
			const monthNumber = `0${date.getMonth() + 1}`.slice(-2);
			return `${date.getFullYear()}-${monthNumber}`;
		}
		if (selectionType === "quarter") {
			const quarter = Math.floor(date.getMonth() / 3) + 1;
			return `${date.getFullYear()}Q${quarter}`;
		}
		if (selectionType === "year") return `${date.getFullYear()}`;
		return date;
	};
	/**
	* Retrieves an array of month names based on locale and format.
	* @param locale - The locale string (e.g., 'en-US').
	* @param format - The format of the month names ('short' or 'long').
	* @returns An array of month names.
	*/
	const getMonthsNames = (locale, format = "short") => {
		return Array.from({ length: 12 }, (_, i) => {
			return new Date(2e3, i, 1).toLocaleString(locale, { month: format });
		});
	};
	/**
	* Generates an array of years centered around a given year.
	* @param year - The central year.
	* @param range - The number of years before and after the central year.
	* @returns An array of years.
	*/
	const getYears = (year, range = 6) => {
		return Array.from({ length: range * 2 }, (_, i) => year - range + i);
	};
	/**
	* Retrieves leading days (from the previous month) for a calendar view.
	* @param year - The year.
	* @param month - The month (0-11).
	* @param firstDayOfWeek - The first day of the week (0-6, where 0 is Sunday).
	* @returns An array of leading day objects.
	*/
	const getLeadingDays = (year, month, firstDayOfWeek) => {
		const dates = [];
		const d = new Date(year, month);
		const y = d.getFullYear();
		const m = d.getMonth();
		let leadingDays = 6 - (6 - new Date(y, m, 1).getDay()) - firstDayOfWeek;
		if (firstDayOfWeek) leadingDays = leadingDays < 0 ? 7 + leadingDays : leadingDays;
		for (let i = leadingDays * -1; i < 0; i++) dates.push({
			date: new Date(y, m, i + 1),
			month: "previous"
		});
		return dates;
	};
	/**
	* Retrieves all days within a specific month.
	* @param year - The year.
	* @param month - The month (0-11).
	* @returns An array of day objects.
	*/
	const getMonthDays = (year, month) => {
		const dates = [];
		const lastDay = new Date(year, month + 1, 0).getDate();
		for (let i = 1; i <= lastDay; i++) dates.push({
			date: new Date(year, month, i),
			month: "current"
		});
		return dates;
	};
	/**
	* Retrieves trailing days (from the next month) for a calendar view.
	* @param year - The year.
	* @param month - The month (0-11).
	* @param leadingDays - Array of leading day objects.
	* @param monthDays - Array of current month day objects.
	* @returns An array of trailing day objects.
	*/
	const getTrailingDays = (year, month, leadingDays, monthDays) => {
		const dates = [];
		const days = 42 - (leadingDays.length + monthDays.length);
		for (let i = 1; i <= days; i++) dates.push({
			date: new Date(year, month + 1, i),
			month: "next"
		});
		return dates;
	};
	/**
	* Calculates the ISO 8601 week number and year for a given date.
	*
	* In the ISO 8601 standard:
	* - Weeks start on Monday.
	* - The first week of the year is the one that contains January 4th.
	* - The year of the week may differ from the calendar year (e.g., Dec 29, 2025 is in ISO year 2026).
	*
	* @param {Date} date - The date for which to calculate the ISO week number and year.
	* @returns {{ weekNumber: number, year: number }} An object containing:
	*   - `weekNumber`: the ISO week number (1–53),
	*   - `year`: the ISO year (may differ from the calendar year of the date).
	*/
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
	/**
	* Retrieves detailed information about each week in a month for calendar rendering.
	* @param year - The year.
	* @param month - The month (0-11).
	* @param firstDayOfWeek - The first day of the week (0-6, where 0 is Sunday).
	* @returns An array of week objects containing week numbers and day details.
	*/
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
			if ((index + 1) % 7 === 0) {
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
	/**
	* Checks if a date is disabled based on the 'date' period type.
	* @param date - The date to check.
	* @param min - Minimum allowed date.
	* @param max - Maximum allowed date.
	* @param disabledDates - Criteria for disabled dates.
	* @returns True if the date is disabled, false otherwise.
	*/
	const isDateDisabled = (date, min, max, disabledDates) => {
		if (min && date < min) return true;
		if (max && date > max) return true;
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
	/**
	* Checks if a date is within a specified range.
	* @param date - The date to check.
	* @param start - Start date of the range.
	* @param end - End date of the range.
	* @returns True if the date is within the range, false otherwise.
	*/
	const isDateInRange = (date, start, end) => {
		const _date = removeTimeFromDate(date);
		const _start = start ? removeTimeFromDate(start) : null;
		const _end = end ? removeTimeFromDate(end) : null;
		return Boolean(_start && _end && _start <= _date && _date <= _end);
	};
	/**
	* Checks if a date is selected based on start and end dates.
	* @param date - The date to check.
	* @param start - Start date.
	* @param end - End date.
	* @returns True if the date is selected, false otherwise.
	*/
	const isDateSelected = (date, start, end) => {
		if (start !== null && isSameDateAs(start, date)) return true;
		if (end !== null && isSameDateAs(end, date)) return true;
		return false;
	};
	/**
	* Determines if any date within a range is disabled.
	* @param startDate - Start date of the range.
	* @param endDate - End date of the range.
	* @param disabledDates - Criteria for disabled dates.
	* @returns True if any date in the range is disabled, false otherwise.
	*/
	const isDisableDateInRange = (startDate, endDate, disabledDates) => {
		if (startDate && endDate) {
			const date = new Date(startDate);
			let disabled = false;
			while (date < endDate) {
				date.setDate(date.getDate() + 1);
				if (isDateDisabled(date, null, null, disabledDates)) {
					disabled = true;
					break;
				}
			}
			return disabled;
		}
		return false;
	};
	/**
	* Checks if a month is disabled based on the 'month' period type.
	* @param date - The date representing the month to check.
	* @param min - Minimum allowed date.
	* @param max - Maximum allowed date.
	* @param disabledDates - Criteria for disabled dates.
	* @returns True if the month is disabled, false otherwise.
	*/
	const isMonthDisabled = (date, min, max, disabledDates) => {
		const current = dateToMonthNumber(date);
		const _min = min ? dateToMonthNumber(min) : null;
		const _max = max ? dateToMonthNumber(max) : null;
		if (isOutsideRange(current, _min, _max)) return true;
		if (disabledDates === void 0) return false;
		const startTime = min ? Math.max(date.getTime(), min.getTime()) : date.getTime();
		const endTime = max ? Math.min(date.getTime(), max.getTime()) : new Date((/* @__PURE__ */ new Date()).getFullYear(), 11, 31).getTime();
		for (const currentDate = new Date(startTime); currentDate.getTime() <= endTime; currentDate.setDate(currentDate.getDate() + 1)) if (!isDateDisabled(currentDate, min, max, disabledDates)) return false;
		return false;
	};
	/**
	* Checks if a month is selected based on start and end dates.
	* @param date - The date representing the month.
	* @param start - Start date.
	* @param end - End date.
	* @returns True if the month is selected, false otherwise.
	*/
	const isMonthSelected = (date, start, end) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		if (start !== null && year === start.getFullYear() && month === start.getMonth()) return true;
		if (end !== null && year === end.getFullYear() && month === end.getMonth()) return true;
		return false;
	};
	/**
	* Checks if a month is within a specified range.
	* @param date - The date representing the month.
	* @param start - Start date.
	* @param end - End date.
	* @returns True if the month is within the range, false otherwise.
	*/
	const isMonthInRange = (date, start, end) => {
		const _start = start ? dateToMonthNumber(start) : null;
		const _end = end ? dateToMonthNumber(end) : null;
		const _date = dateToMonthNumber(date);
		return Boolean(_start && _end && _start <= _date && _date <= _end);
	};
	/**
	* Checks if a quarter is disabled based on the 'quarter' period type.
	* @param date - The date representing the quarter to check.
	* @param min - Minimum allowed date.
	* @param max - Maximum allowed date.
	* @param disabledDates - Criteria for disabled dates.
	* @returns True if the quarter is disabled, false otherwise.
	*/
	const isQuarterDisabled = (date, min, max, disabledDates) => {
		const current = dateToQuarterNumber(date);
		const _min = min ? dateToQuarterNumber(min) : null;
		const _max = max ? dateToQuarterNumber(max) : null;
		if (isOutsideRange(current, _min, _max)) return true;
		if (disabledDates === void 0) return false;
		const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
		const quarterEndMonth = quarterStartMonth + 2;
		const year = date.getFullYear();
		const quarterStart = new Date(year, quarterStartMonth, 1);
		const quarterEnd = new Date(year, quarterEndMonth + 1, 0);
		const startTime = min ? Math.max(quarterStart.getTime(), min.getTime()) : quarterStart.getTime();
		const endTime = max ? Math.min(quarterEnd.getTime(), max.getTime()) : quarterEnd.getTime();
		for (const currentDate = new Date(startTime); currentDate.getTime() <= endTime; currentDate.setDate(currentDate.getDate() + 1)) if (!isDateDisabled(currentDate, min, max, disabledDates)) return false;
		return false;
	};
	/**
	* Checks if a quarter is selected based on start and end dates.
	* @param date - The date representing the quarter.
	* @param start - Start date.
	* @param end - End date.
	* @returns True if the quarter is selected, false otherwise.
	*/
	const isQuarterSelected = (date, start, end) => {
		const year = date.getFullYear();
		const quarter = Math.floor(date.getMonth() / 3);
		if (start !== null) {
			const startYear = start.getFullYear();
			const startQuarter = Math.floor(start.getMonth() / 3);
			if (year === startYear && quarter === startQuarter) return true;
		}
		if (end !== null) {
			const endYear = end.getFullYear();
			const endQuarter = Math.floor(end.getMonth() / 3);
			if (year === endYear && quarter === endQuarter) return true;
		}
		return false;
	};
	/**
	* Checks if a quarter is within a specified range.
	* @param date - The date representing the quarter.
	* @param start - Start date.
	* @param end - End date.
	* @returns True if the quarter is within the range, false otherwise.
	*/
	const isQuarterInRange = (date, start, end) => {
		const _start = start ? dateToQuarterNumber(start) : null;
		const _end = end ? dateToQuarterNumber(end) : null;
		const _date = dateToQuarterNumber(date);
		return Boolean(_start && _end && _start <= _date && _date <= _end);
	};
	/**
	* Checks if two dates are the same calendar date.
	* @param date - First date.
	* @param date2 - Second date.
	* @returns True if both dates are the same, false otherwise.
	*/
	const isSameDateAs = (date, date2) => {
		if (date instanceof Date && date2 instanceof Date) return date.getDate() === date2.getDate() && date.getMonth() === date2.getMonth() && date.getFullYear() === date2.getFullYear();
		if (date === null && date2 === null) return true;
		return false;
	};
	/**
	* Checks if a date is today.
	* @param date - The date to check.
	* @returns True if the date is today, false otherwise.
	*/
	const isToday = (date) => {
		return isSameDateAs(date, /* @__PURE__ */ new Date());
	};
	/**
	* Checks if a year is disabled based on the 'year' period type.
	* @param date - The date representing the year to check.
	* @param min - Minimum allowed date.
	* @param max - Maximum allowed date.
	* @param disabledDates - Criteria for disabled dates.
	* @returns True if the year is disabled, false otherwise.
	*/
	const isYearDisabled = (date, min, max, disabledDates) => {
		const year = date.getFullYear();
		const minYear = min ? min.getFullYear() : null;
		const maxYear = max ? max.getFullYear() : null;
		if (isOutsideRange(year, minYear, maxYear)) return true;
		if (disabledDates === void 0) return false;
		const startTime = min ? Math.max(date.getTime(), min.getTime()) : date.getTime();
		const endTime = max ? Math.min(date.getTime(), max.getTime()) : new Date((/* @__PURE__ */ new Date()).getFullYear(), 11, 31).getTime();
		for (const currentDate = new Date(startTime); currentDate.getTime() <= endTime; currentDate.setDate(currentDate.getDate() + 1)) if (!isDateDisabled(currentDate, min, max, disabledDates)) return false;
		return false;
	};
	/**
	* Checks if a year is selected based on start and end dates.
	* @param date - The date representing the year.
	* @param start - Start date.
	* @param end - End date.
	* @returns True if the year matches the start's or end's year, false otherwise.
	*/
	const isYearSelected = (date, start, end) => {
		const year = date.getFullYear();
		if (start !== null && year === start.getFullYear()) return true;
		if (end !== null && year === end.getFullYear()) return true;
		return false;
	};
	/**
	* Checks if a year is within a specified range.
	* @param date - The date representing the year.
	* @param start - Start date.
	* @param end - End date.
	* @returns True if the year's value lies between start's year and end's year, false otherwise.
	*/
	const isYearInRange = (date, start, end) => {
		const year = date.getFullYear();
		const _start = start ? start.getFullYear() : null;
		const _end = end ? end.getFullYear() : null;
		return Boolean(_start && _end && _start <= year && year <= _end);
	};
	/**
	* Removes the time component from a Date object.
	* @param date - The original date.
	* @returns A new Date object with the time set to 00:00:00.
	*/
	const removeTimeFromDate = (date) => {
		const clearedDate = new Date(date);
		clearedDate.setHours(0, 0, 0, 0);
		return clearedDate;
	};
	/**
	* Copies the time (hours, minutes, seconds, milliseconds) from one Date to another.
	*
	* @param {Date} target - The date whose time will be updated.
	* @param {Date | null} source - The date to copy the time from.
	* @returns {Date} A new Date instance with the date from `target` and time from `source`.
	*/
	const setTimeFromDate = (target, source) => {
		if (target === null) return null;
		if (!(source instanceof Date)) return target;
		const result = new Date(target);
		result.setHours(source.getHours(), source.getMinutes(), source.getSeconds(), source.getMilliseconds());
		return result;
	};
	/**
	* Parses a year string with smart 2-digit handling.
	* @param yearString - The year string to parse.
	* @returns The parsed year as a number with intelligent century assignment.
	*/
	const parseYearSmart = (yearString) => {
		let parsedYear = Number.parseInt(yearString, 10);
		if (parsedYear < 100) {
			const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
			parsedYear = Math.floor(currentYear / 100) * 100 + parsedYear;
			if (parsedYear > currentYear + 50) parsedYear -= 100;
		}
		return parsedYear;
	};
	/**
	* Creates a date from year groups.
	* @param groups - The year groups containing year string.
	* @returns A Date object for January 1st of the year.
	*/
	const createDateFromYear = (groups) => {
		const { year } = groups;
		const parsedYear = parseYearSmart(year);
		return new Date(parsedYear, 0, 1);
	};
	//#endregion
	//#region js/src/calendar.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO calendar.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$38 = "calendar";
	const EVENT_KEY$30 = `.bs.calendar`;
	const DATA_API_KEY$27 = ".data-api";
	const DISALLOWED_ATTRIBUTES$5 = /* @__PURE__ */ new Set([
		"sanitize",
		"allowList",
		"sanitizeFn"
	]);
	const ARROW_UP_KEY$6 = "ArrowUp";
	const ARROW_RIGHT_KEY$7 = "ArrowRight";
	const ARROW_DOWN_KEY$7 = "ArrowDown";
	const ARROW_LEFT_KEY$7 = "ArrowLeft";
	const ENTER_KEY$3 = "Enter";
	const SPACE_KEY$3 = "Space";
	const HOME_KEY$6 = "Home";
	const END_KEY$6 = "End";
	const PAGE_UP_KEY = "PageUp";
	const PAGE_DOWN_KEY = "PageDown";
	const EVENT_BLUR = `blur${EVENT_KEY$30}`;
	const EVENT_CALENDAR_DATE_CHANGE = `calendarDateChange${EVENT_KEY$30}`;
	const EVENT_CALENDAR_MOUSE_LEAVE = `calendarMouseleave${EVENT_KEY$30}`;
	const EVENT_CALENDAR_VIEW_CHANGE = `calendarViewChange${EVENT_KEY$30}`;
	const EVENT_CELL_HOVER = `cellHover${EVENT_KEY$30}`;
	const EVENT_END_DATE_CHANGE$1 = `endDateChange${EVENT_KEY$30}`;
	const EVENT_FOCUS$1 = `focus${EVENT_KEY$30}`;
	const EVENT_KEYDOWN$8 = `keydown${EVENT_KEY$30}`;
	const EVENT_SELECT_END_CHANGE = `selectEndChange${EVENT_KEY$30}`;
	const EVENT_START_DATE_CHANGE$1 = `startDateChange${EVENT_KEY$30}`;
	const EVENT_MOUSEENTER$4 = `mouseenter${EVENT_KEY$30}`;
	const EVENT_MOUSELEAVE$3 = `mouseleave${EVENT_KEY$30}`;
	const EVENT_LOAD_DATA_API$20 = `load${EVENT_KEY$30}${DATA_API_KEY$27}`;
	const EVENT_CLICK_DATA_API$15 = `click${EVENT_KEY$30}${DATA_API_KEY$27}`;
	const CLASS_NAME_CALENDAR_CELL = "calendar-cell";
	const CLASS_NAME_CALENDAR_CELL_INNER = "calendar-cell-inner";
	const CLASS_NAME_CALENDAR_ROW = "calendar-row";
	const CLASS_NAME_CALENDARS$3 = "calendars";
	const CLASS_NAME_SHOW_WEEK_NUMBERS = "show-week-numbers";
	const SELECTOR_BTN_DOUBLE_NEXT = ".btn-double-next";
	const SELECTOR_BTN_DOUBLE_PREV = ".btn-double-prev";
	const SELECTOR_BTN_MONTH = ".btn-month";
	const SELECTOR_BTN_NEXT = ".btn-next";
	const SELECTOR_BTN_PREV = ".btn-prev";
	const SELECTOR_BTN_YEAR = ".btn-year";
	const SELECTOR_CALENDAR = ".calendar";
	const SELECTOR_CALENDAR_CELL = ".calendar-cell";
	const SELECTOR_CALENDAR_CELL_CLICKABLE = `${SELECTOR_CALENDAR_CELL}[tabindex="0"]`;
	const SELECTOR_CALENDAR_ROW = ".calendar-row";
	const SELECTOR_CALENDAR_ROW_CLICKABLE = `${SELECTOR_CALENDAR_ROW}[tabindex="0"]`;
	const SELECTOR_DATA_TOGGLE$22 = "[data-bs-toggle=\"calendar\"]";
	const Default$38 = {
		allowList: SVGAllowlist,
		ariaNavNextMonthLabel: "Next month",
		ariaNavNextYearLabel: "Next year",
		ariaNavPrevMonthLabel: "Previous month",
		ariaNavPrevYearLabel: "Previous year",
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
		navIconDoubleNext: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" role=\"img\" fill=\"currentColor\"><polygon points=\"95.314 447.313 72.686 424.687 245.373 252 72.686 79.313 95.314 56.687 290.627 252 95.314 447.313\"></polygon><polygon points=\"255.314 447.313 232.686 424.687 405.373 252 232.686 79.313 255.314 56.687 450.627 252 255.314 447.313\"></polygon></svg>",
		navIconDoublePrev: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" role=\"img\" fill=\"currentColor\"><polygon points=\"416.686 447.313 221.373 252 416.686 56.687 439.314 79.313 266.627 252 439.314 424.687 416.686 447.313\"></polygon><polygon points=\"256.686 447.313 61.373 252 256.686 56.687 279.314 79.313 106.627 252 279.314 424.687 256.686 447.313\"></polygon></svg>",
		navIconNext: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" role=\"img\" fill=\"currentColor\"><polygon points=\"179.313 451.313 156.687 428.687 329.372 256 156.687 83.313 179.313 60.687 374.627 256 179.313 451.313\"></polygon></svg>",
		navIconPrev: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" role=\"img\" fill=\"currentColor\"><polygon points=\"324.687 451.313 129.373 256 324.687 60.687 347.313 83.313 174.628 256 347.313 428.687 324.687 451.313\"></polygon></svg>",
		range: false,
		renderDayCell: null,
		renderMonthCell: null,
		renderQuarterCell: null,
		renderYearCell: null,
		sanitize: true,
		sanitizeFn: null,
		selectAdjacementDays: false,
		selectEndDate: false,
		selectionType: "day",
		showAdjacementDays: true,
		showWeekNumber: false,
		startDate: null,
		weekdayFormat: 2,
		weekNumbersLabel: null,
		yearFormat: "numeric"
	};
	const DefaultType$37 = {
		allowList: "object",
		ariaNavNextMonthLabel: "string",
		ariaNavNextYearLabel: "string",
		ariaNavPrevMonthLabel: "string",
		ariaNavPrevYearLabel: "string",
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
		navIconDoubleNext: "string",
		navIconDoublePrev: "string",
		navIconNext: "string",
		navIconPrev: "string",
		range: "boolean",
		renderDayCell: "(function|null)",
		renderMonthCell: "(function|null)",
		renderQuarterCell: "(function|null)",
		renderYearCell: "(function|null)",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		selectAdjacementDays: "boolean",
		selectEndDate: "boolean",
		selectionType: "string",
		showAdjacementDays: "boolean",
		showWeekNumber: "boolean",
		startDate: "(date|number|string|null)",
		weekdayFormat: "(number|string)",
		weekNumbersLabel: "(string|null)",
		yearFormat: "string"
	};
	/**
	* Class definition
	*/
	var Calendar = class Calendar extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._initializeDates();
			this._initializeView();
			this._createCalendar();
			this._addEventListeners();
		}
		static get Default() {
			return Default$38;
		}
		static get DefaultType() {
			return DefaultType$37;
		}
		static get NAME() {
			return NAME$38;
		}
		update(config) {
			this._config = this._getConfig({
				...this._config,
				...config
			});
			this._initializeDates();
			this._initializeView();
			this._element.innerHTML = "";
			this._createCalendar();
		}
		refresh() {
			this._element.innerHTML = "";
			this._createCalendar();
		}
		_focusOnFirstAvailableCell() {
			const cell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL_CLICKABLE, this._element);
			if (cell) cell.focus();
		}
		_focusOnDate(date) {
			const focusables = SelectorEngine.find(this._config.selectionType === "week" ? SELECTOR_CALENDAR_ROW_CLICKABLE : SELECTOR_CALENDAR_CELL_CLICKABLE, this._element).filter((element) => !element.classList.contains("previous") && !element.classList.contains("next"));
			let closest = null;
			let closestGap = Number.POSITIVE_INFINITY;
			for (const element of focusables) {
				const gap = Math.abs(this._getDate(element).getTime() - date.getTime());
				if (gap < closestGap) {
					closest = element;
					closestGap = gap;
				}
			}
			closest?.focus();
		}
		_getDate(target) {
			if (this._config.selectionType === "week") {
				const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, target.closest(SELECTOR_CALENDAR_ROW));
				return new Date(Manipulator.getDataAttribute(firstCell, "date"));
			}
			return new Date(Manipulator.getDataAttribute(target, "date"));
		}
		_handleCalendarClick(event) {
			const target = event.target.closest(SELECTOR_CALENDAR_CELL);
			const date = this._getDate(target);
			const cloneDate = new Date(date);
			const index = Manipulator.getDataAttribute(target.closest(SELECTOR_CALENDAR), "calendar-index");
			if (this._view === "days") this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date);
			if (this._view === "months" && this._config.selectionType !== "month") {
				this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date, "days");
				this._setCalendarView("days", "cellClick");
				this._updateCalendar(this._focusOnFirstAvailableCell.bind(this));
				return;
			}
			if (this._view === "years" && this._config.selectionType !== "year") {
				this._setCalendarDate(index ? new Date(cloneDate.setFullYear(cloneDate.getFullYear() - index)) : date, "months");
				this._setCalendarView(this._config.selectionType === "quarter" ? "quarters" : "months", "cellClick");
				this._updateCalendar(this._focusOnFirstAvailableCell.bind(this));
				return;
			}
			if (isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)) return;
			this._hoverDate = null;
			this._selectDate(date);
			this._updateClassNamesAndAriaLabels();
		}
		_handleCalendarKeydown(event) {
			const date = this._getDate(event.target);
			if (event.code === SPACE_KEY$3 || event.key === ENTER_KEY$3) {
				event.preventDefault();
				this._handleCalendarClick(event);
			}
			if (event.key === HOME_KEY$6 || event.key === END_KEY$6) {
				event.preventDefault();
				const cells = SelectorEngine.find(SELECTOR_CALENDAR_CELL_CLICKABLE, event.target.closest("tr"));
				(event.key === HOME_KEY$6 ? cells[0] : cells[cells.length - 1])?.focus();
				return;
			}
			if (event.key === PAGE_UP_KEY || event.key === PAGE_DOWN_KEY) {
				event.preventDefault();
				const direction = event.key === PAGE_DOWN_KEY ? 1 : -1;
				const target = new Date(date);
				if (this._view === "days") {
					const day = target.getDate();
					target.setDate(1);
					if (event.shiftKey) target.setFullYear(target.getFullYear() + direction);
					else target.setMonth(target.getMonth() + direction);
					target.setDate(Math.min(day, new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()));
				} else target.setFullYear(target.getFullYear() + (this._view === "years" ? 10 : 1) * direction);
				if (this._maxDate && target > this._maxDate) target.setTime(this._maxDate.getTime());
				if (this._minDate && target < this._minDate) target.setTime(this._minDate.getTime());
				if (target.getTime() === date.getTime()) return;
				const monthsDelta = (target.getFullYear() - date.getFullYear()) * 12 + (target.getMonth() - date.getMonth());
				this._modifyCalendarDate(0, monthsDelta, () => this._focusOnDate(target));
				return;
			}
			if (event.key === ARROW_RIGHT_KEY$7 || event.key === ARROW_LEFT_KEY$7 || event.key === ARROW_UP_KEY$6 || event.key === ARROW_DOWN_KEY$7) {
				event.preventDefault();
				if (this._maxDate && date >= convertToDateObject(this._maxDate, this._config.selectionType) && (event.key === ARROW_RIGHT_KEY$7 || event.key === ARROW_DOWN_KEY$7)) return;
				if (this._minDate && date <= convertToDateObject(this._minDate, this._config.selectionType) && (event.key === ARROW_LEFT_KEY$7 || event.key === ARROW_UP_KEY$6)) return;
				let element = event.target;
				if (this._config.selectionType === "week" && element.tabIndex === -1) element = element.closest(SELECTOR_CALENDAR_ROW_CLICKABLE);
				const list = SelectorEngine.find(this._config.selectionType === "week" ? SELECTOR_CALENDAR_ROW_CLICKABLE : SELECTOR_CALENDAR_CELL_CLICKABLE, this._element);
				const index = list.indexOf(element);
				const first = index === 0;
				const last = index === list.length - 1;
				const toBoundary = {
					start: index,
					end: list.length - (index + 1)
				};
				const gap = {
					ArrowRight: 1,
					ArrowLeft: -1,
					ArrowUp: this._config.selectionType === "week" && this._view === "days" ? -1 : this._view === "days" ? -7 : -3,
					ArrowDown: this._config.selectionType === "week" && this._view === "days" ? 1 : this._view === "days" ? 7 : 3
				};
				if (event.key === ARROW_RIGHT_KEY$7 && last || event.key === ARROW_DOWN_KEY$7 && toBoundary.end < gap.ArrowDown || event.key === ARROW_LEFT_KEY$7 && first || event.key === ARROW_UP_KEY$6 && toBoundary.start < Math.abs(gap.ArrowUp)) {
					const callback = (key) => {
						const _list = SelectorEngine.find(`${SELECTOR_CALENDAR_CELL_CLICKABLE}, ${SELECTOR_CALENDAR_ROW_CLICKABLE}`, this._element);
						if (_list.length && key === ARROW_RIGHT_KEY$7) _list[0].focus();
						if (_list.length && key === ARROW_LEFT_KEY$7) _list[_list.length - 1].focus();
						if (_list.length && key === ARROW_DOWN_KEY$7) _list[gap.ArrowDown - (list.length - index)].focus();
						if (_list.length && key === ARROW_UP_KEY$6) _list[_list.length - (Math.abs(gap.ArrowUp) + 1 - (index + 1))].focus();
					};
					if (this._view === "days") this._modifyCalendarDate(0, event.key === ARROW_RIGHT_KEY$7 || event.key === ARROW_DOWN_KEY$7 ? 1 : -1, callback.bind(this, event.key));
					if (this._view === "months" || this._view === "quarters") this._modifyCalendarDate(event.key === ARROW_RIGHT_KEY$7 || event.key === ARROW_DOWN_KEY$7 ? 1 : -1, 0, callback.bind(this, event.key));
					if (this._view === "years") this._modifyCalendarDate(event.key === ARROW_RIGHT_KEY$7 || event.key === ARROW_DOWN_KEY$7 ? 10 : -10, 0, callback.bind(this, event.key));
					return;
				}
				if (list[index + gap[event.key]].tabIndex === 0) {
					list[index + gap[event.key]].focus();
					return;
				}
				for (let i = index; i < list.length; event.key === ARROW_RIGHT_KEY$7 || event.key === ARROW_DOWN_KEY$7 ? i++ : i--) if (list[i + gap[event.key]].tabIndex === 0) {
					list[i + gap[event.key]].focus();
					break;
				}
			}
		}
		_handleCalendarMouseEnter(event) {
			const target = event.target.closest(SELECTOR_CALENDAR_CELL) ?? event.target.closest(SELECTOR_CALENDAR_ROW);
			if (!target) return;
			const date = this._getDate(target);
			if (isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)) return;
			this._hoverDate = setTimeFromDate(date, this._selectEndDate ? this._endDate : this._startDate);
			EventHandler.trigger(this._element, EVENT_CELL_HOVER, { date: getDateBySelectionType(this._hoverDate, this._config.selectionType) });
			this._updateClassNamesAndAriaLabels();
		}
		_handleCalendarMouseLeave() {
			this._hoverDate = null;
			EventHandler.trigger(this._element, EVENT_CELL_HOVER, { date: null });
			this._updateClassNamesAndAriaLabels();
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$15, SELECTOR_CALENDAR_CELL_CLICKABLE, (event) => {
				this._handleCalendarClick(event);
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$8, SELECTOR_CALENDAR_CELL_CLICKABLE, (event) => {
				this._handleCalendarKeydown(event);
			});
			EventHandler.on(this._element, EVENT_MOUSEENTER$4, SELECTOR_CALENDAR_CELL_CLICKABLE, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			EventHandler.on(this._element, EVENT_MOUSELEAVE$3, SELECTOR_CALENDAR_CELL_CLICKABLE, () => {
				this._handleCalendarMouseLeave();
			});
			EventHandler.on(this._element, EVENT_FOCUS$1, SELECTOR_CALENDAR_CELL_CLICKABLE, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			EventHandler.on(this._element, EVENT_BLUR, SELECTOR_CALENDAR_CELL_CLICKABLE, () => {
				this._handleCalendarMouseLeave();
			});
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$15, SELECTOR_CALENDAR_ROW_CLICKABLE, (event) => {
				this._handleCalendarClick(event);
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$8, SELECTOR_CALENDAR_ROW_CLICKABLE, (event) => {
				this._handleCalendarKeydown(event);
			});
			EventHandler.on(this._element, EVENT_MOUSEENTER$4, SELECTOR_CALENDAR_ROW_CLICKABLE, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			EventHandler.on(this._element, EVENT_MOUSELEAVE$3, SELECTOR_CALENDAR_ROW_CLICKABLE, () => {
				this._handleCalendarMouseLeave();
			});
			EventHandler.on(this._element, EVENT_FOCUS$1, SELECTOR_CALENDAR_ROW_CLICKABLE, (event) => {
				this._handleCalendarMouseEnter(event);
			});
			EventHandler.on(this._element, EVENT_BLUR, SELECTOR_CALENDAR_ROW_CLICKABLE, () => {
				this._handleCalendarMouseLeave();
			});
			this._addNavigationEventListeners();
			EventHandler.on(this._element, EVENT_MOUSELEAVE$3, "table", () => {
				EventHandler.trigger(this._element, EVENT_CALENDAR_MOUSE_LEAVE);
			});
		}
		_addNavigationEventListeners() {
			const navigationSelectors = {
				[SELECTOR_BTN_PREV]: () => this._modifyCalendarDate(0, -1),
				[SELECTOR_BTN_DOUBLE_PREV]: () => this._modifyCalendarDate(this._view === "years" ? -10 : -1),
				[SELECTOR_BTN_NEXT]: () => this._modifyCalendarDate(0, 1),
				[SELECTOR_BTN_DOUBLE_NEXT]: () => this._modifyCalendarDate(this._view === "years" ? 10 : 1),
				[SELECTOR_BTN_MONTH]: () => {
					this._setCalendarView("months", "navigation");
					this._updateCalendar();
				},
				[SELECTOR_BTN_YEAR]: () => {
					this._setCalendarView("years", "navigation");
					this._updateCalendar();
				}
			};
			for (const [selector, handler] of Object.entries(navigationSelectors)) EventHandler.on(this._element, EVENT_CLICK_DATA_API$15, selector, (event) => {
				event.preventDefault();
				const selectorIndex = SelectorEngine.find(selector, this._element).indexOf(event.target.closest(selector));
				handler();
				const _selectors = SelectorEngine.find(selector, this._element);
				if (_selectors && _selectors[selectorIndex]) _selectors[selectorIndex].focus();
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
		_modifyCalendarDate(years, months = 0, callback) {
			const year = this._calendarDate.getFullYear();
			const month = this._calendarDate.getMonth();
			const d = new Date(year, month, 1);
			if (years) d.setFullYear(d.getFullYear() + years);
			if (months) d.setMonth(d.getMonth() + months);
			this._calendarDate = d;
			EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
				date: d,
				view: this._view
			});
			this._updateCalendar(callback);
		}
		_setEndDate(date) {
			this._endDate = setTimeFromDate(date, this._endDate);
			EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE$1, {
				date: getDateBySelectionType(this._endDate, this._config.selectionType),
				dateObject: this._endDate
			});
		}
		_setStartDate(date) {
			this._startDate = setTimeFromDate(date, this._startDate);
			EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE$1, {
				date: getDateBySelectionType(this._startDate, this._config.selectionType),
				dateObject: this._startDate
			});
		}
		_setSelectEndDate(value) {
			this._selectEndDate = value;
			EventHandler.trigger(this._element, EVENT_SELECT_END_CHANGE, { value });
		}
		_selectDate(date) {
			if (isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)) return;
			if (this._config.range) {
				if (this._selectEndDate) {
					if (this._startDate && this._startDate > date) {
						this._setStartDate(date);
						this._setEndDate(null);
						return;
					}
					this._setSelectEndDate(false);
					if (isDisableDateInRange(this._startDate, date, this._config.disabledDates)) {
						this._setStartDate(null);
						this._setEndDate(null);
						return;
					}
					this._setEndDate(date);
					return;
				}
				if (this._endDate && this._endDate < date) {
					this._setStartDate(date);
					this._setEndDate(null);
					this._setSelectEndDate(true);
					return;
				}
				if (isDisableDateInRange(date, this._endDate, this._config.disabledDates)) {
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
			const calendarDate = getCalendarDate(this._calendarDate, order, this._view);
			const year = calendarDate.getFullYear();
			const month = calendarDate.getMonth();
			const calendarPanelEl = document.createElement("div");
			calendarPanelEl.classList.add("calendar");
			Manipulator.setDataAttribute(calendarPanelEl, "calendar-index", order);
			const navigationElement = document.createElement("div");
			navigationElement.classList.add("calendar-nav");
			navigationElement.innerHTML = `
      <div class="calendar-nav-prev">
        <button type="button" class="calendar-nav-btn btn-double-prev" aria-label="${escapeHtml(this._config.ariaNavPrevYearLabel)}">
          <span class="calendar-nav-icon">${this._navIcon("navIconDoublePrev")}</span>
        </button>
        ${this._view === "days" ? `<button type="button" class="calendar-nav-btn btn-prev" aria-label="${escapeHtml(this._config.ariaNavPrevMonthLabel)}">
          <span class="calendar-nav-icon">${this._navIcon("navIconPrev")}</span>
        </button>` : ""}
      </div>
      <div class="calendar-nav-date" aria-live="polite">
        ${this._view === "days" ? `<button type="button" class="calendar-nav-btn btn-sm btn-month">
          ${calendarDate.toLocaleDateString(this._config.locale, { month: "long" })}
        </button>` : ""}
        <button type="button" class="calendar-nav-btn btn-year">
          ${calendarDate.toLocaleDateString(this._config.locale, { year: "numeric" })}
        </button>
      </div>
      <div class="calendar-nav-next">
        ${this._view === "days" ? `<button type="button" class="calendar-nav-btn btn-next" aria-label="${escapeHtml(this._config.ariaNavNextMonthLabel)}">
          <span class="calendar-nav-icon">${this._navIcon("navIconNext")}</span>
        </button>` : ""}
        <button type="button" class="calendar-nav-btn btn-double-next" aria-label="${escapeHtml(this._config.ariaNavNextYearLabel)}">
          <span class="calendar-nav-icon">${this._navIcon("navIconDoubleNext")}</span>
        </button>
      </div>
    `;
			const monthDetails = getMonthDetails(year, month, this._config.firstDayOfWeek);
			const listOfMonths = createGroupsInArray(getMonthsNames(this._config.locale, this._config.monthFormat), 4);
			const listOfYears = createGroupsInArray(getYears(calendarDate.getFullYear()), 4);
			const weekDays = monthDetails[0].days;
			const calendarTable = document.createElement("table");
			calendarTable.innerHTML = `
    ${this._view === "days" ? `
      <thead>
        <tr>
          ${this._config.showWeekNumber ? `<th class="${CLASS_NAME_CALENDAR_CELL}">
              <div class="calendar-header-cell-inner">
               ${this._config.weekNumbersLabel ? escapeHtml(this._config.weekNumbersLabel) : ""}
              </div>
            </th>` : ""}
          ${weekDays.map(({ date }) => `<th class="${CLASS_NAME_CALENDAR_CELL}" abbr="${date.toLocaleDateString(this._config.locale, { weekday: "long" })}">
              <div class="calendar-header-cell-inner">
              ${typeof this._config.weekdayFormat === "string" ? date.toLocaleDateString(this._config.locale, { weekday: this._config.weekdayFormat }) : date.toLocaleDateString(this._config.locale, { weekday: "long" }).slice(0, this._config.weekdayFormat)}
              </div>
            </th>`).join("")}
        </tr>
      </thead>` : ""}
      <tbody>
        ${this._view === "days" ? monthDetails.map(({ week, days }) => {
				const { date } = days[0];
				const rowAttributes = this._rowWeekAttributes(date);
				return `<tr 
              class="${rowAttributes.className}"
              tabindex="${rowAttributes.tabIndex}"
              ${rowAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
            >
              ${this._config.showWeekNumber ? `<th class="calendar-cell-week-number">${week.number}</td>` : ""}
              ${days.map(({ date, month }) => {
					const cellAttributes = this._cellDayAttributes(date, month);
					return month === "current" || this._config.showAdjacementDays ? `<td
                    class="${cellAttributes.className}"
                    tabindex="${cellAttributes.tabIndex}"
                    ${cellAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
                    ${cellAttributes.ariaCurrent ? "aria-current=\"date\"" : ""}
                    aria-label="${escapeHtml(cellAttributes.ariaLabel)}"
                    data-bs-date="${date}"
                  >
                    <div class="${CLASS_NAME_CALENDAR_CELL_INNER} day">
                      ${this._config.renderDayCell ? this._sanitizeHtml(this._config.renderDayCell(date, cellAttributes.meta)) : date.toLocaleDateString(this._config.locale, { day: this._config.dayFormat })}
                    </div>
                  </td>` : "<td></td>";
				}).join("")}</tr>`;
			}).join("") : ""}
        ${this._view === "months" ? listOfMonths.map((row, index) => `<tr>
            ${row.map((month, idx) => {
				const date = new Date(calendarDate.getFullYear(), index * 3 + idx, 1);
				const cellAttributes = this._cellMonthAttributes(date);
				return `<td
                  class="${cellAttributes.className}"
                  tabindex="${cellAttributes.tabIndex}"
                  ${cellAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
                  data-bs-date="${date.toDateString()}"
                >
                  <div class="${CLASS_NAME_CALENDAR_CELL_INNER} month">
                    ${this._config.renderMonthCell ? this._sanitizeHtml(this._config.renderMonthCell(date, cellAttributes.meta)) : month}
                  </div>
                </td>`;
			}).join("")}
          </tr>`).join("") : ""}
        ${this._view === "quarters" ? `<tr>
            ${Array.from({ length: 4 }, (_, index) => {
				const date = new Date(calendarDate.getFullYear(), index * 3, 1);
				const cellAttributes = this._cellQuarterAttributes(date);
				return `<td
                  class="${cellAttributes.className}"
                  tabindex="${cellAttributes.tabIndex}"
                  ${cellAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
                  data-bs-date="${date.toDateString()}"
                >
                  <div class="${CLASS_NAME_CALENDAR_CELL_INNER} quarter">
                    ${this._config.renderQuarterCell ? this._sanitizeHtml(this._config.renderQuarterCell(date, cellAttributes.meta)) : `Q${index + 1}`}
                  </div>
                </td>`;
			}).join("")}
          </tr>` : ""}
        ${this._view === "years" ? listOfYears.map((row) => `<tr>
            ${row.map((year) => {
				const date = new Date(year, 0, 1);
				const cellAttributes = this._cellYearAttributes(date);
				return `<td
                  class="${cellAttributes.className}"
                  tabindex="${cellAttributes.tabIndex}"
                  ${cellAttributes.ariaSelected ? "aria-selected=\"true\"" : ""}
                  data-bs-date="${date.toDateString()}"
                >
                  <div class="${CLASS_NAME_CALENDAR_CELL_INNER} year">
                    ${this._config.renderYearCell ? this._sanitizeHtml(this._config.renderYearCell(date, cellAttributes.meta)) : date.toLocaleDateString(this._config.locale, { year: this._config.yearFormat })}
                  </div>
                </td>`;
			}).join("")}
          </tr>`).join("") : ""}
      </tbody>
    `;
			calendarPanelEl.append(navigationElement, calendarTable);
			return calendarPanelEl;
		}
		_createCalendar() {
			if (this._config.selectionType && this._view === "days") this._element.classList.add(`select-${this._config.selectionType}`);
			if (this._config.showWeekNumber) this._element.classList.add(CLASS_NAME_SHOW_WEEK_NUMBERS);
			for (const [index, _] of Array.from({ length: this._config.calendars }).entries()) this._element.append(this._createCalendarPanel(index));
			this._element.classList.add(CLASS_NAME_CALENDARS$3);
		}
		_initializeDates() {
			this._calendarDate = convertToDateObject(this._config.calendarDate || this._config.startDate || this._config.endDate, this._config.selectionType) || /* @__PURE__ */ new Date();
			this._startDate = convertToDateObject(this._config.startDate, this._config.selectionType);
			this._endDate = convertToDateObject(this._config.endDate, this._config.selectionType);
			this._minDate = convertToDateObject(this._config.minDate, this._config.selectionType);
			this._maxDate = convertToDateObject(this._config.maxDate, this._config.selectionType);
			this._hoverDate = null;
			this._selectEndDate = this._config.selectEndDate;
		}
		_initializeView() {
			const viewMap = {
				day: "days",
				week: "days",
				month: "months",
				quarter: "quarters",
				year: "years"
			};
			this._view = viewMap[this._config.selectionType] || "days";
		}
		_updateCalendar(callback) {
			this._element.innerHTML = "";
			this._createCalendar();
			if (callback) setTimeout(callback, 1);
		}
		_updateClassNamesAndAriaLabels() {
			if (this._config.selectionType === "week") {
				const rows = SelectorEngine.find(SELECTOR_CALENDAR_ROW, this._element);
				for (const row of rows) {
					const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, row);
					const date = new Date(Manipulator.getDataAttribute(firstCell, "date"));
					const rowAttributes = this._rowWeekAttributes(date);
					row.className = rowAttributes.className;
					row.tabIndex = rowAttributes.tabIndex;
					if (rowAttributes.ariaSelected) row.setAttribute("aria-selected", true);
					else row.removeAttribute("aria-selected");
				}
				return;
			}
			const cells = SelectorEngine.find(SELECTOR_CALENDAR_CELL_CLICKABLE, this._element);
			for (const cell of cells) {
				const date = new Date(Manipulator.getDataAttribute(cell, "date"));
				let cellAttributes;
				switch (this._view) {
					case "days":
						cellAttributes = this._cellDayAttributes(date, "current");
						break;
					case "months":
						cellAttributes = this._cellMonthAttributes(date);
						break;
					case "quarters":
						cellAttributes = this._cellQuarterAttributes(date);
						break;
					default: cellAttributes = this._cellYearAttributes(date);
				}
				cell.className = cellAttributes.className;
				cell.tabIndex = cellAttributes.tabIndex;
				if (cellAttributes.ariaSelected) cell.setAttribute("aria-selected", true);
				else cell.removeAttribute("aria-selected");
			}
		}
		_classNames(classNames) {
			return Object.entries(classNames).filter(([_, value]) => Boolean(value)).map(([key]) => key).join(" ");
		}
		_cellDayAttributes(date, month) {
			const isCurrentMonth = month === "current";
			const isDisabled = isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = isDateSelected(date, this._startDate, this._endDate);
			const isTodayDate = isToday(date);
			if (this._config.selectionType !== "day" || this._view !== "days") return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					today: isTodayDate,
					[month]: true
				}),
				tabIndex: -1,
				ariaSelected: false,
				ariaLabel: date.toLocaleDateString(this._config.locale),
				ariaCurrent: isTodayDate
			};
			const isInRange = isCurrentMonth && isDateInRange(date, this._startDate, this._endDate);
			const isRangeHover = isCurrentMonth && this._hoverDate && (this._selectEndDate ? isDateInRange(date, this._startDate, this._hoverDate) : isDateInRange(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					clickable: !isCurrentMonth && this._config.selectAdjacementDays,
					disabled: isDisabled,
					range: isInRange,
					"range-hover": isRangeHover,
					selected: isSelected,
					today: isTodayDate,
					[month]: true
				}),
				tabIndex: (isCurrentMonth || this._config.selectAdjacementDays) && !isDisabled ? 0 : -1,
				ariaSelected: isSelected,
				ariaLabel: date.toLocaleDateString(this._config.locale),
				ariaCurrent: isTodayDate,
				meta: {
					isDisabled,
					isInCurrentMonth: isCurrentMonth,
					isInRange,
					isSelected,
					isToday: isTodayDate
				}
			};
		}
		_cellMonthAttributes(date) {
			const isDisabled = isMonthDisabled(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = isMonthSelected(date, this._startDate, this._endDate);
			const isInRange = isMonthInRange(date, this._startDate, this._endDate);
			const isRangeHover = this._config.selectionType === "month" && this._hoverDate && (this._selectEndDate ? isMonthInRange(date, this._startDate, this._hoverDate) : isMonthInRange(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					disabled: isDisabled,
					"range-hover": isRangeHover,
					range: isInRange,
					selected: isSelected
				}),
				tabIndex: isDisabled ? -1 : 0,
				ariaSelected: isSelected,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_cellQuarterAttributes(date) {
			const isDisabled = isQuarterDisabled(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = isQuarterSelected(date, this._startDate, this._endDate);
			const isInRange = isQuarterInRange(date, this._startDate, this._endDate);
			const isRangeHover = this._config.selectionType === "quarter" && this._hoverDate && (this._selectEndDate ? isQuarterInRange(date, this._startDate, this._hoverDate) : isQuarterInRange(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					disabled: isDisabled,
					"range-hover": isRangeHover,
					range: isInRange,
					selected: isSelected
				}),
				tabIndex: isDisabled ? -1 : 0,
				ariaSelected: isSelected,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_cellYearAttributes(date) {
			const isDisabled = isYearDisabled(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = isYearSelected(date, this._startDate, this._endDate);
			const isInRange = isYearInRange(date, this._startDate, this._endDate);
			const isRangeHover = this._config.selectionType === "year" && this._hoverDate && (this._selectEndDate ? isYearInRange(date, this._startDate, this._hoverDate) : isYearInRange(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_CELL]: true,
					disabled: isDisabled,
					"range-hover": isRangeHover,
					range: isInRange,
					selected: isSelected
				}),
				tabIndex: isDisabled ? -1 : 0,
				ariaSelected: isSelected,
				meta: {
					isDisabled,
					isInRange,
					isSelected
				}
			};
		}
		_rowWeekAttributes(date) {
			if (this._config.selectionType !== "week") return {
				className: this._classNames({ [CLASS_NAME_CALENDAR_ROW]: true }),
				tabIndex: -1,
				ariaSelected: false
			};
			const isDisabled = isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates);
			const isSelected = isDateSelected(date, this._startDate, this._endDate);
			const isInRange = isDateInRange(date, this._startDate, this._endDate);
			const isRangeHover = this._hoverDate && (this._selectEndDate ? isYearInRange(date, this._startDate, this._hoverDate) : isYearInRange(date, this._hoverDate, this._endDate));
			return {
				className: this._classNames({
					[CLASS_NAME_CALENDAR_ROW]: true,
					disabled: isDisabled,
					range: isInRange,
					"range-hover": isRangeHover,
					selected: isSelected
				}),
				tabIndex: isDisabled ? -1 : 0,
				ariaSelected: isSelected
			};
		}
		_isRtl() {
			if (this._element.isConnected) return window.getComputedStyle(this._element).direction === "rtl";
			return (this._element.closest("[dir]")?.dir ?? document.documentElement.dir) === "rtl";
		}
		_navIcon(name) {
			return this._sanitizeHtml(this._config[this._isRtl() ? {
				navIconDoubleNext: "navIconDoublePrev",
				navIconDoublePrev: "navIconDoubleNext",
				navIconNext: "navIconPrev",
				navIconPrev: "navIconNext"
			}[name] : name]);
		}
		_sanitizeHtml(html) {
			if (this._config.sanitize) return sanitizeHtml(html, this._config.allowList, this._config.sanitizeFn);
			return html;
		}
		_getConfig(config) {
			const dataAttributes = Manipulator.getDataAttributes(this._element);
			for (const dataAttribute of Object.keys(dataAttributes)) if (DISALLOWED_ATTRIBUTES$5.has(dataAttribute)) delete dataAttributes[dataAttribute];
			config = {
				...dataAttributes,
				...typeof config === "object" && config ? config : {}
			};
			config = this._mergeConfigObj(config);
			config = this._configAfterMerge(config);
			this._typeCheckConfig(config);
			return config;
		}
		static calendarInterface(element, config) {
			const data = Calendar.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Calendar.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$20, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_TOGGLE$22))) Calendar.calendarInterface(element);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Calendar);
	//#endregion
	//#region js/src/carousel.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI carousel.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's carousel.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$37 = "carousel";
	const EVENT_KEY$29 = `.bs.carousel`;
	const DATA_API_KEY$26 = ".data-api";
	const ARROW_LEFT_KEY$6 = "ArrowLeft";
	const ARROW_RIGHT_KEY$6 = "ArrowRight";
	const DIRECTION_LEFT = "left";
	const DIRECTION_RIGHT = "right";
	const EVENT_SLIDE = `slide${EVENT_KEY$29}`;
	const EVENT_SLID = `slid${EVENT_KEY$29}`;
	const EVENT_KEYDOWN$7 = `keydown${EVENT_KEY$29}`;
	const EVENT_MOUSEENTER$3 = `mouseenter${EVENT_KEY$29}`;
	const EVENT_MOUSELEAVE$2 = `mouseleave${EVENT_KEY$29}`;
	const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$29}`;
	const EVENT_LOAD_DATA_API$19 = `load${EVENT_KEY$29}${DATA_API_KEY$26}`;
	const EVENT_CLICK_DATA_API$14 = `click${EVENT_KEY$29}${DATA_API_KEY$26}`;
	const CLASS_NAME_CAROUSEL = "carousel";
	const CLASS_NAME_ACTIVE$7 = "active";
	const CLASS_NAME_FADE$1 = "carousel-fade";
	const CLASS_NAME_CENTER = "carousel-center";
	const CLASS_NAME_AUTO = "carousel-auto";
	const CLASS_NAME_CLONE = "carousel-item-clone";
	const CLASS_NAME_PAUSED = "paused";
	const CLASS_NAME_PLAYING = "carousel-playing";
	const PROPERTY_INTERVAL = "--bs-carousel-interval";
	const SCROLL_DURATION = 300;
	const ACTIVE_RATIO_TOLERANCE = .05;
	const SELECTOR_ACTIVE = ".active";
	const SELECTOR_ITEM = `.carousel-item:not(.${CLASS_NAME_CLONE})`;
	const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
	const SELECTOR_INNER$1 = ".carousel-inner";
	const SELECTOR_INDICATORS = ".carousel-indicators";
	const SELECTOR_PLAY_PAUSE = ".carousel-control-play-pause";
	const SELECTOR_DATA_SLIDE = "[data-bs-slide], [data-bs-slide-to]";
	const SELECTOR_DATA_SLIDE_PREV = "[data-bs-slide=\"prev\"]";
	const SELECTOR_DATA_SLIDE_NEXT = "[data-bs-slide=\"next\"]";
	const SELECTOR_DATA_AUTOPLAY = "[data-bs-autoplay=\"true\"]";
	const KEY_TO_DIRECTION = {
		[ARROW_LEFT_KEY$6]: DIRECTION_RIGHT,
		[ARROW_RIGHT_KEY$6]: DIRECTION_LEFT
	};
	const ENDS_STOP = "stop";
	const ENDS_WRAP = "wrap";
	const ENDS_LOOP = "loop";
	const Default$37 = {
		autoplay: false,
		ends: ENDS_LOOP,
		interval: 5e3,
		keyboard: true,
		pause: "hover"
	};
	const DefaultType$36 = {
		autoplay: "boolean",
		ends: "string",
		interval: "number",
		keyboard: "boolean",
		pause: "(string|boolean)"
	};
	const easeInOutCubic = (progress) => progress < .5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2;
	/**
	* Class definition
	*/
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
			return Default$37;
		}
		static get DefaultType() {
			return DefaultType$36;
		}
		static get NAME() {
			return NAME$37;
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
			EventHandler.off(this._viewport, EVENT_KEY$29);
			super.dispose();
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Carousel.getOrCreateInstance(this, config);
				if (typeof config === "number") {
					data.to(config);
					return;
				}
				if (typeof config === "string") {
					if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
					data[config]();
				}
			});
		}
		_configAfterMerge(config) {
			if (![
				ENDS_STOP,
				ENDS_WRAP,
				ENDS_LOOP
			].includes(config.ends)) config.ends = Default$37.ends;
			return config;
		}
		_initialActiveIndex() {
			const active = SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
			const index = active ? this._getItems().indexOf(active) : 0;
			return Math.max(index, 0);
		}
		_addEventListeners() {
			if (this._config.keyboard) EventHandler.on(this._element, EVENT_KEYDOWN$7, (event) => this._keydown(event));
			if (this._config.pause === "hover") {
				EventHandler.on(this._element, EVENT_MOUSEENTER$3, () => this.pause());
				EventHandler.on(this._element, EVENT_MOUSELEAVE$2, () => this._maybeEnableCycle());
			}
			EventHandler.on(this._viewport, EVENT_POINTERDOWN, () => this._pauseFromInteraction());
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
			return isRTL$1() ? rect.right - (viewportRect.right - padStart) : rect.left - (viewportRect.left + padStart);
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
			if (isRTL$1()) return isNext ? DIRECTION_RIGHT : DIRECTION_LEFT;
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
			this._setControlsDisabled(this._prevControls, atStart);
			this._setControlsDisabled(this._nextControls, atEnd);
		}
		_setControlsDisabled(controls, disabled) {
			for (const control of controls) {
				if (disabled && control === document.activeElement) ((controls === this._prevControls ? this._nextControls : this._prevControls)[0] ?? this._viewport).focus({ preventScroll: true });
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
			const newActive = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
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
			return (num("--bs-carousel-items") || 1) === 1 && num("--bs-carousel-items-peek") === 0 && !this._element.classList.contains(CLASS_NAME_CENTER) && !this._element.classList.contains(CLASS_NAME_AUTO);
		}
		_direction(from, to) {
			const isNext = to > from;
			if (isRTL$1()) return isNext ? DIRECTION_RIGHT : DIRECTION_LEFT;
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
			const interval = item ? Number.parseInt(item.getAttribute("data-bs-interval"), 10) : NaN;
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
			const label = this._playPauseElement.getAttribute(this._playing ? "data-bs-pause-label" : "data-bs-play-label");
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
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_CLICK_DATA_API$14, SELECTOR_DATA_SLIDE, function(event) {
		const target = SelectorEngine.getElementFromSelector(this);
		if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) return;
		event.preventDefault();
		const carousel = Carousel.getOrCreateInstance(target);
		carousel._pauseFromInteraction();
		const slideIndex = this.getAttribute("data-bs-slide-to");
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
	EventHandler.on(document, EVENT_CLICK_DATA_API$14, SELECTOR_PLAY_PAUSE, function(event) {
		const target = SelectorEngine.getElementFromSelector(this);
		if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) return;
		event.preventDefault();
		Carousel.getOrCreateInstance(target)._togglePlayPause();
	});
	EventHandler.on(window, EVENT_LOAD_DATA_API$19, () => {
		const carousels = SelectorEngine.find(SELECTOR_DATA_AUTOPLAY);
		for (const carousel of carousels) Carousel.getOrCreateInstance(carousel);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Carousel);
	//#endregion
	//#region js/src/chip.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI chip.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$36 = "chip";
	const EVENT_KEY$28 = `.bs.chip`;
	const DATA_API_KEY$25 = ".data-api";
	const EVENT_REMOVE$1 = `remove${EVENT_KEY$28}`;
	const EVENT_REMOVED = `removed${EVENT_KEY$28}`;
	const EVENT_SELECT$1 = `select${EVENT_KEY$28}`;
	const EVENT_SELECTED = `selected${EVENT_KEY$28}`;
	const EVENT_DESELECT = `deselect${EVENT_KEY$28}`;
	const EVENT_DESELECTED = `deselected${EVENT_KEY$28}`;
	const SELECTOR_CHIP_CHECK = ".chip-check";
	const SELECTOR_CHIP_REMOVE$2 = ".chip-remove";
	const SELECTOR_DATA_CHIP = "[data-bs-chip]";
	const CLASS_NAME_CHIP_CHECK = "chip-check";
	const CLASS_NAME_CHIP_CLICKABLE = "chip-clickable";
	const CLASS_NAME_CHIP_REMOVE = "chip-remove";
	const CLASS_NAME_ACTIVE$6 = "active";
	const CLASS_NAME_DISABLED$6 = "disabled";
	const DEFAULT_REMOVE_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><line x1=\"4\" y1=\"4\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"4\" x2=\"4\" y2=\"12\"/></svg>";
	const DEFAULT_SELECTED_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M425.373 89.373 196 318.745 86.627 209.373l-45.254 45.254L196 409.255l274.627-274.628z\"/></svg>";
	const DISALLOWED_ATTRIBUTES$4 = /* @__PURE__ */ new Set([
		"sanitize",
		"allowList",
		"sanitizeFn"
	]);
	const Default$36 = {
		allowList: SVGAllowlist,
		ariaRemoveLabel: "Remove",
		disabled: false,
		filter: false,
		removable: false,
		removeIcon: DEFAULT_REMOVE_ICON,
		sanitize: true,
		sanitizeFn: null,
		selectable: false,
		selected: false,
		selectedIcon: DEFAULT_SELECTED_ICON
	};
	const DefaultType$35 = {
		allowList: "object",
		ariaRemoveLabel: "string",
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
	/**
	* Class definition
	*/
	var Chip = class Chip extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._disabled = this._config.disabled || this._element.classList.contains(CLASS_NAME_DISABLED$6);
			this._selected = this._config.selected || this._element.classList.contains(CLASS_NAME_ACTIVE$6);
			this._applyRole();
			this._ensureRemoveButton();
			this._applyState();
			if (this._config.selectable || this._config.removable) this._makeFocusable();
			this._addEventListeners();
		}
		static get Default() {
			return Default$36;
		}
		static get DefaultType() {
			return DefaultType$35;
		}
		static get NAME() {
			return NAME$36;
		}
		remove() {
			if (EventHandler.trigger(this._element, EVENT_REMOVE$1).defaultPrevented) return;
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
		_configAfterMerge(config) {
			if (config.filter) config.selectable = true;
			return config;
		}
		_addEventListeners() {
			EventHandler.on(this._element, "keydown", (event) => this._handleKeydown(event));
			EventHandler.on(this._element, "click", (event) => {
				if (this._disabled) return;
				if (event.target.closest(SELECTOR_CHIP_REMOVE$2)) return;
				this.toggle();
			});
			EventHandler.on(this._element, "click", SELECTOR_CHIP_REMOVE$2, (event) => {
				event.stopPropagation();
				this.remove();
			});
		}
		_applyRole() {
			if (this._config.selectable && !this._element.hasAttribute("role")) this._element.setAttribute("role", "button");
		}
		_selectionStateAttribute() {
			return this._element.getAttribute("role") === "option" ? "aria-selected" : "aria-pressed";
		}
		_applyState() {
			if (!this._disabled && (this._config.clickable || this._config.selectable)) this._element.classList.add(CLASS_NAME_CHIP_CLICKABLE);
			const hasRole = this._element.hasAttribute("role");
			if (this._disabled) {
				this._element.classList.add(CLASS_NAME_DISABLED$6);
				if (hasRole) this._element.setAttribute("aria-disabled", "true");
				else this._element.removeAttribute("aria-disabled");
			} else {
				this._element.classList.remove(CLASS_NAME_DISABLED$6);
				if (this._element.hasAttribute("aria-disabled")) {
					if (hasRole) this._element.setAttribute("aria-disabled", "false");
					else this._element.removeAttribute("aria-disabled");
				}
			}
			if (this._config.selectable) {
				this._element.classList.toggle(CLASS_NAME_ACTIVE$6, this._selected);
				this._element.setAttribute(this._selectionStateAttribute(), this._selected ? "true" : "false");
				if (this._config.filter) {
					if (this._selected) this._ensureCheckIcon();
					else SelectorEngine.findOne(SELECTOR_CHIP_CHECK, this._element)?.remove();
				}
			} else {
				this._element.classList.remove(CLASS_NAME_ACTIVE$6);
				if (this._element.getAttribute("role") === "option") this._element.setAttribute("aria-selected", "false");
				else this._element.removeAttribute("aria-selected");
			}
		}
		_ensureCheckIcon() {
			if (SelectorEngine.findOne(SELECTOR_CHIP_CHECK, this._element)) return;
			const check = document.createElement("span");
			check.className = CLASS_NAME_CHIP_CHECK;
			check.setAttribute("aria-hidden", "true");
			check.innerHTML = this._sanitizeIcon(this._config.selectedIcon);
			this._element.prepend(check);
		}
		_createRemoveButton() {
			const button = document.createElement("button");
			button.type = "button";
			button.className = CLASS_NAME_CHIP_REMOVE;
			button.setAttribute("aria-label", this._config.ariaRemoveLabel);
			button.setAttribute("tabindex", "-1");
			button.innerHTML = this._sanitizeIcon(this._config.removeIcon);
			return button;
		}
		_ensureRemoveButton() {
			if (!this._config.removable || this._disabled) return;
			if (SelectorEngine.findOne(SELECTOR_CHIP_REMOVE$2, this._element)) return;
			this._element.append(this._createRemoveButton());
		}
		_makeFocusable() {
			if (this._element.hasAttribute("tabindex") || this._disabled) return;
			this._element.setAttribute("tabindex", "0");
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
		_sanitizeIcon(icon) {
			return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon;
		}
		_getConfig(config) {
			const dataAttributes = Manipulator.getDataAttributes(this._element);
			for (const dataAttribute of Object.keys(dataAttributes)) if (DISALLOWED_ATTRIBUTES$4.has(dataAttribute)) delete dataAttributes[dataAttribute];
			config = {
				...dataAttributes,
				...typeof config === "object" && config ? config : {}
			};
			config = this._mergeConfigObj(config);
			config = this._configAfterMerge(config);
			this._typeCheckConfig(config);
			return config;
		}
		static chipInterface(element, config) {
			const data = Chip.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Chip.getOrCreateInstance(this);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config](this);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$28}${DATA_API_KEY$25}`, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP)) Chip.chipInterface(element);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Chip);
	//#endregion
	//#region js/src/chip-set.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI chip-set.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$35 = "chip-set";
	const EVENT_KEY$27 = `.bs.chip-set`;
	const DATA_API_KEY$24 = ".data-api";
	const EVENT_ADD = "add";
	const EVENT_REMOVE = "remove";
	const EVENT_CHANGE$5 = "change";
	const EVENT_SELECT = "select";
	const EVENT_KEYDOWN$6 = "keydown";
	const EVENT_CHIP_SELECTED = "selected.bs.chip";
	const EVENT_CHIP_DESELECTED = "deselected.bs.chip";
	const EVENT_CHIP_REMOVE$1 = "remove.bs.chip";
	const EVENT_CHIP_REMOVED = "removed.bs.chip";
	const SELECTOR_DATA_CHIP_SET = "[data-bs-chip-set]";
	const SELECTOR_CHIP$2 = ".chip";
	const SELECTOR_CHIP_ACTIVE = `${SELECTOR_CHIP$2}.active`;
	const SELECTOR_CHIP_REMOVE$1 = ".chip-remove";
	const SELECTOR_FOCUSABLE_ITEMS = ".chip:not(.disabled)";
	const CLASS_NAME_CHIP$1 = "chip";
	const CLASS_NAME_DISABLED$5 = "disabled";
	const SELECTION_MODE_SINGLE = "single";
	const Default$35 = {
		ariaAddedAnnouncement: "added",
		ariaRemoveLabel: "Remove",
		ariaRemovedAnnouncement: "removed",
		chipClassName: null,
		disabled: false,
		filter: false,
		maxChips: null,
		removable: false,
		removeIcon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><line x1=\"4\" y1=\"4\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"4\" x2=\"4\" y2=\"12\"/></svg>",
		selectable: false,
		selectedIcon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M425.373 89.373 196 318.745 86.627 209.373l-45.254 45.254L196 409.255l274.627-274.628z\"/></svg>",
		selectionMode: "multiple",
		unique: false
	};
	const DefaultType$34 = {
		ariaAddedAnnouncement: "string",
		ariaRemoveLabel: "string",
		ariaRemovedAnnouncement: "string",
		chipClassName: "(string|function|null)",
		disabled: "boolean",
		filter: "boolean",
		maxChips: "(number|null)",
		removable: "boolean",
		removeIcon: "string",
		selectable: "boolean",
		selectedIcon: "string",
		selectionMode: "string",
		unique: "boolean"
	};
	/**
	* Class definition
	*/
	var ChipSet = class ChipSet extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._disabled = this._config.disabled || this._element.classList.contains(CLASS_NAME_DISABLED$5);
			this._pendingFocus = null;
			this._chips = [];
			this._liveRegion = null;
			this._applyAccessibilityRoles();
			this._initChips();
			this._createLiveRegion();
			this._addEventListeners();
		}
		static get Default() {
			return Default$35;
		}
		static get DefaultType() {
			return DefaultType$34;
		}
		static get NAME() {
			return NAME$35;
		}
		add(chip) {
			if (!this._canModify()) return null;
			const isElement = typeof chip !== "string";
			const value = isElement ? this._getChipValue(chip) : String(chip).trim();
			if (!value) return null;
			if (this._config.unique && this._chips.includes(value)) return null;
			if (this._config.maxChips !== null && this._chips.length >= this._config.maxChips) return null;
			if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_ADD), {
				value,
				relatedTarget: this._input ?? null
			}).defaultPrevented) return null;
			const element = isElement ? chip : this._createChip(value);
			this._appendChip(element);
			this._setupChip(element);
			this._chips.push(value);
			this._announce(`${value} ${this._config.ariaAddedAnnouncement}`);
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE$5), { values: this.getValues() });
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
			if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_REMOVE), {
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
			for (const chip of this.getSelected()) this.remove(chip);
		}
		clear() {
			for (const chip of this._getChipElements()) this.remove(chip);
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
			for (const chip of this.getSelected()) Chip.getInstance(chip)?.deselect();
		}
		clearSelection() {
			this.deselectAll();
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { selected: this.getSelectedValues() });
		}
		getSelected() {
			return SelectorEngine.find(SELECTOR_CHIP_ACTIVE, this._element);
		}
		getValues() {
			return [...this._chips];
		}
		getSelectedValues() {
			return this.getSelected().map((chip) => this._getChipValue(chip));
		}
		dispose() {
			EventHandler.off(this._element, Chip.EVENT_KEY);
			if (this._liveRegion) {
				this._liveRegion.remove();
				this._liveRegion = null;
			}
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
		_findChipByValue(value) {
			return this._getChipElements().find((chip) => this._getChipValue(chip) === value);
		}
		_getChipValue(chip) {
			if (chip.dataset.bsChipValue) return chip.dataset.bsChipValue;
			const clone = chip.cloneNode(true);
			const remove = SelectorEngine.findOne(SELECTOR_CHIP_REMOVE$1, clone);
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
		_applyAccessibilityRoles() {
			if (!this._element.hasAttribute("role")) this._element.setAttribute("role", this._config.selectable ? "listbox" : "group");
			if (this._config.selectable && this._element.getAttribute("role") === "listbox") {
				this._element.setAttribute("aria-orientation", "horizontal");
				if (this._config.selectionMode === "multiple") this._element.setAttribute("aria-multiselectable", "true");
			}
		}
		_createLiveRegion() {
			const region = document.createElement("span");
			region.classList.add("visually-hidden");
			region.setAttribute("role", "status");
			this._element.after(region);
			this._liveRegion = region;
		}
		_announce(message) {
			if (this._liveRegion) this._liveRegion.textContent = message;
		}
		_setupChip(chip) {
			if (this._element.getAttribute("role") === "listbox" && !chip.hasAttribute("role")) chip.setAttribute("role", "option");
			Chip.getOrCreateInstance(chip, this._getChipConfig(chip));
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
			chip.dataset.bsChipValue = value;
			chip.append(document.createTextNode(value));
			this._applyChipClassName(chip, value);
			return chip;
		}
		_applyChipClassName(chip, value) {
			const className = this._resolveChipClassName(value);
			if (!className) return;
			chip.classList.add(...className.split(/\s+/).filter(Boolean));
		}
		_resolveChipClassName(value) {
			const { chipClassName } = this._config;
			if (!chipClassName) return "";
			if (typeof chipClassName === "function") {
				const resolvedClassName = chipClassName(value);
				return typeof resolvedClassName === "string" ? resolvedClassName : "";
			}
			return typeof chipClassName === "string" ? chipClassName : "";
		}
		_addEventListeners() {
			EventHandler.on(this._element, this.constructor.eventName(EVENT_KEYDOWN$6), SELECTOR_CHIP$2, (event) => this._handleKeydown(event));
			EventHandler.on(this._element, EVENT_CHIP_SELECTED, SELECTOR_CHIP$2, (event) => this._handleSelectionChange(event));
			EventHandler.on(this._element, EVENT_CHIP_DESELECTED, SELECTOR_CHIP$2, (event) => this._handleSelectionChange(event));
			EventHandler.on(this._element, EVENT_CHIP_REMOVE$1, SELECTOR_CHIP$2, (event) => this._handleChipRemove(event));
			EventHandler.on(this._element, EVENT_CHIP_REMOVED, SELECTOR_CHIP$2, (event) => this._handleChipRemoved(event));
		}
		_handleKeydown(event) {
			const chip = event.target.closest(SELECTOR_CHIP$2);
			if (!chip || chip.classList.contains(CLASS_NAME_DISABLED$5)) return;
			switch (event.key) {
				case "ArrowLeft":
					event.preventDefault();
					this._focusSibling(chip, isRTL$1());
					break;
				case "ArrowRight":
					event.preventDefault();
					this._focusSibling(chip, !isRTL$1());
					break;
				case "Home":
					event.preventDefault();
					this._navigateToEdge(0);
					break;
				case "End":
					event.preventDefault();
					this._navigateToEdge(-1);
			}
		}
		_focusSibling(chip, shouldGetNext) {
			const chips = this._getFocusableChips();
			if (chips.length === 0) return;
			const sibling = getNextActiveElement(chips, chip, shouldGetNext, false);
			if (sibling && sibling !== chip) sibling.focus();
		}
		_getRemovalNeighbor(chip) {
			const chips = this._getFocusableChips();
			if (chips.length === 0) return null;
			const next = getNextActiveElement(chips, chip, true, false);
			if (next && next !== chip) return next;
			const previous = getNextActiveElement(chips, chip, false, false);
			return previous && previous !== chip ? previous : null;
		}
		_navigateToEdge(targetIndex) {
			const chips = this._getFocusableChips();
			chips[targetIndex < 0 ? chips.length + targetIndex : targetIndex]?.focus();
		}
		_handleSelectionChange(event) {
			const chip = event.target.closest(SELECTOR_CHIP$2);
			if (this._config.selectionMode === SELECTION_MODE_SINGLE && chip?.matches(SELECTOR_CHIP_ACTIVE)) this._enforceSingleSelection(chip);
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { selected: this.getSelectedValues() });
		}
		_enforceSingleSelection(selectedChip) {
			for (const chip of this.getSelected()) if (chip !== selectedChip) Chip.getInstance(chip)?.deselect();
		}
		_handleChipRemove(event) {
			const chip = event.target.closest(SELECTOR_CHIP$2);
			this._pendingFocus = chip ? this._getRemovalNeighbor(chip) : null;
		}
		_handleChipRemoved(event) {
			const chip = event.target.closest(SELECTOR_CHIP$2);
			this._pendingFocus?.focus();
			this._pendingFocus = null;
			this._handleChipRemoval(chip, this._getChipValue(chip));
		}
		_handleChipRemoval(chip, value) {
			const index = this._chips.indexOf(value);
			if (index !== -1) this._chips.splice(index, 1);
			this._announce(`${value} ${this._config.ariaRemovedAnnouncement}`);
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE$5), { values: this.getValues() });
			EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { selected: this.getSelectedValues() });
		}
		static chipSetInterface(element, config) {
			const data = ChipSet.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = ChipSet.getOrCreateInstance(this);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config](this);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$27}${DATA_API_KEY$24}`, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP_SET)) ChipSet.chipSetInterface(element);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(ChipSet);
	//#endregion
	//#region js/src/chip-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI chip-input.js
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	*
	* This component is a highly modified version of the Bootstrap's chip-input.js
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$34 = "chip-input";
	const EVENT_KEY$26 = `.bs.chip-input`;
	const DATA_API_KEY$23 = ".data-api";
	const EVENT_INPUT$2 = `input${EVENT_KEY$26}`;
	const SELECTOR_DATA_CHIP_INPUT = "[data-bs-chip-input]";
	const SELECTOR_CHIP$1 = ".chip";
	const SELECTOR_CHIP_INPUT_LABEL = ".chip-input-label";
	const SELECTOR_CHIP_REMOVE = ".chip-remove";
	const CLASS_NAME_DISABLED$4 = "disabled";
	const CLASS_NAME_CHIP_INPUT_FIELD = "chip-input-field";
	const CLASS_NAME_GROUP$1 = "form-control-group";
	const Default$34 = {
		...ChipSet.Default,
		create: true,
		createOnBlur: true,
		id: null,
		name: null,
		placeholder: "",
		readonly: false,
		removable: true,
		separator: ",",
		unique: true
	};
	const DefaultType$33 = {
		...ChipSet.DefaultType,
		create: "boolean",
		createOnBlur: "boolean",
		id: "(string|null)",
		name: "(string|null)",
		placeholder: "string",
		readonly: "boolean",
		separator: "(string|null)"
	};
	/**
	* Class definition
	*
	* ChipInput is a thin input layer on top of ChipSet: ChipSet owns the chips
	* (the single source of truth), while ChipInput only adds the text field, form
	* integration (hidden input) and turns typed text into chips. The public API
	* (methods + `*.bs.chip-input` events) is preserved through overrides.
	*/
	var ChipInput = class extends ChipSet {
		constructor(element, config) {
			super(element, config);
			this._addedGroupClass = false;
			this._uniqueId = this._config.id ?? getUID(NAME$34);
			this._hiddenInput = null;
			this._addedGroupClass = !this._element.classList.contains(CLASS_NAME_GROUP$1);
			this._element.classList.add(CLASS_NAME_GROUP$1);
			this._input = SelectorEngine.findOne("input", this._element);
			if (this._input) this._setInputSize();
			else this._createInput();
			this._applyInteractionState();
			if (this._config.create) this._createHiddenInput();
			this._addInputEventListeners();
		}
		static get Default() {
			return Default$34;
		}
		static get DefaultType() {
			return DefaultType$33;
		}
		static get NAME() {
			return NAME$34;
		}
		add(value) {
			const chip = super.add(value);
			if (chip) this._syncHiddenInput();
			return chip;
		}
		focus() {
			this._input?.focus();
		}
		dispose() {
			if (this._addedGroupClass) this._element.classList.remove(CLASS_NAME_GROUP$1);
			super.dispose();
		}
		_applyAccessibilityRoles() {}
		_canModify() {
			return !this._disabled && !this._config.readonly;
		}
		_appendChip(chip) {
			this._element.insertBefore(chip, this._input);
		}
		_getChipConfig(chip) {
			return {
				ariaRemoveLabel: `Remove ${this._getChipValue(chip)}`,
				disabled: this._disabled,
				removable: this._config.removable && !this._config.readonly && !this._disabled,
				removeIcon: this._config.removeIcon,
				selectable: this._config.selectable
			};
		}
		_setupChip(chip) {
			super._setupChip(chip);
			const removeButton = SelectorEngine.findOne(SELECTOR_CHIP_REMOVE, chip);
			if (removeButton) removeButton.disabled = this._disabled || this._config.readonly;
		}
		_handleChipRemoved(event) {
			super._handleChipRemoved(event);
			this._syncHiddenInput();
			this._input?.focus();
		}
		_syncHiddenInput() {
			if (this._hiddenInput) this._hiddenInput.value = this.getValues().join(",");
		}
		_addInputEventListeners() {
			EventHandler.on(this._element, "keydown", (event) => {
				if (event.target === this._input) return;
				if (event.key === (isRTL$1() ? "ArrowLeft" : "ArrowRight")) {
					const chips = this._getFocusableChips();
					if (chips.length > 0 && chips[chips.length - 1].contains(event.target)) {
						event.preventDefault();
						this._input.focus();
						return;
					}
				}
				if (event.key.length === 1) this._input.focus();
			});
			EventHandler.on(this._input, "keydown", (event) => this._handleInputKeydown(event));
			EventHandler.on(this._input, "input", (event) => this._handleInput(event));
			EventHandler.on(this._input, "paste", (event) => this._handlePaste(event));
			EventHandler.on(this._input, "focus", () => this.clearSelection());
			if (this._config.createOnBlur) EventHandler.on(this._input, "blur", (event) => {
				if (!event.relatedTarget?.closest(SELECTOR_CHIP$1)) this._createChipFromInput();
			});
			EventHandler.on(this._element, "click", (event) => {
				if (event.target === this._element) this._input?.focus();
			});
		}
		_createInput() {
			const input = document.createElement("input");
			const label = SelectorEngine.findOne(SELECTOR_CHIP_INPUT_LABEL, this._element);
			const labelFor = label?.getAttribute("for");
			const generatedInputId = labelFor || getUID(`${NAME$34}-input`);
			input.type = "text";
			input.className = CLASS_NAME_CHIP_INPUT_FIELD;
			input.id = generatedInputId;
			if (this._config.placeholder) input.placeholder = this._config.placeholder;
			if (label && !labelFor) label.setAttribute("for", generatedInputId);
			this._input = input;
			this._setInputSize();
			this._element.append(input);
		}
		_createHiddenInput() {
			const hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			hiddenInput.id = this._uniqueId;
			hiddenInput.name = this._config.name || this._uniqueId;
			this._element.append(hiddenInput);
			this._hiddenInput = hiddenInput;
			this._hiddenInput.value = this.getValues().join(",");
		}
		_createChipFromInput() {
			if (!this._canModify() || !this._config.create) return;
			const value = this._input.value.trim();
			if (value) {
				this.add(value);
				this._input.value = "";
				this._setInputSize();
			}
		}
		_applyInteractionState() {
			const { readonly } = this._config;
			this._element.classList.toggle(CLASS_NAME_DISABLED$4, this._disabled);
			this._input.disabled = this._disabled;
			this._input.readOnly = !this._disabled && readonly;
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
					if (key === (isRTL$1() ? "ArrowRight" : "ArrowLeft") && this._input.selectionStart === 0 && this._input.selectionEnd === 0) {
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
			const { value } = event.target;
			const { separator } = this._config;
			if (this._config.create && separator && value.includes(separator)) {
				const parts = value.split(separator);
				for (const part of parts.slice(0, -1)) this.add(part.trim());
				this._input.value = parts[parts.length - 1];
			}
			this._setInputSize();
			EventHandler.trigger(this._element, EVENT_INPUT$2, {
				value: this._input.value,
				relatedTarget: this._input
			});
		}
		_handlePaste(event) {
			if (!this._canModify()) return;
			const { separator } = this._config;
			if (!separator || !this._config.create) return;
			const pastedData = (event.clipboardData || window.clipboardData).getData("text");
			if (pastedData.includes(separator)) {
				event.preventDefault();
				const parts = pastedData.split(separator);
				for (const part of parts) this.add(part.trim());
			}
		}
		_setInputSize() {
			if (!this._input) return;
			this._input.size = Math.max(this._input.placeholder.length, this._input.value.length) || 1;
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$26}${DATA_API_KEY$23}`, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP_INPUT)) ChipInput.getOrCreateInstance(element);
	});
	//#endregion
	//#region js/src/collapse.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI collapse.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's collapse.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$33 = "collapse";
	const EVENT_KEY$25 = `.bs.collapse`;
	const DATA_API_KEY$22 = ".data-api";
	const EVENT_SHOW$10 = `show${EVENT_KEY$25}`;
	const EVENT_SHOWN$10 = `shown${EVENT_KEY$25}`;
	const EVENT_HIDE$8 = `hide${EVENT_KEY$25}`;
	const EVENT_HIDDEN$13 = `hidden${EVENT_KEY$25}`;
	const EVENT_CLICK_DATA_API$13 = `click${EVENT_KEY$25}${DATA_API_KEY$22}`;
	const EVENT_LOAD_DATA_API$18 = `DOMContentLoaded${EVENT_KEY$25}${DATA_API_KEY$22}`;
	const EVENT_BEFOREMATCH = `beforematch${EVENT_KEY$25}`;
	const CLASS_NAME_SHOW$13 = "show";
	const CLASS_NAME_COLLAPSE = "collapse";
	const CLASS_NAME_COLLAPSING = "collapsing";
	const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
	const CLASS_NAME_HORIZONTAL = "collapse-horizontal";
	const WIDTH = "width";
	const HEIGHT = "height";
	const ATTRIBUTE_HIDDEN = "hidden";
	const VALUE_UNTIL_FOUND = "until-found";
	const SELECTOR_ACTIVES = ".collapse.show";
	const SELECTOR_DATA_TOGGLE$21 = "[data-bs-toggle=\"collapse\"]";
	const SELECTOR_HIDDEN_UNTIL_FOUND = ".collapse[data-bs-hidden-until-found=\"true\"]";
	const Default$33 = {
		hiddenUntilFound: false,
		parent: null
	};
	const DefaultType$32 = {
		hiddenUntilFound: "boolean",
		parent: "(null|element)"
	};
	const supportsUntilFound = () => typeof document !== "undefined" && "onbeforematch" in document.documentElement;
	/**
	* Class definition
	*/
	var Collapse = class Collapse extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._isTransitioning = false;
			this._triggerArray = [];
			const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$21);
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
			return Default$33;
		}
		static get DefaultType() {
			return DefaultType$32;
		}
		static get NAME() {
			return NAME$33;
		}
		toggle() {
			return this._isShown() ? this.hide() : this.show();
		}
		async show() {
			if (this._isTransitioning || this._isShown()) return;
			let activeChildren = [];
			if (this._config.parent) activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter((element) => element !== this._element && !this._sharesTrigger(element)).map((element) => Collapse.getOrCreateInstance(element));
			if (activeChildren.length && activeChildren[0]._isTransitioning) return;
			if (EventHandler.trigger(this._element, EVENT_SHOW$10).defaultPrevented) return;
			for (const activeInstance of activeChildren) activeInstance.hide();
			const dimension = this._getDimension();
			this._setHiddenUntilFound(false);
			this._element.classList.add(CLASS_NAME_COLLAPSING, CLASS_NAME_SHOW$13);
			this._setAriaExpanded(this._triggerArray, true);
			this._isTransitioning = true;
			const complete = () => {
				this._isTransitioning = false;
				this._element.classList.remove(CLASS_NAME_COLLAPSING);
				this._element.style[dimension] = "";
				EventHandler.trigger(this._element, EVENT_SHOWN$10);
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
			if (EventHandler.trigger(this._element, EVENT_HIDE$8).defaultPrevented) return;
			const cssPath = supportsInterpolateSize();
			const dimension = this._getDimension();
			const size = cssPath ? 0 : this._element.getBoundingClientRect()[dimension];
			this._element.classList.add(CLASS_NAME_COLLAPSING);
			if (cssPath) this._setHiddenUntilFound(true);
			this._element.classList.remove(CLASS_NAME_SHOW$13);
			for (const trigger of this._triggerArray) {
				const element = SelectorEngine.getElementFromSelector(trigger);
				if (element && !this._isShown(element)) this._setAriaExpanded([trigger], false);
			}
			this._isTransitioning = true;
			const complete = () => {
				this._isTransitioning = false;
				this._element.classList.remove(CLASS_NAME_COLLAPSING);
				this._element.style[dimension] = "";
				if (!cssPath) this._setHiddenUntilFound(true);
				EventHandler.trigger(this._element, EVENT_HIDDEN$13);
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
			const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$21);
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
			EventHandler.trigger(this._element, EVENT_SHOWN$10);
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
			return this.each(function() {
				const data = Collapse.getOrCreateInstance(this);
				if (typeof config === "string") {
					if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
					data[config]();
				}
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_LOAD_DATA_API$18, () => {
		Collapse._initializeDataApi();
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$13, SELECTOR_DATA_TOGGLE$21, function(event) {
		if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") event.preventDefault();
		for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) Collapse.getOrCreateInstance(element).toggle();
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Collapse);
	//#endregion
	//#region js/src/util/time.ts
	const convert12hTo24h = (abbr, hour) => {
		if (abbr === "am" && hour === 12) return 0;
		if (abbr === "am") return hour;
		if (abbr === "pm" && hour === 12) return 12;
		return hour + 12;
	};
	/**
	* Converts a 24-hour time format to a 12-hour format.
	* @param {number} hour The hour to be converted.
	* @returns {number} The hour in 12-hour format.
	*/
	const convert24hTo12h = (hour) => hour % 12 || 12;
	/**
	* Formats an array of time values (hours, minutes, or seconds) according to the specified locale and partial.
	* @param {number[]} values An array of time values to format.
	* @param {string} locale The locale to use for formatting.
	* @param {('hour' | 'minute' | 'second')} partial The type of time value to format.
	* @param {boolean} [hour12] Whether the hour labels should use the 12-hour cycle. When omitted the formatter falls back to the locale's default cycle.
	* @returns {Array} An array of objects with the original value and its localized label.
	*/
	const formatTimePartials = (values, locale, partial, hour12) => {
		const date = /* @__PURE__ */ new Date();
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
	/**
	* Generates localized time partials (hours, minutes, seconds) based on the given parameters.
	* @param {string} locale The locale to use for generating localized time partials.
	* @param {'auto' | boolean} ampm Determines whether to use 12-hour or 24-hour format. 'auto' decides based on locale.
	* @param {boolean | number[] | Function} hours An array of hours, a boolean, or a function to generate hours.
	* @param {boolean | number[] | Function} minutes An array of minutes, a boolean, or a function to generate minutes.
	* @param {boolean | number[] | Function} seconds An array of seconds, a boolean, or a function to generate seconds.
	* @returns {LocalizedTimePartials} An object containing arrays of localized time partials and a boolean indicating if 12-hour format is used.
	*/
	const getLocalizedTimePartials = (locale, ampm = "auto", hours = [], minutes = [], seconds = []) => {
		const hour12 = ampm === "auto" && isAmPm(locale) || ampm === true;
		const listOfHours = Array.isArray(hours) && hours.length > 0 ? hours : typeof hours === "function" ? Array.from({ length: hour12 ? 12 : 24 }, (_, i) => hour12 ? i + 1 : i).filter((hour) => hours(hour)) : Array.from({ length: hour12 ? 12 : 24 }, (_, i) => hour12 ? i + 1 : i);
		const listOfMinutes = Array.isArray(minutes) && minutes.length > 0 ? minutes : typeof minutes === "function" ? Array.from({ length: 60 }, (_, i) => i).filter((minute) => minutes(minute)) : Array.from({ length: 60 }, (_, i) => i);
		const listOfSeconds = Array.isArray(seconds) && seconds.length > 0 ? seconds : typeof seconds === "function" ? Array.from({ length: 60 }, (_, i) => i).filter((second) => seconds(second)) : Array.from({ length: 60 }, (_, i) => i);
		return {
			listOfHours: formatTimePartials(listOfHours, locale, "hour", hour12),
			listOfMinutes: formatTimePartials(listOfMinutes, locale, "minute"),
			listOfSeconds: formatTimePartials(listOfSeconds, locale, "second"),
			hour12
		};
	};
	/**
	* Gets the selected hour from a date object in either 12-hour or 24-hour format based on locale and preference.
	* @param {Date | null} date The date object from which to extract the hour. If null, the function returns an empty string.
	* @param {string} locale The locale to use when determining whether to return in 12-hour or 24-hour format.
	* @param {'auto' | boolean} ampm Determines the format of the hour returned. 'auto' decides based on locale, true forces 12-hour format, and false forces 24-hour format.
	* @returns {string | number} The hour in the specified format or an empty string if the date is null.
	*/
	const getSelectedHour = (date, locale, ampm = "auto") => date ? ampm === "auto" && isAmPm(locale) || ampm === true ? convert24hTo12h(date.getHours()) : date.getHours() : "";
	/**
	* Gets the selected minutes from a date object.
	* @param {Date | null} date The date object from which to extract the minutes. If null, the function returns an empty string.
	* @returns {string | number} The minutes from the date or an empty string if the date is null.
	*/
	const getSelectedMinutes = (date) => date ? date.getMinutes() : "";
	/**
	* Gets the selected seconds from a date object.
	* @param {Date | null} date The date object from which to extract the seconds. If null, the function returns an empty string.
	* @returns {string | number} The seconds from the date or an empty string if the date is null.
	*/
	const getSelectedSeconds = (date) => date ? date.getSeconds() : "";
	/**
	* Determines if the given locale uses AM/PM format.
	* @param {string} locale The locale to check.
	* @returns {boolean} True if the locale uses AM/PM format, otherwise false.
	*/
	const isAmPm = (locale) => [
		"am",
		"AM",
		"pm",
		"PM"
	].some((el) => (/* @__PURE__ */ new Date()).toLocaleString(locale).includes(el));
	/**
	* Checks whether the given locale formats the hour "9" with a leading zero ("09")
	* when using `hour: 'numeric'` in `toLocaleTimeString`.
	*
	* This helps determine if you should force `hour: '2-digit'` for consistent formatting.
	*
	* @param {string} locale - The locale code (e.g., "en-US", "pl-PL").
	* @returns {boolean} `true` if the formatted hour starts with a leading zero, otherwise `false`.
	*/
	const shouldUseTwoDigitHour = (locale) => {
		return new Date(2020, 0, 1, 7, 5, 7).toLocaleTimeString(locale).startsWith("0");
	};
	//#endregion
	//#region js/src/util/date-sections.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO util/date-sections.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
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
	/**
	* Returns the localized month names in the grammatical form used inside a
	* full date (e.g. Polish genitive "lipca", not the standalone "lipiec"),
	* extracted from the month part of a formatted day-month-year date.
	* @param {string} locale The locale to use.
	* @param {('short' | 'long')} width The month name width.
	* @returns {string[]} The twelve month names.
	*/
	const getFormatMonthNames = (locale, width) => {
		const formatter = new Intl.DateTimeFormat(locale, {
			year: "numeric",
			month: width,
			day: "numeric"
		});
		return Array.from({ length: 12 }, (_, index) => formatter.formatToParts(new Date(2e3, index, 15)).find((part) => part.type === "month").value);
	};
	/**
	* Returns the localized day period names, e.g. ["AM", "PM"].
	* @param {string} locale The locale to use.
	* @returns {string[]} The two day period names.
	*/
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
	/**
	* Creates an editable section descriptor for a format token.
	* @param {string} char The token character (e.g. "d", "M", "H", "a").
	* @param {number} tokenLength The length of the token run (e.g. 2 for "dd", 4 for "yyyy").
	* @param {string} [locale] The locale used to resolve month and day period names.
	* @param {string[] | null} [monthNames] Custom month names overriding the locale-derived ones.
	* @returns {object} The section descriptor with `type`, `length`, `padded` and an empty `value`.
	*/
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
	/**
	* Returns the allowed value bounds for a section.
	* @param {object} section The section descriptor (or an object with `type` and, for hours, `cycle`).
	* @returns {{min: number, max: number}} The inclusive bounds.
	*/
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
				min: 1,
				max: 9999
			};
		}
	};
	/**
	* Parses a date or time format string into a list of sections and literals.
	* Accepts both dayjs/moment-style (`DD.MM.YYYY`) and date-fns/Unicode-style
	* (`dd.MM.yyyy`) tokens, including text month tokens (`MMM`, `MMMM`) and time
	* tokens (`HH`/`H` for the 23-hour cycle, `hh`/`h` for the 12-hour cycle,
	* `mm`, `ss`, `A`/`a`); any other character becomes a literal. Text wrapped in
	* single quotes is always a literal — even token letters (`'Week' ww` renders
	* "Week 29") — and a doubled quote (`''`) escapes the quote character itself.
	* @param {string} format The format string.
	* @param {string} [locale] The locale used to resolve month and day period names.
	* @param {string[] | null} [monthNames] Custom month names overriding the locale-derived ones.
	* @returns {Array} The ordered list of section and literal descriptors.
	*/
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
	/**
	* Maps the parts of a formatted reference date to section descriptors.
	* @param {Intl.DateTimeFormat} formatter The formatter to read parts from.
	* @param {string} locale The locale used to resolve names.
	* @returns {Array} The ordered list of section and literal descriptors.
	*/
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
	/**
	* Derives the list of sections and literals from the locale's numeric date format.
	* @param {string} locale The locale to use.
	* @returns {Array} The ordered list of section and literal descriptors.
	*/
	const getSectionsFromLocale = (locale) => getSectionsFromParts(new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}), locale);
	/**
	* Returns the localized week-of-year label, capitalized the way the native
	* week input renders it ("Week", "Tydzień", "Woche"). Falls back to "Week"
	* where `Intl.DisplayNames` has no data.
	* @param {string} locale The locale to use.
	* @returns {string} The label.
	*/
	const getWeekLabel = (locale) => {
		try {
			const label = new Intl.DisplayNames(locale, { type: "dateTimeField" }).of("weekOfYear");
			return label ? label.charAt(0).toLocaleUpperCase(locale) + label.slice(1) : "Week";
		} catch {
			return "Week";
		}
	};
	/**
	* Derives the week mask from the locale, mirroring the native week input's
	* presentation ("Week 29, 2026"): a fixed localized label, the ISO week
	* number, and the ISO week-numbering year.
	* @param {string} locale The locale to use.
	* @returns {Array} The ordered list of section and literal descriptors.
	*/
	const getWeekSectionsFromLocale = (locale) => getSectionsFromFormat(`'${getWeekLabel(locale).replaceAll("'", "''")}' ww, yyyy`, locale);
	/**
	* Derives the list of sections and literals from the locale's time format.
	* @param {string} locale The locale to use.
	* @param {boolean} [seconds] Whether to include a seconds section.
	* @returns {Array} The ordered list of section and literal descriptors.
	*/
	const getTimeSectionsFromLocale = (locale, seconds = false) => getSectionsFromParts(new Intl.DateTimeFormat(locale, {
		hour: "2-digit",
		minute: "2-digit",
		second: seconds ? "2-digit" : void 0
	}), locale);
	/**
	* Derives the list of sections and literals from the locale's date and time format.
	* @param {string} locale The locale to use.
	* @param {boolean} [seconds] Whether to include a seconds section.
	* @returns {Array} The ordered list of section and literal descriptors.
	*/
	const getDateTimeSectionsFromLocale = (locale, seconds = false) => getSectionsFromParts(new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: seconds ? "2-digit" : void 0
	}), locale);
	/**
	* Applies a typed digit to a section, MUI DateField-style: digits accumulate
	* while the value stays ambiguous and restart when it would exceed the bounds.
	* @param {object} section The section descriptor.
	* @param {string} draft The digits typed into the section so far.
	* @param {string} digit The newly typed digit.
	* @param {number} [max] The upper bound, e.g. the day count of the selected month.
	* @returns {{draft: string, value: number, completed: boolean}} The next draft, numeric value and whether the section is complete.
	*/
	const applyDigitToSection = (section, draft, digit, max = getSectionBounds(section).max) => {
		const length = section.type === "year" ? section.length : 2;
		let next = `${draft || ""}${digit}`.slice(-length);
		if (Number.parseInt(next, 10) > max) next = digit;
		const value = Number.parseInt(next, 10);
		return {
			draft: next,
			value,
			completed: next.length >= length || value * 10 > max
		};
	};
	/**
	* Applies a typed letter to a text section (month names, day periods) by
	* prefix-matching its names, MUI DateField-style: "m" selects March,
	* continuing with "may" switches to May; the section completes when the
	* prefix matches a single name. A letter that matches no name restarts the
	* draft.
	* @param {object} section The text section descriptor (with `names`).
	* @param {string} draft The letters typed into the section so far.
	* @param {string} letter The newly typed letter.
	* @returns {{draft: string, value: number, completed: boolean} | null} The next draft, section value and completion state, or null when nothing matches.
	*/
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
	/**
	* Returns the section value after an increment or decrement, wrapping within
	* the bounds (except year, which clamps). An empty section starts at the
	* minimum when incrementing and at the maximum when decrementing — except the
	* year, which starts at the current year (jumping to 0001 or 9999 would be
	* useless).
	* @param {object} section The section descriptor.
	* @param {number} delta The signed step.
	* @param {number} [max] The upper bound, e.g. the day count of the selected month.
	* @returns {number} The next section value.
	*/
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
	/**
	* Returns the number of days in the given month, valid for any year.
	* @param {number} year The full year.
	* @param {number} month The 1-based month.
	* @returns {number} The number of days.
	*/
	const getDaysInMonth = (year, month) => {
		const date = new Date(2e3, 0, 1);
		date.setFullYear(year, month, 0);
		return date.getDate();
	};
	/**
	* Returns the number of ISO weeks in the given week-numbering year (52 or 53).
	* @param {number} year The full week-numbering year.
	* @returns {number} The week count.
	*/
	const getISOWeeksInYear = (year) => {
		const date = new Date(2e3, 0, 1);
		date.setFullYear(year, 11, 28);
		return getISOWeekNumberAndYear(date).weekNumber;
	};
	/**
	* Returns the Monday of the given ISO week.
	* @param {number} year The full week-numbering year.
	* @param {number} week The 1-based ISO week number.
	* @returns {Date} The Monday starting the week.
	*/
	const getDateOfISOWeek = (year, week) => {
		const date = new Date(2e3, 0, 1);
		date.setFullYear(year, 0, 4);
		date.setDate(date.getDate() - (date.getDay() + 6) % 7 + (week - 1) * 7);
		return date;
	};
	/**
	* Returns the effective upper bound of the week section for the currently
	* selected year. Falls back to 53 while the year is unknown (the year can
	* still turn out to be a long one).
	* @param {Array} sections The section and literal descriptors.
	* @returns {number} The week count of the selected year.
	*/
	const getWeekSectionMax = (sections) => {
		const yearSection = sections.find((section) => section.type === "year");
		const year = yearSection ? getFullYearFromSection(yearSection) : null;
		if (year === null) return getSectionBounds({ type: "week" }).max;
		return getISOWeeksInYear(year);
	};
	/**
	* Returns the effective upper bound of the day section for the currently
	* selected month and year. Falls back to 31 while the month is unknown and to
	* a leap year while the year is unknown (February can still turn out to have
	* 29 days).
	* @param {Array} sections The section and literal descriptors.
	* @returns {number} The day count of the selected month.
	*/
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
	/**
	* Resolves the full year of a year section, expanding 2-digit values with
	* smart century assignment.
	* @param {object} section The year section descriptor.
	* @returns {number | null} The full year or null when empty.
	*/
	const getFullYearFromSection = (section) => {
		if (section.value === null) return null;
		if (section.length === 2 && section.value < 100) return parseYearSmart(String(section.value).padStart(2, "0"));
		return section.value;
	};
	/**
	* Builds a Date from fully filled sections, clamping the day to the month's
	* length. A week section resolves to the Monday of the ISO week (the year
	* section then holds the ISO week-numbering year) and a quarter section to
	* the first day of the quarter. Section types absent from the layout get
	* defaults (1970-01-01 for the date part — the `util/time.js` convention for
	* time-only values — and midnight for the time part). Returns null while any
	* section is empty.
	* @param {Array} sections The section and literal descriptors.
	* @returns {Date | null} The date or null when incomplete.
	*/
	const getDateFromSections = (sections) => {
		const values = {};
		let hourCycle = null;
		for (const section of sections) {
			if (section.type === "literal") continue;
			if (section.value === null) return null;
			values[section.type] = section.type === "year" ? getFullYearFromSection(section) : section.value;
			if (section.type === "hour") hourCycle = section.cycle;
		}
		const year = values.year === void 0 ? 1970 : values.year;
		const month = values.month === void 0 ? values.quarter === void 0 ? 1 : (values.quarter - 1) * 3 + 1 : values.month;
		const day = values.day === void 0 ? 1 : values.day;
		let hour = values.hour === void 0 ? 0 : values.hour;
		if (hourCycle === "h12") hour = convert12hTo24h(values.meridiem === 2 ? "pm" : "am", hour);
		const date = values.week === void 0 ? new Date(2e3, 0, 1) : getDateOfISOWeek(year, Math.min(values.week, getISOWeeksInYear(year)));
		if (values.week === void 0) date.setFullYear(year, month - 1, Math.min(day, getDaysInMonth(year, month)));
		date.setHours(hour, values.minute === void 0 ? 0 : values.minute, values.second === void 0 ? 0 : values.second, 0);
		return date;
	};
	/**
	* Returns a copy of the sections with values taken from the given date. In a
	* layout with a week section the year section holds the ISO week-numbering
	* year, which can differ from the calendar year around January 1st.
	* @param {Array} sections The section and literal descriptors.
	* @param {Date | null} date The date to read values from, or null to clear.
	* @returns {Array} The updated sections.
	*/
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
	/**
	* Formats a section value for display, padding with zeros when the section is
	* padded and shortening 4-digit years stored in 2-digit sections. Text
	* sections (month names, day periods) show their name.
	* @param {object} section The section descriptor.
	* @param {string} placeholder The placeholder to show when the section is empty.
	* @returns {string} The display string.
	*/
	const formatSectionValue = (section, placeholder = "") => {
		if (section.value === null) return placeholder;
		if (section.names) return section.names[section.value - 1];
		const value = section.type === "year" && section.length === 2 ? section.value % 100 : section.value;
		return section.padded === false ? String(value) : String(value).padStart(section.length, "0");
	};
	/**
	* Serializes the sections into the masked string (values and literals).
	* @param {Array} sections The section and literal descriptors.
	* @returns {string} The formatted string.
	*/
	const formatSections = (sections) => sections.map((section) => section.type === "literal" ? section.value : formatSectionValue(section)).join("");
	/**
	* Parses a pasted string against the section layout by matching names (months,
	* day periods) and digit groups to editable sections in order. Returns null
	* when the string doesn't match.
	* @param {string} text The pasted text.
	* @param {Array} sections The section and literal descriptors.
	* @returns {Array | null} The filled sections or null.
	*/
	const getSectionsFromString = (text, sections) => {
		let normalizedText = text;
		for (const section of sections) {
			if (!section.names) continue;
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
	//#endregion
	//#region js/src/section-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO section-input.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const ARROW_DOWN_KEY$6 = "ArrowDown";
	const ARROW_LEFT_KEY$5 = "ArrowLeft";
	const ARROW_RIGHT_KEY$5 = "ArrowRight";
	const ARROW_UP_KEY$5 = "ArrowUp";
	const BACKSPACE_KEY$2 = "Backspace";
	const DELETE_KEY$1 = "Delete";
	const END_KEY$5 = "End";
	const HOME_KEY$5 = "Home";
	const CLASS_NAME_SECTION_INPUT = "form-date-time";
	const CLASS_NAME_ALL_SELECTED = "form-date-time-all-selected";
	const CLASS_NAME_DISABLED$3 = "disabled";
	const CLASS_NAME_FORM_CONTROL$5 = "form-control";
	const CLASS_NAME_FILLED = "form-date-time-filled";
	const CLASS_NAME_IS_INVALID = "is-invalid";
	const CLASS_NAME_IS_VALID = "is-valid";
	const CLASS_NAME_WAS_VALIDATED = "was-validated";
	const CLASS_NAME_SECTION = "form-date-time-section";
	const CLASS_NAME_SECTION_EMPTY = "form-date-time-section-empty";
	const CLASS_NAME_SEPARATOR$1 = "form-date-time-separator";
	const SELECTOR_SECTION = ".form-date-time-section";
	const Default$32 = {
		ariaLabel: "Date input",
		autofocus: false,
		date: null,
		disabled: false,
		disabledDates: null,
		format: null,
		inputDateParse: null,
		invalid: false,
		locale: "default",
		maxDate: null,
		minDate: null,
		monthNames: null,
		name: null,
		placeholders: null,
		readonly: false,
		required: false,
		sectionLabels: null,
		valid: false
	};
	const DefaultType$31 = {
		ariaLabel: "string",
		autofocus: "boolean",
		date: "(date|number|string|null)",
		disabled: "boolean",
		disabledDates: "(array|date|function|null)",
		format: "(function|string|null)",
		inputDateParse: "(function|null)",
		invalid: "boolean",
		locale: "string",
		maxDate: "(date|number|string|null)",
		minDate: "(date|number|string|null)",
		monthNames: "(array|null)",
		name: "(string|null)",
		placeholders: "(object|null)",
		readonly: "boolean",
		required: "boolean",
		sectionLabels: "(object|null)",
		valid: "boolean"
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
	const DefaultSectionLabels = {
		day: "Day",
		week: "Week",
		month: "Month",
		quarter: "Quarter",
		year: "Year",
		hour: "Hour",
		minute: "Minute",
		second: "Second",
		meridiem: "AM/PM"
	};
	/**
	* Class definition
	*/
	var SectionInput = class extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._config = this._getConfig(config);
			this._date = this._config.date ? this._convertDate(this._config.date) : null;
			this._minDate = this._convertDate(this._config.minDate);
			this._maxDate = this._convertDate(this._config.maxDate);
			this._sections = setSectionsFromDate(this._resolveSections(), this._date);
			this._date = getDateFromSections(this._sections);
			this._draft = "";
			this._allSelected = false;
			this._error = null;
			this._inputElement = null;
			this._monthFormatter = new Intl.DateTimeFormat(this._config.locale, { month: "long" });
			this._createSectionInput();
			this._date = this._applyValidationState();
			this._addEventListeners();
			if (this._config.autofocus && !this._config.disabled) this._getSectionElements()[0]?.focus();
		}
		static get Default() {
			return Default$32;
		}
		static get DefaultType() {
			return DefaultType$31;
		}
		static get CHANGE_EVENT_NAME() {
			return "dateChange";
		}
		clear() {
			this._sections = setSectionsFromDate(this._sections, null);
			this._draft = "";
			this._syncSections();
			this._updateDate();
		}
		reset() {
			this._date = this._config.date ? this._convertDate(this._config.date) : null;
			this._sections = setSectionsFromDate(this._sections, this._date);
			this._date = getDateFromSections(this._sections);
			this._draft = "";
			this._syncSections();
			this._setHiddenInputValue();
			this._element.classList.toggle(CLASS_NAME_FILLED, this._date !== null);
			this._element.classList.remove(CLASS_NAME_IS_INVALID);
		}
		getDate() {
			return this._date;
		}
		isDateSelectable(date) {
			if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
			const normalized = getDateFromSections(setSectionsFromDate(this._sections, date));
			return normalized !== null && this._getValidationError(normalized, true) === null;
		}
		update(config) {
			if (typeof config !== "object") return;
			this._config = {
				...this._config,
				...config
			};
			this._typeCheckConfig(this._config);
			const previousDate = this._date;
			this._date = this._config.date ? this._convertDate(this._config.date) : null;
			this._minDate = this._convertDate(this._config.minDate);
			this._maxDate = this._convertDate(this._config.maxDate);
			this._sections = setSectionsFromDate(this._resolveSections(), this._date);
			this._draft = "";
			this._monthFormatter = new Intl.DateTimeFormat(this._config.locale, { month: "long" });
			this._createSectionInput();
			this._date = previousDate;
			this._updateDate();
		}
		_getDefaultSections() {
			throw new Error("Method \"_getDefaultSections\" must be implemented.");
		}
		_convertDate(value) {
			return convertToDateObject(value, "day", this._config.locale);
		}
		_resolveSections() {
			const { format, locale, monthNames } = this._config;
			if (typeof format === "function") return format(locale);
			if (typeof format === "string" && format.length > 0) return getSectionsFromFormat(format, locale, monthNames);
			return this._getDefaultSections(locale);
		}
		_addEventListeners() {
			const eventName = (name) => this.constructor.eventName(name);
			EventHandler.on(this._element, eventName("keydown"), SELECTOR_SECTION, (event) => {
				this._onKeydown(event);
			});
			EventHandler.on(this._element, eventName("beforeinput"), SELECTOR_SECTION, (event) => {
				event.preventDefault();
				if (!this._isEditable() || event.inputType !== "insertText" || !event.data) return;
				if (/^\d$/.test(event.data)) {
					this._applyDigit(event.target, event.data);
					return;
				}
				if (event.data.length === 1) this._applyLetter(event.target, event.data);
			});
			EventHandler.on(this._element, eventName("focusin"), SELECTOR_SECTION, (event) => {
				this._draft = "";
				this._setTabIndexes(event.target);
				this._selectSectionContent(event.target);
			});
			EventHandler.on(this._element, eventName("mousedown"), SELECTOR_SECTION, (event) => {
				if (this._config.disabled) return;
				event.preventDefault();
				event.target.focus();
				this._selectSectionContent(event.target);
			});
			EventHandler.on(this._element, eventName("focusout"), (event) => {
				if (!this._element.contains(event.relatedTarget)) {
					this._allSelected = false;
					this._element.classList.remove(CLASS_NAME_ALL_SELECTED);
					this._normalizeSections();
				}
			});
			EventHandler.on(this._element, eventName("paste"), (event) => {
				event.preventDefault();
				if (this._isEditable()) this._handlePaste(event.clipboardData.getData("text"));
			});
			EventHandler.on(this._element, eventName("copy"), (event) => {
				if (this._allSelected) {
					event.preventDefault();
					event.clipboardData.setData("text/plain", formatSections(this._sections));
				}
			});
			EventHandler.on(this._element, eventName("cut"), (event) => {
				if (this._allSelected) {
					event.preventDefault();
					event.clipboardData.setData("text/plain", formatSections(this._sections));
					if (this._isEditable()) {
						this.clear();
						this._getSectionElements()[0].focus();
					}
				}
			});
			const form = this._element.closest("form");
			if (form) EventHandler.on(form, eventName("submit"), () => {
				queueMicrotask(() => {
					if (!form.classList.contains(CLASS_NAME_WAS_VALIDATED)) return;
					const isInvalid = this._element.classList.contains(CLASS_NAME_IS_INVALID) || this._config.required && this._date === null;
					this._element.classList.toggle(CLASS_NAME_IS_INVALID, isInvalid);
					this._element.classList.toggle(CLASS_NAME_IS_VALID, !isInvalid);
				});
			});
			EventHandler.on(this._element, eventName("click"), (event) => {
				if (this._config.disabled || event.target.closest(SELECTOR_SECTION)) return;
				const sections = this._getSectionElements();
				const target = sections.find((sectionElement, index) => this._getSection(index).value === null) || sections[0];
				if (target) target.focus();
			});
		}
		_onKeydown(event) {
			const { key, target } = event;
			if (key === "Tab") return;
			if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === "a") {
				event.preventDefault();
				this._selectAllSections();
				return;
			}
			if ([
				ARROW_LEFT_KEY$5,
				ARROW_RIGHT_KEY$5,
				HOME_KEY$5,
				END_KEY$5
			].includes(key)) {
				event.preventDefault();
				this._focusSectionByKey(target, key);
				return;
			}
			if (!this._isEditable()) {
				if (key.length === 1) event.preventDefault();
				return;
			}
			if (this._allSelected && this._onKeydownAllSelected(event)) return;
			if (key === ARROW_UP_KEY$5 || key === ARROW_DOWN_KEY$6) {
				event.preventDefault();
				const section = this._getSection(this._getSectionIndex(target));
				section.value = getIncrementedSectionValue(section, key === ARROW_UP_KEY$5 ? 1 : -1, this._getSectionMax(section));
				this._draft = "";
				this._syncSections();
				this._updateDate();
				return;
			}
			if (key === BACKSPACE_KEY$2 || key === DELETE_KEY$1) {
				event.preventDefault();
				const section = this._getSection(this._getSectionIndex(target));
				if (key === BACKSPACE_KEY$2 && section.value === null) {
					this._focusSibling(target, false);
					return;
				}
				section.value = null;
				this._draft = "";
				this._syncSections();
				this._updateDate();
				return;
			}
			if (/^\d$/.test(key)) {
				event.preventDefault();
				this._applyDigit(target, key);
				return;
			}
			if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
				event.preventDefault();
				this._applyLetter(target, key);
			}
		}
		_onKeydownAllSelected(event) {
			const { key } = event;
			if (key === BACKSPACE_KEY$2 || key === DELETE_KEY$1) {
				event.preventDefault();
				this.clear();
				this._getSectionElements()[0].focus();
				return true;
			}
			if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
				event.preventDefault();
				this.clear();
				const firstSection = this._getSectionElements()[0];
				firstSection.focus();
				if (/^\d$/.test(key)) this._applyDigit(firstSection, key);
				else this._applyLetter(firstSection, key);
				return true;
			}
			return false;
		}
		_isRtl() {
			return window.getComputedStyle(this._element).direction === "rtl";
		}
		_focusSectionByKey(sectionElement, key) {
			if (key === HOME_KEY$5 || key === END_KEY$5) {
				const sections = this._getSectionElements();
				const first = this._isRtl() ? sections.length - 1 : 0;
				const last = this._isRtl() ? 0 : sections.length - 1;
				sections[key === HOME_KEY$5 ? first : last].focus();
				return;
			}
			const shouldMoveNext = key === (this._isRtl() ? ARROW_LEFT_KEY$5 : ARROW_RIGHT_KEY$5);
			this._focusSibling(sectionElement, shouldMoveNext);
		}
		_applyDigit(sectionElement, digit) {
			const section = this._getSection(this._getSectionIndex(sectionElement));
			this._applySectionInput(sectionElement, section, applyDigitToSection(section, this._draft, digit, this._getSectionMax(section)));
		}
		_applyLetter(sectionElement, letter) {
			const section = this._getSection(this._getSectionIndex(sectionElement));
			this._applySectionInput(sectionElement, section, applyLetterToSection(section, this._draft, letter));
		}
		_applySectionInput(sectionElement, section, result) {
			if (!result) return;
			const { draft, value, completed } = result;
			this._draft = completed ? "" : draft;
			section.value = value;
			this._syncSections();
			this._updateDate();
			if (completed) this._focusSibling(sectionElement, true);
			else this._selectSectionContent(sectionElement);
		}
		_handlePaste(text) {
			if (!text) return;
			if (this._config.inputDateParse) {
				const date = this._config.inputDateParse(text);
				if (date instanceof Date && !Number.isNaN(date.getTime())) {
					this._sections = setSectionsFromDate(this._sections, date);
					this._syncSections();
					this._updateDate();
				}
				return;
			}
			const sections = getSectionsFromString(text, this._sections);
			if (sections) {
				this._sections = sections;
				this._syncSections();
				this._updateDate();
				return;
			}
			const date = getLocalDateFromString(text, this._config.locale);
			if (date instanceof Date && !Number.isNaN(date.getTime())) {
				this._sections = setSectionsFromDate(this._sections, date);
				this._syncSections();
				this._updateDate();
			}
		}
		_normalizeSections() {
			for (const section of this._sections) {
				if (section.type === "literal" || section.value === null) continue;
				const { min } = getSectionBounds(section);
				section.value = Math.min(Math.max(section.value, min), this._getSectionMax(section));
			}
			this._draft = "";
			this._syncSections();
			this._updateDate();
		}
		_updateDate() {
			const nextDate = this._applyValidationState();
			if (this._isSameDate(nextDate, this._date)) return;
			this._date = nextDate;
			EventHandler.trigger(this._element, this.constructor.eventName(this.constructor.CHANGE_EVENT_NAME), { date: nextDate });
		}
		_applyValidationState() {
			for (const section of this._sections) if ((section.type === "day" || section.type === "week") && section.value !== null && section.value > this._getSectionMax(section)) {
				section.value = this._getSectionMax(section);
				this._syncSections();
			}
			const date = getDateFromSections(this._sections);
			const isFilled = this._sections.some((section) => section.type !== "literal" && section.value !== null);
			const error = this._getValidationError(date, isFilled);
			const isDisabled = error !== null && error !== "incomplete";
			this._element.classList.toggle(CLASS_NAME_FILLED, isFilled);
			this._element.classList.toggle(CLASS_NAME_IS_INVALID, isDisabled || this._config.invalid);
			this._setHiddenInputValue();
			if (error !== this._error) {
				this._error = error;
				EventHandler.trigger(this._element, this.constructor.eventName("errorChange"), { error });
			}
			return isDisabled ? null : date;
		}
		_getValidationError(date, isFilled) {
			if (!(date instanceof Date)) return isFilled ? "incomplete" : null;
			if (this._minDate && date < this._minDate) return "minDate";
			if (this._maxDate && date > this._maxDate) return "maxDate";
			if (isDateDisabled(date, null, null, this._config.disabledDates)) return "disabledDate";
			return null;
		}
		_isSameDate(date, date2) {
			if (date === null || date2 === null) return date === date2;
			return date.getTime() === date2.getTime();
		}
		_createSectionInput() {
			this._element.classList.add(CLASS_NAME_FORM_CONTROL$5, CLASS_NAME_SECTION_INPUT);
			this._element.classList.toggle(CLASS_NAME_DISABLED$3, this._config.disabled);
			this._element.classList.toggle(CLASS_NAME_IS_INVALID, this._config.invalid);
			this._element.classList.toggle(CLASS_NAME_IS_VALID, this._config.valid);
			this._element.setAttribute("role", "group");
			this._element.setAttribute("aria-label", this._config.ariaLabel);
			this._element.innerHTML = "";
			const sectionLabels = {
				...DefaultSectionLabels,
				...this._config.sectionLabels
			};
			for (const section of this._sections) {
				if (section.type === "literal") {
					const separatorElement = document.createElement("span");
					separatorElement.classList.add(CLASS_NAME_SEPARATOR$1);
					separatorElement.setAttribute("aria-hidden", "true");
					separatorElement.textContent = section.value;
					this._element.append(separatorElement);
					continue;
				}
				const { min, max } = getSectionBounds(section);
				const sectionElement = document.createElement("span");
				sectionElement.classList.add(CLASS_NAME_SECTION);
				sectionElement.setAttribute("role", "spinbutton");
				sectionElement.setAttribute("inputmode", section.names ? "text" : "numeric");
				sectionElement.setAttribute("autocorrect", "off");
				sectionElement.setAttribute("spellcheck", "false");
				sectionElement.setAttribute("aria-label", sectionLabels[section.type]);
				sectionElement.setAttribute("aria-valuemin", min);
				sectionElement.setAttribute("aria-valuemax", max);
				sectionElement.dataset.bsSection = section.type;
				if (!this._config.disabled) sectionElement.contentEditable = "true";
				if (this._config.disabled) sectionElement.setAttribute("aria-disabled", "true");
				if (this._config.readonly) sectionElement.setAttribute("aria-readonly", "true");
				this._element.append(sectionElement);
			}
			this._createHiddenInput();
			this._syncSections();
			this._setTabIndexes();
			this._element.classList.toggle(CLASS_NAME_FILLED, this._sections.some((section) => section.type !== "literal" && section.value !== null));
		}
		_createHiddenInput() {
			const hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			hiddenInput.disabled = this._config.disabled;
			hiddenInput.required = this._config.required;
			if (this._config.name || this._element.id) hiddenInput.name = this._config.name || `${this.constructor.NAME}-${this._element.id}`;
			this._element.append(hiddenInput);
			this._inputElement = hiddenInput;
			this._setHiddenInputValue();
		}
		_setHiddenInputValue() {
			if (this._inputElement) this._inputElement.value = getDateFromSections(this._sections) ? formatSections(this._sections) : "";
		}
		_syncSections() {
			const sectionElements = this._getSectionElements();
			for (const [index, sectionElement] of sectionElements.entries()) {
				const section = this._getSection(index);
				const placeholder = this._config.placeholders && this._config.placeholders[section.type] || section.placeholder || DefaultPlaceholders[section.type].slice(0, section.length);
				sectionElement.textContent = formatSectionValue(section, placeholder);
				sectionElement.classList.toggle(CLASS_NAME_SECTION_EMPTY, section.value === null);
				if (section.type === "day") sectionElement.setAttribute("aria-valuemax", this._getSectionMax(section));
				if (section.value === null) {
					sectionElement.removeAttribute("aria-valuenow");
					sectionElement.setAttribute("aria-valuetext", "Empty");
					continue;
				}
				const value = section.type === "year" ? getFullYearFromSection(section) : section.value;
				sectionElement.setAttribute("aria-valuenow", value);
				sectionElement.setAttribute("aria-valuetext", this._getSectionValueText(section, value));
			}
		}
		_getSectionValueText(section, value) {
			if (section.names) return section.names[section.value - 1];
			if (section.type === "month") return this._monthFormatter.format(new Date(2e3, section.value - 1, 1));
			return String(value);
		}
		_setTabIndexes(activeElement = null) {
			const sectionElements = this._getSectionElements();
			const focusableElement = activeElement || sectionElements[0];
			for (const sectionElement of sectionElements) sectionElement.tabIndex = !this._config.disabled && sectionElement === focusableElement ? 0 : -1;
		}
		_selectSectionContent(sectionElement) {
			this._allSelected = false;
			this._element.classList.remove(CLASS_NAME_ALL_SELECTED);
			const selection = window.getSelection();
			const range = document.createRange();
			range.selectNodeContents(sectionElement);
			selection.removeAllRanges();
			selection.addRange(range);
		}
		_selectAllSections() {
			this._allSelected = true;
			this._element.classList.add(CLASS_NAME_ALL_SELECTED);
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
			return !this._config.disabled && !this._config.readonly;
		}
		_getSection(index) {
			return this._sections.filter((section) => section.type !== "literal")[index];
		}
		_getSectionIndex(sectionElement) {
			return this._getSectionElements().indexOf(sectionElement);
		}
		_getSectionElements() {
			return SelectorEngine.find(SELECTOR_SECTION, this._element);
		}
		static componentInterface(element, config) {
			const data = this.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
	};
	//#endregion
	//#region js/src/date-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO date-input.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$32 = "date-input";
	const EVENT_LOAD_DATA_API$17 = `load.bs.date-input.data-api`;
	const SELECTOR_DATA_DATE_INPUT = "[data-bs-date-input]";
	const Default$31 = {
		...SectionInput.Default,
		ariaLabel: "Date input"
	};
	/**
	* Class definition
	*/
	var DateInput = class DateInput extends SectionInput {
		static get Default() {
			return Default$31;
		}
		static get NAME() {
			return NAME$32;
		}
		_getDefaultSections(locale) {
			return getSectionsFromLocale(locale);
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = DateInput.getOrCreateInstance(this);
				if (typeof config === "string") {
					if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
					data[config]();
				}
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$17, () => {
		for (const dateInput of SelectorEngine.find(SELECTOR_DATA_DATE_INPUT)) DateInput.componentInterface(dateInput);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(DateInput);
	//#endregion
	//#region js/src/util/form-control-group.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO util/form-control-group.js
	* License (https://coreui.io/pro/license/)
	*
	* The JavaScript side of the `.form-control-group` primitive: components that
	* assemble a control out of parts build their adornments the same way, so the
	* markup contract lives in one place rather than in each shell.
	* --------------------------------------------------------------------------
	*/
	const CLASS_NAME_FORM_FLOATING = "form-floating";
	const CLASS_NAME_GROUP = "form-control-group";
	const CLASS_NAME_FORM_CONTROL$4 = "form-control";
	/**
	* Returns the group a control sits in, building one around it when there is
	* none. A component that supplies its own adornments can supply the frame that
	* lays them out too, so its markup is a plain form control.
	*
	* Everything the author wrote on that control except `.form-control` moves to
	* the group: a class on the control describes the field, and once it is
	* wrapped the field is the frame — a margin left behind would sit inside the
	* border.
	* @param {HTMLElement} element The control.
	* @returns {ControlGroup} The group, whether it was created, and the classes moved onto it.
	*/
	const ensureControlGroup = (element) => {
		const existing = element.closest(`.${CLASS_NAME_GROUP}`);
		if (existing) return {
			created: false,
			element: existing,
			movedClassNames: []
		};
		const group = document.createElement("div");
		group.classList.add(CLASS_NAME_GROUP);
		const movedClassNames = [...element.classList].filter((name) => name !== CLASS_NAME_FORM_CONTROL$4);
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
	/**
	* Undoes ensureControlGroup: the classes go back on the control, and a group
	* this library created is removed. One the author wrote stays — it is theirs,
	* and may hold more than this control.
	* @param {HTMLElement} element The control.
	* @param {ControlGroup} group The group returned by ensureControlGroup.
	*/
	const releaseControlGroup = (element, group) => {
		element.classList.add(...group.movedClassNames);
		group.element.classList.remove(...group.movedClassNames);
		if (group.created) {
			group.element.before(element);
			group.element.remove();
		}
	};
	/**
	* Builds an adornment button for a form control group.
	* @param {object} options The button's class, icon, accessible label, disabled state and the icon sanitizer.
	* @returns {HTMLButtonElement} The button.
	*/
	/**
	* Appends a field to the group — wrapped in its own `.form-floating` with a
	* rendered `<label>` when `floatingLabel` is set, so a generated frame can
	* carry a floating label without any wrapper markup from the author. The
	* label text is the visible half; passing it on as the field's accessible
	* name is the caller's job, so the two stay one thing.
	* @param {HTMLElement} group The `.form-control-group` frame.
	* @param {HTMLElement} field The control to append.
	* @param {string | null} floatingLabel The label text, or null to append bare.
	* @param {string} uidPrefix Prefix for the generated id the label points at.
	*/
	const appendControlGroupField = (group, field, floatingLabel, uidPrefix) => {
		if (!floatingLabel) {
			group.append(field);
			return;
		}
		const wrapper = document.createElement("div");
		wrapper.classList.add(CLASS_NAME_FORM_FLOATING);
		field.id ||= getUID(uidPrefix);
		const label = document.createElement("label");
		label.htmlFor = field.id;
		label.textContent = floatingLabel;
		wrapper.append(label, field);
		group.append(wrapper);
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
	//#region js/src/date-picker.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO date-picker.js
	* License (https://coreui.io/pro/license/)
	*
	* Composed from existing primitives — DateInput (section field), Calendar, and
	* the Popup anchored-overlay util — rather than one monolith. Projected regions
	* (footer) come from a <template> child and act through the slot context, not
	* through configuration props.
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$31 = "date-picker";
	const EVENT_KEY$24 = `.bs.date-picker`;
	const DATA_API_KEY$21 = ".data-api";
	const EVENT_CLICK$8 = `click${EVENT_KEY$24}`;
	const EVENT_DATE_CHANGE$1 = `dateChange${EVENT_KEY$24}`;
	const EVENT_HIDDEN$12 = `hidden${EVENT_KEY$24}`;
	const EVENT_HIDE$7 = `hide${EVENT_KEY$24}`;
	const EVENT_SHOW$9 = `show${EVENT_KEY$24}`;
	const EVENT_SHOWN$9 = `shown${EVENT_KEY$24}`;
	const EVENT_LOAD_DATA_API$16 = `load${EVENT_KEY$24}${DATA_API_KEY$21}`;
	const CLASS_NAME_BODY$3 = "date-picker-body";
	const CLASS_NAME_CALENDAR$2 = "date-picker-calendar";
	const CLASS_NAME_CALENDARS$2 = "date-picker-calendars";
	const CLASS_NAME_DATE_PICKER$2 = "date-picker";
	const CLASS_NAME_DROPDOWN$3 = "date-picker-popup";
	const CLASS_NAME_FOOTER$3 = "date-picker-footer";
	const CLASS_NAME_CLEANER$4 = "form-control-cleaner";
	const CLASS_NAME_INDICATOR$3 = "form-control-action";
	const CLASS_NAME_FORM_CONTROL$3 = "form-control";
	const CLASS_NAME_INPUT_GROUP$4 = "form-control-group";
	const CLASS_NAME_PICKER$3 = "picker";
	const CLASS_NAME_POPUP$3 = "popup";
	const CLASS_NAME_SHOW$12 = "show";
	const SELECTOR_DATA_TOGGLE$20 = "[data-bs-toggle=\"date-picker\"]";
	const SELECTOR_TEMPLATE_FOOTER$3 = "template[data-bs-template=\"footer\"]";
	const SELECTOR_ACTION$3 = "[data-bs-picker-action]";
	const SELECTOR_ACTION_TODAY$1 = "[data-bs-picker-action=\"today\"]";
	const Default$30 = {
		allowList: SVGAllowlist,
		ariaCleanerLabel: "Clear the value",
		ariaToggleLabel: "Toggle the calendar",
		cleaner: true,
		cleanerIcon: CLEANER_ICON,
		calendarOptions: {},
		container: false,
		date: null,
		disabled: false,
		floatingLabel: null,
		indicatorIcon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M472 96h-88V40h-32v56H160V40h-32v56H40a24.03 24.03 0 0 0-24 24v336a24.03 24.03 0 0 0 24 24h432a24.03 24.03 0 0 0 24-24V120a24.03 24.03 0 0 0-24-24Zm-8 352H48V128h80v40h32v-40h192v40h32v-40h80Z\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"368\"/></svg>",
		inputOptions: {},
		locale: navigator.language,
		maxDate: null,
		minDate: null,
		name: null,
		sanitize: true,
		sanitizeFn: null,
		size: null
	};
	const DefaultType$30 = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaToggleLabel: "string",
		cleaner: "boolean",
		cleanerIcon: "string",
		calendarOptions: "object",
		container: "(string|element|boolean)",
		date: "(date|string|null)",
		disabled: "boolean",
		floatingLabel: "(string|null)",
		indicatorIcon: "string",
		inputOptions: "object",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		name: "(string|null)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		size: "(string|null)"
	};
	/**
	* Class definition
	*/
	var DatePicker = class extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER$3, this._element);
			this._initialDate = config?.date ?? this._config.date;
			this._cleanerElement = null;
			this._input = null;
			this._calendar = null;
			this._syncingFromPanel = false;
			this._calendarElement = null;
			this._menu = null;
			this._popup = null;
			this._createDatePicker();
			this._createPopup();
			this._addEventListeners();
		}
		static get Default() {
			return Default$30;
		}
		static get DefaultType() {
			return DefaultType$30;
		}
		static get NAME() {
			return NAME$31;
		}
		show() {
			if (this._config.disabled) return;
			this._popup.show();
		}
		hide() {
			this._popup.hide();
		}
		toggle() {
			return this._popup.isShown ? this.hide() : this.show();
		}
		getDate() {
			return this._input.getDate();
		}
		setDate(date) {
			this._input.update({ date });
		}
		clear() {
			this._input.clear();
		}
		reset() {
			this.setDate(this._initialDate);
		}
		today() {
			this.setDate(/* @__PURE__ */ new Date());
		}
		getContext() {
			return {
				clear: () => this.clear(),
				close: () => this.hide(),
				date: this.getDate(),
				disabled: this._config.disabled,
				isDateSelectable: (date) => this._input.isDateSelectable(date),
				reset: () => this.reset(),
				setDate: (date) => this.setDate(date),
				today: () => this.today()
			};
		}
		dispose() {
			if (this._addedGroupClass) this._element.classList.remove(CLASS_NAME_INPUT_GROUP$4);
			this._popup.dispose();
			this._input.dispose();
			this._calendar?.dispose();
			super.dispose();
		}
		_forwardConfig(Component, overrides = {}, extra = {}) {
			const forwarded = {};
			for (const key of Object.keys(Component.Default)) if (key in this._config && this._config[key] !== Default$30[key]) forwarded[key] = this._config[key];
			return {
				...forwarded,
				...overrides,
				...extra
			};
		}
		_resolveFormat() {
			if (this._config.format) return this._config.format;
			return {
				month: "MM/yyyy",
				quarter: "QQQ yyyy",
				week: getWeekSectionsFromLocale,
				year: "yyyy"
			}[this._config.selectionType] ?? null;
		}
		_sanitizeIcon(icon) {
			return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon;
		}
		_createDatePicker() {
			this._element.classList.add(CLASS_NAME_DATE_PICKER$2, CLASS_NAME_PICKER$3);
			const inputGroup = this._element;
			this._addedGroupClass = !inputGroup.classList.contains(CLASS_NAME_INPUT_GROUP$4);
			inputGroup.classList.add(CLASS_NAME_INPUT_GROUP$4);
			if (this._config.size) inputGroup.classList.add(`${CLASS_NAME_FORM_CONTROL$3}-${this._config.size}`);
			const inputEl = document.createElement("div");
			appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`);
			const action = (className, icon, label) => createControlGroupAction({
				className,
				disabled: this._config.disabled,
				icon,
				label,
				sanitizeIcon: (value) => this._sanitizeIcon(value)
			});
			if (this._config.cleaner) {
				this._cleanerElement = action(CLASS_NAME_CLEANER$4, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				inputGroup.append(this._cleanerElement);
			}
			const indicator = action(CLASS_NAME_INDICATOR$3, this._config.indicatorIcon, this._config.ariaToggleLabel);
			inputGroup.append(indicator);
			this._indicatorElement = indicator;
			this._input = new DateInput(inputEl, this._forwardConfig(DateInput, {
				date: this._config.date,
				disabled: this._config.disabled,
				locale: this._config.locale,
				name: this._config.name,
				...this._resolveFormat() ? { format: this._resolveFormat() } : {}
			}, {
				...this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {},
				...this._config.inputOptions
			}));
			EventHandler.on(inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event) => {
				if (!this._syncingFromPanel) {
					this._calendar?.update({ startDate: event.date });
					EventHandler.trigger(this._element, EVENT_DATE_CHANGE$1, { date: event.date });
				}
			});
			this._menu = document.createElement("div");
			this._menu.classList.add(CLASS_NAME_POPUP$3, CLASS_NAME_DROPDOWN$3);
			const body = document.createElement("div");
			body.classList.add(CLASS_NAME_BODY$3);
			const calendars = document.createElement("div");
			calendars.classList.add(CLASS_NAME_CALENDARS$2);
			this._calendarElement = document.createElement("div");
			this._calendarElement.classList.add(CLASS_NAME_CALENDAR$2);
			calendars.append(this._calendarElement);
			body.append(calendars);
			this._menu.append(body);
			if (this._footerTemplate) {
				const footer = document.createElement("div");
				footer.classList.add(CLASS_NAME_FOOTER$3);
				footer.append(this._footerTemplate.content.cloneNode(true));
				this._disableUnselectableActions(footer);
				this._menu.append(footer);
			}
		}
		_disableUnselectableActions(container) {
			if (this._input.isDateSelectable(/* @__PURE__ */ new Date())) return;
			for (const button of SelectorEngine.find(SELECTOR_ACTION_TODAY$1, container)) if ("disabled" in button) button.disabled = true;
		}
		_ensureCalendar() {
			if (this._calendar) return;
			this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
				locale: this._config.locale,
				startDate: this.getDate()
			}, this._config.calendarOptions));
			EventHandler.on(this._calendar._element, "startDateChange.bs.calendar", (event) => {
				const { date, dateObject } = event;
				this._syncingFromPanel = true;
				this._input.update({ date: dateObject });
				this._syncingFromPanel = false;
				EventHandler.trigger(this._element, EVENT_DATE_CHANGE$1, {
					date,
					dateObject
				});
				this.hide();
			});
		}
		_createPopup() {
			this._popup = new Popup({
				anchor: this._element,
				container: this._config.container,
				content: this._menu,
				onHidden: () => EventHandler.trigger(this._element, EVENT_HIDDEN$12),
				onHide: () => {
					this._menu.classList.remove(CLASS_NAME_SHOW$12);
					this._element.classList.remove(CLASS_NAME_SHOW$12);
					this._element.setAttribute("aria-expanded", "false");
					EventHandler.trigger(this._element, EVENT_HIDE$7);
				},
				onShow: () => {
					this._ensureCalendar();
					this._menu.classList.add(CLASS_NAME_SHOW$12);
					this._element.classList.add(CLASS_NAME_SHOW$12);
					this._element.setAttribute("aria-expanded", "true");
					EventHandler.trigger(this._element, EVENT_SHOW$9);
				},
				onShown: () => EventHandler.trigger(this._element, EVENT_SHOWN$9)
			});
		}
		_addEventListeners() {
			if (this._cleanerElement) EventHandler.on(this._cleanerElement, EVENT_CLICK$8, (event) => {
				event.stopPropagation();
				this.clear();
			});
			EventHandler.on(this._indicatorElement, EVENT_CLICK$8, () => {
				if (!this._config.disabled) this.toggle();
			});
			EventHandler.on(this._menu, EVENT_CLICK$8, SELECTOR_ACTION$3, (event) => {
				const action = event.target.closest(SELECTOR_ACTION$3).dataset.bsPickerAction;
				const context = this.getContext();
				if (typeof context[action] === "function") context[action]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$16, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE$20)) DatePicker.getOrCreateInstance(element);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(DatePicker);
	//#endregion
	//#region js/src/date-range-picker.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO date-range-picker.js
	* License (https://coreui.io/pro/license/)
	*
	* Composed from two DateInput section fields and one multi-month Calendar in a
	* Popup. The calendar owns the range mechanics (start/end, auto-advance); the
	* shell wires fields, popup, and the projected footer/ranges regions.
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$30 = "date-range-picker";
	const EVENT_KEY$23 = `.bs.date-range-picker`;
	const DATA_API_KEY$20 = ".data-api";
	const EVENT_CLICK$7 = `click${EVENT_KEY$23}`;
	const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY$23}`;
	const EVENT_FOCUSIN$4 = `focusin${EVENT_KEY$23}`;
	const EVENT_HIDDEN$11 = `hidden${EVENT_KEY$23}`;
	const EVENT_HIDE$6 = `hide${EVENT_KEY$23}`;
	const EVENT_SHOW$8 = `show${EVENT_KEY$23}`;
	const EVENT_SHOWN$8 = `shown${EVENT_KEY$23}`;
	const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY$23}`;
	const EVENT_LOAD_DATA_API$15 = `load${EVENT_KEY$23}${DATA_API_KEY$20}`;
	const CLASS_NAME_BODY$2 = "date-picker-body";
	const CLASS_NAME_CALENDAR$1 = "date-picker-calendar";
	const CLASS_NAME_CALENDARS$1 = "date-picker-calendars";
	const CLASS_NAME_DATE_PICKER$1 = "date-picker";
	const CLASS_NAME_DATE_RANGE_PICKER = "date-range-picker";
	const CLASS_NAME_DROPDOWN$2 = "date-picker-popup";
	const CLASS_NAME_FOOTER$2 = "date-picker-footer";
	const CLASS_NAME_CLEANER$3 = "form-control-cleaner";
	const CLASS_NAME_INDICATOR$2 = "form-control-action";
	const CLASS_NAME_FORM_CONTROL$2 = "form-control";
	const CLASS_NAME_INPUT_GROUP$3 = "form-control-group";
	const CLASS_NAME_PICKER$2 = "picker";
	const CLASS_NAME_POPUP$2 = "popup";
	const CLASS_NAME_RANGES = "date-picker-ranges";
	const CLASS_NAME_SEPARATOR = "form-control-icon";
	const CLASS_NAME_SHOW$11 = "show";
	const SELECTOR_DATA_TOGGLE$19 = "[data-bs-toggle=\"date-range-picker\"]";
	const SELECTOR_TEMPLATE_FOOTER$2 = "template[data-bs-template=\"footer\"]";
	const SELECTOR_TEMPLATE_RANGES = "template[data-bs-template=\"ranges\"]";
	const SELECTOR_ACTION$2 = "[data-bs-picker-action]";
	const Default$29 = {
		allowList: SVGAllowlist,
		ariaCleanerLabel: "Clear the value",
		ariaLabels: ["Start date", "End date"],
		ariaToggleLabel: "Toggle the calendar",
		cleaner: true,
		cleanerIcon: CLEANER_ICON,
		calendarOptions: {},
		calendars: 2,
		container: false,
		disabled: false,
		endDate: null,
		endName: null,
		floatingLabels: null,
		indicatorIcon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M472 96h-88V40h-32v56H160V40h-32v56H40a24.03 24.03 0 0 0-24 24v336a24.03 24.03 0 0 0 24 24h432a24.03 24.03 0 0 0 24-24V120a24.03 24.03 0 0 0-24-24Zm-8 352H48V128h80v40h32v-40h192v40h32v-40h80Z\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"368\"/></svg>",
		inputOptions: {},
		locale: navigator.language,
		maxDate: null,
		minDate: null,
		sanitize: true,
		sanitizeFn: null,
		separatorIcon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"m359.873 121.377-22.627 22.627 95.997 95.997H16v32.001h417.24l-95.994 95.994 22.627 22.627L494.498 256z\"/></svg>",
		separatorIconRtl: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"m152.127 121.377 22.627 22.627L78.757 240H496v32.001H78.76l95.994 95.994-22.627 22.627L17.502 256z\"/></svg>",
		size: null,
		startDate: null,
		startName: null
	};
	const DefaultType$29 = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaLabels: "array",
		ariaToggleLabel: "string",
		cleaner: "boolean",
		cleanerIcon: "string",
		calendarOptions: "object",
		calendars: "number",
		container: "(string|element|boolean)",
		disabled: "boolean",
		endDate: "(date|string|null)",
		endName: "(string|null)",
		floatingLabels: "(array|null)",
		indicatorIcon: "string",
		inputOptions: "object",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		separatorIcon: "string",
		separatorIconRtl: "string",
		size: "(string|null)",
		startDate: "(date|string|null)",
		startName: "(string|null)"
	};
	/**
	* Class definition
	*/
	var DateRangePicker = class extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER$2, this._element);
			this._rangesTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_RANGES, this._element);
			this._cleanerElement = null;
			this._startInput = null;
			this._endInput = null;
			this._calendar = null;
			this._syncingFromPanel = false;
			this._calendarElement = null;
			this._menu = null;
			this._popup = null;
			this._selectEndDate = false;
			this._initialStartDate = config?.startDate ?? this._config.startDate;
			this._initialEndDate = config?.endDate ?? this._config.endDate;
			this._createDateRangePicker();
			this._createPopup();
			this._addEventListeners();
		}
		static get Default() {
			return Default$29;
		}
		static get DefaultType() {
			return DefaultType$29;
		}
		static get NAME() {
			return NAME$30;
		}
		show() {
			if (this._config.disabled) return;
			this._popup.show();
		}
		hide() {
			this._popup.hide();
		}
		toggle() {
			return this._popup.isShown ? this.hide() : this.show();
		}
		getStartDate() {
			return this._startInput.getDate();
		}
		getEndDate() {
			return this._endInput.getDate();
		}
		setRange(startDate, endDate) {
			this._startInput.update({ date: startDate });
			this._endInput.update({ date: endDate });
			this._selectEndDate = false;
			this._calendar?.update({ selectEndDate: false });
		}
		clear() {
			this.setRange(null, null);
		}
		reset() {
			this.setRange(this._initialStartDate, this._initialEndDate);
		}
		getContext() {
			return {
				clear: () => this.clear(),
				close: () => this.hide(),
				disabled: this._config.disabled,
				endDate: this.getEndDate(),
				isDateSelectable: (date) => this._startInput.isDateSelectable(date),
				reset: () => this.reset(),
				setRange: (startDate, endDate) => this.setRange(startDate, endDate),
				startDate: this.getStartDate()
			};
		}
		dispose() {
			if (this._addedGroupClass) this._element.classList.remove(CLASS_NAME_INPUT_GROUP$3);
			this._popup.dispose();
			this._startInput.dispose();
			this._endInput.dispose();
			this._calendar?.dispose();
			super.dispose();
		}
		_forwardConfig(Component, overrides = {}, extra = {}) {
			const forwarded = {};
			for (const key of Object.keys(Component.Default)) if (key in this._config && this._config[key] !== Default$29[key]) forwarded[key] = this._config[key];
			return {
				...forwarded,
				...overrides,
				...extra
			};
		}
		_resolveFormat() {
			if (this._config.format) return this._config.format;
			return {
				month: "MM/yyyy",
				quarter: "QQQ yyyy",
				week: getWeekSectionsFromLocale,
				year: "yyyy"
			}[this._config.selectionType] ?? null;
		}
		_setSelectEndDate(value) {
			if (this._selectEndDate === value) return;
			this._selectEndDate = value;
			this._calendar?.update({ selectEndDate: value });
		}
		_sanitizeIcon(icon) {
			return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon;
		}
		_resolveSeparatorIcon() {
			return window.getComputedStyle(this._element).direction === "rtl" ? this._config.separatorIconRtl : this._config.separatorIcon;
		}
		_floatingLabel(index) {
			const labels = this._config.floatingLabels;
			return Array.isArray(labels) && labels[index] || null;
		}
		_ariaLabel(index) {
			const labels = this._config.ariaLabels;
			return Array.isArray(labels) && labels[index] || Default$29.ariaLabels[index];
		}
		_createInput(date, name, ariaLabel) {
			const inputEl = document.createElement("div");
			return {
				input: new DateInput(inputEl, this._forwardConfig(DateInput, {
					ariaLabel,
					date,
					disabled: this._config.disabled,
					locale: this._config.locale,
					name,
					...this._resolveFormat() ? { format: this._resolveFormat() } : {}
				}, this._config.inputOptions)),
				inputEl
			};
		}
		_createDateRangePicker() {
			this._element.classList.add(CLASS_NAME_DATE_PICKER$1, CLASS_NAME_DATE_RANGE_PICKER, CLASS_NAME_PICKER$2);
			const inputGroup = this._element;
			this._addedGroupClass = !inputGroup.classList.contains(CLASS_NAME_INPUT_GROUP$3);
			inputGroup.classList.add(CLASS_NAME_INPUT_GROUP$3);
			if (this._config.size) inputGroup.classList.add(`${CLASS_NAME_FORM_CONTROL$2}-${this._config.size}`);
			const start = this._createInput(this._config.startDate, this._config.startName, this._floatingLabel(0) ?? this._ariaLabel(0));
			this._startInput = start.input;
			this._startInputElement = start.inputEl;
			appendControlGroupField(inputGroup, start.inputEl, this._floatingLabel(0), `${this.constructor.NAME}-`);
			const separator = document.createElement("span");
			separator.classList.add(CLASS_NAME_SEPARATOR);
			separator.setAttribute("aria-hidden", "true");
			separator.innerHTML = this._sanitizeIcon(this._resolveSeparatorIcon());
			inputGroup.append(separator);
			const end = this._createInput(this._config.endDate, this._config.endName, this._floatingLabel(1) ?? this._ariaLabel(1));
			this._endInput = end.input;
			this._endInputElement = end.inputEl;
			appendControlGroupField(inputGroup, end.inputEl, this._floatingLabel(1), `${this.constructor.NAME}-`);
			EventHandler.on(start.inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event) => {
				if (!this._syncingFromPanel) {
					this._calendar?.update({ startDate: event.date });
					EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, { date: event.date });
				}
			});
			EventHandler.on(end.inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event) => {
				if (!this._syncingFromPanel) {
					this._calendar?.update({ endDate: event.date });
					EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, { date: event.date });
				}
			});
			const action = (className, icon, label) => createControlGroupAction({
				className,
				disabled: this._config.disabled,
				icon,
				label,
				sanitizeIcon: (value) => this._sanitizeIcon(value)
			});
			if (this._config.cleaner) {
				this._cleanerElement = action(CLASS_NAME_CLEANER$3, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				inputGroup.append(this._cleanerElement);
			}
			const indicator = action(CLASS_NAME_INDICATOR$2, this._config.indicatorIcon, this._config.ariaToggleLabel);
			inputGroup.append(indicator);
			this._indicatorElement = indicator;
			this._menu = document.createElement("div");
			this._menu.classList.add(CLASS_NAME_POPUP$2, CLASS_NAME_DROPDOWN$2);
			const body = document.createElement("div");
			body.classList.add(CLASS_NAME_BODY$2);
			if (this._rangesTemplate) {
				const ranges = document.createElement("div");
				ranges.classList.add(CLASS_NAME_RANGES);
				ranges.append(this._rangesTemplate.content.cloneNode(true));
				body.append(ranges);
			}
			const calendars = document.createElement("div");
			calendars.classList.add(CLASS_NAME_CALENDARS$1);
			this._calendarElement = document.createElement("div");
			this._calendarElement.classList.add(CLASS_NAME_CALENDAR$1);
			calendars.append(this._calendarElement);
			body.append(calendars);
			this._menu.append(body);
			if (this._footerTemplate) {
				const footer = document.createElement("div");
				footer.classList.add(CLASS_NAME_FOOTER$2);
				footer.append(this._footerTemplate.content.cloneNode(true));
				this._menu.append(footer);
			}
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
			}, this._config.calendarOptions));
			EventHandler.on(this._calendar._element, "selectEndChange.bs.calendar", (event) => {
				this._selectEndDate = event.value;
			});
			EventHandler.on(this._calendar._element, "startDateChange.bs.calendar", (event) => {
				const { date, dateObject } = event;
				this._syncingFromPanel = true;
				this._startInput.update({ date: dateObject });
				this._syncingFromPanel = false;
				EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, {
					date,
					dateObject
				});
			});
			EventHandler.on(this._calendar._element, "endDateChange.bs.calendar", (event) => {
				const { date, dateObject } = event;
				this._syncingFromPanel = true;
				this._endInput.update({ date: dateObject });
				this._syncingFromPanel = false;
				EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, {
					date,
					dateObject
				});
				if (dateObject && this.getStartDate() && !this._footerTemplate) this.hide();
			});
		}
		_createPopup() {
			this._popup = new Popup({
				anchor: this._element,
				container: this._config.container,
				content: this._menu,
				onHidden: () => EventHandler.trigger(this._element, EVENT_HIDDEN$11),
				onHide: () => {
					this._menu.classList.remove(CLASS_NAME_SHOW$11);
					this._element.classList.remove(CLASS_NAME_SHOW$11);
					this._element.setAttribute("aria-expanded", "false");
					EventHandler.trigger(this._element, EVENT_HIDE$6);
				},
				onShow: () => {
					this._ensureCalendar();
					this._menu.classList.add(CLASS_NAME_SHOW$11);
					this._element.classList.add(CLASS_NAME_SHOW$11);
					this._element.setAttribute("aria-expanded", "true");
					EventHandler.trigger(this._element, EVENT_SHOW$8);
				},
				onShown: () => EventHandler.trigger(this._element, EVENT_SHOWN$8)
			});
		}
		_addEventListeners() {
			if (this._cleanerElement) EventHandler.on(this._cleanerElement, EVENT_CLICK$7, (event) => {
				event.stopPropagation();
				this.clear();
			});
			EventHandler.on(this._indicatorElement, EVENT_CLICK$7, () => {
				if (!this._config.disabled) this.toggle();
			});
			EventHandler.on(this._startInputElement, EVENT_FOCUSIN$4, () => {
				this._setSelectEndDate(false);
			});
			EventHandler.on(this._endInputElement, EVENT_FOCUSIN$4, () => {
				this._setSelectEndDate(true);
			});
			EventHandler.on(this._menu, EVENT_CLICK$7, SELECTOR_ACTION$2, (event) => {
				const action = event.target.closest(SELECTOR_ACTION$2).dataset.bsPickerAction;
				const context = this.getContext();
				if (typeof context[action] === "function") context[action]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$15, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE$19)) DateRangePicker.getOrCreateInstance(element);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(DateRangePicker);
	//#endregion
	//#region js/src/date-time-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO date-time-input.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$29 = "date-time-input";
	const EVENT_LOAD_DATA_API$14 = `load.bs.date-time-input.data-api`;
	const SELECTOR_DATA_DATE_TIME_INPUT = "[data-bs-date-time-input]";
	const Default$28 = {
		...SectionInput.Default,
		ariaLabel: "Date and time input",
		seconds: false
	};
	const DefaultType$28 = {
		...SectionInput.DefaultType,
		seconds: "boolean"
	};
	/**
	* Class definition
	*/
	var DateTimeInput = class DateTimeInput extends SectionInput {
		static get Default() {
			return Default$28;
		}
		static get DefaultType() {
			return DefaultType$28;
		}
		static get NAME() {
			return NAME$29;
		}
		_convertDate(value) {
			const date = convertToDateObject(value, "day", this._config.locale, true);
			if (date instanceof Date && !Number.isNaN(date.getTime())) return date;
			if (typeof value === "string") {
				const parsed = new Date(value.includes("T") ? value : value.replace(" ", "T"));
				return Number.isNaN(parsed.getTime()) ? null : parsed;
			}
			return null;
		}
		_getDefaultSections(locale) {
			return getDateTimeSectionsFromLocale(locale, this._config.seconds);
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = DateTimeInput.getOrCreateInstance(this);
				if (typeof config === "string") {
					if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
					data[config]();
				}
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$14, () => {
		for (const dateTimeInput of SelectorEngine.find(SELECTOR_DATA_DATE_TIME_INPUT)) DateTimeInput.componentInterface(dateTimeInput);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(DateTimeInput);
	//#endregion
	//#region js/src/util/time-selection.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO util/time-selection.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$28 = "time-selection";
	const CLASS_NAME_INLINE_SELECT = "time-picker-inline-select";
	const CLASS_NAME_ROLL = "time-picker-roll";
	const CLASS_NAME_ROLL_CELL = "time-picker-roll-cell";
	const CLASS_NAME_ROLL_COL = "time-picker-roll-col";
	const CLASS_NAME_SELECTED$1 = "selected";
	const ARROW_DOWN_KEY$5 = "ArrowDown";
	const ARROW_LEFT_KEY$4 = "ArrowLeft";
	const ARROW_RIGHT_KEY$4 = "ArrowRight";
	const ARROW_UP_KEY$4 = "ArrowUp";
	const END_KEY$4 = "End";
	const ENTER_KEY$2 = "Enter";
	const HOME_KEY$4 = "Home";
	const SPACE_KEY$2 = "Space";
	const EVENT_KEYDOWN$5 = `keydown.bs.time-selection`;
	const SELECTOR_ROLL_CELL = `.${CLASS_NAME_ROLL_CELL}`;
	const SELECTOR_ROLL_CELL_FOCUSABLE = `.${CLASS_NAME_ROLL_CELL}[tabindex="0"]`;
	const SELECTOR_ROLL_COL = `.${CLASS_NAME_ROLL_COL}`;
	const Default$27 = {
		ariaSelectHoursLabel: "Select hours",
		ariaSelectMeridiemLabel: "Select AM/PM",
		ariaSelectMinutesLabel: "Select minutes",
		ariaSelectSecondsLabel: "Select seconds",
		hours: null,
		locale: "default",
		minutes: true,
		onChange: null,
		seconds: true,
		time: null,
		variant: "roll"
	};
	const DefaultType$27 = {
		ariaSelectHoursLabel: "string",
		ariaSelectMeridiemLabel: "string",
		ariaSelectMinutesLabel: "string",
		ariaSelectSecondsLabel: "string",
		hours: "(array|function|null)",
		locale: "string",
		minutes: "(array|boolean|function)",
		onChange: "(function|null)",
		seconds: "(array|boolean|function)",
		time: "(date|null)",
		variant: "string"
	};
	/**
	* Class definition
	*
	* The popup body of the time pickers — the counterpart of Calendar for the time
	* half. Owns the roll/select rendering and the hour/minute/second/meridiem
	* arithmetic; reports a Date through `onChange` and holds no popup, field, or
	* event-name concerns. Shared by TimePicker and DateTimePicker.
	*/
	var TimeSelection = class extends Config {
		constructor(element, config) {
			super();
			this._element = element;
			this._config = this._getConfig(config);
			this._date = this._config.time;
			this._ampm = this._date ? this._date.getHours() >= 12 ? "pm" : "am" : "am";
			this._render();
		}
		static get Default() {
			return Default$27;
		}
		static get DefaultType() {
			return DefaultType$27;
		}
		static get NAME() {
			return NAME$28;
		}
		getTime() {
			return this._date;
		}
		update(config) {
			this._config = this._getConfig({
				...this._config,
				...config
			});
			this._date = this._config.time;
			this._ampm = this._date ? this._date.getHours() >= 12 ? "pm" : "am" : "am";
			this._render();
		}
		dispose() {
			EventHandler.off(this._element, EVENT_KEYDOWN$5);
			this._element.innerHTML = "";
			this._element = null;
		}
		_render() {
			this._partials = getLocalizedTimePartials(this._config.locale, "auto", this._config.hours, this._config.minutes, this._config.seconds);
			this._element.innerHTML = "";
			this._element.classList.toggle(CLASS_NAME_ROLL, this._config.variant === "roll");
			if (this._config.variant === "select") {
				EventHandler.off(this._element, EVENT_KEYDOWN$5);
				this._renderSelects();
			} else {
				this._renderRoll();
				this._addRollKeyboardNavigation();
			}
			this._markSelected(true);
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
			if (this._partials.hour12) parts.push({
				ariaLabel: this._config.ariaSelectMeridiemLabel,
				name: "meridiem",
				options: [{
					label: "AM",
					value: "am"
				}, {
					label: "PM",
					value: "pm"
				}]
			});
			return parts;
		}
		_renderRoll() {
			for (const part of this._parts()) {
				const column = document.createElement("div");
				column.classList.add(CLASS_NAME_ROLL_COL);
				column.setAttribute("role", "listbox");
				column.setAttribute("aria-label", part.ariaLabel);
				for (const [index, option] of part.options.entries()) {
					const cell = document.createElement("div");
					cell.classList.add(CLASS_NAME_ROLL_CELL);
					cell.setAttribute("role", "option");
					cell.setAttribute("aria-label", option.label.toString());
					cell.setAttribute("aria-selected", "false");
					cell.tabIndex = index === 0 ? 0 : -1;
					cell.textContent = option.label;
					Manipulator.setDataAttribute(cell, part.name, option.value);
					cell.addEventListener("click", () => this._change(part.name, option.value));
					cell.addEventListener("keydown", (event) => {
						if (event.code === SPACE_KEY$2 || event.key === ENTER_KEY$2) {
							event.preventDefault();
							this._change(part.name, option.value);
							this._moveFocusToColumn(cell, 1);
						}
					});
					column.append(cell);
				}
				this._element.append(column);
			}
		}
		_addRollKeyboardNavigation() {
			EventHandler.off(this._element, EVENT_KEYDOWN$5);
			EventHandler.on(this._element, EVENT_KEYDOWN$5, SELECTOR_ROLL_CELL, (event) => {
				const target = event.target;
				if (event.key === ARROW_DOWN_KEY$5 || event.key === ARROW_UP_KEY$4) {
					event.preventDefault();
					const items = SelectorEngine.find(SELECTOR_ROLL_CELL, target.parentElement);
					if (items.length === 0) return;
					getNextActiveElement(items, target, event.key === ARROW_DOWN_KEY$5, !items.includes(target))?.focus();
					return;
				}
				if (event.key === HOME_KEY$4 || event.key === END_KEY$4) {
					event.preventDefault();
					const items = SelectorEngine.find(SELECTOR_ROLL_CELL, target.parentElement);
					if (items.length === 0) return;
					items[event.key === HOME_KEY$4 ? 0 : items.length - 1].focus();
					return;
				}
				if (event.key === ARROW_LEFT_KEY$4 || event.key === ARROW_RIGHT_KEY$4) {
					event.preventDefault();
					const goLeft = event.key === ARROW_LEFT_KEY$4 && !isRTL$1() || event.key === ARROW_RIGHT_KEY$4 && isRTL$1();
					this._moveFocusToColumn(target, goLeft ? -1 : 1);
				}
			});
		}
		_moveFocusToColumn(cell, offset) {
			const columns = SelectorEngine.find(SELECTOR_ROLL_COL, this._element);
			const index = columns.indexOf(cell.parentElement) + offset;
			if (index < 0 || index > columns.length - 1) return;
			SelectorEngine.findOne(SELECTOR_ROLL_CELL_FOCUSABLE, columns[index])?.focus();
		}
		_renderSelects() {
			for (const [index, part] of this._parts().entries()) {
				if (index > 0 && part.name !== "meridiem") {
					const separator = document.createElement("span");
					separator.textContent = ":";
					this._element.append(separator);
				}
				const select = document.createElement("select");
				select.classList.add(CLASS_NAME_INLINE_SELECT, part.name);
				select.setAttribute("aria-label", part.ariaLabel);
				select.addEventListener("change", (event) => this._change(part.name, event.target.value));
				for (const option of part.options) {
					const optionEl = document.createElement("option");
					optionEl.value = option.value;
					optionEl.textContent = option.label;
					select.append(optionEl);
				}
				this._element.append(select);
			}
		}
		_change(part, value) {
			const date = this._date ? new Date(this._date) : /* @__PURE__ */ new Date("1970-01-01T00:00:00");
			if (part === "meridiem") {
				const hours = date.getHours();
				this._ampm = value;
				if (value === "am" && hours >= 12) date.setHours(hours - 12);
				if (value === "pm" && hours < 12) date.setHours(hours + 12);
			}
			if (part === "hours") date.setHours(isAmPm(this._config.locale) ? convert12hTo24h(this._ampm, Number.parseInt(value, 10)) : Number.parseInt(value, 10));
			if (part === "minutes") date.setMinutes(Number.parseInt(value, 10));
			if (part === "seconds") date.setSeconds(Number.parseInt(value, 10));
			this._date = date;
			this._markSelected();
			execute(this._config.onChange, [void 0, date]);
		}
		_scrollToSelected(column, cell, instant) {
			column.scrollTo({
				behavior: instant ? "instant" : "smooth",
				top: cell.offsetTop
			});
		}
		_markSelected(instant = false) {
			const selected = {
				hours: getSelectedHour(this._date, this._config.locale),
				meridiem: this._ampm,
				minutes: getSelectedMinutes(this._date),
				seconds: getSelectedSeconds(this._date)
			};
			for (const [part, value] of Object.entries(selected)) {
				if (value === "") continue;
				if (this._config.variant === "select") {
					const select = SelectorEngine.findOne(`select.${part}`, this._element);
					if (select) select.value = value;
					continue;
				}
				for (const cell of SelectorEngine.find(`[data-bs-${part}]`, this._element)) {
					const isSelected = String(Manipulator.getDataAttribute(cell, part)) === String(value);
					cell.classList.toggle(CLASS_NAME_SELECTED$1, isSelected);
					cell.setAttribute("aria-selected", isSelected ? "true" : "false");
					cell.tabIndex = isSelected ? 0 : -1;
					if (isSelected && cell.parentElement) this._scrollToSelected(cell.parentElement, cell, instant);
				}
			}
		}
	};
	//#endregion
	//#region js/src/date-time-picker.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO date-time-picker.js
	* License (https://coreui.io/pro/license/)
	*
	* A DateTimeInput section field plus a popup holding a Calendar and the
	* TimeSelection body — the date and the time halves are independent primitives,
	* composed here.
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$27 = "date-time-picker";
	const EVENT_KEY$22 = `.bs.date-time-picker`;
	const DATA_API_KEY$19 = ".data-api";
	const EVENT_CLICK$6 = `click${EVENT_KEY$22}`;
	const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY$22}`;
	const EVENT_HIDDEN$10 = `hidden${EVENT_KEY$22}`;
	const EVENT_HIDE$5 = `hide${EVENT_KEY$22}`;
	const EVENT_LOAD_DATA_API$13 = `load${EVENT_KEY$22}${DATA_API_KEY$19}`;
	const EVENT_SHOW$7 = `show${EVENT_KEY$22}`;
	const EVENT_SHOWN$7 = `shown${EVENT_KEY$22}`;
	const CLASS_NAME_BODY$1 = "date-picker-body";
	const CLASS_NAME_CALENDAR = "date-picker-calendar";
	const CLASS_NAME_CALENDARS = "date-picker-calendars";
	const CLASS_NAME_DATE_PICKER = "date-picker";
	const CLASS_NAME_DATE_TIME_PICKER = "date-time-picker";
	const CLASS_NAME_DROPDOWN$1 = "date-picker-popup";
	const CLASS_NAME_FOOTER$1 = "date-picker-footer";
	const CLASS_NAME_CLEANER$2 = "form-control-cleaner";
	const CLASS_NAME_INDICATOR$1 = "form-control-action";
	const CLASS_NAME_FORM_CONTROL$1 = "form-control";
	const CLASS_NAME_INPUT_GROUP$2 = "form-control-group";
	const CLASS_NAME_PICKER$1 = "picker";
	const CLASS_NAME_POPUP$1 = "popup";
	const CLASS_NAME_SHOW$10 = "show";
	const CLASS_NAME_TIME_BODY = "time-picker-body";
	const CLASS_NAME_TIME_PICKERS = "date-picker-timepickers";
	const SELECTOR_ACTION$1 = "[data-bs-picker-action]";
	const SELECTOR_ACTION_TODAY = "[data-bs-picker-action=\"today\"]";
	const SELECTOR_DATA_TOGGLE$18 = "[data-bs-toggle=\"date-time-picker\"]";
	const SELECTOR_TEMPLATE_FOOTER$1 = "template[data-bs-template=\"footer\"]";
	const Default$26 = {
		allowList: SVGAllowlist,
		ariaCleanerLabel: "Clear the value",
		ariaToggleLabel: "Toggle the calendar",
		cleaner: true,
		cleanerIcon: CLEANER_ICON,
		calendarOptions: {},
		container: false,
		date: null,
		disabled: false,
		floatingLabel: null,
		indicatorIcon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M472 96h-88V40h-32v56H160V40h-32v56H40a24.03 24.03 0 0 0-24 24v336a24.03 24.03 0 0 0 24 24h432a24.03 24.03 0 0 0 24-24V120a24.03 24.03 0 0 0-24-24Zm-8 352H48V128h80v40h32v-40h192v40h32v-40h80Z\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"224\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"296\"/><rect width=\"32\" height=\"32\" x=\"112\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"200\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"280\" y=\"368\"/><rect width=\"32\" height=\"32\" x=\"368\" y=\"368\"/></svg>",
		inputOptions: {},
		locale: navigator.language,
		maxDate: null,
		minDate: null,
		name: null,
		sanitize: true,
		sanitizeFn: null,
		selectionOptions: {},
		size: null,
		variant: "roll"
	};
	const DefaultType$26 = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaToggleLabel: "string",
		cleaner: "boolean",
		cleanerIcon: "string",
		calendarOptions: "object",
		container: "(string|element|boolean)",
		date: "(date|string|null)",
		disabled: "boolean",
		floatingLabel: "(string|null)",
		indicatorIcon: "string",
		inputOptions: "object",
		locale: "string",
		maxDate: "(date|string|null)",
		minDate: "(date|string|null)",
		name: "(string|null)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		selectionOptions: "object",
		size: "(string|null)",
		variant: "string"
	};
	/**
	* Class definition
	*/
	var DateTimePicker = class extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER$1, this._element);
			this._initialDate = config?.date ?? this._config.date;
			this._cleanerElement = null;
			this._input = null;
			this._calendar = null;
			this._syncingFromPanel = false;
			this._calendarElement = null;
			this._selection = null;
			this._selectionElement = null;
			this._menu = null;
			this._popup = null;
			this._createDateTimePicker();
			this._createPopup();
			this._addEventListeners();
		}
		static get Default() {
			return Default$26;
		}
		static get DefaultType() {
			return DefaultType$26;
		}
		static get NAME() {
			return NAME$27;
		}
		show() {
			if (this._config.disabled) return;
			this._popup.show();
		}
		hide() {
			this._popup.hide();
		}
		toggle() {
			return this._popup.isShown ? this.hide() : this.show();
		}
		getDate() {
			return this._input.getDate();
		}
		setDate(date) {
			this._input.update({ date });
		}
		today() {
			this.setDate(/* @__PURE__ */ new Date());
		}
		clear() {
			this._input.clear();
		}
		reset() {
			this.setDate(this._initialDate);
		}
		getContext() {
			return {
				clear: () => this.clear(),
				close: () => this.hide(),
				date: this.getDate(),
				disabled: this._config.disabled,
				isDateSelectable: (date) => this._input.isDateSelectable(date),
				reset: () => this.reset(),
				setDate: (date) => this.setDate(date),
				today: () => this.today()
			};
		}
		dispose() {
			if (this._addedGroupClass) this._element.classList.remove(CLASS_NAME_INPUT_GROUP$2);
			this._popup.dispose();
			this._input.dispose();
			this._calendar?.dispose();
			this._selection?.dispose();
			super.dispose();
		}
		_forwardConfig(Component, overrides = {}, extra = {}) {
			const forwarded = {};
			for (const key of Object.keys(Component.Default)) if (key in this._config && this._config[key] !== Default$26[key]) forwarded[key] = this._config[key];
			return {
				...forwarded,
				...overrides,
				...extra
			};
		}
		_sanitizeIcon(icon) {
			return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon;
		}
		_createDateTimePicker() {
			this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_TIME_PICKER, CLASS_NAME_PICKER$1);
			const inputGroup = this._element;
			this._addedGroupClass = !inputGroup.classList.contains(CLASS_NAME_INPUT_GROUP$2);
			inputGroup.classList.add(CLASS_NAME_INPUT_GROUP$2);
			if (this._config.size) inputGroup.classList.add(`${CLASS_NAME_FORM_CONTROL$1}-${this._config.size}`);
			const inputEl = document.createElement("div");
			appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`);
			const action = (className, icon, label) => createControlGroupAction({
				className,
				disabled: this._config.disabled,
				icon,
				label,
				sanitizeIcon: (value) => this._sanitizeIcon(value)
			});
			if (this._config.cleaner) {
				this._cleanerElement = action(CLASS_NAME_CLEANER$2, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				inputGroup.append(this._cleanerElement);
			}
			const indicator = action(CLASS_NAME_INDICATOR$1, this._config.indicatorIcon, this._config.ariaToggleLabel);
			inputGroup.append(indicator);
			this._indicatorElement = indicator;
			this._input = new DateTimeInput(inputEl, this._forwardConfig(DateTimeInput, {
				date: this._config.date,
				disabled: this._config.disabled,
				locale: this._config.locale,
				name: this._config.name
			}, {
				...this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {},
				...this._config.inputOptions
			}));
			EventHandler.on(inputEl, DateTimeInput.eventName(DateTimeInput.CHANGE_EVENT_NAME), (event) => {
				if (!this._syncingFromPanel) {
					this._calendar?.update({ startDate: event.date });
					this._selection?.update({ time: event.date });
					EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: event.date });
				}
			});
			this._menu = document.createElement("div");
			this._menu.classList.add(CLASS_NAME_POPUP$1, CLASS_NAME_DROPDOWN$1);
			const body = document.createElement("div");
			body.classList.add(CLASS_NAME_BODY$1);
			const calendars = document.createElement("div");
			calendars.classList.add(CLASS_NAME_CALENDARS);
			this._calendarElement = document.createElement("div");
			this._calendarElement.classList.add(CLASS_NAME_CALENDAR);
			calendars.append(this._calendarElement);
			body.append(calendars);
			const timePickers = document.createElement("div");
			timePickers.classList.add(CLASS_NAME_TIME_PICKERS);
			this._selectionElement = document.createElement("div");
			this._selectionElement.classList.add(CLASS_NAME_TIME_BODY);
			timePickers.append(this._selectionElement);
			body.append(timePickers);
			this._menu.append(body);
			if (this._footerTemplate) {
				const footer = document.createElement("div");
				footer.classList.add(CLASS_NAME_FOOTER$1);
				footer.append(this._footerTemplate.content.cloneNode(true));
				this._disableUnselectableActions(footer);
				this._menu.append(footer);
			}
		}
		_disableUnselectableActions(container) {
			if (this._input.isDateSelectable(/* @__PURE__ */ new Date())) return;
			for (const button of SelectorEngine.find(SELECTOR_ACTION_TODAY, container)) if ("disabled" in button) button.disabled = true;
		}
		_ensureBodies() {
			if (this._calendar) return;
			this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
				locale: this._config.locale,
				startDate: this.getDate()
			}, this._config.calendarOptions));
			this._selection = new TimeSelection(this._selectionElement, this._forwardConfig(TimeSelection, {
				locale: this._config.locale,
				onChange: (time) => this._applyTime(time),
				time: this.getDate(),
				variant: this._config.variant
			}, this._config.selectionOptions));
			EventHandler.on(this._calendar._element, "startDateChange.bs.calendar", (event) => {
				this._applyDate(event.dateObject);
			});
		}
		_applyDate(date) {
			if (!date) return;
			const current = this.getDate();
			const merged = new Date(date);
			if (current) merged.setHours(current.getHours(), current.getMinutes(), current.getSeconds());
			this._syncingFromPanel = true;
			this._input.update({ date: merged });
			this._syncingFromPanel = false;
			this._selection?.update({ time: merged });
			EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: this.getDate() });
		}
		_applyTime(time) {
			if (!time) return;
			const current = this.getDate();
			const merged = current ? new Date(current) : /* @__PURE__ */ new Date();
			merged.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
			this._syncingFromPanel = true;
			this._input.update({ date: merged });
			this._syncingFromPanel = false;
			this._calendar?.update({ startDate: merged });
			EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: this.getDate() });
		}
		_createPopup() {
			this._popup = new Popup({
				anchor: this._element,
				container: this._config.container,
				content: this._menu,
				onHidden: () => EventHandler.trigger(this._element, EVENT_HIDDEN$10),
				onHide: () => {
					this._menu.classList.remove(CLASS_NAME_SHOW$10);
					this._element.classList.remove(CLASS_NAME_SHOW$10);
					this._element.setAttribute("aria-expanded", "false");
					EventHandler.trigger(this._element, EVENT_HIDE$5);
				},
				onShow: () => {
					this._menu.classList.add(CLASS_NAME_SHOW$10);
					this._element.classList.add(CLASS_NAME_SHOW$10);
					this._ensureBodies();
					this._element.setAttribute("aria-expanded", "true");
					EventHandler.trigger(this._element, EVENT_SHOW$7);
				},
				onShown: () => EventHandler.trigger(this._element, EVENT_SHOWN$7)
			});
		}
		_addEventListeners() {
			if (this._cleanerElement) EventHandler.on(this._cleanerElement, EVENT_CLICK$6, (event) => {
				event.stopPropagation();
				this.clear();
			});
			EventHandler.on(this._indicatorElement, EVENT_CLICK$6, () => {
				if (!this._config.disabled) this.toggle();
			});
			EventHandler.on(this._menu, EVENT_CLICK$6, SELECTOR_ACTION$1, (event) => {
				const action = event.target.closest(SELECTOR_ACTION$1).dataset.bsPickerAction;
				const context = this.getContext();
				if (typeof context[action] === "function") context[action]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$13, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE$18)) DateTimePicker.getOrCreateInstance(element);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(DateTimePicker);
	//#endregion
	//#region js/src/util/legacy-markup.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/legacy-markup.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Transitional v5 → v6 markup upgrade for Modal and Offcanvas, removed in v7.
	*
	* v5 shipped both components as <div> structures; v6 renders them on the
	* native <dialog> element. When a component is instantiated on legacy markup,
	* the markup is rebuilt in place: a <dialog> carrying the element's
	* attributes and (flattened) children is inserted INSIDE the original
	* element, which stays in the DOM as an inert `display: contents` shell.
	* Keeping the shell preserves consumer references to the old element —
	* bubbling `*.bs.*` events still reach listeners bound to it, and
	* constructing a component with the old reference resolves to the inner
	* <dialog>. Only selectors targeting the removed wrapper layers
	* (`.modal-dialog`, `.modal-content`) cannot be preserved.
	*/
	const ATTRIBUTE_SHELL = "data-bs-legacy-shell";
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
	/**
	* Unwraps a previously migrated shell without touching anything else — safe
	* for lookups (getInstance) that must not mutate the DOM.
	*/
	const unwrapLegacyShell = (element, name) => {
		const resolved = getElement(element);
		if (resolved && resolved.getAttribute(ATTRIBUTE_SHELL) === name) return resolved.querySelector("dialog");
		return resolved;
	};
	/**
	* Resolves the element a dialog-based component should mount on. Returns the
	* element untouched when it is already a <dialog>; unwraps a previously
	* migrated shell; rebuilds legacy v5 markup.
	*/
	const resolveDialogElement = (element, name) => {
		const resolved = getElement(element);
		if (!resolved || resolved instanceof HTMLDialogElement) return resolved;
		if (resolved.getAttribute(ATTRIBUTE_SHELL) === name) return resolved.querySelector("dialog");
		if (resolved instanceof HTMLElement && matchesComponent(resolved, name)) return migrate(resolved, name);
		return resolved;
	};
	//#endregion
	//#region js/src/dialog-base.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI dialog-base.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's dialog-base.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const CLASS_NAME_OPEN = "dialog-open";
	const CLASS_NAME_HIDING = "hiding";
	/**
	* Class definition
	*
	* Shared base class for the Modal and Offcanvas components, built on the
	* native <dialog> element. Provides the show/hide/toggle lifecycle with
	* events, opening via showModal()/show(), Escape handling for modal and
	* non-modal states, backdrop-click dismissal, the static-backdrop "bounce",
	* body scroll prevention, and child component cleanup.
	*/
	var DialogBase = class extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._isTransitioning = false;
			this._openedAsModal = false;
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
			if (this._element.open || this._isTransitioning) return;
			if (EventHandler.trigger(this._element, this.constructor.eventName("show"), { relatedTarget }).defaultPrevented) return;
			this._isTransitioning = true;
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
		async hide() {
			if (!this._element.open || this._isTransitioning) return;
			if (EventHandler.trigger(this._element, this.constructor.eventName("hide")).defaultPrevented) return;
			this._isTransitioning = true;
			this._hideElement();
			await this._queueCallback(() => {
				if (this._element.open) this._closeAndCleanup();
				this._element.classList.remove(CLASS_NAME_HIDING);
				this._onAfterHide();
				this._isTransitioning = false;
				EventHandler.trigger(this._element, this.constructor.eventName("hidden"));
			}, this._element, this._isAnimated());
		}
		dispose() {
			if (this._element.open) this._closeAndCleanup();
			EventHandler.off(this._element, "cancel", this._cancelHandler);
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
			this._element.close();
			this._openedAsModal = false;
			if (!document.querySelector("dialog[open]:modal")) document.documentElement.classList.remove(CLASS_NAME_OPEN);
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
			for (const element of SelectorEngine.find("[data-bs-toggle=\"tooltip\"], [data-bs-toggle=\"popover\"]", this._element)) {
				const instance = data_default.get(element, "bs.tooltip") ?? data_default.get(element, "bs.popover");
				if (instance && typeof instance.hide === "function") instance.hide();
			}
			for (const element of SelectorEngine.find(".toast.show", this._element)) {
				const instance = data_default.get(element, "bs.toast");
				if (instance && typeof instance.hide === "function") instance.hide();
			}
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
	/**
	* --------------------------------------------------------------------------
	* CoreUI dialog.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's dialog.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$26 = "dialog";
	const EVENT_KEY$21 = `.bs.dialog`;
	const DATA_API_KEY$18 = ".data-api";
	const EVENT_SHOW$6 = `show${EVENT_KEY$21}`;
	const EVENT_SHOWN$6 = `shown${EVENT_KEY$21}`;
	const EVENT_HIDDEN$9 = `hidden${EVENT_KEY$21}`;
	const EVENT_CANCEL$1 = `cancel${EVENT_KEY$21}`;
	const EVENT_CLICK_DATA_API$12 = `click${EVENT_KEY$21}${DATA_API_KEY$18}`;
	const CLASS_NAME_NONMODAL$1 = "dialog-nonmodal";
	const CLASS_NAME_INSTANT$2 = "dialog-instant";
	const CLASS_NAME_SWAP_IN$1 = "dialog-swap-in";
	const SELECTOR_DATA_TOGGLE$17 = "[data-bs-toggle=\"dialog\"]";
	const Default$25 = {
		backdrop: true,
		keyboard: true,
		modal: true
	};
	const DefaultType$25 = {
		backdrop: "(boolean|string)",
		keyboard: "boolean",
		modal: "boolean"
	};
	/**
	* Class definition
	*/
	var Dialog = class Dialog extends DialogBase {
		static get Default() {
			return Default$25;
		}
		static get DefaultType() {
			return DefaultType$25;
		}
		static get NAME() {
			return NAME$26;
		}
		handleUpdate() {}
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
		static jQueryInterface(config, relatedTarget) {
			return this.each(function() {
				const data = Dialog.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](relatedTarget);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_CLICK_DATA_API$12, SELECTOR_DATA_TOGGLE$17, function(event) {
		const target = SelectorEngine.getElementFromSelector(this);
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		EventHandler.one(target, EVENT_SHOW$6, (showEvent) => {
			if (showEvent.defaultPrevented) return;
			EventHandler.one(target, EVENT_HIDDEN$9, () => {
				if (isVisible(this)) this.focus({ preventScroll: true });
			});
		});
		const currentDialog = this.closest("dialog[open]");
		if (currentDialog && currentDialog !== target && target) {
			const newDialog = Dialog.getOrCreateInstance(target);
			target.classList.add(CLASS_NAME_SWAP_IN$1);
			newDialog.show(this);
			EventHandler.one(target, EVENT_SHOWN$6, () => {
				target.classList.remove(CLASS_NAME_SWAP_IN$1);
			});
			const currentInstance = Dialog.getInstance(currentDialog);
			if (currentInstance) {
				currentDialog.classList.add(CLASS_NAME_INSTANT$2);
				EventHandler.one(currentDialog, EVENT_HIDDEN$9, () => {
					currentDialog.classList.remove(CLASS_NAME_INSTANT$2);
				});
				currentInstance.hide();
			}
			return;
		}
		Dialog.getOrCreateInstance(target).toggle(this);
	});
	enableDismissTrigger(Dialog);
	/**
	* jQuery
	*/
	defineJQueryPlugin(Dialog);
	//#endregion
	//#region js/src/drawer.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI drawer.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's drawer.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$25 = "drawer";
	const EVENT_KEY$20 = `.bs.drawer`;
	const DATA_API_KEY$17 = ".data-api";
	const EVENT_LOAD_DATA_API$12 = `load${EVENT_KEY$20}${DATA_API_KEY$17}`;
	const EVENT_HIDDEN$8 = `hidden${EVENT_KEY$20}`;
	const EVENT_RESIZE$3 = `resize${EVENT_KEY$20}`;
	const EVENT_CLICK_DATA_API$11 = `click${EVENT_KEY$20}${DATA_API_KEY$17}`;
	const OPEN_SELECTOR$1 = "dialog[open][class*=\"drawer\"]";
	const SELECTOR_DATA_TOGGLE$16 = "[data-bs-toggle=\"drawer\"]";
	const SELECTOR_DISMISS_SCOPE$1 = ".drawer, .drawer-sm, .drawer-md, .drawer-lg, .drawer-xl, .drawer-xxl";
	const Default$24 = {
		backdrop: true,
		keyboard: true,
		scroll: false
	};
	const DefaultType$24 = {
		backdrop: "(boolean|string)",
		keyboard: "boolean",
		scroll: "boolean"
	};
	/**
	* Class definition
	*/
	var Drawer = class Drawer extends DialogBase {
		static get Default() {
			return Default$24;
		}
		static get DefaultType() {
			return DefaultType$24;
		}
		static get NAME() {
			return NAME$25;
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
			return this.each(function() {
				const data = Drawer.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config](this);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_CLICK_DATA_API$11, SELECTOR_DATA_TOGGLE$16, function(event) {
		const target = SelectorEngine.getElementFromSelector(this);
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if (isDisabled(this)) return;
		EventHandler.one(target, EVENT_HIDDEN$8, () => {
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
		for (const element of SelectorEngine.find(OPEN_SELECTOR$1)) if (getComputedStyle(element).position !== "fixed") Drawer.getOrCreateInstance(element).hide();
	});
	enableDismissTrigger(Drawer, "hide", SELECTOR_DISMISS_SCOPE$1);
	/**
	* jQuery
	*/
	defineJQueryPlugin(Drawer);
	//#endregion
	//#region js/src/menu.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI menu.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's menu.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	*
	* Deviation from upstream: the selectors and class hooks live in static
	* getters, not module constants, so Dropdown can subclass Menu and keep the
	* v5 markup working.
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$24 = "menu";
	const EVENT_KEY$19 = `.bs.menu`;
	const DATA_API_KEY$16 = ".data-api";
	const ESCAPE_KEY$2 = "Escape";
	const TAB_KEY$1 = "Tab";
	const ARROW_UP_KEY$3 = "ArrowUp";
	const ARROW_DOWN_KEY$4 = "ArrowDown";
	const ARROW_LEFT_KEY$3 = "ArrowLeft";
	const ARROW_RIGHT_KEY$3 = "ArrowRight";
	const HOME_KEY$3 = "Home";
	const END_KEY$3 = "End";
	const ENTER_KEY$1 = "Enter";
	const SPACE_KEY$1 = " ";
	const RIGHT_MOUSE_BUTTON$1 = 2;
	const SUBMENU_CLOSE_DELAY = 100;
	const EVENT_CLICK_DATA_API$10 = `click${EVENT_KEY$19}${DATA_API_KEY$16}`;
	const EVENT_KEYDOWN_DATA_API$2 = `keydown${EVENT_KEY$19}${DATA_API_KEY$16}`;
	const EVENT_KEYUP_DATA_API$2 = `keyup${EVENT_KEY$19}${DATA_API_KEY$16}`;
	const CLASS_NAME_SHOW$9 = "show";
	const SELECTOR_NAVBAR_NAV = ".navbar-nav";
	const DEFAULT_PLACEMENT = "bottom-start";
	const SUBMENU_PLACEMENT = "end-start";
	const resolveLogicalPlacement = (placement) => {
		if (isRTL$1()) return placement.replace(/^start(?=-|$)/, "right").replace(/^end(?=-|$)/, "left");
		return placement.replace(/^start(?=-|$)/, "left").replace(/^end(?=-|$)/, "right");
	};
	const triangleSign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
	const Default$23 = {
		autoClose: true,
		boundary: "clippingParents",
		container: false,
		display: "dynamic",
		offset: [0, 2],
		floatingConfig: null,
		menu: null,
		placement: DEFAULT_PLACEMENT,
		reference: "toggle",
		strategy: "absolute",
		submenuTrigger: "both",
		submenuDelay: SUBMENU_CLOSE_DELAY
	};
	const DefaultType$23 = {
		autoClose: "(boolean|string)",
		boundary: "(string|element)",
		container: "(string|element|boolean)",
		display: "string",
		offset: "(array|string|function)",
		floatingConfig: "(null|object|function)",
		menu: "(null|element)",
		placement: "string",
		reference: "(string|element|object)",
		strategy: "string",
		submenuTrigger: "string",
		submenuDelay: "number"
	};
	/**
	* Class definition
	*/
	var Menu = class Menu extends BaseComponent {
		static {
			this._openInstances = /* @__PURE__ */ new Set();
		}
		constructor(element, config) {
			if (typeof computePosition === "undefined") throw new TypeError("CoreUI's menus require Floating UI (https://floating-ui.com)");
			super(element, config);
			this._floatingCleanup = null;
			this._mediaQueryListeners = [];
			this._responsivePlacements = null;
			this._parent = this._element.parentNode;
			this._openSubmenus = /* @__PURE__ */ new Map();
			this._submenuCloseTimeouts = /* @__PURE__ */ new Map();
			this._hoverIntentData = null;
			this._menu = this._config.menu || this._findMenu();
			if (!this._config.menu && this._menu) this._parent = this._findWrapper(this._menu);
			this._isSubmenu = this._parent.classList?.contains(this.constructor.SELECTOR_SUBMENU.slice(1));
			this._menuOriginalParent = this._menu?.parentNode;
			this._parseResponsivePlacements();
			this._setupSubmenuListeners();
		}
		static get SELECTOR_DATA_TOGGLE() {
			return "[data-bs-toggle=\"menu\"]:not(.disabled):not(:disabled)";
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
			return Default$23;
		}
		static get DefaultType() {
			return DefaultType$23;
		}
		static get NAME() {
			return NAME$24;
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
			this._menu.classList.add(CLASS_NAME_SHOW$9);
			this._element.classList.add(CLASS_NAME_SHOW$9);
			if (this._parent) this._parent.classList.add(CLASS_NAME_SHOW$9);
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
			this._menu.classList.remove(CLASS_NAME_SHOW$9);
			this._element.classList.remove(CLASS_NAME_SHOW$9);
			if (this._parent) this._parent.classList.remove(CLASS_NAME_SHOW$9);
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
			if (typeof config.reference === "object" && !isElement$1(config.reference) && typeof config.reference.getBoundingClientRect !== "function") throw new TypeError(`${NAME$24.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
			return config;
		}
		_createFloating() {
			if (this._config.display === "static") {
				Manipulator.setDataAttribute(this._menu, "display", "static");
				return;
			}
			let referenceElement = this._element;
			if (this._config.reference === "parent") referenceElement = this._parent;
			else if (isElement$1(this._config.reference)) referenceElement = getElement(this._config.reference);
			else if (typeof this._config.reference === "object") referenceElement = this._config.reference;
			this._updateFloatingPosition(referenceElement);
			this._floatingCleanup = autoUpdate(referenceElement, this._menu, () => this._updateFloatingPosition(referenceElement));
		}
		async _updateFloatingPosition(referenceElement = null) {
			if (!this._menu) return;
			if (!referenceElement) {
				if (this._config.reference === "parent") referenceElement = this._parent;
				else if (isElement$1(this._config.reference)) referenceElement = getElement(this._config.reference);
				else if (typeof this._config.reference === "object") referenceElement = this._config.reference;
				else referenceElement = this._element;
			}
			const placement = this._getPlacement();
			const middleware = this._getFloatingMiddleware();
			const floatingConfig = this._getFloatingConfig(placement, middleware);
			await this._applyFloatingPosition(referenceElement, this._menu, floatingConfig.placement, floatingConfig.middleware, floatingConfig.strategy);
		}
		_isShown() {
			return this._menu.classList.contains(CLASS_NAME_SHOW$9);
		}
		_getPlacement() {
			const placement = this._responsivePlacements ? getResponsivePlacement(this._responsivePlacements, DEFAULT_PLACEMENT) : this._config.placement;
			return resolveLogicalPlacement(placement);
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
				offset(typeof offsetValue === "function" ? offsetValue : toFloatingOffset(offsetValue)),
				flip({
					fallbackPlacements: this._getFallbackPlacements(),
					fallbackStrategy: "initialPlacement"
				}),
				shift({ boundary: this._config.boundary === "clippingParents" ? "clippingAncestors" : this._config.boundary })
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
			return container === true ? document.body : getElement(container);
		}
		_moveMenuToContainer() {
			const container = this._getContainer();
			if (!container || !this._menu) return;
			if (this._menu.parentNode !== container) container.append(this._menu);
		}
		_restoreMenuToOriginalParent() {
			if (!this._menuOriginalParent || !this._menu) return;
			if (this._menu.parentNode !== this._menuOriginalParent) this._menuOriginalParent.append(this._menu);
		}
		async _applyFloatingPosition(reference, floating, placement, middleware, strategy = "absolute") {
			if (!floating.isConnected) return null;
			const { x, y, placement: finalPlacement } = await computePosition(reference, floating, {
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
				EventHandler.on(this._menu, "mouseenter", this.constructor.SELECTOR_SUBMENU_TOGGLE, (event) => {
					this._onSubmenuTriggerEnter(event);
				});
				EventHandler.on(this._menu, "mouseleave", this.constructor.SELECTOR_SUBMENU, (event) => {
					this._onSubmenuLeave(event);
				});
				EventHandler.on(this._menu, "mousemove", (event) => {
					this._trackMousePosition(event);
				});
			}
			if (this._config.submenuTrigger === "click" || this._config.submenuTrigger === "both") EventHandler.on(this._menu, "click", this.constructor.SELECTOR_SUBMENU_TOGGLE, (event) => {
				this._onSubmenuTriggerClick(event);
			});
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
			submenu.classList.add(CLASS_NAME_SHOW$9);
			submenuWrapper.classList.add(CLASS_NAME_SHOW$9);
			const cleanup = this._createSubmenuFloating(trigger, submenu, submenuWrapper);
			this._openSubmenus.set(submenu, cleanup);
			EventHandler.on(submenu, "mouseenter", () => {
				this._cancelSubmenuCloseTimeout(submenu);
			});
		}
		_closeSubmenu(submenu, submenuWrapper) {
			if (!this._openSubmenus.has(submenu)) return;
			const nestedSubmenus = SelectorEngine.find(`${this.constructor.SELECTOR_SUBMENU} ${this.constructor.SELECTOR_MENU}.${CLASS_NAME_SHOW$9}`, submenu);
			for (const nested of nestedSubmenus) {
				const nestedWrapper = nested.closest(this.constructor.SELECTOR_SUBMENU);
				this._closeSubmenu(nested, nestedWrapper);
			}
			const trigger = SelectorEngine.findOne(this.constructor.SELECTOR_SUBMENU_TOGGLE, submenuWrapper);
			const cleanup = this._openSubmenus.get(submenu);
			if (cleanup) cleanup();
			this._openSubmenus.delete(submenu);
			EventHandler.off(submenu, "mouseenter");
			if (trigger) trigger.setAttribute("aria-expanded", "false");
			submenu.classList.remove(CLASS_NAME_SHOW$9);
			submenuWrapper.classList.remove(CLASS_NAME_SHOW$9);
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
			const siblingSubmenus = SelectorEngine.find(`${this.constructor.SELECTOR_SUBMENU} > ${this.constructor.SELECTOR_MENU}.${CLASS_NAME_SHOW$9}`, parent);
			for (const siblingMenu of siblingSubmenus) {
				const siblingWrapper = siblingMenu.closest(this.constructor.SELECTOR_SUBMENU);
				if (siblingWrapper !== currentSubmenuWrapper) this._closeSubmenu(siblingMenu, siblingWrapper);
			}
		}
		_createSubmenuFloating(trigger, submenu, submenuWrapper) {
			const referenceElement = submenuWrapper;
			const placement = resolveLogicalPlacement(SUBMENU_PLACEMENT);
			const middleware = [
				offset({
					mainAxis: 0,
					crossAxis: -4
				}),
				flip({ fallbackPlacements: [
					resolveLogicalPlacement("start-start"),
					resolveLogicalPlacement("end-end"),
					resolveLogicalPlacement("start-end")
				] }),
				shift({ padding: 8 })
			];
			const updatePosition = () => this._applyFloatingPosition(referenceElement, submenu, placement, middleware).then((finalPlacement) => {
				submenu.style.opacity = "";
				return finalPlacement;
			});
			updatePosition();
			return autoUpdate(referenceElement, submenu, updatePosition);
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
			const targetX = isRTL$1() ? submenuRect.right : submenuRect.left;
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
		_selectMenuItem({ key, target }) {
			const currentMenu = target.closest(this.constructor.SELECTOR_MENU) || this._menu;
			const items = SelectorEngine.find(`:scope > ${this.constructor.SELECTOR_VISIBLE_ITEMS}`, currentMenu).filter((element) => isVisible(element));
			if (!items.length) return;
			getNextActiveElement(items, target, key === ARROW_DOWN_KEY$4, !items.includes(target)).focus();
		}
		_handleSubmenuKeydown(event) {
			const { key, target } = event;
			const isRtl = isRTL$1();
			const enterKey = isRtl ? ARROW_LEFT_KEY$3 : ARROW_RIGHT_KEY$3;
			const exitKey = isRtl ? ARROW_RIGHT_KEY$3 : ARROW_LEFT_KEY$3;
			const submenuWrapper = target.closest(this.constructor.SELECTOR_SUBMENU);
			const isSubmenuToggle = target.matches(this.constructor.SELECTOR_SUBMENU_TOGGLE);
			if ((key === ENTER_KEY$1 || key === SPACE_KEY$1) && submenuWrapper && isSubmenuToggle) {
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
			if (key === HOME_KEY$3 || key === END_KEY$3) {
				event.preventDefault();
				event.stopPropagation();
				const currentMenu = target.closest(this.constructor.SELECTOR_MENU);
				const items = SelectorEngine.find(`:scope > ${this.constructor.SELECTOR_VISIBLE_ITEMS}`, currentMenu).filter((element) => isVisible(element));
				if (items.length) (key === HOME_KEY$3 ? items[0] : items[items.length - 1]).focus();
				return true;
			}
			return false;
		}
		static clearMenus(event) {
			if (event.button === RIGHT_MOUSE_BUTTON$1 || event.type === "keyup" && event.key !== TAB_KEY$1) return;
			for (const instance of Menu._openInstances) {
				if (instance._config.autoClose === false) continue;
				const composedPath = event.composedPath();
				const isMenuTarget = composedPath.includes(instance._menu);
				if (composedPath.includes(instance._element) || instance._config.autoClose === "inside" && !isMenuTarget || instance._config.autoClose === "outside" && isMenuTarget) continue;
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
			const isUpOrDownEvent = [ARROW_UP_KEY$3, ARROW_DOWN_KEY$4].includes(event.key);
			const isLeftOrRightEvent = [ARROW_LEFT_KEY$3, ARROW_RIGHT_KEY$3].includes(event.key);
			const isHomeOrEndEvent = [HOME_KEY$3, END_KEY$3].includes(event.key);
			const isEnterOrSpaceEvent = [ENTER_KEY$1, SPACE_KEY$1].includes(event.key);
			const isSubmenuTrigger = event.target.matches(this.SELECTOR_SUBMENU_TOGGLE);
			if (!isUpOrDownEvent && !isEscapeEvent && !isLeftOrRightEvent && !isHomeOrEndEvent && !(isEnterOrSpaceEvent && isSubmenuTrigger)) return;
			if (isInput && !isEscapeEvent) return;
			const getToggleButton = delegateTarget.matches(this.SELECTOR_DATA_TOGGLE) ? delegateTarget : SelectorEngine.prev(delegateTarget, this.SELECTOR_DATA_TOGGLE)[0] || SelectorEngine.next(delegateTarget, this.SELECTOR_DATA_TOGGLE)[0] || SelectorEngine.findOne(this.SELECTOR_DATA_TOGGLE, delegateTarget.parentNode ?? void 0);
			if (!getToggleButton) return;
			const instance = this.getOrCreateInstance(getToggleButton);
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
				getToggleButton.focus();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Menu.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API$2, Menu.SELECTOR_DATA_TOGGLE, (event) => Menu.dataApiKeydownHandler(event));
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API$2, Menu.SELECTOR_MENU, (event) => Menu.dataApiKeydownHandler(event));
	EventHandler.on(document, EVENT_CLICK_DATA_API$10, Menu.clearMenus);
	EventHandler.on(document, EVENT_KEYUP_DATA_API$2, Menu.clearMenus);
	EventHandler.on(document, EVENT_CLICK_DATA_API$10, Menu.SELECTOR_DATA_TOGGLE, function(event) {
		event.preventDefault();
		Menu.getOrCreateInstance(this).toggle();
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Menu);
	//#endregion
	//#region js/src/dropdown.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI dropdown.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* Dropdown is the v5 compatibility surface built on the Menu implementation:
	* the same engine, keyboard handling and dismissal, with the v5 class names,
	* events (`*.bs.dropdown`), class-driven placement and the navbar/static
	* CSS hook preserved. The acceptance contract is the untouched v5 spec suite.
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$23 = "dropdown";
	const EVENT_KEY$18 = `.bs.dropdown`;
	const DATA_API_KEY$15 = ".data-api";
	const ARROW_DOWN_KEY$3 = "ArrowDown";
	const EVENT_CLICK_DATA_API$9 = `click${EVENT_KEY$18}${DATA_API_KEY$15}`;
	const EVENT_KEYDOWN_DATA_API$1 = `keydown${EVENT_KEY$18}${DATA_API_KEY$15}`;
	const CLASS_NAME_DROPUP = "dropup";
	const CLASS_NAME_DROPEND = "dropend";
	const CLASS_NAME_DROPSTART = "dropstart";
	const CLASS_NAME_DROPUP_CENTER = "dropup-center";
	const CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
	const SELECTOR_NAVBAR = ".navbar";
	const PLACEMENT_TOP = isRTL$1() ? "top-end" : "top-start";
	const PLACEMENT_TOPEND = isRTL$1() ? "top-start" : "top-end";
	const PLACEMENT_BOTTOM = isRTL$1() ? "bottom-end" : "bottom-start";
	const PLACEMENT_BOTTOMEND = isRTL$1() ? "bottom-start" : "bottom-end";
	const PLACEMENT_RIGHT = isRTL$1() ? "left-start" : "right-start";
	const PLACEMENT_LEFT = isRTL$1() ? "right-start" : "left-start";
	const PLACEMENT_TOPCENTER = "top";
	const PLACEMENT_BOTTOMCENTER = "bottom";
	const Default$22 = { ...Menu.Default };
	const DefaultType$22 = { ...Menu.DefaultType };
	/**
	* Class definition
	*/
	var Dropdown = class Dropdown extends Menu {
		constructor(element, config) {
			super(element, config);
			this._inNavbar = this._detectNavbar();
		}
		static get SELECTOR_DATA_TOGGLE() {
			return "[data-bs-toggle=\"dropdown\"]:not(.disabled):not(:disabled)";
		}
		static get SELECTOR_MENU() {
			return ".dropdown-menu";
		}
		static get SELECTOR_VISIBLE_ITEMS() {
			return ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
		}
		static get Default() {
			return Default$22;
		}
		static get DefaultType() {
			return DefaultType$22;
		}
		static get NAME() {
			return NAME$23;
		}
		update() {
			this._inNavbar = this._detectNavbar();
			super.update();
		}
		_getPlacement() {
			const parentDropdown = this._parent;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) return PLACEMENT_RIGHT;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) return PLACEMENT_LEFT;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) return PLACEMENT_TOPCENTER;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) return PLACEMENT_BOTTOMCENTER;
			const isEnd = getComputedStyle(this._menu).getPropertyValue("--bs-position").trim() === "end";
			if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
			return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
		}
		_createFloating() {
			if (this._inNavbar || this._config.display === "static") {
				Manipulator.setDataAttribute(this._menu, "popper", "static");
				return;
			}
			super._createFloating();
		}
		_removeMenuAttributes() {
			super._removeMenuAttributes();
			Manipulator.removeDataAttribute(this._menu, "popper");
		}
		_selectMenuItem({ key, target }) {
			const items = SelectorEngine.find(this.constructor.SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => isVisible(element));
			if (!items.length) return;
			getNextActiveElement(items, target, key === ARROW_DOWN_KEY$3, !items.includes(target)).focus();
		}
		_detectNavbar() {
			return this._element.closest(SELECTOR_NAVBAR) !== null;
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Dropdown.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			});
		}
	};
	/**
	* Data API implementation
	*
	* clearMenus is not re-registered here: Menu's document-level registration
	* iterates the open-instance registry, which the subclass shares.
	*/
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API$1, Dropdown.SELECTOR_DATA_TOGGLE, (event) => Dropdown.dataApiKeydownHandler(event));
	EventHandler.on(document, EVENT_KEYDOWN_DATA_API$1, Dropdown.SELECTOR_MENU, (event) => Dropdown.dataApiKeydownHandler(event));
	EventHandler.on(document, EVENT_CLICK_DATA_API$9, Dropdown.SELECTOR_DATA_TOGGLE, function(event) {
		event.preventDefault();
		Dropdown.getOrCreateInstance(this).toggle();
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Dropdown);
	//#endregion
	//#region js/src/loading-button.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO loading-button.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$22 = "loading-button";
	const DATA_KEY$2 = "bs.loading-button";
	const EVENT_KEY$17 = `.${DATA_KEY$2}`;
	const DATA_API_KEY$14 = ".data-api";
	const EVENT_START = `start${EVENT_KEY$17}`;
	const EVENT_STOP = `stop${EVENT_KEY$17}`;
	const EVENT_CLICK_DATA_API$8 = `click${EVENT_KEY$17}${DATA_API_KEY$14}`;
	const CLASS_NAME_IS_LOADING = "is-loading";
	const CLASS_NAME_LOADING_BUTTON = "btn-loading";
	const CLASS_NAME_LOADING_BUTTON_SPINNER = "btn-loading-spinner";
	const SELECTOR_DATA_TOGGLE$15 = "[data-bs-toggle=\"loading-button\"]";
	const Default$21 = {
		disabledOnLoading: false,
		spinner: true,
		spinnerType: "border",
		timeout: false
	};
	const DefaultType$21 = {
		disabledOnLoading: "boolean",
		spinner: "boolean",
		spinnerType: "string",
		timeout: "(boolean|number)"
	};
	/**
	* Class definition
	*/
	var LoadingButton = class LoadingButton extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._timeout = this._config.timeout;
			this._spinner = null;
			this._state = "idle";
			if (this._element) data_default.set(element, DATA_KEY$2, this);
			this._createButton();
		}
		static get Default() {
			return Default$21;
		}
		static get DefaultType() {
			return DefaultType$21;
		}
		static get NAME() {
			return NAME$22;
		}
		start() {
			if (this._state !== "loading") {
				this._createSpinner();
				this._state = "loading";
				setTimeout(() => {
					this._element.classList.add(CLASS_NAME_IS_LOADING);
					EventHandler.trigger(this._element, EVENT_START);
					if (this._config.disabledOnLoading) this._element.setAttribute("disabled", true);
				}, 1);
				if (this._config.timeout) setTimeout(() => {
					this.stop();
				}, this._config.timeout);
			}
		}
		stop() {
			this._element.classList.remove(CLASS_NAME_IS_LOADING);
			const stoped = () => {
				this._removeSpinner();
				this._state = "idle";
				if (this._config.disabledOnLoading) this._element.removeAttribute("disabled");
				EventHandler.trigger(this._element, EVENT_STOP);
			};
			if (this._spinner) {
				this._queueCallback(stoped, this._spinner, true);
				return;
			}
			stoped();
		}
		_createButton() {
			this._element.classList.add(CLASS_NAME_LOADING_BUTTON);
		}
		_createSpinner() {
			if (this._config.spinner) {
				const spinner = document.createElement("span");
				const type = this._config.spinnerType;
				spinner.classList.add(CLASS_NAME_LOADING_BUTTON_SPINNER, `spinner-${type}`);
				spinner.setAttribute("role", "status");
				spinner.setAttribute("aria-hidden", "true");
				this._element.insertBefore(spinner, this._element.firstChild);
				this._spinner = spinner;
			}
		}
		_removeSpinner() {
			if (this._config.spinner) {
				this._spinner.remove();
				this._spinner = null;
			}
		}
		static loadingButtonInterface(element, config) {
			const data = LoadingButton.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				LoadingButton.loadingButtonInterface(this, config);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_CLICK_DATA_API$8, SELECTOR_DATA_TOGGLE$15, (event) => {
		const button = event.target.closest(SELECTOR_DATA_TOGGLE$15);
		LoadingButton.getOrCreateInstance(button).start();
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(LoadingButton);
	//#endregion
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
	const NAME$21 = "modal";
	const EVENT_KEY$16 = `.bs.modal`;
	const DATA_API_KEY$13 = ".data-api";
	const EVENT_SHOW$5 = `show${EVENT_KEY$16}`;
	const EVENT_SHOWN$5 = `shown${EVENT_KEY$16}`;
	const EVENT_HIDDEN$7 = `hidden${EVENT_KEY$16}`;
	const EVENT_CANCEL = `cancel${EVENT_KEY$16}`;
	const EVENT_CLICK_DATA_API$7 = `click${EVENT_KEY$16}${DATA_API_KEY$13}`;
	const CLASS_NAME_NONMODAL = "modal-nonmodal";
	const CLASS_NAME_INSTANT$1 = "modal-instant";
	const CLASS_NAME_SWAP_IN = "modal-swap-in";
	const SELECTOR_DATA_TOGGLE$14 = "[data-bs-toggle=\"modal\"]";
	const Default$20 = {
		backdrop: true,
		keyboard: true,
		modal: true
	};
	const DefaultType$20 = {
		backdrop: "(boolean|string)",
		keyboard: "boolean",
		modal: "boolean"
	};
	/**
	* Class definition
	*/
	var Modal = class Modal extends DialogBase {
		constructor(element, config) {
			super(resolveDialogElement(element, NAME$21), config);
		}
		static get Default() {
			return Default$20;
		}
		static get DefaultType() {
			return DefaultType$20;
		}
		static get NAME() {
			return NAME$21;
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
			EventHandler.trigger(this._element, EVENT_CANCEL);
		}
		static jQueryInterface(config, relatedTarget) {
			return this.each(function() {
				const data = Modal.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](relatedTarget);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_CLICK_DATA_API$7, SELECTOR_DATA_TOGGLE$14, function(event) {
		const target = resolveDialogElement(SelectorEngine.getElementFromSelector(this), NAME$21);
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		EventHandler.one(target, EVENT_SHOW$5, (showEvent) => {
			if (showEvent.defaultPrevented) return;
			EventHandler.one(target, EVENT_HIDDEN$7, () => {
				if (isVisible(this)) this.focus({ preventScroll: true });
			});
		});
		const currentDialog = this.closest("dialog[open]");
		if (currentDialog && currentDialog !== target && target) {
			const newModal = Modal.getOrCreateInstance(target);
			target.classList.add(CLASS_NAME_SWAP_IN);
			newModal.show(this);
			EventHandler.one(target, EVENT_SHOWN$5, () => {
				target.classList.remove(CLASS_NAME_SWAP_IN);
			});
			const currentInstance = Modal.getInstance(currentDialog);
			if (currentInstance) {
				currentDialog.classList.add(CLASS_NAME_INSTANT$1);
				EventHandler.one(currentDialog, EVENT_HIDDEN$7, () => {
					currentDialog.classList.remove(CLASS_NAME_INSTANT$1);
				});
				currentInstance.hide();
			}
			return;
		}
		Modal.getOrCreateInstance(target).toggle(this);
	});
	enableDismissTrigger(Modal);
	/**
	* jQuery
	*/
	defineJQueryPlugin(Modal);
	//#endregion
	//#region js/src/multi-select.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO multi-select.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* ------------------------------------------------------------------------
	* Constants
	* ------------------------------------------------------------------------
	*/
	const NAME$20 = "multi-select";
	const DATA_KEY$1 = "bs.multi-select";
	const EVENT_KEY$15 = `.${DATA_KEY$1}`;
	const DATA_API_KEY$12 = ".data-api";
	const ARROW_UP_KEY$2 = "ArrowUp";
	const ARROW_DOWN_KEY$2 = "ArrowDown";
	const BACKSPACE_KEY$1 = "Backspace";
	const DELETE_KEY = "Delete";
	const END_KEY$2 = "End";
	const ENTER_KEY = "Enter";
	const ESCAPE_KEY$1 = "Escape";
	const HOME_KEY$2 = "Home";
	const SPACE_KEY = " ";
	const TAB_KEY = "Tab";
	const RIGHT_MOUSE_BUTTON = 2;
	const SELECTOR_CHIP = ".chip";
	const SELECTOR_CLEANER = ".form-control-cleaner";
	const SELECTOR_OPTGROUP = ".combobox-optgroup";
	const SELECTOR_OPTION = ".combobox-option";
	const SELECTOR_SEARCH = ".form-multi-select-search";
	const SELECTOR_DATA_MULTI_SELECT = "[data-bs-multi-select]";
	const SELECTOR_SELECT = "select.form-multi-select";
	const SELECTOR_SELECTION = ".form-multi-select-selection";
	const SELECTOR_VISIBLE_ITEMS = ".combobox-options .combobox-option:not(.disabled):not(:disabled)";
	const SELECTOR_NAVIGABLE_ITEMS = `.combobox-all:not(.disabled):not(:disabled), ${SELECTOR_VISIBLE_ITEMS}, .combobox-options .combobox-optgroup-label-with-checkbox`;
	const EVENT_CHANGED = `changed${EVENT_KEY$15}`;
	const EVENT_CLICK$5 = `click${EVENT_KEY$15}`;
	const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$15}`;
	const EVENT_KEYDOWN$4 = `keydown${EVENT_KEY$15}`;
	const EVENT_KEYUP = `keyup${EVENT_KEY$15}`;
	const EVENT_SEARCH = `search${EVENT_KEY$15}`;
	const EVENT_SELECTION_LIMIT = `selectionLimit${EVENT_KEY$15}`;
	const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$15}${DATA_API_KEY$12}`;
	const EVENT_KEYUP_DATA_API$1 = `keyup${EVENT_KEY$15}${DATA_API_KEY$12}`;
	const EVENT_LOAD_DATA_API$11 = `load${EVENT_KEY$15}${DATA_API_KEY$12}`;
	const EVENT_CHIP_REMOVE = "remove.bs.chip";
	const CLASS_NAME_CHIP = "chip";
	const CLASS_NAME_CLEANER$1 = "form-control-cleaner";
	const CLASS_NAME_DISABLED$2 = "disabled";
	const CLASS_NAME_HEADER = "combobox-header";
	const CLASS_NAME_INPUT_GROUP$1 = "form-control-group";
	const CLASS_NAME_SELECT = "form-multi-select";
	const CLASS_NAME_SELECT_FILLED = "form-multi-select-filled";
	const CLASS_NAME_SELECT_ALL = "combobox-all";
	const CLASS_NAME_SELECT_ALL_WITH_CHECKBOX = "combobox-all-with-checkbox";
	const CLASS_NAME_OPTGROUP_LABEL_WITH_CHECKBOX = "combobox-optgroup-label-with-checkbox";
	const CLASS_NAME_OPTION_INDICATOR = "combobox-option-indicator";
	const CLASS_NAME_OPTION_WITH_CHECKBOX = "combobox-option-with-checkbox";
	const CLASS_NAME_SEARCH = "form-multi-select-search";
	const CLASS_NAME_SELECTED = "selected";
	const CLASS_NAME_INDETERMINATE = "indeterminate";
	const CLASS_NAME_SELECTION = "form-multi-select-selection";
	const CLASS_NAME_SELECTION_TAGS = "form-multi-select-selection-tags";
	const CLASS_NAME_SHOW$8 = "show";
	const Default$19 = {
		allowList: DefaultAllowlist,
		ariaCleanerLabel: "Clear all selections",
		ariaIndicatorLabel: "Toggle visibility of options menu",
		ariaSearchLabel: "Search",
		ariaTagDeleteLabel: "Remove",
		cleaner: true,
		clearSearchOnSelect: false,
		container: false,
		deselectAllLabel: "Deselect all",
		deselectFilteredLabel: "Deselect filtered",
		disabled: false,
		headerTemplate: null,
		hideSelectAllOnSearchNoResults: true,
		id: null,
		invalid: false,
		multiple: true,
		name: null,
		options: false,
		optionsGroupsSelectable: false,
		optionsGroupsStyle: "checkbox",
		optionsGroupsTemplate: null,
		optionsMaxHeight: "auto",
		optionsStyle: "checkbox",
		optionsTemplate: null,
		placeholder: "Select...",
		required: false,
		sanitize: true,
		sanitizeFn: null,
		search: false,
		searchNoResultsLabel: "No results found",
		selectAll: true,
		selectAllLabel: "Select all",
		selectAllMode: "all",
		selectAllStyle: "checkbox",
		selectionLimit: null,
		selectionType: "tags",
		selectionTypeCounterText: "item(s) selected",
		selectFilteredLabel: "Select filtered",
		valid: false,
		value: null
	};
	const DefaultType$19 = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaIndicatorLabel: "string",
		ariaSearchLabel: "string",
		ariaTagDeleteLabel: "string",
		cleaner: "boolean",
		clearSearchOnSelect: "boolean",
		container: "(string|element|boolean)",
		deselectAllLabel: "string",
		deselectFilteredLabel: "string",
		disabled: "boolean",
		headerTemplate: "(function|null)",
		hideSelectAllOnSearchNoResults: "boolean",
		id: "(string|null)",
		invalid: "boolean",
		multiple: "boolean",
		name: "(string|null)",
		options: "(boolean|array)",
		optionsGroupsSelectable: "boolean",
		optionsGroupsStyle: "string",
		optionsGroupsTemplate: "(function|null)",
		optionsMaxHeight: "(number|string)",
		optionsStyle: "string",
		optionsTemplate: "(function|null)",
		placeholder: "string",
		required: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		search: "(boolean|string)",
		searchNoResultsLabel: "string",
		selectAll: "boolean",
		selectAllStyle: "string",
		selectAllLabel: "string",
		selectAllMode: "string",
		selectionLimit: "(number|null)",
		selectionType: "string",
		selectionTypeCounterText: "string",
		selectFilteredLabel: "string",
		valid: "boolean",
		value: "(string|array|null)"
	};
	/**
	* ------------------------------------------------------------------------
	* Class Definition
	* ------------------------------------------------------------------------
	*/
	var MultiSelectChipSet = class extends ChipSet {
		_applyAccessibilityRoles() {}
	};
	var MultiSelect = class MultiSelect extends Combobox {
		constructor(element, config) {
			super(element, config);
			this._uniqueId = this._config.id || this._element.id || getUID(`${this.constructor.NAME}`);
			this._uniqueName = this._config.name || this._element.name || this._uniqueId;
			this._configureNativeSelect();
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
			this._selected = [];
			this._options = this._getOptions();
			this._floatingCleanup = null;
			this._anchoredPosition = null;
			this._search = "";
			if (this._config.options.length > 0) this._createNativeOptions(this._element, this._config.options);
			this._createSelect();
			this._addEventListeners();
			data_default.set(this._element, DATA_KEY$1, this);
		}
		static get Default() {
			return Default$19;
		}
		static get DefaultType() {
			return DefaultType$19;
		}
		static get NAME() {
			return NAME$20;
		}
		static get navigableItemsSelector() {
			return SELECTOR_NAVIGABLE_ITEMS;
		}
		static get activationKeys() {
			return [ENTER_KEY, SPACE_KEY];
		}
		_escapeFocusTarget() {
			return this._config.search ? this._searchElement : this._togglerElement;
		}
		_getShowTarget() {
			return this._wrapperElement;
		}
		_afterShow() {
			if (this._config.search) SelectorEngine.findOne(SELECTOR_SEARCH, this._wrapperElement).focus();
		}
		_onHideStart() {
			this._refocusOnHide = this._wrapperElement.contains(document.activeElement) || this._menu.contains(document.activeElement);
		}
		_afterHideDispose() {
			if (this._config.search) this._searchElement.value = "";
			this._onSearchChange(this._searchElement);
		}
		_onHideEnd() {
			if (this._refocusOnHide && !this._config.disabled) {
				const refocusTarget = this._config.search ? this._searchElement : this._togglerElement;
				if (refocusTarget) refocusTarget.focus();
			}
		}
		dispose() {
			this._disposeFloating();
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
			]) if (element) EventHandler.off(element, EVENT_KEY$15);
			if (this._menu) this._menu.remove();
			if (this._wrapperElement) {
				this._wrapperElement.before(this._element);
				this._wrapperElement.remove();
			}
			this._element.removeAttribute("tabindex");
			super.dispose();
		}
		search(text) {
			this._search = text.length > 0 ? text.toLowerCase() : text;
			this._filterOptionsList();
			EventHandler.trigger(this._element, EVENT_SEARCH);
		}
		update(config) {
			if (config.value) this.deselectAll();
			this._config = {
				...this._config,
				...this._configAfterMerge(config)
			};
			this._selected = [];
			this._options = this._getOptions();
			this._menu.remove();
			this._wrapperElement.before(this._element);
			this._wrapperElement.remove();
			this._element.innerHTML = "";
			this._configureNativeSelect();
			this._createNativeOptions(this._element, this._options);
			this._createSelect();
			this._addEventListeners();
		}
		selectAll(options = this._options) {
			const limitReached = this._selectAllOptions(options);
			this._refreshAfterSelectionChange();
			if (limitReached) this._triggerSelectionLimit();
		}
		deselectAll(options = this._options) {
			this._deselectAllOptions(options);
			this._refreshAfterSelectionChange();
		}
		selectFiltered() {
			const items = this._getDisplayedItems();
			let limitReached = false;
			for (const item of items) {
				if (this._isSelectionLimitReached()) {
					limitReached = true;
					break;
				}
				const value = String(item.dataset.value);
				const option = this._findOptionByValue(value);
				if (option && !this._selected.some((selected) => selected.value === value)) this._selectOption(value, option.text, { refresh: false });
			}
			this._refreshAfterSelectionChange();
			if (limitReached) this._triggerSelectionLimit();
		}
		deselectFiltered() {
			const items = this._getDisplayedItems();
			for (const item of items) {
				const value = String(item.dataset.value);
				if (this._selected.some((selected) => selected.value === value)) this._deselectOption(value, { refresh: false });
			}
			this._refreshAfterSelectionChange();
		}
		getValue() {
			return this._selected;
		}
		_addEventListeners() {
			EventHandler.on(this._selectionElement, EVENT_CHIP_REMOVE, SELECTOR_CHIP, (event) => {
				event.preventDefault();
				const chip = event.target.closest(SELECTOR_CHIP);
				if (chip) this._deselectOption(String(chip.dataset.value));
			});
			EventHandler.on(this._togglerElement, EVENT_CLICK$5, SELECTOR_CLEANER, (event) => {
				if (!this._config.disabled) {
					event.preventDefault();
					event.stopPropagation();
					this.deselectAll();
				}
			});
			EventHandler.on(this._wrapperElement, EVENT_CLICK$5, () => {
				if (!this._config.disabled) this.show();
			});
			EventHandler.on(this._wrapperElement, EVENT_KEYDOWN$4, (event) => {
				if (event.key === ESCAPE_KEY$1) {
					this.hide();
					return;
				}
				if (this._config.search === "global" && (event.key.length === 1 || event.key === BACKSPACE_KEY$1 || event.key === DELETE_KEY)) this._searchElement.focus();
			});
			EventHandler.on(this._menu, EVENT_KEYDOWN$4, (event) => {
				if (this._config.search === "global" && (event.key.length === 1 || event.key === BACKSPACE_KEY$1 || event.key === DELETE_KEY)) this._searchElement.focus();
			});
			this._addTogglerKeydownListeners();
			EventHandler.on(this._element, EVENT_KEYDOWN$4, (event) => {
				if (event.key === TAB_KEY || event.key === ESCAPE_KEY$1) return;
				event.preventDefault();
				const isPrintable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
				if (!this._isShown() && (event.key === ENTER_KEY || event.key === ARROW_DOWN_KEY$2 || this._config.search && isPrintable)) this.show();
				if (this._config.search) {
					this._searchElement.focus();
					if (isPrintable) {
						this._searchElement.value += event.key;
						this._onSearchChange(this._searchElement);
					}
				} else this._togglerElement.focus();
			});
			EventHandler.on(this._indicatorElement, EVENT_CLICK$5, (event) => {
				event.preventDefault();
				event.stopPropagation();
				this.toggle();
			});
			EventHandler.on(this._searchElement, EVENT_KEYUP, () => {
				this._onSearchChange(this._searchElement);
			});
			EventHandler.on(this._searchElement, EVENT_KEYDOWN$4, (event) => {
				if (!this._isShown() && event.key.length === 1 && !event.ctrlKey && !event.metaKey || event.key === ARROW_DOWN_KEY$2) this.show();
				if (event.key === ARROW_DOWN_KEY$2 && this._searchElement.value.length === this._searchElement.selectionStart) {
					this._selectMenuItem(event);
					return;
				}
				if ((event.key === BACKSPACE_KEY$1 || event.key === DELETE_KEY) && event.target.value.length === 0) this._deselectLastOption();
				this._searchElement.focus();
			});
			if (this._selectAllElement) {
				EventHandler.on(this._selectAllElement, EVENT_CLICK$5, (event) => {
					if (this._selectAllElement.disabled) return;
					event.preventDefault();
					event.stopPropagation();
					this._toggleSelectAll();
				});
				EventHandler.on(this._selectAllElement, EVENT_KEYDOWN$4, (event) => {
					if ([ARROW_UP_KEY$2, ARROW_DOWN_KEY$2].includes(event.key)) {
						event.preventDefault();
						this._selectMenuItem(event);
					}
					if ([HOME_KEY$2, END_KEY$2].includes(event.key)) {
						event.preventDefault();
						this._selectFirstOrLastMenuItem(event.key === HOME_KEY$2);
					}
				});
			}
			EventHandler.on(this._optionsElement, EVENT_CLICK$5, (event) => {
				event.preventDefault();
				event.stopPropagation();
				this._onOptionsClick(event.target);
			});
			this._addOptionsKeydownListeners();
		}
		_getOptions() {
			if (this._config.options) return this._getOptionsFromConfig();
			return this._getOptionsFromElement();
		}
		_getOptionsFromConfig(options = this._config.options) {
			const _options = [];
			for (const option of options) {
				if (this._isOptionGroup(option)) {
					const customGroupProperties = { ...option };
					delete customGroupProperties.label;
					delete customGroupProperties.options;
					_options.push({
						...customGroupProperties,
						label: option.label,
						options: this._getOptionsFromConfig(option.options)
					});
					continue;
				}
				const value = String(option.value);
				const shouldSelect = (option.selected || this._config.value && this._config.value.includes(value)) && !this._isSelectionLimitReached();
				const customProperties = typeof option === "object" ? { ...option } : {};
				delete customProperties.value;
				delete customProperties.selected;
				delete customProperties.disabled;
				_options.push({
					...customProperties,
					value,
					...shouldSelect && { selected: true },
					...option.disabled && { disabled: true }
				});
				if (shouldSelect) this._selected.push({
					value: String(option.value),
					text: option.text
				});
			}
			return _options;
		}
		_getOptionsFromElement(node = this._element) {
			const nodes = Array.from(node.childNodes).filter((element) => element.nodeName === "OPTION" || element.nodeName === "OPTGROUP");
			const options = [];
			for (const node of nodes) {
				if (node.nodeName === "OPTION" && node.value) {
					const value = String(node.value);
					const text = node.textContent;
					const shouldSelect = (node.selected || this._config.value && this._config.value.includes(node.value)) && !this._isSelectionLimitReached();
					options.push({
						value,
						text,
						selected: shouldSelect,
						disabled: node.disabled
					});
					node.selected = shouldSelect;
					if (shouldSelect) this._selected.push({
						value,
						text: node.textContent,
						...node.disabled && { disabled: true }
					});
				}
				if (node.nodeName === "OPTGROUP") options.push({
					label: node.label,
					options: this._getOptionsFromElement(node)
				});
			}
			return options;
		}
		_configureNativeSelect() {
			this._element.classList.add(CLASS_NAME_SELECT);
			if (this._config.multiple) this._element.setAttribute("multiple", true);
			else this._element.removeAttribute("multiple");
			if (this._config.required) this._element.setAttribute("required", true);
			else this._element.removeAttribute("required");
		}
		_createNativeOptions(parentElement, options) {
			for (const option of options) if (this._isOptionGroup(option)) {
				const optgroup = document.createElement("optgroup");
				optgroup.label = option.label;
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
			const nativeLabel = this._element.labels?.[0];
			if (nativeLabel) {
				if (!nativeLabel.id) nativeLabel.id = `${this._uniqueId}-label`;
				this._togglerElement.setAttribute("aria-labelledby", nativeLabel.id);
				return;
			}
			const ariaLabel = this._element.getAttribute("aria-label");
			if (ariaLabel) this._togglerElement.setAttribute("aria-label", ariaLabel);
		}
		_createSelect() {
			const wrapper = document.createElement("div");
			wrapper.classList.add(CLASS_NAME_SELECT);
			wrapper.classList.toggle("is-invalid", this._config.invalid);
			wrapper.classList.toggle("is-valid", this._config.valid);
			if (this._config.disabled) this._element.classList.add(CLASS_NAME_DISABLED$2);
			for (const className of this._element.classList.value.split(" ")) wrapper.classList.add(className);
			this._wrapperElement = wrapper;
			this._element.parentNode.insertBefore(wrapper, this._element);
			wrapper.prepend(this._element);
			this._createSelection();
			this._createButtons();
			if (this._config.search) {
				this._createSearchInput();
				this._updateSearch();
			}
			this._element.setAttribute("id", this._uniqueId);
			this._element.setAttribute("name", this._uniqueName);
			this._wireTogglerAccessibleName();
			this._createOptionsContainer();
			this._hideNativeSelect();
			this._selectInitialOptions();
		}
		_createSelection() {
			const togglerEl = this._wrapperElement;
			togglerEl.classList.add(CLASS_NAME_INPUT_GROUP$1);
			togglerEl.setAttribute("role", "combobox");
			togglerEl.setAttribute("aria-expanded", "false");
			togglerEl.setAttribute("aria-haspopup", "listbox");
			togglerEl.setAttribute("aria-controls", `${this._uniqueId}-listbox`);
			this._togglerElement = togglerEl;
			if (this._config.disabled) {
				togglerEl.classList.add(CLASS_NAME_DISABLED$2);
				togglerEl.setAttribute("aria-disabled", "true");
			}
			if (!this._config.search && !this._config.disabled) togglerEl.tabIndex = 0;
			const selectionEl = document.createElement("div");
			selectionEl.classList.add(CLASS_NAME_SELECTION);
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) selectionEl.classList.add(CLASS_NAME_SELECTION_TAGS);
			togglerEl.append(selectionEl);
			this._updateSelection();
			this._selectionElement = selectionEl;
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) this._selectionChipSet = new MultiSelectChipSet(selectionEl, { removable: !this._config.disabled });
		}
		_createButtons() {
			const indicator = document.createElement("button");
			indicator.type = "button";
			indicator.classList.add("form-control-action");
			indicator.disabled = this._config.disabled;
			indicator.setAttribute("aria-label", this._config.ariaIndicatorLabel);
			indicator.innerHTML = INDICATOR_ICON;
			this._togglerElement.append(indicator);
			this._indicatorElement = indicator;
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
			if (this._config.disabled) input.disabled = true;
			input.setAttribute("id", `search-${this._uniqueId}`);
			input.setAttribute("name", `search-${this._uniqueName}`);
			input.setAttribute("aria-label", this._config.ariaSearchLabel);
			input.setAttribute("aria-autocomplete", "list");
			input.setAttribute("aria-controls", `${this._uniqueId}-listbox`);
			this._searchElement = input;
			this._updateSearchSize();
			this._selectionElement.append(input);
		}
		_buildMenuHeader(popupDiv) {
			const hasHeaderTemplate = typeof this._config.headerTemplate === "function";
			const showSelectAll = this._config.selectAll && this._config.multiple;
			if (!hasHeaderTemplate && !showSelectAll) return;
			const header = document.createElement("div");
			header.classList.add(CLASS_NAME_HEADER);
			this._dropdownHeaderElement = header;
			if (hasHeaderTemplate) {
				const headerContent = document.createElement("div");
				EventHandler.on(headerContent, EVENT_CLICK$5, (event) => {
					event.stopPropagation();
				});
				this._headerElement = headerContent;
				header.append(headerContent);
			} else {
				const selectAllButton = document.createElement("button");
				selectAllButton.type = "button";
				selectAllButton.classList.add(CLASS_NAME_SELECT_ALL);
				if (this._config.selectAllStyle === "checkbox" && this._config.multiple) {
					selectAllButton.classList.add(CLASS_NAME_SELECT_ALL_WITH_CHECKBOX);
					selectAllButton.append(this._createCheckboxIndicator());
				}
				const selectAllLabel = document.createElement("span");
				selectAllButton.append(selectAllLabel);
				this._selectAllLabelElement = selectAllLabel;
				this._selectAllElement = selectAllButton;
				header.append(selectAllButton);
			}
			popupDiv.append(header);
		}
		_decorateListbox(optionsDiv) {
			if (this._config.multiple) optionsDiv.setAttribute("aria-multiselectable", "true");
		}
		_afterMenuCreated() {
			this._updateHeader();
			this._updateGroupsState();
			this._updateMasterCheckbox();
		}
		_createCheckboxIndicator() {
			const indicator = document.createElement("span");
			indicator.classList.add("check", CLASS_NAME_OPTION_INDICATOR);
			indicator.setAttribute("aria-hidden", "true");
			return indicator;
		}
		_decorateOption(optionDiv, _option) {
			if (this._config.optionsStyle === "checkbox") optionDiv.classList.add(CLASS_NAME_OPTION_WITH_CHECKBOX);
		}
		_isOptionSelectedInitially(option) {
			return option.selected === true;
		}
		_renderOptionContent(optionDiv, option) {
			if (typeof this._config.optionsTemplate === "function") optionDiv.innerHTML = this._maybeSanitize(this._config.optionsTemplate(option));
			else optionDiv.textContent = option.text;
			if (this._config.optionsStyle === "checkbox") optionDiv.prepend(this._createCheckboxIndicator());
		}
		_decorateOptgroupLabel(label, _option) {
			if (this._config.optionsGroupsSelectable && this._config.optionsGroupsStyle === "checkbox" && this._config.multiple) {
				label.classList.add(CLASS_NAME_OPTGROUP_LABEL_WITH_CHECKBOX);
				label.tabIndex = 0;
				label.setAttribute("role", "button");
				label.prepend(this._createCheckboxIndicator());
			}
		}
		_createChip(value, text, disabled) {
			const chip = document.createElement("div");
			chip.classList.add(CLASS_NAME_CHIP);
			chip.dataset.value = value;
			chip.textContent = text;
			new Chip(chip, {
				ariaRemoveLabel: `${this._config.ariaTagDeleteLabel} ${text}`.trim(),
				removable: !this._config.disabled && disabled !== true
			});
			return chip;
		}
		_updateChips(selection, search) {
			const placeholder = SelectorEngine.findOne(".form-multi-select-placeholder", selection);
			if (placeholder) placeholder.remove();
			const existingChips = /* @__PURE__ */ new Map();
			for (const chip of SelectorEngine.children(selection, SELECTOR_CHIP)) existingChips.set(chip.dataset.value, chip);
			const selectedValues = new Set(this._selected.map((option) => String(option.value)));
			for (const [value, chip] of existingChips) if (!selectedValues.has(value)) {
				Chip.getInstance(chip)?.dispose();
				chip.remove();
				existingChips.delete(value);
			}
			for (const option of this._selected) {
				const value = String(option.value);
				const chip = existingChips.get(value) || this._createChip(option.value, option.text, option.disabled);
				if (search) search.before(chip);
				else selection.append(chip);
			}
		}
		_interceptOptionsClick(element) {
			if (!this._config.optionsGroupsSelectable) return false;
			const groupLabel = element.closest(`.${CLASS_NAME_OPTGROUP_LABEL_WITH_CHECKBOX}`);
			if (groupLabel) {
				this._toggleGroup(groupLabel.closest(SELECTOR_OPTGROUP));
				return true;
			}
			return false;
		}
		_onOptionActivate(value, element) {
			const { text } = this._findOptionByValue(value);
			if (this._config.multiple && element.classList.contains(CLASS_NAME_SELECTED)) this._deselectOption(value);
			else if (this._config.multiple && !element.classList.contains(CLASS_NAME_SELECTED)) this._selectOption(value, text);
			else if (!this._config.multiple) this._selectOption(value, text);
			if (!this._config.multiple) {
				this.hide();
				this.search("");
				this._searchElement.value = null;
			}
			if (this._config.clearSearchOnSelect && this._config.search) {
				this.search("");
				this._searchElement.value = null;
				this._searchElement.focus();
			}
		}
		_selectAllOptions(options) {
			for (const option of options) {
				if (option.disabled) continue;
				if (this._isOptionGroup(option)) {
					if (this._selectAllOptions(option.options)) return true;
					continue;
				}
				if (this._isSelectionLimitReached()) return true;
				this._selectOption(option.value, option.text, { refresh: false });
			}
			return false;
		}
		_deselectAllOptions(options) {
			for (const option of options) {
				if (option.disabled) continue;
				if (this._isOptionGroup(option)) {
					this._deselectAllOptions(option.options);
					continue;
				}
				this._deselectOption(option.value, { refresh: false });
			}
		}
		_getNativeOption(value) {
			return SelectorEngine.findOne(`option[value="${CSS.escape(value)}"]`, this._element);
		}
		_getOptionElement(value) {
			return SelectorEngine.findOne(`[data-value="${CSS.escape(value)}"]`, this._optionsElement);
		}
		_getDisplayedItems() {
			return SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => this._isOptionDisplayed(element));
		}
		_isOptionGroup(option) {
			return Array.isArray(option.options);
		}
		_selectOption(value, text, { refresh = true } = {}) {
			if (!this._config.multiple) this.deselectAll();
			const isSelected = this._selected.some((option) => option.value === String(value));
			if (!isSelected && this._isSelectionLimitReached()) {
				this._triggerSelectionLimit();
				return;
			}
			if (!isSelected) this._selected.push({
				value: String(value),
				text
			});
			const nativeOption = this._getNativeOption(value);
			if (nativeOption) nativeOption.selected = true;
			this._syncOptionElementState(value, true);
			EventHandler.trigger(this._element, EVENT_CHANGED, { value: this._selected });
			if (refresh) this._refreshAfterSelectionChange();
		}
		_deselectOption(value, { refresh = true } = {}) {
			this._selected = this._selected.filter((option) => option.value !== String(value));
			const nativeOption = this._getNativeOption(value);
			if (nativeOption) nativeOption.selected = false;
			this._syncOptionElementState(value, false);
			EventHandler.trigger(this._element, EVENT_CHANGED, { value: this._selected });
			if (refresh) this._refreshAfterSelectionChange();
		}
		_deselectLastOption() {
			if (this._selected.length > 0) {
				const last = this._selected.findLast((option) => option.disabled !== true);
				if (last) this._deselectOption(last.value);
			}
		}
		_refreshAfterSelectionChange() {
			this._updateSelection();
			this._updateSelectionCleaner();
			this._updateSearch();
			this._updateSearchSize();
			this._updateHeader();
			this._updateGroupsState();
			this._updateMasterCheckbox();
		}
		_toggleGroup(optgroupEl) {
			if (!optgroupEl) return;
			const items = SelectorEngine.children(optgroupEl, SELECTOR_OPTION).filter((element) => !element.classList.contains(CLASS_NAME_DISABLED$2));
			const allSelected = items.length > 0 && items.every((element) => element.classList.contains(CLASS_NAME_SELECTED));
			let limitReached = false;
			for (const item of items) {
				const value = String(item.dataset.value);
				if (allSelected) this._deselectOption(value, { refresh: false });
				else if (!item.classList.contains(CLASS_NAME_SELECTED)) {
					if (this._isSelectionLimitReached()) {
						limitReached = true;
						break;
					}
					const option = this._findOptionByValue(value);
					if (option) this._selectOption(value, option.text, { refresh: false });
				}
			}
			this._refreshAfterSelectionChange();
			if (limitReached) this._triggerSelectionLimit();
		}
		_selectInitialOptions() {
			for (const option of this._selected) this._selectOption(option.value, option.text, { refresh: false });
			this._refreshAfterSelectionChange();
		}
		_updateSelection() {
			const selection = SelectorEngine.findOne(SELECTOR_SELECTION, this._wrapperElement);
			const search = SelectorEngine.findOne(SELECTOR_SEARCH, this._wrapperElement);
			this._wrapperElement.classList.toggle(CLASS_NAME_SELECT_FILLED, this._selected.length > 0);
			if (this._selected.length === 0 && !this._config.search) {
				this._renderEmptySelection(selection);
				return;
			}
			if (this._config.multiple && this._config.selectionType === "counter" && !this._config.search) selection.textContent = `${this._selected.length} ${this._config.selectionTypeCounterText}`;
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) this._updateChips(selection, search);
			if (this._config.multiple && this._config.selectionType === "text") {
				selection.innerHTML = "";
				for (const [index, option] of this._selected.entries()) {
					const span = document.createElement("span");
					span.textContent = `${option.text}${index === this._selected.length - 1 ? "" : ","}\u00A0`;
					selection.append(span);
				}
			}
			if (!this._config.multiple && this._selected.length > 0 && !this._config.search) selection.textContent = this._selected[0].text;
			if (search) selection.append(search);
			if (this._floatingCleanup) this._updateFloatingPosition();
		}
		_renderEmptySelection(selection) {
			const placeholder = document.createElement("span");
			placeholder.classList.add("form-multi-select-placeholder");
			placeholder.textContent = this._config.placeholder;
			for (const chip of SelectorEngine.find(SELECTOR_CHIP, selection)) Chip.getInstance(chip)?.dispose();
			selection.innerHTML = "";
			selection.append(placeholder);
		}
		_updateSelectionCleaner() {
			if (!this._config.cleaner || this._config.disabled) return;
			if (this._selected.length > 0 && this._selectionCleanerElement === null) {
				const selectionCleaner = this._createSelectionCleaner();
				this._indicatorElement.before(selectionCleaner);
				this._selectionCleanerElement = selectionCleaner;
				return;
			}
			if (this._selected.length === 0 && this._selectionCleanerElement !== null) {
				this._selectionCleanerElement.remove();
				this._selectionCleanerElement = null;
			}
		}
		_updateSearch() {
			if (!this._config.search) return;
			if (!this._config.multiple && this._selected.length > 0) {
				this._searchElement.placeholder = this._selected[0].text;
				return;
			}
			if (!this._config.multiple && this._selected.length === 0) {
				this._searchElement.placeholder = this._config.placeholder;
				return;
			}
			if (this._config.multiple && this._selected.length > 0 && this._config.selectionType !== "counter") {
				this._searchElement.removeAttribute("placeholder");
				return;
			}
			if (this._config.multiple && this._selected.length === 0) {
				this._searchElement.placeholder = this._config.placeholder;
				return;
			}
			if (this._config.multiple && this._config.selectionType === "counter") this._searchElement.placeholder = `${this._selected.length} ${this._config.selectionTypeCounterText}`;
		}
		_updateSearchSize(size = 2) {
			if (!this._searchElement || !this._config.multiple) return;
			if (this._selected.length > 0 && [
				"chips",
				"tags",
				"text"
			].includes(this._config.selectionType)) {
				this._searchElement.size = size;
				return;
			}
			if (this._selected.length === 0 && [
				"chips",
				"tags",
				"text"
			].includes(this._config.selectionType)) this._searchElement.removeAttribute("size");
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
			const { selected, total } = this._getSelectAllScope();
			const target = this._getSelectableTarget(total);
			return target > 0 && selected >= target;
		}
		_getSelectAllScope() {
			const { selected, total, filtered, filteredSelected } = this._getSelectionState();
			return this._config.selectAllMode === "filtered" ? {
				selected: filteredSelected,
				total: filtered
			} : {
				selected,
				total
			};
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
				else this.deselectAll();
				return;
			}
			if (filteredMode) this.selectFiltered();
			else this.selectAll();
		}
		_getSelectableTarget(total) {
			return this._hasSelectionLimit() ? Math.min(total, this._config.selectionLimit) : total;
		}
		_getCheckboxState(selected, total) {
			if (total > 0 && selected >= total) return "all";
			return selected === 0 ? "none" : "indeterminate";
		}
		_applyCheckboxState(element, state) {
			element.classList.toggle(CLASS_NAME_SELECTED, state === "all");
			element.classList.toggle(CLASS_NAME_INDETERMINATE, state === "indeterminate");
		}
		_updateGroupsState() {
			if (!this._config.optionsGroupsSelectable) return;
			for (const optgroup of SelectorEngine.find(SELECTOR_OPTGROUP, this._menu)) {
				const label = SelectorEngine.findOne(`.${CLASS_NAME_OPTGROUP_LABEL_WITH_CHECKBOX}`, optgroup);
				if (!label) continue;
				const items = SelectorEngine.children(optgroup, SELECTOR_OPTION).filter((element) => !element.classList.contains(CLASS_NAME_DISABLED$2));
				const selected = items.filter((element) => element.classList.contains(CLASS_NAME_SELECTED)).length;
				this._applyCheckboxState(label, this._getCheckboxState(selected, items.length));
			}
		}
		_updateMasterCheckbox() {
			if (this._config.selectAllStyle !== "checkbox" || !this._selectAllElement) return;
			const { selected, total } = this._getSelectAllScope();
			this._applyCheckboxState(this._selectAllElement, this._getCheckboxState(selected, this._getSelectableTarget(total)));
		}
		_renderHeader() {
			if (!this._headerElement || typeof this._config.headerTemplate !== "function") return;
			const result = this._config.headerTemplate(this._getSelectionState(), this._getSelectionActions());
			if (result instanceof Node) this._headerElement.replaceChildren(result);
			else this._headerElement.innerHTML = this._maybeSanitize(result);
		}
		_getSelectionState() {
			const allItems = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu);
			const filteredItems = allItems.filter((element) => this._isOptionDisplayed(element));
			return {
				selected: this._selected.length,
				total: allItems.length,
				filtered: filteredItems.length,
				filteredSelected: filteredItems.filter((element) => element.classList.contains(CLASS_NAME_SELECTED)).length
			};
		}
		_getSelectionActions() {
			return {
				selectAll: () => this.selectAll(),
				deselectAll: () => this.deselectAll(),
				selectFiltered: () => this.selectFiltered(),
				deselectFiltered: () => this.deselectFiltered()
			};
		}
		_onSearchChange(element) {
			if (element) {
				this.search(element.value);
				this._updateSearchSize(element.value.length + 1);
			}
		}
		_hasSelectionLimit() {
			return this._config.multiple && this._config.selectionLimit !== null;
		}
		_isSelectionLimitReached() {
			return this._hasSelectionLimit() && this._selected.length >= this._config.selectionLimit;
		}
		_triggerSelectionLimit() {
			EventHandler.trigger(this._element, EVENT_SELECTION_LIMIT, { selectionLimit: this._config.selectionLimit });
		}
		_afterFilter(visibleOptions) {
			this._updateHeader();
			this._updateMasterCheckbox();
			this._updateSelectAllVisibility(visibleOptions);
			this._syncNoResultsPlaceholder(visibleOptions);
		}
		_updateSelectAllVisibility(visibleOptions) {
			if (!this._dropdownHeaderElement || !this._selectAllElement) return;
			if (this._config.hideSelectAllOnSearchNoResults && visibleOptions === 0) this._dropdownHeaderElement.style.display = "none";
			else this._dropdownHeaderElement.style.removeProperty("display");
		}
		_configAfterMerge(config) {
			config = this._normalizeContainerConfig(config);
			if (typeof config.value === "number") config.value = [String(config.value)];
			if (typeof config.value === "string") config.value = config.value.split(/,\s*/).map(String);
			return config;
		}
		static multiSelectInterface(element, config) {
			const data = MultiSelect.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				MultiSelect.multiSelectInterface(this, config);
			});
		}
		static clearMenus(event) {
			if (event && (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY)) return;
			const selects = SelectorEngine.find(SELECTOR_SELECT);
			for (let i = 0, len = selects.length; i < len; i++) {
				const context = data_default.get(selects[i], DATA_KEY$1);
				const relatedTarget = { relatedTarget: selects[i] };
				if (event && event.type === "click") relatedTarget.clickEvent = event;
				if (!context) continue;
				if (!context._wrapperElement.classList.contains(CLASS_NAME_SHOW$8)) continue;
				if (context._wrapperElement.contains(event.target) || context._menu.contains(event.target)) continue;
				context.hide();
				EventHandler.trigger(context._element, EVENT_HIDDEN$6);
			}
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$11, () => {
		const elements = /* @__PURE__ */ new Set([...SelectorEngine.find(SELECTOR_DATA_MULTI_SELECT), ...SelectorEngine.find(SELECTOR_SELECT)]);
		for (const ms of elements) if (ms.tabIndex !== -1) MultiSelect.multiSelectInterface(ms);
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$6, MultiSelect.clearMenus);
	EventHandler.on(document, EVENT_KEYUP_DATA_API$1, MultiSelect.clearMenus);
	/**
	* jQuery
	*/
	defineJQueryPlugin(MultiSelect);
	//#endregion
	//#region js/src/navigation.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI navigation.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* ------------------------------------------------------------------------
	* Constants
	* ------------------------------------------------------------------------
	*/
	const NAME$19 = "navigation";
	const DATA_KEY = "bs.navigation";
	const EVENT_KEY$14 = `.${DATA_KEY}`;
	const DATA_API_KEY$11 = ".data-api";
	const Default$18 = {
		activeLinksExact: true,
		groupsAutoCollapse: true
	};
	const DefaultType$18 = {
		activeLinksExact: "boolean",
		groupsAutoCollapse: "(string|boolean)"
	};
	const CLASS_NAME_ACTIVE$5 = "active";
	const CLASS_NAME_SHOW$7 = "show";
	const CLASS_NAME_NAV_GROUP = "nav-group";
	const CLASS_NAME_NAV_GROUP_TOGGLE = "nav-group-toggle";
	const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$14}${DATA_API_KEY$11}`;
	const EVENT_LOAD_DATA_API$10 = `load${EVENT_KEY$14}${DATA_API_KEY$11}`;
	const SELECTOR_NAV_GROUP = ".nav-group";
	const SELECTOR_NAV_GROUP_ITEMS = ".nav-group-items";
	const SELECTOR_NAV_GROUP_TOGGLE = ".nav-group-toggle";
	const SELECTOR_NAV_LINK = ".nav-link";
	const SELECTOR_DATA_NAVIGATION = "[data-bs-navigation], [data-bs=\"navigation\"]";
	/**
	* ------------------------------------------------------------------------
	* Class Definition
	* ------------------------------------------------------------------------
	*/
	var Navigation = class Navigation extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._setActiveLink();
			this._addEventListeners();
			data_default.set(element, DATA_KEY, this);
		}
		static get Default() {
			return Default$18;
		}
		static get DATA_KEY() {
			return DATA_KEY;
		}
		static get DefaultType() {
			return DefaultType$18;
		}
		static get NAME() {
			return NAME$19;
		}
		_setActiveLink() {
			for (const element of Array.from(this._element.querySelectorAll(SELECTOR_NAV_LINK))) {
				if (element.classList.contains(CLASS_NAME_NAV_GROUP_TOGGLE)) continue;
				let currentUrl = String(window.location);
				const urlHasParams = /\?.*=/;
				const urlHasQueryString = /\?./;
				const urlHasHash = /#./;
				if (urlHasParams.test(currentUrl) || urlHasQueryString.test(currentUrl)) currentUrl = currentUrl.split("?")[0];
				if (urlHasHash.test(currentUrl)) currentUrl = currentUrl.split("#")[0];
				if (this._config.activeLinksExact && element.href === currentUrl) {
					element.classList.add(CLASS_NAME_ACTIVE$5);
					Array.from(this._getParents(element, SELECTOR_NAV_GROUP)).forEach((element) => {
						element.classList.add(CLASS_NAME_SHOW$7);
						element.setAttribute("aria-expanded", true);
					});
				}
				if (!this._config.activeLinksExact && currentUrl.startsWith(element.href)) {
					element.classList.add(CLASS_NAME_ACTIVE$5);
					Array.from(this._getParents(element, SELECTOR_NAV_GROUP)).forEach((element) => {
						element.classList.add(CLASS_NAME_SHOW$7);
						element.setAttribute("aria-expanded", true);
					});
				}
			}
		}
		_getParents(element, selector) {
			const parents = [];
			for (; element && element !== document; element = element.parentNode) if (selector) {
				if (element.matches(selector)) parents.push(element);
			} else parents.push(element);
			return parents;
		}
		_getAllSiblings(element, filter) {
			const siblings = [];
			element = element.parentNode.firstChild;
			do {
				if (element.nodeType === 3) continue;
				if (element.nodeType === 8) continue;
				if (!filter || filter(element)) siblings.push(element);
			} while (element = element.nextSibling);
			return siblings;
		}
		_getChildren(n, skipMe) {
			const children = [];
			for (; n; n = n.nextSibling) if (n.nodeType === 1 && n !== skipMe) children.push(n);
			return children;
		}
		_getSiblings(element, filter) {
			return this._getChildren(element.parentNode.firstChild, element).filter(filter);
		}
		_slideDown(element) {
			element.style.height = "auto";
			const height = element.clientHeight;
			element.style.height = "0px";
			setTimeout(() => {
				element.style.height = `${height}px`;
			}, 0);
			this._queueCallback(() => {
				element.style.height = "auto";
			}, element, true);
		}
		_slideUp(element, callback) {
			const height = element.clientHeight;
			element.style.height = `${height}px`;
			setTimeout(() => {
				element.style.height = "0px";
			}, 0);
			this._queueCallback(() => {
				if (typeof callback === "function") callback();
			}, element, true);
		}
		_toggleGroupItems(event) {
			let toggler = event.target;
			if (!toggler.classList.contains(CLASS_NAME_NAV_GROUP_TOGGLE)) toggler = toggler.closest(SELECTOR_NAV_GROUP_TOGGLE);
			const filter = (element) => Boolean(element.classList.contains(CLASS_NAME_NAV_GROUP) && element.classList.contains(CLASS_NAME_SHOW$7));
			if (this._config.groupsAutoCollapse === true) for (const element of this._getSiblings(toggler.parentNode, filter)) this._slideUp(SelectorEngine.findOne(SELECTOR_NAV_GROUP_ITEMS, element), () => {
				element.classList.remove(CLASS_NAME_SHOW$7);
				element.setAttribute("aria-expanded", false);
			});
			if (toggler.parentNode.classList.contains(CLASS_NAME_SHOW$7)) {
				this._slideUp(SelectorEngine.findOne(SELECTOR_NAV_GROUP_ITEMS, toggler.parentNode), () => {
					toggler.parentNode.classList.remove(CLASS_NAME_SHOW$7);
					toggler.parentNode.setAttribute("aria-expanded", false);
				});
				return;
			}
			toggler.parentNode.classList.add(CLASS_NAME_SHOW$7);
			toggler.parentNode.setAttribute("aria-expanded", true);
			this._slideDown(SelectorEngine.findOne(SELECTOR_NAV_GROUP_ITEMS, toggler.parentNode));
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$5, SELECTOR_NAV_GROUP_TOGGLE, (event) => {
				event.preventDefault();
				this._toggleGroupItems(event, this);
			});
		}
		static navigationInterface(element, config) {
			const data = Navigation.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				Navigation.navigationInterface(this, config);
			});
		}
	};
	/**
	* ------------------------------------------------------------------------
	* Data Api implementation
	* ------------------------------------------------------------------------
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$10, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_NAVIGATION))) Navigation.navigationInterface(element);
	});
	/**
	* ------------------------------------------------------------------------
	* jQuery
	* ------------------------------------------------------------------------
	* add .Navigation to jQuery only if jQuery is present
	*/
	defineJQueryPlugin(Navigation);
	//#endregion
	//#region js/src/offcanvas.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI offcanvas.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's drawer.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$18 = "offcanvas";
	const EVENT_KEY$13 = `.bs.offcanvas`;
	const DATA_API_KEY$10 = ".data-api";
	const EVENT_LOAD_DATA_API$9 = `load${EVENT_KEY$13}${DATA_API_KEY$10}`;
	const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$13}`;
	const EVENT_RESIZE$2 = `resize${EVENT_KEY$13}`;
	const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$13}${DATA_API_KEY$10}`;
	const OPEN_SELECTOR = "dialog[open][class*=\"offcanvas\"]";
	const SELECTOR_DATA_TOGGLE$13 = "[data-bs-toggle=\"offcanvas\"]";
	const SELECTOR_DISMISS_SCOPE = ".offcanvas, .offcanvas-sm, .offcanvas-md, .offcanvas-lg, .offcanvas-xl, .offcanvas-xxl";
	const Default$17 = {
		backdrop: true,
		keyboard: true,
		scroll: false
	};
	const DefaultType$17 = {
		backdrop: "(boolean|string)",
		keyboard: "boolean",
		scroll: "boolean"
	};
	/**
	* Class definition
	*/
	var Offcanvas = class Offcanvas extends DialogBase {
		constructor(element, config) {
			super(resolveDialogElement(element, NAME$18), config);
		}
		static get Default() {
			return Default$17;
		}
		static get DefaultType() {
			return DefaultType$17;
		}
		static get NAME() {
			return NAME$18;
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
			return this.each(function() {
				const data = Offcanvas.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config](this);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$13, function(event) {
		const target = resolveDialogElement(SelectorEngine.getElementFromSelector(this), NAME$18);
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if (isDisabled(this)) return;
		EventHandler.one(target, EVENT_HIDDEN$5, () => {
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
		for (const element of SelectorEngine.find(OPEN_SELECTOR)) if (getComputedStyle(element).position !== "fixed") Offcanvas.getOrCreateInstance(element).hide();
	});
	enableDismissTrigger(Offcanvas, "hide", SELECTOR_DISMISS_SCOPE);
	/**
	* jQuery
	*/
	defineJQueryPlugin(Offcanvas);
	//#endregion
	//#region js/src/otp-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO password-input.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$17 = "otp-input";
	const EVENT_KEY$12 = `.bs.otp-input`;
	const DATA_API_KEY$9 = ".data-api";
	const ARROW_RIGHT_KEY$2 = "ArrowRight";
	const ARROW_LEFT_KEY$2 = "ArrowLeft";
	const BACKSPACE_KEY = "Backspace";
	const EVENT_CHANGE$4 = `change${EVENT_KEY$12}`;
	const EVENT_COMPLETE = `complete${EVENT_KEY$12}`;
	const EVENT_FOCUS = `focus${EVENT_KEY$12}`;
	const EVENT_INPUT$1 = `input${EVENT_KEY$12}`;
	const EVENT_KEYDOWN$3 = `keydown${EVENT_KEY$12}`;
	const EVENT_PASTE = `paste`;
	const EVENT_LOAD_DATA_API$8 = `load${EVENT_KEY$12}${DATA_API_KEY$9}`;
	const SELECTOR_FORM_OTP_CONTROL = ".form-otp-control";
	const SELECTOR_DATA_TOGGLE$12 = "[data-bs-toggle=\"otp\"]";
	const Default$16 = {
		ariaLabel: (index, total) => `Digit ${index + 1} of ${total}`,
		autoSubmit: false,
		disabled: false,
		id: null,
		linear: true,
		masked: false,
		name: null,
		placeholder: null,
		readonly: false,
		required: false,
		type: "number",
		value: null
	};
	const DefaultType$16 = {
		ariaLabel: "function",
		autoSubmit: "boolean",
		disabled: "boolean",
		id: "(string|null)",
		linear: "boolean",
		masked: "boolean",
		name: "(string|null)",
		placeholder: "(number|string|null)",
		readonly: "boolean",
		required: "boolean",
		type: "string",
		value: "(number|string|null)"
	};
	/**
	* Class definition
	*/
	var OTPInput = class OTPInput extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._config = this._getConfig(config);
			this._inputElement = null;
			this._createHiddenInput();
			this._setRoleAttribute();
			this._setInputsAttributes();
			this._setInputsTabIndexes();
			this._addEventListeners();
		}
		static get Default() {
			return Default$16;
		}
		static get DefaultType() {
			return DefaultType$16;
		}
		static get NAME() {
			return NAME$17;
		}
		clear() {
			const inputs = this._getInputs();
			for (const input of inputs) input.value = "";
			this._setHiddenInputValue(null);
			this._syncFirstInputMaxLength();
			this._setInputsTabIndexes();
		}
		reset() {
			const inputs = this._getInputs();
			for (const [index, input] of inputs.entries()) {
				const valueString = String(this._config.value || "");
				input.value = valueString && valueString[index] ? valueString[index] : "";
			}
			this._setHiddenInputValue(null);
			this._syncFirstInputMaxLength();
			this._setInputsTabIndexes();
		}
		update(config) {
			if (typeof config !== "object") return;
			this._config = {
				...this._config,
				...config
			};
			this._typeCheckConfig(this._config);
			this._setInputsAttributes();
			this._setInputsTabIndexes();
			this._inputElement.remove();
			this._createHiddenInput();
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_FOCUS, SELECTOR_FORM_OTP_CONTROL, (event) => {
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
			EventHandler.on(this._element, EVENT_INPUT$1, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { target } = event;
				if (target.value.length > 1) {
					const chars = this._extractValidChars(target.value);
					target.value = "";
					if (chars) this._distributeChars(target, chars);
					return;
				}
				if (target.value.length === 1 && !this._isValidInput(target.value)) {
					target.value = "";
					return;
				}
				if (target.value.length === 1) {
					const inputs = this._getInputs();
					if (!inputs.length) return;
					const currentValue = inputs.map((input) => input.value).join("");
					this._setHiddenInputValue(currentValue);
					const nextInput = getNextActiveElement(inputs, target, true);
					if (nextInput) nextInput.focus();
					this._setInputsTabIndexes();
					this._checkAutoSubmit(inputs);
				}
			});
			EventHandler.on(this._element, EVENT_KEYDOWN$3, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { key, target } = event;
				if (key === BACKSPACE_KEY && target.value === "") {
					const inputs = this._getInputs();
					if (!inputs.length) return;
					getNextActiveElement(inputs, target, false).focus();
					const currentValue = inputs.map((input) => input.value).join("");
					this._setHiddenInputValue(currentValue);
					this._setInputsTabIndexes();
					return;
				}
				if (key === ARROW_RIGHT_KEY$2) {
					if (this._config.linear && target.value === "") return;
					const inputs = this._getInputs();
					if (!inputs.length) return;
					const shouldMoveNext = !isRTL$1();
					getNextActiveElement(inputs, target, shouldMoveNext).focus();
					return;
				}
				if (key === ARROW_LEFT_KEY$2) {
					const inputs = this._getInputs();
					if (!inputs.length) return;
					const shouldMoveNext = isRTL$1();
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
			this._setHiddenInputValue(inputs.map((input) => input.value).join(""));
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
		_getInputs() {
			return SelectorEngine.find(SELECTOR_FORM_OTP_CONTROL, this._element);
		}
		_createHiddenInput() {
			const hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			if (this._config.disabled) hiddenInput.disabled = true;
			if (this._config.id) hiddenInput.id = this._config.id;
			if (this._config.name) hiddenInput.name = this._config.name;
			hiddenInput.value = this._config.value || "";
			this._element.append(hiddenInput);
			this._inputElement = hiddenInput;
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
		_setHiddenInputValue(value) {
			if (this._inputElement) this._inputElement.value = value || "";
			EventHandler.trigger(this._element, EVENT_CHANGE$4, { value });
			if (value && value.length === this._getInputs().length) EventHandler.trigger(this._element, EVENT_COMPLETE, { value });
		}
		_setInputsAttributes() {
			const inputs = SelectorEngine.find(SELECTOR_FORM_OTP_CONTROL, this._element);
			for (const [index, input] of inputs.entries()) {
				input.type = this._config.masked ? "password" : "text";
				input.maxLength = 1;
				input.autocomplete = index === 0 ? "one-time-code" : "off";
				input.autocapitalize = "off";
				input.setAttribute("autocorrect", "off");
				input.spellcheck = false;
				input.enterKeyHint = index === inputs.length - 1 ? "done" : "next";
				if (this._config.placeholder !== null) {
					const placeholder = String(this._config.placeholder);
					input.placeholder = placeholder.length > 1 ? placeholder[index] || "" : placeholder;
				}
				if (this._config.required !== null) input.setAttribute("required", true);
				switch (this._config.type) {
					case "number":
						input.inputMode = "numeric";
						input.pattern = "[0-9]*";
						break;
					default:
						input.inputMode = "text";
						input.pattern = ".*";
				}
				if (this._config.disabled) input.disabled = true;
				if (this._config.id) input.id = `${this._config.id}-${index}`;
				if (this._config.name) input.name = `${this._config.name}-${index}`;
				if (this._config.readonly) input.readOnly = true;
				const valueString = String(this._config.value || "");
				if (valueString && valueString[index]) input.value = valueString[index];
				if (typeof this._config.ariaLabel === "function") {
					const ariaLabel = this._config.ariaLabel(index, inputs.length);
					input.setAttribute("aria-label", ariaLabel);
				}
			}
			this._syncFirstInputMaxLength();
		}
		_setInputsTabIndexes() {
			if (!this._config.linear) return;
			const inputs = this._getInputs();
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
		static otpInputInterface(element, config) {
			const data = OTPInput.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = OTPInput.getOrCreateInstance(this);
				if (typeof config === "string") {
					if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
					data[config]();
				}
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$8, () => {
		for (const otp of SelectorEngine.find(SELECTOR_DATA_TOGGLE$12)) OTPInput.otpInputInterface(otp);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(OTPInput);
	//#endregion
	//#region js/src/number-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO number-input.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$16 = "number-input";
	const EVENT_KEY$11 = `.bs.number-input`;
	const DATA_API_KEY$8 = ".data-api";
	const EVENT_CHANGE$3 = `change${EVENT_KEY$11}`;
	const CLASS_NAME_ACTION$1 = "form-control-action";
	const CLASS_NAME_NUMBER_INPUT = "number-input";
	const SELECTOR_DATA_TOGGLE$11 = "[data-bs-toggle=\"number-input\"]";
	const REPEAT_DELAY = 400;
	const REPEAT_INTERVAL = 60;
	const DISALLOWED_ATTRIBUTES$3 = /* @__PURE__ */ new Set([
		"sanitize",
		"allowList",
		"sanitizeFn"
	]);
	const Default$15 = {
		allowList: SVGAllowlist,
		ariaDecrementLabel: "Decrease",
		ariaIncrementLabel: "Increase",
		decrementIcon: MINUS_ICON,
		incrementIcon: PLUS_ICON,
		repeat: true,
		sanitize: true,
		sanitizeFn: null
	};
	const DefaultType$15 = {
		allowList: "object",
		ariaDecrementLabel: "string",
		ariaIncrementLabel: "string",
		decrementIcon: "string",
		incrementIcon: "string",
		repeat: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)"
	};
	/**
	* Class definition
	*/
	var NumberInput = class NumberInput extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._decrementElement = null;
			this._incrementElement = null;
			this._group = null;
			this._repeatTimeout = null;
			this._repeatInterval = null;
			this._createButtons();
			this._addEventListeners();
			this._updateButtonState();
		}
		static get Default() {
			return Default$15;
		}
		static get DefaultType() {
			return DefaultType$15;
		}
		static get NAME() {
			return NAME$16;
		}
		increment() {
			this._step("up");
		}
		decrement() {
			this._step("down");
		}
		dispose() {
			this._stopRepeating();
			this._decrementElement?.remove();
			this._incrementElement?.remove();
			if (this._group) {
				this._group.element.classList.remove(CLASS_NAME_NUMBER_INPUT);
				releaseControlGroup(this._element, this._group);
			}
			super.dispose();
		}
		_step(direction) {
			if (this._element.disabled || this._element.readOnly) return;
			if (this._element.value === "") this._element.value = this._element.min === "" ? "0" : this._element.min;
			else if (direction === "up") this._element.stepUp();
			else this._element.stepDown();
			this._updateButtonState();
			EventHandler.trigger(this._element, "input", { bubbles: true });
			EventHandler.trigger(this._element, "change", { bubbles: true });
			EventHandler.trigger(this._element, EVENT_CHANGE$3, { value: this._element.value });
		}
		_createButtons() {
			this._group = ensureControlGroup(this._element);
			const group = this._group.element;
			group.classList.add(CLASS_NAME_NUMBER_INPUT);
			this._decrementElement = createControlGroupAction({
				className: CLASS_NAME_ACTION$1,
				icon: this._config.decrementIcon,
				label: this._config.ariaDecrementLabel,
				sanitizeIcon: (icon) => this._sanitizeIcon(icon)
			});
			this._incrementElement = createControlGroupAction({
				className: CLASS_NAME_ACTION$1,
				icon: this._config.incrementIcon,
				label: this._config.ariaIncrementLabel,
				sanitizeIcon: (icon) => this._sanitizeIcon(icon)
			});
			for (const button of [this._decrementElement, this._incrementElement]) {
				button.tabIndex = -1;
				group.append(button);
			}
		}
		_addEventListeners() {
			for (const [button, direction] of [[this._decrementElement, "down"], [this._incrementElement, "up"]]) {
				if (!button) continue;
				EventHandler.on(button, "click", () => this._step(direction));
				if (this._config.repeat) EventHandler.on(button, "pointerdown", (event) => {
					if (event.button !== 0) return;
					this._startRepeating(direction);
				});
			}
			EventHandler.on(this._element, "input", () => this._updateButtonState());
			for (const event of [
				"pointerup",
				"pointercancel",
				"pointerleave",
				"blur"
			]) EventHandler.on(document, event, () => this._stopRepeating());
		}
		_startRepeating(direction) {
			this._stopRepeating();
			this._repeatTimeout = setTimeout(() => {
				this._repeatInterval = setInterval(() => this._step(direction), REPEAT_INTERVAL);
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
			const { max, min, value } = this._element;
			if (this._decrementElement) this._decrementElement.disabled = min !== "" && value !== "" && Number(value) <= Number(min);
			if (this._incrementElement) this._incrementElement.disabled = max !== "" && value !== "" && Number(value) >= Number(max);
		}
		_sanitizeIcon(icon) {
			return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon;
		}
		_getConfig(config) {
			const dataAttributes = Manipulator.getDataAttributes(this._element);
			for (const dataAttribute of Object.keys(dataAttributes)) if (DISALLOWED_ATTRIBUTES$3.has(dataAttribute)) delete dataAttributes[dataAttribute];
			return super._getConfig({
				...dataAttributes,
				...typeof config === "object" ? config : {}
			});
		}
		static _initializeDataApi() {
			for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE$11)) NumberInput.getOrCreateInstance(element);
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = NumberInput.getOrCreateInstance(this);
				if (typeof config === "string") data[config]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$11}${DATA_API_KEY$8}`, () => {
		NumberInput._initializeDataApi();
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(NumberInput);
	//#endregion
	//#region js/src/password-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO password-input.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$15 = "password-input";
	const EVENT_KEY$10 = `.bs.password-input`;
	const DATA_API_KEY$7 = ".data-api";
	const CLASS_NAME_ACTION = "form-control-action";
	const CLASS_NAME_PASSWORD_INPUT = "password-input";
	const SELECTOR_DATA_TOGGLE$10 = "[data-bs-toggle=\"password-input\"]";
	const Default$14 = {
		allowList: SVGAllowlist,
		ariaToggleLabel: "Toggle password visibility",
		hideIcon: PASSWORD_HIDE_ICON,
		sanitize: true,
		sanitizeFn: null,
		showIcon: PASSWORD_SHOW_ICON
	};
	const DefaultType$14 = {
		allowList: "object",
		ariaToggleLabel: "string",
		hideIcon: "string",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		showIcon: "string"
	};
	/**
	* Class definition
	*/
	var PasswordInput = class PasswordInput extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._group = null;
			this._toggleElement = null;
			this._createToggle();
			this._updateToggleState();
		}
		static get Default() {
			return Default$14;
		}
		static get DefaultType() {
			return DefaultType$14;
		}
		static get NAME() {
			return NAME$15;
		}
		toggle() {
			this._element.type = this._element.type === "password" ? "text" : "password";
			this._updateToggleState();
		}
		dispose() {
			this._toggleElement?.remove();
			if (this._group) {
				this._group.element.classList.remove(CLASS_NAME_PASSWORD_INPUT);
				releaseControlGroup(this._element, this._group);
			}
			super.dispose();
		}
		_createToggle() {
			this._group = ensureControlGroup(this._element);
			this._group.element.classList.add(CLASS_NAME_PASSWORD_INPUT);
			this._toggleElement = createControlGroupAction({
				className: CLASS_NAME_ACTION,
				disabled: this._element.disabled,
				icon: this._config.showIcon,
				label: this._config.ariaToggleLabel,
				sanitizeIcon: (icon) => this._sanitizeIcon(icon)
			});
			EventHandler.on(this._toggleElement, "click", () => this.toggle());
			this._group.element.append(this._toggleElement);
		}
		_updateToggleState() {
			if (!this._toggleElement) return;
			const visible = this._element.type === "text";
			this._toggleElement.setAttribute("aria-pressed", visible ? "true" : "false");
			this._toggleElement.innerHTML = this._sanitizeIcon(visible ? this._config.hideIcon : this._config.showIcon);
		}
		_sanitizeIcon(icon) {
			return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon;
		}
		static _initializeDataApi() {
			for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE$10)) PasswordInput.getOrCreateInstance(element);
		}
		static jQueryInterface(config) {
			return this.each(function() {
				PasswordInput.getOrCreateInstance(this)[config](this);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$10}${DATA_API_KEY$7}`, () => {
		PasswordInput._initializeDataApi();
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(PasswordInput);
	//#endregion
	//#region js/src/password-strength.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI password-strength.js
	* License (https://coreui.io/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$14 = "password-strength";
	const EVENT_KEY$9 = `.bs.password-strength`;
	const DATA_API_KEY$6 = ".data-api";
	const EVENT_CHANGE$2 = `change${EVENT_KEY$9}`;
	const CLASS_NAME_BUSY = "password-strength-busy";
	const CLASS_NAME_FEEDBACK = "password-strength-feedback";
	const CLASS_NAME_METER = "password-strength-meter";
	const CLASS_NAME_PASSWORD_STRENGTH = "password-strength";
	const CLASS_NAME_SEGMENT = "password-strength-segment";
	const CLASS_NAME_SUGGESTIONS = "password-strength-suggestions";
	const CLASS_NAME_TEXT = "password-strength-text";
	const CLASS_NAME_WARNING = "password-strength-warning";
	const SELECTOR_DATA_TOGGLE$9 = "[data-bs-toggle=\"password-strength\"]";
	const SELECTOR_PASSWORD = "input[type=\"password\"], input[data-bs-toggle=\"password-input\"]";
	const Default$13 = {
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
	const DefaultType$13 = {
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
	/**
	* Class definition
	*/
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
				EventHandler.on(this._input, "input", () => this._schedule());
				EventHandler.on(this._input, "change", () => this._schedule());
				this._evaluate();
			}
		}
		static get Default() {
			return Default$13;
		}
		static get DefaultType() {
			return DefaultType$13;
		}
		static get NAME() {
			return NAME$14;
		}
		getScore() {
			return this._score;
		}
		evaluate() {
			this._evaluate();
		}
		dispose() {
			if (this._timeout) clearTimeout(this._timeout);
			if (this._input) {
				EventHandler.off(this._input, "input");
				EventHandler.off(this._input, "change");
			}
			this._meterElement?.remove();
			SelectorEngine.findOne(`.${CLASS_NAME_FEEDBACK}`, this._element)?.remove();
			this._element.classList.remove(CLASS_NAME_PASSWORD_STRENGTH, CLASS_NAME_BUSY);
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
				this._apply(this._builtInScore(password, userInputs), password);
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
			EventHandler.trigger(this._element, EVENT_CHANGE$2, {
				score,
				level: score === null ? null : this._config.levels[score],
				password: password.length > 0 ? "***" : ""
			});
		}
		_render(result) {
			const score = result ? result.score : null;
			if (score === null) delete this._element.dataset.bsStrength;
			else this._element.dataset.bsStrength = String(score);
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
			for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE$9)) PasswordStrength.getOrCreateInstance(element);
		}
		static jQueryInterface(config) {
			return this.each(function() {
				PasswordStrength.getOrCreateInstance(this)[config](this);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$9}${DATA_API_KEY$6}`, () => {
		PasswordStrength._initializeDataApi();
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(PasswordStrength);
	//#endregion
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
	const NAME$13 = "TemplateFactory";
	const Default$12 = {
		allowList: DefaultAllowlist,
		content: {},
		extraClass: "",
		html: false,
		sanitize: true,
		sanitizeFn: null,
		template: "<div></div>"
	};
	const DefaultType$12 = {
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
	var TemplateFactory = class extends Config {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
		}
		static get Default() {
			return Default$12;
		}
		static get DefaultType() {
			return DefaultType$12;
		}
		static get NAME() {
			return NAME$13;
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
			if (isElement$1(content)) {
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
				templateElement.innerHTML = "";
				templateElement.append(element);
				return;
			}
			templateElement.textContent = element.textContent;
		}
	};
	//#endregion
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
	const NAME$12 = "tooltip";
	const DISALLOWED_ATTRIBUTES$2 = /* @__PURE__ */ new Set([
		"sanitize",
		"allowList",
		"sanitizeFn"
	]);
	const ESCAPE_KEY = "Escape";
	const CLASS_NAME_MODAL = "modal";
	const CLASS_NAME_SHOW$6 = "show";
	const SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
	const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
	const SELECTOR_DATA_TOGGLE$8 = "[data-bs-toggle=\"tooltip\"]";
	const EVENT_MODAL_HIDE = "hide.bs.modal";
	const TRIGGER_HOVER = "hover";
	const TRIGGER_FOCUS = "focus";
	const TRIGGER_CLICK = "click";
	const TRIGGER_MANUAL = "manual";
	const EVENT_HIDE$4 = "hide";
	const EVENT_HIDDEN$4 = "hidden";
	const EVENT_SHOW$4 = "show";
	const EVENT_SHOWN$4 = "shown";
	const EVENT_INSERTED = "inserted";
	const EVENT_CLICK$4 = "click";
	const EVENT_FOCUSIN$3 = "focusin";
	const EVENT_FOCUSOUT$2 = "focusout";
	const EVENT_MOUSEENTER$2 = "mouseenter";
	const EVENT_MOUSELEAVE$1 = "mouseleave";
	const EVENT_KEYDOWN$2 = "keydown";
	const AttachmentMap = {
		AUTO: "auto",
		TOP: "top",
		RIGHT: isRTL$1() ? "left" : "right",
		BOTTOM: "bottom",
		LEFT: isRTL$1() ? "right" : "left"
	};
	const Default$11 = {
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
		html: false,
		offset: [0, 6],
		placement: "top",
		floatingConfig: null,
		sanitize: true,
		sanitizeFn: null,
		selector: false,
		template: "<div class=\"tooltip\" role=\"tooltip\"><div class=\"tooltip-arrow\"></div><div class=\"tooltip-inner\"></div></div>",
		title: "",
		trigger: "hover focus"
	};
	const DefaultType$11 = {
		allowList: "object",
		animation: "boolean",
		boundary: "(string|element)",
		container: "(string|element|boolean)",
		customClass: "(string|function)",
		delay: "(number|object)",
		fallbackPlacements: "array",
		html: "boolean",
		offset: "(array|string|function)",
		placement: "(string|function)",
		floatingConfig: "(null|object|function)",
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
	var Tooltip = class Tooltip extends BaseComponent {
		constructor(element, config) {
			if (typeof computePosition === "undefined") throw new TypeError("CoreUI's tooltips require Floating UI (https://floating-ui.com)");
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
			return Default$11;
		}
		static get DefaultType() {
			return DefaultType$11;
		}
		static get NAME() {
			return NAME$12;
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
			EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
			if (this._element.getAttribute("data-bs-original-title")) this._element.setAttribute("title", this._element.getAttribute("data-bs-original-title"));
			this._disposeFloating();
			this._disposeMediaQueryListeners();
			super.dispose();
		}
		async show() {
			if (this._element.style.display === "none") throw new Error("Please use show on visible elements");
			if (!(this._isWithContent() && this._isEnabled)) return;
			const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$4));
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
				EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
				this._setTipListeners(tip);
			}
			await this._createFloating(tip);
			tip.classList.add(CLASS_NAME_SHOW$6);
			this._setEscapeListener();
			if ("ontouchstart" in document.documentElement) for (const element of document.body.children) EventHandler.on(element, "mouseover", noop);
			const complete = () => {
				EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$4));
				if (this._isHovered === false) this._leave();
				this._isHovered = false;
			};
			await this._queueCallback(complete, this.tip, this._isAnimated());
		}
		async hide() {
			if (!this._isShown()) return;
			if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$4)).defaultPrevented) return;
			this._removeEscapeListener();
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
				EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$4));
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
			return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-bs-original-title");
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
			if (this._responsivePlacements) {
				const placement = getResponsivePlacement(this._responsivePlacements, "top");
				return AttachmentMap[placement.toUpperCase()] || placement;
			}
			const placement = execute(this._config.placement, [
				this,
				tip,
				this._element
			]);
			return AttachmentMap[placement.toUpperCase()] || placement;
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
			this._floatingCleanup = autoUpdate(this._element, tip, () => this._updateFloatingPosition(tip, null, arrowElement));
		}
		async _updateFloatingPosition(tip = this.tip, placement = null, arrowElement = null) {
			if (!tip) return;
			if (!placement) placement = this._getPlacement(tip);
			if (!arrowElement) arrowElement = tip.querySelector(`.${this.constructor.NAME}-arrow`);
			const middleware = this._getFloatingMiddleware(arrowElement);
			const floatingConfig = this._getFloatingConfig(placement, middleware);
			Manipulator.setDataAttribute(tip, "placement", floatingConfig.placement);
			let { x, y, placement: finalPlacement, middlewareData } = await computePosition(this._element, tip, floatingConfig);
			if (finalPlacement !== floatingConfig.placement) {
				Manipulator.setDataAttribute(tip, "placement", finalPlacement);
				({x, y, placement: finalPlacement, middlewareData} = await computePosition(this._element, tip, {
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
				offset(typeof offsetValue === "function" ? offsetValue : toFloatingOffset(offsetValue)),
				flip({ fallbackPlacements: this._config.fallbackPlacements }),
				shift({ boundary: this._config.boundary === "clippingParents" ? "clippingAncestors" : this._config.boundary })
			];
			if (arrowElement) middleware.push(arrow({ element: arrowElement }));
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
			for (const trigger of triggers) if (trigger === "click") EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$4), this._config.selector, (event) => {
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
				[TRIGGER_FOCUS]: [this.constructor.eventName(EVENT_FOCUSIN$3), this.constructor.eventName(EVENT_FOCUSOUT$2)]
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
			this._element.ownerDocument.addEventListener(EVENT_KEYDOWN$2, this._keydownHandler, true);
		}
		_removeEscapeListener() {
			if (!this._keydownHandler) return;
			this._element.ownerDocument.removeEventListener(EVENT_KEYDOWN$2, this._keydownHandler, true);
			this._keydownHandler = null;
		}
		_fixTitle() {
			const title = this._element.getAttribute("title");
			if (!title) return;
			if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) this._element.setAttribute("aria-label", title);
			this._element.setAttribute("data-bs-original-title", title);
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
		_getConfig(config) {
			const dataAttributes = Manipulator.getDataAttributes(this._element);
			for (const dataAttribute of Object.keys(dataAttributes)) if (DISALLOWED_ATTRIBUTES$2.has(dataAttribute)) delete dataAttributes[dataAttribute];
			config = {
				...dataAttributes,
				...typeof config === "object" && config ? config : {}
			};
			config = this._mergeConfigObj(config);
			config = this._configAfterMerge(config);
			this._typeCheckConfig(config);
			return config;
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
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Tooltip.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			});
		}
	};
	/**
	* Data API implementation - auto-initialize tooltips
	*/
	const initTooltip = (event) => {
		const target = event.target.closest(SELECTOR_DATA_TOGGLE$8);
		if (!target) return;
		Tooltip.getOrCreateInstance(target);
	};
	EventHandler.on(document, EVENT_FOCUSIN$3, SELECTOR_DATA_TOGGLE$8, initTooltip);
	EventHandler.on(document, EVENT_MOUSEENTER$2, SELECTOR_DATA_TOGGLE$8, initTooltip);
	/**
	* jQuery
	*/
	defineJQueryPlugin(Tooltip);
	//#endregion
	//#region js/src/popover.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI popover.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's popover.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$11 = "popover";
	const SELECTOR_TITLE = ".popover-header";
	const SELECTOR_CONTENT = ".popover-body";
	const SELECTOR_DATA_TOGGLE$7 = "[data-bs-toggle=\"popover\"]";
	const EVENT_CLICK$3 = "click";
	const EVENT_FOCUSIN$2 = "focusin";
	const EVENT_MOUSEENTER$1 = "mouseenter";
	const Default$10 = {
		...Tooltip.Default,
		content: "",
		offset: [0, 8],
		placement: "right",
		template: "<div class=\"popover\" role=\"tooltip\"><div class=\"popover-arrow\"></div><h3 class=\"popover-header\"></h3><div class=\"popover-body\"></div></div>",
		trigger: "click"
	};
	const DefaultType$10 = {
		...Tooltip.DefaultType,
		content: "(null|string|element|function)"
	};
	/**
	* Class definition
	*/
	var Popover = class Popover extends Tooltip {
		constructor(element, config) {
			super(element, config);
		}
		static get Default() {
			return Default$10;
		}
		static get DefaultType() {
			return DefaultType$10;
		}
		static get NAME() {
			return NAME$11;
		}
		_isWithContent() {
			return Boolean(this._getTitle() || this._getContent()) || this._hasNewContent();
		}
		_getContentForTemplate() {
			return {
				[SELECTOR_TITLE]: this._getTitle(),
				[SELECTOR_CONTENT]: this._getContent()
			};
		}
		_getContent() {
			return this._resolvePossibleFunction(this._config.content);
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Popover.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			});
		}
	};
	/**
	* Data API implementation - auto-initialize popovers
	*/
	const initPopover = (event) => {
		const target = event.target.closest(SELECTOR_DATA_TOGGLE$7);
		if (!target) return;
		if (event.type === "click") event.preventDefault();
		Popover.getOrCreateInstance(target);
	};
	EventHandler.on(document, EVENT_CLICK$3, SELECTOR_DATA_TOGGLE$7, initPopover);
	EventHandler.on(document, EVENT_FOCUSIN$2, SELECTOR_DATA_TOGGLE$7, initPopover);
	EventHandler.on(document, EVENT_MOUSEENTER$1, SELECTOR_DATA_TOGGLE$7, initPopover);
	/**
	* jQuery
	*/
	defineJQueryPlugin(Popover);
	//#endregion
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
	const NAME$10 = "range-slider";
	const EVENT_KEY$8 = `.bs.range-slider`;
	const DATA_API_KEY$5 = ".data-api";
	const DISALLOWED_ATTRIBUTES$1 = /* @__PURE__ */ new Set([
		"sanitize",
		"allowList",
		"sanitizeFn"
	]);
	const EVENT_CHANGE$1 = `change${EVENT_KEY$8}`;
	const EVENT_INPUT = `input${EVENT_KEY$8}`;
	const EVENT_LOAD_DATA_API$7 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
	const EVENT_MOUSEDOWN$1 = `mousedown${EVENT_KEY$8}`;
	const EVENT_MOUSEMOVE = `mousemove${EVENT_KEY$8}`;
	const EVENT_MOUSEUP = `mouseup${EVENT_KEY$8}`;
	const EVENT_RESIZE$1 = `resize${EVENT_KEY$8}`;
	const CLASS_NAME_CLICKABLE = "clickable";
	const CLASS_NAME_DISABLED$1 = "disabled";
	const CLASS_NAME_RANGE_SLIDER = "range-slider";
	const CLASS_NAME_RANGE_SLIDER_INPUT = "range-slider-input";
	const CLASS_NAME_RANGE_SLIDER_INPUTS_CONTAINER = "range-slider-inputs-container";
	const CLASS_NAME_RANGE_SLIDER_LABEL = "range-slider-label";
	const CLASS_NAME_RANGE_SLIDER_LABELS_CONTAINER = "range-slider-labels-container";
	const CLASS_NAME_RANGE_SLIDER_TOOLTIP = "range-slider-tooltip";
	const CLASS_NAME_RANGE_SLIDER_TOOLTIP_ARROW = "range-slider-tooltip-arrow";
	const CLASS_NAME_RANGE_SLIDER_TOOLTIP_INNER = "range-slider-tooltip-inner";
	const CLASS_NAME_RANGE_SLIDER_TRACK = "range-slider-track";
	const CLASS_NAME_RANGE_SLIDER_VERTICAL = "range-slider-vertical";
	const SELECTOR_DATA_TOGGLE$6 = "[data-bs-toggle=\"range-slider\"]";
	const SELECTOR_RANGE_SLIDER_INPUT = ".range-slider-input";
	const SELECTOR_RANGE_SLIDER_INPUTS_CONTAINER = ".range-slider-inputs-container";
	const SELECTOR_RANGE_SLIDER_LABEL = ".range-slider-label";
	const SELECTOR_RANGE_SLIDER_LABELS_CONTAINER = ".range-slider-labels-container";
	const Default$9 = {
		allowList: DefaultAllowlist,
		ariaLabels: null,
		clickableLabels: true,
		disabled: false,
		distance: 0,
		labels: false,
		max: 100,
		min: 0,
		name: null,
		sanitize: true,
		sanitizeFn: null,
		step: 1,
		tooltips: true,
		tooltipsFormat: null,
		track: "fill",
		value: 0,
		vertical: false
	};
	const DefaultType$9 = {
		allowList: "object",
		ariaLabels: "(array|null)",
		clickableLabels: "boolean",
		disabled: "boolean",
		distance: "number",
		labels: "(array|boolean|string)",
		max: "number",
		min: "number",
		name: "(array|string|null)",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		step: "(number|string)",
		tooltips: "boolean",
		tooltipsFormat: "(function|null)",
		track: "(boolean|string)",
		value: "(array|number)",
		vertical: "boolean"
	};
	/**
	* Class definition
	*/
	var RangeSlider = class RangeSlider extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._currentValue = this._config.value;
			this._dragIndex = 0;
			this._inputs = [];
			this._isDragging = false;
			this._sliderTrack = null;
			this._tooltips = [];
			this._initializeRangeSlider();
		}
		static get Default() {
			return Default$9;
		}
		static get DefaultType() {
			return DefaultType$9;
		}
		static get NAME() {
			return NAME$10;
		}
		update(config) {
			this._config = this._getConfig(config);
			this._currentValue = this._config.value;
			this._element.innerHTML = "";
			this._initializeRangeSlider();
		}
		dispose() {
			EventHandler.off(window, EVENT_KEY$8);
			EventHandler.off(document.documentElement, EVENT_KEY$8);
			super.dispose();
		}
		_addEventListeners() {
			if (this._config.disabled) return;
			EventHandler.on(this._element, EVENT_INPUT, SELECTOR_RANGE_SLIDER_INPUT, (event) => {
				const { target } = event;
				this._isDragging = false;
				const children = SelectorEngine.children(target.parentElement, SELECTOR_RANGE_SLIDER_INPUT);
				const index = Array.from(children).indexOf(target);
				this._updateValue(target.value, index);
				EventHandler.trigger(this._element, EVENT_INPUT, { value: this._currentValue });
			});
			EventHandler.on(this._element, EVENT_CHANGE$1, SELECTOR_RANGE_SLIDER_INPUT, () => {
				EventHandler.trigger(this._element, EVENT_CHANGE$1, { value: this._currentValue });
			});
			EventHandler.on(this._element, EVENT_MOUSEDOWN$1, SELECTOR_RANGE_SLIDER_LABEL, (event) => {
				if (!this._config.clickableLabels || event.button !== 0) return;
				const value = Manipulator.getDataAttribute(event.target, "value");
				this._updateNearestValue(value);
			});
			EventHandler.on(this._element, EVENT_MOUSEDOWN$1, SELECTOR_RANGE_SLIDER_INPUTS_CONTAINER, (event) => {
				if (event.button !== 0) return;
				if (!(event.target instanceof HTMLInputElement) && !event.target.className.includes(CLASS_NAME_RANGE_SLIDER_TRACK)) return;
				this._isDragging = true;
				const clickValue = this._calculateClickValue(event);
				this._dragIndex = this._getNearestValueIndex(clickValue);
				this._updateNearestValue(clickValue);
				EventHandler.trigger(this._element, EVENT_CHANGE$1, { value: this._currentValue });
				EventHandler.trigger(this._element, EVENT_INPUT, { value: this._currentValue });
			});
			EventHandler.on(document.documentElement, EVENT_MOUSEUP, () => {
				this._isDragging = false;
			});
			EventHandler.on(document.documentElement, EVENT_MOUSEMOVE, (event) => {
				if (!this._isDragging) return;
				const moveValue = this._calculateMoveValue(event);
				this._updateValue(moveValue, this._dragIndex);
			});
			EventHandler.on(window, EVENT_RESIZE$1, () => {
				this._updateLabelsContainerSize();
			});
		}
		_initializeRangeSlider() {
			this._element.classList.add(CLASS_NAME_RANGE_SLIDER);
			if (this._config.vertical) this._element.classList.add(CLASS_NAME_RANGE_SLIDER_VERTICAL);
			if (this._config.disabled) this._element.classList.add(CLASS_NAME_DISABLED$1);
			this._sliderTrack = this._createSliderTrack();
			this._createInputs();
			this._createLabels();
			this._updateLabelsContainerSize();
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
			if (this._config.name) inputElement.name = Array.isArray(this._config.name) ? `${this._config.name[index]}` : `${this._config.name}-${index}`;
			inputElement.disabled = this._config.disabled;
			inputElement.setAttribute("role", "slider");
			inputElement.setAttribute("aria-valuemin", this._config.min);
			inputElement.setAttribute("aria-valuemax", this._config.max);
			inputElement.setAttribute("aria-valuenow", value);
			inputElement.setAttribute("aria-orientation", this._config.vertical ? "vertical" : "horizontal");
			if (this._currentValue.length > 1) inputElement.setAttribute("aria-label", this._getAriaLabel(index));
			const valueText = this._getValueText(value);
			if (valueText !== null) inputElement.setAttribute("aria-valuetext", valueText);
			return inputElement;
		}
		_getAriaLabel(index) {
			if (Array.isArray(this._config.ariaLabels) && this._config.ariaLabels[index]) return this._config.ariaLabels[index];
			if (this._currentValue.length === 2) return index === 0 ? "Minimum value" : "Maximum value";
			return `Value ${index + 1}`;
		}
		_getValueText(value) {
			return typeof this._config.tooltipsFormat === "function" ? `${this._config.tooltipsFormat(value)}` : null;
		}
		_createLabels() {
			const { clickableLabels, disabled, labels, min, max, vertical } = this._config;
			if (!labels || !Array.isArray(labels) || labels.length === 0) return;
			const labelsContainer = this._createElement("div", CLASS_NAME_RANGE_SLIDER_LABELS_CONTAINER);
			for (const [index, label] of this._config.labels.entries()) {
				const labelElement = this._createElement("div", CLASS_NAME_RANGE_SLIDER_LABEL);
				if (clickableLabels && !disabled) labelElement.classList.add(CLASS_NAME_CLICKABLE);
				if (label.class) {
					const classNames = Array.isArray(label.class) ? label.class : [label.class];
					labelElement.classList.add(...classNames);
				}
				if (label.style && typeof label.style === "object") Object.assign(labelElement.style, label.style);
				const percentage = labels.length === 1 ? 0 : index / (labels.length - 1) * 100;
				const labelValue = typeof label === "object" ? label.value : min + percentage / 100 * (max - min);
				Manipulator.setDataAttribute(labelElement, "value", labelValue);
				labelElement.textContent = typeof label === "object" ? label.label : label;
				const position = this._calculateLabelPosition(label, index, percentage);
				if (vertical) labelElement.style.bottom = position;
				else labelElement.style[isRTL$1() ? "right" : "left"] = position;
				labelsContainer.append(labelElement);
			}
			this._element.append(labelsContainer);
		}
		_calculateLabelPosition(label, index) {
			if (typeof label === "object" && label.value !== void 0) return `${(label.value - this._config.min) / (this._config.max - this._config.min) * 100}%`;
			return `${index / (this._config.labels.length - 1) * 100}%`;
		}
		_updateLabelsContainerSize() {
			const labelsContainer = SelectorEngine.findOne(SELECTOR_RANGE_SLIDER_LABELS_CONTAINER, this._element);
			if (!this._config.labels || !labelsContainer) return;
			const labels = SelectorEngine.find(SELECTOR_RANGE_SLIDER_LABEL, this._element);
			if (labels.length === 0) return;
			const maxSize = Math.max(...labels.map((label) => this._config.vertical ? label.offsetWidth : label.offsetHeight));
			labelsContainer.style[this._config.vertical ? "width" : "height"] = `${maxSize}px`;
		}
		_createTooltips() {
			if (!this._config.tooltips) return;
			const inputs = SelectorEngine.find(SELECTOR_RANGE_SLIDER_INPUT, this._element);
			for (const input of inputs) {
				const tooltipElement = this._createElement("output", CLASS_NAME_RANGE_SLIDER_TOOLTIP);
				tooltipElement.setAttribute("aria-hidden", "true");
				const tooltipInnerElement = this._createElement("span", CLASS_NAME_RANGE_SLIDER_TOOLTIP_INNER);
				const tooltipArrowElement = this._createElement("span", CLASS_NAME_RANGE_SLIDER_TOOLTIP_ARROW);
				tooltipInnerElement.innerHTML = this._config.tooltipsFormat ? this._config.sanitize ? sanitizeHtml(this._config.tooltipsFormat(input.value), this._config.allowList, this._config.sanitizeFn) : this._config.tooltipsFormat(input.value) : input.value;
				tooltipElement.append(tooltipInnerElement, tooltipArrowElement);
				input.parentNode.insertBefore(tooltipElement, input.nextSibling);
				this._positionTooltip(tooltipElement, input);
				this._tooltips.push(tooltipElement);
			}
		}
		_positionTooltip(tooltip, input) {
			const percent = (Number(input.value) - this._config.min) / (this._config.max - this._config.min);
			tooltip.style.setProperty("--bs-range-slider-tooltip-position", `${percent}`);
		}
		_updateTooltip(index, value) {
			if (!this._config.tooltips) return;
			if (this._tooltips[index]) {
				this._tooltips[index].children[0].innerHTML = this._config.tooltipsFormat ? this._config.sanitize ? sanitizeHtml(this._config.tooltipsFormat(value), this._config.allowList, this._config.sanitizeFn) : this._config.tooltipsFormat(value) : value;
				const input = SelectorEngine.find(SELECTOR_RANGE_SLIDER_INPUT, this._element)[index];
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
			if (typeof position === "string") return position === "max" ? this._config.max : this._config.min;
			const value = this._config.min + position * (this._config.max - this._config.min);
			return this._roundToStep(value, this._config.step);
		}
		_calculateVerticalPosition(mouseY, rect) {
			if (mouseY < rect.top) return "max";
			if (mouseY > rect.bottom) return "min";
			return Math.min(Math.max((rect.bottom - mouseY) / rect.height, 0), 1);
		}
		_calculateHorizontalPosition(mouseX, rect) {
			if (mouseX < rect.left) return isRTL$1() ? "max" : "min";
			if (mouseX > rect.right) return isRTL$1() ? "min" : "max";
			const relativeX = isRTL$1() ? rect.right - mouseX : mouseX - rect.left;
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
			return isRTL$1() ? 1 - offsetX / offsetWidth : offsetX / offsetWidth;
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
			const edge = (value) => `${(value - this._config.min) / span * 100}%`;
			this._sliderTrack.style.setProperty("--bs-range-slider-track-from", this._currentValue.length === 1 ? "0%" : edge(min));
			this._sliderTrack.style.setProperty("--bs-range-slider-track-to", edge(max));
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
		_roundToStep(number, step) {
			const _step = step === 0 ? 1 : step;
			return Math.round(number / _step) * _step;
		}
		_configAfterMerge(config) {
			if (typeof config.labels === "string") config.labels = config.labels.split(/,\s*/);
			if (typeof config.name === "string" && config.name.includes(",")) config.name = config.name.split(/,\s*/);
			if (typeof config.value === "number") config.value = [config.value];
			if (typeof config.value === "string") config.value = config.value.split(/,\s*/).map(Number);
			return config;
		}
		_getConfig(config) {
			const dataAttributes = Manipulator.getDataAttributes(this._element);
			for (const dataAttribute of Object.keys(dataAttributes)) if (DISALLOWED_ATTRIBUTES$1.has(dataAttribute)) delete dataAttributes[dataAttribute];
			config = {
				...dataAttributes,
				...typeof config === "object" && config ? config : {}
			};
			config = this._mergeConfigObj(config);
			config = this._configAfterMerge(config);
			this._typeCheckConfig(config);
			return config;
		}
		static rangeSliderInterface(element, config) {
			const data = RangeSlider.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = RangeSlider.getOrCreateInstance(this);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config](this);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$7, () => {
		const ratings = SelectorEngine.find(SELECTOR_DATA_TOGGLE$6);
		for (let i = 0, len = ratings.length; i < len; i++) RangeSlider.rangeSliderInterface(ratings[i]);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(RangeSlider);
	//#endregion
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
	const NAME$9 = "rating";
	const EVENT_KEY$7 = `.bs.rating`;
	const DATA_API_KEY$4 = ".data-api";
	const DISALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set([
		"sanitize",
		"allowList",
		"sanitizeFn"
	]);
	const EVENT_CHANGE = `change${EVENT_KEY$7}`;
	const EVENT_CLICK$2 = `click${EVENT_KEY$7}`;
	const EVENT_FOCUSIN$1 = `focusin${EVENT_KEY$7}`;
	const EVENT_FOCUSOUT$1 = `focusout${EVENT_KEY$7}`;
	const EVENT_HOVER = `hover${EVENT_KEY$7}`;
	const EVENT_LOAD_DATA_API$6 = `load${EVENT_KEY$7}${DATA_API_KEY$4}`;
	const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY$7}`;
	const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY$7}`;
	const CLASS_NAME_ACTIVE$4 = "active";
	const CLASS_NAME_DISABLED = "disabled";
	const CLASS_NAME_RATING = "rating";
	const CLASS_NAME_RATING_ITEM = "rating-item";
	const CLASS_NAME_RATING_ITEM_ICON = "rating-item-icon";
	const CLASS_NAME_RATING_ITEM_CUSTOM_ICON = "rating-item-custom-icon";
	const CLASS_NAME_RATING_ITEM_CUSTOM_ICON_ACTIVE = "rating-item-custom-icon-active";
	const CLASS_NAME_RATING_ITEM_INPUT = "rating-item-input";
	const CLASS_NAME_RATING_ITEM_LABEL = "rating-item-label";
	const CLASS_NAME_READONLY = "readonly";
	const SELECTOR_DATA_TOGGLE$5 = "[data-bs-toggle=\"rating\"]";
	const SELECTOR_RATING_ITEM_INPUT = ".rating-item-input";
	const SELECTOR_RATING_ITEM_LABEL = ".rating-item-label";
	const Default$8 = {
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
		readOnly: false,
		sanitize: true,
		sanitizeFn: null,
		size: null,
		tooltips: false,
		value: null
	};
	const DefaultType$8 = {
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
		readOnly: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		size: "(string|null)",
		tooltips: "(array|boolean|object)",
		value: "(number|null)"
	};
	/**
	* Class definition
	*/
	var Rating = class Rating extends BaseComponent {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._currentValue = this._config.value;
			this._name = this._config.name || getUID(`${this.constructor.NAME}-name-`).toString();
			this._tooltip = null;
			this._createRating();
			this._addEventListeners();
		}
		static get Default() {
			return Default$8;
		}
		static get DefaultType() {
			return DefaultType$8;
		}
		static get NAME() {
			return NAME$9;
		}
		update(config) {
			this._config = this._getConfig(config);
			this._currentValue = this._config.value;
			this._element.innerHTML = "";
			this._createRating();
			this._addEventListeners();
		}
		reset(value = null) {
			this._currentValue = value;
			this._element.innerHTML = "";
			this._createRating();
			this._addEventListeners();
			EventHandler.trigger(this._element, EVENT_CHANGE, { value });
		}
		_addEventListeners() {
			EventHandler.on(this._element, EVENT_CLICK$2, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				if (this._config.disabled || this._config.readOnly) return;
				if (this._config.allowClear && this._currentValue == target.value) {
					this._currentValue = null;
					target.checked = false;
					this._resetLabels();
					EventHandler.trigger(this._element, EVENT_CHANGE, { value: null });
				}
			});
			EventHandler.on(this._element, EVENT_CHANGE, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				if (this._config.disabled || this._config.readOnly) return;
				this._currentValue = target.value;
				EventHandler.trigger(this._element, EVENT_CHANGE, { value: target.value });
				const inputs = SelectorEngine.find(SELECTOR_RATING_ITEM_INPUT, this._element);
				this._resetLabels();
				if (this._config.highlightOnlySelected) {
					SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, target.parentElement).classList.add(CLASS_NAME_ACTIVE$4);
					return;
				}
				for (const input of inputs) {
					SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement).classList.add(CLASS_NAME_ACTIVE$4);
					if (input === target) break;
				}
			});
			EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_RATING_ITEM_LABEL, ({ target }) => {
				if (this._config.disabled || this._config.readOnly) return;
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
				if (this._config.disabled || this._config.readOnly) return;
				if (this._tooltip) this._tooltip.hide();
				const checkedInput = SelectorEngine.findOne(`${SELECTOR_RATING_ITEM_INPUT}[value="${this._currentValue}"]`, this._element);
				this._resetLabels();
				EventHandler.trigger(this._element, EVENT_HOVER, { value: null });
				if (checkedInput && this._config.highlightOnlySelected) {
					SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, checkedInput.parentElement).classList.add(CLASS_NAME_ACTIVE$4);
					return;
				}
				if (checkedInput) {
					const inputs = SelectorEngine.find(SELECTOR_RATING_ITEM_INPUT, this._element);
					this._resetLabels();
					for (const input of inputs) {
						SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement).classList.add(CLASS_NAME_ACTIVE$4);
						if (input === checkedInput) break;
					}
				}
			});
			EventHandler.on(this._element, EVENT_FOCUSIN$1, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
				EventHandler.trigger(this._element, EVENT_HOVER, { value: target.value });
				this._createTooltip(target.parentElement, target.value);
			});
			EventHandler.on(this._element, EVENT_FOCUSOUT$1, SELECTOR_RATING_ITEM_INPUT, () => {
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
		_createRating() {
			this._element.classList.add(CLASS_NAME_RATING);
			if (this._config.size) this._element.classList.add(`rating-${this._config.size}`);
			if (this._config.disabled) this._element.classList.add(CLASS_NAME_DISABLED);
			if (this._config.readOnly) this._element.classList.add(CLASS_NAME_READONLY);
			this._element.setAttribute("role", "radiogroup");
			Array.from({ length: this._config.itemCount }, (_, index) => this._createRatingItem(index));
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
					ratingItemIconElement.innerHTML = this._sanitizeIcon(typeof this._config.icon === "object" ? this._config.icon[index + 1] : this._config.icon);
					ratingItemLabelElement.append(ratingItemIconElement);
				} else {
					const ratingItemIconElement = document.createElement("div");
					ratingItemIconElement.classList.add(CLASS_NAME_RATING_ITEM_ICON);
					ratingItemLabelElement.append(ratingItemIconElement);
				}
				if (this._config.icon && this._config.activeIcon) {
					const ratingItemIconActiveElement = document.createElement("div");
					ratingItemIconActiveElement.classList.add(CLASS_NAME_RATING_ITEM_CUSTOM_ICON_ACTIVE);
					ratingItemIconActiveElement.innerHTML = this._sanitizeIcon(typeof this._config.activeIcon === "object" ? this._config.activeIcon[index + 1] : this._config.activeIcon);
					ratingItemLabelElement.append(ratingItemIconActiveElement);
				}
				const ratingItemInputElement = document.createElement("input");
				ratingItemInputElement.classList.add(CLASS_NAME_RATING_ITEM_INPUT);
				ratingItemInputElement.id = ratingItemId;
				ratingItemInputElement.type = "radio";
				ratingItemInputElement.value = value;
				ratingItemInputElement.name = this._name;
				if (typeof this._config.ariaLabel === "function") ratingItemInputElement.setAttribute("aria-label", this._config.ariaLabel(value, this._config.itemCount));
				if (this._config.disabled || this._config.readOnly) ratingItemInputElement.setAttribute("disabled", true);
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
		_sanitizeIcon(icon) {
			return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon;
		}
		_getConfig(config) {
			const dataAttributes = Manipulator.getDataAttributes(this._element);
			for (const dataAttribute of Object.keys(dataAttributes)) if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) delete dataAttributes[dataAttribute];
			config = {
				...dataAttributes,
				...typeof config === "object" && config ? config : {}
			};
			config = this._mergeConfigObj(config);
			config = this._configAfterMerge(config);
			this._typeCheckConfig(config);
			return config;
		}
		static ratingInterface(element, config) {
			const data = Rating.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Rating.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config](this);
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$6, () => {
		const ratings = SelectorEngine.find(SELECTOR_DATA_TOGGLE$5);
		for (let i = 0, len = ratings.length; i < len; i++) Rating.ratingInterface(ratings[i]);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Rating);
	//#endregion
	//#region js/src/scrollspy.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI scrollspy.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's scrollspy.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$8 = "scrollspy";
	const EVENT_KEY$6 = `.bs.scrollspy`;
	const DATA_API_KEY$3 = ".data-api";
	const EVENT_ACTIVATE = `activate${EVENT_KEY$6}`;
	const EVENT_CLICK$1 = `click${EVENT_KEY$6}`;
	const EVENT_LOAD_DATA_API$5 = `load${EVENT_KEY$6}${DATA_API_KEY$3}`;
	const CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
	const CLASS_NAME_ACTIVE$3 = "active";
	const SELECTOR_DATA_SPY = "[data-bs-spy=\"scroll\"]";
	const SELECTOR_TARGET_LINKS = "[href]";
	const SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
	const SELECTOR_NAV_LINKS = ".nav-link";
	const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, .nav-item > ${SELECTOR_NAV_LINKS}, .list-group-item`;
	const SELECTOR_DROPDOWN = ".dropdown";
	const SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
	const Default$7 = {
		rootMargin: "0px 0px -25%",
		smoothScroll: false,
		target: null,
		threshold: [
			.1,
			.5,
			1
		]
	};
	const DefaultType$7 = {
		rootMargin: "string",
		smoothScroll: "boolean",
		target: "element",
		threshold: "array"
	};
	/**
	* Class definition
	*/
	var ScrollSpy = class ScrollSpy extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._targetLinks = /* @__PURE__ */ new Map();
			this._observableSections = /* @__PURE__ */ new Map();
			this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
			this._activeTarget = null;
			this._observer = null;
			this._previousScrollData = {
				visibleEntryTop: 0,
				parentScrollTop: 0
			};
			this.refresh();
		}
		static get Default() {
			return Default$7;
		}
		static get DefaultType() {
			return DefaultType$7;
		}
		static get NAME() {
			return NAME$8;
		}
		refresh() {
			this._initializeTargetsAndObservables();
			this._maybeEnableSmoothScroll();
			if (this._observer) this._observer.disconnect();
			else this._observer = this._getNewObserver();
			for (const section of this._observableSections.values()) this._observer.observe(section);
		}
		dispose() {
			this._observer.disconnect();
			super.dispose();
		}
		_configAfterMerge(config) {
			config.target = getElement(config.target) || document.body;
			if (typeof config.threshold === "string") config.threshold = config.threshold.split(",").map((value) => Number.parseFloat(value));
			return config;
		}
		_maybeEnableSmoothScroll() {
			if (!this._config.smoothScroll) return;
			EventHandler.off(this._config.target, EVENT_CLICK$1);
			EventHandler.on(this._config.target, EVENT_CLICK$1, SELECTOR_TARGET_LINKS, (event) => {
				const observableSection = this._observableSections.get(event.target.hash);
				if (observableSection) {
					event.preventDefault();
					const root = this._rootElement || window;
					const height = observableSection.offsetTop - this._element.offsetTop;
					if (root.scrollTo) {
						root.scrollTo({
							top: height,
							behavior: "smooth"
						});
						return;
					}
					root.scrollTop = height;
				}
			});
		}
		_getNewObserver() {
			const options = {
				root: this._rootElement,
				threshold: this._config.threshold,
				rootMargin: this._config.rootMargin
			};
			return new IntersectionObserver((entries) => this._observerCallback(entries), options);
		}
		_observerCallback(entries) {
			const targetElement = (entry) => this._targetLinks.get(`#${entry.target.id}`);
			const activate = (entry) => {
				this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
				this._process(targetElement(entry));
			};
			const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
			const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
			this._previousScrollData.parentScrollTop = parentScrollTop;
			for (const entry of entries) {
				if (!entry.isIntersecting) {
					this._activeTarget = null;
					this._clearActiveClass(targetElement(entry));
					continue;
				}
				const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
				if (userScrollsDown && entryIsLowerThanPrevious) {
					activate(entry);
					if (!parentScrollTop) return;
					continue;
				}
				if (!userScrollsDown && !entryIsLowerThanPrevious) activate(entry);
			}
		}
		_initializeTargetsAndObservables() {
			this._targetLinks = /* @__PURE__ */ new Map();
			this._observableSections = /* @__PURE__ */ new Map();
			const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
			for (const anchor of targetLinks) {
				if (!anchor.hash || isDisabled(anchor)) continue;
				const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);
				if (isVisible(observableSection)) {
					this._targetLinks.set(decodeURI(anchor.hash), anchor);
					this._observableSections.set(anchor.hash, observableSection);
				}
			}
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
			if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
				SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$3);
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
			return this.each(function() {
				const data = ScrollSpy.getOrCreateInstance(this, config);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$5, () => {
		for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) ScrollSpy.getOrCreateInstance(spy);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(ScrollSpy);
	//#endregion
	//#region js/src/search-button.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI search-button.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$7 = "search-button";
	const EVENT_KEY$5 = `.bs.search-button`;
	const DATA_API_KEY$2 = ".data-api";
	const EVENT_BLUR_DATA_API = `blur${EVENT_KEY$5}${DATA_API_KEY$2}`;
	const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$5}${DATA_API_KEY$2}`;
	const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$5}${DATA_API_KEY$2}`;
	const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$5}${DATA_API_KEY$2}`;
	const EVENT_TRIGGER = `trigger${EVENT_KEY$5}`;
	const CLASS_NAME_SHORTCUT_KEYS = "search-button-keys";
	const CLASS_NAME_SHORTCUT_KEY = "search-button-key";
	const CLASS_NAME_ACTIVE$2 = "active";
	const SELECTOR_DATA_TOGGLE$4 = "[data-bs-search-button]";
	const SELECTOR_EDITABLE_TARGET = "input, textarea, select, [contenteditable=\"\"], [contenteditable=\"true\"], [contenteditable=\"plaintext-only\"]";
	const SELECTOR_PLACEHOLDER = ".search-button-placeholder";
	const SELECTOR_SHORTCUT_KEY = ".search-button-key";
	const SELECTOR_SHORTCUT_KEYS = ".search-button-keys";
	const Default$6 = {
		preventDefault: true,
		shortcut: "meta+/,ctrl+/"
	};
	const DefaultType$6 = {
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
	/**
	* Class definition
	*/
	var SearchButton = class SearchButton extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._shortcutTriggered = false;
			this._shortcuts = this._parseShortcut(this._config.shortcut);
			this._preferredShortcut = this._getPreferredShortcut(this._shortcuts);
			this._syncShortcutKeys();
		}
		static get Default() {
			return Default$6;
		}
		static get DefaultType() {
			return DefaultType$6;
		}
		static get NAME() {
			return NAME$7;
		}
		trigger() {
			this._triggerEvent("api");
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
			if (existingShortcutKeys) return existingShortcutKeys;
			const shortcutKeys = document.createElement("span");
			shortcutKeys.className = CLASS_NAME_SHORTCUT_KEYS;
			shortcutKeys.setAttribute("aria-hidden", "true");
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
				shortcutKey.dataset.bsSearchButtonKey = key;
				shortcutKeys.append(shortcutKey);
			}
		}
		_syncActiveKeys(event) {
			const pressedKeys = this._getPressedKeys(event);
			for (const shortcutKey of this._element.querySelectorAll(SELECTOR_SHORTCUT_KEY)) shortcutKey.classList.toggle(CLASS_NAME_ACTIVE$2, pressedKeys.has(shortcutKey.dataset.bsSearchButtonKey));
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
		static searchButtonInterface(element, config) {
			const data = SearchButton.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (config.startsWith("_") || typeof data[config] !== "function") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				SearchButton.searchButtonInterface(this, config);
			});
		}
		static _initializeDataApi() {
			for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE$4)) SearchButton.getOrCreateInstance(button);
		}
		static _handleDataApiClick(event) {
			event.preventDefault();
			const button = event.target.closest(SELECTOR_DATA_TOGGLE$4);
			const data = SearchButton.getOrCreateInstance(button);
			if (data._consumeShortcutTrigger()) {
				data._triggerEvent("shortcut");
				return;
			}
			data._triggerEvent("click");
		}
		static _handleDataApiKeydown(event) {
			for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE$4)) {
				const data = SearchButton.getOrCreateInstance(button);
				data._syncActiveKeys(event);
				if (data._handleShortcut(event)) break;
			}
		}
		static _handleDataApiKeyup(event) {
			for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE$4)) SearchButton.getOrCreateInstance(button)._syncActiveKeys(event);
		}
		static _handleDataApiBlur() {
			for (const button of document.querySelectorAll(SELECTOR_DATA_TOGGLE$4)) SearchButton.getOrCreateInstance(button)._clearActiveKeys();
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, `DOMContentLoaded${EVENT_KEY$5}${DATA_API_KEY$2}`, () => {
		SearchButton._initializeDataApi();
	});
	EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$4, (event) => {
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
	/**
	* jQuery
	*/
	defineJQueryPlugin(SearchButton);
	//#endregion
	//#region js/src/util/backdrop.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/backdrop.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/backdrop.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$6 = "backdrop";
	const CLASS_NAME_FADE = "fade";
	const CLASS_NAME_SHOW$5 = "show";
	const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$6}`;
	const Default$5 = {
		className: "modal-backdrop",
		clickCallback: null,
		isAnimated: false,
		isVisible: true,
		rootElement: "body"
	};
	const DefaultType$5 = {
		className: "string",
		clickCallback: "(function|null)",
		isAnimated: "boolean",
		isVisible: "boolean",
		rootElement: "(element|string)"
	};
	/**
	* Class definition
	*/
	var Backdrop = class extends Config {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
			this._isAppended = false;
			this._element = null;
		}
		static get Default() {
			return Default$5;
		}
		static get DefaultType() {
			return DefaultType$5;
		}
		static get NAME() {
			return NAME$6;
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
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/scrollBar.js
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/scrollBar.js
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
	const SELECTOR_STICKY_CONTENT = ".sticky-top";
	const PROPERTY_PADDING = "padding-right";
	const PROPERTY_MARGIN = "margin-right";
	/**
	* Class definition
	*/
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
			if (isElement$1(selector)) {
				callBack(selector);
				return;
			}
			for (const sel of SelectorEngine.find(selector, this._element)) callBack(sel);
		}
	};
	//#endregion
	//#region js/src/sidebar.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI sidebar.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* ------------------------------------------------------------------------
	* Constants
	* ------------------------------------------------------------------------
	*/
	const NAME$5 = "sidebar";
	const EVENT_KEY$4 = `.bs.sidebar`;
	const DATA_API_KEY$1 = ".data-api";
	const Default$4 = {};
	const DefaultType$4 = {};
	const CLASS_NAME_BACKDROP = "sidebar-backdrop";
	const CLASS_NAME_HIDE = "hide";
	const CLASS_NAME_SHOW$4 = "show";
	const CLASS_NAME_SIDEBAR_NARROW = "sidebar-narrow";
	const CLASS_NAME_SIDEBAR_OVERLAID = "sidebar-overlaid";
	const CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE = "sidebar-narrow-unfoldable";
	const EVENT_HIDE$3 = `hide${EVENT_KEY$4}`;
	const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$4}`;
	const EVENT_RESIZE = `resize${EVENT_KEY$4}`;
	const EVENT_SHOW$3 = `show${EVENT_KEY$4}`;
	const EVENT_SHOWN$3 = `shown${EVENT_KEY$4}`;
	const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$1}`;
	const EVENT_LOAD_DATA_API$4 = `load${EVENT_KEY$4}${DATA_API_KEY$1}`;
	const SELECTOR_DATA_CLOSE = "[data-bs-close=\"sidebar\"]";
	const SELECTOR_DATA_TOGGLE$3 = "[data-bs-toggle]";
	const SELECTOR_SIDEBAR = ".sidebar";
	/**
	* ------------------------------------------------------------------------
	* Class Definition
	* ------------------------------------------------------------------------
	*/
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
			return Default$4;
		}
		static get DefaultType() {
			return DefaultType$4;
		}
		static get NAME() {
			return NAME$5;
		}
		async show() {
			EventHandler.trigger(this._element, EVENT_SHOW$3);
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
					EventHandler.trigger(this._element, EVENT_SHOWN$3);
				}
			};
			await this._queueCallback(complete, this._element, true);
		}
		async hide() {
			EventHandler.trigger(this._element, EVENT_HIDE$3);
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
					EventHandler.trigger(this._element, EVENT_HIDDEN$3);
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
			return Boolean(window.getComputedStyle(this._element, null).getPropertyValue("--bs-is-mobile"));
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
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$3, (event) => {
				event.preventDefault();
				const toggle = Manipulator.getDataAttribute(event.target.closest(SELECTOR_DATA_TOGGLE$3), "toggle");
				if (toggle === "narrow") this.toggleNarrow();
				if (toggle === "unfoldable") this.toggleUnfoldable();
			});
			EventHandler.on(this._element, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_CLOSE, (event) => {
				event.preventDefault();
				this.hide();
			});
			EventHandler.on(window, EVENT_RESIZE, this._resizeHandler);
		}
		static sidebarInterface(element, config) {
			const data = Sidebar.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config]();
			}
		}
		static jQueryInterface(config) {
			return this.each(function() {
				Sidebar.sidebarInterface(this, config);
			});
		}
	};
	/**
	* ------------------------------------------------------------------------
	* Data Api implementation
	* ------------------------------------------------------------------------
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$4, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_SIDEBAR))) Sidebar.sidebarInterface(element);
	});
	/**
	* ------------------------------------------------------------------------
	* jQuery
	* ------------------------------------------------------------------------
	*/
	defineJQueryPlugin(Sidebar);
	//#endregion
	//#region js/src/stepper.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO stepper.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$4 = "stepper";
	const EVENT_KEY$3 = `.bs.stepper`;
	const EVENT_FINISH = `finish${EVENT_KEY$3}`;
	const EVENT_RESET = `reset${EVENT_KEY$3}`;
	const EVENT_STEP_CHANGE = `stepChange${EVENT_KEY$3}`;
	const EVENT_STEP_VALIDATION_COMPLETE = `stepValidationComplete${EVENT_KEY$3}`;
	const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}`;
	const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$3}`;
	const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$3}`;
	const CLASS_NAME_ACTIVE$1 = "active";
	const CLASS_NAME_COMPLETE = "complete";
	const CLASS_NAME_SHOW$3 = "show";
	const CLASS_NAME_STEPPER_STEP_CONNECTOR = "stepper-step-connector";
	const CLASS_NAME_STEPPER_STEP_INDICATOR_ICON = "stepper-step-indicator-icon";
	const CLASS_NAME_STEPPER_STEP_INDICATOR_TEXT = "stepper-step-indicator-text";
	const SELECTOR_DATA_TOGGLE$2 = "[data-bs-toggle=\"stepper\"]";
	const SELECTOR_STEPPER = ".stepper";
	const SELECTOR_STEPPER_ACTION = "[data-bs-stepper-action]";
	const SELECTOR_STEPPER_STEP = ".stepper-step";
	const SELECTOR_STEPPER_STEP_BUTTON = ".stepper-step-button";
	const SELECTOR_STEPPER_STEP_CONTENT = ".stepper-step-content";
	const SELECTOR_STEPPER_STEP_INDICATOR = ".stepper-step-indicator";
	const SELECTOR_STEPPER_STEP_INDICATOR_ICON = ".stepper-step-indicator-icon";
	const SELECTOR_STEPPER_STEPS = ".stepper-steps";
	const SELECTOR_STEPPER_PANE = ".stepper-pane";
	const ARROW_LEFT_KEY$1 = "ArrowLeft";
	const ARROW_RIGHT_KEY$1 = "ArrowRight";
	const ARROW_UP_KEY$1 = "ArrowUp";
	const ARROW_DOWN_KEY$1 = "ArrowDown";
	const HOME_KEY$1 = "Home";
	const END_KEY$1 = "End";
	const Default$3 = {
		linear: true,
		skipValidation: false
	};
	const DefaultType$3 = {
		linear: "boolean",
		skipValidation: "boolean"
	};
	/**
	* Class definition
	*/
	var Stepper = class Stepper extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._stepButtons = this._getStepButtons();
			this._activeStepButton = this._getActiveElem();
			this._initialStepButton = this._activeStepButton;
			this._isFinished = false;
			this._addStepperConnector();
			this._resetPanes(this._getTargetPane(this._activeStepButton));
			this._wrapIndicatorText();
			this._setInitialComplete();
			this._updateStepButtonsDisabledState();
			this._setupAccessibilityAttributes();
			EventHandler.on(this._element, EVENT_KEYDOWN$1, (event) => this._keydown(event));
		}
		static get Default() {
			return Default$3;
		}
		static get DefaultType() {
			return DefaultType$3;
		}
		static get NAME() {
			return NAME$4;
		}
		showStep(buttonOrStepNumber) {
			let button = buttonOrStepNumber;
			if (typeof buttonOrStepNumber === "number") button = this._stepButtons[buttonOrStepNumber - 1];
			if (!button) return;
			const active = this._getActiveElem();
			if (active && !this._isCurrentStepValid(active)) return;
			if (this._elemIsActive(button)) return;
			if (this._config.linear) {
				const steps = this._getEnabledStepButtons();
				if (steps.indexOf(button) > steps.indexOf(active) + 1) return;
			}
			const index = this._stepButtons.indexOf(button) + 1;
			EventHandler.trigger(this._element, EVENT_STEP_CHANGE, { index });
			this._activeStepButton = button;
			this._deactivate(active);
			this._activate(button);
			this._updateStepButtonsDisabledState();
			this._complete(button);
		}
		next() {
			if (this._isFinished) return;
			if (!this._isCurrentStepValid(this._getActiveElem())) return;
			const steps = this._getEnabledStepButtons();
			const active = this._getActiveElem();
			const next = steps[steps.indexOf(active) + 1];
			if (next) this.showStep(next);
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
			if (!this._isCurrentStepValid(this._getActiveElem())) return;
			const steps = this._getEnabledStepButtons();
			const active = this._getActiveElem();
			const index = steps.indexOf(active);
			if (index !== steps.length - 1) {
				const next = steps[index + 1];
				if (next) this.showStep(next);
				return;
			}
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
			const steps = this._getEnabledStepButtons();
			if (!steps.length) return;
			for (const pane of SelectorEngine.find(SELECTOR_STEPPER_PANE, this._element)) {
				pane.classList.remove(CLASS_NAME_ACTIVE$1, CLASS_NAME_SHOW$3);
				pane.setAttribute("aria-hidden", "true");
			}
			for (const content of SelectorEngine.find(SELECTOR_STEPPER_STEP_CONTENT, this._element)) {
				content.classList.remove(CLASS_NAME_ACTIVE$1, CLASS_NAME_SHOW$3);
				content.setAttribute("aria-hidden", "true");
			}
			for (const btn of steps) {
				btn.classList.remove(CLASS_NAME_ACTIVE$1, CLASS_NAME_COMPLETE);
				this._removeIndicatorIcon(btn);
				btn.disabled = false;
			}
			for (const form of this._element.querySelectorAll(`${SELECTOR_STEPPER_PANE} form, ${SELECTOR_STEPPER_STEP_CONTENT} form`)) form.reset();
			const firstStep = this._initialStepButton || steps[0];
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
			EventHandler.trigger(this._element, EVENT_RESET);
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
		_isCurrentStepValid(element) {
			if (this._config.skipValidation) return true;
			const target = this._getTargetPane(element) ?? element.parentNode.querySelector(SELECTOR_STEPPER_STEP_CONTENT);
			if (!target) return true;
			const form = target.querySelector("form");
			if (!form) return true;
			const isValid = form.checkValidity();
			EventHandler.trigger(this._element, EVENT_STEP_VALIDATION_COMPLETE, {
				stepIndex: this._stepButtons.indexOf(element) + 1,
				isValid
			});
			if (!isValid) {
				if (form.noValidate) form.classList.add("was-validated");
				else form.reportValidity();
				return false;
			}
			return true;
		}
		_activate(element) {
			if (!element) return;
			element.classList.add(CLASS_NAME_ACTIVE$1);
			element.setAttribute("aria-selected", "true");
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
			element.setAttribute("aria-selected", "false");
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
			for (const [index, stepButton] of this._stepButtons.entries()) {
				const parentStepItem = stepButton.closest(SELECTOR_STEPPER_STEP);
				if (parentStepItem) parentStepItem.setAttribute("role", "presentation");
				stepButton.setAttribute("role", "tab");
				if (!stepButton.id) stepButton.id = `${uId}${index + 1}`;
				const pane = SelectorEngine.getElementFromSelector(stepButton);
				if (pane) {
					stepButton.setAttribute("aria-controls", pane.id);
					pane.setAttribute("role", "tabpanel");
					pane.setAttribute("aria-labelledby", stepButton.id);
					pane.setAttribute("aria-live", "polite");
					pane.setAttribute("aria-hidden", !this._elemIsActive(stepButton));
				}
				if (this._elemIsActive(stepButton)) {
					stepButton.setAttribute("aria-selected", "true");
					stepButton.setAttribute("tabIndex", "0");
				} else {
					stepButton.setAttribute("aria-selected", "false");
					stepButton.setAttribute("tabIndex", "-1");
				}
			}
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
			event.stopPropagation();
			event.preventDefault();
			const children = this._getEnabledStepButtons();
			let nextActiveElement;
			switch (event.key) {
				case HOME_KEY$1:
					nextActiveElement = children[0];
					break;
				case END_KEY$1:
					nextActiveElement = children[children.length - 1];
					break;
				case ARROW_RIGHT_KEY$1:
				case ARROW_DOWN_KEY$1:
					nextActiveElement = getNextActiveElement(children, event.target, true, true);
					break;
				case ARROW_LEFT_KEY$1:
				case ARROW_UP_KEY$1: nextActiveElement = getNextActiveElement(children, event.target, false, true);
			}
			nextActiveElement?.focus({ preventScroll: true });
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Stepper.getOrCreateInstance(this);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config]();
			});
		}
	};
	/**
	* Data API implementation
	*/
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
		for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE$2)) Stepper.getOrCreateInstance(element);
	});
	/**
	* jQuery integration
	*/
	defineJQueryPlugin(Stepper);
	//#endregion
	//#region js/src/tab.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI tab.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's tab.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$3 = "tab";
	const EVENT_KEY$2 = `.bs.tab`;
	const EVENT_HIDE$2 = `hide${EVENT_KEY$2}`;
	const EVENT_HIDDEN$2 = `hidden${EVENT_KEY$2}`;
	const EVENT_SHOW$2 = `show${EVENT_KEY$2}`;
	const EVENT_SHOWN$2 = `shown${EVENT_KEY$2}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY$2}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY$2}`;
	const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$2}`;
	const ARROW_LEFT_KEY = "ArrowLeft";
	const ARROW_RIGHT_KEY = "ArrowRight";
	const ARROW_UP_KEY = "ArrowUp";
	const ARROW_DOWN_KEY = "ArrowDown";
	const HOME_KEY = "Home";
	const END_KEY = "End";
	const CLASS_NAME_ACTIVE = "active";
	const CLASS_NAME_SHOW$2 = "show";
	const SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
	const SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
	const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
	const SELECTOR_TAB_PANEL = ".list-group, .nav, [role=\"tablist\"]";
	const SELECTOR_OUTER = ".nav-item, .list-group-item";
	const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
	const SELECTOR_DATA_TOGGLE$1 = "[data-bs-toggle=\"tab\"], [data-bs-toggle=\"pill\"], [data-bs-toggle=\"list\"]";
	const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE$1}`;
	const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;
	/**
	* Class definition
	*/
	var Tab = class Tab extends BaseComponent {
		constructor(element) {
			super(element);
			this._parent = this._element.closest(SELECTOR_TAB_PANEL);
			if (!this._parent) throw new TypeError(`${this._element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`);
			this._setInitialAttributes(this._parent, this._getChildren());
			EventHandler.on(this._element, EVENT_KEYDOWN, (event) => this._keydown(event));
		}
		static get NAME() {
			return NAME$3;
		}
		async show() {
			const innerElem = this._element;
			if (this._elemIsActive(innerElem)) return;
			const active = this._getActiveElem();
			const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$2, { relatedTarget: innerElem }) : null;
			if (EventHandler.trigger(innerElem, EVENT_SHOW$2, { relatedTarget: active }).defaultPrevented || hideEvent && hideEvent.defaultPrevented) return;
			this._deactivate(active, innerElem);
			await this._activate(innerElem, active);
		}
		async _activate(element, relatedElem) {
			if (!element) return;
			element.classList.add(CLASS_NAME_ACTIVE);
			if (element.getAttribute("role") !== "tab") {
				element.classList.add(CLASS_NAME_SHOW$2);
				return;
			}
			const pane = SelectorEngine.getElementFromSelector(element);
			this._activate(pane);
			const complete = () => {
				element.removeAttribute("tabindex");
				setAriaAttribute(element, "aria-selected", true);
				this._toggleDropDown(element, true);
				EventHandler.trigger(element, EVENT_SHOWN$2, { relatedTarget: relatedElem });
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
				EventHandler.trigger(element, EVENT_HIDDEN$2, { relatedTarget: relatedElem });
			};
			await this._queueCallback(complete, element, false);
		}
		_keydown(event) {
			if (![
				ARROW_LEFT_KEY,
				ARROW_RIGHT_KEY,
				ARROW_UP_KEY,
				ARROW_DOWN_KEY,
				HOME_KEY,
				END_KEY
			].includes(event.key)) return;
			if (event.altKey || event.ctrlKey || event.metaKey) return;
			event.stopPropagation();
			event.preventDefault();
			const children = this._getChildren().filter((element) => !isDisabled(element));
			let nextActiveElement;
			if ([HOME_KEY, END_KEY].includes(event.key)) nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
			else {
				const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
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
			return this.each(function() {
				const data = Tab.getOrCreateInstance(this);
				if (typeof config !== "string") return;
				if (data[config] === void 0 || config.startsWith("_") || config === "constructor") throw new TypeError(`No method named "${config}"`);
				data[config]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE$1, function(event) {
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if (isDisabled(this)) return;
		Tab.getOrCreateInstance(this).show();
	});
	/**
	* Initialize on focus
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) Tab.getOrCreateInstance(element);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(Tab);
	//#endregion
	//#region js/src/time-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO time-input.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME$2 = "time-input";
	const EVENT_LOAD_DATA_API$1 = `load.bs.time-input.data-api`;
	const SELECTOR_DATA_TIME_INPUT = "[data-bs-time-input]";
	const Default$2 = {
		...SectionInput.Default,
		ariaLabel: "Time input",
		seconds: false
	};
	const DefaultType$2 = {
		...SectionInput.DefaultType,
		seconds: "boolean"
	};
	/**
	* Class definition
	*/
	var TimeInput = class TimeInput extends SectionInput {
		static get Default() {
			return Default$2;
		}
		static get DefaultType() {
			return DefaultType$2;
		}
		static get NAME() {
			return NAME$2;
		}
		static get CHANGE_EVENT_NAME() {
			return "timeChange";
		}
		_convertDate(value) {
			if (typeof value === "string") {
				const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(am|pm))?$/i.exec(value.trim());
				if (match) {
					const [, hour, minute, second, meridiem] = match;
					const hours = meridiem ? convert12hTo24h(meridiem.toLowerCase(), Number.parseInt(hour, 10)) : Number.parseInt(hour, 10);
					return new Date(1970, 0, 1, hours, Number.parseInt(minute, 10), second ? Number.parseInt(second, 10) : 0);
				}
			}
			return convertToDateObject(value, "day", this._config.locale, true);
		}
		_getDefaultSections(locale) {
			return getTimeSectionsFromLocale(locale, this._config.seconds);
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = TimeInput.getOrCreateInstance(this);
				if (typeof config === "string") {
					if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
					data[config]();
				}
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
		for (const timeInput of SelectorEngine.find(SELECTOR_DATA_TIME_INPUT)) TimeInput.componentInterface(timeInput);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(TimeInput);
	//#endregion
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
	const NAME$1 = "time-picker";
	const EVENT_KEY$1 = `.bs.time-picker`;
	const DATA_API_KEY = ".data-api";
	const EVENT_CLICK = `click${EVENT_KEY$1}`;
	const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
	const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}${DATA_API_KEY}`;
	const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
	const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
	const EVENT_TIME_CHANGE = `timeChange${EVENT_KEY$1}`;
	const CLASS_NAME_BODY = "time-picker-body";
	const CLASS_NAME_DROPDOWN = "time-picker-popup";
	const CLASS_NAME_FOOTER = "time-picker-footer";
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_INDICATOR = "form-control-action";
	const CLASS_NAME_FORM_CONTROL = "form-control";
	const CLASS_NAME_INPUT_GROUP = "form-control-group";
	const CLASS_NAME_PICKER = "picker";
	const CLASS_NAME_POPUP = "popup";
	const CLASS_NAME_SHOW$1 = "show";
	const CLASS_NAME_TIME_PICKER = "time-picker";
	const SELECTOR_ACTION = "[data-bs-picker-action]";
	const SELECTOR_ACTION_NOW = "[data-bs-picker-action=\"now\"]";
	const SELECTOR_DATA_TOGGLE = "[data-bs-toggle=\"time-picker\"]";
	const SELECTOR_TEMPLATE_FOOTER = "template[data-bs-template=\"footer\"]";
	const Default$1 = {
		allowList: SVGAllowlist,
		ariaCleanerLabel: "Clear the value",
		ariaToggleLabel: "Toggle the time selection",
		cleaner: true,
		cleanerIcon: CLEANER_ICON,
		container: false,
		disabled: false,
		floatingLabel: null,
		indicatorIcon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path d=\"M256 16C123.452 16 16 123.452 16 256s107.452 240 240 240 240-107.452 240-240S388.548 16 256 16Zm0 448c-114.875 0-208-93.125-208-208S141.125 48 256 48s208 93.125 208 208-93.125 208-208 208Z\"/><path d=\"M272 128h-32v139.314l84.686 84.687 22.628-22.628L272 254.059V128Z\"/></svg>",
		inputOptions: {},
		locale: navigator.language,
		name: null,
		sanitize: true,
		sanitizeFn: null,
		selectionOptions: {},
		size: null,
		time: null,
		variant: "roll"
	};
	const DefaultType$1 = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaToggleLabel: "string",
		cleaner: "boolean",
		cleanerIcon: "string",
		container: "(string|element|boolean)",
		disabled: "boolean",
		floatingLabel: "(string|null)",
		indicatorIcon: "string",
		inputOptions: "object",
		locale: "string",
		name: "(string|null)",
		sanitize: "boolean",
		sanitizeFn: "(function|null)",
		selectionOptions: "object",
		size: "(string|null)",
		time: "(date|string|null)",
		variant: "string"
	};
	/**
	* Class definition
	*/
	var TimePicker = class extends BaseComponent {
		constructor(element, config) {
			super(element, config);
			this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element);
			this._initialTime = config?.time ?? this._config.time;
			this._cleanerElement = null;
			this._input = null;
			this._selection = null;
			this._syncingFromPanel = false;
			this._selectionElement = null;
			this._menu = null;
			this._popup = null;
			this._createTimePicker();
			this._createPopup();
			this._addEventListeners();
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
		show() {
			if (this._config.disabled) return;
			this._popup.show();
		}
		hide() {
			this._popup.hide();
		}
		toggle() {
			return this._popup.isShown ? this.hide() : this.show();
		}
		getTime() {
			return this._input.getDate();
		}
		setTime(time) {
			this._input.update({ date: time });
			EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time });
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
				clear: () => this.clear(),
				close: () => this.hide(),
				disabled: this._config.disabled,
				isTimeSelectable: (time) => this._input.isDateSelectable(time),
				now: () => this.now(),
				reset: () => this.reset(),
				setTime: (time) => this.setTime(time),
				time: this.getTime()
			};
		}
		dispose() {
			if (this._addedGroupClass) this._element.classList.remove(CLASS_NAME_INPUT_GROUP);
			this._popup.dispose();
			this._input.dispose();
			this._selection?.dispose();
			super.dispose();
		}
		_forwardConfig(Component, overrides = {}, extra = {}) {
			const forwarded = {};
			for (const key of Object.keys(Component.Default)) if (key in this._config && this._config[key] !== Default$1[key]) forwarded[key] = this._config[key];
			return {
				...forwarded,
				...overrides,
				...extra
			};
		}
		_sanitizeIcon(icon) {
			return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon;
		}
		_createTimePicker() {
			this._element.classList.add(CLASS_NAME_TIME_PICKER, CLASS_NAME_PICKER);
			const inputGroup = this._element;
			this._addedGroupClass = !inputGroup.classList.contains(CLASS_NAME_INPUT_GROUP);
			inputGroup.classList.add(CLASS_NAME_INPUT_GROUP);
			if (this._config.size) inputGroup.classList.add(`${CLASS_NAME_FORM_CONTROL}-${this._config.size}`);
			const inputEl = document.createElement("div");
			appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`);
			const action = (className, icon, label) => createControlGroupAction({
				className,
				disabled: this._config.disabled,
				icon,
				label,
				sanitizeIcon: (value) => this._sanitizeIcon(value)
			});
			if (this._config.cleaner) {
				this._cleanerElement = action(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel);
				inputGroup.append(this._cleanerElement);
			}
			const indicator = action(CLASS_NAME_INDICATOR, this._config.indicatorIcon, this._config.ariaToggleLabel);
			inputGroup.append(indicator);
			this._indicatorElement = indicator;
			this._input = new TimeInput(inputEl, this._forwardConfig(TimeInput, {
				date: this._config.time,
				disabled: this._config.disabled,
				locale: this._config.locale,
				name: this._config.name
			}, {
				...this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {},
				...this._config.inputOptions
			}));
			EventHandler.on(inputEl, TimeInput.eventName(TimeInput.CHANGE_EVENT_NAME), (event) => {
				if (!this._syncingFromPanel) {
					this._selection?.update({ time: event.date });
					EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time: event.date });
				}
			});
			this._menu = document.createElement("div");
			this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN);
			this._selectionElement = document.createElement("div");
			this._selectionElement.classList.add(CLASS_NAME_BODY);
			this._menu.append(this._selectionElement);
			if (this._footerTemplate) {
				const footer = document.createElement("div");
				footer.classList.add(CLASS_NAME_FOOTER);
				footer.append(this._footerTemplate.content.cloneNode(true));
				this._disableUnselectableActions(footer);
				this._menu.append(footer);
			}
		}
		_disableUnselectableActions(container) {
			if (this._input.isDateSelectable(/* @__PURE__ */ new Date())) return;
			for (const button of SelectorEngine.find(SELECTOR_ACTION_NOW, container)) if ("disabled" in button) button.disabled = true;
		}
		_ensureSelection() {
			if (this._selection) return;
			this._selection = new TimeSelection(this._selectionElement, this._forwardConfig(TimeSelection, {
				locale: this._config.locale,
				onChange: (time) => {
					this._syncingFromPanel = true;
					this._input.update({ date: time });
					this._syncingFromPanel = false;
					EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time });
				},
				time: this.getTime(),
				variant: this._config.variant
			}, this._config.selectionOptions));
		}
		_createPopup() {
			this._popup = new Popup({
				anchor: this._element,
				container: this._config.container,
				content: this._menu,
				onHidden: () => EventHandler.trigger(this._element, EVENT_HIDDEN$1),
				onHide: () => {
					this._menu.classList.remove(CLASS_NAME_SHOW$1);
					this._element.classList.remove(CLASS_NAME_SHOW$1);
					this._element.setAttribute("aria-expanded", "false");
					EventHandler.trigger(this._element, EVENT_HIDE$1);
				},
				onShow: () => {
					this._menu.classList.add(CLASS_NAME_SHOW$1);
					this._element.classList.add(CLASS_NAME_SHOW$1);
					this._ensureSelection();
					this._element.setAttribute("aria-expanded", "true");
					EventHandler.trigger(this._element, EVENT_SHOW$1);
				},
				onShown: () => EventHandler.trigger(this._element, EVENT_SHOWN$1)
			});
		}
		_addEventListeners() {
			if (this._cleanerElement) EventHandler.on(this._cleanerElement, EVENT_CLICK, (event) => {
				event.stopPropagation();
				this.clear();
			});
			EventHandler.on(this._indicatorElement, EVENT_CLICK, () => {
				if (!this._config.disabled) this.toggle();
			});
			EventHandler.on(this._menu, EVENT_CLICK, SELECTOR_ACTION, (event) => {
				const action = event.target.closest(SELECTOR_ACTION).dataset.bsPickerAction;
				const context = this.getContext();
				if (typeof context[action] === "function") context[action]();
			});
		}
	};
	/**
	* Data API implementation
	*/
	EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) TimePicker.getOrCreateInstance(element);
	});
	/**
	* jQuery
	*/
	defineJQueryPlugin(TimePicker);
	//#endregion
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
	const EVENT_KEY = `.bs.toast`;
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
	var Toast = class Toast extends BaseComponent {
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
			if (EventHandler.trigger(this._element, EVENT_SHOW).defaultPrevented) return;
			this._clearTimeout();
			const complete = () => {
				EventHandler.trigger(this._element, EVENT_SHOWN);
				this._maybeScheduleHide();
			};
			this._element.classList.add(CLASS_NAME_SHOW);
			await this._queueCallback(complete, this._element, this._isAnimated());
		}
		async hide() {
			if (!this.isShown()) return;
			if (EventHandler.trigger(this._element, EVENT_HIDE).defaultPrevented) return;
			const complete = () => {
				EventHandler.trigger(this._element, EVENT_HIDDEN);
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
			EventHandler.on(this._element, EVENT_MOUSEOVER, (event) => this._onInteraction(event, true));
			EventHandler.on(this._element, EVENT_MOUSEOUT, (event) => this._onInteraction(event, false));
			EventHandler.on(this._element, EVENT_FOCUSIN, (event) => this._onInteraction(event, true));
			EventHandler.on(this._element, EVENT_FOCUSOUT, (event) => this._onInteraction(event, false));
		}
		_clearTimeout() {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		static jQueryInterface(config) {
			return this.each(function() {
				const data = Toast.getOrCreateInstance(this, config);
				if (typeof config === "string") {
					if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
					data[config](this);
				}
			});
		}
	};
	/**
	* Data API implementation
	*/
	enableDismissTrigger(Toast);
	/**
	* jQuery
	*/
	defineJQueryPlugin(Toast);
	//#endregion
	return {
		Accordion,
		Alert,
		Autocomplete,
		Button,
		Calendar,
		Carousel,
		Chip,
		ChipInput,
		ChipSet,
		Collapse,
		DateInput,
		DatePicker,
		DateRangePicker,
		DateTimePicker,
		DateTimeInput,
		Dialog,
		Drawer,
		Dropdown,
		LoadingButton,
		Menu,
		Modal,
		MultiSelect,
		Navigation,
		OffCanvas: Offcanvas,
		OTPInput,
		NumberInput,
		PasswordInput,
		PasswordStrength,
		Popover,
		RangeSlider,
		Rating,
		ScrollSpy,
		SearchButton,
		Sidebar,
		Stepper,
		Tab,
		TimeInput,
		TimePicker,
		Toast,
		Tooltip
	};
});

//# sourceMappingURL=bootstrap.bundle.js.map