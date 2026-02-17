# Pinecone Setup Guide

This guide will help you set up Pinecone for semantic search functionality in the EduPlatform.

## What is Pinecone?

Pinecone is a vector database that enables semantic search. In this project, it powers:
- **Smart material search** - Students can search using natural language
- **Context-aware AI chatbot** - AI retrieves relevant materials to answer questions accurately
- **Intelligent content discovery** - Find similar materials automatically

## Setup Steps

### 1. Create a Pinecone Account (Free)

1. Go to [https://www.pinecone.io](https://www.pinecone.io)
2. Click "Sign Up" or "Start Free"
3. Create your account (GitHub, Google, or email)
4. Verify your email if required

### 2. Get Your API Key

1. After logging in, you'll be on the Pinecone dashboard
2. Click on "API Keys" in the left sidebar
3. Click "Create API Key" (or copy the existing one)
4. **Copy the API key** - you'll need this for your `.env.local` file

### 3. Add to Environment Variables

Open your `.env.local` file and add:

```env
PINECONE_API_KEY=your-api-key-here
```

Replace `your-api-key-here` with the API key you copied from Pinecone.

### 4. Initialize the Index

Run the initialization script to create the Pinecone index:

```bash
node scripts/init-pinecone.js
```

This will:
- Create a new index called "study-materials"
- Configure it with 384 dimensions
- Set up in the us-east-1 region (free tier)
- Use cosine similarity for search

**Note:** The free tier includes:
- 1 serverless index
- 100,000 vectors
- 2GB storage
- This is plenty for a hackathon project or small deployment!

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Login as a teacher
3. Upload a study material (PDF, video, or link)
4. The material will be automatically indexed in Pinecone
5. Login as a student and try the Smart Search feature
6. Ask the AI chatbot questions - it will use Pinecone to find relevant materials

## Troubleshooting

### Error: "Index already exists"
- This is fine! It means the index was created successfully before
- You don't need to run the init script again

### Error: "Invalid API key"
- Double-check you copied the correct API key from Pinecone dashboard
- Make sure there are no extra spaces in your `.env.local` file
- Restart your dev server after changing environment variables

### Error: "Reached index limit"
- Free tier allows 1 index
- If you have other indexes in your Pinecone account, delete them
- Or use a different Pinecone account

### Materials not appearing in search
- Wait a few seconds after uploading (indexing takes time)
- Make sure the material has a title and description
- Try broader search terms

## Free Tier Limits

Pinecone free tier includes:
- **1 serverless index** - Enough for this project
- **100,000 vectors** - Can store thousands of study materials
- **2GB storage** - Plenty for metadata and embeddings
- **No credit card required** - Truly free!

Perfect for hackathons and development! 🚀

## Architecture

When a teacher uploads a material:
1. Material is saved to MongoDB
2. Title, description, and tags are combined into text
3. Text is converted to a 384-dimensional vector embedding
4. Vector is stored in Pinecone with metadata (class, subject, type)

When a student searches:
1. Search query is converted to a vector
2. Pinecone finds the most similar vectors (materials)
3. Results are sorted by relevance score
4. Full material details are fetched from MongoDB
5. Results displayed to student

## Next Steps

- Explore the Smart Search UI in the student materials page
- Test the AI chatbot with questions about uploaded materials
- Upload diverse materials to see semantic search in action
- Monitor your Pinecone usage in the dashboard
