import React, { useState } from 'react';
import SearchView from './SearchView';
import WorkspaceView from './WorkspaceView';
import { Task, WorkspaceState, SearchParams } from '../types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'workspace'>('search');
  const [tasks, setTasks] = useState<Task[]>([]); // All tasks from API/mock
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    filters: {}
  });
  
  // Initialize workspace with a single empty pane group
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    openTasks: [],
    paneGroups: [{ id: uuidv4(), taskIds: [], activeTaskId: undefined }]
  });
  
  // Add a task to workspace
  const addTaskToWorkspace = (task: Task) => {
    if (workspace.openTasks.includes(task.id)) return; // Already open
    
    // Add to first pane group by default
    const updatedPaneGroups = [...workspace.paneGroups];
    updatedPaneGroups[0].taskIds.push(task.id);
    
    // If no active task in this pane, make this one active
    if (!updatedPaneGroups[0].activeTaskId) {
      updatedPaneGroups[0].activeTaskId = task.id;
    }
    
    setWorkspace({
      openTasks: [...workspace.openTasks, task.id],
      paneGroups: updatedPaneGroups,
      activeTaskId: workspace.activeTaskId || task.id
    });
  };
  
  // Switch between search and workspace views
  const navigateToWorkspace = () => setCurrentView('workspace');
  const navigateToSearch = () => setCurrentView('search');
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>GTD Search App</h1>
        <nav>
          <button 
            onClick={navigateToSearch}
            className={currentView === 'search' ? 'active' : ''}
          >
            Search
          </button>
          <button 
            onClick={navigateToWorkspace}
            className={currentView === 'workspace' ? 'active' : ''}
            disabled={workspace.openTasks.length === 0}
          >
            Workspace {workspace.openTasks.length > 0 && `(${workspace.openTasks.length})`}
          </button>
        </nav>
      </header>
      
      <main>
        {currentView === 'search' ? (
          <SearchView 
            tasks={tasks}
            searchParams={searchParams}
            onSearchChange={setSearchParams}
            onAddToWorkspace={addTaskToWorkspace}
            openTaskIds={workspace.openTasks}
            onNavigateToWorkspace={navigateToWorkspace}
          />
        ) : (
          <WorkspaceView 
            tasks={tasks}
            workspace={workspace}
            setWorkspace={setWorkspace}
            onNavigateToSearch={navigateToSearch}
          />
        )}
      </main>
    </div>
  );
};

export default App;
