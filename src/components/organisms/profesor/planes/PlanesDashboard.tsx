import React, { useState } from "react";
import { FileText, Plus, Layers, Target, Clock } from "lucide-react";
import { planesCopy } from "@/data/es/profesor/planes";
import { PlanCard } from "@/components/molecules/profesor/planes/PlanCard";
import { PlanesTable, type PlanRowData } from "./PlanesTable";
import { ImportPlansModal } from "./ImportPlansModal";
import { PlanesDashboardSkeleton } from "./PlanesSkeletons";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";
import { DashboardConsole } from "@/components/molecules/profesor/DashboardConsole";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { useDeleteWithConfirm } from "@/hooks/useDeleteWithConfirm";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { SplitActionButton } from "@/components/molecules/profesor/core/SplitActionButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  planes: PlanRowData[];
}

/**
 * PlanesDashboard: Panel de control de planes refactorizado (V2.5 PWA Optimized).
 */
export function PlanesDashboard({ planes: initialPlanes }: Props) {
  const [planes, setPlanes] = useState<PlanRowData[]>(initialPlanes);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Hooks Core
  const deleteFlow = useDeleteWithConfirm<PlanRowData>({
    onDelete: async (plan) => {
      const { data: result, error } = await actions.profesor.deletePlan({ id: plan.id });
      if (error) throw new Error(error.message || "Error al eliminar");
      if (result?.success) {
        toast.success(result.mensaje);
        setPlanes((prev) => prev.filter((p) => p.id !== plan.id));
      }
    },
  });

  const { execute: runDuplicate, isPending: isDuplicating } = useAsyncAction();

  const handleDuplicate = (id: string) => {
    const sourcePlan = planes.find((p) => p.id === id);
    if (!sourcePlan) return;

    runDuplicate(
      async () => {
        const { data: result, error } = await actions.profesor.duplicatePlan({ id });
        if (error) throw new Error(error.message || "Error al duplicar");
        if (result?.success && result.plan_id) {
          const newPlan: PlanRowData = {
            id: result.plan_id,
            name: `${sourcePlan.name} (Copia)`,
            duration: sourcePlan.duration,
            frequency: sourcePlan.frequency,
            studentsCount: 0,
            createdAt: new Date().toISOString(),
          };
          setPlanes((prev) => [newPlan, ...prev]);
        }
      },
      { loadingMsg: "Duplicando plan...", successMsg: "Plan duplicado" }
    );
  };

  const sortOptions = [
    { label: "Nombre A-Z", value: "name-asc" },
    { label: "Más recientes", value: "date-desc" },
    { label: "Por alumnos", value: "students-desc" },
    { label: "Por duración", value: "duration-desc" },
  ];

  const handleSort = (items: PlanRowData[], order: string) =>
    [...items].sort((a, b) => {
      switch (order) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "date-desc": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "students-desc": return b.studentsCount - a.studentsCount;
        case "duration-desc": return b.duration - a.duration;
        default: return 0;
      }
    });

  const categories = [
    { id: "all", label: "Todos", icon: Layers },
    { id: "master", label: "Master", icon: Target },
    { id: "recent", label: "Recientes", icon: Clock },
  ];

  const filteredPlanes = planes.filter(p => {
    if (activeCategory === "all") return true;
    if (activeCategory === "master") return p.studentsCount > 5; // Simulación: Master son los más usados
    if (activeCategory === "recent") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return new Date(p.createdAt) > oneMonthAgo;
    }
    return true;
  });

  return (
    <>
      <DashboardConsole 
        items={filteredPlanes}
        itemLabel="Planes"
        storageKey="planes"
        searchPlaceholder={planesCopy.list.table.searchPlaceholder}
        sortOptions={sortOptions}
        onSort={handleSort}
        searchSuffix={
            <div className="flex overflow-x-auto hide-scrollbar gap-2 py-1">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0",
                            activeCategory === cat.id
                                ? "bg-zinc-950 text-white border-zinc-950"
                                : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-100 dark:border-zinc-800"
                        )}
                    >
                        <cat.icon className="w-3 h-3" />
                        {cat.label}
                    </button>
                ))}
            </div>
        }
        renderCreateAction={() => (
          <div className="hidden md:block">
            <SplitActionButton 
                createLabel="Crear"
                importLabel="Subir desde Excel"
                createHref="/profesor/planes/new"
                onImportClick={() => setIsImportModalOpen(true)}
                className="h-12 md:h-14"
            />
          </div>
        )}
        emptyIcon={<FileText className="w-12 h-12" />}
        emptyTitle="No se encontraron planes"
        renderGrid={(items) => isReloading ? (
            <PlanesDashboardSkeleton viewMode="grid" />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(plan => (
                    <PlanCard key={plan.id} plan={plan} onDelete={deleteFlow.setItemToDelete} onDuplicate={handleDuplicate} />
                ))}
            </div>
        )}
        renderTable={(items) => isReloading ? (
            <PlanesDashboardSkeleton viewMode="table" />
        ) : (
            <PlanesTable 
                planes={items} 
                onDelete={deleteFlow.setItemToDelete}
                onDuplicate={handleDuplicate}
            />
        )}
      />

      <ImportPlansModal 
        isOpen={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSuccess={() => {
          setIsImportModalOpen(false);
          setIsReloading(true);
          window.location.reload();
        }}
      />

      <DeleteConfirmDialog 
        isOpen={!!deleteFlow.itemToDelete}
        onOpenChange={(open) => !open && deleteFlow.clearItem()}
        onConfirm={deleteFlow.handleConfirm}
        isDeleting={deleteFlow.isPending}
        title="Eliminar plan"
        description={<>¿Seguro que querés eliminar <b>"{deleteFlow.itemToDelete?.name}"</b>?</>}
      />

      {/* FAB for Mobile PWA Experience */}
      <div className="fixed bottom-8 right-6 flex flex-col items-end gap-3 z-50 md:hidden">
        {isFabOpen && (
          <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button
              onClick={() => { window.location.assign("/profesor/planes/new"); setIsFabOpen(false); }}
              className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl px-4 flex items-center gap-3"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Nuevo plan</span>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <Plus className="w-4 h-4 text-lime-500" />
              </div>
            </Button>
            <Button
              onClick={() => { setIsImportModalOpen(true); setIsFabOpen(false); }}
              className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl px-4 flex items-center gap-3"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Importar Excel</span>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <FileText className="w-4 h-4 text-zinc-400" />
              </div>
            </Button>
          </div>
        )}
        <Button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={cn(
            "h-16 w-16 rounded-[2rem] shadow-2xl transition-all duration-300 active:scale-95",
            isFabOpen ? "bg-zinc-900 text-white rotate-45" : "bg-zinc-950 text-white"
          )}
        >
          <Plus className={cn("w-6 h-6 transition-colors text-lime-400")} />
        </Button>
      </div>
    </>
  );
}
