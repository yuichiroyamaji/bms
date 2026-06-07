# Implementation Plan

- [ ] 1. Set up project structure and data files
  - Create directory structure for engineers feature module
  - Set up JSON data files with sample engineer data
  - Create TypeScript interfaces and types
  - _Requirements: 1.1, 1.4_

- [x] 1.1 Create engineers feature directory structure
  - Create `features/engineers/` directory with subdirectories: `components/`, `components/children/`, `services/`, `data/`, `assets/`, `assets/img/`, `types/`
  - Set up proper folder organization following project conventions
  - _Requirements: 1.1_

- [x] 1.2 Create sample JSON data files
  - Create `features/engineers/data/engineers.json` with main engineer list
  - Create individual `features/engineers/data/engineer-[id].json` files with detailed data
  - Create `features/engineers/data/projects.json` with shared project definitions
  - Create `features/engineers/data/skills.json` with programming language definitions
  - _Requirements: 1.4, 2.1, 3.1, 4.1_

- [x] 1.3 Generate sample engineer profile photos
  - Create sample profile photos for each engineer in `features/engineers/assets/img/`
  - Use naming convention: `engineer-[id].jpg` (e.g., engineer-1.jpg, engineer-2.jpg)
  - Generate diverse, professional-looking placeholder photos
  - Update engineer JSON data to reference correct photo filenames
  - _Requirements: 1.2_

- [x] 1.4 Define TypeScript interfaces
  - Create `features/engineers/types/index.ts` with Engineer, ProgrammingSkill, Project, Assignment, and TimelineMonth interfaces
  - Export all types for use across the feature
  - _Requirements: 1.2, 2.1, 3.1, 4.1_

- [ ]* 1.5 Write property test for data structure validation
  - **Property 1: Profile photo display consistency**
  - **Validates: Requirements 1.2**

- [ ] 2. Implement data service layer
  - Create data service to load and transform JSON data
  - Implement error handling for missing or invalid data
  - Add data validation and type checking
  - _Requirements: 1.4, 2.1, 3.1, 4.1_

- [x] 2.1 Create engineers data service
  - Implement `features/engineers/services/engineersDataService.ts`
  - Add methods to load engineers, projects, and skills data
  - Handle JSON parsing and data transformation
  - _Requirements: 1.4_

- [ ]* 2.2 Write property test for data fetching
  - **Property 2: Data fetching and display**
  - **Validates: Requirements 1.4**

- [ ] 3. Create main page component
  - Implement Next.js page component at correct route
  - Set up page layout and basic structure
  - Integrate with existing admin layout
  - _Requirements: 1.1, 1.3_

- [x] 3.1 Create engineers page component
  - Create `app/(admin)/(others-pages)/engineers/page.tsx`
  - Implement basic page structure with proper Next.js conventions
  - Add page metadata and breadcrumb integration
  - _Requirements: 1.1_

- [ ]* 3.2 Write unit tests for page component
  - Test page rendering and layout structure
  - Test integration with admin layout
  - _Requirements: 1.1_

- [ ] 4. Implement core table components
  - Create main table component with 5-column layout
  - Implement horizontal scrolling for timeline column
  - Add responsive design and fixed column widths
  - _Requirements: 1.1, 1.3, 4.2, 4.3_

- [x] 4.1 Create main engineers table component
  - Implement `features/engineers/components/EngineersTable.tsx`
  - Set up 5-column table structure with proper widths
  - Add horizontal scrolling for timeline column
  - _Requirements: 1.1, 1.3_

- [x] 4.2 Create engineer row component
  - Implement `features/engineers/components/children/EngineerRow.tsx`
  - Handle data display across all 5 columns
  - Add row-level interactions and state management
  - _Requirements: 1.2, 2.1, 3.1, 4.1_

- [ ]* 4.3 Write property test for table structure
  - **Property 3: Programming skills completeness**
  - **Validates: Requirements 2.1**

- [ ] 5. Implement individual column components
  - Create components for each table column
  - Handle data display and formatting
  - Add interactive features where needed
  - _Requirements: 1.2, 2.1, 2.2, 3.1, 3.2_

- [x] 5.1 Create engineer photo component
  - Implement `features/engineers/components/children/EngineerPhoto.tsx`
  - Handle profile photo display with placeholder fallbacks
  - Ensure consistent 60x60px sizing
  - _Requirements: 1.2_

- [x] 5.2 Create skills list component
  - Implement `features/engineers/components/children/SkillsList.tsx`
  - Display programming languages with experience years as badges
  - Add truncation and expand/collapse for many skills
  - _Requirements: 2.1, 2.2_

- [ ]* 5.3 Write property test for skills display
  - **Property 4: Experience years display**
  - **Validates: Requirements 2.2, 2.4**

- [x] 5.4 Create projects list component
  - Implement `features/engineers/components/children/ProjectsList.tsx`
  - Display previous projects in compact table cell format
  - Add tooltips for full project details and chronological ordering
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 5.5 Write property test for project display
  - **Property 5: Project history completeness**
  - **Validates: Requirements 3.1**

- [ ]* 5.6 Write property test for project information
  - **Property 6: Project information display**
  - **Validates: Requirements 3.2, 3.4**

- [ ]* 5.7 Write property test for project ordering
  - **Property 7: Project chronological ordering**
  - **Validates: Requirements 3.3**

- [ ] 6. Implement timeline components
  - Create timeline column with 12-month display
  - Integrate ApexCharts for Gantt-style visualization
  - Handle overlapping assignments and date ranges
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.1 Create timeline column component
  - Implement `features/engineers/components/children/TimelineColumn.tsx`
  - Set up 12-month headers from current month forward
  - Add horizontal scrolling functionality
  - _Requirements: 4.2, 4.3_

- [x] 6.2 Create timeline chart component
  - Implement `features/engineers/components/children/TimelineChart.tsx`
  - Integrate ApexCharts for interactive timeline bars
  - Handle assignment data and date range visualization
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 6.3 Write property test for assignments display
  - **Property 8: Current assignments display**
  - **Validates: Requirements 4.1**

- [ ]* 6.4 Write property test for timeline rendering
  - **Property 9: Timeline chart rendering**
  - **Validates: Requirements 4.2**

- [ ]* 6.5 Write property test for timeline dates
  - **Property 10: Timeline date visibility**
  - **Validates: Requirements 4.3**

- [ ]* 6.6 Write property test for multiple timelines
  - **Property 11: Multiple timeline handling**
  - **Validates: Requirements 4.4**

- [ ] 7. Implement search functionality
  - Create search bar component for filtering engineers
  - Implement search service for programming languages and projects
  - Add search result highlighting and empty states
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 7.1 Create search bar component
  - Implement `features/engineers/components/SearchBar.tsx`
  - Add search input with real-time filtering
  - Handle search term state management
  - _Requirements: 5.1, 5.6_

- [x] 7.2 Create search service
  - Implement `features/engineers/services/searchService.ts`
  - Add filtering logic for programming languages and project names
  - Implement search result highlighting functionality
  - _Requirements: 5.2, 5.3, 5.4_

- [ ]* 7.3 Write property test for programming language search
  - **Property 12: Search filtering by programming languages**
  - **Validates: Requirements 5.2**

- [ ]* 7.4 Write property test for project name search
  - **Property 13: Search filtering by project names**
  - **Validates: Requirements 5.3**

- [ ]* 7.5 Write property test for search highlighting
  - **Property 14: Search result highlighting**
  - **Validates: Requirements 5.4**

- [ ]* 7.6 Write property test for empty search results
  - **Property 15: Empty search results handling**
  - **Validates: Requirements 5.5**

- [ ]* 7.7 Write property test for search reset
  - **Property 16: Search reset functionality**
  - **Validates: Requirements 5.6**

- [ ] 8. Add error handling and empty states
  - Implement error boundaries and fallback components
  - Add empty state displays for missing data
  - Handle chart rendering errors gracefully
  - _Requirements: 1.5, 2.5, 3.5, 4.5_

- [ ] 8.1 Implement error handling
  - Add error boundaries for component failures
  - Create fallback displays for missing profile photos
  - Handle invalid date ranges in timeline charts
  - _Requirements: 1.5, 2.5, 3.5, 4.5_

- [ ]* 8.2 Write unit tests for error handling
  - Test error boundary behavior
  - Test empty state displays
  - Test fallback mechanisms
  - _Requirements: 1.5, 2.5, 3.5, 4.5_

- [ ] 9. Final integration and testing
  - Wire all components together in the main page
  - Test complete functionality with sample data
  - Verify responsive design and scrolling behavior
  - _Requirements: All_

- [x] 9.1 Complete page integration
  - Connect all components including search functionality in the main engineers page
  - Test data flow from JSON files to UI components with search filtering
  - Verify table layout, scrolling functionality, and search interactions
  - _Requirements: All_

- [ ]* 9.2 Write integration tests
  - Test full page rendering with realistic data sets
  - Test chart library integration
  - Test responsive layout across screen sizes
  - Test search functionality with various filter combinations
  - _Requirements: All_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.