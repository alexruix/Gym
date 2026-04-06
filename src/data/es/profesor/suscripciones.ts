export const suscripcionesCopy = {
  title: "Planes",
  headerTitle: "Planes mensuales",
  subtitle: "Configurá los montos según la frecuencia semanal. Estos valores se aplicarán a todos los alumnos vinculados.",
  empty: "Aún no tenés planes configurados. Creá el primero para empezar.",
  createPlan: "Crear nuevo plan",
  editPlan: "Editar plan",
  deletePlan: "Borrar plan",
  massiveUpdate: {
    title: "Actualización masiva",
    description: "Se actualizará el monto y/o nombre del plan para todos los alumnos que tengan este plan (excepto los que tienen cuota personalizada).",
    confirm: "Sí, actualizar todo",
    cancel: "Cancelar",
    success: "Precios y nombres actualizados correctamente",
    caution: "Acción irreversible: afectará a alumnos vinculados",
  },
  deleteDialog: {
    title: "¿Borrar este plan?",
    description: "Los alumnos vinculados pasarán a tener un Monto Personalizado (Auto-Lock) para proteger su precio actual. Esta acción no se puede deshacer.",
    confirm: "Sí, borrar plan",
    cancel: "Cancelar",
  },
  newPlan: {
    title: "Nuevo plan",
    defaultName: "Nuevo plan",
    success: "Plan creado correctamente",
  },
  footer: {
    shieldTitle: "Actualización personalizada",
    shieldDesc: "Los alumnos con el flag <strong>Monto Personalizado</strong> (candado activo) no se verán afectados por los cambios realizados en esta sección.",
  },
  fields: {
    nombre: "Nombre del plan",
    monto: "Monto mensual (ARS)",
    cantidadDias: "Días por semana",
    libre: "Pase libre",
    customPrice: "Monto personalizado (Protegido)",
  },
  alerts: {
    inconsistency: {
      ok: "Suscripción acorde a los días de asistencia",
      warn: "Ojo: Este alumno viene {actual} días pero paga por {plan}. ¿Querés actualizar su plan?",
      solve: "Actualizar al {targetPlan} ({monto})",
    },
    lockedPrice: "Este alumno tiene un precio blindado contra actualizaciones masivas.",
  },
  placeholders: {
    nombre: "Ej: Plan 3 días",
    monto: "Ej: 18000",
  },
};
