'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { saveAuthSession } from '@/lib/auth-storage';
import { getBackendUrl } from '@/lib/config';

type Role = 'STUDENT' | 'TEACHER' | 'PRINCIPAL' | 'GOVERNMENT' | 'ADMIN';

interface LoginCardProps {
  role: Role;
  title?: string; // Made optional as we'll use internal translations
  subtitle?: string; // Made optional
  redirectPath?: string;
}

interface LoginResponse {
  token: string;
  expiresIn: string;
  userId: string;
  role: string;
  studentId: string | null;
  teacherId: string | null;
  schoolId: string | null;
}

export function LoginCard({ role, redirectPath }: LoginCardProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      emailLabel: 'Email address',
      passwordLabel: 'Password',
      signInButton: 'Sign in',
      signingIn: 'Signing in...',
      backToRoles: 'Back to roles',
      invalidCredentials: 'Invalid credentials. Please check your email and password.',
      accountBlocked: 'Your account is blocked. Please contact your administrator.',
      genericError: 'Unable to sign in right now. Please try again.',
      connectionError: 'Unable to sign in right now. Please check your connection.',
      wrongRoleError: 'This account belongs to a different role.',
      demoLabel: 'Quick demo login',
      demoHint: 'Use the role test credentials',
      demoButton: 'Use Demo Credentials',
      roles: {
        STUDENT: {
          title: 'Student sign in',
          subtitle: 'Access your timetable, attendance and exam results.',
        },
        TEACHER: {
          title: 'Teacher sign in',
          subtitle: 'Mark attendance and track classroom progress.',
        },
        PRINCIPAL: {
          title: 'Principal sign in',
          subtitle: 'Monitor school performance and staff.',
        },
        GOVERNMENT: {
          title: 'Official sign in',
          subtitle: 'Access district reports and analytics.',
        },
        ADMIN: {
          title: 'Admin sign in',
          subtitle: 'Manage schools, teachers, and platform data.',
        },
      },
    },
    hi: {
      emailLabel: 'ईमेल पता',
      passwordLabel: 'पासवर्ड',
      signInButton: 'साइन इन करें',
      signingIn: 'साइन इन हो रहा है...',
      backToRoles: 'भूमिकाओं पर वापस जाएं',
      invalidCredentials: 'अमान्य साख। कृपया अपना ईमेल और पासवर्ड जांचें।',
      accountBlocked: 'आपका खाता अवरुद्ध है। कृपया अपने प्रशासक से संपर्क करें।',
      genericError: 'अभी साइन इन करने में असमर्थ। कृपया पुनः प्रयास करें।',
      connectionError: 'अभी साइन इन करने में असमर्थ। कृपया अपना कनेक्शन जांचें।',
      wrongRoleError: 'यह खाता एक अलग भूमिका का है।',
      demoLabel: 'त्वरित डेमो लॉगिन',
      demoHint: 'भूमिका परीक्षण साख का उपयोग करें',
      demoButton: 'डेमो साख उपयोग करें',
      roles: {
        STUDENT: {
          title: 'छात्र साइन इन',
          subtitle: 'अपनी समय सारिणी, उपस्थिति और परीक्षा परिणाम देखें।',
        },
        TEACHER: {
          title: 'शिक्षक साइन इन',
          subtitle: 'उपस्थिति दर्ज करें और कक्षा की प्रगति को ट्रैक करें।',
        },
        PRINCIPAL: {
          title: 'प्रधानाचार्य साइन इन',
          subtitle: 'स्कूल के प्रदर्शन और कर्मचारियों की निगरानी करें।',
        },
        GOVERNMENT: {
          title: 'अधिकारी साइन इन',
          subtitle: 'जिला रिपोर्ट और विश्लेषण तक पहुंचें।',
        },
        ADMIN: {
          title: 'एडमिन साइन इन',
          subtitle: 'स्कूल, शिक्षक और प्लेटफ़ॉर्म डेटा प्रबंधित करें।',
        },
      },
    },
    pa: {
      emailLabel: 'ਈਮੇਲ ਪਤਾ',
      passwordLabel: 'ਪਾਸਵਰਡ',
      signInButton: 'ਸਾਈਨ ਇਨ ਕਰੋ',
      signingIn: 'ਸਾਈਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ...',
      backToRoles: 'ਭੂਮਿਕਾਵਾਂ ਤੇ ਵਾਪਸ ਜਾਓ',
      invalidCredentials: 'ਗਲਤ ਵੇਰਵੇ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਈਮੇਲ ਅਤੇ ਪਾਸਵਰਡ ਚੈੱਕ ਕਰੋ।',
      accountBlocked: 'ਤੁਹਾਡਾ ਖਾਤਾ ਬਲੌਕ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਪ੍ਰਸ਼ਾਸਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
      genericError: 'ਹੁਣੇ ਸਾਈਨ ਇਨ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      connectionError: 'ਹੁਣੇ ਸਾਈਨ ਇਨ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਕਨੈਕਸ਼ਨ ਚੈੱਕ ਕਰੋ।',
      wrongRoleError: 'ਇਹ ਖਾਤਾ ਇੱਕ ਵੱਖਰੀ ਭੂਮਿਕਾ ਦਾ ਹੈ।',
      demoLabel: 'ਤੁਰੰਤ ਡੇਮੋ ਲੌਗਿਨ',
      demoHint: 'ਭੂਮਿਕਾ ਟੈਸਟ ਕ੍ਰੈਡੈਂਸ਼ਲ ਵਰਤੋ',
      demoButton: 'ਡੇਮੋ ਕ੍ਰੈਡੈਂਸ਼ਲ ਭਰੋ',
      roles: {
        STUDENT: {
          title: 'ਵਿਦਿਆਰਥੀ ਸਾਈਨ ਇਨ',
          subtitle: 'ਆਪਣੀ ਸਮਾਂ ਸਾਰਣੀ, ਹਾਜ਼ਰੀ ਅਤੇ ਪ੍ਰੀਖਿਆ ਨਤੀਜੇ ਦੇਖੋ।',
        },
        TEACHER: {
          title: 'ਅਧਿਆਪਕ ਸਾਈਨ ਇਨ',
          subtitle: 'ਹਾਜ਼ਰੀ ਲਗਾਓ ਅਤੇ ਕਲਾਸਰੂਮ ਦੀ ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰੋ।',
        },
        PRINCIPAL: {
          title: 'ਪ੍ਰਿੰਸੀਪਲ ਸਾਈਨ ਇਨ',
          subtitle: 'ਸਕੂਲ ਦੀ ਕਾਰਗੁਜ਼ਾਰੀ ਅਤੇ ਸਟਾਫ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।',
        },
        GOVERNMENT: {
          title: 'ਅਧਿਕਾਰੀ ਸਾਈਨ ਇਨ',
          subtitle: 'ਜ਼ਿਲ੍ਹਾ ਰਿਪੋਰਟਾਂ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।',
        },
        ADMIN: {
          title: 'ਐਡਮਿਨ ਸਾਈਨ ਇਨ',
          subtitle: 'ਸਕੂਲ, ਅਧਿਆਪਕ ਅਤੇ ਪਲੇਟਫਾਰਮ ਡਾਟਾ ਪ੍ਰਬੰਧਿਤ ਕਰੋ।',
        },
      },
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;
  const roleText = t.roles[role];

  const demoCredentials: Record<Role, { email: string; password: string }> = {
    ADMIN: { email: 'admin@mock.test', password: 'AdminPass123!' },
    GOVERNMENT: { email: 'government@mock.test', password: 'GovPass123!' },
    PRINCIPAL: { email: 'principal@mock.test', password: 'PrincipalPass123!' },
    TEACHER: { email: 'teacher@mock.test', password: 'TeacherPass123!' },
    STUDENT: { email: 'student@mock.test', password: 'StudentPass123!' },
  };

  const backendUrl = getBackendUrl();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError(t.invalidCredentials);
        } else if (response.status === 403) {
          setError(t.accountBlocked);
        } else {
          setError(t.genericError);
        }
        return;
      }

      const data = (await response.json()) as LoginResponse;

      if (data.role !== role) {
        setError(t.wrongRoleError);
        return;
      }

      saveAuthSession({
        token: data.token,
        role: data.role as 'STUDENT' | 'TEACHER' | 'PRINCIPAL' | 'GOVERNMENT' | 'ADMIN',
        userId: data.userId,
        studentId: data.studentId,
        teacherId: data.teacherId,
        schoolId: data.schoolId,
        // Use login email as display fallback until richer profile is loaded.
        name: email,
      });

      router.push(redirectPath ?? '/');
    } catch {
      setError(t.connectionError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border/50 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">{roleText.title}</h1>
              <p className="text-sm text-muted-foreground">{roleText.subtitle}</p>
            </div>

            <div className="mb-5 rounded-lg border border-dashed border-primary/35 bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary">{t.demoLabel}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t.demoHint}</p>
              <button
                type="button"
                onClick={() => {
                  setEmail(demoCredentials[role].email);
                  setPassword(demoCredentials[role].password);
                }}
                className="mt-2 w-full rounded-md border border-primary/25 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                {t.demoButton}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  {t.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  {t.passwordLabel}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.signingIn}
                  </>
                ) : (
                  t.signInButton
                )}
              </button>
            </form>
          </div>
          
          <div className="px-8 py-4 bg-muted/50 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              Protected by Pragati Secure Login System
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
