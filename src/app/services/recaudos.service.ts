import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, RecaudoOperacion, TablaDato, DatoTabla, ConvenioRecaudoConfigurationList } from '../interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class RecaudosService {
  private readonly API_BASE_URL = 'https://userdatix-001-site1.qtempurl.com/api';

  constructor(private http: HttpClient) {}

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
  /**
   * Obtener convenios recaudo configurados con paginación
   */
  getConvenioRecaudoConfigurados(pagina: number = 1, tamanoPagina: number = 10): Observable<ApiResponse<ConvenioRecaudoConfigurationList>> {
    const params = new HttpParams()
      .set('Pagina', pagina.toString())
      .set('TamañoPagina', tamanoPagina.toString());
    
    return this.http.get<ApiResponse<ConvenioRecaudoConfigurationList>>(
      `${this.API_BASE_URL}/ConvenioRecaudo/ConvenioRecaudoConfigurados`,
      { params }
    );
  }
}