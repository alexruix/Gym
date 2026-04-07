import React from "react";
import { MoveHorizontal, User, Dumbbell, MoreVertical } from "lucide-react";
import { StatusRing } from "@/components/atoms/profesor/StatusRing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { agendaCopy } from "@/data/es/profesor/agenda";

interface AgendaStudentCardProps {
  student: {
    id: string;
    nombre: string;
    turno_id?: string;
    email?: string;
  };
  session?: {
    progress: number;
    coreExercise?: {
      nombre: string;
      peso_target?: string;
      peso_real?: string;
    };
  };
  onViewRoutine: (id: string) => void;
  onChangeTurno: (id: string) => void;
  active?: boolean;
}

export function AgendaStudentCard({ student, session, onViewRoutine, onChangeTurno, active = false }: AgendaStudentCardProps) {
  const t = agendaCopy.studentCard;

  // Si no hay sesión instanciada todavía, progreso es 0
  const progress = session?.progress ?? 0;
  const isCompleted = progress >= 100;

  return (
    <div
      className={cn(
        "group relative flex flex-col p-4 bg-white border border-zinc-200 rounded-3xl transition-all duration-300 hover:border-lime-500/30 hover:shadow-md",
        active && "ring-1 ring-lime-400 border-lime-400/20 shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
            {isCompleted ? t.completed : t.inProgress}
          </p>
          <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-50 truncate tracking-tighter leading-none">
            {student.nombre}
          </h3>
        </div>

        <StatusRing progress={progress} size="md" />
      </div>

      {session?.coreExercise && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 space-y-2">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
            <Dumbbell className="w-3 h-3" />
            {t.coreLift}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 truncate mr-2">
              {session.coreExercise.nombre}
            </span>
            <span className="text-xl font-bold text-lime-600 dark:text-lime-400 shrink-0">
              {session.coreExercise.peso_real || session.coreExercise.peso_target || "0"}
              <span className="text-[10px] ml-0.5 text-zinc-400">KG</span>
            </span>
          </div>
        </div>
      )}

      {/* Acciones Rápidas (Always visible on mobile to avoid friction) */}
      <div className="mt-6 flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-all sm:translate-y-1 group-hover:translate-y-0 duration-300">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-10 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider hover:bg-lime-500 hover:text-zinc-950 hover:border-lime-400 shadow-sm transition-all"
          onClick={() => onViewRoutine(student.id)}
        >
          {t.actions.viewRoutine}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 transition-all shrink-0"
          onClick={() => onChangeTurno(student.id)}
        >
          <MoveHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
