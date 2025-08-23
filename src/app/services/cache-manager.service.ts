import { Injectable, OnDestroy } from '@angular/core';
import { CacheService } from './cache.service';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheManagerService implements OnDestroy {
  private cleanupSubscription?: Subscription;
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutos

  constructor(private cacheService: CacheService) {
    this.initializePeriodicCleanup();
  }

  /**
   * Inicializar limpieza periódica del caché
   */
  private initializePeriodicCleanup(): void {
    this.cleanupSubscription = interval(this.CLEANUP_INTERVAL).subscribe(() => {
      this.cacheService.clearExpired();
      console.log('🧹 Limpieza automática de caché completada');
    });
  }

  /**
   * Obtener estadísticas del caché
   */
  getCacheStats(): { size: number, lastCleanup: Date } {
    return {
      size: this.cacheService.size(),
      lastCleanup: new Date()
    };
  }

  /**
   * Forzar limpieza completa del caché
   */
  forceCleanup(): void {
    this.cacheService.clear();
    console.log('🗑️ Caché completamente limpiado');
  }

  /**
   * Forzar limpieza de elementos expirados
   */
  forceExpiredCleanup(): void {
    this.cacheService.clearExpired();
    console.log('⏰ Elementos expirados del caché eliminados');
  }

  ngOnDestroy(): void {
    if (this.cleanupSubscription) {
      this.cleanupSubscription.unsubscribe();
    }
  }
}
