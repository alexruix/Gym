import { profileActions } from "./profile";
import { workoutActions } from "./workout";
import { queryActions } from "./queries";

/**
 * Alumno Actions Unificadas
 * Punto de entrada modular para todas las operaciones del atleta.
 */
export const alumnoActions = {
  ...profileActions,
  ...workoutActions,
  ...queryActions,
};
