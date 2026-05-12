import { useEffect, useRef, useState } from 'react';
import UnicornScene from 'unicornstudio-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const fallbackData = [
  {
    title: "The Milky Way Over Snow-Capped Mountains",
    explanation: "A breathtaking view of our home galaxy, the Milky Way, stretching across the night sky above a serene, snow-capped mountain range. The bright center of the galaxy is visible, obscured by cosmic dust lanes.",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Distant Nebula",
    explanation: "Nebulae are vast clouds of dust and gas in space. Some are formed from the gas and dust thrown out by the explosion of a dying star, such as a supernova. Others are regions where new stars are beginning to form.",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop"
  },
  {
    title: "Martian Landscape",
    explanation: "A dusty, rocky expanse on the surface of Mars. The rust-red color comes from iron oxide in the soil. Missions to Mars have revealed a complex geological history, including dry riverbeds and polar ice caps.",
    url: "https://imgs.search.brave.com/ublAFN4tOXhmfwFkPtPTHvmiXMpmD45B9bQvQ5Xavzg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMTUv/NjU4LzEzMi9zbWFs/bC9jb2xvbnktb24t/bWFycy10d28tYXN0/cm9uYXV0cy13ZWFy/aW5nLXNwYWNlLXN1/aXQtd2Fsa2luZy1v/bi10aGUtc3VyZmFj/ZS1vZi1tYXJzLWZy/ZWUtcGhvdG8uanBn"
  },
  {
    title: "Aurora Borealis",
    explanation: "The Northern Lights, a natural light display in the Earth's sky, predominantly seen in high-latitude regions. Auroras are the result of disturbances in the magnetosphere caused by solar wind.",
    url: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?q=80&w=2064&auto=format&fit=crop"
  },
  {
    title: "Deep Space Galaxies",
    explanation: "A cluster of galaxies far out in the universe. Each galaxy contains billions of stars, planets, and vast amounts of dark matter. The gravitational pull between them can cause spectacular collisions.",
    url: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=2080&auto=format&fit=crop"
  },
  {
    title: "Stellar Nursery",
    explanation: "A region in space where star formation is occurring. Dense clouds of molecular hydrogen collapse under their own gravity, eventually igniting nuclear fusion to create new stars.",
    url: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function LandingPage({ onEnter }) {
  const containerRef = useRef(null);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [nasaData, setNasaData] = useState([]);

  useEffect(() => {
    // Hide the "Made with Unicorn" badge
    const hideBadge = setInterval(() => {
      const links = document.querySelectorAll('a[href*="unicorn.studio"]');
      links.forEach(link => {
        link.style.display = 'none';
        link.style.opacity = '0';
        link.style.pointerEvents = 'none';
      });
    }, 100);

    const apiKey = import.meta.env.VITE_NASA_API_KEY;
    
    // If no explicit API key is provided, bypass the heavily rate-limited DEMO_KEY
    // and immediately load the curated premium space gallery.
    if (!apiKey) {
      setNasaData(fallbackData);
    } else {
      // Fetch NASA data only if a real key exists
      fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=6`)
        .then(res => {
          if (!res.ok) throw new Error('API Rate Limit or Error');
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            const imagesOnly = data.filter(item => item.media_type === 'image');
            const finalData = [...imagesOnly, ...fallbackData].slice(0, 6);
            setNasaData(finalData);
          } else {
            setNasaData(fallbackData);
          }
        })
        .catch(err => {
          console.warn("NASA API Error, using fallback:", err);
          setNasaData(fallbackData);
        });
    }

    // Setup GSAP scroll animations
    const ctx = gsap.context(() => {
      // Scale/Zoom the 3D scene as we scroll down
      gsap.to('.unicorn-wrapper', {
        scale: 1.4, // Zoom in
        ease: 'none',
        scrollTrigger: {
          trigger: '.scroll-container',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        }
      });

      // Animate text sections as they enter viewport
      gsap.utils.toArray('.info-section').forEach((section) => {
        gsap.fromTo(section, 
          { opacity: 0, y: 150, scale: 0.95 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 1.5, 
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              end: 'top 40%',
              scrub: 1,
            }
          }
        );
      });
    }, containerRef);

    return () => {
      clearInterval(hideBadge);
      ctx.revert();
    };
  }, []);

  // Separate effect for the dynamically added gallery elements
  useEffect(() => {
    if (nasaData.length > 0) {
      const ctx = gsap.context(() => {
        gsap.utils.toArray('.gallery-figure').forEach((figure) => {
          ScrollTrigger.create({
            trigger: figure,
            start: 'top 85%',
            onEnter: () => figure.classList.add('-inview'),
          });
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [nasaData]);

  // Handle the transition out to dashboard
  const handleLaunch = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -50,
      duration: 1.2,
      ease: 'power4.inOut',
      onComplete: () => {
        if (onEnter) onEnter();
      }
    });
  };

  return (
    <div ref={containerRef} className="landing-root text-slate-100">
      <style>{`
        .landing-root {
          position: relative;
          background: #030508;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }

        /* Fixed background for the 3D scene */
        .fixed-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none; /* Let clicks pass through if needed, though Unicorn handles some hover */
          overflow: hidden;
        }

        /* Wrapper that we scale with GSAP */
        .unicorn-wrapper {
          width: 100%;
          height: 100%;
          transform-origin: center center;
        }

        /* Overlay gradients to blend the 3D scene with the dark background */
        .vignette-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 30%, #030508 100%);
          z-index: 1;
          pointer-events: none;
        }
        
        /* The scrollable content container */
        .scroll-container {
          position: relative;
          z-index: 10;
          width: 100%;
        }

        /* Spacer to push content down */
        .hero-spacer {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 4rem 10vw;
        }

        .hero-title {
          font-size: clamp(4rem, 10vw, 8rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.04em;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: clamp(1.2rem, 2vw, 1.5rem);
          color: #94a3b8;
          max-width: 600px;
          margin-bottom: 4rem;
          line-height: 1.6;
        }

        /* Section layout */
        .info-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 0 10vw;
        }

        .info-section.right {
          justify-content: flex-end;
          text-align: right;
        }

        .info-card {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 4rem;
          border-radius: 24px;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .card-label {
          font-family: 'Space Mono', monospace;
          color: #818cf8;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .card-value {
          font-size: 4.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 0.5rem;
          color: #f8fafc;
        }

        .card-desc {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 1.125rem;
        }

        /* Premium button */
        .launch-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-premium {
          background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
          color: #0f172a;
          border: none;
          padding: 1.5rem 4rem;
          font-size: 1.25rem;
          font-weight: 600;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 20px 40px -10px rgba(255,255,255,0.15);
        }

        .btn-premium:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.2), 0 30px 60px -15px rgba(255,255,255,0.25);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          opacity: 0.5;
          animation: bounce 2s infinite;
        }

        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, transparent, #fff);
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-10px) translateX(-50%); }
          60% { transform: translateY(-5px) translateX(-50%); }
        }

        /* NASA Gallery Section */
        .gallery-section {
          position: relative;
          z-index: 10;
          padding: 10vh 0;
          background: transparent;
        }

        .gallery-header {
          text-align: center;
          margin-bottom: 8rem;
          padding: 0 10vw;
        }

        .gallery-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 700;
          background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }

        .gallery-subtitle {
          color: #94a3b8;
          font-size: 1.25rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(14, 1fr);
          column-gap: 2rem;
          row-gap: 4rem;
          padding: 0 10vw;
          align-items: start;
        }

        .gallery-figure {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 0;
        }

        /* Staggered positioning mapping from 14-col grid */
        .gallery-figure:nth-child(1) { grid-column: 1 / 8; }
        .gallery-figure:nth-child(2) { grid-column: 9 / 15; margin-top: 8rem; }
        .gallery-figure:nth-child(3) { grid-column: 2 / 7; margin-top: 2rem; }
        .gallery-figure:nth-child(4) { grid-column: 8 / 14; margin-top: 6rem; }
        .gallery-figure:nth-child(5) { grid-column: 1 / 8; margin-top: 4rem; }
        .gallery-figure:nth-child(6) { grid-column: 9 / 15; margin-top: 10rem; }

        .img-container {
          overflow: hidden;
          border-radius: 16px;
          aspect-ratio: 4/3;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
          background: #0f172a;
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          scale: 2;
          opacity: 0;
          clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
          transition: scale 1.5s cubic-bezier(0.86, 0, 0.31, 1),
                      opacity 1.5s cubic-bezier(0.86, 0, 0.31, 1),
                      clip-path 1.5s cubic-bezier(0.86, 0, 0.31, 1);
        }

        .gallery-figure.-inview .gallery-img {
          scale: 1;
          opacity: 1;
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        }

        .gallery-caption {
          padding-left: 1rem;
          border-left: 2px solid rgba(255,255,255,0.1);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1s ease 0.5s, transform 1s ease 0.5s;
        }

        .gallery-figure.-inview .gallery-caption {
          opacity: 1;
          transform: translateY(0);
        }

        .gallery-caption h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 0.5rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .gallery-caption p {
          color: #94a3b8;
          line-height: 1.6;
          font-size: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .gallery-grid {
            grid-template-columns: 1fr;
            row-gap: 4rem;
          }
          .gallery-figure:nth-child(n) {
            grid-column: 1 / -1;
            margin-top: 0;
          }
        }
      `}</style>

      {/* Fixed Background with Unicorn Scene */}
      <div className="fixed-bg">
        <div className="vignette-overlay" />
        <div className="unicorn-wrapper">
          <UnicornScene
            projectId="T3Pnfz3UVPfj8KEPVZZ5"
            width="100%"
            height="100%"
            scale={1}
            dpi={1.5}
            sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.12/dist/unicornStudio.umd.js"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="scroll-container">
        
        {/* Hero Section */}
        <div className="hero-spacer">
          <h1 className="hero-title">Cosmo<br/>News.</h1>
          <p className="hero-subtitle">
            Experience real-time telemetry from the International Space Station. 
            Scroll to explore the orbital data.
          </p>
          <div className="scroll-indicator">
            <span style={{fontFamily: 'Space Mono', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase'}}>Scroll</span>
            <div className="scroll-line"></div>
          </div>
        </div>

        {/* Info Section 1 */}
        <div className="info-section">
          <div className="info-card">
            <div className="card-label">01 // Altitude</div>
            <div className="card-value">408<span style={{fontSize: '2rem', color: '#64748b'}}>km</span></div>
            <p className="card-desc">
              Orbiting in the thermosphere, the ISS maintains a delicate balance between Earth's gravity and its forward momentum.
            </p>
          </div>
        </div>

        {/* Info Section 2 */}
        <div className="info-section right">
          <div className="info-card">
            <div className="card-label">02 // Velocity</div>
            <div className="card-value">7.66<span style={{fontSize: '2rem', color: '#64748b'}}>km/s</span></div>
            <p className="card-desc">
              Traveling at incredible speeds, the station completes a full orbit around our planet every 92 minutes.
            </p>
          </div>
        </div>

        {/* Info Section 3 */}
        <div className="info-section">
          <div className="info-card">
            <div className="card-label">03 // Crew</div>
            <div className="card-value">07<span style={{fontSize: '2rem', color: '#64748b'}}>pax</span></div>
            <p className="card-desc">
              An international crew of astronauts conducting critical microgravity research that benefits all of humanity.
            </p>
          </div>
        </div>

        {/* NASA API Gallery Section */}
        <div className="gallery-section">
          <div className="gallery-header">
            <h2 className="gallery-title">Cosmic Wonders</h2>
            <p className="gallery-subtitle">
              Discovering the universe, one image at a time. Sourced directly from NASA's Astronomy Picture of the Day.
            </p>
          </div>
          
          <div className="gallery-grid">
            {nasaData.map((item, index) => (
              <figure className="gallery-figure" key={index}>
                <div className="img-container">
                  <img src={item.url} alt={item.title} className="gallery-img" loading="lazy" />
                </div>
                <figcaption className="gallery-caption">
                  <h3>{item.title}</h3>
                  <p>{item.explanation}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Final Launch Section */}
        <div className="launch-container" style={{justifyContent: 'center'}}>
          <button className="btn-premium" onClick={handleLaunch}>
            Enter Dashboard
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
