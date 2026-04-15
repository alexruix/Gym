export const pagosCopy = {
  title: "Control de pagos",
  description: "Gestioná los pagos de tus alumnos y los planes mensuales.",
  tabs: {
    history: "Control de cuotas",
    subscriptions: "Planes mensuales",
  },
  metrics: {
    totalStudents: "Total Activos",
    collected: {
      label: "Coutas cobradas este mes",
      description: "Ingresos ya registrados",
    },
    pending: {
      label: "Coutas pendientes de cobro",
      description: "Dinero por cobrar",
    },
    delinquent: {
      label: "Alumnos con cuotas vencidas",
      description: "Cuotas vencidas",
    },
    cobranza: "Cobranza",
  },
  table: {
    searchPlaceholder: "Buscar alumno...",
    filterMorosos: "Ver alumnos con cuotas vencidas",
    clearFilter: "Mostrando alumnos con cuotas vencidas (Borrar filtro)",
    headers: {
      student: "Alumno",
      expiry: "Vencimiento",
      status: "Estado",
      actions: "Acción",
    },
    emptySearchMessage: "No hay alumnos que coincidan con tu búsqueda",
    noCuota: "Sin cuota generada",
    registerPayment: "Registrar Pago",
    saving: "Guardando...",
    notify: "Recordar",
  },
  notifications: {
    whatsappMessage: (nombre: string, monto: number) => 
      `¡Hola ${nombre}! Te escribo del gimnasio para recordarte el vencimiento de tu cuota mensual ($${monto.toLocaleString()}). ¡Cualquier duda avisame, muchas gracias!`,
    errorRegistering: "Hubo un error al registrar el cobro",
    connectionError: "Error de conexión",
  },
  actions: {
    error: {
      unauthorized: "No autorizado",
      load_failed: "Error cargando finanzas",
      general: "Error al procesar el cobro.",
      planNotFound: "Plan no encontrado"
    }
  }
};
