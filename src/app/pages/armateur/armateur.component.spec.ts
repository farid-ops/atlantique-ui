import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmateurComponent } from './armateur.component';

describe('Armateur', () => {
  let component: ArmateurComponent;
  let fixture: ComponentFixture<ArmateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArmateurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArmateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
