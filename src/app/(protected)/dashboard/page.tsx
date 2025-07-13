'use client'
import { Github, ExternalLink } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useProjectContext } from '~/context/ProjectContext';
import { api } from '~/trpc/react';
import CommitLog from './commit-log';
import { Loader2 } from 'lucide-react';

function Page() {
  const { projectId } = useProjectContext();
  const [isPolling, setIsPolling] = useState(false);
  const { data: project, isLoading, refetch } = api.project.getProjectById.useQuery({ projectId });

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

        <div className="flex items-center gap-4">{/* You can add buttons here */}</div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
          {/* Replace with actual components */}
          Ask Question card
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
        <CommitLog project={project} /> {/* ✅ Pass project here */}
      </div>
    </div>
  );
}

export default Page;
