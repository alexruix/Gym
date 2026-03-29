export const exerciseLibraryCopy = {
  header: {
    title: "Biblioteca de Ejercicios",
    subtitle: "El catálogo de todos los movimientos y técnicas que usás en tus rutinas.",
  },
  emptyState: {
    title: "Aún no sumaste ejercicios",
    description: "Los ejercicios son la base de tus planes. Guardalos una vez y reutilizalos con todos tus alumnos para ahorrar tiempo.",
    action: "+ Crear tu primer ejercicio"
  },
  list: {
    searchPlaceholder: "Buscar ejercicio por nombre...",
    action: "+ Nuevo ejercicio",
    noResults: "No se encontraron ejercicios con esa búsqueda.",
    mediaIconTitle: "Tiene recurso audiovisual",
  },
  form: {
    title: "Crear nuevo ejercicio",
    description: "Añadí un nuevo movimiento a tu catálogo personal.",
    labels: {
      nombre: "Nombre del Ejercicio",
      descripcion: "Descripción o Notas Técnicas (Opcional)",
      mediaUrl: "Enlace a Video o Imagen (YouTube, Drive, etc.) - Opcional",
    },
    placeholders: {
      nombre: "Ej: Sentadilla con Barra Libres",
      descripcion: "Bajar rompiendo el paralelo, pecho arriba, rodillas alineadas con la punta del pie.",
      mediaUrl: "https://youtube.com/watch?v=...",
    },
    actions: {
      cancel: "Cancelar",
      submit: "Guardar Ejercicio",
      submitting: "Guardando...",
    },
    messages: {
      success: "✅ Ejercicio guardado en tu biblioteca",
      error: "Hubo un error al guardar el ejercicio.",
    }
  }
} as const;
