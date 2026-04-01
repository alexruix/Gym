import * as React from "react";
import { 
  User, 
  ExternalLink, 
  Copy, 
  Moon, 
  LogOut, 
  Check,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface UserAccountMenuProps {
  profesor: {
    nombre: string;
    foto_url: string | null;
    slug: string | null;
  };
}

export function UserAccountMenu({ profesor }: UserAccountMenuProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Initialize theme from localStorage/document
  React.useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains("dark") || 
                       localStorage.getItem("theme") === "dark";
    setIsDark(isDarkTheme);
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const copyLandingLink = () => {
    if (!profesor.slug) return;
    const url = `${window.location.origin}/p/${profesor.slug}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
      toast.error("No se pudo cerrar sesiÃ³n");
    }
  };

  const initials = profesor.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden hover:ring-4 hover:ring-zinc-100 dark:hover:ring-zinc-800 transition-all outline-none">
          {profesor.foto_url ? (
            <img src={profesor.foto_url} alt={profesor.nombre} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-black text-zinc-400">{initials}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-zinc-200 dark:border-zinc-800">
        <DropdownMenuLabel className="px-3 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Entrenador</span>
            <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
              {profesor.nombre}
            </span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
        
        <div className="py-1">
          <DropdownMenuItem 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900"
            onClick={() => window.location.href = "/profesor/configuracion"}
          >
            <User className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-bold">Mi perfil</span>
          </DropdownMenuItem>

          {profesor.slug && (
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900"
              onClick={() => window.open(`/p/${profesor.slug}`, "_blank")}
            >
              <ExternalLink className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-bold">Ver perfil pÃºblico</span>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />

        <div className="py-1">
          <DropdownMenuItem 
            className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900"
            onClick={copyLandingLink}
          >
            <div className="flex items-center gap-3">
              <Copy className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-bold">CopiÃ¡ tu enlace</span>
            </div>
            {isCopied && <Check className="w-4 h-4 text-lime-500" />}
          </DropdownMenuItem>

          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-bold">Modo Oscuro</span>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />

        <DropdownMenuItem 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive mt-1"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span className="text-sm font-bold uppercase tracking-wide">Cerrar SesiÃ³n</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
