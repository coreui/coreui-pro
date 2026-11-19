// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

const item = label => `<details class="accordion-item" open><summary class="accordion-header">${label}</summary><div class="accordion-body p-0"><ul class="list-group list-group-flush"><li class="list-group-item">Item</li></ul></div></details>`

describe('Accordion content corners with the stylesheet', () => {
  let container

  const mount = className => {
    container = document.createElement('div')
    container.innerHTML = `<div class="${className}">${item('First')}${item('Last')}</div>`
    document.body.append(container)
    return [...container.querySelectorAll('.accordion-item')]
  }

  const content = element => getComputedStyle(element, '::details-content')

  const innerRadius = element => {
    const style = getComputedStyle(element)
    return `${Number.parseFloat(style.borderBottomLeftRadius) - Number.parseFloat(style.borderBottomWidth)}px`
  }

  afterEach(() => {
    container.remove()
  })

  it('should clip the content of the last item to the inner radius of its bottom corners', () => {
    const [, last] = mount('accordion')

    expect(content(last).overflowX).toBe('clip')
    expect(content(last).overflowY).toBe('clip')
    expect([content(last).borderBottomLeftRadius, content(last).borderBottomRightRadius]).toEqual([innerRadius(last), innerRadius(last)])
  })

  it('should leave the content of an item that is not last unclipped sideways', () => {
    const [first] = mount('accordion')

    expect(content(first).overflowX).toBe('visible')
    expect(content(first).borderBottomLeftRadius).toBe('0px')
  })

  it('should keep the content corners of a flush accordion square', () => {
    const [, last] = mount('accordion accordion-flush')

    expect(content(last).borderBottomLeftRadius).toBe('0px')
    expect(content(last).borderBottomRightRadius).toBe('0px')
  })
})
