import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Route } from '@angular/router';
import { VisualizationComponent } from './app/components/visualization/visualization.component';
import { VisualizationZetaComponent } from './app/components/visualization-zeta/visualization-zeta.component';
import { VisualizationMandelbrotComponent } from './app/components/visualization-mandelbrot/visualization-mandelbrot.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common'; // Importar LocationStrategy


const routes: Route[] = [
  { path: '', component: VisualizationComponent },
  { path: 'visualizationzeta', component: VisualizationZetaComponent },
  { path: 'visualizationMandelbrot', component: VisualizationMandelbrotComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Rutas
    provideHttpClient(),    // Cliente HTTP
    { provide: LocationStrategy, useClass: PathLocationStrategy }, // Habilitar HTML5 routing
  ]
});
