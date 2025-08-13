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
    // Auto-login se manejará condicionalmente
  }

  /**
   * Inicializar servicio (llamar solo si no hay token en URL)
   */
  initialize(): void {
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
   * Establecer token desde URL (no requiere login)
   */
  setTokenFromUrl(token: string): void {
    console.log('🔑 Estableciendo token desde URL:', token);
    
    // Validar formato del token
    if (this.isValidJWTFormat(token)) {
      console.log('✅ Formato de token JWT válido');
      this.setToken(token);
    } else {
      console.log('❌ Error: Token no tiene formato JWT válido');
    }
  }

  /**
   * Validar formato básico de JWT
   */
  private isValidJWTFormat(token: string): boolean {
    return typeof token === 'string' && token.split('.').length === 3;
  }

  /**
   * Establecer token y extraer operacionId
   */
  private setToken(token: string): void {
    console.log('🔧 Guardando token en localStorage...');
    
    // Solo guardar en localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
      console.log('✅ Token guardado en localStorage');
      
      // Verificar que se guardó correctamente
      const storedToken = localStorage.getItem('auth_token');
      console.log('🔍 Token verificado en localStorage:', storedToken ? 'Presente' : 'Ausente');
    } else {
      console.log('⚠️ No estamos en navegador, no se puede guardar en localStorage');
    }
    
    this.tokenSubject.next(token);
    console.log('📡 Token enviado al subject');

    // Decodificar token para obtener operacionId y convenioId
    const payload = this.decodeToken(token);
    console.log('🔓 Payload decodificado:', payload);
    
    if (payload) {
      if (payload.OperacionId) {
        this.operacionIdSubject.next(payload.OperacionId);
        console.log('✅ OperacionId extraído del token:', payload.OperacionId);
      }
      if (payload.ConvenioId) {
        this.convenioIdSubject.next(payload.ConvenioId);
        console.log('✅ ConvenioId extraído del token:', payload.ConvenioId);
      }
    } else {
      console.log('❌ Error: No se pudo decodificar el payload del token');
    }
  }

  /**
   * Decodificar token JWT completo
   */
  private decodeToken(token: string): TokenPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload)) as TokenPayload;
      
      // Verificar si el token ha expirado
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        console.log('⚠️ Token ha expirado');
        console.log('🕐 Tiempo actual:', currentTime);
        console.log('🕐 Token expira en:', decoded.exp);
        console.log('⏰ Diferencia (segundos):', decoded.exp - currentTime);
      } else {
        console.log('✅ Token válido, no ha expirado');
        if (decoded.exp) {
          const timeLeft = decoded.exp - currentTime;
          console.log(`⏰ Token expira en ${timeLeft} segundos (${Math.floor(timeLeft/60)} minutos)`);
        }
      }
      
      return decoded;
    } catch (error) {
      console.error('❌ Error al decodificar token:', error);
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
      const token = localStorage.getItem('auth_token');
      console.log('🔍 getToken() llamado - Token:', token ? 'Presente' : 'Ausente');
      return token;
    }
    console.log('🔍 getToken() llamado - No estamos en navegador');
    return null;
  }

  /**
   * Método para debugging - mostrar estado actual del token
   */
  debugTokenState(): void {
    console.log('=== DEBUG TOKEN STATE ===');
    console.log('🔍 Platform is browser:', isPlatformBrowser(this.platformId));
    
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Token en localStorage:', token ? `${token.substring(0, 20)}...` : 'NO ENCONTRADO');
      
      if (token) {
        const payload = this.decodeToken(token);
        console.log('🔓 Payload decodificado:', payload);
        console.log('🏢 ConvenioId:', payload?.ConvenioId);
        console.log('⚙️ OperacionId:', payload?.OperacionId);
        console.log('⏰ Expira:', payload?.exp ? new Date(payload.exp * 1000) : 'No especificado');
      }
    }
    
    console.log('📡 Token subject value:', this.tokenSubject.value ? 'Presente' : 'Ausente');
    console.log('🏢 ConvenioId subject value:', this.convenioIdSubject.value);
    console.log('⚙️ OperacionId subject value:', this.operacionIdSubject.value);
    console.log('=========================');
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
