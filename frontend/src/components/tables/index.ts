/**
 * Table Components Index - DSP Database Overview Frontend
 *
 * Export-Datei für alle Tabellen-Komponenten:
 * - DataTable: Haupt-Tabellen-Komponente mit Sortierung und Paginierung
 * - TableControls: Kontrollelemente für Tabellen (Filter, Paginierung)
 * - ModelSelector: Auswahl-Komponente für Datenmodelle
 * 
 * Tabellen-Komponenten bieten konsistente Datenvisualisierung
 * mit erweiterten Funktionen wie Sortierung, Filterung und Paginierung.
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

export { default as DataTable } from "./DataTable";
export type { TableColumn, SortConfig } from "./DataTable";
export { default as TableControls } from "./TableControls";
export { default as ModelSelector } from "./ModelSelector";
