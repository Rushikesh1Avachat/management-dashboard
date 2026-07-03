export default function FilterPopup({ filters, onFilterChange }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/40">
      <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {Object.entries(filters).map(([key, value]) => (
          <label key={key} className="block text-sm text-slate-700">
            <span className="mb-2 block font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <input
              type="text"
              value={value}
              onChange={(event) => onFilterChange(key, event.target.value)}
              placeholder={`Filter by ${key}`}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        ))}
      </div>
    </div>
  )
}
