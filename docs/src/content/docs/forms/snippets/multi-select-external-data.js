const myMultiSelectExternalData = document.getElementById('myMultiSelectExternalData')

const getUsers = async (name = '') => {
  try {
    const response = await fetch(`https://apitest.coreui.io/demos/users?first_name=${name}&limit=10`)
    const users = await response.json()

    return users.records.map(user => ({
      value: user.id,
      text: user.first_name
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const multiSelect = new coreui.MultiSelect(myMultiSelectExternalData, {
  name: 'multi-select-external',
  options: [],
  placeholder: 'Search names...',
  search: ['external', 'global'] // 🔴 'external' is required for external search
})

let lastQuery = null
let debounceTimer = null

myMultiSelectExternalData.addEventListener('show.coreui.multi-select', async () => {
  const users = await getUsers()
  multiSelect.update({ options: users })
})

myMultiSelectExternalData.addEventListener('search.coreui.multi-select', event => {
  const query = event.value

  if (query === lastQuery) {
    return
  }

  lastQuery = query

  clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    const users = await getUsers(query)
    multiSelect.update({ options: users })
  }, 200)
})
