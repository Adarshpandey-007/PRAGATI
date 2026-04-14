'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Scale, 
  FileText, 
  Shield, 
  AlertCircle,
  CheckCircle,
  BookOpen,
  Gavel
} from 'lucide-react';

type Language = 'en' | 'hi' | 'pa';

const translations = {
  en: {
    governmentOfPunjab: 'PRAGATI',
    department: 'Built for SIH 2026 • MoE & Govt. of Punjab',
    backToHome: 'Back to Home',
    pageTitle: 'Legal Information',
    pageSubtitle: 'Legal framework and compliance information for PRAGATI',
    lastUpdated: 'Last Updated: December 2025',
    
    sections: [
      {
        icon: Scale,
        title: 'Legal Framework',
        content: `PRAGATI operates under the legal framework established by the Government of Punjab, India. The platform is developed and maintained in compliance with:

â€¢ Information Technology Act, 2000 and its amendments
â€¢ Right to Education Act, 2009
â€¢ Punjab School Education Act
â€¢ Personal Data Protection Bill provisions
â€¢ Government of India's Digital India initiatives

All operations are aligned with guidelines issued by the Ministry of Education, Government of India. The core problem context is sourced from an SIH 2026 problem statement by the Ministry of Education and Government of Punjab.`
      },
      {
        icon: FileText,
        title: 'Governing Laws',
        content: `This platform and its use are governed by the laws of India. Any disputes arising from the use of PRAGATI shall be subject to the exclusive jurisdiction of the courts in Chandigarh, Punjab.

Key applicable regulations:
â€¢ The Indian Contract Act, 1872
â€¢ The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011
â€¢ The Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021
â€¢ Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016`
      },
      {
        icon: Shield,
        title: 'Data Protection Compliance',
        content: `PRAGATI is committed to protecting personal data in accordance with applicable data protection laws and regulations. We implement:

â€¢ Data minimization principles
â€¢ Purpose limitation for data collection
â€¢ Secure data storage and transmission
â€¢ Regular security audits and assessments
â€¢ Incident response procedures
â€¢ Data retention policies as per government guidelines

Student data is handled with utmost care following the guidelines for protection of children's data.`
      },
      {
        icon: Gavel,
        title: 'Intellectual Property',
        content: `All content, trademarks, logos, and intellectual property on PRAGATI are owned by or licensed by the project owner unless explicitly attributed otherwise.

â€¢ The Pragati logo and name are registered trademarks
â€¢ Software and algorithms are proprietary
â€¢ Educational content is copyrighted
â€¢ Unauthorized reproduction or distribution is prohibited

Use of government emblems and symbols follows the State Emblem of India (Prohibition of Improper Use) Act, 2005.`
      },
      {
        icon: AlertCircle,
        title: 'Disclaimer',
        content: `While every effort has been made to ensure the accuracy of information on this platform:

â€¢ The Government of Punjab makes no warranties regarding the completeness or accuracy of information
â€¢ The platform is provided "as is" without any guarantees
â€¢ Users are advised to verify critical information through official channels
â€¢ The government shall not be liable for any damages arising from the use of this platform
â€¢ Technical issues or service interruptions may occur and are handled as per standard government IT protocols`
      },
      {
        icon: CheckCircle,
        title: 'Compliance Certifications',
        content: `PRAGATI maintains compliance with:

â€¢ GIGW (Guidelines for Indian Government Websites) standards
â€¢ WCAG 2.1 Level AA accessibility guidelines
â€¢ ISO 27001 Information Security Management
â€¢ STQC certification for government applications
â€¢ MeitY empanelment requirements

Regular audits are conducted by authorized government agencies to ensure continued compliance.`
      }
    ],
    
    contactNote: 'For legal inquiries, please contact PRAGATI support. Project context: SIH 2026 problem statement from the Ministry of Education and Government of Punjab.',
    relatedLinks: 'Related Links',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contactUs: 'Contact Us',
    copyright: 'Â© 2025 PRAGATI. All rights reserved.',
    governmentPortal: 'SIH 2026 • MoE & Govt. of Punjab'
  },
  hi: {
    governmentOfPunjab: 'à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¤°à¤•à¤¾à¤°',
    department: 'à¤¸à¥à¤•à¥‚à¤² à¤¶à¤¿à¤•à¥à¤·à¤¾ à¤µà¤¿à¤­à¤¾à¤—',
    backToHome: 'à¤¹à¥‹à¤® à¤ªà¥‡à¤œ à¤ªà¤° à¤µà¤¾à¤ªà¤¸',
    pageTitle: 'à¤•à¤¾à¤¨à¥‚à¤¨à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€',
    pageSubtitle: 'à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ˆ-à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¥à¤•à¥‚à¤² à¤•à¥‡ à¤²à¤¿à¤ à¤•à¤¾à¤¨à¥‚à¤¨à¥€ à¤¢à¤¾à¤‚à¤šà¤¾ à¤”à¤° à¤…à¤¨à¥à¤ªà¤¾à¤²à¤¨ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€',
    lastUpdated: 'à¤…à¤‚à¤¤à¤¿à¤® à¤…à¤ªà¤¡à¥‡à¤Ÿ: à¤¦à¤¿à¤¸à¤‚à¤¬à¤° 2025',
    sections: [],
    contactNote: 'à¤•à¤¾à¤¨à¥‚à¤¨à¥€ à¤ªà¥‚à¤›à¤¤à¤¾à¤› à¤•à¥‡ à¤²à¤¿à¤, à¤•à¥ƒà¤ªà¤¯à¤¾ à¤†à¤§à¤¿à¤•à¤¾à¤°à¤¿à¤• à¤šà¥ˆà¤¨à¤²à¥‹à¤‚ à¤•à¥‡ à¤®à¤¾à¤§à¥à¤¯à¤® à¤¸à¥‡ à¤¸à¥à¤•à¥‚à¤² à¤¶à¤¿à¤•à¥à¤·à¤¾ à¤µà¤¿à¤­à¤¾à¤—, à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¤°à¤•à¤¾à¤° à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤',
    relatedLinks: 'à¤¸à¤‚à¤¬à¤‚à¤§à¤¿à¤¤ à¤²à¤¿à¤‚à¤•',
    privacyPolicy: 'à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾ à¤¨à¥€à¤¤à¤¿',
    termsOfService: 'à¤¸à¥‡à¤µà¤¾ à¤•à¥€ à¤¶à¤°à¥à¤¤à¥‡à¤‚',
    contactUs: 'à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚',
    copyright: 'Â© 2025 à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ˆ-à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¥à¤•à¥‚à¤²à¥¤ à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤',
    governmentPortal: 'à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¤°à¤•à¤¾à¤° à¤•à¥€ à¤à¤• à¤ªà¤¹à¤²'
  },
  pa: {
    governmentOfPunjab: 'à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨°à¨•à¨¾à¨°',
    department: 'à¨¸à¨•à©‚à¨² à¨¸à¨¿à©±à¨–à¨¿à¨† à¨µà¨¿à¨­à¨¾à¨—',
    backToHome: 'à¨®à©à©±à¨– à¨ªà©°à¨¨à©‡ à¨¤à©‡ à¨µà¨¾à¨ªà¨¸',
    pageTitle: 'à¨•à¨¾à¨¨à©‚à©°à¨¨à©€ à¨œà¨¾à¨£à¨•à¨¾à¨°à©€',
    pageSubtitle: 'à¨ªà©à¨°à¨—à¨¤à©€ à¨ˆ-à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨•à©‚à¨² à¨²à¨ˆ à¨•à¨¾à¨¨à©‚à©°à¨¨à©€ à¨¢à¨¾à¨‚à¨šà¨¾ à¨…à¨¤à©‡ à¨ªà¨¾à¨²à¨£à¨¾ à¨œà¨¾à¨£à¨•à¨¾à¨°à©€',
    lastUpdated: 'à¨†à¨–à¨°à©€ à¨…à©±à¨ªà¨¡à©‡à¨Ÿ: à¨¦à¨¸à©°à¨¬à¨° 2025',
    sections: [],
    contactNote: 'à¨•à¨¾à¨¨à©‚à©°à¨¨à©€ à¨ªà©à©±à¨›à¨—à¨¿à©±à¨› à¨²à¨ˆ, à¨•à¨¿à¨°à¨ªà¨¾ à¨•à¨°à¨•à©‡ à¨…à¨§à¨¿à¨•à¨¾à¨°à¨¤ à¨šà©ˆà¨¨à¨²à¨¾à¨‚ à¨°à¨¾à¨¹à©€à¨‚ à¨¸à¨•à©‚à¨² à¨¸à¨¿à©±à¨–à¨¿à¨† à¨µà¨¿à¨­à¨¾à¨—, à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨°à¨•à¨¾à¨° à¨¨à¨¾à¨² à¨¸à©°à¨ªà¨°à¨• à¨•à¨°à©‹à¥¤',
    relatedLinks: 'à¨¸à©°à¨¬à©°à¨§à¨¿à¨¤ à¨²à¨¿à©°à¨•',
    privacyPolicy: 'à¨—à©‹à¨ªà¨¨à©€à¨¯à¨¤à¨¾ à¨¨à©€à¨¤à©€',
    termsOfService: 'à¨¸à©‡à¨µà¨¾ à¨¦à©€à¨†à¨‚ à¨¸à¨¼à¨°à¨¤à¨¾à¨‚',
    contactUs: 'à¨¸à¨¾à¨¡à©‡ à¨¨à¨¾à¨² à¨¸à©°à¨ªà¨°à¨• à¨•à¨°à©‹',
    copyright: 'Â© 2025 à¨ªà©à¨°à¨—à¨¤à©€ à¨ˆ-à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨•à©‚à¨²à¥¤ à¨¸à¨¾à¨°à©‡ à¨¹à©±à¨• à¨°à¨¾à¨–à¨µà©‡à¨‚ à¨¹à¨¨à¥¤',
    governmentPortal: 'à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨°à¨•à¨¾à¨° à¨¦à©€ à¨‡à©±à¨• à¨ªà¨¹à¨¿à¨²à¨•à¨¦à¨®à©€'
  }
};

export default function LegalPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const sections = t.sections.length > 0 ? t.sections : translations.en.sections;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/National-Emblem-of-India.png" 
              alt="National Emblem of India" 
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
              à¨ªà©°
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${lang === 'hi' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}
            >
              à¤¹à¤¿
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.pageTitle}</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t.pageSubtitle}</p>
            <p className="text-sm text-gray-400 mt-4">{t.lastUpdated}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {section.title}
                    </h2>
                    <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Note */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">{t.contactNote}</p>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.relatedLinks}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
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
            <Link
              href="/contact"
              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
            >
              <AlertCircle className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
                {t.contactUs}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/pragati-logo.png"
              alt="Pragati Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-semibold">PRAGATI</span>
          </div>
          <p className="text-sm text-gray-400 mb-2">{t.governmentPortal}</p>
          <p className="text-xs text-gray-500">{t.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
