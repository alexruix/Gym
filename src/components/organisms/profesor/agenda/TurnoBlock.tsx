import React from "react";
import { Users } from "lucide-react";
import { AgendaStudentCard } from "./AgendaStudentCard";
import { cn } from "@/lib/utils";
import { agendaCopy } from "@/data/es/profesor/agenda";

interface Turno {
  id: string;
  nombre: string;
  hora_inicio: string;
  capacidad_max: number;
}

interface Student {
  id: string;
  nombre: string;
  turno_id: string | null;
  email?: string;
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

interface TurnoBlockProps {
  turno: Turno;
  isActive: boolean;
  activeDay: string;
  realTodayName: string;
  turnoStudents: Student[];
  sessions: Session[];
  onViewRoutine: (id: string) => void;
  onChangeTurno: (id: string, nombre: string, currentTurnoId: string | null, dias_asistencia: string[]) => void;
  innerRef?: React.Ref<HTMLDivElement>;
}

export function TurnoBlock({
  turno,
  isActive,
  activeDay,
  realTodayName,
  turnoStudents,
  sessions,
  onViewRoutine,
  onChangeTurno,
  innerRef
}: TurnoBlockProps) {
  const isFull = turnoStudents.length >= turno.capacidad_max;
  const t = agendaCopy.blocks;
  const isEmpty = turnoStudents.length === 0;

  return (
    <div
      ref={innerRef}
      className={cn(
        "relative transition-all duration-500",
        isActive ? "opacity-100" : (activeDay !== realTodayName ? "opacity-100" : "opacity-80")
      )}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between mb-4 group/header">
        <div className="flex items-center gap-3">
            <div className={cn(
                "w-1.5 h-6 rounded-full transition-all duration-500", 
                isActive ? "bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.4)]" : "bg-zinc-200 dark:bg-zinc-800"
            )} />
            <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 leading-tight">
                    {turno.nombre}
                </span>
                <span className="text-xl font-black text-zinc-950 dark:text-zinc-50 leading-tight tracking-tighter">
                    {turno.hora_inicio.slice(0, 5)}
                </span>
            </div>
        </div>
        
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all",
            isFull 
                ? "bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-red-500/20" 
                : "bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-900/50 dark:border-zinc-800"
        )}>
            <Users className="w-3.5 h-3.5 opacity-50" />
            <span className="text-xs font-black tracking-tighter">
                {turnoStudents.length} / {turno.capacidad_max}
            </span>
        </div>
      </div>

      {/* Block Content */}
      <div className="flex flex-col gap-2">
        {turnoStudents.length > 0 ? (
          turnoStudents.map(student => (
            <AgendaStudentCard
              key={student.id}
              student={student}
              session={sessions.find(s => s.alumno_id === student.id)}
              onViewRoutine={() => onViewRoutine(student.id)}
              onChangeTurno={() => onChangeTurno(student.id, student.nombre, student.turno_id, student.dias_asistencia)}
              active={isActive}
            />
          ))
        ) : (
          <div className="py-6 px-8 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 text-center">
                {t.empty}
            </p>
          </div>
        )}
      </div>
      
      {/* Visual Separator if not the last block */}
      <div className="h-10 w-px bg-gradient-to-b from-zinc-100 to-transparent ml-3 dark:from-zinc-900 mb-2 opacity-50" />
    </div>
  );
}
