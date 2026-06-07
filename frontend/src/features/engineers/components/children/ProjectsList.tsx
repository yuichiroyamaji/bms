"use client";

import React, { useState } from "react";
import { Project } from "../../types";

interface ProjectsListProps {
  projects: Project[];
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const [showAll, setShowAll] = useState(false);

  // Sort projects by end date (most recent first)
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  );

  // Show first 2 projects by default, with option to expand
  const visibleProjects = showAll ? sortedProjects : sortedProjects.slice(0, 2);
  const hasMoreProjects = sortedProjects.length > 2;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  if (projects.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        No previous projects
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-1">
        {visibleProjects.map((project) => (
          <div
            key={project.id}
            className="text-sm text-gray-900 dark:text-white"
          >
            <div>{project.name}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ({formatDate(project.startDate)} - {formatDate(project.endDate)})
            </div>
          </div>
        ))}
      </div>

      {hasMoreProjects && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          {showAll ? (
            <>
              Show less
              <svg className="inline w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              +{sortedProjects.length - 2} more projects
              <svg className="inline w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}