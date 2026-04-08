import React, { useEffect, useState } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Dumbbell, Info, History, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileWorkspaceTabsProps {
  planContent: React.ReactNode;
  routineContent: React.ReactNode;
  infoContent: React.ReactNode;
  historyContent?: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function ProfileWorkspaceTabs({
  planContent,
  routineContent,
  infoContent,
  historyContent,
  activeTab,
  onTabChange
}: ProfileWorkspaceTabsProps) {
  const { tabs } = athleteProfileCopy.workspace;
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Sticky logic: if header is stuck (80px), tabs stick below it (64px)
      setIsSticky(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabList = [
    { value: "plan", label: tabs.plan, icon: Layers },
    { value: "routine", label: tabs.routine, icon: Dumbbell },
    { value: "history", label: tabs.history, icon: History },
    { value: "info", label: tabs.info, icon: Info },
  ];

  return (
    <TabsPrimitive.Root 
      value={activeTab} 
      onValueChange={onTabChange}
      className="space-y-6"
    >
      {/* PWA Sticky Pills */}
      <div className={cn(
        "z-40 transition-all duration-300",
        isSticky 
          ? "fixed top-16 left-0 right-0 px-4 py-3 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-lg" 
          : "relative"
      )}>
        <TabsPrimitive.List className="flex gap-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
          {tabList.map((tab) => (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2",
                activeTab === tab.value
                  ? "bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-md active:scale-95"
                  : "bg-white dark:bg-zinc-900 text-zinc-400 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.value ? "animate-pulse" : "")} />
              {tab.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
      </div>

      <div className={cn(
        "bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-950/5 min-h-[500px]",
        isSticky && "mt-16"
      )}>
        <div className="p-4 md:p-10">
          <TabsPrimitive.Content
            value="plan"
            className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {planContent}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content
            value="routine"
            className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {routineContent}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content
            value="history"
            className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {historyContent || (
              <div className="py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto border border-dashed border-zinc-200 dark:border-zinc-800 rotate-3 transition-transform hover:rotate-6 duration-500 group">
                  <History className="w-10 h-10 text-zinc-300 dark:text-zinc-700 group-hover:text-lime-500 transition-colors" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xl uppercase tracking-tighter text-zinc-950 dark:text-zinc-100">Sin historial operativo</h4>
                  <p className="text-sm font-medium text-zinc-400 max-w-xs mx-auto text-pretty">Cuando el alumno complete sus rutinas, verás su progreso técnico aquí.</p>
                </div>
              </div>
            )}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content
            value="info"
            className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {infoContent}
          </TabsPrimitive.Content>
        </div>
      </div>
    </TabsPrimitive.Root>
  );
}
