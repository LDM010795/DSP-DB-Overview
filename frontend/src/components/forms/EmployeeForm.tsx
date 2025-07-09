import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import {
  employeeAPI,
  type EmployeeCreate,
  type Department,
  type Position,
  type Tool,
  type ToolAccess,
} from "../../services/employeeApi";

const schema = z.object({
  first_name: z
    .string()
    .min(1, "Vorname erforderlich")
    .max(50, "Maximal 50 Zeichen"),
  last_name: z
    .string()
    .min(1, "Nachname erforderlich")
    .max(50, "Maximal 50 Zeichen"),
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  department: z.number().min(1, "Abteilung auswählen"),
  position: z.number().min(1, "Position auswählen"),
  max_working_hours: z
    .number()
    .min(1, "Mindestens 1 Stunde")
    .max(60, "Maximal 60 Stunden"),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: number; label: string }[];
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

const Input: React.FC<InputProps> = ({ label, error, required, ...rest }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={clsx(
        "mt-1 block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-[#ff863d] focus:border-[#ff863d] sm:text-sm",
        error ? "border-red-500" : "border-gray-300"
      )}
      {...rest}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const Select: React.FC<SelectProps> = ({
  label,
  error,
  required,
  options,
  ...rest
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      className={clsx(
        "mt-1 block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-[#ff863d] focus:border-[#ff863d] sm:text-sm",
        error ? "border-red-500" : "border-gray-300"
      )}
      {...rest}
    >
      <option value="">Bitte auswählen...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const Checkbox: React.FC<CheckboxProps> = ({ label, description, ...rest }) => (
  <div className="mb-4">
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          className="focus:ring-[#ff863d] h-4 w-4 text-[#ff863d] border-gray-300 rounded"
          {...rest}
        />
      </div>
      <div className="ml-3 text-sm">
        <label className="font-medium text-gray-700">{label}</label>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </div>
  </div>
);

interface EmployeeFormProps {
  mode?: "create" | "edit";
  id?: number;
  initialData?: Partial<FormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  mode = "create",
  id,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolAccess, setToolAccess] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_active: true,
      max_working_hours: 40,
      ...initialData,
    },
  });

  // Lade Departments und Positions beim Komponenten-Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptData, posData] = await Promise.all([
          employeeAPI.getDepartments(),
          employeeAPI.getPositions(),
        ]);
        setDepartments(deptData.filter((dept) => dept.is_active));
        setPositions(posData.filter((pos) => pos.is_active));
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        alert("Fehler beim Laden der Abteilungen und Positionen");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // load tools and access
  useEffect(() => {
    const loadTools = async () => {
      try {
        const t = await employeeAPI.getTools();
        setTools(t);
        if (mode === "edit" && id) {
          const access = await employeeAPI.getToolAccess(id);
          setToolAccess(new Set(access.map((a) => a.tool.slug)));
        }
      } catch (e) {
        console.error("Fehler beim Laden der Tools", e);
      }
    };
    loadTools();
  }, [mode, id]);

  const handleToggleTool = (slug: string) => {
    setToolAccess((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) newSet.delete(slug);
      else newSet.add(slug);
      return newSet;
    });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: EmployeeCreate = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        department: data.department,
        position: data.position,
        max_working_hours: data.max_working_hours,
        is_active: data.is_active,
      };

      if (mode === "edit" && id) {
        await employeeAPI.updateEmployee(id, payload);
        console.log("Mitarbeiter aktualisiert");
        // sync tool access
        const current = await employeeAPI.getToolAccess(id);
        const currentSlugs = new Set(current.map((a) => a.tool.slug));
        for (const slug of toolAccess) {
          if (!currentSlugs.has(slug)) {
            const toolObj = tools.find((t) => t.slug === slug);
            if (toolObj) await employeeAPI.grantToolAccess(id, toolObj.id);
          }
        }
        for (const slug of currentSlugs) {
          if (!toolAccess.has(slug)) {
            const remove = current.find((a) => a.tool.slug === slug);
            if (remove) await employeeAPI.revokeToolAccess(remove.id);
          }
        }
      } else {
        await employeeAPI.createEmployee(payload);
        console.log("Mitarbeiter erstellt");
        reset();
      }
      onSuccess?.();
    } catch (error: any) {
      console.error("Fehler beim Speichern:", error);
      alert(`Fehler: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d]"></div>
          <span className="ml-3 text-gray-600">Lade Daten...</span>
        </div>
      </div>
    );
  }

  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));

  const positionOptions = positions.map((pos) => ({
    value: pos.id,
    label: pos.title,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {mode === "edit"
            ? "Mitarbeiter bearbeiten"
            : "Neuen Mitarbeiter hinzufügen"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Vorname"
            placeholder="z.B. Max"
            required
            error={errors.first_name?.message}
            {...register("first_name")}
          />

          <Input
            label="Nachname"
            placeholder="z.B. Mustermann"
            required
            error={errors.last_name?.message}
            {...register("last_name")}
          />
        </div>

        <Input
          label="E-Mail-Adresse"
          type="email"
          placeholder="max.mustermann@firma.de"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Abteilung"
            required
            options={departmentOptions}
            error={errors.department?.message}
            {...register("department", { valueAsNumber: true })}
          />

          <Select
            label="Position"
            required
            options={positionOptions}
            error={errors.position?.message}
            {...register("position", { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Maximale Arbeitsstunden pro Woche"
            type="number"
            min="1"
            max="60"
            placeholder="40"
            required
            error={errors.max_working_hours?.message}
            {...register("max_working_hours", { valueAsNumber: true })}
          />

          <div className="flex items-end">
            <Checkbox
              label="Mitarbeiter aktiv"
              description="Aktive Mitarbeiter werden in Listen angezeigt"
              {...register("is_active")}
            />
          </div>
        </div>

        {mode === "edit" && tools.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-2">
              Tool-Zugriffe
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <label key={tool.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={toolAccess.has(tool.slug)}
                    onChange={() => handleToggleTool(tool.slug)}
                    className="rounded text-[#ff863d] focus:ring-[#ff863d]"
                  />
                  <span className="text-sm text-gray-700">{tool.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff863d]"
            >
              Abbrechen
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-[#ff863d] border border-transparent rounded-md hover:bg-[#ed7c34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff863d] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Speichern..."
              : mode === "edit"
              ? "Aktualisieren"
              : "Erstellen"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EmployeeForm;
