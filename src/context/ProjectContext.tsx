
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type ProjectContextType = {
  projectId: string;
  setProjectId: (id: string) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [projectId, setProjectIdState] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('projectId');
    if (stored) {
      setProjectIdState(stored);
    }
  }, []);

  const setProjectId = (id: string) => {
    setProjectIdState(id);
    localStorage.setItem('projectId', id);
  };

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
