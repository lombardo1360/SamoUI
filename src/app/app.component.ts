import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecaudosDropdownComponent } from './components/recaudos-dropdown/recaudos-dropdown.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RecaudosDropdownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ConvenioRecaudoApp';
}
