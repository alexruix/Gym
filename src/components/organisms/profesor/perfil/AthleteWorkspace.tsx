import React, { useState } from "react";
import { 
  Dumbbell, 
  History, 
  FileText, 
  ChevronRight, 
  Clock, 
  TrendingUp, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface Props {
  planData?: any;
  historial?: any[];
}

export function AthleteWorkspace({ planData, historial }: Props) {
  const [activeTab, setActiveTab] = useState<'training' | 'history' | 'docs'>('training');
  const { workspace } = athleteProfileCopy;

  const tabs = [
    { id: 'training', label: workspace.tabs.training, icon: Dumbbell },
    { id: 'history', label: workspace.tabs.history, icon: History },
    { id: 'docs', label: workspace.tabs.docs, icon: FileText },
  ] as const;

  return (
    <div className="bg-white dark:bg-zinc-950/40 rounded-3xl p-4 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8 min-h-[600px]">
      
      {/* 1. TABS NAVIGATION */}
      <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg mx-auto md:mx-0 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                isActive 
                  ? 'bg-zinc-950 text-white shadow-lg scale-100' 
                  : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 scale-95 hover:scale-100'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 2. TABS CONTENT */}
      <div className="pt-4 h-full">
        
        {/* --- TAB: ENTRENAMIENTO --- */}
        {activeTab === 'training' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl md:text-2xl font-black tracking-tighter text-zinc-950 dark:text-white flex items-center gap-3 uppercase">
                {workspace.training.todayTitle.replace('{session}', 'Sesión A')} 
                <span className="text-[10px] font-black text-lime-600 bg-lime-100 px-3 py-1 rounded-full border border-lime-200 uppercase tracking-widest animate-pulse">
                  {workspace.training.statusInProgress}
                </span>
              </h3>
              <Button variant="outline" className="h-10 text-zinc-950 font-black gap-2 text-[10px] uppercase tracking-widest border-2 border-zinc-200 rounded-xl px-4 hover:bg-zinc-50 transition-all active:scale-95">
                <Plus className="w-4 h-4" aria-hidden="true" />
                {workspace.training.newRoutineBtn}
              </Button>
            </div>

            <div className="grid gap-4">
              {/* SESION CARD (SAMPLE EXERCISES) */}
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="group relative bg-zinc-50 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 md:p-6 transition-all duration-500 hover:border-zinc-200 shadow-sm hover:shadow-md">
                   <div className="absolute top-0 right-0 p-4 flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <div className="w-2.5 h-2.5 rounded-full bg-lime-500 shadow-lg" />
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{workspace.training.completed}</span>
                   </div>

                   <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="w-32 md:w-40 aspect-video rounded-2xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
                        <img 
                          src={`https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=120&fit=crop&q=80&sig=${i}`} 
                          className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" 
                          alt="Thumbnail ejercicio"
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-zinc-950 dark:text-white leading-none uppercase tracking-tight">Press de Banca Plano</h4>
                          <p className="text-[10px] font-black text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                            <Clock className="w-3 h-3" aria-hidden="true" /> {workspace.training.restLabel} 90s • {workspace.training.targetLabel}: <span className="text-zinc-900 dark:text-zinc-300">12 Reps</span>
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {[1, 2, 3, 4].map((set) => (
                            <div key={set} className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 px-4 py-2 rounded-xl text-center group/set hover:border-lime-400/40 transition-all cursor-default relative overflow-hidden shadow-sm">
                              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Set {set}</p>
                              <p className="text-xs font-black text-zinc-900 dark:text-white group-hover/set:text-lime-600 transition-colors">10 x 80kg</p>
                              {/* RPE Indicator (Mini) */}
                              <div className="absolute bottom-1 right-1.5 flex gap-0.5" aria-hidden="true">
                                <div className="w-1 h-1 rounded-full bg-lime-500" />
                                <div className="w-1 h-1 rounded-full bg-lime-500" />
                                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="hidden lg:block w-32 text-right space-y-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                          {workspace.training.smartRpe}
                        </p>
                        <div className="text-4xl font-black text-zinc-950 dark:text-zinc-800 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors tracking-tighter">8.5</div>
                        <div className="flex items-center justify-end gap-1 text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                          <TrendingUp className="w-3 h-3 text-lime-500" aria-hidden="true" /> +5%
                        </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: HISTORIAL --- */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 px-2 lg:px-12 py-8">
            <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800 space-y-12 pl-8 py-2">
               {[1, 2, 3].map((_, i) => (
                  <div key={i} className="relative group/log">
                    <div className="absolute -left-11 top-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-center group-hover/log:border-lime-500 transition-colors z-10 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover/log:bg-lime-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {workspace.history.daysAgo.replace('{n}', (i + 1).toString())}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                          {workspace.history.typeTraining}
                        </span>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-3xl border border-transparent group-hover/log:border-zinc-100 dark:group-hover/log:border-zinc-800 transition-all">
                        <h4 className="font-black text-zinc-900 dark:text-white text-lg uppercase tracking-tight">Sesión B Completada</h4>
                        <p className="text-sm text-zinc-500 font-medium">Llegó a un nuevo Récord Personal (PR) en Sentadilla: <span className="text-lime-600 font-black">120kg x 3 reps</span>.</p>
                      </div>
                    </div>
                  </div>
               ))}
            </div>
            <Button variant="outline" className="w-full h-14 rounded-2xl border-zinc-200 text-zinc-400 hover:text-zinc-950 font-black gap-3 uppercase tracking-widest text-[10px] active:scale-95 shadow-sm hover:bg-zinc-50">
               {workspace.history.viewMore}
               <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* --- TAB: DOCS --- */}
        {activeTab === 'docs' && (
           <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
             {['Plan de Alimentación', 'Formulario Inicial PAR-Q', 'Resultados Laboratorio', 'Notas Privadas (Solo Profe)'].map((doc, i) => (
               <div key={i} className="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900/80 transition-all group/doc cursor-pointer flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center group-hover/doc:bg-lime-100 group-hover/doc:text-lime-600 transition-all border border-zinc-100 dark:border-zinc-700">
                      <FileText className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-black text-zinc-900 dark:text-white text-sm uppercase tracking-tight">{doc}</h4>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        {i === 0 ? workspace.docs.updatedToday : workspace.docs.updatedMonth}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-300 group-hover/doc:text-zinc-950 transition-all transform group-hover/doc:translate-x-1" aria-hidden="true" />
               </div>
             ))}
             <button className="bg-zinc-50/50 border-2 border-dashed border-zinc-200 hover:border-lime-400/40 hover:bg-lime-50/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 group/add transition-all active:scale-95">
                <Plus className="w-6 h-6 text-zinc-400 group-hover/add:text-lime-600 group-hover/add:scale-110 transition-all" aria-hidden="true" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover/add:text-lime-600 transition-all">
                  {workspace.docs.uploadBtn}
                </span>
             </button>
           </div>
        )}

      </div>
    </div>
  );
}
