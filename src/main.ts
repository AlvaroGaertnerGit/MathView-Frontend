import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Route } from '@angular/router';
import { VisualizationComponent } from './app/components/visualization/visualization.component';
import { VisualizationZetaComponent } from './app/components/visualization-zeta/visualization-zeta.component';

const routes: Route[] = [
  { path: '', component: VisualizationComponent },
  { path: 'visualizationzeta', component: VisualizationZetaComponent },
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient()],
});
