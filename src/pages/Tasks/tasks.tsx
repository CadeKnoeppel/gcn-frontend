import React, { useState, useEffect } from "react";
import "./Tasks.css";

interface Task {
  _id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "" });
  const [fadeIds, setFadeIds] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!storedUser?.email) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks?email=${storedUser.email}`)
    .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      ...newTask,
      assignedTo: storedUser.email,
      createdBy: storedUser.email,
    };

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    const data = await res.json();
    if (res.ok) {
      setTasks(prev => [...prev, data]);
      setNewTask({ title: "", description: "", dueDate: "" });
    }
  };

  const markComplete = async (id: string | undefined) => {
    if (!id) return;

    setFadeIds(prev => [...prev, id]);

    setTimeout(async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${id}/complete`, {
        method: "PATCH",
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev =>
          prev.map(t => (t._id === updatedTask._id ? updatedTask : t))
        );
        setFadeIds(prev => prev.filter(fid => fid !== id));
      }
    }, 400);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="tasks-container">
      <div className="left-panel">
        <h2>New Task</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
          />
          <input
            type="date"
            value={newTask.dueDate}
            onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
          <button type="submit">Add Task</button>
        </form>
      </div>
  
      <div className="right-panel">
        <div className="tasks-header">
          <h2>My Tasks</h2>
          <div className="progress-bar-wrapper">
            <label>Progress: {progress}%</label>
            <div className="progress-bar-background">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
  
        <button className="toggle-button" onClick={() => setShowCompleted(!showCompleted)}>
          {showCompleted ? "Hide Completed Tasks" : "Show Completed Tasks"}
        </button>
  
        <ul className="task-list">
          {tasks
            .filter(task => showCompleted || !task.completed)
            .map(task => (
              <li
                key={task._id}
                className={`${task.completed ? "completed" : ""} ${
                  fadeIds.includes(task._id || "") ? "fade-out" : ""
                }`}
              >
                <strong>{task.title}</strong>
                {task.description && <p>{task.description}</p>}
                {task.dueDate && (
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
  
                {!task.completed ? (
                  <button onClick={() => markComplete(task._id)}>Mark Complete</button>
                ) : (
                  <span className="complete-label">✅ Completed</span>
                )}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
  
};

export default Tasks;
