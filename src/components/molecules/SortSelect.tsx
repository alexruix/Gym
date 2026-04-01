import React from "react";
import { ArrowUpDown, ChevronDown, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SortOption {
  label: string;
  value: string;
}

interface SortSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: SortOption[];
  count: number;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * SortSelect: Ãtomo premium para ordenamiento dinÃ¡mico.
 * DiseÃ±ado con estÃ©tica "Industrial Instrument" para tableros de alto rendimiento.
 */
export function SortSelect({ 
  value, 
  onChange, 
  options = [], 
  count, 
  label, 
  icon: Icon = ArrowUpDown,
  className 
}: SortSelectProps) {
  const currentOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={cn(
        "flex items-center bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-1 group transition-all hover:border-zinc-300 dark:hover:border-zinc-700 h-11",
        className
    )}>
      {/* Instrumentation Counter Badge */}
      <div className="flex items-center gap-2 px-3 h-full bg-zinc-950 dark:bg-zinc-900 rounded-xl text-white mr-1 shrink-0 shadow-lg shadow-zinc-950/10">
         <span className="text-[12px] font-black leading-none">{count}</span>
         <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 hidden sm:inline leading-none">
            {label}
         </span>
      </div>

      {/* Semantic Menu Trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center h-full gap-2 px-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-xl transition-all duration-300 flex-1 sm:flex-none">
            <Icon className="w-4 h-4 text-zinc-400 group-hover:text-lime-500 transition-colors" />
            <div className="flex flex-col items-start min-w-[80px] sm:min-w-[100px] text-left">
                <span className="text-[7px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">
                    Ordenar por
                </span>
                <span className="text-[10px] font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50 leading-none truncate w-full">
                    {currentOption?.label || "Sin orden"}
                </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-300 transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
            align="end" 
            className="w-56 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="px-2 py-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400">
                    Opciones de orden
                </span>
            </div>
            {options.map(opt => (
                <DropdownMenuItem 
                    key={opt.value}
                    onClick={() => onChange?.(opt.value)}
                    className={cn(
                        "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1 outline-none",
                        value === opt.value 
                            ? "bg-zinc-950 dark:bg-zinc-900 text-white" 
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    )}
                >
                    <span className="text-[10px] font-black uppercase tracking-tight">
                        {opt.label}
                    </span>
                    {value === opt.value && <Check className="w-4 h-4 text-lime-400" />}
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
