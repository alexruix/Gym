import React, { useState } from "react";
import { ProfileWorkspaceTabs } from "./ProfileWorkspaceTabs";
import { StudentRoutineWorkspace } from "./StudentRoutineWorkspace";
import { StudentInfoTab } from "./StudentInfoTab";

interface StudentProfileManagerProps {
  assignedPlan: any;
  student: {
    id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    fecha_inicio: string;
    dia_pago: number;
    notas?: string | null;
  };
}

/**
 * StudentProfileManager: Orquestador del Workspace del Alumno.
 * Gestiona la transición entre la Rutina Técnica y la Ficha de Información.
 */
export function StudentProfileManager({ assignedPlan, student }: StudentProfileManagerProps) {
  const [activeTab, setActiveTab] = useState<"routine" | "info" | "history">("routine");

  return (
    <ProfileWorkspaceTabs 
      activeTab={activeTab}
      onTabChange={setActiveTab}
      routineContent={<StudentRoutineWorkspace alumnoId={student.id} planData={assignedPlan} />}
      infoContent={<StudentInfoTab student={student} />}
      historyContent={null}
    />
  );
}
