const summaryItems = [
  { label: "Users", value: 0 },
  { label: "Posts", value: 0 },
  { label: "Reactions", value: 0 },
  { label: "Groups", value: 0 },
  { label: "Messages", value: 0 },
  { label: "Follows", value: 0 },
  { label: "Courses", value: 0 },
];

export const ReportsSummaryCards = () => {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-slate-500">{item.label}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {item.value}
          </h3>
        </div>
      ))}
    </section>
  );
};