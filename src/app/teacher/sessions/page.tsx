'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FaPlus, FaVideo, FaCalendarAlt, FaClock, FaUsers, FaChalkboard } from 'react-icons/fa';
import { formatDate, formatTime } from '@/lib/utils';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'live' | 'completed'>('all');

  // Dummy data
  const dummySessions = [
    {
      _id: '1',
      title: 'Advanced Mathematics - Calculus',
      classId: { name: 'Grade 12A' },
      subjectId: { name: 'Mathematics' },
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      description: 'Deep dive into differential calculus and applications'
    },
    {
      _id: '2',
      title: 'Physics Lab - Mechanics',
      classId: { name: 'Grade 11B' },
      subjectId: { name: 'Physics' },
      status: 'live',
      scheduledAt: new Date().toISOString(),
      duration: 90,
      description: 'Hands-on experiments with Newton\'s laws'
    },
    {
      _id: '3',
      title: 'Chemistry - Organic Compounds',
      classId: { name: 'Grade 12A' },
      subjectId: { name: 'Chemistry' },
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 75,
      description: 'Introduction to organic chemistry'
    },
  ];

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      const url = filter === 'all'
        ? '/api/sessions'
        : `/api/sessions?status=${filter}`;

      const res = await fetch(url);
      const data = await res.json();
      const fetchedSessions = data.sessions || [];
      // Use dummy data if no real sessions
      setSessions(fetchedSessions.length > 0 ? fetchedSessions : dummySessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions(dummySessions);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'live') {
      return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold animate-pulse px-3 py-1">🔴 LIVE</Badge>;
    } else if (status === 'scheduled') {
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-3 py-1">📅 SCHEDULED</Badge>;
    } else {
      return <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold px-3 py-1">✓ COMPLETED</Badge>;
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
              Live Sessions
            </h1>
            <p className="text-gray-600 font-medium mt-2">Schedule and manage your virtual classes 🎥</p>
          </div>
          <Link href="/teacher/sessions/create">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="doodle-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-white shadow-xl text-lg px-6 py-6">
                <FaPlus className="mr-2" />
                Schedule Session
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          {(['all', 'scheduled', 'live', 'completed'] as const).map((status, idx) => (
            <motion.button
              key={status}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'glass-card border-2 border-white text-gray-700 hover:border-purple-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-xl font-bold text-gray-700">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gradient-card border-2 border-white shadow-2xl">
              <CardContent className="py-16 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaVideo className="h-24 w-24 mx-auto mb-6 text-purple-500" />
                </motion.div>
                <p className="text-2xl font-bold text-gray-800 mb-4">No sessions found</p>
                <p className="text-gray-600 mb-6">Start by scheduling your first virtual class!</p>
                <Link href="/teacher/sessions/create">
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="doodle-button bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg px-8 py-6">
                      <FaPlus className="mr-2" />
                      Schedule Your First Session
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session, idx) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -2 }}
                className="group"
              >
                <div className="relative glass-card border-2 border-white h-full hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Status indicator */}
                  <div className="absolute top-4 right-4 z-10">
                    {getStatusBadge(session.status)}
                  </div>

                  {/* Gradient overlay based on status */}
                  <div className={`absolute inset-0 ${
                    session.status === 'live' 
                      ? 'bg-gradient-to-br from-red-500/10 to-pink-500/10' 
                      : session.status === 'scheduled'
                      ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
                      : 'bg-gradient-to-br from-gray-500/10 to-gray-600/10'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className={`w-16 h-16 rounded-2xl ${
                          session.status === 'live'
                            ? 'bg-gradient-to-br from-red-500 to-pink-500'
                            : session.status === 'scheduled'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-br from-gray-500 to-gray-600'
                        } flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <FaVideo className="text-3xl text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {session.title}
                        </CardTitle>
                        <CardDescription className="text-sm font-semibold">
                          <span className="text-purple-600">{session.classId?.name || 'Class'}</span>
                          <span className="mx-2">•</span>
                          <span className="text-pink-600">{session.subjectId?.name || 'Subject'}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <FaCalendarAlt className="text-blue-500 text-lg" />
                      <span className="font-semibold text-sm">
                        {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <FaClock className="text-green-500 text-lg" />
                      <span className="font-semibold text-sm">
                        {new Date(session.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} ({session.duration || 60} min)
                      </span>
                    </div>

                    {session.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 font-medium">
                        {session.description}
                      </p>
                    )}

                    <div className="pt-4">
                      {session.status === 'scheduled' && (
                        <motion.button
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/sessions', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ sessionId: session._id, status: 'live' }),
                              });
                              if (res.ok) {
                                window.location.href = `/session/${session._id}`;
                              }
                            } catch (err) {
                              console.error('Failed to start session', err);
                            }
                          }}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md"
                        >
                          <FaVideo /> Start Session
                        </motion.button>
                      )}
                      {session.status === 'live' && (
                        <Link href={`/session/${session._id}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md animate-pulse"
                          >
                            <FaVideo /> Join Live Session
                          </motion.button>
                        </Link>
                      )}
                      {session.status === 'completed' && (
                        <div className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 opacity-60">
                          <FaChalkboard /> Session Ended
                        </div>
                      )}
                    </div>
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
