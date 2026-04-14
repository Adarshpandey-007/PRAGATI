'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  User,
  Tag,
  Search,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  Shield
} from 'lucide-react';

type Language = 'en' | 'hi' | 'pa';

const translations = {
  en: {
    governmentOfPunjab: 'PRAGATI',
    department: 'Built for SIH 2026 • MoE & Govt. of Punjab',
    backToHome: 'Back to Home',
    pageTitle: 'Blog & Updates',
    pageSubtitle: 'Latest news, updates, and insights from PRAGATI',
    
    searchPlaceholder: 'Search articles...',
    allCategories: 'All Categories',
    featuredPost: 'Featured',
    readMore: 'Read More',
    minRead: 'min read',
    
    categories: [
      'All',
      'Announcements',
      'Features',
      'Education',
      'Technology',
      'Success Stories'
    ],
    
    blogPosts: [
      {
        id: 1,
        title: 'Introducing PRAGATI: Revolutionizing Education Management',
        excerpt: 'We are excited to announce the launch of PRAGATI, a comprehensive education management platform designed specifically for Punjab government schools.',
        category: 'Announcements',
        author: 'Team PRAGATI',
        date: 'December 8, 2025',
        readTime: 5,
        featured: true,
        image: '/placeholder.svg',
        icon: Lightbulb
      },
      {
        id: 2,
        title: 'How Geo-Fenced Attendance is Transforming Rural Schools',
        excerpt: 'Discover how our innovative geo-fencing technology is helping rural schools track attendance accurately and prevent proxy attendance.',
        category: 'Technology',
        author: 'Tech Team',
        date: 'December 5, 2025',
        readTime: 4,
        featured: false,
        image: '/placeholder.svg',
        icon: Shield
      },
      {
        id: 3,
        title: 'Smart India Hackathon 2026: Our Journey',
        excerpt: 'A behind-the-scenes look at how Team PRAGATI developed this platform during SIH 2026.',
        category: 'Success Stories',
        author: 'Team PRAGATI',
        date: 'December 3, 2025',
        readTime: 6,
        featured: false,
        image: '/placeholder.svg',
        icon: TrendingUp
      },
      {
        id: 4,
        title: 'New Feature: Real-Time Analytics Dashboard for Principals',
        excerpt: 'Principals can now access comprehensive analytics and reports to track school performance in real-time.',
        category: 'Features',
        author: 'Product Team',
        date: 'December 1, 2025',
        readTime: 3,
        featured: false,
        image: '/placeholder.svg',
        icon: TrendingUp
      },
      {
        id: 5,
        title: 'Best Practices for Digital Attendance Management',
        excerpt: 'Learn the best practices for implementing digital attendance systems in your school.',
        category: 'Education',
        author: 'Education Team',
        date: 'November 28, 2025',
        readTime: 5,
        featured: false,
        image: '/placeholder.svg',
        icon: GraduationCap
      },
      {
        id: 6,
        title: 'Upcoming Features: What to Expect in 2026',
        excerpt: 'A sneak peek at the exciting features we are planning to release in the coming year.',
        category: 'Announcements',
        author: 'Product Team',
        date: 'November 25, 2025',
        readTime: 4,
        featured: false,
        image: '/placeholder.svg',
        icon: Lightbulb
      }
    ],
    
    noPostsFound: 'No articles found matching your search.',
    comingSoonTitle: 'More Articles Coming Soon',
    comingSoonText: 'We are working on bringing you more insightful articles about education technology and best practices.',
    
    relatedLinks: 'Quick Links',
    aboutUs: 'About Us',
    careers: 'Careers',
    contactUs: 'Contact Us',
    copyright: 'Â© 2025 PRAGATI. All rights reserved.',
    governmentPortal: 'SIH 2026 • MoE & Govt. of Punjab'
  },
  hi: {
    governmentOfPunjab: 'à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¤°à¤•à¤¾à¤°',
    department: 'à¤¸à¥à¤•à¥‚à¤² à¤¶à¤¿à¤•à¥à¤·à¤¾ à¤µà¤¿à¤­à¤¾à¤—',
    backToHome: 'à¤¹à¥‹à¤® à¤ªà¥‡à¤œ à¤ªà¤° à¤µà¤¾à¤ªà¤¸',
    pageTitle: 'à¤¬à¥à¤²à¥‰à¤— à¤”à¤° à¤…à¤ªà¤¡à¥‡à¤Ÿ',
    pageSubtitle: 'à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ˆ-à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¥à¤•à¥‚à¤² à¤¸à¥‡ à¤¨à¤µà¥€à¤¨à¤¤à¤® à¤¸à¤®à¤¾à¤šà¤¾à¤° à¤”à¤° à¤…à¤‚à¤¤à¤°à¥à¤¦à¥ƒà¤·à¥à¤Ÿà¤¿',
    searchPlaceholder: 'à¤²à¥‡à¤– à¤–à¥‹à¤œà¥‡à¤‚...',
    allCategories: 'à¤¸à¤­à¥€ à¤¶à¥à¤°à¥‡à¤£à¤¿à¤¯à¤¾à¤‚',
    featuredPost: 'à¤µà¤¿à¤¶à¥‡à¤·',
    readMore: 'à¤”à¤° à¤ªà¤¢à¤¼à¥‡à¤‚',
    minRead: 'à¤®à¤¿à¤¨à¤Ÿ à¤ªà¤¢à¤¼à¥‡à¤‚',
    categories: [],
    blogPosts: [],
    noPostsFound: 'à¤†à¤ªà¤•à¥€ à¤–à¥‹à¤œ à¤¸à¥‡ à¤®à¥‡à¤² à¤–à¤¾à¤¨à¥‡ à¤µà¤¾à¤²à¥‡ à¤•à¥‹à¤ˆ à¤²à¥‡à¤– à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¥‡à¥¤',
    comingSoonTitle: 'à¤œà¤²à¥à¤¦ à¤”à¤° à¤²à¥‡à¤– à¤† à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚',
    comingSoonText: '',
    relatedLinks: 'à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤²à¤¿à¤‚à¤•',
    aboutUs: 'à¤¹à¤®à¤¾à¤°à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚',
    careers: 'à¤•à¤°à¤¿à¤¯à¤°',
    contactUs: 'à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚',
    copyright: 'Â© 2025 à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ˆ-à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¥à¤•à¥‚à¤²à¥¤ à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤',
    governmentPortal: 'à¤ªà¤‚à¤œà¤¾à¤¬ à¤¸à¤°à¤•à¤¾à¤° à¤•à¥€ à¤à¤• à¤ªà¤¹à¤²'
  },
  pa: {
    governmentOfPunjab: 'à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨°à¨•à¨¾à¨°',
    department: 'à¨¸à¨•à©‚à¨² à¨¸à¨¿à©±à¨–à¨¿à¨† à¨µà¨¿à¨­à¨¾à¨—',
    backToHome: 'à¨®à©à©±à¨– à¨ªà©°à¨¨à©‡ à¨¤à©‡ à¨µà¨¾à¨ªà¨¸',
    pageTitle: 'à¨¬à¨²à©Œà¨— à¨…à¨¤à©‡ à¨…à©±à¨ªà¨¡à©‡à¨Ÿ',
    pageSubtitle: 'à¨ªà©à¨°à¨—à¨¤à©€ à¨ˆ-à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨•à©‚à¨² à¨¤à©‹à¨‚ à¨¨à¨µà©€à¨¨à¨¤à¨® à¨–à¨¼à¨¬à¨°à¨¾à¨‚ à¨…à¨¤à©‡ à¨¸à©‚à¨',
    searchPlaceholder: 'à¨²à©‡à¨– à¨–à©‹à¨œà©‹...',
    allCategories: 'à¨¸à¨¾à¨°à©€à¨†à¨‚ à¨¸à¨¼à©à¨°à©‡à¨£à©€à¨†à¨‚',
    featuredPost: 'à¨µà¨¿à¨¸à¨¼à©‡à¨¸à¨¼',
    readMore: 'à¨¹à©‹à¨° à¨ªà©œà©à¨¹à©‹',
    minRead: 'à¨®à¨¿à©°à¨Ÿ à¨ªà©œà©à¨¹à©‹',
    categories: [],
    blogPosts: [],
    noPostsFound: 'à¨¤à©à¨¹à¨¾à¨¡à©€ à¨–à©‹à¨œ à¨¨à¨¾à¨² à¨®à©‡à¨² à¨–à¨¾à¨‚à¨¦à©‡ à¨•à©‹à¨ˆ à¨²à©‡à¨– à¨¨à¨¹à©€à¨‚ à¨®à¨¿à¨²à©‡à¥¤',
    comingSoonTitle: 'à¨¹à©‹à¨° à¨²à©‡à¨– à¨œà¨²à¨¦à©€ à¨† à¨°à¨¹à©‡ à¨¹à¨¨',
    comingSoonText: '',
    relatedLinks: 'à¨¤à©à¨°à©°à¨¤ à¨²à¨¿à©°à¨•',
    aboutUs: 'à¨¸à¨¾à¨¡à©‡ à¨¬à¨¾à¨°à©‡',
    careers: 'à¨•à¨°à©€à¨…à¨°',
    contactUs: 'à¨¸à¨¾à¨¡à©‡ à¨¨à¨¾à¨² à¨¸à©°à¨ªà¨°à¨• à¨•à¨°à©‹',
    copyright: 'Â© 2025 à¨ªà©à¨°à¨—à¨¤à©€ à¨ˆ-à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨•à©‚à¨²à¥¤ à¨¸à¨¾à¨°à©‡ à¨¹à©±à¨• à¨°à¨¾à¨–à¨µà©‡à¨‚ à¨¹à¨¨à¥¤',
    governmentPortal: 'à¨ªà©°à¨œà¨¾à¨¬ à¨¸à¨°à¨•à¨¾à¨° à¨¦à©€ à¨‡à©±à¨• à¨ªà¨¹à¨¿à¨²à¨•à¨¦à¨®à©€'
  }
};

export default function BlogPage() {
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const t = translations[lang];
  const categories = t.categories.length > 0 ? t.categories : translations.en.categories;
  const blogPosts = t.blogPosts.length > 0 ? t.blogPosts : translations.en.blogPosts;
  const comingSoonText = t.comingSoonText || translations.en.comingSoonText;

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts.find(post => post.featured);

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
      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.pageTitle}</h1>
            <p className="text-lg text-teal-100 max-w-2xl mx-auto">{t.pageSubtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {featuredPost && selectedCategory === 'All' && !searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden"
          >
            <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
              {t.featuredPost}
            </div>
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-4">
                {featuredPost.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{featuredPost.title}</h2>
              <p className="text-teal-100 mb-6">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-teal-200 mb-6">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {featuredPost.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredPost.readTime} {t.minRead}
                </span>
              </div>
              <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-teal-600 font-medium rounded-lg hover:bg-teal-50 transition">
                {t.readMore}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.filter(p => !p.featured || selectedCategory !== 'All' || searchQuery).map((post, index) => {
              const Icon = post.icon;
              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="h-48 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                    <Icon className="w-16 h-16 text-teal-500 dark:text-teal-400" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime} {t.minRead}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 transition line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{post.date}</span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t.noPostsFound}</p>
          </div>
        )}
      </div>

      {/* Coming Soon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8 text-center"
        >
          <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.comingSoonTitle}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">{comingSoonText}</p>
        </motion.div>
      </div>

      {/* Related Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.relatedLinks}</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            href="/about"
            className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
          >
            <User className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
              {t.aboutUs}
            </span>
          </Link>
          <Link
            href="/careers"
            className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
          >
            <GraduationCap className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
              {t.careers}
            </span>
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
          >
            <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
              {t.contactUs}
            </span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
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
