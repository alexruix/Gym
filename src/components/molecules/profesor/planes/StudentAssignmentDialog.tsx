import { useState, useEffect, useMemo } from "react";
import { actions } from "astro:actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    UserPlus,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Plus,
    ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { EntitySelectorDialog } from "@/components/molecules/profesor/core/EntitySelectorDialog";
import { DaySelector } from "@/components/atoms/profesor/DaySelector";
import { cn } from "@/lib/utils";
import { planesCopy } from "@/data/es/profesor/planes";

interface Student {
    id: string;
    name: string;
    email: string | null;
    plan_id: string | null;
    nombre_plan: string | null;
    dias_asistencia: string[];
    tags?: string[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPlanId: string;
    planFrequency: number;
    onSuccess: (newStudents: any[]) => void;
}

/**
 * StudentAssignmentDialog: Wrapper (Capa de compatibilidad) sobre el EntitySelectorDialog Core.
 * Mantiene la funcionalidad de creación inline mientras delega la selección al motor universal.
 */
export function StudentAssignmentDialog({ open, onOpenChange, currentPlanId, planFrequency, onSuccess }: Props) {
    const c = planesCopy.detail.students.assignDialog;
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Inline Creation State
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");

    useEffect(() => {
        if (open) {
            fetchStudents();
            setShowCreateForm(false);
            setNewName("");
            setNewEmail("");
        }
    }, [open]);

    async function fetchStudents() {
        setIsLoading(true);
        try {
            const { data, error } = await actions.profesor.getProfessorStudentsWithPlans();
            if (error) throw error;

            // Adaptación a BaseEntity
            setStudents((data.alumnos || []).map((s: any) => ({
                ...s,
                name: s.nombre,
                tags: s.nombre_plan ? [s.nombre_plan] : []
            })));
        } catch (err: any) {
            toast.error("No se pudieron cargar los alumnos");
        } finally {
            setIsLoading(false);
        }
    }

    const selectedIds = useMemo(() => {
        return students.filter(s => s.plan_id === currentPlanId).map(s => s.id);
    }, [students, currentPlanId]);

    const sections = useMemo(() => {
        const mismatched: Student[] = [];
        const withPlan: Student[] = [];
        const available: Student[] = [];

        students.forEach(s => {
            // Si ya está en este plan, no lo mostramos para evitar confusión
            if (s.plan_id === currentPlanId) return;

            const frequencyMismatch = s.dias_asistencia.length > 0 && s.dias_asistencia.length !== planFrequency;
            if (frequencyMismatch) {
                mismatched.push(s);
                return;
            }

            if (s.plan_id) {
                withPlan.push(s);
                return;
            }

            available.push(s);
        });

        return [
            { title: c.sections.mismatched, items: mismatched },
            { title: c.sections.withPlan, items: withPlan },
            { title: c.sections.available, items: available },
        ].filter(sec => sec.items.length > 0);
    }, [students, currentPlanId, planFrequency, c]);

    const stats = useMemo(() => {
        return {
            allTags: Array.from(new Set(students.flatMap(s => s.tags || [])))
        };
    }, [students]);

    const handleConfirmAssignment = async (newSelectedIds: string[]) => {
        setIsSaving(true);
        try {
            const { error } = await actions.profesor.assignPlanToStudents({
                plan_id: currentPlanId,
                student_ids: newSelectedIds
            });

            if (error) throw error;

            toast.success(c.success);

            const newAssigned = students
                .filter(s => newSelectedIds.includes(s.id))
                .map(s => ({ ...s, plan_id: currentPlanId }));

            onSuccess(newAssigned);
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || c.error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateAndAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newEmail) return;

        setIsSaving(true);
        try {
            const { data, error } = await actions.profesor.inviteStudent({
                nombre: newName,
                email: newEmail,
                plan_id: currentPlanId,
                fecha_inicio: new Date(),
                dia_pago: 1,
                cobrarPrimerMes: false
            });

            if (error) throw error;
            toast.success(`Alumno ${newName} creado y asignado`);
            onSuccess([{
                id: data.student_id,
                name: newName,
                email: newEmail,
                plan_id: currentPlanId,
                nombre_plan: null,
                dias_asistencia: [],
                estado: 'activo'
            }]);
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Error al crear alumno");
        } finally {
            setIsSaving(false);
        }
    };

    if (showCreateForm) {
        return (
            <EntitySelectorDialog
                open={open}
                onOpenChange={onOpenChange}
                title={c.createForm.title}
                description={c.createForm.description}
                items={[]}
                onConfirm={() => { }}
                renderItem={() => null}
            >
                <form onSubmit={handleCreateAndAssign} className="flex flex-col animate-in slide-in-from-right-4 duration-300">
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="industrial-label fi px-1">{c.createForm.nameLabel}</label>
                            <Input
                                autoFocus
                                placeholder="Ej: Nacho Giménez"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="industrial-input "
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="industrial-label px-1">{c.createForm.emailLabel}</label>
                            <Input
                                type="email"
                                placeholder="ejemplo@email.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="industrial-input"
                            />
                        </div>
                    </div>
                    <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center gap-3">
                        <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)} className="flex-1 h-12 rounded-2xl industrial-label">
                            <ChevronLeft className="w-4 h-4 mr-2" /> {c.createForm.back}
                        </Button>
                        <Button type="submit" disabled={isSaving || !newName || !newEmail} className="flex-[2] h-12 rounded-2xl bg-lime-500 text-zinc-950 industrial-label text-base">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : c.createForm.submit}
                        </Button>
                    </div>
                </form>
            </EntitySelectorDialog>
        );
    }

    return (
        <EntitySelectorDialog
            open={open}
            onOpenChange={onOpenChange}
            title={c.title}
            description={c.description}
            items={students}
            sections={sections}
            multiple={true}
            initialSelectedIds={selectedIds}
            isLoading={isLoading}
            isSaving={isSaving}
            onConfirm={handleConfirmAssignment}
            confirmLabel="Confirmar Asignación"
            allTags={stats.allTags}
            onCreateNew={() => setShowCreateForm(true)}
            createNewLabel="Nuevo alumno"
            warningMessage={c.warning}
            renderItem={(s, isSelected) => {
                const hasMismatch = s.dias_asistencia.length > 0 && s.dias_asistencia.length !== planFrequency;
                
                return (
                    <div className="flex flex-col gap-3 w-full py-1">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                                <p className={cn(
                                    "text-sm font-bold tracking-tight uppercase truncate",
                                    isSelected ? "text-zinc-950 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
                                )}>
                                    {s.name}
                                </p>
                                {/* <div className="flex items-center gap-2">
                                    <p className="industrial-metadata truncate lowercase">
                                        {s.email || "Sin email"}
                                    </p>
                                    {s.nombre_plan && s.plan_id !== currentPlanId && (
                                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">
                                            • {s.nombre_plan}
                                        </span>
                                    )}
                                </div> */}
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                                {s.plan_id === currentPlanId && <CheckCircle2 className="w-4 h-4 text-lime-500" />}
                                {hasMismatch && (
                                    <div className="px-2 py-0.5 rounded-full bg-red-400/10 border border-red-400/20 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                        <span className="text-[8px] font-bold uppercase text-red-600 tracking-tighter">Inconsistencia</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Resumen de Asistencia en Texto */}
                        {s.dias_asistencia.length > 0 && (
                            <div className="flex items-center gap-2 mt-0.5 animate-in fade-in duration-500">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                                    {s.dias_asistencia.length} {s.dias_asistencia.length === 1 ? 'día' : 'días'}:
                                </span>
                                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                                    {s.dias_asistencia.map(d => d.slice(0, 3)).join(", ")}
                                </span>
                            </div>
                        )}
                        
                        {/* Metadata del alumno (Solo nombre del plan si aplica) */}
                        {s.nombre_plan && s.plan_id !== currentPlanId && (
                            <div className="mt-1">
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/20">
                                    • {s.nombre_plan}
                                </span>
                            </div>
                        )}
                    </div>
                );
            }}
        />
    );
}
