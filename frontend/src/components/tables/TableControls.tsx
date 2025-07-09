import React from "react";
import clsx from "clsx";
import {
  Download,
  Upload,
  Columns,
  Filter,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { ButtonSecondary } from "../ui_elements/buttons";

interface TableControlsProps {
  // Search
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;

  // Export
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onImport?: () => void;

  // Controls
  onRefresh?: () => void;
  onToggleColumns?: () => void;
  onToggleFilters?: () => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // Loading states
  loading?: boolean;
  refreshing?: boolean;

  // Performance
  queryTime?: number | null;

  className?: string;
}

const TableControls: React.FC<TableControlsProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Suchen...",
  onExportCSV,
  onExportJSON,
  onImport,
  onRefresh,
  onToggleColumns,
  onToggleFilters,
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  loading = false,
  refreshing = false,
  queryTime,
  className = "",
}) => {
  const pageSizeOptions = [25, 50, 100, 250];

  const handleFirstPage = () => onPageChange(1);
  const handlePrevPage = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNextPage = () =>
    onPageChange(Math.min(totalPages, currentPage + 1));
  const handleLastPage = () => onPageChange(totalPages);

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Top Row: Search, Actions, Performance */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onToggleFilters && (
            <ButtonSecondary
              onClick={onToggleFilters}
              icon={<Filter />}
              size="sm"
              variant="outline"
            >
              Filter
            </ButtonSecondary>
          )}

          {onToggleColumns && (
            <ButtonSecondary
              onClick={onToggleColumns}
              icon={<Columns />}
              size="sm"
              variant="outline"
            >
              Spalten
            </ButtonSecondary>
          )}

          {onRefresh && (
            <ButtonSecondary
              onClick={onRefresh}
              icon={<RefreshCw className={refreshing ? "animate-spin" : ""} />}
              size="sm"
              variant="outline"
              disabled={refreshing}
            >
              Aktualisieren
            </ButtonSecondary>
          )}

          {/* Export Dropdown */}
          {(onExportCSV || onExportJSON || onImport) && (
            <div className="relative group">
              <ButtonSecondary icon={<Download />} size="sm" variant="outline">
                Export
              </ButtonSecondary>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="p-1">
                  {onExportCSV && (
                    <button
                      onClick={onExportCSV}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                    >
                      Als CSV exportieren
                    </button>
                  )}
                  {onExportJSON && (
                    <button
                      onClick={onExportJSON}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                    >
                      Als JSON exportieren
                    </button>
                  )}
                  {onImport && (
                    <>
                      <hr className="my-1" />
                      <button
                        onClick={onImport}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Importieren</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Info */}
        {queryTime && (
          <div className="text-sm text-gray-500">Query-Zeit: {queryTime}ms</div>
        )}
      </div>

      {/* Bottom Row: Page Size and Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Zeige</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-dsp-orange focus:border-transparent"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">
            von {totalRecords.toLocaleString()} Einträgen
          </span>
        </div>

        {/* Pagination */}
        <div className="flex items-center space-x-1">
          <ButtonSecondary
            onClick={handleFirstPage}
            disabled={currentPage === 1 || loading}
            icon={<ArrowLeft />}
            size="sm"
            variant="ghost"
            ariaLabel="Erste Seite"
          />

          <ButtonSecondary
            onClick={handlePrevPage}
            disabled={currentPage === 1 || loading}
            icon={<ChevronLeft />}
            size="sm"
            variant="ghost"
            ariaLabel="Vorherige Seite"
          />

          <div className="flex items-center space-x-1 px-3 py-1">
            <span className="text-sm text-gray-600">
              Seite {currentPage} von {totalPages}
            </span>
            <span className="text-xs text-gray-500">
              ({startRecord}-{endRecord})
            </span>
          </div>

          <ButtonSecondary
            onClick={handleNextPage}
            disabled={currentPage === totalPages || loading}
            icon={<ChevronRight />}
            size="sm"
            variant="ghost"
            ariaLabel="Nächste Seite"
          />

          <ButtonSecondary
            onClick={handleLastPage}
            disabled={currentPage === totalPages || loading}
            icon={<ArrowRight />}
            size="sm"
            variant="ghost"
            ariaLabel="Letzte Seite"
          />
        </div>
      </div>
    </div>
  );
};

export default TableControls;
