import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { Orbit } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import ISSTracker from './components/ISSTracker';
import NewsDashboard from './components/NewsDashboard';
import Charts from './components/Charts';
import Chatbot from './components/Chatbot';
import ThemeToggle from './components/ThemeToggle';
import LandingPage from './components/LandingPage';
import Astronauts from './components/Astronauts';
import Preloader from './components/Preloader';

function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [speedData, setSpeedData] = useState([]);
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const [dashboardData, setDashboardData] = useState({
    iss: { lat: 0, lng: 0 },
    speed: 0,
    locationName: '',
    people: [],
    news: [],
  });

  const handleSpeedUpdate = (data) => {
    setSpeedData(prev => [...prev, data].slice(-30));
  };

  const updateDashboardContext = (issContextPart) => {
    setDashboardData(prev => ({ ...prev, ...issContextPart }));
  };

  if (showPreloader) {
    return <Preloader onComplete={() => setShowPreloader(false)} />;
  }

  if (showLanding) {
    return (
      <LandingPage 
        onEnter={() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          setShowLanding(false);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030508] transition-colors text-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-x-hidden">
      <Toaster position="top-right" />

      <header className="bg-white dark:bg-[#030508]/80 backdrop-blur-md border-b border-slate-200 dark:border-cyan-500/20 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
              {/* Orbital Icon spinning slowly */}
              <Orbit className="text-slate-600 dark:text-[#d4cfc1] w-5 h-5 animate-[spin_8s_linear_infinite]" />
              {/* Tiny radar ping in the center */}
              <div className="absolute w-1.5 h-1.5 bg-blue-500 dark:bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-[#e8e4db] font-mono tracking-[0.25em] uppercase leading-none">
                CosmoNews
              </h1>
              <span className="text-[9px] text-slate-500 dark:text-slate-500 font-mono tracking-widest uppercase mt-1 flex items-center gap-2">
                <span className="inline-block w-1 h-1 bg-green-500 rounded-full"></span>
                OS // v.2.0.4
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Full width Map Section taking up the entire screen minus header */}
      <div className="w-full h-[calc(100vh-64px)] relative z-0 flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
        <ISSTracker
          onSpeedUpdate={handleSpeedUpdate}
          onDashboardUpdate={updateDashboardContext}
        />
      </div>

      {/* Astronauts Section with Hover Effects */}
      <Astronauts people={dashboardData.people} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16 relative z-10 border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 gap-16">
          <NewsDashboard onNewsFetched={(news) => {
            setNewsData(news);
            setDashboardData(prev => ({ ...prev, news }));
          }} />

          <Charts speedData={speedData} newsData={newsData} />
        </div>
      </main>

      <Chatbot dashboardData={{ ...dashboardData, speed: speedData[speedData.length - 1]?.speed || 0 }} />
    </div>
  );
}

export default App;
