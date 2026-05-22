const postsData = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 68 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 80 },
  { day: "Fri", value: 74 },
  { day: "Sat", value: 38 },
  { day: "Sun", value: 60 },
];

const reactionData = [
  { label: "Likes", value: "48%" },
  { label: "Comments", value: "27%" },
  { label: "Shares", value: "15%" },
  { label: "Saves", value: "10%" },
];

export const ReportsCharts = () => {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Posts per Day</h2>
        <p className="text-sm text-slate-500">Weekly publishing activity</p>

        <div className="mt-6 flex h-56 items-end gap-4">
          {postsData.map((item) => (
            <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-teal-800"
                style={{ height: `${item.value}%` }}
              />
              <span className="text-xs font-medium text-slate-500">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Reaction Overview</h2>
        <p className="text-sm text-slate-500">Engagement distribution</p>

        <div className="mt-6 space-y-4">
          {reactionData.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-semibold text-teal-800">{item.value}</span>
              </div>

              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-teal-800"
                  style={{ width: item.value }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};