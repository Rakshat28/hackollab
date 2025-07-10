import { useLocalStorage } from "./use-LocalStorage";
import { api } from "~/trpc/react";

function useProject() {
  const [projectId,setProjectId] = useLocalStorage('project id','');

    const {data: projects =[] , isLoading} = api.project.getProjects.useQuery();
    const project = projects.find((p)=> p.id === projectId)
  return({
    projectId,
    setProjectId,
    project,
    isLoading,
    projects
  })
}

export default useProject
