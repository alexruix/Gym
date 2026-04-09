import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  Layers,
  Users,
  Edit3,
  Copy,
  Dumbbell,
  ChevronDown,
  TrendingUp,
  Search,
  Plus,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { IndustrialTabs } from "@/components/molecules/IndustrialTabs";
import { planesCopy } from "@/data/es/profesor/planes";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusType } from "@/components/molecules/StatusBadge";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { PlanMetric } from "@/components/atoms/profesor/planes/PlanMetric";
import { RoutineExerciseRow } from "@/components/molecules/profesor/planes/RoutineExerciseRow";
import { StudentCompactCard } from "@/components/molecules/profesor/planes/StudentCompactCard";
import { ViewToggle } from "@/components/molecules/ViewToggle";
import { StudentAssignmentDialog } from "@/components/molecules/profesor/planes/StudentAssignmentDialog";
import { StandardTable, type TableColumn } from "@/components/organisms/StandardTable";
import { ExerciseSearchDialog } from "@/components/molecules/profesor/planes/ExerciseSearchDialog";
import { BackButton } from "@/components/atoms/profesor/BackButton";
import { cn } from "@/lib/utils";
import { PlanPill } from "@/components/atoms/profesor/planes/PlanPill";
import { ActionBridge } from "@/components/molecules/profesor/planes/ActionBridge";

// --- Tipos ---
interface EjercicioPlan {
  id: string;
  orden: number;
  biblioteca_ejercicios: {
    id: string;
    nombre: string;
    media_url: string | null;
  } | null;
}

interface RutinaDiaria {
  id: string;
  dia_numero: number;
  nombre_dia: string | null;
  orden: number;
  ejercicios_plan: EjercicioPlan[];
}

interface Alumno {
  id: string;
  nombre: string;
  email: string | null;
  estado: string;
  telefono?: string;
  notas?: string;
}

interface PlanData {
  id: string;
  nombre: string;
  duracion_semanas: number;
  frecuencia_semanal: number;
  created_at: string;
  rutinas: RutinaDiaria[];
  alumnos: Alumno[];
}

interface Props {
  plan: PlanData;
  library: any[];
}

type SyncStatus = "synced" | "syncing" | "error" | "retrying";

export function PlanDetail({ plan: initialPlan, library }: Props) {
  const c = planesCopy.detail;
  const [activeTab, setActiveTab] = useState<"routines" | "students">("routines");
  const [studentView, setStudentView] = useState<"grid" | "table">("grid");
  const [studentSearch, setStudentSearch] = useState("");
  const [localPlan, setLocalPlan] = useState<PlanData>(initialPlan);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [retryCount, setRetryCount] = useState(0);
  const isInteracting = useRef(false);
  const [openRutinas, setOpenRutinas] = useState<Set<string>>(
    new Set(initialPlan.rutinas.slice(0, 1).map((r) => r.id))
  );
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeRoutineTarget, setActiveRoutineTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!isInteracting.current) return;

    const syncWithServer = async () => {
      setSyncStatus("syncing");

      const payload = {
        id: localPlan.id,
        nombre: localPlan.nombre,
        duracion_semanas: localPlan.duracion_semanas,
        frecuencia_semanal: localPlan.frecuencia_semanal,
        rutinas: localPlan.rutinas.map(r => ({
          dia_numero: r.dia_numero,
          nombre_dia: r.nombre_dia || "",
          ejercicios: r.ejercicios_plan
            .filter(e => e.biblioteca_ejercicios?.id)
            .map((e, idx) => ({
              ejercicio_id: e.biblioteca_ejercicios!.id,
              orden: idx,
              exercise_type: "base" as const,
              position: idx
            }))
        }))
      } as any;

      try {
        const { error } = await actions.profesor.updatePlan(payload);
        if (error) throw error;

        setSyncStatus("synced");
        setRetryCount(0);
      } catch (err) {
        console.error("Sync Error:", err);
        if (retryCount < 3) {
          setSyncStatus("retrying");
          setTimeout(() => setRetryCount(prev => prev + 1), 2000);
        } else {
          setSyncStatus("error");
          toast.error("Error de conexión al guardar cambios.");
        }
      }
    };

    const timer = setTimeout(syncWithServer, 1000);
    return () => clearTimeout(timer);
  }, [localPlan, retryCount]);

  const toggleRutina = (id: string) => {
    setOpenRutinas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const removeExercise = (rutinaId: string, exerciseId: string) => {
    isInteracting.current = true;
    const oldPlan = { ...localPlan };

    setLocalPlan(prev => ({
      ...prev,
      rutinas: prev.rutinas.map(r => {
        if (r.id !== rutinaId) return r;
        return {
          ...r,
          ejercicios_plan: r.ejercicios_plan.filter(e => e.id !== exerciseId)
        };
      })
    }));

    toast.info("Ejercicio removido", {
      description: "Se eliminó el ejercicio de la rutina.",
      action: {
        label: "Deshacer",
        onClick: () => {
          setLocalPlan(oldPlan);
          toast.success("Cambio revertido");
        }
      },
      duration: 5000
    });
  };

  const addExercise = (exerciseId: string) => {
    if (!activeRoutineTarget) return;
    isInteracting.current = true;

    setLocalPlan(prev => ({
      ...prev,
      rutinas: prev.rutinas.map(r => {
        if (r.id !== activeRoutineTarget) return r;
        const baseExercise = library.find(ex => ex.id === exerciseId);
        const newExercise: EjercicioPlan = {
          id: crypto.randomUUID(),
          orden: r.ejercicios_plan.length,
          biblioteca_ejercicios: baseExercise ? {
            id: baseExercise.id,
            nombre: baseExercise.nombre,
            media_url: baseExercise.media_url
          } : null
        };
        return {
          ...r,
          ejercicios_plan: [...r.ejercicios_plan, newExercise]
        };
      })
    }));
    setIsSearchOpen(false);
    toast.success("Ejercicio añadido");
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    toast.loading("Duplicando plan...");
    try {
      const { data: result, error } = await actions.profesor.duplicatePlan({ id: localPlan.id });
      if (error) {
        toast.error(error.message || "Error al duplicar");
        return;
      }
      if (result?.success) {
        toast.dismiss();
        toast.success(result.mensaje);
        window.location.href = `/profesor/planes/${result.plan_id}/edit`;
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleAssignmentSuccess = (newAssignedStudents: any[]) => {
    setLocalPlan(prev => {
      const mappedStudents = newAssignedStudents.map(s => ({
        id: s.id,
        nombre: s.name,
        email: s.email,
        estado: s.estado || 'activo',
        telefono: s.telefono || undefined,
        notas: s.notas || undefined
      }));
      return {
        ...prev,
        alumnos: mappedStudents
      };
    });
  };

  const createdDate = useMemo(() => {
    return new Date(localPlan.created_at).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [localPlan.created_at]);

  const activeStudents = useMemo(() => {
    return localPlan.alumnos
      .filter((a: any) => !a.deleted_at)
      .filter(a => a.nombre.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [localPlan.alumnos, studentSearch]);

  const groupedRoutines = useMemo(() => {
    const groups: { [key: number]: RutinaDiaria[] } = {};
    const frec = Math.max(1, localPlan.frecuencia_semanal);
    
    [...localPlan.rutinas]
      .sort((a, b) => a.dia_numero - b.dia_numero)
      .forEach(r => {
        const week = Math.ceil(r.dia_numero / frec);
        if (!groups[week]) groups[week] = [];
        groups[week].push(r);
      });
      
    return groups;
  }, [localPlan.rutinas, localPlan.frecuencia_semanal]);

  const studentColumns: TableColumn<Alumno>[] = [
    {
      header: "Alumno",
      render: (s) => (
        <div className="flex items-center gap-3 font-bold text-zinc-950 dark:text-zinc-100">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-[10px]">
            {s.nombre.charAt(0).toUpperCase()}
          </div>
          {s.nombre}
        </div>
      )
    },
    {
      header: "Correo",
      render: (s) => <span className="text-zinc-500 font-medium">{s.email || "sin email"}</span>
    },
    {
      header: "Estado",
      render: (s) => <StatusBadge status={s.estado as StatusType} />
    }
  ];

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-700", syncStatus === "error" && "opacity-80 pointer-events-none")}>

      <div className="flex items-center">
        <BackButton href="/profesor/planes" />
      </div>

      <section className="bg-white dark:bg-zinc-950/20 md:rounded-[2.5rem] md:border border-zinc-200 dark:border-zinc-800/60 shadow-2xl shadow-zinc-950/5 overflow-hidden relative -mx-4 md:mx-0">
        <div className="h-1.5 md:h-2 w-full bg-gradient-to-r from-lime-400 via-lime-500 to-emerald-600" />

        <div className="absolute top-4 right-8 z-20">
          {syncStatus === "syncing" && (
            <div className="flex items-center gap-2 bg-zinc-950/10 dark:bg-zinc-50/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <RefreshCcw className="w-3 h-3 text-lime-500 animate-spin" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-300">Sincronizando...</span>
            </div>
          )}
          {syncStatus === "synced" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-lime-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Guardado</span>
            </div>
          )}
          {syncStatus === "retrying" && (
            <div className="flex items-center gap-2 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
              <RefreshCcw className="w-3 h-3 text-amber-500 animate-spin" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600">Reintentando sync... ({retryCount})</span>
            </div>
          )}
          {syncStatus === "error" && (
            <div className="flex items-center gap-2 bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
              <AlertCircle className="w-3 h-3 text-red-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-red-600">Error de conexión</span>
            </div>
          )}
        </div>

        <div className="p-4 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-2xl shrink-0 group hover:rotate-6 transition-transform duration-500">
                <Dumbbell className="w-7 h-7 md:w-10 md:h-10 text-lime-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-4xl font-bold capitalize tracking-tighter text-zinc-950 dark:text-white leading-none mb-2 truncate">
                  {localPlan.nombre}
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <PlanPill
                    icon={Calendar}
                    value={createdDate}
                    label={c.meta.createdAt}
                  />
                  <PlanPill
                    icon={Layers}
                    value={localPlan.frecuencia_semanal}
                    label="días"
                    variant="accent"
                  />
                  <PlanPill
                    icon={TrendingUp}
                    value={localPlan.duracion_semanas}
                    label="sem"
                  />
                  <PlanPill
                    icon={Users}
                    value={activeStudents.length}
                    label="alumnos"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                asChild
                className="h-10 md:h-12 px-4 md:px-6 gap-2 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] rounded-xl md:rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-95 flex-1 md:flex-none shadow-sm"
              >
                <a href={`/profesor/planes/${localPlan.id}/edit`}>
                  <Edit3 className="w-3.5 h-3.5" />
                  {c.actions.edit.split(' ')[0]}
                </a>
              </Button>
              <Button
                disabled={isDuplicating}
                onClick={handleDuplicate}
                className="h-10 md:h-12 px-4 md:px-6 gap-2 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded-xl md:rounded-2xl font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-lime-500/10 active:scale-95 transition-all flex-1 md:flex-none disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                {isDuplicating ? "..." : c.actions.duplicate}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <IndustrialTabs
          tabs={[
            { value: "routines", label: c.tabs.routines, icon: Dumbbell },
            { value: "students", label: c.tabs.students, icon: Users }
          ]}
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          rightContent={
            activeTab === "students" && activeStudents.length > 0 ? (
              <>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-lime-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Buscar alumno..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl pl-9 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-lime-400/20 w-48 transition-all"
                  />
                </div>
                <ViewToggle view={studentView} onChange={setStudentView} />
              </>
            ) : null
          }
        >
          {activeTab === "routines" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
              {Object.entries(groupedRoutines).map(([weekNumStr, rutinasDeSemana]) => {
                const weekNum = parseInt(weekNumStr);
                return (
                  <div key={`week-${weekNum}`} className="space-y-4">
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full">
                        Semana {weekNum}
                      </span>
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1" />
                    </div>

                    {rutinasDeSemana.map((rutina) => {
                      const isOpen = openRutinas.has(rutina.id);
                      const relativeRoutineIndex = rutina.dia_numero - (weekNum - 1) * Math.max(1, localPlan.frecuencia_semanal);

                      return (
                        <div key={rutina.id} className="bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-zinc-950/5 transition-all duration-300">
                          <button
                            onClick={() => toggleRutina(rutina.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-4 md:p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all group sticky top-0 z-30 bg-white dark:bg-zinc-950",
                              isOpen && "shadow-lg shadow-zinc-950/5 border-b border-zinc-100 dark:border-zinc-900"
                            )}
                          >
                            <div className="flex items-center gap-4 md:gap-6">
                              <span className={cn(
                                "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-base md:text-lg transition-all duration-500 shrink-0",
                                isOpen ? "bg-zinc-950 text-white dark:bg-lime-500 dark:text-zinc-950 rotate-6" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:rotate-6"
                              )}>
                                R{rutina.dia_numero}
                              </span>
                              <div className="text-left">
                                <h4 className="font-bold text-lg md:text-xl text-zinc-950 dark:text-white uppercase tracking-tighter leading-none group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                                  {rutina.nombre_dia || `Rutina ${relativeRoutineIndex}`}
                                </h4>
                                {rutina.ejercicios_plan.length === 0 ? (
                                  <p className="text-[9px] font-bold text-red-500 dark:text-red-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2 animate-pulse">
                                    <AlertCircle className="w-2.5 h-2.5" />
                                    Sin ejercicios cargados
                                  </p>
                                ) : (
                                  <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1 md:mt-1.5 flex items-center gap-2">
                                    <Layers className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                    {rutina.ejercicios_plan.length} ejercicios técnicos
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className={cn(
                              "gap-2 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center transition-all duration-300 shrink-0",
                              isOpen ? "rotate-180 bg-zinc-950 text-white" : "group-hover:bg-zinc-100"
                            )}>
                              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200" />
                            </div>
                          </button>

                          {isOpen && (
                            <div className="border-t border-zinc-100 dark:border-zinc-900 divide-y divide-zinc-50 dark:divide-zinc-900/50 animate-in fade-in slide-in-from-top-4 duration-500">
                              {rutina.ejercicios_plan.length > 0 ? (
                                <>
                                  {rutina.ejercicios_plan.map((ej: any, idx: number) => (
                                    <RoutineExerciseRow
                                      key={ej.id}
                                      exercise={ej}
                                      index={idx}
                                      hideMetrics={true}
                                      onDelete={() => removeExercise(rutina.id, ej.id)}
                                    />
                                  ))}
                                  <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                                    <Button
                                      variant="ghost"
                                      className="w-full h-14 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 hover:border-lime-400 hover:bg-lime-500/5 text-zinc-400 hover:text-lime-500 transition-all gap-3 font-bold uppercase text-[10px] tracking-widest"
                                      onClick={() => {
                                        setActiveRoutineTarget(rutina.id);
                                        setIsSearchOpen(true);
                                      }}
                                    >
                                      <Plus className="w-4 h-4" />
                                      {c.routines.emptyDay.split(' ')[0]} ejercicio
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="p-6 md:p-10">
                                  <ActionBridge
                                    icon={Dumbbell}
                                    title="Rutina vacía"
                                    description="Cargá los ejercicios de este día para que tus alumnos puedan entrenar."
                                    actionLabel="Agregar ejercicios"
                                    onAction={() => {
                                      setActiveRoutineTarget(rutina.id);
                                      setIsSearchOpen(true);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "students" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeStudents.length === 0 ? (
                <ActionBridge
                  icon={Users}
                  title="Sin alumnos asignados"
                  description="Asigná este plan a tus alumnos para que puedan ver sus rutinas."
                  actionLabel="Asignar Alumno"
                  onAction={() => setIsAssignDialogOpen(true)}
                />
              ) : (
                studentView === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeStudents.map((alumno) => (
                      <StudentCompactCard
                        key={alumno.id}
                        student={{
                          ...alumno,
                          planName: localPlan.nombre
                        }}
                        onClick={(id) => window.location.href = `/profesor/alumnos/${id}`}
                      />
                    ))}
                    <button
                      onClick={() => setIsAssignDialogOpen(true)}
                      className="bg-zinc-50/50 dark:bg-zinc-900/10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-lime-500 hover:border-lime-400 hover:bg-lime-500/5 transition-all duration-300 group min-h-[160px]"
                    >
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm group-hover:rotate-12 transition-transform">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Asignar alumno</span>
                    </button>
                  </div>
                ) : (
                  <StandardTable
                    data={activeStudents}
                    columns={studentColumns}
                    onRowClick={(s) => window.location.href = `/profesor/alumnos/${s.id}`}
                    entityName="Alumnos"
                  />
                )
              )}
            </div>
          )}
        </IndustrialTabs>
      </div>

      {syncStatus === "error" && (
        <div className="fixed inset-x-0 bottom-8 flex justify-center px-4 z-50">
          <div className="bg-red-500 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-red-400 animate-in slide-in-from-bottom-8">
            <AlertCircle className="w-6 h-6 animate-pulse" />
            <div className="text-left">
              <p className="font-bold uppercase tracking-tight text-sm">Error de sincronización persistente</p>
              <p className="text-[10px] font-medium opacity-90">Los cambios que hagas ahora no se guardarán. Por favor, reintentá manualmente.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSyncStatus("synced"); setRetryCount(0); }}
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-xl text-[10px] uppercase font-bold tracking-widest"
            >
              Reintentar ahora
            </Button>
          </div>
        </div>
      )}

      <StudentAssignmentDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        currentPlanId={localPlan.id}
        planFrequency={localPlan.frecuencia_semanal}
        onSuccess={handleAssignmentSuccess}
      />

      <ExerciseSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelect={addExercise}
        library={library}
        onExerciseCreated={() => window.location.reload()}
      />
    </div>
  );
}
