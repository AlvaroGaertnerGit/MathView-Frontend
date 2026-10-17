import { RenderMode, ServerRoute } from '@angular/ssr';

// Every view depends on Plotly (browser-only, WebGL) and on live API data, so
// the server sends the app shell and the browser renders the route.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
