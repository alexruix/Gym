import React from 'react';
import { LogOut, Dumbbell, Clock } from 'lucide-react';
import { esperaCopy } from '@/data/es/alumno/espera';
import { useWaitingRoom } from '@/hooks/alumno/useWaitingRoom';

interface WaitingRoomContentProps {
  alumnoNombre: string;
}

export function WaitingRoomContent({ alumnoNombre }: WaitingRoomContentProps) {
  const { isChecking, handleCheckAgain } = useWaitingRoom();
  const primerNombre = alumnoNombre.split(' ')[0];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 flex flex-col relative font-sans overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-lime-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="flex justify-between items-center mb-12 relative z-10 w-full max-w-lg mx-auto">
        <div className="flex flex-col">
          <h1 className="industrial-title-xl">
            {esperaCopy.greetingPrefix}{" "}
            <span className="text-lime-500">{primerNombre}</span>
          </h1>
        </div>

        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="industrial-button-muted">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto relative z-10">
        <div className="industrial-card w-24 h-24 bg-zinc-900 border-zinc-800 flex items-center justify-center p-0 mb-8 relative animate-pulse group">
          <div className="absolute inset-0 border-2 border-lime-500/50 rounded-[2.5rem] animate-[spin_4s_linear_infinite]"></div>
          <Clock className="w-10 h-10 text-lime-400 opacity-80" />
        </div>

        <h2 className="industrial-title-xl text-center mb-4">
          {esperaCopy.title}
        </h2>

        <p className="industrial-description text-center mb-12 max-w-[280px]">
          {esperaCopy.description}
        </p>

        <button
          onClick={handleCheckAgain}
          disabled={isChecking}
          className={`w-full bg-white hover:bg-zinc-200 text-black industrial-label py-5 rounded-3xl flex items-center justify-center gap-3 transition-colors active:scale-95 text-base ${
            isChecking ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Dumbbell className={`w-5 h-5 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Consultando..." : esperaCopy.actions.reload}
        </button>

        <p className="industrial-metadata mt-8 text-center px-4">
          {esperaCopy.metadata}
        </p>
      </main>
    </div>
  );
}
