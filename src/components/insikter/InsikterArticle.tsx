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
        <section className="py-32 px-8 max-w-2xl mx-auto min-h-screen bg-white">
            <div className="mb-16 flex flex-wrap items-center gap-6">
                <a href="/Hylten-Invest/insights/" className="text-[10px] uppercase tracking-[0.4em] text-[#B08D57] hover:text-black transition-colors font-medium">
                    ← Archive
                </a>
                <span className="text-gray-200">|</span>
                <a href="/Hylten-Invest/" className="text-[10px] uppercase tracking-[0.4em] text-[#B08D57] hover:text-black transition-colors font-medium">
                    ← Home
                </a>
            </div>

            <header className="mb-12 border-b border-gray-100 pb-12">
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#B08D57] mb-4 font-medium">Intelligence Report</div>
                <h1 className="text-4xl md:text-5xl font-serif text-black mb-6 leading-tight">
                    {meta.title}
                </h1>
                <div className="text-[11px] text-gray-400 uppercase tracking-widest">
                    Published {meta.date ? new Date(meta.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} • Hyltén Invest Portfolio Strategy
                </div>
            </header>

            <div className="prose max-w-none text-gray-700 leading-relaxed font-light space-y-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </section>
    );
};
