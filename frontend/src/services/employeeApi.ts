/**
 * Employee API Service für DSP Database Overview
 *
 * Service für Mitarbeiterverwaltung:
 * - Departments (Abteilungen)
 * - Positions (Positionen/Rollen)
 * - Employees (Mitarbeiter)
 */

import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

// Axios-Instance mit Standardkonfiguration
const employeeApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT Token anhängen
employeeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response-Interceptor für Fehlerbehandlung
employeeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      import("./authService").then(({ authService }) => {
        authService.logout();
        window.location.href = "/login";
      });
    }
    return Promise.reject(error);
  }
);

// Typen für API-Responses
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

// Create/Update Types (ohne ID und Timestamps)
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

// API-Funktionen
export const employeeAPI = {
  // Department CRUD
  async getDepartments(): Promise<Department[]> {
    const response = await employeeApi.get("/employees/departments/");
    return response.data;
  },

  async createDepartment(data: DepartmentCreate): Promise<Department> {
    const response = await employeeApi.post("/employees/departments/", data);
    return response.data;
  },

  async updateDepartment(
    id: number,
    data: Partial<DepartmentCreate>
  ): Promise<Department> {
    const response = await employeeApi.patch(
      `/employees/departments/${id}/`,
      data
    );
    return response.data;
  },

  async deleteDepartment(id: number): Promise<void> {
    await employeeApi.delete(`/employees/departments/${id}/`);
  },

  // Position CRUD
  async getPositions(): Promise<Position[]> {
    const response = await employeeApi.get("/employees/positions/");
    return response.data;
  },

  async createPosition(data: PositionCreate): Promise<Position> {
    const response = await employeeApi.post("/employees/positions/", data);
    return response.data;
  },

  async updatePosition(
    id: number,
    data: Partial<PositionCreate>
  ): Promise<Position> {
    const response = await employeeApi.patch(
      `/employees/positions/${id}/`,
      data
    );
    return response.data;
  },

  async deletePosition(id: number): Promise<void> {
    await employeeApi.delete(`/employees/positions/${id}/`);
  },

  // Employee CRUD
  async getEmployees(): Promise<Employee[]> {
    const response = await employeeApi.get("/employees/employees/");
    return response.data;
  },

  async createEmployee(data: EmployeeCreate): Promise<Employee> {
    const response = await employeeApi.post("/employees/employees/", data);
    return response.data;
  },

  async updateEmployee(
    id: number,
    data: Partial<EmployeeCreate>
  ): Promise<Employee> {
    const response = await employeeApi.patch(
      `/employees/employees/${id}/`,
      data
    );
    return response.data;
  },

  async deleteEmployee(id: number): Promise<void> {
    await employeeApi.delete(`/employees/employees/${id}/`);
  },

  // Tool APIs
  async getTools(): Promise<Tool[]> {
    const res = await employeeApi.get("/employees/tools/");
    return res.data;
  },

  async createTool(data: ToolCreate): Promise<Tool> {
    const res = await employeeApi.post("/employees/tools/", data);
    return res.data;
  },

  async updateTool(id: number, data: ToolUpdate): Promise<Tool> {
    const res = await employeeApi.patch(`/employees/tools/${id}/`, data);
    return res.data;
  },

  async getToolAccess(employeeId: number): Promise<ToolAccess[]> {
    const res = await employeeApi.get(
      `/employees/tool-access/?employee=${employeeId}`
    );
    return res.data;
  },
  async grantToolAccess(
    employee: number,
    tool_id: number
  ): Promise<ToolAccess> {
    const res = await employeeApi.post(`/employees/tool-access/`, {
      employee,
      tool_id,
    });
    return res.data;
  },
  async revokeToolAccess(accessId: number): Promise<void> {
    await employeeApi.delete(`/employees/tool-access/${accessId}/`);
  },
  async getToolAccessForTool(toolId: number): Promise<ToolAccess[]> {
    const res = await employeeApi.get(`/employees/tool-access/?tool=${toolId}`);
    return res.data;
  },
};

export default employeeAPI;
