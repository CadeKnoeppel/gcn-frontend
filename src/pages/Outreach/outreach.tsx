import React, { useEffect, useState } from "react";
import "./Outreach.css";
import { useLeadsContext } from "../../context/LeadsContext";

interface Lead {
  _id: string;
  Company: string;
  contactName: string;
  website: string;
  industry: string;
  contacted: boolean;
  contactedBy: string;
  contactLog: string[];
  timestamp: string;
  assignedTo?: string;
  contactedEmail?: string;
  contactedAt?: string;
}

const Outreach = () => {
  const { setDailyLeads } = useLeadsContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draftLeads, setDraftLeads] = useState<{ [id: string]: Partial<Lead> }>({});
  const [notes, setNotes] = useState<{ [id: string]: string }>({});
  const [visibleCount, setVisibleCount] = useState(6);
  const [filterByContactedBy, setFilterByContactedBy] = useState("All");
  const [filterByStatus, setFilterByStatus] = useState("Not Contacted");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchLeads = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leads?user=${currentUser.name}`);
    const data: Lead[] = await res.json();
    setLeads(data);
  };

  useEffect(() => {
    fetchLeads();
  }, [currentUser.name]);

  const openGmailPopup = (lead: Lead) => {
    const subject = encodeURIComponent("Outreach from GCN");
    const body = encodeURIComponent(`Hi ${lead.contactName},`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${lead.website}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "gmailPopup", "width=700,height=600");
  };

  const handleDraftChange = (leadId: string, field: keyof Lead, value: any) => {
    setDraftLeads(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [field]: value
      }
    }));
  };

  const handleSave = async (lead: Lead) => {
    const logEntry = notes[lead._id]?.trim();
    const draft = draftLeads[lead._id] || {};

    const updatedLead: Lead = {
      ...lead,
      ...draft,
      contactedEmail: currentUser.email,
      contactedAt: new Date().toISOString(),
      contactLog: logEntry ? [...(lead.contactLog || []), logEntry] : lead.contactLog,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLead),
      });

      await res.json();

      // ✅ Re-fetch the whole list so filtering works correctly
      await fetchLeads();

      // Reset local draft/notes for that lead
      setNotes(prev => ({ ...prev, [lead._id]: "" }));
      setDraftLeads(prev => {
        const newDraft = { ...prev };
        delete newDraft[lead._id];
        return newDraft;
      });

      // ✅ Update dashboard counter
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leads/daily-completed?email=${currentUser.email}`)
      .then(res => res.json())
        .then(data => setDailyLeads(data.count || 0));
    } catch (err) {
      console.error("❌ Failed to update lead:", err);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const byContact =
      filterByContactedBy === "All" || lead.contactedBy === filterByContactedBy;
    const byStatus =
      filterByStatus === "All" ||
      (filterByStatus === "Contacted" && lead.contacted) ||
      (filterByStatus === "Not Contacted" && !lead.contacted) ||
      (filterByStatus === "Follow Up" &&
        lead.contactLog?.slice(-1)[0]?.toLowerCase().includes("follow up"));
    return byContact && byStatus;
  });
  return (
    <div className="outreach-container">
      <div className="outreach-header">
        <h1 className="page-title">Outreach Leads</h1>
        <div className="filters">
          <label>
            Contacted By:
            <select
              value={filterByContactedBy}
              onChange={(e) => setFilterByContactedBy(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Gavin">Gavin</option>
              <option value="Riley">Riley</option>
              <option value="Cade">Cade</option>
              <option value="Tank">Tank</option>
            </select>
          </label>
          <label>
            Status:
            <select
              value={filterByStatus}
              onChange={(e) => setFilterByStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Not Contacted">Not Contacted</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow Up">Follow Up</option>
            </select>
          </label>
          <button className="more-button" onClick={() => setVisibleCount(v => v + 6)}>
            More Leads
          </button>
        </div>
      </div>

      <div className="lead-grid">
        {filteredLeads.slice(0, visibleCount).map((lead) => {
          const draft = draftLeads[lead._id] || {};
          return (
            <div key={lead._id} className="lead-card">
              <h3>{lead.Company}</h3>
              <p><strong>Contact:</strong> {lead.contactName}</p>
              <p>
                <strong>Email:</strong>{" "}
                <span
                  style={{ color: "#60a5fa", textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => openGmailPopup(lead)}
                >
                  {lead.website}
                </span>
              </p>
              <p><strong>Phone:</strong> {lead.industry || "—"}</p>
              <p><strong>Contacted:</strong> {lead.contacted ? "Yes" : "No"}</p>

              <label>
                <strong>Status:</strong>
                <select
                  value={(draft.contacted ?? lead.contacted) ? "Contacted" : "Not Contacted"}
                  onChange={(e) =>
                    handleDraftChange(lead._id, "contacted", e.target.value === "Contacted")
                  }
                >
                  <option value="Not Contacted">Not Contacted</option>
                  <option value="Contacted">Contacted</option>
                </select>
              </label>

              <label>
                <strong>Contacted By:</strong>
                <select
                  value={draft.contactedBy ?? lead.contactedBy ?? ""}
                  onChange={(e) => handleDraftChange(lead._id, "contactedBy", e.target.value)}
                >
                  <option value="">—</option>
                  <option value="Gavin">Gavin</option>
                  <option value="Riley">Riley</option>
                  <option value="Cade">Cade</option>
                  <option value="Tank">Tank</option>
                </select>
              </label>

              {lead.contactLog.length > 0 && (
                <div>
                  <strong>Past Notes:</strong>
                  <ul>
                    {lead.contactLog.map((entry, i) => (
                      <li key={i}>• {entry}</li>
                    ))}
                  </ul>
                </div>
              )}

              <label>
                <strong>Add Notes:</strong>
                <textarea
                  value={notes[lead._id] || ""}
                  onChange={(e) => setNotes({ ...notes, [lead._id]: e.target.value })}
                  placeholder="Write your update here..."
                />
              </label>

              <button onClick={() => handleSave({ ...lead, ...draft })}>Save</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Outreach;
