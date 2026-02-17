'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BookOpen } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
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

      setSubjects(subjectsData.subjects || []);
      setClasses(classesData.classes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
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
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create subject:', error);
    }
  };

  return (
    <DashboardLayout userRole="teacher" userName="Teacher">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Subjects
            </h1>
            <p className="text-gray-600 font-medium mt-2">Manage subjects across all classes 📚</p>
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
                <label className="text-sm font-medium mb-1.5 block">Class</label>
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
                <label className="text-sm font-medium mb-1.5 block">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Brief description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Color</label>
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-600">Loading subjects...</p>
          </div>
        </div>
      ) : subjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card border-2 border-white p-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Subjects Yet! 📖</h3>
          <p className="text-gray-600 font-medium mb-2">Create your first subject to get started</p>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <motion.div
              key={subject._id}
              whileHover={{ scale: 1.03, y: -8 }}
              className="group"
            >
              <div className="glass-card border-2 border-white hover:shadow-2xl transition-all relative overflow-hidden h-full">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${subject.color}CC, ${subject.color}FF)` 
                      }}
                    >
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{subject.name}</h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {subject.classId?.name} - Grade {subject.classId?.grade}
                      </p>
                    </div>
                  </div>
                  {subject.description && (
                    <p className="text-sm text-gray-700">{subject.description}</p>
                  )}
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
