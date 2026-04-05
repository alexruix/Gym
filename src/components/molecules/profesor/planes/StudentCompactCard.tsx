import React from "react";
import { User, Mail, Phone, ChevronRight, MessageCircle, Zap, Activity, AlertCircle } from "lucide-react";
import { StatusBadge, type StatusType } from "@/components/molecules/StatusBadge";
import { cn, copyToClipboard } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { ResourceActionMenu, type Action } from "@/components/molecules/profesor/core/ResourceActionMenu";

interface StudentCompactCardProps {
  student: {
    id: string;
    nombre: string;
    email: string | null;
    estado: string;
    telefono?: string;
    planName?: string | null;
    notas?: string;
  };
  onClick?: (id: string) => void;
  customActions?: Action[];
  href?: string;
  className?: string;
}

/**
 * StudentCompactCard: Molécula premium para representar alumnos con prioridad en 
 * Nombre, Plan, Salud y Acciones Operativas.
 */
export function StudentCompactCard({ student, onClick, href, customActions, className }: StudentCompactCardProps) {
  
  const handleCopyMagicLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading("Generando acceso...");
    try {
        const { data, error } = await actions.profesor.getStudentGuestLink({ id: student.id });
        if (error || !data?.link) throw new Error("Error al generar link");
        
        await copyToClipboard(data.link);
        toast.dismiss();
        toast.success("¡Link de acceso copiado!");
    } catch (err: any) {
        toast.dismiss();
        toast.error(err.message || "No se pudo copiar el link");
    }
  };

  const handleWhatsApp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!student.telefono) {
        toast.error("El alumno no tiene teléfono registrado");
        return;
    }
    const cleanPhone = student.telefono.replace(/\D/g, "");
    const link = `https://wa.me/${cleanPhone}`;
    const win = window.open(link, "_blank");
    if (!win || win.closed || typeof win.closed == 'undefined') {
        await navigator.clipboard.writeText(link);
        toast.success("Link generado y copiado al portapapeles. Ya podés pegarlo en el chat del alumno");
    }
  };

  return (
    <Card 
      onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('button, [role="menu"], a') && onClick) {
              onClick(student.id);
          }
      }}
      className={cn(
        "group relative p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-950/5 hover:-translate-y-1 cursor-pointer overflow-hidden active:scale-[0.98]",
        className
      )}
    >
      {href && (
          <a href={href} className="absolute inset-0 z-0 opacity-0" aria-label="Ver perfil completo"></a>
      )}
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150 duration-700" />

      <div className="flex flex-col gap-5 relative z-10 pointer-events-none">
        {/* Row 1: Avatar & Status */}
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500 dark:text-zinc-300 text-lg border border-zinc-100 dark:border-zinc-700 group-hover:bg-lime-400 group-hover:text-zinc-950 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                    {student.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                    <h4 className="font-black text-zinc-950 dark:text-white text-base uppercase tracking-tight group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors truncate max-w-[150px]">
                        {student.nombre}
                    </h4>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 opacity-80">
                        {student.planName || "Sin plan activo"}
                    </span>
                </div>
            </div>
            <StatusBadge status={student.estado as StatusType} />
        </div>

        {/* Row 2: Health Alert (If exists) - High Priority */}
        {student.notas && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {student.notas}
                </p>
            </div>
        )}

        {/* Row 3: Footer Actions (Zen Mode) */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                Ver perfil <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
            
            <div className="flex items-center gap-2 pointer-events-auto">
                {/* MAGIC LINK BUTTON */}
                <button 
                  onClick={handleCopyMagicLink}
                  title="Copiar link de acceso"
                  className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all border border-transparent shadow-sm"
                >
                    <Zap className="w-4 h-4" />
                </button>

                {/* WHATSAPP BUTTON */}
                {student.telefono && (
                    <button 
                      onClick={handleWhatsApp}
                      title="Enviar WhatsApp"
                      className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </button>
                )}

                {/* FULL ACTION MENU */}
                <ResourceActionMenu 
                    type="alumno"
                    id={student.id}
                    name={student.nombre}
                    actions={customActions}
                    className="ml-1"
                />
            </div>
        </div>
      </div>
    </Card>
  );
}
