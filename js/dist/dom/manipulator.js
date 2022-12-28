/*!
<<<<<<< HEAD
  * CoreUI manipulator.js v4.4.2 (https://coreui.io)
=======
  * CoreUI manipulator.js v4.2.5 (https://coreui.io)
>>>>>>> bf05e3beac6e087e153ec3355ba0f3fae72a2023
  * Copyright 2022 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://coreui.io)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Manipulator = factory());
})(this, (function () { 'use strict';

  /**
   * --------------------------------------------------------------------------
<<<<<<< HEAD
   * CoreUI (v4.4.2): dom/manipulator.js
=======
   * CoreUI (v4.2.5): dom/selector-engine.js
>>>>>>> bf05e3beac6e087e153ec3355ba0f3fae72a2023
   * Licensed under MIT (https://coreui.io/license)
   *
   * This is a modified version of the Bootstrap's dom/manipulator.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  function normalizeData(value) {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    if (value === Number(value).toString()) {
      return Number(value);
    }
    if (value === '' || value === 'null') {
      return null;
    }
    if (typeof value !== 'string') {
      return value;
    }
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (_unused) {
      return value;
    }
  }
  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
  }
  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-coreui-${normalizeDataKey(key)}`, value);
    },
    removeDataAttribute(element, key) {
      element.removeAttribute(`data-coreui-${normalizeDataKey(key)}`);
    },
    getDataAttributes(element) {
      if (!element) {
        return {};
      }
      const attributes = {};
      const coreuiKeys = Object.keys(element.dataset).filter(key => key.startsWith('coreui') && !key.startsWith('coreuiConfig'));
      for (const key of coreuiKeys) {
        let pureKey = key.replace(/^coreui/, '');
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      }
      return attributes;
    },
    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-coreui-${normalizeDataKey(key)}`));
    }
  };

  return Manipulator;

}));
//# sourceMappingURL=manipulator.js.map
