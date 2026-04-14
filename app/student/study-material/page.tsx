"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  Filter, 
  ExternalLink, 
  Loader2, 
  PlayCircle, 
  FileText, 
  MonitorPlay,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudent } from '../context/StudentContext';

interface Resource {
  identifier: string;
  name: string;
  appIcon?: string;
  posterImage?: string;
  description?: string;
  primaryCategory: string;
  subject?: string[];
  gradeLevel?: string[];
  medium?: string[];
  artifactUrl?: string;
  mimeType: string;
  thumbnail?: string;
}

const translations = {
  en: {
    backToDashboard: 'Back to Dashboard',
    studyMaterial: 'Study Material',
    poweredBy: 'Powered by DIKSHA - National Digital Infrastructure for Teachers',
    goiInitiative: 'Government of India Initiative',
    searchPlaceholder: 'Search for topics, chapters...',
    class: 'Class',
    subject: 'Subject',
    medium: 'Medium',
    allSubjects: 'All Subjects',
    mathematics: 'Mathematics',
    science: 'Science',
    english: 'English',
    hindi: 'Hindi',
    punjabi: 'Punjabi',
    socialScience: 'Social Science',
    evs: 'EVS',
    fetching: 'Fetching resources from Diksha...',
    preview: 'Preview',
    noResources: 'No resources found matching your criteria',
    loadMore: 'Load More',
    openOnDiksha: 'Open on Diksha',
    close: 'Close',
    resourceNotEmbeddable: 'This resource cannot be embedded directly.',
    clickToOpen: 'Click below to open it on the Diksha portal.',
  },
  pa: {
    backToDashboard: 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਵਾਪਸ ਜਾਓ',
    studyMaterial: 'ਅਧਿਐਨ ਸਮੱਗਰੀ',
    poweredBy: 'ਦੀਕਸ਼ਾ ਦੁਆਰਾ ਸੰਚਾਲਿਤ - ਅਧਿਆਪਕਾਂ ਲਈ ਰਾਸ਼ਟਰੀ ਡਿਜੀਟਲ ਬੁਨਿਆਦੀ ਢਾਂਚਾ',
    goiInitiative: 'ਭਾਰਤ ਸਰਕਾਰ ਦੀ ਪਹਿਲਕਦਮੀ',
    searchPlaceholder: 'ਵਿਸ਼ੇ, ਅਧਿਆਏ ਖੋਜੋ...',
    class: 'ਜਮਾਤ',
    subject: 'ਵਿਸ਼ਾ',
    medium: 'ਮਾਧਿਅਮ',
    allSubjects: 'ਸਾਰੇ ਵਿਸ਼ੇ',
    mathematics: 'ਗਣਿਤ',
    science: 'ਵਿਗਿਆਨ',
    english: 'ਅੰਗਰੇਜ਼ੀ',
    hindi: 'ਹਿੰਦੀ',
    punjabi: 'ਪੰਜਾਬੀ',
    socialScience: 'ਸਮਾਜਿਕ ਵਿਗਿਆਨ',
    evs: 'ਈ.ਵੀ.ਐਸ',
    fetching: 'ਦੀਕਸ਼ਾ ਤੋਂ ਸਰੋਤ ਪ੍ਰਾਪਤ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...',
    preview: 'ਝਲਕ',
    noResources: 'ਤੁਹਾਡੇ ਮਾਪਦੰਡਾਂ ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਕੋਈ ਸਰੋਤ ਨਹੀਂ ਮਿਲਿਆ',
    loadMore: 'ਹੋਰ ਲੋਡ ਕਰੋ',
    openOnDiksha: 'ਦੀਕਸ਼ਾ \'ਤੇ ਖੋਲ੍ਹੋ',
    close: 'ਬੰਦ ਕਰੋ',
    resourceNotEmbeddable: 'ਇਸ ਸਰੋਤ ਨੂੰ ਸਿੱਧਾ ਏਮਬੈਡ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ।',
    clickToOpen: 'ਦੀਕਸ਼ਾ ਪੋਰਟਲ \'ਤੇ ਖੋਲ੍ਹਣ ਲਈ ਹੇਠਾਂ ਕਲਿੱਕ ਕਰੋ।',
  },
  hi: {
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',
    studyMaterial: 'अध्ययन सामग्री',
    poweredBy: 'दीक्षा द्वारा संचालित - शिक्षकों के लिए राष्ट्रीय डिजिटल बुनियादी ढांचा',
    goiInitiative: 'भारत सरकार की पहल',
    searchPlaceholder: 'विषय, अध्याय खोजें...',
    class: 'कक्षा',
    subject: 'विषय',
    medium: 'माध्यम',
    allSubjects: 'सभी विषय',
    mathematics: 'गणित',
    science: 'विज्ञान',
    english: 'अंग्रेजी',
    hindi: 'हिंदी',
    punjabi: 'पंजाबी',
    socialScience: 'सामाजिक विज्ञान',
    evs: 'ईवीएस',
    fetching: 'दीक्षा से संसाधन प्राप्त किए जा रहे हैं...',
    preview: 'पूर्वावलोकन',
    noResources: 'आपके मानदंडों से मेल खाने वाला कोई संसाधन नहीं मिला',
    loadMore: 'और लोड करें',
    openOnDiksha: 'दीक्षा पर खोलें',
    close: 'बंद करें',
    resourceNotEmbeddable: 'इस संसाधन को सीधे एम्बेड नहीं किया जा सकता है।',
    clickToOpen: 'दीक्षा पोर्टल पर खोलने के लिए नीचे क्लिक करें।',
  },
};

export default function StudyMaterialPage() {
  const router = useRouter();
  const { language, studentProfile } = useStudent();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  // Filters
  const [board, setBoard] = useState("ncert");
  const [medium, setMedium] = useState("english");
  // Auto-select student's grade level from profile, fallback to Class 10
  const studentGrade = studentProfile?.gradeLevel || studentProfile?.classroom?.grade?.level;
  const [gradeLevel, setGradeLevel] = useState(studentGrade ? `Class ${studentGrade}` : "Class 10");
  const [subject, setSubject] = useState("all");

  const LIMIT = 20;

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diksha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          board,
          medium,
          gradeLevel,
          subject,
          limit: LIMIT,
          offset: (page - 1) * LIMIT
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setResources(data.result.content || []);
          setTotalCount(data.result.count || 0);
        } else {
          setResources([]);
          setTotalCount(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch resources", error);
    } finally {
      setLoading(false);
    }
  };

  // Update grade level when student profile loads
  useEffect(() => {
    const grade = studentProfile?.gradeLevel || studentProfile?.classroom?.grade?.level;
    if (grade) {
      setGradeLevel(`Class ${grade}`);
    }
  }, [studentProfile?.gradeLevel, studentProfile?.classroom?.grade?.level]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on filter change
      fetchResources();
    }, 500);
    return () => clearTimeout(timer);
  }, [query, board, medium, gradeLevel, subject]);

  useEffect(() => {
    fetchResources();
  }, [page]);

  const getIconForType = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('video') || mimeType.includes('mp4')) return <PlayCircle className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes('html') || mimeType.includes('ecml')) return <MonitorPlay className="w-5 h-5 text-green-500" />;
    return <BookOpen className="w-5 h-5 text-orange-500" />;
  };

  const getThumbnail = (resource: Resource) => {
    // 1. Prioritize YouTube thumbnails for video content (Higher quality than appIcon)
    if (resource.artifactUrl && (resource.artifactUrl.includes('youtube.com') || resource.artifactUrl.includes('youtu.be'))) {
      const videoId = resource.artifactUrl.split('v=')[1]?.split('&')[0] || resource.artifactUrl.split('/').pop();
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    // 2. Then check explicit image fields
    if (resource.posterImage) return resource.posterImage;
    if (resource.thumbnail) return resource.thumbnail;
    if (resource.appIcon) return resource.appIcon;
    
    return null;
  };

  const isEmbeddable = (resource: Resource) => {
    const mime = resource.mimeType.toLowerCase();
    return (
      mime.includes('pdf') || 
      mime.includes('video') || 
      mime.includes('mp4') || 
      mime.includes('webm')
    ) && resource.artifactUrl;
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent hover:text-primary mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToDashboard}
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            {t.studyMaterial}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.poweredBy}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
          <GraduationCap className="w-3.5 h-3.5" />
          {t.goiInitiative}
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 lg:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t.searchPlaceholder}
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-2">
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger>
                <SelectValue placeholder={t.class} />
              </SelectTrigger>
              <SelectContent>
                {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3 lg:col-span-3">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder={t.subject} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allSubjects}</SelectItem>
                <SelectItem value="mathematics">{t.mathematics}</SelectItem>
                <SelectItem value="science">{t.science}</SelectItem>
                <SelectItem value="english">{t.english}</SelectItem>
                <SelectItem value="hindi">{t.hindi}</SelectItem>
                <SelectItem value="social science">{t.socialScience}</SelectItem>
                <SelectItem value="environmental studies">{t.evs}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <Select value={medium} onValueChange={setMedium}>
              <SelectTrigger>
                <SelectValue placeholder={t.medium} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">{t.english}</SelectItem>
                <SelectItem value="hindi">{t.hindi}</SelectItem>
                <SelectItem value="punjabi">{t.punjabi}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results Grid */}
      {loading && page === 1 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t.fetching}</p>
        </div>
      ) : resources.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.identifier}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800 overflow-hidden group hover:-translate-y-1">
                  <div className="aspect-video w-full bg-gray-100 dark:bg-slate-900 relative overflow-hidden">
                    {getThumbnail(resource) ? (
                      <img 
                        src={getThumbnail(resource)!} 
                        alt={resource.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to a generic placeholder if image fails
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                          e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.add('flex');
                        }}
                      />
                    ) : null}
                    
                    <div className={`fallback-icon w-full h-full items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 absolute inset-0 ${getThumbnail(resource) ? 'hidden' : 'flex'}`}>
                      {resource.mimeType.includes('video') || resource.mimeType.includes('mp4') ? (
                         <PlayCircle className="w-12 h-12 text-indigo-300 dark:text-indigo-600" />
                      ) : (
                         <BookOpen className="w-12 h-12 text-indigo-200 dark:text-indigo-800" />
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white/90 text-black hover:bg-white shadow-sm backdrop-blur-sm">
                        {resource.primaryCategory}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="gap-2"
                        onClick={() => setSelectedResource(resource)}
                      >
                        <Maximize2 className="w-4 h-4" />
                        {t.preview}
                      </Button>
                    </div>
                  </div>
                  
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base font-semibold line-clamp-2 leading-tight" title={resource.name}>
                        {resource.name}
                      </CardTitle>
                      {getIconForType(resource.mimeType)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0 flex-1">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {resource.subject?.map(s => (
                        <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                      {resource.gradeLevel?.map(g => (
                        <Badge key={g} variant="secondary" className="text-[10px]">{g}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                    {resource.medium?.join(", ")}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {resources.length < totalCount && (
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t.loadMore}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t.noResources}</h3>
          <p className="text-muted-foreground max-w-md">
            Try adjusting your filters or search query to find what you're looking for.
          </p>
        </div>
      )}

      {/* Resource Viewer Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedResource(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    {getIconForType(selectedResource.mimeType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{selectedResource.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedResource.subject?.join(", ")} • {selectedResource.gradeLevel?.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://diksha.gov.in/play/content/${selectedResource.identifier}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t.openOnDiksha}
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedResource(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 bg-gray-100 dark:bg-black relative overflow-hidden">
                {isEmbeddable(selectedResource) ? (
                   <iframe
                    src={selectedResource.artifactUrl}
                    className="w-full h-full min-h-[60vh]"
                    allowFullScreen
                    title={selectedResource.name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                      <ExternalLink className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t.resourceNotEmbeddable}</h3>
                    <p className="text-muted-foreground mb-8 max-w-md">
                      {t.clickToOpen}
                    </p>
                    <Button size="lg" asChild className="gap-2">
                      <a href={`https://diksha.gov.in/play/content/${selectedResource.identifier}`} target="_blank" rel="noopener noreferrer">
                        {t.openOnDiksha} <ArrowRight className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}