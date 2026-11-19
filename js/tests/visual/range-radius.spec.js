// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

describe('Range radius with the stylesheet', () => {
  let container

  const mount = style => {
    container = document.createElement('div')
    container.style.cssText = style
    container.innerHTML = '<div class="form-range"><input type="range" class="form-range-input" aria-label="Volume"></div>'
    document.body.append(container)
    return getComputedStyle(container.querySelector('.form-range'))
  }

  afterEach(() => {
    container.remove()
  })

  it('should round the track and the thumb with the pill radius', () => {
    const style = mount('')

    expect(style.getPropertyValue('--cui-range-track-border-radius')).toBe('50rem')
    expect(style.getPropertyValue('--cui-range-thumb-border-radius')).toBe('50rem')
  })

  it('should square the track and the thumb when the page sets the pill radius to zero', () => {
    const style = mount('--cui-radius-pill: 0')

    expect(style.getPropertyValue('--cui-range-track-border-radius')).toBe('0')
    expect(style.getPropertyValue('--cui-range-thumb-border-radius')).toBe('0')
  })
})
