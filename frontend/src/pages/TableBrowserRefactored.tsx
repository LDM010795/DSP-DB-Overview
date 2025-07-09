/**
 * Refactorte Tabellen-Browser Seite - Professioneller Datenbank-Browser
 *
 * Verwendet generische, wiederverwendbare Komponenten für:
 * - Model-Auswahl mit Dropdown
 * - Tabellen-Controls (Export, Pagination, etc.)
 * - Generische DataTable
 * - Cards für strukturierte Layouts
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Database,
  Table,
  Key,
  FileText,
  Hash,
  Calendar,
  ToggleLeft,
  Link,
  SortAsc,
  SortDesc
} from "lucide-react";
import {
  dbOverviewAPI,
  type DatabaseSchemaResponse,
  type TableDataResponse,
  type ModelInfo,
  type SchemaField,
} from "../services/api";
import {
  LoadingSpinner,
  TableControls,
  ModelSelector,
  type SortConfig,
} from "../components";

interface ModelWithApp extends ModelInfo {
  app_name: string;
}

interface TableRecord {
  [key: string]: string | number | boolean | null | undefined;
}

const TableBrowserRefactored: React.FC = () => {
  // State Management
  const [schemaData, setSchemaData] = useState<DatabaseSchemaResponse | null>(
    null
  );
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [tableData, setTableData] = useState<TableDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Table State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [queryTime, setQueryTime] = useState<number | null>(null);

  // Load initial schema data
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

  // Load table data when model changes
  useEffect(() => {
    if (selectedModel) {
      setCurrentPage(1);
      setSortConfig(null);
      fetchTableData();
    }
  }, [selectedModel]);

  // Load table data when pagination/sorting changes
  useEffect(() => {
    if (selectedModel && (currentPage !== 1 || sortConfig)) {
      fetchTableData();
    }
  }, [currentPage, pageSize, sortConfig]);

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

  // Helper functions from old TableBrowser
  const getColumnWidth = (field: SchemaField): string => {
    if (field.primary_key) return "80px";
    if (field.type.includes("Boolean")) return "60px";
    if (field.type.includes("Date")) return "120px";
    if (field.type.includes("Integer")) return "80px";
    if (field.max_length && field.max_length < 50) return "120px";
    return "150px";
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



  const findRelationshipForField = (field: SchemaField) => {
    if (!selectedModel || !schemaData) return null;

    const relatedTables = schemaData.relationships;

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

    return null;
  };

  const getForeignKeyTarget = (field: SchemaField) => {
    const rel = findRelationshipForField(field);
    if (rel) {
      return rel.target.split(".")[1]; // Nur den Model-Namen ohne app_label
    }
    return null;
  };

  const formatCellValue = (
    value: string | number | boolean | null | undefined,
    field: SchemaField
  ) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (field.type.includes("Boolean")) {
      return (
        <span className={value ? "text-green-600" : "text-red-600"}>
          {value ? "✓" : "✗"}
        </span>
      );
    }

    if (field.type.includes("Date")) {
      try {
        return new Date(value as string | number).toLocaleDateString("de-DE");
      } catch {
        return value;
      }
    }

    return String(value);
  };

  // Prepare models list with app names
  const modelsWithApps: ModelWithApp[] = useMemo(
    () =>
      schemaData?.apps.flatMap((app) =>
        app.models.map((model) => ({ ...model, app_name: app.app_name }))
      ) || [],
    [schemaData]
  );



  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => {
      if (prev?.key === columnKey) {
        return prev.direction === "asc"
          ? { key: columnKey, direction: "desc" }
          : null;
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  const handleExportCSV = () => {
    if (!tableData || !selectedModel) return;

    const headers = selectedModel.fields.map((field) => field.name);
    const rows = tableData.data.map((row) =>
      headers.map((header) => row[header] || "")
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedModel.model_name}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!tableData || !selectedModel) return;

    const jsonContent = JSON.stringify(tableData.data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedModel.model_name}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Custom table rendering with enhanced column headers
  const renderEnhancedTable = () => {
    if (!selectedModel || !tableData) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              {selectedModel.fields.map((field) => (
                <th
                  key={field.name}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(field.name)}
                  style={{
                    width: getColumnWidth(field),
                    minWidth: "80px",
                    maxWidth: "300px",
                  }}
                >
                  <div className="flex flex-col space-y-1">
                    {/* Spaltenname (dick, prominent) */}
                    <div className="flex items-center space-x-1">
                      <span
                        className="font-bold text-gray-900 text-sm truncate"
                        title={field.name}
                      >
                        {field.name}
                      </span>
                      {field.primary_key && (
                        <Key className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      )}
                      {sortConfig?.key === field.name &&
                        (sortConfig.direction === "asc" ? (
                          <SortAsc className="h-3 w-3 flex-shrink-0 text-gray-600" />
                        ) : (
                          <SortDesc className="h-3 w-3 flex-shrink-0 text-gray-600" />
                        ))}
                    </div>

                    {/* Model-Herkunft und Typ */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {getFieldIcon(field)}
                        <span className="text-xs text-gray-600 font-medium">
                          {selectedModel?.model_name}
                        </span>
                      </div>
                      {field.is_relationship &&
                        (() => {
                          const targetModel = getForeignKeyTarget(field);
                          return (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                              FK → {targetModel || "Unknown"}
                            </span>
                          );
                        })()}
                      <span className="text-xs text-gray-500 truncate">
                        {field.type.replace("Field", "")}
                      </span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.data.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {selectedModel.fields.map((field) => (
                  <td
                    key={field.name}
                    className="px-4 py-3 text-sm text-gray-900"
                    style={{
                      width: getColumnWidth(field),
                      minWidth: "80px",
                      maxWidth: "300px",
                    }}
                  >
                    <div
                      className="truncate"
                      title={String(record[field.name] || "")}
                    >
                      {formatCellValue(record[field.name], field)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render loading state
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

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-sm border border-red-200">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Fehler beim Laden
          </h3>
          <p className="text-gray-600 text-center text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalPages = tableData
    ? Math.ceil(tableData.pagination.total_count / pageSize)
    : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95vw] mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        {/* Functional Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#ff863d] p-2 rounded-lg">
              <Table className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tabellen-Browser
              </h1>
              <p className="text-gray-600 mt-1">
                Wählen Sie ein Model aus um dessen Daten zu durchsuchen
              </p>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-[#ff863d] p-2 rounded-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Model Auswahl
            </h2>
          </div>
          <ModelSelector
            models={modelsWithApps}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            searchTerm={modelSearchTerm}
            onSearchChange={setModelSearchTerm}
            loading={loading}
          />
        </div>

        {/* Table View */}
        {selectedModel && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#ff863d] p-2 rounded-lg">
                    <Table className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedModel.model_name} Daten
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {selectedModel.app_label} • {selectedModel.field_count}{" "}
                      Felder
                    </p>
                  </div>
                </div>
                {tableData && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {tableData.pagination.total_count.toLocaleString()}{" "}
                      Datensätze
                    </p>
                    <p className="text-xs text-gray-500">
                      Seite {currentPage} von {totalPages}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-b border-gray-200">
              <TableControls
                searchTerm=""
                onSearchChange={() => {}}
                searchPlaceholder="In Tabelle suchen..."
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
                onRefresh={fetchTableData}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalRecords={tableData?.pagination.total_count || 0}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                loading={dataLoading}
                refreshing={dataLoading}
                queryTime={queryTime}
              />
            </div>

            {/* Enhanced Table with FK Information */}
            {dataLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d] mx-auto mb-4"></div>
                <p className="text-gray-600">Lade Tabellendaten...</p>
              </div>
            ) : tableData && tableData.data.length > 0 ? (
              renderEnhancedTable()
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
          </div>
        )}

        {/* Empty State when no model selected */}
        {!selectedModel && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Table className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Kein Model ausgewählt
              </h3>
              <p className="text-gray-600 text-sm">
                Wählen Sie ein Django Model aus der Liste oben aus, um dessen
                Daten zu durchsuchen.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableBrowserRefactored;
