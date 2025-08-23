import { Routes } from '@angular/router';
import { BienvenidaPage } from './pages/bienvenida/bienvenida.page';
import { ConfiguraRecaudoPage } from './pages/configura-recaudo/configura-recaudo.page';

export const routes: Routes = [
  { path: '', component: BienvenidaPage },
  { path: 'configuraRecaudo', component: ConfiguraRecaudoPage },
];
