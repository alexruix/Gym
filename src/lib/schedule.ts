/**
 * schedule.ts — Utilidades de cálculo temporal para el Calendario Operativo Real.
 * Convierte una fecha de inicio en número de día y semana del plan.
 *
 * Filosofía: Funciones puras, sin efectos secundarios, testeables.
 */

/**
 * Calcula qué número de día del plan le corresponde a una fecha dada.
 *
 * @example
 * // fecha_inicio: "2024-03-30", hoy: 2024-04-02 → 4
 * getDayNumber("2024-03-30", new Date("2024-04-02")) // 4
 */
export function getDayNumber(fechaInicio: string | Date, fechaHoy: Date = new Date()): number {
  const inicio = new Date(fechaInicio);
  // Normalizar a medianoche UTC para evitar drift por zonas horarias
  inicio.setUTCHours(0, 0, 0, 0);
  const hoy = new Date(fechaHoy);
  hoy.setUTCHours(0, 0, 0, 0);

  const diffMs = hoy.getTime() - inicio.getTime();
  if (diffMs < 0) return 1; // Plan aún no empezó → Día 1

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Día 1 es el primer día del plan
}

/**
 * Calcula el número de semana dentro del ciclo del plan.
 *
 * @example
 * // Día 1-7 → Semana 1, Día 8-14 → Semana 2, etc.
 * getWeekNumber("2024-03-30", new Date("2024-04-02")) // 1
 */
export function getWeekNumber(fechaInicio: string | Date, fechaHoy: Date = new Date()): number {
  const dayNumber = getDayNumber(fechaInicio, fechaHoy);
  return Math.ceil(dayNumber / 7);
}

/**
 * Dado el total de días del plan y el día actual, calcula qué número de día
 * de la estructura del plan le corresponde (con ciclo modular).
 *
 * @example
 * // Plan de 3 días, hoy es Día 7 → le toca el Día 1 del ciclo (7 % 3 = 1)
 * getCyclicDayNumber(7, 3) // 1
 * getCyclicDayNumber(4, 3) // 1  (4 % 3 = 1)
 * getCyclicDayNumber(3, 3) // 3
 */
export function getCyclicDayNumber(absoluteDayNumber: number, totalPlanDays: number): number {
  if (totalPlanDays <= 0) return 1;
  const remainder = absoluteDayNumber % totalPlanDays;
  return remainder === 0 ? totalPlanDays : remainder;
}

/**
 * Formatea una fecha para mostrar títulos tipo "Jueves 2 de Abril".
 */
export function formatFechaHumana(fecha: Date = new Date()): string {
  return fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Retorna la fecha de hoy como string ISO (YYYY-MM-DD) sin hora.
 */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}
