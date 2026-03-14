import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function HospitalLayout({ children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/hospital/home', label: 'Dashboard', icon: '📊' },
    { path: '/hospital/patients', label: 'Patients', icon: '👤' },
    { path: '/hospital/appointments', label: 'Schedule', icon: '📅' },
    { path: '/hospital/records', label: 'Records', icon: '📁' },
    { path: '/hospital/billing', label: 'Financials', icon: '💳' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-2xl">+</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 leading-tight">ST. MARY'S</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Health Systems</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link 
            to="/security-dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md"
          >
            <span>🛡️</span> Security Dashboard
          </Link>
          <button 
            onClick={onLogout}
            className="mt-4 w-full text-left px-4 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2"
          >
            <span>🚪</span> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 pl-64 flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {navItems.find(i => i.path === location.pathname)?.label || 'System'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">Administrator</div>
              <div className="text-[10px] text-slate-400">System Access Active</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300" />
          </div>
        </header>

        <main className="p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        <footer className="p-8 text-center text-[10px] font-medium text-slate-400 uppercase tracking-widest border-t border-slate-100">
          © 2026 St. Mary's General Hospital · Enterprise Portal v4.2.1
        </footer>
      </div>
    </div>
  );
}
