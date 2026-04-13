import React from 'react';
import { Play, Info, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { ExerciseInfoModal } from './ExerciseInfoModal';

interface BlueprintExerciseCardProps {
  ej: any;
  index: number;
}

export function BlueprintExerciseCard({ ej, index }: BlueprintExerciseCardProps) {
  return (
    <div className="group relative bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 hover:bg-zinc-900/60 transition-all hover:border-lime-500/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center text-zinc-600 font-bold text-[10px] shrink-0 mt-1">
            {String(index + 1).padStart(2, '0')}
          </div>
          
          <div className="min-w-0 space-y-3">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight truncate">
              {ej.biblioteca_ejercicios?.nombre}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20">
                <span className="text-[9px] font-black text-lime-400 uppercase tracking-widest">
                  {ej.series}×{ej.reps_target}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/50 border border-white/5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  {ej.peso_target ? `${ej.peso_target}kg` : '--'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/50 border border-white/5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  {ej.descanso_seg}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS & MODAL */}
        <div className="flex items-center gap-2">
            <ExerciseInfoModal 
                ej={ej}
                trigger={
                    <button className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all active:scale-95 shadow-lg">
                        <Info className="w-4 h-4" />
                    </button>
                }
            />
            {ej.biblioteca_ejercicios?.media_url && (
                <button className="w-10 h-10 rounded-full bg-lime-400 text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg shadow-lime-500/10">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
