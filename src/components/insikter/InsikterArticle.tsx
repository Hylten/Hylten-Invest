import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Browser-safe frontmatter parser
function parseFrontmatter(raw: string) {
    const match = raw.match(/^\s*---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    if (!match) return { data: {} as Record<string, string>, content: raw };

    const frontmatter = match[1];
    const content = match[2];
    const data: Record<string, string> = {};

    // Standard YAML-style key parsing (handles multiline)
    const lines = frontmatter.split(/\n/);
    lines.forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
            const key = line.slice(0, colonIdx).trim();
            let value = line.slice(colonIdx + 1).trim();
            // Only set if not set yet, or if this looks like a cleaner line-based set
            if (key && !data[key]) {
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                data[key] = value;
            }
        }
    });

    // Fallback / Enhanced parsing for single-line or mashed keys
    // This regex matches keys that might contain hyphens/underscores and values that are quoted OR unquoted
    const pairs = frontmatter.match(/([\w-]+):\s*(?:"([^"]*)"|'([^']*)'|([^ \n,]+))/g);
    if (pairs) {
        pairs.forEach(pair => {
            const cIdx = pair.indexOf(':');
            const k = pair.slice(0, cIdx).trim();
            let v = pair.slice(cIdx + 1).trim();
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                v = v.slice(1, -1);
            }
            // If the line-based parser caught a "leaking" line (multiple keys on one line), 
            // the regex-based one here will provide much cleaner values.
            // So we prioritize regex matches for common keys.
            if (k) data[k] = v;
        });
    }
    
    return { data, content };
}

const BASE = '/Hylten-Invest';
const ACCENT = '#B08D57';

interface InsikterArticleProps {
    slug: string;
}

export const InsikterArticle: React.FC<InsikterArticleProps> = ({ slug }) => {
    const [content, setContent] = useState('');
    const [meta, setMeta] = useState<any>({});
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const postsGlob = import.meta.glob('../../../content/insights/*.md', { query: '?raw', eager: true });
                let foundPost = null;

                for (const [filepath, fileContent] of Object.entries(postsGlob)) {
                    const rawMarkdown = (fileContent as any).default;
                    const { data, content: markdownBody } = parseFrontmatter(rawMarkdown);
                    const fileSlug = data.slug || filepath.split('/').pop()?.replace('.md', '');

                    if (fileSlug === slug) {
                        foundPost = { meta: data, body: markdownBody };
                        break;
                    }
                }

                if (foundPost) {
                    setContent(foundPost.body);
                    setMeta(foundPost.meta);
                    if (foundPost.meta.title) {
                        document.title = `${foundPost.meta.title} | Hyltén Invest Intelligence`;
                    }
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error("Failed to load article:", e);
                setError(true);
            }
        };

        loadContent();
        window.scrollTo(0, 0);
    }, [slug]);

    if (error) {
        return (
            <div style={{
                paddingTop: '200px', paddingBottom: '100px', textAlign: 'center',
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', background: '#fff',
                fontFamily: "'Inter', sans-serif",
            }}>
                <h1 style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '28px', color: '#0a0a0a', marginBottom: '24px', fontWeight: 300,
                }}>Report Not Found</h1>
                <a href={`${BASE}/insights/`} style={{
                    color: ACCENT, textDecoration: 'none', fontSize: '10px',
                    letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600,
                }}>
                    Return to Archive
                </a>
            </div>
        );
    }

    if (!content && !error) {
        return (
            <div style={{
                minHeight: '100vh', background: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <p style={{
                    fontSize: '10px', letterSpacing: '5px', color: ACCENT,
                    textTransform: 'uppercase', fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                }}>Retrieving Intelligence...</p>
            </div>
        );
    }

    return (
        <section style={{
            paddingTop: '200px',
            paddingBottom: '120px',
            paddingLeft: '24px',
            paddingRight: '24px',
            maxWidth: '820px',
            margin: '0 auto',
            minHeight: '100vh',
            background: '#fff',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Back to Archive */}
            <a href={`${BASE}/insights/`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                color: '#9ca3af', fontSize: '10px', letterSpacing: '3px',
                textTransform: 'uppercase', fontWeight: 600,
                textDecoration: 'none', marginBottom: '80px',
            }}>
                ← Back to Archive
            </a>

            {/* Article Header */}
            <header style={{
                marginBottom: '80px',
                borderBottom: '1px solid #f3f4f6',
                paddingBottom: '60px',
            }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', marginBottom: '32px',
                    flexWrap: 'wrap', gap: '12px',
                }}>
                    <time style={{
                        fontSize: '10px', letterSpacing: '4px',
                        textTransform: 'uppercase', color: ACCENT, fontWeight: 600,
                    }}>
                        {meta.date ? new Date(meta.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Undated'}
                    </time>
                    <span style={{
                        fontSize: '10px', letterSpacing: '3px',
                        textTransform: 'uppercase', color: '#d1d5db',
                    }}>
                        {meta.author || 'Jonas Hyltén'}
                    </span>
                </div>

                <h1 style={{
                    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                    color: '#0a0a0a',
                    marginBottom: '32px',
                    lineHeight: 1.2,
                    fontWeight: 400,
                    letterSpacing: '-1px',
                }}>
                    {meta.title}
                </h1>

                {meta.description && (
                    <p style={{
                        fontSize: '17px',
                        color: '#6b7280',
                        lineHeight: 1.8,
                        fontWeight: 300,
                        fontStyle: 'italic',
                        maxWidth: '600px',
                    }}>
                        {meta.description}
                    </p>
                )}
            </header>

            {/* Article Body */}
            <div className="article-content" style={{
                color: '#374151', lineHeight: 2.2, fontSize: '1.15rem', fontWeight: 300,
            }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>

            <style>{`
                .article-content { line-height: 2.4; }
                .article-content p { margin-bottom: 4.5rem; }
                .article-content h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2.4rem; margin-top: 6rem; margin-bottom: 3rem; color: #0a0a0a; line-height: 1.3; font-weight: 400; }
                .article-content h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.7rem; margin-top: 4.5rem; margin-bottom: 2.5rem; color: #0a0a0a; font-weight: 400; }
                .article-content ul, .article-content ol { margin-bottom: 3.5rem; padding-left: 2rem; }
                .article-content li { margin-bottom: 1.5rem; }
                .article-content hr { border: 0; border-top: 1px solid #f3f4f6; margin: 6rem 0; }
                .article-content strong { color: #0a0a0a; font-weight: 600; }
                .article-content a { color: ${ACCENT}; text-decoration: underline; font-weight: 500; text-underline-offset: 4px; }
                .article-content blockquote { border-left: 3px solid ${ACCENT}; padding-left: 1.5rem; margin: 3rem 0; font-style: italic; color: #6b7280; }
            `}</style>

            {/* Footer */}
            <footer style={{
                marginTop: '100px', paddingTop: '48px',
                borderTop: '1px solid #f9fafb', textAlign: 'center',
            }}>
                <p style={{
                    fontSize: '9px', color: '#d1d5db', letterSpacing: '4px',
                    textTransform: 'uppercase', fontWeight: 500,
                }}>
                    © {new Date().getFullYear()} Hyltén Invest AB. Stewardship by Principle.
                </p>
            </footer>
        </section>
    );
};
