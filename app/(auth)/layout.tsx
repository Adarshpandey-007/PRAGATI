"use client";

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translations = {
    en: {
      govtOfIndia: 'GOVERNMENT OF INDIA',
      backToRoles: 'Back to roles',
    },
    hi: {
      govtOfIndia: 'भारत सरकार',
      backToRoles: 'भूमिकाओं पर वापस जाएं',
    },
    pa: {
      govtOfIndia: 'ਭਾਰਤ ਸਰਕਾਰ',
      backToRoles: 'ਭੂਮਿਕਾਵਾਂ ਤੇ ਵਾਪਸ ਜਾਓ',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;
  const languageLabel = language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'ਪੰਜਾਬੀ';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex flex-col overflow-hidden">
      {/* Government Header - UX4G Style */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 text-xs sm:text-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-semibold">🇮🇳</div>
            <span className="font-semibold tracking-wide">{t.govtOfIndia}</span>
          </div>
          <div className="flex items-center gap-4">
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">
                    <span>🌐</span>
                    {languageLabel}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('hi')}>हिंदी</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('pa')}>ਪੰਜਾਬੀ</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                <span>🌐</span>
                {languageLabel}
                <ChevronDown className="w-3 h-3 ml-1" />
              </div>
            )}
          </div>
        </div>
      </div>

      <header className="px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/roles')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-primary/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToRoles}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute w-80 h-80 bg-primary/15 rounded-full blur-3xl" style={{ top: '5%', left: '8%' }} />
          <div className="absolute w-72 h-72 bg-secondary/15 rounded-full blur-3xl" style={{ bottom: '-10%', right: '-4%' }} />
        </div>
        <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
          {children}
        </div>
      </main>
      <footer className="border-t border-white/20 bg-white/30 dark:bg-white/5 backdrop-blur-lg py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3 text-[11px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Image
              src="/pragati-logo.png"
              alt="Pragati logo"
              width={100}
              height={72}
              className="h-14 w-auto object-contain drop-shadow"
            />
            <span className="font-semibold text-foreground hidden sm:inline">Pragati</span>
          </div>
          <p className="text-right">
            © {new Date().getFullYear()} Pragati. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
