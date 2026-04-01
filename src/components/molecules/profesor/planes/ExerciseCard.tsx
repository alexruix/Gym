import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  routineIdx: number;
  exerciseIdx: number;
  exercise: any;
  getExerciseName: (id: string) => string;
  removeExercise: (routineIdx: number, exerciseIdx: number) => void;
}

export function ExerciseCard({
  routineIdx,
  exerciseIdx,
  exercise: ex,
  getExerciseName,
  removeExercise,
}: ExerciseCardProps) {
  return (
    <Card 
      className={cn(
          "p-5 rounded-2xl border-zinc-100 shadow-sm relative group bg-white dark:bg-zinc-900/50 dark:border-zinc-800 transition-all duration-500",
          "hover:border-zinc-950 dark:hover:border-lime-400"
      )}
    >
      <button 
          type="button"
          onClick={() => removeExercise(routineIdx, exerciseIdx)} 
          className="absolute -top-3 -right-3 p-2.5 bg-white dark:bg-zinc-950 text-red-500 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
      >
          <Trash2 className="w-4 h-4" />
      </button>
      
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white dark:bg-lime-400 dark:text-zinc-950 flex items-center justify-center shrink-0 font-black shadow-lg shadow-zinc-950/10 dark:shadow-lime-400/10">
            {exerciseIdx + 1}
        </div>
        
        <div className="flex-1 min-w-0">
            <p className="font-black text-lg text-zinc-950 dark:text-zinc-50 leading-tight truncate">
              {getExerciseName(ex.ejercicio_id)}
            </p>
        </div>
      </div>
    </Card>
  );
}
