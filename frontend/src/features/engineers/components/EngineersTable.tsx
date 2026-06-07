"use client";

import React, { useEffect, useState, useRef } from "react";
import { Engineer } from "../types";
import { loadAllEngineersWithDetails } from "../services/engineersDataService";
import SearchBar, { SearchBarRef } from "./SearchBar";
import EngineerRow from "./children/EngineerRow";

export default function EngineersTable() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [filteredEngineers, setFilteredEngineers] = useState<Engineer[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchBarRef = useRef<SearchBarRef>(null);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setLoading(true);
        const engineersData = await loadAllEngineersWithDetails();
        setEngineers(engineersData);
        setFilteredEngineers(engineersData);

        // Extract unique skills and projects for dropdown options
        const skillsSet = new Set<string>();
        const projectsSet = new Set<string>();

        engineersData.forEach(engineer => {
          // Collect skills
          engineer.skills.forEach(skill => {
            skillsSet.add(skill.language);
          });

          // Collect previous projects
          engineer.previousProjects.forEach(project => {
            projectsSet.add(project.name);
          });

          // Collect current assignment projects
          engineer.currentAssignments.forEach(assignment => {
            projectsSet.add(assignment.project.name);
          });
        });

        setAvailableSkills(Array.from(skillsSet).sort());
        setAvailableProjects(Array.from(projectsSet).sort());
      } catch (err) {
        setError('Failed to load engineers data');
        console.error('Error fetching engineers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEngineers();
  }, []);

  const handleSearch = (filters: { skill?: string; project?: string }) => {
    let filtered = engineers;

    // Filter by skill if selected
    if (filters.skill) {
      filtered = filtered.filter(engineer =>
        engineer.skills.some(skill =>
          skill.language === filters.skill
        )
      );
    }

    // Filter by project if selected
    if (filters.project) {
      filtered = filtered.filter(engineer => {
        const previousProjectMatch = engineer.previousProjects.some(project =>
          project.name === filters.project
        );
        const currentProjectMatch = engineer.currentAssignments.some(assignment =>
          assignment.project.name === filters.project
        );
        return previousProjectMatch || currentProjectMatch;
      });
    }

    setFilteredEngineers(filtered);
  };

  const handleClearSearch = () => {
    setFilteredEngineers(engineers);
    searchBarRef.current?.clear();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading engineers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Engineers
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Find engineers by their programming skills or project experience
          </p>
        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-gray-800/20">
          <SearchBar 
            ref={searchBarRef} 
            onSearch={handleSearch}
            availableSkills={availableSkills}
            availableProjects={availableProjects}
          />
          
          {/* Search Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredEngineers.length === engineers.length ? (
                `Showing all ${engineers.length} engineers`
              ) : (
                `Found ${filteredEngineers.length} of ${engineers.length} engineers`
              )}
            </div>
            {filteredEngineers.length !== engineers.length && (
              <button
                onClick={handleClearSearch}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Engineers Table Section */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Engineers Overview
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Team members with their skills, projects, and current assignments
          </p>
        </div>

        {/* Table Container with Horizontal Scroll */}
        <div className="overflow-x-auto">
          <div className="min-w-[1950px]"> {/* Minimum width to accommodate all 6 columns */}
            {/* Table Header */}
            <div className="grid grid-cols-[150px_80px_180px_200px_180px_1fr] gap-4 border-b border-gray-200 px-6 py-4 bg-gray-50 dark:bg-gray-800/20 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Name
              </div>
              <div className="text-center text-sm font-semibold text-gray-800 dark:text-white/90">
              </div>
              <div className="text-center text-sm font-semibold text-gray-800 dark:text-white/90">
                Rating & Reviews
              </div>
              <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Programming Languages
              </div>
              <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Projects
              </div>
              <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Timeline (12 Months)
              </div>
            </div>

            {/* Table Body */}
            <div className="px-6">
              {filteredEngineers.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                      {engineers.length === 0 ? 'No engineers found' : 'No engineers match your search criteria'}
                    </div>
                    {engineers.length > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Try adjusting your search terms or clear the search to see all engineers
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredEngineers.map((engineer) => (
                    <EngineerRow key={engineer.id} engineer={engineer} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}