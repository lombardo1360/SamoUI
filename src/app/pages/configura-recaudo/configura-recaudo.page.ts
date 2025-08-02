import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecaudosDropdownComponent } from '../../components/recaudos-dropdown/recaudos-dropdown.component';

@Component({
  selector: 'app-configura-recaudo',
  standalone: true,
  imports: [RecaudosDropdownComponent],
  templateUrl: './configura-recaudo.page.html',
  styleUrls: ['./configura-recaudo.page.scss']
})
export class ConfiguraRecaudoPage {
  token: string | null = null;

  constructor() {
    const route = inject(ActivatedRoute);
    route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      if (this.token) {
        localStorage.setItem('auth_token', this.token);
      }
    });
  }
}