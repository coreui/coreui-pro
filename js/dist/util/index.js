/*!
* CoreUI PRO index.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Index = {}));
})(this, function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
	exports.defineJQueryPlugin = defineJQueryPlugin;
	exports.execute = execute;
	exports.executeAfterTransition = executeAfterTransition;
	exports.findShadowRoot = findShadowRoot;
	exports.getCoveredTransitions = getCoveredTransitions;
	exports.getElement = getElement;
	exports.getNextActiveElement = getNextActiveElement;
	exports.getTransitionDurationFromElement = getTransitionDurationFromElement;
	exports.getUID = getUID;
	exports.getjQuery = getjQuery;
	exports.isDisabled = isDisabled;
	exports.isElement = isElement;
	exports.isRTL = isRTL;
	exports.isVisible = isVisible;
	exports.jQueryDispatch = jQueryDispatch;
	exports.noop = noop;
	exports.onDOMContentLoaded = onDOMContentLoaded;
	exports.parseSelector = parseSelector;
	exports.reflow = reflow;
	exports.setAriaAttribute = setAriaAttribute;
	exports.toType = toType;
	exports.triggerTransitionEnd = triggerTransitionEnd;
	exports.writeAttribute = writeAttribute;
});

//# sourceMappingURL=index.js.map