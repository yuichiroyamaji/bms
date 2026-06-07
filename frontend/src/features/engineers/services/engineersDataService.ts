import { Engineer, EngineerRating, Project, SkillDefinition } from '../types';
// Static imports for better performance and reliability
import engineer1Data from '../data/engineer-1.json';
import engineer2Data from '../data/engineer-2.json';
import engineer3Data from '../data/engineer-3.json';
import engineer4Data from '../data/engineer-4.json';
import engineer5Data from '../data/engineer-5.json';

/**
 * @description Load all engineers data from JSON files
 * @returns Promise that resolves to array of engineers with basic info
 */
interface EngineerBasic {
  id: string;
  name: string;
  email: string;
  profilePhoto: string;
  position: string;
  department: string;
}

export const loadEngineers = async (): Promise<Engineer[]> => {
  try {
    // In development, we'll use dynamic imports to load JSON data
    const engineersModule = await import('../data/engineers.json');
    const engineers = engineersModule.default as EngineerBasic[];
    // The basic engineers.json only has basic info, detailed info comes from individual files
    const defaultRating: EngineerRating = {
      averageRating: 0,
      totalReviews: 0,
      reviews: []
    };
    
    return engineers.map(engineer => ({
      ...engineer,
      skills: [],
      previousProjects: [],
      currentAssignments: [],
      rating: defaultRating
    }));
  } catch (error) {
    console.error('Error loading engineers:', error);
    return [];
  }
};

/**
 * @description Load all engineers with detailed information
 * @returns Promise that resolves to array of engineers with full details
 * Using static imports for immediate synchronous loading - much faster than dynamic imports
 */
export const loadAllEngineersWithDetails = async (): Promise<Engineer[]> => {
  try {
    // Use static imports - these are bundled at build time and load instantly
    // This is much faster and more reliable than dynamic imports
    // Return as Promise for consistency with the API
    return Promise.resolve([
      engineer1Data as Engineer,
      engineer2Data as Engineer,
      engineer3Data as Engineer,
      engineer4Data as Engineer,
      engineer5Data as Engineer
    ]);
  } catch (error) {
    console.error('Error loading detailed engineers:', error);
    // Fallback to basic engineers if detail loading fails
    return await loadEngineers();
  }
};

/**
 * @description Load all projects data
 * @returns Promise that resolves to array of projects
 */
export const loadProjects = async (): Promise<Project[]> => {
  try {
    const projectsModule = await import('../data/projects.json');
    const projects = projectsModule.default as Project[];
    return projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

/**
 * @description Load all skills definitions
 * @returns Promise that resolves to array of skill definitions
 */
export const loadSkills = async (): Promise<SkillDefinition[]> => {
  try {
    const skillsModule = await import('../data/skills.json');
    const skills = skillsModule.default as SkillDefinition[];
    return skills;
  } catch (error) {
    console.error('Error loading skills:', error);
    return [];
  }
};

/**
 * @description Get profile photo URL for an engineer
 * @param profilePhoto - The filename of the profile photo (e.g., "engineer-1.svg")
 * @returns Full URL path to the profile photo in /public/images/user folder
 */
export const getProfilePhotoUrl = (profilePhoto: string): string => {
  // Extract the number from profilePhoto (e.g., "engineer-1.svg" -> "1")
  const match = profilePhoto.match(/\d+/);
  if (match) {
    const number = match[0];
    // Map to user image format with zero-padding (e.g., "1" -> "user-01.jpg")
    const paddedNumber = number.padStart(2, '0');
    return `/images/user/user-${paddedNumber}.jpg`;
  }
  // If no number found, return empty string to trigger fallback
  return '';
};

/**
 * @description Validate engineer data structure
 * @param engineer - Engineer object to validate
 * @returns Boolean indicating if the engineer data is valid
 */
export const validateEngineerData = (engineer: unknown): engineer is Engineer => {
  if (!engineer || typeof engineer !== 'object') {
    return false;
  }
  
  const e = engineer as Record<string, unknown>;
  
  return (
    typeof e.id === 'string' &&
    typeof e.name === 'string' &&
    typeof e.email === 'string' &&
    typeof e.profilePhoto === 'string' &&
    typeof e.position === 'string' &&
    typeof e.department === 'string' &&
    Array.isArray(e.skills) &&
    Array.isArray(e.previousProjects) &&
    Array.isArray(e.currentAssignments)
  );
};

/**
 * @description Transform raw engineer data and ensure type safety
 * @param rawData - Raw engineer data from JSON
 * @returns Validated and transformed engineer data
 */
export const transformEngineerData = (rawData: unknown): Engineer | null => {
  if (!validateEngineerData(rawData)) {
    console.warn('Invalid engineer data:', rawData);
    return null;
  }

  return {
    ...rawData,
    skills: rawData.skills || [],
    previousProjects: rawData.previousProjects || [],
    currentAssignments: rawData.currentAssignments || [],
  };
};