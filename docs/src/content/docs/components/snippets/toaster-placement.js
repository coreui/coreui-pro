const toasters = new Map()

for (const button of document.querySelectorAll('#toasterPlacement [data-placement]')) {
  button.addEventListener('click', () => {
    const { placement } = button.dataset

    if (!toasters.has(placement)) {
      toasters.set(placement, new coreui.Toaster(null, { placement }))
    }

    toasters.get(placement).add({ title: placement, description: 'Slides in from the nearest edge.' })
  })
}
