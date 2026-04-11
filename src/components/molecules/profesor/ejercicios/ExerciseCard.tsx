import { Dumbbell, PlaySquare, MoreHorizontal, Pencil, Trash2, Star, Flame, Copy } from "lucide-react";
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
import { useState, useRef, useEffect } from "react";

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
  is_favorite?: boolean;
  usage_count?: number;
  created_at: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onTagClick?: (tag: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (exercise: Exercise) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onDuplicate?: (id: string) => void;
}

export function ExerciseCard({ 
  exercise, 
  onTagClick, 
  onEdit, 
  onDelete,
  onToggleFavorite,
  onDuplicate 
}: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const isVideo = exercise.media_url?.match(/\.(mp4|webm|ogg|mov)$/i);
  const showImage = exercise.media_url && !isVideo && !imageError;
  
  // Logic for "Frecuente" badge (Top usage)
  const isFrequent = (exercise.usage_count || 0) > 20;

  // Swipe logic for PWA feel
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Limit swipe to 100px either side
    if (Math.abs(diff) < 120) {
      setSwipeX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (swipeX > 80) {
      // Swipe Right -> Duplicate
      onDuplicate?.(exercise.id);
    } else if (swipeX < -80) {
      // Swipe Left -> Delete
      onDelete?.(exercise);
    }
    setSwipeX(0);
    startX.current = null;
    isSwiping.current = false;
  };

  return (
    <div className="relative group overflow-visible">
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-3xl z-0 overflow-hidden">
        <div className="bg-lime-500 h-full w-full absolute inset-y-0 left-0 flex items-center pl-6 text-zinc-950 transition-opacity duration-200" style={{ opacity: swipeX > 20 ? 1 : 0 }}>
          <Copy className="w-6 h-6" />
        </div>
        <div className="bg-red-500 h-full w-full absolute inset-y-0 right-0 flex items-center justify-end pr-6 text-white transition-opacity duration-200" style={{ opacity: swipeX < -20 ? 1 : 0 }}>
          <Trash2 className="w-6 h-6" />
        </div>
      </div>

      <Card 
        className={cn(
          "relative bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-3xl transition-all duration-300 flex flex-row h-28 md:h-auto md:flex-col group/card shadow-sm hover:shadow-md",
          "z-10 touch-pan-y active:scale-[0.98]",
          (swipeX !== 0) && "duration-0 transition-none"
        )}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Media Preview / Icon */}
        <div className="w-28 h-full md:aspect-video md:w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden shrink-0">
          {showImage ? (
            <img
              src={exercise.media_url!}
              alt={exercise.nombre}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : isVideo ? (
            <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
              <PlaySquare className="w-10 h-10 text-lime-400 opacity-80" />
              <div className="absolute inset-0 bg-lime-500/10 animate-pulse" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
              <Dumbbell className="w-10 h-10 text-zinc-200 dark:text-zinc-800 rotate-12 transition-transform duration-500 group-hover/card:rotate-0" />
            </div>
          )}

          {/* Badges Layout (Pills overlay) */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-30">
            {isFrequent && (
              <div className="bg-zinc-950 text-lime-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-2xl border border-lime-400/20 backdrop-blur-md">
                <Flame className="w-2.5 h-2.5 fill-current" />
                TOP
              </div>
            )}
            {exercise.is_favorite && (
              <div className="bg-lime-500 text-zinc-950 p-1.5 rounded-lg shadow-xl ring-2 ring-white dark:ring-zinc-950">
                <Star className="w-3 h-3 fill-current" />
              </div>
            )}
          </div>

          {/* Contrast Overlay */}
          {(showImage || isVideo) && (
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          )}

          {exercise.variantCount && exercise.variantCount > 0 && (
            <div className="absolute bottom-3 left-3 z-30 text-[9px] font-black uppercase tracking-[0.2em] text-white drop-shadow-md">
              <span className="text-lime-400">+</span>{exercise.variantCount} VAR
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex-1 flex flex-col justify-center gap-1.5 overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight transition-colors line-clamp-1 text-sm md:text-lg tracking-tight">
                  {exercise.nombre}
                </h3>
                {exercise.is_template_base && (
                  <span className={cn(
                    "shrink-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest shadow-sm border",
                    exercise.profesor_id === null
                      ? "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800" 
                      : "bg-lime-500 text-zinc-950 border-lime-400"
                  )}>
                    {exercise.profesor_id === null ? "Gym" : "Base"}
                  </span>
                )}
              </div>
              {exercise.tags && exercise.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {exercise.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-md text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 self-center md:self-start shrink-0">
               <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-10 w-10 rounded-2xl shrink-0 transition-all",
                  exercise.is_favorite 
                    ? "text-lime-500 bg-lime-500/5 hover:bg-lime-500/10" 
                    : "text-zinc-300 hover:text-zinc-500 dark:text-zinc-700"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(exercise.id, !exercise.is_favorite);
                }}
              >
                <Star className={cn("h-5 w-5", exercise.is_favorite && "fill-current")} />
              </Button>

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
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
