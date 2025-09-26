import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, FileText, Download, Edit, ChevronDown } from 'lucide-react';
import { Project, Worksheet } from '@/types';
import { aiService } from '@/lib/aiService';
import { storageService } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

interface WorksheetGeneratorProps {
  project: Project;
  onWorksheetGenerated: () => void;
}

const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'Chinese', 'Malay', 'Tamil', 
  'Social Studies', 'Art', 'Music', 'Physical Education'
];

const LEVELS = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4', 'Secondary 5'
];

export const WorksheetGenerator = ({ project, onWorksheetGenerated }: WorksheetGeneratorProps) => {
  const [subject, setSubject] = useState(project.subject || '');
  const [level, setLevel] = useState(project.level || '');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<Worksheet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);

  const handleGenerate = async () => {
    if (!subject || !level || !topic) {
      showError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const worksheetData = await aiService.generateWorksheet(subject, level, topic);
      
      const worksheet: Worksheet = {
        id: Date.now().toString(),
        project_id: project.id,
        title: worksheetData.title || `${subject} Worksheet - ${topic}`,
        subject,
        level,
        topic,
        content: worksheetData.content || '',
        questions: worksheetData.questions || [],
        answer_key: worksheetData.answer_key || [],
        created_date: new Date().toISOString(),
        last_modified_date: new Date().toISOString(),
        export_format: 'pdf'
      };

      setGeneratedWorksheet(worksheet);
      setEditedContent(worksheet.content);
      showSuccess('Worksheet generated successfully!');
    } catch (error) {
      showError('Failed to generate worksheet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedWorksheet) return;

    const updatedWorksheet = {
      ...generatedWorksheet,
      content: editedContent,
      last_modified_date: new Date().toISOString()
    };

    storageService.saveWorksheet(updatedWorksheet);
    setGeneratedWorksheet(updatedWorksheet);
    setIsEditing(false);
    onWorksheetGenerated();
    showSuccess('Worksheet saved successfully!');
  };

  const handleExportText = (includeAnswers: boolean = false) => {
    if (!generatedWorksheet) return;

    const content = `${generatedWorksheet.title}\n\n${generatedWorksheet.content}${includeAnswers ? '\n\n=== ANSWER KEY ===\n\n' + generatedWorksheet.answer_key.join('\n\n') : ''}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedWorksheet.title.replace(/\s+/g, '_')}${includeAnswers ? '_with_answers' : ''}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Worksheet exported successfully!');
  };

  const handleExportWord = async (includeAnswers: boolean = false) => {
    if (!generatedWorksheet) return;

    try {
      // Parse the content to create structured Word document
      const lines = generatedWorksheet.content.split('\n');
      const paragraphs: Paragraph[] = [];

      // Add title
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: generatedWorksheet.title,
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
              text: `Subject: ${generatedWorksheet.subject} | Level: ${generatedWorksheet.level}`,
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

      // Add answer key if requested
      if (includeAnswers && generatedWorksheet.answer_key.length > 0) {
        paragraphs.push(new Paragraph({ text: "" })); // Empty line
        paragraphs.push(new Paragraph({ text: "" })); // Empty line
        
        // Answer key heading
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "ANSWER KEY",
                bold: true,
                size: 28,
                color: "008000", // Green color
              }),
            ],
            heading: HeadingLevel.HEADING_1,
          })
        );

        paragraphs.push(new Paragraph({ text: "" })); // Empty line

        // Add each answer
        generatedWorksheet.answer_key.forEach((answer, index) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Question ${index + 1}: `,
                  bold: true,
                }),
                new TextRun({
                  text: answer,
                }),
              ],
            })
          );
          paragraphs.push(new Paragraph({ text: "" })); // Empty line after each answer
        });
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
      a.download = `${generatedWorksheet.title.replace(/\s+/g, '_')}${includeAnswers ? '_with_answers' : ''}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Worksheet exported as Word document!');
    } catch (error) {
      showError('Failed to export Word document. Please try text export instead.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Generate Worksheet</span>
          </CardTitle>
          <CardDescription>
            Create practice worksheets with questions and answer keys for student assessment
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
                placeholder="e.g., Multiplication tables"
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
                Generating Worksheet...
              </>
            ) : (
              'Generate Worksheet'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedWorksheet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{generatedWorksheet.title}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnswers(!showAnswers)}
                >
                  {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </Button>
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
                    <DropdownMenuItem onClick={() => handleExportWord(false)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as Word (.docx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportWord(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as Word with Answers
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportText(false)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as Text (.txt)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportText(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export as Text with Answers
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
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                    {generatedWorksheet.content}
                  </pre>
                </div>
                
                {showAnswers && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-700">Answer Key</h3>
                    <div className="prose max-w-none">
                      <div className="bg-green-50 p-4 rounded-lg">
                        {generatedWorksheet.answer_key.map((answer, index) => (
                          <div key={index} className="mb-3 text-sm">
                            <strong>Question {index + 1}:</strong> {answer}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertDescription>
          <strong>Note:</strong> Generated worksheets include a variety of question types and difficulty levels. 
          The answer key is provided separately and can be toggled on/off. Export as Word document (.docx) for 
          professional formatting or as text file for simple copying.
        </AlertDescription>
      </Alert>
    </div>
  );
};