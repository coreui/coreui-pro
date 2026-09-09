const element = document.getElementById('transferExternalSearch')
const transfer = coreui.Transfer.getOrCreateInstance(element, {
  loading: true,
  search: 'external',
  sourceTitle: 'Users',
  targetTitle: 'Invited'
})

const invited = new Map()

const loadUsers = async (query = '') => {
  transfer.setLoading(true, 'source')

  try {
    const response = await fetch(`https://apitest.coreui.io/demos/users?first_name=${query}&limit=10`)
    const { records } = await response.json()
    const users = records.map(user => ({
      value: String(user.id),
      label: `${user.first_name} ${user.last_name}`,
      description: user.email
    }))
    const found = new Set(users.map(user => user.value))

    transfer.setItems([...users, ...[...invited.values()].filter(user => !found.has(user.value))])
  } catch (error) {
    console.error('Error fetching users:', error)
    transfer.setItems([...invited.values()])
  } finally {
    transfer.setLoading(false, 'source')
  }
}

element.addEventListener('change.coreui.transfer', event => {
  const users = new Map(transfer.getItems().map(user => [user.value, user]))

  invited.clear()

  for (const value of event.targetValues) {
    invited.set(value, users.get(value))
  }
})

let debounceTimer = null

element.addEventListener('search.coreui.transfer', event => {
  if (event.side !== 'source') {
    return
  }

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadUsers(event.query), 200)
})

loadUsers()
