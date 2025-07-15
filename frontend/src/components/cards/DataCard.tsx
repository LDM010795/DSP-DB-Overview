/**
 * Data Card Component - DSP Database Overview Frontend
 *
 * Allgemeine Datenkarten-Komponente für verschiedene Inhalte:
 * - Verschiedene Varianten (default, elevated, outlined)
 * - Verschiedene Padding-Optionen (none, sm, md, lg)
 * - Collapsible-Funktionalität
 * - Header mit Icon und Actions
 * - Flexible Content-Bereiche
 * 
 * Features:
 * - Responsive Design
 * - Collapsible-Funktionalität
 * - Flexible Layout-Optionen
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

interface DataCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * Data Card Komponente
 * 
 * Allgemeine Karten-Komponente für verschiedene Arten von Inhalten.
 * Unterstützt Header, Actions, Collapsible-Funktionalität und flexible Layouts.
 */
const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  children,
  icon,
  actions,
  variant = "default",
  padding = "md",
  className = "",
  headerClassName = "",
  contentClassName = "",
  collapsible = false,
  defaultCollapsed = false,
}) => {
  // --- State Management ---
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  // --- CSS-Klassen-Konfiguration ---
  
  const baseClasses = "bg-white rounded-lg transition-all duration-200";

  const variantClasses = {
    default: "border border-gray-200",
    elevated: "shadow-lg border border-gray-100",
    outlined: "border-2 border-gray-200",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const contentPaddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4 pt-0",
    lg: "p-6 pt-0",
  };

  // --- Event Handler ---
  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={clsx(baseClasses, variantClasses[variant], className)}>
      {/* --- Header-Bereich --- */}
      <div
        className={clsx(
          "flex items-center justify-between",
          paddingClasses[padding],
          collapsible && "cursor-pointer hover:bg-gray-50 rounded-t-lg",
          headerClassName
        )}
        onClick={handleToggle}
      >
        {/* --- Header-Content --- */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 w-5 h-5 text-gray-500">{icon}</div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* --- Actions und Collapse-Button --- */}
        <div className="flex items-center space-x-2">
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
          {collapsible && (
            <button
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              <svg
                className={clsx(
                  "w-4 h-4 transition-transform duration-200",
                  isCollapsed ? "rotate-0" : "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* --- Content-Bereich --- */}
      {(!collapsible || !isCollapsed) && (
        <div className={clsx(contentPaddingClasses[padding], contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
};

export default DataCard;
