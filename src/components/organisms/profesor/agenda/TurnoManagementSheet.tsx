import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Clock, Users, Palette, Save, Loader2, Settings2 } from "lucide-react";
import { actions } from "astro:actions";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { TurnoTemplatePicker } from "@/components/molecules/profesor/agenda/TurnoTemplatePicker";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

import { DaySelector } from "@/components/atoms/profesor/DaySelector";

interface Turno {
  id: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad_max: number;
  color_tag?: string;
  dias_asistencia: string[];
}

interface TurnoManagementSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  turnos: Turno[];
}

// Mapeo de días abreviados para el resumen visual
const getDayInitials = (dias: string[]) => {
    if (!dias || dias.length === 0) return "Sin días";
    if (dias.length === 7) return "Toda la semana";
    if (dias.length === 5 && !dias.includes("Sábado") && !dias.includes("Domingo")) return "Lun a Vie";
    
    // Mapear a iniciales (L M M J V S D)
    const map: Record<string, string> = {
        "Lunes": "L", "Martes": "M", "Miércoles": "M", "Jueves": "J", "Viernes": "V", "Sábado": "S", "Domingo": "D"
    };
    return dias.map(d => map[d] || d.charAt(0)).join(" ");
};

export function TurnoManagementSheet({ isOpen, onOpenChange, turnos }: TurnoManagementSheetProps) {
  const { execute, isPending } = useAsyncAction();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Turno>>({});

  const handleEdit = (turno: Turno) => {
    setEditingId(turno.id);
    setFormData(turno);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSave = () => {
    execute(
      async () => {
        const { error } = await actions.profesor.upsertTurno(formData as any);
        if (error) throw error;
      },
      {
        loadingMsg: "Guardando turno...",
        successMsg: "Turno actualizado",
        reloadOnSuccess: true,
      }
    );
  };

  const handleDelete = (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el turno "${nombre}"? Los alumnos asignados se quedarán sin turno.`)) return;
    
    execute(
      async () => {
        const { error } = await actions.profesor.deleteTurno({ id });
        if (error) throw error;
      },
      {
        loadingMsg: "Eliminando...",
        successMsg: "Turno eliminado",
        reloadOnSuccess: true,
      }
    );
  };

  const handleAdd = () => {
    setEditingId("new");
    setFormData({
      nombre: "Nuevo Turno",
      hora_inicio: "09:00",
      hora_fin: "10:00",
      capacidad_max: 10,
      dias_asistencia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-zinc-200 w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">
            Gestión de turnos
          </SheetTitle>
          <SheetDescription className="text-zinc-500 font-medium">
            Editá los bloques aprendidos del Excel o creá nuevos turnos manuales.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <Button 
            onClick={handleAdd}
            variant="outline" 
            className="w-full h-12 bg-zinc-50 border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-lime-400 hover:text-zinc-950 transition-all group"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:scale-110" />
            Nuevo turno manual
          </Button>

          {turnos.length === 0 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4 px-2">
                    <Separator className="flex-1 bg-zinc-100" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">O usá una plantilla</span>
                    <Separator className="flex-1 bg-zinc-100" />
                </div>
                <TurnoTemplatePicker className="grid-cols-1" />
             </div>
          )}

          <Separator className="bg-zinc-100" />

          <div className="space-y-4">
            {turnos.map((turno) => {
              const isEditing = editingId === turno.id;
              
              if (isEditing || (editingId === "new" && turno.id === "new")) {
                return (
                  <div key={turno.id} className="p-4 bg-zinc-50 border border-lime-400/30 rounded-3xl space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nombre del Bloque</Label>
                        <Input 
                            value={formData.nombre} 
                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                            className="bg-white border-zinc-200 rounded-xl"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Inicio</Label>
                            <Input 
                                type="time"
                                value={formData.hora_inicio} 
                                onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                                className="bg-white border-zinc-200 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Fin</Label>
                            <Input 
                                type="time"
                                value={formData.hora_fin} 
                                onChange={e => setFormData({...formData, hora_fin: e.target.value})}
                                className="bg-white border-zinc-200 rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Capacidad Máx.</Label>
                        <Input 
                            type="number"
                            value={formData.capacidad_max} 
                            onChange={e => setFormData({...formData, capacidad_max: Number(e.target.value)})}
                            className="bg-white border-zinc-200 rounded-xl"
                        />
                    </div>
                    <div className="space-y-4 pt-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Días de Asistencia</Label>
                        <DaySelector 
                            selectedDays={formData.dias_asistencia || []} 
                            onChange={(dias) => setFormData({...formData, dias_asistencia: dias})}
                            compact
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleCancel} variant="ghost" className="flex-1 rounded-xl text-zinc-400">Cancelar</Button>
                        <Button onClick={handleSave} disabled={isPending} className="flex-1 rounded-xl bg-lime-400 text-zinc-950 hover:bg-lime-500 font-bold">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Guardar</>}
                        </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={turno.id} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-3xl hover:border-lime-400/30 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-1 h-8 rounded-full bg-zinc-100 group-hover:bg-lime-400 transition-colors")} />
                    <div>
                      <h4 className="font-bold text-zinc-900 uppercase tracking-tighter text-sm flex items-center gap-2">
                        {turno.nombre}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-zinc-400 flex items-center gap-1 uppercase">
                          <Clock className="w-3 h-3" /> {turno.hora_inicio.substring(0,5)} - {turno.hora_fin.substring(0,5)}
                        </span>
                        <span className="text-[10px] font-black text-lime-600 uppercase tracking-widest border-l border-zinc-100 pl-3">
                            {getDayInitials(turno.dias_asistencia)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button onClick={() => handleEdit(turno)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                        <Settings2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(turno.id, turno.nombre)} variant="ghost" size="icon" className="h-8 w-8 text-red-500/50 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {editingId === "new" && (
                <div className="p-4 bg-zinc-50 border border-lime-400/30 rounded-3xl space-y-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nombre del Bloque</Label>
                        <Input 
                            value={formData.nombre} 
                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                            className="bg-white border-zinc-200 rounded-xl"
                        />
                    </div>
                    {/* ... (reuso del form UI similar al edit pero para 'new') */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Inicio</Label>
                            <Input 
                                type="time"
                                value={formData.hora_inicio} 
                                onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                                className="bg-white border-zinc-200 rounded-xl"
                            />
                        </div>
                        {/* ... etc (podría abstraerse a un componente TurnoForm) */}
                    </div>
                    <Button onClick={handleSave} disabled={isPending} className="w-full rounded-2xl bg-lime-400 text-zinc-950 font-bold uppercase py-6">Crear Turno</Button>
                </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
