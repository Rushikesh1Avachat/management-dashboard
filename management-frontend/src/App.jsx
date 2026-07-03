import { useEffect, useMemo, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'

const PAGE_SIZES = [10, 25, 50, 100]
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api'

const normalizeUser = (user) => {
  const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : '')
  const lastName = user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : '')

  return {
    id: Number(user.id) || 0,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: user.email || '',
    department: user.department || user.company?.name || user.company?.bs || 'Unknown',
    username: user.username || '',
    phone: user.phone || '',
    website: user.website || ''
  }
}

const getNextUserId = (currentUsers) => {
  const currentIds = currentUsers.map((user) => Number(user.id) || 0)
  const maxId = Math.max(0, ...currentIds)
  return maxId >= 10 ? maxId + 1 : 11
}

const initialFilters = {
  firstName: '',
  lastName: '',
  email: '',
  department: ''
}

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortField, setSortField] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeUser, setActiveUser] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/users`)
      if (!response.ok) {
        throw new Error('Unable to load users.')
      }
      const data = await response.json()
      setUsers(data.map(normalizeUser))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    let items = [...users]

    if (search.trim()) {
      const term = search.toLowerCase()
      items = items.filter((user) =>
        [user.firstName, user.lastName, user.email, user.department]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term))
      )
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (!value.trim()) return
      items = items.filter((user) =>
        (user[key] ?? '').toLowerCase().includes(value.toLowerCase())
      )
    })

    items.sort((a, b) => {
      const aValue = a[sortField] ?? ''
      const bValue = b[sortField] ?? ''

      if (sortField === 'id') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: 'base' })
        : String(bValue).localeCompare(String(aValue), undefined, { numeric: true, sensitivity: 'base' })
    })

    return items
  }, [users, search, filters, sortField, sortOrder])

  const pagedUsers = useMemo(() => {
    const index = (currentPage - 1) * pageSize
    return filteredUsers.slice(index, index + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize))

  const openForm = (mode, user = null) => {
    setActiveUser(
      mode === 'add'
        ? { firstName: '', lastName: '', email: '', department: 'React Developer', username: '', phone: '', website: '' }
        : user
    )
    setFieldErrors({})
    setModalOpen(true)
  }

  const closeForm = () => {
    setModalOpen(false)
    setActiveUser(null)
    setFieldErrors({})
  }

  const validate = (user) => {
    const errors = {}
    if (!user.firstName.trim()) errors.firstName = 'First name is required.'
    if (!user.lastName.trim()) errors.lastName = 'Last name is required.'
    if (!user.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = 'Enter a valid email.'
    }
    if (!user.department.trim()) errors.department = 'Department is required.'
    return errors
  }

  const saveUser = async (user) => {
    const errors = validate(user)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return false
    }

    const payload = {
      firstName: user.firstName.trim(),
      lastName: user.lastName.trim(),
      email: user.email.trim(),
      department: user.department.trim(),
      username: user.username?.trim() || '',
      phone: user.phone?.trim() || '',
      website: user.website?.trim() || ''
    }

    try {
      const isNew = !user.id
      const response = await fetch(`${API_BASE}/users${isNew ? '' : `/${user.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Unable to save user.')
      }

      const saved = await response.json()
      const savedId = Number(saved.id)
      const assignedId = savedId && !users.some((item) => item.id === savedId) ? savedId : getNextUserId(users)
      const normalized = normalizeUser({ ...saved, id: assignedId })

      if (isNew) {
        setUsers((current) => [normalized, ...current])
        showToast('User added successfully.', 'success')
      } else {
        setUsers((current) => current.map((item) => (item.id === normalized.id ? normalized : item)))
        showToast('User updated successfully.', 'success')
      }

      return true
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'danger')
      return false
    }
  }

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}?`)) {
      return
    }
    try {
      const response = await fetch(`${API_BASE}/users/${user.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Unable to delete user.')
      }
      setUsers((current) => current.filter((item) => item.id !== user.id))
      showToast('User deleted successfully.', 'success')
      const nextPage = Math.min(currentPage, Math.max(1, Math.ceil((filteredUsers.length - 1) / pageSize)))
      setCurrentPage(nextPage)
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'danger')
    }
  }

  const showToast = (message, type = 'info') => {
    if (type === 'success') {
      toast.success(message)
    } else if (type === 'danger' || type === 'error') {
      toast.error(message)
    } else {
      toast(message)
    }
  }

  const updateSort = (field) => {
    if (sortField === field) {
      setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const openEdit = async (user) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/users/${user.id}`)
      if (!response.ok) {
        throw new Error('Unable to load user.')
      }

      const data = await response.json()
      setActiveUser(normalizeUser(data))
      setFieldErrors({})
      setModalOpen(true)
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const nextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, pageCount))
  }

  const prevPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1))
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Management Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">User Management</h1>
              <p className="mt-2 max-w-2xl text-slate-600">View, edit, add, and delete users using the local backend and MongoDB Atlas for persistent storage.</p>
            </div>
            <button onClick={() => openForm('add')} className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
              Add User
            </button>
          </div>
        </header>

        <Toaster position="top-right" />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Search</label>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Search by name, email or department"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => setFilterOpen((open) => !open)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    {filterOpen ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  <label className="flex items-center gap-3 text-sm text-slate-600">
                    Rows:
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value))
                        setCurrentPage(1)
                      }}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    >
                      {PAGE_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              {filterOpen && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {Object.entries(filters).map(([key, value]) => (
                    <label key={key} className="block text-sm text-slate-700">
                      <span className="mb-2 block font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(event) => {
                          setFilters((current) => ({ ...current, [key]: event.target.value }))
                          setCurrentPage(1)
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        placeholder={`Filter by ${key}`}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/40">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-900">
                      {['id', 'firstName', 'lastName', 'email', 'department'].map((header) => (
                        <th key={header} className="px-4 py-3 font-medium uppercase tracking-[0.15em]" />
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200 text-slate-900">
                      <th className="px-4 py-3 cursor-pointer" onClick={() => updateSort('id')}>
                        ID{sortField === 'id' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                      <th className="px-4 py-3 cursor-pointer" onClick={() => updateSort('firstName')}>
                        First Name{sortField === 'firstName' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                      <th className="px-4 py-3 cursor-pointer" onClick={() => updateSort('lastName')}>
                        Last Name{sortField === 'lastName' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                      <th className="px-4 py-3 cursor-pointer" onClick={() => updateSort('email')}>
                        Email{sortField === 'email' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                      <th className="px-4 py-3 cursor-pointer" onClick={() => updateSort('department')}>
                        Department{sortField === 'department' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                          Loading users...
                        </td>
                      </tr>
                    ) : pagedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      pagedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-4 font-medium text-slate-900">{user.id}</td>
                          <td className="px-4 py-4">{user.firstName}</td>
                          <td className="px-4 py-4">{user.lastName}</td>
                          <td className="px-4 py-4">{user.email}</td>
                          <td className="px-4 py-4">{user.department}</td>
                          <td className="px-4 py-4 space-x-2">
                            <button onClick={() => openEdit(user)} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">Edit</button>
                            <button onClick={() => deleteUser(user)} className="rounded-2xl bg-rose-100 px-3 py-2 text-sm text-rose-700 hover:bg-rose-200">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {pagedUsers.length} of {filteredUsers.length} users.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={prevPage} disabled={currentPage <= 1} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                    Prev
                  </button>
                  <span className="text-sm text-slate-600">Page {currentPage} of {pageCount}</span>
                  <button onClick={nextPage} disabled={currentPage >= pageCount} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/40">
              <h2 className="text-lg font-semibold text-slate-900">Instructions</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use the search, filters, sort headers and pagination to explore users. Add or edit users using the modal form.
              </p>
            </div>
            {error && (
              <div className="rounded-3xl bg-rose-50 p-5 text-sm text-rose-700 shadow-xl shadow-rose-200/40">
                <strong className="block font-semibold">Error</strong>
                <p className="mt-2">{error}</p>
              </div>
            )}
          </aside>
        </section>

        {modalOpen && (
          <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/40 px-4 py-6">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">{activeUser?.id ? 'Edit user' : 'Add user'}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activeUser?.id ? 'Update user details' : 'Create new user'}</h2>
                </div>
                <button onClick={closeForm} className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200">Close</button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {['firstName', 'lastName', 'email', 'department', 'username', 'phone', 'website'].map((field) => (
                  <label key={field} className="block text-sm text-slate-700">
                    <span className="mb-2 block font-medium capitalize">{field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field}</span>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={activeUser?.[field] ?? ''}
                      onChange={(event) => setActiveUser((current) => ({ ...current, [field]: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                    {fieldErrors[field] && <p className="mt-2 text-xs text-rose-600">{fieldErrors[field]}</p>}
                  </label>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button onClick={closeForm} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const success = await saveUser(activeUser)
                    if (success) closeForm()
                  }}
                  className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Save user
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
