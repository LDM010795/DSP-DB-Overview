/**
 * Edit Modal Component - DSP Database Overview Frontend
 *
 * Modal-Komponente für Bearbeitungs-Dialoge:
 * - Overlay mit Backdrop-Blur
 * - Responsive Design
 * - Accessibility-Features
 * - Flexible Content-Bereiche
 * 
 * Features:
 * - Backdrop-Blur für bessere UX
 * - Responsive Design
 * - Accessibility-Features
 * - Scrollbare Content-Bereiche
 * - TypeScript-Typisierung
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";

// --- Komponenten-Interface ---

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Edit Modal Komponente
 * 
 * Modal-Dialog für Bearbeitungs-Formulare mit Overlay,
 * Backdrop-Blur und responsivem Design.
 */
const EditModal: React.FC<EditModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  // Modal nicht anzeigen wenn geschlossen
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
        {/* --- Modal-Header --- */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button 
            onClick={onClose} 
            aria-label="Schließen" 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* --- Modal-Content --- */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default EditModal; 