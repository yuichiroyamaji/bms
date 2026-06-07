# Engineers Dashboard Design Document

## Overview

The Engineers Dashboard is a comprehensive React component built with Next.js 15 App Router that displays engineering team information in a structured 6-column table format. The page features a horizontally scrollable timeline showing 12 months from the present month forward, plus a rating and reviews column for performance evaluation. The design leverages the existing TailAdmin template styling and integrates ApexCharts for timeline visualizations within the scrollable timeline column.

## Architecture

The Engineers Dashboard follows a modular architecture with clear separation of concerns:

- **Page Component**: Next.js page component at `app/(admin)/(others-pages)/engineers/page.tsx`
- **Feature Module**: Self-contained engineers feature at `features/engineers/` with all related components and logic
- **Data Layer**: JSON data files stored in `features/engineers/data/` for engineer information
- **UI Components**: Reusable table components optimized for the 6-column layout
- **Chart Integration**: ApexCharts integration for timeline visualizations within the scrollable timeline column

## Components and Interfaces

### Core Components

1. **EngineersPage** (`app/(admin)/(others-pages)/engineers/page.tsx`)
   - Main page component following Next.js App Router conventions
   - Handles page-level layout and data fetching
   - Integrates with existing admin layout

2. **EngineersTable** (`features/engineers/components/EngineersTable.tsx`)
   - Main table component with 6 columns: Name, Photo, Programming Languages, Projects, Rating & Reviews, Timeline
   - Implements horizontal scrolling for the timeline column
   - Responsive table layout with fixed column widths
   - **Parent component called directly from page.tsx**

3. **SearchBar** (`features/engineers/components/SearchBar.tsx`)
   - Search input component for filtering engineers
   - Handles search term input and filtering logic
   - Provides real-time search results

4. **EngineerRow** (`features/engineers/components/children/EngineerRow.tsx`)
   - Individual table row component for each engineer
   - Handles data display across all 6 columns
   - Manages row-level interactions and state

5. **EngineerPhoto** (`features/engineers/components/children/EngineerPhoto.tsx`)
   - Profile photo display component
   - Handles placeholder images for missing photos
   - Consistent sizing and styling

6. **SkillsList** (`features/engineers/components/children/SkillsList.tsx`)
   - Displays programming languages with experience years in table cell
   - Compact badge layout optimized for table display
   - Truncation with expand/collapse for many skills

7. **ProjectsList** (`features/engineers/components/children/ProjectsList.tsx`)
   - Lists previous projects in table cell format
   - Compact display with tooltips for full project details
   - Chronological ordering with visual indicators

8. **RatingReviews** (`features/engineers/components/children/RatingReviews.tsx`)
   - Displays engineer rating with 5-star system
   - Shows review count and average rating
   - Interactive star display with hover states
   - Compact layout optimized for table display

9. **TimelineColumn** (`features/engineers/components/children/TimelineColumn.tsx`)
   - 12-month timeline display with horizontal scrolling
   - Month headers from current month to 12 months forward
   - Container for individual engineer timeline charts

10. **TimelineChart** (`features/engineers/components/children/TimelineChart.tsx`)
   - Individual timeline chart for each engineer's assignments
   - Gantt-style bars with project names displayed on bars
   - Variable bar heights based on allocation percentages
   - ApexCharts integration for interactive timeline visualization
   - Handles overlapping assignments with stacked or layered bars

### Search Services

11. **SearchService** (`features/engineers/services/searchService.ts`)
   - Implements search logic for filtering engineers
   - Handles programming language and project name matching
   - Provides search result highlighting functionality

### Data Services

12. **EngineersDataService** (`features/engineers/services/engineersDataService.ts`)
   - Loads engineer data from JSON files
   - Handles data transformation and validation
   - Provides typed data access methods

### Data Storage

**Data Files Location**: `features/engineers/data/`
- `engineers.json` - Main engineer data with references to individual files
- `engineer-[id].json` - Individual engineer detailed data files
- `projects.json` - Shared project definitions
- `skills.json` - Programming language and skill definitions

**Assets Location**: `features/engineers/assets/`
- `img/` - Engineer profile photos (engineer-[id].jpg format)
- Photo files referenced by filename in engineer data

### Data Models

```typescript
interface Engineer {
  id: string;
  name: string;
  email: string;
  profilePhoto: string;
  position: string;
  department: string;
  skills: ProgrammingSkill[];
  previousProjects: Project[];
  currentAssignments: Assignment[];
  rating: EngineerRating;
}

interface EngineerRating {
  averageRating: number; // 0-5 stars
  totalReviews: number;
  reviews: Review[];
}

interface Review {
  id: string;
  reviewerName: string;
  rating: number; // 1-5 stars
  comment: string;
  date: string;
  projectId?: string; // Optional reference to project
}

interface ProgrammingSkill {
  language: string;
  experienceYears: number;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: Date;
  endDate: Date;
  role: string;
  status: 'Completed' | 'In Progress' | 'On Hold';
}

interface Assignment {
  id: string;
  project: Project;
  startDate: Date;
  endDate: Date;
  allocation: number; // percentage of time allocated
  status: 'Active' | 'Upcoming' | 'Completed';
}

interface TimelineMonth {
  month: string;
  year: number;
  isCurrentMonth: boolean;
}
```

### Table Layout Specifications

**Column Structure:**
1. **Name Column** (150px fixed width)
   - Engineer name and position
   - Left-aligned text
   
2. **Photo Column** (80px fixed width)
   - Profile photo (60x60px)
   - Centered alignment
   
3. **Programming Languages Column** (200px fixed width)
   - Skill badges with experience years
   - Scrollable if content exceeds height
   
4. **Projects Column** (250px fixed width)
   - Previous project list
   - Expandable/collapsible for details

5. **Rating & Reviews Column** (180px fixed width)
   - 5-star rating display
   - Average rating score (e.g., 4.2/5)
   - Total review count (e.g., "12 reviews")
   - Interactive star visualization
   
6. **Timeline Column** (1200px+ width, horizontally scrollable)
   - 12 month sub-columns (100px each)
   - Gantt-style assignment bars with project names
   - Bar heights proportional to allocation percentages (10%-100% allocation)
   - Occupied percentage displayed on each bar
   - Horizontal scroll bar for navigation
   - Stacked bars for overlapping project assignments

### Rating & Reviews Specifications

**Rating Display Design:**
- **Star Rating**: 5-star system with filled/empty stars
- **Average Score**: Numerical display (e.g., "4.2/5")
- **Review Count**: Total reviews (e.g., "12 reviews")
- **Star Colors**: 
  - Filled stars: Gold/yellow (#FCD34D)
  - Empty stars: Light gray (#E5E7EB)
  - Hover states: Slightly darker gold
- **Layout**: Compact vertical stack optimized for table cell
- **Interactive Elements**: 
  - Hover over stars shows individual ratings
  - Click to expand review details (optional tooltip/modal)
- **Rating Ranges**:
  - 4.5-5.0: Excellent (green accent)
  - 3.5-4.4: Good (blue accent)  
  - 2.5-3.4: Average (yellow accent)
  - 1.5-2.4: Below Average (orange accent)
  - 0.0-1.4: Poor (red accent)

### Timeline Visualization Specifications

**Timeline Bar Design:**
- **Bar Width**: Spans across months based on project duration
- **Bar Height**: Variable height (20px-60px) proportional to allocation percentage
  - 10-25% allocation: 20px height
  - 26-50% allocation: 35px height  
  - 51-75% allocation: 45px height
  - 76-100% allocation: 60px height
- **Bar Content**: Project name displayed as text overlay on bar
- **Percentage Display**: Allocation percentage shown on bar (e.g., "75%")
- **Bar Colors**: Different colors for different projects with opacity based on allocation
- **Stacking**: Multiple assignments stack vertically within the same time period
- **Hover States**: Tooltip showing full project details and exact dates

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property 1: Profile photo display consistency**
*For any* engineer with profile photo data, the rendered component should display the profile photo element prominently
**Validates: Requirements 1.2**

**Property 2: Data fetching and display**
*For any* page load, the dashboard should call the data service and render the returned engineer data
**Validates: Requirements 1.4**

**Property 3: Programming skills completeness**
*For any* engineer with programming skills, all skills in the data should appear in the rendered output
**Validates: Requirements 2.1**

**Property 4: Experience years display**
*For any* programming skill with experience data, the years of experience should be displayed as numerical values
**Validates: Requirements 2.2, 2.4**

**Property 5: Project history completeness**
*For any* engineer with previous projects, all projects should be displayed in the rendered output
**Validates: Requirements 3.1**

**Property 6: Project information display**
*For any* project with data, the project name and relevant details should appear in the rendered component
**Validates: Requirements 3.2, 3.4**

**Property 7: Project chronological ordering**
*For any* list of projects, they should be ordered chronologically by date (most recent first)
**Validates: Requirements 3.3**

**Property 8: Current assignments display**
*For any* engineer with active assignments, all assignments should be displayed in the rendered timeline output
**Validates: Requirements 4.1**

**Property 9: Timeline bar span accuracy**
*For any* assignment, the timeline bar should span exactly from the start month to the end month
**Validates: Requirements 4.2**

**Property 10: Project name visibility on bars**
*For any* timeline bar, the project name should be displayed directly on the bar element
**Validates: Requirements 4.3**

**Property 11: Allocation percentage display**
*For any* timeline bar, the occupied percentage should be visible on the bar
**Validates: Requirements 4.4**

**Property 12: Bar height proportionality**
*For any* timeline bar, the height should be proportional to the allocation percentage
**Validates: Requirements 4.5**

**Property 13: Multiple assignment handling**
*For any* engineer with overlapping assignments, timeline bars should be stacked or layered appropriately
**Validates: Requirements 4.6**

**Property 12: Search filtering by programming languages**
*For any* search term matching a programming language, the filtered results should only include engineers who have that skill
**Validates: Requirements 5.2**

**Property 13: Search filtering by project names**
*For any* search term matching a project name, the filtered results should only include engineers who have worked on projects containing that term
**Validates: Requirements 5.3**

**Property 14: Search result highlighting**
*For any* search results, matching criteria should be visually highlighted in the displayed engineer information
**Validates: Requirements 5.4**

**Property 15: Empty search results handling**
*For any* search term that matches no engineers, an appropriate "no results found" message should be displayed
**Validates: Requirements 5.5**

**Property 16: Search reset functionality**
*For any* cleared search field, all engineers should be displayed again in the original table format
**Validates: Requirements 5.6**

## Error Handling

The Engineers Dashboard implements comprehensive error handling:

1. **Data Fetching Errors**: Graceful fallback to empty state with error message
2. **Missing Profile Photos**: Default avatar placeholder for engineers without photos
3. **Invalid Date Ranges**: Timeline charts handle invalid or missing dates with appropriate fallbacks
4. **Empty Data States**: Clear messaging for engineers with no skills, projects, or assignments
5. **Chart Rendering Errors**: Fallback to simple text display if ApexCharts fails to render

## Testing Strategy

The Engineers Dashboard uses a dual testing approach combining unit tests and property-based tests:

### Unit Testing
- Component rendering with mock data
- User interaction handling (expand/collapse, hover states)
- Error boundary behavior
- Empty state displays
- Chart integration points

### Property-Based Testing
- Uses **fast-check** library for TypeScript property-based testing
- Each property-based test runs a minimum of 100 iterations
- Tests verify universal properties across randomly generated engineer data
- Each test is tagged with the format: **Feature: engineers-dashboard, Property {number}: {property_text}**

**Property-based test requirements:**
- Generate random engineer data with varying skills, projects, and assignments
- Test rendering consistency across different data combinations
- Verify timeline chart behavior with overlapping date ranges
- Validate empty state handling with edge case data
- Each correctness property maps to exactly one property-based test

### Integration Testing
- Full page rendering with realistic data sets
- Chart library integration testing
- Responsive layout verification across screen sizes
- Performance testing with large engineer datasets