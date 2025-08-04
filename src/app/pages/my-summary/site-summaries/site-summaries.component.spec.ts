import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteSummariesComponent } from './site-summaries.component';

describe('SiteSummariesComponent', () => {
  let component: SiteSummariesComponent;
  let fixture: ComponentFixture<SiteSummariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteSummariesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteSummariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
