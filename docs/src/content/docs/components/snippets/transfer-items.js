const element = document.getElementById('transferItems')

coreui.Transfer.getOrCreateInstance(element, {
  items: [
    {
      label: 'Engineering',
      items: [
        { value: 'ada', label: 'Ada Lovelace', description: 'Analyst' },
        { value: 'grace', label: 'Grace Hopper', description: 'Compilers' },
        {
          value: 'alan', label: 'Alan Turing', description: 'Cryptanalysis', disabled: true
        }
      ]
    },
    {
      label: 'Design',
      items: [
        { value: 'ray', label: 'Ray Eames' },
        { value: 'dieter', label: 'Dieter Rams' }
      ]
    }
  ],
  sourceTitle: 'Team',
  targetTitle: 'On call',
  value: ['grace']
})
