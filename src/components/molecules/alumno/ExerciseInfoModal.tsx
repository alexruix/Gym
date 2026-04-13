import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Dumbbell, Clock, Scale, Info, Play, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { planData } from '@/data/es/alumno/plan';

interface ExerciseInfoModalProps {
  ej: {
    biblioteca_ejercicios?: {
      id: string;
      nombre: string;
      descripcion?: string;
      media_url?: string;
    };
    series?: number;
    reps_target?: string | number;
    peso_target?: string | number;
    descanso_seg?: number;
  };
  trigger: React.ReactNode;
}

export function ExerciseInfoModal({ ej, trigger }: ExerciseInfoModalProps) {
  const mediaUrl = ej.biblioteca_ejercicios?.media_url;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] animate-in fade-in duration-300" />
        <Dialog.Content 
          className={cn(
            "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[101]",
            "w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto",
            "bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black",
            "animate-in zoom-in-95 slide-in-from-bottom-10 duration-500",
            "focus:outline-none ring-1 ring-white/5"
          )}
        >
          {/* MEDIA HEADER */}
          <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
            {mediaUrl ? (
                <img 
                    src={mediaUrl} 
                    alt={ej.biblioteca_ejercicios?.nombre} 
                    className="w-full h-full object-cover opacity-60"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-700">
                    <Dumbbell className="w-16 h-16 opacity-10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sin contenido visual</span>
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            
            <Dialog.Close asChild>
              <button 
                className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-md border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-8 space-y-8">
            {/* TITLE & CATEGORY */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-lime-400">
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{planData.modal.title}</span>
                </div>
                <Dialog.Title className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                    {ej.biblioteca_ejercicios?.nombre}
                </Dialog.Title>
            </div>

            {/* TECHNICAL GRID */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <List className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{planData.modal.series}</p>
                        <p className="text-lg font-black text-white">{ej.series} × {ej.reps_target}</p>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Scale className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{planData.modal.weight}</p>
                        <p className="text-lg font-black text-white">{ej.peso_target || '--'}kg</p>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl flex items-center gap-4 col-span-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{planData.modal.rest}</p>
                        <p className="text-lg font-black text-white">{ej.descanso_seg} seg</p>
                    </div>
                </div>
            </div>

            {/* PROFESSOR NOTES */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-500">
                    <Info className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{planData.modal.professorNotes}</span>
                </div>
                <div className="bg-zinc-900 p-6 rounded-3xl border border-dashed border-zinc-800">
                    <p className="text-sm font-medium text-zinc-400 leading-relaxed italic">
                        "{ej.biblioteca_ejercicios?.descripcion || planData.modal.noNotes}"
                    </p>
                </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
