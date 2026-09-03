/**
 * --------------------------------------------------------------------------
 * CoreUI PRO stepper.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import {
  defineJQueryPlugin, getNextActiveElement, getUID, isDisabled
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'stepper'
const DATA_KEY = 'coreui.stepper'
const EVENT_KEY = `.${DATA_KEY}`

const EVENT_FINISH = `finish${EVENT_KEY}`
const EVENT_RESET = `reset${EVENT_KEY}`
const EVENT_STEP_CHANGE = `stepChange${EVENT_KEY}`
const EVENT_STEP_VALIDATION_COMPLETE = `stepValidationComplete${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}`

const CLASS_NAME_ACTIVE = 'active'
const CLASS_NAME_COMPLETE = 'complete'
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_STEPPER_STEP_CONNECTOR = 'stepper-step-connector'
const CLASS_NAME_STEPPER_STEP_INDICATOR_ICON = 'stepper-step-indicator-icon'
const CLASS_NAME_STEPPER_STEP_INDICATOR_TEXT = 'stepper-step-indicator-text'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="stepper"]'
const SELECTOR_FORM_VALIDATE_VALID = '[data-coreui-validate~="valid"]'
const SELECTOR_STEPPER = '.stepper'
const SELECTOR_STEPPER_ACTION = '[data-coreui-stepper-action]'
const SELECTOR_STEPPER_STEP = '.stepper-step'
const SELECTOR_STEPPER_STEP_BUTTON = '.stepper-step-button'
const SELECTOR_STEPPER_STEP_CONTENT = '.stepper-step-content'
const SELECTOR_STEPPER_STEP_INDICATOR = '.stepper-step-indicator'
const SELECTOR_STEPPER_STEP_INDICATOR_ICON = '.stepper-step-indicator-icon'
const SELECTOR_STEPPER_STEPS = '.stepper-steps'
const SELECTOR_STEPPER_PANE = '.stepper-pane'

const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'
const ARROW_UP_KEY = 'ArrowUp'
const ARROW_DOWN_KEY = 'ArrowDown'
const HOME_KEY = 'Home'
const END_KEY = 'End'

const Default = {
  linear: true,
  skipValidation: false
}

const DefaultType = {
  linear: 'boolean',
  skipValidation: 'boolean'
}

/**
 * Class definition
 */

class Stepper extends BaseComponent {
  protected declare _stepButtons: HTMLButtonElement[]
  protected declare _activeStepButton: HTMLButtonElement
  protected declare _initialStepButton: HTMLButtonElement
  protected declare _isFinished: boolean
  protected declare _validatedForms: Set<HTMLFormElement>

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._stepButtons = this._getStepButtons()
    this._activeStepButton = this._getActiveElem()
    this._initialStepButton = this._activeStepButton
    this._isFinished = false
    this._validatedForms = new Set()

    this._addStepperConnector()
    this._resetPanes(this._getTargetPane(this._activeStepButton))
    this._wrapIndicatorText()
    this._setInitialComplete()
    this._updateStepButtonsDisabledState()
    this._setupAccessibilityAttributes()

    EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_STEPPER_STEP_BUTTON, event => this._keydown(event))
  }

  // Getters
  static override get Default(): typeof Default {
    return Default
  }

  static override get DefaultType(): typeof DefaultType {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  showStep(buttonOrStepNumber: HTMLButtonElement | number): void {
    let button = buttonOrStepNumber as HTMLButtonElement

    if (typeof buttonOrStepNumber === 'number') {
      button = this._stepButtons[buttonOrStepNumber - 1]
    }

    if (!button) {
      return
    }

    const active = this._getActiveElem()

    if (active && !this._isCurrentStepValid(active)) {
      return
    }

    if (this._elemIsActive(button)) {
      return
    }

    if (this._config.linear) {
      const steps = this._getEnabledStepButtons()
      const targetIndex = steps.indexOf(button)
      const activeIndex = steps.indexOf(active)

      if (targetIndex > activeIndex + 1) {
        return
      }
    }

    const index = this._stepButtons.indexOf(button) + 1
    EventHandler.trigger(this._element, EVENT_STEP_CHANGE, { index })

    this._activeStepButton = button
    this._deactivate(active)
    this._activate(button)
    this._updateStepButtonsDisabledState()
    this._complete(button)
  }

  next(): void {
    if (this._isFinished) {
      return
    }

    if (!this._isCurrentStepValid(this._getActiveElem())) {
      return
    }

    const steps = this._getEnabledStepButtons()
    const active = this._getActiveElem()
    const index = steps.indexOf(active)
    const next = steps[index + 1]

    if (next) {
      this.showStep(next)
    }
  }

  prev(): void {
    if (this._isFinished) {
      return
    }

    const steps = this._getEnabledStepButtons()
    const active = this._getActiveElem()
    const index = steps.indexOf(active)
    const prev = steps[index - 1]

    if (prev) {
      this.showStep(prev)
    }
  }

  finish(): void {
    if (this._isFinished) {
      return
    }

    if (!this._isCurrentStepValid(this._getActiveElem())) {
      return
    }

    const steps = this._getEnabledStepButtons()
    const active = this._getActiveElem()
    const index = steps.indexOf(active)

    if (index !== steps.length - 1) {
      const next = steps[index + 1]
      if (next) {
        this.showStep(next)
      }

      return
    }

    const finishHandler = () => {
      active.classList.remove(CLASS_NAME_ACTIVE)
      this._markAsComplete(active)
      EventHandler.trigger(this._element, EVENT_FINISH)
      this._isFinished = true
      this._disableStepButtons()
    }

    const pane = this._getTargetPane(active)
    const stepContent = active.parentNode!.querySelector(SELECTOR_STEPPER_STEP_CONTENT)

    if (pane) {
      pane.classList.remove(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW)
      finishHandler()
    } else if (stepContent) {
      this._animateHeight(stepContent, false, finishHandler)
    } else {
      finishHandler()
    }
  }

  reset(): void {
    if (!this._stepButtons.length) {
      return
    }

    for (const pane of SelectorEngine.find(SELECTOR_STEPPER_PANE, this._element as ParentNode)) {
      pane.classList.remove(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW)
      pane.setAttribute('aria-hidden', 'true')
    }

    for (const content of SelectorEngine.find(SELECTOR_STEPPER_STEP_CONTENT, this._element as ParentNode)) {
      content.classList.remove(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW)
      content.setAttribute('aria-hidden', 'true')
    }

    for (const btn of this._stepButtons) {
      btn.classList.remove(CLASS_NAME_ACTIVE, CLASS_NAME_COMPLETE)
      this._removeIndicatorIcon(btn)
    }

    for (const form of this._element.querySelectorAll(`${SELECTOR_STEPPER_PANE} form, ${SELECTOR_STEPPER_STEP_CONTENT} form`)) {
      (form as HTMLFormElement).reset()
    }

    for (const form of this._validatedForms) {
      for (const control of form.elements) {
        control.classList.remove(CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID)
      }
    }

    const firstStep = this._initialStepButton || this._stepButtons[0]
    firstStep.classList.add(CLASS_NAME_ACTIVE)

    const pane = this._getTargetPane(firstStep)
    if (pane) {
      pane.classList.add(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW)
      pane.setAttribute('aria-hidden', 'false')
    } else {
      const stepContent = firstStep.parentNode!.querySelector(SELECTOR_STEPPER_STEP_CONTENT)
      if (stepContent) {
        stepContent.classList.add(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW)
        stepContent.setAttribute('aria-hidden', 'false')
      }
    }

    this._updateCompleteStates(this._stepButtons.indexOf(firstStep))

    this._activeStepButton = firstStep
    this._isFinished = false
    this._updateStepButtonsDisabledState()
    EventHandler.trigger(this._element, EVENT_RESET)
  }

  override dispose(): void {
    for (const form of this._validatedForms) {
      EventHandler.off(form, EVENT_INPUT)
    }

    super.dispose()
  }

  // Private
  _getStepButtons(): HTMLButtonElement[] {
    return SelectorEngine.find(SELECTOR_STEPPER_STEP_BUTTON, this._element as ParentNode) as HTMLButtonElement[]
  }

  _getEnabledStepButtons(): HTMLButtonElement[] {
    return this._getStepButtons().filter(el => !isDisabled(el))
  }

  _getActiveElem(): HTMLButtonElement {
    return (this._stepButtons.find(child => this._elemIsActive(child)) || null) as HTMLButtonElement
  }

  _getTargetPane(element: any): HTMLElement | null {
    return SelectorEngine.getElementFromSelector(element)
  }

  _elemIsActive(elem: HTMLElement): boolean {
    return elem.classList.contains(CLASS_NAME_ACTIVE)
  }

  _isCurrentStepValid(element: any): boolean {
    if (this._config.skipValidation) {
      return true
    }

    const pane = this._getTargetPane(element)
    const target = pane ?? element.parentNode.querySelector(SELECTOR_STEPPER_STEP_CONTENT)

    if (!target) {
      return true
    }

    const form = target.querySelector('form')
    if (!form) {
      return true
    }

    const isValid = form.checkValidity()

    EventHandler.trigger(this._element, EVENT_STEP_VALIDATION_COMPLETE, {
      stepIndex: this._stepButtons.indexOf(element) + 1,
      isValid
    })

    if (!isValid) {
      if (form.noValidate) {
        this._showValidationState(form)
      } else {
        form.reportValidity()
      }

      return false
    }

    return true
  }

  _showValidationState(form: HTMLFormElement): void {
    for (const control of form.elements) {
      this._updateControlValidationState(control, form)
    }

    if (!this._validatedForms.has(form)) {
      this._validatedForms.add(form)
      EventHandler.on(form, EVENT_INPUT, (event: any) => this._updateControlValidationState(event.target, form))
    }
  }

  _updateControlValidationState(control: any, form: HTMLFormElement): void {
    if (!control.willValidate || ['button', 'reset', 'submit'].includes(control.type)) {
      return
    }

    control.classList.toggle(CLASS_NAME_IS_INVALID, !control.validity.valid)
    control.classList.toggle(CLASS_NAME_IS_VALID, control.validity.valid && form.matches(SELECTOR_FORM_VALIDATE_VALID))
  }

  _activate(element: any): void {
    if (!element) {
      return
    }

    element.classList.add(CLASS_NAME_ACTIVE)
    element.setAttribute('aria-selected', 'true')
    element.setAttribute('tabIndex', '0')

    const pane = this._getTargetPane(element)

    if (pane) {
      pane.classList.add(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW)
      pane.setAttribute('aria-hidden', 'false')
    }

    const stepContentElement = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_CONTENT, element.parentNode)
    if (stepContentElement) {
      this._animateHeight(stepContentElement, true)
    }
  }

  _deactivate(element: any): void {
    this._resetPanes()

    if (!element) {
      return
    }

    element.setAttribute('aria-selected', 'false')
    element.setAttribute('tabIndex', '-1')

    const stepContentElement = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_CONTENT, element.parentNode)
    if (stepContentElement) {
      this._animateHeight(stepContentElement, false, () => element.classList.remove(CLASS_NAME_ACTIVE))
    } else {
      element.classList.remove(CLASS_NAME_ACTIVE)
    }
  }

  _complete(activeBtn: HTMLElement): void {
    const stepsContainer = activeBtn.closest(SELECTOR_STEPPER_STEPS) || document
    const steps = SelectorEngine.find(SELECTOR_STEPPER_STEP, stepsContainer)
    const activeStepIdx = steps.indexOf(activeBtn.parentNode as HTMLElement)

    if (activeStepIdx === -1) {
      return
    }

    this._updateCompleteStates(activeStepIdx)
  }

  _markAsComplete(button: HTMLElement): void {
    const activeStep = button.closest(SELECTOR_STEPPER_STEP)
    if (activeStep) {
      const stepButton = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_BUTTON, activeStep)
      if (stepButton) {
        stepButton.classList.add(CLASS_NAME_COMPLETE)
        this._appendIndicatorIcon(stepButton)
      }
    }
  }

  _updateCompleteStates(activeIndex: number): void {
    for (const [idx, stepButton] of this._stepButtons.entries()) {
      const isComplete = idx < activeIndex
      stepButton.classList.toggle(CLASS_NAME_COMPLETE, isComplete)

      if (isComplete) {
        this._appendIndicatorIcon(stepButton)
      } else {
        this._removeIndicatorIcon(stepButton)
      }
    }
  }

  _setInitialComplete(): void {
    const steps = SelectorEngine.find(SELECTOR_STEPPER_STEP, this._element as ParentNode)
    const activeBtn = this._getActiveElem()
    if (!activeBtn) {
      return
    }

    const activeIdx = steps.indexOf(activeBtn.closest(SELECTOR_STEPPER_STEP) as HTMLElement)
    if (activeIdx === -1) {
      return
    }

    this._updateCompleteStates(activeIdx)
  }

  _appendIndicatorIcon(button: HTMLElement): void {
    const indicator = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR, button)
    if (indicator && !SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR_ICON, indicator)) {
      const icon = document.createElement('span')
      icon.classList.add(CLASS_NAME_STEPPER_STEP_INDICATOR_ICON)
      indicator.append(icon)
    }
  }

  _removeIndicatorIcon(button: HTMLElement): void {
    const indicator = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR, button)
    if (!indicator) {
      return
    }

    const icon = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR_ICON, indicator)
    if (icon) {
      icon.remove()
    }
  }

  _updateStepButtonsDisabledState(): void {
    const activeIndex = this._stepButtons.indexOf(this._activeStepButton)

    for (const [index, button] of this._stepButtons.entries()) {
      button.disabled = this._config.linear && index > activeIndex + 1
    }
  }

  _disableStepButtons(): void {
    for (const stepButton of this._stepButtons) {
      stepButton.disabled = true
    }
  }

  _animateHeight(element: any, expand: boolean, callback?: () => void): void {
    const startHeight = expand ? 0 : element.scrollHeight
    const endHeight = expand ? element.scrollHeight : 0

    element.style.height = `${startHeight}px`
    element.style.overflow = 'hidden'

    // ensure reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    element.offsetHeight

    requestAnimationFrame(() => {
      element.style.height = `${endHeight}px`
      this._queueCallback(() => {
        element.style.overflow = 'initial'
        if (expand) {
          element.style.height = 'auto'
        }

        callback?.()
      }, element, true)
    })
  }

  _resetPanes(activePane: HTMLElement | null = null): void {
    for (const pane of SelectorEngine.find(SELECTOR_STEPPER_PANE, this._element as ParentNode)) {
      const isActive = pane === activePane
      pane.classList.toggle(CLASS_NAME_ACTIVE, isActive)
      pane.classList.toggle(CLASS_NAME_SHOW, isActive)
      pane.setAttribute('aria-hidden', !isActive as any)
    }
  }

  _addStepperConnector(): void {
    for (const [index, stepButton] of this._stepButtons.entries()) {
      if (index < this._stepButtons.length - 1) {
        const next = stepButton.nextElementSibling
        if (!next || !next.classList.contains(CLASS_NAME_STEPPER_STEP_CONNECTOR)) {
          const connectorElement = document.createElement('div')
          connectorElement.classList.add(CLASS_NAME_STEPPER_STEP_CONNECTOR)
          stepButton.after(connectorElement)
        }
      }
    }
  }

  _wrapIndicatorText(): void {
    for (const stepButton of this._stepButtons) {
      const indicator = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_INDICATOR, stepButton)

      if (!indicator) {
        continue
      }

      const childNodes = Array.from(indicator.childNodes)
      const visibleNodes = childNodes.filter(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent!.trim() !== ''
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          return true
        }

        return false
      })

      if (visibleNodes.length !== 1 || visibleNodes[0].nodeType !== Node.TEXT_NODE) {
        continue
      }

      const textNode = visibleNodes[0]
      const wrapper = document.createElement('span')
      wrapper.classList.add(CLASS_NAME_STEPPER_STEP_INDICATOR_TEXT)
      wrapper.textContent = textNode.textContent!.trim()

      textNode.replaceWith(wrapper)
    }
  }

  _setupAccessibilityAttributes(): void {
    const uId = getUID(this.constructor.NAME).toString()
    for (const [index, stepButton] of this._stepButtons.entries()) {
      const parentStepItem = stepButton.closest(SELECTOR_STEPPER_STEP)
      if (parentStepItem) {
        parentStepItem.setAttribute('role', 'presentation')
      }

      stepButton.setAttribute('role', 'tab')

      if (!stepButton.id) {
        stepButton.id = `${uId}${index + 1}`
      }

      const pane = SelectorEngine.getElementFromSelector(stepButton)

      if (pane) {
        stepButton.setAttribute('aria-controls', pane.id)
        pane.setAttribute('role', 'tabpanel')
        pane.setAttribute('aria-labelledby', stepButton.id)
        pane.setAttribute('aria-live', 'polite')
        pane.setAttribute('aria-hidden', !this._elemIsActive(stepButton) as any)
      }

      if (this._elemIsActive(stepButton)) {
        stepButton.setAttribute('aria-selected', 'true')
        stepButton.setAttribute('tabIndex', '0')
      } else {
        stepButton.setAttribute('aria-selected', 'false')
        stepButton.setAttribute('tabIndex', '-1')
      }
    }
  }

  _keydown(event: any): void {
    if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
      return
    }

    event.stopPropagation()
    event.preventDefault()

    const children = this._getEnabledStepButtons()
    let nextActiveElement

    switch (event.key) {
      case HOME_KEY: {
        nextActiveElement = children[0]
        break
      }

      case END_KEY: {
        nextActiveElement = children[children.length - 1]
        break
      }

      case ARROW_RIGHT_KEY:
      case ARROW_DOWN_KEY: {
        nextActiveElement = getNextActiveElement(children, event.delegateTarget, true, true)
        break
      }

      case ARROW_LEFT_KEY:
      case ARROW_UP_KEY: {
        nextActiveElement = getNextActiveElement(children, event.delegateTarget, false, true)
        break
      }

      default: {
        break
      }
    }

    nextActiveElement?.focus({ preventScroll: true })
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Stepper.getOrCreateInstance(this)
      if (typeof config !== 'string') {
        return
      }

      if (data[config as string] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    })
  }
}

/**
 * Data API implementation
 */
EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_STEPPER_STEP_BUTTON, function (event) {
  if (['A', 'AREA'].includes(this.tagName)) {
    event.preventDefault()
  }

  if (isDisabled(this)) {
    return
  }

  const stepperElement = this.closest(SELECTOR_STEPPER)
  if (!stepperElement) {
    return
  }

  const stepper = Stepper.getOrCreateInstance(stepperElement)
  stepper.showStep(this)
})

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_STEPPER_ACTION, function () {
  const action = Manipulator.getDataAttribute(this, 'stepper-action')
  const stepperElement = this.closest(SELECTOR_STEPPER)
  if (!stepperElement) {
    return
  }

  const stepper = Stepper.getOrCreateInstance(stepperElement)
  if (stepper && typeof (stepper as any)[action as string] === 'function') {
    (stepper as any)[action as string]()
  }
})

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
    Stepper.getOrCreateInstance(element)
  }
})

/**
 * jQuery integration
 */

defineJQueryPlugin(Stepper)

export default Stepper
