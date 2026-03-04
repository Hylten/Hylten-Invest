import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';

// Browser-safe frontmatter parser
function parseFrontmatter(raw: string) {
    const lines = raw.split(/\r?\n/);
    if (!lines[0] || lines[0].trim() !== '---') return { data: {} as Record<string, string>, content: raw };

    const data: Record<string, string> = {};
    let i = 1;
    while (i < lines.length && lines[i].trim() !== '---') {
        const line = lines[i];
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
            const key = line.slice(0, colonIdx).trim();
            let value = line.slice(colonIdx + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            data[key] = value;
        }
        i++;
    }

    const content = lines.slice(i + 1).join('\n');
    return { data, content };
}

const BASE = '/Hylten-Invest';

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
            <div className="pt-32 pb-24 px-8 text-center min-h-screen flex flex-col items-center justify-center bg-white">
                <h1 className="font-serif text-2xl text-black tracking-widest mb-4">Report Not Found</h1>
                <a href={`${BASE}/insights/`} className="text-[#B08D57] tracking-widest uppercase text-[10px] hover:text-black transition-colors font-bold">
                    Return to Archive
                </a>
            </div>
        );
    }

    if (!content && !error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[#B08D57] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] tracking-[0.3em] text-[#B08D57] uppercase font-bold">Retrieving Intelligence...</p>
                </div>
            </div>
        );
    }

    return (
        <article className="pt-32 pb-24 px-6 md:px-12 max-w-3xl mx-auto min-h-screen bg-white font-sans">
            <a
                href={`${BASE}/insights/`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-[#B08D57] text-[10px] tracking-[0.15em] font-bold uppercase mb-16 transition-colors duration-300"
            >
                <ArrowLeft className="w-3 h-3" />
                Back to Archive
            </a>

            <header className="mb-16 border-b border-gray-100 pb-16">
                <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-8">
                    <time className="text-[10px] tracking-widest text-[#B08D57] uppercase font-bold">
                        {meta.date ? new Date(meta.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Undated'}
                    </time>
                    <span className="hidden md:inline text-gray-200">•</span>
                    <span className="text-[10px] tracking-widest text-gray-400 uppercase font-medium">
                        {meta.author || 'Hyltén Invest'}
                    </span>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-black mb-8 leading-tight tracking-tight font-normal">
                    {meta.title}
                </h1>

                {meta.description && (
                    <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-light italic">
                        {meta.description}
                    </p>
                )}
            </header>

            <div className="article-content" style={{ color: '#374151', fontSize: '1.15rem', fontWeight: 300 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>

            <style>{`
                .article-content { line-height: 2.2; }
                .article-content p { margin-bottom: 3.5rem; }
                .article-content h2 { font-family: serif; font-size: 2.4rem; margin-top: 6rem; margin-bottom: 3rem; color: #000; line-height: 1.3; font-weight: 400; }
                .article-content h3 { font-family: serif; font-size: 1.7rem; margin-top: 4.5rem; margin-bottom: 2.5rem; color: #000; font-weight: 400; }
                .article-content ul, .article-content ol { margin-bottom: 3.5rem; padding-left: 2rem; }
                .article-content li { margin-bottom: 1.5rem; }
                .article-content hr { border: 0; border-top: 1px solid #f3f4f6; margin: 6rem 0; }
                .article-content strong { color: #000; font-weight: 600; }
                .article-content a { color: #B08D57; text-decoration: underline; font-weight: 500; }
            `}</style>

            <footer className="mt-24 pt-12 border-t border-gray-50 text-center">
                <p className="text-[9px] text-gray-300 tracking-[0.3em] uppercase font-medium">
                    &copy; {new Date().getFullYear()} Hyltén Invest AB. Stewardship by Principle.
                </p>
            </footer>
        </article>
    );
};
