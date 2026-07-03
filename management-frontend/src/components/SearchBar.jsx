export default function SearchBar({ value, onChange }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200/40">
      <label className="block text-sm font-medium text-slate-700">Search</label>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name, email, or department"
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      />
    </div>
  )
}
