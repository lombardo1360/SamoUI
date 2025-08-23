import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject, takeUntil, combineLatest, switchMap, forkJoin } from 'rxjs';
import { RecaudosService } from '../../services/recaudos.service';
import { RecaudoOperacion, DatoTabla, DatoSeleccionado, ConvenioRecaudoConfigurado, ConvenioRecaudoConfigurationList, ConvenioRecaudoDetalle, ActualizarConvenioRecaudoRequest } from '../../interfaces/api.interface';
import { LoadingService } from '../../services/loading.service';
import { LoadingComponent } from '../loading/loading.component';
import { SelectModule } from 'primeng/select';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-recaudos-dropdown',
 
  imports: [CommonModule, FormsModule,LoadingComponent, SelectModule],
  templateUrl: './recaudos-dropdown.component.html',
  styleUrl: './recaudos-dropdown.component.scss'
})
export class RecaudosDropdownComponent implements OnInit, OnDestroy, AfterViewInit {

   ngAfterViewInit(): void {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Inicializa los tooltips de Bootstrap
      const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        // @ts-ignore
        new window.bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }
  // Control de vista
  showFormulario = false;
  isEditMode = false; // Nueva propiedad para modo edición
  editingConvenio: ConvenioRecaudoConfigurado | null = null; // Convenio que se está editando
  
  // Modal de confirmación de eliminación
  showDeleteModal = false;
  convenioToDelete: ConvenioRecaudoConfigurado | null = null;
  showSuccessMessage = false;
  successMessage = '';
  
  // Datos del formulario
  recaudos: RecaudoOperacion[] = [];
  ambitos: DatoSeleccionado[] = [];
  excepciones: DatoSeleccionado[] = [];
  programas: DatoSeleccionado[] = [];
  selectedRecaudo: RecaudoOperacion | null = null;
  
  // Datos de la lista
  conveniosConfigurados: ConvenioRecaudoConfigurado[] = [];
  totalPaginas = 0;
  paginaActual = 1;
  tamanoPagina = 10;
  
  // Estados
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  saveSuccess = false;
  loading$!: typeof this.loadingService.loading$;

  // Token y ConvenioId
  private token: string | null = null;
  private convenioId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private recaudosService: RecaudosService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    // Capturar token de la URL
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: Params) => {
      if (params['token']) {
        // Token recibido por URL - usar este token para todas las peticiones
        this.token = params['token'];
        
        // Establecer token en AuthService (esto manejará la decodificación automáticamente)
        if (this.token) {
          this.authService.setTokenFromUrl(this.token);
        }
        
        // Obtener el ConvenioId del AuthService después de que se procese el token
        setTimeout(() => {
          this.convenioId = this.authService.getConvenioId();
          
          // Cargar datos una vez que tenemos el token y ConvenioId
          this.loadConveniosConfigurados();
          this.initializeData();
        }, 100);
        
      } else {
        // No hay token en URL - usar autenticación normal
        this.authService.initialize();
        this.loadConveniosConfigurados();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeData(): void {
    // Combinar observables de token y operacionId
    combineLatest([
      this.authService.token$,
      this.authService.operacionId$
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([token, operacionId]) => {
        if (token && operacionId) {
          this.loadingService.hide();
          this.error = null;
          
          // Cargar recaudos, ámbitos, excepciones y programas en paralelo
          return forkJoin({
            recaudosResponse: this.recaudosService.getRecaudosOperacion(operacionId),
            ambitosData: this.recaudosService.getAmbitosAtencionMedica(),
            excepcionesData: this.recaudosService.getOtrasExcepcionesRecaudo(),
            programasData: this.recaudosService.getProgramasConvenioRecaudo()
          });
        } else {
          return [];
        }
      })
    ).subscribe({
      next: (data: any) => {
        this.loadingService.hide();
        
        if (data.recaudosResponse) {
          if (data.recaudosResponse.codigo === 200) {
            this.recaudos = data.recaudosResponse.datos || [];
          } else {
            this.error = data.recaudosResponse.mensaje || 'Error al cargar recaudos';
          }
        }
        
        if (data.ambitosData) {
          this.ambitos = data.ambitosData.map((dato: DatoTabla) => ({
            ...dato,
            selected: false
          }));
        }

        if (data.excepcionesData) {
          this.excepciones = data.excepcionesData.map((dato: DatoTabla) => ({
            ...dato,
            selected: false
          }));
        }

        if (data.programasData) {
          let programasArray: any[] = [];
          
          // Verificar si es una respuesta API con estructura { codigo, mensaje, datos }
          if (data.programasData.codigo && data.programasData.datos) {
            if (data.programasData.codigo === 200 && Array.isArray(data.programasData.datos)) {
              programasArray = data.programasData.datos;
            } else {
              return;
            }
          } else if (Array.isArray(data.programasData)) {
            // Si es directamente un array (como parece ser tu caso)
            programasArray = data.programasData;
          } else {
            console.error('❌ Formato de datos de programas no reconocido:', data.programasData);
            return;
          }
          
          this.programas = programasArray.map((programa: any) => ({
            id: programa.id,
            name: programa.nombre, // Usar 'nombre' del API
            orden: null, // Agregar propiedades requeridas por DatoSeleccionado
            equivalente: null,
            selected: programa.seleccionado || false // Usar 'seleccionado' del API
          }));
        }
      },
      error: (error) => {
        this.loadingService.hide();
        this.error = 'Error de conexión al cargar recaudos';
        console.error('Error al cargar recaudos:', error);
      }
    });
  }

onRecaudoSelect(event: any): void {
  this.selectedRecaudo = event?.value ?? null;
}

 



  // Método para reintentar carga
  retry(): void {
    this.initializeData();
  }

  /**
   * Manejar cambio de selección en ámbitos
   */
  onAmbitoSelectionChange(ambito: DatoSeleccionado): void {
    ambito.selected = !ambito.selected;
  }

  /**
   * Seleccionar/Deseleccionar todos los ámbitos
   */
  toggleSelectAllAmbitos(): void {
    const allSelected = this.ambitos.every(a => a.selected);
    this.ambitos.forEach(a => a.selected = !allSelected);
  }

  /**
   * Obtener cantidad de ámbitos seleccionados
   */
  getSelectedAmbitosCount(): number {
    return this.ambitos.filter(a => a.selected).length;
  }

  /**
   * Verificar si todos los ámbitos están seleccionados
   */
  isAllAmbitosSelected(): boolean {
    return this.ambitos.length > 0 && this.ambitos.every(a => a.selected);
  }

  /**
   * Verificar si hay selección indeterminada en ámbitos
   */
  isAmbitosIndeterminate(): boolean {
    return this.getSelectedAmbitosCount() > 0 && !this.isAllAmbitosSelected();
  }

  /**
   * TrackBy function para optimizar ngFor de ámbitos
   */
  trackByAmbitoId(index: number, ambito: DatoSeleccionado): number {
    return ambito.id;
  }

  /**
   * Manejar cambio de selección en excepciones
   */
  onExcepcionSelectionChange(excepcion: DatoSeleccionado): void {
    excepcion.selected = !excepcion.selected;
  }

  /**
   * Seleccionar/Deseleccionar todas las excepciones
   */
  toggleSelectAllExcepciones(): void {
    const allSelected = this.excepciones.every(e => e.selected);
    this.excepciones.forEach(e => e.selected = !allSelected);
  }

  /**
   * Obtener cantidad de excepciones seleccionadas
   */
  getSelectedExcepcionesCount(): number {
    return this.excepciones.filter(e => e.selected).length;
  }

  /**
   * Verificar si todas las excepciones están seleccionadas
   */
  isAllExcepcionesSelected(): boolean {
    return this.excepciones.length > 0 && this.excepciones.every(e => e.selected);
  }

  /**
   * Verificar si hay selección indeterminada en excepciones
   */
  isExcepcionesIndeterminate(): boolean {
    return this.getSelectedExcepcionesCount() > 0 && !this.isAllExcepcionesSelected();
  }

  /**
   * TrackBy function para optimizar ngFor de excepciones
   */
  trackByExcepcionId(index: number, excepcion: DatoSeleccionado): number {
    return excepcion.id;
  }

  // Métodos para manejar programas de convenio recaudo

  /**
   * Manejar cambio de selección en programas
   */
  onProgramaSelectionChange(programa: DatoSeleccionado): void {
    programa.selected = !programa.selected;
  }

  /**
   * Seleccionar/Deseleccionar todos los programas
   */
  toggleSelectAllProgramas(): void {
    const allSelected = this.programas.every(p => p.selected);
    this.programas.forEach(p => p.selected = !allSelected);
  }

  /**
   * Obtener cantidad de programas seleccionados
   */
  getSelectedProgramasCount(): number {
    return this.programas.filter(p => p.selected).length;
  }

  /**
   * Verificar si todos los programas están seleccionados
   */
  isAllProgramasSelected(): boolean {
    return this.programas.length > 0 && this.programas.every(p => p.selected);
  }

  /**
   * Verificar si hay selección indeterminada en programas
   */
  isProgramasIndeterminate(): boolean {
    return this.getSelectedProgramasCount() > 0 && !this.isAllProgramasSelected();
  }

  /**
   * TrackBy function para optimizar ngFor de programas
   */
  trackByProgramaId(index: number, programa: DatoSeleccionado): number {
    return programa.id;
  }

  /**
   * Guardar configuración de convenio recaudo
   */
  guardarConfiguracion(): void {
    // Validar que hay un recaudo seleccionado
    if (!this.selectedRecaudo) {
      this.error = 'Debe seleccionar un recaudo antes de guardar';
      return;
    }

    // Estado de guardado
    this.isSaving = true;
    this.error = null;
    this.saveSuccess = false;
    this.loadingService.show();

    if (this.isEditMode && this.editingConvenio) {
      // Modo edición - actualizar convenio existente
      const actualizarData: ActualizarConvenioRecaudoRequest = {
        convenioRecaudo: {
          id: this.editingConvenio.id,
          convenioId: this.editingConvenio.convenioId,
          nivelRecaudoId: this.selectedRecaudo.id
        },
        ambitoIds: this.ambitos.filter(a => a.selected).map(a => a.id),
        otroItemsIds: this.excepciones.filter(e => e.selected).map(e => e.id),
        programaIds: this.programas.filter(p => p.selected).map(p => p.id)
      };

      this.recaudosService.actualizarConvenioRecaudo(actualizarData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.loadingService.hide();
            this.saveSuccess = true;
            
            // Mostrar mensaje de éxito y volver a la lista
            setTimeout(() => {
              this.saveSuccess = false;
              this.mostrarLista();
            }, 2000);
          },
          error: (error) => {
            this.loadingService.hide();
            this.error = 'Error al actualizar la configuración. Intente nuevamente.';
            console.error('❌ Error al actualizar configuración:', error);
          }
        });
    } else {
      // Modo creación - crear nuevo convenio
      const convenioIdStr = this.authService.getConvenioId();
      
      if (!convenioIdStr) {
        this.loadingService.hide();
        this.error = 'No se pudo obtener el ID del convenio del token. Verifique su autenticación.';
        console.error('❌ No se pudo obtener convenioId del token');
        return;
      }

      const convenioId = parseInt(convenioIdStr, 10);
      
      if (isNaN(convenioId)) {
        this.loadingService.hide();
        this.error = 'El ID del convenio del token no es válido.';
        console.error('❌ ConvenioId del token no es un número válido:', convenioIdStr);
        return;
      }

      const configuracion = {
        convenioRecaudo: {
          convenioId: convenioId,
          nivelRecaudoId: this.selectedRecaudo.id
        },
        ambitoIds: this.ambitos.filter(a => a.selected).map(a => a.id),
        otroItemsIds: this.excepciones.filter(e => e.selected).map(e => e.id),
        programaIds: this.programas.filter(p => p.selected).map(p => p.id)
      };

      console.log('💾 Creando nueva configuración con convenioId del token:', configuracion);

      this.recaudosService.configurarConvenioRecaudo(configuracion)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.loadingService.hide();
            this.saveSuccess = true;
            
            // Mostrar mensaje de éxito y volver a la lista
            setTimeout(() => {
              this.saveSuccess = false;
              this.mostrarLista();
            }, 2000);
          },
          error: (error) => {
            this.loadingService.hide();
            this.error = 'Error al guardar la configuración. Intente nuevamente.';
            console.error('❌ Error al guardar configuración:', error);
          }
        });
    }
  }

  /**
   * Verificar si se puede guardar (solo requiere recaudo seleccionado)
   */
  canSave(): boolean {
    return this.selectedRecaudo !== null && 
           !this.isSaving && 
           !this.isLoading;
  }

  /**
   * Mostrar formulario para añadir nueva configuración
   */
  addConfiguration(): void {
    this.mostrarFormulario();
  }

  /**
   * Verificar si hay selecciones activas
   */
  hasSelections(): boolean {
    return this.getSelectedAmbitosCount() > 0 || 
           this.getSelectedExcepcionesCount() > 0 || 
           this.getSelectedProgramasCount() > 0;
  }

  /**
   * Limpiar todas las selecciones
   */
  clearAllSelections(): void {
    if (!this.hasSelections()) {
      return;
    }

    // Confirmar antes de limpiar
    if (confirm('¿Está seguro de que desea limpiar todas las selecciones?')) {
      // Limpiar ámbitos
      this.ambitos.forEach(ambito => ambito.selected = false);
      
      // Limpiar excepciones
      this.excepciones.forEach(excepcion => excepcion.selected = false);
      
      // Limpiar programas
      this.programas.forEach(programa => programa.selected = false);
      
      // Mostrar la lista después de limpiar
      this.mostrarLista();
    }
  }

  /**
   * Cargar lista de convenios configurados
   */
  loadConveniosConfigurados(): void {
    this.loadingService.show();
    //this.isLoading = true;
    this.error = null;

    // Usar el convenioId del AuthService si está disponible, sino usar el local
    const convenioIdToUse = this.authService.getConvenioId() || this.convenioId;

    this.recaudosService.getConvenioRecaudoConfigurados(
      this.paginaActual, 
      this.tamanoPagina,
      convenioIdToUse || undefined
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingService.hide();
         // this.isLoading = false;
          if (response.codigo === 200) {
            this.conveniosConfigurados = response.datos.elementos;
            this.totalPaginas = response.datos.totalPaginas;
          } else {
            this.error = response.mensaje || 'Error al cargar los convenios configurados';
          }
        },
        error: (error) => {
          this.loadingService.hide();
         // this.isLoading = false;
          this.error = 'Error al cargar los convenios configurados. Intente nuevamente.';
          console.error('❌ Error al cargar convenios configurados:', error);
        }
      });
  }

  /**
   * Mostrar formulario para añadir convenio
   */
  mostrarFormulario(): void {
    this.showFormulario = true;
    this.isEditMode = false; // Resetear modo edición
    this.editingConvenio = null; // Limpiar convenio en edición
    this.resetForm(); // Limpiar formulario antes de cargar datos
    this.initializeData();
  }

  /**
   * Mostrar lista de convenios configurados
   */
  mostrarLista(): void {
    this.showFormulario = false;
    this.isEditMode = false; // Resetear modo edición
    this.editingConvenio = null; // Limpiar convenio en edición
    this.resetForm();
    this.loadConveniosConfigurados();
  }

  /**
   * Cancelar operación actual
   */
  cancelarOperacion(): void {
    if (this.showFormulario) {
      // Si está en el formulario, volver a la lista
      this.mostrarLista();
    } else {
      // Si está en la lista, limpiar selecciones
      this.clearAllSelections();
    }
  }

  /**
   * Reiniciar formulario
   */
  private resetForm(): void {
    this.selectedRecaudo = null;
    this.ambitos = [];
    this.excepciones = [];
    this.programas = [];
    this.error = null;
    this.saveSuccess = false;
  }

  /**
   * Cambiar página
   */
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.loadConveniosConfigurados();
    }
  }

  /**
   * Obtener array de páginas para la paginación
   */
  getPaginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Editar convenio configurado
   */
  editarConvenio(convenio: ConvenioRecaudoConfigurado): void {
    // Configurar modo edición
    this.isEditMode = true;
    this.editingConvenio = convenio;
    
    // Mostrar el formulario
    this.showFormulario = true;
    
    this.loadingService.show();
    
    // Verificar si ya tenemos las opciones cargadas
    const opcionesCargadas = this.recaudos.length > 0 && this.ambitos.length > 0 && 
                            this.excepciones.length > 0 && this.programas.length > 0;
    
    if (opcionesCargadas) {
      this.cargarDatosConvenio(convenio.id);
    } else {
      // Solo cargar opciones si no están disponibles, sin resetear las existentes
      this.cargarOpcionesParaEdicion().then(() => {
        this.cargarDatosConvenio(convenio.id);
      }).catch((error) => {
        console.error('❌ Error cargando opciones:', error);
        this.loadingService.hide();
        this.error = 'Error al cargar las opciones necesarias';
      });
    }
  }

  /**
   * Cargar datos específicos del convenio
   */
  private cargarDatosConvenio(convenioId: number): void {
    this.recaudosService.getConvenioRecaudoConfiguradoPorId(convenioId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingService.hide();
          if (response.codigo === 200) {
            const convenioDetalle = response.datos;
            
            // Verificar que las opciones estén disponibles antes de precargar
            if (this.ambitos.length > 0 && this.excepciones.length > 0 && this.programas.length > 0) {
              this.precargarDatosEdicion(convenioDetalle);
            } else {
              setTimeout(() => {
                this.precargarDatosEdicion(convenioDetalle);
              }, 1000);
            }
          } else {
            console.error('❌ Error al cargar convenio:', response.mensaje);
            this.error = response.mensaje;
          }
        },
        error: (error) => {
          this.loadingService.hide();
          console.error('❌ Error al cargar convenio:', error);
          this.error = 'Error al cargar los datos del convenio';
        }
      });
  }

  /**
   * Cargar opciones específicamente para edición (Promise-based)
   */
  private cargarOpcionesParaEdicion(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Obtener operacionId del AuthService
      const operacionId = this.authService.getOperacionId();
      
      if (!operacionId) {
        this.cargarOpcionesBasicas();
        setTimeout(() => resolve(), 2000);
        return;
      }
      
      // Cargar todas las opciones en paralelo
      forkJoin({
        recaudosResponse: this.recaudosService.getRecaudosOperacion(operacionId),
        ambitosData: this.recaudosService.getAmbitosAtencionMedica(),
        excepcionesData: this.recaudosService.getOtrasExcepcionesRecaudo(),
        programasData: this.recaudosService.getProgramasConvenioRecaudo()
      }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Procesar recaudos
          if (data.recaudosResponse && data.recaudosResponse.codigo === 200) {
            this.recaudos = data.recaudosResponse.datos || [];
          }
          
          // Procesar ámbitos
          if (data.ambitosData && Array.isArray(data.ambitosData)) {
            this.ambitos = data.ambitosData.map((dato: DatoTabla) => ({
              ...dato,
              selected: false
            }));
          }
          
          // Procesar excepciones
          if (data.excepcionesData && Array.isArray(data.excepcionesData)) {
            this.excepciones = data.excepcionesData.map((dato: DatoTabla) => ({
              ...dato,
              selected: false
            }));
          }
          
          // Procesar programas
          if (data.programasData) {
            let programasArray: any[] = [];
            
            if (data.programasData.codigo && data.programasData.datos) {
              if (data.programasData.codigo === 200 && Array.isArray(data.programasData.datos)) {
                programasArray = data.programasData.datos;
              }
            } else if (Array.isArray(data.programasData)) {
              programasArray = data.programasData;
            }
            
            this.programas = programasArray.map((programa: any) => ({
              id: programa.id,
              name: programa.nombre,
              orden: null,
              equivalente: null,
              selected: false
            }));
          }
          
          resolve();
        },
        error: (error) => {
          console.error('❌ Error cargando opciones para edición:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Cargar opciones básicas cuando no se cargan automáticamente
   */
  private cargarOpcionesBasicas(): void {
    // Cargar ámbitos si no están disponibles
    if (this.ambitos.length === 0) {
      this.recaudosService.getAmbitosAtencionMedica()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.ambitos = data.map((dato: DatoTabla) => ({
              ...dato,
              selected: false
            }));
          },
          error: (error) => console.error('❌ Error cargando ámbitos:', error)
        });
    }
    
    // Cargar excepciones si no están disponibles
    if (this.excepciones.length === 0) {
      this.recaudosService.getOtrasExcepcionesRecaudo()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.excepciones = data.map((dato: DatoTabla) => ({
              ...dato,
              selected: false
            }));
          },
          error: (error) => console.error('❌ Error cargando excepciones:', error)
        });
    }
    
    // Cargar programas si no están disponibles
    if (this.programas.length === 0) {
      this.recaudosService.getProgramasConvenioRecaudo()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            let programasArray: any[] = [];
            
            if (data.codigo && data.datos) {
              if (data.codigo === 200 && Array.isArray(data.datos)) {
                programasArray = data.datos;
              }
            } else if (Array.isArray(data)) {
              programasArray = data;
            }
            
            this.programas = programasArray.map((programa: any) => ({
              id: programa.id,
              name: programa.nombre,
              orden: null,
              equivalente: null,
              selected: false
            }));
          },
          error: (error) => console.error('❌ Error cargando programas:', error)
        });
    }
  }

  /**
   * Precargar datos del convenio en el formulario para edición
   */
  private precargarDatosEdicion(convenio: any): void {
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      // Seleccionar el recaudo correspondiente
      const recaudoEncontrado = this.recaudos.find(r => r.id === convenio.nivelRecaudoId);
      if (recaudoEncontrado) {
        this.selectedRecaudo = recaudoEncontrado;
      }

      // Precargar ámbitos seleccionados
      if (this.ambitos.length > 0) {
        let ambitosSeleccionados: number[] = [];
        
        if (convenio.ambitoIds && Array.isArray(convenio.ambitoIds)) {
          ambitosSeleccionados = convenio.ambitoIds;
        } else if (convenio.ambitos && Array.isArray(convenio.ambitos)) {
          ambitosSeleccionados = convenio.ambitos.map((ambito: any) => ambito.id || ambito);
        }
        
        this.ambitos.forEach(ambito => {
          ambito.selected = ambitosSeleccionados.includes(ambito.id);
        });
      }

      // Precargar excepciones seleccionadas
      if (this.excepciones.length > 0) {
        let excepcionesSeleccionadas: number[] = [];
        
        if (convenio.otroItemsIds && Array.isArray(convenio.otroItemsIds)) {
          excepcionesSeleccionadas = convenio.otroItemsIds;
        } else if (convenio.otroItems && Array.isArray(convenio.otroItems)) {
          excepcionesSeleccionadas = convenio.otroItems.map((item: any) => item.id || item);
        }
        
        this.excepciones.forEach(excepcion => {
          excepcion.selected = excepcionesSeleccionadas.includes(excepcion.id);
        });
      }

      // Precargar programas seleccionados
      if (this.programas.length > 0) {
        let programasSeleccionados: number[] = [];
        
        if (convenio.programaIds && Array.isArray(convenio.programaIds)) {
          programasSeleccionados = convenio.programaIds;
        } else if (convenio.programas && Array.isArray(convenio.programas)) {
          programasSeleccionados = convenio.programas.map((programa: any) => programa.id || programa);
        }
        
        this.programas.forEach(programa => {
          programa.selected = programasSeleccionados.includes(programa.id);
        });
      }

      // Forzar detección de cambios
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Eliminar convenio configurado
   */
  eliminarConvenio(convenio: ConvenioRecaudoConfigurado): void {
    this.convenioToDelete = convenio;
    this.showDeleteModal = true;
  }

  /**
   * Cancelar eliminación y cerrar modal
   */
  cancelarEliminacion(): void {
    this.showDeleteModal = false;
    this.convenioToDelete = null;
  }

  /**
   * Cerrar mensaje de éxito manualmente
   */
  cerrarMensajeExito(): void {
    this.showSuccessMessage = false;
    this.successMessage = '';
  }

  /**
   * Confirmar eliminación del convenio
   */
  confirmarEliminacion(): void {
    if (!this.convenioToDelete) return;

    this.loadingService.show();
    
    this.recaudosService.inactivarConvenioRecaudo(this.convenioToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingService.hide();
          if (response.codigo === 200) {
            // Mostrar mensaje de éxito
            this.successMessage = `La configuración del ${this.convenioToDelete!.nivelRecaudoNombre} ha sido desactivada exitosamente.`;
            this.showSuccessMessage = true;
            
            // Cerrar modal y limpiar estado
            this.cancelarEliminacion();
            
            // Recargar lista después de inactivar
            this.loadConveniosConfigurados();
            
            // Ocultar mensaje de éxito después de 4 segundos
            setTimeout(() => {
              this.showSuccessMessage = false;
              this.successMessage = '';
            }, 4000);
            
          } else {
            console.error('❌ Error al inactivar convenio:', response.mensaje);
            alert('Error al inactivar el convenio: ' + response.mensaje);
          }
        },
        error: (error) => {
          this.loadingService.hide();
          console.error('❌ Error al inactivar convenio:', error);
          alert('Error al inactivar el convenio. Intente nuevamente.');
        }
      });
  }
}
