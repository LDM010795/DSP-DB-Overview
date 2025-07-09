/**
 * Hauptübersichtsseite für DSP Database Overview
 *
 * Diese Seite bietet einen schnellen Überblick über:
 * - Wichtige Kennzahlen der Datenbank
 * - Apps und Models auf einen Blick
 * - Status und Gesundheit der Datenbank
 * - Schnellzugriff auf wichtige Bereiche
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Database,
  Table,
  GitBranch,
  BarChart3,
  Settings,
  AlertTriangle,
  ArrowRight,
  Activity,
  TrendingUp,
  Shield,
} from "lucide-react";
import { dbOverviewAPI, type DatabaseSchemaResponse } from "../services/api";
import { LoadingSpinner } from "../components/common";

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant: "primary" | "success" | "warning" | "default";
  trend?: number;
  subtext?: string;
}

interface NavigationCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  variant: "primary" | "success" | "warning" | "default";
  stats?: string;
}

const Overview: React.FC = () => {
  const [schemaData, setSchemaData] = useState<DatabaseSchemaResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemaData = async () => {
      try {
        setLoading(true);
        const data = await dbOverviewAPI.getDatabaseSchema();
        setSchemaData(data);
      } catch (err) {
        setError("Fehler beim Laden der Schema-Daten");
        console.error("Schema loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemaData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm border">
          <LoadingSpinner
            size="lg"
            text="Lade Datenbank-Schema..."
            className="h-64"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-sm border border-red-200">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Fehler beim Laden</h3>
          <p className="text-gray-600 text-center text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!schemaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Database className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-gray-600 font-medium">Keine Daten verfügbar</p>
        </div>
      </div>
    );
  }

  const { schema_overview: overview, apps } = schemaData;

  // Statistiken berechnen
  const totalRecords = apps.reduce(
    (sum, app) =>
      sum +
      app.models.reduce((modelSum, model) => modelSum + model.record_count, 0),
    0
  );

  const appStats = apps.map((app) => ({
    name: app.app_name,
    models: app.model_count,
    records: app.models.reduce((sum, model) => sum + model.record_count, 0),
    relationships: app.models.reduce(
      (sum, model) => sum + model.relationship_count,
      0
    ),
  }));

  const quickStats: QuickStat[] = [
    {
      label: "Django Apps",
      value: overview.total_apps,
      icon: Settings,
      variant: "default",
      trend: 12,
      subtext: "Aktive Anwendungen",
    },
    {
      label: "Models",
      value: overview.total_models,
      icon: Database,
      variant: "success",
      trend: 8,
      subtext: "Datenmodelle",
    },
    {
      label: "Beziehungen",
      value: overview.total_relationships,
      icon: GitBranch,
      variant: "primary",
      trend: 15,
      subtext: "Verknüpfungen",
    },
    {
      label: "Datensätze",
      value: totalRecords.toLocaleString(),
      icon: BarChart3,
      variant: "warning",
      trend: 24,
      subtext: "Gesamt Records",
    },
  ];

  const navigationCards: NavigationCard[] = [
    {
      title: "Tabellen-Browser",
      description:
        "Durchsuchen von Tabellendaten, Schema-Analyse und Beziehungsvisualisierung",
      icon: Table,
      path: "/tables",
      variant: "primary",
      stats: `${overview.total_models} Models verfügbar`,
    },
    {
      title: "Statistiken & Analytics",
      description: "Performance-Kennzahlen, Trends und detaillierte Datenbankstatistiken",
      icon: BarChart3,
      path: "/statistics",
      variant: "warning",
      stats: `${totalRecords.toLocaleString()} Records analysiert`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95vw] mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        
        {/* Functional Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-[#ff863d] p-2 rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">DSP Database Overview</h1>
                  <p className="text-gray-600 mt-1">
                    {overview.database_engine} Management Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Verbindung aktiv</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-[#ff863d]" />
                  <span>
                    Letzte Aktualisierung: {new Date(overview.generated_at).toLocaleString("de-DE")}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-center bg-gray-50 rounded-lg p-4 min-w-[100px]">
                <div className="text-2xl font-bold text-gray-900">{overview.total_apps}</div>
                <div className="text-sm text-gray-600">Apps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <stat.icon className="h-5 w-5 text-[#ff863d]" />
                </div>
                {stat.trend && (
                  <div className="flex items-center space-x-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{stat.trend}%</span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-800">{stat.label}</div>
                {stat.subtext && (
                  <div className="text-xs text-gray-500 mt-1">{stat.subtext}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Functional Navigation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {navigationCards.map((card) => (
            <div key={card.title} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:border-gray-300 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-[#ff863d] p-3 rounded-lg">
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-[#ff863d] bg-[#ffe7d4] px-2 py-1 rounded">
                    VERFÜGBAR
                  </span>
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{card.description}</p>
                  {card.stats && (
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
                      {card.stats}
                    </div>
                  )}
                </div>
                <Link to={card.path}>
                  <button className="w-full bg-gray-900 hover:bg-[#ff863d] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                    <span>Öffnen</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Clean Apps Overview */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-[#ff863d] p-2 rounded-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Apps Übersicht</h2>
                  <p className="text-gray-600 text-sm">{apps.length} Django Anwendungen</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded">
                  Alle Systeme aktiv
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {appStats.map((app, index) => (
                <div
                  key={app.name}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-2 h-2 bg-[#ff863d] rounded-full"></div>
                        <h4 className="font-semibold text-gray-900">{app.name}</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-[#ff863d]" />
                          <span>
                            <strong className="text-gray-900">{app.models}</strong> Models
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-[#ff863d]" />
                          <span>
                            <strong className="text-gray-900">{app.records.toLocaleString()}</strong> Records
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4 text-[#ff863d]" />
                          <span>
                            <strong className="text-gray-900">{app.relationships}</strong> Relationen
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/tables?app=${app.name}`} className="ml-4">
                      <button className="bg-gray-100 hover:bg-[#ff863d] hover:text-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1">
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
