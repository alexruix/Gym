import { dashboardActions } from "./dashboard";
import { plansActions } from "./plans";
import { managementActions } from "./management";
import { trainingActions } from "./training";
import { libraryActions } from "./library";
import { financeActions } from "./finance";
import { profileActions } from "./profile";

/**
 * Profesor Actions Unificadas
 * Punto de entrada modular para todas las operaciones del profesor.
 * Organizado por dominios para escalabilidad y mantenibilidad.
 */
export const profesorActions = {
  ...dashboardActions,
  ...plansActions,
  ...managementActions,
  ...trainingActions,
  ...libraryActions,
  ...financeActions,
  ...profileActions,
};
