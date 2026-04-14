'use client';

export function StudentFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[11px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <img
            src="/pragati-logo.png"
            alt="Pragati logo"
            className="h-12 w-auto object-contain opacity-80 grayscale hover:grayscale-0 transition-all"
          />
          <span className="font-semibold text-gray-900 dark:text-white hidden sm:inline">Pragati</span>
        </div>
        <p className="text-right">
          © {new Date().getFullYear()} Pragati. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
