import { userEvent } from '@vitest/browser/context'
import { vi } from 'vitest'

import Rating from '../../src/rating.js'
import EventHandler from '../../src/dom/event-handler.js'
import Form from '../../src/form.js'
import Tooltip from '../../src/tooltip.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'

describe('Rating', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Rating.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(Rating.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('NAME', () => {
    it('should return plugin NAME', () => {
      expect(Rating.NAME).toEqual('rating')
    })
  })

  describe('constructor', () => {
    it('should take a disabled class the markup wrote as the disabled option, and give the markup back on dispose', () => {
      fixtureEl.innerHTML = '<div class="rating disabled"></div>'
      const div = fixtureEl.querySelector('div')
      const markup = div.outerHTML
      const rating = new Rating(div)

      expect(div).toHaveClass('disabled')
      expect(div.querySelector('input').disabled).toBeTrue()

      rating.dispose()

      expect(div.outerHTML).toEqual(markup)
    })

    it('should be created again after an invalid config', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      expect(() => new Rating(div, { size: 3 })).toThrow()
      expect(() => new Rating(div, { size: 'lg' })).not.toThrow()
      expect(div.querySelectorAll('.rating-item')).toHaveSize(5)
    })

    it('should create a Rating instance with default config if no config is provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(rating).toBeInstanceOf(Rating)
      expect(rating._config).toBeDefined()
      expect(rating._element).toEqual(div)
    })

    it('should allow overriding default config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, {
        itemCount: 3,
        value: 2,
        readonly: true
      })

      expect(rating._config.itemCount).toEqual(3)
      expect(rating._currentValue).toEqual(2)
      expect(rating._config.readonly).toBeTrue()
    })

    it('should apply the "disabled" class when config.disabled = true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { disabled: true })
      expect(rating._element.classList).toContain('disabled')
    })

    it('should apply the "readonly" class when config.readonly = true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { readonly: true })
      expect(rating._element.classList).toContain('readonly')
    })

    it('should create the correct number of rating items', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5 }) // eslint-disable-line no-new

      expect(div.querySelectorAll('.rating-item')).toHaveSize(5)
    })

    it('should create 10 rating items when itemCount is 10', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 10 }) // eslint-disable-line no-new

      expect(div.querySelectorAll('.rating-item')).toHaveSize(10)
    })

    it('should set a default aria-label on each rating radio', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5 }) // eslint-disable-line no-new

      const inputs = div.querySelectorAll('.rating-item-input')
      expect(inputs[0].getAttribute('aria-label')).toEqual('1 of 5')
      expect(inputs[4].getAttribute('aria-label')).toEqual('5 of 5')
    })

    it('should use a custom ariaLabel function', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { // eslint-disable-line no-new
        itemCount: 5,
        ariaLabel: (value, itemCount) => `${value} star of ${itemCount}`
      })

      const inputs = div.querySelectorAll('.rating-item-input')
      expect(inputs[2].getAttribute('aria-label')).toEqual('3 star of 5')
    })

    it('should set the initial checked input if "value" is provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { value: 2 }) // eslint-disable-line no-new

      const checkedInputs = div.querySelectorAll('.rating-item-input:checked')
      expect(checkedInputs).toHaveSize(1)
      expect(checkedInputs[0].value).toEqual('2')
    })

    it('should set role="radiogroup" on the element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div) // eslint-disable-line no-new

      expect(div.getAttribute('role')).toEqual('radiogroup')
    })

    it('should add "rating" class to the element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div) // eslint-disable-line no-new

      expect(div.classList.contains('rating')).toBeTrue()
    })

    it('should generate a name attribute for hidden inputs if no name provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(rating._name).toBeDefined()
      expect(rating._name).toContain('rating-name-')
    })

    it('should use the provided name attribute', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { name: 'my-rating' })

      expect(rating._name).toEqual('my-rating')
      const inputs = div.querySelectorAll('.rating-item-input')
      for (const input of inputs) {
        expect(input.name).toEqual('my-rating')
      }
    })

    it('should disable all inputs when disabled is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { disabled: true }) // eslint-disable-line no-new

      const inputs = div.querySelectorAll('.rating-item-input')
      for (const input of inputs) {
        expect(input.disabled).toBeTrue()
      }
    })

    it('should keep the inputs enabled when readonly is true, so the form submits the value', () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = fixtureEl.querySelector('div')
      new Rating(div, { name: 'score', readonly: true, value: 3 }) // eslint-disable-line no-new

      for (const input of div.querySelectorAll('.rating-item-input')) {
        expect(input.disabled).toBeFalse()
      }

      expect(new FormData(form).get('score')).toEqual('3')
    })

    it('should submit a readonly rating only under the name the page gives it', () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { readonly: true, value: 3 })

      expect([...new FormData(form).keys()]).toEqual([])

      rating.setConfig({ readonly: false })

      expect([...new FormData(form).keys()]).toHaveSize(1)
    })
  })

  describe('size', () => {
    it('should add size class when size is provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { size: 'lg' }) // eslint-disable-line no-new

      expect(div.classList.contains('rating-lg')).toBeTrue()
    })

    it('should add "rating-sm" class when size is "sm"', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { size: 'sm' }) // eslint-disable-line no-new

      expect(div.classList.contains('rating-sm')).toBeTrue()
    })

    it('should not add size class when size is null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { size: null }) // eslint-disable-line no-new

      expect(div.className).not.toContain('rating-null')
    })
  })

  describe('precision', () => {
    it('should create 2 inputs per item when precision is 0.5', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { precision: 0.5, itemCount: 5 }) // eslint-disable-line no-new

      const inputs = div.querySelectorAll('.rating-item-input')
      expect(inputs).toHaveSize(10) // 5 items * 2 inputs per item
    })

    it('should create 4 inputs per item when precision is 0.25', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { precision: 0.25, itemCount: 5 }) // eslint-disable-line no-new

      const inputs = div.querySelectorAll('.rating-item-input')
      expect(inputs).toHaveSize(20) // 5 items * 4 inputs per item
    })

    it('should set correct values for half precision inputs', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { precision: 0.5, itemCount: 3 }) // eslint-disable-line no-new

      const inputs = div.querySelectorAll('.rating-item-input')
      // First item: 0.5, 1; Second item: 1.5, 2; Third item: 2.5, 3
      expect(inputs[0].value).toEqual('0.5')
      expect(inputs[1].value).toEqual('1')
      expect(inputs[2].value).toEqual('1.5')
      expect(inputs[3].value).toEqual('2')
      expect(inputs[4].value).toEqual('2.5')
      expect(inputs[5].value).toEqual('3')
    })

    it('should wrap sub-items in a div when precision is not 1', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { precision: 0.5, itemCount: 3 }) // eslint-disable-line no-new

      const ratingItems = div.querySelectorAll('.rating-item')
      for (const item of ratingItems) {
        // Each rating-item should have wrapper divs containing label + input
        const wrappers = item.querySelectorAll(':scope > div')
        expect(wrappers.length).toEqual(2) // 2 sub-items per item
      }
    })

    it('should set partial width and position styles on non-last sub-items', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { precision: 0.5, itemCount: 3 }) // eslint-disable-line no-new

      const ratingItems = div.querySelectorAll('.rating-item')
      const firstItem = ratingItems[0]
      const labels = firstItem.querySelectorAll('.rating-item-label')

      // First label (left half) should have position absolute and 50% width
      expect(labels[0].style.position).toEqual('absolute')
      expect(labels[0].style.width).toEqual('50%')
      expect(labels[0].style.overflow).toEqual('hidden')
      expect(labels[0].style.opacity).toEqual('0')
    })

    it('should not set position styles on last sub-item label', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { precision: 0.5, itemCount: 3 }) // eslint-disable-line no-new

      const ratingItems = div.querySelectorAll('.rating-item')
      const firstItem = ratingItems[0]
      const labels = firstItem.querySelectorAll('.rating-item-label')

      // Last label should not have position: absolute
      expect(labels[1].style.position).not.toEqual('absolute')
    })

    it('should highlight correct labels with half precision and value', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { precision: 0.5, itemCount: 5, value: 2.5 }) // eslint-disable-line no-new

      const checkedInputs = div.querySelectorAll('.rating-item-input:checked')
      expect(checkedInputs).toHaveSize(1)
      expect(checkedInputs[0].value).toEqual('2.5')
    })
  })

  describe('custom icons', () => {
    it('should use custom icon string when icon is provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { icon: '<svg><path d="M1"></path></svg>' }) // eslint-disable-line no-new

      const customIcons = div.querySelectorAll('.rating-item-custom-icon')
      expect(customIcons.length).toEqual(5)
    })

    it('should use custom icon object (per item) when icon is an object', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const icons = {
        1: '<svg><path d="M1"></path></svg>',
        2: '<svg><path d="M2"></path></svg>',
        3: '<svg><path d="M3"></path></svg>',
        4: '<svg><path d="M4"></path></svg>',
        5: '<svg><path d="M5"></path></svg>'
      }
      new Rating(div, { icon: icons }) // eslint-disable-line no-new

      const customIcons = div.querySelectorAll('.rating-item-custom-icon')
      expect(customIcons.length).toEqual(5)
    })

    it('should use default icon class when no custom icon provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div) // eslint-disable-line no-new

      const defaultIcons = div.querySelectorAll('.rating-item-icon')
      expect(defaultIcons.length).toEqual(5)
      const customIcons = div.querySelectorAll('.rating-item-custom-icon')
      expect(customIcons.length).toEqual(0)
    })

    it('should add active icon element when both icon and activeIcon are provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { // eslint-disable-line no-new
        icon: '<svg><path d="M1"></path></svg>',
        activeIcon: '<svg><path d="M2"></path></svg>'
      })

      const activeIcons = div.querySelectorAll('.rating-item-custom-icon-active')
      expect(activeIcons.length).toEqual(5)
    })

    it('should not add active icon element when only icon is provided (no activeIcon)', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { icon: '<svg><path d="M1"></path></svg>' }) // eslint-disable-line no-new

      const activeIcons = div.querySelectorAll('.rating-item-custom-icon-active')
      expect(activeIcons.length).toEqual(0)
    })

    it('should not add active icon when activeIcon is set but icon is not', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { activeIcon: '<svg><path d="M2"></path></svg>' }) // eslint-disable-line no-new

      const activeIcons = div.querySelectorAll('.rating-item-custom-icon-active')
      expect(activeIcons.length).toEqual(0)
    })

    it('should use activeIcon object (per item) when activeIcon is an object', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const icons = {
        1: '<svg><path d="M1"></path></svg>',
        2: '<svg><path d="M2"></path></svg>',
        3: '<svg><path d="M3"></path></svg>',
        4: '<svg><path d="M4"></path></svg>',
        5: '<svg><path d="M5"></path></svg>'
      }
      const activeIcons = {
        1: '<svg><path d="A1"></path></svg>',
        2: '<svg><path d="A2"></path></svg>',
        3: '<svg><path d="A3"></path></svg>',
        4: '<svg><path d="A4"></path></svg>',
        5: '<svg><path d="A5"></path></svg>'
      }
      new Rating(div, { icon: icons, activeIcon: activeIcons }) // eslint-disable-line no-new

      const activeIconEls = div.querySelectorAll('.rating-item-custom-icon-active')
      expect(activeIconEls.length).toEqual(5)
    })

    it('should sanitize icon HTML by default', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { icon: '<script>alert("xss")</script>' }) // eslint-disable-line no-new

      const customIcons = div.querySelectorAll('.rating-item-custom-icon')
      for (const iconEl of customIcons) {
        expect(iconEl.innerHTML).not.toContain('<script>')
      }
    })

    it('should not sanitize icon HTML when sanitize is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { icon: '<div class="custom">star</div>', sanitize: false }) // eslint-disable-line no-new

      const customIcons = div.querySelectorAll('.rating-item-custom-icon')
      expect(customIcons[0].innerHTML).toContain('<div class="custom">star</div>')
    })
  })

  describe('highlightOnlySelected', () => {
    it('should only highlight the selected star when highlightOnlySelected is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5, value: 3, highlightOnlySelected: true }) // eslint-disable-line no-new

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(1)
    })

    it('should highlight all stars up to selected when highlightOnlySelected is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5, value: 3, highlightOnlySelected: false }) // eslint-disable-line no-new

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(3)
    })

    it('should highlight only hovered star on mouseenter when highlightOnlySelected is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5, highlightOnlySelected: true }) // eslint-disable-line no-new

      const label = div.querySelectorAll('.rating-item-label')[2] // 3rd star
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(1)
      expect(activeLabels[0]).toEqual(label)
    })

    it('should restore only selected star on mouseleave when highlightOnlySelected is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5, value: 2, highlightOnlySelected: true }) // eslint-disable-line no-new

      const label = div.querySelectorAll('.rating-item-label')[3] // 4th star
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      const mouseout = createEvent('mouseout')
      label.dispatchEvent(mouseout)

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(1)
    })

    it('should highlight only the changed item on change event when highlightOnlySelected is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5, highlightOnlySelected: true }) // eslint-disable-line no-new

      // Click the 3rd label (triggers input change which updates labels)
      const input = div.querySelectorAll('.rating-item-input')[2]
      input.checked = true
      input.dispatchEvent(new Event('change', { bubbles: true }))

      // After the change handler completes, only one label should be active
      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(1)
    })
  })

  describe('setConfig', () => {
    it('should update config and re-render the rating UI', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, value: 1 })

      const previousHTML = div.innerHTML
      rating.setConfig({ itemCount: 5, value: 3 })

      expect(div.innerHTML).not.toEqual(previousHTML)
      expect(div.querySelectorAll('.rating-item')).toHaveSize(5)
      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput.value).toEqual('3')
    })

    it('should update the value', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 5, value: 2 })

      rating.setConfig({ itemCount: 5, value: 4 })
      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput.value).toEqual('4')
    })

    it('should keep the options given to the constructor', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, value: 1 })

      rating.setConfig({ value: 2 })

      expect(rating._config.itemCount).toEqual(3)
      expect(div.querySelectorAll('.rating-item')).toHaveSize(3)
    })

    it('should type check the options it is given', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(() => rating.setConfig({ itemCount: 'five' })).toThrowError(TypeError)
      expect(rating._config.itemCount).toEqual(5)
    })

    it('should keep one set of listeners across updates', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3 })
      const spy = jasmine.createSpy('change')

      rating.setConfig({ itemCount: 3 })
      rating.setConfig({ itemCount: 3 })
      div.addEventListener('change.coreui.rating', spy)

      const input = div.querySelectorAll('.rating-item-input')[1]
      input.checked = true
      input.dispatchEvent(createEvent('change', { bubbles: true }))

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should dispose the tooltips of the items it replaces', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, tooltips: true })

      const label = div.querySelectorAll('.rating-item-label')[1]
      label.dispatchEvent(createEvent('mouseover'))
      const item = label.parentElement
      expect(Tooltip.getInstance(item)).not.toBeNull()

      rating.setConfig({ itemCount: 3, tooltips: true })

      expect(Tooltip.getInstance(item)).toBeNull()
      expect(rating._tooltip).toBeNull()
    })

    it('should update disabled state', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 5, disabled: false })

      expect(div.classList.contains('disabled')).toBeFalse()

      rating.setConfig({ itemCount: 5, disabled: true })
      expect(div.classList.contains('disabled')).toBeTrue()
    })

    it('should drop the disabled state when it is turned off', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { disabled: true })

      rating.setConfig({ disabled: false })

      expect(div).not.toHaveClass('disabled')
      for (const input of div.querySelectorAll('.rating-item-input')) {
        expect(input.disabled).toBeFalse()
      }
    })

    it('should drop the readonly state when it is turned off', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { readonly: true })

      rating.setConfig({ readonly: false })

      expect(div).not.toHaveClass('readonly')
    })

    it('should keep a single size class when the size changes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { size: 'lg' })

      rating.setConfig({ size: 'sm' })

      expect(div).toHaveClass('rating-sm')
      expect(div).not.toHaveClass('rating-lg')
    })

    it('should give the radios the new name', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { name: 'first' })

      rating.setConfig({ name: 'score' })

      for (const input of div.querySelectorAll('.rating-item-input')) {
        expect(input.name).toEqual('score')
      }
    })

    it('should keep content the page put in the element, where the page put it', () => {
      fixtureEl.innerHTML = '<div><span class="rating-note">Before</span></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)
      const after = document.createElement('span')
      div.append(after)

      rating.setConfig({ itemCount: 3 })

      expect(div.firstElementChild).toHaveClass('rating-note')
      expect(div.lastElementChild).toBe(after)
      expect(div.querySelectorAll('.rating-item')).toHaveSize(3)
    })

    it('should drop a state class the page wrote once the option turns it off', () => {
      fixtureEl.innerHTML = '<div class="rating disabled"></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { disabled: true })

      rating.setConfig({ disabled: false })

      expect(div).not.toHaveClass('disabled')
    })

    it('should replace a size class the page wrote and give it back on dispose', () => {
      fixtureEl.innerHTML = '<div class="rating rating-lg"></div>'
      const div = fixtureEl.querySelector('div')
      const markup = div.outerHTML
      const rating = new Rating(div)

      rating.setConfig({ size: 'sm' })

      expect(div).toHaveClass('rating-sm')
      expect(div).not.toHaveClass('rating-lg')

      rating.dispose()

      expect(div.outerHTML).toEqual(markup)
    })

    it('should leave a size class the page wrote alone while the size option is empty', () => {
      fixtureEl.innerHTML = '<div class="rating-lg"></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      div.classList.remove('rating-lg')
      rating.dispose()

      expect(div).not.toHaveClass('rating-lg')
    })

    it('should drop a value the new options cannot show', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)
      const input = div.querySelectorAll('.rating-item-input')[4]

      input.checked = true
      input.dispatchEvent(createEvent('change', { bubbles: true }))
      rating.setConfig({ itemCount: 3 })

      expect(div.querySelector('.rating-item-input:checked')).toBeNull()
      expect(div.querySelector('.rating-item-label.active')).toBeNull()
    })

    it('should recover from a size it cannot apply', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(() => rating.setConfig({ size: 'x y' })).toThrow()

      rating.setConfig({ size: 'lg' })

      expect(div).toHaveClass('rating-lg')
      expect(div.querySelectorAll('.rating-item')).toHaveSize(5)
    })

    it('should keep the generated name when other options change', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)
      const { name } = div.querySelector('.rating-item-input')

      rating.setConfig({ itemCount: 3 })

      for (const input of div.querySelectorAll('.rating-item-input')) {
        expect(input.name).toEqual(name)
      }
    })

    it('should keep the value the user picked when other options change', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { value: 2 })
      const input = div.querySelectorAll('.rating-item-input')[3]

      input.checked = true
      input.dispatchEvent(createEvent('change', { bubbles: true }))
      rating.setConfig({ size: 'lg' })

      expect(div.querySelector('.rating-item-input:checked').value).toEqual('4')
    })

    it('should not light every star when a change listener calls setConfig', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)
      const input = div.querySelectorAll('.rating-item-input')[1]

      div.addEventListener('change.coreui.rating', () => rating.setConfig({ readonly: true }))
      input.checked = true
      input.dispatchEvent(createEvent('change', { bubbles: true }))

      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(2)
    })

    it('should re-attach event listeners after update', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const rating = new Rating(div, { itemCount: 5 })

        rating.setConfig({ itemCount: 5 })

        div.addEventListener('change.coreui.rating', event => {
          expect(event.value).toBeDefined()
          resolve()
        })

        const label = div.querySelectorAll('.rating-item-label')[1]
        label.click()
      })
    })
  })

  describe('reset', () => {
    it('should keep content the page put in the element and give the markup back on dispose', () => {
      fixtureEl.innerHTML = '<div><span class="rating-note">12 reviews</span></div>'
      const div = fixtureEl.querySelector('div')
      const markup = div.outerHTML
      const rating = new Rating(div, { size: 'lg' })

      rating.reset(2)

      expect(div.querySelector('.rating-note')).not.toBeNull()

      rating.dispose()

      expect(div.outerHTML).toEqual(markup)
    })

    it('should reset the rating to the new given value', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 5, value: 4 })

      rating.reset(2)
      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput.value).toEqual('2')
    })

    it('should reset the rating to null if no argument is provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { value: 3 })

      rating.reset()
      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput).toBeNull()
    })

    it('should emit a "change.coreui.rating" event on reset', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { value: 3 })
      const listener = jasmine.createSpy('listener')

      div.addEventListener('change.coreui.rating', listener)
      rating.reset()
      expect(listener).toHaveBeenCalled()
    })

    it('should emit change event with the reset value', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { value: 3 })
      let eventValue

      div.addEventListener('change.coreui.rating', event => {
        eventValue = event.value
      })

      rating.reset(2)
      expect(eventValue).toEqual(2)
    })

    it('should emit change event with null when reset with no argument', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { value: 3 })
      let eventValue = 'not-set'

      div.addEventListener('change.coreui.rating', event => {
        eventValue = event.value
      })

      rating.reset()
      expect(eventValue).toBeNull()
    })
  })

  describe('events', () => {
    it('should emit "change.coreui.rating" when a rating input is changed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { itemCount: 3 }) // eslint-disable-line no-new

        div.addEventListener('change.coreui.rating', event => {
          expect(event.value).toBe('2')
          resolve()
        })

        // Simulate clicking the second radio
        const input = div.querySelectorAll('.rating-item-label')[1]
        input.click()
      })
    })

    it('should clear the rating if "allowClear" is true and the same value is clicked again', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        // eslint-disable-next-line no-new
        new Rating(div, {
          value: 2,
          allowClear: true,
          itemCount: 5
        })

        // Listen for a new change event
        div.addEventListener('change.coreui.rating', event => {
          expect(event.value).toBeNull()
          resolve()
        })

        const input2 = div.querySelectorAll('.rating-item-input')[1] // value="2"
        input2.click()
      })
    })

    it('should not clear the rating when allowClear is false and same value is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { // eslint-disable-line no-new
        value: 2,
        allowClear: false,
        itemCount: 5
      })

      const input2 = div.querySelectorAll('.rating-item-input')[1] // value="2"
      input2.click()

      // Value should remain 2 (no clearing)
      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput).not.toBeNull()
    })

    it('should emit "hover.coreui.rating" on mouseenter with the hovered value', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { itemCount: 3 }) // eslint-disable-line no-new

        const label = div.querySelectorAll('.rating-item-label')[1]
        div.addEventListener('hover.coreui.rating', event => {
          expect(event.value).toBe('2')
          resolve()
        })

        const mouseover = createEvent('mouseover')
        label.dispatchEvent(mouseover)
      })
    })

    it('should emit "hover.coreui.rating" with null on mouseleave', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { itemCount: 3 }) // eslint-disable-line no-new

        const label = div.querySelectorAll('.rating-item-label')[1]

        // First mouseenter
        const mouseover = createEvent('mouseover')
        label.dispatchEvent(mouseover)

        div.addEventListener('hover.coreui.rating', event => {
          if (event.value === null) {
            resolve()
          }
        })

        const mouseout = createEvent('mouseout')
        label.dispatchEvent(mouseout)
      })
    })

    it('should remove "active" class from all labels when mouse leaves, unless an input is checked', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 3, value: 2 }) // eslint-disable-line no-new

      const label = div.querySelectorAll('.rating-item-label')[2]
      // first hover:
      const mouseenter = createEvent('mouseenter')
      label.dispatchEvent(mouseenter)
      // all previous labels (0,1,2) active

      const mouseleave = createEvent('mouseleave')
      label.dispatchEvent(mouseleave)

      // Because the rating has a checked input for value="2", items 0 & 1 should remain active
      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(2)
    })

    it('should remove all "active" classes if no input is checked and mouse leaves', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 3, value: null }) // eslint-disable-line no-new

      const label = div.querySelectorAll('.rating-item-label')[1]
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      let activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(2) // items[0] and items[1]

      const mouseout = createEvent('mouseout')
      label.dispatchEvent(mouseout)

      activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(0)
    })

    it('should highlight all labels up to hovered item on mouseenter', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5 }) // eslint-disable-line no-new

      const label = div.querySelectorAll('.rating-item-label')[3] // 4th star
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(4)
    })

    it('should emit "hover.coreui.rating" on focusin', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { itemCount: 3 }) // eslint-disable-line no-new

        div.addEventListener('hover.coreui.rating', event => {
          expect(event.value).toBe('2')
          resolve()
        })

        const input = div.querySelectorAll('.rating-item-input')[1]
        const focusin = createEvent('focusin', { bubbles: true })
        input.dispatchEvent(focusin)
      })
    })

    it('should emit "hover.coreui.rating" with null on focusout', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { itemCount: 3 }) // eslint-disable-line no-new

        const input = div.querySelectorAll('.rating-item-input')[1]

        // First focus in
        const focusin = createEvent('focusin', { bubbles: true })
        input.dispatchEvent(focusin)

        div.addEventListener('hover.coreui.rating', event => {
          if (event.value === null) {
            resolve()
          }
        })

        const focusout = createEvent('focusout', { bubbles: true })
        input.dispatchEvent(focusout)
      })
    })

    it('should update currentValue on change event from input', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 5 })

      const label = div.querySelectorAll('.rating-item-label')[2]
      label.click()

      expect(rating._currentValue).toBe('3')
    })
  })

  describe('readonly & disabled', () => {
    it('should cancel a click on a readonly star and keep the value', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const changeSpy = jasmine.createSpy('change')
      // eslint-disable-next-line no-new
      new Rating(div, { readonly: true, value: 2 })
      const inputs = div.querySelectorAll('.rating-item-input')
      const click = new MouseEvent('click', { bubbles: true, cancelable: true })

      div.addEventListener('change.coreui.rating', changeSpy)
      inputs[3].dispatchEvent(click)
      inputs[0].click()

      expect(click.defaultPrevented).toBeTrue()
      expect(div.querySelector('.rating-item-input:checked').value).toEqual('2')
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(2)
      expect(changeSpy).not.toHaveBeenCalled()
    })

    it('should keep the focus and the value on the checked star when an arrow key is pressed in a readonly rating', async () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const changeSpy = jasmine.createSpy('change')
      // eslint-disable-next-line no-new
      new Rating(div, { name: 'score', readonly: true, value: 2 })
      const inputs = div.querySelectorAll('.rating-item-input')

      div.addEventListener('change.coreui.rating', changeSpy)
      inputs[1].focus()
      await userEvent.keyboard('{ArrowRight}{ArrowDown}')

      expect(document.activeElement).toBe(inputs[1])

      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowUp}')

      expect(document.activeElement).toBe(inputs[1])
      expect(div.querySelector('.rating-item-input:checked').value).toEqual('2')
      expect(changeSpy).not.toHaveBeenCalled()
    })

    it('should leave only the checked star of a readonly rating in the tab order', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { readonly: true, value: 2 })
      const tabIndexes = () => [...div.querySelectorAll('.rating-item-input')].map(input => input.tabIndex)

      expect(tabIndexes()).toEqual([-1, 0, -1, -1, -1])

      rating.setConfig({ value: null })

      expect(tabIndexes()).toEqual([-1, -1, -1, -1, -1])

      rating.setConfig({ readonly: false })

      expect(tabIndexes()).toEqual([0, 0, 0, 0, 0])
    })

    it('should not fire hover or build a tooltip when a readonly star gets focus', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const hoverSpy = jasmine.createSpy('hover')
      // eslint-disable-next-line no-new
      new Rating(div, { readonly: true, tooltips: true, value: 2 })
      const input = div.querySelectorAll('.rating-item-input')[1]

      div.addEventListener('hover.coreui.rating', hoverSpy)
      input.dispatchEvent(createEvent('focusin', { bubbles: true }))
      input.dispatchEvent(createEvent('focusout', { bubbles: true }))

      expect(hoverSpy).not.toHaveBeenCalled()
      expect(Tooltip.getInstance(input.parentElement)).toBeNull()
    })

    it('should mark a readonly rating with aria-readonly, drop it when readonly turns off, and give the markup back on dispose', () => {
      fixtureEl.innerHTML = '<div data-coreui-rating></div>'
      const div = fixtureEl.querySelector('div')
      const markup = div.outerHTML
      const rating = new Rating(div, { readonly: true })

      expect(div.getAttribute('aria-readonly')).toEqual('true')

      rating.setConfig({ readonly: false })

      expect(div.hasAttribute('aria-readonly')).toBeFalse()

      rating.setConfig({ readonly: true })
      rating.dispose()

      expect(div.outerHTML).toEqual(markup)
    })

    it('should leave an aria-readonly the markup already has', () => {
      fixtureEl.innerHTML = '<div aria-readonly="false"></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { readonly: true })

      expect(div.getAttribute('aria-readonly')).toEqual('false')

      rating.setConfig({ readonly: false })

      expect(div.getAttribute('aria-readonly')).toEqual('false')

      rating.dispose()

      expect(div.getAttribute('aria-readonly')).toEqual('false')
    })

    it('should not change or hover if readonly is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 3, readonly: true }) // eslint-disable-line no-new

      // Attempt to click on an input
      const inputs = div.querySelectorAll('.rating-item-input')
      inputs[1].click()

      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput).toBeNull() // Did not change

      // Attempt to trigger mouseenter
      const label = div.querySelectorAll('.rating-item-label')[1]
      const mouseenter = createEvent('mouseenter')
      label.dispatchEvent(mouseenter)

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(0)
    })

    it('should not change or hover if disabled is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 3, disabled: true }) // eslint-disable-line no-new

      // Attempt to click on an input
      const inputs = div.querySelectorAll('.rating-item-input')
      inputs[1].click()

      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput).toBeNull() // Did not change
    })

    it('should not emit change event when disabled and input is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 3, disabled: true }) // eslint-disable-line no-new

      const listener = jasmine.createSpy('listener')
      div.addEventListener('change.coreui.rating', listener)

      const inputs = div.querySelectorAll('.rating-item-input')
      inputs[1].click()

      expect(listener).not.toHaveBeenCalled()
    })

    it('should not emit change event when readonly and input is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 3, readonly: true }) // eslint-disable-line no-new

      const listener = jasmine.createSpy('listener')
      div.addEventListener('change.coreui.rating', listener)

      const inputs = div.querySelectorAll('.rating-item-input')
      inputs[1].click()

      expect(listener).not.toHaveBeenCalled()
    })

    it('should not highlight labels on mouseover when disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 3, disabled: true }) // eslint-disable-line no-new

      const label = div.querySelectorAll('.rating-item-label')[1]
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(0)
    })

    it('should not clear labels on mouseleave when readonly', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 3, readonly: true, value: 2 }) // eslint-disable-line no-new

      const label = div.querySelectorAll('.rating-item-label')[2]
      const mouseout = createEvent('mouseout')
      label.dispatchEvent(mouseout)

      // Active labels should still reflect value=2
      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(2)
    })

    it('should not clear on click when readonly even with allowClear', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { // eslint-disable-line no-unused-vars
        itemCount: 3, readonly: true, value: 2, allowClear: true
      })

      const inputs = div.querySelectorAll('.rating-item-input')
      inputs[1].click()

      // Value should remain unchanged
      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(2)
    })

    it('should not clear on click when disabled even with allowClear', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { // eslint-disable-line no-unused-vars
        itemCount: 3, disabled: true, value: 2, allowClear: true
      })

      const inputs = div.querySelectorAll('.rating-item-input')
      inputs[1].click()

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(2)
    })
  })

  describe('tooltips', () => {
    it('should not create tooltip when tooltips is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, tooltips: false })

      const label = div.querySelectorAll('.rating-item-label')[1]
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      expect(rating._tooltip).toBeNull()
    })

    it('should create tooltip on mouseenter when tooltips is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, tooltips: true })

      const label = div.querySelectorAll('.rating-item-label')[1]
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      expect(rating._tooltip).not.toBeNull()
    })

    it('should create tooltip on focusin when tooltips is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, tooltips: true })

      const input = div.querySelectorAll('.rating-item-input')[1]
      const focusin = createEvent('focusin', { bubbles: true })
      input.dispatchEvent(focusin)

      expect(rating._tooltip).not.toBeNull()
    })

    it('should use value as tooltip title when tooltips is true (boolean)', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, tooltips: true })

      const label = div.querySelectorAll('.rating-item-label')[1]
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      expect(rating._tooltip).not.toBeNull()
    })

    it('should use object values for tooltip titles when tooltips is an object', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tooltipConfig = { 1: 'Bad', 2: 'OK', 3: 'Good' }
      const rating = new Rating(div, { itemCount: 3, tooltips: tooltipConfig })

      const label = div.querySelectorAll('.rating-item-label')[1]
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      expect(rating._tooltip).not.toBeNull()
    })

    it('should use array values for tooltip titles when tooltips is an array', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tooltipArray = ['Bad', 'OK', 'Good']
      const rating = new Rating(div, { itemCount: 3, tooltips: tooltipArray })

      const label = div.querySelectorAll('.rating-item-label')[1]
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      expect(rating._tooltip).not.toBeNull()
    })

    it('should hide tooltip on mouseleave', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, tooltips: true })

      const label = div.querySelectorAll('.rating-item-label')[1]
      const mouseover = createEvent('mouseover')
      label.dispatchEvent(mouseover)

      expect(rating._tooltip).not.toBeNull()
      spyOn(rating._tooltip, 'hide')

      const mouseout = createEvent('mouseout')
      label.dispatchEvent(mouseout)

      expect(rating._tooltip.hide).toHaveBeenCalled()
    })

    it('should hide tooltip on focusout', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, tooltips: true })

      const input = div.querySelectorAll('.rating-item-input')[1]
      const focusin = createEvent('focusin', { bubbles: true })
      input.dispatchEvent(focusin)

      expect(rating._tooltip).not.toBeNull()
      spyOn(rating._tooltip, 'hide')

      const focusout = createEvent('focusout', { bubbles: true })
      input.dispatchEvent(focusout)

      expect(rating._tooltip.hide).toHaveBeenCalled()
    })

    it('should hide existing tooltip before creating new one on mouseenter', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, tooltips: true })

      // Hover on first label
      const label1 = div.querySelectorAll('.rating-item-label')[0]
      const mouseover1 = createEvent('mouseover')
      label1.dispatchEvent(mouseover1)

      expect(rating._tooltip).not.toBeNull()
      const firstTooltip = rating._tooltip
      spyOn(firstTooltip, 'hide')

      // Hover on second label
      const label2 = div.querySelectorAll('.rating-item-label')[1]
      const mouseover2 = createEvent('mouseover')
      label2.dispatchEvent(mouseover2)

      expect(firstTooltip.hide).toHaveBeenCalled()
    })
  })

  describe('configAfterMerge', () => {
    it('should convert comma-separated string tooltips to array', () => {
      fixtureEl.innerHTML = '<div data-coreui-rating data-coreui-tooltips="Bad,OK,Good,Great,Excellent"></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(Array.isArray(rating._config.tooltips)).toBeTrue()
      expect(rating._config.tooltips).toEqual(['Bad', 'OK', 'Good', 'Great', 'Excellent'])
    })
  })

  describe('data-api', () => {
    it('should create rating elements on window load event', () => {
      fixtureEl.innerHTML = `
        <div id="myRating" data-coreui-rating data-coreui-value="2" data-coreui-item-count="4"></div>
      `
      const ratingEl = fixtureEl.querySelector('#myRating')

      // Manually trigger the load event
      const loadEvent = createEvent('load')
      window.dispatchEvent(loadEvent)

      const ratingInstance = Rating.getInstance(ratingEl)
      expect(ratingInstance).not.toBeNull()
      expect(ratingInstance._config.itemCount).toEqual(4)
      expect(ratingInstance._currentValue).toEqual(2) // from data attribute
    })

    it('should initialize with data attributes for disabled', () => {
      fixtureEl.innerHTML = `
        <div id="myRating" data-coreui-rating data-coreui-disabled="true"></div>
      `
      const ratingEl = fixtureEl.querySelector('#myRating')

      const loadEvent = createEvent('load')
      window.dispatchEvent(loadEvent)

      const ratingInstance = Rating.getInstance(ratingEl)
      expect(ratingInstance._config.disabled).toBeTrue()
      expect(ratingEl.classList.contains('disabled')).toBeTrue()
    })

    it('should initialize with data attributes for readonly', () => {
      fixtureEl.innerHTML = `
        <div id="myRating" data-coreui-rating data-coreui-readonly="true"></div>
      `
      const ratingEl = fixtureEl.querySelector('#myRating')

      const loadEvent = createEvent('load')
      window.dispatchEvent(loadEvent)

      const ratingInstance = Rating.getInstance(ratingEl)
      expect(ratingInstance._config.readonly).toBeTrue()
      expect(ratingEl.classList.contains('readonly')).toBeTrue()
    })

    it('should not include disallowed attributes from data attributes', () => {
      fixtureEl.innerHTML = `
        <div id="myRating" data-coreui-rating data-coreui-item-count="3"></div>
      `
      const ratingEl = fixtureEl.querySelector('#myRating')

      // Create instance directly - data API uses same _getConfig path
      const ratingInstance = new Rating(ratingEl)

      // sanitize defaults to true when not set via data attributes
      expect(ratingInstance._config.sanitize).toBeTrue()
      expect(ratingInstance._config.itemCount).toEqual(3)
    })
  })

  describe('jQueryInterface', () => {
    it('should create a rating via jQueryInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.rating = Rating.jQueryInterface
      jQueryMock.elements = [div]
      jQueryMock.fn.rating.call(jQueryMock)

      expect(Rating.getInstance(div)).not.toBeNull()
    })

    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.rating = Rating.jQueryInterface
      jQueryMock.elements = [div]

      const instance = Rating.getOrCreateInstance(div)
      const spy = spyOn(instance, 'reset')

      jQueryMock.fn.rating.call(jQueryMock, 'reset', 3)

      expect(spy).toHaveBeenCalledWith(3)
      instance.dispose()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      jQueryMock.fn.rating = Rating.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.rating.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })

    it('should throw error on private method', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      jQueryMock.fn.rating = Rating.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.rating.call(jQueryMock, '_createRating')
      }).toThrowError(TypeError, 'No method named "_createRating"')
    })

    it('should throw error on constructor method', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      jQueryMock.fn.rating = Rating.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.rating.call(jQueryMock, 'constructor')
      }).toThrowError(TypeError, 'No method named "constructor"')
    })

    it('should call a public method via jQueryInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      jQueryMock.fn.rating = Rating.jQueryInterface
      jQueryMock.elements = [div]

      // First create the instance
      jQueryMock.fn.rating.call(jQueryMock, { itemCount: 5, value: 3 })

      // Then call reset
      jQueryMock.fn.rating.call(jQueryMock, 'reset')

      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput).toBeNull()
    })

    it('should not re-initialize an existing instance with object config', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      jQueryMock.fn.rating = Rating.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.rating.call(jQueryMock, { itemCount: 3 })
      const instance1 = Rating.getInstance(div)

      jQueryMock.fn.rating.call(jQueryMock, { itemCount: 7 })
      const instance2 = Rating.getInstance(div)

      expect(instance1).toEqual(instance2)
    })
  })

  describe('ratingInterface', () => {
    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3 })
      const spy = spyOn(rating, 'setConfig')

      Rating.ratingInterface(div, 'setConfig', { value: 2 })

      expect(spy).toHaveBeenCalledWith({ value: 2 })
      rating.dispose()
    })

    it('should create instance via ratingInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      Rating.ratingInterface(div, { itemCount: 4 })

      const instance = Rating.getInstance(div)
      expect(instance).not.toBeNull()
      expect(instance._config.itemCount).toEqual(4)
    })

    it('should throw error for undefined method via ratingInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      // First create instance
      Rating.ratingInterface(div)

      expect(() => {
        Rating.ratingInterface(div, 'nonExistentMethod')
      }).toThrowError(TypeError, 'No method named "nonExistentMethod"')
    })

    it('should call a valid method via ratingInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      Rating.ratingInterface(div, { value: 3 })
      Rating.ratingInterface(div, 'reset')

      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput).toBeNull()
    })
  })

  describe('getInstance', () => {
    it('should return rating instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(Rating.getInstance(div)).toEqual(rating)
      expect(Rating.getInstance(div)).toBeInstanceOf(Rating)
    })

    it('should return null when there is no rating instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      expect(Rating.getInstance(div)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return rating instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(Rating.getOrCreateInstance(div)).toEqual(rating)
      expect(Rating.getInstance(div)).toEqual(Rating.getOrCreateInstance(div, {}))
      expect(Rating.getOrCreateInstance(div)).toBeInstanceOf(Rating)
    })

    it('should return new instance when there is no rating instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      expect(Rating.getInstance(div)).toBeNull()
      expect(Rating.getOrCreateInstance(div)).toBeInstanceOf(Rating)
    })

    it('should return the same instance when exists, ignoring new configuration', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3 })

      const rating2 = Rating.getOrCreateInstance(div, { itemCount: 5 })
      expect(rating2).toEqual(rating)
      // config should still show itemCount as 3
      expect(rating2._config.itemCount).toEqual(3)
    })
  })

  describe('form reset', () => {
    const wait = () => new Promise(resolve => {
      setTimeout(resolve)
    })

    it('should mark the star of the initial value as the default', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Rating(div, { value: 2 })

      const defaults = [...div.querySelectorAll('.rating-item-input')].filter(input => input.defaultChecked)

      expect(defaults.map(input => input.value)).toEqual(['2'])
    })

    it('should go back to its initial value when the form resets', async () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = fixtureEl.querySelector('div')
      const changeSpy = jasmine.createSpy('change')
      // eslint-disable-next-line no-new
      new Rating(div, { name: 'score', value: 2 })
      const input = div.querySelectorAll('.rating-item-input')[3]

      input.checked = true
      input.dispatchEvent(createEvent('change', { bubbles: true }))
      div.addEventListener('change.coreui.rating', changeSpy)
      form.reset()
      await wait()

      expect(new FormData(form).get('score')).toEqual('2')
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(2)
      expect(changeSpy).toHaveBeenCalledTimes(1)
      expect(changeSpy.calls.mostRecent().args[0].value).toEqual('2')
    })

    it('should keep the rating when a listener cancels the form reset', async () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = fixtureEl.querySelector('div')
      const changeSpy = jasmine.createSpy('change')
      // eslint-disable-next-line no-new
      new Rating(div, { name: 'score', value: 2 })
      const input = div.querySelectorAll('.rating-item-input')[3]

      input.checked = true
      input.dispatchEvent(createEvent('change', { bubbles: true }))
      form.addEventListener('reset', event => event.preventDefault())
      div.addEventListener('change.coreui.rating', changeSpy)
      form.reset()
      await wait()

      expect(new FormData(form).get('score')).toEqual('4')
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(4)
      expect(changeSpy).not.toHaveBeenCalled()
    })

    it('should keep focus on the star when the form resets', async () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Rating(div, { value: 2 })
      const input = div.querySelectorAll('.rating-item-input')[3]

      input.focus()
      input.checked = true
      input.dispatchEvent(createEvent('change', { bubbles: true }))
      form.reset()
      await wait()

      expect(document.activeElement).toBe(input)
    })

    it('should not fire a change for a value it cannot show', async () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = fixtureEl.querySelector('div')
      const changeSpy = jasmine.createSpy('change')
      // eslint-disable-next-line no-new
      new Rating(div, { value: 2.5 })

      div.addEventListener('change.coreui.rating', changeSpy)
      form.reset()
      await wait()

      expect(changeSpy).not.toHaveBeenCalled()
    })

    it('should clear a rating without an initial value when the form resets', async () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Rating(div, { name: 'score' })
      const input = div.querySelectorAll('.rating-item-input')[3]

      input.checked = true
      input.dispatchEvent(createEvent('change', { bubbles: true }))
      form.reset()
      await wait()

      expect(new FormData(form).has('score')).toBeFalse()
      expect(div.querySelector('.rating-item-label.active')).toBeNull()
    })

    it('should not fire a change when the form resets to the value it already has', async () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = fixtureEl.querySelector('div')
      const changeSpy = jasmine.createSpy('change')
      // eslint-disable-next-line no-new
      new Rating(div, { value: 2 })

      div.addEventListener('change.coreui.rating', changeSpy)
      form.reset()
      await wait()

      expect(changeSpy).not.toHaveBeenCalled()
    })

    it('should stop following the form once disposed, and leave the other ratings listening', async () => {
      fixtureEl.innerHTML = '<form><div id="first"></div><div id="second"></div></form>'
      const form = fixtureEl.querySelector('form')
      const first = new Rating(fixtureEl.querySelector('#first'), { value: 1 })
      const secondEl = fixtureEl.querySelector('#second')
      // eslint-disable-next-line no-new
      new Rating(secondEl, { value: 2 })
      const input = secondEl.querySelectorAll('.rating-item-input')[3]
      const changeSpy = jasmine.createSpy('change')

      const offSpy = vi.spyOn(EventHandler, 'off')

      first.dispose()

      expect(offSpy).toHaveBeenCalledWith(document, 'reset.coreui.rating', 'form', expect.any(Function))

      input.checked = true
      input.dispatchEvent(createEvent('change', { bubbles: true }))
      secondEl.addEventListener('change.coreui.rating', changeSpy)
      form.reset()
      await wait()

      expect(changeSpy).toHaveBeenCalledTimes(1)
      expect(secondEl.querySelectorAll('.rating-item-label.active')).toHaveSize(2)
      offSpy.mockRestore()
    })
  })

  describe('validation', () => {
    const wait = () => new Promise(resolve => {
      setTimeout(resolve)
    })

    const mountInForm = (config = {}, attributes = '', after = '<div class="invalid-feedback">Rate the delivery.</div>') => {
      fixtureEl.innerHTML = `<form><div id="score" ${attributes}></div>${after}</form>`
      const element = fixtureEl.querySelector('#score')

      return { element, form: fixtureEl.querySelector('form'), rating: new Rating(element, { name: 'score', ...config }) }
    }

    const radiosOf = element => [...element.querySelectorAll('.rating-item-input')]

    it('should show a given state on the element and block the submit through the first radio', () => {
      const { element, form } = mountInForm({ validationState: 'invalid' })
      const [first, second] = radiosOf(element)
      const feedback = form.querySelector('.invalid-feedback')

      expect(element).toHaveClass('is-invalid')
      expect(element.getAttribute('aria-invalid')).toEqual('true')
      expect(element.hasAttribute('aria-describedby')).toBeFalse()
      expect(radiosOf(element).every(radio => radio.getAttribute('aria-describedby') === feedback.id)).toBeTrue()
      expect(radiosOf(element).some(radio => radio.hasAttribute('aria-invalid'))).toBeFalse()
      expect(first.validationMessage).toEqual('Rate the delivery.')
      expect(second.validity.valid).toBeTrue()
      expect(form.checkValidity()).toBeFalse()
    })

    it('should block the submit through the checked star, and the focus goes there', () => {
      const { element, form } = mountInForm({ validationState: 'invalid', value: 3 })
      const radios = radiosOf(element)

      expect(radios[2].validationMessage).toEqual('Rate the delivery.')
      expect(radios[0].validity.valid).toBeTrue()

      form.reportValidity()

      expect(document.activeElement).toBe(radios[2])
    })

    it('should block with a generic message without a feedback', () => {
      const { element } = mountInForm({ validationState: 'invalid' }, '', '')

      expect(radiosOf(element)[0].validationMessage).toEqual('Invalid value.')
    })

    it('should not block for a valid or a custom state', () => {
      const { element, form, rating } = mountInForm({ validationState: 'valid' })

      expect(element).toHaveClass('is-valid')
      expect(element.hasAttribute('aria-invalid')).toBeFalse()
      expect(form.checkValidity()).toBeTrue()

      rating.setConfig({ validationState: 'warning' })

      expect(element).toHaveClass('is-warning')
      expect(element).not.toHaveClass('is-valid')
      expect(form.checkValidity()).toBeTrue()
    })

    it('should show a given state but not block the submit while disabled or read-only', () => {
      for (const config of [{ disabled: true }, { readonly: true }]) {
        const { element, form } = mountInForm({ validationState: 'invalid', ...config })

        expect(element).toHaveClass('is-invalid')
        expect(form.checkValidity()).toBeTrue()
      }
    })

    it('should read the server class of the element once, when it starts', () => {
      const { element, form } = mountInForm({}, 'class="is-invalid"')

      expect(element).toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeFalse()

      element.classList.add('is-valid')
      radiosOf(element)[0].dispatchEvent(createEvent('focusout'))

      expect(form.checkValidity()).toBeFalse()
      expect(element.getAttribute('aria-invalid')).toEqual('true')

      const { element: valid } = mountInForm({}, 'class="is-valid"')

      expect(valid).toHaveClass('is-valid')

      valid.querySelectorAll('.rating-item-label')[1].click()

      expect(valid).not.toHaveClass('is-valid')
    })

    it('should drop a given state when the user picks a star, before the change event', () => {
      const { element, form } = mountInForm({ validationState: 'invalid' })
      const seen = []

      element.addEventListener('change.coreui.rating', () => seen.push(element.classList.contains('is-invalid'), form.checkValidity()))
      element.querySelectorAll('.rating-item-label')[3].click()

      expect(seen).toEqual([false, true])
      expect(element.hasAttribute('aria-invalid')).toBeFalse()
      expect(radiosOf(element).some(radio => radio.hasAttribute('aria-describedby'))).toBeFalse()
    })

    it('should drop a given valid state when the user picks a star', () => {
      const { element } = mountInForm({ validationState: 'valid' })

      element.querySelectorAll('.rating-item-label')[3].click()

      expect(element).not.toHaveClass('is-valid')
    })

    it('should drop a given state when the user clears the rating', () => {
      const { element, form } = mountInForm({ allowClear: true, validationState: 'invalid', value: 3 })
      const seen = []

      element.addEventListener('change.coreui.rating', () => seen.push(element.classList.contains('is-invalid')))
      element.querySelectorAll('.rating-item-label')[2].click()

      expect(seen).toEqual([false])
      expect(radiosOf(element).some(radio => radio.checked)).toBeFalse()
      expect(element).not.toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeTrue()
    })

    it('should keep a given state when the value changes from code', () => {
      const { element, form, rating } = mountInForm({ validationState: 'invalid', value: 2 })

      rating.setConfig({ value: 4 })
      rating.reset(3)

      expect(element).toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeFalse()
    })

    it('should change the state on setConfig without building the stars again', () => {
      const { element, form, rating } = mountInForm()
      const before = radiosOf(element)

      rating.setConfig({ validationState: 'invalid' })

      expect(radiosOf(element)).toEqual(before)
      expect(element).toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeFalse()

      rating.setConfig({ validationState: null })

      expect(element).not.toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeTrue()
    })

    it('should drop a state given before a native reset, also when the page rebuilds the rating in the reset', async () => {
      const { element, form, rating } = mountInForm({ validationState: 'invalid' })

      form.addEventListener('reset', () => rating.setConfig({ itemCount: 6 }))
      form.reset()
      await wait()

      expect(element).not.toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeTrue()
    })

    it('should drop a state on a native reset of the form the rating was put in after it started', async () => {
      fixtureEl.innerHTML = '<form></form>'
      const form = fixtureEl.querySelector('form')
      const element = document.createElement('div')
      // eslint-disable-next-line no-new
      new Rating(element, { name: 'score', validationState: 'invalid' })

      form.append(element)
      form.reset()
      await wait()

      expect(element).not.toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeTrue()
    })

    it('should follow a native reset of a form cloned from a template and inside a shadow root', async () => {
      const template = document.createElement('template')
      template.innerHTML = '<form><div></div></form>'
      const clone = template.content.cloneNode(true)
      const cloned = clone.querySelector('div')
      // eslint-disable-next-line no-new
      new Rating(cloned, { name: 'score', validationState: 'invalid', value: 2 })
      fixtureEl.append(clone)

      cloned.querySelectorAll('.rating-item-label')[3].click()
      cloned.closest('form').reset()
      await wait()

      expect(cloned.querySelectorAll('.rating-item-label.active')).toHaveSize(2)

      const host = document.createElement('div')
      fixtureEl.append(host)
      host.attachShadow({ mode: 'open' }).innerHTML = '<form><div></div></form>'
      const shadowed = host.shadowRoot.querySelector('div')
      // eslint-disable-next-line no-new
      new Rating(shadowed, { name: 'score', validationState: 'invalid' })

      host.shadowRoot.querySelector('form').reset()
      await wait()

      expect(shadowed).not.toHaveClass('is-invalid')
    })

    it('should keep a state given in a reset listener the page added before the rating', async () => {
      fixtureEl.innerHTML = '<form><div id="score"></div></form>'
      const form = fixtureEl.querySelector('form')
      const element = fixtureEl.querySelector('#score')
      let rating = null

      form.addEventListener('reset', () => rating.setConfig({ validationState: 'invalid' }))
      rating = new Rating(element, { name: 'score' })
      form.reset()
      await wait()

      expect(element).toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeFalse()
    })

    it('should make every radio required and the element aria-required, unless it is read-only', () => {
      const { element, form, rating } = mountInForm({ required: true })

      expect(radiosOf(element).every(radio => radio.required)).toBeTrue()
      expect(element.getAttribute('aria-required')).toEqual('true')
      expect(form.checkValidity()).toBeFalse()

      element.querySelectorAll('.rating-item-label')[1].click()

      expect(form.checkValidity()).toBeTrue()

      rating.setConfig({ readonly: true, value: null })

      expect(radiosOf(element).some(radio => radio.required)).toBeFalse()
      expect(element.hasAttribute('aria-required')).toBeFalse()
      expect(form.checkValidity()).toBeTrue()
    })

    it('should show the state a validation reports for a required rating without a value, and drop it once a star is picked', () => {
      const { element, form } = mountInForm({ required: true })
      const feedback = form.querySelector('.invalid-feedback')

      form.checkValidity()

      expect(element).toHaveClass('is-invalid')
      expect(element.getAttribute('aria-invalid')).toEqual('true')
      expect(radiosOf(element)[0].getAttribute('aria-describedby')).toEqual(feedback.id)

      element.querySelectorAll('.rating-item-label')[1].click()

      expect(element).not.toHaveClass('is-invalid')
      expect(element.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should keep the state a validation reported when setConfig renders the stars again', () => {
      const { element, form, rating } = mountInForm({ required: true })

      form.checkValidity()
      rating.setConfig({ size: 'lg' })

      expect(element).toHaveClass('is-invalid')
      expect(element.getAttribute('aria-invalid')).toEqual('true')
    })

    it('should keep a given valid state over what the form plugin reports', () => {
      const { element, form } = mountInForm({ required: true, validationState: 'valid' })

      form.setAttribute('data-coreui-validate', '')
      form.noValidate = true
      Form.getOrCreateInstance(form).validate()

      expect(element).toHaveClass('is-valid')
      expect(element.hasAttribute('aria-invalid')).toBeFalse()
      expect(radiosOf(element).some(radio => radio.classList.contains('is-invalid') || radio.hasAttribute('aria-invalid'))).toBeFalse()
    })

    it('should keep the description of the page and add the feedback to every star only while invalid', () => {
      const { element, form, rating } = mountInForm({ validationState: 'invalid' }, 'aria-describedby="scoreHelp"')
      const feedback = form.querySelector('.invalid-feedback')

      expect(element.getAttribute('aria-describedby')).toEqual('scoreHelp')
      expect(radiosOf(element).every(radio => radio.getAttribute('aria-describedby') === feedback.id)).toBeTrue()

      rating.setConfig({ validationState: null })

      expect(element.getAttribute('aria-describedby')).toEqual('scoreHelp')
      expect(radiosOf(element).some(radio => radio.hasAttribute('aria-describedby'))).toBeFalse()
    })

    it('should find the feedback named in data-coreui-invalid-feedback on the element', () => {
      const { element } = mountInForm({ validationState: 'invalid' }, 'data-coreui-invalid-feedback="scoreError"', '<p><span id="scoreError">Rate the delivery.</span></p>')

      expect(radiosOf(element)[0].getAttribute('aria-describedby')).toEqual('scoreError')
      expect(radiosOf(element)[0].validationMessage).toEqual('Rate the delivery.')
    })

    it('should leave aria-invalid and aria-required the page set on the element', () => {
      const { element, rating } = mountInForm({ required: true, validationState: 'invalid' }, 'aria-invalid="false" aria-required="false"')

      expect(element.getAttribute('aria-invalid')).toEqual('false')
      expect(element.getAttribute('aria-required')).toEqual('false')

      rating.setConfig({ validationState: null })

      expect(element.getAttribute('aria-invalid')).toEqual('false')

      rating.dispose()

      expect(element.getAttribute('aria-invalid')).toEqual('false')
      expect(element.getAttribute('aria-required')).toEqual('false')
    })

    it('should give back the server class it still holds and take its own attributes back on dispose', () => {
      const { element, rating } = mountInForm({ required: true }, 'class="is-invalid" aria-describedby="scoreHelp"')

      rating.dispose()

      expect(element).toHaveClass('is-invalid')
      expect(element.getAttribute('aria-describedby')).toEqual('scoreHelp')
      expect(element.hasAttribute('aria-invalid')).toBeFalse()
      expect(element.hasAttribute('aria-required')).toBeFalse()

      const { element: picked, rating: dismissed } = mountInForm({}, 'class="is-invalid"')

      picked.querySelectorAll('.rating-item-label')[1].click()
      dismissed.dispose()

      expect(picked).not.toHaveClass('is-invalid')

      const { element: plain, rating: given } = mountInForm({ validationState: 'invalid' })

      given.dispose()

      expect(plain.outerHTML).toEqual('<div id="score"></div>')
    })
  })

  describe('dispose', () => {
    it('should leave a disabled class the page writes after init, and give back the one it added or removed', () => {
      fixtureEl.innerHTML = '<div id="page"></div><div id="added"></div><div id="markup" class="disabled"></div>'
      const page = fixtureEl.querySelector('#page')
      const added = fixtureEl.querySelector('#added')
      const markup = fixtureEl.querySelector('#markup')
      const pageRating = new Rating(page)
      const addedRating = new Rating(added, { disabled: true })
      const markupRating = new Rating(markup)

      page.classList.add('disabled')
      markupRating.setConfig({ disabled: false })

      expect(markup).not.toHaveClass('disabled')

      for (const rating of [pageRating, addedRating, markupRating]) {
        rating.dispose()
      }

      expect(page.getAttribute('class')).toEqual('disabled')
      expect(added.hasAttribute('class')).toBeFalse()
      expect(markup.getAttribute('class')).toEqual('disabled')
    })

    it('should take back the items and radios it rendered', () => {
      fixtureEl.innerHTML = '<form><div data-coreui-rating></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { name: 'score', value: 3 })

      rating.dispose()

      expect(div.querySelector('.rating-item')).toBeNull()
      expect(new FormData(form).has('score')).toBeFalse()
    })

    it('should give the element its markup back', () => {
      fixtureEl.innerHTML = '<div data-coreui-rating data-coreui-value="3"><span class="rating-note">12 reviews</span></div>'
      const div = fixtureEl.querySelector('div')
      const markup = div.outerHTML
      const rating = new Rating(div, { disabled: true, readonly: true, size: 'lg' })

      rating.dispose()

      expect(div.outerHTML).toEqual(markup)
    })

    it('should keep a role the page wrote, while alive and after dispose', () => {
      fixtureEl.innerHTML = '<div role="group" data-coreui-rating></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(div.getAttribute('role')).toEqual('group')

      rating.dispose()

      expect(div.getAttribute('role')).toEqual('group')
    })

    it('should keep a role the page set after init', () => {
      fixtureEl.innerHTML = '<div data-coreui-rating></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      div.setAttribute('role', 'group')
      rating.setConfig({ size: 'lg' })

      expect(div.getAttribute('role')).toEqual('group')

      rating.dispose()

      expect(div.getAttribute('role')).toEqual('group')
    })

    it('should keep an empty class attribute the page wrote', () => {
      fixtureEl.innerHTML = '<div class="" data-coreui-rating></div>'
      const div = fixtureEl.querySelector('div')
      const markup = div.outerHTML

      new Rating(div).dispose()

      expect(div.outerHTML).toEqual(markup)
    })

    it('should keep rating items the page wrote', () => {
      fixtureEl.innerHTML = '<div data-coreui-rating><div class="rating-item">Fallback</div></div>'
      const div = fixtureEl.querySelector('div')
      const markup = div.outerHTML

      new Rating(div).dispose()

      expect(div.outerHTML).toEqual(markup)
    })

    it('should dispose the tooltips of half-star items', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, precision: 0.5, tooltips: true })
      const label = div.querySelectorAll('.rating-item-label')[1]

      label.dispatchEvent(createEvent('mouseover'))
      const wrapper = label.parentElement
      expect(Tooltip.getInstance(wrapper)).not.toBeNull()

      rating.dispose()

      expect(Tooltip.getInstance(wrapper)).toBeNull()
    })

    it('should not throw when a change listener disposes the rating', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)
      const input = div.querySelectorAll('.rating-item-input')[1]

      const errors = []
      const onError = event => {
        errors.push(event.error)
        event.preventDefault()
      }

      div.addEventListener('change.coreui.rating', () => rating.dispose())
      window.addEventListener('error', onError)
      input.checked = true
      EventHandler.trigger(input, 'change')
      window.removeEventListener('error', onError)

      expect(errors).toEqual([])
      expect(div.querySelector('.rating-item')).toBeNull()
    })

    it('should keep the classes and role the page wrote', () => {
      fixtureEl.innerHTML = '<div class="rating rating-lg" role="radiogroup" data-coreui-rating></div>'
      const div = fixtureEl.querySelector('div')
      const markup = div.outerHTML
      const rating = new Rating(div, { size: 'lg' })

      rating.dispose()

      expect(div.outerHTML).toEqual(markup)
    })

    it('should render a single set of items when initialized again', () => {
      fixtureEl.innerHTML = '<div data-coreui-rating></div>'
      const div = fixtureEl.querySelector('div')

      new Rating(div, { itemCount: 5 }).dispose()
      // eslint-disable-next-line no-new
      new Rating(div, { itemCount: 5 })

      expect(div.querySelectorAll('.rating-item')).toHaveSize(5)
    })

    it('should leave the markup alone when called again', () => {
      fixtureEl.innerHTML = '<div data-coreui-rating></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      rating.dispose()
      const markup = div.outerHTML

      expect(() => rating.dispose()).not.toThrow()
      expect(div.outerHTML).toEqual(markup)
    })

    it('should remove the instance on dispose', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(Rating.getInstance(div)).not.toBeNull()
      rating.dispose()
      expect(Rating.getInstance(div)).toBeNull()
    })

    it('should dispose every tooltip created on the items', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, tooltips: true })

      const labels = div.querySelectorAll('.rating-item-label')
      labels[0].dispatchEvent(createEvent('mouseover'))
      labels[2].dispatchEvent(createEvent('mouseover'))
      const items = [labels[0].parentElement, labels[2].parentElement]
      expect(items.map(item => Tooltip.getInstance(item))).not.toContain(null)

      rating.dispose()

      expect(items.map(item => Tooltip.getInstance(item))).toEqual([null, null])
    })
  })

  describe('keyboard navigation', () => {
    it('should change value with ArrowRight key on input', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { itemCount: 5, value: 2 }) // eslint-disable-line no-new

        div.addEventListener('change.coreui.rating', event => {
          expect(event.value).toBe('3')
          resolve()
        })

        const input = div.querySelectorAll('.rating-item-input')[2] // value 3
        // Simulate the browser behavior of radio selection changing via keyboard
        input.checked = true
        const changeEvent = createEvent('change', { bubbles: true })
        input.dispatchEvent(changeEvent)
      })
    })

    it('should change value with ArrowLeft key on input', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { itemCount: 5, value: 3 }) // eslint-disable-line no-new

        div.addEventListener('change.coreui.rating', event => {
          expect(event.value).toBe('2')
          resolve()
        })

        const input = div.querySelectorAll('.rating-item-input')[1] // value 2
        input.checked = true
        const changeEvent = createEvent('change', { bubbles: true })
        input.dispatchEvent(changeEvent)
      })
    })
  })

  describe('click to rate', () => {
    it('should set value when clicking a label', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { itemCount: 5 }) // eslint-disable-line no-new

        div.addEventListener('change.coreui.rating', event => {
          expect(event.value).toBe('4')
          resolve()
        })

        const label = div.querySelectorAll('.rating-item-label')[3] // 4th star
        label.click()
      })
    })

    it('should activate all labels up to clicked label', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5 }) // eslint-disable-line no-new

      const label = div.querySelectorAll('.rating-item-label')[2] // 3rd star
      label.click()

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(3)
    })

    it('should change value when clicking a different star', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 5, value: 2 })

      const label = div.querySelectorAll('.rating-item-label')[4] // 5th star
      label.click()

      expect(rating._currentValue).toBe('5')
    })
  })

  describe('allowClear', () => {
    it('should clear rating when clicking the currently selected value with allowClear true', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { itemCount: 5, value: 3, allowClear: true }) // eslint-disable-line no-new

        div.addEventListener('change.coreui.rating', event => {
          expect(event.value).toBeNull()
          resolve()
        })

        const input = div.querySelectorAll('.rating-item-input')[2] // value="3"
        input.click()
      })
    })

    it('should uncheck the input when clearing', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5, value: 3, allowClear: true }) // eslint-disable-line no-new

      const input = div.querySelectorAll('.rating-item-input')[2] // value="3"
      input.click()

      expect(input.checked).toBeFalse()
    })

    it('should reset all labels when clearing', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5, value: 3, allowClear: true }) // eslint-disable-line no-new

      const input = div.querySelectorAll('.rating-item-input')[2] // value="3"
      input.click()

      const activeLabels = div.querySelectorAll('.rating-item-label.active')
      expect(activeLabels).toHaveSize(0)
    })

    it('should set currentValue to null when clearing', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 5, value: 3, allowClear: true })

      const input = div.querySelectorAll('.rating-item-input')[2] // value="3"
      input.click()

      expect(rating._currentValue).toBeNull()
    })
  })

  describe('half precision click', () => {
    it('should set value to 0.5 when clicking first half of first star', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { precision: 0.5, itemCount: 5 }) // eslint-disable-line no-new

        div.addEventListener('change.coreui.rating', event => {
          expect(event.value).toBe('0.5')
          resolve()
        })

        const inputs = div.querySelectorAll('.rating-item-input')
        // First input should have value 0.5
        inputs[0].checked = true
        const changeEvent = createEvent('change', { bubbles: true })
        inputs[0].dispatchEvent(changeEvent)
      })
    })

    it('should set value to 1 when clicking second half of first star', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Rating(div, { precision: 0.5, itemCount: 5 }) // eslint-disable-line no-new

        div.addEventListener('change.coreui.rating', event => {
          expect(event.value).toBe('1')
          resolve()
        })

        const inputs = div.querySelectorAll('.rating-item-input')
        // Second input should have value 1
        inputs[1].checked = true
        const changeEvent = createEvent('change', { bubbles: true })
        inputs[1].dispatchEvent(changeEvent)
      })
    })
  })

  describe('multiple interactions', () => {
    it('should correctly handle multiple hover and leave cycles', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5, value: 2 }) // eslint-disable-line no-new

      const labels = div.querySelectorAll('.rating-item-label')

      // Hover 4th star
      labels[3].dispatchEvent(createEvent('mouseover'))
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(4)

      // Leave
      labels[3].dispatchEvent(createEvent('mouseout'))
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(2)

      // Hover 1st star
      labels[0].dispatchEvent(createEvent('mouseover'))
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(1)

      // Leave
      labels[0].dispatchEvent(createEvent('mouseout'))
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(2)
    })

    it('should update active state after clicking and then hovering', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5 }) // eslint-disable-line no-new

      const labels = div.querySelectorAll('.rating-item-label')

      // Click 3rd star
      labels[2].click()
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(3)

      // Hover 5th star
      labels[4].dispatchEvent(createEvent('mouseover'))
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(5)

      // Leave - should go back to 3
      labels[4].dispatchEvent(createEvent('mouseout'))
      expect(div.querySelectorAll('.rating-item-label.active')).toHaveSize(3)
    })
  })

  describe('sanitize', () => {
    it('should strip event-handler attributes from a custom icon', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Rating(div, { readonly: true, value: 1, icon: '<img src=x onerror="window.xss = true">' })

      const icon = div.querySelector('.rating-item-custom-icon img')
      expect(icon.hasAttribute('onerror')).toBeFalse()
    })

    it('should not disable sanitization via a data attribute', () => {
      fixtureEl.innerHTML = '<div data-coreui-sanitize="false" data-coreui-readonly="true" data-coreui-value="1" data-coreui-icon="<img src=x onerror=alert(1)>"></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div)

      expect(rating._config.sanitize).toBeTrue()
      expect(div.querySelector('.rating-item-custom-icon img').hasAttribute('onerror')).toBeFalse()
    })
  })
})
