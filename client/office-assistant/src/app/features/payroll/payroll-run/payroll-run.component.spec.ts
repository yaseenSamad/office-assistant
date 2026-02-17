import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollRunComponent } from './payroll-run.component';

describe('PayrollRunComponent', () => {
  let component: PayrollRunComponent;
  let fixture: ComponentFixture<PayrollRunComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollRunComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollRunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
