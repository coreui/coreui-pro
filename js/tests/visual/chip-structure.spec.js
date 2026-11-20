/*!
 * Layout of the chip wrappers: the rows of a grid and the grid of a chip input
 * take no box of their own, so the chips stay flex items of the set or field.
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import ChipFilter from '../../src/chip-filter.js'
import ChipInput from '../../src/chip-input.js'
import ChipSet from '../../src/chip-set.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

describe('chip wrappers', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  it('should lay a row out with display: contents, keeping the chips in the set', () => {
    fixtureEl.innerHTML = '<div class="chip-set"><span class="chip">One</span><span class="chip">Two</span></div>'
    const element = fixtureEl.querySelector('.chip-set')
    new ChipSet(element, { removable: true })

    const [one, two] = element.querySelectorAll('.chip')

    expect(getComputedStyle(element.querySelector('.chip-row')).display).toBe('contents')
    expect(two.getBoundingClientRect().left).toBeGreaterThan(one.getBoundingClientRect().right)
  })

  it('should lay the grid of a chip input out with display: contents, keeping the field in line', () => {
    fixtureEl.innerHTML = '<div class="chip-input form-control-group"><span class="chip">One</span></div>'
    const element = fixtureEl.querySelector('.chip-input')
    const chipInput = new ChipInput(element)
    const chip = element.querySelector('.chip')

    expect(getComputedStyle(element.querySelector('.chip-input-grid')).display).toBe('contents')
    expect(chipInput._input.getBoundingClientRect().left).toBeGreaterThanOrEqual(chip.getBoundingClientRect().right)
  })

  it.each([['chip filter', ChipFilter, 'chip-set chip-filter'], ['chip input', ChipInput, 'chip-input']])('should lay the value field of a %s over it, unseen and out of the pointer\'s way', (_, Component, className) => {
    fixtureEl.innerHTML = `<div class="${className}"><span class="chip">One</span></div>`
    const element = fixtureEl.firstElementChild
    new Component(element, { name: 'tags' })

    const field = element.querySelector('select')
    const style = getComputedStyle(field)
    const fieldBox = field.getBoundingClientRect()

    expect([style.opacity, style.pointerEvents, style.position]).toEqual(['0', 'none', 'absolute'])
    expect([fieldBox.width, fieldBox.height]).toEqual([element.clientWidth, element.clientHeight])
  })
})
