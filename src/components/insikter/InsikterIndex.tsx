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
                const response = await fetch('/Hylten-Invest/insikter/articles.json');
                if (response.ok) {
                    const data = await response.json();
                    setArticles(data);
                }
            } catch (e) {
                console.log('Archive exploring...', e);
            }
        };
        fetchArticles();
    }, []);

    return (
        <section className="py-24 px-8 max-w-4xl mx-auto">
            <h1 className="text-5xl font-serif font-light mb-16 text-gray-900">Insikter & Analys</h1>
            <div className="space-y-16">
                {articles.length > 0 ? articles.map(art => (
                    <article key={art.slug} className="border-b border-gray-100 pb-12">
                        <a href={`/Hylten-Invest/insikter/${art.slug}/`} className="group">
                            <h2 className="text-2xl font-serif mb-4 group-hover:text-[#B08D57] transition-colors">{art.title}</h2>
                            <p className="text-gray-600 leading-relaxed font-light text-sm">{art.description}</p>
                            <span className="inline-block mt-6 text-[10px] uppercase tracking-[0.3em] text-[#B08D57] font-medium">Läs Mer →</span>
                        </a>
                    </article>
                )) : (
                    <div className="text-gray-400 italic font-light text-sm">Utforskar arkivet...</div>
                )}
            </div>
        </section>
    );
};
