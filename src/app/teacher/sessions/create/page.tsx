'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CreateSessionPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    classId: '',
    subjectId: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    description: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      fetchSubjects(formData.classId);
    }
  }, [formData.classId]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchSubjects = async (classId: string) => {
    try {
      const res = await fetch(`/api/subjects?classId=${classId}`);
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      router.push('/teacher/sessions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="teacher" userName="Teacher">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Schedule New Session</h1>
          <p className="text-muted-foreground">Create a new live virtual classroom</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Enter the information for your live session</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Input
                label="Session Title"
                type="text"
                placeholder="e.g., Introduction to Physics"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div>
                <label className="text-sm font-medium mb-1.5 block">Class</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value, subjectId: '' })}
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - Grade {cls.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Subject</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                  disabled={!formData.classId}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                {formData.classId && subjects.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    No subjects found for this class. <a href="/teacher/subjects" className="underline">Create a subject first</a>.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="datetime-local"
                  value={formData.scheduledStartTime}
                  onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                  required
                />

                <Input
                  label="End Time"
                  type="datetime-local"
                  value={formData.scheduledEndTime}
                  onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Brief description of the session"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Schedule Session'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
