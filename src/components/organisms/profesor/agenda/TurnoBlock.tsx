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

  return (
    <div
      ref={innerRef}
      className={cn(
        "relative transition-all duration-500",
        isActive ? "opacity-100" : (activeDay !== realTodayName ? "opacity-100" : "opacity-60")
      )}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
            <div className={cn("w-1 h-4 rounded-full", isActive ? "bg-lime-500" : "bg-zinc-200 dark:bg-zinc-800")} />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {turno.nombre} <span className="ml-1 text-zinc-950 dark:text-zinc-100">{turno.hora_inicio.slice(0, 5)}</span>
            </span>
        </div>
        <div className={cn(
            "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border",
            isFull ? "border-red-200 text-red-600 dark:text-red-400" : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
        )}>
            {turnoStudents.length} / {turno.capacidad_max}
        </div>
      </div>

      <div className="flex flex-col gap-3">
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
          <div className="py-12 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
}
