import { profesorActions } from "./profesor";
import { alumnoActions } from "./alumno";
import { authActions } from "./auth";

/**
 * MiGym Actions Hub (V2.0)
 * Arquitectura modular y escalable para la Consola Deportiva.
 * Todas las mutaciones de estado se orquestan aquí vía Astro Actions.
 */
export const server = {
  profesor: profesorActions,
  alumno: alumnoActions,
  auth: authActions,
};
