/**
 * Category List Component - DSP Database Overview Frontend
 *
 * Diese Komponente verwaltet die Anzeige und Bearbeitung von Kategorien:
 * - Liste aller verfügbaren Kategorien
 * - Inline-Bearbeitung von Kategorienamen
 * - Integration mit React Query für Caching
 * - Optimistische UI-Updates
 * 
 * Features:
 * - Real-time Kategorien-Anzeige
 * - Inline-Bearbeitung ohne Modal
 * - Automatische Cache-Invalidierung
 * - Loading- und Error-States
 * - Responsive Design
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { learningAPI } from "../services/learningApi";
import CategoryForm from "./forms/CategoryForm";

/**
 * Category List Komponente für Kategorien-Verwaltung
 * 
 * Zeigt eine Liste aller Kategorien an und ermöglicht die
 * Inline-Bearbeitung von Kategorienamen.
 */
const CategoryList: React.FC = () => {
  const queryClient = useQueryClient();

  // --- State Management ---
  const [editing, setEditing] = React.useState<{ id: number; name: string } | null>(null);

  // --- Data Fetching ---
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await learningAPI.getCategories();
      return res.data as { id: number; name: string }[];
    },
  });

  // --- Loading State ---
  if (isLoading) return <p>Lade Kategorien…</p>;
  
  // --- Error State ---
  if (error) return <p className="text-red-600">Fehler beim Laden der Kategorien</p>;

  return (
    <div>
      {/* --- Kategorien-Header --- */}
      <h3 className="font-semibold mb-4">Bestehende Kategorien</h3>
      
      {/* --- Leere Liste --- */}
      {data && data.length === 0 && (
        <p className="text-gray-500 text-sm">Noch keine Kategorien.</p>
      )}
      
      {/* --- Kategorien-Liste --- */}
      <ul className="space-y-2">
        {data?.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
            <span>{cat.name}</span>
            <button
              className="text-sm text-[#ff863d] hover:underline"
              onClick={() => setEditing(cat)}
            >
              Bearbeiten
            </button>
          </li>
        ))}
      </ul>

      {/* --- Edit-Modus --- */}
      {editing && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold mb-2">Kategorie bearbeiten</h4>
          <CategoryForm
            mode="edit"
            id={editing.id}
            initialData={{ name: editing.name }}
            onSuccess={() => {
              setEditing(null);
              refetch();
              queryClient.invalidateQueries({ queryKey: ["categories"] });
            }}
          />
          <button
            className="mt-2 text-sm text-gray-500 hover:underline"
            onClick={() => setEditing(null)}
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryList; 