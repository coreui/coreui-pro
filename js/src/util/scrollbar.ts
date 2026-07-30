/**
 * --------------------------------------------------------------------------
 * CoreUI util/scrollBar.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's util/scrollBar.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import Manipulator from '../dom/manipulator.js'
import SelectorEngine from '../dom/selector-engine.js'
import { isElement } from './index.js'

/**
 * Constants
 */

const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'
const SELECTOR_STICKY_CONTENT = '.sticky-top'
const PROPERTY_PADDING = 'padding-right'
const PROPERTY_MARGIN = 'margin-right'

/**
 * Class definition
 */

class ScrollBarHelper {
  private declare _element: HTMLElement

  constructor() {
    this._element = document.body
  }

  // Public
  getWidth(): number {
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
    const documentWidth = document.documentElement.clientWidth
    return Math.abs(window.innerWidth - documentWidth)
  }

  hide(): void {
    const width = this.getWidth()
    this._disableOverFlow()
    // give padding to element to balance the hidden scrollbar width
    this._setElementAttributes(this._element, PROPERTY_PADDING, calculatedValue => calculatedValue + width)
    // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth
    this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, calculatedValue => calculatedValue + width)
    this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, calculatedValue => calculatedValue - width)
  }

  reset(): void {
    this._resetElementAttributes(this._element, 'overflow')
    this._resetElementAttributes(this._element, PROPERTY_PADDING)
    this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING)
    this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN)
  }

  isOverflowing(): boolean {
    return this.getWidth() > 0
  }

  // Private
  _disableOverFlow(): void {
    this._saveInitialAttribute(this._element, 'overflow')
    this._element.style.overflow = 'hidden'
  }

  _setElementAttributes(selector: string | HTMLElement, styleProperty: string, callback: (calculatedValue: number) => number): void {
    const scrollbarWidth = this.getWidth()
    const manipulationCallBack = (element: HTMLElement) => {
      if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
        return
      }

      this._saveInitialAttribute(element, styleProperty)
      const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty)
      element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`)
    }

    this._applyManipulationCallback(selector, manipulationCallBack)
  }

  _saveInitialAttribute(element: HTMLElement, styleProperty: string): void {
    const actualValue = element.style.getPropertyValue(styleProperty)
    if (actualValue) {
      Manipulator.setDataAttribute(element, styleProperty, actualValue)
    }
  }

  _resetElementAttributes(selector: string | HTMLElement, styleProperty: string): void {
    const manipulationCallBack = (element: HTMLElement) => {
      const value = Manipulator.getDataAttribute(element, styleProperty)
      // We only want to remove the property if the value is `null`; the value can also be zero
      if (value === null) {
        element.style.removeProperty(styleProperty)
        return
      }

      Manipulator.removeDataAttribute(element, styleProperty)
      element.style.setProperty(styleProperty, value as string)
    }

    this._applyManipulationCallback(selector, manipulationCallBack)
  }

  _applyManipulationCallback(selector: string | HTMLElement, callBack: (element: HTMLElement) => void): void {
    if (isElement(selector)) {
      callBack(selector)
      return
    }

    for (const sel of SelectorEngine.find(selector, this._element)) {
      callBack(sel)
    }
  }
}

export default ScrollBarHelper
