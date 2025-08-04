import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportateursComponent } from './importateurs.component';

describe('ImportateursComponent', () => {
  let component: ImportateursComponent;
  let fixture: ComponentFixture<ImportateursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportateursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
