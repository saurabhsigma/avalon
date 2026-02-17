import { Pinecone } from '@pinecone-database/pinecone';
import Groq from 'groq-sdk';

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

// Initialize Groq for embeddings (using llama for text generation)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const INDEX_NAME = 'study-materials';

/**
 * Initialize Pinecone index (call this once during setup)
 * Note: For free tier, you get 1 serverless index with up to 100k vectors
 */
export async function initializePineconeIndex() {
  try {
    const indexList = await pinecone.listIndexes();
    const indexExists = indexList.indexes?.some(index => index.name === INDEX_NAME);

    if (!indexExists) {
      console.log('Creating Pinecone index...');
      await pinecone.createIndex({
        name: INDEX_NAME,
        dimension: 384, // Using a smaller embedding model for free tier
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1', // Free tier available region
          },
        },
      });
      console.log('Pinecone index created successfully');
    }

    return pinecone.index(INDEX_NAME);
  } catch (error) {
    console.error('Error initializing Pinecone:', error);
    throw error;
  }
}

/**
 * Get Pinecone index
 */
export function getPineconeIndex() {
  return pinecone.index(INDEX_NAME);
}

/**
 * Create embeddings from text using a simple approach
 * Since we're using Groq which doesn't have an embedding endpoint,
 * we'll use a simple TF-IDF-like approach or fallback to a public API
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    // For hackathon purposes, we'll use a simple hashing-based embedding
    // In production, you'd use OpenAI embeddings or similar
    // This creates a 384-dimensional vector from text
    const embedding = await simpleTextToVector(text, 384);
    return embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

/**
 * Simple text to vector conversion (for demo/free tier)
 * This is a simplified approach for the hackathon
 */
function simpleTextToVector(text: string, dimensions: number): number[] {
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  
  // Create a deterministic vector based on text characteristics
  const vector = new Array(dimensions).fill(0);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const index = (charCode * (i + 1) * (j + 1)) % dimensions;
      vector[index] += 1;
    }
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => magnitude > 0 ? val / magnitude : 0);
}

/**
 * Store material in Pinecone with metadata
 */
export async function storeMaterial(
  materialId: string,
  title: string,
  description: string,
  content: string,
  metadata: {
    classId: string;
    subjectId: string;
    type: string;
    url?: string;
  }
) {
  try {
    const index = getPineconeIndex();
    
    // Combine title, description, and content for better search
    const textToEmbed = `${title} ${description} ${content}`.substring(0, 5000); // Limit length
    const embedding = await createEmbedding(textToEmbed);
    
    await index.upsert({
      records: [
        {
          id: materialId,
          values: embedding,
          metadata: {
            title,
            description,
            content: content.substring(0, 1000), // Store snippet
            ...metadata,
          },
        },
      ],
    });
    
    console.log(`Material ${materialId} stored in Pinecone`);
    return true;
  } catch (error) {
    console.error('Error storing material in Pinecone:', error);
    return false;
  }
}

/**
 * Search for similar materials using semantic search
 */
export async function searchMaterials(
  query: string,
  filters?: {
    classId?: string;
    subjectId?: string;
    type?: string;
  },
  topK: number = 5
) {
  try {
    const index = getPineconeIndex();
    const queryEmbedding = await createEmbedding(query);
    
    const searchParams: any = {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    };
    
    // Add filters if provided
    if (filters && Object.keys(filters).length > 0) {
      const filterConditions: any = {};
      if (filters.classId) filterConditions.classId = filters.classId;
      if (filters.subjectId) filterConditions.subjectId = filters.subjectId;
      if (filters.type) filterConditions.type = filters.type;
      searchParams.filter = filterConditions;
    }
    
    const results = await index.query(searchParams);
    
    return results.matches?.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    })) || [];
  } catch (error) {
    console.error('Error searching materials:', error);
    return [];
  }
}

/**
 * Delete material from Pinecone
 */
export async function deleteMaterial(materialId: string) {
  try {
    const index = getPineconeIndex();
    await index.deleteOne({ id: materialId });
    console.log(`Material ${materialId} deleted from Pinecone`);
    return true;
  } catch (error) {
    console.error('Error deleting material from Pinecone:', error);
    return false;
  }
}

/**
 * Get context for AI chatbot from relevant materials
 */
export async function getContextForAI(
  query: string,
  classId?: string,
  subjectId?: string
): Promise<string> {
  try {
    const results = await searchMaterials(
      query,
      classId || subjectId ? { classId, subjectId } : undefined,
      3 // Get top 3 most relevant materials
    );
    
    if (results.length === 0) {
      return '';
    }
    
    // Format context for AI
    const context = results
      .map((result, index) => {
        const meta = result.metadata as any;
        return `[Material ${index + 1}: ${meta.title}]\n${meta.description}\n${meta.content}`;
      })
      .join('\n\n');
    
    return context;
  } catch (error) {
    console.error('Error getting context for AI:', error);
    return '';
  }
}
