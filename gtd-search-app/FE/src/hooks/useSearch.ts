import { useState, useEffect } from 'react';
import { Task, SearchParams } from '../types';
import { searchTasks } from '../api/taskService';

export const useSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    filters: {}
  });
  const [results, setResults] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Create a controller to cancel the request if needed
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    
    // Add debounce to avoid too many requests
    const timeoutId = setTimeout(() => {
      searchTasks(searchParams, controller.signal)
        .then(tasks => {
          setResults(tasks);
          setLoading(false);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setError(err);
            setLoading(false);
          }
        });
    }, 300); // Debounce search for better performance
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchParams]);
  
  return {
    results,
    loading,
    error,
    searchParams,
    setSearchParams
  };
};
