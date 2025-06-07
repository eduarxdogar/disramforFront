import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Carrito } from '../model/carrito.model';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CarritoComprasService {
   
    public _lineas = new BehaviorSubject<Carrito[]>([]);
    lineas$ = this._lineas.asObservable();

     constructor(private http: HttpClient) {}


    agregarLinea(linea: Carrito) {
    const actuales = this._lineas.value;
    const idx = actuales.findIndex(l => l.productoCodigo === linea.productoCodigo);
    if (idx >= 0) {
      // ya existe, sumamos cantidad
      actuales[idx].cantidad += linea.cantidad;
    } else {
      actuales.push({ ...linea });
    }
    this._lineas.next([...actuales]);
  }
    actualizarCantidad(codigo: string, nueva: number) {
    const actuales = this._lineas.value.map(l =>
      l.productoCodigo === codigo ? { ...l, cantidad: nueva } : l
    );
    this._lineas.next(actuales);
  }
    eliminarLinea(codigo: string) {
    this._lineas.next(this._lineas.value.filter(l => l.productoCodigo !== codigo));
  }
  
  vaciar() {
    this._lineas.next([]);
  }


}
