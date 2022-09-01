/*!
  * CoreUI time.js v4.3.4 (https://coreui.io)
  * Copyright 2022 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://coreui.io)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Time = {}));
})(this, (function (exports) { 'use strict';

  const convert12hTo24h = (abbr, hour) => {
    if (abbr === 'am' && hour === 12) {
      return 0;
    }

    if (abbr === 'am') {
      return hour;
    }

    if (abbr === 'pm' && hour === 12) {
      return 12;
    }

    return hour + 12;
  };
  const convert24hTo12h = hour => hour % 12 || 12;
  const convertTimeToDate = time => time ? time instanceof Date ? new Date(time) : new Date(`1970-01-01 ${time}`) : null;
  const getAmPm = (date, locale) => {
    if (date.toLocaleTimeString(locale).includes('AM')) {
      return 'am';
    }

    if (date.toLocaleTimeString(locale).includes('PM')) {
      return 'pm';
    }

    return date.getHours() >= 12 ? 'pm' : 'am';
  };
  const getListOfHours = locale => Array.from({
    length: isAmPm(locale) ? 12 : 24
  }, (_, i) => {
    return {
      value: isAmPm(locale) ? i + 1 : i,
      label: (isAmPm(locale) ? i + 1 : i).toLocaleString(locale)
    };
  });
  const getListOfMinutes = (locale, valueAsString = false) => Array.from({
    length: 60
  }, (_, i) => {
    const d = new Date();
    d.setMinutes(i);
    return {
      value: valueAsString ? i.toString() : i,
      label: d.toLocaleTimeString(locale, {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit'
      }).split(':')[1]
    };
  });
  const getListOfSeconds = (locale, valueAsString = false) => Array.from({
    length: 60
  }, (_, i) => {
    const d = new Date();
    d.setSeconds(i);
    return {
      value: valueAsString ? i.toString() : i,
      label: d.toLocaleTimeString(locale, {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit'
      }).split(':')[2]
    };
  });
  const getSelectedHour = (date, locale) => date ? isAmPm(locale) ? convert24hTo12h(date.getHours()) : date.getHours() : '';
  const getSelectedMinutes = date => date ? date.getMinutes() : '';
  const getSelectedSeconds = date => date ? date.getSeconds() : '';
  const isAmPm = locale => ['am', 'AM', 'pm', 'PM'].some(el => new Date().toLocaleString(locale).includes(el));
  const isValidTime = time => {
    const d = new Date(`1970-01-01 ${time}`);
    return d instanceof Date && d.getTime();
  };

  exports.convert12hTo24h = convert12hTo24h;
  exports.convert24hTo12h = convert24hTo12h;
  exports.convertTimeToDate = convertTimeToDate;
  exports.getAmPm = getAmPm;
  exports.getListOfHours = getListOfHours;
  exports.getListOfMinutes = getListOfMinutes;
  exports.getListOfSeconds = getListOfSeconds;
  exports.getSelectedHour = getSelectedHour;
  exports.getSelectedMinutes = getSelectedMinutes;
  exports.getSelectedSeconds = getSelectedSeconds;
  exports.isAmPm = isAmPm;
  exports.isValidTime = isValidTime;

  Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });

}));
//# sourceMappingURL=time.js.map
