import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillOfLoadingComponent } from './bill-of-loading.component';

describe('BillOfLoadingComponent', () => {
  let component: BillOfLoadingComponent;
  let fixture: ComponentFixture<BillOfLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillOfLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillOfLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
