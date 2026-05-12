import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const words = [
  "SPACE", "ASTRONAUT", "NASA", "SPACESHIP", 
  "ORBIT", "GALAXY", "NEBULA", "COSMOS", 
  "GRAVITY", "APOLLO", "VOYAGER", "TELEMETRY"
];

export default function Preloader({ onComplete }) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    
    const chars = wrapperRef.current.querySelectorAll('.char');
    
    const tl = gsap.timeline({
      onComplete: () => {
        // Final blast transition out
        gsap.to(wrapperRef.current, {
          opacity: 0,
          scale: 4,
          duration: 0.8,
          ease: "power3.in",
          onComplete: () => {
            setTimeout(onComplete, 50);
          }
        });
      }
    });

    // Character explosion and alignment
    tl.fromTo(chars, 
      { opacity: 0, x: 60, rotationZ: 90, scale: 0 },
      { 
        opacity: 1, 
        x: 0, 
        rotationZ: 0, 
        scale: 1,
        duration: 0.8, 
        stagger: 0.015, 
        ease: "back.out(2)" 
      }
    ).to({}, { duration: 1.0 }); // Rest period (total time ~ 3 seconds)

    // Spin the whole word cloud
    gsap.to(containerRef.current, {
      rotation: -180,
      duration: 3.5,
      ease: "power2.inOut"
    });

  }, [onComplete]);

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center overflow-hidden">
      
      {/* Container for the spinning words */}
      <div ref={containerRef} className="relative w-0 h-0">
        {words.map((word, i) => (
          <div 
            key={i} 
            className="absolute top-1/2 left-1/2 font-mono text-[#e8e4db] font-bold tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-lg whitespace-nowrap"
            style={{
              transformOrigin: '0% 50%',
              // The base translation pushes the words outwards from the center into a ring
              transform: `rotate(${i * (360 / words.length)}deg) translateX(120px) translateY(-50%)`,
            }}
          >
            {word.split('').map((char, charIdx) => (
              <span key={charIdx} className="char inline-block">{char}</span>
            ))}
          </div>
        ))}
      </div>
      
      {/* Central sci-fi radar/core elements */}
      <div className="absolute w-2 h-2 bg-[#d4cfc1] rounded-full shadow-[0_0_15px_rgba(212,207,193,0.5)] animate-[ping_1s_ease-out_infinite]"></div>
      <div className="absolute w-12 h-12 border border-[#d4cfc1]/20 rounded-full flex items-center justify-center">
         <div className="w-8 h-8 border border-[#d4cfc1]/40 rounded-full animate-pulse shadow-[0_0_20px_rgba(212,207,193,0.2)]"></div>
      </div>
    </div>
  );
}
