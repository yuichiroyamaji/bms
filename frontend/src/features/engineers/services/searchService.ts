import { Engineer, SearchFilters, SearchResult } from '../types';

/**
 * @description Filter engineers based on search criteria
 * @param engineers - Array of engineers to search through
 * @param searchTerm - Search term to match against skills and projects
 * @returns Filtered array of engineers with match information
 */
export const searchEngineers = (engineers: Engineer[], searchTerm: string): SearchResult => {
  if (!searchTerm.trim()) {
    return {
      engineers,
      totalCount: engineers.length,
      matchedCriteria: []
    };
  }

  const searchLower = searchTerm.toLowerCase().trim();
  const filteredEngineers: Engineer[] = [];
  const matchedCriteria: SearchResult['matchedCriteria'] = [];

  engineers.forEach(engineer => {
    const matchedSkills: string[] = [];
    const matchedProjects: string[] = [];

    // Search in programming languages/skills
    engineer.skills.forEach(skill => {
      if (skill.language.toLowerCase().includes(searchLower)) {
        matchedSkills.push(skill.language);
      }
    });

    // Search in previous projects
    engineer.previousProjects.forEach(project => {
      if (project.name.toLowerCase().includes(searchLower)) {
        matchedProjects.push(project.name);
      }
    });

    // Search in current assignments
    engineer.currentAssignments.forEach(assignment => {
      if (assignment.project.name.toLowerCase().includes(searchLower)) {
        matchedProjects.push(assignment.project.name);
      }
    });

    // If any matches found, include this engineer
    if (matchedSkills.length > 0 || matchedProjects.length > 0) {
      filteredEngineers.push(engineer);
      matchedCriteria.push({
        engineerId: engineer.id,
        matchedSkills: [...new Set(matchedSkills)], // Remove duplicates
        matchedProjects: [...new Set(matchedProjects)] // Remove duplicates
      });
    }
  });

  return {
    engineers: filteredEngineers,
    totalCount: filteredEngineers.length,
    matchedCriteria
  };
};

/**
 * @description Get highlighted text with search term emphasized
 * @param text - Original text
 * @param searchTerm - Term to highlight
 * @returns Text with highlighted portions
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
};

/**
 * @description Filter engineers by specific skill
 * @param engineers - Array of engineers to filter
 * @param skillName - Name of the skill to filter by
 * @returns Engineers who have the specified skill
 */
export const filterBySkill = (engineers: Engineer[], skillName: string): Engineer[] => {
  const skillLower = skillName.toLowerCase();
  return engineers.filter(engineer =>
    engineer.skills.some(skill =>
      skill.language.toLowerCase().includes(skillLower)
    )
  );
};

/**
 * @description Filter engineers by project experience
 * @param engineers - Array of engineers to filter
 * @param projectName - Name of the project to filter by
 * @returns Engineers who have worked on projects matching the name
 */
export const filterByProject = (engineers: Engineer[], projectName: string): Engineer[] => {
  const projectLower = projectName.toLowerCase();
  return engineers.filter(engineer => {
    const previousProjectMatch = engineer.previousProjects.some(project =>
      project.name.toLowerCase().includes(projectLower)
    );
    
    const currentProjectMatch = engineer.currentAssignments.some(assignment =>
      assignment.project.name.toLowerCase().includes(projectLower)
    );

    return previousProjectMatch || currentProjectMatch;
  });
};

/**
 * @description Get search suggestions based on available skills and projects
 * @param engineers - Array of engineers to analyze
 * @returns Object with skill and project suggestions
 */
export const getSearchSuggestions = (engineers: Engineer[]) => {
  const skills = new Set<string>();
  const projects = new Set<string>();

  engineers.forEach(engineer => {
    // Collect all skills
    engineer.skills.forEach(skill => {
      skills.add(skill.language);
    });

    // Collect all project names
    engineer.previousProjects.forEach(project => {
      projects.add(project.name);
    });

    engineer.currentAssignments.forEach(assignment => {
      projects.add(assignment.project.name);
    });
  });

  return {
    skills: Array.from(skills).sort(),
    projects: Array.from(projects).sort()
  };
};

/**
 * @description Advanced search with multiple filters
 * @param engineers - Array of engineers to search
 * @param filters - Search filters object
 * @returns Filtered search results
 */
export const advancedSearch = (engineers: Engineer[], filters: SearchFilters): SearchResult => {
  let filteredEngineers = engineers;

  // Apply skill filter
  if (filters.skillFilter) {
    filteredEngineers = filterBySkill(filteredEngineers, filters.skillFilter);
  }

  // Apply project filter
  if (filters.projectFilter) {
    filteredEngineers = filterByProject(filteredEngineers, filters.projectFilter);
  }

  // Apply general search term
  if (filters.searchTerm) {
    const searchResult = searchEngineers(filteredEngineers, filters.searchTerm);
    return searchResult;
  }

  return {
    engineers: filteredEngineers,
    totalCount: filteredEngineers.length,
    matchedCriteria: []
  };
};