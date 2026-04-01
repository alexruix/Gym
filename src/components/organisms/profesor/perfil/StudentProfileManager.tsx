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
 * Gestiona la transiciÃ³n entre la Rutina TÃ©cnica y la Ficha de InformaciÃ³n.
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
