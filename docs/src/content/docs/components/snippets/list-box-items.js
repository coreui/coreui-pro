const element = document.getElementById('listBoxItems')

coreui.ListBox.getOrCreateInstance(element, {
  options: [
    {
      label: 'Veggies',
      options: [
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'tomato', label: 'Tomato', description: 'Ripe' },
        { value: 'onion', label: 'Onion', disabled: true }
      ]
    },
    {
      label: 'Protein',
      options: [
        { value: 'ham', label: 'Ham', selected: true },
        { value: 'tuna', label: 'Tuna', description: 'Line caught' }
      ]
    }
  ]
})
