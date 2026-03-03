import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function parseFrontmatter(raw: string) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return { data: {} as Record<string, string>, content: raw };
    const frontmatter = match[1];
    const content = match[2];
    const data: Record<string, string> = {};
    for (const line of frontmatter.split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        let value = line.slice(colonIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        data[key] = value;
    }
    return { data, content };
}

export const InsikterArticle: React.FC<{ slug: string }> = ({ slug }) => {
    const [content, setContent] = useState('');
    const [meta, setMeta] = useState<any>({});
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadContent = async () => {
            try {
                // Bundle-time resolution of MD files
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
                        document.title = `${foundPost.meta.title} | Hyltén Invest Analysis`;
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
            <div className="pt-32 pb-24 px-8 text-center min-h-screen flex flex-col items-center justify-center bg-white">
                <h1 className="font-serif text-2xl text-black tracking-widest mb-4">Report Not Found</h1>
                <a href="/Hylten-Invest/insights/" className="text-[#B08D57] tracking-widest uppercase text-[10px] hover:text-black transition-colors">
                    Return to Insights
                </a>
            </div>
        );
    }

    if (!content) {
        return <div className="min-h-screen bg-white"></div>;
    }

    return (
        <section style={{ paddingTop: '140px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '820px', margin: '0 auto', minHeight: '100vh', background: '#fff' }}>
            <div style={{ marginBottom: '64px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
                <a href="/Hylten-Invest/insights/" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px', color: '#B08D57', textDecoration: 'none', fontWeight: 500 }}>
                    ← Archive
                </a>
                <span style={{ color: '#eee' }}>|</span>
                <a href="/Hylten-Invest/" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px', color: '#B08D57', textDecoration: 'none', fontWeight: 500 }}>
                    ← Home
                </a>
            </div>

            <header style={{ marginBottom: '48px', borderBottom: '1px solid #f3f4f6', paddingBottom: '48px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#B08D57', marginBottom: '16px', fontWeight: 500, letterSpacing: '3px' }}>Intelligence Report</div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontFamily: 'serif', color: '#000', marginBottom: '24px', lineHeight: 1.2, fontWeight: 400 }}>
                    {meta.title}
                </h1>
                <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Published {meta.date ? new Date(meta.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} • Hyltén Invest Portfolio Strategy
                </div>
            </header>

            <div className="prose-content" style={{ color: '#374151', lineHeight: 1.8, fontSize: '1.1rem', fontWeight: 300 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
            <style>{`
                .prose-content p { margin-bottom: 2rem; }
                .prose-content h2 { font-size: 1.8rem; margin-top: 3rem; margin-bottom: 1.5rem; color: #000; font-family: serif; }
                .prose-content h3 { font-size: 1.4rem; margin-top: 2rem; margin-bottom: 1rem; color: #000; font-family: serif; }
                .prose-content ul, .prose-content ol { margin-bottom: 2rem; padding-left: 1.5rem; }
                .prose-content li { margin-bottom: 0.5rem; }
            `}</style>
        </section>
    );
};
