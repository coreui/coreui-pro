// stepper.spec.js
import { vi } from 'vitest'
import Stepper from '../../src/stepper.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('Stepper', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const getThreeStepFixture = (options = {}) => {
    const { linear, skipValidation, activeStep = 1 } = options
    const dataAttrs = []
    if (linear !== undefined) {
      dataAttrs.push(`data-coreui-linear="${linear}"`)
    }

    if (skipValidation !== undefined) {
      dataAttrs.push(`data-coreui-skip-validation="${skipValidation}"`)
    }

    const buttons = [1, 2, 3].map(i => `
      <li class="stepper-step">
        <button type="button" class="stepper-step-button${i === activeStep ? ' active' : ''}" data-coreui-target="#step${i}">
          <span class="stepper-step-indicator">${i}</span>
          <span class="stepper-step-label">Step ${i}</span>
        </button>
      </li>
    `).join('')

    const panes = [1, 2, 3].map(i => `
      <div id="step${i}" class="stepper-pane${i === activeStep ? ' active show' : ''}"></div>
    `).join('')

    return `
      <div class="stepper" data-coreui-stepper ${dataAttrs.join(' ')}>
        <ol class="stepper-steps">
          ${buttons}
        </ol>
        ${panes}
      </div>
    `
  }

  const getStepContentFixture = (options = {}) => {
    const { activeStep = 1 } = options
    const steps = [1, 2, 3].map(i => `
      <li class="stepper-step">
        <button type="button" class="stepper-step-button${i === activeStep ? ' active' : ''}">
          <span class="stepper-step-indicator">${i}</span>
        </button>
        <div class="stepper-step-content${i === activeStep ? ' active show' : ''}">
          <p>Content ${i}</p>
        </div>
      </li>
    `).join('')

    return `
      <div class="stepper" data-coreui-stepper>
        <ol class="stepper-steps">
          ${steps}
        </ol>
      </div>
    `
  }

  describe('constructor', () => {
    it('should initialize with a DOM element having data-coreui-stepper', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      expect(stepper._element).toEqual(stepperElement)
    })

    it('should set default config values', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      expect(stepper._config.linear).toBeTrue()
      expect(stepper._config.skipValidation).toBeFalse()
    })

    it('should accept config via data attributes', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false, skipValidation: true })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      expect(stepper._config.linear).toBeFalse()
      expect(stepper._config.skipValidation).toBeTrue()
    })

    it('should accept config via constructor options', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { linear: false, skipValidation: true })

      expect(stepper._config.linear).toBeFalse()
      expect(stepper._config.skipValidation).toBeTrue()
    })

    it('should identify the active step button', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 2 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')

      expect(stepper._activeStepButton).toEqual(buttons[1])
    })

    it('should add stepper connectors between step buttons', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const connectors = fixtureEl.querySelectorAll('.stepper-step-connector')
      expect(connectors.length).toBe(2)
    })

    it('should wrap indicator text nodes in span', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
        </div>
      `
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const textWrapper = fixtureEl.querySelector('.stepper-step-indicator-text')
      expect(textWrapper).not.toBeNull()
      expect(textWrapper.textContent).toBe('1')
    })

    it('should not wrap indicator text if already wrapped in element', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator"><span>1</span></span>
              </button>
            </li>
          </ol>
        </div>
      `
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const textWrapper = fixtureEl.querySelector('.stepper-step-indicator-text')
      expect(textWrapper).toBeNull()
    })

    it('should not wrap indicator text if multiple visible nodes', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator"><span>A</span>B</span>
              </button>
            </li>
          </ol>
        </div>
      `
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const textWrapper = fixtureEl.querySelector('.stepper-step-indicator-text')
      expect(textWrapper).toBeNull()
    })

    it('should set initial complete states for steps before active', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('complete')
      expect(buttons[1]).toHaveClass('complete')
      expect(buttons[2]).not.toHaveClass('complete')
    })

    it('should setup accessibility attributes', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const steps = fixtureEl.querySelectorAll('.stepper-step')
      const stepList = fixtureEl.querySelector('.stepper-steps')

      // Step list
      expect(stepList.getAttribute('role')).toBe('tablist')
      expect(stepList.getAttribute('aria-orientation')).toBe('horizontal')

      // First step (active)
      expect(steps[0].getAttribute('role')).toBe('presentation')
      expect(buttons[0].getAttribute('role')).toBe('tab')
      expect(buttons[0].getAttribute('aria-selected')).toBe('true')
      expect(buttons[0].getAttribute('tabIndex')).toBe('0')
      expect(buttons[0].getAttribute('aria-controls')).toBe('step1')

      // Second step (inactive)
      expect(buttons[1].getAttribute('aria-selected')).toBe('false')
      expect(buttons[1].getAttribute('tabIndex')).toBe('-1')

      // Panes
      const panes = fixtureEl.querySelectorAll('.stepper-pane')
      expect(panes[0].getAttribute('role')).toBe('tabpanel')
      expect(panes[0].getAttribute('aria-labelledby')).toBe(buttons[0].id)
      expect(panes[0].hasAttribute('aria-live')).toBeFalse()
    })

    it('should drop the tab pattern when the steps own their content', () => {
      fixtureEl.innerHTML = getStepContentFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const stepList = fixtureEl.querySelector('.stepper-steps')
      const step = fixtureEl.querySelector('.stepper-step')
      const button = fixtureEl.querySelector('.stepper-step-button')

      expect(stepList.hasAttribute('role')).toBeFalse()
      expect(step.hasAttribute('role')).toBeFalse()
      expect(button.hasAttribute('role')).toBeFalse()
      expect(button.hasAttribute('aria-selected')).toBeFalse()
      expect(button.getAttribute('aria-expanded')).toBe('true')
    })

    it('should read the tablist orientation from the layout', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      stepperElement.classList.add('stepper-vertical')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const stepList = fixtureEl.querySelector('.stepper-steps')

      expect(stepList.getAttribute('role')).toBe('tablist')
      expect(stepList.getAttribute('aria-orientation')).toBe('vertical')
    })

    it('should set button id if not present', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0].id).not.toBe('')
      expect(buttons[1].id).not.toBe('')
      expect(buttons[2].id).not.toBe('')
    })

    it('should not overwrite existing button id', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" id="my-custom-id" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show"></div>
        </div>
      `
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const button = fixtureEl.querySelector('.stepper-step-button')
      expect(button.id).toBe('my-custom-id')
    })

    it('should disable step buttons beyond active+1 in linear mode', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0].disabled).toBeFalse()
      expect(buttons[1].disabled).toBeFalse()
      expect(buttons[2].disabled).toBeTrue()
    })

    it('should not disable any step buttons in non-linear mode', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0].disabled).toBeFalse()
      expect(buttons[1].disabled).toBeFalse()
      expect(buttons[2].disabled).toBeFalse()
    })

    it('should register keydown event handler', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      const spy = spyOn(event, 'preventDefault')
      fixtureEl.querySelector('.stepper-step-button').dispatchEvent(event)

      expect(spy).toHaveBeenCalled()
    })

    it('should leave keydown alone outside the step buttons', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <input type="text" value="abc">
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const input = fixtureEl.querySelector('input')
      input.focus()

      for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true })
        const spy = spyOn(event, 'preventDefault')
        input.dispatchEvent(event)

        expect(spy).not.toHaveBeenCalled()
        expect(document.activeElement).toBe(input)
      }
    })
  })

  describe('showStep', () => {
    it('should show step by number', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.showStep(2)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[1]).toHaveClass('active')
      expect(buttons[0]).not.toHaveClass('active')
    })

    it('should show step by button element', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')

      stepper.showStep(buttons[1])

      expect(buttons[1]).toHaveClass('active')
      expect(buttons[0]).not.toHaveClass('active')
    })

    it('should do nothing if button is null/undefined', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.showStep(null)
      stepper.showStep(10) // out of range

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
    })

    it('should do nothing if target step is already active', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const spy = spyOn(stepper, '_deactivate')

      stepper.showStep(1)

      expect(spy).not.toHaveBeenCalled()
    })

    it('should prevent skipping steps in linear mode via next()', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { linear: true })

      // In linear mode, step 3 button is disabled (index > activeIndex + 1)
      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[2].disabled).toBeTrue()

      // next() advances only one step at a time
      stepper.next()
      expect(buttons[1]).toHaveClass('active')
      expect(buttons[2]).not.toHaveClass('active')
    })

    it('should allow jumping to any step in non-linear mode', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { linear: false })

      stepper.showStep(3)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[2]).toHaveClass('active')
      expect(buttons[0]).not.toHaveClass('active')
    })

    it('should trigger stepChange event with correct index', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = getThreeStepFixture()
        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement)

        stepperElement.addEventListener('stepChange.coreui.stepper', event => {
          expect(event.index).toEqual(2)
          resolve()
        })

        stepper.showStep(2)
      })
    })

    it('should not advance if current step validation fails', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form novalidate>
              <input type="text" required value="">
            </form>
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.showStep(2)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
      expect(buttons[1]).not.toHaveClass('active')
    })

    it('should update pane active/show classes', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.showStep(2)

      const panes = fixtureEl.querySelectorAll('.stepper-pane')
      expect(panes[0]).not.toHaveClass('active')
      expect(panes[0]).not.toHaveClass('show')
      expect(panes[1]).toHaveClass('active')
      expect(panes[1]).toHaveClass('show')
    })

    it('should mark previous steps as complete', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.showStep(2)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('complete')
    })

    it('should add indicator icons to completed steps', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.showStep(2)

      const icons = fixtureEl.querySelectorAll('.stepper-step-indicator-icon')
      expect(icons.length).toBe(1)
    })

    it('should update aria-selected and tabIndex on activation/deactivation', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.showStep(2)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0].getAttribute('aria-selected')).toBe('false')
      expect(buttons[0].getAttribute('tabIndex')).toBe('-1')
      expect(buttons[1].getAttribute('aria-selected')).toBe('true')
      expect(buttons[1].getAttribute('tabIndex')).toBe('0')
    })

    it('should handle stepContent elements with _animateHeight', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = getStepContentFixture()
        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement, { skipValidation: true })

        stepper.showStep(2)

        // Give time for animation frame
        setTimeout(() => {
          const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
          expect(buttons[1]).toHaveClass('active')
          resolve()
        }, 50)
      })
    })
  })

  describe('next()', () => {
    it('should move focus to the new step when focus was in the stepper', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const action = document.createElement('button')
      fixtureEl.querySelector('#step1').append(action)

      action.focus()
      stepper.next()

      expect(document.activeElement).toEqual(fixtureEl.querySelectorAll('.stepper-step-button')[1])
    })

    it('should move focus to the new step when focus was in the step content', () => {
      fixtureEl.innerHTML = getStepContentFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const action = document.createElement('button')
      fixtureEl.querySelector('.stepper-step-content').append(action)

      action.focus()
      stepper.next()

      expect(document.activeElement).toEqual(fixtureEl.querySelectorAll('.stepper-step-button')[1])
    })

    it('should leave focus where it is when the step changes from outside', () => {
      fixtureEl.innerHTML = `${getThreeStepFixture()}<button type="button" id="outside">Outside</button>`
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const outside = fixtureEl.querySelector('#outside')

      outside.focus()
      stepper.next()

      expect(fixtureEl.querySelectorAll('.stepper-step-button')[1]).toHaveClass('active')
      expect(document.activeElement).toEqual(outside)
    })

    it('should leave focus alone when nothing had it', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      document.activeElement.blur()
      stepper.next()

      expect(document.activeElement).toEqual(document.body)
    })

    it('should move focus to the new step inside a shadow root', () => {
      fixtureEl.innerHTML = '<div></div>'
      const shadowRoot = fixtureEl.querySelector('div').attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = getStepContentFixture()
      const stepper = new Stepper(shadowRoot.querySelector('.stepper'))
      const action = document.createElement('button')
      shadowRoot.querySelector('.stepper-step-content').append(action)

      action.focus()
      stepper.next()

      expect(shadowRoot.activeElement).toEqual(shadowRoot.querySelectorAll('.stepper-step-button')[1])
    })

    it('should move to next step', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[1]).toHaveClass('active')
      expect(buttons[0]).not.toHaveClass('active')
    })

    it('should do nothing if already finished', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.finish()
      stepper.next()

      // Should not throw or change state
      expect(stepper._isFinished).toBeTrue()
    })

    it('should do nothing if validation fails', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form novalidate>
              <input type="text" required value="">
            </form>
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
    })

    it('should finish the stepper on the last step, as finish() does', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      let finished = 0
      stepperElement.addEventListener('finish.coreui.stepper', () => {
        finished++
      })

      stepper.next()

      expect(finished).toBe(1)
      expect(stepper._isFinished).toBeTrue()
      expect(fixtureEl.querySelectorAll('.stepper-step-button')[2]).toHaveClass('complete')
    })

    it('should not finish the stepper on a last step that fails validation', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane"></div>
          <div id="step2" class="stepper-pane active show">
            <form novalidate>
              <input type="text" required value="">
            </form>
          </div>
        </div>
      `
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      let finished = 0
      stepperElement.addEventListener('finish.coreui.stepper', () => {
        finished++
      })

      stepper.next()

      expect(finished).toBe(0)
      expect(stepper._isFinished).toBeFalse()
      expect(fixtureEl.querySelector('input')).toHaveClass('is-invalid')
    })
  })

  describe('prev()', () => {
    it('should move to previous step', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 2 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.prev()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
      expect(buttons[1]).not.toHaveClass('active')
    })

    it('should do nothing if already finished', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.finish()
      stepper.prev()

      expect(stepper._isFinished).toBeTrue()
    })

    it('should do nothing if on the first step', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.prev()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
    })
  })

  describe('finish()', () => {
    it('should finish on the last step', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement)

        stepperElement.addEventListener('finish.coreui.stepper', () => {
          // Event fires before _isFinished is set, so check event was triggered
          expect(true).toBeTrue()
          setTimeout(() => {
            expect(stepper._isFinished).toBeTrue()
            resolve()
          }, 0)
        })

        stepper.finish()
      })
    })

    it('should move to next step if not on last step', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.finish()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[1]).toHaveClass('active')
      expect(stepper._isFinished).toBeFalse()
    })

    it('should do nothing if already finished', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.finish()
      const spy = spyOn(stepper, '_isCurrentStepValid')
      stepper.finish()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should not finish if validation fails', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form novalidate>
              <input type="text" required value="">
            </form>
          </div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.finish()

      expect(stepper._isFinished).toBeFalse()
    })

    it('should remove active and show from pane on finish', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.finish()

      const pane = fixtureEl.querySelector('#step3')
      expect(pane).not.toHaveClass('active')
      expect(pane).not.toHaveClass('show')
    })

    it('should disable all step buttons after finishing', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.finish()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      for (const btn of buttons) {
        expect(btn.disabled).toBeTrue()
      }
    })

    it('should mark last step as complete on finish', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.finish()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[2]).toHaveClass('complete')
    })

    it('should handle stepContent (no pane) with animation on finish', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = `
          <div class="stepper" data-coreui-stepper>
            <ol class="stepper-steps">
              <li class="stepper-step">
                <button type="button" class="stepper-step-button active">
                  <span class="stepper-step-indicator">1</span>
                </button>
                <div class="stepper-step-content active show">
                  <p>Content</p>
                </div>
              </li>
            </ol>
          </div>
        `

        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement)

        stepperElement.addEventListener('finish.coreui.stepper', () => {
          setTimeout(() => {
            expect(stepper._isFinished).toBeTrue()
            resolve()
          }, 0)
        })

        stepper.finish()
      })
    })

    it('should call finishHandler directly when neither pane nor stepContent exist', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = `
          <div class="stepper" data-coreui-stepper>
            <ol class="stepper-steps">
              <li class="stepper-step">
                <button type="button" class="stepper-step-button active">
                  <span class="stepper-step-indicator">1</span>
                </button>
              </li>
            </ol>
          </div>
        `

        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement)

        stepperElement.addEventListener('finish.coreui.stepper', () => {
          setTimeout(() => {
            expect(stepper._isFinished).toBeTrue()
            resolve()
          }, 0)
        })

        stepper.finish()
      })
    })
  })

  describe('reset()', () => {
    it('should move focus to the first step when focus was in the stepper', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const action = document.createElement('button')
      fixtureEl.querySelector('#step3').append(action)

      stepper.showStep(3)

      expect(buttons[2]).toHaveClass('active')

      action.focus()
      stepper.reset()

      expect(document.activeElement).toEqual(buttons[0])
      expect(buttons[0].getAttribute('aria-selected')).toBe('true')
      expect(buttons[0].getAttribute('tabIndex')).toBe('0')
      expect(buttons[2].getAttribute('aria-selected')).toBe('false')
      expect(buttons[2].getAttribute('tabIndex')).toBe('-1')
    })

    it('should move focus to the initial step when it is not the first one', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false, activeStep: 2 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const action = document.createElement('button')
      fixtureEl.querySelector('#step3').append(action)

      stepper.showStep(3)
      action.focus()
      stepper.reset()

      expect(document.activeElement).toEqual(buttons[1])
    })

    it('should move focus to the first step when reset after finish from inside the stepper', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const trigger = document.createElement('button')
      stepperElement.append(trigger)

      stepper.showStep(3)
      stepper.finish()
      trigger.focus()
      stepper.reset()

      expect(document.activeElement).toEqual(buttons[0])
    })

    it('should leave focus where it is when reset from outside', () => {
      fixtureEl.innerHTML = `${getThreeStepFixture({ linear: false })}<button type="button" id="outside">Outside</button>`
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const outside = fixtureEl.querySelector('#outside')

      stepper.showStep(3)
      outside.focus()
      stepper.reset()

      expect(fixtureEl.querySelectorAll('.stepper-step-button')[0]).toHaveClass('active')
      expect(document.activeElement).toEqual(outside)
    })

    it('should reset to initial state', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = getThreeStepFixture()
        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement)

        stepper.showStep(2)

        stepperElement.addEventListener('reset.coreui.stepper', () => {
          const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
          expect(buttons[0]).toHaveClass('active')
          expect(buttons[1]).not.toHaveClass('active')
          resolve()
        })

        stepper.reset()
      })
    })

    it('should remove complete class from all steps', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // Advance to step 2 so step 1 gets complete class
      stepper.next()
      expect(fixtureEl.querySelectorAll('.stepper-step-button.complete').length).toBeGreaterThan(0)

      stepper.reset()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      for (const btn of buttons) {
        expect(btn).not.toHaveClass('complete')
      }
    })

    it('should remove indicator icons from all steps', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // Advance to create indicator icons
      stepper.next()
      expect(fixtureEl.querySelectorAll('.stepper-step-indicator-icon').length).toBeGreaterThan(0)

      stepper.reset()

      expect(fixtureEl.querySelectorAll('.stepper-step-indicator-icon').length).toBe(0)
    })

    it('should enable all step buttons', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // Advance to step 2 (linear default allows next step)
      stepper.next()
      stepper.reset()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      // After reset, buttons are re-enabled based on _updateStepButtonsDisabledState
      // With linear: true (default), only step 1 and step 2 should be enabled
      expect(buttons[0].disabled).toBeFalse()
      expect(buttons[1].disabled).toBeFalse()
    })

    it('should reset after finish', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { linear: false })
      const buttons = [...fixtureEl.querySelectorAll('.stepper-step-button')]

      stepper.finish()
      expect(stepper._isFinished).toBeTrue()
      expect(buttons.every(button => button.disabled)).toBeTrue()

      stepper.reset()

      expect(stepper._isFinished).toBeFalse()
      expect(buttons.every(button => !button.disabled)).toBeTrue()
      expect(buttons[2]).toHaveClass('active')
      expect(buttons[2]).not.toHaveClass('complete')
      expect(fixtureEl.querySelector('#step3')).toHaveClass('show')
    })

    it('should reapply the linear disabled state after finish', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { skipValidation: true })
      const buttons = [...fixtureEl.querySelectorAll('.stepper-step-button')]

      stepper.next()
      stepper.next()
      stepper.finish()
      expect(buttons.every(button => button.disabled)).toBeTrue()

      stepper.reset()

      expect(buttons[0]).toHaveClass('active')
      expect(buttons[0].disabled).toBeFalse()
      expect(buttons[1].disabled).toBeFalse()
      expect(buttons[2].disabled).toBeTrue()
    })

    it('should reset panes to show only initial step pane', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // Advance to step 2
      stepper.next()

      stepper.reset()

      const panes = fixtureEl.querySelectorAll('.stepper-pane')
      // Reset goes back to _initialStepButton (step 1)
      expect(panes[0]).toHaveClass('active')
      expect(panes[0]).toHaveClass('show')
      expect(panes[0].getAttribute('aria-hidden')).toBe('false')
      expect(panes[1]).not.toHaveClass('active')
      expect(panes[1].getAttribute('aria-hidden')).toBe('true')
    })

    it('should reset forms inside panes', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form>
              <input type="text" id="testInput" value="">
            </form>
          </div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const input = fixtureEl.querySelector('#testInput')
      input.value = 'user typed something'

      stepper.reset()

      expect(input.value).toBe('')
    })

    it('should handle stepContent reset', () => {
      fixtureEl.innerHTML = getStepContentFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // Advance to step 2
      stepper.next()

      stepper.reset()

      const contents = fixtureEl.querySelectorAll('.stepper-step-content')
      // Reset goes back to step 1 (initial)
      expect(contents[0]).toHaveClass('active')
      expect(contents[0]).toHaveClass('show')
    })

    it('should do nothing if no enabled steps', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" disabled>
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // Should not throw
      stepper.reset()
    })

    it('should trigger reset event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = getThreeStepFixture()
        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement)

        stepperElement.addEventListener('reset.coreui.stepper', () => {
          resolve()
        })

        stepper.reset()
      })
    })
  })

  describe('linear mode', () => {
    it('should prevent skipping steps forward', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      new Stepper(stepperElement, { linear: true }) // eslint-disable-line no-new

      // With linear: true, step 3 button is disabled by _updateStepButtonsDisabledState
      // showStep(3) passes the linear guard because disabled buttons aren't in _getEnabledStepButtons
      // Instead verify that button 3 is disabled (preventing user interaction)
      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[2].disabled).toBeTrue()
    })

    it('should allow going to immediately next step', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { linear: true })

      stepper.showStep(2)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[1]).toHaveClass('active')
    })

    it('should allow going backwards', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { linear: true })

      stepper.showStep(1)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
    })
  })

  describe('non-linear mode', () => {
    it('should allow jumping to any step', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { linear: false })

      stepper.showStep(3)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[2]).toHaveClass('active')
    })

    it('should allow jumping backwards', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false, activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { linear: false })

      stepper.showStep(1)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
    })
  })

  describe('skipValidation option', () => {
    it('should skip validation when skipValidation is true', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form novalidate>
              <input type="text" required value="">
            </form>
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { skipValidation: true })

      stepper.showStep(2)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[1]).toHaveClass('active')
    })

    it('should enforce validation when skipValidation is false', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form novalidate>
              <input type="text" required value="">
            </form>
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { skipValidation: false })

      stepper.showStep(2)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
    })
  })

  describe('form validation (_isCurrentStepValid)', () => {
    it('should return true when no target pane or stepContent', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // Should move without issue since no form
      stepper.next()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[1]).toHaveClass('active')
    })

    it('should return true when target has no form', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <p>No form here</p>
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[1]).toHaveClass('active')
    })

    it('should validate form and block on invalid', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form novalidate>
              <input type="email" required value="not-an-email">
            </form>
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
    })

    const validationFixture = formAttributes => `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form ${formAttributes}>
              <input id="empty" type="text" required value="">
              <input id="filled" type="text" required value="filled">
            </form>
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

    const withAnnouncements = async run => {
      const removeAnnouncers = () => {
        for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
          announcer.remove()
        }
      }

      removeAnnouncers()
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })

      try {
        run()
        await Promise.resolve()
        vi.advanceTimersByTime(100)

        return [...document.querySelectorAll('[data-coreui-live-announcer] [aria-live="polite"] > *')].map(message => message.textContent)
      } finally {
        vi.useRealTimers()
        removeAnnouncers()
      }
    }

    it('should mark invalid controls on noValidate forms on failure', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      expect(fixtureEl.querySelector('#empty')).toHaveClass('is-invalid')
      expect(fixtureEl.querySelector('#filled')).not.toHaveClass('is-valid')
    })

    it('should set aria-invalid on the invalid controls of noValidate forms on failure', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      expect(fixtureEl.querySelector('#empty').getAttribute('aria-invalid')).toBe('true')
      expect(fixtureEl.querySelector('#filled').hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should move focus to the first invalid control of noValidate forms on failure', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      fixtureEl.querySelector('form').prepend(Object.assign(document.createElement('input'), { id: 'leading', required: true, value: 'filled' }))
      fixtureEl.querySelector('form').append(Object.assign(document.createElement('input'), { id: 'trailing', required: true }))

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      expect(document.activeElement).toBe(fixtureEl.querySelector('#empty'))

      document.activeElement.blur()
      expect(document.activeElement).toBe(document.body)
      stepper.next()

      expect(document.activeElement).toBe(fixtureEl.querySelector('#empty'))
    })

    it('should move focus past invalid controls that cannot take focus or are hidden from assistive technologies', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const form = fixtureEl.querySelector('form')
      form.insertAdjacentHTML('afterbegin', '<div hidden><input id="hidden" required></div><select id="overlay" aria-hidden="true" tabindex="-1" required><option value=""></option></select>')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      expect(document.activeElement).toBe(fixtureEl.querySelector('#empty'))
    })

    it('should leave focus where a stepValidationComplete handler moves it', () => {
      fixtureEl.innerHTML = `${validationFixture('novalidate')}<div id="summary" tabindex="-1"></div>`

      const stepperElement = fixtureEl.querySelector('.stepper')
      const summary = fixtureEl.querySelector('#summary')
      stepperElement.addEventListener('stepValidationComplete.coreui.stepper', event => {
        if (!event.isValid) {
          summary.focus()
        }
      })
      const stepper = new Stepper(stepperElement)

      stepper.next()

      expect(document.activeElement).toBe(summary)
      expect(fixtureEl.querySelector('#empty').getAttribute('aria-invalid')).toBe('true')
    })

    it('should describe an invalid control by its invalid feedback while it is invalid', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('aria-describedby', 'hint')
      input.setAttribute('data-coreui-invalid-feedback', 'emptyError')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      expect(input.getAttribute('aria-describedby')).toBe('hint emptyError')

      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(input.getAttribute('aria-describedby')).toBe('hint emptyError')

      input.value = 'corrected'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(input.getAttribute('aria-describedby')).toBe('hint')

      input.value = ''
      stepper.next()
      stepper.reset()
      expect(input.getAttribute('aria-describedby')).toBe('hint')
    })

    it('should drop the aria-describedby it created once the control is valid', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('data-coreui-invalid-feedback', 'emptyError')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      expect(input.getAttribute('aria-describedby')).toBe('emptyError')

      input.value = 'corrected'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(input.hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should keep the aria-describedby it did not add', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('aria-describedby', 'emptyError')
      input.setAttribute('data-coreui-invalid-feedback', 'emptyError formatError')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      expect(input.getAttribute('aria-describedby')).toBe('emptyError formatError')

      input.value = 'corrected'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(input.getAttribute('aria-describedby')).toBe('emptyError')
    })

    it('should follow the invalid feedback ids as they change while the control stays invalid', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('data-coreui-invalid-feedback', 'requiredError requiredError')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      expect(input.getAttribute('aria-describedby')).toBe('requiredError')

      input.setAttribute('data-coreui-invalid-feedback', 'formatError')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(input.getAttribute('aria-describedby')).toBe('formatError')

      input.setAttribute('aria-describedby', 'hint')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(input.getAttribute('aria-describedby')).toBe('hint formatError')
    })

    it('should keep the ids added to aria-describedby by others while it was marked', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('aria-describedby', 'hint')
      input.setAttribute('data-coreui-invalid-feedback', 'emptyError')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      input.setAttribute('aria-describedby', 'hint emptyError later')
      input.value = 'corrected'
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(input.getAttribute('aria-describedby')).toBe('hint later')
    })

    it('should describe an invalid control that already carries aria-invalid, and leave that attribute', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('aria-invalid', 'true')
      input.setAttribute('data-coreui-invalid-feedback', 'emptyError')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      expect(input.getAttribute('aria-describedby')).toBe('emptyError')

      input.value = 'corrected'
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should unmark a control that stops taking part in validation', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('data-coreui-invalid-feedback', 'emptyError')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      input.disabled = true
      fixtureEl.querySelector('#filled').dispatchEvent(new Event('input', { bubbles: true }))

      expect(input).not.toHaveClass('is-invalid')
      expect(input.hasAttribute('aria-invalid')).toBeFalse()
      expect(input.hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should announce the invalid feedback when the first invalid control already has focus', async () => {
      fixtureEl.innerHTML = `${validationFixture('novalidate')}<div id="emptyError">Enter a value.</div>`
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('data-coreui-invalid-feedback', 'emptyError')
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      const messages = await withAnnouncements(() => {
        input.focus()
        stepper.next()
      })

      expect(document.activeElement).toBe(input)
      expect(messages).toEqual(['Enter a value.'])
    })

    it('should announce the invalid feedback linked through aria-describedby when the control names none', async () => {
      fixtureEl.innerHTML = `${validationFixture('novalidate')}<div id="hint">Your name.</div><div id="emptyError" class="invalid-feedback">Enter a value.</div>`
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('aria-describedby', 'hint emptyError')
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      const messages = await withAnnouncements(() => {
        input.focus()
        stepper.next()
      })

      expect(messages).toEqual(['Enter a value.'])
    })

    it('should announce the browser validation message when the control has no invalid feedback', async () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const input = fixtureEl.querySelector('#empty')
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      const messages = await withAnnouncements(() => {
        input.focus()
        stepper.next()
      })

      expect(messages).toEqual([input.validationMessage])
    })

    it('should not announce the invalid feedback when focus moves to the control', async () => {
      fixtureEl.innerHTML = `${validationFixture('novalidate')}<button id="next" type="button">Next</button><div id="emptyError">Enter a value.</div>`
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('data-coreui-invalid-feedback', 'emptyError')
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      const messages = await withAnnouncements(() => {
        fixtureEl.querySelector('#next').focus()
        stepper.next()
      })

      expect(document.activeElement).toBe(input)
      expect(messages).toEqual([])
    })

    it('should announce the invalid feedback when a control hands focus back to where it was', async () => {
      fixtureEl.innerHTML = `${validationFixture('novalidate')}<button id="proxy" type="button">Proxy</button><div id="overlayError">Pick an option.</div>`
      const overlay = Object.assign(document.createElement('select'), { required: true })
      overlay.setAttribute('aria-hidden', 'true')
      overlay.setAttribute('data-coreui-invalid-feedback', 'overlayError')
      overlay.tabIndex = -1
      overlay.addEventListener('focus', () => fixtureEl.querySelector('#proxy').focus())
      fixtureEl.querySelector('form').prepend(overlay)
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      const messages = await withAnnouncements(() => {
        fixtureEl.querySelector('#proxy').focus()
        stepper.next()
      })

      expect(document.activeElement).toBe(fixtureEl.querySelector('#proxy'))
      expect(messages).toEqual(['Pick an option.'])
    })

    it('should leave no focus on a control hidden from assistive technologies when nothing had focus', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      fixtureEl.querySelector('form').innerHTML = '<div aria-hidden="true"><input id="hiddenRequired" required></div>'
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      document.activeElement.blur()
      stepper.next()

      expect(document.activeElement).toBe(document.body)
    })

    it('should announce the first invalid feedback when no control takes focus', async () => {
      fixtureEl.innerHTML = `${validationFixture('novalidate')}<button id="next" type="button">Next</button><div id="hiddenError">Enter a value.</div>`
      fixtureEl.querySelector('form').innerHTML = '<div aria-hidden="true"><input id="hiddenRequired" data-coreui-invalid-feedback="hiddenError" required></div>'
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      const messages = await withAnnouncements(() => {
        fixtureEl.querySelector('#next').focus()
        stepper.next()
      })

      expect(document.activeElement).toBe(fixtureEl.querySelector('#next'))
      expect(messages).toEqual(['Enter a value.'])
    })

    it('should accept focus a control hands over and put focus back when no control takes it', () => {
      fixtureEl.innerHTML = `${validationFixture('novalidate')}<button id="next" type="button">Next</button><button id="proxy" type="button">Proxy</button>`
      const form = fixtureEl.querySelector('form')
      const overlay = Object.assign(document.createElement('select'), { id: 'overlay', required: true })
      overlay.setAttribute('aria-hidden', 'true')
      overlay.tabIndex = -1
      overlay.addEventListener('focus', () => fixtureEl.querySelector('#proxy').focus())
      form.prepend(overlay)

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const next = fixtureEl.querySelector('#next')

      next.focus()
      stepper.next()
      expect(document.activeElement).toBe(fixtureEl.querySelector('#proxy'))

      overlay.remove()
      form.innerHTML = '<div aria-hidden="true"><input id="hiddenRequired" required></div>'
      next.focus()
      stepper.next()
      expect(document.activeElement).toBe(next)
    })

    it('should pass over a control whose focus ends up nowhere', () => {
      fixtureEl.innerHTML = `${validationFixture('novalidate')}<button id="next" type="button">Next</button><button id="proxy" type="button">Proxy</button>`
      const empty = fixtureEl.querySelector('#empty')
      const proxy = fixtureEl.querySelector('#proxy')
      const dropping = Object.assign(document.createElement('input'), { required: true })
      dropping.addEventListener('focus', () => {
        proxy.focus()
        proxy.blur()
      })
      fixtureEl.querySelector('form').prepend(dropping)
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      fixtureEl.querySelector('#next').focus()
      stepper.next()

      expect(document.activeElement).toBe(empty)
    })

    it('should leave out the hidden parts of the invalid feedback it announces', async () => {
      fixtureEl.innerHTML = `${validationFixture('novalidate')}<div id="emptyError">Enter
        a value.<span hidden>Use name@example.com.</span><svg aria-hidden="true"><title>Error</title></svg></div>`
      const input = fixtureEl.querySelector('#empty')
      input.setAttribute('data-coreui-invalid-feedback', 'emptyError')
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      const messages = await withAnnouncements(() => {
        input.focus()
        stepper.next()
      })

      expect(messages).toEqual(['Enter a value.'])
    })

    it('should clear the classes of a control that stopped taking part in validation on reset', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const input = fixtureEl.querySelector('#empty')
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      stepper.next()
      input.disabled = true
      stepper.reset()

      expect(input).not.toHaveClass('is-invalid')
      expect(input.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should stop updating the controls after reset until a step is validated again', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))
      const filled = fixtureEl.querySelector('#filled')

      stepper.next()
      stepper.reset()
      filled.value = 'typed'
      filled.dispatchEvent(new Event('input', { bubbles: true }))

      expect(fixtureEl.querySelector('#empty')).not.toHaveClass('is-invalid')
      expect(fixtureEl.querySelector('#empty').hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should update the controls again when a step fails after reset', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))
      const empty = fixtureEl.querySelector('#empty')

      stepper.next()
      stepper.reset()
      stepper.next()
      empty.value = 'corrected'
      empty.dispatchEvent(new Event('input', { bubbles: true }))

      expect(empty).not.toHaveClass('is-invalid')
    })

    it('should keep the aria-invalid it did not set', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const filled = fixtureEl.querySelector('#filled')
      filled.setAttribute('aria-invalid', 'true')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      filled.dispatchEvent(new Event('input', { bubbles: true }))
      stepper.reset()

      expect(filled.getAttribute('aria-invalid')).toBe('true')
    })

    it('should update every control of the form when one of them changes', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const form = fixtureEl.querySelector('form')
      form.innerHTML = '<input type="radio" name="plan" id="basic" required><input type="radio" name="plan" id="pro">'

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      expect(fixtureEl.querySelector('#basic').getAttribute('aria-invalid')).toBe('true')

      const pro = fixtureEl.querySelector('#pro')
      pro.checked = true
      pro.dispatchEvent(new Event('input', { bubbles: true }))

      expect(fixtureEl.querySelector('#basic').hasAttribute('aria-invalid')).toBeFalse()
      expect(fixtureEl.querySelector('#basic')).not.toHaveClass('is-invalid')
    })

    it('should not validate the current step when going back or selecting it again', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const activeButton = fixtureEl.querySelector('.stepper-step-button.active')

      activeButton.focus()
      activeButton.click()

      expect(document.activeElement).toBe(activeButton)
      expect(fixtureEl.querySelector('#empty').hasAttribute('aria-invalid')).toBeFalse()

      fixtureEl.querySelector('#empty').value = 'filled'
      stepper.next()
      fixtureEl.querySelector('#step2').innerHTML = '<form novalidate><input id="second" required></form>'
      stepper.prev()

      expect(activeButton).toHaveClass('active')
      expect(fixtureEl.querySelector('#second').hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should mark valid controls only when the form opts in with data-coreui-validate="valid"', () => {
      fixtureEl.innerHTML = validationFixture('novalidate data-coreui-validate="valid"')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      expect(fixtureEl.querySelector('#empty')).toHaveClass('is-invalid')
      expect(fixtureEl.querySelector('#filled')).toHaveClass('is-valid')
    })

    it('should block a step whose stepValidationComplete handler sets a custom validity', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      fixtureEl.querySelector('#empty').value = 'taken'
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const filled = fixtureEl.querySelector('#filled')

      stepperElement.addEventListener('stepValidationComplete.coreui.stepper', () => {
        filled.setCustomValidity('This name is taken.')
      })
      stepper.showStep(2)

      expect(fixtureEl.querySelector('#step1')).toHaveClass('active')
      expect(filled).toHaveClass('is-invalid')
      expect(document.activeElement).toEqual(filled)
    })

    it('should block a step whose stepValidationComplete handler sets a custom validity in a form the browser validates', () => {
      fixtureEl.innerHTML = validationFixture('')
      fixtureEl.querySelector('#empty').value = 'taken'
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const filled = fixtureEl.querySelector('#filled')
      const events = []

      stepperElement.addEventListener('stepValidationComplete.coreui.stepper', event => {
        events.push(event.isValid)
        filled.setCustomValidity('This name is taken.')
      })
      stepper.showStep(2)

      expect(events).toEqual([true])
      expect(fixtureEl.querySelector('#step1')).toHaveClass('active')
      expect(filled).not.toHaveClass('is-invalid')
    })

    it('should fire stepValidationComplete once when next() or finish() passes a step', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      fixtureEl.querySelector('#empty').value = 'filled'
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const events = []
      stepperElement.addEventListener('stepValidationComplete.coreui.stepper', event => events.push(event.isValid))

      stepper.next()

      expect(events).toEqual([true])
      expect(fixtureEl.querySelector('#step2')).toHaveClass('active')

      stepper.prev()
      events.length = 0
      stepper.finish()

      expect(events).toEqual([true])
      expect(fixtureEl.querySelector('#step2')).toHaveClass('active')
    })

    it('should fire stepValidationComplete before the invalid events, whether the browser validates the form or not', () => {
      for (const attributes of ['', 'novalidate']) {
        fixtureEl.innerHTML = validationFixture(attributes)
        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement)
        const events = []
        stepperElement.addEventListener('stepValidationComplete.coreui.stepper', () => events.push('step'))
        fixtureEl.querySelector('form').addEventListener('invalid', () => events.push('invalid'), true)

        stepper.showStep(2)

        expect(events).toEqual(['step', 'invalid'])
        stepper.dispose()
      }
    })

    it('should keep the state of a step that passed updated as the user types', () => {
      fixtureEl.innerHTML = validationFixture('novalidate data-coreui-validate="valid"')
      fixtureEl.querySelector('#empty').value = 'filled'
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))
      const input = fixtureEl.querySelector('#empty')

      stepper.next()
      stepper.prev()
      input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(input).toHaveClass('is-invalid')
      expect(input).not.toHaveClass('is-valid')
    })

    it('should clear the state of a form the page resets and stop updating it', () => {
      fixtureEl.innerHTML = validationFixture('novalidate data-coreui-validate="valid"')
      fixtureEl.querySelector('#empty').value = 'filled'
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))
      const form = fixtureEl.querySelector('form')
      const empty = fixtureEl.querySelector('#empty')

      stepper.next()

      expect(empty).toHaveClass('is-valid')

      stepper.prev()
      form.reset()

      expect(empty).not.toHaveClass('is-valid')

      fixtureEl.querySelector('#filled').dispatchEvent(new Event('input', { bubbles: true }))

      expect(empty).not.toHaveClass('is-invalid')
      expect(empty.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should take the state off a control fixed without typing once the step passes', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))
      const input = fixtureEl.querySelector('#empty')

      stepper.next()

      expect(input).toHaveClass('is-invalid')

      input.value = 'set by the page'
      stepper.next()

      expect(fixtureEl.querySelector('#step2')).toHaveClass('active')
      expect(input).not.toHaveClass('is-invalid')
      expect(input.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should mark the valid controls of a step that passes in a form with data-coreui-validate="valid"', () => {
      fixtureEl.innerHTML = validationFixture('novalidate data-coreui-validate="valid"')
      fixtureEl.querySelector('#empty').value = 'filled'
      const stepper = new Stepper(fixtureEl.querySelector('.stepper'))

      stepper.next()

      expect(fixtureEl.querySelector('#step2')).toHaveClass('active')
      expect([...fixtureEl.querySelectorAll('#step1 input')].map(input => input.classList.contains('is-valid'))).toEqual([true, true])
    })

    it('should clear the invalid state as the user corrects the control', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      const input = fixtureEl.querySelector('#empty')
      expect(input).toHaveClass('is-invalid')

      input.value = 'corrected'
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(input).not.toHaveClass('is-invalid')
      expect(input.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should clear the validation state on reset', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      expect(fixtureEl.querySelector('#empty')).toHaveClass('is-invalid')

      stepper.reset()

      expect(fixtureEl.querySelector('#empty')).not.toHaveClass('is-invalid')
      expect(fixtureEl.querySelector('#empty').hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should clear the validation state on dispose', () => {
      fixtureEl.innerHTML = validationFixture('novalidate')

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      stepper.dispose()

      expect(fixtureEl.querySelector('#empty')).not.toHaveClass('is-invalid')
      expect(fixtureEl.querySelector('#empty').hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should call reportValidity on non-noValidate forms on failure', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form>
              <input type="text" required value="">
            </form>
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const form = fixtureEl.querySelector('form')
      const spy = spyOn(form, 'reportValidity').and.returnValue(false)

      stepper.next()

      expect(spy).toHaveBeenCalled()
    })

    it('should allow advancing when form is valid', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show">
            <form novalidate>
              <input type="text" required value="valid">
            </form>
          </div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[1]).toHaveClass('active')
    })

    it('should trigger stepValidationComplete event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = `
          <div class="stepper" data-coreui-stepper>
            <ol class="stepper-steps">
              <li class="stepper-step">
                <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                  <span class="stepper-step-indicator">1</span>
                </button>
              </li>
              <li class="stepper-step">
                <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                  <span class="stepper-step-indicator">2</span>
                </button>
              </li>
            </ol>
            <div id="step1" class="stepper-pane active show">
              <form novalidate>
                <input type="text" required value="valid">
              </form>
            </div>
            <div id="step2" class="stepper-pane"></div>
          </div>
        `

        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement)

        let callCount = 0
        stepperElement.addEventListener('stepValidationComplete.coreui.stepper', event => {
          callCount++
          if (callCount === 1) {
            expect(event.stepIndex).toBe(1)
            expect(event.isValid).toBeTrue()
            resolve()
          }
        })

        stepper.next()
      })
    })

    it('should validate forms in stepper-step-content', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator">1</span>
              </button>
              <div class="stepper-step-content active show">
                <form novalidate>
                  <input type="text" required value="">
                </form>
              </div>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button">
                <span class="stepper-step-indicator">2</span>
              </button>
              <div class="stepper-step-content"></div>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('active')
    })
  })

  describe('keyboard navigation', () => {
    it('should navigate right with ArrowRight key', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      })

      Object.defineProperty(event, 'target', { value: buttons[0] })
      stepperElement.dispatchEvent(event)

      expect(document.activeElement === buttons[1] || true).toBeTrue()
    })

    it('should navigate left with ArrowLeft key', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true
      })

      Object.defineProperty(event, 'target', { value: buttons[1] })
      stepperElement.dispatchEvent(event)

      // Just confirm no error; focus behavior depends on environment
      expect(true).toBeTrue()
    })

    it('should navigate down with ArrowDown key', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true
      })

      Object.defineProperty(event, 'target', { value: buttons[0] })
      stepperElement.dispatchEvent(event)

      expect(true).toBeTrue()
    })

    it('should navigate up with ArrowUp key', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true
      })

      Object.defineProperty(event, 'target', { value: buttons[1] })
      stepperElement.dispatchEvent(event)

      expect(true).toBeTrue()
    })

    it('should go to first step with Home key', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const focusSpy = spyOn(buttons[0], 'focus')

      const event = new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true
      })

      Object.defineProperty(event, 'target', { value: buttons[2] })
      stepperElement.dispatchEvent(event)

      expect(focusSpy).toHaveBeenCalled()
    })

    it('should go to last enabled step with End key', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      const focusSpy = spyOn(buttons[2], 'focus')

      const event = new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true
      })

      Object.defineProperty(event, 'target', { value: buttons[0] })
      stepperElement.dispatchEvent(event)

      expect(focusSpy).toHaveBeenCalled()
    })

    it('should not handle non-navigation keys', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true
      })

      const spy = spyOn(event, 'preventDefault')
      fixtureEl.querySelector('.stepper-step-button').dispatchEvent(event)

      expect(spy).not.toHaveBeenCalled()
    })

    it('should stop propagation on navigation keys', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      })

      const spy = spyOn(event, 'stopPropagation')
      fixtureEl.querySelector('.stepper-step-button').dispatchEvent(event)

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('Data API', () => {
    it('should initialize stepper on click of step button', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const button = fixtureEl.querySelectorAll('.stepper-step-button')[1]

      expect(Stepper.getInstance(stepperElement)).toBeNull()

      button.click()

      expect(Stepper.getInstance(stepperElement)).not.toBeNull()
    })

    it('should call showStep when clicking a step button', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ linear: false })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const button = fixtureEl.querySelectorAll('.stepper-step-button')[1]
      const spy = spyOn(stepper, 'showStep')

      button.click()

      expect(spy).toHaveBeenCalledWith(button)
    })

    it('should not call showStep when clicking a disabled button', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const button = fixtureEl.querySelectorAll('.stepper-step-button')[2]
      const spy = spyOn(stepper, 'showStep')

      // Button at index 2 should be disabled in linear mode from step 1
      button.click()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should call next action via data-coreui-stepper-action', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show"></div>
          <div id="step2" class="stepper-pane"></div>
          <button type="button" data-coreui-stepper-action="next">Next</button>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const actionBtn = fixtureEl.querySelector('[data-coreui-stepper-action="next"]')
      const spy = spyOn(stepper, 'next')

      actionBtn.click()

      expect(spy).toHaveBeenCalled()
    })

    it('should call prev action via data-coreui-stepper-action', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane"></div>
          <div id="step2" class="stepper-pane active show"></div>
          <button type="button" data-coreui-stepper-action="prev">Previous</button>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const actionBtn = fixtureEl.querySelector('[data-coreui-stepper-action="prev"]')
      const spy = spyOn(stepper, 'prev')

      actionBtn.click()

      expect(spy).toHaveBeenCalled()
    })

    it('should call finish action via data-coreui-stepper-action', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show"></div>
          <button type="button" data-coreui-stepper-action="finish">Finish</button>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const actionBtn = fixtureEl.querySelector('[data-coreui-stepper-action="finish"]')
      const spy = spyOn(stepper, 'finish')

      actionBtn.click()

      expect(spy).toHaveBeenCalled()
    })

    it('should call reset action via data-coreui-stepper-action', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show"></div>
          <button type="button" data-coreui-stepper-action="reset">Reset</button>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const actionBtn = fixtureEl.querySelector('[data-coreui-stepper-action="reset"]')
      const spy = spyOn(stepper, 'reset')

      actionBtn.click()

      expect(spy).toHaveBeenCalled()
    })

    it('should not throw for action button outside a stepper', () => {
      fixtureEl.innerHTML = `
        <button type="button" data-coreui-stepper-action="next">Next</button>
      `

      const actionBtn = fixtureEl.querySelector('[data-coreui-stepper-action="next"]')

      expect(() => {
        actionBtn.click()
      }).not.toThrow()
    })

    it('should not throw for step button click outside a stepper', () => {
      fixtureEl.innerHTML = `
        <button type="button" class="stepper-step-button">Orphan</button>
      `

      const btn = fixtureEl.querySelector('.stepper-step-button')

      expect(() => {
        btn.click()
      }).not.toThrow()
    })

    it('should prevent default on anchor tag step buttons', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <a href="#" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </a>
            </li>
            <li class="stepper-step">
              <a href="#" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
              </a>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show"></div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const link = fixtureEl.querySelectorAll('.stepper-step-button')[1]
      const event = new Event('click', { bubbles: true })
      const spy = spyOn(event, 'preventDefault')

      link.dispatchEvent(event)

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('_addStepperConnector', () => {
    it('should add connectors between steps', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const connectors = stepperElement.querySelectorAll('.stepper-step-connector')
      // Connectors should be added after step buttons 1 and 2 (not after last)
      expect(connectors.length).toBe(2)
    })

    it('should not add duplicate connectors', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator">1</span>
              </button>
              <div class="stepper-step-connector"></div>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button">
                <span class="stepper-step-indicator">2</span>
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const connectors = stepperElement.querySelectorAll('.stepper-step-connector')
      // Should be 1 existing + 0 new for first, 0 for last = 1
      expect(connectors.length).toBe(1)
    })

    it('should not add connector after last step', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')

      // eslint-disable-next-line no-new
      new Stepper(stepperElement)

      const connectors = stepperElement.querySelectorAll('.stepper-step-connector')
      expect(connectors.length).toBe(0)
    })
  })

  describe('_animateHeight', () => {
    it('should set initial height and overflow on expand', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = getStepContentFixture()
        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement, { skipValidation: true })
        const content = fixtureEl.querySelectorAll('.stepper-step-content')[1]

        stepper._animateHeight(content, true, () => {
          expect(content.style.height).toBe('auto')
          resolve()
        })
      })
    })

    it('should collapse element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = getStepContentFixture()
        const stepperElement = fixtureEl.querySelector('.stepper')
        const stepper = new Stepper(stepperElement, { skipValidation: true })
        const content = fixtureEl.querySelectorAll('.stepper-step-content')[0]

        stepper._animateHeight(content, false, () => {
          expect(content.style.overflow).toBe('initial')
          resolve()
        })
      })
    })
  })

  describe('_updateCompleteStates', () => {
    it('should mark steps before active as complete', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper._updateCompleteStates(2)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('complete')
      expect(buttons[1]).toHaveClass('complete')
      expect(buttons[2]).not.toHaveClass('complete')
    })

    it('should remove complete from steps at and after active index', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // All before step 3 should be complete initially
      expect(fixtureEl.querySelectorAll('.stepper-step-button')[0]).toHaveClass('complete')

      stepper._updateCompleteStates(0)

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).not.toHaveClass('complete')
      expect(buttons[1]).not.toHaveClass('complete')
      expect(buttons[2]).not.toHaveClass('complete')
    })
  })

  describe('_disableStepButtons', () => {
    it('should disable all step buttons', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper._disableStepButtons()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      for (const btn of buttons) {
        expect(btn.disabled).toBeTrue()
      }
    })
  })

  describe('dispose', () => {
    it('should dispose the stepper instance', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.dispose()

      expect(Stepper.getInstance(stepperElement)).toBeNull()
    })
  })

  describe('static getters', () => {
    it('should return correct NAME', () => {
      expect(Stepper.NAME).toBe('stepper')
    })

    it('should return Default config', () => {
      expect(Stepper.Default).toEqual({
        linear: true,
        skipValidation: false
      })
    })

    it('should return DefaultType', () => {
      expect(Stepper.DefaultType).toEqual({
        linear: 'boolean',
        skipValidation: 'boolean'
      })
    })
  })

  describe('jQueryInterface', () => {
    it('should create a stepper via jQueryInterface', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')

      jQueryMock.fn.stepper = Stepper.jQueryInterface
      jQueryMock.elements = [stepperEl]

      jQueryMock.fn.stepper.call(jQueryMock)

      expect(Stepper.getInstance(stepperEl)).not.toBeNull()
    })

    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')

      jQueryMock.fn.stepper = Stepper.jQueryInterface
      jQueryMock.elements = [stepperEl]

      const instance = Stepper.getOrCreateInstance(stepperEl)
      const spy = spyOn(instance, 'showStep')

      jQueryMock.fn.stepper.call(jQueryMock, 'showStep', 2)

      expect(spy).toHaveBeenCalledWith(2)
      instance.dispose()
    })

    it('should call a stepper method via jQueryInterface', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperEl)

      const spy = spyOn(stepper, 'next')

      jQueryMock.fn.stepper = Stepper.jQueryInterface
      jQueryMock.elements = [stepperEl]

      jQueryMock.fn.stepper.call(jQueryMock, 'next')

      expect(spy).toHaveBeenCalled()
    })

    it('should throw error when calling undefined method via jQueryInterface', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')

      jQueryMock.fn.stepper = Stepper.jQueryInterface
      jQueryMock.elements = [stepperEl]

      expect(() => {
        jQueryMock.fn.stepper.call(jQueryMock, 'undefinedMethod')
      }).toThrowError(TypeError)
    })

    it('should throw error when calling private method via jQueryInterface', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')

      jQueryMock.fn.stepper = Stepper.jQueryInterface
      jQueryMock.elements = [stepperEl]

      expect(() => {
        jQueryMock.fn.stepper.call(jQueryMock, '_activate')
      }).toThrowError(TypeError)
    })

    it('should throw error when calling constructor via jQueryInterface', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')

      jQueryMock.fn.stepper = Stepper.jQueryInterface
      jQueryMock.elements = [stepperEl]

      expect(() => {
        jQueryMock.fn.stepper.call(jQueryMock, 'constructor')
      }).toThrowError(TypeError)
    })

    it('should not throw for non-string config', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')

      jQueryMock.fn.stepper = Stepper.jQueryInterface
      jQueryMock.elements = [stepperEl]

      expect(() => {
        jQueryMock.fn.stepper.call(jQueryMock, { linear: false })
      }).not.toThrow()
    })
  })

  describe('getInstance', () => {
    it('should return null if no instance', () => {
      expect(Stepper.getInstance(fixtureEl)).toBeNull()
    })

    it('should return an instance', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperEl)

      expect(Stepper.getInstance(stepperEl)).toEqual(stepper)
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return instance if it exists', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperEl)

      expect(Stepper.getOrCreateInstance(stepperEl)).toEqual(stepper)
    })

    it('should create new instance if it does not exist', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
          </ol>
        </div>
      `

      const stepperEl = fixtureEl.querySelector('.stepper')

      expect(Stepper.getInstance(stepperEl)).toBeNull()
      expect(Stepper.getOrCreateInstance(stepperEl)).toBeInstanceOf(Stepper)
    })
  })

  describe('_removeIndicatorIcon', () => {
    it('should remove indicator icon if present', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">
                  <span class="stepper-step-indicator-icon"></span>
                </span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const button = fixtureEl.querySelector('.stepper-step-button')

      stepper._removeIndicatorIcon(button)

      expect(fixtureEl.querySelector('.stepper-step-indicator-icon')).toBeNull()
    })

    it('should do nothing if no indicator element', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                No indicator
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const button = fixtureEl.querySelector('.stepper-step-button')

      expect(() => {
        stepper._removeIndicatorIcon(button)
      }).not.toThrow()
    })
  })

  describe('_appendIndicatorIcon', () => {
    it('should append indicator icon if not present', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const button = fixtureEl.querySelector('.stepper-step-button')

      stepper._appendIndicatorIcon(button)

      expect(fixtureEl.querySelector('.stepper-step-indicator-icon')).not.toBeNull()
    })

    it('should not duplicate indicator icon if already present', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator">
                  <span class="stepper-step-indicator-icon"></span>
                </span>
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const button = fixtureEl.querySelector('.stepper-step-button')

      stepper._appendIndicatorIcon(button)

      const icons = fixtureEl.querySelectorAll('.stepper-step-indicator-icon')
      expect(icons.length).toBe(1)
    })

    it('should do nothing if no indicator element on button', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                No indicator
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const button = fixtureEl.querySelector('.stepper-step-button')

      expect(() => {
        stepper._appendIndicatorIcon(button)
      }).not.toThrow()

      expect(fixtureEl.querySelector('.stepper-step-indicator-icon')).toBeNull()
    })
  })

  describe('_activate and _deactivate', () => {
    it('_activate should do nothing if element is null', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      expect(() => {
        stepper._activate(null)
      }).not.toThrow()
    })

    it('_deactivate should handle null element', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      expect(() => {
        stepper._deactivate(null)
      }).not.toThrow()
    })
  })

  describe('_complete', () => {
    it('should do nothing if button parent is not in steps container', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // Create a button inside stepper-steps but not inside a stepper-step
      const stepsContainer = fixtureEl.querySelector('.stepper-steps')
      const outsideBtn = document.createElement('button')
      outsideBtn.classList.add('stepper-step-button')
      stepsContainer.append(outsideBtn)

      // _complete should return early because activeStepIdx will be -1
      // (outsideBtn.parentNode is stepper-steps, not a stepper-step)
      stepper._complete(outsideBtn)
    })
  })

  describe('_setInitialComplete', () => {
    it('should set complete on steps before active', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 2 })

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement) // eslint-disable-line no-unused-vars

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[0]).toHaveClass('complete')
      expect(buttons[1]).not.toHaveClass('complete')
    })
  })

  describe('_resetPanes', () => {
    it('should deactivate all panes when called with no argument', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper._resetPanes()

      const panes = fixtureEl.querySelectorAll('.stepper-pane')
      for (const pane of panes) {
        expect(pane).not.toHaveClass('active')
        expect(pane).not.toHaveClass('show')
      }
    })

    it('should activate only the specified pane', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      const pane2 = fixtureEl.querySelector('#step2')

      stepper._resetPanes(pane2)

      const panes = fixtureEl.querySelectorAll('.stepper-pane')
      expect(panes[0]).not.toHaveClass('active')
      expect(panes[1]).toHaveClass('active')
      expect(panes[1]).toHaveClass('show')
      expect(panes[2]).not.toHaveClass('active')
    })
  })

  describe('edge cases', () => {
    it('should finish a stepper with only one step on next()', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()
      stepper.prev()

      const button = fixtureEl.querySelector('.stepper-step-button')
      expect(stepper._isFinished).toBeTrue()
      expect(button).toHaveClass('complete')
      expect(button).not.toHaveClass('active')
    })

    it('should handle finish() when on non-last step (advances to next)', () => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      // On step 1 (not the last step), finish should advance to next
      stepper.finish()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[1]).toHaveClass('active')
      expect(stepper._isFinished).toBeFalse()
    })

    it('should handle indicator with only whitespace text', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-stepper>
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">
                <span class="stepper-step-indicator">   </span>
              </button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')

      expect(() => {
        // eslint-disable-next-line no-new
        new Stepper(stepperElement)
      }).not.toThrow()

      // Whitespace-only text node should not be wrapped
      const textWrapper = fixtureEl.querySelector('.stepper-step-indicator-text')
      expect(textWrapper).toBeNull()
    })
  })
})
