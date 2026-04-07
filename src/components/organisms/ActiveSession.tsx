import React, { useState, useEffect } from 'react';
import { actions } from 'astro:actions';
import { MessageSquare, CheckCircle, Timer } from 'lucide-react';

export function ActiveSession({ sesionBase, sessionId, alumnoId }) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [comments, setComments] = useState({});
  const [completedExercises, setCompletedExercises] = useState({});
  const [isCommenting, setIsCommenting] = useState(null); // id del ejercicio
  const [isFinishing, setIsFinishing] = useState(false);
  const [globalNota, setGlobalNota] = useState("");

  // Timer State
  const [activeTimerObj, setActiveTimerObj] = useState(null); // { id: string, secondsLeft: number }

  useEffect(() => {
    let interval = null;
    if (activeTimerObj?.secondsLeft > 0) {
      interval = setInterval(() => {
        setActiveTimerObj((prev) => ({ ...prev, secondsLeft: prev.secondsLeft - 1 }));
      }, 1000);
    } else if (activeTimerObj?.secondsLeft === 0) {
      clearInterval(interval);
      // Podríamos reproducir un sonido de "Fin del descanso" aquí
    }
    return () => clearInterval(interval);
  }, [activeTimerObj]);

  const startTimer = (ejId, seconds) => {
    setActiveTimerObj({ id: ejId, secondsLeft: seconds });
  };

  const markExerciseDone = async (ejId) => {
    setCompletedExercises({ ...completedExercises, [ejId]: true });

    // Auto-avanzar al siguiente ejercicio si no es el último
    if (activeExerciseIndex < sesionBase.length - 1) {
      setTimeout(() => {
        setActiveExerciseIndex(activeExerciseIndex + 1);
      }, 500); // Pequeña demora para la animación visual
    } else {
      setTimeout(() => {
        setActiveExerciseIndex(activeExerciseIndex + 1); // Desencadena fin de sesión
      }, 500);
    }

    // Optional: play sound or animation here (Dopamine hit)
  };

  const submitComment = async (ejId) => {
    const nota = comments[ejId];
    if (!nota) {
      setIsCommenting(null);
      return;
    }

    try {
      await actions.alumno.commentExercise({
        alumno_id: alumnoId,
        ejercicio_id: ejId,
        sesion_id: sessionId,
        nota_alumno: nota,
      });
      // Optionally show a toast
      setIsCommenting(null);
    } catch (e) {
      console.error(e);
      alert("Error guardando nota");
    }
  };

  const handleCompleteSession = async () => {
    setIsFinishing(true);
    try {
      // Usa la nueva action del Calendario Operativo Real
      // El sessionId puede ser un UUID de sesiones_instanciadas
      await actions.alumno.completarSesionInstanciada({
        sesion_id: sessionId,
        notas_alumno: globalNota || undefined,
      });
      window.location.href = "/alumno";
    } catch (e) {
      // Fallback a la action legacy si falla la nueva
      try {
        await actions.alumno.completeSession({
          sesion_id: sessionId,
          notas_alumno: globalNota
        });
        window.location.href = "/alumno";
      } catch (e2) {
        console.error(e2);
        alert("Error cerrando sesión");
        setIsFinishing(false);
      }
    }
  };

  // Helper para formatear tiempo
  const formatTime = (totalSeconds) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto w-full pb-32 font-sans">
      {/* Timeline view */}
      {sesionBase && sesionBase.length > 0 ? sesionBase.map((ej, idx) => {
        const isActive = idx === activeExerciseIndex;
        const isDone = !!completedExercises[ej.ejercicio_id];
        const isPast = idx < activeExerciseIndex || isDone;

        return (
          <div
            key={ej.ejercicio_id}
            className={`rounded-2xl border bg-zinc-900/60 backdrop-blur-md transition-all duration-300 ${isActive ? 'border-lime-500 shadow-[0_0_15px_rgba(163,230,53,0.15)] ring-1 ring-lime-500' : 'border-zinc-800'
              } overflow-hidden`}
          >
            {/* Cabecera del Ejercicio */}
            <div
              className={`p-5 flex gap-4 ${isDone ? 'opacity-50' : ''} cursor-pointer hover:bg-white/5 transition-colors`}
              onClick={() => setActiveExerciseIndex(idx)}
            >
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl transition-all ${isDone ? 'bg-lime-500 text-black scale-95' : isActive ? 'bg-lime-500 text-black' : 'bg-zinc-800 text-white'
                  }`}>
                  {isDone ? <CheckCircle className="w-6 h-6" /> : idx + 1}
                </div>
              </div>

              <div className="flex-1">
                <h3 className={`text-xl font-bold tracking-tight ${isDone ? 'line-through text-zinc-500' : 'text-white'}`}>
                  {ej.biblioteca_ejercicios?.nombre || 'Ejercicio'}
                </h3>
                <p className={`text-sm mt-1 font-medium ${isDone ? 'text-zinc-600' : 'text-lime-400'}`}>
                  {ej.series} Series Ã— {ej.reps_target}
                </p>

                {ej.is_variation && !isDone && (
                  <span className="inline-block mt-3 px-2 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold tracking-widest rounded uppercase">
                    Rotación Semanal
                  </span>
                )}
              </div>

              {/* Botón rápido de Comentar */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsCommenting(isCommenting === ej.ejercicio_id ? null : ej.ejercicio_id); }}
                className={`p-3 self-start rounded-full transition-colors ${comments[ej.ejercicio_id] ? 'bg-fuchsia-500 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'}`}
                title="Anotar feedback"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>

            {/* Expansión del Ejercicio Activo */}
            {isActive && !isDone && (
              <div className="px-5 pb-5 pl-20 animate-in slide-in-from-top-4 duration-300">
                {/* Zona de Feedback Inline */}
                {isCommenting === ej.ejercicio_id && (
                  <div className="mb-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Ajuste o Nota sobre el peso</label>
                    <textarea
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-lime-50 placeholder:text-zinc-600 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none resize-none"
                      rows={2}
                      placeholder="Ej: Bajé a 10kg por dolor en hombro"
                      value={comments[ej.ejercicio_id] || ''}
                      onChange={(e) => setComments({ ...comments, [ej.ejercicio_id]: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-3">
                      <button onClick={() => setIsCommenting(null)} className="text-xs font-bold text-zinc-500 hover:text-white">CANCELAR</button>
                      <button onClick={() => submitComment(ej.ejercicio_id)} className="bg-white hover:bg-lime-500 text-black text-xs font-bold px-4 py-2 uppercase tracking-wide rounded-md transition-colors">Guardar Nota</button>
                    </div>
                  </div>
                )}

                {/* Acciones principales: Timer y Completar */}
                <div className="flex gap-3">
                  {ej.descanso_seg > 0 && (
                    <button
                      onClick={() => startTimer(ej.ejercicio_id, ej.descanso_seg)}
                      className={`flex items-center gap-2 px-4 py-4 rounded-xl border ${activeTimerObj?.id === ej.ejercicio_id && activeTimerObj?.secondsLeft > 0 ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300' : 'bg-black border-zinc-800 text-zinc-400'}`}
                    >
                      <Timer className="w-5 h-5" />
                      <span className="font-bold tabular-nums text-lg">
                        {activeTimerObj?.id === ej.ejercicio_id && activeTimerObj?.secondsLeft >= 0
                          ? formatTime(activeTimerObj.secondsLeft)
                          : formatTime(ej.descanso_seg)}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => markExerciseDone(ej.ejercicio_id)}
                    className="flex-1 bg-lime-500 hover:bg-lime-500 text-black font-bold uppercase tracking-widest text-lg rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(163,230,53,0.39)] hover:shadow-[0_6px_20px_rgba(163,230,53,0.23)] transition-all active:scale-95"
                  >
                    âœ” Marcar Listo
                  </button>
                </div>

                {activeTimerObj?.id === ej.ejercicio_id && activeTimerObj?.secondsLeft === 0 && (
                  <p className="text-fuchsia-400 font-bold text-xs mt-3 uppercase tracking-widest text-center animate-pulse">¡Fin del descanso! Listo para la próxima.</p>
                )}
              </div>
            )}
          </div>
        );
      }) : (
        <div className="text-center text-zinc-500 p-10 border border-zinc-800 border-dashed rounded-3xl">
          <p>No hay rutina programada para hoy.</p>
        </div>
      )}

      {/* Botón Finalizar Sesión */}
      {(activeExerciseIndex >= sesionBase.length && sesionBase.length > 0) && (
        <div className="p-8 rounded-[2rem] border-2 border-lime-500 bg-lime-500/10 text-center animate-in zoom-in slide-in-from-bottom-8 duration-500 backdrop-blur-xl">
          <div className="w-20 h-20 bg-lime-500 rounded-full flex items-center justify-center mx-auto mb-6 text-black">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tighter mb-2">¡LO LOGRASTE!</h2>
          <p className="text-lime-200/60 font-medium mb-8">Todos los ejercicios completados.</p>

          <div className="text-left mb-8">
            <label className="text-xs font-bold text-lime-400 uppercase tracking-widest mb-3 block pl-2">Feedback de la jornada (Opcional)</label>
            <textarea
              className="w-full bg-black/50 border border-lime-500/30 rounded-2xl p-5 text-white placeholder:text-zinc-600 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none resize-none"
              rows={3}
              placeholder="¿Qué tal estuvo la energía hoy?"
              value={globalNota}
              onChange={e => setGlobalNota(e.target.value)}
            ></textarea>
          </div>

          <button
            disabled={isFinishing}
            onClick={handleCompleteSession}
            className="w-full bg-lime-500 text-black text-xl font-bold uppercase tracking-widest py-5 rounded-2xl hover:bg-lime-500 active:scale-95 transition-all shadow-[0_0_40px_rgba(163,230,53,0.4)] disabled:opacity-50"
          >
            {isFinishing ? 'CERRANDO...' : 'CERRAR SESIÓN'}
          </button>
        </div>
      )}
    </div>
  );
}
