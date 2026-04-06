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
import { Trash2, Plus, Clock, Settings2 } from "lucide-react";
import { TurnoTemplatePicker } from "@/components/molecules/profesor/agenda/TurnoTemplatePicker";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useTurnos } from "@/hooks/profesor/useTurnos";
import { TurnoForm } from "@/components/molecules/profesor/agenda/TurnoForm";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";

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
  const {
    editingId,
    handleEdit,
    handleCancel,
    handleSave,
    handleAdd,
    isPending,
    deleteFlow,
  } = useTurnos(turnos);

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
          <div className="space-y-4">
            <Button 
              onClick={handleAdd}
              variant="outline" 
              disabled={editingId === "new"}
              className={cn(
                "w-full h-12 bg-zinc-50 border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group",
                editingId === "new" ? "opacity-30" : "hover:bg-lime-400 hover:text-zinc-950"
              )}
            >
              <Plus className="w-4 h-4 mr-2 group-hover:scale-110" />
              Nuevo turno manual
            </Button>

            {editingId === "new" && (
                <TurnoForm
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isPending={isPending}
                    submitLabel="Crear turno"
                    className="animate-in slide-in-from-top-4"
                />
            )}
          </div>

          {!editingId && turnos.length === 0 && (
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
              
              if (isEditing) {
                return (
                  <TurnoForm 
                    key={turno.id}
                    initialData={turno}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isPending={isPending}
                  />
                );
              }

              return (
                <div 
                  key={turno.id} 
                  className={cn(
                    "flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-3xl hover:border-lime-400/30 hover:shadow-sm transition-all group",
                    editingId && "opacity-20 grayscale scale-95 blur-[1px]"
                  )}
                >
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

                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button onClick={() => handleEdit(turno.id)} variant="ghost" size="icon" className="h-10 w-10 md:h-8 md:w-8 text-zinc-400 hover:text-zinc-900">
                        <Settings2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => deleteFlow.setItemToDelete(turno)} variant="ghost" size="icon" className="h-10 w-10 md:h-8 md:w-8 text-red-500/50 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DeleteConfirmDialog
          isOpen={!!deleteFlow.itemToDelete}
          onOpenChange={(open) => !open && deleteFlow.clearItem()}
          onConfirm={deleteFlow.handleConfirm}
          isDeleting={deleteFlow.isPending}
          title={`Eliminar turno: ${deleteFlow.itemToDelete?.nombre}`}
          description="Al eliminar este turno, todos los alumnos asignados perderán su bloque horario y deberás reasignarlos."
        />
      </SheetContent>
    </Sheet>
  );
}
