'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Users,
  Target,
  Heart,
  Award,
  Lightbulb,
  Shield,
  GraduationCap,
  MapPin,
  CheckCircle,
  Star,
  Phone,
  Mail,
  Clock,
  Building2,
  Calendar,
  TrendingUp,
  FileText,
  HelpCircle
} from 'lucide-react';

type Language = 'en' | 'hi' | 'pa';

const translations = {
  en: {
    governmentOfPunjab: 'PRAGATI',
    department: 'Smart Attendance for Smarter Schools',
    backToHome: 'Back to Home',
    pageTitle: 'About Us',
    pageSubtitle: 'Transforming education through technology and innovation',
    
    // Ownership & Trust Section
    ownershipTitle: 'Ownership & Project Info',
    ownershipText: 'PRAGATI is an independently developed platform project built around an SIH 2026 problem statement from the Ministry of Education and Government of Punjab.',
    ownerDetails: {
      organization: 'Independent Personal Project',
      ministry: 'Problem statement source: Ministry of Education & Government of Punjab',
      projectType: 'SIH 2026 Problem Statement Implementation',
      developedBy: 'PRAGATI Platform Team'
    },
    
    // Contact Information
    contactTitle: 'Contact Information',
    contactSubtitle: 'Get in touch for feedback, collaboration, or support',
    contactDetails: {
      email: 'contact@pragati-platform.test',
      phone: '+91 90000 00000',
      alternatePhone: '+91 90000 00001',
      address: 'Remote / India',
      workingHours: 'Monday to Saturday, 10:00 AM - 7:00 PM IST',
      supportEmail: 'support@pragati-platform.test'
    },
    
    // Mission & Vision
    missionTitle: 'Our Mission',
    missionText: 'To simplify school operations through a practical, technology-driven platform that improves attendance tracking, communication, and academic visibility for all stakeholders.',
    
    visionTitle: 'Our Vision',
    visionText: 'To build a scalable and user-friendly education platform model that can be adapted by schools and communities anywhere.',
    
    // About Section
    aboutTitle: 'About PRAGATI',
    aboutText: `PRAGATI is a personal project built to improve day-to-day school management through modern web technology. The platform focuses on attendance visibility, role-based workflows, analytics, and accessible interfaces.

  "Smart Attendance for Smarter Schools" defines this product direction. The implementation aligns with SIH 2026 • MoE & Govt. of Punjab.`,
    
    // History & Timeline
    historyTitle: 'Our Journey',
    historySubtitle: 'From idea to implementation',
    timeline: [
      { year: '2024', month: 'October', event: 'Concept and Planning', description: 'Defined the problem scope and product architecture for school workflow management.' },
      { year: '2024', month: 'November', event: 'Core Development Started', description: 'Implemented authentication, attendance tracking, and role-based dashboards.' },
      { year: '2024', month: 'December', event: 'Testing and Iteration', description: 'Improved reliability, UX, and edge-case handling based on testing feedback.' },
      { year: '2025', month: 'January', event: 'Feature Expansion', description: 'Added analytics, reporting, and multi-role operational modules.' },
      { year: '2025', month: 'Future', event: 'Continuous Improvement', description: 'Planned roadmap includes broader integrations and production hardening.' }
    ],
    
    // Key Achievements
    achievementsTitle: 'Key Achievements & Milestones',
    achievements: [
      { title: 'End-to-End Platform Build', description: 'Built and integrated frontend, backend, and role-based workflows.' },
      { title: 'Geo-Fencing Technology', description: 'First-of-its-kind GPS-based attendance verification for schools' },
      { title: 'Multi-language Support', description: 'Platform available in English, Hindi, and Punjabi' },
      { title: 'Mobile-First Design', description: 'Optimized for low-bandwidth rural areas' },
      { title: 'Real-time Analytics', description: 'Instant insights for better decision making' },
      { title: 'WCAG Compliant', description: 'Accessible to users with disabilities' }
    ],
    
    // Key Features
    featuresTitle: 'What Makes Us Different',
    features: [
      {
        icon: MapPin,
        title: 'Geo-Fenced Attendance',
        description: 'Accurate, tamper-proof attendance tracking using GPS technology'
      },
      {
        icon: GraduationCap,
        title: 'Student-Centric Design',
        description: 'Built with students at the heart of every decision'
      },
      {
        icon: Shield,
        title: 'Data Security',
        description: 'Enterprise-grade security for sensitive educational data'
      },
      {
        icon: Lightbulb,
        title: 'Smart Analytics',
        description: 'AI-powered insights for better educational outcomes'
      }
    ],
    
    // Values
    valuesTitle: 'Our Core Values',
    values: [
      {
        icon: Heart,
        title: 'Student First',
        description: 'Every feature we build prioritizes student welfare and learning outcomes'
      },
      {
        icon: Target,
        title: 'Excellence',
        description: 'We strive for excellence in every aspect of our platform'
      },
      {
        icon: Users,
        title: 'Inclusivity',
        description: 'Designed to work for every school, regardless of infrastructure'
      },
      {
        icon: Award,
        title: 'Innovation',
        description: 'Continuously evolving to meet the changing needs of education'
      }
    ],
    
    // Leadership Team
    teamTitle: 'Our Leadership Team',
    teamSubtitle: 'Meet the people driving Pragati forward',
    teamMembers: [
      { 
        name: 'PRAGATI Platform Team', 
        role: 'Product & Engineering', 
        bio: 'Designing, building, and evolving PRAGATI as a practical education technology platform.',
        department: 'Platform Development Unit'
      }
    ],
    
    // Transparency Section
    transparencyTitle: 'Transparency & Operations',
    transparencyText: 'This project is built with a transparency-first mindset. It provides clear operational visibility through attendance insights, reports, and auditable records.',
    transparencyPoints: [
      'All attendance data is securely stored and can be audited',
      'Reports and dashboards are generated for stakeholders and administrators',
      'Open communication channels for feedback and grievances',
      'Data handling practices follow privacy-first engineering standards'
    ],
    
    // Data Handling
    dataHandlingTitle: 'Data Handling & Privacy',
    dataHandlingText: 'We take your privacy seriously. All personal information is collected, processed, and stored in accordance with applicable Indian laws including the Information Technology Act, 2000.',
    dataHandlingPoints: [
      'Personal data is encrypted in transit and at rest',
      'Access is restricted to authorized personnel only',
      'Data is not shared with third parties for commercial purposes',
      'Users can request access to or deletion of their data'
    ],
    
    // SIH Section
    sihTitle: 'Personal Project Spotlight',
    sihText: 'PRAGATI is an independently developed platform project focused on delivering impactful, real-world education management workflows.',
    
    // FAQ Section
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      { q: 'What is Pragati?', a: 'Pragati is a digital platform for managing attendance, academics, and communication workflows in schools.' },
      { q: 'Who can use this platform?', a: 'Students, teachers, principals, administrators, and education teams depending on deployment setup.' },
      { q: 'Is my data safe?', a: 'Yes, we use enterprise-grade encryption and follow strict data protection practices as per IT Act 2000.' },
      { q: 'How do I get support?', a: 'You can reach us at support@pragati-platform.test during working hours.' }
    ],
    
    // CTA
    ctaTitle: 'Join Us in Transforming Education',
    ctaText: 'Be a part of building better education workflows with technology',
    ctaButton: 'Get Started',
    
    // Legal Links
    legalTitle: 'Legal & Policies',
    relatedLinks: 'Quick Links',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contactUs: 'Contact Us',
    helpCenter: 'Help Center',
    copyright: '© 2026 Pragati. All rights reserved.',
    governmentPortal: 'SIH 2026 • MoE & Govt. of Punjab'
  },
  hi: {
    governmentOfPunjab: 'पंजाब सरकार',
    department: 'स्कूल शिक्षा विभाग',
    backToHome: 'होम पेज पर वापस',
    pageTitle: 'हमारे बारे में',
    pageSubtitle: 'प्रौद्योगिकी और नवाचार के माध्यम से शिक्षा का परिवर्तन',
    ownershipTitle: 'स्वामित्व और शासन',
    ownershipText: '',
    ownerDetails: { organization: '', ministry: '', projectType: '', developedBy: '' },
    contactTitle: 'संपर्क जानकारी',
    contactSubtitle: '',
    contactDetails: { email: '', phone: '', alternatePhone: '', address: '', workingHours: '', supportEmail: '' },
    missionTitle: 'हमारा मिशन',
    missionText: '',
    visionTitle: 'हमारी दृष्टि',
    visionText: '',
    aboutTitle: 'प्रगति ई-पंजाब स्कूल के बारे में',
    aboutText: '',
    historyTitle: 'हमारी यात्रा',
    historySubtitle: '',
    timeline: [],
    achievementsTitle: 'प्रमुख उपलब्धियां',
    achievements: [],
    featuresTitle: 'हमें क्या अलग बनाता है',
    features: [],
    valuesTitle: 'हमारे मूल मूल्य',
    values: [],
    teamTitle: 'हमारी नेतृत्व टीम',
    teamSubtitle: '',
    teamMembers: [],
    transparencyTitle: 'पारदर्शिता और संचालन',
    transparencyText: '',
    transparencyPoints: [],
    dataHandlingTitle: 'डेटा हैंडलिंग और गोपनीयता',
    dataHandlingText: '',
    dataHandlingPoints: [],
    sihTitle: 'स्मार्ट इंडिया हैकाथॉन 2025',
    sihText: '',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    faqs: [],
    ctaTitle: 'शिक्षा को बदलने में हमारे साथ जुड़ें',
    ctaText: '',
    ctaButton: 'शुरू करें',
    legalTitle: 'कानूनी और नीतियां',
    relatedLinks: 'त्वरित लिंक',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    contactUs: 'संपर्क करें',
    helpCenter: 'सहायता केंद्र',
    copyright: '© 2025 प्रगति ई-पंजाब स्कूल। सर्वाधिकार सुरक्षित।',
    governmentPortal: 'आदर्श पांडे द्वारा एक व्यक्तिगत परियोजना'
  },
  pa: {
    governmentOfPunjab: 'ਪੰਜਾਬ ਸਰਕਾਰ',
    department: 'ਸਕੂਲ ਸਿੱਖਿਆ ਵਿਭਾਗ',
    backToHome: 'ਮੁੱਖ ਪੰਨੇ ਤੇ ਵਾਪਸ',
    pageTitle: 'ਸਾਡੇ ਬਾਰੇ',
    pageSubtitle: 'ਤਕਨਾਲੋਜੀ ਅਤੇ ਨਵੀਨਤਾ ਰਾਹੀਂ ਸਿੱਖਿਆ ਨੂੰ ਬਦਲਣਾ',
    ownershipTitle: 'ਮਾਲਕੀ ਅਤੇ ਸ਼ਾਸਨ',
    ownershipText: '',
    ownerDetails: { organization: '', ministry: '', projectType: '', developedBy: '' },
    contactTitle: 'ਸੰਪਰਕ ਜਾਣਕਾਰੀ',
    contactSubtitle: '',
    contactDetails: { email: '', phone: '', alternatePhone: '', address: '', workingHours: '', supportEmail: '' },
    missionTitle: 'ਸਾਡਾ ਮਿਸ਼ਨ',
    missionText: '',
    visionTitle: 'ਸਾਡੀ ਦ੍ਰਿਸ਼ਟੀ',
    visionText: '',
    aboutTitle: 'ਪ੍ਰਗਤੀ ਈ-ਪੰਜਾਬ ਸਕੂਲ ਬਾਰੇ',
    aboutText: '',
    historyTitle: 'ਸਾਡੀ ਯਾਤਰਾ',
    historySubtitle: '',
    timeline: [],
    achievementsTitle: 'ਮੁੱਖ ਪ੍ਰਾਪਤੀਆਂ',
    achievements: [],
    featuresTitle: 'ਸਾਨੂੰ ਕੀ ਵੱਖਰਾ ਬਣਾਉਂਦਾ ਹੈ',
    features: [],
    valuesTitle: 'ਸਾਡੇ ਮੁੱਖ ਮੁੱਲ',
    values: [],
    teamTitle: 'ਸਾਡੀ ਲੀਡਰਸ਼ਿਪ ਟੀਮ',
    teamSubtitle: '',
    teamMembers: [],
    transparencyTitle: 'ਪਾਰਦਰਸ਼ਤਾ ਅਤੇ ਸੰਚਾਲਨ',
    transparencyText: '',
    transparencyPoints: [],
    dataHandlingTitle: 'ਡਾਟਾ ਹੈਂਡਲਿੰਗ ਅਤੇ ਗੋਪਨੀਯਤਾ',
    dataHandlingText: '',
    dataHandlingPoints: [],
    sihTitle: 'ਸਮਾਰਟ ਇੰਡੀਆ ਹੈਕਾਥੌਨ 2025',
    sihText: '',
    faqTitle: 'ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ',
    faqs: [],
    ctaTitle: 'ਸਿੱਖਿਆ ਨੂੰ ਬਦਲਣ ਵਿੱਚ ਸਾਡੇ ਨਾਲ ਜੁੜੋ',
    ctaText: '',
    ctaButton: 'ਸ਼ੁਰੂ ਕਰੋ',
    legalTitle: 'ਕਾਨੂੰਨੀ ਅਤੇ ਨੀਤੀਆਂ',
    relatedLinks: 'ਤੇਜ਼ ਲਿੰਕ',
    privacyPolicy: 'ਗੋਪਨੀਯਤਾ ਨੀਤੀ',
    termsOfService: 'ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ',
    contactUs: 'ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
    helpCenter: 'ਮਦਦ ਕੇਂਦਰ',
    copyright: '© 2025 ਪ੍ਰਗਤੀ ਈ-ਪੰਜਾਬ ਸਕੂਲ। ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ।',
    governmentPortal: 'ਆਦਰਸ਼ ਪਾਂਡੇ ਵੱਲੋਂ ਇੱਕ ਨਿੱਜੀ ਪ੍ਰੋਜੈਕਟ'
  }
};

export default function AboutPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const features = t.features.length > 0 ? t.features : translations.en.features;
  const values = t.values.length > 0 ? t.values : translations.en.values;
  const timeline = t.timeline.length > 0 ? t.timeline : translations.en.timeline;
  const achievements = t.achievements.length > 0 ? t.achievements : translations.en.achievements;
  const teamMembers = t.teamMembers.length > 0 ? t.teamMembers : translations.en.teamMembers;
  const transparencyPoints = t.transparencyPoints.length > 0 ? t.transparencyPoints : translations.en.transparencyPoints;
  const dataHandlingPoints = t.dataHandlingPoints.length > 0 ? t.dataHandlingPoints : translations.en.dataHandlingPoints;
  const faqs = t.faqs.length > 0 ? t.faqs : translations.en.faqs;
  const missionText = t.missionText || translations.en.missionText;
  const visionText = t.visionText || translations.en.visionText;
  const aboutText = t.aboutText || translations.en.aboutText;
  const sihText = t.sihText || translations.en.sihText;
  const ownerDetails = t.ownerDetails.organization ? t.ownerDetails : translations.en.ownerDetails;
  const contactDetails = t.contactDetails.email ? t.contactDetails : translations.en.contactDetails;
  const transparencyText = t.transparencyText || translations.en.transparencyText;
  const dataHandlingText = t.dataHandlingText || translations.en.dataHandlingText;
  const ownershipText = t.ownershipText || translations.en.ownershipText;
  const contactSubtitle = t.contactSubtitle || translations.en.contactSubtitle;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/pragati-logo.png" 
              alt="Pragati Logo" 
              width={32} 
              height={36} 
              className="w-6 h-7 sm:w-8 sm:h-9 object-contain drop-shadow-sm" 
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-wide text-xs sm:text-sm uppercase">{t.governmentOfPunjab}</span>
              <span className="text-[9px] sm:text-[10px] text-white/80 font-medium">{t.department}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-1 py-0.5 rounded">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${lang === 'en' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('pa')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${lang === 'pa' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}
            >
              ਪੰ
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${lang === 'hi' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}
            >
              हि
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>
          {/* Quick Legal Links in Nav */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition">
              {t.privacyPolicy}
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition">
              {t.termsOfService}
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition">
              {t.contactUs}
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
              <Users className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t.pageTitle}</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">{t.pageSubtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Ownership & Governance Section */}
      <div className="bg-blue-50 dark:bg-blue-950/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-8 shadow-sm"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.ownershipTitle}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{ownershipText}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Organization</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{ownerDetails.organization}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Ministry</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{ownerDetails.ministry}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Star className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Project Type</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{ownerDetails.projectType}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Developed By</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{ownerDetails.developedBy}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-green-50 dark:bg-green-950/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.contactTitle}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{contactSubtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-green-800 p-6 text-center hover:shadow-lg transition">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                <a href={`mailto:${contactDetails.email}`} className="text-green-600 dark:text-green-400 hover:underline text-sm">
                  {contactDetails.email}
                </a>
                <p className="text-xs text-gray-500 mt-1">Support: {contactDetails.supportEmail}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-green-800 p-6 text-center hover:shadow-lg transition">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone</h3>
                <a href={`tel:${contactDetails.phone}`} className="text-green-600 dark:text-green-400 hover:underline text-sm">
                  {contactDetails.phone}
                </a>
                <p className="text-xs text-gray-500 mt-1">Alt: {contactDetails.alternatePhone}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-green-800 p-6 text-center hover:shadow-lg transition sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Working Hours</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{contactDetails.workingHours}</p>
              </div>
            </div>
            <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-green-800 p-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Address</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contactDetails.address}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white"
          >
            <Target className="w-10 h-10 mb-4 text-blue-200" />
            <h2 className="text-2xl font-bold mb-4">{t.missionTitle}</h2>
            <p className="text-blue-100 leading-relaxed">{missionText}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white"
          >
            <Lightbulb className="w-10 h-10 mb-4 text-purple-200" />
            <h2 className="text-2xl font-bold mb-4">{t.visionTitle}</h2>
            <p className="text-purple-100 leading-relaxed">{visionText}</p>
          </motion.div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t.aboutTitle}</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {aboutText}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Timeline / History Section */}
      <div className="bg-gray-100 dark:bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.historyTitle}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t.historySubtitle || translations.en.historySubtitle}</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-indigo-200 dark:bg-indigo-800 hidden md:block" />
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.month} {item.year}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.event}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-900 shadow hidden md:block z-10" />
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.achievementsTitle}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">{t.featuresTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="bg-gray-100 dark:bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.teamTitle}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t.teamSubtitle || translations.en.teamSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg transition"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">{member.role}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{member.department}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">{t.valuesTitle}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Transparency & Data Handling */}
      <div className="bg-white dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Transparency */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 dark:bg-slate-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.transparencyTitle}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{transparencyText}</p>
              <ul className="space-y-2">
                {transparencyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Data Handling */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-50 dark:bg-slate-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.dataHandlingTitle}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{dataHandlingText}</p>
              <ul className="space-y-2">
                {dataHandlingPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-100 dark:bg-slate-800/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.faqTitle}</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{faq.q}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Spotlight Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Star className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.sihTitle}</h2>
          <p className="text-orange-100 max-w-2xl mx-auto">{sihText}</p>
        </motion.div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t.ctaTitle}</h2>
          <p className="text-indigo-100 mb-8">{t.ctaText || translations.en.ctaText}</p>
          <Link
            href="/roles"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition"
          >
            {t.ctaButton}
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>

      {/* Legal & Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.legalTitle}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/privacy"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
              >
                <Shield className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
                  {t.privacyPolicy}
                </span>
              </Link>
              <Link
                href="/terms"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
              >
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
                  {t.termsOfService}
                </span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.relatedLinks}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/contact"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
              >
                <Mail className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
                  {t.contactUs}
                </span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
              >
                <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
                  {t.helpCenter}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="flex items-center gap-3">
              <Image
                src="/pragati-logo.png"
                alt="Pragati Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <div>
                <span className="font-semibold block">Pragati</span>
                <span className="text-xs text-gray-400">{t.governmentPortal}</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <p className="font-medium text-white mb-2">{t.contactTitle}</p>
              <p>Email: {contactDetails.email}</p>
              <p>Phone: {contactDetails.phone}</p>
            </div>
            <div className="flex items-center gap-4 md:justify-end">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition">{t.privacyPolicy}</Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition">{t.termsOfService}</Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition">{t.contactUs}</Link>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-xs text-gray-500">{t.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
