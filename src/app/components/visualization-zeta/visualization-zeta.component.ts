import { Component, OnInit } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { ApiService } from '../../services/api.service';

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  standalone: true,
  selector: 'app-visualization-zeta',
  templateUrl: './visualization-zeta.component.html',
  styleUrl: './visualization-zeta.component.scss',
  imports: [PlotlyModule],
})
export class VisualizationZetaComponent implements OnInit {
  graph = {
    data: [
      {
        z: [], // La magnitud como matriz 2D
        x: [], // Valores reales
        y: [], // Valores imaginarios
        type: 'surface', // Representamos un plano 3D
        colorscale: [
          [0.0, 'rgb(255, 0, 0)'], // Rojo
          [0.17, 'rgb(255, 0, 255)'], // Magenta
          [0.33, 'rgb(0, 0, 255)'], // Azul
          [0.5, 'rgb(0, 255, 255)'], // Cyan
          [0.67, 'rgb(0, 255, 0)'], // Verde
          [0.83, 'rgb(255, 255, 0)'], // Amarillo
          [1.0, 'rgb(255, 0, 0)'], // Rojo (cierre del ciclo)
        ], // Escala de colores
        colorbar: {
          bgcolor: '#dacfcf', // Fondo de la barra de colores
          tickcolor: '#343A40', // Color de las marcas de los ticks
          title: {
            text: '', // Texto del título de la barra
            font: {
              color: '#343A40', // Color del texto del título
              size: 14 // Tamaño del título
            }
          },
          tickfont: {
            color: '#ffffff', // Color de los valores numéricos
            size: 12 // Tamaño del texto
          }
        },
        zmin: 0,
        zmax: 6,
      },
    ],
    layout: {
      title: 'Plano Complejo',
      width: 900, // Ancho en píxeles
      autosize: true,
      paper_bgcolor: '#dacfcf',
      plot_bgcolor: '#495057',
      height: 600, // Altura en píxeles
      scene: {
        xaxis: { title: 'Re (x)', range: [0, 1], color: '#343A40'},
        yaxis: { title: 'Im (y)', range: [-30, 30], color: '#343A40' },
        zaxis: { title: '|f(z)| (magnitud)', range: [0, 5], color: '#343A40' },
      },
    },
  };
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getData('calculateZeta').subscribe({
      next: (data) => {
        this.graph.data[0].x = data.x;
        this.graph.data[0].y = data.y;
        this.graph.data[0].z = data.magnitude;

        // Opcional: agregar una transformación para fases o colores personalizados
      },
      error: (error) => console.error('Error al obtener los datos', error),
    });
  }
}
