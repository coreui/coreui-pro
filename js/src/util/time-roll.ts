/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/time-roll.js
 * License (https://coreui.io/pro/license/)
 *
 * The scrolling-column rendering of the time selection body.
 * --------------------------------------------------------------------------
 */

import EventHandler from '../dom/event-handler.js'
import Manipulator from '../dom/manipulator.js'
import SelectorEngine from '../dom/selector-engine.js'
import TimeSelection from './time-selection.js'
import { getNextActiveElement, isRTL } from './index.js'

/**
 * Constants
 */

const NAME = 'time-roll'

const CLASS_NAME_ROLL = 'time-picker-roll'
const CLASS_NAME_ROLL_CELL = 'time-picker-roll-cell'
const CLASS_NAME_ROLL_COL = 'time-picker-roll-col'
const CLASS_NAME_SELECTED = 'selected'

const ARROW_DOWN_KEY = 'ArrowDown'
const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'
const ARROW_UP_KEY = 'ArrowUp'
const END_KEY = 'End'
const ENTER_KEY = 'Enter'
const HOME_KEY = 'Home'
const SPACE_KEY = 'Space'

const EVENT_KEY = '.coreui.time-selection'
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`

const SELECTOR_ROLL_CELL = `.${CLASS_NAME_ROLL_CELL}`
const SELECTOR_ROLL_CELL_SELECTED = `.${CLASS_NAME_ROLL_CELL}.${CLASS_NAME_SELECTED}`
const SELECTOR_ROLL_COL = `.${CLASS_NAME_ROLL_COL}`

/**
 * Class definition
 */

class TimeRoll extends TimeSelection {
  static override get NAME(): string {
    return NAME
  }

  override _renderBody(): void {
    this._element!.classList.add(CLASS_NAME_ROLL)
    this._renderRoll()
    this._addRollKeyboardNavigation()
  }

  override _stops(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_ROLL_CELL, this._element as HTMLElement)
  }

  override _markPart(part: string, value: string, instant: boolean): void {
    for (const cell of SelectorEngine.find(`[data-coreui-${part}]`, this._element as ParentNode)) {
      const isSelected = String(Manipulator.getDataAttribute(cell, part)) === String(value)
      cell.classList.toggle(CLASS_NAME_SELECTED, isSelected)
      cell.setAttribute('aria-selected', isSelected ? 'true' : 'false')

      if (isSelected && cell.parentElement) {
        this._scrollToSelected(cell.parentElement, cell, instant)
      }
    }
  }

  _renderRoll(): void {
    for (const part of this._parts()) {
      const column = document.createElement('div')
      column.classList.add(CLASS_NAME_ROLL_COL)
      column.setAttribute('role', 'listbox')
      column.setAttribute('aria-label', part.ariaLabel)

      for (const option of part.options) {
        const cell = document.createElement('div')
        cell.classList.add(CLASS_NAME_ROLL_CELL)
        cell.setAttribute('role', 'option')
        cell.setAttribute('aria-label', option.label.toString())
        cell.setAttribute('aria-selected', 'false')
        cell.tabIndex = -1
        cell.textContent = option.label
        Manipulator.setDataAttribute(cell, part.name, (option as HTMLSelectElement).value)

        cell.addEventListener('click', () => this._change(part.name, (option as HTMLSelectElement).value))
        cell.addEventListener('keydown', event => {
          if (event.code === SPACE_KEY || event.key === ENTER_KEY) {
            event.preventDefault()
            this._change(part.name, (option as HTMLSelectElement).value)
            this._moveFocusToColumn(cell, 1)
          }
        })

        column.append(cell)
      }

      this._element!.append(column)
    }
  }

  // A roving tabindex reaches one cell per column with Tab; the rest of the
  // options are only reachable with the arrows.
  _addRollKeyboardNavigation(): void {
    EventHandler.off(this._element, EVENT_KEYDOWN)
    EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_ROLL_CELL, (event: any) => {
      const target = event.target as HTMLElement

      if (event.key === ARROW_DOWN_KEY || event.key === ARROW_UP_KEY) {
        event.preventDefault()
        const items = SelectorEngine.find(SELECTOR_ROLL_CELL, target.parentElement as HTMLElement)

        if (items.length === 0) {
          return
        }

        const nextElement = getNextActiveElement(
          items, target, event.key === ARROW_DOWN_KEY, !items.includes(target)
        )
        nextElement?.focus()
        return
      }

      if (event.key === HOME_KEY || event.key === END_KEY) {
        event.preventDefault()
        const items = SelectorEngine.find(SELECTOR_ROLL_CELL, target.parentElement as HTMLElement)

        if (items.length === 0) {
          return
        }

        items[event.key === HOME_KEY ? 0 : items.length - 1].focus()
        return
      }

      if (event.key === ARROW_LEFT_KEY || event.key === ARROW_RIGHT_KEY) {
        event.preventDefault()
        const rtl = isRTL(target)
        const goLeft = (event.key === ARROW_LEFT_KEY && !rtl) || (event.key === ARROW_RIGHT_KEY && rtl)
        this._moveFocusToColumn(target, goLeft ? -1 : 1)
      }
    })
  }

  _moveFocusToColumn(cell: HTMLElement, offset: number): void {
    const columns = SelectorEngine.find(SELECTOR_ROLL_COL, this._element as HTMLElement)
    const index = columns.indexOf(cell.parentElement as HTMLElement) + offset

    if (index < 0 || index > columns.length - 1) {
      return
    }

    this._entryCell(columns[index])?.focus()
  }

  _entryCell(column: HTMLElement): HTMLElement | null {
    return SelectorEngine.findOne(SELECTOR_ROLL_CELL_SELECTED, column) ??
      SelectorEngine.findOne(SELECTOR_ROLL_CELL, column)
  }

  // v1 scrolls the selected cell into view — without it a value like 14:30 marks
  // a minute cell that sits below the visible part of the column.
  _scrollToSelected(column: any, cell: any, instant?: boolean): void {
    column.scrollTo({ behavior: instant ? 'instant' : 'smooth', top: cell.offsetTop })
  }
}

export default TimeRoll
