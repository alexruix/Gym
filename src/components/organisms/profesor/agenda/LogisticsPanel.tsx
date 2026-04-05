import React, { useState, useMemo } from "react";
import { 
  Search, 
  ListChecks, 
  Clock, 
  Calendar, 
  Check, 
  X,
  Loader2,
  Users
} from "lucide-react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DaySelector } from "@/components/atoms/profesor/DaySelector";
import { agendaCopy } from "@/data/es/profesor/agenda";
import { cn } from "@/lib/utils";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface Turno {
  id: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Student {
  id: string;
  nombre: string;
  turno_id: string | null;
}

interface LogisticsPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  turnos: Turno[];
}

/** 
 * Helper para normalizar búsqueda ignorando tildes y mayúsculas 
 * "Julián" -> "julian"
 */
const normalizeText = (text: string) => 
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function LogisticsPanel({ 
  isOpen, 
  onOpenChange, 
  students, 
  turnos 
}: LogisticsPanelProps) {
  const { execute, isPending } = useAsyncAction();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetTurnoId, setTargetTurnoId] = useState<string>("");
  const [diasAsistencia, setDiasAsistencia] = useState<string[]>([]);

  const copy = agendaCopy.modals.logistics;

  // 1. Ordenamiento Inteligente: Sin Turno -> Con Turno -> Alfabético
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      if (!a.turno_id && b.turno_id) return -1;
      if (a.turno_id && !b.turno_id) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [students]);

  // 2. Filtro reactivo sin tildes
  const filteredStudents = useMemo(() => {
    const term = normalizeText(search);
    if (!term) return sortedStudents;
    return sortedStudents.filter(s => normalizeText(s.nombre).includes(term));
  }, [sortedStudents, search]);

  const toggleStudent = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const handleAssign = async () => {
    if (!targetTurnoId || diasAsistencia.length === 0 || selectedIds.length === 0) return;

    const selectedTurno = turnos.find(t => t.id === targetTurnoId);
    
    await execute(
      actions.profesor.bulkUpdateStudents({
        studentIds: selectedIds,
        turno_id: targetTurnoId,
        dias_asistencia: diasAsistencia,
      }),
      {
        onSuccess: () => {
          toast.success(copy.success.replace("{{hora}}", selectedTurno?.nombre || ""));
          onOpenChange(false);
          // Recarga automática SSOT
          window.location.reload();
        }
      }
    );
  };

  const selectedTurnoObj = turnos.find(t => t.id === targetTurnoId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-zinc-200 rounded-[2.5rem] p-0 overflow-hidden gap-0">
        <div className="p-8 pb-4">
            <DialogHeader className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-lime-400/20 rounded-2xl flex items-center justify-center">
                        <ListChecks className="w-6 h-6 text-zinc-900" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-zinc-900 leading-none">
                            {copy.title}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 font-medium mt-1">
                            {copy.description}
                        </DialogDescription>
                    </div>
                </div>

                {/* Spotlight Search */}
                <div className="relative group mt-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-lime-500 transition-colors" />
                    <Input 
                        placeholder={copy.searchPlaceholder}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-14 pl-12 bg-zinc-50 border-zinc-100 rounded-2xl text-base font-medium focus:ring-lime-400/20 transition-all shadow-inner"
                    />
                    {search && (
                        <button 
                            onClick={() => setSearch("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-200 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>
                    )}
                </div>
            </DialogHeader>
        </div>

        {/* Student List */}
        <div className="h-[350px] overflow-y-auto px-8 custom-scrollbar">
            <div className="flex items-center justify-between py-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {filteredStudents.length} {filteredStudents.length === 1 ? 'Alumno' : 'Alumnos'}
                </span>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSelectAll}
                    className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-100"
                >
                    {selectedIds.length === filteredStudents.length ? 'Desmarcar todos' : 'Marcar todos'}
                </Button>
            </div>

            <div className="py-4 space-y-1">
                {filteredStudents.map((student) => {
                    const currentTurno = turnos.find(t => t.id === student.turno_id);
                    const isSelected = selectedIds.includes(student.id);

                    return (
                        <div 
                            key={student.id}
                            onClick={() => toggleStudent(student.id)}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                                isSelected ? "bg-zinc-50 border-lime-400/20" : "hover:bg-zinc-50/50",
                                student.turno_id && !isSelected && "opacity-60"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <Checkbox 
                                    checked={isSelected}
                                    onCheckedChange={() => toggleStudent(student.id)}
                                    className="h-5 w-5 rounded-md border-zinc-200 data-[state=checked]:bg-lime-400 data-[state=checked]:border-lime-400"
                                />
                                <div>
                                    <p className="font-bold text-zinc-900 tracking-tight">{student.nombre}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {currentTurno ? (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {copy.alreadyIn.replace("{{time}}", currentTurno.nombre)}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-lime-600 flex items-center gap-1">
                                                <X className="w-3 h-3" /> {copy.unassigned}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredStudents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-zinc-200" />
                        </div>
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">{copy.emptySearch}</p>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-zinc-50 border-t border-zinc-100 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{copy.selectTurno}</label>
                    <Select value={targetTurnoId} onValueChange={setTargetTurnoId}>
                        <SelectTrigger className="h-12 bg-white border-zinc-200 rounded-2xl font-bold">
                            <SelectValue placeholder="Buscá bloque..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-zinc-200 shadow-2xl">
                            {turnos.map(t => (
                                <SelectItem key={t.id} value={t.id} className="rounded-xl font-bold py-3">
                                    {t.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{copy.selectDays}</label>
                    <div className="bg-white border border-zinc-200 rounded-2xl p-1 h-12 flex items-center justify-center">
                        <DaySelector 
                            selectedDays={diasAsistencia}
                            onChange={setDiasAsistencia}
                            className="bg-transparent border-0 h-full border-none shadow-none p-0"
                            compact
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="rounded-xl font-black text-[9px] uppercase tracking-widest h-8 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            onClick={() => setDiasAsistencia(["Lunes", "Miércoles", "Viernes"])}
                        >
                            L-M-V
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="rounded-xl font-black text-[9px] uppercase tracking-widest h-8 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            onClick={() => setDiasAsistencia(["Martes", "Jueves"])}
                        >
                            M-J
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="rounded-xl font-black text-[9px] uppercase tracking-widest h-8 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            onClick={() => setDiasAsistencia(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"])}
                        >
                            Lu a Vi
                        </Button>
                    </div>
                </div>
            </div>

            <Button 
                disabled={isPending || selectedIds.length === 0 || !targetTurnoId || diasAsistencia.length === 0}
                onClick={handleAssign}
                className="w-full h-16 rounded-[1.5rem] bg-lime-400 text-zinc-950 hover:bg-lime-500 shadow-lg shadow-lime-400/10 transition-all font-black uppercase tracking-widest active:scale-[0.98]"
            >
                {isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : selectedIds.length === 0 ? (
                    copy.submitInitial
                ) : (
                    copy.submitActive
                        .replace("{{count}}", selectedIds.length.toString())
                        .replace("{{hora}}", selectedTurnoObj?.nombre || "")
                )}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
