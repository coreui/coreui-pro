/*!
 * The header and footer of a dialog are rounded with the dialog's inner radius,
 * so a header or footer background stays inside the rounded corners.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let dialog

afterEach(() => {
  dialog?.remove()
})

const mount = style => {
  dialog = document.createElement('dialog')
  dialog.className = 'dialog'
  dialog.style.cssText = style
  dialog.innerHTML = '<div class="dialog-header bg-2"><h2 class="dialog-title">Title</h2></div><div class="dialog-body">Body</div><div class="dialog-footer bg-2">Footer</div>'
  document.body.append(dialog)
  dialog.show()
  return {
    header: getComputedStyle(dialog.querySelector('.dialog-header')),
    footer: getComputedStyle(dialog.querySelector('.dialog-footer'))
  }
}

describe('dialog inner radius', () => {
  it('should round the header top and the footer bottom with the radius minus the border width', () => {
    const { header, footer } = mount('--cui-dialog-border-radius: 24px; --cui-dialog-border-width: 1px')

    expect(header.borderTopLeftRadius).toBe('23px')
    expect(header.borderTopRightRadius).toBe('23px')
    expect(header.borderBottomLeftRadius).toBe('0px')
    expect(footer.borderBottomLeftRadius).toBe('23px')
    expect(footer.borderBottomRightRadius).toBe('23px')
    expect(footer.borderTopLeftRadius).toBe('0px')
  })

  it('should follow a page override of the inner radius token', () => {
    const { header } = mount('--cui-dialog-inner-border-radius: 4px')

    expect(header.borderTopLeftRadius).toBe('4px')
  })
})
