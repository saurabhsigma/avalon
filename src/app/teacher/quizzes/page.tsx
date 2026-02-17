'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain, FaPlus, FaTrash, FaRobot, FaMagic, FaSpinner, FaCheckCircle } from 'react-icons/fa';

export default function TeacherQuizzesPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    duration: 30,
    totalMarks: 100,
    passingMarks: 40,
    questions: [] as any[],
  });

  const [aiForm, setAiForm] = useState({
    topic: '',
    numQuestions: 5,
    difficulty: 'medium',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject) {
      fetchQuizzes();
    }
  }, [selectedSubject]);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const classesRes = await fetch('/api/classes');
      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`/api/subjects?classId=${selectedClass}`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`/api/quizzes?subjectId=${selectedSubject}`);
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const generateQuizWithAI = async () => {
    if (!aiForm.topic || !aiForm.numQuestions) {
      alert('Please fill topic and number of questions');
      return;
    }

    setGenerating(true);
    try {
      const subjectName = subjects.find(s => s._id === selectedSubject)?.name || '';
      
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiForm.topic,
          subject: subjectName,
          numQuestions: aiForm.numQuestions,
          difficulty: aiForm.difficulty,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await res.json();
      setQuizForm({
        ...quizForm,
        title: `${aiForm.topic} Quiz`,
        questions: data.questions,
      });
      alert(`Generated ${data.questions.length} questions!`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const saveQuiz = async () => {
    if (!quizForm.title || quizForm.questions.length === 0 || !selectedSubject) {
      alert('Please fill all required fields and add questions');
      return;
    }

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quizForm,
          subjectId: selectedSubject,
          isAIGenerated: true,
        }),
      });

      if (res.ok) {
        alert('Quiz created successfully!');
        setShowCreateForm(false);
        setQuizForm({
          title: '',
          description: '',
          duration: 30,
          totalMarks: 100,
          passingMarks: 40,
          questions: [],
        });
        setAiForm({ topic: '', numQuestions: 5, difficulty: 'medium' });
        fetchQuizzes();
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz');
    }
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    
    try {
      const res = await fetch(`/api/quizzes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuizzes();
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...quizForm.questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizForm({ ...quizForm, questions: updated });
  };

  const deleteQuestion = (index: number) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-xl font-bold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="teacher" userName={user?.name}>
      <motion.div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <FaBrain /> AI Quiz Generator
            </h1>
            <p className="text-gray-600 font-medium mt-2">Create intelligent quizzes with AI assistance 🤖</p>
          </div>
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="doodle-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-white shadow-xl text-lg px-6 py-6"
            >
              <FaPlus className="mr-2" />
              {showCreateForm ? 'Cancel' : 'Create Quiz'}
            </Button>
          </motion.div>
        </motion.div>

        {/* Class & Subject Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-card border-2 border-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                📚 Select Class & Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold text-gray-700 mb-3 text-lg">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  >
                    <option value="">Choose a class...</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2">Select Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full p-3 border-3 border-gray-400 rounded-lg font-medium"
                >
                  <option value="">Choose a subject...</option>
                  {subjects.map((subj) => (
                    <option key={subj._id} value={subj._id}>
                      {subj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Create Quiz Form - Continuation in next message due to length */}
        <AnimatePresence>
          {showCreateForm && selectedClass && selectedSubject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="doodle-card bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-600">
                <CardHeader className="bg-purple-200 border-b-4 border-purple-600">
                  <CardTitle className="text-2xl font-bold text-purple-900 flex items-center gap-2">
                    <FaRobot /> AI Quiz Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* AI Generation Form */}
                  <div className="doodle-card bg-white border-3 border-blue-500 p-6">
                    <h3 className="font-bold text-xl text-blue-900 mb-4 flex items-center gap-2">
                      <FaMagic /> Generate Questions with AI
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Topic *</label>
                        <Input
                          value={aiForm.topic}
                          onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                          placeholder="e.g., Photosynthesis"
                          className="border-3 border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Number of Questions</label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={aiForm.numQuestions}
                          onChange={(e) => setAiForm({ ...aiForm, numQuestions: parseInt(e.target.value) })}
                          className="border-3 border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Difficulty</label>
                        <select
                          value={aiForm.difficulty}
                          onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                          className="w-full p-3 border-3 border-gray-400 rounded-lg font-medium"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    <Button
                      onClick={generateQuizWithAI}
                      disabled={generating}
                      className="doodle-button bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-800 w-full"
                    >
                      {generating ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FaMagic className="mr-2" />
                          Generate Questions with AI
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Quiz Details */}
                  <div className="doodle-card bg-white border-3 border-green-500 p-6">
                    <h3 className="font-bold text-xl text-green-900 mb-4">Quiz Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Quiz Title *</label>
                        <Input
                          value={quizForm.title}
                          onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                          placeholder="e.g., Biology Chapter 3 Quiz"
                          className="border-3 border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Duration (minutes)</label>
                        <Input
                          type="number"
                          value={quizForm.duration}
                          onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) })}
                          className="border-3 border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Total Marks</label>
                        <Input
                          type="number"
                          value={quizForm.totalMarks}
                          onChange={(e) => setQuizForm({ ...quizForm, totalMarks: parseInt(e.target.value) })}
                          className="border-3 border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Passing Marks</label>
                        <Input
                          type="number"
                          value={quizForm.passingMarks}
                          onChange={(e) => setQuizForm({ ...quizForm, passingMarks: parseInt(e.target.value) })}
                          className="border-3 border-gray-400"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-bold text-gray-700 mb-2">Description</label>
                        <Textarea
                          value={quizForm.description}
                          onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                          placeholder="Brief description..."
                          rows={2}
                          className="border-3 border-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Questions List */}
                  {quizForm.questions.length > 0 && (
                    <div className="doodle-card bg-white border-3 border-yellow-500 p-6">
                      <h3 className="font-bold text-xl text-yellow-900 mb-4">
                        Questions ({quizForm.questions.length})
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {quizForm.questions.map((q, idx) => (
                          <div key={idx} className="doodle-card bg-gray-50 border-2 border-gray-300 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-gray-700">Q{idx + 1}.</span>
                              <Button
                                onClick={() => deleteQuestion(idx)}
                                className="doodle-button bg-red-500 text-white border-red-800 h-8 px-2"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Input
                                value={q.question}
                                onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                                className="font-medium"
                              />
                              {q.options.map((opt: string, optIdx: number) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={q.correctAnswer === optIdx}
                                    onChange={() => updateQuestion(idx, 'correctAnswer', optIdx)}
                                    className="w-4 h-4"
                                  />
                                  <Input
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...q.options];
                                      newOpts[optIdx] = e.target.value;
                                      updateQuestion(idx, 'options', newOpts);
                                    }}
                                    className="flex-1"
                                  />
                                </div>
                              ))}
                              {q.explanation && (
                                <p className="text-sm text-gray-600 italic bg-blue-50 p-2 rounded">
                                  💡 {q.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  {quizForm.questions.length > 0 && (
                    <Button
                      onClick={saveQuiz}
                      className="doodle-button bg-green-500 text-white border-green-800 w-full text-lg"
                    >
                      <FaCheckCircle className="mr-2" />
                      Save & Publish Quiz
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quizzes List */}
        {selectedClass && selectedSubject && (
          <Card className="doodle-card bg-white border-4 border-green-600">
            <CardHeader className="bg-green-100 border-b-4 border-green-600">
              <CardTitle className="text-2xl font-bold text-green-800">Published Quizzes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {quizzes.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No quizzes created yet</p>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <motion.div
                      key={quiz._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="doodle-card bg-blue-100 border-3 border-blue-500 p-4 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{quiz.title}</h3>
                        <p className="text-sm text-gray-600">{quiz.description || 'No description'}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>📝 {quiz.questions?.length || 0} questions</span>
                          <span>⏱️ {quiz.duration} min</span>
                          <span>📊 {quiz.totalMarks} marks</span>
                          {quiz.isAIGenerated && <span className="text-purple-600">🤖 AI Generated</span>}
                        </div>
                      </div>
                      <Button
                        onClick={() => deleteQuiz(quiz._id)}
                        className="doodle-button bg-red-500 text-white border-red-800"
                      >
                        <FaTrash />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
