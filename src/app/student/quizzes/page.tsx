'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FaBrain, FaClock, FaCheckCircle, FaTimesCircle, FaTrophy } from 'react-icons/fa';

export default function StudentQuizzesPage() {
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'attempt' | 'review'>('list');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      if (userData.user.classId) {
        const subjectsRes = await fetch(`/api/subjects?classId=${userData.user.classId}`);
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          const subjectIds = subjectsData.subjects.map((s: any) => s._id);

          const quizzesPromises = subjectIds.map((id: string) =>
            fetch(`/api/quizzes?subjectId=${id}`).then(r => r.json())
          );
          const quizzesResults = await Promise.all(quizzesPromises);
          const allQuizzes = quizzesResults.flatMap(r => r.quizzes || []);
          setQuizzes(allQuizzes);
        }

        const attemptsRes = await fetch('/api/quiz-attempts');
        if (attemptsRes.ok) {
          const attemptsData = await attemptsRes.json();
          setAttempts(attemptsData.attempts || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setViewMode('attempt');
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    if (!submitted) {
      setAnswers({ ...answers, [questionIndex]: optionIndex });
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < selectedQuiz.questions.length) {
      if (!confirm('You haven\'t answered all questions. Submit anyway?')) return;
    }

    try {
      const answersArray = Object.entries(answers).map(([qIdx, ans]) => ({
        questionIndex: parseInt(qIdx),
        selectedAnswer: ans,
      }));

      const res = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: selectedQuiz._id, answers: answersArray }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setSubmitted(true);
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    }
  };

  const reviewAttempt = (attempt: any, quiz: any) => {
    setSelectedQuiz(quiz);
    const answersMap: { [key: number]: number } = {};
    attempt.answers.forEach((ans: any) => {
      answersMap[ans.questionIndex] = ans.selectedAnswer;
    });
    setAnswers(answersMap);
    setSubmitted(true);
    setResult({ score: attempt.score, totalMarks: attempt.totalMarks, passed: attempt.passed, correctCount: 0, totalQuestions: quiz.questions.length });
    setViewMode('review');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name}>
      <div className="space-y-8">
        {viewMode === 'list' ? (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <FaBrain /> My Quizzes
              </h1>
              <p className="text-gray-600 font-medium mt-2">Test your knowledge and track your progress 📝</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="gradient-card border-2 border-white shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    📋 Available Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {quizzes.length === 0 ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-6 p-8 glass-card border-2 border-purple-200 text-center"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl shadow-lg mx-auto">
                        📚
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-xl text-gray-800">No quizzes available yet</p>
                        <p className="text-gray-600">Your teacher will create quizzes soon!</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid gap-4">
                      {quizzes.map((quiz, idx) => {
                        const attempted = attempts.find(a => a.quizId._id === quiz._id);
                        return (
                          <motion.div
                            key={quiz._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02, x: 8 }}
                            className="group"
                          >
                            <div className="relative glass-card border-2 border-white p-6 hover:shadow-xl transition-all overflow-hidden">
                              {/* Gradient overlay */}
                              <div className={`absolute inset-0 ${
                                attempted?.passed
                                  ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10'
                                  : 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
                              } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                              <div className="relative z-10 flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-start gap-4 mb-3">
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.3 }}
                                      className={`w-14 h-14 rounded-2xl ${
                                        attempted?.passed
                                          ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                          : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                      } flex items-center justify-center shadow-lg flex-shrink-0`}
                                    >
                                      <FaBrain className="text-2xl text-white" />
                                    </motion.div>
                                    <div className="flex-1">
                                      <h3 className="font-bold text-gray-900 text-xl mb-1">{quiz.title}</h3>
                                      <p className="text-sm text-gray-600 font-medium">{quiz.description}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-6 text-sm text-gray-700 font-semibold ml-18">
                                    <span className="flex items-center gap-2">
                                      <span className="text-blue-500">📝</span> {quiz.questions?.length} questions
                                    </span>
                                    <span className="flex items-center gap-2">
                                      <FaClock className="text-green-500" /> {quiz.duration} min
                                    </span>
                                    <span className="flex items-center gap-2">
                                      <span className="text-purple-500">📊</span> {quiz.totalMarks} marks
                                    </span>
                                  </div>
                                  
                                  {attempted && (
                                    <div className={`mt-3 ml-18 inline-block px-4 py-2 rounded-xl font-bold ${
                                      attempted.passed
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                    }`}>
                                      Last Score: {attempted.score}/{attempted.totalMarks} {attempted.passed ? '✅' : '❌'}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-3 ml-4">
                                  <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => startQuiz(quiz)}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl shadow-md"
                                  >
                                    {attempted ? '🔄 Retake' : '▶️ Start'}
                                  </motion.button>
                                  {attempted && (
                                    <motion.button
                                      whileHover={{ y: -2 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => reviewAttempt(attempted, quiz)}
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-md"
                                    >
                                      👁️ Review
                                    </motion.button>
                                  )}
                                </div>
                              </div>

                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center mb-6"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {selectedQuiz?.title}
              </h1>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-md"
              >
                ← Back
              </motion.button>
            </motion.div>

            {submitted && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`gradient-card border-2 border-white p-8 mb-6 text-center shadow-2xl overflow-hidden relative`}
              >
                <div className={`absolute inset-0 ${
                  result.passed
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                    : 'bg-gradient-to-br from-red-500/20 to-pink-500/20'
                }`} />
                <div className="relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.6 }}
                  >
                    {result.passed ? (
                      <FaTrophy className="text-8xl text-yellow-500 mx-auto mb-4" />
                    ) : (
                      <FaTimesCircle className="text-8xl text-red-500 mx-auto mb-4" />
                    )}
                  </motion.div>
                  <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {result.passed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
                  </h2>
                  <p className="text-3xl font-black text-gray-800">
                    Score: {result.score}/{result.totalMarks}
                  </p>
                </div>
              </motion.div>
            )}

            <Card className="gradient-card border-2 border-white shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex justify-between items-center">
                  <span>📝 Questions</span>
                  {!submitted && (
                    <span className="flex items-center gap-2 text-gray-700">
                      <FaClock className="text-green-500" /> {selectedQuiz?.duration} min
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {selectedQuiz?.questions.map((q: any, idx: number) => (
                  <div key={idx} className="doodle-card bg-gray-50 border-3 border-gray-400 p-4">
                    <div className="flex gap-2 mb-3">
                      <span className="font-bold text-blue-800">Q{idx + 1}.</span>
                      <p className="font-bold text-gray-800">{q.question}</p>
                    </div>
                    <div className="space-y-2 ml-8">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = answers[idx] === optIdx;
                        const isCorrect = q.correctAnswer === optIdx;
                        return (
                          <div key={optIdx} onClick={() => selectAnswer(idx, optIdx)} className={`p-3 rounded-lg border-2 cursor-pointer ${
                            submitted ? (isCorrect ? 'bg-green-100 border-green-500' : isSelected ? 'bg-red-100 border-red-500' : 'bg-white border-gray-300') :
                            isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300 hover:border-blue-400'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input type="radio" checked={isSelected} readOnly className="w-4 h-4" />
                              <span>{opt}</span>
                              {submitted && isCorrect && <FaCheckCircle className="text-green-600 ml-auto" />}
                              {submitted && isSelected && !isCorrect && <FaTimesCircle className="text-red-600 ml-auto" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {submitted && q.explanation && (
                      <div className="mt-3 ml-8 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm"><span className="font-bold">💡</span> {q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}

                {!submitted && (
                  <Button onClick={submitQuiz} disabled={Object.keys(answers).length === 0} className="doodle-button bg-green-500 text-white border-green-800 w-full text-lg">
                    <FaCheckCircle className="mr-2" /> Submit Quiz
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
