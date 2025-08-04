import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonExpeditionListComponent } from './bon-expedition-list.component';

describe('BonExpeditionListComponent', () => {
  let component: BonExpeditionListComponent;
  let fixture: ComponentFixture<BonExpeditionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonExpeditionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonExpeditionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
