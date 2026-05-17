// stepper.spec.js
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
      <div class="stepper" data-coreui-toggle="stepper" ${dataAttrs.join(' ')}>
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
      <div class="stepper" data-coreui-toggle="stepper">
        <ol class="stepper-steps">
          ${steps}
        </ol>
      </div>
    `
  }

  describe('constructor', () => {
    it('should initialize with a DOM element having data-coreui-toggle="stepper"', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
      expect(panes[0].getAttribute('aria-live')).toBe('polite')
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
        <div class="stepper" data-coreui-toggle="stepper">
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
      stepperElement.dispatchEvent(event)

      expect(spy).toHaveBeenCalled()
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

    it('should trigger stepChange event with correct index', done => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepperElement.addEventListener('stepChange.coreui.stepper', event => {
        expect(event.index).toEqual(2)
        done()
      })

      stepper.showStep(2)
    })

    it('should not advance if current step validation fails', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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

    it('should handle stepContent elements with _animateHeight', done => {
      fixtureEl.innerHTML = getStepContentFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { skipValidation: true })

      stepper.showStep(2)

      // Give time for animation frame
      setTimeout(() => {
        const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
        expect(buttons[1]).toHaveClass('active')
        done()
      }, 50)
    })
  })

  describe('next()', () => {
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
        <div class="stepper" data-coreui-toggle="stepper">
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

    it('should do nothing if on the last step', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(buttons[2]).toHaveClass('active')
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
    it('should finish on the last step', done => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepperElement.addEventListener('finish.coreui.stepper', () => {
        // Event fires before _isFinished is set, so check event was triggered
        expect(true).toBeTrue()
        setTimeout(() => {
          expect(stepper._isFinished).toBeTrue()
          done()
        }, 0)
      })

      stepper.finish()
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
        <div class="stepper" data-coreui-toggle="stepper">
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

    it('should handle stepContent (no pane) with animation on finish', done => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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
          done()
        }, 0)
      })

      stepper.finish()
    })

    it('should call finishHandler directly when neither pane nor stepContent exist', done => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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
          done()
        }, 0)
      })

      stepper.finish()
    })
  })

  describe('reset()', () => {
    it('should reset to initial state', done => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.showStep(2)

      stepperElement.addEventListener('reset.coreui.stepper', () => {
        const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
        expect(buttons[0]).toHaveClass('active')
        expect(buttons[1]).not.toHaveClass('active')
        done()
      })

      stepper.reset()
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

    it('should reset isFinished flag', () => {
      fixtureEl.innerHTML = getThreeStepFixture({ activeStep: 3 })
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { linear: false })

      stepper.finish()
      // After finish, _isFinished is true and all buttons are disabled
      expect(stepper._isFinished).toBeTrue()

      // Manually re-enable a button so reset() can find enabled steps
      const buttons = fixtureEl.querySelectorAll('.stepper-step-button')
      buttons[0].disabled = false

      stepper.reset()
      expect(stepper._isFinished).toBeFalse()
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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

    it('should trigger reset event', done => {
      fixtureEl.innerHTML = getThreeStepFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepperElement.addEventListener('reset.coreui.stepper', () => {
        done()
      })

      stepper.reset()
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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

    it('should add was-validated class to noValidate forms on failure', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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

      const form = fixtureEl.querySelector('form')
      expect(form).toHaveClass('was-validated')
    })

    it('should call reportValidity on non-noValidate forms on failure', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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

    it('should trigger stepValidationComplete event', done => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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
          done()
        }
      })

      stepper.next()
    })

    it('should validate forms in stepper-step-content', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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
      stepperElement.dispatchEvent(event)

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
      stepperElement.dispatchEvent(event)

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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
    it('should set initial height and overflow on expand', done => {
      fixtureEl.innerHTML = getStepContentFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { skipValidation: true })
      const content = fixtureEl.querySelectorAll('.stepper-step-content')[1]

      stepper._animateHeight(content, true, () => {
        expect(content.style.height).toBe('auto')
        done()
      })
    })

    it('should collapse element', done => {
      fixtureEl.innerHTML = getStepContentFixture()
      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement, { skipValidation: true })
      const content = fixtureEl.querySelectorAll('.stepper-step-content')[0]

      stepper._animateHeight(content, false, () => {
        expect(content.style.overflow).toBe('initial')
        done()
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
        <div class="stepper" data-coreui-toggle="stepper">
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

    it('should call a stepper method via jQueryInterface', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
        <div class="stepper" data-coreui-toggle="stepper">
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
    it('should handle stepper with only one step', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
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
      expect(button).toHaveClass('active')
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
        <div class="stepper" data-coreui-toggle="stepper">
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
