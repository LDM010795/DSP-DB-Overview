import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { learningAPI } from "../../services/learningApi";

// ---------------- Schema ---------------------------------------------
const schema = z.object({
  moduleId: z.string().min(1, "Modul wählen"),
  title: z.string().min(1, "Titel erforderlich"),
  description: z.string().optional(),
  video_url: z.string().url("Ungültige URL"),
});

type FormValues = z.infer<typeof schema>;

// ---------------- UI Hilfskomponenten --------------------------------
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
  options?: SelectOption[];
  groups?: { label: string; options: SelectOption[] }[];
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  groups,
  error,
  ...rest
}) => (
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
      {groups
        ? groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))
        : options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// ---------------- Hauptkomponente -------------------------------------
interface VideoFormProps {
  mode?: "create" | "edit";
  id?: number;
  initialData?: Partial<FormValues>;
  onSuccess?: (updated?: {
    id: number;
    title: string;
    description?: string;
    video_url: string;
  }) => void;
}

const VideoForm: React.FC<VideoFormProps> = ({
  mode = "create",
  id,
  initialData,
  onSuccess,
}) => {
  // Modul-Liste laden
  const { data: modulesData } = useQuery({
    queryKey: ["modules-accessible"],
    queryFn: async () => {
      const res = await learningAPI.getModulesAll();
      return res.data as { id: number; title: string; is_public: boolean }[];
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData ?? {},
  });

  const selectedModuleId = watch("moduleId");

  // Reihenfolge berechnen, wenn Modul gewählt wird
  useEffect(() => {
    if (!selectedModuleId) return;
    (async () => {
      try {
        const res = await learningAPI.getModule(selectedModuleId);
        const contents = res.data.contents ?? [];
        const nextOrder = (contents.length ?? 0) + 1;
        (
          document.getElementById("orderInfo") as HTMLSpanElement | null
        )?.setAttribute("data-order", nextOrder.toString());
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedModuleId]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Hole aktuelle Videos des Moduls, um Reihenfolge zu bestimmen
      const detailRes = await learningAPI.getModule(data.moduleId);
      const contents = detailRes.data.contents ?? [];
      const order = (contents.length ?? 0) + 1;

      const payloadCreate = {
        module: Number(data.moduleId),
        title: data.title,
        description: data.description,
        video_url: data.video_url,
      } as const;

      const payloadUpdate = {
        title: data.title,
        description: data.description,
        video_url: data.video_url,
      } as const;

      let updated;
      if (mode === "edit" && id) {
        const res = await learningAPI.updateVideo(id, payloadUpdate as any);
        updated = res.data;
        console.log("Video aktualisiert");
      } else {
        await learningAPI.createVideo(payloadCreate as any);
        console.log(`Video gespeichert (Reihenfolge ${order})`);
        reset();
      }
      onSuccess?.(updated);
    } catch (e: unknown) {
      if (e instanceof Error) alert("Fehler: " + e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Modul-Auswahl"
        groups={(() => {
          const pub = modulesData?.filter((m) => m.is_public) ?? [];
          const priv = modulesData?.filter((m) => !m.is_public) ?? [];
          return [
            {
              label: "Öffentlich",
              options: pub.map((m) => ({
                value: m.id.toString(),
                label: m.title,
              })),
            },
            {
              label: "Nicht öffentlich",
              options: priv.map((m) => ({
                value: m.id.toString(),
                label: m.title,
              })),
            },
          ];
        })()}
        error={errors.moduleId?.message}
        {...register("moduleId")}
      />
      <Input
        label="Video-Titel"
        placeholder="Einführung"
        error={errors.title?.message}
        {...register("title")}
      />
      <TextArea
        label="Beschreibung"
        placeholder="Kurze Beschreibung..."
        error={errors.description?.message}
        {...register("description")}
      />
      <Input
        label="Video-URL"
        placeholder="https://..."
        error={errors.video_url?.message}
        {...register("video_url")}
      />
      {/* Order Info */}
      {selectedModuleId && (
        <p className="text-xs text-gray-500">
          Automatische Reihenfolge wird berechnet …
        </p>
      )}

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

export default VideoForm;
