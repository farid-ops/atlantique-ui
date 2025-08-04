import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NatureMarchandisesComponent } from './nature-marchandises.component';

describe('NatureMarchandises', () => {
  let component: NatureMarchandisesComponent;
  let fixture: ComponentFixture<NatureMarchandisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NatureMarchandisesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NatureMarchandisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
