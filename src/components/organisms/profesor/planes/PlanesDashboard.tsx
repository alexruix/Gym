import React, { useState } from "react";
import { FileText } from "lucide-react";
import { planesCopy } from "@/data/es/profesor/planes";
import { PlanCard } from "@/components/molecules/profesor/planes/PlanCard";
import { PlanesTable, type PlanRowData } from "./PlanesTable";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";
import { DashboardConsole } from "@/components/molecules/profesor/DashboardConsole";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { useDeleteWithConfirm } from "@/hooks/useDeleteWithConfirm";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface Props {
  planes: PlanRowData[];
}

/**
 * PlanesDashboard: Panel de control de planes refactorizado (V2.2 Core).
 */
export function PlanesDashboard({ planes: initialPlanes }: Props) {
  const [planes, setPlanes] = useState<PlanRowData[]>(initialPlanes);

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

  const handleDuplicate = (id: string) =>
    runDuplicate(
      async () => {
        const { data: result, error } = await actions.profesor.duplicatePlan({ id });
        if (error) throw new Error(error.message || "Error al duplicar");
        if (result?.success) window.location.reload();
      },
      { loadingMsg: "Duplicando plan...", successMsg: "Plan duplicado" }
    );

  const sortOptions = [
    { label: "Nombre A-Z", value: "name-asc" },
    { label: "MÃ¡s recientes", value: "date-desc" },
    { label: "Por alumnos", value: "students-desc" },
    { label: "Por duraciÃ³n", value: "duration-desc" },
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

  return (
    <>
      <DashboardConsole 
        items={planes}
        itemLabel="Planes"
        storageKey="planes"
        searchPlaceholder={planesCopy.list.table.searchPlaceholder}
        sortOptions={sortOptions}
        onSort={handleSort}
        onCreateClick={() => window.location.href = "/profesor/planes/new"}
        emptyIcon={<FileText className="w-12 h-12" />}
        emptyTitle="No se encontraron planes"
        renderGrid={(items) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(plan => (
                    <PlanCard 
                        key={plan.id} 
                        plan={plan} 
                        onDelete={deleteFlow.setItemToDelete}
                        onDuplicate={handleDuplicate}
                    />
                ))}
            </div>
        )}
        renderTable={(items) => (
            <PlanesTable 
                planes={items} 
                onDelete={deleteFlow.setItemToDelete}
                onDuplicate={handleDuplicate}
            />
        )}
      />

      <DeleteConfirmDialog 
        isOpen={!!deleteFlow.itemToDelete}
        onOpenChange={(open) => !open && deleteFlow.clearItem()}
        onConfirm={deleteFlow.handleConfirm}
        isDeleting={deleteFlow.isPending}
        title="Eliminar plan"
        description={<>Â¿Seguro que querÃ©s eliminar <b>"{deleteFlow.itemToDelete?.name}"</b>?</>}
      />
    </>
  );
}
