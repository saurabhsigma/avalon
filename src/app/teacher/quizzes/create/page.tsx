'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FaPlus, FaTrash, FaCheckCircle, FaSave, FaArrowLeft } from 'react-icons/fa';

export default function CreateQuizPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [quizDetails, setQuizDetails] = useState({
        title: '',
        description: '',
        classId: '',
        subjectId: '',
        duration: 30, // minutes
        totalMarks: 100,
        passingMarks: 40,
    });

    interface Question {
        question: string;
        options: string[];
        correctAnswer: number; // Index of correct option (0-3)
        explanation: string;
    }

    const [questions, setQuestions] = useState<Question[]>([
        { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ]);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (quizDetails.classId) {
            fetchSubjects(quizDetails.classId);
        }
    }, [quizDetails.classId]);

    const fetchClasses = async () => {
        try {
            const res = await fetch('/api/classes');
            const data = await res.json();
            setClasses(data.classes || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSubjects = async (classId: string) => {
        try {
            const res = await fetch(`/api/subjects?classId=${classId}`);
            const data = await res.json();
            setSubjects(data.subjects || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...quizDetails,
                    questions
                })
            });

            if (res.ok) {
                router.push('/teacher/quizzes');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to create quiz');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating quiz');
        }
    };

    return (
        <DashboardLayout userRole="teacher" userName="Teacher">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <FaArrowLeft className="mr-2" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold text-green-800">Create Quiz</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Details */}
                    <Card className="doodle-card border-green-600 bg-white">
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label>Quiz Title</Label>
                                <Input
                                    value={quizDetails.title}
                                    onChange={(e) => setQuizDetails({ ...quizDetails, title: e.target.value })}
                                    required
                                    placeholder="e.g. Physics Midterm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={quizDetails.description}
                                    onChange={(e) => setQuizDetails({ ...quizDetails, description: e.target.value })}
                                    placeholder="Instructions for students..."
                                />
                            </div>
                            <div>
                                <Label>Class</Label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={quizDetails.classId}
                                    onChange={(e) => setQuizDetails({ ...quizDetails, classId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Subject</Label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={quizDetails.subjectId}
                                    onChange={(e) => setQuizDetails({ ...quizDetails, subjectId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Duration (mins)</Label>
                                <Input
                                    type="number"
                                    value={quizDetails.duration}
                                    onChange={(e) => setQuizDetails({ ...quizDetails, duration: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                {/* Placeholder for total marks calculation logic later if needed */}
                                <Label>Total Marks</Label>
                                <Input
                                    type="number"
                                    value={quizDetails.totalMarks}
                                    onChange={(e) => setQuizDetails({ ...quizDetails, totalMarks: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">Questions</h2>
                        {questions.map((q, qIndex) => (
                            <Card key={qIndex} className="doodle-card border-gray-300 relative">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Question {qIndex + 1}</Label>
                                        {questions.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => removeQuestion(qIndex)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        value={q.question}
                                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                        placeholder="Enter question text..."
                                        required
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correctAnswer === oIndex}
                                                    onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                                                />
                                                <Input
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    required
                                                    className={q.correctAnswer === oIndex ? "border-green-500 ring-1 ring-green-500" : ""}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Explanation (Optional)</Label>
                                        <Input
                                            value={q.explanation}
                                            onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                            placeholder="Explain the correct answer..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button type="button" onClick={addQuestion} variant="outline" className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-green-600 hover:border-green-500">
                            <FaPlus className="mr-2" /> Add Question
                        </Button>
                    </div>

                    <div className="sticky bottom-4 bg-white p-4 border-t-2 shadow-lg rounded-xl flex justify-end">
                        <Button type="submit" size="lg" className="doodle-button bg-green-600 hover:bg-green-700 text-white font-bold border-green-800 text-lg px-8">
                            <FaSave className="mr-2" /> Publish Quiz
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
