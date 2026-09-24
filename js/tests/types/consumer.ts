/**
 * --------------------------------------------------------------------------
 * CoreUI PRO js/tests/types/consumer.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

// This file type-checks against the SHIPPED declarations in `js/dist`, not
// against `js/src` — that is the point. It only passes after `npm run
// js-emit-types`, so it catches what the source-level check cannot: a public
// type that does not survive declaration emit.

import {
  Alert, Calendar, Chip, ChipSet, DateInput, DatePicker, Modal, MultiSelect, Popover, Toast, Tooltip
} from '../../dist/index.js'
import type { CalendarConfig } from '../../dist/calendar.js'
import type { DateInputConfig } from '../../dist/date-input.js'
import type { DatePickerConfig } from '../../dist/date-picker.js'
import type { DateRangeInputConfig } from '../../dist/date-range-input.js'
import type { DateRangePickerConfig } from '../../dist/date-range-picker.js'
import type { TimeInputConfig } from '../../dist/time-input.js'
import type { TimePickerConfig } from '../../dist/time-picker.js'
import { convertToDateObject } from '../../dist/util/calendar.js'
import { getPickerFormat, getSectionLayout } from '../../dist/util/date-sections.js'
import type { DateSection, SectionFormat } from '../../dist/util/date-sections.js'
import type Popup from '../../dist/util/popup.js'

const element = document.querySelector('.example') as HTMLElement

// Constructors accept the documented element/config shapes.
const alert = new Alert(element)
const modal = new Modal('#modal', { backdrop: 'static', keyboard: false })
const toast = new Toast(element, { autohide: false, delay: 1000 })
const tooltip = new Tooltip(element, { title: 'Hello', placement: 'top' })
const popover = new Popover(element, { content: 'Hello' })

// Statics carried by every component.
const version: string = Alert.VERSION
const name: string = Modal.NAME
const instance: Alert | null = Alert.getInstance(element)
const orCreated: Alert = Alert.getOrCreateInstance(element)

// Instance methods.
alert.close()
modal.show()
modal.hide()
toast.dispose()
tooltip.update()
popover.setContent({ '.popover-body': 'Updated' })

// Show, hide, toggle and close return a promise that settles once the component
// finishes, so callers can await them instead of listening for `shown.coreui.*`.
const closing: Promise<void> = alert.close()
const modalShowing: Promise<void> = modal.show()
const modalHiding: Promise<void> = modal.hide()
const modalToggling: Promise<void> = modal.toggle()
const toastShowing: Promise<void> = toast.show()
const tooltipToggling: Promise<void> = tooltip.toggle()
const popoverShowing: Promise<void> = popover.show()

// @ts-expect-error — the promise resolves to void, not a component
const wrongResolution: Promise<Modal> = modal.show()

// PRO components.
const calendar = new Calendar(element, { calendars: 2, locale: 'en-US' })
calendar.setConfig({ selectionType: 'week' })

const multiSelect = new MultiSelect(element, { multiple: true, search: true })
const selection = multiSelect.getValue()

const datePicker = new DatePicker(element, { locale: 'en-US' })
datePicker.show()

// Config types ship with the plugins; the calendar's option values are closed sets.
const calendarConfig: Partial<CalendarConfig> = {
  dayFormat: '2-digit',
  disabledDates: [new Date(2026, 0, 1), date => date.getDay() === 0],
  renderDayCell: (date, meta) => (meta?.isToday ? `<b>${date.getDate()}</b>` : String(date.getDate())),
  selectionType: 'week'
}
const pickerConfig: Partial<DatePickerConfig> = { format: 'dd.MM.yyyy', selectionType: 'month' }
const rangePickerConfig: Partial<DateRangePickerConfig> = { calendars: 2, selectionType: 'week' }
const timePickerConfig: Partial<TimePickerConfig> = { locale: 'en-US', seconds: false }
const inputConfigs: [Partial<DateInputConfig>, Partial<TimeInputConfig>, Partial<DateRangeInputConfig>] = [
  { type: 'datetime' }, { seconds: true }, { type: 'date' }
]

// @ts-expect-error — 'weeks' is not a selection type
const typoConfig: Partial<CalendarConfig> = { selectionType: 'weeks' }
// @ts-expect-error — the constructor takes the same config
const typoCalendar = new Calendar(element, { selectionType: 'weeks' })
// @ts-expect-error — and so does setConfig
calendar.setConfig({ selectionType: 'weeks' })
// @ts-expect-error — day labels come from Intl, not a function
const dayFormatFunction: Partial<CalendarConfig> = { dayFormat: (date: Date) => String(date.getDate()) }
// @ts-expect-error — not an Intl month style
const monthFormatTypo: Partial<CalendarConfig> = { monthFormat: 'longg' }
// @ts-expect-error — not an Intl weekday style
const weekdayFormatTypo: Partial<CalendarConfig> = { weekdayFormat: 'wide' }
// @ts-expect-error — disabled dates are dates, date lists or a predicate
const disabledDatesString: Partial<CalendarConfig> = { disabledDates: '2026-01-01' }
// @ts-expect-error — a date field is a date or a date and time
const inputTypeTypo: Partial<DateInputConfig> = { type: 'time' }
// @ts-expect-error — the range field takes the same types
const rangeInputTypeTypo: Partial<DateRangeInputConfig> = { type: 'dattime' }
// @ts-expect-error — the picker's calendar options are the calendar's
const nestedTypo: Partial<DatePickerConfig> = { calendarOptions: { selectionType: 'weeks' } }

new DateInput(element).setConfig(null)

declare const popup: Popup
const popupShown: boolean = popup.isShown
// @ts-expect-error — isShown is a boolean
const popupShownText: string = popup.isShown

// The date and format helpers take unset values the way React and Vue hold them.
const unsetDate: Date | null = convertToDateObject(undefined, 'day')
const nullDate: Date | null = convertToDateObject(null, 'day')
const unsetFormat: SectionFormat = getPickerFormat(undefined, 'month')
const localeLayout: DateSection[] = getSectionLayout(undefined, 'en-US')
// @ts-expect-error — a format is a token string, a function or nothing
const formatTypo: SectionFormat = getPickerFormat(42)

const chipSet = new ChipSet(element, { removable: true })
const values: string[] = chipSet.getValues()
const chip: Chip | null = Chip.getInstance(element)

export {
  alert, calendarConfig, chip, chipSet, closing, datePicker, dayFormatFunction, disabledDatesString, formatTypo,
  inputConfigs, inputTypeTypo, instance, localeLayout, modalHiding, nestedTypo, modalShowing, modalToggling,
  monthFormatTypo, multiSelect, name, nullDate, orCreated,
  pickerConfig, popoverShowing, popupShown, popupShownText, rangeInputTypeTypo, rangePickerConfig, selection,
  timePickerConfig, toast, toastShowing, tooltipToggling, typoCalendar, typoConfig, unsetDate, unsetFormat, values, version,
  weekdayFormatTypo, wrongResolution
}
