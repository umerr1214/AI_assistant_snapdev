import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, FileText, MessageSquare, BarChart3 } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { LessonPlanGenerator } from '@/components/project/LessonPlanGenerator';
import { WorksheetGenerator } from '@/components/project/WorksheetGenerator';
import { ParentUpdateGenerator } from '@/components/project/ParentUpdateGenerator';
import { ProjectOverview } from '@/components/project/ProjectOverview';
import { Project } from '@/types';

interface ProjectWorkspaceProps {
  project: Project;
  onBack: () => void;
  onLogout: () => void;
}

export const ProjectWorkspace = ({ project, onBack, onLogout }: ProjectWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState('lesson-plans');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleContentGenerated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={onLogout} />
      
      <main className="container mx-auto px-6 py-8">
        {/* Project Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                {project.subject && (
                  <Badge variant="secondary">{project.subject}</Badge>
                )}
                {project.level && (
                  <Badge variant="outline">{project.level}</Badge>
                )}
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lesson-plans" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Lesson Plans</span>
            </TabsTrigger>
            <TabsTrigger value="worksheets" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Worksheets</span>
            </TabsTrigger>
            <TabsTrigger value="parent-updates" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Parent Updates</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lesson-plans" className="space-y-6">
            <LessonPlanGenerator 
              project={project} 
              onLessonPlanGenerated={handleContentGenerated}
            />
          </TabsContent>

          <TabsContent value="worksheets" className="space-y-6">
            <WorksheetGenerator 
              project={project} 
              onWorksheetGenerated={handleContentGenerated}
            />
          </TabsContent>

          <TabsContent value="parent-updates" className="space-y-6">
            <ParentUpdateGenerator 
              project={project} 
              onUpdatesGenerated={handleContentGenerated}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <ProjectOverview 
              project={project} 
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};