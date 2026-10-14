import { TestBed } from '@angular/core/testing';
import { TansactionService } from './tansaction.service';

describe('TansactionService', () => {
  let service: TansactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TansactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
