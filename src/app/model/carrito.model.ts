import { Producto } from "./producto.model";

// Para el carrito en el frontend
export interface ArticuloPedido extends Producto {
    cantidad: number;
}

// Para enviar al backend
export interface Pedido {
  clienteId: number;
  asesorId: number;
  detalles: {
    productoCodigo: string;
    cantidad: number;
    precioUnitario: number;
  }[];
}

