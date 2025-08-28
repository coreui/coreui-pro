/*!
  * CoreUI calendar.js v5.18.0 (https://coreui.io)
  * Copyright 2025 The CoreUI Team (https://github.com/orgs/coreui/people)
  * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Calendar = {}));
})(this, (function (exports) { 'use strict';

  let _2 = t => t,
    _t,
    _t2,
    _t3,
    _t4,
    _t5,
    _t6,
    _t7;
  /**
   * Converts an ISO week string to a Date object representing the Monday of that week.
   * @param isoWeek - The ISO week string (e.g., "2023W05" or "2023w05").
   * @returns The Date object for the Monday of the specified week, or null if invalid.
   */
  /**
   * Helper function to calculate Monday of ISO week 1 for a given year.
   * @param year - The year to calculate for.
   * @returns The Monday of ISO week 1.
   */
  const getMondayOfISOWeek1 = year => {
    const jan4 = new Date(year, 0, 4);
    const jan4DayOfWeek = jan4.getDay();
    const daysFromMonday = jan4DayOfWeek === 0 ? 6 : jan4DayOfWeek - 1; // Sunday = 6 days from Monday
    const mondayOfWeek1 = new Date(jan4);
    mondayOfWeek1.setDate(jan4.getDate() - daysFromMonday);
    return mondayOfWeek1;
  };

  /**
   * Helper function to calculate Monday of a specific ISO week.
   * @param year - The year.
   * @param week - The ISO week number.
   * @returns The Monday of the specified ISO week.
   */
  const getMondayOfISOWeek = (year, week) => {
    const mondayOfWeek1 = getMondayOfISOWeek1(year);
    const weekStart = new Date(mondayOfWeek1);
    // prettier-ignore
    weekStart.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);
    return weekStart;
  };

  /**
   * Helper function to convert a date to a month number for comparison.
   * @param date - The date to convert.
   * @returns A number representing year*12 + month for easy comparison.
   */
  const dateToMonthNumber = date => {
    // prettier-ignore
    return date.getFullYear() * 12 + date.getMonth();
  };

  /**
   * Helper function to check if a value is within min/max range.
   * @param value - The value to check.
   * @param min - Minimum allowed value (null means no minimum).
   * @param max - Maximum allowed value (null means no maximum).
   * @returns True if the value is outside the range, false if within range.
   */
  const isOutsideRange = (value, min, max) => {
    if (min !== null && value < min) {
      return true;
    }
    if (max !== null && value > max) {
      return true;
    }
    return false;
  };

  /**
   * Converts an ISO week string to a Date object representing the Monday of that week.
   * @param isoWeek - The ISO week string (e.g., "2023W05" or "2023w05").
   * @returns The Date object for the Monday of the specified week.
   */
  const convertIsoWeekToDate = isoWeek => {
    const [year, week] = isoWeek.split(/[Ww]/);
    const parsedYear = parseYearSmart(year);
    const parsedWeek = Number.parseInt(week, 10);

    // Create date from ISO week using helper function
    return getMondayOfISOWeek(parsedYear, parsedWeek);
  };

  /**
   * Parses a week string and returns a Date object for the Monday of that week.
   * @param dateString - The week string to parse.
   * @returns The Date object for the Monday of the week, or null if invalid.
   */
  const parseWeekString = dateString => {
    const weekPatterns = [/^(\d{4})-W(\d{1,2})$/,
    // 2023-W05, 2023-W5
    /^(\d{4})W(\d{1,2})$/,
    // 2023W05, 2023W5
    /^(\d{4})\s+W(\d{1,2})$/ // 2023 W05, 2023 W5
    ];
    for (const pattern of weekPatterns) {
      const match = dateString.trim().match(pattern);
      if (match) {
        const parsedYear = parseYearSmart(match[1]);
        const parsedWeek = Number.parseInt(match[2], 10);

        // Create date from ISO week using helper function
        return getMondayOfISOWeek(parsedYear, parsedWeek);
      }
    }

    // Fallback to existing ISO week parsing
    return convertIsoWeekToDate(dateString);
  };

  /**
   * Parses a month string and returns a Date object for the first day of that month.
   * @param dateString - The month string to parse.
   * @returns The Date object for the first day of the month, or null if invalid.
   */
  const parseMonthString = dateString => {
    const monthPatterns = [/^(\d{2,4})[-/.\s](\d{1,2})$/,
    // 2023-12, 23-12, 2023/12, 23/12, 2023 12, etc.
    /^(\d{1,2})[-/.\s](\d{2,4})$/ // 12-2023, 12-23, 12/2023, 12/23, 12 2023, etc.
    ];
    for (const pattern of monthPatterns) {
      const match = dateString.trim().match(pattern);
      if (match) {
        const firstGroup = match[1];
        const secondGroup = match[2];

        // Determine which group is year and which is month
        const parsedFirst = Number.parseInt(firstGroup, 10);
        const parsedSecond = Number.parseInt(secondGroup, 10);
        let parsedYear;
        let parsedMonth;

        // Determine which group is year and which is month based on several heuristics
        if (firstGroup.length >= 3 || parsedFirst >= 100) {
          // First group is clearly a year (3+ digits or >= 100)
          parsedYear = parseYearSmart(firstGroup);
          parsedMonth = parsedSecond - 1;
        } else if (secondGroup.length >= 3 || parsedSecond >= 100) {
          // Second group is clearly a year (3+ digits or >= 100)
          parsedYear = parseYearSmart(secondGroup);
          parsedMonth = parsedFirst - 1;
        } else {
          // Both groups are 1-2 digits, use context clues
          // If second group is a valid month (1-12), treat first as year
          // eslint-disable-next-line no-lonely-if
          if (parsedSecond >= 1 && parsedSecond <= 12 && (parsedFirst > 12 || parsedFirst < 1)) {
            parsedYear = parseYearSmart(firstGroup);
            parsedMonth = parsedSecond - 1;
          } else {
            // Default: treat second group as year
            parsedYear = parseYearSmart(secondGroup);
            parsedMonth = parsedFirst - 1;
          }
        }
        if (parsedMonth >= 0 && parsedMonth <= 11) {
          return new Date(parsedYear, parsedMonth, 1);
        }
      }
    }

    // For month selection, don't use fallback parsing - return null if no pattern matches
    return null;
  };

  /**
   * Parses a year string or number and returns a Date object for January 1st of that year.
   * @param dateString - The year string or number to parse.
   * @returns The Date object for January 1st of the year, or null if invalid.
   */
  const parseYearString = dateString => {
    const yearString = String(dateString);
    const yearPattern = /^(\d{2,4})$/;
    const match = yearString.trim().match(yearPattern);
    if (match) {
      const groups = {
        year: match[1]
      };
      return createDateFromYear(groups);
    }
    return parseWithTimezoneOffset(yearString);
  };

  /**
   * Helper function to generate multiple date format patterns based on locale.
   * @param locale - The locale to use for date format patterns.
   * @param includeTime - Whether to include time in the patterns.
   * @returns Array of date format patterns.
   */
  const generateDatePatterns = (locale, includeTime) => {
    const referenceDate = new Date(2013, 11, 31, 17, 19, 22);
    const patterns = [];
    try {
      // Get the standard locale format
      const standardFormat = includeTime ? referenceDate.toLocaleString(locale) : referenceDate.toLocaleDateString(locale);
      patterns.push(standardFormat);
    } catch (_unused) {
      // Fallback to default locale if invalid locale provided
      const standardFormat = includeTime ? referenceDate.toLocaleString("en-US") : referenceDate.toLocaleDateString("en-US");
      patterns.push(standardFormat);
    }

    // Generate common alternative formats by replacing separators
    const separators = ["/", "-", ".", " "];
    const standardFormat = patterns[0];

    // Detect the original separator
    let originalSeparator = "/"; // default
    if (standardFormat.includes("/")) {
      originalSeparator = "/";
    } else if (standardFormat.includes("-")) {
      originalSeparator = "-";
    } else if (standardFormat.includes(".")) {
      originalSeparator = ".";
    }
    for (const sep of separators) {
      if (sep !== originalSeparator) {
        // Escape the original separator for regex if it's a special character
        const escapedSeparator = originalSeparator.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw(_t || (_t = _2`\$&`)));
        const altFormat = standardFormat.replaceAll(new RegExp(escapedSeparator, "g"), sep);
        patterns.push(altFormat);
      }
    }
    return patterns;
  };

  /**
   * Helper function to build regex pattern for date parsing.
   * @param formatString - The date format string.
   * @param includeTime - Whether to include time patterns.
   * @returns The regex pattern string.
   */
  const buildDateRegexPattern = (formatString, includeTime) => {
    // First escape special regex characters

    let regexPattern = formatString.replaceAll(/[.*+?^${}()|[\\]\\]/g, "\\$&");

    // Then replace the date/time components with regex groups
    regexPattern = regexPattern.replace("2013", String.raw(_t2 || (_t2 = _2`(?<year>\d{2,4})`))).replace("12", String.raw(_t3 || (_t3 = _2`(?<month>\d{1,2})`))).replace("31", String.raw(_t4 || (_t4 = _2`(?<day>\d{1,2})`)));
    if (includeTime) {
      regexPattern = regexPattern.replaceAll(/17|5/g, String.raw(_t5 || (_t5 = _2`(?<hour>\d{1,2})`))).replace("19", String.raw(_t6 || (_t6 = _2`(?<minute>\d{1,2})`))).replace("22", String.raw(_t7 || (_t7 = _2`(?<second>\d{1,2})`))).replaceAll(/AM|PM/gi, "(?<ampm>[APap][Mm])");
    }
    return regexPattern;
  };

  /**
   * Helper function to try parsing with multiple patterns.
   * @param dateString - The date string to parse.
   * @param patterns - Array of format patterns to try.
   * @param includeTime - Whether time parsing is included.
   * @returns Parsed groups or null if no match.
   */
  const tryParseWithPatterns = (dateString, patterns, includeTime) => {
    for (const pattern of patterns) {
      const regexPattern = buildDateRegexPattern(pattern, includeTime);
      const regex = new RegExp(`^${regexPattern}$`);
      const match = dateString.trim().match(regex);
      if (match != null && match.groups) {
        return match.groups;
      }
    }
    return null;
  };

  /**
   * Helper function to convert 12-hour to 24-hour format.
   * @param hour - Hour string.
   * @param ampm - AM/PM indicator.
   * @returns Hour in 24-hour format.
   */
  const convertTo24Hour = (hour, ampm) => {
    const parsedHour = Number.parseInt(hour, 10);
    if (!ampm) {
      return parsedHour;
    }
    const isPM = ampm.toLowerCase() === "pm";
    if (isPM && parsedHour !== 12) {
      return parsedHour + 12;
    }
    if (!isPM && parsedHour === 12) {
      return 0;
    }
    return parsedHour;
  };

  /**
   * Helper function to validate time components.
   * @param hour - Hour value.
   * @param minute - Minute value.
   * @param second - Second value.
   * @returns True if time components are valid.
   */
  const validateTimeComponents = (hour, minute, second) => {
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59;
  };

  /**
   * Helper function to validate date components.
   * @param month - Month string.
   * @param day - Day string.
   * @returns True if date components are valid.
   */
  const validateDateComponents = (month, day) => {
    const parsedMonth = Number.parseInt(month, 10) - 1;
    const parsedDay = Number.parseInt(day, 10);
    return parsedMonth >= 0 && parsedMonth <= 11 && parsedDay >= 1 && parsedDay <= 31;
  };

  /**
   * Helper function to create date with time.
   * @param groups - Parsed date and time groups.
   * @returns Date object or null if invalid.
   */
  const createDateWithTime = groups => {
    const {
      year,
      month,
      day,
      hour,
      minute,
      second,
      ampm
    } = groups;
    const parsedYear = parseYearSmart(year);
    const parsedMonth = Number.parseInt(month, 10) - 1;
    const parsedDay = Number.parseInt(day, 10);
    const parsedHour = convertTo24Hour(hour, ampm);
    const parsedMinute = Number.parseInt(minute != null ? minute : "0", 10) || 0;
    const parsedSecond = Number.parseInt(second != null ? second : "0", 10) || 0;
    if (!validateTimeComponents(parsedHour, parsedMinute, parsedSecond)) {
      return null;
    }
    return new Date(parsedYear, parsedMonth, parsedDay, parsedHour, parsedMinute, parsedSecond);
  };

  /**
   * Helper function to create date without time.
   * @param groups - Parsed date groups.
   * @returns Date object or null if invalid.
   */
  const createDateOnly = groups => {
    const {
      year,
      month,
      day
    } = groups;
    if (!validateDateComponents(month, day)) {
      return null;
    }
    const parsedYear = parseYearSmart(year);
    const parsedMonth = Number.parseInt(month, 10) - 1;
    const parsedDay = Number.parseInt(day, 10);
    return new Date(parsedYear, parsedMonth, parsedDay);
  };

  /**
   * Enhanced day parsing with locale-aware patterns.
   * @param dateString - The day string to parse.
   * @param locale - The locale to use for parsing.
   * @param includeTime - Whether to include time parsing.
   * @returns Date object or null if invalid.
   */
  const parseDayString = (dateString, locale, includeTime) => {
    const patterns = generateDatePatterns(locale, includeTime);
    const groups = tryParseWithPatterns(dateString, patterns, includeTime);
    if (!groups) {
      // Check if input looks like a complete date (has separators and multiple parts)
      // If so, use fallback parsing for formats like "2022/08/17", "2022-08-17"
      // If not (like "1", "12"), return null
      const trimmed = dateString.trim();
      const hasDateSeparators = /[-/.:]/.test(trimmed);
      const parts = trimmed.split(/[-/.\s:]+/).filter(part => part.length > 0);
      const hasMultipleParts = parts.length >= 2;
      if (hasDateSeparators && hasMultipleParts) {
        // Use fallback for complete date strings that don't match locale patterns
        return parseWithTimezoneOffset(dateString);
      }

      // For incomplete input like "1" or "12", return null
      return null;
    }

    // For day selection, require at least month and day to be present
    if ("month" in groups && "day" in groups) {
      const {
        month,
        day
      } = groups;
      if (!validateDateComponents(month, day)) {
        return null;
      }
    } else {
      // If incomplete date information, return null instead of guessing
      return null;
    }

    // Create and return appropriate date object
    return includeTime ? createDateWithTime(groups) : createDateOnly(groups);
  };

  /**
   * Parses a date string with timezone offset adjustment.
   * @param dateString - The date string to parse.
   * @returns The Date object with timezone offset applied, or null if invalid.
   */
  const parseWithTimezoneOffset = dateString => {
    const _date = new Date(Date.parse(dateString));
    if (!Number.isNaN(_date.getTime())) {
      const userTimezoneOffset = _date.getTimezoneOffset() * 60000;
      return new Date(_date.getTime() + userTimezoneOffset);
    }
    return null;
  };

  /**
   * Converts a date string or Date object to a Date object based on selection type.
   * @param date - The date to convert.
   * @param selectionType - The type of selection ('day', 'week', 'month', 'year').
   * @param locale - The locale to use for date parsing (for day parsing).
   * @param includeTime - Whether to include time parsing (for day parsing).
   * @returns The corresponding Date object or null if invalid.
   */
  const convertToDateObject = (date, selectionType, locale = "en-US", includeTime = false) => {
    if (date === null) {
      return null;
    }
    if (date instanceof Date) {
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const dateString = date;
    switch (selectionType) {
      case "week":
        {
          return parseWeekString(dateString);
        }
      case "month":
        {
          return parseMonthString(dateString);
        }
      case "year":
        {
          return parseYearString(dateString);
        }
      default:
        {
          // Enhanced day parsing with locale support
          return parseDayString(dateString, locale, includeTime);
        }
    }
  };

  /**
   * Enhanced locale-aware date parsing function (replaces getLocalDateFromString).
   * @param dateString - The date string to parse.
   * @param locale - The locale to use for date format patterns.
   * @param includeTime - Whether to include time parsing.
   * @param selectionType - The selection type ('day', 'week', 'month', 'year').
   * @returns A Date object if parsing succeeds, null if parsing fails.
   */
  const getLocalDateFromString = (dateString, locale = "en-US", includeTime = false, selectionType = "day") => {
    // Input validation
    if (!dateString || typeof dateString !== "string") {
      return null;
    }
    return convertToDateObject(dateString, selectionType, locale, includeTime);
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
    }).fill("").map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup));
  };

  /**
   * Adjusts the calendar date based on order and view type.
   * @param calendarDate - The current calendar date.
   * @param order - The order to adjust by.
   * @param view - The current view type.
   * @returns The adjusted Date object.
   */
  const getCalendarDate = (calendarDate, order, view) => {
    if (order !== 0 && view === "days") {
      return new Date(calendarDate.getFullYear(), calendarDate.getMonth() + order, 1);
    }
    if (order !== 0 && view === "months") {
      return new Date(calendarDate.getFullYear() + order, calendarDate.getMonth(), 1);
    }
    if (order !== 0 && view === "years") {
      // prettier-ignore
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
    if (selectionType === "week") {
      const {
        year,
        weekNumber
      } = getISOWeekNumberAndYear(date);
      return `${year}W${weekNumber.toString().padStart(2, "0")}`;
    }
    if (selectionType === "month") {
      const monthNumber = `0${date.getMonth() + 1}`.slice(-2);
      return `${date.getFullYear()}-${monthNumber}`;
    }
    if (selectionType === "year") {
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
  const getMonthsNames = (locale, format = "short") => {
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
        month: "previous"
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
        month: "current"
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
        month: "next"
      });
    }
    return dates;
  };

  /**
   * Calculates the ISO 8601 week number and year for a given date.
   *
   * In the ISO 8601 standard:
   * - Weeks start on Monday.
   * - The first week of the year is the one that contains January 4th.
   * - The year of the week may differ from the calendar year (e.g., Dec 29, 2025 is in ISO year 2026).
   *
   * @param {Date} date - The date for which to calculate the ISO week number and year.
   * @returns {{ weekNumber: number, year: number }} An object containing:
   *   - `weekNumber`: the ISO week number (1–53),
   *   - `year`: the ISO year (may differ from the calendar year of the date).
   */
  const getISOWeekNumberAndYear = date => {
    const tempDate = new Date(date);
    tempDate.setHours(0, 0, 0, 0);

    // Thursday in current week decides the year
    tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
    const week1 = new Date(tempDate.getFullYear(), 0, 4);

    // Calculate full weeks to the date
    const weekNumber = 1 + Math.round((tempDate.getTime() - week1.getTime()) / (86400000 * 7));
    return {
      weekNumber,
      year: tempDate.getFullYear()
    };
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
          week: {
            number: 0,
            year: 0
          },
          days: []
        });
      }
      if ((index + 1) % 7 === 0) {
        const {
          weekNumber,
          year
        } = getISOWeekNumberAndYear(day.date);
        weeks.at(-1).week = {
          number: weekNumber,
          year
        };
      }
      weeks.at(-1).days.push(day);
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
    if (typeof disabledDates === "function") {
      return disabledDates(date);
    }
    if (disabledDates instanceof Date && isSameDateAs(date, disabledDates)) {
      return true;
    }
    if (Array.isArray(disabledDates) && disabledDates) {
      for (const _date of disabledDates) {
        if (typeof _date === "function" && _date(date)) {
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
    const current = dateToMonthNumber(date);
    const _min = min ? dateToMonthNumber(min) : null;
    const _max = max ? dateToMonthNumber(max) : null;
    if (isOutsideRange(current, _min, _max)) {
      return true;
    }
    if (disabledDates === undefined) {
      return false;
    }
    const startTime = min ? Math.max(date.getTime(), min.getTime()) : date.getTime();
    const endTime = max ? Math.min(date.getTime(), max.getTime()) : new Date(new Date().getFullYear(), 11, 31).getTime();
    for (const currentDate = new Date(startTime); currentDate.getTime() <= endTime; currentDate.setDate(currentDate.getDate() + 1)) {
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
    const _start = start ? dateToMonthNumber(start) : null;
    const _end = end ? dateToMonthNumber(end) : null;
    const _date = dateToMonthNumber(date);
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
    if (isOutsideRange(year, minYear, maxYear)) {
      return true;
    }
    if (disabledDates === undefined) {
      return false;
    }
    const startTime = min ? Math.max(date.getTime(), min.getTime()) : date.getTime();
    const endTime = max ? Math.min(date.getTime(), max.getTime()) : new Date(new Date().getFullYear(), 11, 31).getTime();
    for (const currentDate = new Date(startTime); currentDate.getTime() <= endTime; currentDate.setDate(currentDate.getDate() + 1)) {
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
   * @param {Date | null} source - The date to copy the time from.
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

  /**
   * Parses a year string with smart 2-digit handling.
   * @param yearString - The year string to parse.
   * @returns The parsed year as a number with intelligent century assignment.
   */
  const parseYearSmart = yearString => {
    let parsedYear = Number.parseInt(yearString, 10);

    // Handle 2-digit years with intelligent century assignment
    if (parsedYear < 100) {
      const currentYear = new Date().getFullYear();
      const currentCentury = Math.floor(currentYear / 100) * 100;
      parsedYear = currentCentury + parsedYear;

      // If the result is more than 50 years in the future, use previous century
      // This creates a sliding window: for current year 2025, years 76-99 become 1976-1999
      // and years 00-75 become 2000-2075
      if (parsedYear > currentYear + 50) {
        parsedYear -= 100;
      }
    }
    return parsedYear;
  };

  /**
   * Creates a date from year groups.
   * @param groups - The year groups containing year string.
   * @returns A Date object for January 1st of the year.
   */
  const createDateFromYear = groups => {
    const {
      year
    } = groups;
    const parsedYear = parseYearSmart(year);
    return new Date(parsedYear, 0, 1);
  };

  /**
   * Creates a date from month groups.
   * @param groups - The month groups containing year and month strings.
   * @returns A Date object for the first day of the month.
   */
  const createDateFromMonth = groups => {
    const {
      year,
      month
    } = groups;
    const parsedYear = parseYearSmart(year);
    const parsedMonth = Number.parseInt(month, 10) - 1;
    return new Date(parsedYear, parsedMonth, 1);
  };

  /**
   * Creates a date from week groups.
   * @param groups - The week groups containing year and week strings.
   * @returns A Date object for the Monday of the specified week.
   */
  const createDateFromWeek = groups => {
    const {
      year,
      week
    } = groups;
    const parsedYear = parseYearSmart(year);
    const parsedWeek = Number.parseInt(week, 10);

    // Create date from ISO week using helper function
    return getMondayOfISOWeek(parsedYear, parsedWeek);
  };

  exports.convertIsoWeekToDate = convertIsoWeekToDate;
  exports.convertToDateObject = convertToDateObject;
  exports.createDateFromMonth = createDateFromMonth;
  exports.createDateFromWeek = createDateFromWeek;
  exports.createDateFromYear = createDateFromYear;
  exports.createGroupsInArray = createGroupsInArray;
  exports.getCalendarDate = getCalendarDate;
  exports.getDateBySelectionType = getDateBySelectionType;
  exports.getFirstAvailableDateInRange = getFirstAvailableDateInRange;
  exports.getISOWeekNumberAndYear = getISOWeekNumberAndYear;
  exports.getLocalDateFromString = getLocalDateFromString;
  exports.getMonthDetails = getMonthDetails;
  exports.getMonthsNames = getMonthsNames;
  exports.getSelectableDates = getSelectableDates;
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
  exports.parseYearSmart = parseYearSmart;
  exports.removeTimeFromDate = removeTimeFromDate;
  exports.setTimeFromDate = setTimeFromDate;

  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

}));
//# sourceMappingURL=calendar.js.map
