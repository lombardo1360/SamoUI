import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, TablaDato, DatoTabla } from '../interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class TablaDatoService {
  private readonly API_BASE_URL = 'https://userdatix-001-site1.qtempurl.com/api';

  constructor(private http: HttpClient) { }

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
}
