'use client';

import Spline from '@splinetool/react-spline';
import { useEffect, useState } from 'react';
import { MorphingTextPair } from '@/components/ui/morphing-text-pair';
import { motion } from 'framer-motion';
import { WindImage } from '@/components/ui/wind-image';

export default function Home() {
  const [virtualScroll, setVirtualScroll] = useState(0);
  const [spline, setSpline] = useState<any>(null);
  const [zoomProgress, setZoomProgress] = useState(0);
  const [showCardSection, setShowCardSection] = useState(false);
  const [cardStackProgress, setCardStackProgress] = useState(0);
  const [zoomOutProgress, setZoomOutProgress] = useState(0);
  const [showCaseStudies, setShowCaseStudies] = useState(false);
  const [caseStudyProgress, setCaseStudyProgress] = useState(0);
  const [showArticles, setShowArticles] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If articles section is active
      if (showArticles) {
        const articlesContainer = document.querySelector('[data-articles-container]') as HTMLElement;

        // Check if scrolling up at the top of the articles section
        if (articlesContainer && e.deltaY < 0 && articlesContainer.scrollTop === 0) {
          e.preventDefault();
          // Go back to previous section
          setVirtualScroll(8400); // Just before articles section
          return;
        }

        // Allow normal scrolling within articles
        return;
      }

      e.preventDefault();
      // Update virtual scroll - allow both forward and backward scrolling
      setVirtualScroll(prev => {
        const newScroll = prev + e.deltaY;
        return Math.max(0, Math.min(newScroll, 10000)); // Cap at 10000
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [showArticles]);

  useEffect(() => {
    // Zoom IN animation (1000 - 3000)
    if (virtualScroll > 1000 && virtualScroll <= 5000) {
      const zoomStart = 1000;
      const zoomEnd = 3000;
      const progress = Math.max(0, Math.min((virtualScroll - zoomStart) / (zoomEnd - zoomStart), 1));
      setZoomProgress(progress);
      setZoomOutProgress(0);
    } else if (virtualScroll > 5000 && virtualScroll <= 6500) {
      // Zoom OUT animation (5000 - 6500)
      const zoomOutStart = 5000;
      const zoomOutEnd = 6500;
      const progress = Math.max(0, Math.min((virtualScroll - zoomOutStart) / (zoomOutEnd - zoomOutStart), 1));
      setZoomOutProgress(progress);
      setZoomProgress(1 - progress); // Reverse the zoom
    } else if (virtualScroll <= 1000) {
      setZoomProgress(0);
      setZoomOutProgress(0);
    } else if (virtualScroll > 6500) {
      setZoomProgress(0);
      setZoomOutProgress(1);
    }

    // Show first card section (3000 - 5000)
    if (virtualScroll > 3000 && virtualScroll <= 5000) {
      setShowCardSection(true);
      setShowCaseStudies(false);

      // Calculate card stack animation progress (3000 - 5000)
      const cardStart = 3000;
      const cardEnd = 5000;
      const cardProgress = Math.max(0, Math.min((virtualScroll - cardStart) / (cardEnd - cardStart), 1));
      setCardStackProgress(cardProgress);
    } else if (virtualScroll > 6500 && virtualScroll <= 8500) {
      // Show case studies inside shell (6500 - 8500)
      setShowCardSection(false);
      setShowCaseStudies(true);
      setShowArticles(false);

      // Calculate which case study to show (3 case studies)
      const caseStart = 6500;
      const caseEnd = 8500;
      const totalProgress = (virtualScroll - caseStart) / (caseEnd - caseStart);
      const caseProgress = Math.max(0, Math.min(totalProgress * 3, 2.99)); // 0-2.99 for 3 case studies
      setCaseStudyProgress(caseProgress);
    } else if (virtualScroll > 8500) {
      // Show articles section (8500+)
      setShowCardSection(false);
      setShowCaseStudies(false);
      setShowArticles(true);
    } else {
      setShowCardSection(false);
      setShowCaseStudies(false);
      setShowArticles(false);
      setCardStackProgress(0);
      setCaseStudyProgress(0);
    }
  }, [virtualScroll]);



  function onLoad(splineApp: any) {
    setSpline(splineApp);
  }

  return (
    <>
      {/* Loading Screen */}
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: loading ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <img src="/logo.png" alt="Studio Logo" className="w-48 h-auto mb-8 mx-auto" />
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4 mx-auto">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-white text-2xl font-secondary">{Math.floor(loadingProgress)}%</p>
          </div>
        </motion.div>
      )}

      <div className="min-h-screen bg-white flex flex-col overflow-hidden relative">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/bgVideo.mp4" type="video/mp4" />
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
        <div
          className="relative z-10 grid grid-cols-16 flex-1 overflow-visible"
        >
          <div
            className="col-span-8 flex items-center justify-center px-8 transition-opacity duration-500"
            style={{
              zIndex: zoomProgress > 0.5 ? 5 : 15,
              opacity: showCardSection || showCaseStudies ? 0 : 1,
              pointerEvents: showCardSection || showCaseStudies ? 'none' : 'auto'
            }}
          >
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
              zIndex: showCardSection || showCaseStudies ? 5 : (zoomProgress > 0.5 ? 30 : 10)
            }}
          >
            <div
              className="transition-transform duration-500"
              style={{
                transform: `scale(${showCardSection ? 6 :
                  showCaseStudies ? 1 :
                    1 + zoomProgress * 5
                  })`,
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

        {/* Case Studies Section */}
        <div
          className="absolute inset-0 z-40 transition-opacity duration-500"
          style={{
            opacity: showCaseStudies ? 1 : 0,
            pointerEvents: showCaseStudies ? 'auto' : 'none'
          }}
        >
          <div className="grid grid-cols-16 h-screen">
            {/* Left Side - Case Study Cards */}
            <div className="col-span-8 flex items-center justify-center p-8">
              <div className="relative w-full max-w-2xl h-[450px]">
                {/* Case Study 1 */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8"
                  animate={{
                    y: Math.floor(caseStudyProgress) > 0 ? -500 : 0,
                    opacity: Math.floor(caseStudyProgress) > 0 ? 0 : 1,
                    scale: Math.floor(caseStudyProgress) > 0 ? 0.8 : 1,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    zIndex: Math.floor(caseStudyProgress) > 0 ? 5 : 30,
                  }}
                >
                  <div className="text-sm text-gray-500 mb-2 font-secondary">01 / Case Study</div>
                  <h3 className="text-4xl font-bold mb-4 font-primary">Brand Transformation</h3>
                  <p className="text-lg text-gray-600 font-secondary mb-6">We helped a Fortune 500 company rebrand their entire digital presence, resulting in 300% increase in engagement.</p>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm">Branding</span>
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm">Digital</span>
                  </div>
                </motion.div>

                {/* Case Study 2 */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8"
                  animate={{
                    y: Math.floor(caseStudyProgress) < 1 ? 16 : (Math.floor(caseStudyProgress) > 1 ? -500 : 0),
                    x: Math.floor(caseStudyProgress) < 1 ? 16 : 0,
                    scale: Math.floor(caseStudyProgress) < 1 ? 0.97 : (Math.floor(caseStudyProgress) > 1 ? 0.8 : 1),
                    opacity: Math.floor(caseStudyProgress) > 1 ? 0 : 1,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    zIndex: Math.floor(caseStudyProgress) < 1 ? 20 : (Math.floor(caseStudyProgress) > 1 ? 5 : 30),
                  }}
                >
                  <div className="text-sm text-gray-500 mb-2 font-secondary">02 / Case Study</div>
                  <h3 className="text-4xl font-bold mb-4 font-primary">E-commerce Revolution</h3>
                  <p className="text-lg text-gray-600 font-secondary mb-6">Redesigned the shopping experience for a major retailer, boosting conversion rates by 150%.</p>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm">UX/UI</span>
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm">E-commerce</span>
                  </div>
                </motion.div>

                {/* Case Study 3 */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8"
                  animate={{
                    y: Math.floor(caseStudyProgress) < 1 ? 32 : (Math.floor(caseStudyProgress) < 2 ? 16 : 0),
                    x: Math.floor(caseStudyProgress) < 1 ? 32 : (Math.floor(caseStudyProgress) < 2 ? 16 : 0),
                    scale: Math.floor(caseStudyProgress) < 1 ? 0.95 : (Math.floor(caseStudyProgress) < 2 ? 0.97 : 1),
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    zIndex: Math.floor(caseStudyProgress) < 2 ? 10 : 30,
                  }}
                >
                  <div className="text-sm text-gray-500 mb-2 font-secondary">03 / Case Study</div>
                  <h3 className="text-4xl font-bold mb-4 font-primary">Mobile App Innovation</h3>
                  <p className="text-lg text-gray-600 font-secondary mb-6">Created an award-winning mobile experience that reached 1M downloads in the first month.</p>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm">Mobile</span>
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm">App Design</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Side - Shell visible in background */}
            <div className="col-span-8"></div>
          </div>
        </div>

        {/* Card Stack Section */}
        <div
          className="absolute inset-0 z-40 transition-opacity duration-500"
          style={{
            opacity: showCardSection ? 1 : 0,
            pointerEvents: showCardSection ? 'auto' : 'none'
          }}
        >
          <div className="grid grid-cols-16 h-screen">
            {/* Left Side - Card Stack */}
            <div className="col-span-12 flex items-center justify-center p-8">
              <div className="relative w-full max-w-2xl h-[450px]">
                {/* Card 1 - Brand Strategy */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8"
                  animate={{
                    y: cardStackProgress > 0.33 ? -500 : 0,
                    opacity: cardStackProgress > 0.33 ? 0 : 1,
                    scale: cardStackProgress > 0.33 ? 0.8 : 1,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    zIndex: cardStackProgress > 0.33 ? 5 : 30,
                  }}
                >
                  <div className="text-sm text-gray-500 mb-2 font-secondary">01 / What We Do</div>
                  <h3 className="text-4xl font-bold mb-4 font-primary">Brand Strategy</h3>
                  <p className="text-lg text-gray-600 font-secondary mb-6">We craft compelling brand narratives that resonate with your audience and differentiate you in the market. From positioning to messaging, we build brands that last.</p>
                  <ul className="space-y-2 text-gray-600 font-secondary">
                    <li>• Brand Identity & Positioning</li>
                    <li>• Visual Identity Systems</li>
                    <li>• Brand Guidelines</li>
                  </ul>
                </motion.div>

                {/* Card 2 - Digital Design */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8"
                  animate={{
                    y: cardStackProgress < 0.33 ? 16 : (cardStackProgress > 0.66 ? -500 : 0),
                    x: cardStackProgress < 0.33 ? 16 : 0,
                    scale: cardStackProgress < 0.33 ? 0.97 : (cardStackProgress > 0.66 ? 0.8 : 1),
                    opacity: cardStackProgress > 0.66 ? 0 : 1,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    zIndex: cardStackProgress < 0.33 ? 20 : (cardStackProgress > 0.66 ? 5 : 30),
                  }}
                >
                  <div className="text-sm text-gray-500 mb-2 font-secondary">02 / What We Do</div>
                  <h3 className="text-4xl font-bold mb-4 font-primary">Digital Design</h3>
                  <p className="text-lg text-gray-600 font-secondary mb-6">Creating beautiful, intuitive digital experiences that engage users and drive results. We design with purpose, blending aesthetics with functionality.</p>
                  <ul className="space-y-2 text-gray-600 font-secondary">
                    <li>• UI/UX Design</li>
                    <li>• Web & Mobile Apps</li>
                    <li>• Interactive Experiences</li>
                  </ul>
                </motion.div>

                {/* Card 3 - Development */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8"
                  animate={{
                    y: cardStackProgress < 0.33 ? 32 : (cardStackProgress < 0.66 ? 16 : 0),
                    x: cardStackProgress < 0.33 ? 32 : (cardStackProgress < 0.66 ? 16 : 0),
                    scale: cardStackProgress < 0.33 ? 0.95 : (cardStackProgress < 0.66 ? 0.97 : 1),
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    zIndex: cardStackProgress < 0.66 ? 10 : 30,
                  }}
                >
                  <div className="text-sm text-gray-500 mb-2 font-secondary">03 / What We Do</div>
                  <h3 className="text-4xl font-bold mb-4 font-primary">Development</h3>
                  <p className="text-lg text-gray-600 font-secondary mb-6">Building robust, scalable digital products with cutting-edge technology. We bring designs to life with clean code and seamless performance.</p>
                  <ul className="space-y-2 text-gray-600 font-secondary">
                    <li>• Web Development</li>
                    <li>• Mobile Applications</li>
                    <li>• E-commerce Solutions</li>
                  </ul>
                </motion.div>
              </div>
            </div>

            {/* Right Side - Image with Wind Effect */}
            <motion.div
              className="col-span-4 h-screen relative overflow-hidden"
              animate={{
                opacity: virtualScroll > 5000 ? 0 : 1,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {/* Image 1 - for Card 1 */}
              <WindImage
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1200&fit=crop"
                alt="Featured 1"
                isActive={cardStackProgress < 0.33}
                cardStackProgress={cardStackProgress}
              />

              {/* Image 2 - for Card 2 */}
              <WindImage
                src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=1200&fit=crop"
                alt="Featured 2"
                isActive={cardStackProgress >= 0.33 && cardStackProgress < 0.66}
                cardStackProgress={cardStackProgress}
              />

              {/* Image 3 - for Card 3 */}
              <WindImage
                src="https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&h=1200&fit=crop"
                alt="Featured 3"
                isActive={cardStackProgress >= 0.66}
                cardStackProgress={cardStackProgress}
              />

              {/* Noise Filter Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay z-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                }}
              />
            </motion.div>
          </div>
        </div>



        {/* Business Articles Section */}
        <div
          data-articles-container
          className="absolute inset-0 z-50 transition-opacity duration-500 bg-white overflow-y-auto"
          style={{
            opacity: showArticles ? 1 : 0,
            pointerEvents: showArticles ? 'auto' : 'none'
          }}
        >
          {/* Navigation Bar */}
          <nav className="sticky top-0 z-20 py-6 bg-white">
            <div className="grid grid-cols-16 items-center">
              <div className="col-span-8 flex items-center gap-8 pl-8 font-secondary">
                <a href="#" className="text-black hover:opacity-60 transition-opacity">Who We Are</a>
                <a href="#" className="text-black hover:opacity-60 transition-opacity">What We Do</a>
                <a href="#" className="text-black hover:opacity-60 transition-opacity">Case Studies</a>
                <a href="#" className="text-black hover:opacity-60 transition-opacity">Articles</a>
                <a href="#" className="text-black hover:opacity-60 transition-opacity">Contact Us</a>
              </div>
              <div className="col-span-8 flex items-center justify-end gap-2 pr-8 font-secondary">
                <span className="text-black font-semibold">Studio</span>
                <div className="w-8 h-8 rounded-full bg-black"></div>
              </div>
            </div>
          </nav>

          <div className="min-h-[calc(100vh-80px-300px)] flex flex-col justify-center px-16 py-16">
            <h2 className="text-6xl font-bold mb-12 font-primary">Business Articles</h2>

            <div className="grid grid-cols-3 gap-8">
              {/* Article 1 */}
              <motion.div
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: showArticles ? 1 : 0, y: showArticles ? 0 : 50 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 font-primary">The Future of Digital Design</h3>
                  <p className="text-gray-600 mb-4 font-secondary">Exploring emerging trends and technologies shaping the design landscape in 2025.</p>
                  <button className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-secondary">
                    Read More
                  </button>
                </div>
              </motion.div>

              {/* Article 2 */}
              <motion.div
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: showArticles ? 1 : 0, y: showArticles ? 0 : 50 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="h-64 bg-gradient-to-br from-green-500 to-teal-600"></div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 font-primary">Building Sustainable Brands</h3>
                  <p className="text-gray-600 mb-4 font-secondary">How companies are integrating sustainability into their core brand identity.</p>
                  <button className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-secondary">
                    Read More
                  </button>
                </div>
              </motion.div>

              {/* Article 3 */}
              <motion.div
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: showArticles ? 1 : 0, y: showArticles ? 0 : 50 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="h-64 bg-gradient-to-br from-orange-500 to-red-600"></div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 font-primary">AI in Creative Industries</h3>
                  <p className="text-gray-600 mb-4 font-secondary">Understanding the role of artificial intelligence in modern creative workflows.</p>
                  <button className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-secondary">
                    Read More
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <footer className="w-full bg-black text-white py-8 px-16 mt-16">
            <div className="grid grid-cols-16 gap-8">
              {/* Left Side - Brand */}
              <div className="col-span-6">
                <h3 className="text-2xl font-bold mb-4 font-primary">Studio</h3>
                <p className="text-gray-400 font-secondary">Creating iconic brands and digital experiences that shape the future.</p>
              </div>

              {/* Middle - Links */}
              <div className="col-span-6 grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 font-secondary">Company</h4>
                  <ul className="space-y-2 font-secondary">
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 font-secondary">Services</h4>
                  <ul className="space-y-2 font-secondary">
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Branding</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Digital Design</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Development</a></li>
                  </ul>
                </div>
              </div>

              {/* Right Side - Social */}
              <div className="col-span-4">
                <h4 className="font-semibold mb-3 font-secondary">Follow Us</h4>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors">
                    <span className="font-bold">X</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors">
                    <span className="font-bold">in</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors">
                    <span className="font-bold">IG</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-gray-800 flex justify-between items-center font-secondary">
              <p className="text-gray-400 text-sm">© 2025 Studio. All rights reserved.</p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
