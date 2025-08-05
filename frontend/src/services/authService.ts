/**
 * Authentication Service für DSP Database Overview
 *
 * Dieser Service verwaltet die Authentifizierung und Autorisierung:
 * - JWT Token-basierte Authentifizierung
 * - Login/Logout-Funktionalität
 * - Token-Speicherung und -Validierung
 * - Integration mit dem E-Learning-Backend
 *
 * Features:
 * - Sichere Token-Verwaltung
 * - Automatische Token-Validierung
 * - Integration mit localStorage
 * - Fehlerbehandlung für Authentifizierungsfehler
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import axios from "axios";

// --- Konfiguration ---

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

// --- Typen ---

export interface TokenResponse {
  access: string;
  refresh: string;
  user_id?: number;
  username?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  force_password_change?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// --- Authentication Service ---

export const authService = {
  /**
   * Benutzer anmelden und JWT-Token erhalten
   *
   * @param username - Benutzername
   * @param password - Passwort
   * @returns Promise mit Token-Response
   */
  async login(username: string, password: string): Promise<TokenResponse> {
    try {
      const res = await axios.post<TokenResponse>(
        `${BASE_URL}/elearning/token/`,
        {
          username,
          password,
        }
      );

      // Token im localStorage speichern
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      return res.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  /**
   * Benutzer abmelden und Token entfernen
   */
  logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    console.log("User logged out successfully");
  },

  /**
   * Prüfen ob Benutzer authentifiziert ist
   *
   * @returns true wenn Token vorhanden, false sonst
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("access");
  },

  /**
   * Aktuellen Access-Token abrufen
   *
   * @returns Access-Token oder null
   */
  getAccessToken(): string | null {
    return localStorage.getItem("access");
  },

  /**
   * Refresh-Token abrufen
   *
   * @returns Refresh-Token oder null
   */
  getRefreshToken(): string | null {
    return localStorage.getItem("refresh");
  },
};
