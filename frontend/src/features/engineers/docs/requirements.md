# Requirements Document

## Introduction

The Engineers Dashboard is a comprehensive page within the admin dashboard that displays detailed information about engineering team members. The page provides a centralized view of engineers' profiles, technical skills, project experience, and current assignments with visual timeline representations.

## Glossary

- **Engineer**: A software development professional with technical skills and project experience
- **Programming Language**: A technical skill with associated years of experience
- **Project**: A software development initiative with defined scope and timeline
- **Timeline Chart**: A visual representation showing project duration and scheduling with Gantt-style bars
- **Assignment Percentage**: The percentage of an engineer's time allocated to a specific project
- **Timeline Bar**: A visual bar element showing project duration with height proportional to allocation percentage
- **Experience Years**: The number of years an engineer has worked with a specific technology
- **Assignment**: The allocation of an engineer to a specific project with defined timeline
- **Dashboard**: The main administrative interface displaying engineer information
- **Search**: A filtering mechanism to find engineers based on specific criteria

## Requirements

### Requirement 1

**User Story:** As an admin user, I want to view a comprehensive list of all engineers, so that I can quickly assess team composition and capabilities.

#### Acceptance Criteria

1. WHEN the user navigates to the engineers page, THE Dashboard SHALL display all engineers in a structured list format
2. WHEN displaying engineer information, THE Dashboard SHALL show each engineer's profile photo prominently
3. WHEN rendering the engineers list, THE Dashboard SHALL organize information in a scannable layout
4. WHEN the page loads, THE Dashboard SHALL retrieve and display current engineer data
5. WHERE no engineers exist in the system, THE Dashboard SHALL display an appropriate empty state message

### Requirement 2

**User Story:** As an admin user, I want to see each engineer's programming language skills with experience levels, so that I can understand their technical capabilities for project assignments.

#### Acceptance Criteria

1. WHEN displaying an engineer's profile, THE Dashboard SHALL list all programming languages they know
2. WHEN showing programming languages, THE Dashboard SHALL display the years of experience for each language
3. WHEN rendering technical skills, THE Dashboard SHALL organize languages in a clear, readable format
4. WHEN experience data is available, THE Dashboard SHALL show numerical years of experience
5. WHERE an engineer has no programming languages listed, THE Dashboard SHALL indicate this clearly

### Requirement 3

**User Story:** As an admin user, I want to view each engineer's previous project experience, so that I can understand their background and expertise areas.

#### Acceptance Criteria

1. WHEN displaying engineer information, THE Dashboard SHALL show a list of projects they have worked on previously
2. WHEN showing project experience, THE Dashboard SHALL include project names and relevant details
3. WHEN rendering project history, THE Dashboard SHALL organize projects in a chronological or logical order
4. WHEN project data exists, THE Dashboard SHALL display complete project information
5. WHERE an engineer has no previous projects, THE Dashboard SHALL show an appropriate message

### Requirement 4

**User Story:** As an admin user, I want to see current project assignments with detailed timeline visualizations, so that I can track workload distribution, project schedules, and allocation percentages.

#### Acceptance Criteria

1. WHEN displaying current assignments, THE Dashboard SHALL show active projects for each engineer in a timeline format
2. WHEN showing assigned projects, THE Dashboard SHALL display timeline bars spanning from start month to end month
3. WHEN rendering timeline bars, THE Dashboard SHALL show the project name directly on each bar
4. WHEN displaying assignment allocation, THE Dashboard SHALL show the occupied percentage on each timeline bar
5. WHEN rendering timeline bars, THE Dashboard SHALL vary the bar height proportionally to the allocation percentage
6. WHEN multiple projects are assigned, THE Dashboard SHALL stack or layer timeline bars to show overlapping assignments
7. WHERE an engineer has no current assignments, THE Dashboard SHALL indicate their availability status in the timeline
### Require
ment 5

**User Story:** As an admin user, I want to search for engineers by their programming skills and project experience, so that I can quickly find team members with specific qualifications for project assignments.

#### Acceptance Criteria

1. WHEN the user enters a search term, THE Dashboard SHALL filter engineers based on programming languages and project names
2. WHEN searching for programming languages, THE Dashboard SHALL return engineers who have experience with the specified technology
3. WHEN searching for project names, THE Dashboard SHALL return engineers who have worked on projects containing the search term
4. WHEN displaying search results, THE Dashboard SHALL highlight matching criteria in the filtered results
5. WHEN no engineers match the search criteria, THE Dashboard SHALL display an appropriate "no results found" message
6. WHEN the search field is cleared, THE Dashboard SHALL display all engineers again
7. WHEN performing a search, THE Dashboard SHALL maintain the table layout and functionality for filtered results