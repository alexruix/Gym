import { Dumbbell, PlaySquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagBadge } from "@/components/atoms/TagBadge";
import { useState } from "react";

interface Exercise {
  id: string;
  nombre: string;
  descripcion: string | null;
  media_url: string | null;
  tags?: string[];
  parent_id?: string | null;
  is_template_base?: boolean;
  profesor_id?: string | null;
  variantCount?: number;
  created_at: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onTagClick?: (tag: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onTagClick, onEdit, onDelete }: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const isVideo = exercise.media_url?.match(/\.(mp4|webm|ogg|mov)$/i);
  const showImage = exercise.media_url && !isVideo && !imageError;

  return (
    <Card className="group relative bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-3xl hover:shadow-2xl hover:shadow-lime-500/5 transition-all duration-300 flex flex-col">
      {/* Media Preview / Icon */}
      <div className="aspect-video w-full bg-ui-soft dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden shrink-0">
        {showImage ? (
          <img 
            src={exercise.media_url!} 
            alt={exercise.nombre}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : isVideo ? (
          <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
             <PlaySquare className="w-12 h-12 text-lime-400 opacity-80" />
          </div>
        ) : (
          <Dumbbell className="w-12 h-12 text-ui-muted dark:text-zinc-800 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        )}

        {/* Contrast Overlay (Industrial Gradient) */}
        {(showImage || isVideo) && (
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10" />
        )}
        
        {/* Extra Hover Layer */}
        {exercise.media_url && (
          <div className="absolute inset-0 bg-zinc-950/20 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
            <PlaySquare className="w-10 h-10 text-white drop-shadow-2xl" />
          </div>
        )}
        
        {exercise.variantCount && exercise.variantCount > 0 && (
          <div className="absolute bottom-3 left-3 z-30">
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
                <span className={cn(
                  "shrink-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-tighter shadow-sm",
                  exercise.profesor_id === null 
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" // Public System
                    : "bg-lime-400 text-zinc-950" // Private Base (forked or custom)
                )}>
                  {exercise.profesor_id === null ? "MiGym" : "Base"}
                </span>
              )}
            </h3>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0">
                  <MoreHorizontal className="h-4 w-4 text-ui-muted" />
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
                {exercise.profesor_id !== null && (
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(exercise)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-bold">Eliminar</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {exercise.descripcion && (
            <p className="text-sm text-ui-muted dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
              {exercise.descripcion}
            </p>
          )}
        </div>

        {/* Tags Display */}
        {exercise.tags && exercise.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {exercise.tags.map(tag => (
              <TagBadge 
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
              >
                {tag}
              </TagBadge>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Gestalt: Continuity */}
      <div className="h-1.5 w-full bg-zinc-50 dark:bg-zinc-900 group-hover:bg-lime-500/20 transition-colors shrink-0" />
    </Card>
  );
}
