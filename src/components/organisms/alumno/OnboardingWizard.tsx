import React, { useState } from "react";
import { actions } from "astro:actions";
import { ChevronRight, ChevronLeft, Check, TrendingUp, Activity, UserCircle } from "lucide-react";
import { onboardingCopy } from "@/data/es/alumno/onboarding";

export function StudentOnboardingWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    peso_actual: "",
    altura_cm: "",
    fecha_nacimiento: "",
    objetivo_principal: "",
    nivel_experiencia: "",
    profesion: "",
    lesiones: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { error: actionError } = await actions.alumno.updateStudentProfile({
        peso_actual: formData.peso_actual ? parseFloat(formData.peso_actual.replace(',', '.')) : null,
        altura_cm: formData.altura_cm ? parseFloat(formData.altura_cm.replace(',', '.')) : null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        objetivo_principal: formData.objetivo_principal || null,
        nivel_experiencia: formData.nivel_experiencia || null,
        profesion: formData.profesion || null,
        lesiones: formData.lesiones || null,
      });

      if (actionError) {
         setError(actionError.message);
         setIsSubmitting(false);
         return;
      }

      window.location.href = "/alumno"; // Redirect to dashboard
    } catch (err: any) {
      setError(err.message || "Error al guardar el perfil");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Indicador de pasos */}
      <div className="flex gap-2 mb-10 w-full">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ease-in-out ${
              step >= i ? "bg-lime-500 shadow-[0_0_10px_rgba(163,230,53,0.5)]" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className="mb-10 text-center">
        <h2 className="industrial-title-xl tracking-tighter mb-2">{onboardingCopy.title}</h2>
        <p className="industrial-description">{onboardingCopy.subtitle}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold text-center">
          {error}
        </div>
      )}

      <div className="relative min-h-[300px]">
        {/* Paso 1: Físico */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 text-lime-400 mb-6">
              <Activity className="w-6 h-6" />
              <h3 className="text-xl font-bold tracking-tight uppercase">{onboardingCopy.steps.physical.title}</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{onboardingCopy.steps.physical.weight}</label>
                  <input
                    type="number"
                    name="peso_actual"
                    value={formData.peso_actual}
                    onChange={handleChange}
                    placeholder={onboardingCopy.steps.physical.weightPlaceholder}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{onboardingCopy.steps.physical.height}</label>
                  <input
                    type="number"
                    name="altura_cm"
                    value={formData.altura_cm}
                    onChange={handleChange}
                    placeholder={onboardingCopy.steps.physical.heightPlaceholder}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{onboardingCopy.steps.physical.birthdate}</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Técnico */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 text-fuchsia-400 mb-6">
              <TrendingUp className="w-6 h-6" />
              <h3 className="text-xl font-bold tracking-tight uppercase">{onboardingCopy.steps.technical.title}</h3>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{onboardingCopy.steps.technical.objective}</label>
                <select
                  name="objetivo_principal"
                  value={formData.objetivo_principal}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all appearance-none"
                >
                  <option value="" disabled className="text-zinc-500">{onboardingCopy.steps.technical.objectivePlaceholder}</option>
                  <option value="Pérdida de peso">Pérdida de peso</option>
                  <option value="Ganancia muscular">Ganancia muscular</option>
                  <option value="Recomposición Corporal">Recomposición Corporal</option>
                  <option value="Mejora de rendimiento">Mejora de rendimiento / Atleta</option>
                  <option value="Salud general">Salud general / Mantenimiento</option>
                </select>
              </div>

               <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{onboardingCopy.steps.technical.experience}</label>
                <select
                  name="nivel_experiencia"
                  value={formData.nivel_experiencia}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all appearance-none"
                >
                  <option value="" disabled className="text-zinc-500">{onboardingCopy.steps.technical.experiencePlaceholder}</option>
                  <option value="Principiante">Principiante (0-6 meses)</option>
                  <option value="Intermedio">Intermedio (6m - 2 años)</option>
                  <option value="Avanzado">Avanzado (+2 años fuertes)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{onboardingCopy.steps.technical.profession}</label>
                <input
                  type="text"
                  name="profesion"
                  value={formData.profesion}
                  onChange={handleChange}
                  placeholder={onboardingCopy.steps.technical.professionPlaceholder}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Médico/Limitaciones */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 text-amber-400 mb-6">
              <UserCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold tracking-tight uppercase">{onboardingCopy.steps.medical.title}</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{onboardingCopy.steps.medical.lesions}</label>
                <textarea
                  name="lesiones"
                  value={formData.lesiones}
                  onChange={handleChange}
                  placeholder={onboardingCopy.steps.medical.lesionsPlaceholder}
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all resize-none"
                ></textarea>
                <p className="text-xs text-zinc-500 px-2">{onboardingCopy.steps.medical.lesionsHelp}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex gap-4 pt-6 border-t border-white/5">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="px-6 py-4 rounded-2xl border border-zinc-800 bg-zinc-900 text-white font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="flex-1 bg-white hover:bg-zinc-200 text-black py-4 px-6 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
          >
            {onboardingCopy.actions.next} <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 bg-lime-500 hover:bg-lime-400 text-black py-4 px-6 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] active:scale-95 ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? (
               <><span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span> {onboardingCopy.actions.submitting}</>
            ) : (
               <><Check className="w-5 h-5" /> {onboardingCopy.actions.submit}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
