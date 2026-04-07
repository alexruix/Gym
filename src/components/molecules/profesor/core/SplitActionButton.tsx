import * as React from "react";
import {
  Plus,
  MoreVertical,
  FileSpreadsheet,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CreatePlanSplitButtonProps {
  createLabel: string;
  importLabel: string;
  createHref: string;
  importHref?: string;
  onImportClick?: () => void;
  className?: string;
}

/**
 * SplitActionButton: Botón dividido (V1.0) para acción principal + secundarias.
 * Diseñado según referencia visual de MiGym (Industrial Minimalist).
 */
export function SplitActionButton({
  createLabel,
  importLabel,
  createHref,
  importHref,
  onImportClick,
  className
}: CreatePlanSplitButtonProps) {
  return (
    <div className={cn("inline-flex items-stretch rounded-2xl overflow-hidden shadow-xl shadow-zinc-950/20 active:scale-[0.98] transition-all duration-300", className)}>
      {/* ACCIÃ“N PRINCIPAL: CREAR */}
      <a
        href={createHref}
        className="flex items-center gap-2 px-6 md:px-8 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-colors border-r border-zinc-800 dark:border-zinc-200"
      >
        <Plus className="w-4 h-4" />
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] py-4">
          {createLabel}
        </span>
      </a>

      {/* ACCIÃ“N SECUNDARIA: DROPDOWN TRIGGER */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center px-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-colors"
            aria-label="MÃ¡s opciones de creaciÃ³n"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-56 p-2 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <DropdownMenuItem asChild>
            {onImportClick ? (
              <button
                onClick={onImportClick}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all group w-full text-left"
              >
                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg group-hover:bg-lime-500 group-hover:text-zinc-950 transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{importLabel}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Formato Excel / CSV</span>
                </div>
              </button>
            ) : (
              <a
                href={importHref}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all group"
              >
                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg group-hover:bg-lime-500 group-hover:text-zinc-950 transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{importLabel}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Formato Excel / CSV</span>
                </div>
              </a>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
