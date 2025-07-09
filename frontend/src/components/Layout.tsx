/**
 * Hauptlayout für DSP Database Overview
 *
 * Dieses Layout bietet eine professionelle Oberfläche mit:
 * - Responsives Design
 * - Seitenleiste mit Navigation
 * - Moderne UI-Elemente
 * - Konsistente Gestaltung
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Database,
  Table,
  BarChart3,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Activity,
  FilePlus,
  Users,
  Wrench, // Hinzufügen
} from "lucide-react";
import { authService } from "../services/authService";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isAuthed = authService.isAuthenticated();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Für Mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // Für Desktop
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false); // Manuell eingeklappt
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Automatisches Einklappen bei kleinen Bildschirmen
  useEffect(() => {
    const handleResize = () => {
      const sidebarWidth = isCollapsed ? 80 : 280; // Leicht verbreitert für bessere Proportionen
      const minContentWidth = 600; // Mindestbreite für Hauptinhalt
      const totalRequired = sidebarWidth + minContentWidth;

      if (window.innerWidth < totalRequired) {
        // Automatisch einklappen wenn nicht genug Platz
        if (!isCollapsed) {
          setIsCollapsed(true);
        }
      } else {
        // Bei ausreichend Platz: nur erweitern wenn nicht manuell eingeklappt
        if (isCollapsed && !isManuallyCollapsed) {
          setIsCollapsed(false);
        }
      }
    };

    // Initial check
    handleResize();

    // Event listener hinzufügen
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed, isManuallyCollapsed]);

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    setIsManuallyCollapsed(newCollapsedState); // Merken dass es manuell gesetzt wurde
  };

  const navigationItems: NavigationItem[] = [
    {
      path: "/",
      label: "Dashboard",
      icon: Home,
      description: "Gesamtübersicht & Kennzahlen",
      badge: "Live",
    },
    {
      path: "/tables",
      label: "Tabellen-Browser",
      icon: Table,
      description: "Daten durchsuchen & analysieren",
    },
    {
      path: "/statistics",
      label: "Analytics",
      icon: BarChart3,
      description: "Performance & Statistiken",
    },
    {
      path: "/learning",
      label: "Lernplattform",
      icon: FilePlus,
      description: "Module & Inhalte verwalten",
    },
    {
      path: "/employees",
      label: "Mitarbeiter",
      icon: Users,
      description: "Abteilungen & Mitarbeiter verwalten",
    },
    {
      path: "/tool-management",
      label: "Tool-Verwaltung",
      icon: Wrench,
      description: "Zugriffe & Tools verwalten",
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  if (!isAuthed) {
    // Einfaches Layout ohne Sidebar
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const sidebarClasses = clsx(
    "fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out",
    // Mobile
    isSidebarOpen ? "translate-x-0" : "-translate-x-full",
    // Desktop
    "lg:translate-x-0",
    isCollapsed ? "w-20" : "w-70"
  );

  const mainContentClasses = clsx(
    "transition-all duration-300 ease-in-out min-h-screen bg-gray-50",
    isCollapsed ? "lg:ml-20" : "lg:ml-70"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={sidebarClasses}
        style={{
          minWidth: isCollapsed ? "80px" : "280px",
          maxWidth: isCollapsed ? "80px" : "280px",
          width: isCollapsed ? "80px" : "280px",
        }}
      >
        {/* Enhanced Header */}
        <div className="h-20 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#ff863d] opacity-10"></div>
          <div className="relative flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ff863d] rounded-lg blur-sm opacity-30"></div>
                <div className="relative bg-[#ff863d] p-2 rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-white">DSP Database</h1>
                  <p className="text-xs text-gray-300">Overview Platform</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Desktop Collapse Toggle */}
              <button
                onClick={handleToggleCollapse}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label={
                  isCollapsed ? "Sidebar erweitern" : "Sidebar einklappen"
                }
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
              {/* Mobile Close Button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label="Sidebar schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Professional Navigation */}
        <nav className="py-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={clsx(
                    "group relative flex items-center rounded-xl transition-all duration-200",
                    isCollapsed
                      ? "justify-center p-3 mx-1"
                      : "space-x-3 px-4 py-3 mx-1",
                    isActive
                      ? "bg-[#ff863d] text-white shadow-lg shadow-[#ff863d]/25"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="relative">
                    <Icon
                      className={clsx(
                        "h-5 w-5 transition-all duration-200",
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-[#ff863d]"
                      )}
                    />
                    {isActive && (
                      <div className="absolute -inset-1 bg-white/20 rounded-lg blur-sm"></div>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={clsx(
                            "text-sm font-semibold truncate",
                            isActive
                              ? "text-white"
                              : "text-gray-900 group-hover:text-gray-900"
                          )}
                        >
                          {item.label}
                        </p>
                        {item.badge && (
                          <span
                            className={clsx(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-green-100 text-green-700"
                            )}
                          >
                            <Activity className="h-2 w-2 mr-1" />
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={clsx(
                          "text-xs mt-0.5 truncate",
                          isActive
                            ? "text-white/80"
                            : "text-gray-500 group-hover:text-gray-600"
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Enhanced Tooltip für collapsed Modus */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 shadow-xl">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-300 mt-0.5">
                        {item.description}
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full">
                        <div className="border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white/40 rounded-r-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* System Status Section */}
        {!isCollapsed && (
          <div className="px-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">
                  System Status
                </span>
              </div>
              <div className="text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Database</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>API</span>
                  <span className="text-green-600 font-medium">Aktiv</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-gray-50/50">
          <div className="p-4">
            <div
              className={clsx(
                "flex items-center",
                isCollapsed ? "justify-center" : "space-x-3"
              )}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ff863d] to-[#fa8c45] rounded-xl flex items-center justify-center shadow-sm">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    DSP Platform
                  </p>
                  <p className="text-xs text-gray-500">v2.1.0 • Enterprise</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="mt-4 w-full inline-flex items-center justify-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={mainContentClasses}>
        {/* Enhanced Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Sidebar öffnen"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-[#ff863d]" />
              <h2 className="text-lg font-bold text-gray-900">
                DSP Database Overview
              </h2>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page Content */}
        <main className="w-full overflow-x-auto">{children}</main>
      </div>

      {/* Enhanced Sidebar Overlay für Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Layout;
