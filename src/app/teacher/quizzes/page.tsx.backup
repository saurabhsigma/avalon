'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaPlus, FaTrash, FaQuestionCircle, FaClock, FaTrophy, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

export default function TeacherQuizzesPage() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const res = await fetch('/api/quizzes');
            const data = await res.json();
            setQuizzes(data.quizzes || []);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return;
        try {
            const res = await fetch(`/api/quizzes?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setQuizzes(quizzes.filter(q => q._id !== id));
            } else {
                alert('Failed to delete quiz');
            }
        } catch (error) {
            console.error('Error deleting quiz:', error);
        }
    };

    return (
        <DashboardLayout userRole="teacher" userName="Teacher">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-green-800">Quizzes</h1>
                        <p className="text-gray-700 font-medium">Manage quizzes and assessments</p>
                    </div>
                    <Link href="/teacher/quizzes/create">
                        <Button className="doodle-button bg-green-600 text-white font-bold border-green-800">
                            <FaPlus className="mr-2" />
                            Create New Quiz
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <FaSpinner className="animate-spin text-4xl text-green-500 mx-auto" />
                        <p className="mt-4 text-gray-500">Loading quizzes...</p>
                    </div>
                ) : quizzes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 bg-yellow-50 rounded-xl border-2 border-dashed border-yellow-400"
                    >
                        <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-400">
                            <FaQuestionCircle className="text-4xl text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No Quizzes Created</h3>
                        <p className="text-gray-600">Create your first quiz to assess student learning!</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz, index) => (
                            <motion.div
                                key={quiz._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="doodle-card hover:shadow-lg transition-shadow border-4 border-gray-200">
                                    <CardHeader className="bg-gray-50 pb-2 border-b border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <Badge
                                                variant="outline"
                                                className="bg-white"
                                                style={{ borderColor: quiz.subjectId?.color, color: quiz.subjectId?.color }}
                                            >
                                                {quiz.subjectId?.name}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(quiz._id)}
                                                className="text-gray-400 hover:text-red-500 h-8 w-8"
                                            >
                                                <FaTrash size={14} />
                                            </Button>
                                        </div>
                                        <CardTitle className="text-lg font-bold text-gray-800 mt-2">
                                            {quiz.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {quiz.description || 'No description provided.'}
                                        </p>

                                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <FaClock className="text-blue-500" />
                                                {quiz.duration} mins
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaQuestionCircle className="text-purple-500" />
                                                {quiz.questions?.length || 0} Qs
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaTrophy className="text-yellow-500" />
                                                {quiz.totalMarks} Marks
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
