import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CarritoComprasService {

    public _lineas = new BehaviorSubject<any[]>([]);
    lineas$ = this._lineas.asObservable();

     constructor(private http: HttpClient) {}


    
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
