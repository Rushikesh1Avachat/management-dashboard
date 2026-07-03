const fields = [
  { name: 'firstName', label: 'First name', type: 'text' },
  { name: 'lastName', label: 'Last name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'department', label: 'Department', type: 'text' },
  { name: 'username', label: 'Username', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'website', label: 'Website', type: 'text' }
]

export default function UserForm({ user, errors, onChange, onSubmit, onCancel, isNew }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">{isNew ? 'Add user' : 'Edit user'}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{isNew ? 'Create new user' : 'Update user details'}</h2>
          </div>
          <button onClick={onCancel} className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200">Close</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="block text-sm text-slate-700">
              <span className="mb-2 block font-medium">{field.label}</span>
              <input
                type={field.type}
                value={user[field.name] ?? ''}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              {errors[field.name] && <p className="mt-2 text-xs text-rose-600">{errors[field.name]}</p>}
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={onCancel} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onSubmit} className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
            Save user
          </button>
        </div>
      </div>
    </div>
  )
}
