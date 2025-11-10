import React, { useState, useEffect } from "react";
import "./App.css"; // Make sure this file exists

function App() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    fetch("http://localhost:8080/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(sortByPriority(data)));
  };

  const addTask = () => {
    if (!description || !deadline) {
      alert("Please enter task and deadline");
      return;
    }

    const task = { description, deadline, done: false };

    fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add task");
        return res.json();
      })
      .then(() => {
        setDescription("");
        setDeadline("");
        fetchTasks();
      })
      .catch(() => alert("Error adding task (Deadline may be invalid)"));
  };

  const toggleDone = (task) => {
    fetch(`http://localhost:8080/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, done: !task.done }),
    }).then(() => fetchTasks());
  };

  const deleteTask = (id) => {
    fetch(`http://localhost:8080/tasks/${id}`, {
      method: "DELETE",
    }).then(() => fetchTasks());
  };

  // Sort tasks by deadline: next 3 days = high, next 7 days = medium, after 7 days = low
  const sortByPriority = (tasks) => {
    const today = new Date();
    const getDaysDiff = (dateStr) => {
      const deadline = new Date(dateStr);
      // Zero out time for accurate diff
      deadline.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return Math.floor((deadline - today) / (1000 * 60 * 60 * 24));
    };

    const high = [];
    const medium = [];
    const low = [];

    tasks.forEach((task) => {
      const diff = getDaysDiff(task.deadline);
      if (diff <= 3) high.push(task);
      else if (diff <= 7) medium.push(task);
      else low.push(task);
    });

    // Optionally, sort each group by deadline ascending
    const sortByDate = (a, b) => new Date(a.deadline) - new Date(b.deadline);
    return [
      ...high.sort(sortByDate),
      ...medium.sort(sortByDate),
      ...low.sort(sortByDate),
    ];
  };

  return (
    <div className="container">
      <h2 className="title">📌 To-Do List</h2>
      <div className="input-section">
        <input
          type="text"
          placeholder="Enter task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={deadline}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${task.done ? "done" : ""}`}
          >
            <div className="task-info">
              <span className="task-title">{task.description}</span>
              <span className="task-deadline">📅 {task.deadline}</span>
            </div>
            <div className="buttons">
              <button onClick={() => toggleDone(task)}>
                {task.done ? "Undo" : "Done"}
              </button>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
