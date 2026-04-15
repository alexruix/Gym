import React from "react";
import { History, RefreshCw, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OmissionBannerProps {
  copy: any;
  isRealigning: boolean;
  onRealign: () => void;
}

export function OmissionBanner({ copy, isRealigning, onRealign }: OmissionBannerProps) {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-lg shrink-0">
          <History className="w-6 h-6 text-lime-400" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{copy.tag}</p>
          <h5 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">{copy.title}</h5>
        </div>
      </div>
      <button
        type="button"
        onClick={onRealign}
        disabled={isRealigning}
        className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold uppercase text-[10px] tracking-widest h-12 px-8 rounded-2xl shadow-xl transition-all active:scale-95 border border-zinc-800 flex items-center justify-center whitespace-nowrap disabled:opacity-50"
      >
        {isRealigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2 text-lime-400" />}
        {copy.action}
      </button>
    </div>
  );
}

interface StructuralBannerProps {
  copy: any;
}

export function StructuralBanner({ copy }: StructuralBannerProps) {
  return (
    <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 shrink-0">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">{copy.tag}</p>
          <h5 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">{copy.title}</h5>
        </div>
      </div>
      <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold uppercase text-[10px] tracking-widest h-11 px-8 rounded-2xl shadow-lg transition-all active:scale-95">
        <Sparkles className="w-4 h-4 mr-2" /> {copy.action}
      </Button>
    </div>
  );
}
