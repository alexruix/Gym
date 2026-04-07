import React from "react";
import { Layers, ArrowUpRight, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface PlanWorkspaceHeaderProps {
  planName: string;
  isTemplate: boolean;
  isPending: boolean;
  onPromote: () => void;
  onChangePlan: () => void;
  mode: "plan" | "routine";
}

export function PlanWorkspaceHeader({
  planName,
  isTemplate,
  isPending,
  onPromote,
  onChangePlan,
  mode
}: PlanWorkspaceHeaderProps) {
  const { workspace } = athleteProfileCopy;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-lg">
          <Layers className="w-6 h-6 text-lime-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tighter text-zinc-950 dark:text-white uppercase leading-none mb-1">
            {mode === "plan" ? workspace.tabs.plan : workspace.tabs.routine}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{planName}</span>
            {!isTemplate && (
              <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded-full border border-lime-400/20">
                PERSONALIZADO
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {(!isTemplate) && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={onPromote}
            className="h-10 rounded-xl font-bold text-[9px] tracking-[0.2em] border-zinc-200 dark:border-zinc-800 hover:bg-lime-500 hover:text-zinc-950 hover:border-lime-500 transition-all gap-2"
          >
            <ArrowUpRight className="w-3 h-3" />
            {workspace.routine.emptyState.promoteBtn}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-xl px-5 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold uppercase text-[9px] tracking-widest"
          onClick={onChangePlan}
        >
          <Library className="w-3.5 h-3.5 mr-2" />
          {workspace.routine.emptyState.changeBtn}
        </Button>
      </div>
    </div>
  );
}
