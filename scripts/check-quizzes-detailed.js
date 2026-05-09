const mongoose = require('mongoose');

async function checkQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', new mongoose.Schema({
      title: String,
      subjectId: mongoose.Schema.Types.ObjectId,
      topicId: mongoose.Schema.Types.ObjectId
    }));
    const Subject = mongoose.models.Subject || mongoose.model('Subject', new mongoose.Schema({
      name: String,
      roadmap: Object
    }));

    const subject = await Subject.findOne({ name: 'Physics Intermediate' });
    if (!subject) {
      console.log('Subject not found');
      process.exit(0);
    }

    console.log('Roadmap Topics:');
    subject.roadmap.topics.forEach(t => {
      console.log(`- Topic: ${t.title}, ID: ${t._id}`);
    });

    const quizzes = await Quiz.find({ subjectId: subject._id });
    console.log(`\nFound ${quizzes.length} quizzes for Physics Intermediate:`);
    quizzes.forEach(q => {
      console.log(`- Quiz: ${q.title}, TopicID: ${q.topicId}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkQuizzes();
