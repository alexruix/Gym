import React from "react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Box, ChevronRight, Info, Layers, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { blocksCopy } from "@/data/es/profesor/ejercicios";

interface BlockCardProps {
  block: any;
  onSelect?: (block: any) => void;
  className?: string;
}

/**
 * BlockCard: MolÃ©cula para previsualizar y seleccionar un bloque de ejercicios.
 * Implementa el "Preview on Hover" para maximizar la velocidad operativa.
 */
export function BlockCard({ block, onSelect, className }: BlockCardProps) {
  const items = block.bloques_ejercicios || [];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            onClick={() => onSelect?.(block)}
            className={cn(
              "p-5 rounded-[2.5rem] border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-500 cursor-pointer group hover:border-zinc-950 dark:hover:border-lime-400 hover:shadow-2xl hover:shadow-zinc-950/5",
              className
            )}
          >
            <div className="flex items-center gap-5">
              {/* Ãcono Industrial */}
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 dark:bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-xl group-hover:border-lime-500 transition-colors">
                <Box className="w-5 h-5 text-zinc-500 group-hover:text-lime-400 transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-zinc-950 dark:text-white uppercase tracking-tight truncate group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                  {block.nombre}
                </h4>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {items.length} Ejercicios
                  </span>

                  {/* Tags AutomÃ¡ticos */}
                  <div className="flex gap-1">
                    {(block.tags || []).map((tag: string) => (
                      <span key={tag} className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-lime-500 transition-all transform group-hover:translate-x-1" />
            </div>
          </Card>
        </TooltipTrigger>

        {/* Preview al Hover: Lista rÃ¡pida de ejercicios */}
        <TooltipContent
          side="right"
          align="center"
          sideOffset={20}
          className="p-6 bg-zinc-950 border-zinc-800 rounded-[2.5rem] shadow-2xl w-72 animate-in fade-in zoom-in-95 duration-300 z-50 pointer-events-none"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <List className="w-4 h-4 text-lime-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-lime-400">
                {blocksCopy.search.hoverPreview}
              </p>
            </div>

            <ul className="space-y-3">
              {items.map((item: any, idx: number) => {
                const exName = item.biblioteca_ejercicios?.nombre || "Ejercicio";
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-zinc-700 w-4">{idx + 1}</span>
                    <span className="text-xs font-bold text-zinc-300 truncate">
                      {exName}
                    </span>
                    <span className="ml-auto text-[9px] font-bold text-zinc-600 uppercase">
                      {item.series}x{item.reps_target}
                    </span>
                  </li>
                );
              })}
            </ul>

            {items.length === 0 && (
              <p className="text-[10px] font-bold text-zinc-600 italic">No hay ejercicios en este bloque.</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
