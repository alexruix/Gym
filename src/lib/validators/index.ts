/**
 * SSOT: Central de Validadores MiGym
 * Punto de entrada único para todos los esquemas de validación Zod.
 */

// COMMON
export { 
  urlSchema, 
  actionResponseSchema,
  updateAccountSchema,
  changePasswordSchema
} from "./common";

export type { ActionResponse, UpdateAccountData, ChangePasswordData } from "./common";

// PROFESOR
export {
  planSchema,
  studentSchema,
  updateStudentSchema,
  inviteStudentSchema,
  exerciseLibrarySchema,
  updatePublicProfileSchema,
  updateNotificationsSchema,
  updatePrivacySchema,
  turnoSchema,
  bulkAssignSchema,
  blockSchema,
  paymentSchema,
  subscriptionSchema,
  linkSubscriptionSchema,
  updateMassivePricesSchema
} from "./profesor";

export type {
  PlanFormData,
  ExerciseLibraryFormData,
  BlockFormData,
  StudentFormData,
  TurnoFormData,
  PaymentFormData,
  BulkAssignData,
  UpdatePublicProfileData,
  UpdateNotificationsData,
  UpdatePrivacyData
} from "./profesor";

// ALUMNO
export {
  instanciarSesionSchema,
  logEjercicioInstanciadoSchema,
  completarSesionSchema,
  addExerciseToStudentPlanSchema,
  removeExerciseFromStudentPlanSchema,
  swapExerciseInStudentPlanSchema,
  commentExerciseSchema,
  getDashboardDataSchema,
  getStudentPerformanceSchema,
  getPlanDetailsSchema,
  getWeeklySessionsSchema,
  updateStudentMetricWithPropagationSchema,
  completeSessionByProfessorSchema,
  updateStudentStartDateOffsetSchema,
  sessionLogSchema,
  completeSessionSchema,
  activarPerfilSchema,
  updateStudentProfileSchema
} from "./alumno";

export type {
  InstanciarSesionData,
  LogEjercicioInstanciadoData,
  CompletarSesionData,
  ActivarPerfilData
} from "./alumno";
