import { TestBed } from '@angular/core/testing';

import { TablaDatoService } from './tabla-dato.service';

describe('TablaDatoService', () => {
  let service: TablaDatoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablaDatoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
