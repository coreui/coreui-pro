/*!
  * CoreUI PRO host.js v5.28.0 (https://coreui.io)
  * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
  * License (https://coreui.io/pro/license/)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../dom/event-handler.js')) :
  typeof define === 'function' && define.amd ? define(['exports', '../dom/event-handler'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Host = {}, global.EventHandler));
})(this, (function (exports, EventHandler) { 'use strict';

  const addHostClassNames = (element, classNames) => {
    const added = classNames.filter(className => className && !element.classList.contains(className));
    element.classList.add(...added);
    return added;
  };
  const restoreHost = (element, {
    classNames,
    eventKey,
    nodes
  }) => {
    for (const node of nodes) {
      if (node) {
        EventHandler.off(node, eventKey);
        node.remove();
      }
    }
    element.classList.remove(...classNames);
  };

  exports.addHostClassNames = addHostClassNames;
  exports.restoreHost = restoreHost;

  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

}));
//# sourceMappingURL=host.js.map
