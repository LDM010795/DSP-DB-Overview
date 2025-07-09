import React from "react";
import clsx from "clsx";

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
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

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

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={clsx(baseClasses, variantClasses[variant], className)}>
      {/* Header */}
      <div
        className={clsx(
          "flex items-center justify-between",
          paddingClasses[padding],
          collapsible && "cursor-pointer hover:bg-gray-50 rounded-t-lg",
          headerClassName
        )}
        onClick={handleToggle}
      >
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

      {/* Content */}
      {(!collapsible || !isCollapsed) && (
        <div className={clsx(contentPaddingClasses[padding], contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
};

export default DataCard;
