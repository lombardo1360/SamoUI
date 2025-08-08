import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RecaudosService } from '../../services/recaudos.service';
import { AuthService } from '../../services/auth.service';
import { LoadingComponent } from '../loading/loading.component';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-convenios-lista',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './convenios-lista.component.html',
  styleUrl: './convenios-lista.component.scss'
})
export class ConveniosListaComponent implements OnInit, OnDestroy {
  convenios: any[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Paginación
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 0;
  totalRegistros = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private recaudosService: RecaudosService,
    private authService: AuthService,
    private router: Router,
   private loading : LoadingService,
  ) {}

  ngOnInit(): void {
    this.cargarConvenios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar lista de convenios configurados
   */
  cargarConvenios(): void {
    
    this.isLoading = true;
    this.error = null;

    this.recaudosService.getConvenioRecaudoConfigurados(this.paginaActual, this.tamanoPagina)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.codigo === 200) {
            this.convenios = Array.isArray(response.datos) ? response.datos : (response.datos ? [response.datos] : []);
            this.calcularPaginacion(response);
          } else {
            this.error = response.mensaje || 'Error al cargar los convenios';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Error al conectar con el servidor';
        }
      });
  }

  /**
   * Calcular información de paginación
   */
  private calcularPaginacion(response: any): void {
    // Asumiendo que la API retorna información de paginación
    if (response.paginacion) {
      this.totalRegistros = response.paginacion.total;
      this.totalPaginas = Math.ceil(this.totalRegistros / this.tamanoPagina);
    }
  }

  /**
   * Ir a la página anterior
   */
  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarConvenios();
    }
  }

  /**
   * Ir a la página siguiente
   */
  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarConvenios();
    }
  }

  /**
   * Ir a una página específica
   */
  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarConvenios();
    }
  }

  /**
   * Navegar al formulario de nuevo convenio
   */
  nuevoConvenio(): void {
    this.router.navigate(['/convenio/nuevo']);
  }

  /**
   * Editar convenio existente
   */
  editarConvenio(convenio: any): void {
    this.router.navigate(['/convenio/editar', convenio.id]);
  }

  /**
   * Ver detalles del convenio
   */
  verDetalles(convenio: any): void {
    console.log('Ver detalles:', convenio);
    // Implementar modal o navegación a detalles
  }

  /**
   * Recargar lista
   */
  recargar(): void {
    this.paginaActual = 1;
    this.cargarConvenios();
  }

  /**
   * Track by function para ngFor
   */
  trackByConvenio(index: number, convenio: any): any {
    return convenio.id || index;
  }

  /**
   * Obtener clase CSS para el estado
   */
  getStatusClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'status-activo';
      case 'inactivo':
        return 'status-inactivo';
      case 'pendiente':
        return 'status-pendiente';
      default:
        return 'status-activo';
    }
  }

  /**
   * Obtener páginas visibles para la paginación
   */
  getPaginasVisibles(): number[] {
    const maxPaginas = 5;
    const paginas: number[] = [];
    
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    // Ajustar inicio si no hay suficientes páginas al final
    if (fin - inicio + 1 < maxPaginas) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
}
