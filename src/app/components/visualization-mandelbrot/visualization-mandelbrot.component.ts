import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { ApiService } from '../../services/api.service';
import { PLOT_CONFIG, colorbar, layout3d } from '../../shared/plot-theme';

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  standalone: true,
  selector: 'app-visualization-mandelbrot',
  imports: [PlotlyModule, FormsModule, RouterLink],
  templateUrl: './visualization-mandelbrot.component.html',
  styleUrl: './visualization-mandelbrot.component.scss'
})
export class VisualizationMandelbrotComponent implements OnInit {
  /** Exponent d in z ↦ z^d + c. The original asked the API for 5 under the wrong
   *  parameter name, so it always drew d = 2; 2 stays the default, now editable. */
  exponent = 2;
  shownExponent = 2;
  loading = true;
  error: string | null = null;
  readonly plotConfig = PLOT_CONFIG;
  readonly plotStyle = { position: 'relative', width: '100%', height: '100%' };

  graph = {
    data: [
      {
        z: [], // Representa las iteraciones del conjunto
        x: [], // Ejes reales
        y: [], // Ejes imaginarios
        type: 'surface', // Representación en 3D
        colorscale: 'Viridis', // Escala de colores más eficiente
        colorbar: colorbar('Iteraciones'),
        zmin: 0, // Número mínimo de iteraciones
        zmax: 100, // Número máximo de iteraciones
        lighting: { ambient: 0.8, diffuse: 0.55, specular: 0.1, roughness: 0.7 },
      },
    ],
    layout: layout3d({ x: 'Re c', y: 'Im c', z: 'Iteraciones', xr: [-2, 2], yr: [-2, 2], zr: [0, 100] }),
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    const d = Math.round(Number(this.exponent));
    if (!Number.isFinite(d) || d < 2 || d > 8) {
      this.error = 'El exponente debe ser un número entero entre 2 y 8.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.apiService.getMandelbrot(d).subscribe({
      next: (data) => {
        // Actualizar la visualización con los datos de iteraciones
        this.graph.data[0].x = data.x;
        this.graph.data[0].y = data.y;
        this.graph.data[0].z = data.iterations; // Solo usamos iteraciones
        this.shownExponent = d;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
        this.loading = false;
        this.error = error?.status === 0 ? 'No hay conexión con la API de MathView.' : 'La API no ha podido calcular el conjunto.';
      },
    });
  }
}
