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
        <div className="min-h-screen bg-white w-full overflow-x-hidden">
            <div className="w-full flex flex-col items-center">
                <main className="w-full max-w-[1240px] px-6 md:px-12 pt-[450px] pb-32 flex flex-col items-center">
                    <header className="mb-48 text-center w-full flex flex-col items-center">
                        <div className="flex items-center justify-center gap-6 mb-12">
                            <div className="w-16 h-[1px] bg-[#B08D57]/30"></div>
                            <span className="text-[12px] tracking-[0.6em] text-[#B08D57] uppercase font-bold">Intelligence report</span>
                            <div className="w-16 h-[1px] bg-[#B08D57]/30"></div>
                        </div>

                        <h1 className="text-6xl md:text-9xl font-serif text-black mb-12 tracking-tighter leading-none font-normal text-center">
                            Insights <span className="italic font-light text-gray-200">Archive</span>
                        </h1>

                        <p className="text-gray-500 max-w-2xl text-xl md:text-2xl font-light leading-relaxed text-center mx-auto border-t border-gray-50 pt-12">
                            Strategic analysis on global asset management, private equity trends, and the architectural evolution of the modern investment landscape.
                        </p>
                    </header>

                    <div className="w-full space-y-64 mt-32">
                        {articles.length > 0 ? articles.map(art => (
                            <article key={art.slug} className="group flex flex-col items-center text-center max-w-4xl mx-auto">
                                <time className="text-[14px] tracking-[0.5em] text-[#B08D57] uppercase font-bold mb-10">
                                    {new Date(art.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </time>

                                <a
                                    href={`/Hylten-Invest/insights/${art.slug}/`}
                                    className="block group no-underline"
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                >
                                    <h2 className="text-5xl md:text-7xl font-serif text-black mb-10 leading-tight group-hover:text-[#B08D57] transition-colors duration-500 font-normal">
                                        {art.title}
                                    </h2>
                                    <p className="text-gray-600 text-xl md:text-2xl leading-relaxed font-light mb-16 max-w-2xl mx-auto">
                                        {art.description}
                                    </p>
                                    <div className="inline-flex flex-col items-center gap-8 text-[12px] uppercase tracking-[0.6em] text-[#B08D57] font-bold">
                                        <span className="group-hover:translate-y-2 transition-transform duration-500">Read Analysis</span>
                                        <div className="w-12 h-[1px] bg-[#B08D57] group-hover:w-48 transition-all duration-500"></div>
                                    </div>
                                </a>
                            </article>
                        )) : (
                            <div className="text-center py-24 border-y border-gray-50 w-full">
                                <p className="text-gray-400 font-light tracking-[0.4em] uppercase text-sm">Awaiting new intelligence briefings...</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
