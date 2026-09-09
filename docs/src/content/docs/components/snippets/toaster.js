const toaster = new coreui.Toaster(null, { placement: 'top-end' })

document.getElementById('toasterLiveBtn').addEventListener('click', () => {
  toaster.add({ title: 'CoreUI for Bootstrap', description: 'Hello, world! This is a toast message.' })
})
