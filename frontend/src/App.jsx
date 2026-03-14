import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard"; // Original Session Monitoring Dashboard
import SecurityDashboard from "./components/SecurityDashboard"; // Original SOC Dashboard

// Hospital Components
import HospitalLayout from "./components/hospital/HospitalLayout";
import HospitalHome from "./components/hospital/HospitalHome";
import HospitalPatients from "./components/hospital/HospitalPatients";
import HospitalAppointments from "./components/hospital/HospitalAppointments";
import HospitalRecords from "./components/hospital/HospitalRecords";
import HospitalBilling from "./components/hospital/HospitalBilling";

// Honeypot Components
import HoneypotLayout from "./components/honeypot/HoneypotLayout";
import HoneypotAdmin from "./components/honeypot/HoneypotAdmin";
import HoneypotPatients from "./components/honeypot/HoneypotPatients";
import HoneypotAppointments from "./components/honeypot/HoneypotAppointments";
import HoneypotRecords from "./components/honeypot/HoneypotRecords";
import HoneypotBilling from "./components/honeypot/HoneypotBilling";

function AppContent() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginComplete = (response) => {
    setSession(response);
    if (response.isHoneypot) {
      navigate("/honeypot/home");
    } else {
      navigate("/hospital/home");
    }
  };

  const handleLogout = () => {
    setSession(null);
    navigate("/login");
  };

  // Protective Redirects
  useEffect(() => {
    const publicPaths = ["/login"];
    const isPublic = publicPaths.includes(location.pathname);
    
    if (!session && !isPublic) {
      navigate("/login");
    }

    if (session && isPublic) {
      if (session.isHoneypot) navigate("/honeypot/home");
      else navigate("/hospital/home");
    }
  }, [session, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login onLoginComplete={handleLoginComplete} />} />
      
      {/* Legitimate Hospital Portal */}
      <Route 
        path="/hospital/*" 
        element={
          <HospitalLayout onLogout={handleLogout}>
            <Routes>
              <Route path="home" element={<HospitalHome />} />
              <Route path="patients" element={<HospitalPatients />} />
              <Route path="appointments" element={<HospitalAppointments />} />
              <Route path="records" element={<HospitalRecords />} />
              <Route path="billing" element={<HospitalBilling />} />
              <Route path="*" element={<Navigate to="home" replace />} />
            </Routes>
          </HospitalLayout>
        } 
      />

      {/* Security Dashboard - accessible via link in Hospital Portal */}
      <Route 
        path="/security-dashboard" 
        element={
          <Dashboard 
            currentUser={session?.user?.username} 
            role={session?.user?.role} 
            onLogout={handleLogout}
            onOpenSOC={() => navigate("/soc-dashboard")}
          />
        } 
      />

      {/* SOC Dashboard */}
      <Route 
        path="/soc-dashboard" 
        element={<SecurityDashboard onLogout={() => navigate("/security-dashboard")} />} 
      />

      {/* Mirrored Honeypot Admin Portal */}
      <Route 
        path="/honeypot/*" 
        element={
          <HoneypotLayout 
            sessionId={session?.sessionId} 
            hpUser={session?.analysis?.username || "admin"} 
            onLogout={handleLogout}
          >
            <Routes>
              <Route path="home" element={<HoneypotAdmin sessionId={session?.sessionId} />} />
              <Route path="patients" element={<HoneypotPatients sessionId={session?.sessionId} />} />
              <Route path="appointments" element={<HoneypotAppointments sessionId={session?.sessionId} />} />
              <Route path="records" element={<HoneypotRecords sessionId={session?.sessionId} />} />
              <Route path="billing" element={<HoneypotBilling sessionId={session?.sessionId} />} />
              <Route path="*" element={<Navigate to="home" replace />} />
            </Routes>
          </HoneypotLayout>
        } 
      />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}