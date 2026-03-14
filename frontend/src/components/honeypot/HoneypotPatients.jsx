import { api } from '../../services/api';

export default function HoneypotPatients({ sessionId }) {
  const logHp = (action, meta = "") => api.logHoneypotAction(sessionId, action, meta);

  const patients = [
    { id: "P-10021", name: "Alice Johnson", age: 34, gender: "F", ward: "Cardiology", status: "Stable" },
    { id: "P-10022", name: "Bob Smith", age: 45, gender: "M", ward: "Orthopedics", status: "Critical" },
    { id: "P-10023", name: "Charlie Davis", age: 29, gender: "M", ward: "Neurology", status: "Stable" },
    { id: "P-10024", name: "Diana Prince", age: 52, gender: "F", ward: "ICU", status: "Critical" },
    { id: "P-10025", name: "Edward Norton", age: 41, gender: "M", ward: "General Surgery", status: "Recovering" },
    { id: "P-10026", name: "Fiona Apple", age: 38, gender: "F", ward: "Maternity", status: "Recovering" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-slate-500 font-medium">Manage and view active patient records and their current status.</p>
        </div>
        <button onClick={() => logHp("Attempted to add new patient", "/admin/db/patients/write")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
          <span>+</span> Add New Patient
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ward</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((p) => (
              <tr key={p.id} onClick={() => logHp(`Inspected Patient Profile: ${p.name}`, p.id)} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                <td className="px-6 py-4 text-sm font-mono font-medium text-slate-500">{p.id}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">{p.name}</td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500">{p.age}y / {p.gender}</td>
                <td className="px-6 py-4 text-xs text-slate-600 font-bold uppercase tracking-tight">{p.ward}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    p.status === 'Stable' ? 'bg-green-100 text-green-700' :
                    p.status === 'Critical' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
