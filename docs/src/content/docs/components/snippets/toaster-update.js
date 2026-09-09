const toaster = new coreui.Toaster('#toasterUpdate', { timeout: 0 })
let saves = 0

document.getElementById('toasterDraftBtn').addEventListener('click', () => {
  saves += 1
  toaster.add({ id: 'draft', title: 'Draft saved', description: `Saved ${saves} time${saves === 1 ? '' : 's'}` })
})

document.getElementById('toasterUploadBtn').addEventListener('click', () => {
  const id = toaster.add({ title: 'Uploading…', description: '0 %' })
  let progress = 0

  const interval = setInterval(() => {
    progress += 25
    toaster.update(id, { description: `${progress} %` })

    if (progress === 100) {
      clearInterval(interval)
      toaster.update(id, { title: 'Uploaded', theme: 'success' })
    }
  }, 500)
})
