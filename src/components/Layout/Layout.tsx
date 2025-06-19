import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="layout-main">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
