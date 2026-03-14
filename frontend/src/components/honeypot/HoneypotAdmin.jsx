import { api } from '../../services/api';

export default function HoneypotAdmin({ sessionId }) {
  const logHp = (action, meta = "") => api.logHoneypotAction(sessionId, action, meta);

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Hospital Overview</h1>
        <p className="text-slate-500">Welcome to the St. Mary's Administrative Portal. Here is what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} onClick={() => logHp(`Interacted with: ${stat.label}`, stat.meta)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 border-b pb-2">Recent Patient Activity</h2>
          <div className="space-y-4">
            {[
              { name: "John Doe", action: "Checked in for Cardiology", time: "10 mins ago", log: "/admin/reports/cardio" },
              { name: "Jane Smith", action: "Lab results updated", time: "25 mins ago", log: "/admin/reports/labs" },
              { name: "Robert Wilson", action: "Discharged from Ward B", time: "1 hour ago", log: "/admin/reports/wards" },
              { name: "Mary Johnson", action: "Billing processed", time: "2 hours ago", log: "/admin/payments/summary" },
            ].map((activity, i) => (
              <div key={i} onClick={() => logHp(`Viewed Activity: ${activity.name}`, activity.log)} className="flex justify-between items-center text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                <div>
                  <span className="font-medium text-slate-700">{activity.name}</span>
                  <span className="text-slate-500 ml-2">— {activity.action}</span>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 border-b pb-2">Hospital Announcements</h2>
          <div className="space-y-4">
            <div onClick={() => logHp("Viewed Announcement: Maintenance", "/admin/maintenance")} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded cursor-pointer hover:bg-blue-100 transition-colors">
              <div className="text-sm font-semibold text-blue-800">System Maintenance</div>
              <div className="text-xs text-blue-600 mt-1">Scheduled database migration on Sunday at 02:00 AM UTC.</div>
            </div>
            <div onClick={() => logHp("Viewed Announcement: Equipment", "/admin/equipment")} className="p-3 bg-teal-50 border-l-4 border-teal-500 rounded cursor-pointer hover:bg-teal-100 transition-colors">
              <div className="text-sm font-semibold text-teal-800">New Equipment Arrival</div>
              <div className="text-xs text-teal-600 mt-1">MRI Suite 04 is now equipped with the latest Siemens scanner.</div>
            </div>
            <div className="pt-2">
               <button onClick={() => logHp("Attempted to post announcement", "/admin/broadcast")} className="text-xs font-bold text-blue-600 hover:underline">+ POST NEW ANNOUNCEMENT</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden Bait Section */}
      <div className="mt-8 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Internal Admin Tools (Privileged Access Required)</h3>
        <div className="flex gap-4">
          <button onClick={() => logHp("Attempted Database Export", "/admin/database/export")} className="bg-white border border-slate-200 text-[10px] font-bold px-3 py-2 rounded shadow-sm hover:border-red-300 hover:text-red-600 transition-all">EXPORT_FULL_PATIENT_DB.XLSX</button>
          <button onClick={() => logHp("Attempted Payment Gateway Access", "/admin/payments/gateway")} className="bg-white border border-slate-200 text-[10px] font-bold px-3 py-2 rounded shadow-sm hover:border-red-300 hover:text-red-600 transition-all">ACCESS_PAYMENT_GATEWAY_V2</button>
          <button onClick={() => logHp("Attempted RSA Keys Access", "/admin/security/keys")} className="bg-white border border-slate-200 text-[10px] font-bold px-3 py-2 rounded shadow-sm hover:border-red-300 hover:text-red-600 transition-all">DOWNLOAD_SIGNING_KEYS.ZIP</button>
        </div>
      </div>
    </div>
  );
}
