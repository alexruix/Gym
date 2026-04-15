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
          "relative bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-[2.5rem] transition-all duration-500 flex flex-col group/card shadow-sm hover:shadow-xl haptic-click",
          "h-auto",
          "z-10 touch-pan-y",
          (swipeX !== 0) && "duration-0 transition-none",
          expanded && "ring-4 ring-lime-500/20 dark:ring-lime-400/10 border-lime-500/50 dark:border-lime-400/40 shadow-2xl"
        )}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Media Preview Area */}
        <div className="w-full aspect-video md:aspect-[16/10] bg-zinc-900 flex items-center justify-center relative overflow-hidden shrink-0 border-b border-zinc-100 dark:border-zinc-800">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                className="absolute inset-0 w-full h-full cursor-zoom-in group/media outline-none z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {showImage ? (
                  <img
                    src={exercise.media_url!}
                    alt={exercise.nombre}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/media:scale-110"
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                ) : isVideo ? (
                  <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
                    <PlaySquare className="w-12 h-12 text-lime-400 opacity-80" />
                    <div className="absolute inset-0 bg-lime-500/10 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                    <Dumbbell className="w-12 h-12 text-zinc-800 rotate-12" />
                  </div>
                )}

                {(showImage || isVideo) && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center z-30">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 scale-75 group-hover/media:scale-100 transition-transform">
                      {isVideo ? <PlaySquare className="w-8 h-8 text-white" /> : <Maximize2 className="w-8 h-8 text-white" />}
                    </div>
                  </div>
                )}
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl aspect-video bg-black rounded-[3rem] overflow-hidden z-[101] shadow-2xl animate-in zoom-in-95 fade-in duration-500 border border-white/10">
                <div className="absolute top-6 right-6 z-50">
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all">
                      <X className="w-6 h-6" />
                    </Button>
                  </Dialog.Close>
                </div>
                <div className="w-full h-full flex items-center justify-center">
                  {isVideo ? (
                    (() => {
                      const embedUrl = getYouTubeEmbedUrl(exercise.video_url || exercise.media_url);
                      return embedUrl 
                        ? <iframe src={embedUrl} className="w-full h-full" allow="autoplay; fullscreen" />
                        : <video src={exercise.video_url || exercise.media_url || ""} controls autoPlay className="max-h-full max-w-full" />;
                    })()
                  ) : <img src={exercise.media_url!} className="max-h-full max-w-full object-contain" alt={exercise.nombre} />}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Industrial Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-30 pointer-events-none">
            {isFrequent && (
              <div className="bg-lime-500 text-zinc-950 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl border border-lime-400">
                <Flame className="w-3.5 h-3.5 fill-current" />
                TOP
              </div>
            )}
            {exercise.is_favorite && (
              <div className="bg-white dark:bg-zinc-950 text-lime-500 p-2.5 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800">
                <Star className="w-4 h-4 fill-current" />
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none" />

          {exercise.variantCount && exercise.variantCount > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between">
              <div className="bg-zinc-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                <span className="text-lime-400 text-sm font-black tracking-tighter">+{exercise.variantCount}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Variantes</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-2xl transition-all duration-500 backdrop-blur-xl border-white/20",
                  expanded
                    ? "bg-lime-500 text-zinc-950 border-lime-500 scale-110 shadow-[0_0_20px_rgba(132,204,22,0.3)]"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.();
                }}
              >
                {expanded ? <ChevronUp className="w-6 h-6" strokeWidth={3} /> : <ChevronDown className="w-6 h-6" strokeWidth={3} />}
              </Button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between gap-6 overflow-hidden bg-white dark:bg-zinc-950">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="font-black text-zinc-950 dark:text-white leading-[1] text-xl md:text-xl tracking-tighter line-clamp-2">
                    {exercise.nombre}
                  </h3>
                  {exercise.is_template_base && (
                    <div className={cn(
                      "shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl tracking-[0.1em] border-2",
                      exercise.profesor_id === null
                        ? "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800"
                        : "bg-lime-500/10 text-lime-600 border-lime-500/20 dark:text-lime-400"
                    )}>
                      {exercise.profesor_id === null ? "MASTER" : "BASE"}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  {exercise.media_url || exercise.video_url ? (
                    isVideo ? <span className="flex items-center gap-2 text-lime-600 dark:text-lime-500 font-extrabold"><Video className="w-4 h-4" /> Técnica</span>
                           : <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Foto</span>
                  ) : <span className="opacity-40">Sin Media</span>}
                  
                  {exercise.descripcion && (
                    <span className="flex items-center gap-2 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4 text-zinc-500">
                      <FileText className="w-4 h-4" /> Notas
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-2xl transition-all duration-300",
                    exercise.is_favorite
                      ? "text-lime-500 bg-lime-500/5 shadow-inner"
                      : "text-zinc-300 hover:text-zinc-500 dark:text-zinc-800"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(exercise.id, !exercise.is_favorite);
                  }}
                >
                  <Star className={cn("h-7 w-7", exercise.is_favorite && "fill-current")} strokeWidth={2.5} />
                </Button>
                <ExerciseActions exercise={exercise} onDelete={onDelete} onDuplicate={onDuplicate} />
              </div>
            </div>

            {exercise.tags && exercise.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {exercise.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    {tag}
                  </span>
                ))}
                {exercise.descripcion && (
                  <Button
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
                    className={cn(
                      "h-9 px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all",
                      showInfo ? "bg-zinc-950 text-white dark:bg-lime-500 dark:text-zinc-950" : "text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100"
                    )}
                  >
                    {showInfo ? "Ocultar Técnica" : "Revisar Técnica"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Technical Sheet Accordion */}
        <div className={cn("grid-accordion", showInfo && "grid-accordion-open")}>
          <div className="grid-accordion-content overflow-hidden">
            <div className="px-6 pb-8 pt-2">
              <div className="bg-zinc-50 dark:bg-zinc-900/80 p-8 rounded-[3rem] border-2 border-zinc-100 dark:border-zinc-800 relative group/info overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                   <FileText className="w-32 h-32 rotate-12" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-lime-500 rounded-2xl shadow-xl shadow-lime-500/20">
                    <Info className="w-5 h-5 text-zinc-950" strokeWidth={3} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-950 dark:text-white">Ficha Técnica</span>
                </div>
                <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-[1.8] font-medium whitespace-pre-wrap relative z-10">
                  {exercise.descripcion}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
