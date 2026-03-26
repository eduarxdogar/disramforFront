import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { SearchCriteria, Page, AutoPartDTO } from '../model/catalog.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl; 

  // ... Cache para filtros (listas de strings)
  private cacheSize = 1;

  // 1. Get Types -> GET /filters/types
  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/filters/types`)
      .pipe(shareReplay(this.cacheSize));
  }

  // 2. Get Brands -> GET /filters/brands?type=...
  getBrands(type: string): Observable<string[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<string[]>(`${this.baseUrl}/filters/brands`, { params })
      .pipe(shareReplay(this.cacheSize));
  }

  // 3. Get Models -> GET /filters/models?type=...&brand=...
  getModels(type: string, brand: string): Observable<string[]> {
    const params = new HttpParams()
      .set('type', type)
      .set('brand', brand);
    return this.http.get<string[]>(`${this.baseUrl}/filters/models`, { params })
      .pipe(shareReplay(this.cacheSize));
  }

  // 4. Get Engines -> GET /filters/engines?type=...&brand=...&model=...
  getEngines(type: string, brand: string, model: string): Observable<string[]> {
    const params = new HttpParams()
      .set('type', type)
      .set('brand', brand)
      .set('model', model);
    return this.http.get<string[]>(`${this.baseUrl}/filters/engines`, { params })
      .pipe(shareReplay(this.cacheSize));
  }

  // 5. Search Endpoint -> GET /autoparts
  searchParts(criteria: Partial<SearchCriteria>, page: number = 0, size: number = 10): Observable<Page<AutoPartDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Helper to add param if value exists
    const addParam = (key: string, value: string | null | undefined) => {
      if (value && value.trim() !== '') {
        params = params.set(key, value);
      }
    };

    addParam('type', criteria.type);
    addParam('brand', criteria.brand);
    addParam('model', criteria.model);
    addParam('engine', criteria.engine);
    addParam('term', criteria.term);

     return this.http.get<Page<AutoPartDTO>>(`${this.baseUrl}/autoparts`, { params });
  }

  /**
   * ADAPTADOR: Convierte el DTO del backend a nuestro modelo interno de Producto.
   * Centraliza la lógica de "fallback" para nombres de campos inconsistentes.
   */
  mapToProducto(part: any): any {
    return {
      codigo: part.codigo || part.id || part.partNumber || part.internalCode || 'ERR-CODIGO',
      nombre: part.name || part.nombre,
      precioUnitario: part.price || part.precioUnitario || 0,
      imagenUrl: part.imageUrl || part.imagenUrl,
      descripcion: part.description || part.descripcion || part.name
    };
  }
}
