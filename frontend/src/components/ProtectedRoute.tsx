/**
 * Protected Route Component - DSP Database Overview
 *
 * Diese Komponente schützt Routen vor unbefugtem Zugriff:
 * - Authentifizierungsprüfung
 * - Automatische Weiterleitung zur Login-Seite
 * - State-Preservation für bessere UX
 *
 * Features:
 * - Automatische Authentifizierungsprüfung
 * - Redirect zur Login-Seite bei fehlender Authentifizierung
 * - State-Preservation für bessere Benutzererfahrung
 * - Integration mit React Router
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

interface ProtectedRouteProps {
  children: JSX.Element;
}

/**
 * Protected Route Komponente für Authentifizierungsschutz
 *
 * Prüft ob der Benutzer authentifiziert ist und leitet bei fehlender
 * Authentifizierung zur Login-Seite weiter.
 *
 * @param children - Zu schützende Komponente
 * @returns Geschützte Komponente oder Redirect zur Login-Seite
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  // Authentifizierung prüfen
  if (!authService.isAuthenticated()) {
    // Zur Login-Seite weiterleiten mit aktueller Location als State
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Authentifiziert - geschützte Komponente rendern
  return children;
};

export default ProtectedRoute;
