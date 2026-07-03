import User from '../models/User.js'

const JSONPLACEHOLDER_URL = 'https://jsonplaceholder.typicode.com/users'

async function fetchJSONPlaceholderUsers() {
  const response = await fetch(JSONPLACEHOLDER_URL)
  if (!response.ok) {
    throw new Error('Unable to fetch remote users.')
  }
  const data = await response.json()
  return data.slice(0, 10)
}

async function fetchJSONPlaceholderUser(id) {
  const response = await fetch(`${JSONPLACEHOLDER_URL}/${id}`)
  if (!response.ok) {
    throw new Error('Unable to fetch remote user.')
  }
  return response.json()
}

export async function getAllUsers(req, res) {
  try {
    const remoteUsers = await fetchJSONPlaceholderUsers()
    const localUsers = await User.find({ id: { $gte: 11 } }).sort({ id: 1 })
    res.json([...remoteUsers, ...localUsers])
  } catch (err) {
    res.status(500).json({ error: 'Unable to fetch users.' })
  }
}

export async function getUserById(req, res) {
  const userId = Number(req.params.id)
  try {
    if (userId <= 10) {
      const user = await fetchJSONPlaceholderUser(userId)
      return res.json(user)
    }

    const user = await User.findOne({ id: userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Unable to fetch user.' })
  }
}

export async function createUser(req, res) {
  try {
    const last = await User.findOne({ id: { $gte: 11 } }).sort({ id: -1 })
    const nextId = last ? last.id + 1 : 11
    const user = new User({ id: nextId, ...req.body })
    await user.save()
    res.status(201).json(user)
  } catch (err) {
    console.error('Create user error:', err)
    res.status(500).json({ error: err.message || 'Unable to create user.' })
  }
}

export async function updateUser(req, res) {
  const userId = Number(req.params.id)
  try {
    if (userId <= 10) {
      const response = await fetch(`${JSONPLACEHOLDER_URL}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Unable to update remote user.')
      }

      const updatedUser = await response.json()
      return res.json(updatedUser)
    }

    const user = await User.findOneAndUpdate(
      { id: userId },
      { ...req.body, id: userId },
      { new: true, runValidators: true }
    )
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    res.json(user)
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ error: err.message || 'Unable to update user.' })
  }
}

export async function deleteUser(req, res) {
  const userId = Number(req.params.id)
  try {
    if (userId <= 10) {
      const response = await fetch(`${JSONPLACEHOLDER_URL}/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Unable to delete remote user.')
      }

      return res.json({ success: true })
    }

    const user = await User.findOneAndDelete({ id: userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Unable to delete user.' })
  }
}
