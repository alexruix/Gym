import React from "react";
import { ProfileWorkspaceTabs } from "./ProfileWorkspaceTabs";
import { StudentRoutineWorkspace } from "./StudentRoutineWorkspace";
import { StudentProfileSidebar } from "./StudentProfileSidebar";

interface StudentProfileManagerProps {
  assignedPlan: any;
  sidebarProps: any;
}

export function StudentProfileManager({ assignedPlan, sidebarProps }: StudentProfileManagerProps) {
  return (
    <ProfileWorkspaceTabs 
      activeTab="routine"
      routineContent={<StudentRoutineWorkspace planData={assignedPlan} />}
      infoContent={<StudentProfileSidebar {...sidebarProps} />}
      historyContent={null}
    />
  );
}
