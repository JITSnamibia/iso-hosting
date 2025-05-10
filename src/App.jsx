// src/App.jsx
import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return user ? <Dashboard /> : <AuthPage />;
}