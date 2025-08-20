import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { learningAPI } from "../../services/learningApi";
import { authService } from "../../services/authService";

const schema = z.object({
  moduleId: z.string().min(1, "Modul wählen"),
  chapterId: z.string().min(1, "Kapitel wählen"),
  title: z.string().min(1, "Titel erforderlich"),
  description: z.string().min(1, "Beschreibung erforderlich"),
  difficulty: z.string().min(1, "Schwierigkeitsgrad wählen"),
  hint: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// Reusable components
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
      {...rest}
      className={clsx(
        "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff863d] focus:border-[#ff863d]",
        error ? "border-red-500" : "border-gray-300"
      )}
      rows={4}
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

interface TaskFormProps {
  mode?: "create" | "edit";
  initialData?: {
    id?: number;
    moduleId?: string | number;
    chapterId?: string | number;
    chapter?: number; // Alternative field name from API
    title?: string;
    description?: string;
    difficulty?: string;
    hint?: string;
  };
  moduleId?: number; // New prop for pre-selecting module
  chapterId?: number; // New prop for pre-selecting chapter
  onSuccess?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  mode = "create",
  initialData,
  moduleId,
  chapterId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  // Debug state
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    console.log(`🔍 [DEBUG] ${message}`);
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };
  const [multipleChoiceQuestions, setMultipleChoiceQuestions] = useState<
    Array<{
      question: string;
      option1: string;
      option2: string;
      option3: string;
      option4: string;
      correctAnswer: number;
    }>
  >([
    {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: 0,
    },
  ]);

  // Fetch modules and chapters for dropdowns
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: learningAPI.getModulesAll,
  });

  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ["chapters"],
    queryFn: learningAPI.getChaptersAll,
  });

  // Prepare default values properly handling API response format
  const prepareDefaultValues = React.useMemo(() => {
    if (initialData) {
      return {
        moduleId:
          initialData.moduleId?.toString() || moduleId?.toString() || "",
        chapterId:
          (initialData.chapterId || initialData.chapter)?.toString() ||
          chapterId?.toString() ||
          "",
        title: initialData.title || "",
        description: initialData.description || "",
        difficulty: initialData.difficulty || "Mittel",
        hint: initialData.hint || "",
      };
    }

    return {
      moduleId: moduleId?.toString() || "",
      chapterId: chapterId?.toString() || "",
      title: "",
      description: "",
      difficulty: "Mittel",
      hint: "",
    };
  }, [initialData, moduleId, chapterId]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: prepareDefaultValues,
  });

  const watchedModuleId = watch("moduleId");

  // Update form values when initialData changes (for edit mode)
  React.useEffect(() => {
    if (initialData && mode === "edit") {
      const newValues = {
        moduleId:
          initialData.moduleId?.toString() || moduleId?.toString() || "",
        chapterId:
          (initialData.chapterId || initialData.chapter)?.toString() ||
          chapterId?.toString() ||
          "",
        title: initialData.title || "",
        description: initialData.description || "",
        difficulty: initialData.difficulty || "Mittel",
        hint: initialData.hint || "",
      };

      console.log(
        "🔍 [TaskForm] Updating form values for edit mode:",
        newValues
      );
      reset(newValues);

      // Load existing multiple choice questions for this task
      if (initialData.id) {
        console.log(
          "🔍 [TaskForm] Loading multiple choice questions for task:",
          initialData.id
        );
        learningAPI
          .getTaskMultipleChoiceByTask(initialData.id)
          .then((response) => {
            console.log(
              "🔍 [TaskForm] Multiple choice questions loaded:",
              response.data
            );
            if (
              response.data &&
              Array.isArray(response.data) &&
              response.data.length > 0
            ) {
              const loadedQuestions = response.data.map(
                (q: {
                  question?: string;
                  option_1?: string;
                  option_2?: string;
                  option_3?: string;
                  option_4?: string;
                  correct_answer?: number;
                }) => ({
                  question: q.question || "",
                  option1: q.option_1 || "",
                  option2: q.option_2 || "",
                  option3: q.option_3 || "",
                  option4: q.option_4 || "",
                  correctAnswer: q.correct_answer || 0,
                })
              );
              setMultipleChoiceQuestions(loadedQuestions);
            }
          })
          .catch((error) => {
            console.error(
              "❌ [TaskForm] Error loading multiple choice questions:",
              error
            );
          });
      }
    }
  }, [initialData, mode, moduleId, chapterId, reset]);

  // Filter chapters by selected module
  const filteredChapters = React.useMemo(() => {
    if (!chaptersData?.data || !watchedModuleId) {
      console.log("🔍 [TaskForm] No chapters data or no module selected");
      console.log("🔍 chaptersData:", chaptersData);
      console.log("🔍 watchedModuleId:", watchedModuleId);
      return [];
    }

    console.log("🔍 [TaskForm] Filtering chapters:");
    console.log(
      "🔍 watchedModuleId:",
      watchedModuleId,
      "type:",
      typeof watchedModuleId
    );
    console.log("🔍 chaptersData:", chaptersData.data);
    console.log("🔍 chaptersData type:", typeof chaptersData.data);
    console.log("🔍 is array:", Array.isArray(chaptersData.data));

    if (!Array.isArray(chaptersData.data)) {
      console.log("🔍 chaptersData.data is not an array!");
      return [];
    }

    const filtered = chaptersData.data.filter(
      (chapter: Record<string, unknown>) => {
        console.log("🔍 Checking chapter:", chapter);
        console.log("🔍 chapter keys:", Object.keys(chapter));

        // Try different possible field names
        const moduleId =
          chapter.module_id || chapter.moduleId || chapter.module;
        console.log(
          "🔍 chapter module ID:",
          moduleId,
          "type:",
          typeof moduleId
        );
        console.log(
          "🔍 watchedModuleId:",
          watchedModuleId,
          "type:",
          typeof watchedModuleId
        );

        const matches = moduleId === parseInt(watchedModuleId);
        console.log("🔍 matches:", matches);

        return matches;
      }
    );

    console.log("🔍 Filtered chapters:", filtered);
    return filtered;
  }, [chaptersData, watchedModuleId]);

  // Reset chapter selection when module changes
  React.useEffect(() => {
    if (watchedModuleId) {
      setValue("chapterId", "");
    }
  }, [watchedModuleId, setValue]);

  const handleAddMultipleChoiceQuestion = () => {
    setMultipleChoiceQuestions([
      ...multipleChoiceQuestions,
      {
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctAnswer: 0,
      },
    ]);
  };

  const handleRemoveMultipleChoiceQuestion = (index: number) => {
    if (multipleChoiceQuestions.length > 1) {
      setMultipleChoiceQuestions(
        multipleChoiceQuestions.filter((_, i) => i !== index)
      );
    }
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newQuestions = [...multipleChoiceQuestions];
    (newQuestions[index] as Record<string, string | number>)[field] = value;
    setMultipleChoiceQuestions(newQuestions);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const isEditMode = mode === "edit" && initialData?.id;

      addDebugInfo(`🚀 Starting task ${isEditMode ? "update" : "creation"}...`);
      addDebugInfo(`📝 Form data: ${JSON.stringify(data, null, 2)}`);
      addDebugInfo(`📝 Initial data: ${JSON.stringify(initialData, null, 2)}`);
      addDebugInfo(`📝 Mode: ${mode}`);
      addDebugInfo(
        `❓ Multiple choice questions: ${JSON.stringify(
          multipleChoiceQuestions,
          null,
          2
        )}`
      );
      addDebugInfo(`🔍 Form errors: ${JSON.stringify(errors, null, 2)}`);
      addDebugInfo(`🔍 Is submitting: ${isSubmitting}`);

      // Check authentication
      const isAuth = authService.isAuthenticated();
      addDebugInfo(`🔐 Authentication check: ${isAuth}`);

      if (!isAuth) {
        addDebugInfo("❌ User not authenticated");
        alert("Sie sind nicht eingeloggt. Bitte melden Sie sich an.");
        return;
      }

      // Validate required fields
      addDebugInfo("🔍 Validating required fields...");
      if (
        !data.moduleId ||
        !data.chapterId ||
        !data.title ||
        !data.description
      ) {
        addDebugInfo("❌ Required fields missing");
        alert(
          "Bitte füllen Sie alle Pflichtfelder aus (Modul, Kapitel, Titel, Beschreibung)"
        );
        return;
      }
      addDebugInfo("✅ All required fields present");

      // Prepare task payload
      const taskPayload = {
        chapter: parseInt(data.chapterId),
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        hint: data.hint || "",
      };

      addDebugInfo(
        `📤 Sending task payload: ${JSON.stringify(taskPayload, null, 2)}`
      );

      let taskResponse;
      let taskId;

      if (isEditMode) {
        addDebugInfo(`🌐 Making API call to update task ${initialData.id}...`);
        taskResponse = await learningAPI.updateTask(
          initialData.id!,
          taskPayload
        );
        addDebugInfo(
          `✅ Task updated successfully: ${JSON.stringify(
            taskResponse.data,
            null,
            2
          )}`
        );
        taskId = initialData.id;
      } else {
        addDebugInfo("🌐 Making API call to create task...");
        taskResponse = await learningAPI.createTask(taskPayload);
        addDebugInfo(
          `✅ Task created successfully: ${JSON.stringify(
            taskResponse.data,
            null,
            2
          )}`
        );
        taskId = taskResponse.data.id;
      }

      addDebugInfo(`🆔 Task ID: ${taskId}`);

      // Then, create multiple choice questions for this task
      addDebugInfo(
        `📝 Processing ${multipleChoiceQuestions.length} multiple choice questions...`
      );
      let questionsCreated = 0;
      for (let i = 0; i < multipleChoiceQuestions.length; i++) {
        const question = multipleChoiceQuestions[i];
        addDebugInfo(
          `🔍 Processing question ${i + 1}: ${question.question.substring(
            0,
            50
          )}...`
        );

        if (
          question.question.trim() &&
          question.option1.trim() &&
          question.option2.trim()
        ) {
          const questionPayload = {
            task: taskId,
            question: question.question,
            option_1: question.option1,
            option_2: question.option2,
            option_3: question.option3,
            option_4: question.option4,
            correct_answer: question.correctAnswer,
          };

          addDebugInfo(
            `📤 Sending question ${i + 1} payload: ${JSON.stringify(
              questionPayload,
              null,
              2
            )}`
          );
          try {
            await learningAPI.createTaskMultipleChoice(questionPayload);
            questionsCreated++;
            addDebugInfo(`✅ Question ${i + 1} created successfully`);
          } catch (questionError: unknown) {
            const error = questionError as {
              response?: { data?: unknown };
              message?: string;
            };
            addDebugInfo(
              `❌ Failed to create question ${i + 1}: ${
                error.response?.data || error.message
              }`
            );
            // Continue with other questions even if one fails
          }
        } else {
          addDebugInfo(
            `⚠️ Skipping question ${i + 1} - missing required fields`
          );
        }
      }

      console.log(
        `🎉 [TaskForm] Success! ${
          isEditMode ? "Updated" : "Created"
        } task with ${questionsCreated} questions`
      );

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["modules-all"] });
      queryClient.invalidateQueries({ queryKey: ["module-details"] });

      if (!isEditMode) {
        reset();
        setMultipleChoiceQuestions([
          {
            question: "",
            option1: "",
            option2: "",
            option3: "",
            option4: "",
            correctAnswer: 0,
          },
        ]);
      }

      alert(
        `Aufgabe "${data.title}" erfolgreich ${
          isEditMode ? "aktualisiert" : "erstellt"
        }!`
      );
      onSuccess?.();
    } catch (error: unknown) {
      console.error("❌ [TaskForm] Error during task creation:", error);

      // Type-safe error handling
      const axiosError = error as {
        message?: string;
        response?: {
          data?: unknown;
          status?: number;
          statusText?: string;
        };
      };

      console.error("❌ [TaskForm] Error details:", {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
      });

      // Show user-friendly error message
      let errorMessage = "Fehler beim Speichern der Aufgabe";

      if (axiosError.response?.status === 401) {
        errorMessage = "Sie sind nicht eingeloggt. Bitte melden Sie sich an.";
      } else if (axiosError.response?.status === 400) {
        const responseData = axiosError.response.data as
          | { detail?: string; message?: string }
          | undefined;
        errorMessage = `Validierungsfehler: ${
          responseData?.detail || responseData?.message || "Ungültige Daten"
        }`;
      } else if (axiosError.response?.status === 403) {
        errorMessage = "Sie haben keine Berechtigung, Aufgaben zu erstellen.";
      } else if (
        axiosError.response?.status &&
        axiosError.response.status >= 500
      ) {
        errorMessage = "Serverfehler. Bitte versuchen Sie es später erneut.";
      } else if (axiosError.message === "Network Error") {
        errorMessage =
          "Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.";
      }

      alert(errorMessage);
    }
  };

  if (modulesLoading || chaptersLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff863d]"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Modul-Auswahl */}
        <Select
          label="Modul *"
          error={errors.moduleId?.message}
          {...register("moduleId")}
        >
          <option value="">-- Modul wählen --</option>
          {modulesData?.data?.map((module: { id: number; title: string }) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </Select>

        {/* Kapitel-Auswahl */}
        <Select
          label="Kapitel *"
          error={errors.chapterId?.message}
          {...register("chapterId")}
          disabled={!watchedModuleId}
        >
          <option value="">
            {watchedModuleId
              ? "-- Kapitel wählen --"
              : "-- Zuerst Modul wählen --"}
          </option>
          {filteredChapters.map((chapter: { id: number; title: string }) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Titel */}
        <Input
          label="Titel *"
          error={errors.title?.message}
          {...register("title")}
          placeholder="Aufgabentitel eingeben"
        />

        {/* Schwierigkeitsgrad */}
        <Select
          label="Schwierigkeitsgrad *"
          error={errors.difficulty?.message}
          {...register("difficulty")}
        >
          <option value="">-- Schwierigkeit wählen --</option>
          <option value="Einfach">Einfach</option>
          <option value="Mittel">Mittel</option>
          <option value="Schwer">Schwer</option>
        </Select>
      </div>

      {/* Beschreibung */}
      <TextArea
        label="Beschreibung *"
        error={errors.description?.message}
        {...register("description")}
        placeholder="Aufgabenbeschreibung eingeben"
      />

      {/* Hinweis */}
      <TextArea
        label="Hinweis (optional)"
        error={errors.hint?.message}
        {...register("hint")}
        placeholder="Optionaler Hinweis für die Lernenden"
      />

      {/* Multiple Choice Fragen */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Multiple Choice Fragen
        </h3>

        {multipleChoiceQuestions.map((question, questionIndex) => (
          <div
            key={questionIndex}
            className="border border-gray-200 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-800">
                Frage {questionIndex + 1}
              </h4>
              {multipleChoiceQuestions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveMultipleChoiceQuestion(questionIndex)
                  }
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Frage */}
            <TextArea
              label="Frage *"
              value={question.question}
              onChange={(e) =>
                handleQuestionChange(questionIndex, "question", e.target.value)
              }
              placeholder="Frage eingeben"
            />

            {/* Optionen */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Option 1 *"
                value={question.option1}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, "option1", e.target.value)
                }
                placeholder="Erste Option"
              />
              <Input
                label="Option 2 *"
                value={question.option2}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, "option2", e.target.value)
                }
                placeholder="Zweite Option"
              />
              <Input
                label="Option 3 *"
                value={question.option3}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, "option3", e.target.value)
                }
                placeholder="Dritte Option"
              />
              <Input
                label="Option 4 *"
                value={question.option4}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, "option4", e.target.value)
                }
                placeholder="Vierte Option"
              />
            </div>

            {/* Korrekte Antwort */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Korrekte Antwort *
              </label>
              <div className="flex gap-4">
                {[0, 1, 2, 3].map((optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correctAnswer-${questionIndex}`}
                      value={optionIndex}
                      checked={question.correctAnswer === optionIndex}
                      onChange={(e) =>
                        handleQuestionChange(
                          questionIndex,
                          "correctAnswer",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                    <label className="text-sm text-gray-600">
                      Option {optionIndex + 1}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddMultipleChoiceQuestion}
          className="px-4 py-2 bg-[#ff863d] text-white rounded-md hover:bg-[#e6752e] focus:outline-none focus:ring-2 focus:ring-[#ff863d] focus:ring-offset-2"
        >
          Multiple Choice Frage hinzufügen
        </button>
      </div>

      {/* Debug Panel */}
      {debugInfo.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Debug Info:
          </h3>
          <div className="max-h-40 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-xs text-gray-600 mb-1">
                {info}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDebugInfo([])}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Debug-Info löschen
          </button>
        </div>
      )}

      {/* Test Button */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => {
            addDebugInfo("🧪 Test button clicked!");
            addDebugInfo(`🔍 Form errors: ${JSON.stringify(errors, null, 2)}`);
            addDebugInfo(`🔍 Form values: ${JSON.stringify(watch(), null, 2)}`);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          🧪 Test Form
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => {
            addDebugInfo("🖱️ Submit button clicked!");
            addDebugInfo(
              `🔍 Form is valid: ${Object.keys(errors).length === 0}`
            );
          }}
          className="px-6 py-2 bg-[#ff863d] text-white rounded-md hover:bg-[#e6752e] focus:outline-none focus:ring-2 focus:ring-[#ff863d] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Speichern..."
            : mode === "create"
            ? "Aufgabe erstellen"
            : "Aufgabe aktualisieren"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
