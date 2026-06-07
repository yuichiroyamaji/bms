"use client";

import React, { useState } from "react";
import { ProgrammingSkill } from "../../types";

interface SkillsListProps {
  skills: ProgrammingSkill[];
}

export default function SkillsList({ skills }: SkillsListProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Show first 3 skills by default, with option to expand
  const visibleSkills = showAll ? skills : skills.slice(0, 3);
  const hasMoreSkills = skills.length > 3;

  if (skills.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        No skills listed
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-1">
        {visibleSkills.map((skill, index) => (
          <div
            key={`${skill.language}-${index}`}
            className="text-sm text-gray-900 dark:text-white"
          >
            {skill.language} ({skill.experienceYears}y)
          </div>
        ))}
      </div>

      {hasMoreSkills && (
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
              +{skills.length - 3} more
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