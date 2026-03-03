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
          <li><a href="#about" onClick={(e) => scrollToSection(e, '#about')}>Om Oss</a></li>
          <li><a href="#philosophy" onClick={(e) => scrollToSection(e, '#philosophy')}>Filosofi</a></li>
          <li><a href="#investments" onClick={(e) => scrollToSection(e, '#investments')}>Investeringar</a></li>
          <li><a href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>Kontakt</a></li>
        </ul>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" className="hero-logo" alt="Hyltén Invest Logo" />
          <p className="hero-subtitle">Strategiska Investeringar</p>
          <h2>Drivna av <span className="highlight">Gnosjöandan</span><br />& Arv</h2>
          <p className="hero-text">Hyltén Invest gör strategiska investeringar i tech-fonder och utvalda fastigheter. Med rötter i Johan Edvard Hylténs pionjäranda inom metalltillverkning fortsätter vi traditionen av innovation och tillväxt.</p>
          <a href="#about" className="cta-button" onClick={(e) => scrollToSection(e, '#about')}>Utforska Mer</a>
        </div>
      </section>

      <section id="about" className="section">
        <div className="about-grid">
          <div>
            <span className="section-subtitle">Om Företaget</span>
            <h2 className="section-title fade-in">En Legacy av<br />Entreprenörskap</h2>
            <div className="about-text fade-in">
              <p>Grundat 2019 i Jönköping, Hyltén Invest AB är ett investmentbolag som förvaltar och utvecklar kapital genom strategiska placeringar. Bolaget drivs av Jonas Benjamin Hyltén med en tydlig vision om långsiktigt värde.</p>
              <p>Vår verksamhet omfattar holdingverksamhet, handel med värdepapper och förvaltning av fast egendom, alltid med fokus på hållbar tillväxt och marknadsexpansion.</p>
            </div>
          </div>
          <div className="heritage-box fade-in">
            <h3>Gnosjöandan</h3>
            <p>"Den anda som främjar samarbete, entreprenörskap och innovativ problemlösning. En kultur av hårt arbete, ödmjukhet och övertygelsen att ingenting är omöjligt."</p>
          </div>
        </div>
      </section>

      <section id="philosophy" className="philosophy">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="section-subtitle">Vår Approach</span>
          <h2 className="section-title fade-in">Investeringsfilosofi</h2>
        </div>
        <div className="philosophy-grid">
          <div className="philosophy-item fade-in">
            <span className="philosophy-icon">◆</span>
            <h3>Strategiskt Kapital</h3>
            <p>Vi allokerar kapital för att driva marknadsexpansion och institutionell positionering med långsiktigt perspektiv.</p>
          </div>
          <div className="philosophy-item fade-in">
            <span className="philosophy-icon">◇</span>
            <h3>Tech & Innovation</h3>
            <p>Fokus på teknikfonder och innovativa tillväxtbolag som formar framtidens industri.</p>
          </div>
          <div className="philosophy-item fade-in">
            <span className="philosophy-icon">○</span>
            <h3>Fastigheter</h3>
            <p>Utvalda fastighetsinvesteringar med fokus på stabilitet och långsiktig värdeökning.</p>
          </div>
        </div>
      </section>

      <section id="investments" className="investments">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="section-subtitle">Portfölj</span>
          <h2 className="section-title fade-in">Fokusområden</h2>
        </div>
        <div className="investments-grid">
          <div className="investment-card fade-in">
            <span className="tag">Primärt Fokus</span>
            <h3>Tech Fonder</h3>
            <p>Strategiska investeringar i teknikfonder som driver digital transformation och innovation.</p>
          </div>
          <div className="investment-card fade-in">
            <span className="tag">Stabilitet</span>
            <h3>Fastigheter</h3>
            <p>Investeringar i utvalda fastigheter med fokus på långsiktig värdebevaring.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <span className="section-subtitle">Kontakt</span>
        <h2 className="section-title fade-in">Låt Oss Samarbeta</h2>
        <div className="contact-content fade-in">
          <p style={{ color: '#666', marginBottom: '2rem' }}>För investeringsmöjligheter och partnerskap, tveka inte att kontakta oss.</p>
          <div className="contact-info">
            <div className="contact-item">
              <strong>Adress</strong>
              Pollaregatan 21<br />553 24 Jönköping
            </div>
            <div className="contact-item">
              <strong>Org.nr</strong>
              559219-1927
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-logo">HYLTÉN <span>INVEST</span></div>
          <div className="footer-links">
            <a href="#about" onClick={(e) => scrollToSection(e, '#about')}>Om Oss</a>
            <a href="#philosophy" onClick={(e) => scrollToSection(e, '#philosophy')}>Filosofi</a>
            <a href="#investments" onClick={(e) => scrollToSection(e, '#investments')}>Investeringar</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>Kontakt</a>
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
  if (path.includes('/insikter')) {
    const slug = path.split('/insikter')[1].replace(/^\/|\/$/g, '');
    return (
      <BrowserRouter basename="/Hylten-Invest">
        <div className="min-h-screen bg-white">
          <nav id="navbar" className="scrolled sticky top-0">
            <a href="/Hylten-Invest/" className="logo-nav">
              <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" className="logo-icon" alt="Logo" />
              HYLTÉN <span>INVEST</span>
            </a>
          </nav>
          <main>
            {slug ? <InsikterArticle slug={slug} /> : <InsikterIndex />}
          </main>
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
