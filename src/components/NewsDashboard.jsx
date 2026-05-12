import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MagneticImage = ({ src, alt }) => {
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);

    gsap.to(imageRef.current, {
      x: x * 15,
      y: y * 15,
      rotationX: -y * 10,
      rotationY: x * 10,
      scale: 1.05,
      duration: 0.6,
      ease: "power3.out"
    });
  };

  const handleMouseLeave = () => {
    if (!imageRef.current) return;
    gsap.to(imageRef.current, {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.8,
      ease: "power3.out"
    });
  };

  return (
    <figure 
      className="relative perspective-[800px] w-full max-w-[200px] md:max-w-[300px] aspect-[4/3] flex-shrink-0"
    >
      <div 
        ref={imageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 cursor-crosshair transform-gpu"
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover pointer-events-none" 
          onError={(e) => { e.target.src = 'https://picsum.photos/400/300'; }}
        />
      </div>
    </figure>
  );
};

export default function NewsDashboard({ onNewsFetched }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const cached = localStorage.getItem('news_cache');
      const cacheTime = localStorage.getItem('news_cache_time');
      const isCacheValid = cached && cacheTime && (Date.now() - parseInt(cacheTime) < 15 * 60 * 1000);

      if (isCacheValid) {
        const parsedArticles = JSON.parse(cached);
        setArticles(parsedArticles);
        if (onNewsFetched) onNewsFetched(parsedArticles);
        setLoading(false);
        return;
      }

      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      let url = 'https://saurav.tech/NewsAPI/top-headlines/category/general/us.json';
      let isNewsDataIO = false;
      
      if (apiKey && apiKey !== 'your_newsapi_key_here') {
        url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=en&country=us`;
        isNewsDataIO = true;
      }

      const res = await axios.get(url);
      let fetchedArticles = [];
      
      if (isNewsDataIO) {
        fetchedArticles = (res.data.results || []).map(article => ({
          title: article.title,
          urlToImage: article.image_url,
          source: { name: article.source_id || 'News' },
          publishedAt: article.pubDate,
          description: article.description,
          url: article.link
        })).slice(0, 5);
      } else {
        fetchedArticles = res.data.articles.slice(0, 5);
      }

      fetchedArticles = fetchedArticles.filter(a => a.title && a.title !== '[Removed]');

      setArticles(fetchedArticles);
      localStorage.setItem('news_cache', JSON.stringify(fetchedArticles));
      localStorage.setItem('news_cache_time', Date.now().toString());
      if (onNewsFetched) onNewsFetched(fetchedArticles);
      
    } catch (error) {
      console.error(error);
      const cached = localStorage.getItem('news_cache');
      if (cached) setArticles(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (articles.length === 0) return;

    ScrollTrigger.refresh();

    const textBlocks = document.querySelectorAll('.scroll-reveal-text');
    textBlocks.forEach((block) => {
      gsap.fromTo(block, 
        { color: '#334155' }, 
        {
          color: '#e8e4db', 
          scrollTrigger: {
            trigger: block,
            start: "top 85%",
            end: "bottom 50%",
            scrub: true,
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [articles]);

  const displayedArticles = articles.slice(0, 5);

  return (
    <div 
      className="w-full relative min-h-screen py-10 md:py-20 overflow-hidden rounded-3xl border border-slate-800/50"
      onMouseMove={handleMouseMove}
    >
      {/* 3D Animated Fluid Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[#030508] pointer-events-none">
        {/* Organic Flowing Mesh Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-[#06b6d4]/10 rounded-full blur-[120px] mix-blend-screen animate-[blob1_15s_infinite_alternate_ease-in-out]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-[#d4cfc1]/5 rounded-full blur-[120px] mix-blend-screen animate-[blob2_18s_infinite_alternate_ease-in-out]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-[#0f172a]/80 rounded-full blur-[120px] mix-blend-screen animate-[blob3_16s_infinite_alternate_ease-in-out]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] bg-[#06b6d4]/5 rounded-full blur-[120px] mix-blend-screen animate-[blob4_20s_infinite_alternate_ease-in-out]"></div>
        
        {/* Dynamic Cursor Tracking Glow (Soft ambient base aura) */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[100px] transition-transform duration-[400ms] ease-out will-change-transform z-0 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(212, 207, 193, 0.05) 40%, transparent 70%)',
            transform: `translate(${mousePos.x - 400}px, ${mousePos.y - 400}px)`
          }}
        />
      </div>

      {/* The Flashlight Grid / Skeleton Lines */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          // The crisp skeleton line grid pattern
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          // The flashlight mask tracking the cursor
          maskImage: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
        }}
      />

      <div className="relative z-10 text-center mb-32">
         <h2 className="text-3xl font-bold text-[#d4cfc1] font-mono tracking-[0.2em] uppercase">
           Global Transmissions
         </h2>
         <p className="text-slate-500 font-mono mt-4">Scroll to decrypt daily updates.</p>
      </div>

      <div className="flex flex-col gap-32 relative z-10 max-w-6xl mx-auto">
        {loading && articles.length === 0 ? (
          <div className="animate-pulse text-slate-700 font-mono text-3xl text-center">Decrypting network nodes...</div>
        ) : (
          displayedArticles.map((article, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-20 group`}
            >
              {/* Magnetic Small Image */}
              <MagneticImage 
                src={article.urlToImage || `https://picsum.photos/400/300?random=${idx}`} 
                alt={article.title} 
              />

              {/* Scrolling Text Reveal */}
              <div 
                className="flex flex-col cursor-pointer"
                onClick={() => window.open(article.url, '_blank')}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[10px] font-mono text-[#d4cfc1] tracking-[0.2em] uppercase border border-[#d4cfc1]/30 px-3 py-1 rounded-full">
                    {article.source.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600 tracking-widest">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="scroll-reveal-text text-3xl md:text-5xl lg:text-6xl font-bold font-mono transition-colors duration-1000 leading-[1.1] tracking-tight">
                  {article.title}
                </h3>
                
                <div className="mt-8 h-0 opacity-0 overflow-hidden group-hover:h-auto group-hover:opacity-100 transition-all duration-500 ease-out">
                  <p className="text-lg md:text-xl text-slate-400 font-mono max-w-2xl border-l-2 border-[#d4cfc1]/50 pl-6 leading-relaxed">
                    {article.description || 'No further decryption available.'}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[#d4cfc1] font-mono text-sm uppercase tracking-widest hover:text-white transition-colors">
                    Access Report <ExternalLink size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
