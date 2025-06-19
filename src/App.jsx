import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/dashboard";
import Outreach from "./pages/Outreach/outreach";
import Tasks from "./pages/Tasks/tasks";
import Posts from "./pages/Posts/Posts";
import Admin from "./pages/Admin/admin";
import Login from "./pages/Login/Login";
import Layout from "./components/Layout/Layout";
import { LeadsProvider } from "./context/LeadsContext";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/outreach" element={<Outreach />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
};


export default App;
