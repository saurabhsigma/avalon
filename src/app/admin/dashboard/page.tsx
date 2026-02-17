'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaUsers, FaChalkboardTeacher, FaGraduationCap, FaVideo, FaClipboardList, FaChartLine } from 'react-icons/fa';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName="Admin">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-xl font-bold text-gray-700">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-green-800">Admin Dashboard</h1>
          <p className="text-gray-700 font-medium">Overview of the entire platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="doodle-card bg-white border-4 border-green-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-3 border-green-600">
                    <FaChalkboardTeacher className="text-3xl text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Teachers</p>
                    <p className="text-3xl font-bold text-green-800">{analytics?.overview.teachers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="doodle-card bg-white border-4 border-blue-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-3 border-blue-600">
                    <FaGraduationCap className="text-3xl text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Students</p>
                    <p className="text-3xl font-bold text-blue-800">{analytics?.overview.students || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="doodle-card bg-white border-4 border-yellow-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center border-3 border-yellow-600">
                    <FaUsers className="text-3xl text-yellow-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Classes</p>
                    <p className="text-3xl font-bold text-yellow-800">{analytics?.overview.classes || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="doodle-card bg-white border-4 border-purple-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center border-3 border-purple-600">
                    <FaVideo className="text-3xl text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Sessions</p>
                    <p className="text-3xl font-bold text-purple-800">{analytics?.overview.sessions || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="doodle-card bg-white border-4 border-green-600">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
                <FaChartLine />
                Weekly Logins
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-4xl font-bold text-green-800">{analytics?.overview.weeklyLogins || 0}</p>
              <p className="text-sm text-gray-600 font-medium">Active in last 7 days</p>
            </CardContent>
          </Card>

          <Card className="doodle-card bg-white border-4 border-blue-600">
            <CardHeader className="bg-blue-100">
              <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <FaChartLine />
                Monthly Logins
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-4xl font-bold text-blue-800">{analytics?.overview.monthlyLogins || 0}</p>
              <p className="text-sm text-gray-600 font-medium">Active in last 30 days</p>
            </CardContent>
          </Card>

          <Card className="doodle-card bg-white border-4 border-red-600">
            <CardHeader className="bg-red-100">
              <CardTitle className="text-lg font-bold text-red-800 flex items-center gap-2">
                <FaVideo />
                Live Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-4xl font-bold text-red-800">{analytics?.overview.activeSessions || 0}</p>
              <p className="text-sm text-gray-600 font-medium">Currently active</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="doodle-card bg-white border-4 border-green-600">
          <CardHeader className="bg-green-100">
            <CardTitle className="text-xl font-bold text-green-800">Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {analytics?.recentUsers?.map((user: any, index: number) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border-3 border-gray-300 bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 border-3 border-green-800 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-600 font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'teacher' ? 'bg-green-200 text-green-800' :
                      user.role === 'student' ? 'bg-blue-200 text-blue-800' :
                      'bg-purple-200 text-purple-800'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
