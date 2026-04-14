'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Lock,
  Eye,
  Database,
  UserCheck,
  Bell,
  Trash2,
  Globe,
  FileText,
  Scale
} from 'lucide-react';

type Language = 'en' | 'hi' | 'pa';

const translations = {
  en: {
    governmentOfPunjab: 'PRAGATI',
    department: 'Built for SIH 2026 • MoE & Govt. of Punjab',
    backToHome: 'Back to Home',
    pageTitle: 'Privacy Policy',
    pageSubtitle: 'How we collect, use, and protect your personal information',
    lastUpdated: 'Last Updated: December 2025',
    effectiveDate: 'Effective Date: January 1, 2025',
    
    introduction: `PRAGATI ("we", "us", or "our") is committed to protecting the privacy of students, teachers, parents, and administrators who use our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.

This policy is in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and other applicable Indian laws.`,

    sections: [
      {
        icon: Database,
        title: 'Information We Collect',
        content: `We collect information that you provide directly to us, including:

**Personal Information:**
â€¢ Full name, date of birth, and gender
â€¢ Contact information (phone number, email address)
â€¢ Educational details (school, class, section, enrollment number)
â€¢ Aadhaar number (optional, for verification purposes only)
â€¢ Photographs for identification

**Attendance Data:**
â€¢ Geo-location data during attendance marking
â€¢ Timestamp of attendance
â€¢ Device information used for attendance

**Academic Information:**
â€¢ Grades and examination results
â€¢ Participation records
â€¢ Performance analytics

**Technical Data:**
â€¢ Device identifiers
â€¢ IP addresses
â€¢ Browser type and version
â€¢ Usage patterns and preferences`
      },
      {
        icon: Eye,
        title: 'How We Use Your Information',
        content: `We use the collected information for the following purposes:

â€¢ **Attendance Management:** Recording and verifying student and teacher attendance using geo-fencing technology
â€¢ **Educational Services:** Providing access to educational resources and tracking academic progress
â€¢ **Communication:** Sending notifications about attendance, academic updates, and important announcements
â€¢ **Analytics:** Generating reports for educational authorities to improve school performance
â€¢ **Security:** Preventing fraud and ensuring the security of our platform
â€¢ **Compliance:** Meeting legal and regulatory requirements
â€¢ **Service Improvement:** Enhancing and optimizing our platform based on usage patterns`
      },
      {
        icon: UserCheck,
        title: 'Data Sharing and Disclosure',
        content: `We may share your information with:

**Government Authorities:**
â€¢ Ministry of Education and Government of Punjab (problem statement source, SIH 2026)
â€¢ Ministry of Education, Government of India
â€¢ Other authorized government agencies for educational planning

**Educational Institutions:**
â€¢ Schools and their authorized personnel
â€¢ District and block education officers

**Service Providers:**
â€¢ Cloud hosting providers (with appropriate data protection agreements)
â€¢ SMS and notification service providers
â€¢ Analytics service providers

**We do NOT sell, rent, or trade personal information to third parties for commercial purposes.**

Information may be disclosed if required by law or to protect the rights, property, or safety of users or the public.`
      },
      {
        icon: Lock,
        title: 'Data Security',
        content: `We implement robust security measures to protect your information:

â€¢ **Encryption:** All data is encrypted in transit (SSL/TLS) and at rest
â€¢ **Access Control:** Role-based access control limits data access to authorized personnel
â€¢ **Secure Infrastructure:** Data is hosted on government-approved secure servers
â€¢ **Regular Audits:** Security audits are conducted periodically by STQC-empaneled agencies
â€¢ **Incident Response:** We have procedures in place to respond to data breaches
â€¢ **Employee Training:** Staff undergo regular training on data protection practices

Despite our efforts, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your data to the best of our ability.`
      },
      {
        icon: Shield,
        title: 'Children\'s Privacy',
        content: `PRAGATI is designed for use in educational settings and may collect information from children under 18 years of age.

â€¢ Parental/guardian consent is obtained through school enrollment processes
â€¢ We collect only information necessary for educational purposes
â€¢ Children's data is given additional protection measures
â€¢ Parents/guardians can request access to their child's data
â€¢ We do not target advertising to children
â€¢ Personal information of minors is handled with extra care as per POCSO Act guidelines`
      },
      {
        icon: Bell,
        title: 'Your Rights',
        content: `As a user, you have the following rights regarding your personal data:

â€¢ **Right to Access:** Request a copy of your personal data
â€¢ **Right to Correction:** Request correction of inaccurate or incomplete data
â€¢ **Right to Deletion:** Request deletion of your data (subject to legal requirements)
â€¢ **Right to Object:** Object to certain processing of your data
â€¢ **Right to Data Portability:** Receive your data in a structured, commonly used format
â€¢ **Right to Withdraw Consent:** Withdraw consent for optional data processing

To exercise these rights, contact your school administration or PRAGATI support.`
      },
      {
        icon: Trash2,
        title: 'Data Retention',
        content: `We retain personal information for as long as necessary to fulfill the purposes outlined in this policy:

â€¢ **Active Records:** Maintained while the student/teacher is enrolled/employed
â€¢ **Academic Records:** Retained for 10 years after completion as per education regulations
â€¢ **Attendance Records:** Retained for 7 years for audit purposes
â€¢ **Inactive Accounts:** Data is anonymized or deleted after 3 years of inactivity
â€¢ **Legal Requirements:** Some data may be retained longer if required by law

Upon request for deletion, we will remove personal data unless retention is required by law.`
      },
      {
        icon: Globe,
        title: 'Data Transfer',
        content: `Your data is primarily stored and processed within India on servers located in Indian territory.

â€¢ We do not transfer personal data outside India without explicit consent
â€¢ All data processing complies with Indian data localization requirements
â€¢ Third-party service providers with access to data must comply with Indian laws
â€¢ Government data is stored exclusively on government-approved infrastructure

In the event of any international data transfer, appropriate safeguards will be implemented as per applicable laws.`
      }
    ],
    
    policyChanges: 'Changes to This Policy',
    policyChangesText: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.',
    
    contactTitle: 'Contact Us',
    contactText: 'If you have questions about this Privacy Policy or wish to exercise your rights, please contact:',
    contactDetails: `Data Protection Officer
Smart India Hackathon 2026
Chandigarh Group of Colleges
Landran, Mohali, Punjab - 140307
India
Email: dpo-pragati@sih.gov.in
Phone: 0172-XXXXXXX`,
    
    grievanceTitle: 'Grievance Redressal',
    grievanceText: 'For any grievances related to data privacy, you may contact the Grievance Officer as per the Information Technology Act, 2000.',
    
    relatedLinks: 'Related Links',
    legalInfo: 'Legal Information',
    termsOfService: 'Terms of Service',
    contactUs: 'Contact Us',
    copyright: 'Â© 2025 PRAGATI. All rights reserved.',
    governmentPortal: 'SIH 2026 • MoE & Govt. of Punjab'
  },
  hi: {
    governmentOfPunjab: 'à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¤°à¤•à¤¾à¤°',
    department: 'à¤¸à¥à¤•à¥‚à¤² à¤¶à¤¿à¤•à¥à¤·à¤¾ à¤µà¤¿à¤­à¤¾à¤—',
    backToHome: 'à¤¹à¥‹à¤® à¤ªà¥‡à¤œ à¤ªà¤° à¤µà¤¾à¤ªà¤¸',
    pageTitle: 'à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾ à¤¨à¥€à¤¤à¤¿',
    pageSubtitle: 'à¤¹à¤® à¤†à¤ªà¤•à¥€ à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤—à¤¤ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤•à¥ˆà¤¸à¥‡ à¤à¤•à¤¤à¥à¤°, à¤‰à¤ªà¤¯à¥‹à¤— à¤”à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚',
    lastUpdated: 'à¤…à¤‚à¤¤à¤¿à¤® à¤…à¤ªà¤¡à¥‡à¤Ÿ: à¤¦à¤¿à¤¸à¤‚à¤¬à¤° 2025',
    effectiveDate: 'à¤ªà¥à¤°à¤­à¤¾à¤µà¥€ à¤¤à¤¿à¤¥à¤¿: 1 à¤œà¤¨à¤µà¤°à¥€ 2025',
    introduction: '',
    sections: [],
    policyChanges: 'à¤‡à¤¸ à¤¨à¥€à¤¤à¤¿ à¤®à¥‡à¤‚ à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨',
    policyChangesText: '',
    contactTitle: 'à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚',
    contactText: '',
    contactDetails: '',
    grievanceTitle: 'à¤¶à¤¿à¤•à¤¾à¤¯à¤¤ à¤¨à¤¿à¤µà¤¾à¤°à¤£',
    grievanceText: '',
    relatedLinks: 'à¤¸à¤‚à¤¬à¤‚à¤§à¤¿à¤¤ à¤²à¤¿à¤‚à¤•',
    legalInfo: 'à¤•à¤¾à¤¨à¥‚à¤¨à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€',
    termsOfService: 'à¤¸à¥‡à¤µà¤¾ à¤•à¥€ à¤¶à¤°à¥à¤¤à¥‡à¤‚',
    contactUs: 'à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚',
    copyright: 'Â© 2025 à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ˆ-à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¥à¤•à¥‚à¤²à¥¤ à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤',
    governmentPortal: 'à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¤°à¤•à¤¾à¤° à¤•à¥€ à¤à¤• à¤ªà¤¹à¤²'
  },
  pa: {
    governmentOfPunjab: 'à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨°à¨•à¨¾à¨°',
    department: 'à¨¸à¨•à©‚à¨² à¨¸à¨¿à©±à¨–à¨¿à¨† à¨µà¨¿à¨­à¨¾à¨—',
    backToHome: 'à¨®à©à©±à¨– à¨ªà©°à¨¨à©‡ à¨¤à©‡ à¨µà¨¾à¨ªà¨¸',
    pageTitle: 'à¨—à©‹à¨ªà¨¨à©€à¨¯à¨¤à¨¾ à¨¨à©€à¨¤à©€',
    pageSubtitle: 'à¨…à¨¸à©€à¨‚ à¨¤à©à¨¹à¨¾à¨¡à©€ à¨¨à¨¿à©±à¨œà©€ à¨œà¨¾à¨£à¨•à¨¾à¨°à©€ à¨•à¨¿à¨µà©‡à¨‚ à¨‡à¨•à©±à¨ à©€, à¨µà¨°à¨¤à¨¦à©‡ à¨…à¨¤à©‡ à¨¸à©à¨°à©±à¨–à¨¿à¨…à¨¤ à¨•à¨°à¨¦à©‡ à¨¹à¨¾à¨‚',
    lastUpdated: 'à¨†à¨–à¨°à©€ à¨…à©±à¨ªà¨¡à©‡à¨Ÿ: à¨¦à¨¸à©°à¨¬à¨° 2025',
    effectiveDate: 'à¨²à¨¾à¨—à©‚ à¨®à¨¿à¨¤à©€: 1 à¨œà¨¨à¨µà¨°à©€ 2025',
    introduction: '',
    sections: [],
    policyChanges: 'à¨‡à¨¸ à¨¨à©€à¨¤à©€ à¨µà¨¿à©±à¨š à¨¬à¨¦à¨²à¨¾à¨…',
    policyChangesText: '',
    contactTitle: 'à¨¸à©°à¨ªà¨°à¨• à¨•à¨°à©‹',
    contactText: '',
    contactDetails: '',
    grievanceTitle: 'à¨¸à¨¼à¨¿à¨•à¨¾à¨‡à¨¤ à¨¨à¨¿à¨µà¨¾à¨°à¨¨',
    grievanceText: '',
    relatedLinks: 'à¨¸à©°à¨¬à©°à¨§à¨¿à¨¤ à¨²à¨¿à©°à¨•',
    legalInfo: 'à¨•à¨¾à¨¨à©‚à©°à¨¨à©€ à¨œà¨¾à¨£à¨•à¨¾à¨°à©€',
    termsOfService: 'à¨¸à©‡à¨µà¨¾ à¨¦à©€à¨†à¨‚ à¨¸à¨¼à¨°à¨¤à¨¾à¨‚',
    contactUs: 'à¨¸à¨¾à¨¡à©‡ à¨¨à¨¾à¨² à¨¸à©°à¨ªà¨°à¨• à¨•à¨°à©‹',
    copyright: 'Â© 2025 à¨ªà©à¨°à¨—à¨¤à©€ à¨ˆ-à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨•à©‚à¨²à¥¤ à¨¸à¨¾à¨°à©‡ à¨¹à©±à¨• à¨°à¨¾à¨–à¨µà©‡à¨‚ à¨¹à¨¨à¥¤',
    governmentPortal: 'à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨°à¨•à¨¾à¨° à¨¦à©€ à¨‡à©±à¨• à¨ªà¨¹à¨¿à¨²à¨•à¨¦à¨®à©€'
  }
};

// Helper function to parse markdown-style bold text
const parseFormattedText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function PrivacyPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const sections = t.sections.length > 0 ? t.sections : translations.en.sections;
  const introduction = t.introduction || translations.en.introduction;
  const contactDetails = t.contactDetails || translations.en.contactDetails;
  const contactText = t.contactText || translations.en.contactText;
  const policyChangesText = t.policyChangesText || translations.en.policyChangesText;
  const grievanceText = t.grievanceText || translations.en.grievanceText;

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
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.pageTitle}</h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto">{t.pageSubtitle}</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-emerald-200">
              <span>{t.lastUpdated}</span>
              <span>â€¢</span>
              <span>{t.effectiveDate}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-8"
        >
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed">
            {introduction}
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {section.title}
                    </h2>
                    <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                      {parseFormattedText(section.content)}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Policy Changes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-3">{t.policyChanges}</h3>
          <p className="text-sm text-amber-700 dark:text-amber-400">{policyChangesText}</p>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t.contactTitle}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{contactText}</p>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {contactDetails}
          </div>
        </motion.div>

        {/* Grievance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">{t.grievanceTitle}</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">{grievanceText}</p>
        </motion.div>

        {/* Related Links */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.relatedLinks}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/legal"
              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
            >
              <Scale className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
                {t.legalInfo}
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
              <Bell className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
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
