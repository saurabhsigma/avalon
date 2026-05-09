/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TopicJourneyMap from '@/components/TopicJourneyMap';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaVideo, FaBook, FaChartLine, 
  FaPlus, FaClock
} from "react-icons/fa";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    upcomingSessions: 0,
    avgAttendance: 0
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [subjectRoadmaps, setSubjectRoadmaps] = useState<any[]>([]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch('/api/teacher/overview');
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalClasses: data.totalClasses || 0,
            totalStudents: data.totalStudents || 0,
            upcomingSessions: data.upcomingSessions || 0,
            avgAttendance: data.avgAttendance || 0,
          });
          setClasses(data.classes || []);
          setSubjectRoadmaps(data.subjectRoadmaps || []);
        }
      } catch (err) {
        console.error('Failed to load teacher overview', err);
      }
    };

    fetchOverview();
  }, []);

  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const fetchRecentSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setRecentSessions(data.sessions?.slice(0,6) || []);
      }
    } catch (err) {
      console.error('Failed to load recent sessions', err);
    }
  };

  useEffect(() => {
    fetchRecentSessions();
  }, []);

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session and its attendance/materials?')) return;
    try {
      const res = await fetch(`/api/sessions?id=${sessionId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete session');
      }
      // refresh
      fetchRecentSessions();
      // refresh overview
      const ov = await fetch('/api/teacher/overview');
      if (ov.ok) {
        const data = await ov.json();
        setStats({
          totalClasses: data.totalClasses || 0,
          totalStudents: data.totalStudents || 0,
          upcomingSessions: data.upcomingSessions || 0,
          avgAttendance: data.avgAttendance || 0,
        });
        setSubjectRoadmaps(data.subjectRoadmaps || []);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to delete session');
    }
  };

  return (
    <DashboardLayout userRole="teacher" userName="Teacher">
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 font-medium mt-2">Welcome back! Here&apos;s your overview for today 🚀</p>
          </div>
          <Link href="/teacher/classes/create">
            <motion.div 
              whileHover={{ y: -2 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button className="doodle-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-white shadow-xl text-lg px-6 py-6">
                <FaPlus className="mr-2" />
                New Class
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              title: "Total Classes", 
              value: stats.totalClasses, 
              subtitle: "Active classes",
              icon: FaUsers,
              gradient: "from-blue-400 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100"
            },
            { 
              title: "Total Students", 
              value: stats.totalStudents, 
              subtitle: "Across all classes",
              icon: FaUsers,
              gradient: "from-green-400 to-green-600",
              bgGradient: "from-green-50 to-green-100"
            },
            { 
              title: "Upcoming Sessions", 
              value: stats.upcomingSessions, 
              subtitle: "This week",
              icon: FaVideo,
              gradient: "from-purple-400 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100"
            },
            { 
              title: "Avg Attendance", 
              value: `${stats.avgAttendance}%`, 
              subtitle: "Last 30 days",
              icon: FaChartLine,
              gradient: "from-orange-400 to-orange-600",
              bgGradient: "from-orange-50 to-orange-100"
            }
          ].map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -2 }}
              className="relative group"
            >
              <div className={`stat-card bg-gradient-to-br ${stat.bgGradient} border-2 border-white relative overflow-hidden group`}>
                {/* Static Icon Background - removed animation for performance */}
                <div className="absolute top-0 right-0 opacity-10 text-7xl -mr-4 -mt-4">
                  <stat.icon />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">{stat.title}</span>
                    <motion.div
                      whileHover={{ 
                        scale: 1.2,
                        rotate: [0, -10, 10, -10, 0]
                      }}
                      transition={{ duration: 0.5 }}
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <stat.icon className="text-2xl text-white" />
                    </motion.div>
                  </div>
                  <div className={`text-4xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">{stat.subtitle}</p>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Class Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Class Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <div className="py-6 text-gray-600">No class performance data available.</div>
              ) : (
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-lg">{cls.name}</div>
                          <div className="text-sm text-gray-600">Students: {cls.studentsCount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Avg Attendance</div>
                          <div className="font-bold">{cls.classAttendanceAvg}%</div>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-3">
                        {cls.students.slice(0,9).map((s: any) => (
                          <div key={s.id} className="p-2 border rounded flex items-center justify-between">
                            <div>
                              <div className="font-medium">{s.name}</div>
                              <div className="text-xs text-gray-500">{s.email}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Attendance</div>
                              <div className="font-semibold">{s.attendanceRate}%</div>
                              <div className="text-sm text-gray-500">Tests Avg</div>
                              <div className="font-semibold">{s.testAvg !== null ? `${s.testAvg}%` : '—'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="gradient-card border-2 border-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                ⚡ Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { href: '/teacher/classes/create', icon: FaUsers, label: 'Create Class', gradient: 'from-blue-500 to-cyan-500', emoji: '📚' },
                  { href: '/teacher/sessions/create', icon: FaVideo, label: 'Schedule Session', gradient: 'from-purple-500 to-pink-500', emoji: '🎥' },
                  { href: '/teacher/subjects', icon: FaBook, label: 'Manage Subjects', gradient: 'from-green-500 to-emerald-500', emoji: '📖' }
                ].map((action, index) => (
                  <Link key={action.href} href={action.href}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ y: -2 }} 
                      whileTap={{ scale: 0.95 }}
                      className="group"
                    >
                      <div className={`relative glass-card border-2 border-white h-full p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                        {/* Gradient Background on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow`}>
                            <span className="text-4xl">{action.emoji}</span>
                          </div>
                          <span className="font-bold text-lg text-gray-800 group-hover:text-purple-600 transition-colors">{action.label}</span>
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="gradient-card border-2 border-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Topic Journey Maps
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjectRoadmaps.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
                  Generate a subject roadmap to unlock the village view and per-topic performance hover cards.
                </div>
              ) : (
                <div className="space-y-6">
                  {subjectRoadmaps.map((roadmap) => (
                    <TopicJourneyMap
                      key={roadmap.subjectId}
                      role="teacher"
                      subjectName={`${roadmap.subjectName} • ${roadmap.className}`}
                      subjectColor={roadmap.color}
                      learningTheme={roadmap.learningTheme}
                      topics={roadmap.topicStats}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="gradient-card border-2 border-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FaClock className="text-white" />
                </div>
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="p-6 text-gray-600">No recent sessions. Schedule one to start.</div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((s) => (
                    <div key={s._id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-semibold text-gray-900">{s.title}</p>
                        <p className="text-sm text-gray-600">{new Date(s.scheduledAt).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{s.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/teacher/sessions/${s._id}`}> 
                          <Button variant="outline">View</Button>
                        </Link>
                        <Button variant="destructive" onClick={() => deleteSession(s._id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
