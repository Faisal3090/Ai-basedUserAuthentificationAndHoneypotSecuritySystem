import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Honeypot from "./components/Honeypot";
import SecurityDashboard from "./components/SecurityDashboard";

export default function App() {
  const [view, setView] = useState("login"); // login | dashboard | honeypot
  const [session, setSession] = useState(null);

  const handleLoginComplete = (response) => {
    setSession(response);
    if (response.isHoneypot) {
      setView("honeypot");
    } else {
      setView("dashboard");
    }
  };

  const handleLogout = () => {
    setView("login");
    setSession(null);
  };

  if (view === "login") {
    return <Login onLoginComplete={handleLoginComplete} />;
  }

  if (view === "honeypot" && session) {
    // For honeypot, user thinks they successfully logged in. 
    // The response includes the username they attempted.
    return <Honeypot
      hpUser={session.analysis?.username || "admin"}
      sessionId={session.sessionId}
      onLogout={handleLogout}
    />;
  }

  if (view === "dashboard" && session) {
    return <Dashboard
      currentUser={session.user?.username}
      role={session.user?.role}
      onLogout={handleLogout}
      onOpenSOC={() => setView("soc")}
    />;
  }

  if (view === "soc") {
    return <SecurityDashboard onLogout={() => setView(session ? "dashboard" : "login")} />;
  }

  // Fallback
  return <Login onLoginComplete={handleLoginComplete} />;
}