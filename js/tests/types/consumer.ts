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
  Alert, Calendar, Chip, ChipSet, DatePicker, Modal, MultiSelect, Popover, Toast, Tooltip
} from '../../dist/index.js'

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
calendar.update({ selectionType: 'week' })

const multiSelect = new MultiSelect(element, { multiple: true, search: true })
const selection = multiSelect.getValue()

const datePicker = new DatePicker(element, { locale: 'en-US' })
datePicker.show()

const chipSet = new ChipSet(element, { removable: true })
const values: string[] = chipSet.getValues()
const chip: Chip | null = Chip.getInstance(element)

export {
  alert, chip, chipSet, closing, datePicker, instance, modalHiding, modalShowing, modalToggling, multiSelect, name,
  orCreated, popoverShowing, selection, toast, toastShowing, tooltipToggling, values, version, wrongResolution
}
