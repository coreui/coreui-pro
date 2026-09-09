const toasters = new Map()

for (const button of document.querySelectorAll('#toasterPlacement [data-coreui-placement]')) {
  button.addEventListener('click', () => {
    const placement = button.dataset.coreuiPlacement

    if (!toasters.has(placement)) {
      toasters.set(placement, new coreui.Toaster(null, { placement }))
    }

    toasters.get(placement).add({ title: placement, description: 'Slides in from the nearest edge.' })
  })
}
