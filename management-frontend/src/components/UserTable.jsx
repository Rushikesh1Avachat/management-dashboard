export default function UserTable({ users, loading, onEdit, onDelete, sortField, sortOrder, onSort }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/40 overflow-x-auto">
      <table className="min-w-full text-left text-sm text-slate-700">
        <thead>
          <tr className="border-b border-slate-200 text-slate-900">
            <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('id')}>ID{sortField === 'id' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('firstName')}>First Name{sortField === 'firstName' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('lastName')}>Last Name{sortField === 'lastName' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('email')}>Email{sortField === 'email' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('department')}>Department{sortField === 'department' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-slate-500">Loading users...</td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-slate-500">No users found.</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-4 font-medium text-slate-900">{user.id}</td>
                <td className="px-4 py-4">{user.firstName}</td>
                <td className="px-4 py-4">{user.lastName}</td>
                <td className="px-4 py-4">{user.email}</td>
                <td className="px-4 py-4">{user.department}</td>
                <td className="px-4 py-4 space-x-2">
                  <button onClick={() => onEdit(user)} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">Edit</button>
                  <button onClick={() => onDelete(user)} className="rounded-2xl bg-rose-100 px-3 py-2 text-sm text-rose-700 hover:bg-rose-200">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
