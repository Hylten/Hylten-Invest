#!/usr/bin/env node
/**
 * Hylten-Invest Insights Content Cleanup Script
 * 
 * Fixes:
 * 1. Removes truncated footer lines (": $5M+ target size...")
 * 2. Fixes headings that are actually mid-sentence (# used as emphasis)
 * 3. Normalizes paragraph spacing (ensures double newlines between paragraphs)
 * 4. Fixes broken markdown links [text]([text](url)) -> [text](url)
 * 5. Normalizes author in frontmatter
 * 6. Identifies duplicate articles (>85% similar)
 */
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join, basename } from 'path';

const INSIGHTS_DIR = join(process.cwd(), 'content/insights');
const DRY_RUN = process.argv.includes('--dry-run');
const REMOVE_DUPES = process.argv.includes('--remove-dupes');

// ═══════════════════════════════════════════════════════
// 1. FALSE HEADINGS — # used mid-sentence for emphasis
// ═══════════════════════════════════════════════════════
function fixFalseHeadings(content) {
  const lines = content.split('\n');
  const fixed = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const text = headingMatch[2].trim();
      const level = headingMatch[1].length;
      
      const isLowerStart = /^[a-z]/.test(text);
      const hasMultipleSentences = /[.!?]\s+[A-Z]/.test(text);
      const isLongSentence = text.length > 70 && text.endsWith('.');
      const startsWithSentenceWord = /^(The|A|An|It|When|This|That|He|She|We|They|Why|How|What)\b/i.test(text);
      const endsWithPeriod = text.endsWith('.');
      const isFullSentence = startsWithSentenceWord && endsWithPeriod;
      const containsBullets = text.includes('•') || text.includes('- ');
      
      const mergedMatch = text.match(/^([^.!?]+[.!?])\s+([A-Z].+)$/);
      if (mergedMatch && level === 1 && !isLowerStart) {
        const headingText = mergedMatch[1].trim();
        const paragraphText = mergedMatch[2].trim();
        fixed.push(`# ${headingText}`);
        fixed.push('');
        fixed.push(paragraphText);
        continue;
      }
      
      if (isLowerStart || containsBullets) {
        if (startsWithSentenceWord || text.length > 50) {
          fixed.push(`> **${text}**`);
        } else {
          fixed.push(text);
        }
        continue;
      }
      
      // If it starts with uppercase and looks like a real heading, keep it as heading
      // Only demote if it's clearly not a heading (lowercase start, contains bullets)
    }
    
    fixed.push(line);
  }
  
  return fixed.join('\n');
}

// ═══════════════════════════════════════════════════════
// 2b. FIX INLINE # HEADINGS — # used mid-sentence
// ═══════════════════════════════════════════════════════
function fixInlineHashHeadings(content) {
  let result = content;

  // Pattern B: ". # Heading" → ".\n\n## Heading"
  result = result.replace(/([.!?])\s*#\s+(?=[A-ZÅÄÖ])/g, '$1\n\n## ');

  // Pattern B variant: "#" at start of content (after frontmatter) → ##
  result = result.replace(/^#\s+(?=[A-ZÅÄÖ])/gm, '## ');

  return result;
}

function fixInlineBullets(content) {
  const lines = content.split('\n');
  const fixed = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('•')) {
      const parts = line.split('•').map(p => p.trim());
      const firstPart = parts[0];
      const bulletParts = parts.slice(1);
      
      const newLines = [];
      if (firstPart) {
        let cleanedFirst = firstPart.replace(/\*\*$/, '').trim();
        if (cleanedFirst) newLines.push(cleanedFirst);
      }
      
      for (const part of bulletParts) {
        if (part) {
          let cleanedPart = part.replace(/^\*\*|\*\*$/g, '').trim();
          newLines.push(`- ${cleanedPart}`);
        }
      }
      
      fixed.push(newLines.join('\n'));
    } else {
      fixed.push(line);
    }
  }
  return fixed.join('\n');
}

function fixInlineNumberedLists(content) {
  const lines = content.split('\n');
  const fixed = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Only split if MULTIPLE numbered items on same line (e.g. "1. Map... 2. Identify...")
    // Skip single numbered items, especially bold-formatted ones like **1. Title:**
    const numberedItems = line.match(/\d+\.\s+/g);
    if (numberedItems && numberedItems.length >= 2 && !line.startsWith('**')) {
      const parts = line.split(/(\d+\.\s+)/);
      const newLines = [];
      let currentNum = null;
      
      for (let j = 0; j < parts.length; j++) {
        const part = parts[j];
        if (/^\d+\.\s+$/.test(part)) {
          currentNum = part.trim();
        } else {
          if (part.trim()) {
            if (currentNum) {
              newLines.push(`${currentNum} ${part.trim()}`);
              currentNum = null;
            } else {
              newLines.push(part.trim());
            }
          }
        }
      }
      
      if (newLines.length > 1) {
        fixed.push(newLines.join('\n'));
        continue;
      }
    }
    
    fixed.push(line);
  }
  return fixed.join('\n');
}

// ═══════════════════════════════════════════════════════
// 3. NORMALIZE PARAGRAPH SPACING
// ═══════════════════════════════════════════════════════
function normalizeSpacing(content) {
  let result = content;

  // Pattern D: ensure blank line before numbered list items at line start
  result = result.replace(/([.!?])\s*\n(\d+\.\s+[A-ZÅÄÖ])/g, '$1\n\n$2');
  result = result.replace(/([^\n])\n(\d+\.\s+[A-ZÅÄÖ])/g, '$1\n\n$2');

  // Pattern D: inline numbered items mid-paragraph (". 1. Item" → ".\n\n1. Item")
  result = result.replace(/(?<=[.!?])\s+(\d+)\.\s+(?=[A-ZÅÄÖ][a-zåäö])/g, '\n\n$1. ');

  // Ensure blank line before bullet lists at line start
  result = result.replace(/([^\n])\n([-*]\s+[A-ZÅÄÖ])/g, '$1\n\n$2');

  // Ensure blank line after headings
  result = result.replace(/(#{1,3}\s[^\n]+)\n([^\n#])/g, '$1\n\n$2');

  // Ensure blank line before headings
  result = result.replace(/([^\n])\n(#{1,3}\s)/g, '$1\n\n$2');

  // Collapse excessive blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  // Trim trailing whitespace per line
  result = result.split('\n').map(l => l.trimEnd()).join('\n');
  result = result.trimEnd() + '\n';
  return result;
}

// ═══════════════════════════════════════════════════════
// 4. FIX BROKEN LINKS
// ═══════════════════════════════════════════════════════
function fixBrokenLinks(content) {
  return content.replace(
    /\[([^\]]+)\]\(\[([^\]]*)\]\(([^)]+)\)\)/g,
    '[$1]($3)'
  );
}

// ═══════════════════════════════════════════════════════
// 5. REMOVE JUNK FRAGMENTS (inline + footer)
// ═══════════════════════════════════════════════════════
const JUNK_PATTERNS_INLINE = [
  /\s*:\s*\$5M\+\s*target\s+size\.\s*for\s*\.\s*to\s+approved\s+mandates\.?\s*:?\s*\$5M\+\.?\s*/g,
  /\s*:\s*\$5M\+\s*target\s+size\.\s*for\s*\.\s*to\s+approved\s+mandates\.?\s*/g,
  /\s*:\s*\$5M\+\s*target\s+size\.?\s*/g,
  /\s*to\s+approved\s+mandates\.\s*for\s*\.\s*to\s+approved\s+mandates\.\s*:?\s*\$5M\+\.?\s*/g,
  /\s*for\s*\.\s*to\s+approved\s+mandates\.\s*:?\s*\$5M\+\.?\s*/g,
  /\s*for\s*\.\s*to\s+approved\s+mandates\.?\s*/g,
  /\s*to\s+approved\s+mandates\.?\s*/g,
  /\s*for\s+approved\s+mandates\.?\s*(?:Minimum\s*)?/g,
  /\s*:\s*\$5M\+\.?\s*/g,
];

function removeJunk(content) {
  let result = content;
  for (const pattern of JUNK_PATTERNS_INLINE) {
    result = result.replace(pattern, '');
  }

  // Clean up any resulting double punctuation, double spaces, or trailing artifacts
  result = result.replace(/,\s*:/g, ':');
  result = result.replace(/\.\s*\./g, '.');
  result = result.replace(/  +/g, ' ');
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/\.\s*\n{2,}\./g, '.\n.');
  result = result.trimEnd() + '\n';

  return result;
}

// ═══════════════════════════════════════════════════════
// 6. NORMALIZE FRONTMATTER
// ═══════════════════════════════════════════════════════
function normalizeFrontmatter(raw) {
  return raw.replace(
    /author:\s*["']?Hylten-Invest["']?/g,
    'author: "Jonas Hyltén"'
  ).replace(
    /author:\s*["']?Hyltén Invest["']?/g,
    'author: "Jonas Hyltén"'
  );
}

// ═══════════════════════════════════════════════════════
// 7. SIMILARITY CHECK FOR DUPLICATES
// ═══════════════════════════════════════════════════════
function simpleHash(text) {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  return freq;
}

function cosineSimilarity(a, b) {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  for (const key of allKeys) {
    const va = a[key] || 0;
    const vb = b[key] || 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════
const files = readdirSync(INSIGHTS_DIR).filter(f => f.endsWith('.md'));
console.log(`\n📄 Found ${files.length} markdown files in insights/\n`);

let stats = {
  junkRemoved: 0,
  headingsFixed: 0,
  linksFixed: 0,
  authorNormalized: 0,
  spacingFixed: 0,
  bulletsFixed: 0,
  numListsFixed: 0,
  duplicatesFound: [],
  totalModified: 0,
};

const articles = [];
for (const file of files) {
  const filepath = join(INSIGHTS_DIR, file);
  const original = readFileSync(filepath, 'utf-8');
  let content = original;
  let modified = false;
  
  const afterAuthor = normalizeFrontmatter(content);
  if (afterAuthor !== content) {
    stats.authorNormalized++;
    modified = true;
  }
  content = afterAuthor;
  
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    console.log(`  ⚠️  ${file}: No frontmatter found, skipping`);
    continue;
  }
  
  let frontmatter = fmMatch[1];
  let body = fmMatch[2];
  
  const afterJunk = removeJunk(body);
  if (afterJunk !== body) {
    stats.junkRemoved++;
    modified = true;
  }
  body = afterJunk;
  
  const afterLinks = fixBrokenLinks(body);
  if (afterLinks !== body) {
    stats.linksFixed++;
    modified = true;
  }
  body = afterLinks;
  
  const afterInlineHash = fixInlineHashHeadings(body);
  if (afterInlineHash !== body) {
    stats.headingsFixed++;
    modified = true;
  }
  body = afterInlineHash;

  const afterHeadings = fixFalseHeadings(body);
  if (afterHeadings !== body) {
    stats.headingsFixed++;
    modified = true;
  }
  body = afterHeadings;
  
  const afterBullets = fixInlineBullets(body);
  if (afterBullets !== body) {
    stats.bulletsFixed++;
    modified = true;
  }
  body = afterBullets;
  
  const afterNumLists = fixInlineNumberedLists(body);
  if (afterNumLists !== body) {
    stats.numListsFixed++;
    modified = true;
  }
  body = afterNumLists;
  
  const afterSpacing = normalizeSpacing(body);
  if (afterSpacing !== body) {
    stats.spacingFixed++;
    modified = true;
  }
  body = afterSpacing;
  
  const result = `---\n${frontmatter}\n---\n${body}`;
  
  if (modified) {
    stats.totalModified++;
    if (!DRY_RUN) {
      writeFileSync(filepath, result, 'utf-8');
    }
    console.log(`  ✅ ${file} — modified`);
  }
  
  const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)/);
  articles.push({
    file,
    title: titleMatch ? titleMatch[1] : file,
    hash: simpleHash(body),
    bodyLength: body.length,
  });
}

// Duplicate detection
console.log(`\n🔍 Checking for duplicates...\n`);
const duplicatePairs = [];
const toRemove = new Set();
for (let i = 0; i < articles.length; i++) {
  for (let j = i + 1; j < articles.length; j++) {
    const sim = cosineSimilarity(articles[i].hash, articles[j].hash);
    if (sim > 0.85) {
      duplicatePairs.push({
        a: articles[i].file,
        b: articles[j].file,
        similarity: (sim * 100).toFixed(1) + '%',
      });
      if (articles[i].bodyLength >= articles[j].bodyLength) {
        toRemove.add(articles[j].file);
      } else {
        toRemove.add(articles[i].file);
      }
    }
  }
}

if (duplicatePairs.length > 0) {
  console.log(`  Found ${duplicatePairs.length} duplicate pairs:`);
  for (const pair of duplicatePairs) {
    console.log(`    ${pair.similarity}: ${pair.a} ↔ ${pair.b}`);
  }
  console.log(`\n  Files recommended for removal (${toRemove.size}):`);
  for (const f of toRemove) {
    console.log(`    🗑️  ${f}`);
    if (REMOVE_DUPES && !DRY_RUN) {
      unlinkSync(join(INSIGHTS_DIR, f));
      console.log(`       REMOVED`);
    }
  }
} else {
  console.log(`  No duplicates found.`);
}

console.log(`\n${'═'.repeat(50)}`);
console.log(`📊 SUMMARY${DRY_RUN ? ' (DRY RUN)' : ''}`);
console.log(`${'═'.repeat(50)}`);
console.log(`  Files processed:      ${files.length}`);
console.log(`  Files modified:       ${stats.totalModified}`);
console.log(`  Junk footers removed:  ${stats.junkRemoved}`);
console.log(`  Headings fixed:       ${stats.headingsFixed}`);
console.log(`  Links fixed:          ${stats.linksFixed}`);
console.log(`  Authors normalized:   ${stats.authorNormalized}`);
console.log(`  Bullets fixed:        ${stats.bulletsFixed}`);
console.log(`  Numbered lists fixed: ${stats.numListsFixed}`);
console.log(`  Spacing normalized:   ${stats.spacingFixed}`);
console.log(`  Duplicate pairs:      ${duplicatePairs.length}`);
console.log(`  Files to remove:      ${toRemove.size}`);
console.log(`${'═'.repeat(50)}\n`);
