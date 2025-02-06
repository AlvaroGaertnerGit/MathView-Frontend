import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizationMandelbrotComponent } from './visualization-mandelbrot.component';

describe('VisualizationMandelbrotComponent', () => {
  let component: VisualizationMandelbrotComponent;
  let fixture: ComponentFixture<VisualizationMandelbrotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizationMandelbrotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizationMandelbrotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
