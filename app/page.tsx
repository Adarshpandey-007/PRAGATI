'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { ApkQRCode } from "@/components/apk-qr";
import { ChevronRight, Menu, X, BookOpen, Users, BarChart3, Shield, Zap, ChevronLeft, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PublicNotice = {
  id: string;
  schoolId?: string;
  title: string;
  body: string;
  category?: string;
  priority?: number;
  isPublic?: boolean;
  activeFrom?: string;
  activeTill?: string;
};

export default function PragatiLanding() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [heroGlow, setHeroGlow] = useState<{ x: number; y: number } | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [publicNotices, setPublicNotices] = useState<PublicNotice[]>([]);
  const [isNoticesLoading, setIsNoticesLoading] = useState(false);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const bannersRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);

  // Scroll to footer handler
  const handleScrollToFooter = () => {
    if (footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const rolesRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
  const notificationsUrl = `${backendUrl}/api/communications/notifications/public`;

  const translations = {
    en: {
      skipToMain: 'Skip to main content',
      govtOfIndia: 'GOVERNMENT OF INDIA',
      activities: 'Activities',
      roles: 'Roles',
      programs: 'Programs',
      updates: 'Updates',
      help: 'Help',
      heroTitle: 'Smart Attendance System',
      heroSubtitle: 'Transforming rural education through intelligent attendance tracking. Empowering teachers, students, and administrators with real-time insights.',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      chooseRole: 'Choose your role',
      accessDashboard: 'Access your dashboard',
      student: 'Student',
      studentDesc: 'Track attendance, view marks',
      teacher: 'Teacher',
      teacherDesc: 'Mark attendance efficiently',
      principal: 'Principal',
      principalDesc: 'Monitor school-wide data',
      government: 'Government',
      governmentDesc: 'Access compliance reports',
      govtProgramsTitle: 'Government Programs & Schemes',
      govtProgramsSubtitle: 'Important initiatives aligned with our attendance system',
      footerTagline: 'Smart attendance for rural schools',
      product: 'Product',
      company: 'Company',
      legal: 'Legal',
      features: 'Features',
      pricing: 'Pricing',
      security: 'Security',
      aboutUs: 'About Us',
      careers: 'Careers',
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms',
      cookiePolicy: 'Cookie Policy',
      rightsReserved: 'All rights reserved.',
      realTimeTracking: 'Real-time Tracking',
      realTimeTrackingDesc: 'Instant attendance updates',
      smartAnalytics: 'Smart Analytics',
      smartAnalyticsDesc: 'Comprehensive reports',
      secureData: 'Secure Data',
      secureDataDesc: 'Government-grade security',
      multiRoleAccess: 'Multi-Role Access',
      multiRoleAccessDesc: 'Role-based dashboards',
      midDayMeal: 'Mid-Day Meal Scheme',
      midDayMealDesc: 'Nutrition support for all enrolled students',
      nep2020: 'National Education Policy 2020',
      nep2020Desc: 'Implementation of NEP 2020 guidelines',
      pmShri: 'PM Shri Scheme',
      pmShriDesc: 'Pradhan Mantri Schools for Rising India',
      diksha: 'DIKSHA Platform',
      dikshaDesc: 'Digital Infrastructure for Knowledge Sharing',
      samagra: 'SAMAGRA Portal',
      samagraDesc: 'Student & Academic Management',
      ePathshala: 'e-Pathshala Resources',
      ePathshalaDesc: 'Digital Learning Content Access',
      latestUpdates: 'Latest Updates',
      publicNotices: 'Public Notices & Announcements',
      noNotices: 'No active notices at the moment.',
      viewAll: 'View All',
      quickSearch: 'Quick search',
      close: 'Close',
      searchPlaceholder: 'Search for sections...',
      noMatches: 'No sections match that search.',
      login: 'Login',
      swipeToSeeMore: 'Swipe to see more programs',
      jump: 'Jump',
      campusNotices: 'Campus notices',
      live: 'Live',
      priority: 'Priority',
      school: 'School',
      digitalBoard: 'Digital board',
      loadingUpdates: 'Loading updates...',
      unableToLoadNotices: 'Unable to load notices right now.',
      appName: 'PRAGATI',
      appSubtitle: 'Smart Attendance for Smarter Schools',
      govtInitiative: 'SIH 2026 � MoE & Govt. of Punjab',
      verifiedNotices: 'Verified notices from the Pragati backend',
      showingNotices: 'Showing up to 5 active notices',
    },
    hi: {
      skipToMain: 'मुख्य सामग्री पर जाएं',
      govtOfIndia: 'भारत सरकार',
      activities: 'गतिविधियां',
      roles: 'भूमिकाएं',
      programs: 'कार्यक्रम',
      updates: 'अपडेट',
      help: 'सहायता',
      heroTitle: 'स्मार्ट उपस्थिति प्रणाली',
      heroSubtitle: 'बुद्धिमान उपस्थिति ट्रैकिंग के माध्यम से ग्रामीण शिक्षा को बदलना। वास्तविक समय की अंतर्दृष्टि के साथ शिक्षकों, छात्रों और प्रशासकों को सशक्त बनाना।',
      getStarted: 'शुरू करें',
      learnMore: 'और जानें',
      chooseRole: 'अपनी भूमिका चुनें',
      accessDashboard: 'अपने डैशबोर्ड तक पहुंचें',
      student: 'छात्र',
      studentDesc: 'उपस्थिति ट्रैक करें, अंक देखें',
      teacher: 'शिक्षक',
      teacherDesc: 'कुशलतापूर्वक उपस्थिति दर्ज करें',
      principal: 'प्रधानाचार्य',
      principalDesc: 'स्कूल-व्यापी डेटा की निगरानी करें',
      government: 'सरकार',
      governmentDesc: 'अनुपालन रिपोर्ट तक पहुंचें',
      govtProgramsTitle: 'सरकारी कार्यक्रम और योजनाएं',
      govtProgramsSubtitle: 'हमारी उपस्थिति प्रणाली के साथ संरेखित महत्वपूर्ण पहल',
      footerTagline: 'ग्रामीण स्कूलों के लिए स्मार्ट उपस्थिति',
      product: 'उत्पाद',
      company: 'कंपनी',
      legal: 'कानूनी',
      features: 'विशेषताएं',
      pricing: 'मूल्य निर्धारण',
      security: 'सुरक्षा',
      aboutUs: 'हमारे बारे में',
      careers: 'करियर',
      contact: 'संपर्क',
      privacy: 'गोपनीयता',
      terms: 'शर्तें',
      cookiePolicy: 'कुकी नीति',
      rightsReserved: 'सर्वाधिकार सुरक्षित।',
      realTimeTracking: 'वास्तविक समय ट्रैकिंग',
      realTimeTrackingDesc: 'तत्काल उपस्थिति अपडेट',
      smartAnalytics: 'स्मार्ट एनालिटिक्स',
      smartAnalyticsDesc: 'व्यापक रिपोर्ट',
      secureData: 'सुरक्षित डेटा',
      secureDataDesc: 'सरकारी स्तर की सुरक्षा',
      multiRoleAccess: 'बहु-भूमिका पहुंच',
      multiRoleAccessDesc: 'भूमिका-आधारित डैशबोर्ड',
      midDayMeal: 'मध्याह्न भोजन योजना',
      midDayMealDesc: 'सभी नामांकित छात्रों के लिए पोषण सहायता',
      nep2020: 'राष्ट्रीय शिक्षा नीति 2020',
      nep2020Desc: 'एनईपी 2020 दिशानिर्देशों का कार्यान्वयन',
      pmShri: 'पीएम श्री योजना',
      pmShriDesc: 'राइजिंग इंडिया के लिए प्रधानमंत्री स्कूल',
      diksha: 'दीक्षा प्लेटफॉर्म',
      dikshaDesc: 'ज्ञान साझा करने के लिए डिजिटल बुनियादी ढांचा',
      samagra: 'समग्र पोर्टल',
      samagraDesc: 'छात्र और शैक्षणिक प्रबंधन',
      ePathshala: 'ई-पाठशाला संसाधन',
      ePathshalaDesc: 'डिजिटल शिक्षण सामग्री तक पहुंच',
      latestUpdates: 'नवीनतम अपडेट',
      publicNotices: 'सार्वजनिक सूचनाएं और घोषणाएं',
      noNotices: 'फिलहाल कोई सक्रिय सूचना नहीं है।',
      viewAll: 'सभी देखें',
      quickSearch: 'त्वरित खोज',
      close: 'बंद करें',
      searchPlaceholder: 'अनुभाग खोजें...',
      noMatches: 'उस खोज से कोई अनुभाग मेल नहीं खाता।',
      login: 'लॉग इन करें',
      swipeToSeeMore: 'अधिक कार्यक्रम देखने के लिए स्वाइप करें',
      jump: 'जाएं',
      campusNotices: 'परिसर सूचनाएं',
      live: 'लाइव',
      priority: 'प्राथमिकता',
      school: 'स्कूल',
      digitalBoard: 'डिजिटल बोर्ड',
      loadingUpdates: 'अपडेट लोड हो रहे हैं...',
      unableToLoadNotices: 'अभी नोटिस लोड करने में असमर्थ।',
      appName: 'प्रगति',
      appSubtitle: 'ई-पंजाब स्कूल',
      govtInitiative: 'सरकारी शिक्षा पहल',
      verifiedNotices: 'प्रगति बैकएंड से सत्यापित नोटिस',
      showingNotices: '5 सक्रिय नोटिस तक दिखा रहा है',
    },
    pa: {
      skipToMain: 'ਮੁੱਖ ਸਮੱਗਰੀ ਤੇ ਜਾਓ',
      govtOfIndia: 'ਭਾਰਤ ਸਰਕਾਰ',
      activities: 'ਗਤੀਵਿਧੀਆਂ',
      roles: 'ਭੂਮਿਕਾਵਾਂ',
      programs: 'ਪ੍ਰੋਗਰਾਮ',
      updates: 'ਅੱਪਡੇਟ',
      help: 'ਮਦਦ',
      heroTitle: 'ਸਮਾਰਟ ਹਾਜ਼ਰੀ ਪ੍ਰਣਾਲੀ',
      heroSubtitle: 'ਬੁੱਧੀਮਾਨ ਹਾਜ਼ਰੀ ਟਰੈਕਿੰਗ ਦੁਆਰਾ ਪੇਂਡੂ ਸਿੱਖਿਆ ਨੂੰ ਬਦਲਣਾ। ਅਧਿਆਪਕਾਂ, ਵਿਦਿਆਰਥੀਆਂ ਅਤੇ ਪ੍ਰਸ਼ਾਸਕਾਂ ਨੂੰ ਰੀਅਲ-ਟਾਈਮ ਜਾਣਕਾਰੀ ਨਾਲ ਸ਼ਕਤੀਕਰਨ।',
      getStarted: 'ਸ਼ੁਰੂ ਕਰੋ',
      learnMore: 'ਹੋਰ ਜਾਣੋ',
      chooseRole: 'ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ',
      accessDashboard: 'ਆਪਣੇ ਡੈਸ਼ਬੋਰਡ ਤੱਕ ਪਹੁੰਚ ਕਰੋ',
      student: 'ਵਿਦਿਆਰਥੀ',
      studentDesc: 'ਹਾਜ਼ਰੀ ਟ੍ਰੈਕ ਕਰੋ, ਅੰਕ ਦੇਖੋ',
      teacher: 'ਅਧਿਆਪਕ',
      teacherDesc: 'ਕੁਸ਼ਲਤਾ ਨਾਲ ਹਾਜ਼ਰੀ ਲਗਾਓ',
      principal: 'ਪ੍ਰਿੰਸੀਪਲ',
      principalDesc: 'ਸਕੂਲ-ਵਿਆਪੀ ਡੇਟਾ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ',
      government: 'ਸਰਕਾਰ',
      governmentDesc: 'ਪਾਲਣਾ ਰਿਪੋਰਟਾਂ ਤੱਕ ਪਹੁੰਚ ਕਰੋ',
      govtProgramsTitle: 'ਸਰਕਾਰੀ ਪ੍ਰੋਗਰਾਮ ਅਤੇ ਸਕੀਮਾਂ',
      govtProgramsSubtitle: 'ਸਾਡੀ ਹਾਜ਼ਰੀ ਪ੍ਰਣਾਲੀ ਨਾਲ ਜੁੜੀਆਂ ਮਹੱਤਵਪੂਰਨ ਪਹਿਲਕਦਮੀਆਂ',
      footerTagline: 'ਪੇਂਡੂ ਸਕੂਲਾਂ ਲਈ ਸਮਾਰਟ ਹਾਜ਼ਰੀ',
      product: 'ਉਤਪਾਦ',
      company: 'ਕੰਪਨੀ',
      legal: 'ਕਾਨੂੰਨੀ',
      features: 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ',
      pricing: 'ਕੀਮਤ',
      security: 'ਸੁਰੱਖਿਆ',
      aboutUs: 'ਸਾਡੇ ਬਾਰੇ',
      careers: 'ਕਰੀਅਰ',
      contact: 'ਸੰਪਰਕ',
      privacy: 'ਗੋਪਨੀਯਤਾ',
      terms: 'ਸ਼ਰਤਾਂ',
      cookiePolicy: 'ਕੂਕੀ ਨੀਤੀ',
      rightsReserved: 'ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ।',
      realTimeTracking: 'ਰੀਅਲ-ਟਾਈਮ ਟ੍ਰੈਕਿੰਗ',
      realTimeTrackingDesc: 'ਤੁਰੰਤ ਹਾਜ਼ਰੀ ਅੱਪਡੇਟ',
      smartAnalytics: 'ਸਮਾਰਟ ਵਿਸ਼ਲੇਸ਼ਣ',
      smartAnalyticsDesc: 'ਵਿਆਪਕ ਰਿਪੋਰਟਾਂ',
      secureData: 'ਸੁਰੱਖਿਅਤ ਡੇਟਾ',
      secureDataDesc: 'ਸਰਕਾਰੀ ਪੱਧਰ ਦੀ ਸੁਰੱਖਿਆ',
      multiRoleAccess: 'ਬਹੁ-ਭੂਮਿਕਾ ਪਹੁੰਚ',
      multiRoleAccessDesc: 'ਭੂਮਿਕਾ-ਅਧਾਰਤ ਡੈਸ਼ਬੋਰਡ',
      midDayMeal: 'ਮਿਡ-ਡੇ ਮੀਲ ਸਕੀਮ',
      midDayMealDesc: 'ਸਾਰੇ ਦਾਖਲ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਪੋਸ਼ਣ ਸਹਾਇਤਾ',
      nep2020: 'ਰਾਸ਼ਟਰੀ ਸਿੱਖਿਆ ਨੀਤੀ 2020',
      nep2020Desc: 'NEP 2020 ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼ਾਂ ਦਾ ਅਮਲ',
      pmShri: 'ਪੀਐਮ ਸ਼੍ਰੀ ਸਕੀਮ',
      pmShriDesc: 'ਰਾਈਜ਼ਿੰਗ ਇੰਡੀਆ ਲਈ ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਸਕੂਲ',
      diksha: 'ਦੀਕਸ਼ਾ ਪਲੇਟਫਾਰਮ',
      dikshaDesc: 'ਗਿਆਨ ਸਾਂਝਾ ਕਰਨ ਲਈ ਡਿਜੀਟਲ ਬੁਨਿਆਦੀ ਢਾਂਚਾ',
      samagra: 'ਸਮਗਰਾ ਪੋਰਟਲ',
      samagraDesc: 'ਵਿਦਿਆਰਥੀ ਅਤੇ ਅਕਾਦਮਿਕ ਪ੍ਰਬੰਧਨ',
      ePathshala: 'ਈ-ਪਾਠਸ਼ਾਲਾ ਸਰੋਤ',
      ePathshalaDesc: 'ਡਿਜੀਟਲ ਸਿਖਲਾਈ ਸਮੱਗਰੀ ਤੱਕ ਪਹੁੰਚ',
      latestUpdates: 'ਨਵੀਨਤਮ ਅੱਪਡੇਟ',
      publicNotices: 'ਜਨਤਕ ਸੂਚਨਾਵਾਂ ਅਤੇ ਘੋਸ਼ਣਾਵਾਂ',
      noNotices: 'ਇਸ ਸਮੇਂ ਕੋਈ ਸਰਗਰਮ ਸੂਚਨਾ ਨਹੀਂ ਹੈ।',
      viewAll: 'ਸਭ ਦੇਖੋ',
      quickSearch: 'ਤੁਰੰਤ ਖੋਜ',
      close: 'ਬੰਦ ਕਰੋ',
      searchPlaceholder: 'ਭਾਗ ਖੋਜੋ...',
      noMatches: 'ਉਸ ਖੋਜ ਨਾਲ ਕੋਈ ਭਾਗ ਮੇਲ ਨਹੀਂ ਖਾਂਦਾ।',
      login: 'ਲੌਗ ਇਨ ਕਰੋ',
      swipeToSeeMore: 'ਹੋਰ ਪ੍ਰੋਗਰਾਮ ਦੇਖਣ ਲਈ ਸਵਾਈਪ ਕਰੋ',
      jump: 'ਜਾਓ',
      campusNotices: 'ਕੈਂਪਸ ਨੋਟਿਸ',
      live: 'ਲਾਈਵ',
      priority: 'ਤਰਜੀਹ',
      school: 'ਸਕੂਲ',
      digitalBoard: 'ਡਿਜੀਟਲ ਬੋਰਡ',
      loadingUpdates: 'ਅੱਪਡੇਟ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
      unableToLoadNotices: 'ਇਸ ਸਮੇਂ ਨੋਟਿਸ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ।',
      appName: 'ਪ੍ਰਗਤੀ',
      appSubtitle: 'ਈ-ਪੰਜਾਬ ਸਕੂਲ',
      govtInitiative: 'ਸਰਕਾਰੀ ਸਿੱਖਿਆ ਪਹਿਲਕਦਮੀ',
      verifiedNotices: 'ਪ੍ਰਗਤੀ ਬੈਕਐਂਡ ਤੋਂ ਪ੍ਰਮਾਣਿਤ ਨੋਟਿਸ',
      showingNotices: '5 ਸਰਗਰਮ ਨੋਟਿਸ ਦਿਖਾ ਰਿਹਾ ਹੈ',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const scrollWithOffset = (element: HTMLElement, offset: number) => {
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(elementTop - offset, 0), behavior: 'smooth' });
    element.focus({ preventScroll: true });
  };

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    setScrollY(window.scrollY);

    const handleScroll = () => {
      if (scrollRafRef.current !== null) {
        return;
      }

      scrollRafRef.current = window.requestAnimationFrame(() => {
        const nextScrollY = window.scrollY;
        if (nextScrollY !== lastScrollYRef.current) {
          lastScrollYRef.current = nextScrollY;
          setScrollY(nextScrollY);
        }
        scrollRafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = heroElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setHeroGlow({ x, y });
    };

    const handleMouseLeave = () => {
      setHeroGlow(null);
    };

    heroElement.addEventListener('mousemove', handleMouseMove);
    heroElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      heroElement.removeEventListener('mousemove', handleMouseMove);
      heroElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
    document.body.style.overflow = '';
  }, [isSearchOpen]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const fetchNotices = async () => {
      setIsNoticesLoading(true);
      try {
        const response = await fetch(notificationsUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load notices');
        }
        const data = await response.json();
        if (isMounted) {
          setPublicNotices(Array.isArray(data?.items) ? data.items : []);
          setNoticeError(null);
        }
      } catch (error) {
        if (isMounted && (error as Error).name !== 'AbortError') {
          setNoticeError('Unable to load notices right now.');
        }
      } finally {
        if (isMounted) {
          setIsNoticesLoading(false);
        }
      }
    };

    fetchNotices();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [notificationsUrl]);

  const roles = [
    {
      id: 'student',
      title: t.student,
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      description: t.studentDesc,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'teacher',
      title: t.teacher,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      description: t.teacherDesc,
      color: 'from-teal-500 to-green-500',
    },
    {
      id: 'principal',
      title: t.principal,
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
      description: t.principalDesc,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'government',
      title: t.government,
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
      description: t.governmentDesc,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const governmentPrograms = [
    {
      id: 1,
      slug: 'mid-day-meal-scheme',
      title: t.midDayMeal,
      description: t.midDayMealDesc,
      color: 'bg-gradient-to-br from-orange-400 to-orange-600',
      icon: '🍽️',
    },
    {
      id: 2,
      slug: 'national-education-policy-2020',
      title: t.nep2020,
      description: t.nep2020Desc,
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      icon: '📚',
    },
    {
      id: 3,
      slug: 'pm-shri-scheme',
      title: t.pmShri,
      description: t.pmShriDesc,
      color: 'bg-gradient-to-br from-green-400 to-green-600',
      icon: '🏫',
    },
    {
      id: 4,
      slug: 'diksha-platform',
      title: t.diksha,
      description: t.dikshaDesc,
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
      icon: '💻',
    },
    {
      id: 5,
      slug: 'samagra-portal',
      title: t.samagra,
      description: t.samagraDesc,
      color: 'bg-gradient-to-br from-red-400 to-red-600',
      icon: '📊',
    },
    {
      id: 6,
      slug: 'e-pathshala-resources',
      title: t.ePathshala,
      description: t.ePathshalaDesc,
      color: 'bg-gradient-to-br from-teal-400 to-teal-600',
      icon: '🎓',
    },
  ];

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: t.realTimeTracking, desc: t.realTimeTrackingDesc },
    { icon: <BarChart3 className="w-6 h-6" />, title: t.smartAnalytics, desc: t.smartAnalyticsDesc },
    { icon: <Shield className="w-6 h-6" />, title: t.secureData, desc: t.secureDataDesc },
    { icon: <Users className="w-6 h-6" />, title: t.multiRoleAccess, desc: t.multiRoleAccessDesc },
  ];

  const searchTargets = [
    {
      id: 'hero',
      label: t.heroTitle,
      description: t.heroSubtitle,
      keywords: ['home', 'top', 'overview', 'start'],
      offset: 120,
    },
    {
      id: 'roles',
      label: t.roles,
      description: t.chooseRole,
      keywords: ['login', 'roles', 'access'],
      offset: 150,
    },
    {
      id: 'features',
      label: t.features,
      description: t.heroSubtitle,
      keywords: ['benefits', 'features', 'why'],
      offset: 150,
    },
    {
      id: 'notices',
      label: t.updates,
      description: t.latestUpdates,
      keywords: ['updates', 'news', 'notices'],
      offset: 150,
    },
    {
      id: 'programs',
      label: t.govtProgramsTitle,
      description: t.govtProgramsSubtitle,
      keywords: ['schemes', 'programs', 'government'],
      offset: 150,
    },
    {
      id: 'contact',
      label: t.contact,
      description: t.help,
      keywords: ['contact', 'support', 'help'],
      offset: 150,
    },
  ];

  const scrollToSection = (section: 'hero' | 'roles') => {
    const targetRef = section === 'hero' ? heroRef : rolesRef;
    const offset = section === 'hero' ? 120 : 150;
    if (targetRef.current) {
      scrollWithOffset(targetRef.current, offset);
      return;
    }
    const fallbackId = section === 'hero' ? 'hero' : 'roles';
    const element = document.getElementById(fallbackId);
    if (element) {
      scrollWithOffset(element, offset);
    }
  };

  const scrollToId = (targetId: string, offset = 150) => {
    const element = document.getElementById(targetId);
    if (element) {
      scrollWithOffset(element, offset);
    }
  };

  const handleSearchSelect = (targetId: string, offset = 150) => {
    scrollToId(targetId, offset);
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsMenuOpen(false);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTargets = searchTargets.filter((target) => {
    if (!normalizedQuery) {
      return true;
    }
    const haystack = `${target.label} ${target.description}`.toLowerCase();
    const keywordMatch = target.keywords?.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));
    return haystack.includes(normalizedQuery) || Boolean(keywordMatch);
  });
  const visibleTargets = filteredTargets.slice(0, 6);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstMatch = visibleTargets[0];
    if (firstMatch) {
      handleSearchSelect(firstMatch.id, firstMatch.offset);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const handlePrimaryNavigation = () => {
    const isAtTop = scrollY <= 10;
    if (isAtTop) {
      scrollToSection('roles');
    } else {
      scrollToSection('hero');
    }
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsMenuOpen(false);
  };

  const handleRoleLogin = (roleId: string) => {
    setActiveRole(roleId);
    switch (roleId) {
      case 'student':
        router.push('/login/student');
        break;
      case 'teacher':
        router.push('/login/teacher');
        break;
      case 'principal':
        router.push('/login/principal');
        break;
      case 'government':
        router.push('/login/government');
        break;
      default:
        router.push('/roles');
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950 overflow-x-hidden">
      {/* Government Header - UX4G Style */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 text-xs sm:text-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-semibold">🇮🇳</div>
            <span className="font-semibold tracking-wide">{t.govtOfIndia}</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrimaryNavigation}
              className="hidden sm:inline cursor-pointer hover:opacity-80 transition"
            >
              {t.skipToMain}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition outline-none">
                  <span>🌐</span>
                  {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'ਪੰਜਾਬੀ'}
                  <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')} className="cursor-pointer">
                  हिंदी (Hindi)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('pa')} className="cursor-pointer">
                  ਪੰਜਾਬੀ (Punjabi)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Navigation - UX4G Style */}
      <nav className="fixed top-10 sm:top-11 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Image
                src="/pragati-logo.png"
                alt="PRAGATI logo"
                width={80}
                height={80}
                priority
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.appName}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t.appSubtitle}</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <div className="group relative">
                <button className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary flex items-center gap-1 transition">
                  {t.activities} <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <a href="#roles" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition">
                {t.roles}
              </a>
              <a href="#programs" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition">
                {t.programs}
              </a>
              <a href="#notices" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition">
                {t.updates}
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition">
                {t.help}
              </a>
              <div className="ml-3 flex items-center gap-2">
                <Button
                  onClick={() => router.push('/get-api')}
                  variant="default"
                  size="default"
                >
                  Get API
                </Button>
                <Button
                  onClick={handleScrollToFooter}
                  variant="default"
                  size="default"
                >
                  Get App
                </Button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsSearchOpen((prev) => !prev);
                  setIsMenuOpen(false);
                }}
                aria-label="Search sections"
                aria-expanded={isSearchOpen}
                className={`p-2 rounded-lg transition border border-transparent hover:border-primary/30 ${
                  isSearchOpen ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/roles')}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white cursor-pointer font-bold hover:shadow-lg hover:shadow-red-400/40 transition"
              >
                👤
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <a href="#roles" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                {t.roles}
              </a>
              <a href="#programs" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                {t.programs}
              </a>
              <a href="#notices" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                {t.updates}
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push('/get-api');
                }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
              >
                Get API
              </button>
            </div>
          )}
        </div>
      </nav>

      {isSearchOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Section search"
            className="fixed inset-x-4 top-[7.5rem] sm:top-32 sm:inset-auto sm:right-8 sm:left-auto z-50 w-auto sm:w-[420px] max-h-[80vh] overflow-hidden bg-white/95 dark:bg-slate-900/95 border border-white/30 dark:border-white/10 rounded-3xl shadow-2xl transition-transform duration-300 ease-out"
          >
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-white/20 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.quickSearch}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t.close}
                </button>
              </div>
              <label htmlFor="section-search" className="sr-only">
                {t.quickSearch}
              </label>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-2 rounded-2xl">
                <Search className="w-4 h-4 text-primary" />
                <input
                  ref={searchInputRef}
                  id="section-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
                />
              </div>
            </form>
            <div className="max-h-[60vh] overflow-y-auto">
              {visibleTargets.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t.noMatches}</p>
              ) : (
                visibleTargets.map((target, idx) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => handleSearchSelect(target.id, target.offset)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition ${
                      idx % 2 === 0 ? 'bg-white/60 dark:bg-white/5' : 'bg-white/40 dark:bg-white/0'
                    } hover:bg-primary/10`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{target.label}</p>
                      <p className="text-xs text-muted-foreground">{target.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">{t.jump}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Hero Section - UX4G Style */}
      <section
        id="hero"
        ref={heroRef}
        tabIndex={-1}
        className="relative min-h-screen flex items-center justify-center pt-32 sm:pt-40 pb-20 overflow-hidden scroll-mt-32 sm:scroll-mt-40 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      >
        {/* UX4G Style Background with Grid Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Decorative Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div
            className="absolute w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ top: '10%', left: '10%' }}
          />
          <div
            className="absolute w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ top: '50%', right: '10%', animationDelay: '2s' }}
          />
          <div
            className="absolute w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ bottom: '10%', left: '50%', animationDelay: '4s' }}
          />
          {heroGlow && (
            <div
              className="absolute w-80 h-80 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent rounded-full blur-3xl opacity-60 transition-transform duration-150 ease-out"
              style={{
                transform: `translate3d(${heroGlow.x - 160}px, ${heroGlow.y - 160}px, 0)`,
              }}
            />
          )}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-white/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-sm shadow-primary/10 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-down">
              <span className="relative text-sm font-semibold text-primary">
                <span className="absolute inset-0 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">{t.govtInitiative}</span>
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text">{t.appName}</span>
              <br />
              <span className="block mt-3 text-foreground">{t.heroTitle}</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={handlePrimaryNavigation}
                className="px-8 py-3.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary-600 shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                {t.getStarted} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition inline-block ml-2" />
              </button>
              <button className="px-8 py-3.5 bg-white dark:bg-slate-800 text-primary dark:text-white border-2 border-primary dark:border-primary rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-slate-700 transition-all duration-200">
                {t.learnMore}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access Section - UX4G Style */}
      <section
        id="roles"
        ref={rolesRef}
        tabIndex={-1}
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-20 bg-gray-50 dark:bg-slate-800 scroll-mt-40 overflow-hidden"
      >
        {/* UX4G Decorative Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {t.chooseRole} <span className="gradient-text"></span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              {t.accessDashboard}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onMouseEnter={() => setActiveRole(role.id)}
                onFocus={() => setActiveRole(role.id)}
                onMouseLeave={() => setActiveRole(null)}
                onBlur={() => setActiveRole(null)}
                onClick={() => handleRoleLogin(role.id)}
                className={`rounded-xl border-2 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden ${
                  activeRole === role.id
                    ? 'border-primary shadow-md shadow-primary/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                {/* Icon and basic info */}
                <div className="p-3 sm:p-4 flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${role.color} text-white flex-shrink-0`}
                  >
                    {role.icon}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm mb-1">{role.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{role.description}</p>
                  
                  {/* Login Button inside card - UX4G Style */}
                  <div
                    className={`w-full px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 group ${
                      activeRole === role.id
                        ? `bg-primary text-white shadow-md`
                        : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.login} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition inline-block ml-1" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        tabIndex={-1}
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-40 bg-white dark:bg-slate-900 relative overflow-hidden"
      >
        {/* UX4G Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              {t.features} <span className="gradient-text"></span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md hover:-translate-y-1 group flex flex-col items-center text-center"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white mb-2 sm:mb-3 group-hover:scale-110 transition text-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="notices"
        tabIndex={-1}
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-800 scroll-mt-40 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="max-w-4xl mx-auto relative z-10">
          {/* UX4G Decorative Corner */}
          <div className="absolute -top-10 -left-10 w-16 h-16 border-l-4 border-t-4 border-primary/20 rounded-tl-2xl hidden lg:block" />
          <div className="absolute -bottom-10 -right-10 w-16 h-16 border-r-4 border-b-4 border-primary/20 rounded-br-2xl hidden lg:block" />

          <div className="mb-6 sm:mb-8 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">{t.latestUpdates}</h2>
              <p className="text-sm sm:text-base text-muted-foreground">{t.verifiedNotices}</p>
            </div>
            <span className="hidden sm:inline text-[11px] text-muted-foreground">{t.showingNotices}</span>
          </div>

          <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.campusNotices}</p>
                <h3 className="text-sm sm:text-base font-semibold">{t.digitalBoard}</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{t.live}</span>
            </div>

            {isNoticesLoading ? (
              <p className="text-sm text-muted-foreground">{t.loadingUpdates}</p>
            ) : noticeError ? (
              <p className="text-sm text-red-500">{t.unableToLoadNotices}</p>
            ) : publicNotices.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noNotices}</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {publicNotices.slice(0, 5).map((notice) => (
                  <div key={notice.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-slate-800 hover:border-primary transition-colors">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <h4 className="font-semibold text-xs sm:text-sm truncate">{notice.title}</h4>
                      {notice.priority ? (
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          {t.priority} {notice.priority}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{notice.body}</p>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-between mt-1.5">
                      <span>{formatDate(notice.activeFrom)}</span>
                      {notice.schoolId ? <span>{t.school} #{notice.schoolId}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Government Programs Section - UX4G Style */}
      <section
        id="programs"
        tabIndex={-1}
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 scroll-mt-40 relative overflow-hidden"
      >
        {/* UX4G Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t.govtProgramsTitle}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.govtProgramsSubtitle}</p>
          </div>

          {/* Banners Carousel */}
          <div className="relative sm:px-12">
            <button
              onClick={() => bannersRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition border border-gray-200 dark:border-gray-700 text-primary"
              aria-label="Previous program"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={bannersRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {governmentPrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex-shrink-0 w-full sm:w-80 snap-start"
                >
                  <div className={`${program.color} rounded-2xl p-4 sm:p-6 text-white h-full flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
                    <div>
                      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{program.icon}</div>
                      <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{program.title}</h3>
                      <p className="text-xs sm:text-sm text-white/90">{program.description}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/programs/${program.slug}`)}
                      className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-white/80 hover:text-white flex items-center gap-2 transition"
                    >
                      {t.learnMore} <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => bannersRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition border border-gray-200 dark:border-gray-700 text-primary"
              aria-label="Next program"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile scroll indicator */}
          <div className="sm:hidden text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            {t.swipeToSeeMore}
          </div>
        </div>
      </section>

      {/* Download App Section - Above Footer */}
      <section
        ref={footerRef}
        className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            {/* Left side - Phone Mockups */}
            <div className="flex-shrink-0 flex items-end justify-center gap-[-20px] relative">
              {/* Phone 1 - Teacher App */}
              <div className="relative w-40 sm:w-48 -mr-8 z-10 transform -rotate-6">
                <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                  <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] overflow-hidden">
                    <div className="bg-primary/10 h-6 flex items-center justify-center">
                      <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="p-3 h-64 sm:h-80 flex flex-col">
                      <div className="text-[8px] sm:text-[10px] font-bold text-gray-800 dark:text-gray-200 mb-2">Teacher Dashboard</div>
                      <div className="flex-1 space-y-2">
                        <div className="bg-primary/20 rounded-lg p-2">
                          <div className="w-12 h-1.5 bg-primary/40 rounded mb-1"></div>
                          <div className="w-8 h-1 bg-gray-300 rounded"></div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
                          <div className="w-10 h-1.5 bg-green-400 rounded mb-1"></div>
                          <div className="w-6 h-1 bg-gray-300 rounded"></div>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                          <div className="w-14 h-1.5 bg-blue-400 rounded mb-1"></div>
                          <div className="w-8 h-1 bg-gray-300 rounded"></div>
                        </div>
                        <div className="mt-3 bg-primary rounded-lg p-2 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white rounded"></div>
                          <span className="text-[6px] sm:text-[8px] text-white ml-1">Scan QR</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Phone 2 - Student App */}
              <div className="relative w-44 sm:w-52 z-20 transform rotate-3">
                <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                  <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] overflow-hidden">
                    <div className="bg-orange-100 h-6 flex items-center justify-center">
                      <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="p-3 h-72 sm:h-88 flex flex-col">
                      <div className="text-[8px] sm:text-[10px] font-bold text-gray-800 dark:text-gray-200 mb-1">Welcome Student</div>
                      <div className="text-[6px] sm:text-[8px] text-gray-500 mb-3">Class X • Section A</div>
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-1.5">
                            <div className="w-6 h-6 bg-orange-200 rounded mb-1"></div>
                            <div className="w-8 h-1 bg-gray-300 rounded"></div>
                          </div>
                          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-1.5">
                            <div className="w-6 h-6 bg-blue-200 rounded mb-1"></div>
                            <div className="w-8 h-1 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                          <div className="w-12 h-1.5 bg-gray-400 rounded mb-2"></div>
                          <div className="flex gap-1">
                            <div className="w-8 h-8 bg-primary/20 rounded"></div>
                            <div className="w-8 h-8 bg-green-200 rounded"></div>
                            <div className="w-8 h-8 bg-blue-200 rounded"></div>
                          </div>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-2">
                          <div className="w-10 h-1 bg-primary/40 rounded mb-1"></div>
                          <div className="flex gap-0.5">
                            <div className="w-4 h-4 bg-primary/30 rounded-full"></div>
                            <div className="w-4 h-4 bg-green-300 rounded-full"></div>
                            <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                            <div className="w-4 h-4 bg-orange-300 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Text, QR and CTA */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Download <span className="text-primary">Pragati Mobile Apps</span> Today!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-lg">
                Get our mobile apps for quick attendance marking and student progress tracking. Available for Android devices.
              </p>
              
              {/* Two app download cards */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                {/* Teacher App Card */}
                <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-2xl transition-shadow">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-1">Teacher App</h4>
                  <p className="text-sm text-muted-foreground mb-4">QR-based Attendance Marking</p>
                  <ApkQRCode apkUrl="/app-release.apk" size={140} />
                </div>

                {/* Student App Card */}
                <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-2xl transition-shadow">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-1">Student App</h4>
                  <p className="text-sm text-muted-foreground mb-4">Track Attendance & Progress</p>
                  <ApkQRCode apkUrl="/student.apk" size={140} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - UX4G Style */}
      <footer
        id="contact"
        tabIndex={-1}
        className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 scroll-mt-40 relative overflow-hidden"
      >
        {/* UX4G Dot Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Image
                  src="/pragati-logo.png"
                  alt="PRAGATI logo"
                  width={100}
                  height={56}
                  className="h-14 w-auto object-contain drop-shadow"
                />
                <span className="font-bold text-sm sm:text-base">{t.appName}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t.footerTagline}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t.product}</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">{t.features}</a></li>
                <li><a href="#" className="hover:text-primary transition">{t.pricing}</a></li>
                <li><a href="#" className="hover:text-primary transition">{t.security}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t.company}</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-primary transition">{t.aboutUs}</a></li>
                <li><a href="/blog" className="hover:text-primary transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t.legal}</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-primary transition">{t.privacy}</a></li>
                <li><a href="/terms" className="hover:text-primary transition">{t.terms}</a></li>
                <li><a href="/contact" className="hover:text-primary transition">{t.contact}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2025 {t.appName}. {t.rightsReserved}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
