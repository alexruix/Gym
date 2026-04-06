import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Loader2, X } from "lucide-react";
import { DaySelector } from "@/components/atoms/profesor/DaySelector";
import { cn } from "@/lib/utils";
import { TimeInput } from "@/components/molecules/profesor/core/TimeInput";

interface TurnoFormProps {
  initialData?: {
    nombre: string;
    hora_inicio: string;
    hora_fin: string;
    capacidad_max: number;
    dias_asistencia: string[];
  };
  onSave: (data: any) => void;
  onCancel: () => void;
  isPending?: boolean;
  submitLabel?: string;
  className?: string;
}

export function TurnoForm({ 
  initialData, 
  onSave, 
  onCancel, 
  isPending, 
  submitLabel = "Guardar cambios",
  className 
}: TurnoFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    hora_inicio: initialData?.hora_inicio || "09:00",
    hora_fin: initialData?.hora_fin || "10:00",
    capacidad_max: initialData?.capacidad_max || 10,
    dias_asistencia: initialData?.dias_asistencia || ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  });

  const isValid = formData.nombre.trim() !== "" && formData.dias_asistencia.length > 0;

  return (
    <div className={cn(
      "p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-lime-400/30 rounded-[2rem] space-y-6 animate-in fade-in zoom-in duration-300 shadow-xl shadow-lime-400/5",
      className
    )}>
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">
          Identificación del Bloque
        </Label>
        <Input 
          placeholder="Ej: Turno Mañana"
          value={formData.nombre} 
          onChange={e => setFormData({...formData, nombre: e.target.value})}
          className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold uppercase text-xs focus-visible:ring-lime-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">
            Hora Inicio
          </Label>
          <TimeInput 
            value={formData.hora_inicio} 
            onChange={val => setFormData({...formData, hora_inicio: val})}
            className="h-12"
          />
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">
            Hora Fin
          </Label>
          <TimeInput 
            value={formData.hora_fin} 
            onChange={val => setFormData({...formData, hora_fin: val})}
            className="h-12"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">
          Capacidad máxima (Alumnos)
        </Label>
        <Input 
          type="number"
          value={formData.capacidad_max} 
          onChange={e => setFormData({...formData, capacidad_max: Number(e.target.value)})}
          className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-xs"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">
          Días de Disponibilidad
        </Label>
        <DaySelector 
          selectedDays={formData.dias_asistencia} 
          onChange={(dias) => setFormData({...formData, dias_asistencia: dias})}
          compact
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="button"
          onClick={onCancel} 
          variant="ghost" 
          className="flex-1 h-14 rounded-2xl text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button 
          onClick={() => onSave(formData)} 
          disabled={isPending || !isValid} 
          className="flex-1 h-14 rounded-2xl bg-lime-400 text-zinc-950 hover:bg-lime-500 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-lime-400/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
