import React from "react";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface PlanBannerManagerProps {
  isTemplate: boolean;
  showPromotion: boolean;
  onPersonalize: () => void;
  onDismissPromotion: () => void;
  planId?: string;
}

export function PlanBannerManager({
  isTemplate,
  showPromotion,
  onPersonalize,
  onDismissPromotion,
  planId
}: PlanBannerManagerProps) {
  const [isMasterBannerDismissed, setIsMasterBannerDismissed] = React.useState(false);
  const [isPromotionPersistentDismissed, setIsPromotionPersistentDismissed] = React.useState(false);

  React.useEffect(() => {
    if (planId) {
      const mDismissed = localStorage.getItem(`dismiss_master_banner_${planId}`);
      if (mDismissed) setIsMasterBannerDismissed(true);
      
      const pDismissed = localStorage.getItem(`dismiss_promotion_banner_${planId}`);
      if (pDismissed) setIsPromotionPersistentDismissed(true);
    }
  }, [planId]);

  const handleDismissMaster = () => {
    if (planId) localStorage.setItem(`dismiss_master_banner_${planId}`, "true");
    setIsMasterBannerDismissed(true);
  };

  const handleDismissPromotion = () => {
    if (planId) localStorage.setItem(`dismiss_promotion_banner_${planId}`, "true");
    setIsPromotionPersistentDismissed(true);
    onDismissPromotion?.();
  };

  const { workspace } = athleteProfileCopy;

  return (
    <div className="space-y-6 mb-10">
      {/* 1. MASTER PLAN BANNER (READ-ONLY WARNING) */}
      {isTemplate && !isMasterBannerDismissed && (
        <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-4 duration-500 shadow-2xl relative overflow-hidden group">
          <button 
            onClick={handleDismissMaster}
            className="absolute top-4 right-4 z-20 p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10 text-center md:text-left flex-col md:flex-row">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shadow-zinc-950/50 shrink-0">
              <AlertTriangle className="w-7 h-7 md:w-8 md:h-8 text-lime-400" />
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-bold text-white uppercase tracking-tighter mb-1">
                {workspace.routine.masterPlan.bannerTitle}
              </h4>
              <p className="text-zinc-400 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                Para realizar cambios estructurales para este alumno, debes crear una copia personalizada.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
            {/* <Button
              onClick={() => window.location.href = `/profesor/planes/${planId}`}
              variant="outline"
              className="h-12 px-6 rounded-xl border-white/10 font-bold uppercase text-[10px] tracking-widest w-full md:w-auto"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-2" />
              {workspace.routine.masterPlan.editMasterBtn}
            </Button> */}
            <Button
              onClick={onPersonalize}
              className="h-12 px-8 rounded-xl bg-lime-500 hover:bg-lime-500 text-zinc-950 font-bold uppercase text-[10px] tracking-widest w-full md:w-auto shadow-xl shadow-lime-500/20"
            >
              Crear copia
            </Button>
          </div>
        </div>
      )}

      {/* 2. PROMOTION/MUTATION BANNER */}
      {showPromotion && !isPromotionPersistentDismissed && (
        <div className="p-1 min-h-16 rounded-[2rem] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group animate-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={handleDismissPromotion}
            className="absolute top-4 right-4 z-20 p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute inset-0 bg-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 md:gap-6 px-6 md:px-8 relative z-10 w-full md:w-auto text-center md:text-left flex-col md:flex-row py-4 md:py-0">
            <div className="w-10 h-10 rounded-2xl bg-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/20 rotate-3 shrink-0">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-tight">Cambios estructurales detectados</p>
              <p className="text-[10px] font-bold text-zinc-400 max-w-[280px] mx-auto md:mx-0 whitespace-pre-line">
                Para añadir o quitar ejercicios de forma permanente,{"\n"}
                necesitás crear una copia personalizada.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 px-6 md:px-8 pb-6 md:pb-0 relative z-10 w-full md:w-auto">
            <Button
              variant="industrial"
              onClick={onPersonalize}
              className="h-10 px-8 rounded-xl bg-lime-500 hover:bg-lime-500 text-zinc-950 w-full md:w-auto uppercase text-[10px] font-bold shadow-lg shadow-lime-500/10"
            >
              Guardar como nuevo plan
            </Button>
            <Button
              variant="outline"
              onClick={handleDismissPromotion}
              className="h-10 px-6 rounded-xl border-white/10 hover:bg-white/5 text-white w-full md:w-auto uppercase text-[10px] font-bold"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
