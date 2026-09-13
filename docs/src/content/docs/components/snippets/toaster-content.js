const toaster = new coreui.Toaster('#toasterContent', { timeout: 0 })

document.getElementById('toasterTitleBtn').addEventListener('click', () => {
  toaster.add({ title: 'Saved', description: 'Your changes are live.' })
})

document.getElementById('toasterDescriptionBtn').addEventListener('click', () => {
  toaster.add({ description: 'Copied to the clipboard' })
})

document.getElementById('toasterThemeBtn').addEventListener('click', () => {
  toaster.add({
    title: 'Payment failed', description: 'The card was declined.', theme: 'danger', priority: 'high'
  })
})

document.getElementById('toasterStickyBtn').addEventListener('click', () => {
  toaster.add({
    title: 'Read me', description: 'This one stays until you close it.', dismissible: false, timeout: 0
  })
})
