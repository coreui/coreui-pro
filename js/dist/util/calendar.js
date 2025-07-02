/*!
  * CoreUI calendar.js v5.15.0 (https://coreui.io)
  * Copyright 2025 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Calendar = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Converts an ISO week string to a Date object representing the Monday of that week.
   * @param isoWeek - The ISO week string (e.g., "2023W05" or "2023w05").
   * @returns The Date object for the Monday of the specified week, or null if invalid.
   */
  const convertIsoWeekToDate = isoWeek => {
    const [year, week] = isoWeek.split(/[Ww]/);
    const date = new Date(Number(year), 0, 4); // 4th Jan is always in week 1
    date.setDate(date.getDate() - (date.getDay() || 7) + 1 + (Number(week) - 1) * 7);
    return date;
  };

  /**
   * Converts a date string or Date object to a Date object based on selection type.
   * @param date - The date to convert.
   * @param selectionType - The type of selection ('day', 'week', 'month', 'year').
   * @returns The corresponding Date object or null if invalid.
   */
  const convertToDateObject = (date, selectionType) => {
    if (date === null) {
      return null;
    }
    if (date instanceof Date) {
      return date;
    }
    if (selectionType === 'week') {
      return convertIsoWeekToDate(date);
    }
    if (selectionType === 'month' || selectionType === 'year') {
      const _date = new Date(Date.parse(date));
      const userTimezoneOffset = _date.getTimezoneOffset() * 60000;
      return new Date(_date.getTime() + userTimezoneOffset);
    }
    return new Date(Date.parse(date));
  };

  /**
   * Creates groups from an array.
   * @param arr - The array to group.
   * @param numberOfGroups - Number of groups to create.
   * @returns An array of grouped arrays.
   */
  const createGroupsInArray = (arr, numberOfGroups) => {
    const perGroup = Math.ceil(arr.length / numberOfGroups);
    return Array.from({
      length: numberOfGroups
    }).fill('').map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup));
  };

  /**
   * Adjusts the calendar date based on order and view type.
   * @param calendarDate - The current calendar date.
   * @param order - The order to adjust by.
   * @param view - The current view type.
   * @returns The adjusted Date object.
   */
  const getCalendarDate = (calendarDate, order, view) => {
    if (order !== 0 && view === 'days') {
      return new Date(calendarDate.getFullYear(), calendarDate.getMonth() + order, 1);
    }
    if (order !== 0 && view === 'months') {
      return new Date(calendarDate.getFullYear() + order, calendarDate.getMonth(), 1);
    }
    if (order !== 0 && view === 'years') {
      return new Date(calendarDate.getFullYear() + 12 * order, calendarDate.getMonth(), 1);
    }
    return calendarDate;
  };

  /**
   * Formats a date based on the selection type.
   * @param date - The date to format.
   * @param selectionType - The type of selection ('day', 'week', 'month', 'year').
   * @returns A formatted date string or the original Date object.
   */
  const getDateBySelectionType = (date, selectionType) => {
    if (date === null) {
      return null;
    }
    if (selectionType === 'week') {
      return `${date.getFullYear()}W${getWeekNumber(date)}`;
    }
    if (selectionType === 'month') {
      const monthNumber = `0${date.getMonth() + 1}`.slice(-2);
      return `${date.getFullYear()}-${monthNumber}`;
    }
    if (selectionType === 'year') {
      return `${date.getFullYear()}`;
    }
    return date;
  };

  /**
   * Retrieves the first available date within a range that is not disabled.
   * @param startDate - Start date of the range.
   * @param endDate - End date of the range.
   * @param min - Minimum allowed date.
   * @param max - Maximum allowed date.
   * @param disabledDates - Criteria for disabled dates.
   * @returns The first available Date object or null if none found.
   */
  const getFirstAvailableDateInRange = (startDate, endDate, min, max, disabledDates) => {
    const _min = min ? new Date(Math.max(startDate.getTime(), min.getTime())) : startDate;
    const _max = max ? new Date(Math.min(endDate.getTime(), max.getTime())) : endDate;
    if (disabledDates === undefined) {
      return _min;
    }
    for (const currentDate = new Date(_min);
    // eslint-disable-next-line no-unmodified-loop-condition
    currentDate <= _max; currentDate.setDate(currentDate.getDate() + 1)) {
      if (!isDateDisabled(currentDate, min, max, disabledDates)) {
        return currentDate;
      }
    }
    return null;
  };

  /**
   * Retrieves an array of month names based on locale and format.
   * @param locale - The locale string (e.g., 'en-US').
   * @param format - The format of the month names ('short' or 'long').
   * @returns An array of month names.
   */
  const getMonthsNames = (locale, format = 'short') => {
    return Array.from({
      length: 12
    }, (_, i) => {
      return new Date(2000, i, 1).toLocaleString(locale, {
        month: format
      });
    });
  };

  /**
   * Retrieves an array of selectable dates from the given element.
   * @param element - The HTML element to search for selectable dates.
   * @param selector - The CSS selector used to identify selectable dates. Defaults to 'tr[tabindex="0"], td[tabindex="0"]'.
   * @returns An array of HTMLElements representing the selectable dates.
   */
  const getSelectableDates = (element, selector = 'tr[tabindex="0"], td[tabindex="0"]') => {
    return [...Element.prototype.querySelectorAll.call(element, selector)];
  };

  /**
   * Generates an array of years centered around a given year.
   * @param year - The central year.
   * @param range - The number of years before and after the central year.
   * @returns An array of years.
   */
  const getYears = (year, range = 6) => {
    return Array.from({
      length: range * 2
    }, (_, i) => year - range + i);
  };

  /**
   * Retrieves leading days (from the previous month) for a calendar view.
   * @param year - The year.
   * @param month - The month (0-11).
   * @param firstDayOfWeek - The first day of the week (0-6, where 0 is Sunday).
   * @returns An array of leading day objects.
   */
  const getLeadingDays = (year, month, firstDayOfWeek) => {
    // 0: sunday
    // 1: monday
    const dates = [];
    const d = new Date(year, month);
    const y = d.getFullYear();
    const m = d.getMonth();
    const firstWeekday = new Date(y, m, 1).getDay();
    let leadingDays = 6 - (6 - firstWeekday) - firstDayOfWeek;
    if (firstDayOfWeek) {
      leadingDays = leadingDays < 0 ? 7 + leadingDays : leadingDays;
    }
    for (let i = leadingDays * -1; i < 0; i++) {
      dates.push({
        date: new Date(y, m, i + 1),
        month: 'previous'
      });
    }
    return dates;
  };

  /**
   * Retrieves all days within a specific month.
   * @param year - The year.
   * @param month - The month (0-11).
   * @returns An array of day objects.
   */
  const getMonthDays = (year, month) => {
    const dates = [];
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      dates.push({
        date: new Date(year, month, i),
        month: 'current'
      });
    }
    return dates;
  };

  /**
   * Retrieves trailing days (from the next month) for a calendar view.
   * @param year - The year.
   * @param month - The month (0-11).
   * @param leadingDays - Array of leading day objects.
   * @param monthDays - Array of current month day objects.
   * @returns An array of trailing day objects.
   */
  const getTrailingDays = (year, month, leadingDays, monthDays) => {
    const dates = [];
    const days = 42 - (leadingDays.length + monthDays.length);
    for (let i = 1; i <= days; i++) {
      dates.push({
        date: new Date(year, month + 1, i),
        month: 'next'
      });
    }
    return dates;
  };

  /**
   * Calculates the ISO week number for a given date.
   * @param date - The date to calculate the week number for.
   * @returns The ISO week number.
   */
  const getWeekNumber = date => {
    const tempDate = new Date(date);
    tempDate.setHours(0, 0, 0, 0);

    // Thursday in current week decides the year
    tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
    const week1 = new Date(tempDate.getFullYear(), 0, 4);

    // Calculate full weeks to the date
    const weekNumber = 1 + Math.round((tempDate.getTime() - week1.getTime()) / 86400000 / 7);
    return weekNumber;
  };

  /**
   * Retrieves detailed information about each week in a month for calendar rendering.
   * @param year - The year.
   * @param month - The month (0-11).
   * @param firstDayOfWeek - The first day of the week (0-6, where 0 is Sunday).
   * @returns An array of week objects containing week numbers and day details.
   */
  const getMonthDetails = (year, month, firstDayOfWeek) => {
    const daysPrevMonth = getLeadingDays(year, month, firstDayOfWeek);
    const daysThisMonth = getMonthDays(year, month);
    const daysNextMonth = getTrailingDays(year, month, daysPrevMonth, daysThisMonth);
    const days = [...daysPrevMonth, ...daysThisMonth, ...daysNextMonth];
    const weeks = [];
    for (const [index, day] of days.entries()) {
      if (index % 7 === 0 || weeks.length === 0) {
        weeks.push({
          days: []
        });
      }
      if ((index + 1) % 7 === 0) {
        weeks[weeks.length - 1].weekNumber = getWeekNumber(day.date);
      }
      weeks[weeks.length - 1].days.push(day);
    }
    return weeks;
  };

  /**
   * Checks if a date is disabled based on the 'date' period type.
   * @param date - The date to check.
   * @param min - Minimum allowed date.
   * @param max - Maximum allowed date.
   * @param disabledDates - Criteria for disabled dates.
   * @returns True if the date is disabled, false otherwise.
   */
  const isDateDisabled = (date, min, max, disabledDates) => {
    if (min && date < min) {
      return true;
    }
    if (max && date > max) {
      return true;
    }
    if (disabledDates === undefined) {
      return false;
    }
    if (typeof disabledDates === 'function') {
      return disabledDates(date);
    }
    if (disabledDates instanceof Date && isSameDateAs(date, disabledDates)) {
      return true;
    }
    if (Array.isArray(disabledDates) && disabledDates) {
      for (const _date of disabledDates) {
        if (typeof _date === 'function' && _date(date)) {
          return true;
        }
        if (Array.isArray(_date) && isDateInRange(date, _date[0], _date[1])) {
          return true;
        }
        if (_date instanceof Date && isSameDateAs(date, _date)) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Checks if a date is within a specified range.
   * @param date - The date to check.
   * @param start - Start date of the range.
   * @param end - End date of the range.
   * @returns True if the date is within the range, false otherwise.
   */
  const isDateInRange = (date, start, end) => {
    const _date = removeTimeFromDate(date);
    const _start = start ? removeTimeFromDate(start) : null;
    const _end = end ? removeTimeFromDate(end) : null;
    return Boolean(_start && _end && _start <= _date && _date <= _end);
  };

  /**
   * Checks if a date is selected based on start and end dates.
   * @param date - The date to check.
   * @param start - Start date.
   * @param end - End date.
   * @returns True if the date is selected, false otherwise.
   */
  const isDateSelected = (date, start, end) => {
    if (start !== null && isSameDateAs(start, date)) {
      return true;
    }
    if (end !== null && isSameDateAs(end, date)) {
      return true;
    }
    return false;
  };

  /**
   * Determines if any date within a range is disabled.
   * @param startDate - Start date of the range.
   * @param endDate - End date of the range.
   * @param disabledDates - Criteria for disabled dates.
   * @returns True if any date in the range is disabled, false otherwise.
   */
  const isDisableDateInRange = (startDate, endDate, disabledDates) => {
    if (startDate && endDate) {
      const date = new Date(startDate);
      let disabled = false;

      // eslint-disable-next-line no-unmodified-loop-condition
      while (date < endDate) {
        date.setDate(date.getDate() + 1);
        if (isDateDisabled(date, null, null, disabledDates)) {
          disabled = true;
          break;
        }
      }
      return disabled;
    }
    return false;
  };

  /**
   * Checks if a month is disabled based on the 'month' period type.
   * @param date - The date representing the month to check.
   * @param min - Minimum allowed date.
   * @param max - Maximum allowed date.
   * @param disabledDates - Criteria for disabled dates.
   * @returns True if the month is disabled, false otherwise.
   */
  const isMonthDisabled = (date, min, max, disabledDates) => {
    const current = date.getFullYear() * 12 + date.getMonth();
    const _min = min ? min.getFullYear() * 12 + min.getMonth() : null;
    const _max = max ? max.getFullYear() * 12 + max.getMonth() : null;
    if (_min && current < _min) {
      return true;
    }
    if (_max && current > _max) {
      return true;
    }
    if (disabledDates === undefined) {
      return false;
    }
    const start = min ? Math.max(date.getTime(), min.getTime()) : date;
    const end = max ? Math.min(date.getTime(), max.getTime()) : new Date(new Date().getFullYear(), 11, 31);
    for (const currentDate = new Date(start);
    // eslint-disable-next-line no-unmodified-loop-condition
    currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
      if (!isDateDisabled(currentDate, min, max, disabledDates)) {
        return false;
      }
    }
    return false;
  };

  /**
   * Checks if a month is selected based on start and end dates.
   * @param date - The date representing the month.
   * @param start - Start date.
   * @param end - End date.
   * @returns True if the month is selected, false otherwise.
   */
  const isMonthSelected = (date, start, end) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (start !== null && year === start.getFullYear() && month === start.getMonth()) {
      return true;
    }
    if (end !== null && year === end.getFullYear() && month === end.getMonth()) {
      return true;
    }
    return false;
  };

  /**
   * Checks if a month is within a specified range.
   * @param date - The date representing the month.
   * @param start - Start date.
   * @param end - End date.
   * @returns True if the month is within the range, false otherwise.
   */
  const isMonthInRange = (date, start, end) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const _start = start ? start.getFullYear() * 12 + start.getMonth() : null;
    const _end = end ? end.getFullYear() * 12 + end.getMonth() : null;
    const _date = year * 12 + month;
    return Boolean(_start && _end && _start <= _date && _date <= _end);
  };

  /**
   * Checks if two dates are the same calendar date.
   * @param date - First date.
   * @param date2 - Second date.
   * @returns True if both dates are the same, false otherwise.
   */
  const isSameDateAs = (date, date2) => {
    if (date instanceof Date && date2 instanceof Date) {
      return date.getDate() === date2.getDate() && date.getMonth() === date2.getMonth() && date.getFullYear() === date2.getFullYear();
    }
    if (date === null && date2 === null) {
      return true;
    }
    return false;
  };

  /**
   * Checks if a date is today.
   * @param date - The date to check.
   * @returns True if the date is today, false otherwise.
   */
  const isToday = date => {
    const today = new Date();
    return isSameDateAs(date, today);
  };

  /**
   * Checks if a year is disabled based on the 'year' period type.
   * @param date - The date representing the year to check.
   * @param min - Minimum allowed date.
   * @param max - Maximum allowed date.
   * @param disabledDates - Criteria for disabled dates.
   * @returns True if the year is disabled, false otherwise.
   */
  const isYearDisabled = (date, min, max, disabledDates) => {
    const year = date.getFullYear();
    const minYear = min ? min.getFullYear() : null;
    const maxYear = max ? max.getFullYear() : null;
    if (minYear && year < minYear) {
      return true;
    }
    if (maxYear && year > maxYear) {
      return true;
    }
    if (disabledDates === undefined) {
      return false;
    }
    const start = min ? Math.max(date.getTime(), min.getTime()) : date;
    const end = max ? Math.min(date.getTime(), max.getTime()) : new Date(new Date().getFullYear(), 11, 31);
    for (const currentDate = new Date(start);
    // eslint-disable-next-line no-unmodified-loop-condition
    currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
      if (!isDateDisabled(currentDate, min, max, disabledDates)) {
        return false;
      }
    }
    return false;
  };

  /**
   * Checks if a year is selected based on start and end dates.
   * @param date - The date representing the year.
   * @param start - Start date.
   * @param end - End date.
   * @returns True if the year matches the start's or end's year, false otherwise.
   */
  const isYearSelected = (date, start, end) => {
    const year = date.getFullYear();
    if (start !== null && year === start.getFullYear()) {
      return true;
    }
    if (end !== null && year === end.getFullYear()) {
      return true;
    }
    return false;
  };

  /**
   * Checks if a year is within a specified range.
   * @param date - The date representing the year.
   * @param start - Start date.
   * @param end - End date.
   * @returns True if the year's value lies between start's year and end's year, false otherwise.
   */
  const isYearInRange = (date, start, end) => {
    const year = date.getFullYear();
    const _start = start ? start.getFullYear() : null;
    const _end = end ? end.getFullYear() : null;
    return Boolean(_start && _end && _start <= year && year <= _end);
  };

  /**
   * Removes the time component from a Date object.
   * @param date - The original date.
   * @returns A new Date object with the time set to 00:00:00.
   */
  const removeTimeFromDate = date => {
    const clearedDate = new Date(date);
    clearedDate.setHours(0, 0, 0, 0);
    return clearedDate;
  };

  /**
   * Copies the time (hours, minutes, seconds, milliseconds) from one Date to another.
   *
   * @param {Date} target - The date whose time will be updated.
   * @param {Date} source - The date to copy the time from.
   * @returns {Date} A new Date instance with the date from `target` and time from `source`.
   */
  const setTimeFromDate = (target, source) => {
    if (target === null) {
      return null;
    }
    if (!(source instanceof Date)) {
      return target;
    }
    const result = new Date(target); // create a copy to avoid mutation
    result.setHours(source.getHours(), source.getMinutes(), source.getSeconds(), source.getMilliseconds());
    return result;
  };

  exports.convertIsoWeekToDate = convertIsoWeekToDate;
  exports.convertToDateObject = convertToDateObject;
  exports.createGroupsInArray = createGroupsInArray;
  exports.getCalendarDate = getCalendarDate;
  exports.getDateBySelectionType = getDateBySelectionType;
  exports.getFirstAvailableDateInRange = getFirstAvailableDateInRange;
  exports.getMonthDetails = getMonthDetails;
  exports.getMonthsNames = getMonthsNames;
  exports.getSelectableDates = getSelectableDates;
  exports.getWeekNumber = getWeekNumber;
  exports.getYears = getYears;
  exports.isDateDisabled = isDateDisabled;
  exports.isDateInRange = isDateInRange;
  exports.isDateSelected = isDateSelected;
  exports.isDisableDateInRange = isDisableDateInRange;
  exports.isMonthDisabled = isMonthDisabled;
  exports.isMonthInRange = isMonthInRange;
  exports.isMonthSelected = isMonthSelected;
  exports.isSameDateAs = isSameDateAs;
  exports.isToday = isToday;
  exports.isYearDisabled = isYearDisabled;
  exports.isYearInRange = isYearInRange;
  exports.isYearSelected = isYearSelected;
  exports.removeTimeFromDate = removeTimeFromDate;
  exports.setTimeFromDate = setTimeFromDate;

  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

}));
//# sourceMappingURL=calendar.js.map
