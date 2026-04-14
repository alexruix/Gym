import React, { useState, useEffect } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { EntitySelectorDialog } from "@/components/molecules/profesor/core/EntitySelectorDialog";
import { Layers, Calendar, Clock } from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { PlanFilterPopover } from "@/components/molecules/profesor/perfil/PlanFilterPopover";

interface Plan {
    id: string;
    name: string;
    frecuencia_semanal?: number;
    created_at?: string;
    tags?: string[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    alumnoId: string;
    student: any;
    currentPlanName?: string;
    onSuccess: () => void;
}

/**
 * MasterPlanAssignmentDialog: Wrapper (Capa de compatibilidad) sobre el EntitySelectorDialog Core.
 * Facilita la transición hacia el componente universal manteniendo la API de props original.
 */
export function MasterPlanAssignmentDialog({ open, onOpenChange, alumnoId, student, currentPlanName, onSuccess }: Props) {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filtros locales
    const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
    const [sortByRecent, setSortByRecent] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

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
                frecuencia_semanal: p.frecuencia_semanal,
                created_at: p.created_at,
                tags: ["Maestra"]
            })));
        } catch (err: any) {
            toast.error(athleteProfileCopy.workspace.routine.assignmentDialog.error);
        } finally {
            // Pequeño delay estético industrial
            setTimeout(() => setIsLoading(false), 300);
        }
    }

    const frequencies = Array.from(new Set(planes.map(p => p.frecuencia_semanal).filter(Boolean))) as number[];

    const filteredAndSortedPlanes = planes
        .filter(p => selectedFrequency === null || p.frecuencia_semanal === selectedFrequency)
        .sort((a, b) => {
            if (!sortByRecent) return 0;
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

    const dynamicWarning = React.useMemo(() => {
        if (!selectedId) return null;
        const selectedPlan = planes.find(p => p.id === selectedId);
        if (!selectedPlan) return null;

        let messages: string[] = [];

        // 1. Frecuencia Mismatch
        const studentDaysCount = student?.dias_asistencia?.length || 0;
        if (selectedPlan.frecuencia_semanal && studentDaysCount > 0 && selectedPlan.frecuencia_semanal !== studentDaysCount) {
            messages.push(athleteProfileCopy.workspace.routine.assignmentDialog.frequencyMismatch
                .replace("{p}", selectedPlan.frecuencia_semanal.toString())
                .replace("{s}", studentDaysCount.toString())
            );
        }

        // 2. Overwrite
        if (currentPlanName) {
            messages.push(athleteProfileCopy.workspace.routine.assignmentDialog.overwrite
                .replace("{name}", currentPlanName)
            );
        }

        return messages.length > 0 ? messages.join(" ") : null;
    }, [selectedId, planes, student, currentPlanName]);

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
            items={filteredAndSortedPlanes}
            isLoading={isLoading}
            isSaving={isSaving}
            onConfirm={handleConfirm}
            onSelectionChange={(ids) => setSelectedId(ids[0] || null)}
            confirmLabel={athleteProfileCopy.workspace.routine.assignmentDialog.confirmBtn}
            // warningMessage={dynamicWarning || athleteProfileCopy.workspace.routine.assignmentDialog.warning}
            allTags={["Maestra"]}
            extraActions={
                <PlanFilterPopover
                    frequencies={frequencies}
                    selectedFrequency={selectedFrequency}
                    onFrequencyChange={setSelectedFrequency}
                    sortByRecent={sortByRecent}
                    onSortChange={setSortByRecent}
                />
            }
            renderItem={(item, isSelected) => (
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[10px] transition-all ${isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'}`}>
                        PLN
                        <Layers className={`absolute -top-1 -right-1 w-3 h-3 ${isSelected ? 'text-lime-500' : 'text-zinc-300'}`} />
                    </div>
                    <div className="flex flex-col">
                        <p className={`text-sm font-bold uppercase tracking-tight ${isSelected ? 'text-zinc-950 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {item.name}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-zinc-300 dark:text-zinc-600 uppercase">PLANTILLA MAESTRA</span>
                            {item.frecuencia_semanal && (
                                <span className="text-[9px] font-bold text-lime-600 dark:text-lime-500 uppercase shrink-0">
                                    • {item.frecuencia_semanal} Días/Sem
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        />
    );
}
