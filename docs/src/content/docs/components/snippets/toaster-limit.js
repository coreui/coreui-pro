const toaster = new coreui.Toaster('#toasterLimit', { limit: 2, timeout: 0 })
let count = 0

document.getElementById('toasterLimitBtn').addEventListener('click', () => {
  count += 1
  toaster.add({ title: `Toast ${count}`, description: 'Only two stay visible.' })
})

document.getElementById('toasterLimitCloseBtn').addEventListener('click', () => toaster.close())
