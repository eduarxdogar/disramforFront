

// Modelo para respuestas del backend (GET)
export interface Cliente {
  id?: number;
  nit?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  asesorId?: number; // Solo para respuestas del backend
}

// Modelo para creación o actualización (POST/PUT)
export interface ClienteRequest {
  id?: number;
  nit?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  asesorId?: number; // Solo para solicitudes del ADMIN
}

// Modelo de la respuesta paginada del backend
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
