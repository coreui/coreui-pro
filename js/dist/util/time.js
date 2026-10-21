/*!
* CoreUI PRO time.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Time = {}));
})(this, function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region js/src/util/time.ts
	const convert12hTo24h = (abbr, hour) => {
		if (abbr === "am" && hour === 12) return 0;
		if (abbr === "am") return hour;
		if (abbr === "pm" && hour === 12) return 12;
		return hour + 12;
	};
	const convert24hTo12h = (hour) => hour % 12 || 12;
	const convertTimeToDate = (time) => time ? time instanceof Date ? new Date(time) : /* @__PURE__ */ new Date(`1970-01-01 ${time}`) : null;
	const getAmPm = (date, locale) => {
		if (date.toLocaleTimeString(locale).includes("AM")) return "am";
		if (date.toLocaleTimeString(locale).includes("PM")) return "pm";
		return date.getHours() >= 12 ? "pm" : "am";
	};
	const formatTimePartials = (values, locale, partial, hour12) => {
		const date = new Date(2020, 0, 1);
		const forceTwoDigit = shouldUseTwoDigitHour(locale);
		const hourCycle = hour12 === void 0 ? void 0 : hour12 ? "h12" : "h23";
		const formatter = new Intl.DateTimeFormat(locale, {
			hour: forceTwoDigit ? "2-digit" : "numeric",
			minute: "2-digit",
			second: "2-digit",
			hourCycle
		});
		return values.map((value) => {
			if (partial === "hour") date.setHours(value);
			if (partial === "minute") date.setMinutes(value);
			if (partial === "second") date.setSeconds(value);
			return {
				value,
				label: formatter.formatToParts(date).find((part) => part.type === partial)?.value || ""
			};
		});
	};
	const getLocalizedTimePartials = (locale, ampm = "auto", hours = [], minutes = [], seconds = []) => {
		const hour12 = ampm === "auto" && isAmPm(locale) || ampm === true;
		const cycle = Array.from({ length: 24 }, (_, i) => hour12 ? (i + 1) % 24 : i);
		const allowedHours = Array.isArray(hours) && hours.length > 0 ? new Set(hours) : cycle.filter((hour) => typeof hours !== "function" || hours(hour));
		const hourValues = /* @__PURE__ */ new Map();
		for (const hour of allowedHours) {
			const value = hour12 ? convert24hTo12h(hour) : hour;
			hourValues.set(value, [...hourValues.get(value) ?? [], hour]);
		}
		const listOfMinutes = Array.isArray(minutes) && minutes.length > 0 ? minutes : typeof minutes === "function" ? Array.from({ length: 60 }, (_, i) => i).filter((minute) => minutes(minute)) : Array.from({ length: 60 }, (_, i) => i);
		const listOfSeconds = Array.isArray(seconds) && seconds.length > 0 ? seconds : typeof seconds === "function" ? Array.from({ length: 60 }, (_, i) => i).filter((second) => seconds(second)) : Array.from({ length: 60 }, (_, i) => i);
		return {
			listOfHours: formatTimePartials([...hourValues.keys()], locale, "hour", hour12).map((partial) => ({
				...partial,
				hours: hourValues.get(partial.value)
			})),
			listOfMinutes: formatTimePartials(listOfMinutes, locale, "minute"),
			listOfSeconds: formatTimePartials(listOfSeconds, locale, "second"),
			hour12
		};
	};
	const getSelectedHour = (date, locale, ampm = "auto") => date ? ampm === "auto" && isAmPm(locale) || ampm === true ? convert24hTo12h(date.getHours()) : date.getHours() : "";
	const getSelectedMinutes = (date) => date ? date.getMinutes() : "";
	const getSelectedSeconds = (date) => date ? date.getSeconds() : "";
	const isAmPm = (locale) => [
		"am",
		"AM",
		"pm",
		"PM"
	].some((el) => (/* @__PURE__ */ new Date()).toLocaleString(locale).includes(el));
	const isTimeOutsideLimits = (date, part, value, { max, min }, offered = []) => {
		const start = new Date(date);
		const end = new Date(date);
		if (part === "meridiem") {
			start.setHours(value === "pm" ? 12 : 0, 0, 0, 0);
			end.setHours(value === "pm" ? 23 : 11, 59, 59, 999);
		}
		if (part === "hours") {
			start.setHours(Number(value), 0, 0, 0);
			end.setHours(Number(value), 59, 59, 999);
		}
		if (part === "minutes") {
			start.setMinutes(Number(value), 0, 0);
			end.setMinutes(Number(value), 59, 999);
		}
		if (part === "seconds") {
			start.setSeconds(Number(value), 0);
			end.setSeconds(Number(value), 999);
		}
		if (offered.length > 0 && (part === "hours" || part === "minutes")) return offered.every((inner) => isTimeOutsideLimits(start, part === "hours" ? "minutes" : "seconds", inner, {
			max,
			min
		}));
		return Boolean(min && end < min || max && start > max);
	};
	const shouldUseTwoDigitHour = (locale) => {
		return new Date(2020, 0, 1, 7, 5, 7).toLocaleTimeString(locale).startsWith("0");
	};
	//#endregion
	exports.convert12hTo24h = convert12hTo24h;
	exports.convert24hTo12h = convert24hTo12h;
	exports.convertTimeToDate = convertTimeToDate;
	exports.getAmPm = getAmPm;
	exports.getLocalizedTimePartials = getLocalizedTimePartials;
	exports.getSelectedHour = getSelectedHour;
	exports.getSelectedMinutes = getSelectedMinutes;
	exports.getSelectedSeconds = getSelectedSeconds;
	exports.isAmPm = isAmPm;
	exports.isTimeOutsideLimits = isTimeOutsideLimits;
});

//# sourceMappingURL=time.js.map