import React from "react";
import { Home, ClipboardList, TrendingUp } from "lucide-react";
import { globalCopy } from "@/data/es/global";
import { cn } from "@/lib/utils";

interface AlumnoBottomNavProps {
  currentPath: string;
}

export function AlumnoBottomNav({ currentPath }: AlumnoBottomNavProps) {
  const normPath = currentPath.replace(/\/$/, "");
  
  const navItems = [
    {
      label: globalCopy.layout.alumnoNav.inicio,
      href: "/alumno",
      icon: Home,
      isActive: normPath === "/alumno"
    },
    {
      label: globalCopy.layout.alumnoNav.miPlan,
      href: "/alumno/mi-plan",
      icon: ClipboardList,
      isActive: normPath === "/alumno/mi-plan"
    },
    {
      label: globalCopy.layout.alumnoNav.progreso,
      href: "/alumno/progreso",
      icon: TrendingUp,
      isActive: normPath === "/alumno/progreso"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none">
      <div className="max-w-sm mx-auto bg-zinc-950/90 backdrop-blur-2xl border border-white/5 rounded-full p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto ring-1 ring-white/10">
        
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              data-astro-prefetch="hover"
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-full transition-all duration-500 scale-95 hover:scale-100 relative group",
                item.isActive
                  ? "bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.3)]"
                  : "text-zinc-500 hover:text-white hover:bg-white/5 active:scale-90"
              )}
              aria-current={item.isActive ? "page" : undefined}
            >
              <Icon className={cn("w-5 h-5", item.isActive ? "animate-in zoom-in-50 duration-300" : "")} />
              
              {/* Dot Indicator (Subtle) */}
              {item.isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-black rounded-full" />
              )}
              
              {/* Label for Screen Readers */}
              <span className="sr-only">{item.label}</span>
            </a>
          );
        })}

      </div>
    </nav>
  );
}
