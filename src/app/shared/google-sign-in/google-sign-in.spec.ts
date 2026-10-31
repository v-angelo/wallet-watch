import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleSignIn } from './google-sign-in';

describe('GoogleSignIn', () => {
  let component: GoogleSignIn;
  let fixture: ComponentFixture<GoogleSignIn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleSignIn],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleSignIn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
