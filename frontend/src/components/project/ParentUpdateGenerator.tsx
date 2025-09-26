import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MessageSquare, Upload, Download, Edit, Copy, FileText, FileUp } from 'lucide-react';
import { Project, ParentUpdate, StudentData } from '@/types';
import { aiService } from '@/lib/aiService';
import { storageService } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';

interface ParentUpdateGeneratorProps {
  project: Project;
  onUpdatesGenerated: () => void;
}

export const ParentUpdateGenerator = ({ project, onUpdatesGenerated }: ParentUpdateGeneratorProps) => {
  const [csvData, setCsvData] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUpdates, setGeneratedUpdates] = useState<ParentUpdate[]>([]);
  const [editingUpdate, setEditingUpdate] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [inputMethod, setInputMethod] = useState<'upload' | 'paste'>('upload');

  const sampleCsvData = [
    ['Student Name', 'Subject', 'Score', 'Grade', 'Strengths Observed', 'Areas for Improvement', 'Additional Comments', 'Assessment Type'],
    ['John Doe', 'Mathematics', '85', 'A', 'Good problem-solving skills', 'Needs to show more working', 'Excellent participation in class', 'Quiz'],
    ['Jane Smith', 'Mathematics', '72', 'B', 'Strong in basic concepts', 'Struggles with word problems', 'Improving steadily', 'Test'],
    ['Alex Chen', 'Mathematics', '91', 'A', 'Exceptional analytical thinking', 'Could help peers more', 'Natural leader in group work', 'Assignment'],
    ['Sarah Wilson', 'Mathematics', '68', 'C', 'Shows improvement in calculations', 'Needs more practice with fractions', 'Asks good questions', 'Quiz']
  ];

  const sampleCsvFormat = sampleCsvData.map(row => row.join(',')).join('\n');

  const downloadSampleCsv = () => {
    const csvContent = sampleCsvFormat;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Parent_Updates_Template_${project.name.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Sample CSV template downloaded successfully!');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showError('Please upload a CSV file');
      return;
    }

    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      showSuccess(`CSV file "${file.name}" loaded successfully!`);
    };
    
    reader.onerror = () => {
      showError('Failed to read the CSV file');
    };
    
    reader.readAsText(file);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setCsvData('');
    // Reset file input
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const parseCsvData = (csvText: string): StudentData[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const students: StudentData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 3) continue;

      const student: StudentData = {
        name: values[headers.indexOf('student name')] || values[0],
        subject: values[headers.indexOf('subject')] || values[1],
        score: values[headers.indexOf('score')] || values[2],
        grade: values[headers.indexOf('grade')] || '',
        strengths_observed: values[headers.indexOf('strengths observed')] || '',
        areas_for_improvement: values[headers.indexOf('areas for improvement')] || '',
        additional_comments: values[headers.indexOf('additional comments')] || '',
        assessment_type: values[headers.indexOf('assessment type')] || 'assessment'
      };

      students.push(student);
    }

    return students;
  };

  const handleGenerate = async () => {
    if (!csvData.trim()) {
      showError('Please upload a CSV file or paste CSV data');
      return;
    }

    const studentData = parseCsvData(csvData);
    if (studentData.length === 0) {
      showError('No valid student data found. Please check your CSV format.');
      return;
    }

    setIsGenerating(true);
    try {
      const updates = await aiService.generateParentUpdates(studentData, project.name);
      
      // Set project_id for each update
      const updatesWithProjectId = updates.map(update => ({
        ...update,
        project_id: project.id
      }));

      setGeneratedUpdates(updatesWithProjectId);
      showSuccess(`Generated ${updates.length} parent updates successfully!`);
    } catch (error) {
      showError('Failed to generate parent updates. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveUpdate = (updateId: string) => {
    const update = generatedUpdates.find(u => u.id === updateId);
    if (!update) return;

    const updatedUpdate = {
      ...update,
      draft_text: editedText,
      last_modified_date: new Date().toISOString()
    };

    storageService.saveParentUpdate(updatedUpdate);
    
    setGeneratedUpdates(prev => 
      prev.map(u => u.id === updateId ? updatedUpdate : u)
    );
    
    setEditingUpdate(null);
    onUpdatesGenerated();
    showSuccess('Parent update saved successfully!');
  };

  const handleSaveAll = () => {
    generatedUpdates.forEach(update => {
      storageService.saveParentUpdate(update);
    });
    
    onUpdatesGenerated();
    showSuccess(`Saved all ${generatedUpdates.length} parent updates!`);
  };

  const handleCopyToClipboard = (text: string, studentName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess(`Copied ${studentName}'s update to clipboard`);
    }).catch(() => {
      showError('Failed to copy to clipboard');
    });
  };

  const handleExportAll = () => {
    const allUpdates = generatedUpdates.map(update => 
      `=== ${update.student_name} - ${update.subject} ===\n\n${update.draft_text}\n\n`
    ).join('\n');

    const blob = new Blob([allUpdates], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Parent_Updates_${project.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('All parent updates exported successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Generate Parent Updates</span>
              </CardTitle>
              <CardDescription>
                Upload student performance data to generate personalized parent communication drafts
              </CardDescription>
            </div>
            <Button variant="outline" onClick={downloadSampleCsv} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as 'upload' | 'paste')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <FileUp className="h-4 w-4" />
                <span>Upload CSV File</span>
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Paste CSV Data</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file-input">Upload CSV File *</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      id="csv-file-input"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  {uploadedFile && (
                    <Button variant="outline" size="sm" onClick={clearUploadedFile}>
                      Clear
                    </Button>
                  )}
                </div>
                {uploadedFile && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    <span>File loaded: {uploadedFile.name}</span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csvData">Student Data (CSV Format) *</Label>
                <Textarea
                  id="csvData"
                  placeholder="Paste your CSV data here..."
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <strong>Required CSV Format:</strong>
                  <Button variant="ghost" size="sm" onClick={downloadSampleCsv} className="h-auto p-1 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Download Template
                  </Button>
                </div>
                <div className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  <div className="font-mono whitespace-pre">
                    {sampleCsvData[0].join(', ')}{'\n'}
                    {sampleCsvData[1].join(', ')}{'\n'}
                    {sampleCsvData[2].join(', ')}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  The template includes sample data to help you format your CSV correctly.
                </p>
              </div>
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !csvData.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Parent Updates...
              </>
            ) : (
              'Generate Parent Updates'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedUpdates.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Updates ({generatedUpdates.length})</h3>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button onClick={handleSaveAll}>
                Save All Updates
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {generatedUpdates.map((update) => (
              <Card key={update.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{update.student_name}</CardTitle>
                      <Badge variant="secondary">{update.subject}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToClipboard(update.draft_text, update.student_name)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (editingUpdate === update.id) {
                            setEditingUpdate(null);
                          } else {
                            setEditingUpdate(update.id);
                            setEditedText(update.draft_text);
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {editingUpdate === update.id ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingUpdate === update.id ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={12}
                        className="text-sm"
                      />
                      <div className="flex space-x-2">
                        <Button onClick={() => handleSaveUpdate(update.id)}>
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingUpdate(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                        {update.draft_text}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Alert>
        <AlertDescription>
          <strong>Note:</strong> Generated parent updates are drafts that should be reviewed and personalized 
          before sending. The AI creates encouraging, professional messages highlighting student progress and 
          providing constructive feedback for improvement.
        </AlertDescription>
      </Alert>
    </div>
  );
};