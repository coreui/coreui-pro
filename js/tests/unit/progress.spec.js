import Progress from '../../src/progress.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('Progress', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  // The segment tokens come from the stylesheet, which the unit specs do not load
  const getProgressHtml = (barAttributes = 'aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"', wrapperStyle = '--cui-progress-segments: 40') => {
    return `
      <div class="progress progress-segmented" style="width: 1000px; height: 16px; --cui-progress-segment-gap: 6px; --cui-progress-segment-min-width: 6px; --cui-progress-segment-border-radius: 3px; ${wrapperStyle}">
        <div class="progress-bar" role="progressbar" ${barAttributes}></div>
      </div>
    `
  }

  const filled = element => element.querySelector('.progress-bar').style.getPropertyValue('--cui-progress-segments-filled')
  const segments = element => element.style.getPropertyValue('--cui-progress-segments-fit')
  const radius = element => element.style.getPropertyValue('--cui-progress-segment-radius-fit')
  const settle = () => new Promise(resolve => {
    setTimeout(resolve, 50)
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Progress.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Progress.DATA_KEY).toEqual('coreui.progress')
    })
  })

  describe('constructor', () => {
    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = getProgressHtml()

      const progressEl = fixtureEl.querySelector('.progress')
      const progressBySelector = new Progress('.progress')
      expect(progressBySelector._element).toEqual(progressEl)

      progressBySelector.dispose()

      const progressByElement = new Progress(progressEl)
      expect(progressByElement._element).toEqual(progressEl)
    })

    it('should write the whole segments the value covers, rounded down', () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="46" aria-valuemin="0" aria-valuemax="100"')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      expect(filled(progressEl)).toEqual('18')
    })

    it('should read the segment count from the CSS variable', () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="99" aria-valuemin="0" aria-valuemax="100"', '--cui-progress-segments: 10')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      expect(segments(progressEl)).toEqual('10')
      expect(filled(progressEl)).toEqual('9')
    })

    it('should lower the count to what fits above the minimum segment width', () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"', '--cui-progress-segments: 40; width: 100px')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      expect(segments(progressEl)).toEqual('8')
      expect(filled(progressEl)).toEqual('4')
    })

    it('should follow the track width', async () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"', '--cui-progress-segments: 40; width: 100px')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      progressEl.style.width = '200px'
      await settle()

      expect(segments(progressEl)).toEqual('17')
      expect(filled(progressEl)).toEqual('8')

      progressEl.style.width = '1000px'
      await settle()

      expect(segments(progressEl)).toEqual('40')
      expect(filled(progressEl)).toEqual('20')
    })

    it('should pack as many segments as fit when the count is unset', () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"', 'width: 250px')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      expect(segments(progressEl)).toEqual('21')
      expect(filled(progressEl)).toEqual('10')
    })

    it('should leave the variables to the stylesheet without a count or a minimum width', () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"', '--cui-progress-segment-min-width: 0px')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      expect(segments(progressEl)).toEqual('')
      expect(filled(progressEl)).toEqual('')
    })

    it('should cap the corner radius at half the segment and half the height', () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"', '--cui-progress-segments: 40; width: 100px; --cui-progress-segment-border-radius: 5px')

      const progressEl = fixtureEl.querySelector('.progress')
      const progress = new Progress(progressEl)

      expect(radius(progressEl)).toEqual('3.625px')

      progressEl.style.width = '1000px'
      progress.update()
      expect(radius(progressEl)).toEqual('5px')

      progressEl.style.height = '4px'
      progress.update()
      expect(radius(progressEl)).toEqual('2px')
    })

    it('should keep the count when the minimum width is unset', () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="99" aria-valuemin="0" aria-valuemax="100"', '--cui-progress-segments: 10; --cui-progress-segment-min-width: 0px; width: 20px')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      expect(filled(progressEl)).toEqual('9')
    })

    it('should scale the value against aria-valuemin and aria-valuemax', () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="15" aria-valuemin="10" aria-valuemax="20"')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      expect(filled(progressEl)).toEqual('20')
    })

    it('should default min and max to 0 and 100 and clamp the value', () => {
      fixtureEl.innerHTML = getProgressHtml('aria-valuenow="130"')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      expect(filled(progressEl)).toEqual('40')
    })

    it('should leave a bar without aria-valuenow alone', () => {
      fixtureEl.innerHTML = getProgressHtml('style="--cui-progress-segments-filled: 5"')

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      expect(filled(progressEl)).toEqual('5')
    })

    it('should not throw without a bar', () => {
      fixtureEl.innerHTML = '<div class="progress progress-segmented"></div>'

      const progressEl = fixtureEl.querySelector('.progress')

      expect(() => new Progress(progressEl)).not.toThrow()
    })
  })

  describe('update', () => {
    it('should follow aria-valuenow changes on its own', async () => {
      fixtureEl.innerHTML = getProgressHtml()

      const progressEl = fixtureEl.querySelector('.progress')
      // eslint-disable-next-line no-new
      new Progress(progressEl)

      progressEl.querySelector('.progress-bar').setAttribute('aria-valuenow', '75')
      await new Promise(resolve => {
        setTimeout(resolve, 0)
      })

      expect(filled(progressEl)).toEqual('30')
    })

    it('should recompute on demand', () => {
      fixtureEl.innerHTML = getProgressHtml()

      const progressEl = fixtureEl.querySelector('.progress')
      const progress = new Progress(progressEl)

      progressEl.style.setProperty('--cui-progress-segments', '20')
      progress.update()

      expect(filled(progressEl)).toEqual('9')
    })
  })

  describe('dispose', () => {
    it('should stop observing and remove the variables', async () => {
      fixtureEl.innerHTML = getProgressHtml()

      const progressEl = fixtureEl.querySelector('.progress')
      const progress = new Progress(progressEl)

      progress.dispose()

      expect(filled(progressEl)).toEqual('')
      expect(segments(progressEl)).toEqual('')
      expect(radius(progressEl)).toEqual('')
      expect(Progress.getInstance(progressEl)).toBeNull()

      progressEl.querySelector('.progress-bar').setAttribute('aria-valuenow', '75')
      await new Promise(resolve => {
        setTimeout(resolve, 0)
      })

      expect(filled(progressEl)).toEqual('')
    })
  })

  describe('data-api', () => {
    it('should initialize every segmented progress on DOMContentLoaded', () => {
      fixtureEl.innerHTML = [
        getProgressHtml(),
        '<div class="progress" id="plain"><div class="progress-bar" style="width: 50%"></div></div>'
      ].join('')

      document.dispatchEvent(new Event('DOMContentLoaded'))

      expect(Progress.getInstance(fixtureEl.querySelector('.progress-segmented'))).toBeInstanceOf(Progress)
      expect(Progress.getInstance(fixtureEl.querySelector('#plain'))).toBeNull()
    })
  })

  describe('jQueryInterface', () => {
    it('should create a progress via jQueryInterface', () => {
      fixtureEl.innerHTML = getProgressHtml()
      const progressEl = fixtureEl.querySelector('.progress')

      jQueryMock.fn.progress = Progress.jQueryInterface
      jQueryMock.elements = [progressEl]
      jQueryMock.fn.progress.call(jQueryMock)

      expect(Progress.getInstance(progressEl)).not.toBeNull()
    })

    it('should call a public method by name', () => {
      fixtureEl.innerHTML = getProgressHtml()
      const progressEl = fixtureEl.querySelector('.progress')

      jQueryMock.fn.progress = Progress.jQueryInterface
      jQueryMock.elements = [progressEl]
      jQueryMock.fn.progress.call(jQueryMock)

      progressEl.style.setProperty('--cui-progress-segments', '20')
      jQueryMock.fn.progress.call(jQueryMock, 'update')

      expect(filled(progressEl)).toEqual('9')
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = getProgressHtml()
      const progressEl = fixtureEl.querySelector('.progress')

      jQueryMock.fn.progress = Progress.jQueryInterface
      jQueryMock.elements = [progressEl]

      expect(() => {
        jQueryMock.fn.progress.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })
})
