export interface Engineer {
  id: string;
  name: string;
  email: string;
  profilePhoto: string;
  position: string;
  department: string;
  skills: ProgrammingSkill[];
  previousProjects: Project[];
  currentAssignments: Assignment[];
  rating: EngineerRating;
}

export interface EngineerRating {
  averageRating: number; // 0-5 stars
  totalReviews: number;
  reviews: Review[];
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number; // 1-5 stars
  comment: string;
  commentJa?: string; // Optional Japanese translation of comment
  date: string;
  projectId?: string; // Optional reference to project
}

export interface ProgrammingSkill {
  language: string;
  experienceYears: number;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  role: string;
  status: 'Completed' | 'In Progress' | 'On Hold';
}

export interface Assignment {
  id: string;
  project: Project;
  startDate: string;
  endDate: string;
  allocation: number; // percentage of time allocated (0-100)
  status: 'Active' | 'Upcoming' | 'Completed';
}

export interface TimelineMonth {
  month: string;
  year: number;
  isCurrentMonth: boolean;
}

export interface SkillDefinition {
  language: string;
  category: 'Frontend' | 'Backend' | 'Mobile' | 'Database' | 'DevOps';
  description: string;
}

// Search related types
export interface SearchFilters {
  searchTerm: string;
  skillFilter?: string;
  projectFilter?: string;
}

export interface SearchResult {
  engineers: Engineer[];
  totalCount: number;
  matchedCriteria: {
    engineerId: string;
    matchedSkills: string[];
    matchedProjects: string[];
  }[];
}

// Timeline visualization types
export interface TimelineBar {
  projectId: string;
  projectName: string;
  startMonth: number; // 0-11 representing months from current
  endMonth: number;
  allocation: number;
  color: string;
  height: number; // calculated based on allocation
}

export interface TimelineData {
  engineerId: string;
  bars: TimelineBar[];
  months: TimelineMonth[];
}