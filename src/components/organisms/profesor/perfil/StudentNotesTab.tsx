import React, { useState, useEffect } from "react";
import { ClipboardList, Save, CheckCircle2, Loader2 } from "lucide-react";
import { actions } from "astro:actions";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StudentNotesTabProps {
  alumnoId: string;
  notes: string;
  onSaveSuccess: (notes: string) => void;
}

/**
 * StudentNotesTab: Sección para gestionar notas privadas del alumno.
 * Diseñada para alto rendimiento PWA con feedback táctil y visual inmediato.
 */
export function StudentNotesTab({ alumnoId, notes: initialNotes, onSaveSuccess }: StudentNotesTabProps) {
  const [localNotes, setLocalNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const { notes: copy } = athleteProfileCopy.workspace;

  // Sync with prop changes (e.g. if updated from another tab or parent)
  useEffect(() => {
    setLocalNotes(initialNotes || "");
    setHasChanged(false);
  }, [initialNotes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await actions.profesor.updateStudent({
        id: alumnoId,
        notas: localNotes,
      });

      if (error) throw error;
      
      setHasChanged(false);
      onSaveSuccess(localNotes);
      toast.success("✅ Notas guardadas correctamente");
      
      // Emitir evento para otros componentes
      window.dispatchEvent(new CustomEvent('student-notes-updated', { detail: { notes: localNotes } }));
    } catch (err) {
      toast.error("Error al guardar las notas");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header de la sección */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-lime-500" />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              {copy.title}
            </h3>
          </div>
          <p className="text-sm font-medium text-zinc-500">
            {copy.subtitle}
          </p>
        </div>

        {hasChanged && (
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-lime-500 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
            Cambios sin guardar
          </div>
        )}
      </div>

      {/* Editor Industrial */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-lime-500/20 to-transparent rounded-[2rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <Textarea
          value={localNotes}
          onChange={(e) => {
            setLocalNotes(e.target.value);
            setHasChanged(true);
          }}
          placeholder={copy.placeholder}
          className={cn(
            "min-h-[400px] w-full bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 text-lg font-medium leading-relaxed resize-none transition-all outline-none",
            "focus:bg-white dark:focus:bg-zinc-900 border-2 focus:border-lime-400/50 shadow-inner",
            !localNotes && "italic opacity-60"
          )}
        />
        
        {/* Floating Save Button (PWA Style) */}
        <div className="absolute bottom-6 right-6 flex items-center gap-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanged || isSaving}
            className={cn(
              "h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-2xl",
              hasChanged 
                ? "bg-lime-500 text-zinc-950 hover:bg-lime-400 scale-100 opacity-100" 
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 scale-95 opacity-50 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {copy.saveAction}
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
        <CheckCircle2 className="w-4 h-4 text-zinc-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Solo vos podés ver esta información. El alumno no tiene acceso a estas notas.
        </p>
      </div>

    </div>
  );
}
