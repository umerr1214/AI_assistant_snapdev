import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, BookOpen, Download, Edit, ChevronDown } from 'lucide-react';
import { Project, LessonPlan } from '@/types';
import { aiService } from '@/lib/aiService';
import { storageService } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

interface LessonPlanGeneratorProps {
  project: Project;
  onLessonPlanGenerated: () => void;
}

const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'Chinese', 'Malay', 'Tamil', 
  'Social Studies', 'Art', 'Music', 'Physical Education'
];

const LEVELS = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4', 'Secondary 5'
];

export const LessonPlanGenerator = ({ project, onLessonPlanGenerated }: LessonPlanGeneratorProps) => {
  const [subject, setSubject] = useState(project.subject || '');
  const [level, setLevel] = useState(project.level || '');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const handleGenerate = async () => {
    if (!subject || !level || !topic) {
      showError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const planData = await aiService.generateLessonPlan(subject, level, topic);
      
      const lessonPlan: LessonPlan = {
        id: Date.now().toString(),
        project_id: project.id,
        title: planData.title || `${subject} - ${topic}`,
        subject,
        level,
        topic,
        content: planData.content || '',
        objectives: planData.objectives || [],
        practice_questions: planData.practice_questions || [],
        suggested_answers: planData.suggested_answers || [],
        created_date: new Date().toISOString(),
        last_modified_date: new Date().toISOString(),
        export_format: 'pdf'
      };

      setGeneratedPlan(lessonPlan);
      setEditedContent(lessonPlan.content);
      showSuccess('Lesson plan generated successfully!');
    } catch (error) {
      showError('Failed to generate lesson plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedPlan) return;

    const updatedPlan = {
      ...generatedPlan,
      content: editedContent,
      last_modified_date: new Date().toISOString()
    };

    storageService.saveLessonPlan(updatedPlan);
    setGeneratedPlan(updatedPlan);
    setIsEditing(false);
    onLessonPlanGenerated();
    showSuccess('Lesson plan saved successfully!');
  };

  const handleExportText = () => {
    if (!generatedPlan) return;

    const content = `${generatedPlan.title}\n\n${generatedPlan.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPlan.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Lesson plan exported as text file!');
  };

  const handleExportWord = async () => {
    if (!generatedPlan) return;

    try {
      // Parse the content to create structured Word document
      const lines = generatedPlan.content.split('\n');
      const paragraphs: Paragraph[] = [];

      // Add title
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: generatedPlan.title,
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
        })
      );

      // Add subject and level info
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Subject: ${generatedPlan.subject} | Level: ${generatedPlan.level}`,
              italics: true,
              size: 24,
            }),
          ],
        })
      );

      paragraphs.push(new Paragraph({ text: "" })); // Empty line

      // Process content lines
      for (const line of lines) {
        if (line.trim() === '') {
          paragraphs.push(new Paragraph({ text: "" }));
        } else if (line.startsWith('# ')) {
          // Main heading
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.substring(2),
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            })
          );
        } else if (line.startsWith('## ')) {
          // Sub heading
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.substring(3),
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
            })
          );
        } else if (line.startsWith('### ')) {
          // Sub-sub heading
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.substring(4),
                  bold: true,
                  size: 22,
                }),
              ],
              heading: HeadingLevel.HEADING_3,
            })
          );
        } else if (line.startsWith('**') && line.endsWith('**')) {
          // Bold text
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.substring(2, line.length - 2),
                  bold: true,
                }),
              ],
            })
          );
        } else {
          // Regular paragraph
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                }),
              ],
            })
          );
        }
      }

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      // Generate and download the Word document
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedPlan.title.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Lesson plan exported as Word document!');
    } catch (error) {
      showError('Failed to export Word document. Please try text export instead.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Generate Lesson Plan</span>
          </CardTitle>
          <CardDescription>
            Create MOE-style lesson plans with learning objectives and practice questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Adding fractions with different denominators"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !subject || !level || !topic}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Lesson Plan...
              </>
            ) : (
              'Generate Lesson Plan'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{generatedPlan.title}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportWord}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as Word (.docx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportText}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as Text (.txt)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <div className="flex space-x-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                  {generatedPlan.content}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertDescription>
          <strong>Note:</strong> Generated lesson plans follow MOE syllabus guidelines and include learning objectives, 
          structured content, and practice questions. You can export as Word document (.docx) for easy editing or 
          as text file for simple copying. Always review and customize the content to match your specific 
          teaching style and student needs.
        </AlertDescription>
      </Alert>
    </div>
  );
};