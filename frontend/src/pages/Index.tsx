import { useState, useEffect } from 'react';
import { Auth } from './Auth';
import { Dashboard } from './Dashboard';
import { ProjectWorkspace } from './ProjectWorkspace';
import { authService } from '@/lib/auth';
import { Project } from '@/types';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const user = authService.getCurrentUser();
    setIsAuthenticated(!!user);
    setIsLoading(false);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentProject(null);
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
  };

  const handleBackToDashboard = () => {
    setCurrentProject(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthenticated={handleAuthenticated} />;
  }

  if (currentProject) {
    return (
      <ProjectWorkspace 
        project={currentProject} 
        onBack={handleBackToDashboard}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Dashboard 
      onLogout={handleLogout} 
      onOpenProject={handleOpenProject}
    />
  );
};

export default Index;