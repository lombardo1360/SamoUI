import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CacheService } from '../services/cache.service';

/**
 * Interceptor para limpiar automáticamente caché expirado
 */
export const cacheCleanupInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);
  
  // Limpiar caché expirado cada cierto número de requests (para no hacerlo en cada uno)
  if (Math.random() < 0.1) { // 10% de probabilidad en cada request
    cacheService.clearExpired();
  }
  
  return next(req);
};
