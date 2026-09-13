const toaster = new coreui.Toaster('#toasterPromise', { timeout: 0 })

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
