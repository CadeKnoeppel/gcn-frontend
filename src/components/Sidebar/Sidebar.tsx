import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const handleLogout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const sessionId = localStorage.getItem('sessionId');

    if (sessionId) {
      try {
        await fetch(`http://localhost:5050/api/sessions/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
      } catch (err) {
        console.error("❌ Failed to end session:", err);
      }
    }

    localStorage.removeItem('user');
    localStorage.removeItem('loginStart');
    localStorage.removeItem('sessionId');
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <h2 className="logo">GCN</h2>

      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          Dashboard
        </NavLink>
        <NavLink to="/outreach" className={({ isActive }) => isActive ? "active" : ""}>
          Outreach
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => isActive ? "active" : ""}>
          Tasks
        </NavLink>
        <NavLink to="/posts" className={({ isActive }) => isActive ? "active" : ""}>
          Posts
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>
          Admin
        </NavLink>
      </nav>

      <div className="user-info">
        <p>Welcome Back, {JSON.parse(localStorage.getItem('user'))?.name || 'Friend'}</p>
        <button id="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
