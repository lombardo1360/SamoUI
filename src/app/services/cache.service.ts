import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutos por defecto

  constructor() { }

  /**
   * Obtener datos del caché si están disponibles y no han expirado
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    const isExpired = (now - item.timestamp) > item.expiresIn;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Guardar datos en caché
   */
  set<T>(key: string, data: T, expiresIn: number = this.DEFAULT_CACHE_TIME): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn
    };
    
    this.cache.set(key, item);
  }

  /**
   * Verificar si una clave existe en caché y no ha expirado
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Eliminar una entrada específica del caché
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpiar entradas expiradas
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      const isExpired = (now - item.timestamp) > item.expiresIn;
      if (isExpired) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtener el tamaño actual del caché
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Wrapper para cachear observables automáticamente
   */
  cacheObservable<T>(
    key: string, 
    observableFactory: () => Observable<T>, 
    expiresIn: number = this.DEFAULT_CACHE_TIME
  ): Observable<T> {
    // Verificar si ya tenemos datos en caché
    const cachedData = this.get<T>(key);
    
    if (cachedData !== null) {
      return of(cachedData);
    }

    // Si no hay datos en caché, ejecutar el observable y cachear el resultado
    return observableFactory().pipe(
      tap(data => this.set(key, data, expiresIn))
    );
  }

  /**
   * Crear una clave de caché basada en parámetros
   */
  createKey(prefix: string, ...params: (string | number | boolean | null | undefined)[]): string {
    const cleanParams = params
      .filter(p => p !== null && p !== undefined)
      .map(p => String(p))
      .join('_');
    
    return cleanParams ? `${prefix}_${cleanParams}` : prefix;
  }
}
