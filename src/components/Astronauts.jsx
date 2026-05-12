import { useState, useEffect, useRef } from 'react';

export default function Astronauts({ people }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const cursorWrapperRef = useRef(null);

  const astronautImages = {
    "Oleg Kononenko": "https://imgs.search.brave.com/SZxr1GiZvJ441K10DTILQZKtbt66UYJCa0NlfIa6IfA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi8xLzE2L09s/ZWdfS29ub25lbmtv/X09mZmljaWFsX1Bv/cnRyYWl0XyUyOGpz/YzIwMjNlMDUyNzkx/JTI5LmpwZy81MTJw/eC1PbGVnX0tvbm9u/ZW5rb19PZmZpY2lh/bF9Qb3J0cmFpdF8l/Mjhqc2MyMDIzZTA1/Mjc5MSUyOS5qcGc",
    "Nikolai Chub": "https://imgs.search.brave.com/HpGqpmSJH4VV4VPrMrIY0Csw07rcj8TjE5JzTrS3nmc/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy82/LzY1L1Jvc2Nvc21v/c19jb3Ntb25hdXRf/YW5kX0V4cGVkaXRp/b25fNzBfRmxpZ2h0/X0VuZ2luZWVyX05p/a29sYWlfQ2h1Yi5q/cGc",
    "Tracy Caldwell Dyson": "https://imgs.search.brave.com/8omf24PLwzCoqQGWJ07z4PAG1ZmjMq95Z8Ywyig18bc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bmFzYS5nb3Yvd3At/Y29udGVudC91cGxv/YWRzLzIwMTYvMDMv/YXN0cm9uYXV0LXRy/YWN5LWUuLWNhbGR3/ZWxsLW1pc3Npb24t/c3BlY2lhbGlzdC5q/cGVnP3c9NzY4",
    "Matthew Dominick": "https://imgs.search.brave.com/7Zxw01HSKzImItgQx2MuxLHt3Yq_ZpnaXywI7jCrc94/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy83/LzczL01hdHRoZXdf/RG9taW5pY2tfcG9y/dHJhaXQuanBn",
    "Michael Barratt": "https://imgs.search.brave.com/wVNuZ1zYrJwS1I4pYdt_R3PDC0xU_xDonop1MNVtO9M/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/bmFzYS5nb3Yvd3At/Y29udGVudC91cGxv/YWRzLzIwMTYvMDMv/OTM2ODYzNjA3MV8x/ZWYwNzc1MzFjX28u/anBnP3c9NzY4",
    "Jeanette Epps": "https://imgs.search.brave.com/IjMc08Q68Jt5xsu58U7Npxhxq6dALbtgxWjJsuvRPjQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi80LzQ3L0pz/YzIwMjNlMDQ3MDUw/X2FsdF8lMjhjcm9w/cGVkJTI5LmpwZy81/MTJweC1Kc2MyMDIz/ZTA0NzA1MF9hbHRf/JTI4Y3JvcHBlZCUy/OS5qcGc",
    "Alexander Grebenkin": "https://imgs.search.brave.com/X_B9_q8KXAtZCuEtBwQjdk6mzWG32JiQNB1bXG8fUjM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/bmFzYS5nb3Yvd3At/Y29udGVudC91cGxv/YWRzLzIwMjQvMDIv/cm9zY29zbW9zLWNv/c21vbmF1dC1hbmQt/c3BhY2V4LWNyZXct/OC1taXNzaW9uLXNw/ZWNpYWxpc3QtYWxl/eGFuZGVyLWdyZWJl/bmtpbi01MzUxMTY5/MjEzMy1vLmpwZz93/PTEwMjQ",
    "Butch Wilmore": "https://imgs.search.brave.com/EJLbqT2AHIU7LI5FvnheDfQkvGCXsUq6aJOi5NRLpAk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi81LzU5L0Jh/cnJ5X1dpbG1vcmUu/anBnLzUxMnB4LUJh/cnJ5X1dpbG1vcmUu/anBn",
    "Sunita Williams": "https://imgs.search.brave.com/cVSQBlq_y9nVWljkShmVXFhxnFRwP-JUSIZi0BM7rXQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTEy/NDk3MzA2L3Bob3Rv/L25ldy1kZWxoaS1p/bmRpYS1hbWVyaWNh/bi1hc3Ryb25hdXQt/b2YtaW5kaWFuLW9y/aWdpbi1zdW5pdGEt/d2lsbGlhbXMtZHVy/aW5nLWEtY29udmVy/c2F0aW9uLXdpdGgu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PWRDTnl0RE1hTlpZ/RHhXM1RDRXBqWDZV/S1k1RUNpVVNQMEpQ/bHRpRUk1eW89"
  };

  const defaultImages = [
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop", // View of Earth from ISS
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", // Space station glowing
    "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1974&auto=format&fit=crop", // Astronaut floating
    "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2008&auto=format&fit=crop", // ISS solar panels
    "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=2070&auto=format&fit=crop", // Deep space orbit
    "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2070&auto=format&fit=crop", // Rocket launch
    "https://images.unsplash.com/photo-1639015091765-b1a7ab42cc07?q=80&w=1974&auto=format&fit=crop"  // Sci-fi station aesthetic
  ];

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorWrapperRef.current) {
        // Offset by a few pixels so cursor doesn't block clicks
        cursorWrapperRef.current.style.transform = `translate3d(${e.clientX + 20}px, ${e.clientY + 20}px, 0)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleContainerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (!people || people.length === 0) return null;

  return (
    <div 
      className="relative py-32 px-4 md:px-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#030508] overflow-hidden"
      onMouseMove={handleContainerMove}
    >
      {/* 3D Animated Fluid Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[#030508] pointer-events-none hidden dark:block">
        {/* Organic Flowing Mesh Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-[#06b6d4]/10 rounded-full blur-[120px] mix-blend-screen animate-[blob1_15s_infinite_alternate_ease-in-out]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-[#d4cfc1]/5 rounded-full blur-[120px] mix-blend-screen animate-[blob2_18s_infinite_alternate_ease-in-out]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-[#0f172a]/80 rounded-full blur-[120px] mix-blend-screen animate-[blob3_16s_infinite_alternate_ease-in-out]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] bg-[#06b6d4]/5 rounded-full blur-[120px] mix-blend-screen animate-[blob4_20s_infinite_alternate_ease-in-out]"></div>
        
        {/* Dynamic Cursor Tracking Glow */}
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
        className="absolute inset-0 z-0 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          maskImage: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold font-mono text-[#d4cfc1] tracking-[0.2em] uppercase mb-4">
            Active Crew
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-mono">Hover over personnel names to view databanks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 relative z-10">
          {people.map((p, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-center justify-center py-12 px-4 cursor-crosshair group relative"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Background hover effect */}
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/40 rounded-2xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out pointer-events-none"></div>
              
              <span className="text-3xl md:text-5xl font-bold font-mono text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-cyan-50 transition-colors duration-300 z-10 text-center">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* The Floating Custom Cursor */}
      <div 
        ref={cursorWrapperRef}
        className="fixed top-0 left-0 pointer-events-none z-[100] will-change-transform"
      >
        <div 
          className={`relative w-48 h-64 md:w-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border border-slate-200 dark:border-cyan-500/30 ${
            hoveredIndex !== null ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'
          }`}
        >
          {people.map((p, idx) => (
            <img 
              key={idx}
              src={astronautImages[p.name] || defaultImages[idx % defaultImages.length]}
              alt={p.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
                hoveredIndex === idx ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          
          {/* Futuristic Overlay on the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
            {hoveredIndex !== null && (
              <div className="text-white dark:text-cyan-400 font-mono text-sm uppercase tracking-widest drop-shadow-md">
                ID: {people[hoveredIndex].name.replace(/\s+/g, '-')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
