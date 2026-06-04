import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function preprocessMarkdown(text: string): string {
  let t = text;

  // Pattern B: inline # headings mid-sentence — ". # Heading" → ".\n\n## Heading"
  t = t.replace(/(?<=[.!?])\s*#\s+(?=[A-ZÅÄÖ])/g, '\n\n## ');

  // Also catch inline # after a colon, dash, or opening parenthesis
  t = t.replace(/(?<=[:\-–(])\s*#\s+(?=[A-ZÅÄÖ])/g, '\n\n## ');

  // Convert # at line start to ## (all article headings should be h2 level)
  t = t.replace(/^#\s+(?=[A-ZÅÄÖ])/gm, '## ');

  // Pattern C: heading runs into body text on same line
  // "## Very long heading text. Body continues here." — split at sentence boundary
  t = t.replace(/^##\s+(.{80,200})$/gm, (match: string) => {
    const content = match.slice(3);
    const m = content.match(/^(.{20,}?[.!?])\s+(.{20,})$/);
    if (m) return `## ${m[1]}\n\n${m[2]}`;
    return match;
  });

  // Pattern D: numbered list items mid-paragraph (". 1. Item" → ".\n\n1. Item")
  // Only match when preceded by sentence-ending punctuation
  t = t.replace(/(?<=[.!?])\s+(\d+)\.\s+(?=[A-ZÅÄÖ][a-zåäö])/g, '\n\n$1. ');

  // Fix inline numbered list items mid-sentence with colon prefix
  t = t.replace(/(?<=:)\s+(\d+)\.\s+(?=[A-ZÅÄÖ][a-zåäö])/g, '\n\n$1. ');

  // Ensure blank line before list items that start a line
  t = t.replace(/([^!?.\n])(\n(?:[-*]|\d+\.)\s+[A-ZÅÄÖ])/g, '$1\n$2');

  return t;
}

// Browser-safe frontmatter parser
function parseFrontmatter(raw: string) {
    const parts = raw.split(/---/);
    if (parts.length < 3) return { data: {} as Record<string, string>, content: raw };
    
    // Frontmatter is between the first and second '---'
    const frontmatter = parts[1];
    const content = parts.slice(2).join('---').trim();
    const data: Record<string, string> = {};

    // Robust regex to extract metadata keys and values
    const regex = /([\w-]+):\s*(?:"([^"]*)"|'([^']*)'|([^ \n\r,]+))/g;
    let match;
    while ((match = regex.exec(frontmatter)) !== null) {
        const key = match[1];
        const value = match[2] || match[3] || match[4];
        if (key && !data[key]) {
            data[key] = value;
        }
    }
    
    return { data, content };
}

const BASE = '/Hylten-Invest';
const ACCENT = '#B08D57';

interface InsikterArticleProps {
    slug: string;
    dark?: boolean;
}

export const InsikterArticle: React.FC<InsikterArticleProps> = ({ slug, dark = false }) => {
    const [content, setContent] = useState('');
    const [meta, setMeta] = useState<any>({});
    const [error, setError] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [allPosts, setAllPosts] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const shareRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
                setShareOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const postsGlob = import.meta.glob('../../../content/insights/*.md', { query: '?raw', eager: true });
                const posts: any[] = [];
                let foundPost = null;
                let foundIndex = -1;

                for (const [filepath, fileContent] of Object.entries(postsGlob)) {
                    const rawMarkdown = (fileContent as any).default;
                    const { data, content: markdownBody } = parseFrontmatter(rawMarkdown);
                    const fileSlug = data.slug || filepath.split('/').pop()?.replace('.md', '');
                    posts.push({
                        slug: fileSlug,
                        title: data.title || 'Untitled',
                        date: data.date || '',
                        meta: data,
                        body: markdownBody
                    });
                }

                posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setAllPosts(posts);

                for (let i = 0; i < posts.length; i++) {
                    if (posts[i].slug === slug) {
                        foundPost = posts[i];
                        foundIndex = i;
                        break;
                    }
                }

                if (foundPost) {
                    setContent(foundPost.body);
                    setMeta(foundPost.meta);
                    setCurrentIndex(foundIndex);
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
                alignItems: 'center', justifyContent: 'center', background: dark ? '#121212' : '#fff',
                fontFamily: "'Inter', sans-serif",
            }}>
                <h1 style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '28px', color: dark ? '#fff' : '#0a0a0a', marginBottom: '24px', fontWeight: 300,
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
                minHeight: '100vh', background: dark ? '#121212' : '#fff', display: 'flex',
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
            background: dark ? '#121212' : '#fff',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* LinkedIn Company - Round, above WhatsApp */}
            <a
                href="https://www.linkedin.com/company/hyltén/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '32px',
                    zIndex: 10001,
                    background: '#1A1A1A',
                    padding: '12px',
                    borderRadius: '50%',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    boxSizing: 'border-box',
                    opacity: 0.6,
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.opacity = '1'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.6'; }}
            >
                <svg style={{ width: '20px', height: '20px', display: 'block' }} fill="#FFFFFF" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
            </a>

            {/* Share Button - Bottom of Article (Static) */}
            <div ref={shareRef} style={{ display: 'flex', justifyContent: 'center', marginTop: '80px', paddingBottom: '40px', position: 'relative' }}>
                <button
                    onClick={() => setShareOpen(!shareOpen)}
                    style={{
                        background: dark ? '#2a2a2a' : '#f3f4f6',
                        border: `1px solid ${dark ? '#3a3a3a' : '#e5e7eb'}`,
                        borderRadius: '24px',
                        padding: '8px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        opacity: shareOpen ? 1 : 0.4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseOut={e => { if (!shareOpen) e.currentTarget.style.opacity = '0.4'; }}
                >
                    <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: dark ? '#aaa' : '#6b7280', fontWeight: 600 }}>Share</span>
                    <svg style={{ width: '12px', height: '12px', color: dark ? '#aaa' : '#6b7280', transition: 'transform 0.3s', transform: shareOpen ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                </button>
                {shareOpen && (
                        <div style={{
                        position: 'absolute', bottom: '44px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '12px', background: dark ? '#1a1a1a' : '#fff', padding: '10px 16px',
                        borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: `1px solid ${dark ? '#333' : '#f3f4f6'}`,
                    }}>
                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <svg style={{ width: '16px', height: '16px', color: '#0077B5' }} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <svg style={{ width: '16px', height: '16px', color: '#1877F2' }} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(meta.title || '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <svg style={{ width: '14px', height: '14px', color: '#000' }} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                    </div>
                )}
            </div>
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
                borderBottom: `1px solid ${dark ? '#222' : '#f3f4f6'}`,
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
                        textTransform: 'uppercase', color: dark ? '#555' : '#d1d5db',
                    }}>
                        {meta.author || 'Jonas Hyltén'}
                    </span>
                </div>

                <h1 style={{
                    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                    color: dark ? '#fff' : '#0a0a0a',
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
                        color: dark ? '#777' : '#6b7280',
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
                color: dark ? '#aaa' : '#374151', lineHeight: 1.8, fontSize: '1.15rem', fontWeight: 300,
            }}>
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: ({node, ...props}) => <h2 {...props} />,
                        h2: ({node, ...props}) => <h3 {...props} />,
                        h3: ({node, ...props}) => <h4 {...props} />,
                    }}
                >
                    {preprocessMarkdown(content)}
                </ReactMarkdown>
            </div>

            <style>{`
                .article-content { line-height: 1.9; }
                .article-content p { margin-bottom: 2rem; }
                .article-content h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2.2rem; margin-top: 3.5rem; margin-bottom: 1.5rem; color: ${dark ? '#e0e0e0' : '#0a0a0a'}; line-height: 1.3; font-weight: 400; }
                .article-content h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2.0rem; margin-top: 3.5rem; margin-bottom: 1.5rem; color: ${dark ? '#e0e0e0' : '#0a0a0a'}; line-height: 1.3; font-weight: 400; }
                .article-content h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.6rem; margin-top: 3rem; margin-bottom: 1.25rem; color: ${dark ? '#d0d0d0' : '#0a0a0a'}; font-weight: 400; }
                .article-content h4 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.3rem; margin-top: 2.5rem; margin-bottom: 1rem; color: ${dark ? '#c0c0c0' : '#0a0a0a'}; font-weight: 400; }
                .article-content ul, .article-content ol { margin-bottom: 2rem; padding-left: 2rem; }
                .article-content li { margin-bottom: 0.75rem; }
                .article-content hr { border: 0; border-top: 1px solid ${dark ? '#2a2a2a' : '#f3f4f6'}; margin: 4rem 0; }
                .article-content strong { color: ${dark ? '#fff' : '#0a0a0a'}; font-weight: 600; }
                .article-content a { color: ${ACCENT}; text-decoration: underline; font-weight: 500; text-underline-offset: 4px; }
                .article-content blockquote { border-left: 3px solid ${ACCENT}; padding-left: 1.5rem; margin: 2rem 0; font-style: italic; color: ${dark ? '#777' : '#6b7280'}; }
            `}</style>

            {/* Navigation */}
            <div style={{
                marginTop: '100px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <a href={`${BASE}/insights/`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    color: '#9ca3af', fontSize: '10px', letterSpacing: '3px',
                    textTransform: 'uppercase', fontWeight: 600,
                    textDecoration: 'none', transition: 'color 0.3s',
                }}
                onMouseOver={e => e.currentTarget.style.color = ACCENT}
                onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}
                >
                    ← Back to Archive
                </a>
                <a href={`${BASE}/`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    color: '#9ca3af', fontSize: '10px', letterSpacing: '3px',
                    textTransform: 'uppercase', fontWeight: 600,
                    textDecoration: 'none', transition: 'color 0.3s',
                }}
                onMouseOver={e => e.currentTarget.style.color = ACCENT}
                onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}
                >
                    ← Home
                </a>
            </div>

            {/* Prev/Next Navigation */}
            {allPosts.length > 1 && currentIndex >= 0 && (
                <div style={{
                    marginTop: '80px',
                    paddingTop: '48px',
                    borderTop: `1px solid ${dark ? '#222' : '#f3f4f6'}`,
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '2rem',
                    }}>
                        <div>
                            {currentIndex < allPosts.length - 1 && (
                                <a
                                    href={`${BASE}/insights/${allPosts[currentIndex + 1].slug}`}
                                    style={{
                                        display: 'block',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '9px',
                                        letterSpacing: '0.2em',
                                        color: dark ? '#555' : '#9ca3af',
                                        textTransform: 'uppercase',
                                        display: 'block',
                                        marginBottom: '8px',
                                    }}>← Previous</span>
                                    <span style={{
                                        fontSize: '14px',
                                        color: dark ? '#888' : '#6b7280',
                                        lineHeight: 1.4,
                                    }}>{allPosts[currentIndex + 1].title}</span>
                                </a>
                            )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {currentIndex > 0 && (
                                <a
                                    href={`${BASE}/insights/${allPosts[currentIndex - 1].slug}`}
                                    style={{
                                        display: 'block',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '9px',
                                        letterSpacing: '0.2em',
                                        color: dark ? '#555' : '#9ca3af',
                                        textTransform: 'uppercase',
                                        display: 'block',
                                        marginBottom: '8px',
                                    }}>Next →</span>
                                    <span style={{
                                        fontSize: '14px',
                                        color: dark ? '#888' : '#6b7280',
                                        lineHeight: 1.4,
                                    }}>{allPosts[currentIndex - 1].title}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer style={{
                marginTop: '100px', paddingTop: '48px',
                borderTop: `1px solid ${dark ? '#222' : '#f9fafb'}`, textAlign: 'center',
            }}>
                <p style={{
                    fontSize: '9px', color: dark ? '#555' : '#d1d5db', letterSpacing: '4px',
                    textTransform: 'uppercase', fontWeight: 500,
                }}>
                    © {new Date().getFullYear()} Hyltén Invest AB. Stewardship by Principle.
                </p>
            </footer>
        </section>
    );
};
