import { Routes } from '@angular/router';
import { RecaudosDropdownComponent } from './components/recaudos-dropdown/recaudos-dropdown.component';

export const routes: Routes = [
  { path: '', component: RecaudosDropdownComponent },
  { path: '**', redirectTo: '' }
];
