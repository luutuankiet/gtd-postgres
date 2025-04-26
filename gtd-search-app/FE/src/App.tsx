import React, { useState } from 'react';
import SearchView from './components/SearchView';
import WorkspaceView from './components/WorkspaceView';
import { Task, WorkspaceState, SearchParams } from './types';
import { tasks as dummyTasks } from './data/dummyData'; // Import the dummy tasks
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import './App.css';  // Make sure this exists
import './workspace.css';  // Make sure this exists
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSearch } from './hooks/useSearch';



const App: React.FC = () => {
  // At the top of your App component
  
  const [currentView, setCurrentView] = useState<'search' | 'workspace'>('search');
  const [tasks, setTasks] = useState<Task[]>(dummyTasks); // Initialize with dummy tasks
  // const [searchParams, setSearchParams] = useState<SearchParams>({
  //   query: '',
  //   filters: {}
  // });
  const { results, loading, error, searchParams, setSearchParams } = useSearch()
  
  console.log('Dummy tasks:', tasks); // This should now show the dummy tasks
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
    <DndProvider backend={HTML5Backend}>
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
              tasks={results}
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
    </DndProvider>
  );
};

export default App;
