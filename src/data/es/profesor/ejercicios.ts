export const exerciseLibraryCopy = {
  header: {
    title: "Ejercicios",
    subtitle: "Creá y organizá tu biblioteca de ejercicios que usás en tus rutinas.",
  },
  emptyState: {
    title: "Aún no sumaste ejercicios",
    description: "Los ejercicios son la base de tus planes. Guardalos una vez y reutilizalos con todos tus alumnos para ahorrar tiempo.",
    action: "Crear tu primer ejercicio"
  },
  list: {
    searchPlaceholder: "Buscar ejercicio por nombre...",
    action: "Crear",
    noResults: "No se encontraron ejercicios con esa búsqueda.",
    mediaIconTitle: "Tiene recurso audiovisual",
  },
  form: {
    title: "Crear nuevo ejercicio",
    description: "Añadí un nuevo ejercicio a tu listado.",
    labels: {
      nombre: "Nombre",
      descripcion: "Descripción (Opcional)",
      mediaUrl: "Enlace a video o imagen (Opcional)",
      tags: "Categoría / Grupo muscular",
    },
    placeholders: {
      nombre: "Ej: Sentadilla",
      descripcion: "Bajar rompiendo el paralelo, pecho arriba, rodillas alineadas con la punta del pie.",
      mediaUrl: "https://youtube.com/watch?v=...",
      tags: "Ej: Piernas, Empuje, Fuerza...",
    },
    quickTags: [
      "Piernas", "Pecho", "Espalda", "Brazos", "Hombros", "Abdominales", "Cardio"
    ],
    actions: {
      cancel: "Cancelar",
      submit: "Guardar",
      submitting: "Guardando...",
    },
    messages: {
      success: "Ejercicio guardado correctamente",
      error: "Hubo un error al guardar el ejercicio.",
    }
  },
  import: {
    title: "Importar Ejercicios",
    description: "Subí un archivo Excel (.xlsx) o CSV para añadir ejercicios masivamente.",
    dropzone: "Arrastrá tu archivo o hacé clic para buscar",
    hint: "El archivo debe tener al menos una columna llamada 'Nombre'.",
    preview: "Previsualización de datos",
    confirm: "Importar ejercicios",
    cancel: "Cancelar",
    success: "✅ {count} ejercicios importados exitosamente",
    error: "❌ Error al procesar el archivo. Verificá el formato.",
    empty: "No se encontraron datos válidos en el archivo.",
  }
} as const;

export const blocksCopy = {
  header: {
    title: "Bloques",
    subtitle: "Agrupá ejercicios que siempre van juntos para armar planes más rápido.",
  },
  list: {
    searchPlaceholder: "Buscar bloques...",
    action: "Crear bloque",
    noResults: "No tenés bloques guardados con ese nombre.",
    empty: "Aún no tenés bloques. Creá uno desde aquí o desde el creador de planes.",
  },
  form: {
    title: "Nuevo bloque",
    saveAsBlock: "Guardar como bloque",
    labels: {
      nombre: "Nombre del bloque",
      ejercicios: "Ejercicios incluidos",
    },
    placeholders: {
      nombre: "Ej: Movilidad Inicial, Circuito Core...",
    },
    messages: {
      success: "Bloque guardado y disponible para tus planes",
      error: "No se pudo guardar el bloque.",
    }
  },
  search: {
    title: "Mis Bloques",
    description: "Seleccioná un bloque para insertarlo en la rutina actual.",
    hoverPreview: "Ejercicios en este bloque:",
    quickFilters: {
      warmup: "Warmup",
      fuerza: "Fuerza",
      finisher: "Finisher",
    }
  }
} as const;

export const addElementCopy = {
  title: "Añadir elemento",
  description: "Seleccionar item a integrar.",
  options: {
    exercise: {
      title: "Ejercicio",
      description: "Ejercicios de fuerza, técnicos o accesorios con series y repeticiones.",
    },
    block: {
      title: "Bloque",
      description: "Secuencias de ejercicios que se realizan en orden (Superseries, circuitos).",
    }
  }
} as const;
