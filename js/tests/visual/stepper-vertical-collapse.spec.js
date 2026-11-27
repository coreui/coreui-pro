// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

describe('Vertical stepper content rendered as a collapse', () => {
  let container

  afterEach(() => {
    container.remove()
  })

  const getFixture = () => {
    container = document.createElement('div')
    container.innerHTML = [
      '<div class="stepper stepper-vertical">',
      '<ol class="stepper-steps">',
      '<li class="stepper-step"><button type="button" class="stepper-step-button active">1</button><div class="stepper-step-content collapse show"><div style="height: 200px">One</div></div></li>',
      '<li class="stepper-step"><button type="button" class="stepper-step-button">2</button><div class="stepper-step-content collapse">Two</div></li>',
      '</ol>',
      '</div>'
    ].join('')
    document.body.append(container)

    return container.querySelectorAll('.stepper-step-content')
  }

  it('should collapse the closing content with the stepper transition and hide it at the end', async () => {
    const [closing, closed] = getFixture()

    expect(getComputedStyle(closed).display).toBe('none')
    expect(closing.getBoundingClientRect().height).toBe(200)

    closing.classList.add('collapsing')
    closing.classList.remove('show')

    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    const { height } = closing.getBoundingClientRect()

    expect(getComputedStyle(closing).display).toBe('block')
    expect(height).toBeGreaterThan(0)
    expect(height).toBeLessThan(200)

    await new Promise(resolve => {
      closing.addEventListener('transitionend', resolve, { once: true })
    })
    closing.classList.remove('collapsing')

    expect(getComputedStyle(closing).display).toBe('none')
  })

  it('should keep the closing content for as long as the stepper token says', async () => {
    const [closing] = getFixture()

    container.querySelector('.stepper').style.setProperty('--cui-stepper-step-content-transition', 'height 2s linear')

    expect(closing.getBoundingClientRect().height).toBe(200)

    closing.classList.add('collapsing')
    closing.classList.remove('show')

    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })

    expect(closing.getBoundingClientRect().height).toBeGreaterThan(100)
  })
})
