import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { sesionStrings } from '@/data/es/alumno/sesion';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';

interface CompletionOverlayProps {
  isFinishing: boolean;
  globalNota: string;
  onNotaChange: (val: string) => void;
  onFinish: () => void;
}

export function CompletionOverlay({ isFinishing, globalNota, onNotaChange, onFinish }: CompletionOverlayProps) {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50">
      <div className="industrial-card-glass p-8 border-lime-400/30 animate-in slide-in-from-bottom-12 duration-700">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-500/20">
            <CheckCircle className="w-8 h-8 text-black" />
          </div>
          <div>
            <TechnicalLabel className="text-lime-400 mb-1">{sesionStrings.completion.processFinished}</TechnicalLabel>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              {sesionStrings.completion.title}
            </h2>
            <p className="text-zinc-500 text-sm font-medium mt-2">
              {sesionStrings.completion.subtitle}
            </p>
          </div>
        </div>

        <textarea 
          className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm focus:ring-2 focus:ring-lime-400 outline-none resize-none mb-6 placeholder:text-zinc-600"
          rows={2}
          placeholder={sesionStrings.completion.summaryPlaceholder}
          value={globalNota}
          onChange={e => onNotaChange(e.target.value)}
        />

        <button
          disabled={isFinishing}
          onClick={onFinish}
          className="w-full h-20 bg-lime-400 text-black rounded-3xl flex items-center justify-center gap-3 hover:bg-lime-400 active:scale-95 transition-all shadow-[0_30px_60px_rgba(163,230,53,0.2)]"
        >
          <span className="text-xl font-black uppercase tracking-widest leading-none">
            {isFinishing ? sesionStrings.completion.saving : sesionStrings.completion.finishButton}
          </span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
