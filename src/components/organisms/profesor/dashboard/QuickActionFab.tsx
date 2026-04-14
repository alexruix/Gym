import * as React from "react";
import { Plus, UserPlus, FilePlus, X } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { cn } from "@/lib/utils";

/**
 * QuickActionFab: FAB mobile para acciones rápidas del dashboard.
 * Solo visible en mobile (md:hidden). Acciones: Nuevo alumno + Crear plan.
 * El botón de "Registrar pago" fue removido por carecer de implementación.
 */
export function QuickActionFab() {
  const [isOpen, setIsOpen] = React.useState(false);
  const c = dashboardCopy.fab;

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden flex flex-col items-end gap-3">
      {/* Opciones (slide in desde abajo) */}
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom-right ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
          }`}
        aria-hidden={!isOpen}
      >
        <a
          href="/profesor/alumnos/new"
          className="flex items-center gap-3 bg-white dark:bg-zinc-950 pr-4 pl-3 py-3 rounded-full shadow-lg border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold active:scale-95 transition-transform"
        >
          <div className="bg-zinc-900 dark:bg-zinc-100 p-1.5 rounded-full text-white dark:text-zinc-900">
            <UserPlus className="w-4 h-4" />
          </div>
          {c.newStudent}
        </a>

        <a
          href="/profesor/planes/new"
          className="flex items-center gap-3 bg-white dark:bg-zinc-950 pr-4 pl-3 py-3 rounded-full shadow-lg border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold active:scale-95 transition-transform"
        >
          <div className="bg-lime-500 p-1.5 rounded-full text-zinc-950">
            <FilePlus className="w-4 h-4" />
          </div>
          {c.createPlan}
        </a>
      </div>

      {/* Botón principal FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 haptic-click",
          isOpen
            ? "bg-zinc-900 text-white rotate-45 shadow-zinc-900/20"
            : "bg-lime-500 text-zinc-950 shadow-lime-500/30"
        )}
        aria-label={isOpen ? "Cerrar menú de acciones" : "Abrir menú de acciones rápidas"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Plus className="w-6 h-6" aria-hidden="true" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-[-1] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
