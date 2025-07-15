/**
 * DSP Database Overview Frontend - Hauptanwendung
 *
 * Diese Komponente orchestriert die gesamte Anwendung:
 * - React Router für Navigation und Routing
 * - Layout und Seiten-Komponenten
 * - Fehlerbehandlung auf Anwendungsebene
 * - Lazy Loading für bessere Performance
 * - Responsive Design und Loading-States
 * 
 * Features:
 * - Geschützte Routen mit Authentifizierung
 * - Lazy Loading für optimale Performance
 * - Einheitliche Loading-States
 * - Error Boundary für Fehlerbehandlung
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// --- Lazy Loading für bessere Performance ---

const TableBrowser = React.lazy(() => import("./pages/TableBrowserRefactored"));
const Statistics = React.lazy(() => import("./pages/Statistics"));
const LearningManagement = React.lazy(
  () => import("./pages/LearningManagement")
);
const EmployeeManagement = React.lazy(
  () => import("./pages/EmployeeManagement")
);
const Login = React.lazy(() => import("./pages/Login"));
const ToolManagement = React.lazy(() => import("./pages/tool_management"));

// --- Loading Fallback Komponente ---

const LoadingFallback: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-8 shadow-sm border">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d] mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  </div>
);

// --- Hauptanwendungskomponente ---

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            {/* --- Geschützte Routen --- */}
            
            {/* Übersichtsseite */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              }
            />
            
            {/* Tabellen-Browser */}
            <Route
              path="/tables"
              element={
                <ProtectedRoute>
                  <React.Suspense fallback={<LoadingFallback message="Lade Tabellen-Browser..." />}>
                    <TableBrowser />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
            
            {/* Statistiken */}
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <React.Suspense fallback={<LoadingFallback message="Lade Statistiken..." />}>
                    <Statistics />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
            
            {/* Lernplattform */}
            <Route
              path="/learning"
              element={
                <ProtectedRoute>
                  <React.Suspense fallback={<LoadingFallback message="Lade Lernplattform..." />}>
                    <LearningManagement />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
            
            {/* Mitarbeiterverwaltung */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <React.Suspense fallback={<LoadingFallback message="Lade Mitarbeiterverwaltung..." />}>
                    <EmployeeManagement />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
            
            {/* Tool-Verwaltung */}
            <Route
              path="/tool-management"
              element={
                <ProtectedRoute>
                  <React.Suspense fallback={<LoadingFallback message="Lade Tool-Verwaltung..." />}>
                    <ToolManagement />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
            
            {/* --- Öffentliche Routen --- */}
            
            {/* Login-Seite */}
            <Route
              path="/login"
              element={
                <React.Suspense fallback={<LoadingFallback message="Lade Login..." />}>
                  <Login />
                </React.Suspense>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
