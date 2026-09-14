// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
//
// The live catalog comes from a public spreadsheet at runtime, so the sitemap is
// built from the local snapshot (public/data/products.csv) — the only catalog
// data available at build time. No network access, no server required.

import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve } from "path"

const BASE_URL = process.env.SITE_URL || "https://loja-comunitaria.lovable.app"

interface SitemapEntry {
  path: string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: string
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/produtos", changefreq: "weekly", priority: "0.9" },
  { path: "/sobre", changefreq: "monthly", priority: "0.5" },
  { path: "/contato", changefreq: "monthly", priority: "0.5" },
]

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') quoted = !quoted
    else if (char === "," && !quoted) {
      values.push(current)
      current = ""
    } else current += char
  }
  values.push(current)
  return values.map((v) => v.trim())
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function productEntries(): SitemapEntry[] {
  const csvPath = resolve("public/data/products.csv")
  if (!existsSync(csvPath)) return []

  const lines = readFileSync(csvPath, "utf8").split("\n").filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0])
  const idx = (name: string) => headers.indexOf(name)
  const slugIdx = idx("slug")
  const idIdx = idx("id")
  const nameIdx = idx("name")
  const activeIdx = idx("active")

  const seen = new Set<string>()
  const result: SitemapEntry[] = []

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line)
    if (activeIdx >= 0 && cols[activeIdx] && /^(false|0|nao|não|no)$/i.test(cols[activeIdx])) continue

    const slug = slugIdx >= 0 ? cols[slugIdx] : ""
    const id = idIdx >= 0 ? cols[idIdx] : ""
    const segment = slug ? slugify(slug) : slugify(cols[nameIdx] ?? "") || id
    if (!segment || seen.has(segment)) continue
    seen.add(segment)
    result.push({ path: `/produto/${segment}`, changefreq: "weekly", priority: "0.8" })
  }

  return result
}

function generateSitemap(all: SitemapEntry[]) {
  const urls = all.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  )

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n")
}

const all = [...entries, ...productEntries()]
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(all))
console.log(`sitemap.xml written (${all.length} entries)`)
