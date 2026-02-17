'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaClock, FaQuestionCircle, FaTrophy, FaArrowRight, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

export default function StudentQuizzesPage() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [enrolledClass, setEnrolledClass] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Get Enrolled Class
            const clsRes = await fetch('/api/classes');
            const clsData = await clsRes.json();
            const myClass = clsData.classes?.find((c: any) => c.isEnrolled) || clsData.classes?.[0]; // Fallback

            if (myClass) {
                setEnrolledClass(myClass);
                // 2. Get Quizzes for this class
                const qRes = await fetch(`/api/quizzes?classId=${myClass._id}`);
                const qData = await qRes.json();
                setQuizzes(qData.quizzes || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userRole="student" userName="Student">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-green-800">My Quizzes</h1>
                    <p className="text-gray-700 font-medium">
                        {enrolledClass ? `Assessments for ${enrolledClass.name}` : 'Test your knowledge'}
                    </p>
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
                            <FaTrophy className="text-4xl text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No Quizzes Available</h3>
                        <p className="text-gray-600">Your teachers haven't posted any quizzes yet. Check back later!</p>
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
                                <Card className="doodle-card hover:shadow-xl transition-all border-4 border-gray-100 hover:border-blue-300 group h-full flex flex-col">
                                    <CardHeader className="bg-white pb-2 border-b border-gray-100 rounded-t-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge
                                                variant="outline"
                                                className="bg-opacity-10 border-0"
                                                style={{ backgroundColor: quiz.subjectId?.color + '20', color: quiz.subjectId?.color }}
                                            >
                                                {quiz.subjectId?.name}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                {quiz.questions?.length || 0} Qs
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {quiz.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-1 flex flex-col space-y-4 bg-gray-50 rounded-b-xl">
                                        <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                                            {quiz.description || 'No description provided.'}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500 mb-2">
                                            <div className="flex items-center gap-1 bg-white p-2 rounded border">
                                                <FaClock className="text-blue-500" />
                                                {quiz.duration} mins
                                            </div>
                                            <div className="flex items-center gap-1 bg-white p-2 rounded border">
                                                <FaTrophy className="text-yellow-500" />
                                                {quiz.totalMarks} Marks
                                            </div>
                                        </div>

                                        <Link href={`/student/quizzes/${quiz._id}`} className="block mt-auto">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold doodle-button border-blue-800 group-hover:translate-y-[-2px] transition-transform">
                                                Start Quiz <FaArrowRight className="ml-2" />
                                            </Button>
                                        </Link>
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
