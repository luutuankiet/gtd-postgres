import { Task, SearchParams } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Interface to match the backend API parameters
export interface ApiSearchParams {
  query?: string;
  list_name?: string;
  folder_name?: string;
  status?: string;
  due_date_start?: string;
  due_date_end?: string;
  completed?: boolean;
  page: number;
  page_size: number;
}

// Convert frontend search params to API format
export const convertSearchParams = (params: SearchParams): ApiSearchParams => {
  const apiParams: ApiSearchParams = {
    page: 1,
    page_size: 20,
  };
  
  if (params.query) {
    apiParams.query = params.query;
  }
  
  if (params.filters.folder) {
    apiParams.folder_name = params.filters.folder;
  }
  
  if (params.filters.list) {
    apiParams.list_name = params.filters.list;
  }
  
  if (params.filters.status && params.filters.status.length === 1) {
    apiParams.status = params.filters.status[0];
  }
  
  if (params.filters.dateFrom) {
    apiParams.due_date_start = params.filters.dateFrom;
  }
  
  if (params.filters.dateTo) {
    apiParams.due_date_end = params.filters.dateTo;
  }
  
  return apiParams;
};

// Convert API response to frontend Task format
export const convertApiTaskToTask = (apiTask: any): Task => {
  return {
    id: apiTask.todo_id,
    title: apiTask.todo_title,
    content: apiTask.todo_content,
    status: apiTask.todo_status,
    priority: apiTask.todo_priority || 'medium',
    dueDate: apiTask.todo_due_date,
    folder: apiTask.todo_folder_name,
    list: apiTask.todo_list_name,
    tags: apiTask.todo_tags || [],
    createdAt: apiTask.todo_created_at,
    updatedAt: apiTask.todo_updated_at,
  };
};

// Search tasks API function
export const searchTasks = async (params: SearchParams, signal?: AbortSignal): Promise<Task[]> => {
  const apiParams = convertSearchParams(params);
  
  // Convert params object to URL search params
  const queryParams = new URLSearchParams();
  Object.entries(apiParams).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/todos/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal
    });
        if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map(convertApiTaskToTask);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      // Request was cancelled, just rethrow
      throw error;
    }
    console.error('Error searching tasks:', error);
    throw error;
  }
};