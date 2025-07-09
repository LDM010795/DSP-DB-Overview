import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { learningAPI, type ModulePayload } from "../../services/learningApi";
import { useQuery } from "@tanstack/react-query";

const schema = z.object({
  title: z.string().min(1, "Titel erforderlich"),
  category: z.string().min(1, "Kategorie wählen"),
  is_public: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

// Reusable Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
const Input: React.FC<InputProps> = ({ label, error, ...rest }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
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

interface SelectOption {
  value: string;
  label: string;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, error, ...rest }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      className={clsx(
        "mt-1 block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-[#ff863d] focus:border-[#ff863d] sm:text-sm",
        error ? "border-red-500" : "border-gray-300"
      )}
      {...rest}
    >
      <option value="">-- Kategorie wählen --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface ModuleFormProps {
  mode?: "create" | "edit";
  id?: number;
  initialData?: Partial<FormValues>;
  onSuccess?: () => void;
}

const ModuleForm: React.FC<ModuleFormProps> = ({
  mode = "create",
  id,
  initialData,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData ?? {},
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: ModulePayload = {
        title: data.title,
        category_id: Number(data.category),
        is_public: data.is_public,
      };

      console.log("[ModuleForm] Payload:", payload);

      if (mode === "edit" && id) {
        await learningAPI.updateModule(id, payload);
        console.log("Modul aktualisiert");
      } else {
        await learningAPI.createModule(payload);
        console.log("Modul gespeichert");
        reset();
      }
      onSuccess?.();
    } catch (e: unknown) {
      if (e instanceof Error) alert("Fehler: " + e.message);
    }
  };

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await learningAPI.getCategories();
      return res.data as { id: number; name: string }[];
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Titel"
        placeholder="Python Basics"
        error={errors.title?.message}
        {...register("title")}
      />
      {/* Kategorien Select */}
      <Select
        label="Kategorie"
        options={
          categoriesData?.map((c) => ({
            value: c.id.toString(),
            label: c.name,
          })) ?? []
        }
        error={errors.category?.message}
        {...register("category")}
      />
      <div className="mb-4 flex items-center space-x-2">
        <input type="checkbox" id="is_public" {...register("is_public")} />
        <label htmlFor="is_public" className="text-sm text-gray-700">
          Öffentlich sichtbar
        </label>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#ff863d] hover:bg-[#ed7c34] transition-colors text-white font-semibold rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff863d] disabled:opacity-50"
      >
        {isSubmitting ? "Speichern..." : "Speichern"}
      </button>
    </form>
  );
};

export default ModuleForm;
