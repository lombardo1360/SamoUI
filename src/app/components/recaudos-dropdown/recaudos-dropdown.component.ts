import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest, switchMap, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RecaudosService } from '../../services/recaudos.service';
import { RecaudoOperacion, DatoTabla, DatoSeleccionado } from '../../interfaces/api.interface';

@Component({
  selector: 'app-recaudos-dropdown',
  imports: [CommonModule, FormsModule],
  templateUrl: './recaudos-dropdown.component.html',
  styleUrl: './recaudos-dropdown.component.scss'
})
export class RecaudosDropdownComponent implements OnInit, OnDestroy {
  recaudos: RecaudoOperacion[] = [];
  ambitos: DatoSeleccionado[] = [];
  excepciones: DatoSeleccionado[] = [];
  programas: DatoSeleccionado[] = [];
  selectedRecaudo: RecaudoOperacion | null = null;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  saveSuccess = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private recaudosService: RecaudosService
  ) {}

  ngOnInit(): void {
    this.initializeData();
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
          console.log('Token y OperacionId disponibles, cargando datos...');
          this.isLoading = true;
          this.error = null;
          
          // Cargar recaudos, ámbitos, excepciones y programas en paralelo
          return forkJoin({
            recaudosResponse: this.recaudosService.getRecaudosOperacion(operacionId),
            ambitosData: this.recaudosService.getAmbitosAtencionMedica(),
            excepcionesData: this.recaudosService.getOtrasExcepcionesRecaudo(),
            programasData: this.recaudosService.getProgramasConvenioRecaudo()
          });
        } else {
          console.log('Esperando token y operacionId...');
          return [];
        }
      })
    ).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        
        if (data.recaudosResponse) {
          if (data.recaudosResponse.codigo === 200) {
            this.recaudos = data.recaudosResponse.datos || [];
            console.log('✅ Recaudos cargados:', this.recaudos);
          } else {
            this.error = data.recaudosResponse.mensaje || 'Error al cargar recaudos';
          }
        }
        
        if (data.ambitosData) {
          this.ambitos = data.ambitosData.map((dato: DatoTabla) => ({
            ...dato,
            selected: false
          }));
          console.log('✅ Ámbitos cargados:', this.ambitos);
        }

        if (data.excepcionesData) {
          this.excepciones = data.excepcionesData.map((dato: DatoTabla) => ({
            ...dato,
            selected: false
          }));
          console.log('✅ Excepciones cargadas:', this.excepciones);
        }

        if (data.programasData) {
          this.programas = data.programasData.map((programa: any) => ({
            id: programa.id,
            name: programa.name,
            selected: programa.selected || false
          }));
          console.log('✅ Programas cargados:', this.programas);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Error de conexión al cargar recaudos';
        console.error('Error al cargar recaudos:', error);
      }
    });
  }

  onRecaudoSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedId = parseInt(target.value);
    
    if (selectedId) {
      this.selectedRecaudo = this.recaudos.find(r => r.id === selectedId) || null;
      console.log('Recaudo seleccionado:', this.selectedRecaudo);
    } else {
      this.selectedRecaudo = null;
    }
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
    const seleccionados = this.ambitos.filter(a => a.selected);
    console.log('🏥 Ámbitos seleccionados:', seleccionados);
  }

  /**
   * Seleccionar/Deseleccionar todos los ámbitos
   */
  toggleSelectAllAmbitos(): void {
    const allSelected = this.ambitos.every(a => a.selected);
    this.ambitos.forEach(a => a.selected = !allSelected);
    const seleccionados = this.ambitos.filter(a => a.selected);
    console.log('🏥 Todos los ámbitos:', allSelected ? 'deseleccionados' : 'seleccionados');
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
    const seleccionados = this.excepciones.filter(e => e.selected);
    console.log('⚠️ Excepciones seleccionadas:', seleccionados);
  }

  /**
   * Seleccionar/Deseleccionar todas las excepciones
   */
  toggleSelectAllExcepciones(): void {
    const allSelected = this.excepciones.every(e => e.selected);
    this.excepciones.forEach(e => e.selected = !allSelected);
    const seleccionados = this.excepciones.filter(e => e.selected);
    console.log('⚠️ Todas las excepciones:', allSelected ? 'deseleccionadas' : 'seleccionadas');
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
    const seleccionados = this.programas.filter(p => p.selected);
    console.log('🎯 Programas seleccionados:', seleccionados);
  }

  /**
   * Seleccionar/Deseleccionar todos los programas
   */
  toggleSelectAllProgramas(): void {
    const allSelected = this.programas.every(p => p.selected);
    this.programas.forEach(p => p.selected = !allSelected);
    const seleccionados = this.programas.filter(p => p.selected);
    console.log('🎯 Todos los programas:', allSelected ? 'deseleccionados' : 'seleccionados');
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

    // Usar convenioId = 1 por defecto
    const convenioId = 1;

    // Preparar la configuración
    const configuracion = {
      convenioRecaudo: {
        convenioId: convenioId,
        nivelRecaudoId: this.selectedRecaudo.id
      },
      ambitoIds: this.ambitos.filter(a => a.selected).map(a => a.id),
      otroItemsIds: this.excepciones.filter(e => e.selected).map(e => e.id),
      programaIds: this.programas.filter(p => p.selected).map(p => p.id)
    };

    console.log('💾 Configuración a enviar:', configuracion);

    // Estado de guardado
    this.isSaving = true;
    this.error = null;
    this.saveSuccess = false;

    // Enviar configuración
    this.recaudosService.configurarConvenioRecaudo(configuracion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSaving = false;
          this.saveSuccess = true;
          console.log('✅ Configuración guardada exitosamente:', response);
          
          // Mostrar mensaje de éxito por 3 segundos
          setTimeout(() => {
            this.saveSuccess = false;
          }, 3000);
        },
        error: (error) => {
          this.isSaving = false;
          this.error = 'Error al guardar la configuración. Intente nuevamente.';
          console.error('❌ Error al guardar configuración:', error);
        }
      });
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
   * Añadir nueva configuración (placeholder para funcionalidad futura)
   */
  addConfiguration(): void {
    if (!this.selectedRecaudo) {
      return;
    }
    
    console.log('➕ Añadiendo nueva configuración...');
    // Aquí iría la lógica para añadir una nueva configuración
    // Por ahora solo mostramos un mensaje
    alert('Funcionalidad "Añadir" en desarrollo');
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
      
      console.log('🗑️ Todas las selecciones han sido limpiadas');
    }
  }
}
