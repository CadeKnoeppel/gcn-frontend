import React, { useEffect, useState } from "react";
import "./Posts.css";

interface Post {
  _id?: string;
  title: string;
  author: string;
  content: string;
  date: string;
}

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filtered, setFiltered] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", author: "", content: "" });
  const [authorFilter, setAuthorFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");

  useEffect(() => {
    const fetchPosts = () => {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/posts`)
      .then((res) => res.json())
        .then((data) => {
          setPosts(data);
          setFiltered(data);
        });
    };
  
    fetchPosts(); // initial fetch on load
    const interval = setInterval(fetchPosts, 5000); // refresh every 5s
  
    return () => clearInterval(interval); // clean up on page unload
  }, []);
  

  const filterPosts = () => {
    const now = new Date();
    const result = posts.filter((post) => {
      const postDate = new Date(post.date);

      const authorMatch =
        authorFilter === "All" || post.author === authorFilter;

      const timeMatch =
        timeFilter === "All" ||
        (timeFilter === "Today" &&
          postDate.toDateString() === now.toDateString()) ||
        (timeFilter === "This Week" &&
          postDate > new Date(now.setDate(now.getDate() - 7)));

      return authorMatch && timeMatch;
    });

    setFiltered(result);
  };

  useEffect(() => {
    filterPosts();
  }, [authorFilter, timeFilter, posts]);

  const handleSubmit = async () => {
    if (!newPost.title || !newPost.author || !newPost.content) return;

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });

    const saved = await res.json();
    setPosts([saved, ...posts]);
    setNewPost({ title: "", author: "", content: "" });
    setShowModal(false);
  };

  return (
    <div className="posts-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Team Posts</h1>
        <button className="more-button" onClick={() => setShowModal(true)}>New Post</button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <label style={{ color: "#f1f5f9" }}>
          Filter by Author:
          <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} style={{ marginLeft: "0.5rem" }}>
            <option>All</option>
            <option>Gavin</option>
            <option>Riley</option>
            <option>Cade</option>
            <option>Tank</option>
          </select>
        </label>

        <label style={{ color: "#f1f5f9" }}>
          Filter by Time:
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={{ marginLeft: "0.5rem" }}>
            <option>All</option>
            <option>Today</option>
            <option>This Week</option>
          </select>
        </label>
      </div>

      <div className="posts-list">
        {filtered.map((post, index) => (
          <div className="post-card" key={post._id || index}>
            <div className="post-header">
              <h3>{post.title}</h3>
              <p className="post-meta">
                {post.author} • {new Date(post.date).toLocaleDateString()}
              </p>
            </div>
            <p className="post-content">{post.content}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>New Post</h2>
            <input
              type="text"
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <select
              value={newPost.author}
              onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
            >
              <option value="">Select Author</option>
              <option value="Gavin">Gavin</option>
              <option value="Riley">Riley</option>
              <option value="Cade">Cade</option>
              <option value="Tank">Tank</option>
            </select>
            <textarea
              placeholder="Write your post..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
