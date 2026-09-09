const toaster = new coreui.Toaster('#toasterStack', { stack: true, limit: 0, timeout: 0 })
let count = 0

document.getElementById('toasterStackBtn').addEventListener('click', () => {
  count += 1
  toaster.add({ title: `Toast ${count}`, description: count % 2 ? 'Hover or focus the stack to spread it out.' : 'A shorter one.' })
})

document.getElementById('toasterStackCloseBtn').addEventListener('click', () => toaster.close())
