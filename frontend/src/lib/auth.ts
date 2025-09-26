import { User } from '@/types';

const AUTH_KEY = 'ai_teaching_assistant_auth';
const USERS_KEY = 'ai_teaching_assistant_users';

export const authService = {
  // Get current user from localStorage
  getCurrentUser(): User | null {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) return null;
    
    try {
      return JSON.parse(authData);
    } catch {
      return null;
    }
  },

  // Login user
  login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // In a real app, we'd hash and compare passwords
    // For demo purposes, we'll use a simple check
    const storedPassword = localStorage.getItem(`password_${user.id}`);
    if (storedPassword !== password) {
      return { success: false, error: 'Invalid password' };
    }
    
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  // Register new user
  register(email: string, password: string, name: string): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      created_date: new Date().toISOString(),
      last_modified_date: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(`password_${newUser.id}`, password);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    
    return { success: true, user: newUser };
  },

  // Logout user
  logout(): void {
    localStorage.removeItem(AUTH_KEY);
  },

  // Get all users (for demo purposes)
  getAllUsers(): User[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
};