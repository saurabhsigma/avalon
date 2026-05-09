'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TeacherClassDetailPage() {
  const params = useParams<{ classId: string }>();
  const router = useRouter();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [newStudent, setNewStudent] = useState({ email: '', name: '', password: '' });
  const [bulkStudents, setBulkStudents] = useState('');

  useEffect(() => {
    if (params?.classId) {
      fetchClass(params.classId);
    }
  }, [params?.classId]);

  const fetchClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes?id=${classId}`);
      const data = await response.json();
      setClassData(data.class || null);
      setStudents(data.class?.students || []);
    } catch (error) {
      console.error('Failed to fetch class:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params?.classId) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/classes/${params.classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add student');
      }

      setNewStudent({ email: '', name: '', password: '' });
      fetchClass(params.classId);
    } catch (error: any) {
      alert(error.message || 'Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  const parseBulkStudents = () => {
    return bulkStudents
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(',').map((value) => value.trim()).filter(Boolean);

        if (parts.length === 1) {
          return { email: parts[0] };
        }

        if (parts.length >= 3) {
          return {
            name: parts[0],
            email: parts[1],
            password: parts.slice(2).join(','),
          };
        }

        return { email: parts[0], name: parts[1] || '' };
      });
  };

  const addBulkStudents = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!params?.classId) {
      return;
    }

    const parsedStudents = parseBulkStudents();
    if (parsedStudents.length === 0) {
      alert('Add at least one student email or line item.');
      return;
    }

    setBulkSaving(true);
    try {
      const response = await fetch(`/api/classes/${params.classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkStudents: parsedStudents }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add students');
      }

      setBulkStudents('');
      fetchClass(params.classId);

      const summary = data.summary
        ? `Added ${data.summary.added}, created ${data.summary.created}, skipped ${data.summary.skipped}`
        : 'Bulk import completed';
      alert(summary);
    } catch (error: any) {
      alert(error.message || 'Failed to add students');
    } finally {
      setBulkSaving(false);
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!params?.classId) {
      return;
    }

    try {
      const response = await fetch(`/api/classes/${params.classId}/students`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove student');
      }

      fetchClass(params.classId);
    } catch (error: any) {
      alert(error.message || 'Failed to remove student');
    }
  };

  const deleteClass = async () => {
    if (!params?.classId) {
      return;
    }

    const confirmed = window.confirm('Delete this class? This will remove sessions, attendance, materials, and subjects tied to it.');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/classes/${params.classId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete class');
      }

      router.push('/teacher/classes');
    } catch (error: any) {
      alert(error.message || 'Failed to delete class');
    }
  };

  return (
    <DashboardLayout userRole="teacher" userName="Teacher">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Button variant="outline" onClick={() => router.push('/teacher/classes')} className="mb-4">
              Back to Classes
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{classData?.name || 'Class Details'}</h1>
            <p className="text-gray-600">Manage students and attendance from one place.</p>
          </div>
          {classData && (
            <div className="flex gap-3 flex-wrap">
              <Link href={`/teacher/attendance?classId=${classData._id}`}>
                <Button>Take Attendance</Button>
              </Link>
              <Button variant="destructive" onClick={deleteClass}>
                Delete Class
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading class...</div>
        ) : !classData ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">Class not found.</CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Class Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Grade</p>
                  <p className="font-semibold">{classData.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Section</p>
                  <p className="font-semibold">{classData.section || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Students</p>
                  <p className="font-semibold">{students.length} / {classData.maxStudents}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Student</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addStudent} className="grid gap-4 md:grid-cols-3">
                  <Input
                    placeholder="Student email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Name for new student"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                  <Input
                    placeholder="Temporary password"
                    type="password"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  />
                  <div className="md:col-span-3 flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Adding...' : 'Add Student'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Add Students</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addBulkStudents} className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Paste one student per line. Use <span className="font-semibold">email</span> for existing students, or <span className="font-semibold">name,email,password</span> for admin-created accounts.
                    </p>
                    <textarea
                      className="min-h-44 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder={"student1@example.com\nstudent2@example.com\nNew Student,new@student.com,TempPass123"}
                      value={bulkStudents}
                      onChange={(e) => setBulkStudents(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBulkStudents('')}
                      disabled={bulkSaving}
                    >
                      Clear
                    </Button>
                    <Button type="submit" disabled={bulkSaving}>
                      {bulkSaving ? 'Importing...' : 'Import Students'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Students</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-gray-600">No students added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div key={student._id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <Button variant="destructive" onClick={() => removeStudent(student._id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}