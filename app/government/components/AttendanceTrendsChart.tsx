'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface AttendanceTrendsChartProps {
  schools: Array<{
    schoolId: string;
    schoolName: string;
    district: string;
    attendanceRate: number;
  }>;
}

export function AttendanceTrendsChart({ schools }: AttendanceTrendsChartProps) {
  // Generate 12-month simulated data for demonstration
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      // Simulate seasonal patterns
      let baseRate = 82;
      if (index === 11 || index === 0) baseRate = 75; // December/January - winter
      else if (index === 5 || index === 6) baseRate = 78; // June/July - summer
      else if (index >= 8 && index <= 10) baseRate = 88; // Sept-Nov - peak
      else if (index >= 2 && index <= 4) baseRate = 85; // March-May
      
      // Add variation
      const variation = (Math.random() - 0.5) * 8;
      const attendanceRate = Math.min(98, Math.max(65, baseRate + variation));
      
      return {
        month,
        monthIndex: index,
        attendanceRate: Number(attendanceRate.toFixed(1)),
        isFuture: index > currentMonth,
      };
    }).filter(d => !d.isFuture);
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    if (monthlyData.length === 0) return null;
    
    const rates = monthlyData.map(d => d.attendanceRate);
    const avgAttendance = rates.reduce((sum, r) => sum + r, 0) / rates.length;
    const highest = monthlyData.reduce((max, d) => d.attendanceRate > max.attendanceRate ? d : max, monthlyData[0]);
    const lowest = monthlyData.reduce((min, d) => d.attendanceRate < min.attendanceRate ? d : min, monthlyData[0]);
    const improvement = monthlyData.length > 1 
      ? monthlyData[monthlyData.length - 1].attendanceRate - monthlyData[0].attendanceRate 
      : 0;
    
    return { avgAttendance, highest, lowest, improvement };
  }, [monthlyData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold text-gray-900 dark:text-white">{label} 2025</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Attendance: <span className="font-bold text-primary">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Trends</h3>
              <p className="text-xs text-muted-foreground">12-month performance analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.avgAttendance.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.highest.attendanceRate}%
            </p>
            <p className="text-xs text-muted-foreground">Highest ({stats.highest.month})</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.lowest.attendanceRate}%
            </p>
            <p className="text-xs text-muted-foreground">Lowest ({stats.lowest.month})</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              stats.improvement >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {stats.improvement >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {stats.improvement >= 0 ? '+' : ''}{stats.improvement.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Year Change</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                domain={[60, 100]}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="attendanceRate"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#attendanceGradient)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Monthly Attendance Rate</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
