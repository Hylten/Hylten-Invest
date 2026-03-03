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
            <main className="max-w-[1200px] mx-auto px-6 md:px-12 pt-48 pb-32">
                <header className="mb-32 text-center">
                    <div className="inline-flex items-center gap-4 mb-8">
                        <div className="w-12 h-[1px] bg-[#B08D57]/30"></div>
                        <span className="text-[10px] tracking-[0.4em] text-[#B08D57] uppercase font-medium">Intelligence report</span>
                        <div className="w-12 h-[1px] bg-[#B08D57]/30"></div>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-black mb-10 tracking-tight leading-[1.1]">
                        Insights <span className="italic font-light text-gray-300">Archive</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl text-lg md:text-xl font-light leading-relaxed mx-auto">
                        Strategic analysis on global asset management, private equity trends, and the architectural evolution of the modern investment landscape.
                    </p>
                </header>

                <div className="space-y-32">
                    {articles.length > 0 ? articles.map(art => (
                        <article key={art.slug} className="group flex flex-col items-center text-center max-w-4xl mx-auto">
                            <time className="text-[11px] tracking-[0.3em] text-[#B08D57] uppercase font-bold mb-8">
                                {new Date(art.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>

                            <a href={`/Hylten-Invest/insights/${art.slug}/`} className="block group decoration-none">
                                <h2 className="text-3xl md:text-5xl font-serif text-black mb-8 leading-tight group-hover:text-[#B08D57] transition-colors duration-500">
                                    {art.title}
                                </h2>
                                <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-light mb-10 max-w-2xl mx-auto">
                                    {art.description}
                                </p>
                                <div className="inline-flex flex-col items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-[#B08D57] font-bold">
                                    <span className="group-hover:translate-y-1 transition-transform duration-500">Read Analysis</span>
                                    <div className="w-8 h-[1px] bg-[#B08D57] group-hover:w-24 transition-all duration-500"></div>
                                </div>
                            </a>
                        </article>
                    )) : (
                        <div className="text-center py-20 border-y border-gray-100">
                            <p className="text-gray-400 font-light tracking-widest uppercase text-xs">Awaiting new intelligence briefings...</p>
                        </div>
                    )}
                </div>

                <footer className="mt-48 text-center pt-20 border-t border-gray-100">
                    <a
                        href="/Hylten-Invest/"
                        className="inline-flex items-center gap-4 text-[10px] tracking-[0.4em] text-gray-400 hover:text-black uppercase transition-all duration-500"
                    >
                        <span>← Return Home</span>
                    </a>
                </footer>
            </main>
        </div>
    );
};
