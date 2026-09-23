/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-selection/selects.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import SelectorEngine from '../dom/selector-engine.js'
import { CLOCK_ICON } from '../util/icons.js'
import { isRTL } from '../util/index.js'
import TimeSelection from './base.js'

/**
 * Constants
 */

const NAME = 'time-selects'

const CLASS_NAME_TIME_ICON = 'date-picker-time-icon'
const CLASS_NAME_TIME_SELECT = 'date-picker-time-select'

const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'

const SELECTOR_TIME_SELECT = `select.${CLASS_NAME_TIME_SELECT}`

/**
 * Class definition
 */

class TimeSelects extends TimeSelection {
  static override get NAME(): string {
    return NAME
  }

  override _renderBody(): void {
    this._renderSelects()
  }

  override _stops(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_TIME_SELECT, this._element as HTMLElement)
  }

  override _markPart(part: string, value: string): void {
    const select = SelectorEngine.findOne(`select.${part}`, this._element as ParentNode)

    if (select) {
      (select as HTMLSelectElement).value = value
    }
  }

  _renderSelects(): void {
    const icon = document.createElement('span')
    icon.classList.add(CLASS_NAME_TIME_ICON)
    icon.setAttribute('aria-hidden', 'true')
    icon.innerHTML = CLOCK_ICON
    this._element!.append(icon)

    for (const [index, part] of this._parts().entries()) {
      if (index > 0 && part.name !== 'meridiem') {
        const separator = document.createElement('span')
        separator.setAttribute('aria-hidden', 'true')
        separator.textContent = ':'
        this._element!.append(separator)
      }

      const select = document.createElement('select')
      select.classList.add(CLASS_NAME_TIME_SELECT, part.name)
      select.setAttribute('aria-label', part.ariaLabel)
      select.addEventListener('change', event => this._change(part.name, (event.target as HTMLSelectElement).value))
      select.addEventListener('keydown', event => {
        if (event.key !== ARROW_LEFT_KEY && event.key !== ARROW_RIGHT_KEY) {
          return
        }

        event.preventDefault()
        const rtl = isRTL(select)
        const goLeft = (event.key === ARROW_LEFT_KEY && !rtl) || (event.key === ARROW_RIGHT_KEY && rtl)
        const list = SelectorEngine.find(SELECTOR_TIME_SELECT, this._element as HTMLElement)
        const index = list.indexOf(select) + (goLeft ? -1 : 1)

        if (index < 0 || index > list.length - 1) {
          return
        }

        list[index].focus()
      })

      for (const option of part.options) {
        const optionEl = document.createElement('option')
        optionEl.value = (option as HTMLSelectElement).value
        optionEl.textContent = option.label
        select.append(optionEl)
      }

      this._element!.append(select)
    }
  }
}

export default TimeSelects
