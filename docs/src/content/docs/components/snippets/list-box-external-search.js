const element = document.getElementById('listBoxExternalSearch')
const listBox = coreui.ListBox.getOrCreateInstance(element, {
  loading: true,
  search: 'external',
  searchPlaceholder: 'Search users'
})

const loadUsers = async (query = '') => {
  listBox.setLoading(true)

  try {
    const response = await fetch(`https://apitest.coreui.io/demos/users?first_name=${query}&limit=10`)
    const { records } = await response.json()

    listBox.setItems(records.map(user => ({
      value: String(user.id),
      label: `${user.first_name} ${user.last_name}`,
      description: user.email
    })))
  } catch (error) {
    console.error('Error fetching users:', error)
    listBox.setItems([])
  } finally {
    listBox.setLoading(false)
  }
}

let debounceTimer = null

element.addEventListener('search.coreui.list-box', event => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadUsers(event.query), 200)
})

loadUsers()
