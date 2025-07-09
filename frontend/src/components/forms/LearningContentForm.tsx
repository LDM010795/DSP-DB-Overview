import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { learningAPI } from "../../services/learningApi";

// ----- Schemas ------------------------------------------------------------

const moduleSchema = z.object({
  contentType: z.literal("module"),
  title: z.string().min(3, "Titel zu kurz"),
  category: z.string().min(1, "Kategorie erforderlich"),
  is_public: z.boolean().optional(),
});

const videoSchema = z.object({
  contentType: z.literal("video"),
  moduleId: z.string().min(1, "Modul-ID erforderlich"),
  title: z.string().min(3),
  description: z.string().optional(),
  video_url: z.string().url("Ungültige URL"),
});

const resourceSchema = z.object({
  contentType: z.literal("resource"),
  contentId: z.string().min(1, "Content-ID erforderlich"),
  label: z.string().min(1),
  url: z.string().url("Ungültige URL"),
});

const formSchema = z.discriminatedUnion("contentType", [
  moduleSchema,
  videoSchema,
  resourceSchema,
]);

type FormSchema = z.infer<typeof formSchema>;

// ----- Helper Komponenten -------------------------------------------------
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
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
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

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

// ----- Hauptformular ------------------------------------------------------

const LearningContentForm: React.FC = () => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: "module",
    } as any,
  });

  const contentType = watch("contentType");

  const onSubmit = async (data: FormSchema) => {
    try {
      if (data.contentType === "module") {
        await learningAPI.createModule({
          title: data.title,
          category: data.category,
          is_public: data.is_public,
        });
      } else if (data.contentType === "video") {
        await learningAPI.createVideo({
          moduleId: data.moduleId,
          title: data.title,
          description: data.description,
          video_url: data.video_url,
        });
      } else if (data.contentType === "resource") {
        await learningAPI.createResource({
          contentId: data.contentId,
          label: data.label,
          url: data.url,
        });
      }

      alert("Erfolgreich gespeichert");
      reset();
    } catch (error: any) {
      alert("Fehler beim Speichern: " + (error?.message ?? ""));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Auswahl Content-Typ */}
      <Select
        label="Typ auswählen"
        options={[
          { value: "module", label: "Modul" },
          { value: "video", label: "Lernvideo" },
          { value: "resource", label: "Ressource" },
        ]}
        error={errors.contentType?.message as string | undefined}
        {...register("contentType")}
      />

      {/* Dynamische Felder */}
      {contentType === "module" && (
        <>
          <Input
            label="Titel"
            placeholder="Python Basics"
            error={errors.title?.message as string | undefined}
            {...register("title")}
          />
          <Input
            label="Kategorie"
            placeholder="Python"
            error={errors.category?.message as string | undefined}
            {...register("category")}
          />
          <div className="mb-4 flex items-center space-x-2">
            <input type="checkbox" id="is_public" {...register("is_public")} />
            <label htmlFor="is_public" className="text-sm text-gray-700">
              Öffentlich sichtbar
            </label>
          </div>
        </>
      )}

      {contentType === "video" && (
        <>
          <Input
            label="Modul-ID"
            placeholder="1"
            error={errors.moduleId?.message as string | undefined}
            {...register("moduleId")}
          />
          <Input
            label="Titel"
            placeholder="Einführungsvideo"
            error={errors.title?.message as string | undefined}
            {...register("title")}
          />
          <TextArea
            label="Beschreibung"
            placeholder="Kurze Beschreibung..."
            error={errors.description?.message as string | undefined}
            {...register("description")}
          />
          <Input
            label="Video URL"
            placeholder="https://..."
            error={errors.video_url?.message as string | undefined}
            {...register("video_url")}
          />
        </>
      )}

      {contentType === "resource" && (
        <>
          <Input
            label="Content-ID"
            placeholder="10"
            error={errors.contentId?.message as string | undefined}
            {...register("contentId")}
          />
          <Input
            label="Label"
            placeholder="Github Repo"
            error={errors.label?.message as string | undefined}
            {...register("label")}
          />
          <Input
            label="URL"
            placeholder="https://..."
            error={errors.url?.message as string | undefined}
            {...register("url")}
          />
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 bg-[#ff863d] border border-transparent rounded-md font-semibold text-white hover:bg-[#ed7c34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff863d]"
      >
        {isSubmitting ? "Speichern..." : "Speichern"}
      </button>
    </form>
  );
};

export default LearningContentForm;
