const toaster = new coreui.Toaster('#toasterInstant', { timeout: 3000 })

document.getElementById('toasterInstantBtn').addEventListener('click', () => {
  toaster.add({ title: 'Instant', description: 'No slide, no fade, no glide.', instant: true })
})

document.getElementById('toasterAnimatedBtn').addEventListener('click', () => {
  toaster.add({ title: 'Animated', description: 'Slides in and glides the others.' })
})
