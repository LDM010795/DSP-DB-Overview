/**
 * Hauptanwendung für DSP Database Overview
 *
 * Diese Komponente orchestriert die gesamte Anwendung:
 * - React Router für Navigation
 * - Layout und Seiten-Komponenten
 * - Fehlerbehandlung auf Anwendungsebene
 * - Responsive Design
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy Loading für bessere Performance
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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <React.Suspense fallback={<div>Loading…</div>}>
                  <Login />
                </React.Suspense>
              }
            />
            <Route
              path="/tables"
              element={
                <ProtectedRoute>
                  <React.Suspense
                    fallback={
                      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-8 shadow-sm border">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d] mx-auto mb-4"></div>
                            <p className="text-gray-600">
                              Lade Tabellen-Browser...
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <TableBrowser />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <React.Suspense
                    fallback={
                      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-8 shadow-sm border">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d] mx-auto mb-4"></div>
                            <p className="text-gray-600">Lade Statistiken...</p>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <Statistics />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning"
              element={
                <ProtectedRoute>
                  <React.Suspense
                    fallback={
                      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-8 shadow-sm border">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d] mx-auto mb-4"></div>
                            <p className="text-gray-600">
                              Lade Lernplattform...
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <LearningManagement />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <React.Suspense
                    fallback={
                      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-8 shadow-sm border">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d] mx-auto mb-4"></div>
                            <p className="text-gray-600">
                              Lade Mitarbeiterverwaltung...
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <EmployeeManagement />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tool-management"
              element={
                <ProtectedRoute>
                  <React.Suspense
                    fallback={
                      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-8 shadow-sm border">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d] mx-auto mb-4"></div>
                            <p className="text-gray-600">
                              Lade Tool-Verwaltung...
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <ToolManagement />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
