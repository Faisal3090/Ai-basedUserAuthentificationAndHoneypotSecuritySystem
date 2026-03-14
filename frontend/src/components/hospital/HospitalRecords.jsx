export default function HospitalRecords() {
  const categories = [
    { title: "Lab Results", count: 124, icon: "🔬", lastUpdated: "2 hours ago" },
    { title: "Radiology", count: 42, icon: "🩻", lastUpdated: "5 hours ago" },
    { title: "Prescriptions", count: 256, icon: "💊", lastUpdated: "1 hour ago" },
    { title: "Vaccinations", count: 89, icon: "💉", lastUpdated: "Yesterday" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medical Records</h1>
        <p className="text-slate-500 font-medium">Categorized archival of all patient medical history and diagnostic reports.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-3xl group-hover:bg-blue-50 transition-colors">
                {cat.icon}
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 tracking-tight">{cat.title}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  {cat.count} total records · <span className="text-blue-500">Updated {cat.lastUpdated}</span>
                </div>
              </div>
            </div>
            <div className="text-slate-300 group-hover:text-blue-600 transition-colors text-xl font-bold">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
