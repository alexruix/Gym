import React, { useState } from "react";
import {
  Calendar,
  Layers,
  Users,
  Edit3,
  Copy,
  Dumbbell,
  Clock,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  TrendingUp,
} from "lucide-react";
import { planesCopy } from "@/data/es/profesor/planes";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusType } from "@/components/atoms/StatusBadge";

// --- Tipos ---
interface EjercicioPlan {
  id: string;
  orden: number;
  series: number;
  reps_target: string;
  descanso_seg: number;
  biblioteca_ejercicios: {
    id: string;
    nombre: string;
    media_url: string | null;
  } | null;
}

interface RutinaDiaria {
  id: string;
  dia_numero: number;
  nombre_dia: string | null;
  orden: number;
  ejercicios_plan: EjercicioPlan[];
}

interface Alumno {
  id: string;
  nombre: string;
  email: string | null;
  estado: string;
}

interface PlanData {
  id: string;
  nombre: string;
  duracion_semanas: number;
  frecuencia_semanal: number;
  created_at: string;
  rutinas: RutinaDiaria[];
  alumnos: Alumno[];
}

interface Props {
  plan: PlanData;
}

export function PlanDetail({ plan }: Props) {
  const c = planesCopy.detail;
  const [activeTab, setActiveTab] = useState<"routines" | "students">("routines");
  const [openRutinas, setOpenRutinas] = useState<Set<string>>(
    new Set(plan.rutinas.slice(0, 1).map((r) => r.id)) // Primer día abierto por defecto
  );

  const toggleRutina = (id: string) => {
    setOpenRutinas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const createdDate = new Date(plan.created_at).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const activeStudents = plan.alumnos.filter((a) => !("deleted_at" in a));

  return (
    <div className="space-y-8">
      {/* ═══ CABECERA ═══ */}
      <div className="bg-white dark:bg-zinc-950/40 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Franja de acento superior */}
        <div className="h-1.5 w-full bg-gradient-to-r from-lime-400 to-lime-600" />

        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Identidad */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-inner shrink-0">
              <Dumbbell className="w-8 h-8 text-zinc-500 dark:text-zinc-300" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-950 dark:text-white uppercase leading-none">
                {plan.nombre}
              </h1>
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-1.5">
                {c.meta.createdAt} {createdDate}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Button
              variant="outline"
              className="gap-2 font-black text-[10px] uppercase tracking-widest rounded-xl border-2 border-zinc-200 hover:bg-zinc-50 active:scale-95 transition-all"
              onClick={() => window.location.href = `/profesor/planes/${plan.id}/editar`}
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" />
              {c.actions.edit}
            </Button>
            <Button
              variant="outline"
              className="gap-2 font-black text-[10px] uppercase tracking-widest rounded-xl border-2 border-lime-300 text-lime-700 hover:bg-lime-50 hover:border-lime-400 active:scale-95 transition-all"
            >
              <Copy className="w-4 h-4" aria-hidden="true" />
              {c.actions.duplicate}
            </Button>
          </div>
        </div>

        {/* Métricas de la cabecera */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
          {[
            { icon: Calendar, label: c.meta.duration, value: `${plan.duracion_semanas} ${c.meta.weeks}` },
            { icon: Layers, label: c.meta.frequency, value: `${plan.frecuencia_semanal} ${c.meta.daysPerWeek}` },
            { icon: Dumbbell, label: "Rutinas", value: `${plan.rutinas.length}` },
            { icon: Users, label: c.meta.studentsCount, value: `${activeStudents.length}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center justify-center gap-1 py-5 px-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
              <Icon className="w-4 h-4 text-zinc-400" aria-hidden="true" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">{label}</span>
              <span className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="bg-white dark:bg-zinc-950/40 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Nav de tabs */}
        <div className="border-b border-zinc-100 dark:border-zinc-800 flex">
          {(["routines", "students"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab
                  ? "border-lime-500 text-zinc-950 dark:text-white bg-lime-50/50 dark:bg-lime-500/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
              }`}
            >
              {tab === "routines" ? (
                <span className="flex items-center gap-2">
                  <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" />
                  {c.tabs.routines}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  {c.tabs.students}
                  {activeStudents.length > 0 && (
                    <span className="bg-lime-400 text-zinc-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {activeStudents.length}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TAB: RUTINAS ─── */}
        {activeTab === "routines" && (
          <div className="p-4 md:p-8 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {plan.rutinas.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-zinc-300" aria-hidden="true" />
                </div>
                <p className="text-zinc-400 font-medium text-sm">Este plan no tiene rutinas todavía.</p>
              </div>
            ) : (
              plan.rutinas.map((rutina) => {
                const isOpen = openRutinas.has(rutina.id);
                return (
                  <div
                    key={rutina.id}
                    className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    {/* Cabecera de cada día */}
                    <button
                      onClick={() => toggleRutina(rutina.id)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50/80 dark:bg-zinc-900/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 transition-colors group"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-black text-zinc-600 dark:text-zinc-200 shrink-0 group-hover:bg-lime-400 group-hover:text-zinc-950 transition-colors">
                          {rutina.dia_numero}
                        </span>
                        <div className="text-left">
                          <p className="font-black text-zinc-950 dark:text-white text-sm uppercase tracking-tight">
                            {c.routines.dayLabel} {rutina.dia_numero}
                            {rutina.nombre_dia && rutina.nombre_dia !== `Día ${rutina.dia_numero}` && (
                              <span className="ml-2 font-medium text-zinc-500 normal-case tracking-normal">
                                — {rutina.nombre_dia}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {rutina.ejercicios_plan.length} {rutina.ejercicios_plan.length === 1 ? "ejercicio" : "ejercicios"}
                          </p>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-400 transition-transform" aria-hidden="true" />
                      )}
                    </button>

                    {/* Ejercicios del día */}
                    {isOpen && (
                      <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        {rutina.ejercicios_plan.length === 0 ? (
                          <p className="text-center py-6 text-zinc-400 text-sm font-medium">{c.routines.emptyDay}</p>
                        ) : (
                          rutina.ejercicios_plan.map((ej, idx) => (
                            <div
                              key={ej.id}
                              className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-zinc-950 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors group/ej"
                            >
                              {/* Número de orden */}
                              <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 shrink-0">
                                {idx + 1}
                              </span>

                              {/* Thumbnail opcional */}
                              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                                {ej.biblioteca_ejercicios?.media_url ? (
                                  <img
                                    src={ej.biblioteca_ejercicios.media_url}
                                    alt={ej.biblioteca_ejercicios.nombre}
                                    className="w-full h-full object-cover group-hover/ej:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                  />
                                ) : (
                                  <Dumbbell className="w-5 h-5 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
                                )}
                              </div>

                              {/* Nombre del ejercicio */}
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-zinc-950 dark:text-white text-sm uppercase tracking-tight truncate">
                                  {ej.biblioteca_ejercicios?.nombre || "Ejercicio desconocido"}
                                </p>
                              </div>

                              {/* Métricas del ejercicio */}
                              <div className="hidden sm:flex items-center gap-4 shrink-0">
                                <div className="text-center">
                                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{c.routines.sets}</p>
                                  <p className="text-base font-black text-zinc-950 dark:text-white">{ej.series}</p>
                                </div>
                                <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
                                <div className="text-center">
                                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{c.routines.reps}</p>
                                  <p className="text-base font-black text-zinc-950 dark:text-white">{ej.reps_target}</p>
                                </div>
                                <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
                                <div className="text-center min-w-[56px]">
                                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1">
                                    <Clock className="w-2.5 h-2.5" aria-hidden="true" /> {c.routines.rest}
                                  </p>
                                  <p className="text-base font-black text-zinc-950 dark:text-white">{ej.descanso_seg}{c.routines.seconds}</p>
                                </div>
                              </div>

                              {/* Chip móvil */}
                              <div className="sm:hidden flex items-center gap-1.5 shrink-0">
                                <span className="text-xs font-black text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                                  {ej.series}×{ej.reps_target}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── TAB: ALUMNOS ─── */}
        {activeTab === "students" && (
          <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {activeStudents.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-zinc-300" aria-hidden="true" />
                </div>
                <p className="text-zinc-400 font-medium text-sm">{c.students.empty}</p>
                <a
                  href="/profesor/alumnos/new"
                  className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-lime-500 active:scale-95 transition-all shadow-sm"
                >
                  {c.students.assignBtn}
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {activeStudents.map((alumno) => (
                  <a
                    key={alumno.id}
                    href={`/profesor/alumnos/${alumno.id}`}
                    className="flex items-center gap-4 px-4 py-4 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-900/60 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 rounded-2xl transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500 dark:text-zinc-300 text-sm shrink-0 group-hover:bg-lime-100 group-hover:text-lime-700 dark:group-hover:bg-lime-900/40 dark:group-hover:text-lime-400 transition-colors border border-zinc-100 dark:border-zinc-700 shadow-sm">
                      {alumno.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-zinc-950 dark:text-white text-sm uppercase tracking-tight truncate">
                        {alumno.nombre}
                      </p>
                      <p className="text-zinc-400 text-xs font-medium truncate">{alumno.email}</p>
                    </div>
                    <StatusBadge status={alumno.estado as StatusType} />
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-100 transition-colors" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
