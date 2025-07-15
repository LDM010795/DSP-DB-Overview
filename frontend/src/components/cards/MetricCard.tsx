/**
 * Metric Card Component - DSP Database Overview Frontend
 *
 * Karten-Komponente für Kennzahlen und Metriken:
 * - Verschiedene Varianten (default, primary, success, warning, danger)
 * - Trend-Anzeige mit Prozentangaben
 * - Icon-Integration
 * - Verschiedene Größen (sm, md, lg)
 * - Klickbare Karten
 * 
 * Features:
 * - DSP-Branding-Farben
 * - Responsive Design
 * - Trend-Visualisierung
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

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

/**
 * Metric Card Komponente
 * 
 * Zeigt Kennzahlen und Metriken in einer übersichtlichen Karte an.
 * Unterstützt Trends, Icons und verschiedene Varianten.
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  variant = "default",
  size = "md",
  className = "",
  onClick,
}) => {
  // --- CSS-Klassen-Konfiguration ---
  
  const baseClasses =
    "bg-white rounded-lg border shadow-sm transition-all duration-200";

  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantClasses = {
    default: "border-gray-200 hover:shadow-md",
    primary: "border-dsp-orange_light bg-dsp-orange_light/5",
    success: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    danger: "border-red-200 bg-red-50",
  };

  const iconVariantClasses = {
    default: "text-gray-500",
    primary: "text-dsp-orange",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  };

  // --- Komponenten-Typ bestimmen ---
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        onClick && "cursor-pointer hover:shadow-lg",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* --- Header mit Icon --- */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {icon && (
              <div className={clsx("w-5 h-5", iconVariantClasses[variant])}>
                {icon}
              </div>
            )}
          </div>

          {/* --- Wert und Trend --- */}
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={clsx(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%{trend.label && ` ${trend.label}`}
              </span>
            )}
          </div>

          {/* --- Beschreibung --- */}
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </Component>
  );
};

export default MetricCard;
