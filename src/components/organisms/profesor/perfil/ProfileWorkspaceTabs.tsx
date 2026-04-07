import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Dumbbell, Info, History, Sparkles, Layers } from "lucide-react";
import { IndustrialTabs } from "@/components/molecules/IndustrialTabs";
import { cn } from "@/lib/utils";

interface ProfileWorkspaceTabsProps {
  planContent: React.ReactNode;
  routineContent: React.ReactNode;
  infoContent: React.ReactNode;
  historyContent?: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

/**
 * ProfileWorkspaceTabs: UI de navegación para el perfil del alumno.
 * Utiliza IndustrialTabs para mantener la consistencia visual de alto rendimiento (underline).
 */
export function ProfileWorkspaceTabs({
  planContent,
  routineContent,
  infoContent,
  historyContent,
  activeTab,
  onTabChange
}: ProfileWorkspaceTabsProps) {
  const { tabs } = athleteProfileCopy.workspace;

  const tabList = [
    { value: "plan", label: tabs.plan, icon: Layers },
    { value: "routine", label: tabs.routine, icon: Dumbbell },
    { value: "info", label: tabs.info, icon: Info },
    { value: "history", label: tabs.history, icon: Sparkles }
  ];

  return (
    <div className="bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-950/5">
      <IndustrialTabs
        tabs={tabList}
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full"
      >
        <div className="p-4 md:p-10 min-h-[400px]">
          <TabsPrimitive.Content
            value="plan"
            className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-top-1 duration-500"
          >
            {planContent}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content
            value="routine"
            className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-top-1 duration-500"
          >
            {routineContent}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content
            value="history"
            className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-top-1 duration-500"
          >
            {historyContent || (
              <div className="py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto border border-dashed border-zinc-200 dark:border-zinc-800 rotate-3 transition-transform hover:rotate-6 duration-500 group">
                  <History className="w-10 h-10 text-zinc-300 dark:text-zinc-700 group-hover:text-lime-500 transition-colors" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xl uppercase tracking-tighter italic text-zinc-950 dark:text-zinc-100">Sin historial operativo</h4>
                  <p className="text-sm font-medium text-zinc-400 max-w-xs mx-auto text-pretty">Cuando el alumno complete sus rutinas, verás su progreso técnico aquí.</p>
                </div>
              </div>
            )}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content
            value="info"
            className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-top-1 duration-500"
          >
            {infoContent}
          </TabsPrimitive.Content>
        </div>
      </IndustrialTabs>
    </div>
  );
}
