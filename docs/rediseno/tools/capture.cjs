// Captures MathView screens for the redesign comparison (before / after).
// Needs the API on 127.0.0.1:8010 and the app on 127.0.0.1:4310.
//   node docs/rediseno/tools/capture.cjs <outDir> [before|after]
// Uses the installed Chrome (no browser download); Playwright is resolved from
// the portfolio repo, which already has it, so MathView gains no dependency.
const path = require("path")
const fs = require("fs")
const PW = process.env.PLAYWRIGHT_PATH
const { chromium } = require(PW)

const BASE = "http://127.0.0.1:4310"
const out = path.resolve(process.argv[2])
const mode = process.argv[3] || "before"
fs.mkdirSync(out, { recursive: true })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function plotReady(page, timeout = 30000) {
  // a plot is ready when Plotly has drawn a gl canvas or an svg trace
  await page.waitForFunction(
    () => [...document.querySelectorAll(".js-plotly-plot")].some((p) => p.data && p.data[0] && (p.data[0].z || []).length > 0),
    null,
    { timeout },
  ).catch(() => {})
  await wait(1500)
}

;(async () => {
  const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
  const log = []
  for (const [vpName, viewport] of [["escritorio", { width: 1440, height: 900 }], ["movil", { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: vpName === "movil" ? 2 : 1 })
    page.on("console", (m) => m.type() === "error" && log.push(`${vpName} console: ${m.text().slice(0, 200)}`))
    page.on("pageerror", (e) => log.push(`${vpName} pageerror: ${e.message.slice(0, 200)}`))
    const shot = async (name) => page.screenshot({ path: path.join(out, `${vpName}-${name}.png`), fullPage: vpName === "movil" })

    await page.goto(BASE + "/")
    await plotReady(page)
    await shot("01-inicio")
    if (vpName === "escritorio") {
      // a function typed through the app's own input + its enter key
      const input = page.locator("input").first()
      await input.fill("(z^2-1)/(z^2+1)")
      const enter = page.getByRole("button", { name: /↵|Representar/ }).first()
      if (await enter.count()) await enter.click()
      else await input.press("Enter")
      await wait(2500)
      await plotReady(page)
      await shot("02-funcion-racional")
      for (const [label, name] of [[/fase/i, "03-fase"], [/2D/i, "04-2d"]]) {
        const b = page.getByRole("button", { name: label }).first()
        if (await b.count()) { await b.click(); await wait(2500); await shot(name) }
      }
      const help = page.getByRole("button", { name: /cómo funciona/i }).first()
      if (await help.count()) { await help.click(); await wait(600); await shot("05-ayuda"); await page.keyboard.press("Escape") }
    }
    for (const [route, name, t] of [["/visualizationzeta", "06-zeta", 60000], ["/visualizationMandelbrot", "07-mandelbrot", 60000], ["/login", "08-login", 5000]]) {
      if (mode === "before") {
        // the original only reaches these screens through its buttons (deep links 404)
        await page.goto(BASE + "/")
        const label = { "06-zeta": /Zeta/, "07-mandelbrot": /Mandelbrot/, "08-login": /Login/ }[name]
        await page.getByRole("button", { name: label }).first().click()
      } else {
        await page.goto(BASE + route) // deep link: must work after the redesign
      }
      await plotReady(page, t)
      await shot(name)
    }
    await page.close()
  }
  fs.writeFileSync(path.join(out, `consola-${mode}.txt`), log.join("\n") || "sin errores")
  console.log(log.length ? log.join("\n") : "sin errores de consola")
  await browser.close()
})()
