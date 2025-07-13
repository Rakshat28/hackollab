"use client";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Commit, Project } from "@prisma/client";
import { ExternalLink, GitGraph } from "lucide-react";
import Link from "next/link";
import { useContext } from 'react';
import React from 'react';

export const ProjectRefetchContext = React.createContext<null | (() => void)>(null);

export default function CommitLog({
  project,
}: {
  project: Project & { commits: Commit[] };
}) {
  const router = useRouter();
  const refetchProject = React.useContext(ProjectRefetchContext);

  const pollCommits = api.project.pollCommits.useMutation();

  // Sort commits by date descending (newest first)
  const sortedCommits = [...project.commits].sort(
    (a, b) =>
      new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime()
  );

  return (
    <>
      <div className="flex flex-row gap-2">
      <Button
        className="self-center"
        onClick={async () => {
          toast.promise(
            pollCommits.mutateAsync({ projectId: project.id }),
            {
              loading: "Polling commits...",
              success: async () => {
                if (refetchProject) {
                  await refetchProject();
                }
                return "Successfully polled commits!";
              },
              error: "Failed to poll commits",
            }
            
          );
        }}
      >
        <GitGraph className="mr-1 h-5 w-5" />
        Refresh
      </Button>

      </div>

      <div className="h-4" />

      <ul role="list" className="space-y-6">
        {sortedCommits.map((commit, commitIdx) => (
          <li key={commit.id} className="relative flex gap-x-4">
            <div
              className={cn(
                commitIdx === sortedCommits.length - 1 ? "h-6" : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center"
              )}
            >
              <div className="w-px translate-x-1 bg-gray-200 dark:bg-primary/30" />
            </div>

            <>
              <img
                src={commit.commitAvatar}
                alt=""
                className="relative mt-3 h-8 w-8 flex-none rounded-full bg-gray-50 dark:bg-primary"
              />

              <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200 dark:bg-[#111116] dark:ring-black">
                <div className="flex justify-between gap-x-4">
                  <Link
                    target="_blank"
                    className="py-0.5 text-xs leading-5 text-gray-500"
                    href={`${project.githubUrl}/commit/${commit.commitHash}`}
                  >
                    <span className="font-medium text-primary/70">
                      {commit.commitAuthorName}
                    </span>{" "}
                    <span className="inline-flex items-center">
                      committed
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </span>
                  </Link>

                  <time
                    dateTime={commit.commitDate.toString()}
                    className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                  >
                    {new Date(commit.commitDate).toLocaleString()}
                  </time>
                </div>

                <span className="font-semibold">{commit.commitMessage}</span>

                <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                  {commit.commitSummary}
                </pre>
              </div>
            </>
          </li>
        ))}
      </ul>
    </>
  );
}
