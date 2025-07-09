import React from "react";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface TableColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface DataTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  emptyMessage?: string;
  stickyHeader?: boolean;
  bordered?: boolean;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  sortConfig,
  onSort,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  rowClassName = "",
  emptyMessage = "Keine Daten verfügbar",
  stickyHeader = false,
  bordered = true,
  striped = false,
  hover = true,
  compact = false,
}: DataTableProps<T>) => {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getRowClassName = (row: T, index: number) => {
    const baseClasses = clsx(
      hover && "hover:bg-gray-50 transition-colors",
      striped && index % 2 === 1 && "bg-gray-50/50"
    );

    if (typeof rowClassName === "function") {
      return clsx(baseClasses, rowClassName(row, index));
    }
    return clsx(baseClasses, rowClassName);
  };

  return (
    <div
      className={clsx(
        "overflow-hidden rounded-lg",
        bordered && "border border-gray-200",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead
            className={clsx(
              "bg-gray-50",
              stickyHeader && "sticky top-0 z-10",
              headerClassName
            )}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={clsx(
                    "text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    compact ? "px-4 py-2" : "px-6 py-3",
                    column.sortable &&
                      "cursor-pointer select-none hover:bg-gray-100",
                    column.headerClassName
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="text-gray-400">
                        {getSortIcon(column.key) || (
                          <ChevronDown className="w-4 h-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={clsx("bg-white divide-y divide-gray-200", bodyClassName)}
          >
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-dsp-orange border-t-transparent" />
                    <span className="text-gray-500">Laden...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={getRowClassName(row, rowIndex)}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={clsx(
                        "text-sm text-gray-900",
                        compact ? "px-4 py-2" : "px-6 py-4",
                        column.className
                      )}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                    >
                      <div className="truncate">
                        {column.render
                          ? column.render(row[column.key], row, rowIndex)
                          : row[column.key]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
