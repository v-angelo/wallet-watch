import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SavingsGoals } from './savings-goals';

describe('SavingsGoals', () => {
  let component: SavingsGoals;
  let fixture: ComponentFixture<SavingsGoals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingsGoals],
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsGoals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
