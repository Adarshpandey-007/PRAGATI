"use client";

import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type ProgramsPlatformHeaderProps = {
  contextLabel: string;
  backHref?: string;
  backLabel?: string;
  navLinks?: Array<{ label: string; href: string }>;
};

export default function ProgramsPlatformHeader({
  contextLabel,
  backHref = "/",
  backLabel = "Back to Home",
  navLinks = [],
}: ProgramsPlatformHeaderProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 text-xs sm:text-sm shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-bold">IN</div>
            <span className="font-semibold tracking-wide">GOVERNMENT OF INDIA</span>
          </div>
          <span className="text-[11px] opacity-95">{contextLabel}</span>
        </div>
      </div>

      <header className="fixed top-10 sm:top-11 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              {backLabel}
            </button>

            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 px-1 py-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded-full transition ${
                language === "en"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white font-medium"
                  : "text-muted-foreground hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className={`px-2 py-0.5 rounded-full transition ${
                language === "hi"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white font-medium"
                  : "text-muted-foreground hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Hindi
            </button>
            <button
              type="button"
              onClick={() => setLanguage("pa")}
              className={`px-2 py-0.5 rounded-full transition ${
                language === "pa"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white font-medium"
                  : "text-muted-foreground hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Punjabi
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
