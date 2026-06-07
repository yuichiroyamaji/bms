"use client";

import React, { useState, useCallback, useImperativeHandle, forwardRef } from "react";

interface SearchBarProps {
  onSearch: (filters: { skill?: string; project?: string }) => void;
  availableSkills: string[];
  availableProjects: string[];
}

export interface SearchBarRef {
  clear: () => void;
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(({ 
  onSearch,
  availableSkills,
  availableProjects
}, ref) => {
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const handleSkillChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSkill(value);
    onSearch({ skill: value || undefined, project: selectedProject || undefined });
  }, [onSearch, selectedProject]);

  const handleProjectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProject(value);
    onSearch({ skill: selectedSkill || undefined, project: value || undefined });
  }, [onSearch, selectedSkill]);

  const handleClear = useCallback(() => {
    setSelectedSkill("");
    setSelectedProject("");
    onSearch({});
  }, [onSearch]);

  // Expose clear method to parent component
  useImperativeHandle(ref, () => ({
    clear: handleClear
  }), [handleClear]);

  return (
    <div className="space-y-4">
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-4">
        {/* Programming Language Filter */}
        <div className="w-full sm:w-1/2 md:w-1/6">
          <label htmlFor="skill-filter" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Programming Language
          </label>
          <div className="relative">
            <select
              id="skill-filter"
              value={selectedSkill}
              onChange={handleSkillChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none"
            >
              <option value="" className="text-gray-400 text-sm">All Languages</option>
              {availableSkills.map((skill) => (
                <option key={skill} value={skill} className="text-gray-900 dark:text-white">
                  {skill}
                </option>
              ))}
            </select>
            {/* Dropdown Arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Project Filter */}
        <div className="w-full sm:w-1/2 md:w-1/6">
          <label htmlFor="project-filter" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Project Experience
          </label>
          <div className="relative">
            <select
              id="project-filter"
              value={selectedProject}
              onChange={handleProjectChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none"
            >
              <option value="" className="text-gray-400 text-sm">All Projects</option>
              {availableProjects.map((project) => (
                <option key={project} value={project} className="text-gray-900 dark:text-white">
                  {project}
                </option>
              ))}
            </select>
            {/* Dropdown Arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedSkill || selectedProject) && (
          <div className="w-full md:w-auto flex items-end">
            <button
              onClick={handleClear}
              className="px-4 py-2.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Status */}
      <div className="text-xs text-gray-400 dark:text-gray-500">
        {selectedSkill || selectedProject ? (
          <span>
            Filtering by: {selectedSkill && <span className="font-medium text-gray-600 dark:text-gray-300">{selectedSkill}</span>}
            {selectedSkill && selectedProject && <span> and </span>}
            {selectedProject && <span className="font-medium text-gray-600 dark:text-gray-300">{selectedProject}</span>}
          </span>
        ) : (
          <span>Select filters to narrow down the engineers list</span>
        )}
      </div>
    </div>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;