"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [subject, setSubject] = useState("General");
  const [saving, setSaving] = useState(false);

  // For editing
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editSubject, setEditSubject] = useState("General");

  // For AI Study Plan
  const [studyPlan, setStudyPlan] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // For AI Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  // ========== POMODORO TIMER ==========
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "assignments"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssignments(list);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Timer Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsRunning(false);

      if (isBreak) {
        setTimeLeft(selectedMinutes * 60);
        setIsBreak(false);
        alert("Break finished! Time to focus again.");
      } else {
        setTimeLeft(5 * 60);
        setIsBreak(true);
        alert("Focus session completed! Take a 5-minute break.");
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, isBreak, selectedMinutes]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(selectedMinutes * 60);
  };

  const changeTime = (minutes) => {
    setSelectedMinutes(minutes);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "assignments"), {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        priority: priority,
        subject: subject,
        status: "Pending",
        userId: user.uid,
        createdAt: new Date(),
      });

      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("Medium");
      setSubject("General");
    } catch (error) {
      alert("Error adding assignment: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await deleteDoc(doc(db, "assignments", id));
    } catch (error) {
      alert("Error deleting assignment: " + error.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Pending" ? "Completed" : "Pending";
      await updateDoc(doc(db, "assignments", id), { status: newStatus });
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditDueDate(item.dueDate || "");
    setEditPriority(item.priority || "Medium");
    setEditSubject(item.subject || "General");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditDueDate("");
    setEditPriority("Medium");
    setEditSubject("General");
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await updateDoc(doc(db, "assignments", id), {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate || null,
        priority: editPriority,
        subject: editSubject,
      });
      cancelEdit();
    } catch (error) {
      alert("Error updating assignment: " + error.message);
    }
  };

  const handleGenerateStudyPlan = async (item) => {
    setSelectedAssignment(item);
    setGenerating(true);
    setStudyPlan("");
    setChatMessages([]);

    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          dueDate: item.dueDate,
        }),
      });

      const data = await res.json();

      if (data.studyPlan) {
        setStudyPlan(data.studyPlan);
        await updateDoc(doc(db, "assignments", item.id), {
          studyPlan: data.studyPlan,
        });
      } else {
        setStudyPlan("Failed to generate study plan. Please try again.");
      }
    } catch (error) {
      setStudyPlan("Error connecting to AI. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleViewSavedPlan = (item) => {
    setSelectedAssignment(item);
    setStudyPlan(item.studyPlan || "No study plan saved yet.");
    setChatMessages([]);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !studyPlan) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          studyPlan: studyPlan,
          assignmentTitle: selectedAssignment?.title || "",
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setChatMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "ai", text: "Sorry, I could not get a reply. Please try again." },
        ]);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error connecting to AI. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return "bg-red-100 text-red-700";
    if (priority === "Low") return "bg-blue-100 text-blue-700";
    return "bg-orange-100 text-orange-700";
  };

  const total = assignments.length;
  const pending = assignments.filter((a) => a.status === "Pending").length;
  const completed = assignments.filter((a) => a.status === "Completed").length;
  const highPriority = assignments.filter((a) => a.priority === "High").length;

  const assignmentsByDate = useMemo(() => {
    const map = {};
    assignments.forEach((a) => {
      if (a.dueDate) {
        if (!map[a.dueDate]) map[a.dueDate] = [];
        map[a.dueDate].push(a);
      }
    });
    return map;
  }, [assignments]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main
      className={`min-h-screen p-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-indigo-400" : "text-indigo-700"
            }`}
          >
            StudyBuddy AI Dashboard
          </h1>

          <div className="flex items-center gap-3">
            {/* Profile Button */}
            <button
              onClick={() => router.push("/profile")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                darkMode
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
            >
              Profile
            </button>

            <button
              onClick={() => setShowTimer(!showTimer)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                darkMode
                  ? "bg-purple-600 text-white hover:bg-purple-500"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              {showTimer ? "Hide Timer" : "Show Timer"}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                darkMode
                  ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Welcome */}
        <div
          className={`p-6 rounded-xl shadow mb-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <p className="text-lg">
            Welcome, <span className="font-semibold">{user.email}</span>
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-5 rounded-xl shadow text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <p className="text-3xl font-bold text-indigo-500">{total}</p>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total</p>
          </div>
          <div className={`p-5 rounded-xl shadow text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <p className="text-3xl font-bold text-yellow-500">{pending}</p>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Pending</p>
          </div>
          <div className={`p-5 rounded-xl shadow text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <p className="text-3xl font-bold text-green-500">{completed}</p>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Completed</p>
          </div>
          <div className={`p-5 rounded-xl shadow text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <p className="text-3xl font-bold text-red-500">{highPriority}</p>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>High Priority</p>
          </div>
        </div>

        {/* Add Assignment Form */}
        <div
          className={`p-6 rounded-xl shadow mb-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">Add New Assignment</h2>
          <form onSubmit={handleAddAssignment} className="space-y-4">
            <div>
              <label className="block mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
                placeholder="e.g. Math Assignment 3"
              />
            </div>

            <div>
              <label className="block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
                placeholder="Optional details..."
              />
            </div>

            <div>
              <label className="block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <option value="General">General</option>
                  <option value="Math">Math</option>
                  <option value="Programming">Programming</option>
                  <option value="English">English</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Assignment"}
            </button>
          </form>
        </div>

        {/* Assignments List */}
        <div
          className={`p-6 rounded-xl shadow mb-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">
            Your Assignments ({assignments.length})
          </h2>

          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
              <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Start by adding your first assignment above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode ? "bg-gray-700 border-gray-600 text-white" : ""
                        }`}
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode ? "bg-gray-700 border-gray-600 text-white" : ""
                        }`}
                      />
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode ? "bg-gray-700 border-gray-600 text-white" : ""
                        }`}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            darkMode ? "bg-gray-700 border-gray-600 text-white" : ""
                          }`}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                        <select
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            darkMode ? "bg-gray-700 border-gray-600 text-white" : ""
                          }`}
                        >
                          <option value="General">General</option>
                          <option value="Math">Math</option>
                          <option value="Programming">Programming</option>
                          <option value="English">English</option>
                          <option value="Science">Science</option>
                          <option value="History">History</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 text-white px-4 py-1.5 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        {item.description && (
                          <p className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {item.description}
                          </p>
                        )}
                        {item.dueDate && (
                          <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Due: {item.dueDate}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${
                              item.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.status}
                          </span>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${getPriorityColor(
                              item.priority || "Medium"
                            )}`}
                          >
                            {item.priority || "Medium"}
                          </span>
                          <span className="inline-block px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                            {item.subject || "General"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-right">
                        <button
                          onClick={() => handleGenerateStudyPlan(item)}
                          className="text-purple-500 hover:text-purple-400 text-sm font-medium"
                        >
                          {item.studyPlan ? "Regenerate Plan" : "Generate Study Plan"}
                        </button>

                        {item.studyPlan && (
                          <button
                            onClick={() => handleViewSavedPlan(item)}
                            className="text-green-500 hover:text-green-400 text-sm font-medium"
                          >
                            View Saved Plan
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          className="text-blue-500 hover:text-blue-400 text-sm font-medium"
                        >
                          {item.status === "Pending" ? "Mark Completed" : "Mark Pending"}
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="text-indigo-500 hover:text-indigo-400 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-400 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Simple Calendar View ===== */}
        <div
          className={`p-6 rounded-xl shadow mb-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">Calendar – Due Dates</h2>

          {Object.keys(assignmentsByDate).length === 0 ? (
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              No assignments with due dates yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(assignmentsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, items]) => (
                  <div
                    key={date}
                    className={`border rounded-lg p-4 ${
                      darkMode
                        ? "border-gray-700 bg-gray-700"
                        : "border-indigo-100 bg-indigo-50"
                    }`}
                  >
                    <p
                      className={`font-semibold mb-2 ${
                        darkMode ? "text-indigo-400" : "text-indigo-700"
                      }`}
                    >
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <ul className="space-y-1">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className={`text-sm flex items-center gap-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.status === "Completed"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          ></span>
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* AI Study Plan Result */}
        {(generating || studyPlan) && (
          <div
            className={`p-6 rounded-xl shadow mb-8 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4 text-purple-500">
              AI Study Plan
              {selectedAssignment && (
                <span className={`font-normal text-base ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {" "}for: {selectedAssignment.title}
                </span>
              )}
            </h2>

            {generating ? (
              <div className="flex items-center gap-3 py-6">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  Generating study plan with AI... Please wait.
                </p>
              </div>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed">
                {studyPlan}
              </div>
            )}
          </div>
        )}

        {/* ===== AI Chat Assistant ===== */}
        {studyPlan && !generating && (
          <div
            className={`p-6 rounded-xl shadow mb-8 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4 text-purple-500">
              Ask AI about this Study Plan
            </h2>

            <div
              className={`h-64 overflow-y-auto mb-4 p-4 rounded-lg space-y-3 ${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              {chatMessages.length === 0 ? (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Ask any follow-up question about the study plan above...
                </p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white ml-auto"
                        : darkMode
                        ? "bg-gray-600 text-white"
                        : "bg-white border text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))
              )}

              {chatLoading && (
                <div className="flex items-center gap-2 text-sm text-purple-500">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  AI is thinking...
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Ask a question about the study plan..."
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
              <button
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========== FLOATING TIMER ========== */}
      {showTimer && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-48 rounded-2xl shadow-2xl p-4 ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <p className="text-xs text-center mb-1 font-medium">
            {isBreak ? "☕ Break" : "🎯 Focus"}
          </p>

          <p className="text-3xl font-bold text-center text-purple-500 mb-3">
            {formatTime(timeLeft)}
          </p>

          <div className="flex justify-center gap-1 mb-3">
            {[15, 25, 45].map((min) => (
              <button
                key={min}
                onClick={() => changeTime(min)}
                disabled={isRunning}
                className={`text-xs px-2 py-1 rounded ${
                  selectedMinutes === min
                    ? "bg-purple-600 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {min}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600"
              >
                Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-yellow-500 text-white text-xs px-3 py-1 rounded hover:bg-yellow-600"
              >
                Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="bg-gray-500 text-white text-xs px-3 py-1 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </main>
  );
}