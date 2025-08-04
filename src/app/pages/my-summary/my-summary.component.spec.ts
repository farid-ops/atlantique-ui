import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySummaryComponent } from './my-summary.component';

describe('MySummaryComponent', () => {
  let component: MySummaryComponent;
  let fixture: ComponentFixture<MySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
