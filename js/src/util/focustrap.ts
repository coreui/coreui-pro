/**
 * --------------------------------------------------------------------------
 * CoreUI util/focustrap.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's util/focustrap.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import SelectorEngine from '../dom/selector-engine.js'
import Config from './config.js'
import { isDisabled, isVisible } from './index.js'

/**
 * Constants
 */

const NAME = 'focustrap'
const ATTRIBUTE_GUARD = 'data-coreui-focus-guard'
const GUARD_STYLE = 'border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:fixed;white-space:nowrap;width:1px;top:0;left:0'

const Default: FocusTrapConfig = {
  additionalElement: null,
  autofocus: true,
  trapElement: null // The element to trap focus inside of
}

const DefaultType = {
  additionalElement: '(element|null|undefined)',
  autofocus: 'boolean',
  trapElement: 'element'
}

/**
 * Types
 */

type FocusTrapConfig = {
  additionalElement: HTMLElement | null
  autofocus: boolean
  trapElement: HTMLElement | null
}

/**
 * Class definition
 */

class FocusTrap extends Config {
  protected declare _config: FocusTrapConfig
  protected declare _isActive: boolean
  protected declare _regions: HTMLElement[]
  protected declare _guards: HTMLElement[]

  constructor(config?: Partial<FocusTrapConfig> | null) {
    super()
    this._config = this._getConfig(config) as FocusTrapConfig
    this._isActive = false
    this._regions = []
    this._guards = []
  }

  // Getters
  static override get Default(): FocusTrapConfig {
    return Default
  }

  static override get DefaultType(): Record<string, string> {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  activate(): void {
    if (this._isActive) {
      return
    }

    const { additionalElement, trapElement } = this._config

    if (this._config.autofocus) {
      trapElement!.focus()
    }

    this._regions = [trapElement!]

    if (additionalElement && !trapElement!.contains(additionalElement) && !additionalElement.contains(trapElement!)) {
      this._regions.push(additionalElement)
    }

    for (const [index, region] of this._regions.entries()) {
      region.before(this._createGuard(index, false))
      region.after(this._createGuard(index, true))
    }

    this._isActive = true
  }

  deactivate(): void {
    if (!this._isActive) {
      return
    }

    this._isActive = false

    for (const guard of this._guards) {
      guard.remove()
    }

    this._guards = []
    this._regions = []
  }

  // Private
  _createGuard(index: number, after: boolean): HTMLElement {
    const guard = document.createElement('span')
    guard.tabIndex = 0
    guard.setAttribute('aria-hidden', 'true')
    guard.setAttribute(ATTRIBUTE_GUARD, '')
    guard.style.cssText = GUARD_STYLE
    guard.addEventListener('focus', event => this._handleGuardFocus(event, index, after))
    this._guards.push(guard)
    return guard
  }

  // Focus from inside a region, or from nowhere (an iframe), wraps; from the page it enters.
  _handleGuardFocus(event: FocusEvent, index: number, after: boolean): void {
    const related = event.relatedTarget as Node | null
    const regions = this._regions
    const wraps = !related || regions.some(region => region.contains(related))
    const forward = after === wraps
    const step = forward ? 1 : -1
    let current = wraps ? index + step : index

    for (let tries = 0; tries < regions.length; tries++, current += step) {
      const region = regions[(current + regions.length) % regions.length]
      const elements = this._elements(region)

      if (this._focusFirst(forward ? elements : elements.toReversed())) {
        return
      }

      if (region.tabIndex === -1 && this._focus(region)) {
        return
      }
    }

    (event.target as HTMLElement).blur()
  }

  // The additional element can be a container of focusables, or one itself.
  _elements(region: HTMLElement): HTMLElement[] {
    const children = SelectorEngine.focusableChildren(region)
    const itself = region.tabIndex >= 0 && !isDisabled(region) && isVisible(region)

    return itself ? [region, ...children] : children
  }

  _focusFirst(elements: HTMLElement[]): boolean {
    return elements.some(element => this._focus(element))
  }

  _focus(element: HTMLElement): boolean {
    element.focus()
    return (element.getRootNode() as Document | ShadowRoot).activeElement === element
  }
}

export default FocusTrap
