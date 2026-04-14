'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, TrendingDown, School, Users, ChevronRight, X } from 'lucide-react';

interface SchoolData {
  schoolId: string;
  schoolName: string;
  district: string;
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
}

interface RegionalHeatmapProps {
  schools: SchoolData[];
}

interface DistrictData {
  name: string;
  schools: SchoolData[];
  averageAttendance: number;
  totalStudents: number;
  totalTeachers: number;
  schoolCount: number;
  trend: 'up' | 'down' | 'stable';
}

export function RegionalHeatmap({ schools }: RegionalHeatmapProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  // Group schools by district
  const districtData = useMemo(() => {
    const districtMap = new Map<string, SchoolData[]>();
    
    schools.forEach((school) => {
      const district = school.district || 'Unknown District';
      const existing = districtMap.get(district) || [];
      districtMap.set(district, [...existing, school]);
    });

    const districts: DistrictData[] = Array.from(districtMap.entries()).map(([name, districtSchools]) => {
      const totalStudents = districtSchools.reduce((sum, s) => sum + s.totalStudents, 0);
      const totalTeachers = districtSchools.reduce((sum, s) => sum + s.totalTeachers, 0);
      
      // Calculate average attendance from actual school data
      const avgAttendance = districtSchools.length > 0
        ? districtSchools.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / districtSchools.length
        : 0;

      return {
        name,
        schools: districtSchools,
        averageAttendance: avgAttendance,
        totalStudents,
        totalTeachers,
        schoolCount: districtSchools.length,
        trend: avgAttendance > 0.85 ? 'up' : avgAttendance < 0.75 ? 'down' : 'stable',
      };
    });

    // Sort by attendance rate
    return districts.sort((a, b) => b.averageAttendance - a.averageAttendance);
  }, [schools]);

  const getHeatmapColor = (rate: number) => {
    if (rate >= 0.9) return 'from-emerald-400 to-emerald-600';
    if (rate >= 0.8) return 'from-green-400 to-green-600';
    if (rate >= 0.75) return 'from-yellow-400 to-yellow-600';
    if (rate >= 0.6) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getHeatmapBg = (rate: number) => {
    if (rate >= 0.9) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30';
    if (rate >= 0.8) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30';
    if (rate >= 0.75) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30';
    if (rate >= 0.6) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30';
  };

  const getTextColor = (rate: number) => {
    if (rate >= 0.9) return 'text-emerald-600 dark:text-emerald-400';
    if (rate >= 0.8) return 'text-green-600 dark:text-green-400';
    if (rate >= 0.75) return 'text-yellow-600 dark:text-yellow-400';
    if (rate >= 0.6) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Overall stats
  const overallStats = useMemo(() => {
    if (districtData.length === 0) return null;
    
    const totalStudents = districtData.reduce((sum, d) => sum + d.totalStudents, 0);
    const totalTeachers = districtData.reduce((sum, d) => sum + d.totalTeachers, 0);
    const totalSchools = districtData.reduce((sum, d) => sum + d.schoolCount, 0);
    const avgAttendance = districtData.reduce((sum, d) => sum + d.averageAttendance, 0) / districtData.length;

    return { totalStudents, totalTeachers, totalSchools, avgAttendance };
  }, [districtData]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Regional Attendance Heatmap</h3>
              <p className="text-xs text-muted-foreground">District-wise attendance performance overview</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-muted-foreground font-medium">Performance:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
              <span>Excellent (≥90%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
              <span>Good (75-89%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600" />
              <span>Needs Attention (&lt;75%)</span>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        {overallStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.totalSchools}</p>
              <p className="text-xs text-muted-foreground">Schools</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.totalStudents.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.totalTeachers}</p>
              <p className="text-xs text-muted-foreground">Teachers</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${getTextColor(overallStats.avgAttendance)}`}>
                {(overallStats.avgAttendance * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Attendance</p>
            </div>
          </div>
        )}

        {/* Heatmap Grid */}
        {districtData.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No district data available</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {districtData.map((district, index) => (
                <motion.div
                  key={district.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredDistrict(district.name)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  onClick={() => setSelectedDistrict(district)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${getHeatmapBg(district.averageAttendance)} ${
                    hoveredDistrict === district.name ? 'scale-105 shadow-lg z-10' : ''
                  }`}
                >
                  {/* Top Progress Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full bg-gradient-to-r ${getHeatmapColor(district.averageAttendance)}`}
                      style={{ width: `${district.averageAttendance * 100}%` }}
                    />
                  </div>

                  <div className="pt-2">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{district.name}</h4>
                        <p className="text-xs text-muted-foreground">{district.schoolCount} Schools</p>
                      </div>
                      <div className={`text-lg font-bold ${getTextColor(district.averageAttendance)}`}>
                        {(district.averageAttendance * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{district.totalStudents}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <School className="w-3 h-3" />
                        <span>{district.totalTeachers}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        {district.trend === 'up' ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Improving</span>
                          </>
                        ) : district.trend === 'down' ? (
                          <>
                            <TrendingDown className="w-3 h-3 text-red-500" />
                            <span className="text-red-600 dark:text-red-400">Declining</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Stable</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* District Detail Modal */}
      {selectedDistrict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-2xl"
          >
            {/* Modal Header */}
            <div className={`p-6 bg-gradient-to-r ${getHeatmapColor(selectedDistrict.averageAttendance)} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedDistrict.name}</h3>
                  <p className="text-white/80 text-sm">District Details</p>
                </div>
                <button
                  onClick={() => setSelectedDistrict(null)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* District Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedDistrict.schoolCount}</p>
                  <p className="text-xs text-white/80">Schools</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedDistrict.totalStudents}</p>
                  <p className="text-xs text-white/80">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedDistrict.totalTeachers}</p>
                  <p className="text-xs text-white/80">Teachers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{(selectedDistrict.averageAttendance * 100).toFixed(1)}%</p>
                  <p className="text-xs text-white/80">Avg Attendance</p>
                </div>
              </div>
            </div>

            {/* Schools List */}
            <div className="p-6 max-h-[40vh] overflow-y-auto">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Schools in {selectedDistrict.name}
              </h4>
              <div className="space-y-3">
                {selectedDistrict.schools.map((school) => {
                  const schoolAttendance = school.attendanceRate || 0;
                  return (
                    <div
                      key={school.schoolId}
                      className={`p-4 rounded-xl border-2 ${getHeatmapBg(schoolAttendance)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">{school.schoolName}</h5>
                        <span className={`text-lg font-bold ${getTextColor(schoolAttendance)}`}>
                          {(schoolAttendance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {school.totalStudents} Students
                        </span>
                        <span className="flex items-center gap-1">
                          <School className="w-3 h-3" />
                          {school.totalTeachers} Teachers
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50">
              <button
                onClick={() => setSelectedDistrict(null)}
                className="w-full px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
