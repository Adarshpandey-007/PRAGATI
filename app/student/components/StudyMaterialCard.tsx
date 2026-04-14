'use client';

import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Search, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudyMaterialCardProps {
  language: 'en' | 'pa' | 'hi';
}

export function StudyMaterialCard({ language }: StudyMaterialCardProps) {
  const router = useRouter();

  const translations = {
    en: {
      title: 'Study Material',
      subtitle: 'Access digital textbooks & lessons',
      action: 'Explore Library',
      description: 'Powered by DIKSHA'
    },
    pa: {
      title: 'ਅਧਿਐਨ ਸਮੱਗਰੀ',
      subtitle: 'ਡਿਜੀਟਲ ਪਾਠ ਪੁਸਤਕਾਂ ਅਤੇ ਪਾਠਾਂ ਤੱਕ ਪਹੁੰਚ ਕਰੋ',
      action: 'ਲਾਇਬ੍ਰੇਰੀ ਖੋਜੋ',
      description: 'ਦੀਕਸ਼ਾ ਦੁਆਰਾ ਸੰਚਾਲਿਤ'
    },
    hi: {
      title: 'अध्ययन सामग्री',
      subtitle: 'डिजिटल पाठ्यपुस्तकों और पाठों तक पहुंचें',
      action: 'लाइब्रेरी देखें',
      description: 'दीक्षा द्वारा संचालित'
    }
  };

  const t = translations[language];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <div 
        onClick={() => router.push('/student/study-material')}
        className="h-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-2 border-gray-100 dark:border-gray-800 cursor-pointer group relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
              <GraduationCap className="w-3 h-3" />
              DIKSHA
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {t.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t.subtitle}
          </p>

          <div className="mt-auto flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
            {t.action}
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
