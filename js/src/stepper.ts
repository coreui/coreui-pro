/**
 * --------------------------------------------------------------------------
 * CoreUI PRO stepper.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { onDocumentReady } from './util/component-functions.js'
import { rootActiveElement } from './util/focus.js'
import {
  clearValidationState, isFormValid, updateValidationState, validateForm
} from './util/form-validation.js'
import type { ValidationMarks } from './util/form-validation.js'
import {
  defineJQueryPlugin, getNextActiveElement, getUID, isDisabled, isForwardKey, isRTL, jQueryDispatch
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
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_STEPPER_STEP_CONNECTOR = 'stepper-step-connector'
const CLASS_NAME_STEPPER_STEP_INDICATOR_ICON = 'stepper-step-indicator-icon'
const CLASS_NAME_STEPPER_STEP_INDICATOR_TEXT = 'stepper-step-indicator-text'
const CLASS_NAME_STEPPER_VERTICAL = 'stepper-vertical'

const SELECTOR_DATA_STEPPER = '[data-coreui-stepper]'
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

type StepperConfig = {
  linear: boolean
  skipValidation: boolean
}

const Default: StepperConfig = {
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
  protected declare _activeStepButton: HTMLButtonElement | null
  protected declare _initialStepButton: HTMLButtonElement | null
  protected declare _isFinished: boolean
  protected declare _validationMarks: ValidationMarks
  protected declare _validatedForms: Set<HTMLFormElement>
  protected declare _tabPattern: boolean

  constructor(element?: string | Element | null, config?: Partial<StepperConfig> | null) {
    super(element, config)

    this._stepButtons = this._getStepButtons()
    this._tabPattern = !SelectorEngine.findOne(SELECTOR_STEPPER_STEP_CONTENT, this._element)
    this._activeStepButton = this._stepButtons.find(button => button.classList.contains(CLASS_NAME_ACTIVE)) ?? null
    this._initialStepButton = this._activeStepButton
    this._isFinished = false
    this._validationMarks = new WeakMap()
    this._validatedForms = new Set()

    this._addStepperConnector()
    this._resetPanes(this._getTargetPane(this._activeStepButton))
    this._wrapIndicatorText()
    this._updateCompleteStates(this._getActiveIndex(this._stepButtons))
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

    const active = this._activeStepButton

    if (button === active) {
      return
    }

    const isForward = this._stepButtons.indexOf(button) > this._getActiveIndex(this._stepButtons)

    if (active && isForward && !this._isCurrentStepValid(active)) {
      return
    }

    if (this._config.linear) {
      const steps = this._getEnabledStepButtons()
      const targetIndex = steps.indexOf(button)
      const activeIndex = this._getActiveIndex(steps)

      if (targetIndex > activeIndex + 1) {
        return
      }
    }

    const index = this._stepButtons.indexOf(button) + 1
    EventHandler.trigger(this._element, EVENT_STEP_CHANGE, { index })

    const holdsFocus = this._holdsFocus()
    this._activeStepButton = button
    this._deactivate(active)
    this._activate(button)
    this._updateStepButtonsDisabledState()
    this._updateCompleteStates(this._stepButtons.indexOf(button))

    if (holdsFocus) {
      button.focus()
    }
  }

  next(): void {
    if (this._isFinished) {
      return
    }

    const steps = this._getEnabledStepButtons()
    const next = steps[this._getActiveIndex(steps) + 1]

    if (next) {
      this.showStep(next)
      return
    }

    this.finish()
  }

  prev(): void {
    if (this._isFinished) {
      return
    }

    const steps = this._getEnabledStepButtons()
    const prev = steps[this._getActiveIndex(steps) - 1]

    if (prev) {
      this.showStep(prev)
    }
  }

  finish(): void {
    if (this._isFinished) {
      return
    }

    const steps = this._getEnabledStepButtons()
    const active = this._activeStepButton

    if (!active || this._getActiveIndex(steps) !== steps.length - 1) {
      return
    }

    if (!this._isCurrentStepValid(active)) {
      return
    }

    this._isFinished = true
    this._activeStepButton = null
    this._disableStepButtons()

    const finishHandler = () => {
      active.classList.remove(CLASS_NAME_ACTIVE)
      this._setSelected(active, false)
      active.classList.add(CLASS_NAME_COMPLETE)
      this._appendIndicatorIcon(active)
      EventHandler.trigger(this._element, EVENT_FINISH)
    }

    const pane = this._getTargetPane(active)
    const stepContent = active.parentNode!.querySelector(SELECTOR_STEPPER_STEP_CONTENT)

    if (pane) {
      this._resetPanes()
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

    const holdsFocus = this._holdsFocus()

    this._resetPanes()

    for (const content of SelectorEngine.find(SELECTOR_STEPPER_STEP_CONTENT, this._element as ParentNode)) {
      this._queueCallback(() => {
        content.style.height = ''
        content.style.overflow = ''
      }, content, false)
      content.classList.remove(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW)
      content.setAttribute('aria-hidden', 'true')
    }

    for (const btn of this._stepButtons) {
      btn.classList.remove(CLASS_NAME_ACTIVE)
    }

    for (const form of this._element.querySelectorAll(`${SELECTOR_STEPPER_PANE} form, ${SELECTOR_STEPPER_STEP_CONTENT} form`)) {
      (form as HTMLFormElement).reset()
    }

    for (const form of this._validatedForms) {
      this._untrackValidatedForm(form)
    }

    const firstStep = this._initialStepButton || this._stepButtons[0]
    firstStep.classList.add(CLASS_NAME_ACTIVE)

    const pane = this._getTargetPane(firstStep)
    if (pane) {
      this._resetPanes(pane)
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
    this._setupAccessibilityAttributes()

    if (holdsFocus) {
      firstStep.focus()
    }

    EventHandler.trigger(this._element, EVENT_RESET)
  }

  override dispose(): void {
    for (const form of this._validatedForms) {
      this._untrackValidatedForm(form)
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

  _getActiveIndex(steps: HTMLButtonElement[]): number {
    return this._activeStepButton ? steps.indexOf(this._activeStepButton) : -1
  }

  _getTargetPane(element: any): HTMLElement | null {
    return SelectorEngine.getElementFromSelector(element)
  }

  _isActionOfInactiveStep(action: Element): boolean {
    const content = action.closest(SELECTOR_STEPPER_STEP_CONTENT)
    return Boolean(content) && content!.parentNode!.querySelector(SELECTOR_STEPPER_STEP_BUTTON) !== this._activeStepButton
  }

  _holdsFocus(): boolean {
    return this._element.contains(rootActiveElement(this._element))
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

    const stepIndex = this._stepButtons.indexOf(element) + 1

    if (!form.noValidate) {
      EventHandler.trigger(this._element, EVENT_STEP_VALIDATION_COMPLETE, { stepIndex, isValid: isFormValid(form) })

      return form.reportValidity()
    }

    const { isValid } = validateForm(form, this._validationMarks, isValid => {
      EventHandler.trigger(this._element, EVENT_STEP_VALIDATION_COMPLETE, { stepIndex, isValid })
      return false
    })

    this._trackValidatedForm(form)

    return isValid
  }

  _trackValidatedForm(form: HTMLFormElement): void {
    if (!this._validatedForms.has(form)) {
      this._validatedForms.add(form)
      EventHandler.on(form, EVENT_INPUT, () => updateValidationState(form, this._validationMarks))
      EventHandler.on(form, EVENT_RESET, (event: Event) => {
        setTimeout(() => {
          if (this._element && !event.defaultPrevented && this._validatedForms.has(form)) {
            this._untrackValidatedForm(form)
          }
        })
      })
    }
  }

  _untrackValidatedForm(form: HTMLFormElement): void {
    EventHandler.off(form, EVENT_INPUT)
    EventHandler.off(form, EVENT_RESET)
    clearValidationState(form, this._validationMarks)
    this._validatedForms.delete(form)
  }

  _activate(element: any): void {
    if (!element) {
      return
    }

    element.classList.add(CLASS_NAME_ACTIVE)
    this._setSelected(element, true)

    this._resetPanes(this._getTargetPane(element))

    const stepContentElement = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_CONTENT, element.parentNode)
    if (stepContentElement) {
      this._animateHeight(stepContentElement, true)
    }
  }

  _deactivate(element: any): void {
    if (!element) {
      return
    }

    this._setSelected(element, false)

    const stepContentElement = SelectorEngine.findOne(SELECTOR_STEPPER_STEP_CONTENT, element.parentNode)
    if (stepContentElement) {
      this._animateHeight(stepContentElement, false, () => element.classList.remove(CLASS_NAME_ACTIVE))
    } else {
      element.classList.remove(CLASS_NAME_ACTIVE)
    }
  }

  _updateCompleteStates(activeIndex: number): void {
    if (activeIndex < 0) {
      return
    }

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
    const activeIndex = this._getActiveIndex(this._stepButtons)

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

    const hidesFocus = !expand && element.contains(rootActiveElement(element))

    if (!hidesFocus) {
      element.setAttribute('aria-hidden', String(!expand))
    }

    element.style.height = `${startHeight}px`
    element.style.overflow = 'hidden'

    // ensure reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    element.offsetHeight

    element.style.height = `${endHeight}px`
    this._queueCallback(() => {
      element.style.overflow = 'initial'
      if (expand) {
        element.style.height = 'auto'
      }

      if (hidesFocus) {
        element.setAttribute('aria-hidden', 'true')
      }

      callback?.()
    }, element, true)
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

      const visibleNodes = [...indicator.childNodes].filter(node =>
        node.nodeType === Node.ELEMENT_NODE || (node.nodeType === Node.TEXT_NODE && node.textContent!.trim())
      )

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
    const stepList = SelectorEngine.findOne(SELECTOR_STEPPER_STEPS, this._element)

    if (stepList && this._tabPattern) {
      stepList.setAttribute('role', 'tablist')
      stepList.setAttribute('aria-orientation', this._element.classList.contains(CLASS_NAME_STEPPER_VERTICAL) ? 'vertical' : 'horizontal')
    }

    for (const [index, stepButton] of this._stepButtons.entries()) {
      const parentStepItem = stepButton.closest(SELECTOR_STEPPER_STEP)
      if (parentStepItem && this._tabPattern) {
        parentStepItem.setAttribute('role', 'presentation')
      }

      if (this._tabPattern) {
        stepButton.setAttribute('role', 'tab')
      }

      if (!stepButton.id) {
        stepButton.id = `${uId}${index + 1}`
      }

      const pane = this._getTargetPane(stepButton)

      if (pane) {
        stepButton.setAttribute('aria-controls', pane.id)

        if (this._tabPattern) {
          pane.setAttribute('role', 'tabpanel')
        }

        pane.setAttribute('aria-labelledby', stepButton.id)
      }

      this._setSelected(stepButton, stepButton === this._activeStepButton)
    }
  }

  _setSelected(button: HTMLElement, selected: boolean): void {
    button.setAttribute(this._tabPattern ? 'aria-selected' : 'aria-expanded', String(selected))
    button.setAttribute('tabIndex', selected ? '0' : '-1')
  }

  _keydown(event: any): void {
    if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
      return
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
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

      default: {
        nextActiveElement = getNextActiveElement(children, event.delegateTarget, isForwardKey(event.key, isRTL(this._element)), true)
      }
    }

    nextActiveElement?.focus({ preventScroll: true })
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, Stepper, config, args)
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
  if (stepper._isActionOfInactiveStep(this)) {
    return
  }

  if (typeof (stepper as any)[action as string] === 'function') {
    (stepper as any)[action as string]()
  }
})

onDocumentReady(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_STEPPER)) {
    Stepper.getOrCreateInstance(element)
  }
})

/**
 * jQuery integration
 */

defineJQueryPlugin(Stepper)

export default Stepper
export type { StepperConfig }
