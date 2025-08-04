import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonExpeditionFormComponent } from './bon-expedition-form.component';

describe('BonExpeditionFormComponent', () => {
  let component: BonExpeditionFormComponent;
  let fixture: ComponentFixture<BonExpeditionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonExpeditionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonExpeditionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
