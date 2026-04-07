/**
 * schedule.ts — Utilidades de cálculo temporal para el Calendario Operativo Real.
 * Convierte una fecha de inicio en número de día y semana del plan.
 *
 * Filosofía: Funciones puras, sin efectos secundarios, testeables.
 */

/**
 * Calcula qué número de día del plan le corresponde a una fecha dada,
 * respetando los días de asistencia del alumno si se proveen.
 *
 * @param diasAsistencia Array de números de día de la semana (0-6, 0=Domingo, 1=Lunes...)
 */
export function getDayNumber(
  fechaInicio: string | Date, 
  fechaHoy: Date | string = new Date(),
  diasAsistencia?: number[]
): number {
  const getISO = (d: string | Date) => {
    if (typeof d === "string") return d.split("T")[0];
    const arg = new Date(d.getTime() - (3 * 60 * 60 * 1000));
    return arg.toISOString().split("T")[0];
  };

  const inicioStr = getISO(fechaInicio);
  const hoyStr = getISO(fechaHoy);

  // Parsear a fechas puras de medianoche para iteración
  const [y1, m1, d1] = inicioStr.split("-").map(Number);
  const [y2, m2, d2] = hoyStr.split("-").map(Number);
  const start = new Date(Date.UTC(y1, m1 - 1, d1, 12, 0, 0));
  const target = new Date(Date.UTC(y2, m2 - 1, d2, 12, 0, 0));

  if (target < start) return 0;

  // CASO A: Lineal (Sin filtrar por días de asistencia)
  if (!diasAsistencia || diasAsistencia.length === 0) {
    const diffMs = target.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  // CASO B: Profesional (Solo avanza en días de asistencia)
  const isAttendanceDay = (date: Date) => diasAsistencia.includes(date.getUTCDay());

  // El "Día 1" es el primer día de asistencia que ocurra >= fechaInicio
  let firstActualDay = new Date(start);
  let safeGuard = 0;
  while (!isAttendanceDay(firstActualDay) && safeGuard < 7) {
    firstActualDay.setUTCDate(firstActualDay.getUTCDate() + 1);
    safeGuard++;
  }

  if (target < firstActualDay) return 0; // Días previos al primer entrenamiento real

  let count = 0;
  let iter = new Date(firstActualDay);
  while (iter <= target) {
    if (isAttendanceDay(iter)) {
      count++;
    }
    iter.setUTCDate(iter.getUTCDate() + 1);
  }

  return count;
}

export function getWeekNumber(
  fechaInicio: string | Date, 
  fechaHoy: Date | string = new Date(),
  diasAsistencia?: number[]
): number {
  const dayNumber = getDayNumber(fechaInicio, fechaHoy, diasAsistencia);
  if (dayNumber === 0) return 1;

  // Si usamos asistencia, la semana se calcula segun la frecuencia semanal
  if (diasAsistencia && diasAsistencia.length > 0) {
    return Math.ceil(dayNumber / diasAsistencia.length);
  }
  
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
 * Calcula el día estructural (físico) del plan comparando la visita absoluta
 * del alumno contra los días que tienen rutinas configuradas en el plan.
 * 
 * @param availableDiaNumeros Array de dia_numero ordenados (ej. [2, 5, 8])
 */
export function getStructuralDay(
  fechaInicio: string | Date, 
  fechaHoy: Date | string = new Date(),
  availableDiaNumeros: number[] = [1],
  diasAsistencia?: number[]
): number {
  const diaAbs = getDayNumber(fechaInicio, fechaHoy, diasAsistencia);
  if (diaAbs <= 0 || !availableDiaNumeros || availableDiaNumeros.length === 0) return 0;
  
  // Mapeo por índice: La visita N mapea al índice (N-1) del array de días disponibles
  const index = (diaAbs - 1) % availableDiaNumeros.length;
  return availableDiaNumeros[index];
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
