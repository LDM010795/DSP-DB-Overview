import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { learningAPI, type ChapterPayload } from "../../services/learningApi";
import { useQuery } from "@tanstack/react-query";

const schema = z.object({
  moduleId: z.string().min(1, "Modul wählen"),
  title: z.string().min(1, "Titel erforderlich"),
  description: z.string().optional(),
  order: z.number().min(0, "Reihenfolge muss 0 oder größer sein"),
  is_active: z.boolean().optional(),
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

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}
const TextArea: React.FC<TextAreaProps> = ({ label, error, ...rest }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      className={clsx(
        "mt-1 block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-[#ff863d] focus:border-[#ff863d] sm:text-sm",
        error ? "border-red-500" : "border-gray-300"
      )}
      rows={4}
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
      <option value="">-- Modul wählen --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface ChapterFormProps {
  mode?: "create" | "edit";
  id?: number;
  initialData?: Partial<FormValues>;
  moduleId?: number; // New prop for pre-selecting module
  onSuccess?: () => void;
}

const ChapterForm: React.FC<ChapterFormProps> = ({
  mode = "create",
  id,
  initialData,
  moduleId,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData ?? {
      order: 0,
      is_active: true,
      moduleId: moduleId?.toString() || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: ChapterPayload = {
        module_id: Number(data.moduleId),
        title: data.title,
        description: data.description,
        order: data.order,
        is_active: data.is_active,
      };

      console.log("[ChapterForm] Payload:", payload);

      if (mode === "edit" && id) {
        await learningAPI.updateChapter(id, payload);
        console.log("Kapitel aktualisiert");
      } else {
        await learningAPI.createChapter(payload);
        console.log("Kapitel gespeichert");
        reset();
      }
      onSuccess?.();
    } catch (e: unknown) {
      if (e instanceof Error) alert("Fehler: " + e.message);
    }
  };

  const { data: modulesData } = useQuery({
    queryKey: ["modules-accessible"],
    queryFn: async () => {
      const res = await learningAPI.getModulesAll();
      return res.data as { id: number; title: string; is_public: boolean }[];
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Modul"
        options={
          modulesData?.map((m) => ({
            value: m.id.toString(),
            label: m.title,
          })) ?? []
        }
        error={errors.moduleId?.message}
        {...register("moduleId")}
      />
      <Input
        label="Titel"
        placeholder="Einführung in Python"
        error={errors.title?.message}
        {...register("title")}
      />
      <TextArea
        label="Beschreibung"
        placeholder="Kurze Beschreibung des Kapitels..."
        error={errors.description?.message}
        {...register("description")}
      />
      <Input
        label="Reihenfolge"
        type="number"
        min="0"
        placeholder="0"
        error={errors.order?.message}
        {...register("order", { valueAsNumber: true })}
      />
      <div className="mb-4 flex items-center space-x-2">
        <input type="checkbox" id="is_active" {...register("is_active")} />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Aktiv (sichtbar für Benutzer)
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

export default ChapterForm;
