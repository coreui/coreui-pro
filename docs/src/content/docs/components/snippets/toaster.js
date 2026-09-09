const toaster = new coreui.Toaster(null, { placement: 'top-end' })
const stacked = new coreui.Toaster(null, { placement: 'top-start', stack: true })

document.getElementById('toasterLiveBtn').addEventListener('click', () => {
  toaster.add({ title: 'CoreUI for Bootstrap', description: 'Hello, world! This is a toast message.' })
})

document.getElementById('toasterLiveStackBtn').addEventListener('click', () => {
  stacked.add({ title: 'CoreUI for Bootstrap', description: 'Hello, world! This one joins a stack.' })
})
