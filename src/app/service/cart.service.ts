import { Injectable, signal, computed } from '@angular/core';
import { ArticuloPedido } from '../model/pedido.model';
import { Producto } from '../model/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signal privado para el estado del carrito
  private _items = signal<ArticuloPedido[]>([]);

  // Signal público (Readonly) para ser consumido por componentes
  public items = this._items.asReadonly();

  // Signal computado para el subtotal
  public subtotal = computed(() => 
    this._items().reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0)
  );

  // Signal computado para el conteo total de items
  public totalItems = computed(() => 
    this._items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe.
   */
  agregarProducto(producto: Producto): void {
    const currentItems = this._items();
    const itemIndex = currentItems.findIndex(item => item.codigo === producto.codigo);

    if (itemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        cantidad: updatedItems[itemIndex].cantidad + 1
      };
      this._items.set(updatedItems);
    } else {
      this._items.set([...currentItems, { ...producto, cantidad: 1 }]);
    }
  }

  /**
   * Actualiza la cantidad de un producto específico.
   */
  actualizarCantidad(producto: Producto, cantidad: number): void {
    const currentItems = this._items();
    const itemIndex = currentItems.findIndex(item => item.codigo === producto.codigo);

    if (cantidad <= 0) {
      this.eliminarDelPedido(producto.codigo);
      return;
    }

    if (itemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], cantidad };
      this._items.set(updatedItems);
    } else {
      // Si no existe, lo agrega con la cantidad indicada
      this._items.set([...currentItems, { ...producto, cantidad }]);
    }
  }

  /**
   * Decrementa la cantidad o elimina si llega a 0.
   */
  quitarProducto(producto: Producto): void {
    const currentItems = this._items();
    const itemIndex = currentItems.findIndex(item => item.codigo === producto.codigo);

    if (itemIndex > -1) {
      if (currentItems[itemIndex].cantidad > 1) {
        const updatedItems = [...currentItems];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          cantidad: updatedItems[itemIndex].cantidad - 1
        };
        this._items.set(updatedItems);
      } else {
        this.eliminarDelPedido(producto.codigo);
      }
    }
  }

  /**
   * Elimina un producto del carrito por su código.
   */
  eliminarDelPedido(codigo: string): void {
    this._items.update(items => items.filter(item => item.codigo !== codigo));
  }

  /**
   * Limpia todos los items del carrito.
   */
  limpiarPedido(): void {
    this._items.set([]);
  }

  /**
   * Obtiene la cantidad actual de un producto en el carrito.
   */
  obtenerCantidad(codigo: string): number {
    const item = this._items().find(i => i.codigo === codigo);
    return item ? item.cantidad : 0;
  }
}
