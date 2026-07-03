import { useEffect, useMemo, useState } from 'react'
import { getUsers, addUser, updateUser, deleteUser } from '../services/api.js'
import SearchBar from '../components/SearchBar.jsx'
import FilterPopup from '../components/FilterPopup.jsx'
import Pagination from '../components/Pagination.jsx'
import UserTable from '../components/UserTable.jsx'
import UserForm from '../components/UserForm.jsx'
import { toast } from 'react-hot-toast'

const PAGE_SIZES = [10, 25, 50, 100]
const initialFilters = { firstName: '', lastName: '', email: '', department: '' }
const initialUser = { firstName: '', lastName: '', email: '', department: '', username: '', phone: '', website: '' }

const normalizeUser = (user) => {
  const [firstName = '', ...rest] = (user.name || '').split(' ')
  return {
    id: Number(user.id) || 0,
    firstName: firstName.trim(),
    lastName: rest.join(' ').trim(),
    email: user.email || '',
    department: user.company?.name || user.company?.bs || 'Unknown',
    username: user.username || '',
    phone: user.phone || '',
    website: user.website || ''
  }
}

const getNextUserId = (userList) => {
  const ids = userList.map((user) => Number(user.id) || 0)
  return Math.max(0, ...ids) + 1
}

export default function UsersPage() {
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
  const [activeUser, setActiveUser] = useState(initialUser)
  const [fieldErrors, setFieldErrors] = useState({})

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getUsers()
      setUsers(data.map(normalizeUser))
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    let results = [...users]

    if (search.trim()) {
      const term = search.toLowerCase()
      results = results.filter((user) =>
        [user.firstName, user.lastName, user.email, user.department]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term))
      )
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (!value.trim()) return
      results = results.filter((user) => (user[key] ?? '').toLowerCase().includes(value.toLowerCase()))
    })

    results.sort((a, b) => {
      const aValue = a[sortField] ?? ''
      const bValue = b[sortField] ?? ''

      if (sortField === 'id') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: 'base' })
        : String(bValue).localeCompare(String(aValue), undefined, { numeric: true, sensitivity: 'base' })
    })

    return results
  }, [users, search, filters, sortField, sortOrder])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const pagedUsers = useMemo(() => {
    const index = (currentPage - 1) * pageSize
    return filteredUsers.slice(index, index + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const openAddForm = () => {
    setActiveUser(initialUser)
    setFieldErrors({})
    setModalOpen(true)
  }

  const openEditForm = (user) => {
    setActiveUser(user)
    setFieldErrors({})
    setModalOpen(true)
  }

  const closeForm = () => {
    setModalOpen(false)
    setActiveUser(initialUser)
    setFieldErrors({})
  }

  const validateUser = (user) => {
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
    const errors = validateUser(user)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    try {
      const payload = {
        ...user,
        name: `${user.firstName} ${user.lastName}`.trim(),
        company: { name: user.department }
      }

      const isNew = !user.id
      const saved = isNew ? await addUser(payload) : await updateUser(payload)
      const assignedId = saved.id && !users.some((item) => item.id === Number(saved.id)) ? Number(saved.id) : getNextUserId(users)
      const normalized = normalizeUser({ ...saved, id: assignedId, name: payload.name, company: payload.company })

      if (isNew) {
        setUsers((current) => [normalized, ...current])
        toast.success('User added successfully.')
      } else {
        setUsers((current) => current.map((item) => (item.id === normalized.id ? normalized : item)))
        toast.success('User updated successfully.')
      }
      closeForm()
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    }
  }

  const removeUser = async (user) => {
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}?`)) {
      return
    }

    try {
      await deleteUser(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
      toast.success('User deleted successfully.')
      setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil((filteredUsers.length - 1) / pageSize))))
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Management Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">User Management</h1>
              <p className="mt-2 max-w-2xl text-slate-600">A simple React dashboard using JSONPlaceholder for CRUD operations.</p>
            </div>
            <button onClick={openAddForm} className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
              Add User
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <SearchBar value={search} onChange={(value) => { setSearch(value); setCurrentPage(1) }} />
              <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/40 flex flex-col justify-between gap-4">
                <button onClick={() => setFilterOpen((open) => !open)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  {filterOpen ? 'Hide Filters' : 'Show Filters'}
                </button>
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  Rows:
                  <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1) }} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {filterOpen && <FilterPopup filters={filters} onFilterChange={(key, value) => { setFilters((current) => ({ ...current, [key]: value })); setCurrentPage(1) }} />}

            <UserTable users={pagedUsers} loading={loading} onEdit={openEditForm} onDelete={removeUser} sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />

            <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/40">
              <p className="text-sm text-slate-500">Showing {pagedUsers.length} of {filteredUsers.length} users.</p>
            </div>

            <Pagination currentPage={currentPage} pageCount={pageCount} pageSize={pageSize} pageSizes={PAGE_SIZES} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }} onPrev={() => setCurrentPage((page) => Math.max(page - 1, 1))} onNext={() => setCurrentPage((page) => Math.min(page + 1, pageCount))} />
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/40">
              <h2 className="text-lg font-semibold text-slate-900">Instructions</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Search, sort, filter, and paginate users. Use the Add button to create a new user or edit/delete actions to manage existing users.</p>
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
          <UserForm user={activeUser} errors={fieldErrors} onChange={(field, value) => setActiveUser((current) => ({ ...current, [field]: value }))} onSubmit={() => saveUser(activeUser)} onCancel={closeForm} isNew={!activeUser.id} />
        )}
      </div>
    </div>
  )
}
