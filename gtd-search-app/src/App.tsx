import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import { useSearch } from './hooks/useSearch';
import { Task } from './types';

const App: React.FC = () => {
  const { results, loading, searchParams, setSearchParams } = useSearch();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const handleSearchChange = (newParams: typeof searchParams) => {
    setSearchParams(newParams);
  };
  
  const handleFilterChange = (newFilters: typeof searchParams.filters) => {
    setSearchParams({
      ...searchParams,
      filters: newFilters
    });
  };
  
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };
  
  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>GTD Task Search</h1>
        <SearchBar 
          searchParams={searchParams} 
          onSearchChange={handleSearchChange} 
        />
      </header>
      
      <main className="app-main">
        <aside className="app-sidebar">
          <FilterPanel 
            searchParams={searchParams} 
            onFilterChange={handleFilterChange} 
          />
        </aside>
        
        <section className="app-content">
          <TaskList 
            tasks={results} 
            loading={loading} 
            onTaskSelect={handleTaskSelect} 
          />
        </section>
        
        {selectedTask && (
          <section className="app-detail-panel">
            <TaskDetail 
              task={selectedTask} 
              onClose={handleCloseTaskDetail} 
            />
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
