import React, { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Zap, Target, BookHeart, Calendar, ChevronRight, Link } from "lucide-react";
import { cn } from "@/lib/utils";

const DIAS_SEMANA = [
    { value: "Lunes", label: "L" },
    { value: "Martes", label: "M" },
    { value: "Miércoles", label: "X" },
    { value: "Jueves", label: "J" },
    { value: "Viernes", label: "V" },
    { value: "Sábado", label: "S" },
    { value: "Domingo", label: "D" },
];

export function StudentOnboarding({ nombreAlumno }: { nombreAlumno: string }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [pesoActual, setPesoActual] = useState("");
    const [objetivo, setObjetivo] = useState("");
    const [lesiones, setLesiones] = useState("");
    const [dias, setDias] = useState<string[]>([]);

    const handleDiasToggle = (dia: string) => {
        setDias(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
    };

    const handleNext = () => {
        if (step === 1 && !pesoActual) {
            toast.error("Por favor, ingresá tu peso actual.");
            return;
        }
        if (step === 2 && !objetivo) {
            toast.error("Contanos tu objetivo para avanzar.");
            return;
        }
        if (step === 3 && dias.length === 0) {
            toast.error("Seleccioná al menos un día para entrenar.");
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("peso_actual", pesoActual);
            formData.append("objetivo_principal", objetivo);
            dias.forEach(d => formData.append("dias_asistencia", d));
            if (lesiones) formData.append("lesiones", lesiones); // Make it optional

            const { data, error } = await actions.alumno.activarPerfilTecnico(formData);

            if (error) {
                toast.error(error.message || "Ocurrió un error.");
            } else {
                toast.success(data.message || "Perfil configurado.");
                // Reload to exit onboarding state
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (e: any) {
            toast.error("Error al guardar: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col z-[100] font-sans antialiased overflow-y-auto">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-grid-alumno opacity-50"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen px-6 py-12 lg:px-8 max-w-lg mx-auto w-full">
                
                {/* Header Sequence */}
                <div className="mb-12">
                    <p className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mb-2">Activación de Perfil</p>
                    <h1 className="text-3xl font-black uppercase tracking-tight leading-none mb-4">
                        Bienvenido,<br/>{nombreAlumno.split(' ')[0]}
                    </h1>
                    <p className="text-zinc-400 font-medium">Danos unos datos clave para calibrar tu HUD de rendimiento.</p>
                </div>

                {/* STEPS CONTAINER */}
                <div className="flex-1 flex flex-col justify-center mb-12">
                    
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-lime-400" />
                                </div>
                                <h2 className="text-xl font-bold">¿Cúal es tu peso hoy?</h2>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number"
                                    value={pesoActual}
                                    onChange={(e) => setPesoActual(e.target.value)}
                                    placeholder="Ej: 75.5"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl py-6 px-8 text-4xl font-black tracking-tighter text-white placeholder:text-zinc-700 outline-none focus:border-lime-500 transition-colors"
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-500">Kg</span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
                                    <Link className="w-5 h-5 text-lime-400" />
                                </div>
                                <h2 className="text-xl font-bold">Objetivo Principal</h2>
                            </div>
                            <div className="space-y-3">
                                {["Hipertrofia", "Fuerza Maxima", "Recomposición", "Rendimiento"].map((obj) => (
                                    <button
                                        key={obj}
                                        onClick={() => setObjetivo(obj)}
                                        className={cn(
                                            "w-full px-6 py-5 rounded-3xl border text-left font-bold transition-all",
                                            objetivo === obj 
                                                ? "bg-lime-500 border-lime-400 text-black shadow-lg shadow-lime-500/20" 
                                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                        )}
                                    >
                                        {obj}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-lime-400" />
                                </div>
                                <h2 className="text-xl font-bold">Disponibilidad</h2>
                            </div>
                            <p className="text-sm text-zinc-500 mb-6">¿Qué días vas a entrenar?</p>
                            
                            <div className="flex gap-2 justify-between">
                                {DIAS_SEMANA.map((d) => {
                                    const isSelected = dias.includes(d.value);
                                    return (
                                        <button
                                            key={d.value}
                                            onClick={() => handleDiasToggle(d.value)}
                                            className={cn(
                                                "flex-1 aspect-square rounded-2xl flex items-center justify-center font-black text-lg transition-all",
                                                isSelected 
                                                    ? "bg-lime-500 text-black shadow-lg shadow-lime-500/20 scale-105" 
                                                    : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800"
                                            )}
                                        >
                                            {d.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
                                    <BookHeart className="w-5 h-5 text-lime-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Limitaciones / Lesiones</h2>
                                </div>
                            </div>
                            <p className="text-sm text-zinc-500 mb-6 font-medium">Contanos si tenés alguna lesión, molestia o limitación. Si no, dejalo en blanco.</p>
                            <textarea
                                value={lesiones}
                                onChange={(e) => setLesiones(e.target.value)}
                                placeholder="Ej: Dolor en manguito rotador derecho al hacer press militar..."
                                className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white placeholder:text-zinc-700 outline-none focus:border-lime-500 transition-all resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* BOTTOM NAVIGATION */}
                <div className="mt-auto flex gap-4 pt-6 border-t border-white/5">
                    {step > 1 && (
                        <Button 
                            variant="outline"
                            onClick={() => setStep(prev => prev - 1)}
                            className="h-16 px-8 rounded-[2rem] border-zinc-800 text-white font-bold bg-zinc-950"
                        >
                            Atrás
                        </Button>
                    )}
                    
                    {step < 4 ? (
                        <Button 
                            onClick={handleNext}
                            className="flex-1 h-16 rounded-[2rem] font-black text-lg uppercase tracking-widest bg-lime-500 text-black hover:bg-lime-600 transition-all shadow-xl shadow-lime-500/20 gap-2"
                        >
                            Continuar <ChevronRight className="w-6 h-6" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 h-16 rounded-[2rem] font-black text-lg uppercase tracking-widest bg-lime-500 text-black hover:bg-lime-600 transition-all shadow-xl shadow-lime-500/20 gap-2"
                        >
                            {isLoading ? "Configurando..." : "Activar Mi Perfil"}
                        </Button>
                    )}
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    {[1, 2, 3, 4].map(i => (
                        <div 
                            key={i} 
                            className={cn(
                                "h-1 rounded-full transition-all duration-300",
                                i === step ? "w-8 bg-lime-500" : "w-2 bg-zinc-800"
                            )} 
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
