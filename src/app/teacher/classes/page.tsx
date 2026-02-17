'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, Users, BookOpen } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
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
              My Classes
            </h1>
            <p className="text-gray-600 font-medium mt-2">Manage your classes and students 👥</p>
          </div>
          <Link href="/teacher/classes/create">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="doodle-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-white shadow-xl text-lg px-6 py-6">
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            </motion.div>
          </Link>
        </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-600">Loading classes...</p>
          </div>
        </div>
      ) : classes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card border-2 border-white p-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Classes Yet! 📚</h3>
          <p className="text-gray-600 font-medium mb-6">Create your first class to get started</p>
          <Link href="/teacher/classes/create">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="doodle-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-white shadow-xl text-lg px-6 py-4">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Class
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link key={cls._id} href={`/teacher/classes/${cls._id}`}>
              <motion.div
                whileHover={{ scale: 1.03, y: -8 }}
                className="group h-full"
              >
                <div className="glass-card border-2 border-white hover:shadow-2xl transition-all h-full relative overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{cls.name}</h3>
                      <p className="text-gray-600 font-medium">
                        Grade {cls.grade} {cls.section && `- Section ${cls.section}`}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-700">{cls.students?.length || 0} Students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-700">{cls.subjects?.length || 0} Subjects</span>
                      </div>
                    </div>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
