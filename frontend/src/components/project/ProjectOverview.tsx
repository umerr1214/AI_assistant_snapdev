import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BookOpen, FileText, MessageSquare, Search, Edit, Trash2, Download, Calendar, User } from 'lucide-react';
import { Project, LessonPlan, Worksheet, ParentUpdate } from '@/types';
import { authService } from '@/lib/auth';
import { storageService } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';

interface ProjectOverviewProps {
  project: Project;
  refreshTrigger: number;
}

export const ProjectOverview = ({ project, refreshTrigger }: ProjectOverviewProps) => {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [parentUpdates, setParentUpdates] = useState<ParentUpdate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; title: string } | null>(null);

  useEffect(() => {
    loadProjectContent();
  }, [project.id, refreshTrigger]);

  const loadProjectContent = () => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const projectLessonPlans = storageService.getLessonPlans(user.id, project.id);
    const projectWorksheets = storageService.getWorksheets(user.id, project.id);
    const projectParentUpdates = storageService.getParentUpdates(user.id, project.id);

    setLessonPlans(projectLessonPlans);
    setWorksheets(projectWorksheets);
    setParentUpdates(projectParentUpdates);
  };

  const handleDelete = (type: string, id: string, title: string) => {
    setItemToDelete({ type, id, title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    try {
      switch (itemToDelete.type) {
        case 'lesson-plan':
          storageService.deleteLessonPlan(itemToDelete.id);
          break;
        case 'worksheet':
          storageService.deleteWorksheet(itemToDelete.id);
          break;
        case 'parent-update':
          storageService.deleteParentUpdate(itemToDelete.id);
          break;
      }
      
      loadProjectContent();
      showSuccess(`${itemToDelete.type.replace('-', ' ')} deleted successfully`);
    } catch (error) {
      showError('Failed to delete item');
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleExport = (content: string, title: string, type: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess(`${type} exported successfully!`);
  };

  const filteredLessonPlans = lessonPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorksheets = worksheets.filter(worksheet =>
    worksheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worksheet.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParentUpdates = parentUpdates.filter(update =>
    update.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    update.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalContent = lessonPlans.length + worksheets.length + parentUpdates.length;

  return (
    <div className="space-y-6">
      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContent}</div>
            <p className="text-xs text-muted-foreground">
              Generated items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesson Plans</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonPlans.length}</div>
            <p className="text-xs text-muted-foreground">
              MOE-style plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worksheets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{worksheets.length}</div>
            <p className="text-xs text-muted-foreground">
              Practice sheets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parent Updates</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parentUpdates.length}</div>
            <p className="text-xs text-muted-foreground">
              Communication drafts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content Lists */}
      {filteredLessonPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Lesson Plans ({filteredLessonPlans.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLessonPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{plan.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(plan.created_date), 'MMM dd, yyyy')}</span>
                      </span>
                      <Badge variant="outline">{plan.level}</Badge>
                      <Badge variant="secondary">{plan.subject}</Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(plan.content, plan.title, 'Lesson Plan')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete('lesson-plan', plan.id, plan.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredWorksheets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Worksheets ({filteredWorksheets.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredWorksheets.map((worksheet) => (
                <div key={worksheet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{worksheet.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(worksheet.created_date), 'MMM dd, yyyy')}</span>
                      </span>
                      <Badge variant="outline">{worksheet.level}</Badge>
                      <Badge variant="secondary">{worksheet.subject}</Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(worksheet.content, worksheet.title, 'Worksheet')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete('worksheet', worksheet.id, worksheet.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredParentUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Parent Updates ({filteredParentUpdates.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredParentUpdates.map((update) => (
                <div key={update.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{update.student_name}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(update.created_date), 'MMM dd, yyyy')}</span>
                      </span>
                      <Badge variant="secondary">{update.subject}</Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(update.draft_text, `${update.student_name}_Update`, 'Parent Update')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete('parent-update', update.id, update.student_name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {totalContent === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content generated yet</h3>
            <p className="text-gray-600">
              Start by generating lesson plans, worksheets, or parent updates for this project.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};