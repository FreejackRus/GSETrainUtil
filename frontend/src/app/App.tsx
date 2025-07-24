import React, { useState } from "react";
import { AppRouter } from './providers/AppRouter/ui/AppRouter';
import { LoginForm } from "../widgets/LoginForm/ui/LoginForm";
import { CreateApplicationButton } from "./CreateApplicationButton";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  const handleLogin = (token: string, role: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setToken(token);
    setRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <>
      <header style={{ display: "flex", alignItems: "center", padding: "10px 20px", borderBottom: "1px solid #eee" }}>
        <img src="/logo_peremena.png" alt="PEREMENA" style={{ height: 40, marginRight: 16 }} />
        <span style={{ flex: 1 }} />
        <span style={{ marginRight: 16 }}>{role === "admin" ? "Администратор" : "Инженер"}</span>
        <button onClick={handleLogout}>Выйти</button>
      </header>
      {role === "admin" ? (
        <AppRouter />
      ) : (
        <CreateApplicationButton />
      )}
    </>
  );
}

export default App;
