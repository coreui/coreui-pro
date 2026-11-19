import { getAccessibleName, getText } from '../../../src/util/accessible-name.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Accessible name utilities', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('getText', () => {
    it('reads the text without hidden descendants and with white space collapsed', () => {
      fixtureEl.innerHTML = '<p>Enter <span hidden>secret</span>a\n   <span aria-hidden="true">*</span>name. <span aria-hidden="false">Now</span></p>'

      expect(getText(fixtureEl.querySelector('p'))).toBe('Enter a name. Now')
    })

    it('keeps the text of an element that is hidden itself', () => {
      fixtureEl.innerHTML = '<p hidden>Saved</p>'

      expect(getText(fixtureEl.querySelector('p'))).toBe('Saved')
    })

    it('returns an empty string without an element', () => {
      expect(getText(null)).toBe('')
    })
  })

  describe('getAccessibleName', () => {
    it('reads the elements aria-labelledby lists, in their order', () => {
      fixtureEl.innerHTML = '<button aria-labelledby="b a" aria-label="Label">Text</button><span id="a">draft</span><span id="b">Save</span>'

      expect(getAccessibleName(fixtureEl.querySelector('button'))).toBe('Save draft')
    })

    it('leaves out the hidden descendants of a labelling element', () => {
      fixtureEl.innerHTML = '<button aria-labelledby="name">Text</button><span id="name">Save <span aria-hidden="true">(ctrl+s)</span></span>'

      expect(getAccessibleName(fixtureEl.querySelector('button'))).toBe('Save')
    })

    it('reads aria-label when aria-labelledby names nothing', () => {
      fixtureEl.innerHTML = '<button aria-labelledby="missing empty" aria-label=" Save the form ">Save</button><span id="empty"> </span>'

      expect(getAccessibleName(fixtureEl.querySelector('button'))).toBe('Save the form')
    })

    it('reads the text without hidden content when there is no label', () => {
      fixtureEl.innerHTML = '<button aria-label=" "><span class="spinner-border" aria-hidden="true"></span><span hidden>Busy</span>Save\n    draft</button>'

      expect(getAccessibleName(fixtureEl.querySelector('button'))).toBe('Save draft')
    })

    it('reads the text before the title', () => {
      fixtureEl.innerHTML = '<button title="Upload the draft">Save</button>'

      expect(getAccessibleName(fixtureEl.querySelector('button'))).toBe('Save')
    })

    it('reads the title when there is no label and no text', () => {
      fixtureEl.innerHTML = '<button title=" Save "><svg aria-hidden="true"><text>S</text></svg></button>'

      expect(getAccessibleName(fixtureEl.querySelector('button'))).toBe('Save')
    })

    it('returns an empty string when the element has no name', () => {
      fixtureEl.innerHTML = '<button></button>'

      expect(getAccessibleName(fixtureEl.querySelector('button'))).toBe('')
    })

    it('reads aria-labelledby in the shadow root that holds the element', () => {
      fixtureEl.innerHTML = '<div></div><span id="name">Outside</span>'
      const shadowRoot = fixtureEl.querySelector('div').attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = '<button aria-labelledby="name">Text</button><span id="name">Inside</span>'

      expect(getAccessibleName(shadowRoot.querySelector('button'))).toBe('Inside')
    })

    it('skips aria-labelledby on an element outside a document', () => {
      const button = document.createElement('button')
      button.setAttribute('aria-labelledby', 'name')
      button.textContent = 'Save'

      expect(getAccessibleName(button)).toBe('Save')
    })
  })
})
