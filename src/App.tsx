import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { InsikterIndex } from './components/insikter/InsikterIndex';
import { InsikterArticle } from './components/insikter/InsikterArticle';

const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.querySelector(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="main-content" id="mainContent">
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="logo-nav">
          <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" className="logo-icon" alt="Logo" />
          HYLTÉN <span>INVEST</span>
        </a>
        <ul className="nav-links">
          <li><a href="#about" onClick={(e) => scrollToSection(e, '#about')}>About</a></li>
          <li><a href="#philosophy" onClick={(e) => scrollToSection(e, '#philosophy')}>Philosophy</a></li>
          <li><a href="#investments" onClick={(e) => scrollToSection(e, '#investments')}>Investments</a></li>
          <li><a href="https://wa.me/46701619978?text=Regarding%20Hylt%C3%A9n%20Invest:" target="_blank" rel="noopener noreferrer">Contact</a></li>
        </ul>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" className="hero-logo" alt="Hyltén Invest Logo" />
          <p className="hero-subtitle">Strategic Investments</p>
          <h2>Driven by <span className="highlight">The Spirit of Gnosjö</span></h2>
          <p className="hero-text">Hyltén Invest executes strategic investments in technology funds and select real estate assets. Rooted in the pioneering spirit of Johan Edvard Hyltén, we continue a legacy of innovation and growth.</p>
          <a href="#about" className="cta-button" onClick={(e) => scrollToSection(e, '#about')}>Explore</a>
        </div>
      </section>

      <section id="about" className="section">
        <div className="about-grid">
          <div>
            <span className="section-subtitle">The Company</span>
            <h2 className="section-title fade-in">A Legacy of<br />Entrepreneurship</h2>
            <div className="about-text fade-in">
              <p>Founded in 2019 in Jönköping, Hyltén Invest AB is a private investment firm dedicated to the disciplined management and development of capital. The firm is led by Jonas Benjamin Hyltén - a follower of Jesus Christ - whose commitment to Christian conservative values defines our mandate for long-term stewardship and structural value creation.</p>
            </div>
          </div>
          <div className="heritage-box fade-in">
            <h3>The Spirit of Gnosjö</h3>
            <p>"The spirit that fosters cooperation, entrepreneurship, and innovative problem-solving. A culture of hard work, humility, and the conviction that nothing is impossible."</p>
          </div>
        </div>
      </section>

      <section id="philosophy" className="philosophy">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="section-subtitle">Our Approach</span>
          <h2 className="section-title fade-in">Investment Philosophy</h2>
        </div>
        <div className="philosophy-grid">
          <div className="philosophy-item fade-in">
            <span className="philosophy-icon">◆</span>
            <h3>Strategic Capital</h3>
            <p>We allocate capital to drive market expansion and institutional positioning with a long-term horizon.</p>
          </div>
          <div className="philosophy-item fade-in">
            <span className="philosophy-icon">◇</span>
            <h3>Tech & Innovation</h3>
            <p>Focus on technology funds and innovative growth companies shaping the future of industry.</p>
          </div>
          <div className="philosophy-item fade-in">
            <span className="philosophy-icon">○</span>
            <h3>Real Estate</h3>
            <p>Selected real estate investments focused on stability and long-term capital appreciation.</p>
          </div>
        </div>
      </section>

      <section id="investments" className="investments">
        <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
          <span className="section-subtitle">Portfolio</span>
          <h2 className="section-title fade-in">Investment Focus</h2>
        </div>
        <div className="investments-grid" style={{ gridTemplateColumns: 'minmax(0, 600px)', justifyContent: 'center' }}>
          <div className="investment-card fade-in">
            <span className="tag">Primary Focus</span>
            <h3>Innovation</h3>
            <p>Strategic investments in technology, driving digital transformation and global innovation.</p>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a href="https://roialscapital.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--invest-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '3px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'opacity 0.3s' }} onMouseOver={e => (e.currentTarget.style.opacity = '0.7')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>Roials Capital →</a>
              <a href="https://hylten.github.io/Pathmakers/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--invest-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '3px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'opacity 0.3s' }} onMouseOver={e => (e.currentTarget.style.opacity = '0.7')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>Pathmaker →</a>
              <a href="https://hylten.github.io/Alpha/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--invest-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '3px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'opacity 0.3s' }} onMouseOver={e => (e.currentTarget.style.opacity = '0.7')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>Roials Alpha →</a>
            </div>
          </div>
        </div>
      </section>



      <footer>
        <div className="footer-content">
          <div className="footer-logo">HYLTÉN <span>INVEST</span></div>
          <div className="footer-links">
            <a href="#about" onClick={(e) => scrollToSection(e, '#about')}>About</a>
            <a href="#philosophy" onClick={(e) => scrollToSection(e, '#philosophy')}>Philosophy</a>
            <a href="#investments" onClick={(e) => scrollToSection(e, '#investments')}>Investments</a>
            <a href="https://wa.me/46701619978?text=Regarding%20Hylt%C3%A9n%20Invest:" target="_blank" rel="noopener noreferrer">Contact</a>
          </div>

          <div className="social-links">
            <a href="https://wa.me/46701619978?text=Regarding%20Hylt%C3%A9n%20Invest:" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/hylt%C3%A9n/" target="_blank" rel="noopener noreferrer" className="social-icon linkedin">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554V15.04c0-1.291-.026-2.953-1.799-2.953-1.8 0-2.077 1.406-2.077 2.862v5.499h-3.554V8.981h3.41v1.561h.049c.475-.899 1.636-1.847 3.366-1.847 3.6 0 4.267 2.37 4.267 5.455v6.297zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V8.981h3.564v11.471zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.774-.773 1.774-1.729V1.729C24 .774 23.204 0 22.225 0z" />
              </svg>
            </a>
          </div>

          <p className="copyright">&copy; {new Date().getFullYear()} Hyltén Invest AB.</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (!preloader) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3600);
    return () => clearTimeout(timer);
  }, []);

  const path = window.location.pathname;
  if (path.includes('/insights')) {
    const slug = path.split('/insights')[1].replace(/^\/|\/$/g, '');
    return (
      <BrowserRouter basename="/Hylten-Invest">
        <div className="min-h-screen bg-white">
          <nav id="navbar" className="scrolled sticky top-0">
            <a href="/Hylten-Invest/" className="logo-nav">
              <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" className="logo-icon" alt="Logo" />
              HYLTÉN <span>INVEST</span> <span style={{ marginLeft: '1rem', borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '1rem', fontSize: '0.7rem', color: '#666' }}>RETURN TO HOME</span>
            </a>
          </nav>
          <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {slug ? <InsikterArticle slug={slug} /> : <InsikterIndex />}

            {/* Centered Return Home Link */}
            {!slug && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px', paddingBottom: '120px', width: '100%' }}>
                <a
                  href="/Hylten-Invest/"
                  style={{
                    padding: '12px 28px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.1)',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    fontSize: '10px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    borderRadius: '2px'
                  }}
                >
                  Return Home
                </a>
              </div>
            )}
          </main>

          {/* WhatsApp Floating Button - Discreet Grayscale */}
          <a
            href="https://wa.me/46701619978?text=Regarding%20Hylt%C3%A9n%20Invest:"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'fixed',
              bottom: '32px',
              right: '32px',
              zIndex: 10001,
              background: '#1A1A1A',
              padding: '12px',
              borderRadius: '50%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              boxSizing: 'border-box',
              opacity: 0.6
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '0.6';
            }}
          >
            <svg style={{ width: '20px', height: '20px', display: 'block' }} fill="#FFFFFF" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <>
      {loading && (
        <div className="preloader" id="preloader">
          <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" className="logo-img" alt="Hyltén Invest" />
          <div className="loader-text">
            <h1 className="loader-h1">HYLTÉN <span>INVEST</span></h1>
            <div className="line"></div>
            <p className="loader-subtitle">Est. 2019 • Jönköping</p>
          </div>
        </div>
      )}
      <HomePage />
    </>
  );
};

export default App;
