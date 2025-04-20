import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import TaskList from './TaskList';
import { Task, SearchParams, SearchFilters } from '../types';
import './SearchView.css';


interface SearchViewProps {
  tasks: Task[];
  searchParams: SearchParams;
  onSearchChange: (params: SearchParams) => void;
  onAddToWorkspace: (task: Task) => void;
  openTaskIds: string[];
  onNavigateToWorkspace: () => void;
}

const SearchView: React.FC<SearchViewProps> = ({
  tasks,
  searchParams,
  onSearchChange,
  onAddToWorkspace,
  openTaskIds,
  onNavigateToWorkspace
}) => {
  const [loading, setLoading] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  
  // Filter tasks based on search params
  useEffect(() => {
    setLoading(true);
    
    // In a real app, this would be an API call
    // For now, we'll simulate filtering the tasks
    const filtered = tasks.filter(task => {
      // Filter by query text
      if (searchParams.query && 
          !task.title.toLowerCase().includes(searchParams.query.toLowerCase()) &&
          !task.content.toLowerCase().includes(searchParams.query.toLowerCase())) {
        return false;
      }
      
      // Filter by status
      if (searchParams.filters.status && searchParams.filters.status.length > 0) {
        if (!searchParams.filters.status.includes(task.status)) {
          return false;
        }
      }
      
      // Add other filters as needed...
      
      return true;
    });
    
    setFilteredTasks(filtered);
    setLoading(false);
  }, [tasks, searchParams]);
  
  const handleFilterChange = (filters: SearchFilters) => {
    onSearchChange({
      ...searchParams,
      filters
    });
  };
  
  return (
    <div className="search-view">
      <div className="search-controls">
        <SearchBar 
          searchParams={searchParams} 
          onSearchChange={onSearchChange} 
        />
        {/* <FilterPanel 
          searchParams={searchParams} 
          onFilterChange={handleFilterChange} 
        /> */}
      </div>
      
      <div className="search-results">
        <div className="results-header">
          <h2>Search Results</h2>
          {openTaskIds.length > 0 && (
            <button onClick={onNavigateToWorkspace}>
              Go to Workspace ({openTaskIds.length})
            </button>
          )}
        </div>
        
        <TaskList 
          tasks={filteredTasks} 
          loading={loading} 
          onTaskSelect={onAddToWorkspace}
          disabledTaskIds={openTaskIds}
        />
      </div>
    </div>
  );
};

export default SearchView;
