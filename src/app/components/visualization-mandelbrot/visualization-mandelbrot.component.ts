import { Component, OnInit } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule} from '@angular/common';
import { expand } from 'rxjs';

PlotlyModule.plotlyjs = PlotlyJS;


@Component({
  standalone: true,
  selector: 'app-visualization-mandelbrot',
  imports: [PlotlyModule],
  templateUrl: './visualization-mandelbrot.component.html',
  styleUrl: './visualization-mandelbrot.component.scss'
})
export class VisualizationMandelbrotComponent implements OnInit{
  graph = {
    data: [
      {
        z: [], // Representa las iteraciones del conjunto
        x: [], // Ejes reales
        y: [], // Ejes imaginarios
        type: 'surface', // Representación en 3D
        colorscale: 'Viridis', // Escala de colores más eficiente
        colorbar: {
          bgcolor: '#343a40',
          tickcolor: '#17A2B8',
          title: {
            text: 'Iteraciones',
            font: {
              color: '#17A2B8',
              size: 14
            }
          },
          tickfont: {
            color: '#ffffff',
            size: 12
          }
        },
        zmin: 0, // Número mínimo de iteraciones
        zmax: 100, // Número máximo de iteraciones
      },
    ],
    layout: {
      title: 'Conjunto de Mandelbrot',
      width: 900,
      height: 600,
      autosize: true,
      paper_bgcolor: '#343a40',
      plot_bgcolor: '#495057',
      scene: {
        xaxis: { title: 'Re (x)', range: [-2, 2], color: '#17A2B8' },
        yaxis: { title: 'Im (y)', range: [-2, 2], color: '#17A2B8' },
        zaxis: { title: 'Iteraciones', range: [0, 100], color: '#17A2B8' },
      },
    },
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Realizar la llamada para obtener los datos del backend
    this.apiService.getMandelbrot(5).subscribe({
      next: (data) => {
        // Actualizar la visualización con los datos de iteraciones
        this.graph.data[0].x = data.x;
        this.graph.data[0].y = data.y;
        this.graph.data[0].z = data.iterations;  // Solo usamos iteraciones
      },
      error: (error) => console.error('Error al obtener los datos', error),
    });
  }


}
