'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ClassChat from '@/components/ClassChat';
import { Card } from '@/components/ui/card';

export default function TeacherChatPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchClasses();
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

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
        if (data.classes && data.classes.length > 0) {
          setSelectedClass(data.classes[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
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
    <DashboardLayout userRole="teacher" userName={user?.name}>
      <div className="space-y-6">
        <div className="doodle-card bg-gradient-to-r from-green-100 to-blue-100 border-4 border-green-800 p-6">
          <h1 className="text-3xl font-bold text-green-800">Class Chat 💬</h1>
          <p className="text-gray-700 font-medium">Communicate with your students</p>
        </div>

        {classes.length === 0 ? (
          <Card className="doodle-card p-12 text-center">
            <p className="text-xl font-bold text-gray-800 mb-4">No Classes Found</p>
            <p className="text-gray-600">Create a class first to start chatting with students.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Class Selector */}
            <div className="col-span-3">
              <Card className="doodle-card bg-yellow-100 border-4 border-yellow-600 p-4">
                <h3 className="font-bold text-yellow-900 mb-4 text-lg">Your Classes</h3>
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <button
                      key={cls._id}
                      onClick={() => setSelectedClass(cls._id)}
                      className={`w-full text-left p-3 rounded-lg font-semibold transition-all ${
                        selectedClass === cls._id
                          ? 'bg-green-500 text-white border-3 border-green-800 shadow-lg'
                          : 'bg-white text-gray-800 border-2 border-gray-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="font-bold">{cls.name}</div>
                      <div className="text-sm opacity-80">{cls.students?.length || 0} students</div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="col-span-9">
              {selectedClass && (
                <ClassChat
                  classId={selectedClass}
                  userRole="teacher"
                  userId={user._id}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
