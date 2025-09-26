export interface User {
  id: string;
  email: string;
  name: string;
  created_date: string;
  last_modified_date: string;
  preferences?: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  level?: string;
  user_id: string;
  created_date: string;
  last_modified_date: string;
  status: 'active' | 'archived';
}

export interface LessonPlan {
  id: string;
  project_id: string;
  title: string;
  subject: string;
  level: string;
  topic: string;
  content: string;
  objectives: string[];
  practice_questions: string[];
  suggested_answers: string[];
  created_date: string;
  last_modified_date: string;
  export_format: 'pdf' | 'word';
}

export interface Worksheet {
  id: string;
  project_id: string;
  title: string;
  subject: string;
  level: string;
  topic: string;
  content: string;
  questions: string[];
  answer_key: string[];
  created_date: string;
  last_modified_date: string;
  export_format: 'pdf' | 'word';
}

export interface ParentUpdate {
  id: string;
  project_id: string;
  student_name: string;
  subject: string;
  progress_summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  next_steps: string;
  draft_text: string;
  created_date: string;
  last_modified_date: string;
}

export interface StudentData {
  name: string;
  subject: string;
  score: number | string;
  grade?: string;
  strengths_observed?: string;
  areas_for_improvement?: string;
  additional_comments?: string;
  assessment_type?: string;
}