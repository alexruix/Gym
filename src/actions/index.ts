import { profesorActions } from "./profesor";
import { alumnoActions } from "./alumno";
import { authActions } from "./auth";
import { pagosActions } from "./pagos";

export const server = {
  profesor: profesorActions,
  alumno: alumnoActions,
  auth: authActions,
  pagos: pagosActions,
};
