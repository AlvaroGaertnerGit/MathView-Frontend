// Portfolio-ready images of real MathView output (computed by the local API,
// drawn by the app): each figure alone at 2x, plus full screens.
//   PLAYWRIGHT_PATH=... node docs/rediseno/tools/resources.cjs docs/rediseno/recursos
const path = require("path")
const fs = require("fs")
const { chromium } = require(process.env.PLAYWRIGHT_PATH)
const BASE = "http://127.0.0.1:4310"
const out = path.resolve(process.argv[2])
fs.mkdirSync(out, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function ready(page, timeout = 60000) {
  await page.waitForFunction(() => {
    const p = [...document.querySelectorAll(".js-plotly-plot")].find((el) => el.offsetParent)
    return p && p.data?.[0]?.z?.length && !document.querySelector('[aria-busy="true"]')
  }, null, { timeout })
  await wait(1800)
}

;(async () => {
  const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const manifest = []
  const save = async (name, what, locator) => {
    const file = `${name}.png`
    await (locator ?? page).screenshot({ path: path.join(out, file) })
    manifest.push({ file, what })
    console.log(file)
  }

  await page.goto(BASE + "/")
  await ready(page)
  const plane = [
    ["(z^2-1)/(z^2+1)", "Magnitud", "plano-racional-magnitud", "|f(z)| de (z²−1)/(z²+1): ceros en ±1, polos en ±i; color = arg f(z)"],
    ["(z^2-1)/(z^2+1)", "2D", "plano-racional-2d", "Vista 2D de (z²−1)/(z²+1): coloración por fase"],
    ["z^3-1", "2D", "plano-cubica-2d", "Vista 2D de z³−1: las tres raíces cúbicas de la unidad"],
    ["z^3-1", "Magnitud", "plano-cubica-magnitud", "|f(z)| de z³−1"],
    ["sin(z)", "Fase", "plano-seno-fase", "Fase de sen z en altura; color = |f(z)|"],
    ["1/z", "Magnitud", "plano-inversa-magnitud", "|1/z|: un polo en el origen"],
  ]
  for (const [expr, mode, name, what] of plane) {
    await page.fill("#expression", expr)
    await page.press("#expression", "Enter")
    await page.getByRole("button", { name: mode, exact: true }).click()
    await wait(600)
    await ready(page)
    await save(name, what, page.locator(".stage"))
  }
  await page.fill("#expression", "(z^2-1)/(z^2+1)")
  await page.press("#expression", "Enter")
  await page.getByRole("button", { name: "Magnitud", exact: true }).click()
  await ready(page)
  await save("pantalla-plano-complejo", "Pantalla completa: editor, ejemplos y figura", null)

  await page.goto(BASE + "/visualizationzeta")
  await ready(page)
  await save("zeta-banda-critica", "|ζ(s)| en 0 ≤ Re s ≤ 1, −30 ≤ Im s ≤ 30", page.locator(".stage"))
  await save("pantalla-zeta", "Pantalla completa de la función zeta", null)

  await page.goto(BASE + "/visualizationMandelbrot")
  await ready(page)
  await save("mandelbrot-d2", "Conjunto de Mandelbrot clásico (d = 2), iteraciones en altura", page.locator(".stage"))
  await page.fill("#exponent", "3")
  await page.getByRole("button", { name: "Calcular" }).click()
  await wait(800)
  await ready(page)
  await save("mandelbrot-d3", "Conjunto de Multibrot con d = 3", page.locator(".stage"))

  const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  await mob.goto(BASE + "/")
  await ready(mob)
  await mob.screenshot({ path: path.join(out, "movil-plano-complejo.png") })
  manifest.push({ file: "movil-plano-complejo.png", what: "Móvil: la figura primero" })

  fs.writeFileSync(path.join(out, "recursos.json"), JSON.stringify({ origen: "Capturas reales de MathView (API local, Django) tras el rediseño", fecha: new Date().toISOString(), recursos: manifest }, null, 1))
  await browser.close()
})()
