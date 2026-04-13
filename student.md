import React, { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import {
  Dumbbell,
  Clock,
  Plus,
  Library,
  Box,
  Copy as CopyIcon,
  Trash2
} from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";
import { RoutineExerciseRow } from "@/components/molecules/profesor/planes/RoutineExerciseRow";
import { MasterPlanAssignmentDialog } from "@/components/molecules/profesor/perfil/MasterPlanAssignmentDialog";
import { ExerciseSearchDialog } from "@/components/molecules/profesor/planes/ExerciseSearchDialog";
import { PlanWorkspaceHeader } from "@/components/molecules/profesor/perfil/PlanWorkspaceHeader";
import { PlanBannerManager } from "@/components/molecules/profesor/perfil/PlanBannerManager";
import { cn } from "@/lib/utils";
import { useAccordion } from "@/hooks/useAccordion";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface Props {
  alumnoId: string;
  planData: any;
  library: any[];
  mode?: "plan" | "routine";
  onUpdateMetrics: (id: string, updates: any) => Promise<void>;
  onMove: (id: string, dir: "up" | "down") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (rutinaId: string, exId: string) => Promise<void>;
  promotePlan: () => Promise<void>;
  getGroupedExercises: (ejs: any[]) => any[];
}

export function StudentRoutineWorkspace({ 
  alumnoId, 
  planData, 
  library, 
  mode = "routine",
  onUpdateMetrics,
  onMove,
  onDelete,
  onAdd,
  promotePlan,
  getGroupedExercises
}: Props) {
  const { workspace } = athleteProfileCopy;
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showPromotion, setShowPromotion] = useState(false);
  const [isPromotionDismissed, setIsPromotionDismissed] = useState(false);
  const [activeRoutineTarget, setActiveRoutineTarget] = useState<string | null>(null);

  const { execute: run, isPending } = useAsyncAction();
  const { isOpen: isRutinaOpen, toggleItem: toggleRutina } = useAccordion(
    planData?.rutinas_diarias?.slice(0, 1).map((r: any) => r.id) || []
  );

  const isReadOnlyTemplate = mode === "plan" && planData?.is_template;

  const handlePersonalize = async () => {
    if (!planData) return;
    await run(async () => {
      const { data, error } = await actions.profesor.forkPlan({
        planId: planData.id,
        alumnoId,
        nombre: `${planData.nombre} (Personalizado)`
      });
      if (error) throw error;
      toast.success("¡Listo! Creaste una versión personalizada");
      window.location.reload(); // Reload needed to change context to new ID
    });
  };

  const isEmpty = !planData || !planData.rutinas_diarias || planData.rutinas_diarias.length === 0;
  const sortedRutinas = planData?.rutinas_diarias
    ? [...planData.rutinas_diarias].sort((a: any, b: any) => a.dia_numero - b.dia_numero)
    : [];

  // Lift actions from hook props (or we can just use them)
  const handlePromotePlan = async () => {
    await promotePlan();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {isEmpty ? (
        <div className="py-24 bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex flex-col items-center gap-8 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          <div className="w-24 h-24 bg-zinc-950 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-zinc-800 shadow-2xl group-hover:rotate-6 transition-transform">
            <Dumbbell className="w-10 h-10 text-lime-400" />
          </div>
          <div className="space-y-2 relative z-10 max-w-sm">
            <h3 className="font-bold text-2xl uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">{workspace.routine.emptyState.title}</h3>
            <p className="text-sm text-zinc-400 font-medium px-6">{workspace.routine.emptyState.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <Button onClick={() => setIsAssignDialogOpen(true)} variant="industrial" size="xl">
              <Library className="w-5 h-5 mr-3" /> {workspace.routine.emptyState.assignBtn}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <PlanWorkspaceHeader 
            mode={mode}
            planName={planData.nombre}
            isTemplate={planData.is_template}
            isPending={isPending}
            onPromote={handlePromotePlan}
            onChangePlan={() => setIsAssignDialogOpen(true)}
          />

          <PlanBannerManager 
            isTemplate={planData.is_template}
            showPromotion={showPromotion && !isPromotionDismissed}
            onPersonalize={handlePersonalize}
            onDismissPromotion={() => setIsPromotionDismissed(true)}
            planId={planData.id}
          />

          <div className="space-y-4">
            {sortedRutinas.map((rutina: any) => {
              const isOpen = isRutinaOpen(rutina.id);
              const groupedEjs = getGroupedExercises(rutina.ejercicios_plan || []);

              return (
                <div key={rutina.id} className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all hover:shadow-xl group">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleRutina(rutina.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 sm:p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer",
                      isOpen && "sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-500",
                        isOpen ? "bg-zinc-950 text-white dark:bg-lime-500 dark:text-zinc-950 rotate-3" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"
                      )}>
                        {rutina.dia_numero}
                      </span>
                      <div className="text-left">
                        <h4 className="font-bold text-base sm:text-lg text-zinc-950 dark:text-white uppercase tracking-tighter leading-none group-hover:text-lime-600 transition-colors">
                          {rutina.nombre_dia || `Día ${rutina.dia_numero}`}
                        </h4>
                        <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 tracking-widest mt-1 sm:mt-1.5 flex items-center gap-2 uppercase">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {rutina.ejercicios_plan?.length || 0} Ejercicios
                        </p>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900/50 bg-white/50 dark:bg-black/5">
                      {groupedEjs.map((group, gIdx) => (
                        <div key={group.id || `unbound-${gIdx}`} className={cn(
                          "transition-all",
                          group.id && "bg-lime-500/[0.02] border-y border-lime-500/5 py-2"
                        )}>
                          {group.nombre && (
                            <div className="px-6 py-2 flex items-center gap-2">
                               <div className="w-6 h-6 rounded-lg bg-lime-500/10 flex items-center justify-center">
                                  <Box className="w-3 h-3 text-lime-500" />
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400">{group.nombre}</span>
                            </div>
                          )}
                          
                          {group.exercises.map((ej: any, idx: number) => (
                            <RoutineExerciseRow
                              key={ej.id}
                              exercise={ej}
                              index={idx} 
                              isFirst={idx === 0 && !group.id}
                              isLast={idx === group.exercises.length - 1 && !group.id}
                              readOnly={isReadOnlyTemplate}
                              onChange={(updates) => onUpdateMetrics(ej.id, updates)}
                              onMove={(dir) => onMove(ej.id, dir)}
                              onDelete={() => {
                                if (isReadOnlyTemplate) {
                                    setShowPromotion(true);
                                    toast.info("Para cambios estructurales debés personalizar el plan.");
                                } else {
                                    onDelete(ej.id);
                                }
                              }}
                            />
                          ))}
                        </div>
                      ))}

                      {!isReadOnlyTemplate && (
                        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10">
                          <Button
                            variant="ghost"
                            onClick={() => { setActiveRoutineTarget(rutina.id); setIsSearchOpen(true); }}
                            className="w-full h-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-3 hover:border-lime-400/50 hover:bg-lime-500/5 transition-all group"
                          >
                            <Plus className="w-4 h-4 text-zinc-400 group-hover:text-lime-500 transition-colors" />
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">Añadir ejercicio</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <MasterPlanAssignmentDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        alumnoId={alumnoId}
        onSuccess={() => window.location.reload()}
      />

      <ExerciseSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        library={library}
        onSelect={(id) => activeRoutineTarget && onAdd(activeRoutineTarget, id)}
        onExerciseCreated={() => {}}
      />
    </div>
  );
}