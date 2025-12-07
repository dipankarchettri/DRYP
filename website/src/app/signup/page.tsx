'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // <--- 1. IMPORT ROUTER
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';
import { Loader2, Zap } from 'lucide-react';
import { Inter, Playfair_Display } from 'next/font/google';

// --- FONTS ---
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter'
});
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'] });

// --- MASTER IMAGE LIST (12 Items) ---
const ALL_IMAGES = [
  "https://plus.unsplash.com/premium_photo-1669703777657-41f5adb14e9b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fG1hbGUlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1669703777428-48a39ccfe8cb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGZlbWFsZSUyMG1vZGVsfGVufDB8fDB8fHww",
  "https://plus.unsplash.com/premium_photo-1727942418440-d085b3b5f065?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fG1hbGUlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1669704098815-dd3305204e6e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTN8fG1hbGUlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1536180931879-fd2d652efddc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGZlbWFsZSUyMG1vZGVsfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1732464517757-c47075f33821?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fG1hbGUlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1679217230394-c170f0dfa412?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fG1hbGUlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1664875849194-0adbac28529f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fG1hbGUlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1635081042814-5b08704d7f9a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTM2fHxmZW1hbGUlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1571490311976-037d2c539ce2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTA4fHxmZW1hbGUlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1727942418146-bab709e1a4a4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjV8fG1hbGUlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1732464517792-7385024242a6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTEyfHxtYWxlJTIwbW9kZWx8ZW58MHx8MHx8fDA%3D",
];

// --- SPLIT IMAGES FOR "MIXED" LOOK (3 Separate Lists) ---
const COLUMN_1 = ALL_IMAGES.slice(0, 4);
const COLUMN_2 = ALL_IMAGES.slice(4, 8);
const COLUMN_3 = ALL_IMAGES.slice(8, 12);

const MarqueeColumn = ({ images, duration, reverse = false }: { images: string[], duration: number, reverse?: boolean }) => {
  return (
    <motion.div
      initial={{ y: reverse ? "-50%" : "0%" }}
      animate={{ y: reverse ? "0%" : "-50%" }}
      transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
      className="flex flex-col gap-5 w-full"
    >
      {[...images, ...images, ...images].map((src, i) => (
        <div key={i} className="relative w-full overflow-hidden rounded-lg shadow-sm bg-zinc-200">
          <div className="relative aspect-[3/4] w-full"> 
            <Image 
              src={src} 
              alt="Fashion Aesthetic" 
              fill
              className="object-cover transition-all duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // <--- 2. INITIALIZE ROUTER
  const { login, guestId } = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, guestId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // Automatically log the user in after successful registration
      await login(data.user, data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen w-full bg-[#F8F9FC] text-zinc-900 overflow-hidden ${inter.className}`}>
      
      {/* LEFT SIDE */}
      <div className="relative z-10 flex w-full flex-col justify-center px-6 lg:w-[45%] xl:px-24">
        
        <div className="absolute top-10 left-6 lg:left-12 xl:left-24">
          <Link href="/" className="flex items-center gap-2 group">
            <Zap className="h-6 w-6 text-black fill-current group-hover:scale-110 transition-transform" />
            <span className={`${playfair.className} text-3xl font-bold tracking-tighter text-black`}>DRYP</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-10 text-left">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-3 leading-[0.95]">
              Create an<br />account
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide mt-4">
              Join the operating system for modern fashion.
            </p>
          </div>

          <button 
            type="button" 
            className="group flex w-full items-center justify-center gap-3 border border-zinc-300 bg-white px-4 py-3.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-400 focus:outline-none rounded-md"
          >
            <span className="text-zinc-600 transition-colors group-hover:text-black">
              <FaGoogle />
            </span>
            <span>Sign up with Google</span>
          </button>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-300" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Or Register</span>
            <div className="h-px flex-1 bg-zinc-300" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-black">Full Name</label>
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-b-2 border-zinc-300 bg-transparent px-0 py-2 text-base font-semibold text-black placeholder-zinc-500 transition-colors focus:border-black focus:outline-none" 
                placeholder="John Doe" 
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-black">Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full border-b-2 border-zinc-300 bg-transparent px-0 py-2 text-base font-semibold text-black placeholder-zinc-500 transition-colors focus:border-black focus:outline-none" 
                placeholder="name@example.com" 
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-black">Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full border-b-2 border-zinc-300 bg-transparent px-0 py-2 text-base font-semibold text-black placeholder-zinc-500 transition-colors focus:border-black focus:outline-none" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="mt-8 w-full bg-slate-900 py-4 text-sm font-bold text-white transition-all hover:bg-black hover:shadow-lg disabled:opacity-70 rounded-full"
            >
              {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Create Account →'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-500 font-medium">
            Already a member? <Link href="/login" className="font-bold text-black underline underline-offset-4 hover:text-zinc-700">Log in</Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: MIXED COLUMNS */}
      <div className="hidden h-full flex-1 overflow-hidden bg-[#F8F9FC] lg:flex items-center justify-center relative">
        <div className="flex h-[250vh] w-[150%] gap-6 -rotate-6 opacity-100 translate-y-[-10%]">
          <div className="flex-1"><MarqueeColumn images={COLUMN_1} duration={120} /></div>
          <div className="flex-1 pt-32"><MarqueeColumn images={COLUMN_2} duration={100} reverse={true} /></div>
          <div className="flex-1 pt-10"><MarqueeColumn images={COLUMN_3} duration={110} /></div>
        </div>
      </div>
    </div>
  );
}