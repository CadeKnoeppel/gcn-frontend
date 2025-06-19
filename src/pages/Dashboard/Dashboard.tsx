import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [userName, setUserName] = useState("Friend");
  const [tasksDue, setTasksDue] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [streak, setStreak] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.name) {
      setUserName(storedUser.name);

      // Fetch task count
      fetch(`http://localhost:5050/api/tasks/due?email=${storedUser.email}`)
        .then((res) => res.json())
        .then((data) => setTasksDue(data.count || 0))
        .catch((err) => console.error("Error fetching tasks:", err));
    }

    // Handle streak tracking
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem("lastLoginDate");
    const storedStreak = parseInt(localStorage.getItem("loginStreak") || "1");

    if (lastLogin === today) {
      setStreak(storedStreak);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (new Date(lastLogin).toDateString() === yesterday.toDateString()) {
        const newStreak = storedStreak + 1;
        localStorage.setItem("loginStreak", newStreak.toString());
        setStreak(newStreak);
      } else {
        localStorage.setItem("loginStreak", "1");
        setStreak(1);
      }

      localStorage.setItem("lastLoginDate", today);
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5050/api/announcements")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5050/api/posts")
      .then((res) => res.json())
      .then((data) => setRecentPosts(data.slice(0, 2)));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome Back</h1>
        <div className="header-user">Logged in as {userName}</div>
      </div>

      <div className="dashboard-content">
        <Link to="/tasks" className="stat-link">
          <div className="stat-box">
            <h3>Tasks Due</h3>
            <p>{tasksDue}</p>
          </div>
        </Link>

        <div className="stat-box">
          <h3>🔥 Streak</h3>
          <p>{streak} day{streak > 1 ? "s" : ""}</p>
          <p>Keep it alive!</p>
        </div>

        <div className="stat-box announcement-box">
          <h3>📣 Announcements</h3>
          <ul className="announcement-list">
            {announcements.map((a, i) => (
              <li key={i}>
                {a.content}{" "}
                <span className="announcement-meta">
                  ({new Date(a.date).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="message-board" onClick={() => navigate("/posts")}>
        <h3 className="message-title">💬 Latest Team Messages</h3>
        {recentPosts.map((post) => (
          <div key={post._id} className="message-item">
            <p className="message-title-text">{post.title}</p>
            <p className="message-meta">
              {post.author} • {new Date(post.date).toLocaleDateString()}
            </p>
          </div>
        ))}
        <p className="view-all-posts">View All Posts →</p>
      </div>
    </div>
  );
};

export default Dashboard;
