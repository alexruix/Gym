import React, { useState } from "react";
import { ProfileWorkspaceTabs } from "./ProfileWorkspaceTabs";
import { StudentRoutineWorkspace } from "./StudentRoutineWorkspace";
import { StudentCalendarTab } from "./StudentCalendarTab";
import { StudentInfoTab } from "./StudentInfoTab";

interface StudentProfileManagerProps {
  assignedPlan: any;
  student: any;
  library: any[];
}

/**
 * StudentProfileManager: Orquestador del Workspace del Alumno.
 * - Tab "Plan": Editor de rutina técnica y métricas (StudentRoutineWorkspace)
 * - Tab "Rutina": Agenda operativa real con calendario de sesiones (StudentCalendarTab)
 */
export function StudentProfileManager({ assignedPlan, student, library }: StudentProfileManagerProps) {
  const [activeTab, setActiveTab] = useState<"plan" | "routine" | "info" | "history">("routine");

  const planWorkspace = (
    <StudentRoutineWorkspace 
      alumnoId={student.id} 
      planData={assignedPlan} 
      library={library} 
      mode="plan"
    />
  );

  // Tab "Rutina" → Agenda Operativa Real del alumno
  const routineWorkspace = (
    <StudentCalendarTab
      alumnoId={student.id}
      fechaInicio={student.fecha_inicio || null}
      planData={assignedPlan}
    />
  );

  return (
    <ProfileWorkspaceTabs 
      activeTab={activeTab}
      onTabChange={setActiveTab}
      planContent={planWorkspace}
      routineContent={routineWorkspace}
      infoContent={<StudentInfoTab student={student} />}
      historyContent={null}
    />
  );
}
