import { Project, LessonPlan, Worksheet, ParentUpdate } from '@/types';

const PROJECTS_KEY = 'ai_teaching_assistant_projects';
const LESSON_PLANS_KEY = 'ai_teaching_assistant_lesson_plans';
const WORKSHEETS_KEY = 'ai_teaching_assistant_worksheets';
const PARENT_UPDATES_KEY = 'ai_teaching_assistant_parent_updates';

export const storageService = {
  // Projects
  getProjects(userId: string): Project[] {
    const projects = localStorage.getItem(PROJECTS_KEY);
    const allProjects: Project[] = projects ? JSON.parse(projects) : [];
    return allProjects.filter(p => p.user_id === userId);
  },

  saveProject(project: Project): void {
    const projects = localStorage.getItem(PROJECTS_KEY);
    const allProjects: Project[] = projects ? JSON.parse(projects) : [];
    
    const existingIndex = allProjects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      allProjects[existingIndex] = project;
    } else {
      allProjects.push(project);
    }
    
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(allProjects));
  },

  deleteProject(projectId: string): void {
    const projects = localStorage.getItem(PROJECTS_KEY);
    const allProjects: Project[] = projects ? JSON.parse(projects) : [];
    const filtered = allProjects.filter(p => p.id !== projectId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
    
    // Also delete associated content
    this.deleteLessonPlansByProject(projectId);
    this.deleteWorksheetsByProject(projectId);
    this.deleteParentUpdatesByProject(projectId);
  },

  // Lesson Plans
  getLessonPlans(userId: string, projectId?: string): LessonPlan[] {
    const lessonPlans = localStorage.getItem(LESSON_PLANS_KEY);
    const allLessonPlans: LessonPlan[] = lessonPlans ? JSON.parse(lessonPlans) : [];
    
    // Filter by user's projects
    const userProjects = this.getProjects(userId);
    const userProjectIds = userProjects.map(p => p.id);
    
    let filtered = allLessonPlans.filter(lp => userProjectIds.includes(lp.project_id));
    
    if (projectId) {
      filtered = filtered.filter(lp => lp.project_id === projectId);
    }
    
    return filtered;
  },

  saveLessonPlan(lessonPlan: LessonPlan): void {
    const lessonPlans = localStorage.getItem(LESSON_PLANS_KEY);
    const allLessonPlans: LessonPlan[] = lessonPlans ? JSON.parse(lessonPlans) : [];
    
    const existingIndex = allLessonPlans.findIndex(lp => lp.id === lessonPlan.id);
    if (existingIndex >= 0) {
      allLessonPlans[existingIndex] = lessonPlan;
    } else {
      allLessonPlans.push(lessonPlan);
    }
    
    localStorage.setItem(LESSON_PLANS_KEY, JSON.stringify(allLessonPlans));
  },

  deleteLessonPlan(lessonPlanId: string): void {
    const lessonPlans = localStorage.getItem(LESSON_PLANS_KEY);
    const allLessonPlans: LessonPlan[] = lessonPlans ? JSON.parse(lessonPlans) : [];
    const filtered = allLessonPlans.filter(lp => lp.id !== lessonPlanId);
    localStorage.setItem(LESSON_PLANS_KEY, JSON.stringify(filtered));
  },

  deleteLessonPlansByProject(projectId: string): void {
    const lessonPlans = localStorage.getItem(LESSON_PLANS_KEY);
    const allLessonPlans: LessonPlan[] = lessonPlans ? JSON.parse(lessonPlans) : [];
    const filtered = allLessonPlans.filter(lp => lp.project_id !== projectId);
    localStorage.setItem(LESSON_PLANS_KEY, JSON.stringify(filtered));
  },

  // Worksheets
  getWorksheets(userId: string, projectId?: string): Worksheet[] {
    const worksheets = localStorage.getItem(WORKSHEETS_KEY);
    const allWorksheets: Worksheet[] = worksheets ? JSON.parse(worksheets) : [];
    
    const userProjects = this.getProjects(userId);
    const userProjectIds = userProjects.map(p => p.id);
    
    let filtered = allWorksheets.filter(w => userProjectIds.includes(w.project_id));
    
    if (projectId) {
      filtered = filtered.filter(w => w.project_id === projectId);
    }
    
    return filtered;
  },

  saveWorksheet(worksheet: Worksheet): void {
    const worksheets = localStorage.getItem(WORKSHEETS_KEY);
    const allWorksheets: Worksheet[] = worksheets ? JSON.parse(worksheets) : [];
    
    const existingIndex = allWorksheets.findIndex(w => w.id === worksheet.id);
    if (existingIndex >= 0) {
      allWorksheets[existingIndex] = worksheet;
    } else {
      allWorksheets.push(worksheet);
    }
    
    localStorage.setItem(WORKSHEETS_KEY, JSON.stringify(allWorksheets));
  },

  deleteWorksheet(worksheetId: string): void {
    const worksheets = localStorage.getItem(WORKSHEETS_KEY);
    const allWorksheets: Worksheet[] = worksheets ? JSON.parse(worksheets) : [];
    const filtered = allWorksheets.filter(w => w.id !== worksheetId);
    localStorage.setItem(WORKSHEETS_KEY, JSON.stringify(filtered));
  },

  deleteWorksheetsByProject(projectId: string): void {
    const worksheets = localStorage.getItem(WORKSHEETS_KEY);
    const allWorksheets: Worksheet[] = worksheets ? JSON.parse(worksheets) : [];
    const filtered = allWorksheets.filter(w => w.project_id !== projectId);
    localStorage.setItem(WORKSHEETS_KEY, JSON.stringify(filtered));
  },

  // Parent Updates
  getParentUpdates(userId: string, projectId?: string): ParentUpdate[] {
    const parentUpdates = localStorage.getItem(PARENT_UPDATES_KEY);
    const allParentUpdates: ParentUpdate[] = parentUpdates ? JSON.parse(parentUpdates) : [];
    
    const userProjects = this.getProjects(userId);
    const userProjectIds = userProjects.map(p => p.id);
    
    let filtered = allParentUpdates.filter(pu => userProjectIds.includes(pu.project_id));
    
    if (projectId) {
      filtered = filtered.filter(pu => pu.project_id === projectId);
    }
    
    return filtered;
  },

  saveParentUpdate(parentUpdate: ParentUpdate): void {
    const parentUpdates = localStorage.getItem(PARENT_UPDATES_KEY);
    const allParentUpdates: ParentUpdate[] = parentUpdates ? JSON.parse(parentUpdates) : [];
    
    const existingIndex = allParentUpdates.findIndex(pu => pu.id === parentUpdate.id);
    if (existingIndex >= 0) {
      allParentUpdates[existingIndex] = parentUpdate;
    } else {
      allParentUpdates.push(parentUpdate);
    }
    
    localStorage.setItem(PARENT_UPDATES_KEY, JSON.stringify(allParentUpdates));
  },

  deleteParentUpdate(parentUpdateId: string): void {
    const parentUpdates = localStorage.getItem(PARENT_UPDATES_KEY);
    const allParentUpdates: ParentUpdate[] = parentUpdates ? JSON.parse(parentUpdates) : [];
    const filtered = allParentUpdates.filter(pu => pu.id !== parentUpdateId);
    localStorage.setItem(PARENT_UPDATES_KEY, JSON.stringify(filtered));
  },

  deleteParentUpdatesByProject(projectId: string): void {
    const parentUpdates = localStorage.getItem(PARENT_UPDATES_KEY);
    const allParentUpdates: ParentUpdate[] = parentUpdates ? JSON.parse(parentUpdates) : [];
    const filtered = allParentUpdates.filter(pu => pu.project_id !== projectId);
    localStorage.setItem(PARENT_UPDATES_KEY, JSON.stringify(filtered));
  }
};