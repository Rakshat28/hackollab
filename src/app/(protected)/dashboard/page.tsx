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
  const { data: project, refetch } = api.project.getProjectById.useQuery({ projectId });
  
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

  if (!project) return (
    <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col text-center">
      <h2 className="text-muted-foreground font-bold text-xl">
        Start with Hackollab
      </h2>
      <br />
      <h2 className="text-muted-foreground font-bold">
        Add key and project to start.
      </h2>
    </div>
  </div>
  
  )

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
            <div>
              <p className="text-sm font-medium text-yellow-800">
                About Re-index Project
              </p>
              <p className="text-sm text-yellow-700">
              Only re-index the project when its content changes, as the process is slow and consumes API resources quickly.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
          {/* Replace with actual components */}
          <AskQuestionCard />
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
