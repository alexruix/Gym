import { useState, useEffect } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { EntitySelectorDialog } from "@/components/molecules/profesor/core/EntitySelectorDialog";
import { Layers } from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

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
            const planesList = data?.planes || [];
            setPlanes(planesList.map((p: any) => ({
                id: p.id,
                name: p.nombre,
                tags: ["Maestra"]
            })));
        } catch (err: any) {
            toast.error(athleteProfileCopy.workspace.routine.assignmentDialog.error);
        } finally {
            // Pequeño delay estético industrial
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
            
            toast.success(athleteProfileCopy.workspace.routine.assignmentDialog.success);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || athleteProfileCopy.workspace.routine.assignmentDialog.saveError);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <EntitySelectorDialog 
            open={open}
            onOpenChange={onOpenChange}
            title={athleteProfileCopy.workspace.routine.assignmentDialog.title}
            description={athleteProfileCopy.workspace.routine.assignmentDialog.description}
            items={planes}
            isLoading={isLoading}
            isSaving={isSaving}
            onConfirm={handleConfirm}
            confirmLabel={athleteProfileCopy.workspace.routine.assignmentDialog.confirmBtn}
            warningMessage={athleteProfileCopy.workspace.routine.assignmentDialog.warning}
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
