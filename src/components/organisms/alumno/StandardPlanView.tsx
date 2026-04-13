import React from 'react';
import { BlueprintExerciseCard } from '@/components/molecules/alumno/BlueprintExerciseCard';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { planData } from '@/data/es/alumno/plan';
import { BookOpen, Hash, Dumbbell } from 'lucide-react';

interface StandardPlanViewProps {
  planDataRaw: any;
}

export function StandardPlanView({ planDataRaw }: StandardPlanViewProps) {
  const rutinas = (planDataRaw?.rutinas_diarias || []).sort((a: any, b: any) => a.dia_numero - b.dia_numero);

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* MASTER PLAN HEADER */}
      <header className="relative p-10 rounded-[3rem] bg-zinc-900 overflow-hidden border border-white/5 ring-1 ring-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
        
        <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-lime-400 border border-white/5">
                    <BookOpen className="w-6 h-6" />
                </div>
                <div>
                    <TechnicalLabel className="text-zinc-500 mb-0.5">{planData.header.label}</TechnicalLabel>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">
                        {planDataRaw?.nombre}
                    </h1>
                </div>
            </div>

            {planDataRaw?.descripcion && (
                <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-sm">
                    {planDataRaw.descripcion}
                </p>
            )}

            <div className="flex gap-3 pt-2">
                <div className="px-4 py-2 rounded-xl bg-zinc-950/50 border border-white/5 flex items-center gap-2">
                    <Hash className="w-3 h-3 text-zinc-600" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        {planDataRaw?.duracion_semanas} {planData.metadata.duration.unit}
                    </span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-zinc-950/50 border border-white/5 flex items-center gap-2">
                    <Dumbbell className="w-3 h-3 text-zinc-600" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        {planDataRaw?.frecuencia_semanal} {planData.metadata.frequency.unit}
                    </span>
                </div>
            </div>
        </div>
      </header>

      {/* ROUTINES LIST */}
      <div className="space-y-16">
        {rutinas.map((rutina: any) => (
          <section key={rutina.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* PROGRESS HEADER */}
            <div className="flex items-end justify-between px-2">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[2rem] bg-lime-400 text-black flex items-center justify-center font-black text-2xl shadow-2xl shadow-lime-500/20 italic">
                        D{rutina.dia_numero}
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
                            {rutina.nombre_dia || `Día ${rutina.dia_numero}`}
                        </h2>
                        <div className="flex items-center gap-2">
                            <TechnicalLabel className="text-zinc-500">
                                {rutina.ejercicios_plan?.length || 0} {planData.routines.movementsLabel}
                            </TechnicalLabel>
                        </div>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Estado del día</p>
                    <div className="h-1.5 w-32 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-zinc-800 w-0 transition-all duration-1000" />
                    </div>
                </div>
            </div>

            {/* EXERCISES GRID */}
            <div className="grid gap-3">
              {(rutina.ejercicios_plan || [])
                .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0))
                .map((ej: any, idx: number) => (
                  <BlueprintExerciseCard 
                    key={ej.id} 
                    ej={ej} 
                    index={idx} 
                  />
                ))}
            </div>
          </section>
        ))}
      </div>

      {/* FOOTER MESSAGE */}
      <footer className="mt-8 p-12 border-2 border-dashed border-zinc-900 rounded-[3rem] text-center space-y-4">
          <BookOpen className="w-8 h-8 text-zinc-800 mx-auto" />
          <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto">
              {planData.footer.message}
          </p>
      </footer>
    </div>
  );
}
