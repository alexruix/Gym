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
  onChangeTurno: (id: string, nombre: string, currentTurnoId: string | null) => void;
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
        "relative pl-4 md:pl-6 transition-all duration-500",
        isActive ? "opacity-100" : (activeDay !== realTodayName ? "opacity-100" : "opacity-60 grayscale-[0.5]")
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-full",
        isActive ? "bg-lime-500" : "bg-zinc-100 dark:bg-zinc-800"
      )} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">
            {turno.hora_inicio.substring(0, 5)}
          </span>
          <div className="flex flex-col">
            <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest leading-none">
              {turno.nombre}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
            isFull
              ? "bg-white dark:bg-zinc-950 border-red-200 dark:border-red-900/50 text-red-500"
              : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-400"
          )}>
            <Users className="w-3 h-3" />
            <span>{turnoStudents.length} / {turno.capacidad_max}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {turnoStudents.length > 0 ? (
          turnoStudents.map(student => (
            <AgendaStudentCard
              key={student.id}
              student={student}
              session={sessions.find(s => s.alumno_id === student.id)}
              onViewRoutine={() => onViewRoutine(student.id)}
              onChangeTurno={() => onChangeTurno(student.id, student.nombre, student.turno_id)}
              active={isActive}
            />
          ))
        ) : (
          <p className="text-xs font-medium text-zinc-600 italic py-4">{t.empty}</p>
        )}
      </div>
    </div>
  );
}
