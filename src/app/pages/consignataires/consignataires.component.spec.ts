import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignatairesComponent } from './consignataires.component';

describe('Consignataires', () => {
  let component: ConsignatairesComponent;
  let fixture: ComponentFixture<ConsignatairesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsignatairesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsignatairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
