'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCoins, FaRoute, FaStar, FaTrophy } from 'react-icons/fa';

type TopicEntry = {
  topicId: string;
  title: string;
  description?: string;
  order: number;
  difficulty?: string;
  villageName?: string;
  estimatedCredits?: number;
  masteryThreshold?: number;
  avgScore?: number;
  studentCount?: number;
  masteredCount?: number;
  attemptsCount?: number;
  quizzes?: { id: string; title: string }[];
  progress?: {
    bestPercentage: number;
    latestPercentage: number;
    attemptsCount: number;
    mastered: boolean;
    creditsEarned: number;
    totalCredits: number;
  } | null;
  students?: {
    name: string;
    bestPercentage: number;
    attemptsCount: number;
    creditsEarned: number;
    mastered: boolean;
  }[];
};

export default function TopicJourneyMap({
  subjectName,
  subjectColor = '#6366F1',
  learningTheme,
  topics,
  role,
}: {
  subjectName: string;
  subjectColor?: string;
  learningTheme?: string;
  topics: TopicEntry[];
  role: 'teacher' | 'student';
}) {
  if (!topics.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
        No roadmap yet for {subjectName}.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(239,246,255,0.9),_rgba(224,231,255,0.88))] p-6 shadow-xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Topic Journey</p>
          <h3 className="text-2xl font-black text-slate-900">{subjectName}</h3>
          {learningTheme && <p className="text-sm font-medium text-slate-600">{learningTheme}</p>}
        </div>
        <div
          className="rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${subjectColor}, #0f172a)` }}
        >
          <FaRoute className="mr-2 inline-block" />
          {topics.length} villages
        </div>
      </div>

      <div className="relative flex flex-wrap gap-5">
        <div className="absolute left-6 right-6 top-16 hidden h-1 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-500 md:block" />
        {topics
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((topic, index) => {
            const mastered = role === 'student' ? !!topic.progress?.mastered : (topic.masteredCount || 0) > 0;
            const scoreLabel = role === 'student'
              ? `${topic.progress?.bestPercentage || 0}% best`
              : `${topic.avgScore || 0}% class avg`;
            const creditsLabel = role === 'student'
              ? `${topic.progress?.creditsEarned || 0}/${topic.progress?.totalCredits || topic.estimatedCredits || 0} credits`
              : `${topic.estimatedCredits || 0} credits`;

            return (
              <motion.div
                key={topic.topicId}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="group relative min-w-[220px] flex-1"
              >
                <div className="relative h-full rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                        Village {topic.order}
                      </p>
                      <h4 className="text-lg font-black text-slate-900">{topic.villageName || topic.title}</h4>
                      <p className="text-sm font-semibold text-slate-500">{topic.title}</p>
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md ${
                        mastered ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    >
                      {mastered ? <FaTrophy /> : <FaStar />}
                    </div>
                  </div>

                  <p className="mb-4 text-sm leading-6 text-slate-600">{topic.description}</p>

                  <div className="grid gap-2 text-sm font-semibold text-slate-700">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                      <span>{scoreLabel}</span>
                      <span>{topic.difficulty || 'core'}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-3 py-2 text-amber-700">
                      <span><FaCoins className="mr-1 inline-block" /> {creditsLabel}</span>
                      <span>{role === 'student' ? `${topic.progress?.attemptsCount || 0} tries` : `${topic.attemptsCount || 0} plays`}</span>
                    </div>
                  </div>

                  {role === 'teacher' ? (
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-sm text-slate-600">
                      <p>{topic.studentCount || 0} students explored this topic</p>
                      <p>{topic.masteredCount || 0} students crossed mastery</p>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(topic.quizzes || []).slice(0, 2).map((quiz) => (
                        <Link
                          key={quiz.id}
                          href={`/student/quizzes?topicId=${topic.topicId}`}
                          className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 transition hover:bg-sky-200"
                        >
                          Practice
                        </Link>
                      ))}
                      {(!topic.quizzes || topic.quizzes.length === 0) && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          Quiz coming soon
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl group-hover:block">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                      {role === 'teacher' ? 'Performance Snapshot' : 'Your Progress'}
                    </p>
                    {role === 'teacher' ? (
                      <div className="space-y-2 text-sm text-slate-700">
                        {(topic.students || []).slice(0, 4).map((student) => (
                          <div key={student.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                            <span className="font-semibold">{student.name}</span>
                            <span>{student.bestPercentage}%</span>
                          </div>
                        ))}
                        {(!topic.students || topic.students.length === 0) && <p>No attempts yet for this topic.</p>}
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-slate-700">
                        <p>Best score: {topic.progress?.bestPercentage || 0}%</p>
                        <p>Latest score: {topic.progress?.latestPercentage || 0}%</p>
                        <p>Mastery target: {topic.masteryThreshold || 70}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
