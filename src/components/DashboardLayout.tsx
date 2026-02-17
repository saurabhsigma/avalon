'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  FaChalkboard, FaChalkboardTeacher, FaVideo, FaBook,
  FaUsers, FaGraduationCap, FaTrophy, FaQuestionCircle,
  FaSignOutAlt, FaHome, FaClock, FaClipboardList, FaBullhorn, FaChartLine, FaComments, FaCalendarAlt
} from 'react-icons/fa';
import { ReactNode } from 'react';
import AIChatbot from '@/components/AIChatbot';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'teacher' | 'student' | 'admin';
  userName?: string;
}

export default function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const teacherNavItems = [
    { href: '/teacher/dashboard', icon: FaHome, label: 'Dashboard' },
    { href: '/teacher/classes', icon: FaUsers, label: 'Classes' },
    { href: '/teacher/chat', icon: FaComments, label: 'Class Chat' },
    { href: '/teacher/subjects', icon: FaBook, label: 'Subjects' },
    { href: '/teacher/sessions', icon: FaVideo, label: 'Sessions' },
    { href: '/teacher/attendance', icon: FaClipboardList, label: 'Attendance' },
    { href: '/teacher/materials', icon: FaBook, label: 'Materials' },
    { href: '/teacher/quizzes', icon: FaQuestionCircle, label: 'Quizzes' },
    { href: '/teacher/notices', icon: FaBullhorn, label: 'Notices' },
    { href: '/events', icon: FaCalendarAlt, label: 'Events' },
  ];

  const studentNavItems = [
    { href: '/student/dashboard', icon: FaHome, label: 'Dashboard' },
    { href: '/student/classes', icon: FaUsers, label: 'My Class' },
    { href: '/student/chat', icon: FaComments, label: 'Class Chat' },
    { href: '/student/sessions', icon: FaVideo, label: 'Sessions' },
    { href: '/student/materials', icon: FaBook, label: 'Materials' },
    { href: '/student/quizzes', icon: FaTrophy, label: 'My Quizzes' },
    { href: '/student/notices', icon: FaBullhorn, label: 'Notices' },
    { href: '/events', icon: FaCalendarAlt, label: 'Events' },
  ];

  const adminNavItems = [
    { href: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
    { href: '/admin/notices', icon: FaBullhorn, label: 'Notices' },
    { href: '/admin/analytics', icon: FaChartLine, label: 'Analytics' },
    { href: '/events', icon: FaCalendarAlt, label: 'Events' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : userRole === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b-2 border-white/30 glass-card rounded-none shadow-xl"
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white shadow-lg"
            >
              <FaChalkboard className="text-2xl text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AcademyAI
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {userName && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="hidden md:flex items-center gap-3 px-6 py-3 glass-card border-2 border-purple-200 shadow-lg"
              >
                {userRole === 'teacher' ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <FaChalkboardTeacher className="text-white text-lg" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                    <FaGraduationCap className="text-white text-lg" />
                  </div>
                )}
                <span className="font-bold text-gray-800">{userName}</span>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleLogout}
                className="doodle-button bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold border-2 border-white shadow-lg"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="flex relative">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="hidden md:block w-72 min-h-[calc(100vh-5rem)] glass-card rounded-none border-r-2 border-white/30 p-6"
        >
          <nav className="space-y-3">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-white text-white shadow-xl'
                          : 'glass-card border-purple-200 text-gray-700 hover:border-purple-400 hover:shadow-lg'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gradient-to-br from-purple-100 to-pink-100'
                      }`}>
                        <item.icon className={`text-xl ${isActive ? 'text-white' : 'text-purple-600'}`} />
                      </div>
                      <span className="font-bold">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </motion.aside>

        {/* Mobile Navigation */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-card rounded-t-3xl border-t-2 border-white/30 shadow-2xl"
        >
          <nav className="flex justify-around py-4 px-2">
            {navItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
                      isActive 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'text-gray-600'
                    }`}
                  >
                    <item.icon className={`text-2xl ${isActive ? 'text-white' : 'text-purple-600'}`} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </motion.div>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="animate-fade-in-up"
          >
            {children}
          </motion.div>
        </main>
      </div>
      {userRole === 'student' && <AIChatbot />}
    </div>
  );
}
