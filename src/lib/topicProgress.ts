/* eslint-disable @typescript-eslint/no-explicit-any */
import Subject from '@/models/Subject';
import TopicProgress from '@/models/TopicProgress';
import User from '@/models/User';

type TopicMeta = {
  _id: any;
  title: string;
  description?: string;
  order?: number;
  difficulty?: 'foundation' | 'core' | 'advanced';
  villageName?: string;
  estimatedCredits?: number;
  masteryThreshold?: number;
};

const calculateCreditsFromScore = (percentage: number, totalCredits: number) => {
  if (percentage >= 90) return totalCredits;
  if (percentage >= 75) return Math.max(1, Math.round(totalCredits * 0.8));
  if (percentage >= 60) return Math.max(1, Math.round(totalCredits * 0.5));
  if (percentage >= 40) return Math.max(1, Math.round(totalCredits * 0.2));
  return 0;
};

export async function syncTopicProgressFromAttempt({
  studentId,
  subjectId,
  quizId,
  topicId,
  percentage,
}: {
  studentId: string;
  subjectId: string;
  quizId: string;
  topicId?: string | null;
  percentage: number;
}) {
  console.log(`[TopicProgress] Syncing for student ${studentId}, subject ${subjectId}, topic ${topicId}, score ${percentage}%`);
  
  if (!topicId) {
    console.log('[TopicProgress] No topicId provided, skipping sync');
    return null;
  }

  const subject = await Subject.findById(subjectId).lean();
  if (!subject) {
    console.error(`[TopicProgress] Subject not found: ${subjectId}`);
    return null;
  }

  const topic = subject?.roadmap?.topics?.find(
    (entry: TopicMeta) => entry._id?.toString() === topicId
  );

  if (!topic) {
    console.error(`[TopicProgress] Topic not found in subject roadmap: ${topicId}`);
    return null;
  }

  const totalCredits = topic.estimatedCredits || 10;
  const masteryThreshold = topic.masteryThreshold || 70;
  const nextCredits = calculateCreditsFromScore(percentage, totalCredits);

  console.log(`[TopicProgress] Topic: ${topic.title}, Village: ${topic.villageName}`);
  console.log(`[TopicProgress] Mastery target: ${masteryThreshold}%, Earned credits: ${nextCredits}/${totalCredits}`);

  const existing = await TopicProgress.findOne({
    studentId,
    subjectId,
    topicId,
  });

  const previousCredits = existing?.creditsEarned || 0;
  const bestPercentage = Math.max(existing?.bestPercentage || 0, percentage);
  const creditsEarned = Math.max(previousCredits, nextCredits);
  const mastered = bestPercentage >= masteryThreshold;

  console.log(`[TopicProgress] Previous credits: ${previousCredits}, New best: ${bestPercentage}%, Mastered: ${mastered}`);

  const progress = await TopicProgress.findOneAndUpdate(
    { studentId, subjectId, topicId },
    {
      $set: {
        topicTitle: topic.title,
        villageName: topic.villageName,
        latestPercentage: percentage,
        bestPercentage,
        mastered,
        creditsEarned,
        totalCredits,
        lastQuizId: quizId,
        lastAttemptAt: new Date(),
      },
      $inc: {
        attemptsCount: 1,
        quizzesCompleted: 1,
      },
    },
    { upsert: true, new: true }
  );

  const creditDelta = creditsEarned - previousCredits;
  if (creditDelta > 0) {
    console.log(`[TopicProgress] Awarding ${creditDelta} points to student ${studentId}`);
    await User.findByIdAndUpdate(studentId, {
      $inc: { points: creditDelta },
    });
  } else {
    console.log('[TopicProgress] No new credits earned in this attempt');
  }

  return progress;
}

export async function getSubjectTopicStats(subjectId: string) {
  const [subject, progressRows] = await Promise.all([
    Subject.findById(subjectId).lean(),
    TopicProgress.find({ subjectId }).populate('studentId', 'name email').lean(),
  ]);

  const topics = subject?.roadmap?.topics || [];

  return topics.map((topic: TopicMeta) => {
    const topicIdStr = topic._id?.toString() || '';
    const rows = progressRows.filter((row: any) => row.topicId?.toString() === topicIdStr);
    const avgScore = rows.length
      ? Math.round((rows.reduce((sum: number, row: any) => sum + (row.bestPercentage || 0), 0) / rows.length) * 10) / 10
      : 0;

    return {
      topicId: topicIdStr,
      title: topic.title,
      description: topic.description,
      order: topic.order,
      difficulty: topic.difficulty,
      estimatedCredits: topic.estimatedCredits,
      villageName: topic.villageName,
      masteryThreshold: topic.masteryThreshold,
      avgScore,
      studentCount: rows.length,
      masteredCount: rows.filter((row: any) => row.mastered).length,
      attemptsCount: rows.reduce((sum: number, row: any) => sum + (row.attemptsCount || 0), 0),
      students: rows.map((row: any) => ({
        studentId: row.studentId?._id?.toString?.() || '',
        name: row.studentId?.name || 'Student',
        email: row.studentId?.email || '',
        bestPercentage: row.bestPercentage || 0,
        latestPercentage: row.latestPercentage || 0,
        attemptsCount: row.attemptsCount || 0,
        creditsEarned: row.creditsEarned || 0,
        mastered: !!row.mastered,
      })),
    };
  });
}
