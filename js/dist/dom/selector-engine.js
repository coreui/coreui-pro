/*!
* CoreUI PRO selector-engine.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("../util/index.js")) : typeof define === "function" && define.amd ? define(["../util/index.js"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.SelectorEngine = factory(global.Index));
})(this, function(js_src_util_index_js) {
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
		let selector = element.getAttribute("data-coreui-target");
		if (!selector || selector === "#") {
			let hrefAttribute = element.getAttribute("href");
			if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) return null;
			if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
			selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
		}
		return selector ? selector.split(",").map((sel) => (0, js_src_util_index_js.parseSelector)(sel)).join(",") : null;
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
			return this.find(focusables, element).filter((el) => !(0, js_src_util_index_js.isDisabled)(el) && (0, js_src_util_index_js.isVisible)(el));
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
	return SelectorEngine;
});

//# sourceMappingURL=selector-engine.js.map