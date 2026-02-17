'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaVideo, FaBook, FaChartLine, 
  FaPlus, FaClock, FaCalendarAlt 
} from "react-icons/fa";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalClasses: 5,
    totalStudents: 127,
    upcomingSessions: 8,
    avgAttendance: 87
  });

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
            <p className="text-gray-600 font-medium mt-2">Welcome back! Here's your overview for today 🚀</p>
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

        {/* Recent Activity */}
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
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-6 p-6 glass-card border-2 border-purple-200 hover:border-purple-400 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl shadow-lg">
                  🎯
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-800">No recent activities yet</p>
                  <p className="text-gray-600">Start creating classes and sessions to see your activity here!</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
