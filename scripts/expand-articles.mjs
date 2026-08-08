#!/usr/bin/env node
/**
 * Batch-expand short articles to 1500+ words using Mistral API.
 * Usage: node scripts/expand-articles.mjs [--dry-run] [--limit N]
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const INSIGHTS_DIR = join(process.cwd(), 'content/insights');
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_INDEX = process.argv.indexOf('--limit');
const LIMIT = LIMIT_INDEX > -1 ? parseInt(process.argv[LIMIT_INDEX + 1]) : Infinity;

const files = readdirSync(INSIGHTS_DIR).filter(f => f.endsWith('.md'));
const underTarget = [];

for (const file of files) {
  const filepath = join(INSIGHTS_DIR, file);
  const content = readFileSync(filepath, 'utf-8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) continue;

  const frontmatter = fmMatch[1];
  const body = fmMatch[2];
  const wordCount = body.split(/\s+/).filter(w => w.length > 0).length;

  const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)/);
  const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)/);

  underTarget.push({
    file, filepath, frontmatter, body, wordCount,
    title: titleMatch ? titleMatch[1] : file,
    description: descMatch ? descMatch[1] : '',
  });
}

underTarget.sort((a, b) => a.wordCount - b.wordCount);
const needExpansion = underTarget.filter(a => a.wordCount < 1500).slice(0, LIMIT);

console.log(`\n📊 ${underTarget.length} total articles, ${needExpansion.length} under 1500 words\n`);

let expanded = 0;
for (const article of needExpansion) {
  expanded++;
  console.log(`\n[${expanded}/${needExpansion.length}] ${article.file} (${article.wordCount} words)`);

  if (DRY_RUN) continue;

  // Call Mistral via HTTPS
  const prompt = `You are expanding a financial/institutional article to exactly 1500-2000 words for Hyltén Invest's insights section.

EXISTING ARTICLE (${article.wordCount} words):
Title: "${article.title}"
Description: "${article.description}"

Body:
${article.body.slice(0, 3000)}

RULES:
- Expand to 1500-2000 words total body text
- Keep the SAME title and frontmatter
- Maintain the institutional, sober, authoritative tone
- NO sales language ("we offer", "we provide", "we specialize")
- NO em dashes (—) — use spaced hyphens ( - )
- NO AI junk ("to approved mandates", "$5M+ target size")
- Use ## for subheadings
- Short punchy sentences mixed with dense technical paragraphs
- Add concrete examples and structural analysis
- Direct exit — NO conclusion/summary paragraph
- NO markdown code fences in response
- Respond ONLY with the expanded body text (no frontmatter)`;

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (process.env.MISTRAL_API_KEY || ''),
      },
      body: JSON.stringify({
        model: 'mistral-large-2411',
        messages: [
          { role: 'system', content: 'You are a senior institutional writer for Hylten Invest. Write with authority, precision, and conviction. Use the Gnosjö tradition: quiet, disciplined, covenantal.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4000,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`  ❌ API error: ${response.status} - ${errText.slice(0, 200)}`);
      continue;
    }

    const data = await response.json();
    const expandedBody = data.choices[0].message.content.trim();

    // Validate word count
    const newWordCount = expandedBody.split(/\s+/).filter(w => w.length > 0).length;
    if (newWordCount < 1000) {
      console.error(`  ❌ Too short: ${newWordCount} words, skipping`);
      continue;
    }

    // Clean up any artifacts
    const cleaned = expandedBody
      .replace(/—/g, ' - ')
      .replace(/to approved mandates\.?\s*/gi, '')
      .replace(/: \$5M\+\.?\s*/g, '')
      .replace(/for \. to approved mandates\.?\s*/gi, '')
      .replace(/\n{4,}/g, '\n\n\n');

    const result = `---\n${article.frontmatter}\n---\n${cleaned}`;
    writeFileSync(article.filepath, result, 'utf-8');
    console.log(`  ✅ Expanded to ${newWordCount} words`);

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1500));

  } catch (e) {
    console.error(`  ❌ Error: ${e.message}`);
  }
}

console.log(`\n${'═'.repeat(50)}`);
console.log(`📊 DONE`);
console.log(`  Files processed: ${expanded}/${needExpansion.length}`);
console.log(`${'═'.repeat(50)}\n`);
