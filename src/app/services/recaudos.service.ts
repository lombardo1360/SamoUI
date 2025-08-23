import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, RecaudoOperacion, TablaDato, DatoTabla, ConvenioRecaudoConfigurationList, ConvenioRecaudoDetalle, ActualizarConvenioRecaudoRequest } from '../interfaces/api.interface';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class RecaudosService {
  private readonly API_BASE_URL = 'https://userdatix-001-site1.qtempurl.com/api';
  
  // Configuración de tiempos de caché (en milisegundos)
  private readonly CACHE_TIMES = {
    STATIC_DATA: 30 * 60 * 1000,    // 30 minutos para datos estáticos
    RECAUDOS: 15 * 60 * 1000,       // 15 minutos para recaudos
    CONFIGURATIONS: 5 * 60 * 1000,   // 5 minutos para configuraciones
    DETAILS: 2 * 60 * 1000           // 2 minutos para detalles específicos
  };

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  /**
   * Decodificar JWT token y extraer ConvenioId
   */
  decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return null;
    }
  }

  /**
   * Extraer ConvenioId del token JWT
   */
  getConvenioIdFromToken(token: string): string | null {
    const payload = this.decodeJWT(token);
    return payload?.ConvenioId || null;
  }

  /**
   * Obtener recaudos por operación (con caché)
   */
  getRecaudosOperacion(operacionId: string): Observable<ApiResponse<RecaudoOperacion[]>> {
    const cacheKey = this.cacheService.createKey('recaudos_operacion', operacionId);
    
    return this.cacheService.cacheObservable(
      cacheKey,
      () => {
        const params = new HttpParams().set('operacionId', operacionId);
        return this.http.get<ApiResponse<RecaudoOperacion[]>>(
          `${this.API_BASE_URL}/Recaudos/RecaudosOperacion`,
          { params }
        );
      },
      this.CACHE_TIMES.RECAUDOS
    );
  }

  /**
   * Obtener todas las tablas y sus datos (con caché)
   */
  getTablasYDatos(): Observable<ApiResponse<TablaDato[]>> {
    const cacheKey = 'tablas_datos';
    
    return this.cacheService.cacheObservable(
      cacheKey,
      () => this.http.get<ApiResponse<TablaDato[]>>(`${this.API_BASE_URL}/TablaDato/tablasYDatos`),
      this.CACHE_TIMES.STATIC_DATA
    );
  }

  /**
   * Obtener solo los datos de la tabla AmbitosAtencionMedica (con caché)
   */
  getAmbitosAtencionMedica(): Observable<DatoTabla[]> {
    const cacheKey = 'ambitos_atencion_medica';
    
    return this.cacheService.cacheObservable(
      cacheKey,
      () => new Observable<DatoTabla[]>(observer => {
        this.getTablasYDatos().subscribe({
          next: (response) => {
            if (response.codigo === 200) {
              const ambitosTabla = response.datos.find(tabla => 
                tabla.tabla.name === 'AmbitosAtencionMedica'
              );
              observer.next(ambitosTabla?.datos || []);
              observer.complete();
            } else {
              observer.error(`Error: ${response.mensaje}`);
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      }),
      this.CACHE_TIMES.STATIC_DATA
    );
  }

  /**
   * Obtener solo los datos de la tabla OtrasExcepcionesRecaudo (con caché)
   */
  getOtrasExcepcionesRecaudo(): Observable<DatoTabla[]> {
    const cacheKey = 'otras_excepciones_recaudo';
    
    return this.cacheService.cacheObservable(
      cacheKey,
      () => new Observable<DatoTabla[]>(observer => {
        this.getTablasYDatos().subscribe({
          next: (response) => {
            if (response.codigo === 200) {
              const excepcionesTabla = response.datos.find(tabla => 
                tabla.tabla.name === 'OtrasExcepcionesRecaudo'
              );
              observer.next(excepcionesTabla?.datos || []);
              observer.complete();
            } else {
              observer.error(`Error: ${response.mensaje}`);
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      }),
      this.CACHE_TIMES.STATIC_DATA
    );
  }

  /**
   * Obtener programas de convenio recaudo (con caché)
   */
  getProgramasConvenioRecaudo(): Observable<ApiResponse<any[]>> {
    const cacheKey = 'programas_convenio_recaudo';
    
    return this.cacheService.cacheObservable(
      cacheKey,
      () => this.http.get<ApiResponse<any[]>>(`${this.API_BASE_URL}/Programas/programasConvenioRecaudo`),
      this.CACHE_TIMES.STATIC_DATA
    );
  }

  /**
   * Configurar convenio recaudo (SIN CACHÉ - siempre datos frescos)
   */
  configurarConvenioRecaudo(configuracion: any): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>(`${this.API_BASE_URL}/ConvenioRecaudo/ConfigurarConvenioRecaudo`, configuracion).subscribe({
        next: (response) => {
          console.log('✅ Configuración enviada exitosamente:', response);
          
          // NOTA: No es necesario invalidar caché ya que getConvenioRecaudoConfigurados() no usa caché
          // Solo invalidamos caché de detalles si es necesario
          this.invalidateConvenioDetailCache(configuracion.convenioRecaudo?.convenioId);
          
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('❌ Error al configurar convenio recaudo:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Obtener convenios recaudo configurados con paginación (SIN CACHÉ - siempre datos frescos)
   */
  getConvenioRecaudoConfigurados(
    pagina: number = 1, 
    tamanoPagina: number = 10, 
    convenioId?: string
  ): Observable<ApiResponse<ConvenioRecaudoConfigurationList>> {
    
    let params = new HttpParams()
      .set('Pagina', pagina.toString())
      .set('TamañoPagina', tamanoPagina.toString());
    
    // Agregar ConvenioId si se proporciona
    if (convenioId) {
      params = params.set('ConvenioId', convenioId);
    }
    
    // SIEMPRE consultar la API para obtener datos frescos
    return this.http.get<ApiResponse<ConvenioRecaudoConfigurationList>>(
      `${this.API_BASE_URL}/ConvenioRecaudo/ConvenioRecaudoConfigurados`,
      { params }
    );
  }

  /**
   * Obtener convenio recaudo configurado por ID (con caché)
   */
  getConvenioRecaudoConfiguradoPorId(id: number): Observable<ApiResponse<ConvenioRecaudoDetalle>> {
    const cacheKey = this.cacheService.createKey('convenio_recaudo_detalle', id);
    
    return this.cacheService.cacheObservable(
      cacheKey,
      () => this.http.get<ApiResponse<ConvenioRecaudoDetalle>>(
        `${this.API_BASE_URL}/ConvenioRecaudo/ConvenioRecaudoConfigurado/${id}`
      ),
      this.CACHE_TIMES.DETAILS
    );
  }

  /**
   * Actualizar convenio recaudo configurado (SIN CACHÉ - siempre datos frescos)
   */
  actualizarConvenioRecaudo(convenioData: ActualizarConvenioRecaudoRequest): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      this.http.put<ApiResponse<any>>(
        `${this.API_BASE_URL}/ConvenioRecaudo/UpdateConvenioRecaudo`,
        convenioData
      ).subscribe({
        next: (response) => {
          // NOTA: No es necesario invalidar caché ya que getConvenioRecaudoConfigurados() no usa caché
          // Solo invalidamos caché de detalles específicos
          this.invalidateConvenioDetailCache(convenioData.convenioRecaudo?.id);
          
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Inactivar/Desactivar convenio recaudo configurado (SIN CACHÉ - siempre datos frescos)
   */
  inactivarConvenioRecaudo(id: number): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      this.http.delete<ApiResponse<any>>(
        `${this.API_BASE_URL}/ConvenioRecaudo/InactivarConvenioRecaudo/${id}`
      ).subscribe({
        next: (response) => {
          // NOTA: No es necesario invalidar caché ya que getConvenioRecaudoConfigurados() no usa caché
          // Solo invalidamos caché de detalles del convenio eliminado
          this.invalidateConvenioDetailCache(id);
          
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // ============ MÉTODOS DE GESTIÓN DE CACHÉ ============

  /**
   * Invalidar TODO el caché relacionado con convenios (para operaciones críticas)
   */
  private invalidateAllRelatedCache(convenioId?: number): void {
    // Limpiar caché de listas de convenios configurados
    this.invalidateAllConveniosCache();
    
    // Limpiar caché específico si se proporciona convenioId
    if (convenioId) {
      this.invalidateConvenioDetailCache(convenioId);
    }
  }

  /**
   * Limpiar TODO el caché del servicio (para operaciones de eliminación)
   */
  private invalidateAllCache(): void {
    this.cacheService.clear();
    console.log('🗑️ Todo el caché ha sido invalidado debido a operación crítica');
  }

  /**
   * Invalidar caché de convenios específicos
   */
  private invalidateConveniosCache(convenioId?: number): void {
    if (convenioId) {
      // Limpiar patrones conocidos que incluyan el convenioId
      this.cacheService.delete(this.cacheService.createKey('convenio_recaudo_configurados', 1, 10, convenioId.toString()));
    }
    
    // También limpiar cachés generales de convenios
    this.invalidateAllConveniosCache();
  }

  /**
   * Invalidar todo el caché de convenios configurados
   */
  private invalidateAllConveniosCache(): void {
    // Limpiar cachés de convenios configurados (diferentes páginas)
    for (let pagina = 1; pagina <= 10; pagina++) {
      for (let tamanoPagina of [5, 10, 20, 50]) {
        this.cacheService.delete(this.cacheService.createKey('convenio_recaudo_configurados', pagina, tamanoPagina));
        this.cacheService.delete(this.cacheService.createKey('convenio_recaudo_configurados', pagina, tamanoPagina, undefined));
      }
    }
    console.log('🔄 Caché de convenios configurados invalidado');
  }

  /**
   * Invalidar caché de detalle específico
   */
  private invalidateConvenioDetailCache(convenioId?: number): void {
    if (convenioId) {
      this.cacheService.delete(this.cacheService.createKey('convenio_recaudo_detalle', convenioId));
      console.log(`🔄 Caché de detalle de convenio ${convenioId} invalidado`);
    }
  }

  /**
   * Limpiar todo el caché del servicio (método público)
   */
  public clearAllCache(): void {
    this.cacheService.clear();
  }

  /**
   * Limpiar caché expirado (método público)
   */
  public clearExpiredCache(): void {
    this.cacheService.clearExpired();
  }
}