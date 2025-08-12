import { Component, inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { LoadingComponent } from '../components/loading/loading.component';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-prueba',
  standalone: true,
  imports: [LoadingComponent, CommonModule, SelectModule, FormsModule],
  templateUrl: './prueba.component.html',
  styleUrl: './prueba.component.scss'
})
export class PruebaComponent {
   loadingService = inject(LoadingService);

   cities = [
    { name: 'Bogotá', code: 'BOG' },
    { name: 'Medellín', code: 'MED' },
    { name: 'Cali', code: 'CAL' }
  ];

  selectedCity: any = null;

  cargarDatos() {
    this.loadingService.show();

    setTimeout(() => {
      // Simulando petición HTTP
      this.loadingService.hide();
    }, 3000);
  }
}


