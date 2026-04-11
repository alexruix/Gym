import React from 'react';
import { sesionStrings } from '@/data/es/alumno/sesion';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { ChevronLeft } from 'lucide-react';

interface SessionHeaderProps {
  semanaActual: number;
  nombreDia: string;
  diaPlan: number;
  abandonUrl?: string;
}

export function SessionHeader({ semanaActual, nombreDia, diaPlan, abandonUrl = "/alumno" }: SessionHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 py-4 px-6 flex justify-between items-center h-20">
      <div className="flex-1">
        <a 
          href={abandonUrl} 
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
          title={sesionStrings.header.abandon}
        >
          <ChevronLeft className="w-5 h-5" />
        </a>
      </div>
      
      <div className="flex flex-col items-center flex-1">
        <TechnicalLabel className="text-lime-400 mb-0.5">
          {sesionStrings.header.week} {semanaActual}
        </TechnicalLabel>
        <h1 className="text-base font-black uppercase tracking-tighter text-white leading-tight">
          {nombreDia}
        </h1>
      </div>
      
      <div className="flex-1 flex justify-end">
        <div className="bg-zinc-900 border border-white/5 px-4 py-2 rounded-2xl">
           <TechnicalLabel className="text-zinc-400">
            {sesionStrings.header.day} {diaPlan}
           </TechnicalLabel>
        </div>
      </div>
    </header>
  );
}
