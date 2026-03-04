import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

// Browser-safe frontmatter parser
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

const BASE = '/Hylten-Invest';

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
            author: data.author || 'Hyltén Invest',
        };
    });

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const InsikterIndex: React.FC = () => {
    const [posts, setPosts] = useState<Article[]>([]);

    useEffect(() => {
        const fetchedPosts = getPosts() as Article[];
        setPosts(fetchedPosts);

        document.title = 'Insights Archive | Hyltén Invest';
    }, []);

    return (
        <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen font-sans bg-white">
            <div className="mb-20 mt-20 md:mt-32">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-[1px] bg-[#B08D57]"></div>
                    <span className="text-[10px] tracking-[0.3em] text-[#B08D57] uppercase font-bold">Stewardship Intelligence</span>
                </div>

                <h1 className="font-serif text-5xl md:text-7xl text-black mb-8 tracking-tighter leading-tight font-normal">
                    Insights <span className="italic font-light text-gray-300">Archive</span>
                </h1>

                <p className="text-base md:text-xl text-gray-500 max-w-2xl leading-relaxed tracking-wide font-light">
                    Strategic analysis on global asset management, private equity trends, and the architectural evolution of generational stewardship.
                </p>
            </div>

            <div className="space-y-0">
                {posts.map((post) => (
                    <article
                        key={post.slug}
                        className="group border-b border-gray-100 hover:border-[#B08D57]/30 transition-colors duration-500"
                    >
                        <a href={`${BASE}/insights/${post.slug}`} className="block py-12">
                            <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-4">
                                <time className="text-[10px] tracking-widest text-[#B08D57] uppercase font-bold">
                                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </time>
                                <span className="text-[10px] tracking-widest text-gray-400 uppercase font-medium">
                                    {post.author}
                                </span>
                            </div>

                            <h2 className="font-serif text-2xl md:text-4xl text-black group-hover:text-[#B08D57] transition-colors duration-300 mb-6 leading-tight font-normal">
                                {post.title}
                            </h2>

                            <p className="text-base text-gray-600 leading-relaxed mb-8 line-clamp-3 font-light">
                                {post.description}
                            </p>

                            <div className="inline-flex items-center gap-3 text-[#B08D57] text-[10px] tracking-[0.2em] uppercase font-bold group-hover:translate-x-2 transition-transform duration-300">
                                Read Analysis
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </a>
                    </article>
                ))}

                {posts.length === 0 && (
                    <div className="flex flex-col items-center gap-8 py-24">
                        <div className="w-full text-center py-24 border border-gray-50 bg-gray-50/30 rounded-sm">
                            <p className="text-gray-400 text-sm tracking-widest uppercase">Awaiting new intelligence briefings...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
