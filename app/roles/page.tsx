'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Users, BarChart3, Shield, ArrowLeft, ChevronRight, ChevronDown, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RoleSelectionPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const translations = {
    en: {
      govtOfIndia: 'GOVERNMENT OF INDIA',
      backToHome: 'Back to home',
      chooseHowToContinue: 'Choose how you want to continue',
      selectYourRole: 'Select your',
      pragatiRole: 'Pragati role',
      rolePageDesc: 'Each role gets a tailored dashboard, so we can show you the right tools, reports and actions as soon as you sign in.',
      student: 'Student',
      studentDesc: 'View timetable, homework, marks and attendance in one place.',
      badgeLearn: 'Learn',
      teacher: 'Teacher',
      teacherDesc: 'Mark attendance in seconds and track classroom progress.',
      badgeTeach: 'Teach',
      principal: 'Principal / Head',
      principalDesc: 'Monitor school performance, staff attendance and key indicators.',
      badgeLead: 'Lead',
      government: 'District / Govt Official',
      governmentDesc: 'Access compliance reports and district-wide analytics securely.',
      badgeGovern: 'Govern',
      admin: 'Platform Admin',
      adminDesc: 'Manage platform-wide entities and operational configuration.',
      badgeAdmin: 'Admin',
      login: 'Login',
      needAccount: 'Need an account? Contact your school administrator or district coordinator for account creation.',
      rightsReserved: 'All rights reserved.',
    },
    hi: {
      govtOfIndia: 'भारत सरकार',
      backToHome: 'घर वापस जाएं',
      chooseHowToContinue: 'चुनें कि आप कैसे जारी रखना चाहते हैं',
      selectYourRole: 'अपनी',
      pragatiRole: 'प्रगति भूमिका चुनें',
      rolePageDesc: 'प्रत्येक भूमिका को एक अनुरूप डैशबोर्ड मिलता है, ताकि हम आपको साइन इन करते ही सही उपकरण, रिपोर्ट और कार्रवाई दिखा सकें।',
      student: 'छात्र',
      studentDesc: 'एक ही स्थान पर समय सारिणी, गृहकार्य, अंक और उपस्थिति देखें।',
      badgeLearn: 'सीखें',
      teacher: 'शिक्षक',
      teacherDesc: 'सेकंड में उपस्थिति दर्ज करें और कक्षा की प्रगति को ट्रैक करें।',
      badgeTeach: 'सिखाएं',
      principal: 'प्रधानाचार्य / प्रमुख',
      principalDesc: 'स्कूल के प्रदर्शन, कर्मचारियों की उपस्थिति और प्रमुख संकेतकों की निगरानी करें।',
      badgeLead: 'नेतृत्व',
      government: 'जिला / सरकारी अधिकारी',
      governmentDesc: 'अनुपालन रिपोर्ट और जिला-व्यापी विश्लेषण सुरक्षित रूप से एक्सेस करें।',
      badgeGovern: 'शासन',
      admin: 'प्लेटफ़ॉर्म एडमिन',
      adminDesc: 'प्लेटफ़ॉर्म-स्तरीय इकाइयों और संचालन कॉन्फ़िगरेशन का प्रबंधन करें।',
      badgeAdmin: 'एडमिन',
      login: 'लॉग इन करें',
      needAccount: 'खाते की आवश्यकता है? खाता निर्माण के लिए अपने स्कूल प्रशासक या जिला समन्वयक से संपर्क करें।',
      rightsReserved: 'सर्वाधिकार सुरक्षित।',
    },
    pa: {
      govtOfIndia: 'ਭਾਰਤ ਸਰਕਾਰ',
      backToHome: 'ਘਰ ਵਾਪਸ ਜਾਓ',
      chooseHowToContinue: 'ਚੁਣੋ ਕਿ ਤੁਸੀਂ ਕਿਵੇਂ ਜਾਰੀ ਰੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ',
      selectYourRole: 'ਆਪਣੀ',
      pragatiRole: 'ਪ੍ਰਗਤੀ ਭੂਮਿਕਾ ਚੁਣੋ',
      rolePageDesc: 'ਹਰੇਕ ਭੂਮਿਕਾ ਨੂੰ ਇੱਕ ਅਨੁਕੂਲਿਤ ਡੈਸ਼ਬੋਰਡ ਮਿਲਦਾ ਹੈ, ਤਾਂ ਜੋ ਅਸੀਂ ਤੁਹਾਨੂੰ ਸਾਈਨ ਇਨ ਕਰਦੇ ਹੀ ਸਹੀ ਟੂਲ, ਰਿਪੋਰਟਾਂ ਅਤੇ ਕਾਰਵਾਈਆਂ ਦਿਖਾ ਸਕੀਏ।',
      student: 'ਵਿਦਿਆਰਥੀ',
      studentDesc: 'ਇੱਕ ਥਾਂ ਤੇ ਸਮਾਂ ਸਾਰਣੀ, ਹੋਮਵਰਕ, ਅੰਕ ਅਤੇ ਹਾਜ਼ਰੀ ਦੇਖੋ।',
      badgeLearn: 'ਸਿੱਖੋ',
      teacher: 'ਅਧਿਆਪਕ',
      teacherDesc: 'ਸਕਿੰਟਾਂ ਵਿੱਚ ਹਾਜ਼ਰੀ ਲਗਾਓ ਅਤੇ ਕਲਾਸਰੂਮ ਦੀ ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰੋ।',
      badgeTeach: 'ਸਿਖਾਓ',
      principal: 'ਪ੍ਰਿੰਸੀਪਲ / ਮੁਖੀ',
      principalDesc: 'ਸਕੂਲ ਦੀ ਕਾਰਗੁਜ਼ਾਰੀ, ਸਟਾਫ ਦੀ ਹਾਜ਼ਰੀ ਅਤੇ ਮੁੱਖ ਸੰਕੇਤਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।',
      badgeLead: 'ਲੀਡ',
      government: 'ਜ਼ਿਲ੍ਹਾ / ਸਰਕਾਰੀ ਅਧਿਕਾਰੀ',
      governmentDesc: 'ਪਾਲਣਾ ਰਿਪੋਰਟਾਂ ਅਤੇ ਜ਼ਿਲ੍ਹਾ-ਵਿਆਪੀ ਵਿਸ਼ਲੇਸ਼ਣ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਐਕਸੈਸ ਕਰੋ।',
      badgeGovern: 'ਸ਼ਾਸਨ',
      admin: 'ਪਲੇਟਫਾਰਮ ਐਡਮਿਨ',
      adminDesc: 'ਪਲੇਟਫਾਰਮ-ਪੱਧਰ ਇਕਾਈਆਂ ਅਤੇ ਓਪਰੇਸ਼ਨ ਕਾਨਫਿਗਰੇਸ਼ਨ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।',
      badgeAdmin: 'ਐਡਮਿਨ',
      login: 'ਲੌਗ ਇਨ ਕਰੋ',
      needAccount: 'ਖਾਤੇ ਦੀ ਲੋੜ ਹੈ? ਖਾਤਾ ਬਣਾਉਣ ਲਈ ਆਪਣੇ ਸਕੂਲ ਪ੍ਰਸ਼ਾਸਕ ਜਾਂ ਜ਼ਿਲ੍ਹਾ ਕੋਆਰਡੀਨੇਟਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
      rightsReserved: 'ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ।',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const roles = [
    {
      id: 'student',
      title: t.student,
      description: t.studentDesc,
      icon: BookOpen,
      accent: 'from-blue-500 to-cyan-500',
      badge: t.badgeLearn,
    },
    {
      id: 'teacher',
      title: t.teacher,
      description: t.teacherDesc,
      icon: Users,
      accent: 'from-emerald-500 to-teal-500',
      badge: t.badgeTeach,
    },
    {
      id: 'principal',
      title: t.principal,
      description: t.principalDesc,
      icon: BarChart3,
      accent: 'from-orange-500 to-rose-500',
      badge: t.badgeLead,
    },
    {
      id: 'government',
      title: t.government,
      description: t.governmentDesc,
      icon: Shield,
      accent: 'from-purple-500 to-indigo-500',
      badge: t.badgeGovern,
    },
    {
      id: 'admin',
      title: t.admin,
      description: t.adminDesc,
      icon: Settings,
      accent: 'from-slate-700 to-slate-500',
      badge: t.badgeAdmin,
    },
  ];

  const handleSelect = (roleId: string) => {
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
      case 'admin':
        router.push('/login/admin');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Government Header - UX4G Style */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 text-xs sm:text-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-semibold">🇮🇳</div>
            <span className="font-semibold tracking-wide">{t.govtOfIndia}</span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">
                  <span>🌐</span>
                  {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'ਪੰਜਾਬੀ'}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')}>हिंदी</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('pa')}>ਪੰਜਾਬੀ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <header className="px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-primary/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center relative">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs border border-white/60 bg-white/60 dark:bg-slate-900/60 shadow-sm backdrop-blur-xl mb-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.chooseHowToContinue}
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              {t.selectYourRole} <span className="gradient-text">{t.pragatiRole}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
              {t.rolePageDesc}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6"
          >
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => handleSelect(role.id)}
                className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-border/50 p-5 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${role.accent}`} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 group-hover:bg-primary/5 transition-colors duration-300`}>
                    <role.icon className={`w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300`} />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300 uppercase tracking-wide`}>
                    {role.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {role.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 group-hover:text-foreground/80 transition-colors line-clamp-3">
                  {role.description}
                </p>

                <div className="flex items-center text-xs font-semibold text-muted-foreground/70 group-hover:text-primary transition-colors mt-auto">
                  {t.login} <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 text-center text-[10px] sm:text-xs text-muted-foreground/60 max-w-lg mx-auto"
          >
            <p>{t.needAccount}</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} Pragati Platform. {t.rightsReserved}</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
