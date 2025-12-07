'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter'
});
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'] });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Products', href: '/dashboard/products' },
    { name: 'Orders', href: '/dashboard/orders' },
    { name: 'Store Profile', href: '/dashboard/store' },
  ];

  return (
    <div className={`min-h-screen bg-[#F8F9FC] ${inter.className}`}>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/dashboard">
            <span className={`text-4xl font-black tracking-tight text-black ${playfair.className}`}>
              DRYP
            </span>
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative pb-1 text-[17px] font-semibold transition-all ${
                    isActive ? "text-black" : "text-zinc-500 hover:text-black"
                  }`}
                >
                  {item.name}

                  {/* Underline from center ONLY on hover */}
                  <span
                    className="absolute left-1/2 -bottom-0.5 h-[3px] w-full bg-black rounded-full scale-x-0 -translate-x-1/2 transition-transform duration-300 origin-center group-hover:scale-x-100"
                  />
                </Link>
              );
            })}
          </nav>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
  