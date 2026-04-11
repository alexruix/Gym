import React from 'react';
import { useActiveSession, type ExerciseBase } from '@/hooks/alumno/useActiveSession';
import { ActiveExerciseCard } from '@/components/organisms/alumno/ActiveExerciseCard';
import { CompletionOverlay } from '@/components/organisms/alumno/CompletionOverlay';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { sesionStrings } from '@/data/es/alumno/sesion';

interface ActiveSessionProps {
  sesionBase: ExerciseBase[];
  sessionId: string;
  alumnoId: string;
  semanaActual: number;
}

/**
 * ActiveSession V2.6
 * Componente orquestador refactorizado con Atomic Design.
 * No hardcoding, lógica en hooks, persistencia resiliente.
 */
export function ActiveSession({ sesionBase, sessionId, alumnoId, semanaActual }: ActiveSessionProps) {
  const { state, actions } = useActiveSession({
    sessionId,
    alumnoId,
    semanaActual,
    sesionBase
  });

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto w-full pb-40 px-2 animate-in fade-in duration-1000">
      
      {/* HEADER TÉCNICO DE VERSIÓN */}
      <div className="flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex gap-4 items-center">
            <div className="h-[1px] w-8 bg-zinc-800" />
            <TechnicalLabel>{sesionStrings.activeSession.version}</TechnicalLabel>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            <TechnicalLabel className="text-lime-400">{sesionStrings.activeSession.sync}</TechnicalLabel>
        </div>
      </div>

      <div className="space-y-6">
        {sesionBase.map((ej, idx) => {
          const isActive = idx === state.activeExerciseIndex;
          const isDone = !!state.completedExercises[ej.sesion_ejercicio_id] || ej.completado;
          const currentWeight = state.realWeights[ej.sesion_ejercicio_id] || String(ej.peso_plan);

          return (
            <ActiveExerciseCard
              key={ej.sesion_ejercicio_id}
              ej={ej}
              index={idx}
              isActive={isActive}
              isDone={isDone}
              currentWeight={currentWeight}
              rpe={state.rpeValues[ej.sesion_ejercicio_id] || null}
              comment={state.comments[ej.sesion_ejercicio_id] || ""}
              secondsLeft={state.activeTimer?.id === ej.sesion_ejercicio_id ? state.activeTimer.secondsLeft : undefined}
              isTimerActive={state.activeTimer?.id === ej.sesion_ejercicio_id}
              isSyncing={state.isSyncing[ej.sesion_ejercicio_id] || false}
              onWeightChange={(val) => actions.setRealWeights(prev => ({ ...prev, [ej.sesion_ejercicio_id]: val }))}
              onRpeChange={(val) => actions.setRpeValues(prev => ({ ...prev, [ej.sesion_ejercicio_id]: val }))}
              onCommentChange={(val) => actions.setComments(prev => ({ ...prev, [ej.sesion_ejercicio_id]: val }))}
              onMarkDone={() => actions.markExerciseDone(idx)}
              onStartTimer={() => actions.startTimer(ej.sesion_ejercicio_id, ej.descanso_seg || 60)}
              onActivate={() => actions.setActiveExerciseIndex(idx)}
            />
          );
        })}
      </div>

      {/* OVERLAY DE FINALIZACIÓN */}
      {state.activeExerciseIndex >= sesionBase.length && sesionBase.length > 0 && (
        <CompletionOverlay 
          isFinishing={state.isFinishing}
          globalNota={state.globalNota}
          onNotaChange={actions.setGlobalNota}
          onFinish={actions.finishSession}
        />
      )}
    </div>
  );
}
