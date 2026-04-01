export const exerciseLibraryCopy = {
  header: {
    title: "Ejercicios",
    subtitle: "Crea y organiza tu biblioteca de ejercicios que usas en tus rutinas.",
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
      tags: "Etiquetas / Grupo Muscular",
    },
    placeholders: {
      nombre: "Ej: Sentadilla con Barra Libres",
      descripcion: "Bajar rompiendo el paralelo, pecho arriba, rodillas alineadas con la punta del pie.",
      mediaUrl: "https://youtube.com/watch?v=...",
      tags: "Ej: Cuádriceps, Empuje, Fuerza...",
    },
    quickTags: [
      "Piernas", "Pecho", "Espalda", "Brazos", "Hombros", "Abdominales", "Cardio"
    ],
    actions: {
      cancel: "Cancelar",
      submit: "Guardar Ejercicio",
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
