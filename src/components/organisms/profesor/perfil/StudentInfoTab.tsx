import React from "react";
import { User, Mail, Phone, Calendar, CreditCard, Activity, Pencil, MapPin, BadgeInfo } from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";
import { cn, calculateAge, formatDateLatam } from "@/lib/utils";
import { WhatsappLogoIcon } from "@phosphor-icons/react";

interface StudentInfoTabProps {
  student: {
    id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    fecha_inicio: string;
    dia_pago: number;
    dias_asistencia?: string[] | null;
    fecha_nacimiento?: string | null;
    genero?: string | null;
    profesion?: string | null;
    nivel_experiencia?: string | null;
    notas?: string | null;
  };
  onUpdate?: (updated: any) => void;
}


/**
 * StudentInfoTab: Ficha técnica del alumno.
 * Centraliza datos de contacto y administrativos en un layout de rejilla industrial.
 */
export function StudentInfoTab({ student, onUpdate }: StudentInfoTabProps) {

  const { sidebar } = athleteProfileCopy;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Sección 1: Datos de Contacto */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <BadgeInfo className="w-5 h-5 text-lime-500" />
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Información de Contacto</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Email Card */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-4 hover:border-lime-400/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-lime-500 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Dirección de Email</p>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100 truncate">{student.email || "No registrado"}</p>
            </div>
          </div>

          {/* Whatsapp Card */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-4 hover:border-lime-400/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-lime-500 transition-colors">
              <WhatsappLogoIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-emerald-600">Teléfono (WhatsApp)</p>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">{student.telefono || "No registrado"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 1.1: Identidad (Personal) */}
      <section className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-lime-500" />
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Identidad y Biometría</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fecha Nacimiento / Edad */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-4 hover:border-lime-400/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-lime-500 transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Nacimiento / Edad</p>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                {student.fecha_nacimiento ? (
                  <>
                    {formatDateLatam(student.fecha_nacimiento, 'full')} 
                    <span className="ml-2 text-lime-600 dark:text-lime-400">({calculateAge(student.fecha_nacimiento)} años)</span>
                  </>
                ) : "No especificado"}
              </p>
            </div>
          </div>

          {/* Genero */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-4 hover:border-lime-400/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-lime-500 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Género</p>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100 capitalize">{student.genero || "No especificado"}</p>
            </div>
          </div>

          {/* Profesión */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-4 hover:border-lime-400/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-lime-500 transition-colors">
              <Pencil className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Profesión</p>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100 capitalize">{student.profesion || "No especificado"}</p>
            </div>
          </div>

          {/* Nivel */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-4 hover:border-lime-400/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-lime-500 transition-colors">
              <BadgeInfo className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Nivel de Experiencia</p>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100 capitalize">{student.nivel_experiencia || "No especificado"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 2: Configuración Administrativa */}
      <section className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-lime-500" />
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Estado Administrativo</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inicio */}
          <div className="flex items-center gap-4 p-4">
            <Calendar className="w-5 h-5 text-zinc-300" />
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Fecha de Alta</p>
              <p className="text-base font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-tight">
                {formatDate(student.fecha_inicio)}
              </p>
            </div>
          </div>

          {/* Día de Pago */}
          <div className="flex items-center gap-4 p-4">
            <CreditCard className="w-5 h-5 text-zinc-300" />
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Ciclo de Facturación</p>
              <p className="text-base font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-tight">
                Día {student.dia_pago || 15} de cada mes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Botón Acción (Sticky Bottom en Mobile) */}
      <div className="pt-8 text-right px-4">
        <Button
          asChild
          variant="industrial"
          className="w-full md:w-auto h-12 px-10 rounded-2xl shadow-xl shadow-zinc-950/10 uppercase"
        >
          <a href={`/profesor/alumnos/${student.id}/edit`}>
            <Pencil className="w-4 h-4 mr-3" />
            Editar información
          </a>
        </Button>
      </div>

    </div>
  );
}
