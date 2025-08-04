import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarchandiseListComponent } from './marchandise-list.component';

describe('MarchandiseListComponent', () => {
  let component: MarchandiseListComponent;
  let fixture: ComponentFixture<MarchandiseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarchandiseListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarchandiseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
