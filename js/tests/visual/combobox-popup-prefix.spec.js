/*!
 * A build with its own `$prefix` still sizes the combobox panel by its field.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import './fixtures/prefix.scss'
import MultiSelect from '../../src/multi-select.js'

describe('Combobox panel width with a custom $prefix', () => {
  it('should be as wide as its field', async () => {
    const container = document.createElement('div')
    container.innerHTML = '<div style="position: relative; width: 1000px"><div style="width: 300px"><select id="host"><option value="1">One</option></select></div></div>'
    document.body.append(container)
    const instance = new MultiSelect(container.querySelector('#host'), { container: container.firstElementChild })

    instance.show()
    await instance._anchoredPosition.ready

    expect(instance._menu.getBoundingClientRect().width).toBeCloseTo(instance._wrapperElement.getBoundingClientRect().width, 1)
    instance.dispose()
    container.remove()
  })
})
