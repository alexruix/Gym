import { profesorActions } from "./profesor";
import { alumnoActions } from "./alumno";
import { authActions } from "./auth";

export const server = {
  profesor: profesorActions,
  alumno: alumnoActions,
  auth: authActions,
};
