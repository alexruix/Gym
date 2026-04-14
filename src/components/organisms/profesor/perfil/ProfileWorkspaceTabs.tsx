import React, { useEffect, useState, useRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Dumbbell, Info, History, Layers, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface ProfileWorkspaceTabsProps {
  planContent: React.ReactNode;
  routineContent: React.ReactNode;
  infoContent: React.ReactNode;
  notesContent: React.ReactNode;
  historyContent?: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
  isRoutineDisabled?: boolean;
  isHistoryDisabled?: boolean;
}

export function ProfileWorkspaceTabs({
  planContent,
  routineContent,
  infoContent,
  notesContent,
  historyContent,
  activeTab,
  onTabChange,
  isRoutineDisabled = false,
  isHistoryDisabled = false
}: ProfileWorkspaceTabsProps) {
  const { tabs } = athleteProfileCopy.workspace;
  const [isSticky, setIsSticky] = useState(false);
  const [contentHeight, setContentHeight] = useState("auto");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Sticky logic: matches AthleteHeader scroll threshold
      setIsSticky(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabList = [
    { value: "plan", label: tabs.plan, icon: Layers },
    { value: "routine", label: tabs.routine, icon: Dumbbell },
    { value: "notes", label: tabs.notes, icon: ClipboardList },
    { value: "history", label: tabs.history, icon: History },
    { value: "info", label: tabs.info, icon: Info },
  ];

  return (
    <TabsPrimitive.Root 
      value={activeTab} 
      onValueChange={onTabChange}
      className="space-y-6"
    >
      {/* PWA Sticky Pills - Refined padding and blur */}
      <div className={cn(
        "z-40 transition-all duration-500 ease-in-out",
        isSticky 
          ? "fixed top-[72px] left-0 right-0 px-4 py-2 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800 shadow-xl animate-in slide-in-from-top-2" 
          : "relative py-2"
      )}>
        <TabsPrimitive.List className="flex gap-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto scroll-smooth">
          {tabList.map((tab) => {
            const isDisabled = (tab.value === "routine" && isRoutineDisabled) || (tab.value === "history" && isHistoryDisabled);
            return (
              <TabsPrimitive.Trigger
                key={tab.value}
                value={tab.value}
                disabled={isDisabled}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2",
                  activeTab === tab.value
                    ? "bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-xl scale-105"
                    : "bg-white dark:bg-zinc-900/50 text-zinc-400 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800",
                  isDisabled && "opacity-40 cursor-not-allowed grayscale pointer-events-none"
                )}
              >
                <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.value ? "text-lime-400 dark:text-lime-600" : "")} />
                {tab.label}
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>
      </div>

      <div 
        className={cn(
          "bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-950/5 transition-all duration-500",
          isSticky ? "mt-20" : "mt-0"
        )}
      >
        <div className="p-4 md:p-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <TabsPrimitive.Content value="plan" className="mt-0 focus-visible:ring-0">
                {planContent}
              </TabsPrimitive.Content>

              <TabsPrimitive.Content value="routine" className="mt-0 focus-visible:ring-0">
                {routineContent}
              </TabsPrimitive.Content>

              <TabsPrimitive.Content value="notes" className="mt-0 focus-visible:ring-0">
                {notesContent}
              </TabsPrimitive.Content>

              <TabsPrimitive.Content value="history" className="mt-0 focus-visible:ring-0">
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

              <TabsPrimitive.Content value="info" className="mt-0 focus-visible:ring-0">
                {infoContent}
              </TabsPrimitive.Content>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </TabsPrimitive.Root>
  );
}
