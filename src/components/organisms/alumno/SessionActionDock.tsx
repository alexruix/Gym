import React from 'react';
import { ChevronLeft, Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sesionStrings } from '@/data/es/alumno/sesion';

interface SessionActionDockProps {
  onAbandon: () => void;
  onFinish: () => void;
  isFinishing: boolean;
  totalExercises: number;
  completedCount: number;
  isComplete: boolean;
  onToggleSummary: () => void;
  showSummary: boolean;
  globalNota: string;
  onNotaChange: (val: string) => void;
}

/**
 * SessionActionDock: Barra de acciones inferior estilo PWA.
 * Ergonomía móvil, feedback visual de progreso y finalización.
 */
export function SessionActionDock({ 
  onAbandon, 
  onFinish, 
  isFinishing, 
  totalExercises, 
  completedCount, 
  isComplete,
  onToggleSummary,
  showSummary,
  globalNota,
  onNotaChange
}: SessionActionDockProps) {
  const progressPercent = (completedCount / totalExercises) * 100;

  return (
    <div className="fixed bottom-28 left-4 right-4 z-[70] p-4 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] animate-in slide-in-from-bottom-full duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-lime-400/20">
      
      {/* Panel de Resumen (Desplegable) */}
      {showSummary && (
        <div className="mb-6 animate-in slide-in-from-bottom-8 duration-300">
           <div className="flex items-center gap-2 mb-3">
             <MessageSquare className="w-4 h-4 text-lime-400" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Nota de la sesión</span>
           </div>
           <textarea 
            className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl p-4 text-white text-xs font-medium focus:border-lime-400/50 outline-none resize-none placeholder:text-zinc-700 transition-all"
            rows={2}
            placeholder={sesionStrings.completion.summaryPlaceholder}
            value={globalNota}
            onChange={e => onNotaChange(e.target.value)}
          />
        </div>
      )}

      <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
        
        {/* Abandonar / Volver */}
        <button 
          onClick={onAbandon}
          className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90 shadow-xl group"
          title={sesionStrings.header.abandon}
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Status / Toggle Note */}
        <div className="flex-1 flex flex-col items-center">
           <button 
            onClick={onToggleSummary}
            className={cn(
              "flex items-center gap-2 mb-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95",
              showSummary ? "bg-lime-400 text-black" : "bg-zinc-900 border border-white/5 text-zinc-400"
            )}
           >
              <MessageSquare className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase italic tracking-widest">
                {completedCount} / {totalExercises}
              </span>
           </button>
           
           {/* Progress Line HUD */}
           <div className="w-28 h-1 bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
             <div 
               className="h-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)] transition-all duration-700 ease-out" 
               style={{ width: `${progressPercent}%` }}
             />
           </div>
        </div>

        {/* Finalizar */}
        <button
          onClick={onFinish}
          disabled={isFinishing || !isComplete}
          className={cn(
            "h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] italic flex items-center gap-3 transition-all active:scale-95 shadow-xl",
            isComplete 
              ? "bg-lime-400 text-black shadow-lime-500/20 hover:scale-105" 
              : "bg-zinc-900 text-zinc-700 border border-white/5 opacity-40 cursor-not-allowed"
          )}
        >
          {isFinishing ? (
            <div className="w-4 h-4 border-3 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isComplete ? (sesionStrings.activeSession.finishButton || "Finalizar") : "En progreso"}
              <Check className={cn("w-4 h-4", isComplete ? "animate-pulse" : "opacity-20")} />
            </>
          )}
        </button>

      </div>
    </div>
  );
}
