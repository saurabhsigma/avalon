'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaTrophy, FaBook, FaChartLine, FaAward } from 'react-icons/fa';

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, g) => sum + (g.score || 0), 0);
    return (total / grades.length).toFixed(1);
  };

  return (
    <DashboardLayout userRole="student" userName="Student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-green-800">My Grades</h1>
          <p className="text-gray-700 font-medium">Track your academic performance!</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <Card className="doodle-card bg-white border-4 border-green-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-3 border-green-600">
                    <FaTrophy className="text-3xl text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Average Score</p>
                    <p className="text-3xl font-bold text-green-800">{calculateAverage()}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="doodle-card bg-white border-4 border-blue-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-3 border-blue-600">
                    <FaBook className="text-3xl text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Subjects</p>
                    <p className="text-3xl font-bold text-blue-800">{grades.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2 }}
          >
            <Card className="doodle-card bg-white border-4 border-yellow-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center border-3 border-yellow-600">
                    <FaAward className="text-3xl text-yellow-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Class Rank</p>
                    <p className="text-3xl font-bold text-yellow-800">#5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Grades List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-xl font-bold text-gray-700">Loading grades...</p>
          </div>
        ) : grades.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="doodle-card bg-purple-100 border-4 border-purple-600 p-16 text-center"
          >
            <FaChartLine className="text-8xl text-purple-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Grades Yet!
            </h2>
            <p className="text-lg text-gray-700 font-semibold">
              Complete some assignments and quizzes to see your scores here.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {grades.map((grade, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="doodle-card bg-white border-4 border-green-600">
                  <CardHeader className="bg-green-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-green-800 flex items-center gap-3">
                        <FaBook className="text-2xl" />
                        {grade.subject}
                      </CardTitle>
                      <Badge
                        className={`font-bold text-lg px-4 py-2 ${
                          grade.score >= 90
                            ? 'bg-green-400 text-green-900'
                            : grade.score >= 75
                            ? 'bg-blue-400 text-blue-900'
                            : grade.score >= 60
                            ? 'bg-yellow-400 text-yellow-900'
                            : 'bg-red-400 text-red-900'
                        }`}
                      >
                        {grade.score}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Assignment</p>
                        <p className="font-bold text-gray-800">{grade.assignment}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Date</p>
                        <p className="font-bold text-gray-800">
                          {new Date(grade.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {grade.feedback && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-400">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Teacher Feedback:</p>
                        <p className="text-sm font-medium text-gray-700">{grade.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
