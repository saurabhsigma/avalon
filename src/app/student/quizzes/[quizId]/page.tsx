'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaClock, FaCheckCircle, FaTimesCircle, FaArrowRight, FaArrowLeft, FaTrophy } from 'react-icons/fa';

export default function TakeQuizPage() {
    const { quizId } = useParams();
    const router = useRouter();

    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, number>>({}); // Question index -> Option index
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (quizId) fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && quiz && !isSubmitted) {
            submitQuiz();
        }
    }, [timeLeft, isSubmitted, quiz]);

    const fetchQuiz = async () => {
        try {
            // Fetch ALL quizzes and find the one (not efficient but reuses existing API)
            // Or implement GET /api/quizzes/[id]
            // Since existing API returns list, let's filter client side or implement ID fetch
            // Let's rely on basic GET for now, but ideally we need ID support in GET
            // Wait, GET /api/quizzes supports query params but not ID directly?
            // I should update API to support ID.
            // Or just fetch all quizzes for my class and find it.
            // Let's try fetching all for now as MVP.

            // Update: Let's assume we can fetch by ID or filter client side.
            const res = await fetch('/api/quizzes'); // Fetching all is bad for performance eventually
            const data = await res.json();
            const foundQuiz = data.quizzes?.find((q: any) => q._id === quizId);

            if (foundQuiz) {
                setQuiz(foundQuiz);
                setTimeLeft(foundQuiz.duration * 60);
            } else {
                alert('Quiz not found');
                router.push('/student/quizzes');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        if (isSubmitted) return;
        setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const submitQuiz = () => {
        if (isSubmitted) return;

        let calculatedScore = 0;
        quiz.questions.forEach((q: any, index: number) => {
            if (answers[index] === q.correctAnswer) {
                calculatedScore += 1; // Simplify scoring (1 point per question or distribute total marks)
            }
        });

        // Calculate marks
        const marksPerQ = quiz.totalMarks / quiz.questions.length;
        const finalScore = Math.round(calculatedScore * marksPerQ);

        setScore(finalScore);
        setIsSubmitted(true);

        // Ideally send score to backend API (to implement later: /api/results)
        // console.log('Score:', finalScore);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading || !quiz) {
        return (
            <DashboardLayout userRole="student" userName="Student">
                <div className="flex h-screen items-center justify-center">Loading...</div>
            </DashboardLayout>
        );
    }

    if (isSubmitted) {
        return (
            <DashboardLayout userRole="student" userName="Student">
                <div className="max-w-2xl mx-auto py-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="doodle-card bg-white border-4 border-green-600 text-center p-10"
                    >
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-600">
                            <FaTrophy className="text-5xl text-yellow-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
                        <p className="text-gray-600 mb-6">You have successfully submitted the quiz.</p>

                        <div className="text-6xl font-bold text-green-700 mb-2">{score} <span className="text-2xl text-gray-400">/ {quiz.totalMarks}</span></div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-8">Your Score</p>

                        <Button onClick={() => router.push('/student/quizzes')} className="doodle-button bg-blue-600 text-white font-bold border-blue-800">
                            Back to Quizzes
                        </Button>
                    </motion.div>
                </div>
            </DashboardLayout>
        );
    }

    const currentQ = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <DashboardLayout userRole="student" userName="Student">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm sticky top-20 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg border-2 ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                        <FaClock /> {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Not using Progress component just yet, simple div bar */}
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="doodle-card border-4 border-gray-300 min-h-[400px] flex flex-col justify-between">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium text-gray-800 leading-relaxed">
                                    {currentQ.question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {currentQ.options.map((option: string, index: number) => (
                                    <div
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 group
                                    ${answers[currentQuestionIndex] === index
                                                ? 'bg-blue-100 border-blue-500 shadow-md'
                                                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }
                                `}
                                    >
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm
                                     ${answers[currentQuestionIndex] === index
                                                ? 'bg-blue-500 border-blue-600 text-white'
                                                : 'bg-gray-100 border-gray-300 text-gray-500 group-hover:border-blue-400'
                                            }
                                `}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className={answers[currentQuestionIndex] === index ? 'font-semibold text-blue-900' : 'text-gray-700'}>
                                            {option}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>

                            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-between">
                                <Button
                                    variant="ghost"
                                    disabled={currentQuestionIndex === 0}
                                    onClick={prevQuestion}
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    <FaArrowLeft className="mr-2" /> Previous
                                </Button>

                                {currentQuestionIndex === quiz.questions.length - 1 ? (
                                    <Button
                                        onClick={submitQuiz}
                                        className="doodle-button bg-green-600 hover:bg-green-700 text-white font-bold border-green-800 px-8"
                                    >
                                        Submit Quiz
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={nextQuestion}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
                                    >
                                        Next <FaArrowRight className="ml-2" />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
