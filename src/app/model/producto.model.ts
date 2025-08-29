


// Define la estructura de un Producto y de una Página de productos
export interface Producto {
  codigo: string; 
  nombre: string;
  precioUnitario: number;
  imagenUrl?: string; // Opcional, para la ruta 'assets/images/...'
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}