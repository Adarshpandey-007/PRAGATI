'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Shield, Scale } from 'lucide-react';

type Language = 'en' | 'hi' | 'pa';

const translations = {
  en: {
    governmentOfPunjab: 'PRAGATI',
    department: 'SIH 2026 • MoE & Govt. of Punjab',
    backToHome: 'Back to Home',
    pageTitle: 'Terms of Service',
    pageSubtitle: 'Terms and conditions governing the use of PRAGATI',
    lastUpdated: 'Last Updated: April 2026',
    acceptance: 'By using PRAGATI, you agree to these terms and all applicable laws.',
    useTitle: 'Acceptable Use',
    useText: 'Do not misuse accounts, falsify records, bypass security, or disrupt platform operations.',
    privacyTitle: 'Privacy and Security',
    privacyText: 'Your use is also governed by the Privacy Policy. We apply role-based access and secure handling practices.',
    liabilityTitle: 'Limitation of Liability',
    liabilityText: 'PRAGATI is provided as-is for educational workflow support. Service interruptions may occur.',
    acknowledgement: 'Acknowledgement',
    acknowledgementText: 'You acknowledge that you have read and understood these terms.',
    relatedLinks: 'Related Links',
    privacyPolicy: 'Privacy Policy',
    legalInfo: 'Legal Information',
    contactUs: 'Contact Us',
    copyright: '© 2026 PRAGATI. All rights reserved.',
    footerTag: 'SIH 2026 • MoE & Govt. of Punjab',
  },
  hi: {
    governmentOfPunjab: 'PRAGATI',
    department: 'SIH 2026 • MoE & Govt. of Punjab',
    backToHome: 'होम पेज पर वापस',
    pageTitle: 'सेवा की शर्तें',
    pageSubtitle: 'PRAGATI के उपयोग हेतु नियम और शर्तें',
    lastUpdated: 'अंतिम अपडेट: अप्रैल 2026',
    acceptance: 'PRAGATI का उपयोग करके आप इन शर्तों से सहमत होते हैं।',
    useTitle: 'स्वीकार्य उपयोग',
    useText: 'खातों का दुरुपयोग, रिकॉर्ड में हेरफेर, या सुरक्षा नियमों का उल्लंघन न करें।',
    privacyTitle: 'गोपनीयता और सुरक्षा',
    privacyText: 'आपका उपयोग गोपनीयता नीति के अधीन है।',
    liabilityTitle: 'दायित्व सीमा',
    liabilityText: 'PRAGATI शैक्षिक कार्यप्रवाह सहायता हेतु उपलब्ध कराया गया है।',
    acknowledgement: 'स्वीकृति',
    acknowledgementText: 'आप स्वीकार करते हैं कि आपने इन शर्तों को पढ़ लिया है।',
    relatedLinks: 'संबंधित लिंक',
    privacyPolicy: 'गोपनीयता नीति',
    legalInfo: 'कानूनी जानकारी',
    contactUs: 'संपर्क करें',
    copyright: '© 2026 PRAGATI. सर्वाधिकार सुरक्षित।',
    footerTag: 'SIH 2026 • MoE & Govt. of Punjab',
  },
  pa: {
    governmentOfPunjab: 'PRAGATI',
    department: 'SIH 2026 • MoE & Govt. of Punjab',
    backToHome: 'ਮੁੱਖ ਪੰਨੇ ਤੇ ਵਾਪਸ',
    pageTitle: 'ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ',
    pageSubtitle: 'PRAGATI ਦੀ ਵਰਤੋਂ ਲਈ ਨਿਯਮ ਅਤੇ ਸ਼ਰਤਾਂ',
    lastUpdated: 'ਆਖਰੀ ਅੱਪਡੇਟ: ਅਪ੍ਰੈਲ 2026',
    acceptance: 'PRAGATI ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਤੁਸੀਂ ਇਨ੍ਹਾਂ ਸ਼ਰਤਾਂ ਨਾਲ ਸਹਿਮਤ ਹੋ।',
    useTitle: 'ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਵਰਤੋਂ',
    useText: 'ਖਾਤਿਆਂ ਦਾ ਦੁਰਪਯੋਗ, ਰਿਕਾਰਡ ਵਿੱਚ ਛੇੜਛਾੜ ਜਾਂ ਸੁਰੱਖਿਆ ਦੀ ਉਲੰਘਣਾ ਨਾ ਕਰੋ।',
    privacyTitle: 'ਗੋਪਨੀਯਤਾ ਅਤੇ ਸੁਰੱਖਿਆ',
    privacyText: 'ਤੁਹਾਡੀ ਵਰਤੋਂ ਗੋਪਨੀਯਤਾ ਨੀਤੀ ਅਧੀਨ ਹੈ।',
    liabilityTitle: 'ਜ਼ਿੰਮੇਵਾਰੀ ਸੀਮਾ',
    liabilityText: 'PRAGATI ਸਿੱਖਿਆਈ ਵਰਕਫਲੋ ਸਹਾਇਤਾ ਲਈ ਉਪਲਬਧ ਹੈ।',
    acknowledgement: 'ਸਵੀਕਾਰੋਕਤੀ',
    acknowledgementText: 'ਤੁਸੀਂ ਮੰਨਦੇ ਹੋ ਕਿ ਤੁਸੀਂ ਇਹ ਸ਼ਰਤਾਂ ਪੜ੍ਹ ਲਈਆਂ ਹਨ।',
    relatedLinks: 'ਸੰਬੰਧਿਤ ਲਿੰਕ',
    privacyPolicy: 'ਗੋਪਨੀਯਤਾ ਨੀਤੀ',
    legalInfo: 'ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ',
    contactUs: 'ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
    copyright: '© 2026 PRAGATI. ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ।',
    footerTag: 'SIH 2026 • MoE & Govt. of Punjab',
  },
};

export default function TermsPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/pragati-logo.png" alt="Pragati Logo" width={32} height={36} className="w-6 h-7 sm:w-8 sm:h-9 object-contain drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="font-bold tracking-wide text-xs sm:text-sm uppercase">{t.governmentOfPunjab}</span>
              <span className="text-[9px] sm:text-[10px] text-white/80 font-medium">{t.department}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-1 py-0.5 rounded">
            <button onClick={() => setLang('en')} className={`px-2 py-0.5 rounded text-xs font-medium transition ${lang === 'en' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}>EN</button>
            <button onClick={() => setLang('pa')} className={`px-2 py-0.5 rounded text-xs font-medium transition ${lang === 'pa' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}>ਪੰ</button>
            <button onClick={() => setLang('hi')} className={`px-2 py-0.5 rounded text-xs font-medium transition ${lang === 'hi' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}>हि</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FileText className="w-10 h-10 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold">{t.pageTitle}</h1>
          <p className="text-blue-100 mt-2">{t.pageSubtitle}</p>
          <p className="text-blue-200 text-sm mt-3">{t.lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">{t.acceptance}</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <AlertTriangle className="w-5 h-5 text-amber-600 mb-3" />
            <h2 className="font-semibold mb-2">{t.useTitle}</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">{t.useText}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Shield className="w-5 h-5 text-blue-600 mb-3" />
            <h2 className="font-semibold mb-2">{t.privacyTitle}</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">{t.privacyText}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <Scale className="w-5 h-5 text-slate-700 dark:text-slate-300 mb-3" />
          <h2 className="font-semibold mb-2">{t.liabilityTitle}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{t.liabilityText}</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">{t.acknowledgement}</h3>
          <p className="text-sm text-green-700 dark:text-green-200">{t.acknowledgementText}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">{t.relatedLinks}</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link href="/privacy" className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm hover:border-primary transition">{t.privacyPolicy}</Link>
            <Link href="/legal" className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm hover:border-primary transition">{t.legalInfo}</Link>
            <Link href="/contact" className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm hover:border-primary transition">{t.contactUs}</Link>
          </div>
        </div>
      </div>

      <footer className="bg-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-300 mb-2">{t.footerTag}</p>
          <p className="text-xs text-gray-500">{t.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
