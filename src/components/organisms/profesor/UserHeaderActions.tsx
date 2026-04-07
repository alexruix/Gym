import * as React from "react";
import { Bell, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { globalCopy } from "@/data/es/global";

export function UserHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-3 text-zinc-400 hover:text-zinc-900 transition-colors relative group rounded-2xl hover:bg-zinc-100"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-lime-500 rounded-full border-2 border-white shadow-sm ring-lime-400/30 group-hover:ring-4 transition-all"></span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-zinc-200 shadow-2xl">
          <DropdownMenuLabel className="px-5 py-4 font-bold uppercase tracking-widest text-xs text-zinc-400 border-b">
            Centro de Alertas
          </DropdownMenuLabel>
          <div className="px-5 py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-zinc-300" />
            </div>
            <p className="text-sm font-bold text-zinc-900">Estás al día</p>
            <p className="text-xs text-zinc-500 px-6 leading-relaxed">No tenés notificaciones nuevas por ahora.</p>
          </div>
          <DropdownMenuSeparator className="bg-zinc-100" />
          <DropdownMenuItem
            className="p-4 flex justify-center text-xs font-bold text-primary hover:text-primary/80 focus:text-primary transition-colors cursor-pointer"
            onClick={() => window.location.href = '/profesor/configuracion#notificaciones'}
          >
            CONFIGURAR NOTIFICACIONES
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <a
        href="/profesor/configuracion"
        className="p-3 text-zinc-400 hover:text-zinc-900 transition-colors rounded-2xl hover:bg-zinc-100"
        aria-label="Ajustes"
      >
        <Settings className="w-5 h-5" />
      </a>
    </div>
  );
}
