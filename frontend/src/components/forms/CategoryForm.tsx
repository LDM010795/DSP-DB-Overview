import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { learningAPI } from "../../services/learningApi";

const schema = z.object({
  name: z.string().min(1, "Name erforderlich"),
});

type FormValues = z.infer<typeof schema>;

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

interface CategoryFormProps {
  mode?: "create" | "edit";
  id?: number;
  initialData?: Partial<FormValues>;
  onSuccess?: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
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
      if (mode === "edit" && id) {
        await learningAPI.updateCategory(id, { name: data.name });
        console.log("Kategorie aktualisiert");
      } else {
        await learningAPI.createCategory({ name: data.name });
        console.log("Kategorie gespeichert");
        reset();
      }
      onSuccess?.();
    } catch (e: unknown) {
      if (e instanceof Error) alert("Fehler: " + e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Kategorie-Name"
        placeholder="Data Engineering"
        error={errors.name?.message}
        {...register("name")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#ff863d] hover:bg-[#ed7c34] transition-colors text-white font-semibold rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff863d] disabled:opacity-50"
      >
        {isSubmitting ? "Speichern…" : "Speichern"}
      </button>
    </form>
  );
};

export default CategoryForm;
