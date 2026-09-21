/*!
* CoreUI PRO event-handler.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("../util/index.js")) : typeof define === "function" && define.amd ? define(["../util/index.js"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.EventHandler = factory(global.Index));
})(this, function(js_src_util_index_js) {
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
		const $ = (0, js_src_util_index_js.getjQuery)();
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
	return EventHandler;
});

//# sourceMappingURL=event-handler.js.map