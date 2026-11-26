// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Stepper from '../../src/stepper.js'

describe('Stepper actions with the stylesheet', () => {
  let container

  afterEach(() => {
    container.remove()
  })

  it('should hide the actions and the buttons the stepper hides', () => {
    container = document.createElement('div')
    container.innerHTML = [
      '<div class="stepper">',
      '<ol class="stepper-steps">',
      '<li class="stepper-step"><button type="button" class="stepper-step-button active" data-coreui-target="#actionsPane1">1</button></li>',
      '<li class="stepper-step"><button type="button" class="stepper-step-button" data-coreui-target="#actionsPane2">2</button></li>',
      '</ol>',
      '<div class="stepper-content"><div class="stepper-pane" id="actionsPane1">One</div><div class="stepper-pane" id="actionsPane2">Two</div></div>',
      '<div class="stepper-actions">',
      '<button type="button" class="btn-solid" data-coreui-stepper-action="prev">Previous</button>',
      '<button type="button" class="btn-solid" data-coreui-stepper-action="next">Next</button>',
      '<button type="button" class="btn-solid" data-coreui-stepper-action="finish">Finish</button>',
      '</div>',
      '</div>'
    ].join('')
    document.body.append(container)

    const stepper = new Stepper(container.querySelector('.stepper'))
    const actions = container.querySelector('.stepper-actions')
    const button = name => container.querySelector(`[data-coreui-stepper-action="${name}"]`)

    expect(getComputedStyle(actions).display).toBe('flex')
    expect(getComputedStyle(button('finish')).display).toBe('none')

    stepper.next()

    expect(getComputedStyle(button('next')).display).toBe('none')
    expect(getComputedStyle(button('finish')).display).not.toBe('none')

    stepper.finish()

    expect(getComputedStyle(actions).display).toBe('none')
  })
})
