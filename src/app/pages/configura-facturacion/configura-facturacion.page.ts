import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-configura-facturacion',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './configura-facturacion.page.html',
  styleUrls: ['./configura-facturacion.page.scss']
})
export class ConfiguraFacturacionPage {
  token: string | null = null;
  facturacionForm: FormGroup;

  constructor() {
    const fb = inject(FormBuilder);
    const route = inject(ActivatedRoute);

    this.facturacionForm = fb.group({
      formaLiquidacion: ['Capitado', Validators.required],
      valorLimite: [0, Validators.required],
      saldoConvenio: [0, Validators.required],
      valorHora: [0, Validators.required],
      limiteHoras: [0, Validators.required],
      modalidadPago: ['', Validators.required],
      coberturaPlan: ['', Validators.required],
      conceptoFacturacion: ['', Validators.required],
      tipoCapitacion: ['', Validators.required],
      valorCapitacion: [1, Validators.required],
      tipoUpc: ['UPC Fija', Validators.required],
      valorUpcAdicional: [0, Validators.required],
      valorUpcAlianza: [0, Validators.required],
      valorUpc: [0, Validators.required],
      valorUpcRiesgo: [0, Validators.required],
      tipoFactura: ['Estandar', Validators.required],
      comprobanteFactura: [''],
      rubroIngreso: [''],
      modalidadPagoPaciente: ['Anticipado', Validators.required],
      valorPorPaciente: [0, Validators.required],
      tipoCodigoFactura: ['', Validators.required],
      diasHabilesGlosas: [30, Validators.required],
      periodicidadFacturacion: [30, Validators.required],
      periodicidadUnidad: ['Dias', Validators.required]
    });

    route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      if (this.token) {
        localStorage.setItem('auth_token', this.token);
      }
    });
  }

  onSubmit() {
    if (this.facturacionForm.valid) {
      // Aquí puedes enviar los datos al backend usando el token
      console.log('Token:', this.token);
      console.log('Datos:', this.facturacionForm.value);
    }
  }
}