import Dropdown from '../../src/dropdown.js'

// Guards what getting-started/javascript documents: a component constructed
// inside a shadow root works, the delegated data-attribute path does not reach
// there, and the same markup in the document does.
describe('shadow root', () => {
  it('a dropdown constructed inside a shadow root opens', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = host.attachShadow({ mode: 'open' })
    root.innerHTML = '<div class="dropdown"><button class="btn dropdown-toggle" type="button">Toggle</button><div class="dropdown-menu"><a class="dropdown-item" href="#">Item</a></div></div>'

    const toggle = root.querySelector('.dropdown-toggle')
    const dropdown = new Dropdown(toggle)
    dropdown.show()

    expect(toggle.classList.contains('show')).toBeTrue()
    dropdown.dispose()
    host.remove()
  })

  it('the data attribute path does NOT reach inside a shadow root', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = host.attachShadow({ mode: 'open' })
    root.innerHTML = '<div class="dropdown"><button class="btn dropdown-toggle" type="button" data-coreui-toggle="dropdown">Toggle</button><div class="dropdown-menu"><a class="dropdown-item" href="#">Item</a></div></div>'

    const toggle = root.querySelector('.dropdown-toggle')
    toggle.click()

    expect(toggle.classList.contains('show')).toBeFalse()
    expect(Dropdown.getInstance(toggle)).toBeNull()
    host.remove()
  })

  it('the same markup in the document DOES react to the data attribute', () => {
    const wrap = document.createElement('div')
    wrap.innerHTML = '<div class="dropdown"><button class="btn dropdown-toggle" type="button" data-coreui-toggle="dropdown">Toggle</button><div class="dropdown-menu"><a class="dropdown-item" href="#">Item</a></div></div>'
    document.body.append(wrap)

    const toggle = wrap.querySelector('.dropdown-toggle')
    toggle.click()

    expect(toggle.classList.contains('show')).toBeTrue()
    Dropdown.getInstance(toggle).dispose()
    wrap.remove()
  })
})
