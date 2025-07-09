/**
 * Tabellen-Browser Seite - Professioneller Datenbank-Browser
 *
 * Features inspiriert von professionellen DB-Tools:
 * - Export/Import Funktionen (CSV, JSON)
 * - Erweiterte Filter und Sortierung
 * - Foreign Key Navigation
 * - Column Management
 * - Query Performance Metrics
 * - Relationship Explorer
 * - Schema-Informationen mit Tooltips
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Database,
  FileText,
  Hash,
  Calendar,
  ToggleLeft,
  Link,
  Key,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  Settings,
  Info,
  GitBranch,
  Clock,
  BarChart3,
  ExternalLink,
  Columns,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  dbOverviewAPI,
  type DatabaseSchemaResponse,
  type TableDataResponse,
  type ModelInfo,
  type SchemaField,
} from "../services/api";

interface TableRecord {
  [key: string]: any;
}

interface ColumnConfig {
  field: SchemaField;
  visible: boolean;
  width?: number;
}

interface FilterConfig {
  column: string;
  operator: "contains" | "equals" | "gt" | "lt" | "not_null" | "is_null";
  value: string;
}

interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

const TableBrowser: React.FC = () => {
  const [schemaData, setSchemaData] = useState<DatabaseSchemaResponse | null>(
    null
  );
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [tableData, setTableData] = useState<TableDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<TableRecord | null>(
    null
  );

  // Neue professionelle Features
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [sort, setSort] = useState<SortConfig | null>(null);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [showRelatedTables, setShowRelatedTables] = useState(false);

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

  useEffect(() => {
    if (selectedModel) {
      // Initialize column configuration
      const columnConfig: ColumnConfig[] = selectedModel.fields.map(
        (field) => ({
          field,
          visible: true,
          width: getDefaultColumnWidth(field),
        })
      );
      setColumns(columnConfig);
      setCurrentPage(1);
      setFilters([]);
      setSort(null);
      fetchTableData();
    }
  }, [selectedModel]);

  useEffect(() => {
    if (selectedModel && (currentPage !== 1 || sort || filters.length > 0)) {
      fetchTableData();
    }
  }, [currentPage, pageSize, sort, filters]);

  const fetchTableData = async () => {
    if (!selectedModel) return;

    try {
      setDataLoading(true);
      const startTime = Date.now();

      const data = await dbOverviewAPI.getTableData(
        selectedModel.app_label,
        selectedModel.model_name,
        currentPage,
        pageSize
      );

      const endTime = Date.now();
      setQueryTime(endTime - startTime);
      setTableData(data);
    } catch (err) {
      setError("Fehler beim Laden der Tabellendaten");
      console.error("Table data loading error:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const getDefaultColumnWidth = (field: SchemaField): number => {
    if (field.primary_key) return 80;
    if (field.type.includes("Boolean")) return 60;
    if (field.type.includes("Date")) return 120;
    if (field.type.includes("Integer")) return 80;
    if (field.max_length && field.max_length < 50) return 120;
    return 150;
  };

  const visibleColumns = useMemo(
    () => columns.filter((col) => col.visible),
    [columns]
  );

  const filteredModels = useMemo(
    () =>
      schemaData?.apps.flatMap((app) =>
        app.models
          .filter(
            (model) =>
              model.model_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              app.app_name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((model) => ({ ...model, app_name: app.app_name }))
      ) || [],
    [schemaData, searchTerm]
  );

  // Aufspaltung in eingehende und ausgehende Beziehungen
  const relationshipData = useMemo(() => {
    if (!selectedModel || !schemaData)
      return { incoming: [], outgoing: [], all: [] };

    const modelFullName = `${selectedModel.app_label || "unknown"}.${
      selectedModel.model_name
    }`;

    // Eingehende Beziehungen: Andere Tabellen zeigen auf diese Tabelle
    const incoming = schemaData.relationships.filter(
      (rel) =>
        rel.target === modelFullName ||
        rel.target.includes(selectedModel.model_name)
    );

    // Ausgehende Beziehungen: Diese Tabelle zeigt auf andere Tabellen
    const outgoing = schemaData.relationships.filter(
      (rel) =>
        rel.source === modelFullName ||
        rel.source.includes(selectedModel.model_name)
    );

    // Alle Beziehungen für Feldnavigation
    const all = [...incoming, ...outgoing];

    return { incoming, outgoing, all };
  }, [selectedModel, schemaData]);

  // Für Kompatibilität mit bestehender Navigation
  const relatedTables = relationshipData.all;

  const exportToCSV = () => {
    if (!tableData || !selectedModel) return;

    const headers = visibleColumns.map((col) => col.field.name);
    const csvContent = [
      headers.join(","),
      ...tableData.data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === "string"
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedModel.model_name}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!tableData || !selectedModel) return;

    const jsonContent = JSON.stringify(tableData.data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedModel.model_name}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (column: string) => {
    setSort((prev) => {
      if (prev?.column === column) {
        return prev.direction === "asc" ? { column, direction: "desc" } : null;
      }
      return { column, direction: "asc" };
    });
  };

  const toggleColumnVisibility = (fieldName: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.field.name === fieldName ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      { column: "", operator: "contains", value: "" },
    ]);
  };

  const updateFilter = (
    index: number,
    field: keyof FilterConfig,
    value: string
  ) => {
    setFilters((prev) =>
      prev.map((filter, i) =>
        i === index ? { ...filter, [field]: value } : filter
      )
    );
  };

  const removeFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const navigateToRelatedTable = (
    relationshipInfo: any,
    direction: "incoming" | "outgoing" = "outgoing"
  ) => {
    if (!schemaData) return;

    // Für eingehende Beziehungen navigieren wir zur Source, für ausgehende zum Target
    const targetPath =
      direction === "incoming"
        ? relationshipInfo.source
        : relationshipInfo.target;
    const targetModelName = targetPath.split(".")[1];
    const targetApp = targetPath.split(".")[0];

    const targetModel = schemaData.apps
      .find((app) => app.app_name === targetApp)
      ?.models.find((model) => model.model_name === targetModelName);

    if (targetModel) {
      setSelectedModel(targetModel);
    }
  };

  const getFieldIcon = (field: SchemaField) => {
    if (field.primary_key) return <Key className="h-4 w-4 text-yellow-500" />;
    if (field.is_relationship)
      return <Link className="h-4 w-4 text-purple-500" />;
    if (field.type.includes("Integer"))
      return <Hash className="h-4 w-4 text-blue-500" />;
    if (field.type.includes("Date"))
      return <Calendar className="h-4 w-4 text-green-500" />;
    if (field.type.includes("Boolean"))
      return <ToggleLeft className="h-4 w-4 text-orange-500" />;
    if (field.type.includes("TextField") || field.type.includes("CharField"))
      return <FileText className="h-4 w-4 text-gray-500" />;
    return <Database className="h-4 w-4 text-gray-400" />;
  };

  // Erweiterte Funktion zur Erkennung von Beziehungsfeldern
  const isRelationshipField = (field: SchemaField): boolean => {
    return (
      field.is_relationship ||
      field.type.includes("ForeignKey") ||
      field.type.includes("OneToOne") ||
      field.name.endsWith("_id") ||
      field.name.endsWith("_pk")
    );
  };

  // Erweiterte Funktion zur Suche nach passenden Beziehungen
  const findRelationshipForField = (field: SchemaField) => {
    if (!selectedModel || !schemaData) return null;

    // Direkte Suche nach Feldname
    let rel = relatedTables.find((r) => r.field_name === field.name);
    if (rel) return rel;

    // Suche ohne _id Suffix
    if (field.name.endsWith("_id")) {
      const baseFieldName = field.name.slice(0, -3);
      rel = relatedTables.find((r) => r.field_name === baseFieldName);
      if (rel) return rel;
    }

    // Suche ohne _pk Suffix
    if (field.name.endsWith("_pk")) {
      const baseFieldName = field.name.slice(0, -3);
      rel = relatedTables.find((r) => r.field_name === baseFieldName);
      if (rel) return rel;
    }

    // Suche nach partiellen Übereinstimmungen in field_name
    rel = relatedTables.find(
      (r) =>
        r.field_name &&
        (r.field_name.includes(
          field.name.replace("_id", "").replace("_pk", "")
        ) ||
          field.name.includes(r.field_name))
    );
    if (rel) return rel;

    // Fallback: Suche nach ähnlichen Feldnamen in source/target
    const modelFullName = `${selectedModel.app_label || "unknown"}.${
      selectedModel.model_name
    }`;
    rel = relatedTables.find((r) => {
      if (r.source === modelFullName) {
        // Prüfe ob der Feldname im target model vorkommt
        const targetParts = r.target.split(".");
        const targetModelName = targetParts[targetParts.length - 1];
        return (
          field.name.toLowerCase().includes(targetModelName.toLowerCase()) ||
          targetModelName
            .toLowerCase()
            .includes(
              field.name.replace("_id", "").replace("_pk", "").toLowerCase()
            )
        );
      }
      return false;
    });

    return rel;
  };

  // Hilfsfunktion um das Ziel-Model eines FK zu finden
  const getForeignKeyTarget = (field: SchemaField) => {
    const rel = findRelationshipForField(field);
    if (rel) {
      return rel.target.split(".")[1]; // Nur den Model-Namen ohne app_label
    }
    return null;
  };

  const formatValue = (value: any, field: SchemaField) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (field.type.includes("Boolean")) {
      return (
        <span
          className={`inline-flex items-center ${
            value ? "text-green-600" : "text-red-600"
          }`}
        >
          {value ? "✓" : "✗"}
        </span>
      );
    }

    if (field.type.includes("Date")) {
      try {
        return new Date(value).toLocaleString("de-DE");
      } catch {
        return value;
      }
    }

    // Erweiterte Beziehungserkennung und Navigation
    if (isRelationshipField(field) && value) {
      const rel = findRelationshipForField(field);

      if (rel) {
        // Bestimme die Richtung basierend auf der aktuellen Tabelle
        const currentModelFullName = `${
          selectedModel?.app_label || "unknown"
        }.${selectedModel?.model_name}`;
        const direction =
          rel.source === currentModelFullName ? "outgoing" : "incoming";
        const targetName = direction === "outgoing" ? rel.target : rel.source;

        return (
          <button
            onClick={() => navigateToRelatedTable(rel, direction)}
            className="text-purple-600 hover:text-purple-800 underline transition-colors duration-200"
            title={`Zu ${targetName} navigieren`}
          >
            {value} <ExternalLink className="h-3 w-3 inline ml-1" />
          </button>
        );
      } else {
        // Zeige als Beziehungsfeld aber ohne Navigation
        return (
          <span
            className="text-purple-500 cursor-help"
            title={`Beziehungsfeld (${field.type}) - Navigation nicht verfügbar`}
          >
            {value} <Link className="h-3 w-3 inline ml-1 opacity-50" />
          </span>
        );
      }
    }

    // Lange Texte werden jetzt durch CSS truncate gehandhabt
    if (typeof value === "string" && value.length > 200) {
      return <span className="cursor-help">{value}</span>;
    }

    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-dsp-orange mx-auto mb-4" />
          <p className="text-gray-600">Lade Schema-Daten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="text-red-800 font-medium">Fehler beim Laden</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tabellen-Browser
            </h1>
            <p className="text-gray-600 mt-1">
              Professioneller Datenbank-Browser mit erweiterten Features
            </p>
          </div>
          <Table className="h-8 w-8 text-dsp-orange" />
        </div>
      </div>

      {/* Model Selection Dropdown */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Model Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model auswählen
            </label>
            <div className="relative">
              <select
                value={
                  selectedModel
                    ? `${selectedModel.app_label}.${selectedModel.model_name}`
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) {
                    const [appLabel, modelName] = e.target.value.split(".");
                    const model = schemaData?.apps
                      .find((app) => app.app_name === appLabel)
                      ?.models.find((m) => m.model_name === modelName);
                    if (model) {
                      setSelectedModel(model);
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
              >
                <option value="">-- Model wählen --</option>
                {schemaData?.apps.map((app) => (
                  <optgroup key={app.app_name} label={app.app_name}>
                    {app.models.map((model) => (
                      <option
                        key={`${app.app_name}.${model.model_name}`}
                        value={`${app.app_name}.${model.model_name}`}
                      >
                        {model.model_name} ({model.record_count} Einträge)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Quick Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schnellsuche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Models suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
              />
            </div>
          </div>

          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Einträge pro Seite
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {selectedModel && (
              <>
                <button
                  onClick={() => setShowColumnManager(!showColumnManager)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Columns className="h-4 w-4 mr-1" />
                  Spalten
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Column Manager */}
      {showColumnManager && selectedModel && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Spalten-Management
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {columns.map((col) => (
              <label
                key={col.field.name}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div onClick={() => toggleColumnVisibility(col.field.name)}>
                  {col.visible ? (
                    <CheckSquare className="h-4 w-4 text-dsp-orange" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{col.field.name}</span>
                {getFieldIcon(col.field)}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && selectedModel && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">
              Erweiterte Filter
            </h3>
            <button
              onClick={addFilter}
              className="text-sm text-dsp-orange hover:text-dsp-orange_medium"
            >
              + Filter hinzufügen
            </button>
          </div>
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <select
                value={filter.column}
                onChange={(e) => updateFilter(index, "column", e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Spalte wählen</option>
                {selectedModel.fields.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.name}
                  </option>
                ))}
              </select>
              <select
                value={filter.operator}
                onChange={(e) =>
                  updateFilter(index, "operator", e.target.value as any)
                }
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="contains">enthält</option>
                <option value="equals">gleich</option>
                <option value="gt">größer als</option>
                <option value="lt">kleiner als</option>
                <option value="not_null">nicht null</option>
                <option value="is_null">ist null</option>
              </select>
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(index, "value", e.target.value)}
                placeholder="Wert"
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              />
              <button
                onClick={() => removeFilter(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Performance & Info Bar */}
      {selectedModel && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  {tableData?.pagination.total_count || 0} Datensätze
                </span>
              </div>
              {queryTime && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">{queryTime}ms</span>
                </div>
              )}
              {relatedTables.length > 0 && (
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-purple-500" />
                  <button
                    onClick={() => setShowRelatedTables(!showRelatedTables)}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    {relatedTables.length} Beziehungen
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </button>
              <button
                onClick={exportToJSON}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                JSON
              </button>
              <button
                onClick={fetchTableData}
                disabled={dataLoading}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${
                    dataLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Tables - Restructured */}
      {showRelatedTables &&
        (relationshipData.incoming.length > 0 ||
          relationshipData.outgoing.length > 0) &&
        selectedModel && (
          <div className="space-y-4">
            {/* Info Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <span className="font-medium">Legende:</span>
                <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                  Tabelle.Feld → Zieltabelle.Spalte
                </span>
                <span className="text-gray-500">
                  zeigt exakte Feld-zu-Feld Beziehungen
                </span>
              </div>
            </div>

            {/* Incoming Relationships - Tabellen die auf dieses Model zugreifen */}
            {relationshipData.incoming.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <ArrowLeft className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Tabellen die auf{" "}
                    <span className="text-blue-600">
                      {selectedModel.model_name}
                    </span>{" "}
                    zugreifen
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {relationshipData.incoming.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relationshipData.incoming.map((rel, index) => (
                    <button
                      key={`incoming-${index}`}
                      onClick={() => navigateToRelatedTable(rel, "incoming")}
                      className="text-left p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-blue-700">
                          {rel.source.split(".")[1]}
                        </span>
                        <ExternalLink className="h-4 w-4 text-blue-400" />
                      </div>

                      {/* Feld Information */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {rel.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            über Feld:
                          </span>
                        </div>
                        <div className="font-mono text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-600">
                              {rel.source.split(".")[1]}.
                              <span className="font-semibold">
                                {rel.field_name}
                              </span>
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-semibold">
                              {selectedModel.model_name}.
                              <span className="text-blue-700">
                                {rel.type === "ForeignKey" ||
                                rel.type === "OneToOneField"
                                  ? "id"
                                  : "id"}
                              </span>
                            </span>
                          </div>
                          {rel.related_name && (
                            <div className="text-gray-500 text-xs mt-1">
                              related_name: {rel.related_name}
                            </div>
                          )}
                          {rel.on_delete && (
                            <div className="text-orange-600 text-xs mt-1 font-medium">
                              on_delete: {rel.on_delete}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2 italic">
                        → {rel.source.split(".")[1]} greift über{" "}
                        <strong>{rel.field_name}</strong> auf{" "}
                        {selectedModel.model_name} zu
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing Relationships - Tabellen auf die dieses Model zugreift */}
            {relationshipData.outgoing.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <ArrowRight className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Tabellen auf die{" "}
                    <span className="text-green-600">
                      {selectedModel.model_name}
                    </span>{" "}
                    zugreift
                  </h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {relationshipData.outgoing.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relationshipData.outgoing.map((rel, index) => (
                    <button
                      key={`outgoing-${index}`}
                      onClick={() => navigateToRelatedTable(rel, "outgoing")}
                      className="text-left p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-green-700">
                          {rel.target.split(".")[1]}
                        </span>
                        <ExternalLink className="h-4 w-4 text-green-400" />
                      </div>

                      {/* Feld Information */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {rel.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            über Feld:
                          </span>
                        </div>
                        <div className="font-mono text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">
                              {selectedModel.model_name}.
                              <span className="font-semibold">
                                {rel.field_name}
                              </span>
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-semibold">
                              {rel.target.split(".")[1]}.
                              <span className="text-green-700">
                                {rel.type === "ForeignKey" ||
                                rel.type === "OneToOneField"
                                  ? "id"
                                  : "id"}
                              </span>
                            </span>
                          </div>
                          {rel.related_name && (
                            <div className="text-gray-500 text-xs mt-1">
                              related_name: {rel.related_name}
                            </div>
                          )}
                          {rel.on_delete && (
                            <div className="text-orange-600 text-xs mt-1 font-medium">
                              on_delete: {rel.on_delete}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2 italic">
                        → {selectedModel.model_name} greift über{" "}
                        <strong>{rel.field_name}</strong> auf{" "}
                        {rel.target.split(".")[1]} zu
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Main Table */}
      {selectedModel ? (
        <div className="bg-white rounded-lg shadow-sm">
          {dataLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-dsp-orange mx-auto mb-4" />
              <p className="text-gray-600">Lade Tabellendaten...</p>
            </div>
          ) : tableData ? (
            <div>
              {tableData.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        {visibleColumns.map((col) => (
                          <th
                            key={col.field.name}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort(col.field.name)}
                            style={{
                              width: `${col.width}px`,
                              minWidth: `${Math.max(col.width || 100, 80)}px`,
                              maxWidth: `${Math.max(col.width || 100, 300)}px`,
                            }}
                          >
                            <div className="flex flex-col space-y-1">
                              {/* Spaltenname (dick, prominent) */}
                              <div className="flex items-center space-x-1">
                                <span
                                  className="font-bold text-gray-900 text-sm truncate"
                                  title={col.field.name}
                                >
                                  {col.field.name}
                                </span>
                                {col.field.primary_key && (
                                  <Key className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                )}
                                {sort?.column === col.field.name &&
                                  (sort.direction === "asc" ? (
                                    <SortAsc className="h-3 w-3 flex-shrink-0 text-gray-600" />
                                  ) : (
                                    <SortDesc className="h-3 w-3 flex-shrink-0 text-gray-600" />
                                  ))}
                              </div>

                              {/* Model-Herkunft und Typ */}
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {getFieldIcon(col.field)}
                                  <span className="text-xs text-gray-600 font-medium">
                                    {selectedModel?.model_name}
                                  </span>
                                </div>
                                {col.field.is_relationship &&
                                  (() => {
                                    const targetModel = getForeignKeyTarget(
                                      col.field
                                    );
                                    return (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                        FK → {targetModel || "Unknown"}
                                      </span>
                                    );
                                  })()}
                                <span className="text-xs text-gray-500 truncate">
                                  {col.field.type.replace("Field", "")}
                                </span>
                              </div>
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 min-w-24">
                          Aktionen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tableData.data.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {visibleColumns.map((col) => (
                            <td
                              key={col.field.name}
                              className="px-4 py-3 text-sm text-gray-900"
                              style={{
                                width: `${col.width}px`,
                                minWidth: `${Math.max(col.width || 100, 80)}px`,
                                maxWidth: `${Math.max(
                                  col.width || 100,
                                  300
                                )}px`,
                              }}
                            >
                              <div
                                className="truncate"
                                title={String(record[col.field.name] || "")}
                              >
                                {formatValue(record[col.field.name], col.field)}
                              </div>
                            </td>
                          ))}
                          <td className="px-4 py-3 text-sm text-gray-900 w-24 min-w-24">
                            <button
                              onClick={() => setSelectedRecord(record)}
                              className="inline-flex items-center px-2 py-1 text-xs bg-dsp-orange text-white rounded hover:bg-dsp-orange_medium whitespace-nowrap"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Keine Daten vorhanden
                  </h3>
                  <p className="text-gray-600">
                    Diese Tabelle enthält keine Datensätze.
                  </p>
                </div>
              )}

              {/* Enhanced Pagination */}
              {tableData.pagination.total_pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-700">
                        Zeige {(currentPage - 1) * pageSize + 1} bis{" "}
                        {Math.min(
                          currentPage * pageSize,
                          tableData.pagination.total_count
                        )}{" "}
                        von {tableData.pagination.total_count} Einträgen
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Erste
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Zurück
                      </button>

                      <span className="px-4 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">
                        {currentPage} / {tableData.pagination.total_pages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(tableData.pagination.total_pages, prev + 1)
                          )
                        }
                        disabled={
                          currentPage === tableData.pagination.total_pages
                        }
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Weiter
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(tableData.pagination.total_pages)
                        }
                        disabled={
                          currentPage === tableData.pagination.total_pages
                        }
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Letzte
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Daten geladen
              </h3>
              <p className="text-gray-600">
                Wählen Sie ein Model aus, um die Daten zu laden.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Wählen Sie ein Model aus
          </h3>
          <p className="text-gray-600">
            Nutzen Sie das Dropdown oben, um ein Model auszuwählen und die
            Tabellendaten zu durchsuchen.
          </p>
        </div>
      )}

      {/* Enhanced Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Datensatz Details - {selectedModel?.model_name}
                </h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedModel?.fields.map((field) => (
                  <div key={field.name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getFieldIcon(field)}
                      <span className="font-medium text-gray-900">
                        {field.name}
                      </span>
                      {field.primary_key && (
                        <Key className="h-3 w-3 text-yellow-500" />
                      )}
                      {field.is_relationship && (
                        <Link className="h-3 w-3 text-purple-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {field.type}
                      {field.max_length && ` (max: ${field.max_length})`}
                      {field.null && ", nullable"}
                      {field.unique && ", unique"}
                    </p>
                    <div className="text-sm text-gray-900 break-all">
                      {formatValue(selectedRecord[field.name], field)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Related Records */}
              {relatedTables.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Verwandte Datensätze
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {relatedTables.map((rel, index) => (
                      <button
                        key={index}
                        onClick={() => navigateToRelatedTable(rel)}
                        className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {rel.target}
                          </span>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          via {rel.field_name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableBrowser;
