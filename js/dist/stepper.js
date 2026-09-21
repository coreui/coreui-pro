/*!
* CoreUI PRO stepper.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./dom/selector-engine.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./dom/selector-engine.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Stepper = factory(global.BaseComponent, global.EventHandler, global.Manipulator, global.SelectorEngine, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_dom_selector_engine_js, js_src_util_index_js) {
	//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	//#endregion
	js_src_base_component_js = __toESM(js_src_base_component_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_manipulator_js = __toESM(js_src_dom_manipulator_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/stepper.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO stepper.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "stepper";
	const EVENT_KEY = `.coreui.stepper`;
	const EVENT_FINISH = `finish${EVENT_KEY}`;
	const EVENT_RESET = `reset${EVENT_KEY}`;
	const EVENT_STEP_CHANGE = `stepChange${EVENT_KEY}`;
	const EVENT_STEP_VALIDATION_COMPLETE = `stepValidationComplete${EVENT_KEY}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}`;
	const EVENT_INPUT = `input${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}`;
	const CLASS_NAME_ACTIVE = "active";
	const CLASS_NAME_COMPLETE = "complete";
	const CLASS_NAME_IS_INVALID = "is-invalid";
	const CLASS_NAME_IS_VALID = "is-valid";
	const CLASS_NAME_SHOW = "show";
	const CLASS_NAME_STEPPER_STEP_CONNECTOR = "stepper-step-connector";
	const CLASS_NAME_STEPPER_STEP_INDICATOR_ICON = "stepper-step-indicator-icon";
	const CLASS_NAME_STEPPER_STEP_INDICATOR_TEXT = "stepper-step-indicator-text";
	const CLASS_NAME_STEPPER_VERTICAL = "stepper-vertical";
	const SELECTOR_DATA_STEPPER = "[data-coreui-stepper]";
	const SELECTOR_FORM_VALIDATE_VALID = "[data-coreui-validate~=\"valid\"]";
	const SELECTOR_STEPPER = ".stepper";
	const SELECTOR_STEPPER_ACTION = "[data-coreui-stepper-action]";
	const SELECTOR_STEPPER_STEP = ".stepper-step";
	const SELECTOR_STEPPER_STEP_BUTTON = ".stepper-step-button";
	const SELECTOR_STEPPER_STEP_CONTENT = ".stepper-step-content";
	const SELECTOR_STEPPER_STEP_INDICATOR = ".stepper-step-indicator";
	const SELECTOR_STEPPER_STEP_INDICATOR_ICON = ".stepper-step-indicator-icon";
	const SELECTOR_STEPPER_STEPS = ".stepper-steps";
	const SELECTOR_STEPPER_PANE = ".stepper-pane";
	const ARROW_LEFT_KEY = "ArrowLeft";
	const ARROW_RIGHT_KEY = "ArrowRight";
	const ARROW_UP_KEY = "ArrowUp";
	const ARROW_DOWN_KEY = "ArrowDown";
	const HOME_KEY = "Home";
	const END_KEY = "End";
	const Default = {
		linear: true,
		skipValidation: false
	};
	const DefaultType = {
		linear: "boolean",
		skipValidation: "boolean"
	};
	/**
	* Class definition
	*/
	var Stepper = class Stepper extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._stepButtons = this._getStepButtons();
			this._tabPattern = !js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEP_CONTENT, this._element);
			this._activeStepButton = this._getActiveElem();
			this._initialStepButton = this._activeStepButton;
			this._isFinished = false;
			this._validatedForms = /* @__PURE__ */ new Set();
			this._addStepperConnector();
			this._resetPanes(this._getTargetPane(this._activeStepButton));
			this._wrapIndicatorText();
			this._setInitialComplete();
			this._updateStepButtonsDisabledState();
			this._setupAccessibilityAttributes();
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, SELECTOR_STEPPER_STEP_BUTTON, (event) => this._keydown(event));
		}
		static get Default() {
			return Default;
		}
		static get DefaultType() {
			return DefaultType;
		}
		static get NAME() {
			return NAME;
		}
		showStep(buttonOrStepNumber) {
			let button = buttonOrStepNumber;
			if (typeof buttonOrStepNumber === "number") button = this._stepButtons[buttonOrStepNumber - 1];
			if (!button) return;
			const active = this._getActiveElem();
			if (active && !this._isCurrentStepValid(active)) return;
			if (this._elemIsActive(button)) return;
			if (this._config.linear) {
				const steps = this._getEnabledStepButtons();
				if (steps.indexOf(button) > steps.indexOf(active) + 1) return;
			}
			const index = this._stepButtons.indexOf(button) + 1;
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_STEP_CHANGE, { index });
			this._activeStepButton = button;
			this._deactivate(active);
			this._activate(button);
			this._updateStepButtonsDisabledState();
			this._complete(button);
		}
		next() {
			if (this._isFinished) return;
			if (!this._isCurrentStepValid(this._getActiveElem())) return;
			const steps = this._getEnabledStepButtons();
			const active = this._getActiveElem();
			const next = steps[steps.indexOf(active) + 1];
			if (next) this.showStep(next);
		}
		prev() {
			if (this._isFinished) return;
			const steps = this._getEnabledStepButtons();
			const active = this._getActiveElem();
			const prev = steps[steps.indexOf(active) - 1];
			if (prev) this.showStep(prev);
		}
		finish() {
			if (this._isFinished) return;
			if (!this._isCurrentStepValid(this._getActiveElem())) return;
			const steps = this._getEnabledStepButtons();
			const active = this._getActiveElem();
			const index = steps.indexOf(active);
			if (index !== steps.length - 1) {
				const next = steps[index + 1];
				if (next) this.showStep(next);
				return;
			}
			const finishHandler = () => {
				active.classList.remove(CLASS_NAME_ACTIVE);
				this._markAsComplete(active);
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_FINISH);
				this._isFinished = true;
				this._disableStepButtons();
			};
			const pane = this._getTargetPane(active);
			const stepContent = active.parentNode.querySelector(SELECTOR_STEPPER_STEP_CONTENT);
			if (pane) {
				pane.classList.remove(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW);
				finishHandler();
			} else if (stepContent) this._animateHeight(stepContent, false, finishHandler);
			else finishHandler();
		}
		reset() {
			if (!this._stepButtons.length) return;
			for (const pane of js_src_dom_selector_engine_js.default.find(SELECTOR_STEPPER_PANE, this._element)) {
				pane.classList.remove(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW);
				pane.setAttribute("aria-hidden", "true");
			}
			for (const content of js_src_dom_selector_engine_js.default.find(SELECTOR_STEPPER_STEP_CONTENT, this._element)) {
				content.classList.remove(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW);
				content.setAttribute("aria-hidden", "true");
			}
			for (const btn of this._stepButtons) {
				btn.classList.remove(CLASS_NAME_ACTIVE, CLASS_NAME_COMPLETE);
				this._removeIndicatorIcon(btn);
			}
			for (const form of this._element.querySelectorAll(`${SELECTOR_STEPPER_PANE} form, ${SELECTOR_STEPPER_STEP_CONTENT} form`)) form.reset();
			for (const form of this._validatedForms) for (const control of form.elements) control.classList.remove(CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID);
			const firstStep = this._initialStepButton || this._stepButtons[0];
			firstStep.classList.add(CLASS_NAME_ACTIVE);
			const pane = this._getTargetPane(firstStep);
			if (pane) {
				pane.classList.add(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW);
				pane.setAttribute("aria-hidden", "false");
			} else {
				const stepContent = firstStep.parentNode.querySelector(SELECTOR_STEPPER_STEP_CONTENT);
				if (stepContent) {
					stepContent.classList.add(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW);
					stepContent.setAttribute("aria-hidden", "false");
				}
			}
			this._updateCompleteStates(this._stepButtons.indexOf(firstStep));
			this._activeStepButton = firstStep;
			this._isFinished = false;
			this._updateStepButtonsDisabledState();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_RESET);
		}
		dispose() {
			for (const form of this._validatedForms) js_src_dom_event_handler_js.default.off(form, EVENT_INPUT);
			super.dispose();
		}
		_getStepButtons() {
			return js_src_dom_selector_engine_js.default.find(SELECTOR_STEPPER_STEP_BUTTON, this._element);
		}
		_getEnabledStepButtons() {
			return this._getStepButtons().filter((el) => !(0, js_src_util_index_js.isDisabled)(el));
		}
		_getActiveElem() {
			return this._stepButtons.find((child) => this._elemIsActive(child)) || null;
		}
		_getTargetPane(element) {
			return js_src_dom_selector_engine_js.default.getElementFromSelector(element);
		}
		_elemIsActive(elem) {
			return elem.classList.contains(CLASS_NAME_ACTIVE);
		}
		_isCurrentStepValid(element) {
			if (this._config.skipValidation) return true;
			const target = this._getTargetPane(element) ?? element.parentNode.querySelector(SELECTOR_STEPPER_STEP_CONTENT);
			if (!target) return true;
			const form = target.querySelector("form");
			if (!form) return true;
			const isValid = form.checkValidity();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_STEP_VALIDATION_COMPLETE, {
				stepIndex: this._stepButtons.indexOf(element) + 1,
				isValid
			});
			if (!isValid) {
				if (form.noValidate) this._showValidationState(form);
				else form.reportValidity();
				return false;
			}
			return true;
		}
		_showValidationState(form) {
			for (const control of form.elements) this._updateControlValidationState(control, form);
			if (!this._validatedForms.has(form)) {
				this._validatedForms.add(form);
				js_src_dom_event_handler_js.default.on(form, EVENT_INPUT, (event) => this._updateControlValidationState(event.target, form));
			}
		}
		_updateControlValidationState(control, form) {
			if (!control.willValidate || [
				"button",
				"reset",
				"submit"
			].includes(control.type)) return;
			control.classList.toggle(CLASS_NAME_IS_INVALID, !control.validity.valid);
			control.classList.toggle(CLASS_NAME_IS_VALID, control.validity.valid && form.matches(SELECTOR_FORM_VALIDATE_VALID));
		}
		_activate(element) {
			if (!element) return;
			element.classList.add(CLASS_NAME_ACTIVE);
			element.setAttribute(this._tabPattern ? "aria-selected" : "aria-expanded", "true");
			element.setAttribute("tabIndex", "0");
			const pane = this._getTargetPane(element);
			if (pane) {
				pane.classList.add(CLASS_NAME_ACTIVE, CLASS_NAME_SHOW);
				pane.setAttribute("aria-hidden", "false");
			}
			const stepContentElement = js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEP_CONTENT, element.parentNode);
			if (stepContentElement) this._animateHeight(stepContentElement, true);
		}
		_deactivate(element) {
			this._resetPanes();
			if (!element) return;
			element.setAttribute(this._tabPattern ? "aria-selected" : "aria-expanded", "false");
			element.setAttribute("tabIndex", "-1");
			const stepContentElement = js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEP_CONTENT, element.parentNode);
			if (stepContentElement) this._animateHeight(stepContentElement, false, () => element.classList.remove(CLASS_NAME_ACTIVE));
			else element.classList.remove(CLASS_NAME_ACTIVE);
		}
		_complete(activeBtn) {
			const stepsContainer = activeBtn.closest(SELECTOR_STEPPER_STEPS) || document;
			const activeStepIdx = js_src_dom_selector_engine_js.default.find(SELECTOR_STEPPER_STEP, stepsContainer).indexOf(activeBtn.parentNode);
			if (activeStepIdx === -1) return;
			this._updateCompleteStates(activeStepIdx);
		}
		_markAsComplete(button) {
			const activeStep = button.closest(SELECTOR_STEPPER_STEP);
			if (activeStep) {
				const stepButton = js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEP_BUTTON, activeStep);
				if (stepButton) {
					stepButton.classList.add(CLASS_NAME_COMPLETE);
					this._appendIndicatorIcon(stepButton);
				}
			}
		}
		_updateCompleteStates(activeIndex) {
			for (const [idx, stepButton] of this._stepButtons.entries()) {
				const isComplete = idx < activeIndex;
				stepButton.classList.toggle(CLASS_NAME_COMPLETE, isComplete);
				if (isComplete) this._appendIndicatorIcon(stepButton);
				else this._removeIndicatorIcon(stepButton);
			}
		}
		_setInitialComplete() {
			const steps = js_src_dom_selector_engine_js.default.find(SELECTOR_STEPPER_STEP, this._element);
			const activeBtn = this._getActiveElem();
			if (!activeBtn) return;
			const activeIdx = steps.indexOf(activeBtn.closest(SELECTOR_STEPPER_STEP));
			if (activeIdx === -1) return;
			this._updateCompleteStates(activeIdx);
		}
		_appendIndicatorIcon(button) {
			const indicator = js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEP_INDICATOR, button);
			if (indicator && !js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEP_INDICATOR_ICON, indicator)) {
				const icon = document.createElement("span");
				icon.classList.add(CLASS_NAME_STEPPER_STEP_INDICATOR_ICON);
				indicator.append(icon);
			}
		}
		_removeIndicatorIcon(button) {
			const indicator = js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEP_INDICATOR, button);
			if (!indicator) return;
			const icon = js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEP_INDICATOR_ICON, indicator);
			if (icon) icon.remove();
		}
		_updateStepButtonsDisabledState() {
			const activeIndex = this._stepButtons.indexOf(this._activeStepButton);
			for (const [index, button] of this._stepButtons.entries()) button.disabled = this._config.linear && index > activeIndex + 1;
		}
		_disableStepButtons() {
			for (const stepButton of this._stepButtons) stepButton.disabled = true;
		}
		_animateHeight(element, expand, callback) {
			const startHeight = expand ? 0 : element.scrollHeight;
			const endHeight = expand ? element.scrollHeight : 0;
			element.style.height = `${startHeight}px`;
			element.style.overflow = "hidden";
			element.offsetHeight;
			requestAnimationFrame(() => {
				element.style.height = `${endHeight}px`;
				this._queueCallback(() => {
					element.style.overflow = "initial";
					if (expand) element.style.height = "auto";
					callback?.();
				}, element, true);
			});
		}
		_resetPanes(activePane = null) {
			for (const pane of js_src_dom_selector_engine_js.default.find(SELECTOR_STEPPER_PANE, this._element)) {
				const isActive = pane === activePane;
				pane.classList.toggle(CLASS_NAME_ACTIVE, isActive);
				pane.classList.toggle(CLASS_NAME_SHOW, isActive);
				pane.setAttribute("aria-hidden", !isActive);
			}
		}
		_addStepperConnector() {
			for (const [index, stepButton] of this._stepButtons.entries()) if (index < this._stepButtons.length - 1) {
				const next = stepButton.nextElementSibling;
				if (!next || !next.classList.contains(CLASS_NAME_STEPPER_STEP_CONNECTOR)) {
					const connectorElement = document.createElement("div");
					connectorElement.classList.add(CLASS_NAME_STEPPER_STEP_CONNECTOR);
					stepButton.after(connectorElement);
				}
			}
		}
		_wrapIndicatorText() {
			for (const stepButton of this._stepButtons) {
				const indicator = js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEP_INDICATOR, stepButton);
				if (!indicator) continue;
				const visibleNodes = Array.from(indicator.childNodes).filter((node) => {
					if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim() !== "";
					if (node.nodeType === Node.ELEMENT_NODE) return true;
					return false;
				});
				if (visibleNodes.length !== 1 || visibleNodes[0].nodeType !== Node.TEXT_NODE) continue;
				const textNode = visibleNodes[0];
				const wrapper = document.createElement("span");
				wrapper.classList.add(CLASS_NAME_STEPPER_STEP_INDICATOR_TEXT);
				wrapper.textContent = textNode.textContent.trim();
				textNode.replaceWith(wrapper);
			}
		}
		_setupAccessibilityAttributes() {
			const uId = (0, js_src_util_index_js.getUID)(this.constructor.NAME).toString();
			const stepList = js_src_dom_selector_engine_js.default.findOne(SELECTOR_STEPPER_STEPS, this._element);
			if (stepList && this._tabPattern) {
				stepList.setAttribute("role", "tablist");
				stepList.setAttribute("aria-orientation", this._element.classList.contains(CLASS_NAME_STEPPER_VERTICAL) ? "vertical" : "horizontal");
			}
			for (const [index, stepButton] of this._stepButtons.entries()) {
				const parentStepItem = stepButton.closest(SELECTOR_STEPPER_STEP);
				if (parentStepItem && this._tabPattern) parentStepItem.setAttribute("role", "presentation");
				if (this._tabPattern) stepButton.setAttribute("role", "tab");
				if (!stepButton.id) stepButton.id = `${uId}${index + 1}`;
				const pane = js_src_dom_selector_engine_js.default.getElementFromSelector(stepButton);
				if (pane) {
					stepButton.setAttribute("aria-controls", pane.id);
					if (this._tabPattern) pane.setAttribute("role", "tabpanel");
					pane.setAttribute("aria-labelledby", stepButton.id);
					pane.setAttribute("aria-live", "polite");
					pane.setAttribute("aria-hidden", !this._elemIsActive(stepButton));
				}
				if (this._elemIsActive(stepButton)) {
					stepButton.setAttribute(this._tabPattern ? "aria-selected" : "aria-expanded", "true");
					stepButton.setAttribute("tabIndex", "0");
				} else {
					stepButton.setAttribute(this._tabPattern ? "aria-selected" : "aria-expanded", "false");
					stepButton.setAttribute("tabIndex", "-1");
				}
			}
		}
		_keydown(event) {
			if (![
				ARROW_LEFT_KEY,
				ARROW_RIGHT_KEY,
				ARROW_UP_KEY,
				ARROW_DOWN_KEY,
				HOME_KEY,
				END_KEY
			].includes(event.key)) return;
			event.stopPropagation();
			event.preventDefault();
			const children = this._getEnabledStepButtons();
			let nextActiveElement;
			switch (event.key) {
				case HOME_KEY:
					nextActiveElement = children[0];
					break;
				case END_KEY:
					nextActiveElement = children[children.length - 1];
					break;
				case ARROW_RIGHT_KEY:
				case ARROW_DOWN_KEY:
					nextActiveElement = (0, js_src_util_index_js.getNextActiveElement)(children, event.delegateTarget, true, true);
					break;
				case ARROW_LEFT_KEY:
				case ARROW_UP_KEY: nextActiveElement = (0, js_src_util_index_js.getNextActiveElement)(children, event.delegateTarget, false, true);
			}
			nextActiveElement?.focus({ preventScroll: true });
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Stepper, config, args);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, SELECTOR_STEPPER_STEP_BUTTON, function(event) {
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if ((0, js_src_util_index_js.isDisabled)(this)) return;
		const stepperElement = this.closest(SELECTOR_STEPPER);
		if (!stepperElement) return;
		Stepper.getOrCreateInstance(stepperElement).showStep(this);
	});
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, SELECTOR_STEPPER_ACTION, function() {
		const action = js_src_dom_manipulator_js.default.getDataAttribute(this, "stepper-action");
		const stepperElement = this.closest(SELECTOR_STEPPER);
		if (!stepperElement) return;
		const stepper = Stepper.getOrCreateInstance(stepperElement);
		if (stepper && typeof stepper[action] === "function") stepper[action]();
	});
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_STEPPER)) Stepper.getOrCreateInstance(element);
	});
	/**
	* jQuery integration
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Stepper);
	//#endregion
	return Stepper;
});

//# sourceMappingURL=stepper.js.map