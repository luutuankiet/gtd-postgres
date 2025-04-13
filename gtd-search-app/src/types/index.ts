export interface Task {
    id: string;
    title: string;
    content: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate: string | null;
    folder: string;
    list: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface SearchFilters {
    status?: string[];
    priority?: string[];
    folder?: string;
    list?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
  }
  
  export interface SearchParams {
    query: string;
    filters: SearchFilters;
  }
  


export interface WorkspaceState {
  openTasks: string[]; // Array of task IDs that are open
  paneGroups: PaneGroup[];
  activeTaskId?: string;
}

export interface PaneGroup {
  id: string;
  taskIds: string[]; // Tasks open in this pane group
  activeTaskId?: string; // Currently active task in this pane
  size?: number; // For resizable panes (percentage or pixels)
}

export interface SearchParams {
  query: string;
  filters: SearchFilters;
}
