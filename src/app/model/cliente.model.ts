

// Modelo para respuestas del backend (GET)
export interface Cliente {
  id?: number;
  nit?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
}

// Modelo para creación o actualización (POST/PUT)
export interface ClienteRequest {
  nit?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
}

// Modelo de la respuesta paginada del backend
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
