import React, { useState } from "react";
import { ProfileWorkspaceTabs } from "./ProfileWorkspaceTabs";
import { StudentRoutineWorkspace } from "./StudentRoutineWorkspace";
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
  const [activeTab, setActiveTab] = useState<"routine" | "info" | "history">("routine");

  return (
    <ProfileWorkspaceTabs 
      activeTab={activeTab}
      onTabChange={setActiveTab}
      routineContent={<StudentRoutineWorkspace alumnoId={student.id} planData={assignedPlan} library={library} />}
      infoContent={<StudentInfoTab student={student} />}
      historyContent={null}
    />
  );
}
