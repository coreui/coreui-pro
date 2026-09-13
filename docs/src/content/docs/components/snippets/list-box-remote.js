const element = document.getElementById('listBoxRemote')
const listBox = coreui.ListBox.getOrCreateInstance(element, { loading: true })

const loadUsers = async () => {
  listBox.setLoading(true)

  try {
    const response = await fetch('https://apitest.coreui.io/demos/users?limit=10')
    const { records } = await response.json()

    listBox.setItems(records.map(user => ({
      value: user.id,
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

loadUsers()

document.getElementById('listBoxReload').addEventListener('click', loadUsers)
