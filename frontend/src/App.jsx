import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

import { ThemeProvider } from './context/ThemeContext';
import MasterLoadingScreen from './components/MasterLoadingScreen';
import MasterCanvasBackground from './components/MasterCanvasBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutTimeline from './components/AboutTimeline';
import SkillsGrid from './components/SkillsGrid';
import ExperienceSection from './components/ExperienceSection';
import FeaturedProjects from './components/FeaturedProjects';
import EducationSection from './components/EducationSection';
import ContactTerminal from './components/ContactTerminal';
import Footer from './components/Footer';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect mobile — disable Lenis smooth scroll on touch devices
    // to avoid scroll hijacking and janky behavior
    const isMobile = 'ontouchstart' in window || window.innerWidth <= 768;

    if (isMobile) {
      // No smooth scroll library on mobile — native scrolling is best
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2
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

  return (
    <ThemeProvider>
      <div style={{ position: 'relative', width: '100%', minHeight: '100vh', color: 'var(--t-text-primary)', backgroundColor: 'var(--t-bg)', transition: 'background-color 0.4s ease, color 0.4s ease' }}>

        <AnimatePresence mode="wait">
          {isLoading && <MasterLoadingScreen onComplete={() => setIsLoading(false)} />}
        </AnimatePresence>

        <MasterCanvasBackground />

        {!isLoading && (
          <>
            <Navbar />
            <main style={{ position: 'relative', zIndex: 1 }}>
              <Hero />
              <AboutTimeline />
              <SkillsGrid />
              <ExperienceSection />
              <FeaturedProjects />
              <EducationSection />
              <ContactTerminal />
            </main>
            <Footer />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
