import {
  Dumbbell,
  PlaySquare,
  Star,
  Flame,
  Copy,
  Trash2,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Maximize2, Info } from "lucide-react";
import { cn, getYouTubeEmbedUrl } from "@/lib/utils";
import { ExerciseActions } from "./ExerciseActions";

import type { Exercise } from "@/hooks/profesor/exercises/useLibraryState";

interface ExerciseCardProps {
  exercise: Exercise;
  onTagClick?: (tag: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (exercise: Exercise) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onDuplicate?: (id: string) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function ExerciseCard({
  exercise,
  onTagClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  onDuplicate,
  expanded,
  onToggleExpand
}: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef<number | null>(null);
  const isSwiping = useRef(false);

  // Video Detection: Priority to video_url field, then extension in media_url
  const isVideo = !!exercise.video_url || !!exercise.media_url?.match(/\.(mp4|webm|ogg|mov)$/i);
  const showImage = exercise.media_url && !exercise.media_url.match(/\.(mp4|webm|ogg|mov)$/i) && !imageError;

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

    if (Math.abs(diff) < 120) {
      setSwipeX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (swipeX > 80) {
      onDuplicate?.(exercise.id);
    } else if (swipeX < -80) {
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
          "relative bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-3xl transition-all duration-300 flex flex-row md:flex-col group/card shadow-sm hover:shadow-md haptic-click",
          (showInfo || expanded) ? "h-auto" : "h-28 md:h-auto",
          "z-10 touch-pan-y",
          (swipeX !== 0) && "duration-0 transition-none",
          expanded && "ring-2 ring-lime-500 dark:ring-lime-400 border-transparent shadow-xl"
        )}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Media Preview */}
        <div className="w-28 h-full md:aspect-video md:w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden shrink-0">
          {/* Media Preview Triggering Lightbox */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                className="absolute inset-0 w-full h-full cursor-zoom-in group/media outline-none focus:ring-2 focus:ring-lime-500 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {showImage ? (
                  <img
                    src={exercise.media_url!}
                    alt={exercise.nombre}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110"
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
                    <Dumbbell className="w-10 h-10 text-zinc-200 dark:text-zinc-800 rotate-12" />
                  </div>
                )}

                {/* Overlay on Hover */}
                {(showImage || isVideo) && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                      {isVideo ? <PlaySquare className="w-6 h-6 text-white" /> : <Maximize2 className="w-6 h-6 text-white" />}
                    </div>
                  </div>
                )}
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden z-[101] shadow-2xl animate-in zoom-in-95 fade-in duration-300 border border-white/10">
                <div className="absolute top-4 right-4 z-50">
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/10">
                      <X className="w-6 h-6" />
                    </Button>
                  </Dialog.Close>
                </div>

                <div className="w-full h-full flex items-center justify-center">
                  {isVideo ? (
                    (() => {
                      const embedUrl = getYouTubeEmbedUrl(exercise.video_url || exercise.media_url);
                      if (embedUrl) {
                        return <iframe src={embedUrl} className="w-full h-full" allow="autoplay; fullscreen" />;
                      }
                      return (
                        <video
                          src={exercise.video_url || exercise.media_url || ""}
                          controls
                          autoPlay
                          className="max-h-full max-w-full"
                        />
                      );
                    })()
                  ) : (
                    <img src={exercise.media_url!} className="max-h-full max-w-full object-contain" alt={exercise.nombre} />
                  )}
                </div>

                {/* <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h2 className="text-white font-bold text-xl">{exercise.nombre}</h2>
                  {exercise.descripcion && <p className="text-white/70 text-sm mt-1">{exercise.descripcion}</p>}
                </div> */}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Badges Layout */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-30 pointer-events-none">
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
            <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white drop-shadow-md bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <span className="text-lime-400 text-xs">+</span>{exercise.variantCount} VAR
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20",
                  expanded
                    ? "bg-lime-500 text-zinc-900 border-lime-500 scale-110 shadow-lg"
                    : "bg-black/40 text-white hover:bg-black/60"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.();
                }}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
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

              {/* Media Indicators */}
              <div className="flex items-center gap-2 mt-1 mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                {exercise.media_url || exercise.video_url ? (
                  isVideo ? (
                    <span className="flex items-center gap-1 text-lime-600 dark:text-lime-500"><Video className="w-3 h-3" /> Video técnica</span>
                  ) : (
                    <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-500"><ImageIcon className="w-3 h-3" /> Con foto</span>
                  )
                ) : (
                  <span className="flex items-center gap-1 opacity-50"><ImageIcon className="w-3 h-3" /> Sin Media</span>
                )}
                {exercise.descripcion && (
                  <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 border-l border-zinc-200 dark:border-zinc-800 pl-2"><FileText className="w-3 h-3" /> Notas</span>
                )}
              </div>

              {exercise.tags && exercise.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {exercise.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-md text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                      {tag}
                    </span>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInfo(!showInfo);
                    }}
                    className={cn(
                      "h-5 px-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                      showInfo ? "bg-lime-500 text-zinc-950" : "text-zinc-400 hover:text-lime-500"
                    )}
                  >
                    {showInfo ? "Ocultar Info" : "Ver Info"}
                  </Button>
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

              <ExerciseActions
                exercise={exercise}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            </div>
          </div>
        </div>

        {/* Info & Description Expansion - CSS Grid Based */}
        <div className={cn(
          "grid-accordion",
          showInfo && "grid-accordion-open"
        )}>
          <div className="grid-accordion-content">
            {exercise.descripcion && (
              <div className="px-6 pb-6 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-2 text-zinc-900 dark:text-zinc-100">
                    <Info className="w-4 h-4 text-lime-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Técnica y notas</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium whitespace-pre-wrap">
                    {exercise.descripcion}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
