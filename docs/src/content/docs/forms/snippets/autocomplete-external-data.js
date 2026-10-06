const myAutoCompleteExternalData = document.getElementById('myAutoCompleteExternalData')

const getUsers = async (name = '') => {
  try {
    const response = await fetch(`https://apitest.coreui.io/demos/users?first_name=${encodeURIComponent(name)}&limit=10`)
    const users = await response.json()

    return users.records.map(user => ({
      value: user.id,
      label: user.first_name
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

const autocomplete = new coreui.Autocomplete(myAutoCompleteExternalData, {
  cleaner: true,
  highlightOptionsOnSearch: true,
  name: 'autocomplete-external',
  options: [],
  placeholder: 'Search names...',
  search: ['external', 'global'], // 🔴 'external' is required for external search
  showHints: true
})

let lastQuery = null
let debounceTimer = null

const loadUsers = async query => {
  const users = await getUsers(query)

  // Skip responses that arrive after a newer query
  if (query === lastQuery) {
    autocomplete.update({ options: users })
  }
}

myAutoCompleteExternalData.addEventListener('show.coreui.autocomplete', () => {
  lastQuery = ''
  loadUsers('')
})

myAutoCompleteExternalData.addEventListener('input.coreui.autocomplete', event => {
  const query = event.value

  if (query === lastQuery) {
    return
  }

  lastQuery = query

  clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    loadUsers(query)
  }, 200)
})
