/**
 * Primary Button Component - DSP Database Overview Frontend
 *
 * Haupt-Button-Komponente mit DSP-Orange Design:
 * - Solid und Outline-Varianten
 * - Verschiedene Größen (sm, md, lg)
 * - Icon-Integration (links/rechts)
 * - Loading-States mit Spinner
 * - Accessibility-Features
 * 
 * Features:
 * - DSP-Branding-Farben (Orange)
 * - Responsive Design
 * - Focus-States für Accessibility
 * - Disabled-States
 * - TypeScript-Typisierung
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import clsx from "clsx";

// --- Komponenten-Interface ---

interface ButtonPrimaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

/**
 * Primary Button Komponente
 * 
 * Haupt-Button mit DSP-Orange Design für wichtige Aktionen
 * wie Submit, Save, Create etc.
 */
const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  size = "md",
  variant = "solid",
  className = "",
  type = "button",
  ariaLabel,
}) => {
  // --- CSS-Klassen-Konfiguration ---
  
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dsp-orange";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    solid:
      "bg-dsp-orange text-white hover:bg-dsp-orange_medium disabled:bg-gray-300",
    outline:
      "border-2 border-dsp-orange text-dsp-orange hover:bg-dsp-orange_light disabled:border-gray-300 disabled:text-gray-400",
  };

  const iconClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* --- Loading Spinner --- */}
      {loading ? (
        <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-5 h-5 mr-2" />
      ) : (
        /* --- Left Icon --- */
        icon &&
        iconPosition === "left" && (
          <span className={clsx(iconClasses[size], children && "mr-2")}>
            {icon}
          </span>
        )
      )}

      {/* --- Button Content --- */}
      {children}

      {/* --- Right Icon --- */}
      {!loading && icon && iconPosition === "right" && (
        <span className={clsx(iconClasses[size], children && "ml-2")}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default ButtonPrimary;
