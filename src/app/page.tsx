'use client';

import Spline from '@splinetool/react-spline';
import { useEffect, useState } from 'react';
import { MorphingTextPair } from '@/components/ui/morphing-text-pair';

export default function Home() {
  const [virtualScroll, setVirtualScroll] = useState(0);
  const [spline, setSpline] = useState<any>(null);
  const [zoomProgress, setZoomProgress] = useState(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Update virtual scroll for morphing text
      setVirtualScroll(prev => Math.max(0, prev + e.deltaY));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    // When virtualScroll > 1000 (halfway through text transition), start zooming
    if (virtualScroll > 1000) {
      const zoomStart = 1000;
      const zoomEnd = 3000;
      const progress = Math.min((virtualScroll - zoomStart) / (zoomEnd - zoomStart), 1);
      setZoomProgress(progress);
    } else {
      setZoomProgress(0);
    }
  }, [virtualScroll]);



  function onLoad(splineApp: any) {
    setSpline(splineApp);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden relative">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://cdn.jsdelivr.net/gh/Team-Hologram/trsm/media.mp4" type="video/mp4" />
      </video>

      {/* Navigation Bar */}
      <nav className="relative z-20 py-6">
        <div className="grid grid-cols-16 items-center">
          <div className="col-span-8 flex items-center gap-8 pl-8 font-secondary">
            <a href="#" className="text-white hover:opacity-80 transition-opacity">Who We Are</a>
            <a href="#" className="text-white hover:opacity-80 transition-opacity">What We Do</a>
            <a href="#" className="text-white hover:opacity-80 transition-opacity">Case Studies</a>
            <a href="#" className="text-white hover:opacity-80 transition-opacity">Articles</a>
            <a href="#" className="text-white hover:opacity-80 transition-opacity">Contact Us</a>
          </div>
          <div className="col-span-8 flex items-center justify-end gap-2 pr-8 font-secondary">
            <span className="text-white font-semibold">Studio</span>
            <div className="w-8 h-8 rounded-full bg-white"></div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 grid grid-cols-16 flex-1 overflow-visible">
        <div className="col-span-8 flex items-center justify-center px-8" style={{ zIndex: zoomProgress > 0.5 ? 5 : 15 }}>
          <div className="w-full max-w-4xl h-[300px]">
            <MorphingTextPair
              textPairs={[
                {
                  heading: "We Create.\nThe World Follows.",
                  subtext: "We are the unseen force behind iconic brands"
                },
                {
                  heading: "Who We Are",
                  subtext: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat."
                }
              ]}
              scrollRange={2000}
              controlledScroll={virtualScroll}
            />
          </div>
        </div>
        <div
          className="col-span-8 flex items-center justify-center relative overflow-visible"
          style={{
            zIndex: zoomProgress > 0.5 ? 30 : 10
          }}
        >
          <div
            className="transition-transform duration-300"
            style={{
              transform: `scale(${1 + zoomProgress * 5})`,
              transformOrigin: 'center center',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Spline
              scene="https://prod.spline.design/FfZsIQojKGRKHEoN/scene.splinecode"
              onLoad={onLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
