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
          <li><a href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>Contact</a></li>
          <li><a href="/Hylten-Invest/insights/">Insights</a></li>
        </ul>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <img src="https://i.postimg.cc/qgs07YQt/hylten-logo.png" className="hero-logo" alt="Hyltén Invest Logo" />
          <p className="hero-subtitle">Strategic Investments</p>
          <h2>Driven by <span className="highlight">Gnosjöandan</span><br />& Heritage</h2>
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
              <p>Founded in 2019 in Jönköping, Hyltén Invest AB is an investment firm managing and developing capital through strategic placements. The firm is led by Jonas Benjamin Hyltén with a clear vision of long-term value creation.</p>
              <p>Our operations include holding activities, securities trading, and property management—always focused on sustainable growth and market expansion.</p>
            </div>
          </div>
          <div className="heritage-box fade-in">
            <h3>Gnosjöandan</h3>
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
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="section-subtitle">Portfolio</span>
          <h2 className="section-title fade-in">Investment Focus</h2>
        </div>
        <div className="investments-grid">
          <div className="investment-card fade-in">
            <span className="tag">Primary Focus</span>
            <h3>Tech Funds</h3>
            <p>Strategic investments in technology funds driving digital transformation and innovation.</p>
          </div>
          <div className="investment-card fade-in">
            <span className="tag">Stability</span>
            <h3>Real Estate</h3>
            <p>Investments in premium assets focused on long-term value preservation.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <span className="section-subtitle">Contact</span>
        <h2 className="section-title fade-in">Let&apos;s Collaborate</h2>
        <div className="contact-content fade-in">
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            For investment opportunities and partnerships, contact Hyltén Invest for a direct conversation.
          </p>
          <div className="contact-info">
            <div className="contact-item">
              <strong>Address</strong>
              Pollaregatan 21<br />553 24 Jönköping
            </div>
            <div className="contact-item">
              <strong>Org. No</strong>
              559219-1927
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
            <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>Contact</a>
            <a href="/Hylten-Invest/insights/">Insights</a>
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
