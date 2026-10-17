import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalculatorComponent } from '../calculator/calculator.component';
import { PHASE_SCALE, PLOT_CONFIG, colorbar, layout2d, layout3d } from '../../shared/plot-theme';

PlotlyModule.plotlyjs = PlotlyJS;

/** Functions that the API evaluates (checked against calculateFunctionParam). */
const EXAMPLES = [
  { expr: 'z', label: 'z', note: 'la identidad' },
  { expr: '1/z', label: '1/z', note: 'un polo en 0' },
  { expr: '(z^2-1)/(z^2+1)', label: '(z²−1)/(z²+1)', note: 'ceros ±1, polos ±i' },
  { expr: 'z^3-1', label: 'z³−1', note: 'tres raíces' },
  { expr: 'sin(z)', label: 'sen z', note: 'periódica' },
  { expr: 'exp(z)', label: 'eᶻ', note: 'sin ceros' },
];

@Component({
  standalone: true,
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss'],
  imports: [CommonModule, FormsModule, PlotlyModule, CalculatorComponent],
})
export class VisualizationComponent implements OnInit {
  @ViewChild(CalculatorComponent) calculator?: CalculatorComponent;

  functionInput: string = '';
  function: string = 'z';
  showMagnitude = true;
  showPhase = false;
  show2D = false;
  showModal: boolean = false;
  showModalPrin: boolean = false;
  showModalExp: boolean = false;
  loading = false;
  error: string | null = null;
  readonly examples = EXAMPLES;
  readonly plotConfig = PLOT_CONFIG;
  readonly plotStyle = { position: 'relative', width: '100%', height: '100%' };
  functionInfo: {
    expression: string;
    zeros: string[];
    poles: string[];
    notes: string;
  } | null = null;

  // Height |f(z)|, colour arg f(z)
  graph = {
    data: [
      {
        z: [],
        x: [],
        y: [],
        surfacecolor: [],
        type: 'surface',
        colorscale: PHASE_SCALE,
        cmin: -Math.PI,
        cmax: Math.PI,
        colorbar: colorbar('arg f(z)'),
        contours: { z: { show: false } },
        lighting: { ambient: 0.75, diffuse: 0.6, specular: 0.15, roughness: 0.6 },
      },
    ],
    layout: layout3d({ x: 'Re z', y: 'Im z', z: '|f(z)|', xr: [-2, 2], yr: [-2, 2] }),
  };

  // Height arg f(z), colour |f(z)|
  graph2 = {
    data: [
      {
        z: [],
        x: [],
        y: [],
        surfacecolor: [],
        type: 'surface',
        colorscale: PHASE_SCALE,
        cmin: 0,
        cmax: 1,
        colorbar: colorbar('|f(z)|'),
        lighting: { ambient: 0.75, diffuse: 0.6, specular: 0.15, roughness: 0.6 },
      },
    ],
    layout: layout3d({ x: 'Re z', y: 'Im z', z: 'arg f(z)', xr: [-2, 2], yr: [-2, 2] }),
  };

  // The plane seen from above, colour arg f(z)
  graph3 = {
    data: [
      {
        z: [],
        x: [],
        y: [],
        type: 'heatmap',
        colorscale: PHASE_SCALE,
        colorbar: colorbar('arg f(z)'),
      },
    ],
    layout: layout2d('Re z', 'Im z'),
  };

  constructor(private apiService: ApiService, private router: Router) { }

  redirectToVisualizationZeta() {
    this.router.navigate(['/visualizationzeta']);
  }

  redirectToVisualizationMandelbrot() {
    this.router.navigate(['/visualizationMandelbrot']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  limpiarCadena(input: string): string {
    return input.replace(/\s+/g, '').replace(/%2B/g, '+');
  }

  /** An example fills the editor too, so it can be edited from there. */
  useExample(expr: string) {
    if (this.calculator) {
      this.calculator.displayExpression = expr;
      this.calculator.functionInput = expr;
    }
    this.sendFunction(expr);
  }

  sendFunction(functionInput: string) {
    if (!functionInput.trim()) return;
    this.function = functionInput;
    functionInput = this.limpiarCadena(functionInput);
    this.loading = true;
    this.error = null;
    this.apiService.calculateFunction(functionInput).subscribe({
      next: (data) => {
        this.applyData(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
        this.loading = false;
        this.error = this.describeError(error);
      },
    });
  }

  /** Same mapping as before: the API's grid, magnitude and phase into the three figures. */
  private applyData(data: any) {
    const mag = data.magnitude.flat();
    const phase = data.phase.flat();

    const magMin = Math.min(...mag);
    const magMax = Math.max(...mag);
    const phaseMin = Math.min(...phase);
    const phaseMax = Math.max(...phase);

    // Graph
    this.graph.data[0].x = data.x;
    this.graph.data[0].y = data.y;
    this.graph.data[0].z = data.magnitude;
    this.graph.data[0].surfacecolor = data.phase;
    this.graph.data[0].cmin = phaseMin;
    this.graph.data[0].cmax = phaseMax;

    // Graph2
    this.graph2.data[0].x = data.x;
    this.graph2.data[0].y = data.y;
    this.graph2.data[0].z = data.phase;
    this.graph2.data[0].surfacecolor = data.magnitude;
    this.graph2.data[0].cmin = magMin;
    this.graph2.data[0].cmax = magMax;

    // Graph2D
    this.graph3.data[0].x = data.x;
    this.graph3.data[0].y = data.y;
    this.graph3.data[0].z = data.phase;
  }

  private describeError(error: any): string {
    if (error?.status === 0) return 'No hay conexión con la API de MathView. Comprueba que el servidor está en marcha.';
    const detail = error?.error?.error;
    return detail ? `La API respondió: ${detail}` : 'Revisa la expresión e inténtalo de nuevo.';
  }

  cambiaVisualizacion(num: number) {
    if (num === 1) {
      this.showMagnitude = false;
      this.showPhase = true;
      this.show2D = false;
    } else if (num === 2) {
      this.showMagnitude = true;
      this.showPhase = false;
      this.show2D = false;
    } else if (num === 3) {
      this.showMagnitude = false;
      this.showPhase = false;
      this.show2D = true;
    }
  }

  modeTitle(): string {
    if (this.showPhase) return 'Fase en altura';
    if (this.show2D) return 'Vista 2D';
    return 'Magnitud en altura';
  }

  ngOnInit(): void {
    this.loading = true;
    this.apiService.getData('calculateFunction').subscribe({
      next: (data) => {
        this.applyData(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
        this.loading = false;
        this.error = this.describeError(error);
      },
    });
  }

  loadFunctionInfo() {
    this.apiService.getFunctionInfo(this.function).subscribe({
      next: (data: any) => {
        this.functionInfo = {
          expression: data.expression,
          zeros: data.zeros || [],
          poles: data.poles || [],
          notes: data.notes || 'Sin anotaciones.',
        };
      },
      error: () => {
        this.functionInfo = {
          expression: this.function,
          zeros: [],
          poles: [],
          notes: 'No se pudo analizar la función.',
        };
      },
    });
  }

  getRepresentationDescription(): string {
    if (this.showMagnitude) {
      return 'Muestra la distancia del valor complejo al origen (mod(z)).';
    } else if (this.showPhase) {
      return 'Muestra el ángulo del número complejo (arg(z)).';
    } else if (this.show2D) {
      return 'Representación de Re(z) frente a Im(z).';
    }
    return 'Desconocido.';
  }

  /** Esc closes whichever dialog is open. */
  @HostListener('document:keydown.escape')
  closeDialogs() {
    this.functionInfo = null;
    if (this.showModal) this.closeModal();
  }

  openModal() {
    this.showModal = true;
    this.showModalPrin = true;
    this.showModalExp = false
  }

  closeModal() {
    this.showModal = false;
    this.showModalPrin = false;
    this.showModalExp = false;
  }
  siguienteModal() {
    this.showModalExp = true;
    this.showModalPrin = false;
  }
  anteriorModal() {
    this.showModalExp = false;
    this.showModalPrin = true;
  }
  closesiguienteModal() {
    this.showModalExp = false;
  }
}
