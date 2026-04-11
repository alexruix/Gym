import React, { useState } from "react";
import { Plus, Settings2, Share2, ClipboardList, Dumbbell } from "lucide-react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { ProfileWorkspaceTabs } from "./ProfileWorkspaceTabs";
import { StudentRoutineWorkspace } from "./StudentRoutineWorkspace";
import { StudentCalendarTab } from "./StudentCalendarTab";
import { StudentInfoTab } from "./StudentInfoTab";
import { StudentNotesTab } from "./StudentNotesTab";
import { useStudentPlanEditor } from "@/hooks/profesor/useStudentPlanEditor";
import { useStudentActions } from "@/hooks/useStudentActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudentProfileManagerProps {
  assignedPlan: any;
  student: any;
  library: any[];
}

export function StudentProfileManager({ assignedPlan, student, library }: StudentProfileManagerProps) {
  const [activeTab, setActiveTab] = useState<"plan" | "routine" | "info" | "history" | "notes">("routine");
  const [notes, setNotes] = useState(student.notas || "");
  const { openWhatsApp, copyGuestLink } = useStudentActions();
  const planDataEmpty = !assignedPlan || (assignedPlan.rutinas_diarias?.length || 0) === 0;
  
  const { 
    plan, 
    setPlan,
    selectors: { getGroupedExercises },
    actions: { updateExerciseMetrics, moveExercise, deleteExercise, addExercise, promotePlan }
  } = useStudentPlanEditor(student.id, assignedPlan);

  const handleCalendarPlanChange = (ejercicioPlanId: string, updates: any) => {
    setPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        rutinas_diarias: prev.rutinas_diarias.map(r => ({
          ...r,
          ejercicios_plan: r.ejercicios_plan.map(e => 
            e.id === ejercicioPlanId ? { ...e, ...updates } : e
          )
        }))
      };
    });
  };

  const planWorkspace = (
    <StudentRoutineWorkspace 
      alumnoId={student.id} 
      planData={plan} 
      library={library} 
      mode="plan"
      onUpdateMetrics={updateExerciseMetrics}
      onMove={moveExercise}
      onDelete={deleteExercise}
      onAdd={addExercise}
      promotePlan={promotePlan}
      getGroupedExercises={getGroupedExercises}
    />
  );

  const routineWorkspace = (
    <StudentCalendarTab
      alumnoId={student.id}
      fechaInicio={student.fecha_inicio || null}
      planData={plan}
      diasAsistencia={student.dias_asistencia || []}
      onPlanChange={handleCalendarPlanChange}
    />
  );

  return (
    <div className="relative">
      <ProfileWorkspaceTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        planContent={planWorkspace}
        routineContent={routineWorkspace}
        infoContent={<StudentInfoTab student={student} />}
        notesContent={<StudentNotesTab alumnoId={student.id} notes={notes} onSaveSuccess={setNotes} />}
        historyContent={null}
      />

      {/* FAB - Quick Actions PWA Zone */}
      <div className="fixed bottom-8 right-6 z-[60] flex flex-col gap-3 items-end">
        {/* Acción Principal Contextual (Si estamos en rutina, añadir ejercicio es prioritario) */}
        {activeTab === "routine" && !planDataEmpty && (
          <Button
            onClick={() => {
              // Simular click en el botón de añadir del primer día abierto o el primero disponible
              const firstRoutine = plan?.rutinas_diarias?.[0];
              if (firstRoutine) {
                // Esta es una simplificación, en un caso real dispararíamos el evento correcto
                const event = new CustomEvent('open-exercise-search', { detail: { rutinaId: firstRoutine.id } });
                window.dispatchEvent(event);
              }
            }}
            className="w-14 h-14 rounded-2xl bg-lime-500 text-zinc-950 shadow-2xl border-2 border-white dark:border-zinc-900 transition-all hover:scale-110 active:scale-95 flex items-center justify-center mb-1 group"
          >
            <Dumbbell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "w-16 h-16 rounded-full shadow-2xl border-4 border-white dark:border-zinc-900 group transition-all hover:scale-110 active:scale-90 flex items-center justify-center",
                activeTab === "routine" ? "bg-zinc-950 text-white dark:bg-zinc-900" : "bg-zinc-950 text-white dark:bg-lime-500 dark:text-zinc-950"
              )}
            >
              <Plus className="w-8 h-8 transition-transform group-hover:rotate-90" strokeWidth={3} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-[2rem] border-zinc-200 dark:border-zinc-800 shadow-2xl mb-4">
             <DropdownMenuItem onClick={() => openWhatsApp(student.nombre, student.telefono || "", { type: 'general' })} className="py-4 font-bold text-[10px] uppercase tracking-widest gap-4 rounded-2xl cursor-pointer">
               <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                 <WhatsappLogoIcon size={20} className="text-emerald-500" />
               </div>
               WhatsApp Directo
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => copyGuestLink(student.id)} className="py-4 font-bold text-[10px] uppercase tracking-widest gap-4 rounded-2xl cursor-pointer">
               <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                 <Share2 size={20} className="text-blue-500" />
               </div>
               Compartir Acceso
             </DropdownMenuItem>
             
             {activeTab === "routine" && (
                <DropdownMenuItem onClick={() => {}} className="py-4 font-bold text-[10px] uppercase tracking-widest gap-4 rounded-2xl cursor-pointer">
                  <div className="w-10 h-10 bg-zinc-500/10 rounded-xl flex items-center justify-center">
                    <Settings2 size={20} className="text-zinc-500" />
                  </div>
                  Logística & Plan
                </DropdownMenuItem>
             )}

             {activeTab === "info" && (
                <DropdownMenuItem className="py-4 font-bold text-[10px] uppercase tracking-widest gap-4 rounded-2xl cursor-pointer">
                  <a href={`/profesor/alumnos/${student.id}/edit`} className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 bg-lime-500/10 rounded-xl flex items-center justify-center">
                      <Settings2 size={20} className="text-lime-500" />
                    </div>
                    Editar Perfil
                  </a>
                </DropdownMenuItem>
             )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
