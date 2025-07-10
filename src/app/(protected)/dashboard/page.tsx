'use client'
import React from 'react'
import { useProjectContext } from '~/context/ProjectContext';
import { api } from '~/trpc/react';

function Page() {
  const {projectId} = useProjectContext();

    const {data: projects =[] , isLoading} = api.project.getProjects.useQuery();
    const project = projects.find((p)=> p.id === projectId)

  
  return (
    <div>
      {project?.name}
    </div>
  )
}

export default Page
