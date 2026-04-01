/**
 * BaseEntity: Interfaz universal para recursos de MiGym (Alumnos, Planes, Ejercicios).
 * Permite que los componentes core operen de forma agnóstica al tipo de dato.
 */
export interface BaseEntity {
    id: string;
    /** Nombre principal para visualización y búsqueda */
    name: string;
    /** Etiquetas para filtrado por hashtags */
    tags?: string[];
    /** Fecha de creación o relevancia para ordenamiento */
    createdAt?: string | Date;
    /** Datos adicionales específicos de la entidad para slots de renderizado */
    metadata?: Record<string, any>;
}

export type SortOrder = string;

export interface SortOption {
    label: string;
    value: SortOrder;
}
