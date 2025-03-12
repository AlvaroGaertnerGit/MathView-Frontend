import { Component, OnInit } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalculatorComponent } from "../calculator/calculator.component";

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
          bgcolor: '#343a40', // Fondo de la barra de colores
          tickcolor: '#17A2B8', // Color de las marcas de los ticks
          title: {
            text: '', // Texto del título de la barra
            font: {
              color: '#17A2B8', // Color del texto del título
              size: 14 // Tamaño del título
            }
          },
          tickfont: {
            color: '#ffffff', // Color de los valores numéricos
            size: 12 // Tamaño del texto
          }
        }
      },
    ],
    layout: {
      title: 'Plano Complejo',
      autosize: true,
      paper_bgcolor: '#343a40',
      plot_bgcolor: '#495057',
      // width: 900, // Ancho en píxeles
      // height: 600, // Altura en píxeles
      scene: {
        xaxis: { title: 'Re (x)', range: [-2, 2] , color: '#17A2B8'},
        yaxis: { title: 'Im (y)', range: [-2, 2] , color: '#17A2B8'},
        zaxis: { title: '|f(z)| (magnitud)' , color: '#17A2B8'},
      },
      margin: { t: 0, r: 0, l: 0, b: 0 }
    },
  };
  graph2 = {
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
          bgcolor: '#343a40', // Fondo de la barra de colores
          tickcolor: '#17A2B8', // Color de las marcas de los ticks
          title: {
            text: '', // Texto del título de la barra
            font: {
              color: '#17A2B8', // Color del texto del título
              size: 14 // Tamaño del título
            }
          },
          tickfont: {
            color: '#ffffff', // Color de los valores numéricos
            size: 12 // Tamaño del texto
          }
        }
      },
    ],
    layout: {
      title: 'Plano Complejo',
      autosize: true,
      paper_bgcolor: '#343a40',
      plot_bgcolor: '#495057',
      // width: , // Ancho en píxeles
      // height: 600, // Altura en píxeles
      scene: {
        xaxis: { title: 'Re (x)', range: [-2, 2] , color: '#17A2B8'},
        yaxis: { title: 'Im (y)', range: [-2, 2] , color: '#17A2B8'},
        zaxis: { title: '|arg(z)| (fase)' , color: '#17A2B8'},
      },
      margin: { t: 0, r: 0, l: 0, b: 0 }
    },
  };
  constructor(private apiService: ApiService, private router: Router) {}
  redirectToVisualizationZeta() {

      this.router.navigate(['/visualizationzeta']);
 
  }
  redirectToVisualizationMandelbrot() {
      this.router.navigate(['/visualizationMandelbrot']);
  }
  public limpiarCadena(input: string): string {
    // Eliminar espacios y asegurar el formato ax+biy
    return input.replace(/\s+/g, '').replace(/%2B/g, '+'); // Elimina todos los espacios
  }
  sendFunction(functionInput: string)
  {
    this.function = functionInput;
    functionInput = this.limpiarCadena(functionInput);
    this.apiService.calculateFunction(functionInput).subscribe({
      next: (data) => {
        this.graph.data[0].x = data.x;
        this.graph.data[0].y = data.y;
        this.graph.data[0].z = data.magnitude;

        this.graph2.data[0].x = data.x;
        this.graph2.data[0].y = data.y;
        this.graph2.data[0].z = data.phase;
        // Opcional: agregar una transformación para fases o colores personalizados
      },
      error: (error) => console.error('Error al obtener los datos', error),
    });
  }
  cambiaVisualizacion() {
    this.showMagnitude = !this.showMagnitude;
    this.showPhase = !this.showPhase;
  }
  ngOnInit(): void {
    // Llamar al servicio para obtener los datos
    this.apiService.getData('calculateFunction').subscribe({
      next: (data) => {
        this.graph.data[0].x = data.x;
        this.graph.data[0].y = data.y;
        this.graph.data[0].z = data.magnitude;
        
        this.graph2.data[0].x = data.x;
        this.graph2.data[0].y = data.y;
        this.graph2.data[0].z = data.phase;
        

        // Opcional: agregar una transformación para fases o colores personalizados
      },
      error: (error) => console.error('Error al obtener los datos', error),
    });
  }

}
