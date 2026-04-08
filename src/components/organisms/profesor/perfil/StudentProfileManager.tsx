import React, { useState } from "react";
import { Plus, Settings2, Share2, ClipboardList, Dumbbell } from "lucide-react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { ProfileWorkspaceTabs } from "./ProfileWorkspaceTabs";
import { StudentRoutineWorkspace } from "./StudentRoutineWorkspace";
import { StudentCalendarTab } from "./StudentCalendarTab";
import { StudentInfoTab } from "./StudentInfoTab";
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
  const [activeTab, setActiveTab] = useState<"plan" | "routine" | "info" | "history">("routine");
  const { openWhatsApp, copyGuestLink } = useStudentActions();
  
  const { 
    plan, 
    updateExerciseMetrics, 
    moveExercise, 
    deleteExercise, 
    addExercise,
    promotePlan,
    getGroupedExercises 
  } = useStudentPlanEditor(student.id, assignedPlan);

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
        historyContent={null}
      />

      {/* FAB - Quick Actions PWA Zone */}
      <div className="fixed bottom-8 right-6 z-[60] flex flex-col gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="w-16 h-16 rounded-full bg-zinc-950 dark:bg-lime-500 text-white dark:text-zinc-950 shadow-2xl border-4 border-white dark:border-zinc-900 group transition-all hover:scale-110 active:scale-90"
            >
              <Plus className="w-8 h-8 transition-transform group-hover:rotate-90" strokeWidth={3} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-[2rem] border-zinc-200 dark:border-zinc-800 shadow-2xl mb-4">
             <DropdownMenuItem onClick={() => openWhatsApp(student.nombre, student.telefono || "", { type: 'general' })} className="py-4 font-bold text-[10px] uppercase tracking-widest gap-4 rounded-2xl">
               <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                 <WhatsappLogoIcon size={20} className="text-emerald-500" />
               </div>
               WhatsApp Directo
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => copyGuestLink(student.id)} className="py-4 font-bold text-[10px] uppercase tracking-widest gap-4 rounded-2xl">
               <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                 <Share2 size={20} className="text-blue-500" />
               </div>
               Compartir Acceso
             </DropdownMenuItem>
             <DropdownMenuItem className="py-4 font-bold text-[10px] uppercase tracking-widest gap-4 rounded-2xl">
               <div className="w-10 h-10 bg-lime-500/10 rounded-xl flex items-center justify-center">
                 <Dumbbell size={20} className="text-lime-500" />
               </div>
               Nuevo Ejercicio
             </DropdownMenuItem>
             <DropdownMenuItem className="py-4 font-bold text-[10px] uppercase tracking-widest gap-4 rounded-2xl">
               <div className="w-10 h-10 bg-zinc-500/10 rounded-xl flex items-center justify-center">
                 <Settings2 size={20} className="text-zinc-500" />
               </div>
               Logística & Plan
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
