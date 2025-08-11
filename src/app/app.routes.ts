import { Routes } from '@angular/router';
import { BienvenidaPage } from './pages/bienvenida/bienvenida.page';
import { ConfiguraRecaudoPage } from './pages/configura-recaudo/configura-recaudo.page';
import { ConfiguraFacturacionPage } from './pages/configura-facturacion/configura-facturacion.page';
import { PruebaComponent } from './prueba/prueba.component';

export const routes: Routes = [
  { path: '', component: BienvenidaPage },
  { path: 'configuraRecaudo', component: ConfiguraRecaudoPage },
  { path: 'configuraFacturacion', component: PruebaComponent },
  { path: 'prueba', component: PruebaComponent }
];
