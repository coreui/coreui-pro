/*!
* CoreUI PRO calendar.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.CalendarUtil = {}));
})(this, function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region js/src/util/calendar.ts
	const createDate = (year, month = 0, day = 1) => {
		const date = new Date(year, month, day);
		date.setFullYear(year, month, day);
		date.setHours(0, 0, 0, 0);
		return date;
	};
	const parseToDateString = (value) => {
		const [, month, day, year] = /^\w{3} (\w{3}) (\d{2}) (-?\d{4,})$/.exec(value) ?? [];
		const monthIndex = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		].indexOf(month);
		return monthIndex === -1 ? /* @__PURE__ */ new Date(NaN) : createDate(Number(year), monthIndex, Number(day));
	};
	const getWeekLabel = (locale) => {
		try {
			const label = new Intl.DisplayNames(locale, { type: "dateTimeField" }).of("weekOfYear");
			return label ? label.charAt(0).toLocaleUpperCase(locale) + label.slice(1) : "Week";
		} catch {
			return "Week";
		}
	};
	const getWeekNumberName = (weekNumber, weekLabel, label) => label?.(weekNumber) || `${weekLabel} ${weekNumber}`;
	const getDateOfISOWeek = (year, week) => {
		const date = createDate(year, 0, 4);
		date.setDate(date.getDate() - (date.getDay() + 6) % 7 + (week - 1) * 7);
		return date;
	};
	const ARROW_KEYS = /* @__PURE__ */ new Set([
		"ArrowDown",
		"ArrowLeft",
		"ArrowRight",
		"ArrowUp"
	]);
	const MODIFIER_KEYS = /* @__PURE__ */ new Set([
		"Alt",
		"Control",
		"Meta",
		"Shift"
	]);
	const GREGORIAN_MONTH_CALENDARS = /* @__PURE__ */ new Set([
		"buddhist",
		"gregory",
		"iso8601",
		"japanese",
		"roc"
	]);
	const yearBeforeMonth = /* @__PURE__ */ new Map();
	const CELL_NAME_FORMATS = {
		days: {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric"
		},
		months: {
			month: "long",
			year: "numeric"
		},
		years: { year: "numeric" }
	};
	const VIEW_BY_SELECTION_TYPE = {
		day: "days",
		week: "days",
		month: "months",
		quarter: "quarters",
		year: "years"
	};
	const MONTHS_IN_PERIOD = {
		months: 1,
		quarters: 3,
		years: 12
	};
	const YEARS_PER_PAGE = 12;
	const getPeriod = (date, view) => {
		if (view === "weeks") return getMonday(date).getTime();
		return Math.floor((date.getFullYear() * 12 + date.getMonth()) / MONTHS_IN_PERIOD[view]);
	};
	const isEveryDayDisabled = (start, end, min, max, disabledDates) => {
		const first = min && min > start ? createDate(min.getFullYear(), min.getMonth(), min.getDate()) : start;
		const last = max && max < end ? createDate(max.getFullYear(), max.getMonth(), max.getDate()) : end;
		for (const currentDate = new Date(first); currentDate.getTime() <= last.getTime(); currentDate.setDate(currentDate.getDate() + 1)) if (!isDateDisabled(currentDate, null, null, disabledDates)) return false;
		return true;
	};
	const convertIsoWeekToDate = (isoWeek) => {
		const [year, week] = isoWeek.split(/[Ww]/);
		const parsedYear = parseYearSmart(year);
		return getDateOfISOWeek(parsedYear, Number.parseInt(week, 10));
	};
	const parseWeekString = (dateString) => {
		for (const pattern of [
			/^(\d{4})-W(\d{1,2})$/,
			/^(\d{4})W(\d{1,2})$/,
			/^(\d{4})\s+W(\d{1,2})$/
		]) {
			const match = dateString.trim().match(pattern);
			if (match) {
				const parsedYear = parseYearSmart(match[1]);
				const parsedWeek = Number.parseInt(match[2], 10);
				return getDateOfISOWeek(parsedYear, parsedWeek);
			}
		}
		return convertIsoWeekToDate(dateString);
	};
	const parseQuarterString = (dateString) => {
		for (const pattern of [
			/^(\d{4})-Q(\d{1})$/,
			/^(\d{4})Q(\d{1})$/,
			/^(\d{4})\s+Q(\d{1})$/
		]) {
			const match = dateString.trim().match(pattern);
			if (match) {
				const parsedYear = parseYearSmart(match[1]);
				const parsedQuarter = Number.parseInt(match[2], 10);
				if (parsedQuarter >= 1 && parsedQuarter <= 4) {
					const monthIndex = (parsedQuarter - 1) * 3;
					return createDate(parsedYear, monthIndex, 1);
				}
			}
		}
		return null;
	};
	const parseMonthString = (dateString) => {
		for (const pattern of [/^(\d{2,4})[-/.\s](\d{1,2})$/, /^(\d{1,2})[-/.\s](\d{2,4})$/]) {
			const match = dateString.trim().match(pattern);
			if (match) {
				const firstGroup = match[1];
				const secondGroup = match[2];
				const parsedFirst = Number.parseInt(firstGroup, 10);
				const parsedSecond = Number.parseInt(secondGroup, 10);
				let parsedYear;
				let parsedMonth;
				if (firstGroup.length >= 3 || parsedFirst >= 100) {
					parsedYear = parseYearSmart(firstGroup);
					parsedMonth = parsedSecond - 1;
				} else if (secondGroup.length >= 3 || parsedSecond >= 100) {
					parsedYear = parseYearSmart(secondGroup);
					parsedMonth = parsedFirst - 1;
				} else if (parsedSecond >= 1 && parsedSecond <= 12 && (parsedFirst > 12 || parsedFirst < 1)) {
					parsedYear = parseYearSmart(firstGroup);
					parsedMonth = parsedSecond - 1;
				} else {
					parsedYear = parseYearSmart(secondGroup);
					parsedMonth = parsedFirst - 1;
				}
				if (parsedMonth >= 0 && parsedMonth <= 11) return createDate(parsedYear, parsedMonth, 1);
			}
		}
		return null;
	};
	const parseYearString = (dateString) => {
		const yearString = String(dateString);
		const match = yearString.trim().match(/^(\d{2,4})$/);
		if (match) {
			const groups = { year: match[1] };
			return createDateFromYear(groups);
		}
		return parseLocalDateString(yearString);
	};
	const generateDatePatterns = (locale, includeTime) => {
		const referenceDate = new Date(2013, 11, 31, 17, 19, 22);
		const patterns = [];
		try {
			const standardFormat = includeTime ? referenceDate.toLocaleString(locale, { calendar: "gregory" }) : referenceDate.toLocaleDateString(locale, { calendar: "gregory" });
			patterns.push(standardFormat);
		} catch {
			const standardFormat = includeTime ? referenceDate.toLocaleString("en-US") : referenceDate.toLocaleDateString("en-US");
			patterns.push(standardFormat);
		}
		const separators = [
			"/",
			"-",
			".",
			" "
		];
		const standardFormat = patterns[0];
		let originalSeparator = "/";
		if (standardFormat.includes("/")) originalSeparator = "/";
		else if (standardFormat.includes("-")) originalSeparator = "-";
		else if (standardFormat.includes(".")) originalSeparator = ".";
		for (const sep of separators) if (sep !== originalSeparator) {
			const escapedSeparator = originalSeparator.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
			const altFormat = standardFormat.replaceAll(new RegExp(escapedSeparator, "g"), sep);
			patterns.push(altFormat);
		}
		return patterns;
	};
	const buildDateRegexPattern = (formatString, includeTime) => {
		let regexPattern = formatString.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
		regexPattern = regexPattern.replace("2013", String.raw`(?<year>\d{2,4})`).replace("12", String.raw`(?<month>\d{1,2})`).replace("31", String.raw`(?<day>\d{1,2})`);
		if (includeTime) regexPattern = regexPattern.replaceAll(/17|5/g, String.raw`(?<hour>\d{1,2})`).replace("19", String.raw`(?<minute>\d{1,2})`).replace("22", String.raw`(?<second>\d{1,2})`).replaceAll(/AM|PM/gi, "(?<ampm>[APap][Mm])");
		return regexPattern;
	};
	const tryParseWithPatterns = (dateString, patterns, includeTime) => {
		for (const pattern of patterns) {
			const regexPattern = buildDateRegexPattern(pattern, includeTime);
			const regex = new RegExp(`^${regexPattern}$`);
			const match = dateString.trim().match(regex);
			if (match?.groups) return match.groups;
		}
		return null;
	};
	const readWrittenDay = (dateString, locale) => {
		const iso = /^(?<year>\d{4,})-(?<month>\d{1,2})-(?<day>\d{1,2})(?!\d)/.exec(dateString);
		if (iso?.groups) return iso.groups;
		for (const pattern of generateDatePatterns(locale, false)) {
			const match = new RegExp(`^${buildDateRegexPattern(pattern, false)}(?!\\d)`).exec(dateString);
			if (match?.groups) return match.groups;
		}
		return null;
	};
	const convertTo24Hour = (hour, ampm) => {
		const parsedHour = Number.parseInt(hour, 10);
		if (!ampm) return parsedHour;
		const isPM = ampm.toLowerCase() === "pm";
		if (isPM && parsedHour !== 12) return parsedHour + 12;
		if (!isPM && parsedHour === 12) return 0;
		return parsedHour;
	};
	const validateTimeComponents = (hour, minute, second) => {
		return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59;
	};
	const validateDateComponents = (year, month, day) => {
		const parsedMonth = Number.parseInt(month, 10);
		const parsedDay = Number.parseInt(day, 10);
		return parsedMonth >= 1 && parsedMonth <= 12 && parsedDay >= 1 && parsedDay <= createDate(parseYearSmart(year), parsedMonth, 0).getDate();
	};
	const createDateWithTime = (groups) => {
		const { year, month, day, hour, minute, second, ampm } = groups;
		if (ampm && Number.parseInt(hour, 10) > 12) return null;
		const parsedYear = parseYearSmart(year);
		const parsedMonth = Number.parseInt(month, 10) - 1;
		const parsedDay = Number.parseInt(day, 10);
		const parsedHour = convertTo24Hour(hour, ampm);
		const parsedMinute = Number.parseInt(minute ?? "0", 10) || 0;
		const parsedSecond = Number.parseInt(second ?? "0", 10) || 0;
		if (!validateTimeComponents(parsedHour, parsedMinute, parsedSecond)) return null;
		const date = createDate(parsedYear, parsedMonth, parsedDay);
		date.setHours(parsedHour, parsedMinute, parsedSecond);
		return date;
	};
	const createDateOnly = (groups) => {
		const { year, month, day } = groups;
		if (!validateDateComponents(year, month, day)) return null;
		const parsedYear = parseYearSmart(year);
		const parsedMonth = Number.parseInt(month, 10) - 1;
		return createDate(parsedYear, parsedMonth, Number.parseInt(day, 10));
	};
	const getExpectedPartsCount = (patterns) => {
		if (patterns.length === 0) return 3;
		return patterns[0].split(/[-/.\s:]+/).filter((part) => part.length > 0).length;
	};
	const parseDayString = (dateString, locale, includeTime) => {
		const patterns = generateDatePatterns(locale, includeTime);
		const groups = tryParseWithPatterns(dateString, patterns, includeTime);
		if (!groups) {
			const trimmed = dateString.trim();
			const hasDateSeparators = /[-/.:]/.test(trimmed);
			const parts = trimmed.split(/[-/.\s:]+/).filter((part) => part.length > 0);
			const expectedPartsCount = getExpectedPartsCount(patterns);
			const hasRequiredParts = parts.length >= expectedPartsCount;
			if (hasDateSeparators && hasRequiredParts) {
				const written = readWrittenDay(trimmed, locale);
				return written && !validateDateComponents(written.year, written.month, written.day) ? null : parseLocalDateString(dateString);
			}
			return null;
		}
		if ("year" in groups && "month" in groups && "day" in groups) {
			const { year, month, day } = groups;
			if (!validateDateComponents(year, month, day)) return null;
		} else return null;
		return includeTime ? createDateWithTime(groups) : createDateOnly(groups);
	};
	const parseLocalDateString = (dateString) => {
		const trimmed = dateString.trim();
		const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
		const _date = new Date(Date.parse(isoDateOnly ? `${trimmed}T00:00` : dateString));
		if (!Number.isNaN(_date.getTime())) return _date;
		return null;
	};
	const convertToDateObject = (date, selectionType, locale = "en-US", includeTime = false) => {
		if (!date) return null;
		if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : date;
		const parsers = {
			week: parseWeekString,
			month: parseMonthString,
			quarter: parseQuarterString,
			year: parseYearString
		};
		const value = typeof date === "number" ? String(date) : date;
		const parse = selectionType ? parsers[selectionType] : void 0;
		const parsed = parse ? parse(value) : parseDayString(value, locale, includeTime);
		return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
	};
	const convertToSelectionDate = (date, selectionType) => {
		const value = convertToDateObject(date, selectionType);
		return value && selectionType === "week" ? getMonday(value) : value;
	};
	const convertToShownDate = (date, selectionType, firstDayOfWeek) => {
		const value = convertToDateObject(date, selectionType);
		if (!value || selectionType !== "week") return value;
		const rowStart = getWeekRowStart(value, firstDayOfWeek);
		const rowEnd = createDate(rowStart.getFullYear(), rowStart.getMonth(), rowStart.getDate() + 6);
		const monday = getMonday(value);
		return [rowStart, rowEnd].some((day) => day.getFullYear() === value.getFullYear() && day.getMonth() === value.getMonth()) ? value : createDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3);
	};
	const convertToLimitDate = (date, selectionType) => {
		const value = convertToDateObject(date, selectionType);
		if (!value || selectionType !== "week") return value;
		const monday = getMonday(value);
		return createDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3);
	};
	const getLocalDateFromString = (dateString, locale = "en-US", includeTime = false, selectionType = "day") => {
		if (!dateString || typeof dateString !== "string") return null;
		return convertToDateObject(dateString, selectionType, locale, includeTime);
	};
	const createGroupsInArray = (arr, numberOfGroups) => {
		const perGroup = Math.ceil(arr.length / numberOfGroups);
		return Array.from({ length: numberOfGroups }).fill("").map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup));
	};
	const getCalendarDate = (calendarDate, order, view) => {
		if (order !== 0 && view === "days") return createDate(calendarDate.getFullYear(), calendarDate.getMonth() + order, 1);
		if (order !== 0 && (view === "months" || view === "quarters")) return createDate(calendarDate.getFullYear() + order, calendarDate.getMonth(), 1);
		if (order !== 0 && view === "years") return createDate(calendarDate.getFullYear() + 12 * order, calendarDate.getMonth(), 1);
		return calendarDate;
	};
	const getDateBySelectionType = (date, selectionType) => {
		if (date === null) return null;
		if (selectionType === "week") {
			const { year, weekNumber } = getISOWeekNumberAndYear(date);
			return `${String(year).padStart(4, "0")}W${weekNumber.toString().padStart(2, "0")}`;
		}
		const year = String(date.getFullYear()).padStart(4, "0");
		if (selectionType === "month") return `${year}-${`0${date.getMonth() + 1}`.slice(-2)}`;
		if (selectionType === "quarter") return `${year}Q${Math.floor(date.getMonth() / 3) + 1}`;
		if (selectionType === "year") return year;
		return date;
	};
	const createDateTimeFormat = (locale, options) => {
		const formatter = new Intl.DateTimeFormat(locale, options);
		return options?.calendar || GREGORIAN_MONTH_CALENDARS.has(formatter.resolvedOptions().calendar) ? formatter : new Intl.DateTimeFormat(locale, {
			...options,
			calendar: "gregory"
		});
	};
	const isYearBeforeMonth = (locale) => {
		const key = locale ?? "";
		if (!yearBeforeMonth.has(key)) {
			const parts = createDateTimeFormat(locale, {
				month: "long",
				year: "numeric"
			}).formatToParts(new Date(2e3, 0, 1));
			yearBeforeMonth.set(key, parts.findIndex(({ type }) => type === "year") < parts.findIndex(({ type }) => type === "month"));
		}
		return yearBeforeMonth.get(key);
	};
	const getMonthsNames = (locale, format = "short") => {
		const formatter = createDateTimeFormat(locale, { month: format });
		return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2e3, i, 1)));
	};
	const createDateFormatter = () => {
		const formatters = /* @__PURE__ */ new Map();
		return (date, locale, options) => {
			if (Number.isNaN(date.getTime())) return date.toLocaleDateString(locale, options);
			const key = `${locale}|${options ? JSON.stringify(options) : ""}`;
			let formatter = formatters.get(key);
			if (!formatter) {
				formatter = createDateTimeFormat(locale, options);
				formatters.set(key, formatter);
			}
			return formatter.format(date);
		};
	};
	const getYears = (year, range = 6) => {
		return Array.from({ length: range * 2 }, (_, i) => year - range + i);
	};
	const formatYearsRange = (year, locale) => {
		const years = getYears(year);
		const [start, end] = [years[0], years.at(-1)].map((value) => createDate(value));
		const range = createDateTimeFormat(locale, { year: "numeric" }).formatRange(start, end);
		return /(?!\p{Nd})[\u0590-\u08FF]/u.test(range) ? `\u2067${range}\u2069` : range;
	};
	const formatCellName = (date, view, format) => view === "quarters" ? `Q${Math.floor(date.getMonth() / 3) + 1} ${format(date, { year: "numeric" })}` : format(date, CELL_NAME_FORMATS[view]);
	const formatWeekName = (days, locale) => createDateTimeFormat(locale, {
		day: "numeric",
		month: "long",
		year: "numeric"
	}).formatRange(days[0].date, days.at(-1).date);
	const formatSelectionName = (date, { ariaWeekNumberLabel = null, firstDayOfWeek = 1, locale, selectionType = "day", showWeekNumber = false } = {}) => {
		if (selectionType !== "week") return formatCellName(date, VIEW_BY_SELECTION_TYPE[selectionType], (value, options) => createDateTimeFormat(locale, options).format(value));
		const first = getWeekRowStart(date, firstDayOfWeek);
		const name = formatWeekName([{ date: first }, { date: createDate(first.getFullYear(), first.getMonth(), first.getDate() + 6) }], locale);
		return showWeekNumber ? `${getWeekNumberName(getISOWeekNumberAndYear(date).weekNumber, getWeekLabel(locale ?? ""), ariaWeekNumberLabel)}, ${name}` : name;
	};
	const formatSelectionRangeName = (start, end, options = {}) => {
		const { ariaWeekNumberLabel = null, firstDayOfWeek = 1, locale, selectionType = "day", showWeekNumber = false } = options;
		const startName = formatSelectionName(start, options);
		const endName = formatSelectionName(end, options);
		if (startName === endName) return startName;
		if (selectionType === "quarter" || end < start) return `${startName} – ${endName}`;
		if (selectionType === "week") {
			const last = getWeekRowStart(end, firstDayOfWeek);
			const days = createDateTimeFormat(locale, {
				day: "numeric",
				month: "long",
				year: "numeric"
			}).formatRange(getWeekRowStart(start, firstDayOfWeek), createDate(last.getFullYear(), last.getMonth(), last.getDate() + 6));
			const weekName = (date) => getWeekNumberName(getISOWeekNumberAndYear(date).weekNumber, getWeekLabel(locale ?? ""), ariaWeekNumberLabel);
			return showWeekNumber ? `${weekName(start)} – ${weekName(end)}, ${days}` : days;
		}
		return createDateTimeFormat(locale, CELL_NAME_FORMATS[VIEW_BY_SELECTION_TYPE[selectionType]]).formatRange(start, end);
	};
	const getLeadingDays = (year, month, firstDayOfWeek) => {
		const dates = [];
		const d = createDate(year, month);
		const y = d.getFullYear();
		const m = d.getMonth();
		let leadingDays = 6 - (6 - createDate(y, m, 1).getDay()) - firstDayOfWeek;
		if (firstDayOfWeek) leadingDays = leadingDays < 0 ? 7 + leadingDays : leadingDays;
		for (let i = leadingDays * -1; i < 0; i++) dates.push({
			date: createDate(y, m, i + 1),
			month: "previous"
		});
		return dates;
	};
	const getMonthDays = (year, month) => {
		const dates = [];
		const lastDay = createDate(year, month + 1, 0).getDate();
		for (let i = 1; i <= lastDay; i++) dates.push({
			date: createDate(year, month, i),
			month: "current"
		});
		return dates;
	};
	const getTrailingDays = (year, month, leadingDays, monthDays) => {
		const dates = [];
		const days = 42 - (leadingDays.length + monthDays.length);
		for (let i = 1; i <= days; i++) dates.push({
			date: createDate(year, month + 1, i),
			month: "next"
		});
		return dates;
	};
	const getISOWeekNumberAndYear = (date) => {
		const tempDate = new Date(date);
		tempDate.setHours(0, 0, 0, 0);
		tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
		const week1 = new Date(tempDate);
		week1.setMonth(0, 4);
		return {
			weekNumber: 1 + Math.round((tempDate.getTime() - week1.getTime()) / 6048e5),
			year: tempDate.getFullYear()
		};
	};
	const getMonthDetails = (year, month, firstDayOfWeek) => {
		const daysPrevMonth = getLeadingDays(year, month, firstDayOfWeek);
		const daysThisMonth = getMonthDays(year, month);
		const daysNextMonth = getTrailingDays(year, month, daysPrevMonth, daysThisMonth);
		const days = [
			...daysPrevMonth,
			...daysThisMonth,
			...daysNextMonth
		];
		const weeks = [];
		for (const [index, day] of days.entries()) {
			if (index % 7 === 0 || weeks.length === 0) weeks.push({
				week: {
					number: 0,
					year: 0
				},
				days: []
			});
			if (index % 7 === 3) {
				const { weekNumber, year } = getISOWeekNumberAndYear(day.date);
				const lastWeek = weeks[weeks.length - 1];
				if (lastWeek) lastWeek.week = {
					number: weekNumber,
					year
				};
			}
			const lastWeek = weeks[weeks.length - 1];
			if (lastWeek) lastWeek.days.push(day);
		}
		return weeks;
	};
	const getClosestTarget = (targets, anchor, rows) => {
		let closest;
		let closestGap = Number.POSITIVE_INFINITY;
		for (const target of targets) {
			if (!rows && target.adjacent) continue;
			const time = anchor.getTime();
			const gap = time < target.position.getTime() ? target.position.getTime() - time : Math.max(0, time - target.end.getTime());
			if (gap < closestGap || gap === closestGap && closest?.adjacent && !target.adjacent) {
				closest = target;
				closestGap = gap;
			}
		}
		return closest;
	};
	const getTabStop = (targets, anchor, rows) => (targets.find((target) => target.selected) ?? (anchor ? getClosestTarget(targets, anchor, rows) : void 0) ?? targets[0])?.date.getTime();
	const getSelectableDates = (element, selector = "tr[tabindex], td[tabindex]") => [...Element.prototype.querySelectorAll.call(element, selector)];
	const getClosestSelectable = (elements, anchor, rows) => {
		const targets = [];
		for (const element of elements) {
			const cells = rows ? [...element.querySelectorAll("td[data-coreui-date]")] : [element];
			const first = cells[0]?.dataset.coreuiDate;
			const last = cells.at(-1)?.dataset.coreuiDate;
			if (first && last) {
				const position = parseToDateString(first);
				targets.push({
					adjacent: cells[0].matches(".previous, .next"),
					date: position,
					element,
					end: parseToDateString(last),
					position,
					selected: element.classList.contains("selected")
				});
			}
		}
		return getClosestTarget(targets, anchor, rows)?.element;
	};
	const setRovingTabIndex = (element, selector, anchor, rows, preferred) => {
		const empty = !element.querySelector(selector);
		for (const panel of element.querySelectorAll(".calendar")) {
			const targets = getSelectableDates(panel, selector);
			const grid = panel.querySelector("table");
			if (empty) grid?.setAttribute("tabindex", "0");
			else grid?.removeAttribute("tabindex");
			for (const stale of panel.querySelectorAll("td[tabindex=\"0\"], tr[tabindex=\"0\"]")) if (!targets.includes(stale)) stale.tabIndex = -1;
			if (targets.length === 0) continue;
			const active = (preferred && targets.includes(preferred) ? preferred : void 0) ?? targets.find((target) => target.classList.contains("selected")) ?? (anchor ? getClosestSelectable(targets, anchor, rows) : void 0) ?? targets[0];
			for (const target of targets) {
				const tabIndex = target === active ? 0 : -1;
				if (target.tabIndex !== tabIndex) target.tabIndex = tabIndex;
			}
		}
	};
	const getStartOfView = (date, view) => {
		const value = new Date(date);
		value.setHours(0, 0, 0, 0);
		if (view === "months") value.setDate(1);
		if (view === "quarters") value.setMonth(Math.floor(value.getMonth() / 3) * 3, 1);
		if (view === "years") value.setMonth(0, 1);
		return value;
	};
	const getStartOfWeek = (date, firstDayOfWeek) => {
		const value = new Date(date);
		value.setDate(value.getDate() - (value.getDay() - firstDayOfWeek + 7) % 7);
		return value;
	};
	const getWeekRowDate = (rowStart) => getMonday(createDate(rowStart.getFullYear(), rowStart.getMonth(), rowStart.getDate() + 3));
	const getMonday = (date) => {
		const monday = getStartOfWeek(date, 1);
		return createDate(monday.getFullYear(), monday.getMonth(), monday.getDate());
	};
	const getWeekRowStart = (date, firstDayOfWeek) => {
		const monday = getMonday(date);
		return getStartOfWeek(createDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3), firstDayOfWeek);
	};
	const getViewEdge = (forward, { calendarDate, calendars, view }) => {
		const year = calendarDate.getFullYear();
		const month = calendarDate.getMonth();
		const last = calendars - 1;
		if (view === "days") return forward ? createDate(year, month + last + 1, 0) : createDate(year, month, 1);
		if (view === "years") return createDate(forward ? year + 6 - 1 + 12 * last : year - 6, 0, 1);
		return forward ? createDate(year + last, view === "quarters" ? 9 : 11, 1) : createDate(year, 0, 1);
	};
	const getPanelMonth = ({ calendarDate, panel }) => [createDate(calendarDate.getFullYear(), calendarDate.getMonth() + panel, 1), createDate(calendarDate.getFullYear(), calendarDate.getMonth() + panel + 1, 0)];
	const isUnfocusable = (date, { maxDate, minDate, rows, view }) => isCellOutsideLimits(date, view, minDate, maxDate, rows);
	const walkToFocusable = (start, date, context) => {
		const { rows, view } = context;
		const sign = start > date ? -1 : 1;
		const isShort = (value) => sign * (date.getTime() - value.getTime()) > 0;
		while (isUnfocusable(start, context) && isShort(start)) if (view === "days") start.setDate(start.getDate() + sign * (rows ? 7 : 1));
		else start.setMonth(start.getMonth() + sign * MONTHS_IN_PERIOD[view]);
		return start;
	};
	const getArrowTarget = (date, forward, vertical, context) => {
		const { firstDayOfWeek, rows, view } = context;
		const [days, months] = {
			days: vertical || rows ? [7, 0] : [1, 0],
			months: vertical ? [0, 3] : [0, 1],
			quarters: vertical ? [0, 12] : [0, 3],
			years: vertical ? [0, 36] : [0, 12]
		}[view];
		const sign = forward ? 1 : -1;
		const target = rows ? getStartOfWeek(date, firstDayOfWeek) : new Date(date);
		target.setMonth(target.getMonth() + sign * months, target.getDate() + sign * days);
		return isUnfocusable(target, context) ? null : target;
	};
	const getGridArrowTarget = (forward, context) => {
		const { firstDayOfWeek, maxDate, minDate, rows, view } = context;
		const limit = forward ? minDate ?? createDate(1) : maxDate;
		if (!limit) return null;
		const target = getStartOfView(limit, view);
		const edge = getViewEdge(forward, context);
		if (forward ? edge >= target : edge <= target) return null;
		return rows ? getStartOfWeek(target, firstDayOfWeek) : target;
	};
	const getRevealOffset = (date, { calendarDate, calendars, rows, view }) => {
		if (view === "days") {
			const end = new Date(date);
			end.setDate(end.getDate() + (rows ? 6 : 0));
			const monthsFrom = (value) => (value.getFullYear() - calendarDate.getFullYear()) * 12 + value.getMonth() - calendarDate.getMonth();
			return {
				months: monthsFrom(end) < 0 ? monthsFrom(end) : Math.max(0, monthsFrom(date) - calendars + 1),
				years: 0
			};
		}
		if (view === "years") {
			const page = Math.floor((date.getFullYear() - calendarDate.getFullYear() + 6) / 12);
			return {
				months: 0,
				years: 12 * (page < 0 ? page : Math.max(0, page - calendars + 1))
			};
		}
		const delta = date.getFullYear() - calendarDate.getFullYear();
		return {
			months: 0,
			years: delta < 0 ? delta : Math.max(0, delta - calendars + 1)
		};
	};
	const getRowEdge = (date, last, context) => {
		const { calendarDate, firstDayOfWeek, rows, view } = context;
		const year = date.getFullYear();
		const month = date.getMonth();
		let edge;
		if (view === "days" && rows) edge = getStartOfWeek(getPanelMonth(context)[last ? 1 : 0], firstDayOfWeek);
		else switch (view) {
			case "days":
				edge = getStartOfWeek(createDate(year, month, date.getDate()), firstDayOfWeek);
				edge.setDate(edge.getDate() + (last ? 6 : 0));
				break;
			case "months":
				edge = createDate(year, month - month % 3 + (last ? 2 : 0), 1);
				break;
			case "quarters":
				edge = createDate(year, last ? 9 : 0, 1);
				break;
			default: {
				const offset = year - calendarDate.getFullYear() + 6;
				edge = createDate(year - offset % 3 + (last ? 2 : 0), 0, 1);
			}
		}
		if ((last ? -1 : 1) * (date.getTime() - edge.getTime()) < 0) return new Date(date);
		return walkToFocusable(edge, date, context);
	};
	const moveTo = (target, context) => target ? {
		date: target,
		...getRevealOffset(target, context),
		type: "move"
	} : { type: "stay" };
	const getPageOffset = (direction, shiftKey, view) => view === "days" && !shiftKey ? {
		months: direction,
		years: 0
	} : {
		months: 0,
		years: direction * (view === "years" ? 12 : 1)
	};
	const getPageAction = (date, direction, shiftKey, context) => {
		const { firstDayOfWeek, keptDay, maxDate, minDate, rows, view } = context;
		const offset = getPageOffset(direction, shiftKey, view);
		const kept = keptDay && isSameDateAs(keptDay.focused, date) ? keptDay : null;
		const day = kept ? kept.day : date.getDate();
		const from = kept ? kept.target : date;
		const target = new Date(date);
		target.setFullYear(from.getFullYear() + offset.years, from.getMonth() + offset.months, 1);
		target.setDate(Math.min(day, createDate(target.getFullYear(), target.getMonth() + 1, 0).getDate()));
		const bound = direction > 0 ? maxDate : minDate ?? createDate(1);
		const [first, last] = getPanelMonth(context);
		let start;
		if (bound && isUnfocusable(rows ? getStartOfWeek(target, firstDayOfWeek) : target, context)) {
			const edge = getStartOfView(bound, view);
			start = rows ? getStartOfWeek(edge, firstDayOfWeek) : edge;
		} else if (view === "days" && !rows && (date < first || date > last)) start = target;
		else return {
			date: target,
			keptDay: {
				day,
				focused: rows ? getStartOfWeek(target, firstDayOfWeek) : target,
				target
			},
			...offset,
			type: "page"
		};
		const stop = walkToFocusable(start, date, context);
		if (stop.getTime() === date.getTime()) return { type: "stay" };
		return {
			date: stop,
			keptDay: {
				day,
				focused: stop,
				target: stop
			},
			...getRevealOffset(stop, context),
			type: "move"
		};
	};
	const isForwardKey = (key, rtl) => key === "ArrowDown" || key === (rtl ? "ArrowLeft" : "ArrowRight");
	const getGridKeyAction = ({ key, shiftKey }, context) => {
		if (ARROW_KEYS.has(key)) return moveTo(getGridArrowTarget(isForwardKey(key, context.rtl), context), context);
		if (key === "PageDown" || key === "PageUp") return {
			...getPageOffset(key === "PageDown" ? 1 : -1, shiftKey, context.view),
			type: "page"
		};
		return key === "End" || key === "Home" ? { type: "stay" } : null;
	};
	const getCellKeyAction = ({ code, key, repeat, shiftKey }, date, context) => {
		if (ARROW_KEYS.has(key)) return moveTo(getArrowTarget(date, isForwardKey(key, context.rtl), key === "ArrowDown" || key === "ArrowUp", context), context);
		if (code === "Space" || key === "Enter") return repeat ? { type: "stay" } : { type: "activate" };
		if (key === "End" || key === "Home") {
			const target = getRowEdge(date, key === "End", context);
			if (target.getTime() === date.getTime()) return { type: "stay" };
			if (!context.rows) return moveTo(target, context);
			return {
				date: target,
				months: 0,
				panel: context.panel,
				type: "move",
				years: 0
			};
		}
		return key === "PageDown" || key === "PageUp" ? getPageAction(date, key === "PageDown" ? 1 : -1, shiftKey, context) : null;
	};
	const hasShortcutModifier = (event) => Boolean(event.altKey || event.ctrlKey || event.metaKey);
	const getCalendarKeyAction = (event, date, context) => {
		if (hasShortcutModifier(event)) return null;
		return date ? getCellKeyAction(event, date, context) : getGridKeyAction(event, context);
	};
	const getKeptDay = (key, action, keptDay) => {
		if (action && "keptDay" in action && action.keptDay) return action.keptDay;
		return action?.type === "stay" || MODIFIER_KEYS.has(key) ? keptDay : null;
	};
	const constrainDate = (date, min, max) => {
		if (min && date < min) return new Date(min);
		if (max && date > max) return new Date(max);
		return date;
	};
	const isDateDisabled = (date, min, max, disabledDates) => {
		const day = removeTimeFromDate(date);
		if (min && day < removeTimeFromDate(min) || date.getFullYear() < 1) return true;
		if (max && day > removeTimeFromDate(max)) return true;
		if (disabledDates === void 0) return false;
		if (typeof disabledDates === "function") return disabledDates(date);
		if (disabledDates instanceof Date && isSameDateAs(date, disabledDates)) return true;
		if (Array.isArray(disabledDates) && disabledDates) for (const _date of disabledDates) {
			if (typeof _date === "function" && _date(date)) return true;
			if (Array.isArray(_date) && isDateInRange(date, _date[0], _date[1])) return true;
			if (_date instanceof Date && isSameDateAs(date, _date)) return true;
		}
		return false;
	};
	const isDateInRange = (date, start, end) => {
		const _date = removeTimeFromDate(date);
		const _start = start ? removeTimeFromDate(start) : null;
		const _end = end ? removeTimeFromDate(end) : null;
		return Boolean(_start && _end && _start <= _date && _date <= _end);
	};
	const isDateSelected = (date, start, end) => {
		if (start !== null && isSameDateAs(start, date)) return true;
		if (end !== null && isSameDateAs(end, date)) return true;
		return false;
	};
	const isDisableDateInRange = (startDate, endDate, disabledDates, view = "days") => {
		if (startDate && endDate) {
			const end = createDate(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
			for (let date = createDate(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1); date <= end; date = createDate(date.getFullYear(), date.getMonth(), date.getDate() + 1)) if (isCellDisabled(date, view, null, null, disabledDates)) return true;
		}
		return false;
	};
	const isPeriodDisabled = (date, view, min, max, disabledDates) => {
		const period = getPeriod(date, view);
		if (min && period < getPeriod(min, view) || max && period > getPeriod(max, view) || date.getFullYear() < 1) return true;
		if (disabledDates === void 0) return false;
		if (view === "weeks") {
			const monday = getMonday(date);
			return isEveryDayDisabled(monday, createDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6), null, null, disabledDates);
		}
		const months = MONTHS_IN_PERIOD[view];
		const year = date.getFullYear();
		const month = Math.floor(date.getMonth() / months) * months;
		return isEveryDayDisabled(createDate(year, month, 1), createDate(year, month + months, 0), min, max, disabledDates);
	};
	const isCellDisabled = (date, view, min, max, disabledDates) => view === "days" ? isDateDisabled(date, min, max, disabledDates) : isPeriodDisabled(date, view, min, max, disabledDates);
	const isCellOutsideLimits = (date, view, min, max, rows = false) => {
		const start = getStartOfView(date, view);
		const end = view === "days" ? createDate(start.getFullYear(), start.getMonth(), start.getDate() + (rows ? 6 : 0)) : createDate(start.getFullYear(), start.getMonth() + MONTHS_IN_PERIOD[view], 0);
		return end.getFullYear() < 1 || Boolean(min && end < getStartOfView(min, "days")) || Boolean(max && start > getStartOfView(max, "days"));
	};
	const isPeriodInRange = (date, view, start, end) => {
		if (!start || !end) return false;
		const period = getPeriod(date, view);
		return getPeriod(start, view) <= period && period <= getPeriod(end, view);
	};
	const isPeriodSelected = (date, view, start, end) => [start, end].some((value) => value !== null && getPeriod(value, view) === getPeriod(date, view));
	const isSameInstantAs = (date, date2) => {
		if (date === null || date2 === null) return date === date2;
		return date.getTime() === date2.getTime();
	};
	const isSameDateAs = (date, date2) => {
		if (date instanceof Date && date2 instanceof Date) return date.getDate() === date2.getDate() && date.getMonth() === date2.getMonth() && date.getFullYear() === date2.getFullYear();
		if (date === null && date2 === null) return true;
		return false;
	};
	const isToday = (date) => {
		return isSameDateAs(date, /* @__PURE__ */ new Date());
	};
	const removeTimeFromDate = (date) => {
		const clearedDate = new Date(date);
		clearedDate.setHours(0, 0, 0, 0);
		return clearedDate;
	};
	const setTimeFromDate = (target, source) => {
		if (target === null) return null;
		if (!(source instanceof Date)) return target;
		const result = new Date(target);
		result.setHours(source.getHours(), source.getMinutes(), source.getSeconds(), source.getMilliseconds());
		return result;
	};
	const parseYearSmart = (yearString) => {
		let parsedYear = Number.parseInt(yearString, 10);
		if (/^\s*\d{1,2}\D*$/.test(yearString)) {
			const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
			parsedYear = Math.floor(currentYear / 100) * 100 + parsedYear;
			if (parsedYear > currentYear + 50) parsedYear -= 100;
		}
		return parsedYear;
	};
	const createDateFromYear = (groups) => {
		const { year } = groups;
		const parsedYear = parseYearSmart(year);
		return createDate(parsedYear, 0, 1);
	};
	//#endregion
	exports.YEARS_PER_PAGE = YEARS_PER_PAGE;
	exports.constrainDate = constrainDate;
	exports.convertIsoWeekToDate = convertIsoWeekToDate;
	exports.convertToDateObject = convertToDateObject;
	exports.convertToLimitDate = convertToLimitDate;
	exports.convertToSelectionDate = convertToSelectionDate;
	exports.convertToShownDate = convertToShownDate;
	exports.createDate = createDate;
	exports.createDateFormatter = createDateFormatter;
	exports.createDateTimeFormat = createDateTimeFormat;
	exports.createGroupsInArray = createGroupsInArray;
	exports.formatCellName = formatCellName;
	exports.formatSelectionName = formatSelectionName;
	exports.formatSelectionRangeName = formatSelectionRangeName;
	exports.formatWeekName = formatWeekName;
	exports.formatYearsRange = formatYearsRange;
	exports.getCalendarDate = getCalendarDate;
	exports.getCalendarKeyAction = getCalendarKeyAction;
	exports.getClosestSelectable = getClosestSelectable;
	exports.getDateBySelectionType = getDateBySelectionType;
	exports.getDateOfISOWeek = getDateOfISOWeek;
	exports.getISOWeekNumberAndYear = getISOWeekNumberAndYear;
	exports.getKeptDay = getKeptDay;
	exports.getLocalDateFromString = getLocalDateFromString;
	exports.getMonthDetails = getMonthDetails;
	exports.getMonthsNames = getMonthsNames;
	exports.getSelectableDates = getSelectableDates;
	exports.getStartOfView = getStartOfView;
	exports.getStartOfWeek = getStartOfWeek;
	exports.getTabStop = getTabStop;
	exports.getWeekLabel = getWeekLabel;
	exports.getWeekNumberName = getWeekNumberName;
	exports.getWeekRowDate = getWeekRowDate;
	exports.getWeekRowStart = getWeekRowStart;
	exports.getYears = getYears;
	exports.hasShortcutModifier = hasShortcutModifier;
	exports.isCellDisabled = isCellDisabled;
	exports.isCellOutsideLimits = isCellOutsideLimits;
	exports.isDateDisabled = isDateDisabled;
	exports.isDateInRange = isDateInRange;
	exports.isDateSelected = isDateSelected;
	exports.isDisableDateInRange = isDisableDateInRange;
	exports.isPeriodDisabled = isPeriodDisabled;
	exports.isPeriodInRange = isPeriodInRange;
	exports.isPeriodSelected = isPeriodSelected;
	exports.isSameDateAs = isSameDateAs;
	exports.isSameInstantAs = isSameInstantAs;
	exports.isToday = isToday;
	exports.isYearBeforeMonth = isYearBeforeMonth;
	exports.parseToDateString = parseToDateString;
	exports.parseYearSmart = parseYearSmart;
	exports.removeTimeFromDate = removeTimeFromDate;
	exports.setRovingTabIndex = setRovingTabIndex;
	exports.setTimeFromDate = setTimeFromDate;
});

//# sourceMappingURL=calendar.js.map