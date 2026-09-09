const stacks = new Map()

for (const button of document.querySelectorAll('#toasterPlacementStack [data-coreui-placement]')) {
  button.addEventListener('click', () => {
    const placement = button.dataset.coreuiPlacement

    if (!stacks.has(placement)) {
      stacks.set(placement, new coreui.Toaster(null, { placement, stack: true, limit: 0 }))
    }

    const toaster = stacks.get(placement)
    toaster.add({ title: `${placement} · ${toaster.getToasts().length + 1}`, description: 'Hover the stack to spread it.' })
  })
}
