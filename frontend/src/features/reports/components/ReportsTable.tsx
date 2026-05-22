const reportRows = [
  {
    category: "Users",
    metric: "New registrations",
    value: "128",
  },
  {
    category: "Posts",
    metric: "Posts created today",
    value: "342",
  },
  {
    category: "Groups",
    metric: "Most active groups",
    value: "24",
  },
  {
    category: "Messages",
    metric: "Messages sent",
    value: "1,204",
  },
  {
    category: "Reactions",
    metric: "Total reactions",
    value: "5,483",
  },
];

export const ReportsTable = () => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Platform Activity
        </h2>

        <p className="text-sm text-slate-500">
          Dynamic analytics overview across platform entities.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-3 text-sm font-semibold text-slate-600">
                Category
              </th>

              <th className="pb-3 text-sm font-semibold text-slate-600">
                Metric
              </th>

              <th className="pb-3 text-sm font-semibold text-slate-600">
                Value
              </th>
            </tr>
          </thead>

          <tbody>
            {reportRows.map((row) => (
              <tr
                key={row.metric}
                className="border-b border-slate-100"
              >
                <td className="py-4 text-sm text-slate-700">
                  {row.category}
                </td>

                <td className="py-4 text-sm text-slate-700">
                  {row.metric}
                </td>

                <td className="py-4 text-sm font-semibold text-slate-900">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};