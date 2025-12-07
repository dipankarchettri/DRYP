"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
// 1. IMPORT THE FONT
import { Playfair_Display } from "next/font/google";
import {
  ArrowRight,
  UploadCloud,
  Box,
  TrendingUp,
  Check,
  RefreshCw,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Zap
} from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"] });

// --- TYPE DEFINITIONS ---
interface DynamicLayerCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tags: string[];
  accentColor: string;
  isReversed?: boolean;
}

// --- 3D FLIP CARD ---
const DynamicLayerCard: React.FC<DynamicLayerCardProps> = ({ 
  icon, 
  title, 
  subtitle, 
  tags, 
  accentColor, 
  isReversed = false 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const accents: Record<string, string> = {
    blue: "from-blue-600 to-cyan-500",
    indigo: "from-indigo-600 to-purple-600",
    purple: "from-fuchsia-600 to-pink-600",
  };

  const gradient = accents[accentColor] || accents.blue;
  const shadowColor = accentColor === 'blue' ? 'shadow-blue-500/20' : accentColor === 'indigo' ? 'shadow-indigo-500/20' : 'shadow-purple-500/20';

  return (
    <div 
      className={`group w-full max-w-[500px] h-[500px] mx-auto [perspective:1000px] cursor-pointer ${isReversed ? 'lg:mr-auto lg:ml-0' : 'lg:ml-auto lg:mr-0'}`}
      onClick={() => setIsFlipped(!isFlipped)} 
    >
      <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-[3rem] border border-gray-100 p-8 md:p-12 flex flex-col justify-between shadow-2xl overflow-hidden">
             <div className={`absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-r ${gradient} rounded-full mix-blend-multiply filter blur-[80px] opacity-10 animate-pulse-slow`}></div>
             
             <div className="relative z-10">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl shadow-gray-200 mb-8 md:mb-10 text-white`}>
                    {icon}
                </div>
                <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-none mb-4 tracking-tighter">{title}</h3>
                <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed">{subtitle}</p>
             </div>

             <div className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
                <RefreshCw size={16} className={`text-${accentColor}-500`} />
                <span className="hidden md:inline">Hover to reveal</span>
                <span className="md:hidden">Tap to reveal</span>
            </div>
        </div>

        {/* BACK FACE */}
        <div className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#0A0A0A] rounded-[3rem] p-8 md:p-12 flex flex-col justify-center shadow-2xl ${shadowColor}`}>
            <div className="text-center mb-8 md:mb-10">
                <h4 className="text-white font-bold text-2xl md:text-3xl mb-4 tracking-tight">Capabilities</h4>
                <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${gradient} mx-auto`}></div>
            </div>
            
            <ul className="space-y-4 md:space-y-6">
                {tags.map((tag, i) => (
                    <li key={i} className="flex items-center gap-4 text-gray-300 font-medium text-base md:text-lg">
                        <div className={`shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                          <Check size={14} className="text-white font-bold" strokeWidth={4} /> 
                        </div>
                        {tag}
                    </li>
                ))}
            </ul>

            <div className="mt-8 md:mt-12 text-center">
                 <button className="px-8 py-3 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white hover:text-black transition-colors">
                    Learn More
                 </button>
            </div>
        </div>

      </div>
    </div>
  );
};

// --- SHIMMER BUTTON COMPONENT ---
const ShimmerButton = ({ text, href, small = false }: { text: string, href: string, small?: boolean }) => (
  <Link 
    href={href} 
    className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl
    ${small ? 'h-10 px-6 text-sm' : 'h-14 md:h-16 px-10 md:px-12 text-lg md:text-xl'}
    `}
  >
    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
      <div className="relative h-full w-8 bg-white/20" />
    </div>
    <span className="flex items-center gap-2">
      {text} 
      {!small && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1"/>}
    </span>
  </Link>
);

// --- MAIN PAGE COMPONENT ---
export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  
  // NAVBAR STATE
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  
  const observerRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Determine if scrolled down enough to add background
        setScrolled(currentScrollY > 50);

        // Smart Hide/Show Logic
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling DOWN -> Hide Navbar
            setIsVisible(false);
        } else {
            // Scrolling UP -> Show Navbar
            setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for Sections
    const observerOptions = { root: null, threshold: 0.3 };
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-index"));
          setActiveSlide(index);
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    observerRefs.current.forEach((el) => { if (el) observer.observe(el); });

    return () => {
        window.removeEventListener('scroll', handleScroll);
        observer.disconnect();
    };
  }, [lastScrollY]);

  return (
    <div className="w-full bg-white font-sans selection:bg-black selection:text-white overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-40 mix-blend-overlay"></div>

      {/* SMART NAVBAR 
         - transform: translateY(-100%) hides it smoothly when scrolling down
         - includes "Get Started" button as requested
      */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-500 transform ${
            isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
            scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm' : 'bg-transparent'
        }`}
      >
          {/* Logo - Left */}
          <Link href="/" className="pointer-events-auto group">
            <span className={`${playfair.className} text-3xl md:text-4xl font-bold tracking-tighter text-black mix-blend-difference group-hover:opacity-80 transition-opacity`}>
              DRYP
            </span>
          </Link>

          {/* Get Started - Right (Visible on Scroll) */}
          <div className={`transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <ShimmerButton text="Get Started" href="/signup" small={true} />
          </div>
      </nav>ust 
      {/* HERO SECTION */}
      <section 
        data-index={0}
        ref={(el) => { if (el) observerRefs.current[0] = el; }}
        className="min-h-screen w-full relative flex items-center justify-center pt-32 pb-20 overflow-hidden bg-white"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-purple-200/40 to-blue-200/40 blur-[120px] animate-pulse"></div>
             <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-cyan-200/40 to-indigo-200/40 blur-[120px] animate-pulse delay-1000"></div>
        </div>
        
        <div className={`relative z-10 container mx-auto px-6 text-center transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-200 transform ${activeSlide === 0 ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="inline-block px-5 py-2 rounded-full border border-gray-200/60 bg-white/50 backdrop-blur-md text-sm font-bold tracking-wide text-gray-600 mb-8 md:mb-10 shadow-sm animate-fade-in-up">
              Vendor Portal 2.0 is live
            </div>
            
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter text-gray-900 leading-[0.9] md:leading-[0.85] mb-8 md:mb-10">
              Vendor
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 bg-[length:200%_auto] animate-shine">
                Portal
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-2xl text-gray-500 font-medium leading-relaxed mb-12 md:mb-16">
                The operating system for modern fashion suppliers. Bulk upload orders, sync inventory instantly, and scale without the chaos.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <ShimmerButton text="Start Selling" href="/signup" />
            </div>
        </div>
      </section>

      {/* SECTION 1: BULK UPLOAD */}
      <section 
        data-index={1}
        ref={(el) => { if (el) observerRefs.current[1] = el; }}
        className="min-h-screen w-full relative flex items-center bg-white overflow-hidden py-20 md:py-32"
      >
         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-blue-100/30 blur-[150px] pointer-events-none opacity-50 animate-pulse-slow"></div>

        <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 md:gap-24 items-center relative z-10">
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-300 transform ${activeSlide >= 1 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                <span className="text-blue-600 font-black tracking-widest uppercase text-sm mb-4 md:mb-6 block">01 / Ingestion</span>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.95] mb-6 md:mb-8">
                    Bulk <br/> Uploads.
                </h2>
                <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-medium max-w-xl">
                    Stop the manual entry madness. Drag and drop your massive Excel/CSV seasonal sheets. We parse sizes, colors, and fabrics instantly.
                </p>
            </div>
            
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-500 transform ${activeSlide >= 1 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                 <DynamicLayerCard 
                   accentColor="blue"
                   icon={<UploadCloud size={48} strokeWidth={1.5} />}
                   title="Import Engine"
                   subtitle="Drag & Drop CSV/XLSX"
                   tags={["Auto-detects Sizes", "Validates Pricing", "Instant Mapping", "Error Reports"]}
                 />
            </div>
        </div>
      </section>

       {/* SECTION 2: INVENTORY */}
      <section 
        data-index={2}
        ref={(el) => { if (el) observerRefs.current[2] = el; }}
        className="min-h-screen w-full relative flex items-center bg-gray-50 overflow-hidden py-20 md:py-32"
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-indigo-100/30 blur-[150px] pointer-events-none opacity-50 animate-pulse-slow delay-700"></div>

        <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 md:gap-24 items-center relative z-10">
            <div className={`order-2 lg:order-1 transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-500 transform ${activeSlide >= 2 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                 <DynamicLayerCard 
                   accentColor="indigo"
                   isReversed={true}
                   icon={<Box size={48} strokeWidth={1.5} />}
                   title="Smart Stock"
                   subtitle="Real-time Sync & Alerts"
                   tags={["Multi-Channel Sync", "Low Stock Alerts", "Barcode Gen", "Returns Logic"]}
                 />
            </div>

             <div className={`order-1 lg:order-2 text-right lg:text-left transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-300 transform ${activeSlide >= 2 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                <span className="text-indigo-600 font-black tracking-widest uppercase text-sm mb-4 md:mb-6 block">02 / Management</span>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.95] mb-6 md:mb-8">
                    Zero <br/> Overselling.
                </h2>
                <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-medium max-w-xl ml-auto lg:ml-0">
                    We sync stock levels across storefronts in real-time. Set automated thresholds so you never sell inventory you dont have.
                </p>
            </div>
        </div>
      </section>

      {/* SECTION 3: ANALYTICS */}
      <section 
        data-index={3}
        ref={(el) => { if (el) observerRefs.current[3] = el; }}
        className="min-h-screen w-full relative flex items-center bg-[#080214] overflow-hidden py-20 md:py-32"
      >
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/40 via-[#080214] to-[#080214]"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>

        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 items-center gap-20">
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-300 transform ${activeSlide >= 3 ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.9] mb-8 md:mb-10">
                    Scale <br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-shine bg-[length:200%_auto]">
                    Smarter.
                    </span>
                </h2>
                 <p className="text-xl md:text-2xl text-purple-100/70 leading-relaxed font-medium max-w-xl mb-12">
                    Understand which collections are driving revenue. Get granular reports on geographic demand and seasonal trends.
                </p>
                 <Link href="/signup" className="inline-flex h-14 md:h-16 px-8 md:px-10 rounded-full bg-white text-black text-lg md:text-xl font-bold items-center gap-3 hover:scale-105 transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-5px_rgba(255,255,255,0.4)]">
                    View Analytics Demo
                </Link>
            </div>

             <div className={`hidden lg:flex justify-end transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-500 transform ${activeSlide >= 3 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                 <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-full blur-[150px] opacity-40 animate-pulse-slow"></div>
                    <TrendingUp size={400} className="relative text-white/5 drop-shadow-2xl" strokeWidth={0.5} />
                 </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A0A0A] text-white pt-20 md:pt-32 pb-12">
        <div className="container mx-auto px-6 md:px-12">
          
          {/* CTA Box */}
          <div className="relative rounded-[3rem] p-8 md:p-24 text-center mb-20 md:mb-32 overflow-hidden border border-white/5">
             <div className="absolute inset-0 bg-[#0A0A0A]">
                 <div className="absolute top-0 left-1/4 w-1/2 h-full bg-blue-500/20 blur-[120px] animate-pulse-slow"></div>
                 <div className="absolute bottom-0 right-1/4 w-1/2 h-full bg-purple-500/20 blur-[120px] animate-pulse-slow delay-1000"></div>
             </div>
             
             <div className="relative z-10">
               <h2 className="text-4xl md:text-7xl font-black mb-6 md:mb-8 tracking-tighter">Ready to synchronize?</h2>
               <p className="text-xl md:text-2xl text-gray-400 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">Join 10,000+ suppliers using the platform to manage inventory and sales channels.</p>
               
               <div className="flex justify-center">
                   <Link href="/signup" className="group relative inline-flex h-14 md:h-16 items-center justify-center overflow-hidden rounded-full bg-white px-10 md:px-12 font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                      <div className="relative h-full w-8 bg-black/10" />
                    </div>
                    <span className="flex items-center gap-2 text-lg md:text-xl">
                      Get Started
                    </span>
                  </Link>
               </div>
             </div>
          </div>

          {/* Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-24 pb-16 border-b border-white/10">
             <div className="md:col-span-5">
                <div className="flex items-center gap-2 mb-6">
                    <Zap size={24} className="text-white" fill="currentColor"/>
                    <span className="font-bold text-xl tracking-tight">DRYP</span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                  The operating system for modern fashion logistics. We help suppliers connect, upload, and manage their business at scale without the spreadsheets.
                </p>
             </div>
             
             <div className="md:col-span-2 md:col-start-7">
                <h4 className="font-bold text-lg mb-8 uppercase tracking-widest">Product</h4>
                <ul className="space-y-4 md:space-y-5 text-gray-400 font-medium">
                   <li className="hover:text-white cursor-pointer transition-colors">Ingestion Engine</li>
                   <li className="hover:text-white cursor-pointer transition-colors">Inventory Sync</li>
                   <li className="hover:text-white cursor-pointer transition-colors">Vendor Portal</li>
                   <li className="hover:text-white cursor-pointer transition-colors">Analytics</li>
                </ul>
             </div>

             <div className="md:col-span-2">
                <h4 className="font-bold text-lg mb-8 uppercase tracking-widest">Company</h4>
                <ul className="space-y-4 md:space-y-5 text-gray-400 font-medium">
                   <li className="hover:text-white cursor-pointer transition-colors">Mission</li>
                   <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                   <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
                </ul>
             </div>

             <div className="md:col-span-2">
                <h4 className="font-bold text-lg mb-8 uppercase tracking-widest">Legal</h4>
                <ul className="space-y-4 md:space-y-5 text-gray-400 font-medium">
                   <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
                   <li className="hover:text-white cursor-pointer transition-colors">Terms</li>
                </ul>
             </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
             <p className="text-gray-500 font-medium">© {new Date().getFullYear()} Inc. All rights reserved.</p>
             <div className="flex gap-8">
                <Twitter className="text-gray-500 hover:text-white cursor-pointer transition-colors" size={22} />
                <Instagram className="text-gray-500 hover:text-white cursor-pointer transition-colors" size={22} />
                <Linkedin className="text-gray-500 hover:text-white cursor-pointer transition-colors" size={22} />
                <Github className="text-gray-500 hover:text-white cursor-pointer transition-colors" size={22} />
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}