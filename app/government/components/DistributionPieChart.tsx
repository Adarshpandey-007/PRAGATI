'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Users, GraduationCap, School, ChevronDown } from 'lucide-react';

interface DistributionPieChartProps {
  schools: Array<{
    schoolId: string;
    schoolName: string;
    district: string;
    totalStudents: number;
    totalTeachers: number;
  }>;
}

export function DistributionPieChart({ schools }: DistributionPieChartProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Get unique districts
  const districts = useMemo(() => {
    const uniqueDistricts = [...new Set(schools.map(s => s.district))].filter(Boolean);
    return uniqueDistricts.sort();
  }, [schools]);

  // Calculate distribution based on selection
  const distributionData = useMemo(() => {
    const filteredSchools = selectedDistrict === 'all' 
      ? schools 
      : schools.filter(s => s.district === selectedDistrict);

    const totalStudents = filteredSchools.reduce((sum, s) => sum + s.totalStudents, 0);
    const totalTeachers = filteredSchools.reduce((sum, s) => sum + s.totalTeachers, 0);
    const schoolCount = filteredSchools.length;

    return {
      students: totalStudents,
      teachers: totalTeachers,
      schools: schoolCount,
      ratio: totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : 0,
      pieData: [
        { name: 'Students', value: totalStudents, color: '#8b5cf6' },
        { name: 'Teachers', value: totalTeachers, color: '#10b981' },
      ],
    };
  }, [schools, selectedDistrict]);

  const total = distributionData.students + distributionData.teachers;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="font-semibold text-gray-900 dark:text-white">{data.name}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Count: <span className="font-bold">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Percentage: <span className="font-bold">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex items-center justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Staff & Student Distribution</h3>
              <p className="text-xs text-muted-foreground">Proportion analysis by district</p>
            </div>
          </div>

          {/* District Selector */}
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
            >
              <option value="all">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Pie Chart */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distributionData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {/* Students Card */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                  <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Students</p>
                  <p className="text-xs text-muted-foreground">
                    {total > 0 ? ((distributionData.students / total) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {distributionData.students.toLocaleString()}
              </p>
            </div>

            {/* Teachers Card */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Teachers</p>
                  <p className="text-xs text-muted-foreground">
                    {total > 0 ? ((distributionData.teachers / total) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {distributionData.teachers.toLocaleString()}
              </p>
            </div>

            {/* Ratio & Schools */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
                <School className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{distributionData.schools}</p>
                <p className="text-xs text-muted-foreground">Schools</p>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-center">
                <Users className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{distributionData.ratio}:1</p>
                <p className="text-xs text-muted-foreground">Student:Teacher</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
