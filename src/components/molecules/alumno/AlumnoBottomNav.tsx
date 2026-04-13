import React from "react";
import { Home, User, TrendingUp } from "lucide-react";

interface AlumnoBottomNavProps {
  currentPath: string;
}

export function AlumnoBottomNav({ currentPath }: AlumnoBottomNavProps) {
  const isHome = currentPath === "/alumno" || currentPath === "/alumno/";
  const isRendimiento = currentPath.startsWith("/alumno/progreso");
  const isPerfil = currentPath.startsWith("/alumno/perfil");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none">
      <div className="max-w-sm mx-auto bg-zinc-950/90 backdrop-blur-2xl border border-white/5 rounded-full p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto ring-1 ring-white/5">
        
        <a
          href="/alumno"
          className={`flex-1 flex flex-col items-center justify-center p-3 rounded-full transition-all duration-500 scale-95 hover:scale-100 ${
            isHome
              ? "bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.3)]"
              : "text-zinc-500 hover:text-white hover:bg-white/5 active:scale-90"
          }`}
          aria-current={isHome ? "page" : undefined}
        >
          <Home className="w-5 h-5" />
        </a>

        <a
          href="/alumno/progreso"
          className={`flex-1 flex flex-col items-center justify-center p-3 rounded-full transition-all duration-500 scale-95 hover:scale-100 ${
            isRendimiento
              ? "bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.3)]"
              : "text-zinc-500 hover:text-white hover:bg-white/5 active:scale-90"
          }`}
          aria-current={isRendimiento ? "page" : undefined}
        >
          <TrendingUp className="w-5 h-5" />
        </a>

        <a
          href="/alumno/perfil"
          className={`flex-1 flex flex-col items-center justify-center p-3 rounded-full transition-all duration-500 scale-95 hover:scale-100 ${
            isPerfil
              ? "bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.3)]"
              : "text-zinc-500 hover:text-white hover:bg-white/5 active:scale-90"
          }`}
          aria-current={isPerfil ? "page" : undefined}
        >
          <User className="w-5 h-5" />
        </a>

      </div>
    </nav>
  );
}
