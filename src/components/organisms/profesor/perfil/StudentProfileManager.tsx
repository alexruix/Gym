import React, { useState } from "react";
import { ProfileWorkspaceTabs } from "./ProfileWorkspaceTabs";
import { StudentRoutineWorkspace } from "./StudentRoutineWorkspace";
import { StudentMetricsWorkspace } from "./StudentMetricsWorkspace";
import { StudentInfoTab } from "./StudentInfoTab";

interface StudentProfileManagerProps {
  assignedPlan: any;
  student: any;
  library: any[];
}

/**
 * StudentProfileManager: Orquestador del Workspace del Alumno.
 * Gestiona la transición entre la Rutina Técnica y la Ficha de Información.
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

  const routineWorkspace = (
    <StudentMetricsWorkspace 
      alumnoId={student.id} 
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
