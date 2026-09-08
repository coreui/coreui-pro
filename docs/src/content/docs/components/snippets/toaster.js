const toaster = new coreui.Toaster(null, { placement: 'top-end', limit: 3 })

document.getElementById('toasterAddBtn').addEventListener('click', () => {
  toaster.add({
    title: 'CoreUI for Bootstrap',
    description: 'Hello, world! This is a toast message.',
    theme: 'success'
  })
})

document.getElementById('toasterUpdateBtn').addEventListener('click', () => {
  const id = toaster.add({
    id: 'upload', title: 'Uploading…', description: '0 %', timeout: 0
  })
  let progress = 0

  const interval = setInterval(() => {
    progress += 25
    toaster.update(id, { description: `${progress} %` })

    if (progress === 100) {
      clearInterval(interval)
      toaster.update(id, { title: 'Uploaded', theme: 'success', timeout: 5000 })
    }
  }, 500)
})

document.getElementById('toasterPromiseBtn').addEventListener('click', () => {
  const request = new Promise((resolve, reject) => {
    setTimeout(() => (Math.random() > 0.3 ? resolve('3 files') : reject(new Error('Network error'))), 2000)
  })

  toaster.promise(request, {
    loading: 'Saving…',
    success: files => `Saved ${files}`,
    error: error => ({ title: 'Not saved', description: error.message, priority: 'high' })
  }).catch(() => {})
})

document.getElementById('toasterUndoBtn').addEventListener('click', () => {
  toaster.add({
    description: 'Message archived',
    timeout: 10000,
    action: { label: 'Undo', onClick: (event, toast) => toaster.update(toast.id, { description: 'Restored', action: null, timeout: 2000 }) }
  })
})

document.getElementById('toasterCloseBtn').addEventListener('click', () => toaster.close())
