import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizationZetaComponent } from './visualization-zeta.component';

describe('VisualizationZetaComponent', () => {
  let component: VisualizationZetaComponent;
  let fixture: ComponentFixture<VisualizationZetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizationZetaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizationZetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
