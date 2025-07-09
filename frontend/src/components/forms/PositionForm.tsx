import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { employeeAPI, type PositionCreate } from "../../services/employeeApi";

const schema = z.object({
  title: z.string().min(1, "Positionsbezeichnung erforderlich").max(100, "Maximal 100 Zeichen"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
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

const TextArea: React.FC<TextAreaProps> = ({ label, error, ...rest }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      rows={3}
      className={clsx(
        "mt-1 block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-[#ff863d] focus:border-[#ff863d] sm:text-sm",
        error ? "border-red-500" : "border-gray-300"
      )}
      {...rest}
    />
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
        <label className="font-medium text-gray-700">
          {label}
        </label>
        {description && (
          <p className="text-gray-500">{description}</p>
        )}
      </div>
    </div>
  </div>
);

interface PositionFormProps {
  mode?: "create" | "edit";
  id?: number;
  initialData?: Partial<FormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PositionForm: React.FC<PositionFormProps> = ({
  mode = "create",
  id,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_active: true,
      ...initialData,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: PositionCreate = {
        title: data.title,
        description: data.description || undefined,
        is_active: data.is_active,
      };

      if (mode === "edit" && id) {
        await employeeAPI.updatePosition(id, payload);
        console.log("Position aktualisiert");
      } else {
        await employeeAPI.createPosition(payload);
        console.log("Position erstellt");
        reset();
      }
      onSuccess?.();
    } catch (error: any) {
      console.error("Fehler beim Speichern:", error);
      alert(`Fehler: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {mode === "edit" ? "Position bearbeiten" : "Neue Position"}
        </h3>
        
        <Input
          label="Positionsbezeichnung"
          placeholder="z.B. Software Engineer, Projektmanager, Team Lead"
          required
          error={errors.title?.message}
          {...register("title")}
        />

        <TextArea
          label="Beschreibung"
          placeholder="Optionale Beschreibung der Position und Aufgabenbereiche..."
          error={errors.description?.message}
          {...register("description")}
        />

        <Checkbox
          label="Position aktiv"
          description="Nur aktive Positionen können Mitarbeitern zugeordnet werden"
          {...register("is_active")}
        />

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
            {isSubmitting ? "Speichern..." : mode === "edit" ? "Aktualisieren" : "Erstellen"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PositionForm; 