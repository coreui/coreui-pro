const element = document.getElementById('multiSelectExternalSearch')
const multiSelect = new coreui.MultiSelect(element, {
  placeholder: 'Search users',
  search: 'external'
})

let latest = 0

const loadUsers = async (query = '') => {
  latest += 1
  const request = latest
  multiSelect.setLoading(true)

  try {
    const response = await fetch(`https://apitest.coreui.io/demos/users?first_name=${encodeURIComponent(query)}&limit=10`)
    const { records } = await response.json()

    if (request === latest) {
      multiSelect.setOptions(records.map(user => ({
        value: String(user.id),
        text: `${user.first_name} ${user.last_name}`
      })))
    }
  } catch (error) {
    console.error('Error fetching users:', error)

    if (request === latest) {
      multiSelect.setOptions([])
    }
  } finally {
    if (request === latest) {
      multiSelect.setLoading(false)
    }
  }
}

let debounceTimer = null

element.addEventListener('search.coreui.multi-select', event => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadUsers(event.query), 200)
})

loadUsers()
