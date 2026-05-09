/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import TopicJourneyMap from '@/components/TopicJourneyMap';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Sparkles } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roadmapLoadingId, setRoadmapLoadingId] = useState('');
  const [roadmapFetchingId, setRoadmapFetchingId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    classId: '',
    description: '',
    color: '#6366F1',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/classes'),
      ]);

      const subjectsData = await subjectsRes.json();
      const classesData = await classesRes.json();

      const nextSubjects = subjectsData.subjects || [];
      setSubjects(nextSubjects);
      setClasses(classesData.classes || []);

      const subjectWithRoadmap = nextSubjects.find((subject: any) => subject.roadmap?.topics?.length);
      if (subjectWithRoadmap) {
        await loadRoadmap(subjectWithRoadmap._id);
      } else {
        setSelectedRoadmap(null);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoadmap = async (subjectId: string) => {
    try {
      setRoadmapFetchingId(subjectId);
      const res = await fetch(`/api/subjects/roadmap?subjectId=${subjectId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedRoadmap(data);
    } catch (error) {
      console.error('Failed to load roadmap:', error);
    } finally {
      setRoadmapFetchingId('');
    }
  };

  const generateRoadmap = async (subjectId: string) => {
    try {
      setRoadmapLoadingId(subjectId);
      const res = await fetch('/api/subjects/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || error.error || 'Failed to generate roadmap');
      }

      await fetchData();
      await loadRoadmap(subjectId);
    } catch (error: any) {
      console.error('Failed to generate roadmap:', error);
      alert(error.message || 'Failed to generate roadmap');
    } finally {
      setRoadmapLoadingId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setDialogOpen(false);
        setFormData({ name: '', classId: '', description: '', color: '#6366F1' });
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to create subject:', error);
    }
  };

  return (
    <DashboardLayout userRole="teacher" userName="Teacher">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Subjects
            </h1>
            <p className="mt-2 text-gray-600 font-medium">Create subjects, generate AI topic villages, and launch quizzes from the roadmap.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button className="doodle-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-white shadow-xl text-lg px-6 py-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
                <DialogDescription>Add a subject to one of your classes</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Subject Name"
                  type="text"
                  placeholder="e.g., Physics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Class</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
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
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Brief description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Color</label>
                  <input
                    type="color"
                    className="h-10 w-full rounded-md border border-input"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Subject
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium text-gray-600">Loading subjects...</p>
            </div>
          </div>
        ) : subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-2 border-white p-12 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">No Subjects Yet</h3>
            <p className="text-gray-600 font-medium">Create your first subject to start building a learning journey.</p>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject) => (
                <motion.div
                  key={subject._id}
                  whileHover={{ scale: 1.02, y: -6 }}
                  className="group"
                >
                  <div className="glass-card relative h-full overflow-hidden border-2 border-white p-6 shadow-xl">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${subject.color}CC, ${subject.color}FF)` }}
                      >
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{subject.name}</h3>
                        <p className="text-sm font-medium text-gray-600">
                          {subject.classId?.name} - Grade {subject.classId?.grade}
                        </p>
                      </div>
                    </div>

                    {subject.description && <p className="mb-4 text-sm text-gray-700">{subject.description}</p>}

                    <div className="mb-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      {subject.roadmap?.topics?.length ? (
                        <>
                          <p className="font-bold text-slate-800">{subject.roadmap.topics.length} topic villages ready</p>
                          <p>{subject.roadmap.learningTheme}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-800">No roadmap yet</p>
                          <p>Generate one to unlock topic paths, performance hover cards, and AI quizzes.</p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => generateRoadmap(subject._id)}
                        disabled={roadmapLoadingId === subject._id}
                        className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-500 text-white"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {roadmapLoadingId === subject._id ? 'Generating...' : subject.roadmap?.topics?.length ? 'Refresh Roadmap' : 'Generate Roadmap'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => loadRoadmap(subject._id)}
                        disabled={roadmapFetchingId === subject._id || !subject.roadmap?.topics?.length}
                        className="flex-1"
                      >
                        {roadmapFetchingId === subject._id ? 'Loading...' : 'Open Map'}
                      </Button>
                    </div>

                    {subject.roadmap?.topics?.length ? (
                      <Link
                        href={`/teacher/quizzes?subjectId=${subject._id}`}
                        className="mt-3 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        Build quizzes for this roadmap
                      </Link>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedRoadmap?.subject ? (
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                <TopicJourneyMap
                  role="teacher"
                  subjectName={`${selectedRoadmap.subject.name} • ${selectedRoadmap.subject.classId?.name || ''}`}
                  subjectColor={selectedRoadmap.subject.color}
                  learningTheme={selectedRoadmap.subject.roadmap?.learningTheme}
                  topics={selectedRoadmap.topicStats || []}
                />
              </motion.div>
            ) : null}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
