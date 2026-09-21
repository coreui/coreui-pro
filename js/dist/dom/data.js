/*!
* CoreUI PRO data.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define([], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Data = factory());
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
	//#endregion
	return {
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
});

//# sourceMappingURL=data.js.map