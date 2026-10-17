// Functional check of the redesigned MathView against the local API.
// Needs the API on 127.0.0.1:8010 and the app on 127.0.0.1:4310.
//   PLAYWRIGHT_PATH=... node docs/rediseno/tools/verify.cjs
const { chromium } = require(process.env.PLAYWRIGHT_PATH)
const BASE = "http://127.0.0.1:4310"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "OK  " : "FALLA"} ${name}${detail ? " · " + detail : ""}`) }

// first z value of the visible plot (to tell one dataset from another)
const plotSignature = (page) => page.evaluate(() => {
  const p = [...document.querySelectorAll(".js-plotly-plot")].find((el) => el.offsetParent)
  const d = p?.data?.[0]
  if (!d || !d.z?.length) return null
  const row = d.z[Math.floor(d.z.length / 2)]
  return `${d.type}:${d.z.length}x${row.length}:${Number(row[Math.floor(row.length / 3)]).toFixed(4)}`
})
async function settle(page, prev, timeout = 30000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    const s = await plotSignature(page)
    const busy = await page.locator('[aria-busy="true"]').count()
    if (s && s !== prev && !busy) return s
    await wait(250)
  }
  return plotSignature(page)
}

;(async () => {
  const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))

  await page.goto(BASE + "/")
  const s0 = await settle(page, null)
  check("Carga inicial: superficie de f(z) = z", !!s0, s0 || "")

  // typing + Enter (new: the original only reacted to the ↵ key)
  await page.fill("#expression", "(z^2-1)/(z^2+1)")
  await page.press("#expression", "Enter")
  const s1 = await settle(page, s0)
  check("Escribir una función y pulsar Intro la representa", s1 && s1 !== s0, s1 || "")
  check("La cabecera muestra la función", (await page.locator("#viewer-title").innerText()).includes("(z^2-1)/(z^2+1)"))

  // the keypad's own enter key
  await page.fill("#expression", "")
  for (const k of ["1", "Dividir"]) await page.getByRole("button", { name: k, exact: true }).first().click()
  await page.getByRole("tab", { name: "Símbolos" }).click()
  await page.getByRole("button", { name: "z", exact: true }).click()
  await page.getByRole("tab", { name: "Números" }).click()
  await page.getByRole("button", { name: "Representar", exact: true }).click()
  const s2 = await settle(page, s1)
  check("El teclado escribe 1÷𝑧 y «Representar» la dibuja", s2 && s2 !== s1, `${await page.inputValue("#expression")} → ${s2}`)

  // examples
  await page.getByRole("button", { name: /Representar sen z/ }).click()
  const s3 = await settle(page, s2)
  check("Un ejemplo (sen z) llena el editor y representa", s3 && s3 !== s2 && (await page.inputValue("#expression")) === "sin(z)", s3 || "")

  // view modes
  for (const [label, type] of [["Fase", "surface"], ["2D", "heatmap"], ["Magnitud", "surface"]]) {
    await page.getByRole("button", { name: label, exact: true }).click()
    await wait(1200)
    const sig = await plotSignature(page)
    const pressed = await page.getByRole("button", { name: label, exact: true }).getAttribute("aria-pressed")
    check(`Modo ${label}: figura ${type} y botón marcado`, !!sig && sig.startsWith(type) && pressed === "true", sig || "")
  }

  // zeros and poles (wired to the existing analyzeFunction call)
  await page.fill("#expression", "(z^2-1)/(z^2+1)")
  await page.press("#expression", "Enter")
  await settle(page, await plotSignature(page))
  await page.getByRole("button", { name: "Ceros y polos" }).click()
  const dlg = page.getByRole("dialog")
  await dlg.waitFor({ timeout: 10000 })
  const txt = await dlg.innerText()
  check("Ceros y polos: ceros −1, 1 y polos ±I", /-1, 1/.test(txt) && /I, -I/.test(txt), txt.replace(/\s+/g, " ").slice(0, 120))
  await page.keyboard.press("Escape")
  check("Esc cierra el diálogo", (await page.getByRole("dialog").count()) === 0)

  // guide
  await page.getByRole("button", { name: "Guía" }).click()
  await wait(400)
  await page.getByRole("button", { name: /Sobre la representación/ }).click()
  await wait(400)
  check("La guía pasa a la página 2", (await page.getByRole("heading", { name: "Tipos de visualización" }).count()) === 1)
  await page.keyboard.press("Escape")

  // an expression the API rejects → visible error, not a silent console log
  const before = errors.length
  await page.fill("#expression", "pi*z")
  await page.press("#expression", "Enter")
  const err = await page.locator(".state.error").first().waitFor({ timeout: 40000 }).then(() => page.locator(".state.error").innerText()).catch(() => "")
  check("Una expresión que la API rechaza muestra un error legible", err.includes("No se ha podido representar"), err.replace(/\s+/g, " ").slice(0, 140))
  errors.splice(before) // that request is meant to fail (400 + the app's own console.error); nothing else is excused

  // deep links (the original returned 'Cannot GET')
  for (const [route, h] of [["/visualizationzeta", /zeta/i], ["/visualizationMandelbrot", /Mandelbrot/], ["/login", /Acceder/]]) {
    const r = await page.goto(BASE + route)
    const head = await page.locator("h1").first().innerText()
    check(`Enlace directo ${route}`, r.status() === 200 && h.test(head), `${r.status()} · ${head}`)
  }

  // zeta data
  await page.goto(BASE + "/visualizationzeta")
  const z = await settle(page, null, 60000)
  check("Zeta: superficie 100×100 calculada por la API", !!z && z.includes("100x100"), z || "")

  // Mandelbrot exponent now reaches the API (was always 2)
  await page.goto(BASE + "/visualizationMandelbrot")
  const m2 = await settle(page, null, 60000)
  await page.fill("#exponent", "3")
  await page.getByRole("button", { name: "Calcular" }).click()
  const m3 = await settle(page, m2, 60000)
  check("Mandelbrot: d = 3 da otro conjunto que d = 2", !!m2 && !!m3 && m2 !== m3, `${m2} → ${m3}`)
  check("Mandelbrot: la fórmula muestra z^3", (await page.locator(".facts").innerText()).includes("z^3"))

  // keyboard: skip link and nav reachable
  await page.goto(BASE + "/")
  await page.keyboard.press("Tab")
  check("El primer Tab llega a «Saltar al contenido»", (await page.evaluate(() => document.activeElement?.textContent?.trim())) === "Saltar al contenido")

  // mobile: no horizontal scroll, figure before the editor
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await mob.goto(BASE + "/")
  await settle(mob, null)
  const m = await mob.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth, stageTop: document.querySelector(".stage").getBoundingClientRect().top, editorTop: document.querySelector(".calculator").getBoundingClientRect().top }))
  check("Móvil: sin scroll horizontal", m.sw <= m.w, `${m.sw}/${m.w}`)
  check("Móvil: la figura aparece antes que el editor", m.stageTop < m.editorTop)

  check("Consola sin errores inesperados", errors.length === 0, errors.slice(0, 3).join(" | "))
  await browser.close()
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} comprobaciones correctas`)
  require("fs").writeFileSync(require("path").join(__dirname, "..", "verificacion.json"), JSON.stringify({ date: new Date().toISOString(), results }, null, 1))
  process.exit(failed ? 1 : 0)
})()
