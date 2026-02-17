// Run this script to fix the Subject model index issue
// Usage: node scripts/fix-subject-index.js

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saurabh:EvKJuuNxtsxWGxd0@cluster0.e8d2pel.mongodb.net/ai-classroom?retryWrites=true&w=majority';

async function fixSubjectIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('subjects');

    // Get existing indexes
    console.log('\nExisting indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    // Drop the old name_1 unique index if it exists
    try {
      console.log('\nDropping old name_1 index...');
      await collection.dropIndex('name_1');
      console.log('✓ Dropped name_1 index');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('  Index name_1 does not exist (already removed or never created)');
      } else {
        throw error;
      }
    }

    // Create the new compound unique index
    try {
      console.log('\nCreating compound unique index on name + classId...');
      await collection.createIndex(
        { name: 1, classId: 1 },
        { unique: true, name: 'name_1_classId_1' }
      );
      console.log('✓ Created name_1_classId_1 index');
    } catch (error) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('  Index already exists with correct options');
      } else {
        throw error;
      }
    }

    // Show updated indexes
    console.log('\nUpdated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    console.log('\n✅ Subject index migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing subject index:', error);
    process.exit(1);
  }
}

fixSubjectIndex();
