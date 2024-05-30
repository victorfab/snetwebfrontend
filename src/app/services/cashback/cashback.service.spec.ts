import { TestBed } from '@angular/core/testing';

import { CashbackService } from './cashback.service';

describe('CashbackService', () => {
  let service: CashbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
