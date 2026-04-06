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

interface Student {
    id: string;
    name: string;
    email: string | null;
    plan_id: string | null;
    nombre_plan: string | null;
    tags?: string[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPlanId: string;
    onSuccess: (newStudents: any[]) => void;
}

/**
 * StudentAssignmentDialog: Wrapper (Capa de compatibilidad) sobre el EntitySelectorDialog Core.
 * Mantiene la funcionalidad de creación inline mientras delega la selección al motor universal.
 */
export function StudentAssignmentDialog({ open, onOpenChange, currentPlanId, onSuccess }: Props) {
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

    const stats = useMemo(() => {
        // En un wrapper, el estado de "overwrites" se calcula dinámicamente si el diálogo core nos devolviera la selección en tiempo real, 
        // pero aquí lo usaremos para el warningMessage del componente core basándonos en los items.
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
            
            toast.success("Alumnos asignados correctamente");
            
            const newAssigned = students
                .filter(s => newSelectedIds.includes(s.id))
                .map(s => ({ ...s, plan_id: currentPlanId }));
            
            onSuccess(newAssigned);
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Error al asignar");
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
                title="Invitación Rápida"
                description="Cargá los datos básicos para asignar este plan ahora."
                items={[]}
                onConfirm={() => {}}
                renderItem={() => null}
            >
                {/* 
                  * El EntitySelectorDialog V2.2 soporta children para formularios alternativos 
                  * Si no, lo manejamos con un condicional en este wrapper 
                  */}
                <form onSubmit={handleCreateAndAssign} className="flex flex-col animate-in slide-in-from-right-4 duration-300">
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Nombre Completo</label>
                            <Input 
                                autoFocus
                                placeholder="Ej: Nacho Giménez" 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-14 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl text-sm font-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Correo Electrónico</label>
                            <Input 
                                type="email"
                                placeholder="ejemplo@email.com" 
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="h-14 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl text-sm font-black"
                            />
                        </div>
                    </div>
                    <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center gap-3">
                        <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)} className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                        </Button>
                        <Button type="submit" disabled={isSaving || !newName || !newEmail} className="flex-[2] h-12 rounded-2xl bg-lime-400 text-zinc-950 font-black text-[10px] uppercase tracking-widest">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear y Asignar"}
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
            title="Asignar alumnos"
            description="Gestioná quién entrena con esta planificación."
            items={students}
            multiple={true}
            initialSelectedIds={selectedIds}
            isLoading={isLoading}
            isSaving={isSaving}
            onConfirm={handleConfirmAssignment}
            confirmLabel="Confirmar Asignación"
            allTags={stats.allTags}
            onCreateNew={() => setShowCreateForm(true)}
            createNewLabel="Nuevo alumno"
            warningMessage="Algunos alumnos ya tienen un plan activo. Al confirmar, su rutina será reemplazada por esta."
            renderItem={(s, isSelected) => (
                <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                        <p className={`text-sm font-black tracking-tight uppercase truncate ${isSelected ? 'text-zinc-950 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {s.name}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-300 dark:text-zinc-600 truncate lowercase">
                            {s.email || "Sin email"}
                        </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                        {s.plan_id === currentPlanId && <CheckCircle2 className="w-4 h-4 text-lime-500" />}
                        {s.plan_id && s.plan_id !== currentPlanId && (
                            <div className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center gap-1">
                                <span className="text-[8px] font-black uppercase text-amber-600 tracking-tighter">En otro plan</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        />
    );
}
