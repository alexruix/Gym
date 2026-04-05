/**
 * schedule.ts — Utilidades de cálculo temporal para el Calendario Operativo Real.
 * Convierte una fecha de inicio en número de día y semana del plan.
 *
 * Filosofía: Funciones puras, sin efectos secundarios, testeables.
 */

/**
 * Calcula qué número de día del plan le corresponde a una fecha dada.
 * Usa normalización local (Argentina UTC-3) para evitar desfases de medianoche.
 *
 * @example
 * // fecha_inicio: "2024-03-30", hoy: "2024-04-02" → 4
 */
export function getDayNumber(fechaInicio: string | Date, fechaHoy: Date | string = new Date()): number {
  // 1. Normalizar a ISO String YYYY-MM-DD
  const getISO = (d: string | Date) => {
    if (typeof d === "string") return d.split("T")[0];
    // Si es Date, lo asimilamos a Argentina Time (UTC-3) antes de sacar el ISO
    const arg = new Date(d.getTime() - (3 * 60 * 60 * 1000));
    return arg.toISOString().split("T")[0];
  };

  const inicioStr = getISO(fechaInicio);
  const hoyStr = getISO(fechaHoy);

  if (inicioStr === hoyStr) return 1;

  // 2. Calcular diferencia de días puros
  const [y1, m1, d1] = inicioStr.split("-").map(Number);
  const [y2, m2, d2] = hoyStr.split("-").map(Number);

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);

  const diffMs = utc2 - utc1;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays + 1;
}

/**
 * Calcula el número de semana dentro del ciclo del plan.
 *
 * @example
 * // Día 1-7 → Semana 1, Día 8-14 → Semana 2, etc.
 * getWeekNumber("2024-03-30", new Date("2024-04-02")) // 1
 */
export function getWeekNumber(fechaInicio: string | Date, fechaHoy: Date | string = new Date()): number {
  const dayNumber = getDayNumber(fechaInicio, fechaHoy);
  return Math.ceil(dayNumber / 7);
}

/**
 * Calcula la información de ciclo para planes que se repiten.
 * @returns { absoluteWeek, cycleNumber, relativeWeek }
 */
export function getCycleInfo(fechaInicio: string | Date, fechaHoy: Date | string = new Date(), duracionSemanas: number = 4) {
  const absoluteWeek = getWeekNumber(fechaInicio, fechaHoy);
  if (duracionSemanas <= 0) return { absoluteWeek, cycleNumber: 1, relativeWeek: absoluteWeek };
  
  const cycleNumber = Math.ceil(absoluteWeek / duracionSemanas);
  const remainder = absoluteWeek % duracionSemanas;
  const relativeWeek = remainder === 0 ? duracionSemanas : remainder;
  
  return { absoluteWeek, cycleNumber, relativeWeek };
}

/**
 * Calcula el día estructural (1 a N) dentro del ciclo completo del plan.
 * Útil para mapear contra rutinas_diarias.dia_numero.
 */
export function getStructuralDay(fechaInicio: string | Date, fechaHoy: Date | string = new Date(), duracionSemanas: number = 4): number {
  const diaAbs = getDayNumber(fechaInicio, fechaHoy);
  const totalDays = Math.max(1, duracionSemanas * 7);
  const res = ((diaAbs - 1) % totalDays) + 1;
  return res;
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
 * Retorna la fecha de hoy como string ISO (YYYY-MM-DD) ajustada a Argentina (UTC-3).
 * Evita que a las 21hs de hoy ya sea "mañana" por el horario UTC.
 */
export function getTodayISO(): string {
  const now = new Date();
  const argentinaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  return argentinaTime.toISOString().split("T")[0];
}
