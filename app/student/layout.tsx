'use client';

import { StudentProvider } from './context/StudentContext';
import { StudentHeader } from './components/StudentHeader';
import { StudentFooter } from './components/StudentFooter';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentProvider>
      <div className="min-h-screen bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950 flex flex-col">
        <StudentHeader />
        <main className="flex-1 pt-32 sm:pt-36 pb-8 px-4 sm:px-6 lg:px-8">
           {children}
        </main>
        <StudentFooter />
      </div>
    </StudentProvider>
  );
}
