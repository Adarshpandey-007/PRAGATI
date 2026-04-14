'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Building2,
  Users,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Scale,
  Shield,
  FileText
} from 'lucide-react';

type Language = 'en' | 'hi' | 'pa';

const translations = {
  en: {
    governmentOfPunjab: 'PRAGATI',
    department: 'Built for SIH 2026 • MoE & Govt. of Punjab',
    backToHome: 'Back to Home',
    pageTitle: 'Contact Us',
    pageSubtitle: 'Get in touch with PRAGATI support team',
    
    // Contact Form
    formTitle: 'Send us a Message',
    formSubtitle: 'Fill out the form below and we\'ll get back to you as soon as possible',
    nameLabel: 'Full Name',
    namePlaceholder: 'Enter your full name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'Enter your email address',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'Enter your phone number',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Select a subject',
    messageLabel: 'Message',
    messagePlaceholder: 'Describe your query or concern in detail...',
    submitButton: 'Send Message',
    submitting: 'Sending...',
    successMessage: 'Your message has been sent successfully! We\'ll get back to you within 2-3 business days.',
    
    subjects: [
      'General Inquiry',
      'Technical Support',
      'Account Issues',
      'Attendance Related',
      'Report a Bug',
      'Feature Request',
      'Feedback',
      'Other'
    ],
    
    // Contact Info
    contactInfoTitle: 'Contact Information',
    mainOffice: 'Main Office',
    mainOfficeAddress: `Smart India Hackathon 2026
Chandigarh Group of Colleges
Landran, Mohali, Punjab - 140307
India`,
    
    technicalSupport: 'Technical Support',
    technicalSupportDesc: 'For technical issues and platform support',
    
    generalInquiries: 'General Inquiries',
    generalInquiriesDesc: 'For general questions about Pragati',
    
    workingHours: 'Working Hours',
    workingHoursValue: 'Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday & Holidays: Closed',
    
    emergencyContact: 'Emergency Contact',
    emergencyDesc: 'For urgent matters only',
    
    // Help Topics
    helpTitle: 'Frequently Asked Questions',
    helpTopics: [
      {
        icon: Users,
        title: 'Account & Login',
        description: 'Issues with logging in, password reset, or account access'
      },
      {
        icon: MapPin,
        title: 'Attendance & Geo-fencing',
        description: 'Problems with marking attendance or location services'
      },
      {
        icon: MessageSquare,
        title: 'Notifications',
        description: 'Not receiving notifications or alert issues'
      },
      {
        icon: HelpCircle,
        title: 'Technical Issues',
        description: 'App crashes, bugs, or performance problems'
      }
    ],
    
    // Regional Offices
    regionalTitle: 'More Information',
    detailsComingSoon: 'Details Coming Soon',
    comingSoonMessage: 'We are working on providing more contact information. Please check back later or use the contact form above.',
    
    responseTime: 'Expected Response Time',
    responseTimeValue: '2-3 business days',
    
    relatedLinks: 'Related Links',
    legalInfo: 'Legal Information',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    copyright: 'Â© 2025 PRAGATI. All rights reserved.',
    governmentPortal: 'SIH 2026 • MoE & Govt. of Punjab'
  },
  hi: {
    governmentOfPunjab: 'à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¤°à¤•à¤¾à¤°',
    department: 'à¤¸à¥à¤•à¥‚à¤² à¤¶à¤¿à¤•à¥à¤·à¤¾ à¤µà¤¿à¤­à¤¾à¤—',
    backToHome: 'à¤¹à¥‹à¤® à¤ªà¥‡à¤œ à¤ªà¤° à¤µà¤¾à¤ªà¤¸',
    pageTitle: 'à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚',
    pageSubtitle: 'à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ˆ-à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¥à¤•à¥‚à¤² à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤Ÿà¥€à¤® à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚',
    formTitle: 'à¤¹à¤®à¥‡à¤‚ à¤¸à¤‚à¤¦à¥‡à¤¶ à¤­à¥‡à¤œà¥‡à¤‚',
    formSubtitle: 'à¤¨à¥€à¤šà¥‡ à¤¦à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾ à¤«à¥‰à¤°à¥à¤® à¤­à¤°à¥‡à¤‚ à¤”à¤° à¤¹à¤® à¤œà¤²à¥à¤¦ à¤¸à¥‡ à¤œà¤²à¥à¤¦ à¤†à¤ªà¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¤—à¥‡',
    nameLabel: 'à¤ªà¥‚à¤°à¤¾ à¤¨à¤¾à¤®',
    namePlaceholder: 'à¤…à¤ªà¤¨à¤¾ à¤ªà¥‚à¤°à¤¾ à¤¨à¤¾à¤® à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚',
    emailLabel: 'à¤ˆà¤®à¥‡à¤² à¤ªà¤¤à¤¾',
    emailPlaceholder: 'à¤…à¤ªà¤¨à¤¾ à¤ˆà¤®à¥‡à¤² à¤ªà¤¤à¤¾ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚',
    phoneLabel: 'à¤«à¥‹à¤¨ à¤¨à¤‚à¤¬à¤°',
    phonePlaceholder: 'à¤…à¤ªà¤¨à¤¾ à¤«à¥‹à¤¨ à¤¨à¤‚à¤¬à¤° à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚',
    subjectLabel: 'à¤µà¤¿à¤·à¤¯',
    subjectPlaceholder: 'à¤à¤• à¤µà¤¿à¤·à¤¯ à¤šà¥à¤¨à¥‡à¤‚',
    messageLabel: 'à¤¸à¤‚à¤¦à¥‡à¤¶',
    messagePlaceholder: 'à¤…à¤ªà¤¨à¥€ à¤•à¥à¤µà¥‡à¤°à¥€ à¤¯à¤¾ à¤šà¤¿à¤‚à¤¤à¤¾ à¤•à¤¾ à¤µà¤¿à¤¸à¥à¤¤à¤¾à¤° à¤¸à¥‡ à¤µà¤°à¥à¤£à¤¨ à¤•à¤°à¥‡à¤‚...',
    submitButton: 'à¤¸à¤‚à¤¦à¥‡à¤¶ à¤­à¥‡à¤œà¥‡à¤‚',
    submitting: 'à¤­à¥‡à¤œ à¤°à¤¹à¤¾ à¤¹à¥ˆ...',
    successMessage: 'à¤†à¤ªà¤•à¤¾ à¤¸à¤‚à¤¦à¥‡à¤¶ à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤­à¥‡à¤œ à¤¦à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾ à¤¹à¥ˆ! à¤¹à¤® 2-3 à¤•à¤¾à¤°à¥à¤¯ à¤¦à¤¿à¤µà¤¸à¥‹à¤‚ à¤•à¥‡ à¤­à¥€à¤¤à¤° à¤†à¤ªà¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¤—à¥‡à¥¤',
    subjects: [],
    contactInfoTitle: 'à¤¸à¤‚à¤ªà¤°à¥à¤• à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€',
    mainOffice: 'à¤®à¥à¤–à¥à¤¯ à¤•à¤¾à¤°à¥à¤¯à¤¾à¤²à¤¯',
    mainOfficeAddress: '',
    technicalSupport: 'à¤¤à¤•à¤¨à¥€à¤•à¥€ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾',
    technicalSupportDesc: '',
    generalInquiries: 'à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯ à¤ªà¥‚à¤›à¤¤à¤¾à¤›',
    generalInquiriesDesc: '',
    workingHours: 'à¤•à¤¾à¤°à¥à¤¯ à¤¸à¤®à¤¯',
    workingHoursValue: '',
    emergencyContact: 'à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²à¥€à¤¨ à¤¸à¤‚à¤ªà¤°à¥à¤•',
    emergencyDesc: '',
    helpTitle: 'à¤…à¤•à¥à¤¸à¤° à¤ªà¥‚à¤›à¥‡ à¤œà¤¾à¤¨à¥‡ à¤µà¤¾à¤²à¥‡ à¤ªà¥à¤°à¤¶à¥à¤¨',
    helpTopics: [],
    regionalTitle: 'à¤…à¤§à¤¿à¤• à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€',
    detailsComingSoon: 'à¤µà¤¿à¤µà¤°à¤£ à¤œà¤²à¥à¤¦ à¤† à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚',
    comingSoonMessage: 'à¤¹à¤® à¤…à¤§à¤¿à¤• à¤¸à¤‚à¤ªà¤°à¥à¤• à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤ªà¥à¤°à¤¦à¤¾à¤¨ à¤•à¤°à¤¨à¥‡ à¤ªà¤° à¤•à¤¾à¤® à¤•à¤° à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¬à¤¾à¤¦ à¤®à¥‡à¤‚ à¤œà¤¾à¤‚à¤šà¥‡à¤‚ à¤¯à¤¾ à¤Šà¤ªà¤° à¤¦à¤¿à¤ à¤—à¤ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤«à¥‰à¤°à¥à¤® à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¥‡à¤‚à¥¤',
    responseTime: 'à¤…à¤ªà¥‡à¤•à¥à¤·à¤¿à¤¤ à¤ªà¥à¤°à¤¤à¤¿à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤¸à¤®à¤¯',
    responseTimeValue: '2-3 à¤•à¤¾à¤°à¥à¤¯ à¤¦à¤¿à¤µà¤¸',
    relatedLinks: 'à¤¸à¤‚à¤¬à¤‚à¤§à¤¿à¤¤ à¤²à¤¿à¤‚à¤•',
    legalInfo: 'à¤•à¤¾à¤¨à¥‚à¤¨à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€',
    privacyPolicy: 'à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾ à¤¨à¥€à¤¤à¤¿',
    termsOfService: 'à¤¸à¥‡à¤µà¤¾ à¤•à¥€ à¤¶à¤°à¥à¤¤à¥‡à¤‚',
    copyright: 'Â© 2025 à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ˆ-à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¥à¤•à¥‚à¤²à¥¤ à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤',
    governmentPortal: 'à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¤°à¤•à¤¾à¤° à¤•à¥€ à¤à¤• à¤ªà¤¹à¤²'
  },
  pa: {
    governmentOfPunjab: 'à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨°à¨•à¨¾à¨°',
    department: 'à¨¸à¨•à©‚à¨² à¨¸à¨¿à©±à¨–à¨¿à¨† à¨µà¨¿à¨­à¨¾à¨—',
    backToHome: 'à¨®à©à©±à¨– à¨ªà©°à¨¨à©‡ à¨¤à©‡ à¨µà¨¾à¨ªà¨¸',
    pageTitle: 'à¨¸à¨¾à¨¡à©‡ à¨¨à¨¾à¨² à¨¸à©°à¨ªà¨°à¨• à¨•à¨°à©‹',
    pageSubtitle: 'à¨ªà©à¨°à¨—à¨¤à©€ à¨ˆ-à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨•à©‚à¨² à¨¸à¨¹à¨¾à¨‡à¨¤à¨¾ à¨Ÿà©€à¨® à¨¨à¨¾à¨² à¨¸à©°à¨ªà¨°à¨• à¨•à¨°à©‹',
    formTitle: 'à¨¸à¨¾à¨¨à©‚à©° à¨¸à©à¨¨à©‡à¨¹à¨¾ à¨­à©‡à¨œà©‹',
    formSubtitle: 'à¨¹à©‡à¨ à¨¾à¨‚ à¨¦à¨¿à©±à¨¤à¨¾ à¨«à¨¾à¨°à¨® à¨­à¨°à©‹ à¨…à¨¤à©‡ à¨…à¨¸à©€à¨‚ à¨œà¨²à¨¦à©€ à¨¤à©‹à¨‚ à¨œà¨²à¨¦à©€ à¨¤à©à¨¹à¨¾à¨¡à©‡ à¨¨à¨¾à¨² à¨¸à©°à¨ªà¨°à¨• à¨•à¨°à¨¾à¨‚à¨—à©‡',
    nameLabel: 'à¨ªà©‚à¨°à¨¾ à¨¨à¨¾à¨®',
    namePlaceholder: 'à¨†à¨ªà¨£à¨¾ à¨ªà©‚à¨°à¨¾ à¨¨à¨¾à¨® à¨¦à¨°à¨œ à¨•à¨°à©‹',
    emailLabel: 'à¨ˆà¨®à©‡à¨² à¨ªà¨¤à¨¾',
    emailPlaceholder: 'à¨†à¨ªà¨£à¨¾ à¨ˆà¨®à©‡à¨² à¨ªà¨¤à¨¾ à¨¦à¨°à¨œ à¨•à¨°à©‹',
    phoneLabel: 'à¨«à©‹à¨¨ à¨¨à©°à¨¬à¨°',
    phonePlaceholder: 'à¨†à¨ªà¨£à¨¾ à¨«à©‹à¨¨ à¨¨à©°à¨¬à¨° à¨¦à¨°à¨œ à¨•à¨°à©‹',
    subjectLabel: 'à¨µà¨¿à¨¸à¨¼à¨¾',
    subjectPlaceholder: 'à¨‡à©±à¨• à¨µà¨¿à¨¸à¨¼à¨¾ à¨šà©à¨£à©‹',
    messageLabel: 'à¨¸à©à¨¨à©‡à¨¹à¨¾',
    messagePlaceholder: 'à¨†à¨ªà¨£à©€ à¨ªà©à©±à¨›à¨—à¨¿à©±à¨› à¨œà¨¾à¨‚ à¨šà¨¿à©°à¨¤à¨¾ à¨¦à¨¾ à¨µà¨¿à¨¸à¨¥à¨¾à¨° à¨¨à¨¾à¨² à¨µà¨°à¨£à¨¨ à¨•à¨°à©‹...',
    submitButton: 'à¨¸à©à¨¨à©‡à¨¹à¨¾ à¨­à©‡à¨œà©‹',
    submitting: 'à¨­à©‡à¨œ à¨°à¨¿à¨¹à¨¾ à¨¹à©ˆ...',
    successMessage: 'à¨¤à©à¨¹à¨¾à¨¡à¨¾ à¨¸à©à¨¨à©‡à¨¹à¨¾ à¨¸à¨«à¨²à¨¤à¨¾à¨ªà©‚à¨°à¨µà¨• à¨­à©‡à¨œ à¨¦à¨¿à©±à¨¤à¨¾ à¨—à¨¿à¨† à¨¹à©ˆ! à¨…à¨¸à©€à¨‚ 2-3 à¨•à¨¾à¨°à©‹à¨¬à¨¾à¨°à©€ à¨¦à¨¿à¨¨à¨¾à¨‚ à¨µà¨¿à©±à¨š à¨¤à©à¨¹à¨¾à¨¡à©‡ à¨¨à¨¾à¨² à¨¸à©°à¨ªà¨°à¨• à¨•à¨°à¨¾à¨‚à¨—à©‡à¥¤',
    subjects: [],
    contactInfoTitle: 'à¨¸à©°à¨ªà¨°à¨• à¨œà¨¾à¨£à¨•à¨¾à¨°à©€',
    mainOffice: 'à¨®à©à©±à¨– à¨¦à¨«à¨¼à¨¤à¨°',
    mainOfficeAddress: '',
    technicalSupport: 'à¨¤à¨•à¨¨à©€à¨•à©€ à¨¸à¨¹à¨¾à¨‡à¨¤à¨¾',
    technicalSupportDesc: '',
    generalInquiries: 'à¨†à¨® à¨ªà©à©±à¨›à¨—à¨¿à©±à¨›',
    generalInquiriesDesc: '',
    workingHours: 'à¨•à©°à¨® à¨¦à©‡ à¨˜à©°à¨Ÿà©‡',
    workingHoursValue: '',
    emergencyContact: 'à¨à¨®à¨°à¨œà©ˆà¨‚à¨¸à©€ à¨¸à©°à¨ªà¨°à¨•',
    emergencyDesc: '',
    helpTitle: 'à¨…à¨•à¨¸à¨° à¨ªà©à©±à¨›à©‡ à¨œà¨¾à¨£ à¨µà¨¾à¨²à©‡ à¨¸à¨µà¨¾à¨²',
    helpTopics: [],
    regionalTitle: 'à¨¹à©‹à¨° à¨œà¨¾à¨£à¨•à¨¾à¨°à©€',
    detailsComingSoon: 'à¨µà©‡à¨°à¨µà©‡ à¨œà¨²à¨¦à©€ à¨† à¨°à¨¹à©‡ à¨¹à¨¨',
    comingSoonMessage: 'à¨…à¨¸à©€à¨‚ à¨¹à©‹à¨° à¨¸à©°à¨ªà¨°à¨• à¨œà¨¾à¨£à¨•à¨¾à¨°à©€ à¨ªà©à¨°à¨¦à¨¾à¨¨ à¨•à¨°à¨¨ à¨¤à©‡ à¨•à©°à¨® à¨•à¨° à¨°à¨¹à©‡ à¨¹à¨¾à¨‚à¥¤ à¨•à¨¿à¨°à¨ªà¨¾ à¨•à¨°à¨•à©‡ à¨¬à¨¾à¨…à¨¦ à¨µà¨¿à©±à¨š à¨œà¨¾à¨‚à¨š à¨•à¨°à©‹ à¨œà¨¾à¨‚ à¨‰à©±à¨ªà¨° à¨¦à¨¿à©±à¨¤à©‡ à¨¸à©°à¨ªà¨°à¨• à¨«à¨¾à¨°à¨® à¨¦à©€ à¨µà¨°à¨¤à©‹à¨‚ à¨•à¨°à©‹à¥¤',
    responseTime: 'à¨¸à©°à¨­à¨¾à¨µà¨¿à¨¤ à¨œà¨µà¨¾à¨¬ à¨¸à¨®à¨¾à¨‚',
    responseTimeValue: '2-3 à¨•à¨¾à¨°à©‹à¨¬à¨¾à¨°à©€ à¨¦à¨¿à¨¨',
    relatedLinks: 'à¨¸à©°à¨¬à©°à¨§à¨¿à¨¤ à¨²à¨¿à©°à¨•',
    legalInfo: 'à¨•à¨¾à¨¨à©‚à©°à¨¨à©€ à¨œà¨¾à¨£à¨•à¨¾à¨°à©€',
    privacyPolicy: 'à¨—à©‹à¨ªà¨¨à©€à¨¯à¨¤à¨¾ à¨¨à©€à¨¤à©€',
    termsOfService: 'à¨¸à©‡à¨µà¨¾ à¨¦à©€à¨†à¨‚ à¨¸à¨¼à¨°à¨¤à¨¾à¨‚',
    copyright: 'Â© 2025 à¨ªà©à¨°à¨—à¨¤à©€ à¨ˆ-à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨•à©‚à¨²à¥¤ à¨¸à¨¾à¨°à©‡ à¨¹à©±à¨• à¨°à¨¾à¨–à¨µà©‡à¨‚ à¨¹à¨¨à¥¤',
    governmentPortal: 'à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨°à¨•à¨¾à¨° à¨¦à©€ à¨‡à©±à¨• à¨ªà¨¹à¨¿à¨²à¨•à¨¦à¨®à©€'
  }
};

export default function ContactPage() {
  const [lang, setLang] = useState<Language>('en');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const t = translations[lang];
  const subjects = t.subjects.length > 0 ? t.subjects : translations.en.subjects;
  const helpTopics = t.helpTopics.length > 0 ? t.helpTopics : translations.en.helpTopics;
  const mainOfficeAddress = t.mainOfficeAddress || translations.en.mainOfficeAddress;
  const workingHoursValue = t.workingHoursValue || translations.en.workingHoursValue;
  const technicalSupportDesc = t.technicalSupportDesc || translations.en.technicalSupportDesc;
  const generalInquiriesDesc = t.generalInquiriesDesc || translations.en.generalInquiriesDesc;
  const emergencyDesc = t.emergencyDesc || translations.en.emergencyDesc;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

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
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.pageTitle}</h1>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">{t.pageSubtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.formTitle}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.formSubtitle}</p>
                </div>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center"
                >
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-green-700 dark:text-green-300">{t.successMessage}</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t.nameLabel} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t.namePlaceholder}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t.emailLabel} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t.emailPlaceholder}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t.phoneLabel}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t.phonePlaceholder}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t.subjectLabel} *
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      >
                        <option value="">{t.subjectPlaceholder}</option>
                        {subjects.map((subject, index) => (
                          <option key={index} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t.messageLabel} *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t.messagePlaceholder}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t.submitButton}
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Help Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.helpTitle}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {helpTopics.map((topic, index) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{topic.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{topic.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            {/* Main Office */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                {t.mainOffice}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{mainOfficeAddress}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Details Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.detailsComingSoon || 'Details Coming Soon'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">{t.comingSoonMessage || 'We are working on providing more contact information. Please check back later or use the contact form above.'}</p>
          </div>
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
