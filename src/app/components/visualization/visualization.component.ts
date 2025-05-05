import { Component, OnInit } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalculatorComponent } from '../calculator/calculator.component';

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  standalone: true,
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss'],
  imports: [CommonModule, FormsModule, PlotlyModule, CalculatorComponent],
})
export class VisualizationComponent implements OnInit {
  functionInput: string = '';
  function: string = 'z';
  showMagnitude = true;
  showPhase = false;
  show2D = false;

  functionInfo: {
    expression: string;
    zeros: string[];
    poles: string[];
    notes: string;
  } | null = null;

  graph = {
    data: [
      {
        z: [],
        x: [],
        y: [],
        surfacecolor: [],
        type: 'surface',
        colorscale: [
          [0.0, 'rgb(255, 0, 0)'],
          [0.17, 'rgb(255, 0, 255)'],
          [0.33, 'rgb(0, 0, 255)'],
          [0.5, 'rgb(0, 255, 255)'],
          [0.67, 'rgb(0, 255, 0)'],
          [0.83, 'rgb(255, 255, 0)'],
          [1.0, 'rgb(255, 0, 0)'],
        ],
        cmin: -Math.PI,
        cmax: Math.PI,
        colorbar: {
          bgcolor: '#dacfcf',
          tickcolor: '#343A40',
          title: {
            text: 'Fase arg(f(z))',
            font: { color: '#343A40', size: 14 },
          },
          tickfont: { color: '#ffffff', size: 12 },
        },
      },
    ],
    layout: {
      title: 'Plano Complejo (Altura: |f(z)|, Color: arg(f(z)))',
      autosize: true,
      paper_bgcolor: '#dacfcf',
      plot_bgcolor: '#495057',
      scene: {
        xaxis: { title: 'Re (x)', range: [-2, 2], color: '#343A40' },
        yaxis: { title: 'Im (y)', range: [-2, 2], color: '#343A40' },
        zaxis: { title: '|f(z)|', color: '#343A40' },
      },
      margin: { t: 0, r: 0, l: 0, b: 0 },
    },
  };

  graph2 = {
    data: [
      {
        z: [],
        x: [],
        y: [],
        surfacecolor: [],
        type: 'surface',
        colorscale: [
          [0.0, 'rgb(255, 0, 0)'],
          [0.17, 'rgb(255, 0, 255)'],
          [0.33, 'rgb(0, 0, 255)'],
          [0.5, 'rgb(0, 255, 255)'],
          [0.67, 'rgb(0, 255, 0)'],
          [0.83, 'rgb(255, 255, 0)'],
          [1.0, 'rgb(255, 0, 0)'],
        ],
        cmin: 0,
        cmax: 1,
        colorbar: {
          bgcolor: '#dacfcf',
          tickcolor: '#343A40',
          title: {
            text: 'Magnitud |f(z)|',
            font: { color: '#343A40', size: 14 },
          },
          tickfont: { color: '#ffffff', size: 12 },
        },
      },
    ],
    layout: {
      title: 'Plano Complejo (Altura: arg(f(z)), Color: |f(z)|)',
      autosize: true,
      paper_bgcolor: '#dacfcf',
      plot_bgcolor: '#495057',
      scene: {
        xaxis: { title: 'Re (x)', range: [-2, 2], color: '#343A40' },
        yaxis: { title: 'Im (y)', range: [-2, 2], color: '#343A40' },
        zaxis: { title: 'arg(f(z))', color: '#343A40' },
      },
      margin: { t: 0, r: 0, l: 0, b: 0 },
    },
  };

  constructor(private apiService: ApiService, private router: Router) {}

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

  sendFunction(functionInput: string) {
    this.function = functionInput;
    functionInput = this.limpiarCadena(functionInput);
    this.apiService.calculateFunction(functionInput).subscribe({
      next: (data) => {
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
      },
      error: (error) => console.error('Error al obtener los datos', error),
    });
  }

  cambiaVisualizacion(num: number) {
    if (num === 1) {
      this.showMagnitude = false;
      this.showPhase = true;
    } else if (num === 2) {
      this.showMagnitude = true;
      this.showPhase = false;
    } else if (num === 3) {
      this.showMagnitude = false;
      this.showPhase = false;
      this.show2D = true;
    }
  }

  ngOnInit(): void {
    this.apiService.getData('calculateFunction').subscribe({
      next: (data) => {
        const mag = data.magnitude.flat();
        const phase = data.phase.flat();

        const magMin = Math.min(...mag);
        const magMax = Math.max(...mag);
        const phaseMin = Math.min(...phase);
        const phaseMax = Math.max(...phase);

        this.graph.data[0].x = data.x;
        this.graph.data[0].y = data.y;
        this.graph.data[0].z = data.magnitude;
        this.graph.data[0].surfacecolor = data.phase;
        this.graph.data[0].cmin = phaseMin;
        this.graph.data[0].cmax = phaseMax;

        this.graph2.data[0].x = data.x;
        this.graph2.data[0].y = data.y;
        this.graph2.data[0].z = data.phase;
        this.graph2.data[0].surfacecolor = data.magnitude;
        this.graph2.data[0].cmin = magMin;
        this.graph2.data[0].cmax = magMax;
      },
      error: (error) => console.error('Error al obtener los datos', error),
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
}
