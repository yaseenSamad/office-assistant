import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipDetailComponent } from './payslip-detail.component';

describe('PayslipDetailComponent', () => {
  let component: PayslipDetailComponent;
  let fixture: ComponentFixture<PayslipDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayslipDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayslipDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
