export const ReportsFilters = () => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Report Type
          </label>

          <select className="w-full rounded-xl border border-slate-300 p-3 outline-none">
            <option>All Reports</option>
            <option>Users</option>
            <option>Posts</option>
            <option>Reactions</option>
            <option>Groups</option>
            <option>Messages</option>
            <option>Follows</option>
            <option>Courses</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            From Date
          </label>

          <input
            type="date"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            To Date
          </label>

          <input
            type="date"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none"
          />
        </div>
      </div>
    </section>
  );
};