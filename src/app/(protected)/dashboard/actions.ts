'use server'

import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding } from '~/lib/gemini'
import { db } from '~/server/db'
import { auth } from '@clerk/nextjs/server'

// Simple hash-based embedding fallback when API quota is exceeded
function generateSimpleEmbedding(text: string): number[] {
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const embedding: number[] = Array.from({ length: 768 }, () => 0);
  for (let i = 0; i < 768; i++) {
    embedding[i] = Math.sin(hash + i) * 0.5;
  }
  return embedding;
}

export async function askQuestion(question: string, projectId: string) {
  // Get the current user
  const { userId } = await auth()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  
  // Get user's API key
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { geminiApiKey: true }
  })
  
  if (!user?.geminiApiKey) {
    throw new Error('No Gemini API key available. Please add your API key in the navbar.')
  }

  const google = createGoogleGenerativeAI({
    apiKey: user.geminiApiKey,
  })

  let queryVector: number[];
  try {
    queryVector = await generateEmbedding(question, user.geminiApiKey);
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback to a simple hash-based embedding when API quota is exceeded
    queryVector = generateSimpleEmbedding(question);
  }
  const vectorQuery = `[${queryVector.join(', ')}]`

  // First, check if there are any embeddings for this project
  const totalEmbeddings = await db.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = ${projectId}
  `
  console.log(`Total embeddings in project: ${totalEmbeddings[0]?.count || 0}`);

  console.log('Searching for similar code with vector query...');
  const result = await db.$queryRaw<
    { fileName: string; sourceCode: string; summary: string }[]
  >`
    SELECT "fileName", "sourceCode", "summary",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.1
      AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  `

  console.log(`Found ${result.length} similar code snippets`);
  
  let context = ''
  if (result.length === 0) {
    // If no similar code found, get some random code snippets as fallback
    console.log('No similar code found, getting random snippets as fallback...');
    const fallbackResult = await db.$queryRaw<
      { fileName: string; sourceCode: string; summary: string }[]
    >`
      SELECT "fileName", "sourceCode", "summary"
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
      ORDER BY RANDOM()
      LIMIT 5
    `
    
    for (const doc of fallbackResult) {
      context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
    }
    console.log(`Using ${fallbackResult.length} fallback snippets`);
  } else {
    for (const doc of result) {
      context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
    }
  }
  
  console.log('Context length:', context.length);
  console.log('Context preview:', context.substring(0, 200) + '...');

  const { textStream } = streamText({
    model: google('gemini-1.5-flash'),
    prompt: `
You are an AI assistant helping with code analysis and questions about a codebase.

IMPORTANT INSTRUCTIONS:
- Answer questions based on the provided code context
- If the context contains relevant information, provide a detailed answer with code examples
- If the context doesn't contain specific information about the question, provide a general answer based on your knowledge about the topic
- Always be helpful and provide actionable insights
- Use HTML formatting for better readability
- Include code snippets when relevant

CONTEXT BLOCK (Code from the codebase):
${context}

USER QUESTION:
${question}

Please provide a helpful response based on the context and your knowledge. If the context doesn't contain specific information about the question, you can still provide general guidance about the topic.
    `,
  })

  let fullResponse = ''
  console.log('Starting to stream response...');
  try {
    for await (const delta of textStream) {
      fullResponse += delta
      console.log('Received delta:', delta.substring(0, 50) + '...');
    }
    console.log('Final response length:', fullResponse.length);
  } catch (error) {
    console.error('Error streaming response:', error);
    if (error instanceof Error && error.message.includes('429')) {
      fullResponse = 'Sorry, the AI service is currently experiencing high demand. Please try again later or check your API quota.';
    } else {
      fullResponse = 'Sorry, there was an error generating the response. Please try again.';
    }
  }

  return {
    output: fullResponse,
    fileReferences: result,
  }
}
