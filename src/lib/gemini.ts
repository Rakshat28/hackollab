import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Document } from 'langchain/document';

// Helper function to create Gemini instance with API key
const createGeminiInstance = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });
};

export const getCommitSummary = async (diff: string, apiKey: string) => {
    const model = createGeminiInstance(apiKey);
    const response = await model.generateContent([
  `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.
[...]

EXAMPLE SUMMARY COMMENTS:
\`\`\`
* Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
* Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
* Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numeric tolerance for test files
\`\`\`

Most commits will have less comments than this examples list.
The last comment does not include the file names,
because there were more than two relevant files in the hypothetical commit.
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.`,
  `Please summarise the following diff file:\n\n${diff}`,
]);

    return response.response.text();
}

export async function summariseCode(doc : Document, apiKey: string){
  const model = createGeminiInstance(apiKey);
  const code = doc.pageContent.slice(0,10000);
  
  try {
    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specialise in onboarding junior software engineers onto projects`,
      `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
          here is the code:
          ---
          ${code}
          ---
          give a summary no more than 100 words of the code above`
    ]);
    return response.response.text();
  } catch (error) {
    console.error('Error summarizing code:', error);
    // Fallback to a simple summary
    return `This file contains code for ${doc.metadata.source}`;
  }
}

export async function generateEmbedding(summary: string, apiKey: string){
  try {
    // Create a simple embedding using gemini-1.5-flash
    const embeddingModel = createGeminiInstance(apiKey);
    
    // Use generateContent to create a simple embedding representation
    const response = await embeddingModel.generateContent(
      `Convert this text to a numerical representation (just numbers separated by commas): ${summary}`
    );
    const text = response.response.text();
    
    // Parse the response and convert to numbers
    const numbers = text.split(',').map((num: string) => parseFloat(num.trim())).filter((num: number) => !isNaN(num));
    
    // Ensure we have a consistent embedding size (768 dimensions)
    const embedding: number[] = Array.from({ length: 768 }, () => 0);
    for (let i = 0; i < Math.min(numbers.length, 768); i++) {
      embedding[i] = numbers[i] ?? 0;
    }
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding with Gemini:', error);
    // Fallback to simple hash-based embedding
    return generateSimpleEmbedding(summary);
  }
}

// Simple hash-based embedding fallback
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