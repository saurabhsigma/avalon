/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import TopicJourneyMap from '@/components/TopicJourneyMap';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FaBook, FaChartLine, FaCoins, FaGraduationCap, FaTrophy } from 'react-icons/fa';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    attendance: 0,
    assignments: 0,
    averageGrade: 0,
    creditsEarned: 0,
    topicsMastered: 0,
  });
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

      if (!userData.user.classId) {
        setLoading(false);
        return;
      }

      const [subjectsRes, overviewRes] = await Promise.all([
        fetch(`/api/subjects?classId=${userData.user.classId}`),
        fetch('/api/student/overview'),
      ]);

      const subjectsData = subjectsRes.ok ? await subjectsRes.json() : { subjects: [] };
      const nextSubjects = subjectsData.subjects || [];
      setSubjects(nextSubjects);

      if (overviewRes.ok) {
        const overview = await overviewRes.json();
        setStats({
          totalSubjects: nextSubjects.length,
          attendance: overview.attendance || 0,
          assignments: overview.assignmentsPending ?? overview.assignmentsTotal ?? 0,
          averageGrade: overview.avgGrade || 0,
          creditsEarned: overview.creditsEarned || 0,
          topicsMastered: overview.topicsMastered || 0,
        });
      } else {
        setStats((prev) => ({ ...prev, totalSubjects: nextSubjects.length }));
      }

      const roadmapResponses = await Promise.all(
        nextSubjects.map(async (subject: any) => {
          const roadmapRes = await fetch(`/api/subjects/roadmap?subjectId=${subject._id}`);
          if (!roadmapRes.ok) return null;
          return roadmapRes.json();
        })
      );

      setRoadmaps(roadmapResponses.filter(Boolean));
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-8 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-xl font-bold text-gray-700">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout userRole="student" userName={user.name}>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="mt-2 text-gray-600 font-medium">Track credits, master topic villages, and replay quizzes as often as you want.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/student/quizzes">
              <Button className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                <FaTrophy className="mr-2" />
                Practice Quizzes
              </Button>
            </Link>
            <Link href="/student/classes">
              <Button variant="outline">
                <FaGraduationCap className="mr-2" />
                My Class
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {[
            { title: 'Subjects', value: stats.totalSubjects, icon: FaBook, tone: 'from-sky-400 to-blue-600' },
            { title: 'Attendance', value: `${stats.attendance}%`, icon: FaChartLine, tone: 'from-emerald-400 to-green-600' },
            { title: 'Pending Tasks', value: stats.assignments, icon: FaGraduationCap, tone: 'from-violet-400 to-fuchsia-600' },
            { title: 'Best Avg', value: `${stats.averageGrade}%`, icon: FaTrophy, tone: 'from-amber-400 to-orange-600' },
            { title: 'Credits', value: stats.creditsEarned, icon: FaCoins, tone: 'from-pink-400 to-rose-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wide text-gray-500">{stat.title}</span>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.tone} text-white shadow-lg`}>
                  <stat.icon />
                </div>
              </div>
              <div className={`text-4xl font-black bg-gradient-to-br ${stat.tone} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 p-6 text-white shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-200">Adventure Summary</p>
          <h2 className="mt-2 text-3xl font-black">{stats.topicsMastered} villages mastered</h2>
          <p className="mt-2 max-w-2xl text-sm text-sky-100">
            Every topic can be attempted again. Your best performance earns the most credits, so each retry helps you level up without losing earlier progress.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {subjects.map((subject) => {
            const roadmapSummary = roadmaps.find((roadmap) => roadmap.subject?._id === subject._id);
            const totalCredits = (roadmapSummary?.topics || []).reduce(
              (sum: number, topic: any) => sum + (topic.progress?.totalCredits || topic.estimatedCredits || 0),
              0
            );
            const earnedCredits = (roadmapSummary?.topics || []).reduce(
              (sum: number, topic: any) => sum + (topic.progress?.creditsEarned || 0),
              0
            );

            return (
              <motion.div
                key={subject._id}
                whileHover={{ y: -4 }}
                className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-xl"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-2xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${subject.color}, #0f172a)` }}
                  />
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{subject.name}</h3>
                    <p className="text-sm font-medium text-slate-500">{subject.teacherId?.name || 'Teacher'}</p>
                  </div>
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  {roadmapSummary?.subject?.roadmap?.learningTheme || 'Roadmap coming soon for this subject.'}
                </p>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p>Credits earned: {earnedCredits}/{totalCredits}</p>
                  <p>Topic villages: {roadmapSummary?.topics?.length || 0}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link href={`/student/materials?subject=${subject._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">Materials</Button>
                  </Link>
                  <Link href={`/student/quizzes?subjectId=${subject._id}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white">Practice</Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-6">
          {roadmaps.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-600">
              Your teachers have not generated any topic journeys yet.
            </div>
          ) : (
            roadmaps.map((roadmap) => (
              <TopicJourneyMap
                key={roadmap.subject._id}
                role="student"
                subjectName={roadmap.subject.name}
                subjectColor={roadmap.subject.color}
                learningTheme={roadmap.subject.roadmap?.learningTheme}
                topics={roadmap.topics || []}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
