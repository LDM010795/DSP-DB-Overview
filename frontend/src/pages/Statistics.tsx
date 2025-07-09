/**
 * Statistiken Seite - Performance-Kennzahlen und Datenbankstatistiken
 *
 * Diese Seite zeigt:
 * - Datenbankstatistiken und Performance-Kennzahlen
 * - Model-Verteilungen und Datensätze
 * - Visualisierungen mit Charts
 * - Detaillierte Tabellenanalyse
 */

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Database,
  TrendingUp,
  Activity,
  FileText,
  Hash,
  Clock,
  Zap,
  Loader2,
  AlertTriangle,
  RefreshCw,
  PieChart,
  BarChart,
  Calendar,
} from "lucide-react";
import {
  dbOverviewAPI,
  type DatabaseStatistics,
  type DatabaseSchemaResponse,
} from "../services/api";

const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState<DatabaseStatistics | null>(null);
  const [schemaData, setSchemaData] = useState<DatabaseSchemaResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, schemaResponse] = await Promise.all([
        dbOverviewAPI.getDatabaseStatistics(),
        dbOverviewAPI.getDatabaseSchema(),
      ]);
      setStatistics(statsData);
      setSchemaData(schemaResponse);
    } catch (err) {
      setError("Fehler beim Laden der Statistiken");
      console.error("Statistics loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm border">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#ff863d] mx-auto mb-4" />
            <p className="text-gray-600">Lade Statistiken...</p>
          </div>
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

  if (!statistics || !schemaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-gray-600 font-medium">Keine Daten verfügbar</p>
        </div>
      </div>
    );
  }

  // Berechne zusätzliche Statistiken aus Schema-Daten
  const totalModels = schemaData.apps.reduce(
    (sum, app) => sum + app.models.length,
    0
  );
  const totalRecords = schemaData.apps.reduce(
    (sum, app) =>
      sum +
      app.models.reduce((modelSum, model) => modelSum + model.record_count, 0),
    0
  );
  const totalRelationships = schemaData.relationships.length;
  const totalFields = schemaData.apps.reduce(
    (sum, app) =>
      sum +
      app.models.reduce((modelSum, model) => modelSum + model.field_count, 0),
    0
  );

  // Top Models nach Datensätzen
  const topModelsByRecords = schemaData.apps
    .flatMap((app) =>
      app.models.map((model) => ({ ...model, app_name: app.app_name }))
    )
    .sort((a, b) => b.record_count - a.record_count)
    .slice(0, 10);

  // Apps-Verteilung
  const appsDistribution = schemaData.apps.map((app) => ({
    name: app.app_name,
    models: app.models.length,
    records: app.models.reduce((sum, model) => sum + model.record_count, 0),
    fields: app.models.reduce((sum, model) => sum + model.field_count, 0),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95vw] mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        
        {/* Functional Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[#ff863d] p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Datenbankstatistiken</h1>
                <p className="text-gray-600 mt-1">Performance-Kennzahlen und erweiterte Statistiken</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-100 hover:bg-[#ff863d] hover:text-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Aktualisiere..." : "Aktualisieren"}</span>
            </button>
          </div>
        </div>

        {/* Clean Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt Models</p>
                <p className="text-2xl font-bold text-gray-900">{totalModels}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt Datensätze</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRecords.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Beziehungen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRelationships}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt Felder</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalFields}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <Hash className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance & Apps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#ff863d] p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Performance-Kennzahlen</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-4 w-4 text-[#ff863d]" />
                  <span className="text-sm text-gray-700">Datenbank-Typ</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {statistics.database_type || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Hash className="h-4 w-4 text-[#ff863d]" />
                  <span className="text-sm text-gray-700">Tabellen-Anzahl</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {statistics.total_tables || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-[#ff863d]" />
                  <span className="text-sm text-gray-700">Tabellen mit Daten</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {statistics.tables?.filter((t) => t.row_count > 0).length || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#ff863d] p-2 rounded-lg">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Apps-Verteilung</h2>
            </div>
            <div className="space-y-3">
              {appsDistribution.map((app, index) => (
                <div
                  key={app.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0
                          ? "bg-blue-500"
                          : index === 1
                          ? "bg-green-500"
                          : index === 2
                          ? "bg-purple-500"
                          : index === 3
                          ? "bg-orange-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {app.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{app.models} Models</p>
                    <p className="text-xs text-gray-500">
                      {app.records.toLocaleString()} Datensätze
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Models Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-[#ff863d] p-2 rounded-lg">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Top Models nach Datensätzen</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    App
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datensätze
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Felder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beziehungen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anteil
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topModelsByRecords.map((model, index) => {
                  const percentage =
                    totalRecords > 0
                      ? (model.record_count / totalRecords) * 100
                      : 0;
                  return (
                    <tr
                      key={`${model.app_name}.${model.model_name}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-3 ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                ? "bg-orange-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {model.model_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {model.app_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.record_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.field_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.relationship_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-[#ff863d] h-2 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#ff863d] p-2 rounded-lg">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Feldtypen</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">CharField/TextField</span>
                <span className="text-sm font-medium">
                  ~{Math.round(totalFields * 0.4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">IntegerField</span>
                <span className="text-sm font-medium">
                  ~{Math.round(totalFields * 0.2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">DateTimeField</span>
                <span className="text-sm font-medium">
                  ~{Math.round(totalFields * 0.15)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">BooleanField</span>
                <span className="text-sm font-medium">
                  ~{Math.round(totalFields * 0.1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sonstige</span>
                <span className="text-sm font-medium">
                  ~{Math.round(totalFields * 0.15)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#ff863d] p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Beziehungstypen</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(
                schemaData.relationships.reduce((acc, rel) => {
                  acc[rel.type] = (acc[rel.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {type.replace("Field", "")}
                  </span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#ff863d] p-2 rounded-lg">
                <Database className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Datenbank-Info</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Engine</p>
                <p className="text-sm font-medium text-gray-900">
                  {statistics.database_type || "SQLite"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tabellen</p>
                <p className="text-sm font-medium text-gray-900">
                  {statistics.total_tables || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Letzte Aktualisierung</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleString("de-DE")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
