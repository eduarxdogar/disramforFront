// src/app/models/pedido.model.ts
export interface DetallePedido {
  productoCodigo: number;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  fecha: string;
  estado: string;
  total: number;
  ciudadEntrega: string;    // ←
  direccionEntrega: string;
  items: DetallePedido[];
}

export interface PedidoRequest {
  clienteId: number;
  items: {
    productoCodigo: number;
    cantidad: number;
  }[];
}
