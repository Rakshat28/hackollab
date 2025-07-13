import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import type { Document } from '@langchain/core/documents'
import { generateEmbedding } from './gemini'
import { summariseCode } from './gemini'
import { db } from '~/server/db'

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  let docs: Document[] = [];
  let triedMaster = false;
  try {
    const loader = new GithubRepoLoader(githubUrl, {
      accessToken: githubToken ?? '',
      branch: 'main',
      ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
      recursive: true,
      unknown: 'warn',
      maxConcurrency: 5,
    });
    docs = await loader.load();
  } catch (e) {
    // If main branch fails, try master
    triedMaster = true;
    try {
      const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken ?? '',
        branch: 'master',
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5,
      });
      docs = await loader.load();
    } catch (err) {
      throw new Error('Failed to load repo from both main and master branches.');
    }
  }
  return docs;
}

export const indexGithubRepo = async (githubUrl: string, githubToken?: string, projectId?: string, apiKey?: string) => {
  if (!apiKey) {
    throw new Error('Gemini API key is required for indexing');
  }
  const docs = await loadGithubRepo(githubUrl, githubToken);
  
  // Limit to first 50 files to avoid overwhelming the API
  const limitedDocs = docs.slice(0, 50);
  console.log(`Processing ${limitedDocs.length} files out of ${docs.length} total files`);
  
  const allEmbeddings = await generateEmbeddings(limitedDocs, apiKey);

  await Promise.allSettled(allEmbeddings.map(async (embedding) => {
    if (!embedding) return;

    const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
      data: {
        summary: embedding.summary,
        sourceCode: embedding.sourceCode,
        fileName: embedding.fileName,
        projectId: projectId!,
      }
    });

    await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}`;
  }));
};


// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateEmbeddings = async(docs: Document[], apiKey: string) => {
  const results = [];
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;
  
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    if (!doc) continue;
    
    try {
      console.log(`Processing file ${i + 1}/${docs.length}: ${(doc.metadata as {source : string}).source}`);
      
      const summary = await summariseCode(doc, apiKey); 
      const embedding = await generateEmbedding(summary, apiKey);
      
      results.push({
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)) as string,
        fileName: (doc.metadata as {source : string}).source 
      });
      
      consecutiveErrors = 0; // Reset error counter on success
      
      // Add delay between requests to avoid rate limiting (2 seconds between each)
      if (i < docs.length - 1) {
        await delay(2000);
      }
    } catch (error) {
      console.error(`Error processing file ${(doc.metadata as {source : string}).source}:`, error);
      consecutiveErrors++;
      
      // If we get too many consecutive errors (likely quota exceeded), stop processing
      if (consecutiveErrors >= maxConsecutiveErrors) {
        console.log(`Stopping processing after ${maxConsecutiveErrors} consecutive errors. Likely quota exceeded.`);
        break;
      }
      
      // Continue with next file instead of failing completely
      continue;
    }
  }
  
  console.log(`Successfully processed ${results.length} files out of ${docs.length} total files`);
  return results;
}