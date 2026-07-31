/**
 * --------------------------------------------------------------------------
 * CoreUI util/backdrop.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's util/backdrop.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import EventHandler from '../dom/event-handler.js'
import Config, { type ComponentConfig } from './config.js'
import {
  execute, executeAfterTransition, getElement, reflow
} from './index.js'

/**
 * Constants
 */

const NAME = 'backdrop'
const CLASS_NAME_FADE = 'fade'
const CLASS_NAME_SHOW = 'show'
const EVENT_MOUSEDOWN = `mousedown.coreui.${NAME}`

const Default: BackdropConfig = {
  className: 'modal-backdrop',
  clickCallback: null,
  isAnimated: false,
  isVisible: true, // if false, we use the backdrop helper without adding any element to the dom
  rootElement: 'body' // give the choice to place backdrop under different elements
}

const DefaultType = {
  className: 'string',
  clickCallback: '(function|null)',
  isAnimated: 'boolean',
  isVisible: 'boolean',
  rootElement: '(element|string)'
}

/**
 * Types
 */

type BackdropConfig = {
  className: string
  clickCallback: (() => void) | null
  isAnimated: boolean
  isVisible: boolean
  // _configAfterMerge() resolves this through getElement(), so by the time
  // anything reads it the value is an element. Typed loosely because the
  // default is the string 'body' and narrowing it at the use site would need a
  // parenthesised cast, which collides with ASI on the line above.
  rootElement: any
}

/**
 * Class definition
 */

class Backdrop extends Config {
  protected declare _config: BackdropConfig
  protected declare _isAppended: boolean
  protected declare _element: HTMLElement | null

  constructor(config?: Partial<BackdropConfig> | null) {
    super()
    this._config = this._getConfig(config) as BackdropConfig
    this._isAppended = false
    this._element = null
  }

  // Getters
  static override get Default(): BackdropConfig {
    return Default
  }

  static override get DefaultType(): Record<string, string> {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  show(callback?: () => void): void {
    if (!this._config.isVisible) {
      execute(callback)
      return
    }

    this._append()

    const element = this._getElement()
    if (this._config.isAnimated) {
      reflow(element)
    }

    element.classList.add(CLASS_NAME_SHOW)

    this._emulateAnimation(() => {
      execute(callback)
    })
  }

  hide(callback?: () => void): void {
    if (!this._config.isVisible) {
      execute(callback)
      return
    }

    this._getElement().classList.remove(CLASS_NAME_SHOW)

    this._emulateAnimation(() => {
      this.dispose()
      execute(callback)
    })
  }

  dispose(): void {
    if (!this._isAppended) {
      return
    }

    EventHandler.off(this._element, EVENT_MOUSEDOWN)

    this._element!.remove()
    this._isAppended = false
  }

  // Private
  _getElement(): HTMLElement {
    if (!this._element) {
      const backdrop = document.createElement('div')
      backdrop.className = this._config.className
      if (this._config.isAnimated) {
        backdrop.classList.add(CLASS_NAME_FADE)
      }

      this._element = backdrop
    }

    return this._element
  }

  override _configAfterMerge(config: ComponentConfig): ComponentConfig {
    // use getElement() with the default "body" to get a fresh Element on each instantiation
    config.rootElement = getElement(config.rootElement)
    return config
  }

  _append(): void {
    if (this._isAppended) {
      return
    }

    const element = this._getElement()
    this._config.rootElement.append(element)

    EventHandler.on(element, EVENT_MOUSEDOWN, () => {
      execute(this._config.clickCallback)
    })

    this._isAppended = true
  }

  _emulateAnimation(callback?: () => void): void {
    executeAfterTransition(callback as () => void, this._getElement(), this._config.isAnimated)
  }
}

export default Backdrop
