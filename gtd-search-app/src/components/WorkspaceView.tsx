import React from 'react';
import { Task, WorkspaceState, PaneGroup } from '../types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

interface WorkspaceViewProps {
  tasks: Task[];
  workspace: WorkspaceState;
  setWorkspace: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  onNavigateToSearch: () => void;
}

const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  tasks,
  workspace,
  setWorkspace,
  onNavigateToSearch
}) => {
  // Get task by ID
  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id) || null;
  };
  
  // Close a task from the workspace
  const closeTask = (taskId: string) => {
    // Remove from openTasks
    const updatedOpenTasks = workspace.openTasks.filter(id => id !== taskId);
    
    // Remove from all pane groups
    const updatedPaneGroups = workspace.paneGroups.map(group => {
      const updatedTaskIds = group.taskIds.filter(id => id !== taskId);
      let updatedActiveTaskId = group.activeTaskId;
      
      // If we're closing the active task, select another one
      if (group.activeTaskId === taskId) {
        updatedActiveTaskId = updatedTaskIds.length > 0 ? updatedTaskIds[0] : undefined;
      }
      
      return {
        ...group,
        taskIds: updatedTaskIds,
        activeTaskId: updatedActiveTaskId
      };
    });
    
    // Remove empty pane groups, but always keep at least one
    let filteredPaneGroups = updatedPaneGroups.filter(group => group.taskIds.length > 0);
    if (filteredPaneGroups.length === 0) {
      filteredPaneGroups = [{ id: updatedPaneGroups[0].id, taskIds: [], activeTaskId: undefined }];
    }
    
    // Update workspace
    setWorkspace({
      openTasks: updatedOpenTasks,
      paneGroups: filteredPaneGroups,
      activeTaskId: updatedOpenTasks.length > 0 ? 
        (workspace.activeTaskId !== taskId ? workspace.activeTaskId : updatedOpenTasks[0]) : 
        undefined
    });
  };
  
  // Create a new pane group
  const createPaneGroup = () => {
    setWorkspace({
      ...workspace,
      paneGroups: [...workspace.paneGroups, { id: uuidv4(), taskIds: [], activeTaskId: undefined }]
    });
  };
  
  // Move a task from one pane group to another
  const moveTaskToPane = (taskId: string, sourcePaneId: string, targetPaneId: string) => {
    const updatedPaneGroups = workspace.paneGroups.map(group => {
      if (group.id === sourcePaneId) {
        // Remove from source pane
        return {
          ...group,
          taskIds: group.taskIds.filter(id => id !== taskId),
          activeTaskId: group.activeTaskId === taskId ? 
            (group.taskIds.length > 1 ? group.taskIds.find(id => id !== taskId) : undefined) : 
            group.activeTaskId
        };
      } else if (group.id === targetPaneId) {
        // Add to target pane
        return {
          ...group,
          taskIds: [...group.taskIds, taskId],
          activeTaskId: group.activeTaskId || taskId
        };
      }
      return group;
    });
    
    setWorkspace({
      ...workspace,
      paneGroups: updatedPaneGroups
    });
  };
  
  // Set active task in a pane group
  const setActiveTask = (taskId: string, paneId: string) => {
    const updatedPaneGroups = workspace.paneGroups.map(group => {
      if (group.id === paneId) {
        return {
          ...group,
          activeTaskId: taskId
        };
      }
      return group;
    });
    
    setWorkspace({
      ...workspace,
      paneGroups: updatedPaneGroups,
      activeTaskId: taskId
    });
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="workspace-view">
        <div className="workspace-header">
          <h2>Workspace</h2>
          <button onClick={onNavigateToSearch}>Back to Search</button>
          <button onClick={createPaneGroup}>Add Pane Group</button>
        </div>
        
        <div className="pane-container">
          {workspace.paneGroups.map(paneGroup => (
            <PaneGroupComponent
              key={paneGroup.id}
              paneGroup={paneGroup}
              tasks={tasks}
              getTaskById={getTaskById}
              onCloseTask={closeTask}
              onMoveTask={moveTaskToPane}
              onSetActiveTask={setActiveTask}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

// PaneGroup component to render a single pane with tabs
interface PaneGroupComponentProps {
  paneGroup: PaneGroup;
  tasks: Task[];
  getTaskById: (id: string) => Task | null;
  onCloseTask: (taskId: string) => void;
  onMoveTask: (taskId: string, sourcePaneId: string, targetPaneId: string) => void;
  onSetActiveTask: (taskId: string, paneId: string) => void;
}

const PaneGroupComponent: React.FC<PaneGroupComponentProps> = ({
  paneGroup,
  tasks,
  getTaskById,
  onCloseTask,
  onMoveTask,
  onSetActiveTask
}) => {
  return (
    <div className="pane-group">
      <div className="pane-tabs">
        {paneGroup.taskIds.map(taskId => {
          const task = getTaskById(taskId);
          if (!task) return null;
          
          return (
            <div 
              key={taskId}
              className={`pane-tab ${paneGroup.activeTaskId === taskId ? 'active' : ''}`}
              onClick={() => onSetActiveTask(taskId, paneGroup.id)}
              // This would need proper drag-and-drop implementation
              draggable
            >
              <span>{task.title}</span>
              <button 
                className="close-tab"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTask(taskId);
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="pane-content">
        {paneGroup.activeTaskId ? (
          <TaskDetail 
            task={getTaskById(paneGroup.activeTaskId)} 
            onClose={() => onCloseTask(paneGroup.activeTaskId!)}
          />
        ) : (
          <div className="empty-pane">
            <p>No tasks open in this pane.</p>
            <p>Drag tasks here from other panes or add from search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceView;
