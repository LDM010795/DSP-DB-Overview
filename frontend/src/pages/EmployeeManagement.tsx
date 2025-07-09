/**
 * Employee Management Page für DSP Database Overview
 *
 * Zentrale Verwaltungsseite für:
 * - Abteilungen (Departments)
 * - Positionen (Positions)
 * - Mitarbeiter (Employees)
 */

import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import clsx from "clsx";
import {
  employeeAPI,
  type Department,
  type Position,
  type Employee,
} from "../services/employeeApi";
import DepartmentForm from "../components/forms/DepartmentForm";
import PositionForm from "../components/forms/PositionForm";
import EmployeeForm from "../components/forms/EmployeeForm";

type ActiveTab = "departments" | "positions" | "employees";
type ModalState = "closed" | "create" | "edit";

interface EditData {
  type: ActiveTab;
  id: number;
  data: any;
}

const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("employees");
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [editData, setEditData] = useState<EditData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [deptData, posData, empData] = await Promise.all([
        employeeAPI.getDepartments(),
        employeeAPI.getPositions(),
        employeeAPI.getEmployees(),
      ]);
      setDepartments(deptData);
      setPositions(posData);
      setEmployees(empData);
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
      alert("Fehler beim Laden der Mitarbeiterdaten");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (type: ActiveTab) => {
    setEditData(null);
    setModalState("create");
    setActiveTab(type);
  };

  const handleEdit = (type: ActiveTab, id: number, data: any) => {
    setEditData({ type, id, data });
    setModalState("edit");
    setActiveTab(type);
  };

  const handleDelete = async (type: ActiveTab, id: number, name: string) => {
    if (!confirm(`Möchten Sie "${name}" wirklich löschen?`)) return;

    try {
      switch (type) {
        case "departments":
          await employeeAPI.deleteDepartment(id);
          break;
        case "positions":
          await employeeAPI.deletePosition(id);
          break;
        case "employees":
          await employeeAPI.deleteEmployee(id);
          break;
      }
      await loadAllData();
      alert(`${name} wurde erfolgreich gelöscht.`);
    } catch (error: any) {
      console.error("Fehler beim Löschen:", error);
      alert(
        `Fehler beim Löschen: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleFormSuccess = async () => {
    setModalState("closed");
    setEditData(null);
    await loadAllData();
  };

  const handleCloseModal = () => {
    setModalState("closed");
    setEditData(null);
  };

  // Filter logic
  const filterData = (data: any[], searchFields: string[]) => {
    return data.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        searchFields.some((field) =>
          item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus = showInactive || item.is_active;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredDepartments = filterData(departments, ["name", "description"]);
  const filteredPositions = filterData(positions, ["title", "description"]);
  const filteredEmployees = filterData(employees, [
    "first_name",
    "last_name",
    "email",
    "department.name",
    "position.title",
  ]);

  const tabs = [
    {
      key: "employees" as const,
      label: "Mitarbeiter",
      icon: Users,
      count: employees.filter((e) => e.is_active).length,
      color: "text-blue-600",
    },
    {
      key: "departments" as const,
      label: "Abteilungen",
      icon: Building2,
      count: departments.filter((d) => d.is_active).length,
      color: "text-green-600",
    },
    {
      key: "positions" as const,
      label: "Positionen",
      icon: UserCheck,
      count: positions.filter((p) => p.is_active).length,
      color: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm border max-w-[95vw]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d] mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Mitarbeiterdaten...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[95vw] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mitarbeiterverwaltung
              </h1>
              <p className="text-gray-600 mt-1">
                Verwalten Sie Abteilungen, Positionen und Mitarbeiter Ihres
                Unternehmens
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => handleCreate(activeTab)}
                className="inline-flex items-center px-4 py-2 bg-[#ff863d] text-white rounded-lg hover:bg-[#ed7c34] transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {activeTab === "employees" && "Mitarbeiter hinzufügen"}
                {activeTab === "departments" && "Abteilung hinzufügen"}
                {activeTab === "positions" && "Position hinzufügen"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={clsx(
                      "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === tab.key
                        ? "border-[#ff863d] text-[#ff863d]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={clsx("h-4 w-4", tab.color)} />
                      <span>{tab.label}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Filter Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`${
                      tabs.find((t) => t.key === activeTab)?.label
                    } durchsuchen...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-[#ff863d] focus:border-[#ff863d]"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="rounded border-gray-300 text-[#ff863d] focus:ring-[#ff863d]"
                  />
                  <span className="text-sm text-gray-600">
                    Inaktive anzeigen
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "departments" && (
              <DepartmentTable
                departments={filteredDepartments}
                onEdit={(id, data) => handleEdit("departments", id, data)}
                onDelete={(id, name) => handleDelete("departments", id, name)}
              />
            )}
            {activeTab === "positions" && (
              <PositionTable
                positions={filteredPositions}
                onEdit={(id, data) => handleEdit("positions", id, data)}
                onDelete={(id, name) => handleDelete("positions", id, name)}
              />
            )}
            {activeTab === "employees" && (
              <EmployeeTable
                employees={filteredEmployees}
                onEdit={(id, data) => handleEdit("employees", id, data)}
                onDelete={(id, name) => handleDelete("employees", id, name)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalState !== "closed" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {activeTab === "departments" && (
              <DepartmentForm
                mode={modalState}
                id={editData?.id}
                initialData={editData?.data}
                onSuccess={handleFormSuccess}
                onCancel={handleCloseModal}
              />
            )}
            {activeTab === "positions" && (
              <PositionForm
                mode={modalState}
                id={editData?.id}
                initialData={editData?.data}
                onSuccess={handleFormSuccess}
                onCancel={handleCloseModal}
              />
            )}
            {activeTab === "employees" && (
              <EmployeeForm
                mode={modalState}
                id={editData?.id}
                initialData={editData?.data}
                onSuccess={handleFormSuccess}
                onCancel={handleCloseModal}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Table Components
interface TableProps {
  onEdit: (id: number, data: any) => void;
  onDelete: (id: number, name: string) => void;
}

const DepartmentTable: React.FC<TableProps & { departments: Department[] }> = ({
  departments,
  onEdit,
  onDelete,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Abteilung
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Beschreibung
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Aktionen
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {departments.map((department) => (
          <tr key={department.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {department.name}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
              {department.description || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={clsx(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  department.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {department.is_active ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aktiv
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Inaktiv
                  </>
                )}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => onEdit(department.id, department)}
                className="text-[#ff863d] hover:text-[#ed7c34] mr-4"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(department.id, department.name)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {departments.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        Keine Abteilungen gefunden
      </div>
    )}
  </div>
);

const PositionTable: React.FC<TableProps & { positions: Position[] }> = ({
  positions,
  onEdit,
  onDelete,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Position
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Beschreibung
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Aktionen
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {positions.map((position) => (
          <tr key={position.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {position.title}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
              {position.description || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={clsx(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  position.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {position.is_active ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aktiv
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Inaktiv
                  </>
                )}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => onEdit(position.id, position)}
                className="text-[#ff863d] hover:text-[#ed7c34] mr-4"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(position.id, position.title)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {positions.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        Keine Positionen gefunden
      </div>
    )}
  </div>
);

const EmployeeTable: React.FC<TableProps & { employees: Employee[] }> = ({
  employees,
  onEdit,
  onDelete,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            E-Mail
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Abteilung
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Position
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Max. Stunden
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Aktionen
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {employees.map((employee) => (
          <tr key={employee.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {employee.full_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {employee.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {employee.department.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {employee.position.title}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {employee.max_working_hours}h/Woche
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={clsx(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  employee.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {employee.is_active ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aktiv
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Inaktiv
                  </>
                )}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() =>
                  onEdit(employee.id, {
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    email: employee.email,
                    department: employee.department.id,
                    position: employee.position.id,
                    max_working_hours: employee.max_working_hours,
                    is_active: employee.is_active,
                  })
                }
                className="text-[#ff863d] hover:text-[#ed7c34] mr-4"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(employee.id, employee.full_name)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {employees.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        Keine Mitarbeiter gefunden
      </div>
    )}
  </div>
);

export default EmployeeManagement;
