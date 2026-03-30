export const inviteStudentCopy = {
  header: {
    title: "Invitar Alumno",
    subtitle: "Agregá a alguien nuevo a tu gimnasio.",
  },
  sections: {
    basicInfo: "Información básica",
    planAndDates: "Plan y fechas",
    optionalInfo: "Más información (Opcional)",
  },
  labels: {
    nombre: "Nombre",
    email: "Email",
    plan: "Plan",
    fechaInicio: "Fecha inicio",
    diaPago: "Día de pago",
    telefono: "Teléfono",
    monto: "Monto",
    notas: "Notas internas",
  },
  placeholders: {
    nombre: "Ej: Juan García",
    email: "Ej: juan@email.com",
    plan: "Seleccionar plan",
    telefono: "+54 9 11 2345-6789",
    monto: "20000",
    notas: "Ej: Lesión en rodilla, viene de otro gimnasio...",
  },
  hints: {
    nombre: "Tu alumno",
    email: "Le enviaremos un link de acceso a la app (Magic Link).",
    plan: "¿Qué va a entrenar?",
    fechaInicio: "Cuándo arranca a entrenar con este plan.",
    diaPago: "Día del mes en que vence su membresía.",
    telefono: "Para contactarlo por WhatsApp (sin el 0 ni el 15).",
    monto: "Solo como referencia. No se cobra automáticamente en MiGym.",
    notas: "Solo las ves vos.",
  },
  actions: {
    cancel: "Volver",
    submit: "Invitar alumno/a",
    submitting: "Invitando...",
  },
  messages: {
    helper: "Toma 2 minutos",
    successModal: {
      title: "¡{name} ya es parte de NODO! 🎉",
      description1: "Ya le enviamos su link de acceso por email.",
      description2: "Su primer vencimiento es el {date}.",
      btnWhatsapp: "Copiar link para WhatsApp",
      btnProfile: "Ir a su ficha",
      linkCopied: "Link copiado al portapapeles"
    },
    error: "No se pudo invitar. Probá de nuevo o contactá a soporte.",
    emailExists: "Este email ya está en uso. ¿Probás con otro?",
    planNotFound: "El plan seleccionado no es válido.",
  }
} as const;

export const alumnosListCopy = {
  header: {
    title: "Alumnos",
    subtitle: "Gestioná a tus alumnos, sus planes y seguimientos.",
  },
  list: {
    searchPlaceholder: "Buscar alumno por nombre o email...",
    action: "Invitar Alumno",
    noResults: "No se encontraron alumnos con esa búsqueda.",
    status: {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
    },
    dropdownMenu: {
      viewProfile: "Ver perfil",
      editRoutine: "Editar rutina",
      registerPayment: "Registrar pago",
      viewProgress: "Ver progreso",
      copyMagicLink: "Copiar link",
      sendWhatsApp: "Enviar WhatsApp",
      archive: "Archivar",
      triggerAria: "Abrir menú de acciones",
    },
    columns: {
      name: "Alumno",
      plan: "Plan",
      status: "Estado",
    }
  },
  emptyState: {
    title: "Aún no tenés alumnos",
    description: "Empezá invitando a tu primer alumno para asignarles planes y rutinas.",
    action: "Invitar Alumno"
  }
} as const;

