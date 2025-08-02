import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TablaDatoService } from '../../services/tabla-dato.service';
import { DatoTabla, DatoSeleccionado } from '../../interfaces/api.interface';

@Component({
  selector: 'app-ambitos-atencion',
  imports: [CommonModule, FormsModule],
  templateUrl: './ambitos-atencion.component.html',
  styleUrl: './ambitos-atencion.component.scss'
})
export class AmbitosAtencionComponent implements OnInit, OnDestroy {
  @Output() selectionChange = new EventEmitter<DatoSeleccionado[]>();

  ambitos: DatoSeleccionado[] = [];
  isLoading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(private tablaDatoService: TablaDatoService) {}

  ngOnInit(): void {
    this.loadAmbitos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar ambitos de atención médica
   */
  private loadAmbitos(): void {
    this.isLoading = true;
    this.error = null;
    
    this.tablaDatoService.getAmbitosAtencionMedica()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (datos: DatoTabla[]) => {
          this.ambitos = datos.map(dato => ({
            ...dato,
            selected: false
          }));
          this.isLoading = false;
          console.log('✅ Ambitos de Atención Médica cargados:', this.ambitos);
        },
        error: (error) => {
          this.error = 'Error al cargar los ámbitos de atención médica';
          this.isLoading = false;
          console.error('❌ Error cargando ambitos:', error);
        }
      });
  }

  /**
   * Manejar cambio de selección en checkbox
   */
  onSelectionChange(ambito: DatoSeleccionado): void {
    ambito.selected = !ambito.selected;
    const seleccionados = this.ambitos.filter(a => a.selected);
    this.selectionChange.emit(seleccionados);
    console.log('📋 Ambitos seleccionados:', seleccionados);
  }

  /**
   * Seleccionar/Deseleccionar todos
   */
  toggleSelectAll(): void {
    const allSelected = this.ambitos.every(a => a.selected);
    this.ambitos.forEach(a => a.selected = !allSelected);
    const seleccionados = this.ambitos.filter(a => a.selected);
    this.selectionChange.emit(seleccionados);
  }

  /**
   * Obtener cantidad de elementos seleccionados
   */
  getSelectedCount(): number {
    return this.ambitos.filter(a => a.selected).length;
  }

  /**
   * Reintentar carga
   */
  retry(): void {
    this.loadAmbitos();
  }

  /**
   * TrackBy function para optimizar ngFor
   */
  trackByAmbitoId(index: number, ambito: DatoSeleccionado): number {
    return ambito.id;
  }

  /**
   * Verificar si todos están seleccionados
   */
  isAllSelected(): boolean {
    return this.ambitos.length > 0 && this.ambitos.every(a => a.selected);
  }

  /**
   * Verificar si hay selección indeterminada
   */
  isIndeterminate(): boolean {
    return this.getSelectedCount() > 0 && !this.isAllSelected();
  }
}
