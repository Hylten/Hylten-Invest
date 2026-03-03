import React, { useEffect, useState } from 'react';

interface Article {
    slug: string;
    title: string;
    description: string;
    date: string;
}

export const InsikterIndex: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch('/Hylten-Invest/insights/articles.json');
                if (response.ok) {
                    const data = await response.json();
                    setArticles(data);
                }
            } catch (e) {
                console.log('Archive exploring...', e);
            }
        };
        fetchArticles();
        document.title = 'Insights | Hyltén Invest';
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <section className="pt-32 pb-24 px-8 max-w-5xl mx-auto">
                <div className="insights-hero">
                    <span className="section-subtitle">Intelligence & Perspective</span>
                    <h1 className="section-title">Insights Archive</h1>
                    <p className="text-gray-500 max-w-xl font-light leading-relaxed mb-12">
                        Strategic analysis on asset management, market trends, and the evolution of the investment landscape.
                    </p>
                </div>

                <div className="grid gap-12">
                    {articles.length > 0 ? articles.map(art => (
                        <article key={art.slug} className="insights-card">
                            <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                <time className="text-[10px] tracking-widest text-gray-400 uppercase">
                                    {new Date(art.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </time>
                            </div>
                            <a href={`/Hylten-Invest/insights/${art.slug}/`} className="group block">
                                <h2 className="text-3xl font-serif mb-6 group-hover:text-[#B08D57] transition-colors duration-300">
                                    {art.title}
                                </h2>
                                <p className="text-gray-600 leading-relaxed font-light text-base mb-8 line-clamp-2 max-w-3xl">
                                    {art.description}
                                </p>
                                <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[#B08D57] font-medium group-hover:translate-x-2 transition-transform duration-300">
                                    Access Report <span>→</span>
                                </div>
                            </a>
                        </article>
                    )) : null}
                </div>
            </section>
        </div>
    );
};
