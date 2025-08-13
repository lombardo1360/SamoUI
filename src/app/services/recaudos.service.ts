import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, RecaudoOperacion, TablaDato, DatoTabla, ConvenioRecaudoConfigurationList, ConvenioRecaudoDetalle, ActualizarConvenioRecaudoRequest } from '../interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class RecaudosService {
  private readonly API_BASE_URL = 'https://userdatix-001-site1.qtempurl.com/api';

  constructor(private http: HttpClient) {}

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
   * Obtener recaudos por operación
   */
  getRecaudosOperacion(operacionId: string): Observable<ApiResponse<RecaudoOperacion[]>> {
    const params = new HttpParams().set('operacionId', operacionId);
    
    return this.http.get<ApiResponse<RecaudoOperacion[]>>(
      `${this.API_BASE_URL}/Recaudos/RecaudosOperacion`,
      { params }
    );
  }

  /**
   * Obtener todas las tablas y sus datos
   */
  getTablasYDatos(): Observable<ApiResponse<TablaDato[]>> {
    return this.http.get<ApiResponse<TablaDato[]>>(`${this.API_BASE_URL}/TablaDato/tablasYDatos`);
  }

  /**
   * Obtener solo los datos de la tabla AmbitosAtencionMedica
   */
  getAmbitosAtencionMedica(): Observable<DatoTabla[]> {
    return new Observable(observer => {
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
    });
  }

  /**
   * Obtener solo los datos de la tabla OtrasExcepcionesRecaudo
   */
  getOtrasExcepcionesRecaudo(): Observable<DatoTabla[]> {
    return new Observable(observer => {
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
    });
  }

  /**
   * Obtener programas de convenio recaudo
   */
  getProgramasConvenioRecaudo(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_BASE_URL}/Programas/programasConvenioRecaudo`);
  }

  /**
   * Configurar convenio recaudo
   */
  configurarConvenioRecaudo(configuracion: any): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>(`${this.API_BASE_URL}/ConvenioRecaudo/ConfigurarConvenioRecaudo`, configuracion).subscribe({
        next: (response) => {
          console.log('✅ Configuración enviada exitosamente:', response);
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
   * Obtener convenios recaudo configurados con paginación
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
    
    return this.http.get<ApiResponse<ConvenioRecaudoConfigurationList>>(
      `${this.API_BASE_URL}/ConvenioRecaudo/ConvenioRecaudoConfigurados`,
      { params }
    );
  }

  /**
   * Obtener convenio recaudo configurado por ID
   */
  getConvenioRecaudoConfiguradoPorId(id: number): Observable<ApiResponse<ConvenioRecaudoDetalle>> {
    return this.http.get<ApiResponse<ConvenioRecaudoDetalle>>(
      `${this.API_BASE_URL}/ConvenioRecaudo/ConvenioRecaudoConfigurado/${id}`
    );
  }

  /**
   * Actualizar convenio recaudo configurado
   */
  actualizarConvenioRecaudo(convenioData: ActualizarConvenioRecaudoRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.API_BASE_URL}/ConvenioRecaudo/UpdateConvenioRecaudo`,
      convenioData
    );
  }

  /**
   * Inactivar/Desactivar convenio recaudo configurado
   */
  inactivarConvenioRecaudo(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.API_BASE_URL}/ConvenioRecaudo/InactivarConvenioRecaudo/${id}`
    );
  }
}