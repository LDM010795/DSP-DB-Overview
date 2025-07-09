import React, { useState, useMemo } from "react";
import clsx from "clsx";
import { ChevronDown, Database, Search, Table, Hash } from "lucide-react";
import type { ModelInfo } from "../../services/api";

interface ModelWithApp extends ModelInfo {
  app_name: string;
}

interface ModelSelectorProps {
  models: ModelWithApp[];
  selectedModel: ModelInfo | null;
  onModelSelect: (model: ModelInfo) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  loading?: boolean;
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelSelect,
  searchTerm,
  onSearchChange,
  loading = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Gruppiere Models nach Apps
  const groupedModels = useMemo(() => {
    const filtered = models.filter(
      (model) =>
        model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.app_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups = filtered.reduce((acc, model) => {
      if (!acc[model.app_name]) {
        acc[model.app_name] = [];
      }
      acc[model.app_name].push(model);
      return acc;
    }, {} as Record<string, ModelWithApp[]>);

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [models, searchTerm]);

  const handleModelSelect = (model: ModelInfo) => {
    onModelSelect(model);
    setIsOpen(false);
  };

  const totalModels = models.length;
  const filteredCount = groupedModels.reduce(
    (sum, [, models]) => sum + models.length,
    0
  );

  return (
    <div className={clsx("relative", className)}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={clsx(
          "w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg transition-colors",
          "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-transparent",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Database className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <div className="text-left flex-1 min-w-0">
            {selectedModel ? (
              <>
                <div className="font-medium text-gray-900 truncate">
                  {selectedModel.model_name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {selectedModel.app_label} • {selectedModel.field_count} Felder
                </div>
              </>
            ) : (
              <div className="text-gray-500">Model auswählen...</div>
            )}
          </div>
        </div>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Models durchsuchen..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dsp-orange focus:border-transparent text-sm"
                autoFocus
              />
            </div>
            {searchTerm && (
              <div className="mt-2 text-xs text-gray-500">
                {filteredCount} von {totalModels} Models
              </div>
            )}
          </div>

          {/* Models List */}
          <div className="max-h-64 overflow-y-auto">
            {groupedModels.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Keine Models gefunden
              </div>
            ) : (
              groupedModels.map(([appName, appModels]) => (
                <div key={appName}>
                  {/* App Header */}
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-dsp-orange_light rounded flex items-center justify-center">
                        <Database className="h-3 w-3 text-dsp-orange" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {appName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({appModels.length})
                      </span>
                    </div>
                  </div>

                  {/* Models in App */}
                  {appModels.map((model) => (
                    <button
                      key={`${model.app_label}-${model.model_name}`}
                      onClick={() => handleModelSelect(model)}
                      className={clsx(
                        "w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                        selectedModel?.model_name === model.model_name &&
                          selectedModel?.app_label === model.app_label &&
                          "bg-dsp-orange_light"
                      )}
                    >
                      <Table className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {model.model_name}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Hash className="h-3 w-3" />
                            <span>{model.field_count} Felder</span>
                          </span>
                          <span>
                            {model.record_count.toLocaleString()} Zeilen
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default ModelSelector;
