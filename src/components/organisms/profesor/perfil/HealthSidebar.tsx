import React from "react";
import { AlertTriangle, TrendingUp, Camera, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface Props {
  notasCriticas?: string | null;
  metricas?: {
    tipo: string;
    valor: string;
    cambio: string;
    subida: boolean;
  }[];
}

export function HealthSidebar({ notasCriticas, metricas }: Props) {
  const { sidebar } = athleteProfileCopy;

  return (
    <div className="flex flex-col gap-6 sticky top-24 h-fit pb-12">
      
      {/* 1. NOTAS CRÍTICAS (STICKY NOTE) */}
      <div className="relative overflow-hidden bg-amber-400 dark:bg-amber-500 group rounded-3xl p-6 shadow-sm border border-amber-300 dark:border-amber-600 transition-all hover:rotate-1">
        <div className="flex items-start gap-4">
          <div className="bg-zinc-950 p-2.5 rounded-xl shadow-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-950/50">
              {sidebar.criticalNotes.label}
            </p>
            <p className="text-sm font-bold text-zinc-950 leading-tight">
              {notasCriticas || sidebar.criticalNotes.empty}
            </p>
          </div>
        </div>
      </div>

      {/* 2. RÉCORD MÉTRICO (ESTRELLA) */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm hover:border-zinc-300 transition-all">
        <div className="flex items-center justify-between">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
             {sidebar.starMetric.label}
           </p>
           <TrendingUp className="w-4 h-4 text-lime-500" aria-hidden="true" />
        </div>
        
        <div className="flex items-end gap-3">
          <span className="text-4xl font-black text-zinc-950 dark:text-white leading-none tracking-tighter uppercase">
            {metricas?.[0]?.valor || "78.4kg"}
          </span>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-tighter flex items-center gap-1 ${
              metricas?.[0]?.subida ? 'bg-red-50 text-red-600 border-red-100' : 'bg-lime-50 text-lime-600 border-lime-100'
            }`}>
            {metricas?.[0]?.cambio || "-1.2kg"}
            <Zap className="w-3 h-3" />
          </span>
        </div>
        
        {/* Pseudo Sparkline (Decorative) */}
        <div className="h-8 w-full flex items-end gap-1 pt-2">
            {[30, 45, 35, 60, 50, 80, 70, 90].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-t-sm hover:bg-lime-400 transition-colors duration-500"
                style={{ height: `${h}%` }}
              />
            ))}
        </div>
      </div>

      {/* 3. GALERÍA DE PROGRESO */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
             {sidebar.progressVisual.label}
           </p>
           <Camera className="w-4 h-4 text-zinc-400" aria-hidden="true" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 aspect-square overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white">
           <div className="relative group/img overflow-hidden">
               <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop" className="w-full h-full object-cover grayscale transition-all duration-700 group-hover/img:grayscale-0 group-hover/img:scale-105" />
               <span className="absolute bottom-2 left-2 text-[8px] font-black text-white bg-zinc-950/80 px-2 py-0.5 rounded-sm z-20 uppercase tracking-widest">{sidebar.progressVisual.before}</span>
           </div>
           <div className="relative group/img overflow-hidden">
               <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=300&h=300&fit=crop" className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-110" />
               <span className="absolute bottom-2 left-2 text-[8px] font-black text-zinc-950 bg-lime-400 px-2 py-0.5 rounded-sm z-20 uppercase tracking-widest">{sidebar.progressVisual.now}</span>
           </div>
        </div>

        <Button variant="outline" className="w-full h-12 rounded-2xl border-zinc-200 text-zinc-400 hover:text-zinc-950 hover:bg-white font-black gap-2 text-[10px] uppercase tracking-widest transition-all">
          {sidebar.progressVisual.compareBtn}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}
