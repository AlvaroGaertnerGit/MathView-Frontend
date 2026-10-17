import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { ApiService } from '../../services/api.service';
import { PLOT_CONFIG, SEQUENTIAL_SCALE, colorbar, layout3d } from '../../shared/plot-theme';

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  standalone: true,
  selector: 'app-visualization-zeta',
  templateUrl: './visualization-zeta.component.html',
  styleUrl: './visualization-zeta.component.scss',
  imports: [PlotlyModule, RouterLink],
})
export class VisualizationZetaComponent implements OnInit {
  loading = true;
  error: string | null = null;
  readonly plotConfig = PLOT_CONFIG;
  readonly plotStyle = { position: 'relative', width: '100%', height: '100%' };

  // |ζ(s)| over 0 ≤ Re s ≤ 1, −30 ≤ Im s ≤ 30 (the API's grid), clipped at 6 as before.
  // Colour follows the height: a magnitude is not cyclic, so a sequential scale.
  graph = {
    data: [
      {
        z: [],
        x: [],
        y: [],
        type: 'surface',
        colorscale: SEQUENTIAL_SCALE,
        colorbar: colorbar('|ζ(s)|'),
        zmin: 0,
        zmax: 6,
        lighting: { ambient: 0.75, diffuse: 0.6, specular: 0.15, roughness: 0.6 },
      },
    ],
    layout: layout3d({ x: 'Re s', y: 'Im s', z: '|ζ(s)|', xr: [0, 1], yr: [-30, 30], zr: [0, 5] }),
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getData('calculateZeta').subscribe({
      next: (data) => {
        this.graph.data[0].x = data.x;
        this.graph.data[0].y = data.y;
        this.graph.data[0].z = data.magnitude;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
        this.loading = false;
        this.error = error?.status === 0 ? 'No hay conexión con la API de MathView.' : 'La API no ha podido calcular la función zeta.';
      },
    });
  }
}
