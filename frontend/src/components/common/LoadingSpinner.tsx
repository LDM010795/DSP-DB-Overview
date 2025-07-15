/**
 * Loading Spinner Component - DSP Database Overview Frontend
 *
 * Vielseitige Loading-Komponente für verschiedene Anwendungsfälle:
 * - Verschiedene Größen (xs, sm, md, lg, xl)
 * - Verschiedene Varianten (primary, secondary, white)
 * - Text-Integration
 * - Fullscreen und Overlay-Modi
 * 
 * Features:
 * - Responsive Design
 * - DSP-Branding-Farben
 * - Accessibility-Features
 * - Flexible Einsatzmöglichkeiten
 * - TypeScript-Typisierung
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import clsx from "clsx";

// --- Komponenten-Interface ---

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "white";
  text?: string;
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

/**
 * Loading Spinner Komponente
 * 
 * Zeigt einen animierten Spinner mit optionalem Text an.
 * Unterstützt verschiedene Größen, Varianten und Anzeigemodi.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "primary",
  text,
  className = "",
  fullScreen = false,
  overlay = false,
}) => {
  // --- CSS-Klassen-Konfiguration ---
  
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variantClasses = {
    primary: "border-dsp-orange border-t-transparent",
    secondary: "border-gray-400 border-t-transparent",
    white: "border-white border-t-transparent",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  // --- Spinner-Komponente ---
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-2">
      {/* --- Spinner-Animation --- */}
      <div
        className={clsx(
          "animate-spin rounded-full border-2",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      
      {/* --- Optionaler Text --- */}
      {text && (
        <p className={clsx("font-medium text-gray-600", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  // --- Fullscreen-Modus ---
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  // --- Overlay-Modus ---
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        {spinner}
      </div>
    );
  }

  // --- Standard-Modus ---
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
