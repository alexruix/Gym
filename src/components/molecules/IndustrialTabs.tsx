import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface IndustrialTabsProps {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * IndustrialTabs: Molécula de navegación de alto rendimiento.
 * Sigue la estética "Industrial Minimalist" con indicadores de línea inferior (lime-400),
 * tipografía densa y soporte para contenido dinámico a la derecha.
 * Utiliza Radix UI para máxima accesibilidad.
 */
export function IndustrialTabs({
  tabs,
  value,
  onValueChange,
  rightContent,
  children,
  className
}: IndustrialTabsProps) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-0.5">
        <TabsPrimitive.List className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = value === tab.value;

            return (
              <TabsPrimitive.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "relative px-6 py-4 industrial-label tracking-[0.15em] transition-all outline-none group",
                  isActive
                    ? "text-zinc-950 dark:text-white"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
              >
                <div className="flex items-center gap-2 relative z-10">
                  {Icon && (
                    <Icon className={cn(
                      "w-4 h-4 transition-transform group-hover:scale-110",
                      isActive ? "text-lime-500" : "text-zinc-400"
                    )} />
                  )}
                  {tab.label}
                </div>

                {/* Indicador Industrial (Underline) */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-lime-500 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-300" />
                )}
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>

        {rightContent && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-2 md:pb-0">
            {rightContent}
          </div>
        )}
      </div>
      {children}
    </TabsPrimitive.Root>
  );
}
