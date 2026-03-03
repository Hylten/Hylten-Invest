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
        <div className="min-h-screen bg-white w-full overflow-x-hidden" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="insights-container px-6 md:px-12 pt-80 pb-32" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header className="mb-40 text-center">
                    <div className="inline-flex items-center justify-center gap-4 mb-8 w-full">
                        <div className="w-12 h-[1px] bg-[#B08D57]/30"></div>
                        <span className="text-[11px] tracking-[0.5em] text-[#B08D57] uppercase font-semibold">Intelligence report</span>
                        <div className="w-12 h-[1px] bg-[#B08D57]/30"></div>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif text-black mb-10 tracking-tight leading-[1.1] font-normal">
                        Insights <span className="italic font-light text-gray-300">Archive</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl text-lg md:text-xl font-light leading-relaxed mx-auto">
                        Strategic analysis on global asset management, private equity trends, and the architectural evolution of the modern investment landscape.
                    </p>
                </header>

                <div className="space-y-40">
                    {articles.length > 0 ? articles.map(art => (
                        <article key={art.slug} className="group flex flex-col items-center text-center max-w-4xl mx-auto">
                            <time className="text-[12px] tracking-[0.4em] text-[#B08D57] uppercase font-bold mb-8">
                                {new Date(art.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>

                            <a
                                href={`/Hylten-Invest/insights/${art.slug}/`}
                                className="block group no-underline"
                                style={{ color: 'inherit', textDecoration: 'none' }}
                            >
                                <h2 className="text-4xl md:text-6xl font-serif text-black mb-8 leading-tight group-hover:text-[#B08D57] transition-colors duration-500 font-normal">
                                    {art.title}
                                </h2>
                                <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-light mb-12 max-w-2xl mx-auto">
                                    {art.description}
                                </p>
                                <div className="inline-flex flex-col items-center gap-6 text-[11px] uppercase tracking-[0.5em] text-[#B08D57] font-bold">
                                    <span className="group-hover:translate-y-1 transition-transform duration-500">Read Analysis</span>
                                    <div className="w-10 h-[1px] bg-[#B08D57] group-hover:w-32 transition-all duration-500"></div>
                                </div>
                            </a>
                        </article>
                    )) : (
                        <div className="text-center py-20 border-y border-gray-100">
                            <p className="text-gray-400 font-light tracking-widest uppercase text-xs">Awaiting new intelligence briefings...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
