const element = document.getElementById('listBoxItems')

coreui.ListBox.getOrCreateInstance(element, {
  items: [
    {
      label: 'Veggies',
      items: [
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'tomato', label: 'Tomato', description: 'Ripe' },
        { value: 'onion', label: 'Onion', disabled: true }
      ]
    },
    {
      label: 'Protein',
      items: [
        { value: 'ham', label: 'Ham', selected: true },
        { value: 'tuna', label: 'Tuna', description: 'Line caught' }
      ]
    }
  ]
})
