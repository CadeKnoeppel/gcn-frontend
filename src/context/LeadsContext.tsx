// src/context/LeadsContext.tsx
import React, { createContext, useContext, useState } from "react";

interface LeadsContextType {
  dailyLeads: number;
  setDailyLeads: (count: number) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyLeads, setDailyLeadsState] = useState(() => {
    const stored = localStorage.getItem("dailyLeads");
    return stored ? parseInt(stored) : 0;
  });

  const setDailyLeads = (count: number) => {
    setDailyLeadsState(count);
    localStorage.setItem("dailyLeads", count.toString());
  };

  return (
    <LeadsContext.Provider value={{ dailyLeads, setDailyLeads }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeadsContext = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeadsContext must be used within a LeadsProvider");
  }
  return context;
};