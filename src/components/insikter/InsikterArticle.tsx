import React, { useEffect } from 'react';

export const InsikterArticle: React.FC<{ slug: string }> = ({ slug }) => {
    useEffect(() => {
        console.log(`Loading perspective: ${slug}`);
    }, [slug]);

    return (
        <section className="py-32 px-8 max-w-2xl mx-auto min-h-screen">
            <div className="mb-16">
                <a href="/Hylten-Invest/insights/" className="text-[10px] uppercase tracking-[0.4em] text-[#B08D57] hover:text-black transition-colors font-medium">
                    ← Archive
                </a>
            </div>
            <div id="article-content">
                {/* Hydrated via SEO pre-render */}
            </div>
        </section>
    );
};
