import React, { useState, useEffect } from "react";
import { PersonalDataCard } from "./PersonalDataCard";
import { FitnessDataCard } from "./FitnessDataCard";
import { TeacherContactCard } from "./TeacherContactCard";
import { Clock, LogOut } from "lucide-react";
import { perfilCopy } from "@/data/es/alumno/perfil";
import { globalCopy } from "@/data/es/global";
import { actions } from "astro:actions";
import { triggerHapticSoft, triggerHapticWarning } from "@/lib/performance";
import { cn, toInputDate } from "@/lib/utils";
import { DatePickerAlumno } from "@/components/atoms/alumno/DatePickerAlumno";
import { toast } from "sonner";

export interface ProfileContainerProps {
  alumno: any;
  profesor: any;
  turnos: any[];
  occupancyMap: Record<string, number>;
  maxDays: number;
}

export function ProfileContainer({ alumno: initialAlumno, profesor, turnos, occupancyMap, maxDays }: ProfileContainerProps) {
  const [alumno, setAlumno] = useState(initialAlumno);
  const [isEditing, setIsEditing] = useState<"personal" | "fitness" | null>(null);
  const [isEditingShift, setIsEditingShift] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states copy
  const [formData, setFormData] = useState({ ...initialAlumno });

  // Handle auto-edit from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editSection = params.get('edit');
    if (editSection === 'fitness') {
      handleEdit('fitness');
      setIsEditingShift(true); // Auto-focus shift settings if coming from session prompt
    } else if (editSection === 'personal') {
      handleEdit('personal');
    }
  }, []);

  const handleEdit = (section: "personal" | "fitness") => {
    setFormData({ ...alumno });
    setIsEditing(section);
    setIsEditingShift(false);
  };

  const handleClose = () => {
    setIsEditing(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Si intenta cambiar a un turno agotado, disparamos haptic de advertencia
    if (name === "turno_id" && value !== "") {
      const selectedTurno = turnos.find(t => t.id === value);
      const occupancy = occupancyMap[value] || 0;
      if (selectedTurno?.capacidad_max && occupancy >= selectedTurno.capacidad_max) {
        triggerHapticWarning();
        return; // No permitimos el cambio en el estado del form
      }
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayId: string) => {
    const currentDays = formData.dias_asistencia || [];
    const isRemoving = currentDays.includes(dayId);
    
    // Si intenta agregar y ya llegó al máximo, feedback negativo
    if (!isRemoving && maxDays > 0 && currentDays.length >= maxDays) {
      triggerHapticWarning();
      return;
    }

    const newDays = isRemoving
      ? currentDays.filter((id: string) => id !== dayId)
      : [...currentDays, dayId];
    setFormData((prev: any) => ({ ...prev, dias_asistencia: newDays }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      fecha_nacimiento: date ? toInputDate(date) : null 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await actions.alumno.updateStudentProfile({
        telefono: formData.telefono || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        peso_actual: formData.peso_actual ? parseFloat(String(formData.peso_actual).replace(',', '.')) : null,
        altura_cm: formData.altura_cm ? parseFloat(String(formData.altura_cm).replace(',', '.')) : null,
        objetivo_principal: formData.objetivo_principal || null,
        nivel_experiencia: formData.nivel_experiencia || null,
        profesion: formData.profesion || null,
        lesiones: formData.lesiones || null,
        genero: formData.genero || null,
        turno_id: formData.turno_id || null,
        dias_asistencia: formData.dias_asistencia || [],
      });

      if (error) {
        triggerHapticWarning();
        console.error("Action error:", error);
        toast.error("Error al actualizar", {
          description: error.message
        });
        return;
      }

      // Éxito: Feedback háptico "Clic mecánico"
      triggerHapticSoft();
      toast.success("Perfil actualizado con éxito");

      // Update local state with the saved data
      const selectedTurno = turnos.find(t => t.id === formData.turno_id);
      const updatedAlumno = { 
        ...formData, 
        turno: selectedTurno 
      };
      
      setAlumno(updatedAlumno);
      setIsEditing(null);
      setIsEditingShift(false);
    } catch (err: any) {
      triggerHapticWarning();
      console.error("Unexpected error:", err);
      toast.error("Error inesperado", {
        description: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-lg mx-auto pb-32">
      <PersonalDataCard alumno={alumno} onEdit={() => handleEdit("personal")} />
      
      <FitnessDataCard alumno={alumno} onEdit={() => handleEdit("fitness")} />

      <TeacherContactCard profesor={profesor} fechaInicio={alumno.fecha_inicio} />

      {/* CERRAR SESIÓN (Industrial Minimalist) */}
      <div className="pt-4 pb-10">
        <form action="/api/auth/signout" method="POST">
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl border border-white/5 bg-zinc-900/20 text-zinc-500 hover:text-white hover:bg-zinc-900/40 hover:border-white/10 transition-all active:scale-95 group"
          >
            <LogOut className="w-5 h-5 text-zinc-600 group-hover:text-fuchsia-400 transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {globalCopy.layout.alumnoNav.salir}
            </span>
          </button>
        </form>
        
        <div className="mt-8 flex flex-col items-center gap-1 opacity-20 group">
          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{globalCopy.brand.nameLine1}{globalCopy.brand.nameHighlight} CORE v1.32</p>
          <p className="text-[8px] font-medium text-zinc-600 uppercase tracking-[0.3em]">Build 2024.04.14</p>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ring-1 ring-white/5">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black tracking-tighter text-white uppercase">
                  {isEditing === "fitness" ? perfilCopy.editModal.titleFitness : perfilCopy.editModal.titlePersonal}
                </h3>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Actualizá tu información</span>
              </div>
              <button onClick={handleClose} className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {isEditing === "personal" ? (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{perfilCopy.personalData.phone}</label>
                    <input type="tel" name="telefono" value={formData.telefono || ""} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-bold focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none transition-all" placeholder="Ej: +54 9 11 1234-5678" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Fecha de Nacimiento</label>
                    <DatePickerAlumno 
                      date={formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento + 'T00:00:00') : null}
                      setDate={handleDateChange}
                      label="Fecha de Nacimiento"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{perfilCopy.personalData.gender}</label>
                    <select name="genero" value={formData.genero || ""} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-bold focus:border-fuchsia-500 outline-none appearance-none transition-all">
                      <option value="">{perfilCopy.personalData.unspecified}</option>
                      {perfilCopy.personalData.genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{perfilCopy.fitnessData.height}</label>
                      <input type="number" name="altura_cm" value={formData.altura_cm || ""} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-black focus:border-lime-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{perfilCopy.fitnessData.weight}</label>
                      <input type="number" step="0.1" name="peso_actual" value={formData.peso_actual || ""} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-black focus:border-lime-500 outline-none transition-all" />
                    </div>
                  </div>

                  {!isEditingShift ? (
                    <div className="bg-zinc-950/40 border border-white/5 rounded-[2rem] p-6 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-lime-400">
                           <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">{perfilCopy.editModal.currentShiftSummary}</p>
                          <p className="text-sm font-black text-white uppercase italic">
                            {turnos.find(t => t.id === formData.turno_id)?.nombre || perfilCopy.fitnessData.noShift}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                           <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{perfilCopy.fitnessData.days}</p>
                           <p className="text-[10px] font-bold text-lime-400 uppercase tracking-widest">
                             {perfilCopy.editModal.frequencyWarning.replace("{n}", String(maxDays))}
                           </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {perfilCopy.fitnessData.dayNames.map(day => {
                            const isSelected = (formData.dias_asistencia || []).includes(day.id);
                            return (
                              <div key={day.id} className={cn(
                                "px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all",
                                isSelected ? "bg-lime-400/10 border-lime-400/30 text-lime-400" : "bg-zinc-900/50 border-zinc-800 text-zinc-600 opacity-50"
                              )}>
                                {day.label.substring(0, 3)}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHapticSoft();
                          setIsEditingShift(true);
                        }}
                        className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                      >
                         {perfilCopy.editModal.changeShift}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{perfilCopy.fitnessData.shift}</label>
                          <span className="text-[9px] font-bold text-lime-400 uppercase tracking-[0.2em] bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">Desbloqueado</span>
                        </div>
                        {turnos.length > 0 ? (
                            <select 
                                name="turno_id" 
                                value={formData.turno_id || ""} 
                                onChange={handleChange} 
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-black focus:border-lime-500 outline-none transition-all"
                            >
                            <option value="">{perfilCopy.fitnessData.noShift}</option>
                            {turnos.map(t => {
                                const occupancy = occupancyMap[t.id] || 0;
                                const isFull = t.capacidad_max && occupancy >= t.capacidad_max;
                                // Si es su turno actual, no lo bloqueamos aunque esté lleno
                                const isCurrent = t.id === alumno.turno_id;
                                const disabled = isFull && !isCurrent;

                                return (
                                    <option key={t.id} value={t.id} disabled={disabled} className={disabled ? "text-fuchsia-500" : ""}>
                                        {t.nombre} ({t.hora_inicio} - {t.hora_fin}) {disabled ? perfilCopy.fitnessData.cuposAgotados : ""}
                                    </option>
                                );
                            })}
                            </select>
                        ) : (
                            <div className="bg-zinc-900 border border-dashed border-zinc-800 rounded-2xl p-5 text-center">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    {perfilCopy.fitnessData.noTurnos}
                                </p>
                            </div>
                        )}
                        {turnos.find(t => t.id === formData.turno_id && t.capacidad_max && (occupancyMap[t.id] || 0) >= t.capacidad_max) && (
                            <p className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest px-1 animate-pulse">
                                {perfilCopy.fitnessData.turnoFullMessage}
                            </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end px-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{perfilCopy.fitnessData.days}</label>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase">
                            {(formData.dias_asistencia || []).length} / {maxDays} seleccionado
                          </p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {perfilCopy.fitnessData.dayNames.map(day => (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => handleDayToggle(day.id)}
                                    className={cn(
                                        "py-4 rounded-xl border text-[10px] font-black transition-all",
                                        (formData.dias_asistencia || []).includes(day.id)
                                        ? "bg-lime-400 border-lime-400 text-black shadow-[0_5px_15px_rgba(163,230,53,0.3)]"
                                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                    )}
                                >
                                    {day.label.substring(0, 3).toUpperCase()}
                                </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{perfilCopy.fitnessData.objective}</label>
                    <select name="objetivo_principal" value={formData.objetivo_principal || ""} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-bold focus:border-lime-500 outline-none appearance-none transition-all">
                      <option value="" disabled>Seleccionar objetivo</option>
                      {perfilCopy.fitnessData.objectives.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{perfilCopy.fitnessData.experience}</label>
                    <select name="nivel_experiencia" value={formData.nivel_experiencia || ""} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-bold focus:border-lime-500 outline-none appearance-none transition-all">
                      <option value="" disabled>Seleccionar nivel</option>
                      {perfilCopy.fitnessData.experienceLevels.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{perfilCopy.fitnessData.profession}</label>
                    <input type="text" name="profesion" value={formData.profesion || ""} onChange={handleChange} placeholder="Ej: Ingeniero, Estudiante..." className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-bold focus:border-lime-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{perfilCopy.fitnessData.lesions}</label>
                    <textarea name="lesiones" value={formData.lesiones || ""} onChange={handleChange} placeholder="Describe cualquier lesión o limitación física..." rows={3} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-bold focus:border-lime-500 outline-none resize-none transition-all"></textarea>
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-8 border-t border-white/5 mt-8 pb-4">
                <button type="button" onClick={handleClose} disabled={isSubmitting} className="flex-1 px-8 py-5 rounded-3xl border border-zinc-800 text-zinc-500 font-black uppercase tracking-widest hover:bg-zinc-900 transition-all text-[10px]">
                  {perfilCopy.editModal.cancel}
                </button>
                <button type="submit" disabled={isSubmitting} className={cn(
                    "flex-1 font-black uppercase tracking-[0.2em] py-5 rounded-3xl transition-all shadow-xl active:scale-95 text-[10px]",
                    isEditing === 'fitness' ? 'bg-lime-400 text-black shadow-lime-500/10' : 'bg-fuchsia-500 text-white shadow-fuchsia-500/10',
                    isSubmitting && "opacity-50 pointer-events-none"
                )}>
                  {isSubmitting ? perfilCopy.editModal.saving : perfilCopy.editModal.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
