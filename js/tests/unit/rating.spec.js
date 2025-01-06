/* eslint-env jasmine */

import Rating from '../../src/rating.js'
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
        readOnly: true
      })

      expect(rating._config.itemCount).toEqual(3)
      expect(rating._currentValue).toEqual(2)
      expect(rating._config.readOnly).toBeTrue()
    })

    it('should apply the "disabled" class when config.disabled = true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      // for instance: disabled is set to true
      const rating = new Rating(div, { disabled: true })
      expect(rating._element.classList).toContain('disabled')
    })

    it('should create the correct number of rating items', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 5 }) // eslint-disable-line no-new

      expect(div.querySelectorAll('.rating-item')).toHaveSize(5)
    })

    it('should set the initial checked input if "value" is provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { value: 2 }) // eslint-disable-line no-new

      const checkedInputs = div.querySelectorAll('.rating-item-input:checked')
      expect(checkedInputs).toHaveSize(1)
      expect(checkedInputs[0].value).toEqual('2')
    })
  })

  describe('update', () => {
    it('should update config and re-render the rating UI', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const rating = new Rating(div, { itemCount: 3, value: 1 })

      const previousHTML = div.innerHTML
      rating.update({ itemCount: 5, value: 3 })

      expect(div.innerHTML).not.toEqual(previousHTML)
      expect(div.querySelectorAll('.rating-item')).toHaveSize(5)
      const checkedInput = div.querySelector('.rating-item-input:checked')
      expect(checkedInput.value).toEqual('3')
    })
  })

  describe('reset', () => {
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
  })

  describe('readonly & disabled', () => {
    it('should not change or hover if readOnly is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Rating(div, { itemCount: 3, readOnly: true }) // eslint-disable-line no-new

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
  })

  describe('data-api', () => {
    it('should create rating elements on window load event', () => {
      fixtureEl.innerHTML = `
        <div id="myRating" data-coreui-toggle="rating" data-coreui-value="2" data-coreui-item-count="4"></div>
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

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      jQueryMock.fn.rating = Rating.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.rating.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
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
})
