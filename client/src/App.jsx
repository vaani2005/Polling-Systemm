import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import CreatePoll from "./components/CreatePoll";
import "./css/Login.css";
import "./css/Register.css";
import "./css/PollList.css";
import "./css/CreatePoll.css";
import PollPage from "./pages/PollPage";
import "./css/Header.css";
import "./css/Footer.css";
export default function App() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return <Navigate to="/login" />;
    }

    return children;
  };
  return (
    <Routes>
      <Route path="/polls" element={<PollPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreatePoll />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <CreatePoll />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/polls" />} />
    </Routes>
  );
}
