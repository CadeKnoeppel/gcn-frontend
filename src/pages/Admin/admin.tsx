import React, { useEffect, useState } from 'react';
import './Admin.css';

interface EmployeeMetrics {
  name: string;
  email: string;
  hours: string;
  tasksCompleted: number;
  leadsContacted: number;
}

interface User {
  name: string;
  email: string;
}

const Admin = () => {
  const [metrics, setMetrics] = useState<EmployeeMetrics[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [taskDetails, setTaskDetails] = useState({ title: '', description: '', dueDate: '', assignedTo: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.email === 'gavin@gcndigital.com') {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/metrics`)
      .then(res => res.json())
        .then(data => setMetrics(data));

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`)
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, []);

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskDetails, createdBy: user.email }),
    });
    if (res.ok) {
      alert('✅ Task assigned!');
      setTaskDetails({ title: '', description: '', dueDate: '', assignedTo: '' });
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: announcement, author: 'Admin' }),
    });
    if (res.ok) {
      alert('📢 Announcement posted!');
      setAnnouncement('');
    }
  };

  if (user.email !== 'gavin@gcndigital.com') {
    return <div className="admin-container"><p>⛔ Access restricted to admin.</p></div>;
  }

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>

      <div className="metrics-section">
        <h3>Employee Metrics</h3>
        <div className="employee-cards">
          {metrics.map((emp, i) => (
            <div className="employee-card" key={i}>
              <h4>{emp.name}</h4>
              <p>Email: {emp.email}</p>
              <p>Hours Logged: {emp.hours}</p>
              <p>Tasks Completed: {emp.tasksCompleted}</p>
              <p>Leads Contacted: {emp.leadsContacted}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-forms">
        <div className="assign-task-box">
          <h3>Assign a Task</h3>
          <form onSubmit={handleAssignTask}>
            <input type="text" placeholder="Title" value={taskDetails.title} onChange={e => setTaskDetails({ ...taskDetails, title: e.target.value })} required />
            <input type="text" placeholder="Description" value={taskDetails.description} onChange={e => setTaskDetails({ ...taskDetails, description: e.target.value })} />
            <input type="date" value={taskDetails.dueDate} onChange={e => setTaskDetails({ ...taskDetails, dueDate: e.target.value })} />
            <select value={taskDetails.assignedTo} onChange={e => setTaskDetails({ ...taskDetails, assignedTo: e.target.value })} required>
              <option value="">Select an employee</option>
              {users.map(user => (
                <option key={user.email} value={user.email}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button type="submit">Assign Task</button>
          </form>
        </div>

        <div className="announcement-box">
          <h3>Post Announcement</h3>
          <form onSubmit={handlePostAnnouncement}>
            <textarea placeholder="Enter announcement..." value={announcement} onChange={e => setAnnouncement(e.target.value)} required />
            <button type="submit">Post</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
