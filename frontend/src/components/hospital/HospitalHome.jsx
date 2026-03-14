export default function HospitalHome() {
  const stats = [
    { label: "Active Patients", value: "1,284", change: "+12%", trend: "up", color: "blue" },
    { label: "Available Beds", value: "42", change: "-3", trend: "down", color: "teal" },
    { label: "Staff on Duty", value: "156", change: "Stable", trend: "neutral", color: "indigo" },
    { label: "Critical Alerts", value: "2", change: "None", trend: "neutral", color: "red" },
  ];

  const activities = [
    { id: 1, type: "Admission", patient: "Alice J.", time: "10 mins ago", status: "Processed" },
    { id: 2, type: "Surgery", patient: "Bob S.", time: "45 mins ago", status: "In Progress" },
    { id: 3, type: "Discharge", patient: "Charlie D.", time: "2 hours ago", status: "Completed" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <section>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 mt-1 font-medium">Welcome back, Administrator. Here's what's happening today at St. Mary's.</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className={`w-2 h-8 rounded-full ${
                stat.color === 'blue' ? 'bg-blue-600' : 
                stat.color === 'teal' ? 'bg-teal-500' : 
                stat.color === 'red' ? 'bg-red-500' : 'bg-indigo-500'
              }`} />
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                stat.trend === 'up' ? 'bg-green-100 text-green-700' : 
                stat.trend === 'down' ? 'bg-red-100 text-red-700' : 
                'bg-slate-100 text-slate-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Patient Activity</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {activities.map((act) => (
              <div key={act.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                    {act.type === 'Admission' ? '🏥' : act.type === 'Surgery' ? '🧪' : '✅'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{act.type}: {act.patient}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{act.time}</div>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{act.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Administrative Actions
          </h3>
          <div className="space-y-3">
             {['Admit New Patient', 'Generate Daily Report', 'Update Staff Schedule', 'Inventory Check'].map((action) => (
               <button key={action} className="w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold transition-all flex justify-between items-center group">
                 {action}
                 <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
