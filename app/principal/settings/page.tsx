'use client';

/**
 * School Settings Page
 * Allows principals to configure school features
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Scan,
  CreditCard,
  Save,
  Loader2,
  Info,
  RefreshCw,
  Settings,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { Language, translations, getTranslation } from '@/lib/translations';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

interface SchoolSettings {
  teacherAttendanceEnabled: boolean;
  faceAttendanceEnabled: boolean;
  multiFaceAttendanceEnabled: boolean;
  rfidEnabled: boolean;
  updatedAt?: string;
}

const DEFAULT_SETTINGS: SchoolSettings = {
  teacherAttendanceEnabled: true,
  faceAttendanceEnabled: true,
  multiFaceAttendanceEnabled: true,
  rfidEnabled: true,
};

export default function SchoolSettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<SchoolSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  const t = (section: keyof typeof translations, key: string) => getTranslation(section, key, lang);
  const tp = (key: keyof typeof translations.schoolSettingsPage) => getTranslation('schoolSettingsPage', key, lang);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pragati_language', newLang);
    }
  };

  useEffect(() => {
    loadSettings();
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('pragati_language') as Language;
      if (savedLang === 'en' || savedLang === 'pa' || savedLang === 'hi') {
        setLang(savedLang);
      }
    }
  }, []);

  useEffect(() => {
    // Check if settings have changed
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('pragati_token');
      const schoolId = localStorage.getItem('pragati_schoolId');

      if (!token || !schoolId) {
        toast.error('Please log in again');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/core/schools/${schoolId}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const loadedSettings: SchoolSettings = {
          teacherAttendanceEnabled: data.teacherAttendanceEnabled ?? true,
          faceAttendanceEnabled: data.faceAttendanceEnabled ?? true,
          multiFaceAttendanceEnabled: data.multiFaceAttendanceEnabled ?? true,
          rfidEnabled: data.rfidEnabled ?? true,
          updatedAt: data.updatedAt,
        };
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } else {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('pragati_token');
      const schoolId = localStorage.getItem('pragati_schoolId');

      if (!token || !schoolId) {
        toast.error('Please log in again');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/core/schools/${schoolId}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedSettings: SchoolSettings = {
          teacherAttendanceEnabled: data.teacherAttendanceEnabled ?? settings.teacherAttendanceEnabled,
          faceAttendanceEnabled: data.faceAttendanceEnabled ?? settings.faceAttendanceEnabled,
          multiFaceAttendanceEnabled: data.multiFaceAttendanceEnabled ?? settings.multiFaceAttendanceEnabled,
          rfidEnabled: data.rfidEnabled ?? settings.rfidEnabled,
          updatedAt: data.updatedAt,
        };
        setSettings(updatedSettings);
        setOriginalSettings(updatedSettings);
        toast.success(data.message || 'Settings saved successfully');
      } else {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. The backend endpoint may not be available yet.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof SchoolSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('actions', 'schoolSettingsDesc')}</p>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">{t('actions', 'schoolSettings')}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                {tp('unsavedChanges')}
              </Badge>
            )}
            <Button variant="outline" onClick={loadSettings} disabled={isLoading || isSaving}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {tp('refresh')}
            </Button>
            <Button onClick={saveSettings} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tp('saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {tp('saveChanges')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
          <div className="absolute top-0 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-primary/20 bg-primary/5 text-primary">
                <Shield className="w-3.5 h-3.5" />
                {tp('secureControls')}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">{t('actions', 'schoolSettings')}</h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    {t('actions', 'schoolSettingsDesc')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{tp('statusLabel')}</p>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${hasChanges ? 'bg-amber-500' : 'bg-green-500'}`} />
                  {hasChanges ? tp('changesPending') : tp('allChangesSaved')}
                </div>
                {settings.updatedAt && (
                  <p>{tp('lastUpdated')}: {new Date(settings.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Teacher Attendance */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <CardTitle>{tp('teacherAttendanceTitle')}</CardTitle>
                      <CardDescription>{tp('teacherAttendanceDesc')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="teacherAttendance">{tp('enableTeacherAttendance')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tp('teacherAttendanceHelper')}
                      </p>
                    </div>
                    <Switch
                      id="teacherAttendance"
                      checked={settings.teacherAttendanceEnabled}
                      onCheckedChange={() => handleToggle('teacherAttendanceEnabled')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Face Recognition */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Scan className="h-5 w-5 text-purple-600" />
                    <div>
                      <CardTitle>{tp('faceAttendanceTitle')}</CardTitle>
                      <CardDescription>{tp('faceAttendanceDesc')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="faceRegistration">{tp('enableFaceRegistration')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tp('faceRegistrationHelper')}
                      </p>
                    </div>
                    <Switch
                      id="faceRegistration"
                      checked={settings.faceAttendanceEnabled}
                      onCheckedChange={() => handleToggle('faceAttendanceEnabled')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="multiFace">{tp('enableMultiFace')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tp('multiFaceHelper')}
                      </p>
                    </div>
                    <Switch
                      id="multiFace"
                      checked={settings.multiFaceAttendanceEnabled}
                      onCheckedChange={() => handleToggle('multiFaceAttendanceEnabled')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* RFID */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle>{tp('rfidTitle')}</CardTitle>
                      <CardDescription>{tp('rfidDesc')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="rfid">{tp('enableRFID')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tp('rfidHelper')}
                      </p>
                    </div>
                    <Switch
                      id="rfid"
                      checked={settings.rfidEnabled}
                      onCheckedChange={() => handleToggle('rfidEnabled')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Info & Reset */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle>{tp('infoTitle')}</CardTitle>
                  <CardDescription>{tp('infoDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3 text-sm text-muted-foreground max-w-2xl">
                    <Info className="h-4 w-4 mt-0.5 text-primary" />
                    <p>
                      {tp('infoBody')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetToDefaults} disabled={isSaving || isLoading}>
                      {tp('resetToDefaults')}
                    </Button>
                    <Button onClick={saveSettings} disabled={isSaving || !hasChanges}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {tp('saving')}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {tp('saveChanges')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>{tp('footerConsole')}</span>
          </div>
          <span>{tp('footerHelp')}</span>
        </div>
      </footer>
    </div>
  );
}
