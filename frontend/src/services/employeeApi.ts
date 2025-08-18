/**
 * Employee API Service für DSP Database Overview
 *
 * Service für umfassende Mitarbeiterverwaltung:
 * - Departments (Abteilungen) - CRUD-Operationen
 * - Positions (Positionen/Rollen) - CRUD-Operationen
 * - Employees (Mitarbeiter) - CRUD-Operationen
 * - Tool Access Management - Berechtigungsverwaltung
 *
 * Features:
 * - Vollständige CRUD-Operationen für alle Entitäten
 * - JWT-basierte Authentifizierung
 * - Automatische Fehlerbehandlung
 * - TypeScript-Typisierung für alle API-Responses
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import { createServiceClient } from "./config";

// --- API-Konfiguration ---

// Service-spezifische Axios-Instanz für Employee-API
const employeeApi = createServiceClient("/employees");

// --- Typen für API-Responses ---

export interface Department {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: Department;
  position: Position;
  max_working_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_name: string;
}

export interface Tool {
  id: number;
  slug: string;
  name: string;
  description?: string;
  frontend_url?: string;
}

export interface ToolAccess {
  id: number;
  employee: number;
  tool: Tool;
  tool_id?: number; // write only
  expires_at?: string | null;
}

export interface ToolCreate {
  slug: string;
  name: string;
  description?: string;
  frontend_url?: string;
}

export type ToolUpdate = Partial<ToolCreate>;

// --- Create/Update Types (ohne ID und Timestamps) ---

export interface DepartmentCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface PositionCreate {
  title: string;
  description?: string;
  is_active?: boolean;
}

export interface EmployeeCreate {
  first_name: string;
  last_name: string;
  email: string;
  department: number;
  position: number;
  max_working_hours: number;
  is_active?: boolean;
}

// --- API-Funktionen ---

export const employeeAPI = {
  // --- Department CRUD-Operationen ---

  async getDepartments(): Promise<Department[]> {
    const response = await employeeApi.get("/departments/");
    return response.data;
  },

  async createDepartment(data: DepartmentCreate): Promise<Department> {
    const response = await employeeApi.post("/departments/", data);
    return response.data;
  },

  async updateDepartment(
    id: number,
    data: Partial<DepartmentCreate>
  ): Promise<Department> {
    const response = await employeeApi.patch(`/departments/${id}/`, data);
    return response.data;
  },

  async deleteDepartment(id: number): Promise<void> {
    await employeeApi.delete(`/departments/${id}/`);
  },

  // --- Position CRUD-Operationen ---

  async getPositions(): Promise<Position[]> {
    const response = await employeeApi.get("/positions/");
    return response.data;
  },

  async createPosition(data: PositionCreate): Promise<Position> {
    const response = await employeeApi.post("/positions/", data);
    return response.data;
  },

  async updatePosition(
    id: number,
    data: Partial<PositionCreate>
  ): Promise<Position> {
    const response = await employeeApi.patch(`/positions/${id}/`, data);
    return response.data;
  },

  async deletePosition(id: number): Promise<void> {
    await employeeApi.delete(`/positions/${id}/`);
  },

  // --- Employee CRUD-Operationen ---

  async getEmployees(): Promise<Employee[]> {
    const response = await employeeApi.get("/employees/");
    return response.data;
  },

  async createEmployee(data: EmployeeCreate): Promise<Employee> {
    const response = await employeeApi.post("/employees/", data);
    return response.data;
  },

  async updateEmployee(
    id: number,
    data: Partial<EmployeeCreate>
  ): Promise<Employee> {
    const response = await employeeApi.patch(`/employees/${id}/`, data);
    return response.data;
  },

  async deleteEmployee(id: number): Promise<void> {
    await employeeApi.delete(`/employees/${id}/`);
  },

  // Tool APIs
  async getTools(): Promise<Tool[]> {
    const res = await employeeApi.get("/tools/");
    return res.data;
  },

  async createTool(data: ToolCreate): Promise<Tool> {
    const res = await employeeApi.post("/tools/", data);
    return res.data;
  },

  async updateTool(id: number, data: ToolUpdate): Promise<Tool> {
    const res = await employeeApi.patch(`/tools/${id}/`, data);
    return res.data;
  },

  async getToolAccess(employeeId: number): Promise<ToolAccess[]> {
    const res = await employeeApi.get(`/tool-access/?employee=${employeeId}`);
    return res.data;
  },
  async grantToolAccess(
    employee: number,
    tool_id: number
  ): Promise<ToolAccess> {
    const res = await employeeApi.post(`/tool-access/`, {
      employee,
      tool_id,
    });
    return res.data;
  },
  async revokeToolAccess(accessId: number): Promise<void> {
    await employeeApi.delete(`/tool-access/${accessId}/`);
  },
  async getToolAccessForTool(toolId: number): Promise<ToolAccess[]> {
    const res = await employeeApi.get(`/tool-access/?tool=${toolId}`);
    return res.data;
  },
};

export default employeeAPI;
