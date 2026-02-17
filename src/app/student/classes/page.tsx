'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaUsers, FaBook, FaChalkboardTeacher, FaGraduationCap, FaBookOpen } from 'react-icons/fa';

export default function StudentClassesPage() {
  /* eslint-disable react-hooks/exhaustive-deps */
  const [classInfo, setClassInfo] = useState<any>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    fetchClassInfo();
  }, []);

  const fetchClassInfo = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        // If user is enrolled, data.classes will contain their class (array of 1)
        // If not enrolled, data.classes will contain ALL classes

        // We need to check if the user is enrolled. 
        // A simple way is to check if the API returns a filtered list (which we can't easily know) 
        // OR we can check user profile. 
        // But based on my API change: 
        // - Enrolled: returns [enrolled_class]
        // - Not enrolled: returns [all_classes]

        // Wait, if I am enrolled, I only get my class. If I am not, I get all. 
        // How do I distinguish "I am enrolled in this one class" vs "Here is the list of all classes because I am not enrolled"?

        // Ah, the API logic was: 
        // if (user.classId) { query._id = user.classId } -> returns 1 class
        // else { query = {} } -> returns many classes

        // So if I get > 1 class, I am definitely not enrolled. 
        // If I get 1 class... could be I am enrolled, OR there is only 1 class in the system and I am NOT enrolled.
        // This is ambiguous. 

        // Better approach: Check if I am in the `students` list of the returned class(es).
        // The API populates `students`.

        // Use a separate API call to check strictly "my class"? 
        // Or just let the UI handle it: 
        // "My Class" vs "Available Classes"

        // Let's assume for now: we need to know if I am enrolled. 
        // Let's check /api/auth/me or similar? No.

        // Let's iterate the returned classes and see if my userId is in `students`.
        // But I don't have my userId handy in the client component easily without another call.

        // Alternative: The API should tell me "isEnrolled".
        // But I can't easily change the API response structure without breaking things.

        // Let's trust the "1 vs many" for now, BUT addressing the ambiguity:
        // If I receive classes, I can try to "Join". If I am already enrolled, the API might reject or I can check.
        // Actually, let's just show "My Class" if I have a classId in my profile.
        // The frontend doesn't know my profile classId.

        // Let's update this component to fetch user profile first?
        // Or simpler: Update `api/classes` to return `{ enrolled: boolean, classes: [] }`?
        // That would be a breaking change for other components potentially.

        // Let's check `data.classes`. 
        // If I am enrolled, `api/classes` returns my class.
        // If the API returns multiple classes, I am definitely not enrolled.
        // If it returns 1, I *might* be enrolled.

        // Let's fetch /api/users/profile or similar?
        // Let's just blindly show "Available Classes" if we have > 1 or if we are not "confirmed" enrolled.

        // To be safe: I will rely on the fact that if I am enrolled, the API returns ONLY my class.
        // If I am not enrolled, it returns ALL.
        // If I see a list, I render "Join" buttons.
        // If I click join, and it works, great.

        // Wait, if I am enrolled, I shouldn't see "Join".

        // Let's just render the first class as "My Class" IF the API returns exactly 1 AND... 
        // Okay, let's use a flag from the API?
        // No, let's fetch the user profile to be sure.
        // But I don't have a user profile endpoint ready.

        // Let's try this:
        // Use `id="enrolled-check"` hack? No.

        // Let's assume the user is NOT enrolled if the list has > 1.
        // If list has 1, check if `students` contains me? I don't have my ID.

        // Okay, I will try to join. If 400 "Already enrolled", then I know.

        // Let's just display all classes as "Available Classes" if the user is not seeing "My Class".
        // How to detect "My Class"?
        // The API returns `classes`. 

        // Let's modify the API to return a property `isEnrolled` on the class object?
        // That requires `api/classes` update. 
        // I will do that first in a separate tool call if needed, but I want to be fast.

        // Update: I will modify `StudentClassesPage` to assume that if `data.classes` has items, 
        // and I am enrolled, it will reflect in specific UI.
        // Actually, if I am enrolled, the API filters to ONLY my class.
        // So if I get 1 class, is it mine or just the only one?

        // Let's use `fetch('/api/auth/session')` ? No.

        // I will rely on a new prop or just try to join. 
        // Actually, I'll update `api/classes` to return `enrolled: true` in the class object if the user is in the student list.
        // I'll do that in the NEXT step. For now let's write the UI code to handle `isEnrolled` property.

        const classesData = data.classes;
        const enrolledClass = classesData.find((c: any) => c.isEnrolled);

        if (enrolledClass) {
          setClassInfo(enrolledClass);
        } else {
          setAvailableClasses(classesData);
        }
      }
    } catch (error) {
      console.error('Error fetching class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (classId: string) => {
    setJoining(classId);
    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId })
      });

      if (res.ok) {
        // Refresh to get the enrolled class view
        fetchClassInfo();
      } else {
        console.error('Failed to join');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJoining(null);
    }
  };

  return (
    <DashboardLayout userRole="student" userName="Student">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Classroom 🏛️
          </h1>
          <p className="text-gray-600 font-medium mt-2">Check out your class details and classmates!</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium text-gray-600">Loading class info...</p>
            </div>
          </div>
        ) : classInfo ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Class Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <div className="glass-card border-2 border-white hover:shadow-2xl h-full overflow-hidden relative">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center">
                      <FaGraduationCap className="text-xl text-white" />
                    </div>
                    Class Information
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {classInfo.name}
                    </h3>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold text-base px-4 py-2 border-2 border-white shadow-lg">
                      Grade {classInfo.grade}
                    </Badge>
                  </div>

                  {classInfo.description && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">About:</h4>
                      <p className="text-gray-700 font-medium">
                        {classInfo.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center">
                      <FaUsers className="text-2xl text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {classInfo.students?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center">
                      <FaBook className="text-2xl text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Subjects</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {classInfo.subjects?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
              </div>
            </motion.div>

            {/* Teacher Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <div className="glass-card border-2 border-white hover:shadow-2xl h-full overflow-hidden relative">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-10 h-10 rounded-full flex items-center justify-center">
                      <FaChalkboardTeacher className="text-xl text-white" />
                    </div>
                    Your Teacher
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-white shadow-xl flex items-center justify-center">
                      <FaChalkboardTeacher className="text-4xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {classInfo.teacherId?.name || 'Teacher Name'}
                    </h3>
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold px-4 py-2 border-2 border-white shadow-lg">
                      Class Teacher
                    </Badge>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border-3 border-green-400 text-center">
                    <p className="text-base font-semibold text-gray-700">
                      "Learning is an adventure! Let's explore together!"
                    </p>
                  </div>

                  {classInfo.teacherId?.email && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-semibold mb-1">📧 Contact:</p>
                      <p className="text-sm font-semibold text-purple-700">
                        {classInfo.teacherId.email}
                      </p>
                    </div>
                  )}
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableClasses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card border-2 border-white p-16 text-center col-span-full"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaGraduationCap className="text-4xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Classes Available! 📚</h3>
                <p className="text-gray-600 font-medium">Check back later for available classes to join.</p>
              </motion.div>
            ) : (
              availableClasses.map((cls, index) => (
                <motion.div
                  key={cls._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -8 }}
                  className="group"
                >
                  <div className="glass-card border-2 border-white hover:shadow-2xl transition-all h-full overflow-hidden relative">
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{cls.name}</h3>
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold px-3 py-1 border border-white shadow-md">
                          Grade {cls.grade}
                        </Badge>
                      </div>
                      {cls.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{cls.description}</p>
                      )}
                      {cls.teacherId?.name && (
                        <p className="text-xs text-gray-500 font-medium">Teacher: {cls.teacherId.name}</p>
                      )}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleJoin(cls._id)}
                          disabled={joining === cls._id}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-white shadow-lg"
                        >
                          {joining === cls._id ? 'Joining...' : 'Join Class'}
                        </Button>
                      </motion.div>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
