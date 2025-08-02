import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbitosAtencionComponent } from './ambitos-atencion.component';

describe('AmbitosAtencionComponent', () => {
  let component: AmbitosAtencionComponent;
  let fixture: ComponentFixture<AmbitosAtencionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbitosAtencionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmbitosAtencionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
