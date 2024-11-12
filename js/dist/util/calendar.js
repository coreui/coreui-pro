/*!
  * CoreUI calendar.js v5.7.0 (https://coreui.io)
  * Copyright 2024 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Calendar = {}));
})(this, (function (exports) { 'use strict';

  const convertIsoWeekToDate = isoWeek => {
    const [year, week] = isoWeek.split(/w/i);
    // Get date for 4th of January for year
    const date = new Date(Number(year), 0, 4);
    // Get previous Monday, add 7 days for each week after first
    date.setDate(
    // eslint-disable-next-line no-mixed-operators
    date.getDate() - (date.getDay() || 7) + 1 + (Number(week) - 1) * 7);
    return date;
  };
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
  const convertToLocalDate = (d, locale, options = {}) => d.toLocaleDateString(locale, options);
  const convertToLocalTime = (d, locale, options = {}) => d.toLocaleTimeString(locale, options);
  const createGroupsInArray = (arr, numberOfGroups) => {
    const perGroup = Math.ceil(arr.length / numberOfGroups);
    return Array.from({
      length: numberOfGroups
    }).fill('').map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup));
  };
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
  const getCurrentYear = () => new Date().getFullYear();
  const getCurrentMonth = () => new Date().getMonth();
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
  const getMonthName = (month, locale) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(month);
    return d.toLocaleString(locale, {
      month: 'long'
    });
  };
  const getMonthsNames = locale => {
    const months = [];
    const d = new Date();
    d.setDate(1);
    for (let i = 0; i < 12; i++) {
      d.setMonth(i);
      months.push(d.toLocaleString(locale, {
        month: 'short'
      }));
    }
    return months;
  };
  const getYears = year => {
    const years = [];
    for (let _year = year - 6; _year < year + 6; _year++) {
      years.push(_year);
    }
    return years;
  };
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
  const getDayNumber = date => Math.ceil((Number(date) - Number(new Date(date.getFullYear(), 0, 0))) / 1000 / 60 / 60 / 24);
  const getLocalDateFromString = (string, locale, time) => {
    const date = new Date(2013, 11, 31, 17, 19, 22);
    let regex = time ? date.toLocaleString(locale) : date.toLocaleDateString(locale);
    regex = regex.replace('2013', '(?<year>[0-9]{2,4})').replace('12', '(?<month>[0-9]{1,2})').replace('31', '(?<day>[0-9]{1,2})');
    if (time) {
      regex = regex.replace('5', '(?<hour>[0-9]{1,2})').replace('17', '(?<hour>[0-9]{1,2})').replace('19', '(?<minute>[0-9]{1,2})').replace('22', '(?<second>[0-9]{1,2})').replace('PM', '(?<ampm>[A-Z]{2})');
    }
    const rgx = new RegExp(`${regex}`);
    const partials = string.match(rgx);
    if (partials === null) {
      return;
    }
    const newDate = partials.groups && (time ? new Date(Number(partials.groups.year, 10), Number(partials.groups.month, 10) - 1, Number(partials.groups.day), partials.groups.ampm ? partials.groups.ampm === 'PM' ? Number(partials.groups.hour) + 12 : Number(partials.groups.hour) : Number(partials.groups.hour), Number(partials.groups.minute), Number(partials.groups.second)) : new Date(Number(partials.groups.year), Number(partials.groups.month) - 1, Number(partials.groups.day)));
    return newDate;
  };
  const getWeekNumber = date => {
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(
    // eslint-disable-next-line no-mixed-operators
    ((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };
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
  const isDisableDateInRange = (startDate, endDate, dates) => {
    if (startDate && endDate) {
      const date = new Date(startDate);
      let disabled = false;

      // eslint-disable-next-line no-unmodified-loop-condition
      while (date < endDate) {
        date.setDate(date.getDate() + 1);
        if (isDateDisabled(date, null, null, dates)) {
          disabled = true;
          break;
        }
      }
      return disabled;
    }
    return false;
  };
  const isDateDisabled = (date, min, max, dates) => {
    let disabled;
    if (dates) {
      for (const _date of dates) {
        if (Array.isArray(_date) && isDateInRange(date, _date[0], _date[1])) {
          disabled = true;
        }
        if (_date instanceof Date && isSameDateAs(date, _date)) {
          disabled = true;
        }
      }
    }
    if (min && date < min) {
      disabled = true;
    }
    if (max && date > max) {
      disabled = true;
    }
    return disabled;
  };
  const isDateInRange = (date, start, end) => {
    const _date = removeTimeFromDate(date);
    const _start = start ? removeTimeFromDate(start) : null;
    const _end = end ? removeTimeFromDate(end) : null;
    return _start && _end && _start <= _date && _date <= _end;
  };
  const isDateSelected = (date, start, end) => {
    return start && isSameDateAs(start, date) || end && isSameDateAs(end, date);
  };
  const isEndDate = (date, start, end) => {
    return start && end && isSameDateAs(end, date) && start < end;
  };
  const isLastDayOfMonth = date => {
    const test = new Date(date.getTime());
    const month = test.getMonth();
    test.setDate(test.getDate() + 1);
    return test.getMonth() !== month;
  };
  const isSameDateAs = (date, date2) => {
    if (date instanceof Date && date2 instanceof Date) {
      return date.getDate() === date2.getDate() && date.getMonth() === date2.getMonth() && date.getFullYear() === date2.getFullYear();
    }
    if (date === null && date2 === null) {
      return true;
    }
    return false;
  };
  const isStartDate = (date, start, end) => {
    return start && end && isSameDateAs(start, date) && start < end;
  };
  const isToday = date => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  const isValidDate = date => {
    const d = new Date(date);
    return d instanceof Date && d.getTime();
  };
  const removeTimeFromDate = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  exports.convertIsoWeekToDate = convertIsoWeekToDate;
  exports.convertToDateObject = convertToDateObject;
  exports.convertToLocalDate = convertToLocalDate;
  exports.convertToLocalTime = convertToLocalTime;
  exports.createGroupsInArray = createGroupsInArray;
  exports.getCalendarDate = getCalendarDate;
  exports.getCurrentMonth = getCurrentMonth;
  exports.getCurrentYear = getCurrentYear;
  exports.getDateBySelectionType = getDateBySelectionType;
  exports.getDayNumber = getDayNumber;
  exports.getLocalDateFromString = getLocalDateFromString;
  exports.getMonthDetails = getMonthDetails;
  exports.getMonthName = getMonthName;
  exports.getMonthsNames = getMonthsNames;
  exports.getWeekNumber = getWeekNumber;
  exports.getYears = getYears;
  exports.isDateDisabled = isDateDisabled;
  exports.isDateInRange = isDateInRange;
  exports.isDateSelected = isDateSelected;
  exports.isDisableDateInRange = isDisableDateInRange;
  exports.isEndDate = isEndDate;
  exports.isLastDayOfMonth = isLastDayOfMonth;
  exports.isSameDateAs = isSameDateAs;
  exports.isStartDate = isStartDate;
  exports.isToday = isToday;
  exports.isValidDate = isValidDate;
  exports.removeTimeFromDate = removeTimeFromDate;

  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

}));
//# sourceMappingURL=calendar.js.map
