import React from "react";
import { Sunrise, Sunset, Clock, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { actions } from "astro:actions";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface Template {
  id: "morning" | "afternoon" | "full";
  title: string;
  description: string;
  icon: React.ElementType;
  count: string;
}

const TEMPLATES: Template[] = [
  {
    id: "morning",
    title: "Turno mañana",
    description: "Turnos desde 8:00 a 12:00.",
    icon: Sunrise,
    count: "4 turnos",
  },
  {
    id: "afternoon",
    title: "Turno tarde",
    description: "Turnos desde 16:00 a 21:00.",
    icon: Sunset,
    count: "5 turnos",
  },
  {
    id: "full",
    title: "Día completo",
    description: "Los dos turnos AM y PM",
    icon: Sparkles,
    count: "9 turnos",
  },
];

interface TurnoTemplatePickerProps {
  onSuccess?: () => void;
  className?: string;
}

export function TurnoTemplatePicker({ onSuccess, className }: TurnoTemplatePickerProps) {
  const { execute, isPending } = useAsyncAction();

  const handleSelect = (templateId: "morning" | "afternoon" | "full") => {
    execute(
      async () => {
        const { error } = await actions.profesor.seedTurnos({ template: templateId });
        if (error) throw error;
        if (onSuccess) onSuccess();
      },
      {
        loadingMsg: "Generando bloques...",
        successMsg: "Agenda configurada exitosamente",
        reloadOnSuccess: !onSuccess,
      }
    );
  };

  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {TEMPLATES.map((template) => {
        const Icon = template.icon;

        return (
          <button
            key={template.id}
            onClick={() => handleSelect(template.id)}
            disabled={isPending}
            className={cn(
              "group relative flex flex-col items-start p-6 rounded-[2rem] border transition-all duration-500 text-left overflow-hidden shadow-sm",
              "bg-white border-zinc-200 hover:border-lime-400 hover:shadow-md",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {/* Background Grain/Glow */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-lime-500/5 blur-3xl group-hover:bg-lime-500/10 transition-colors duration-500" />

            <div className="mb-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 group-hover:border-lime-500/30 group-hover:scale-110 transition-all duration-500">
              <Icon className="w-5 h-5 text-zinc-400 group-hover:text-lime-600" />
            </div>

            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 mb-1">
              {template.title}
            </h3>

            <p className="text-[10px] font-medium text-zinc-500 mb-4 leading-relaxed group-hover:text-zinc-600 transition-colors">
              {template.description}
            </p>

            <div className="mt-auto pt-4 border-t border-zinc-100 w-full flex items-center justify-between">
              <div className="flex flex-col">
                {/* <span className="text-[9px] font-bold uppercase tracking-tight text-lime-600">
                  {template.hours}
                </span> */}
                <span className="text-[8px] font-bold text-zinc-400 uppercase">
                  {template.count}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-lime-500 group-hover:border-lime-400 transition-all duration-500">
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin text-zinc-950" />
                ) : (
                  <Clock className="w-3 h-3 text-zinc-400 group-hover:text-zinc-950" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
