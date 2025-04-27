import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';
import PaneGroupComponent from './PaneGroup';
import { Task, WorkspaceState, PaneGroup } from '../types';

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
  const handleMoveTask = (taskId: string, sourcePaneId: string, targetPaneId: string) => {
    console.log(`Moving task ${taskId} from pane ${sourcePaneId} to pane ${targetPaneId}`);
    
    // Create a copy of the workspace state
    const updatedPaneGroups = [...workspace.paneGroups];
    
    // Find source and target pane groups
    const sourceIndex = updatedPaneGroups.findIndex(pg => pg.id === sourcePaneId);
    const targetIndex = updatedPaneGroups.findIndex(pg => pg.id === targetPaneId);
    
    if (sourceIndex === -1 || targetIndex === -1) return;
    
    // Remove task from source pane
    const sourcePane = {...updatedPaneGroups[sourceIndex]};
    const taskIndex = sourcePane.taskIds.indexOf(taskId);
    
    if (taskIndex === -1) return;
    
    sourcePane.taskIds.splice(taskIndex, 1);
    
    // If the removed task was active, update active task
    if (sourcePane.activeTaskId === taskId) {
      sourcePane.activeTaskId = sourcePane.taskIds.length > 0 ? sourcePane.taskIds[0] : undefined;
    }
    
    updatedPaneGroups[sourceIndex] = sourcePane;
    
    // Add task to target pane
    const targetPane = {...updatedPaneGroups[targetIndex]};
    targetPane.taskIds.push(taskId);
    
    // If target pane has no active task, make this one active
    if (!targetPane.activeTaskId) {
      targetPane.activeTaskId = taskId;
    }
    
    updatedPaneGroups[targetIndex] = targetPane;
    
    // Update workspace state
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
              onMoveTask={handleMoveTask}
              onSetActiveTask={setActiveTask}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};



export default WorkspaceView;
