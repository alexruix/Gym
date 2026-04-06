import React, { useEffect, useRef, useState } from "react";
import { 
  Clock, 
  Users, 
  Settings, 
  ListChecks, 
  FileSpreadsheet,
  ArrowRight
} from "lucide-react";
import { AgendaStudentCard } from "./AgendaStudentCard";
import { TurnoSelectorDialog } from "@/components/molecules/profesor/agenda/TurnoSelectorDialog";
import { TurnoManagementSheet } from "./TurnoManagementSheet";
import { LogisticsPanel } from "./LogisticsPanel";
import { ImportStudentsModal } from "@/components/organisms/profesor/alumnos/ImportStudentsModal";
import { DashboardConsole } from "@/components/molecules/profesor/DashboardConsole";
import { DaySelector } from "@/components/molecules/profesor/agenda/DaySelector";
import { TurnoBlock } from "./TurnoBlock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { agendaCopy } from "@/data/es/profesor/agenda";
import { useAgenda } from "@/hooks/useAgenda";
import type { BaseEntity } from "@/types/core";

interface Turno {
  id: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  color_tag?: string;
  capacidad_max: number;
  dias_asistencia: string[];
}

interface Student extends BaseEntity {
  nombre: string;
  turno_id: string | null;
  dias_asistencia: string[];
}

interface Session {
  alumno_id: string;
  progress: number;
  coreExercise?: {
    nombre: string;
    peso_target?: string;
    peso_real?: string;
  };
}

interface AgendaConsoleProps {
  turnos: Turno[];
  students: Student[];
  initialSessions: Session[];
  presentCount: number;
}

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function AgendaConsole({ turnos, students, initialSessions, presentCount }: AgendaConsoleProps) {
  const realTodayName = dayNames[new Date().getDay()];
  const [activeDay, setActiveDay] = useState(realTodayName);

  // FILTRADO INTELIGENTE POR DÍA (Contexto Temporal) - Moviendo a renderGrid para mantener listado global
  const { 
    sessions, 
    activeTurnoId, 
    studentsByTurno, 
    refreshStudentProgress 
  } = useAgenda(turnos, students, initialSessions);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBlockRef = useRef<HTMLDivElement>(null);
  const t = agendaCopy.blocks;
  const copy = agendaCopy.header.actions;
  const logCopy = agendaCopy.modals.logistics;

  useEffect(() => {
    if (activeBlockRef.current && activeDay === realTodayName) {
        activeBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTurnoId, activeDay, realTodayName]);

  const dashboardItems = React.useMemo(() => 
    students.map(s => ({ ...s, name: s.nombre })), 
    [students]
  );

  const renderBlocks = (filteredBySearch: Student[]) => {
    // 1. Filtrar por el día activo DENTRO de la grilla para que funcione SSOT con la tabla global
    const gridStudents = filteredBySearch.filter(s => 
      !s.dias_asistencia || s.dias_asistencia.length === 0 || s.dias_asistencia.includes(activeDay)
    );
    const gridTurnos = turnos.filter(t => 
      !t.dias_asistencia || t.dias_asistencia.length === 0 || t.dias_asistencia.includes(activeDay)
    );

    const groupedByTurno: Record<string, Student[]> = {};
    gridStudents.forEach(s => {
      if (s.turno_id) {
        if (!groupedByTurno[s.turno_id]) groupedByTurno[s.turno_id] = [];
        groupedByTurno[s.turno_id].push(s);
      }
    });

    return (
      <div className="space-y-12 pb-32" ref={scrollRef}>
        {turnos.length > 0 && (
            <DaySelector 
                activeDay={activeDay}
                setActiveDay={setActiveDay}
                realTodayName={realTodayName}
            />
        )}
        
        {turnos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in fade-in duration-700">
              <div className="p-8 rounded-[3rem] bg-zinc-50 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 mb-2">
                  <Settings className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
              </div>
              <div>
                  <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter mb-2">Aún no hay turnos</h3>
                  <p className="text-sm font-medium text-zinc-400 max-w-md mx-auto leading-relaxed">{t.noBlocks}</p>
              </div>
              <Button 
                onClick={() => setIsManagementOpen(true)}
                className="h-14 px-8 mt-2 rounded-[2rem] bg-lime-400 text-zinc-950 hover:bg-lime-500 shadow-lg shadow-lime-400/20 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 group"
              >
                <Settings className="w-4 h-4 mr-2 text-zinc-600 group-hover:text-zinc-950 transition-colors" />
                Configurar tu primer turno
              </Button>
          </div>
        ) : gridTurnos.length > 0 ? (
          gridTurnos.map((turno) => {
            const isActive = turno.id === activeTurnoId && activeDay === realTodayName;
            const turnoStudents = groupedByTurno[turno.id] || [];

            if (filteredBySearch.length !== students.length && turnoStudents.length === 0) return null;

            return (
              <TurnoBlock 
                key={turno.id}
                turno={turno}
                isActive={isActive}
                activeDay={activeDay}
                realTodayName={realTodayName}
                turnoStudents={turnoStudents}
                sessions={sessions}
                onViewRoutine={(id) => window.location.assign(`/profesor/alumnos/${id}`)}
                onChangeTurno={(id, nombre, currentTurnoId) => {
                    setSelectedStudent({ id, nombre, currentTurnoId });
                    setIsSelectorOpen(true);
                }}
                innerRef={isActive ? activeBlockRef : null}
              />
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="p-8 rounded-[3rem] bg-zinc-50 border border-zinc-100">
                  <Clock className="w-12 h-12 text-zinc-200" />
              </div>
              <div>
                  <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Agenda cerrada para el {activeDay}</h3>
                  <p className="text-sm font-medium text-zinc-400 max-w-xs mx-auto mt-2">No tenés turnos configurados para este día de la semana.</p>
              </div>
          </div>
        )}
      </div>
    );
  };

  const renderList = (filteredBySearch: Student[]) => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-xl shadow-zinc-900/5">
          <div className="overflow-x-auto">
            <table className="w-auto sm:w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Alumno</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Turno</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Progreso {activeDay === realTodayName ? "Hoy" : activeDay}</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-zinc-400">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredBySearch.map(student => {
                  const turno = turnos.find(t => t.id === student.turno_id);
                  const session = sessions.find(s => s.alumno_id === student.id);
                  return (
                    <tr key={student.id} className="group hover:bg-zinc-50 transition-colors">
                      <td className="px-8 py-4">
                        <span className="font-bold text-zinc-900 group-hover:text-lime-600 transition-colors">{student.nombre}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          {turno ? `${turno.hora_inicio.slice(0, 5)} - ${turno.nombre}` : "Sin turno"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div className="h-full bg-lime-400 transition-all duration-700" style={{ width: `${session?.progress || 0}%` }} />
                           </div>
                           <span className="text-xs font-black text-zinc-900 leading-none">{Math.round(session?.progress || 0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl h-9 hover:bg-lime-400 hover:text-zinc-950 group/btn"
                          onClick={() => window.location.assign(`/profesor/alumnos/${student.id}`)}
                        >
                          <ArrowRight className="w-4 h-4 text-zinc-400 group-hover/btn:text-zinc-950" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
        <DashboardConsole
        items={dashboardItems}
        itemLabel="Alumnos"
        storageKey="agenda-v2"
        forceRender={true}
        searchPlaceholder="Buscá a tus alumnos por nombre..."
        renderGrid={(items) => renderBlocks(items as Student[])}
        renderTable={(items) => renderList(items as Student[])}
        searchSuffix={
          <div className="flex items-center gap-3 px-4 py-2 bg-lime-50 border border-lime-100 rounded-2xl shadow-sm h-12 md:h-14">
            <Users className="w-4 h-4 text-lime-600" />
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-lime-600 leading-none">
                    Alumnos
                </span>
                <span className="text-sm font-black text-zinc-900 leading-none mt-1">
                    {students.length}
                </span>
            </div>
          </div>
        }
        renderCreateAction={() => (
           <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsLogisticsOpen(true)}
                className="h-12 md:h-14 px-5 rounded-2xl border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 transition-all active:scale-95 group"
                title="Logística masiva"
              >
                <ListChecks className="w-5 h-5 text-zinc-400 group-hover:text-lime-600 transition-colors" />
                <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-900 hidden sm:inline">{logCopy.trigger}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsImportOpen(true)}
                className="h-12 md:h-14 px-5 rounded-2xl border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 transition-all active:scale-95 group"
              >
                <FileSpreadsheet className="w-5 h-5 text-zinc-400 group-hover:text-lime-600 transition-colors" />
                <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-900 hidden sm:inline">Importar</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsManagementOpen(true)}
                className="h-12 md:h-14 w-12 md:w-14 p-0 rounded-2xl border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 transition-all active:scale-95 group"
                title="Configuración de bloques"
              >
                <Settings className="w-5 h-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
              </Button>
           </div>
        )}
      />

      <TurnoSelectorDialog
        isOpen={isSelectorOpen}
        onOpenChange={setIsSelectorOpen}
        student={selectedStudent}
        turnos={turnos}
        onSuccess={() => window.location.reload()}
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
        onEditStudent={(student) => {
            setSelectedStudent({ id: student.id, nombre: student.nombre, currentTurnoId: student.turno_id });
            setIsSelectorOpen(true);
        }}
      />

      <ImportStudentsModal 
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
