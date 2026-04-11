import React from 'react';
import { MessageSquare, CheckCircle, History, Zap, Info, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PositionIndicator } from '@/components/atoms/alumno/PositionIndicator';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { WeightControl } from '@/components/molecules/alumno/WeightControl';
import { TimerControl } from '@/components/molecules/alumno/TimerControl';
import { sesionStrings } from '@/data/es/alumno/sesion';
import type { ExerciseBase } from '@/hooks/alumno/useActiveSession';

import { RPESelector } from '@/components/molecules/alumno/RPESelector';

interface ActiveExerciseCardProps {
  ej: ExerciseBase;
  index: number;
  isActive: boolean;
  isDone: boolean;
  currentWeight: string;
  rpe: number | null;
  secondsLeft?: number;
  isTimerActive: boolean;
  comment: string;
  onWeightChange: (val: string) => void;
  onRpeChange: (val: number) => void;
  onCommentChange: (val: string) => void;
  onMarkDone: () => void;
  onStartTimer: () => void;
  onActivate: () => void;
}

export function ActiveExerciseCard({
  ej,
  index,
  isActive,
  isDone,
  currentWeight,
  rpe,
  secondsLeft,
  isTimerActive,
  comment,
  onWeightChange,
  onRpeChange,
  onCommentChange,
  onMarkDone,
  onStartTimer,
  onActivate
}: ActiveExerciseCardProps) {
  return (
    <div
      className={cn(
        "group relative border transition-all duration-500 rounded-3xl overflow-visible",
        isActive 
            ? "bg-white border-lime-400 shadow-[0_20px_50px_rgba(163,230,53,0.15)] ring-2 ring-lime-400" 
            : isDone 
                ? "bg-zinc-900/40 border-zinc-800/50 opacity-40 grayscale" 
                : "industrial-card-glass border-zinc-800 hover:border-zinc-700"
      )}
    >
      <PositionIndicator number={index + 1} isActive={isActive} />

      <div 
        className={cn("p-8", !isActive && "cursor-pointer")}
        onClick={() => !isActive && onActivate()}
      >
        <div className="flex flex-col gap-6">
          {/* NIVEL 1: ANCLA */}
          <div className="space-y-1">
            <div className="flex items-start justify-between">
              <h3 className={cn(
                "text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]",
                isActive ? "text-black" : "text-white"
              )}>
                {ej.biblioteca_ejercicios?.nombre || 'Ejercicio'}
              </h3>
              {isDone && <CheckCircle className="w-6 h-6 text-lime-500 shrink-0 mt-1" />}
            </div>
            
            {/* NIVEL 2: SOPORTE (METRICS) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
              <div className="flex items-center gap-2">
                <TechnicalLabel className={isActive ? "text-zinc-500" : "text-zinc-600"}>
                  {sesionStrings.activeSession.prescription}
                </TechnicalLabel>
                <span className={cn("text-lg font-black", isActive ? "text-lime-600" : "text-lime-400")}>
                  {ej.series}×{ej.reps_target}
                </span>
              </div>

              <div className={cn(
                "flex items-center gap-3 px-4 py-1.5 rounded-full border opacity-60",
                isActive ? "bg-black/5 border-black/10" : "bg-white/5 border-white/10"
              )}>
                <History className="w-3 h-3 text-zinc-500" />
                <span className="industrial-metadata">
                  {sesionStrings.activeSession.forecast}: {ej.peso_plan || "--"}kg
                </span>
              </div>
            </div>
          </div>

          {/* INTERACCIÓN (SÓLO SI ESTÁ ACTIVO) */}
          {isActive && !isDone && (
            <div className="space-y-8 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <WeightControl 
                  weight={currentWeight} 
                  onWeightChange={onWeightChange} 
                />
                <TimerControl 
                  secondsLeft={secondsLeft} 
                  targetSeconds={ej.descanso_seg || 60} 
                  isActive={isTimerActive} 
                  onStart={onStartTimer}
                />
              </div>

              {/* Selector de RPE (Ingeniería de Cargas) */}
              <RPESelector 
                value={rpe} 
                onChange={onRpeChange} 
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150"
              />

              <div className="space-y-4">
                <div className="relative group/input">
                  <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-lime-600 transition-colors" />
                  <input 
                    type="text"
                    placeholder={sesionStrings.activeSession.commentPlaceholder}
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    className="industrial-input w-full pl-14"
                  />
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onMarkDone(); }}
                  className="w-full h-20 bg-lime-400 text-black rounded-3xl flex items-center justify-center gap-4 group/done active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(163,230,53,0.3)]"
                >
                  <span className="text-xl font-black uppercase tracking-widest leading-none">
                    {sesionStrings.activeSession.doneButton}
                  </span>
                  <Zap className="w-6 h-6 fill-black group-hover/done:scale-125 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* FOOTER METADATA (Nivel 3) */}
          {!isActive && !isDone && (
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              <div className="flex items-center gap-2">
                <Info className="w-3 h-3 text-lime-400" />
                {sesionStrings.activeSession.details}
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
