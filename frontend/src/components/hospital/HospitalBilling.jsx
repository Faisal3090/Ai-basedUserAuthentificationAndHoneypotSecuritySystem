export default function HospitalBilling() {
  const invoices = [
    { id: "INV-8821", name: "Alice Johnson", date: "Mar 12, 2026", amount: "$1,240.00", status: "Paid" },
    { id: "INV-8822", name: "Bob Smith", date: "Mar 11, 2026", amount: "$4,500.00", status: "Overdue" },
    { id: "INV-8823", name: "Charlie Davis", date: "Mar 10, 2026", amount: "$890.00", status: "Paid" },
    { id: "INV-8824", name: "Diana Prince", date: "Mar 09, 2026", amount: "$12,400.00", status: "Pending" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Systems</h1>
          <p className="text-slate-500 font-medium">Monitoring hospital billing records, insurance claims, and payment statuses.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
            Export CSV
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200">
            Create Invoice
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Issue Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4 text-sm font-mono font-medium text-slate-500">{inv.id}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">{inv.name}</td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500">{inv.date}</td>
                <td className="px-6 py-4 text-sm font-black text-slate-900">{inv.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View Ledger →
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
