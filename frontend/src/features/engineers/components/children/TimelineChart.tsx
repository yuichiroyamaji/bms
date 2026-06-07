"use client";

import React, { useMemo, useState } from "react";
import { Assignment, TimelineMonth, TimelineBar } from "../../types";

interface TimelineChartProps {
  assignments: Assignment[];
  months: TimelineMonth[];
}

export default function TimelineChart({ assignments, months }: TimelineChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Convert assignments to timeline bars
  const timelineBars = useMemo((): TimelineBar[] => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return assignments.map((assignment) => {
      const startDate = new Date(assignment.startDate);
      const endDate = new Date(assignment.endDate);

      // Calculate start and end month positions (0-11 for the 12-month timeline)
      const startMonthDiff = (startDate.getFullYear() - currentYear) * 12 + (startDate.getMonth() - currentMonth);
      const endMonthDiff = (endDate.getFullYear() - currentYear) * 12 + (endDate.getMonth() - currentMonth);

      // Clamp to visible range (0-11)
      const startMonth = Math.max(0, Math.min(11, startMonthDiff));
      const endMonth = Math.max(0, Math.min(11, endMonthDiff));

      // Calculate bar height based on allocation percentage
      const getBarHeight = (allocation: number): number => {
        if (allocation <= 25) return 20;
        if (allocation <= 50) return 35;
        if (allocation <= 75) return 45;
        return 60;
      };

      // Generate color based on project name (consistent colors)
      const getProjectColor = (projectName: string): string => {
        const colors = [
          '#4F46E5', // Indigo
          '#059669', // Emerald
          '#DC2626', // Red
          '#7C3AED', // Violet
          '#EA580C', // Orange
          '#0891B2', // Cyan
          '#BE185D', // Pink
          '#65A30D', // Lime
        ];
        
        let hash = 0;
        for (let i = 0; i < projectName.length; i++) {
          hash = projectName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
      };

      return {
        projectId: assignment.project.id,
        projectName: assignment.project.name,
        startMonth,
        endMonth,
        allocation: assignment.allocation,
        color: getProjectColor(assignment.project.name),
        height: getBarHeight(assignment.allocation)
      };
    }).filter(bar => bar.startMonth <= 11 && bar.endMonth >= 0); // Only show bars that are visible
  }, [assignments]);

  // Group overlapping bars for stacking
  const stackedBars = useMemo(() => {
    const stacks: TimelineBar[][] = [];
    
    timelineBars.forEach(bar => {
      let placed = false;
      
      // Try to place in existing stack
      for (const stack of stacks) {
        const hasOverlap = stack.some(existingBar => 
          !(bar.endMonth < existingBar.startMonth || bar.startMonth > existingBar.endMonth)
        );
        
        if (!hasOverlap) {
          stack.push(bar);
          placed = true;
          break;
        }
      }
      
      // Create new stack if no suitable stack found
      if (!placed) {
        stacks.push([bar]);
      }
    });
    
    return stacks;
  }, [timelineBars]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  if (assignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-16 text-sm text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Available for assignment
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Grid Background */}
      <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/20">
        {months.map((month) => (
          <div
            key={`${month.month}-${month.year}-grid`}
            className={`flex-1 min-w-[100px] h-20 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
              month.isCurrentMonth ? 'bg-blue-50 dark:bg-blue-900/10' : ''
            }`}
          />
        ))}
      </div>

      {/* Timeline Bars */}
      <div className="absolute inset-0 p-1">
        {stackedBars.map((stack, stackIndex) => (
          <div key={stackIndex} className="relative">
            {stack.map((bar, barIndex) => {
              const barWidth = ((bar.endMonth - bar.startMonth + 1) / 12) * 100;
              const barLeft = (bar.startMonth / 12) * 100;
              const barTop = stackIndex * (bar.height + 4) + 4; // 4px spacing between stacks
              
              const assignment = assignments.find(a => a.project.id === bar.projectId);
              
              return (
                <div
                  key={`${bar.projectId}-${barIndex}`}
                  className="absolute rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                  style={{
                    left: `${barLeft}%`,
                    width: `${barWidth}%`,
                    height: `${bar.height}px`,
                    top: `${barTop}px`,
                    backgroundColor: bar.color,
                    opacity: assignment?.status === 'Upcoming' ? 0.6 : 0.9
                  }}
                  onMouseEnter={() => setHoveredBar(bar.projectId)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Project Name and Allocation */}
                  <div className="flex items-center justify-between h-full px-2 text-white text-xs font-medium">
                    <span className="truncate flex-1 mr-1">
                      {bar.projectName}
                    </span>
                    <span className="font-bold">
                      {bar.allocation}%
                    </span>
                  </div>

                  {/* Tooltip */}
                  {hoveredBar === bar.projectId && assignment && (
                    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {assignment.project.name}
                      </div>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Duration:</span> {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                        </div>
                        <div>
                          <span className="font-medium">Allocation:</span> {assignment.allocation}% of time
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                            assignment.status === 'Active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : assignment.status === 'Upcoming'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {assignment.status}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Role:</span> {assignment.project.role}
                        </div>
                        {assignment.project.technologies.length > 0 && (
                          <div>
                            <span className="font-medium">Technologies:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {assignment.project.technologies.slice(0, 4).map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-1 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                              {assignment.project.technologies.length > 4 && (
                                <span className="text-gray-500">+{assignment.project.technologies.length - 4}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}