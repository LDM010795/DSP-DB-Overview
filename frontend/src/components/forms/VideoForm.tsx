import React, { useEffect, useState } from "react";
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
  const { data: modulesData } = useQuery({
    queryKey: ["modules-accessible"],
    queryFn: async () => {
      const res = await learningAPI.getModulesAll();
      return res.data as { id: number; title: string; is_public: boolean }[];
    },
  });

  const [pendingVideos, setPendingVideos] = useState<FormValues[]>([]);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData ?? {},
  });

  const selectedModuleId = watch("moduleId");

  // Reset pending videos when module changes
  useEffect(() => {
    if (selectedModuleId) {
      setPendingVideos([]);
    }
  }, [selectedModuleId]);

  const handleAddVideo = (data: FormValues) => {
    if (data.moduleId && data.title && data.video_url) {
      setPendingVideos((prev) => [...prev, { ...data }]);
      reset({
        moduleId: data.moduleId, // Keep module selected
        title: "",
        description: "",
        video_url: "",
      });
    }
  };

  const handleRemoveVideo = (index: number) => {
    setPendingVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (pendingVideos.length === 0) return;

    setIsSavingAll(true);
    try {
      for (const video of pendingVideos) {
        const payloadCreate = {
          module: Number(video.moduleId),
          title: video.title,
          description: video.description,
          video_url: video.video_url,
        } as const;

        await learningAPI.createVideo(payloadCreate as any);
      }

      console.log(`${pendingVideos.length} Videos gespeichert`);
      setPendingVideos([]);
      reset();
    } catch (e: unknown) {
      if (e instanceof Error) alert("Fehler beim Speichern: " + e.message);
    } finally {
      setIsSavingAll(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (mode === "edit" && id) {
      // Edit mode - save single video
      try {
        const payloadUpdate = {
          title: data.title,
          description: data.description,
          video_url: data.video_url,
        } as const;

        const res = await learningAPI.updateVideo(id, payloadUpdate as any);
        console.log("Video aktualisiert");
        onSuccess?.(res.data);
      } catch (e: unknown) {
        if (e instanceof Error) alert("Fehler: " + e.message);
      }
    } else {
      // Create mode - add to pending list
      handleAddVideo(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Videos List */}
      {pendingVideos.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Videos zum Speichern ({pendingVideos.length})
          </h3>
          <div className="space-y-2">
            {pendingVideos.map((video, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded border"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{video.title}</p>
                  <p className="text-sm text-gray-600">{video.video_url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVideo(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSavingAll}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:opacity-50"
            >
              {isSavingAll
                ? "Speichern..."
                : `Alle ${pendingVideos.length} Videos speichern`}
            </button>
            <button
              type="button"
              onClick={() => setPendingVideos([])}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-md"
            >
              Liste leeren
            </button>
          </div>
        </div>
      )}

      {/* Video Form */}
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

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || mode === "edit"}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-[#ff863d] hover:bg-[#ed7c34] transition-colors text-white font-semibold rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff863d] disabled:opacity-50"
          >
            {isSubmitting
              ? "Hinzufügen..."
              : mode === "edit"
              ? "Aktualisieren"
              : "Video hinzufügen"}
          </button>

          {mode !== "edit" && pendingVideos.length > 0 && (
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSavingAll}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:opacity-50"
            >
              {isSavingAll ? "Speichern..." : "Alle speichern"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VideoForm;
