import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { learningAPI } from "../../services/learningApi";

const schema = z.object({
  moduleId: z.string().min(1, "Modul wählen"),
  cloudUrl: z.string().url("Ungültige Cloud-URL"),
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
      {...rest}
      className={clsx(
        "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff863d] focus:border-[#ff863d]",
        error ? "border-red-500" : "border-gray-300"
      )}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}
const Select: React.FC<SelectProps> = ({ label, error, children, ...rest }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      {...rest}
      className={clsx(
        "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff863d] focus:border-[#ff863d]",
        error ? "border-red-500" : "border-gray-300"
      )}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface ArticleFormProps {
  mode?: "create" | "edit";
  initialData?: any;
  onSuccess?: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  mode = "create",
  initialData,
  onSuccess,
}) => {
  const [pendingArticles, setPendingArticles] = useState<FormValues[]>([]);
  const [isSavingAll, setIsSavingAll] = useState(false);

  // Fetch modules for dropdown
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: learningAPI.getModulesAll,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      moduleId: "",
      cloudUrl: "",
    },
  });

  const watchedModuleId = watch("moduleId");

  const handleAddArticle = (data: FormValues) => {
    if (data.moduleId && data.cloudUrl) {
      setPendingArticles((prev) => [...prev, { ...data }]);
      reset({
        moduleId: data.moduleId, // Keep module selected
        cloudUrl: "", // Clear URL for next entry
      });
    }
  };

  const handleRemoveArticle = (index: number) => {
    setPendingArticles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (pendingArticles.length === 0) return;

    setIsSavingAll(true);
    try {
      for (const article of pendingArticles) {
        const payloadCreate = {
          moduleId: article.moduleId,
          cloudUrl: article.cloudUrl,
        } as const;

        await learningAPI.createArticleFromCloud(payloadCreate as any);
      }

      console.log(`${pendingArticles.length} Artikel gespeichert`);
      setPendingArticles([]);
      onSuccess?.();
    } catch (error) {
      console.error("Fehler beim Speichern der Artikel:", error);
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleClearAll = () => {
    setPendingArticles([]);
  };

  const onSubmit = async (data: FormValues) => {
    if (mode === "edit") {
      // Handle edit mode
      try {
        await learningAPI.updateArticle(initialData.id, data);
        onSuccess?.();
      } catch (error) {
        console.error("Fehler beim Aktualisieren:", error);
      }
    } else {
      // Add to pending list
      handleAddArticle(data);
    }
  };

  if (modulesLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {mode === "edit" ? "Artikel bearbeiten" : "Artikel aus Cloud Storage"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Modul"
          error={errors.moduleId?.message}
          {...register("moduleId")}
        >
          <option value="">Modul auswählen</option>
          {modulesData?.data?.map((module: any) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </Select>

        <Input
          label="Cloud-URL des Word-Dokuments"
          placeholder="https://s3.eu-central-2.wasabisys.com/dsp-e-learning/Lerninhalte/SQL/Artikel/1.1 Installation und erste Schritte.docx"
          error={errors.cloudUrl?.message}
          {...register("cloudUrl")}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-[#ff863d] hover:bg-[#ed7c34] transition-colors text-white font-semibold rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff863d] disabled:opacity-50"
        >
          {isSubmitting
            ? "Hinzufügen..."
            : mode === "edit"
            ? "Aktualisieren"
            : "Artikel hinzufügen"}
        </button>

        {mode !== "edit" && pendingArticles.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Artikel zum Speichern ({pendingArticles.length})
            </h3>

            <div className="space-y-2">
              {pendingArticles.map((article, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-3 rounded border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Modul:{" "}
                      {
                        modulesData?.data?.find(
                          (m: any) => m.id === article.moduleId
                        )?.title
                      }
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {article.cloudUrl}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveArticle(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSavingAll}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:opacity-50"
              >
                {isSavingAll
                  ? "Speichern..."
                  : `Alle ${pendingArticles.length} Artikel speichern`}
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-md"
              >
                Liste leeren
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ArticleForm;
