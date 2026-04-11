import React, { useEffect, useRef, useState } from "react";
import {
  Users,
  Settings,
  ListChecks,
  FileSpreadsheet,
  ArrowRight,
  UserIcon,
  Dumbbell,
  Clock
} from "lucide-react";
import { AgendaStudentCard } from "./AgendaStudentCard";
import { ResourceActionMenu } from "@/components/molecules/profesor/core/ResourceActionMenu";
import { DaySelector as AttendanceDays } from "@/components/atoms/profesor/DaySelector";
import { TurnoSelectorDialog } from "@/components/molecules/profesor/agenda/TurnoSelectorDialog";
import { TurnoManagementSheet } from "./TurnoManagementSheet";
import { LogisticsPanel } from "./LogisticsPanel";
import { ImportStudentsModal } from "@/components/organisms/profesor/alumnos/ImportStudentsModal";
import { DashboardConsole } from "@/components/molecules/profesor/DashboardConsole";
import { DaySelector } from "@/components/molecules/profesor/agenda/DaySelector";
import { TurnoPills } from "@/components/molecules/profesor/agenda/TurnoPills";
import { TurnoBlock } from "./TurnoBlock";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { agendaCopy } from "@/data/es/profesor/agenda";
import { useAgenda } from "@/hooks/useAgenda";
import type { BaseEntity } from "@/types/core";
import type { Turno, StudentInAgenda as Student, SessionInAgenda as Session } from "@/types/agenda";

interface AgendaConsoleProps {
  turnos: Turno[];
  students: Student[];
  initialSessions: Session[];
  presentCount: number;
}

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function AgendaConsole({ turnos: initialTurnos, students: initialStudents, initialSessions, presentCount }: AgendaConsoleProps) {
  const realTodayName = dayNames[new Date().getDay()];
  const [activeDay, setActiveDay] = useState(realTodayName);
  const [currentTurnos, setCurrentTurnos] = useState<Turno[]>(initialTurnos);
  const [currentStudents, setCurrentStudents] = useState<Student[]>(initialStudents);

  // FILTRADO INTELIGENTE POR DÍA (Contexto Temporal) - Moviendo a renderGrid para mantener listado global
  const {
    sessions,
    activeTurnoId: hookActiveTurnoId,
    studentsByTurno,
    refreshStudentProgress
  } = useAgenda(currentTurnos, currentStudents, initialSessions);

  const [selectedTurnoId, setSelectedTurnoId] = useState<string | null>(null);

  // Sincronizar con el turno activo inteligente inicialmente
  useEffect(() => {
    if (hookActiveTurnoId && !selectedTurnoId) {
      setSelectedTurnoId(hookActiveTurnoId);
    }
  }, [hookActiveTurnoId]);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBlockRef = useRef<HTMLDivElement>(null);
  const t = agendaCopy.blocks;
  const copy = agendaCopy.header.actions;
  const logCopy = agendaCopy.modals.logistics;

  useEffect(() => {
    if (activeBlockRef.current && activeDay === realTodayName) {
      activeBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hookActiveTurnoId, activeDay, realTodayName]);

  const dashboardItems = React.useMemo(() =>
    currentStudents.map(s => ({ ...s, name: s.nombre })),
    [currentStudents]
  );

  const renderBlocks = (filteredBySearch: Student[]) => {
    // 1. Filtrar por el día activo DENTRO de la grilla para que funcione SSOT con la tabla global
    const gridStudents = filteredBySearch.filter(s =>
      !s.dias_asistencia || s.dias_asistencia.length === 0 || s.dias_asistencia.includes(activeDay)
    );
    const gridTurnos = currentTurnos.filter(t =>
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
      <div className="space-y-6 pb-32" ref={scrollRef}>
        <div className="sticky top-0 z-30 space-y-0">
          <DaySelector
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            realTodayName={realTodayName}
          />

          {gridTurnos.length > 0 && (
            <TurnoPills
              turnos={gridTurnos}
              activeTurnoId={selectedTurnoId}
              onTurnoSelect={setSelectedTurnoId}
            />
          )}
        </div>

        {currentTurnos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in fade-in duration-700">
            <div className="p-8 rounded-[3rem] bg-zinc-50 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 mb-2">
              <Settings className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter mb-2">Aún no hay turnos</h3>
              <p className="text-sm font-medium text-zinc-400 max-w-md mx-auto leading-relaxed">{t.noBlocks}</p>
            </div>
            <Button
              onClick={() => setIsManagementOpen(true)}
              className="h-14 px-8 mt-2 rounded-[2rem] bg-lime-500 text-zinc-950 hover:bg-lime-500 shadow-lg shadow-lime-400/20 font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 group"
            >
              <Settings className="w-4 h-4 mr-2 text-zinc-600 group-hover:text-zinc-950 transition-colors" />
              Configurar tu primer turno
            </Button>
          </div>
        ) : gridTurnos.length > 0 ? (
          gridTurnos
            .filter(t => !selectedTurnoId || t.id === selectedTurnoId)
            .map((turno) => {
              const isActive = turno.id === hookActiveTurnoId && activeDay === realTodayName;
              const turnoStudents = groupedByTurno[turno.id] || [];

              if (filteredBySearch.length !== currentStudents.length && turnoStudents.length === 0) return null;

              return (
                <div key={turno.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <TurnoBlock
                    turno={turno}
                    isActive={isActive}
                    activeDay={activeDay}
                    realTodayName={realTodayName}
                    turnoStudents={turnoStudents}
                    sessions={sessions}
                    onViewRoutine={(id) => window.location.assign(`/profesor/alumnos/${id}`)}
                    onChangeTurno={(id, nombre, currentTurnoId, dias_asistencia) => {
                      setSelectedStudent({ id, nombre, currentTurnoId, dias_asistencia });
                      setIsSelectorOpen(true);
                    }}
                    innerRef={isActive ? activeBlockRef : null}
                  />
                </div>
              )
            })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="p-8 rounded-[3rem] bg-zinc-50 border border-zinc-100">
              <Clock className="w-12 h-12 text-zinc-200" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tighter">Agenda cerrada para el {activeDay}</h3>
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
        <div className="bg-white border border-zinc-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl shadow-zinc-950/5">
          <div className="overflow-x-auto sm:overflow-visible custom-scrollbar">
            <table className="w-full text-nowrap">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="px-5 md:px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400">{agendaCopy.list.columns.student}</th>
                  <th className="px-5 md:px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400">{agendaCopy.list.columns.days}</th>
                  <th className="px-5 md:px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400">{agendaCopy.list.columns.schedule}</th>
                  <th className="px-5 md:px-6 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400">{agendaCopy.list.columns.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                {filteredBySearch.map(student => {
                  const turno = currentTurnos.find(t => t.id === student.turno_id);
                  return (
                    <tr key={student.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <td className="px-5 md:px-8 py-4">
                        <span className="font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-lime-600 transition-colors">{student.nombre}</span>
                      </td>
                      <td className="px-5 md:px-6 py-4">
                        <div className="w-44">
                          <AttendanceDays 
                            selectedDays={student.dias_asistencia} 
                            readonly 
                            compact 
                            className="gap-1"
                          />
                        </div>
                      </td>
                      <td className="px-5 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                             {turno ? `${turno.hora_inicio.slice(0, 5)} - ${turno.hora_fin.slice(0, 5)}` : "Sin turno"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 md:px-6 py-4 text-right">
                        <ResourceActionMenu
                          type="alumno"
                          id={student.id}
                          name={student.nombre}
                          actions={[
                            {
                              label: agendaCopy.studentCard.actions.changeTurno,
                              icon: <Clock className="w-4 h-4 text-lime-500" />,
                              onClick: () => {
                                setSelectedStudent({ 
                                  id: student.id, 
                                  nombre: student.nombre, 
                                  currentTurnoId: student.turno_id,
                                  dias_asistencia: student.dias_asistencia
                                });
                                setIsSelectorOpen(true);
                              }
                            }
                          ]}
                        />
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
              <span className="text-[9px] font-bold uppercase tracking-widest text-lime-600 leading-none">
                Alumnos
              </span>
              <span className="text-sm font-bold text-zinc-900 leading-none mt-1">
                {currentStudents.length}
              </span>
            </div>
          </div>
        }
        renderCreateAction={() => (
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLogisticsOpen(true)}
              className="h-12 md:h-14 px-5 rounded-2xl border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 transition-all active:scale-95 group"
              title="Logística masiva"
            >
              <ListChecks className="w-5 h-5 text-zinc-400 group-hover:text-lime-600 transition-colors" />
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-900 hidden sm:inline">{logCopy.trigger}</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsImportOpen(true)}
              className="h-12 md:h-14 px-5 rounded-2xl border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 transition-all active:scale-95 group"
            >
              <FileSpreadsheet className="w-5 h-5 text-zinc-400 group-hover:text-lime-600 transition-colors" />
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-900 hidden sm:inline">Importar</span>
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

      {/* FAB (Floating Action Button) for Mobile PWA */}
      <div className="fixed bottom-8 right-6 flex flex-col items-end gap-3 z-50 md:hidden">
        {isFabOpen && (
          <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button
              onClick={() => { setIsLogisticsOpen(true); setIsFabOpen(false); }}
              className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl px-4 flex items-center gap-3"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{logCopy.trigger}</span>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <ListChecks className="w-4 h-4 text-lime-500" />
              </div>
            </Button>
            <Button
              onClick={() => { setIsImportOpen(true); setIsFabOpen(false); }}
              className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl px-4 flex items-center gap-3"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Importar</span>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              </div>
            </Button>
            <Button
              onClick={() => { setIsManagementOpen(true); setIsFabOpen(false); }}
              className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl px-4 flex items-center gap-3"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Configurar</span>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <Settings className="w-4 h-4 text-zinc-400" />
              </div>
            </Button>
          </div>
        )}
        <Button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={cn(
            "h-16 w-16 rounded-[2rem] shadow-2xl transition-all duration-300 active:scale-95",
            isFabOpen ? "bg-zinc-900 text-white rotate-45" : "bg-zinc-950 text-white"
          )}
        >
          <Plus className={cn("w-6 h-6 transition-colors", isFabOpen ? "text-lime-400" : "text-lime-400")} />
        </Button>
      </div>

      <TurnoSelectorDialog
        isOpen={isSelectorOpen}
        onOpenChange={setIsSelectorOpen}
        student={selectedStudent}
        turnos={currentTurnos}
        onSuccess={(updatedStudent) => {
          setCurrentStudents(prev => 
            prev.map(s => s.id === updatedStudent.id ? updatedStudent : s)
          );
        }}
      />

      <TurnoManagementSheet
        isOpen={isManagementOpen}
        onOpenChange={setIsManagementOpen}
        turnos={currentTurnos}
        onTurnosChange={(event) => {
          if (event.type === 'delete') {
            setCurrentTurnos(prev => prev.filter(t => t.id !== event.id));
          } else if (event.type === 'upsert' && event.turno) {
            setCurrentTurnos(prev => {
              const exists = prev.find(t => t.id === event.turno?.id);
              if (exists) {
                return prev.map(t => t.id === event.turno?.id ? event.turno! : t);
              }
              return [...prev, event.turno!].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
            });
          }
        }}
      />

      <LogisticsPanel
        isOpen={isLogisticsOpen}
        onOpenChange={setIsLogisticsOpen}
        students={currentStudents}
        turnos={currentTurnos}
        onEditStudent={(student) => {
          setSelectedStudent({ 
            id: student.id, 
            nombre: student.nombre, 
            currentTurnoId: student.turno_id,
            dias_asistencia: student.dias_asistencia
          });
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
