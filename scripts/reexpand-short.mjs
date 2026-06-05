#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const INSIGHTS_DIR = join(process.cwd(), 'content/insights');
const files = [
  'hylten-invest-institutional-liquidity-foundation.md',
  'stewardship-digital-legacies-family-crypto-liquidity-engineering.md',
  'theology-of-capital-wealth-as-sacred-trust.md',
];

let i = 0;
for (const file of files) {
  i++;
  const filepath = join(INSIGHTS_DIR, file);
  const content = readFileSync(filepath, 'utf-8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) { console.log(`SKIP ${file}: no frontmatter`); continue; }

  const frontmatter = fmMatch[1];
  const body = fmMatch[2];
  const wordCount = body.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 1500) { console.log(`SKIP ${file}: already ${wordCount} words`); continue; }

  const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)/);
  const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)/);
  const title = titleMatch ? titleMatch[1] : file;
  const description = descMatch ? descMatch[1] : '';

  console.log(`[${i}/${files.length}] ${file} (${wordCount} words)`);

  const prompt = `You are expanding a financial/institutional article to exactly 1500-2000 words for Hyltén Invest's insights section.

EXISTING ARTICLE (${wordCount} words):
Title: "${title}"
Description: "${description}"

Body:
${body.slice(0, 4000)}

RULES:
- Expand to 1500-2000 words total body text
- Keep the SAME title and frontmatter
- Maintain the institutional, sober, authoritative tone
- NO sales language ("we offer", "we provide", "we specialize")
- NO em dashes (—) — use spaced hyphens ( - ) instead
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
        'Authorization': 'Bearer Nu7ncscnkArCat2k56Qa9ge5GEYwb6dz',
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
      console.error(`  API error: ${response.status} - ${errText.slice(0, 200)}`);
      continue;
    }

    const data = await response.json();
    const expandedBody = data.choices[0].message.content.trim();
    const newWordCount = expandedBody.split(/\s+/).filter(w => w.length > 0).length;

    if (newWordCount < 1000) {
      console.error(`  Too short: ${newWordCount} words, skipping`);
      continue;
    }

    const cleaned = expandedBody
      .replace(/—/g, ' - ')
      .replace(/to approved mandates\.?\s*/gi, '')
      .replace(/: \$5M\+\.?\s*/g, '')
      .replace(/for \. to approved mandates\.?\s*/gi, '')
      .replace(/\n{4,}/g, '\n\n\n');

    const result = `---\n${frontmatter}\n---\n${cleaned}`;
    writeFileSync(filepath, result, 'utf-8');
    console.log(`  Expanded from ${wordCount} to ${newWordCount} words`);
    await new Promise(r => setTimeout(r, 1500));
  } catch (e) {
    console.error(`  Error: ${e.message}`);
  }
}

console.log('\nDONE');
