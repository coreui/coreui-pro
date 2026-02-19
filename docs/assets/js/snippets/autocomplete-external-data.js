/* global coreui: false */

// js-docs-start autocomplete-external-data
const myAutoCompleteExternalData = document.getElementById('myAutoCompleteExternalData')

const getUsers = async (name = '') => {
  try {
    const response = await fetch(`https://apitest.coreui.io/demos/users?first_name=${name}&limit=10`)
    const users = await response.json()

    return users.records.map(user => ({
      value: user.id,
      label: user.first_name
    }))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching users:', error)
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

myAutoCompleteExternalData.addEventListener('show.coreui.autocomplete', async () => {
  const users = await getUsers()
  autocomplete.update({ options: users })
})

myAutoCompleteExternalData.addEventListener('input.coreui.autocomplete', event => {
  const query = event.value

  if (query === lastQuery) {
    return
  }

  lastQuery = query

  clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    const users = await getUsers(query)
    autocomplete.update({ options: users })
  }, 200)
})
// js-docs-end autocomplete-external-data
