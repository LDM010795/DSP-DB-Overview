import React, { useEffect, useState } from "react";
import {
  employeeAPI,
  type Tool,
  type Employee,
  type ToolCreate,
  type ToolUpdate,
} from "../services/employeeApi";
import { Users, PlusCircle, Edit, Search } from "lucide-react";

const ToolManagement: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolToEdit, setToolToEdit] = useState<Tool | null>(null);
  const [access, setAccess] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [toolsData, employeesData] = await Promise.all([
          employeeAPI.getTools(),
          employeeAPI.getEmployees(),
        ]);
        setTools(toolsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleOpenAccessModal = async (tool: Tool) => {
    setSelectedTool(tool);
    try {
      const accessList = await employeeAPI.getToolAccessForTool(tool.id);
      setAccess(new Set(accessList.map((a) => a.employee)));
      setIsAccessModalOpen(true);
    } catch (error) {
      console.error("Failed to get tool access:", error);
    }
  };

  const handleSaveAccess = async (newAccessSet: Set<number>) => {
    if (!selectedTool) return;
    try {
      const currentAccess = await employeeAPI.getToolAccessForTool(
        selectedTool.id
      );
      const currentEmployeeIds = new Set(currentAccess.map((a) => a.employee));

      const toAdd = [...newAccessSet].filter(
        (id) => !currentEmployeeIds.has(id)
      );
      const toRemove = currentAccess.filter(
        (a) => !newAccessSet.has(a.employee)
      );

      await Promise.all([
        ...toAdd.map((empId) =>
          employeeAPI.grantToolAccess(empId, selectedTool.id)
        ),
        ...toRemove.map((acc) => employeeAPI.revokeToolAccess(acc.id)),
      ]);

      alert("Zugriffe erfolgreich gespeichert");
      setIsAccessModalOpen(false);
      setSelectedTool(null);
    } catch (error) {
      console.error("Failed to save access:", error);
      alert("Fehler beim Speichern der Zugriffe.");
    }
  };

  const handleOpenCreateModal = () => {
    setToolToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (tool: Tool) => {
    setToolToEdit(tool);
    setIsFormModalOpen(true);
  };

  const handleSaveTool = async (data: ToolCreate | ToolUpdate) => {
    try {
      if (toolToEdit) {
        const updatedTool = await employeeAPI.updateTool(toolToEdit.id, data);
        setTools(tools.map((t) => (t.id === toolToEdit.id ? updatedTool : t)));
        alert("Tool erfolgreich aktualisiert.");
      } else {
        const newTool = await employeeAPI.createTool(data as ToolCreate);
        setTools((prev) => [...prev, newTool]);
        alert("Tool erfolgreich erstellt.");
      }
      setIsFormModalOpen(false);
      setToolToEdit(null);
    } catch (error) {
      console.error("Failed to save tool:", error);
      alert("Fehler beim Speichern des Tools.");
    }
  };

  if (loading) return <div className="p-4">Lade...</div>;

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-semibold text-lg md:text-2xl">Tool-Verwaltung</h1>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PlusCircle className="h-5 w-5" />
          Neues Tool
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tool
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frontend URL
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zugriffe
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bearbeiten
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tools.map((tool) => (
              <tr key={tool.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tool.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tool.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a
                    href={tool.frontend_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                  >
                    {tool.frontend_url}
                  </a>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleOpenAccessModal(tool)}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium"
                    aria-label={`Zugriffe für ${tool.name} verwalten`}
                  >
                    <Users className="h-5 w-5" />
                    <span className="hidden sm:inline">Verwalten</span>
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleOpenEditModal(tool)}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium"
                    aria-label={`Tool ${tool.name} bearbeiten`}
                  >
                    <Edit className="h-5 w-5" />
                    <span className="hidden sm:inline">Bearbeiten</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAccessModalOpen && selectedTool && (
        <AccessControlModal
          tool={selectedTool}
          employees={employees}
          initialAccess={access}
          onClose={() => setIsAccessModalOpen(false)}
          onSave={handleSaveAccess}
        />
      )}

      {isFormModalOpen && (
        <ToolFormModal
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveTool}
          initialData={toolToEdit}
        />
      )}
    </main>
  );
};

interface AccessControlModalProps {
  tool: Tool;
  employees: Employee[];
  initialAccess: Set<number>;
  onClose: () => void;
  onSave: (access: Set<number>) => void;
}

const AccessControlModal: React.FC<AccessControlModalProps> = ({
  tool,
  employees,
  initialAccess,
  onClose,
  onSave,
}) => {
  const [access, setAccess] = useState(initialAccess);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleEmployee = (empId: number) => {
    setAccess((prev) => {
      const newAccess = new Set(prev);
      if (newAccess.has(empId)) newAccess.delete(empId);
      else newAccess.add(empId);
      return newAccess;
    });
  };

  const handleSelectAll = () => {
    const filteredIds = filteredEmployees.map((e) => e.id);
    setAccess((prev) => new Set([...prev, ...filteredIds]));
  };

  const handleDeselectAll = () => {
    const filteredIds = new Set(filteredEmployees.map((e) => e.id));
    setAccess(
      (prev) => new Set([...prev].filter((id) => !filteredIds.has(id)))
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 pt-5 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Zugriffsverwaltung für "{tool.name}"
          </h2>
          <p className="text-sm text-gray-500">
            Wählen Sie Mitarbeiter aus, die auf dieses Tool zugreifen dürfen.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Mitarbeiter suchen (Name, E-Mail)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Alle wählen
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Alle abwählen
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow border rounded-lg p-2 bg-gray-50/50">
          <div className="space-y-2">
            {filteredEmployees.map((emp) => (
              <label
                key={emp.id}
                className="flex items-center justify-between p-3 rounded-md hover:bg-white bg-white shadow-sm border border-gray-200/80 cursor-pointer transition-all duration-150 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300"
              >
                <div>
                  <p className="font-semibold text-gray-800">{emp.full_name}</p>
                  <p className="text-sm text-gray-500">{emp.email}</p>
                </div>
                <input
                  type="checkbox"
                  checked={access.has(emp.id)}
                  onChange={() => handleToggleEmployee(emp.id)}
                  className="h-5 w-5 rounded text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 border-gray-300"
                />
              </label>
            ))}
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Keine Mitarbeiter gefunden.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-bold">{access.size}</span> von{" "}
            <span className="font-bold">{employees.length}</span> Mitarbeiter(n)
            ausgewählt.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
            >
              Abbrechen
            </button>
            <button
              onClick={() => onSave(access)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToolFormModalProps {
  onClose: () => void;
  onSave: (data: ToolCreate | ToolUpdate) => void;
  initialData: Tool | null;
}

const ToolFormModal: React.FC<ToolFormModalProps> = ({
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [frontendUrl, setFrontendUrl] = useState(
    initialData?.frontend_url || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      alert("Bitte füllen Sie alle Felder aus.");
      return;
    }
    onSave({ name, slug, frontend_url: frontendUrl });
  };

  const isEditing = initialData !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? "Tool bearbeiten" : "Neues Tool erstellen"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="toolName"
              className="block text-sm font-medium text-gray-700"
            >
              Tool-Name
            </label>
            <input
              type="text"
              id="toolName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="toolSlug"
              className="block text-sm font-medium text-gray-700"
            >
              Slug
            </label>
            <input
              type="text"
              id="toolSlug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Ein kurzer, URL-freundlicher Name (z.B. "mitarbeiter-portal").
              Dieser Wert MUSS mit dem im Frontend-Code verwendeten Slug für den
              Login-Aufruf übereinstimmen.
            </p>
          </div>
          <div>
            <label
              htmlFor="toolFrontendUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Frontend URL
            </label>
            <input
              type="text"
              id="toolFrontendUrl"
              value={frontendUrl}
              onChange={(e) => setFrontendUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="z.B. http://localhost:5175"
            />
            <p className="mt-2 text-xs text-gray-500">
              Die URL, zu der Benutzer nach erfolgreichem Login für dieses Tool
              weitergeleitet werden.
            </p>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold"
            >
              {isEditing ? "Änderungen speichern" : "Erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToolManagement;
