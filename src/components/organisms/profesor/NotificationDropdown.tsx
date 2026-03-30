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

export function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="p-2 text-zinc-400 hover:text-zinc-900 relative transition-colors group outline-none"
          aria-label="Ver notificaciones"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-lime-500 rounded-full border border-white group-hover:ring-2 ring-lime-400/30 transition-all"></span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[320px] p-0 rounded-2xl shadow-2xl border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <DropdownMenuLabel className="px-5 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-400 border-b bg-zinc-50/50 dark:bg-zinc-900/50">
          Notificaciones Recientes
        </DropdownMenuLabel>
        
        <div className="py-12 flex flex-col items-center justify-center text-center px-6">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">¡Todo en orden!</h4>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed"> No tenés nuevas alertas. Te avisaremos cuando tus alumnos completen sesiones o venzan cuotas.</p>
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
        
        <DropdownMenuItem 
          className="p-4 flex justify-center text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary transition-colors cursor-pointer"
          onClick={() => window.location.href = '/profesor/configuracion#notificaciones'}
        >
          Configurar Alertas <Settings className="ml-2 w-3 h-3" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
