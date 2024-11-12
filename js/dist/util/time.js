/*!
  * CoreUI time.js v5.7.0 (https://coreui.io)
  * Copyright 2024 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Time = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Converts a 12-hour time format to a 24-hour time format.
   * @param {('am' | 'pm')} abbr The abbreviation indicating AM or PM.
   * @param {number} hour The hour to be converted.
   * @returns {number} The hour in 24-hour format.
   */
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

  /**
   * Converts a 24-hour time format to a 12-hour format.
   * @param {number} hour The hour to be converted.
   * @returns {number} The hour in 12-hour format.
   */
  const convert24hTo12h = hour => hour % 12 || 12;

  /**
   * Converts a time input into a Date object.
   * @param {Date | string | null | undefined} time The time input to be converted.
   * @returns {Date | null} The converted Date object or null if the input is falsy.
   */
  const convertTimeToDate = time => time ? time instanceof Date ? time : new Date(`1970-01-01 ${time}`) : null;

  /**
   * Retrieves the AM/PM part of the specified date according to the given locale.
   * @param {Date} date The date from which to extract the AM/PM part.
   * @param {string} locale The locale to use for formatting.
   * @returns {string} 'am' or 'pm' based on the given date and locale.
   */
  const getAmPm = (date, locale) => {
    if (date.toLocaleTimeString(locale).includes('AM')) {
      return 'am';
    }
    if (date.toLocaleTimeString(locale).includes('PM')) {
      return 'pm';
    }
    return date.getHours() >= 12 ? 'pm' : 'am';
  };

  /**
   * Formats an array of time values (hours, minutes, or seconds) according to the specified locale and partial.
   * @param {number[]} values An array of time values to format.
   * @param {string} locale The locale to use for formatting.
   * @param {('hour' | 'minute' | 'second')} partial The type of time value to format.
   * @returns {Array} An array of objects with the original value and its localized label.
   */
  const formatTimePartials = (values, locale, partial) => {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
    return values.map(value => {
      var _formatter$formatToPa;
      if (partial === 'hour') {
        date.setHours(value);
      }
      if (partial === 'minute') {
        date.setMinutes(value);
      }
      if (partial === 'second') {
        date.setSeconds(value);
      }
      return {
        value,
        label: ((_formatter$formatToPa = formatter.formatToParts(date).find(part => part.type === partial)) == null ? void 0 : _formatter$formatToPa.value) || ''
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
  const getLocalizedTimePartials = (locale, ampm = 'auto', hours = [], minutes = [], seconds = []) => {
    const hour12 = ampm === 'auto' && isAmPm(locale) || ampm === true;
    const listOfHours = Array.isArray(hours) && hours.length > 0 ? hours : typeof hours === 'function' ? Array.from({
      length: hour12 ? 12 : 24
    }, (_, i) => hour12 ? i + 1 : i).filter(hour => hours(hour)) : Array.from({
      length: hour12 ? 12 : 24
    }, (_, i) => hour12 ? i + 1 : i);
    const listOfMinutes = Array.isArray(minutes) && minutes.length > 0 ? minutes : typeof minutes === 'function' ? Array.from({
      length: 60
    }, (_, i) => i).filter(minute => minutes(minute)) : Array.from({
      length: 60
    }, (_, i) => i);
    const listOfSeconds = Array.isArray(seconds) && seconds.length > 0 ? seconds : typeof seconds === 'function' ? Array.from({
      length: 60
    }, (_, i) => i).filter(second => seconds(second)) : Array.from({
      length: 60
    }, (_, i) => i);
    return {
      listOfHours: formatTimePartials(listOfHours, locale, 'hour'),
      listOfMinutes: formatTimePartials(listOfMinutes, locale, 'minute'),
      listOfSeconds: formatTimePartials(listOfSeconds, locale, 'second'),
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
  const getSelectedHour = (date, locale, ampm = 'auto') => date ? ampm === 'auto' && isAmPm(locale) || ampm === true ? convert24hTo12h(date.getHours()) : date.getHours() : '';

  /**
   * Gets the selected minutes from a date object.
   * @param {Date | null} date The date object from which to extract the minutes. If null, the function returns an empty string.
   * @returns {string | number} The minutes from the date or an empty string if the date is null.
   */
  const getSelectedMinutes = date => date ? date.getMinutes() : '';

  /**
   * Gets the selected seconds from a date object.
   * @param {Date | null} date The date object from which to extract the seconds. If null, the function returns an empty string.
   * @returns {string | number} The seconds from the date or an empty string if the date is null.
   */
  const getSelectedSeconds = date => date ? date.getSeconds() : '';

  /**
   * Determines if the given locale uses AM/PM format.
   * @param {string} locale The locale to check.
   * @returns {boolean} True if the locale uses AM/PM format, otherwise false.
   */
  const isAmPm = locale => ['am', 'AM', 'pm', 'PM'].some(el => new Date().toLocaleString(locale).includes(el));

  /**
   * Validates if the given string represents a valid time.
   * @param {string} time The time string to validate.
   * @returns {boolean} True if the string is a valid time, otherwise false.
   */
  const isValidTime = time => {
    const d = new Date(`1970-01-01 ${time}`);
    return d instanceof Date && d.getTime();
  };

  exports.convert12hTo24h = convert12hTo24h;
  exports.convert24hTo12h = convert24hTo12h;
  exports.convertTimeToDate = convertTimeToDate;
  exports.formatTimePartials = formatTimePartials;
  exports.getAmPm = getAmPm;
  exports.getLocalizedTimePartials = getLocalizedTimePartials;
  exports.getSelectedHour = getSelectedHour;
  exports.getSelectedMinutes = getSelectedMinutes;
  exports.getSelectedSeconds = getSelectedSeconds;
  exports.isAmPm = isAmPm;
  exports.isValidTime = isValidTime;

  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

}));
//# sourceMappingURL=time.js.map
