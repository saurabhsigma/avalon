'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaBullhorn, FaExclamationCircle, FaLink, FaPaperclip, FaCalendarAlt, FaUser } from 'react-icons/fa';

export default function NoticeBoard({ userRole }: { userRole: 'student' | 'teacher' }) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchNotices();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices || []);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-gray-900';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-600';
      case 'high': return 'border-orange-600';
      case 'medium': return 'border-yellow-600';
      case 'low': return 'border-blue-600';
      default: return 'border-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-xl font-bold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={user?.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 border-4 border-amber-950 rounded-2xl p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-300 flex items-center justify-center border-4 border-amber-950 shadow-lg">
              <FaBullhorn className="text-3xl text-amber-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">📌 School Notice Board</h1>
              <p className="text-yellow-100 font-medium drop-shadow">Check the latest announcements pinned here!</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-amber-600 border-t-transparent"></div>
            <p className="mt-4 text-xl font-bold text-gray-700">Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 border-8 border-amber-900 p-16 text-center rounded-lg shadow-2xl"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.05) 1px, transparent 1px),
                               radial-gradient(circle at 80% 50%, rgba(139, 69, 19, 0.05) 1px, transparent 1px)`,
              backgroundSize: '30px 30px'
            }}
          >
            {/* Cork board texture effect */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139, 69, 19, 0.1) 10px, rgba(139, 69, 19, 0.1) 20px)`
            }}></div>
            
            <div className="relative z-10">
              <FaBullhorn className="text-8xl text-amber-700 mx-auto mb-6 opacity-50" />
              <h2 className="text-2xl font-bold text-amber-900 mb-4">
                📌 No Notices Pinned Yet!
              </h2>
              <p className="text-lg text-amber-800 font-semibold">
                Check back later for new announcements.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="relative bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 border-8 border-amber-900 p-8 rounded-lg shadow-2xl"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.05) 1px, transparent 1px),
                               radial-gradient(circle at 80% 50%, rgba(139, 69, 19, 0.05) 1px, transparent 1px)`,
              backgroundSize: '30px 30px'
            }}
          >
            {/* Cork board texture */}
            <div className="absolute inset-0 opacity-20 rounded-lg" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139, 69, 19, 0.1) 10px, rgba(139, 69, 19, 0.1) 20px)`
            }}></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{notices.map((notice, index) => (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 6 - 3 }}
                animate={{ opacity: 1, scale: 1, rotate: Math.random() * 4 - 2 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
                className="relative"
              >
                {/* Pin at the top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <div className="relative">
                    <div className={`w-6 h-6 rounded-full ${
                      notice.priority === 'urgent' ? 'bg-red-500' :
                      notice.priority === 'high' ? 'bg-orange-500' :
                      notice.priority === 'medium' ? 'bg-blue-500' :
                      'bg-green-500'
                    } border-2 border-gray-700 shadow-lg`}></div>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-1 h-3 ${
                      notice.priority === 'urgent' ? 'bg-red-600' :
                      notice.priority === 'high' ? 'bg-orange-600' :
                      notice.priority === 'medium' ? 'bg-blue-600' :
                      'bg-green-600'
                    }`}></div>
                  </div>
                </div>

                <Card className={`relative bg-yellow-50 border-4 ${getPriorityBorder(notice.priority)} shadow-xl hover:shadow-2xl transition-all duration-300`}
                  style={{
                    transform: `rotate(${Math.random() * 4 - 2}deg)`,
                    boxShadow: '6px 6px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  <CardHeader className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-b-2 border-yellow-300">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${getPriorityColor(notice.priority)} font-bold px-3 py-1 shadow-sm`}>
                          {notice.priority === 'urgent' && '🔴'}
                          {notice.priority === 'high' && '🟠'}
                          {notice.priority === 'medium' && '🔵'}
                          {notice.priority === 'low' && '🟢'}
                          {' ' + notice.priority.toUpperCase()}
                        </Badge>
                        {notice.priority === 'urgent' && (
                          <FaExclamationCircle className="text-red-600 text-xl animate-pulse" />
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                        {notice.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 bg-yellow-50">
                    {/* Description */}
                    <div className="text-gray-800 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                      {notice.description}
                    </div>

                    {/* Links */}
                    {notice.links && notice.links.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300 shadow-inner">
                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-xs">
                          <FaLink />
                          Links:
                        </h4>
                        <div className="space-y-1">
                          {notice.links.map((link: any, idx: number) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-2 bg-white rounded border border-blue-300 hover:bg-blue-50 transition-colors text-xs"
                            >
                              <span className="text-blue-700 font-semibold hover:underline">
                                🔗 {link.label}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {notice.attachments && notice.attachments.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300 shadow-inner">
                        <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2 text-xs">
                          <FaPaperclip />
                          Attachments:
                        </h4>
                        <div className="space-y-1">
                          {notice.attachments.map((attachment: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-green-800 font-medium text-xs">
                              <FaPaperclip />
                              <span>{attachment}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-3 border-t-2 border-yellow-300 space-y-2">
                      <div className="flex items-center gap-2 text-gray-700 text-xs">
                        <FaUser className="text-gray-500" />
                        <span className="font-semibold">
                          {notice.postedBy?.name || 'Admin'}
                        </span>
                        <Badge className="bg-gray-200 text-gray-800 font-bold text-xs px-2 py-0">
                          {notice.postedByRole}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <FaCalendarAlt className="text-gray-500" />
                        <span className="font-medium">
                          {new Date(notice.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {notice.expiresAt && (
                      <div className="bg-yellow-100 rounded-lg p-2 border-2 border-yellow-400">
                        <p className="text-yellow-900 font-semibold text-xs">
                          ⏰ Expires: {new Date(notice.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
