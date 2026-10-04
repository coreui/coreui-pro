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
  Alert, Autocomplete, Calendar, Chip, ChipInput, ChipSet, Combobox, ContextMenu, DateInput, DatePicker, DateRangeInput,
  DateRangePicker, Dialog, Drawer, Dropdown, ListBox, LoadingButton, Menu, Modal, MultiSelect, Navigation, Offcanvas,
  OTPInput, Popover, Range, RangeSlider, Rating, SearchButton, Stepper, Tab, TimeInput, TimePicker, Toast, Toaster,
  Tooltip, Transfer
} from '../../dist/index.js'
import type { AutocompleteConfig } from '../../dist/autocomplete.js'
import type { CalendarConfig } from '../../dist/calendar.js'
import type { DateInputConfig } from '../../dist/date-input.js'
import type { DatePickerConfig } from '../../dist/date-picker.js'
import type { DateRangeInputConfig } from '../../dist/date-range-input.js'
import type { DateRangePickerConfig } from '../../dist/date-range-picker.js'
import type { ModalConfig } from '../../dist/modal.js'
import type { MultiSelectConfig } from '../../dist/multi-select.js'
import type { NumberInputConfig } from '../../dist/number-input.js'
import type { PasswordInputConfig } from '../../dist/password-input.js'
import type { RatingConfig } from '../../dist/rating.js'
import type { TimeInputConfig } from '../../dist/time-input.js'
import type { TimePickerConfig } from '../../dist/time-picker.js'
import { convertToDateObject } from '../../dist/util/calendar.js'
import { getPickerFormat, getSectionLayout } from '../../dist/util/date-sections.js'
import type { DateSection, SectionFormat } from '../../dist/util/date-sections.js'
import type Popup from '../../dist/util/popup.js'
import { getRatioAt, sanitizeValue } from '../../dist/util/range.js'

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

// The range helpers take a pointer position and return plain numbers.
const pressRatio: number = getRatioAt({ clientX: 0, clientY: 0 }, element.getBoundingClientRect(), 16, false, false)
const sanitizedValue: number = sanitizeValue(52, 0, 100, 5)
const unroundedValue: number = sanitizeValue(52, 0, 100, 'any')
// @ts-expect-error — the step is a number or 'any'
const stepTypo: number = sanitizeValue(52, 0, 100, '5')

const chipSet = new ChipSet(element, { removable: true })
const values: string[] = chipSet.getValues()
const chip: Chip | null = Chip.getInstance(element)

// A component with a config type takes only its own options, through the
// constructor, getOrCreateInstance and setConfig alike.
const unknownOptions = [
  // @ts-expect-error — not a chip option
  new Chip(element, { removeable: true }),
  // @ts-expect-error — not a chip set option
  new ChipSet(element, { removeable: true }),
  // @ts-expect-error — not a combobox option
  new Combobox(element, { searchable: true }),
  // @ts-expect-error — not a date input option
  new DateInput(element, { formatt: 'dd.MM.yyyy' }),
  // @ts-expect-error — not a list box option
  new ListBox(element, { multi: true }),
  // @ts-expect-error — not a menu option
  new Menu(element, { autoclose: true }),
  // @ts-expect-error — not a popover option
  new Popover(element, { contents: 'Hello' }),
  // @ts-expect-error — not a range option
  new Range(element, { steps: 5 }),
  // @ts-expect-error — not a range slider option
  new RangeSlider(element, { steps: 5 }),
  // @ts-expect-error — not a time input option
  new TimeInput(element, { second: true }),
  // @ts-expect-error — not a toast option
  new Toast(element, { autoHide: false }),
  // @ts-expect-error — not a toaster option
  new Toaster(element, { position: 'top' }),
  // @ts-expect-error — a toaster placement is an edge and an alignment
  new Toaster(element, { placement: 'top-right' }),
  // @ts-expect-error — not a tooltip option
  new Tooltip(element, { titel: 'Hello' }),
  // @ts-expect-error — not a transfer option
  new Transfer(element, { searchable: true }),
  // @ts-expect-error — getOrCreateInstance takes the constructor's options
  Tooltip.getOrCreateInstance(element, { titel: 'Hello' }),
  // @ts-expect-error — and so does a field's setConfig
  new TimeInput(element).setConfig({ second: true }),
  // @ts-expect-error — and the one-time password field's
  new OTPInput(element).setConfig({ lenght: 4 })
]

// Every component with options type-checks them.
const otherOptions = [
  new Autocomplete(element, { optionsTemplate: option => `<b>${option.text}</b>`, search: ['external', 'global'] }),
  new ChipInput(element, { maxChips: 3, selectionMode: 'single' }),
  new ContextMenu(element, { autoClose: 'outside' }),
  new Dialog(element, { backdrop: 'static' }),
  new Drawer(element, { scroll: true }),
  new Dropdown(element, { autoClose: false, placement: 'bottom-end' }),
  new LoadingButton(element, { spinnerType: 'grow', timeout: 2000 }),
  new MultiSelect(element, { selectedLabel: (count, total) => `${count}/${total}`, selectionType: 'counter' }),
  new Navigation(element, { groupsAutoCollapse: false }),
  new Offcanvas(element, { backdrop: false }),
  new Rating(element, { activeIcon: { 1: '<b>1</b>' }, value: 3 }),
  new SearchButton(element, { shortcut: 'ctrl+k' }),
  new Stepper(element, { linear: false }),
  // @ts-expect-error — not an autocomplete option
  new Autocomplete(element, { searchable: true }),
  // @ts-expect-error — not a chip input option
  new ChipInput(element, { maxChip: 3 }),
  // @ts-expect-error — not a context menu option
  new ContextMenu(element, { autoclose: 'outside' }),
  // @ts-expect-error — not a backdrop value
  new Dialog(element, { backdrop: 'statik' }),
  // @ts-expect-error — not a drawer option
  new Drawer(element, { scrolling: true }),
  // @ts-expect-error — not a dropdown option
  new Dropdown(element, { autoclose: false }),
  // @ts-expect-error — not a spinner type
  new LoadingButton(element, { spinnerType: 'dots' }),
  // @ts-expect-error — not a modal option
  new Modal(element, { backdorp: 'static' }),
  // @ts-expect-error — not a selection type
  new MultiSelect(element, { selectionType: 'pills' }),
  // @ts-expect-error — not a navigation option
  new Navigation(element, { autoCollapse: false }),
  // @ts-expect-error — not an offcanvas option
  new Offcanvas(element, { scrolling: true }),
  // @ts-expect-error — not a rating option
  new Rating(element, { valu: 3 }),
  // @ts-expect-error — not a search button option
  new SearchButton(element, { shortcuts: 'ctrl+k' }),
  // @ts-expect-error — not a stepper option
  new Stepper(element, { liner: false }),
  // @ts-expect-error — setConfig takes the same options
  new Autocomplete(element).setConfig({ searchable: true }),
  // @ts-expect-error — and so does the multi select's
  new MultiSelect(element).setConfig({ selectionType: 'pills' }),
  // @ts-expect-error — and the rating's
  new Rating(element).setConfig({ valu: 3 })
]

const exportedConfigs: [
  Partial<AutocompleteConfig>, Partial<ModalConfig>, Partial<MultiSelectConfig>, Partial<NumberInputConfig>,
  Partial<PasswordInputConfig>, Partial<RatingConfig>
] = [{ search: 'global' }, { keyboard: false }, { search: true }, { repeat: false }, { ariaToggleLabel: 'Show' }, { itemCount: 10 }]

// A component without options still takes an empty object.
const tab: Tab = Tab.getOrCreateInstance(element, {})

// A field takes its own options on top of the shared ones.
const ownOptions = [
  new DateInput(element, { seconds: true, type: 'datetime' }),
  new TimeInput(element, { seconds: true }),
  new OTPInput(element, { placeholder: 0, value: 123456 })
]

// A composite also takes the options of the parts it forwards them to.
const forwardedOptions = [
  new DatePicker(element, { ariaDayLabel: 'Tag', firstDayOfWeek: 0, hours: [9, 10] }),
  new DateRangePicker(element, { ariaDayLabel: 'Tag', firstDayOfWeek: 0 }),
  new DateRangeInput(element, { ariaDayLabel: 'Tag', monthNames: null }),
  new TimePicker(element, { ariaSelectHoursLabel: 'Stunden', hourPlaceholder: '--', hours: [9, 10] }),
  DatePicker.getOrCreateInstance(element, { firstDayOfWeek: 0 }),
  // The picker's own option wins over a part's option of the same name.
  new DatePicker(element, { seconds: [0, 30] }),
  new TimePicker(element, { seconds: [0, 30] }),
  // The range picker's input options reach the two date inputs.
  new DateRangePicker(element, { inputOptions: { ariaLabel: 'Trip dates' } }),
  // @ts-expect-error — and so they are date input options, not range input ones
  new DateRangePicker(element, { inputOptions: { startName: 'from' } }),
  // @ts-expect-error — not an option of the picker or of its parts
  new DatePicker(element, { firstDayOfWek: 0 }),
  // @ts-expect-error — the range input has no calendar
  new DateRangeInput(element, { firstDayOfWeek: 0 }),
  // @ts-expect-error — the range input names its fields startName and endName
  new DateRangePicker(element, { name: 'range' }),
  // @ts-expect-error — the time picker has no calendar
  new TimePicker(element, { firstDayOfWeek: 0 }),
  // @ts-expect-error — the time columns refuse a numeric limit, so the picker does
  new TimePicker(element, { minDate: 5 })
]

// An option the composite always sets on its part is not taken from the caller.
const setByComposite = [
  // @ts-expect-error — the date picker sets its calendar's start date
  new DatePicker(element, { startDate: new Date() }),
  // @ts-expect-error — the range picker sets its calendar's range mode
  new DateRangePicker(element, { range: false }),
  // @ts-expect-error — the time picker listens to its columns itself
  new TimePicker(element, { onChange: () => null }),
  // @ts-expect-error — the range input names and fills its two fields
  new DateRangeInput(element, { name: 'when' })
]

export {
  alert, calendarConfig, chip, chipSet, closing, datePicker, dayFormatFunction, disabledDatesString, formatTypo, forwardedOptions,
  exportedConfigs, otherOptions, ownOptions, setByComposite, tab,
  inputConfigs, inputTypeTypo, instance, localeLayout, modalHiding, nestedTypo, modalShowing, modalToggling,
  monthFormatTypo, multiSelect, name, nullDate, orCreated,
  pickerConfig, popoverShowing, popupShown, popupShownText, pressRatio, rangeInputTypeTypo, rangePickerConfig, sanitizedValue,
  selection, stepTypo, timePickerConfig, toast, toastShowing, tooltipToggling, typoCalendar, typoConfig, unknownOptions, unroundedValue, unsetDate,
  unsetFormat, values, version,
  weekdayFormatTypo, wrongResolution
}
