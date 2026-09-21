/*!
* CoreUI PRO date-range-picker.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.DateRangePicker = {}));
})(this, function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region js/src/util/date-range-picker.ts
	/**
	* Generates input IDs or names based on the provided attributes, range, and position.
	*
	* @param attribute - A single string or a tuple of two strings representing the attribute names.
	* @param range - A boolean indicating whether the input is part of a range.
	* @param position - Optional. Specifies the position ('start' or 'end') when `range` is true.
	* @returns A string representing the input ID or name.
	*/
	const getInputIdOrName = (attribute, range, position) => {
		if (range && !Array.isArray(attribute)) return `${attribute}-${position}-date`;
		if (Array.isArray(attribute)) return position === "start" ? attribute[0] : attribute[1];
		return attribute;
	};
	//#endregion
	exports.getInputIdOrName = getInputIdOrName;
});

//# sourceMappingURL=date-range-picker.js.map