import { Dumbbell, PlaySquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagBadge } from "@/components/atoms/TagBadge";

interface Exercise {
  id: string;
  nombre: string;
  descripcion: string | null;
  media_url: string | null;
  tags?: string[];
  parent_id?: string | null;
  is_template_base?: boolean;
  variantCount?: number;
  created_at: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: (id: string) => void;
  onDelete?: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onEdit, onDelete }: ExerciseCardProps) {
  return (
    <Card className="group relative bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-3xl hover:shadow-2xl hover:shadow-lime-500/5 transition-all duration-300 flex flex-col">
      {/* Media Preview / Icon */}
      <div className="aspect-video w-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden shrink-0">
        {exercise.media_url ? (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <PlaySquare className="w-10 h-10 text-white drop-shadow-lg" />
          </div>
        ) : (
          <Dumbbell className="w-12 h-12 text-zinc-200 dark:text-zinc-800 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        )}
        
        {exercise.variantCount && exercise.variantCount > 0 && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="bg-zinc-950/80 backdrop-blur-md text-white border border-white/10 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              +{exercise.variantCount} variantes
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="space-y-1 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2 flex items-center gap-2">
              {exercise.nombre}
              {exercise.is_template_base && (
                <span className="shrink-0 bg-lime-400 text-zinc-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-tighter shadow-[0_0_10px_rgba(163,230,53,0.3)]">
                  Base
                </span>
              )}
            </h3>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0">
                  <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-950/5">
                <DropdownMenuItem 
                  asChild
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <a href={`/profesor/ejercicios/${exercise.id}/edit`} className="flex items-center gap-3 w-full">
                    <Pencil className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Editar</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(exercise)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-bold">Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {exercise.descripcion && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
              {exercise.descripcion}
            </p>
          )}
        </div>

        {/* Tags Display */}
        {exercise.tags && exercise.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {exercise.tags.map(tag => (
              <TagBadge key={tag}>{tag}</TagBadge>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Gestalt: Continuity */}
      <div className="h-1.5 w-full bg-zinc-50 dark:bg-zinc-900 group-hover:bg-lime-500/20 transition-colors shrink-0" />
    </Card>
  );
}
