import { api } from '../../services/api';

export default function HoneypotRecords({ sessionId }) {
  const logHp = (action, meta = "") => api.logHoneypotAction(sessionId, action, meta);

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
          <div key={cat.title} onClick={() => logHp(`Accessed Record Category: ${cat.title}`, `/admin/archive/${cat.title}`)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
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
      
      {/* Decoy Admin Tool in Records */}
      <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase">Legacy Mainframe Access (Terminal_v2.1)</h2>
          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold">STABLE_CONNECTION</span>
        </div>
        <div className="bg-slate-900 rounded p-4 font-mono text-xs text-blue-400 mb-4">
          <div>$ telnet stmarys.archive.local --user=admin</div>
          <div className="text-slate-500">Connecting... OK</div>
          <div className="text-green-500">Welcome. Database mount: /mnt/patients/2026_RECORDS</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => logHp("Triggered 'ls' on mainframe", "/admin/filesystem/root")} className="bg-white border border-slate-300 px-3 py-1.5 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors">LIST_DIRECTORIES</button>
          <button onClick={() => logHp("Triggered 'dump' on mainframe", "/admin/filesystem/dump")} className="bg-white border border-slate-300 px-3 py-1.5 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors">INITIATE_FULL_DUMP</button>
        </div>
      </div>
    </div>
  );
}
