import { profesorActions } from "./profesor";
import { alumnoActions } from "./alumno";
import { authActions } from "./auth";
import { pagosActions } from "./pagos";
import { suscripcionesActions } from "./suscripciones";

export const server = {
  profesor: profesorActions,
  alumno: alumnoActions,
  auth: authActions,
  pagos: pagosActions,
  suscripcion: suscripcionesActions,
};
