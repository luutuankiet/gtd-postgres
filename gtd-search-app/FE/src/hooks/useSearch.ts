import { useState, useEffect } from 'react';
import { Task, SearchParams } from '../types';
import { tasks } from '../data/dummyData';

export const useSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    filters: {}
  });
  const [results, setResults] = useState<Task[]>(tasks);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate API call delay
    setLoading(true);
    
    const timeoutId = setTimeout(() => {
      const filteredTasks = tasks.filter(task => {
        // Text search
        if (searchParams.query && !taskMatchesQuery(task, searchParams.query)) {
          return false;
        }
        
        // Status filter
        if (
          searchParams.filters.status && 
          searchParams.filters.status.length > 0 && 
          !searchParams.filters.status.includes(task.status)
        ) {
          return false;
        }
        
        // Priority filter
        if (
          searchParams.filters.priority && 
          searchParams.filters.priority.length > 0 && 
          !searchParams.filters.priority.includes(task.priority)
        ) {
          return false;
        }
        
        // Folder filter
        if (
          searchParams.filters.folder && 
          task.folder !== searchParams.filters.folder
        ) {
          return false;
        }
        
        // List filter
        if (
          searchParams.filters.list && 
          task.list !== searchParams.filters.list
        ) {
          return false;
        }
        
        // Tags filter (any match)
        if (
          searchParams.filters.tags && 
          searchParams.filters.tags.length > 0 && 
          !task.tags.some(tag => searchParams.filters.tags?.includes(tag))
        ) {
          return false;
        }
        
        // Date range filter
        if (searchParams.filters.dateFrom && task.dueDate) {
          if (new Date(task.dueDate) < new Date(searchParams.filters.dateFrom)) {
            return false;
          }
        }
        
        if (searchParams.filters.dateTo && task.dueDate) {
          if (new Date(task.dueDate) > new Date(searchParams.filters.dateTo)) {
            return false;
          }
        }
        
        return true;
      });
      
      setResults(filteredTasks);
      setLoading(false);
    }, 300); // Debounce search for better performance
    
    return () => clearTimeout(timeoutId);
  }, [searchParams]);
  
  // Helper function to check if task matches the search query
  const taskMatchesQuery = (task: Task, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    return (
      task.title.toLowerCase().includes(lowerQuery) ||
      task.content.toLowerCase().includes(lowerQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };
  
  return {
    results,
    loading,
    searchParams,
    setSearchParams
  };
};
