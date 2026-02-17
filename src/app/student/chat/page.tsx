'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ClassChat from '@/components/ClassChat';
import { Card } from '@/components/ui/card';

export default function StudentChatPage() {
  const [user, setUser] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user.classId) {
          fetchClass(data.user.classId);
        } else {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    }
  };

  const fetchClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes?id=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassData(data.class);
      }
    } catch (error) {
      console.error('Error fetching class:', error);
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
    <DashboardLayout userRole="student" userName={user?.name}>
      <div className="space-y-6">
        <div className="doodle-card bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-blue-800 p-6">
          <h1 className="text-3xl font-bold text-blue-800">Class Chat 💬</h1>
          <p className="text-gray-700 font-medium">
            {classData ? `Chat with ${classData.name}` : 'Connect with your class'}
          </p>
        </div>

        {!user.classId ? (
          <Card className="doodle-card p-12 text-center bg-yellow-100 border-4 border-yellow-600">
            <p className="text-xl font-bold text-gray-800 mb-4">Not Enrolled in a Class</p>
            <p className="text-gray-600">Please join a class to access the class chat.</p>
          </Card>
        ) : (
          <ClassChat
            classId={user.classId}
            userRole="student"
            userId={user._id}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
