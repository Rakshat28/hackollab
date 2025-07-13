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

export const indexGithubRepo = async (githubUrl: string, githubToken?: string, projectId?: string) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);

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


const generateEmbeddings = async(docs: Document[]) => {
  return await Promise.all(docs.map(async (doc) => {
    const summary = await summariseCode(doc); 
    const embedding = await generateEmbedding(summary);
     return {
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)) as string,
      fileName: (doc.metadata as {source : string}).source 
     }
  }))
}