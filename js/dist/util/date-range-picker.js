/*!
  * CoreUI date-range-picker.js v5.21.0 (https://coreui.io)
  * Copyright 2025 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.DateRangePicker = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Generates input IDs or names based on the provided attributes, range, and position.
   *
   * @param attribute - A single string or a tuple of two strings representing the attribute names.
   * @param range - A boolean indicating whether the input is part of a range.
   * @param position - Optional. Specifies the position ('start' or 'end') when `range` is true.
   * @returns A string representing the input ID or name.
   */
  const getInputIdOrName = (attribute, range, position) => {
    if (range && !Array.isArray(attribute)) {
      return `${attribute}-${position}-date`;
    }
    if (Array.isArray(attribute)) {
      return position === "start" ? attribute[0] : attribute[1];
    }
    return attribute;
  };

  exports.getInputIdOrName = getInputIdOrName;

  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

}));
//# sourceMappingURL=date-range-picker.js.map
