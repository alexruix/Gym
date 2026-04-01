import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Dumbbell, Info, History, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileWorkspaceTabsProps {
  routineContent: React.ReactNode;
  infoContent: React.ReactNode;
  historyContent?: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

/**
 * ProfileWorkspaceTabs: UI de navegaciÃ³n para el perfil del alumno.
 * Sigue la estÃ©tica "Industrial Minimalist" con un diseÃ±o denso, profesional y de alta visibilidad.
 */
export function ProfileWorkspaceTabs({ 
  routineContent, 
  infoContent, 
  historyContent,
  activeTab,
  onTabChange
}: ProfileWorkspaceTabsProps) {
  const { tabs } = athleteProfileCopy.workspace;

  return (
    <div className="bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-950/5">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        
        {/* Sticky Professional Header Tabs */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-zinc-100 dark:border-zinc-800 p-4 shrink-0 transition-shadow">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 md:inline-flex h-12 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800/50">
            <TabsTrigger 
              value="routine"
              className="rounded-xl data-[state=active]:bg-zinc-950 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-zinc-950 font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 shadow-none data-[state=active]:shadow-2xl data-[state=active]:shadow-zinc-950/20 px-8 flex items-center gap-2"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              {tabs.routine}
            </TabsTrigger>
            
            <TabsTrigger 
              value="info"
              className="rounded-xl data-[state=active]:bg-zinc-950 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-zinc-950 font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 shadow-none data-[state=active]:shadow-2xl data-[state=active]:shadow-zinc-950/20 px-8 flex items-center gap-2"
            >
              <Info className="w-3.5 h-3.5" />
              {tabs.info}
            </TabsTrigger>

            <TabsTrigger 
              value="history"
              className="hidden lg:flex rounded-xl data-[state=active]:bg-zinc-950 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-zinc-950 font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 shadow-none data-[state=active]:shadow-2xl data-[state=active]:shadow-zinc-950/20 px-8 items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {tabs.history}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dense Content Buffer */}
        <div className="p-6 md:p-10 min-h-[400px]">
          <TabsContent value="routine" className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-top-1 duration-500">
            {routineContent}
          </TabsContent>
          
          <TabsContent value="history" className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-top-1 duration-500">
            {historyContent || (
               <div className="py-24 text-center space-y-6">
                   <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto border border-dashed border-zinc-200 dark:border-zinc-800 rotate-3">
                       <History className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                   </div>
                   <div className="space-y-1">
                       <h4 className="font-black text-xl uppercase tracking-tighter italic text-zinc-950 dark:text-zinc-100">Sin historial operativo</h4>
                       <p className="text-sm font-medium text-zinc-400 max-w-xs mx-auto">Cuando el alumno complete sus rutinas, verÃ¡s su progreso tÃ©cnico aquÃ­.</p>
                   </div>
               </div>
            )}
          </TabsContent>

          <TabsContent value="info" className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-top-1 duration-500">
            {infoContent}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
