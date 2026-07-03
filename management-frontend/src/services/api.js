const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api'
const USERS_URL = `${API_BASE}/users`

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'API request failed.')
  }
  return response.json()
}

export async function getUsers() {
  const response = await fetch(USERS_URL)
  return handleResponse(response)
}

export async function addUser(user) {
  const response = await fetch(USERS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  })
  return handleResponse(response)
}

export async function updateUser(user) {
  const response = await fetch(`${USERS_URL}/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  })
  return handleResponse(response)
}

export async function deleteUser(id) {
  const response = await fetch(`${USERS_URL}/${id}`, {
    method: 'DELETE'
  })
  return handleResponse(response)
}
