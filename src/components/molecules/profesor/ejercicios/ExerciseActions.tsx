import { MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExerciseActionsProps {
  exercise: {
    id: string;
    nombre: string;
    profesor_id?: string | null;
  };
  onEdit?: (id: string) => void;
  onDelete?: (exercise: any) => void;
  onDuplicate?: (id: string) => void;
}

export function ExerciseActions({ 
  exercise, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: ExerciseActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0">
          <MoreHorizontal className="h-5 w-5 text-zinc-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-[2rem] border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-zinc-950/95">
        <DropdownMenuItem
          asChild
          className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <a href={`/profesor/ejercicios/${exercise.id}/edit`} className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <Pencil className="h-4 w-4 text-zinc-500" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Editar</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDuplicate?.(exercise.id)}
          className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <Copy className="h-4 w-4 text-zinc-500" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Duplicar</span>
        </DropdownMenuItem>
        {exercise.profesor_id !== null && (
          <DropdownMenuItem
            onClick={() => onDelete?.(exercise)}
            className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Eliminar</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
