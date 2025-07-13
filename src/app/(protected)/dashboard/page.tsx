'use client'
import { Github, ExternalLink, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useProjectContext } from '~/context/ProjectContext';
import { api } from '~/trpc/react';
import CommitLog from './commit-log';
import { Loader2 } from 'lucide-react';
import { ProjectRefetchContext } from './commit-log';
import AskQuestionCard from './ask-question-card';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';

function Page() {
  const { projectId } = useProjectContext();
  const [isPolling, setIsPolling] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const { data: project, isLoading, refetch } = api.project.getProjectById.useQuery({ projectId });
  
  const reindexProject = api.project.reindexProject.useMutation({
    onSuccess: () => {
      toast.success('Project re-indexed successfully!');
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to re-index project');
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (project && project.commits.length === 0) {
      setIsPolling(true);
      interval = setInterval(() => {
        void refetch();
      }, 2000);
    } else {
      setIsPolling(false);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [project?.commits.length, refetch]);

  if (!project) return <div>Loading or no project selected</div>;

  // Check if project has any embeddings
  const hasEmbeddings = project.SourceCodeEmbedding && project.SourceCodeEmbedding.length > 0;

  return (
    <div>
      <div className="flex flex-row items-center justify-between flex-wrap gap-y-4">
        <a
          href={project.githubUrl}
          target="_blank"
          title={project.name}
          className="hover:underline"
        >
          <div className="flex flex-row gap-1 bg-primary rounded-xl p-1 items-center w-fit text-white hover:bg-primary/90 hover:shadow-md">
            <div className="bg-[#3331a5] p-2 rounded-xl text-white">
              <Github size={20} />
            </div>
            <p className="text-sm">{project.githubUrl}</p>
            <ExternalLink size={20} />
          </div>
        </a>

        <div className="gap-y-4"></div>

        <div className="flex items-center gap-4">
          <Button
            onClick={async () => {
              setIsReindexing(true);
              try {
                await reindexProject.mutateAsync({ projectId });
              } finally {
                setIsReindexing(false);
              }
            }}
            disabled={isReindexing}
            variant="outline"
            size="sm"
          >
            {isReindexing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Re-indexing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-index Project
              </>
            )}
          </Button>
        </div>
      </div>

      {!hasEmbeddings && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-yellow-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                No code embeddings found
              </p>
              <p className="text-sm text-yellow-700">
                This project hasn&apos;t been indexed yet. Click &quot;Re-index Project&quot; to enable AI code analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
          {/* Replace with actual components */}
          <AskQuestionCard />
          meetingcard
        </div>
      </div>

      <div className="mt-8">
        {isPolling && (
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <Loader2 className="animate-spin" />
            Fetching commits from GitHub...
          </div>
        )}
        <ProjectRefetchContext.Provider value={refetch}>
          <CommitLog project={project} />
        </ProjectRefetchContext.Provider>
      </div>
    </div>
  );
}

export default Page;
