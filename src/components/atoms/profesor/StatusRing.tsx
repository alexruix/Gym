import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusRingProps {
  progress: number; // 0 a 100
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusRing({ progress, size = "md", className }: StatusRingProps) {
  const [pulse, setPulse] = useState(false);
  const isCompleted = progress >= 100;
  
  // Efecto de pulso cuando cambia el progreso (Realtime)
  useEffect(() => {
    if (progress > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const strokeWidth = size === "sm" ? 2 : 3;
  const radius = 20 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn(
        "relative flex items-center justify-center transition-transform duration-500", 
        sizes[size], 
        pulse && "scale-110",
        className
    )}>
      {isCompleted ? (
        <div className="absolute inset-0 bg-lime-400 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_15px_rgba(163,230,53,0.5)]">
          <Check className="text-zinc-950 w-3/5 h-3/5" strokeWidth={4} />
        </div>
      ) : (
        <>
          <svg className="w-full h-full -rotate-90 transform">
            {/* Background ring */}
            <circle
              className="text-zinc-100 dark:text-zinc-800"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50%"
              cy="50%"
            />
            {/* Progress ring */}
            <circle
              className={cn(
                "text-lime-400 transition-all duration-700 ease-in-out",
                pulse && "text-lime-300"
              )}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50%"
              cy="50%"
            />
          </svg>
          <span className={cn(
            "absolute text-[9px] font-black tracking-tighter text-zinc-500 dark:text-zinc-400 transition-colors",
            pulse && "text-lime-400"
          )}>
            {Math.round(progress)}%
          </span>
        </>
      )}
    </div>
  );
}
