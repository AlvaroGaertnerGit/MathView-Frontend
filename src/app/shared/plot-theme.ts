// One visual theme for every Plotly figure in MathView, so axis titles, ticks
// and colour bars are legible on the dark workspace. Only presentation lives
// here: what each figure plots (and its colour scale) stays in its component.

export const INK = {
  text: '#e8ebf2',
  muted: '#8b93a7',
  faint: '#4a5266',
  grid: '#1b2131',
  zero: '#2c3448',
  font: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

/** Domain colouring: hue follows the phase arg f(z) (a cyclic quantity). */
export const PHASE_SCALE: [number, string][] = [
  [0.0, 'rgb(255, 0, 0)'],
  [0.17, 'rgb(255, 0, 255)'],
  [0.33, 'rgb(0, 0, 255)'],
  [0.5, 'rgb(0, 255, 255)'],
  [0.67, 'rgb(0, 255, 0)'],
  [0.83, 'rgb(255, 255, 0)'],
  [1.0, 'rgb(255, 0, 0)'],
];

/** For non-cyclic quantities (a magnitude, an iteration count). */
export const SEQUENTIAL_SCALE: [number, string][] = [
  [0.0, '#0b1026'],
  [0.2, '#2a2f7a'],
  [0.45, '#6a3fa0'],
  [0.7, '#d9658a'],
  [0.88, '#f6a964'],
  [1.0, '#fdf1c7'],
];

export function colorbar(title: string) {
  return {
    title: { text: title, side: 'right', font: { color: INK.muted, size: 12, family: INK.font } },
    tickfont: { color: INK.muted, size: 11, family: INK.mono },
    outlinewidth: 0,
    thickness: 10,
    len: 0.7,
    bgcolor: 'rgba(0,0,0,0)',
  };
}

function axis3d(title: string, range?: [number, number]) {
  return {
    title: { text: title, font: { color: INK.muted, size: 12, family: INK.font } },
    tickfont: { color: INK.faint, size: 10, family: INK.mono },
    gridcolor: INK.grid,
    zerolinecolor: INK.zero,
    showbackground: false,
    ...(range ? { range } : {}),
  };
}

export function layout3d(axes: { x: string; y: string; z: string; xr?: [number, number]; yr?: [number, number]; zr?: [number, number] }) {
  return {
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: INK.font, color: INK.text },
    margin: { t: 8, r: 8, l: 8, b: 8 },
    scene: {
      xaxis: axis3d(axes.x, axes.xr),
      yaxis: axis3d(axes.y, axes.yr),
      zaxis: axis3d(axes.z, axes.zr),
      camera: { eye: { x: 1.55, y: -1.55, z: 1.05 } },
      aspectmode: 'cube',
    },
  };
}

export function layout2d(x: string, y: string) {
  const ax = (t: string) => ({
    title: { text: t, font: { color: INK.muted, size: 12, family: INK.font } },
    tickfont: { color: INK.faint, size: 10, family: INK.mono },
    gridcolor: INK.grid,
    zerolinecolor: INK.zero,
  });
  return {
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: INK.font, color: INK.text },
    margin: { t: 12, r: 12, l: 52, b: 44 },
    xaxis: ax(x),
    yaxis: { ...ax(y), scaleanchor: 'x' },
  };
}

/** Plotly toolbar: keep the image download the user guide mentions, drop the logo. */
export const PLOT_CONFIG = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d'],
  toImageButtonOptions: { format: 'png', filename: 'mathview', scale: 2 },
};
