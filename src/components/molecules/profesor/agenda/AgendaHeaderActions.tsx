import React, { useState } from "react";
import {
  FileSpreadsheet,
  Settings,
  Users,
  Plus,
  ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportStudentsModal } from "@/components/organisms/profesor/alumnos/ImportStudentsModal";
import { TurnoManagementSheet } from "@/components/organisms/profesor/agenda/TurnoManagementSheet";
import { LogisticsPanel } from "@/components/organisms/profesor/agenda/LogisticsPanel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { agendaCopy } from "@/data/es/profesor/agenda";

interface Turno {
  id: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad_max: number;
  color_tag?: string;
  dias_asistencia: string[];
}

interface Student {
  id: string;
  nombre: string;
  turno_id: string | null;
}

interface AgendaHeaderActionsProps {
  presentCount: number;
  turnos: Turno[];
  students: Student[];
}

export function AgendaHeaderActions({ presentCount, turnos, students }: AgendaHeaderActionsProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);

  const handleImportSuccess = () => {
    // RECARGA AUTOMÁTICA como pidió el usuario (SSOT)
    window.location.reload();
  };

  const copy = agendaCopy.header.actions;
  const logCopy = agendaCopy.modals.logistics;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Badge de Telemetría */}
      <div className="flex items-center gap-3 px-4 py-2 bg-lime-50 border border-lime-100 rounded-2xl shadow-sm">
        <Users className="w-4 h-4 text-lime-600" />
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-lime-600 leading-none">Presentes hoy</span>
          <span className="text-sm font-bold text-zinc-900">{presentCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={() => setIsLogisticsOpen(true)}
          className="rounded-xl border-zinc-200 bg-white text-[10px] font-bold uppercase tracking-widest h-12 px-5 hover:bg-zinc-50 group shadow-sm transition-all active:scale-95"
          title="Panel de Logística"
        >
          <ListChecks className="w-4 h-4 mr-2 text-zinc-400 group-hover:text-lime-600 transition-colors" />
          {logCopy.trigger}
        </Button>

        {/* <Button
          variant="outline"
          onClick={() => setIsImportOpen(true)}
          className="flex-1 sm:flex-none rounded-xl border-zinc-200 bg-white text-[10px] font-bold uppercase tracking-widest h-12 px-6 hover:bg-zinc-50 group shadow-sm transition-all active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2 text-zinc-400 group-hover:text-lime-600 transition-colors" />
          Importar Excel
        </Button> */}

        <Button
          variant="outline"
          onClick={() => setIsManagementOpen(true)}
          className="rounded-xl border-zinc-200 bg-white text-[10px] font-bold uppercase tracking-widest h-12 px-5 hover:bg-zinc-50 group shadow-sm transition-all active:scale-95"
          title={copy.manageTurnos}
        >
          <Settings className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
        </Button>
      </div>

      <ImportStudentsModal
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={handleImportSuccess}
      />

      <TurnoManagementSheet
        isOpen={isManagementOpen}
        onOpenChange={setIsManagementOpen}
        turnos={turnos}
      />

      <LogisticsPanel
        isOpen={isLogisticsOpen}
        onOpenChange={setIsLogisticsOpen}
        students={students}
        turnos={turnos}
      />
    </div>
  );
}
