import React, { useEffect, useState } from "react";
import "./Outreach.css";
import { useLeadsContext } from "../../context/LeadsContext";

interface Lead {
  _id: string;
  firmName: string;
  contact: string;
  email: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  capabilities?: string;
  contacted: boolean;
  contactedBy: string;
  contactLog: string[];
  timestamp: string;
  assignedTo?: string;
  contactedEmail?: string;
  contactedAt?: string;
}

const EMAIL_BODY = (firstName: string) =>
  `Hi ${firstName},

Hiring and training an in-house marketing team is a big lift—especially when your time and budget are limited.

That’s where GCN Digital steps in. We’re a small, Wisconsin-based team of 5 experts, offering custom, full-service digital marketing for growing businesses—without the costly overhead.

Our services include:
🎯 Paid Ads (Google, Meta, LinkedIn & more)
🖥 Website Design & Optimization
📱 Social Media Management
🎨 Graphic Design
🎥 Video Filming & Editing
✉️ Email Marketing
➕ And more

With every partnership, you’ll get:
📊 Transparent reporting so you know exactly what's working
🤝 Personal, Midwest-based support that feels like an extension of your team
🔁 Fast turnarounds, clear communication, and strategies tailored to your goals

If any or all of these sound like something that could help your business, reach out today and let’s build something smart together.

Let's Get In Touch

Warm regards,`;

const Outreach = () => {
  const { setDailyLeads } = useLeadsContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notes, setNotes] = useState<{ [id: string]: string }>({});
  const [visibleCount, setVisibleCount] = useState(6);

  /* --------- filters / search --------- */
  const [filterByStatus, setFilterByStatus] = useState("Not Contacted");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<"Any" | "7" | "30">("Any");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  /* --------- fetch & auto-assign leads --------- */
  const fetchLeads = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/leads?user=${currentUser.name}&limit=50`
    );
    const data: Lead[] = await res.json();
    setLeads(data);
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.name]);

  /* --------- Gmail popup --------- */
  const openGmailPopup = async (lead: Lead) => {
    const firstName = lead.contact.split(" ")[0];
    const subject = encodeURIComponent("Let’s Build Something Smart Together");
    const body = encodeURIComponent(EMAIL_BODY(firstName));
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}&su=${subject}&body=${body}`;

    window.open(gmailUrl, "_blank", "width=700,height=600");

    /* instantly mark contacted + credit */
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leads/${lead._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contacted: true,
        contactedBy: currentUser.name,
        contactedEmail: currentUser.email,
        contactedAt: new Date().toISOString(),
      }),
    });

    /* refresh list + dashboard counter */
    fetchLeads();
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/leads/daily-completed?email=${currentUser.email}`
    )
      .then((r) => r.json())
      .then((d) => setDailyLeads(d.count || 0));
  };

  /* --------- client-side filters --------- */
  const filteredLeads = leads.filter((lead) => {
    /* status */
    const byStatus =
      filterByStatus === "All" ||
      (filterByStatus === "Contacted" && lead.contacted) ||
      (filterByStatus === "Not Contacted" && !lead.contacted) ||
      (filterByStatus === "Follow Up" &&
        lead.contactLog?.slice(-1)[0]?.toLowerCase().includes("follow up"));

    /* search */
    const haystack = (
      lead.firmName +
      lead.contact +
      (lead.email || "")
    ).toLowerCase();
    const bySearch = haystack.includes(searchTerm.toLowerCase());

    /* date */
    let byDate = true;
    if (dateRange !== "Any") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(dateRange));
      byDate = new Date(lead.timestamp) >= cutoff;
    }

    return byStatus && bySearch && byDate;
  });

  return (
    <div className="outreach-container">
      <div className="outreach-header">
        <h1 className="page-title">Outreach Leads</h1>
        <div className="filters">
          {/* --- search & date --- */}
          <input
            className="search-input"
            type="text"
            placeholder="Search company / contact"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <label>
            Date:
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
            >
              <option value="Any">Any</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
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

          <button
            className="more-button"
            onClick={() => setVisibleCount((v) => v + 6)}
          >
            More Leads
          </button>
        </div>
      </div>

      {/* --------- lead cards --------- */}
      <div className="lead-grid">
        {filteredLeads.slice(0, visibleCount).map((lead) => (
          <div key={lead._id} className="lead-card">
            <h3>{lead.firmName}</h3>
            <p>
              <strong>Contact:</strong> {lead.contact}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <button
                className="contact-btn"
                onClick={() => openGmailPopup(lead)}
              >
                Send Email
              </button>
            </p>
            <p>
              <strong>Phone:</strong> {lead.phone || "—"}
            </p>
            {lead.website && (
              <p>
                <strong>Website:</strong>{" "}
                <a href={lead.website} target="_blank" rel="noopener">
                  {lead.website}
                </a>
              </p>
            )}
            <p>
              <strong>Contacted:</strong> {lead.contacted ? "Yes" : "No"}
            </p>

            <label>
              <strong>Contacted By:</strong>
              <select
                value={lead.contactedBy || currentUser.name}
                onChange={(e) =>
                  fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/leads/${lead._id}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ contactedBy: e.target.value }),
                    }
                  ).then(() => fetchLeads())
                }
              >
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
                onChange={(e) =>
                  setNotes({ ...notes, [lead._id]: e.target.value })
                }
                placeholder="Write your update here..."
              />
            </label>

            <button
              onClick={() =>
                fetch(
                  `${import.meta.env.VITE_API_BASE_URL}/api/leads/${lead._id}`,
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contactLog: [
                        ...lead.contactLog,
                        notes[lead._id]?.trim() || "",
                      ].filter(Boolean),
                    }),
                  }
                )
                  .then(() => {
                    setNotes((n) => ({ ...n, [lead._id]: "" }));
                    fetchLeads();
                  })
                  .catch((err) => console.error(err))
              }
            >
              Save Notes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Outreach;
