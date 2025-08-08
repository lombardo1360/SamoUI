import { Component, inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { LoadingComponent } from '../components/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prueba',
  standalone: true,
  imports: [LoadingComponent,CommonModule],
  templateUrl: './prueba.component.html',
  styleUrl: './prueba.component.scss'
})
export class PruebaComponent {
   loadingService = inject(LoadingService);

  cargarDatos() {
    this.loadingService.show();

    setTimeout(() => {
      // Simulando petición HTTP
      this.loadingService.hide();
    }, 3000);
  }
}


