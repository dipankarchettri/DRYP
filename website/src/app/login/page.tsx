'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { Inter, Inter_Tight } from 'next/font/google';

// FONTS
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const interTight = Inter_Tight({ subsets: ['latin'], weight: ['700', '800', '900'] });

// IMAGE LIST
const ALL_IMAGES = [
  "https://plus.unsplash.com/premium_photo-1669703777657-41f5adb14e9b?w=600",
  "https://plus.unsplash.com/premium_photo-1669703777428-48a39ccfe8cb?w=600",
  "https://plus.unsplash.com/premium_photo-1727942418440-d085b3b5f065?w=600",
  "https://plus.unsplash.com/premium_photo-1669704098815-dd3305204e6e?w=600",
  "https://images.unsplash.com/photo-1536180931879-fd2d652efddc?w=600",
  "https://images.unsplash.com/photo-1732464517757-c47075f33821?w=600",
  "https://images.unsplash.com/photo-1679217230394-c170f0dfa412?w=600",
  "https://plus.unsplash.com/premium_photo-1664875849194-0adbac28529f?w=600",
  "https://images.unsplash.com/photo-1635081042814-5b08704d7f9a?w=600",
  "https://images.unsplash.com/photo-1571490311976-037d2c539ce2?w=600",
  "https://plus.unsplash.com/premium_photo-1727942418146-bab709e1a4a4?w=600",
  "https://images.unsplash.com/photo-1732464517792-7385024242a6?w=600"
];

const COLUMN_1 = ALL_IMAGES.slice(0, 4);
const COLUMN_2 = ALL_IMAGES.slice(4, 8);
const COLUMN_3 = ALL_IMAGES.slice(8, 12);

interface MarqueeProps {
  images: string[];
  duration: number;
  reverse?: boolean;
}

const MarqueeColumn = ({ images, duration, reverse = false }: MarqueeProps) => (
  <motion.div
    initial={{ y: reverse ? "-50%" : "0%" }}
    animate={{ y: reverse ? "0%" : "-50%" }}
    transition={{ duration, repeat: Infinity, ease: "linear" }}
    className="flex flex-col gap-5 w-full"
  >
    {[...images, ...images].map((src, i) => (
      <div key={i} className="relative w-full rounded-lg overflow-hidden bg-zinc-200 shadow-sm">
        <div className="relative aspect-[3/4] w-full">
          <Image src={src} fill alt="Fashion" className="object-cover" />
        </div>
      </div>
    ))}
  </motion.div>
);

export default function LoginPage() {
  const router = useRouter();
  const { login, guestId } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, guestId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      await login(data.user, data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen w-full bg-white text-zinc-900 overflow-hidden ${inter.className}`}>

      {/* LEFT SIDE */}
      <div className="relative flex flex-col justify-center px-6 w-full lg:w-[45%] xl:px-24">
        <div className="absolute top-10 left-8 text-3xl font-black tracking-tight">DRYP</div>

        <div className="mx-auto w-full max-w-[400px]">

          <h1 className={`${interTight.className} text-5xl font-extrabold leading-[1.05] tracking-tight text-[#0A0A0A] mb-4`}>
            Welcome<br />back
          </h1>

          <p className="text-slate-500 text-base font-medium">
            The operating system for modern fashion.
          </p>

          <button className="mt-8 border border-zinc-300 rounded-md py-3.5 w-full flex items-center justify-center gap-3 hover:bg-zinc-50 text-base font-semibold">
            <FaGoogle /> Continue with Google
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-zinc-300 flex-1" />
            <span className="uppercase text-xs font-bold tracking-widest">Or Login</span>
            <div className="h-px bg-zinc-300 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="text-sm font-bold uppercase">Email</label>
              <input
                type="email"
                required
                className="w-full border-b-2 border-zinc-300 py-2 text-lg focus:border-black font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="text-sm font-bold uppercase">Password</label>
                <Link href="/forgot-password" className="text-sm hover:text-black text-zinc-500">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                className="w-full border-b-2 border-zinc-300 py-2 text-lg focus:border-black font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••"
              />
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded-full text-base font-bold hover:bg-slate-900 mt-8"
            >
              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Log In →"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 font-semibold tracking-wide mt-8">
            Not a member?
            <Link href="/signup" className="ml-1 underline underline-offset-4 font-bold text-black hover:text-zinc-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex flex-1 h-full overflow-hidden bg-[#F8F9FC] items-center justify-center">
        <div className="flex h-[250vh] w-[150%] gap-6 -rotate-6 translate-y-[-10%]">
          <div className="flex-1"><MarqueeColumn images={COLUMN_1} duration={120} /></div>
          <div className="flex-1 pt-32"><MarqueeColumn images={COLUMN_2} duration={100} reverse /></div>
          <div className="flex-1 pt-10"><MarqueeColumn images={COLUMN_3} duration={110} /></div>
        </div>
      </div>
    </div>
  );
}
