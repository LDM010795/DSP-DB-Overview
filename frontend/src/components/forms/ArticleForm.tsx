import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { learningAPI } from "../../services/learningApi";

const schema = z.object({
  moduleId: z.string().min(1, "Modul wählen"),
  title: z.string().min(1, "Titel erforderlich"),
  url: z.string().url("Ungültige URL"),
});

type FormValues = z.infer<typeof schema>;

// Reusable components similar to VideoForm
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

interface ArticleFormProps {
  mode?: "create" | "edit";
  id?: number;
  initialData?: Partial<FormValues>;
  onSuccess?: (updated?: { id: number; title: string; url: string }) => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
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
      // get current article count for module to get order
      const detailRes = await learningAPI.getModule(data.moduleId);
      const articles = detailRes.data.articles ?? [];

      const payloadCreate = {
        module: Number(data.moduleId),
        title: data.title,
        url: data.url,
      } as const;

      const payloadUpdate = {
        title: data.title,
        url: data.url,
      } as const;

      let updated;
      if (mode === "edit" && id) {
        const res = await learningAPI.updateArticle(id, payloadUpdate as any);
        updated = res.data;
        console.log("Lernbeitrag aktualisiert");
      } else {
        await learningAPI.createArticle(payloadCreate as any);
        console.log("Lernbeitrag gespeichert");
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
        label="Titel"
        placeholder="Helpful Article"
        error={errors.title?.message}
        {...register("title")}
      />
      <Input
        label="URL"
        placeholder="https://..."
        error={errors.url?.message}
        {...register("url")}
      />
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

export default ArticleForm;
