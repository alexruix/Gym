export const inviteStudentCopy = {
  header: {
    title: "Invitar alumno",
    subtitle: "Completa los datos básicos para invitar a un nuevo alumno.",
  },
  sections: {
    basicInfo: "Información básica",
    planAndDates: "Planificación y fechas",
    optionalInfo: "Notas internas (Solo Profe)",
  },
  labels: {
    nombre: "Nombre",
    email: "Email",
    plan: "Plan",
    fechaInicio: "Fecha inicio",
    diaPago: "Día de pago",
    telefono: "Teléfono",
    monto: "Monto",
    cobrarPrimerMes: "Cobrar primer mes",
    fechaNacimiento: "Fecha de nacimiento",
  },
  placeholders: {
    nombre: "Ej: Juan García",
    email: "Ej: juan@email.com",
    plan: "Seleccionar planificación",
    telefono: "+54 9 11 2345-6789",
    monto: "20000",
    notas: "Ej: Lesión en rodilla, viene de otro gimnasio...",
  },
  hints: {
    nombre: "Tu alumno",
    email: "Le enviaremos un link de acceso a la app (Magic Link).",
    plan: "¿Qué va a entrenar?",
    fechaInicio: " ",
    diaPago: "Día del mes en que vence su cuota.",
    telefono: "Para contactarlo por WhatsApp (sin el 0 ni el 15).",
    monto: "Solo como referencia. No se cobra automáticamente en MiGym.",
    notas: "Solo las ves vos.",
    cobrarPrimerMes: "Marcar si el alumno ya pagó su primer mes o debe hacerlo ahora.",
    fechaNacimiento: "Opcional.",
  },
  actions: {
    cancel: "Volver",
    submit: "Agregar",
    submitting: "Agregando...",
    today: "Hoy",
  },
  messages: {
    helper: "Toma 2 minutos",
    successModal: {
      title: "¡{name} ya es parte de MiGym! 🎉",
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
    subtitle: "Gestioná a tus alumnos, sus rutinas y seguimientos.",
    actions: {
      import: "Importar Excel",
      new: "Nuevo alumno",
    }
  },
  list: {
    title: "Todos los alumnos",
    empty: "Aún no tenés alumnos cargados.",
    emptySearch: "No encontramos alumnos que coincidan con tu búsqueda.",
    action: "Ver todos",
    columns: {
      name: "Nombre",
      plan: "Plan actual",
      status: "Estado",
    },
    filters: {
      searchPlaceholder: "Buscar por alumno o plan...",
      plan: {
        all: "Todos los planes",
      }
    },
    dropdownMenu: {
      editProfile: "Editar perfil",
      editRoutine: "Editar rutina",
      registerPayment: "Registrar pago",
      copyMagicLink: "Copiar link de acceso",
      sendWhatsApp: "Enviar WhatsApp",
      archive: "Archivar",
      triggerAria: "Abrir opciones de: ",
    },
    import: {
      title: "Importar Alumnos",
      description: "Subí tu Excel o CSV con las columnas Nombre, Email, o Teléfono para traer a tus clientes a MiGym de una vez.",
      dropzone: "Arrastrá tu Excel acá o hacé clic",
      hint: "Soporta .xlsx, .xls, .csv",
      empty: "El archivo no tiene filas para procesar.",
      error: "No se pudo leer el Excel. Aseguráte que el archivo no esté corrupto.",
      success: "¡Bien hecho! Se importaron {count} nuevos alumnos.",
      preview: "Vista Previa (Primeros 5)",
      cancel: "Cancelar",
      confirm: "Importar a MiGym",
      columns: {
        name: "Nombre",
        email: "Email",
        phone: "WhatsApp"
      }
    }
  }
} as const;

export const personalizationCopy = {
  routines: {
    exerciseCard: {
      rotation: {
        label: "Rotativo",
        btn: "Alternar ejercicios...",
        active: "Rotación activa",
        duration: "Rotar cada",
        weeks: "semanas",
        selectExercise: "Elegir alternativos (máx. 3)",
      }
    }
  },
  exerciseModal: {
    searchPlaceholder: "Buscar en tu biblioteca...",
  }
} as const;
