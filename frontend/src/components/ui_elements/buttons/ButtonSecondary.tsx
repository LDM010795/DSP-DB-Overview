/**
 * Secondary Button Component - DSP Database Overview Frontend
 *
 * Sekundäre Button-Komponente für weniger wichtige Aktionen:
 * - Ghost, Outline und Subtle-Varianten
 * - Verschiedene Größen (sm, md, lg)
 * - Icon-Integration (links/rechts)
 * - Icon-only Support
 * - Loading-States mit Spinner
 * 
 * Features:
 * - Neutrale Farbgebung für sekundäre Aktionen
 * - Icon-only Button Support
 * - Responsive Design
 * - Accessibility-Features
 * - TypeScript-Typisierung
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import clsx from "clsx";

// --- Komponenten-Interface ---

interface ButtonSecondaryProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "subtle";
  className?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

/**
 * Secondary Button Komponente
 * 
 * Sekundärer Button für weniger wichtige Aktionen wie Cancel,
 * Edit, Delete etc. Unterstützt auch Icon-only Buttons.
 */
const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  size = "md",
  variant = "ghost",
  className = "",
  type = "button",
  ariaLabel,
}) => {
  // --- CSS-Klassen-Konfiguration ---
  
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    ghost: "text-gray-700 hover:bg-gray-100 disabled:text-gray-400",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400",
    subtle:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400",
  };

  const iconClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // --- Icon-only Button Konfiguration ---
  const isIconOnly = !children;
  const iconOnlyPadding = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || (isIconOnly ? "Button" : undefined)}
      className={clsx(
        baseClasses,
        isIconOnly ? iconOnlyPadding[size] : sizeClasses[size],
        variantClasses[variant],
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* --- Loading Spinner --- */}
      {loading ? (
        <div className="animate-spin rounded-full border-2 border-gray-400 border-t-transparent w-5 h-5 mr-2" />
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

export default ButtonSecondary;
