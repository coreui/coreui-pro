import { isFromPanelControl, isFromPanelWidget } from '../../../src/util/panel-control.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Panel control utilities', () => {
  let fixtureEl

  const fire = (check, target, panel) => {
    let result
    const listener = event => {
      result = check(event, panel, '.item')
    }

    document.addEventListener('keydown', listener)
    target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true, key: 'ArrowDown' }))
    document.removeEventListener('keydown', listener)
    return result
  }

  const widgetRoles = ['combobox', 'grid', 'listbox', 'radiogroup', 'slider', 'spinbutton', 'tablist', 'textbox', 'toolbar', 'tree', 'treegrid']

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('isFromPanelWidget', () => {
    it('should recognize form fields, editable regions and every widget role with its own keys', () => {
      fixtureEl.innerHTML = [
        '<div id="panel">',
        '  <input id="input"><select id="select"></select><textarea id="textarea"></textarea>',
        '  <div contenteditable="true"><b id="bold">B</b></div>',
        ...widgetRoles.map(role => `<div role="${role}"><span id="${role}">x</span></div>`),
        '</div>'
      ].join('')
      const panel = fixtureEl.querySelector('#panel')

      for (const id of ['input', 'select', 'textarea', 'bold', ...widgetRoles]) {
        expect(fire(isFromPanelWidget, fixtureEl.querySelector(`#${id}`), panel)).toBeTrue()
      }
    })

    it('should leave out items, buttons in a form, labels, contenteditable="false" and the panel', () => {
      fixtureEl.innerHTML = [
        '<form id="panel" role="menu">',
        '  <button id="item" role="menuitem">Item</button>',
        '  <button id="submit">Save</button>',
        '  <label><span id="caption">Bold</span></label>',
        '  <div contenteditable="false"><button id="fixed">Fixed</button></div>',
        '  <div role="switch"><span id="switch">On</span></div>',
        '</form>'
      ].join('')
      const panel = fixtureEl.querySelector('#panel')

      for (const id of ['item', 'submit', 'caption', 'fixed', 'switch']) {
        expect(fire(isFromPanelWidget, fixtureEl.querySelector(`#${id}`), panel)).toBeFalse()
      }

      expect(fire(isFromPanelWidget, panel, panel)).toBeFalse()
    })

    it('should ignore widgets around the panel and events outside it', () => {
      fixtureEl.innerHTML = '<div role="toolbar"><div id="panel"><button id="item">Item</button></div><button id="outside">Outside</button></div>'
      const panel = fixtureEl.querySelector('#panel')

      expect(fire(isFromPanelWidget, fixtureEl.querySelector('#item'), panel)).toBeFalse()
      expect(fire(isFromPanelWidget, fixtureEl.querySelector('#outside'), panel)).toBeFalse()
    })

    it('should follow the composed path into a shadow root', () => {
      fixtureEl.innerHTML = '<div id="panel"><div id="host"></div></div>'
      const panel = fixtureEl.querySelector('#panel')
      const shadow = fixtureEl.querySelector('#host').attachShadow({ mode: 'open' })
      shadow.innerHTML = '<div role="slider" tabindex="0"><span id="thumb">o</span></div>'

      expect(fire(isFromPanelWidget, shadow.querySelector('#thumb'), panel)).toBeTrue()
    })
  })

  describe('menu items', () => {
    it('should never count a menu item or what wraps it, for either check', () => {
      fixtureEl.innerHTML = [
        '<div id="panel">',
        '  <div role="toolbar"><button id="tool" class="item">Bold</button></div>',
        '  <form><button id="form-item" class="item"><span id="label">Save</span></button></form>',
        '  <button id="option-item" class="item" role="option">Option</button>',
        '</div>'
      ].join('')
      const panel = fixtureEl.querySelector('#panel')

      for (const check of [isFromPanelWidget, isFromPanelControl]) {
        for (const id of ['tool', 'label', 'option-item']) {
          expect(fire(check, fixtureEl.querySelector(`#${id}`), panel)).toBeFalse()
        }
      }
    })

    it('should not count a panel with a widget role of its own', () => {
      fixtureEl.innerHTML = '<ul id="panel" role="listbox"><li><span id="text">Text</span></li></ul>'
      const panel = fixtureEl.querySelector('#panel')

      expect(fire(isFromPanelWidget, fixtureEl.querySelector('#text'), panel)).toBeFalse()
      expect(fire(isFromPanelControl, fixtureEl.querySelector('#text'), panel)).toBeFalse()
    })
  })

  describe('isFromPanelControl', () => {
    it('should recognize the widgets, options, labels, forms and checkable roles in the panel', () => {
      fixtureEl.innerHTML = [
        '<div id="panel">',
        '  <input id="input"><select><option id="option">A</option></select>',
        '  <label><span id="caption">Bold</span></label>',
        '  <form><button id="submit">Save</button></form>',
        ...['checkbox', 'radio', 'switch', 'slider'].map(role => `<div role="${role}"><span id="role-${role}">x</span></div>`),
        '</div>'
      ].join('')
      const panel = fixtureEl.querySelector('#panel')

      for (const id of ['input', 'option', 'caption', 'submit', 'role-checkbox', 'role-radio', 'role-switch', 'role-slider']) {
        expect(fire(isFromPanelControl, fixtureEl.querySelector(`#${id}`), panel)).toBeTrue()
      }
    })

    it('should leave a pick in a grid, list box, tree or tab list to close the menu', () => {
      const composites = ['grid', 'listbox', 'radiogroup', 'tablist', 'toolbar', 'tree', 'treegrid']
      fixtureEl.innerHTML = `<div id="panel">${composites.map(role => `<div role="${role}"><span id="${role}">x</span></div>`).join('')}</div>`
      const panel = fixtureEl.querySelector('#panel')

      for (const role of composites) {
        expect(fire(isFromPanelControl, fixtureEl.querySelector(`#${role}`), panel)).toBeFalse()
        expect(fire(isFromPanelWidget, fixtureEl.querySelector(`#${role}`), panel)).toBeTrue()
      }
    })

    it('should count a panel that is itself a form but not the elements around the panel', () => {
      fixtureEl.innerHTML = [
        '<form><div id="panel" role="menu"><button id="item" class="item" role="menuitem">Item</button></div></form>',
        '<form id="form-panel"><span id="text">Text</span><button id="form-panel-item" class="item">Item</button></form>'
      ].join('')

      expect(fire(isFromPanelControl, fixtureEl.querySelector('#item'), fixtureEl.querySelector('#panel'))).toBeFalse()
      expect(fire(isFromPanelControl, fixtureEl.querySelector('#text'), fixtureEl.querySelector('#form-panel'))).toBeTrue()
      expect(fire(isFromPanelControl, fixtureEl.querySelector('#form-panel-item'), fixtureEl.querySelector('#form-panel'))).toBeFalse()
    })
  })
})
