import { Routes } from '@angular/router';

// The single route table (it used to live only in main.ts, so the server
// config had none and deep links such as /visualizationzeta returned 404).
// Components are lazy: each view (and Plotly) loads only when visited.
export const routes: Routes = [
  {
    path: '',
    title: 'MathView · Plano complejo',
    loadComponent: () => import('./components/visualization/visualization.component').then((m) => m.VisualizationComponent),
  },
  {
    path: 'visualizationzeta',
    title: 'MathView · Función zeta de Riemann',
    loadComponent: () =>
      import('./components/visualization-zeta/visualization-zeta.component').then((m) => m.VisualizationZetaComponent),
  },
  {
    path: 'visualizationMandelbrot',
    title: 'MathView · Conjunto de Mandelbrot',
    loadComponent: () =>
      import('./components/visualization-mandelbrot/visualization-mandelbrot.component').then(
        (m) => m.VisualizationMandelbrotComponent,
      ),
  },
  {
    path: 'login',
    title: 'MathView · Acceder',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  { path: '**', redirectTo: '' },
];
