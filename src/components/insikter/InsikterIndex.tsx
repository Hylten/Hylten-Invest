import React, { useState, useEffect } from 'react';

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

interface Article {
    slug: string;
    title: string;
    description: string;
    date: string;
    author: string;
}

const getPosts = () => {
    const postsGlob = import.meta.glob('../../../content/insights/*.md', { query: '?raw', eager: true });

    const posts = Object.entries(postsGlob).map(([filepath, content]) => {
        const rawMarkdown = (content as any).default;
        const { data } = parseFrontmatter(rawMarkdown);

        return {
            slug: data.slug || filepath.split('/').pop()?.replace('.md', '') || 'unknown',
            title: data.title || 'Untitled',
            description: data.description || '',
            date: data.date || '',
            author: data.author || 'Jonas Hyltén',
        };
    });

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const InsikterIndex: React.FC = () => {
    const [posts, setPosts] = useState<Article[]>([]);
    const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

    useEffect(() => {
        const fetchedPosts = getPosts() as Article[];
        setPosts(fetchedPosts);
        document.title = 'Insights Archive | Hyltén Invest';
    }, []);

    return (
        <section style={{
            paddingTop: '200px',
            paddingBottom: '120px',
            paddingLeft: '24px',
            paddingRight: '24px',
            maxWidth: '900px',
            margin: '0 auto',
            minHeight: '100vh',
            background: '#fff',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Header */}
            <div style={{ marginBottom: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ width: '40px', height: '1px', background: ACCENT, opacity: 0.5 }}></div>
                    <span style={{
                        fontSize: '10px',
                        letterSpacing: '6px',
                        textTransform: 'uppercase',
                        color: ACCENT,
                        fontWeight: 600,
                    }}>Perspectives</span>
                    <div style={{ flex: 1, height: '1px', background: '#f5f5f5' }}></div>
                </div>

                <h1 style={{
                    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(3rem, 8vw, 7rem)',
                    color: '#0a0a0a',
                    marginBottom: '32px',
                    letterSpacing: '-2px',
                    lineHeight: 1.0,
                    fontWeight: 300,
                }}>
                    Insights
                </h1>

                <p style={{
                    fontSize: '15px',
                    color: '#9ca3af',
                    maxWidth: '600px',
                    lineHeight: 1.8,
                    letterSpacing: '0.5px',
                    fontWeight: 300,
                }}>
                    Strategic analysis on global asset management, private equity trends, and the architectural evolution of generational stewardship.
                </p>
            </div>

            {/* Article List */}
            <div>
                {posts.map((post) => {
                    const isHovered = hoveredSlug === post.slug;
                    return (
                        <article
                            key={post.slug}
                            style={{
                                borderBottom: `1px solid ${isHovered ? 'rgba(176,141,87,0.3)' : '#f3f4f6'}`,
                                transition: 'border-color 0.5s ease',
                            }}
                            onMouseEnter={() => setHoveredSlug(post.slug)}
                            onMouseLeave={() => setHoveredSlug(null)}
                        >
                            <a
                                href={`${BASE}/insights/${post.slug}`}
                                style={{
                                    display: 'block',
                                    padding: '48px 0',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                {/* Date & Author Row */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    marginBottom: '16px',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                }}>
                                    <time style={{
                                        fontSize: '10px',
                                        letterSpacing: '4px',
                                        textTransform: 'uppercase',
                                        color: ACCENT,
                                        fontWeight: 600,
                                    }}>
                                        {new Date(post.date).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </time>
                                    <span style={{
                                        fontSize: '10px',
                                        letterSpacing: '3px',
                                        textTransform: 'uppercase',
                                        color: '#d1d5db',
                                    }}>
                                        {post.author}
                                    </span>
                                </div>

                                {/* Title */}
                                <h2 style={{
                                    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                                    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                                    color: isHovered ? ACCENT : '#0a0a0a',
                                    marginBottom: '16px',
                                    lineHeight: 1.3,
                                    fontWeight: 400,
                                    transition: 'color 0.4s ease',
                                    letterSpacing: '-0.5px',
                                }}>
                                    {post.title}
                                </h2>

                                {/* Description */}
                                <p style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    lineHeight: 1.8,
                                    marginBottom: '24px',
                                    fontWeight: 300,
                                    maxWidth: '700px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}>
                                    {post.description}
                                </p>

                                {/* Read More */}
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: ACCENT,
                                    fontSize: '10px',
                                    letterSpacing: '3px',
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
                                    transition: 'transform 0.3s ease',
                                }}>
                                    Read Analysis
                                    <span style={{ fontSize: '14px' }}>→</span>
                                </div>
                            </a>
                        </article>
                    );
                })}

                {posts.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '100px 0',
                        borderTop: '1px solid #f9fafb',
                        borderBottom: '1px solid #f9fafb',
                    }}>
                        <p style={{
                            color: '#d1d5db',
                            fontSize: '12px',
                            letterSpacing: '5px',
                            textTransform: 'uppercase',
                            fontStyle: 'italic',
                            fontWeight: 300,
                        }}>Awaiting new intelligence briefings...</p>
                    </div>
                )}
            </div>
        </section>
    );
};
