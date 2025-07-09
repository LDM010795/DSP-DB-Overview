import React, { useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tokens = await authService.login(username, password);
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);
      navigate("/");
    } catch (err) {
      setError("Login fehlgeschlagen – bitte Daten prüfen.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
          <div className="absolute inset-0 bg-[#ff863d] opacity-10"></div>
          <div className="relative">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Admin-Login
            </h1>
            <p className="text-xs text-white/80 mt-1">DSP Database Overview</p>
          </div>
        </div>
        <div className="p-8">
          {error && (
            <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Benutzername
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff863d] focus:border-[#ff863d] shadow-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff863d] focus:border-[#ff863d] shadow-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center bg-[#ff863d] hover:bg-[#ed7c34] transition-colors text-white font-semibold py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff863d]"
            >
              Einloggen
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
