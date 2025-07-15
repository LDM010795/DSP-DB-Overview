/**
 * Error Boundary Component - DSP Database Overview
 *
 * Diese Komponente fängt JavaScript-Fehler in der gesamten Anwendung ab
 * und zeigt eine benutzerfreundliche Fehlermeldung an.
 * 
 * Features:
 * - Globale Fehlerbehandlung für die gesamte Anwendung
 * - Benutzerfreundliche Fehlermeldungen
 * - Technische Details für Entwickler
 * - Automatische Fehlerprotokollierung
 * - Reload-Funktionalität für einfache Wiederherstellung
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

// --- Komponenten-Interfaces ---

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// --- Error Boundary Klasse ---

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Statische Methode zur Fehlerbehandlung
   * Wird aufgerufen wenn ein Fehler in der Komponenten-Hierarchie auftritt
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Lifecycle-Methode für Fehlerprotokollierung
   * Wird aufgerufen nach einem Fehler für Logging-Zwecke
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  /**
   * Seite neu laden bei Fehlern
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    // --- Fehlerfall-Rendering ---
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            {/* Fehler-Icon */}
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            
            {/* Fehlermeldung */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Etwas ist schiefgelaufen
            </h1>
            <p className="text-gray-600 mb-6">
              Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es
              erneut.
            </p>
            
            {/* Technische Details (aufklappbar) */}
            {this.state.error && (
              <details className="text-left mb-6">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technische Details
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            
            {/* Reload-Button */}
            <button
              onClick={this.handleReload}
              className="flex items-center space-x-2 bg-dsp-orange hover:bg-dsp-orange_medium text-white font-medium py-3 px-6 rounded-lg transition-colors mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Seite neu laden</span>
            </button>
          </div>
        </div>
      );
    }

    // --- Normaler Fall - Children rendern ---
    return this.props.children;
  }
}

export default ErrorBoundary;
