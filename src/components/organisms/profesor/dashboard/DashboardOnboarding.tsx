import React, { useState } from "react";
import { CheckCircle2, Circle, X, BookOpen, UserPlus, ClipboardList } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { DashboardCard } from "@/components/molecules/DashboardCard";
import { IconWrapper } from "@/components/atoms/IconWrapper";

interface Props {
  hasPlans: boolean;
  hasStudents: boolean;
}

export function DashboardOnboarding({ hasPlans, hasStudents }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const c = dashboardCopy.onboarding;

  if (!isVisible || (hasPlans && hasStudents)) return null;

  const completedSteps = 1 + (hasPlans ? 1 : 0) + (hasStudents ? 1 : 0);

  return (
    <DashboardCard variant="neon">
      {/* Elemento de diseño de fondo */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-lime-500/20 rounded-full blur-3xl pointer-events-none" />

      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10 z-20"
        aria-label="Ocultar guía de inicio"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="max-w-xs shrink-0">
          <h2 className="text-xl font-black mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-lime-400" />
            {c.title}
          </h2>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-4">
            {c.description}
          </p>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-lime-400 h-full transition-all duration-500 rounded-full" style={{ width: `${(completedSteps / 3) * 100}%` }} />
          </div>
          <p className="text-xs text-zinc-500 mt-2 font-bold uppercase tracking-widest">{c.progressText.replace("{n}", String(completedSteps))}</p>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {/* Paso 1: Auth (Completado por lógica) */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col h-full opacity-60">
            <div className="flex justify-between items-start mb-3">
              <IconWrapper icon={CheckCircle2} color="primary" size="md" shape="rounded" />
            </div>
            <h3 className="text-sm font-bold text-white line-through decoration-zinc-500">{c.steps.profile.title}</h3>
            <p className="text-xs text-zinc-400 mt-1">{c.steps.profile.desc}</p>
          </div>

          {/* Paso 2: Crear un plan */}
          <a href={hasPlans ? "#" : "/profesor/planes/new"} className={`border p-4 rounded-2xl flex flex-col h-full transition-all ${hasPlans ? 'bg-white/5 border-white/10 opacity-60 cursor-default' : 'bg-white/5 border-lime-500/30 hover:bg-white/10 hover:-translate-y-1 group/card cursor-pointer relative overflow-hidden'}`}>
            {!hasPlans && <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />}
            <div className="flex justify-between items-start mb-3 relative z-10">
              <IconWrapper 
                icon={hasPlans ? CheckCircle2 : ClipboardList} 
                color={hasPlans ? "primary" : "base"} 
                size="md" 
                shape="rounded"
                className={!hasPlans ? "group-hover/card:bg-lime-400 group-hover/card:text-zinc-950 transition-colors" : ""}
              />
              {!hasPlans && <Circle className="w-4 h-4 text-zinc-500" />}
            </div>
            <h3 className={`text-sm font-bold relative z-10 ${hasPlans ? 'text-white line-through decoration-zinc-500' : 'text-white'}`}>{c.steps.plan.title}</h3>
            <p className="text-xs text-zinc-400 mt-1 relative z-10">{c.steps.plan.desc}</p>
          </a>

          {/* Paso 3: Agregar Alumno */}
          <a href={hasStudents ? "#" : "/profesor/alumnos/new"} className={`border p-4 rounded-2xl flex flex-col h-full transition-all ${hasStudents ? 'bg-white/5 border-white/10 opacity-60 cursor-default' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1 group/card cursor-pointer'}`}>
            <div className="flex justify-between items-start mb-3">
              <IconWrapper 
                icon={hasStudents ? CheckCircle2 : UserPlus} 
                color={hasStudents ? "primary" : "base"} 
                size="md" 
                shape="rounded"
              />
              {!hasStudents && <Circle className="w-4 h-4 text-zinc-500" />}
            </div>
            <h3 className={`text-sm font-bold ${hasStudents ? 'text-white line-through decoration-zinc-500' : 'text-white'}`}>{c.steps.student.title}</h3>
            <p className="text-xs text-zinc-400 mt-1">{c.steps.student.desc}</p>
          </a>
        </div>
      </div>
    </DashboardCard>
  );
}
