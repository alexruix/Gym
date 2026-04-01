import { useState, useEffect } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { EntitySelectorDialog } from "@/components/molecules/profesor/core/EntitySelectorDialog";
import { Layers } from "lucide-react";

interface Plan {
    id: string;
    name: string;
    tags?: string[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    alumnoId: string;
    onSuccess: () => void;
}

/**
 * MasterPlanAssignmentDialog: Wrapper (Capa de compatibilidad) sobre el EntitySelectorDialog Core.
 * Facilita la transición hacia el componente universal manteniendo la API de props original.
 */
export function MasterPlanAssignmentDialog({ open, onOpenChange, alumnoId, onSuccess }: Props) {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) fetchPlanes();
    }, [open]);

    async function fetchPlanes() {
        setIsLoading(true);
        try {
            const { data, error } = await actions.profesor.getProfessorMaestroPlans();
            if (error) throw error;
            // Mapeo a BaseEntity
            setPlanes(data.planes.map((p: any) => ({
                id: p.id,
                name: p.nombre,
                tags: ["Maestra"] // Tag automático para plantillas
            })));
        } catch (err: any) {
            toast.error("No se pudieron cargar los planes");
        } finally {
            setIsLoading(true);
            // Simular un pequeño delay para estética industrial
            setTimeout(() => setIsLoading(false), 300);
        }
    }

    const handleConfirm = async (selectedIds: string[]) => {
        const planId = selectedIds[0];
        if (!planId) return;
        
        setIsSaving(true);
        try {
            const { error } = await actions.profesor.assignPlanToStudents({
                plan_id: planId,
                student_ids: [alumnoId]
            });
            
            if (error) throw error;
            
            toast.success("Rutina asignada correctamente");
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Error al asignar el plan");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <EntitySelectorDialog 
            open={open}
            onOpenChange={onOpenChange}
            title="Asignar Rutina Maestra"
            description="Elegí una plantilla de tu biblioteca para este alumno."
            items={planes}
            isLoading={isLoading}
            isSaving={isSaving}
            onConfirm={handleConfirm}
            confirmLabel="Asignar Plan"
            warningMessage="Al asignar este plan, se reemplazará la rutina actual del alumno (si tiene una)."
            allTags={["Maestra"]}
            renderItem={(item, isSelected) => (
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] transition-all ${isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'}`}>
                        PLN
                        <Layers className={`absolute -top-1 -right-1 w-3 h-3 ${isSelected ? 'text-lime-500' : 'text-zinc-300'}`} />
                    </div>
                    <div className="flex flex-col">
                        <p className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-zinc-950 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {item.name}
                        </p>
                        <span className="text-[9px] font-bold text-zinc-300 dark:text-zinc-600">PLANTILLA MAESTRA</span>
                    </div>
                </div>
            )}
        />
    );
}
