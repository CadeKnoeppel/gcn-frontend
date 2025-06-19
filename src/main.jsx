import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./assets/global.css"; // Global resets and base styling
import { LeadsProvider } from "./context/LeadsContext"; // 👈 ADD THIS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LeadsProvider> {/* 👈 WRAP THE WHOLE APP */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LeadsProvider>
  </React.StrictMode>
);
