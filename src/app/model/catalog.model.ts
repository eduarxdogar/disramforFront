
// DTO para la respuesta de búsqueda (Búsqueda principal)
export interface AutoPartDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;   // "Toyota", etc.
  model: string;   // "Corolla", etc.
  imageUrl?: string;
  internalCode: string;
}

// Filtros son strings según la API (/filters/types -> ["Gaskets", "Seals"...])
export interface SearchCriteria {
  type: string | null;
  brand: string | null;
  model: string | null;
  engine: string | null;
  term?: string | null; // Added term for text search
}

// Interfaz para paginación (genérica) - Si no la tienes en otro lado comun
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
