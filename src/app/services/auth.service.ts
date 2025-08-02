import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { ApiResponse, LoginRequest, LoginResponse, TokenPayload } from '../interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'https://userdatix-001-site1.qtempurl.com/api';
  private readonly CREDENTIALS = {
    Username: 'samodl',
    Password: 'ColomBia2024*+'
  };

  private tokenSubject = new BehaviorSubject<string | null>(null);
  private operacionIdSubject = new BehaviorSubject<string | null>(null);
  private convenioIdSubject = new BehaviorSubject<string | null>(null);

  public token$ = this.tokenSubject.asObservable();
  public operacionId$ = this.operacionIdSubject.asObservable();
  public convenioId$ = this.convenioIdSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Solo hacer login si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.autoLogin();
    }
  }

  /**
   * Realizar login automático con credenciales predefinidas
   */
  private autoLogin(): void {
    console.log('Iniciando login automático para obtener token...');
    this.login(this.CREDENTIALS).subscribe({
      next: (response) => {
        console.log('Login automático exitoso:', response);
      },
      error: (error) => {
        console.error('Error en login automático:', error);
      }
    });
  }

  /**
   * Realizar login y obtener token
   */
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_BASE_URL}/Login`, credentials)
      .pipe(
        tap(response => {
          if (response.codigo === 200 && response.datos?.token) {
            this.setToken(response.datos.token);
            console.log('Token obtenido y guardado:', response.datos.token);
          }
        })
      );
  }

  /**
   * Establecer token y extraer operacionId
   */
  private setToken(token: string): void {
    // Solo guardar en localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
    this.tokenSubject.next(token);

    // Decodificar token para obtener operacionId y convenioId
    const payload = this.decodeToken(token);
    if (payload) {
      if (payload.OperacionId) {
        this.operacionIdSubject.next(payload.OperacionId);
        console.log('OperacionId extraído del token:', payload.OperacionId);
      }
      if (payload.ConvenioId) {
        this.convenioIdSubject.next(payload.ConvenioId);
        console.log('ConvenioId extraído del token:', payload.ConvenioId);
      }
    }
  }

  /**
   * Decodificar token JWT completo
   */
  private decodeToken(token: string): TokenPayload | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as TokenPayload;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Extraer operacionId del token JWT (método mantenido por compatibilidad)
   */
  private extractOperacionIdFromToken(token: string): string | null {
    const payload = this.decodeToken(token);
    return payload?.OperacionId || null;
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Obtener operacionId actual
   */
  getOperacionId(): string | null {
    return this.operacionIdSubject.value;
  }

  /**
   * Obtener convenioId actual
   */
  getConvenioId(): string | null {
    return this.convenioIdSubject.value;
  }

  /**
   * Verificar si un token es válido
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedPayload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? this.isTokenValid(token) : false;
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
    }
    this.tokenSubject.next(null);
    this.operacionIdSubject.next(null);
    this.convenioIdSubject.next(null);
  }
}
