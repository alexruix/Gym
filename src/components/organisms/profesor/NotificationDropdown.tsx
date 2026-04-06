import * as React from "react";
import { Bell, Settings, CheckCheck, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/profesor/useNotifications";
import { NotificationItem } from "@/components/molecules/profesor/NotificationItem";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  profesorId: string;
}

export function NotificationDropdown({ profesorId }: NotificationDropdownProps) {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(profesorId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="p-2 text-zinc-400 hover:text-zinc-900 relative transition-colors group outline-none cursor-pointer"
          aria-label="Ver notificaciones"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-lime-500 rounded-full border-2 border-white group-hover:ring-2 ring-lime-400/30 transition-all animate-pulse" />
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-[340px] p-0 rounded-2xl shadow-2xl border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[500px]"
      >
        <div className="px-5 py-4 flex items-center justify-between border-b bg-zinc-50/50 dark:bg-zinc-900/50">
          <DropdownMenuLabel className="p-0 font-black uppercase tracking-widest text-[10px] text-zinc-400">
            Notificaciones recientes
          </DropdownMenuLabel>
          
          {unreadCount > 0 && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
              className="text-[10px] font-black uppercase tracking-widest text-lime-500 hover:text-lime-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              Leer todas <CheckCheck className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <NotificationItem 
                key={notif.id} 
                notification={notif} 
                onSelect={markAsRead} 
              />
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">¡Todo en orden!</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">No tenés nuevas alertas.</p>
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 m-0" />
        
        <DropdownMenuItem 
          className="p-4 flex justify-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
          onClick={() => window.location.href = '/profesor/configuracion#notificaciones'}
        >
          Configurar notificaciones <Settings className="ml-2 w-3 h-3" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
