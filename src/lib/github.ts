import { Octokit } from "octokit";
import { db } from "~/server/db";
import axios from 'axios';
import { getCommitSummary } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAvatar: string;
  commitDate: string;
  commitSummary: string;
};

export const getCommitHashes = async (githubUrl: string, sinceDate?: string): Promise<Response[]> => {
  const [, , , owner, repo] = githubUrl.split("/");
  console.log("Polling since:", sinceDate);

  if(!owner || !repo){
    throw new Error("owner or repo missing")
  }
  let data;
  try {
    ({ data } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner,
      repo,
      since: sinceDate,
      sha: 'main',
      headers: {
        'Cache-Control': 'no-cache', 
        'If-None-Match': ''          
      }
    }));
  } catch (e) {
    // If main branch fails, try master
    try {
      ({ data } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
        since: sinceDate,
        sha: 'master',
        headers: {
          'Cache-Control': 'no-cache', 
          'If-None-Match': ''          
        }
      }));
    } catch (err) {
      throw new Error('Failed to fetch commits from both main and master branches.');
    }
  }

  const commits: Response[] = data.map((commit) => {
    return {
      commitMessage: commit.commit.message || "",
      commitHash: commit.sha,
      commitAuthorName: commit.commit.author?.name ?? "Unknown",
      commitAvatar: commit.author?.avatar_url ?? "",
      commitDate: commit.commit.author?.date ?? "",
      commitSummary: commit.commit.message?.split("\n")[0] ?? "",
    };
  });

  return commits.sort((a, b) => new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime());
};

export const pollCommits = async (projectId: string, apiKey?: string) => {
  
    const {githubUrl} = await fetchProjectGithubUrl(projectId)
    const lastCommit = await db.commit.findFirst({
      where: { projectId },
      orderBy: { commitDate: 'desc' },
    });
    const commitHashes = await getCommitHashes(githubUrl, lastCommit?.commitDate.toISOString());
    const rawUnprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);
    const unprocessedCommits = rawUnprocessedCommits
      .sort((a, b) => new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime())
      .slice(0, 10);
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map((unprocessedCommit) => summariseCommit(githubUrl, unprocessedCommit.commitHash, apiKey)));
    const summaries = summaryResponses.map((summary) => {
      if(summary.status === 'fulfilled'){
        return summary.value
      }
      return "";
    })
    const commits = await db.commit.createMany({
      data: summaries.map((summary,index)=>{
        return {
          projectId : projectId,
          commitHash : unprocessedCommits[index]!.commitHash,
          commitMessage : unprocessedCommits[index]!.commitMessage,
          commitAuthorName : unprocessedCommits[index]!.commitAuthorName,
          commitAvatar : unprocessedCommits[index]!.commitAvatar,
          commitDate : unprocessedCommits[index]!.commitDate,
          commitSummary : summary
        }
      })
    })
    return commits;
}

async function summariseCommit(githubUrl: string, commitHash: string, apiKey?: string){
  const {data} = await axios.get<string>(`${githubUrl}/commit/${commitHash}.diff`,{
    headers: {
      Accept : 'application/vnd.github.v3.diff'
    }
  })
  if (!apiKey) {
    return data.split("\n")[0] || ""; // Fallback to first line of commit message
  }
  return await getCommitSummary(data, apiKey) || "";
}

async function fetchProjectGithubUrl(projectId: string){
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            githubUrl : true
        }
    })
    if(!project?.githubUrl){
        throw new Error('Project has no GitHub url')
    }
    return { githubUrl : project.githubUrl}
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]){
    const processedCommits = await db.commit.findMany({
        where: {
            projectId: projectId
        }
    })
    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit)=> processedCommit.commitHash === commit.commitHash));
    return unprocessedCommits;
}