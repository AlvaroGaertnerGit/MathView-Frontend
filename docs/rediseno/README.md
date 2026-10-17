# MathView · auditoría y rediseño del frontend

Fecha: 2026-10-15. Rama de trabajo: `rediseno-frontend`. **No hay commits.** Los cambios están
en el árbol de trabajo, sin confirmar, para que los revises con `git diff master`.

- **Comparativa visual:** abre `comparativa.html` (doble clic).
- **Recursos para el portfolio:** `recursos/` (con `recursos.json`, que describe cada imagen).
- **Verificación:** `verificacion.json` (22/22).

## 1. Punto de restauración

Antes de tocar nada, los dos repositorios estaban limpios, en `master`:

- `MathView-Frontend` en `bb50b43`;
- `MathView-API` en `a0eb72d`.

| Qué | Dónde |
|---|---|
| *Bundles* de git completos, verificados con `git bundle verify` («is okay») | `~/Documents/projects/_restauracion-mathview-2026-10-15/` |
| Sumas SHA-256 de los *bundles* | `SHA256SUMS`, en la misma carpeta |
| HEAD de cada repositorio | `*.HEAD`, en la misma carpeta |

Para volver al original:

- **Sin perder el rediseño:** `git stash -u && git switch master`.
- **Descartando el rediseño:** `git switch master && git branch -D rediseno-frontend`, tras
  descartar los cambios. **Esto es irreversible: no lo he hecho.**

El repositorio de la API no se ha modificado. Solo tiene un entorno virtual nuevo en `venv/`,
que ya está en su `.gitignore`.

## 2. Auditoría

### 2.1 Qué es MathView

| Pieza | Tecnología | Estado |
|---|---|---|
| `MathView-Frontend` | Angular 20 (componentes *standalone*, SSR configurado), Plotly.js 2.35 con `angular-plotly.js`, Font Awesome | Compila y funciona contra la API local |
| `MathView-API` | Django 6 + Django REST Framework, NumPy, SciPy, SymPy, mpmath, drf-yasg (Swagger) y un servicio de OpenAI | Funciona en local (Python 3.14, `venv`) |
| Despliegue original | `mathview-backend.azurewebsites.net` | **El dominio ya no resuelve.** Por eso no había demo |

### 2.2 Funcionalidades

| Funcionalidad | Depende del backend | Estado comprobado |
|---|---|---|
| Superficie \|f(z)\| coloreada por la fase (rejilla −2…2, 100 × 100) | Sí (`calculateFunctionParam`) | ✅ z, 1/z, (z²−1)/(z²+1), z³−1, sen z, eᶻ, cos, tg, log, ln (10–45 ms) |
| Vista de fase en altura | Sí (mismos datos) | ✅ |
| Vista 2D (mapa de fase) | Sí (mismos datos) | ✅ |
| Ceros y polos | Sí (`analyzeFunction`, SymPy) | ✅ en la API. **En el original no había ningún botón que lo llamara** |
| Función zeta de Riemann | Sí (`calculateZeta`) | ✅ unos 7,6 s |
| Conjunto de Mandelbrot | Sí (`calculateMandelbrot`) | ✅ unos 0,2 s. **El exponente no llegaba** (ver §2.3) |
| Análisis con GPT | Sí, y una clave de OpenAI | ⚠️ Sin clave responde con un aviso. El frontend no lo usa |
| Fourier | Sí (`calculateFourier`) | Existe en la API; el frontend no lo usa |
| Login | Un servicio en `localhost:8081/api/auth` | ❌ **Ese servicio no existe en ninguno de los dos repositorios.** La pantalla está, pero no puede autenticar |
| Calculadora: Γ, ∫, ∂ | Sí | ❌ La API no las admite (`name 'Γ' is not defined`, `invalid character '∫'`) |

### 2.3 Problemas técnicos encontrados

| # | Problema | Dónde | Qué he hecho |
|---|---|---|---|
| 1 | La API apuntaba a un dominio muerto | `api.service.ts` | Ahora la URL sale de `src/app/config/api.config.ts` y apunta a la API local (`127.0.0.1:8010`) |
| 2 | **Los enlaces directos y las recargas daban 404** (`/visualizationzeta` → «Cannot GET»). Las rutas solo estaban en `main.ts`; la configuración del servidor tenía la lista vacía | `main.ts`, `app.routes.ts` | Una sola tabla de rutas en `app.routes.ts`, con carga diferida, y renderizado en el cliente (`RenderMode.Client`), porque Plotly necesita `window` y WebGL |
| 3 | **El exponente de Mandelbrot nunca llegaba:** el frontend enviaba `?function=5` y la API lee `d`, así que siempre se dibujaba d = 2 | `api.service.ts` | Ahora envía `?d=`. Verificado: d = 3 da otro conjunto |
| 4 | **La tecla ÷ no funcionaba:** enviaba el carácter `÷` y la API respondía 400 | `calculator.component.ts` | La tecla envía `/` (sigue mostrando `/`). Verificado: `1/𝑧` se representa |
| 5 | Ceros y polos programado pero inaccesible | `visualization.component.ts` | Botón «Ceros y polos» que llama al método que ya existía |
| 6 | Los errores de la API solo iban a la consola: la gráfica se quedaba igual sin explicación | Todas las vistas | Estados de carga y de error visibles, con el mensaje de la API |
| 7 | `import { request } from 'https'` (un módulo de Node) en código de navegador, sin usar | `api.service.ts` | Eliminado |
| 8 | Intro en el campo de texto no hacía nada; solo la tecla ↵ | `calculator` | Intro representa la función |
| 9 | Ejes, títulos y barras de color casi invisibles (`#343A40` sobre fondo oscuro); la caja del título de la barra, vacía | Las tres figuras | Tema común (`shared/plot-theme.ts`) |
| 10 | «Introduce el exponente» sin campo; «Introduce una función» en zeta, que no tiene entrada | Mandelbrot, zeta | Mandelbrot tiene ahora su campo; zeta explica qué calcula |
| 11 | Zeta coloreada con la escala cíclica de la fase, aunque representa una magnitud | Zeta | Escala secuencial. **Los datos y la altura no cambian** |
| 12 | Sin forma de volver desde zeta, Mandelbrot o login | Todas | Barra de navegación y enlace «← Plano complejo» |

**Problemas del backend, que solo documento** (no he tocado la API):

- **`pi` escrito a mano falla.** `calculateFunctionParam` sustituye todas las «i» por «I» antes
  de interpretar la expresión. Así, `pi` se convierte en `pI` y falla tras unos 19 s. La tecla
  `𝜋` sí funciona.
- **Configuración de seguridad.**
  - `settings.py` tiene `DEBUG = True` y una `SECRET_KEY` de desarrollo en el repositorio.
  - `CORS_ALLOW_ALL_ORIGINS = True`.
  - No es un problema mientras no se despliegue, y no se va a desplegar.
- **Consola de Windows.** Los `print` de las vistas fallan en una consola cp1252 con Γ, ∫ y ∂.
  En local se evita con `PYTHONUTF8=1`. Aun así, esas funciones no las admite la API.
- **`infoFunctionGPT`.** La cadena de `if` para el curso está mal encadenada: siempre acaba en
  «Universitario». No afecta al frontend.

### 2.4 Lo más interesante visualmente

1. **La vista 2D por fase:** (z²−1)/(z²+1) y z³−1. Las raíces y los polos aparecen como puntos
   donde se juntan todos los colores. Es la imagen más reconocible del análisis complejo.
2. **\|f(z)\| en 3D de una función racional:** los polos como columnas que se disparan.
3. **Mandelbrot en 3D**, con el exponente.
4. **Zeta en la banda crítica:** los valles que tocan el suelo en Re s = ½.

## 3. Rediseño

**Dirección.** Un instrumento para mirar funciones:

- tinta casi negra, líneas finas y un único acento;
- **el color pertenece a las matemáticas:** la fase;
- la marca es la rueda de fase;
- tipografía: Instrument Serif para la voz, Inter para la interfaz y JetBrains Mono para las
  expresiones;
- la figura manda: ocupa toda la altura en escritorio y va la primera en el móvil.

**Qué se ha conservado tal cual:**

- los cálculos y las llamadas a la API;
- el mapeo de los datos a las tres figuras;
- las escalas de fase;
- los tres modos;
- la calculadora y sus pestañas;
- la guía (su texto es el original, con dos correcciones: la vista 2D solo colorea por fase, y
  se cita el libro de Ponce Campuzano con su enlace);
- zeta, Mandelbrot y login.

**Qué es nuevo:**

- barra de navegación;
- seis ejemplos verificados;
- tarjetas de funciones especiales;
- control segmentado de modos;
- leyenda que explica cada vista;
- diálogo de ceros y polos;
- estados de carga y de error;
- campo de exponente en Mandelbrot;
- Esc cierra los diálogos;
- enlace para saltar al contenido;
- pestañas con roles ARIA;
- nombres accesibles en las teclas de símbolos;
- `lang="es"` y meta descripción;
- `prefers-reduced-motion`;
- se elimina la hoja de Font Awesome de la CDN.

**Archivos tocados** (`git diff --stat master`):

- `src/index.html`, `src/main.ts`, `src/styles.scss`;
- `app.component.*`, `app.config.ts`, `app.routes.ts`, `app.routes.server.ts`;
- `services/api.service.ts`;
- los cinco componentes.

**Nuevos:**

- `config/api.config.ts`;
- `shared/plot-theme.ts`;
- `shared/_special-view.scss`;
- `docs/rediseno/`.

**Sin dependencias nuevas.** Las herramientas de `docs/rediseno/tools/` usan el Playwright que ya
tiene el portfolio (`PLAYWRIGHT_PATH`), así que MathView no gana dependencias.

**Peso** (compilación de producción, `ng build`, sin avisos de presupuesto):

- carga inicial: **318 KB (86 KB con gzip)**;
- Plotly va en un fragmento diferido de 4,7 MB (1,07 MB con gzip) que solo se descarga al abrir
  una visualización;
- vistas: 29 KB, 6 KB, 5 KB y 4 KB.

## 4. Verificación (`tools/verify.cjs`, 22/22)

Se ejecuta contra la API local:

- carga inicial;
- escribir una función e Intro;
- el teclado (incluida la división);
- los ejemplos;
- los tres modos con `aria-pressed`;
- ceros y polos (−1 y 1; I y −I);
- Esc;
- la guía;
- el error visible con `pi*z`;
- **los tres enlaces directos** (200);
- zeta 100 × 100;
- **Mandelbrot con d = 2 y d = 3 distintos**;
- el primer Tab llega a «Saltar al contenido»;
- móvil sin scroll horizontal y con la figura primero;
- consola sin errores inesperados.

**No verificado:**

- los tests unitarios de Karma (`*.spec.ts`), que no he ejecutado;
- un lector de pantalla real;
- el rendimiento con GPU: este equipo dibuja WebGL por software.

## 5. Cómo ejecutarlo en local

```bash
# API (terminal 1)
cd MathView-API/Backend
PYTHONUTF8=1 ../venv/Scripts/python manage.py runserver 127.0.0.1:8010 --noreload

# Frontend (terminal 2). En esta red, npm necesita la CA del sistema.
cd MathView-Frontend
NODE_OPTIONS=--use-system-ca npx ng serve --port 4310 --host 127.0.0.1
# → http://127.0.0.1:4310/
```

Para regenerar el material:

- capturas: `PLAYWRIGHT_PATH=<ruta a @playwright/test> node docs/rediseno/tools/capture.cjs docs/rediseno/capturas/despues after`;
- verificación: `tools/verify.cjs`;
- recursos: `tools/resources.cjs`.

## 6. Pendiente de tu decisión

- **Γ, ∫ y ∂ en la calculadora.** No funcionan porque la API no las admite. ¿Las quito, las
  marco como «próximamente» o se implementan en la API? No las he eliminado.
- **Login.** Depende de un servicio que no existe. ¿Lo retiramos de la navegación?
- **`pi` escrito a mano.** Corregirlo es un cambio del backend: no lo he tocado.
- Los cambios están sin confirmar en la rama `rediseno-frontend`. El commit lo haces tú cuando
  lo apruebes.
