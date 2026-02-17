'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaBook, FaChalkboardTeacher, FaClock, FaCalendarAlt, FaComments, FaChartLine, FaTrophy, FaGraduationCap } from 'react-icons/fa';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Dummy data for stats
  const [stats] = useState({
    totalSubjects: 6,
    attendance: 92,
    assignments: 12,
    averageGrade: 88
  });

  // Dummy schedule data
  const dummySchedule = [
    { subject: 'Mathematics', teacher: 'Dr. Smith', startTime: '09:00 AM', endTime: '10:30 AM' },
    { subject: 'Physics', teacher: 'Prof. Johnson', startTime: '11:00 AM', endTime: '12:30 PM' },
    { subject: 'Chemistry', teacher: 'Dr. Williams', startTime: '02:00 PM', endTime: '03:30 PM' },
  ];

  // Dummy subjects data
  const dummySubjects = [
    { _id: '1', name: 'Mathematics', teacherId: { name: 'Dr. Smith' }, color: 'blue' },
    { _id: '2', name: 'Physics', teacherId: { name: 'Prof. Johnson' }, color: 'green' },
    { _id: '3', name: 'Chemistry', teacherId: { name: 'Dr. Williams' }, color: 'purple' },
    { _id: '4', name: 'English', teacherId: { name: 'Ms. Brown' }, color: 'orange' },
    { _id: '5', name: 'History', teacherId: { name: 'Mr. Davis' }, color: 'pink' },
    { _id: '6', name: 'Computer Science', teacherId: { name: 'Dr. Wilson' }, color: 'cyan' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // If user has a class, fetch class details and subjects
      if (userData.user.classId) {
        // Fetch class details
        const classRes = await fetch(`/api/classes?id=${userData.user.classId}`);
        if (classRes.ok) {
          const classDataRes = await classRes.json();
          setClassData(classDataRes.class);
        }

        // Fetch subjects for this class
        const subjectsRes = await fetch(`/api/subjects?classId=${userData.user.classId}`);
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          // Use real data if available, otherwise use dummy data
          setSubjects(subjectsData.subjects && subjectsData.subjects.length > 0 ? subjectsData.subjects : dummySubjects);
        } else {
          setSubjects(dummySubjects);
        }
      } else {
        // Use dummy data if not enrolled
        setSubjects(dummySubjects);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use dummy data on error
      setSubjects(dummySubjects);
    } finally {
      setLoading(false);
    }
  };

  const getTodaySchedule = () => {
    if (!subjects || subjects.length === 0) return dummySchedule;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    const todayClasses: any[] = [];
    subjects.forEach((subject) => {
      if (subject.schedule) {
        subject.schedule.forEach((sch: any) => {
          if (sch.day === today) {
            todayClasses.push({
              ...sch,
              subject: subject.name,
              teacher: subject.teacherId?.name || 'Teacher',
              color: subject.color,
            });
          }
        });
      }
    });
    
    // Return dummy schedule if no real schedule found
    return todayClasses.length > 0 ? todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)) : dummySchedule;
  };

  const subjectColors = ['bg-blue-100 border-blue-500', 'bg-green-100 border-green-500', 'bg-purple-100 border-purple-500', 'bg-orange-100 border-orange-500', 'bg-pink-100 border-pink-500', 'bg-yellow-100 border-yellow-500'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-xl font-bold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout userRole="student" userName={user.name}>
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-gray-600 font-medium mt-2">Welcome back, {user.name}! Ready to learn? 🚀</p>
          </div>
          <Link href="/student/classes">
            <motion.div 
              whileHover={{ y: -2 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button className="doodle-button bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold border-2 border-white shadow-xl text-lg px-6 py-6">
                <FaGraduationCap className="mr-2" />
                My Classes
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              title: "Total Subjects", 
              value: stats.totalSubjects, 
              subtitle: "Enrolled courses",
              icon: FaBook,
              gradient: "from-blue-400 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100"
            },
            { 
              title: "Attendance", 
              value: `${stats.attendance}%`, 
              subtitle: "This semester",
              icon: FaChartLine,
              gradient: "from-green-400 to-green-600",
              bgGradient: "from-green-50 to-green-100"
            },
            { 
              title: "Assignments", 
              value: stats.assignments, 
              subtitle: "Active tasks",
              icon: FaClock,
              gradient: "from-purple-400 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100"
            },
            { 
              title: "Average Grade", 
              value: `${stats.averageGrade}%`, 
              subtitle: "Overall performance",
              icon: FaTrophy,
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
                {/* Static Icon Background */}
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

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="gradient-card border-2 border-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                📅 Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getTodaySchedule().length === 0 ? (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-6 p-6 glass-card border-2 border-purple-200"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl shadow-lg">
                    🎉
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-800">No classes today!</p>
                    <p className="text-gray-600">Enjoy your free day</p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {getTodaySchedule().map((cls, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      whileHover={{ y: -2 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between p-5 glass-card border-2 border-white hover:border-purple-400 hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg"
                          >
                            <FaClock className="text-xl" />
                          </motion.div>
                          <div>
                            <p className="font-bold text-gray-800 text-lg">{cls.subject}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <FaChalkboardTeacher className="text-purple-600" />
                              {cls.teacher}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-2 text-sm">
                          {cls.startTime} - {cls.endTime}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* My Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="gradient-card border-2 border-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                📚 My Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-6 p-6 glass-card border-2 border-purple-200"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl shadow-lg">
                    📖
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-800">No subjects yet</p>
                    <p className="text-gray-600">Enroll in a class to see your subjects</p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.map((subject, idx) => (
                    <motion.div
                      key={subject._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      whileHover={{ y: -2 }}
                      className="group"
                    >
                      <div className="relative glass-card border-2 border-white h-full p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        {/* Gradient overlay based on index */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                          idx % 6 === 0 ? 'from-blue-500/10 to-cyan-500/10' :
                          idx % 6 === 1 ? 'from-green-500/10 to-emerald-500/10' :
                          idx % 6 === 2 ? 'from-purple-500/10 to-pink-500/10' :
                          idx % 6 === 3 ? 'from-orange-500/10 to-yellow-500/10' :
                          idx % 6 === 4 ? 'from-pink-500/10 to-rose-500/10' :
                          'from-cyan-500/10 to-blue-500/10'
                        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                              idx % 6 === 0 ? 'from-blue-500 to-cyan-500' :
                              idx % 6 === 1 ? 'from-green-500 to-emerald-500' :
                              idx % 6 === 2 ? 'from-purple-500 to-pink-500' :
                              idx % 6 === 3 ? 'from-orange-500 to-yellow-500' :
                              idx % 6 === 4 ? 'from-pink-500 to-rose-500' :
                              'from-cyan-500 to-blue-500'
                            } flex items-center justify-center shadow-lg`}>
                              <FaBook className="text-2xl text-white" />
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-xl text-gray-900 mb-2">{subject.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mb-4">
                            <FaChalkboardTeacher className="text-purple-600" />
                            {subject.teacherId?.name || 'Teacher'}
                          </p>
                          
                          <div className="flex gap-2">
                            <Link href={`/student/chat?subject=${subject._id}`} className="flex-1">
                              <motion.button 
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md"
                              >
                                <FaComments /> Chat
                              </motion.button>
                            </Link>
                            <Link href={`/student/materials?subject=${subject._id}`} className="flex-1">
                              <motion.button 
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md"
                              >
                                <FaBook /> Materials
                              </motion.button>
                            </Link>
                          </div>
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                      </div>
                    </motion.div>
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
          transition={{ delay: 0.8 }}
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
                  { href: '/student/materials', icon: FaBook, label: 'Browse Materials', gradient: 'from-blue-500 to-cyan-500', emoji: '📖' },
                  { href: '/student/attendance', icon: FaCalendarAlt, label: 'View Attendance', gradient: 'from-purple-500 to-pink-500', emoji: '📊' },
                  { href: '/student/chat', icon: FaComments, label: 'Class Chat', gradient: 'from-green-500 to-emerald-500', emoji: '💬' }
                ].map((action, index) => (
                  <Link key={action.href} href={action.href}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
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
      </div>
    </DashboardLayout>
  );
}
