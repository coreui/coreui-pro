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
  })

  describe('API methods', () => {
    it('should trigger stepChange event when showStep is called', done => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active" data-coreui-target="#step1">
                <span class="stepper-step-indicator">1</span>
                <span class="stepper-step-label">Step 1</span>
              </button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button" data-coreui-target="#step2">
                <span class="stepper-step-indicator">2</span>
                <span class="stepper-step-label">Step 2</span>
              </button>
            </li>
          </ol>
          <div id="step1" class="stepper-pane active show"></div>
          <div id="step2" class="stepper-pane"></div>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)
      stepperElement.addEventListener('stepChange.coreui.stepper', ({ index }) => {
        expect(index).toEqual(2)
        done()
      })

      stepper.showStep(2)
    })

    it('should move to next step with next()', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 1</button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button">Step 2</button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.next()

      const [step1, step2] = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(step2).toHaveClass('active')
      expect(step1).not.toHaveClass('active')
    })

    it('should move to previous step with prev()', () => {
      fixtureEl.innerHTML = `
        <div class="stepper" data-coreui-toggle="stepper">
          <ol class="stepper-steps">
            <li class="stepper-step">
              <button type="button" class="stepper-step-button">Step 1</button>
            </li>
            <li class="stepper-step">
              <button type="button" class="stepper-step-button active">Step 2</button>
            </li>
          </ol>
        </div>
      `

      const stepperElement = fixtureEl.querySelector('.stepper')
      const stepper = new Stepper(stepperElement)

      stepper.prev()

      const [step1, step2] = fixtureEl.querySelectorAll('.stepper-step-button')
      expect(step1).toHaveClass('active')
      expect(step2).not.toHaveClass('active')
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
})
