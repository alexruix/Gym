import React, { useState } from "react";
import { Plus, UserPlus, FilePlus, DollarSign, X } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";

export function QuickActionFab() {
  const [isOpen, setIsOpen] = useState(false);
  const c = dashboardCopy.fab;

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden flex flex-col items-end gap-3">
      {/* Opciones (Slide in) */}
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <a
          href="/profesor/alumnos/new"
          className="flex items-center gap-3 bg-white pr-4 pl-3 py-3 rounded-full shadow-lg border border-zinc-100 text-zinc-700 font-bold active:scale-95 transition-transform"
        >
          <div className="bg-purple-100 p-1.5 rounded-full text-purple-600">
            <UserPlus className="w-4 h-4" />
          </div>
          {c.newStudent}
        </a>
        
        <a
          href="/profesor/planes/new"
          className="flex items-center gap-3 bg-white pr-4 pl-3 py-3 rounded-full shadow-lg border border-zinc-100 text-zinc-700 font-bold active:scale-95 transition-transform"
        >
          <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
            <FilePlus className="w-4 h-4" />
          </div>
          {c.createPlan}
        </a>

        <button
          onClick={() => {
            // ImplementaciÃ³n futura: modal de pago
            setIsOpen(false);
          }}
          className="flex items-center gap-3 bg-white pr-4 pl-3 py-3 rounded-full shadow-lg border border-zinc-100 text-zinc-700 font-bold active:scale-95 transition-transform"
        >
          <div className="bg-lime-100 p-1.5 rounded-full text-lime-600">
            <DollarSign className="w-4 h-4" />
          </div>
          {c.registerPayment}
        </button>
      </div>

      {/* BotÃ³n Principal FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
          isOpen 
            ? "bg-zinc-900 text-white rotate-45 shadow-zinc-900/20" 
            : "bg-lime-400 text-zinc-950 shadow-lime-500/30 glow-accent"
        }`}
        aria-label={isOpen ? "Cerrar menÃº de acciones" : "Abrir menÃº de acciones rÃ¡pidas"}
        aria-expanded={isOpen}
      >
        <Plus className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Backdrop overlay para oscurecer el fondo cuando estÃ¡ abierto */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-[-1] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
