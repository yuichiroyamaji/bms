"use client";

import React, { useMemo } from "react";
import { Assignment, TimelineMonth } from "../../types";
import TimelineChart from "./TimelineChart";

interface TimelineColumnProps {
  assignments: Assignment[];
}

export default function TimelineColumn({ assignments }: TimelineColumnProps) {
  // Generate 12 months starting from current month
  const timelineMonths = useMemo((): TimelineMonth[] => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        isCurrentMonth: i === 0
      });
    }
    
    return months;
  }, []);

  return (
    <div className="w-full">
      {/* Timeline Header with Month Labels */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
        {timelineMonths.map((month) => (
          <div
            key={`${month.month}-${month.year}`}
            className={`flex-1 min-w-[100px] text-center ${
              month.isCurrentMonth 
                ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="text-xs font-medium">
              {month.month}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {month.year}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Chart */}
      <div className="relative">
        <TimelineChart 
          assignments={assignments}
          months={timelineMonths}
        />
      </div>

      {/* Assignment Summary */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {assignments.length === 0 ? (
          <span className="text-green-600 dark:text-green-400 font-medium">Available</span>
        ) : (
          <>
            {assignments.filter(a => a.status === 'Active').length} active • 
            {assignments.filter(a => a.status === 'Upcoming').length} upcoming
          </>
        )}
      </div>
    </div>
  );
}