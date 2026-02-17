'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaCheckCircle, FaTimesCircle, FaClock, FaCalendar, FaUsers } from 'react-icons/fa';

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
        if (data.classes?.length > 0) {
          setSelectedClass(data.classes[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        // Initialize all as present
        const initialAttendance: Record<string, boolean> = {};
        data.students.forEach((student: any) => {
          initialAttendance[student._id] = true;
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          date: new Date().toISOString(),
          attendance
        })
      });
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <DashboardLayout userRole="teacher" userName="Teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Attendance</h1>
            <p className="text-gray-700 font-medium">Mark student attendance for today</p>
          </div>
          <div className="doodle-card bg-white border-4 border-yellow-600 p-4">
            <div className="flex items-center gap-3">
              <FaCalendar className="text-2xl text-yellow-700" />
              <div>
                <p className="text-xs text-gray-600 font-semibold">Today's Date</p>
                <p className="text-lg font-bold text-gray-800">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Class Selector */}
        <div className="flex gap-2 flex-wrap">
          {classes.map((cls) => (
            <Button
              key={cls._id}
              onClick={() => setSelectedClass(cls._id)}
              className={`doodle-button font-bold ${
                selectedClass === cls._id
                  ? 'bg-green-600 text-white border-green-800'
                  : 'bg-white text-green-800 border-green-600'
              }`}
            >
              {cls.name}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="doodle-card bg-white border-4 border-blue-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-3 border-blue-600">
                    <FaUsers className="text-3xl text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Total Students</p>
                    <p className="text-3xl font-bold text-blue-800">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="doodle-card bg-white border-4 border-green-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-3 border-green-600">
                    <FaCheckCircle className="text-3xl text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Present</p>
                    <p className="text-3xl font-bold text-green-800">{presentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="doodle-card bg-white border-4 border-red-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center border-3 border-red-600">
                    <FaTimesCircle className="text-3xl text-red-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Absent</p>
                    <p className="text-3xl font-bold text-red-800">{absentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Student List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-xl font-bold text-gray-700">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="doodle-card bg-yellow-100 border-4 border-yellow-600 p-16 text-center"
          >
            <FaClock className="text-8xl text-yellow-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Students in This Class
            </h2>
            <p className="text-lg text-gray-700 font-semibold">
              Add students to this class to mark attendance.
            </p>
          </motion.div>
        ) : (
          <>
            <Card className="doodle-card bg-white border-4 border-green-600">
              <CardHeader className="bg-green-100">
                <CardTitle className="text-xl font-bold text-green-800">Student List</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {students.map((student, index) => (
                    <motion.div
                      key={student._id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg border-3 border-gray-300 bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 border-3 border-green-800 flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-600 font-medium">{student.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => toggleAttendance(student._id)}
                        className={`doodle-button font-bold ${
                          attendance[student._id]
                            ? 'bg-green-500 text-white border-green-700 hover:bg-green-600'
                            : 'bg-red-500 text-white border-red-700 hover:bg-red-600'
                        }`}
                      >
                        {attendance[student._id] ? (
                          <>
                            <FaCheckCircle className="mr-2" />
                            Present
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-2" />
                            Absent
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={saveAttendance}
                disabled={saving}
                className="doodle-button bg-yellow-500 text-green-900 font-bold text-lg px-8 py-6 hover:bg-yellow-600 border-4 border-yellow-700"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
