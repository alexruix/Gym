import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepsNames: string[];
}

export const StepIndicator = ({ currentStep, totalSteps, stepsNames }: StepIndicatorProps) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-100 z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-lime-400 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>

        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10 bg-white px-2">
              <div className={cn(
                "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300",
                isCompleted ? "bg-lime-400 border-lime-400 text-zinc-950" : 
                isActive ? "bg-zinc-950 border-zinc-950 text-white scale-110 shadow-lg" : 
                "bg-white border-zinc-200 text-zinc-400"
              )}>
                {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-xs font-black">{stepNum}</span>}
              </div>
              <span className={cn(
                "absolute -bottom-6 text-[8px] font-black uppercase tracking-widest whitespace-nowrap",
                isActive ? "text-zinc-950" : "text-zinc-400"
              )}>
                {stepsNames[idx]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
