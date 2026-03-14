import { api } from '../../services/api';

export default function HoneypotAppointments({ sessionId }) {
  const logHp = (action, meta = "") => api.logHoneypotAction(sessionId, action, meta);

  const appointments = [
    { time: "09:00 AM", patient: "John Doe", doctor: "Dr. House", type: "Checkup", status: "Confirmed" },
    { time: "10:30 AM", patient: "Sarah Connor", doctor: "Dr. Brewster", type: "Surgery Followup", status: "In Progress" },
    { time: "01:15 PM", patient: "Michael Scott", doctor: "Dr. Grey", type: "General Consultation", status: "Pending" },
    { time: "03:45 PM", patient: "Walter White", doctor: "Dr. Strange", type: "Chemotherapy", status: "Confirmed" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daily Schedule</h1>
        <p className="text-slate-500 font-medium">Viewing all scheduled medical appointments for March 13, 2026.</p>
      </header>

      <div className="grid gap-4">
        {appointments.map((apt, i) => (
          <div key={i} onClick={() => logHp(`Inspected Appointment: ${apt.patient}`, apt.time)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-center gap-8">
              <div className="text-xl font-black text-blue-600 w-24 border-r border-slate-100 pr-4">{apt.time}</div>
              <div>
                <div className="font-bold text-slate-900 text-lg tracking-tight">{apt.patient}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Assigned to <span className="text-slate-600">{apt.doctor}</span> · <span className="text-blue-500">{apt.type}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                 apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                 apt.status === 'In Progress' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                 'bg-slate-100 text-slate-500'
               }`}>
                 {apt.status}
               </span>
               <button onClick={(e) => { e.stopPropagation(); logHp("Attempted to access appointment context menu", apt.patient); }} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all">
                 <span className="text-xl">⋮</span>
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
