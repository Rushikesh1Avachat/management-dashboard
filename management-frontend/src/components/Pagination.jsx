export default function Pagination({ currentPage, pageCount, pageSize, pageSizes, onPageSizeChange, onPrev, onNext }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Page {currentPage} of {pageCount}</p>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onPrev} disabled={currentPage <= 1} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Prev</button>
          <button onClick={onNext} disabled={currentPage >= pageCount} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Next</button>
          <label className="flex items-center gap-3 text-sm text-slate-600">
            Rows:
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}
