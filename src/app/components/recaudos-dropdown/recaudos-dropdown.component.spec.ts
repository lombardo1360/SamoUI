import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecaudosDropdownComponent } from './recaudos-dropdown.component';

describe('RecaudosDropdownComponent', () => {
  let component: RecaudosDropdownComponent;
  let fixture: ComponentFixture<RecaudosDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecaudosDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecaudosDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
