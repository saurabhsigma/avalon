'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaVideo, FaUsers, FaClock, FaCalendarAlt, FaChalkboard, FaPlay } from 'react-icons/fa';

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dummy data
  const dummySessions = [
    {
      _id: '1',
      title: 'Advanced Mathematics - Calculus',
      classId: { name: 'Grade 12A' },
      subjectId: { name: 'Mathematics' },
      status: 'live',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      description: 'Deep dive into differential calculus and applications',
      teacher: { name: 'Dr. Smith' }
    },
    {
      _id: '2',
      title: 'Physics Lab - Mechanics',
      classId: { name: 'Grade 11B' },
      subjectId: { name: 'Physics' },
      status: 'scheduled',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
      description: 'Hands-on experiments with Newton\'s laws',
      teacher: { name: 'Prof. Johnson' }
    },
    {
      _id: '3',
      title: 'Chemistry - Organic Compounds',
      classId: { name: 'Grade 12A' },
      subjectId: { name: 'Chemistry' },
      status: 'scheduled',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 25.25 * 60 * 60 * 1000).toISOString(),
      description: 'Introduction to organic chemistry',
      teacher: { name: 'Dr. Williams' }
    },
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        const fetchedSessions = Array.isArray(data) ? data : (data.sessions || []);
        // Use dummy data if no real sessions
        setSessions(fetchedSessions.length > 0 ? fetchedSessions : dummySessions);
      } else {
        setSessions(dummySessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions(dummySessions);
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    window.location.href = `/session/${sessionId}`;
  };

  return (
    <DashboardLayout userRole="student" userName="Student">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Live Sessions
          </h1>
          <p className="text-gray-600 font-medium mt-2">Join your classes and have fun learning! 🎓</p>
        </motion.div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-xl font-bold text-gray-700">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Card className="gradient-card border-2 border-white shadow-2xl">
              <CardContent className="py-16 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaChalkboard className="text-8xl text-purple-500 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  No Sessions Yet!
                </h2>
                <p className="text-lg text-gray-600 font-semibold">
                  Your teacher will schedule classes soon. Check back later!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, idx) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -8 }}
                className="group"
              >
                <div className="relative glass-card border-2 border-white h-full hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {session.status === 'live' ? (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold animate-pulse px-3 py-1">
                        🔴 LIVE
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-3 py-1">
                        📅 SCHEDULED
                      </Badge>
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 ${
                    session.status === 'live'
                      ? 'bg-gradient-to-br from-red-500/10 to-pink-500/10'
                      : 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`w-16 h-16 rounded-2xl ${
                          session.status === 'live'
                            ? 'bg-gradient-to-br from-red-500 to-pink-500'
                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                        } flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <FaVideo className="text-3xl text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {session.title}
                        </CardTitle>
                        {session.teacher && (
                          <p className="text-sm text-gray-600 font-semibold">
                            👨‍🏫 {session.teacher.name || 'Teacher'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <FaCalendarAlt className="text-blue-500 text-lg" />
                      <span className="font-semibold text-sm">
                        {new Date(session.startTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <FaClock className="text-green-500 text-lg" />
                      <span className="font-semibold text-sm">
                        {new Date(session.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(session.endTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {session.description && (
                      <p className="text-sm text-gray-600 font-medium line-clamp-2">
                        {session.description}
                      </p>
                    )}

                    {session.status === 'live' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => joinSession(session._id)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md animate-pulse"
                      >
                        <FaPlay /> Join Class Now!
                      </motion.button>
                    )}

                    {session.status === 'scheduled' && (
                      <div className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 opacity-60">
                        <FaClock /> Starting Soon
                      </div>
                    )}
                  </CardContent>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
