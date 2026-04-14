"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Download, Calendar, Filter, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('month');
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('pragati_token');
        if (!token) return;

        const now = new Date();
        let start, end;

        if (timeRange === 'week') {
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
          start = new Date(now.setDate(diff)).toISOString().split('T')[0];
          end = new Date().toISOString().split('T')[0];
        } else if (timeRange === 'month') {
          start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        } else {
          // Year
          start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        }

        const res = await fetch(`${backendUrl}/api/reports/attendance/teacher?start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const jsonData = await res.json();
          setData(jsonData);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('pragati_token');
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const res = await fetch(`${backendUrl}/api/reports/attendance/teacher/pdf?start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${start}-${end}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Report downloaded successfully",
        });
      } else {
        throw new Error('Failed to download');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  // Prepare chart data with fallbacks because report payloads can vary by endpoint.
  const classroomData = data?.classrooms?.map((c: any) => {
    const classroomId = c.classroomId || c.id || 'Unknown';
    const gradeName = c.grade?.name;
    const sectionLabel = c.section?.label;

    const rateFromAggregate =
      typeof c.totalRecords === 'number' && c.totalRecords > 0
        ? (Number(c.present || 0) / c.totalRecords) * 100
        : null;

    const rate =
      typeof c.attendanceRate === 'number'
        ? (c.attendanceRate > 1 ? c.attendanceRate : c.attendanceRate * 100)
        : rateFromAggregate ?? 0;

    return {
      name: gradeName && sectionLabel ? `${gradeName} ${sectionLabel}` : `Classroom ${classroomId}`,
      rate: Number(rate.toFixed(1)),
      present: Number(c.present || 0),
      absent: Number(c.absent || 0),
    };
  }) || [];

  // Aggregate trend data (simplified for demo as API returns trend per classroom)
  // In a real app, we might want to show trend for a specific classroom or average
  const trendData = data?.classrooms?.[0]?.trend?.map((t: any) => ({
    date: new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    rate: (t.attendanceRate * 100).toFixed(1)
  })) || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-orange-400 mb-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              Performance Insights
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Analytics
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Detailed insights into student attendance
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px] bg-white dark:bg-slate-950">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleDownload} className="bg-white dark:bg-slate-950">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Rate by Classroom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle>Classroom Performance</CardTitle>
                <CardDescription>Average attendance rate per classroom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classroomData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: '1px solid #e5e7eb', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      />
                      <Bar 
                        dataKey="rate" 
                        fill="#613AF5"
                        radius={[4, 4, 0, 0]} 
                        name="Attendance Rate (%)" 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendance Trend (First Classroom) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>Daily attendance rate over time (Primary Classroom)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: '1px solid #e5e7eb', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#613AF5"
                          strokeWidth={3} 
                          dot={{ r: 4, fill: "#613AF5", strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          name="Attendance Rate (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-slate-900/50">
                      No trend data available for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
