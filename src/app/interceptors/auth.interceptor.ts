import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  console.log('🔍 Interceptor ejecutándose para:', req.url);
  
  // Solo acceder a localStorage si estamos en el navegador
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('auth_token');
    
    console.log('🔐 Token desde localStorage:', token ? `${token.substring(0, 20)}...` : 'NO ENCONTRADO');
    
    if (token) {
      // Clonar la request y agregar el header de autorización
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      console.log('✅ Request con token enviada a:', authReq.url);
      console.log('🔑 Authorization header:', authReq.headers.get('Authorization')?.substring(0, 30) + '...');
      
      return next(authReq);
    } else {
      console.log('❌ No se encontró token en localStorage');
    }
  } else {
    console.log('⚠️ No estamos en navegador, no se puede acceder a localStorage');
  }
  
  console.log('🚫 Request sin token enviada a:', req.url);
  return next(req);
};
