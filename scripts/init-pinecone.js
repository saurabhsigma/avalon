import { initializePineconeIndex } from '../src/lib/pinecone';

/**
 * Script to initialize Pinecone index for the application
 * Run this once after setting up your Pinecone API key
 * 
 * Usage: node scripts/init-pinecone.js
 */

async function main() {
  try {
    console.log('🚀 Initializing Pinecone index...');
    
    if (!process.env.PINECONE_API_KEY) {
      console.error('❌ Error: PINECONE_API_KEY not found in environment variables');
      console.log('Please add your Pinecone API key to .env.local');
      process.exit(1);
    }

    await initializePineconeIndex();
    
    console.log('✅ Pinecone index initialized successfully!');
    console.log('📊 Index name: study-materials');
    console.log('📏 Dimension: 384');
    console.log('📍 Region: us-east-1');
    console.log('\nYou can now start uploading materials - they will be automatically indexed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing Pinecone:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your PINECONE_API_KEY is correct');
    console.log('2. Check your Pinecone account has free tier available');
    console.log('3. Verify you have not exceeded the free tier limits (1 index)');
    process.exit(1);
  }
}

main();
