"use client";

import React from "react";
import { Engineer } from "../../types";
import EngineerPhoto from "./EngineerPhoto";
import SkillsListJa from "./SkillsListJa";
import ProjectsListJa from "./ProjectsListJa";
import RatingReviewsJa from "./RatingReviewsJa";
import TimelineColumnJa from "./TimelineColumnJa";

interface EngineerRowProps {
  engineer: Engineer;
}

export default function EngineerRowJa({ engineer }: EngineerRowProps) {
  return (
    <div className="grid grid-cols-[150px_80px_180px_200px_180px_1fr] gap-4 py-4 border-b border-gray-100 last:border-b-0 dark:border-gray-800">
      {/* Name Column */}
      <div className="flex flex-col justify-center">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
          {engineer.name}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {engineer.position}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {engineer.department}
        </p>
      </div>

      {/* Photo Column */}
      <div className="flex justify-center items-center">
        <EngineerPhoto 
          profilePhoto={engineer.profilePhoto}
          name={engineer.name}
        />
      </div>

      {/* Rating & Reviews Column */}
      <div className="flex justify-center items-center relative">
        <RatingReviewsJa 
          rating={engineer.rating}
          engineerName={engineer.name}
        />
      </div>

      {/* Programming Languages Column */}
      <div className="flex items-center">
        <SkillsListJa skills={engineer.skills} />
      </div>

      {/* Projects Column */}
      <div className="flex items-center">
        <ProjectsListJa projects={engineer.previousProjects} />
      </div>

      {/* Timeline Column */}
      <div className="flex items-center">
        <TimelineColumnJa 
          assignments={engineer.currentAssignments}
        />
      </div>
    </div>
  );
}

