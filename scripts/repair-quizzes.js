const mongoose = require('mongoose');

async function repairQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', new mongoose.Schema({
      title: String,
      subjectId: mongoose.Schema.Types.ObjectId,
      topicId: mongoose.Schema.Types.ObjectId,
      topicTitle: String
    }));
    const Subject = mongoose.models.Subject || mongoose.model('Subject', new mongoose.Schema({
      name: String,
      roadmap: Object
    }));

    const subjects = await Subject.find({ 'roadmap.topics': { $exists: true, $not: { $size: 0 } } });
    console.log(`Found ${subjects.length} subjects with roadmaps.`);

    for (const subject of subjects) {
      const quizzes = await Quiz.find({ subjectId: subject._id, topicId: { $exists: false } });
      console.log(`Checking ${quizzes.length} quizzes without topicId for subject: ${subject.name}`);

      for (const quiz of quizzes) {
        // Try to find topic in roadmap by title
        const topic = subject.roadmap.topics.find(t => 
          quiz.title.toLowerCase().includes(t.title.toLowerCase()) || 
          (quiz.topicTitle && quiz.topicTitle.toLowerCase() === t.title.toLowerCase())
        );

        if (topic) {
          console.log(`- Linking quiz "${quiz.title}" to topic "${topic.title}" (${topic._id})`);
          await Quiz.findByIdAndUpdate(quiz._id, { $set: { topicId: topic._id, topicTitle: topic.title } });
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

repairQuizzes();
