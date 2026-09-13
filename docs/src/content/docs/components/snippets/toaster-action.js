const toaster = new coreui.Toaster('#toasterAction', { timeout: 0 })

document.getElementById('toasterArchiveBtn').addEventListener('click', () => {
  toaster.add({
    description: 'Message archived',
    action: {
      label: 'Undo',
      onClick: (event, toast) => toaster.update(toast.id, { description: 'Message restored', action: null })
    }
  })
})
