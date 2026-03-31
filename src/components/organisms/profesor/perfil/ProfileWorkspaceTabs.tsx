import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Dumbbell, Info, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileWorkspaceTabsProps {
  routineContent: React.ReactNode;
  infoContent: React.ReactNode;
  historyContent?: React.ReactNode;
  activeTab?: string;
}

export function ProfileWorkspaceTabs({ 
  routineContent, 
  infoContent, 
  historyContent,
  activeTab = "routine" 
}: ProfileWorkspaceTabsProps) {
  const { tabs } = athleteProfileCopy.workspace;

  return (
    <div className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm">
      <Tabs defaultValue={activeTab} className="w-full">
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 shrink-0">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex h-12 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
            <TabsTrigger 
              value="routine"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2 transition-all active:scale-95 shadow-none data-[state=active]:shadow-sm"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span className="inline">{tabs.routine}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="history"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2 transition-all active:scale-95 shadow-none data-[state=active]:shadow-sm"
            >
              <History className="w-3.5 h-3.5" />
              <span className="inline">{tabs.history}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="info"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2 transition-all active:scale-95 shadow-none data-[state=active]:shadow-sm"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="inline">{tabs.info}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 md:p-8">
          <TabsContent value="routine" className="mt-0 focus-visible:ring-0">
            {routineContent}
          </TabsContent>
          
          <TabsContent value="history" className="mt-0 focus-visible:ring-0">
            {historyContent || (
              <div className="py-12 md:py-20 text-center space-y-4">
                 <History className="w-12 h-12 text-zinc-300 mx-auto opacity-50" />
                 <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Sin historial de entrenamientos registrado</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="info" className="mt-0 focus-visible:ring-0">
            {infoContent}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
