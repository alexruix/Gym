import React, { useState } from "react";
import { actions } from "astro:actions";
import { planesCopy } from "@/data/es/profesor/planes";
import { globalCopy } from "@/data/es/global";
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Dumbbell, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { StepIndicator } from "@/components/molecules/StepIndicator";
import type { PlanFormData } from "@/lib/validators";

const steps = ["Información", "Ejercicios", "Revisión", "Finalizado"];

export const PlanForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PlanFormData>({
    nombre: "",
    duracion_semanas: 4,
    ejercicios: [{ nombre: "", series: 3, reps: 10, descanso_seg: 60 }]
  });

  const updateField = (field: keyof PlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const newExercises = [...formData.ejercicios];
    newExercises[index] = { ...newExercises[index], [field]: value };
    updateField("ejercicios", newExercises);
  };

  const addExercise = () => {
    updateField("ejercicios", [
      ...formData.ejercicios, 
      { nombre: "", series: 3, reps: 10, descanso_seg: 60 }
    ]);
  };

  const removeExercise = (index: number) => {
    if (formData.ejercicios.length > 1) {
      const newExercises = formData.ejercicios.filter((_, i) => i !== index);
      updateField("ejercicios", newExercises);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await actions.profesor.createPlan(formData);
      
      if (result.error) {
        setError(result.error.message || globalCopy.errors.unexpected);
      } else {
        setStep(4);
      }
    } catch (err: any) {
      setError(err.message || globalCopy.errors.unexpected);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <StepIndicator currentStep={step} totalSteps={4} stepsNames={steps} />

      <div className="mt-12">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{planesCopy.create.step1.title}</Label>
              <Input 
                value={formData.nombre} 
                onChange={e => updateField("nombre", e.target.value)}
                placeholder={planesCopy.create.step1.placeholderName}
                className="h-14 text-lg font-bold rounded-2xl border-zinc-200 focus:border-zinc-950 focus:ring-0 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{planesCopy.create.step1.durationLabel}</Label>
              <Input 
                type="number"
                value={formData.duracion_semanas} 
                onChange={e => updateField("duracion_semanas", parseInt(e.target.value))}
                className="h-14 text-lg font-bold rounded-2xl border-zinc-200"
              />
            </div>
            <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.nombre}
                className="w-full h-16 rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-widest hover:bg-zinc-800"
            >
              {globalCopy.actions.continue} <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight italic">{planesCopy.create.step2.title}</h2>
                <Button variant="outline" size="sm" onClick={addExercise} className="rounded-xl border-zinc-200 font-bold uppercase text-[10px] tracking-widest">
                    <Plus className="w-4 h-4 mr-1 text-lime-500" /> {globalCopy.actions.add}
                </Button>
            </div>

            <div className="space-y-4">
              {formData.ejercicios.map((ex, idx) => (
                <Card key={idx} className="p-4 rounded-3xl border-zinc-200 shadow-sm relative group overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="mt-2 w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-400">
                        <Dumbbell className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <Input 
                            value={ex.nombre}
                            onChange={e => updateExercise(idx, "nombre", e.target.value)}
                            placeholder={planesCopy.create.step2.placeholderExercise}
                            className="border-none p-0 h-auto text-lg font-bold focus-visible:ring-0 placeholder:text-zinc-300"
                        />
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase">{planesCopy.create.step2.seriesLabel}</Label>
                                <input 
                                    type="number" 
                                    value={ex.series}
                                    onChange={e => updateExercise(idx, "series", parseInt(e.target.value))}
                                    className="w-12 bg-transparent font-bold text-sm focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase">{planesCopy.create.step2.repsLabel}</Label>
                                <input 
                                    type="number" 
                                    value={ex.reps}
                                    onChange={e => updateExercise(idx, "reps", parseInt(e.target.value))}
                                    className="w-12 bg-transparent font-bold text-sm focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-zinc-300" />
                                <input 
                                    type="number" 
                                    value={ex.descanso_seg}
                                    onChange={e => updateExercise(idx, "descanso_seg", parseInt(e.target.value))}
                                    className="w-12 bg-transparent font-bold text-xs text-zinc-400 focus:outline-none"
                                />
                                <span className="text-[10px] font-bold text-zinc-300 uppercase">{planesCopy.create.step2.restUnit}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => removeExercise(idx)} 
                        className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="h-16 flex-1 rounded-2xl border-zinc-200 font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950">
                    <ChevronLeft className="mr-2 w-5 h-5" /> {globalCopy.actions.back}
                </Button>
                <Button onClick={() => setStep(3)} className="h-16 flex-[2] rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-widest hover:bg-zinc-800 shadow-xl shadow-zinc-200">
                    {planesCopy.create.step2.reviewButton} <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">{planesCopy.create.step3.title}</h2>
                <p className="text-zinc-500 font-bold">{planesCopy.create.step3.subtitle}</p>
            </div>

            <Card className="rounded-3xl border-zinc-200 overflow-hidden shadow-sm">
                <div className="bg-zinc-950 p-6 text-white flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-lime-400 mb-1">{planesCopy.create.step3.planLabel}</p>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">{formData.nombre}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{planesCopy.create.step1.durationLabel}</p>
                        <p className="text-lg font-black">{formData.duracion_semanas} <span className="text-xs">{planesCopy.create.step3.durationBadge}</span></p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {formData.ejercicios.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between pb-3 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div>
                                <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight">{ex.nombre}</p>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{ex.series} series x {ex.reps} reps</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-400 uppercase">{planesCopy.create.step2.restLabel}</p>
                                <p className="text-xs font-bold">{ex.descanso_seg}s</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                </div>
            )}

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="h-16 flex-1 rounded-2xl border-zinc-200 font-black uppercase tracking-widest text-zinc-400">
                    {globalCopy.actions.edit}
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="h-16 flex-[2] rounded-2xl bg-lime-400 text-zinc-950 font-black uppercase tracking-widest hover:bg-lime-500 shadow-xl shadow-lime-100 disabled:opacity-50"
                >
                    {isSubmitting ? globalCopy.actions.saving : planesCopy.create.step3.confirmButton}
                </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-12 space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-lime-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 rotate-12 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-lime-600 -rotate-12" />
            </div>
            <div className="space-y-2">
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{planesCopy.create.step4.title}</h2>
                <p className="text-zinc-500 font-bold max-w-xs mx-auto text-lg leading-tight">{planesCopy.create.step4.subtitle}</p>
            </div>
            <div className="pt-6 space-y-3">
                <Button onClick={() => window.location.href = "/profesor/planes"} className="w-full h-16 rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-widest shadow-xl">
                    {planesCopy.create.step4.dashboardButton}
                </Button>
                <Button onClick={() => setStep(1)} variant="outline" className="w-full h-14 rounded-2xl border-zinc-200 text-zinc-500 font-bold uppercase tracking-widest">
                    Crear otro plan
                </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PlanForm.displayName = "PlanForm";
