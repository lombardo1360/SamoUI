import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // Solo acceder a localStorage si estamos en el navegador
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // Clonar la request y agregar el header de autorización
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      console.log('Request con token:', authReq.url);
      return next(authReq);
    }
  }
  
  console.log('Request sin token:', req.url);
  return next(req);
};
