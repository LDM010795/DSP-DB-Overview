/**
 * Login Page Component - DSP Database Overview
 *
 * Diese Komponente stellt die Authentifizierungsseite bereit:
 * - Benutzeranmeldung mit JWT-Token
 * - Formularvalidierung und Fehlerbehandlung
 * - Responsive Design mit moderner UI
 * - Automatische Weiterleitung nach erfolgreicher Anmeldung
 *
 * Features:
 * - Sichere Authentifizierung über JWT-Tokens
 * - Benutzerfreundliche Fehlerbehandlung
 * - Responsive Design für alle Geräte
 * - Automatische Navigation nach Login
 * - State-Preservation für bessere UX
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React, { useState } from "react";
import { authService } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Login-Komponente für die Benutzerauthentifizierung
 *
 * Ermöglicht die Anmeldung von Administratoren und Benutzern
 * mit automatischer Weiterleitung zur ursprünglich angefragten Seite.
 */
const Login: React.FC = () => {
  // --- State Management ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Navigation und Location ---
  const navigate = useNavigate();
  const location = useLocation();

  // Ursprünglich angefragte Seite aus dem State holen
  const from = location.state?.from?.pathname || "/";

  /**
   * Formular-Submit-Handler für die Authentifizierung
   *
   * @param e - Formular-Event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Bitte füllen Sie alle Felder aus.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Authentifizierung durchführen
      const tokens = await authService.login(username, password);

      // Token im localStorage speichern
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);

      // Zur ursprünglich angefragten Seite weiterleiten
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Login fehlgeschlagen – bitte Daten prüfen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-sm overflow-hidden">
        {/* --- Header-Bereich --- */}
        <div className="relative p-6 text-center bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
          <div className="absolute inset-0 bg-[#ff863d] opacity-10"></div>
          <div className="relative">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Admin-Login
            </h1>
            <p className="text-xs text-white/80 mt-1">DSP Database Overview</p>
          </div>
        </div>

        {/* --- Formular-Bereich --- */}
        <div className="p-8">
          {/* Fehlermeldung */}
          {error && (
            <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
          )}

          {/* Login-Formular */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Benutzername-Feld */}
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
                disabled={isLoading}
              />
            </div>

            {/* Passwort-Feld */}
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
                disabled={isLoading}
              />
            </div>

            {/* Submit-Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center bg-[#ff863d] hover:bg-[#ed7c34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff863d]"
            >
              {isLoading ? "Anmeldung..." : "Einloggen"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
