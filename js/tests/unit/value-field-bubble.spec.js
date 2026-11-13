import ChipFilter from '../../src/chip-filter.js'
import ChipInput from '../../src/chip-input.js'
import Combobox from '../../src/combobox.js'
import DateInput from '../../src/date-input.js'
import MultiSelect from '../../src/multi-select.js'
import OTPInput from '../../src/otp-input.js'
import { clearFixture, getFixture, getValueField } from '../helpers/fixture.js'

const OPTIONS = '<div class="popup combobox-popup"><div class="list-box"><div class="list-box-options" role="listbox" aria-label="Item"><div class="list-box-option" data-coreui-value="1">One</div></div></div></div>'

const components = {
  ChipFilter(form) {
    form.innerHTML = '<div class="chip-filter"><span class="chip" data-coreui-value="a">A</span></div>'
    const host = form.firstElementChild
    const instance = new ChipFilter(host, { required: true })

    return { field: host.querySelector('textarea'), host, instance }
  },
  ChipInput(form) {
    form.innerHTML = '<div class="chip-input"></div>'
    const host = form.firstElementChild
    const instance = new ChipInput(host, { required: true })

    return { field: host.querySelector('textarea'), host, instance }
  },
  Combobox(form) {
    form.innerHTML = `<button class="form-control combobox-toggle" type="button" aria-label="Item" data-coreui-toggle="combobox"></button>${OPTIONS}`
    const host = form.firstElementChild
    const instance = new Combobox(host, { required: true })

    return { field: form.querySelector('select'), host, instance }
  },
  DateInput(form) {
    form.innerHTML = '<div></div>'
    const host = form.firstElementChild
    const instance = new DateInput(host, { required: true })

    return { field: getValueField(host), host, instance }
  },
  MultiSelect(form, options) {
    form.innerHTML = '<select multiple required><option value="1">One</option></select>'
    const field = form.firstElementChild
    const instance = new MultiSelect(field, { required: true, ...options })

    return { field, host: form.querySelector('.multi-select'), instance }
  },
  OTPInput(form) {
    form.innerHTML = '<div class="form-otp"><input class="form-otp-control"><input class="form-otp-control"></div>'
    const host = form.firstElementChild
    const instance = new OTPInput(host, { required: true })

    return { field: host.querySelector('input[aria-hidden]'), host, instance }
  }
}

describe('Validation message of a hidden value field', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const mount = (name, options) => {
    fixtureEl.innerHTML = '<form></form>'
    const form = fixtureEl.querySelector('form')
    const parts = components[name](form, options)
    const outside = document.createElement('a')
    const synthetic = []

    outside.href = '#'
    form.append(outside)

    parts.field.addEventListener('blur', event => {
      if (!event.isTrusted) {
        synthetic.push(event)
      }
    })

    return { ...parts, outside, synthetic }
  }

  for (const name of Object.keys(components)) {
    describe(name, () => {
      it('should hand the focus to a control and close the message when the focus leaves', () => {
        const { field, outside, synthetic } = mount(name)

        field.focus()
        expect(document.activeElement).not.toBe(field)
        expect(synthetic.length).toBe(0)
        outside.focus()

        expect(synthetic.length).toBe(1)
      })

      it('should close an open message on dispose', () => {
        const { field, instance, synthetic } = mount(name)

        field.focus()
        instance.dispose()

        expect(synthetic.length).toBe(1)
      })
    })
  }

  for (const name of ['ChipFilter', 'ChipInput', 'MultiSelect']) {
    it(`${name} should keep the message while the focus moves inside the component`, () => {
      const { field, host, synthetic } = mount(name)
      const inside = document.createElement('button')

      inside.type = 'button'
      host.append(inside)
      field.focus()
      inside.focus()

      expect(synthetic.length).toBe(0)
    })
  }

  it('DateInput should keep the message when an arrow key moves to the next section', () => {
    const { field, synthetic } = mount('DateInput')

    field.focus()
    const section = document.activeElement

    section.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))

    expect(document.activeElement).not.toBe(section)
    expect(synthetic.length).toBe(0)
  })

  it('OTPInput should keep the message when the focus moves to the next slot', () => {
    const { field, host, synthetic } = mount('OTPInput')

    field.focus()
    host.querySelectorAll('.form-otp-control')[1].focus()

    expect(synthetic.length).toBe(0)
  })

  it('Combobox should close the message when its list opens', () => {
    const { field, instance, synthetic } = mount('Combobox')

    field.focus()
    instance.show()

    expect(synthetic.length).toBe(1)
  })

  it('MultiSelect with a search should close the message when its list opens', () => {
    const { field, instance, synthetic } = mount('MultiSelect', { search: true })

    field.focus()
    instance.show()

    expect(synthetic.length).toBe(1)
  })
})
