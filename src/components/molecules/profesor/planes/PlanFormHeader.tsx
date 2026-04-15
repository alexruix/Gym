import React from "react";
import { UseFormReturn } from "react-hook-form";
import { TrendingUp, Layers, ClipboardList } from "lucide-react";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlanPill } from "@/components/atoms/profesor/planes/PlanPill";
import { planesCopy } from "@/data/es/profesor/planes";

interface Props {
  form: UseFormReturn<any>;
  numWeeks: number;
  freqSemanal: number;
  isTemplate: boolean;
}

/**
 * PlanFormHeader: Cabecera del editor de planes con metadatos de duración y frecuencia.
 */
export function PlanFormHeader({ form, numWeeks, freqSemanal, isTemplate }: Props) {
  const copy = planesCopy.form;

  return (
    <div className="space-y-6">
      <header className="space-y-6 animate-in fade-in duration-700">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormControl>
                  <Input
                    placeholder={copy.basic.placeholders.nombre}
                    {...field}
                    className="text-2xl md:text-3xl lg:text-4xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto tracking-tighter placeholder:opacity-20 text-zinc-950 dark:text-white"
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase text-red-500 tracking-widest mt-2" />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap items-center gap-2">
            <PlanPill
              icon={TrendingUp}
              value={numWeeks === 0 ? "∞" : numWeeks}
              label={numWeeks === 0 ? "Sin fin" : "sem"}
              variant="accent"
            />
            <PlanPill
              icon={Layers}
              value={freqSemanal}
              label="días/sem"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Duración</span>
            <div className="industrial-select-trigger h-10">
              <select
                className="industrial-select text-[11px]"
                value={numWeeks}
                onChange={(e) => form.setValue("duracion_semanas", parseInt(e.target.value))}
              >
                <option value={0}>Indefinida (Sin fin)</option>
                {[1, 2, 4, 8, 12, 24, 52].map(s => <option key={s} value={s}>{s} semanas</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Frecuencia</span>
            <div className="industrial-select-trigger h-10">
              <select
                className="industrial-select text-[11px]"
                value={freqSemanal}
                onChange={(e) => form.setValue("frecuencia_semanal", parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(s => <option key={s} value={s}>{s} días x sem</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      {isTemplate && (
        <div className="bg-lime-500/10 border border-lime-500/20 rounded-3xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-10 h-10 rounded-2xl bg-lime-500 flex items-center justify-center shrink-0 shadow-lg shadow-lime-500/20">
            <ClipboardList className="w-5 h-5 text-zinc-950" />
          </div>
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Planificá la estructura base. Ajustarás series/reps finales en el perfil de cada alumno.
          </p>
        </div>
      )}
    </div>
  );
}
