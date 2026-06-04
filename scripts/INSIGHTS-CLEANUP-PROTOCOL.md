# Hyltén Invest — Insights Cleanup Protocol

## Purpose

AI-genererade artiklar i `content/insights/` har återkommande formateringsfel. Detta protokoll dokumenterar felen, hur de fixas, och hur de undviks framöver.

---

## Kända Problem & Fixar

### 1. AI-generated junk fragments

**Mönster:** `to approved mandates. : $5M+ target size. for . to approved mandates.`

**Orsak:** AI-modellen hallucinerar trunkerade footer-fragment.

**Source fix:** `node scripts/cleanup-insights.mjs`

**Render fix:** Ingen — tas bort från källan.

---

### 2. Inline `#` headings (Pattern B)

**Problemet i källan:**
```
trust. # Harmonization Across a Portfolio Institutional lenders...
```

**Vad som händer:** `#` mitt i mening — ReactMarkdown ser det inte som rubrik.

**Source fix:** `cleanup-insights.mjs` → `fixInlineHashHeadings()` konverterar `. # Text` → `.\n\n## Text`

**Render fix:** `InsikterArticle.tsx` → `preprocessMarkdown()` fångar även resterande inline `#`.

---

### 3. Heading + body på samma rad (Pattern C)

**Problemet i källan:**
```
## Eliminating Unnecessary Complexity Over time, covenants accumulate...
```

**Vad som händer:** Hela raden blir en `<h3>` — body text försvinner i rubriken.

**Source fix:** Kräver manuell inspektion (svår att regexa).

**Render fix:** `preprocessMarkdown()` splittar headings > 80 tecken vid meningsgräns.

---

### 4. Numrerade listor inline (Pattern D)

**Problemet i källan:**
```
proper sequence. 1. Foundational Purpose Clauses 2. Financial Discipline Metrics
```

**Vad som händer:** Listnumren syns som plain text — ingen `<ol>` genereras.

**Source fix:** `cleanup-insights.mjs` → `normalizeSpacing()` lägger `\n\n` före `\d. [A-Z]`.

**Render fix:** `preprocessMarkdown()` gör samma sak som safety net.

---

### 5. Bullet lists utan blank line

**Problemet i källan:**
```
We provide:
- Liquidity
- Stability
```
GFM kräver blank line före listan.

**Source fix:** `cleanup-insights.mjs` → `normalizeSpacing()` lägger blank line före `- ` och `* `.

---

### 6. `#` som h1 istället för h2

**Problemet:** Artiklarna använder `# Heading` (h1) men rubrikhierarkin kräver `##` (h2).

**Source fix:** `cleanup-insights.mjs` → `fixInlineHashHeadings()` konverterar `# ` → `## `.

**Render fix:** `InsikterArticle.tsx` → ReactMarkdown `components` mapper: `h1 → h2, h2 → h3, h3 → h4`.

---

## Arkitektur: 3-lagers skydd

```
┌──────────────────────────────────────────────┐
│ Layer 1: Source Files (content/insights/*.md) │
│   cleanup-insights.mjs                        │
│   → fixar permanent i källan                  │
├──────────────────────────────────────────────┤
│ Layer 2: preprocessMarkdown() (render time)   │
│   InsikterArticle.tsx:8-49                   │
│   → safety net för kvarvarande problem        │
├──────────────────────────────────────────────┤
│ Layer 3: ReactMarkdown + CSS                 │
│   remarkGfm, heading-mapping, spacing         │
│   → korrekt semantisk HTML                   │
└──────────────────────────────────────────────┘
```

---

## Köra Cleanup

```bash
# Dry run — se vad som ändras
node scripts/cleanup-insights.mjs --dry-run

# Kör för alla filer
node scripts/cleanup-insights.mjs

# Sök efter kvarvarande junk
grep -rn "approved mandates\|target size\|for \. to\|: \$5M+" content/insights/
```

---

## Teknisk Stack

| Komponent | Version | Funktion |
|-----------|---------|----------|
| `react-markdown` | ^10.1.0 | Markdown → React |
| `remark-gfm` | ^4.0.1 | GFM-tabeller, listor, strykning |
| `cleanup-insights.mjs` | — | Source-level cleanup |
| `preprocessMarkdown()` | — | Render-time preprocessor |

---

## Historik

| Commit | Ändring |
|--------|---------|
| `380c6ca` | fix: remove AI-generated junk fragments from 81 articles |
| `c671ee1` | fix: add markdown preprocessor for inline headings and numbered lists |
| `1e5e104` | style: clean up insight article formatting, fix ReactMarkdown heading mapping |

---

*Senast uppdaterad: 2026-06-04*
