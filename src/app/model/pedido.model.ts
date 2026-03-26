import { Producto } from './producto.model';
import { EstadoPedido } from './estado-pedido.model'; // Importamos el enum

// Interfaz para los artículos que se muestran en el carrito del frontend
export interface ArticuloPedido extends Producto {
    cantidad: number;
}

// Interfaz para la petición que se ENVIARÁ al backend
export interface PedidoRequest {
  clienteId: number;
  asesorId: number; // Asegúrate de que este campo se maneje correctamente
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
  estado: EstadoPedido; // Usamos el enum para consistencia
  total: number;
}

export interface PedidoDetallado {
    id: number;
    clienteId: number;
    fecha: string;
    clienteNombre: string;
    clienteNit: string;
    estado: EstadoPedido; // Usamos el enum aquí también

    // --- NUEVOS CAMPOS DEL BACKEND ---
    subtotal: number;
    descuento: number;
    iva: number;
    // ---------------------------------

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

