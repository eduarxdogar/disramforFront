import { Producto } from './producto.model';

// Interfaz para los artículos que se muestran en el carrito del frontend
export interface ArticuloPedido extends Producto {
    cantidad: number;
}

// Interfaz para la petición que se ENVIARÁ al backend
// Coincide 1:1 con tu PedidoRequestDTO.java
export interface PedidoRequest {
  clienteId: number;
  asesorId: number;
  items: {
    productoCodigo: string;
    cantidad: number;
  }[];
}

export interface PedidoResumen {
  id: number;
  fecha: string;
  clienteNombre: string;
  asesorNombre: string;
  estado: string;
  total: number;
}

export interface PedidoDetallado {
    id: number;
    clienteId: number;
    fecha: string;
    clienteNombre: string;
    clienteNit: string;
    estado: string;
    total: number;
    items: {
imagenUrl: any;
        espacio: string;
        nivel: string;
        pasillo: string;
        id: number;
        productoNombre: string;
        precioUnitario: number;
        subtotal: number;
        productoCodigo: string;
        cantidad: number;
    }[];
    asesor: string;
    ciudadEntrega: string;
    direccionEntrega: string;
}